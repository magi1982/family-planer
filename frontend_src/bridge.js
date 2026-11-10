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
  const IMAGE = (i) => (/^(av:[a-z0-9.+]{1,80}|svg:[a-z-]{1,30}|img:\/family_planer_files\/avatars\/[a-z0-9_]{1,120}\.(jpg|png|webp))$/.test(i || '') ? i : '');
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
        if (service === 'add_item') return this.ws('family_planer/chore/save', { title: data.item, assign: this.fromLegacy(dec(data.description)) });
        if (service === 'update_item') {
          const c = this.snap.chores.find((x) => x.id === data.item); if (!c) throw new Error('Ämtli nicht gefunden');
          const msg = { chore_id: c.id, title: data.rename || c.title, assign: data.description ? this.fromLegacy(dec(data.description)) : c.assign };
          const pts = 'points' in data ? data.points : c.points;
          if (typeof pts === 'number') msg.points = pts;
          return this.ws('family_planer/chore/save', msg);
        }
        if (service === 'remove_item') return Promise.all([].concat(data.item).map((id) => this.ws('family_planer/chore/delete', { chore_id: id })));
      }
      if (kind === 'settings' && (service === 'add_item' || service === 'update_item')) {
        const p = dec(data.description).p || {};
        return Promise.all(Object.entries(p).map(([n, o]) => {
          const per = this.personByName(n); if (!per) return null;
          const patch = { person_id: per.id };
          if (/^#[0-9A-Fa-f]{6}$/.test(o.farbe || '')) patch.color = o.farbe;
          if (typeof o.bild === 'string') patch.image = o.bild;
          if (Array.isArray(o.alias)) patch.aliases = o.alias;
          return this.ws('family_planer/person/update', patch);
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
  const THEMES = {
    loxone: { bg0: '#141414', bg1: '#1e1e1e', bg2: '#232323', bg3: '#262626', bg4: '#2e2e2e', line: '#333', text: '#ececec', text2: '#aaa', text3: '#777', accent: '#69C350', 'on-accent': '#141414', radius: '16px', font: SYS },
    ha: { bg0: 'var(--primary-background-color,#111)', bg1: 'var(--ha-card-background,var(--card-background-color,#1c1c1c))', bg2: 'var(--secondary-background-color,#202020)',
      bg3: 'color-mix(in srgb,var(--primary-text-color,#fff) 6%,var(--card-background-color,#1c1c1c))', bg4: 'color-mix(in srgb,var(--primary-text-color,#fff) 11%,var(--card-background-color,#1c1c1c))',
      line: 'var(--divider-color,#333)', text: 'var(--primary-text-color,#eee)', text2: 'var(--secondary-text-color,#aaa)', text3: 'var(--disabled-text-color,#777)',
      accent: 'var(--primary-color,#03a9f4)', 'on-accent': 'var(--text-primary-color,#fff)', radius: 'var(--ha-card-border-radius,12px)', font: 'var(--ha-font-family-body,Roboto,sans-serif)' },
    apple: { bg0: '#000', bg1: '#1c1c1e', bg2: '#242426', bg3: '#2c2c2e', bg4: '#3a3a3c', line: '#38383a', text: '#fff', text2: '#aeaeb2', text3: '#8e8e93', accent: '#FF9F0A', 'on-accent': '#000', radius: '22px', font: SYS },
    google: { bg0: '#131314', bg1: '#1e1f20', bg2: '#242628', bg3: '#2d2f31', bg4: '#37393b', line: '#444746', text: '#e3e3e3', text2: '#c4c7c5', text3: '#8e918f', accent: '#a8c7fa', 'on-accent': '#062e6f', radius: '24px', font: '"Google Sans",Roboto,Arial,sans-serif' },
    light: { bg0: '#f2f3f5', bg1: '#ffffff', bg2: '#f6f7f9', bg3: '#eef0f3', bg4: '#e4e7eb', line: '#dfe3e8', text: '#1f2328', text2: '#57606a', text3: '#8c959f', accent: '#1f7aec', 'on-accent': '#ffffff', radius: '16px', font: SYS },
    nord: { bg0: '#242933', bg1: '#2e3440', bg2: '#343b48', bg3: '#3b4252', bg4: '#434c5e', line: '#4c566a', text: '#eceff4', text2: '#d8dee9', text3: '#9aa3b5', accent: '#88c0d0', 'on-accent': '#2e3440', radius: '16px', font: SYS },
  };
  const applyTheme = (el, name) => {
    const t = THEMES[name] || THEMES.loxone;
    Object.entries(t).forEach(([k, v]) => el.style.setProperty(`--fp-${k}`, v));
    el.dataset.fpTheme = THEMES[name] ? name : 'loxone';
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
        this.addEventListener('fp-open-todos', () => this._showTodos(true));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._win && this._win.style.display !== 'none') this._showTodos(false); });
      }
      return this._winBox;
    }
    _showTodos(on) { if (this._win) this._win.style.display = on ? 'flex' : 'none'; if (on && this._todos) this._todos.update(); }
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
      applyTheme(this, this._cfg.theme || s.theme);
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
        todos_knopf: view === 'week', todos_offen: (s.todos || []).filter((t) => !t.done).length,
        termine_nach_namen: st.match_names !== false, auch_beim_besitzer: !!st.show_owner, tageswechsel: roll,
        plan: VIRT.plan, heute: VIRT.heute, verlauf: VIRT.verlauf, einstellungen: VIRT.settings, script: VIRT.script };
      const sig = JSON.stringify([lang, cfg.schulfenster, cfg.todos_offen, cfg.tage_zuverlaessigkeit, cfg.schulpause, cfg.ruhe_sekunden, cfg.schule, cfg.abwesend, cfg.punkte_standard, cfg.titel, kinder.map((k) => [k.name, k.farbe]), kalender, cfg.termine_nach_namen, cfg.auch_beim_besitzer, roll]);
      if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._special = null; this._todos = null; this._inner = document.createElement(tag(view, lang)); this.appendChild(this._inner); this._sig = null; }
      if (sig !== this._sig) { this._sig = sig; this._inner.setConfig(cfg); this._inner.hass = this._wrap(); }
      // planner: to-dos open in their own window (button in the top bar); chore plan: below the plan
      const host = view === 'week' ? this._todoWin(lang) : this;
      if (!this._todos || this._todos.parentNode !== host) { if (this._todos) this._todos.remove(); this._todos = document.createElement('fp-todos-inner'); this._todos.store = this._store; this._todos.setConfig({ lang }); host.appendChild(this._todos); }
      else this._todos.update();
      if (view === 'plan') {
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
  class FamilyPlanerNavCard extends HTMLElement {
    setConfig(c) {
      this._cfg = { ...(c || {}) };
      // paths of the dashboard views, e.g. { planer: 'planer', listen: 'einkauf', aemtliplan: 'aemtliplan' }
      this._paths = { planer: 'planer', listen: 'listen', aemtliplan: 'aemtliplan', belohnungen: 'belohnungen', einstellungen: 'einstellungen', ...(this._cfg.paths || this._cfg.pfade || {}) };
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => {
          if (e.target.closest('[data-menu]')) { this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true })); return; }
          const b = e.target.closest('[data-go]'); if (b && window.FPX) window.FPX.fpNavigate(b.dataset.go);
        });
        window.addEventListener('location-changed', () => this._render());
      }
      this._render();
    }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) { this._store = Store.get(h.connection, this._cfg.entry_id); this._off = this._store.listen(() => this._render()); } }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; this._hass = null; } }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: 'full', rows: 1 }; }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._store && this._store.snap; const lang = LANG(this._hass, this._cfg, this._store);
      const mods = (s && s.modules) || { week: true, lists: true };
      const order = this._cfg.order || ['planer', 'listen', 'aemtliplan', 'belohnungen', 'einstellungen'];
      if (s) applyTheme(this, this._cfg.theme || s.theme);
      const cur = location.pathname.split('/').filter(Boolean).pop();
      const btns = order.filter((k) => NAV[lang][k] && (!NAV_MOD[k] || mods[NAV_MOD[k]] !== false));
      const title = this._cfg.titel || this._cfg.title || (s && s.title) || 'Family Planer';
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-bottom:8px}
        .bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;background:var(--fp-bg1);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);padding:6px 10px 6px 16px;font-family:var(--fp-font);color:var(--fp-text)}
        .t{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
        .mid{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
        button{display:flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:10px;border:1px solid var(--fp-line);background:var(--fp-bg3);color:var(--fp-text2);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        button.on{background:color-mix(in srgb,var(--fp-accent) 16%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:var(--fp-accent);font-weight:600}
        button.menu{padding:0 10px}
        button ha-icon{--mdc-icon-size:20px}
      </style><div class="bar"><span class="t">${this._cfg.menu ? '<button class="menu" data-menu><ha-icon icon="mdi:menu"></ha-icon></button>' : ''}${title.replace(/[<>&"']/g, '')}</span><div class="mid">${btns.map((k) => `<button class="${this._paths[k] === cur ? 'on' : ''}" data-go="${this._paths[k]}"><ha-icon icon="${NAV_ICON[k]}"></ha-icon>${NAV[lang][k]}</button>`).join('')}</div><span></span></div>`;
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
        this.style.cssText = 'display:block;min-height:100vh;box-sizing:border-box;padding:8px;background:var(--fp-bg0,#141414)';
        this._wrap = true; this._nav = document.createElement('family-planer-nav-card'); this.appendChild(this._nav);
        if (window.FPKIOSK) window.FPKIOSK.attach(this, Store.get(this._hass.connection, cfg.entry_id));
      }
      const store = Store.get(this._hass.connection, cfg.entry_id);
      if (!this._offTheme) this._offTheme = store.listen(() => { if (store.snap) applyTheme(this, store.snap.theme); });
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
