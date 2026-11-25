// Tap stories and the house builder: with today's house every tap picks exactly the story it picked before;
// without a pool no pool story plays, without the garage the light house (it decorates the garage) does not.
// Run: node tests/js/taps_house.js  (used by tests/test_house.py; fixture = the picks before the house builder)
const path = require('path'); const vm = require('vm'); const fs = require('fs');
const load = (files) => { const w = { matchMedia: () => ({ matches: false }) }; const ctx = { window: w, localStorage: { getItem: () => null, setItem: () => {} }, Math, Date, JSON, console }; vm.createContext(ctx); files.forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx)); return w; };
const R = (p) => path.join(__dirname, '../..', p);
const now = load([R('frontend_src/house.js'), R('frontend_src/taps.js')]);
const old = process.argv[2] ? load([process.argv[2]]) : null; // only to write the fixture once
const FIX = path.join(__dirname, '../fixtures/taps_today.txt');
const errors = []; let n = 0;
const VIS = ['alltag', 'weihnachten', 'ostern', 'herbst', 'liebe', 'august', 'silvester', 'fasnacht', 'schule'];
const ctxs = [];
for (let d = 0; d < 60; d++) for (const hour of [9, 18, 22]) for (const kind of ['sunny', 'rainy', 'partlycloudy', 'snowy']) for (const vis of VIS) for (const tap of [0, 1, 3, 7])
  ctxs.push({ date: new Date(2026, 0, 1 + d * 6), hour, season: { vis, jz: ['winter', 'fruehling', 'sommer', 'herbst'][Math.floor(d / 15)] }, wx: { kind, temp: kind === 'sunny' ? 31 : 10 }, tap, surprises: 'rare' });
now.FPHOUSE.use({});
if (old) fs.writeFileSync(FIX, ctxs.map((c) => String(old.FPTAPS.pick(c))).join(','));
const before = fs.readFileSync(FIX, 'utf8').split(',');
ctxs.forEach((c, i) => { n += 1; const b = String(now.FPTAPS.pick(c)); if (b !== before[i]) errors.push(`today's house: ${JSON.stringify(c)} picked ${b} instead of ${before[i]}`); });
const POOL = [59, 75, 78, 83, 92];
now.FPHOUSE.use({ water: 'none', left: 'carport' });
ctxs.forEach((c) => { const b = now.FPTAPS.pick(c); if (POOL.includes(b) || b === 65) errors.push(`no pool, no garage: picked story ${b}`); });
now.FPHOUSE.use({ water: 'rund' });
let poolSeen = 0; ctxs.forEach((c) => { if (POOL.includes(now.FPTAPS.pick(c))) poolSeen += 1; });
if (!poolSeen) errors.push('round pool: pool stories never play');
// another house shape: no story that sits on today's roof or chimney, but the pool stories still play when they can
const ROOF = [54, 59, 60, 65, 93, 107];
for (const body of [{ roofform: 'flach' }, { floors: '3' }, { width: 'breit' }, { chimney: 'nein' }]) {
  now.FPHOUSE.use(body); let pool = 0;
  ctxs.forEach((c) => { const b = now.FPTAPS.pick(c); if (ROOF.includes(b)) errors.push(`${JSON.stringify(body)}: picked roof story ${b}`); if (POOL.includes(b)) pool += 1; });
  if (!pool) errors.push(`${JSON.stringify(body)}: pool stories never play`);
}
if (errors.length) { console.error(errors.slice(0, 10).join('\n')); console.error(`${errors.length} errors`); process.exit(1); }
console.log(`ok: ${n} taps unchanged with today's house, pool/garage stories only with a pool/garage, roof stories only on today's roof`);
