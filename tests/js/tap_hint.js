// The "Tap!" neon sign: mode, minutes and season colour (frontend_src/bridge.js).
// Run: node tests/js/tap_hint.js  (used by tests/test_lists_js.py)
const path = require('path');
global.window = global; global.HTMLElement = class {}; global.customElements = { define() {}, get() { return undefined; } };
global.document = { createElement: () => ({ style: {} }), head: { appendChild() {} }, addEventListener() {} };
global.location = { pathname: '/' }; global.history = { pushState() {} };
require(path.join(__dirname, '../../frontend_src/bridge.js'));
const H = window.FPHINT; const errors = [];
const eq = (a, b, m) => { if (a !== b) errors.push(`${m}: ${a} != ${b}`); };
eq(H.hintMode(null), 'activity', 'default mode');
eq(H.hintMode({ season_cfg: { tap_hint: 'off' } }), 'off', 'off');
eq(H.hintMode({ season_cfg: { tap_hint: 'always' } }), 'always', 'always');
eq(H.hintMode({ season_cfg: { tap_hint: '<script>' } }), 'activity', 'unknown value');
eq(H.hintMinutes({ season_cfg: { tap_hint_min: 5 } }), 5, 'minutes');
eq(H.hintMinutes({ season_cfg: { tap_hint_min: 99 } }), 10, 'minutes max');
eq(H.hintMinutes({ season_cfg: { tap_hint_min: 'x' } }), 2, 'minutes default');
eq(H.hintColor({ season: { jz: 'winter', vis: 'alltag' } }), '#7FE3FF', 'winter ice blue');
eq(H.hintColor({ season: { jz: 'sommer', vis: 'sommer' } }), '#FF6FD8', 'summer pink');
eq(H.hintColor({ season: { jz: 'herbst', vis: 'alltag' } }), '#FFB347', 'autumn amber');
eq(H.hintColor({ season: { jz: 'winter', vis: 'alltag', fun: { key: 'pi' } } }), '#8CFF6A', 'special day green');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('tap hint ok');
