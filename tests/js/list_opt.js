// Checks when the background "optimise" run of a list counts as finished (frontend_src/lists.js).
// Run: node tests/js/list_opt.js  (used by tests/test_lists_js.py)
const path = require('path');
global.window = global; global.HTMLElement = class {}; global.customElements = { define() {}, get() { return undefined; } };
require(path.join(__dirname, '../../frontend_src/lists.js'));
const S = window.FPLISTOPT; const errors = [];
const eq = (a, b, m) => { if (a !== b) errors.push(`${m}: ${a} != ${b}`); };
const pend = { prev: '2026-11-17T10:00:00', t: 1000 };
eq(S({ busy: true, opt_result: null }, pend, 2000), 'wait', 'still busy');
eq(S({ busy: false, opt_result: { at: '2026-11-17T10:00:00' } }, pend, 2000), 'wait', 'old result is not the answer');
eq(S({ busy: true, opt_result: { at: '2026-11-17T11:00:00' } }, pend, 2000), 'wait', 'new result but still busy');
eq(S({ busy: false, opt_result: { at: '2026-11-17T11:00:00', ok: true } }, pend, 2000), 'done', 'new result');
eq(S({ busy: false, opt_result: { at: '2026-11-17T11:00:00' } }, { prev: '', t: 0 }, 5), 'done', 'first run ever');
eq(S({ busy: true }, pend, 1000 + 120001), 'gone', 'gives up after two minutes');
eq(S(undefined, pend, 2000), 'wait', 'list missing for a moment');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('list optimise states ok');
