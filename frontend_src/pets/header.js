/* Family Planer – the planner header scene (house + pool) as a second world for the pet motion engine (design draft, round 13).
   Same coordinates as the real header: viewBox 0 0 1200 120, house centred at x 640, pool right in front of it. */
(() => {
  const M = window.FPMOTION; const rnd = (a, b) => a + Math.random() * (b - a);
  // house, garage and pool come from the house builder: the pets follow the house that is really drawn
  const HG = window.FPHOUSE.geo();
  const inPool = HG.inPool || (() => false);
  const bush = (x, y, w, c) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-${w * .45}" rx="${w}" ry="${w * .55}" fill="${c || '#3f9a3a'}"/><ellipse cx="${-w * .45}" cy="-${w * .35}" rx="${w * .6}" ry="${w * .45}" fill="#4caa44"/><ellipse cx="${w * .5}" cy="-${w * .4}" rx="${w * .55}" ry="${w * .45}" fill="#56b34b"/><circle cx="${-w * .2}" cy="-${w * .7}" r="1.4" fill="#FF8FB0"/><circle cx="${w * .35}" cy="-${w * .55}" r="1.4" fill="#fff"/></g>`;
  const PLANTS = [
    [106, `<g transform="translate(794 106)"><rect x="-3" y="-38" width="6" height="38" fill="#8a5a34"/><path d="M2 -30 L26 -34" stroke="#8a5a34" stroke-width="3"/><circle cx="0" cy="-46" r="18" fill="#4fa83f"/><circle cx="-12" cy="-38" r="11" fill="#5fb548"/><circle cx="13" cy="-40" r="12" fill="#5fb548"/><circle cx="-6" cy="-48" r="2.4" fill="#e5483b"/><circle cx="8" cy="-38" r="2.4" fill="#e5483b"/></g>`],
    [103, `<g transform="translate(864 103)"><rect x="-2.5" y="-30" width="5" height="30" fill="#7a4a2a"/><circle cx="0" cy="-38" r="14" fill="#d9572e"/><circle cx="-9" cy="-30" r="9" fill="#e86a38"/><circle cx="9" cy="-31" r="9" fill="#c94a26"/></g>`],
    [110, `<ellipse cx="736" cy="110" rx="17" ry="3.4" fill="#8a5a34"/>${[[724, 109, '#FF7FA6'], [730, 111, '#FFE066'], [736, 112, '#FFC94D'], [742, 110, '#FF7FA6'], [748, 108, '#B58CFF']].map(([x, y, c]) => `<path d="M${x} ${y} v-10" stroke="#4c9a38" stroke-width="1.4"/><ellipse cx="${x - 2}" cy="${y - 5}" rx="2.4" ry="1" fill="#5fb548"/><circle cx="${x}" cy="${y - 11}" r="2.8" fill="${c}"/><circle cx="${x}" cy="${y - 11}" r="1" fill="#FFF3B0"/>`).join('')}`],
    [107, bush(455, 107, 11)], [109, bush(1015, 109, 13, '#358a32')], [101, bush(548, 101, 8)], [114, bush(985, 114, 7)],
    [108, `<g transform="translate(520 108)"><rect x="-9" y="-12" width="18" height="12" fill="#C98A52"/><path d="M-11 -11 L0 -19 L11 -11z" fill="#8a4f2a"/><path d="M-4 0 v-6 a4 4 0 0 1 8 0 v6z" fill="#3a2414"/></g>`],
    [116, `<g transform="translate(714 116)"><ellipse cx="0" cy="-2" rx="8" ry="3" fill="#b9874e"/><ellipse cx="0" cy="-3" rx="6.4" ry="1.8" fill="#FF8FB0"/></g><g transform="translate(764 116)"><ellipse cx="0" cy="-2" rx="12" ry="3.4" fill="#d8b066"/><ellipse cx="0" cy="-2.6" rx="9" ry="2.2" fill="#e8c87e"/></g>`],
    [112, `<g transform="translate(872 112)"><rect x="-1.4" y="-34" width="2.8" height="34" fill="#a8693f"/><rect x="-5" y="-42" width="10" height="9" fill="#E9C27A"/><path d="M-6.5 -41 L0 -47 L6.5 -41z" fill="#C4553A"/><circle cx="0" cy="-37.5" r="1.7" fill="#3a2414"/></g>`],
    [110, `<g transform="translate(960 110)"><ellipse cx="0" cy="0" rx="16" ry="4" fill="#ddbb82"/><ellipse cx="7" cy="-.5" rx="3" ry="1.5" fill="#5a3a1e"/></g>`],
  ];
  const bgSvg = () => `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:1200px;height:120px">
      <defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc4f2"/><stop offset="1" stop-color="#d8efff"/></linearGradient></defs>
      <rect width="1200" height="120" fill="url(#hsky)"/>
      <path d="M0 80 L120 46 L220 72 L330 38 L460 74 L560 52 L700 78 L820 44 L960 70 L1080 40 L1200 66 V100 H0z" fill="#b9cfe6"/><path d="M300 52 L330 38 L360 52 Z M800 54 L820 44 L842 55 Z M1060 50 L1080 40 L1100 51Z" fill="#fff"/>
      <path d="M0 98 C160 90 340 104 520 96 C700 89 900 104 1200 98 V120 H0Z" fill="#79c257"/><path d="M0 108 C300 104 600 112 1200 106 V120 H0Z" fill="#6ab34b"/>
      <g fill="#ffffff" opacity=".9"><ellipse cx="180" cy="22" rx="30" ry="9"/><ellipse cx="200" cy="17" rx="18" ry="9"/><ellipse cx="980" cy="16" rx="26" ry="8"/></g>
      <rect x="562" y="67" width="36" height="31" fill="#e9e4dc"/><rect x="562" y="62" width="36" height="5" fill="#9fdcff" opacity=".7"/>
      <rect x="598" y="54.8" width="84" height="43.5" fill="#f6f1ea"/><path d="M592 32 L640 3.5 L688 32" stroke="#5a5f6a" stroke-width="5.2" fill="none" stroke-linejoin="round"/><path d="M596 33 L640 7 L684 33 V55 H596Z" fill="#f6f1ea"/>
      <rect x="664" y="11" width="7" height="15" fill="#8a8f99"/><rect x="610" y="37" width="21" height="12" fill="#bfe6ff"/><rect x="649" y="37" width="21" height="12" fill="#bfe6ff"/>
      <rect x="605" y="82" width="28" height="16" fill="#9fd4f0"/><rect x="638" y="82" width="17" height="16" fill="#7fc0e6"/><rect x="659" y="82" width="18" height="16" fill="#9fd4f0"/><rect x="599" y="77" width="81" height="3" fill="#8a6a4a"/>
      <rect x="571" y="99" width="138" height="13.5" rx="2" fill="#e8e2d6"/><rect x="577" y="101.3" width="126" height="8.2" fill="#5ec3ec"/><path d="M590 104 h20 M640 106 h24 M680 103 h12" stroke="#fff" stroke-width=".8" opacity=".7"/>
      <rect class="gcover" x="577" y="101.3" width="126" height="8.2" fill="#3f4f5c" style="opacity:0;transition:opacity .8s"/><path class="gcover" d="M608.5 101.3 V109.5 M640 101.3 V109.5 M671.5 101.3 V109.5" stroke="#5a6c7a" style="opacity:0;transition:opacity .8s"/>
    </svg>`;
  // zones: where animals may go (walk), only fliers (air), the pool, hiding places, and no-go
  const ZONES = [
    { n: 'Wiese links', c: '#8CE07A', r: [380, 101, 560, 118], walk: 3 },
    ...(HG.pool ? [{ n: 'Terrasse vor dem Pool', c: '#FFD34D', r: HG.terrace, walk: 1 },
      { n: 'Pool – offen: baden, zu: auf der Abdeckung', c: '#3AA0DA', r: HG.pool, pool: 1 }] : []),
    { n: 'Blumenbeet', c: '#FF8FB0', r: [718, 104, 754, 112] },
    { n: 'Unter dem Apfelbaum', c: '#2E8A4A', r: [770, 104, 830, 118], walk: 1 },
    { n: 'Wiese rechts', c: '#8CE07A', r: [754, 101, 1060, 118], walk: 4 },
    ...(HG.garageAir ? [{ n: 'Garagendach – Flieger und Kletterer', c: '#B58CFF', r: HG.garageAir, air: 1 }] : []),
    { n: 'Hausdach – nur Flieger', c: '#B58CFF', r: HG.roofAir, air: 1 },
    { n: 'Haus – kein Zutritt', c: '#E5483B', r: HG.body, no: 1 },
  ];
  const HIDES = [{ x: 455, y: 105, n: 'hinter dem Busch' }, { x: 1015, y: 107, n: 'hinter dem grossen Busch' }, { x: 548, y: 99.6, n: 'hinter dem Busch an der Garage' }, { x: 794, y: 104.6, n: 'hinter dem Apfelbaum' }, { x: 736, y: 107.5, n: 'im Blumenbeet' }, { x: 985, y: 112.5, n: 'hinter dem kleinen Busch' }];
  const zonesSvg = () => `<svg class="gzones" viewBox="0 0 1200 120" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:1200px;height:120px;z-index:4300;pointer-events:none">${ZONES.map((z) => `<rect x="${z.r[0]}" y="${z.r[1]}" width="${z.r[2] - z.r[0]}" height="${z.r[3] - z.r[1]}" fill="${z.c}" fill-opacity="${z.no ? .25 : .28}" stroke="${z.c}" stroke-width=".8" ${z.air ? 'stroke-dasharray="3 2"' : ''} rx="1.5"/>`).join('')}${HIDES.map((h) => `<circle cx="${h.x}" cy="${h.y}" r="2.4" fill="#fff" stroke="#2a3140" stroke-width=".6"/><text x="${h.x}" y="${h.y + .9}" text-anchor="middle" font-size="3" font-weight="900" fill="#2a3140">👀</text>`).join('')}${ZONES.map((z, i) => `<text x="${(z.r[0] + z.r[2]) / 2}" y="${z.no ? 70 : z.r[1] - 1.5}" text-anchor="middle" font-size="4.6" font-weight="800" fill="#1e2430" stroke="#fff" stroke-width="1.6" paint-order="stroke" font-family="system-ui">${z.n}</text>`).join('')}</svg>`;
  const pickZone = () => { const W = ZONES.filter((z) => z.walk); const tot = W.reduce((a, z) => a + z.walk, 0); let r = Math.random() * tot; for (const z of W) { r -= z.walk; if (r <= 0) return z; } return W[0]; };
  const HEADER = {
    W: 1200, H: 120, y0: 98, y1: 118, base: 46, sk: .3, zk: .3, fxk: .55, rippleK: .22, poolOpen: true,
    pond: HG.swim,
    tree: { x: 794, y: 106, branchY: 72, branchX: 812 },
    branchZ: (x) => 106 - (74 - (x - 794) * .12),
    roof: HG.roofPerch, stone: HG.garagePerch, post: { x: 872, y: 112, z: 34 },
    flowers: [[724, 109], [736, 112], [748, 108]], bowl: { x: 700, y: 116 }, nest: { x: 764, y: 116 }, hill: { x: 960, y: 110 },
    cover: HG.cover, race: [740, 1060, 109, 113],
    beds: { huette: { x: 520, y: 108 }, korb: { x: 714, y: 116 }, vogelhaus: { x: 872, y: 112, z: 34 }, seerose: { x: 660, y: 106 }, bau: { x: 960, y: 110 }, nest: { x: 764, y: 116 } },
    hides: HIDES, zones: ZONES,
    free: () => { for (;;) { const z = pickZone(); const p = [rnd(z.r[0] + 4, z.r[2] - 4), rnd(z.r[1] + .5, z.r[3] - .5)]; if (!inPool(p[0], p[1])) return p; } },
    draw: () => bgSvg() + PLANTS.map(([z, inner]) => `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:1200px;height:120px;z-index:${z};pointer-events:none">${inner}</svg>`).join(''),
  };
  window.FPHEADER = { HEADER, ZONES, HIDES, zonesSvg, inPool, HOUSE: HG };
})();
