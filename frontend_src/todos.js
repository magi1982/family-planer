// ---------------------------------------------------------------------------
// To-dos without a date: assigned to a person, stay until done. Ticking off asks for confirmation
// (setting), unlike chores which are ticked with one tap. Shown below the planner and the chore plan.
// ---------------------------------------------------------------------------
(() => {
  const G = '#69C350';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const TXT = {
    de: { title: 'To-dos', sub: 'Ohne Datum – bleiben stehen, bis sie erledigt sind.', none: 'Keine offenen To-dos.', ph: 'Neues To-do …', add: 'Hinzufügen', neu: 'Neues To-do',
      ask: '„{t}“ als erledigt markieren?', reopen: '„{t}“ wieder öffnen?', yes: 'Erledigt', yesOpen: 'Wieder öffnen', cancel: 'Abbrechen', del: 'Löschen',
      delAsk: '„{t}“ löschen?', pts: 'Punkte', sizeHint: 'Grösse ändern braucht die Eltern-PIN', err: 'Konnte nicht gespeichert werden.',
      sizes: { none: 'Ohne Punkte', s: 'Klein', m: 'Mittel', l: 'Gross' }, open: 'To-dos', openN: 'To-dos ({n})', close: 'Schliessen' },
    en: { title: 'To-dos', sub: 'No date – they stay until they are done.', none: 'No open to-dos.', ph: 'New to-do …', add: 'Add', neu: 'New to-do',
      ask: 'Mark "{t}" as done?', reopen: 'Reopen "{t}"?', yes: 'Done', yesOpen: 'Reopen', cancel: 'Cancel', del: 'Delete',
      delAsk: 'Delete "{t}"?', pts: 'points', sizeHint: 'Changing the size needs the parent PIN', err: 'Could not be saved.',
      sizes: { none: 'No points', s: 'Small', m: 'Medium', l: 'Large' }, open: 'To-dos', openN: 'To-dos ({n})', close: 'Close' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));

  class FpTodosInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { if (e.target.dataset.new !== undefined) this._text = e.target.value; });
        this.shadowRoot.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.new !== undefined) { e.preventDefault(); this._add(); } });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    update() { if (!this._typing()) this._render(); }
    _typing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!(a && a.tagName === 'INPUT'); }
    _snap() { return (this._store && this._store.snap) || null; }
    _flash(m) { this._msg = m; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    async _add() {
      const s = this._snap(); const title = String(this._text || '').trim(); if (!title || !s) return;
      const pid = this._person || (s.persons[0] && s.persons[0].id);
      const def = this._defSize(s); const size = this._size || def;
      try {
        await window.FPPIN.call(this._store, 'family_planer/todo/save', { person_id: pid, title, ...(size !== def ? { size } : {}) }, { lang: this._cfg.lang, host: this });
        this._text = ''; this._size = null; this._render(); if (this._cfg.dialog) this.dispatchEvent(new CustomEvent('fp-dialog-close', { bubbles: true, composed: true }));
      } catch (e) { if (e !== (window.FPPIN && window.FPPIN.CANCEL)) this._flash(this.T.err); }
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const p = t.closest('[data-person]'); if (p) { this._person = p.dataset.person; this._render(); return; }
      if (t.closest('[data-add]')) { this._add(); return; }
      const sz = t.closest('[data-size]'); if (sz) { this._size = sz.dataset.size; this._render(); return; }
      const td = t.closest('[data-todo]');
      if (td) {
        const it = (s.todos || []).find((x) => x.id === td.dataset.todo); if (!it) return;
        const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
        if (confirm || it.done) { this._dlg = { kind: 'done', it }; this._render(); return; }
        this._set(it, true); return;
      }
      const dl = t.closest('[data-del]'); if (dl) { const it = (s.todos || []).find((x) => x.id === dl.dataset.del); if (it) { this._dlg = { kind: 'del', it }; this._render(); } return; }
      if (t.closest('[data-yes]') && this._dlg) {
        const d = this._dlg; this._dlg = null;
        if (d.kind === 'done') this._set(d.it, !d.it.done);
        else { try { await window.FPPIN.call(this._store, 'family_planer/todo/delete', { todo_id: d.it.id }, { lang: this._cfg.lang, host: this }); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this.T.err); } }
        this._render(); return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    focusAdd() { const i = this.shadowRoot && this.shadowRoot.querySelector('[data-new]'); if (i) { i.focus(); i.scrollIntoView({ block: 'center' }); } }
    _defSize(s) { const v = s && s.todo_settings && s.todo_settings.size; return ['none', 's', 'm', 'l'].includes(v) ? v : 's'; }
    _pts(s, it) { const sz = (s.sizes && s.sizes.todo) || {}; return it.size ? (sz[it.size] || 0) : (it.points || 0); }
    async _set(it, done) { try { await this._store.ws('family_planer/todo/set', { todo_id: it.id, done }); } catch (e) { this._flash(this.T.err); } }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._snap(); const T = this.T; if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons || []; const todos = s.todos || [];
      const sel = persons.find((p) => p.id === this._person) || persons[0];
      const groups = persons.map((p) => ({ p, list: todos.filter((x) => x.person_id === p.id) })).filter((g) => g.list.length);
      const d = this._dlg;
      const dlg = !d ? '' : `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(d.kind === 'del' ? T.delAsk : d.it.done ? T.reopen : T.ask, { t: d.it.title }))}</div>
        <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ${d.kind === 'del' ? 'del' : 'ok'}" data-yes>${esc(d.kind === 'del' ? T.del : d.it.done ? T.yesOpen : T.yes)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-top:12px}
        .card{position:relative;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:16px 18px;font-family:${FONT};color:#ececec}
        h3{margin:0;font-size:17px;font-weight:600}.sub{font-size:12px;color:#888;margin:2px 0 12px}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
        .g{border-radius:12px;background:#232323;border:1px solid #2a2a2a;border-left:4px solid var(--c);padding:8px 10px}
        .gn{font-size:13px;font-weight:600;color:var(--c);margin:2px 2px 6px}
        .t{display:flex;align-items:center;gap:8px;width:100%;min-height:42px;padding:6px 8px;border-radius:9px;border:none;background:transparent;color:inherit;font:inherit;font-size:15px;text-align:left;cursor:pointer}
        .t:hover{background:#2a2a2a}.box{width:22px;height:22px;border-radius:6px;border:2px solid #5a5a5a;flex:none;display:flex;align-items:center;justify-content:center}
        .t.done{color:#777;text-decoration:line-through}.t.done .box{background:${G};border-color:${G};color:#141414}
        .tt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}.pt{font-size:11px;color:${G}}
        .x{width:30px;height:30px;border-radius:8px;border:none;background:transparent;color:#777;cursor:pointer;flex:none}.x:hover{color:#E06B6B;background:#2e2e2e}
        .row{display:flex}.empty{color:#888;font-size:14px;padding:4px 2px 10px}
        .add{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}.add.dlgm .in{flex-basis:100%}
        .chip{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ccc;font:inherit;font-size:13px;cursor:pointer}.chip.on{border-color:var(--c);color:var(--c)}
        .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
        .in{flex:1;min-width:180px;height:42px;border-radius:10px;border:1px solid #333;background:#141414;color:#eee;font:inherit;font-size:15px;padding:0 12px;outline:none}
        .sizes{display:flex;flex-wrap:wrap;gap:6px}.sz{height:36px;padding:0 12px;border-radius:18px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ccc;font:inherit;font-size:13px;cursor:pointer}
        .sz b{color:${G};font-weight:600}.sz.on{border-color:${G};color:#fff;background:#202820}
        .sg{height:40px;border-radius:20px;background:#2e2e2e;border:1px solid #3a3a3a;color:#ccc;font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:#141414;font-weight:600}.sg.del{background:#3a2626;border-color:#E06B6B;color:#f3b4b4}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:16px;display:flex;align-items:center;justify-content:center;z-index:4}
        .dlg{background:#232323;border:1px solid #3a3a3a;border-radius:14px;padding:18px;width:min(420px,92%)}.dh{font-size:16px;font-weight:600;margin-bottom:14px;line-height:1.4}
        .ea{display:flex;gap:8px}.sp{flex:1}
        .msg{position:absolute;right:14px;top:12px;background:#3a2626;border:1px solid #E06B6B;color:#fdd;padding:6px 12px;border-radius:10px;font-size:13px}
      </style><div class="card">
        <h3>${esc(this._cfg.dialog ? T.neu : T.title)}</h3>${this._cfg.dialog ? '' : `<div class="sub">${esc(T.sub)}</div>`}
        ${this._cfg.dialog ? '' : groups.length ? `<div class="grid">${groups.map(({ p, list }) => `<div class="g" style="--c:${COLOR(p.color)}"><div class="gn">${esc(p.name)}</div>
          ${list.map((x) => `<div class="row"><button class="t${x.done ? ' done' : ''}" data-todo="${esc(x.id)}"><span class="box">${x.done ? '✓' : ''}</span><span class="tt">${esc(x.title)}</span>${this._pts(s, x) ? `<span class="pt">+${this._pts(s, x)}</span>` : ''}</button>
            <button class="x" data-del="${esc(x.id)}" aria-label="${esc(T.del)}">✕</button></div>`).join('')}</div>`).join('')}</div>` : `<div class="empty">${esc(T.none)}</div>`}
        <div class="add${this._cfg.dialog ? ' dlgm' : ''}">${persons.map((p) => `<button class="chip${sel && p.id === sel.id ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-person="${esc(p.id)}"><i></i>${esc(p.name)}</button>`).join('')}
          <input class="in" data-new maxlength="80" placeholder="${esc(T.ph)}" value="${esc(this._text || '')}">
          <span class="sizes" title="${esc(T.sizeHint)}">${['none', 's', 'm', 'l'].map((k) => { const n = ((s.sizes && s.sizes.todo) || {})[k] || 0; const on = (this._size || this._defSize(s)) === k;
            return `<button class="sz${on ? ' on' : ''}" data-size="${k}">${esc(T.sizes[k])}${k !== 'none' ? ` <b>+${n}</b>` : ''}</button>`; }).join('')}</span>
          <button class="sg ok" data-add>${esc(T.add)}</button></div>
        ${dlg}${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-todos-inner')) customElements.define('fp-todos-inner', FpTodosInner);
})();
