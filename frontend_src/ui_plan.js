// Familienplaner – Ämtliplan v3: pro Ämtli mehrere Personen, pro Person Wochentage mit Rhythmus
// custom:lox-aemtli-plan-card   (nutzt window.FP aus dem Familienplaner-Modul)
// Plan-Beschreibung: "fp1:" + {"z": {"Lea": [1,3]}, "r": {"Lea|1": [2, 0]}}
//   r: alle n Wochen, aktiv wenn Wochenindex (seit 5.1.1970) % n == offset; fehlt r => jede Woche
customElements.whenDefined('lox-wochenplaner-card').then(() => {
  const { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx } = window.FP;
  const rgba = (hex, a) => { const h = (hex || '#888888').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const mondayOfIdx = (idx) => { const u = new Date(Date.UTC(1970, 0, 5) + idx * 604800000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const curIdx = () => weekIdx(new Date());
  const nextKw = (n, o) => { const c = curIdx(); for (let i = 0; i < n; i++) if ((c + i) % n === o) return isoWeek(mondayOfIdx(c + i)); return null; };
  const dayTxt = (p, d, r, f) => { const x = r[`${p}|${d}`]; const fv = (f || {})[`${p}|${d}`] || 1; const ex = []; if (fv > 1) ex.push(`bis ${WD[(d - 1 + fv - 1) % 7]}`); if (x && x[0] > 1) ex.push(`alle ${x[0]} Wo., nächste KW ${nextKw(x[0], x[1])}`); return ex.length ? `${WD[d - 1]} (${ex.join(', ')})` : WD[d - 1]; };
  const daysTxt = (p, t, r, f) => {
    const s = [...(t || [])].sort((a, b) => a - b); const j = s.join(',');
    const anyR = s.some((d) => (r[`${p}|${d}`] || [1])[0] > 1 || ((f || {})[`${p}|${d}`] || 1) > 1);
    if (!anyR) { if (j === '1,2,3,4,5,6,7') return 'täglich'; if (j === '1,2,3,4,5') return 'werktags'; if (j === '6,7') return 'Wochenende'; }
    return s.length ? s.map((d) => dayTxt(p, d, r, f)).join(', ') : 'keine Tage';
  };

  class LoxAemtliPlanCard extends FpBase {
    _normalize(c) { return { plan: 'todo.amtli_plan', script: 'script.aemtli_tageswechsel', einstellungen: 'todo.familienplaner_einstellungen', kinder: [], titel: 'Ämtliplan', ...c }; }
    _lists() { return [['plan', this._cfg.plan], ['settings', this._cfg.einstellungen]]; }
    getCardSize() { return 10; }
    _bind() {
      this._new = { t: '', z: {}, r: {}, f: {} }; this._confirm = null; this._msg = ''; this._pick = null;
      const r = this.shadowRoot;
      r.addEventListener('click', (e) => this._onClick(e));
      r.addEventListener('change', (e) => this._onChange(e));
      r.addEventListener('input', (e) => { if (e.target.dataset.new === 't') this._new.t = e.target.value; });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur(); });
      r.addEventListener('focusout', () => setTimeout(() => { if (this._dirty && !this._editing()) { this._dirty = false; this._render(); } }, 60));
    }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && a.tagName === 'INPUT'; }
    _order() { return this._kids().map((k) => k.name); }
    _rows() {
      const order = this._order();
      const first = (z) => Math.min(99, ...Object.keys(z).map((k) => { const i = order.indexOf(k); return i < 0 ? 98 : i; }));
      return (this._data.plan || []).map((p) => { const m = parseDesc(p.description); return { uid: p.uid, t: p.summary, pts: (typeof m.p === 'number' ? m.p : null), z: planZ(m), r: (m.r && typeof m.r === 'object') ? m.r : {}, f: (m.f && typeof m.f === 'object') ? m.f : {} }; })
        .sort((a, b) => (first(a.z) - first(b.z)) || a.t.localeCompare(b.t, 'de'));
    }
    _find(uid) { return this._rows().find((r) => r.uid === uid); }
    _desc(z, r, f) {
      const zo = {}; const ro = {}; const fo = {}; f = f || {};
      for (const [k, v] of Object.entries(z)) {
        zo[k] = [...new Set(v)].sort((a, b) => a - b);
        for (const d of zo[k]) { const x = r[`${k}|${d}`]; if (x && x[0] > 1) ro[`${k}|${d}`] = [x[0], ((x[1] % x[0]) + x[0]) % x[0]]; const fv = f[`${k}|${d}`]; if (fv > 1) fo[`${k}|${d}`] = fv; }
      }
      const o = { z: zo }; if (Object.keys(ro).length) o.r = ro; if (Object.keys(fo).length) o.f = fo;
      return 'fp1:' + JSON.stringify(o);
    }
    _sync() {
      clearTimeout(this._syncT);
      this._syncT = setTimeout(() => { if (this._cfg.script) this._call('script', 'turn_on', {}, this._cfg.script).catch(() => {}); }, 1200);
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(true); clearTimeout(this._msgT); this._msgT = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _add() {
      const t = (this._new.t || '').trim();
      if (!t) return this._flash('Bitte einen Ämtli-Text eingeben.', true);
      if (!Object.values(this._new.z).some((v) => v.length)) return this._flash('Bitte mindestens einer Person einen Wochentag zuordnen.', true);
      this._call('todo', 'add_item', { item: t, description: this._desc(this._new.z, this._new.r, this._new.f) }, this._cfg.plan).then(() => {
        this._new = { t: '', z: {}, r: {}, f: {} }; this._pick = null; this._flash(`„${t}“ hinzugefügt`); this._sync();
      }).catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    _ctx(el) {
      const isNew = !!el.closest('.add'); const row = el.closest('.row[data-uid]');
      const r = !isNew && row ? this._find(row.dataset.uid) : null;
      const src = isNew ? this._new : r;
      return { isNew, r, key: isNew ? 'new' : (r && r.uid), z: src ? JSON.parse(JSON.stringify(src.z)) : null, rr: src ? JSON.parse(JSON.stringify(src.r || {})) : null, ff: src ? JSON.parse(JSON.stringify(src.f || {})) : null };
    }
    _apply(ctx) {
      if (ctx.isNew) { this._new.z = ctx.z; this._new.r = ctx.rr; this._new.f = ctx.ff; this._render(true); return; }
      if (!ctx.r) return;
      // optimistisch im lokalen Datenstand übernehmen, damit die Anzeige sofort stimmt
      const desc = this._desc(ctx.z, ctx.rr, ctx.ff);
      const it = (this._data.plan || []).find((p) => p.uid === ctx.r.uid); if (it) it.description = desc;
      this._render(true);
      this._call('todo', 'update_item', { item: ctx.r.uid, description: desc }, this._cfg.plan)
        .then(() => this._sync()).catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    _isPick(key, p, d) { const k = this._pick; return !!k && k.key === key && k.p === p && k.d === d; }
    _onClick(e) {
      const t = e.target;
      const ha = t.closest('[data-hadd]'); if (ha) { this.dispatchEvent(new CustomEvent('fp-plan-add', { bubbles: true, composed: true, detail: { kind: ha.dataset.hadd } })); return; }
      if (t.closest('[data-add]')) { const inp = this.shadowRoot.querySelector('[data-new="t"]'); if (inp) this._new.t = inp.value; this._add(); return; }
      const arw = t.closest('.arw');
      if (arw) {
        const ctx = this._ctx(t); if (!ctx.z) return; const p = arw.dataset.p;
        const day = t.closest('[data-day]');
        if (day) {
          const d = Number(day.dataset.day); const has = (ctx.z[p] || []).includes(d);
          if (!has) { ctx.z[p] = [...(ctx.z[p] || []), d]; this._pick = { key: ctx.key, p, d }; this._apply(ctx); }
          else { this._pick = this._isPick(ctx.key, p, d) ? null : { key: ctx.key, p, d }; this._render(true); }
          return;
        }
        const pre = t.closest('[data-preset]');
        if (pre) { ctx.z[p] = pre.dataset.preset.split(',').map(Number); Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rmp]')) { delete ctx.z[p]; Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        const pk = this._pick; if (!pk) return; const rk = `${pk.p}|${pk.d}`;
        const rn = t.closest('[data-rn]');
        if (rn) { const n = Number(rn.dataset.rn); if (n <= 1) delete ctx.rr[rk]; else ctx.rr[rk] = [n, curIdx() % n]; this._apply(ctx); return; }
        const ro = t.closest('[data-ro]');
        if (ro && ctx.rr[rk]) { ctx.rr[rk][1] = Number(ro.dataset.ro); this._apply(ctx); return; }
        const fx = t.closest('[data-fx]');
        if (fx) { const v = Number(fx.dataset.fx); if (v <= 1) delete ctx.ff[rk]; else ctx.ff[rk] = v; this._apply(ctx); return; }
        if (t.closest('[data-rdel]')) { ctx.z[pk.p] = (ctx.z[pk.p] || []).filter((x) => x !== pk.d); delete ctx.rr[rk]; delete ctx.ff[rk]; this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rclose]')) { this._pick = null; this._render(true); return; }
        return;
      }
      const del = t.closest('[data-del]');
      if (del) {
        const ctx = this._ctx(t); if (!ctx.r) return; const r = ctx.r;
        if (this._confirm === r.uid) {
          this._confirm = null;
          this._call('todo', 'remove_item', { item: [r.uid] }, this._cfg.plan).then(() => { this._flash(`„${r.t}“ gelöscht`); this._sync(); }).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        } else {
          this._confirm = r.uid; this._render(true);
          clearTimeout(this._cT); this._cT = setTimeout(() => { this._confirm = null; this._render(); }, 3000);
        }
      }
    }
    _onChange(e) {
      const el = e.target;
      if (el.dataset.addp !== undefined) {
        const v = el.value; if (!v) return; const ctx = this._ctx(el); if (!ctx.z) return;
        ctx.z[v] = ctx.z[v] || []; this._apply(ctx); return;
      }
      if (el.dataset.f === 'p') {
        const ctx = this._ctx(el); if (!ctx.r) return;
        const n = el.value === '' ? null : Math.max(0, Math.min(1000, Math.round(Number(el.value) || 0)));
        this._call('todo', 'update_item', { item: ctx.r.uid, points: n }, this._cfg.plan).then(() => this._flash('Punkte gespeichert')).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        return;
      }
      if (el.dataset.f === 't') {
        const ctx = this._ctx(el); if (!ctx.r) return; const v = el.value.trim();
        if (v && v !== ctx.r.t) this._call('todo', 'update_item', { item: ctx.r.uid, rename: v }, this._cfg.plan).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        else el.value = ctx.r.t;
      }
    }
    _picker(key, p, d, rr, farbe, ff) {
      const x = rr[`${p}|${d}`]; const n = x && x[0] > 1 ? x[0] : 1; const o = x ? x[1] : 0; const c = curIdx();
      const fv = (ff || {})[`${p}|${d}`] || 1;
      const fRow = `<div class="pr"><span class="plb">Zeit zum Erledigen</span>${[1, 2, 3, 4, 5, 6, 7].map((k) => `<button class="sg${k === fv ? ' on' : ''}" data-fx="${k}">${k === 1 ? `nur am ${WD[d - 1]}` : `bis ${WD[(d - 1 + k - 1) % 7]} · ${k} Tage`}</button>`).join('')}</div>`;
      const starts = n > 1 ? [...Array(n)].map((_, i) => {
        const idx = c + i; const off = idx % n; const kw = isoWeek(mondayOfIdx(idx));
        return `<button class="sg${off === o ? ' on' : ''}" data-ro="${off}">${i === 0 ? 'diese Woche' : i === 1 ? 'nächste Woche' : `in ${i} Wochen`} · KW ${kw}</button>`;
      }).join('') : '';
      return `<div class="pick" style="--c:${farbe};--cb:${rgba(farbe, 0.2)}">
        <div class="pr"><span class="plb">${WD[d - 1]} · ${esc(p)}</span>
          ${[1, 2, 3, 4].map((k) => `<button class="sg${k === n ? ' on' : ''}" data-rn="${k}">${k === 1 ? 'jede Woche' : `alle ${k} Wochen`}</button>`).join('')}</div>
        ${n > 1 ? `<div class="pr"><span class="plb">Start</span>${starts}</div>` : ''}
        ${fRow}<div class="pr"><button class="sg rm" data-rdel>Tag entfernen</button><button class="sg ok" data-rclose>Fertig</button></div>
      </div>`;
    }
    _asg(key, z, rr, ff) {
      ff = ff || {};
      const kids = this._kids(); const order = this._order();
      const person = (n) => kids.find((k) => k.name === n) || { name: n, farbe: '#888888' };
      const names = Object.keys(z).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const lines = names.map((n) => {
        const k = person(n); const t = z[n] || [];
        const pk = this._pick && this._pick.key === key && this._pick.p === n ? this._pick : null;
        return `<div class="arw" data-p="${esc(n)}"><div class="ar">${avatarHtml(k, 30)}<span class="pn">${esc(n)}</span>
          <div class="days">${WD.map((w, i) => {
            const d = i + 1; const on = t.includes(d); const x = rr[`${n}|${d}`]; const rh = on && x && x[0] > 1; const fv = on ? (ff[`${n}|${d}`] || 1) : 1; const tag = [rh ? x[0] + 'W' : '', fv > 1 ? fv + 'T' : ''].filter(Boolean).join('·');
            return `<button class="day${on ? ' on' : ''}${(rh || fv > 1) ? ' rh' : ''}${pk && pk.d === d ? ' sel' : ''}" data-day="${d}" style="--c:${k.farbe};--cb:${rgba(k.farbe, 0.2)}">${w}${tag ? `<small>${tag}</small>` : ''}</button>`;
          }).join('')}</div>
          <button class="pre" data-preset="1,2,3,4,5,6,7">tägl.</button><button class="pre" data-preset="1,2,3,4,5">Mo–Fr</button>
          <button class="rmp" data-rmp title="Person entfernen">✕</button></div>
          ${pk && t.includes(pk.d) ? this._picker(key, n, pk.d, rr, k.farbe, ff) : ''}</div>`;
      }).join('');
      const free = kids.filter((k) => !(k.name in z));
      return lines + (free.length ? `<select class="sel addp" data-addp><option value="" selected>+ Person zuteilen</option>${free.map((k) => `<option value="${esc(k.name)}">${esc(k.name)}</option>`).join('')}</select>` : '');
    }
    _render(force) {
      if (!this.shadowRoot || !this._cfg) return;
      if (!force && this._editing()) { this._dirty = true; return; }
      const kids = this._kids(); const rows = this._rows();
      // Wochenübersicht: durchschnittliche Anzahl Ämtli pro Person und Tag (Rhythmus anteilig)
      const cnt = {}; kids.forEach((k) => { cnt[k.name] = [0, 0, 0, 0, 0, 0, 0]; });
      rows.forEach((r) => Object.entries(r.z).forEach(([n, t]) => { if (!cnt[n]) cnt[n] = [0, 0, 0, 0, 0, 0, 0]; (t || []).forEach((d) => { const x = r.r[`${n}|${d}`]; cnt[n][d - 1] += x && x[0] > 1 ? 1 / x[0] : 1; }); }));
      const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
      const max = Math.max(1, ...Object.values(cnt).flat());
      const overview = `<div class="ov"><div></div>${WD.map((w) => `<div class="ovh">${w}</div>`).join('')}<div class="ovh">Ø Woche</div>` +
        kids.map((k) => `<div class="ovp">${avatarHtml(k, 24)}<span>${esc(k.name)}</span></div>` +
          cnt[k.name].map((n) => `<div class="ovc" style="background:${n ? rgba(k.farbe, 0.12 + (0.5 * n) / max) : 'var(--fp-bg3,#262626)'};color:${n ? 'var(--fp-text,#fff)' : 'var(--fp-text3,#555)'}">${n ? fmt(n) : '·'}</div>`).join('') +
          `<div class="ovt">${fmt(cnt[k.name].reduce((a, b) => a + b, 0))}</div>`).join('') + `</div>`;
      const sum = (z, r, f) => Object.entries(z).map(([n, t]) => `<b>${esc(n)}:</b> ${daysTxt(n, t, r, f)}`).join('<br>') || 'Noch niemandem zugeteilt';
      const body = rows.map((r) => `
        <div class="row" data-uid="${esc(r.uid)}">
          <div class="tcol"><div class="tl"><input class="in" data-f="t" value="${esc(r.t)}"><label class="pts" title="Punkte bzw. Gewicht für dieses Ämtli (im fairen Modus: Anteil am Tageswert)"><input class="in pn" data-f="p" type="number" min="0" max="1000" inputmode="numeric" value="${r.pts == null ? '' : r.pts}" placeholder="${Number(this._cfg.punkte_standard) || 10}"><span>Pkt.</span></label></div><div class="rl">${sum(r.z, r.r, r.f)}</div></div>
          <div class="asg">${this._asg(r.uid, r.z, r.r, r.f)}</div>
          <button class="del${this._confirm === r.uid ? ' cf' : ''}" data-del>${this._confirm === r.uid ? 'Löschen?' : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button>
        </div>`).join('');
      const nw = this._new;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:20px 22px;color:#ececec;font-family:${FONT}}
        .head{display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap}.hsp{flex:1}.hadd{display:flex;align-items:center;gap:6px;height:42px;padding:0 14px;border-radius:12px;border:1px solid #3a3a3a;background:#262626;color:#ddd;font:inherit;font-size:14px;cursor:pointer}.hadd ha-icon{--mdc-icon-size:18px;color:${G}}
        .badge{width:46px;height:46px;border-radius:12px;background:rgba(105,195,80,.14);color:${G};display:flex;align-items:center;justify-content:center}.badge ha-icon{--mdc-icon-size:26px}
        .title{font-size:20px;font-weight:600}.subt{font-size:13px;color:#8c8c8c;margin-top:3px}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .ov{display:grid;grid-template-columns:150px repeat(7,minmax(34px,58px)) 70px;gap:4px;align-items:center;background:#232323;border-radius:12px;padding:12px;width:max-content;max-width:100%;box-sizing:border-box}
        .ovh{font-size:11px;color:#777;text-align:center;text-transform:uppercase;letter-spacing:.8px}
        .ovp{display:flex;align-items:center;gap:8px;font-size:14px;min-width:0}.ovp span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ovc{height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
        .ovt{text-align:center;font-size:14px;color:#bbb;font-weight:600}
        .list{background:#262626;border:1px solid #2f2f2f;border-radius:12px;overflow:hidden}
        .row{display:grid;grid-template-columns:minmax(200px,1fr) auto 56px;gap:16px;align-items:start;padding:14px;border-top:1px solid #313131}.row:first-child{border-top:none}
        .in,.sel{background:#2e2e2e;border:1px solid #3a3a3a;color:#eee;border-radius:9px;height:44px;padding:0 12px;font:inherit;font-size:15px;width:100%;box-sizing:border-box;outline:none}
        .in:focus,.sel:focus{border-color:rgba(105,195,80,.7)}
        .sel{-webkit-appearance:none;appearance:none}
        .tl{display:flex;gap:8px}.pts{display:flex;align-items:center;gap:4px;flex:none;color:#8a8a8a;font-size:12px}.pts .pn{width:70px;text-align:center;padding:0 6px}
        .rl{font-size:12px;color:#8a8a8a;margin:6px 0 0 2px;line-height:1.6}.rl b{color:#bbb;font-weight:600}
        .asg{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
        .ar{display:flex;align-items:center;gap:8px}
        .pn{width:74px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .days{display:flex;gap:4px}
        .day{width:40px;height:40px;border-radius:9px;background:#2e2e2e;border:1px solid #3a3a3a;color:#808080;font:inherit;font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}
        .day small{font-size:9px;font-weight:700;opacity:.9}
        .day.on{background:var(--cb);border-color:var(--c);color:var(--c)}
        .day.rh{border-style:dashed}
        .day.sel{box-shadow:0 0 0 2px #1e1e1e,0 0 0 4px var(--c)}
        .pre{height:32px;border-radius:16px;background:transparent;border:1px solid #3a3a3a;color:#999;font:inherit;font-size:11px;padding:0 10px;cursor:pointer}
        .rmp{width:32px;height:32px;border-radius:50%;background:transparent;border:1px solid #3a3a3a;color:#888;font-size:13px;cursor:pointer;padding:0}
        .pick{margin:8px 0 4px 38px;background:#1f1f1f;border:1px solid var(--c);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
        .pr{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
        .plb{font-size:12px;color:var(--c);font-weight:600;min-width:86px}
        .sg{height:34px;border-radius:17px;background:#2e2e2e;border:1px solid #3a3a3a;color:#bbb;font:inherit;font-size:12px;padding:0 12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .sg.on{background:var(--cb);border-color:var(--c);color:var(--c);font-weight:600}
        .sg.rm{color:#E06B6B;border-color:rgba(224,107,107,.5)}.sg.ok{margin-left:auto;background:${G};border-color:${G};color:#142010;font-weight:600}
        .addp{width:220px;height:38px;font-size:13px;color:#aaa;border-style:dashed}
        .del{height:44px;border-radius:9px;background:transparent;border:1px solid #3a3a3a;color:#888;cursor:pointer;font:inherit;font-size:11px;font-weight:600;padding:0;display:flex;align-items:center;justify-content:center}
        .del.cf{background:#E06B6B;border-color:#E06B6B;color:#1e1e1e}.del ha-icon{--mdc-icon-size:20px}
        .add{margin-top:16px;background:#232323;border:1px dashed #3d3d3d;border-radius:12px;padding:14px}
        .add .row{padding:0;border:none}
        .addb{height:44px;border-radius:9px;background:${G};border:none;color:#142010;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.addb ha-icon{--mdc-icon-size:24px}
        .msg{font-size:13px;margin-top:10px;min-height:18px}
        .empty{padding:24px;text-align:center;color:#777}
        .foot{font-size:12px;color:#666;margin-top:12px;line-height:1.5}
        .pers{display:flex;flex-wrap:wrap;gap:8px}
        .pc{display:flex;align-items:center;gap:10px;background:#262626;border:1px solid #333;border-radius:30px;padding:4px 14px 4px 4px;color:#ddd;font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .pc ha-icon{--mdc-icon-size:14px;color:#777}.pc.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .ipk{margin-top:10px;background:#232323;border:1px solid var(--c);border-radius:14px;padding:14px 16px}
        .iph{display:flex;align-items:center;gap:14px;margin-bottom:6px}.iphn{flex:1}.iphn b{display:block;font-size:18px}.iphn span{font-size:12px;color:#888}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.upl .up{cursor:pointer;display:inline-flex;align-items:center}
        .ipl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px}
        .cols{display:flex;gap:8px;flex-wrap:wrap}
        .clr{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.clr.on{border-color:#fff;box-shadow:0 0 0 2px #1e1e1e inset}
        .igrid{display:flex;flex-wrap:wrap;gap:6px}
        .ips2{font-size:11px;color:#777;margin-top:5px}
        .ib{width:56px;height:56px;border-radius:12px;background:#2a2a2a;border:1px solid #333;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
        .ib.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
      </style>
      <div class="card">
        <div class="head"><div class="badge"><ha-icon icon="mdi:clipboard-text-clock-outline"></ha-icon></div>
          <div><div class="title">${esc(this._cfg.titel)}</div><div class="subt">Tag antippen = zuteilen · nochmals antippen = Zeit zum Erledigen (z. B. Mi bis Sa) und Rhythmus (alle 2–4 Wochen). Änderungen gelten ab sofort.</div></div><span class="hsp"></span>
          <button class="hadd" data-hadd="special"><ha-icon icon="mdi:plus"></ha-icon>Besonderes Ämtli</button><button class="hadd" data-hadd="todo"><ha-icon icon="mdi:plus"></ha-icon>To-do</button></div>
        <div class="sec">Wochenübersicht</div>
        ${overview}
        <div class="sec">Ämtli</div>
        <div class="list">${body || '<div class="empty">Noch keine Ämtli – unten hinzufügen.</div>'}</div>
        <div class="add"><div class="sec" style="margin-top:0">Neues Ämtli</div>
          <div class="row">
            <div class="tcol"><input class="in" data-new="t" placeholder="z. B. Tisch abräumen" value="${esc(nw.t)}"><div class="rl">${sum(nw.z, nw.r, nw.f || {})}</div></div>
            <div class="asg">${this._asg('new', nw.z, nw.r, nw.f || {})}</div>
            <button class="addb" data-add title="Hinzufügen"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="msg" style="color:${this._msgErr ? '#E06B6B' : G}">${esc(this._msg || '')}</div>
        ${this._err ? `<div class="msg" style="color:#E06B6B">${esc(this._err)}</div>` : ''}
        <div class="foot">Gestrichelter Rahmen = Frist oder Rhythmus („4T“ = 4 Tage Zeit, „2W“ = alle 2 Wochen). Ein Ämtli mit Frist zählt erst als „nicht gemacht“, wenn die Frist abgelaufen ist. Täglich um ${esc(this._cfg.tageswechsel || '24:00')} werden unerledigte Ämtli als „nicht gemacht“ gezählt und die Ämtli für den neuen Tag erstellt.</div>
      </div>`;
    }
  }
  if (!customElements.get('lox-aemtli-plan-card')) customElements.define('lox-aemtli-plan-card', LoxAemtliPlanCard);
});
