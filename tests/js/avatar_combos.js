// Renders every avatar combination of the builder and checks that it is valid and free of conflicts.
// Run: node tests/js/avatar_combos.js  (used by tests/test_avatars.py)
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../../frontend_src/ui_week.js'), 'utf8');
const a = src.indexOf('const AV_HC = '); const b = src.indexOf('// Termin-Zeit kurz');
if (a < 0 || b < 0) throw new Error('avatar code not found');
const esc = (s) => String(s);
const api = new Function('esc', src.slice(a, b) + '\nreturn { AV_HC, AV_SK, AV_ST, AV_ACC, AV_COST, AV_HEAD, AV_EYES, AV_FACE, AV_HAT_COST, AV_MASK_COST, avNorm, avatarGen, avSet, avCode, avParse, avBuilder };')(esc);
const { AV_HC, AV_SK, AV_ST, AV_COST, AV_HEAD, AV_EYES, AV_FACE, AV_HAT_COST, AV_MASK_COST, avNorm, avatarGen, avSet, avBuilder } = api;
const IMAGE = /^av:[a-z0-9.+]{1,80}$/;
let n = 0; const errors = [];
const check = (code, ex) => {
  const svg = avatarGen(code, '#4FA3E0'); n += 1;
  if (!svg.startsWith('<svg') || /undefined|NaN|null/.test(svg)) errors.push(`bad svg: ${code}`);
  const age = code.split('.')[0];
  const norm = avNorm(age, ex);
  const cnt = (g) => norm.filter((x) => g.includes(x)).length;
  if (cnt(AV_COST) > 1 || cnt(AV_HEAD) > 1 || cnt(AV_EYES) > 1) errors.push(`group conflict: ${code} -> ${norm}`);
  const c = norm.find((x) => AV_COST.includes(x));
  if (c && AV_HAT_COST.includes(c) && cnt(AV_HEAD)) errors.push(`hat + costume: ${code}`);
  if (c && AV_MASK_COST.includes(c) && cnt(AV_EYES)) errors.push(`glasses + mask: ${code}`);
  if (age === 'k' && norm.includes('bart')) errors.push(`kid with beard: ${code}`);
};
// every figure, hair style, hair colour and skin tone
for (const age of ['k', 'e', 'o']) for (const st of Object.keys(AV_ST)) for (const hc of Object.keys(AV_HC)) for (const sk of Object.keys(AV_SK)) check(`${age}.${st}.${hc}.${sk}.0`, []);
// every set of extras with every costume, for every figure
const extras = [...AV_FACE, ...AV_EYES, ...AV_HEAD];
for (const age of ['k', 'e', 'o']) for (let m = 0; m < (1 << extras.length); m += 1) {
  const ex = extras.filter((_, i) => m & (1 << i));
  for (const c of ['', ...AV_COST]) { const all = c ? [...ex, c] : ex; check(`${age}.long.braun.hell.${all.join('+') || '0'}`, all); }
}
// the builder only ever produces valid, short codes
let code = 'av:k.kurz.braun.hell.0';
const steps = [['acc', 'brille'], ['acc', 'sonnenbrille'], ['acc', 'cap'], ['cost', 'pirat'], ['acc', 'krone'], ['cost', 'held'], ['acc', 'brille'], ['age', 'e'], ['acc', 'bart'], ['age', 'k'], ['st', 'glatze'], ['cost', 'ninja'], ['acc', 'bart'], ['sk', 'espresso'], ['hc', 'lila']];
for (const [p, v] of steps) { code = avSet(code, p, v); if (!IMAGE.test(code)) errors.push(`builder code invalid: ${code}`); check(code.slice(3), code.slice(3).split('.')[4] === '0' ? [] : code.slice(3).split('.')[4].split('+')); }
if (avBuilder(code, '#4FA3E0').includes('undefined')) errors.push('builder html has undefined');
if (Object.keys(AV_SK).length < 8) errors.push('fewer than 8 skin tones');
if (errors.length) { console.error(errors.slice(0, 20).join('\n')); process.exit(1); }
console.log(`ok ${n} avatars`);
