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
      shop: 'Belohnungen für {name}', redeem: 'Einlösen', missing: 'noch {n} Punkte', approval: 'mit Freigabe', noapproval: 'sofort',
      week: 'max. {n}× pro Woche', none: 'Noch keine Belohnungen. Eltern legen sie unter Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Wochenplan → Punkte & Belohnungen an.',
      pending: 'Wartet auf Freigabe', approve: 'Freigeben', deny: 'Ablehnen', history: 'Verlauf', bonus: 'Punkte geben',
      pin: 'Eltern-PIN', ok: 'OK', cancel: 'Abbrechen', reason: 'Grund (optional)', give: 'Vergeben',
      sent: '„{t}“ angefragt – die Eltern werden benachrichtigt.', done: '„{t}“ eingelöst. Viel Spass!', approved: 'Freigegeben', denied: 'Abgelehnt',
      reserved: '{n} reserviert', err: { not_enough_points: 'Nicht genug Punkte.', weekly_limit: 'Diese Woche schon so oft eingelöst.', not_allowed: 'Diese Belohnung ist nicht für dich.', unauthorized: 'Falsche PIN oder keine Berechtigung.' },
      kinds: { chore: 'Ämtli', bonus: 'Tagesbonus', streak: 'Serienbonus', adjust: 'Bonus', reward: 'Belohnung', carry: 'Übertrag' }, nopin: 'Für die Freigabe am Tablet zuerst eine Eltern-PIN festlegen (Konfigurieren → Punkte & Belohnungen).' },
    en: { title: 'Points & rewards', pts: 'points', lvl: 'Level', next: '{n} more to level {l}', max: 'Highest level reached!',
      shop: 'Rewards for {name}', redeem: 'Redeem', missing: '{n} points to go', approval: 'needs approval', noapproval: 'instant',
      week: 'max. {n}× per week', none: 'No rewards yet. Parents add them under Settings → Devices & services → Family Planer → Configure → Week plan → Points & rewards.',
      pending: 'Waiting for approval', approve: 'Approve', deny: 'Decline', history: 'History', bonus: 'Give points',
      pin: 'Parent PIN', ok: 'OK', cancel: 'Cancel', reason: 'Reason (optional)', give: 'Give',
      sent: '"{t}" requested – the parents are notified.', done: '"{t}" redeemed. Have fun!', approved: 'Approved', denied: 'Declined',
      reserved: '{n} reserved', err: { not_enough_points: 'Not enough points.', weekly_limit: 'Already redeemed that often this week.', not_allowed: 'This reward is not for you.', unauthorized: 'Wrong PIN or not allowed.' },
      kinds: { chore: 'Chore', bonus: 'Day bonus', streak: 'Streak bonus', adjust: 'Bonus', reward: 'Reward', carry: 'Carried over' }, nopin: 'To approve on the tablet, set a parent PIN first (Configure → Points & rewards).' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const av = (p, size) => (window.FPX && window.FPX.avatarHtml
    ? window.FPX.avatarHtml({ name: p.name, farbe: COLOR(p.color), bild: /^(av:[a-z0-9.+]+|svg:[a-z-]+|img:\/family_planer_files\/avatars\/[a-z0-9_]+\.(jpg|png|webp))$/.test(p.image || '') ? p.image : '' }, size)
    : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${p.color};display:inline-block"></span>`);

  class FpRewardsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { const d = e.target.dataset; if (d.bp !== undefined) this._dlg.points = e.target.value; if (d.br !== undefined) this._dlg.reason = e.target.value; });
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
    async _parent(action) {
      // admins act directly; everyone else needs the parent PIN
      if (this._isAdmin()) return action({});
      const s = this._snap(); if (!s.pin_set) { this._flash(this.T.nopin, true); return null; }
      this._dlg = { kind: 'pin', pin: '', then: action }; this._render(); return null;
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const pc = t.closest('[data-p]'); if (pc) { this._sel = pc.dataset.p; this._render(); return; }
      const rd = t.closest('[data-redeem]');
      if (rd) {
        const r = s.rewards.find((x) => x.id === rd.dataset.redeem); const pid = this._sel || (s.persons[0] && s.persons[0].id);
        try { const res = await this._store.ws('family_planer/reward/redeem', { person_id: pid, reward_id: r.id }); this._flash(fmt(res.status === 'approved' ? this.T.done : this.T.sent, { t: r.title })); } catch (er) { this._flash(this._errText(er), true); }
        return;
      }
      const dc = t.closest('[data-decide]');
      if (dc) { const id = dc.dataset.decide; const approve = dc.dataset.ok === '1'; this._parent((extra) => this._store.ws('family_planer/reward/decide', { request_id: id, approve, ...extra }).then(() => this._flash(approve ? this.T.approved : this.T.denied)).catch((er) => this._flash(this._errText(er), true))); return; }
      if (t.closest('[data-bonus]')) { this._dlg = { kind: 'bonus', points: '10', reason: '', person: this._sel || (s.persons[0] && s.persons[0].id) }; this._render(); return; }
      const bp = t.closest('[data-bperson]'); if (bp && this._dlg) { this._dlg.person = bp.dataset.bperson; this._render(); return; }
      if (t.closest('[data-give]') && this._dlg) {
        const d = this._dlg; const pts = Math.round(Number(d.points) || 0); if (!pts) return;
        const act = (extra) => this._store.ws('family_planer/points/adjust', { person_id: d.person, points: pts, reason: d.reason || '', ...extra }).then(() => { this._dlg = null; this._render(); }).catch((er) => this._flash(this._errText(er), true));
        if (this._isAdmin()) { act({}); return; }
        if (!s.pin_set) { this._flash(this.T.nopin, true); return; }
        this._dlg = { kind: 'pin', pin: '', then: act }; this._render(); return;
      }
      const key = t.closest('[data-key]');
      if (key && this._dlg && this._dlg.kind === 'pin') {
        const k = key.dataset.key; const d = this._dlg;
        if (k === 'del') d.pin = d.pin.slice(0, -1); else if (k === 'ok') { const then = d.then; const pin = d.pin; this._dlg = null; this._render(); if (then) await then({ pin }); return; } else if (d.pin.length < 8) d.pin += k;
        this._render(); return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const s = this._snap();
      if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons; const sel = persons.find((p) => p.id === this._sel) || persons[0];
      const pts = s.points || {};
      const cards = persons.map((p) => { const x = pts[p.id] || { balance: 0, available: 0, level: 1, name: '', progress: 0, next: null, lifetime: 0 };
        return `<button class="pc${sel && p.id === sel.id ? ' on' : ''}" data-p="${esc(p.id)}" style="--c:${COLOR(p.color)}">${av(p, 52)}
          <div class="pi"><b>${esc(p.name)}</b><span class="lv">${esc(T.lvl)} ${x.level} · ${esc(x.name)}</span>
          <span class="bar"><i style="width:${Math.max(3, x.progress)}%"></i></span>
          <span class="nx">${x.next == null ? esc(T.max) : esc(fmt(T.next, { n: x.next - x.lifetime, l: x.level + 1 }))}</span></div>
          <div class="pt"><strong>${x.balance}</strong><span>${esc(T.pts)}</span>${x.balance !== x.available ? `<em>${esc(fmt(T.reserved, { n: x.balance - x.available }))}</em>` : ''}</div></button>`; }).join('');
      const avail = sel ? (pts[sel.id] || {}).available || 0 : 0;
      const rw = s.rewards.filter((r) => !r.persons || !r.persons.length || (sel && r.persons.includes(sel.id)));
      const shop = !s.rewards.length ? `<div class="empty">${esc(T.none)}</div>` : `<div class="shop">${rw.map((r) => { const ok = avail >= r.cost;
        return `<div class="rw${ok ? '' : ' lock'}"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}</span>
          ${ok ? '' : `<span class="ms"><span class="bar"><i style="width:${Math.round((avail / r.cost) * 100)}%"></i></span>${esc(fmt(T.missing, { n: r.cost - avail }))}</span>`}</div>
          <button class="rb" data-redeem="${esc(r.id)}" ${ok ? '' : 'disabled'}>${esc(T.redeem)}</button></div>`; }).join('')}</div>`;
      const name = (pid) => (persons.find((p) => p.id === pid) || {}).name || '?';
      const pend = s.requests.filter((q) => q.status === 'pending');
      const pending = pend.length ? `<div class="sec">${esc(T.pending)}</div><div class="pend">${pend.map((q) => `<div class="pq"><b>${esc(name(q.pid))}</b><span>${esc(q.title)} · ${q.cost} ${esc(T.pts)}</span>
          <button class="sg ok" data-decide="${esc(q.id)}" data-ok="1">${esc(T.approve)}</button><button class="sg" data-decide="${esc(q.id)}" data-ok="0">${esc(T.deny)}</button></div>`).join('')}</div>` : '';
      const hist = sel ? s.ledger.filter((e) => e.pid === sel.id).slice(0, 12) : [];
      const history = hist.length ? `<div class="sec">${esc(T.history)}</div><div class="hist">${hist.map((e) => `<div class="hr"><span class="k">${esc(T.kinds[e.kind] || e.kind)}</span><span class="tx">${esc(e.kind === 'bonus' || e.kind === 'streak' ? '' : e.text)}</span><span class="d">${esc((e.ts || '').slice(5, 10).split('-').reverse().join('.'))}</span><b class="${e.pts < 0 ? 'neg' : ''}">${e.pts > 0 ? '+' : ''}${e.pts}</b></div>`).join('')}</div>` : '';
      const d = this._dlg;
      let dlg = '';
      if (d && d.kind === 'pin') dlg = `<div class="ov"><div class="dlg pin"><div class="dh">${esc(T.pin)}</div><div class="dots">${[0, 1, 2, 3, 4, 5, 6, 7].slice(0, Math.max(4, d.pin.length)).map((i) => `<i class="${i < d.pin.length ? 'on' : ''}"></i>`).join('')}</div>
          <div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((k) => `<button class="key${k === 'ok' ? ' okk' : ''}" data-key="${k}">${k === 'del' ? '⌫' : k === 'ok' ? esc(T.ok) : k}</button>`).join('')}</div>
          <button class="sg" data-close>${esc(T.cancel)}</button></div></div>`;
      if (d && d.kind === 'bonus') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(T.bonus)}</div>
          <div class="bps">${persons.map((p) => `<button class="chip${p.id === d.person ? ' on' : ''}" data-bperson="${esc(p.id)}">${av(p, 22)}${esc(p.name)}</button>`).join('')}</div>
          <div class="br"><input class="in num" data-bp type="number" value="${esc(d.points)}" inputmode="numeric"><input class="in" data-br placeholder="${esc(T.reason)}" value="${esc(d.reason || '')}" maxlength="80"></div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-give>${esc(T.give)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:18px;font-family:${FONT};color:#ececec;position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:12px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid #333;background:#262626;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
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
        .pend,.hist{display:flex;flex-direction:column;gap:6px}
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
      </style>
      <div class="card">
        <div class="top"><h2>${esc(T.title)}</h2><button class="tb" data-bonus><ha-icon icon="mdi:star-plus-outline"></ha-icon>${esc(T.bonus)}</button></div>
        <div class="people">${cards}</div>
        ${pending}
        <div class="sec">${esc(fmt(T.shop, { name: sel ? sel.name : '' }))}</div>${shop}
        ${history}
        ${dlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-rewards-inner')) customElements.define('fp-rewards-inner', FpRewardsInner);
})();
