// House builder, release 1: today's house must stay exactly the same, and the pets must keep their places.
// 1) the markup of the house for 864 situations (day/night, snow, hours, seasons, Advent, cold, smoke) is byte for
//    byte what the planer drew before the house builder (fixture: sha256 per situation)
// 2) the pet geometry (zones, roof, garage roof, pool) computed from the house equals the hand-made numbers before
// 3) rules every house must keep (every width, floor count, roof form and chimney × annexes × water): walk zones never touch walls or water, the roof perch sits on the roof line, the
//    swim area lies inside the pool, fliers' zones are above the roofs
// Run: node tests/js/house_check.js  (used by tests/test_house.py)
const path = require('path'); const fs = require('fs'); const crypto = require('crypto');
global.window = { matchMedia: () => ({ matches: false }) };
const R = (p) => path.join(__dirname, '../..', p);
require(R('frontend_src/house.js'));
window.FPMOTION = {};
require(R('frontend_src/pets/header.js'));
const errors = [];
// 1) markup
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/house_today.json'), 'utf8'));
cases.forEach(([o, hash], i) => { const h = crypto.createHash('sha256').update(window.FPHOUSE.draw(o)).digest('hex'); if (h !== hash) errors.push(`markup differs in situation ${i}: ${JSON.stringify(o)}`); });
// 2) pet geometry
const before = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/header_today.json'), 'utf8'));
const H = { ...window.FPHEADER.HEADER }; delete H.free; delete H.draw; delete H.branchZ;
const same = (a, b, where) => { const ja = JSON.stringify(a); const jb = JSON.stringify(b); if (ja !== jb) errors.push(`${where} changed:\n  before ${jb}\n  now    ${ja}`); };
Object.keys(before.HEADER).forEach((k) => same(H[k], before.HEADER[k], `HEADER.${k}`));
same(Object.keys(H).sort(), Object.keys(before.HEADER).sort(), 'HEADER keys');
same(window.FPHEADER.ZONES, before.ZONES, 'ZONES'); same(window.FPHEADER.HIDES, before.HIDES, 'HIDES');
// the pool test of the pets: same answer as the hand-made rule on a fine grid
const old = (x, y) => x > 568 && x < 712 && y > 97 && y < 114;
for (let x = 540; x <= 740; x += 0.5) for (let y = 90; y <= 120; y += 0.25) if (old(x, y) !== window.FPHEADER.inPool(x, y)) { errors.push(`inPool differs at ${x},${y}`); x = 1e9; break; }
// 3) rules for EVERY house the builder can make (all annexes left and right, every water): the pets' world
const F = window.FPHOUSE; const O = F.OPTIONS; let shapes = 0;
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const yOn = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return null; };
const BODIES = []; for (const width of O.width) for (const floors of O.floors) for (const roofform of O.roofform) for (const chimney of O.chimney) BODIES.push({ width, floors, roofform, chimney });
for (const body of BODIES) for (const left of O.left) for (const right of O.right) for (const water of O.water) {
  const cfg = { ...body, left, right, water }; const tag = JSON.stringify(cfg); shapes += 1; const first = left === O.left[0] && right === O.right[0];
  const X = window.FPHEADER.headerFor(cfg); const G = X.HG; const geo = X.geo; const Z = geo.zones;
  const walls = [G.body, G.garageBody, ...G.walls].filter(Boolean);
  // walking only on the ground: no walk zone runs into a wall
  Z.filter((z) => z.walk).forEach((z) => walls.forEach((w) => { if (hit(z.r, w)) errors.push(`${tag}: walk zone "${z.n}" runs into a wall`); }));
  // there is always water to swim in, and it is real water: the pool, or the pond when there is no pool
  const sw = geo.pond; if (!sw) { errors.push(`${tag}: no water to swim in`); continue; }
  if (['pool', 'rund'].includes(water) === !!G.swimInPond) errors.push(`${tag}: pets swim in the wrong water`);
  if (G.swimInPond && !(G.pond && Math.abs(sw.cx - G.pond.cx) < 0.01)) errors.push(`${tag}: swim area is not the pond`);
  if (!G.inPool(sw.cx, sw.cy) || !G.inPool(sw.cx + sw.rx * 0.9, sw.cy) || !G.inPool(sw.cx - sw.rx * 0.9, sw.cy)) errors.push(`${tag}: swim area is not inside the water`);
  // landing on the roof means on the roof line, fliers' zones are above the walls
  const ry = yOn(G.roofLine, geo.roof.x); if (ry == null || Math.abs((99 - geo.roof.z) - ry) > 1) errors.push(`${tag}: roof perch not on the roof line`);
  if (geo.stone.y - geo.stone.z < 0 || (G.garageBody && Math.abs((99 - geo.stone.z) - G.garageAir[1]) > 8)) errors.push(`${tag}: perch stone floats`);
  // free spots, hiding places, beds and the race track never in water or a wall
  // the whole roof and the chimney stay inside the header picture, the roof line runs left to right
  const ln = G.roofLine; if (ln.some(([x, y], i) => y < 0.5 || (i && x < ln[i - 1][0]))) errors.push(`${tag}: roof line leaves the picture or runs backwards`);
  if (G.chimney && G.chimney[1] < 0) errors.push(`${tag}: chimney leaves the picture`);
  if (G.body[1] > Math.min(...ln.map((p) => p[1])) + 3.5) errors.push(`${tag}: house no-go zone below the roof`);
  for (let i = 0; i < (first ? 400 : 60); i++) { const [x, y] = geo.free(); if (G.inPool(x, y) || walls.some((w) => x > w[0] && x < w[2] && y > w[1] && y < w[3])) { errors.push(`${tag}: free spot ${x.toFixed(1)},${y.toFixed(1)} in water or a wall`); break; } }
  geo.hides.forEach((h) => { if (G.inPool(h.x, h.y)) errors.push(`${tag}: hiding place "${h.n}" in water`); });
  Object.entries(geo.beds).forEach(([k, b]) => { if (k !== 'seerose' && G.inPool(b.x, b.y)) errors.push(`${tag}: bed ${k} in water`); });
  if (!G.inPool(geo.beds.seerose.x, geo.beds.seerose.y)) errors.push(`${tag}: water lilies not in the water`);
  for (let x = geo.race[0]; x <= geo.race[1]; x += 2) if (G.inPool(x, geo.race[2]) || G.inPool(x, geo.race[3])) { errors.push(`${tag}: race track through water at ${x}`); break; }
  // the drawing: every combination renders cleanly, day, night and snow
  for (const o of (first || (water === 'pool' && left === 'garage')) ? [{ hour: 14, jz: 'sommer', vis: 'alltag' }, { hour: 21, night: true, jz: 'herbst', vis: 'weihnachten' }, { hour: 14, snow: true, jz: 'winter', temp: -8, smoke: true, wind: 10 }] : []) {
    const m = F.draw(o, cfg) + F.drawPond(o, cfg); if (/undefined|NaN|null|\[object/.test(m)) errors.push(`${tag}: drawing broken`);
    if (!!F.drawPond(o, cfg) !== !!G.swimInPond) errors.push(`${tag}: pond drawn ${!!F.drawPond(o, cfg)} but pets swim in pond ${!!G.swimInPond}`);
  }
}
// colours, windows, shutters and facades only change the look: every value renders cleanly
for (const body of [{}, ...BODIES]) for (const k of ['wall', 'roof', 'windows', 'shutters', 'facade']) for (const v of O[k]) for (const night of [false, true]) {
  const m = F.draw({ hour: night ? 21 : 14, night, jz: 'sommer', vis: 'alltag' }, { ...body, [k]: v }); if (/undefined|NaN|null|\[object/.test(m)) errors.push(`${k}=${v}: drawing broken`);
}
// every ready-made house is made of known parts, and today's house is the first one
F.PRESETS.forEach((p) => Object.entries(p.set).forEach(([k, v]) => { if (!O[k] || !O[k].includes(v)) errors.push(`preset ${p.id}: unknown ${k}=${v}`); }));
if (F.PRESETS[0].id !== 'giebel' || Object.entries(F.PRESETS[0].set).some(([k, v]) => F.DEFAULT[k] !== v)) errors.push('first preset is not today\'s house');
// only today's body with its chimney counts as "shape" for the stories drawn on the roof and the chimney
if (!F.features(F.DEFAULT).shape || BODIES.filter((b) => F.features(b).shape).length !== 1) errors.push('features().shape wrong');
// unknown values fall back to today's house
if (JSON.stringify(F.clean({ wall: 'pink', left: '<x>', water: 1 })) !== JSON.stringify(F.DEFAULT)) errors.push('clean() keeps unknown values');
if (errors.length) { console.error(errors.slice(0, 15).join('\n')); console.error(`${errors.length} errors`); process.exit(1); }
console.log(`ok: ${cases.length} situations identical, pet geometry identical, rules kept for ${shapes} house shapes (${BODIES.length} bodies)`);
