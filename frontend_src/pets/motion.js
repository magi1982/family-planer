/* Family Planer – pet motion engine (design draft, round 8).
   2.5D garden: x = left/right, y = depth on the ground (far 255 … near 505), z = height above the ground.
   Every animal runs a queue of tasks (walk, hop, swim, fly, climb, dig, rest …); without a script it picks
   tasks from its favourite places. Pure DOM + SVG, no libraries. */
(() => {
  const P4 = window.P4;
  const W = 1000, H = 520;
  const GARDEN = {
    pond: { cx: 745, cy: 425, rx: 175, ry: 60 },
    tree: { x: 150, y: 338, branchY: 184, branchX: 232 },
    roof: { x: 520, y: 262, z: 132 },
    stone: { x: 590, y: 362, z: 18 },
    post: { x: 930, y: 404, z: 86 },
    flowers: [[300, 455], [346, 474], [392, 452]],
    bowl: { x: 468, y: 492 },
    nest: { x: 78, y: 478 },
    hill: { x: 892, y: 304 },
  };  GARDEN.beds = { huette: { x: 352, y: 322 }, korb: { x: 655, y: 506 }, vogelhaus: { x: 930, y: 404, z: 92 }, seerose: { x: 690, y: 432 }, bau: { x: 892, y: 300 }, nest: { x: 78, y: 478 } };
  GARDEN.hides = [{ x: 150, y: 330, n: 'hinter dem Baum' }, { x: 352, y: 314, n: 'hinter der Hütte' }, { x: 346, y: 466, n: 'hinter den Blumen' }, { x: 596, y: 352, n: 'hinter dem Stein' }];
  GARDEN.y0 = 255; GARDEN.y1 = 505; GARDEN.base = 150; GARDEN.W = 1000; GARDEN.H = 520; GARDEN.poolOpen = true;
  let G = GARDEN;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const ease = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const depth = (y) => .5 + .5 * clamp((y - G.y0) / (G.y1 - G.y0), 0, 1);

  // ---------------------------------------------------------------- what every animal can do
  // sp = walking speed (px/s at the front), gait, swim, fly type, climb style, dig, bask, fav = favourite places
  const AB = {
    fuchs: { sp: 62, gait: 'walk', fav: { wiese: 3, blumen: 2, napf: 2, nest: 2, teichrand: 1, baum: 1 } },
    katze: { sp: 52, gait: 'walk', climb: 'cat', fav: { baum: 4, stein: 3, nest: 2, napf: 2, wiese: 1 } },
    hund: { sp: 70, gait: 'walk', swim: 1, fav: { wiese: 4, napf: 3, teich: 1, treffen: 3, nest: 1 } },
    hase: { sp: 70, gait: 'hop', dig: 1, fav: { wiese: 3, blumen: 3, huegel: 2, nest: 1 } },
    igel: { sp: 30, gait: 'walk', fav: { blumen: 3, nest: 3, wiese: 2, napf: 2 } },
    waschbaer: { sp: 48, gait: 'walk', climb: 'hug', fav: { teichrand: 3, napf: 3, baum: 2, wiese: 1 } },
    panda: { sp: 34, gait: 'walk', climb: 'hug', fav: { napf: 4, nest: 3, baum: 1, wiese: 1 } },
    erdmann: { sp: 60, gait: 'walk', dig: 1, fav: { huegel: 5, stein: 2, wiese: 1 } },
    eichhorn: { sp: 75, gait: 'hop', climb: 'squirrel', fav: { baum: 5, wiese: 2, napf: 1 } },
    hamster: { sp: 40, gait: 'walk', dig: 1, fav: { napf: 4, huegel: 3, nest: 2 } },
    maus: { sp: 55, gait: 'walk', fav: { napf: 3, blumen: 2, nest: 2, wiese: 2 } },
    einhorn: { sp: 64, gait: 'walk', fav: { wiese: 4, blumen: 3, teichrand: 2 } },
    otter: { sp: 50, gait: 'walk', swim: 1, dive: 1, fav: { teich: 6, stein: 1, wiese: 1 } },
    frosch: { sp: 60, gait: 'hop', swim: 1, dive: 1, fav: { teich: 5, stein: 2, blumen: 1 } },
    axolotl: { sp: 26, gait: 'walk', swim: 1, dive: 1, fav: { teich: 7, stein: 1 } },
    eidechse: { sp: 58, gait: 'walk', bask: 1, fav: { stein: 6, wiese: 2, huegel: 1 } },
    chamae: { sp: 16, gait: 'walk', climb: 'slow', bask: 1, fav: { baum: 5, stein: 2 } },
    drache: { sp: 50, gait: 'walk', fly: 'heavy', bask: 1, fav: { flug: 3, stein: 3, dach: 2, wiese: 1 } },
    eule: { sp: 30, gait: 'hop', fly: 'bird', fav: { flug: 3, pfosten: 4, dach: 3, ast: 3 } },
    pinguin: { sp: 34, gait: 'waddle', swim: 1, dive: 1, fav: { teich: 5, wiese: 1, treffen: 2 } },
    ente: { sp: 36, gait: 'waddle', swim: 1, fly: 'bird', fav: { teich: 6, wiese: 2, napf: 1 } },
    papagei: { sp: 30, gait: 'hop', fly: 'bird', fav: { ast: 4, flug: 3, dach: 2, napf: 2 } },
    biene: { sp: 30, gait: 'walk', fly: 'insect', always: 'air', fav: { blumen: 8, flug: 1 } },
    kaefer: { sp: 22, gait: 'walk', fly: 'insect', fav: { blumen: 5, stein: 2, flug: 1 } },
    falter: { sp: 20, gait: 'walk', fly: 'flutter', always: 'air', fav: { blumen: 8, flug: 2 } },
    reh: { sp: 66, gait: 'walk', fav: { wiese: 4, teichrand: 2, blumen: 2 } },
    pony: { sp: 72, gait: 'walk', fav: { wiese: 5, napf: 2, teichrand: 1 } },
    koala: { sp: 24, gait: 'walk', climb: 'hug', fav: { baum: 7, napf: 1 } },
    faultier: { sp: 10, gait: 'walk', climb: 'hang', fav: { baum: 9 } },
    robbe: { sp: 26, gait: 'waddle', swim: 1, dive: 1, bask: 1, fav: { teich: 5, stein: 3 } },
    biber: { sp: 34, gait: 'waddle', swim: 1, dive: 1, fav: { teich: 5, baum: 1, huegel: 1 } },
    flamingo: { sp: 34, gait: 'walk', swim: 'wade', fly: 'bird', fav: { teich: 5, wiese: 1 } },
    fledermaus: { sp: 30, gait: 'walk', fly: 'bat', fav: { flug: 5, ast: 3, dach: 2 } },
    kolibri: { sp: 30, gait: 'hop', fly: 'humm', always: 'air', fav: { blumen: 8, ast: 1 } },
    tiger: { sp: 64, gait: 'walk', swim: 1, fav: { wiese: 3, stein: 3, teich: 2, nest: 2 } },
    pegasus: { sp: 72, gait: 'walk', fly: 'heavy', fav: { flug: 4, wiese: 3, dach: 1 } },
    phoenix: { sp: 30, gait: 'hop', fly: 'bird', bask: 1, fav: { flug: 4, dach: 3, stein: 2 } },
    greif: { sp: 56, gait: 'walk', fly: 'heavy', fav: { flug: 4, dach: 3, pfosten: 2, wiese: 1 } },
    kitsune: { sp: 64, gait: 'walk', climb: 'cat', fav: { wiese: 3, blumen: 3, baum: 2, nest: 1 } },
    yeti: { sp: 40, gait: 'walk', climb: 'hug', fav: { wiese: 3, teichrand: 2, baum: 1, treffen: 2 } },
    nessie: { sp: 22, gait: 'waddle', swim: 1, dive: 1, fav: { teich: 9 } },
    wolpi: { sp: 66, gait: 'hop', fly: 'heavy', fav: { wiese: 3, flug: 2, huegel: 2, blumen: 1 } },
  };
  const PLACE_TXT = { wiese: 'Wiese', blumen: 'Blumenbeet', napf: 'Futternapf', nest: 'Nest', teichrand: 'am Teichufer', teich: 'im Teich', baum: 'auf dem Baum', stein: 'Sonnenstein', huegel: 'Sandhügel', dach: 'Hausdach', pfosten: 'Pfosten', ast: 'Ast', flug: 'in der Luft', treffen: 'bei anderen Tierchen' };
  const CLIMB_TXT = { cat: 'Katzensprung: anlaufen, hochspringen, festkrallen, nochmal springen', squirrel: 'Huschen: seitlich in kurzen Sprints, kopfüber wieder runter', hug: 'Umklammern: Arm um Arm, langsam und gemütlich', hang: 'Hangeln: hängt unter dem Ast, ganz langsam', slow: 'Schleichen: jeder Schritt mit Schaukeln, wie ein Blatt im Wind' };
  const FLY_TXT = { bird: 'Vogel: Absprung, schlagen und gleiten, sanfte Landung', heavy: 'Grosse Flügel: wenige kräftige Schläge, lange gleiten', insect: 'Insekt: schwirrt, steht in der Luft, kleine Ruckler', flutter: 'Falter: flattert auf und ab, nie geradeaus', bat: 'Fledermaus: schnelle Haken im Zickzack', humm: 'Kolibri: schwirrt blitzschnell, bleibt in der Luft stehen' };

  // ---------------------------------------------------------------- scene drawing (simple, flat, Animal-Crossing-like)
  const bg = () => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="gbg">
    <defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e3f5ff"/></linearGradient>
    <linearGradient id="ggr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad86f"/><stop offset="1" stop-color="#6cbd4b"/></linearGradient>
    <radialGradient id="gwat" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#9fe4ff"/><stop offset="1" stop-color="#3f9fda"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#gsky)"/>
    <circle cx="880" cy="66" r="38" fill="#FFE68A"/><circle cx="880" cy="66" r="52" fill="#FFE68A" opacity=".25"/>
    <g fill="#fff" opacity=".9"><ellipse cx="250" cy="70" rx="46" ry="16"/><ellipse cx="282" cy="60" rx="30" ry="18"/><ellipse cx="660" cy="44" rx="40" ry="13"/><ellipse cx="688" cy="36" rx="24" ry="14"/></g>
    <path d="M0 236 Q120 176 260 222 Q380 186 520 226 Q660 180 800 222 Q900 196 1000 220 V280 H0z" fill="#b3e08f"/>
    <path d="M0 252 Q160 222 330 250 Q520 222 700 252 Q860 230 1000 248 V290 H0z" fill="#a4db7f"/>
    <rect y="255" width="${W}" height="${H - 255}" fill="url(#ggr)"/>
    <g fill="#fff" opacity=".07"><path d="M0 300 H1000 V318 H0z"/><path d="M0 352 H1000 V374 H0z"/><path d="M0 414 H1000 V440 H0z"/><path d="M0 482 H1000 V510 H0z"/></g>
    <path d="M520 262 C512 330 420 380 440 440 S500 500 480 520 H560 C590 480 520 440 520 400 S560 320 540 262z" fill="#efdcac" opacity=".9"/>
    <ellipse cx="${G.pond.cx}" cy="${G.pond.cy + 3}" rx="${G.pond.rx + 14}" ry="${G.pond.ry + 11}" fill="#cfc6b6"/>
    <g fill="#bdb3a2">${[...Array(16)].map((_, i) => { const a = i / 16 * Math.PI * 2; return `<ellipse cx="${(G.pond.cx + Math.cos(a) * (G.pond.rx + 9)).toFixed(1)}" cy="${(G.pond.cy + 3 + Math.sin(a) * (G.pond.ry + 7)).toFixed(1)}" rx="13" ry="7"/>`; }).join('')}</g>
    <ellipse cx="${G.pond.cx}" cy="${G.pond.cy}" rx="${G.pond.rx}" ry="${G.pond.ry}" fill="url(#gwat)"/>
    <ellipse cx="${G.pond.cx - 50}" cy="${G.pond.cy - 22}" rx="60" ry="9" fill="#fff" opacity=".22"/>
    <g fill="#5fb548"><ellipse cx="${G.beds.seerose.x}" cy="${G.beds.seerose.y}" rx="26" ry="9"/><circle cx="${G.beds.seerose.x + 16}" cy="${G.beds.seerose.y - 6}" r="4" fill="#FF8FC8"/><path d="M640 448 a14 7 0 1 0 1 0 l-1 7z"/><path d="M850 410 a12 6 0 1 0 1 0 l-1 6z"/></g>
    <ellipse cx="${G.hill.x}" cy="${G.hill.y}" rx="58" ry="17" fill="#ddbb82"/><ellipse cx="${G.hill.x}" cy="${G.hill.y - 4}" rx="36" ry="9" fill="#e9cc96"/><ellipse cx="${G.hill.x + 24}" cy="${G.hill.y - 2}" rx="9" ry="4.5" fill="#5a3a1e"/>
    <ellipse cx="${G.nest.x}" cy="${G.nest.y}" rx="52" ry="15" fill="#d8b066"/><ellipse cx="${G.nest.x}" cy="${G.nest.y - 2}" rx="40" ry="10" fill="#e8c87e"/>
    <path d="M40 474 q20 -6 40 0 M58 480 q18 -5 34 2 M50 470 q16 -4 30 -1" stroke="#b58a44" stroke-width="2" fill="none"/>
  </svg>`;
  const prop = (z, inner) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="gprop" style="z-index:${z}">${inner}</svg>`;
  const props = (winter) => [
    prop(Math.round(G.tree.y), `<path d="M128 ${G.tree.y} q-12 6 -22 4 q14 -6 22 -16z M172 ${G.tree.y} q12 6 22 4 q-14 -6 -22 -16z" fill="#8a5a34"/>
      <rect x="128" y="96" width="44" height="${G.tree.y - 96}" rx="9" fill="#9a6a42"/><path d="M140 140 q4 10 0 20 M160 210 q-4 10 0 22 M142 270 q4 9 0 18" stroke="#7a4c2a" stroke-width="3" fill="none"/>
      <path d="M166 196 Q210 186 286 172 L288 182 Q214 196 168 208z" fill="#9a6a42"/><circle cx="286" cy="176" r="7" fill="#5fb548"/>`),
    prop(Math.round(G.tree.y) + 1, `<g fill="#55ac44"><circle cx="150" cy="78" r="70"/><circle cx="86" cy="104" r="48"/><circle cx="214" cy="104" r="50"/><circle cx="120" cy="40" r="44"/><circle cx="190" cy="44" r="42"/></g>
      <g fill="#6cc455"><circle cx="128" cy="60" r="30"/><circle cx="196" cy="80" r="24"/><circle cx="96" cy="96" r="20"/></g><g fill="#E5483B"><circle cx="110" cy="120" r="7"/><circle cx="196" cy="128" r="7"/><circle cx="160" cy="52" r="6"/></g>`),
    prop(G.roof.y, `<rect x="452" y="192" width="136" height="70" fill="#ffe7c2"/><path d="M436 198 L520 128 L604 198z" fill="#e06a4a"/><path d="M436 198 L520 128 L604 198" stroke="#c4553a" stroke-width="5" fill="none" stroke-linejoin="round"/>
      <rect x="506" y="218" width="28" height="44" rx="12" fill="#a8693f"/><rect x="466" y="210" width="26" height="22" rx="4" fill="#9fdcff" stroke="#fff" stroke-width="3"/><rect x="548" y="210" width="26" height="22" rx="4" fill="#9fdcff" stroke="#fff" stroke-width="3"/>`),
    prop(G.stone.y, `<ellipse cx="${G.stone.x}" cy="${G.stone.y - 6}" rx="48" ry="20" fill="#b9b3a8"/><ellipse cx="${G.stone.x - 6}" cy="${G.stone.y - 14}" rx="34" ry="9" fill="#d3cec5"/>`),
    prop(G.beds.huette.y, `<g transform="translate(${G.beds.huette.x} ${G.beds.huette.y})"><rect x="-34" y="-46" width="68" height="46" rx="3" fill="#C98A52"/><path d="M-42 -42 L0 -74 L42 -42z" fill="#8a4f2a"/><path d="M-42 -42 L0 -74 L42 -42" stroke="#6b3a1e" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M-14 0 v-22 a14 14 0 0 1 28 0 v22z" fill="#3a2414"/><rect x="-12" y="-62" width="24" height="9" rx="2" fill="#fff"/><text x="0" y="-55" text-anchor="middle" font-size="7" font-weight="800" fill="#8a4f2a" font-family="system-ui">Hütte</text></g>`),
    prop(G.beds.korb.y, `<g transform="translate(${G.beds.korb.x} ${G.beds.korb.y})"><ellipse cx="0" cy="-8" rx="30" ry="11" fill="#b9874e"/><ellipse cx="0" cy="-12" rx="25" ry="7" fill="#FF8FB0"/><path d="M-30 -8 Q0 8 30 -8" stroke="#8a5e30" stroke-width="3" fill="none"/></g>`),
    prop(G.post.y, `<rect x="921" y="${G.post.y - G.post.z}" width="18" height="${G.post.z}" rx="3" fill="#a8693f"/><rect x="914" y="${G.post.y - G.post.z - 26}" width="32" height="26" rx="3" fill="#E9C27A"/><path d="M910 ${G.post.y - G.post.z - 24} L930 ${G.post.y - G.post.z - 40} L950 ${G.post.y - G.post.z - 24}z" fill="#C4553A"/><circle cx="930" cy="${G.post.y - G.post.z - 14}" r="5" fill="#3a2414"/>`),
    ...(winter ? [] : G.flowers).map(([x, y], i) => prop(y, `<path d="M${x} ${y} V${y - 44}" stroke="#4c9a38" stroke-width="4"/><ellipse cx="${x - 8}" cy="${y - 18}" rx="9" ry="4" fill="#5fb548"/>
      <g fill="${['#FF7FA6', '#FFC94D', '#B58CFF'][i]}">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + Math.cos(a / 57.3) * 9).toFixed(1)}" cy="${(y - 48 + Math.sin(a / 57.3) * 9).toFixed(1)}" r="7"/>`).join('')}</g><circle cx="${x}" cy="${y - 48}" r="6" fill="#FFF3B0"/>`)),
    prop(G.bowl.y, `<path d="M${G.bowl.x - 22} ${G.bowl.y - 12} h44 l-6 12 h-32z" fill="#4FA3E0"/><ellipse cx="${G.bowl.x}" cy="${G.bowl.y - 12}" rx="22" ry="5" fill="#3A86C8"/><g fill="#d9a25a"><circle cx="${G.bowl.x - 8}" cy="${G.bowl.y - 14}" r="3.4"/><circle cx="${G.bowl.x}" cy="${G.bowl.y - 15}" r="3.4"/><circle cx="${G.bowl.x + 8}" cy="${G.bowl.y - 14}" r="3.4"/></g>`),
  ].join('');

  // ---------------------------------------------------------------- effects (ripples stay inside the pond)
  const FX = {
    heart: '<path d="M0 4 C-7 -2 -4 -9 0 -5 C4 -9 7 -2 0 4z" fill="#FF6F91"/>',
    note: '<path d="M2 -8 v10 a3 2.4 0 1 1 -2 -2.2 v-9 l7 -2 v3z" fill="#7A5CFF"/>',
    zz: '<text x="0" y="0" font-size="13" font-weight="800" fill="#5b6cff" font-family="system-ui">z</text>',
    drop: '<path d="M0 -4 Q3 0 0 3 Q-3 0 0 -4z" fill="#7fd3ff"/>',
    dirt: '<circle r="2.6" fill="#b88a50"/>',
    puff: '<circle r="5" fill="#e9dcc4" opacity=".75"/>',
    spark: '<path d="M0 -6 l1.4 4.6 4.6 1.4 -4.6 1.4 -1.4 4.6 -1.4 -4.6 -4.6 -1.4 4.6 -1.4z" fill="#FFE066"/>',
    crumb: '<circle r="1.8" fill="#d9a25a"/>',
    bubble: '<circle r="3" fill="none" stroke="#fff" stroke-width="1.2"/>',
    sun: '<circle r="5" fill="#FFD34D"/>',
    apple: '<circle r="5" fill="#E5483B"/><path d="M0 -5 l1 -3" stroke="#5a3" stroke-width="1.5"/>',
    dot: '<circle r="2.4" fill="currentColor"/>',
    snow: '<circle r="2.6" fill="#fff"/>',
    leaf: '<path d="M-5 0 Q0 -6 5 0 Q0 6 -5 0z" fill="currentColor"/>',
    petal: '<ellipse rx="3.4" ry="2" fill="#FFB3D1"/>',
    conf: '<rect x="-2.4" y="-1.4" width="4.8" height="2.8" fill="currentColor"/>',
    fly: '<circle r="2.4" fill="#FFF7A0"/><circle r="6" fill="#FFF7A0" opacity=".25"/>',
  };


  // things that grow on the ground behind animals with a special ability
  const GROUND = {
    blume: '<svg viewBox="-10 -24 20 26" width="calc(20px*var(--k))"><path d="M0 0 V-14" stroke="#4c9a38" stroke-width="2"/><path d="M0 -6 q-5 -2 -6 -6 q5 0 6 5z" fill="#5fb548"/><g fill="#FF8FC8"><circle cx="0" cy="-19" r="3.4"/><circle cx="-3.6" cy="-16" r="3.4"/><circle cx="3.6" cy="-16" r="3.4"/><circle cx="-2.2" cy="-12" r="3.4"/><circle cx="2.2" cy="-12" r="3.4"/></g><circle cx="0" cy="-15.5" r="2.4" fill="#FFE066"/></svg>',
    pilz: '<svg viewBox="-10 -20 20 22" width="calc(18px*var(--k))"><rect x="-2.4" y="-9" width="4.8" height="9" rx="2" fill="#f4ead8"/><path d="M-9 -8 Q0 -22 9 -8z" fill="#E5483B"/><circle cx="-4" cy="-12" r="1.6" fill="#fff"/><circle cx="3" cy="-14" r="1.4" fill="#fff"/></svg>',
    kristall: '<svg viewBox="-10 -24 20 26" width="calc(18px*var(--k))"><path d="M-6 0 L-4 -12 L-1 0z M-2 0 L1 -20 L4 0z M3 0 L6 -10 L8 0z" fill="#9fe6ff" stroke="#fff" stroke-width=".7"/></svg>',
    feuer: '<svg viewBox="-10 -20 20 22" width="calc(14px*var(--k))"><path d="M0 0 C-7 -4 -3 -10 0 -18 C3 -10 7 -4 0 0z" fill="#FF8A1E"/><path d="M0 0 C-3 -3 -1 -7 0 -11 C1 -7 3 -3 0 0z" fill="#FFE066"/></svg>',
    pfote: '<svg viewBox="-8 -8 16 16" width="calc(12px*var(--k))"><g fill="#FFF3A0" opacity=".95"><ellipse cx="0" cy="2" rx="4" ry="3"/><circle cx="-4" cy="-3" r="1.6"/><circle cx="0" cy="-5" r="1.6"/><circle cx="4" cy="-3" r="1.6"/></g></svg>',
    blatt: '<svg viewBox="-10 -10 20 20" width="calc(12px*var(--k))"><path d="M-6 0 Q0 -7 6 0 Q0 7 -6 0z" fill="#F2B04A"/></svg>',
  };
  // special abilities of end forms: something happens while the animal walks
  const ABIL = {
    bluemchen: { n: 'Blümchen-Spur', every: 70, f: (a, sc) => sc.ground('blume', a.x - a.face * 8 * (G.sk || 1), a.y + 1, 5) },
    pilze: { n: 'Pilze ploppen', every: 110, f: (a, sc) => sc.ground('pilz', a.x - a.face * 8 * (G.sk || 1), a.y + 1, 4) },
    kristall: { n: 'Kristalle wachsen', every: 90, f: (a, sc) => sc.ground('kristall', a.x - a.face * 8 * (G.sk || 1), a.y + 1, 3.5) },
    feuer: { n: 'Feuer-Fussspuren', every: 40, f: (a, sc) => sc.ground('feuer', a.x - a.face * 5 * (G.sk || 1), a.y + 1, 1.6) },
    glitzer: { n: 'Glitzer-Pfoten', every: 30, f: (a, sc) => sc.ground('pfote', a.x, a.y + 1, 2.4) },
    blaetter: { n: 'Blätterwirbel', every: 45, f: (a, sc) => sc.fx('leaf', a.x - a.face * 10, a.y - 6, { anim: 'arc', dx: -a.face * rnd(10, 30) * (G.sk || 1), dy: -rnd(20, 40) * (G.sk || 1), dur: 1, size: 12, color: pick(['#F2B04A', '#E58A3A', '#8CD06A']) }) },
    funken: { n: 'Funkenspur', every: 22, f: (a, sc) => sc.fx('spark', a.x - a.face * 14 * (G.sk || 1), a.y - 10 * (G.sk || 1), { dy: -14 * (G.sk || 1), dur: .9, size: 10 }) },
    herzchen: { n: 'Herzchen-Spur', every: 40, f: (a, sc) => sc.fx('heart', a.x - a.face * 14 * (G.sk || 1), a.y - 20 * (G.sk || 1), { dy: -30 * (G.sk || 1), dur: 1.4, size: 12 }) },
    noten: { n: 'Musik-Spur', every: 50, f: (a, sc) => sc.fx('note', a.x, a.y - 60 * depth(a.y) * (G.sk || 1), { dx: rnd(-10, 10), dy: -30 * (G.sk || 1), dur: 1.4, size: 13 }) },
    blasen: { n: 'Seifenblasen', every: 55, f: (a, sc) => sc.fx('bubble', a.x - a.face * 10, a.y - 20 * (G.sk || 1), { dx: rnd(-10, 10), dy: -50 * (G.sk || 1), dur: 2.4, size: 16 }) },
    schnee: { n: 'Schneegestöber', every: 30, f: (a, sc) => sc.fx('snow', a.x + rnd(-20, 20) * (G.sk || 1), a.y - 80 * depth(a.y) * (G.sk || 1), { anim: 'fall', dx: rnd(-6, 6), dy: 70 * (G.sk || 1), dur: 1.6, size: 8 }) },
    regenbogen: { n: 'Regenbogen-Spur', every: 14, f: (a, sc) => sc.fx('dot', a.x - a.face * 16 * (G.sk || 1), a.y - 18 * (G.sk || 1), { dy: 4, dur: 1.2, size: 10, color: ['#FF5A5A', '#FFB347', '#FFE066', '#8CE07A', '#7FD3FF', '#B58CFF'][Math.floor(sc.t * 10) % 6] }) },
    blitz: { n: 'Blitz vom Himmel', every: 0, time: [5, 9], f: (a, sc) => { sc.bolt(a.x + a.face * rnd(30, 60) * (G.sk || 1), a.y + 2); a.bubble('⚡', .8); } },
    sterne: { n: 'Sternschnuppen', every: 0, time: [3, 6], f: (a, sc) => { const x = a.x + rnd(-60, 20); for (let i = 0; i < 5; i++) sc.fx('spark', x + i * 10, 10 + i * 4, { dx: 80, dy: a.y - 40 - 10, dur: 1, size: 10 - i }); } },
    falter: { n: 'Schmetterlinge folgen', every: 0, aura: 'falter' },
    wolke: { n: 'eigene Regenwolke', every: 0, aura: 'wolke' },
  };
  class Scene {
    constructor(host, opt) {
      this.o = opt || {}; this.geo = this.o.geo || GARDEN; useGeo(this.geo); this.host = host; this.speed = 1; this.labels = !!this.o.labels; this.actors = []; this.t = 0; (window.__FPS = window.__FPS || []).push(this);
      const crop = this.o.crop || [0, 0, this.geo.W, this.geo.H]; this.crop = crop;
      host.classList.add('gwrap'); host.style.aspectRatio = `${crop[2] - crop[0]} / ${crop[3] - crop[1]}`;
      host.innerHTML = `<div class="gscene" style="width:${this.geo.W}px;height:${this.geo.H}px"><div class="gland">${this.geo.draw ? this.geo.draw(this) : bg() + props()}</div><svg class="gwater" viewBox="0 0 ${this.geo.W} ${this.geo.H}" style="width:${this.geo.W}px;height:${this.geo.H}px" preserveAspectRatio="none"><defs><clipPath id="pc${Scene.n = (Scene.n || 0) + 1}"><ellipse cx="${G.pond.cx}" cy="${G.pond.cy}" rx="${G.pond.rx - 3}" ry="${G.pond.ry - 3}"/></clipPath></defs><g clip-path="url(#pc${Scene.n})"></g></svg><div class="gfx"></div><div class="gdark"></div></div>`;
      this.land = host.querySelector('.gland'); this.dark = host.querySelector('.gdark'); this.hooks = []; this.season = this.o.season || 'alltag'; this.pt = 0; if (this.o.season) this.setSeason(this.o.season);
      this.sc = host.querySelector('.gscene'); this.water = host.querySelector('.gwater g'); this.fxl = host.querySelector('.gfx');
      const fit = () => { const k = host.clientWidth / (crop[2] - crop[0]); this.sc.style.transform = `scale(${k}) translate(${-crop[0]}px, ${-crop[1]}px)`; };
      fit(); new ResizeObserver(fit).observe(host);
      this.vis = true; new IntersectionObserver((e) => { this.vis = e[0].isIntersecting; }).observe(host);
      let last = performance.now();
      const loop = (now) => { const dt = Math.min(.05, (now - last) / 1000) * this.speed; last = now; if (this.vis) this.tick(dt); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    add(kind, stage, x0, y0, script) { useGeo(this.geo); const [x, y] = this.geo.pond ? dryPt(x0, y0) : [x0, y0]; const a = new Actor(this, kind, stage, x, y, script); this.actors.push(a); const S = SEASONS[this.season]; if (S && S.deco && stage === 'gross') { a.deco = [...S.deco]; a.key = ''; a.setView('front'); } return a; }
    tick(dt) {
      useGeo(this.geo); this.t += dt; this.actors.forEach((a) => a.tick(dt)); this.hooks = this.hooks.filter((h) => !h(dt));
      const pr = SEASONS[this.season] && SEASONS[this.season].part; if (pr) { this.pt += dt; if (this.pt > pr[1]) { this.pt = 0; const x = rnd(0, W); this.fx(pr[0], x, -10, { anim: 'fall', dx: rnd(-80, 80), dy: rnd(480, 560), dur: rnd(5, 8), size: pr[2] || 12, color: pick(pr[3] || ['#fff']), z: 4200 }); } }
    }
    setSeason(se) {
      useGeo(this.geo); if (this.geo.draw) { this.season = se; const S2 = SEASONS[se] || SEASONS.sommer; this.land.innerHTML = this.geo.draw(this, se); this.frozen = S2.base === 'winter';
        this.actors.forEach((a) => { a.deco = [...(a.var && a.var.deco || []), ...(a.st === 'gross' && this.outfits !== false ? S2.deco || [] : [])]; a.key = ''; a.setView(a.view || 'front'); if (this.frozen && a.mode === 'water') { a.mode = 'ground'; a.sink = 0; a.q = []; a.cur = null; const p = freeSpot(); a.x = p[0]; a.y = p[1]; a.setView('front'); } });
        if (this.geo.pool) this.setPool(!(this.frozen || this.night)); return; }
      this.season = se; const S = SEASONS[se] || SEASONS.sommer;
      this.land.innerHTML = themed(bg() + props(S.base === 'winter'), PAL[S.base]) + (S.decor ? prop(600, S.decor()) : '') + (S.base === 'winter' ? prop(1, winterExtras()) : '');
      this.dark.style.opacity = S.night ? .45 : 0;
      this.actors.forEach((a) => { a.deco = [...(a.var && a.var.deco || []), ...(a.st === 'gross' ? S.deco || [] : [])]; a.key = ''; a.setView(a.view || 'front'); if (S.base === 'winter' && a.mode === 'water') { a.mode = 'ground'; a.sink = 0; a.q = []; a.cur = null; const p = freeSpot(); a.x = p[0]; a.y = p[1]; a.setView('front'); } });
    }
    darken(secs, k) { this.dark.style.opacity = k || .6; this.hooks.push(((t) => (dt) => { t -= dt; if (t <= 0) { this.dark.style.opacity = (SEASONS[this.season] || {}).night ? .45 : 0; return true; } return false; })(secs)); }
    react(kind) { useGeo(this.geo); if (REACT[kind]) REACT[kind](this); }
    setNight(on) { useGeo(this.geo); this.night = !!on; this.dark.style.opacity = on ? .42 : 0; this.sc.classList.toggle('night', !!on); if (this.geo.pool) this.setPool(!on && !this.frozen); this.hooks = []; this.sc.querySelectorAll('.gballs').forEach((e) => e.remove()); this.actors.forEach((a) => { if (on && a.mode !== 'tree' && a.mode !== 'water') { a.q = []; a.cur = null; a.busy = 0; a.cls(''); a.rot = 0; a.sink = 0; a.tn = 0; a.el.style.opacity = ''; if (a.mode !== 'air' && a.mode !== 'perch') a.z = 0; if (a.mode === 'ice') a.mode = 'ground'; } }); }
    setPool(open) { useGeo(this.geo); this.poolOpen = !!open; this.sc.querySelectorAll('.gcover').forEach((cv) => { cv.style.opacity = open ? 0 : 1; }); if (!open) this.actors.forEach((a) => { if (a.mode === 'water') { const p = pondPt(angTo(a.x, a.y), 1.3); a.q = [T.call((b) => { b.mode = 'ground'; b.sink = 0; b.setView('front'); }), T.hopTo(p[0], p[1], 0, 18, .5, 'muss raus – Pool geht zu'), T.settle(), T.shake()]; a.cur = null; } }); }
    takeBed(a, type) { const S = this.geo.slots || {}; const list = S[type]; if (!list) return null; this.bedUse = this.bedUse || {}; const used = this.bedUse[type] || (this.bedUse[type] = []); let i = 0; while (used[i]) i += 1;
      const base = list[i % list.length]; const ex = Math.floor(i / list.length); const sk = this.geo.sk || 1; const slot = { x: base[0] + ex * 34 * sk * (ex % 2 ? 1 : -1), y: base[1] + ex * 8 * sk, z: base[2] || 0, i, type }; used[i] = a; a._bed = slot;
      const def = (this.geo.bedSvg && this.geo.bedSvg[type]) || (window.FPWORLD && window.FPWORLD.BED_SVG[type]); if (def) { const d = document.createElement('div'); d.className = 'gbed'; const w = def[0] * depth(slot.y) * sk; d.style.cssText = `left:${slot.x}px;top:${slot.y - slot.z}px;width:${w}px;z-index:${Math.round(slot.y) + (def[2] || 0)}`; d.innerHTML = def[1]; this.sc.appendChild(d); slot.el = d; }
      return slot; }
    releaseBed(a) { const s = a._bed; if (!s) return; (this.bedUse[s.type] || [])[s.i] = null; if (s.el) { const e = s.el; e.classList.add('out'); setTimeout(() => e.remove(), 700); } a._bed = null; }
    // everybody who can swim goes into the water now (if the pool/pond is open)
    swimNow() { useGeo(this.geo); if (this.poolOpen === false || this.frozen || this.night) return 0; let n = 0; this.actors.filter((x) => x.ab.swim && x.mode === 'ground' && !x.busy).forEach((x) => { x.q = T.goSwim(x).flat(); x.cur = null; n += 1; }); return n; }
    socialNow(kind, a) { useGeo(this.geo); const c = a || pick(this.actors.filter((x) => x.mode === 'ground' && !x.busy && !x.ab.always)); return c && SOCIAL[kind] ? SOCIAL[kind](c) : null; }
    fx(type, x, y, o) {
      const d = document.createElement('div'); const p = o || {}; d.className = 'gfxi ' + (p.anim || 'up');
      d.style.cssText = `left:${x}px;top:${y}px;--dx:${(p.dx || 0)}px;--dy:${(p.dy || -40)}px;--d:${(p.dur || 1.4) / this.speed}s;z-index:${p.z || 3000};color:${p.color || '#fff'}`;
      const sz = Math.max(7, (p.size || 18) * (this.geo.fxk || 1)); d.innerHTML = `<svg viewBox="-10 -10 20 20" width="${sz}" height="${sz}" overflow="visible">${FX[type]}</svg>`;
      this.fxl.appendChild(d); setTimeout(() => d.remove(), ((p.dur || 1.4) / this.speed) * 1000 + 50);
    }
    ground(kind, x, y, secs) { const k = this.geo.fxk || 1; const d = document.createElement('div'); d.className = 'gg gg-' + kind; d.style.cssText = `left:${x}px;top:${y}px;z-index:${Math.round(y)};--k:${k};--d:${(secs || 4) / this.speed}s`; d.innerHTML = GROUND[kind] || ''; this.sc.appendChild(d); setTimeout(() => d.remove(), (secs || 4) * 1000 / this.speed + 100); }
    bolt(x, y) { const k = this.geo.fxk || 1; const top = 0; const pts = []; let px = x + (Math.random() - .5) * 40 * k; for (let yy = top; yy < y; yy += (y - top) / 6) { pts.push(`${(px - x + 30).toFixed(1)},${(yy - top).toFixed(1)}`); px += (Math.random() - .5) * 26 * k; } pts.push(`30,${y - top}`);
      const d = document.createElement('div'); d.className = 'gbolt'; d.style.cssText = `left:${x - 30}px;top:${top}px;width:60px;height:${y - top}px;z-index:4500`; d.innerHTML = `<svg width="60" height="${y - top}" overflow="visible"><polyline points="${pts.join(' ')}" fill="none" stroke="#FFF7A0" stroke-width="${3 * k + 1}" stroke-linejoin="round"/><polyline points="${pts.join(' ')}" fill="none" stroke="#fff" stroke-width="${1.2 * k + .4}"/></svg>`; this.sc.appendChild(d); setTimeout(() => d.remove(), 450 / this.speed);
      this.dark.animate([{ opacity: .0, background: '#fff' }, { opacity: .35, background: '#fff' }, { opacity: 0, background: '#fff' }], { duration: 300 }); for (let i = 0; i < 6; i++) this.fx('spark', x, y - 3, { anim: 'arc', dx: rnd(-30, 30) * k, dy: rnd(-30, -6) * k, dur: .6, size: 12 }); }
    ripple(x, y, r) {
      const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      const rr = (r || 10) * (this.geo.sk || 1); e.setAttribute('cx', x); e.setAttribute('cy', y); e.setAttribute('rx', rr); e.setAttribute('ry', rr * (this.geo.rippleK || .34));
      e.setAttribute('class', 'grip'); e.style.animationDuration = (2.2 / this.speed) + 's'; this.water.appendChild(e); setTimeout(() => e.remove(), 2300 / this.speed);
    }
  }

  // ---------------------------------------------------------------- pond helpers
  // pond test: an ellipse in the garden; the header pool is a rectangle (superellipse with exponent n)
  const inPond = (x, y, k) => { const p = G.pond; if (!p) return false; const kk = k || 1; const n = p.n || 2; return Math.abs((x - p.cx) / (p.rx * kk)) ** n + Math.abs((y - p.cy) / (p.ry * kk)) ** n < 1; };
  const pondPt = (ang, k) => [G.pond.cx + Math.cos(ang) * G.pond.rx * k, G.pond.cy + Math.sin(ang) * G.pond.ry * k];
  const pondInside = () => { const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * .62; return pondPt(a, r); };
  const angTo = (x, y) => Math.atan2((y - G.pond.cy) / G.pond.ry, (x - G.pond.cx) / G.pond.rx);
  // route around the pond (and never into the house)
  // keep walkers out of the water: push a point to the shore, and test whether a straight line crosses the pond
  const dryPt = (x, y) => { const p = G.pond; if (!p || !inPond(x, y, 1.12)) return [x, y]; const ang = Math.atan2((y - p.cy) / p.ry, (x - p.cx) / p.rx); let k = 1.16; let q = [x, y]; for (let i = 0; i < 12; i++) { q = [p.cx + Math.cos(ang) * p.rx * k, p.cy + Math.sin(ang) * p.ry * k]; if (!inPond(q[0], q[1], 1.1)) break; k += .15; } return q; };
  const wetLine = (x0, y0, x1, y1) => [...Array(12)].some((_, i) => inPond(x0 + (x1 - x0) * i / 11, y0 + (y1 - y0) * i / 11, 1.05));
  const route = (x0, y0, x1, y1) => {
    let hit = false; for (let i = 1; i < 20; i++) { const t = i / 20; if (inPond(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 1.22)) { hit = true; break; } }
    if (!hit) return [[x1, y1]];
    if ((G.pond.n || 2) > 2) { // rectangular pool: go along the long side, outside the corners
      const pp = G.pond; const up = (y0 + y1) / 2 < pp.cy; const vy = pp.cy + (up ? -1 : 1) * pp.ry * 1.75; const side = x1 > x0 ? -1 : 1;
      return [[pp.cx + side * pp.rx * 1.18, vy], [pp.cx - side * pp.rx * 1.18, vy], [x1, y1]]; }
    const fl = G.pond.ry < 12 ? 1.5 : 0; // small, flat header pond: keep the detour further off the water
    const top = [G.pond.cx, G.pond.cy - G.pond.ry * (1.42 + fl)], bot = [G.pond.cx, Math.min(508, G.pond.cy + G.pond.ry * (1.36 + fl))];
    const d = (p) => Math.hypot(p[0] - x0, p[1] - y0) + Math.hypot(x1 - p[0], y1 - p[1]);
    const via = d(top) < d(bot) ? top : bot; const side = x1 > x0 ? -1 : 1;
    return [[via[0] + side * G.pond.rx * .55, via[1] + (via === top ? Math.min(8, G.pond.ry * .3) : -Math.min(6, G.pond.ry * .25))], via, [via[0] - side * G.pond.rx * .55, via[1] + (via === top ? Math.min(8, G.pond.ry * .3) : -Math.min(6, G.pond.ry * .25))], [x1, y1]].filter((p, i, a) => i === a.length - 1 || Math.sign(p[0] - x0) === Math.sign(x1 - x0) || Math.abs(p[0] - x0) > 30);
  };
  const freeSpot = () => { if (G.free) return G.free(); for (;;) { const p = [rnd(240, 960), rnd(290, 505)]; if (!inPond(p[0], p[1], 1.3) && !(p[0] > 420 && p[0] < 620 && p[1] < 290)) return p; } };

  // ---------------------------------------------------------------- the animal
  class Actor {
    constructor(sc, kind, stage, x, y, script) {
      this.sc = sc; this.k = kind; this.st = stage || 'gross'; this.ab = AB[kind] || { sp: 40, gait: 'walk', fav: { wiese: 1 } };
      this.x = x; this.y = y; this.z = 0; this.face = 1; this.rot = 0; this.sx = 1; this.sy = 1; this.sink = 0; this.v = 0; this.mood = 'froh';
      this.mode = 'ground'; this.zi = null; this.tn = 0; this.h = null; this.deco = []; this.var = null; this.q = []; this.cur = null; this.script = script || null; this.si = 0; this.label = '';
      this.el = document.createElement('div'); this.el.className = 'mv'; this.el.innerHTML = '<div class="mvi"></div><b class="mvl"></b>';
      this.inn = this.el.firstChild; this.lab = this.el.lastChild; sc.sc.appendChild(this.el); this.key = ''; this.wl = 80;
      this.setView('front');
      if (this.ab.always === 'air') { this.mode = 'air'; this.z = 60; }
    }
    setView(v, mood) {
      const m = mood || this.mood; const key = v + m + this.deco.join(); if (key === this.key) return; this.key = key; this.view = v;
      let h; const X = { noShadow: 1, ...(this.var || {}), deco: this.deco, pal: this.var && this.var.pal };
      if (v === 'front') h = P4.svg(this.k, this.st, m, { ...X, noBowl: 1 });
      else if (v === 'sit') h = P4.svg(this.k, this.st, m, { ...X, noBowl: 1, body: 'sit' });
      else if (v === 'side') h = P4.view(this.k, this.st, m, 'side', X);
      else if (v === 'back') h = P4.view(this.k, this.st, m, 'back', X);
      else if (v === 'fly') h = P4.view(this.k, this.st, m, 'flySide', X);
      else if (v === 'swim') { h = P4.view(this.k, this.st, m, 'swimSide', X); const mm = h.match(/<!--wl:([\d.]+)-->/); this.wl = mm ? +mm[1] : 80; }
      else if (v === 'climb') h = P4.view(this.k, this.st, m, 'climbNT', X);
      this.inn.innerHTML = h;
    }
    cls(list, T, F) { const c = 'mv ' + (list || ''); if (this.el.className !== c) this.el.className = c; if (T) this.el.style.setProperty('--T', (T / this.sc.speed).toFixed(3) + 's'); if (F) this.el.style.setProperty('--F', (F / this.sc.speed).toFixed(3) + 's'); }
    say(t) { this.label = t; }
    zzz(on, x, y) { if (this._z) { this._z.remove(); this._z = null; } if (!on) return; const e = document.createElement('i'); e.className = 'zzz'; e.innerHTML = '<b>z</b><b>z</b><b>Z</b>'; if (x != null) { e.style.cssText = `left:${x}px;top:${y}px;z-index:4400;font-size:${Math.max(9, 18 * (this.sc.geo.fxk || 1))}px`; e.classList.add('abs'); this.sc.sc.appendChild(e); } else this.el.appendChild(e); this._z = e; }
    bubble(txt, secs) { const b = document.createElement('i'); b.className = 'mvb'; b.textContent = txt; this.el.appendChild(b); setTimeout(() => b.remove(), (secs || 1.6) * 1000 / this.sc.speed); }
    tick(dt) {
      if (!this.cur) { if (!this.q.length) this.plan(); this.cur = this.q.shift(); this.pivot = ''; if (this.cur && this.cur.start) this.cur.start(this); if (this.cur && this.cur.label) this.say(this.cur.label); }
      const AB2 = this.var && this.var.ability && ABIL[this.var.ability];
      if (AB2) { const moving = /\bw\b|\bwf\b|\bfl\b|\bhp\b/.test(this.el.className) || this.v > 2;
        if (AB2.every && moving) { this._ad = (this._ad || 0) + Math.hypot(this.x - (this._px || this.x), this.y - (this._py || this.y)) / (G.sk || 1); if (this._ad > AB2.every / (this.abBoost || 1)) { this._ad = 0; AB2.f(this, this.sc); } }
        if (AB2.time) { this._at = (this._at == null ? rnd(...AB2.time) / (this.abBoost || 1) : this._at) - dt; if (this._at <= 0 && this.mode !== 'water') { this._at = rnd(...AB2.time) / (this.abBoost || 1); AB2.f(this, this.sc); } }
        if (AB2.aura && !this._aura) { const e = document.createElement('i'); e.className = 'abx abx-' + AB2.aura; e.innerHTML = AB2.aura === 'wolke' ? '<b></b><s></s><s></s><s></s>' : '<b></b><b></b>'; this.el.appendChild(e); this._aura = e; } }
      this._px = this.x; this._py = this.y;
      if (this.cur && this.cur.trail && Math.random() < .7) this.sc.fx('dot', this.x - this.face * 20, this.y - this.z - 40 * depth(this.y), { dy: 6, dur: 1.2, size: 11, color: ['#FF5A5A', '#FFB347', '#FFE066', '#8CE07A', '#7FD3FF', '#B58CFF'][Math.floor(this.sc.t * 12) % 6], z: 4300 });
      if (this.cur && this.cur.step(this, dt)) this.cur = null;
      this.draw();
    }
    plan() {
      if (this.script) { const s = this.script[this.si % this.script.length]; this.si += 1; this.q.push(...[].concat(s(this))); return; }
      this.q.push(...[].concat(brain(this)));
    }
    draw() {
      if (this.mode !== 'tree') this.onBr = 0;
      if (this.onBr) this.z = G.branchZ ? G.branchZ(this.x) + (this.view === 'climb' ? -40 * (G.zk || 1) : 0) : G.tree.y - (197 - (this.x - 166) * .2) + (this.view === 'climb' ? -40 : 0);
      const s = this.mode === 'tree' ? depth(G.tree.y) : depth(this.y); const w = G.base * s;
      let top;
      if (this.view === 'swim') top = this.y - w * this.wl / 100 - this.z;
      else top = this.y - w * .95 - this.z;
      const left = this.x - w / 2;
      this.el.style.width = w + 'px'; this.el.style.height = w + 'px';
      this.el.style.transform = `translate(${left.toFixed(1)}px, ${(top + this.sink * w).toFixed(1)}px)`;
      if (this.view === 'swim') { const b = w - (w * this.wl / 100 - this.sink * w); this.el.style.clipPath = `inset(-60% -60% ${Math.max(0, b).toFixed(1)}px -60%)`; }
      else if (this.sink) this.el.style.clipPath = `inset(-60% -60% ${(this.sink * w + w * .05).toFixed(1)}px -60%)`;
      else this.el.style.clipPath = '';
      const po = this.pivot || ''; if (this._po !== po) { this._po = po; this.inn.style.transformOrigin = po; }
      this.inn.style.transform = `scaleX(${this.face}) rotate(${this.rot.toFixed(1)}deg) scale(${this.sx.toFixed(3)}, ${this.sy.toFixed(3)})`;
      this.el.style.setProperty('--tn', this.tn.toFixed(3));
      this.el.style.zIndex = this.zi != null ? this.zi : this.mode === 'air' && this.z > 40 ? 2000 + Math.round(this.y) : Math.round(this.y) + (this.mode === 'water' ? 1 : 0);
      this.lab.textContent = this.sc.labels ? this.label : ''; this.lab.style.display = this.sc.labels && this.label ? '' : 'none';
    }
  }

  // ---------------------------------------------------------------- tasks
  const T = {};
  // a pause with a pose
  T.pose = (label, t, setup, each) => ({ label, t, start(a) { this.tt = 0; if (setup) setup(a); }, step(a, dt) { this.tt += dt; if (each) each(a, this.tt, dt); return this.tt >= t; } });
  T.face = (dir) => ({ step(a) { a.face = dir; return true; } });
  T.call = (fn) => ({ step(a) { fn(a); return true; } });

  // walking / hopping / waddling to a point on the ground, with turns and front/back views
  T.walk = (tx, ty, o) => {
    const opt = o || {};
    return {
      label: opt.label || 'spaziert',
      start(a) {
        if (a.mode !== 'water' && !opt.wet) { [tx, ty] = dryPt(tx, ty); } const wet = wetLine(a.x, a.y, tx, ty); this.pts = opt.direct && (!wet || a.mode === 'water') ? [[tx, ty]] : route(a.x, a.y, tx, ty); this.ph = 0; a.v = a.v || 0; this.z0 = a.mode === 'tree' ? a.z : 0;
        // heading in degrees on the ground: 0 = right, 90 = towards you, 180 = left, -90 = away from you
        if (a.h == null || a.view === 'side' || a.view === 'sit') a.h = a.view === 'back' ? -90 : a.view === 'front' || a.view === 'sit' ? 90 : a.face > 0 ? 0 : 180;
      },
      step(a, dt) {
        const [px, py] = this.pts[0]; const dx = px - a.x, dy = py - a.y; const dW = Math.hypot(dx, dy / .55); const s = depth(a.y);
        const gait = opt.gait || a.ab.gait; const run = !!opt.run; const last = this.pts.length === 1;
        // steer: turn the body smoothly towards the next point (no 90° snapping), slow down while turning
        const des = Math.atan2(dy / .55, dx) * 57.3; let err = ((des - a.h + 540) % 360) - 180;
        const R = (run ? 320 : 230) * (dW < 26 ? 2.6 : 1) * (a.ab.sp < 25 ? .6 : 1);
        a.h += clamp(err, -R * dt, R * dt); err = ((des - a.h + 540) % 360) - 180;
        if (dW < 8) a.h = des;
        let vmax = a.ab.sp * (run ? 2.1 : 1) * (opt.slow ? .5 : 1) * s * (G.sk || 1) * Math.max(.18, Math.cos(err / 57.3)) * (this.boost || 1);
        if (last) vmax = Math.min(vmax, dW * 2.2 + 6);
        a.v += clamp(vmax - a.v, -170 * dt, (run ? 140 : 70) * dt); if (a.v < 0) a.v = 0;
        // view from the heading: front / 3-4 front / side / 3-4 back / back
        const hr = a.h / 57.3; const sn = Math.sin(hr), cs = Math.cos(hr);
        let side = false;
        if (sn > .58) { a.setView('front'); a.tn = clamp(cs / .8, -1, 1) * .95; }
        else if (sn < -.58) { a.setView('back'); a.tn = clamp(cs / .8, -1, 1) * .95; }
        else { side = true; a.face = cs >= 0 ? 1 : -1; a.setView('side'); a.tn = 0; }
        // a little lean into the curve and a slight squeeze on the diagonals
        const diag = side ? Math.min(1, Math.abs(sn) / .58) : 1 - Math.min(1, (Math.abs(sn) - .58) / .42);
        const stride = (gait === 'hop' ? 34 : gait === 'waddle' ? 14 : 24) * s * (G.sk || 1) * (run ? 1.6 : 1);
        const Tc = clamp(stride / Math.max(a.v, 1), .16, 1.1);
        this.ph += dt / Tc;
        const lean = clamp(err, -40, 40) / 40 * (side ? 4 : 3);
        if (gait === 'hop') {
          const k = this.ph % 1; const air = Math.sin(Math.PI * clamp(k / .7, 0, 1));
          a.z = this.z0 + air * 12 * s * (G.sk || 1) * (run ? 1.5 : 1); a.sy = k > .82 ? 1 - .12 * Math.sin(Math.PI * (k - .82) / .18) : 1 + .05 * air; a.sx = (2 - a.sy) * (side ? 1 - .12 * diag : 1);
          a.cls(air > .2 ? 'hp' : '', Tc);
          a.rot = (side ? (k < .35 ? -8 : k < .7 ? 4 : 0) : 0) + lean;
        } else {
          a.z = this.z0; a.sy = 1; a.sx = side ? 1 - .1 * diag : 1;
          a.rot = (gait === 'waddle' ? Math.sin(this.ph * Math.PI * 2) * 7 : side ? 0 : Math.sin(this.ph * Math.PI * 2) * 2.5) + lean;
          a.cls(a.v < 2 ? '' : side ? 'w' : 'wf', Tc);
        }
        const step = Math.min(a.v * dt, dW);
        a.x += Math.cos(hr) * step; a.y += Math.sin(hr) * step * .55;
        if (dW < 2.5 || (dW < 10 && Math.abs(err) > 100)) { if (!last) { this.pts.shift(); return false; }
          a.x = px; a.y = py; a.z = this.z0; a.sx = a.sy = 1; a.rot = 0; a.v = 0; a.cls(''); a.tn = 0; if (a.view !== 'side') a.setView('front'); return true; }
        return false;
      },
    };
  };
  // short idle poses
  T.look = () => [T.pose('schaut sich um', 2.6, (a) => { a.setView('front'); a.cls(''); a.rot = 0; }, (a, t) => { a.tn = Math.sin(t * 2.4) * .95 * Math.min(1, t * 2) * Math.min(1, (2.6 - t) * 2); }), T.call((a) => { a.tn = 0; })];
  T.sniff = () => T.pose('schnuppert', rnd(1.4, 2.4), (a) => { a.setView('side'); a.cls(''); }, (a, t) => { a.rot = 10 + Math.sin(t * 14) * 3; if (t > 1.2) a.rot *= .9; });
  T.sit = (t, mood) => T.pose(mood === 'schlaeft' ? 'schläft' : 'sitzt gemütlich', t, (a) => { a.setView('sit', mood); a.cls(''); a.rot = 0; }, (a, tt) => { a.sy = 1 + Math.sin(tt * 2.4) * .015; if (mood === 'schlaeft' && !a._z) a.zzz(true); if (tt >= t - .05) a.zzz(false); });
  T.stretch = () => T.pose('streckt sich', 1.6, (a) => { a.setView('side'); a.cls(''); }, (a, t) => { const k = Math.sin(Math.min(1, t / 1.6) * Math.PI); a.sx = 1 + .14 * k; a.sy = 1 - .1 * k; a.rot = 6 * k; });
  T.shake = () => T.pose('schüttelt sich trocken', .9, (a) => { a.setView('front'); a.cls(''); for (let i = 0; i < 8; i++) a.sc.fx('drop', a.x, a.y - 40 * depth(a.y), { anim: 'arc', dx: rnd(-40, 40), dy: rnd(-30, 10), dur: .7, size: 10 }); }, (a, t) => { a.rot = Math.sin(t * 60) * 10 * (1 - t / .9); });
  T.eat = () => T.pose('frisst', 3, (a) => { a.face = a.x < G.bowl.x ? 1 : -1; a.setView('side'); a.cls(''); }, (a, t) => { a.rot = 14 * Math.max(0, Math.sin(t * 7)); if (Math.random() < .05) a.sc.fx('crumb', G.bowl.x, G.bowl.y - 16, { anim: 'arc', dx: rnd(-14, 14), dy: -12, dur: .5, size: 8 }); });
  T.drink = () => T.pose('trinkt am Teich', 2.6, (a) => { a.face = a.x < G.pond.cx ? 1 : -1; a.setView('side'); a.cls(''); }, (a, t) => { a.rot = 20 * Math.max(0, Math.sin(t * 5)); if (Math.random() < .03) a.sc.ripple(a.x + a.face * 22 * depth(a.y), a.y + 2, 6); });
  T.hopTo = (x, y, z, h, dur, label) => ({ label, start(a) { this.x0 = a.x; this.y0 = a.y; this.z0 = a.z; this.t = 0; a.setView('side'); a.face = x >= a.x ? 1 : -1; a.cls('hp'); }, step(a, dt) {
    this.t += dt / dur; const k = clamp(this.t, 0, 1); a.x = this.x0 + (x - this.x0) * k; a.y = this.y0 + (y - this.y0) * k; a.z = this.z0 + (z - this.z0) * k + Math.sin(Math.PI * k) * h; a.rot = (k < .5 ? -14 : 12) * Math.sin(Math.PI * k); const st = k < .15 ? k / .15 : k > .85 ? (1 - k) / .15 : 1; a.sx = 1 - .1 * st; a.sy = 1 + .14 * st;
    if (k >= 1) { a.rot = 0; a.sx = 1.16; a.sy = .84; a.cls(''); if (h > 12 && a.mode !== 'water') dust(a, 4); return true; } return false; } });
  // a little cloud of dust at the feet (landing, braking)
  const dust = (a, n) => { const s = depth(a.y) * (G.sk || 1); for (let i = 0; i < (n || 4); i++) a.sc.fx('puff', a.x + rnd(-14, 14) * s, a.y - 2, { anim: 'arc', dx: (i % 2 ? 1 : -1) * rnd(10, 26) * s, dy: -rnd(4, 12) * s, dur: .6, size: rnd(9, 14) * s }); };
  T.settle = () => T.pose('', .25, null, (a, t) => { const k = Math.min(1, t / .25); a.sx = 1.12 - .12 * k; a.sy = .88 + .12 * k; });

  // ---- swimming: jump in, glide in slow strokes, maybe dive, swim to the shore, climb out, shake
  T.swim = (secs) => ({
    label: 'schwimmt', start(a) { this.t = 0; this.tgt = pondInside(); this.ph = 0; this.rip = 0; this.dive = 0; a.mode = 'water'; a.setView('swim'); a.cls('sw'); a.z = 0; a.rot = 0; },
    step(a, dt) {
      this.t += dt; const s = depth(a.y);
      if (this.dive) return this.diving(a, dt);
      let dx = this.tgt[0] - a.x, dy = this.tgt[1] - a.y; let d = Math.hypot(dx, dy / .55);
      if (d < 6) { if (a.ab.dive && Math.random() < .45 && this.t < secs - 4) { this.dive = 1; this.dt = 0; this.tgt = pondInside(); a.say('taucht ab'); return false; } this.tgt = pondInside(); dx = this.tgt[0] - a.x; dy = this.tgt[1] - a.y; d = Math.hypot(dx, dy / .55); }
      // strokes: push – glide – push
      this.ph += dt / (a.k === 'ente' ? .9 : 1.25);
      const push = Math.pow(Math.max(0, Math.sin(this.ph * Math.PI * 2)), 2);
      const v = (a.ab.sp * .38 + 6) * s * (G.sk || 1) * (.35 + .65 * push);
      const nx = a.x + dx / d * v * dt, ny = a.y + dy / d * v * dt;
      if (inPond(nx, ny, .8)) { a.x = nx; a.y = ny; } else this.tgt = pondInside();
      if (Math.abs(dx) > 2) a.face = dx > 0 ? 1 : -1;
      a.z = Math.sin(this.t * 2.2) * 1.2; a.rot = -2 * push;
      this.rip += dt; if (this.rip > .75) { this.rip = 0; a.sc.ripple(a.x - a.face * 6 * s * (G.sk || 1), a.y + 3 * (G.sk || 1), 10 * s + 6); }
      return this.t > secs;
    },
    diving(a, dt) {
      this.dt += dt; const s = depth(a.y);
      if (this.dt < .9) { a.sink = clamp(this.dt / .9, 0, 1) * .62; a.rot = 22 * a.sink; if (Math.random() < .2) a.sc.fx('bubble', a.x, a.y - 4, { dy: -16, dur: .8, size: 8 }); return false; }
      if (this.dt < 2.8) { const k = (this.dt - .9) / 1.9; a.x += (this.tgt[0] - a.x) * Math.min(1, dt * 2.2); a.y += (this.tgt[1] - a.y) * Math.min(1, dt * 2.2); a.sink = .62; if (Math.random() < .08) a.sc.ripple(a.x, a.y, 5); return false; }
      if (this.dt < 3.5) { if (!this.up) { this.up = 1; a.sc.ripple(a.x, a.y, 18 * s); a.sc.fx('drop', a.x, a.y - 20 * s, { anim: 'arc', dx: 12, dy: -18, dur: .6, size: 9 }); } a.sink = .62 * (1 - (this.dt - 2.8) / .7); a.rot = -8 * (1 - a.sink); return false; }
      a.sink = 0; a.rot = 0; this.dive = 0; this.up = 0; a.say('schwimmt'); this.tgt = pondInside(); return false;
    },
  });
  T.goSwim = (a) => {
    const ang = angTo(a.x, a.y); const edge = pondPt(ang, 1.18); const inn = pondPt(ang, .7); const out = pondPt(ang + rnd(-.8, .8), 1.25);
    const wade = a.ab.swim === 'wade';
    const list = [T.walk(edge[0], edge[1], { label: 'geht zum Teich' })];
    if (wade) list.push(T.walk(inn[0], inn[1], { direct: 1, wet: 1, slow: 1, label: 'watet ins Wasser' }));
    else list.push(T.pose('schaut ins Wasser', .6, (b) => { b.face = inn[0] > b.x ? 1 : -1; b.setView('side'); b.cls(''); }, (b, t) => { b.rot = 10 * Math.sin(Math.min(1, t / .6) * Math.PI); }), T.hopTo(inn[0], inn[1], -2 * (G.sk || 1), 18 * depth(edge[1]) * (G.sk || 1), .55, 'springt rein'), T.call((b) => { const s = depth(b.y); b.sc.ripple(b.x, b.y, 26 * s); setTimeout(() => b.sc.ripple(b.x, b.y, 16 * s), 180); for (let i = 0; i < 7; i++) b.sc.fx('drop', b.x, b.y - 10, { anim: 'arc', dx: rnd(-30, 30), dy: rnd(-34, -10), dur: .6, size: 10 }); }));
    list.push(T.swim(rnd(14, 26)));
    const ex = pondPt(angTo(out[0], out[1]), .82);
    list.push({ label: 'schwimmt ans Ufer', start(b) { this.f = T.swim(99); this.f.start(b); this.f.tgt = ex; }, step(b, dt) { this.f.step(b, dt); return Math.hypot(b.x - ex[0], (b.y - ex[1]) / .55) < 10; } });
    list.push(T.call((b) => { b.mode = 'ground'; b.sink = 0; b.z = 0; }), T.hopTo(out[0], out[1], 0, 16 * depth(out[1]) * (G.sk || 1), .5, 'klettert raus'), T.settle());
    if (!wade && !['ente', 'pinguin', 'frosch', 'axolotl', 'nessie', 'robbe'].includes(a.k)) list.push(T.shake());
    return list;
  };

  // ---- flying: take-off, flap-and-glide, banking, slow landing
  const FLY = {
    bird: { F: .22, flap: [1.0, 1.6], glide: [.6, 1.2], v: 120, alt: [90, 170], wob: 4 },
    heavy: { F: .55, flap: [1.2, 1.8], glide: [1.2, 2.2], v: 110, alt: [110, 190], wob: 3 },
    insect: { F: .05, flap: [99, 99], glide: [0, 0], v: 55, alt: [40, 90], wob: 6, jit: 1 },
    humm: { F: .04, flap: [99, 99], glide: [0, 0], v: 95, alt: [50, 110], wob: 4, jit: 1 },
    flutter: { F: .32, flap: [.6, 1.0], glide: [.25, .5], v: 45, alt: [50, 120], wob: 16 },
    bat: { F: .13, flap: [99, 99], glide: [0, 0], v: 115, alt: [100, 180], wob: 12, zig: 1 },
  };
  T.fly = (tx, ty, tz, o) => {
    const opt = o || {};
    return {
      label: opt.label || 'fliegt',
      start(a) {
        const c = FLY[a.ab.fly] || FLY.bird; this.c = c; this.t = 0; this.x0 = a.x; this.y0 = a.y; this.z0 = a.z;
        const zk = G.zk || 1; const alt = (opt.alt != null ? opt.alt : rnd(c.alt[0], c.alt[1])) * zk; this.alt = Math.max(alt, tz + 30 * zk, this.z0 + 20 * zk);
        this.len = Math.hypot(tx - a.x, (ty - a.y) / .55) + Math.abs(this.alt - this.z0) + Math.abs(this.alt - tz); this.k = 0;
        this.ph = 0; this.gl = false; this.next = rnd(c.flap[0], c.flap[1]); this.px = a.x; this.pz = a.z; this.py = a.y;
        a.mode = 'air'; a.setView('fly'); a.cls('fl', null, c.F * .7);
      },
      step(a, dt) {
        const c = this.c; this.t += dt;
        const near = 1 - this.k; const slow = clamp(near * 4, .35, 1) * clamp(this.k * 6 + .4, .4, 1);
        this.k = Math.min(1, this.k + c.v * (G.sk || 1) * slow * dt / this.len);
        const e = this.k; const q = 1 - e;
        // bezier: rise, cruise, descend
        a.x = this.x0 + (tx - this.x0) * e + (c.zig ? Math.sin(this.t * 7) * 18 * Math.sin(Math.PI * e) : 0);
        a.y = this.y0 + (ty - this.y0) * e + (c.zig ? Math.cos(this.t * 5) * 10 * Math.sin(Math.PI * e) : 0);
        a.z = q * q * q * this.z0 + 3 * q * q * e * this.alt + 3 * q * e * e * this.alt + e * e * e * tz + Math.sin(this.t * (c.jit ? 9 : 2.3)) * c.wob * Math.sin(Math.PI * e);
        // flap / glide rhythm (no gliding while climbing or landing)
        this.ph += dt; const climbing = a.z - this.pz > 30 * dt; const landing = e > .82;
        if (this.ph > this.next) { this.ph = 0; this.gl = !this.gl && !climbing && !landing && c.glide[1] > 0; this.next = this.gl ? rnd(c.glide[0], c.glide[1]) : rnd(c.flap[0], c.flap[1]); }
        if (landing || climbing) this.gl = false;
        a.cls('fl' + (this.gl ? ' gl' : ''), null, c.F * (landing ? .6 : climbing ? .75 : 1));
        // facing and body tilt follow the flight path
        const svx = a.x - this.px, svy = (a.y - a.z) - (this.py - this.pz);
        if (Math.abs(svx) > .05) a.face = svx > 0 ? 1 : -1;
        const tilt = clamp(Math.atan2(svy, Math.abs(svx) + .001) * 57.3 * .45, -22, 22);
        a.rot += ((landing ? -18 * (e - .82) / .18 : 18 + tilt) * (a.ab.fly === 'insect' || a.ab.fly === 'humm' ? .3 : 1) - a.rot) * Math.min(1, dt * 5);
        this.px = a.x; this.py = a.y; this.pz = a.z;
        if (this.k >= 1) { a.z = tz; a.rot = 0; if (!opt.keep) { a.mode = tz > 2 ? 'perch' : 'ground'; a.setView('side'); a.cls(''); } return true; }
        return false;
      },
    };
  };
  T.takeoff = () => [T.pose('macht sich bereit', .35, (a) => { a.setView('side'); a.cls(''); }, (a, t) => { const k = Math.sin(Math.min(1, t / .35) * Math.PI / 2); a.sy = 1 - .14 * k; a.sx = 1 + .1 * k; }), T.call((a) => { a.sx = .92; a.sy = 1.1; })];
  // legend wings: animals that are not fliers by nature can fly a short round once they have wings
  T.wingFlight = (a, tx, ty) => { const p = tx != null ? [tx, ty] : freeSpot(); return [...T.takeoff(), T.fly(p[0], p[1], 0, { label: 'fliegt mit seinen Flügeln', alt: rnd(60, 110) }), T.landBounce()]; };
  T.landBounce = () => T.pose('landet', .45, (a) => { if (a.mode !== 'water' && a.z < 3) dust(a, 3); }, (a, t) => { const k = Math.min(1, t / .45); const w = Math.exp(-6 * k) * Math.cos(k * 14); a.sy = 1 - .16 * w; a.sx = 1 + .12 * w; });
  T.hover = (secs, label) => T.pose(label || 'schwirrt', secs, (a) => { a.setView('fly'); a.cls('fl', null, (FLY[a.ab.fly] || FLY.insect).F); }, (a, t) => { a.rot = 6 + Math.sin(t * 3) * 4; a.z += Math.sin(t * 9) * .3; a.x += Math.sin(t * 5.3) * .25; });

  // ---- climbing: every climber has its own style
  let TR = G.tree; let BR = TR.y - TR.branchY; // branch height (z)
  const useGeo = (g) => { if (G === g) return; G = g; TR = g.tree; BR = TR.y - TR.branchY; };
  T.climb = (a) => {
    const st = a.ab.climb; const base = [TR.x + 26 * (G.sk || 1), TR.y + 4 * (G.sk || 1)]; const s = depth(TR.y);
    const L = [T.walk(base[0], base[1], { label: 'geht zum Baum' }), T.pose('schaut hoch', .6, (b) => { b.setView('front'); b.cls(''); b.rot = 0; }, (b, t) => { b.sy = 1 + .03 * Math.sin(t * 6); })];
    const toTree = T.call((b) => { b.mode = 'tree'; b.x = TR.x; b.y = TR.y; b.zi = TR.y + 2; });
    const onBranch = (bx) => T.call((b) => { b.onBr = 1; b.x = TR.x + (bx - TR.x) * (G.sk || 1); b.z = BR - 2; b.mode = 'tree'; b.zi = TR.y + 3; b.rot = 0; b.setView('side'); b.face = 1; b.cls(''); });
    const down = T.call((b) => { b.onBr = 0; b.mode = 'ground'; b.zi = null; b.z = 0; b.rot = 0; b.x = TR.x + 40; b.y = TR.y + 8; b.cls(''); });
    if (st === 'cat') {
      L.push(T.pose('duckt sich', .4, (b) => { b.setView('back'); b.cls(''); }, (b, t) => { b.sy = 1 - .16 * Math.min(1, t / .3); b.sx = 2 - b.sy; }), toTree,
        { label: 'springt hoch', start(b) { this.t = 0; b.setView('climb'); b.cls('cl', .22); b.sx = b.sy = 1; }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / .38); b.z = 80 * (G.zk || 1) * (1 - Math.pow(1 - k, 3)); b.sy = 1 + .1 * Math.sin(Math.PI * k); return k >= 1; } },
        T.pose('krallt sich fest', .55, (b) => b.cls('cl', .18), (b, t) => { if (t < .4) b.z += .5; }),
        { label: 'springt auf den Ast', start(b) { this.t = 0; this.z0 = b.z; }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / .45); b.z = this.z0 + (BR + 6 - this.z0) * (1 - Math.pow(1 - k, 2)); b.x = TR.x + 30 * k * k; return k >= 1; } },
        onBranch(TR.x + 34), T.walk(TR.branchX, TR.y, { direct: 1, slow: 1, label: 'balanciert auf dem Ast' }), T.call((b) => { b.mode = 'tree'; b.z = BR - 2; }),
        T.sit(rnd(3, 6)), T.call((b) => { b.onBr = 0; b.zi = 3000; }), T.hopTo(TR.branchX + 46, TR.y + 26, 0, 12, .62, 'springt runter'), T.call((b) => { b.mode = 'ground'; b.zi = null; }), T.settle());
    } else if (st === 'squirrel') {
      // side profile on the trunk, head up; quick sprints with stops; goes round the trunk; down head first
      L.push(toTree, { label: 'huscht den Stamm hoch', start(b) { this.t = 0; this.run = 0; this.stop = 0; b.setView('side'); b.face = -1; b.rot = -6; b.x = TR.x + 27 * (G.sk || 1); this.side = 1; },
        step(b, dt) { this.t += dt;
          if (this.stop > 0) { this.stop -= dt; b.cls('', .5); b.rot = -6 * this.side + Math.sin(this.t * 20) * 1.5; if (this.stop <= 0 && Math.random() < .5) { this.side = -this.side; b.zi = TR.y - 1; setTimeout(() => { b.face = -this.side; b.x = TR.x + this.side * 27 * (G.sk || 1); b.zi = TR.y + 2; }, 260 / b.sc.speed); } return false; }
          b.cls('w', .14); b.z += 120 * (G.zk || 1) * dt; this.run += dt; if (this.run > rnd(.35, .6)) { this.run = 0; this.stop = rnd(.35, .8); }
          return b.z >= BR + 2; } },
        onBranch(TR.x + 30), T.walk(TR.branchX + 10, TR.y, { direct: 1, label: 'läuft auf den Ast' }), T.call((b) => { b.mode = 'tree'; b.z = BR - 2; }),
        T.pose('knabbert eine Nuss', 3, (b) => { b.setView('sit'); b.cls(''); }, (b, t) => { b.rot = 4 * Math.sin(t * 16); }),
        T.call((b) => { b.onBr = 0; b.zi = TR.y + 2; b.x = TR.x + 27 * (G.sk || 1); b.setView('side'); b.face = 1; b.rot = 180; b.z += 30 * (G.zk || 1); }),
        { label: 'kopfüber runter', step(b, dt) { b.cls('w', .14); b.z -= 105 * (G.zk || 1) * dt; if (Math.random() < .015) b.z += 10; return b.z <= 46 * (G.zk || 1); } },
        T.call((b) => { b.rot = 0; b.z = 8 * (G.zk || 1); b.face = 1; }),
        T.call((b) => { b.rot = 0; }), T.hopTo(TR.x + 50, TR.y + 10, 0, 10, .35, 'hüpft runter'), down, T.settle());
    } else if (st === 'hug' || st === 'hang') {
      const Tc = st === 'hang' ? 2.4 : a.k === 'koala' ? 1.3 : a.k === 'panda' ? 1.1 : .8; const up = (st === 'hang' ? 9 : a.k === 'koala' ? 26 : 34) * (G.zk || 1);
      const climbUp = { label: st === 'hang' ? 'hangelt hoch' : 'klettert hoch – Arm um Arm', start(b) { this.t = 0; b.setView('climb'); b.cls('cl', Tc); b.rot = 0; },
        step(b, dt) { this.t += dt; const ph = (this.t / Tc) % .5 / .5; b.z += up * dt * 2 * Math.pow(Math.sin(Math.PI * ph), 2); b.rot = Math.sin(this.t / Tc * Math.PI * 2) * 3; return b.z >= BR - 26; } };
      L.push(toTree, climbUp);
      if (st === 'hang') {
        L.push(T.call((b) => { b.onBr = 1; b.x = TR.x + 40; b.zi = TR.y + 3; b.setView('climb'); }),
          { label: 'hängt am Ast', start(b) { this.t = 0; b.cls('cl', 3.2); }, step(b, dt) { this.t += dt; b.x += 4 * dt * Math.pow(Math.sin(Math.PI * ((this.t / 3.2) % .5) / .5), 2) * 2; b.rot = Math.sin(this.t * .8) * 4; return b.x > TR.branchX + 20; } },
          T.pose('schläft hängend', 8, (b) => { b.cls(''); }, (b, t) => { b.rot = Math.sin(t * .6) * 5; if (!b._z) b.zzz(true); if (t > 7.9) b.zzz(false); }),
          { label: 'hangelt zurück', start(b) { this.t = 0; b.cls('cl', 3.2); }, step(b, dt) { this.t += dt; b.x -= 4 * dt * Math.pow(Math.sin(Math.PI * ((this.t / 3.2) % .5) / .5), 2) * 2; return b.x <= TR.x + 6; } },
          T.call((b) => { b.onBr = 0; b.x = TR.x; b.z = BR - 26; }));
      } else {
        L.push(onBranch(TR.x + 34), T.walk(TR.branchX, TR.y, { direct: 1, slow: 1, label: 'kriecht auf den Ast' }), T.call((b) => { b.mode = 'tree'; b.z = BR - 2; }),
          T.sit(a.k === 'koala' ? rnd(7, 11) : rnd(3, 5), a.k === 'koala' ? 'schlaeft' : 'froh'), T.walk(TR.x + 12, TR.y, { direct: 1, slow: 1, label: 'zurück zum Stamm' }), T.call((b) => { b.onBr = 0; b.mode = 'tree'; b.z = BR - 26; b.x = TR.x; }));
      }
      L.push({ label: 'klettert rückwärts runter', start(b) { this.t = 0; b.setView('climb'); b.cls('cl', Tc); }, step(b, dt) { this.t += dt; const ph = (this.t / Tc) % .5 / .5; b.z -= up * 1.2 * dt * 2 * Math.pow(Math.sin(Math.PI * ph), 2); return b.z <= 0; } }, down, T.settle());
    } else if (st === 'slow') {
      L.push(toTree, { label: 'schleicht hoch (schaukelt)', start(b) { this.t = 0; b.setView('side'); b.face = -1; b.rot = -4; b.x = TR.x + 28; },
        step(b, dt) { this.t += dt; const cyc = this.t % 2.4; if (cyc < 1.4) { b.cls(''); b.rot = -4 + Math.sin(cyc * 6) * 5; } else { b.cls('w', 1); b.z += 16 * (G.zk || 1) * dt; } return b.z >= BR + 2; } },
        onBranch(TR.x + 30), { label: 'schaukelt über den Ast', start(b) { this.t = 0; }, step(b, dt) { this.t += dt; const cyc = this.t % 2.6; if (cyc < 1.5) { b.cls(''); b.rot = Math.sin(cyc * 8) * 4; } else { b.cls('w', 1.1); b.rot = 0; b.x += 10 * dt; } return b.x >= TR.branchX + 30; } },
        T.pose('wird bunt in der Sonne', 4, (b) => { b.setView('sit'); b.cls(''); }, (b, t) => { if (Math.random() < .03) b.sc.fx('spark', b.x, TR.branchY - 30, { size: 12 }); }),
        T.call((b) => { b.onBr = 0; b.zi = TR.y + 2; b.x = TR.x + 28; b.setView('side'); b.face = 1; b.rot = 180; b.z += 30; }),
        { label: 'schleicht kopfüber runter', start(b) { this.t = 0; }, step(b, dt) { this.t += dt; const cyc = this.t % 2.4; if (cyc < 1.2) { b.cls(''); b.rot = 180 + Math.sin(cyc * 6) * 5; } else { b.cls('w', 1); b.z -= 20 * (G.zk || 1) * dt; } return b.z <= 46 * (G.zk || 1); } }, T.call((b) => { b.rot = 0; b.z = 6; }), down, T.settle());
    }
    return L;
  };

  // ---- digging, basking, meeting
  T.dig = (a) => [T.walk(G.hill.x + rnd(-20, 20), G.hill.y + 6, { label: 'geht zum Sandhügel' }),
    T.pose('gräbt ein Loch', 2.4, (b) => { b.setView('front'); b.cls(''); }, (b, t) => { b.rot = Math.sin(t * 22) * 4; if (Math.random() < .25) b.sc.fx('dirt', b.x + rnd(-6, 6), b.y - 4, { anim: 'arc', dx: rnd(-40, 40), dy: rnd(-34, -12), dur: .6, size: 8 }); }),
    T.pose('verschwindet im Loch', .8, null, (b, t) => { b.sink = Math.min(.82, t / .8 * .82); }),
    T.pose('', rnd(2, 4), null),
    T.pose('guckt raus', 1.4, null, (b, t) => { b.sink = .82 - .4 * Math.min(1, t / .4); b.face = Math.sin(t * 3) > 0 ? 1 : -1; }),
    T.pose('kommt raus', .5, null, (b, t) => { b.sink = .42 * (1 - Math.min(1, t / .5)); }),
    ...(a.k === 'erdmann' ? [T.pose('steht Wache', 3.2, (b) => { b.setView('front'); b.sink = 0; }, (b, t) => { b.sy = 1.08; b.sx = .95; b.rot = Math.sin(t * 1.4) * 3; }), T.call((b) => { b.sx = b.sy = 1; })] : [T.call((b) => { b.sink = 0; })])];
  T.bask = (a) => [T.walk(G.stone.x - 60, G.stone.y + 10, { label: 'geht zum Sonnenstein' }), T.hopTo(G.stone.x - 10, G.stone.y, G.stone.z, 16, .45, 'hüpft auf den Stein'), T.call((b) => { b.mode = 'perch'; }), T.settle(),
    T.pose('sonnt sich', rnd(4, 7), (b) => { b.setView('sit', 'stolz'); }, (b, t) => { if (Math.random() < .02) b.sc.fx('spark', b.x + rnd(-14, 14), b.y - b.z - 50 * depth(b.y), { size: 12 }); }),
    T.hopTo(G.stone.x + 50, G.stone.y + 14, 0, 12, .45, 'hüpft runter'), T.call((b) => { b.mode = 'ground'; b.setView('side', 'froh'); }), T.settle()];
  T.meet = (a) => {
    const others = a.sc.actors.filter((o) => o !== a && o.mode === 'ground' && !o.ab.always && !o.busy);
    if (!others.length) return T.look();
    const b = pick(others); const mx = clamp((a.x + b.x) / 2, 260, 940); let my = clamp((a.y + b.y) / 2, 300, 500); if (inPond(mx, my, 1.4)) my = 500;
    const s = depth(my) * 34; b.q = []; b.cur = null; b.busy = 1; a.busy = 1;
    const hi = (x) => T.pose('sagt Hallo', 2.6, (c) => { c.setView('side'); c.face = x; c.cls(''); }, (c, t) => { c.rot = 8 * Math.max(0, Math.sin(t * 6)) * (t < 1.4 ? 1 : 0); if (Math.floor(t / 1.1) !== Math.floor((t - .02) / 1.1)) c.sc.fx('heart', c.x, c.y - 70 * depth(c.y), { size: 16 }); });
    b.q.push(T.walk(mx + s, my, { label: 'trifft ein Tierchen' }), hi(-1), T.call((c) => { c.busy = 0; }));
    return [T.walk(mx - s, my, { label: 'trifft ein Tierchen' }), hi(1), T.call((c) => { c.busy = 0; })];
  };


  // ---------------------------------------------------------------- seasons and special days
  const PAL = {
    fruehling: { '#8fd3ff': '#8fd3ff', '#e3f5ff': '#eaf7ff', '#b3e08f': '#b7e59a', '#a4db7f': '#a6de88', '#9ad86f': '#a2dc78', '#6cbd4b': '#71c052', '#55ac44': '#6dbb57', '#6cc455': '#F7B6D2', '#E5483B': '#FF8FC0' },
    sommer: {},
    herbst: { '#8fd3ff': '#a9d4ee', '#e3f5ff': '#f4ebdc', '#b3e08f': '#d8c47a', '#a4db7f': '#cdb46a', '#9ad86f': '#bccb6a', '#6cbd4b': '#93a84b', '#55ac44': '#E58A3A', '#6cc455': '#F2B04A', '#E5483B': '#B8322A' },
    winter: { '#8fd3ff': '#b4cfe6', '#e3f5ff': '#f0f5fa', '#b3e08f': '#eef4fa', '#a4db7f': '#e1ebf4', '#9ad86f': '#f6f9fc', '#6cbd4b': '#dce7f1', '#55ac44': '#dfe9f2', '#6cc455': '#ffffff', '#E5483B': '#c9d6e3', 'url(#gwat)': '#d7ecf8', '#efdcac': '#e6edf4', '#5fb548': '#dfe9f2', '#FFE68A': '#fff6cf' },
  };
  const themed = (html, P) => Object.entries(P || {}).reduce((h, [a, b]) => h.split(a).join(b), html);
  const winterExtras = () => `<path d="M${G.pond.cx - 90} ${G.pond.cy - 10} l40 14 l30 -8 M${G.pond.cx + 20} ${G.pond.cy + 24} l40 -10 l26 12" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/><path d="M432 200 L520 126 L608 200 L600 204 L520 140 L440 204z" fill="#fff"/>`;
  const egg = (x, y, c) => `<ellipse cx="${x}" cy="${y - 8}" rx="7" ry="9" fill="${c}"/><path d="M${x - 7} ${y - 9} q3.5 -3 7 0 t7 0" stroke="#fff" stroke-width="1.6" fill="none"/>`;
  const EGGS = [[262, 334], [650, 306], [388, 506], [930, 470], [214, 430]];
  const SNOWMAN = [360, 392]; const LEAVES = [182, 474]; const GIFTS = [[216, 356], [246, 366]];
  const SEASONS = {
    alltag: { base: 'sommer' },
    fruehling: { base: 'fruehling', deco: ['blumenkranz'], part: ['petal', .5, 12], decor: () => [[230, 470], [610, 500], [980, 440]].map(([x, y]) => `<path d="M${x} ${y} v-20" stroke="#4c9a38" stroke-width="3"/><path d="M${x - 6} ${y - 30} q6 -6 12 0 v8 q-6 5 -12 0z" fill="#FF6F91"/>`).join('') },
    ostern: { base: 'fruehling', deco: ['hasenohren'], decor: () => EGGS.map(([x, y], i) => egg(x, y, ['#FF8FB0', '#7FD3FF', '#FFD34D', '#B58CFF', '#8CE07A'][i])).join('') },
    sommer: { base: 'sommer', deco: ['sonnenbrille'], decor: () => `<path d="M630 350 v-70" stroke="#8a5a34" stroke-width="3"/><path d="M584 288 Q630 246 676 288z" fill="#FF6F91"/><path d="M600 288 Q630 260 660 288" fill="#fff" opacity=".5"/><circle cx="${G.pond.cx + 60}" cy="${G.pond.cy - 6}" r="13" fill="#fff"/><path d="M${G.pond.cx + 47} ${G.pond.cy - 6} a13 13 0 0 1 26 0z" fill="#FF5A5A"/>` },
    august: { base: 'sommer', deco: ['fahne'], decor: () => `<path d="M440 200 Q520 230 600 200" stroke="#888" stroke-width="1" fill="none"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 452 + i * 23, y = 206 + Math.sin(i / 6 * Math.PI) * 13; return `<rect x="${x - 6}" y="${y}" width="12" height="12" fill="#E5302D"/><path d="M${x - 1.2} ${y + 2.5} h2.4 v2.5 h2.5 v2.4 h-2.5 v2.5 h-2.4 v-2.5 h-2.5 v-2.4 h2.5z" fill="#fff"/>`; }).join('')}` },
    herbst: { base: 'herbst', deco: ['blatt'], part: ['leaf', .45, 14, ['#E58A3A', '#F2B04A', '#C2552A']], decor: () => `<ellipse cx="${LEAVES[0]}" cy="${LEAVES[1] - 8}" rx="48" ry="16" fill="#E58A3A"/><ellipse cx="${LEAVES[0] - 10}" cy="${LEAVES[1] - 16}" rx="30" ry="10" fill="#F2B04A"/><circle cx="640" cy="500" r="14" fill="#F08A24"/><path d="M640 486 v-6" stroke="#5a3" stroke-width="3"/><circle cx="672" cy="506" r="10" fill="#F5A040"/>` },
    winter: { base: 'winter', deco: ['muetze', 'schal'], part: ['snow', .12, 9], decor: () => snowman() },
    weihnachten: { base: 'winter', deco: ['nikolaus'], part: ['snow', .15, 9], decor: () => snowman() + `<g>${[...Array(9)].map((_, i) => `<circle cx="${440 + i * 20}" cy="${200 - (i < 5 ? i * 16 : (8 - i) * 16) + 2}" r="3.4" fill="${['#FF5A5A', '#FFD34D', '#7FD3FF', '#8CE07A'][i % 4]}"/>`).join('')}</g>` + GIFTS.map(([x, y], i) => `<rect x="${x - 10}" y="${y - 18}" width="20" height="18" rx="2" fill="${['#E5483B', '#3A86C8'][i]}"/><path d="M${x} ${y - 18} v18 M${x - 10} ${y - 9} h20" stroke="#FFD34D" stroke-width="3"/>`).join('') },
    silvester: { base: 'winter', deco: ['zylinder'], night: 1, part: ['snow', .3, 7], decor: () => `<g fill="#fff">${[...Array(18)].map(() => `<circle cx="${rnd(0, 1000).toFixed(0)}" cy="${rnd(10, 180).toFixed(0)}" r="${rnd(.8, 2).toFixed(1)}"/>`).join('')}</g>` },
    fasnacht: { base: 'winter', deco: ['maske'], part: ['conf', .08, 10, ['#FF4FA3', '#FFD34D', '#7FD3FF', '#8CE07A', '#B58CFF']], decor: () => `<path d="M440 200 Q480 230 520 210 Q560 230 600 200" stroke="#FF4FA3" stroke-width="3" fill="none"/><path d="M450 204 Q490 236 520 216 Q556 236 594 204" stroke="#FFD34D" stroke-width="3" fill="none"/>` },
    geburtstag: { base: 'sommer', deco: ['partyhut'], part: ['conf', .3, 9, ['#FF4FA3', '#FFD34D', '#7FD3FF']], decor: () => [[-16, '#FF6F91'], [0, '#7FD3FF'], [16, '#FFD34D']].map(([dx, c]) => `<path d="M930 ${G.post.y - G.post.z} q${dx / 2} -40 ${dx} -80" stroke="#888" stroke-width="1" fill="none"/><ellipse cx="${930 + dx}" cy="${G.post.y - G.post.z - 96}" rx="14" ry="17" fill="${c}"/>`).join('') },
    liebe: { base: 'fruehling', deco: ['herzreif'], part: ['heart', .45, 14], decor: () => '' },
  };
  const snowman = () => `<circle cx="${SNOWMAN[0]}" cy="${SNOWMAN[1] - 16}" r="18" fill="#fff"/><circle cx="${SNOWMAN[0]}" cy="${SNOWMAN[1] - 44}" r="13" fill="#fff"/><circle cx="${SNOWMAN[0] - 4}" cy="${SNOWMAN[1] - 47}" r="1.6" fill="#222"/><circle cx="${SNOWMAN[0] + 4}" cy="${SNOWMAN[1] - 47}" r="1.6" fill="#222"/><path d="M${SNOWMAN[0]} ${SNOWMAN[1] - 43} l9 2 l-9 2z" fill="#F08A24"/><path d="M${SNOWMAN[0] - 12} ${SNOWMAN[1] - 34} h24" stroke="#E5483B" stroke-width="4"/>`;
  // seasonal things the animals like to do
  T.slide = (a) => { const ang = angTo(a.x, a.y); const e = pondPt(ang, 1.15); const o = pondPt(ang + Math.PI + rnd(-.5, .5), .8); const o2 = pondPt(ang + Math.PI, 1.2);
    return [T.walk(e[0], e[1], { label: 'geht zum zugefrorenen Teich' }), { label: 'rutscht übers Eis', start(b) { this.t = 0; this.x0 = b.x; this.y0 = b.y; b.mode = 'ice'; b.face = o[0] > b.x ? 1 : -1; b.setView('side'); b.cls(''); }, step(b, dt) { this.t += dt; const k = 1 - Math.pow(1 - Math.min(1, this.t / 2.6), 2.4); b.x = this.x0 + (o[0] - this.x0) * k; b.y = this.y0 + (o[1] - this.y0) * k; b.rot = Math.sin(this.t * 7) * 7 * (1 - k); b.sx = 1.04; return this.t >= 2.6; } },
      T.call((b) => { b.mode = 'ground'; b.sx = 1; b.rot = 0; }), T.walk(o2[0], o2[1], { label: 'tapst vorsichtig vom Eis', slow: 1, direct: 1 })]; };
  T.snowman = () => [T.walk(SNOWMAN[0] + 34, SNOWMAN[1] + 6, { label: 'geht zum Schneemann' }), T.pose('baut am Schneemann', 3, (b) => { b.setView('front'); b.cls(''); }, (b, t) => { b.rot = Math.sin(t * 9) * 5; if (Math.random() < .15) b.sc.fx('snow', SNOWMAN[0] + rnd(-16, 16), SNOWMAN[1] - rnd(10, 50), { anim: 'arc', dx: rnd(-20, 20), dy: -14, dur: .6, size: 8 }); })];
  T.leaves = () => [T.walk(LEAVES[0] + 70, LEAVES[1], { label: 'rennt zum Laubhaufen', run: 1 }), T.hopTo(LEAVES[0], LEAVES[1], 0, 30, .6, 'springt ins Laub!'), T.call((b) => { for (let i = 0; i < 14; i++) b.sc.fx('leaf', LEAVES[0] + rnd(-20, 20), LEAVES[1] - 14, { anim: 'arc', dx: rnd(-60, 60), dy: rnd(-70, -20), dur: 1.1, size: 14, color: pick(['#E58A3A', '#F2B04A', '#C2552A']) }); }), T.pose('versteckt sich im Laub', 2, (b) => { b.setView('sit'); }, (b, t) => { b.sink = .35 * Math.min(1, t * 3); }), T.call((b) => { b.sink = 0; }), T.settle()];
  T.eggs = () => { const e = pick(EGGS); return [T.walk(e[0] + 26, e[1] + 4, { label: 'sucht Ostereier' }), T.sniff(), T.pose('hat ein Ei gefunden!', 1.4, (b) => { b.setView('front', 'freut'); b.sc.fx('spark', e[0], e[1] - 20, { size: 16 }); }), T.call((b) => b.setView('front', 'froh'))]; };
  T.gift = () => { const g = pick(GIFTS); return [T.walk(g[0] + 40, g[1] + 8, { label: 'schaut die Geschenke an' }), T.sniff(), T.pose('freut sich', 1.4, (b) => { b.setView('front', 'freut'); b.sc.fx('spark', g[0], g[1] - 30, { size: 16 }); }), T.call((b) => b.setView('front', 'froh'))]; };
  T.dance = (secs) => T.pose('tanzt', secs || 4, (b) => { b.setView('front', 'freut'); b.cls(''); }, (b, t) => { const s = depth(b.y); b.z = Math.abs(Math.sin(t * 6)) * 9 * s; b.rot = Math.sin(t * 3) * 9; b.tn = Math.sin(t * 3) * .7; if (Math.floor(t / .8) !== Math.floor((t - .02) / .8)) b.sc.fx('note', b.x + rnd(-16, 16), b.y - 70 * s, { size: 14 }); });
  T.shiver = () => T.pose('friert ein bisschen', 1.6, (b) => { b.setView('front'); }, (b, t) => { b.rot = Math.sin(t * 50) * 2.5; });

  // ---------------------------------------------------------------- reactions to the tap animations
  const SCARED = ['hund', 'katze', 'hase', 'maus', 'hamster', 'igel', 'reh'];
  const intr = (a, tasks) => { if (a.mode !== 'ground' && a.mode !== 'perch') return false; a.q = [].concat(...tasks.map((t) => [].concat(t))); a.cur = null; a.sink = 0; a.rot = 0; a.tn = 0; a.busy = 0; a.cls(''); a.el.style.opacity = ''; return true; };
  const wonder = (secs) => [T.pose('staunt', secs, (b) => { b.setView('front', 'freut'); b.cls(''); }, (b, t) => { b.tn = Math.sin(t * 1.3) * .8; b.sy = 1 + .03 * Math.sin(t * 4); }), T.call((b) => { b.tn = 0; b.sy = 1; b.setView('front', 'froh'); })];
  const REACT = {
    feuerwerk(sc) {
      sc.darken(7, .6); let t = 0, n = 0;
      sc.hooks.push((dt) => { t += dt; if (t > .45 && n < 14) { t = 0; n += 1; const x = rnd(120, 900), y = rnd(50, 190), c = pick(['#FF4FA3', '#FFD34D', '#7FD3FF', '#8CE07A', '#B58CFF']); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; sc.fx('dot', x, y, { anim: 'arc', dx: Math.cos(a) * 60, dy: Math.sin(a) * 60 - 30, dur: 1.2, size: 10, color: c, z: 4600 }); } } return n >= 14 && t > 1.5; });
      sc.actors.forEach((a) => { if (SCARED.includes(a.k)) intr(a, [T.walk(G.nest.x + rnd(-10, 40), G.nest.y - 4, { run: 1, label: 'versteckt sich im Nest' }), T.sit(5, 'muede')]); else intr(a, wonder(6)); });
    },
    ufo(sc) {
      const cand = sc.actors.filter((a) => a.mode === 'ground'); if (!cand.length) return; const v = pick(cand);
      const u = document.createElement('div'); u.className = 'gufo'; u.innerHTML = '<svg viewBox="-40 -20 80 40" width="110" height="55"><ellipse cx="0" cy="4" rx="38" ry="10" fill="#9aa3b2"/><ellipse cx="0" cy="-2" rx="18" ry="12" fill="#bfe8ff" opacity=".85"/><g fill="#FFD34D"><circle cx="-22" cy="6" r="3"/><circle cx="0" cy="9" r="3"/><circle cx="22" cy="6" r="3"/></g></svg><i></i>';
      sc.sc.appendChild(u); const top = v.y - 300; u.style.transform = `translate(${v.x - 1100}px, ${top - 60}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { u.style.transform = `translate(${v.x - 55}px, ${top}px)`; }));
      setTimeout(() => u.classList.add('beam'), 1600 / sc.speed);
      intr(v, [T.pose('schaut hoch – was ist das?', 1.8, (b) => { b.setView('front', 'freut'); }, (b, t) => { b.tn = Math.sin(t * 4) * .5; }),
        T.pose('wird hochgebeamt!', 2.4, (b) => { b.zi = 4400; }, (b, t) => { b.z = 200 * Math.pow(t / 2.4, 1.6); b.rot = t * 300; b.el.style.opacity = String(1 - Math.max(0, t - 1.8) / .6); }),
        T.pose('ist im Ufo …', 1.6, null, null),
        T.call((b) => { u.classList.remove('beam'); u.style.transform = `translate(${v.x + 1200}px, ${top - 80}px)`; setTimeout(() => u.remove(), 2500); b.el.style.opacity = ''; b.z = 160; b.rot = 0; }),
        T.pose('kommt glitzernd zurück', 1.4, (b) => { b.setView('front', 'stolz'); }, (b, t) => { b.z = 160 * (1 - t / 1.4); if (Math.random() < .3) b.sc.fx('spark', b.x + rnd(-20, 20), b.y - b.z - 40, { size: 12 }); }),
        T.call((b) => { b.z = 0; b.zi = null; }), T.landBounce(), T.call((b) => b.setView('front', 'froh'))]);
      sc.actors.forEach((a) => { if (a !== v) intr(a, wonder(5)); });
    },
    wind(sc) {
      const w = document.createElement('div'); w.className = 'gwind'; w.innerHTML = '<svg viewBox="0 0 80 160" width="90" height="180"><g fill="none" stroke="#e8f2f8" stroke-width="5" stroke-linecap="round" opacity=".85"><path d="M10 10 Q40 0 70 10"/><path d="M16 40 Q40 30 64 40"/><path d="M22 70 Q40 62 58 70"/><path d="M28 100 Q40 94 52 100"/><path d="M33 128 Q40 124 47 128"/></g></svg>';
      sc.sc.appendChild(w); let x = -60; const caught = new Set();
      sc.hooks.push((dt) => { x += 170 * dt; w.style.transform = `translate(${x - 45}px, 300px)`; if (Math.random() < .3) sc.fx('leaf', x + rnd(-20, 20), rnd(320, 470), { anim: 'arc', dx: rnd(20, 80), dy: rnd(-90, -30), dur: 1, size: 12, color: pick(['#6cc455', '#F2B04A']) });
        sc.actors.forEach((a) => { if (!caught.has(a) && Math.abs(a.x - x) < 50 && a.mode === 'ground') { caught.add(a); intr(a, [T.pose('wirbelt im Wind!', 1.8, (b) => { b.setView('front', 'freut'); }, (b, t) => { b.z = Math.sin(Math.PI * t / 1.8) * 50 * depth(b.y); b.rot = t * 540; b.x += 50 * (1 / 60); }), T.call((b) => { b.rot = 0; b.z = 0; }), T.landBounce(), T.shake()]); } });
        if (x > W + 80) { w.remove(); return true; } return false; });
    },
    blasen(sc) {
      for (let i = 0; i < 16; i++) setTimeout(() => sc.fx('bubble', rnd(150, 900), rnd(330, 500), { dy: -rnd(160, 300), dx: rnd(-40, 40), dur: rnd(4, 7), size: rnd(22, 40), z: 4300 }), i * 220 / sc.speed);
      sc.actors.forEach((a) => { if (Math.random() < .75) { const p = freeSpot(); intr(a, [T.walk(p[0], p[1], { run: 1, label: 'jagt Seifenblasen' }), T.pose('fängt eine Blase', .7, (b) => { b.setView('front', 'freut'); }, (b, t) => { b.z = Math.sin(Math.PI * t / .7) * 26 * depth(b.y); if (t > .3 && !b._pp) { b._pp = 1; b.sc.fx('spark', b.x, b.y - 80 * depth(b.y), { size: 16 }); } }), T.call((b) => { b._pp = 0; b.z = 0; b.setView('front', 'froh'); }), T.settle()]); } else intr(a, wonder(4)); });
    },
    nacht(sc) {
      sc.darken(12, .55); let t = 0;
      sc.hooks.push((dt) => { t += dt; if (Math.random() < .25) sc.fx('fly', rnd(60, 960), rnd(260, 500), { dx: rnd(-40, 40), dy: rnd(-40, 20), dur: 2.4, size: 14, z: 4500 }); return t > 11; });
      sc.actors.forEach((a) => {
        if (a.mode === 'water') { a.q = [T.pose('döst im Wasser', 9, (b) => b.setView('swim', 'schlaeft')), T.call((b) => b.setView('swim', 'froh'))]; a.cur = null; return; }
        if (a.mode === 'tree' || a.mode === 'air') return;
        intr(a, [T.walk(G.nest.x + rnd(0, 170), rnd(440, 500), { label: 'geht schlafen' }), T.sit(8, 'schlaeft'), T.stretch()]);
      });
    },
    konzert(sc) {
      let t = 0; sc.hooks.push((dt) => { t += dt; if (Math.random() < .12) sc.fx('note', rnd(560, 920), rnd(360, 460), { size: 16, dy: -60, z: 4500 }); return t > 6; });
      sc.actors.forEach((a) => intr(a, [T.dance(5.5), T.call((b) => { b.z = 0; b.rot = 0; b.tn = 0; b.setView('front', 'froh'); })]));
    },
    schneeball(sc) {
      const b = document.createElement('div'); b.className = 'gball'; sc.sc.appendChild(b); let x = -60, r = 18; const y = 455;
      sc.hooks.push((dt) => { x += 150 * dt; r = Math.min(70, r + 10 * dt); b.style.cssText = `width:${2 * r}px;height:${2 * r}px;transform:translate(${x - r}px, ${y - 2 * r}px) rotate(${x * 2}deg)`;
        sc.actors.forEach((a) => { if (a.mode === 'ground' && !a._dodge && Math.abs(a.x - x) < 70 + r && a.x > x) { a._dodge = 1; const ny = clamp(a.y + (a.y < y ? -70 : 60), 290, 505); intr(a, [T.hopTo(a.x + 30, ny, 0, 28, .45, 'springt zur Seite!'), T.settle(), T.call((c) => { c._dodge = 0; }), ...wonder(2)]); } });
        if (x > W + 100) { b.remove(); return true; } return false; });
    },
    schmetterlinge(sc) {
      for (let i = 0; i < 26; i++) setTimeout(() => sc.fx('leaf', rnd(100, 900), rnd(250, 480), { dx: rnd(-160, 160), dy: rnd(-200, -60), dur: rnd(3, 5), size: 16, color: pick(['#FF8FC8', '#B58CFF', '#FFD34D', '#7FD3FF']), z: 4300 }), i * 120 / sc.speed);
      sc.actors.forEach((a) => { const p = freeSpot(); intr(a, [T.walk(p[0], p[1], { run: 1, label: 'jagt Schmetterlinge' }), T.pose('hüpft nach einem', .6, (b) => b.setView('front', 'freut'), (b, t) => { b.z = Math.sin(Math.PI * t / .6) * 22 * depth(b.y); }), T.call((b) => { b.z = 0; b.setView('front', 'froh'); })]); });
    },
    regenbogen(sc) {
      const r = document.createElement('div'); r.className = 'grain'; sc.sc.appendChild(r); setTimeout(() => r.remove(), 6000 / sc.speed);
      sc.actors.forEach((a) => { a.el.classList.add('rbow'); setTimeout(() => a.el.classList.remove('rbow'), 5000 / sc.speed); intr(a, wonder(4)); });
    },
    finsternis(sc) {
      sc.darken(6, .7); sc.actors.forEach((a) => intr(a, [T.pose('gähnt', 1, (b) => b.setView('front', 'muede')), T.sit(4, 'schlaeft'), T.pose('wacht auf – hell!', 1.2, (b) => b.setView('front', 'freut'), (b, t) => { b.sy = 1 + .05 * Math.sin(t * 8); }), T.call((b) => { b.sy = 1; b.setView('front', 'froh'); })]));
    },
    kueken(sc) {
      const ch = [0, 1, 2, 3].map((i) => sc.add('ente', 'baby', -40 - i * 46, 470, [() => [T.walk(1100, 470, { direct: 1, label: i ? '' : 'Küken-Parade!' }), T.call((c) => { c.el.remove(); sc.actors = sc.actors.filter((q) => q !== c); })]]));
      sc.actors.filter((a) => !ch.includes(a) && a.mode === 'ground').slice(0, 6).forEach((a, i) => intr(a, [T.pose('schaut', .4 + i * .7, (b) => b.setView('front', 'freut')), T.walk(30, 485 - (i % 2) * 18, { label: 'läuft hinter den Küken her' }), T.walk(1060, 485 - (i % 2) * 18, { direct: 1, label: 'Parade!' }), T.call((b) => { b.x = rnd(700, 900); b.y = rnd(300, 340); })]));
    },
    rampe(sc) {
      for (let i = 0; i < 20; i++) setTimeout(() => sc.fx('dot', rnd(470, 570), rnd(240, 262), { anim: 'arc', dx: rnd(-60, 60), dy: rnd(-40, 0), dur: 1, size: 12, color: '#d9d9d9', z: 4300 }), i * 80 / sc.speed);
      sc.actors.forEach((a) => { const away = [a.x < 520 ? rnd(40, 200) : rnd(820, 980), rnd(420, 505)]; intr(a, [T.pose('erschrickt!', .5, (b) => b.setView('front', 'sauer'), (b, t) => { b.z = Math.sin(Math.PI * t / .5) * 14; }), T.call((b) => { b.z = 0; }), T.walk(away[0], away[1], { run: 1, label: 'rennt weg!' }), ...wonder(3), T.walk(rnd(380, 660), rnd(300, 380), { label: 'kommt neugierig zurück' })]); });
    },
    sterne(sc) {
      sc.darken(8, .55); let t = 0; sc.hooks.push((dt) => { t += dt; if (Math.random() < .06) { const x = rnd(100, 700), y = rnd(20, 120); for (let i = 0; i < 6; i++) sc.fx('spark', x + i * 16, y + i * 6, { dx: 150, dy: 60, dur: .9, size: 10 - i, z: 4600 }); } return t > 8; });
      sc.actors.forEach((a) => { if (a.ab.fly && a.mode !== 'water') { a.q = [...(a.mode === 'air' ? [] : T.takeoff()), T.fly(rnd(250, 850), rnd(300, 450), 160, { label: 'fliegt den Sternen nach', keep: 1, alt: 200 }), T.fly(...freeSpot(), 0, { label: 'landet' }), T.landBounce()]; a.cur = null; } else intr(a, wonder(7)); });
    },
    naschen(sc) {
      const cx = 560, cy = 440; for (let i = 0; i < 22; i++) setTimeout(() => sc.fx(pick(['dot', 'apple', 'crumb']), cx + rnd(-60, 60), 200, { anim: 'arc', dx: rnd(-40, 40), dy: cy - 230 + rnd(-10, 20), dur: 1, size: 14, color: pick(['#FF4FA3', '#FFD34D', '#7FD3FF', '#8CE07A']), z: 4300 }), i * 70 / sc.speed);
      sc.actors.forEach((a, i) => { const ang = i * 2.4; intr(a, [T.walk(cx + Math.cos(ang) * 70, cy + Math.sin(ang) * 30, { run: 1, label: 'rennt zu den Süssigkeiten' }), T.pose('nascht', 3, (b) => { b.face = b.x < cx ? 1 : -1; b.setView('side', 'freut'); }, (b, t) => { b.rot = 12 * Math.max(0, Math.sin(t * 8)); }), T.call((b) => b.setView('front', 'stolz'))]); });
    },
    drache(sc) {
      const d = sc.add('drache', 'gross', -80, 320, [() => [T.fly(1100, 360, 170, { label: 'Freundlicher Drache', keep: 1, alt: 190 }), T.call((c) => { c.el.remove(); sc.actors = sc.actors.filter((q) => q !== c); })]]); d.mode = 'air'; d.z = 170;
      sc.actors.forEach((a) => { if (a === d) return; if (a.k === 'drache' || a.k === 'pegasus' || a.k === 'greif') { a.q = [...(a.mode === 'air' ? [] : T.takeoff()), T.fly(rnd(600, 900), rnd(300, 380), 150, { label: 'fliegt mit dem Drachen', keep: 1, alt: 180 }), T.fly(...freeSpot(), 0, { label: 'landet' }), T.landBounce()]; a.cur = null; } else intr(a, [T.pose('winkt dem Drachen', 3, (b) => b.setView('front', 'freut'), (b, t) => { b.rot = Math.sin(t * 9) * 8; }), T.call((b) => { b.rot = 0; })]); });
    },
    hyperraum(sc) {
      const h = document.createElement('div'); h.className = 'ghyp'; sc.sc.appendChild(h); setTimeout(() => h.remove(), 1600 / sc.speed);
      sc.actors.forEach((a) => intr(a, [T.pose('purzelt um!', .9, (b) => b.setView('front', 'sauer'), (b, t) => { b.rot = Math.min(90, t * 300) * (b.x < 500 ? -1 : 1); }), T.pose('', .6, null, null), T.pose('steht wieder auf', .5, null, (b, t) => { b.rot = 90 * (1 - t / .5) * (b.x < 500 ? -1 : 1); }), T.call((b) => { b.rot = 0; }), T.shake()]));
    },
    gespenster(sc) {
      sc.darken(8, .6); for (let i = 0; i < 5; i++) setTimeout(() => { const g = document.createElement('div'); g.className = 'gghost'; g.style.left = rnd(100, 800) + 'px'; g.style.top = rnd(160, 320) + 'px'; sc.sc.appendChild(g); setTimeout(() => g.remove(), 4000 / sc.speed); }, i * 700 / sc.speed);
      sc.actors.forEach((a) => { if (SCARED.includes(a.k)) intr(a, [T.walk(G.nest.x + rnd(-10, 40), G.nest.y - 4, { run: 1, label: 'versteckt sich' }), T.sit(5, 'muede')]); else intr(a, [T.pose('schaut mutig', 5, (b) => b.setView('front', 'stolz'), (b, t) => { b.tn = Math.sin(t * 1.5) * .9; }), T.call((b) => { b.tn = 0; b.setView('front', 'froh'); })]); });
    },
    // the daily wheel spin brings food and drink for every animal
    futter(sc) {
      for (let i = 0; i < 16; i++) setTimeout(() => sc.fx(pick(['apple', 'crumb', 'dot']), G.bowl.x + rnd(-16, 16), 120, { anim: 'arc', dx: rnd(-10, 10), dy: G.bowl.y - 140, dur: .9, size: 12, color: '#d9a25a', z: 4300 }), i * 80 / sc.speed);
      sc.ripple(G.pond.cx - 120, G.pond.cy, 30);
      sc.actors.forEach((a, i) => { const ang = i * 2.2;
        if (a.mode === 'water') return; if (a.ab.always === 'air') { a.q = [T.fly(G.bowl.x + Math.cos(ang) * 40, G.bowl.y, 40, { label: 'holt sich Futter', keep: 1 }), T.hover(1.5, 'nascht')]; a.cur = null; return; }
        intr(a, [T.walk(G.bowl.x + Math.cos(ang) * (60 + i * 6), G.bowl.y - 10 + Math.sin(ang) * 18, { run: 1, label: 'rennt zum Futter!' }), T.eat(), T.pose('ist satt', 1.4, (b) => b.setView('front', 'freut')), ...(i % 2 ? [] : [(() => { const e = pondPt(Math.PI * .9 + i * .1, 1.16); return T.walk(e[0], e[1], { label: 'geht trinken' }); })(), T.drink()]), T.call((b) => b.setView('front', 'froh'))]); });
    },
  };
  // special moves of the Fabelwesen (only won on the wheel)
  const SPECIAL = {
    pegasus: { n: 'Regenbogenflug', t: (a) => [...T.takeoff(), { ...T.fly(...freeSpot(), 0, { label: 'Regenbogenflug!', alt: 170 }), trail: 1 }, T.landBounce()] },
    phoenix: { n: 'Feuerkreis', t: () => [T.pose('Feuerkreis!', 2.4, (b) => b.setView('front', 'stolz'), (b, t) => { for (let i = 0; i < 2; i++) { const q = t * 6 + i * Math.PI; b.sc.fx('dot', b.x + Math.cos(q) * 40, b.y - 40 - b.z + Math.sin(q) * 14, { dy: -30, dur: .7, size: 12, color: pick(['#FF8A3D', '#FFD34D', '#E5483B']), z: 4300 }); } b.z = Math.sin(Math.PI * t / 2.4) * 24; }), T.call((b) => { b.z = 0; })] },
    greif: { n: 'Sturzflug', t: (a) => [...T.takeoff(), T.fly(a.x, a.y - 30, 220, { label: 'steigt hoch', keep: 1, alt: 230 }), { label: 'Sturzflug!', start(b) { this.t = 0; this.z0 = b.z; b.cls('fl gl', null, .3); }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / .8); b.z = this.z0 * (1 - k * k); b.rot = 60 * (1 - k); if (Math.random() < .5) b.sc.fx('dot', b.x, b.y - b.z - 30, { dy: -30, dur: .4, size: 8, color: '#fff', z: 4300 }); return k >= 1; } }, T.call((b) => { b.mode = 'ground'; b.rot = 0; b.setView('side'); b.cls(''); }), T.landBounce()] },
    kitsune: { n: 'Fuchsfeuer', t: () => [T.pose('Fuchsfeuer!', 3, (b) => b.setView('front', 'stolz'), (b, t) => { const s = depth(b.y); for (let i = 0; i < 3; i++) { const q = t * 3 + i * 2.09; if (Math.random() < .5) b.sc.fx('dot', b.x + Math.cos(q) * 46 * s, b.y - 50 * s + Math.sin(q) * 18 * s, { dy: -14, dur: .5, size: 14, color: '#7FD3FF', z: 4300 }); } })] },
    yeti: { n: 'Schneestampfer', t: () => [T.pose('stampft!', 1.6, (b) => b.setView('front', 'freut'), (b, t) => { const k = (t * 3) % 1; b.z = Math.sin(Math.PI * k) * 10; if (k < .1) { b.sc.ripple(b.x, b.y, 10); for (let i = 0; i < 4; i++) b.sc.fx('snow', b.x + rnd(-30, 30), b.y - 6, { anim: 'arc', dx: rnd(-50, 50), dy: rnd(-40, -10), dur: .7, size: 9 }); } }), T.call((b) => { b.z = 0; for (let i = 0; i < 18; i++) b.sc.fx('snow', b.x + rnd(-120, 120), b.y - 220, { anim: 'fall', dx: rnd(-20, 20), dy: 230, dur: rnd(2, 3.4), size: 9, z: 4300 }); })] },
    nessie: { n: 'Riesenwelle', t: (a) => a.mode === 'water' ? [{ label: 'taucht ab …', start(b) { this.t = 0; }, step(b, dt) { this.t += dt; b.sink = Math.min(.62, this.t / 1.2 * .62); return this.t > 1.6; } }, T.call((b) => { const p = pondInside(); b.x = p[0]; b.y = p[1]; }), T.pose('', 1, null, null), T.call((b) => { b.sink = 0; b.sc.ripple(b.x, b.y, 40); b.sc.ripple(b.x, b.y, 24); for (let i = 0; i < 12; i++) b.sc.fx('drop', b.x, b.y - 30, { anim: 'arc', dx: rnd(-60, 60), dy: rnd(-70, -20), dur: .8, size: 11 }); }), T.pose('Riesenwelle!', 1.4, (b) => b.setView('swim', 'freut'))] : T.goSwim(a) },
    wolpi: { n: 'Hasensprung-Flug', t: (a) => { const p = freeSpot(); return [T.pose('nimmt Anlauf', .4, (b) => b.setView('side'), (b, t) => { b.sy = 1 - .15 * Math.min(1, t / .3); }), { label: 'Hasensprung-Flug!', start(b) { this.t = 0; this.x0 = b.x; this.y0 = b.y; b.face = p[0] > b.x ? 1 : -1; b.setView('fly'); b.cls('fl', null, .3); b.sy = 1; }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / 2); b.x = this.x0 + (p[0] - this.x0) * k; b.y = this.y0 + (p[1] - this.y0) * k; b.z = Math.sin(Math.PI * k) * 120; b.rot = (k < .5 ? -10 : 14); return k >= 1; } }, T.call((b) => { b.z = 0; b.rot = 0; b.setView('side'); b.cls(''); }), T.landBounce()]; } },
  };
  // special animation of every animal (shown on its card and now and then in the garden)
  const Q = () => G.sk || 1; const hd = (a) => a.y - a.z - 60 * depth(a.y) * Q();
  const eIO = (k) => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); const eOut = (k) => 1 - Math.pow(1 - k, 3);
  const PS = (lab, secs, setup, each, end) => ({ label: lab, start(b) { this.t = 0; b.cls(''); if (setup) setup(b); }, step(b, dt) { this.t += dt; if (each) each(b, this.t, dt); if (this.t >= secs) { b.rot = 0; b.sx = b.sy = 1; b.tn = 0; if (end) end(b); return true; } return false; } });
  const pFwd = (a, d) => { for (const sg of [1, -1]) for (const k of [1, .6, .35]) { const x = clamp(a.x + a.face * sg * d * k * Q(), 40, G.W - 40); let ok = true; for (let i = 1; i <= 6; i++) { if (inPond(a.x + (x - a.x) * i / 6, a.y, 1.3)) ok = false; } if (ok) { if (sg < 0) a.face = -a.face; return [x, a.y]; } } return [a.x, a.y]; };
  Object.assign(SPECIAL, {
    fuchs: { n: 'Mäuselsprung', t: (a) => { const p = pFwd(a, 90); return [PS('lauscht …', 1.2, (b) => { b.setView('side'); b.sy = .9; b.sx = 1.08; }, (b, t) => { b.rot = Math.sin(t * 8) * 3; }), T.hopTo(p[0], p[1], 0, 70 * Q(), .9, 'Mäuselsprung!'), T.call((b) => { b.rot = 50 * b.face; for (let i = 0; i < 8; i++) b.sc.fx('dirt', b.x, b.y - 3, { anim: 'arc', dx: rnd(-40, 40) * Q(), dy: -rnd(10, 30) * Q(), dur: .6, size: 9 }); }), PS('', .5), T.call((b) => b.bubble('🐭?', 1.2))]; } },
    katze: { n: 'Vorwärtssalto', t: (a) => { const p = pFwd(a, 70); let x0; return [
      PS('duckt sich, Schwanz zuckt', .7, (b) => { b.setView('side'); x0 = b.x; }, (b, t) => { const k = eIO(Math.min(1, t / .55)); b.sy = 1 - .2 * k; b.sx = 1 + .12 * k; b.rot = 6 * k + Math.sin(t * 30) * 1.2 * k; }),
      { label: 'Salto!', start(b) { this.t = 0; b.pivot = '50% 58%'; b.cls('hp'); }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / .95);
        b.x = x0 + (p[0] - x0) * eIO(k); b.z = Math.sin(Math.PI * k) * 62 * Q(); const spin = k < .12 ? 0 : k > .88 ? 1 : eIO((k - .12) / .76); b.rot = 360 * spin;
        const tuck = Math.sin(Math.PI * Math.min(1, Math.max(0, (k - .15) / .7))); b.sx = 1 - .14 * tuck + (k < .12 ? -.08 : 0); b.sy = 1 - .14 * tuck + (k < .12 ? .16 : 0);
        if (k > .4 && k < .6 && Math.random() < .5) b.sc.fx('spark', b.x + rnd(-20, 20) * Q(), b.y - b.z - 30 * Q(), { size: 9, dur: .7 });
        if (k >= 1) { b.rot = 0; b.z = 0; b.pivot = ''; b.cls(''); return true; } return false; } },
      { label: 'landet sauber', start(b) { this.t = 0; dust(b, 5); }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / .5); const w = Math.exp(-5 * k) * Math.cos(k * 12); b.sy = 1 - .22 * w; b.sx = 1 + .15 * w; return k >= 1; } },
      PS('Ta-daa!', 1.1, (b) => { b.setView('front', 'stolz'); b.bubble('✨', 1); }, (b, t) => { b.tn = Math.sin(t * 3) * .3; b.rot = Math.sin(t * 5) * 2; })]; } },
    hund: { n: 'Stöckchen holen', t: (a) => { const p = pFwd(a, 140); const x0 = a.x, y0 = a.y; return [T.call((b) => { b.bubble('🦴', 1); b.sc.fx('blatt', b.x, hd(b), { anim: 'arc', dx: (p[0] - b.x), dy: 60 * Q(), dur: .8, size: 14, color: '#8a5a34' }); }), T.walk(p[0], p[1], { run: 1, direct: 1, label: 'rennt zum Stöckchen' }), T.walk(x0, y0, { run: 1, direct: 1, label: 'bringt es zurück' }), PS('wedelt', 1.4, (b) => b.setView('front', 'freut'), (b, t) => { b.rot = Math.sin(t * 20) * 4; })]; } },
    hase: { n: 'Riesensprung', t: (a) => { const p = pFwd(a, 150); return [PS('nimmt Anlauf', .4, (b) => { b.setView('side'); b.sy = .85; }), T.hopTo(p[0], p[1], 0, 90 * Q(), 1.1, 'Riesensprung!'), T.landBounce(), T.call((b) => b.bubble('🥕', 1))]; } },
    igel: { n: 'Kugel-Roller', t: (a) => { const p = pFwd(a, 150); let x0; return [
      PS('schnuppert, rollt sich ein', .8, (b) => { b.setView('side'); x0 = b.x; }, (b, t) => { const k = eIO(Math.min(1, t / .7)); b.sy = 1 - .3 * k; b.sx = 1 - .05 * k; b.rot = 20 * k; if (k >= 1) b.setView('sit'); }),
      { label: 'Kugel!', start(b) { this.t = 0; b.setView('sit'); b.pivot = '50% 62%'; b.sy = .72; b.sx = .9; this.z = 0; }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / 1.7);
        const e = eOut(k); const nx = x0 + (p[0] - x0) * e; const dist = nx - b.x; b.x = nx; b.rot += (dist / (14 * Q())) * 57.3; // roll without slipping
        b.z = Math.abs(Math.sin(k * Math.PI * 5)) * 5 * Q() * (1 - k); if (Math.random() < .35 * (1 - k)) b.sc.fx('dirt', b.x - b.face * 10 * Q(), b.y - 2, { anim: 'arc', dx: -b.face * rnd(8, 20) * Q(), dy: -rnd(4, 10) * Q(), dur: .5, size: 8 });
        if (k >= 1) { b.z = 0; return true; } return false; } },
      { label: 'wackelt aus', start(b) { this.t = 0; this.r0 = ((b.rot % 360) + 360) % 360; }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / .7); b.rot = this.r0 + ((this.r0 > 180 ? 360 : 0) - this.r0) * eOut(k) + Math.sin(k * 18) * 8 * (1 - k); return k >= 1; } },
      PS('Hallo!', 1, (b) => { b.rot = 0; b.pivot = ''; b.setView('front', 'freut'); b.sy = .8; }, (b, t) => { const k = Math.min(1, t / .35); b.sy = .8 + .2 * eOut(k) + .06 * Math.sin(t * 16) * (1 - k); b.sx = 1.06 - .06 * k; if (t > .3 && t < .33) b.bubble('😊', .9); })]; } },
    waschbaer: { n: 'Futter waschen', t: (a) => { const e = pondPt(angTo(a.x, a.y), 1.15); return [T.walk(e[0], e[1], { label: 'geht zum Wasser' }), PS('wäscht sein Futter', 2.4, (b) => { b.face = G.pond.cx > b.x ? 1 : -1; b.setView('side'); }, (b, t) => { b.rot = 12 + Math.sin(t * 16) * 4; if (Math.random() < .2) b.sc.fx('drop', b.x + b.face * 20 * Q(), b.y - 10 * Q(), { anim: 'arc', dx: rnd(-10, 10) * Q(), dy: -14 * Q(), dur: .5, size: 8 }); }), T.call((b) => b.bubble('🍎✨', 1.2))]; } },
    panda: { n: 'Purzelbaum', t: (a) => { const p = pFwd(a, 80); return [{ label: 'Purzelbaum!', start(b) { this.t = 0; this.x0 = b.x; b.setView('sit'); b.pivot = '50% 60%'; }, step(b, dt) { this.t += dt; const k = Math.min(1, this.t / 1.2); b.x = this.x0 + (p[0] - this.x0) * eIO(k); b.rot = 360 * eIO(k); b.z = Math.sin(k * Math.PI) * 10 * Q(); b.sy = 1 - .1 * Math.sin(k * Math.PI); return k >= 1; } }, T.call((b) => { b.rot = 0; b.z = 0; b.pivot = ''; b.sy = 1; b.bubble('😄', 1); }), T.landBounce()]; } },
    erdmann: { n: 'Wache stehen', t: () => [PS('steht Wache', 3.4, (b) => b.setView('front'), (b, t) => { b.sy = 1.12; b.sx = .92; b.tn = Math.sin(t * 1.6) * .95; if (t > 1.6 && t < 1.7) b.bubble('❗', 1); })] },
    eichhorn: { n: 'Nuss vergraben', t: () => [PS('vergräbt eine Nuss', 2, (b) => { b.setView('front'); b.bubble('🌰', 1); }, (b, t) => { b.rot = Math.sin(t * 22) * 5; if (Math.random() < .3) b.sc.fx('dirt', b.x, b.y - 3, { anim: 'arc', dx: rnd(-30, 30) * Q(), dy: -rnd(8, 24) * Q(), dur: .6, size: 8 }); }), PS('klopft fest', .6, null, (b, t) => { b.sy = 1 - .06 * Math.abs(Math.sin(t * 14)); })] },
    hamster: { n: 'Backen stopfen', t: () => [T.walk(G.bowl.x - 36 * Q(), G.bowl.y + 4 * Q(), { label: 'flitzt zum Napf' }), T.eat(), PS('Backen voll!', 1.8, (b) => { b.setView('front', 'freut'); b.bubble('😋', 1.4); }, (b, t) => { b.sx = 1 + .18 * Math.min(1, t * 3); })] },
    maus: { n: 'Flitz-Zickzack', t: (a) => { const pts = [0, 1, 2, 3].map((i) => [clamp(a.x + (i % 2 ? 50 : -10) * Q() + i * 20 * Q(), 40, G.W - 40), clamp(a.y + (i % 2 ? 18 : -12) * Q(), G.y0 + 20 * Q(), G.y1)]); return pts.map((p) => T.walk(p[0], p[1], { run: 1, direct: 1, label: 'flitzt im Zickzack' })); } },
    einhorn: { n: 'Regenbogensprung', t: (a) => { const p = pFwd(a, 130); return [{ ...T.hopTo(p[0], p[1], 0, 80 * Q(), 1.3, 'Regenbogensprung!'), trail: 1 }, T.landBounce(), T.call((b) => { for (let i = 0; i < 8; i++) b.sc.fx('spark', b.x + rnd(-30, 30) * Q(), hd(b) + rnd(-10, 20) * Q(), { size: 12 }); })]; } },
    otter: { n: 'Auf dem Rücken treiben', t: (a) => a.sc.poolOpen === false || a.sc.frozen ? [PS('spielt mit einem Stein', 2, (b) => b.setView('front', 'freut'), (b, t) => { b.rot = Math.sin(t * 9) * 6; })] : [...T.goSwim(a).slice(0, 4), PS('treibt auf dem Rücken', 3, (b) => { b.mode = 'water'; b.setView('swim', 'freut'); b.bubble('🐚', 1.4); }, (b, t) => { b.rot = -24 + Math.sin(t * 2) * 4; if (Math.random() < .03) b.sc.ripple(b.x, b.y, 8); }, (b) => { b.rot = 0; }), T.swim(4)] },
    frosch: { n: 'Zungenschlag', t: () => [T.call((b) => b.sc.fx('fly', b.x + b.face * 40 * Q(), hd(b) - 10 * Q(), { dx: -b.face * 30 * Q(), dy: 6 * Q(), dur: 1, size: 12 })), PS('schnapp!', .5, (b) => b.setView('side'), (b, t) => { b.sx = 1 + .15 * Math.sin(t / .5 * Math.PI); }), T.call((b) => b.bubble('😋', 1.2)), PS('', .3, null, (b, t) => { b.z = Math.sin(t / .3 * Math.PI) * 12 * Q(); })] },
    axolotl: { n: 'Blubber-Lachen', t: () => [PS('lacht', 2.4, (b) => b.setView('front', 'freut'), (b, t) => { b.rot = Math.sin(t * 6) * 4; if (Math.random() < .2) b.sc.fx('bubble', b.x + rnd(-14, 14) * Q(), hd(b), { dy: -40 * Q(), dur: 1.4, size: 12 }); })] },
    eidechse: { n: 'Liegestütze', t: () => [PS('macht Liegestütze', 2.4, (b) => b.setView('side'), (b, t) => { b.sy = 1 - .14 * Math.max(0, Math.sin(t * 6)); }), T.call((b) => b.bubble('💪', 1.2))] },
    chamae: { n: 'Farbwechsel', t: () => [PS('wechselt die Farbe', 3.2, (b) => { b.setView('front', 'stolz'); b.inn.style.transition = 'filter .6s'; }, (b, t) => { b.inn.style.filter = `hue-rotate(${Math.round(t * 110)}deg) saturate(1.3)`; }, (b) => { b.inn.style.filter = ''; })] },
    drache: { n: 'Feuer spucken', t: () => [PS('holt Luft', .7, (b) => b.setView('side'), (b, t) => { b.sx = 1 + .1 * t; }), PS('Feuer!', 1.4, null, (b) => { for (let i = 0; i < 2; i++) b.sc.fx('dot', b.x + b.face * 26 * Q(), hd(b) + 18 * Q(), { dx: b.face * rnd(40, 80) * Q(), dy: rnd(-16, 10) * Q(), dur: .6, size: 12, color: pick(['#FF8A1E', '#FFD34D', '#E5483B']) }); })] },
    eule: { n: 'Kopf drehen', t: () => [PS('dreht den Kopf ganz rum', 3, (b) => b.setView('front'), (b, t) => { b.tn = Math.sin(t * 2.1) * 1; if (t > 1.4 && t < 1.45) b.bubble('Huhu!', 1.2); })] },
    pinguin: { n: 'Bauchrutscher', t: (a) => { const p = pFwd(a, 140); return [PS('wirft sich auf den Bauch', .4, (b) => b.setView('side'), (b, t) => { b.rot = b.face * 80 * Math.min(1, t / .3); }), { label: 'rutscht!', start(b) { this.t = 0; this.x0 = b.x; }, step(b, dt) { this.t += dt; const k = 1 - Math.pow(1 - Math.min(1, this.t / 1.6), 2); b.x = this.x0 + (p[0] - this.x0) * k; if (Math.random() < .3) b.sc.fx(b.sc.frozen ? 'snow' : 'drop', b.x - b.face * 14 * Q(), b.y - 4, { anim: 'arc', dx: -b.face * 14 * Q(), dy: -10 * Q(), dur: .5, size: 8 }); return k >= 1; } }, PS('steht auf', .4, null, (b, t) => { b.rot = b.face * 80 * (1 - t / .4); })]; } },
    ente: { n: 'Quak-Flatter', t: () => [PS('flattert', 1.6, (b) => { b.setView('fly'); b.cls('fl', null, .18); b.bubble('Quak!', 1.2); }, (b, t) => { b.z = Math.abs(Math.sin(t * 5)) * 12 * Q(); }, (b) => { b.z = 0; b.setView('side'); })] },
    papagei: { n: 'Plappern', t: () => [PS('plappert', 3.6, (b) => b.setView('front', 'freut'), (b, t) => { b.rot = Math.sin(t * 5) * 6; const w = ['Hallo!', 'Ämtli!', 'Super!']; const i = Math.floor(t / 1.2); if (b._pi !== i && i < 3) { b._pi = i; b.bubble(w[i], 1.1); } }, (b) => { b._pi = null; })] },
    biene: { n: 'Schwänzeltanz', t: () => [{ label: 'Schwänzeltanz', start(b) { this.t = 0; this.x0 = b.x; this.z0 = b.z; b.setView('fly'); b.cls('fl', null, .05); }, step(b, dt) { this.t += dt; const k = this.t * 2.4; b.x = this.x0 + Math.sin(k) * 30 * Q(); b.z = this.z0 + Math.sin(k * 2) * 10 * Q(); b.face = Math.cos(k) > 0 ? 1 : -1; b.rot = Math.sin(k * 6) * 10; return this.t > 3.2; } }] },
    kaefer: { n: 'Glückskäfer', t: () => [PS('bringt Glück', 2, (b) => { b.setView('front', 'freut'); b.bubble('🍀', 1.6); }, (b, t) => { b.z = Math.sin(t / 2 * Math.PI) * 14 * Q(); if (Math.random() < .1) b.sc.fx('heart', b.x, hd(b), { dy: -20 * Q(), size: 10 }); }, (b) => { b.z = 0; })] },
    falter: { n: 'Flügelglanz', t: () => [PS('lässt die Flügel glänzen', 2.4, (b) => b.setView('front', 'stolz'), (b) => { if (Math.random() < .3) b.sc.fx('spark', b.x + rnd(-30, 30) * Q(), hd(b) + rnd(-10, 20) * Q(), { size: 10 }); })] },
    reh: { n: 'Bocksprünge', t: (a) => [0, 1, 2].map((i) => { const p = pFwd({ x: a.x + a.face * i * 40 * Q(), face: a.face, y: a.y }, 40); return T.hopTo(p[0], p[1], 0, 26 * Q(), .45, 'Bocksprung!'); }) },
    pony: { n: 'Galopp-Runde', t: (a) => { const c = [a.x, a.y]; return [0, 1, 2, 3].map((i) => { const ang = i / 4 * Math.PI * 2; return T.walk(clamp(c[0] + Math.cos(ang) * 70 * Q(), 40, G.W - 40), clamp(c[1] + Math.sin(ang) * 26 * Q(), G.y0 + 10 * Q(), G.y1), { run: 1, direct: 1, label: i ? 'galoppiert' : 'Wiehee!' }); }).concat([T.call((b) => b.bubble('Wiehee!', 1.2))]); } },
    koala: { n: 'Kuschel-Nickerchen', t: () => [PS('macht ein Nickerchen', 3, (b) => { b.setView('sit', 'schlaeft'); b.zzz(true); }, null, (b) => { b.zzz(false); b.setView('front', 'freut'); b.bubble('❤️', 1); })] },
    faultier: { n: 'Zeitlupen-Winken', t: () => [PS('winkt … ganz … langsam', 4, (b) => b.setView('front', 'freut'), (b, t) => { b.rot = Math.sin(t * .8) * 8; b.tn = Math.sin(t * .5) * .6; })] },
    robbe: { n: 'Klatschen', t: () => [PS('klatscht', 2, (b) => { b.setView('front', 'freut'); b.bubble('👏', 1.4); }, (b, t) => { b.sx = 1 + .06 * Math.abs(Math.sin(t * 12)); b.z = Math.abs(Math.sin(t * 6)) * 4 * Q(); }, (b) => { b.z = 0; })] },
    biber: { n: 'Holz knabbern', t: () => [PS('knabbert Holz', 2.4, (b) => { b.setView('front'); b.bubble('🪵', 1); }, (b, t) => { b.rot = Math.sin(t * 24) * 3; if (Math.random() < .3) b.sc.fx('crumb', b.x, hd(b) + 20 * Q(), { anim: 'arc', dx: rnd(-20, 20) * Q(), dy: -10 * Q(), dur: .5, size: 8 }); })] },
    flamingo: { n: 'Flamingo-Ballett', t: () => [PS('tanzt Ballett', 3, (b) => b.setView('front', 'stolz'), (b, t) => { b.rot = Math.sin(t * 3) * 10; b.sy = 1 + .04 * Math.sin(t * 6); b.tn = Math.sin(t * 1.5) * .7; })] },
    fledermaus: { n: 'Ultraschall', t: () => [PS('Ultraschall!', 2, (b) => b.setView('front', 'freut'), (b, t) => { if (Math.floor(t / .4) !== Math.floor((t - .02) / .4)) b.sc.fx('bubble', b.x, hd(b), { dy: 0, dur: .8, size: 36, anim: 'up' }); })] },
    kolibri: { n: 'Schwirr-Stopp', t: () => [T.hover(1.4, 'schwirrt auf der Stelle'), { label: 'zack!', start(b) { this.t = 0; this.x0 = b.x; }, step(b, dt) { this.t += dt; b.x = this.x0 + b.face * 60 * Q() * Math.min(1, this.t / .25); return this.t > .5; } }, T.hover(1, 'schwirrt')] },
    tiger: { n: 'Brüllen', t: () => [PS('holt Luft', .6, (b) => b.setView('front'), (b, t) => { b.sy = 1 + .06 * t; }), PS('ROAAR!', 1.2, (b) => { b.setView('front', 'sauer'); b.bubble('ROAAR!', 1.2); b.sc.ripple(b.x, b.y, 30); b.sc.ripple(b.x, b.y, 50); }, (b, t) => { b.rot = Math.sin(t * 40) * 2; }, (b) => b.setView('front', 'froh'))] },
  });



  // ---------------------------------------------------------------- living together: talk in groups, play tag, ball, race, follow the leader, cuddle
  const TALK = ['💬', '❤️', '🎵', '❓', '❗', '🍎', '⚽', '⭐', '😄', '🌸', '🦋', '☀️', '🐟', '🥕'];
  const freeMates = (a, n, near) => a.sc.actors.filter((o) => o !== a && o.mode === 'ground' && !inPond(o.x, o.y, 1.1) && !o.busy && !o.ab.always && (!near || Math.hypot(o.x - a.x, (o.y - a.y) / .55) < near)).sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y)).slice(0, n);
  const book = (list) => list.forEach((o) => { o.q = []; o.cur = null; o.busy = 1; o.sink = 0; o.rot = 0; o.cls(''); });
  const free = () => T.call((o) => { o.busy = 0; o.tn = 0; o.rot = 0; o.z = 0; });
  const faceTo = (o, x, y) => { const dx = x - o.x, dy = (y - o.y) / .55; if (Math.abs(dx) > Math.abs(dy) * .8) { o.face = dx > 0 ? 1 : -1; o.setView('side'); o.tn = 0; } else { o.setView(dy > 0 ? 'front' : 'back'); o.tn = clamp(dx / 60, -1, 1); } };
  // a task that follows another animal (used for tag and follow-the-leader)
  T.follow = (tgt, o) => { const opt = o || {}; let w = null; return { label: opt.label, start(a) { this.t = 0; w = T.walk(tgt.x, tgt.y, { direct: 1, run: opt.run, label: opt.label }); w.start(a); },
    step(a, dt) { this.t += dt; const off = opt.dist || 30 * (G.sk || 1); const dx = tgt.x - a.x, dy = tgt.y - a.y; const d = Math.hypot(dx, dy / .55) || 1; const pp = dryPt(tgt.x - dx / d * off, tgt.y - dy / d * off * .55); this.rt = (this.rt || 0) - dt; if (!wetLine(a.x, a.y, pp[0], pp[1])) w.pts = [pp]; else if (this.rt <= 0) { this.rt = .6; w.pts = route(a.x, a.y, pp[0], pp[1]); } const reached = w.step(a, dt); if (opt.until && opt.until(a, this.t)) return true; if (reached && opt.stopNear) return true; return this.t > (opt.max || 12); } }; };
  const SOCIAL = {
    reden(a) { // 2–4 animals come together, stand in a circle and chat
      const m = freeMates(a, 1 + Math.floor(Math.random() * 3), 600); if (!m.length) return null; const all = [a, ...m]; book(all);
      let c = [(a.x + m[0].x) / 2, (a.y + m[0].y) / 2]; if (inPond(c[0], c[1], 1.5) || (G.free && false)) c = freeSpot(); const R = (42 * depth(c[1]) + all.length * 4) * (G.sk || 1);
      const grp = { n: all.length, here: 0, t0: null };
      all.forEach((o, i) => { const ang = Math.PI / 2 + i / all.length * Math.PI * 2; const px = c[0] + Math.cos(ang) * R, py = c[1] + Math.sin(ang) * R * .55;
        o.q = [T.walk(px, py, { label: i ? 'kommt dazu' : 'ruft die anderen' }), { label: 'plaudert', start(b) { grp.here += 1; this.t = 0; this.nx = Math.random() * 1.2; faceTo(b, c[0], c[1]); b.cls(''); },
          step(b, dt) { if (grp.here < grp.n) { b.tn = Math.sin(b.sc.t * 2) * .4; return false; } if (grp.t0 == null) grp.t0 = b.sc.t; const t = b.sc.t - grp.t0; this.nx -= dt; b.rot = Math.sin(t * 6 + i) * 2;
            if (this.nx <= 0) { this.nx = 1.4 + Math.random() * 1.6; if (Math.random() < .6) b.bubble(pick(TALK), 1.5); }
            if (t > 7 && t < 7.8) { b.z = Math.sin((t - 7) / .8 * Math.PI) * 10 * depth(b.y); if (!this.l) { this.l = 1; b.bubble('😄', 1.2); } }
            return t > 8.2; } }, T.call((b) => { b.z = 0; }), free()]; });
      return true;
    },
    fangis(a) { // tag: one runs away, the other chases; when caught they laugh and swap once
      const m = freeMates(a, 1, 700); if (!m.length) return null; const ch = m[0]; book([a, ch]);
      const run = () => { const p = freeSpot(); return T.walk(p[0], p[1], { run: 1, label: 'rennt weg!' }); };
      const caught = (b) => Math.hypot(b.x - a.x, (b.y - a.y) / .55) < 26 * (G.sk || 1);
      a.q = [T.pose('ruft „Fang mich!“', .8, (b) => { b.setView('front', 'freut'); b.bubble('🏃', 1.2); }), run(), run(), run(), T.pose('ausser Atem', 1.4, (b) => b.setView('front', 'freut'), (b, t) => { b.sy = 1 + .04 * Math.sin(t * 12); }), free()];
      ch.q = [T.pose('zählt bis drei', 1.4, (b) => { b.setView('front'); b.bubble('3… 2… 1…', 1.4); }), T.follow(a, { run: 1, dist: 12 * (G.sk || 1), label: 'fängt!', max: 9, until: (b) => caught(b) }), T.call((b) => { b.bubble('❗', 1.2); a.bubble('😄', 1.2); }), T.pose('hat gefangen!', 1.2, (b) => b.setView('front', 'freut'), (b, t) => { b.z = Math.sin(t / 1.2 * Math.PI) * 12; }), T.call((b) => { b.z = 0; }), free()];
      return true;
    },
    ball(a) { // two animals pass a ball back and forth
      const m = freeMates(a, 1, 700); if (!m.length) return null; const b2 = m[0]; book([a, b2]);
      let c = freeSpot(); const d = 85 * depth(c[1]) * (G.sk || 1); const pA = [clamp(c[0] - d, 60, G.W - 60), c[1]], pB = [clamp(c[0] + d, 60, G.W - 60), c[1]];
      const st = { here: 0, done: false };
      const play = (o, other, first) => ({ label: 'spielt Ball', start(b) { st.here += 1; faceTo(b, other === a ? pA[0] : pB[0], c[1]); },
        step(b) { if (st.here < 2) return false; if (first && !st.ball) { st.ball = 1; const el = document.createElement('div'); el.className = 'gballs'; b.sc.sc.appendChild(el); let k = 0, from = a, to = b2, t = 0; b.bubble('⚽', 1.2);
          b.sc.hooks.push((dt) => { t += dt / .9; if (t >= 1) { t = 0; k += 1; to.z = 10; setTimeout(() => { to.z = 0; }, 160); to.bubble(pick(['😄', '⚽', '❗']), .8); [from, to] = [to, from]; if (k >= 6) { el.remove(); st.done = true; return true; } }
            const x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t; const h = Math.sin(t * Math.PI) * 60 * depth(y) * (G.sk || 1); const bs = 18 * (G.sk || 1) ** .5; el.style.width = el.style.height = bs + 'px'; el.style.transform = `translate(${x - bs / 2}px, ${y - bs - 4 * (G.sk || 1) - h}px) rotate(${t * 540}deg)`; el.style.zIndex = Math.round(y) + 5; return false; }); }
          b.rot = Math.sin(b.sc.t * 5) * 3; return st.done; } });
      a.q = [T.walk(pA[0], pA[1], { label: 'holt den Ball' }), play(a, b2, true), free()]; b2.q = [T.walk(pB[0], pB[1], { label: 'will mitspielen' }), play(b2, a, false), free()];
      return true;
    },
    rennen(a) { // a race: line up, 3-2-1, run, winner cheers
      const m = freeMates(a, 1, 800); if (!m.length) return null; const b2 = m[0]; book([a, b2]);
      const RC = G.race || [230, 560, 330, 470]; const y0 = rnd(RC[2], RC[3]); const yA = y0, yB = y0 + 30 * (G.sk || 1); const x0 = RC[0], x1 = RC[1]; if (inPond(x1, yB, 1.3)) return null;
      const st = { here: 0, go: false, win: null };
      const runner = (o, y) => [T.walk(x0, y, { label: 'stellt sich an den Start' }), { label: 'wartet auf den Start', start(b) { st.here += 1; b.face = 1; b.setView('side'); }, step(b) { if (st.here < 2) return false; if (!st.cd && o === a) { st.cd = 1; ['3', '2', '1', 'Los!'].forEach((t, i) => setTimeout(() => { a.bubble(t, .8); if (t === 'Los!') st.go = true; }, i * 700 / b.sc.speed)); } return st.go; } },
        { ...T.walk(x1, y, { direct: 1, run: 1, label: 'rennt um die Wette!' }), boost: o === a ? 1 : 1.12 }, T.call((b) => { if (!st.win) { st.win = b; b.bubble('🏆', 2); } else b.bubble('😅', 1.6); }), T.pose('jubelt', 1.4, (b) => b.setView('front', st.win === b ? 'stolz' : 'freut'), (b, t) => { if (st.win === b) b.z = Math.abs(Math.sin(t * 7)) * 10; }), T.call((b) => { b.z = 0; }), free()];
      a.q = runner(a, yA); b2.q = runner(b2, yB);
      return true;
    },
    reihe(a) { // follow the leader in a little line
      const m = freeMates(a, 2 + Math.floor(Math.random() * 2), 700); if (m.length < 1) return null; const all = [a, ...m]; book(all);
      const pts = [freeSpot(), freeSpot(), freeSpot()];
      a.q = [T.pose('ruft „Mir nach!“', .8, (b) => { b.setView('front', 'freut'); b.bubble('🎵', 1.4); }), ...pts.map((p) => T.walk(p[0], p[1], { label: 'führt die Reihe an' })), T.pose('dreht sich um', 1, (b) => b.setView('front', 'freut')), free()];
      m.forEach((o, i) => { o.q = [T.pose('', .5 + i * .5, (b) => b.setView('front')), T.follow(all[i], { dist: 34 * (G.sk || 1), label: 'läuft hinterher', max: 30, until: () => !a.busy }), free()]; });
      return true;
    },
    kuscheln(a) { // cuddle: sit next to each other, hearts, maybe a nap
      const m = freeMates(a, 1, 600); if (!m.length) return null; const b2 = m[0]; book([a, b2]);
      const c = freeSpot(); const d = 18 * depth(c[1]) * (G.sk || 1);
      const sit = (o, dx) => [T.walk(c[0] + dx, c[1], { label: 'kommt kuscheln' }), { label: 'kuschelt', start(b) { this.t = 0; const sl = Math.random() < .5; b.setView('sit', sl ? 'schlaeft' : 'froh'); if (sl) b.zzz(true); b.rot = dx < 0 ? 6 : -6; }, step(b, dt) { this.t += dt; if (this.t > 8) b.zzz(false); if (Math.random() < .015) b.sc.fx('heart', (a.x + b2.x) / 2, b.y - 60 * depth(b.y), { size: 14 }); return this.t > 8; } }, T.call((b) => { b.rot = 0; }), T.stretch(), free()];
      a.q = sit(a, -d); b2.q = sit(b2, d);
      return true;
    },
  };

  // hiding behind plants (G.hides: spots just behind a plant, z-order puts the animal behind it)
  T.hide = (secs) => { const hs = G.hides || []; if (!hs.length) return T.look(); const h = pick(hs);
    return [T.walk(h.x, h.y, { label: 'versteckt sich ' + (h.n || 'hinter einer Pflanze') }), T.pose('versteckt sich', secs || rnd(3, 5), (b) => { b.setView('front', 'freut'); }, (b, t) => { b.tn = Math.sin(t * 2.2) * .9; if (Math.random() < .01) b.bubble('👀', 1); }), T.walk(h.x + rnd(-40, 40) * (G.sk || 1), h.y + 18 * (G.sk || 1), { label: 'kommt hervor' }), T.call((b) => { b.bubble('Buh!', 1.2); b.tn = 0; })]; };
  SOCIAL.verstecken = (a) => { const hs = G.hides || []; const m = freeMates(a, Math.min(3, hs.length), 900); if (!m.length || hs.length < 2) return null; book([a, ...m]); const spots = [...hs].sort(() => Math.random() - .5);
    const found = []; const seekT = 3.2;
    m.forEach((o, i) => { const h = spots[i % spots.length]; o._hide = h; o.q = [T.walk(h.x + (i % 2 ? 4 : -4) * (G.sk || 1), h.y, { run: 1, label: 'versteckt sich ' + (h.n || '') }), { label: 'ist versteckt', start(b) { b.setView('front', 'freut'); }, step(b) { b.tn = Math.sin(b.sc.t * 2 + i) * .8; return found.includes(b); } }, T.call((b) => { b.bubble('😄', 1.2); b.tn = 0; }), T.walk(h.x, h.y + 22 * (G.sk || 1), { label: 'kommt raus' }), free()]; });
    a.q = [T.pose('zählt mit zugehaltenen Augen', seekT, (b) => { b.setView('back'); b.bubble('1… 2… 3…', seekT); }), T.call((b) => b.bubble('Ich komme!', 1.2)),
      ...m.map((o) => ({ label: 'sucht', start(b) { this.w = T.walk(o._hide.x, o._hide.y + 14 * (G.sk || 1), { label: 'sucht …' }); this.w.start(b); }, step(b, dt) { if (this.w.step(b, dt)) { b.bubble('Gefunden!', 1.2); found.push(o); return true; } return false; } })),
      T.pose('freut sich', 1.4, (b) => b.setView('front', 'stolz'), (b, t) => { b.z = Math.abs(Math.sin(t * 6)) * 8 * (G.sk || 1); }), T.call((b) => { b.z = 0; }), free()];
    return true; };
  // ---------------------------------------------------------------- sleeping places: nest, dog hut, basket, bird house, branch, lily pad, burrow, flower
  const BED_OF = (a) => { const k = a.k, ab = a.ab;
    if (['ente', 'otter', 'frosch', 'axolotl', 'nessie', 'robbe', 'biber', 'pinguin', 'flamingo'].includes(k)) return 'seerose';
    if (ab.always === 'air') return 'blume'; if (k === 'fledermaus') return 'haengen';
    if (ab.fly && ab.fly !== 'heavy') return ['eule', 'papagei', 'phoenix'].includes(k) ? 'ast' : 'vogelhaus';
    if (['koala', 'faultier', 'eichhorn', 'chamae'].includes(k)) return 'ast';
    if (['erdmann', 'hase', 'hamster', 'maus', 'igel'].includes(k)) return 'bau';
    if (['katze', 'kitsune'].includes(k)) return 'korb';
    if (['hund', 'fuchs', 'waschbaer', 'tiger', 'wolpi', 'yeti'].includes(k)) return 'huette';
    return 'nest'; };
  const BED_TXT = { seerose: 'auf dem Seerosenblatt / im Wasser', blume: 'in einer Blüte', haengen: 'kopfüber am Ast', vogelhaus: 'im Vogelhaus', ast: 'oben auf dem Ast', bau: 'im Erdbau', korb: 'im Körbchen', huette: 'in der Hütte', nest: 'im Strohnest' };
  const sleepLoop = (label, setup, each, keep) => ({ label, start(b) { this.t = 0; if (setup) setup(b); b.zzz(true, b.zzx, b.zzy); }, step(b, dt) { this.t += dt; if (each) each(b, this.t, dt); if (!b.sc.night) { b.zzz(false); if (!keep) b.sc.releaseBed(b); return true; } return false; } });
  const wakeUp = () => [T.call((b) => { b.zzx = null; b.zzy = null; b.el.style.opacity = ''; b.sink = 0; }), T.pose('wacht auf und gähnt', 1.2, (b) => b.setView('front', 'muede'), (b, t) => { b.sy = 1 + .05 * Math.sin(t * 3); }), T.call((b) => { b.sy = 1; b.setView('front', 'froh'); }), T.stretch()];
  T.sleep = (a) => {
    const sc = a.sc; const q = (v) => v * (G.sk || 1); let typ = BED_OF(a);
    const inAir = a.mode === 'air' || a.mode === 'perch';
    if (typ === 'seerose' && (sc.frozen || sc.poolOpen === false || !(G.slots || {}).seerose)) typ = 'nest';
    if (typ === 'blume' && sc.frozen) typ = 'vogelhaus';
    if (typ === 'vogelhaus' && !(G.slots || {}).vogelhaus) typ = 'ast';
    const down = inAir && a.z > 4 && !['vogelhaus', 'ast', 'blume', 'haengen'].includes(typ) ? [T.fly(...freeSpot(), 0, { label: 'fliegt runter' }), T.landBounce()] : [];
    const out = (b) => { sc.releaseBed(b); };
    if (typ === 'blume') { const f = pick(G.flowers || [[300, 455]]); return [T.fly(f[0], f[1] + q(2), q(46), { label: 'fliegt zur Blüte', keep: 1 }), T.call((b) => { b.mode = 'perch'; }), sleepLoop('schläft in einer Blüte', (b) => { b.setView('sit', 'schlaeft'); b.cls(''); }), T.call((b) => { b.mode = 'air'; }), T.hover(1, 'wacht auf')]; }
    if (typ === 'haengen' || (typ === 'ast' && a.ab.fly)) { const xs = (G.slots || {}).ast || [[TR.branchX]]; const used = sc.bedUse && sc.bedUse.ast || []; const s0 = sc.takeBed(a, 'ast') || { x: TR.branchX }; const bx = s0.x;
      if (typ === 'haengen') return [...(inAir ? [] : T.takeoff()), T.fly(bx, TR.y, BR - q(46), { label: 'fliegt zum Ast' }), T.call((b) => { b.mode = 'tree'; b.zi = TR.y + 3; b.rot = 180; b.z = BR + q(4); b.setView('front', 'schlaeft'); }), sleepLoop('schläft kopfüber am Ast'), T.call((b) => { b.rot = 0; b.zi = null; b.mode = 'perch'; b.z = BR - 2; }), T.fly(...freeSpot(), 0, { label: 'fliegt los' }), T.landBounce()];
      return [...(inAir ? [] : T.takeoff()), T.fly(bx, TR.y, BR - 2, { label: 'fliegt auf den Ast' }), T.call((b) => { b.zi = TR.y + 3; b.mode = 'tree'; b.onBr = 1; }), T.landBounce(), sleepLoop('schläft auf dem Ast', (b) => b.setView('sit', 'schlaeft')), T.call((b) => { b.zi = null; b.mode = 'perch'; b.onBr = 0; })]; }
    if (typ === 'ast') { const s0 = sc.takeBed(a, 'ast'); const L = T.climb(a); const si = L.findIndex((t) => t && t.label && /schläft|sitzt|knabbert|hängt am Ast|wird bunt|gemütlich/.test(t.label));
      if (si > 0) L.splice(si, 1, ...(s0 ? [T.walk(s0.x, TR.y, { direct: 1, slow: 1, label: 'sucht sich ein Plätzchen' }), T.call((b) => { b.mode = 'tree'; b.onBr = 1; })] : []), sleepLoop('schläft oben im Baum', (b) => { if (b.view !== 'climb') b.setView('sit', 'schlaeft'); }));
      return [...down, ...L]; }
    const s0 = sc.takeBed(a, typ) || sc.takeBed(a, 'nest') || { x: 80, y: G.y1 - 20, z: 0 }; if (!a._bed) typ = 'nest'; else typ = a._bed.type;
    if (typ === 'seerose') {
      if (a.k === 'frosch') return [...down, ...(a.mode === 'water' ? [] : [T.walk(s0.x - q(70), s0.y + q(30), { label: 'hüpft zum Seerosenblatt' })]), T.call((b) => { b.mode = 'ground'; }), T.hopTo(s0.x, s0.y, q(3), q(22), .6, 'springt aufs Seerosenblatt'), T.call((b) => { b.mode = 'perch'; }), sleepLoop('schläft auf dem Seerosenblatt', (b) => b.setView('sit', 'schlaeft')), T.hopTo(s0.x - q(80), s0.y + q(34), 0, q(20), .6, 'hüpft ans Ufer'), T.call((b) => { b.mode = 'ground'; }), ...wakeUp()];
      const swimIn = a.mode === 'water' ? [] : T.goSwim(a).slice(0, 4);
      return [...down, ...swimIn, T.call((b) => { b.mode = 'water'; b.setView('swim', 'schlaeft'); }), { label: G.pool ? 'schwimmt zum Schwimmring' : 'treibt zum Seerosenblatt', start(b) { this.f = T.swim(99); this.f.start(b); this.f.tgt = [s0.x, s0.y + q(2)]; }, step(b, dt) { this.f.step(b, dt); if (Math.hypot(b.x - this.f.tgt[0], b.y - this.f.tgt[1]) < q(6)) { b.x = this.f.tgt[0]; b.y = this.f.tgt[1]; return true; } return false; } },
        sleepLoop(G.pool ? 'schläft im Schwimmring' : 'schläft auf dem Wasser', (b) => b.setView('swim', 'schlaeft'), (b, t) => { b.z = Math.sin(t * 1.2) * q(1.2); if (Math.random() < .01) b.sc.ripple(b.x, b.y, 8); }), T.call((b) => b.setView('swim', 'froh'))]; }
    if (typ === 'vogelhaus') { const vh = q(26); return [...(inAir ? [] : T.takeoff()), T.fly(s0.x, s0.y, s0.z + vh, { label: 'fliegt zum Vogelhäuschen' }), T.landBounce(), T.call((b) => { b.mode = 'perch'; }), sleepLoop('schläft auf dem Vogelhäuschen', (b) => b.setView('sit', 'schlaeft'), null, true), T.call((b) => { b.z = s0.z; out(b); }), T.landBounce(), ...wakeUp()]; }
    if (typ === 'bau') return [...down, T.walk(s0.x + q(4), s0.y + q(3), { label: 'geht in seinen Erdbau' }), T.pose('verschwindet im Bau', .8, (b) => b.setView('front', 'muede'), (b, t) => { b.sink = Math.min(.9, t); }), sleepLoop('schläft im Erdbau', null, (b) => { b.sink = .95; }, true), T.pose('guckt raus', 1, null, (b, t) => { b.sink = .95 - .95 * Math.min(1, t); }), T.call(out), ...wakeUp()];
    if (typ === 'korb') return [...down, T.walk(s0.x + q(40), s0.y + q(6), { label: 'geht in sein Körbchen' }), T.hopTo(s0.x, s0.y + q(1), q(2), q(14), .45, 'hüpft ins Körbchen'), T.call((b) => { b.mode = 'perch'; b.zi = Math.round(s0.y) + 1; }), sleepLoop('schläft im Körbchen', (b) => { b.setView('sit', 'schlaeft'); b.sink = .12; }, null, true), T.call((b) => { b.sink = 0; b.zi = null; }), T.hopTo(s0.x + q(46), s0.y + q(4), 0, q(12), .4, 'hüpft raus'), T.call((b) => { b.mode = 'ground'; out(b); }), ...wakeUp()];
    if (typ === 'huette') return [...down, T.walk(s0.x, s0.y + q(14), { label: 'geht zu seiner Hütte' }), { label: 'kriecht in die Hütte', start(b) { this.t = 0; b.setView('back'); b.cls('wf', .5); b.zi = Math.round(s0.y) - 1; }, step(b, dt) { this.t += dt; b.y -= q(10) * dt; b.el.style.opacity = String(Math.max(0, 1 - this.t / 1.2)); return this.t > 1.2; } }, T.call((b) => { b.cls(''); b.zzx = s0.x + q(18); b.zzy = s0.y - q(70); }), sleepLoop('schläft in der Hütte', null, null, true), T.call((b) => { b.el.style.opacity = ''; b.y = s0.y + q(14); b.zi = null; }), T.pose('kommt raus', .6, (b) => b.setView('front', 'muede')), T.call(out), ...wakeUp()];
    return [...down, T.walk(s0.x, s0.y - q(2), { label: 'geht in sein Nest' }), sleepLoop('schläft im Strohnest', (b) => b.setView('sit', 'schlaeft'), null, true), T.call(out), ...wakeUp()];
  };

  // ---------------------------------------------------------------- the little brain: favourite places with a bit of chance
  const brain = (a) => {
    const ab = a.ab; const opts = [];
    if (a.sc.night) return T.sleep(a);
    if (!ab.always && a.mode === 'ground' && Math.random() < (a.sc.social != null ? a.sc.social : .35)) { const kinds = Object.keys(SOCIAL); const sk = pick(kinds); if (SOCIAL[sk](a)) return [T.call(() => {})]; }
    Object.entries(ab.fav).forEach(([p, w]) => opts.push([w, p]));
    opts.push([2, 'idle']); if (G.hides && G.hides.length && !ab.always) opts.push([2, 'verstecken']);
    if (!ab.fly && ((a.var && a.var.morph) || []).some((m) => /fluegel/.test(m))) opts.push([3, 'schwebeflug']);
    const SE = a.sc.season; const base = (SEASONS[SE] || {}).base;
    if (base === 'winter' && SE !== 'silvester') { opts.push([3, 'schneemann'], [1, 'friert']); if (!ab.always) opts.push([2, 'eis']); }
    if (base === 'herbst' && !ab.always) opts.push([4, 'laub']);
    if (SE === 'ostern' && !ab.always) opts.push([4, 'eier']);
    if (SE === 'weihnachten' && !ab.always) opts.push([3, 'geschenk']);
    if (['geburtstag', 'august', 'fasnacht', 'silvester'].includes(SE) && !ab.always) opts.push([3, 'tanzen']);
    if (SE === 'liebe') opts.push([4, 'treffen']);
    let tot = opts.reduce((s, o) => s + o[0], 0); let r = Math.random() * tot; let choice = 'wiese';
    for (const o of opts) { r -= o[0]; if (r <= 0) { choice = o[1]; break; } }
    const flier = !!ab.fly; const inAir = a.mode === 'air' || a.mode === 'perch';
    if (SPECIAL[a.k] && Math.random() < .18 && (a.mode === 'ground' || (a.k === 'nessie' && a.mode === 'water'))) return SPECIAL[a.k].t(a);
    // fliers sitting somewhere high: fly first
    const fromHigh = (list) => (inAir && a.z > 4 ? [T.fly(...freeSpot(), 0, { label: 'fliegt runter' }), T.landBounce()] : []).concat(list);
    if (ab.always === 'air') {
      if (choice === 'blumen' || Math.random() < .6) { const f = pick(G.flowers); return [T.fly(f[0] + rnd(-6, 6), f[1] + 2, 52, { label: 'fliegt zur Blume', keep: 1, alt: rnd(60, 110) }), T.hover(rnd(1.6, 3), 'trinkt Nektar'), ...(Math.random() < .5 ? [T.call((b) => b.sc.fx('spark', b.x, b.y - 60, { size: 10 }))] : [])]; }
      const p = freeSpot(); return [T.fly(p[0], p[1], rnd(60, 150), { label: 'schwirrt herum', keep: 1 }), T.hover(rnd(1, 2))];
    }
    if (base === 'winter' && choice === 'teich') choice = ab.always ? 'flug' : 'eis';
    if (a.sc.poolOpen === false && choice === 'teich') choice = G.cover ? 'deckel' : 'teichrand';
    switch (choice) {
      case 'verstecken': return fromHigh(T.hide());
      case 'eis': return fromHigh(T.slide(a));
      case 'deckel': return fromHigh(G.cover ? [T.walk(G.cover.x - 60, G.cover.y + 10, { label: 'schaut zum Pool – zu!' }), T.pose('Pool ist zu', 1.6, (b) => { b.setView('front', 'muede'); b.bubble('🔒', 1.4); }), ...(Math.random() < .5 ? [T.hopTo(G.cover.x + rnd(-40, 40), G.cover.y + rnd(-6, 6), G.cover.z || 6, 16, .5, 'hüpft auf die Abdeckung'), T.call((b) => { b.mode = 'perch'; }), T.sit(rnd(3, 5)), T.hopTo(G.cover.x + rnd(-60, 60), G.cover.y + 50, 0, 14, .5, 'hüpft runter'), T.call((b) => { b.mode = 'ground'; })] : [])] : T.look());
      case 'schneemann': return fromHigh(T.snowman());
      case 'friert': return fromHigh([T.shiver()]);
      case 'laub': return fromHigh(T.leaves());
      case 'eier': return fromHigh(T.eggs());
      case 'geschenk': return fromHigh(T.gift());
      case 'tanzen': return fromHigh([T.walk(...freeSpot(), { label: 'kommt zum Fest' }), T.dance(4)]);
      case 'teich': return fromHigh(ab.swim ? T.goSwim(a) : T.look());
      case 'teichrand': { const ang = angTo(a.x, a.y); const e = pondPt(ang, 1.16); return fromHigh([T.walk(e[0], e[1], { label: 'geht ans Ufer' }), T.drink()]); }
      case 'baum': return fromHigh(ab.climb ? T.climb(a) : [T.walk(TR.x + 60, TR.y + 30, { label: 'legt sich in den Schatten' }), T.sit(rnd(4, 8), 'schlaeft')]);
      case 'napf': return fromHigh([T.walk(G.bowl.x + (a.x < G.bowl.x ? -38 : 38) * depth(G.bowl.y), G.bowl.y + 4, { label: 'geht zum Futternapf' }), T.eat()]);
      case 'nest': return fromHigh([T.walk(G.nest.x + rnd(-14, 14), G.nest.y - 2, { label: 'geht ins Nest' }), T.sit(rnd(6, 10), 'schlaeft'), T.stretch()]);
      case 'blumen': { const f = pick(G.flowers); return fromHigh([T.walk(f[0] + rnd(-30, 30), f[1] + 14, { label: 'geht zu den Blumen' }), T.sniff()]); }
      case 'stein': return fromHigh(ab.bask ? T.bask(a) : [T.walk(G.stone.x + 60, G.stone.y + 16, { label: 'geht zum Stein' }), T.sit(rnd(3, 5))]);
      case 'huegel': return fromHigh(ab.dig ? T.dig(a) : [T.walk(G.hill.x - 60, G.hill.y + 16), T.sniff()]);
      case 'treffen': return fromHigh(T.meet(a));
      case 'dach': return flier ? [...(inAir ? [] : T.takeoff()), T.fly(G.roof.x + rnd(-30, 30), G.roof.y, G.roof.z, { label: 'fliegt aufs Dach' }), T.landBounce(), T.pose('sitzt auf dem Dach', rnd(3, 6), (b) => b.setView('front')), ...T.look()] : T.look();
      case 'pfosten': return flier ? [...(inAir ? [] : T.takeoff()), T.fly(G.post.x, G.post.y, G.post.z, { label: 'fliegt auf den Pfosten' }), T.landBounce(), T.pose('hält Ausschau', rnd(3, 6), (b) => b.setView('front')), ...T.look()] : T.look();
      case 'ast': return flier ? [...(inAir ? [] : T.takeoff()), T.fly(TR.branchX + 10, TR.y, BR - 2, { label: 'fliegt auf den Ast' }), T.call((b) => { b.zi = TR.y + 3; b.mode = 'tree'; b.onBr = 1; }), T.landBounce(), T.sit(rnd(3, 7), Math.random() < .5 ? 'schlaeft' : 'froh'), T.call((b) => { b.zi = null; b.mode = 'perch'; b.onBr = 0; })] : T.look();
      case 'flug': { if (!flier) return T.look(); const p = freeSpot(); return [...(inAir ? [] : T.takeoff()), T.fly(rnd(250, 950), rnd(280, 480), rnd(60, 140), { label: 'dreht eine Runde', keep: 1, alt: rnd(120, 190) }), T.fly(p[0], p[1], 0, { label: 'landet auf der Wiese' }), T.landBounce()]; }
      case 'schwebeflug': return T.wingFlight(a);
      case 'idle': return fromHigh([pick([T.look, T.sniff, T.stretch, () => T.sit(rnd(3, 5))])()].flat());
      default: { const p = freeSpot(); const run = Math.random() < .15; return fromHigh([T.walk(p[0], p[1], { run, label: run ? 'rennt' : 'spaziert' }), ...(Math.random() < .5 ? [T.sniff()] : T.look())]); }
    }
  };


  // ---------------------------------------------------------------- fixed loops for the single-movement cards
  const sq = (pts, o) => pts.map((p) => () => T.walk(p[0], p[1], { direct: 1, ...(o || {}) }));
  const loop8 = () => { const c = [400, 400], rx = 150, ry = 70; return [...Array(9)].map((_, i) => { const t = i / 8 * Math.PI * 2; return T.walk(c[0] + Math.cos(t) * rx * Math.sin(t) * 1.6, c[1] + Math.sin(t) * ry, { direct: 1, label: 'läuft eine Acht' }); }); };
  const SCRIPTS = {
    special: [(a) => SPECIAL[a.k].t(a), () => T.look(), (a) => { const p = freeSpot(); return T.walk(p[0], p[1], { label: 'spaziert' }); }],
    fabel: [(a) => SPECIAL[a.k].t(a), (a) => [].concat(brain(a)), () => T.look()],
    drehen: [() => loop8(), () => T.look(), () => [T.walk(280, 300, { direct: 1, label: 'schräg nach hinten' }), T.walk(520, 490, { direct: 1, label: 'schräg nach vorne' }), T.walk(300, 470, { direct: 1, label: 'zur Seite' }), T.walk(500, 310, { direct: 1, run: 1, label: 'schräg weg (rennt)' })], () => T.sniff(), () => T.walk(400, 400, { direct: 1, label: 'zurück' })],
    laufen: [...sq([[540, 322], [540, 488]]), () => T.look(), ...sq([[262, 488]]), () => T.sniff(), ...sq([[262, 322]]), () => T.walk(540, 322, { direct: 1, run: 1, label: 'rennt' }), () => T.stretch(), ...sq([[262, 322]])],
    hoppeln: [...sq([[540, 322], [540, 488]]), () => T.sniff(), ...sq([[262, 488], [262, 322]]), () => T.walk(540, 322, { direct: 1, run: 1, label: 'rennt (grosse Sprünge)' }), () => T.look(), ...sq([[262, 322]])],
    schwimmen: [(a) => T.goSwim(a), () => T.sit(2.5)],
    vogel: [() => T.takeoff(), () => [T.fly(G.post.x, G.post.y, G.post.z, { label: 'fliegt auf den Pfosten' }), T.landBounce(), T.pose('hält Ausschau', 2.5, (b) => b.setView('front')), ...T.look()],
      () => [T.fly(G.roof.x, G.roof.y, G.roof.z, { label: 'fliegt aufs Dach' }), T.landBounce(), T.pose('sitzt auf dem Dach', 2.5, (b) => b.setView('front'))],
      () => [T.fly(TR.branchX + 10, TR.y, BR - 2, { label: 'fliegt auf den Ast' }), T.call((b) => { b.zi = TR.y + 3; b.mode = 'tree'; b.onBr = 1; }), T.landBounce(), T.sit(3), T.call((b) => { b.zi = null; b.mode = 'perch'; b.onBr = 0; })],
      () => [T.fly(560, 470, 0, { label: 'landet auf der Wiese' }), T.landBounce(), T.walk(620, 480, { label: 'hüpft ein Stück' }), T.look()].flat()],
    gross: [() => [...T.takeoff(), T.fly(820, 300, 120, { label: 'startet mit kräftigen Schlägen', keep: 1, alt: 170 }), T.fly(300, 330, 140, { label: 'gleitet lange', keep: 1, alt: 190 }), T.fly(560, 470, 0, { label: 'landet sanft' }), T.landBounce(), T.look()].flat()],
    klein: [() => { const f = G.flowers; return [0, 1, 2].sort(() => Math.random() - .5).flatMap((i) => [T.fly(f[i][0] + 4, f[i][1] + 2, 52, { label: 'fliegt zur nächsten Blume', keep: 1, alt: rnd(70, 110) }), T.hover(rnd(1.8, 2.8), 'trinkt Nektar')]).concat([T.fly(rnd(420, 560), 380, 120, { label: 'dreht eine Runde', keep: 1, alt: 150 }), T.hover(1)]); }],
    klettern: [(a) => T.climb(a), () => T.look(), () => T.walk(320, 420, { label: 'spaziert' })],
    graben: [(a) => T.dig(a), () => T.walk(780, 330, { label: 'spaziert' }), () => T.sniff()],
    alltag: [(a) => [T.walk(G.bowl.x - 36, G.bowl.y + 4, { label: 'geht zum Futternapf' }), T.eat()], () => { const e = pondPt(Math.PI * .95, 1.16); return [T.walk(e[0], e[1], { label: 'geht ans Ufer' }), T.drink()]; }, (a) => T.meet(a), () => [T.walk(G.nest.x, G.nest.y - 2, { label: 'geht ins Nest' }), T.sit(6, 'schlaeft'), T.stretch()]],
  };
  const CSS = `.gwrap{position:relative;width:100%;overflow:hidden;border-radius:16px;background:#8fd3ff}
.gscene{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0}
.gland{position:absolute;inset:0}.gland>svg{position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none}.gscene>svg{position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none}.gscene .gbg{z-index:0}.gscene .gwater{z-index:1}.gfx{position:absolute;inset:0;z-index:5000;pointer-events:none}
.grip{fill:none;stroke:#fff;stroke-width:1.6;opacity:.8;transform-box:fill-box;transform-origin:center;animation:grip 2.2s ease-out forwards}@keyframes grip{to{transform:scale(3.2);opacity:0}}
.gfxi{position:absolute;transform:translate(-50%,-50%);animation:gup var(--d) ease-out forwards}.gfxi.arc{animation-name:garc;animation-timing-function:cubic-bezier(.2,.6,.4,1)}
@keyframes gup{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1)}}
@keyframes gfall{0%{opacity:0;transform:translate(-50%,-50%) rotate(0)}8%{opacity:1}100%{opacity:.9;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(400deg)}}.gfxi.fall{animation-name:gfall;animation-timing-function:linear}
.gdark{position:absolute;inset:0;z-index:4000;background:#0b1030;opacity:0;pointer-events:none;transition:opacity 1.2s}
.gufo{position:absolute;left:0;top:0;z-index:4700;transition:transform 1.6s ease-in-out}.gufo i{position:absolute;left:30px;top:44px;width:50px;height:0;background:linear-gradient(rgba(255,243,160,.75),rgba(255,243,160,0));clip-path:polygon(35% 0,65% 0,100% 100%,0 100%);transition:height .6s}.gufo.beam i{height:300px}
.gball{position:absolute;left:0;top:0;z-index:4200;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#dfe9f2 70%,#c6d4e2)}
.grain{position:absolute;left:150px;top:40px;width:700px;height:350px;z-index:5;border-radius:350px 350px 0 0;background:radial-gradient(circle at 50% 100%,transparent 52%,#B58CFF 52%,#B58CFF 55%,#7FD3FF 55%,#7FD3FF 58%,#8CE07A 58%,#8CE07A 61%,#FFE066 61%,#FFE066 64%,#FFB347 64%,#FFB347 67%,#FF5A5A 67%,#FF5A5A 70%,transparent 70%);opacity:.8;animation:gfade 6s ease forwards}@keyframes gfade{0%{opacity:0}15%,80%{opacity:.8}100%{opacity:0}}
.mv.rbow .mvi{animation:grb 1s linear infinite}@keyframes grb{to{filter:hue-rotate(360deg) saturate(1.4)}}
.ghyp{position:absolute;inset:0;z-index:4500;background:repeating-conic-gradient(from 0deg at 50% 45%,rgba(255,255,255,.6) 0 2deg,transparent 2deg 9deg);animation:ghyp 1.6s ease-out forwards}@keyframes ghyp{0%{opacity:0;transform:scale(.6)}30%{opacity:1}100%{opacity:0;transform:scale(2.2)}}
.gghost{position:absolute;z-index:4600;width:46px;height:56px;border-radius:23px 23px 6px 6px;background:rgba(255,255,255,.9);animation:gghost 4s ease-in-out forwards}.gghost::before,.gghost::after{content:'';position:absolute;top:18px;width:7px;height:9px;border-radius:4px;background:#2a2a3a}.gghost::before{left:12px}.gghost::after{right:12px}@keyframes gghost{0%{opacity:0;transform:translateY(20px)}20%,80%{opacity:.9}50%{transform:translate(40px,-20px)}100%{opacity:0;transform:translate(80px,0)}}
.gwind{position:absolute;left:0;top:0;z-index:4300;animation:gspin .5s linear infinite}@keyframes gspin{50%{filter:brightness(1.1)}}
@keyframes garc{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy) + 30px))}}
.mv{position:absolute;left:0;top:0;pointer-events:none;will-change:transform}.mv .mvi{width:100%;height:100%;transform-origin:50% 92%}.mv svg{width:100%;height:100%;display:block;overflow:visible}
.gbed{position:absolute;transform:translate(-50%,-100%);pointer-events:none;transform-origin:50% 100%;animation:gbedin .7s cubic-bezier(.2,1.5,.4,1)}.gbed svg{display:block;width:100%;height:auto;overflow:visible}.gbed.out{animation:gbedout .6s ease-in forwards}@keyframes gbedin{from{transform:translate(-50%,-100%) scale(0);opacity:0}}@keyframes gbedout{to{transform:translate(-50%,-100%) scale(.2);opacity:0}}
.gland .wl{opacity:0;transition:opacity 1.2s}.gscene.night .gland .wl{opacity:1}.gland .dy{transition:opacity 1.2s}.gscene.night .gland .dy{opacity:0}
.zzz{position:absolute;left:62%;top:4%;font:900 18px system-ui;color:#7d8cff;pointer-events:none;width:30px;height:40px}.zzz.abs{transform:translate(-50%,-100%)}.zzz b{position:absolute;left:0;bottom:0;opacity:0;animation:zzz 2.4s ease-in infinite;text-shadow:0 0 4px #fff}.zzz b:nth-child(2){animation-delay:.8s;font-size:1.25em}.zzz b:nth-child(3){animation-delay:1.6s;font-size:1.55em}
@keyframes zzz{0%{opacity:0;transform:translate(0,0) scale(.5) rotate(-10deg)}20%{opacity:1}100%{opacity:0;transform:translate(16px,-34px) scale(1.15) rotate(12deg)}}
.gg{position:absolute;transform:translate(-50%,-100%);pointer-events:none;animation:ggrow var(--d) ease-out forwards;transform-origin:50% 100%}.gg svg{display:block;width:calc(20px*var(--k));overflow:visible}@keyframes ggrow{0%{transform:translate(-50%,-100%) scale(0)}12%{transform:translate(-50%,-100%) scale(1.15)}20%,80%{transform:translate(-50%,-100%) scale(1);opacity:1}100%{transform:translate(-50%,-100%) scale(.6);opacity:0}}
.gbolt{position:absolute;pointer-events:none;animation:gbolt .45s steps(2) forwards}@keyframes gbolt{50%{opacity:.3}100%{opacity:0}}
.abx{position:absolute;left:50%;top:0;pointer-events:none}.abx-falter b{position:absolute;width:8px;height:6px;border-radius:50%;background:#FF8FC8;box-shadow:5px 0 0 #B58CFF;animation:abfl 3s linear infinite;transform-origin:0 30px}.abx-falter b:nth-child(2){animation-delay:-1.5s;background:#FFE066;box-shadow:5px 0 0 #7FD3FF}@keyframes abfl{to{transform:rotate(360deg)}}
.abx-wolke{top:-14%}.abx-wolke b{position:absolute;left:-18px;top:0;width:36px;height:13px;border-radius:9px;background:#e6edf5;box-shadow:8px -6px 0 -1px #e6edf5,-8px -4px 0 -2px #e6edf5}.abx-wolke s{position:absolute;top:14px;width:2px;height:6px;background:#7fd3ff;border-radius:1px;animation:abrain .6s linear infinite}.abx-wolke s:nth-child(2){left:-9px}.abx-wolke s:nth-child(3){left:0;animation-delay:.2s}.abx-wolke s:nth-child(4){left:9px;animation-delay:.4s}@keyframes abrain{from{transform:translateY(0);opacity:1}to{transform:translateY(16px);opacity:0}}
.mvb{position:absolute;left:50%;top:-4px;transform:translate(-50%,-100%);font-style:normal;font:700 15px system-ui;background:#fff;color:#23303c;border-radius:12px;padding:3px 8px;box-shadow:0 2px 6px rgba(0,0,0,.25);white-space:nowrap;animation:mvb .3s cubic-bezier(.2,1.6,.4,1);z-index:2}.mvb::after{content:'';position:absolute;left:50%;bottom:-6px;margin-left:-5px;border:5px solid transparent;border-top-color:#fff;border-bottom:0}@keyframes mvb{from{transform:translate(-50%,-60%) scale(.3)}}
.gballs{position:absolute;left:0;top:0;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 30%,#E5483B 31% 55%,#fff 56%);box-shadow:0 1px 2px rgba(0,0,0,.3)}
.mv .mvl{position:absolute;left:50%;top:-6px;transform:translateX(-50%);white-space:nowrap;font:600 11px system-ui;color:#23303c;background:rgba(255,255,255,.85);padding:1px 7px;border-radius:9px}
.mv .idle{animation:none}
.mv.w .lgA,.mv.w .arm{animation:mvA var(--T) ease-in-out infinite}.mv.w .lgB{animation:mvA var(--T) ease-in-out infinite;animation-delay:calc(var(--T) / -2)}
@keyframes mvA{0%,100%{transform:rotate(24deg)}50%{transform:rotate(-24deg)}}
.mv.w .walk{animation:mvBob calc(var(--T) / 2) ease-in-out infinite alternate}@keyframes mvBob{to{transform:translateY(-1.3px)}}
.mv.w .hdS{animation:mvNod var(--T) ease-in-out infinite}@keyframes mvNod{50%{transform:rotate(-3deg)}}
.mv.wf .fL{animation:mvStep var(--T) ease-in-out infinite}.mv.wf .fR{animation:mvStep var(--T) ease-in-out infinite;animation-delay:calc(var(--T) / -2)}
@keyframes mvStep{0%,50%,100%{transform:translateY(0)}25%{transform:translateY(-3.2px)}}
.mv.hp .lgA,.mv.hp .lgB{transform:rotate(-38deg)}
.mv.cl .clA{animation:mvCl var(--T) ease-in-out infinite}.mv.cl .clB{animation:mvCl var(--T) ease-in-out infinite;animation-delay:calc(var(--T) / -2)}
@keyframes mvCl{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
.mv:not(.fl) .wgS:not(.buzzw){animation:none}
.mv.fl .wgN,.mv.fl .wgF{animation:mvFlap var(--F) ease-in-out infinite}.mv.fl .wgF{animation-delay:calc(var(--F) / -14)}
@keyframes mvFlap{0%,100%{transform:rotate(18deg)}50%{transform:rotate(-62deg) scaleY(.82)}}
.mv.fl.gl .wgN,.mv.fl.gl .wgF{animation:none;transform:rotate(-34deg);transition:transform .3s}
.mv.fl .buzzw{animation-duration:var(--F)!important}
.mv.sw .hdS{animation:mvNod 2.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.mv *{animation:none!important}}`;

  window.FPMOTION = { ABIL, GROUND, T, SOCIAL, BED_OF, BED_TXT, GARDEN, SPECIAL, REACT, SEASONS, SCRIPTS, Scene, AB, T, G, PLACE_TXT, CLIMB_TXT, FLY_TXT, CSS, route, inPond, depth };
})();
