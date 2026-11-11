// Draws avatar combinations of the builder (v2) and checks that they are valid and free of clashes.
// Run: node tests/js/avatar_combos.js  (used by tests/test_avatars.py)
const path = require('path');
global.window = {};
require(path.join(__dirname, '../../frontend_src/avatar.js'));
const A = window.FPAV;
const L = A.LISTS;
const SERVER = /^av2:(?:[a-z0-9]{1,14}\.){11}[a-z0-9]{1,14}$/; // same rule as validate.py
let n = 0; const errors = [];
const check = (o) => {
  const c = A.code(o); n += 1;
  if (!SERVER.test(c)) errors.push(`code not accepted by the server: ${c}`);
  const svg = A.svg(c, '#4FA3E0');
  if (!svg.startsWith('<svg') || /undefined|NaN|null|\[object/.test(svg)) errors.push(`bad svg: ${c}`);
  const d = A.norm(A.parse(c));
  if (d.cost !== '0' && A.COST_HAT.includes(d.cost) && d.head !== '0') errors.push(`hat under a costume: ${c}`);
  if (d.cost !== '0' && A.COST_MASK.includes(d.cost) && A.GLASSES.includes(d.face)) errors.push(`glasses under a mask: ${c}`);
  if (d.cost !== '0' && (d.neck !== '0' || d.motif !== '0')) errors.push(`neck/motif under a suit: ${c}`);
  if (A.BEARD.includes(d.face) && !['h', 'p'].includes(d.fig)) errors.push(`beard on ${d.fig}: ${c}`);
  if (d.hair === 'glatze' && A.KID(d.fig)) errors.push(`bald child: ${c}`);
};
const base = { fig: 'm', hair: 'lang', hc: 'braun', sk: 'hell', head: '0', face: '0', neck: '0', shirt: 'blau', motif: '0', pet: '0', bg: '0', cost: '0' };
const opt = (k) => ['0', ...L[k]];
// every person, hair style, hair colour and skin tone
for (const fig of L.fig) for (const hair of L.hair) for (const hc of L.hc) for (const sk of L.sk) check({ ...base, fig, hair, hc, sk });
// every head, face and costume for every person
for (const fig of L.fig) for (const head of opt('head')) for (const face of opt('face')) for (const cost of opt('cost')) check({ ...base, fig, head, face, cost });
// clothes, buddies, backgrounds with every costume
for (const shirt of L.shirt) for (const neck of opt('neck')) for (const motif of opt('motif')) for (const cost of opt('cost')) check({ ...base, shirt, neck, motif, cost });
for (const pet of opt('pet')) for (const bg of opt('bg')) for (const cost of opt('cost')) check({ ...base, fig: 'j', hair: 'afro', pet, bg, cost });
// the builder: every tap gives a valid code, and a tap on a hidden part shows it
let c = 'av2:m.lang.braun.hell.0.0.0.blau.0.0.0.0';
for (const f of A.FIELDS) for (const v of L[f]) {
  const next = A.set(c, f, v);
  if (!SERVER.test(next)) errors.push(`set(${f}, ${v}) -> ${next}`);
  if (A.OPTIONAL.includes(f) && f !== 'cost' && A.parse(c)[f] !== v && A.norm(A.parse(next))[f] !== v && !(f === 'face' && A.BEARD.includes(v))) errors.push(`tap on ${f}=${v} has no effect`);
  c = next;
}
if (A.parse(A.set('av2:h.kurz.braun.hell.0.0.0.blau.0.0.0.0', 'face', 'bart')).face !== 'bart') errors.push('beard on a man');
// old pictures are converted
for (const old of ['av:k.long.blond.hell.0', 'av:e.kurz.braun.hell.bart', 'av:o.glatze.grau.hell.bart+brille', 'av:k.zoepfe.braun.oliv.held', 'av:k.kurz.schwarz.mittel.pirat', 'x']) {
  const v = A.from1(old); if (!SERVER.test(v)) errors.push(`from1(${old}) -> ${v}`);
}
for (let i = 0; i < 200; i += 1) check(A.parse(A.random()));
const html = A.builder(c, '#4FA3E0', 'de', 'cost') + A.builder(c, '#4FA3E0', 'en', 'cloth');
if (/undefined|NaN/.test(html)) errors.push('builder html has undefined');
if (Object.keys(A.SK).length < 8 || L.hair.length < 15) errors.push('too few skin tones or hair styles');
if (errors.length) { console.error(errors.slice(0, 20).join('\n')); process.exit(1); }
console.log(`ok ${n} avatars`);
