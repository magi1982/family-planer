// ---------------------------------------------------------------------------
// Black screen when idle (wall tablet): after N minutes without a tap and without motion the planner turns black.
// A motion sensor (Home Assistant state "on") or a tap wakes it at once; the waking tap does nothing else.
// window.FPSCREEN.update(hass, snap, card) – called by every planer card on each update; one saver per page.
// The saver belongs to the planer's own dashboard: in any other menu or app (e.g. an add-on page, whose taps happen
// inside its own frame and never reach this page) it stays off and the idle timer starts again.
// ---------------------------------------------------------------------------
(() => {
  if (window.FPSCREEN) return;
  let cfg = { enabled: false, minutes: 5, style: 'black', motion: [] };
  let last = Date.now(); let dark = false; let layer = null; let timer = null; let seen = {}; let moving = false;
  const cards = new Set(); let withCards = false; // planer cards that asked for the saver
  const root = () => ((window.location && window.location.pathname) || '').split('/')[1] || '';
  // is a planer card shown right now? (connected, visible, on the dashboard the address points to)
  const onPlaner = () => {
    if (typeof document.visibilityState === 'string' && document.visibilityState !== 'visible') return false;
    if (!withCards) return true; // older callers without a card
    for (const c of cards) {
      if (!c.isConnected) { cards.delete(c); continue; }
      if (c.getClientRects().length && c.__fpRoot === root()) return true;
    }
    return false;
  };

  const wake = () => { last = Date.now(); if (!dark) return; dark = false; if (layer) { layer.style.opacity = '0'; layer.style.pointerEvents = 'none'; } };
  const clockHtml = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const paint = () => {
    if (!layer) return;
    const c = layer.firstChild;
    if (cfg.style === 'clock') {
      c.textContent = clockHtml(); c.style.display = 'block';
      // moves a little every minute, so nothing burns in
      const m = new Date().getMinutes(); c.style.left = `${10 + (m * 37) % 70}%`; c.style.top = `${15 + (m * 23) % 60}%`;
    } else c.style.display = 'none';
  };
  const sleep = () => {
    if (dark) return; dark = true;
    if (!layer) {
      layer = document.createElement('div'); layer.id = 'fp-screen-off'; layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = 'position:fixed;inset:0;background:#000;z-index:2147483600;opacity:0;pointer-events:none;transition:opacity 1.2s ease;touch-action:none';
      const c = document.createElement('div');
      c.style.cssText = 'position:absolute;transform:translate(-50%,-50%);color:#3a3a3a;font:300 64px/1 system-ui,sans-serif;letter-spacing:2px;transition:left 2s,top 2s';
      layer.appendChild(c);
      // the waking tap is swallowed here: nothing under the black layer is touched
      const stop = (e) => { e.preventDefault(); e.stopPropagation(); wake(); };
      ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach((t) => layer.addEventListener(t, stop, { passive: false }));
      document.body.appendChild(layer);
    }
    paint(); layer.style.pointerEvents = 'auto'; requestAnimationFrame(() => { layer.style.opacity = '1'; });
  };
  const tick = () => {
    if (!cfg.enabled) { wake(); return; }
    if (!onPlaner()) { wake(); last = Date.now(); return; } // another menu or app: never black there
    if (dark) { paint(); return; }
    if (moving) { last = Date.now(); return; } // someone is there: stay on
    if (Date.now() - last >= cfg.minutes * 60000) sleep();
  };
  // every tap or key counts as activity (capture: also taps inside cards)
  ['pointerdown', 'keydown', 'wheel'].forEach((t) => window.addEventListener(t, () => { if (!dark) last = Date.now(); }, { capture: true, passive: true }));
  // leaving the planer (other dashboard, settings, an add-on) lifts the black at once and restarts the timer
  ['location-changed', 'popstate', 'visibilitychange'].forEach((t) => (t === 'visibilitychange' ? document : window).addEventListener
    && (t === 'visibilitychange' ? document : window).addEventListener(t, () => { if (!onPlaner()) { wake(); last = Date.now(); } }));

  const update = (hass, snap, card) => {
    if (card && card.isConnected && card.getClientRects && card.getClientRects().length) { card.__fpRoot = root(); cards.add(card); withCards = true; }
    const c = snap && snap.screen_cfg;
    if (c) cfg = c;
    if (!cfg.enabled) { wake(); if (timer) { clearInterval(timer); timer = null; } return; }
    if (!timer) { last = Date.now(); timer = setInterval(tick, 5000); }
    // motion: a sensor that is "on" (or just switched on) wakes and keeps the screen awake
    const states = (hass && hass.states) || {}; moving = false;
    for (const id of cfg.motion || []) {
      const st = states[id]; if (!st) continue;
      const sig = `${st.state}|${st.last_changed}`;
      if (st.state === 'on') { moving = true; if (seen[id] !== sig || !dark) wake(); }
      seen[id] = sig;
    }
  };
  window.FPSCREEN = { update, wake, _state: () => ({ dark, last, cfg }) };
})();
