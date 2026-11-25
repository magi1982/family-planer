// ---------------------------------------------------------------------------------------------------------
// The house in the header, built from parts (house builder). The settings choose the parts; today's house is the
// default and is drawn exactly as before (a test compares the markup for hundreds of situations).
// draw(o, cfg)     – house, annexes, pool or terrace (drawing coordinates: centre x 956, ground 98)
// drawPond(o, cfg) – the garden pond (header coordinates), only when the house shows one
// geo(cfg)         – where everything is, in header coordinates (the house sits at x 640, scaled .75): roof line,
//                    chimney, walls, garage roof, water. The pets take their places from here, so they never stand
//                    in a wall or swim on the lawn, whatever house is chosen.
// features(cfg)    – what the house has (pool, garage): tap stories that need one only play when it is there
// window.FPHOUSE = { DEFAULT, OPTIONS, PRESETS, clean, use, current, draw, drawPond, geo, features, toHeader }
// shapes: width (normal/narrow/wide), 1–3 floors, 8 roof forms, chimney on or off; PRESETS are ready-made houses
// ---------------------------------------------------------------------------------------------------------
(() => {
  if (window.FPHOUSE) return;
  // the parts (keys are stored in the settings; the server checks them against the same lists)
  const WALL = { creme: '#f1e3c8', weiss: '#f6f3ee', grau: '#c9ccd2', sand: '#e2c99a', gelb: '#f0d57a', rot: '#c96b55', blau: '#9cb8d6', gruen: '#a9c79a', schwedenrot: '#9b3a2e', anthrazit: '#565c66' };
  const ROOF = { ziegel: '#b5523b', dunkelrot: '#8a3428', schiefer: '#4d5562', anthrazit: '#2f343b', gruen: '#4f7a4a', braun: '#7a4f33', blau: '#3f5f8a', kupfer: '#5f9e8a' };
  const SHUT = { none: null, gruen: '#3f7a46', blau: '#3f6a9a', rot: '#a83a2e', weiss: '#f4f4f4', holz: '#8a5a34' };
  const OPTIONS = {
    wall: Object.keys(WALL), roof: Object.keys(ROOF), windows: ['steg', 'sprossen', 'gross', 'bogen'], shutters: Object.keys(SHUT),
    facade: ['glatt', 'holz', 'klinker', 'fachwerk', 'sockel'],
    left: ['garage', 'carport', 'huette', 'winter', 'turm', 'velo', 'pergola', 'none'],
    right: ['none', 'garage', 'carport', 'huette', 'winter', 'turm', 'velo', 'pergola'],
    water: ['pool', 'rund', 'jacuzzi', 'plansch', 'none'], pond: ['auto'],
    width: ['normal', 'schmal', 'breit'], floors: ['2', '1', '3'], roofform: ['sattel', 'krueppel', 'walm', 'zelt', 'mansarde', 'pult', 'flach', 'tonne'], chimney: ['ja', 'nein'],
  };
  // today's house: tall gable house, garage with a frosted-glass railing on the left, pergola, pool in front
  const DEFAULT = Object.freeze({ wall: 'creme', roof: 'ziegel', windows: 'steg', shutters: 'none', facade: 'glatt', left: 'garage', right: 'none', water: 'pool', pond: 'auto', width: 'normal', floors: '2', roofform: 'sattel', chimney: 'ja' });
  // ready-made houses (the settings show them as pictures; a tap sets these parts, the rest stays as chosen)
  const PRESETS = [
    { id: 'giebel', set: { width: 'normal', floors: '2', roofform: 'sattel', chimney: 'ja' } },
    { id: 'bungalow', set: { width: 'breit', floors: '1', roofform: 'walm', chimney: 'ja', wall: 'weiss', roof: 'schiefer', windows: 'gross' } },
    { id: 'chalet', set: { width: 'breit', floors: '2', roofform: 'krueppel', chimney: 'ja', wall: 'sand', roof: 'braun', facade: 'holz', shutters: 'gruen', windows: 'sprossen' } },
    { id: 'modern', set: { width: 'breit', floors: '2', roofform: 'flach', chimney: 'nein', wall: 'weiss', roof: 'anthrazit', facade: 'glatt', windows: 'gross', shutters: 'none' } },
    { id: 'stadt', set: { width: 'schmal', floors: '3', roofform: 'mansarde', chimney: 'ja', wall: 'gelb', roof: 'schiefer', windows: 'sprossen', shutters: 'blau' } },
    { id: 'landhaus', set: { width: 'breit', floors: '2', roofform: 'walm', chimney: 'ja', wall: 'creme', roof: 'dunkelrot', facade: 'sockel', shutters: 'holz' } },
    { id: 'architekt', set: { width: 'normal', floors: '2', roofform: 'pult', chimney: 'nein', wall: 'grau', roof: 'anthrazit', facade: 'holz', windows: 'gross', shutters: 'none' } },
    { id: 'maerchen', set: { width: 'schmal', floors: '1', roofform: 'zelt', chimney: 'ja', wall: 'rot', roof: 'gruen', windows: 'bogen', shutters: 'weiss' } },
    { id: 'bogen', set: { width: 'normal', floors: '1', roofform: 'tonne', chimney: 'nein', wall: 'blau', roof: 'kupfer', windows: 'bogen' } },
    { id: 'turmhaus', set: { width: 'schmal', floors: '3', roofform: 'sattel', chimney: 'ja', wall: 'schwedenrot', roof: 'anthrazit', facade: 'holz', shutters: 'weiss' } },
  ];
  const clean = (cfg) => { const c = {}; Object.keys(DEFAULT).forEach((k) => { const v = cfg && cfg[k]; c[k] = OPTIONS[k].includes(v) ? v : DEFAULT[k]; }); return c; };
  let CUR = { ...DEFAULT };
  const use = (cfg) => { CUR = clean(cfg); return CUR; };
  const current = () => CUR;

  const CX = 956; const GROUND = 98; const FLOOR = 29; const SCALE = 0.75; const WIDTH = { normal: 112, schmal: 96, breit: 128 };
  // today's body: normal width, two floors, gable roof (drawn with exactly the numbers used before the house builder)
  const todayBody = (c) => c.width === 'normal' && c.floors === '2' && c.roofform === 'sattel';
  // height of a roof line at x (the line runs left to right)
  const yAt = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i]; const b = pts[i + 1]; if (x >= a[0] && x <= b[0]) return b[0] === a[0] ? Math.min(a[1], b[1]) : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return null; };
  const q = (n) => Math.round(n * 100) / 100;
  const toHeader = (x, y) => [640 + SCALE * (x - CX), 99 + SCALE * (y - 99)];
  const swims = (c) => c.water === 'pool' || c.water === 'rund';
  const hasPond = (c) => c.pond === 'on' || !swims(c);
  // shape: today's body with its chimney – stories drawn onto today's roof and chimney only play then
  const features = (cfg) => { const c = clean(cfg || CUR); return { pool: swims(c), garage: c.left === 'garage', shape: todayBody(c) && c.chimney === 'ja' }; };
  const dark = (hex, k) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k).toString(16).padStart(2, '0')).join(''); };

  // the roof forms (front view): line = outer edge of the roof (pets land on it, snow lies on it), wall = gable or
  // wall part above the top floor, fill = roof surface seen from the front, stroke = edge drawn as a thick line
  const roofOf = (form, x0, x1, top, rise) => {
    const e = top + 4; const L = x0 - 8; const Rr = x1 + 8; const hw = (x1 - x0) / 2;
    switch (form) {
      case 'krueppel': { // half-hipped: a gable with its tip cut off by a small hip
        const xa = q(CX - hw * 0.55); const xb = q(CX + hw * 0.55); const s = (rise + 6) / (hw + 8); const ya = q(e - s * (xa - L)); const p = q(top - rise - 2);
        return { line: [[L, e], [xa, ya], [CX, p], [xb, ya], [Rr, e]], wall: `M${x0} ${top} L${xa} ${q(ya + 3)} L${xb} ${q(ya + 3)} L${x1} ${top}Z`, fill: `M${xa} ${ya} L${CX} ${p} L${xb} ${ya}Z`, stroke: 1 }; }
      case 'walm': { // hipped, eaves to the front: the roof surface is a trapezoid
        const h = q(top - rise * 0.78); const a = q(CX - hw * 0.42); const b = q(CX + hw * 0.42);
        return { line: [[L, e], [a, h], [b, h], [Rr, e]], fill: `M${L} ${e} L${a} ${h} L${b} ${h} L${Rr} ${e}Z`, hips: [[a, h, q(L + 14), e], [b, h, q(Rr - 14), e]] }; }
      case 'zelt': { // pyramid roof
        const p = q(top - rise * 1.05);
        return { line: [[L, e], [CX, p], [Rr, e]], fill: `M${L} ${e} L${CX} ${p} L${Rr} ${e}Z`, hips: [[CX, p, CX, e]], half: `M${L} ${e} L${CX} ${p} L${CX} ${e}Z` }; }
      case 'mansarde': { // steep lower part with dormers, flat upper part
        const m = q(top - rise * 0.55); const p = q(top - rise * 0.85);
        return { line: [[x0 - 6, e], [x0 + 5, m], [x0 + 22, p], [x1 - 22, p], [x1 - 5, m], [x1 + 6, e]], fill: `M${x0 - 6} ${e} L${x0 + 5} ${m} L${x0 + 22} ${p} L${x1 - 22} ${p} L${x1 - 5} ${m} L${x1 + 6} ${e}Z`, upper: `M${x0 + 5} ${m} L${x0 + 22} ${p} L${x1 - 22} ${p} L${x1 - 5} ${m}Z`, dormers: [q(x0 + hw * 0.5 - 7), q(x1 - hw * 0.5 - 7)], dy: q(m + 2) }; }
      case 'pult': { // shed roof: high on the left, low on the right
        const hi = q(top - rise * 0.8);
        return { line: [[x0 - 6, q(hi - 2)], [Rr, e]], wall: `M${x0} ${top} V${hi} L${x1} ${q(top + 2)} V${top}Z`, stroke: 1 }; }
      case 'flach': // flat roof with a parapet
        return { line: [[x0 - 4, top - 5], [x1 + 4, top - 5]], parapet: [x0 - 4, top - 5, x1 - x0 + 8, 6] };
      case 'tonne': { // barrel roof: one round arch
        const k = top - rise * 1.1; const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([q((1 - t) ** 2 * L + 2 * t * (1 - t) * CX + t * t * Rr), q((1 - t) ** 2 * e + 2 * t * (1 - t) * k + t * t * e)]); }
        return { line: pts, wall: `M${x0} ${top} Q${CX} ${q(k + 4)} ${x1} ${top}Z`, arc: `M${L} ${e} Q${CX} ${q(k)} ${Rr} ${e}`, stroke: 1 }; }
      default: // gable to the front: today's roof
        return { line: [[L, e], [CX, top - rise - 2], [Rr, e]], wall: `M${x0} ${top} L${CX} ${top - rise} L${x1} ${top}Z`, stroke: 1 };
    }
  };

  // all measures of one house in drawing coordinates – the only place where the shape is decided
  const shape = (cfg) => {
    const c = clean(cfg); const W = WIDTH[c.width]; const nf = Number(c.floors);
    const x0 = CX - W / 2; const x1 = CX + W / 2; const top = GROUND - nf * FLOOR;
    const rise = W * 2 / 7; // gable height: 32 on a 112 wide house
    const R = roofOf(c.roofform, x0, x1, top, rise);
    const chx = x1 - 24; const chy = Math.max(-32, Math.round(yAt(R.line, chx + 4.5) - 18)); // -32: the top edge of the header picture
    const annex = (kind, side) => (kind === 'none' ? null : { kind, side, x0: side < 0 ? x0 - 48 : x1, x1: side < 0 ? x0 : x1 + 48,
      top: { garage: 55, carport: 63, huette: 70, winter: 63, turm: 4, velo: 71, pergola: 66 }[kind] });
    return {
      c, x0, x1, top, nf, W, peak: top - rise, roof: R,
      roofLine: R.line,
      chimney: c.chimney === 'ja' ? { x: chx, y: chy, w: 9, h: 20 } : null,
      annexes: [annex(c.left, -1), annex(c.right, 1)].filter(Boolean),
      garage: c.left === 'garage' ? { x0: x0 - 48, x1: x0, top: 68, roof: 66, rail: 55 } : null,
      pool: { x1: 872, x2: 1040, y1: 102, y2: 113, tile: [864, 99, 1048, 117] },
    };
  };

  const TILE = '#C9CDD2';
  const pool = (o, x1, x2, y1, y2) => {
    // covered in winter and every night: closed at 22:00 at the latest, open again from 8:00
    const winter = o.snow || o.jz === 'winter' || (o.hour != null && (o.hour >= 22 || o.hour < 8));
    const shp = `M${x1} ${y1} H${x2} V${y2} H${x1}Z`;
    let g = `<path d="${`M${x1 - 8} ${y1 - 3} H${x2 + 8} V${y2 + 4} H${x1 - 8}Z`}" fill="${o.snow ? '#eef4fa' : TILE}"/>`;
    if (winter) return g + `<path d="${shp}" fill="#3f4f5c"/>` + [0.25, 0.5, 0.75].map((f) => `<line x1="${x1 + (x2 - x1) * f}" y1="${y1}" x2="${x1 + (x2 - x1) * f}" y2="${y2}" stroke="#6c7c88" stroke-width="1.2"/>`).join('') + (o.snow ? `<path d="${shp}" fill="#fff" opacity=".55"/>` : '');
    g += `<defs><linearGradient id="fpwater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.night ? '#1fb5c9' : '#5fe0ea'}"/><stop offset="1" stop-color="${o.night ? '#0b6f8a' : '#1fb0cf'}"/></linearGradient></defs><path d="${shp}" fill="url(#fpwater)"/>`;
    g += `<clipPath id="fppool"><path d="${shp}"/></clipPath><g clip-path="url(#fppool)"><g class="wave" style="animation-duration:6s">`;
    for (let x = x1 - 60; x < x2 + 60; x += 22) g += `<path d="M${x} ${y1 + 4} q5 -2 10 0 t10 0 M${x + 8} ${y1 + 9} q5 -2 10 0" stroke="#fff" stroke-width="1" fill="none" opacity=".55"/>`;
    g += '</g></g>';
    if (o.night) g += `<ellipse cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" rx="${(x2 - x1) / 2.4}" ry="${(y2 - y1) / 2.2}" fill="#7ff7ff" opacity=".25" class="sun"/>`;
    return g;
  };
  // the other waters in front of the house (same place as the pool)
  const otherWater = (o, kind) => {
    const winter = o.snow || o.jz === 'winter' || (o.hour != null && (o.hour >= 22 || o.hour < 8));
    const deck = o.snow ? '#eef4fa' : '#d8c4a2'; const water = o.night ? '#1fa0bf' : '#5fd6ea';
    const lounger = (x) => `<path d="M${x} 112 h18 l4 -7" stroke="#f2f2f2" stroke-width="3" fill="none"/>`;
    if (kind === 'rund') return `<ellipse cx="${CX}" cy="107.5" rx="90" ry="9.5" fill="${o.snow ? '#eef4fa' : TILE}"/><ellipse cx="${CX}" cy="107.5" rx="82" ry="6.5" fill="${winter ? '#3f4f5c' : water}"/>`
      + (winter ? '' : `<path d="M${CX - 50} 106 q5 -2 10 0 t10 0 M${CX + 20} 109 q5 -2 10 0 t10 0" stroke="#fff" stroke-width="1" fill="none" opacity=".55"/>`);
    let g = `<rect x="864" y="104" width="184" height="12" rx="3" fill="${deck}"/>` + lounger(890) + lounger(918);
    if (kind === 'jacuzzi') g += `<ellipse cx="1010" cy="106" rx="22" ry="7" fill="#8a6a4a"/><ellipse cx="1010" cy="105.4" rx="17" ry="4.6" fill="${o.snow ? '#3f4f5c' : '#7fe0f0'}"/>` + (o.snow ? '' : '<circle cx="1003" cy="104.6" r="1" fill="#fff"/><circle cx="1015" cy="105.6" r="1" fill="#fff"/>');
    if (kind === 'plansch' && !o.snow) g += `<ellipse cx="1005" cy="108" rx="30" ry="6.6" fill="#3E8EDE"/><ellipse cx="1005" cy="107" rx="30" ry="5.8" fill="#FF7FA6"/><ellipse cx="1005" cy="107.4" rx="25" ry="4.2" fill="${water}"/><circle cx="993" cy="106.6" r="2" fill="#FFE066"/>`;
    if (kind === 'none' && o.jz === 'sommer') g += '<path d="M1010 112 V90" stroke="#7a5a36" stroke-width="2"/><path d="M992 95 Q1010 80 1028 95Z" fill="#E5604D"/>';
    return g;
  };
  // annexes left and right of the house (not the planer's garage on the left, which is drawn exactly as before)
  const annexS = (o, A, wall, roof) => {
    const x = A.x0; const s = A.side; const g0 = o.night ? '#FFD86B' : '#bfe6ff';
    const near = s < 0 ? A.x1 : A.x0; const far = s < 0 ? A.x0 : A.x1; // the side touching the house, the outer side
    switch (A.kind) {
      case 'garage': return `<rect x="${x}" y="68" width="48" height="30" fill="${wall}"/><rect x="${x - 2}" y="66" width="52" height="3" fill="#a7adb5"/><rect x="${x}" y="56" width="48" height="10" fill="#fff" opacity="${o.night ? 0.3 : 0.6}"/><rect x="${x}" y="55" width="48" height="1.6" fill="#a7adb5"/>`
        + (o.snow ? `<rect x="${x - 2}" y="53" width="52" height="2.5" rx="1.2" fill="#fff"/><rect x="${x - 2}" y="64.5" width="52" height="2" fill="#fff"/>` : '');
      case 'carport': return `<rect x="${x - 2}" y="63" width="52" height="4" fill="#6a7078"/><rect x="${x}" y="67" width="3" height="31" fill="#6a7078"/><rect x="${x + 45}" y="67" width="3" height="31" fill="#6a7078"/>`
        + `<path d="M${x + 8} 97 v-10 q3 -8 12 -8 h11 q8 0 12 8 v10z" fill="#E5604D"/><rect x="${x + 17}" y="82" width="17" height="5" fill="${g0}"/><circle cx="${x + 16}" cy="97" r="4" fill="#222"/><circle cx="${x + 38}" cy="97" r="4" fill="#222"/>`
        + (o.snow ? `<rect x="${x - 2}" y="60.6" width="52" height="2.6" rx="1.2" fill="#fff"/>` : '');
      case 'huette': { const hx = s < 0 ? x + 4 : x + 8; return `<rect x="${hx}" y="78" width="36" height="20" fill="#c98d5a"/><path d="M${hx} 82 h36 M${hx} 87 h36 M${hx} 92 h36" stroke="#a8703f" stroke-width=".8"/><path d="M${hx - 4} 80 L${hx + 18} 70 L${hx + 40} 80" fill="${roof}"/><rect x="${hx + 13}" y="85" width="10" height="13" fill="#6b4a2a"/>`
        + (o.snow ? `<path d="M${hx - 4} 78 L${hx + 18} 68 L${hx + 40} 78" stroke="#fff" stroke-width="2.4" fill="none"/>` : ''); }
      case 'winter': return `<rect x="${x}" y="68" width="48" height="30" fill="#d8f1ff" opacity=".6"/>${o.night ? `<rect x="${x}" y="68" width="48" height="30" fill="#FFD86B" opacity=".35"/>` : ''}<path d="M${x} 68 v30 M${x + 12} 68 v30 M${x + 24} 68 v30 M${x + 36} 68 v30 M${x + 48} 68 v30" stroke="#f4f4f4" stroke-width="1.6"/>`
        + `<path d="M${far} 69 L${near} 63" stroke="#f4f4f4" stroke-width="3"/><ellipse cx="${x + 14}" cy="92" rx="7" ry="6" fill="#4fa83f"/><ellipse cx="${x + 32}" cy="91" rx="6" ry="7" fill="#5fb548"/>`
        + (o.snow ? `<path d="M${far} 66.6 L${near} 60.6" stroke="#fff" stroke-width="2.4"/>` : '');
      case 'turm': { const tx = s < 0 ? x + 18 : x; return `<rect x="${tx}" y="30" width="30" height="68" fill="${wall}"/><path d="M${tx - 4} 31 L${tx + 15} 4 L${tx + 34} 31Z" fill="${roof}"/><path d="M${tx + 15} 4 v-6" stroke="#8a9098" stroke-width="1.2"/><path d="M${tx + 15} -2 l7 3 l-7 3z" fill="#E5604D"/>`
        + `<path d="M${tx + 9} 54 v-7 q6 -7 12 0 v7z" fill="${g0}" stroke="#fff" stroke-width="1.5"/><path d="M${tx + 9} 82 v-7 q6 -7 12 0 v7z" fill="${g0}" stroke="#fff" stroke-width="1.5"/>`
        + (o.snow ? `<path d="M${tx - 4} 29 L${tx + 15} 2 L${tx + 34} 29" stroke="#fff" stroke-width="2.4" fill="none"/>` : ''); }
      case 'velo': return `<path d="M${far} 75 L${near} 71" stroke="#6a7078" stroke-width="3.4"/><rect x="${s < 0 ? x + 1 : x + 44}" y="75" width="2.4" height="23" fill="#6a7078"/>`
        + [x + 12, x + 30].map((b) => `<circle cx="${b - 5}" cy="93" r="4.4" fill="none" stroke="#333" stroke-width="1.3"/><circle cx="${b + 5}" cy="93" r="4.4" fill="none" stroke="#333" stroke-width="1.3"/><path d="M${b - 5} 93 L${b - 1} 86 L${b + 5} 93 M${b - 1} 86 h4" stroke="#3E8EDE" stroke-width="1.3" fill="none"/>`).join('');
      case 'pergola': return `<rect x="${x}" y="70" width="48" height="4" fill="#7a5a36"/><rect x="${x + 2}" y="74" width="3" height="24" fill="#7a5a36"/><rect x="${x + 43}" y="74" width="3" height="24" fill="#7a5a36"/>`
        + [...Array(8)].map((_, i) => `<circle cx="${x + 3 + i * 6}" cy="${71 + (i % 2)}" r="4.4" fill="${o.snow ? '#e8eef3' : '#5fb548'}"/>`).join('') + `<path d="M${x + 14} 90 h20 M${x + 17} 90 v8 M${x + 31} 90 v8" stroke="#3a3f46" stroke-width="2"/>`;
      default: return '';
    }
  };
  // window of the upper floor in the chosen style (the planer's window: a pane with one bar in the middle)
  const win = (c, x, y, glass) => {
    let s = c.windows === 'bogen' ? `<path d="M${x} ${y + 16} V${y + 7} Q${x + 14} ${y - 4} ${x + 28} ${y + 7} V${y + 16}Z" fill="${glass}" stroke="#fff" stroke-width="2"/>`
      : `<rect x="${x}" y="${y}" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/>`;
    if (c.windows === 'steg') s += `<line x1="${x + 14}" y1="${y}" x2="${x + 14}" y2="${y + 16}" stroke="#fff" stroke-width="1.5"/>`;
    if (c.windows === 'sprossen') s += `<line x1="${x + 14}" y1="${y}" x2="${x + 14}" y2="${y + 16}" stroke="#fff" stroke-width="1.5"/><line x1="${x}" y1="${y + 8}" x2="${x + 28}" y2="${y + 8}" stroke="#fff" stroke-width="1.5"/>`;
    if (c.windows === 'gross') s += `<line x1="${x + 19}" y1="${y}" x2="${x + 19}" y2="${y + 16}" stroke="#fff" stroke-width="1.5"/>`;
    if (SHUT[c.shutters]) s += `<rect x="${x - 6}" y="${y}" width="4.5" height="16" fill="${SHUT[c.shutters]}"/><rect x="${x + 29.5}" y="${y}" width="4.5" height="16" fill="${SHUT[c.shutters]}"/>`;
    return s;
  };
  const facade = (c, x0, x1, top, night, nf) => {
    const w = x1 - x0;
    if (c.facade === 'holz') return [...Array(Math.floor(w / 5))].map((_, i) => `<path d="M${x0 + 3 + i * 5} ${top} V${GROUND}" stroke="#000" stroke-opacity=".13" stroke-width="1"/>`).join('');
    if (c.facade === 'klinker') { let g = ''; for (let y = top + 3; y < GROUND; y += 4) { g += `<path d="M${x0} ${y} H${x1}" stroke="#7a2a1e" stroke-opacity=".28" stroke-width=".6"/>`; for (let x = x0 + (((y - top) / 4) % 2 ? 4 : 0); x < x1; x += 8) g += `<path d="M${x} ${y} v4" stroke="#7a2a1e" stroke-opacity=".28" stroke-width=".6"/>`; } return g; }
    if (c.facade === 'fachwerk') { // timber frame on every upper floor
      const b = night ? '#3a2618' : '#5a3a22'; if ((nf || 2) < 2) return `<path d="M${x0} ${top + 1} H${x1}" stroke="${b}" stroke-width="2.4"/>`;
      let g = `<path d="M${x0} ${top + 1} H${x1}${[...Array((nf || 2) - 1)].map((_, k) => ` M${x0} ${GROUND - (k + 1) * FLOOR} H${x1}`).join('')}" stroke="${b}" stroke-width="2.4"/>`;
      for (let k = 1; k < (nf || 2); k++) { const yb = GROUND - k * FLOOR; const yt = yb - FLOOR; for (let i = 0; i <= 4; i++) { const x = x0 + w * i / 4; g += `<path d="M${x} ${yt} V${yb}" stroke="${b}" stroke-width="2.4"/>`; if (i < 4) g += `<path d="M${x} ${yb} L${x + w / 4} ${yt}" stroke="${b}" stroke-width="1.8"/>`; } }
      return g; }
    if (c.facade === 'sockel') return `<rect x="${x0}" y="86" width="${w}" height="12" fill="${night ? '#5d6168' : '#9a9ea6'}"/><path d="M${x0} 92 H${x1}" stroke="#80858d" stroke-width=".8"/>`;
    return '';
  };
  // thatched parasol (brown palm leaves), only out in summer
  const parasol = (o, x, ground) => {
    const top = ground - 28; let g = `<path d="M${x} ${ground} V${top}" stroke="#7a5a36" stroke-width="2"/><g class="sw" style="transform-origin:${x}px ${top}px">`;
    g += `<path d="M${x - 22} ${top + 6} Q${x} ${top - 12} ${x + 22} ${top + 6}Z" fill="#9c7444"/>`;
    for (let i = 0; i < 11; i++) { const lx = x - 22 + i * 4.4; g += `<path d="M${x} ${top - 6} L${lx.toFixed(1)} ${top + 6} l${(i % 2 ? 1.2 : -1.2)} 4" stroke="${i % 2 ? '#7d5a32' : '#b8905a'}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`; }
    return g + `<circle cx="${x}" cy="${top - 6}" r="2" fill="#6b4a2a"/></g>`;
  };
  const smoke = (o, x, y) => (o.smoke ? Array.from({ length: 3 }, (_, i) => `<circle class="smk" cx="${x}" cy="${y}" r="4" fill="#dfe3e8" style="--dx:${Math.round(12 + o.wind / 3)}px;animation-delay:-${i * 1.3}s"/>`).join('') : '');

  // snow, pool cover in winter, lights in the evening, fairy lights in Advent, icicles below -5°
  const draw = (o, cfg) => {
    const S = shape(cfg || CUR); const c = S.c; const { x0, x1, top } = S; const w = x1 - x0;
    const cold = typeof o.temp === 'number' && o.temp < -5;
    const glass = o.night ? '#2c3648' : '#bfe0ff';
    const wall = o.night ? (c.wall === 'creme' ? '#8f8574' : dark(WALL[c.wall], 0.6)) : WALL[c.wall];
    const roof = o.night ? (c.roof === 'ziegel' ? '#6e3326' : dark(ROOF[c.roof], 0.6)) : ROOF[c.roof];
    const late = o.hour != null && (o.hour >= 23 || o.hour < 6);
    const on = (x, y, ww, h, dur, dl) => `<rect class="wl" x="${x}" y="${y}" width="${ww}" height="${h}" rx="1" fill="${late ? '#2e4c86' : '#FFD86B'}" style="animation-duration:${dur}s;animation-delay:-${dl}s"/>`;
    const icicles = (a, b, y) => { let g = ''; for (let x = a + 3; x < b - 2; x += 6) { const l = 3 + ((x * 7) % 5); g += `<path d="M${x - 1.5} ${y} L${x} ${y + l} L${x + 1.5} ${y}Z" fill="#e8f7ff" opacity=".95"/>`; } return g; };
    let g = '';
    // garage, joined to the house; flat roof with frosted glass railing
    const G = S.garage;
    if (G) {
      const gw = G.x1 - G.x0;
      g += `<rect x="${G.x0}" y="${G.top}" width="${gw}" height="${GROUND - G.top}" fill="${wall}"/><rect x="${G.x0 - 2}" y="${G.roof}" width="${gw + 4}" height="3" fill="#a7adb5"/>`;
      g += `<rect x="${G.x0}" y="${G.rail + 1}" width="${gw}" height="10" fill="#fff" opacity="${o.night ? 0.3 : 0.6}"/><rect x="${G.x0}" y="${G.rail}" width="${gw}" height="1.6" fill="#a7adb5"/>`;
      if (o.snow) g += `<rect x="${G.x0 - 2}" y="${G.rail - 2}" width="${gw + 4}" height="2.5" rx="1.2" fill="#fff"/><rect x="${G.x0 - 2}" y="${G.roof - 1.5}" width="${gw + 4}" height="2" fill="#fff"/>`;
      if (cold) g += icicles(G.x0 - 2, G.x1 + 2, G.roof + 3);
    }
    S.annexes.forEach((A) => { if (!(A.side < 0 && G)) g += annexS(o, A, wall, roof); });
    // house: tall body, roof in the chosen form (today: gable to the front)
    const Rf = S.roof; const today = todayBody(c); const ln = Rf.line; const rl = ln[0]; const rr = ln[ln.length - 1];
    g += `<rect x="${x0}" y="${top}" width="${w}" height="${GROUND - top}" fill="${wall}"/>`;
    if (S.chimney) g += `<rect x="${S.chimney.x}" y="${S.chimney.y}" width="${S.chimney.w}" height="${S.chimney.h}" fill="#8a3b2b"/>` + smoke(o, S.chimney.x + 4, S.chimney.y - 2);
    if (Rf.wall) g += `<path d="${Rf.wall}" fill="${wall}"/>`;
    g += facade(c, x0, x1, top, o.night, S.nf);
    const pts = (P, dx, dy) => P.map(([x, y], i) => `${i ? 'L' : 'M'}${x + (i === 0 ? -dx : i === P.length - 1 ? dx : 0)} ${y + dy}`).join(' ');
    if (Rf.fill) {
      g += `<path d="${Rf.fill}" fill="${roof}"/>`;
      if (Rf.half) g += `<path d="${Rf.half}" fill="#000" opacity=".12"/>`;
      if (Rf.upper) g += `<path d="${Rf.upper}" fill="#000" opacity=".14"/>`;
      (Rf.hips || []).forEach(([a, b, cx2, d]) => { g += `<path d="M${a} ${b} L${cx2} ${d}" stroke="#000" stroke-opacity=".2" stroke-width="1.2"/>`; });
      g += `<path d="${pts(ln, 0, 0)}" fill="none" stroke="${dark(ROOF[c.roof], o.night ? 0.45 : 0.75)}" stroke-width="2" stroke-linejoin="round"/>`;
      (Rf.dormers || []).forEach((dx) => { g += `<path d="M${dx - 2} ${Rf.dy + 1} L${dx + 7} ${Rf.dy - 6} L${dx + 16} ${Rf.dy + 1}Z" fill="${roof}"/><rect x="${dx}" y="${Rf.dy}" width="14" height="10" fill="${wall}"/><rect x="${dx + 2.5}" y="${Rf.dy + 2}" width="9" height="7" fill="${o.night && !late ? '#FFD86B' : glass}" stroke="#fff" stroke-width="1"/>`; });
    }
    if (Rf.parapet) { const [px, py, pw, ph] = Rf.parapet; g += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${roof}"/><rect x="${px}" y="${py + ph - 1.4}" width="${pw}" height="1.4" fill="#000" opacity=".18"/>`; }
    if (Rf.stroke) g += Rf.arc ? `<path d="${Rf.arc}" fill="none" stroke="${roof}" stroke-width="7" stroke-linecap="round"/>`
      : today ? `<path d="M${rl[0]} ${rl[1]} L${ln[1][0]} ${ln[1][1]} L${rr[0]} ${rr[1]}" fill="none" stroke="${roof}" stroke-width="7" stroke-linejoin="round"/>`
        : `<path d="${pts(ln, 0, 0)}" fill="none" stroke="${roof}" stroke-width="7" stroke-linejoin="round"/>`;
    if (o.snow) g += Rf.parapet ? `<rect x="${Rf.parapet[0] - 1}" y="${Rf.parapet[1] - 2.5}" width="${Rf.parapet[2] + 2}" height="3" rx="1.4" fill="#fff"/>`
      : `<path d="${pts(ln, 2, -3)}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    if (cold) {
      if (today) {
        const rp = ln[1];
        g += '<g>' + Array.from({ length: 7 }, (_, i) => { const x = rl[0] + 4 + i * 9.5; const y = rl[1] - (x - rl[0]) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y} L${x} ${y + l} L${x + 1.4} ${y}Z" fill="#e8f7ff"/>`; }).join('')
          + Array.from({ length: 7 }, (_, i) => { const x = rp[0] + 4 + i * 9.5; const y = rp[1] + (x - rp[0]) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y + 4} L${x} ${y + 4 + l} L${x + 1.4} ${y + 4}Z" fill="#e8f7ff"/>`; }).join('') + '</g>';
      } else {
        let k = 0; g += '<g>';
        for (let i = 0; i < ln.length - 1; i++) { const a = ln[i]; const b = ln[i + 1]; for (let x = a[0] + 4; x < b[0] - 2; x += 9.5) { const y = q(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]) + 3); const l = 3 + (k++ % 3) * 2; g += `<path d="M${q(x - 1.4)} ${y} L${q(x)} ${q(y + l)} L${q(x + 1.4)} ${y}Z" fill="#e8f7ff"/>`; } }
        g += '</g>';
      }
    }
    // upper floors: smaller window left, wider window right on every floor; ground floor glass front
    const wa = x0 + 16; const wb = x1 - 44;
    for (let f = 1; f < S.nf; f++) { const wy = GROUND - (f + 1) * FLOOR + 6; g += win(c, wa, wy, glass) + win(c, wb, wy, glass); }
    // ground floor: either every pane is lit or none (lit in the evening, dark late at night)
    const low = o.night && !late ? '#FFD86B' : glass;
    const kw = (w - 16) / 96; const p1 = q(38 * kw); const p2 = q(22 * kw); const s2 = q(x0 + 10 + p1 + 6); const s3 = q(s2 + p2 + 6);
    g += `<rect x="${x0 + 10}" y="76" width="${p1}" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/><rect x="${s2}" y="76" width="${p2}" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/><rect x="${s3}" y="76" width="${q(x1 - 6 - s3)}" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/>`;
    if (o.night) for (let f = 1; f < S.nf; f++) { const wy = GROUND - (f + 1) * FLOOR + 6; g += on(wa + 1, wy + 1, 26, 14, 19 + (f - 1) * 4, 3 + (f - 1) * 7) + on(wb + 1, wy + 1, 26, 14, 27 - (f - 1) * 5, 14 - (f - 1) * 4); }
    // pergola: roof bar and posts only, table silhouette
    g += `<rect x="${x0 + 2}" y="69" width="${w - 4}" height="5" fill="#4a5058"/><rect x="${x0 + 3}" y="69" width="3" height="29" fill="#4a5058"/><rect x="${x1 - 6}" y="69" width="3" height="29" fill="#4a5058"/><path d="M${CX - 12} 90 h22 M${CX - 8} 90 v8 M${CX + 6} 90 v8" stroke="#3a3f46" stroke-width="2"/>`;
    if (o.snow) g += `<rect x="${x0 + 1}" y="67" width="${w - 2}" height="2.5" rx="1.2" fill="#fff"/>`;
    if (o.night) g += `<rect x="${x0 + 6}" y="74" width="${w - 12}" height="1.2" fill="#FFE7A8"/>`;
    if (o.vis === 'weihnachten') for (let x = x0 + 8; x < x1 - 6; x += 7) g += `<circle class="tw" cx="${x}" cy="75.5" r="1.5" fill="${['#E5483B', '#F2B33D', '#3FA66B', '#3E8EDE'][(x / 7 | 0) % 4]}" style="animation-delay:-${(x % 7) / 3}s"/>`;
    if (cold) g += icicles(x0 + 1, x1 - 1, 74);
    if (o.jz === 'sommer' && o.vis !== 'liebe') g += parasol(o, x0 - 64, GROUND);
    if (c.water === 'pool') g += pool(o, S.pool.x1, S.pool.x2, S.pool.y1, S.pool.y2); else g += otherWater(o, c.water);
    return g;
  };

  // the garden pond (header coordinates): always there when the house has no pool to swim in, or when chosen
  const POND = { cx: 912, cy: 109, rx: 30, ry: 4.2 };
  const drawPond = (o, cfg) => {
    const c = clean(cfg || CUR); if (!hasPond(c)) return '';
    const { cx, cy, rx, ry } = POND; const ice = o.snow || o.jz === 'winter';
    let g = `<ellipse cx="${cx}" cy="${cy}" rx="${rx + 4}" ry="${ry + 1.8}" fill="${o.snow ? '#e3e9ef' : '#b9b2a4'}"/>`;
    for (let i = 0; i < 14; i++) { const t = i / 14 * Math.PI * 2; g += `<ellipse cx="${(cx + Math.cos(t) * (rx + 4)).toFixed(1)}" cy="${(cy + Math.sin(t) * (ry + 1.6)).toFixed(1)}" rx="3.2" ry="1.6" fill="${o.snow ? '#d6dde4' : '#a8a092'}"/>`; }
    g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${ice ? '#dfeaf2' : o.night ? '#1f6a8a' : '#5fb6d0'}"/>`;
    if (!ice) g += `<ellipse cx="${cx - 14}" cy="${cy + 0.6}" rx="3.4" ry="1.2" fill="#4f9a3f"/><ellipse cx="${cx + 12}" cy="${cy - 0.8}" rx="3" ry="1" fill="#4f9a3f"/><circle cx="${cx + 12}" cy="${cy - 1.5}" r="1.1" fill="#FF8FB0"/>`;
    return g + `<path d="M${cx + rx + 2} ${cy} v-9 M${cx + rx + 5} ${cy + 1} v-11" stroke="${o.snow ? '#a8b09a' : '#5a8a3a'}" stroke-width="1"/>`;
  };

  // where everything is, in header coordinates (rounded like the hand-made numbers the pets used before)
  const r1 = (n) => Math.round(n * 10) / 10;
  const geo = (cfg) => {
    const S = shape(cfg || CUR); const c = S.c; const H = toHeader;
    const [hx0] = H(S.x0, 0); const [hx1] = H(S.x1, 0); const ln = S.roofLine;
    // peak: the roof right above the door (the pets' roof perch); high: the highest point of the roof
    const peak = H(CX, yAt(ln, CX))[1]; const high = H(CX, Math.min(...ln.map((p) => p[1])))[1];
    const g = {
      ground: 99,
      roofLine: S.roofLine.map(([x, y]) => H(x, y)),
      peak: [640, peak],
      chimney: S.chimney ? H(S.chimney.x + S.chimney.w / 2, S.chimney.y) : null,
      door: [640, 99],
      body: [H(ln[0][0], 0)[0], Math.round(high + 2.75), H(ln[ln.length - 1][0], 0)[0], 99],
      // pets: fliers above the roof, hopping onto the roof and the garage, swimming in the pool or the pond
      roofAir: [Math.round((hx0 + hx1) / 2 - (hx1 - hx0) / 2 + 2), Math.max(0, Math.round(high) - 23), Math.round((hx0 + hx1) / 2 + (hx1 - hx0) / 2 - 2), Math.round(high + 2.75)],
      roofPerch: { x: 640, y: 99, z: Math.round(99 - peak) },
      walls: [],
    };
    S.annexes.forEach((A) => { if (A.side < 0 && S.garage) return; const [ax0, ay] = H(A.x0, A.top); const [ax1] = H(A.x1, 0); g.walls.push([ax0, ay, ax1, 99]); });
    if (S.garage) {
      const [gx0] = H(S.garage.x0, 0); const [gx1] = H(S.garage.x1, 0);
      g.garageAir = [gx0, H(0, S.garage.rail)[1] - 6, gx1, Math.round(H(0, S.garage.rail + 1)[1])];
      g.garagePerch = { x: (gx0 + gx1) / 2, y: 99, z: Math.round(99 - H(0, S.garage.rail)[1] - 2) };
      g.garageBody = [gx0, H(0, S.garage.top)[1], gx1, 99];
    } else g.garagePerch = { x: 536, y: 104, z: 5 }; // without the garage: a sun stone on the lawn
    const P = S.pool; const [px1, py1] = H(P.x1, P.y1); const [px2, py2] = H(P.x2, P.y2);
    const [tx1, ty1] = H(P.tile[0], P.tile[1]); const [tx2, ty2] = H(P.tile[2], P.tile[3]);
    g.terrace = [px1 - 17, Math.round(ty2), px2 + 17, 118];
    const inEll = (e, k) => (x, y) => ((x - e.cx) / (e.rx + k)) ** 2 + ((y - e.cy) / (e.ry + k * 0.3)) ** 2 < 1;
    let inWater = () => false;
    if (c.water === 'pool') {
      g.pool = [px1, r1(py1), px2, py2];
      g.swim = { cx: (px1 + px2) / 2, cy: r1((py1 + py2) / 2), rx: (px2 - px1) / 2, ry: r1((py2 - py1) / 2 + 0.2), n: 8 };
      g.cover = { x: (px1 + px2) / 2, y: Math.round((py1 + py2) / 2), z: 1 };
      inWater = (x, y) => x > tx1 - 3 && x < tx2 + 3 && y > Math.round(ty1) - 2 && y < Math.round(ty2) + 1;
    } else if (c.water === 'rund') {
      const [rcx, rcy] = H(CX, 107.5);
      g.pool = [rcx - 61.5, r1(rcy - 4.9), rcx + 61.5, r1(rcy + 4.9)];
      g.swim = { cx: rcx, cy: r1(rcy), rx: 61.5, ry: 4.9, n: 2 };
      g.cover = { x: rcx, y: Math.round(rcy), z: 1 };
      inWater = inEll({ cx: rcx, cy: rcy, rx: 67.5, ry: 7.1 }, 3);
    }
    if (hasPond(c)) {
      g.pond = { ...POND };
      const inPond = inEll(POND, 5); const inPoolOnly = inWater; inWater = (x, y) => inPoolOnly(x, y) || inPond(x, y);
      if (!g.swim) { g.swim = { cx: POND.cx, cy: POND.cy, rx: POND.rx - 1, ry: POND.ry, n: 2 }; g.cover = { x: POND.cx, y: POND.cy, z: 1 }; g.pool = [POND.cx - POND.rx, POND.cy - POND.ry, POND.cx + POND.rx, POND.cy + POND.ry]; g.swimInPond = true; }
    }
    g.inPool = inWater;
    return g;
  };

  window.FPHOUSE = { DEFAULT, OPTIONS, PRESETS, WALL, ROOF, SHUT, clean, use, current, draw, drawPond, geo, features, toHeader, shape };
})();
