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
