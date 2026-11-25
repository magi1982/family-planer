// House builder, release 1: today's house must stay exactly the same, and the pets must keep their places.
// 1) the markup of the house for 864 situations (day/night, snow, hours, seasons, Advent, cold, smoke) is byte for
//    byte what the planer drew before the house builder (fixture: sha256 per situation)
// 2) the pet geometry (zones, roof, garage roof, pool) computed from the house equals the hand-made numbers before
// 3) rules every house must keep: walk zones never touch walls or water, the roof perch sits on the roof line, the
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
// 3) rules (for every house the builder will make – here: today's house)
const G = window.FPHEADER.HOUSE; const Z = window.FPHEADER.ZONES;
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const walls = [G.body, G.garageBody].filter(Boolean); const water = [G.pool].filter(Boolean);
Z.filter((z) => z.walk).forEach((z) => { walls.forEach((w) => { if (hit(z.r, w)) errors.push(`walk zone "${z.n}" runs into a wall`); }); water.forEach((w) => { if (hit(z.r, w)) errors.push(`walk zone "${z.n}" runs into the pool`); }); });
const yOn = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return null; };
const ry = yOn(G.roofLine, G.roofPerch.x); if (ry == null || Math.abs((99 - G.roofPerch.z) - ry) > 1) errors.push(`roof perch (z ${G.roofPerch.z}) is not on the roof line (y ${ry})`);
if (G.roofAir[3] > G.body[1] + 0.01 || G.roofAir[1] < 0) errors.push('roof air zone is not above the house');
if (G.garageAir && G.garageAir[3] > G.garageBody[1]) errors.push('garage air zone is not above the garage');
if (G.swim) { const s = G.swim; if (s.cx - s.rx < G.pool[0] - 0.01 || s.cx + s.rx > G.pool[2] + 0.01 || s.cy - s.ry < G.pool[1] - 0.3 || s.cy + s.ry > G.pool[3] + 0.3) errors.push('swim area leaves the pool'); }
window.FPHEADER.HIDES.forEach((h) => { if (G.inPool && G.inPool(h.x, h.y)) errors.push(`hiding place "${h.n}" is in the pool`); });
for (let i = 0; i < 3000; i++) { const [x, y] = window.FPHEADER.HEADER.free(); if (G.inPool(x, y) || walls.some((w) => x > w[0] && x < w[2] && y > w[1] && y < w[3])) { errors.push(`free spot ${x},${y} is in the pool or in a wall`); break; } }
if (errors.length) { console.error(errors.slice(0, 15).join('\n')); console.error(`${errors.length} errors`); process.exit(1); }
console.log(`ok: ${cases.length} situations identical, pet geometry identical, rules kept`);
