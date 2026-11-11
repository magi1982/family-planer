// Family Planer cards – built by frontend_src/build.py, do not edit
// ---------------------------------------------------------------------------
// Avatar builder v2: layered SVG avatars, code 'av2:' + 12 dot-separated parts (all ids from fixed lists)
//   fig.hair.hc.sk.head.face.neck.shirt.motif.pet.bg.cost.fx.fxb   ('0' = none; fx / fxb = small / big effects from levels)
// Level extras (LOCKED) are offered only to the person who unlocked them (server checks it too).
// Old 'av:' codes (v1) are converted with FPAV.from1(). Every combination is drawn by tests/js/avatar_combos.js.
// ---------------------------------------------------------------------------
(() => {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#4FA3E0');

  // ---------------------------------------------------------------- palettes
  const SK = { porzellan: '#FBE3CF', hell: '#F3CDA6', pfirsich: '#EDBB8F', mittel: '#E3B48A', oliv: '#C99167', karamell: '#B07A52', braun: '#8D5A3B', tief: '#6B4129', espresso: '#4A2C1C' };
  const HC = { platin: ['#F2E6C2', '#D9C998'], blond: ['#EBC55A', '#D4A63B'], rotblond: ['#E39B4F', '#C47C33'], hellbraun: ['#B5814A', '#94663A'], braun: ['#8B5A2B', '#6E4520'],
    schwarz: ['#3A3330', '#26211F'], rot: ['#D2662F', '#A9491E'], grau: ['#CDD1D5', '#A9AEB3'], rosa: ['#F49AC1', '#D9779F'], blau: ['#5FA8E8', '#3F86C6'], lila: ['#A98BE8', '#8566C9'], gruen: ['#5CC98A', '#3FA56B'] };
  const SHIRT = { weiss: '#F4F4F4', grau: '#8A939E', schwarz: '#2E3138', rot: '#E05555', orange: '#F08A3C', gelb: '#F5C542', gruen: '#5CB85C', tuerkis: '#3FC1B0', blau: '#4A7FD6', lila: '#8E6BD6', pink: '#EC6FA8', braun: '#9A6A44' };

  // ---------------------------------------------------------------- parts (ids are the code values)
  const FIG = ['m', 'j', 'f', 'h', 'g', 'p']; // Mädchen, Junge, Frau, Mann, Grosi, Grosspapi
  const KID = (f) => f === 'm' || f === 'j';
  const OLD = (f) => f === 'g' || f === 'p';
  const HAIR = ['kurz', 'seite', 'stachel', 'wuschel', 'undercut', 'irokese', 'lockenkurz', 'glatze', 'lang', 'pony', 'zoepfe', 'pferd', 'dutt', 'buns', 'bob', 'locken', 'afro', 'rastas'];
  const HEAD = ['levelcap', 'skaterhelm', 'edelkrone', 'rubinkrone', 'cap', 'muetze', 'krone', 'blumen', 'katze', 'hase', 'baer', 'einhorn', 'party', 'kopfhoerer', 'stirnband', 'schleife'];
  const FACE = ['goldbrille', 'funkelsprossen', 'diamantbrille', 'rubinmaske', 'brille', 'eckig', 'sonnenbrille', 'sommersprossen', 'glitzer', 'pflaster', 'tiger', 'schmetterling', 'bart', 'schnauz'];
  const NECK = ['rubinumhang', 'schal', 'fliege', 'kette'];
  const MOTIF = ['stern', 'herz', 'blitz', 'ball', 'rakete'];
  const PET = ['hamster', 'babydrache', 'phoenix', 'kristallfuchs', 'rubindrache', 'szepter', 'katze', 'hund', 'hase', 'papagei', 'eidechse', 'affe', 'drache', 'pinguin', 'fuchs', 'roboter', 'eule', 'ballon', 'fussball', 'gitarre', 'zauberstab'];
  const BG = ['comic', 'sonnenuntergang', 'kristallhoehle', 'lavagalaxie', 'sterne', 'regenbogen', 'herzen', 'konfetti', 'weltall', 'wolken', 'blasen', 'blitze'];
  const FX = ['sternchen', 'leuchtaugen', 'goldglanz', 'rubinsplitter', 'feuerfunken', 'rubinglanz', 'herzfunken', 'schneeflocken'];
  const FXB = ['silberaura', 'gluehwuermchen', 'goldfluegel', 'goldregen', 'flammenaura', 'komet', 'blitzgewitter', 'galaxie'];
  const LOCKED = ['levelcap', 'goldbrille', 'funkelsprossen', 'hamster', 'comic', 'skaterhelm', 'babydrache', 'rennfahrer', 'sonnenuntergang', 'edelkrone',
    'phoenix', 'goldritter', 'diamantbrille', 'kristallhoehle', 'kristallfuchs', 'eiskoenig', 'rubinkrone', 'rubindrache', 'lavagalaxie', 'feuertitan',
    'rubinumhang', 'szepter', 'rubinmaske', ...FX, ...FXB];
  const COST = ['rennfahrer', 'goldritter', 'eiskoenig', 'feuertitan', 'astro', 'mars', 'sternenkraft', 'funkenflug', 'mondfee', 'turbo', 'sternschnuppe', 'ninja', 'ritter', 'pirat', 'zauberer', 'prinzessin', 'prinz', 'dino', 'feuerwehr'];
  // costumes with something on the head hide the head slot; masks hide glasses; full suits hide neck and motif
  const COST_HAT = ['rennfahrer', 'goldritter', 'eiskoenig', 'feuertitan', 'astro', 'mars', 'ninja', 'ritter', 'pirat', 'zauberer', 'prinzessin', 'prinz', 'dino', 'feuerwehr'];
  const COST_MASK = ['sternenkraft', 'funkenflug', 'mondfee', 'turbo', 'sternschnuppe', 'ninja'];
  const GLASSES = ['brille', 'eckig', 'sonnenbrille', 'goldbrille', 'diamantbrille', 'rubinmaske'];
  const BEARD = ['bart', 'schnauz'];
  const FIELDS = ['fig', 'hair', 'hc', 'sk', 'head', 'face', 'neck', 'shirt', 'motif', 'pet', 'bg', 'cost', 'fx', 'fxb'];
  const LISTS = { fig: FIG, hair: HAIR, hc: Object.keys(HC), sk: Object.keys(SK), head: HEAD, face: FACE, neck: NECK, shirt: Object.keys(SHIRT), motif: MOTIF, pet: PET, bg: BG, cost: COST, fx: FX, fxb: FXB };
  const OPTIONAL = ['head', 'face', 'neck', 'motif', 'pet', 'bg', 'cost', 'fx', 'fxb'];
  const DEFAULT = { fig: 'm', hair: 'lang', hc: 'braun', sk: 'hell', head: '0', face: '0', neck: '0', shirt: 'blau', motif: '0', pet: '0', bg: '0', cost: '0', fx: '0', fxb: '0' };

  // ---------------------------------------------------------------- code
  const parse = (code) => {
    const raw = String(code || '').replace(/^av2:/, '').split('.');
    const o = {};
    FIELDS.forEach((f, i) => { const v = raw[i]; o[f] = (OPTIONAL.includes(f) && v === '0') ? '0' : (LISTS[f].includes(v) ? v : DEFAULT[f]); });
    return o;
  };
  // what is actually drawn: parts that would clash are left out
  const norm = (o0) => {
    const o = { ...o0 };
    if (o.cost !== '0') {
      if (COST_HAT.includes(o.cost)) o.head = '0';
      if (COST_MASK.includes(o.cost) && GLASSES.includes(o.face)) o.face = '0';
      if (o.cost === 'ninja') o.face = '0';
      o.neck = '0'; o.motif = '0';
    }
    if (BEARD.includes(o.face) && !(o.fig === 'h' || o.fig === 'p')) o.face = '0';
    if (o.hair === 'glatze' && KID(o.fig)) o.hair = 'kurz';
    return o;
  };
  const code = (o) => 'av2:' + FIELDS.map((f) => o[f] || '0').join('.');
  const set = (c, part, val) => {
    const o = parse(c);
    if (!FIELDS.includes(part)) return code(o);
    if (OPTIONAL.includes(part)) o[part] = (val === '0' || o[part] === val) ? '0' : (LISTS[part].includes(val) ? val : '0');
    else if (LISTS[part].includes(val)) o[part] = val;
    // choosing something that a costume would hide takes the costume off, so the tap always shows its effect
    if (o.cost !== '0' && part !== 'cost' && OPTIONAL.includes(part) && o[part] !== '0') {
      const n = norm(o); if (n[part] !== o[part]) o.cost = '0';
    }
    if (part === 'face' && BEARD.includes(o.face) && !(o.fig === 'h' || o.fig === 'p')) o.fig = 'h';
    return code(norm(o));
  };
  // old v1 codes 'av:k.long.blond.hell.brille+held' -> v2
  const from1 = (c) => {
    const [age, st, hc, sk, acc] = String(c || '').replace(/^av:/, '').split('.');
    const ex = acc && acc !== '0' ? acc.split('+') : [];
    const girl = ['long', 'ponylang', 'zoepfe', 'dutt', 'bob', 'locken', 'pferd'].includes(st);
    const fig = age === 'o' ? (girl ? 'g' : 'p') : age === 'e' ? (girl ? 'f' : 'h') : (girl ? 'm' : 'j');
    const hair = { long: 'lang', ponylang: 'pony', zoepfe: 'zoepfe', dutt: 'dutt', bob: 'bob', locken: 'locken', pferd: 'pferd', kurz: 'kurz', seite: 'seite', stachel: 'stachel', lockenkurz: 'lockenkurz', glatze: 'glatze' }[st] || 'kurz';
    const pick = (map) => { for (const [k, v] of Object.entries(map)) if (ex.includes(k)) return v; return '0'; };
    return code(norm({ fig, hair, hc: HC[hc] ? hc : 'braun', sk: SK[sk] ? sk : 'hell',
      head: pick({ cap: 'cap', krone: 'krone', katze: 'katze', einhorn: 'einhorn', kopfhoerer: 'kopfhoerer', schleife: 'schleife', stirnband: 'stirnband' }),
      face: pick({ sonnenbrille: 'sonnenbrille', brille: 'brille', bart: 'bart', sommersprossen: 'sommersprossen' }),
      neck: '0', shirt: 'blau', motif: '0', pet: '0', bg: '0',
      cost: pick({ held: 'sternenkraft', blitz: 'funkenflug', nacht: 'mondfee', ninja: 'ninja', ritter: 'ritter', astro: 'astro', pirat: 'pirat', zauber: 'zauberer' }) }));
  };
  const random = (fig) => {
    const r = (a0) => { const a = a0.filter((v) => !LOCKED.includes(v)); return a[Math.floor(Math.random() * a.length)]; };
    const o = { fig: fig || r(FIG), hair: r(HAIR), hc: r(Object.keys(HC)), sk: r(Object.keys(SK)), shirt: r(Object.keys(SHIRT)),
      head: Math.random() < 0.5 ? r(HEAD) : '0', face: Math.random() < 0.4 ? r(FACE) : '0', neck: Math.random() < 0.3 ? r(NECK) : '0',
      motif: Math.random() < 0.5 ? r(MOTIF) : '0', pet: Math.random() < 0.5 ? r(PET) : '0', bg: Math.random() < 0.6 ? r(BG) : '0', cost: Math.random() < 0.2 ? r(COST) : '0', fx: '0', fxb: '0' };
    return code(norm(o));
  };

  // ---------------------------------------------------------------- drawing (viewBox 0 0 64 64, head centre 32/28)
  const W = '#ffffff';
  const ray = (n, c, r0, r1, op) => `<g fill="${c}" opacity="${op}">${[...Array(n)].map((_, i) => { const a = (i / n) * Math.PI * 2; const b = a + Math.PI / n;
    return `<path d="M32 32L${(32 + Math.cos(a) * r1).toFixed(1)} ${(32 + Math.sin(a) * r1).toFixed(1)}L${(32 + Math.cos(b) * r1).toFixed(1)} ${(32 + Math.sin(b) * r1).toFixed(1)}z"/>`; }).join('')}</g>`;
  const bgArt = {
    comic: () => ray(14, '#FFE27A', 0, 50, '.55') + `<g fill="#E05555" opacity=".5">${[[9, 12], [54, 10], [56, 40], [8, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')}</g>`,
    sonnenuntergang: () => `<rect width="64" height="64" fill="#FFA34F" opacity=".35"/><rect y="20" width="64" height="44" fill="#E06B9B" opacity=".35"/><circle cx="32" cy="46" r="20" fill="#FFD84F" opacity=".55"/><path d="M0 50h64M0 55h64M0 60h64" stroke="#fff" stroke-width="1.4" opacity=".35"/>`,
    kristallhoehle: () => `<rect width="64" height="64" fill="#1d3f6e" opacity=".45"/><g opacity=".85">${[[6, 64, 5, 20, '#7FDBFF'], [14, 64, 4, 13, '#B8F0FF'], [52, 64, 5, 22, '#7FDBFF'], [59, 64, 4, 14, '#C9B8FF'], [10, 0, 4, -12, '#B8F0FF'], [54, 0, 4, -14, '#7FDBFF']].map(([x, y, w, h, c]) => `<path d="M${x - w} ${y}L${x} ${y - h}L${x + w} ${y}z" fill="${c}"/>`).join('')}</g>`,
    lavagalaxie: () => `<rect width="64" height="64" fill="#3a0a14" opacity=".6"/><path d="M32 32m-24 0a24 10 -20 1 0 48 0a24 10 -20 1 0-48 0" fill="none" stroke="#FF4D6D" stroke-width="1.4" opacity=".6"/><g fill="#FFA34F">${[[8, 10], [55, 14], [12, 50], [52, 52], [40, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>`,    sterne: () => `<g fill="${W}" opacity=".55">${[[9, 10, 1.6], [53, 8, 1.2], [56, 26, 1.5], [7, 30, 1.1], [14, 50, 1.3], [50, 52, 1.1], [44, 14, .9], [20, 18, .8]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}l${r * .6} ${r * 1.4} ${r * 1.4} ${r * .6}-${r * 1.4} ${r * .6}-${r * .6} ${r * 1.4}-${r * .6}-${r * 1.4}-${r * 1.4}-${r * .6} ${r * 1.4}-${r * .6}z"/>`).join('')}</g>`,
    regenbogen: () => `<g fill="none" stroke-width="3" opacity=".55">${['#FF5F6D', '#FFA34F', '#FFD84F', '#4FE08A', '#4FA3E0', '#8F6BFF'].map((c, i) => `<path d="M-4 ${46 + i * 3}A36 36 0 0 1 68 ${46 + i * 3}" stroke="${c}"/>`).join('')}</g>`,
    herzen: () => `<g fill="${W}" opacity=".45">${[[9, 12, 1], [54, 10, .8], [55, 34, 1.1], [8, 38, .9], [47, 18, .6]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 3C-4-1-2.4-4.6 0-2.4 2.4-4.6 4-1 0 3z"/>`).join('')}</g>`,
    konfetti: () => `<g opacity=".8">${[['#F5C542', 8, 10, 20], ['#E06B9B', 52, 9, -30], ['#4FE08A', 56, 30, 45], ['#7C9CFF', 7, 34, -15], ['#FFA34F', 46, 18, 70], ['#fff', 15, 20, 10], ['#F5C542', 12, 52, 60], ['#4FA3E0', 52, 48, -50]].map(([c, x, y, a]) => `<rect x="${x}" y="${y}" width="3.4" height="1.6" rx=".5" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>`,
    weltall: () => `<rect width="64" height="64" fill="#141838" opacity=".55"/><circle cx="52" cy="13" r="5" fill="#F5C542" opacity=".9"/><path d="M45.5 14.5c4-2 9.5-3.4 13-2.6" stroke="#E8E3FF" stroke-width="1" fill="none" opacity=".8"/><g fill="#fff">${[[10, 12], [20, 6], [8, 28], [57, 30], [14, 44], [50, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8"/>`).join('')}</g>`,
    wolken: () => `<g fill="${W}" opacity=".55"><path d="M4 18a4 4 0 0 1 4-4 5 5 0 0 1 9 1 3.5 3.5 0 0 1 1 7H8a4 4 0 0 1-4-4z"/><path d="M44 10a3.4 3.4 0 0 1 3.4-3.4 4.4 4.4 0 0 1 8 .8 3 3 0 0 1 .8 6H47.4A3.4 3.4 0 0 1 44 10z"/><path d="M48 36a3 3 0 0 1 3-3 4 4 0 0 1 7 .8 2.6 2.6 0 0 1 .6 5.2H51a3 3 0 0 1-3-3z"/></g>`,
    blasen: () => `<g fill="none" stroke="${W}" stroke-width="1" opacity=".6">${[[9, 14, 4], [55, 12, 3], [52, 34, 4.5], [8, 40, 3], [46, 22, 2], [16, 26, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x - r * .5} ${y - r * .3}a${r * .6} ${r * .6} 0 0 1 ${r * .4}-${r * .3}" />`).join('')}</g>`,
    blitze: () => `<g fill="#FFE27A" opacity=".85">${[[8, 8, 1], [52, 6, .8], [54, 32, 1.1], [6, 34, .9]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M3 0L0 6h2.4L1 11l5-7H3.4L5 0z"/>`).join('')}</g>`,
  };
  // hair: [back, front] with c1 = colour, c2 = darker shade
  const hairArt = {
    kurz: [null, (c) => `<path d="M21 26c-.7-8.8 4.4-14.6 11-14.6s11.7 5.8 11 14.6c-1-3.2-2.8-5.4-5.2-6.2-3.6 1.6-9.4 1.8-13.2.2-1.6 1.2-2.8 3.2-3.6 6z" fill="${c}"/>`],
    seite: [null, (c) => `<path d="M20.8 27c-.8-9 4.4-15 11.2-15 7 0 12 5.6 11.2 13.6-3.4-3.6-9-6.4-16.4-6-2 1.4-4.6 4-6 7.4z" fill="${c}"/><path d="M27 19c4-.6 9 .4 13 3.6" stroke="#000" stroke-opacity=".12" stroke-width=".8" fill="none"/>`],
    stachel: [null, (c) => `<path d="M20.8 25.4l.4-7 2.6 1.8 1-6 2.8 3.2 2.2-6.2 2.4 5.6 3-5.2 1.6 6 3.4-3.4.4 6.4 2.2.8c.6 1.6.4 3 0 4-1.8-3.4-5-5.4-11-5.4s-9.2 2-10.8 5.4z" fill="${c}"/>`],
    wuschel: [null, (c) => `<g fill="${c}"><circle cx="24" cy="17" r="4.6"/><circle cx="31" cy="14.2" r="5"/><circle cx="38.5" cy="16.4" r="4.6"/><circle cx="21.4" cy="22" r="3.4"/><circle cx="42.6" cy="22" r="3.4"/><circle cx="27.6" cy="19.4" r="3.2"/><circle cx="35.4" cy="19.6" r="3.2"/></g>`],
    undercut: [null, (c, d) => `<path d="M21.4 26c-.4-3 0-5.4 1-7.4.6 2 .6 4.6-1 7.4zM42.6 26c.4-3 0-5.4-1-7.4-.6 2-.6 4.6 1 7.4z" fill="${d}" opacity=".7"/><path d="M22.6 19.6c1.6-6 5.4-8.8 10.4-8.8 6.4 0 10 3.6 10.4 9.6-2.2-1.8-5.2-2.4-8.4-1.6-2.2-2.6-7.4-2.8-12.4.8z" fill="${c}"/>`],
    irokese: [null, (c, d) => `<path d="M21.4 25c-.6-3.4.2-6 1.6-7.6M42.6 25c.6-3.4-.2-6-1.6-7.6" stroke="${d}" stroke-width="1.4" opacity=".6" fill="none"/><path d="M28.6 20.6l-.6-6.4 2-1.4-.4-4 2.4 1.6 1-4 1.8 3.8 2.2-2.2-.4 4.2 2.2-.6-1.6 5.4c-2.6-.8-5.6-.6-8.6-.4z" fill="${c}"/>`],
    lockenkurz: [null, (c) => `<g fill="${c}"><circle cx="24.2" cy="17" r="4.2"/><circle cx="31.8" cy="14.4" r="4.6"/><circle cx="39.4" cy="17" r="4.2"/><circle cx="21.6" cy="22.4" r="3.2"/><circle cx="42.4" cy="22.4" r="3.2"/></g>`],
    glatze: [null, (c) => `<path d="M21 31c-1.4-3.2-.8-6.6 1.2-8.2.8 2.8.8 5.4-1.2 8.2zM43 31c1.4-3.2.8-6.6-1.2-8.2-.8 2.8-.8 5.4 1.2 8.2z" fill="${c}"/>`],
    lang: [(c) => `<path d="M19 28c0-11 5.6-17.6 13-17.6S45 17 45 28v17.6c0 2.4-2 4-4.4 4H23.4c-2.4 0-4.4-1.6-4.4-4z" fill="${c}"/>`, (c) => `<path d="M21 28c-.4-9.4 4.6-15.4 11-15.4 6.6 0 11.4 6 11 15.4-3.6-1.2-7.6-4-9.8-7.8-2.6 4.2-7.2 6.8-12.2 7.8z" fill="${c}"/>`],
    pony: [(c) => `<path d="M19 28c0-11 5.6-17.6 13-17.6S45 17 45 28v17.6c0 2.4-2 4-4.4 4H23.4c-2.4 0-4.4-1.6-4.4-4z" fill="${c}"/>`, (c) => `<path d="M21 26c0-8.4 4.8-13.6 11-13.6S43 17.6 43 26c-1.8-2-3-3-4.4-3.4l-1 2-1.6-2.4-1.8 2.4-1.8-2.4-1.8 2.4-1.6-2.4-1 2c-2 .4-3.4 1.4-5 3.4z" fill="${c}"/>`],
    zoepfe: [(c) => `<g fill="${c}"><ellipse cx="17.6" cy="36" rx="3.6" ry="7.6"/><ellipse cx="46.4" cy="36" rx="3.6" ry="7.6"/></g><g fill="#FF7AA8"><circle cx="18.4" cy="29" r="1.8"/><circle cx="45.6" cy="29" r="1.8"/></g>`, (c) => `<path d="M21 27c-.4-9 4.4-14.6 11-14.6s11.4 5.6 11 14.6c-1.8-3.6-4.8-6-8.6-7-.8 1.2-1.6 2-2.4 2.6-.8-.6-1.6-1.4-2.4-2.6-3.8 1-6.8 3.4-8.6 7z" fill="${c}"/>`],
    pferd: [(c) => `<path d="M40.6 17.6c7.6.8 10.4 8.6 9.4 17.6-.6 5.6-3.6 8.8-6 9.6 1.4-5 1.6-11-.4-16z" fill="${c}"/><circle cx="41.6" cy="18.2" r="1.6" fill="#E06B9B"/>`, (c) => `<path d="M21 26.4c-.6-8.6 4.4-14.2 11-14.2 6.8 0 11.6 5.2 11 13.4-3.4-3.4-9.2-6-16.6-5.6-2 1.2-4 3.6-5.4 6.4z" fill="${c}"/>`],
    dutt: [(c, d) => `<circle cx="32" cy="11.4" r="6" fill="${c}"/><path d="M27 15.4h10" stroke="${d}" stroke-width="1.2"/>`, (c) => `<path d="M21 27c-.4-8.6 4.6-14 11-14s11.4 5.4 11 14c-2-3.4-5.6-6-11-6s-9 2.6-11 6z" fill="${c}"/>`],
    buns: [(c) => `<g fill="${c}"><circle cx="21" cy="14" r="5.4"/><circle cx="43" cy="14" r="5.4"/></g>`, (c) => `<path d="M21 27c-.4-8.6 4.6-14 11-14s11.4 5.4 11 14c-1.6-3-4-5.2-7-6l-4 2.2-4-2.2c-3 .8-5.4 3-7 6z" fill="${c}"/>`],
    bob: [(c) => `<path d="M19.4 28c0-10.6 5.6-16.6 12.6-16.6S44.6 17.4 44.6 28v9c0 1.8-1.4 3-3 3H22.4c-1.6 0-3-1.2-3-3z" fill="${c}"/>`, (c) => `<path d="M21 26c0-8.4 4.8-13.6 11-13.6S43 17.6 43 26c-2.4-1.8-6.6-3.6-11-3.6s-8.6 1.8-11 3.6z" fill="${c}"/>`],
    locken: [(c) => `<g fill="${c}"><circle cx="20" cy="22" r="5"/><circle cx="44" cy="22" r="5"/><circle cx="18.6" cy="30" r="4.8"/><circle cx="45.4" cy="30" r="4.8"/><circle cx="19.4" cy="38" r="4.4"/><circle cx="44.6" cy="38" r="4.4"/><circle cx="21.4" cy="45" r="3.6"/><circle cx="42.6" cy="45" r="3.6"/></g>`, (c) => `<g fill="${c}"><circle cx="24.4" cy="16.6" r="4.6"/><circle cx="32" cy="14" r="5"/><circle cx="39.6" cy="16.6" r="4.6"/><circle cx="21.6" cy="22" r="3.4"/><circle cx="42.4" cy="22" r="3.4"/></g>`],
    afro: [(c) => `<circle cx="32" cy="24" r="16.4" fill="${c}"/>`, (c) => `<path d="M21 26c0-7.6 4.8-12.6 11-12.6S43 18.4 43 26c-2.8-2.4-6.6-3.8-11-3.8S23.8 23.6 21 26z" fill="${c}"/>`],
    rastas: [(c, d) => `<g fill="${c}">${[17.6, 20.8, 43.2, 46.4].map((x, i) => `<rect x="${x - 1.6}" y="${20 + (i % 2) * 2}" width="3.2" height="${22 - (i % 2) * 3}" rx="1.6"/>`).join('')}</g><g stroke="${d}" stroke-width=".6">${[17.6, 20.8, 43.2, 46.4].map((x) => `<path d="M${x - 1.4} 30h2.8M${x - 1.4} 35h2.8"/>`).join('')}</g>`, (c) => `<path d="M21 26.6c-.4-8.8 4.6-14.4 11-14.4s11.4 5.6 11 14.4c-2.4-3.2-6.4-5.4-11-5.4s-8.6 2.2-11 5.4z" fill="${c}"/><g fill="${c}"><rect x="23" y="20" width="3" height="9" rx="1.5"/><rect x="38" y="20" width="3" height="9" rx="1.5"/></g>`],
  };
  // animations only when the device does not ask for reduced motion
  const still = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const star4 = (x, y, r) => `M${x} ${y - r * 2}l${r * .6} ${r * 1.4} ${r * 1.4} ${r * .6}-${r * 1.4} ${r * .6}-${r * .6} ${r * 1.4}-${r * .6}-${r * 1.4}-${r * 1.4}-${r * .6} ${r * 1.4}-${r * .6}z`;
  const blink = (dur, begin) => (still() ? '' : `<animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`);
  const CROWN = (c, g) => `<path d="M22.6 17l1.8-9 4.6 5L32 5.8l3 7.2 4.6-5 1.8 9z" fill="${c}" stroke="#9A6A10" stroke-width=".5"/><rect x="22.6" y="16" width="18.8" height="2.6" rx="1" fill="${c}"/><circle cx="32" cy="11.6" r="1.6" fill="${g}"/><circle cx="26.6" cy="14" r="1.1" fill="${g}"/><circle cx="37.4" cy="14" r="1.1" fill="${g}"/>`;
  const headArt = {
    skaterhelm: () => `<path d="M19.8 24.6c0-8.6 5.4-14.2 12.2-14.2s12.2 5.6 12.2 14.2z" fill="#4FD1C5"/><path d="M24 12.6c1 3.8 1 8 0 12M32 10.4v14.2M40 12.6c-1 3.8-1 8 0 12" stroke="#2F9A90" stroke-width="1.2" fill="none"/><path d="M20.4 24.4h23.2" stroke="#2E3138" stroke-width="1.4"/>`,
    edelkrone: () => CROWN('#F5C542', '#4FA3E0') + '<circle cx="29.4" cy="17.3" r=".8" fill="#E06B6B"/><circle cx="34.6" cy="17.3" r=".8" fill="#4FE08A"/>',
    rubinkrone: () => CROWN('#F5C542', '#E0115F') + `<path d="M32 9.6l1.6 2-1.6 2-1.6-2z" fill="#FF4D6D"/>`,
    levelcap: () => `<path d="M20.4 22.4c.4-7.4 5.2-12 11.6-12s11.2 4.6 11.6 12z" fill="#CD8A4E"/><path d="M31 21.4c6 0 12 .6 17.4 2.2-.8 1.4-3 1.6-5.6 1.4-4-.6-7.8-.8-11.8-.8z" fill="#9A5E2E"/><path d="M32 12.6l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" fill="#FFE27A" stroke="#9A5E2E" stroke-width=".4"/>`,    cap: () => `<path d="M20.4 22.4c.4-7.4 5.2-12 11.6-12s11.2 4.6 11.6 12z" fill="#3E7CC9"/><path d="M31 21.4c6 0 12 .6 17.4 2.2-.8 1.4-3 1.6-5.6 1.4-4-.6-7.8-.8-11.8-.8z" fill="#2F64A6"/><circle cx="32" cy="10.8" r="1.2" fill="#2F64A6"/>`,
    muetze: () => `<path d="M20.4 22.6c0-7.6 5-12.4 11.6-12.4s11.6 4.8 11.6 12.4z" fill="#E05555"/><rect x="19.6" y="20.4" width="24.8" height="4.4" rx="2.2" fill="#F4F4F4"/><circle cx="32" cy="9.6" r="3.2" fill="#F4F4F4"/><path d="M26 14l1.4 5M32 12.4v6.6M38 14l-1.4 5" stroke="#C23F3F" stroke-width=".8"/>`,
    krone: () => `<path d="M23.6 16.6l2-7.6 4.2 4.6L32 6.8l2.2 6.8 4.2-4.6 2 7.6z" fill="#F5C542" stroke="#D9A21E" stroke-width=".5"/><circle cx="32" cy="12.4" r="1.2" fill="#E06B6B"/><circle cx="27.4" cy="14.4" r=".8" fill="#4FA3E0"/><circle cx="36.6" cy="14.4" r=".8" fill="#4FA3E0"/>`,
    blumen: () => `<path d="M21.4 21c2.6-5.4 6.6-8 10.6-8s8 2.6 10.6 8" stroke="#5CB85C" stroke-width="1.4" fill="none"/>${[[24, 16.4, '#FF7AA8'], [32, 13, '#F5C542'], [40, 16.4, '#B69CF2']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle r="1.4" cy="-1.6" fill="${c}"/><circle r="1.4" cy="1.6" fill="${c}"/><circle r="1.4" cx="-1.6" fill="${c}"/><circle r="1.4" cx="1.6" fill="${c}"/><circle r="1" fill="#fff"/></g>`).join('')}`,
    katze: () => `<path d="M20 18l1.6-9.4 6.6 6.2zM44 18l-1.6-9.4-6.6 6.2z" fill="#3a3a3a"/><path d="M21.8 15.6l.8-4.6 3 3zM42.2 15.6l-.8-4.6-3 3z" fill="#F29A9A"/>`,
    hase: () => `<g fill="#F4F4F4" stroke="#ddd" stroke-width=".4"><ellipse cx="26.6" cy="8" rx="3" ry="8" transform="rotate(-10 26.6 8)"/><ellipse cx="37.4" cy="8" rx="3" ry="8" transform="rotate(10 37.4 8)"/></g><g fill="#F7B6C6"><ellipse cx="26.6" cy="8.6" rx="1.4" ry="5.6" transform="rotate(-10 26.6 8.6)"/><ellipse cx="37.4" cy="8.6" rx="1.4" ry="5.6" transform="rotate(10 37.4 8.6)"/></g>`,
    baer: () => `<g fill="#8B5A2B"><circle cx="21.6" cy="14" r="4.2"/><circle cx="42.4" cy="14" r="4.2"/></g><g fill="#D9A27A"><circle cx="21.6" cy="14" r="2.2"/><circle cx="42.4" cy="14" r="2.2"/></g>`,
    einhorn: () => `<path d="M29.8 14.6L32 2.4l2.2 12.2z" fill="#F5C542"/><path d="M30.4 11.6l3.2-1M30.8 8.2l2.4-.8M31.2 5.2l1.6-.5" stroke="#D99A2B" stroke-width=".7"/><circle cx="24.6" cy="15" r="2" fill="#FF7AA8"/><circle cx="39.4" cy="15" r="2" fill="#B69CF2"/>`,
    party: () => `<path d="M25 17.6L33 1.6l7 15z" fill="#7C9CFF"/><path d="M27.4 12.6l9.8 1.6M29.6 8l5.6.9" stroke="#F5C542" stroke-width="1.4"/><circle cx="33" cy="1.8" r="2" fill="#E06B9B"/><path d="M25 17.6q7.6 2 15 0" stroke="#5B79D9" stroke-width="1" fill="none"/>`,
    kopfhoerer: () => `<path d="M18.8 29c0-9.4 5.8-15.4 13.2-15.4S45.2 19.6 45.2 29" fill="none" stroke="#333" stroke-width="2.4"/><rect x="16.2" y="25.8" width="5.4" height="8.8" rx="2.4" fill="#E06B6B"/><rect x="42.4" y="25.8" width="5.4" height="8.8" rx="2.4" fill="#E06B6B"/>`,
    stirnband: () => `<path d="M20.8 20.6c7-2.8 15.4-2.8 22.4 0l-.4 3c-7-2.4-14.6-2.4-21.6 0z" fill="#4FD1C5"/><path d="M21.4 22.2c6.6-2.2 14.6-2.2 21.2 0" stroke="#fff" stroke-width=".5" opacity=".7" fill="none"/>`,
    schleife: () => `<path d="M38.6 13.6l5.8-3.4v6.8zM38.6 13.6l-5.8-3.4v6.8z" fill="#FF7AA8"/><circle cx="38.6" cy="13.6" r="1.6" fill="#E0568A"/>`,
  };
  const faceArt = {
    diamantbrille: () => `<g fill="#B8F0FF" opacity=".55" stroke="#7FDBFF" stroke-width="1"><path d="M23.6 27h7.4l-1 4.4h-5.4z"/><path d="M33 27h7.4l-1 4.4H34z"/></g><path d="M31 28h2M23.6 27.4l-2.4-.8M40.4 27.4l2.4-.8" stroke="#7FDBFF" stroke-width="1"/><path d="M25 28.4l1.6-1.2M34.4 28.4l1.6-1.2" stroke="#fff" stroke-width=".7"/>`,
    rubinmaske: () => `<path d="M21.4 27.4c3-2 7.2-2.2 10.6-.4 3.4-1.8 7.6-1.6 10.6.4-.6 3.4-2.8 5.2-5.4 5.2-2.2 0-3.8-1-5.2-2.6-1.4 1.6-3 2.6-5.2 2.6-2.6 0-4.8-1.8-5.4-5.2z" fill="#E0115F"/><circle cx="27.6" cy="29.2" r="1.7" fill="#fff"/><circle cx="36.4" cy="29.2" r="1.7" fill="#fff"/><circle cx="27.7" cy="29.3" r=".8" fill="#222"/><circle cx="36.3" cy="29.3" r=".8" fill="#222"/><path d="M42.4 27.2l4-3" stroke="#F5C542" stroke-width="1.2"/>`,    goldbrille: () => `<g fill="#3a2a10" opacity=".85"><rect x="23.4" y="26.4" width="7.8" height="5.6" rx="2.2"/><rect x="32.8" y="26.4" width="7.8" height="5.6" rx="2.2"/></g><g fill="none" stroke="#F5C542" stroke-width="1.1"><rect x="23.4" y="26.4" width="7.8" height="5.6" rx="2.2"/><rect x="32.8" y="26.4" width="7.8" height="5.6" rx="2.2"/><path d="M31.2 28h1.6M23.4 27.6l-2.6-.8M40.6 27.6l2.6-.8"/></g><path d="M24.8 27.8l2.2-.2M34.2 27.8l2.2-.2" stroke="#FFF3C4" stroke-width=".7"/>`,
    funkelsprossen: () => `<g fill="#B5774F" opacity=".75">${[[24.4, 32.2], [26, 33.4], [23.8, 34], [39.6, 32.2], [38, 33.4], [40.2, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".5"/>`).join('')}</g><g fill="#FFE27A">${[[25.2, 32.8, 0], [39, 32.8, 1.3], [24.4, 34.6, 2.1]].map(([x, y, b]) => `<path d="M${x} ${y - 1.4}l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" opacity="${still() ? 1 : 0}">${blink(2.4, b)}</path>`).join('')}</g>`,    brille: () => `<g fill="none" stroke="#2b2b2b" stroke-width="1.1"><circle cx="27.8" cy="29.4" r="3.4"/><circle cx="36.2" cy="29.4" r="3.4"/><path d="M31.2 29h1.6M24.4 28.6l-3-1M39.6 28.6l3-1"/></g>`,
    eckig: () => `<g fill="none" stroke="#3E7CC9" stroke-width="1.2"><rect x="23.8" y="26.6" width="7.2" height="5.4" rx="1.2"/><rect x="33" y="26.6" width="7.2" height="5.4" rx="1.2"/><path d="M31 28.6h2M23.8 28.4l-2.4-.8M40.2 28.4l2.4-.8"/></g>`,
    sonnenbrille: () => `<g fill="#1d1d24"><rect x="23.4" y="26.4" width="7.8" height="5.6" rx="2.2"/><rect x="32.8" y="26.4" width="7.8" height="5.6" rx="2.2"/></g><path d="M31.2 28h1.6M23.4 27.6l-2.6-.8M40.6 27.6l2.6-.8" stroke="#1d1d24" stroke-width="1.1"/><path d="M24.8 27.8l2.2-.2M34.2 27.8l2.2-.2" stroke="#fff" stroke-width=".7" opacity=".6"/>`,
    sommersprossen: () => `<g fill="#B5774F" opacity=".75">${[[24.4, 32.2], [26, 33.4], [23.8, 34], [39.6, 32.2], [38, 33.4], [40.2, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".5"/>`).join('')}</g>`,
    glitzer: () => `<g fill="#F5C542">${[[23.6, 33.2, .9], [40.4, 33.2, .9], [25.4, 35, .6], [38.6, 35, .6]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}l${r * .5} ${r * 1.5} ${r * 1.5} ${r * .5}-${r * 1.5} ${r * .5}-${r * .5} ${r * 1.5}-${r * .5}-${r * 1.5}-${r * 1.5}-${r * .5} ${r * 1.5}-${r * .5}z"/>`).join('')}</g>`,
    pflaster: () => `<g transform="rotate(-25 38.6 33.8)"><rect x="35.2" y="32.4" width="7" height="2.8" rx="1.2" fill="#F2C9A0"/><rect x="37.6" y="32.4" width="2.2" height="2.8" fill="#E5B184"/></g>`,
    tiger: () => `<g fill="#E8822C" opacity=".85"><path d="M21.4 27l4 1.2-4 1.2zM21.6 32l3.6.4-3.4 1.4zM42.6 27l-4 1.2 4 1.2zM42.4 32l-3.6.4 3.4 1.4zM30.6 18.4l1.4 3 1.4-3z"/></g><path d="M30.6 31.8q1.4 1 2.8 0" stroke="#333" stroke-width=".8" fill="none"/><circle cx="32" cy="31.2" r=".9" fill="#333"/>`,
    schmetterling: () => `<g opacity=".8"><path d="M32 30c-2.4-4.2-7.4-5.6-9-3.4-1.4 2 .8 5.4 4 5.6-2.6 1.2-2.6 4.2-.4 4.6 2.2.4 4.2-2.4 5.4-6.8z" fill="#B69CF2"/><path d="M32 30c2.4-4.2 7.4-5.6 9-3.4 1.4 2-.8 5.4-4 5.6 2.6 1.2 2.6 4.2.4 4.6-2.2.4-4.2-2.4-5.4-6.8z" fill="#FF7AA8"/></g>`,
    bart: (c) => `<path d="M21.4 30.4c.6 6.6 4.8 10.8 10.6 10.8s10-4.2 10.6-10.8c-2 2.4-4.6 3.6-6.8 3-1.2-.4-2.4-.8-3.8-.8s-2.6.4-3.8.8c-2.2.6-4.8-.6-6.8-3z" fill="${c}"/>`,
    schnauz: (c) => `<path d="M26.4 33.4c1.6-1.8 3.6-2 5.6-1 2-1 4-.8 5.6 1-1.8.4-3.8.4-5.6-.2-1.8.6-3.8.6-5.6.2z" fill="${c}"/>`,
  };
  const neckArt = {
    rubinumhang: () => `<path d="M14 64c.6-9 4-15.4 9-18.6L32 49l9-3.6c5 3.2 8.4 9.6 9 18.6z" fill="#B0103E" opacity=".9"/><path d="M23 45.4L32 49l9-3.6" stroke="#F5C542" stroke-width="1.6" fill="none"/><circle cx="32" cy="48.6" r="1.6" fill="#F5C542"/>`,    schal: () => `<path d="M22.6 42.6c6 3.4 12.8 3.4 18.8 0l1.4 3.8c-7 3.6-14.6 3.6-21.6 0z" fill="#E05555"/><path d="M37 45.4l1.2 10.4h-4.2l-.6-9.6z" fill="#E05555"/><path d="M34.4 52.6h3.8M34.6 54.6h3.8" stroke="#F4F4F4" stroke-width=".9"/>`,
    fliege: () => `<path d="M32 44.6l-5-2.8v5.6zM32 44.6l5-2.8v5.6z" fill="#E05555"/><circle cx="32" cy="44.6" r="1.3" fill="#B53D3D"/>`,
    kette: () => `<path d="M26.4 42.4q5.6 5.6 11.2 0" stroke="#F5C542" stroke-width=".9" fill="none"/><path d="M32 45.4l1.6 1.8-1.6 2-1.6-2z" fill="#7FDBFF"/>`,
  };
  const motifArt = {
    stern: () => '<path d="M32 51l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="#F5C542"/>',
    herz: () => '<path d="M32 60c-5-3.4-6-6.6-4.4-8.2 1.4-1.4 3.4-.8 4.4.8 1-1.6 3-2.2 4.4-.8 1.6 1.6.6 4.8-4.4 8.2z" fill="#E06B9B"/>',
    blitz: () => '<path d="M33.4 50.6l-4.2 6h3l-1.4 4.6 5-6.6h-3l1.8-4z" fill="#FFE27A"/>',
    ball: () => '<circle cx="32" cy="56" r="4.4" fill="#fff"/><path d="M32 53.6l2 1.4-.8 2.4h-2.4l-.8-2.4zM27.8 55.2l2-.4M36.2 55.2l-2-.4M30.8 57.4l-1.2 2.2M33.2 57.4l1.2 2.2" fill="#2b2b2b" stroke="#2b2b2b" stroke-width=".5"/>',
    rakete: () => '<path d="M32 50c2.4 1.6 3.4 4.4 3 8.4h-6c-.4-4 .6-6.8 3-8.4z" fill="#F4F4F4"/><circle cx="32" cy="54.4" r="1.2" fill="#4FA3E0"/><path d="M29 56.6l-2 3h2.2zM35 56.6l2 3h-2.2z" fill="#E05555"/><path d="M30.6 58.6l1.4 3 1.4-3z" fill="#FFA34F"/>',
  };
  // companions sit bottom right (animals on the shoulder / in the arm), things bottom left
  const DRAGON = (c, belly, wing) => `<g transform="translate(46 47)"><path d="M-2 -2l-5.4-3.4 1.8 4.8zM2-2l5.4-3.4-1.8 4.8z" fill="${wing}"/><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="${c}"/><circle cy="-3" r="4.6" fill="${c}"/><path d="M-2.4-7l.8-2.6 1 2.2 1-2.2.8 2.6" fill="#F5C542"/><circle cx="-1.6" cy="-3.6" r=".8" fill="#2b2b2b"/><circle cx="1.6" cy="-3.6" r=".8" fill="#2b2b2b"/><path d="M-1.6-1.2q1.6 1 3.2 0" stroke="#2b2b2b" stroke-width=".5" fill="none"/><ellipse cy="3" rx="2.6" ry="2.8" fill="${belly}"/></g>`;
  const petArt = {
    babydrache: () => DRAGON('#F08A3C', '#FFE2B8', '#E05555'),
    rubindrache: () => DRAGON('#E0115F', '#FFB3C1', '#8B0A32') + '<g transform="translate(46 47)"><path d="M4.4-4.4l3-1.4-1.6 2.8" fill="#FFA34F"/></g>',
    phoenix: () => `<g transform="translate(47 41)"><path d="M-4 4c-4 3-4 8-1 11M0 5c-1 4 0 8 2 10M3 4c3 3 4 7 2 10" stroke="#FFA34F" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cy="2.4" rx="3.8" ry="5" fill="#F08A3C"/><circle cy="-3" r="3.4" fill="#E05555"/><path d="M-1-6.4l1-2.6 1 2.6M1.4-6l2-1.8-.6 2.4" stroke="#F5C542" stroke-width=".9" fill="none"/><path d="M2.4-3.4l3 1-2.8 1z" fill="#F5C542"/><circle cx="1" cy="-3.8" r=".7" fill="#2b2b2b"/></g>`,
    kristallfuchs: () => `<g transform="translate(46 47)"><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="#B8F0FF"/><path d="M-5.4-6.6l1.4-3.4 2.6 3zM5.4-6.6l-1.4-3.4-2.6 3z" fill="#7FDBFF"/><path d="M-5.4-6C-5-1 -2 1.4 0 1.4S5-1 5.4-6c-1.4-1-3.4-1.6-5.4-1.6s-4 .6-5.4 1.6z" fill="#B8F0FF"/><path d="M-4.6-3C-3.6 0-1.8 1.4 0 1.4S3.6 0 4.6-3C3-2 1.6-1.6 0-1.6S-3-2-4.6-3z" fill="#fff"/><circle cx="-2" cy="-3.8" r=".7" fill="#1d3f6e"/><circle cx="2" cy="-3.8" r=".7" fill="#1d3f6e"/><circle cy=".8" r=".7" fill="#1d3f6e"/><path d="M-3 4l1.4-2 1.4 2zM1 5l1-1.6 1 1.6z" fill="#7FDBFF"/></g>`,
    szepter: () => '<path d="M10 62l6-18" stroke="#D4A017" stroke-width="2" stroke-linecap="round"/><circle cx="16.4" cy="42.4" r="2.8" fill="#F5C542"/><path d="M16.4 38.6l2 2.2-2 2.4-2-2.4z" fill="#E0115F"/><g fill="#FFE27A"><circle cx="20.4" cy="39" r=".6"/><circle cx="13" cy="40" r=".5"/></g>',    hamster: () => `<g transform="translate(46 49)"><ellipse cy="2.6" rx="6" ry="5" fill="#E8A65A"/><ellipse cy="3.6" rx="3.8" ry="3.4" fill="#FBE3CF"/><circle cx="-3.6" cy="-1.6" r="1.6" fill="#E8A65A"/><circle cx="3.6" cy="-1.6" r="1.6" fill="#E8A65A"/><circle cx="-3.6" cy="-1.6" r=".8" fill="#F7B6C6"/><circle cx="3.6" cy="-1.6" r=".8" fill="#F7B6C6"/><circle cx="-1.8" cy="1" r=".75" fill="#2b2b2b"/><circle cx="1.8" cy="1" r=".75" fill="#2b2b2b"/><ellipse cy="2.4" rx=".7" ry=".5" fill="#E07A8A"/><circle cx="-3.4" cy="3" r="1.1" fill="#F7B6C6" opacity=".6"/><circle cx="3.4" cy="3" r="1.1" fill="#F7B6C6" opacity=".6"/></g>`,    katze: () => `<g transform="translate(46 47)"><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="#F0A04B"/><circle cy="-3" r="5" fill="#F0A04B"/><path d="M-4.6-6l-.4-4.4 3.2 2.6zM4.6-6l.4-4.4-3.2 2.6z" fill="#F0A04B"/><circle cx="-1.8" cy="-3.4" r=".8" fill="#2b2b2b"/><circle cx="1.8" cy="-3.4" r=".8" fill="#2b2b2b"/><path d="M-.6-1.6h1.2L0-.8z" fill="#E07A8A"/><path d="M-3.6-1.4l-2.6-.4M3.6-1.4l2.6-.4" stroke="#7a4a1a" stroke-width=".4"/></g>`,
    hund: () => `<g transform="translate(46 47)"><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="#C9935B"/><circle cy="-3" r="5" fill="#C9935B"/><ellipse cx="-4.8" cy="-2.6" rx="1.8" ry="3.4" fill="#8B5A2B"/><ellipse cx="4.8" cy="-2.6" rx="1.8" ry="3.4" fill="#8B5A2B"/><circle cx="-1.8" cy="-3.6" r=".8" fill="#2b2b2b"/><circle cx="1.8" cy="-3.6" r=".8" fill="#2b2b2b"/><ellipse cy="-1.4" rx="1.2" ry=".9" fill="#2b2b2b"/></g>`,
    hase: () => `<g transform="translate(46 48)"><ellipse cy="3" rx="5.6" ry="4.4" fill="#F4F4F4"/><circle cy="-2.4" r="4.4" fill="#F4F4F4"/><ellipse cx="-1.8" cy="-8.6" rx="1.4" ry="3.6" fill="#F4F4F4"/><ellipse cx="1.8" cy="-8.6" rx="1.4" ry="3.6" fill="#F4F4F4"/><ellipse cx="-1.8" cy="-8.4" rx=".6" ry="2.4" fill="#F7B6C6"/><ellipse cx="1.8" cy="-8.4" rx=".6" ry="2.4" fill="#F7B6C6"/><circle cx="-1.5" cy="-2.6" r=".7" fill="#2b2b2b"/><circle cx="1.5" cy="-2.6" r=".7" fill="#2b2b2b"/><circle cy="-1" r=".6" fill="#E07A8A"/></g>`,
    papagei: () => `<g transform="translate(47 40)"><ellipse cy="3" rx="3.6" ry="5.4" fill="#4FBF6B"/><circle cy="-3" r="3.6" fill="#E05555"/><path d="M2.4-3.4l3 1.4-2.8 1z" fill="#F5C542"/><circle cx="1" cy="-3.8" r=".7" fill="#2b2b2b"/><path d="M-2 6l-1.2 5M0 7l0 5" stroke="#3E7CC9" stroke-width="1.6" stroke-linecap="round"/><path d="M-3.4 1.4c-1.4 2-1.4 4.4 0 6" stroke="#2F9A50" stroke-width="1.4" fill="none"/></g>`,
    eidechse: () => `<g transform="translate(46 50)"><path d="M-7 6c3-1 4.4-3 4.6-5.4L4 -1.4c2.2-.4 3.4.8 3 2.6-.4 1.6-2 2.2-4 2.4L-1 4.6C-3 6.4-5 7-7 6z" fill="#7BC74D"/><circle cx="5.4" cy=".2" r=".7" fill="#2b2b2b"/><path d="M-1 2.4l-1.4 3.4M1.4 1.6l.4 3.6M-.6-.6l-1.6-2.6M2 -1l.8-2.6" stroke="#5DA834" stroke-width="1" stroke-linecap="round"/><g fill="#5DA834"><circle cx="0" cy="1.4" r=".6"/><circle cx="2.4" cy=".8" r=".5"/></g></g>`,
    affe: () => `<g transform="translate(46 47)"><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="#8B5A2B"/><circle cy="-3" r="5" fill="#8B5A2B"/><circle cx="-5.2" cy="-3" r="2" fill="#8B5A2B"/><circle cx="5.2" cy="-3" r="2" fill="#8B5A2B"/><circle cx="-5.2" cy="-3" r="1" fill="#E3B48A"/><circle cx="5.2" cy="-3" r="1" fill="#E3B48A"/><ellipse cy="-1.8" rx="3.4" ry="2.8" fill="#E3B48A"/><circle cx="-1.4" cy="-3.6" r=".7" fill="#2b2b2b"/><circle cx="1.4" cy="-3.6" r=".7" fill="#2b2b2b"/><path d="M-1.2-1q1.2.9 2.4 0" stroke="#5a3a1a" stroke-width=".5" fill="none"/></g>`,
    drache: () => `<g transform="translate(46 47)"><path d="M-2 -2l-5-3 1.6 4.4zM2-2l5-3-1.6 4.4z" fill="#3FC1B0"/><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="#5CC98A"/><circle cy="-3" r="4.6" fill="#5CC98A"/><path d="M-2.4-7l.8-2.6 1 2.2 1-2.2.8 2.6" fill="#F5C542"/><circle cx="-1.6" cy="-3.6" r=".8" fill="#2b2b2b"/><circle cx="1.6" cy="-3.6" r=".8" fill="#2b2b2b"/><path d="M-1.6-1.2q1.6 1 3.2 0" stroke="#2F9A50" stroke-width=".6" fill="none"/><ellipse cy="3" rx="2.6" ry="2.8" fill="#BFF0CF"/></g>`,
    pinguin: () => `<g transform="translate(46 48)"><ellipse cy="1" rx="5.4" ry="7.4" fill="#2E3138"/><ellipse cy="2.4" rx="3.6" ry="5.4" fill="#F4F4F4"/><circle cx="-1.4" cy="-3" r=".8" fill="#2b2b2b"/><circle cx="1.4" cy="-3" r=".8" fill="#2b2b2b"/><circle cx="-1.2" cy="-3.2" r=".3" fill="#fff"/><path d="M-1.2-1.6h2.4L0 0z" fill="#F5A623"/></g>`,
    fuchs: () => `<g transform="translate(46 47)"><path d="M-6 6.5c0-5 2.4-8 6-8s6 3 6 8z" fill="#E8822C"/><path d="M-5.4-6.6l1.4-3.4 2.6 3zM5.4-6.6l-1.4-3.4-2.6 3z" fill="#E8822C"/><path d="M-5.4-6C-5-1 -2 1.4 0 1.4S5-1 5.4-6c-1.4-1-3.4-1.6-5.4-1.6s-4 .6-5.4 1.6z" fill="#E8822C"/><path d="M-4.6-3C-3.6 0-1.8 1.4 0 1.4S3.6 0 4.6-3C3-2 1.6-1.6 0-1.6S-3-2-4.6-3z" fill="#fff"/><circle cx="-2" cy="-3.8" r=".7" fill="#2b2b2b"/><circle cx="2" cy="-3.8" r=".7" fill="#2b2b2b"/><circle cy=".8" r=".7" fill="#2b2b2b"/></g>`,
    roboter: () => `<g transform="translate(46 48)"><rect x="-5" y="-1" width="10" height="8" rx="2" fill="#9AA5B1"/><rect x="-4.4" y="-8.4" width="8.8" height="7" rx="2" fill="#C9D1D9"/><rect x="-3" y="-6.4" width="6" height="2.6" rx="1.2" fill="#2E3138"/><circle cx="-1.4" cy="-5.1" r=".7" fill="#7FDBFF"/><circle cx="1.4" cy="-5.1" r=".7" fill="#7FDBFF"/><path d="M0-8.4v-2" stroke="#9AA5B1" stroke-width=".8"/><circle cy="-10.8" r="1" fill="#E06B6B"/><circle cy="3" r="1.4" fill="#F5C542"/></g>`,
    eule: () => `<g transform="translate(46 47)"><ellipse cy="2" rx="5.4" ry="7" fill="#9A6A44"/><path d="M-4.6-3.6l-.6-3.4 2.6 2zM4.6-3.6l.6-3.4-2.6 2z" fill="#9A6A44"/><circle cx="-2" cy="-2" r="2.2" fill="#fff"/><circle cx="2" cy="-2" r="2.2" fill="#fff"/><circle cx="-2" cy="-2" r="1.1" fill="#2b2b2b"/><circle cx="2" cy="-2" r="1.1" fill="#2b2b2b"/><path d="M-.8 0h1.6L0 1.4z" fill="#F5A623"/><ellipse cy="5" rx="3" ry="2.6" fill="#D9B48A"/></g>`,
    ballon: () => '<path d="M12 46q-1.6 6 1 18" stroke="#888" stroke-width=".6" fill="none"/><ellipse cx="11" cy="38" rx="5.4" ry="6.6" fill="#E05555"/><path d="M10 45h2l-1 1.6z" fill="#E05555"/><ellipse cx="9" cy="35.6" rx="1.4" ry="2.2" fill="#fff" opacity=".45"/>',
    fussball: () => '<circle cx="12" cy="56" r="5.6" fill="#fff" stroke="#ccc" stroke-width=".4"/><path d="M12 53l2.6 1.8-1 3h-3.2l-1-3z" fill="#2b2b2b"/><path d="M6.8 54.4l2.8.4M17.2 54.4l-2.8.4M10.6 57.8l-1.4 3M13.4 57.8l1.4 3" stroke="#2b2b2b" stroke-width=".7"/>',
    gitarre: () => '<g transform="rotate(-35 13 54)"><path d="M13 30v14" stroke="#7A4A22" stroke-width="2"/><rect x="11.4" y="27.6" width="3.2" height="3.4" rx=".6" fill="#5A3518"/><circle cx="13" cy="48" r="4.4" fill="#E0A84F"/><circle cx="13" cy="53.4" r="5.4" fill="#E0A84F"/><circle cx="13" cy="51" r="1.4" fill="#5A3518"/></g>',
    zauberstab: () => '<path d="M8 60l10-14" stroke="#3a2a1a" stroke-width="1.6" stroke-linecap="round"/><path d="M18.6 41.4l1 2.6 2.8.4-2.1 1.9.6 2.8-2.3-1.4-2.4 1.4.6-2.8-2.1-1.9 2.8-.4z" fill="#F5C542"/><g fill="#fff"><circle cx="23" cy="40" r=".6"/><circle cx="14.6" cy="42" r=".5"/><circle cx="21" cy="50" r=".5"/></g>',
  };
  // level effects (drawn last, inside the picture)
  const fxArt = {
    sternchen: () => `<g fill="#FFE27A">${[[9, 14, 1.4, 0], [55, 12, 1.2, .8], [57, 44, 1.3, 1.6], [7, 46, 1.1, 2.3], [32, 4, 1, 3]].map(([x, y, r, b]) => `<path d="${star4(x, y, r)}" opacity="${still() ? .8 : 0}">${blink(3, b)}</path>`).join('')}</g>`,
    leuchtaugen: () => `<g fill="#FFE27A" opacity="${still() ? .5 : 0}"><circle cx="27.8" cy="29.4" r="3"/><circle cx="36.2" cy="29.4" r="3"/>${blink(2.6, 0)}</g>`,
    goldglanz: () => `<defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#FFF4B8" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="-30" y="-10" width="20" height="90" fill="url(#gg)" transform="rotate(25 32 32)">${still() ? '' : '<animate attributeName="x" values="-40;90" dur="3.4s" repeatCount="indefinite"/>'}</rect>`,
    rubinsplitter: () => `<g>${[0, 120, 240].map((d) => `<path d="M32 4.6l1.6 2.2-1.6 2.2-1.6-2.2z" fill="#FF4D6D" transform="rotate(${d} 32 32)"/>`).join('')}${still() ? '' : '<animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="9s" repeatCount="indefinite"/>'}</g>`,
    feuerfunken: () => `<g fill="#FFA34F">${[[14, 0], [24, .7], [40, 1.4], [50, 2.1], [32, 2.8]].map(([x, b]) => `<circle cx="${x}" cy="60" r="1"${still() ? ' opacity=".6"' : ''}>${still() ? '' : `<animate attributeName="cy" values="64;40" dur="2.8s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2.8s" begin="${b}s" repeatCount="indefinite"/>`}</circle>`).join('')}</g>`,
    rubinglanz: () => `<circle cx="32" cy="32" r="30" fill="none" stroke="#FF4D6D" stroke-width="3" opacity=".45">${still() ? '' : '<animate attributeName="opacity" values=".15;.6;.15" dur="2.6s" repeatCount="indefinite"/>'}</circle>`,
    herzfunken: () => `<g fill="#FF7AA8">${[[10, 18, 0], [54, 16, .9], [52, 48, 1.8], [12, 46, 2.6]].map(([x, y, b]) => `<path transform="translate(${x} ${y})" d="M0 2.4C-3.2-.8-1.9-3.7 0-1.9 1.9-3.7 3.2-.8 0 2.4z" opacity="${still() ? .8 : 0}">${blink(3.2, b)}</path>`).join('')}</g>`,
    schneeflocken: () => `<g stroke="#fff" stroke-width=".7">${[[12, 0], [26, 1.2], [40, .5], [52, 1.9]].map(([x, b]) => `<g><path d="M${x} -2v4M${x - 1.8} -1l3.6 2M${x - 1.8} 1l3.6-2"/>${still() ? '' : `<animateTransform attributeName="transform" type="translate" values="0 0;0 66" dur="4.4s" begin="${b}s" repeatCount="indefinite"/>`}</g>`).join('')}</g>`,
  };
  // big effects: drawn in their own layer that reaches up to ~20 % beyond the round picture (viewBox -6.4 … 70.4)
  const fxbArt = {
    silberaura: () => `<circle cx="32" cy="32" r="34.4" fill="none" stroke="#E2E6EB" stroke-width="2.4" opacity=".8">${still() ? '' : '<animate attributeName="r" values="33.6;35.8;33.6" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.35;.9" dur="2.4s" repeatCount="indefinite"/>'}</circle><circle cx="32" cy="32" r="36.6" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="2 4" opacity=".7"/>`,
    gluehwuermchen: () => [0, 1.6, 3.2, 4.8].map((b, i) => `<circle r="1.3" fill="#E9FF7A" opacity=".95" style="filter:drop-shadow(0 0 2px #E9FF7A)" cx="${still() ? 32 + 35 * Math.cos(i * 1.6) : 0}" cy="${still() ? 32 + 35 * Math.sin(i * 1.6) : 0}">${still() ? '' : `<animateMotion dur="${6.4 + i}s" begin="-${b}s" repeatCount="indefinite" path="M32 -2.6a34.6 34.6 0 1 1 -.1 0z"/>`}</circle>`).join(''),
    goldfluegel: () => { const wing = (dir) => `<g transform="translate(${dir < 0 ? 6 : 58} 34) scale(${dir} 1)"><g>${still() ? '' : '<animateTransform attributeName="transform" type="rotate" values="0;-12;0" dur="1.8s" repeatCount="indefinite"/>'}<path d="M0 0C-4-6-10-10-12.6-9.6-11-6.4-11.6-3.6-12.4-1.6-10.4-1-10.6 1-11.6 3-9.4 3.2-8.6 4.6-8.8 6.6-5 6.4-2 4 0 0z" fill="#F5C542" stroke="#B8860B" stroke-width=".5"/><path d="M-2-.6c-2.6-3-5.6-5-8.6-5.6M-2.4.8c-2.6-1-5.4-1.2-8.2-.8M-2 2.4c-2 .6-4 1.6-5.6 3" stroke="#FFF4B8" stroke-width=".6" fill="none"/></g></g>`; return wing(-1) + wing(1); },
    goldregen: () => `<g fill="#FFD84F">${[[4, 0], [16, .8], [30, .3], [44, 1.2], [58, .6], [24, 1.6], [50, 2]].map(([x, b]) => `<circle cx="${x}" cy="${still() ? 10 + x : -4}" r="1.1"${still() ? ' opacity=".7"' : ''}>${still() ? '' : `<animate attributeName="cy" values="-6;70" dur="2.6s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" dur="2.6s" begin="${b}s" repeatCount="indefinite"/>`}</circle>`).join('')}</g>`,
    flammenaura: () => `<g>${[...Array(12)].map((_, i) => { const a = i * 30; return `<path d="M32 -3.2c2 2.4 3 4.6 2.4 7-.4 1.6-1.4 2.6-2.4 2.6s-2-1-2.4-2.6c-.6-2.4.4-4.6 2.4-7z" fill="${i % 2 ? '#FF6B1A' : '#FFA34F'}" transform="rotate(${a} 32 32)">${still() ? '' : `<animateTransform attributeName="transform" type="rotate" values="${a} 32 32;${a + 4} 32 32;${a} 32 32" dur="${0.8 + (i % 3) * 0.2}s" repeatCount="indefinite"/>`}</path>`; }).join('')}</g><circle cx="32" cy="32" r="33" fill="none" stroke="#FF4D6D" stroke-width="1.4" opacity=".7"/>`,
    komet: () => `<g>${still() ? '' : '<animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="4.6s" repeatCount="indefinite"/>'}<path d="M32 -3.6a35.6 35.6 0 0 1 22 7.6" stroke="#FFE27A" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".55"/><circle cx="55" cy="4.8" r="2.4" fill="#fff" style="filter:drop-shadow(0 0 3px #FFE27A)"/></g>`,
    blitzgewitter: () => `<g fill="#FFE27A">${[[-3, 6, 0], [62, 2, .7], [64, 50, 1.4], [-4, 52, 2.1]].map(([x, y, b]) => `<path transform="translate(${x} ${y})" d="M3 0L0 7h3l-1.4 6 5-8.4H3.4L5.4 0z" opacity="${still() ? .8 : 0}">${blink(2.8, b)}</path>`).join('')}</g>`,
    galaxie: () => `<g>${still() ? '' : '<animateTransform attributeName="transform" type="rotate" from="0 32 32" to="-360 32 32" dur="24s" repeatCount="indefinite"/>'}${[...Array(18)].map((_, i) => { const a = i * 20 * Math.PI / 180; const r = 33 + (i % 3) * 1.6; return `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="${i % 3 ? .7 : 1.2}" fill="${['#C9B8FF', '#7FDBFF', '#fff'][i % 3]}"/>`; }).join('')}</g>`,
  };
  // costumes: [over the body, over the head]
  const MASK = (c, eye) => `<path d="M20.6 26.4c3.2-1.6 7.6-1.6 11.4.4 3.8-2 8.2-2 11.4-.4-.4 3.6-2.6 6-5.4 6-2.4 0-4.2-1.2-6-3-1.8 1.8-3.6 3-6 3-2.8 0-5-2.4-5.4-6z" fill="${c}"/><circle cx="27.6" cy="29.2" r="1.9" fill="#fff"/><circle cx="36.4" cy="29.2" r="1.9" fill="#fff"/><circle cx="27.7" cy="29.3" r=".9" fill="${eye || '#222'}"/><circle cx="36.3" cy="29.3" r=".9" fill="${eye || '#222'}"/>`;
  const SUIT = (body, c) => `<path d="${body}" fill="${c}"/>`;
  const CAPE = (c) => `<path d="M14 64c1-9 4-15 8.6-18.6L32 50l9.4-4.6C46 49 49 55 50 64z" fill="${c}" opacity=".9"/>`;
  const costArt = {
    rennfahrer: [(b) => SUIT(b, '#E05555') + '<path d="M28 46v18M36 46v18" stroke="#fff" stroke-width="2.2"/><circle cx="32" cy="55" r="3.6" fill="#fff"/><path d="M31 53.4v3.4M33 53.4v3.4" stroke="#2E3138" stroke-width="1"/>',
      () => '<path d="M18.4 31c-1.2-12.4 5.4-20.4 13.6-20.4S46.8 18.6 45.6 31c-.4 3-2.4 4.4-4.6 4.4H23c-2.2 0-4.2-1.4-4.6-4.4z" fill="#E05555"/><path d="M21.6 25.4h20.8c.4 3.4-.2 6-1.6 7.2H23.2c-1.4-1.2-2-3.8-1.6-7.2z" fill="#2E3138" opacity=".85"/><path d="M23.4 27h7" stroke="#fff" stroke-width="1" opacity=".5"/><path d="M26 12.4c3.6-1.4 8.4-1.4 12 0" stroke="#fff" stroke-width="2"/>'],
    goldritter: [(b) => SUIT(b, '#D4A017') + '<path d="M32 49v12M27 54h10" stroke="#fff" stroke-width="2.2"/><path d="M20 47.4c7.4 2.6 16.6 2.6 24 0" stroke="#FFE27A" stroke-width="1.6" fill="none"/>',
      () => '<path d="M18.6 33c-1-13.6 5.4-21.6 13.4-21.6S46.4 19.4 45.4 33l-3.6.8c.4-2.8.4-5 .2-6.6H22c-.2 1.6-.2 3.8.2 6.6z" fill="#F5C542"/><path d="M22 27.2h20M32 11.6v9" stroke="#B8860B" stroke-width="1.2"/><path d="M30.6 6.4c3.8.6 5.8 2.8 5.8 5.2h-5.2z" fill="#4FA3E0"/>'],
    eiskoenig: [(b) => SUIT(b, '#7FDBFF') + '<path d="M32 46v18" stroke="#fff" stroke-width="2"/><g fill="#fff">' + [[26, 52], [38, 52], [26, 58], [38, 58]].map(([x, y]) => `<path d="M${x} ${y - 1.6}v3.2M${x - 1.4} ${y - .8}l2.8 1.6M${x - 1.4} ${y + .8}l2.8-1.6" stroke="#fff" stroke-width=".6"/>`).join('') + '</g>',
      () => '<path d="M23 17.6l1-8 3.4 4.2L32 6l4.6 7.8 3.4-4.2 1 8z" fill="#B8F0FF" stroke="#7FDBFF" stroke-width=".6"/><path d="M23 17.6h18" stroke="#7FDBFF" stroke-width="1.6"/><circle cx="32" cy="12" r="1.2" fill="#fff"/>'],
    feuertitan: [(b) => SUIT(b, '#8B0A32') + '<path d="M22 50c4-2 8 2 10-1 2 3 6-1 10 1-1 6-5 9-10 9s-9-3-10-9z" fill="#FFA34F" opacity=".85"/><path d="M27 52c2-1 4 1 5 0 1 1 3-1 5 0-.6 3-2.4 4.4-5 4.4s-4.4-1.4-5-4.4z" fill="#FFE27A"/>',
      () => '<path d="M20.6 22c0-3 1.4-5.6 2.6-7.4.4 2 1.2 3 2 3.4.2-4 2-7.6 4-9.6.2 2.4 1.2 4.4 2.8 5.4.8-2.6 2.6-4.6 4.4-5.6-.4 2.6 0 4.6 1.4 6 .8-1.4 1.8-2.2 2.8-2.6-.2 2.2.2 4.2.8 5.8.6 1.2.8 2.6.8 4.6z" fill="#FF6B1A"/><path d="M24.6 21.6c.4-2.4 1.6-4.4 2.8-5.6.4 1.6 1 2.6 1.8 3 .4-2.6 1.6-4.6 2.8-5.8.6 2 1.4 3.4 2.6 4.2.4-1.4 1.2-2.4 2-2.8.2 2.2 1 4.6 1 7z" fill="#FFE27A"/>'],
    astro: [(b) => SUIT(b, '#E8EEF5') + '<rect x="27.4" y="51" width="9.2" height="6" rx="1.2" fill="#4FA3E0"/><circle cx="29.4" cy="54" r=".9" fill="#E06B6B"/><circle cx="32" cy="54" r=".9" fill="#F5C542"/><circle cx="34.6" cy="54" r=".9" fill="#4FE08A"/><path d="M20 47.6c7.4 3 16.6 3 24 0" stroke="#C9D1D9" stroke-width="2" fill="none"/>',
      () => '<circle cx="32" cy="28" r="17" fill="rgba(170,215,255,.2)" stroke="#E8EEF5" stroke-width="3"/><path d="M22 18c2.6-3.4 6.4-5.2 10-5.4" stroke="#fff" stroke-width="1.6" opacity=".7" fill="none" stroke-linecap="round"/><path d="M44 14.4l3.4-4.6" stroke="#E8EEF5" stroke-width="1.4"/><circle cx="47.8" cy="9.4" r="1.6" fill="#E06B6B"/>'],
    mars: [(b) => SUIT(b, '#F08A3C') + '<rect x="27.4" y="51" width="9.2" height="6" rx="1.2" fill="#2E3138"/><path d="M29 54h6" stroke="#4FE08A" stroke-width="1.2"/><path d="M20 47.6c7.4 3 16.6 3 24 0" stroke="#C9D1D9" stroke-width="2.2" fill="none"/>',
      () => '<circle cx="32" cy="28" r="17" fill="rgba(255,180,120,.18)" stroke="#C9D1D9" stroke-width="3.2"/><path d="M17 26h3M44 26h3" stroke="#F08A3C" stroke-width="2.4"/><path d="M22 18c2.6-3.4 6.4-5.2 10-5.4" stroke="#fff" stroke-width="1.6" opacity=".7" fill="none" stroke-linecap="round"/>'],
    sternenkraft: [(b) => CAPE('#F5C542') + SUIT(b, '#D63C3C') + '<path d="M32 49.6l2 4.2 4.6.6-3.4 3.2.9 4.6-4.1-2.3-4.1 2.3.9-4.6-3.4-3.2 4.6-.6z" fill="#F5C542"/>', () => MASK('#D63C3C')],
    funkenflug: [(b) => SUIT(b, '#2F64A6') + '<path d="M33.4 49.4l-4.6 6.6h3.4l-1.6 5.4 5.6-7.4h-3.4l2-4.6z" fill="#F5C542"/><path d="M20 48l4 3M44 48l-4 3" stroke="#F5C542" stroke-width="1.6"/>', () => MASK('#F5C542', '#1d3f6e')],
    mondfee: [(b) => '<g fill="#C9B8FF" opacity=".8"><path d="M20 46c-7-6-12-3-11 3 1 4 6 5 11 2z"/><path d="M44 46c7-6 12-3 11 3-1 4-6 5-11 2z"/></g>' + SUIT(b, '#4B3B8F') + '<path d="M33.4 50.4a4 4 0 1 0 1.2 7.4 3.2 3.2 0 1 1-1.2-7.4z" fill="#E8E3FF"/>', () => MASK('#4B3B8F')],
    turbo: [(b) => SUIT(b, '#2E3138') + '<path d="M18 52h8M16 55.4h9M18 58.8h8" stroke="#4FE08A" stroke-width="1.4" stroke-linecap="round"/><circle cx="34" cy="55" r="4.4" fill="#4FE08A"/><path d="M32.6 52.6h3.6M34.4 52.6v5" stroke="#2E3138" stroke-width="1.4"/>', () => MASK('#4FE08A', '#1d3a26')],
    sternschnuppe: [(b) => CAPE('#3FC1B0') + SUIT(b, '#EC6FA8') + '<path d="M36 50.4l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4z" fill="#FFE27A"/><path d="M33 54l-8 4M33.4 55.6l-7 5" stroke="#FFE27A" stroke-width="1" stroke-linecap="round" opacity=".8"/>', () => MASK('#3FC1B0')],
    ninja: [(b) => SUIT(b, '#2B2F3A') + '<path d="M20 51l24 8" stroke="#D63C3C" stroke-width="2.2"/>',
      () => '<path d="M19.6 26.6c0-9 5.4-15 12.4-15s12.4 6 12.4 15z" fill="#2B2F3A"/><path d="M20.6 31.6h22.8c-.6 6-5.2 9.6-11.4 9.6s-10.8-3.6-11.4-9.6z" fill="#2B2F3A"/><rect x="19.6" y="21" width="24.8" height="2.4" fill="#D63C3C"/><path d="M44.2 21.4l5.6-2.4-1 3.4 3 1.2-7 .8z" fill="#D63C3C"/>'],
    ritter: [(b) => SUIT(b, '#9AA5B1') + '<path d="M32 49v12M27 54h10" stroke="#D63C3C" stroke-width="2.2"/><path d="M20 47.4c7.4 2.6 16.6 2.6 24 0" stroke="#C9D1D9" stroke-width="1.6" fill="none"/>',
      () => '<path d="M18.6 33c-1-13.6 5.4-21.6 13.4-21.6S46.4 19.4 45.4 33l-3.6.8c.4-2.8.4-5 .2-6.6H22c-.2 1.6-.2 3.8.2 6.6z" fill="#B9C3CE"/><path d="M22 27.2h20" stroke="#8A96A3" stroke-width="1.2"/><path d="M32 11.6v9" stroke="#8A96A3" stroke-width="1.2"/><path d="M30.6 6.4c3.8.6 5.8 2.8 5.8 5.2h-5.2z" fill="#D63C3C"/>'],
    pirat: [(b) => SUIT(b, '#F4F4F4') + '<path d="M16 54h32M14 58h36M13 62h38" stroke="#2F64A6" stroke-width="1.6"/><path d="M26 46.4l6 4 6-4" stroke="#2b2b2b" stroke-width="1" fill="none"/>',
      () => '<path d="M17.6 21.6c1-7.6 6.8-12.4 14.4-12.4s13.4 4.8 14.4 12.4c-4-2-9-3-14.4-3s-10.4 1-14.4 3z" fill="#2b2b2b"/><path d="M29.4 13.4l2.6 2.6 2.6-2.6M29.4 16l5.2-2.6" stroke="#fff" stroke-width=".8"/><circle cx="32" cy="12.4" r="1.6" fill="#fff"/><path d="M22 22l19.6 8.4" stroke="#1e1e1e" stroke-width=".9"/><ellipse cx="36.2" cy="29.4" rx="3" ry="2.7" fill="#1e1e1e"/>'],
    zauberer: [(b) => SUIT(b, '#5B4FC4') + '<g fill="#F5C542"><circle cx="24" cy="54" r=".9"/><circle cx="38" cy="56" r=".8"/><circle cx="31" cy="60" r=".7"/><circle cx="41" cy="50.4" r=".6"/></g>',
      () => '<path d="M14.6 21c7-2.2 27.8-2.2 34.8 0-2.4-1-5-2.4-6.8-2.8L33.6 1.6l-8.4 16.6c-2.2.4-6.2 1.6-10.6 2.8z" fill="#5B4FC4"/><circle cx="29" cy="12" r="1" fill="#F5C542"/><circle cx="35.4" cy="15.4" r=".8" fill="#F5C542"/><circle cx="32.6" cy="7.6" r=".7" fill="#F5C542"/>'],
    prinzessin: [(b) => SUIT(b, '#EC6FA8') + '<path d="M22 48c6.6 3 13.4 3 20 0" stroke="#FFD1E6" stroke-width="2" fill="none"/><g fill="#FFE27A"><circle cx="32" cy="53" r="1"/><circle cx="28" cy="57" r=".8"/><circle cx="36" cy="57" r=".8"/></g>',
      () => '<path d="M25 16.4l1.4-4.6 2.8 3L32 9.8l2.8 5 2.8-3 1.4 4.6c-4.4-.8-9.6-.8-14 0z" fill="#F5C542"/><circle cx="32" cy="12.8" r="1" fill="#E06B9B"/>'],
    prinz: [(b) => CAPE('#8E3BA8') + SUIT(b, '#3E7CC9') + '<path d="M26 46l6 4 6-4" stroke="#F5C542" stroke-width="1.4" fill="none"/><circle cx="32" cy="54" r="1.2" fill="#F5C542"/><circle cx="32" cy="58" r="1.2" fill="#F5C542"/>',
      () => '<path d="M23.6 16.6l2-7.6 4.2 4.6L32 6.8l2.2 6.8 4.2-4.6 2 7.6z" fill="#F5C542" stroke="#D9A21E" stroke-width=".5"/><circle cx="32" cy="12.4" r="1.2" fill="#E06B6B"/>'],
    dino: [(b) => SUIT(b, '#5CB85C') + '<ellipse cx="32" cy="57" rx="7" ry="6" fill="#BFF0CF"/>',
      () => '<path d="M18.2 31c-1.4-12.6 5.2-20.4 13.8-20.4S47.2 18.4 45.8 31c-3.4-5-8.2-7.4-13.8-7.4S21.6 26 18.2 31z" fill="#5CB85C"/><path d="M24 12.6l2-4.4 2 3.4 2-5 2 4.6 2-5 2 5 2-3.4 2 4.4" fill="#F5C542" stroke="#F5C542" stroke-width=".6" stroke-linejoin="round"/><circle cx="26" cy="17.4" r="1.6" fill="#fff"/><circle cx="38" cy="17.4" r="1.6" fill="#fff"/><circle cx="26.3" cy="17.6" r=".8" fill="#2b2b2b"/><circle cx="38.3" cy="17.6" r=".8" fill="#2b2b2b"/>'],
    feuerwehr: [(b) => SUIT(b, '#2E3138') + '<path d="M16 54.6h32M15 59h34" stroke="#F5C542" stroke-width="2"/><path d="M16 54.6h32M15 59h34" stroke="#C9D1D9" stroke-width=".6"/>',
      () => '<path d="M17 22.6c.6-7.8 6.6-13 15-13s14.4 5.2 15 13z" fill="#D63C3C"/><path d="M14.6 22.4h34.8c0 1.8-1.4 3-3.2 3H17.8c-1.8 0-3.2-1.2-3.2-3z" fill="#B53030"/><path d="M29.6 12.6h4.8v7h-4.8z" fill="#F5C542"/><path d="M32 10.4v11.6" stroke="#B53030" stroke-width=".8"/>'],
  };

  const svg = (c, personColor, view) => {
    const o = norm(parse(c)); const bg = COLOR(personColor);
    const [h1, h2] = HC[o.hc]; const skin = SK[o.sk]; const kid = KID(o.fig); const old = OLD(o.fig); const fem = o.fig === 'm' || o.fig === 'f' || o.fig === 'g';
    const dark = ['braun', 'tief', 'espresso'].includes(o.sk);
    const body = kid ? 'M13 64c0-10.6 8-17.6 19-17.6S51 53.4 51 64z' : 'M7 64c0-12.2 11-19.4 25-19.4S57 51.8 57 64z';
    const shirt = SHIRT[o.shirt];
    const costume = o.cost !== '0' ? costArt[o.cost] : null;
    const hideHair = o.cost === 'ninja' || o.cost === 'ritter' || o.cost === 'dino' || o.cost === 'feuerwehr';
    const ha = hairArt[o.hair] || hairArt.kurz;
    let s = `<rect width="64" height="64" fill="${bg}"/>`;
    if (o.bg !== '0') s += bgArt[o.bg]();
    if (ha[0] && !hideHair) s += ha[0](h2, h1);
    // body: shirt (or the costume suit), neck
    s += costume ? costume[0](body) : `<path d="${body}" fill="${shirt}"/><path d="M26 45.6q6 4 12 0" stroke="#000" stroke-opacity=".15" stroke-width="1" fill="none"/>`;
    if (!costume && o.motif !== '0') s += motifArt[o.motif]();
    s += `<path d="M28.4 37h7.2v8.4c-2.2 1.6-5 1.6-7.2 0z" fill="${skin}"/><path d="M28.4 39.4c2.4 1 4.8 1 7.2 0" stroke="#000" stroke-opacity=".12" stroke-width="1.2" fill="none"/>`;
    if (o.neck !== '0') s += neckArt[o.neck]();
    // head
    s += `<circle cx="20.8" cy="29.6" r="2.4" fill="${skin}"/><circle cx="43.2" cy="29.6" r="2.4" fill="${skin}"/>`;
    s += `<ellipse cx="32" cy="28" rx="${kid ? 11.6 : 11}" ry="${kid ? 11.8 : 12.4}" fill="${skin}"/>`;
    if (!hideHair) s += ha[1](h1, h2);
    const eye = dark ? '#1a110b' : '#3b2a1e';
    s += `<path d="M25.4 25.4q2.4-1.2 4.8 0M33.8 25.4q2.4-1.2 4.8 0" stroke="${h2}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    s += `<circle cx="27.8" cy="29.4" r="1.5" fill="${eye}"/><circle cx="36.2" cy="29.4" r="1.5" fill="${eye}"/><circle cx="28.3" cy="28.9" r=".45" fill="#fff"/><circle cx="36.7" cy="28.9" r=".45" fill="#fff"/>`;
    if (old) s += `<path d="M22.8 30.4l1.2.8M41.2 30.4l-1.2.8M24.6 34.4q-.6 1.2.2 2M39.4 34.4q.6 1.2-.2 2" stroke="${dark ? '#2a1610' : '#b07a5a'}" stroke-width=".6" fill="none"/>`;
    if (!['bart', 'schnauz'].includes(o.face)) s += `<path d="M28.6 34.2q3.4 2.8 6.8 0" stroke="${dark ? '#2a1610' : fem && !kid ? '#C2546A' : '#b0613a'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    else s += '<path d="M29.4 35.8q2.6 1.4 5.2 0" stroke="#7a3b22" stroke-width="1" fill="none" stroke-linecap="round"/>';
    if (kid || fem) s += `<circle cx="24.4" cy="32.6" r="1.9" fill="#F29A9A" opacity="${dark ? '.3' : '.5'}"/><circle cx="39.6" cy="32.6" r="1.9" fill="#F29A9A" opacity="${dark ? '.3' : '.5'}"/>`;
    if (o.face !== '0') s += faceArt[o.face](h1);
    if (costume) s += costume[1]();
    if (o.head !== '0') s += headArt[o.head]();
    if (o.pet !== '0') s += petArt[o.pet]();
    if (o.fx !== '0') s += fxArt[o.fx]();
    return `<svg viewBox="${view || '0 0 64 64'}" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
  };
  // the big-effect layer around a picture: put it inside a position:relative box of the picture's size
  const outer = (c) => {
    const o = norm(parse(c)); if (o.fxb === '0' || !fxbArt[o.fxb]) return '';
    return `<span class="fpfxb" aria-hidden="true" style="position:absolute;inset:-10%;pointer-events:none;z-index:3"><svg viewBox="-6.4 -6.4 76.8 76.8" width="100%" height="100%" style="overflow:visible">${fxbArt[o.fxb]()}</svg></span>`;
  };

  // ---------------------------------------------------------------- builder
  const T = {
    de: { sk: 'Hautfarbe', hc: 'Haarfarbe', fig: 'Person', hair: 'Frisur', rnd: 'Zufall', none: 'Nichts', shirt: 'T-Shirt-Farbe', motif: 'Motiv', neck: 'Am Hals',
      c: { porzellan: 'Porzellan', hell: 'Hell', pfirsich: 'Pfirsich', mittel: 'Mittel', oliv: 'Oliv', karamell: 'Karamell', braun: 'Braun', tief: 'Dunkelbraun', espresso: 'Espresso', platin: 'Platinblond', blond: 'Blond', rotblond: 'Rotblond', hellbraun: 'Hellbraun', schwarz: 'Schwarz', rot: 'Rot', grau: 'Grau', rosa: 'Rosa', blau: 'Blau', lila: 'Lila', gruen: 'Grün', weiss: 'Weiss', orange: 'Orange', gelb: 'Gelb', tuerkis: 'Türkis', pink: 'Pink' },
      tabs: { head: 'Kopf', face: 'Gesicht', cloth: 'Kleidung', pet: 'Begleiter', bg: 'Hintergrund', cost: 'Verkleidung', fx: '✨ Effekte' }, fxNone: 'Effekte schaltest du mit Levels frei – ab Level 5 geht es los!', small: 'Kleine Effekte', big: 'Grosse Effekte', lock: 'Mit Levels freigeschaltet',
      costHint: 'Verkleidungen liegen über der Person – Hintergrund und Begleiter bleiben.',
      n: { skaterhelm: 'Skater-Helm', edelkrone: 'Edelstein-Krone', rubinkrone: 'Rubin-Krone', diamantbrille: 'Diamant-Brille', rubinmaske: 'Rubin-Maske', rubinumhang: 'Rubin-Umhang',
        babydrache: 'Baby-Drache', phoenix: 'Phönix-Küken', kristallfuchs: 'Kristall-Fuchs', rubindrache: 'Rubin-Drache', szepter: 'Szepter', comic: 'Comic-Explosion', sonnenuntergang: 'Sonnenuntergang',
        kristallhoehle: 'Kristallhöhle', lavagalaxie: 'Lava-Galaxie', rennfahrer: 'Rennfahrer', goldritter: 'Goldritter', eiskoenig: 'Eiskönig', feuertitan: 'Feuer-Titan',
        leuchtaugen: 'Leuchtende Augen', goldglanz: 'Goldglanz', rubinsplitter: 'Rubin-Splitter', feuerfunken: 'Feuerfunken', rubinglanz: 'Rubin-Glanz', herzfunken: 'Herzfunken', schneeflocken: 'Schneeflocken',
        silberaura: 'Silber-Aura', gluehwuermchen: 'Glühwürmchen', goldfluegel: 'Goldflügel', goldregen: 'Goldregen', flammenaura: 'Flammen-Aura', komet: 'Mini-Komet', blitzgewitter: 'Blitzgewitter', galaxie: 'Galaxie',
        levelcap: 'Level-Cap', goldbrille: 'Goldene Sonnenbrille', funkelsprossen: 'Funkelnde Sommersprossen', hamster: 'Hamster', sternchen: 'Funkelsterne', fx: 'Effekte',
        m: 'Mädchen', j: 'Junge', f: 'Frau', h: 'Mann', g: 'Grosi', p: 'Grosspapi',
        kurz: 'Kurz', seite: 'Seitenscheitel', stachel: 'Stachelig', wuschel: 'Wuschelkopf', undercut: 'Undercut', irokese: 'Irokese', lockenkurz: 'Kurze Locken', glatze: 'Glatze', lang: 'Lang', pony: 'Lang mit Pony', zoepfe: 'Zöpfe', pferd: 'Pferdeschwanz', dutt: 'Dutt', buns: 'Space-Buns', bob: 'Bob', locken: 'Lange Locken', afro: 'Afro', rastas: 'Rastas',
        cap: 'Cap', muetze: 'Bommelmütze', krone: 'Krone', blumen: 'Blumenkranz', katze: 'Katze', hase: 'Hase', baer: 'Bärenohren', einhorn: 'Einhorn', party: 'Partyhut', kopfhoerer: 'Kopfhörer', stirnband: 'Stirnband', schleife: 'Schleife',
        brille: 'Runde Brille', eckig: 'Eckige Brille', sonnenbrille: 'Sonnenbrille', sommersprossen: 'Sommersprossen', glitzer: 'Glitzer', pflaster: 'Pflaster', tiger: 'Tiger-Schminke', schmetterling: 'Schmetterling', bart: 'Bart', schnauz: 'Schnauz',
        schal: 'Schal', fliege: 'Fliege', kette: 'Kette', stern: 'Stern', herz: 'Herz', blitz: 'Blitz', ball: 'Fussball', rakete: 'Rakete',
        hund: 'Hund', papagei: 'Papagei', eidechse: 'Eidechse', affe: 'Äffchen', drache: 'Mini-Drache', pinguin: 'Pinguin', fuchs: 'Fuchs', roboter: 'Roboter', eule: 'Eule', ballon: 'Ballon', fussball: 'Fussball', gitarre: 'Gitarre', zauberstab: 'Zauberstab',
        sterne: 'Sterne', regenbogen: 'Regenbogen', herzen: 'Herzen', konfetti: 'Konfetti', weltall: 'Weltall', wolken: 'Wolken', blasen: 'Blasen', blitze: 'Blitze',
        astro: 'Astronaut', mars: 'Mars-Anzug', sternenkraft: 'Held Sternenkraft', funkenflug: 'Held Funkenflug', mondfee: 'Heldin Mondfee', turbo: 'Held Turbo', sternschnuppe: 'Heldin Sternschnuppe', ninja: 'Ninja', ritter: 'Ritter', pirat: 'Pirat', zauberer: 'Zauberer', prinzessin: 'Prinzessin', prinz: 'Prinz', dino: 'Dino', feuerwehr: 'Feuerwehr' } },
    en: { sk: 'Skin tone', hc: 'Hair colour', fig: 'Person', hair: 'Hair', rnd: 'Random', none: 'None', shirt: 'T-shirt colour', motif: 'Motif', neck: 'Around the neck',
      c: { porzellan: 'Porcelain', hell: 'Light', pfirsich: 'Peach', mittel: 'Medium', oliv: 'Olive', karamell: 'Caramel', braun: 'Brown', tief: 'Dark brown', espresso: 'Espresso', platin: 'Platinum blonde', blond: 'Blonde', rotblond: 'Strawberry blonde', hellbraun: 'Light brown', schwarz: 'Black', rot: 'Red', grau: 'Grey', rosa: 'Pink', blau: 'Blue', lila: 'Purple', gruen: 'Green', weiss: 'White', orange: 'Orange', gelb: 'Yellow', tuerkis: 'Turquoise', pink: 'Pink' },
      tabs: { head: 'Head', face: 'Face', cloth: 'Clothes', pet: 'Buddy', bg: 'Background', cost: 'Costume', fx: '✨ Effects' }, fxNone: 'Effects are unlocked with levels – it starts at level 5!', small: 'Small effects', big: 'Big effects', lock: 'Unlocked with levels',
      costHint: 'Costumes go over the person – background and buddy stay.',
      n: { skaterhelm: 'Skater helmet', edelkrone: 'Jewel crown', rubinkrone: 'Ruby crown', diamantbrille: 'Diamond glasses', rubinmaske: 'Ruby mask', rubinumhang: 'Ruby cape',
        babydrache: 'Baby dragon', phoenix: 'Phoenix chick', kristallfuchs: 'Crystal fox', rubindrache: 'Ruby dragon', szepter: 'Sceptre', comic: 'Comic burst', sonnenuntergang: 'Sunset',
        kristallhoehle: 'Crystal cave', lavagalaxie: 'Lava galaxy', rennfahrer: 'Racing driver', goldritter: 'Golden knight', eiskoenig: 'Ice king', feuertitan: 'Fire titan',
        leuchtaugen: 'Glowing eyes', goldglanz: 'Golden shine', rubinsplitter: 'Ruby shards', feuerfunken: 'Fire sparks', rubinglanz: 'Ruby glow', herzfunken: 'Heart sparks', schneeflocken: 'Snowflakes',
        silberaura: 'Silver aura', gluehwuermchen: 'Fireflies', goldfluegel: 'Golden wings', goldregen: 'Golden rain', flammenaura: 'Flame aura', komet: 'Mini comet', blitzgewitter: 'Thunderstorm', galaxie: 'Galaxy',
        levelcap: 'Level cap', goldbrille: 'Golden sunglasses', funkelsprossen: 'Sparkling freckles', hamster: 'Hamster', sternchen: 'Sparkle stars', fx: 'Effects',
        m: 'Girl', j: 'Boy', f: 'Woman', h: 'Man', g: 'Grandma', p: 'Grandpa',
        kurz: 'Short', seite: 'Side parting', stachel: 'Spiky', wuschel: 'Messy', undercut: 'Undercut', irokese: 'Mohawk', lockenkurz: 'Short curls', glatze: 'Bald', lang: 'Long', pony: 'Long with fringe', zoepfe: 'Pigtails', pferd: 'Ponytail', dutt: 'Bun', buns: 'Space buns', bob: 'Bob', locken: 'Long curls', afro: 'Afro', rastas: 'Dreadlocks',
        cap: 'Cap', muetze: 'Bobble hat', krone: 'Crown', blumen: 'Flower crown', katze: 'Cat', hase: 'Bunny', baer: 'Bear ears', einhorn: 'Unicorn', party: 'Party hat', kopfhoerer: 'Headphones', stirnband: 'Headband', schleife: 'Bow',
        brille: 'Round glasses', eckig: 'Square glasses', sonnenbrille: 'Sunglasses', sommersprossen: 'Freckles', glitzer: 'Glitter', pflaster: 'Plaster', tiger: 'Tiger face paint', schmetterling: 'Butterfly', bart: 'Beard', schnauz: 'Moustache',
        schal: 'Scarf', fliege: 'Bow tie', kette: 'Necklace', stern: 'Star', herz: 'Heart', blitz: 'Bolt', ball: 'Football', rakete: 'Rocket',
        hund: 'Dog', papagei: 'Parrot', eidechse: 'Lizard', affe: 'Monkey', drache: 'Mini dragon', pinguin: 'Penguin', fuchs: 'Fox', roboter: 'Robot', eule: 'Owl', ballon: 'Balloon', fussball: 'Football', gitarre: 'Guitar', zauberstab: 'Magic wand',
        sterne: 'Stars', regenbogen: 'Rainbow', herzen: 'Hearts', konfetti: 'Confetti', weltall: 'Space', wolken: 'Clouds', blasen: 'Bubbles', blitze: 'Bolts',
        astro: 'Astronaut', mars: 'Mars suit', sternenkraft: 'Hero Star Power', funkenflug: 'Hero Sparkwing', mondfee: 'Hero Moon Fairy', turbo: 'Hero Turbo', sternschnuppe: 'Hero Shooting Star', ninja: 'Ninja', ritter: 'Knight', pirat: 'Pirate', zauberer: 'Wizard', prinzessin: 'Princess', prinz: 'Prince', dino: 'Dino', feuerwehr: 'Firefighter' } },
  };
  Object.assign(T.de.n, { 'head:katze': 'Katzenohren', 'head:hase': 'Hasenohren', 'pet:katze': 'Katze', 'pet:hase': 'Hase', 'pet:fussball': 'Fussball' });
  Object.assign(T.en.n, { 'head:katze': 'Cat ears', 'head:hase': 'Bunny ears', 'pet:katze': 'Cat', 'pet:hase': 'Bunny', 'pet:fussball': 'Football' });
  const TABS = ['head', 'face', 'cloth', 'pet', 'bg', 'cost', 'fx'];
  // builder html: buttons carry data-avb="part|value" (or data-avtab / data-avrnd); the host keeps code and tab
  const builder = (c, personColor, lang, tab, unlocked) => {
    const mine = new Set(unlocked || []); const ok = (v) => !LOCKED.includes(v) || mine.has(v);
    const t = T[lang === 'en' ? 'en' : 'de']; const o = parse(c); const cur = code(norm(o)); const n = norm(o); const tb = TABS.includes(tab) ? tab : 'head';
    const ZOOM = { hair: '10 0 44 44', head: '10 0 44 44', face: '14 10 36 36', neck: '12 30 40 34', motif: '12 36 40 28' };
    const pic = (cc, on, key, attr) => `<button class="avo${on ? ' on' : ''}" data-avb="${attr}" title="${esc(t.n[attr.replace('|', ':')] || t.n[key] || key)}"><span class="avs">${svg(cc, personColor, ZOOM[attr.split('|')[0]])}</span></button>`;
    const dot = (col, on, key, attr) => `<button class="avd${on ? ' on' : ''}" data-avb="${attr}" title="${esc(t.c[key] || key)}" style="background:${col}"></button>`;
    const none = (part) => `<button class="avo txt${n[part] === '0' ? ' on' : ''}" data-avb="${part}|0">${esc(t.none)}</button>`;
    const row = (label, html) => `<div class="avr">${label ? `<b>${esc(label)}</b>` : ''}<div class="avg">${html}</div></div>`;
    const opts = (part, list) => none(part) + list.filter(ok).map((v) => pic(set(cur, part, v), n[part] === v, v, `${part}|${v}`) .replace('class="avo', LOCKED.includes(v) ? 'class="avo lvx' : 'class="avo')).join('');
    let body = '';
    if (tb === 'head') body = row('', opts('head', HEAD));
    if (tb === 'face') body = row('', opts('face', FACE.filter((f) => !BEARD.includes(f) || n.fig === 'h' || n.fig === 'p')));
    if (tb === 'cloth') body = row(t.shirt, Object.entries(SHIRT).map(([k, col]) => dot(col, n.shirt === k, k, `shirt|${k}`)).join('')) + row(t.motif, opts('motif', MOTIF)) + row(t.neck, opts('neck', NECK));
    if (tb === 'pet') body = row('', opts('pet', PET));
    if (tb === 'bg') body = row('', opts('bg', BG));
    const bigPic = (v) => `<button class="avo lvx${n.fxb === v ? ' on' : ''}" data-avb="fxb|${v}" title="${esc(t.n[v] || v)}"><span class="fxw"><span class="avs">${svg(cur, personColor)}</span>${outer(set(cur, 'fxb', v))}</span></button>`;
    if (tb === 'fx') body = FX.some(ok) || FXB.some(ok) ? (FX.some(ok) ? row(t.small, opts('fx', FX)) : '') + (FXB.some(ok) ? row(t.big, `<button class="avo txt${n.fxb === '0' ? ' on' : ''}" data-avb="fxb|0">${esc(t.none)}</button>` + FXB.filter(ok).map(bigPic).join('')) : '') : `<div class="avh">${esc(t.fxNone)}</div>`;
    if (tb === 'cost') body = `<div class="avh">${esc(t.costHint)}</div>` + row('', opts('cost', COST));
    return `<div class="avb"><div class="avp"><span class="fxw big"><span class="avs big">${svg(cur, personColor)}</span>${outer(cur)}</span><button class="avrnd" data-avrnd><span aria-hidden="true">🎲</span> ${esc(t.rnd)}</button></div><div class="avc">
      ${row(t.sk, Object.entries(SK).map(([k, col]) => dot(col, n.sk === k, k, `sk|${k}`)).join(''))}
      ${row(t.hc, Object.entries(HC).map(([k, col]) => dot(col[0], n.hc === k, k, `hc|${k}`)).join(''))}
      ${row(t.fig, FIG.map((f) => pic(set(cur, 'fig', f), n.fig === f, f, `fig|${f}`)).join(''))}
      ${row(t.hair, HAIR.filter((h) => !(h === 'glatze' && KID(n.fig))).map((h) => pic(set(cur, 'hair', h), n.hair === h, h, `hair|${h}`)).join(''))}
      <div class="avt">${TABS.map((x) => `<button class="${x === tb ? 'on' : ''}" data-avtab="${x}">${esc(t.tabs[x])}</button>`).join('')}</div>
      ${body}</div></div>`;
  };
  const css = `.avb{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}.avp{flex:none;display:flex;flex-direction:column;align-items:center;gap:10px;position:sticky;top:8px}
.avs{display:inline-flex;width:44px;height:44px;border-radius:50%;overflow:hidden}.avs.big{width:132px;height:132px;box-shadow:0 6px 20px rgba(0,0,0,.35)}
.avc{flex:1;min-width:260px;display:flex;flex-direction:column;gap:10px}.avr b{display:block;font-size:12px;color:var(--fp-text2,#aaa);font-weight:500;margin-bottom:5px}
.avg{display:flex;flex-wrap:wrap;gap:6px}.avh{font-size:12px;color:var(--fp-text3,#888)}
.avo{padding:2px;border-radius:50%;border:2px solid transparent;background:transparent;cursor:pointer;line-height:0}.avo.on{border-color:var(--fp-accent,#69C350)}
.avo.txt{border-radius:22px;height:48px;padding:0 14px;line-height:1;color:inherit;font:inherit;font-size:13px;border:1px solid var(--fp-line,#444)}.avo.txt.on{border:2px solid var(--fp-accent,#69C350)}
.avd{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0}.avd.on{outline:3px solid var(--fp-accent,#69C350);outline-offset:2px}
.avt{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;border-top:1px solid var(--fp-line,#333);padding-top:10px}.avt button{height:36px;padding:0 14px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}
.avt button.on{border-color:var(--fp-accent,#69C350);color:var(--fp-accent,#69C350);font-weight:600}
.fxw{position:relative;display:inline-flex;line-height:0}.avo .fxw .avs,.fxw .avs{display:inline-flex}
.avo.lvx{border-color:rgba(245,197,66,.55);box-shadow:0 0 8px rgba(245,197,66,.45)}.avo.lvx.on{border-color:var(--fp-accent,#69C350)}
.avrnd{height:36px;padding:0 14px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text,#eee);font:inherit;font-size:13px;cursor:pointer}`;

  const label = (id, lang) => T[lang === 'en' ? 'en' : 'de'].n[id] || id;
  window.FPAV = { outer, FXB, label, LOCKED, parse, norm, code, set, from1, random, svg, builder, css, FIELDS, LISTS, OPTIONAL, COST_HAT, COST_MASK, GLASSES, BEARD, SK, HC, KID };
})();

(() => {
// Familienplaner – Loxone-Style Karten
//  custom:fp-week-inner   Wochenkalender mit Ämtli (heute abhaken), Verlauf, Zuverlässigkeit, Kalender-Termine
//  custom:lox-aemtli-config-card  Ämtliplan bearbeiten (wie Serientermine: Text, Kind, Wochentage)
// Datenhaltung: todo.amtli_plan (Plan), todo.amtli_heute (heutige Ämtli), todo.amtli_verlauf (Tagesbilanz)
// Beschreibungen: "fp1:" + JSON   Plan {k,t:[1..7]}   Heute {k,d,c}   Verlauf {s:[[kind,erledigt,total]],x:[[kind,text]]}
const G = 'var(--fp-accent)';
const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WDL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const PALETTE = ['#69C350', '#4FA3E0', '#E0A84F', '#C771D6', '#E06B6B', '#4FD1C5'];
const CALCOL = ['#4FA3E0', '#E0A84F', '#C771D6', '#4FD1C5', '#E06B6B'];
const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoWd = (d) => d.getDay() || 7;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// planner day: changes at the configured day-change time (window.FP_DAY_OFFSET_MIN)
const fpDay = () => new Date(Date.now() - (window.FP_DAY_OFFSET_MIN || 0) * 60000);
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDesc = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };
const isoWeek = (d) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); };
// Zuteilung eines Plan-Ämtli: neues Format {z:{Person:[Tage]}}, altes Format {k, t} wird automatisch übernommen
const planZ = (m) => (m && m.z && typeof m.z === 'object') ? m.z : (m && m.k ? { [m.k]: m.t || [] } : {});
// Rhythmus: m.r = {"Person|Wochentag": [alle_n_Wochen, offset]}; aktiv, wenn Wochenindex % n == offset
const weekIdx = (d) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1970, 0, 5)) / 604800000);
const planActive = (m, kid, wd, date) => { const r = (m && m.r && m.r[`${kid}|${wd}`]) || null; if (!r || !(r[0] > 1)) return true; return weekIdx(date) % r[0] === r[1]; };
// Frist: Heute-Item {d: Start, e: Fristende}; Plan m.f = {"Person|Wochentag": Anzahl Tage}
const dueTag = (m, tStr) => { const e = m.e || m.d; if (!e) return ''; if (e > tStr) return `<em class="due">bis ${WD[isoWd(new Date(e + 'T00:00:00')) - 1]}</em>`; if (m.d && m.d < tStr) return '<em class="due last">heute fällig</em>'; return ''; };
// Termin-Zeit mit Dauer: breit "14:30–15:20 · 50 Min", schmal "14:30 · 50′"
const durTxt = (ms, short) => { const m = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(m / 60), r = m % 60;
  if (short) return h ? (r ? `${h}h${pad(r)}` : `${h}h`) : `${m}′`;
  return h ? (r ? `${h} h ${r} Min` : `${h} h`) : `${m} Min`; };
// nächster Termin: „in 25 Min“; vorbei = abgeblendet
const SOON_T = ['in {n} Min', 'in {n} Std'];
const evState = (e) => { if (e.allDay) return { c: '', b: '' }; const now = new Date();
  if (e.e <= now) return { c: ' past', b: '' };
  const m = Math.round((e.s - now) / 60000);
  if (m > 0 && m <= 180) return { c: ' soon', b: `<em class="soon">${(m < 60 ? SOON_T[0] : SOON_T[1]).replace('{n}', m < 60 ? m : Math.round(m / 6) / 10)}</em>` };
  if (e.s <= now) return { c: ' now', b: '' };
  return { c: '', b: '' }; };
// Jetzt-Linie zwischen vergangenen und kommenden Terminen von heute
const nowLine = () => { const n = new Date(); return `<div class="nowl"><span>${pad(n.getHours())}:${pad(n.getMinutes())}</span></div>`; };
const withNow = (list, today, html) => { if (!today) return list.map(html).join(''); const now = new Date(); let put = false;
  const out = list.map((e) => { let pre = ''; if (!put && !e.allDay && e.s > now) { put = true; pre = nowLine(); } return pre + html(e); });
  if (!put && list.some((e) => !e.allDay)) out.push(nowLine());
  return out.join(''); };
const evTime = (e, wide) => {
  if (e.allDay) { const n = Math.round((e.e - e.s) / 86400000); return `<b>${wide ? 'Ganztägig' : 'Ganzt.'}</b>${n > 1 ? `<span class="du">${n} Tage</span>` : ''}`; }
  const t = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
  return wide ? `<b>${t(e.s)}–${t(e.e)}</b><span class="du">${durTxt(e.e - e.s)}</span>` : `<b>${t(e.s)}</b><span class="du">${durTxt(e.e - e.s, true)}</span>`;
};
const level = (p) => p === null ? { c: '#5a5a5a', t: 'Noch keine Daten' }
  : p >= 90 ? { c: G, t: 'Super zuverlässig' }
  : p >= 75 ? { c: '#A8CF45', t: 'Zuverlässig' }
  : p >= 50 ? { c: '#E0A84F', t: 'Geht noch besser' }
  : { c: '#E06B6B', t: 'Unzuverlässig' };
// Avatare (flache SVG-Portraits): maedchen-lang, maedchen-zoepfe, maedchen-dutt, frau, mann
// Auszeichnungen: Titel und Erklärung (Titel, warum man sie hat)
const AWT = {
  trophy: ['Pokal des Monats', 'Beste Quote im letzten Monat.'],
  crown: ['Krone der Woche', 'Beste Quote der letzten Woche.'],
  perfect: ['Perfekte Woche', 'Letzte Woche alle Ämtli erledigt.'],
  bee: ['Fleissbiene', 'Am meisten erledigt in der letzten Woche.'],
  weekend: ['Wochenend-Held', 'Am Wochenende alles erledigt.'],
  climber: ['Aufsteiger', 'Am meisten verbessert gegenüber der Vorwoche.'],
  early: ['Frühaufsteher', 'An mindestens 4 Tagen alles vor {t} Uhr erledigt.'],
  diamond: ['Diamant-Serie', '{n} Tage am Stück alles erledigt.'],
  milestone: ['Meilenstein {n}', '{n} Ämtli insgesamt erledigt.'],
  team: ['Familien-Teamwork', 'Gestern hat die ganze Familie alles erledigt.'],
  streak: ['{n}-Tage-Serie', '{n} Tage am Stück alles erledigt.'],
};
// So gewinnt man sie (Regel-Liste in den Personendetails)
const AWR = [
  ['trophy', 'mdi:trophy', '#D9E4F0', 'Pokal des Monats', 'Beste Quote eines ganzen Monats (mind. 10 Ämtli/Tage) – vergeben am Monatsersten.'],
  ['crown', 'mdi:crown', '#F5C542', 'Krone der Woche', 'Beste Quote einer Woche (mind. 3 Ämtli/Tage) – vergeben jeden Montag.'],
  ['perfect', 'mdi:star-four-points', '#C9D1D9', 'Perfekte Woche', 'Eine ganze Woche alle Ämtli erledigt (mind. 5).'],
  ['bee', 'mdi:bee', '#CD8A4E', 'Fleissbiene', 'Am meisten erledigt in einer Woche (im Modus Fair: die meisten ganzen Tage).'],
  ['weekend', 'mdi:shield-star', '#E06B6B', 'Wochenend-Held', 'Samstag und Sonntag alles erledigt.'],
  ['climber', 'mdi:trending-up', '#4FD1C5', 'Aufsteiger', 'Mindestens 15 Prozentpunkte besser als in der Vorwoche.'],
  ['early', 'mdi:weather-sunset-up', '#FFB74D', 'Frühaufsteher', 'An mindestens 4 Tagen der Woche alles vor {t} Uhr erledigt.'],
  ['diamond', 'mdi:diamond-stone', '#7FDBFF', 'Diamant-Serie', '30 Tage am Stück alles erledigt.'],
  ['milestone', 'mdi:medal', '#E0A84F', 'Meilenstein', '100, 500 und 1000 Ämtli insgesamt erledigt.'],
  ['team', 'mdi:account-group', '#C771D6', 'Familien-Teamwork', 'An einem Tag erledigt die ganze Familie alles.'],
];
// Rahmen, Krone und Medaillen – auch von der Belohnungs-Ansicht genutzt
const AWCSS = `.crown{position:absolute;top:-13px;left:0;right:0;margin:0 auto;width:20px;height:18px;justify-content:center;color:#F5C542;filter:drop-shadow(0 1px 1px rgba(0,0,0,.7)) drop-shadow(0 0 4px rgba(245,197,66,.55));z-index:3;display:flex}.crown ha-icon{--mdc-icon-size:20px}
.ring[class*=fr-]{padding:3px;box-sizing:content-box;border-radius:50%;margin:3px}.ring[class*=fr-]::before{content:"";position:absolute;inset:0;border-radius:50%;padding:3px;background:var(--fr);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;z-index:1;pointer-events:none}
.ring[class*=fr-]::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);background-size:250% 100%;mix-blend-mode:overlay;animation:fpshine 4.5s ease-in-out infinite;pointer-events:none;z-index:2}
.ring.fr-platinum{--fr:conic-gradient(from 200deg,#f7fbff,#9fb3cc,#ffffff,#b9c9de,#e9f2ff,#8ea4c0,#f7fbff);filter:drop-shadow(0 0 6px rgba(190,215,255,.45))}
.ring.fr-gold{--fr:conic-gradient(from 200deg,#fff4b8,#d4a017,#fff7cf,#b8860b,#ffe27a,#a87a0a,#fff4b8);filter:drop-shadow(0 0 6px rgba(245,197,66,.45))}
.ring.fr-silver{--fr:conic-gradient(from 200deg,#ffffff,#a8b1bc,#f3f5f8,#8a939e,#e2e6eb,#7d8792,#ffffff)}
.ring.fr-bronze{--fr:conic-gradient(from 200deg,#ffd0a0,#a35a28,#ffdcb8,#8a4a22,#e7a46c,#7a3f1c,#ffd0a0)}
@keyframes fpshine{0%,60%{background-position:150% 0}100%{background-position:-60% 0}}
@media (prefers-reduced-motion:reduce){.ring[class*=fr-]::after{animation:none;display:none}}
.md{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 32% 28%,color-mix(in srgb,var(--mc) 55%,#fff) 0%,var(--mc) 45%,color-mix(in srgb,var(--mc) 60%,#000) 100%);border:1px solid color-mix(in srgb,var(--mc) 70%,#fff);color:#1b1b1b;display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:0 1px 3px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.45)}.md ha-icon{--mdc-icon-size:13px}
.ring{position:relative;width:48px;height:48px;flex:none}.ring .lvb{position:absolute;right:-4px;bottom:-3px;z-index:4;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;border:2px solid var(--fp-bg2,#1e1e1e);background:var(--lc);color:#1b1b1b;font:800 11px/18px -apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.5)}
.ring .lvb.t-ruby{color:#fff}.ring .lvb.glow{animation:fplvglow 1.6s ease-in-out infinite;box-shadow:0 0 10px var(--lc),0 0 18px var(--lc)}.ring .lvb.fade{box-shadow:0 0 calc(var(--g) * 14px) var(--lc)}
@keyframes fplvglow{0%,100%{box-shadow:0 0 6px var(--lc),0 0 10px var(--lc);transform:scale(1)}50%{box-shadow:0 0 14px var(--lc),0 0 26px var(--lc);transform:scale(1.15)}}
@media (prefers-reduced-motion:reduce){.ring .lvb.glow{animation:none}}
.ring .ava{display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;-webkit-mask-image:-webkit-radial-gradient(white,black)}
.ring .ava > span{width:100%!important;height:100%!important;border-radius:50%}.ring .ava svg{display:block}`;
const SKIN = '#F3CDA6', HAIR = '#EBC55A', HAIR2 = '#D4A63B';
const AV_TYPES = ['maedchen-lang', 'maedchen-zoepfe', 'maedchen-dutt', 'frau', 'mann'];
const avatarSvg = (type, bg) => {
  const kid = type.startsWith('maedchen');
  const back = {
    'maedchen-lang': `<path d="M11 19c0-7 4-11.5 9-11.5s9 4.5 9 11.5v10.5c0 1.5-1.5 2.5-3 2.5H14c-1.5 0-3-1-3-2.5z" fill="${HAIR2}"/>`,
    'maedchen-zoepfe': `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/>`,
    'maedchen-dutt': `<circle cx="20" cy="7.2" r="4.4" fill="${HAIR2}"/>`,
    'frau': `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v14c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${HAIR2}"/>`,
    'mann': ''
  }[type] || '';
  const front = {
    'maedchen-lang': `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${HAIR}"/><rect x="23.4" y="11.4" width="4.2" height="1.7" rx=".85" fill="#FF7AA8" transform="rotate(-25 25.5 12.2)"/>`,
    'maedchen-zoepfe': `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${HAIR}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
    'maedchen-dutt': `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${HAIR}"/><rect x="17.1" y="9.4" width="5.8" height="1.7" rx=".85" fill="#7FC8F8"/>`,
    'frau': `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${HAIR}"/><circle cx="12.5" cy="21.6" r=".8" fill="#fff"/><circle cx="27.5" cy="21.6" r=".8" fill="#fff"/>`,
    'mann': `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${HAIR}"/>`
  }[type] || '';
  const body = kid ? `<path d="M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z" fill="#111" opacity=".28"/>` : `<path d="M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z" fill="#111" opacity=".28"/>`;
  const face = `<rect x="17" y="23" width="6" height="7" fill="${SKIN}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${SKIN}"/>`;
  const eyes = `<circle cx="17.1" cy="18.6" r="1.05" fill="#3b2a1e"/><circle cx="22.9" cy="18.6" r="1.05" fill="#3b2a1e"/><path d="M17.6 22q2.4 1.9 4.8 0" stroke="#b0613a" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  const cheeks = type !== 'mann' ? `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/>` : '';
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/>${back}${body}${face}${front}${eyes}${cheeks}</svg>`;
};
const avatarBase = (k, size) => (k.avatar && AV_TYPES.includes(k.avatar))
  ? `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarSvg(k.avatar, k.farbe)}</span>`
  : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size * 0.42)}px;color:#161616;flex:none">${esc((k.name || '?').charAt(0).toUpperCase())}</span>`;
// Avatar-Baukasten: 'av:<alter>.<frisur>.<haarfarbe>.<haut>.<extras>'  alter k=Kind e=Erwachsen o=Grosseltern; extras mit + verbunden, 0 = keine
const AV_HC = { platin: ['#F2E6C2', '#D9C998'], blond: ['#EBC55A', '#D4A63B'], hellbraun: ['#B5814A', '#94663A'], braun: ['#8B5A2B', '#6E4520'], schwarz: ['#3A3330', '#26211F'], rot: ['#D2662F', '#A9491E'],
  grau: ['#CDD1D5', '#A9AEB3'], weiss: ['#F1F1F1', '#D2D2D2'], rosa: ['#F49AC1', '#D9779F'], blau: ['#5FA8E8', '#3F86C6'], lila: ['#A98BE8', '#8566C9'], gruen: ['#5CC98A', '#3FA56B'] };
const AV_SK = { porzellan: '#FBE3CF', hell: '#F3CDA6', pfirsich: '#EDBB8F', mittel: '#E3B48A', oliv: '#C99167', karamell: '#B07A52', dunkel: '#8D5A3B', tief: '#6B4129', espresso: '#4A2C1C' };
const AV_HB = {
  long: (c) => `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v13c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${c}"/>`,
  zoepfe: (c) => `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/>`,
  dutt: (c) => `<circle cx="20" cy="7.2" r="4.4" fill="${c}"/>`,
  bob: (c) => `<path d="M10.8 19c0-7 4-11.5 9.2-11.5s9.2 4.5 9.2 11.5v6.5c0 1.2-1 2-2.2 2H13c-1.2 0-2.2-.8-2.2-2z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="11.5" cy="15" r="3.6"/><circle cx="28.5" cy="15" r="3.6"/><circle cx="10.8" cy="21" r="3.4"/><circle cx="29.2" cy="21" r="3.4"/><circle cx="12" cy="26.5" r="3"/><circle cx="28" cy="26.5" r="3"/></g>`,
  pferd: (c) => `<path d="M26.5 10.5c4.5.5 6.5 5 6 10.5-.4 4.2-2.6 6.4-4.2 7 1-3.4 1.2-7.6-.2-11z" fill="${c}"/>`
};
const AV_HF = {
  long: (c) => `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${c}"/>`,
  pony: (c) => `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${c}"/>`,
  zoepfe: (c) => `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${c}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
  dutt: (c) => `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${c}"/>`,
  kurz: (c) => `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${c}"/>`,
  seite: (c) => `<path d="M12 18c-.4-6.4 3.4-10.4 8-10.4 4.8 0 8.4 3.6 8 9.6-2.4-2.6-6.6-4.6-12.2-4.2-1.4.8-3 2.8-3.8 5z" fill="${c}"/>`,
  stachel: (c) => `<path d="M11.9 17.6l.3-5.2 1.9 1.3.8-4.4 2.1 2.3 1.5-4.6 1.8 4.1 2.2-3.8 1.2 4.4 2.5-2.5.3 4.8 1.6.6c.4 1.2.3 2.2 0 3-1.3-2.4-3.6-3.9-8.2-3.9s-6.8 1.5-8 3.9z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="14" cy="11.2" r="3.4"/><circle cx="20" cy="9.2" r="3.6"/><circle cx="26" cy="11.2" r="3.4"/><circle cx="12" cy="15.2" r="2.8"/><circle cx="28" cy="15.2" r="2.8"/></g>`,
  glatze: (c) => `<path d="M12.2 20.5c-.9-2.2-.5-4.6.8-5.6.5 1.9.6 3.6-.8 5.6zM27.8 20.5c.9-2.2.5-4.6-.8-5.6-.5 1.9-.6 3.6.8 5.6z" fill="${c}"/>`
};
const AV_ST = { long: ['long', 'long'], ponylang: ['long', 'pony'], zoepfe: ['zoepfe', 'zoepfe'], dutt: ['dutt', 'dutt'], bob: ['bob', 'pony'], locken: ['locken', 'locken'], pferd: ['pferd', 'seite'], kurz: [null, 'kurz'], seite: [null, 'seite'], stachel: [null, 'stachel'], lockenkurz: [null, 'locken'], glatze: [null, 'glatze'] };
const AV_MASK = (c) => `<path d="M12.3 16.6c2.2-1 5-1 7.7.2 2.7-1.2 5.5-1.2 7.7-.2-.2 2.4-1.6 4-3.6 4-1.6 0-2.8-.8-4.1-2-1.3 1.2-2.5 2-4.1 2-2 0-3.4-1.6-3.6-4z" fill="${c}"/><circle cx="16.8" cy="18.2" r="1.25" fill="#fff"/><circle cx="23.2" cy="18.2" r="1.25" fill="#fff"/><circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>`;
const AV_ACC = {
  sommersprossen: () => `<g fill="#B5774F" opacity=".7"><circle cx="15.6" cy="20.5" r=".38"/><circle cx="16.7" cy="21.3" r=".34"/><circle cx="15.1" cy="21.7" r=".32"/><circle cx="24.4" cy="20.5" r=".38"/><circle cx="23.3" cy="21.3" r=".34"/><circle cx="24.9" cy="21.7" r=".32"/></g>`,
  sonnenbrille: () => `<g fill="#1d1d24"><rect x="14.3" y="16.9" width="5.1" height="3.6" rx="1.5"/><rect x="20.6" y="16.9" width="5.1" height="3.6" rx="1.5"/></g><path d="M19.4 18h1.2M12.5 17.5l1.8.3M27.5 17.5l-1.8.3" stroke="#1d1d24" stroke-width=".8"/><path d="M15.2 17.7l1.4-.1M21.5 17.7l1.4-.1" stroke="#fff" stroke-width=".5" opacity=".6"/>`,
  stirnband: () => `<path d="M12.1 13.8c4.9-1.9 10.9-1.9 15.8 0l-.3 2.1c-4.9-1.7-10.3-1.7-15.2 0z" fill="#4FD1C5"/><path d="M12.4 14.9c4.7-1.5 10.5-1.5 15.2 0" stroke="#fff" stroke-width=".4" opacity=".7" fill="none"/>`,
  blitz: () => AV_MASK('#F5C542').replace('<circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>', '<circle cx="16.9" cy="18.3" r=".6" fill="#1d3f6e"/><circle cx="23.1" cy="18.3" r=".6" fill="#1d3f6e"/>'),
  nacht: () => AV_MASK('#4B3B8F'),
  ninja: () => `<path d="M11.4 16.8c0-6 3.8-9.8 8.6-9.8s8.6 3.8 8.6 9.8z" fill="#2B2F3A"/><path d="M12.1 20.5h15.8c-.4 4.1-3.6 6.6-7.9 6.6s-7.5-2.5-7.9-6.6z" fill="#2B2F3A"/><rect x="11.5" y="13.9" width="17" height="1.7" fill="#D63C3C"/><path d="M28.3 14.2l3.9-1.6-.7 2.3 2.1.9-4.8.6z" fill="#D63C3C"/>`,
  ritter: () => `<path d="M10.8 22.6c-.7-9.2 3.6-14.8 9.2-14.8s9.9 5.6 9.2 14.8l-2.5.5c.3-1.9.3-3.4.1-4.5H13.2c-.2 1.1-.2 2.6.1 4.5z" fill="#B9C3CE"/><path d="M13.2 18.6h13.6" stroke="#8A96A3" stroke-width=".9"/><path d="M20 8v6.4" stroke="#8A96A3" stroke-width=".9"/><path d="M19 4.4c2.6.4 4 1.9 4 3.6h-3.6z" fill="#D63C3C"/>`,
  brille: () => `<g fill="none" stroke="#2b2b2b" stroke-width=".9"><circle cx="17.1" cy="18.6" r="2.4"/><circle cx="22.9" cy="18.6" r="2.4"/><path d="M19.5 18.4h1"/></g>`,
  bart: (h) => `<path d="M12.8 20.6c.4 4.4 3.4 7.2 7.2 7.2s6.8-2.8 7.2-7.2c-1.4 1.6-3.2 2.4-4.6 2-.8-.3-1.6-.5-2.6-.5s-1.8.2-2.6.5c-1.4.4-3.2-.4-4.6-2z" fill="${h}"/><path d="M17.6 22.6q2.4 1.6 4.8 0" stroke="#7a3b22" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
  held: () => AV_MASK('#D63C3C'),
  astro: () => `<circle cx="20" cy="18.6" r="11.6" fill="rgba(170,215,255,.22)" stroke="#E8EEF5" stroke-width="2.2"/><path d="M27.5 9.8l2.6-3.4" stroke="#E8EEF5" stroke-width="1.2"/><circle cx="30.4" cy="6.1" r="1.2" fill="#E06B6B"/>`,
  pirat: () => `<path d="M11.4 15.6c.6-5.2 4-8.4 8.6-8.4s8 3.2 8.6 8.4c-2.6-1.4-5.4-2-8.6-2s-6 .6-8.6 2z" fill="#C0392B"/><circle cx="14.5" cy="11.5" r=".8" fill="#fff"/><circle cx="19" cy="9.8" r=".8" fill="#fff"/><circle cx="24" cy="11" r=".8" fill="#fff"/><path d="M12.4 15.8l15.4 4.8" stroke="#1e1e1e" stroke-width=".8"/><ellipse cx="22.9" cy="18.8" rx="2.1" ry="1.9" fill="#1e1e1e"/>`,
  zauber: () => `<path d="M8.5 13.8c4.5-1.4 18.5-1.4 23 0-1.6-.6-3.4-1.6-4.6-1.8L21.2 1.2l-5.6 10.8c-1.4.2-4.2 1-7.1 1.8z" fill="#5B4FC4"/><circle cx="18.2" cy="8.4" r=".8" fill="#F5C542"/><circle cx="22.4" cy="10.6" r=".6" fill="#F5C542"/><circle cx="20.6" cy="5.4" r=".5" fill="#F5C542"/>`,
  krone: () => `<path d="M12.6 10.8l1.4-5.4 3.1 3.3L20 3.6l2.9 5.1 3.1-3.3 1.4 5.4z" fill="#F5C542"/><circle cx="20" cy="7.8" r=".95" fill="#E06B6B"/><circle cx="15.6" cy="9.3" r=".6" fill="#4FA3E0"/><circle cx="24.4" cy="9.3" r=".6" fill="#4FA3E0"/>`,
  katze: () => `<path d="M11.2 11.6l1.2-6.6 4.6 4.4zM28.8 11.6l-1.2-6.6-4.6 4.4z" fill="#3a3a3a"/><path d="M12.5 9.9l.6-3.2 2.1 2.1zM27.5 9.9l-.6-3.2-2.1 2.1z" fill="#F29A9A"/><path d="M13.4 21.2l-3.2-.6M13.4 22.2l-3.2.4M26.6 21.2l3.2-.6M26.6 22.2l3.2.4" stroke="#555" stroke-width=".5"/><circle cx="20" cy="20.6" r=".7" fill="#E07A8A"/>`,
  einhorn: () => `<path d="M18.5 9.4L20 .9l1.5 8.5z" fill="#F5C542"/><path d="M18.9 7.6l2.3-.7M19.3 5.2l1.7-.5M19.7 3l1-.3" stroke="#D99A2B" stroke-width=".55"/><circle cx="14.6" cy="9.6" r="1.5" fill="#FF7AA8"/><circle cx="25.4" cy="9.6" r="1.5" fill="#B69CF2"/>`,
  cap: () => `<path d="M11.6 15.2c.4-5.2 4-8.2 8.4-8.2s8 3 8.4 8.2z" fill="#3E7CC9"/><path d="M19 14.4c4.2 0 8.4.4 12.2 1.6-.6.9-2.1 1.1-3.9 1-2.8-.4-5.5-.6-8.3-.6z" fill="#2F64A6"/><circle cx="20" cy="7.4" r=".9" fill="#2F64A6"/>`,
  kopfhoerer: () => `<path d="M10.4 19.5c0-6.4 4.2-10.6 9.6-10.6s9.6 4.2 9.6 10.6" fill="none" stroke="#333" stroke-width="1.7"/><rect x="8.6" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/><rect x="27.8" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/>`,
  schleife: () => `<path d="M24.6 9.6l3.8-2.2v4.4zM24.6 9.6l-3.8-2.2v4.4z" fill="#FF7AA8"/><circle cx="24.6" cy="9.6" r="1.1" fill="#E0568A"/>`
};
// Gruppen: pro Gruppe höchstens eins; Kostüme schliessen Kopfbedeckungen / Brillen / Kopfhörer aus, damit jede Kombination gut aussieht
const AV_COST = ['held', 'blitz', 'nacht', 'ninja', 'ritter', 'astro', 'pirat', 'zauber'];
const AV_HEAD = ['cap', 'krone', 'katze', 'einhorn', 'schleife', 'stirnband'];
const AV_EYES = ['brille', 'sonnenbrille'];
const AV_FACE = ['sommersprossen', 'bart', 'kopfhoerer'];
const AV_ORDER = ['sommersprossen', 'bart', 'brille', 'sonnenbrille', 'held', 'blitz', 'nacht', 'ninja', 'kopfhoerer', 'stirnband', 'schleife', 'cap', 'katze', 'einhorn', 'krone', 'pirat', 'zauber', 'ritter', 'astro'];
const AV_HAT_COST = ['ninja', 'ritter', 'astro', 'pirat', 'zauber'];
const AV_MASK_COST = ['held', 'blitz', 'nacht', 'ninja'];
const AV_BODY = { held: ['#C0392B', '<path d="M20 32.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#F5C542"/>'],
  blitz: ['#2F64A6', '<path d="M20.9 31.6l-2.7 3.7h1.9l-1 3.4 3.1-4.1h-1.9l1.2-3z" fill="#F5C542"/>'],
  nacht: ['#2A2340', '<path d="M21.4 32.3a2.7 2.7 0 1 0 .9 5 2.2 2.2 0 1 1-.9-5z" fill="#E8E3FF"/>'],
  ninja: ['#2B2F3A', '<path d="M14 33.2l12 4" stroke="#D63C3C" stroke-width="1.4"/>'], ritter: ['#9AA5B1', '<path d="M20 31.8v6.4M17 34.6h6" stroke="#D63C3C" stroke-width="1.3"/>'],
  astro: ['#E8EEF5', '<rect x="17.6" y="33" width="4.8" height="3" rx=".6" fill="#4FA3E0"/>'], zauber: ['#5B4FC4', '<circle cx="18" cy="34" r=".6" fill="#F5C542"/><circle cx="22.2" cy="36" r=".5" fill="#F5C542"/>'],
  pirat: ['#F4F4F4', '<path d="M12 33.6h16M11 36.2h18M10.4 38.8h19.2" stroke="#2F64A6" stroke-width="1.1"/>'] };
// gültige, widerspruchsfreie Extras in Zeichen-Reihenfolge
const avNorm = (age, list) => {
  let ex = (list || []).filter((a) => AV_ORDER.includes(a));
  const one = (grp) => { const hit = ex.filter((a) => grp.includes(a)); if (hit.length > 1) ex = ex.filter((a) => !grp.includes(a) || a === hit[hit.length - 1]); };
  one(AV_COST); one(AV_HEAD); one(AV_EYES);
  const c = ex.find((a) => AV_COST.includes(a));
  if (c && AV_HAT_COST.includes(c)) ex = ex.filter((a) => !AV_HEAD.includes(a));
  if (c && AV_MASK_COST.includes(c)) ex = ex.filter((a) => !AV_EYES.includes(a));
  if (c === 'ninja') ex = ex.filter((a) => a !== 'bart' && a !== 'sommersprossen');
  if (c === 'astro' || c === 'ritter') ex = ex.filter((a) => a !== 'kopfhoerer');
  if (age === 'k') ex = ex.filter((a) => a !== 'bart');
  return AV_ORDER.filter((a) => ex.includes(a));
};
const avatarGen = (code, bg) => {
  const [age0, st0, hc, sk, acc] = String(code).split('.');
  const age = ['k', 'e', 'o'].includes(age0) ? age0 : 'k';
  const st = st0 === 'glatze' && age === 'k' ? 'kurz' : st0;
  const [h1, h2] = AV_HC[hc] || AV_HC.blond; const skin = AV_SK[sk] || AV_SK.hell;
  const kid = age === 'k';
  const ex = avNorm(age, acc && acc !== '0' ? acc.split('+') : []);
  const cost = ex.find((a) => AV_COST.includes(a));
  let [bk, fr] = AV_ST[st] || [null, 'kurz'];
  if (cost === 'ninja' || cost === 'ritter') bk = null;
  const body = kid ? 'M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z' : 'M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z';
  let s = `<rect width="40" height="40" fill="${bg}"/>`;
  if (bk) s += AV_HB[bk](h2);
  s += cost && AV_BODY[cost] ? `<path d="${body}" fill="${AV_BODY[cost][0]}"/>${AV_BODY[cost][1]}` : `<path d="${body}" fill="#111" opacity=".28"/>`;
  s += `<rect x="17" y="23" width="6" height="7" fill="${skin}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${skin}"/>`;
  if (fr && cost !== 'ninja') s += AV_HF[fr](h1);
  if (age === 'o') s += '<path d="M14.6 15.4h1.8M23.6 15.4h1.8M15.4 21.6l-.8.6M24.6 21.6l.8.6" stroke="#9a6a4a" stroke-width=".5"/>';
  const dark = ['tief', 'espresso'].includes(sk);
  s += `<circle cx="17.1" cy="18.6" r="1.05" fill="${dark ? '#1a110b' : '#3b2a1e'}"/><circle cx="22.9" cy="18.6" r="1.05" fill="${dark ? '#1a110b' : '#3b2a1e'}"/>`;
  if (!ex.includes('bart')) s += `<path d="M17.6 22q2.4 1.9 4.8 0" stroke="${dark ? '#2a1610' : '#b0613a'}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  if (kid || ['long', 'ponylang', 'zoepfe', 'dutt', 'bob', 'locken', 'pferd'].includes(st)) s += `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity="${dark ? '.3' : '.55'}"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity="${dark ? '.3' : '.55'}"/>`;
  ex.forEach((a) => { if (AV_ACC[a]) s += AV_ACC[a](h2); });
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
};
// Termin-Zeit kurz: "14:30–15:20" bzw. schmal "14:30–15"
const evRange = (e, short) => {
  if (e.allDay) return short ? 'ganzt.' : 'ganztägig';
  const t = (x) => (short && !x.getMinutes() ? String(x.getHours()) : pad(x.getHours()) + ':' + pad(x.getMinutes()));
  return `${t(e.s)}–${t(e.e)}`;
};
// Bild einer Person: k.bild = 'av:<code>' (Baukasten), 'svg:<portrait>' oder 'mdi:<icon>' (aus den Einstellungen), sonst k.avatar aus der Kartenkonfig
const avatarHtml = (k, size) => {
  const b = k.bild || '';
  if (b.startsWith('img:')) return `<img src="${esc(b.slice(4))}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:none;display:inline-block">`;
  if (b.startsWith('av2:') && window.FPAV) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${window.FPAV.svg(b, k.farbe)}</span>`;
  if (b.startsWith('av:')) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarGen(b.slice(3), k.farbe)}</span>`;
  if (b.startsWith('mdi:')) return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;flex:none;color:#161616"><ha-icon icon="${esc(b)}" style="--mdc-icon-size:${Math.round(size * 0.6)}px"></ha-icon></span>`;
  if (b.startsWith('svg:')) return avatarBase({ ...k, avatar: b.slice(4) }, size);
  return avatarBase(k, size);
};
const daysLabel = (t) => {
  const s = [...(t || [])].sort((a, b) => a - b).join(',');
  if (s === '1,2,3,4,5,6,7') return 'Täglich';
  if (s === '1,2,3,4,5') return 'Werktags';
  if (s === '6,7') return 'Wochenende';
  return (t || []).length ? [...t].sort((a, b) => a - b).map((d) => WD[d - 1]).join(', ') : 'Nie';
};

class FpBase extends HTMLElement {
  setConfig(config) {
    this._cfg = this._normalize(config || {});
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._bind(); }
    this._teardown();
    this._data = {};
    this._render(true);
    this._ensure();
  }
  set hass(h) { this._hass = h; this._ensure(); }
  get hass() { return this._hass; }
  connectedCallback() { this._ensure(); }
  disconnectedCallback() { this._teardown(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', min_rows: 6 }; }
  _teardown() {
    (this._unsubs || []).forEach((p) => p.then((u) => u && u()).catch(() => {}));
    this._unsubs = null;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
  _ensure() {
    if (!this._hass || !this._cfg || !this.isConnected || this._unsubs) return;
    this._unsubs = this._lists().map(([key, ent]) => this._hass.connection.subscribeMessage(
      (m) => { this._data[key] = m.items || []; this._render(); },
      { type: 'todo/item/subscribe', entity_id: ent }
    ).catch((e) => { this._err = `${ent}: ${(e && e.message) || e}`; this._render(); }));
    if (this._started) this._started();
  }
  _kids() {
    const list = (this._cfg.kinder || []).map((k) => (typeof k === 'string' ? { name: k } : { ...k }));
    const names = new Set(list.map((k) => k.name));
    for (const p of this._data.plan || []) {
      for (const k of Object.keys(planZ(parseDesc(p.description)))) { if (k && !names.has(k)) { names.add(k); list.push({ name: k }); } }
    }
    const ps = this._settingsP();
    return list.map((k, i) => { const o = ps[k.name] || {}; return { ...k, ...(o.bild ? { bild: o.bild } : {}), alias: [...new Set([...(k.alias || []), ...(o.alias || [])])], farbe: o.farbe || k.farbe || PALETTE[i % PALETTE.length] }; });
  }
  _settingsItem() { return ((this._data && this._data.settings) || []).find((i) => i.summary === 'Personen') || null; }
  _settingsP() { const it = this._settingsItem(); const m = it ? parseDesc(it.description) : {}; return (m && m.p) || {}; }
  _call(domain, service, data, entity) {
    return this._hass.callService(domain, service, data, entity ? { entity_id: entity } : undefined);
  }
}

/* ============================ WOCHENPLANER ============================ */
class LoxWochenplanerCard extends FpBase {
  _normalize(c) {
    return { plan: 'todo.amtli_plan', heute: 'todo.amtli_heute', verlauf: 'todo.amtli_verlauf', einstellungen: 'todo.familienplaner_einstellungen', kalender: [], kinder: [], tage_zuverlaessigkeit: 30, titel: 'Familienplaner', ...c };
  }
  _lists() { return [['plan', this._cfg.plan], ['heute', this._cfg.heute], ['verlauf', this._cfg.verlauf], ['settings', this._cfg.einstellungen]]; }
  _bind() {
    this._week = 0; this._events = []; this._tick = 0;
    try { this._mode = localStorage.getItem('fp_mode') || 'alle'; } catch (e) { this._mode = 'alle'; }
    this.shadowRoot.addEventListener('click', (e) => this._onClick(e));
    // swipe left/right: next/previous week (phone: next/previous day)
    this.shadowRoot.addEventListener('touchstart', (e) => { const t = e.touches[0]; this._sw = t ? [t.clientX, t.clientY] : null; }, { passive: true });
    this.shadowRoot.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0]; if (!this._sw || !t || this._detail) return;
      const dx = t.clientX - this._sw[0], dy = t.clientY - this._sw[1]; this._sw = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) this._go(dx < 0 ? 1 : -1);
    }, { passive: true });
    this._onResize = () => { const ph = this._isPhone(); if (ph !== this._phoneOn) this._render(); };
    window.addEventListener('resize', this._onResize);
  }
  _isPhone() { const w = this.getBoundingClientRect().width || window.innerWidth; return w > 0 && w < 700; }
  // phone: one day at a time; tablet/desktop: one week at a time. Returns to today after the idle time.
  _go(step) {
    this._focus = null;
    if (this._phoneOn) {
      this._dayOff = step === 0 ? 0 : (this._dayOff || 0) + step;
      const t = startOfDay(fpDay()); const sel = addDays(t, this._dayOff);
      const wk = Math.round((addDays(sel, 1 - isoWd(sel)) - addDays(t, 1 - isoWd(t))) / (7 * 86400000));
      if (wk !== this._week) { this._week = wk; this._events = []; this._fetchEvents(); }
    } else {
      this._week = step === 0 ? 0 : this._week + step; this._dayOff = 0; this._events = []; this._fetchEvents();
    }
    clearTimeout(this._navT);
    if (this._week || this._dayOff) this._navT = setTimeout(() => { this._week = 0; this._dayOff = 0; this._focus = null; this._events = []; this._fetchEvents(); this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
    this._render();
  }
  _started() {
    this._lastDay = ymd(fpDay());
    this._fetchEvents();
    this._timer = setInterval(() => {
      this._tick++;
      const t = ymd(fpDay());
      if (t !== this._lastDay || this._tick % 20 === 0) { this._lastDay = t; this._fetchEvents(); }
      this._render();
    }, 30000);
  }
  _weekStart() { const t = startOfDay(fpDay()); return addDays(addDays(t, 1 - isoWd(t)), this._week * 7); }
  _calendars() {
    return (this._cfg.kalender || []).map((c) => (typeof c === 'string' ? { entity: c } : { ...c })).map((c, i) => {
      const st = this._hass && this._hass.states[c.entity];
      // Farbe des Kalenders = Farbe der Person, der er gehört
      const pk = c.person ? this._kids().find((x) => x.name === c.person) : null;
      return { ...c, farbe: (pk && pk.farbe) || c.farbe || CALCOL[i % CALCOL.length], name: c.name || (st ? st.attributes.friendly_name : c.entity) };
    });
  }
  async _fetchEvents() {
    const cals = this._calendars();
    if (!cals.length || !this._hass) { this._events = []; return; }
    const ws = this._weekStart(); const we = addDays(ws, 7); const res = [];
    await Promise.all(cals.map(async (c) => {
      try {
        const ev = await this._hass.callApi('GET', `calendars/${c.entity}?start=${encodeURIComponent(ws.toISOString())}&end=${encodeURIComponent(we.toISOString())}`);
        for (const e of ev || []) {
          const allDay = !!(e.start && e.start.date && !e.start.dateTime);
          const s = allDay ? new Date(e.start.date + 'T00:00:00') : new Date(e.start.dateTime || e.start);
          const en = allDay ? new Date(e.end.date + 'T00:00:00') : new Date((e.end && (e.end.dateTime || e.end)) || s);
          res.push({ title: e.summary || '', loc: e.location || '', s, e: en > s ? en : new Date(s.getTime() + 60000), allDay, c });
        }
      } catch (err) { /* Kalender nicht erreichbar */ }
    }));
    this._events = res; this._render();
  }
  _syncCal() {
    const ents = this._calendars().map((c) => c.entity);
    if (!ents.length || this._syncing || !this._hass) return;
    this._syncing = true; this._render();
    this._call('homeassistant', 'update_entity', { entity_id: ents }).catch(() => {})
      .finally(() => setTimeout(() => { this._syncing = false; this._fetchEvents(); }, 2500));
  }
  _history() {
    const h = {};
    for (const it of this._data.verlauf || []) {
      const m = parseDesc(it.description);
      const day = h[it.summary] || (h[it.summary] = { s: {}, x: [] });
      for (const [k, done, tot] of m.s || []) { const c = day.s[k] || [0, 0]; day.s[k] = [c[0] + done, c[1] + tot]; }
      for (const x of m.x || []) day.x.push(x);
    }
    return h;
  }
  _stats(kid, h, today, todayDone, todayTot) {
    // [erledigt, total] der letzten n Tage + heute bereits erledigte
    const sum = (n) => { let d = todayDone, t = todayDone; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s) { d += s[0]; t += s[1]; } } return [d, t]; };
    const w = sum(7), m = sum(30), all = sum(this._cfg.tage_zuverlaessigkeit);
    const done = all[0], tot = all[1];
    // fair: every day weighs the same – [sum of daily rates, days]; today only counts once it is complete
    const fsum = (n) => { let f = todayTot && todayDone === todayTot ? 1 : 0, c = f; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s && s[1]) { f += s[0] / s[1]; c++; } } return [Math.round(f * 1000) / 1000, c]; };
    const fw = fsum(7), fm = fsum(30), fall = fsum(this._cfg.tage_zuverlaessigkeit);
    let streak = todayTot && todayDone === todayTot ? 1 : 0;
    for (let i = 1; i <= 120; i++) {
      const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid];
      if (!s || !s[1]) continue;
      if (s[0] === s[1]) streak++; else break;
    }
    const pct = this._cfg.fair ? (fall[1] ? Math.round((fall[0] / fall[1]) * 100) : 100) : (tot ? Math.round((done / tot) * 100) : 100);
    return { pct, start: !tot, streak, w, m, fw, fm };
  }
  // Auszeichnungen kommen vom Server (vergeben jeden Montag / am Monatsersten / beim Erreichen)
  // level badge on the avatar; after a level up it glows until it was tapped (each tap plays the tier's effect)
  _lvState(name) {
    const s = this.fpStore && this.fpStore.snap; if (!s) return null;
    const p = (s.persons || []).find((x) => x.name === name); if (!p) return null;
    const pt = (s.points || {})[p.id]; if (!pt || !pt.level) return null;
    const up = pt.up && pt.up.level === pt.level && (Date.now() - Date.parse(pt.up.ts || '')) < 14 * 864e5 ? pt.up : null;
    const key = `fp_lv_${s.entry_id}_${p.id}_${pt.level}_${up ? up.ts : ''}`;
    let taps = 0; try { taps = Number(localStorage.getItem(key)) || 0; } catch (e) { taps = (this._lvMem || {})[key] || 0; }
    return { p, pt, up, key, taps };
  }
  _lvBadge(name) {
    const v = this._lvState(name); if (!v) return '';
    const g = v.up && v.taps < 20 ? (v.taps < 5 ? 'glow' : 'fade') : '';
    return `<button class="lvb t-${v.pt.tier} ${g}" data-lvtap="${esc(name)}" style="--lc:${v.pt.tier_color};--g:${g === 'fade' ? (20 - v.taps) / 15 : 0}" title="Level ${v.pt.level} · ${esc(v.pt.name)}">${v.pt.level}</button>`;
  }
  _lvTap(name, el) {
    const v = this._lvState(name); if (!v) return;
    const r = el.getBoundingClientRect();
    if (window.FPCONFETTI && window.FPCONFETTI.burst) window.FPCONFETTI.burst(r.left + r.width / 2, r.top + r.height / 2, v.pt.tier, v.pt.tier_color, v.up && v.taps < 20 ? 1 : 0.5);
    if (v.up && v.taps < 20) { try { localStorage.setItem(v.key, String(v.taps + 1)); } catch (e) { this._lvMem = { ...(this._lvMem || {}), [v.key]: v.taps + 1 }; } this._render(); }
  }
  _srvAwards(kids) {
    const s = this.fpStore && this.fpStore.snap; const A = {}; const F = {}; kids.forEach((k) => { A[k.name] = []; });
    if (!s) return { A, F };
    const byName = Object.fromEntries((s.persons || []).map((p) => [p.name, p.id]));
    const et = (s.settings || {}).early_time || '12:00';
    kids.forEach((k) => {
      const r = (s.awards || {})[byName[k.name]] || { list: [] }; F[k.name] = r.frame || '';
      A[k.name] = (r.list || []).map((a) => { const tx = AWT[a.id] || [a.id, '']; const f = (x) => x.replace(/\{n\}/g, a.value == null ? '' : a.value).replace('{t}', et);
        return { id: a.id, icon: a.icon, c: a.color, t: f(tx[0]), why: f(tx[1]) }; });
    });
    return { A, F };
  }
  _detailHtml(kids, pre, awards, frames) {
    const k = kids.find((x) => x.name === this._detail); if (!k) return '';
    const s = pre[k.name]; const lv = level(s.pct); const aw = awards[k.name] || [];
    const snap = (this.fpStore && this.fpStore.snap) || {}; const pts = snap.award_points || {}; const et = (snap.settings || {}).early_time || '12:00';
    const on = ((snap.award_settings || {}).items) || {};
    const q = (x) => (x[1] ? `${x[0]} / ${x[1]} <small>(${Math.round((x[0] / x[1]) * 100)} %)</small>` : '<small>noch keine</small>');
    const holders = (id) => kids.filter((x) => (awards[x.name] || []).some((a) => a.id === id)).map((x) => x.name).join(', ') || 'noch niemand';
    return `<div class="ovl" data-close><div class="pnl" data-keep>
      <div class="ph"><div class="ring bigr${frames[k.name] ? ' fr-' + frames[k.name] : ''}"><span class="ava">${avatarHtml(k, 64)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) : ''}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}<span class="rib" style="--rc:${lv.c}">${s.pct}%</span></div>
        <div class="phn"><div class="pn2">${esc(k.name)}</div><div class="lv" style="color:${lv.c}">${lv.t} · Zuverlässigkeit ${s.pct} %</div></div>
        <button class="nb" data-x><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="kp"><div><span>Letzte 7 Tage</span><b>${q(s.w)}</b></div><div><span>Letzte 30 Tage</span><b>${q(s.m)}</b></div><div><span>Serie</span><b>${s.streak} ${s.streak === 1 ? 'Tag' : 'Tage'}</b></div></div>
      <div class="sec2">Auszeichnungen</div>
      ${aw.length ? aw.map((a) => `<div class="aw"><span class="md lg" style="--mc:${a.c}"><ha-icon icon="${a.icon}"></ha-icon></span><div><b>${esc(a.t)}</b><div>${esc(a.why)}</div></div></div>`).join('') : '<div class="aw0">Noch keine Auszeichnung – erledige deine Ämtli und hol dir die Krone!</div>'}
      <div class="sec2">So holst du dir Auszeichnungen</div>
      ${AWR.filter(([id]) => !on[id] || on[id].on !== false).map(([id, ic, c, t, d]) => `<div class="rl2"><span class="md" style="--mc:${c}"><ha-icon icon="${ic}"></ha-icon></span><b>${t}${pts[id] ? ` <small class="pp">+${Number(pts[id])}</small>` : ''}</b><span>${d.replace('{t}', esc(et))}</span><em>aktuell: ${esc(holders(id))}</em></div>`).join('')}
    </div></div>`;
  }
  _planFor(kid, date) {
    if (((this._cfg.abwesend || {})[kid] || []).includes(ymd(date))) return [];
    const wd = isoWd(date);
    return (this._data.plan || []).map((p) => ({ t: p.summary, m: parseDesc(p.description) }))
      .filter((p) => (planZ(p.m)[kid] || []).includes(wd) && planActive(p.m, kid, wd, date)).map((p) => { const f = (p.m.f || {})[`${kid}|${wd}`] || 1; return f > 1 ? `${p.t} (bis ${WD[(wd - 1 + f - 1) % 7]})` : p.t; }).sort((a, b) => a.localeCompare(b, 'de'));
  }
  _onClick(e) {
    if (e.target.closest('[data-x]')) { this._detail = null; this._render(); return; }
    if (e.target.closest('[data-keep]')) return;
    if (e.target.closest('[data-close]')) { this._detail = null; this._render(); return; }
    const tdb = e.target.closest('[data-todoid]');
    if (tdb && this.fpStore) {
      const s = this.fpStore.snap || {}; const t = (s.todos || []).find((x) => x.id === tdb.dataset.todoid); if (!t) return;
      const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
      if (!t.done && confirm && this._tdArm !== t.id) { this._tdArm = t.id; clearTimeout(this._tdT); this._tdT = setTimeout(() => { this._tdArm = null; this._render(); }, 4000); this._render(); return; }
      this._tdArm = null; if (!t.done) this._pop = { uid: t.id, t: Date.now() };
      this.fpStore.ws('family_planer/todo/set', { todo_id: t.id, done: !t.done }).catch(() => this._render()); return;
    }
    const lt = e.target.closest('[data-lvtap]'); if (lt) { this._lvTap(lt.dataset.lvtap, lt); return; }
    const pp = e.target.closest('[data-person]');
    if (pp) { this._detail = pp.dataset.person; clearTimeout(this._dT); this._dT = setTimeout(() => { this._detail = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 30) * 1000); this._render(); return; }
    const b = e.target.closest('.btn');
    if (b && this._hass) {
      const done = b.classList.contains('done');
      b.classList.toggle('done');
      // little check animation only for the chore that was just ticked off
      if (!done) { this._pop = { uid: b.dataset.uid, t: Date.now() }; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      this._call('todo', 'update_item', { item: b.dataset.uid, status: done ? 'needs_action' : 'completed' }, this._cfg.heute).catch(() => this._render());
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { fpNavigate(go.dataset.go); return; }
    const md = e.target.closest('[data-mode]');
    if (md) { this._mode = md.dataset.mode; try { localStorage.setItem('fp_mode', this._mode); } catch (er) { /* ignorieren */ } this._render(); return; }
    if (e.target.closest('[data-sync]')) { this._syncCal(); return; }
    if (e.target.closest('[data-todos]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true })); return; }
    if (e.target.closest('[data-todoadd]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true, detail: { add: true } })); return; }
    const fc = e.target.closest('[data-focus]');
    if (fc) {
      const v = fc.dataset.focus; this._focus = v === ymd(fpDay()) ? null : v;
      clearTimeout(this._fT); if (this._focus) this._fT = setTimeout(() => { this._focus = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
      this._render(); return;
    }
    const n = e.target.closest('[data-nav]');
    if (n) this._go(Number(n.dataset.nav));
  }
  _render() {
    if (!this.shadowRoot || !this._cfg) return;
    const now = new Date(); const today = startOfDay(fpDay()); const tStr = ymd(today);
    const phone = this._isPhone(); this._phoneOn = phone;
    const ws = this._weekStart(); const sel = addDays(today, phone ? (this._dayOff || 0) : 0);
    const days = phone ? [sel] : [...Array(7)].map((_, i) => addDays(ws, i));
    const kids = this._kids(); const h = this._history(); const cals = this._calendars();
    // Termine immer mit der aktuellen Farbe der Kalender-Besitzerin/des Besitzers anzeigen
    this._events.forEach((e) => { const cc = cals.find((x) => x.entity === e.c.entity); if (cc) e.c = cc; });
    // Termin-Zuordnung: Name im Titel (z. B. "Lea Turnen") -> bei dieser Person; sonst beim Kalender-Besitzer
    const nameRe = (n) => new RegExp('(^|[^\\p{L}])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?(?![\\p{L}])', 'iu');
    const kRes = kids.flatMap((x) => [x.name, ...(x.alias || [])].map((a) => [x.name, nameRe(a)]));
    const evWho = new Map(this._events.map((e) => {
      if (e.c.schule) return [e, e.c.person ? [e.c.person] : []];
      const hit = this._cfg.termine_nach_namen === false ? [] : [...new Set(kRes.filter(([, re]) => re.test(e.title)).map(([n]) => n))];
      const own = e.c.person ? [e.c.person] : [];
      return [e, hit.length ? (this._cfg.auch_beim_besitzer ? [...new Set([...hit, ...own])] : hit) : own];
    }));
    const alle = (this._data.heute || []).map((i) => ({ ...i, m: parseDesc(i.description) }));
    const heute = alle.filter((i) => (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= tStr);
    const focus = phone ? ymd(sel) : (this._focus && days.some((d) => ymd(d) === this._focus)) ? this._focus : (days.some((d) => ymd(d) === tStr) ? tStr : null);
    // Spaltenbreiten: xl = heute/angetippt, m = morgen (und heute, wenn ein anderer Tag angetippt ist), s = alle anderen Tage.
    // In den Ansichten Ämtli/Termine bleiben die nächsten 2 Tage und das Wochenende mittel.
    const T = {}; const curWeek = days.some((d) => ymd(d) === tStr); const allMode = (this._mode || 'alle') === 'alle';
    days.forEach((d) => {
      const s = ymd(d); const diff = Math.round((startOfDay(d) - today) / 86400000); const we = isoWd(d) >= 6;
      T[s] = s === focus ? 'xl' : !curWeek ? 'm' : allMode ? ((s === tStr || diff === 1) ? 'm' : 's')
        : (s === tStr || we || (diff > 0 && diff <= 2)) ? 'm' : 's';
    });
    const cols = phone ? 'minmax(0,1fr)' : days.map((d) => (T[ymd(d)] === 's' ? (allMode && curWeek ? 'minmax(0,0.42fr)' : startOfDay(d) < today ? 'minmax(0,0.4fr)' : 'minmax(0,0.6fr)')
      : ({ xl: allMode && curWeek ? 'minmax(0,4.6fr)' : 'minmax(0,3.6fr)', m: allMode && curWeek ? 'minmax(0,1.5fr)' : 'minmax(0,1.15fr)' })[T[ymd(d)]])).join(' ');
    const we = addDays(ws, 6);

    const legCals = cals.filter((c) => !c.schule);
    const head = `<div class="corner">${legCals.length ? `<div class="leg">${legCals.map((c) => `<span class="lgi"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')}</div>` : ''}<span>Tag antippen für Details</span></div>` + days.map((d) => {
      const t = ymd(d) === tStr;
      return `<div class="hd${t ? ' t' : ''}${ymd(d) === focus ? ' fx' : ''} ts-${T[ymd(d)]}" data-focus="${ymd(d)}">${WD[isoWd(d) - 1]}${t ? ' · Heute' : ''}<b>${d.getDate()}.</b></div>`;
    }).join('');

    const calLabel = legCals.length
      ? legCals.map((c) => `<span class="cl"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')
      : '<span class="cl">Outlook folgt</span>';
    const termine = `<div class="lab syn${this._syncing ? ' spin' : ''}" data-sync title="Kalender jetzt synchronisieren"><div class="ic"><ha-icon icon="${this._syncing ? 'mdi:sync' : 'mdi:calendar-sync-outline'}"></ha-icon></div><div class="lt"><div class="nm">Termine</div><div class="cls">${calLabel}</div></div></div>` +
      days.map((d) => {
        const ds = startOfDay(d), de = addDays(ds, 1);
        const evs = this._events.filter((e) => !(evWho.get(e) || []).length && e.s < de && e.e > ds).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const t = ymd(d) === tStr;
        const shown = evs.slice(0, ymd(d) === focus ? 6 : 2);
        return `<div class="c ev-c${t ? ' t' : ''}">${withNow(shown, t && ymd(d) === focus, (e) => { const st = t ? evState(e) : { c: '', b: '' }; return `<div class="ev${ymd(d) === focus ? ' w' : ''}${st.c}" style="border-color:${e.c.farbe}">${evTime(e, ymd(d) === focus)}${st.b}${ymd(d) === focus ? '<br>' : ''}${esc(e.title)}</div>`; })}${evs.length > shown.length ? `<div class="more">+${evs.length - shown.length} weitere</div>` : ''}</div>`;
      }).join('');

    const pre = {};
    kids.forEach((k) => { const mi = heute.filter((i) => i.m.k === k.name); pre[k.name] = this._stats(k.name, h, today, mi.filter((i) => i.status === 'completed').length, mi.length); });
    const { A: awards, F: frames } = this._srvAwards(kids);
    // timetable view: only persons with a timetable
    const rowKids = (this._mode || 'alle') === 'schule' ? kids.filter((x) => (this._cfg.schule || {})[x.name]) : kids;
    // to-dos and special chores (date-based plan) in the planner, clearly marked; own view "To-dos & special"
    const snapX = (this.fpStore && this.fpStore.snap) || {}; const modeX = this._mode || 'alle';
    const specIds = new Set((snapX.chores || []).filter((c) => c.schedule).map((c) => c.id));
    const pidOf = Object.fromEntries((snapX.persons || []).map((p) => [p.name, p.id]));
    const showTodos = modeX === 'alle' || modeX === 'extra';
    const rows = rowKids.map((k) => {
      const tds = showTodos ? (snapX.todos || []).filter((t) => t.person_id === pidOf[k.name] && (!t.done || (t.done_at || '').slice(0, 10) === tStr)) : [];
      const tdBtns = tds.map((t) => `<button class="btn tdo${t.done ? ' done' : ''}${this._tdArm === t.id ? ' arm' : ''}" data-todoid="${esc(t.id)}"><span class="cb"></span><span class="bt"><em class="tag">☑ To-do</em>${esc(this._tdArm === t.id ? 'Nochmals tippen zum Erledigen' : t.title)}</span></button>`).join('');
      const mine = heute.filter((i) => i.m.k === k.name && (modeX !== 'extra' || specIds.has(i.m.c))).sort((a, b) => ((a.status === 'completed') - (b.status === 'completed')) || a.summary.localeCompare(b.summary, 'de'));
      const tDone = mine.filter((i) => i.status === 'completed').length;
      const st = pre[k.name]; const aw = awards[k.name] || [];
      const lv = level(st.pct); const C = 2 * Math.PI * 24;
      const AVS = phone ? 56 : 72;
      const label = `<div class="lab" data-person="${esc(k.name)}" style="box-shadow:inset 3px 0 0 ${k.farbe}">
          <div class="ring${frames[k.name] ? ' fr-' + frames[k.name] : ''}" style="width:${AVS}px;height:${AVS}px"><span class="ava">${avatarHtml(k, AVS)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) : ''}${this._lvBadge(k.name)}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>
          <div class="lt"><div class="nm">${esc(k.name)}</div><div class="lv2"><span class="rib2" style="--rc:${lv.c}">${st.pct}%</span>${aw.slice(0, phone ? 3 : 6).map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}${aw.length > (phone ? 3 : 6) ? `<span class="mdm">+${aw.length - (phone ? 3 : 6)}</span>` : ''}</div>
          </div>
          </div>`;
      const injectEv = (d, html) => {
        const dS = startOfDay(d), dE = addDays(dS, 1); const tr = T[ymd(d)]; const wide = tr === 'xl'; const mx = wide ? 5 : 3;
        const pevAll = this._events.filter((e) => (evWho.get(e) || []).includes(k.name) && e.s < dE && e.e > dS).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        // school: lessons from the school calendar, else fixed times; condensed to leave / start–end / home
        const sc = (this._cfg.schule || {})[k.name]; const awayD = ((this._cfg.abwesend || {})[k.name] || []).includes(ymd(d));
        const hm = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
        const at = (t) => { const x = new Date(dS); const [hh, mm] = t.split(':').map(Number); x.setHours(hh, mm, 0, 0); return x; };
        const schoolC = { farbe: k.farbe, name: 'Schule', schule: true };
        let lessons = awayD ? [] : pevAll.filter((e) => e.c.schule && !e.allDay);
        if (!awayD && !lessons.length && sc && sc.zeiten && sc.zeiten[isoWd(d)]) {
          const zz = sc.zeiten[isoWd(d)]; const spans = typeof zz[0] === 'string' ? [zz] : zz;
          lessons = spans.map((z) => ({ title: 'Schule', s: at(z[0]), e: at(z[1]), allDay: false, c: schoolC }));
        }
        // blocks: a long break (time to go home and back) splits the day, e.g. morning + afternoon with lunch at home
        const wg = (sc && sc.weg) || 0; const gapMin = Number(this._cfg.schulpause) > 0 ? Number(this._cfg.schulpause) : Math.max(45, 2 * wg + 15); const blocks = [];
        [...lessons].sort((a, b) => a.s - b.s).forEach((e) => {
          const lb = blocks[blocks.length - 1];
          if (lb && (e.s - lb.e) / 60000 < gapMin) { if (e.e > lb.e) lb.e = e.e; } else blocks.push({ s: e.s, e: e.e });
        });
        // a school block shows up only from X min before leaving until X min after being home (setting, 0 = always)
        const win = Number(this._cfg.schulfenster) || 0;
        const blockEvs = blocks.filter((bk) => !win || (now >= new Date(bk.s - (wg + win) * 60000) && now <= new Date(+bk.e + (wg + win) * 60000)))
          .map((bk) => ({ title: wg ? `🎒 los ${hm(new Date(bk.s - wg * 60000))} · zuhause ${hm(new Date(+bk.e + wg * 60000))}` : '🎒 Schule',
          s: new Date(bk.s), e: new Date(bk.e), allDay: false, c: schoolC }));
        const rest = pevAll.filter((e) => !e.c.schule);
        const mode0 = this._mode || 'alle';
        // blocks only in "all"; the calendar view shows appointments without school; the timetable shows every lesson
        const detail = lessons.map((e) => ({ ...e, title: e.loc ? `${e.title} · ${e.loc}` : e.title }));
        const pev = mode0 === 'schule' ? detail : mode0 === 'termine' ? rest : [...blockEvs, ...rest].sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const mode = mode0 === 'schule' ? 'termine' : mode0;
        if (mode === 'aemtli' || mode === 'extra') return html;
        const open = (html.match(/^<div[^>]*>/) || [''])[0];
        if (!pev.length) return mode === 'termine' ? open + '<div class="none">–</div></div>' : html;
        if (tr === 's') { const evn = `<div class="evn">${pev.slice(0, 4).map((e) => `<i style="background:${e.c.farbe}"></i>`).join('')}<b>${pev.length}</b></div>`; return mode === 'termine' ? open + evn + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evn); }
        const lim = mode === 'termine' ? (wide ? 12 : 6) : mx;
        const evh = `<div class="pev ${wide ? 'xl' : 'mid'}">${withNow(pev.slice(0, lim), wide && ymd(d) === ymd(new Date()), (e) => { const st = ymd(d) === ymd(new Date()) ? evState(e) : { c: '', b: '' }; return `<div class="ev one${st.c}" style="border-color:${e.c.farbe}"><span class="et">${esc(e.title)}</span><span class="tm">${evRange(e, !wide)}</span>${st.b}<span class="src" style="background:${e.c.farbe}" title="Kalender ${esc(e.c.name)}">${wide ? esc(e.c.name) : esc((e.c.name || '?').charAt(0).toUpperCase())}</span></div>`; })}${pev.length > lim ? `<div class="more">+${pev.length - lim} weitere</div>` : ''}</div>`;
        return mode === 'termine' ? open + evh + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evh);
      };
      const cells = days.map((d) => injectEv(d, ((d) => {
        const ds = ymd(d);
        if (((this._cfg.abwesend || {})[k.name] || []).includes(ds) && !(ds === tStr && mine.length)) {
          return `<div class="c ${ds < tStr ? 'p' : ds === tStr ? 't' : 'f'} vac${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="vc"><ha-icon icon="mdi:palm-tree"></ha-icon>${T[ds] === 's' ? '' : '<span>Ferien</span>'}</div></div>`;
        }
        if (ds === tStr && ds !== focus) {
          return mine.length ? `<div class="c t" data-focus="${ds}"><div class="fc"><b>${tDone}/${mine.length}</b></div><div class="bar"><i style="width:${Math.round((tDone / mine.length) * 100)}%;background:${G}"></i></div>${tds.filter((t) => !t.done).length ? `<div class="tdn2">☑ ${tds.filter((t) => !t.done).length}</div>` : ''}</div>` : `<div class="c t" data-focus="${ds}">${tds.filter((t) => !t.done).length ? `<div class="tdn2">☑ ${tds.filter((t) => !t.done).length}</div>` : ''}</div>`;
        }
        if (ds === tStr) {
          if (!mine.length && !tds.length) return '<div class="c t"></div>';
          if (!mine.length) return `<div class="c t"><div class="bg">${tdBtns}</div></div>`;
          const all = tDone === mine.length;
          return `<div class="c t"><div class="prog"><span>${tDone} von ${mine.length} erledigt</span>${all ? '<span class="gr">Super!</span>' : ''}</div><div class="bg">` +
            mine.map((i) => `<button class="btn${specIds.has(i.m.c) ? ' spc' : ''}${i.status === 'completed' ? ' done' : ''}${this._pop && this._pop.uid === i.uid && Date.now() - this._pop.t < 600 ? ' pop' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span><span class="bt">${specIds.has(i.m.c) ? '<em class="tag">⭐ Spezial</em>' : ''}${esc(i.summary)}${dueTag(i.m, tStr)}</span></button>`).join('') + tdBtns + `</div></div>`;
        }
        if (ds < tStr) {
          const s = h[ds] && h[ds].s[k.name];
          if (!s || !s[1]) return `<div class="c p${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="none">–</div></div>`;
          const pct = Math.round((s[0] / s[1]) * 100); const col = pct === 100 ? G : pct >= 50 ? '#E0A84F' : '#E06B6B';
          if (T[ds] === 's') return `<div class="c p sm" data-focus="${ds}"><div class="pst" style="--pc:${col}">${s[0]}/${s[1]}</div></div>`;
          const miss = h[ds].x.filter((x) => x[0] === k.name).map((x) => x[1]);
          return `<div class="c p${ds === focus ? ' fx' : ''}" data-focus="${ds}"><div class="big">${s[0]}<small> / ${s[1]}</small></div><div class="bar"><i style="width:${pct}%;background:${col}"></i></div>` +
            (pct === 100 ? `<div class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${ds === focus ? 'Alles erledigt' : ''}</div>` : (ds === focus ? miss.map((m) => `<div class="miss">✕ ${esc(m)}</div>`).join('') : `<div class="miss">✕ ${miss.length}</div>`)) + `</div>`;
        }
        if (modeX === 'extra' && ds !== tStr) {
          const sp = alle.filter((i) => i.m.k === k.name && specIds.has(i.m.c) && i.status !== 'completed' && (i.m.d || '') <= ds && (i.m.e || i.m.d || '') >= ds);
          return `<div class="c ${ds < tStr ? 'p' : 'f'}${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}">${sp.map((i) => `<div class="pl spl">⭐ ${esc(i.summary)}</div>`).join('') || '<div class="none">–</div>'}</div>`;
        }
        const pl = this._planFor(k.name, d);
        const opl = alle.filter((i) => i.m.k === k.name && i.status !== 'completed' && (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= ds);
        if (T[ds] !== 's') {
          const lim = ds === focus ? 99 : 4;
          const op = opl.map((i) => `<div class="pl op">⏳ ${esc(i.summary)}</div>`).join('');
          return `<div class="c f${ds === focus ? ' fx' : ''}" data-focus="${ds}">${op}${pl.length ? pl.slice(0, lim).map((p) => `<div class="pl">${esc(p)}</div>`).join('') + (pl.length > lim ? `<div class="more">+${pl.length - lim} weitere</div>` : '') : ''}</div>`;
        }
        return `<div class="c f" data-focus="${ds}">${pl.length ? `<div class="fc"><b>${pl.length}</b>Ämtli</div>` : ''}${opl.length ? `<div class="opn">⏳ ${opl.length} offen</div>` : ''}</div>`;
      })(d))).join('');
      return label + cells;
    }).join('');

    const empty = !kids.length ? `<div class="emptyk">Noch keine Ämtli geplant – im Tab „Ämtliplan“ anlegen.</div>` : '';

    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:14px 16px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
      .top{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
      .clock{font-size:38px;font-weight:200;color:${G};line-height:1;font-variant-numeric:tabular-nums}
      .date{font-size:24px;font-weight:300}.date b{font-weight:600}
      .sub{font-size:12px;color:var(--fp-text3,#7a7a7a);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px}
      .nav{margin-left:auto;display:flex;align-items:center;gap:8px}.tdg{display:flex;gap:6px}
      .top{flex-wrap:nowrap}.card.phone .top{flex-wrap:wrap}
      .nb{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);color:var(--fp-text,#ddd);border-radius:10px;height:42px;min-width:42px;padding:0 14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;font-size:14px;-webkit-tap-highlight-color:transparent}
      .nb ha-icon{--mdc-icon-size:22px}.nb.td{gap:6px}.tdn{background:${G};color:var(--fp-on-accent,#141414);border-radius:10px;padding:0 7px;font-size:12px;line-height:20px}.nb.g{color:${G};border-color:color-mix(in srgb,var(--fp-accent) 50%,transparent)}
      .wk{font-size:12px;color:var(--fp-text3,#8a8a8a);padding:0 8px;text-align:center;min-width:150px}.wk b{display:block;color:var(--fp-text,#ececec);font-size:15px;font-weight:600}
      .grid{display:grid;grid-template-columns:${phone ? '104px' : '200px'} ${cols};gap:5px;align-items:stretch}
      .card.phone .lab{flex-direction:column;align-items:flex-start;gap:6px;padding:8px 6px}.card.phone .lt .nm{font-size:13px}.card.phone .corner{visibility:hidden}
      .card.phone .bg{grid-template-columns:1fr}.card.phone .pev .src{display:none}.card.phone .btn{min-height:50px;font-size:15px}.card.phone .btn .cb{width:26px;height:26px}.card.phone .btn.done .cb::after{left:8px;top:3px;width:6px;height:12px}.card.phone .nb{min-width:46px;height:46px}.card.phone .top{gap:8px}.card.phone .seg button{padding:0 9px}
      .dnav{display:flex;align-items:center;gap:6px}.dd{font-size:14px;text-align:center;min-width:120px}.dd b{display:block;font-size:16px}
      .corner{font-size:10px;color:var(--fp-text3,#555);display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:6px;padding:0 4px 6px}
      .corner .leg{background:none;padding:0;margin:0;gap:4px 10px}.corner .lgi{font-size:12px}
      .pev.mid .src{display:none}
      .hd{padding:4px 10px 6px;font-size:11px;color:var(--fp-text3,#8a8a8a);text-transform:uppercase;letter-spacing:1px}
      .hd{cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.hd.fx{background:var(--fp-bg3,#262626)}
      .hd b{display:block;font-size:18px;color:var(--fp-text,#e5e5e5);font-weight:300;letter-spacing:0;text-transform:none;margin-top:2px}
      .hd.t,.hd.t b{color:${G}}.hd.t b{font-weight:500}
      .c{background:var(--fp-bg3,#262626);border-radius:10px;padding:8px;min-height:56px;min-width:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .c.fx{box-shadow:inset 0 0 0 1px #4a4a4a;background:var(--fp-bg3,#2a2a2a)}
      .c.t{background:var(--fp-bg3,#2a2a2a);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .ev-c{min-height:38px}
      .syn{cursor:pointer;-webkit-tap-highlight-color:transparent}.syn:active{background:var(--fp-bg3,#2a2a2a)}
      .spin .ic ha-icon,.spin2 ha-icon{animation:fpspin 1s linear infinite}
      .nowl{position:relative;height:0;border-top:2px solid #e06b6b;margin:5px 0 5px 4px}.nowl::before{content:"";position:absolute;left:-5px;top:-5px;width:8px;height:8px;border-radius:50%;background:#e06b6b}.nowl span{position:absolute;right:0;top:-8px;font-size:9px;font-weight:700;color:#e06b6b;background:var(--fp-bg2,var(--fp-bg1,#1e1e1e));padding:0 4px;border-radius:4px;line-height:14px}
      .ev.past{opacity:.45}.ev.now{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent,var(--fp-accent)) 60%,transparent)}.ev.soon{background:color-mix(in srgb,var(--fp-accent,var(--fp-accent)) 14%,var(--fp-bg4,#303030))}.ev em.soon{font-style:normal;font-size:10px;font-weight:700;color:var(--fp-accent,var(--fp-accent));margin:0 4px;white-space:nowrap}
      .pev{margin-bottom:6px;display:flex;flex-direction:column;gap:3px}.pev .ev{margin-top:0}
      .pev.sm .ev{font-size:10px;padding:2px 4px 2px 5px}
      .ev .du{color:var(--fp-text3,#8a8a8a);font-weight:400;margin-right:5px}
      .src{display:inline-block;font-size:9px;font-weight:700;color:var(--fp-on-accent,#141414);border-radius:6px;padding:0 5px;margin-right:5px;line-height:15px;vertical-align:1px;white-space:nowrap}
      .leg{display:flex;align-items:center;gap:12px;margin-left:auto;background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 14px;flex-wrap:wrap}
      .leg + .nav{margin-left:0}
      .lgt{font-size:10px;color:var(--fp-text3,#666);text-transform:uppercase;letter-spacing:1px}
      .tnav{display:flex;gap:6px;margin-left:auto}.tnav + .seg{margin-left:0}
      .seg{display:flex;background:var(--fp-bg2,#232323);border-radius:10px;padding:3px;gap:2px;margin-left:auto}.seg + .leg{margin-left:0}
      .seg button{background:transparent;border:none;color:var(--fp-text2,#999);font:inherit;font-size:13px;padding:0 13px;height:36px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}.seg button.on{background:var(--fp-bg4,#3a3a3a);color:var(--fp-text,#fff);font-weight:600}
      .ev.one{display:flex;align-items:center;gap:6px;white-space:nowrap}.ev.one .et{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:block}
      .ev.one .tm{flex:none;color:var(--fp-text2,#9a9a9a);font-size:.9em;font-variant-numeric:tabular-nums}.ev.one .src{flex:none;margin:0}
      .pev.mid .ev.one{white-space:nowrap;gap:4px}.pev.mid .ev.one .tm{font-size:10px}
      .lgi{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#ccc)}.lgi i{width:10px;height:10px;border-radius:3px;display:inline-block}.ev.w{white-space:normal;line-height:1.35}.ev.w .du{margin-left:6px}@keyframes fpspin{to{transform:rotate(360deg)}}
      .lab{background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:10px;min-width:0;box-sizing:border-box}
      .lv2{display:flex;align-items:center;gap:4px;margin-top:5px;flex-wrap:wrap}
      .rib2{background:var(--rc);color:var(--fp-on-accent,#141414);font-size:11px;font-weight:800;line-height:18px;padding:0 11px 0 7px;border-radius:3px 0 0 3px;clip-path:polygon(0 0,100% 0,86% 50%,100% 100%,0 100%);margin-right:2px;letter-spacing:.2px}
      .ic{width:38px;height:38px;border-radius:10px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center;flex:none}
      .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:var(--fp-on-accent,#161616);flex:none}
      .lt{min-width:0;flex:1}
      .lv b{font-weight:700}
      .lab[data-person]{cursor:pointer;-webkit-tap-highlight-color:transparent}.lab[data-person]:active{background:var(--fp-bg3,#2a2a2a)}
      .rib{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);background:var(--rc);color:var(--fp-on-accent,#141414);font-size:9px;font-weight:800;padding:1px 8px;line-height:13px;white-space:nowrap;letter-spacing:.3px;clip-path:polygon(0 0,100% 0,90% 50%,100% 100%,0 100%,10% 50%);z-index:2}
      .bdg{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap}
      ${AWCSS}
      .lv2 .md{width:32px;height:32px;border-width:1.5px}.lv2 .md ha-icon{--mdc-icon-size:19px}.lv2{gap:6px}.mdm{font-size:12px;color:var(--fp-text3,#8a8a8a);font-weight:600}.pp{color:${G};font-weight:600}
      .md.lg{width:36px;height:36px}.md.lg ha-icon{--mdc-icon-size:20px}
      .ovl{position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:10}
      .pnl{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);width:min(600px,94%);max-height:92%;overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.6);box-sizing:border-box}
      .ph{display:flex;align-items:center;gap:18px;margin-bottom:16px}.phn{flex:1}.pn2{font-size:24px;font-weight:600}
      .ring.bigr{width:64px;height:64px;display:flex}.ring.bigr .crown{top:-14px}.ring.bigr .crown ha-icon{--mdc-icon-size:24px}.ring.bigr .rib{font-size:11px;line-height:15px;bottom:-7px}
      .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kp div{background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px}
      .kp span{display:block;font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}.kp b{font-size:18px;font-weight:400}.kp small{font-size:12px;color:var(--fp-text3,#888)}
      .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
      .aw{display:flex;gap:12px;align-items:center;background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px;margin-bottom:6px}.aw b{font-size:15px}.aw div div{font-size:12px;color:var(--fp-text2,#aaa);margin-top:2px}
      .aw0{color:var(--fp-text3,#888);font-size:13px}
      .rl2{display:grid;grid-template-columns:22px 140px 1fr;gap:3px 10px;align-items:center;font-size:12px;color:var(--fp-text2,#aaa);padding:7px 0;border-top:1px solid var(--fp-line,#2a2a2a)}.rl2 b{color:var(--fp-text,#ddd)}
      .rl2 em{grid-column:3;font-style:normal;color:#e0a84f;font-size:11px}
      .nm{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lv{font-size:11px;margin-top:2px}
      .cls{display:flex;flex-wrap:wrap;gap:2px 8px;margin-top:2px}.cl{font-size:11px;color:var(--fp-text3,#7a7a7a);display:flex;align-items:center;gap:4px}.cl i{width:7px;height:7px;border-radius:50%;display:inline-block}
      .streak{font-size:11px;color:var(--fp-text2,#9a9a9a);display:flex;align-items:center;gap:3px;margin-top:3px}.streak ha-icon{--mdc-icon-size:13px;color:#e0a84f}
      .bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,135px),1fr));gap:6px}
      .btn{display:flex;align-items:center;gap:9px;width:100%;background:var(--fp-bg4,#323232);border:1px solid var(--fp-line,#3a3a3a);border-radius:9px;padding:6px 9px;margin:0;color:var(--fp-text,#eee);font:inherit;font-size:13px;line-height:1.25;min-height:40px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box;transition:background .2s,border-color .2s}
      .btn:active{transform:scale(.98)}
      .btn .cb{width:22px;height:22px;border-radius:50%;border:2px solid var(--fp-line,#5d5d5d);flex:none;position:relative;box-sizing:border-box;transition:all .2s}
      .btn.done{background:color-mix(in srgb,var(--fp-accent) 1200%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .btn.done .cb{background:${G};border-color:${G}}
      .btn.done .cb::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid var(--fp-line,#1e1e1e);border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
      .btn.done .bt{color:var(--fp-accent)}
      .btn .tag{display:inline-block;font-style:normal;font-size:10px;font-weight:700;letter-spacing:.3px;padding:1px 6px;border-radius:7px;margin-right:6px;vertical-align:1px}
      .btn.spc{border-color:rgba(245,197,66,.65);background:rgba(245,197,66,.08)}.btn.spc .tag{background:rgba(245,197,66,.2);color:#f5c542}
      .btn.tdo{border:1px dashed rgba(79,163,224,.7);background:rgba(79,163,224,.07)}.btn.tdo .tag{background:rgba(79,163,224,.2);color:#4fa3e0}.btn.tdo .cb{border-radius:6px}
      .btn.tdo.arm{border-style:solid;border-color:#4fa3e0;background:rgba(79,163,224,.18)}
      .tdn2{font-size:11px;font-weight:700;color:#4fa3e0;margin-top:4px}.pl.spl{color:#f5c542}
      .btn.pop .cb{animation:fpcheck .5s cubic-bezier(.3,1.6,.5,1)}.btn.pop .cb::before{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid ${G};animation:fpring .6s ease-out forwards}
      @keyframes fpcheck{0%{transform:scale(.55)}60%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes fpring{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.3);opacity:0}}
      @media (prefers-reduced-motion:reduce){.btn.pop .cb,.btn.pop .cb::before{animation:none}}
      .due{font-style:normal;font-size:10px;font-weight:600;color:#e0a84f;border:1px solid rgba(224,168,79,.5);border-radius:8px;padding:1px 6px;margin-left:6px;white-space:nowrap;display:inline-block}
      .due.last{color:var(--fp-on-accent,#1e1e1e);background:#e0a84f;border-color:#e0a84f}.btn.done .due{opacity:.5}
      .pl.op{color:#c39a4a}.pl.op::before{display:none}
      .pev.mid .ev{font-size:11px;padding:3px 5px 3px 6px;white-space:normal;line-height:1.3}.pev.mid .et{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fp-text,#ddd)}
      .pev.xl .ev{padding:5px 8px;font-size:12px}.pev.xl .et{color:var(--fp-text,#eee)}
      .pst{display:inline-block;font-size:11px;font-weight:700;color:var(--fp-on-accent,#141414);background:var(--pc);border-radius:6px;padding:1px 6px;line-height:16px}
      .c.p.sm{padding:6px 4px;min-height:40px;display:flex;flex-direction:column;align-items:center;gap:4px}
      .evn{display:flex;align-items:center;gap:3px;font-size:11px;color:var(--fp-text2,#aaa);margin-bottom:5px;flex-wrap:wrap;justify-content:center}.evn i{width:6px;height:6px;border-radius:50%;display:inline-block}.evn b{margin-left:2px;font-weight:600}
      .hd.ts-s{padding:4px 4px 6px;font-size:9px;letter-spacing:.5px}.hd.ts-s b{font-size:14px;color:var(--fp-text3,#8a8a8a)}
      .hd.ts-m b{font-size:17px}
      .c.p .big{font-size:14px}.c.p .big small{font-size:10px}.c.p .bar{margin:5px 0 4px}
      .fc{font-size:11px;color:var(--fp-text3,#8a8a8a);white-space:nowrap}.fc b{font-size:18px;font-weight:300;color:var(--fp-text,#ddd);margin-right:4px}
      .opn{font-size:11px;color:#c39a4a;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .prog{font-size:11px;color:var(--fp-text3,#8a8a8a);margin-bottom:4px;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.8px}.gr{color:${G};font-weight:600}
      .free{display:flex;align-items:center;gap:8px;color:var(--fp-text3,#8a8a8a);font-size:14px;padding:6px 2px}.free ha-icon{color:${G}}
      .vc{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;min-height:40px;color:#4fa3e0;font-size:13px;font-weight:600;background:rgba(79,163,224,.08);border-radius:8px}.vc ha-icon{--mdc-icon-size:20px}
      .big{font-size:18px;font-weight:300;line-height:1.1}.big small{font-size:13px;color:var(--fp-text3,#8a8a8a)}
      .bar{height:4px;border-radius:2px;background:var(--fp-bg4,#3a3a3a);margin:7px 0 6px;overflow:hidden}.bar i{display:block;height:100%}
      .miss{font-size:11px;color:#d98080;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ok{font-size:11px;color:${G};display:flex;align-items:center;gap:4px}.ok ha-icon{--mdc-icon-size:14px}
      .pl{font-size:12px;color:var(--fp-text3,#7a7a7a);line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pl::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--fp-bg4,#555);margin-right:6px;vertical-align:middle}
      .none{font-size:13px;color:var(--fp-text3,#555)}
      .ev{font-size:12px;line-height:1.3;padding:4px 6px 4px 7px;border-left:3px solid;background:var(--fp-bg4,#303030);border-radius:0 6px 6px 0;margin-top:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .ev:first-child{margin-top:0}.ev b{font-weight:600;color:var(--fp-text2,#aaa);margin-right:5px}
      .more{font-size:11px;color:var(--fp-text3,#777);margin-top:4px}
      .emptyk{grid-column:1/-1;color:var(--fp-text3,#7a7a7a);padding:20px;text-align:center}
      .err{color:#e06b6b;font-size:12px;margin-top:10px}
    .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>
    <div class="card${phone ? ' phone' : ''}">
      <div class="top">
        <div class="seg">${[['alle', 'Alles'], ['aemtli', 'Ämtli'], ['extra', 'To-dos & Spezial'], ['termine', 'Termine'], ['schule', 'Stundenplan']].filter(([v]) => v !== 'schule' || Object.keys(this._cfg.schule || {}).length).map(([v, l]) => `<button class="${(this._mode || 'alle') === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        ${this._cfg.todos_knopf ? `<div class="tdg"><button class="nb td${this._cfg.todos_offen ? ' g' : ''}" data-todos title="To-dos"><ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>${phone ? '' : 'To-dos'}${this._cfg.todos_offen ? ` <b class="tdn">${Number(this._cfg.todos_offen)}</b>` : ''}</button><button class="nb" data-todoadd title="To-do hinzufügen"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ''}
        <div class="nav">
          ${(phone ? (this._dayOff || 0) !== 0 : this._week !== 0) ? `<button class="nb g" data-nav="0">Heute</button>` : ''}
          ${cals.length && !phone ? `<button class="nb${this._syncing ? ' spin2' : ''}" data-sync title="Kalender synchronisieren"><ha-icon icon="mdi:calendar-sync-outline"></ha-icon></button>` : ''}
          <button class="nb" data-nav="-1"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          ${phone ? `<div class="dd"><b>${ymd(sel) === tStr ? 'Heute' : WDL[isoWd(sel) - 1]}</b>${sel.getDate()}. ${MON[sel.getMonth()]}</div>`
            : `<div class="wk"><b>KW ${isoWeek(ws)}</b>${ws.getDate()}. ${ws.getMonth() !== we.getMonth() ? MON[ws.getMonth()].slice(0, 3) + '. ' : ''}– ${we.getDate()}. ${MON[we.getMonth()]}</div>`}
          <button class="nb" data-nav="1"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </div>
      </div>
      <div class="grid">${head}${(!cals.length || cals.some((c) => !c.person)) ? termine : ''}${rows}${empty}</div>
      ${this._err ? `<div class="err">${esc(this._err)}</div>` : ''}
      ${this._detail ? this._detailHtml(kids, pre, awards, frames) : ''}
    </div>`;
  }
}

// Navigation zwischen den Familienplaner-Seiten (funktioniert auch im Kiosk-Modus ohne HA-Kopfzeile)
const fpNavigate = (p) => {
  const parts = location.pathname.split('/').filter(Boolean);
  history.pushState(null, '', `/${parts[0] || 'family-planer'}/${p}${location.search}`);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
};
window.FPX = { AWT, AWR, AWCSS, avatarGen, FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx, planActive, AV_TYPES, PALETTE, fpNavigate, startOfDay, ymd };
customElements.define('fp-week-inner', LoxWochenplanerCard);

})();
// Familienplaner – Ämtliplan v3: pro Ämtli mehrere Personen, pro Person Wochentage mit Rhythmus
// custom:fp-plan-inner   (nutzt window.FPX aus dem Familienplaner-Modul)
// Plan-Beschreibung: "fp1:" + {"z": {"Lea": [1,3]}, "r": {"Lea|1": [2, 0]}}
//   r: alle n Wochen, aktiv wenn Wochenindex (seit 5.1.1970) % n == offset; fehlt r => jede Woche
customElements.whenDefined('fp-week-inner').then(() => {
  const { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx } = window.FPX;
  const rgba = (hex, a) => { const h = (hex || '#888888').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const mondayOfIdx = (idx) => { const u = new Date(Date.UTC(1970, 0, 5) + idx * 604800000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const curIdx = () => weekIdx(new Date());
  const nextKw = (n, o) => { const c = curIdx(); for (let i = 0; i < n; i++) if ((c + i) % n === o) return isoWeek(mondayOfIdx(c + i)); return null; };
  const dayTxt = (p, d, r, f) => { const x = r[`${p}|${d}`]; const fv = (f || {})[`${p}|${d}`] || 1; const ex = []; if (fv > 1) ex.push(`bis ${WD[(d - 1 + fv - 1) % 7]}`); if (x && x[0] > 1) ex.push(`alle ${x[0]} Wo., nächste KW ${nextKw(x[0], x[1])}`); return ex.length ? `${WD[d - 1]} (${ex.join(', ')})` : WD[d - 1]; };
  const daysTxt = (p, t, r, f) => {
    const s = [...(t || [])].sort((a, b) => a - b); const j = s.join(',');
    const anyR = s.some((d) => (r[`${p}|${d}`] || [1])[0] > 1 || ((f || {})[`${p}|${d}`] || 1) > 1);
    if (!anyR) { if (j === '1,2,3,4,5,6,7') return 'täglich'; if (j === '1,2,3,4,5') return 'werktags'; if (j === '6,7') return 'Wochenende'; }
    return s.length ? s.map((d) => dayTxt(p, d, r, f)).join(', ') : 'keine Tage';
  };

  class LoxAemtliPlanCard extends FpBase {
    _normalize(c) { return { plan: 'todo.amtli_plan', script: 'script.aemtli_tageswechsel', einstellungen: 'todo.familienplaner_einstellungen', kinder: [], titel: 'Ämtliplan', ...c }; }
    _lists() { return [['plan', this._cfg.plan], ['settings', this._cfg.einstellungen]]; }
    getCardSize() { return 10; }
    _bind() {
      this._new = { t: '', z: {}, r: {}, f: {} }; this._confirm = null; this._msg = ''; this._pick = null;
      const r = this.shadowRoot;
      r.addEventListener('click', (e) => this._onClick(e));
      r.addEventListener('change', (e) => this._onChange(e));
      r.addEventListener('input', (e) => { if (e.target.dataset.new === 't') this._new.t = e.target.value; });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur(); });
      r.addEventListener('focusout', () => setTimeout(() => { if (this._dirty && !this._editing()) { this._dirty = false; this._render(); } }, 60));
    }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && a.tagName === 'INPUT'; }
    _order() { return this._kids().map((k) => k.name); }
    _rows() {
      const order = this._order();
      const first = (z) => Math.min(99, ...Object.keys(z).map((k) => { const i = order.indexOf(k); return i < 0 ? 98 : i; }));
      return (this._data.plan || []).map((p) => { const m = parseDesc(p.description); return { uid: p.uid, t: p.summary, pts: (typeof m.p === 'number' ? m.p : null), z: planZ(m), r: (m.r && typeof m.r === 'object') ? m.r : {}, f: (m.f && typeof m.f === 'object') ? m.f : {} }; })
        .sort((a, b) => (first(a.z) - first(b.z)) || a.t.localeCompare(b.t, 'de'));
    }
    _find(uid) { return this._rows().find((r) => r.uid === uid); }
    _desc(z, r, f) {
      const zo = {}; const ro = {}; const fo = {}; f = f || {};
      for (const [k, v] of Object.entries(z)) {
        zo[k] = [...new Set(v)].sort((a, b) => a - b);
        for (const d of zo[k]) { const x = r[`${k}|${d}`]; if (x && x[0] > 1) ro[`${k}|${d}`] = [x[0], ((x[1] % x[0]) + x[0]) % x[0]]; const fv = f[`${k}|${d}`]; if (fv > 1) fo[`${k}|${d}`] = fv; }
      }
      const o = { z: zo }; if (Object.keys(ro).length) o.r = ro; if (Object.keys(fo).length) o.f = fo;
      return 'fp1:' + JSON.stringify(o);
    }
    _sync() {
      clearTimeout(this._syncT);
      this._syncT = setTimeout(() => { if (this._cfg.script) this._call('script', 'turn_on', {}, this._cfg.script).catch(() => {}); }, 1200);
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(true); clearTimeout(this._msgT); this._msgT = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _add() {
      const t = (this._new.t || '').trim();
      if (!t) return this._flash('Bitte einen Ämtli-Text eingeben.', true);
      if (!Object.values(this._new.z).some((v) => v.length)) return this._flash('Bitte mindestens einer Person einen Wochentag zuordnen.', true);
      this._call('todo', 'add_item', { item: t, description: this._desc(this._new.z, this._new.r, this._new.f) }, this._cfg.plan).then(() => {
        this._new = { t: '', z: {}, r: {}, f: {} }; this._pick = null; this._flash(`„${t}“ hinzugefügt`); this._sync();
      }).catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    _ctx(el) {
      const isNew = !!el.closest('.add'); const row = el.closest('.row[data-uid]');
      const r = !isNew && row ? this._find(row.dataset.uid) : null;
      const src = isNew ? this._new : r;
      return { isNew, r, key: isNew ? 'new' : (r && r.uid), z: src ? JSON.parse(JSON.stringify(src.z)) : null, rr: src ? JSON.parse(JSON.stringify(src.r || {})) : null, ff: src ? JSON.parse(JSON.stringify(src.f || {})) : null };
    }
    _apply(ctx) {
      if (ctx.isNew) { this._new.z = ctx.z; this._new.r = ctx.rr; this._new.f = ctx.ff; this._render(true); return; }
      if (!ctx.r) return;
      // optimistisch im lokalen Datenstand übernehmen, damit die Anzeige sofort stimmt
      const desc = this._desc(ctx.z, ctx.rr, ctx.ff);
      const it = (this._data.plan || []).find((p) => p.uid === ctx.r.uid); if (it) it.description = desc;
      this._render(true);
      this._call('todo', 'update_item', { item: ctx.r.uid, description: desc }, this._cfg.plan)
        .then(() => this._sync()).catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    _isPick(key, p, d) { const k = this._pick; return !!k && k.key === key && k.p === p && k.d === d; }
    _onClick(e) {
      const t = e.target;
      const ha = t.closest('[data-hadd]'); if (ha) { this.dispatchEvent(new CustomEvent('fp-plan-add', { bubbles: true, composed: true, detail: { kind: ha.dataset.hadd } })); return; }
      if (t.closest('[data-add]')) { const inp = this.shadowRoot.querySelector('[data-new="t"]'); if (inp) this._new.t = inp.value; this._add(); return; }
      const arw = t.closest('.arw');
      if (arw) {
        const ctx = this._ctx(t); if (!ctx.z) return; const p = arw.dataset.p;
        const day = t.closest('[data-day]');
        if (day) {
          const d = Number(day.dataset.day); const has = (ctx.z[p] || []).includes(d);
          if (!has) { ctx.z[p] = [...(ctx.z[p] || []), d]; this._pick = { key: ctx.key, p, d }; this._apply(ctx); }
          else { this._pick = this._isPick(ctx.key, p, d) ? null : { key: ctx.key, p, d }; this._render(true); }
          return;
        }
        const pre = t.closest('[data-preset]');
        if (pre) { ctx.z[p] = pre.dataset.preset.split(',').map(Number); Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rmp]')) { delete ctx.z[p]; Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        const pk = this._pick; if (!pk) return; const rk = `${pk.p}|${pk.d}`;
        const rn = t.closest('[data-rn]');
        if (rn) { const n = Number(rn.dataset.rn); if (n <= 1) delete ctx.rr[rk]; else ctx.rr[rk] = [n, curIdx() % n]; this._apply(ctx); return; }
        const ro = t.closest('[data-ro]');
        if (ro && ctx.rr[rk]) { ctx.rr[rk][1] = Number(ro.dataset.ro); this._apply(ctx); return; }
        const fx = t.closest('[data-fx]');
        if (fx) { const v = Number(fx.dataset.fx); if (v <= 1) delete ctx.ff[rk]; else ctx.ff[rk] = v; this._apply(ctx); return; }
        if (t.closest('[data-rdel]')) { ctx.z[pk.p] = (ctx.z[pk.p] || []).filter((x) => x !== pk.d); delete ctx.rr[rk]; delete ctx.ff[rk]; this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rclose]')) { this._pick = null; this._render(true); return; }
        return;
      }
      const del = t.closest('[data-del]');
      if (del) {
        const ctx = this._ctx(t); if (!ctx.r) return; const r = ctx.r;
        if (this._confirm === r.uid) {
          this._confirm = null;
          this._call('todo', 'remove_item', { item: [r.uid] }, this._cfg.plan).then(() => { this._flash(`„${r.t}“ gelöscht`); this._sync(); }).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        } else {
          this._confirm = r.uid; this._render(true);
          clearTimeout(this._cT); this._cT = setTimeout(() => { this._confirm = null; this._render(); }, 3000);
        }
      }
    }
    _onChange(e) {
      const el = e.target;
      if (el.dataset.addp !== undefined) {
        const v = el.value; if (!v) return; const ctx = this._ctx(el); if (!ctx.z) return;
        ctx.z[v] = ctx.z[v] || []; this._apply(ctx); return;
      }
      if (el.dataset.f === 'p') {
        const ctx = this._ctx(el); if (!ctx.r) return;
        const n = el.value === '' ? null : Math.max(0, Math.min(1000, Math.round(Number(el.value) || 0)));
        this._call('todo', 'update_item', { item: ctx.r.uid, points: n }, this._cfg.plan).then(() => this._flash('Punkte gespeichert')).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        return;
      }
      if (el.dataset.f === 't') {
        const ctx = this._ctx(el); if (!ctx.r) return; const v = el.value.trim();
        if (v && v !== ctx.r.t) this._call('todo', 'update_item', { item: ctx.r.uid, rename: v }, this._cfg.plan).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        else el.value = ctx.r.t;
      }
    }
    _picker(key, p, d, rr, farbe, ff) {
      const x = rr[`${p}|${d}`]; const n = x && x[0] > 1 ? x[0] : 1; const o = x ? x[1] : 0; const c = curIdx();
      const fv = (ff || {})[`${p}|${d}`] || 1;
      const fRow = `<div class="pr"><span class="plb">Zeit zum Erledigen</span>${[1, 2, 3, 4, 5, 6, 7].map((k) => `<button class="sg${k === fv ? ' on' : ''}" data-fx="${k}">${k === 1 ? `nur am ${WD[d - 1]}` : `bis ${WD[(d - 1 + k - 1) % 7]} · ${k} Tage`}</button>`).join('')}</div>`;
      const starts = n > 1 ? [...Array(n)].map((_, i) => {
        const idx = c + i; const off = idx % n; const kw = isoWeek(mondayOfIdx(idx));
        return `<button class="sg${off === o ? ' on' : ''}" data-ro="${off}">${i === 0 ? 'diese Woche' : i === 1 ? 'nächste Woche' : `in ${i} Wochen`} · KW ${kw}</button>`;
      }).join('') : '';
      return `<div class="pick" style="--c:${farbe};--cb:${rgba(farbe, 0.2)}">
        <div class="pr"><span class="plb">${WD[d - 1]} · ${esc(p)}</span>
          ${[1, 2, 3, 4].map((k) => `<button class="sg${k === n ? ' on' : ''}" data-rn="${k}">${k === 1 ? 'jede Woche' : `alle ${k} Wochen`}</button>`).join('')}</div>
        ${n > 1 ? `<div class="pr"><span class="plb">Start</span>${starts}</div>` : ''}
        ${fRow}<div class="pr"><button class="sg rm" data-rdel>Tag entfernen</button><button class="sg ok" data-rclose>Fertig</button></div>
      </div>`;
    }
    _asg(key, z, rr, ff) {
      ff = ff || {};
      const kids = this._kids(); const order = this._order();
      const person = (n) => kids.find((k) => k.name === n) || { name: n, farbe: '#888888' };
      const names = Object.keys(z).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const lines = names.map((n) => {
        const k = person(n); const t = z[n] || [];
        const pk = this._pick && this._pick.key === key && this._pick.p === n ? this._pick : null;
        return `<div class="arw" data-p="${esc(n)}"><div class="ar">${avatarHtml(k, 30)}<span class="pn">${esc(n)}</span>
          <div class="days">${WD.map((w, i) => {
            const d = i + 1; const on = t.includes(d); const x = rr[`${n}|${d}`]; const rh = on && x && x[0] > 1; const fv = on ? (ff[`${n}|${d}`] || 1) : 1; const tag = [rh ? x[0] + 'W' : '', fv > 1 ? fv + 'T' : ''].filter(Boolean).join('·');
            return `<button class="day${on ? ' on' : ''}${(rh || fv > 1) ? ' rh' : ''}${pk && pk.d === d ? ' sel' : ''}" data-day="${d}" style="--c:${k.farbe};--cb:${rgba(k.farbe, 0.2)}">${w}${tag ? `<small>${tag}</small>` : ''}</button>`;
          }).join('')}</div>
          <button class="pre" data-preset="1,2,3,4,5,6,7">tägl.</button><button class="pre" data-preset="1,2,3,4,5">Mo–Fr</button>
          <button class="rmp" data-rmp title="Person entfernen">✕</button></div>
          ${pk && t.includes(pk.d) ? this._picker(key, n, pk.d, rr, k.farbe, ff) : ''}</div>`;
      }).join('');
      const free = kids.filter((k) => !(k.name in z));
      return lines + (free.length ? `<select class="sel addp" data-addp><option value="" selected>+ Person zuteilen</option>${free.map((k) => `<option value="${esc(k.name)}">${esc(k.name)}</option>`).join('')}</select>` : '');
    }
    _render(force) {
      if (!this.shadowRoot || !this._cfg) return;
      if (!force && this._editing()) { this._dirty = true; return; }
      const kids = this._kids(); const rows = this._rows();
      // Wochenübersicht: durchschnittliche Anzahl Ämtli pro Person und Tag (Rhythmus anteilig)
      const cnt = {}; kids.forEach((k) => { cnt[k.name] = [0, 0, 0, 0, 0, 0, 0]; });
      rows.forEach((r) => Object.entries(r.z).forEach(([n, t]) => { if (!cnt[n]) cnt[n] = [0, 0, 0, 0, 0, 0, 0]; (t || []).forEach((d) => { const x = r.r[`${n}|${d}`]; cnt[n][d - 1] += x && x[0] > 1 ? 1 / x[0] : 1; }); }));
      const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
      const max = Math.max(1, ...Object.values(cnt).flat());
      const overview = `<div class="ov"><div></div>${WD.map((w) => `<div class="ovh">${w}</div>`).join('')}<div class="ovh">Ø Woche</div>` +
        kids.map((k) => `<div class="ovp">${avatarHtml(k, 24)}<span>${esc(k.name)}</span></div>` +
          cnt[k.name].map((n) => `<div class="ovc" style="background:${n ? rgba(k.farbe, 0.12 + (0.5 * n) / max) : 'var(--fp-bg3,#262626)'};color:${n ? 'var(--fp-text,#fff)' : 'var(--fp-text3,#555)'}">${n ? fmt(n) : '·'}</div>`).join('') +
          `<div class="ovt">${fmt(cnt[k.name].reduce((a, b) => a + b, 0))}</div>`).join('') + `</div>`;
      const sum = (z, r, f) => Object.entries(z).map(([n, t]) => `<b>${esc(n)}:</b> ${daysTxt(n, t, r, f)}`).join('<br>') || 'Noch niemandem zugeteilt';
      const body = rows.map((r) => `
        <div class="row" data-uid="${esc(r.uid)}">
          <div class="tcol"><div class="tl"><input class="in" data-f="t" value="${esc(r.t)}"><label class="pts" title="Punkte bzw. Gewicht für dieses Ämtli (im fairen Modus: Anteil am Tageswert)"><input class="in pn" data-f="p" type="number" min="0" max="1000" inputmode="numeric" value="${r.pts == null ? '' : r.pts}" placeholder="${Number(this._cfg.punkte_standard) || 10}"><span>Pkt.</span></label></div><div class="rl">${sum(r.z, r.r, r.f)}</div></div>
          <div class="asg">${this._asg(r.uid, r.z, r.r, r.f)}</div>
          <button class="del${this._confirm === r.uid ? ' cf' : ''}" data-del>${this._confirm === r.uid ? 'Löschen?' : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button>
        </div>`).join('');
      const nw = this._new;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:20px 22px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
        .head{display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap}.hsp{flex:1}.hadd{display:flex;align-items:center;gap:6px;height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#262626);color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer}.hadd ha-icon{--mdc-icon-size:18px;color:${G}}
        .badge{width:46px;height:46px;border-radius:12px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center}.badge ha-icon{--mdc-icon-size:26px}
        .title{font-size:20px;font-weight:600}.subt{font-size:13px;color:var(--fp-text2,#8c8c8c);margin-top:3px}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .ov{display:grid;grid-template-columns:150px repeat(7,minmax(34px,58px)) 70px;gap:4px;align-items:center;background:var(--fp-bg2,#232323);border-radius:12px;padding:12px;width:max-content;max-width:100%;box-sizing:border-box}
        .ovh{font-size:11px;color:var(--fp-text3,#777);text-align:center;text-transform:uppercase;letter-spacing:.8px}
        .ovp{display:flex;align-items:center;gap:8px;font-size:14px;min-width:0}.ovp span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ovc{height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
        .ovt{text-align:center;font-size:14px;color:var(--fp-text2,#bbb);font-weight:600}
        .list{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2f2f2f);border-radius:12px;overflow:hidden}
        .row{display:grid;grid-template-columns:minmax(200px,1fr) auto 56px;gap:16px;align-items:start;padding:14px;border-top:1px solid var(--fp-line,#313131)}.row:first-child{border-top:none}
        .in,.sel{background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text,#eee);border-radius:9px;height:44px;padding:0 12px;font:inherit;font-size:15px;width:100%;box-sizing:border-box;outline:none}
        .in:focus,.sel:focus{border-color:color-mix(in srgb,var(--fp-accent) 70%,transparent)}
        .sel{-webkit-appearance:none;appearance:none}
        .tl{display:flex;gap:8px}.pts{display:flex;align-items:center;gap:4px;flex:none;color:var(--fp-text3,#8a8a8a);font-size:12px}.pts .pn{width:70px;text-align:center;padding:0 6px}
        .rl{font-size:12px;color:var(--fp-text3,#8a8a8a);margin:6px 0 0 2px;line-height:1.6}.rl b{color:var(--fp-text2,#bbb);font-weight:600}
        .asg{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
        .ar{display:flex;align-items:center;gap:8px}
        .pn{width:74px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .days{display:flex;gap:4px}
        .day{width:40px;height:40px;border-radius:9px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#808080);font:inherit;font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}
        .day small{font-size:9px;font-weight:700;opacity:.9}
        .day.on{background:var(--cb);border-color:var(--c);color:var(--c)}
        .day.rh{border-style:dashed}
        .day.sel{box-shadow:0 0 0 2px #1e1e1e,0 0 0 4px var(--c)}
        .pre{height:32px;border-radius:var(--fp-radius,16px);background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#999);font:inherit;font-size:11px;padding:0 10px;cursor:pointer}
        .rmp{width:32px;height:32px;border-radius:50%;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);font-size:13px;cursor:pointer;padding:0}
        .pick{margin:8px 0 4px 38px;background:var(--fp-bg1,#1f1f1f);border:1px solid var(--c);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
        .pr{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
        .plb{font-size:12px;color:var(--c);font-weight:600;min-width:86px}
        .sg{height:34px;border-radius:17px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#bbb);font:inherit;font-size:12px;padding:0 12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .sg.on{background:var(--cb);border-color:var(--c);color:var(--c);font-weight:600}
        .sg.rm{color:#e06b6b;border-color:rgba(224,107,107,.5)}.sg.ok{margin-left:auto;background:${G};border-color:${G};color:var(--fp-on-accent,#142010);font-weight:600}
        .addp{width:220px;height:38px;font-size:13px;color:var(--fp-text2,#aaa);border-style:dashed}
        .del{height:44px;border-radius:9px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);cursor:pointer;font:inherit;font-size:11px;font-weight:600;padding:0;display:flex;align-items:center;justify-content:center}
        .del.cf{background:#e06b6b;border-color:#e06b6b;color:var(--fp-on-accent,#1e1e1e)}.del ha-icon{--mdc-icon-size:20px}
        .add{margin-top:16px;background:var(--fp-bg2,#232323);border:1px dashed var(--fp-line,#3d3d3d);border-radius:12px;padding:14px}
        .add .row{padding:0;border:none}
        .addb{height:44px;border-radius:9px;background:${G};border:none;color:var(--fp-on-accent,#142010);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.addb ha-icon{--mdc-icon-size:24px}
        .msg{font-size:13px;margin-top:10px;min-height:18px}
        .empty{padding:24px;text-align:center;color:var(--fp-text3,#777)}
        .foot{font-size:12px;color:var(--fp-text3,#666);margin-top:12px;line-height:1.5}
        .pers{display:flex;flex-wrap:wrap;gap:8px}
        .pc{display:flex;align-items:center;gap:10px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);border-radius:30px;padding:4px 14px 4px 4px;color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .pc ha-icon{--mdc-icon-size:14px;color:var(--fp-text3,#777)}.pc.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .ipk{margin-top:10px;background:var(--fp-bg2,#232323);border:1px solid var(--c);border-radius:14px;padding:14px 16px}
        .iph{display:flex;align-items:center;gap:14px;margin-bottom:6px}.iphn{flex:1}.iphn b{display:block;font-size:18px}.iphn span{font-size:12px;color:var(--fp-text3,#888)}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.upl .up{cursor:pointer;display:inline-flex;align-items:center}
        .ipl{font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px}
        .cols{display:flex;gap:8px;flex-wrap:wrap}
        .clr{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.clr.on{border-color:#fff;box-shadow:0 0 0 2px #1e1e1e inset}
        .igrid{display:flex;flex-wrap:wrap;gap:6px}
        .ips2{font-size:11px;color:var(--fp-text3,#777);margin-top:5px}
        .ib{width:56px;height:56px;border-radius:12px;background:var(--fp-bg3,#2a2a2a);border:1px solid var(--fp-line,#333);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
        .ib.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>
      <div class="card">
        <div class="head"><div class="badge"><ha-icon icon="mdi:clipboard-text-clock-outline"></ha-icon></div>
          <div><div class="title">${esc(this._cfg.titel)}</div><div class="subt">Tag antippen = zuteilen · nochmals antippen = Zeit zum Erledigen (z. B. Mi bis Sa) und Rhythmus (alle 2–4 Wochen). Änderungen gelten ab sofort.</div></div><span class="hsp"></span>
          <button class="hadd" data-hadd="special"><ha-icon icon="mdi:plus"></ha-icon>Besonderes Ämtli</button><button class="hadd" data-hadd="todo"><ha-icon icon="mdi:plus"></ha-icon>To-do</button></div>
        <div class="sec">Wochenübersicht</div>
        ${overview}
        <div class="sec">Ämtli</div>
        <div class="list">${body || '<div class="empty">Noch keine Ämtli – unten hinzufügen.</div>'}</div>
        <div class="add"><div class="sec" style="margin-top:0">Neues Ämtli</div>
          <div class="row">
            <div class="tcol"><input class="in" data-new="t" placeholder="z. B. Tisch abräumen" value="${esc(nw.t)}"><div class="rl">${sum(nw.z, nw.r, nw.f || {})}</div></div>
            <div class="asg">${this._asg('new', nw.z, nw.r, nw.f || {})}</div>
            <button class="addb" data-add title="Hinzufügen"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="msg" style="color:${this._msgErr ? '#E06B6B' : G}">${esc(this._msg || '')}</div>
        ${this._err ? `<div class="msg" style="color:#E06B6B">${esc(this._err)}</div>` : ''}
        <div class="foot">Gestrichelter Rahmen = Frist oder Rhythmus („4T“ = 4 Tage Zeit, „2W“ = alle 2 Wochen). Ein Ämtli mit Frist zählt erst als „nicht gemacht“, wenn die Frist abgelaufen ist. Täglich um ${esc(this._cfg.tageswechsel || '24:00')} werden unerledigte Ämtli als „nicht gemacht“ gezählt und die Ämtli für den neuen Tag erstellt.</div>
      </div>`;
    }
  }
  if (!customElements.get('fp-plan-inner')) customElements.define('fp-plan-inner', LoxAemtliPlanCard);
});

(() => {
// Familienplaner – Loxone-Style Karten
//  custom:fp-week-inner-en   Wochenkalender mit Ämtli (heute abhaken), Verlauf, Zuverlässigkeit, Kalender-Termine
//  custom:lox-aemtli-config-card  Ämtliplan bearbeiten (wie Serientermine: Text, Kind, Wochentage)
// Datenhaltung: todo.amtli_plan (Plan), todo.amtli_heute (heutige Ämtli), todo.amtli_verlauf (Tagesbilanz)
// Beschreibungen: "fp1:" + JSON   Plan {k,t:[1..7]}   Heute {k,d,c}   Verlauf {s:[[kind,erledigt,total]],x:[[kind,text]]}
const G = 'var(--fp-accent)';
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WDL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PALETTE = ['#69C350', '#4FA3E0', '#E0A84F', '#C771D6', '#E06B6B', '#4FD1C5'];
const CALCOL = ['#4FA3E0', '#E0A84F', '#C771D6', '#4FD1C5', '#E06B6B'];
const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoWd = (d) => d.getDay() || 7;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// planner day: changes at the configured day-change time (window.FP_DAY_OFFSET_MIN)
const fpDay = () => new Date(Date.now() - (window.FP_DAY_OFFSET_MIN || 0) * 60000);
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDesc = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };
const isoWeek = (d) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); };
// Zuteilung eines Plan-Ämtli: neues Format {z:{Person:[Tage]}}, altes Format {k, t} wird automatisch übernommen
const planZ = (m) => (m && m.z && typeof m.z === 'object') ? m.z : (m && m.k ? { [m.k]: m.t || [] } : {});
// Rhythmus: m.r = {"Person|Wochentag": [alle_n_Wochen, offset]}; aktiv, wenn Wochenindex % n == offset
const weekIdx = (d) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1970, 0, 5)) / 604800000);
const planActive = (m, kid, wd, date) => { const r = (m && m.r && m.r[`${kid}|${wd}`]) || null; if (!r || !(r[0] > 1)) return true; return weekIdx(date) % r[0] === r[1]; };
// Frist: Heute-Item {d: Start, e: Fristende}; Plan m.f = {"Person|Wochentag": Anzahl Tage}
const dueTag = (m, tStr) => { const e = m.e || m.d; if (!e) return ''; if (e > tStr) return `<em class="due">until ${WD[isoWd(new Date(e + 'T00:00:00')) - 1]}</em>`; if (m.d && m.d < tStr) return '<em class="due last">due today</em>'; return ''; };
// Termin-Zeit mit Dauer: breit "14:30–15:20 · 50 Min", schmal "14:30 · 50′"
const durTxt = (ms, short) => { const m = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(m / 60), r = m % 60;
  if (short) return h ? (r ? `${h}h${pad(r)}` : `${h}h`) : `${m}′`;
  return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${m} min`; };
// nächster Termin: „in 25 Min“; vorbei = abgeblendet
const SOON_T = ['in {n} min', 'in {n} h'];
const evState = (e) => { if (e.allDay) return { c: '', b: '' }; const now = new Date();
  if (e.e <= now) return { c: ' past', b: '' };
  const m = Math.round((e.s - now) / 60000);
  if (m > 0 && m <= 180) return { c: ' soon', b: `<em class="soon">${(m < 60 ? SOON_T[0] : SOON_T[1]).replace('{n}', m < 60 ? m : Math.round(m / 6) / 10)}</em>` };
  if (e.s <= now) return { c: ' now', b: '' };
  return { c: '', b: '' }; };
// Jetzt-Linie zwischen vergangenen und kommenden Terminen von heute
const nowLine = () => { const n = new Date(); return `<div class="nowl"><span>${pad(n.getHours())}:${pad(n.getMinutes())}</span></div>`; };
const withNow = (list, today, html) => { if (!today) return list.map(html).join(''); const now = new Date(); let put = false;
  const out = list.map((e) => { let pre = ''; if (!put && !e.allDay && e.s > now) { put = true; pre = nowLine(); } return pre + html(e); });
  if (!put && list.some((e) => !e.allDay)) out.push(nowLine());
  return out.join(''); };
const evTime = (e, wide) => {
  if (e.allDay) { const n = Math.round((e.e - e.s) / 86400000); return `<b>${wide ? 'All day' : 'All day'}</b>${n > 1 ? `<span class="du">${n} days</span>` : ''}`; }
  const t = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
  return wide ? `<b>${t(e.s)}–${t(e.e)}</b><span class="du">${durTxt(e.e - e.s)}</span>` : `<b>${t(e.s)}</b><span class="du">${durTxt(e.e - e.s, true)}</span>`;
};
const level = (p) => p === null ? { c: '#5a5a5a', t: 'No data yet' }
  : p >= 90 ? { c: G, t: 'Super reliable' }
  : p >= 75 ? { c: '#A8CF45', t: 'Reliable' }
  : p >= 50 ? { c: '#E0A84F', t: 'Room to improve' }
  : { c: '#E06B6B', t: 'Unreliable' };
// Avatare (flache SVG-Portraits): maedchen-lang, maedchen-zoepfe, maedchen-dutt, frau, mann
// Auszeichnungen: Titel und Erklärung (Titel, warum man sie hat)
const AWT = {
  trophy: ['Trophy of the month', 'Best rate last month.'],
  crown: ['Crown of the week', 'Best rate last week.'],
  perfect: ['Perfect week', 'Every chore done last week.'],
  bee: ['Busy bee', 'Most done last week.'],
  weekend: ['Weekend hero', 'Everything done at the weekend.'],
  climber: ['Climber', 'Improved the most compared with the week before.'],
  early: ['Early bird', 'Everything done before {t} on at least 4 days.'],
  diamond: ['Diamond streak', 'Everything done {n} days in a row.'],
  milestone: ['Milestone {n}', '{n} chores done in total.'],
  team: ['Family teamwork', 'Yesterday the whole family did everything.'],
  streak: ['{n}-day streak', 'Everything done {n} days in a row.'],
};
// So gewinnt man sie (Regel-Liste in den Personendetails)
const AWR = [
  ['trophy', 'mdi:trophy', '#D9E4F0', 'Trophy of the month', 'Best rate of a whole month (at least 10 chores/days) – handed out on the 1st.'],
  ['crown', 'mdi:crown', '#F5C542', 'Crown of the week', 'Best rate of a week (at least 3 chores/days) – handed out every Monday.'],
  ['perfect', 'mdi:star-four-points', '#C9D1D9', 'Perfect week', 'Every chore of a whole week done (at least 5).'],
  ['bee', 'mdi:bee', '#CD8A4E', 'Busy bee', 'Most done in a week (in fair mode: the most complete days).'],
  ['weekend', 'mdi:shield-star', '#E06B6B', 'Weekend hero', 'Everything done on Saturday and Sunday.'],
  ['climber', 'mdi:trending-up', '#4FD1C5', 'Climber', 'At least 15 percentage points better than the week before.'],
  ['early', 'mdi:weather-sunset-up', '#FFB74D', 'Early bird', 'Everything done before {t} on at least 4 days of the week.'],
  ['diamond', 'mdi:diamond-stone', '#7FDBFF', 'Diamond streak', 'Everything done 30 days in a row.'],
  ['milestone', 'mdi:medal', '#E0A84F', 'Milestone', '100, 500 and 1000 chores done in total.'],
  ['team', 'mdi:account-group', '#C771D6', 'Family teamwork', 'On one day the whole family does everything.'],
];
// Rahmen, Krone und Medaillen – auch von der Belohnungs-Ansicht genutzt
const AWCSS = `.crown{position:absolute;top:-13px;left:0;right:0;margin:0 auto;width:20px;height:18px;justify-content:center;color:#F5C542;filter:drop-shadow(0 1px 1px rgba(0,0,0,.7)) drop-shadow(0 0 4px rgba(245,197,66,.55));z-index:3;display:flex}.crown ha-icon{--mdc-icon-size:20px}
.ring[class*=fr-]{padding:3px;box-sizing:content-box;border-radius:50%;margin:3px}.ring[class*=fr-]::before{content:"";position:absolute;inset:0;border-radius:50%;padding:3px;background:var(--fr);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;z-index:1;pointer-events:none}
.ring[class*=fr-]::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);background-size:250% 100%;mix-blend-mode:overlay;animation:fpshine 4.5s ease-in-out infinite;pointer-events:none;z-index:2}
.ring.fr-platinum{--fr:conic-gradient(from 200deg,#f7fbff,#9fb3cc,#ffffff,#b9c9de,#e9f2ff,#8ea4c0,#f7fbff);filter:drop-shadow(0 0 6px rgba(190,215,255,.45))}
.ring.fr-gold{--fr:conic-gradient(from 200deg,#fff4b8,#d4a017,#fff7cf,#b8860b,#ffe27a,#a87a0a,#fff4b8);filter:drop-shadow(0 0 6px rgba(245,197,66,.45))}
.ring.fr-silver{--fr:conic-gradient(from 200deg,#ffffff,#a8b1bc,#f3f5f8,#8a939e,#e2e6eb,#7d8792,#ffffff)}
.ring.fr-bronze{--fr:conic-gradient(from 200deg,#ffd0a0,#a35a28,#ffdcb8,#8a4a22,#e7a46c,#7a3f1c,#ffd0a0)}
@keyframes fpshine{0%,60%{background-position:150% 0}100%{background-position:-60% 0}}
@media (prefers-reduced-motion:reduce){.ring[class*=fr-]::after{animation:none;display:none}}
.md{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 32% 28%,color-mix(in srgb,var(--mc) 55%,#fff) 0%,var(--mc) 45%,color-mix(in srgb,var(--mc) 60%,#000) 100%);border:1px solid color-mix(in srgb,var(--mc) 70%,#fff);color:#1b1b1b;display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:0 1px 3px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.45)}.md ha-icon{--mdc-icon-size:13px}
.ring{position:relative;width:48px;height:48px;flex:none}.ring .lvb{position:absolute;right:-4px;bottom:-3px;z-index:4;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;border:2px solid var(--fp-bg2,#1e1e1e);background:var(--lc);color:#1b1b1b;font:800 11px/18px -apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.5)}
.ring .lvb.t-ruby{color:#fff}.ring .lvb.glow{animation:fplvglow 1.6s ease-in-out infinite;box-shadow:0 0 10px var(--lc),0 0 18px var(--lc)}.ring .lvb.fade{box-shadow:0 0 calc(var(--g) * 14px) var(--lc)}
@keyframes fplvglow{0%,100%{box-shadow:0 0 6px var(--lc),0 0 10px var(--lc);transform:scale(1)}50%{box-shadow:0 0 14px var(--lc),0 0 26px var(--lc);transform:scale(1.15)}}
@media (prefers-reduced-motion:reduce){.ring .lvb.glow{animation:none}}
.ring .ava{display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;-webkit-mask-image:-webkit-radial-gradient(white,black)}
.ring .ava > span{width:100%!important;height:100%!important;border-radius:50%}.ring .ava svg{display:block}`;
const SKIN = '#F3CDA6', HAIR = '#EBC55A', HAIR2 = '#D4A63B';
const AV_TYPES = ['maedchen-lang', 'maedchen-zoepfe', 'maedchen-dutt', 'frau', 'mann'];
const avatarSvg = (type, bg) => {
  const kid = type.startsWith('maedchen');
  const back = {
    'maedchen-lang': `<path d="M11 19c0-7 4-11.5 9-11.5s9 4.5 9 11.5v10.5c0 1.5-1.5 2.5-3 2.5H14c-1.5 0-3-1-3-2.5z" fill="${HAIR2}"/>`,
    'maedchen-zoepfe': `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/>`,
    'maedchen-dutt': `<circle cx="20" cy="7.2" r="4.4" fill="${HAIR2}"/>`,
    'frau': `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v14c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${HAIR2}"/>`,
    'mann': ''
  }[type] || '';
  const front = {
    'maedchen-lang': `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${HAIR}"/><rect x="23.4" y="11.4" width="4.2" height="1.7" rx=".85" fill="#FF7AA8" transform="rotate(-25 25.5 12.2)"/>`,
    'maedchen-zoepfe': `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${HAIR}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
    'maedchen-dutt': `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${HAIR}"/><rect x="17.1" y="9.4" width="5.8" height="1.7" rx=".85" fill="#7FC8F8"/>`,
    'frau': `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${HAIR}"/><circle cx="12.5" cy="21.6" r=".8" fill="#fff"/><circle cx="27.5" cy="21.6" r=".8" fill="#fff"/>`,
    'mann': `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${HAIR}"/>`
  }[type] || '';
  const body = kid ? `<path d="M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z" fill="#111" opacity=".28"/>` : `<path d="M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z" fill="#111" opacity=".28"/>`;
  const face = `<rect x="17" y="23" width="6" height="7" fill="${SKIN}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${SKIN}"/>`;
  const eyes = `<circle cx="17.1" cy="18.6" r="1.05" fill="#3b2a1e"/><circle cx="22.9" cy="18.6" r="1.05" fill="#3b2a1e"/><path d="M17.6 22q2.4 1.9 4.8 0" stroke="#b0613a" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  const cheeks = type !== 'mann' ? `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/>` : '';
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/>${back}${body}${face}${front}${eyes}${cheeks}</svg>`;
};
const avatarBase = (k, size) => (k.avatar && AV_TYPES.includes(k.avatar))
  ? `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarSvg(k.avatar, k.farbe)}</span>`
  : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size * 0.42)}px;color:#161616;flex:none">${esc((k.name || '?').charAt(0).toUpperCase())}</span>`;
// Avatar-Baukasten: 'av:<alter>.<frisur>.<haarfarbe>.<haut>.<extras>'  alter k=Kind e=Erwachsen o=Grosseltern; extras mit + verbunden, 0 = keine
const AV_HC = { platin: ['#F2E6C2', '#D9C998'], blond: ['#EBC55A', '#D4A63B'], hellbraun: ['#B5814A', '#94663A'], braun: ['#8B5A2B', '#6E4520'], schwarz: ['#3A3330', '#26211F'], rot: ['#D2662F', '#A9491E'],
  grau: ['#CDD1D5', '#A9AEB3'], weiss: ['#F1F1F1', '#D2D2D2'], rosa: ['#F49AC1', '#D9779F'], blau: ['#5FA8E8', '#3F86C6'], lila: ['#A98BE8', '#8566C9'], gruen: ['#5CC98A', '#3FA56B'] };
const AV_SK = { porzellan: '#FBE3CF', hell: '#F3CDA6', pfirsich: '#EDBB8F', mittel: '#E3B48A', oliv: '#C99167', karamell: '#B07A52', dunkel: '#8D5A3B', tief: '#6B4129', espresso: '#4A2C1C' };
const AV_HB = {
  long: (c) => `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v13c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${c}"/>`,
  zoepfe: (c) => `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/>`,
  dutt: (c) => `<circle cx="20" cy="7.2" r="4.4" fill="${c}"/>`,
  bob: (c) => `<path d="M10.8 19c0-7 4-11.5 9.2-11.5s9.2 4.5 9.2 11.5v6.5c0 1.2-1 2-2.2 2H13c-1.2 0-2.2-.8-2.2-2z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="11.5" cy="15" r="3.6"/><circle cx="28.5" cy="15" r="3.6"/><circle cx="10.8" cy="21" r="3.4"/><circle cx="29.2" cy="21" r="3.4"/><circle cx="12" cy="26.5" r="3"/><circle cx="28" cy="26.5" r="3"/></g>`,
  pferd: (c) => `<path d="M26.5 10.5c4.5.5 6.5 5 6 10.5-.4 4.2-2.6 6.4-4.2 7 1-3.4 1.2-7.6-.2-11z" fill="${c}"/>`
};
const AV_HF = {
  long: (c) => `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${c}"/>`,
  pony: (c) => `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${c}"/>`,
  zoepfe: (c) => `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${c}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
  dutt: (c) => `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${c}"/>`,
  kurz: (c) => `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${c}"/>`,
  seite: (c) => `<path d="M12 18c-.4-6.4 3.4-10.4 8-10.4 4.8 0 8.4 3.6 8 9.6-2.4-2.6-6.6-4.6-12.2-4.2-1.4.8-3 2.8-3.8 5z" fill="${c}"/>`,
  stachel: (c) => `<path d="M11.9 17.6l.3-5.2 1.9 1.3.8-4.4 2.1 2.3 1.5-4.6 1.8 4.1 2.2-3.8 1.2 4.4 2.5-2.5.3 4.8 1.6.6c.4 1.2.3 2.2 0 3-1.3-2.4-3.6-3.9-8.2-3.9s-6.8 1.5-8 3.9z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="14" cy="11.2" r="3.4"/><circle cx="20" cy="9.2" r="3.6"/><circle cx="26" cy="11.2" r="3.4"/><circle cx="12" cy="15.2" r="2.8"/><circle cx="28" cy="15.2" r="2.8"/></g>`,
  glatze: (c) => `<path d="M12.2 20.5c-.9-2.2-.5-4.6.8-5.6.5 1.9.6 3.6-.8 5.6zM27.8 20.5c.9-2.2.5-4.6-.8-5.6-.5 1.9-.6 3.6.8 5.6z" fill="${c}"/>`
};
const AV_ST = { long: ['long', 'long'], ponylang: ['long', 'pony'], zoepfe: ['zoepfe', 'zoepfe'], dutt: ['dutt', 'dutt'], bob: ['bob', 'pony'], locken: ['locken', 'locken'], pferd: ['pferd', 'seite'], kurz: [null, 'kurz'], seite: [null, 'seite'], stachel: [null, 'stachel'], lockenkurz: [null, 'locken'], glatze: [null, 'glatze'] };
const AV_MASK = (c) => `<path d="M12.3 16.6c2.2-1 5-1 7.7.2 2.7-1.2 5.5-1.2 7.7-.2-.2 2.4-1.6 4-3.6 4-1.6 0-2.8-.8-4.1-2-1.3 1.2-2.5 2-4.1 2-2 0-3.4-1.6-3.6-4z" fill="${c}"/><circle cx="16.8" cy="18.2" r="1.25" fill="#fff"/><circle cx="23.2" cy="18.2" r="1.25" fill="#fff"/><circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>`;
const AV_ACC = {
  sommersprossen: () => `<g fill="#B5774F" opacity=".7"><circle cx="15.6" cy="20.5" r=".38"/><circle cx="16.7" cy="21.3" r=".34"/><circle cx="15.1" cy="21.7" r=".32"/><circle cx="24.4" cy="20.5" r=".38"/><circle cx="23.3" cy="21.3" r=".34"/><circle cx="24.9" cy="21.7" r=".32"/></g>`,
  sonnenbrille: () => `<g fill="#1d1d24"><rect x="14.3" y="16.9" width="5.1" height="3.6" rx="1.5"/><rect x="20.6" y="16.9" width="5.1" height="3.6" rx="1.5"/></g><path d="M19.4 18h1.2M12.5 17.5l1.8.3M27.5 17.5l-1.8.3" stroke="#1d1d24" stroke-width=".8"/><path d="M15.2 17.7l1.4-.1M21.5 17.7l1.4-.1" stroke="#fff" stroke-width=".5" opacity=".6"/>`,
  stirnband: () => `<path d="M12.1 13.8c4.9-1.9 10.9-1.9 15.8 0l-.3 2.1c-4.9-1.7-10.3-1.7-15.2 0z" fill="#4FD1C5"/><path d="M12.4 14.9c4.7-1.5 10.5-1.5 15.2 0" stroke="#fff" stroke-width=".4" opacity=".7" fill="none"/>`,
  blitz: () => AV_MASK('#F5C542').replace('<circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>', '<circle cx="16.9" cy="18.3" r=".6" fill="#1d3f6e"/><circle cx="23.1" cy="18.3" r=".6" fill="#1d3f6e"/>'),
  nacht: () => AV_MASK('#4B3B8F'),
  ninja: () => `<path d="M11.4 16.8c0-6 3.8-9.8 8.6-9.8s8.6 3.8 8.6 9.8z" fill="#2B2F3A"/><path d="M12.1 20.5h15.8c-.4 4.1-3.6 6.6-7.9 6.6s-7.5-2.5-7.9-6.6z" fill="#2B2F3A"/><rect x="11.5" y="13.9" width="17" height="1.7" fill="#D63C3C"/><path d="M28.3 14.2l3.9-1.6-.7 2.3 2.1.9-4.8.6z" fill="#D63C3C"/>`,
  ritter: () => `<path d="M10.8 22.6c-.7-9.2 3.6-14.8 9.2-14.8s9.9 5.6 9.2 14.8l-2.5.5c.3-1.9.3-3.4.1-4.5H13.2c-.2 1.1-.2 2.6.1 4.5z" fill="#B9C3CE"/><path d="M13.2 18.6h13.6" stroke="#8A96A3" stroke-width=".9"/><path d="M20 8v6.4" stroke="#8A96A3" stroke-width=".9"/><path d="M19 4.4c2.6.4 4 1.9 4 3.6h-3.6z" fill="#D63C3C"/>`,
  brille: () => `<g fill="none" stroke="#2b2b2b" stroke-width=".9"><circle cx="17.1" cy="18.6" r="2.4"/><circle cx="22.9" cy="18.6" r="2.4"/><path d="M19.5 18.4h1"/></g>`,
  bart: (h) => `<path d="M12.8 20.6c.4 4.4 3.4 7.2 7.2 7.2s6.8-2.8 7.2-7.2c-1.4 1.6-3.2 2.4-4.6 2-.8-.3-1.6-.5-2.6-.5s-1.8.2-2.6.5c-1.4.4-3.2-.4-4.6-2z" fill="${h}"/><path d="M17.6 22.6q2.4 1.6 4.8 0" stroke="#7a3b22" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
  held: () => AV_MASK('#D63C3C'),
  astro: () => `<circle cx="20" cy="18.6" r="11.6" fill="rgba(170,215,255,.22)" stroke="#E8EEF5" stroke-width="2.2"/><path d="M27.5 9.8l2.6-3.4" stroke="#E8EEF5" stroke-width="1.2"/><circle cx="30.4" cy="6.1" r="1.2" fill="#E06B6B"/>`,
  pirat: () => `<path d="M11.4 15.6c.6-5.2 4-8.4 8.6-8.4s8 3.2 8.6 8.4c-2.6-1.4-5.4-2-8.6-2s-6 .6-8.6 2z" fill="#C0392B"/><circle cx="14.5" cy="11.5" r=".8" fill="#fff"/><circle cx="19" cy="9.8" r=".8" fill="#fff"/><circle cx="24" cy="11" r=".8" fill="#fff"/><path d="M12.4 15.8l15.4 4.8" stroke="#1e1e1e" stroke-width=".8"/><ellipse cx="22.9" cy="18.8" rx="2.1" ry="1.9" fill="#1e1e1e"/>`,
  zauber: () => `<path d="M8.5 13.8c4.5-1.4 18.5-1.4 23 0-1.6-.6-3.4-1.6-4.6-1.8L21.2 1.2l-5.6 10.8c-1.4.2-4.2 1-7.1 1.8z" fill="#5B4FC4"/><circle cx="18.2" cy="8.4" r=".8" fill="#F5C542"/><circle cx="22.4" cy="10.6" r=".6" fill="#F5C542"/><circle cx="20.6" cy="5.4" r=".5" fill="#F5C542"/>`,
  krone: () => `<path d="M12.6 10.8l1.4-5.4 3.1 3.3L20 3.6l2.9 5.1 3.1-3.3 1.4 5.4z" fill="#F5C542"/><circle cx="20" cy="7.8" r=".95" fill="#E06B6B"/><circle cx="15.6" cy="9.3" r=".6" fill="#4FA3E0"/><circle cx="24.4" cy="9.3" r=".6" fill="#4FA3E0"/>`,
  katze: () => `<path d="M11.2 11.6l1.2-6.6 4.6 4.4zM28.8 11.6l-1.2-6.6-4.6 4.4z" fill="#3a3a3a"/><path d="M12.5 9.9l.6-3.2 2.1 2.1zM27.5 9.9l-.6-3.2-2.1 2.1z" fill="#F29A9A"/><path d="M13.4 21.2l-3.2-.6M13.4 22.2l-3.2.4M26.6 21.2l3.2-.6M26.6 22.2l3.2.4" stroke="#555" stroke-width=".5"/><circle cx="20" cy="20.6" r=".7" fill="#E07A8A"/>`,
  einhorn: () => `<path d="M18.5 9.4L20 .9l1.5 8.5z" fill="#F5C542"/><path d="M18.9 7.6l2.3-.7M19.3 5.2l1.7-.5M19.7 3l1-.3" stroke="#D99A2B" stroke-width=".55"/><circle cx="14.6" cy="9.6" r="1.5" fill="#FF7AA8"/><circle cx="25.4" cy="9.6" r="1.5" fill="#B69CF2"/>`,
  cap: () => `<path d="M11.6 15.2c.4-5.2 4-8.2 8.4-8.2s8 3 8.4 8.2z" fill="#3E7CC9"/><path d="M19 14.4c4.2 0 8.4.4 12.2 1.6-.6.9-2.1 1.1-3.9 1-2.8-.4-5.5-.6-8.3-.6z" fill="#2F64A6"/><circle cx="20" cy="7.4" r=".9" fill="#2F64A6"/>`,
  kopfhoerer: () => `<path d="M10.4 19.5c0-6.4 4.2-10.6 9.6-10.6s9.6 4.2 9.6 10.6" fill="none" stroke="#333" stroke-width="1.7"/><rect x="8.6" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/><rect x="27.8" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/>`,
  schleife: () => `<path d="M24.6 9.6l3.8-2.2v4.4zM24.6 9.6l-3.8-2.2v4.4z" fill="#FF7AA8"/><circle cx="24.6" cy="9.6" r="1.1" fill="#E0568A"/>`
};
// Gruppen: pro Gruppe höchstens eins; Kostüme schliessen Kopfbedeckungen / Brillen / Kopfhörer aus, damit jede Kombination gut aussieht
const AV_COST = ['held', 'blitz', 'nacht', 'ninja', 'ritter', 'astro', 'pirat', 'zauber'];
const AV_HEAD = ['cap', 'krone', 'katze', 'einhorn', 'schleife', 'stirnband'];
const AV_EYES = ['brille', 'sonnenbrille'];
const AV_FACE = ['sommersprossen', 'bart', 'kopfhoerer'];
const AV_ORDER = ['sommersprossen', 'bart', 'brille', 'sonnenbrille', 'held', 'blitz', 'nacht', 'ninja', 'kopfhoerer', 'stirnband', 'schleife', 'cap', 'katze', 'einhorn', 'krone', 'pirat', 'zauber', 'ritter', 'astro'];
const AV_HAT_COST = ['ninja', 'ritter', 'astro', 'pirat', 'zauber'];
const AV_MASK_COST = ['held', 'blitz', 'nacht', 'ninja'];
const AV_BODY = { held: ['#C0392B', '<path d="M20 32.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#F5C542"/>'],
  blitz: ['#2F64A6', '<path d="M20.9 31.6l-2.7 3.7h1.9l-1 3.4 3.1-4.1h-1.9l1.2-3z" fill="#F5C542"/>'],
  nacht: ['#2A2340', '<path d="M21.4 32.3a2.7 2.7 0 1 0 .9 5 2.2 2.2 0 1 1-.9-5z" fill="#E8E3FF"/>'],
  ninja: ['#2B2F3A', '<path d="M14 33.2l12 4" stroke="#D63C3C" stroke-width="1.4"/>'], ritter: ['#9AA5B1', '<path d="M20 31.8v6.4M17 34.6h6" stroke="#D63C3C" stroke-width="1.3"/>'],
  astro: ['#E8EEF5', '<rect x="17.6" y="33" width="4.8" height="3" rx=".6" fill="#4FA3E0"/>'], zauber: ['#5B4FC4', '<circle cx="18" cy="34" r=".6" fill="#F5C542"/><circle cx="22.2" cy="36" r=".5" fill="#F5C542"/>'],
  pirat: ['#F4F4F4', '<path d="M12 33.6h16M11 36.2h18M10.4 38.8h19.2" stroke="#2F64A6" stroke-width="1.1"/>'] };
// gültige, widerspruchsfreie Extras in Zeichen-Reihenfolge
const avNorm = (age, list) => {
  let ex = (list || []).filter((a) => AV_ORDER.includes(a));
  const one = (grp) => { const hit = ex.filter((a) => grp.includes(a)); if (hit.length > 1) ex = ex.filter((a) => !grp.includes(a) || a === hit[hit.length - 1]); };
  one(AV_COST); one(AV_HEAD); one(AV_EYES);
  const c = ex.find((a) => AV_COST.includes(a));
  if (c && AV_HAT_COST.includes(c)) ex = ex.filter((a) => !AV_HEAD.includes(a));
  if (c && AV_MASK_COST.includes(c)) ex = ex.filter((a) => !AV_EYES.includes(a));
  if (c === 'ninja') ex = ex.filter((a) => a !== 'bart' && a !== 'sommersprossen');
  if (c === 'astro' || c === 'ritter') ex = ex.filter((a) => a !== 'kopfhoerer');
  if (age === 'k') ex = ex.filter((a) => a !== 'bart');
  return AV_ORDER.filter((a) => ex.includes(a));
};
const avatarGen = (code, bg) => {
  const [age0, st0, hc, sk, acc] = String(code).split('.');
  const age = ['k', 'e', 'o'].includes(age0) ? age0 : 'k';
  const st = st0 === 'glatze' && age === 'k' ? 'kurz' : st0;
  const [h1, h2] = AV_HC[hc] || AV_HC.blond; const skin = AV_SK[sk] || AV_SK.hell;
  const kid = age === 'k';
  const ex = avNorm(age, acc && acc !== '0' ? acc.split('+') : []);
  const cost = ex.find((a) => AV_COST.includes(a));
  let [bk, fr] = AV_ST[st] || [null, 'kurz'];
  if (cost === 'ninja' || cost === 'ritter') bk = null;
  const body = kid ? 'M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z' : 'M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z';
  let s = `<rect width="40" height="40" fill="${bg}"/>`;
  if (bk) s += AV_HB[bk](h2);
  s += cost && AV_BODY[cost] ? `<path d="${body}" fill="${AV_BODY[cost][0]}"/>${AV_BODY[cost][1]}` : `<path d="${body}" fill="#111" opacity=".28"/>`;
  s += `<rect x="17" y="23" width="6" height="7" fill="${skin}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${skin}"/>`;
  if (fr && cost !== 'ninja') s += AV_HF[fr](h1);
  if (age === 'o') s += '<path d="M14.6 15.4h1.8M23.6 15.4h1.8M15.4 21.6l-.8.6M24.6 21.6l.8.6" stroke="#9a6a4a" stroke-width=".5"/>';
  const dark = ['tief', 'espresso'].includes(sk);
  s += `<circle cx="17.1" cy="18.6" r="1.05" fill="${dark ? '#1a110b' : '#3b2a1e'}"/><circle cx="22.9" cy="18.6" r="1.05" fill="${dark ? '#1a110b' : '#3b2a1e'}"/>`;
  if (!ex.includes('bart')) s += `<path d="M17.6 22q2.4 1.9 4.8 0" stroke="${dark ? '#2a1610' : '#b0613a'}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  if (kid || ['long', 'ponylang', 'zoepfe', 'dutt', 'bob', 'locken', 'pferd'].includes(st)) s += `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity="${dark ? '.3' : '.55'}"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity="${dark ? '.3' : '.55'}"/>`;
  ex.forEach((a) => { if (AV_ACC[a]) s += AV_ACC[a](h2); });
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
};
// Termin-Zeit kurz: "14:30–15:20" bzw. schmal "14:30–15"
const evRange = (e, short) => {
  if (e.allDay) return short ? 'all day' : 'all day';
  const t = (x) => (short && !x.getMinutes() ? String(x.getHours()) : pad(x.getHours()) + ':' + pad(x.getMinutes()));
  return `${t(e.s)}–${t(e.e)}`;
};
// Bild einer Person: k.bild = 'av:<code>' (Baukasten), 'svg:<portrait>' oder 'mdi:<icon>' (aus den Einstellungen), sonst k.avatar aus der Kartenkonfig
const avatarHtml = (k, size) => {
  const b = k.bild || '';
  if (b.startsWith('img:')) return `<img src="${esc(b.slice(4))}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:none;display:inline-block">`;
  if (b.startsWith('av2:') && window.FPAV) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${window.FPAV.svg(b, k.farbe)}</span>`;
  if (b.startsWith('av:')) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarGen(b.slice(3), k.farbe)}</span>`;
  if (b.startsWith('mdi:')) return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;flex:none;color:#161616"><ha-icon icon="${esc(b)}" style="--mdc-icon-size:${Math.round(size * 0.6)}px"></ha-icon></span>`;
  if (b.startsWith('svg:')) return avatarBase({ ...k, avatar: b.slice(4) }, size);
  return avatarBase(k, size);
};
const daysLabel = (t) => {
  const s = [...(t || [])].sort((a, b) => a - b).join(',');
  if (s === '1,2,3,4,5,6,7') return 'Daily';
  if (s === '1,2,3,4,5') return 'Weekdays';
  if (s === '6,7') return 'Weekend';
  return (t || []).length ? [...t].sort((a, b) => a - b).map((d) => WD[d - 1]).join(', ') : 'Never';
};

class FpBase extends HTMLElement {
  setConfig(config) {
    this._cfg = this._normalize(config || {});
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._bind(); }
    this._teardown();
    this._data = {};
    this._render(true);
    this._ensure();
  }
  set hass(h) { this._hass = h; this._ensure(); }
  get hass() { return this._hass; }
  connectedCallback() { this._ensure(); }
  disconnectedCallback() { this._teardown(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', min_rows: 6 }; }
  _teardown() {
    (this._unsubs || []).forEach((p) => p.then((u) => u && u()).catch(() => {}));
    this._unsubs = null;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
  _ensure() {
    if (!this._hass || !this._cfg || !this.isConnected || this._unsubs) return;
    this._unsubs = this._lists().map(([key, ent]) => this._hass.connection.subscribeMessage(
      (m) => { this._data[key] = m.items || []; this._render(); },
      { type: 'todo/item/subscribe', entity_id: ent }
    ).catch((e) => { this._err = `${ent}: ${(e && e.message) || e}`; this._render(); }));
    if (this._started) this._started();
  }
  _kids() {
    const list = (this._cfg.kinder || []).map((k) => (typeof k === 'string' ? { name: k } : { ...k }));
    const names = new Set(list.map((k) => k.name));
    for (const p of this._data.plan || []) {
      for (const k of Object.keys(planZ(parseDesc(p.description)))) { if (k && !names.has(k)) { names.add(k); list.push({ name: k }); } }
    }
    const ps = this._settingsP();
    return list.map((k, i) => { const o = ps[k.name] || {}; return { ...k, ...(o.bild ? { bild: o.bild } : {}), alias: [...new Set([...(k.alias || []), ...(o.alias || [])])], farbe: o.farbe || k.farbe || PALETTE[i % PALETTE.length] }; });
  }
  _settingsItem() { return ((this._data && this._data.settings) || []).find((i) => i.summary === 'Personen') || null; }
  _settingsP() { const it = this._settingsItem(); const m = it ? parseDesc(it.description) : {}; return (m && m.p) || {}; }
  _call(domain, service, data, entity) {
    return this._hass.callService(domain, service, data, entity ? { entity_id: entity } : undefined);
  }
}

/* ============================ WOCHENPLANER ============================ */
class LoxWochenplanerCard extends FpBase {
  _normalize(c) {
    return { plan: 'todo.amtli_plan', heute: 'todo.amtli_heute', verlauf: 'todo.amtli_verlauf', einstellungen: 'todo.familienplaner_einstellungen', kalender: [], kinder: [], tage_zuverlaessigkeit: 30, titel: 'Familienplaner', ...c };
  }
  _lists() { return [['plan', this._cfg.plan], ['heute', this._cfg.heute], ['verlauf', this._cfg.verlauf], ['settings', this._cfg.einstellungen]]; }
  _bind() {
    this._week = 0; this._events = []; this._tick = 0;
    try { this._mode = localStorage.getItem('fp_mode') || 'alle'; } catch (e) { this._mode = 'alle'; }
    this.shadowRoot.addEventListener('click', (e) => this._onClick(e));
    // swipe left/right: next/previous week (phone: next/previous day)
    this.shadowRoot.addEventListener('touchstart', (e) => { const t = e.touches[0]; this._sw = t ? [t.clientX, t.clientY] : null; }, { passive: true });
    this.shadowRoot.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0]; if (!this._sw || !t || this._detail) return;
      const dx = t.clientX - this._sw[0], dy = t.clientY - this._sw[1]; this._sw = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) this._go(dx < 0 ? 1 : -1);
    }, { passive: true });
    this._onResize = () => { const ph = this._isPhone(); if (ph !== this._phoneOn) this._render(); };
    window.addEventListener('resize', this._onResize);
  }
  _isPhone() { const w = this.getBoundingClientRect().width || window.innerWidth; return w > 0 && w < 700; }
  // phone: one day at a time; tablet/desktop: one week at a time. Returns to today after the idle time.
  _go(step) {
    this._focus = null;
    if (this._phoneOn) {
      this._dayOff = step === 0 ? 0 : (this._dayOff || 0) + step;
      const t = startOfDay(fpDay()); const sel = addDays(t, this._dayOff);
      const wk = Math.round((addDays(sel, 1 - isoWd(sel)) - addDays(t, 1 - isoWd(t))) / (7 * 86400000));
      if (wk !== this._week) { this._week = wk; this._events = []; this._fetchEvents(); }
    } else {
      this._week = step === 0 ? 0 : this._week + step; this._dayOff = 0; this._events = []; this._fetchEvents();
    }
    clearTimeout(this._navT);
    if (this._week || this._dayOff) this._navT = setTimeout(() => { this._week = 0; this._dayOff = 0; this._focus = null; this._events = []; this._fetchEvents(); this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
    this._render();
  }
  _started() {
    this._lastDay = ymd(fpDay());
    this._fetchEvents();
    this._timer = setInterval(() => {
      this._tick++;
      const t = ymd(fpDay());
      if (t !== this._lastDay || this._tick % 20 === 0) { this._lastDay = t; this._fetchEvents(); }
      this._render();
    }, 30000);
  }
  _weekStart() { const t = startOfDay(fpDay()); return addDays(addDays(t, 1 - isoWd(t)), this._week * 7); }
  _calendars() {
    return (this._cfg.kalender || []).map((c) => (typeof c === 'string' ? { entity: c } : { ...c })).map((c, i) => {
      const st = this._hass && this._hass.states[c.entity];
      // Farbe des Kalenders = Farbe der Person, der er gehört
      const pk = c.person ? this._kids().find((x) => x.name === c.person) : null;
      return { ...c, farbe: (pk && pk.farbe) || c.farbe || CALCOL[i % CALCOL.length], name: c.name || (st ? st.attributes.friendly_name : c.entity) };
    });
  }
  async _fetchEvents() {
    const cals = this._calendars();
    if (!cals.length || !this._hass) { this._events = []; return; }
    const ws = this._weekStart(); const we = addDays(ws, 7); const res = [];
    await Promise.all(cals.map(async (c) => {
      try {
        const ev = await this._hass.callApi('GET', `calendars/${c.entity}?start=${encodeURIComponent(ws.toISOString())}&end=${encodeURIComponent(we.toISOString())}`);
        for (const e of ev || []) {
          const allDay = !!(e.start && e.start.date && !e.start.dateTime);
          const s = allDay ? new Date(e.start.date + 'T00:00:00') : new Date(e.start.dateTime || e.start);
          const en = allDay ? new Date(e.end.date + 'T00:00:00') : new Date((e.end && (e.end.dateTime || e.end)) || s);
          res.push({ title: e.summary || '', loc: e.location || '', s, e: en > s ? en : new Date(s.getTime() + 60000), allDay, c });
        }
      } catch (err) { /* Kalender nicht erreichbar */ }
    }));
    this._events = res; this._render();
  }
  _syncCal() {
    const ents = this._calendars().map((c) => c.entity);
    if (!ents.length || this._syncing || !this._hass) return;
    this._syncing = true; this._render();
    this._call('homeassistant', 'update_entity', { entity_id: ents }).catch(() => {})
      .finally(() => setTimeout(() => { this._syncing = false; this._fetchEvents(); }, 2500));
  }
  _history() {
    const h = {};
    for (const it of this._data.verlauf || []) {
      const m = parseDesc(it.description);
      const day = h[it.summary] || (h[it.summary] = { s: {}, x: [] });
      for (const [k, done, tot] of m.s || []) { const c = day.s[k] || [0, 0]; day.s[k] = [c[0] + done, c[1] + tot]; }
      for (const x of m.x || []) day.x.push(x);
    }
    return h;
  }
  _stats(kid, h, today, todayDone, todayTot) {
    // [erledigt, total] der letzten n Tage + heute bereits erledigte
    const sum = (n) => { let d = todayDone, t = todayDone; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s) { d += s[0]; t += s[1]; } } return [d, t]; };
    const w = sum(7), m = sum(30), all = sum(this._cfg.tage_zuverlaessigkeit);
    const done = all[0], tot = all[1];
    // fair: every day weighs the same – [sum of daily rates, days]; today only counts once it is complete
    const fsum = (n) => { let f = todayTot && todayDone === todayTot ? 1 : 0, c = f; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s && s[1]) { f += s[0] / s[1]; c++; } } return [Math.round(f * 1000) / 1000, c]; };
    const fw = fsum(7), fm = fsum(30), fall = fsum(this._cfg.tage_zuverlaessigkeit);
    let streak = todayTot && todayDone === todayTot ? 1 : 0;
    for (let i = 1; i <= 120; i++) {
      const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid];
      if (!s || !s[1]) continue;
      if (s[0] === s[1]) streak++; else break;
    }
    const pct = this._cfg.fair ? (fall[1] ? Math.round((fall[0] / fall[1]) * 100) : 100) : (tot ? Math.round((done / tot) * 100) : 100);
    return { pct, start: !tot, streak, w, m, fw, fm };
  }
  // Auszeichnungen kommen vom Server (vergeben jeden Montag / am Monatsersten / beim Erreichen)
  // level badge on the avatar; after a level up it glows until it was tapped (each tap plays the tier's effect)
  _lvState(name) {
    const s = this.fpStore && this.fpStore.snap; if (!s) return null;
    const p = (s.persons || []).find((x) => x.name === name); if (!p) return null;
    const pt = (s.points || {})[p.id]; if (!pt || !pt.level) return null;
    const up = pt.up && pt.up.level === pt.level && (Date.now() - Date.parse(pt.up.ts || '')) < 14 * 864e5 ? pt.up : null;
    const key = `fp_lv_${s.entry_id}_${p.id}_${pt.level}_${up ? up.ts : ''}`;
    let taps = 0; try { taps = Number(localStorage.getItem(key)) || 0; } catch (e) { taps = (this._lvMem || {})[key] || 0; }
    return { p, pt, up, key, taps };
  }
  _lvBadge(name) {
    const v = this._lvState(name); if (!v) return '';
    const g = v.up && v.taps < 20 ? (v.taps < 5 ? 'glow' : 'fade') : '';
    return `<button class="lvb t-${v.pt.tier} ${g}" data-lvtap="${esc(name)}" style="--lc:${v.pt.tier_color};--g:${g === 'fade' ? (20 - v.taps) / 15 : 0}" title="Level ${v.pt.level} · ${esc(v.pt.name)}">${v.pt.level}</button>`;
  }
  _lvTap(name, el) {
    const v = this._lvState(name); if (!v) return;
    const r = el.getBoundingClientRect();
    if (window.FPCONFETTI && window.FPCONFETTI.burst) window.FPCONFETTI.burst(r.left + r.width / 2, r.top + r.height / 2, v.pt.tier, v.pt.tier_color, v.up && v.taps < 20 ? 1 : 0.5);
    if (v.up && v.taps < 20) { try { localStorage.setItem(v.key, String(v.taps + 1)); } catch (e) { this._lvMem = { ...(this._lvMem || {}), [v.key]: v.taps + 1 }; } this._render(); }
  }
  _srvAwards(kids) {
    const s = this.fpStore && this.fpStore.snap; const A = {}; const F = {}; kids.forEach((k) => { A[k.name] = []; });
    if (!s) return { A, F };
    const byName = Object.fromEntries((s.persons || []).map((p) => [p.name, p.id]));
    const et = (s.settings || {}).early_time || '12:00';
    kids.forEach((k) => {
      const r = (s.awards || {})[byName[k.name]] || { list: [] }; F[k.name] = r.frame || '';
      A[k.name] = (r.list || []).map((a) => { const tx = AWT[a.id] || [a.id, '']; const f = (x) => x.replace(/\{n\}/g, a.value == null ? '' : a.value).replace('{t}', et);
        return { id: a.id, icon: a.icon, c: a.color, t: f(tx[0]), why: f(tx[1]) }; });
    });
    return { A, F };
  }
  _detailHtml(kids, pre, awards, frames) {
    const k = kids.find((x) => x.name === this._detail); if (!k) return '';
    const s = pre[k.name]; const lv = level(s.pct); const aw = awards[k.name] || [];
    const snap = (this.fpStore && this.fpStore.snap) || {}; const pts = snap.award_points || {}; const et = (snap.settings || {}).early_time || '12:00';
    const on = ((snap.award_settings || {}).items) || {};
    const q = (x) => (x[1] ? `${x[0]} / ${x[1]} <small>(${Math.round((x[0] / x[1]) * 100)} %)</small>` : '<small>none yet</small>');
    const holders = (id) => kids.filter((x) => (awards[x.name] || []).some((a) => a.id === id)).map((x) => x.name).join(', ') || 'nobody yet';
    return `<div class="ovl" data-close><div class="pnl" data-keep>
      <div class="ph"><div class="ring bigr${frames[k.name] ? ' fr-' + frames[k.name] : ''}"><span class="ava">${avatarHtml(k, 64)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) : ''}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}<span class="rib" style="--rc:${lv.c}">${s.pct}%</span></div>
        <div class="phn"><div class="pn2">${esc(k.name)}</div><div class="lv" style="color:${lv.c}">${lv.t} · Reliability ${s.pct} %</div></div>
        <button class="nb" data-x><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="kp"><div><span>Last 7 days</span><b>${q(s.w)}</b></div><div><span>Last 30 days</span><b>${q(s.m)}</b></div><div><span>Streak</span><b>${s.streak} ${s.streak === 1 ? 'day' : 'days'}</b></div></div>
      <div class="sec2">Awards</div>
      ${aw.length ? aw.map((a) => `<div class="aw"><span class="md lg" style="--mc:${a.c}"><ha-icon icon="${a.icon}"></ha-icon></span><div><b>${esc(a.t)}</b><div>${esc(a.why)}</div></div></div>`).join('') : '<div class="aw0">No award yet – do your chores and win the crown!</div>'}
      <div class="sec2">How to earn awards</div>
      ${AWR.filter(([id]) => !on[id] || on[id].on !== false).map(([id, ic, c, t, d]) => `<div class="rl2"><span class="md" style="--mc:${c}"><ha-icon icon="${ic}"></ha-icon></span><b>${t}${pts[id] ? ` <small class="pp">+${Number(pts[id])}</small>` : ''}</b><span>${d.replace('{t}', esc(et))}</span><em>now: ${esc(holders(id))}</em></div>`).join('')}
    </div></div>`;
  }
  _planFor(kid, date) {
    if (((this._cfg.abwesend || {})[kid] || []).includes(ymd(date))) return [];
    const wd = isoWd(date);
    return (this._data.plan || []).map((p) => ({ t: p.summary, m: parseDesc(p.description) }))
      .filter((p) => (planZ(p.m)[kid] || []).includes(wd) && planActive(p.m, kid, wd, date)).map((p) => { const f = (p.m.f || {})[`${kid}|${wd}`] || 1; return f > 1 ? `${p.t} (until ${WD[(wd - 1 + f - 1) % 7]})` : p.t; }).sort((a, b) => a.localeCompare(b, 'de'));
  }
  _onClick(e) {
    if (e.target.closest('[data-x]')) { this._detail = null; this._render(); return; }
    if (e.target.closest('[data-keep]')) return;
    if (e.target.closest('[data-close]')) { this._detail = null; this._render(); return; }
    const tdb = e.target.closest('[data-todoid]');
    if (tdb && this.fpStore) {
      const s = this.fpStore.snap || {}; const t = (s.todos || []).find((x) => x.id === tdb.dataset.todoid); if (!t) return;
      const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
      if (!t.done && confirm && this._tdArm !== t.id) { this._tdArm = t.id; clearTimeout(this._tdT); this._tdT = setTimeout(() => { this._tdArm = null; this._render(); }, 4000); this._render(); return; }
      this._tdArm = null; if (!t.done) this._pop = { uid: t.id, t: Date.now() };
      this.fpStore.ws('family_planer/todo/set', { todo_id: t.id, done: !t.done }).catch(() => this._render()); return;
    }
    const lt = e.target.closest('[data-lvtap]'); if (lt) { this._lvTap(lt.dataset.lvtap, lt); return; }
    const pp = e.target.closest('[data-person]');
    if (pp) { this._detail = pp.dataset.person; clearTimeout(this._dT); this._dT = setTimeout(() => { this._detail = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 30) * 1000); this._render(); return; }
    const b = e.target.closest('.btn');
    if (b && this._hass) {
      const done = b.classList.contains('done');
      b.classList.toggle('done');
      // little check animation only for the chore that was just ticked off
      if (!done) { this._pop = { uid: b.dataset.uid, t: Date.now() }; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      this._call('todo', 'update_item', { item: b.dataset.uid, status: done ? 'needs_action' : 'completed' }, this._cfg.heute).catch(() => this._render());
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { fpNavigate(go.dataset.go); return; }
    const md = e.target.closest('[data-mode]');
    if (md) { this._mode = md.dataset.mode; try { localStorage.setItem('fp_mode', this._mode); } catch (er) { /* ignorieren */ } this._render(); return; }
    if (e.target.closest('[data-sync]')) { this._syncCal(); return; }
    if (e.target.closest('[data-todos]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true })); return; }
    if (e.target.closest('[data-todoadd]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true, detail: { add: true } })); return; }
    const fc = e.target.closest('[data-focus]');
    if (fc) {
      const v = fc.dataset.focus; this._focus = v === ymd(fpDay()) ? null : v;
      clearTimeout(this._fT); if (this._focus) this._fT = setTimeout(() => { this._focus = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
      this._render(); return;
    }
    const n = e.target.closest('[data-nav]');
    if (n) this._go(Number(n.dataset.nav));
  }
  _render() {
    if (!this.shadowRoot || !this._cfg) return;
    const now = new Date(); const today = startOfDay(fpDay()); const tStr = ymd(today);
    const phone = this._isPhone(); this._phoneOn = phone;
    const ws = this._weekStart(); const sel = addDays(today, phone ? (this._dayOff || 0) : 0);
    const days = phone ? [sel] : [...Array(7)].map((_, i) => addDays(ws, i));
    const kids = this._kids(); const h = this._history(); const cals = this._calendars();
    // Termine immer mit der aktuellen Farbe der Kalender-Besitzerin/des Besitzers anzeigen
    this._events.forEach((e) => { const cc = cals.find((x) => x.entity === e.c.entity); if (cc) e.c = cc; });
    // Termin-Zuordnung: Name im Titel (z. B. "Lea Turnen") -> bei dieser Person; sonst beim Kalender-Besitzer
    const nameRe = (n) => new RegExp('(^|[^\\p{L}])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?(?![\\p{L}])', 'iu');
    const kRes = kids.flatMap((x) => [x.name, ...(x.alias || [])].map((a) => [x.name, nameRe(a)]));
    const evWho = new Map(this._events.map((e) => {
      if (e.c.schule) return [e, e.c.person ? [e.c.person] : []];
      const hit = this._cfg.termine_nach_namen === false ? [] : [...new Set(kRes.filter(([, re]) => re.test(e.title)).map(([n]) => n))];
      const own = e.c.person ? [e.c.person] : [];
      return [e, hit.length ? (this._cfg.auch_beim_besitzer ? [...new Set([...hit, ...own])] : hit) : own];
    }));
    const alle = (this._data.heute || []).map((i) => ({ ...i, m: parseDesc(i.description) }));
    const heute = alle.filter((i) => (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= tStr);
    const focus = phone ? ymd(sel) : (this._focus && days.some((d) => ymd(d) === this._focus)) ? this._focus : (days.some((d) => ymd(d) === tStr) ? tStr : null);
    // Spaltenbreiten: xl = heute/angetippt, m = morgen (und heute, wenn ein anderer Tag angetippt ist), s = alle anderen Tage.
    // In den Ansichten Ämtli/Termine bleiben die nächsten 2 Tage und das Wochenende mittel.
    const T = {}; const curWeek = days.some((d) => ymd(d) === tStr); const allMode = (this._mode || 'alle') === 'alle';
    days.forEach((d) => {
      const s = ymd(d); const diff = Math.round((startOfDay(d) - today) / 86400000); const we = isoWd(d) >= 6;
      T[s] = s === focus ? 'xl' : !curWeek ? 'm' : allMode ? ((s === tStr || diff === 1) ? 'm' : 's')
        : (s === tStr || we || (diff > 0 && diff <= 2)) ? 'm' : 's';
    });
    const cols = phone ? 'minmax(0,1fr)' : days.map((d) => (T[ymd(d)] === 's' ? (allMode && curWeek ? 'minmax(0,0.42fr)' : startOfDay(d) < today ? 'minmax(0,0.4fr)' : 'minmax(0,0.6fr)')
      : ({ xl: allMode && curWeek ? 'minmax(0,4.6fr)' : 'minmax(0,3.6fr)', m: allMode && curWeek ? 'minmax(0,1.5fr)' : 'minmax(0,1.15fr)' })[T[ymd(d)]])).join(' ');
    const we = addDays(ws, 6);

    const legCals = cals.filter((c) => !c.schule);
    const head = `<div class="corner">${legCals.length ? `<div class="leg">${legCals.map((c) => `<span class="lgi"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')}</div>` : ''}<span>Tap a day for details</span></div>` + days.map((d) => {
      const t = ymd(d) === tStr;
      return `<div class="hd${t ? ' t' : ''}${ymd(d) === focus ? ' fx' : ''} ts-${T[ymd(d)]}" data-focus="${ymd(d)}">${WD[isoWd(d) - 1]}${t ? ' · Today' : ''}<b>${d.getDate()}.</b></div>`;
    }).join('');

    const calLabel = legCals.length
      ? legCals.map((c) => `<span class="cl"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')
      : '<span class="cl">no calendar</span>';
    const termine = `<div class="lab syn${this._syncing ? ' spin' : ''}" data-sync title="Sync calendars now"><div class="ic"><ha-icon icon="${this._syncing ? 'mdi:sync' : 'mdi:calendar-sync-outline'}"></ha-icon></div><div class="lt"><div class="nm">Events</div><div class="cls">${calLabel}</div></div></div>` +
      days.map((d) => {
        const ds = startOfDay(d), de = addDays(ds, 1);
        const evs = this._events.filter((e) => !(evWho.get(e) || []).length && e.s < de && e.e > ds).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const t = ymd(d) === tStr;
        const shown = evs.slice(0, ymd(d) === focus ? 6 : 2);
        return `<div class="c ev-c${t ? ' t' : ''}">${withNow(shown, t && ymd(d) === focus, (e) => { const st = t ? evState(e) : { c: '', b: '' }; return `<div class="ev${ymd(d) === focus ? ' w' : ''}${st.c}" style="border-color:${e.c.farbe}">${evTime(e, ymd(d) === focus)}${st.b}${ymd(d) === focus ? '<br>' : ''}${esc(e.title)}</div>`; })}${evs.length > shown.length ? `<div class="more">+${evs.length - shown.length} more</div>` : ''}</div>`;
      }).join('');

    const pre = {};
    kids.forEach((k) => { const mi = heute.filter((i) => i.m.k === k.name); pre[k.name] = this._stats(k.name, h, today, mi.filter((i) => i.status === 'completed').length, mi.length); });
    const { A: awards, F: frames } = this._srvAwards(kids);
    // timetable view: only persons with a timetable
    const rowKids = (this._mode || 'alle') === 'schule' ? kids.filter((x) => (this._cfg.schule || {})[x.name]) : kids;
    // to-dos and special chores (date-based plan) in the planner, clearly marked; own view "To-dos & special"
    const snapX = (this.fpStore && this.fpStore.snap) || {}; const modeX = this._mode || 'alle';
    const specIds = new Set((snapX.chores || []).filter((c) => c.schedule).map((c) => c.id));
    const pidOf = Object.fromEntries((snapX.persons || []).map((p) => [p.name, p.id]));
    const showTodos = modeX === 'alle' || modeX === 'extra';
    const rows = rowKids.map((k) => {
      const tds = showTodos ? (snapX.todos || []).filter((t) => t.person_id === pidOf[k.name] && (!t.done || (t.done_at || '').slice(0, 10) === tStr)) : [];
      const tdBtns = tds.map((t) => `<button class="btn tdo${t.done ? ' done' : ''}${this._tdArm === t.id ? ' arm' : ''}" data-todoid="${esc(t.id)}"><span class="cb"></span><span class="bt"><em class="tag">☑ To-do</em>${esc(this._tdArm === t.id ? 'Tap again to finish' : t.title)}</span></button>`).join('');
      const mine = heute.filter((i) => i.m.k === k.name && (modeX !== 'extra' || specIds.has(i.m.c))).sort((a, b) => ((a.status === 'completed') - (b.status === 'completed')) || a.summary.localeCompare(b.summary, 'de'));
      const tDone = mine.filter((i) => i.status === 'completed').length;
      const st = pre[k.name]; const aw = awards[k.name] || [];
      const lv = level(st.pct); const C = 2 * Math.PI * 24;
      const AVS = phone ? 56 : 72;
      const label = `<div class="lab" data-person="${esc(k.name)}" style="box-shadow:inset 3px 0 0 ${k.farbe}">
          <div class="ring${frames[k.name] ? ' fr-' + frames[k.name] : ''}" style="width:${AVS}px;height:${AVS}px"><span class="ava">${avatarHtml(k, AVS)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) : ''}${this._lvBadge(k.name)}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>
          <div class="lt"><div class="nm">${esc(k.name)}</div><div class="lv2"><span class="rib2" style="--rc:${lv.c}">${st.pct}%</span>${aw.slice(0, phone ? 3 : 6).map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}${aw.length > (phone ? 3 : 6) ? `<span class="mdm">+${aw.length - (phone ? 3 : 6)}</span>` : ''}</div>
          </div>
          </div>`;
      const injectEv = (d, html) => {
        const dS = startOfDay(d), dE = addDays(dS, 1); const tr = T[ymd(d)]; const wide = tr === 'xl'; const mx = wide ? 5 : 3;
        const pevAll = this._events.filter((e) => (evWho.get(e) || []).includes(k.name) && e.s < dE && e.e > dS).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        // school: lessons from the school calendar, else fixed times; condensed to leave / start–end / home
        const sc = (this._cfg.schule || {})[k.name]; const awayD = ((this._cfg.abwesend || {})[k.name] || []).includes(ymd(d));
        const hm = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
        const at = (t) => { const x = new Date(dS); const [hh, mm] = t.split(':').map(Number); x.setHours(hh, mm, 0, 0); return x; };
        const schoolC = { farbe: k.farbe, name: 'School', schule: true };
        let lessons = awayD ? [] : pevAll.filter((e) => e.c.schule && !e.allDay);
        if (!awayD && !lessons.length && sc && sc.zeiten && sc.zeiten[isoWd(d)]) {
          const zz = sc.zeiten[isoWd(d)]; const spans = typeof zz[0] === 'string' ? [zz] : zz;
          lessons = spans.map((z) => ({ title: 'School', s: at(z[0]), e: at(z[1]), allDay: false, c: schoolC }));
        }
        // blocks: a long break (time to go home and back) splits the day, e.g. morning + afternoon with lunch at home
        const wg = (sc && sc.weg) || 0; const gapMin = Number(this._cfg.schulpause) > 0 ? Number(this._cfg.schulpause) : Math.max(45, 2 * wg + 15); const blocks = [];
        [...lessons].sort((a, b) => a.s - b.s).forEach((e) => {
          const lb = blocks[blocks.length - 1];
          if (lb && (e.s - lb.e) / 60000 < gapMin) { if (e.e > lb.e) lb.e = e.e; } else blocks.push({ s: e.s, e: e.e });
        });
        // a school block shows up only from X min before leaving until X min after being home (setting, 0 = always)
        const win = Number(this._cfg.schulfenster) || 0;
        const blockEvs = blocks.filter((bk) => !win || (now >= new Date(bk.s - (wg + win) * 60000) && now <= new Date(+bk.e + (wg + win) * 60000)))
          .map((bk) => ({ title: wg ? `🎒 leave ${hm(new Date(bk.s - wg * 60000))} · home ${hm(new Date(+bk.e + wg * 60000))}` : '🎒 School',
          s: new Date(bk.s), e: new Date(bk.e), allDay: false, c: schoolC }));
        const rest = pevAll.filter((e) => !e.c.schule);
        const mode0 = this._mode || 'alle';
        // blocks only in "all"; the calendar view shows appointments without school; the timetable shows every lesson
        const detail = lessons.map((e) => ({ ...e, title: e.loc ? `${e.title} · ${e.loc}` : e.title }));
        const pev = mode0 === 'schule' ? detail : mode0 === 'termine' ? rest : [...blockEvs, ...rest].sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const mode = mode0 === 'schule' ? 'termine' : mode0;
        if (mode === 'aemtli' || mode === 'extra') return html;
        const open = (html.match(/^<div[^>]*>/) || [''])[0];
        if (!pev.length) return mode === 'termine' ? open + '<div class="none">–</div></div>' : html;
        if (tr === 's') { const evn = `<div class="evn">${pev.slice(0, 4).map((e) => `<i style="background:${e.c.farbe}"></i>`).join('')}<b>${pev.length}</b></div>`; return mode === 'termine' ? open + evn + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evn); }
        const lim = mode === 'termine' ? (wide ? 12 : 6) : mx;
        const evh = `<div class="pev ${wide ? 'xl' : 'mid'}">${withNow(pev.slice(0, lim), wide && ymd(d) === ymd(new Date()), (e) => { const st = ymd(d) === ymd(new Date()) ? evState(e) : { c: '', b: '' }; return `<div class="ev one${st.c}" style="border-color:${e.c.farbe}"><span class="et">${esc(e.title)}</span><span class="tm">${evRange(e, !wide)}</span>${st.b}<span class="src" style="background:${e.c.farbe}" title="Calendar ${esc(e.c.name)}">${wide ? esc(e.c.name) : esc((e.c.name || '?').charAt(0).toUpperCase())}</span></div>`; })}${pev.length > lim ? `<div class="more">+${pev.length - lim} more</div>` : ''}</div>`;
        return mode === 'termine' ? open + evh + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evh);
      };
      const cells = days.map((d) => injectEv(d, ((d) => {
        const ds = ymd(d);
        if (((this._cfg.abwesend || {})[k.name] || []).includes(ds) && !(ds === tStr && mine.length)) {
          return `<div class="c ${ds < tStr ? 'p' : ds === tStr ? 't' : 'f'} vac${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="vc"><ha-icon icon="mdi:palm-tree"></ha-icon>${T[ds] === 's' ? '' : '<span>Holiday</span>'}</div></div>`;
        }
        if (ds === tStr && ds !== focus) {
          return mine.length ? `<div class="c t" data-focus="${ds}"><div class="fc"><b>${tDone}/${mine.length}</b></div><div class="bar"><i style="width:${Math.round((tDone / mine.length) * 100)}%;background:${G}"></i></div>${tds.filter((t) => !t.done).length ? `<div class="tdn2">☑ ${tds.filter((t) => !t.done).length}</div>` : ''}</div>` : `<div class="c t" data-focus="${ds}">${tds.filter((t) => !t.done).length ? `<div class="tdn2">☑ ${tds.filter((t) => !t.done).length}</div>` : ''}</div>`;
        }
        if (ds === tStr) {
          if (!mine.length && !tds.length) return '<div class="c t"></div>';
          if (!mine.length) return `<div class="c t"><div class="bg">${tdBtns}</div></div>`;
          const all = tDone === mine.length;
          return `<div class="c t"><div class="prog"><span>${tDone} of ${mine.length} done</span>${all ? '<span class="gr">Great!</span>' : ''}</div><div class="bg">` +
            mine.map((i) => `<button class="btn${specIds.has(i.m.c) ? ' spc' : ''}${i.status === 'completed' ? ' done' : ''}${this._pop && this._pop.uid === i.uid && Date.now() - this._pop.t < 600 ? ' pop' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span><span class="bt">${specIds.has(i.m.c) ? '<em class="tag">⭐ Special</em>' : ''}${esc(i.summary)}${dueTag(i.m, tStr)}</span></button>`).join('') + tdBtns + `</div></div>`;
        }
        if (ds < tStr) {
          const s = h[ds] && h[ds].s[k.name];
          if (!s || !s[1]) return `<div class="c p${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="none">–</div></div>`;
          const pct = Math.round((s[0] / s[1]) * 100); const col = pct === 100 ? G : pct >= 50 ? '#E0A84F' : '#E06B6B';
          if (T[ds] === 's') return `<div class="c p sm" data-focus="${ds}"><div class="pst" style="--pc:${col}">${s[0]}/${s[1]}</div></div>`;
          const miss = h[ds].x.filter((x) => x[0] === k.name).map((x) => x[1]);
          return `<div class="c p${ds === focus ? ' fx' : ''}" data-focus="${ds}"><div class="big">${s[0]}<small> / ${s[1]}</small></div><div class="bar"><i style="width:${pct}%;background:${col}"></i></div>` +
            (pct === 100 ? `<div class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${ds === focus ? 'All done' : ''}</div>` : (ds === focus ? miss.map((m) => `<div class="miss">✕ ${esc(m)}</div>`).join('') : `<div class="miss">✕ ${miss.length}</div>`)) + `</div>`;
        }
        if (modeX === 'extra' && ds !== tStr) {
          const sp = alle.filter((i) => i.m.k === k.name && specIds.has(i.m.c) && i.status !== 'completed' && (i.m.d || '') <= ds && (i.m.e || i.m.d || '') >= ds);
          return `<div class="c ${ds < tStr ? 'p' : 'f'}${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}">${sp.map((i) => `<div class="pl spl">⭐ ${esc(i.summary)}</div>`).join('') || '<div class="none">–</div>'}</div>`;
        }
        const pl = this._planFor(k.name, d);
        const opl = alle.filter((i) => i.m.k === k.name && i.status !== 'completed' && (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= ds);
        if (T[ds] !== 's') {
          const lim = ds === focus ? 99 : 4;
          const op = opl.map((i) => `<div class="pl op">⏳ ${esc(i.summary)}</div>`).join('');
          return `<div class="c f${ds === focus ? ' fx' : ''}" data-focus="${ds}">${op}${pl.length ? pl.slice(0, lim).map((p) => `<div class="pl">${esc(p)}</div>`).join('') + (pl.length > lim ? `<div class="more">+${pl.length - lim} more</div>` : '') : ''}</div>`;
        }
        return `<div class="c f" data-focus="${ds}">${pl.length ? `<div class="fc"><b>${pl.length}</b>chores</div>` : ''}${opl.length ? `<div class="opn">⏳ ${opl.length} open</div>` : ''}</div>`;
      })(d))).join('');
      return label + cells;
    }).join('');

    const empty = !kids.length ? `<div class="emptyk">No chores planned yet – add them under "Chore plan".</div>` : '';

    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:14px 16px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
      .top{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
      .clock{font-size:38px;font-weight:200;color:${G};line-height:1;font-variant-numeric:tabular-nums}
      .date{font-size:24px;font-weight:300}.date b{font-weight:600}
      .sub{font-size:12px;color:var(--fp-text3,#7a7a7a);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px}
      .nav{margin-left:auto;display:flex;align-items:center;gap:8px}.tdg{display:flex;gap:6px}
      .top{flex-wrap:nowrap}.card.phone .top{flex-wrap:wrap}
      .nb{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);color:var(--fp-text,#ddd);border-radius:10px;height:42px;min-width:42px;padding:0 14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;font-size:14px;-webkit-tap-highlight-color:transparent}
      .nb ha-icon{--mdc-icon-size:22px}.nb.td{gap:6px}.tdn{background:${G};color:var(--fp-on-accent,#141414);border-radius:10px;padding:0 7px;font-size:12px;line-height:20px}.nb.g{color:${G};border-color:color-mix(in srgb,var(--fp-accent) 50%,transparent)}
      .wk{font-size:12px;color:var(--fp-text3,#8a8a8a);padding:0 8px;text-align:center;min-width:150px}.wk b{display:block;color:var(--fp-text,#ececec);font-size:15px;font-weight:600}
      .grid{display:grid;grid-template-columns:${phone ? '104px' : '200px'} ${cols};gap:5px;align-items:stretch}
      .card.phone .lab{flex-direction:column;align-items:flex-start;gap:6px;padding:8px 6px}.card.phone .lt .nm{font-size:13px}.card.phone .corner{visibility:hidden}
      .card.phone .bg{grid-template-columns:1fr}.card.phone .pev .src{display:none}.card.phone .btn{min-height:50px;font-size:15px}.card.phone .btn .cb{width:26px;height:26px}.card.phone .btn.done .cb::after{left:8px;top:3px;width:6px;height:12px}.card.phone .nb{min-width:46px;height:46px}.card.phone .top{gap:8px}.card.phone .seg button{padding:0 9px}
      .dnav{display:flex;align-items:center;gap:6px}.dd{font-size:14px;text-align:center;min-width:120px}.dd b{display:block;font-size:16px}
      .corner{font-size:10px;color:var(--fp-text3,#555);display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:6px;padding:0 4px 6px}
      .corner .leg{background:none;padding:0;margin:0;gap:4px 10px}.corner .lgi{font-size:12px}
      .pev.mid .src{display:none}
      .hd{padding:4px 10px 6px;font-size:11px;color:var(--fp-text3,#8a8a8a);text-transform:uppercase;letter-spacing:1px}
      .hd{cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.hd.fx{background:var(--fp-bg3,#262626)}
      .hd b{display:block;font-size:18px;color:var(--fp-text,#e5e5e5);font-weight:300;letter-spacing:0;text-transform:none;margin-top:2px}
      .hd.t,.hd.t b{color:${G}}.hd.t b{font-weight:500}
      .c{background:var(--fp-bg3,#262626);border-radius:10px;padding:8px;min-height:56px;min-width:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .c.fx{box-shadow:inset 0 0 0 1px #4a4a4a;background:var(--fp-bg3,#2a2a2a)}
      .c.t{background:var(--fp-bg3,#2a2a2a);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .ev-c{min-height:38px}
      .syn{cursor:pointer;-webkit-tap-highlight-color:transparent}.syn:active{background:var(--fp-bg3,#2a2a2a)}
      .spin .ic ha-icon,.spin2 ha-icon{animation:fpspin 1s linear infinite}
      .nowl{position:relative;height:0;border-top:2px solid #e06b6b;margin:5px 0 5px 4px}.nowl::before{content:"";position:absolute;left:-5px;top:-5px;width:8px;height:8px;border-radius:50%;background:#e06b6b}.nowl span{position:absolute;right:0;top:-8px;font-size:9px;font-weight:700;color:#e06b6b;background:var(--fp-bg2,var(--fp-bg1,#1e1e1e));padding:0 4px;border-radius:4px;line-height:14px}
      .ev.past{opacity:.45}.ev.now{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent,var(--fp-accent)) 60%,transparent)}.ev.soon{background:color-mix(in srgb,var(--fp-accent,var(--fp-accent)) 14%,var(--fp-bg4,#303030))}.ev em.soon{font-style:normal;font-size:10px;font-weight:700;color:var(--fp-accent,var(--fp-accent));margin:0 4px;white-space:nowrap}
      .pev{margin-bottom:6px;display:flex;flex-direction:column;gap:3px}.pev .ev{margin-top:0}
      .pev.sm .ev{font-size:10px;padding:2px 4px 2px 5px}
      .ev .du{color:var(--fp-text3,#8a8a8a);font-weight:400;margin-right:5px}
      .src{display:inline-block;font-size:9px;font-weight:700;color:var(--fp-on-accent,#141414);border-radius:6px;padding:0 5px;margin-right:5px;line-height:15px;vertical-align:1px;white-space:nowrap}
      .leg{display:flex;align-items:center;gap:12px;margin-left:auto;background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 14px;flex-wrap:wrap}
      .leg + .nav{margin-left:0}
      .lgt{font-size:10px;color:var(--fp-text3,#666);text-transform:uppercase;letter-spacing:1px}
      .tnav{display:flex;gap:6px;margin-left:auto}.tnav + .seg{margin-left:0}
      .seg{display:flex;background:var(--fp-bg2,#232323);border-radius:10px;padding:3px;gap:2px;margin-left:auto}.seg + .leg{margin-left:0}
      .seg button{background:transparent;border:none;color:var(--fp-text2,#999);font:inherit;font-size:13px;padding:0 13px;height:36px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}.seg button.on{background:var(--fp-bg4,#3a3a3a);color:var(--fp-text,#fff);font-weight:600}
      .ev.one{display:flex;align-items:center;gap:6px;white-space:nowrap}.ev.one .et{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:block}
      .ev.one .tm{flex:none;color:var(--fp-text2,#9a9a9a);font-size:.9em;font-variant-numeric:tabular-nums}.ev.one .src{flex:none;margin:0}
      .pev.mid .ev.one{white-space:nowrap;gap:4px}.pev.mid .ev.one .tm{font-size:10px}
      .lgi{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#ccc)}.lgi i{width:10px;height:10px;border-radius:3px;display:inline-block}.ev.w{white-space:normal;line-height:1.35}.ev.w .du{margin-left:6px}@keyframes fpspin{to{transform:rotate(360deg)}}
      .lab{background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:10px;min-width:0;box-sizing:border-box}
      .lv2{display:flex;align-items:center;gap:4px;margin-top:5px;flex-wrap:wrap}
      .rib2{background:var(--rc);color:var(--fp-on-accent,#141414);font-size:11px;font-weight:800;line-height:18px;padding:0 11px 0 7px;border-radius:3px 0 0 3px;clip-path:polygon(0 0,100% 0,86% 50%,100% 100%,0 100%);margin-right:2px;letter-spacing:.2px}
      .ic{width:38px;height:38px;border-radius:10px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center;flex:none}
      .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:var(--fp-on-accent,#161616);flex:none}
      .lt{min-width:0;flex:1}
      .lv b{font-weight:700}
      .lab[data-person]{cursor:pointer;-webkit-tap-highlight-color:transparent}.lab[data-person]:active{background:var(--fp-bg3,#2a2a2a)}
      .rib{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);background:var(--rc);color:var(--fp-on-accent,#141414);font-size:9px;font-weight:800;padding:1px 8px;line-height:13px;white-space:nowrap;letter-spacing:.3px;clip-path:polygon(0 0,100% 0,90% 50%,100% 100%,0 100%,10% 50%);z-index:2}
      .bdg{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap}
      ${AWCSS}
      .lv2 .md{width:32px;height:32px;border-width:1.5px}.lv2 .md ha-icon{--mdc-icon-size:19px}.lv2{gap:6px}.mdm{font-size:12px;color:var(--fp-text3,#8a8a8a);font-weight:600}.pp{color:${G};font-weight:600}
      .md.lg{width:36px;height:36px}.md.lg ha-icon{--mdc-icon-size:20px}
      .ovl{position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:10}
      .pnl{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);width:min(600px,94%);max-height:92%;overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.6);box-sizing:border-box}
      .ph{display:flex;align-items:center;gap:18px;margin-bottom:16px}.phn{flex:1}.pn2{font-size:24px;font-weight:600}
      .ring.bigr{width:64px;height:64px;display:flex}.ring.bigr .crown{top:-14px}.ring.bigr .crown ha-icon{--mdc-icon-size:24px}.ring.bigr .rib{font-size:11px;line-height:15px;bottom:-7px}
      .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kp div{background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px}
      .kp span{display:block;font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}.kp b{font-size:18px;font-weight:400}.kp small{font-size:12px;color:var(--fp-text3,#888)}
      .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
      .aw{display:flex;gap:12px;align-items:center;background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px;margin-bottom:6px}.aw b{font-size:15px}.aw div div{font-size:12px;color:var(--fp-text2,#aaa);margin-top:2px}
      .aw0{color:var(--fp-text3,#888);font-size:13px}
      .rl2{display:grid;grid-template-columns:22px 140px 1fr;gap:3px 10px;align-items:center;font-size:12px;color:var(--fp-text2,#aaa);padding:7px 0;border-top:1px solid var(--fp-line,#2a2a2a)}.rl2 b{color:var(--fp-text,#ddd)}
      .rl2 em{grid-column:3;font-style:normal;color:#e0a84f;font-size:11px}
      .nm{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lv{font-size:11px;margin-top:2px}
      .cls{display:flex;flex-wrap:wrap;gap:2px 8px;margin-top:2px}.cl{font-size:11px;color:var(--fp-text3,#7a7a7a);display:flex;align-items:center;gap:4px}.cl i{width:7px;height:7px;border-radius:50%;display:inline-block}
      .streak{font-size:11px;color:var(--fp-text2,#9a9a9a);display:flex;align-items:center;gap:3px;margin-top:3px}.streak ha-icon{--mdc-icon-size:13px;color:#e0a84f}
      .bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,135px),1fr));gap:6px}
      .btn{display:flex;align-items:center;gap:9px;width:100%;background:var(--fp-bg4,#323232);border:1px solid var(--fp-line,#3a3a3a);border-radius:9px;padding:6px 9px;margin:0;color:var(--fp-text,#eee);font:inherit;font-size:13px;line-height:1.25;min-height:40px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box;transition:background .2s,border-color .2s}
      .btn:active{transform:scale(.98)}
      .btn .cb{width:22px;height:22px;border-radius:50%;border:2px solid var(--fp-line,#5d5d5d);flex:none;position:relative;box-sizing:border-box;transition:all .2s}
      .btn.done{background:color-mix(in srgb,var(--fp-accent) 1200%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .btn.done .cb{background:${G};border-color:${G}}
      .btn.done .cb::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid var(--fp-line,#1e1e1e);border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
      .btn.done .bt{color:var(--fp-accent)}
      .btn .tag{display:inline-block;font-style:normal;font-size:10px;font-weight:700;letter-spacing:.3px;padding:1px 6px;border-radius:7px;margin-right:6px;vertical-align:1px}
      .btn.spc{border-color:rgba(245,197,66,.65);background:rgba(245,197,66,.08)}.btn.spc .tag{background:rgba(245,197,66,.2);color:#f5c542}
      .btn.tdo{border:1px dashed rgba(79,163,224,.7);background:rgba(79,163,224,.07)}.btn.tdo .tag{background:rgba(79,163,224,.2);color:#4fa3e0}.btn.tdo .cb{border-radius:6px}
      .btn.tdo.arm{border-style:solid;border-color:#4fa3e0;background:rgba(79,163,224,.18)}
      .tdn2{font-size:11px;font-weight:700;color:#4fa3e0;margin-top:4px}.pl.spl{color:#f5c542}
      .btn.pop .cb{animation:fpcheck .5s cubic-bezier(.3,1.6,.5,1)}.btn.pop .cb::before{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid ${G};animation:fpring .6s ease-out forwards}
      @keyframes fpcheck{0%{transform:scale(.55)}60%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes fpring{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.3);opacity:0}}
      @media (prefers-reduced-motion:reduce){.btn.pop .cb,.btn.pop .cb::before{animation:none}}
      .due{font-style:normal;font-size:10px;font-weight:600;color:#e0a84f;border:1px solid rgba(224,168,79,.5);border-radius:8px;padding:1px 6px;margin-left:6px;white-space:nowrap;display:inline-block}
      .due.last{color:var(--fp-on-accent,#1e1e1e);background:#e0a84f;border-color:#e0a84f}.btn.done .due{opacity:.5}
      .pl.op{color:#c39a4a}.pl.op::before{display:none}
      .pev.mid .ev{font-size:11px;padding:3px 5px 3px 6px;white-space:normal;line-height:1.3}.pev.mid .et{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fp-text,#ddd)}
      .pev.xl .ev{padding:5px 8px;font-size:12px}.pev.xl .et{color:var(--fp-text,#eee)}
      .pst{display:inline-block;font-size:11px;font-weight:700;color:var(--fp-on-accent,#141414);background:var(--pc);border-radius:6px;padding:1px 6px;line-height:16px}
      .c.p.sm{padding:6px 4px;min-height:40px;display:flex;flex-direction:column;align-items:center;gap:4px}
      .evn{display:flex;align-items:center;gap:3px;font-size:11px;color:var(--fp-text2,#aaa);margin-bottom:5px;flex-wrap:wrap;justify-content:center}.evn i{width:6px;height:6px;border-radius:50%;display:inline-block}.evn b{margin-left:2px;font-weight:600}
      .hd.ts-s{padding:4px 4px 6px;font-size:9px;letter-spacing:.5px}.hd.ts-s b{font-size:14px;color:var(--fp-text3,#8a8a8a)}
      .hd.ts-m b{font-size:17px}
      .c.p .big{font-size:14px}.c.p .big small{font-size:10px}.c.p .bar{margin:5px 0 4px}
      .fc{font-size:11px;color:var(--fp-text3,#8a8a8a);white-space:nowrap}.fc b{font-size:18px;font-weight:300;color:var(--fp-text,#ddd);margin-right:4px}
      .opn{font-size:11px;color:#c39a4a;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .prog{font-size:11px;color:var(--fp-text3,#8a8a8a);margin-bottom:4px;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.8px}.gr{color:${G};font-weight:600}
      .free{display:flex;align-items:center;gap:8px;color:var(--fp-text3,#8a8a8a);font-size:14px;padding:6px 2px}.free ha-icon{color:${G}}
      .vc{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;min-height:40px;color:#4fa3e0;font-size:13px;font-weight:600;background:rgba(79,163,224,.08);border-radius:8px}.vc ha-icon{--mdc-icon-size:20px}
      .big{font-size:18px;font-weight:300;line-height:1.1}.big small{font-size:13px;color:var(--fp-text3,#8a8a8a)}
      .bar{height:4px;border-radius:2px;background:var(--fp-bg4,#3a3a3a);margin:7px 0 6px;overflow:hidden}.bar i{display:block;height:100%}
      .miss{font-size:11px;color:#d98080;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ok{font-size:11px;color:${G};display:flex;align-items:center;gap:4px}.ok ha-icon{--mdc-icon-size:14px}
      .pl{font-size:12px;color:var(--fp-text3,#7a7a7a);line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pl::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--fp-bg4,#555);margin-right:6px;vertical-align:middle}
      .none{font-size:13px;color:var(--fp-text3,#555)}
      .ev{font-size:12px;line-height:1.3;padding:4px 6px 4px 7px;border-left:3px solid;background:var(--fp-bg4,#303030);border-radius:0 6px 6px 0;margin-top:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .ev:first-child{margin-top:0}.ev b{font-weight:600;color:var(--fp-text2,#aaa);margin-right:5px}
      .more{font-size:11px;color:var(--fp-text3,#777);margin-top:4px}
      .emptyk{grid-column:1/-1;color:var(--fp-text3,#7a7a7a);padding:20px;text-align:center}
      .err{color:#e06b6b;font-size:12px;margin-top:10px}
    .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>
    <div class="card${phone ? ' phone' : ''}">
      <div class="top">
        <div class="seg">${[['alle', 'All'], ['aemtli', 'Chores'], ['extra', 'To-dos & special'], ['termine', 'Events'], ['schule', 'Timetable']].filter(([v]) => v !== 'schule' || Object.keys(this._cfg.schule || {}).length).map(([v, l]) => `<button class="${(this._mode || 'alle') === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        ${this._cfg.todos_knopf ? `<div class="tdg"><button class="nb td${this._cfg.todos_offen ? ' g' : ''}" data-todos title="To-dos"><ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>${phone ? '' : 'To-dos'}${this._cfg.todos_offen ? ` <b class="tdn">${Number(this._cfg.todos_offen)}</b>` : ''}</button><button class="nb" data-todoadd title="Add to-do"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ''}
        <div class="nav">
          ${(phone ? (this._dayOff || 0) !== 0 : this._week !== 0) ? `<button class="nb g" data-nav="0">Today</button>` : ''}
          ${cals.length && !phone ? `<button class="nb${this._syncing ? ' spin2' : ''}" data-sync title="Sync calendars"><ha-icon icon="mdi:calendar-sync-outline"></ha-icon></button>` : ''}
          <button class="nb" data-nav="-1"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          ${phone ? `<div class="dd"><b>${ymd(sel) === tStr ? 'Today' : WDL[isoWd(sel) - 1]}</b>${sel.getDate()}. ${MON[sel.getMonth()]}</div>`
            : `<div class="wk"><b>Week ${isoWeek(ws)}</b>${ws.getDate()} ${ws.getMonth() !== we.getMonth() ? MON[ws.getMonth()].slice(0, 3) + ' ' : ''}– ${we.getDate()} ${MON[we.getMonth()]}</div>`}
          <button class="nb" data-nav="1"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </div>
      </div>
      <div class="grid">${head}${(!cals.length || cals.some((c) => !c.person)) ? termine : ''}${rows}${empty}</div>
      ${this._err ? `<div class="err">${esc(this._err)}</div>` : ''}
      ${this._detail ? this._detailHtml(kids, pre, awards, frames) : ''}
    </div>`;
  }
}

// Navigation zwischen den Familienplaner-Seiten (funktioniert auch im Kiosk-Modus ohne HA-Kopfzeile)
const fpNavigate = (p) => {
  const parts = location.pathname.split('/').filter(Boolean);
  history.pushState(null, '', `/${parts[0] || 'family-planer'}/${p}${location.search}`);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
};
window.FPX_EN = { AWT, AWR, AWCSS, avatarGen, FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx, planActive, AV_TYPES, PALETTE, fpNavigate, startOfDay, ymd };
customElements.define('fp-week-inner-en', LoxWochenplanerCard);

})();
// Familienplaner – Ämtliplan v3: pro Ämtli mehrere Personen, pro Person Wochentage mit Rhythmus
// custom:fp-plan-inner-en   (nutzt window.FPX_EN aus dem Familienplaner-Modul)
// Plan-Beschreibung: "fp1:" + {"z": {"Lea": [1,3]}, "r": {"Lea|1": [2, 0]}}
//   r: alle n Wochen, aktiv wenn Wochenindex (seit 5.1.1970) % n == offset; fehlt r => jede Woche
customElements.whenDefined('fp-week-inner-en').then(() => {
  const { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx } = window.FPX_EN;
  const rgba = (hex, a) => { const h = (hex || '#888888').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const mondayOfIdx = (idx) => { const u = new Date(Date.UTC(1970, 0, 5) + idx * 604800000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const curIdx = () => weekIdx(new Date());
  const nextKw = (n, o) => { const c = curIdx(); for (let i = 0; i < n; i++) if ((c + i) % n === o) return isoWeek(mondayOfIdx(c + i)); return null; };
  const dayTxt = (p, d, r, f) => { const x = r[`${p}|${d}`]; const fv = (f || {})[`${p}|${d}`] || 1; const ex = []; if (fv > 1) ex.push(`until ${WD[(d - 1 + fv - 1) % 7]}`); if (x && x[0] > 1) ex.push(`every ${x[0]} wks, next week ${nextKw(x[0], x[1])}`); return ex.length ? `${WD[d - 1]} (${ex.join(', ')})` : WD[d - 1]; };
  const daysTxt = (p, t, r, f) => {
    const s = [...(t || [])].sort((a, b) => a - b); const j = s.join(',');
    const anyR = s.some((d) => (r[`${p}|${d}`] || [1])[0] > 1 || ((f || {})[`${p}|${d}`] || 1) > 1);
    if (!anyR) { if (j === '1,2,3,4,5,6,7') return 'daily'; if (j === '1,2,3,4,5') return 'weekdays'; if (j === '6,7') return 'weekend'; }
    return s.length ? s.map((d) => dayTxt(p, d, r, f)).join(', ') : 'no days';
  };

  class LoxAemtliPlanCard extends FpBase {
    _normalize(c) { return { plan: 'todo.amtli_plan', script: 'script.aemtli_tageswechsel', einstellungen: 'todo.familienplaner_einstellungen', kinder: [], titel: 'Ämtliplan', ...c }; }
    _lists() { return [['plan', this._cfg.plan], ['settings', this._cfg.einstellungen]]; }
    getCardSize() { return 10; }
    _bind() {
      this._new = { t: '', z: {}, r: {}, f: {} }; this._confirm = null; this._msg = ''; this._pick = null;
      const r = this.shadowRoot;
      r.addEventListener('click', (e) => this._onClick(e));
      r.addEventListener('change', (e) => this._onChange(e));
      r.addEventListener('input', (e) => { if (e.target.dataset.new === 't') this._new.t = e.target.value; });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur(); });
      r.addEventListener('focusout', () => setTimeout(() => { if (this._dirty && !this._editing()) { this._dirty = false; this._render(); } }, 60));
    }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && a.tagName === 'INPUT'; }
    _order() { return this._kids().map((k) => k.name); }
    _rows() {
      const order = this._order();
      const first = (z) => Math.min(99, ...Object.keys(z).map((k) => { const i = order.indexOf(k); return i < 0 ? 98 : i; }));
      return (this._data.plan || []).map((p) => { const m = parseDesc(p.description); return { uid: p.uid, t: p.summary, pts: (typeof m.p === 'number' ? m.p : null), z: planZ(m), r: (m.r && typeof m.r === 'object') ? m.r : {}, f: (m.f && typeof m.f === 'object') ? m.f : {} }; })
        .sort((a, b) => (first(a.z) - first(b.z)) || a.t.localeCompare(b.t, 'de'));
    }
    _find(uid) { return this._rows().find((r) => r.uid === uid); }
    _desc(z, r, f) {
      const zo = {}; const ro = {}; const fo = {}; f = f || {};
      for (const [k, v] of Object.entries(z)) {
        zo[k] = [...new Set(v)].sort((a, b) => a - b);
        for (const d of zo[k]) { const x = r[`${k}|${d}`]; if (x && x[0] > 1) ro[`${k}|${d}`] = [x[0], ((x[1] % x[0]) + x[0]) % x[0]]; const fv = f[`${k}|${d}`]; if (fv > 1) fo[`${k}|${d}`] = fv; }
      }
      const o = { z: zo }; if (Object.keys(ro).length) o.r = ro; if (Object.keys(fo).length) o.f = fo;
      return 'fp1:' + JSON.stringify(o);
    }
    _sync() {
      clearTimeout(this._syncT);
      this._syncT = setTimeout(() => { if (this._cfg.script) this._call('script', 'turn_on', {}, this._cfg.script).catch(() => {}); }, 1200);
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(true); clearTimeout(this._msgT); this._msgT = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _add() {
      const t = (this._new.t || '').trim();
      if (!t) return this._flash('Bitte einen Ämtli-Text eingeben.', true);
      if (!Object.values(this._new.z).some((v) => v.length)) return this._flash('Bitte mindestens einer Person einen Wochentag zuordnen.', true);
      this._call('todo', 'add_item', { item: t, description: this._desc(this._new.z, this._new.r, this._new.f) }, this._cfg.plan).then(() => {
        this._new = { t: '', z: {}, r: {}, f: {} }; this._pick = null; this._flash(`„${t}“ hinzugefügt`); this._sync();
      }).catch((e) => this._flash(`Error: ${e.message || e}`, true));
    }
    _ctx(el) {
      const isNew = !!el.closest('.add'); const row = el.closest('.row[data-uid]');
      const r = !isNew && row ? this._find(row.dataset.uid) : null;
      const src = isNew ? this._new : r;
      return { isNew, r, key: isNew ? 'new' : (r && r.uid), z: src ? JSON.parse(JSON.stringify(src.z)) : null, rr: src ? JSON.parse(JSON.stringify(src.r || {})) : null, ff: src ? JSON.parse(JSON.stringify(src.f || {})) : null };
    }
    _apply(ctx) {
      if (ctx.isNew) { this._new.z = ctx.z; this._new.r = ctx.rr; this._new.f = ctx.ff; this._render(true); return; }
      if (!ctx.r) return;
      // optimistisch im lokalen Datenstand übernehmen, damit die Anzeige sofort stimmt
      const desc = this._desc(ctx.z, ctx.rr, ctx.ff);
      const it = (this._data.plan || []).find((p) => p.uid === ctx.r.uid); if (it) it.description = desc;
      this._render(true);
      this._call('todo', 'update_item', { item: ctx.r.uid, description: desc }, this._cfg.plan)
        .then(() => this._sync()).catch((e) => this._flash(`Error: ${e.message || e}`, true));
    }
    _isPick(key, p, d) { const k = this._pick; return !!k && k.key === key && k.p === p && k.d === d; }
    _onClick(e) {
      const t = e.target;
      const ha = t.closest('[data-hadd]'); if (ha) { this.dispatchEvent(new CustomEvent('fp-plan-add', { bubbles: true, composed: true, detail: { kind: ha.dataset.hadd } })); return; }
      if (t.closest('[data-add]')) { const inp = this.shadowRoot.querySelector('[data-new="t"]'); if (inp) this._new.t = inp.value; this._add(); return; }
      const arw = t.closest('.arw');
      if (arw) {
        const ctx = this._ctx(t); if (!ctx.z) return; const p = arw.dataset.p;
        const day = t.closest('[data-day]');
        if (day) {
          const d = Number(day.dataset.day); const has = (ctx.z[p] || []).includes(d);
          if (!has) { ctx.z[p] = [...(ctx.z[p] || []), d]; this._pick = { key: ctx.key, p, d }; this._apply(ctx); }
          else { this._pick = this._isPick(ctx.key, p, d) ? null : { key: ctx.key, p, d }; this._render(true); }
          return;
        }
        const pre = t.closest('[data-preset]');
        if (pre) { ctx.z[p] = pre.dataset.preset.split(',').map(Number); Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rmp]')) { delete ctx.z[p]; Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        const pk = this._pick; if (!pk) return; const rk = `${pk.p}|${pk.d}`;
        const rn = t.closest('[data-rn]');
        if (rn) { const n = Number(rn.dataset.rn); if (n <= 1) delete ctx.rr[rk]; else ctx.rr[rk] = [n, curIdx() % n]; this._apply(ctx); return; }
        const ro = t.closest('[data-ro]');
        if (ro && ctx.rr[rk]) { ctx.rr[rk][1] = Number(ro.dataset.ro); this._apply(ctx); return; }
        const fx = t.closest('[data-fx]');
        if (fx) { const v = Number(fx.dataset.fx); if (v <= 1) delete ctx.ff[rk]; else ctx.ff[rk] = v; this._apply(ctx); return; }
        if (t.closest('[data-rdel]')) { ctx.z[pk.p] = (ctx.z[pk.p] || []).filter((x) => x !== pk.d); delete ctx.rr[rk]; delete ctx.ff[rk]; this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rclose]')) { this._pick = null; this._render(true); return; }
        return;
      }
      const del = t.closest('[data-del]');
      if (del) {
        const ctx = this._ctx(t); if (!ctx.r) return; const r = ctx.r;
        if (this._confirm === r.uid) {
          this._confirm = null;
          this._call('todo', 'remove_item', { item: [r.uid] }, this._cfg.plan).then(() => { this._flash(`"${r.t}" deleted`); this._sync(); }).catch((er) => this._flash(`Error: ${er.message || er}`, true));
        } else {
          this._confirm = r.uid; this._render(true);
          clearTimeout(this._cT); this._cT = setTimeout(() => { this._confirm = null; this._render(); }, 3000);
        }
      }
    }
    _onChange(e) {
      const el = e.target;
      if (el.dataset.addp !== undefined) {
        const v = el.value; if (!v) return; const ctx = this._ctx(el); if (!ctx.z) return;
        ctx.z[v] = ctx.z[v] || []; this._apply(ctx); return;
      }
      if (el.dataset.f === 'p') {
        const ctx = this._ctx(el); if (!ctx.r) return;
        const n = el.value === '' ? null : Math.max(0, Math.min(1000, Math.round(Number(el.value) || 0)));
        this._call('todo', 'update_item', { item: ctx.r.uid, points: n }, this._cfg.plan).then(() => this._flash('Points saved')).catch((er) => this._flash(`Error: ${er.message || er}`, true));
        return;
      }
      if (el.dataset.f === 't') {
        const ctx = this._ctx(el); if (!ctx.r) return; const v = el.value.trim();
        if (v && v !== ctx.r.t) this._call('todo', 'update_item', { item: ctx.r.uid, rename: v }, this._cfg.plan).catch((er) => this._flash(`Error: ${er.message || er}`, true));
        else el.value = ctx.r.t;
      }
    }
    _picker(key, p, d, rr, farbe, ff) {
      const x = rr[`${p}|${d}`]; const n = x && x[0] > 1 ? x[0] : 1; const o = x ? x[1] : 0; const c = curIdx();
      const fv = (ff || {})[`${p}|${d}`] || 1;
      const fRow = `<div class="pr"><span class="plb">Time to do it</span>${[1, 2, 3, 4, 5, 6, 7].map((k) => `<button class="sg${k === fv ? ' on' : ''}" data-fx="${k}">${k === 1 ? `only on ${WD[d - 1]}` : `until ${WD[(d - 1 + k - 1) % 7]} · ${k} days`}</button>`).join('')}</div>`;
      const starts = n > 1 ? [...Array(n)].map((_, i) => {
        const idx = c + i; const off = idx % n; const kw = isoWeek(mondayOfIdx(idx));
        return `<button class="sg${off === o ? ' on' : ''}" data-ro="${off}">${i === 0 ? 'this week' : i === 1 ? 'next week' : `in ${i} weeks`} · week ${kw}</button>`;
      }).join('') : '';
      return `<div class="pick" style="--c:${farbe};--cb:${rgba(farbe, 0.2)}">
        <div class="pr"><span class="plb">${WD[d - 1]} · ${esc(p)}</span>
          ${[1, 2, 3, 4].map((k) => `<button class="sg${k === n ? ' on' : ''}" data-rn="${k}">${k === 1 ? 'every week' : `every ${k} weeks`}</button>`).join('')}</div>
        ${n > 1 ? `<div class="pr"><span class="plb">Start</span>${starts}</div>` : ''}
        ${fRow}<div class="pr"><button class="sg rm" data-rdel>Remove day</button><button class="sg ok" data-rclose>Done</button></div>
      </div>`;
    }
    _asg(key, z, rr, ff) {
      ff = ff || {};
      const kids = this._kids(); const order = this._order();
      const person = (n) => kids.find((k) => k.name === n) || { name: n, farbe: '#888888' };
      const names = Object.keys(z).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const lines = names.map((n) => {
        const k = person(n); const t = z[n] || [];
        const pk = this._pick && this._pick.key === key && this._pick.p === n ? this._pick : null;
        return `<div class="arw" data-p="${esc(n)}"><div class="ar">${avatarHtml(k, 30)}<span class="pn">${esc(n)}</span>
          <div class="days">${WD.map((w, i) => {
            const d = i + 1; const on = t.includes(d); const x = rr[`${n}|${d}`]; const rh = on && x && x[0] > 1; const fv = on ? (ff[`${n}|${d}`] || 1) : 1; const tag = [rh ? x[0] + 'W' : '', fv > 1 ? fv + 'T' : ''].filter(Boolean).join('·');
            return `<button class="day${on ? ' on' : ''}${(rh || fv > 1) ? ' rh' : ''}${pk && pk.d === d ? ' sel' : ''}" data-day="${d}" style="--c:${k.farbe};--cb:${rgba(k.farbe, 0.2)}">${w}${tag ? `<small>${tag}</small>` : ''}</button>`;
          }).join('')}</div>
          <button class="pre" data-preset="1,2,3,4,5,6,7">daily</button><button class="pre" data-preset="1,2,3,4,5">Mon–Fri</button>
          <button class="rmp" data-rmp title="Remove person">✕</button></div>
          ${pk && t.includes(pk.d) ? this._picker(key, n, pk.d, rr, k.farbe, ff) : ''}</div>`;
      }).join('');
      const free = kids.filter((k) => !(k.name in z));
      return lines + (free.length ? `<select class="sel addp" data-addp><option value="" selected>+ Assign person</option>${free.map((k) => `<option value="${esc(k.name)}">${esc(k.name)}</option>`).join('')}</select>` : '');
    }
    _render(force) {
      if (!this.shadowRoot || !this._cfg) return;
      if (!force && this._editing()) { this._dirty = true; return; }
      const kids = this._kids(); const rows = this._rows();
      // Wochenübersicht: durchschnittliche Anzahl Ämtli pro Person und Tag (Rhythmus anteilig)
      const cnt = {}; kids.forEach((k) => { cnt[k.name] = [0, 0, 0, 0, 0, 0, 0]; });
      rows.forEach((r) => Object.entries(r.z).forEach(([n, t]) => { if (!cnt[n]) cnt[n] = [0, 0, 0, 0, 0, 0, 0]; (t || []).forEach((d) => { const x = r.r[`${n}|${d}`]; cnt[n][d - 1] += x && x[0] > 1 ? 1 / x[0] : 1; }); }));
      const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
      const max = Math.max(1, ...Object.values(cnt).flat());
      const overview = `<div class="ov"><div></div>${WD.map((w) => `<div class="ovh">${w}</div>`).join('')}<div class="ovh">Ø week</div>` +
        kids.map((k) => `<div class="ovp">${avatarHtml(k, 24)}<span>${esc(k.name)}</span></div>` +
          cnt[k.name].map((n) => `<div class="ovc" style="background:${n ? rgba(k.farbe, 0.12 + (0.5 * n) / max) : 'var(--fp-bg3,#262626)'};color:${n ? 'var(--fp-text,#fff)' : 'var(--fp-text3,#555)'}">${n ? fmt(n) : '·'}</div>`).join('') +
          `<div class="ovt">${fmt(cnt[k.name].reduce((a, b) => a + b, 0))}</div>`).join('') + `</div>`;
      const sum = (z, r, f) => Object.entries(z).map(([n, t]) => `<b>${esc(n)}:</b> ${daysTxt(n, t, r, f)}`).join('<br>') || 'Not assigned yet';
      const body = rows.map((r) => `
        <div class="row" data-uid="${esc(r.uid)}">
          <div class="tcol"><div class="tl"><input class="in" data-f="t" value="${esc(r.t)}"><label class="pts" title="Points or weight for this chore (in fair mode: share of the day value)"><input class="in pn" data-f="p" type="number" min="0" max="1000" inputmode="numeric" value="${r.pts == null ? '' : r.pts}" placeholder="${Number(this._cfg.punkte_standard) || 10}"><span>pts</span></label></div><div class="rl">${sum(r.z, r.r, r.f)}</div></div>
          <div class="asg">${this._asg(r.uid, r.z, r.r, r.f)}</div>
          <button class="del${this._confirm === r.uid ? ' cf' : ''}" data-del>${this._confirm === r.uid ? 'Delete?' : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button>
        </div>`).join('');
      const nw = this._new;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:20px 22px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
        .head{display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap}.hsp{flex:1}.hadd{display:flex;align-items:center;gap:6px;height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#262626);color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer}.hadd ha-icon{--mdc-icon-size:18px;color:${G}}
        .badge{width:46px;height:46px;border-radius:12px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center}.badge ha-icon{--mdc-icon-size:26px}
        .title{font-size:20px;font-weight:600}.subt{font-size:13px;color:var(--fp-text2,#8c8c8c);margin-top:3px}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .ov{display:grid;grid-template-columns:150px repeat(7,minmax(34px,58px)) 70px;gap:4px;align-items:center;background:var(--fp-bg2,#232323);border-radius:12px;padding:12px;width:max-content;max-width:100%;box-sizing:border-box}
        .ovh{font-size:11px;color:var(--fp-text3,#777);text-align:center;text-transform:uppercase;letter-spacing:.8px}
        .ovp{display:flex;align-items:center;gap:8px;font-size:14px;min-width:0}.ovp span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ovc{height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
        .ovt{text-align:center;font-size:14px;color:var(--fp-text2,#bbb);font-weight:600}
        .list{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2f2f2f);border-radius:12px;overflow:hidden}
        .row{display:grid;grid-template-columns:minmax(200px,1fr) auto 56px;gap:16px;align-items:start;padding:14px;border-top:1px solid var(--fp-line,#313131)}.row:first-child{border-top:none}
        .in,.sel{background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text,#eee);border-radius:9px;height:44px;padding:0 12px;font:inherit;font-size:15px;width:100%;box-sizing:border-box;outline:none}
        .in:focus,.sel:focus{border-color:color-mix(in srgb,var(--fp-accent) 70%,transparent)}
        .sel{-webkit-appearance:none;appearance:none}
        .tl{display:flex;gap:8px}.pts{display:flex;align-items:center;gap:4px;flex:none;color:var(--fp-text3,#8a8a8a);font-size:12px}.pts .pn{width:70px;text-align:center;padding:0 6px}
        .rl{font-size:12px;color:var(--fp-text3,#8a8a8a);margin:6px 0 0 2px;line-height:1.6}.rl b{color:var(--fp-text2,#bbb);font-weight:600}
        .asg{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
        .ar{display:flex;align-items:center;gap:8px}
        .pn{width:74px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .days{display:flex;gap:4px}
        .day{width:40px;height:40px;border-radius:9px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#808080);font:inherit;font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}
        .day small{font-size:9px;font-weight:700;opacity:.9}
        .day.on{background:var(--cb);border-color:var(--c);color:var(--c)}
        .day.rh{border-style:dashed}
        .day.sel{box-shadow:0 0 0 2px #1e1e1e,0 0 0 4px var(--c)}
        .pre{height:32px;border-radius:var(--fp-radius,16px);background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#999);font:inherit;font-size:11px;padding:0 10px;cursor:pointer}
        .rmp{width:32px;height:32px;border-radius:50%;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);font-size:13px;cursor:pointer;padding:0}
        .pick{margin:8px 0 4px 38px;background:var(--fp-bg1,#1f1f1f);border:1px solid var(--c);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
        .pr{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
        .plb{font-size:12px;color:var(--c);font-weight:600;min-width:86px}
        .sg{height:34px;border-radius:17px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#bbb);font:inherit;font-size:12px;padding:0 12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .sg.on{background:var(--cb);border-color:var(--c);color:var(--c);font-weight:600}
        .sg.rm{color:#e06b6b;border-color:rgba(224,107,107,.5)}.sg.ok{margin-left:auto;background:${G};border-color:${G};color:var(--fp-on-accent,#142010);font-weight:600}
        .addp{width:220px;height:38px;font-size:13px;color:var(--fp-text2,#aaa);border-style:dashed}
        .del{height:44px;border-radius:9px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);cursor:pointer;font:inherit;font-size:11px;font-weight:600;padding:0;display:flex;align-items:center;justify-content:center}
        .del.cf{background:#e06b6b;border-color:#e06b6b;color:var(--fp-on-accent,#1e1e1e)}.del ha-icon{--mdc-icon-size:20px}
        .add{margin-top:16px;background:var(--fp-bg2,#232323);border:1px dashed var(--fp-line,#3d3d3d);border-radius:12px;padding:14px}
        .add .row{padding:0;border:none}
        .addb{height:44px;border-radius:9px;background:${G};border:none;color:var(--fp-on-accent,#142010);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.addb ha-icon{--mdc-icon-size:24px}
        .msg{font-size:13px;margin-top:10px;min-height:18px}
        .empty{padding:24px;text-align:center;color:var(--fp-text3,#777)}
        .foot{font-size:12px;color:var(--fp-text3,#666);margin-top:12px;line-height:1.5}
        .pers{display:flex;flex-wrap:wrap;gap:8px}
        .pc{display:flex;align-items:center;gap:10px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);border-radius:30px;padding:4px 14px 4px 4px;color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .pc ha-icon{--mdc-icon-size:14px;color:var(--fp-text3,#777)}.pc.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .ipk{margin-top:10px;background:var(--fp-bg2,#232323);border:1px solid var(--c);border-radius:14px;padding:14px 16px}
        .iph{display:flex;align-items:center;gap:14px;margin-bottom:6px}.iphn{flex:1}.iphn b{display:block;font-size:18px}.iphn span{font-size:12px;color:var(--fp-text3,#888)}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.upl .up{cursor:pointer;display:inline-flex;align-items:center}
        .ipl{font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px}
        .cols{display:flex;gap:8px;flex-wrap:wrap}
        .clr{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.clr.on{border-color:#fff;box-shadow:0 0 0 2px #1e1e1e inset}
        .igrid{display:flex;flex-wrap:wrap;gap:6px}
        .ips2{font-size:11px;color:var(--fp-text3,#777);margin-top:5px}
        .ib{width:56px;height:56px;border-radius:12px;background:var(--fp-bg3,#2a2a2a);border:1px solid var(--fp-line,#333);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
        .ib.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>
      <div class="card">
        <div class="head"><div class="badge"><ha-icon icon="mdi:clipboard-text-clock-outline"></ha-icon></div>
          <div><div class="title">${esc(this._cfg.titel)}</div><div class="subt">Tap a day = assign · tap again = time to do it (e.g. Wed to Sat) and rhythm (every 2–4 weeks). Changes apply right away.</div></div><span class="hsp"></span>
          <button class="hadd" data-hadd="special"><ha-icon icon="mdi:plus"></ha-icon>Special chore</button><button class="hadd" data-hadd="todo"><ha-icon icon="mdi:plus"></ha-icon>To-do</button></div>
        <div class="sec">Week overview</div>
        ${overview}
        <div class="sec">Chores</div>
        <div class="list">${body || '<div class="empty">No chores yet – add one below.</div>'}</div>
        <div class="add"><div class="sec" style="margin-top:0">New chore</div>
          <div class="row">
            <div class="tcol"><input class="in" data-new="t" placeholder="e.g. clear the table" value="${esc(nw.t)}"><div class="rl">${sum(nw.z, nw.r, nw.f || {})}</div></div>
            <div class="asg">${this._asg('new', nw.z, nw.r, nw.f || {})}</div>
            <button class="addb" data-add title="Add"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="msg" style="color:${this._msgErr ? '#E06B6B' : G}">${esc(this._msg || '')}</div>
        ${this._err ? `<div class="msg" style="color:#E06B6B">${esc(this._err)}</div>` : ''}
        <div class="foot">Dashed frame = deadline or rhythm ("4T" = 4 days, "2W" = every 2 weeks). A chore with a deadline only counts as missed once the deadline has passed. Every day at ${esc(this._cfg.tageswechsel || '24:00')} open chores are counted as missed and the chores for the new day are created.</div>
      </div>`;
    }
  }
  if (!customElements.get('fp-plan-inner-en')) customElements.define('fp-plan-inner-en', LoxAemtliPlanCard);
});

// ---------------------------------------------------------------------------
// Smart lists card ("Smarte Listen"): any to-do list, grouped by self-organising categories
// rendered inside custom:family-planer-card (view: lists)
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { add: 'Was fehlt?', addb: 'Hinzufügen', sorting: 'Wird einsortiert …', done: 'Erledigt', clear: 'Erledigte löschen',
      cats: 'Kategorien', optimize: 'Optimieren', optimizing: 'Optimiere …', move: 'Kategorie wählen', learned: 'Gemerkt: „{i}“ → {c}',
      empty: 'Die Liste ist leer – oben etwas hinzufügen.', nolists: 'Noch keine Liste eingerichtet. Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Smarte Listen.',
      unavailable: 'Liste nicht erreichbar', edit: 'Kategorien bearbeiten', limit: '{n} von max. {m}', newcat: '+ Kategorie', save: 'Speichern', cancel: 'Abbrechen',
      other: 'bleibt immer zuletzt', created: 'Neu: {x}', removed: 'Zusammengefasst: {x}', nothing: 'Alles ist schon gut sortiert.', err: 'Fehler: ', del: 'Löschen' },
    en: { add: 'What do you need?', addb: 'Add', sorting: 'Sorting …', done: 'Done', clear: 'Clear done',
      cats: 'Categories', optimize: 'Optimise', optimizing: 'Optimising …', move: 'Choose category', learned: 'Remembered: "{i}" → {c}',
      empty: 'The list is empty – add something above.', nolists: 'No list set up yet. Settings → Devices & services → Family Planer → Configure → Smart lists.',
      unavailable: 'List not available', edit: 'Edit categories', limit: '{n} of max. {m}', newcat: '+ Category', save: 'Save', cancel: 'Cancel',
      other: 'always stays last', created: 'New: {x}', removed: 'Merged: {x}', nothing: 'Everything is sorted well already.', err: 'Error: ', del: 'Delete' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));

  class FpListsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        const r = this.shadowRoot;
        r.addEventListener('click', (e) => this._click(e));
        r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.addin !== undefined) this._add(); });
        r.addEventListener('input', (e) => { if (e.target.dataset.addin !== undefined) this._draft = e.target.value; if (e.target.dataset.cn !== undefined) this._edit[+e.target.dataset.cn].name = e.target.value; });
      }
      try { this._sel = this._sel || localStorage.getItem('fp_list') || null; } catch (e) { /* ignore */ }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) this._resub(); }
    disconnectedCallback() { this._unsub(); }
    connectedCallback() { if (this._hass && !this._sub) this._resub(); }
    update() { this._resub(); this._render(); }
    _lists() { return (this._store && this._store.snap && this._store.snap.lists) || []; }
    _cur() { const ls = this._lists(); return ls.find((l) => l.id === this._sel) || ls[0] || null; }
    _unsub() { if (this._sub) { this._sub.then((u) => u && u()).catch(() => {}); this._sub = null; this._subEnt = null; } }
    _resub() {
      const l = this._cur(); if (!this._hass || !l || !this.isConnected) return;
      if (this._subEnt === l.entity) return;
      this._unsub(); this._items = null; this._subEnt = l.entity; this._err = null;
      this._sub = this._hass.connection.subscribeMessage((m) => { this._items = m.items || []; this._render(); },
        { type: 'todo/item/subscribe', entity_id: l.entity }).catch((e) => { this._err = (e && e.message) || String(e); this._render(); });
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _svc(service, data) { const l = this._cur(); return this._hass.callService('todo', service, data, { entity_id: l.entity }).catch((e) => this._flash(this.T.err + (e.message || e), true)); }
    _add() {
      const v = (this._draft || '').trim(); if (!v) return;
      this._draft = ''; const inp = this.shadowRoot.querySelector('[data-addin]'); if (inp) inp.value = '';
      this._svc('add_item', { item: v });
    }
    async _click(e) {
      const t = e.target; const l = this._cur();
      const tab = t.closest('[data-tab]');
      if (tab) { this._sel = tab.dataset.tab; try { localStorage.setItem('fp_list', this._sel); } catch (er) { /* ignore */ } this._move = null; this._resub(); this._render(); return; }
      if (!l) return;
      if (t.closest('[data-addb]')) { this._add(); return; }
      const mv = t.closest('[data-mv]');
      if (mv) { e.stopPropagation(); this._move = mv.dataset.mv; this._render(); return; }
      const to = t.closest('[data-to]');
      if (to && this._move) {
        const item = this._move; const cat = l.categories.find((c) => c.id === to.dataset.to); this._move = null;
        this._store.pws('family_planer/list/assign', { list_id: l.id, item, category_id: cat.id })
          .then(() => this._flash(fmt(this.T.learned, { i: item, c: cat.name }))).catch((er) => (er === (window.FPPIN && window.FPPIN.CANCEL) ? null : this._flash(this.T.err + (er.message || er), true)));
        this._render(); return;
      }
      if (t.classList.contains('ov') || t.closest('[data-x]')) { this._move = null; this._edit = null; this._render(); return; }
      const it = t.closest('[data-uid]');
      if (it) { const done = it.dataset.st === 'completed'; it.classList.toggle('done'); this._svc('update_item', { item: it.dataset.uid, status: done ? 'needs_action' : 'completed' }); return; }
      if (t.closest('[data-clear]')) { this._hass.callService('todo', 'remove_completed_items', {}, { entity_id: l.entity }).catch((er) => (er === (window.FPPIN && window.FPPIN.CANCEL) ? null : this._flash(this.T.err + (er.message || er), true))); return; }
      if (t.closest('[data-showdone]')) { this._showDone = !this._showDone; this._render(); return; }
      if (t.closest('[data-opt]')) {
        if (this._busy) return; this._busy = true; this._render();
        try {
          const r = await this._store.pws('family_planer/list/refresh', { list_id: l.id, ai: true });
          const parts = [];
          if (r && r.created && r.created.length) parts.push(fmt(this.T.created, { x: r.created.join(', ') }));
          if (r && r.removed && r.removed.length) parts.push(fmt(this.T.removed, { x: r.removed.join(', ') }));
          this._flash(parts.join(' · ') || this.T.nothing);
        } catch (er) { this._flash(this.T.err + (er.message || er), true); }
        this._busy = false; this._render(); return;
      }
      if (t.closest('[data-cats]')) { this._edit = l.categories.map((c) => ({ ...c })); this._render(); return; }
      if (this._edit) {
        const up = t.closest('[data-up]'); const dn = t.closest('[data-dn]'); const rm = t.closest('[data-rm]');
        const ed = this._edit; const others = ed.filter((c) => c.id !== 'other');
        if (up || dn) { const i = +(up || dn).dataset[up ? 'up' : 'dn']; const j = i + (up ? -1 : 1); if (j >= 0 && j < others.length) { [others[i], others[j]] = [others[j], others[i]]; this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; } this._render(); return; }
        if (rm) { const i = +rm.dataset.rm; others.splice(i, 1); this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; this._render(); return; }
        if (t.closest('[data-newcat]')) { if (ed.length < l.max_categories) { others.push({ id: null, name: '', icon: 'mdi:tag-outline' }); this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; } this._render(); return; }
        if (t.closest('[data-save]')) {
          const cats = this._edit.filter((c) => (c.name || '').trim()).map((c) => ({ id: c.id, name: c.name.trim(), icon: c.icon }));
          this._edit = null; this._render();
          this._store.pws('family_planer/list/categories', { list_id: l.id, categories: cats }).catch((er) => (er === (window.FPPIN && window.FPPIN.CANCEL) ? null : this._flash(this.T.err + (er.message || er), true)));
        }
      }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const ls = this._lists(); const l = this._cur();
      const active = this.shadowRoot.activeElement; const keepFocus = active && active.dataset && active.dataset.addin !== undefined;
      let body = '';
      if (!l) body = `<div class="empty">${esc(T.nolists)}</div>`;
      else if (this._err) body = `<div class="empty">${esc(T.unavailable)}: ${esc(this._err)}</div>`;
      else if (this._items) {
        const open = this._items.filter((i) => i.status === 'needs_action');
        const done = this._items.filter((i) => i.status === 'completed');
        const groups = new Map(l.categories.map((c) => [c.id, []])); const pending = [];
        open.forEach((i) => { const cid = l.map[i.summary]; if (cid && groups.has(cid)) groups.get(cid).push(i); else pending.push(i); });
        const row = (i) => `<div class="it${i.status === 'completed' ? ' done' : ''}" data-uid="${esc(i.uid)}" data-st="${i.status}"><span class="cb"></span><span class="tx">${esc(i.summary)}</span>${i.status === 'needs_action' ? `<button class="mv" data-mv="${esc(i.summary)}" title="${esc(T.move)}"><ha-icon icon="mdi:swap-horizontal"></ha-icon></button>` : ''}</div>`;
        const sec = (icon, name, items, cls) => `<section class="${cls || ''}"><h3><ha-icon icon="${esc(icon)}"></ha-icon><span>${esc(name)}</span><em>${items.length}</em></h3>${items.map(row).join('')}</section>`;
        const secs = [];
        if (pending.length) secs.push(sec('mdi:timer-sand', T.sorting, pending, 'pend'));
        l.categories.forEach((c) => { const g = groups.get(c.id); if (g.length) secs.push(sec(c.icon || 'mdi:tag-outline', c.name, g)); });
        body = (secs.length ? `<div class="cols">${secs.join('')}</div>` : `<div class="empty">${esc(T.empty)}</div>`) +
          (done.length ? `<div class="dn"><button class="lnk" data-showdone><ha-icon icon="mdi:chevron-${this._showDone ? 'up' : 'down'}"></ha-icon>${esc(T.done)} (${done.length})</button><button class="lnk" data-clear><ha-icon icon="mdi:broom"></ha-icon>${esc(T.clear)}</button></div>` +
            (this._showDone ? `<div class="donel">${done.map(row).join('')}</div>` : '') : '');
      }
      const moveDlg = this._move && l ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.move)}<b>${esc(this._move)}</b></div><div class="chips">${l.categories.map((c) => `<button class="chip${l.map[this._move] === c.id ? ' on' : ''}" data-to="${esc(c.id)}"><ha-icon icon="${esc(c.icon || 'mdi:tag-outline')}"></ha-icon>${esc(c.name)}</button>`).join('')}</div></div></div>` : '';
      const ed = this._edit;
      const editDlg = ed && l ? (() => { const others = ed.filter((c) => c.id !== 'other'); const oth = ed.find((c) => c.id === 'other');
        return `<div class="ov"><div class="dlg wide"><div class="dh">${esc(T.edit)} · ${esc(l.name)}<span class="lim">${esc(fmt(T.limit, { n: ed.length, m: l.max_categories }))}</span></div>
          ${others.map((c, i) => `<div class="er"><ha-icon icon="${esc(c.icon || 'mdi:tag-outline')}"></ha-icon><input class="in" data-cn="${ed.indexOf(c)}" value="${esc(c.name)}"><button class="ib" data-up="${i}"><ha-icon icon="mdi:arrow-up"></ha-icon></button><button class="ib" data-dn="${i}"><ha-icon icon="mdi:arrow-down"></ha-icon></button><button class="ib rm" data-rm="${i}" title="${esc(T.del)}"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button></div>`).join('')}
          ${oth ? `<div class="er"><ha-icon icon="${esc(oth.icon)}"></ha-icon><input class="in" data-cn="${ed.indexOf(oth)}" value="${esc(oth.name)}"><span class="hint">${esc(T.other)}</span></div>` : ''}
          <div class="ea">${ed.length < l.max_categories ? `<button class="sg" data-newcat>${esc(T.newcat)}</button>` : '<span></span>'}<span class="sp"></span><button class="sg" data-x>${esc(T.cancel)}</button><button class="sg ok" data-save>${esc(T.save)}</button></div></div></div>`; })() : '';
      const openCount = (x) => (x.id === (l && l.id) && this._items ? this._items.filter((i) => i.status === 'needs_action').length : null);
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:16px;font-family:var(--fp-font);color:var(--fp-text,#ececec);position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .tabs{display:flex;gap:8px;flex-wrap:wrap;flex:1}
        .tab{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#ccc);font:inherit;font-size:14px;cursor:pointer}
        .tab.on{background:color-mix(in srgb,var(--fp-accent) 1600%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:${G};font-weight:600}
        .tab em{font-style:normal;font-size:11px;background:var(--fp-bg4,#333);color:var(--fp-text,#ddd);border-radius:9px;padding:1px 7px}
        .tab.on em{background:${G};color:var(--fp-on-accent,#141414)}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        .tb.busy ha-icon{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
        ha-icon{--mdc-icon-size:18px}
        .addr{display:flex;gap:8px;margin:14px 0 16px}
        .in{flex:1;height:44px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 14px;outline:none;min-width:0}
        .in:focus{border-color:${G}}
        .addb{width:52px;height:44px;border-radius:10px;border:none;background:${G};color:var(--fp-on-accent,#141414);cursor:pointer}
        .addb ha-icon{--mdc-icon-size:24px}
        .cols{columns:3 250px;column-gap:12px}
        section{break-inside:avoid;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2c2c2c);border-radius:12px;padding:10px 10px 6px;margin:0 0 12px}
        section.pend{border-style:dashed;border-color:var(--fp-line,#4a4a4a)}
        h3{display:flex;align-items:center;gap:8px;margin:0 2px 8px;font-size:12px;font-weight:600;color:var(--fp-text2,#9a9a9a);text-transform:uppercase;letter-spacing:1px}
        h3 ha-icon{color:${G}}h3 span{flex:1}h3 em{font-style:normal;color:var(--fp-text3,#666)}
        .it{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 4px 0 10px;border-radius:9px;background:var(--fp-bg3,#2a2a2a);margin-bottom:6px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .cb{width:20px;height:20px;border-radius:50%;border:2px solid var(--fp-line,#5a5a5a);flex:none;box-sizing:border-box}
        .it.done{background:var(--fp-bg2,#202820)}.it.done .cb{background:${G};border-color:${G}}.it.done .tx{color:var(--fp-text3,#6f8a66);text-decoration:line-through}
        .tx{flex:1;font-size:15px;line-height:1.25;padding:8px 0;word-break:break-word}
        .mv{width:36px;height:36px;border:none;background:none;color:var(--fp-text3,#666);cursor:pointer;border-radius:8px}
        .mv:hover{color:var(--fp-text2,#ccc);background:var(--fp-bg4,#333)}
        .dn{display:flex;gap:10px;margin-top:4px}
        .lnk{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--fp-text3,#888);font:inherit;font-size:13px;cursor:pointer;padding:6px 4px}
        .donel{columns:3 250px;column-gap:12px;margin-top:6px}
        .empty{color:var(--fp-text3,#888);padding:30px 10px;text-align:center;font-size:14px}
        .msg{position:absolute;left:50%;transform:translateX(-50%);top:12px;background:#2e3a2a;border:1px solid ${G};color:var(--fp-text,#dfe);padding:8px 16px;border-radius:10px;font-size:13px;z-index:5}
        .msg.e{background:#3a2626;border-color:#e06b6b}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:flex-start;justify-content:center;padding-top:60px;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:16px;width:min(560px,92%)}
        .dlg.wide{width:min(640px,94%)}
        .dh{font-size:13px;color:var(--fp-text2,#999);margin-bottom:12px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.dh b{color:var(--fp-text,#eee);font-size:16px}
        .lim{margin-left:auto;font-size:12px;color:var(--fp-text3,#777)}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .chip{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:20px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer}
        .chip.on{border-color:${G};color:${G}}
        .er{display:flex;align-items:center;gap:8px;margin-bottom:8px}.er>ha-icon{color:${G}}
        .er .in{height:38px;font-size:14px}
        .ib{width:38px;height:38px;border-radius:9px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#bbb);cursor:pointer}
        .ib.rm:hover{color:#e06b6b}
        .hint{font-size:12px;color:var(--fp-text3,#777);white-space:nowrap}
        .ea{display:flex;gap:8px;margin-top:12px;align-items:center}.sp{flex:1}
        .sg{height:38px;border-radius:19px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>
      <div class="card">
        <div class="top"><div class="tabs">${ls.map((x) => { const n = openCount(x); return `<button class="tab${l && x.id === l.id ? ' on' : ''}" data-tab="${esc(x.id)}"><ha-icon icon="${esc(x.icon || 'mdi:format-list-checks')}"></ha-icon>${esc(x.name)}${n ? `<em>${n}</em>` : ''}</button>`; }).join('')}</div>
          ${l ? `<button class="tb" data-cats><ha-icon icon="mdi:shape-outline"></ha-icon>${esc(T.cats)}</button><button class="tb${this._busy ? ' busy' : ''}" data-opt><ha-icon icon="mdi:auto-fix"></ha-icon>${esc(this._busy ? T.optimizing : T.optimize)}</button>` : ''}</div>
        ${l ? `<div class="addr"><input class="in" data-addin placeholder="${esc(T.add)}" value="${esc(this._draft || '')}" enterkeyhint="done"><button class="addb" data-addb title="${esc(T.addb)}"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ''}
        ${body}
        ${moveDlg}${editDlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
      if (keepFocus) { const i = this.shadowRoot.querySelector('[data-addin]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    }
  }
  if (!customElements.get('fp-lists-inner')) customElements.define('fp-lists-inner', FpListsInner);
})();

// ---------------------------------------------------------------------------
// Points & rewards card: levels, trophies, reward shop per person, parent approval (admin or PIN), history
// rendered inside custom:family-planer-card (view: rewards)
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { title: 'Punkte & Belohnungen', pts: 'Punkte', lvl: 'Level', next: 'noch {n} bis Level {l}', max: 'Höchstes Level erreicht!',
      shop: 'Belohnungen für {name}', shopAll: 'Alle Belohnungen', forAll: 'Für alle', pickHint: 'Person antippen, um ihre Belohnungen zu sehen und einzulösen.', forOnly: 'nur für {n}', redeem: 'Einlösen', missing: 'noch {n} Punkte', approval: 'mit Freigabe', noapproval: 'sofort',
      week: 'max. {n}× pro Woche', none: 'Noch keine Belohnungen. Mit „+ Belohnung“ auf einer Person anlegen (Eltern-PIN); ohne Auswahl im Dialog gilt sie für alle.',
      pending: 'Wartet auf Freigabe', approve: 'Freigeben', deny: 'Ablehnen', history: 'Verlauf', bonus: 'Punkte geben',
      pin: 'Eltern-PIN', ok: 'OK', cancel: 'Abbrechen', reason: 'Grund (optional)', give: 'Vergeben',
      sent: '„{t}“ angefragt – die Eltern werden benachrichtigt.', done: '„{t}“ eingelöst. Viel Spass!', approved: 'Freigegeben', denied: 'Abgelehnt',
      reserved: '{n} reserviert', err: { not_enough_points: 'Nicht genug Punkte.', weekly_limit: 'Diese Woche schon so oft eingelöst.', not_allowed: 'Diese Belohnung ist nicht für dich.', unauthorized: 'Falsche PIN oder keine Berechtigung.', pin_wrong: 'Falsche PIN.', pin_locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.' },
      kinds: { chore: 'Ämtli', bonus: 'Tagesbonus', streak: 'Serienbonus', adjust: 'Bonus', reward: 'Belohnung', carry: 'Übertrag', todo: 'To-do', award: 'Auszeichnung' },
      edit: 'Bearbeiten', editDone: 'Fertig', add: 'Neue Belohnung', changePin: 'PIN ändern', del: 'Löschen', save: 'Speichern',
      rTitle: 'Belohnung', rIcon: 'Icon', rCost: 'Kosten in Punkten', rApproval: 'Eltern müssen freigeben', rPersons: 'Nur für (leer = alle)', rWeek: 'Höchstens pro Woche (0 = unbegrenzt)',
      delAsk: '„{t}“ wirklich löschen? Offene Anfragen dafür werden abgelehnt.', saved: 'Gespeichert.', pinChanged: 'Eltern-PIN geändert.',
      startPin: 'Die Start-PIN 123456 ist noch aktiv. Bitte jetzt eine eigene Eltern-PIN festlegen – vorher sind Belohnungen und Einstellungen gesperrt.',
      rCat: 'Kategorie', own: 'Eigene Punkte', approx: 'ca.', minus: 'Abziehen',
      sizes: { s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Mega gross', xxl: 'Riesig' },
      catHint: 'Gross = so viel, wie man in einem Monat mit allen Ämtli verdient (inkl. Boni). Die Punkte passen sich an, wenn die Punkte-Einstellungen ändern.',
      open: 'Noch zu gewinnen', fam: 'Familie', per: { week: 'jede Woche', month: 'jeden Monat', reach: 'beim Erreichen', day: 'jeden Tag' }, lead: 'Vorne: {n}', noLead: 'Noch niemand vorne',
      units: { pct: '{n} %', days: '{n} Tage', chores: '{n} Ämtli' }, worth: '+{n} Punkte', addFor: 'Belohnung', saving: 'Spart für', waiting: 'Wartet auf Freigabe',
      ready: 'Jetzt einlösbar', inDays: 'in ca. {n} Tagen', inDay: 'morgen', noPace: 'noch keine Prognose', nothing: 'Noch nichts am Laufen',
      fc: 'Prognose', fcFam: 'Familienschnitt ({p} Punkte/Tag): ca. {n} Tage', fcNow: 'jetzt', awards: 'Auszeichnungen', noAw: 'Noch keine – siehe oben, was es zu gewinnen gibt.' },
    en: { title: 'Points & rewards', pts: 'points', lvl: 'Level', next: '{n} more to level {l}', max: 'Highest level reached!',
      shop: 'Rewards for {name}', shopAll: 'All rewards', forAll: 'For everyone', pickHint: 'Tap a person to see and redeem their rewards.', forOnly: 'only for {n}', redeem: 'Redeem', missing: '{n} points to go', approval: 'needs approval', noapproval: 'instant',
      week: 'max. {n}× per week', none: 'No rewards yet. Add one with "+ Reward" on a person (parent PIN); with nobody chosen in the dialog it is for everyone.',
      pending: 'Waiting for approval', approve: 'Approve', deny: 'Decline', history: 'History', bonus: 'Give points',
      pin: 'Parent PIN', ok: 'OK', cancel: 'Cancel', reason: 'Reason (optional)', give: 'Give',
      sent: '"{t}" requested – the parents are notified.', done: '"{t}" redeemed. Have fun!', approved: 'Approved', denied: 'Declined',
      reserved: '{n} reserved', err: { not_enough_points: 'Not enough points.', weekly_limit: 'Already redeemed that often this week.', not_allowed: 'This reward is not for you.', unauthorized: 'Wrong PIN or not allowed.', pin_wrong: 'Wrong PIN.', pin_locked: 'Too many wrong tries – please wait 5 minutes.' },
      kinds: { chore: 'Chore', bonus: 'Day bonus', streak: 'Streak bonus', adjust: 'Bonus', reward: 'Reward', carry: 'Carried over', todo: 'To-do', award: 'Award' },
      edit: 'Edit', editDone: 'Done', add: 'New reward', changePin: 'Change PIN', del: 'Delete', save: 'Save',
      rTitle: 'Reward', rIcon: 'Icon', rCost: 'Cost in points', rApproval: 'Parents must approve', rPersons: 'Only for (empty = everyone)', rWeek: 'At most per week (0 = unlimited)',
      delAsk: 'Really delete "{t}"? Pending requests for it are declined.', saved: 'Saved.', pinChanged: 'Parent PIN changed.',
      startPin: 'The start PIN 123456 is still active. Please choose your own parent PIN now – until then rewards and settings are locked.',
      rCat: 'Category', own: 'Own points', approx: 'approx.', minus: 'Take away',
      sizes: { s: 'Small', m: 'Medium', l: 'Large', xl: 'Mega', xxl: 'Giant' },
      catHint: 'Large = what you earn in a month with every chore done (incl. bonuses). Points follow the point settings automatically.',
      open: 'Still to win', fam: 'Family', per: { week: 'every week', month: 'every month', reach: 'when reached', day: 'every day' }, lead: 'Ahead: {n}', noLead: 'Nobody ahead yet',
      units: { pct: '{n} %', days: '{n} days', chores: '{n} chores' }, worth: '+{n} points', addFor: 'Reward', saving: 'Saving for', waiting: 'Waiting for approval',
      ready: 'Can be redeemed now', inDays: 'in about {n} days', inDay: 'tomorrow', noPace: 'no forecast yet', nothing: 'Nothing running yet',
      fc: 'Forecast', fcFam: 'Family average ({p} points/day): about {n} days', fcNow: 'now', awards: 'Awards', noAw: 'None yet – see above what there is to win.' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const RSIZES = ['s', 'm', 'l', 'xl', 'xxl'];
  const UNIT = { crown: 'pct', climber: 'pct', perfect: 'pct', weekend: 'pct', trophy: 'pct', bee: 'days', early: 'days', diamond: 'days', milestone: 'chores' };
  const MILES = [100, 500, 1000];
  // days until a person can afford `cost` at their current pace (null = no pace yet)
  const daysTo = (s, pid, cost) => { const pace = s.pace || {}; const have = ((s.points || {})[pid] || {}).available || 0; if (have >= cost) return 0;
    const v = (pace.persons || {})[pid] || pace.family || 0; return v > 0 ? Math.ceil((cost - have) / v) : null; };
  const money = (s, k) => { const z = s.sizes || {}; const v = (z.values || {})[k]; return v ? `${Number(v).toLocaleString('de-CH', { maximumFractionDigits: 2 })} ${z.currency || ''}`.trim() : ''; };
  const av = (p, size) => (window.FPX && window.FPX.avatarHtml
    ? window.FPX.avatarHtml({ name: p.name, farbe: COLOR(p.color), bild: /^(av:[a-z0-9.+]+|av2:[a-z0-9.]+|svg:[a-z-]+|img:\/family_planer_files\/avatars\/[a-z0-9_]+\.(jpg|png|webp))$/.test(p.image || '') ? p.image : '' }, size)
    : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${p.color};display:inline-block"></span>`);

  class FpRewardsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { const d = e.target.dataset; if (!this._dlg) return; if (d.bp !== undefined) this._dlg.points = e.target.value; if (d.br !== undefined) this._dlg.reason = e.target.value;
          if (d.rf) this._dlg.r[d.rf] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; });
        this.shadowRoot.addEventListener('change', (e) => { const d = e.target.dataset; if (this._dlg && d.rf && e.target.type === 'checkbox') this._dlg.r[d.rf] = e.target.checked; });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { this._render(); }
    _snap() { return (this._store && this._store.snap) || null; }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4000); }
    _errText(e) { const code = String((e && (e.code || e.message)) || e).replace(/^reward_/, ''); return this.T.err[code] || (e && e.message) || code; }
    _isAdmin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
    _ctx() { return { lang: this._cfg.lang, host: this }; }
    // approvals and points: admins act directly, everyone else with the parent PIN (unlock token)
    async _parent(action) {
      if (this._isAdmin()) return action({});
      try { const token = await window.FPPIN.ensure(this._store, this._ctx()); return action({ token }); } catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(this._errText(e), true); return null; }
    }
    // reward changes: always the parent PIN, also for admins
    async _pinned(type, data) {
      try { return await window.FPPIN.call(this._store, type, data, this._ctx()); } catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(this._errText(e), true); return null; }
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const er0 = t.closest('[data-redit]');
      if (er0) { const r = s.rewards.find((x) => x.id === er0.dataset.redit); if (r) { this._dlg = { kind: 'reward', id: r.id, r: { ...r, size: r.size || 'custom', persons: [...(r.persons || [])] } }; this._render(); } return; }
      const ra = t.closest('[data-radd]');
      if (ra) { const r = { title: '', icon: 'mdi:gift-outline', size: 's', cost: ((s.sizes || {}).reward || {}).s || 100, approval: true, persons: [ra.dataset.radd], per_week: 0 };
        this._dlg = { kind: 'reward', id: null, r }; this._render(); return; }
      const pc = t.closest('[data-p]'); if (pc) { this._sel = this._sel === pc.dataset.p ? null : pc.dataset.p; this._render(); return; }
      const rd = t.closest('[data-redeem]');
      if (rd) {
        const r = s.rewards.find((x) => x.id === rd.dataset.redeem); const pid = this._sel; if (!pid) return;
        try { const res = await this._store.ws('family_planer/reward/redeem', { person_id: pid, reward_id: r.id }); this._flash(fmt(res.status === 'approved' ? this.T.done : this.T.sent, { t: r.title })); } catch (er) { this._flash(this._errText(er), true); }
        return;
      }
      const dc = t.closest('[data-decide]');
      if (dc) { const id = dc.dataset.decide; const approve = dc.dataset.ok === '1'; this._parent((extra) => this._store.ws('family_planer/reward/decide', { request_id: id, approve, ...extra }).then(() => this._flash(approve ? this.T.approved : this.T.denied)).catch((er) => this._flash(this._errText(er), true))); return; }
      if (t.closest('[data-chpin]')) {
        try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); }
        return;
      }
      const er = t.closest('[data-redit]');
      if (er) {
        const r = s.rewards.find((x) => x.id === er.dataset.redit) || { title: '', icon: 'mdi:gift-outline', size: 's', cost: ((s.sizes || {}).reward || {}).s || 100, approval: true, persons: [], per_week: 0 };
        this._dlg = { kind: 'reward', id: r.id || null, r: { ...r, size: r.size || (r.id ? 'custom' : 's'), persons: [...(r.persons || [])] } }; this._render(); return;
      }
      const rz = t.closest('[data-rsize]');
      if (rz && this._dlg && this._dlg.kind === 'reward') { const k = rz.dataset.rsize; this._dlg.r.size = k; if (k !== 'custom') this._dlg.r.cost = ((s.sizes || {}).reward || {})[k] || this._dlg.r.cost; this._render(); return;
      }
      const ic = t.closest('[data-ricon]'); if (ic && this._dlg && this._dlg.kind === 'reward') { this._dlg.r.icon = ic.dataset.ricon; this._render(); return; }
      const rp = t.closest('[data-rperson]');
      if (rp && this._dlg && this._dlg.kind === 'reward') { const ps = this._dlg.r.persons; const i = ps.indexOf(rp.dataset.rperson); if (i >= 0) ps.splice(i, 1); else ps.push(rp.dataset.rperson); this._render(); return; }
      if (t.closest('[data-rsave]') && this._dlg) {
        const d = this._dlg; const r = d.r; if (!String(r.title || '').trim()) return;
        const data = { title: r.title, icon: r.icon, cost: Math.round(Number(r.cost) || 0), approval: !!r.approval, persons: r.persons, per_week: Math.round(Number(r.per_week) || 0), ...(RSIZES.includes(r.size) ? { size: r.size } : {}) };
        const res = await this._pinned('family_planer/reward/save', { ...(d.id ? { reward_id: d.id } : {}), data });
        if (res) { this._dlg = null; this._flash(this.T.saved); }
        return;
      }
      if (t.closest('[data-rdel]') && this._dlg) { this._dlg = { kind: 'confirm', id: this._dlg.id, title: this._dlg.r.title }; this._render(); return; }
      if (t.closest('[data-ryes]') && this._dlg) {
        const res = await this._pinned('family_planer/reward/remove', { reward_id: this._dlg.id });
        if (res !== null) { this._dlg = null; this._flash(this.T.saved); }
        return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const s = this._snap();
      if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons; const sel = persons.find((p) => p.id === this._sel) || null;  // nobody selected = everything
      const pts = s.points || {};
      const FX = (this._cfg.lang === 'en' ? window.FPX_EN : window.FPX) || window.FPX || {}; const AWT = FX.AWT || {}; const AWR = FX.AWR || [];
      const et = (s.settings || {}).early_time || '12:00'; const apts = s.award_points || {};
      const awName = (id, v) => String((AWT[id] || [id])[0]).replace(/\{n\}/g, v == null ? '' : v);
      const medal = (a, big) => `<span class="md${big ? ' big' : ''}" style="--mc:${COLOR(a.color)}" title="${esc(awName(a.id, a.value))}"><ha-icon icon="${esc(a.icon)}"></ha-icon></span>`;
      const ring = (p, size) => { const r = (s.awards || {})[p.id] || {}; const fr = ['platinum', 'gold', 'silver', 'bronze'].includes(r.frame) ? r.frame : '';
        const crown = (r.list || []).some((a) => a.id === 'crown');
        return `<div class="ring${fr ? ' fr-' + fr : ''}" style="width:${size}px;height:${size}px"><span class="ava" style="width:${size}px;height:${size}px">${av(p, size)}</span>${String(p.image || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(p.image) : ''}${crown ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>`; };
      const forP = (r, pid) => !r.persons || !r.persons.length || r.persons.includes(pid);
      const eta = (pid, cost) => { const d = daysTo(s, pid, cost); return d === 0 ? T.ready : d == null ? T.noPace : d === 1 ? T.inDay : fmt(T.inDays, { n: d }); };
      // what is running for a person: requests waiting for approval, rewards made for them, else the next goal
      const running = (p) => { const x = pts[p.id] || {}; const have = x.available || 0;
        const wait = s.requests.filter((q) => q.status === 'pending' && q.pid === p.id).map((q) => `<div class="run w"><ha-icon icon="mdi:timer-sand"></ha-icon><span><b>${esc(q.title)}</b><em>${esc(T.waiting)}</em></span></div>`);
        let goals = s.rewards.filter((r) => r.persons && r.persons.includes(p.id));
        if (!goals.length) goals = s.rewards.filter((r) => forP(r, p.id) && r.cost > have).sort((u, v) => u.cost - v.cost).slice(0, 1);
        const g = goals.slice(0, 3 - Math.min(wait.length, 2)).map((r) => `<div class="run" data-redit="${esc(r.id)}" role="button"><ha-icon icon="${esc(r.icon)}"></ha-icon><span><b>${esc(r.title)}</b>
          <i class="bar"><i style="width:${Math.min(100, Math.round((have / Math.max(1, r.cost)) * 100))}%"></i></i><em>${Math.min(have, r.cost)} / ${r.cost} · ${esc(eta(p.id, r.cost))}</em></span></div>`);
        const all = [...wait, ...g]; return all.length ? all.join('') : `<div class="run none">${esc(T.nothing)}</div>`; };
      const cards = persons.map((p) => { const x = pts[p.id] || { balance: 0, available: 0, level: 1, name: '', progress: 0, next: null, lifetime: 0 };
        const aw = ((s.awards || {})[p.id] || {}).list || [];
        return `<div class="pc${sel && p.id === sel.id ? ' on' : ''}" data-p="${esc(p.id)}" role="button" tabindex="0" style="--c:${COLOR(p.color)}">
          <div class="ph">${ring(p, 56)}
          <div class="pi"><b>${esc(p.name)}</b><span class="lv"><i class="tierdot" style="background:${COLOR(x.tier_color)}"></i>${esc(T.lvl)} ${x.level} · ${esc(x.name)}</span>
          <span class="bar"><i style="width:${Math.max(3, x.progress)}%"></i></span>
          <span class="nx">${x.next == null ? esc(T.max) : esc(fmt(T.next, { n: x.next - (x.xp != null ? x.xp : x.lifetime), l: x.level + 1 }))}</span></div>
          <div class="pt"><strong>${x.balance}</strong><span>${esc(T.pts)}</span>${x.balance !== x.available ? `<em>${esc(fmt(T.reserved, { n: x.balance - x.available }))}</em>` : ''}</div></div>
          ${aw.length ? `<div class="mds">${aw.slice(0, 6).map((a) => medal(a)).join('')}${aw.length > 6 ? `<span class="mdm">+${aw.length - 6}</span>` : ''}</div>` : ''}
          <div class="runs">${running(p)}</div>
          <button class="add1" data-radd="${esc(p.id)}"><ha-icon icon="mdi:plus"></ha-icon>${esc(T.addFor)}</button></div>`; }).join('');
      const oa = (s.open_awards || []).filter((a) => AWR.some((r) => r[0] === a.id));
      const openAw = oa.length ? `<div class="sec">${esc(T.open)}</div><div class="oas">${oa.map((a) => { const rule = (AWR.find((r) => r[0] === a.id) || [])[4] || '';
          const lp = persons.find((p) => p.id === a.leader); const u = T.units[UNIT[a.id]] || '{n}';
          const nm = a.id === 'milestone' ? awName('milestone', MILES.find((m) => m > (a.value || 0)) || 1000) : awName(a.id, a.id === 'diamond' ? 30 : '');
          return `<div class="oa" style="--mc:${COLOR(a.color)}">${medal(a, true)}<div class="ot"><b>${esc(nm)}</b><span>${esc(rule.replace('{t}', et))}</span>
            <span class="om"><em>${esc(T.per[a.period] || '')}</em>${apts[a.id] ? `<em class="pp">${esc(fmt(T.worth, { n: apts[a.id] }))}</em>` : ''}
            ${lp && a.value ? `<em class="ld">${av(lp, 18)}${esc(fmt(T.lead, { n: lp.name }))} · ${esc(fmt(u, { n: a.value }))}</em>` : `<em>${esc(T.noLead)}</em>`}</span></div></div>`; }).join('')}</div>` : '';
      const selAw = sel ? (((s.awards || {})[sel.id] || {}).list || []) : [];
      const detail = sel ? `<div class="sec">${esc(T.awards)} · ${esc(sel.name)}</div>${selAw.length ? `<div class="oas">${selAw.map((a) => { const tx = AWT[a.id] || [a.id, ''];
          const f = (x) => String(x).replace(/\{n\}/g, a.value == null ? '' : a.value).replace('{t}', et);
          return `<div class="oa won" style="--mc:${COLOR(a.color)}">${medal(a, true)}<div class="ot"><b>${esc(f(tx[0]))}</b><span>${esc(f(tx[1]))}</span>${a.since ? `<span class="om"><em>${esc(String(a.since).slice(0, 10).split('-').reverse().join('.'))}</em></span>` : ''}</div></div>`; }).join('')}</div>` : `<div class="hint2">${esc(T.noAw)}</div>`}` : '';
      const avail = sel ? (pts[sel.id] || {}).available || 0 : 0;
      const rw = !sel ? s.rewards : s.rewards.filter((r) => !r.persons || !r.persons.length || r.persons.includes(sel.id));
      const pen = (r) => `<button class="pen" data-redit="${esc(r.id)}" title="${esc(T.edit)}" aria-label="${esc(T.edit)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>`;
      const shop = !s.rewards.length ? `<div class="empty">${esc(T.none)}</div>` : !sel ? `<div class="hint2">${esc(T.pickHint)}</div><div class="shop">${rw.map((r) => { const who = (r.persons && r.persons.length ? persons.filter((p) => r.persons.includes(p.id)) : []);
          return `<div class="rw"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}</span>
          <span class="who">${who.length ? who.map((p) => `<button class="wp" data-p="${esc(p.id)}" style="--c:${COLOR(p.color)}">${av(p, 20)}${esc(p.name)}</button>`).join('') : `<em class="wa">${esc(T.forAll)}</em>`}</span></div>${pen(r)}</div>`; }).join('')}</div>`
        : `<div class="shop">${rw.map((r) => { const ok = avail >= r.cost;
        return `<div class="rw${ok ? '' : ' lock'}"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}</span>
          ${ok ? '' : `<span class="ms"><span class="bar"><i style="width:${Math.round((avail / r.cost) * 100)}%"></i></span>${esc(fmt(T.missing, { n: r.cost - avail }))}</span>`}</div>
          ${pen(r)}<button class="rb" data-redeem="${esc(r.id)}" ${ok ? '' : 'disabled'}>${esc(T.redeem)}</button></div>`; }).join('')}</div>`;
      const name = (pid) => (persons.find((p) => p.id === pid) || {}).name || '?';
      const pend = s.requests.filter((q) => q.status === 'pending' && (!sel || q.pid === sel.id));
      const pending = pend.length ? `<div class="sec">${esc(T.pending)}</div><div class="pend">${pend.map((q) => `<div class="pq"><b>${esc(name(q.pid))}</b><span>${esc(q.title)} · ${q.cost} ${esc(T.pts)}</span>
          <button class="sg ok" data-decide="${esc(q.id)}" data-ok="1">${esc(T.approve)}</button><button class="sg" data-decide="${esc(q.id)}" data-ok="0">${esc(T.deny)}</button></div>`).join('')}</div>` : '';
      const hist = sel ? s.ledger.filter((e) => e.pid === sel.id).slice(0, 12) : [];
      const history = hist.length ? `<div class="sec">${esc(T.history)}</div><div class="hist">${hist.map((e) => `<div class="hr"><span class="k">${esc(T.kinds[e.kind] || e.kind)}</span><span class="tx">${esc(e.kind === 'bonus' || e.kind === 'streak' ? '' : e.text)}</span><span class="d">${esc((e.ts || '').slice(5, 10).split('-').reverse().join('.'))}</span><b class="${e.pts < 0 ? 'neg' : ''}">${e.pts > 0 ? '+' : ''}${e.pts}</b></div>`).join('')}</div>` : '';
      const d = this._dlg;
      let dlg = '';
      if (d && d.kind === 'reward') { const r = d.r;
        const icons = ['mdi:gift-outline', 'mdi:ice-cream', 'mdi:controller-classic-outline', 'mdi:television-classic', 'mdi:cash', 'mdi:movie-open-outline', 'mdi:pizza', 'mdi:bed-clock', 'mdi:tablet', 'mdi:book-open-variant', 'mdi:soccer', 'mdi:star-outline'];
        dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(d.id ? r.title : T.add)}</div>
          <label class="fl">${esc(T.rTitle)}<input class="in" data-rf="title" maxlength="60" value="${esc(r.title)}"></label>
          <label class="fl">${esc(T.rIcon)}<span class="icons">${icons.map((i) => `<button class="ib${r.icon === i ? ' on' : ''}" data-ricon="${i}"><ha-icon icon="${i}"></ha-icon></button>`).join('')}</span><input class="in" data-rf="icon" maxlength="70" value="${esc(r.icon)}" placeholder="mdi:…"></label>
          <div class="fl">${esc(T.rCat)}<div class="cats">${[...RSIZES, 'custom'].map((k) => { const n = ((s.sizes || {}).reward || {})[k]; const mv = money(s, k);
            return `<button class="cat${r.size === k ? ' on' : ''}" data-rsize="${k}"><b>${esc(k === 'custom' ? T.own : T.sizes[k])}</b>${k === 'custom' ? '' : `<span>${n} ${esc(T.pts)}${mv ? ` · ${esc(T.approx)} ${esc(mv)}` : ''}</span>`}</button>`; }).join('')}</div><span class="hint">${esc(T.catHint)}</span></div>
          <div class="row2">${r.size === 'custom' ? `<label class="fl">${esc(T.rCost)}<input class="in" type="number" min="1" max="100000" inputmode="numeric" data-rf="cost" value="${esc(r.cost)}"></label>` : ''}
          <label class="fl">${esc(T.rWeek)}<input class="in" type="number" min="0" max="50" inputmode="numeric" data-rf="per_week" value="${esc(r.per_week)}"></label></div>
          <label class="ck"><input type="checkbox" data-rf="approval" ${r.approval ? 'checked' : ''}>${esc(T.rApproval)}</label>
          <div class="fl">${esc(T.rPersons)}<div class="bps">${persons.map((p) => `<button class="chip${r.persons.includes(p.id) ? ' on' : ''}" data-rperson="${esc(p.id)}">${av(p, 22)}${esc(p.name)}</button>`).join('')}</div></div>
          ${(() => { const cost = Math.max(1, Math.round(Number(r.cost) || 0)); const fam = (s.pace || {}).family || 0;
            const who = (r.persons.length ? persons.filter((p) => r.persons.includes(p.id)) : persons.filter((p) => p.role !== 'adult'));
            return `<div class="fc"><b>${esc(T.fc)}</b>${fam > 0 ? `<span>${esc(fmt(T.fcFam, { p: Math.round(fam), n: Math.ceil(cost / fam) }))}</span>` : `<span>${esc(T.noPace)}</span>`}
              <span class="fcp">${who.map((p) => { const dd = daysTo(s, p.id, cost); return `<em>${av(p, 18)}${esc(p.name)}: ${esc(dd === 0 ? T.fcNow : dd == null ? '–' : '~' + dd + (this._cfg.lang === 'en' ? ' d' : ' T'))}</em>`; }).join('')}</span></div>`; })()}
          <div class="ea">${d.id ? `<button class="sg del" data-rdel>${esc(T.del)}</button>` : ''}<span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-rsave>${esc(T.save)}</button></div></div></div>`; }
      if (d && d.kind === 'confirm') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(T.delAsk, { t: d.title }))}</div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-ryes>${esc(T.del)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        ${(window.FPX || {}).AWCSS || ''}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:18px;font-family:var(--fp-font);color:var(--fp-text,#ececec);position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:12px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
.cats{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.cat{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:92px;padding:8px 12px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#262626);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer;text-align:left}
        .cat b{font-weight:600;color:var(--fp-text,#eee)}.cat span{font-size:11px;color:var(--fp-text2,#999)}.cat.on{border-color:var(--fp-accent);background:var(--fp-bg2,#202820)}.cat.on span{color:var(--fp-accent)}.cat.neg{border-color:#e06b6b;background:#3a2626}
        .hint{display:block;font-size:11px;color:var(--fp-text3,#888);margin-top:2px}
        .people{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
        .pc{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:14px;border:1px solid var(--fp-line,#2a2a2a);background:var(--fp-bg2,#232323);color:inherit;font:inherit;text-align:left;cursor:pointer;border-left:4px solid var(--c)}
        .ph{display:flex;align-items:center;gap:12px}
        .mds{display:flex;flex-wrap:wrap;gap:5px}.md{width:28px!important;height:28px!important}.md ha-icon{--mdc-icon-size:17px!important}.md.big{width:44px!important;height:44px!important}.md.big ha-icon{--mdc-icon-size:26px!important}.mdm{font-size:12px;color:var(--fp-text3,#888);align-self:center}
        .runs{display:flex;flex-direction:column;gap:6px}
        .run{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:var(--fp-bg3,#262626);font-size:13px}.run>ha-icon{color:var(--c);flex:none}
        .run span{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.run b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.run em{font-style:normal;font-size:11px;color:var(--fp-text2,#999)}
        .run.w{border:1px dashed #e0a84f}.run.w>ha-icon{color:#e0a84f}.run.none{color:var(--fp-text3,#777);font-size:12px;justify-content:center}
        .add1{display:flex;align-items:center;justify-content:center;gap:6px;height:38px;border-radius:10px;border:1px dashed var(--fp-line,#4a4a4a);background:transparent;color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        .oas{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
        .oa{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a);border-top:3px solid color-mix(in srgb,var(--mc) 70%,transparent)}
        .oa:not(.won) .md{filter:saturate(.75)}.ot{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.ot b{font-size:14px}.ot>span{font-size:12px;color:var(--fp-text2,#aaa);line-height:1.35}
        .om{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}.om em{font-style:normal;font-size:11px;color:var(--fp-text2,#999);background:var(--fp-bg3,#2b2b2b);border-radius:9px;padding:2px 8px;display:inline-flex;align-items:center;gap:5px}.om em.pp{color:${G}}
        .fc{display:flex;flex-direction:column;gap:5px;padding:10px 12px;border-radius:10px;background:var(--fp-bg3,#2b2b2b);font-size:12px;color:var(--fp-text2,#bbb);margin-bottom:6px}.fc b{color:var(--fp-text,#eee);font-size:12px}
        .fcp{display:flex;flex-wrap:wrap;gap:6px}.fcp em{font-style:normal;display:inline-flex;align-items:center;gap:5px;background:var(--fp-bg2,#232323);border-radius:12px;padding:2px 9px 2px 3px}
        .pc.on{border-color:var(--c);background:var(--fp-bg3,#262626)}
        .pi{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.pi b{font-size:16px}
        .lv{font-size:12px;color:var(--fp-text2,#aaa);display:flex;align-items:center;gap:5px}.tierdot{width:9px;height:9px;border-radius:50%;display:inline-block;box-shadow:0 0 4px rgba(255,255,255,.3)}.nx{font-size:11px;color:var(--fp-text3,#777)}
        .bar{display:block;height:6px;border-radius:3px;background:var(--fp-bg4,#333);overflow:hidden}.bar i{display:block;height:100%;background:${G};border-radius:3px}
        .pt{display:flex;flex-direction:column;align-items:flex-end}.pt strong{font-size:28px;line-height:1;color:${G}}.pt span{font-size:11px;color:var(--fp-text3,#888)}.pt em{font-style:normal;font-size:10px;color:#e0a84f}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
        .rw{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2a2a2a)}
        .ri{width:48px;height:48px;border-radius:12px;background:color-mix(in srgb,var(--fp-accent) 1600%,transparent);color:${G};display:flex;align-items:center;justify-content:center;flex:none}.ri ha-icon{--mdc-icon-size:26px}
        .rw.lock .ri{background:var(--fp-bg4,#2e2e2e);color:var(--fp-text3,#777)}
        .rt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.rt b{font-size:15px}.rt span{font-size:12px;color:var(--fp-text2,#999)}.ms{display:flex;flex-direction:column;gap:3px}
        .pen{width:36px;height:36px;flex:none;border-radius:10px;border:1px solid var(--fp-line,#333);background:transparent;color:var(--fp-text2,#999);cursor:pointer;display:flex;align-items:center;justify-content:center}.pen ha-icon{--mdc-icon-size:18px}
        .run[data-redit]{cursor:pointer}
        .rb{height:40px;padding:0 16px;border-radius:10px;border:none;background:${G};color:var(--fp-on-accent,#141414);font:inherit;font-weight:600;cursor:pointer}
        .rb[disabled]{background:var(--fp-bg4,#333);color:var(--fp-text3,#777);cursor:default}
        .pend,.hist{display:flex;flex-direction:column;gap:6px}.hint2{font-size:13px;color:var(--fp-text2,#999);margin:0 2px 8px}
        .who{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.wp{display:flex;align-items:center;gap:5px;height:26px;padding:0 9px 0 3px;border-radius:13px;border:1px solid var(--c);background:transparent;color:var(--c);font:inherit;font-size:12px;cursor:pointer}
        .wa{font-style:normal;font-size:12px;color:var(--fp-text2,#999);border:1px dashed var(--fp-line,#555);border-radius:13px;padding:3px 9px}
        .pq{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:var(--fp-bg3,#262626);border:1px dashed var(--fp-line,#4a4a4a)}.pq span{flex:1;color:var(--fp-text2,#bbb);font-size:14px}
        .hr{display:grid;grid-template-columns:110px 1fr 60px 60px;gap:8px;align-items:center;padding:8px 12px;border-radius:9px;background:var(--fp-bg2,#232323);font-size:13px}
        .hr .k{color:var(--fp-text2,#aaa)}.hr .tx{color:var(--fp-text,#ddd);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hr .d{color:var(--fp-text3,#777)}.hr b{text-align:right;color:${G}}.hr b.neg{color:#e06b6b}
        .empty{color:var(--fp-text3,#888);padding:20px 10px;font-size:14px;line-height:1.5}
        .sg{height:38px;border-radius:19px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:flex-start;justify-content:center;padding-top:50px;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:18px;width:min(460px,92%)}
        .dlg.pin{width:280px;text-align:center}.dh{font-size:15px;font-weight:600;margin-bottom:12px}
        .dots{display:flex;gap:10px;justify-content:center;margin:6px 0 14px}.dots i{width:12px;height:12px;border-radius:50%;border:2px solid var(--fp-line,#5a5a5a)}.dots i.on{background:${G};border-color:${G}}
        .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
        .key{height:54px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg4,#2e2e2e);color:var(--fp-text,#eee);font:inherit;font-size:20px;cursor:pointer}.key.okk{background:${G};color:var(--fp-on-accent,#141414);font-size:15px;font-weight:600}
        .bps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
        .chip{display:flex;align-items:center;gap:6px;height:38px;padding:0 12px 0 6px;border-radius:19px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer}.chip.on{border-color:${G};color:${G}}
        .br{display:flex;gap:8px}.in{flex:1;height:42px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 12px;outline:none;min-width:0}.in.num{flex:none;width:90px}
        .ea{display:flex;gap:8px;margin-top:14px}.sp{flex:1}
        .msg{position:absolute;left:50%;transform:translateX(-50%);top:12px;background:#2e3a2a;border:1px solid ${G};color:var(--fp-text,#dfe);padding:8px 16px;border-radius:10px;font-size:13px;z-index:5;max-width:80%}
        .msg.e{background:#3a2626;border-color:#e06b6b}
        .warn{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:rgba(224,168,79,.14);border:1px solid #e0a84f;color:#f0d3a0;font-size:14px;margin-bottom:12px}.warn span{flex:1}
        .rw.add{justify-content:center;gap:8px;border:1px dashed var(--fp-line,#4a4a4a);background:transparent;color:var(--fp-text2,#bbb);font:inherit;font-size:14px;cursor:pointer;min-height:72px}
        .fl{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--fp-text2,#aaa);margin-bottom:12px}.fl .in{flex:none;width:100%;box-sizing:border-box}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .ck{display:flex;align-items:center;gap:10px;font-size:14px;margin-bottom:12px;cursor:pointer}.ck input{width:20px;height:20px;accent-color:${G}}
        .icons{display:flex;flex-wrap:wrap;gap:6px}.ib{width:40px;height:40px;border-radius:10px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);cursor:pointer;display:flex;align-items:center;justify-content:center}.ib.on{border-color:${G};color:${G}}
        .sg.del{background:#3a2626;border-color:#e06b6b;color:#f3b4b4}
        .dlg{max-height:calc(100% - 70px);overflow:auto}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>
      <div class="card">
        <div class="top"><h2>${esc(T.title)}</h2></div>
        ${s.pin_default ? `<div class="warn"><ha-icon icon="mdi:shield-alert-outline"></ha-icon><span>${esc(T.startPin)}</span><button class="sg ok" data-chpin>${esc(T.changePin)}</button></div>` : ''}
        <div class="people">${cards}</div>
        ${detail}
        ${openAw}
        ${pending}
        <div class="sec">${esc(sel ? fmt(T.shop, { name: sel.name }) : T.shopAll)}</div>${shop}
        ${history}
        ${dlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-rewards-inner')) customElements.define('fp-rewards-inner', FpRewardsInner);
})();

// ---------------------------------------------------------------------------
// Special chores: free recurrence (every n days/weeks/months/years, monthly, yearly dates, one-off),
// several persons with optional rotation, time window and points. Shown below the chore plan.
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const pad = (n) => String(n).padStart(2, '0');
  const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const TXT = {
    de: { title: 'Besondere Ämtli', sub: 'Nach Datum statt Wochentag – z. B. jedes halbe Jahr Luftfilter reinigen, Pneuwechsel im April und Oktober, einmalig Keller räumen.',
      add: '+ Besonderes Ämtli', none: 'Noch keine besonderen Ämtli.', name: 'Was ist zu tun?', ph: 'z. B. Luftfilter reinigen',
      types: { interval: 'Intervall', monthly: 'Monatlich', yearly: 'Jährlich', once: 'Einmalig' },
      every: 'alle', units: { days: 'Tage', weeks: 'Wochen', months: 'Monate', years: 'Jahre' }, from: 'ab',
      mdays: 'Monate', onday: 'am Tag', last: 'letzter', onweekday: 'am', nths: { 1: '1.', 2: '2.', 3: '3.', 4: '4.', '-1': 'letzten' },
      wd: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], wdl: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      dates: 'Daten', adddate: 'Datum hinzufügen', persons: 'Wer?', rotate: 'abwechselnd', window: 'Zeit zum Erledigen', days: 'Tage', points: 'Punkte',
      save: 'Speichern', cancel: 'Abbrechen', del: 'Löschen?', next: 'Nächstes Mal', err: 'Bitte Titel, mindestens eine Person und ein Datum/Intervall angeben.',
      sum: { interval: (s, u) => `alle ${s.every} ${u} ab ${s.start.split('-').reverse().join('.')}`, monthly_day: (s) => `${s.every > 1 ? `alle ${s.every} Monate` : 'monatlich'} am ${s.day === -1 ? 'letzten Tag' : s.day + '.'}`,
        monthly_wd: (s, n, w) => `${s.every > 1 ? `alle ${s.every} Monate` : 'monatlich'} am ${n} ${w}`, yearly: (d) => `jährlich am ${d}`, once: (d) => `einmalig am ${d}` },
      rot: 'abwechselnd', win: (n) => `${n} Tage Zeit` },
    en: { title: 'Special chores', sub: 'By date instead of weekday – e.g. clean the air filter every six months, change tyres in April and October, clear the cellar once.',
      add: '+ Special chore', none: 'No special chores yet.', name: 'What needs doing?', ph: 'e.g. clean the air filter',
      types: { interval: 'Interval', monthly: 'Monthly', yearly: 'Yearly', once: 'Once' },
      every: 'every', units: { days: 'days', weeks: 'weeks', months: 'months', years: 'years' }, from: 'from',
      mdays: 'months', onday: 'on day', last: 'last', onweekday: 'on the', nths: { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', '-1': 'last' },
      wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], wdl: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      dates: 'Dates', adddate: 'Add date', persons: 'Who?', rotate: 'take turns', window: 'Time to do it', days: 'days', points: 'Points',
      save: 'Save', cancel: 'Cancel', del: 'Delete?', next: 'Next', err: 'Please enter a title, at least one person and a date/interval.',
      sum: { interval: (s, u) => `every ${s.every} ${u} from ${s.start}`, monthly_day: (s) => `${s.every > 1 ? `every ${s.every} months` : 'monthly'} on day ${s.day === -1 ? 'last' : s.day}`,
        monthly_wd: (s, n, w) => `${s.every > 1 ? `every ${s.every} months` : 'monthly'} on the ${n} ${w}`, yearly: (d) => `yearly on ${d}`, once: (d) => `once on ${d}` },
      rot: 'taking turns', win: (n) => `${n} days to do it` },
  };

  class FpSpecialInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        const r = this.shadowRoot;
        r.addEventListener('click', (e) => this._click(e));
        r.addEventListener('change', (e) => this._change(e));
        r.addEventListener('input', (e) => { if (e.target.dataset.k === 'title') this._ed.title = e.target.value; });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { if (!this._editing()) this._render(); }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && /INPUT|SELECT/.test(a.tagName); }
    _snap() { return (this._store && this._store.snap) || null; }
    _fmtDate(iso) { const [y, m, d] = iso.split('-'); return this._cfg.lang === 'en' ? `${d}/${m}/${y}` : `${d}.${m}.${y}`; }
    _fmtMd(md) { const [m, d] = md.split('-'); return this._cfg.lang === 'en' ? `${d}/${m}` : `${d}.${m}.`; }
    _summary(c) {
      const T = this.T; const s = c.schedule;
      if (s.type === 'interval') return T.sum.interval({ ...s, start: this._cfg.lang === 'en' ? s.start : s.start }, T.units[s.unit]);
      if (s.type === 'monthly') return s.mode === 'weekday' ? T.sum.monthly_wd(s, T.nths[String(s.nth)], T.wdl[s.weekday - 1]) : T.sum.monthly_day(s);
      if (s.type === 'yearly') return T.sum.yearly(s.dates.map((d) => this._fmtMd(d)).join(', '));
      return T.sum.once(s.dates.map((d) => this._fmtDate(d)).join(', '));
    }
    openAdd() { this._ed = this._new(); this._render(); setTimeout(() => this.scrollIntoView({ block: 'start', behavior: 'smooth' }), 30); }
    _new() { const s = this._snap(); return { id: null, title: '', points: null, persons: s && s.persons[0] ? [s.persons[0].id] : [], rotate: false, window: 7,
      schedule: { type: 'interval', every: 6, unit: 'months', start: todayIso(), mode: 'day', day: 1, nth: 1, weekday: 6, dates: [] } }; }
    _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      if (t.closest('[data-add]')) { this._ed = this._new(); this._render(); return; }
      const ed = t.closest('[data-edit]');
      if (ed) { const c = s.chores.find((x) => x.id === ed.dataset.edit); this._ed = { id: c.id, title: c.title, points: c.points ?? null, persons: [...(c.persons || [])], rotate: !!c.rotate, window: c.window || 1,
        schedule: { every: 1, unit: 'months', start: todayIso(), mode: 'day', day: 1, nth: 1, weekday: 6, dates: [], ...c.schedule } }; this._render(); return; }
      const dl = t.closest('[data-del]');
      if (dl) { const id = dl.dataset.del; if (this._confirm !== id) { this._confirm = id; this._render(); return; }
        this._confirm = null; this._store.pws('family_planer/chore/delete', { chore_id: id }).catch((er) => { if (er !== (window.FPPIN && window.FPPIN.CANCEL)) this._flash(er); }); return; }
      if (!this._ed) return;
      const ty = t.closest('[data-type]'); if (ty) { this._ed.schedule.type = ty.dataset.type; this._render(); return; }
      const pp = t.closest('[data-person]'); if (pp) { const id = pp.dataset.person; const l = this._ed.persons; this._ed.persons = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; this._render(); return; }
      if (t.closest('[data-rotate]')) { this._ed.rotate = !this._ed.rotate; this._render(); return; }
      const rd = t.closest('[data-rmdate]'); if (rd) { this._ed.schedule.dates = this._ed.schedule.dates.filter((x) => x !== rd.dataset.rmdate); this._render(); return; }
      if (t.closest('[data-cancel]')) { this._ed = null; this._render(); if (this._cfg.dialog) this.dispatchEvent(new CustomEvent('fp-dialog-close', { bubbles: true, composed: true })); return; }
      if (t.closest('[data-save]')) this._save();
    }
    _change(e) {
      const el = e.target; const k = el.dataset.k; if (!k || !this._ed) return;
      const sc = this._ed.schedule; const num = (v) => (v === '' ? null : Number(v));
      if (k === 'title') this._ed.title = el.value;
      else if (k === 'points') this._ed.points = num(el.value);
      else if (k === 'window') this._ed.window = Math.max(1, Math.min(60, num(el.value) || 1));
      else if (k === 'adddate' && el.value) { const v = sc.type === 'yearly' ? el.value.slice(5) : el.value; if (!sc.dates.includes(v)) sc.dates = [...sc.dates, v].sort(); el.value = ''; }
      else if (k === 'start') sc.start = el.value || todayIso();
      else if (k === 'mstart') sc.start = (el.value || todayIso().slice(0, 7)) + '-01';
      else if (['every', 'day', 'nth', 'weekday'].includes(k)) sc[k] = num(el.value);
      else if (k === 'unit' || k === 'mode') sc[k] = el.value;
      this._render();
    }
    _flash(er) { this._msg = String((er && er.message) || er); this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4000); }
    async _save() {
      const e = this._ed; const sc = e.schedule;
      const sched = { type: sc.type };
      if (sc.type === 'interval') Object.assign(sched, { every: sc.every || 1, unit: sc.unit, start: sc.start });
      if (sc.type === 'monthly') Object.assign(sched, { every: sc.every || 1, start: sc.start, mode: sc.mode, ...(sc.mode === 'weekday' ? { nth: sc.nth, weekday: sc.weekday } : { day: sc.day }) });
      if (sc.type === 'yearly' || sc.type === 'once') sched.dates = sc.dates;
      if (!e.title.trim() || !e.persons.length || ((sc.type === 'yearly' || sc.type === 'once') && !sc.dates.length)) { this._flash(this.T.err); return; }
      const msg = { title: e.title.trim(), assign: {}, schedule: sched, persons: e.persons, rotate: e.rotate && e.persons.length > 1, window: e.window || 1 };
      if (e.id) msg.chore_id = e.id;
      if (typeof e.points === 'number') msg.points = Math.max(0, Math.min(1000, Math.round(e.points)));
      try { await this._store.pws('family_planer/chore/save', msg); this._ed = null; this._render(); if (this._cfg.dialog) this.dispatchEvent(new CustomEvent('fp-dialog-close', { bubbles: true, composed: true })); } catch (er) { if (er !== (window.FPPIN && window.FPPIN.CANCEL)) this._flash(er); }
    }
    _editor(s) {
      const T = this.T; const e = this._ed; const sc = e.schedule;
      const opt = (v, l, cur) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(l)}</option>`;
      let rule = '';
      if (sc.type === 'interval') rule = `${esc(T.every)} <input class="in n" type="number" min="1" max="365" data-k="every" value="${sc.every || 1}"> <select class="in" data-k="unit">${Object.entries(T.units).map(([v, l]) => opt(v, l, sc.unit)).join('')}</select> ${esc(T.from)} <input class="in d" type="date" data-k="start" value="${esc(sc.start)}">`;
      if (sc.type === 'monthly') rule = `${esc(T.every)} <input class="in n" type="number" min="1" max="24" data-k="every" value="${sc.every || 1}"> ${esc(T.mdays)} ${esc(T.from)} <input class="in d" type="month" data-k="mstart" value="${esc((sc.start || todayIso()).slice(0, 7))}">
        <select class="in" data-k="mode">${opt('day', T.onday, sc.mode)}${opt('weekday', T.onweekday, sc.mode)}</select>
        ${sc.mode === 'weekday' ? `<select class="in" data-k="nth">${['1', '2', '3', '4', '-1'].map((n) => opt(n, T.nths[n], sc.nth)).join('')}</select><select class="in" data-k="weekday">${T.wdl.map((w, i) => opt(i + 1, w, sc.weekday)).join('')}</select>`
          : `<select class="in" data-k="day">${[...Array(31)].map((_, i) => opt(i + 1, `${i + 1}.`, sc.day)).join('')}${opt(-1, T.last, sc.day)}</select>`}`;
      if (sc.type === 'yearly' || sc.type === 'once') rule = `<span class="chips">${sc.dates.map((d) => `<span class="dchip">${esc(sc.type === 'yearly' ? this._fmtMd(d) : this._fmtDate(d))}<button data-rmdate="${esc(d)}">✕</button></span>`).join('')}</span>
        <label class="adl">${esc(T.adddate)} <input class="in d" type="date" data-k="adddate"></label>`;
      return `<div class="ed">
        <input class="in t" data-k="title" placeholder="${esc(T.ph)}" value="${esc(e.title)}" maxlength="120">
        <div class="seg">${Object.entries(T.types).map(([v, l]) => `<button class="${sc.type === v ? 'on' : ''}" data-type="${v}">${esc(l)}</button>`).join('')}</div>
        <div class="rule">${rule}</div>
        <div class="row"><span class="lb">${esc(T.persons)}</span>${s.persons.map((p) => `<button class="pc${e.persons.includes(p.id) ? ' on' : ''}" data-person="${esc(p.id)}" style="--c:${COLOR(p.color)}">${esc(p.name)}</button>`).join('')}
          ${e.persons.length > 1 ? `<button class="pc tg${e.rotate ? ' on' : ''}" data-rotate>⇄ ${esc(T.rotate)}</button>` : ''}</div>
        <div class="row"><span class="lb">${esc(T.window)}</span><input class="in n" type="number" min="1" max="60" data-k="window" value="${e.window}"> ${esc(T.days)}
          <span class="lb" style="margin-left:18px">${esc(T.points)}</span><input class="in n" type="number" min="0" max="1000" data-k="points" value="${e.points ?? ''}" placeholder="${(s.gamification || {}).default_points || 10}"></div>
        <div class="row end"><button class="sg" data-cancel>${esc(T.cancel)}</button><button class="sg ok" data-save>${esc(T.save)}</button></div></div>`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._snap(); if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const T = this.T; const name = (pid) => (s.persons.find((p) => p.id === pid) || {}).name || '?';
      const list = s.chores.filter((c) => c.schedule);
      const rows = list.map((c) => `<div class="it">
          <div class="m"><b>${esc(c.title)}</b><span>${esc(this._summary(c))} · ${esc(T.win(c.window || 1))}${c.rotate ? ' · ' + esc(T.rot) : ''}${typeof c.points === 'number' ? ` · ${c.points} ${esc(T.points)}` : ''}</span>
          <span class="nx">${esc(T.next)}: ${(c.upcoming || []).map((u) => `${esc(this._fmtDate(u.date))} · ${esc(u.persons.map(name).join(', '))}`).join(' &nbsp;|&nbsp; ') || '–'}</span></div>
          <div class="ps">${(c.persons || []).map((pid) => { const p = s.persons.find((x) => x.id === pid); return p ? `<i style="background:${COLOR(p.color)}" title="${esc(p.name)}"></i>` : ''; }).join('')}</div>
          <button class="ib" data-edit="${esc(c.id)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>
          <button class="ib${this._confirm === c.id ? ' cf' : ''}" data-del="${esc(c.id)}">${this._confirm === c.id ? esc(T.del) : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button></div>`).join('');
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-top:12px}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:18px 22px;color:var(--fp-text,#ececec);font-family:var(--fp-font);position:relative}
        h2{margin:0;font-size:17px;font-weight:600}.sub{font-size:13px;color:var(--fp-text2,#8c8c8c);margin:4px 0 14px}
        .it{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2a2a2a);margin-bottom:8px}
        .m{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.m b{font-size:15px}.m span{font-size:12px;color:var(--fp-text2,#aaa)}.m .nx{color:${G}}
        .ps{display:flex;gap:4px}.ps i{width:14px;height:14px;border-radius:50%;display:inline-block}
        .ib{min-width:40px;height:40px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg4,#2e2e2e);color:var(--fp-text2,#bbb);cursor:pointer;font:inherit;font-size:12px}.ib.cf{color:#e06b6b;border-color:#e06b6b;padding:0 10px}
        ha-icon{--mdc-icon-size:18px}
        .add{height:40px;border-radius:10px;border:1px dashed var(--fp-line,#4a4a4a);background:none;color:${G};font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
        .none{color:var(--fp-text3,#777);font-size:13px;margin-bottom:10px}
        .ed{border:1px solid color-mix(in srgb,var(--fp-accent) 50%,transparent);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--fp-bg2,#232323);display:flex;flex-direction:column;gap:12px}
        .in{background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text,#eee);border-radius:9px;height:40px;padding:0 10px;font:inherit;font-size:14px;outline:none;box-sizing:border-box;color-scheme:dark}
        .in:focus{border-color:color-mix(in srgb,var(--fp-accent) 70%,transparent)}.in.t{width:100%;font-size:16px;height:44px}.in.n{width:76px;text-align:center}.in.d{width:auto}
        .seg{display:flex;gap:6px;flex-wrap:wrap}.seg button,.pc{height:36px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 14px;cursor:pointer}
        .seg button.on{background:color-mix(in srgb,var(--fp-accent) 1600%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:${G};font-weight:600}
        .pc{border-left:4px solid var(--c,#666)}.pc.on{background:var(--fp-bg4,#333);color:var(--fp-text,#fff);border-color:var(--c,${G})}.pc.tg{border-left:1px solid var(--fp-line,#3a3a3a)}.pc.tg.on{color:${G};border-color:${G}}
        .rule,.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--fp-text2,#ccc)}.row.end{justify-content:flex-end}
        .lb{font-size:12px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:.8px}
        .chips{display:flex;gap:6px;flex-wrap:wrap}.dchip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 4px 0 12px;border-radius:var(--fp-radius,16px);background:var(--fp-bg4,#333);font-size:13px}
        .dchip button{border:none;background:none;color:var(--fp-text2,#999);cursor:pointer;font-size:12px}.adl{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#999)}
        .sg{height:38px;border-radius:19px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 16px;cursor:pointer}.sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}
        .msg{color:#e06b6b;font-size:13px;margin-top:8px}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>${this._cfg.dialog ? `<div class="card"><h2>${esc(T.add.replace(/^\+\s*/, ""))}</h2>${this._ed ? this._editor(s) : ''}${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}</div>` : `<div class="card"><h2>${esc(T.title)}</h2><div class="sub">${esc(T.sub)}</div>
        ${this._ed ? this._editor(s) : ''}
        ${rows || (this._ed ? '' : `<div class="none">${esc(T.none)}</div>`)}
        ${this._ed ? '' : `<button class="add" data-add>${esc(T.add)}</button>`}
        ${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}</div>`}`;
    }
  }
  if (!customElements.get('fp-special-inner')) customElements.define('fp-special-inner', FpSpecialInner);
})();

// ---------------------------------------------------------------------------
// To-dos without a date: assigned to a person, stay until done. Ticking off asks for confirmation
// (setting), unlike chores which are ticked with one tap. Shown below the planner and the chore plan.
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const TXT = {
    de: { title: 'To-dos', sub: 'Ohne Datum – bleiben stehen, bis sie erledigt sind.', none: 'Keine offenen To-dos.', ph: 'Neues To-do …', add: 'Hinzufügen', neu: 'Neues To-do',
      ask: '„{t}“ als erledigt markieren?', reopen: '„{t}“ wieder öffnen?', yes: 'Erledigt', yesOpen: 'Wieder öffnen', cancel: 'Abbrechen', del: 'Löschen',
      delAsk: '„{t}“ löschen?', pts: 'Punkte', sizeHint: 'Grösse ändern braucht die Eltern-PIN', err: 'Konnte nicht gespeichert werden.',
      sizes: { none: 'Ohne Punkte', s: 'Klein', m: 'Mittel', l: 'Gross' }, open: 'To-dos', openN: 'To-dos ({n})', close: 'Schliessen' },
    en: { title: 'To-dos', sub: 'No date – they stay until they are done.', none: 'No open to-dos.', ph: 'New to-do …', add: 'Add', neu: 'New to-do',
      ask: 'Mark "{t}" as done?', reopen: 'Reopen "{t}"?', yes: 'Done', yesOpen: 'Reopen', cancel: 'Cancel', del: 'Delete',
      delAsk: 'Delete "{t}"?', pts: 'points', sizeHint: 'Changing the size needs the parent PIN', err: 'Could not be saved.',
      sizes: { none: 'No points', s: 'Small', m: 'Medium', l: 'Large' }, open: 'To-dos', openN: 'To-dos ({n})', close: 'Close' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));

  class FpTodosInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { if (e.target.dataset.new !== undefined) this._text = e.target.value; });
        this.shadowRoot.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.new !== undefined) { e.preventDefault(); this._add(); } });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    update() { if (!this._typing()) this._render(); }
    _typing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!(a && a.tagName === 'INPUT'); }
    _snap() { return (this._store && this._store.snap) || null; }
    _flash(m) { this._msg = m; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    async _add() {
      const s = this._snap(); const title = String(this._text || '').trim(); if (!title || !s) return;
      const pid = this._person || (s.persons[0] && s.persons[0].id);
      const def = this._defSize(s); const size = this._size || def;
      try {
        await window.FPPIN.call(this._store, 'family_planer/todo/save', { person_id: pid, title, ...(size !== def ? { size } : {}) }, { lang: this._cfg.lang, host: this });
        this._text = ''; this._size = null; this._render(); if (this._cfg.dialog) this.dispatchEvent(new CustomEvent('fp-dialog-close', { bubbles: true, composed: true }));
      } catch (e) { if (e !== (window.FPPIN && window.FPPIN.CANCEL)) this._flash(this.T.err); }
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const p = t.closest('[data-person]'); if (p) { this._person = p.dataset.person; this._render(); return; }
      if (t.closest('[data-add]')) { this._add(); return; }
      const sz = t.closest('[data-size]'); if (sz) { this._size = sz.dataset.size; this._render(); return; }
      const td = t.closest('[data-todo]');
      if (td) {
        const it = (s.todos || []).find((x) => x.id === td.dataset.todo); if (!it) return;
        const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
        if (confirm || it.done) { this._dlg = { kind: 'done', it }; this._render(); return; }
        this._set(it, true); return;
      }
      const dl = t.closest('[data-del]'); if (dl) { const it = (s.todos || []).find((x) => x.id === dl.dataset.del); if (it) { this._dlg = { kind: 'del', it }; this._render(); } return; }
      if (t.closest('[data-yes]') && this._dlg) {
        const d = this._dlg; this._dlg = null;
        if (d.kind === 'done') this._set(d.it, !d.it.done);
        else { try { await window.FPPIN.call(this._store, 'family_planer/todo/delete', { todo_id: d.it.id }, { lang: this._cfg.lang, host: this }); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this.T.err); } }
        this._render(); return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    focusAdd() { const i = this.shadowRoot && this.shadowRoot.querySelector('[data-new]'); if (i) { i.focus(); i.scrollIntoView({ block: 'center' }); } }
    _defSize(s) { const v = s && s.todo_settings && s.todo_settings.size; return ['none', 's', 'm', 'l'].includes(v) ? v : 's'; }
    _pts(s, it) { const sz = (s.sizes && s.sizes.todo) || {}; return it.size ? (sz[it.size] || 0) : (it.points || 0); }
    async _set(it, done) { try { await this._store.ws('family_planer/todo/set', { todo_id: it.id, done }); } catch (e) { this._flash(this.T.err); } }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._snap(); const T = this.T; if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons || []; const todos = s.todos || [];
      const sel = persons.find((p) => p.id === this._person) || persons[0];
      const groups = persons.map((p) => ({ p, list: todos.filter((x) => x.person_id === p.id) })).filter((g) => g.list.length);
      const d = this._dlg;
      const dlg = !d ? '' : `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(d.kind === 'del' ? T.delAsk : d.it.done ? T.reopen : T.ask, { t: d.it.title }))}</div>
        <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ${d.kind === 'del' ? 'del' : 'ok'}" data-yes>${esc(d.kind === 'del' ? T.del : d.it.done ? T.yesOpen : T.yes)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-top:12px}
        .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:16px 18px;font-family:var(--fp-font);color:var(--fp-text,#ececec)}
        h3{margin:0;font-size:17px;font-weight:600}.sub{font-size:12px;color:var(--fp-text3,#888);margin:2px 0 12px}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
        .g{border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a);border-left:4px solid var(--c);padding:8px 10px}
        .gn{font-size:13px;font-weight:600;color:var(--c);margin:2px 2px 6px}
        .t{display:flex;align-items:center;gap:8px;width:100%;min-height:42px;padding:6px 8px;border-radius:9px;border:none;background:transparent;color:inherit;font:inherit;font-size:15px;text-align:left;cursor:pointer}
        .t:hover{background:var(--fp-bg3,#2a2a2a)}.box{width:22px;height:22px;border-radius:6px;border:2px solid var(--fp-line,#5a5a5a);flex:none;display:flex;align-items:center;justify-content:center}
        .t.done{color:var(--fp-text3,#777);text-decoration:line-through}.t.done .box{background:${G};border-color:${G};color:var(--fp-on-accent,#141414)}
        .tt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}.pt{font-size:11px;color:${G}}
        .x{width:30px;height:30px;border-radius:8px;border:none;background:transparent;color:var(--fp-text3,#777);cursor:pointer;flex:none}.x:hover{color:#e06b6b;background:var(--fp-bg4,#2e2e2e)}
        .row{display:flex}.empty{color:var(--fp-text3,#888);font-size:14px;padding:4px 2px 10px}
        .add{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}.add.dlgm .in{flex-basis:100%}
        .chip{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}.chip.on{border-color:var(--c);color:var(--c)}
        .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
        .in{flex:1;min-width:180px;height:42px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 12px;outline:none}
        .sizes{display:flex;flex-wrap:wrap;gap:6px}.sz{height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}
        .sz b{color:${G};font-weight:600}.sz.on{border-color:${G};color:var(--fp-text,#fff);background:var(--fp-bg2,#202820)}
        .sg{height:40px;border-radius:20px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}.sg.del{background:#3a2626;border-color:#e06b6b;color:#f3b4b4}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:18px;width:min(420px,92%)}.dh{font-size:16px;font-weight:600;margin-bottom:14px;line-height:1.4}
        .ea{display:flex;gap:8px}.sp{flex:1}
        .msg{position:absolute;right:14px;top:12px;background:#3a2626;border:1px solid #e06b6b;color:#fdd;padding:6px 12px;border-radius:10px;font-size:13px}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style><div class="card">
        <h3>${esc(this._cfg.dialog ? T.neu : T.title)}</h3>${this._cfg.dialog ? '' : `<div class="sub">${esc(T.sub)}</div>`}
        ${this._cfg.dialog ? '' : groups.length ? `<div class="grid">${groups.map(({ p, list }) => `<div class="g" style="--c:${COLOR(p.color)}"><div class="gn">${esc(p.name)}</div>
          ${list.map((x) => `<div class="row"><button class="t${x.done ? ' done' : ''}" data-todo="${esc(x.id)}"><span class="box">${x.done ? '✓' : ''}</span><span class="tt">${esc(x.title)}</span>${this._pts(s, x) ? `<span class="pt">+${this._pts(s, x)}</span>` : ''}</button>
            <button class="x" data-del="${esc(x.id)}" aria-label="${esc(T.del)}">✕</button></div>`).join('')}</div>`).join('')}</div>` : `<div class="empty">${esc(T.none)}</div>`}
        <div class="add${this._cfg.dialog ? ' dlgm' : ''}">${persons.map((p) => `<button class="chip${sel && p.id === sel.id ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-person="${esc(p.id)}"><i></i>${esc(p.name)}</button>`).join('')}
          <input class="in" data-new maxlength="80" placeholder="${esc(T.ph)}" value="${esc(this._text || '')}">
          <span class="sizes" title="${esc(T.sizeHint)}">${['none', 's', 'm', 'l'].map((k) => { const n = ((s.sizes && s.sizes.todo) || {})[k] || 0; const on = (this._size || this._defSize(s)) === k;
            return `<button class="sz${on ? ' on' : ''}" data-size="${k}">${esc(T.sizes[k])}${k !== 'none' ? ` <b>+${n}</b>` : ''}</button>`; }).join('')}</span>
          <button class="sg ok" data-add>${esc(T.add)}</button></div>
        ${dlg}${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-todos-inner')) customElements.define('fp-todos-inner', FpTodosInner);
})();

// ---------------------------------------------------------------------------
// Settings page inside the planner (view: settings). Everything that the Home Assistant options dialogs
// offer, in one place, with a description next to every field. Always protected by the parent PIN.
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const L = (o, lang) => (o && (o[lang] || o.de)) || '';
  const clone = (o) => JSON.parse(JSON.stringify(o || {}));

  const UI = {
    de: { title: 'Einstellungen', locked: 'Die Einstellungen sind mit der Eltern-PIN geschützt.', unlock: 'Entsperren', save: 'Speichern', saved: 'Gespeichert.',
      reloading: 'Gespeichert – der Planer lädt die neuen Einstellungen …', cancel: 'Abbrechen', del: 'Löschen', add: 'Hinzufügen', none: '–', pin: 'Eltern-PIN ändern',
      pinChanged: 'Eltern-PIN geändert.', lock: 'Sperren', parent: 'Eltern-PIN', newPerson: '+ Person', newList: '+ Liste', delAsk: '„{t}“ wirklich löschen?', search: 'Entität wählen …',
      errors: { no_target: 'Bitte Alexa-Benachrichtigung oder TTS mit Lautsprechern wählen.', no_motion: 'Bitte mindestens einen Bewegungsmelder wählen.', no_modules: 'Mindestens ein Modul muss aktiv sein.',
        bad_times: 'Zeiten prüfen: Beginn vor Ende, Blöcke ohne Überschneidung.', name: 'Bitte einen (eindeutigen) Namen angeben.', last_person: 'Die letzte Person kann nicht entfernt werden.', list: 'Bitte Name und To-do-Liste angeben.' },
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], block: 'Block', from: 'von', to: 'bis' },
    en: { title: 'Settings', locked: 'The settings are protected by the parent PIN.', unlock: 'Unlock', save: 'Save', saved: 'Saved.',
      reloading: 'Saved – the planner is loading the new settings …', cancel: 'Cancel', del: 'Delete', add: 'Add', none: '–', pin: 'Change parent PIN',
      pinChanged: 'Parent PIN changed.', lock: 'Lock', parent: 'Parent PIN', newPerson: '+ Person', newList: '+ List', delAsk: 'Really delete "{t}"?', search: 'Choose entity …',
      errors: { no_target: 'Please choose an Alexa notify entity or TTS with speakers.', no_motion: 'Please choose at least one motion sensor.', no_modules: 'At least one module must be active.',
        bad_times: 'Check the times: start before end, blocks must not overlap.', name: 'Please enter a (unique) name.', last_person: 'The last person cannot be removed.', list: 'Please enter a name and a to-do list.' },
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], block: 'Block', from: 'from', to: 'to' },
  };

  // field: [key, type, {de, en} label, {de, en} description, extra]
  const F = (k, type, de, en, dde, den, x) => ({ k, type, label: { de, en }, desc: { de: dde, en: den }, ...(x || {}) });
  const TABS = [
    { id: 'pics', icon: 'mdi:face-man-shimmer-outline', label: { de: 'Bilder', en: 'Pictures' } },
    { id: 'general', icon: 'mdi:tune-variant', label: { de: 'Allgemein', en: 'General' }, fields: [
      F('mod_week', 'bool', 'Modul Wochenplan', 'Week plan module', 'Ämtli, Termine, Schule, Ferien, Punkte, Belohnungen und Ansagen.', 'Chores, events, school, holidays, points, rewards and announcements.'),
      F('mod_lists', 'bool', 'Modul Smarte Listen', 'Smart lists module', 'Einkaufs- und To-do-Listen, die sich selbst sortieren.', 'Shopping and to-do lists that sort themselves.'),
      F('language', 'select', 'Sprache des Family Planers', 'Family Planer language', 'Automatisch wie Profil/Home Assistant, oder fest Deutsch bzw. Englisch – unabhängig von Home Assistant.', 'Automatic like your profile/Home Assistant, or fixed German or English – independent of Home Assistant.',
        { opts: [['auto', { de: 'Automatisch', en: 'Automatic' }], ['de', 'Deutsch'], ['en', 'English']] }),
      F('theme', 'select', 'Design', 'Design', 'Farben des Planers. Auch oben rechts in der Navigation wählbar (mit Vorschau).', 'Colours of the planner. Also available at the top right of the navigation (with preview).',
        { opts: [['ha', { de: 'Standard (wie Home Assistant)', en: 'Standard (like Home Assistant)' }], ['light', { de: 'Hell', en: 'Light' }], ['dark', { de: 'Dunkel', en: 'Dark' }], ['rainbow', { de: 'Regenbogen', en: 'Rainbow' }], ['space', { de: 'Weltall', en: 'Space' }]] }),
      F('style', 'select', 'Stil der Flächen', 'Surface style', 'Transparent und Glas lassen den Hintergrund des Designs durchscheinen.', 'Transparent and glass let the design\'s background shine through.',
        { opts: [['standard', { de: 'Standard', en: 'Standard' }], ['transparent', { de: 'Transparent', en: 'Transparent' }], ['glass', { de: 'Glas', en: 'Glass' }]] }),
      F('nav', 'nav', 'Navigation: Reihenfolge und sichtbare Knöpfe', 'Navigation: order and visible buttons', 'Mit den Pfeilen verschieben, mit dem Schalter ein- oder ausblenden. „Einstellungen“ bleibt immer sichtbar. Der Ämtliplan steckt jetzt auch unter Einstellungen → Ämtli.', 'Move with the arrows, show or hide with the switch. "Settings" always stays visible. The chore plan is now also under Settings → Chores.'),
      F('nav_title', 'bool', 'Titel statt Uhrzeit in der Navigation', 'Title instead of the time in the navigation', 'Zeigt links den Namen des Planers statt Uhrzeit und Datum.', 'Shows the planner\'s name on the left instead of the time and date.'),
      F('fullscreen_dblclick', 'bool', 'Vollbild per Doppeltippen', 'Fullscreen on double tap', 'Doppeltippen auf eine freie Stelle blendet Kopfzeile und Seitenleiste aus; nochmals doppeltippen holt sie zurück.', 'Double-tap an empty spot to hide header and sidebar; double-tap again to bring them back.'),
      F('fullscreen_auto', 'bool', 'Beim Öffnen automatisch Vollbild', 'Fullscreen automatically when opened', 'Ideal für ein Wandtablet.', 'Ideal for a wall tablet.'),
      F('idle_seconds', 'num', 'Zurück zur Startansicht nach', 'Return to the start view after', 'Angetippter Tag / Person springt danach zurück zu heute.', 'A tapped day / person jumps back to today afterwards.', { min: 10, max: 600, unit: 's' }),
      F('panel', 'bool', 'Eintrag in der Seitenleiste', 'Sidebar entry', 'Öffnet den kompletten Planer ohne eigenes Dashboard.', 'Opens the complete planner without a dashboard of your own.'),
      F('panel_title', 'text', 'Titel in der Seitenleiste', 'Sidebar title', 'Leer = Name der Integration.', 'Empty = name of the integration.', { max: 40 }),
      F('rollover_time', 'time', 'Tageswechsel um', 'Day change at', 'Bis dahin können Ämtli des Vortags noch abgehakt werden.', 'Until then, the previous day\'s chores can still be ticked off.'),
      F('match_names', 'bool', 'Termine anhand von Namen zuordnen', 'Assign events by names', '„Lea Turnen“ erscheint bei Lea, auch wenn es im Kalender von Mama steht.', '"Lea gymnastics" appears at Lea even if it is in mum\'s calendar.'),
      F('show_owner', 'bool', 'Auch beim Kalenderbesitzer zeigen', 'Also show at the calendar owner', 'Zugeordnete Termine zusätzlich bei der Person des Kalenders anzeigen.', 'Show assigned events also at the calendar\'s person.'),
      F('admin_only_edit', 'bool', 'Plan nur durch Admins änderbar', 'Only admins may change the plan', 'Kinder können trotzdem abhaken und Belohnungen anfragen.', 'Children can still tick off chores and request rewards.'),
      F('reliability_days', 'num', 'Zuverlässigkeit berechnen über', 'Calculate reliability over', 'Zeitraum für die Prozentzahl pro Person.', 'Period for the percentage per person.', { min: 7, max: 90, unit: { de: 'Tage', en: 'days' } }),
      F('school_gap', 'num', 'Heimweg über Mittag ab', 'Lunch at home from', 'Pause in Minuten, ab der der Schultag in zwei Blöcke geteilt wird (0 = automatisch).', 'Break in minutes from which the school day is split into two blocks (0 = automatic).', { min: 0, max: 240, unit: 'min' }),
      F('school_window', 'num', 'Schule nur rund um die Schulzeit zeigen', 'Show school only around school time', 'So viele Minuten vor dem Losgehen bis nach dem Heimkommen erscheint der Schulblock in der Ansicht „Alles“ (0 = immer).', 'Minutes before leaving and after being home in which the school block shows in the "All" view (0 = always).', { min: 0, max: 240, unit: 'min' }),
    ] },
    { id: 'persons', icon: 'mdi:account-multiple-outline', label: { de: 'Personen', en: 'People' } },
    { id: 'chores', icon: 'mdi:clipboard-text-clock-outline', label: { de: 'Ämtli', en: 'Chores' } },
    { id: 'vacation', icon: 'mdi:palm-tree', label: { de: 'Ferien', en: 'Holidays' }, fields: [
      F('enabled', 'bool', 'Ämtli in den Ferien pausieren', 'Pause chores during holidays', 'Ferientage zählen weder als erledigt noch als verpasst.', 'Holiday days count neither as done nor as missed.'),
      F('words', 'words', 'Wörter für Ferien', 'Words for holidays', 'Mit Komma getrennt. Wortenden zählen: „Ferien“ findet „Skiferien“.', 'Comma separated. Word endings count: "holiday" finds "ski holiday".'),
      F('scope', 'select', 'Ferien gelten für', 'Holidays apply to', 'Nur die Person des Kalenders bzw. die im Titel genannten – oder die ganze Familie.', 'Only the calendar\'s person or those named in the title – or the whole family.',
        { opts: [['owner', { de: 'Person / Genannte', en: 'Person / persons named' }], ['family', { de: 'Ganze Familie', en: 'Whole family' }]] }),
      F('min_hours', 'num', 'Ganzer Tag ab', 'Whole day from', 'Mindestdauer eines Termins mit Uhrzeit, um als Ferientag zu zählen.', 'Minimum duration of a timed event to count as a holiday.', { min: 12, max: 24, unit: 'h' }),
      F('refresh_minutes', 'num', 'Kalender prüfen alle', 'Check calendars every', 'Wie oft auf neue Ferien geprüft wird.', 'How often new holidays are checked.', { min: 15, max: 240, unit: 'min' }),
      F('rescan', 'bool', 'Kalender neu nach Ferien-Wörtern durchsuchen', 'Search calendars for holiday words again', 'Einmalig beim Speichern.', 'Once when saving.'),
    ] },
    { id: 'points', icon: 'mdi:star-circle-outline', label: { de: 'Punkte', en: 'Points' }, fields: [
      F('mode', 'select', 'Punkte verteilen', 'How points are given', 'Fair: ein ganz erledigter Tag ist für alle gleich viel wert. Pro Ämtli: mehr Ämtli, mehr Punkte.', 'Fair: a fully completed day is worth the same for everybody. Per chore: more chores, more points.',
        { opts: [['fair', { de: 'Fair', en: 'Fair' }], ['per_chore', { de: 'Pro Ämtli', en: 'Per chore' }]] }),
      F('day_points', 'num', 'Punkte für einen ganzen Tag (fair)', 'Points for a full day (fair)', 'Wird auf die Ämtli des Tages verteilt.', 'Split across the day\'s chores.', { min: 0, max: 1000 }),
      F('default_points', 'num', 'Punkte pro Ämtli (Standard bzw. Gewicht)', 'Points per chore (default or weight)', 'Pro Ämtli im Ämtliplan änderbar.', 'Can be changed per chore in the chore plan.', { min: 0, max: 1000 }),
      F('day_bonus', 'num', 'Tagesbonus', 'Day bonus', 'Für einen ganz erledigten Tag.', 'For a fully completed day.', { min: 0, max: 1000 }),
      F('streak_bonus', 'num', 'Serienbonus', 'Streak bonus', 'Für jede 7-Tage-Serie.', 'For every 7-day streak.', { min: 0, max: 1000 }),
      F('reward_value', 'num', 'Gegenwert einer grossen Belohnung', 'Value of a large reward', 'Gross = so viel, wie man in einem Monat mit allen Ämtli inkl. Boni verdient. Klein = ¼, Mittel = ½, Mega = 2×, Riesig = 5×. Nur zur Orientierung.', 'Large = what you earn in a month with every chore done incl. bonuses. Small = ¼, medium = ½, mega = 2×, giant = 5×. Just a guide.', { min: 0, max: 100000, step: 0.5 }),
      F('currency', 'text', 'Währung', 'Currency', 'z. B. CHF oder €.', 'e.g. CHF or €.', { max: 8 }),
      F('awards', 'awards', 'Pokale & Auszeichnungen', 'Trophies & awards', 'Pro Auszeichnung ein/aus und wie viele Punkte sie bringt (beim Gewinnen, und wieder, wenn man sie neu gewinnt). Klein = ⅓, Mittel = ⅔, Gross = 1×, Riesig = 2× der Punkte für einen ganzen Tag.', 'Per award on/off and how many points it gives (when won, and again when won anew). Small = ⅓, medium = ⅔, large = 1×, giant = 2× the points for a full day.'),
      F('season_start', 'md', 'Neue Level-Saison ab', 'New level season from', 'Jedes Schuljahr starten alle wieder bei Level 1. Freigeschaltete Extras und Punkte zum Einlösen bleiben, der Bestwert wird als Abzeichen gespeichert.', 'Every school year everybody starts again at level 1. Unlocked extras and points to redeem stay; the best level is kept as a badge.'),
      F('level_bonus', 'bool', 'Bonuspunkte beim Level-Aufstieg', 'Bonus points on level up', 'Ein voller Tag Punkte pro Level, drei bei einer neuen Stufe (Silber, Gold, Diamant, Rubin).', 'One full day of points per level, three for a new tier (silver, gold, diamond, ruby).'),
      F('early_time', 'time', 'Frühaufsteher: alles erledigt vor', 'Early bird: everything done before', 'Zeit für die Auszeichnung „Frühaufsteher“.', 'Time for the "Early bird" award.'),
      F('confetti', 'bool', 'Konfetti', 'Confetti', 'Kleines Konfetti mit Namen, wenn jemand alle Ämtli des Tages erledigt hat; grösseres in der Pokalfarbe bei Pokalen. Höchstens ein grosses pro Person und Tag.', 'Small confetti with the name when someone has done all chores of the day; bigger ones in the trophy colour for trophies. At most one big one per person and day.'),
      F('reward_notify', 'entities', 'Anfragen zusätzlich melden an', 'Also send requests to', 'z. B. die Handy-App – zusätzlich zur Mitteilung in Home Assistant.', 'e.g. the mobile app – in addition to the Home Assistant notification.', { domain: 'notify' }),
    ] },
    { id: 'todos', icon: 'mdi:checkbox-marked-circle-outline', label: { de: 'To-dos', en: 'To-dos' }, fields: [
      F('confirm', 'bool', 'Erledigen bestätigen', 'Confirm completion', 'To-dos werden erst nach der Frage „Als erledigt markieren?“ abgehakt.', 'To-dos are only ticked off after the question "Mark as done?".'),
      F('size', 'select', 'Standard-Grösse', 'Default size', 'Gross = Punkte für einen ganzen Tag, Mittel = ⅔, Klein = ⅓ (aufgerundet). Eine andere Grösse beim Anlegen braucht die Eltern-PIN. Zählt nicht zum fairen Tageswert.', 'Large = points for a full day, medium = ⅔, small = ⅓ (rounded up). Another size when adding needs the parent PIN. Does not count towards the fair day value.',
        { opts: [['none', { de: 'Ohne Punkte', en: 'No points' }], ['s', { de: 'Klein', en: 'Small' }], ['m', { de: 'Mittel', en: 'Medium' }], ['l', { de: 'Gross', en: 'Large' }]] }),
      F('keep_days', 'num', 'Erledigte anzeigen für', 'Show finished ones for', '0 = bis zum nächsten Tageswechsel.', '0 = until the next day change.', { min: 0, max: 30, unit: { de: 'Tage', en: 'days' } }),
    ] },
    { id: 'announce', icon: 'mdi:bullhorn-outline', label: { de: 'Ansagen', en: 'Announcements' }, fields: [
      F('enabled', 'bool', 'Ansagen einschalten', 'Enable announcements', 'Sagt bei Bewegung an, wer noch Ämtli offen hat.', 'Announces on motion who still has chores open.'),
      F('motion', 'entities', 'Bewegungsmelder', 'Motion sensors', 'Bewegung, Präsenz oder Anwesenheit.', 'Motion, presence or occupancy.', { domain: 'binary_sensor', classes: ['motion', 'occupancy', 'presence'] }),
      F('notify', 'entities', 'Ansage über (Alexa)', 'Announce via (Alexa)', 'Benachrichtigungs-Entität „Ankündigen“ oder „Sprechen“ der Integration Alexa Devices.', 'Notify entity "Announce" or "Speak" of the Alexa Devices integration.', { domain: 'notify' }),
      F('tts', 'entity', 'Sprachausgabe (TTS)', 'Text-to-speech (TTS)', 'Alternativ zu Alexa, zusammen mit Lautsprechern.', 'Alternative to Alexa, together with speakers.', { domain: 'tts' }),
      F('media_players', 'entities', 'Lautsprecher für TTS', 'Speakers for TTS', '', '', { domain: 'media_player' }),
      F('start', 'time', 'Von', 'From', 'Zeitfenster für Ämtli-Erinnerungen.', 'Time window for chore reminders.'),
      F('end', 'time', 'Bis', 'Until', '', ''),
      F('cooldown', 'num', 'Höchstens alle', 'At most every', 'Pause zwischen zwei Erinnerungen.', 'Pause between two reminders.', { min: 5, max: 720, unit: 'min' }),
      F('all_done', 'bool', 'Auch ansagen, wenn alles erledigt ist', 'Also announce when everything is done', 'Einmal pro Tag.', 'Once a day.'),
      F('persons', 'persons', 'Nur für', 'Only for', 'Leer = alle Personen.', 'Empty = everyone.'),
      F('max_items', 'num', 'Ämtli pro Person in der Ansage', 'Chores per person in the announcement', 'Weitere als „und 2 weitere“.', 'Further ones as "and 2 more".', { min: 1, max: 10 }),
      F('queue', 'bool', 'Warteschlange für einmalige Meldungen', 'Queue for one-off messages', 'Meldungen warten auf die nächste Bewegung.', 'Messages wait for the next motion.'),
      F('queue_start', 'time', 'Meldungen frühestens ab', 'Messages not before', 'Ruhezeiten der Warteschlange.', 'Quiet hours of the queue.'),
      F('queue_end', 'time', 'Meldungen spätestens bis', 'Messages not after', '', ''),
      F('queue_rewards', 'bool', 'Freigegebene Belohnungen ansagen', 'Announce approved rewards', '', ''),
      F('reward_hours', 'num', 'Belohnungs-Meldung gültig für', 'Reward message valid for', '0 = bis zum Tageswechsel.', '0 = until the day change.', { min: 0, max: 48, unit: 'h' }),
      F('queue_special', 'bool', 'Besondere Ämtli ansagen', 'Announce special chores', 'Entfällt, sobald das Ämtli erledigt ist.', 'Dropped once the chore is done.'),
    ] },
    { id: 'lists', icon: 'mdi:cart-outline', label: { de: 'Listen', en: 'Lists' }, fields: [
      F('optimize_time', 'time', 'Tägliche Optimierung um', 'Daily optimisation at', 'Ordnet Unbekanntes unter „Sonstiges“ neu ein.', 'Re-sorts unknown items from "Other".'),
      F('ai_task', 'entity', 'KI-Aufgabe (optional)', 'AI task (optional)', 'Ordnet auch Unbekanntes ein (OpenAI, Google, Ollama …).', 'Also sorts unknown items (OpenAI, Google, Ollama …).', { domain: 'ai_task' }),
      F('prune_days', 'num', 'Ungenutzte Kategorie ersetzen nach', 'Replace unused category after', 'Macht Platz, wenn die Liste voll ist.', 'Makes room when the list is full.', { min: 7, max: 365, unit: { de: 'Tage', en: 'days' } }),
    ] },
    { id: 'status', icon: 'mdi:heart-pulse', label: { de: 'Status', en: 'Status' } },
  ];
  // tab order on the page
  const ORDER = ['pics', 'general', 'persons', 'chores', 'points', 'todos', 'lists', 'vacation', 'announce', 'status'];
  const NAVL = { de: { planer: 'Planer', listen: 'Listen', aemtliplan: 'Ämtliplan', belohnungen: 'Belohnungen', einstellungen: 'Einstellungen' }, en: { planer: 'Planner', listen: 'Lists', aemtliplan: 'Chore plan', belohnungen: 'Rewards', einstellungen: 'Settings' } };
  const AWN = { de: { trophy: 'Pokal des Monats', crown: 'Krone der Woche', perfect: 'Perfekte Woche', bee: 'Fleissbiene', weekend: 'Wochenend-Held', climber: 'Aufsteiger', early: 'Frühaufsteher', diamond: 'Diamant-Serie', milestone: 'Meilensteine', team: 'Familien-Teamwork' },
    en: { trophy: 'Trophy of the month', crown: 'Crown of the week', perfect: 'Perfect week', bee: 'Busy bee', weekend: 'Weekend hero', climber: 'Climber', early: 'Early bird', diamond: 'Diamond streak', milestone: 'Milestones', team: 'Family teamwork' } };
  const AWS = { de: { none: 'Ohne Punkte', s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Riesig' }, en: { none: 'No points', s: 'Small', m: 'Medium', l: 'Large', xl: 'Giant' } };
  const SECTION = { general: 'general', vacation: 'vacation', points: 'points', todos: 'todos', announce: 'announce', lists: 'lists_settings' };

  class FpSettingsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this._lang = cfg.lang === 'en' ? 'en' : 'de'; this.T = UI[this._lang];
      this._tab = this._tab || 'general';
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => this._input(e));
        this.shadowRoot.addEventListener('change', (e) => this._input(e, true));
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; if (this._plan) this._plan.hass = h; }
    // without the parent PIN only the pictures are shown; "Parent PIN" at the top right opens everything else
    update() { if (!this._data && window.FPPIN && window.FPPIN.unlocked(this._store) && !this._asked) { this._asked = true; this._load(); } else this._render(); }
    connectedCallback() { if (!this._data && window.FPPIN && this._store && window.FPPIN.unlocked(this._store) && !this._asked) { this._asked = true; setTimeout(() => this._load(), 30); } else this._render(); }
    _ctx() { return { lang: this._lang, host: this }; }
    _flash(m, err) { this._msg = m; this._err = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4500); }
    _errText(e) {
      const code = String((e && (e.code || e.message)) || e).replace(/^invalid_/, '');
      return this.T.errors[code] || (e && e.message) || code;
    }
    async _call(type, data) {
      try { return await window.FPPIN.call(this._store, type, data, this._ctx()); } catch (e) {
        if (e === window.FPPIN.CANCEL) return null;
        if (e && e.code === 'pin_required') { this._data = null; }
        this._flash(this._errText(e), true); return null;
      }
    }
    async _load() {
      if (!this._store || !window.FPPIN) return;
      const res = await this._call('family_planer/settings/get', {});
      if (!res) { this._render(); return; }
      this._data = res; this._forms = {};
      for (const t of TABS) if (t.fields) this._forms[t.id] = this._formFor(t.id);
      this._persons = clone(res.persons); this._lists = clone(res.lists);
      this._render();
    }
    _formFor(id) {
      const d = this._data;
      if (id === 'general') { const g = clone(d.general); g.mod_week = g.modules.week; g.mod_lists = g.modules.lists; return g; }
      if (id === 'lists') return clone(d.lists_settings);
      if (id === 'points') { const f = clone(d.points); f.early_time = (f.awards || {}).early_time || '12:00'; f.confetti = (f.awards || {}).confetti !== false;
        f.season_start = (f.levels || {}).season_start || '08-01'; f.level_bonus = (f.levels || {}).bonus !== false; return f; }
      return clone(d[id]);
    }
    _input(e, isChange) {
      const el = e.target; const ds = el.dataset;
      if (ds.avup !== undefined && isChange && el.files && el.files[0]) { const p = this._avPerson(); if (p) this._avUpload(p, el.files[0]); return; }
      if (ds.navtg) { const n = this._forms.general.nav; n.hidden = el.checked ? n.hidden.filter((x) => x !== ds.navtg) : [...n.hidden, ds.navtg]; return; }
      if (ds.awon || ds.awsz) { const it = this._forms.points.awards.items; const id = ds.awon || ds.awsz; it[id] = { ...(it[id] || {}) }; if (ds.awon) it[id].on = el.checked; else it[id].size = el.value; return; }
      if (ds.pk === 'role') { const p = this._persons[Number(ds.pi)]; if (p) p.role = el.value; return; }
      if (ds.k && ds.tab) {
        const f = this._forms[ds.tab]; if (!f) return;
        if (el.type === 'checkbox') f[ds.k] = el.checked;
        else if (el.type === 'number') f[ds.k] = el.value === '' ? '' : Number(el.value);
        else if (ds.type === 'words') f[ds.k] = el.value;
        else if (ds.type === 'md') { if (/^\d{4}-\d{2}-\d{2}$/.test(el.value)) f[ds.k] = el.value.slice(5); }
        else if (ds.addent !== undefined) { if (isChange && el.value) { const cur = Array.isArray(f[ds.k]) ? f[ds.k] : []; if (!cur.includes(el.value)) cur.push(el.value); f[ds.k] = cur; this._render(); } }
        else f[ds.k] = el.value || (ds.type === 'entity' ? null : el.value);
        if (el.tagName === 'SELECT' && isChange && ds.addent === undefined) this._render();
        return;
      }
      if (ds.pk) { // person field
        const p = this._persons[Number(ds.pi)]; if (!p) return;
        if (ds.pk === 'time') { const [day, n, w] = ds.pt.split('|'); const t = p.school.times; const spans = t[day] || (t[day] = [[null, null], [null, null]]); while (spans.length < 2) spans.push([null, null]); spans[Number(n)][w === 's' ? 0 : 1] = el.value || null; return; }
        if (ds.pk === 'school_calendar') p.school.calendar = el.value || null;
        else if (ds.pk === 'travel') p.school.travel = Number(el.value) || 0;
        else if (ds.pk === 'aliases') p.aliases = el.value.split(',').map((x) => x.trim()).filter(Boolean);
        else p[ds.pk] = el.value || (ds.pk === 'calendar' ? null : el.value);
        return;
      }
      if (ds.lk) { const l = this._lists[Number(ds.li)]; if (!l) return; l[ds.lk] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value; }
    }
    async _click(e) {
      const t = e.target;
      if (t.closest('[data-unlock]')) { this._asked = true; this._load(); return; }
      const ap = t.closest('[data-avp]'); if (ap) { this._avp = ap.dataset.avp; this._render(); return; }
      const at = t.closest('[data-avtab]'); if (at) { this._avtab = at.dataset.avtab; this._render(); return; }
      if (t.closest('[data-avrnd]')) { const p = this._avPerson(); if (p) { const fx = window.FPAV.parse(this._avCode(p)).fx; this._avSave(p, window.FPAV.set(window.FPAV.random(), 'fx', fx)); } return; }
      const avb = t.closest('[data-avb]'); if (avb) { const p = this._avPerson(); if (p) { const [part, val] = avb.dataset.avb.split('|'); this._avSave(p, window.FPAV.set(this._avCode(p), part, val)); } return; }
      const tab = t.closest('[data-tabsel]'); if (tab) { this._tab = tab.dataset.tabsel; this._render(); return; }
      if (t.closest('[data-chpin]')) { try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); } return; }
      if (t.closest('[data-lock]')) { window.FPPIN.lock(this._store); this._data = null; this._asked = false; this._tab = 'pics'; this._render(); return; }
      const rm = t.closest('[data-rment]');
      if (rm) { const f = this._forms[rm.dataset.tab]; f[rm.dataset.k] = (f[rm.dataset.k] || []).filter((x) => x !== rm.dataset.rment); this._render(); return; }
      const pc = t.closest('[data-pchip]');
      if (pc) { const f = this._forms[pc.dataset.tab]; const cur = f[pc.dataset.k] || []; f[pc.dataset.k] = cur.includes(pc.dataset.pchip) ? cur.filter((x) => x !== pc.dataset.pchip) : [...cur, pc.dataset.pchip]; this._render(); return; }
      if (t.closest('[data-savetab]')) { this._saveTab(); return; }
      const nm = t.closest('[data-navmv]');
      if (nm) { const [id, d] = nm.dataset.navmv.split('|'); const o = this._forms.general.nav.order; const i = o.indexOf(id); const j = i + Number(d); if (i >= 0 && j >= 0 && j < o.length) { [o[i], o[j]] = [o[j], o[i]]; this._render(); } return; }
      const pm = t.closest('[data-pmv]');
      if (pm) { const [i0, d] = pm.dataset.pmv.split('|').map(Number); const j = i0 + d; const ps = this._persons; if (j < 0 || j >= ps.length) return; [ps[i0], ps[j]] = [ps[j], ps[i0]]; this._render();
        const ids = ps.filter((p) => p.id).map((p) => p.id); const res = await this._call('family_planer/person/order', { order: ids }); if (res !== null) this._flash(this.T.saved); return; }
      const vd = t.closest('[data-vdec]');
      const vfm = t.closest('[data-vfam]'); if (vfm) { const c = this._vacChoice(vfm.dataset.vfam); c.family = !c.family; this._render(); return; }
      const vpr = t.closest('[data-vper]'); if (vpr) { const c = this._vacChoice(vpr.dataset.vkey); c.family = false; const i = c.persons.indexOf(vpr.dataset.vper); if (i >= 0) c.persons.splice(i, 1); else c.persons.push(vpr.dataset.vper); this._render(); return; }
      if (vd) { const [key, dec] = vd.dataset.vdec.split('|'); const c = this._vacChoice(key);
        const res = await this._call('family_planer/vacation/decide', { key, decision: dec || null, family: !!c.family, persons: c.family ? [] : c.persons }); if (res !== null) { delete this._vc[key]; this._flash(this.T.saved); } return; }
      const sp = t.closest('[data-psave]'); if (sp) { this._savePerson(Number(sp.dataset.psave)); return; }
      const dp = t.closest('[data-pdel]'); if (dp) { const p = this._persons[Number(dp.dataset.pdel)]; this._dlg = { kind: 'person', i: Number(dp.dataset.pdel), title: p.name }; this._render(); return; }
      if (t.closest('[data-padd]')) { this._persons.push({ id: null, name: '', color: '#4FA3E0', role: 'kid', image: '', calendar: null, aliases: [], school: { calendar: null, times: {}, travel: 0 }, open: true }); this._render(); return; }
      const po = t.closest('[data-popen]'); if (po) { const p = this._persons[Number(po.dataset.popen)]; p.open = !p.open; this._render(); return; }
      const ls = t.closest('[data-lsave]'); if (ls) { this._saveList(Number(ls.dataset.lsave)); return; }
      const ld = t.closest('[data-ldel]'); if (ld) { const l = this._lists[Number(ld.dataset.ldel)]; this._dlg = { kind: 'list', i: Number(ld.dataset.ldel), title: l.name }; this._render(); return; }
      if (t.closest('[data-ladd]')) { this._lists.push({ id: null, name: '', entity: null, icon: 'mdi:cart-outline', max_categories: 10, auto: true }); this._render(); return; }
      if (t.closest('[data-yes]') && this._dlg) { const d = this._dlg; this._dlg = null; if (d.kind === 'person') await this._removePerson(d.i); else await this._removeList(d.i); this._render(); return; }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    async _saveTab() {
      const id = this._tab; const f = { ...this._forms[id] };
      if (id === 'general') { f.modules = { week: !!f.mod_week, lists: !!f.mod_lists }; delete f.mod_week; delete f.mod_lists; }
      if (id === 'points') { f.awards = { items: (f.awards || {}).items || {}, early_time: f.early_time, confetti: !!f.confetti }; delete f.early_time; delete f.confetti;
        f.levels = { season_start: f.season_start, bonus: !!f.level_bonus }; delete f.season_start; delete f.level_bonus; }
      if (id === 'vacation' && typeof f.words === 'string') f.words = f.words.split(',').map((x) => x.trim()).filter(Boolean);
      const res = await this._call('family_planer/settings/save', { section: SECTION[id], data: f });
      if (!res) return;
      if (id === 'vacation') this._forms.vacation.rescan = false;
      this._flash(res.reload ? this.T.reloading : this.T.saved);
    }
    async _savePerson(i) {
      const p = this._persons[i]; const times = {};
      for (const [day, spans] of Object.entries(p.school.times || {})) {
        const ok = spans.filter((s) => s && s[0] && s[1]).map((s) => [s[0].slice(0, 5), s[1].slice(0, 5)]);
        if (spans.some((s) => s && ((s[0] && !s[1]) || (!s[0] && s[1])))) { this._flash(this.T.errors.bad_times, true); return; }
        if (ok.length) times[day] = ok;
      }
      const data = { name: p.name, color: p.color, role: p.role === 'adult' ? 'adult' : 'kid', calendar: p.calendar, aliases: p.aliases || [], school: { calendar: p.school.calendar, times, travel: p.school.travel || 0 } };
      const res = await this._call('family_planer/settings/person', { ...(p.id ? { person_id: p.id } : {}), data });
      if (!res) return; p.id = res.person_id; p.open = false; this._flash(res.reload ? this.T.reloading : this.T.saved);
    }
    async _removePerson(i) { const p = this._persons[i]; if (!p.id) { this._persons.splice(i, 1); return; } const res = await this._call('family_planer/settings/person_remove', { person_id: p.id }); if (res) { this._persons.splice(i, 1); this._flash(this.T.reloading); } }
    async _saveList(i) {
      const l = this._lists[i];
      const res = await this._call('family_planer/settings/list', { ...(l.id ? { list_id: l.id } : {}), data: { name: l.name, entity: l.entity, icon: l.icon, max_categories: l.max_categories, auto: l.auto } });
      if (res) { l.id = res.list_id; this._flash(this.T.saved); }
    }
    async _removeList(i) { const l = this._lists[i]; if (!l.id) { this._lists.splice(i, 1); return; } const res = await this._call('family_planer/settings/list_remove', { list_id: l.id }); if (res !== null) { this._lists.splice(i, 1); this._flash(this.T.saved); } }

    _entities(domain, classes) {
      const st = (this._hass && this._hass.states) || {};
      return Object.keys(st).filter((e) => e.startsWith(domain + '.') && (!classes || classes.includes((st[e].attributes || {}).device_class)))
        .sort().map((e) => [e, (st[e].attributes || {}).friendly_name || e]);
    }
    _entSelect(attrs, domain, classes, value, placeholder) {
      const opts = this._entities(domain, classes);
      if (value && !opts.some(([e]) => e === value)) opts.unshift([value, value]);
      return `<select class="in" ${attrs}><option value="">${esc(placeholder || this.T.none)}</option>${opts.map(([e, n]) => `<option value="${esc(e)}" ${e === value ? 'selected' : ''}>${esc(n)} · ${esc(e)}</option>`).join('')}</select>`;
    }
    _fx() { return (this._lang === 'en' ? window.FPX_EN : window.FPX) || window.FPX || {}; }
    _snap() { return (this._store && this._store.snap) || {}; }
    _field(tab, fd, v) {
      const lang = this._lang; const a = `data-tab="${tab}" data-k="${fd.k}" data-type="${fd.type}"`;
      const head = `<span class="lt"><b>${esc(L(fd.label, lang))}</b>${fd.desc[lang] ? `<small>${esc(L(fd.desc, lang))}</small>` : ''}</span>`;
      if (fd.type === 'nav') {
        const n = v || { order: [], hidden: [] }; const mods = this._data.general.modules;
        return `<div class="row col1">${head}<div class="navl">${n.order.map((id, i) => { const off = (id === 'listen' && !mods.lists) || (['planer', 'belohnungen', 'aemtliplan'].includes(id) && !mods.week);
          return `<div class="nr${off ? ' off' : ''}"><span class="nn">${esc(NAVL[lang][id] || id)}</span><button class="ar" data-navmv="${esc(id)}|-1" ${i ? '' : 'disabled'} aria-label="up">▲</button><button class="ar" data-navmv="${esc(id)}|1" ${i < n.order.length - 1 ? '' : 'disabled'} aria-label="down">▼</button>
            <input type="checkbox" class="sw" data-navtg="${esc(id)}" ${n.hidden.includes(id) ? '' : 'checked'} ${id === 'einstellungen' ? 'disabled' : ''}></div>`; }).join('')}</div></div>`;
      }
      if (fd.type === 'awards') {
        const it = (v && v.items) || {}; const pts = this._snap().award_points || {};
        return `<div class="row col1">${head}<div class="awl">${Object.keys(AWN.de).map((id) => { const x = it[id] || { on: true, size: 's' };
          return `<div class="awr"><input type="checkbox" class="sw" data-awon="${id}" ${x.on ? 'checked' : ''}><span class="nn">${esc(AWN[lang][id])}</span>
            <select class="in sz" data-awsz="${id}">${Object.entries(AWS[lang]).map(([k, l]) => `<option value="${k}" ${x.size === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><span class="u">${pts[id] != null ? '= ' + pts[id] : ''}</span></div>`; }).join('')}</div></div>`;
      }
      const unit = fd.unit ? `<span class="u">${esc(typeof fd.unit === 'string' ? fd.unit : L(fd.unit, lang))}</span>` : '';
      let ctl = '';
      if (fd.type === 'bool') return `<label class="row b"><span class="lt"><b>${esc(L(fd.label, lang))}</b>${fd.desc[lang] ? `<small>${esc(L(fd.desc, lang))}</small>` : ''}</span><input type="checkbox" class="sw" ${a} ${v ? 'checked' : ''}></label>`;
      if (fd.type === 'num') ctl = `<span class="nw"><input class="in n" type="number" inputmode="${fd.step && fd.step < 1 ? 'decimal' : 'numeric'}" min="${fd.min}" max="${fd.max}" step="${fd.step || 1}" ${a} value="${esc(v)}">${unit}</span>`;
      else if (fd.type === 'md') ctl = `<input class="in" style="width:170px" type="date" ${a} value="${esc(new Date().getFullYear() + '-' + String(v || '08-01'))}">`;
      else if (fd.type === 'time') ctl = `<input class="in t" type="time" ${a} value="${esc(String(v || '').slice(0, 5))}">`;
      else if (fd.type === 'text') ctl = `<input class="in" maxlength="${fd.max || 80}" ${a} value="${esc(v)}">`;
      else if (fd.type === 'words') ctl = `<input class="in" maxlength="600" ${a} value="${esc(Array.isArray(v) ? v.join(', ') : v)}">`;
      else if (fd.type === 'select') ctl = `<select class="in" ${a}>${fd.opts.map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(typeof l === 'string' ? l : L(l, lang))}</option>`).join('')}</select>`;
      else if (fd.type === 'entity') ctl = this._entSelect(a, fd.domain, fd.classes, v);
      else if (fd.type === 'entities') {
        const cur = Array.isArray(v) ? v : [];
        ctl = `<div class="ents">${cur.map((e) => `<span class="ec">${esc(((this._hass && this._hass.states[e]) || { attributes: {} }).attributes.friendly_name || e)}<button data-rment="${esc(e)}" data-tab="${tab}" data-k="${fd.k}" aria-label="x">✕</button></span>`).join('')}
          ${this._entSelect(`${a} data-addent`, fd.domain, fd.classes, '', '+ ' + this.T.search)}</div>`;
      } else if (fd.type === 'persons') {
        const cur = Array.isArray(v) ? v : [];
        ctl = `<div class="ents">${(this._data.persons || []).map((p) => `<button class="chip${cur.includes(p.id) ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-pchip="${esc(p.id)}" data-tab="${tab}" data-k="${fd.k}"><i></i>${esc(p.name)}</button>`).join('')}</div>`;
      }
      return `<div class="row"><span class="lt"><b>${esc(L(fd.label, lang))}</b>${fd.desc[lang] ? `<small>${esc(L(fd.desc, lang))}</small>` : ''}</span><span class="ctl">${ctl}</span></div>`;
    }
    _personsTab() {
      const T = this.T; const lang = this._lang;
      const lbl = (de, en) => (lang === 'en' ? en : de);
      return `${this._persons.map((p, i) => {
        const times = (p.school && p.school.times) || {};
        const sch = [1, 2, 3, 4, 5, 6].map((d) => { const spans = times[String(d)] || []; return `<div class="day"><b>${esc(T.days[d - 1])}</b>${[0, 1].map((n) => { const s = spans[n] || [null, null];
          return `<span class="blk">${esc(T.block)} ${n + 1}: <input class="in t" type="time" data-pk="time" data-pi="${i}" data-pt="${d}|${n}|s" value="${esc((s[0] || '').slice(0, 5))}"> – <input class="in t" type="time" data-pk="time" data-pi="${i}" data-pt="${d}|${n}|e" value="${esc((s[1] || '').slice(0, 5))}"></span>`; }).join('')}</div>`; }).join('');
        const FX = this._fx(); const img = /^(av:|svg:|img:|mdi:)/.test(p.image || '') ? p.image : '';
        const pic = FX.avatarHtml ? FX.avatarHtml({ name: p.name || '?', farbe: COLOR(p.color), ...(img ? { bild: img } : {}) }, 34) : '<i></i>';
        return `<div class="pcard" style="--c:${COLOR(p.color)}"><div class="phw"><button class="ph" data-popen="${i}">${pic}<b>${esc(p.name || lbl('Neue Person', 'New person'))}</b><em class="rl">${esc(p.role === 'adult' ? lbl('Erwachsen', 'Adult') : lbl('Kind', 'Child'))}</em><span class="sp"></span><ha-icon icon="${p.open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon></button>
          <button class="ar" data-pmv="${i}|-1" ${i ? '' : 'disabled'} aria-label="up">▲</button><button class="ar" data-pmv="${i}|1" ${i < this._persons.length - 1 ? '' : 'disabled'} aria-label="down">▼</button></div>
          ${p.open ? `<div class="pb">
            <div class="row"><span class="lt"><b>${lbl('Name', 'Name')}</b></span><span class="ctl"><input class="in" maxlength="40" data-pk="name" data-pi="${i}" value="${esc(p.name)}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Rolle', 'Role')}</b><small>${lbl('Kinder stehen oben im Planer und zählen für die Prognosen. Erwachsene können trotzdem Ämtli und Pokale haben.', 'Children are listed first in the planner and count for the forecasts. Adults can still have chores and trophies.')}</small></span><span class="ctl"><select class="in" data-pk="role" data-pi="${i}"><option value="kid" ${p.role !== 'adult' ? 'selected' : ''}>${lbl('Kind', 'Child')}</option><option value="adult" ${p.role === 'adult' ? 'selected' : ''}>${lbl('Erwachsen', 'Adult')}</option></select></span></div>
            <div class="row"><span class="lt"><b>${lbl('Farbe', 'Colour')}</b><small>${lbl('Gilt auch für den Kalender der Person.', 'Also used for the person\'s calendar.')}</small></span><span class="ctl"><input class="col" type="color" data-pk="color" data-pi="${i}" value="${esc(COLOR(p.color))}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Kalender', 'Calendar')}</b><small>${lbl('Termine dieser Person.', 'Events of this person.')}</small></span><span class="ctl">${this._entSelect(`data-pk="calendar" data-pi="${i}"`, 'calendar', null, p.calendar)}</span></div>
            <div class="row"><span class="lt"><b>${lbl('Spitznamen', 'Nicknames')}</b><small>${lbl('Mit Komma getrennt – Termine mit diesem Namen erscheinen bei der Person.', 'Comma separated – events with this name appear at the person.')}</small></span><span class="ctl"><input class="in" maxlength="300" data-pk="aliases" data-pi="${i}" value="${esc((p.aliases || []).join(', '))}"></span></div>
            <div class="sec2">${lbl('Schule & Stundenplan', 'School & timetable')}</div>
            <div class="row"><span class="lt"><b>${lbl('Schulkalender', 'School calendar')}</b><small>${lbl('Kalender mit den Lektionen – hat Vorrang vor festen Zeiten.', 'Calendar with the lessons – takes priority over fixed times.')}</small></span><span class="ctl">${this._entSelect(`data-pk="school_calendar" data-pi="${i}"`, 'calendar', null, p.school && p.school.calendar)}</span></div>
            <div class="row"><span class="lt"><b>${lbl('Schulweg', 'Travel time')}</b><small>${lbl('Zeigt „los“ und „zuhause“ pro Block (0 = aus).', 'Shows "leave" and "home" per block (0 = off).')}</small></span><span class="ctl"><span class="nw"><input class="in n" type="number" min="0" max="240" data-pk="travel" data-pi="${i}" value="${esc((p.school && p.school.travel) || 0)}"><span class="u">min</span></span></span></div>
            <div class="days">${sch}</div>
            <div class="acts">${p.id ? `<button class="sg del" data-pdel="${i}">${esc(T.del)}</button>` : ''}<span class="sp"></span><button class="sg ok" data-psave="${i}">${esc(T.save)}</button></div>
          </div>` : ''}</div>`; }).join('')}
        <button class="addb" data-padd>${esc(T.newPerson)}</button>`;
    }
    _listsExtra() {
      const T = this.T; const lbl = (de, en) => (this._lang === 'en' ? en : de);
      return `<div class="sec2">${lbl('Listen', 'Lists')}</div>${this._lists.map((l, i) => `<div class="lcard">
          <input class="in" maxlength="40" placeholder="${lbl('Name', 'Name')}" data-lk="name" data-li="${i}" value="${esc(l.name)}">
          ${this._entSelect(`data-lk="entity" data-li="${i}"`, 'todo', null, l.entity, lbl('To-do-Liste wählen …', 'Choose to-do list …'))}
          <input class="in" maxlength="70" placeholder="mdi:cart-outline" data-lk="icon" data-li="${i}" value="${esc(l.icon)}">
          <label class="mini">${lbl('Max. Kategorien', 'Max. categories')} <input class="in n" type="number" min="5" max="20" data-lk="max_categories" data-li="${i}" value="${esc(l.max_categories)}"></label>
          <label class="mini"><input type="checkbox" class="sw" data-lk="auto" data-li="${i}" ${l.auto ? 'checked' : ''}> ${lbl('Kategorien automatisch pflegen', 'Maintain categories automatically')}</label>
          <span class="acts"><button class="sg del" data-ldel="${i}">${esc(T.del)}</button><button class="sg ok" data-lsave="${i}">${esc(T.save)}</button></span></div>`).join('')}
        <button class="addb" data-ladd>${esc(T.newList)}</button>`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const lang = this._lang;
      const style = `<style>
        :host{display:block}
        .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:18px;font-family:var(--fp-font);color:var(--fp-text,#ececec);min-height:360px}
        .top{display:flex;align-items:center;gap:10px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
        .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
        .tab{display:flex;align-items:center;gap:8px;height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--fp-line,#2a2a2a);background:var(--fp-bg2,#232323);color:var(--fp-text2,#bbb);font:inherit;font-size:14px;cursor:pointer}
        .tab.on{border-color:${G};color:${G};background:var(--fp-bg3,#262626);font-weight:600}
        .rows{display:flex;flex-direction:column;gap:2px;max-width:980px}
        .row{display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1.1fr);gap:16px;align-items:center;padding:12px 4px;border-bottom:1px solid var(--fp-line,#262626)}
        .row.b{grid-template-columns:1fr auto;cursor:pointer}
        .lt{display:flex;flex-direction:column;gap:3px}.lt b{font-size:15px;font-weight:500}.lt small{font-size:12px;color:var(--fp-text3,#8a8a8a);line-height:1.4}
        .ctl{display:flex;justify-content:flex-start}
        .in{height:42px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 12px;outline:none;width:100%;box-sizing:border-box;min-width:0}
        .in:focus{border-color:${G}}select.in{padding:0 8px}.in.n{width:110px}.in.t{width:120px}
        .nw{display:flex;align-items:center;gap:8px}.u{color:var(--fp-text3,#888);font-size:13px}
        .sw{appearance:none;-webkit-appearance:none;width:50px;height:30px;border-radius:15px;background:var(--fp-bg4,#3a3a3a);position:relative;cursor:pointer;flex:none;margin:0;transition:background .15s}
        .sw::after{content:'';position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#ddd;transition:left .15s}
        .sw:checked{background:${G}}.sw:checked::after{left:23px;background:#fff}
        .ents{display:flex;flex-wrap:wrap;gap:6px;width:100%}.ents select{flex:1;min-width:200px}
        .ec{display:flex;align-items:center;gap:6px;height:34px;padding:0 4px 0 12px;border-radius:17px;background:var(--fp-bg3,#2b2b2b);border:1px solid var(--fp-line,#3a3a3a);font-size:13px}
        .ec button{width:26px;height:26px;border-radius:13px;border:none;background:transparent;color:var(--fp-text2,#999);cursor:pointer}.ec button:hover{color:#e06b6b}
        .chip{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}.chip.on{border-color:var(--c);color:var(--c)}
        .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
        .bar{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;max-width:980px}
        .sg{height:42px;border-radius:21px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:14px;padding:0 18px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}.sg.del{background:#3a2626;border-color:#e06b6b;color:#f3b4b4}
        .pcard{border:1px solid var(--fp-line,#2a2a2a);border-left:4px solid var(--c);border-radius:12px;background:var(--fp-bg2,#232323);margin-bottom:10px;max-width:980px}
        .ph{display:flex;align-items:center;gap:10px;width:100%;height:52px;padding:0 14px;border:none;background:transparent;color:inherit;font:inherit;font-size:16px;cursor:pointer}
        .ph i{width:14px;height:14px;border-radius:50%;background:var(--c)}.sp{flex:1}
        .pb{padding:0 14px 14px}.col{width:60px;height:42px;border:none;background:transparent;padding:0;cursor:pointer}
        .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 4px 6px}
        .days{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin-top:8px}
        .day{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:10px;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a)}.day b{font-size:13px;color:var(--fp-text2,#bbb)}
        .blk{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fp-text3,#888)}.blk .in.t{width:110px;height:38px}
        .acts{display:flex;gap:8px;margin-top:14px;align-items:center}
        .addb{height:46px;border-radius:12px;border:1px dashed var(--fp-line,#4a4a4a);background:transparent;color:var(--fp-text2,#bbb);font:inherit;font-size:14px;cursor:pointer;padding:0 18px;margin-top:4px}
        .lcard{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:8px;align-items:center;padding:12px;border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a);margin-bottom:8px;max-width:980px}
        .lcard .mini{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--fp-text2,#aaa)}.lcard .acts{margin:0;justify-content:flex-end}
        .lockd{display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 20px;color:var(--fp-text2,#aaa);text-align:center}.lockd ha-icon{--mdc-icon-size:48px;color:${G}}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:18px;width:min(420px,92%)}.dh{font-size:16px;font-weight:600;margin-bottom:14px}
        .msg{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#2e3a2a;border:1px solid ${G};color:var(--fp-text,#dfe);padding:10px 18px;border-radius:12px;font-size:14px;z-index:20;max-width:80%}
        .msg.e{background:#3a2626;border-color:#e06b6b;color:#fdd}
        .row.col1{grid-template-columns:1fr}
        .navl,.awl{display:flex;flex-direction:column;gap:6px;max-width:560px}.nr,.awr{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a)}.nr.off{opacity:.5}
        .nn{flex:1;font-size:14px}.ar{width:34px;height:34px;border-radius:9px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);cursor:pointer;font-size:11px}.ar[disabled]{opacity:.3;cursor:default}
        .in.sz{width:140px;height:36px}.awr .u{min-width:44px;text-align:right}
        .phw{display:flex;align-items:center;gap:6px;padding-right:10px}.phw .ph{flex:1}.rl{font-style:normal;font-size:12px;color:var(--fp-text3,#888);border:1px solid var(--fp-line,#3a3a3a);border-radius:10px;padding:1px 8px}
                .avwrap{padding:10px 4px 6px}${(window.FPAV || {}).css || ''}
        .avps{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}.avpb{display:flex;align-items:center;gap:8px;height:52px;padding:0 14px 0 6px;border-radius:26px;border:1px solid var(--fp-line,#2a2a2a);background:var(--fp-bg2,#232323);color:inherit;font:inherit;font-size:14px;cursor:pointer}
        .avpb.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px}.upl label{display:inline-flex;align-items:center}.upl small{font-size:12px;color:var(--fp-text3,#8a8a8a)}
        .tb.pin{color:${G};border-color:${G}}
        .hint3{font-size:13px;color:var(--fp-text2,#999);margin:0 2px 10px;max-width:980px}
        .vch{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.vch .chip{height:30px;font-size:12px}.vbt{display:flex;gap:6px;flex-wrap:wrap}
        .vrl,.stl{display:flex;flex-direction:column;gap:8px;max-width:980px;margin-bottom:8px}.vr{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a)}.vr .lt{flex:1;min-width:200px}
        .str{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a)}.str ha-icon{color:${G}}.str.bad{border-color:#e06b6b}.str.bad ha-icon{color:#e06b6b}
        @media (max-width:700px){.row{grid-template-columns:1fr}.lcard{grid-template-columns:1fr}}
      .card,.pnl{-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}.card{position:relative}.card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}</style>`;
      const msg = this._msg ? `<div class="msg${this._err ? ' e' : ''}">${esc(this._msg)}</div>` : '';
      if (!this._data) {
        this.shadowRoot.innerHTML = `${style}<div class="card"><div class="top"><h2>${esc(T.title)}</h2><button class="tb pin" data-unlock><ha-icon icon="mdi:shield-key-outline"></ha-icon>${esc(T.parent)}</button></div>
          ${this._picsView()}${msg}</div>`;
        return;
      }
      const tab = TABS.find((x) => x.id === this._tab) || TABS[0];
      let body = '';
      if (tab.id === 'pics') body = this._picsView();
      else if (tab.id === 'persons') body = this._personsTab();
      else if (tab.id === 'chores') body = `<div class="hint3">${esc(lang === 'en' ? 'Tap a day to assign a chore. Special chores and to-dos: buttons at the top of the chore plan.' : 'Tag antippen, um ein Ämtli zuzuteilen. Besondere Ämtli und To-dos: Knöpfe oben im Ämtliplan.')}</div><div class="planhost"></div>`;
      else if (tab.id === 'status') body = this._statusTab();
      else {
        const f = this._forms[tab.id];
        body = `<div class="rows">${tab.fields.map((fd) => this._field(tab.id, fd, f[fd.k])).join('')}</div><div class="bar"><button class="sg ok" data-savetab>${esc(T.save)}</button></div>`;
        if (tab.id === 'lists') body += this._listsExtra();
        if (tab.id === 'vacation') body = this._vacReview() + body;
      }
      const d = this._dlg;
      const dlg = d ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.delAsk.replace('{t}', d.title || ''))}</div><div class="acts"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-yes>${esc(T.del)}</button></div></div></div>` : '';
      const mods = this._data.general.modules;
      const tabs = ORDER.map((id) => TABS.find((x) => x.id === id)).filter((x) => x && !((x.id === 'lists' && !mods.lists) || (['persons', 'chores', 'vacation', 'points', 'todos', 'announce'].includes(x.id) && !mods.week)));
      this.shadowRoot.innerHTML = `${style}<div class="card">
        <div class="top"><h2>${esc(T.title)}</h2><button class="tb" data-chpin><ha-icon icon="mdi:form-textbox-password"></ha-icon>${esc(T.pin)}</button><button class="tb" data-lock><ha-icon icon="mdi:lock-outline"></ha-icon>${esc(T.lock)}</button></div>
        <div class="tabs">${tabs.map((x) => `<button class="tab${x.id === tab.id ? ' on' : ''}" data-tabsel="${x.id}"><ha-icon icon="${x.icon}"></ha-icon>${esc(L(x.label, lang))}</button>`).join('')}</div>
        ${body}${dlg}${msg}</div>`;
      if (tab.id === 'chores') this._mountPlan();
    }
    // the chore plan lives in settings now: the full plan card (with special chores and to-dos) inside this tab
    _mountPlan() {
      const host = this.shadowRoot.querySelector('.planhost'); if (!host || !this._hass) return;
      if (!this._plan) { this._plan = document.createElement('family-planer-card'); this._plan.setConfig({ view: 'plan', ...(this._snap().entry_id ? { entry_id: this._snap().entry_id } : {}) }); }
      host.appendChild(this._plan); this._plan.hass = this._hass;
    }
    _avPerson() { const ps = this._snap().persons || []; return ps.find((p) => p.id === this._avp) || ps[0] || null; }
    _avCode(p) {
      const A = window.FPAV; const loc = (this._avLocal || {})[p.id]; const img = loc || p.image || '';
      if (img.startsWith('av2:')) return img;
      if (img.startsWith('av:')) return A.from1(img);
      return A.code({ ...A.parse(''), fig: p.role === 'adult' ? 'f' : 'm' });
    }
    async _avSave(p, code) {
      this._avLocal = { ...(this._avLocal || {}), [p.id]: code }; this._render();
      try { await this._store.ws('family_planer/person/update', { person_id: p.id, image: code }); } catch (er) { this._flash(this._errText(er), true); }
    }
    async _avUpload(p, file) {
      // centre crop to a 320 px square JPEG in the browser, then store it in Home Assistant
      const lbl = (de, en) => (this._lang === 'en' ? en : de);
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
        const sq = Math.min(img.naturalWidth, img.naturalHeight); const c = document.createElement('canvas'); c.width = c.height = 320;
        c.getContext('2d').drawImage(img, (img.naturalWidth - sq) / 2, (img.naturalHeight - sq) / 2, sq, sq, 0, 0, 320, 320);
        URL.revokeObjectURL(url);
        await this._store.ws('family_planer/person/upload_image', { person_id: p.id, data: c.toDataURL('image/jpeg', 0.86) });
        if (this._avLocal) delete this._avLocal[p.id];
        this._flash(lbl('Foto gespeichert.', 'Photo saved.'));
      } catch (er) { this._flash(lbl('Bild konnte nicht gelesen werden.', 'The picture could not be read.'), true); }
    }
    _picsView() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const ps = s.persons || [];
      const A = window.FPAV; const FX = this._fx(); const p = this._avPerson();
      if (!p || !A) return '';
      const pic = (q, size) => { const loc = (this._avLocal || {})[q.id]; const img = loc || q.image || '';
        return FX.avatarHtml ? FX.avatarHtml({ name: q.name, farbe: COLOR(q.color), ...(/^(av2?:|svg:|img:)/.test(img) ? { bild: img } : {}) }, size) : ''; };
      return `<div class="hint3">${esc(lbl('Jede und jeder darf hier ein Bild zusammenstellen – ohne PIN. Alles andere öffnet die Eltern-PIN oben rechts.', 'Anyone may build a picture here – no PIN needed. Everything else opens with the parent PIN at the top right.'))}</div>
        <div class="avps">${ps.map((q) => `<button class="avpb${q.id === p.id ? ' on' : ''}" style="--c:${COLOR(q.color)}" data-avp="${esc(q.id)}">${pic(q, 40)}<span>${esc(q.name)}</span></button>`).join('')}</div>
        <div class="avwrap">${A.builder(this._avCode(p), COLOR(p.color), lang, this._avtab, ((s.points || {})[p.id] || {}).unlocked || [])}</div>
        <div class="upl"><label class="sg">${esc(lbl('Eigenes Foto hochladen', 'Upload own photo'))}<input type="file" accept="image/*" data-avup hidden></label><small>${esc(lbl('Wird quadratisch zugeschnitten und nur in deinem Home Assistant gespeichert.', 'Cropped to a square and stored only in your Home Assistant.'))}</small></div>`;
    }
    _vacChoice(key) {
      this._vc = this._vc || {}; if (this._vc[key]) return this._vc[key];
      const v = (this._snap().vacation_review || []).find((x) => x.key === key) || {};
      this._vc[key] = { family: !!v.family, persons: [...((v.chosen && v.chosen.length ? v.chosen : v.persons) || [])] }; return this._vc[key];
    }
    _vacReview() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const rv = s.vacation_review || [];
      const d = (x) => String(x || '').slice(0, 10).split('-').reverse().slice(0, 2).join('.') + '.';
      const head = `<div class="sec2">${lbl('Ferien-Check', 'Holiday check')}</div><div class="hint3">${esc(lbl('Ferien und lange Termine der nächsten zwei Wochen. Entschiedene bleiben hier noch 4 Wochen und lassen sich ändern.', 'Holidays and long events of the next two weeks. Decided ones stay here for 4 more weeks and can be changed.'))}</div>`;
      if (!rv.length) return head + `<div class="hint3">${esc(lbl('Gerade nichts zu prüfen.', 'Nothing to check right now.'))}</div>`;
      const item = (v) => { const c = this._vacChoice(v.key);
        const state = v.decision === 'away' ? lbl('Entschieden: weg', 'Decided: away') : v.decision === 'home' ? lbl('Entschieden: hier', 'Decided: here') : lbl('Offen', 'Open');
        return `<div class="vr"><span class="lt"><b>${esc(v.title)}</b><small>${esc(d((v.days || [])[0] || v.start))} – ${esc(d((v.days || []).slice(-1)[0] || v.end))} · ${esc(state)}</small>
          <span class="vch"><button class="chip${c.family ? ' on' : ''}" style="--c:${G}" data-vfam="${esc(v.key)}"><i></i>${esc(lbl('Ganze Familie', 'Whole family'))}</button>${(s.persons || []).map((p) => `<button class="chip${!c.family && c.persons.includes(p.id) ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-vper="${esc(p.id)}" data-vkey="${esc(v.key)}"><i></i>${esc(p.name)}</button>`).join('')}</span></span>
          <span class="vbt"><button class="sg${v.decision === 'away' ? ' ok' : ''}" data-vdec="${esc(v.key)}|away">${lbl('Weg – pausieren', 'Away – pause')}</button><button class="sg${v.decision === 'home' ? ' ok' : ''}" data-vdec="${esc(v.key)}|home">${lbl('Hier – weiterlaufen', 'Here – go on')}</button>${v.decision ? `<button class="sg" data-vdec="${esc(v.key)}|">${lbl('Zurücksetzen', 'Reset')}</button>` : ''}</span></div>`; };
      const hol = rv.filter((v) => (v.kind || 'holiday') === 'holiday'); const lng = rv.filter((v) => v.kind === 'long');
      return head + `<div class="vrl">${hol.map(item).join('')}</div>${lng.length ? `<div class="sec2">${lbl('Optional – lange Termine', 'Optional – long events')}</div><div class="vrl">${lng.map(item).join('')}</div>` : ''}`;
    }
    _statusTab() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const st = s.status || {};
      const t = (x) => { if (!x) return ''; const dt = new Date(x); return isNaN(dt) ? String(x) : `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}. ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`; };
      const name = (k) => { const [kind, id] = k.split(/:(.*)/s);
        if (kind === 'calendar') { const e = ((this._hass && this._hass.states[id]) || { attributes: {} }).attributes.friendly_name; return lbl('Kalender ', 'Calendar ') + (e || id); }
        if (kind === 'list') return lbl('Liste ', 'List ') + (((s.lists || []).find((l) => l.id === id) || {}).name || id);
        if (kind === 'rollover') return lbl('Tageswechsel', 'Day change');
        return k; };
      const keys = Object.keys(st).sort();
      if (!keys.length) return `<div class="hint3">${esc(lbl('Noch keine Meldungen – sie erscheinen nach dem ersten Abgleich.', 'No reports yet – they appear after the first sync.'))}</div>`;
      return `<div class="hint3">${esc(lbl('Letzter erfolgreicher Abgleich und letzter Fehler pro Quelle.', 'Last successful sync and last error per source.'))}</div><div class="stl">${keys.map((k) => { const x = st[k] || {}; const bad = x.fail && (!x.ok || x.fail > x.ok);
        return `<div class="str${bad ? ' bad' : ''}"><ha-icon icon="${bad ? 'mdi:alert-circle-outline' : 'mdi:check-circle-outline'}"></ha-icon><span class="lt"><b>${esc(name(k))}</b><small>${esc([x.ok ? 'OK: ' + t(x.ok) : '', x.fail ? lbl('Fehler: ', 'Error: ') + t(x.fail) + (x.error ? ' – ' + x.error : '') : ''].filter(Boolean).join(' · '))}</small></span></div>`; }).join('')}</div>`;
    }
  }
  if (!customElements.get('fp-settings-inner')) customElements.define('fp-settings-inner', FpSettingsInner);
})();

// ---------------------------------------------------------------------------
// Parent PIN: keypad dialog, forced change of the start PIN 123456, short-lived unlock token.
// window.FPPIN.call(store, type, data, { lang, host }) sends a PIN-protected command and asks for the PIN
// only when needed. The PIN itself is never stored in the browser – only the server's 10-minute token in memory.
// ---------------------------------------------------------------------------
(() => {
  if (window.FPPIN) return;
  const TXT = {
    de: { unlock: 'Eltern-PIN', old: 'Aktuelle PIN', neu: 'Neue PIN (4–8 Ziffern)', again: 'Neue PIN wiederholen', ok: 'OK', cancel: 'Abbrechen',
      start: 'Die Start-PIN 123456 muss zuerst geändert werden.', wrong: 'Falsche PIN.', locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.',
      bad: 'Die neue PIN muss 4–8 Ziffern haben und darf nicht 123456 sein.', nomatch: 'Die PINs stimmen nicht überein.', changed: 'PIN geändert.' },
    en: { unlock: 'Parent PIN', old: 'Current PIN', neu: 'New PIN (4–8 digits)', again: 'Repeat new PIN', ok: 'OK', cancel: 'Cancel',
      start: 'The start PIN 123456 must be changed first.', wrong: 'Wrong PIN.', locked: 'Too many wrong tries – please wait 5 minutes.',
      bad: 'The new PIN must have 4–8 digits and must not be 123456.', nomatch: 'The PINs do not match.', changed: 'PIN changed.' },
  };
  const VARS = ['--fp-bg0', '--fp-bg1', '--fp-bg2', '--fp-bg3', '--fp-bg4', '--fp-line', '--fp-text', '--fp-text2', '--fp-text3', '--fp-accent', '--fp-on-accent', '--fp-radius', '--fp-font'];
  const tokens = new Map(); // store -> { t, exp }
  const CANCEL = 'cancel';

  // one keypad dialog; steps = [{ title, hint }] -> resolves with the entered values
  function keypad(ctx, steps, firstMsg) {
    const T = TXT[ctx.lang === 'en' ? 'en' : 'de'];
    return new Promise((resolve, reject) => {
      const el = document.createElement('div');
      const cs = ctx.host ? getComputedStyle(ctx.host) : null;
      el.style.cssText = 'position:fixed;inset:0;z-index:9999;' + (cs ? VARS.map((v) => `${v}:${cs.getPropertyValue(v)}`).join(';') : '');
      const root = el.attachShadow({ mode: 'open' });
      const vals = []; let step = 0; let pin = ''; let msg = firstMsg || ''; let err = !!firstMsg;
      const close = () => { el.remove(); document.removeEventListener('keydown', onKey, true); };
      const press = (k) => {
        if (k === 'del') pin = pin.slice(0, -1);
        else if (k === 'ok') { if (pin.length < 4) return; vals.push(pin); pin = ''; step += 1; msg = ''; if (step >= steps.length) { close(); resolve(vals); return; } }
        else if (pin.length < 8 && /^\d$/.test(k)) pin += k;
        draw();
      };
      const onKey = (e) => {
        if (e.key === 'Escape') { close(); reject(CANCEL); return; }
        if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') press('ok'); else return;
        e.preventDefault(); e.stopPropagation();
      };
      document.addEventListener('keydown', onKey, true);
      root.addEventListener('click', (e) => {
        const k = e.target.closest('[data-k]'); if (k) { press(k.dataset.k); return; }
        if (e.target.closest('[data-x]') || e.target.classList.contains('ov')) { close(); reject(CANCEL); }
      });
      const draw = () => {
        const s = steps[step];
        root.innerHTML = `<style>
          .ov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:var(--fp-font,system-ui,sans-serif)}
          .d{background:var(--fp-bg2,#232323);color:var(--fp-text,#eee);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);padding:20px;width:290px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5)}
          h3{margin:0 0 4px;font-size:16px;font-weight:600}.st{font-size:12px;color:var(--fp-text3,#888);margin-bottom:8px}
          .m{font-size:13px;min-height:18px;margin:4px 0 8px;color:var(--fp-text2,#bbb)}.m.e{color:#E06B6B}
          .dots{display:flex;gap:10px;justify-content:center;margin:8px 0 14px}.dots i{width:12px;height:12px;border-radius:50%;border:2px solid var(--fp-text3,#666)}.dots i.on{background:var(--fp-accent,#69C350);border-color:var(--fp-accent,#69C350)}
          .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
          button{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
          .k{height:56px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2e2e2e);color:var(--fp-text,#eee);font-size:21px}
          .k.ok{background:var(--fp-accent,#69C350);color:var(--fp-on-accent,#141414);font-size:15px;font-weight:600}
          .x{height:38px;border-radius:19px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);padding:0 18px}
        </style><div class="ov"><div class="d" role="dialog" aria-modal="true">
          <h3>${s.title}</h3>${steps.length > 1 ? `<div class="st">${step + 1} / ${steps.length}</div>` : ''}
          <div class="m${err ? ' e' : ''}">${msg || s.hint || ''}</div>
          <div class="dots">${Array.from({ length: Math.max(4, pin.length) }, (_, i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join('')}</div>
          <div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((k) => `<button class="k${k === 'ok' ? ' ok' : ''}" data-k="${k}" aria-label="${k}">${k === 'del' ? '⌫' : k === 'ok' ? T.ok : k}</button>`).join('')}</div>
          <button class="x" data-x>${T.cancel}</button></div></div>`;
        err = false;
      };
      draw();
      document.body.appendChild(el);
    });
  }

  const T = (ctx) => TXT[ctx.lang === 'en' ? 'en' : 'de'];
  const cached = (store) => { const c = tokens.get(store); return c && c.exp > Date.now() ? c.t : null; };
  const remember = (store, res) => { tokens.set(store, { t: res.token, exp: Date.now() + Math.max(60, (res.ttl || 600) - 60) * 1000 }); return res.token; };

  async function change(store, ctx, msg) {
    let note = msg || T(ctx).start;
    for (;;) {
      const [old, neu, again] = await keypad(ctx, [{ title: T(ctx).old }, { title: T(ctx).neu }, { title: T(ctx).again }], note);
      if (neu !== again) { note = T(ctx).nomatch; continue; }
      try { return remember(store, await store.ws('family_planer/pin/change', { old, new: neu })); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_wrong') note = T(ctx).wrong; else if (c === 'pin_locked') note = T(ctx).locked; else if (c === 'pin_bad_pin') note = T(ctx).bad; else throw e;
      }
    }
  }

  async function ensure(store, ctx) {
    const t = cached(store); if (t) return t;
    if (store.snap && store.snap.pin_default) return change(store, ctx);
    let note = '';
    for (;;) {
      const [pin] = await keypad(ctx, [{ title: T(ctx).unlock }], note);
      try { return remember(store, await store.ws('family_planer/pin/unlock', { pin })); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_change_required') return change(store, ctx);
        if (c === 'pin_wrong') note = T(ctx).wrong; else if (c === 'pin_locked') note = T(ctx).locked; else throw e;
      }
    }
  }

  async function call(store, type, data, ctx) {
    for (let i = 0; i < 3; i += 1) {
      const token = await ensure(store, ctx);
      try { return await store.ws(type, { ...(data || {}), token }); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_required') { tokens.delete(store); continue; }
        if (c === 'pin_change_required') { tokens.delete(store); await change(store, ctx); continue; }
        throw e;
      }
    }
    throw new Error('pin');
  }

  window.FPPIN = {
    call, ensure, CANCEL,
    change: (store, ctx) => change(store, ctx, ' '),
    unlocked: (store) => !!cached(store),
    lock: (store) => tokens.delete(store),
    token: (store) => cached(store),
  };
})();

// ---------------------------------------------------------------------------
// Fullscreen on double tap: hides the Home Assistant sidebar and header (and uses real browser fullscreen
// where allowed). Double-tap again to leave. Taps on buttons, chores and inputs never trigger it.
// window.FPKIOSK.attach(element, store)
// ---------------------------------------------------------------------------
(() => {
  if (window.FPKIOSK) return;
  const STYLE_ID = 'fp-kiosk-style';
  let on = false;
  let autoDone = false;

  const roots = () => {
    const out = [];
    try {
      const ha = document.querySelector('home-assistant'); const main = ha && ha.shadowRoot && ha.shadowRoot.querySelector('home-assistant-main');
      const mr = main && main.shadowRoot; if (!mr) return out;
      out.push([mr, 'ha-sidebar{display:none!important} ha-drawer{--mdc-drawer-width:0px!important} :host{--mdc-drawer-width:0px!important}']);
      const drawer = mr.querySelector('ha-drawer'); if (drawer && drawer.shadowRoot) out.push([drawer.shadowRoot, '.mdc-drawer{display:none!important;width:0!important} .mdc-drawer-app-content{margin-left:0!important;margin-inline-start:0!important}']);
      const ppr = mr.querySelector('partial-panel-resolver');
      const lov = ppr && ppr.querySelector('ha-panel-lovelace');
      const root = lov && lov.shadowRoot && lov.shadowRoot.querySelector('hui-root');
      if (root && root.shadowRoot) out.push([root.shadowRoot, '.header,.toolbar,app-header{display:none!important} #view,.view,hui-view-container{padding-top:0!important;min-height:100vh!important} :host{--header-height:0px!important}']);
    } catch (e) { /* layout of Home Assistant changed – real fullscreen still works */ }
    return out;
  };
  const apply = (state) => {
    for (const [root, css] of roots()) {
      let st = root.getElementById ? root.getElementById(STYLE_ID) : root.querySelector('#' + STYLE_ID);
      if (state) { if (!st) { st = document.createElement('style'); st.id = STYLE_ID; root.appendChild(st); } st.textContent = css; } else if (st) st.remove();
    }
    window.dispatchEvent(new Event('resize'));
  };
  const set = (state, gesture) => {
    on = state; apply(on);
    const de = document.documentElement;
    try {
      if (on && gesture && de.requestFullscreen && !document.fullscreenElement) de.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) { /* not allowed (e.g. iOS) – hiding header and sidebar is enough */ }
  };
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && on) { on = false; apply(false); } });
  window.addEventListener('location-changed', () => { if (on) setTimeout(() => apply(true), 300); });

  const INTERACTIVE = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'LABEL', 'HA-ICON-BUTTON', 'HA-SWITCH', 'HA-CHECKBOX']);
  // only elements between the tap target and the planner itself count; data-fp-theme marks hosts, not controls
  const interactive = (path, host) => {
    for (const n of path) {
      if (n === host) return false;
      if (!n || n.nodeType !== 1) continue;
      const keys = Object.keys(n.dataset || {}).filter((k) => k !== 'fpTheme');
      if (INTERACTIVE.has(n.tagName) || n.getAttribute('role') === 'button' || n.hasAttribute('contenteditable') || keys.length) return true;
    }
    return false;
  };

  function attach(el, store) {
    if (el.__fpKiosk) return; el.__fpKiosk = true;
    let last = 0; let lx = 0; let ly = 0;
    const enabled = () => !(store && store.snap && store.snap.settings && store.snap.settings.fullscreen_dblclick === false);
    el.addEventListener('pointerup', (e) => {
      if (e.__fpk || !enabled() || e.button > 0) return; e.__fpk = true;
      if (interactive(e.composedPath(), el)) { last = 0; return; }
      const now = Date.now();
      if (now - last < 350 && Math.abs(e.clientX - lx) < 30 && Math.abs(e.clientY - ly) < 30) { last = 0; set(!on, true); return; }
      last = now; lx = e.clientX; ly = e.clientY;
    });
    const auto = () => { if (!autoDone && store && store.snap && store.snap.settings && store.snap.settings.fullscreen_auto) { autoDone = true; setTimeout(() => set(true, false), 400); } };
    if (store) store.listen(auto);
  }
  window.FPKIOSK = { attach, set, get on() { return on; } };
})();

// ---------------------------------------------------------------------------
// Confetti for celebrations from the server (snapshot.celebrations):
//   day      – somebody finished every chore of the day (small, in the person's colour, with the name)
//   <award>  – a trophy was won (medium/large in the trophy's colour; "banner" = only a short note)
// Every device shows each celebration once (remembered in localStorage); old ones are skipped silently.
// Respects "reduce motion": then only the banner is shown.
// ---------------------------------------------------------------------------
(() => {
  if (window.FPCONFETTI) return;
  const TXT = {
    de: { lvl: '{n} ist jetzt Level {v} – {t}! ⬆️', lvlB: ' +{b} Punkte', unl: ' · Neu: {u}', day: 'Super, {n}! Alle Ämtli erledigt 🎉', team: 'Familien-Teamwork! Alle haben alles erledigt 🤝', won: '{n}: {a}!',
      a: { trophy: 'Pokal des Monats 🏆', crown: 'Krone der Woche 👑', perfect: 'Perfekte Woche ⭐', bee: 'Fleissbiene 🐝', weekend: 'Wochenend-Held 🦸',
        climber: 'Aufsteiger 📈', early: 'Frühaufsteher 🌅', diamond: 'Diamant-Serie 💎', milestone: 'Meilenstein {v} 🏅', team: 'Familien-Teamwork 🤝' } },
    en: { lvl: '{n} is now level {v} – {t}! ⬆️', lvlB: ' +{b} points', unl: ' · New: {u}', day: 'Well done, {n}! Every chore done 🎉', team: 'Family teamwork! Everybody did everything 🤝', won: '{n}: {a}!',
      a: { trophy: 'Trophy of the month 🏆', crown: 'Crown of the week 👑', perfect: 'Perfect week ⭐', bee: 'Busy bee 🐝', weekend: 'Weekend hero 🦸',
        climber: 'Climber 📈', early: 'Early bird 🌅', diamond: 'Diamond streak 💎', milestone: 'Milestone {v} 🏅', team: 'Family teamwork 🤝' } },
  };
  const COUNT = { s: 90, m: 190, l: 340 };
  const MAX_AGE_MIN = 20; // older celebrations (e.g. the tablet was asleep for hours) are not replayed
  const queue = []; let busy = false;
  const fmt = (t, o) => t.replace(/\{(\w)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  // level effects when the level badge is tapped: sparks shooting out of the badge in the tier's colours
  const TIER_COLS = { bronze: ['#CD8A4E', '#E7A46C', '#FFD0A0', '#8A4A22', '#FFE27A'], silver: ['#ffffff', '#C9D1D9', '#A8B1BC', '#E2E6EB'],
    gold: ['#F5C542', '#FFE27A', '#D4A017', '#FFF4B8'], diamond: ['#7FDBFF', '#ffffff', '#B8F0FF', '#4FA3E0'], ruby: ['#E0115F', '#FF4D6D', '#FFB3C1', '#8B0A32', '#FFA34F'] };
  function burst(x, y, tier, color, strength) {
    if (reduce()) return;
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;pointer-events:none';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.width = Math.round(window.innerWidth * dpr); const H = cv.height = Math.round(window.innerHeight * dpr);
    const cols = TIER_COLS[tier] || [color, '#ffffff']; const big = tier === 'diamond' || tier === 'ruby';
    const n = Math.round((big ? 150 : 70) * (strength || 1)); const parts = [];
    // gold: golden rain · diamond: sparkling explosion with a flash · ruby: eruption, flash and the screen shakes
    if (tier === 'gold') rain('s', '#F5C542');
    if (big) { const fl = document.createElement('div'); fl.style.cssText = `position:fixed;inset:0;z-index:99998;pointer-events:none;background:radial-gradient(circle at ${x}px ${y}px,${tier === 'ruby' ? 'rgba(255,40,80,.55)' : 'rgba(200,245,255,.6)'},transparent 60%);transition:opacity .6s`;
      document.body.appendChild(fl); setTimeout(() => { fl.style.opacity = '0'; }, 120); setTimeout(() => fl.remove(), 800); }
    if (tier === 'ruby' && document.body.animate) { document.body.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-4px)' }, { transform: 'translate(-3px,-2px)' }, { transform: 'translate(0,0)' }], { duration: 500, iterations: 2 }); setTimeout(() => rain('m', '#E0115F'), 300); }
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2; const v = (2 + Math.random() * 6) * dpr;
      const sp = big ? 1.7 : 1;
      parts.push({ x: x * dpr, y: y * dpr, vx: Math.cos(a) * v * sp, vy: Math.sin(a) * v * sp - 2.5 * dpr, life: 0, max: 50 + Math.random() * 40, c: cols[i % cols.length], r: (1.2 + Math.random() * 2.4) * dpr * (big ? 1.3 : 1), star: tier === 'diamond' || Math.random() < 0.3 });
    }
    const frame = () => {
      ctx.clearRect(0, 0, W, H); let alive = 0;
      for (const p of parts) {
        if (p.life > p.max) continue; alive += 1; p.life += 1;
        p.x += p.vx; p.y += p.vy; p.vy += 0.16 * dpr; p.vx *= 0.985;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.max); ctx.fillStyle = p.c;
        if (p.star) { ctx.beginPath(); for (let k = 0; k < 8; k += 1) { const rr = k % 2 ? p.r : p.r * 2.4; const aa = k * Math.PI / 4 + p.life * 0.1; ctx.lineTo(p.x + Math.cos(aa) * rr, p.y + Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      }
      if (alive) window.requestAnimationFrame(frame); else cv.remove();
    };
    window.requestAnimationFrame(frame);
  }
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shade = (hex, f) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex || '#F5C542';
    const n = parseInt(m[1], 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)))));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  const RAINBOW = ['#FF5F6D', '#FFA34F', '#FFD84F', '#4FE08A', '#4FA3E0', '#8F6BFF', '#E05FD0'];

  function banner(text, color) {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;left:50%;top:9vh;transform:translate(-50%,-20px);z-index:100000;pointer-events:none;'
      + 'background:rgba(20,20,24,.86);color:#fff;font:600 clamp(18px,3.2vw,30px)/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;'
      + `padding:14px 26px;border-radius:999px;border:2px solid ${color};box-shadow:0 10px 40px rgba(0,0,0,.45),0 0 24px ${color}55;`
      + 'opacity:0;transition:opacity .35s,transform .35s;max-width:90vw;text-align:center;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)';
    el.textContent = text;
    document.body.appendChild(el);
    window.requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)'; });
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translate(-50%,-20px)'; }, 3200);
    setTimeout(() => el.remove(), 3700);
  }

  function rain(size, color, rainbow) {
    return new Promise((resolve) => {
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;pointer-events:none';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cv.width = Math.round(window.innerWidth * dpr); const H = cv.height = Math.round(window.innerHeight * dpr);
      const cols = rainbow ? RAINBOW : [color, shade(color, 0.35), shade(color, -0.25), shade(color, 0.6), '#ffffff'];
      const n = COUNT[size] || COUNT.s; const parts = [];
      for (let i = 0; i < n; i += 1) {
        parts.push({ x: Math.random() * W, y: -Math.random() * H * (size === 'l' ? 0.9 : 0.5) - 10 * dpr, w: (5 + Math.random() * 7) * dpr, h: (8 + Math.random() * 10) * dpr,
          vx: (Math.random() - 0.5) * 2.2 * dpr, vy: (2.2 + Math.random() * 3.2) * dpr, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.24,
          sway: Math.random() * Math.PI * 2, c: cols[i % cols.length], round: Math.random() < 0.25 });
      }
      const t0 = window.performance.now(); const dur = size === 'l' ? 4600 : size === 'm' ? 3800 : 3000;
      const frame = (t) => {
        const el = t - t0; ctx.clearRect(0, 0, W, H);
        const fade = el > dur - 700 ? Math.max(0, (dur - el) / 700) : 1;
        for (const p of parts) {
          p.sway += 0.05; p.x += p.vx + Math.sin(p.sway) * 0.8 * dpr; p.y += p.vy; p.vy += 0.035 * dpr; p.r += p.vr;
          ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
          if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.sway)) + 1);
          ctx.restore();
        }
        if (el < dur) window.requestAnimationFrame(frame); else { cv.remove(); resolve(); }
      };
      window.requestAnimationFrame(frame);
    });
  }

  async function run() {
    if (busy) return; busy = true;
    while (queue.length) {
      const c = queue.shift();
      if (c.fx !== 'banner' && !reduce()) { banner(c.text, c.color); await rain(c.fx, c.color, c.rainbow); }
      else { banner(c.text, c.color); await new Promise((r) => setTimeout(r, 3800)); }
    }
    busy = false;
  }

  const KEY = (store) => `fp_seen_${(store.snap && store.snap.entry_id) || store.entryId || 'x'}`;
  const seenGet = (store) => { try { return new Set(JSON.parse(localStorage.getItem(KEY(store)) || '[]')); } catch (e) { return store._seenMem || (store._seenMem = new Set()); } };
  const seenPut = (store, set) => { const arr = [...set].slice(-120); try { localStorage.setItem(KEY(store), JSON.stringify(arr)); } catch (e) { store._seenMem = new Set(arr); } };

  // called by the bridge after every snapshot
  function check(store) {
    const s = store.snap; if (!s || !Array.isArray(s.celebrations)) return;
    if (s.settings && s.settings.confetti === false) return;
    const seen = seenGet(store); let changed = false;
    const lang = String((s.settings && s.settings.language !== 'auto' && s.settings.language) || document.documentElement.lang || 'de').startsWith('en') ? 'en' : 'de';
    const T = TXT[lang]; const now = Date.now();
    for (const c of s.celebrations) {
      if (!c || !c.id || seen.has(c.id)) continue;
      seen.add(c.id); changed = true;
      const age = (now - Date.parse(c.ts || '')) / 60000;
      if (!(age >= -5 && age <= MAX_AGE_MIN)) continue;
      const person = (s.persons || []).find((p) => p.id === c.pid); const name = person ? person.name : '';
      const lvName = c.kind === 'level' ? (((s.points || {})[c.pid] || {}).level === c.value ? ((s.points || {})[c.pid] || {}).name : '') : '';
      const unl = c.kind === 'level' && (c.unlocks || []).length && window.FPAV ? fmt(T.unl, { u: c.unlocks.map((u) => window.FPAV.label(u, lang)).join(', ') }) : '';
      const text = c.kind === 'level' ? fmt(T.lvl, { n: name, v: c.value, t: lvName }) + (c.bonus ? fmt(T.lvlB, { b: c.bonus }) : '') + unl
        : c.kind === 'day' ? fmt(T.day, { n: name }) : c.kind === 'team' && !c.pid ? T.team
        : fmt(T.won, { n: name, a: fmt(T.a[c.kind] || c.kind, { v: c.value }) });
      if (c.kind === 'team' && c.pid) continue; // the family celebration covers everybody
      queue.push({ fx: c.fx || 's', color: c.color || '#F5C542', text, rainbow: s.theme === 'rainbow' || c.kind === 'team' });
    }
    if (changed) seenPut(store, seen);
    run();
  }

  window.FPCONFETTI = { check, rain, banner, burst };
})();

// ---------------------------------------------------------------------------
// Family Planer integration bridge
// Feeds the dashboard UI from the integration (websocket "family_planer/subscribe")
// and turns UI writes into family_planer/* commands. Cards:
//   type: custom:family-planer-card      view: week | plan | lists   (entry_id, language optional)
//   type: custom:family-planer-nav-card
// ---------------------------------------------------------------------------
(() => {
  const VIRT = { plan: 'family_planer.plan', heute: 'family_planer.heute', verlauf: 'family_planer.verlauf', settings: 'family_planer.settings', script: 'family_planer.rollover' };
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const IMAGE = (i) => (/^(av:[a-z0-9.+]{1,80}|av2:[a-z0-9.]{1,200}|svg:[a-z-]{1,30}|img:\/family_planer_files\/avatars\/[a-z0-9_]{1,120}\.(jpg|png|webp))$/.test(i || '') ? i : '');
  const isVirt = (e) => typeof e === 'string' && e.startsWith('family_planer.');
  const enc = (o) => 'fp1:' + JSON.stringify(o);
  const dec = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };

  class Store {
    constructor(conn, entryId) {
      this.conn = conn; this.entryId = entryId; this.snap = null; this.err = null; this.subs = new Set();
      this._subscribe(0);
    }
    // the integration reloads after some settings changes: subscribe again until it is back
    _subscribe(tries) {
      const msg = { type: 'family_planer/subscribe' }; if (this.entryId) msg.entry_id = this.entryId;
      this.unsub = this.conn.subscribeMessage((s) => {
        if (s && s.reload) { this._resubscribe(); return; }
        this.snap = s; this.err = null; this.subs.forEach((f) => f());
        if (window.FPCONFETTI) window.FPCONFETTI.check(this);
      }, msg).catch((e) => {
        if (tries > 0 && tries < 30) { setTimeout(() => this._subscribe(tries + 1), 2000); return; }
        this.err = (e && e.message) || String(e); this.subs.forEach((f) => f());
      });
    }
    _resubscribe() {
      const old = this.unsub; this.unsub = null;
      Promise.resolve(old).then((u) => { if (typeof u === 'function') u(); }).catch(() => {});
      setTimeout(() => this._subscribe(1), 1500);
    }
    static get(conn, entryId) {
      const reg = Store._reg || (Store._reg = new Map());
      const k = entryId || '';
      let s = reg.get(k);
      if (!s || s.conn !== conn) { s = new Store(conn, entryId); reg.set(k, s); }
      return s;
    }
    listen(f) { this.subs.add(f); if (this.snap || this.err) setTimeout(f, 0); return () => this.subs.delete(f); }
    ws(type, data) { const m = { type, ...data }; if (this.entryId) m.entry_id = this.entryId; return this.conn.sendMessagePromise(m); }
    // changes need the parent PIN since 0.9.0 (asks once, then a 10-minute unlock)
    pws(type, data) {
      const lang = String((this.snap && this.snap.settings && this.snap.settings.language) || document.documentElement.lang || 'de').startsWith('en') ? 'en' : 'de';
      return window.FPPIN ? window.FPPIN.call(this, type, data, { lang, host: document.querySelector('home-assistant') || document.body }) : this.ws(type, data);
    }
    person(id) { return ((this.snap && this.snap.persons) || []).find((p) => p.id === id); }
    personByName(n) { return ((this.snap && this.snap.persons) || []).find((p) => p.name === n); }

    // ---------- snapshot -> legacy todo items
    items(kind) {
      const s = this.snap; if (!s) return [];
      const name = (pid) => (this.person(pid) || {}).name || pid;
      if (kind === 'plan') return s.chores.filter((c) => !c.schedule).map((c) => ({ uid: c.id, summary: c.title, status: 'needs_action', description: enc({ ...this.toLegacy(c.assign), ...(typeof c.points === 'number' ? { p: c.points } : {}) }) }));
      if (kind === 'heute') return s.items.map((i) => ({ uid: i.id, summary: i.title, status: i.done ? 'completed' : 'needs_action', description: enc({ k: name(i.person_id), d: i.start, e: i.due, c: i.chore_id }) }));
      if (kind === 'verlauf') return Object.entries(s.history).map(([day, per]) => ({ uid: day, summary: day, status: 'completed',
        description: enc({ s: Object.entries(per).map(([pid, r]) => [name(pid), r.done, r.total]), x: Object.entries(per).flatMap(([pid, r]) => (r.missed || []).map((t) => [name(pid), t])) }) }));
      if (kind === 'settings') return [{ uid: 'personen', summary: 'Personen', status: 'needs_action',
        description: enc({ p: Object.fromEntries(s.persons.map((p) => [p.name, { farbe: COLOR(p.color), bild: IMAGE(p.image), alias: p.aliases || [] }])) }) }];
      return [];
    }
    toLegacy(assign) {
      const z = {}, r = {}, f = {};
      for (const [pid, days] of Object.entries(assign || {})) {
        const n = (this.person(pid) || {}).name; if (!n) continue;
        z[n] = Object.keys(days).map(Number).sort((a, b) => a - b);
        for (const [d, rule] of Object.entries(days)) {
          if (rule.every > 1) r[`${n}|${d}`] = [rule.every, rule.offset || 0];
          if (rule.window > 1) f[`${n}|${d}`] = rule.window;
        }
      }
      const o = { z }; if (Object.keys(r).length) o.r = r; if (Object.keys(f).length) o.f = f; return o;
    }
    fromLegacy(m) {
      const assign = {}; const z = (m && m.z) || (m && m.k ? { [m.k]: m.t || [] } : {});
      for (const [n, days] of Object.entries(z)) {
        const p = this.personByName(n); if (!p) continue;
        const a = assign[p.id] = {};
        for (const d of days) {
          const rr = (m.r || {})[`${n}|${d}`]; const every = rr && rr[0] > 1 ? rr[0] : 1;
          a[String(d)] = { every, offset: every > 1 ? ((rr[1] % every) + every) % every : 0, window: Math.max(1, Math.min(14, (m.f || {})[`${n}|${d}`] || 1)) };
        }
      }
      return assign;
    }

    // ---------- legacy writes -> integration commands
    async todo(kind, service, data) {
      if (kind === 'heute' && service === 'update_item') return this.ws('family_planer/item/set', { item_id: data.item, done: data.status === 'completed' });
      if (kind === 'plan') {
        if (service === 'add_item') return this.pws('family_planer/chore/save', { title: data.item, assign: this.fromLegacy(dec(data.description)) });
        if (service === 'update_item') {
          const c = this.snap.chores.find((x) => x.id === data.item); if (!c) throw new Error('Ämtli nicht gefunden');
          const msg = { chore_id: c.id, title: data.rename || c.title, assign: data.description ? this.fromLegacy(dec(data.description)) : c.assign };
          const pts = 'points' in data ? data.points : c.points;
          if (typeof pts === 'number') msg.points = pts;
          return this.pws('family_planer/chore/save', msg);
        }
        if (service === 'remove_item') return [].concat(data.item).reduce((pr, id) => pr.then(() => this.pws('family_planer/chore/delete', { chore_id: id })), Promise.resolve());
      }
      if (kind === 'settings' && (service === 'add_item' || service === 'update_item')) {
        const p = dec(data.description).p || {};
        return Promise.all(Object.entries(p).map(([n, o]) => {
          const per = this.personByName(n); if (!per) return null;
          const patch = { person_id: per.id };
          if (/^#[0-9A-Fa-f]{6}$/.test(o.farbe || '')) patch.color = o.farbe;
          if (typeof o.bild === 'string') patch.image = o.bild;
          if (Array.isArray(o.alias)) patch.aliases = o.alias;
          return Object.keys(patch).every((k) => k === 'person_id' || k === 'image') ? this.ws('family_planer/person/update', patch) : this.pws('family_planer/person/update', patch);
        }));
      }
      return null;
    }
  }

  // hass object handed to the inner UI: real hass + virtual todo entities
  const wrapHass = (hass, store) => {
    const real = hass.connection;
    const conn = Object.create(real, {
      subscribeMessage: { value: (cb, msg) => {
        if (msg && msg.type === 'todo/item/subscribe' && isVirt(msg.entity_id)) {
          const kind = Object.keys(VIRT).find((k) => VIRT[k] === msg.entity_id);
          const off = store.listen(() => { if (store.err) return; cb({ items: store.items(kind) }); });
          return store.err ? Promise.reject(new Error(store.err)) : Promise.resolve(off);
        }
        return real.subscribeMessage(cb, msg);
      } },
    });
    return Object.create(hass, {
      connection: { value: conn },
      fpUpload: { value: (name, data) => { const p = store.personByName(name); if (!p) return Promise.reject(new Error(name)); return store.ws('family_planer/person/upload_image', { person_id: p.id, data }); } },
      callService: { value: (domain, service, data, target) => {
        const ent = target && target.entity_id;
        if (domain === 'todo' && isVirt(ent)) return store.todo(Object.keys(VIRT).find((k) => VIRT[k] === ent), service, data || {});
        if (domain === 'script' && ent === VIRT.script) return store.ws('family_planer/rollover', {});
        return hass.callService(domain, service, data, target);
      } },
    });
  };

  // card option `language` > integration setting (Design & sidebar) > profile / HA language
  const LANG = (hass, cfg, store) => {
    const fixed = store && store.snap && store.snap.settings && store.snap.settings.language;
    const l = String((cfg && cfg.language) || (fixed === 'de' || fixed === 'en' ? fixed : '') ||
      (hass && ((hass.locale && hass.locale.language) || hass.language)) || 'de').toLowerCase();
    return l.startsWith('de') || l.startsWith('gsw') ? 'de' : 'en';
  };
  const INNER = { week: 'fp-week-inner', plan: 'fp-plan-inner', lists: 'fp-lists-inner', rewards: 'fp-rewards-inner', settings: 'fp-settings-inner' };
  const STORE_VIEWS = ['lists', 'rewards', 'settings'];
  const tag = (view, lang) => (!STORE_VIEWS.includes(view) && lang === 'en' ? INNER[view] + '-en' : INNER[view]);
  // designs: CSS variables read by every card (inherited through the shadow roots)
  const SYS = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const STARS = 'radial-gradient(1.2px 1.2px at 12% 18%,#fff 60%,transparent),radial-gradient(1px 1px at 72% 12%,#cfd6ff 60%,transparent),radial-gradient(1.4px 1.4px at 42% 64%,#fff 60%,transparent),radial-gradient(1px 1px at 86% 72%,#fff 60%,transparent),radial-gradient(1px 1px at 22% 82%,#bfc8ff 60%,transparent),radial-gradient(1.2px 1.2px at 58% 34%,#fff 60%,transparent),radial-gradient(1px 1px at 92% 38%,#e6e9ff 60%,transparent),radial-gradient(1px 1px at 6% 52%,#fff 60%,transparent)';
  const RAINBOW = 'linear-gradient(90deg,#FF5F6D,#FFA34F,#FFD84F,#4FE08A,#4FA3E0,#8F6BFF,#E05FD0)';
  // designs: CSS variables read by every card (inherited through the shadow roots); page = background behind the cards
  const THEMES = {
    ha: { bg0: 'var(--primary-background-color,#111)', bg1: 'var(--ha-card-background,var(--card-background-color,#1c1c1c))', bg2: 'var(--secondary-background-color,#202020)',
      bg3: 'color-mix(in srgb,var(--primary-text-color,#fff) 6%,var(--card-background-color,#1c1c1c))', bg4: 'color-mix(in srgb,var(--primary-text-color,#fff) 11%,var(--card-background-color,#1c1c1c))',
      line: 'var(--divider-color,#333)', text: 'var(--primary-text-color,#eee)', text2: 'var(--secondary-text-color,#aaa)', text3: 'var(--disabled-text-color,#777)',
      accent: 'var(--primary-color,#03a9f4)', 'on-accent': 'var(--text-primary-color,#fff)', radius: 'var(--ha-card-border-radius,12px)', font: 'var(--ha-font-family-body,Roboto,sans-serif)',
      grad: 'var(--primary-color,#03a9f4)', page: 'var(--lovelace-background,var(--primary-background-color,#111))', glow: 'none' },
    light: { bg0: '#eef1f6', bg1: '#ffffff', bg2: '#f6f8fb', bg3: '#eef2f7', bg4: '#e2e8f0', line: '#dbe2ea', text: '#18202b', text2: '#4f5b6a', text3: '#8a95a5',
      accent: '#2F6FED', 'on-accent': '#ffffff', radius: '18px', font: SYS, grad: 'linear-gradient(90deg,#2F6FED,#21B5C9)',
      page: 'radial-gradient(900px 500px at 0% 0%,#dfe9ff 0%,transparent 60%),radial-gradient(900px 500px at 100% 100%,#dff7f2 0%,transparent 60%),#eef1f6', glow: '0 1px 2px rgba(16,24,40,.06),0 4px 14px rgba(16,24,40,.06)' },
    dark: { bg0: '#0f1115', bg1: '#171a20', bg2: '#1c2027', bg3: '#232831', bg4: '#2c323d', line: '#2f3541', text: '#eef1f5', text2: '#a9b1bd', text3: '#6f7886',
      accent: '#69C350', 'on-accent': '#0f1115', radius: '16px', font: SYS, grad: 'linear-gradient(90deg,#69C350,#3FBF9B)',
      page: 'radial-gradient(1200px 600px at 10% -10%,#1d2531 0%,transparent 60%),radial-gradient(900px 500px at 110% 110%,#16241c 0%,transparent 55%),#0f1115', glow: '0 6px 20px rgba(0,0,0,.35)' },
    rainbow: { bg0: '#121018', bg1: '#1a1722', bg2: '#201c2a', bg3: '#272233', bg4: '#30293e', line: '#3b3350', text: '#f6f3fb', text2: '#bcb3cc', text3: '#82799a',
      accent: '#FF6FAE', 'on-accent': '#1a0f18', radius: '20px', font: SYS, grad: RAINBOW, band: RAINBOW,
      page: 'radial-gradient(700px 420px at 0% 0%,rgba(255,95,109,.22),transparent 60%),radial-gradient(700px 420px at 100% 10%,rgba(79,163,224,.22),transparent 60%),radial-gradient(800px 500px at 50% 110%,rgba(143,107,255,.25),transparent 60%),#121018', glow: '0 8px 28px rgba(255,111,174,.12)' },
    space: { bg0: '#0a0c1d', bg1: '#11142b', bg2: '#161a36', bg3: '#1c2142', bg4: '#252b52', line: '#2b3263', text: '#eef0ff', text2: '#aab1d8', text3: '#6e76a6',
      accent: '#7C9CFF', 'on-accent': '#0a0c1d', radius: '18px', font: SYS, grad: 'linear-gradient(90deg,#7C9CFF,#B07CFF,#5CE1E6)',
      page: STARS + ',radial-gradient(900px 600px at 80% -10%,rgba(124,92,255,.35),transparent 60%),radial-gradient(800px 600px at -10% 110%,rgba(92,225,230,.18),transparent 60%),linear-gradient(180deg,#0a0c1d,#140f2e)', glow: '0 0 0 1px rgba(124,156,255,.08),0 10px 30px rgba(8,10,30,.5)' },
  };
  const THEME_ALIAS = { loxone: 'dark', apple: 'dark', google: 'dark', nord: 'dark' };
  const themeName = (n) => (THEMES[n] ? n : THEMES[THEME_ALIAS[n]] ? THEME_ALIAS[n] : 'ha');
  const STYLES = ['standard', 'transparent', 'glass'];
  const THEME_NAMES = { ha: { de: 'Standard', en: 'Standard' }, light: { de: 'Hell', en: 'Light' }, dark: { de: 'Dunkel', en: 'Dark' },
    rainbow: { de: 'Regenbogen', en: 'Rainbow' }, space: { de: 'Weltall', en: 'Space' } };
  const STYLE_NAMES = { standard: { de: 'Standard', en: 'Standard' }, transparent: { de: 'Transparent', en: 'Transparent' }, glass: { de: 'Glas', en: 'Glass' } };
  // surfaces of a design in a style: transparent = see-through, glass = see-through + frosted blur + light edge
  const surfaces = (t, style) => {
    if (style === 'transparent' || style === 'glass') {
      const a = style === 'glass' ? 52 : 68;
      const mix = (c, k) => `color-mix(in srgb,${c} ${k}%,transparent)`;
      return { bg1: mix(t.bg1, a), bg2: mix(t.bg2, a + 6), bg3: mix(t.bg3, a + 10), bg4: mix(t.bg4, a + 14),
        line: style === 'glass' ? `color-mix(in srgb,${t.text} 16%,transparent)` : t.line,
        blur: style === 'glass' ? 'blur(18px) saturate(160%)' : 'none' };
    }
    return { bg1: t.bg1, bg2: t.bg2, bg3: t.bg3, bg4: t.bg4, line: t.line, blur: 'none' };
  };
  // miniature of the planner in a design and style: page, top bar, a person column and chore tiles (one ticked off)
  const themeMini = (name, style) => {
    const t = THEMES[themeName(name)]; const f = surfaces(t, style || 'standard'); const r = `calc(${t.radius} / 3)`;
    const tile = (on) => `<i style="display:block;height:9px;border-radius:3px;background:${on ? t.accent : f.bg4};border:1px solid ${f.line}"></i>`;
    return `<span class="mini" style="background:${t.page};border-radius:${r}">
      <span style="display:flex;gap:4px;align-items:center;background:${f.bg1};border:1px solid ${f.line};border-radius:5px;padding:3px 5px;backdrop-filter:${f.blur}">
        <b style="width:18px;height:4px;border-radius:2px;background:${t.text3}"></b><b style="margin-left:auto;width:14px;height:6px;border-radius:3px;background:${t.grad}"></b><b style="width:14px;height:6px;border-radius:3px;background:${f.bg3}"></b></span>
      <span style="display:grid;grid-template-columns:14px 1fr 1fr;gap:4px;margin-top:4px;background:${f.bg1};border:1px solid ${f.line};border-radius:5px;padding:4px;backdrop-filter:${f.blur}">
        <b style="width:12px;height:12px;border-radius:50%;background:${t.accent};opacity:.85"></b>${tile(true)}${tile(false)}
        <b style="width:12px;height:12px;border-radius:50%;background:${t.text2};opacity:.6"></b>${tile(false)}${tile(true)}</span></span>`;
  };
  const themeSwatch = (name) => { const t = THEMES[themeName(name)];
    return `<span class="sw" style="background:${t.bg1};border-color:${t.line}"><i style="background:${t.grad}"></i><i style="background:${t.bg4}"></i><i style="background:${t.text2}"></i></span>`; };
  const applyTheme = (el, name, style) => {
    const n = themeName(name); const t = THEMES[n]; const st = STYLES.includes(style) ? style : 'standard'; const f = surfaces(t, st);
    Object.entries({ band: 'none', ...t, pop: t.bg1, ...f }).forEach(([k, v]) => el.style.setProperty(`--fp-${k}`, v));
    el.dataset.fpTheme = n; el.dataset.fpStyle = st;
    // the page background is also offered globally, so a dashboard view can use background: var(--fp-page)
    document.documentElement.style.setProperty('--fp-page', t.page);
  };
  const MSG = { de: { off: 'Das Modul „{m}“ ist ausgeschaltet. Einschalten unter Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Module.', week: 'Wochenplan', lists: 'Smarte Listen' },
    en: { off: 'The module "{m}" is switched off. Switch it on under Settings → Devices & services → Family Planer → Configure → Modules.', week: 'Week plan', lists: 'Smart lists' } };

  class FamilyPlanerCard extends HTMLElement {
    static getStubConfig() { return { view: 'week' }; }
    setConfig(c) {
      this._cfg = { view: 'week', ...(c || {}) };
      if (!INNER[this._cfg.view]) throw new Error('view: week | plan | lists | rewards | settings');
      this._sig = null; this._inner = null; this.innerHTML = ''; this._attach();
    }
    set hass(h) { this._hass = h; this._attach(); if (this._inner && this._wrapped) this._inner.hass = STORE_VIEWS.includes(this._cfg.view) ? h : this._wrap(); }
    // to-do window of the planer (opened from the button in the top bar of the week view)
    _todoWin(lang) {
      if (!this._win || this._win.parentNode !== this) {
        const win = document.createElement('div');
        win.style.cssText = 'position:fixed;inset:0;z-index:20;display:none;align-items:flex-start;justify-content:center;background:rgba(10,10,10,.72);padding:6vh 3vw;overflow:auto;box-sizing:border-box';
        const box = document.createElement('div'); box.style.cssText = 'position:relative;width:min(1000px,100%)';
        const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕';
        x.setAttribute('aria-label', lang === 'en' ? 'Close' : 'Schliessen');
        x.style.cssText = 'position:absolute;right:10px;top:22px;z-index:5;width:40px;height:40px;border-radius:20px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font-size:18px;cursor:pointer';
        x.addEventListener('click', () => this._showTodos(false));
        win.addEventListener('click', (e) => { if (e.target === win) this._showTodos(false); });
        box.appendChild(x); win.appendChild(box); this.appendChild(win);
        this._win = win; this._winBox = box;
      }
      if (!this._todoEv) {
        this._todoEv = true;
        this.addEventListener('fp-open-todos', (e) => this._showTodos(true, e.detail && e.detail.add));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._win && this._win.style.display !== 'none') this._showTodos(false); });
      }
      return this._winBox;
    }
    // "+ Special chore" / "+ To-do" of the chore plan: the form opens in a window of its own
    _addDialog(kind, lang) {
      if (kind !== 'special' && kind !== 'todo') return;
      const ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;background:rgba(10,10,10,.72);padding:6vh 3vw;overflow:auto;box-sizing:border-box';
      const box = document.createElement('div'); box.style.cssText = 'position:relative;width:min(760px,100%)';
      const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', lang === 'en' ? 'Close' : 'Schliessen');
      x.style.cssText = 'position:absolute;right:10px;top:12px;z-index:5;width:40px;height:40px;border-radius:20px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font-size:18px;cursor:pointer';
      const el = document.createElement(kind === 'special' ? 'fp-special-inner' : 'fp-todos-inner'); el.store = this._store; el.setConfig({ lang, dialog: true });
      const close = () => { ov.remove(); document.removeEventListener('keydown', esc); };
      const esc = (e) => { if (e.key === 'Escape') close(); };
      x.addEventListener('click', close); ov.addEventListener('click', (e) => { if (e.target === ov) close(); }); el.addEventListener('fp-dialog-close', close);
      document.addEventListener('keydown', esc);
      box.append(x, el); ov.appendChild(box); document.body.appendChild(ov);  // on body: a glass card above must not clip it
      const sn = this._store.snap; if (sn) applyTheme(ov, this._cfg.theme || sn.theme, this._cfg.style || sn.style);
      if (kind === 'special') el.openAdd(); else setTimeout(() => el.focusAdd && el.focusAdd(), 50);
    }
    _showTodos(on, add) { if (this._win) this._win.style.display = on ? 'flex' : 'none'; if (on && this._todos) { this._todos.update(); if (add && this._todos.focusAdd) setTimeout(() => this._todos.focusAdd(), 50); } }
    getCardSize() { return this._cfg && this._cfg.view === 'plan' ? 10 : 12; }
    getGridOptions() { return { columns: 'full', min_rows: 6 }; }
    connectedCallback() { this._attach(); }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; } }
    _wrap() { if (!this._wrapped || this._wrappedFor !== this._hass) { this._wrapped = wrapHass(this._hass, this._store); this._wrappedFor = this._hass; } return this._wrapped; }
    _attach() {
      if (!this._hass || !this._cfg || !this.isConnected || this._off) return;
      this._store = Store.get(this._hass.connection, this._cfg.entry_id);
      this._off = this._store.listen(() => this._sync());
      if (window.FPKIOSK) window.FPKIOSK.attach(this, this._store);
    }
    _sync() {
      const s = this._store.snap;
      if (!s) { if (this._store.err) this.innerHTML = `<ha-card style="padding:16px">Family Planer: ${this._store.err}</ha-card>`; return; }
      const lang = LANG(this._hass, this._cfg, this._store); const view = this._cfg.view;
      const mod = view === 'lists' ? 'lists' : view === 'settings' ? null : 'week';
      applyTheme(this, this._cfg.theme || s.theme, this._cfg.style || s.style);
      if (mod && s.modules && s.modules[mod] === false) {
        this._inner = null; this._sig = 'off';
        this.innerHTML = `<ha-card style="padding:20px;color:#bbb;background:#1e1e1e">${MSG[lang].off.replace('{m}', MSG[lang][mod])}</ha-card>`; return;
      }
      window.FP_DAY_OFFSET_MIN = s.day_offset_min || 0;
      if (STORE_VIEWS.includes(view)) {
        if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._inner = document.createElement(INNER[view]); this._inner.store = this._store; this._inner.setConfig({ lang }); this.appendChild(this._inner); this._inner.hass = this._hass; this._wrapped = true; }
        else this._inner.update();
        return;
      }
      const st = s.settings || {};
      const kinder = s.persons.map((p) => ({ name: p.name, farbe: COLOR(p.color), ...(IMAGE(p.image) ? { bild: IMAGE(p.image) } : {}), alias: p.aliases || [] }));
      const schoolName = lang === 'en' ? 'School' : 'Schule';
      const kalender = s.persons.filter((p) => p.calendar).map((p) => ({ entity: p.calendar, person: p.name }))
        .concat(s.persons.filter((p) => p.school && p.school.calendar).map((p) => ({ entity: p.school.calendar, person: p.name, schule: true, name: schoolName })))
        .concat((this._cfg.kalender || []).map((k) => (typeof k === 'string' ? { entity: k } : k)));
      const roll = st.rollover_time && st.rollover_time !== '00:00' ? st.rollover_time : '24:00';
      const cfg = { ...this._cfg, punkte_standard: (s.gamification || {}).default_points, titel: this._cfg.titel || (view === 'plan' ? (lang === 'en' ? 'Chore plan' : 'Ämtliplan') : s.title), kinder, kalender,
        schule: Object.fromEntries(s.persons.filter((p) => p.school && (p.school.calendar || Object.keys(p.school.times || {}).length))
          .map((p) => [p.name, { zeiten: p.school.times || {}, weg: p.school.travel || 0 }])),
        abwesend: Object.fromEntries(s.persons.map((p) => [p.name, (s.away || {})[p.id] || []])),
        tage_zuverlaessigkeit: st.reliability_days || 30, schulpause: st.school_gap || 0, ruhe_sekunden: st.idle_seconds || 45,
        schulfenster: st.school_window == null ? 60 : st.school_window,
        fair: ((s.gamification || {}).mode || 'fair') === 'fair',
        todos_knopf: view === 'week', todos_offen: (s.todos || []).filter((t) => !t.done).length,
        termine_nach_namen: st.match_names !== false, auch_beim_besitzer: !!st.show_owner, tageswechsel: roll,
        plan: VIRT.plan, heute: VIRT.heute, verlauf: VIRT.verlauf, einstellungen: VIRT.settings, script: VIRT.script };
      const sig = JSON.stringify([lang, cfg.fair, cfg.schulfenster, cfg.todos_offen, cfg.tage_zuverlaessigkeit, cfg.schulpause, cfg.ruhe_sekunden, cfg.schule, cfg.abwesend, cfg.punkte_standard, cfg.titel, kinder.map((k) => [k.name, k.farbe]), kalender, cfg.termine_nach_namen, cfg.auch_beim_besitzer, roll]);
      if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._special = null; this._todos = null; this._inner = document.createElement(tag(view, lang)); this.appendChild(this._inner); this._sig = null; }
      this._inner.fpStore = this._store;
      if (sig !== this._sig) { this._sig = sig; this._inner.setConfig(cfg); this._inner.hass = this._wrap(); }
      // planner: to-dos open in their own window (button in the top bar); chore plan: below the plan
      const host = view === 'week' ? this._todoWin(lang) : this;
      if (!this._todos || this._todos.parentNode !== host) { if (this._todos) this._todos.remove(); this._todos = document.createElement('fp-todos-inner'); this._todos.store = this._store; this._todos.setConfig({ lang }); host.appendChild(this._todos); }
      else this._todos.update();
      if (view === 'plan') {
        if (!this._planEv) { this._planEv = true; this.addEventListener('fp-plan-add', (e) => this._addDialog(e.detail && e.detail.kind, lang)); }
        if (!this._special || this._special.parentNode !== this) { this._special = document.createElement('fp-special-inner'); this._special.store = this._store; this._special.setConfig({ lang }); this.insertBefore(this._special, this._todos); }
        else this._special.update();
      }
    }
  }
  if (!customElements.get('family-planer-card')) customElements.define('family-planer-card', FamilyPlanerCard);

  // Navigation bar: one button per active module view, same place on every page (also in kiosk mode)
  const NAV = { de: { planer: 'Planer', listen: 'Listen', aemtliplan: 'Ämtliplan', belohnungen: 'Belohnungen', einstellungen: 'Einstellungen' }, en: { planer: 'Planner', listen: 'Lists', aemtliplan: 'Chore plan', belohnungen: 'Rewards', einstellungen: 'Settings' } };
  const NAV_ICON = { planer: 'mdi:calendar-week', listen: 'mdi:cart-outline', aemtliplan: 'mdi:clipboard-text-clock-outline', belohnungen: 'mdi:trophy-outline', einstellungen: 'mdi:cog-outline' };
  const NAV_MOD = { planer: 'week', listen: 'lists', aemtliplan: 'week', belohnungen: 'week', einstellungen: null };
  const NAV_VIEW = { planer: 'week', listen: 'lists', aemtliplan: 'plan', belohnungen: 'rewards', einstellungen: 'settings' };
  const NAV_T = {
    de: { wd: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], mon: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      design: 'Design', style: 'Stil', err: 'Konnte nicht gespeichert werden.', vac: 'Ferien prüfen', vacHint: 'In den nächsten zwei Wochen stehen Ferien im Kalender. Für wen gelten sie, und seid ihr weg oder hier?',
      away: 'Weg – Ämtli pausieren', home: 'Hier – Ämtli laufen weiter', close: 'Schliessen', open: 'offen', all: 'alle', fam: 'Ganze Familie', opt: 'Optional – lange Termine', optHint: 'Keine Ferien-Wörter, aber länger als die eingestellte Stundenzahl. Ohne Entscheid laufen die Ämtli weiter.',
      miss: 'Ansicht „{p}“ fehlt in diesem Dashboard. Ansicht mit diesem Pfad anlegen oder in der Navigationskarte unter paths: anpassen.' },
    en: { wd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], mon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      design: 'Design', style: 'Style', err: 'Could not be saved.', vac: 'Check holidays', vacHint: 'Your calendar has holidays in the next two weeks. Who do they apply to, and are you away or here?',
      away: 'Away – pause chores', home: 'Here – chores go on', close: 'Close', open: 'open', all: 'all', fam: 'Whole family', opt: 'Optional – long events', optHint: 'No holiday words, but longer than the set number of hours. Without a decision chores go on.',
      miss: 'View "{p}" is missing in this dashboard. Add a view with this path or change it under paths: in the navigation card.' } };
  const NAV_POPCSS = `
        button{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid var(--fp-line);background:var(--fp-bg3);color:var(--fp-text2);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        button ha-icon{--mdc-icon-size:20px}button.on{border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:var(--fp-accent)}
        .sw{display:flex;gap:3px;align-items:center;padding:4px 5px;border:1px solid;border-radius:7px}.sw i{display:block;width:8px;height:16px;border-radius:3px}
        .vs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.vs button{height:32px;padding:0 12px;border-radius:16px;font-size:12px}
        .oh{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1px;margin:14px 2px 4px}.oh2{font-size:12px;color:var(--fp-text3);margin:0 2px 8px}
        .pop{width:min(620px,calc(100vw - 16px));box-sizing:border-box;max-height:calc(100vh - 90px);overflow:auto;background:var(--fp-pop,var(--fp-bg1));color:var(--fp-text);font-family:var(--fp-font);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);box-shadow:0 14px 40px rgba(0,0,0,.45);padding:14px;-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none)}
        .ph{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1px;margin:2px 2px 10px;display:flex;align-items:center;gap:6px}.ph .x{margin-left:auto;height:30px;padding:0 10px}
        .tg{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .tg button,.sg button{height:auto;flex-direction:column;align-items:stretch;padding:7px;gap:6px;border-radius:12px;font-size:12px;color:var(--fp-text)}
        .tg button.on,.sg button.on{border-width:2px}
        .tn{display:flex;align-items:center;justify-content:center;gap:4px}.tn ha-icon{--mdc-icon-size:14px}
        .mini{display:block;padding:5px;box-sizing:border-box}.mini b{display:block}
        .vl{display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}.vi{border:1px solid var(--fp-line);border-radius:12px;padding:10px 12px;background:var(--fp-bg2)}
        .vt{font-weight:600}.vd{font-size:12px;color:var(--fp-text3);margin:2px 0 8px}.vb{display:flex;gap:8px;flex-wrap:wrap}.vb button{height:36px;font-size:13px}
        .vb button.on.away{background:rgba(79,163,224,.18);border-color:#4FA3E0;color:#4FA3E0}.vb button.on.home{background:color-mix(in srgb,var(--fp-accent) 18%,transparent)}
        .hint{font-size:13px;color:var(--fp-text2);margin:0 2px 10px}
`;
  const escN = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  class FamilyPlanerNavCard extends HTMLElement {
    setConfig(c) {
      this._cfg = { ...(c || {}) };
      // paths of the dashboard views, e.g. { planer: 'planer', listen: 'einkauf', aemtliplan: 'aemtliplan' }
      this._paths = { planer: 'planer', listen: 'listen', aemtliplan: 'aemtliplan', belohnungen: 'belohnungen', einstellungen: 'einstellungen', ...(this._cfg.paths || this._cfg.pfade || {}) };
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this._onClick = (e) => {
          if (e.target.closest('[data-menu]')) { this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true })); return; }
          const b = e.target.closest('[data-go]');
          if (b && this._views && !this._views.has(b.dataset.go)) { this._flash(NAV_T[this._lang()].miss.replace('{p}', b.dataset.go)); return; }
          if (b && window.FPX) { window.FPX.fpNavigate(b.dataset.go); return; }
          if (e.target.closest('[data-themes]')) { this._open = this._open === 'theme' ? null : 'theme'; this._render(); return; }
          if (e.target.closest('[data-vac]')) { this._open = this._open === 'vac' ? null : 'vac'; this._render(); return; }
          if (e.target.closest('[data-x]')) { this._open = null; this._render(); return; }
          const th = e.target.closest('[data-theme]'); if (th) { this._save({ theme: th.dataset.theme }); return; }
          const sy = e.target.closest('[data-style]'); if (sy) { this._save({ style: sy.dataset.style }); return; }
          const vf = e.target.closest('[data-vfam]'); if (vf) { const c = this._vacChoice(vf.dataset.key); c.family = !c.family; this._render(); return; }
          const vp = e.target.closest('[data-vper]'); if (vp) { const c = this._vacChoice(vp.dataset.key); c.family = false; const i = c.persons.indexOf(vp.dataset.vper); if (i >= 0) c.persons.splice(i, 1); else c.persons.push(vp.dataset.vper); this._render(); return; }
          const vd = e.target.closest('[data-decide]'); if (vd) this._decide(vd.dataset.key, vd.dataset.decide);
        };
        this.shadowRoot.addEventListener('click', this._onClick);
        // a tap outside a popup closes it
        this._outside = (e) => { const path = e.composedPath(); if (this.isConnected && this._open && !path.includes(this) && !path.includes(this._layer)) { this._open = null; this._render(); } };
        window.addEventListener('pointerdown', this._outside, true);
        window.addEventListener('location-changed', () => this._render());
        this._tick = setInterval(() => this._clock(), 15000);
      }
      this._render();
    }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) { this._store = Store.get(h.connection, this._cfg.entry_id); this._off = this._store.listen(() => this._render()); this._loadViews(); } }
    // reads the dashboard's view paths once, so a button whose view is missing shows a hint instead of an empty page
    async _loadViews() {
      try {
        const dash = location.pathname.split('/').filter(Boolean)[0];
        const cfg = await this._hass.connection.sendMessagePromise({ type: 'lovelace/config', url_path: dash && dash !== 'lovelace' ? dash : null });
        if (!cfg || !Array.isArray(cfg.views)) return;
        this._views = new Set(cfg.views.map((v, i) => String(v.path != null ? v.path : i)));
        this._render();
      } catch (e) { this._views = null; }
    }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; this._hass = null; } if (this._layer) { this._layer.remove(); this._layer = null; } }
    getCardSize() { return 1; }
    // who a holiday applies to, as picked in the popup (default: the persons found in the calendar)
    _vacChoice(key) {
      this._vc = this._vc || {}; if (this._vc[key]) return this._vc[key];
      const v = (((this._store && this._store.snap) || {}).vacation_review || []).find((x) => x.key === key) || {};
      this._vc[key] = { family: !!v.family, persons: [...((v.chosen && v.chosen.length ? v.chosen : v.persons) || [])] }; return this._vc[key];
    }
    // popups live in their own layer on top of the page, so cards below (glass style, own stacking) can never cover them
    _popLayer(html, css) {
      if (!html) { if (this._layer) this._layer.style.display = 'none'; return; }
      if (!this._layer) {
        this._layer = document.createElement('div'); this._layer.attachShadow({ mode: 'open' });
        this._layer.shadowRoot.addEventListener('click', (e) => this._onClick(e));
        document.body.appendChild(this._layer);
      }
      const bar = this.shadowRoot.querySelector('.bar'); const r = bar ? bar.getBoundingClientRect() : { bottom: 60, right: window.innerWidth - 8 };
      this._layer.style.cssText = `display:block;position:fixed;z-index:9999;top:${Math.round(r.bottom + 6)}px;right:${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
      const s = this._store && this._store.snap; if (s) applyTheme(this._layer, this._cfg.theme || s.theme, this._cfg.style || s.style);
      this._layer.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
    }
    getGridOptions() { return { columns: 'full', rows: 1 }; }
    _lang() { return LANG(this._hass, this._cfg, this._store); }
    _flash(msg) { this._err = msg; clearTimeout(this._et); this._et = setTimeout(() => { this._err = ''; this._render(); }, 3500); this._render(); }
    async _save(data) {
      const s = this._store && this._store.snap; if (!s || !window.FPPIN) return;
      if ((data.theme && data.theme === s.theme) || (data.style && data.style === s.style)) return;
      try { await window.FPPIN.call(this._store, 'family_planer/theme/set', data, { lang: this._lang(), host: this }); }
      catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(NAV_T[this._lang()].err); }
    }
    async _decide(key, decision) {
      const c = this._vacChoice(key);
      try { await window.FPPIN.call(this._store, 'family_planer/vacation/decide', { key, decision, family: !!c.family, persons: c.family ? [] : c.persons }, { lang: this._lang(), host: this }); delete this._vc[key]; }
      catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(NAV_T[this._lang()].err); }
    }
    _clock() {
      const el = this.shadowRoot && this.shadowRoot.querySelector('.clk'); if (!el) return;
      const T = NAV_T[this._lang()]; const n = new Date(); const p2 = (x) => String(x).padStart(2, '0');
      el.querySelector('b').textContent = `${p2(n.getHours())}:${p2(n.getMinutes())}`;
      el.querySelector('span').textContent = `${T.wd[n.getDay()]}, ${n.getDate()}. ${T.mon[n.getMonth()]}`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._store && this._store.snap; const lang = this._lang(); const T = NAV_T[lang];
      const mods = (s && s.modules) || { week: true, lists: true };
      const nav = (s && s.settings && s.settings.nav) || { order: ['planer', 'listen', 'belohnungen', 'einstellungen', 'aemtliplan'], hidden: ['aemtliplan'] };
      const order = this._cfg.order || nav.order.filter((k) => !nav.hidden.includes(k));
      if (s) applyTheme(this, this._cfg.theme || s.theme, this._cfg.style || s.style);
      const cur = location.pathname.split('/').filter(Boolean).pop();
      const btns = order.filter((k) => NAV[lang][k] && (!NAV_MOD[k] || mods[NAV_MOD[k]] !== false));
      const title = this._cfg.titel || this._cfg.title || (s && s.title) || 'Family Planer';
      const showTitle = !!(s && s.settings && s.settings.nav_title);
      const n = new Date(); const p2 = (x) => String(x).padStart(2, '0');
      const review = ((s && s.vacation_review) || []).filter((v) => !v.decision); const pending = review.length;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-bottom:8px}
        .bar::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}.bar{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;background:var(--fp-bg1);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);padding:6px 10px 6px 14px;font-family:var(--fp-font);color:var(--fp-text);-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}
        .t{display:flex;align-items:center;gap:10px;min-width:0}
        .clk{display:flex;align-items:baseline;gap:10px;min-width:0;white-space:nowrap}.clk b{font-size:26px;font-weight:300;font-variant-numeric:tabular-nums;color:var(--fp-accent);line-height:1}
        .clk span{font-size:15px;color:var(--fp-text);overflow:hidden;text-overflow:ellipsis}.ttl{font-size:10px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1.2px;display:block}
        .mid{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
        button{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid var(--fp-line);background:var(--fp-bg3);color:var(--fp-text2);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .mid button.on{background:var(--fp-grad);border-color:transparent;color:var(--fp-on-accent);font-weight:600}
        button.on{border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:var(--fp-accent)}
        button.menu{padding:0 10px}
        button ha-icon{--mdc-icon-size:20px}
        .rt{display:flex;justify-content:flex-end;gap:8px;position:relative}
        button.ic{padding:0 10px 0 8px;gap:8px}.sw{display:flex;gap:3px;align-items:center;padding:4px 5px;border:1px solid;border-radius:7px}.sw i{display:block;width:8px;height:16px;border-radius:3px}
        button.vac{position:relative;color:#4FA3E0;border-color:rgba(79,163,224,.55)}.vac .dot{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#E06B6B;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box}
        .mid button.miss{opacity:.55;border-style:dashed}.err{white-space:normal;max-width:min(460px,90vw);position:absolute;right:0;top:48px;background:#3a2626;border:1px solid #E06B6B;color:#fdd;padding:6px 12px;border-radius:10px;font-size:13px;z-index:31}
        @media (max-width:700px){.mid button span.l{display:none}.mid button{padding:0 12px}.clk span{display:none}.bar{grid-template-columns:auto 1fr auto}}
      </style><div class="bar"><span class="t">${this._cfg.menu ? '<button class="menu" data-menu><ha-icon icon="mdi:menu"></ha-icon></button>' : ''}<span class="clk">${showTitle ? `<i class="ttl">${escN(title)}</i>` : ''}<b>${p2(n.getHours())}:${p2(n.getMinutes())}</b><span>${T.wd[n.getDay()]}, ${n.getDate()}. ${T.mon[n.getMonth()]}</span></span></span>
        <div class="mid">${btns.map((k) => `<button class="${this._paths[k] === cur ? 'on' : ''}${this._views && !this._views.has(this._paths[k]) ? ' miss' : ''}" data-go="${escN(this._paths[k])}" title="${escN(this._views && !this._views.has(this._paths[k]) ? T.miss.replace('{p}', this._paths[k]) : NAV[lang][k])}"><ha-icon icon="${NAV_ICON[k]}"></ha-icon><span class="l">${escN(NAV[lang][k])}</span></button>`).join('')}</div>
        ${this._right(s, lang, review, pending)}</div>`;
      this._popLayer(this._popHtml, NAV_POPCSS);
    }
    _right(s, lang, review, pending) {
      if (!s) return '<span></span>';
      const T = NAV_T[lang]; const cur = themeName(s.theme); const sty = STYLES.includes(s.style) ? s.style : 'standard';
      const nm = (k) => THEME_NAMES[k][lang === 'en' ? 'en' : 'de']; const sn = (k) => STYLE_NAMES[k][lang === 'en' ? 'en' : 'de'];
      const fmtD = (d) => { const x = new Date(d + 'T00:00'); return `${x.getDate()}.${x.getMonth() + 1}.`; };
      const vac = pending ? `<button class="ic vac${this._open === 'vac' ? ' on' : ''}" data-vac title="${escN(T.vac)}"><ha-icon icon="mdi:beach"></ha-icon>${pending ? `<b class="dot">${pending}</b>` : ''}</button>` : '';
      const pop = this._open === 'theme' ? `<div class="pop" role="dialog"><div class="ph"><ha-icon icon="mdi:palette-outline"></ha-icon>${T.design}<button class="x" data-x>✕</button></div>
          <div class="tg">${Object.keys(THEMES).map((k) => `<button class="${k === cur ? 'on' : ''}" data-theme="${k}">${themeMini(k, sty)}<span class="tn">${k === cur ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}${nm(k)}</span></button>`).join('')}</div>
          <div class="ph" style="margin-top:14px"><ha-icon icon="mdi:layers-outline"></ha-icon>${T.style}</div>
          <div class="sg">${STYLES.map((k) => `<button class="${k === sty ? 'on' : ''}" data-style="${k}">${themeMini(cur, k)}<span class="tn">${k === sty ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}${sn(k)}</span></button>`).join('')}</div></div>`
        : this._open === 'vac' && pending ? `<div class="pop" role="dialog"><div class="ph"><ha-icon icon="mdi:beach"></ha-icon>${T.vac}<button class="x" data-x>✕</button></div><div class="hint">${T.vacHint}</div>
          <div class="vl">${['holiday', 'long'].map((kind) => { const list = review.filter((v) => (v.kind || 'holiday') === kind); if (!list.length) return '';
            return (kind === 'long' ? `<div class="oh">${T.opt}</div><div class="oh2">${T.optHint}</div>` : '') + list.map((v) => { const c = this._vacChoice(v.key);
              return `<div class="vi"><div class="vt">${escN(v.title)}</div><div class="vd">${fmtD(v.days[0])} – ${fmtD(v.days[v.days.length - 1])}</div>
              <div class="vs"><button class="${c.family ? 'on' : ''}" data-vfam data-key="${escN(v.key)}"><ha-icon icon="mdi:account-group"></ha-icon>${T.fam}</button>${(s.persons || []).map((p) => `<button class="${!c.family && c.persons.includes(p.id) ? 'on' : ''}" data-vper="${escN(p.id)}" data-key="${escN(v.key)}">${escN(p.name)}</button>`).join('')}</div>
              <div class="vb"><button class="away" data-decide="away" data-key="${escN(v.key)}"><ha-icon icon="mdi:airplane"></ha-icon>${T.away}</button>
              <button class="home" data-decide="home" data-key="${escN(v.key)}"><ha-icon icon="mdi:home-heart"></ha-icon>${T.home}</button></div></div>`; }).join(''); }).join('')}</div></div>` : '';
      this._popHtml = pop;
      return `<span class="rt">${vac}${this._cfg.theme_picker === false ? '' : `<button class="ic${this._open === 'theme' ? ' on' : ''}" data-themes title="${T.design}" aria-expanded="${this._open === 'theme'}">${themeSwatch(cur)}<ha-icon icon="mdi:palette-outline"></ha-icon></button>`}
        ${this._err ? `<div class="err">${escN(this._err)}</div>` : ''}</span>`;
    }
  }
  if (!customElements.get('family-planer-nav-card')) customElements.define('family-planer-nav-card', FamilyPlanerNavCard);

  // Sidebar panel: the complete planer without any dashboard or YAML
  class FamilyPlanerPanel extends HTMLElement {
    set hass(h) { this._hass = h; this._render(); }
    set narrow(n) { this._narrow = !!n; this._render(true); }
    set panel(p) { this._panel = p; this._render(); }
    connectedCallback() { this._onLoc = () => this._render(); window.addEventListener('location-changed', this._onLoc); window.addEventListener('popstate', this._onLoc); this._render(); }
    disconnectedCallback() { window.removeEventListener('location-changed', this._onLoc); window.removeEventListener('popstate', this._onLoc); }
    _render(force) {
      if (!this._hass || !this.isConnected) return;
      const cfg = (this._panel && this._panel.config) || {};
      const seg = location.pathname.split('/').filter(Boolean)[1] || 'planer';
      const view = NAV_VIEW[seg] || 'week';
      if (!this._wrap) {
        this.style.cssText = 'display:block;min-height:100vh;box-sizing:border-box;padding:8px;background:var(--fp-page,var(--fp-bg0,#141414));background-attachment:fixed';
        this._wrap = true; this._nav = document.createElement('family-planer-nav-card'); this.appendChild(this._nav);
        if (window.FPKIOSK) window.FPKIOSK.attach(this, Store.get(this._hass.connection, cfg.entry_id));
      }
      const store = Store.get(this._hass.connection, cfg.entry_id);
      if (!this._offTheme) this._offTheme = store.listen(() => { if (store.snap) { applyTheme(this, store.snap.theme, store.snap.style); this.style.background = 'var(--fp-page,var(--fp-bg0))'; } });
      if (force || this._navNarrow !== this._narrow) { this._navNarrow = this._narrow; this._nav.setConfig({ entry_id: cfg.entry_id, menu: this._narrow }); }
      this._nav.hass = this._hass;
      if (this._view !== view) {
        this._view = view; if (this._card) this._card.remove();
        this._card = document.createElement('family-planer-card'); this._card.setConfig({ view, entry_id: cfg.entry_id }); this.appendChild(this._card);
      }
      this._card.hass = this._hass;
    }
  }
  if (!customElements.get('family-planer-panel')) customElements.define('family-planer-panel', FamilyPlanerPanel);

  window.customCards = window.customCards || [];
  window.customCards.push(
    { type: 'family-planer-card', name: 'Family Planer', description: 'view: week (Wochenplan), plan (Ämtliplan), lists (Smarte Listen), rewards (Belohnungen) oder settings (Einstellungen); theme optional', preview: false },
    { type: 'family-planer-nav-card', name: 'Family Planer Navigation', description: 'Planer · Listen · Ämtliplan', preview: false });
})();
