// ---------------------------------------------------------------------------
// Family Planer integration bridge
// Feeds the dashboard UI from the integration (websocket "family_planer/subscribe")
// and turns UI writes into family_planer/* commands. Cards:
//   type: custom:family-planer-card      view: week | plan | lists   (entry_id, language optional)
//   type: custom:family-planer-nav-card
// ---------------------------------------------------------------------------
(() => {
  const VIRT = { plan: 'family_planer.plan', heute: 'family_planer.heute', verlauf: 'family_planer.verlauf', settings: 'family_planer.settings', script: 'family_planer.rollover' };
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const IMAGE = (i) => (/^(av:[a-z0-9.+]{1,80}|av2:[a-z0-9.]{1,200}|svg:[a-z-]{1,30}|img:\/family_planer_files\/avatars\/[a-z0-9_]{1,120}\.(jpg|png|webp))$/.test(i || '') ? i : '');
  const isVirt = (e) => typeof e === 'string' && e.startsWith('family_planer.');
  const enc = (o) => 'fp1:' + JSON.stringify(o);
  const dec = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };

  class Store {
    constructor(conn, entryId) {
      this.conn = conn; this.entryId = entryId; this.snap = null; this.err = null; this.subs = new Set();
      this._subscribe(0);
    }
    // the integration reloads after some settings changes: subscribe again until it is back
    _subscribe(tries) {
      const msg = { type: 'family_planer/subscribe' }; if (this.entryId) msg.entry_id = this.entryId;
      this.unsub = this.conn.subscribeMessage((s) => {
        if (s && s.reload) { this._resubscribe(); return; }
        this.snap = s; this.err = null; this.subs.forEach((f) => f());
        if (window.FPCONFETTI) window.FPCONFETTI.check(this);
      }, msg).catch((e) => {
        if (tries > 0 && tries < 30) { setTimeout(() => this._subscribe(tries + 1), 2000); return; }
        this.err = (e && e.message) || String(e); this.subs.forEach((f) => f());
      });
    }
    _resubscribe() {
      const old = this.unsub; this.unsub = null;
      Promise.resolve(old).then((u) => { if (typeof u === 'function') u(); }).catch(() => {});
      setTimeout(() => this._subscribe(1), 1500);
    }
    static get(conn, entryId) {
      const reg = Store._reg || (Store._reg = new Map());
      const k = entryId || '';
      let s = reg.get(k);
      if (!s || s.conn !== conn) { s = new Store(conn, entryId); reg.set(k, s); }
      return s;
    }
    listen(f) { this.subs.add(f); if (this.snap || this.err) setTimeout(f, 0); return () => this.subs.delete(f); }
    ws(type, data) { const m = { type, ...data }; if (this.entryId) m.entry_id = this.entryId; return this.conn.sendMessagePromise(m); }
    // changes need the parent PIN since 0.9.0 (asks once, then a 10-minute unlock)
    pws(type, data) {
      const lang = String((this.snap && this.snap.settings && this.snap.settings.language) || document.documentElement.lang || 'de').startsWith('en') ? 'en' : 'de';
      return window.FPPIN ? window.FPPIN.call(this, type, data, { lang, host: document.querySelector('home-assistant') || document.body }) : this.ws(type, data);
    }
    person(id) { return ((this.snap && this.snap.persons) || []).find((p) => p.id === id); }
    personByName(n) { return ((this.snap && this.snap.persons) || []).find((p) => p.name === n); }

    // ---------- snapshot -> legacy todo items
    items(kind) {
      const s = this.snap; if (!s) return [];
      const name = (pid) => (this.person(pid) || {}).name || pid;
      if (kind === 'plan') return s.chores.filter((c) => !c.schedule).map((c) => ({ uid: c.id, summary: c.title, status: 'needs_action', description: enc({ ...this.toLegacy(c.assign), ...(typeof c.points === 'number' ? { p: c.points } : {}) }) }));
      if (kind === 'heute') return s.items.map((i) => ({ uid: i.id, summary: i.title, status: i.done ? 'completed' : 'needs_action', description: enc({ k: name(i.person_id), d: i.start, e: i.due, c: i.chore_id }) }));
      if (kind === 'verlauf') return Object.entries(s.history).map(([day, per]) => ({ uid: day, summary: day, status: 'completed',
        description: enc({ s: Object.entries(per).map(([pid, r]) => [name(pid), r.done, r.total]), x: Object.entries(per).flatMap(([pid, r]) => (r.missed || []).map((t) => [name(pid), t])) }) }));
      if (kind === 'settings') return [{ uid: 'personen', summary: 'Personen', status: 'needs_action',
        description: enc({ p: Object.fromEntries(s.persons.map((p) => [p.name, { farbe: COLOR(p.color), bild: IMAGE(p.image), alias: p.aliases || [] }])) }) }];
      return [];
    }
    toLegacy(assign) {
      const z = {}, r = {}, f = {};
      for (const [pid, days] of Object.entries(assign || {})) {
        const n = (this.person(pid) || {}).name; if (!n) continue;
        z[n] = Object.keys(days).map(Number).sort((a, b) => a - b);
        for (const [d, rule] of Object.entries(days)) {
          if (rule.every > 1) r[`${n}|${d}`] = [rule.every, rule.offset || 0];
          if (rule.window > 1) f[`${n}|${d}`] = rule.window;
        }
      }
      const o = { z }; if (Object.keys(r).length) o.r = r; if (Object.keys(f).length) o.f = f; return o;
    }
    fromLegacy(m) {
      const assign = {}; const z = (m && m.z) || (m && m.k ? { [m.k]: m.t || [] } : {});
      for (const [n, days] of Object.entries(z)) {
        const p = this.personByName(n); if (!p) continue;
        const a = assign[p.id] = {};
        for (const d of days) {
          const rr = (m.r || {})[`${n}|${d}`]; const every = rr && rr[0] > 1 ? rr[0] : 1;
          a[String(d)] = { every, offset: every > 1 ? ((rr[1] % every) + every) % every : 0, window: Math.max(1, Math.min(14, (m.f || {})[`${n}|${d}`] || 1)) };
        }
      }
      return assign;
    }

    // ---------- legacy writes -> integration commands
    async todo(kind, service, data) {
      if (kind === 'heute' && service === 'update_item') return this.ws('family_planer/item/set', { item_id: data.item, done: data.status === 'completed' });
      if (kind === 'plan') {
        if (service === 'add_item') return this.pws('family_planer/chore/save', { title: data.item, assign: this.fromLegacy(dec(data.description)) });
        if (service === 'update_item') {
          const c = this.snap.chores.find((x) => x.id === data.item); if (!c) throw new Error('Ämtli nicht gefunden');
          const msg = { chore_id: c.id, title: data.rename || c.title, assign: data.description ? this.fromLegacy(dec(data.description)) : c.assign };
          const pts = 'points' in data ? data.points : c.points;
          if (typeof pts === 'number') msg.points = pts;
          return this.pws('family_planer/chore/save', msg);
        }
        if (service === 'remove_item') return [].concat(data.item).reduce((pr, id) => pr.then(() => this.pws('family_planer/chore/delete', { chore_id: id })), Promise.resolve());
      }
      if (kind === 'settings' && (service === 'add_item' || service === 'update_item')) {
        const p = dec(data.description).p || {};
        return Promise.all(Object.entries(p).map(([n, o]) => {
          const per = this.personByName(n); if (!per) return null;
          const patch = { person_id: per.id };
          if (/^#[0-9A-Fa-f]{6}$/.test(o.farbe || '')) patch.color = o.farbe;
          if (typeof o.bild === 'string') patch.image = o.bild;
          if (Array.isArray(o.alias)) patch.aliases = o.alias;
          return Object.keys(patch).every((k) => k === 'person_id' || k === 'image') ? this.ws('family_planer/person/update', patch) : this.pws('family_planer/person/update', patch);
        }));
      }
      return null;
    }
  }

  // hass object handed to the inner UI: real hass + virtual todo entities
  const wrapHass = (hass, store) => {
    const real = hass.connection;
    const conn = Object.create(real, {
      subscribeMessage: { value: (cb, msg) => {
        if (msg && msg.type === 'todo/item/subscribe' && isVirt(msg.entity_id)) {
          const kind = Object.keys(VIRT).find((k) => VIRT[k] === msg.entity_id);
          const off = store.listen(() => { if (store.err) return; cb({ items: store.items(kind) }); });
          return store.err ? Promise.reject(new Error(store.err)) : Promise.resolve(off);
        }
        return real.subscribeMessage(cb, msg);
      } },
    });
    return Object.create(hass, {
      connection: { value: conn },
      fpUpload: { value: (name, data) => { const p = store.personByName(name); if (!p) return Promise.reject(new Error(name)); return store.ws('family_planer/person/upload_image', { person_id: p.id, data }); } },
      callService: { value: (domain, service, data, target) => {
        const ent = target && target.entity_id;
        if (domain === 'todo' && isVirt(ent)) return store.todo(Object.keys(VIRT).find((k) => VIRT[k] === ent), service, data || {});
        if (domain === 'script' && ent === VIRT.script) return store.ws('family_planer/rollover', {});
        return hass.callService(domain, service, data, target);
      } },
    });
  };

  // card option `language` > integration setting (Design & sidebar) > profile / HA language
  const LANG = (hass, cfg, store) => {
    const fixed = store && store.snap && store.snap.settings && store.snap.settings.language;
    const l = String((cfg && cfg.language) || (fixed === 'de' || fixed === 'en' ? fixed : '') ||
      (hass && ((hass.locale && hass.locale.language) || hass.language)) || 'de').toLowerCase();
    return l.startsWith('de') || l.startsWith('gsw') ? 'de' : 'en';
  };
  const INNER = { week: 'fp-week-inner', plan: 'fp-plan-inner', lists: 'fp-lists-inner', rewards: 'fp-rewards-inner', settings: 'fp-settings-inner' };
  const STORE_VIEWS = ['lists', 'rewards', 'settings'];
  const tag = (view, lang) => (!STORE_VIEWS.includes(view) && lang === 'en' ? INNER[view] + '-en' : INNER[view]);
  // designs: CSS variables read by every card (inherited through the shadow roots)
  const SYS = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const STARS = 'radial-gradient(1.2px 1.2px at 12% 18%,#fff 60%,transparent),radial-gradient(1px 1px at 72% 12%,#cfd6ff 60%,transparent),radial-gradient(1.4px 1.4px at 42% 64%,#fff 60%,transparent),radial-gradient(1px 1px at 86% 72%,#fff 60%,transparent),radial-gradient(1px 1px at 22% 82%,#bfc8ff 60%,transparent),radial-gradient(1.2px 1.2px at 58% 34%,#fff 60%,transparent),radial-gradient(1px 1px at 92% 38%,#e6e9ff 60%,transparent),radial-gradient(1px 1px at 6% 52%,#fff 60%,transparent)';
  const RAINBOW = 'linear-gradient(90deg,#FF5F6D,#FFA34F,#FFD84F,#4FE08A,#4FA3E0,#8F6BFF,#E05FD0)';
  // designs: CSS variables read by every card (inherited through the shadow roots); page = background behind the cards
  const THEMES = {
    ha: { bg0: 'var(--primary-background-color,#111)', bg1: 'var(--ha-card-background,var(--card-background-color,#1c1c1c))', bg2: 'var(--secondary-background-color,#202020)',
      bg3: 'color-mix(in srgb,var(--primary-text-color,#fff) 6%,var(--card-background-color,#1c1c1c))', bg4: 'color-mix(in srgb,var(--primary-text-color,#fff) 11%,var(--card-background-color,#1c1c1c))',
      line: 'var(--divider-color,#333)', text: 'var(--primary-text-color,#eee)', text2: 'var(--secondary-text-color,#aaa)', text3: 'var(--disabled-text-color,#777)',
      accent: 'var(--primary-color,#03a9f4)', 'on-accent': 'var(--text-primary-color,#fff)', radius: 'var(--ha-card-border-radius,12px)', font: 'var(--ha-font-family-body,Roboto,sans-serif)',
      grad: 'var(--primary-color,#03a9f4)', page: 'var(--lovelace-background,var(--primary-background-color,#111))', glow: 'none' },
    light: { bg0: '#eef1f6', bg1: '#ffffff', bg2: '#f6f8fb', bg3: '#eef2f7', bg4: '#e2e8f0', line: '#dbe2ea', text: '#18202b', text2: '#4f5b6a', text3: '#8a95a5',
      accent: '#2F6FED', 'on-accent': '#ffffff', radius: '18px', font: SYS, grad: 'linear-gradient(90deg,#2F6FED,#21B5C9)',
      page: 'radial-gradient(900px 500px at 0% 0%,#dfe9ff 0%,transparent 60%),radial-gradient(900px 500px at 100% 100%,#dff7f2 0%,transparent 60%),#eef1f6', glow: '0 1px 2px rgba(16,24,40,.06),0 4px 14px rgba(16,24,40,.06)' },
    dark: { bg0: '#0f1115', bg1: '#171a20', bg2: '#1c2027', bg3: '#232831', bg4: '#2c323d', line: '#2f3541', text: '#eef1f5', text2: '#a9b1bd', text3: '#6f7886',
      accent: '#69C350', 'on-accent': '#0f1115', radius: '16px', font: SYS, grad: 'linear-gradient(90deg,#69C350,#3FBF9B)',
      page: 'radial-gradient(1200px 600px at 10% -10%,#1d2531 0%,transparent 60%),radial-gradient(900px 500px at 110% 110%,#16241c 0%,transparent 55%),#0f1115', glow: '0 6px 20px rgba(0,0,0,.35)' },
    rainbow: { bg0: '#121018', bg1: '#1a1722', bg2: '#201c2a', bg3: '#272233', bg4: '#30293e', line: '#3b3350', text: '#f6f3fb', text2: '#bcb3cc', text3: '#82799a',
      accent: '#FF6FAE', 'on-accent': '#1a0f18', radius: '20px', font: SYS, grad: RAINBOW, band: RAINBOW,
      page: 'radial-gradient(700px 420px at 0% 0%,rgba(255,95,109,.22),transparent 60%),radial-gradient(700px 420px at 100% 10%,rgba(79,163,224,.22),transparent 60%),radial-gradient(800px 500px at 50% 110%,rgba(143,107,255,.25),transparent 60%),#121018', glow: '0 8px 28px rgba(255,111,174,.12)' },
    space: { bg0: '#0a0c1d', bg1: '#11142b', bg2: '#161a36', bg3: '#1c2142', bg4: '#252b52', line: '#2b3263', text: '#eef0ff', text2: '#aab1d8', text3: '#6e76a6',
      accent: '#7C9CFF', 'on-accent': '#0a0c1d', radius: '18px', font: SYS, grad: 'linear-gradient(90deg,#7C9CFF,#B07CFF,#5CE1E6)',
      page: STARS + ',radial-gradient(900px 600px at 80% -10%,rgba(124,92,255,.35),transparent 60%),radial-gradient(800px 600px at -10% 110%,rgba(92,225,230,.18),transparent 60%),linear-gradient(180deg,#0a0c1d,#140f2e)', glow: '0 0 0 1px rgba(124,156,255,.08),0 10px 30px rgba(8,10,30,.5)' },
  };
  const THEME_ALIAS = { loxone: 'dark', apple: 'dark', google: 'dark', nord: 'dark' };
  const themeName = (n) => (THEMES[n] ? n : THEMES[THEME_ALIAS[n]] ? THEME_ALIAS[n] : 'ha');
  const STYLES = ['standard', 'transparent', 'glass'];
  const THEME_NAMES = { ha: { de: 'Standard', en: 'Standard' }, light: { de: 'Hell', en: 'Light' }, dark: { de: 'Dunkel', en: 'Dark' },
    rainbow: { de: 'Regenbogen', en: 'Rainbow' }, space: { de: 'Weltall', en: 'Space' } };
  const STYLE_NAMES = { standard: { de: 'Standard', en: 'Standard' }, transparent: { de: 'Transparent', en: 'Transparent' }, glass: { de: 'Glas', en: 'Glass' } };
  // surfaces of a design in a style: transparent = see-through, glass = see-through + frosted blur + light edge
  const surfaces = (t, style) => {
    if (style === 'transparent' || style === 'glass') {
      const a = style === 'glass' ? 52 : 68;
      const mix = (c, k) => `color-mix(in srgb,${c} ${k}%,transparent)`;
      return { bg1: mix(t.bg1, a), bg2: mix(t.bg2, a + 6), bg3: mix(t.bg3, a + 10), bg4: mix(t.bg4, a + 14),
        line: style === 'glass' ? `color-mix(in srgb,${t.text} 16%,transparent)` : t.line,
        blur: style === 'glass' ? 'blur(18px) saturate(160%)' : 'none' };
    }
    return { bg1: t.bg1, bg2: t.bg2, bg3: t.bg3, bg4: t.bg4, line: t.line, blur: 'none' };
  };
  // miniature of the planner in a design and style: page, top bar, a person column and chore tiles (one ticked off)
  const themeMini = (name, style) => {
    const t = THEMES[themeName(name)]; const f = surfaces(t, style || 'standard'); const r = `calc(${t.radius} / 3)`;
    const tile = (on) => `<i style="display:block;height:9px;border-radius:3px;background:${on ? t.accent : f.bg4};border:1px solid ${f.line}"></i>`;
    return `<span class="mini" style="background:${t.page};border-radius:${r}">
      <span style="display:flex;gap:4px;align-items:center;background:${f.bg1};border:1px solid ${f.line};border-radius:5px;padding:3px 5px;backdrop-filter:${f.blur}">
        <b style="width:18px;height:4px;border-radius:2px;background:${t.text3}"></b><b style="margin-left:auto;width:14px;height:6px;border-radius:3px;background:${t.grad}"></b><b style="width:14px;height:6px;border-radius:3px;background:${f.bg3}"></b></span>
      <span style="display:grid;grid-template-columns:14px 1fr 1fr;gap:4px;margin-top:4px;background:${f.bg1};border:1px solid ${f.line};border-radius:5px;padding:4px;backdrop-filter:${f.blur}">
        <b style="width:12px;height:12px;border-radius:50%;background:${t.accent};opacity:.85"></b>${tile(true)}${tile(false)}
        <b style="width:12px;height:12px;border-radius:50%;background:${t.text2};opacity:.6"></b>${tile(false)}${tile(true)}</span></span>`;
  };
  const themeSwatch = (name) => { const t = THEMES[themeName(name)];
    return `<span class="sw" style="background:${t.bg1};border-color:${t.line}"><i style="background:${t.grad}"></i><i style="background:${t.bg4}"></i><i style="background:${t.text2}"></i></span>`; };
  const applyTheme = (el, name, style) => {
    const n = themeName(name); const t = THEMES[n]; const st = STYLES.includes(style) ? style : 'standard'; const f = surfaces(t, st);
    Object.entries({ band: 'none', ...t, pop: t.bg1, ...f }).forEach(([k, v]) => el.style.setProperty(`--fp-${k}`, v));
    el.dataset.fpTheme = n; el.dataset.fpStyle = st;
    // the page background is also offered globally, so a dashboard view can use background: var(--fp-page)
    document.documentElement.style.setProperty('--fp-page', t.page);
  };
  const MSG = { de: { off: 'Das Modul „{m}“ ist ausgeschaltet. Einschalten unter Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Module.', week: 'Wochenplan', lists: 'Smarte Listen' },
    en: { off: 'The module "{m}" is switched off. Switch it on under Settings → Devices & services → Family Planer → Configure → Modules.', week: 'Week plan', lists: 'Smart lists' } };

  class FamilyPlanerCard extends HTMLElement {
    static getStubConfig() { return { view: 'week' }; }
    setConfig(c) {
      this._cfg = { view: 'week', ...(c || {}) };
      if (!INNER[this._cfg.view]) throw new Error('view: week | plan | lists | rewards | settings');
      this._sig = null; this._inner = null; this.innerHTML = ''; this._attach();
    }
    set hass(h) { this._hass = h; this._attach(); if (this._inner && this._wrapped) this._inner.hass = STORE_VIEWS.includes(this._cfg.view) ? h : this._wrap(); }
    // to-do window of the planer (opened from the button in the top bar of the week view)
    _todoWin(lang) {
      if (!this._win || this._win.parentNode !== this) {
        const win = document.createElement('div');
        win.style.cssText = 'position:fixed;inset:0;z-index:20;display:none;align-items:flex-start;justify-content:center;background:rgba(10,10,10,.72);padding:6vh 3vw;overflow:auto;box-sizing:border-box';
        const box = document.createElement('div'); box.style.cssText = 'position:relative;width:min(1000px,100%)';
        const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕';
        x.setAttribute('aria-label', lang === 'en' ? 'Close' : 'Schliessen');
        x.style.cssText = 'position:absolute;right:10px;top:22px;z-index:5;width:40px;height:40px;border-radius:20px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font-size:18px;cursor:pointer';
        x.addEventListener('click', () => this._showTodos(false));
        win.addEventListener('click', (e) => { if (e.target === win) this._showTodos(false); });
        box.appendChild(x); win.appendChild(box); this.appendChild(win);
        this._win = win; this._winBox = box;
      }
      if (!this._todoEv) {
        this._todoEv = true;
        this.addEventListener('fp-open-todos', (e) => this._showTodos(true, e.detail && e.detail.add));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._win && this._win.style.display !== 'none') this._showTodos(false); });
      }
      return this._winBox;
    }
    // "+ Special chore" / "+ To-do" of the chore plan: the form opens in a window of its own
    _addDialog(kind, lang) {
      if (kind !== 'special' && kind !== 'todo') return;
      const ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;background:rgba(10,10,10,.72);padding:6vh 3vw;overflow:auto;box-sizing:border-box';
      const box = document.createElement('div'); box.style.cssText = 'position:relative;width:min(760px,100%)';
      const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', lang === 'en' ? 'Close' : 'Schliessen');
      x.style.cssText = 'position:absolute;right:10px;top:12px;z-index:5;width:40px;height:40px;border-radius:20px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font-size:18px;cursor:pointer';
      const el = document.createElement(kind === 'special' ? 'fp-special-inner' : 'fp-todos-inner'); el.store = this._store; el.setConfig({ lang, dialog: true });
      const close = () => { ov.remove(); document.removeEventListener('keydown', esc); };
      const esc = (e) => { if (e.key === 'Escape') close(); };
      x.addEventListener('click', close); ov.addEventListener('click', (e) => { if (e.target === ov) close(); }); el.addEventListener('fp-dialog-close', close);
      document.addEventListener('keydown', esc);
      box.append(x, el); ov.appendChild(box); document.body.appendChild(ov);  // on body: a glass card above must not clip it
      const sn = this._store.snap; if (sn) applyTheme(ov, this._cfg.theme || sn.theme, this._cfg.style || sn.style);
      if (kind === 'special') el.openAdd(); else setTimeout(() => el.focusAdd && el.focusAdd(), 50);
    }
    _showTodos(on, add) { if (this._win) this._win.style.display = on ? 'flex' : 'none'; if (on && this._todos) { this._todos.update(); if (add && this._todos.focusAdd) setTimeout(() => this._todos.focusAdd(), 50); } }
    getCardSize() { return this._cfg && this._cfg.view === 'plan' ? 10 : 12; }
    getGridOptions() { return { columns: 'full', min_rows: 6 }; }
    connectedCallback() { this._attach(); }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; } }
    _wrap() { if (!this._wrapped || this._wrappedFor !== this._hass) { this._wrapped = wrapHass(this._hass, this._store); this._wrappedFor = this._hass; } return this._wrapped; }
    _attach() {
      if (!this._hass || !this._cfg || !this.isConnected || this._off) return;
      this._store = Store.get(this._hass.connection, this._cfg.entry_id);
      this._off = this._store.listen(() => this._sync());
      if (window.FPKIOSK) window.FPKIOSK.attach(this, this._store);
    }
    _sync() {
      const s = this._store.snap;
      if (!s) { if (this._store.err) this.innerHTML = `<ha-card style="padding:16px">Family Planer: ${this._store.err}</ha-card>`; return; }
      const lang = LANG(this._hass, this._cfg, this._store); const view = this._cfg.view;
      const mod = view === 'lists' ? 'lists' : view === 'settings' ? null : 'week';
      applyTheme(this, this._cfg.theme || s.theme, this._cfg.style || s.style);
      if (mod && s.modules && s.modules[mod] === false) {
        this._inner = null; this._sig = 'off';
        this.innerHTML = `<ha-card style="padding:20px;color:#bbb;background:#1e1e1e">${MSG[lang].off.replace('{m}', MSG[lang][mod])}</ha-card>`; return;
      }
      window.FP_DAY_OFFSET_MIN = s.day_offset_min || 0;
      if (STORE_VIEWS.includes(view)) {
        if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._inner = document.createElement(INNER[view]); this._inner.store = this._store; this._inner.setConfig({ lang }); this.appendChild(this._inner); this._inner.hass = this._hass; this._wrapped = true; }
        else this._inner.update();
        return;
      }
      const st = s.settings || {};
      const kinder = s.persons.map((p) => ({ name: p.name, farbe: COLOR(p.color), ...(IMAGE(p.image) ? { bild: IMAGE(p.image) } : {}), alias: p.aliases || [] }));
      const schoolName = lang === 'en' ? 'School' : 'Schule';
      const kalender = s.persons.filter((p) => p.calendar).map((p) => ({ entity: p.calendar, person: p.name }))
        .concat(s.persons.filter((p) => p.school && p.school.calendar).map((p) => ({ entity: p.school.calendar, person: p.name, schule: true, name: schoolName })))
        .concat((this._cfg.kalender || []).map((k) => (typeof k === 'string' ? { entity: k } : k)));
      const roll = st.rollover_time && st.rollover_time !== '00:00' ? st.rollover_time : '24:00';
      const cfg = { ...this._cfg, punkte_standard: (s.gamification || {}).default_points, titel: this._cfg.titel || (view === 'plan' ? (lang === 'en' ? 'Chore plan' : 'Ämtliplan') : s.title), kinder, kalender,
        schule: Object.fromEntries(s.persons.filter((p) => p.school && (p.school.calendar || Object.keys(p.school.times || {}).length))
          .map((p) => [p.name, { zeiten: p.school.times || {}, weg: p.school.travel || 0 }])),
        abwesend: Object.fromEntries(s.persons.map((p) => [p.name, (s.away || {})[p.id] || []])),
        tage_zuverlaessigkeit: st.reliability_days || 30, schulpause: st.school_gap || 0, ruhe_sekunden: st.idle_seconds || 45,
        schulfenster: st.school_window == null ? 60 : st.school_window,
        fair: ((s.gamification || {}).mode || 'fair') === 'fair',
        todos_knopf: view === 'week', todos_offen: (s.todos || []).filter((t) => !t.done).length,
        termine_nach_namen: st.match_names !== false, auch_beim_besitzer: !!st.show_owner, tageswechsel: roll,
        plan: VIRT.plan, heute: VIRT.heute, verlauf: VIRT.verlauf, einstellungen: VIRT.settings, script: VIRT.script };
      const sig = JSON.stringify([lang, cfg.fair, cfg.schulfenster, cfg.todos_offen, cfg.tage_zuverlaessigkeit, cfg.schulpause, cfg.ruhe_sekunden, cfg.schule, cfg.abwesend, cfg.punkte_standard, cfg.titel, kinder.map((k) => [k.name, k.farbe]), kalender, cfg.termine_nach_namen, cfg.auch_beim_besitzer, roll]);
      if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._special = null; this._todos = null; this._inner = document.createElement(tag(view, lang)); this.appendChild(this._inner); this._sig = null; }
      this._inner.fpStore = this._store;
      if (sig !== this._sig) { this._sig = sig; this._inner.setConfig(cfg); this._inner.hass = this._wrap(); }
      // planner: to-dos open in their own window (button in the top bar); chore plan: below the plan
      const host = view === 'week' ? this._todoWin(lang) : this;
      if (!this._todos || this._todos.parentNode !== host) { if (this._todos) this._todos.remove(); this._todos = document.createElement('fp-todos-inner'); this._todos.store = this._store; this._todos.setConfig({ lang }); host.appendChild(this._todos); }
      else this._todos.update();
      if (view === 'plan') {
        if (!this._planEv) { this._planEv = true; this.addEventListener('fp-plan-add', (e) => this._addDialog(e.detail && e.detail.kind, lang)); }
        if (!this._special || this._special.parentNode !== this) { this._special = document.createElement('fp-special-inner'); this._special.store = this._store; this._special.setConfig({ lang }); this.insertBefore(this._special, this._todos); }
        else this._special.update();
      }
    }
  }
  if (!customElements.get('family-planer-card')) customElements.define('family-planer-card', FamilyPlanerCard);

  // Navigation bar: one button per active module view, same place on every page (also in kiosk mode)
  const NAV = { de: { planer: 'Planer', listen: 'Listen', aemtliplan: 'Ämtliplan', belohnungen: 'Belohnungen', einstellungen: 'Einstellungen' }, en: { planer: 'Planner', listen: 'Lists', aemtliplan: 'Chore plan', belohnungen: 'Rewards', einstellungen: 'Settings' } };
  const NAV_ICON = { planer: 'mdi:calendar-week', listen: 'mdi:cart-outline', aemtliplan: 'mdi:clipboard-text-clock-outline', belohnungen: 'mdi:trophy-outline', einstellungen: 'mdi:cog-outline' };
  const NAV_MOD = { planer: 'week', listen: 'lists', aemtliplan: 'week', belohnungen: 'week', einstellungen: null };
  const NAV_VIEW = { planer: 'week', listen: 'lists', aemtliplan: 'plan', belohnungen: 'rewards', einstellungen: 'settings' };
  const NAV_T = {
    de: { wd: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], mon: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      design: 'Design', style: 'Stil', err: 'Konnte nicht gespeichert werden.', vac: 'Ferien prüfen', vacHint: 'In den nächsten zwei Wochen stehen Ferien im Kalender. Für wen gelten sie, und seid ihr weg oder hier?',
      away: 'Weg – Ämtli pausieren', home: 'Hier – Ämtli laufen weiter', close: 'Schliessen', open: 'offen', all: 'alle', fam: 'Ganze Familie', opt: 'Optional – lange Termine', optHint: 'Keine Ferien-Wörter, aber länger als die eingestellte Stundenzahl. Ohne Entscheid laufen die Ämtli weiter.',
      miss: 'Ansicht „{p}“ fehlt in diesem Dashboard. Ansicht mit diesem Pfad anlegen oder in der Navigationskarte unter paths: anpassen.' },
    en: { wd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], mon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      design: 'Design', style: 'Style', err: 'Could not be saved.', vac: 'Check holidays', vacHint: 'Your calendar has holidays in the next two weeks. Who do they apply to, and are you away or here?',
      away: 'Away – pause chores', home: 'Here – chores go on', close: 'Close', open: 'open', all: 'all', fam: 'Whole family', opt: 'Optional – long events', optHint: 'No holiday words, but longer than the set number of hours. Without a decision chores go on.',
      miss: 'View "{p}" is missing in this dashboard. Add a view with this path or change it under paths: in the navigation card.' } };
  const NAV_POPCSS = `
        button{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid var(--fp-line);background:var(--fp-bg3);color:var(--fp-text2);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        button ha-icon{--mdc-icon-size:20px}button.on{border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:var(--fp-accent)}
        .sw{display:flex;gap:3px;align-items:center;padding:4px 5px;border:1px solid;border-radius:7px}.sw i{display:block;width:8px;height:16px;border-radius:3px}
        .vs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.vs button{height:32px;padding:0 12px;border-radius:16px;font-size:12px}
        .oh{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1px;margin:14px 2px 4px}.oh2{font-size:12px;color:var(--fp-text3);margin:0 2px 8px}
        .pop{width:min(620px,calc(100vw - 16px));box-sizing:border-box;max-height:calc(100vh - 90px);overflow:auto;background:var(--fp-pop,var(--fp-bg1));color:var(--fp-text);font-family:var(--fp-font);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);box-shadow:0 14px 40px rgba(0,0,0,.45);padding:14px;-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none)}
        .ph{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1px;margin:2px 2px 10px;display:flex;align-items:center;gap:6px}.ph .x{margin-left:auto;height:30px;padding:0 10px}
        .tg{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .tg button,.sg button{height:auto;flex-direction:column;align-items:stretch;padding:7px;gap:6px;border-radius:12px;font-size:12px;color:var(--fp-text)}
        .tg button.on,.sg button.on{border-width:2px}
        .tn{display:flex;align-items:center;justify-content:center;gap:4px}.tn ha-icon{--mdc-icon-size:14px}
        .mini{display:block;padding:5px;box-sizing:border-box}.mini b{display:block}
        .vl{display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}.vi{border:1px solid var(--fp-line);border-radius:12px;padding:10px 12px;background:var(--fp-bg2)}
        .vt{font-weight:600}.vd{font-size:12px;color:var(--fp-text3);margin:2px 0 8px}.vb{display:flex;gap:8px;flex-wrap:wrap}.vb button{height:36px;font-size:13px}
        .vb button.on.away{background:rgba(79,163,224,.18);border-color:#4FA3E0;color:#4FA3E0}.vb button.on.home{background:color-mix(in srgb,var(--fp-accent) 18%,transparent)}
        .hint{font-size:13px;color:var(--fp-text2);margin:0 2px 10px}
`;
  const escN = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  class FamilyPlanerNavCard extends HTMLElement {
    setConfig(c) {
      this._cfg = { ...(c || {}) };
      // paths of the dashboard views, e.g. { planer: 'planer', listen: 'einkauf', aemtliplan: 'aemtliplan' }
      this._paths = { planer: 'planer', listen: 'listen', aemtliplan: 'aemtliplan', belohnungen: 'belohnungen', einstellungen: 'einstellungen', ...(this._cfg.paths || this._cfg.pfade || {}) };
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this._onClick = (e) => {
          if (e.target.closest('[data-menu]')) { this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true })); return; }
          const b = e.target.closest('[data-go]');
          if (b && this._views && !this._views.has(b.dataset.go)) { this._flash(NAV_T[this._lang()].miss.replace('{p}', b.dataset.go)); return; }
          if (b && window.FPX) { window.FPX.fpNavigate(b.dataset.go); return; }
          if (e.target.closest('[data-themes]')) { this._open = this._open === 'theme' ? null : 'theme'; this._render(); return; }
          if (e.target.closest('[data-vac]')) { this._open = this._open === 'vac' ? null : 'vac'; this._render(); return; }
          if (e.target.closest('[data-x]')) { this._open = null; this._render(); return; }
          const th = e.target.closest('[data-theme]'); if (th) { this._save({ theme: th.dataset.theme }); return; }
          const sy = e.target.closest('[data-style]'); if (sy) { this._save({ style: sy.dataset.style }); return; }
          const vf = e.target.closest('[data-vfam]'); if (vf) { const c = this._vacChoice(vf.dataset.key); c.family = !c.family; this._render(); return; }
          const vp = e.target.closest('[data-vper]'); if (vp) { const c = this._vacChoice(vp.dataset.key); c.family = false; const i = c.persons.indexOf(vp.dataset.vper); if (i >= 0) c.persons.splice(i, 1); else c.persons.push(vp.dataset.vper); this._render(); return; }
          const vd = e.target.closest('[data-decide]'); if (vd) this._decide(vd.dataset.key, vd.dataset.decide);
        };
        this.shadowRoot.addEventListener('click', this._onClick);
        // a tap outside a popup closes it
        this._outside = (e) => { const path = e.composedPath(); if (this.isConnected && this._open && !path.includes(this) && !path.includes(this._layer)) { this._open = null; this._render(); } };
        window.addEventListener('pointerdown', this._outside, true);
        window.addEventListener('location-changed', () => this._render());
        this._tick = setInterval(() => this._clock(), 15000);
      }
      this._render();
    }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) { this._store = Store.get(h.connection, this._cfg.entry_id); this._off = this._store.listen(() => this._render()); this._loadViews(); } }
    // reads the dashboard's view paths once, so a button whose view is missing shows a hint instead of an empty page
    async _loadViews() {
      try {
        const dash = location.pathname.split('/').filter(Boolean)[0];
        const cfg = await this._hass.connection.sendMessagePromise({ type: 'lovelace/config', url_path: dash && dash !== 'lovelace' ? dash : null });
        if (!cfg || !Array.isArray(cfg.views)) return;
        this._views = new Set(cfg.views.map((v, i) => String(v.path != null ? v.path : i)));
        this._render();
      } catch (e) { this._views = null; }
    }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; this._hass = null; } if (this._layer) { this._layer.remove(); this._layer = null; } }
    getCardSize() { return 1; }
    // who a holiday applies to, as picked in the popup (default: the persons found in the calendar)
    _vacChoice(key) {
      this._vc = this._vc || {}; if (this._vc[key]) return this._vc[key];
      const v = (((this._store && this._store.snap) || {}).vacation_review || []).find((x) => x.key === key) || {};
      this._vc[key] = { family: !!v.family, persons: [...((v.chosen && v.chosen.length ? v.chosen : v.persons) || [])] }; return this._vc[key];
    }
    // popups live in their own layer on top of the page, so cards below (glass style, own stacking) can never cover them
    _popLayer(html, css) {
      if (!html) { if (this._layer) this._layer.style.display = 'none'; return; }
      if (!this._layer) {
        this._layer = document.createElement('div'); this._layer.attachShadow({ mode: 'open' });
        this._layer.shadowRoot.addEventListener('click', (e) => this._onClick(e));
        document.body.appendChild(this._layer);
      }
      const bar = this.shadowRoot.querySelector('.bar'); const r = bar ? bar.getBoundingClientRect() : { bottom: 60, right: window.innerWidth - 8 };
      this._layer.style.cssText = `display:block;position:fixed;z-index:9999;top:${Math.round(r.bottom + 6)}px;right:${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
      const s = this._store && this._store.snap; if (s) applyTheme(this._layer, this._cfg.theme || s.theme, this._cfg.style || s.style);
      this._layer.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
    }
    getGridOptions() { return { columns: 'full', rows: 1 }; }
    _lang() { return LANG(this._hass, this._cfg, this._store); }
    _flash(msg) { this._err = msg; clearTimeout(this._et); this._et = setTimeout(() => { this._err = ''; this._render(); }, 3500); this._render(); }
    async _save(data) {
      const s = this._store && this._store.snap; if (!s || !window.FPPIN) return;
      if ((data.theme && data.theme === s.theme) || (data.style && data.style === s.style)) return;
      try { await window.FPPIN.call(this._store, 'family_planer/theme/set', data, { lang: this._lang(), host: this }); }
      catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(NAV_T[this._lang()].err); }
    }
    async _decide(key, decision) {
      const c = this._vacChoice(key);
      try { await window.FPPIN.call(this._store, 'family_planer/vacation/decide', { key, decision, family: !!c.family, persons: c.family ? [] : c.persons }, { lang: this._lang(), host: this }); delete this._vc[key]; }
      catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(NAV_T[this._lang()].err); }
    }
    _clock() {
      const el = this.shadowRoot && this.shadowRoot.querySelector('.clk'); if (!el) return;
      const T = NAV_T[this._lang()]; const n = new Date(); const p2 = (x) => String(x).padStart(2, '0');
      el.querySelector('b').textContent = `${p2(n.getHours())}:${p2(n.getMinutes())}`;
      el.querySelector('span').textContent = `${T.wd[n.getDay()]}, ${n.getDate()}. ${T.mon[n.getMonth()]}`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._store && this._store.snap; const lang = this._lang(); const T = NAV_T[lang];
      const mods = (s && s.modules) || { week: true, lists: true };
      const nav = (s && s.settings && s.settings.nav) || { order: ['planer', 'listen', 'belohnungen', 'einstellungen', 'aemtliplan'], hidden: ['aemtliplan'] };
      const order = this._cfg.order || nav.order.filter((k) => !nav.hidden.includes(k));
      if (s) applyTheme(this, this._cfg.theme || s.theme, this._cfg.style || s.style);
      const cur = location.pathname.split('/').filter(Boolean).pop();
      const btns = order.filter((k) => NAV[lang][k] && (!NAV_MOD[k] || mods[NAV_MOD[k]] !== false));
      const title = this._cfg.titel || this._cfg.title || (s && s.title) || 'Family Planer';
      const showTitle = !!(s && s.settings && s.settings.nav_title);
      const n = new Date(); const p2 = (x) => String(x).padStart(2, '0');
      const review = ((s && s.vacation_review) || []).filter((v) => !v.decision); const pending = review.length;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-bottom:8px}
        .bar::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}.bar{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;background:var(--fp-bg1);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);padding:6px 10px 6px 14px;font-family:var(--fp-font);color:var(--fp-text);-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}
        .t{display:flex;align-items:center;gap:10px;min-width:0}
        .clk{display:flex;align-items:baseline;gap:10px;min-width:0;white-space:nowrap}.clk b{font-size:26px;font-weight:300;font-variant-numeric:tabular-nums;color:var(--fp-accent);line-height:1}
        .clk span{font-size:15px;color:var(--fp-text);overflow:hidden;text-overflow:ellipsis}.ttl{font-size:10px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1.2px;display:block}
        .mid{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
        button{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid var(--fp-line);background:var(--fp-bg3);color:var(--fp-text2);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .mid button.on{background:var(--fp-grad);border-color:transparent;color:var(--fp-on-accent);font-weight:600}
        button.on{border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:var(--fp-accent)}
        button.menu{padding:0 10px}
        button ha-icon{--mdc-icon-size:20px}
        .rt{display:flex;justify-content:flex-end;gap:8px;position:relative}
        button.ic{padding:0 10px 0 8px;gap:8px}.sw{display:flex;gap:3px;align-items:center;padding:4px 5px;border:1px solid;border-radius:7px}.sw i{display:block;width:8px;height:16px;border-radius:3px}
        button.vac{position:relative;color:#4FA3E0;border-color:rgba(79,163,224,.55)}.vac .dot{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#E06B6B;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box}
        .mid button.miss{opacity:.55;border-style:dashed}.err{white-space:normal;max-width:min(460px,90vw);position:absolute;right:0;top:48px;background:#3a2626;border:1px solid #E06B6B;color:#fdd;padding:6px 12px;border-radius:10px;font-size:13px;z-index:31}
        @media (max-width:700px){.mid button span.l{display:none}.mid button{padding:0 12px}.clk span{display:none}.bar{grid-template-columns:auto 1fr auto}}
      </style><div class="bar"><span class="t">${this._cfg.menu ? '<button class="menu" data-menu><ha-icon icon="mdi:menu"></ha-icon></button>' : ''}<span class="clk">${showTitle ? `<i class="ttl">${escN(title)}</i>` : ''}<b>${p2(n.getHours())}:${p2(n.getMinutes())}</b><span>${T.wd[n.getDay()]}, ${n.getDate()}. ${T.mon[n.getMonth()]}</span></span></span>
        <div class="mid">${btns.map((k) => `<button class="${this._paths[k] === cur ? 'on' : ''}${this._views && !this._views.has(this._paths[k]) ? ' miss' : ''}" data-go="${escN(this._paths[k])}" title="${escN(this._views && !this._views.has(this._paths[k]) ? T.miss.replace('{p}', this._paths[k]) : NAV[lang][k])}"><ha-icon icon="${NAV_ICON[k]}"></ha-icon><span class="l">${escN(NAV[lang][k])}</span></button>`).join('')}</div>
        ${this._right(s, lang, review, pending)}</div>`;
      this._popLayer(this._popHtml, NAV_POPCSS);
    }
    _right(s, lang, review, pending) {
      if (!s) return '<span></span>';
      const T = NAV_T[lang]; const cur = themeName(s.theme); const sty = STYLES.includes(s.style) ? s.style : 'standard';
      const nm = (k) => THEME_NAMES[k][lang === 'en' ? 'en' : 'de']; const sn = (k) => STYLE_NAMES[k][lang === 'en' ? 'en' : 'de'];
      const fmtD = (d) => { const x = new Date(d + 'T00:00'); return `${x.getDate()}.${x.getMonth() + 1}.`; };
      const vac = pending ? `<button class="ic vac${this._open === 'vac' ? ' on' : ''}" data-vac title="${escN(T.vac)}"><ha-icon icon="mdi:beach"></ha-icon>${pending ? `<b class="dot">${pending}</b>` : ''}</button>` : '';
      const pop = this._open === 'theme' ? `<div class="pop" role="dialog"><div class="ph"><ha-icon icon="mdi:palette-outline"></ha-icon>${T.design}<button class="x" data-x>✕</button></div>
          <div class="tg">${Object.keys(THEMES).map((k) => `<button class="${k === cur ? 'on' : ''}" data-theme="${k}">${themeMini(k, sty)}<span class="tn">${k === cur ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}${nm(k)}</span></button>`).join('')}</div>
          <div class="ph" style="margin-top:14px"><ha-icon icon="mdi:layers-outline"></ha-icon>${T.style}</div>
          <div class="sg">${STYLES.map((k) => `<button class="${k === sty ? 'on' : ''}" data-style="${k}">${themeMini(cur, k)}<span class="tn">${k === sty ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}${sn(k)}</span></button>`).join('')}</div></div>`
        : this._open === 'vac' && pending ? `<div class="pop" role="dialog"><div class="ph"><ha-icon icon="mdi:beach"></ha-icon>${T.vac}<button class="x" data-x>✕</button></div><div class="hint">${T.vacHint}</div>
          <div class="vl">${['holiday', 'long'].map((kind) => { const list = review.filter((v) => (v.kind || 'holiday') === kind); if (!list.length) return '';
            return (kind === 'long' ? `<div class="oh">${T.opt}</div><div class="oh2">${T.optHint}</div>` : '') + list.map((v) => { const c = this._vacChoice(v.key);
              return `<div class="vi"><div class="vt">${escN(v.title)}</div><div class="vd">${fmtD(v.days[0])} – ${fmtD(v.days[v.days.length - 1])}</div>
              <div class="vs"><button class="${c.family ? 'on' : ''}" data-vfam data-key="${escN(v.key)}"><ha-icon icon="mdi:account-group"></ha-icon>${T.fam}</button>${(s.persons || []).map((p) => `<button class="${!c.family && c.persons.includes(p.id) ? 'on' : ''}" data-vper="${escN(p.id)}" data-key="${escN(v.key)}">${escN(p.name)}</button>`).join('')}</div>
              <div class="vb"><button class="away" data-decide="away" data-key="${escN(v.key)}"><ha-icon icon="mdi:airplane"></ha-icon>${T.away}</button>
              <button class="home" data-decide="home" data-key="${escN(v.key)}"><ha-icon icon="mdi:home-heart"></ha-icon>${T.home}</button></div></div>`; }).join(''); }).join('')}</div></div>` : '';
      this._popHtml = pop;
      return `<span class="rt">${vac}${this._cfg.theme_picker === false ? '' : `<button class="ic${this._open === 'theme' ? ' on' : ''}" data-themes title="${T.design}" aria-expanded="${this._open === 'theme'}">${themeSwatch(cur)}<ha-icon icon="mdi:palette-outline"></ha-icon></button>`}
        ${this._err ? `<div class="err">${escN(this._err)}</div>` : ''}</span>`;
    }
  }
  if (!customElements.get('family-planer-nav-card')) customElements.define('family-planer-nav-card', FamilyPlanerNavCard);

  // Sidebar panel: the complete planer without any dashboard or YAML
  class FamilyPlanerPanel extends HTMLElement {
    set hass(h) { this._hass = h; this._render(); }
    set narrow(n) { this._narrow = !!n; this._render(true); }
    set panel(p) { this._panel = p; this._render(); }
    connectedCallback() { this._onLoc = () => this._render(); window.addEventListener('location-changed', this._onLoc); window.addEventListener('popstate', this._onLoc); this._render(); }
    disconnectedCallback() { window.removeEventListener('location-changed', this._onLoc); window.removeEventListener('popstate', this._onLoc); }
    _render(force) {
      if (!this._hass || !this.isConnected) return;
      const cfg = (this._panel && this._panel.config) || {};
      const seg = location.pathname.split('/').filter(Boolean)[1] || 'planer';
      const view = NAV_VIEW[seg] || 'week';
      if (!this._wrap) {
        this.style.cssText = 'display:block;min-height:100vh;box-sizing:border-box;padding:8px;background:var(--fp-page,var(--fp-bg0,#141414));background-attachment:fixed';
        this._wrap = true; this._nav = document.createElement('family-planer-nav-card'); this.appendChild(this._nav);
        if (window.FPKIOSK) window.FPKIOSK.attach(this, Store.get(this._hass.connection, cfg.entry_id));
      }
      const store = Store.get(this._hass.connection, cfg.entry_id);
      if (!this._offTheme) this._offTheme = store.listen(() => { if (store.snap) { applyTheme(this, store.snap.theme, store.snap.style); this.style.background = 'var(--fp-page,var(--fp-bg0))'; } });
      if (force || this._navNarrow !== this._narrow) { this._navNarrow = this._narrow; this._nav.setConfig({ entry_id: cfg.entry_id, menu: this._narrow }); }
      this._nav.hass = this._hass;
      if (this._view !== view) {
        this._view = view; if (this._card) this._card.remove();
        this._card = document.createElement('family-planer-card'); this._card.setConfig({ view, entry_id: cfg.entry_id }); this.appendChild(this._card);
      }
      this._card.hass = this._hass;
    }
  }
  if (!customElements.get('family-planer-panel')) customElements.define('family-planer-panel', FamilyPlanerPanel);

  window.customCards = window.customCards || [];
  window.customCards.push(
    { type: 'family-planer-card', name: 'Family Planer', description: 'view: week (Wochenplan), plan (Ämtliplan), lists (Smarte Listen), rewards (Belohnungen) oder settings (Einstellungen); theme optional', preview: false },
    { type: 'family-planer-nav-card', name: 'Family Planer Navigation', description: 'Planer · Listen · Ämtliplan', preview: false });
})();
