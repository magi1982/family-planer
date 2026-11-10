// ---------------------------------------------------------------------------
// Parent PIN: keypad dialog, forced change of the start PIN 123456, short-lived unlock token.
// window.FPPIN.call(store, type, data, { lang, host }) sends a PIN-protected command and asks for the PIN
// only when needed. The PIN itself is never stored in the browser – only the server's 10-minute token in memory.
// ---------------------------------------------------------------------------
(() => {
  if (window.FPPIN) return;
  const TXT = {
    de: { unlock: 'Eltern-PIN', old: 'Aktuelle PIN', neu: 'Neue PIN (4–8 Ziffern)', again: 'Neue PIN wiederholen', ok: 'OK', cancel: 'Abbrechen',
      start: 'Die Start-PIN 123456 muss zuerst geändert werden.', wrong: 'Falsche PIN.', locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.',
      bad: 'Die neue PIN muss 4–8 Ziffern haben und darf nicht 123456 sein.', nomatch: 'Die PINs stimmen nicht überein.', changed: 'PIN geändert.' },
    en: { unlock: 'Parent PIN', old: 'Current PIN', neu: 'New PIN (4–8 digits)', again: 'Repeat new PIN', ok: 'OK', cancel: 'Cancel',
      start: 'The start PIN 123456 must be changed first.', wrong: 'Wrong PIN.', locked: 'Too many wrong tries – please wait 5 minutes.',
      bad: 'The new PIN must have 4–8 digits and must not be 123456.', nomatch: 'The PINs do not match.', changed: 'PIN changed.' },
  };
  const VARS = ['--fp-bg0', '--fp-bg1', '--fp-bg2', '--fp-bg3', '--fp-bg4', '--fp-line', '--fp-text', '--fp-text2', '--fp-text3', '--fp-accent', '--fp-on-accent', '--fp-radius', '--fp-font'];
  const tokens = new Map(); // store -> { t, exp }
  const CANCEL = 'cancel';

  // one keypad dialog; steps = [{ title, hint }] -> resolves with the entered values
  function keypad(ctx, steps, firstMsg) {
    const T = TXT[ctx.lang === 'en' ? 'en' : 'de'];
    return new Promise((resolve, reject) => {
      const el = document.createElement('div');
      const cs = ctx.host ? getComputedStyle(ctx.host) : null;
      el.style.cssText = 'position:fixed;inset:0;z-index:9999;' + (cs ? VARS.map((v) => `${v}:${cs.getPropertyValue(v)}`).join(';') : '');
      const root = el.attachShadow({ mode: 'open' });
      const vals = []; let step = 0; let pin = ''; let msg = firstMsg || ''; let err = !!firstMsg;
      const close = () => { el.remove(); document.removeEventListener('keydown', onKey, true); };
      const press = (k) => {
        if (k === 'del') pin = pin.slice(0, -1);
        else if (k === 'ok') { if (pin.length < 4) return; vals.push(pin); pin = ''; step += 1; msg = ''; if (step >= steps.length) { close(); resolve(vals); return; } }
        else if (pin.length < 8 && /^\d$/.test(k)) pin += k;
        draw();
      };
      const onKey = (e) => {
        if (e.key === 'Escape') { close(); reject(CANCEL); return; }
        if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') press('ok'); else return;
        e.preventDefault(); e.stopPropagation();
      };
      document.addEventListener('keydown', onKey, true);
      root.addEventListener('click', (e) => {
        const k = e.target.closest('[data-k]'); if (k) { press(k.dataset.k); return; }
        if (e.target.closest('[data-x]') || e.target.classList.contains('ov')) { close(); reject(CANCEL); }
      });
      const draw = () => {
        const s = steps[step];
        root.innerHTML = `<style>
          .ov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:var(--fp-font,system-ui,sans-serif)}
          .d{background:var(--fp-bg2,#232323);color:var(--fp-text,#eee);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);padding:20px;width:290px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5)}
          h3{margin:0 0 4px;font-size:16px;font-weight:600}.st{font-size:12px;color:var(--fp-text3,#888);margin-bottom:8px}
          .m{font-size:13px;min-height:18px;margin:4px 0 8px;color:var(--fp-text2,#bbb)}.m.e{color:#E06B6B}
          .dots{display:flex;gap:10px;justify-content:center;margin:8px 0 14px}.dots i{width:12px;height:12px;border-radius:50%;border:2px solid var(--fp-text3,#666)}.dots i.on{background:var(--fp-accent,#69C350);border-color:var(--fp-accent,#69C350)}
          .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
          button{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
          .k{height:56px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2e2e2e);color:var(--fp-text,#eee);font-size:21px}
          .k.ok{background:var(--fp-accent,#69C350);color:var(--fp-on-accent,#141414);font-size:15px;font-weight:600}
          .x{height:38px;border-radius:19px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);padding:0 18px}
        </style><div class="ov"><div class="d" role="dialog" aria-modal="true">
          <h3>${s.title}</h3>${steps.length > 1 ? `<div class="st">${step + 1} / ${steps.length}</div>` : ''}
          <div class="m${err ? ' e' : ''}">${msg || s.hint || ''}</div>
          <div class="dots">${Array.from({ length: Math.max(4, pin.length) }, (_, i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join('')}</div>
          <div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((k) => `<button class="k${k === 'ok' ? ' ok' : ''}" data-k="${k}" aria-label="${k}">${k === 'del' ? '⌫' : k === 'ok' ? T.ok : k}</button>`).join('')}</div>
          <button class="x" data-x>${T.cancel}</button></div></div>`;
        err = false;
      };
      draw();
      document.body.appendChild(el);
    });
  }

  const T = (ctx) => TXT[ctx.lang === 'en' ? 'en' : 'de'];
  const cached = (store) => { const c = tokens.get(store); return c && c.exp > Date.now() ? c.t : null; };
  const remember = (store, res) => { tokens.set(store, { t: res.token, exp: Date.now() + Math.max(60, (res.ttl || 600) - 60) * 1000 }); return res.token; };

  async function change(store, ctx, msg) {
    let note = msg || T(ctx).start;
    for (;;) {
      const [old, neu, again] = await keypad(ctx, [{ title: T(ctx).old }, { title: T(ctx).neu }, { title: T(ctx).again }], note);
      if (neu !== again) { note = T(ctx).nomatch; continue; }
      try { return remember(store, await store.ws('family_planer/pin/change', { old, new: neu })); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_wrong') note = T(ctx).wrong; else if (c === 'pin_locked') note = T(ctx).locked; else if (c === 'pin_bad_pin') note = T(ctx).bad; else throw e;
      }
    }
  }

  async function ensure(store, ctx) {
    const t = cached(store); if (t) return t;
    if (store.snap && store.snap.pin_default) return change(store, ctx);
    let note = '';
    for (;;) {
      const [pin] = await keypad(ctx, [{ title: T(ctx).unlock }], note);
      try { return remember(store, await store.ws('family_planer/pin/unlock', { pin })); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_change_required') return change(store, ctx);
        if (c === 'pin_wrong') note = T(ctx).wrong; else if (c === 'pin_locked') note = T(ctx).locked; else throw e;
      }
    }
  }

  async function call(store, type, data, ctx) {
    for (let i = 0; i < 3; i += 1) {
      const token = await ensure(store, ctx);
      try { return await store.ws(type, { ...(data || {}), token }); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_required') { tokens.delete(store); continue; }
        if (c === 'pin_change_required') { tokens.delete(store); await change(store, ctx); continue; }
        throw e;
      }
    }
    throw new Error('pin');
  }

  window.FPPIN = {
    call, ensure, CANCEL,
    change: (store, ctx) => change(store, ctx, ' '),
    unlocked: (store) => !!cached(store),
    lock: (store) => tokens.delete(store),
    token: (store) => cached(store),
  };
})();
