// ---------------------------------------------------------------------------
// Fullscreen on double tap: hides the Home Assistant sidebar and header (and uses real browser fullscreen
// where allowed). Double-tap again to leave. Taps on buttons, chores and inputs never trigger it.
// window.FPKIOSK.attach(element, store)
// ---------------------------------------------------------------------------
(() => {
  if (window.FPKIOSK) return;
  const STYLE_ID = 'fp-kiosk-style';
  let on = false;
  let autoDone = false;

  const roots = () => {
    const out = [];
    try {
      const ha = document.querySelector('home-assistant'); const main = ha && ha.shadowRoot && ha.shadowRoot.querySelector('home-assistant-main');
      const mr = main && main.shadowRoot; if (!mr) return out;
      out.push([mr, 'ha-sidebar{display:none!important} ha-drawer{--mdc-drawer-width:0px!important} :host{--mdc-drawer-width:0px!important}']);
      const drawer = mr.querySelector('ha-drawer'); if (drawer && drawer.shadowRoot) out.push([drawer.shadowRoot, '.mdc-drawer{display:none!important;width:0!important} .mdc-drawer-app-content{margin-left:0!important;margin-inline-start:0!important}']);
      const ppr = mr.querySelector('partial-panel-resolver');
      const lov = ppr && ppr.querySelector('ha-panel-lovelace');
      const root = lov && lov.shadowRoot && lov.shadowRoot.querySelector('hui-root');
      if (root && root.shadowRoot) out.push([root.shadowRoot, '.header,.toolbar,app-header{display:none!important} #view,.view,hui-view-container{padding-top:0!important;min-height:100vh!important} :host{--header-height:0px!important}']);
    } catch (e) { /* layout of Home Assistant changed – real fullscreen still works */ }
    return out;
  };
  const apply = (state) => {
    for (const [root, css] of roots()) {
      let st = root.getElementById ? root.getElementById(STYLE_ID) : root.querySelector('#' + STYLE_ID);
      if (state) { if (!st) { st = document.createElement('style'); st.id = STYLE_ID; root.appendChild(st); } st.textContent = css; } else if (st) st.remove();
    }
    window.dispatchEvent(new Event('resize'));
  };
  const set = (state, gesture) => {
    on = state; apply(on);
    const de = document.documentElement;
    try {
      if (on && gesture && de.requestFullscreen && !document.fullscreenElement) de.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) { /* not allowed (e.g. iOS) – hiding header and sidebar is enough */ }
  };
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && on) { on = false; apply(false); } });
  window.addEventListener('location-changed', () => { if (on) setTimeout(() => apply(true), 300); });

  const INTERACTIVE = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'LABEL', 'HA-ICON-BUTTON', 'HA-SWITCH', 'HA-CHECKBOX']);
  // only elements between the tap target and the planner itself count; data-fp-theme marks hosts, not controls
  const interactive = (path, host) => {
    for (const n of path) {
      if (n === host) return false;
      if (!n || n.nodeType !== 1) continue;
      const keys = Object.keys(n.dataset || {}).filter((k) => k !== 'fpTheme');
      if (INTERACTIVE.has(n.tagName) || n.getAttribute('role') === 'button' || n.hasAttribute('contenteditable') || keys.length) return true;
    }
    return false;
  };

  function attach(el, store) {
    if (el.__fpKiosk) return; el.__fpKiosk = true;
    let last = 0; let lx = 0; let ly = 0;
    const enabled = () => !(store && store.snap && store.snap.settings && store.snap.settings.fullscreen_dblclick === false);
    el.addEventListener('pointerup', (e) => {
      if (e.__fpk || !enabled() || e.button > 0) return; e.__fpk = true;
      if (interactive(e.composedPath(), el)) { last = 0; return; }
      const now = Date.now();
      if (now - last < 350 && Math.abs(e.clientX - lx) < 30 && Math.abs(e.clientY - ly) < 30) { last = 0; set(!on, true); return; }
      last = now; lx = e.clientX; ly = e.clientY;
    });
    const auto = () => { if (!autoDone && store && store.snap && store.snap.settings && store.snap.settings.fullscreen_auto) { autoDone = true; setTimeout(() => set(true, false), 400); } };
    if (store) store.listen(auto);
  }
  window.FPKIOSK = { attach, set, get on() { return on; } };
})();
