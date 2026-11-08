// ---------------------------------------------------------------------------
// Smart lists card ("Smarte Listen"): any to-do list, grouped by self-organising categories
// rendered inside custom:family-planer-card (view: lists)
// ---------------------------------------------------------------------------
(() => {
  const G = '#69C350';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { add: 'Was fehlt?', addb: 'Hinzufügen', sorting: 'Wird einsortiert …', done: 'Erledigt', clear: 'Erledigte löschen',
      cats: 'Kategorien', optimize: 'Optimieren', optimizing: 'Optimiere …', move: 'Kategorie wählen', learned: 'Gemerkt: „{i}“ → {c}',
      empty: 'Die Liste ist leer – oben etwas hinzufügen.', nolists: 'Noch keine Liste eingerichtet. Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Smarte Listen.',
      unavailable: 'Liste nicht erreichbar', edit: 'Kategorien bearbeiten', limit: '{n} von max. {m}', newcat: '+ Kategorie', save: 'Speichern', cancel: 'Abbrechen',
      other: 'bleibt immer zuletzt', created: 'Neu: {x}', removed: 'Zusammengefasst: {x}', nothing: 'Alles ist schon gut sortiert.', err: 'Fehler: ', del: 'Löschen' },
    en: { add: 'What do you need?', addb: 'Add', sorting: 'Sorting …', done: 'Done', clear: 'Clear done',
      cats: 'Categories', optimize: 'Optimise', optimizing: 'Optimising …', move: 'Choose category', learned: 'Remembered: "{i}" → {c}',
      empty: 'The list is empty – add something above.', nolists: 'No list set up yet. Settings → Devices & services → Family Planer → Configure → Smart lists.',
      unavailable: 'List not available', edit: 'Edit categories', limit: '{n} of max. {m}', newcat: '+ Category', save: 'Save', cancel: 'Cancel',
      other: 'always stays last', created: 'New: {x}', removed: 'Merged: {x}', nothing: 'Everything is sorted well already.', err: 'Error: ', del: 'Delete' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));

  class FpListsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        const r = this.shadowRoot;
        r.addEventListener('click', (e) => this._click(e));
        r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.addin !== undefined) this._add(); });
        r.addEventListener('input', (e) => { if (e.target.dataset.addin !== undefined) this._draft = e.target.value; if (e.target.dataset.cn !== undefined) this._edit[+e.target.dataset.cn].name = e.target.value; });
      }
      try { this._sel = this._sel || localStorage.getItem('fp_list') || null; } catch (e) { /* ignore */ }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) this._resub(); }
    disconnectedCallback() { this._unsub(); }
    connectedCallback() { if (this._hass && !this._sub) this._resub(); }
    update() { this._resub(); this._render(); }
    _lists() { return (this._store && this._store.snap && this._store.snap.lists) || []; }
    _cur() { const ls = this._lists(); return ls.find((l) => l.id === this._sel) || ls[0] || null; }
    _unsub() { if (this._sub) { this._sub.then((u) => u && u()).catch(() => {}); this._sub = null; this._subEnt = null; } }
    _resub() {
      const l = this._cur(); if (!this._hass || !l || !this.isConnected) return;
      if (this._subEnt === l.entity) return;
      this._unsub(); this._items = null; this._subEnt = l.entity; this._err = null;
      this._sub = this._hass.connection.subscribeMessage((m) => { this._items = m.items || []; this._render(); },
        { type: 'todo/item/subscribe', entity_id: l.entity }).catch((e) => { this._err = (e && e.message) || String(e); this._render(); });
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _svc(service, data) { const l = this._cur(); return this._hass.callService('todo', service, data, { entity_id: l.entity }).catch((e) => this._flash(this.T.err + (e.message || e), true)); }
    _add() {
      const v = (this._draft || '').trim(); if (!v) return;
      this._draft = ''; const inp = this.shadowRoot.querySelector('[data-addin]'); if (inp) inp.value = '';
      this._svc('add_item', { item: v });
    }
    async _click(e) {
      const t = e.target; const l = this._cur();
      const tab = t.closest('[data-tab]');
      if (tab) { this._sel = tab.dataset.tab; try { localStorage.setItem('fp_list', this._sel); } catch (er) { /* ignore */ } this._move = null; this._resub(); this._render(); return; }
      if (!l) return;
      if (t.closest('[data-addb]')) { this._add(); return; }
      const mv = t.closest('[data-mv]');
      if (mv) { e.stopPropagation(); this._move = mv.dataset.mv; this._render(); return; }
      const to = t.closest('[data-to]');
      if (to && this._move) {
        const item = this._move; const cat = l.categories.find((c) => c.id === to.dataset.to); this._move = null;
        this._store.ws('family_planer/list/assign', { list_id: l.id, item, category_id: cat.id })
          .then(() => this._flash(fmt(this.T.learned, { i: item, c: cat.name }))).catch((er) => this._flash(this.T.err + (er.message || er), true));
        this._render(); return;
      }
      if (t.classList.contains('ov') || t.closest('[data-x]')) { this._move = null; this._edit = null; this._render(); return; }
      const it = t.closest('[data-uid]');
      if (it) { const done = it.dataset.st === 'completed'; it.classList.toggle('done'); this._svc('update_item', { item: it.dataset.uid, status: done ? 'needs_action' : 'completed' }); return; }
      if (t.closest('[data-clear]')) { this._hass.callService('todo', 'remove_completed_items', {}, { entity_id: l.entity }).catch((er) => this._flash(this.T.err + (er.message || er), true)); return; }
      if (t.closest('[data-showdone]')) { this._showDone = !this._showDone; this._render(); return; }
      if (t.closest('[data-opt]')) {
        if (this._busy) return; this._busy = true; this._render();
        try {
          const r = await this._store.ws('family_planer/list/refresh', { list_id: l.id, ai: true });
          const parts = [];
          if (r && r.created && r.created.length) parts.push(fmt(this.T.created, { x: r.created.join(', ') }));
          if (r && r.removed && r.removed.length) parts.push(fmt(this.T.removed, { x: r.removed.join(', ') }));
          this._flash(parts.join(' · ') || this.T.nothing);
        } catch (er) { this._flash(this.T.err + (er.message || er), true); }
        this._busy = false; this._render(); return;
      }
      if (t.closest('[data-cats]')) { this._edit = l.categories.map((c) => ({ ...c })); this._render(); return; }
      if (this._edit) {
        const up = t.closest('[data-up]'); const dn = t.closest('[data-dn]'); const rm = t.closest('[data-rm]');
        const ed = this._edit; const others = ed.filter((c) => c.id !== 'other');
        if (up || dn) { const i = +(up || dn).dataset[up ? 'up' : 'dn']; const j = i + (up ? -1 : 1); if (j >= 0 && j < others.length) { [others[i], others[j]] = [others[j], others[i]]; this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; } this._render(); return; }
        if (rm) { const i = +rm.dataset.rm; others.splice(i, 1); this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; this._render(); return; }
        if (t.closest('[data-newcat]')) { if (ed.length < l.max_categories) { others.push({ id: null, name: '', icon: 'mdi:tag-outline' }); this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; } this._render(); return; }
        if (t.closest('[data-save]')) {
          const cats = this._edit.filter((c) => (c.name || '').trim()).map((c) => ({ id: c.id, name: c.name.trim(), icon: c.icon }));
          this._edit = null; this._render();
          this._store.ws('family_planer/list/categories', { list_id: l.id, categories: cats }).catch((er) => this._flash(this.T.err + (er.message || er), true));
        }
      }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const ls = this._lists(); const l = this._cur();
      const active = this.shadowRoot.activeElement; const keepFocus = active && active.dataset && active.dataset.addin !== undefined;
      let body = '';
      if (!l) body = `<div class="empty">${esc(T.nolists)}</div>`;
      else if (this._err) body = `<div class="empty">${esc(T.unavailable)}: ${esc(this._err)}</div>`;
      else if (this._items) {
        const open = this._items.filter((i) => i.status === 'needs_action');
        const done = this._items.filter((i) => i.status === 'completed');
        const groups = new Map(l.categories.map((c) => [c.id, []])); const pending = [];
        open.forEach((i) => { const cid = l.map[i.summary]; if (cid && groups.has(cid)) groups.get(cid).push(i); else pending.push(i); });
        const row = (i) => `<div class="it${i.status === 'completed' ? ' done' : ''}" data-uid="${esc(i.uid)}" data-st="${i.status}"><span class="cb"></span><span class="tx">${esc(i.summary)}</span>${i.status === 'needs_action' ? `<button class="mv" data-mv="${esc(i.summary)}" title="${esc(T.move)}"><ha-icon icon="mdi:swap-horizontal"></ha-icon></button>` : ''}</div>`;
        const sec = (icon, name, items, cls) => `<section class="${cls || ''}"><h3><ha-icon icon="${esc(icon)}"></ha-icon><span>${esc(name)}</span><em>${items.length}</em></h3>${items.map(row).join('')}</section>`;
        const secs = [];
        if (pending.length) secs.push(sec('mdi:timer-sand', T.sorting, pending, 'pend'));
        l.categories.forEach((c) => { const g = groups.get(c.id); if (g.length) secs.push(sec(c.icon || 'mdi:tag-outline', c.name, g)); });
        body = (secs.length ? `<div class="cols">${secs.join('')}</div>` : `<div class="empty">${esc(T.empty)}</div>`) +
          (done.length ? `<div class="dn"><button class="lnk" data-showdone><ha-icon icon="mdi:chevron-${this._showDone ? 'up' : 'down'}"></ha-icon>${esc(T.done)} (${done.length})</button><button class="lnk" data-clear><ha-icon icon="mdi:broom"></ha-icon>${esc(T.clear)}</button></div>` +
            (this._showDone ? `<div class="donel">${done.map(row).join('')}</div>` : '') : '');
      }
      const moveDlg = this._move && l ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.move)}<b>${esc(this._move)}</b></div><div class="chips">${l.categories.map((c) => `<button class="chip${l.map[this._move] === c.id ? ' on' : ''}" data-to="${esc(c.id)}"><ha-icon icon="${esc(c.icon || 'mdi:tag-outline')}"></ha-icon>${esc(c.name)}</button>`).join('')}</div></div></div>` : '';
      const ed = this._edit;
      const editDlg = ed && l ? (() => { const others = ed.filter((c) => c.id !== 'other'); const oth = ed.find((c) => c.id === 'other');
        return `<div class="ov"><div class="dlg wide"><div class="dh">${esc(T.edit)} · ${esc(l.name)}<span class="lim">${esc(fmt(T.limit, { n: ed.length, m: l.max_categories }))}</span></div>
          ${others.map((c, i) => `<div class="er"><ha-icon icon="${esc(c.icon || 'mdi:tag-outline')}"></ha-icon><input class="in" data-cn="${ed.indexOf(c)}" value="${esc(c.name)}"><button class="ib" data-up="${i}"><ha-icon icon="mdi:arrow-up"></ha-icon></button><button class="ib" data-dn="${i}"><ha-icon icon="mdi:arrow-down"></ha-icon></button><button class="ib rm" data-rm="${i}" title="${esc(T.del)}"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button></div>`).join('')}
          ${oth ? `<div class="er"><ha-icon icon="${esc(oth.icon)}"></ha-icon><input class="in" data-cn="${ed.indexOf(oth)}" value="${esc(oth.name)}"><span class="hint">${esc(T.other)}</span></div>` : ''}
          <div class="ea">${ed.length < l.max_categories ? `<button class="sg" data-newcat>${esc(T.newcat)}</button>` : '<span></span>'}<span class="sp"></span><button class="sg" data-x>${esc(T.cancel)}</button><button class="sg ok" data-save>${esc(T.save)}</button></div></div></div>`; })() : '';
      const openCount = (x) => (x.id === (l && l.id) && this._items ? this._items.filter((i) => i.status === 'needs_action').length : null);
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:16px;font-family:${FONT};color:#ececec;position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .tabs{display:flex;gap:8px;flex-wrap:wrap;flex:1}
        .tab{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid #333;background:#262626;color:#ccc;font:inherit;font-size:14px;cursor:pointer}
        .tab.on{background:rgba(105,195,80,.16);border-color:rgba(105,195,80,.6);color:${G};font-weight:600}
        .tab em{font-style:normal;font-size:11px;background:#333;color:#ddd;border-radius:9px;padding:1px 7px}
        .tab.on em{background:${G};color:#141414}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid #333;background:#262626;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        .tb.busy ha-icon{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
        ha-icon{--mdc-icon-size:18px}
        .addr{display:flex;gap:8px;margin:14px 0 16px}
        .in{flex:1;height:44px;border-radius:10px;border:1px solid #333;background:#141414;color:#eee;font:inherit;font-size:15px;padding:0 14px;outline:none;min-width:0}
        .in:focus{border-color:${G}}
        .addb{width:52px;height:44px;border-radius:10px;border:none;background:${G};color:#141414;cursor:pointer}
        .addb ha-icon{--mdc-icon-size:24px}
        .cols{columns:3 250px;column-gap:12px}
        section{break-inside:avoid;background:#232323;border:1px solid #2c2c2c;border-radius:12px;padding:10px 10px 6px;margin:0 0 12px}
        section.pend{border-style:dashed;border-color:#4a4a4a}
        h3{display:flex;align-items:center;gap:8px;margin:0 2px 8px;font-size:12px;font-weight:600;color:#9a9a9a;text-transform:uppercase;letter-spacing:1px}
        h3 ha-icon{color:${G}}h3 span{flex:1}h3 em{font-style:normal;color:#666}
        .it{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 4px 0 10px;border-radius:9px;background:#2a2a2a;margin-bottom:6px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .cb{width:20px;height:20px;border-radius:50%;border:2px solid #5a5a5a;flex:none;box-sizing:border-box}
        .it.done{background:#202820}.it.done .cb{background:${G};border-color:${G}}.it.done .tx{color:#6f8a66;text-decoration:line-through}
        .tx{flex:1;font-size:15px;line-height:1.25;padding:8px 0;word-break:break-word}
        .mv{width:36px;height:36px;border:none;background:none;color:#666;cursor:pointer;border-radius:8px}
        .mv:hover{color:#ccc;background:#333}
        .dn{display:flex;gap:10px;margin-top:4px}
        .lnk{display:flex;align-items:center;gap:6px;background:none;border:none;color:#888;font:inherit;font-size:13px;cursor:pointer;padding:6px 4px}
        .donel{columns:3 250px;column-gap:12px;margin-top:6px}
        .empty{color:#888;padding:30px 10px;text-align:center;font-size:14px}
        .msg{position:absolute;left:50%;transform:translateX(-50%);top:12px;background:#2e3a2a;border:1px solid ${G};color:#dfe;padding:8px 16px;border-radius:10px;font-size:13px;z-index:5}
        .msg.e{background:#3a2626;border-color:#E06B6B}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:16px;display:flex;align-items:flex-start;justify-content:center;padding-top:60px;z-index:4}
        .dlg{background:#232323;border:1px solid #3a3a3a;border-radius:14px;padding:16px;width:min(560px,92%)}
        .dlg.wide{width:min(640px,94%)}
        .dh{font-size:13px;color:#999;margin-bottom:12px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.dh b{color:#eee;font-size:16px}
        .lim{margin-left:auto;font-size:12px;color:#777}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .chip{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:20px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font:inherit;font-size:14px;cursor:pointer}
        .chip.on{border-color:${G};color:${G}}
        .er{display:flex;align-items:center;gap:8px;margin-bottom:8px}.er>ha-icon{color:${G}}
        .er .in{height:38px;font-size:14px}
        .ib{width:38px;height:38px;border-radius:9px;border:1px solid #333;background:#2b2b2b;color:#bbb;cursor:pointer}
        .ib.rm:hover{color:#E06B6B}
        .hint{font-size:12px;color:#777;white-space:nowrap}
        .ea{display:flex;gap:8px;margin-top:12px;align-items:center}.sp{flex:1}
        .sg{height:38px;border-radius:19px;background:#2e2e2e;border:1px solid #3a3a3a;color:#ccc;font:inherit;font-size:13px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:#141414;font-weight:600}
      </style>
      <div class="card">
        <div class="top"><div class="tabs">${ls.map((x) => { const n = openCount(x); return `<button class="tab${l && x.id === l.id ? ' on' : ''}" data-tab="${esc(x.id)}"><ha-icon icon="${esc(x.icon || 'mdi:format-list-checks')}"></ha-icon>${esc(x.name)}${n ? `<em>${n}</em>` : ''}</button>`; }).join('')}</div>
          ${l ? `<button class="tb" data-cats><ha-icon icon="mdi:shape-outline"></ha-icon>${esc(T.cats)}</button><button class="tb${this._busy ? ' busy' : ''}" data-opt><ha-icon icon="mdi:auto-fix"></ha-icon>${esc(this._busy ? T.optimizing : T.optimize)}</button>` : ''}</div>
        ${l ? `<div class="addr"><input class="in" data-addin placeholder="${esc(T.add)}" value="${esc(this._draft || '')}" enterkeyhint="done"><button class="addb" data-addb title="${esc(T.addb)}"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ''}
        ${body}
        ${moveDlg}${editDlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
      if (keepFocus) { const i = this.shadowRoot.querySelector('[data-addin]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    }
  }
  if (!customElements.get('fp-lists-inner')) customElements.define('fp-lists-inner', FpListsInner);
})();
