// Tap stories: every story renders cleanly (German and English) and the choice of the story fits the day.
// Run: node tests/js/taps_pick.js  (used by tests/test_taps.py)
const path = require('path');
global.window = { matchMedia: () => ({ matches: false }) };
require(path.join(__dirname, '../../frontend_src/taps.js'));
const T = window.FPTAPS; const errors = []; const ok = (c, m) => { if (!c) errors.push(m); };
const bad = (g) => /undefined|NaN|\[object|null/.test(g);
// 1. every story renders, in both languages, and the CSS builds
ok(T.list.length === 62, `62 stories expected, got ${T.list.length}`);
ok(T.css().length > 1000 && !/undefined|NaN/.test(T.css()), 'story CSS');
for (const o of T.list) {
  const g = typeof o.g === 'function' ? o.g() : o.g;
  ok(!bad(g), `story ${o.n} renders bad values`); ok(o.dur >= 8 && o.dur <= 30, `story ${o.n} duration`);
}
for (const [de, en] of Object.entries(T.EN)) ok(en && en !== de || de === en, `EN text for ${de}`);
// 2. the choice over two years, every slot and weather
const KINDS = ['sunny', 'partlycloudy', 'cloudy', 'rainy', 'windy', 'snowy', 'clear-night', 'fog'];
const seen = new Set(); const sea = (d) => (d.getMonth() < 2 || d.getMonth() === 11 ? 'winter' : d.getMonth() < 5 ? 'fruehling' : d.getMonth() < 8 ? 'sommer' : 'herbst');
const SPECIAL = [{ vis: 'geburtstag', birthdays: ['p1'] }, { vis: 'liebe' }, { vis: 'fasnacht' }, { vis: 'ostern' }, { vis: 'schule' }, { vis: 'august' },
  { vis: 'weihnachten', sub: 'samichlaus' }, { vis: 'weihnachten' }, { vis: 'silvester', key: 'silvester' }, { vis: 'sommer', beach: true },
  { fun: { key: 'dino', scene: true } }, { fun: { key: 'mobile', scene: true } }, { fun: { key: 'volcano', scene: true } }, { fun: { key: 'moon', scene: true } },
  { fun: { key: 'titanic', scene: true } }, { fun: { key: 'uk', scene: true } }, { fun: { key: 'sputnik', scene: false } }, {}];
for (let i = 0; i < 730; i += 1) {
  const d = new Date(2027, 0, 1 + i);
  for (const sp of SPECIAL) for (const kind of KINDS) for (const [hour, night] of [[10, false], [18, false], [22, true]]) for (const temp of [-5, 15, 24, 32]) {
    const ctx = { season: { vis: 'alltag', jz: sea(d), snow: false, ...sp }, wx: { kind, temp }, hour, night, frost: temp < 0 && kind === 'sunny', date: d, surprises: 'rare', rained: kind === 'sunny' && temp === 15 };
    const n = T.pick(ctx); if (typeof n === 'number') { seen.add(n); ok(T.list.some((x) => x.n === n), `unknown story ${n}`); }
  }
}
const missing = T.list.map((o) => o.n).filter((n) => !seen.has(n)); ok(!missing.length, `stories that never play: ${missing.join(', ')}`);
// 3. special days
const P = (season, extra = {}) => T.pick({ season, wx: { kind: 'sunny', temp: 20 }, hour: 10, night: false, date: new Date(2027, 6, 20), surprises: 'off', ...extra });
ok(P({ fun: { key: 'moon', scene: true } }) === 'lm', 'moon day: lunar module');
ok(P({ fun: { key: 'moon', scene: true } }, { hour: 23, night: true }) === 'lm', 'moon night: lunar module, no telescope');
ok(P({ fun: { key: 'titanic', scene: true } }) === 'titanic', 'Titanic day');
ok(P({ fun: { key: 'dino', scene: true } }) === 103 && P({ fun: { key: 'mobile', scene: true } }) === 40 && P({ fun: { key: 'volcano', scene: true } }) === 42, 'fun days');
ok(P({ fun: { key: 'uk', scene: true } }) === null && P({ vis: 'vatertag' }) === null, 'scenes without the house have no story');
ok(P({ fun: { key: 'sputnik' }, jz: 'herbst' }, { hour: 18 }) === 44 && P({ fun: { key: 'sputnik' }, jz: 'herbst' }, { hour: 22, night: true }) === 76, 'Sputnik week: launch pad, then telescope');
ok(P({ vis: 'silvester', key: 'silvester' }, { hour: 23, night: true }) === 22, 'New Year fireworks at night');
ok(P({ vis: 'weihnachten', sub: 'samichlaus', jz: 'winter' }) === 19, 'St. Nicholas');
// 4. weather is live: the same day changes story when the weather changes
const day = { season: { vis: 'alltag', jz: 'sommer' }, hour: 11, night: false, date: new Date(2027, 6, 7), surprises: 'off' };
ok(T.pick({ ...day, wx: { kind: 'rainy', temp: 18 } }) === 68 && T.pick({ ...day, wx: { kind: 'windy', temp: 18 } }) === 51, 'weather decides live');
// 5. one story per slot and day, not the same on two days in a row
for (let i = 0; i < 60; i += 1) {
  const a = new Date(2027, 3, 1 + i); const b = new Date(2027, 3, 2 + i);
  const c = { season: { vis: 'alltag', jz: 'fruehling' }, wx: { kind: 'cloudy', temp: 12 }, hour: 10, night: false, surprises: 'off' };
  ok(T.pick({ ...c, date: a }) === T.pick({ ...c, date: a }), 'stable within the day');
  ok(T.pick({ ...c, date: a }) !== T.pick({ ...c, date: b }), `same story two days in a row (${a.toDateString()})`);
}
// 6. surprises: off never, rare about one day a week, often about three
const count = (mode) => { let k = 0; for (let i = 0; i < 700; i += 1) { const d = new Date(2027, 0, 1 + i); const n = T.pick({ season: { vis: 'alltag', jz: 'fruehling' }, wx: { kind: 'cloudy' }, hour: 10, night: false, date: d, surprises: mode }); if (T.SURPRISE.day.includes(n)) k += 1; } return k; };
const off = count('off'); const rare = count('rare'); const often = count('often');
ok(off === 0, `surprises off: ${off}`); ok(rare > 60 && rare < 150, `surprises rare: ${rare} of 700`); ok(often > 220 && often < 380, `surprises often: ${often} of 700`);
// 7. every tap brings the next story: weather leads the first tap, then many different ones without repeats
for (const [jz, kind, hour, night] of [['herbst', 'partlycloudy', 10, false], ['herbst', 'rainy', 15, false], ['winter', 'cloudy', 11, false], ['winter', 'cloudy', 18, false], ['herbst', 'clear-night', 22, true]]) {
  const c = { season: { vis: 'alltag', jz }, wx: { kind, temp: 8 }, hour, night, date: new Date(2027, 10, 19), surprises: 'rare' };
  const seq = Array.from({ length: 30 }, (_, i) => T.pick({ ...c, tap: i }));
  ok(seq[0] === T.pick(c), `${jz}/${kind}: first tap as before`);
  const n = new Set(seq).size; ok(n >= 5, `${jz}/${kind} ${hour}h: only ${n} different stories over 30 taps`);
  const firstRound = seq.slice(0, n); ok(new Set(firstRound).size === n, `${jz}/${kind}: a story repeats before all played`);
  ok(seq.every((x) => T.list.some((o) => o.n === x)), `${jz}/${kind}: unknown story`);
}
const pc = { season: { vis: 'alltag', jz: 'herbst' }, wx: { kind: 'partlycloudy', temp: 10 }, hour: 10, night: false, date: new Date(2027, 10, 19), surprises: 'off' };
ok(T.pick(pc) === 49 && T.pick({ ...pc, tap: 1 }) !== 49, 'unicorn only on the first tap');
ok(typeof T.taps === 'function' && typeof T.bump === 'function', 'tap counter');
if (errors.length) { console.error(errors.slice(0, 30).join('\n')); process.exit(1); }
console.log('ok', T.list.length, 'stories,', seen.size, 'reachable');
