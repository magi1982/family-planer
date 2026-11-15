// Every season scene with every weather state, every seasonal avatar extra and effect renders cleanly.
// Run: node tests/js/season_combos.js  (used by tests/test_avatars.py)
const path = require('path');
global.window = { matchMedia: () => ({ matches: false }) };
global.localStorage = { getItem: () => null, setItem: () => {} };
require(path.join(__dirname, '../../frontend_src/season.js'));
require(path.join(__dirname, '../../frontend_src/avatar.js'));
require(path.join(__dirname, '../../frontend_src/avseason.js'));
const S = window.FPSEASON; const A = window.FPAV; const X = window.FPAVS;
const errors = []; let n = 0;
const bad = (html) => /undefined|NaN|\[object|null/.test(html);
const VIS = Object.keys(X.DATA.VIS).concat(['alltag']);
const KINDS = ['sunny', 'clear-night', 'partlycloudy', 'cloudy', 'rainy', 'pouring', 'lightning', 'snowy', 'fog', 'windy'];
for (const vis of VIS) for (const jz of ['fruehling', 'sommer', 'herbst', 'winter']) for (const kind of KINDS) for (const hour of [9, 21, 23]) {
  const se = { vis, jz, key: vis, sub: vis === 'weihnachten' ? 'advent2' : null, advent: vis === 'weihnachten' ? 2 : 0, snow: true, wild: 3, anniversary: vis === 'liebe' ? { key: 'hochzeitstag', years: 12 } : null };
  const html = S.scene({ season: se, wx: { kind, wind: 30, temp: 5 }, hour, lang: 'de', intensity: 'lots', storm: 50, still: false });
  n += 1; if (!html.startsWith('<div class="scn') || bad(html)) errors.push(`scene ${vis}/${jz}/${kind}/${hour}`);
}
const code = A.code({ ...A.parse(''), fig: 'm', hair: 'lang', hc: 'braun', sk: 'hell', shirt: 'blau' });
const SERVER = /^av2:(?:[a-z0-9]{1,16}\.){11,13}[a-z0-9]{1,16}$/;
for (const [k, x] of Object.entries(X.DATA.X)) {
  let cur = code; for (const [part, val] of Object.entries(x[3] || {})) cur = A.set(cur, part, val);
  if (!SERVER.test(cur)) errors.push(`extra ${k}: base override gives a bad code ${cur}`);
  const svg = X.decorate(code, '#4FA3E0', 'Lea', { x: [k], fx: '' }); n += 1;
  if (!svg.startsWith('<svg') || bad(svg) || !x[1]) errors.push(`extra ${k}`);
}
for (const [g, keys] of Object.entries(X.DATA.G)) for (const k of keys) if (!X.DATA.X[k]) errors.push(`group ${g}: unknown extra ${k}`);
for (const k of Object.keys(X.DATA.FX)) { const h = X.outer('Lea', { x: [], fx: k }); n += 1; if (!h.includes('<svg') || bad(h)) errors.push(`effect ${k}`); }
for (const v of Object.keys(X.DATA.VIS)) if (!Object.values(X.DATA.FX).some((f) => f[2] === X.DATA.FXVIS[v])) errors.push(`no effects for ${v}`);
if (Object.keys(X.DATA.X).length < 80 || Object.keys(X.DATA.FX).length < 50) errors.push('catalogue too small');
// suggestions never break and respect the noon start
const snap = { lang: 'de', season: { vis: 'alltag' }, season_cfg: { sug_from: '12:00' }, persons: [], busy: {}, items: [], today: '2026-07-04' };
if (S.suggest(snap, { states: {} }, { kind: 'sunny', temp: 28 }, [], new Date('2026-07-04T10:00:00')) !== null) errors.push('suggestion before noon');
const sg = S.suggest(snap, { states: {} }, { kind: 'rainy', temp: 12 }, [], new Date('2026-07-04T15:00:00'));
if (!sg || !sg.title || bad(JSON.stringify(sg))) errors.push('no suggestion on a rainy afternoon');
if (errors.length) { console.error(errors.slice(0, 30).join('\n')); process.exit(1); }
console.log(`ok ${n}`);
