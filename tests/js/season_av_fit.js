// The automatic season extra never covers what a person chose (hat, glasses, scarf, pet).
// Run: node tests/js/season_av_fit.js  (used by tests/test_avatars.py)
const path = require('path');
global.window = { matchMedia: () => ({ matches: false }) };
require(path.join(__dirname, '../../frontend_src/avatar.js'));
require(path.join(__dirname, '../../frontend_src/avseason.js'));
const A = window.FPAV; const X = window.FPAVS; const errors = []; let n = 0;
X.setPersons([{ name: 'Lea' }, { name: 'Mia' }, { name: 'Tom' }]);
for (const v of Object.keys(X.DATA.VIS)) for (const head of ['0', 'cap', 'levelcap', 'krone']) for (const face of ['0', 'brille']) for (const name of ['Lea', 'Mia', 'Tom']) {
  const code = A.code({ ...A.parse(''), fig: 'm', hair: 'lang', hc: 'braun', sk: 'hell', shirt: 'blau', head, face });
  const c = X.choice(name, v, code); n += 1;
  if (c && !c.x.every((k) => X.fits(k, code))) errors.push(`${v}/${head}/${face}/${name}: ${c.x.join(',')} covers the own choice`);
}
// an own choice is always kept as it is
X.setPersons([{ name: 'Lea', season_av: { herbst: { x: ['pilzhut'], fx: '' } } }]);
const own = X.choice('Lea', 'herbst', A.code({ ...A.parse(''), head: 'cap' })); n += 1;
if (!own || own.x[0] !== 'pilzhut') errors.push('own choice changed');
if (errors.length) { console.error(errors.slice(0, 20).join('\n')); process.exit(1); }
console.log(`ok ${n}`);
