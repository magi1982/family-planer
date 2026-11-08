// ---------------------------------------------------------------------------
// Special chores: free recurrence (every n days/weeks/months/years, monthly, yearly dates, one-off),
// several persons with optional rotation, time window and points. Shown below the chore plan.
// ---------------------------------------------------------------------------
(() => {
  const G = '#69C350';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const pad = (n) => String(n).padStart(2, '0');
  const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const TXT = {
    de: { title: 'Besondere Ämtli', sub: 'Nach Datum statt Wochentag – z. B. jedes halbe Jahr Luftfilter reinigen, Pneuwechsel im April und Oktober, einmalig Keller räumen.',
      add: '+ Besonderes Ämtli', none: 'Noch keine besonderen Ämtli.', name: 'Was ist zu tun?', ph: 'z. B. Luftfilter reinigen',
      types: { interval: 'Intervall', monthly: 'Monatlich', yearly: 'Jährlich', once: 'Einmalig' },
      every: 'alle', units: { days: 'Tage', weeks: 'Wochen', months: 'Monate', years: 'Jahre' }, from: 'ab',
      mdays: 'Monate', onday: 'am Tag', last: 'letzter', onweekday: 'am', nths: { 1: '1.', 2: '2.', 3: '3.', 4: '4.', '-1': 'letzten' },
      wd: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], wdl: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      dates: 'Daten', adddate: 'Datum hinzufügen', persons: 'Wer?', rotate: 'abwechselnd', window: 'Zeit zum Erledigen', days: 'Tage', points: 'Punkte',
      save: 'Speichern', cancel: 'Abbrechen', del: 'Löschen?', next: 'Nächstes Mal', err: 'Bitte Titel, mindestens eine Person und ein Datum/Intervall angeben.',
      sum: { interval: (s, u) => `alle ${s.every} ${u} ab ${s.start.split('-').reverse().join('.')}`, monthly_day: (s) => `${s.every > 1 ? `alle ${s.every} Monate` : 'monatlich'} am ${s.day === -1 ? 'letzten Tag' : s.day + '.'}`,
        monthly_wd: (s, n, w) => `${s.every > 1 ? `alle ${s.every} Monate` : 'monatlich'} am ${n} ${w}`, yearly: (d) => `jährlich am ${d}`, once: (d) => `einmalig am ${d}` },
      rot: 'abwechselnd', win: (n) => `${n} Tage Zeit` },
    en: { title: 'Special chores', sub: 'By date instead of weekday – e.g. clean the air filter every six months, change tyres in April and October, clear the cellar once.',
      add: '+ Special chore', none: 'No special chores yet.', name: 'What needs doing?', ph: 'e.g. clean the air filter',
      types: { interval: 'Interval', monthly: 'Monthly', yearly: 'Yearly', once: 'Once' },
      every: 'every', units: { days: 'days', weeks: 'weeks', months: 'months', years: 'years' }, from: 'from',
      mdays: 'months', onday: 'on day', last: 'last', onweekday: 'on the', nths: { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', '-1': 'last' },
      wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], wdl: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      dates: 'Dates', adddate: 'Add date', persons: 'Who?', rotate: 'take turns', window: 'Time to do it', days: 'days', points: 'Points',
      save: 'Save', cancel: 'Cancel', del: 'Delete?', next: 'Next', err: 'Please enter a title, at least one person and a date/interval.',
      sum: { interval: (s, u) => `every ${s.every} ${u} from ${s.start}`, monthly_day: (s) => `${s.every > 1 ? `every ${s.every} months` : 'monthly'} on day ${s.day === -1 ? 'last' : s.day}`,
        monthly_wd: (s, n, w) => `${s.every > 1 ? `every ${s.every} months` : 'monthly'} on the ${n} ${w}`, yearly: (d) => `yearly on ${d}`, once: (d) => `once on ${d}` },
      rot: 'taking turns', win: (n) => `${n} days to do it` },
  };

  class FpSpecialInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        const r = this.shadowRoot;
        r.addEventListener('click', (e) => this._click(e));
        r.addEventListener('change', (e) => this._change(e));
        r.addEventListener('input', (e) => { if (e.target.dataset.k === 'title') this._ed.title = e.target.value; });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { if (!this._editing()) this._render(); }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && /INPUT|SELECT/.test(a.tagName); }
    _snap() { return (this._store && this._store.snap) || null; }
    _fmtDate(iso) { const [y, m, d] = iso.split('-'); return this._cfg.lang === 'en' ? `${d}/${m}/${y}` : `${d}.${m}.${y}`; }
    _fmtMd(md) { const [m, d] = md.split('-'); return this._cfg.lang === 'en' ? `${d}/${m}` : `${d}.${m}.`; }
    _summary(c) {
      const T = this.T; const s = c.schedule;
      if (s.type === 'interval') return T.sum.interval({ ...s, start: this._cfg.lang === 'en' ? s.start : s.start }, T.units[s.unit]);
      if (s.type === 'monthly') return s.mode === 'weekday' ? T.sum.monthly_wd(s, T.nths[String(s.nth)], T.wdl[s.weekday - 1]) : T.sum.monthly_day(s);
      if (s.type === 'yearly') return T.sum.yearly(s.dates.map((d) => this._fmtMd(d)).join(', '));
      return T.sum.once(s.dates.map((d) => this._fmtDate(d)).join(', '));
    }
    _new() { const s = this._snap(); return { id: null, title: '', points: null, persons: s && s.persons[0] ? [s.persons[0].id] : [], rotate: false, window: 7,
      schedule: { type: 'interval', every: 6, unit: 'months', start: todayIso(), mode: 'day', day: 1, nth: 1, weekday: 6, dates: [] } }; }
    _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      if (t.closest('[data-add]')) { this._ed = this._new(); this._render(); return; }
      const ed = t.closest('[data-edit]');
      if (ed) { const c = s.chores.find((x) => x.id === ed.dataset.edit); this._ed = { id: c.id, title: c.title, points: c.points ?? null, persons: [...(c.persons || [])], rotate: !!c.rotate, window: c.window || 1,
        schedule: { every: 1, unit: 'months', start: todayIso(), mode: 'day', day: 1, nth: 1, weekday: 6, dates: [], ...c.schedule } }; this._render(); return; }
      const dl = t.closest('[data-del]');
      if (dl) { const id = dl.dataset.del; if (this._confirm !== id) { this._confirm = id; this._render(); return; }
        this._confirm = null; this._store.ws('family_planer/chore/delete', { chore_id: id }).catch((er) => this._flash(er)); return; }
      if (!this._ed) return;
      const ty = t.closest('[data-type]'); if (ty) { this._ed.schedule.type = ty.dataset.type; this._render(); return; }
      const pp = t.closest('[data-person]'); if (pp) { const id = pp.dataset.person; const l = this._ed.persons; this._ed.persons = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; this._render(); return; }
      if (t.closest('[data-rotate]')) { this._ed.rotate = !this._ed.rotate; this._render(); return; }
      const rd = t.closest('[data-rmdate]'); if (rd) { this._ed.schedule.dates = this._ed.schedule.dates.filter((x) => x !== rd.dataset.rmdate); this._render(); return; }
      if (t.closest('[data-cancel]')) { this._ed = null; this._render(); return; }
      if (t.closest('[data-save]')) this._save();
    }
    _change(e) {
      const el = e.target; const k = el.dataset.k; if (!k || !this._ed) return;
      const sc = this._ed.schedule; const num = (v) => (v === '' ? null : Number(v));
      if (k === 'title') this._ed.title = el.value;
      else if (k === 'points') this._ed.points = num(el.value);
      else if (k === 'window') this._ed.window = Math.max(1, Math.min(60, num(el.value) || 1));
      else if (k === 'adddate' && el.value) { const v = sc.type === 'yearly' ? el.value.slice(5) : el.value; if (!sc.dates.includes(v)) sc.dates = [...sc.dates, v].sort(); el.value = ''; }
      else if (k === 'start') sc.start = el.value || todayIso();
      else if (k === 'mstart') sc.start = (el.value || todayIso().slice(0, 7)) + '-01';
      else if (['every', 'day', 'nth', 'weekday'].includes(k)) sc[k] = num(el.value);
      else if (k === 'unit' || k === 'mode') sc[k] = el.value;
      this._render();
    }
    _flash(er) { this._msg = String((er && er.message) || er); this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4000); }
    async _save() {
      const e = this._ed; const sc = e.schedule;
      const sched = { type: sc.type };
      if (sc.type === 'interval') Object.assign(sched, { every: sc.every || 1, unit: sc.unit, start: sc.start });
      if (sc.type === 'monthly') Object.assign(sched, { every: sc.every || 1, start: sc.start, mode: sc.mode, ...(sc.mode === 'weekday' ? { nth: sc.nth, weekday: sc.weekday } : { day: sc.day }) });
      if (sc.type === 'yearly' || sc.type === 'once') sched.dates = sc.dates;
      if (!e.title.trim() || !e.persons.length || ((sc.type === 'yearly' || sc.type === 'once') && !sc.dates.length)) { this._flash(this.T.err); return; }
      const msg = { title: e.title.trim(), assign: {}, schedule: sched, persons: e.persons, rotate: e.rotate && e.persons.length > 1, window: e.window || 1 };
      if (e.id) msg.chore_id = e.id;
      if (typeof e.points === 'number') msg.points = Math.max(0, Math.min(1000, Math.round(e.points)));
      try { await this._store.ws('family_planer/chore/save', msg); this._ed = null; this._render(); } catch (er) { this._flash(er); }
    }
    _editor(s) {
      const T = this.T; const e = this._ed; const sc = e.schedule;
      const opt = (v, l, cur) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(l)}</option>`;
      let rule = '';
      if (sc.type === 'interval') rule = `${esc(T.every)} <input class="in n" type="number" min="1" max="365" data-k="every" value="${sc.every || 1}"> <select class="in" data-k="unit">${Object.entries(T.units).map(([v, l]) => opt(v, l, sc.unit)).join('')}</select> ${esc(T.from)} <input class="in d" type="date" data-k="start" value="${esc(sc.start)}">`;
      if (sc.type === 'monthly') rule = `${esc(T.every)} <input class="in n" type="number" min="1" max="24" data-k="every" value="${sc.every || 1}"> ${esc(T.mdays)} ${esc(T.from)} <input class="in d" type="month" data-k="mstart" value="${esc((sc.start || todayIso()).slice(0, 7))}">
        <select class="in" data-k="mode">${opt('day', T.onday, sc.mode)}${opt('weekday', T.onweekday, sc.mode)}</select>
        ${sc.mode === 'weekday' ? `<select class="in" data-k="nth">${['1', '2', '3', '4', '-1'].map((n) => opt(n, T.nths[n], sc.nth)).join('')}</select><select class="in" data-k="weekday">${T.wdl.map((w, i) => opt(i + 1, w, sc.weekday)).join('')}</select>`
          : `<select class="in" data-k="day">${[...Array(31)].map((_, i) => opt(i + 1, `${i + 1}.`, sc.day)).join('')}${opt(-1, T.last, sc.day)}</select>`}`;
      if (sc.type === 'yearly' || sc.type === 'once') rule = `<span class="chips">${sc.dates.map((d) => `<span class="dchip">${esc(sc.type === 'yearly' ? this._fmtMd(d) : this._fmtDate(d))}<button data-rmdate="${esc(d)}">✕</button></span>`).join('')}</span>
        <label class="adl">${esc(T.adddate)} <input class="in d" type="date" data-k="adddate"></label>`;
      return `<div class="ed">
        <input class="in t" data-k="title" placeholder="${esc(T.ph)}" value="${esc(e.title)}" maxlength="120">
        <div class="seg">${Object.entries(T.types).map(([v, l]) => `<button class="${sc.type === v ? 'on' : ''}" data-type="${v}">${esc(l)}</button>`).join('')}</div>
        <div class="rule">${rule}</div>
        <div class="row"><span class="lb">${esc(T.persons)}</span>${s.persons.map((p) => `<button class="pc${e.persons.includes(p.id) ? ' on' : ''}" data-person="${esc(p.id)}" style="--c:${COLOR(p.color)}">${esc(p.name)}</button>`).join('')}
          ${e.persons.length > 1 ? `<button class="pc tg${e.rotate ? ' on' : ''}" data-rotate>⇄ ${esc(T.rotate)}</button>` : ''}</div>
        <div class="row"><span class="lb">${esc(T.window)}</span><input class="in n" type="number" min="1" max="60" data-k="window" value="${e.window}"> ${esc(T.days)}
          <span class="lb" style="margin-left:18px">${esc(T.points)}</span><input class="in n" type="number" min="0" max="1000" data-k="points" value="${e.points ?? ''}" placeholder="${(s.gamification || {}).default_points || 10}"></div>
        <div class="row end"><button class="sg" data-cancel>${esc(T.cancel)}</button><button class="sg ok" data-save>${esc(T.save)}</button></div></div>`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._snap(); if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const T = this.T; const name = (pid) => (s.persons.find((p) => p.id === pid) || {}).name || '?';
      const list = s.chores.filter((c) => c.schedule);
      const rows = list.map((c) => `<div class="it">
          <div class="m"><b>${esc(c.title)}</b><span>${esc(this._summary(c))} · ${esc(T.win(c.window || 1))}${c.rotate ? ' · ' + esc(T.rot) : ''}${typeof c.points === 'number' ? ` · ${c.points} ${esc(T.points)}` : ''}</span>
          <span class="nx">${esc(T.next)}: ${(c.upcoming || []).map((u) => `${esc(this._fmtDate(u.date))} · ${esc(u.persons.map(name).join(', '))}`).join(' &nbsp;|&nbsp; ') || '–'}</span></div>
          <div class="ps">${(c.persons || []).map((pid) => { const p = s.persons.find((x) => x.id === pid); return p ? `<i style="background:${COLOR(p.color)}" title="${esc(p.name)}"></i>` : ''; }).join('')}</div>
          <button class="ib" data-edit="${esc(c.id)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>
          <button class="ib${this._confirm === c.id ? ' cf' : ''}" data-del="${esc(c.id)}">${this._confirm === c.id ? esc(T.del) : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button></div>`).join('');
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-top:12px}
        .card{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:18px 22px;color:#ececec;font-family:${FONT};position:relative}
        h2{margin:0;font-size:17px;font-weight:600}.sub{font-size:13px;color:#8c8c8c;margin:4px 0 14px}
        .it{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:#262626;border:1px solid #2a2a2a;margin-bottom:8px}
        .m{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.m b{font-size:15px}.m span{font-size:12px;color:#aaa}.m .nx{color:${G}}
        .ps{display:flex;gap:4px}.ps i{width:14px;height:14px;border-radius:50%;display:inline-block}
        .ib{min-width:40px;height:40px;border-radius:10px;border:1px solid #333;background:#2e2e2e;color:#bbb;cursor:pointer;font:inherit;font-size:12px}.ib.cf{color:#E06B6B;border-color:#E06B6B;padding:0 10px}
        ha-icon{--mdc-icon-size:18px}
        .add{height:40px;border-radius:10px;border:1px dashed #4a4a4a;background:none;color:${G};font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
        .none{color:#777;font-size:13px;margin-bottom:10px}
        .ed{border:1px solid rgba(105,195,80,.5);border-radius:12px;padding:14px;margin-bottom:10px;background:#232323;display:flex;flex-direction:column;gap:12px}
        .in{background:#2e2e2e;border:1px solid #3a3a3a;color:#eee;border-radius:9px;height:40px;padding:0 10px;font:inherit;font-size:14px;outline:none;box-sizing:border-box;color-scheme:dark}
        .in:focus{border-color:rgba(105,195,80,.7)}.in.t{width:100%;font-size:16px;height:44px}.in.n{width:76px;text-align:center}.in.d{width:auto}
        .seg{display:flex;gap:6px;flex-wrap:wrap}.seg button,.pc{height:36px;border-radius:18px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ccc;font:inherit;font-size:13px;padding:0 14px;cursor:pointer}
        .seg button.on{background:rgba(105,195,80,.16);border-color:rgba(105,195,80,.6);color:${G};font-weight:600}
        .pc{border-left:4px solid var(--c,#666)}.pc.on{background:#333;color:#fff;border-color:var(--c,${G})}.pc.tg{border-left:1px solid #3a3a3a}.pc.tg.on{color:${G};border-color:${G}}
        .rule,.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:#ccc}.row.end{justify-content:flex-end}
        .lb{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.8px}
        .chips{display:flex;gap:6px;flex-wrap:wrap}.dchip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 4px 0 12px;border-radius:16px;background:#333;font-size:13px}
        .dchip button{border:none;background:none;color:#999;cursor:pointer;font-size:12px}.adl{display:flex;align-items:center;gap:6px;font-size:13px;color:#999}
        .sg{height:38px;border-radius:19px;background:#2e2e2e;border:1px solid #3a3a3a;color:#ccc;font:inherit;font-size:13px;padding:0 16px;cursor:pointer}.sg.ok{background:${G};border-color:${G};color:#141414;font-weight:600}
        .msg{color:#E06B6B;font-size:13px;margin-top:8px}
      </style><div class="card"><h2>${esc(T.title)}</h2><div class="sub">${esc(T.sub)}</div>
        ${this._ed ? this._editor(s) : ''}
        ${rows || (this._ed ? '' : `<div class="none">${esc(T.none)}</div>`)}
        ${this._ed ? '' : `<button class="add" data-add>${esc(T.add)}</button>`}
        ${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}</div>`;
    }
  }
  if (!customElements.get('fp-special-inner')) customElements.define('fp-special-inner', FpSpecialInner);
})();
