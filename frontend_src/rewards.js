// ---------------------------------------------------------------------------
// Points & rewards card: levels, trophies, reward shop per person, parent approval (admin or PIN), history
// rendered inside custom:family-planer-card (view: rewards)
// ---------------------------------------------------------------------------
(() => {
  const G = '#69C350';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { title: 'Punkte & Belohnungen', pts: 'Punkte', lvl: 'Level', next: 'noch {n} bis Level {l}', max: 'Höchstes Level erreicht!',
      shop: 'Belohnungen für {name}', shopAll: 'Alle Belohnungen', forAll: 'Für alle', pickHint: 'Person antippen, um ihre Belohnungen zu sehen und einzulösen.', forOnly: 'nur für {n}', redeem: 'Einlösen', missing: 'noch {n} Punkte', approval: 'mit Freigabe', noapproval: 'sofort',
      week: 'max. {n}× pro Woche', none: 'Noch keine Belohnungen. Mit „+ Belohnung“ auf einer Person anlegen (Eltern-PIN); ohne Auswahl im Dialog gilt sie für alle.',
      pending: 'Wartet auf Freigabe', approve: 'Freigeben', deny: 'Ablehnen', history: 'Verlauf', bonus: 'Punkte geben',
      pin: 'Eltern-PIN', ok: 'OK', cancel: 'Abbrechen', reason: 'Grund (optional)', give: 'Vergeben',
      sent: '„{t}“ angefragt – die Eltern werden benachrichtigt.', done: '„{t}“ eingelöst. Viel Spass!', approved: 'Freigegeben', denied: 'Abgelehnt',
      reserved: '{n} reserviert', err: { not_enough_points: 'Nicht genug Punkte.', weekly_limit: 'Diese Woche schon so oft eingelöst.', not_allowed: 'Diese Belohnung ist nicht für dich.', unauthorized: 'Falsche PIN oder keine Berechtigung.', pin_wrong: 'Falsche PIN.', pin_locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.' },
      kinds: { chore: 'Ämtli', bonus: 'Tagesbonus', streak: 'Serienbonus', adjust: 'Bonus', reward: 'Belohnung', carry: 'Übertrag', todo: 'To-do', award: 'Auszeichnung' },
      edit: 'Bearbeiten', editDone: 'Fertig', add: 'Neue Belohnung', changePin: 'PIN ändern', del: 'Löschen', save: 'Speichern',
      rTitle: 'Belohnung', rIcon: 'Icon', rCost: 'Kosten in Punkten', rApproval: 'Eltern müssen freigeben', rPersons: 'Nur für (leer = alle)', rWeek: 'Höchstens pro Woche (0 = unbegrenzt)',
      delAsk: '„{t}“ wirklich löschen? Offene Anfragen dafür werden abgelehnt.', saved: 'Gespeichert.', pinChanged: 'Eltern-PIN geändert.',
      startPin: 'Die Start-PIN 123456 ist noch aktiv. Bitte jetzt eine eigene Eltern-PIN festlegen – vorher sind Belohnungen und Einstellungen gesperrt.',
      rCat: 'Kategorie', own: 'Eigene Punkte', approx: 'ca.', minus: 'Abziehen',
      sizes: { s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Mega gross', xxl: 'Riesig' },
      catHint: 'Gross = so viel, wie man in einem Monat mit allen Ämtli verdient (inkl. Boni). Die Punkte passen sich an, wenn die Punkte-Einstellungen ändern.',
      open: 'Noch zu gewinnen', fam: 'Familie', per: { week: 'jede Woche', month: 'jeden Monat', reach: 'beim Erreichen', day: 'jeden Tag' }, lead: 'Vorne: {n}', noLead: 'Noch niemand vorne',
      units: { pct: '{n} %', days: '{n} Tage', chores: '{n} Ämtli' }, worth: '+{n} Punkte', addFor: 'Belohnung', saving: 'Spart für', waiting: 'Wartet auf Freigabe',
      ready: 'Jetzt einlösbar', inDays: 'in ca. {n} Tagen', inDay: 'morgen', noPace: 'noch keine Prognose', nothing: 'Noch nichts am Laufen',
      fc: 'Prognose', fcFam: 'Familienschnitt ({p} Punkte/Tag): ca. {n} Tage', fcNow: 'jetzt', awards: 'Auszeichnungen', noAw: 'Noch keine – siehe oben, was es zu gewinnen gibt.' },
    en: { title: 'Points & rewards', pts: 'points', lvl: 'Level', next: '{n} more to level {l}', max: 'Highest level reached!',
      shop: 'Rewards for {name}', shopAll: 'All rewards', forAll: 'For everyone', pickHint: 'Tap a person to see and redeem their rewards.', forOnly: 'only for {n}', redeem: 'Redeem', missing: '{n} points to go', approval: 'needs approval', noapproval: 'instant',
      week: 'max. {n}× per week', none: 'No rewards yet. Add one with "+ Reward" on a person (parent PIN); with nobody chosen in the dialog it is for everyone.',
      pending: 'Waiting for approval', approve: 'Approve', deny: 'Decline', history: 'History', bonus: 'Give points',
      pin: 'Parent PIN', ok: 'OK', cancel: 'Cancel', reason: 'Reason (optional)', give: 'Give',
      sent: '"{t}" requested – the parents are notified.', done: '"{t}" redeemed. Have fun!', approved: 'Approved', denied: 'Declined',
      reserved: '{n} reserved', err: { not_enough_points: 'Not enough points.', weekly_limit: 'Already redeemed that often this week.', not_allowed: 'This reward is not for you.', unauthorized: 'Wrong PIN or not allowed.', pin_wrong: 'Wrong PIN.', pin_locked: 'Too many wrong tries – please wait 5 minutes.' },
      kinds: { chore: 'Chore', bonus: 'Day bonus', streak: 'Streak bonus', adjust: 'Bonus', reward: 'Reward', carry: 'Carried over', todo: 'To-do', award: 'Award' },
      edit: 'Edit', editDone: 'Done', add: 'New reward', changePin: 'Change PIN', del: 'Delete', save: 'Save',
      rTitle: 'Reward', rIcon: 'Icon', rCost: 'Cost in points', rApproval: 'Parents must approve', rPersons: 'Only for (empty = everyone)', rWeek: 'At most per week (0 = unlimited)',
      delAsk: 'Really delete "{t}"? Pending requests for it are declined.', saved: 'Saved.', pinChanged: 'Parent PIN changed.',
      startPin: 'The start PIN 123456 is still active. Please choose your own parent PIN now – until then rewards and settings are locked.',
      rCat: 'Category', own: 'Own points', approx: 'approx.', minus: 'Take away',
      sizes: { s: 'Small', m: 'Medium', l: 'Large', xl: 'Mega', xxl: 'Giant' },
      catHint: 'Large = what you earn in a month with every chore done (incl. bonuses). Points follow the point settings automatically.',
      open: 'Still to win', fam: 'Family', per: { week: 'every week', month: 'every month', reach: 'when reached', day: 'every day' }, lead: 'Ahead: {n}', noLead: 'Nobody ahead yet',
      units: { pct: '{n} %', days: '{n} days', chores: '{n} chores' }, worth: '+{n} points', addFor: 'Reward', saving: 'Saving for', waiting: 'Waiting for approval',
      ready: 'Can be redeemed now', inDays: 'in about {n} days', inDay: 'tomorrow', noPace: 'no forecast yet', nothing: 'Nothing running yet',
      fc: 'Forecast', fcFam: 'Family average ({p} points/day): about {n} days', fcNow: 'now', awards: 'Awards', noAw: 'None yet – see above what there is to win.' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const RSIZES = ['s', 'm', 'l', 'xl', 'xxl'];
  const UNIT = { crown: 'pct', climber: 'pct', perfect: 'pct', weekend: 'pct', trophy: 'pct', bee: 'days', early: 'days', diamond: 'days', milestone: 'chores' };
  const MILES = [100, 500, 1000];
  // days until a person can afford `cost` at their current pace (null = no pace yet)
  const daysTo = (s, pid, cost) => { const pace = s.pace || {}; const have = ((s.points || {})[pid] || {}).available || 0; if (have >= cost) return 0;
    const v = (pace.persons || {})[pid] || pace.family || 0; return v > 0 ? Math.ceil((cost - have) / v) : null; };
  const money = (s, k) => { const z = s.sizes || {}; const v = (z.values || {})[k]; return v ? `${Number(v).toLocaleString('de-CH', { maximumFractionDigits: 2 })} ${z.currency || ''}`.trim() : ''; };
  const av = (p, size) => (window.FPX && window.FPX.avatarHtml
    ? window.FPX.avatarHtml({ name: p.name, farbe: COLOR(p.color), bild: /^(av:[a-z0-9.+]+|av2:[a-z0-9.]+|svg:[a-z-]+|img:\/family_planer_files\/avatars\/[a-z0-9_]+\.(jpg|png|webp))$/.test(p.image || '') ? p.image : '' }, size)
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
      const er0 = t.closest('[data-redit]');
      if (er0) { const r = s.rewards.find((x) => x.id === er0.dataset.redit); if (r) { this._dlg = { kind: 'reward', id: r.id, r: { ...r, size: r.size || 'custom', persons: [...(r.persons || [])] } }; this._render(); } return; }
      const ra = t.closest('[data-radd]');
      if (ra) { const r = { title: '', icon: 'mdi:gift-outline', size: 's', cost: ((s.sizes || {}).reward || {}).s || 100, approval: true, persons: [ra.dataset.radd], per_week: 0 };
        this._dlg = { kind: 'reward', id: null, r }; this._render(); return; }
      const pc = t.closest('[data-p]'); if (pc) { this._sel = this._sel === pc.dataset.p ? null : pc.dataset.p; this._render(); return; }
      const rd = t.closest('[data-redeem]');
      if (rd) {
        const r = s.rewards.find((x) => x.id === rd.dataset.redeem); const pid = this._sel; if (!pid) return;
        try { const res = await this._store.ws('family_planer/reward/redeem', { person_id: pid, reward_id: r.id }); this._flash(fmt(res.status === 'approved' ? this.T.done : this.T.sent, { t: r.title })); } catch (er) { this._flash(this._errText(er), true); }
        return;
      }
      const dc = t.closest('[data-decide]');
      if (dc) { const id = dc.dataset.decide; const approve = dc.dataset.ok === '1'; this._parent((extra) => this._store.ws('family_planer/reward/decide', { request_id: id, approve, ...extra }).then(() => this._flash(approve ? this.T.approved : this.T.denied)).catch((er) => this._flash(this._errText(er), true))); return; }
      if (t.closest('[data-chpin]')) {
        try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); }
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
      const FX = (this._cfg.lang === 'en' ? window.FPX_EN : window.FPX) || window.FPX || {}; const AWT = FX.AWT || {}; const AWR = FX.AWR || [];
      const et = (s.settings || {}).early_time || '12:00'; const apts = s.award_points || {};
      const awName = (id, v) => String((AWT[id] || [id])[0]).replace(/\{n\}/g, v == null ? '' : v);
      const medal = (a, big) => `<span class="md${big ? ' big' : ''}" style="--mc:${COLOR(a.color)}" title="${esc(awName(a.id, a.value))}"><ha-icon icon="${esc(a.icon)}"></ha-icon></span>`;
      const ring = (p, size) => { const r = (s.awards || {})[p.id] || {}; const fr = ['platinum', 'gold', 'silver', 'bronze'].includes(r.frame) ? r.frame : '';
        const crown = (r.list || []).some((a) => a.id === 'crown');
        return `<div class="ring${fr ? ' fr-' + fr : ''}" style="width:${size}px;height:${size}px"><span class="ava" style="width:${size}px;height:${size}px">${av(p, size)}</span>${String(p.image || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(p.image) : ''}${crown ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>`; };
      const forP = (r, pid) => !r.persons || !r.persons.length || r.persons.includes(pid);
      const eta = (pid, cost) => { const d = daysTo(s, pid, cost); return d === 0 ? T.ready : d == null ? T.noPace : d === 1 ? T.inDay : fmt(T.inDays, { n: d }); };
      // what is running for a person: requests waiting for approval, rewards made for them, else the next goal
      const running = (p) => { const x = pts[p.id] || {}; const have = x.available || 0;
        const wait = s.requests.filter((q) => q.status === 'pending' && q.pid === p.id).map((q) => `<div class="run w"><ha-icon icon="mdi:timer-sand"></ha-icon><span><b>${esc(q.title)}</b><em>${esc(T.waiting)}</em></span></div>`);
        let goals = s.rewards.filter((r) => r.persons && r.persons.includes(p.id));
        if (!goals.length) goals = s.rewards.filter((r) => forP(r, p.id) && r.cost > have).sort((u, v) => u.cost - v.cost).slice(0, 1);
        const g = goals.slice(0, 3 - Math.min(wait.length, 2)).map((r) => `<div class="run" data-redit="${esc(r.id)}" role="button"><ha-icon icon="${esc(r.icon)}"></ha-icon><span><b>${esc(r.title)}</b>
          <i class="bar"><i style="width:${Math.min(100, Math.round((have / Math.max(1, r.cost)) * 100))}%"></i></i><em>${Math.min(have, r.cost)} / ${r.cost} · ${esc(eta(p.id, r.cost))}</em></span></div>`);
        const all = [...wait, ...g]; return all.length ? all.join('') : `<div class="run none">${esc(T.nothing)}</div>`; };
      const cards = persons.map((p) => { const x = pts[p.id] || { balance: 0, available: 0, level: 1, name: '', progress: 0, next: null, lifetime: 0 };
        const aw = ((s.awards || {})[p.id] || {}).list || [];
        return `<div class="pc${sel && p.id === sel.id ? ' on' : ''}" data-p="${esc(p.id)}" role="button" tabindex="0" style="--c:${COLOR(p.color)}">
          <div class="ph">${ring(p, 56)}
          <div class="pi"><b>${esc(p.name)}</b><span class="lv"><i class="tierdot" style="background:${COLOR(x.tier_color)}"></i>${esc(T.lvl)} ${x.level} · ${esc(x.name)}</span>
          <span class="bar"><i style="width:${Math.max(3, x.progress)}%"></i></span>
          <span class="nx">${x.next == null ? esc(T.max) : esc(fmt(T.next, { n: x.next - (x.xp != null ? x.xp : x.lifetime), l: x.level + 1 }))}</span></div>
          <div class="pt"><strong>${x.balance}</strong><span>${esc(T.pts)}</span>${x.balance !== x.available ? `<em>${esc(fmt(T.reserved, { n: x.balance - x.available }))}</em>` : ''}</div></div>
          ${aw.length ? `<div class="mds">${aw.slice(0, 6).map((a) => medal(a)).join('')}${aw.length > 6 ? `<span class="mdm">+${aw.length - 6}</span>` : ''}</div>` : ''}
          <div class="runs">${running(p)}</div>
          <button class="add1" data-radd="${esc(p.id)}"><ha-icon icon="mdi:plus"></ha-icon>${esc(T.addFor)}</button></div>`; }).join('');
      const oa = (s.open_awards || []).filter((a) => AWR.some((r) => r[0] === a.id));
      const openAw = oa.length ? `<div class="sec">${esc(T.open)}</div><div class="oas">${oa.map((a) => { const rule = (AWR.find((r) => r[0] === a.id) || [])[4] || '';
          const lp = persons.find((p) => p.id === a.leader); const u = T.units[UNIT[a.id]] || '{n}';
          const nm = a.id === 'milestone' ? awName('milestone', MILES.find((m) => m > (a.value || 0)) || 1000) : awName(a.id, a.id === 'diamond' ? 30 : '');
          return `<div class="oa" style="--mc:${COLOR(a.color)}">${medal(a, true)}<div class="ot"><b>${esc(nm)}</b><span>${esc(rule.replace('{t}', et))}</span>
            <span class="om"><em>${esc(T.per[a.period] || '')}</em>${apts[a.id] ? `<em class="pp">${esc(fmt(T.worth, { n: apts[a.id] }))}</em>` : ''}
            ${lp && a.value ? `<em class="ld">${av(lp, 18)}${esc(fmt(T.lead, { n: lp.name }))} · ${esc(fmt(u, { n: a.value }))}</em>` : `<em>${esc(T.noLead)}</em>`}</span></div></div>`; }).join('')}</div>` : '';
      const selAw = sel ? (((s.awards || {})[sel.id] || {}).list || []) : [];
      const detail = sel ? `<div class="sec">${esc(T.awards)} · ${esc(sel.name)}</div>${selAw.length ? `<div class="oas">${selAw.map((a) => { const tx = AWT[a.id] || [a.id, ''];
          const f = (x) => String(x).replace(/\{n\}/g, a.value == null ? '' : a.value).replace('{t}', et);
          return `<div class="oa won" style="--mc:${COLOR(a.color)}">${medal(a, true)}<div class="ot"><b>${esc(f(tx[0]))}</b><span>${esc(f(tx[1]))}</span>${a.since ? `<span class="om"><em>${esc(String(a.since).slice(0, 10).split('-').reverse().join('.'))}</em></span>` : ''}</div></div>`; }).join('')}</div>` : `<div class="hint2">${esc(T.noAw)}</div>`}` : '';
      const avail = sel ? (pts[sel.id] || {}).available || 0 : 0;
      const rw = !sel ? s.rewards : s.rewards.filter((r) => !r.persons || !r.persons.length || r.persons.includes(sel.id));
      const pen = (r) => `<button class="pen" data-redit="${esc(r.id)}" title="${esc(T.edit)}" aria-label="${esc(T.edit)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>`;
      const shop = !s.rewards.length ? `<div class="empty">${esc(T.none)}</div>` : !sel ? `<div class="hint2">${esc(T.pickHint)}</div><div class="shop">${rw.map((r) => { const who = (r.persons && r.persons.length ? persons.filter((p) => r.persons.includes(p.id)) : []);
          return `<div class="rw"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}</span>
          <span class="who">${who.length ? who.map((p) => `<button class="wp" data-p="${esc(p.id)}" style="--c:${COLOR(p.color)}">${av(p, 20)}${esc(p.name)}</button>`).join('') : `<em class="wa">${esc(T.forAll)}</em>`}</span></div>${pen(r)}</div>`; }).join('')}</div>`
        : `<div class="shop">${rw.map((r) => { const ok = avail >= r.cost;
        return `<div class="rw${ok ? '' : ' lock'}"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}</span>
          ${ok ? '' : `<span class="ms"><span class="bar"><i style="width:${Math.round((avail / r.cost) * 100)}%"></i></span>${esc(fmt(T.missing, { n: r.cost - avail }))}</span>`}</div>
          ${pen(r)}<button class="rb" data-redeem="${esc(r.id)}" ${ok ? '' : 'disabled'}>${esc(T.redeem)}</button></div>`; }).join('')}</div>`;
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
          ${(() => { const cost = Math.max(1, Math.round(Number(r.cost) || 0)); const fam = (s.pace || {}).family || 0;
            const who = (r.persons.length ? persons.filter((p) => r.persons.includes(p.id)) : persons.filter((p) => p.role !== 'adult'));
            return `<div class="fc"><b>${esc(T.fc)}</b>${fam > 0 ? `<span>${esc(fmt(T.fcFam, { p: Math.round(fam), n: Math.ceil(cost / fam) }))}</span>` : `<span>${esc(T.noPace)}</span>`}
              <span class="fcp">${who.map((p) => { const dd = daysTo(s, p.id, cost); return `<em>${av(p, 18)}${esc(p.name)}: ${esc(dd === 0 ? T.fcNow : dd == null ? '–' : '~' + dd + (this._cfg.lang === 'en' ? ' d' : ' T'))}</em>`; }).join('')}</span></div>`; })()}
          <div class="ea">${d.id ? `<button class="sg del" data-rdel>${esc(T.del)}</button>` : ''}<span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-rsave>${esc(T.save)}</button></div></div></div>`; }
      if (d && d.kind === 'confirm') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(T.delAsk, { t: d.title }))}</div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-ryes>${esc(T.del)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        ${(window.FPX || {}).AWCSS || ''}
        .card{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:18px;font-family:${FONT};color:#ececec;position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:12px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid #333;background:#262626;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
.cats{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.cat{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:92px;padding:8px 12px;border-radius:12px;border:1px solid #3a3a3a;background:#262626;color:#ccc;font:inherit;font-size:13px;cursor:pointer;text-align:left}
        .cat b{font-weight:600;color:#eee}.cat span{font-size:11px;color:#999}.cat.on{border-color:#69C350;background:#202820}.cat.on span{color:#a7dc93}.cat.neg{border-color:#E06B6B;background:#3a2626}
        .hint{display:block;font-size:11px;color:#888;margin-top:2px}
        .people{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
        .pc{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:14px;border:1px solid #2a2a2a;background:#232323;color:inherit;font:inherit;text-align:left;cursor:pointer;border-left:4px solid var(--c)}
        .ph{display:flex;align-items:center;gap:12px}
        .mds{display:flex;flex-wrap:wrap;gap:5px}.md{width:28px!important;height:28px!important}.md ha-icon{--mdc-icon-size:17px!important}.md.big{width:44px!important;height:44px!important}.md.big ha-icon{--mdc-icon-size:26px!important}.mdm{font-size:12px;color:#888;align-self:center}
        .runs{display:flex;flex-direction:column;gap:6px}
        .run{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:#262626;font-size:13px}.run>ha-icon{color:var(--c);flex:none}
        .run span{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.run b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.run em{font-style:normal;font-size:11px;color:#999}
        .run.w{border:1px dashed #E0A84F}.run.w>ha-icon{color:#E0A84F}.run.none{color:#777;font-size:12px;justify-content:center}
        .add1{display:flex;align-items:center;justify-content:center;gap:6px;height:38px;border-radius:10px;border:1px dashed #4a4a4a;background:transparent;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        .oas{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
        .oa{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a;border-top:3px solid color-mix(in srgb,var(--mc) 70%,transparent)}
        .oa:not(.won) .md{filter:saturate(.75)}.ot{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.ot b{font-size:14px}.ot>span{font-size:12px;color:#aaa;line-height:1.35}
        .om{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}.om em{font-style:normal;font-size:11px;color:#999;background:#2b2b2b;border-radius:9px;padding:2px 8px;display:inline-flex;align-items:center;gap:5px}.om em.pp{color:${G}}
        .fc{display:flex;flex-direction:column;gap:5px;padding:10px 12px;border-radius:10px;background:#2b2b2b;font-size:12px;color:#bbb;margin-bottom:6px}.fc b{color:#eee;font-size:12px}
        .fcp{display:flex;flex-wrap:wrap;gap:6px}.fcp em{font-style:normal;display:inline-flex;align-items:center;gap:5px;background:#232323;border-radius:12px;padding:2px 9px 2px 3px}
        .pc.on{border-color:var(--c);background:#262626}
        .pi{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.pi b{font-size:16px}
        .lv{font-size:12px;color:#aaa;display:flex;align-items:center;gap:5px}.tierdot{width:9px;height:9px;border-radius:50%;display:inline-block;box-shadow:0 0 4px rgba(255,255,255,.3)}.nx{font-size:11px;color:#777}
        .bar{display:block;height:6px;border-radius:3px;background:#333;overflow:hidden}.bar i{display:block;height:100%;background:${G};border-radius:3px}
        .pt{display:flex;flex-direction:column;align-items:flex-end}.pt strong{font-size:28px;line-height:1;color:${G}}.pt span{font-size:11px;color:#888}.pt em{font-style:normal;font-size:10px;color:#E0A84F}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
        .rw{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:#262626;border:1px solid #2a2a2a}
        .ri{width:48px;height:48px;border-radius:12px;background:rgba(105,195,80,.16);color:${G};display:flex;align-items:center;justify-content:center;flex:none}.ri ha-icon{--mdc-icon-size:26px}
        .rw.lock .ri{background:#2e2e2e;color:#777}
        .rt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.rt b{font-size:15px}.rt span{font-size:12px;color:#999}.ms{display:flex;flex-direction:column;gap:3px}
        .pen{width:36px;height:36px;flex:none;border-radius:10px;border:1px solid #333;background:transparent;color:#999;cursor:pointer;display:flex;align-items:center;justify-content:center}.pen ha-icon{--mdc-icon-size:18px}
        .run[data-redit]{cursor:pointer}
        .rb{height:40px;padding:0 16px;border-radius:10px;border:none;background:${G};color:#141414;font:inherit;font-weight:600;cursor:pointer}
        .rb[disabled]{background:#333;color:#777;cursor:default}
        .pend,.hist{display:flex;flex-direction:column;gap:6px}.hint2{font-size:13px;color:#999;margin:0 2px 8px}
        .who{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.wp{display:flex;align-items:center;gap:5px;height:26px;padding:0 9px 0 3px;border-radius:13px;border:1px solid var(--c);background:transparent;color:var(--c);font:inherit;font-size:12px;cursor:pointer}
        .wa{font-style:normal;font-size:12px;color:#999;border:1px dashed #555;border-radius:13px;padding:3px 9px}
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
        <div class="top"><h2>${esc(T.title)}</h2></div>
        ${s.pin_default ? `<div class="warn"><ha-icon icon="mdi:shield-alert-outline"></ha-icon><span>${esc(T.startPin)}</span><button class="sg ok" data-chpin>${esc(T.changePin)}</button></div>` : ''}
        <div class="people">${cards}</div>
        ${detail}
        ${openAw}
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
