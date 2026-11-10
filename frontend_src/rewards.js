// ---------------------------------------------------------------------------
// Points & rewards card: levels, reward shop, parent approval (admin or PIN), bonus points, history
// rendered inside custom:family-planer-card (view: rewards)
// ---------------------------------------------------------------------------
(() => {
  const G = '#69C350';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { title: 'Punkte & Belohnungen', pts: 'Punkte', lvl: 'Level', next: 'noch {n} bis Level {l}', max: 'Höchstes Level erreicht!',
      shop: 'Belohnungen für {name}', shopAll: 'Alle Belohnungen', pickHint: 'Person antippen, um ihre Belohnungen zu sehen und einzulösen.', forOnly: 'nur für {n}', redeem: 'Einlösen', missing: 'noch {n} Punkte', approval: 'mit Freigabe', noapproval: 'sofort',
      week: 'max. {n}× pro Woche', none: 'Noch keine Belohnungen. Eltern legen sie hier mit „Bearbeiten“ an (Eltern-PIN).',
      pending: 'Wartet auf Freigabe', approve: 'Freigeben', deny: 'Ablehnen', history: 'Verlauf', bonus: 'Punkte geben',
      pin: 'Eltern-PIN', ok: 'OK', cancel: 'Abbrechen', reason: 'Grund (optional)', give: 'Vergeben',
      sent: '„{t}“ angefragt – die Eltern werden benachrichtigt.', done: '„{t}“ eingelöst. Viel Spass!', approved: 'Freigegeben', denied: 'Abgelehnt',
      reserved: '{n} reserviert', err: { not_enough_points: 'Nicht genug Punkte.', weekly_limit: 'Diese Woche schon so oft eingelöst.', not_allowed: 'Diese Belohnung ist nicht für dich.', unauthorized: 'Falsche PIN oder keine Berechtigung.', pin_wrong: 'Falsche PIN.', pin_locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.' },
      kinds: { chore: 'Ämtli', bonus: 'Tagesbonus', streak: 'Serienbonus', adjust: 'Bonus', reward: 'Belohnung', carry: 'Übertrag', todo: 'To-do' },
      edit: 'Bearbeiten', editDone: 'Fertig', add: 'Neue Belohnung', changePin: 'PIN ändern', del: 'Löschen', save: 'Speichern',
      rTitle: 'Belohnung', rIcon: 'Icon', rCost: 'Kosten in Punkten', rApproval: 'Eltern müssen freigeben', rPersons: 'Nur für (leer = alle)', rWeek: 'Höchstens pro Woche (0 = unbegrenzt)',
      delAsk: '„{t}“ wirklich löschen? Offene Anfragen dafür werden abgelehnt.', saved: 'Gespeichert.', pinChanged: 'Eltern-PIN geändert.',
      startPin: 'Die Start-PIN 123456 ist noch aktiv. Bitte jetzt eine eigene Eltern-PIN festlegen – vorher sind Belohnungen und Einstellungen gesperrt.',
      rCat: 'Kategorie', own: 'Eigene Punkte', approx: 'ca.', minus: 'Abziehen',
      sizes: { s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Mega gross', xxl: 'Riesig' },
      catHint: 'Gross = so viel, wie man in einem Monat mit allen Ämtli verdient (inkl. Boni). Die Punkte passen sich an, wenn die Punkte-Einstellungen ändern.' },
    en: { title: 'Points & rewards', pts: 'points', lvl: 'Level', next: '{n} more to level {l}', max: 'Highest level reached!',
      shop: 'Rewards for {name}', shopAll: 'All rewards', pickHint: 'Tap a person to see and redeem their rewards.', forOnly: 'only for {n}', redeem: 'Redeem', missing: '{n} points to go', approval: 'needs approval', noapproval: 'instant',
      week: 'max. {n}× per week', none: 'No rewards yet. Parents add them here with "Edit" (parent PIN).',
      pending: 'Waiting for approval', approve: 'Approve', deny: 'Decline', history: 'History', bonus: 'Give points',
      pin: 'Parent PIN', ok: 'OK', cancel: 'Cancel', reason: 'Reason (optional)', give: 'Give',
      sent: '"{t}" requested – the parents are notified.', done: '"{t}" redeemed. Have fun!', approved: 'Approved', denied: 'Declined',
      reserved: '{n} reserved', err: { not_enough_points: 'Not enough points.', weekly_limit: 'Already redeemed that often this week.', not_allowed: 'This reward is not for you.', unauthorized: 'Wrong PIN or not allowed.', pin_wrong: 'Wrong PIN.', pin_locked: 'Too many wrong tries – please wait 5 minutes.' },
      kinds: { chore: 'Chore', bonus: 'Day bonus', streak: 'Streak bonus', adjust: 'Bonus', reward: 'Reward', carry: 'Carried over', todo: 'To-do' },
      edit: 'Edit', editDone: 'Done', add: 'New reward', changePin: 'Change PIN', del: 'Delete', save: 'Save',
      rTitle: 'Reward', rIcon: 'Icon', rCost: 'Cost in points', rApproval: 'Parents must approve', rPersons: 'Only for (empty = everyone)', rWeek: 'At most per week (0 = unlimited)',
      delAsk: 'Really delete "{t}"? Pending requests for it are declined.', saved: 'Saved.', pinChanged: 'Parent PIN changed.',
      startPin: 'The start PIN 123456 is still active. Please choose your own parent PIN now – until then rewards and settings are locked.',
      rCat: 'Category', own: 'Own points', approx: 'approx.', minus: 'Take away',
      sizes: { s: 'Small', m: 'Medium', l: 'Large', xl: 'Mega', xxl: 'Giant' },
      catHint: 'Large = what you earn in a month with every chore done (incl. bonuses). Points follow the point settings automatically.' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const RSIZES = ['s', 'm', 'l', 'xl', 'xxl'];
  const money = (s, k) => { const z = s.sizes || {}; const v = (z.values || {})[k]; return v ? `${Number(v).toLocaleString('de-CH', { maximumFractionDigits: 2 })} ${z.currency || ''}`.trim() : ''; };
  const av = (p, size) => (window.FPX && window.FPX.avatarHtml
    ? window.FPX.avatarHtml({ name: p.name, farbe: COLOR(p.color), bild: /^(av:[a-z0-9.+]+|svg:[a-z-]+|img:\/family_planer_files\/avatars\/[a-z0-9_]+\.(jpg|png|webp))$/.test(p.image || '') ? p.image : '' }, size)
    : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${p.color};display:inline-block"></span>`);

  class FpRewardsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { const d = e.target.dataset; if (!this._dlg) return; if (d.bp !== undefined) this._dlg.points = e.target.value; if (d.br !== undefined) this._dlg.reason = e.target.value;
          if (d.rf) this._dlg.r[d.rf] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; });
        this.shadowRoot.addEventListener('change', (e) => { const d = e.target.dataset; if (this._dlg && d.rf && e.target.type === 'checkbox') this._dlg.r[d.rf] = e.target.checked; });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { this._render(); }
    _snap() { return (this._store && this._store.snap) || null; }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4000); }
    _errText(e) { const code = String((e && (e.code || e.message)) || e).replace(/^reward_/, ''); return this.T.err[code] || (e && e.message) || code; }
    _isAdmin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
    _ctx() { return { lang: this._cfg.lang, host: this }; }
    // approvals and points: admins act directly, everyone else with the parent PIN (unlock token)
    async _parent(action) {
      if (this._isAdmin()) return action({});
      try { const token = await window.FPPIN.ensure(this._store, this._ctx()); return action({ token }); } catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(this._errText(e), true); return null; }
    }
    // reward changes: always the parent PIN, also for admins
    async _pinned(type, data) {
      try { return await window.FPPIN.call(this._store, type, data, this._ctx()); } catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(this._errText(e), true); return null; }
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const pc = t.closest('[data-p]'); if (pc) { this._sel = this._sel === pc.dataset.p ? null : pc.dataset.p; this._render(); return; }
      const rd = t.closest('[data-redeem]');
      if (rd) {
        const r = s.rewards.find((x) => x.id === rd.dataset.redeem); const pid = this._sel; if (!pid) return;
        try { const res = await this._store.ws('family_planer/reward/redeem', { person_id: pid, reward_id: r.id }); this._flash(fmt(res.status === 'approved' ? this.T.done : this.T.sent, { t: r.title })); } catch (er) { this._flash(this._errText(er), true); }
        return;
      }
      const dc = t.closest('[data-decide]');
      if (dc) { const id = dc.dataset.decide; const approve = dc.dataset.ok === '1'; this._parent((extra) => this._store.ws('family_planer/reward/decide', { request_id: id, approve, ...extra }).then(() => this._flash(approve ? this.T.approved : this.T.denied)).catch((er) => this._flash(this._errText(er), true))); return; }
      if (t.closest('[data-bonus]')) { this._dlg = { kind: 'bonus', points: String(((s.sizes || {}).todo || {}).s || 10), reason: '', person: this._sel || (s.persons[0] && s.persons[0].id) }; this._render(); return; }
      const bz = t.closest('[data-bsize]'); if (bz && this._dlg && this._dlg.kind === 'bonus') { const n = ((s.sizes || {}).todo || {})[bz.dataset.bsize] || 0; this._dlg.points = String(this._dlg.neg ? -n : n); this._render(); return; }
      if (t.closest('[data-bneg]') && this._dlg && this._dlg.kind === 'bonus') { this._dlg.neg = !this._dlg.neg; this._dlg.points = String(-(Number(this._dlg.points) || 0)); this._render(); return; }
      const bp = t.closest('[data-bperson]'); if (bp && this._dlg) { this._dlg.person = bp.dataset.bperson; this._render(); return; }
      if (t.closest('[data-give]') && this._dlg) {
        const d = this._dlg; const pts = Math.round(Number(d.points) || 0); if (!pts) return;
        this._parent((extra) => this._store.ws('family_planer/points/adjust', { person_id: d.person, points: pts, reason: d.reason || '', ...extra }).then(() => { this._dlg = null; this._render(); }).catch((er) => this._flash(this._errText(er), true)));
        return;
      }
      if (t.closest('[data-chpin]')) {
        try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); }
        return;
      }
      if (t.closest('[data-edit]')) {
        if (this._edit) { this._edit = false; this._render(); return; }
        try { await window.FPPIN.ensure(this._store, this._ctx()); this._edit = true; this._render(); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); }
        return;
      }
      const er = t.closest('[data-redit]');
      if (er) {
        const r = s.rewards.find((x) => x.id === er.dataset.redit) || { title: '', icon: 'mdi:gift-outline', size: 's', cost: ((s.sizes || {}).reward || {}).s || 100, approval: true, persons: [], per_week: 0 };
        this._dlg = { kind: 'reward', id: r.id || null, r: { ...r, size: r.size || (r.id ? 'custom' : 's'), persons: [...(r.persons || [])] } }; this._render(); return;
      }
      const rz = t.closest('[data-rsize]');
      if (rz && this._dlg && this._dlg.kind === 'reward') { const k = rz.dataset.rsize; this._dlg.r.size = k; if (k !== 'custom') this._dlg.r.cost = ((s.sizes || {}).reward || {})[k] || this._dlg.r.cost; this._render(); return;
      }
      const ic = t.closest('[data-ricon]'); if (ic && this._dlg && this._dlg.kind === 'reward') { this._dlg.r.icon = ic.dataset.ricon; this._render(); return; }
      const rp = t.closest('[data-rperson]');
      if (rp && this._dlg && this._dlg.kind === 'reward') { const ps = this._dlg.r.persons; const i = ps.indexOf(rp.dataset.rperson); if (i >= 0) ps.splice(i, 1); else ps.push(rp.dataset.rperson); this._render(); return; }
      if (t.closest('[data-rsave]') && this._dlg) {
        const d = this._dlg; const r = d.r; if (!String(r.title || '').trim()) return;
        const data = { title: r.title, icon: r.icon, cost: Math.round(Number(r.cost) || 0), approval: !!r.approval, persons: r.persons, per_week: Math.round(Number(r.per_week) || 0), ...(RSIZES.includes(r.size) ? { size: r.size } : {}) };
        const res = await this._pinned('family_planer/reward/save', { ...(d.id ? { reward_id: d.id } : {}), data });
        if (res) { this._dlg = null; this._flash(this.T.saved); }
        return;
      }
      if (t.closest('[data-rdel]') && this._dlg) { this._dlg = { kind: 'confirm', id: this._dlg.id, title: this._dlg.r.title }; this._render(); return; }
      if (t.closest('[data-ryes]') && this._dlg) {
        const res = await this._pinned('family_planer/reward/remove', { reward_id: this._dlg.id });
        if (res !== null) { this._dlg = null; this._flash(this.T.saved); }
        return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const s = this._snap();
      if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons; const sel = persons.find((p) => p.id === this._sel) || null;  // nobody selected = everything
      const pts = s.points || {};
      const cards = persons.map((p) => { const x = pts[p.id] || { balance: 0, available: 0, level: 1, name: '', progress: 0, next: null, lifetime: 0 };
        return `<button class="pc${sel && p.id === sel.id ? ' on' : ''}" data-p="${esc(p.id)}" style="--c:${COLOR(p.color)}">${av(p, 52)}
          <div class="pi"><b>${esc(p.name)}</b><span class="lv">${esc(T.lvl)} ${x.level} · ${esc(x.name)}</span>
          <span class="bar"><i style="width:${Math.max(3, x.progress)}%"></i></span>
          <span class="nx">${x.next == null ? esc(T.max) : esc(fmt(T.next, { n: x.next - x.lifetime, l: x.level + 1 }))}</span></div>
          <div class="pt"><strong>${x.balance}</strong><span>${esc(T.pts)}</span>${x.balance !== x.available ? `<em>${esc(fmt(T.reserved, { n: x.balance - x.available }))}</em>` : ''}</div></button>`; }).join('');
      const avail = sel ? (pts[sel.id] || {}).available || 0 : 0;
      const rw = this._edit || !sel ? s.rewards : s.rewards.filter((r) => !r.persons || !r.persons.length || r.persons.includes(sel.id));
      const only = (r) => (r.persons && r.persons.length ? ' · ' + esc(fmt(T.forOnly, { n: r.persons.map((pid) => (persons.find((p) => p.id === pid) || {}).name).filter(Boolean).join(', ') })) : '');
      const edit = this._edit && window.FPPIN.unlocked(this._store);
      if (this._edit && !edit) this._edit = false;
      const shop = edit ? `<div class="shop">${rw.map((r) => `<div class="rw"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}${r.persons && r.persons.length ? ' · ' + esc(r.persons.map((pid) => (persons.find((p) => p.id === pid) || {}).name).filter(Boolean).join(', ')) : ''}</span></div>
          <button class="tb" data-redit="${esc(r.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button></div>`).join('')}
          <button class="rw add" data-redit=""><ha-icon icon="mdi:plus"></ha-icon>${esc(T.add)}</button></div>`
        : !s.rewards.length ? `<div class="empty">${esc(T.none)}</div>` : !sel ? `<div class="hint2">${esc(T.pickHint)}</div><div class="shop">${rw.map((r) => `<div class="rw"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${only(r)}</span></div></div>`).join('')}</div>`
        : `<div class="shop">${rw.map((r) => { const ok = avail >= r.cost;
        return `<div class="rw${ok ? '' : ' lock'}"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}</span>
          ${ok ? '' : `<span class="ms"><span class="bar"><i style="width:${Math.round((avail / r.cost) * 100)}%"></i></span>${esc(fmt(T.missing, { n: r.cost - avail }))}</span>`}</div>
          <button class="rb" data-redeem="${esc(r.id)}" ${ok ? '' : 'disabled'}>${esc(T.redeem)}</button></div>`; }).join('')}</div>`;
      const name = (pid) => (persons.find((p) => p.id === pid) || {}).name || '?';
      const pend = s.requests.filter((q) => q.status === 'pending' && (!sel || q.pid === sel.id));
      const pending = pend.length ? `<div class="sec">${esc(T.pending)}</div><div class="pend">${pend.map((q) => `<div class="pq"><b>${esc(name(q.pid))}</b><span>${esc(q.title)} · ${q.cost} ${esc(T.pts)}</span>
          <button class="sg ok" data-decide="${esc(q.id)}" data-ok="1">${esc(T.approve)}</button><button class="sg" data-decide="${esc(q.id)}" data-ok="0">${esc(T.deny)}</button></div>`).join('')}</div>` : '';
      const hist = sel ? s.ledger.filter((e) => e.pid === sel.id).slice(0, 12) : [];
      const history = hist.length ? `<div class="sec">${esc(T.history)}</div><div class="hist">${hist.map((e) => `<div class="hr"><span class="k">${esc(T.kinds[e.kind] || e.kind)}</span><span class="tx">${esc(e.kind === 'bonus' || e.kind === 'streak' ? '' : e.text)}</span><span class="d">${esc((e.ts || '').slice(5, 10).split('-').reverse().join('.'))}</span><b class="${e.pts < 0 ? 'neg' : ''}">${e.pts > 0 ? '+' : ''}${e.pts}</b></div>`).join('')}</div>` : '';
      const d = this._dlg;
      let dlg = '';
      if (d && d.kind === 'reward') { const r = d.r;
        const icons = ['mdi:gift-outline', 'mdi:ice-cream', 'mdi:controller-classic-outline', 'mdi:television-classic', 'mdi:cash', 'mdi:movie-open-outline', 'mdi:pizza', 'mdi:bed-clock', 'mdi:tablet', 'mdi:book-open-variant', 'mdi:soccer', 'mdi:star-outline'];
        dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(d.id ? r.title : T.add)}</div>
          <label class="fl">${esc(T.rTitle)}<input class="in" data-rf="title" maxlength="60" value="${esc(r.title)}"></label>
          <label class="fl">${esc(T.rIcon)}<span class="icons">${icons.map((i) => `<button class="ib${r.icon === i ? ' on' : ''}" data-ricon="${i}"><ha-icon icon="${i}"></ha-icon></button>`).join('')}</span><input class="in" data-rf="icon" maxlength="70" value="${esc(r.icon)}" placeholder="mdi:…"></label>
          <div class="fl">${esc(T.rCat)}<div class="cats">${[...RSIZES, 'custom'].map((k) => { const n = ((s.sizes || {}).reward || {})[k]; const mv = money(s, k);
            return `<button class="cat${r.size === k ? ' on' : ''}" data-rsize="${k}"><b>${esc(k === 'custom' ? T.own : T.sizes[k])}</b>${k === 'custom' ? '' : `<span>${n} ${esc(T.pts)}${mv ? ` · ${esc(T.approx)} ${esc(mv)}` : ''}</span>`}</button>`; }).join('')}</div><span class="hint">${esc(T.catHint)}</span></div>
          <div class="row2">${r.size === 'custom' ? `<label class="fl">${esc(T.rCost)}<input class="in" type="number" min="1" max="100000" inputmode="numeric" data-rf="cost" value="${esc(r.cost)}"></label>` : ''}
          <label class="fl">${esc(T.rWeek)}<input class="in" type="number" min="0" max="50" inputmode="numeric" data-rf="per_week" value="${esc(r.per_week)}"></label></div>
          <label class="ck"><input type="checkbox" data-rf="approval" ${r.approval ? 'checked' : ''}>${esc(T.rApproval)}</label>
          <div class="fl">${esc(T.rPersons)}<div class="bps">${persons.map((p) => `<button class="chip${r.persons.includes(p.id) ? ' on' : ''}" data-rperson="${esc(p.id)}">${av(p, 22)}${esc(p.name)}</button>`).join('')}</div></div>
          <div class="ea">${d.id ? `<button class="sg del" data-rdel>${esc(T.del)}</button>` : ''}<span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-rsave>${esc(T.save)}</button></div></div></div>`; }
      if (d && d.kind === 'confirm') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(T.delAsk, { t: d.title }))}</div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-ryes>${esc(T.del)}</button></div></div></div>`;
      if (d && d.kind === 'bonus') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(T.bonus)}</div>
          <div class="bps">${persons.map((p) => `<button class="chip${p.id === d.person ? ' on' : ''}" data-bperson="${esc(p.id)}">${av(p, 22)}${esc(p.name)}</button>`).join('')}</div>
          <div class="cats">${['s', 'm', 'l'].map((k) => { const n = ((s.sizes || {}).todo || {})[k] || 0; const on = Math.abs(Number(d.points)) === n;
            return `<button class="cat${on ? ' on' : ''}" data-bsize="${k}"><b>${esc(T.sizes[k])}</b><span>${d.neg ? '−' : '+'}${n} ${esc(T.pts)}</span></button>`; }).join('')}
            <button class="cat${d.neg ? ' on neg' : ''}" data-bneg><b>${esc(T.minus)}</b><span>−</span></button></div>
          <div class="br"><input class="in num" data-bp type="number" value="${esc(d.points)}" inputmode="numeric"><input class="in" data-br placeholder="${esc(T.reason)}" value="${esc(d.reason || '')}" maxlength="80"></div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-give>${esc(T.give)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:18px;font-family:${FONT};color:#ececec;position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:12px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid #333;background:#262626;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
.cats{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.cat{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:92px;padding:8px 12px;border-radius:12px;border:1px solid #3a3a3a;background:#262626;color:#ccc;font:inherit;font-size:13px;cursor:pointer;text-align:left}
        .cat b{font-weight:600;color:#eee}.cat span{font-size:11px;color:#999}.cat.on{border-color:#69C350;background:#202820}.cat.on span{color:#a7dc93}.cat.neg{border-color:#E06B6B;background:#3a2626}
        .hint{display:block;font-size:11px;color:#888;margin-top:2px}
        .people{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
        .pc{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px solid #2a2a2a;background:#232323;color:inherit;font:inherit;text-align:left;cursor:pointer;border-left:4px solid var(--c)}
        .pc.on{border-color:var(--c);background:#262626}
        .pi{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.pi b{font-size:16px}
        .lv{font-size:12px;color:#aaa}.nx{font-size:11px;color:#777}
        .bar{display:block;height:6px;border-radius:3px;background:#333;overflow:hidden}.bar i{display:block;height:100%;background:${G};border-radius:3px}
        .pt{display:flex;flex-direction:column;align-items:flex-end}.pt strong{font-size:28px;line-height:1;color:${G}}.pt span{font-size:11px;color:#888}.pt em{font-style:normal;font-size:10px;color:#E0A84F}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
        .rw{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:#262626;border:1px solid #2a2a2a}
        .ri{width:48px;height:48px;border-radius:12px;background:rgba(105,195,80,.16);color:${G};display:flex;align-items:center;justify-content:center;flex:none}.ri ha-icon{--mdc-icon-size:26px}
        .rw.lock .ri{background:#2e2e2e;color:#777}
        .rt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.rt b{font-size:15px}.rt span{font-size:12px;color:#999}.ms{display:flex;flex-direction:column;gap:3px}
        .rb{height:40px;padding:0 16px;border-radius:10px;border:none;background:${G};color:#141414;font:inherit;font-weight:600;cursor:pointer}
        .rb[disabled]{background:#333;color:#777;cursor:default}
        .pend,.hist{display:flex;flex-direction:column;gap:6px}.hint2{font-size:13px;color:#999;margin:0 2px 8px}
        .pq{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:#262626;border:1px dashed #4a4a4a}.pq span{flex:1;color:#bbb;font-size:14px}
        .hr{display:grid;grid-template-columns:110px 1fr 60px 60px;gap:8px;align-items:center;padding:8px 12px;border-radius:9px;background:#232323;font-size:13px}
        .hr .k{color:#aaa}.hr .tx{color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hr .d{color:#777}.hr b{text-align:right;color:${G}}.hr b.neg{color:#E06B6B}
        .empty{color:#888;padding:20px 10px;font-size:14px;line-height:1.5}
        .sg{height:38px;border-radius:19px;background:#2e2e2e;border:1px solid #3a3a3a;color:#ccc;font:inherit;font-size:13px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:#141414;font-weight:600}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:16px;display:flex;align-items:flex-start;justify-content:center;padding-top:50px;z-index:4}
        .dlg{background:#232323;border:1px solid #3a3a3a;border-radius:14px;padding:18px;width:min(460px,92%)}
        .dlg.pin{width:280px;text-align:center}.dh{font-size:15px;font-weight:600;margin-bottom:12px}
        .dots{display:flex;gap:10px;justify-content:center;margin:6px 0 14px}.dots i{width:12px;height:12px;border-radius:50%;border:2px solid #5a5a5a}.dots i.on{background:${G};border-color:${G}}
        .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
        .key{height:54px;border-radius:12px;border:1px solid #3a3a3a;background:#2e2e2e;color:#eee;font:inherit;font-size:20px;cursor:pointer}.key.okk{background:${G};color:#141414;font-size:15px;font-weight:600}
        .bps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
        .chip{display:flex;align-items:center;gap:6px;height:38px;padding:0 12px 0 6px;border-radius:19px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font:inherit;font-size:14px;cursor:pointer}.chip.on{border-color:${G};color:${G}}
        .br{display:flex;gap:8px}.in{flex:1;height:42px;border-radius:10px;border:1px solid #333;background:#141414;color:#eee;font:inherit;font-size:15px;padding:0 12px;outline:none;min-width:0}.in.num{flex:none;width:90px}
        .ea{display:flex;gap:8px;margin-top:14px}.sp{flex:1}
        .msg{position:absolute;left:50%;transform:translateX(-50%);top:12px;background:#2e3a2a;border:1px solid ${G};color:#dfe;padding:8px 16px;border-radius:10px;font-size:13px;z-index:5;max-width:80%}
        .msg.e{background:#3a2626;border-color:#E06B6B}
        .warn{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:rgba(224,168,79,.14);border:1px solid #E0A84F;color:#f0d3a0;font-size:14px;margin-bottom:12px}.warn span{flex:1}
        .rw.add{justify-content:center;gap:8px;border:1px dashed #4a4a4a;background:transparent;color:#bbb;font:inherit;font-size:14px;cursor:pointer;min-height:72px}
        .fl{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#aaa;margin-bottom:12px}.fl .in{flex:none;width:100%;box-sizing:border-box}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .ck{display:flex;align-items:center;gap:10px;font-size:14px;margin-bottom:12px;cursor:pointer}.ck input{width:20px;height:20px;accent-color:${G}}
        .icons{display:flex;flex-wrap:wrap;gap:6px}.ib{width:40px;height:40px;border-radius:10px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ccc;cursor:pointer;display:flex;align-items:center;justify-content:center}.ib.on{border-color:${G};color:${G}}
        .sg.del{background:#3a2626;border-color:#E06B6B;color:#f3b4b4}
        .dlg{max-height:calc(100% - 70px);overflow:auto}
      </style>
      <div class="card">
        <div class="top"><h2>${esc(T.title)}</h2>${edit ? `<button class="tb" data-chpin><ha-icon icon="mdi:form-textbox-password"></ha-icon>${esc(T.changePin)}</button>` : ''}
          <button class="tb" data-edit><ha-icon icon="${edit ? 'mdi:check' : 'mdi:pencil-outline'}"></ha-icon>${esc(edit ? T.editDone : T.edit)}</button>
          <button class="tb" data-bonus><ha-icon icon="mdi:star-plus-outline"></ha-icon>${esc(T.bonus)}</button></div>
        ${s.pin_default ? `<div class="warn"><ha-icon icon="mdi:shield-alert-outline"></ha-icon><span>${esc(T.startPin)}</span><button class="sg ok" data-chpin>${esc(T.changePin)}</button></div>` : ''}
        <div class="people">${cards}</div>
        ${pending}
        <div class="sec">${esc(sel ? fmt(T.shop, { name: sel.name }) : T.shopAll)}</div>${shop}
        ${history}
        ${dlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-rewards-inner')) customElements.define('fp-rewards-inner', FpRewardsInner);
})();
