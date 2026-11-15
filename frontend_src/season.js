// ---------------------------------------------------------------------------------------------------------
// Seasons & weather: animated header scene, page background, band, check effect and suggestions.
// Everything is drawn from data (season from the server, weather from the HA weather entity) – no images.
// window.FPSEASON = { setSnap, cur, scene, sceneKey, weather, suggest, burst, page, band, LABEL }
// ---------------------------------------------------------------------------------------------------------
(() => {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const W = 1200; const H = 120; const CX = 640; // CX: where the main motif sits (a bit right of the middle, the navigation is on the left)
  const reduce = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  // ------------------------------------------------------------------------------ weather
  const COND = {
    sunny: ['☀️', 'Sonnig', 'Sunny'], 'clear-night': ['🌙', 'Klar', 'Clear'], partlycloudy: ['⛅', 'Teilweise bewölkt', 'Partly cloudy'],
    cloudy: ['☁️', 'Bewölkt', 'Cloudy'], rainy: ['🌧️', 'Regen', 'Rain'], pouring: ['🌧️', 'Starkregen', 'Pouring'],
    lightning: ['🌩️', 'Gewitter', 'Thunderstorm'], 'lightning-rainy': ['⛈️', 'Gewitter', 'Thunderstorm'], snowy: ['🌨️', 'Schnee', 'Snow'],
    'snowy-rainy': ['🌨️', 'Schneeregen', 'Sleet'], hail: ['🌨️', 'Hagel', 'Hail'], fog: ['🌫️', 'Nebel', 'Fog'],
    windy: ['💨', 'Windig', 'Windy'], 'windy-variant': ['💨', 'Windig', 'Windy'], exceptional: ['⚠️', 'Unwetter', 'Severe weather'],
  };
  // HA weather state -> one of the 10 scene states
  const KIND = { sunny: 'sunny', 'clear-night': 'clear-night', partlycloudy: 'partlycloudy', cloudy: 'cloudy', rainy: 'rainy', pouring: 'pouring',
    lightning: 'lightning', 'lightning-rainy': 'lightning', snowy: 'snowy', 'snowy-rainy': 'snowy', hail: 'pouring', fog: 'fog', windy: 'windy', 'windy-variant': 'windy', exceptional: 'lightning' };
  const kmh = (st) => {
    const a = (st && st.attributes) || {}; const v = Number(a.wind_speed); if (!isFinite(v)) return 0;
    const u = String(a.wind_speed_unit || 'km/h'); return u === 'm/s' ? v * 3.6 : u === 'mph' ? v * 1.609 : u === 'kn' ? v * 1.852 : v;
  };
  const weather = (hass, ent, lang) => {
    const st = ent && hass && hass.states ? hass.states[ent] : null;
    if (!st || ['unavailable', 'unknown'].includes(st.state)) return null;
    const c = COND[st.state] || COND.cloudy; const a = st.attributes || {};
    return { state: st.state, kind: KIND[st.state] || 'cloudy', icon: c[0], text: lang === 'en' ? c[2] : c[1],
      temp: isFinite(Number(a.temperature)) ? Math.round(Number(a.temperature)) : null, unit: a.temperature_unit || '°', wind: kmh(st) };
  };

  // ------------------------------------------------------------------------------ labels & colours
  const LABEL = {
    alltag: ['', ''], weihnachten: ['🎄', ''], silvester: ['🎆', ''], dreikoenig: ['👑', ''], winter: ['❄️', ''], sport: ['⛷️', ''], fasnacht: ['🎭', ''], liebe: ['💕', ''],
    fruehling: ['🌷', ''], ostern: ['🐣', ''], pfingsten: ['🪁', ''], vatertag: ['💙', ''], sommer: ['🏖️', ''], august: ['🇨🇭', ''], schule: ['🎒', ''], herbst: ['🍂', ''], geburtstag: ['🎂', ''],
  };
  // translucent page layer (laid over the design's own background, like the rainbow design) and the accent band
  const PAGE = {
    weihnachten: 'radial-gradient(circle at 20px 20px,rgba(255,255,255,.07) 2px,transparent 3px) 0 0/44px 44px,linear-gradient(180deg,rgba(200,40,40,.10),rgba(20,90,50,.10))',
    silvester: 'radial-gradient(circle at 30% 20%,rgba(255,215,90,.10),transparent 40%),radial-gradient(circle at 80% 60%,rgba(170,110,255,.10),transparent 45%)',
    dreikoenig: 'radial-gradient(circle at 80% 10%,rgba(255,215,90,.12),transparent 40%)',
    winter: 'radial-gradient(circle at 15px 15px,rgba(255,255,255,.06) 2px,transparent 3px) 0 0/36px 36px,linear-gradient(180deg,rgba(120,170,230,.08),transparent)',
    sport: 'linear-gradient(180deg,rgba(150,200,255,.10),transparent 60%)',
    fasnacht: 'repeating-linear-gradient(45deg,rgba(143,107,255,.08) 0 18px,transparent 18px 36px),repeating-linear-gradient(-45deg,rgba(255,122,182,.08) 0 18px,transparent 18px 36px)',
    liebe: 'radial-gradient(circle at 12px 12px,rgba(255,105,150,.10) 3px,transparent 4px) 0 0/40px 40px',
    fruehling: 'linear-gradient(180deg,rgba(255,180,210,.10),rgba(140,210,120,.08))',
    ostern: 'radial-gradient(ellipse 6px 8px at 20px 20px,rgba(255,220,120,.12) 99%,transparent) 0 0/60px 60px,linear-gradient(180deg,rgba(255,240,170,.08),rgba(160,220,140,.08))',
    pfingsten: 'linear-gradient(180deg,rgba(140,200,255,.10),rgba(160,220,140,.06))',
    vatertag: 'linear-gradient(180deg,rgba(80,150,230,.12),transparent)',
    sommer: 'linear-gradient(180deg,rgba(60,170,240,.12),rgba(255,214,120,.10))',
    august: 'repeating-linear-gradient(90deg,rgba(218,41,28,.10) 0 40px,rgba(255,255,255,.05) 40px 80px)',
    schule: 'linear-gradient(180deg,rgba(255,200,60,.08),transparent)',
    herbst: 'linear-gradient(180deg,rgba(230,130,40,.10),rgba(140,70,30,.08))',
    geburtstag: 'radial-gradient(circle at 10px 10px,rgba(255,122,182,.14) 3px,transparent 4px) 0 0/30px 30px',
  };
  const BAND = {
    weihnachten: 'repeating-linear-gradient(90deg,#C8302E 0 14px,#fff 14px 20px,#1F7A45 20px 34px,#fff 34px 40px)',
    silvester: 'linear-gradient(90deg,#FFD24A,#FF7AB6,#8F6BFF,#4FD1C5,#FFD24A)', dreikoenig: 'linear-gradient(90deg,#F5C542,#B07CFF,#F5C542)',
    winter: 'linear-gradient(90deg,#9CC9F5,#fff,#9CC9F5)', sport: 'linear-gradient(90deg,#4FA3E0,#fff,#E06B6B)',
    fasnacht: 'linear-gradient(90deg,#FF7AB6,#FFD84D,#5CE1E6,#9EDC9E,#B07CFF,#FF8A3C)', liebe: 'linear-gradient(90deg,#FF6B9B,#FFB3C9,#FF6B9B)',
    fruehling: 'linear-gradient(90deg,#FFB3D1,#9EDC9E,#FFE27A)', ostern: 'linear-gradient(90deg,#FFE27A,#9EDC9E,#B5D8FF,#FFB3D1)',
    pfingsten: 'linear-gradient(90deg,#FF8A3C,#FFD84D,#4FA3E0)', vatertag: 'linear-gradient(90deg,#3E8EDE,#9fd3ff,#3E8EDE)',
    sommer: 'linear-gradient(90deg,#29B6F6,#FFD54F,#29B6F6)', august: 'repeating-linear-gradient(90deg,#DA291C 0 24px,#fff 24px 32px)',
    schule: 'repeating-linear-gradient(90deg,#FFC83D 0 18px,#3E8EDE 18px 36px)', herbst: 'linear-gradient(90deg,#E07B2E,#C9472B,#E0A84F)',
    geburtstag: 'linear-gradient(90deg,#FF7AB6,#FFD84D,#5CE1E6,#9EDC9E,#B07CFF)',
  };

  // ------------------------------------------------------------------------------ snapshot hook
  const api = { cur: null };
  api.setSnap = (s) => { api.cur = s && s.season && s.season.enabled !== false && s.season.vis ? s.season : null; };
  api.page = () => (api.cur && PAGE[api.cur.vis]) || '';
  api.band = () => (api.cur && BAND[api.cur.vis]) || '';

  // ------------------------------------------------------------------------------ art helpers
  const fir = (x, y, s, snow, lights, r) => {
    let g = `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-4" width="6" height="8" fill="#5b3a22"/>`;
    [[0, 28], [-12, 22], [-24, 16]].forEach(([dy, w]) => { g += `<path d="M${-w} ${dy - 4} L0 ${dy - 26} L${w} ${dy - 4}Z" fill="#1f6b43"/>`; if (snow) g += `<path d="M${-w * 0.6} ${dy - 10} L0 ${dy - 26} L${w * 0.6} ${dy - 10}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>`; });
    if (lights) for (let i = 0; i < 9; i++) g += `<circle class="tw" cx="${(r() - 0.5) * 34}" cy="${-8 - r() * 40}" r="2.2" fill="${['#FFD24A', '#E5483B', '#5CE1E6', '#FF7AB6'][i % 4]}" style="animation-delay:-${(r() * 2).toFixed(2)}s"/>`;
    if (lights) g += '<path d="M0 -55 l2.4 5 5.4 .6 -4 3.7 1.1 5.3 -4.9 -2.7 -4.9 2.7 1.1 -5.3 -4 -3.7 5.4 -.6z" fill="#FFD24A"/>';
    return g + '</g>';
  };
  const leafTree = (x, y, s, jz, r, sway) => {
    const crown = { fruehling: ['#7cc36a', '#ffc4dc'], sommer: ['#3f9a3a', null], herbst: ['#d9792b', '#b84a24'], winter: [null, null] }[jz] || ['#3f9a3a', null];
    let g = `<g transform="translate(${x} ${y}) scale(${s})"><g class="${sway ? 'sw' : ''}" style="transform-origin:0 0">`;
    g += '<path d="M-3 0 L-2 -34 M-2 -22 L-14 -36 M-2 -26 L12 -40 M-2 -34 L-6 -46" stroke="#6b4a2e" stroke-width="5" stroke-linecap="round" fill="none"/>';
    if (crown[0]) {
      g += `<circle cx="-10" cy="-40" r="14" fill="${crown[0]}"/><circle cx="8" cy="-44" r="15" fill="${crown[0]}"/><circle cx="-1" cy="-54" r="14" fill="${crown[0]}"/>`;
      if (crown[1]) for (let i = 0; i < 12; i++) g += `<circle cx="${(r() - 0.5) * 40}" cy="${-36 - r() * 26}" r="${2 + r() * 2}" fill="${crown[1]}"/>`;
    } else g += '<path d="M-14 -36 l-6 -4 M12 -40 l6 -5 M-6 -46 l-3 -6" stroke="#6b4a2e" stroke-width="3" stroke-linecap="round"/>';
    return g + '</g></g>';
  };
  // our garden right of the own house: a big apple tree, a smaller red maple and a flower bed (white & violet in summer)
  const appleTree = (x, y, s, jz, snow, r) => {
    let g = `<g transform="translate(${x} ${y}) scale(${s})"><g class="sw" style="transform-origin:0 0">`;
    g += '<path d="M-2 0 C -3 -14 -1 -24 -2 -30 M-2 -24 C -10 -30 -18 -32 -24 -40 M-2 -27 C 6 -33 14 -36 22 -44 M-2 -30 C -4 -38 -2 -44 0 -52" stroke="#6e4b30" stroke-width="5" stroke-linecap="round" fill="none"/>';
    if (jz === 'winter') {
      g += '<path d="M-24 -40 l-6 -5 M-24 -40 l1 -8 M22 -44 l7 -4 M22 -44 l-1 -8 M0 -52 l-5 -6 M0 -52 l5 -6" stroke="#6e4b30" stroke-width="2.5" stroke-linecap="round"/>';
      if (snow) g += '<path d="M-28 -43 q4 -3 8 0 M18 -46 q5 -3 9 0 M-4 -55 q4 -3 8 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      return g + '</g></g>';
    }
    const leaf = { fruehling: '#8fd07a', sommer: '#3e9440', herbst: '#a7a83c' }[jz] || '#3e9440';
    [[-20, -42, 15], [0, -50, 18], [19, -44, 15], [-9, -58, 13], [10, -60, 12]].forEach(([cx, cy, rr]) => { g += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${leaf}"/>`; });
    if (jz === 'fruehling') for (let i = 0; i < 26; i++) g += `<circle cx="${((r() - 0.5) * 56).toFixed(1)}" cy="${(-38 - r() * 30).toFixed(1)}" r="${(1.6 + r() * 1.6).toFixed(1)}" fill="${r() > 0.35 ? '#ffffff' : '#ffc9dc'}"/>`;
    if (jz === 'sommer' || jz === 'herbst') for (let i = 0; i < (jz === 'herbst' ? 12 : 8); i++) g += `<circle cx="${((r() - 0.5) * 50).toFixed(1)}" cy="${(-36 - r() * 28).toFixed(1)}" r="${jz === 'herbst' ? 2.8 : 2.2}" fill="${jz === 'herbst' ? '#d7262e' : (r() > 0.5 ? '#9fc23a' : '#e0503c')}"/>`;
    g += '</g>';
    if (jz === 'herbst') g += '<circle cx="-14" cy="-2" r="2.6" fill="#d7262e"/><circle cx="9" cy="-1.5" r="2.6" fill="#c81f28"/>';
    return g + '</g>';
  };
  const redMaple = (x, y, s, jz, snow) => {
    let g = `<g transform="translate(${x} ${y}) scale(${s})"><g class="sw" style="transform-origin:0 0;animation-delay:-1.3s">`;
    g += '<path d="M0 0 L0 -22 M0 -14 L-10 -24 M0 -17 L9 -27" stroke="#5a3a28" stroke-width="4" stroke-linecap="round" fill="none"/>';
    if (jz === 'winter') {
      g += '<path d="M-10 -24 l-4 -5 M9 -27 l4 -5 M0 -22 l0 -8" stroke="#5a3a28" stroke-width="2" stroke-linecap="round"/>';
      if (snow) g += '<path d="M-13 -27 q3 -2 6 0 M7 -30 q3 -2 6 0" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>';
      return g + '</g></g>';
    }
    const c = { fruehling: ['#a8323a', '#c94a3a'], sommer: ['#7e1f2b', '#9b2a33'], herbst: ['#e2412c', '#f08a24'] }[jz] || ['#7e1f2b', '#9b2a33'];
    g += `<ellipse cx="-8" cy="-28" rx="13" ry="10" fill="${c[0]}"/><ellipse cx="9" cy="-31" rx="13" ry="10" fill="${c[1]}"/><ellipse cx="0" cy="-38" rx="12" ry="9" fill="${c[0]}"/>`;
    return g + '</g></g>';
  };
  const flowerBed = (x, y, jz, snow, r) => {
    let g = `<g transform="translate(${x} ${y})">`;
    if (jz === 'winter') return g + (snow ? '<ellipse cx="0" cy="-3" rx="26" ry="6" fill="#ffffff"/><ellipse cx="-14" cy="-5" rx="9" ry="5" fill="#f3f7fb"/>' : '<ellipse cx="0" cy="-4" rx="24" ry="6" fill="#5d6b4a"/>') + '</g>';
    g += `<ellipse cx="-12" cy="-7" rx="13" ry="9" fill="${jz === 'herbst' ? '#8a7a3a' : '#3f8a3e'}"/><ellipse cx="11" cy="-8" rx="14" ry="10" fill="${jz === 'herbst' ? '#7d6a33' : '#367f37'}"/>`;
    if (jz === 'sommer') for (let i = 0; i < 18; i++) g += `<circle cx="${((r() - 0.5) * 46).toFixed(1)}" cy="${(-6 - r() * 12).toFixed(1)}" r="${(2 + r() * 2).toFixed(1)}" fill="${i % 2 ? '#ffffff' : '#9b6bd6'}"/>`;
    if (jz === 'fruehling') for (let i = 0; i < 7; i++) g += `<circle cx="${((r() - 0.5) * 40).toFixed(1)}" cy="${(-8 - r() * 8).toFixed(1)}" r="1.8" fill="${i % 2 ? '#ffffff' : '#c7a4ef'}"/>`;
    return g + '</g>';
  };
  const house = (x, y, night, snow, lit, smoke, wind) => {
    const win = lit || night ? '#FFD86B' : '#bfe0ff';
    let g = `<g transform="translate(${x} ${y})"><rect x="-46" y="-44" width="92" height="44" rx="2" fill="#f1e3c8"/><path d="M-54 -42 L0 -76 L54 -42Z" fill="#b5523b"/>`;
    if (snow) g += '<path d="M-50 -44 L0 -75 L50 -44 L44 -44 L0 -70 L-44 -44Z" fill="#fff"/>';
    g += `<rect x="24" y="-78" width="10" height="20" fill="#8a3b2b"/><rect x="-8" y="-24" width="16" height="24" rx="2" fill="#7a4a2a"/>
      <rect x="-36" y="-34" width="18" height="14" rx="2" fill="${win}"/><rect x="18" y="-34" width="18" height="14" rx="2" fill="${win}"/>`;
    if (smoke) for (let i = 0; i < 3; i++) g += `<circle class="smk" cx="29" cy="-82" r="5" fill="#dfe3e8" style="--dx:${Math.round(12 + wind / 3)}px;animation-delay:-${i * 1.3}s"/>`;
    return g + '</g>';
  };
  const cloud = (y, w, col, op, dur, delay) => `<g class="cl" style="animation-duration:${dur}s;animation-delay:-${delay}s;opacity:${op}"><g transform="translate(0 ${y}) scale(${w / 100})"><ellipse cx="40" cy="12" rx="40" ry="12" fill="${col}"/><ellipse cx="62" cy="4" rx="24" ry="14" fill="${col}"/><ellipse cx="30" cy="2" rx="18" ry="11" fill="${col}"/></g></g>`;
  const fall = (n, r, make) => { let o = ''; for (let i = 0; i < n; i++) o += make(r() * W, r(), i); return o; };
  const emo = (x, y, e, size, cls, extra) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" class="${cls || ''}" ${extra || ''}>${e}</text>`;
  const burstRays = (x, y, col, d) => { let g = `<g class="fw" style="transform-origin:${x}px ${y}px;animation-delay:-${d}s">`; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g += `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * 18).toFixed(1)}" y2="${(y + Math.sin(a) * 18).toFixed(1)}" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`; } return g + '</g>'; };

  const CSS = `.scn{position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:0}
.scn svg{position:absolute;inset:0;width:100%;height:100%}
.scn .shade{position:absolute;inset:0;background:linear-gradient(90deg,var(--fp-bg1) 0%,color-mix(in srgb,var(--fp-bg1) 55%,transparent) 22%,transparent 45%,transparent 70%,color-mix(in srgb,var(--fp-bg1) 50%,transparent) 100%);opacity:.9}
@keyframes fpcl{from{transform:translateX(-260px)}to{transform:translateX(${W + 60}px)}}
@keyframes fpfall{from{transform:translate(0,-20px)}to{transform:translate(var(--dx,0px),${H + 20}px)}}
@keyframes fpsway{0%,100%{transform:rotate(calc(var(--wa,2deg) * -1))}50%{transform:rotate(var(--wa,2deg))}}
@keyframes fptw{0%,100%{opacity:1}50%{opacity:.25}}@keyframes fpglw{0%,100%{opacity:.55}50%{opacity:.08}}
@keyframes fpsmk{0%{transform:translate(0,0) scale(.6);opacity:.8}100%{transform:translate(var(--dx,14px),-34px) scale(1.8);opacity:0}}
@keyframes fpflash{0%,92%,100%{opacity:0}93%,96%{opacity:.8}}
@keyframes fpfog{0%,100%{transform:translateX(-40px)}50%{transform:translateX(40px)}}
@keyframes fpfw{0%{transform:scale(.1);opacity:0}15%{opacity:1}60%{transform:scale(1);opacity:.9}100%{transform:scale(1.15);opacity:0}}
@keyframes fprise{from{transform:translateY(0)}to{transform:translateY(-${H + 40}px)}}
@keyframes fpbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes fpwave{from{transform:translateX(0)}to{transform:translateX(-60px)}}
@keyframes fpfly{from{transform:translateX(-80px)}to{transform:translateX(${W + 80}px)}}
@keyframes fpflame{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.25)}}
@keyframes fppulse{0%,100%{opacity:.85}50%{opacity:1}}
.scn .cl{animation:fpcl linear infinite}.scn .fl{animation:fpfall linear infinite}.scn .sw{animation:fpsway var(--wd,6s) ease-in-out infinite}
.scn .tw{animation:fptw 1.8s ease-in-out infinite}.scn .glw{animation:fpglw 1.8s ease-in-out infinite}.scn .smk{animation:fpsmk 4s ease-out infinite}.scn .flash{animation:fpflash 7s linear infinite}
.scn .fog{animation:fpfog 14s ease-in-out infinite}.scn .fw{animation:fpfw 2.6s ease-out infinite}.scn .rise{animation:fprise linear infinite}
.scn .bob{animation:fpbob 3s ease-in-out infinite}.scn .wave{animation:fpwave 4s linear infinite}.scn .fly{animation:fpfly linear infinite}
.scn .flame{transform-box:fill-box;transform-origin:50% 100%;animation:fpflame .5s ease-in-out infinite}.scn .sun{animation:fppulse 5s ease-in-out infinite}
.scn.still *{animation:none!important}.scn.still .fl,.scn.still .rise{display:none}`;
  api.CSS = CSS;

  // ------------------------------------------------------------------------------ house with pool & pergola (setting)
  // tall gable house facing the garden, garage joined on the left with a frosted-glass railing, pool to the south;
  // snow, pool cover in winter, lights in the evening, fairy lights in Advent, icicles below -5°
  const TILE = '#C9CDD2';
  const pool = (o, x1, x2, y1, y2, persp) => {
    const winter = o.snow || o.jz === 'winter';
    const shape = persp ? `M${x1 + persp} ${y1} H${x2 - persp} L${x2} ${y2} H${x1}Z` : `M${x1} ${y1} H${x2} V${y2} H${x1}Z`;
    let g = `<path d="${persp ? `M${x1 + persp - 8} ${y1 - 3} H${x2 - persp + 8} L${x2 + 10} ${y2 + 4} H${x1 - 10}Z` : `M${x1 - 8} ${y1 - 3} H${x2 + 8} V${y2 + 4} H${x1 - 8}Z`}" fill="${o.snow ? '#eef4fa' : TILE}"/>`;
    if (winter) return g + `<path d="${shape}" fill="#3f4f5c"/>` + [0.25, 0.5, 0.75].map((f) => `<line x1="${x1 + (x2 - x1) * f}" y1="${y1}" x2="${x1 + (x2 - x1) * f}" y2="${y2}" stroke="#6c7c88" stroke-width="1.2"/>`).join('') + (o.snow ? `<path d="${shape}" fill="#fff" opacity=".55"/>` : '');
    g += `<defs><linearGradient id="fpwater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.night ? '#1fb5c9' : '#5fe0ea'}"/><stop offset="1" stop-color="${o.night ? '#0b6f8a' : '#1fb0cf'}"/></linearGradient></defs><path d="${shape}" fill="url(#fpwater)"/>`;
    g += `<clipPath id="fppool"><path d="${shape}"/></clipPath><g clip-path="url(#fppool)"><g class="wave" style="animation-duration:6s">`;
    for (let x = x1 - 60; x < x2 + 60; x += 22) g += `<path d="M${x} ${y1 + 4} q5 -2 10 0 t10 0 M${x + 8} ${y1 + 9} q5 -2 10 0" stroke="#fff" stroke-width="1" fill="none" opacity=".55"/>`;
    g += '</g></g>';
    if (o.night) g += `<ellipse cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" rx="${(x2 - x1) / 2.4}" ry="${(y2 - y1) / 2.2}" fill="#7ff7ff" opacity=".25" class="sun"/>`;
    return g;
  };
  // thatched parasol (brown palm leaves), only out in summer
  const parasol = (o, x, ground) => {
    const top = ground - 28; let g = `<path d="M${x} ${ground} V${top}" stroke="#7a5a36" stroke-width="2"/><g class="sw" style="transform-origin:${x}px ${top}px">`;
    g += `<path d="M${x - 22} ${top + 6} Q${x} ${top - 12} ${x + 22} ${top + 6}Z" fill="#9c7444"/>`;
    for (let i = 0; i < 11; i++) { const lx = x - 22 + i * 4.4; g += `<path d="M${x} ${top - 6} L${lx.toFixed(1)} ${top + 6} l${(i % 2 ? 1.2 : -1.2)} 4" stroke="${i % 2 ? '#7d5a32' : '#b8905a'}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`; }
    return g + `<circle cx="${x}" cy="${top - 6}" r="2" fill="#6b4a2a"/></g>`;
  };
  const smoke = (o, x, y) => (o.smoke ? Array.from({ length: 3 }, (_, i) => `<circle class="smk" cx="${x}" cy="${y}" r="4" fill="#dfe3e8" style="--dx:${Math.round(12 + o.wind / 3)}px;animation-delay:-${i * 1.3}s"/>`).join('') : '');
  const houseS = (o) => {
    const cold = typeof o.temp === 'number' && o.temp < -5;
    const lit = o.night || o.vis === 'weihnachten';
    const glass = o.night ? '#FFD86B' : '#bfe0ff';
    const icicles = (x1, x2, y) => { let g = ''; for (let x = x1 + 3; x < x2 - 2; x += 6) { const l = 3 + ((x * 7) % 5); g += `<path d="M${x - 1.5} ${y} L${x} ${y + l} L${x + 1.5} ${y}Z" fill="#e8f7ff" opacity=".95"/>`; } return g; };
    let g = '';
    // garage, joined to the house; flat roof with frosted glass railing
    g += '<rect x="852" y="68" width="48" height="30" fill="#f1e3c8"/><rect x="850" y="66" width="52" height="3" fill="#a7adb5"/>';
    g += `<rect x="852" y="56" width="48" height="10" fill="#fff" opacity="${o.night ? 0.3 : 0.6}"/><rect x="852" y="55" width="48" height="1.6" fill="#a7adb5"/>`;
    if (o.snow) g += '<rect x="850" y="53" width="52" height="2.5" rx="1.2" fill="#fff"/><rect x="850" y="64.5" width="52" height="2" fill="#fff"/>';
    if (cold) g += icicles(850, 902, 69);
    // house: tall body, gable to the front
    g += '<rect x="900" y="40" width="112" height="58" fill="#f1e3c8"/>';
    g += `<rect x="988" y="10" width="9" height="20" fill="#8a3b2b"/>` + smoke(o, 992, 8);
    g += '<path d="M900 40 L956 8 L1012 40Z" fill="#f1e3c8"/><path d="M892 44 L956 6 L1020 44" fill="none" stroke="#b5523b" stroke-width="7" stroke-linejoin="round"/>';
    if (o.snow) g += '<path d="M890 41 L956 3 L1022 41" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>';
    if (cold) g += '<g>' + Array.from({ length: 7 }, (_, i) => { const x = 896 + i * 9.5; const y = 44 - (x - 892) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y} L${x} ${y + l} L${x + 1.4} ${y}Z" fill="#e8f7ff"/>`; }).join('') + Array.from({ length: 7 }, (_, i) => { const x = 960 + i * 9.5; const y = 6 + (x - 956) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y + 4} L${x} ${y + 4 + l} L${x + 1.4} ${y + 4}Z" fill="#e8f7ff"/>`; }).join('') + '</g>';
    // upper floor: smaller window left, wider window right; ground floor glass front
    g += `<rect x="916" y="46" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/><line x1="930" y1="46" x2="930" y2="62" stroke="#fff" stroke-width="1.5"/><rect x="968" y="46" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/><line x1="982" y1="46" x2="982" y2="62" stroke="#fff" stroke-width="1.5"/>`;
    g += `<rect x="910" y="76" width="38" height="22" fill="${glass}" stroke="#fff" stroke-width="1.5"/><rect x="954" y="76" width="22" height="22" fill="${glass}" stroke="#fff" stroke-width="1.5"/><rect x="982" y="76" width="24" height="22" fill="${glass}" stroke="#fff" stroke-width="1.5"/>`;
    // pergola: roof bar and posts only, table silhouette
    g += '<rect x="902" y="69" width="108" height="5" fill="#4a5058"/><rect x="903" y="69" width="3" height="29" fill="#4a5058"/><rect x="1006" y="69" width="3" height="29" fill="#4a5058"/><path d="M944 90 h22 M948 90 v8 M962 90 v8" stroke="#3a3f46" stroke-width="2"/>';
    if (o.snow) g += '<rect x="901" y="67" width="110" height="2.5" rx="1.2" fill="#fff"/>';
    if (o.night) g += '<rect x="906" y="74" width="100" height="1.2" fill="#FFE7A8"/>';
    if (o.vis === 'weihnachten') for (let x = 908; x < 1006; x += 7) g += `<circle class="tw" cx="${x}" cy="75.5" r="1.5" fill="${['#E5483B', '#F2B33D', '#3FA66B', '#3E8EDE'][(x / 7 | 0) % 4]}" style="animation-delay:-${(x % 7) / 3}s"/>`;
    if (cold) g += icicles(901, 1011, 74);
    if (o.jz === 'sommer') g += parasol(o, 836, 98);
    g += pool(o, 872, 1040, 102, 113);
    return g;
  };
  // placed between the buttons and the weather corner, so the controls never hide it
  const poolHouse = (o) => `<g transform="translate(888 99) scale(.75) translate(-956 -99)">${houseS(o)}</g>`;

  // ------------------------------------------------------------------------------ the scene
  // o: { season, wx (weather()), hour, lang, intensity ('calm'|'normal'|'lots'), storm (km/h), still (bool) }
  api.sceneKey = (o) => { const s = o.season || {}; const w = o.wx || {}; return [o.top || 0, o.dusk, s.vis, s.jz, s.sub, s.advent, s.snow, s.key, w.kind, Math.round((w.wind || 0) / 10), o.hour >= 21 ? (o.hour >= 22 ? 2 : 1) : 0, o.night, o.intensity, o.still, o.lang, (s.anniversary || {}).years, o.house, w.temp != null && w.temp < -5, o.narrow].join('|'); };
  api.scene = (o) => {
    const s = o.season || { vis: 'alltag', jz: 'sommer' }; const vis = s.vis || 'alltag'; const jz = s.jz || 'sommer'; const lang = o.lang === 'en' ? 'en' : 'de';
    const w = o.wx || { kind: 'partlycloudy', wind: 8 }; let kind = w.kind || 'partlycloudy';
    const hour = o.hour; const night = o.night != null ? o.night : (hour < 6 || hour >= 20 || kind === 'clear-night');
    const xmasSnow = vis === 'weihnachten' && s.snow;
    const mul = { calm: 0.45, normal: 1, lots: 1.7 }[o.intensity] || 1; const wildMul = 0.7 + 0.15 * (s.wild || 1);
    const r = rng(([...String(s.key || vis)].reduce((a, c) => a + c.charCodeAt(0), 0) + new Date().getDate()) * 7919);
    const wind = Math.max(0, w.wind || 0); const storm = wind >= (o.storm || 50);
    const wa = Math.min(9, 1 + wind / 8) + (storm ? 3 : 0); const wd = Math.max(1.6, 7 - wind / 10);
    const cloudDur = Math.max(18, 110 - wind * 1.4);
    // sky
    const SKY = night ? ['#0b1430', '#22365e'] : ({ sunny: ['#5fb0ff', '#cfe8ff'], partlycloudy: ['#78b8f0', '#d4e9fb'], cloudy: ['#8b9aad', '#ccd6e0'], rainy: ['#5f6d7d', '#9faab6'],
      pouring: ['#4c5866', '#87929e'], lightning: ['#383f4d', '#69717f'], snowy: ['#a8b7c8', '#e4ecf4'], fog: ['#b7bfc8', '#e0e4e8'], windy: ['#7fb2e2', '#cfe3f5'] })[kind] || ['#78b8f0', '#d4e9fb'];
    let sky = SKY;
    // sunset / sunrise glow when the sun can be seen (sunny, a few clouds, wind)
    const glowSun = !night && o.dusk && ['sunny', 'partlycloudy', 'windy'].includes(kind);
    if (glowSun) sky = o.dusk === 'dawn' ? ['#7d8fd6', '#ffc7a8'] : ['#5b4f9e', '#ff9a5c'];
    if (vis === 'silvester') sky = ['#090d24', '#2b1e52'];
    if (vis === 'fasnacht' && !night) sky = ['#6e3fd1', '#ff8ac1'];
    if (vis === 'sommer' && !night && ['sunny', 'partlycloudy', 'windy'].includes(kind)) sky = ['#1e9ef0', '#bfeaff'];
    // the main motif (house, or the beach / carnival scene) sits in the middle of the header: the landscape is
    // shifted by dx and repeated at the right edge, so nothing is cut; phones show a slice around the same centre
    const hasHouse = vis !== 'sommer' && vis !== 'fasnacht';
    const focus = hasHouse ? (o.house === 'pool' ? 888 : 900) : vis === 'sommer' ? 760 : 600;
    const TOP = Math.max(0, Math.min(40, Number(o.top) || 0)); // top of the visible part (garlands hang from there)
    const dx = focus - CX; const sdx = hasHouse ? 0 : -dx; const BX = hasHouse ? CX - 215 : 600; // banners: left of the house, below the navigation
    const vb = o.narrow ? `${CX - 160} 0 320 ${H}` : `0 0 ${W} ${H}`;
    let svg = `<svg viewBox="${vb}" preserveAspectRatio="xMidYMax slice" style="--wa:${wa.toFixed(1)}deg;--wd:${wd.toFixed(1)}s" aria-hidden="true">
      <defs><linearGradient id="fpsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><radialGradient id="fpglow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset=".6" stop-color="#ffd27a" stop-opacity=".18"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#fpsky)"/><g transform="translate(${-dx} 0)"><g id="fpb">`;
    // sun, moon, stars
    if (night) {
      svg += fall(Math.round(26 * mul), r, (x, k) => `<circle class="tw" cx="${x.toFixed(0)}" cy="${(k * 60).toFixed(0)}" r="${(0.6 + r()).toFixed(1)}" fill="#fff" style="animation-delay:-${(r() * 3).toFixed(1)}s"/>`);
      if (!['rainy', 'pouring', 'lightning', 'snowy', 'fog', 'cloudy'].includes(kind) || vis === 'silvester') svg += '<circle cx="640" cy="26" r="13" fill="#f6f1d5"/><circle cx="646" cy="22" r="12" fill="#22365e" opacity=".9"/>';
    } else if (glowSun) svg += `<circle cx="600" cy="88" r="40" fill="#FFB25C" opacity=".35"/><circle cx="600" cy="88" r="20" fill="#FF8A3C"/>`;
    else if (['sunny', 'partlycloudy', 'windy'].includes(kind)) svg += '<circle class="sun" cx="610" cy="28" r="17" fill="#FFE27A"/><circle cx="610" cy="28" r="30" fill="#FFE27A" opacity=".25"/>';
    if (kind === 'partlycloudy' && !night && !glowSun) [['#ff5a5a', 52], ['#ffb23d', 47], ['#ffe94d', 42], ['#55d16b', 37], ['#4aa8ff', 32], ['#8f6bff', 27]].forEach(([c, rr]) => { svg += `<path d="M${470 - rr * 2} 100 A ${rr * 2} ${rr * 1.7} 0 0 1 ${470 + rr * 2} 100" stroke="${c}" stroke-width="5" fill="none" opacity=".45"/>`; });
    // mountains (sport holidays) / sea (summer) in the background
    if (vis === 'sport' || (jz === 'winter' && vis === 'winter')) {
      svg += `<path d="M0 92 L120 40 L210 78 L330 26 L460 84 L560 48 L700 90 L820 34 L960 86 L1080 44 L1200 92 V120 H0Z" fill="${night ? '#33415c' : '#6f86a3'}"/>`;
      [[120, 40], [330, 26], [560, 48], [820, 34], [1080, 44]].forEach(([x, y]) => { svg += `<path d="M${x - 22} ${y + 12} L${x} ${y} L${x + 22} ${y + 12} L${x + 12} ${y + 9} L${x + 5} ${y + 14} L${x - 4} ${y + 9} L${x - 12} ${y + 13}Z" fill="#f4f8fc"/>`; });
    }
    // clouds
    const cN = { sunny: 1, 'clear-night': 0, partlycloudy: 3, cloudy: 6, rainy: 6, pouring: 7, lightning: 7, snowy: 5, fog: 2, windy: 4 }[kind] || 2;
    const cCol = ['rainy', 'pouring', 'lightning'].includes(kind) ? '#6b7682' : night ? '#3c4b68' : '#ffffff';
    for (let i = 0; i < cN; i++) svg += cloud(4 + r() * 34, 70 + r() * 90, cCol, (0.55 + r() * 0.4).toFixed(2), (cloudDur * (0.8 + r() * 0.5)).toFixed(0), (r() * cloudDur).toFixed(0));
    // ground
    const snowGround = xmasSnow || kind === 'snowy' || vis === 'sport' || (vis === 'winter' && jz === 'winter' && (o.wx || {}).temp != null && o.wx.temp <= 0);
    const gCol = snowGround ? '#eef4fa' : vis === 'fasnacht' ? '#5b3fa0' : ({ fruehling: '#8fcb6a', sommer: '#6fbf4f', herbst: '#b98a45', winter: '#7d8f6a' })[jz];
    if (vis === 'sommer') {
      svg += `<rect y="84" width="${W}" height="20" fill="#2aa7df"/><g class="wave">${fall(26, r, (x, k) => `<path d="M${(k * 0 + (x | 0) % 1200)} 88 q8 -4 16 0" stroke="#bff0ff" stroke-width="2" fill="none"/>`)}</g>`;
      svg += `<path d="M0 100 C 200 92 400 104 600 98 C 800 92 1000 104 1200 100 V120 H0Z" fill="#f2d48f"/>`;
    } else {
      svg += `<path d="M0 98 C 160 90 340 104 520 96 C 700 89 900 104 1200 98 V120 H0Z" fill="${gCol}"/>`;
      // grass tufts everywhere and a few round stones (spring / summer green, autumn straw, winter only stones)
      const gr = snowGround ? null : vis === 'fasnacht' ? null : ({ fruehling: ['#5fae46', '#7cc35c'], sommer: ['#4c9a36', '#6cb84a'], herbst: ['#a88a3e', '#c2a252'], winter: ['#7c8a5a', '#93a06a'] })[jz];
      if (gr) for (let i = 0; i < 46; i++) { const x = (i * 26 + r() * 18) % W; const y = 104 + r() * 12; const c = gr[i % 2];
        svg += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q-3 -7 -5 -9 M${(x + 2).toFixed(0)} ${y.toFixed(0)} q0 -8 1 -11 M${(x + 4).toFixed(0)} ${y.toFixed(0)} q3 -6 6 -8" stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`; }
      [[330, 110, 1], [345, 112, 0.7], [700, 112, 0.9], [1175, 109, 1.1], [1190, 112, 0.7], [520, 114, 0.8]].forEach(([x, y, k]) => {
        svg += `<ellipse cx="${x}" cy="${y}" rx="${(8 * k).toFixed(1)}" ry="${(5 * k).toFixed(1)}" fill="${night ? '#59606b' : '#9aa1ab'}"/><ellipse cx="${x - 2 * k}" cy="${y - 2 * k}" rx="${(4 * k).toFixed(1)}" ry="${(2 * k).toFixed(1)}" fill="${night ? '#6d7480' : '#c3c8cf'}"/>`
          + (snowGround ? `<ellipse cx="${x}" cy="${y - 4 * k}" rx="${(7 * k).toFixed(1)}" ry="${(2.4 * k).toFixed(1)}" fill="#fff"/>` : ''); });
    }
    // everyday house and trees (a little different every season)
    const lit = vis === 'weihnachten' || night;
    const smokeOn = ['herbst', 'winter'].includes(jz) || vis === 'weihnachten';
    const own = o.house === 'pool' && vis !== 'sommer' && vis !== 'fasnacht';
    if (own) {
      svg += poolHouse({ night, snow: snowGround, smoke: smokeOn, wind, jz, vis, temp: w.temp });
      const gz = vis === 'ostern' || vis === 'fruehling' ? 'fruehling' : vis === 'herbst' ? 'herbst' : ['weihnachten', 'sport', 'silvester', 'dreikoenig'].includes(vis) ? 'winter' : jz;
      svg += redMaple(1112, 103, 0.95, gz, snowGround) + appleTree(1042, 104, 1.25, gz, snowGround, r) + flowerBed(978, 106, gz, snowGround, r);
    }
    else if (vis !== 'sommer' && vis !== 'fasnacht') svg += house(900, 100, night, snowGround, lit, smokeOn, wind);
    if (vis === 'weihnachten' || vis === 'winter' || vis === 'sport') {
      (own ? [[150, 102, 1], [250, 104, 0.8], [720, 104, 0.85]] : [[150, 102, 1], [250, 104, 0.8], [1060, 102, 0.95], [1150, 104, 0.75]]).forEach(([x, y, sc]) => { svg += fir(x, y, sc, snowGround, false, r); });
    } else if (vis !== 'sommer' && vis !== 'fasnacht') {
      (own ? [[150, 100, 1], [260, 102, 0.8], [720, 102, 0.85]] : [[150, 100, 1], [260, 102, 0.8], [1060, 100, 0.95], [1150, 102, 0.8]]).forEach(([x, y, sc]) => { svg += leafTree(x, y, sc, vis === 'fruehling' || vis === 'ostern' ? 'fruehling' : vis === 'herbst' ? 'herbst' : jz, r, true); });
    }
    if (night && hasHouse) {
      const spots = own ? [[150, 1], [250, 0.8], [720, 0.85], [978, 0.6], [1042, 1.25], [1112, 0.95]] : [[150, 1], [260, 0.8], [1060, 0.95], [1150, 0.8]];
      spots.forEach(([x, k]) => { svg += `<ellipse cx="${x}" cy="${(104 - 42 * k).toFixed(0)}" rx="${(32 * k).toFixed(0)}" ry="${(30 * k).toFixed(0)}" fill="url(#fpglow)"/><ellipse cx="${x}" cy="106" rx="${(14 * k).toFixed(0)}" ry="3" fill="#ffd77a" opacity=".45"/><circle class="tw" cx="${x}" cy="105" r="1.8" fill="#fff2c4"/>`; });
    }
    svg += `</g><use href="#fpb" x="${W}"/></g><g transform="translate(${sdx} 0)"><g id="fps">`;
    // ---- season layer (items that belong to the house move with it: - dx)
    const P = [];
    if (vis === 'weihnachten') {
      svg += fir(760 - dx, 104, 1.25, snowGround, true, r);
      // garland of bulbs along the top
      // fairy lights on a sagging wire; every bulb glows and sparkles in its own colour
      for (let x0 = 0; x0 < W; x0 += 300) svg += `<path d="M${x0} ${TOP + 6} Q ${x0 + 150} ${TOP + 30} ${x0 + 300} ${TOP + 6}" stroke="#2c3a2c" stroke-width="1.2" fill="none"/>`;
      for (let x = 10; x < W; x += 25) { const y = TOP + 6 + 12 * Math.sin(Math.PI * (x % 300) / 300); const c = ['#FF4D4D', '#FFC83D', '#3FD07A', '#4FA8FF', '#FF6FD8'][(x / 25 | 0) % 5]; const d = (r() * 2.4).toFixed(2);
        svg += `<rect x="${(x - 1).toFixed(1)}" y="${(y - 0.8).toFixed(1)}" width="2" height="2" fill="#2c3a2c"/><circle class="glw" cx="${x}" cy="${(y + 3.5).toFixed(1)}" r="5.5" fill="${c}" style="animation-delay:-${d}s"/><circle class="tw" cx="${x}" cy="${(y + 3.5).toFixed(1)}" r="2" fill="${c}" style="animation-delay:-${d}s"/><circle cx="${(x - 0.6).toFixed(1)}" cy="${(y + 2.8).toFixed(1)}" r=".6" fill="#fff" opacity=".8"/>`; }
      // Advent wreath with 1–4 candles lit
      const a = s.advent || 0;
      if (a) {
        svg += `<g transform="translate(${(own ? 984 : 990) - dx} 108)"><ellipse cx="0" cy="0" rx="30" ry="6" fill="#2f7a46"/>`;
        [-18, -6, 6, 18].forEach((cx, i) => { svg += `<rect x="${cx - 3}" y="-18" width="6" height="16" rx="1" fill="#c8302e"/>${i < a ? `<path class="flame" d="M${cx} -27 q3 5 0 8 q-3 -3 0 -8z" fill="#FFC23D"/>` : ''}`; });
        svg += '</g>';
      }
      if (s.sub === 'samichlaus') svg += emo(340, 104, '🎅', 26) + emo(372, 106, '🎁', 18) + emo(306, 106, '🍊', 14);
      if (s.sub === 'heiligabend') svg += '<path class="sun" d="M560 22 l4 9 10 1 -7.5 7 2 10 -8.5 -5 -8.5 5 2 -10 -7.5 -7 10 -1z" fill="#FFD24A"/>' + emo(700 - dx, 106, '🎁', 20);
      if (xmasSnow && kind !== 'snowy') kind = 'snowy-x';
    }
    if (vis === 'silvester' || (vis === 'august' && hour >= 22)) {
      const cols = vis === 'august' ? ['#DA291C', '#ffffff', '#FFD24A'] : ['#FFD24A', '#FF7AB6', '#8F6BFF', '#4FD1C5', '#ffffff'];
      const n = Math.round(6 * mul * (vis === 'silvester' ? 1.5 : 1));
      for (let i = 0; i < n; i++) svg += burstRays(80 + r() * (W - 160), 18 + r() * 40, cols[i % cols.length], (r() * 2.6).toFixed(2));
    }
    if (vis === 'dreikoenig') svg += '<path class="sun" d="M600 20 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z" fill="#FFD24A"/><path d="M590 30 L470 70" stroke="#FFD24A" stroke-width="2" opacity=".6"/>' + emo(560, 106, '👑', 18) + emo(600, 106, '👑', 18) + emo(640, 106, '👑', 18);
    if (vis === 'fasnacht') {
      // streamers and confetti everywhere
      ['#FFD84D', '#5CE1E6', '#FF7AB6', '#9EDC9E'].forEach((c, i) => { svg += `<path d="M-10 ${18 + i * 14} C 200 ${4 + i * 14} 400 ${40 + i * 12} 600 ${18 + i * 14} S 1000 ${2 + i * 14} 1220 ${24 + i * 12}" stroke="${c}" stroke-width="3" fill="none" opacity=".8"/>`; });
      svg += emo(300, 96, '🎭', 30, 'bob') + emo(900, 96, '🎭', 30, 'bob', 'style="animation-delay:-1.5s"') + emo(600, 100, '🥁', 22) + emo(160, 100, '🎺', 20);
      P.push(['confetti', 70]);
    }
    if (vis === 'liebe') { P.push(['hearts', 14]); if (s.anniversary) svg += banner(lang === 'en' ? annText(s, 'en') : annText(s, 'de'), '#FF6B9B', BX); }
    if (vis === 'fruehling' || vis === 'ostern') {
      svg += '<g transform="translate(470 102)"><path d="M0 0 L0 -34 M0 -20 L-18 -38 M0 -26 L16 -44" stroke="#7A5233" stroke-width="6" stroke-linecap="round"/><g class="sw" style="transform-origin:0 -30px">';
      for (let i = 0; i < 26; i++) svg += `<circle cx="${(r() - 0.5) * 60}" cy="${-34 - r() * 30}" r="${3 + r() * 4}" fill="${r() > 0.3 ? '#ffc4dc' : '#ffe6f0'}"/>`;
      svg += '</g></g>';
      for (let i = 0; i < 9; i++) { const x = hasHouse ? (i < 4 ? CX - 140 + i * 13 : CX + 70 + (i - 4) * 13) : 560 + i * 26; svg += `<path d="M${x} 104 v-14" stroke="#3f8f3a" stroke-width="2"/><path d="M${x - 5} 92 q5 -10 10 0 q-5 4 -10 0z" fill="${['#FF5A7A', '#FFD84D', '#FF8A3C', '#C77DFF'][i % 4]}"/>`; }
      for (let i = 0; i < 3; i++) svg += `<g class="fly" style="animation-duration:${(26 + r() * 14).toFixed(0)}s;animation-delay:-${(r() * 20).toFixed(0)}s"><path d="M0 ${24 + i * 9} q5 -5 10 0 q5 -5 10 0" stroke="#33415c" stroke-width="2" fill="none"/></g>`;
      if (vis === 'ostern') { svg += emo(380, 104, '🐰', 24, 'bob'); for (let i = 0; i < 6; i++) svg += `<ellipse cx="${200 + i * 140 + r() * 40}" cy="${104 + r() * 6}" rx="6" ry="8" fill="${['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF', '#FF8A3C'][i]}"/>`; }
      if (s.key === 'muttertag') { svg += emo(380, 106, '💐', 24); P.push(['hearts', 8]); svg += banner(lang === 'en' ? 'Thank you, Mum!' : 'Danke, Mami!', '#FF6B9B', BX); }
    }
    if (vis === 'pfingsten') {
      svg += '<g class="bob"><path d="M560 20 L580 34 L560 52 L540 34Z" fill="#FF8A3C"/><path d="M560 20 L560 52 M540 34 L580 34" stroke="#fff" stroke-width="1.2"/><path d="M560 52 q10 14 -4 24 q-12 10 2 22" stroke="#33415c" stroke-width="1.4" fill="none"/></g>';
      if (s.key === 'muttertag') { svg += emo(380, 106, '💐', 24); P.push(['hearts', 8]); svg += banner(lang === 'en' ? 'Thank you, Mum!' : 'Danke, Mami!', '#FF6B9B', BX); }
      else if (s.key === 'auffahrt') svg += emo(380, 106, '🧺', 20);
    }
    if (vis === 'vatertag') {
      svg += '<path d="M360 104 L360 62 M520 104 L520 62" stroke="#6b4a2e" stroke-width="6"/><path d="M360 70 Q 440 100 520 70" stroke="#e8c27a" stroke-width="8" fill="none"/><path d="M360 70 Q 440 96 520 70" stroke="#d9534f" stroke-width="2" fill="none" stroke-dasharray="6 6"/>';
      svg += emo(440, 88, '😎', 18) + `<g class="fly" style="animation-duration:24s"><path d="M0 30 l22 6 -22 6 6 -6z" fill="#fff" stroke="#9aa7b4"/></g>`;
      svg += banner(lang === 'en' ? 'Thank you, Dad!' : 'Danke, Papi!', '#3E8EDE', BX);
    }
    if (vis === 'sommer') {
      svg += '<g class="sw" style="transform-origin:180px 104px"><path d="M180 104 Q 186 70 176 40" stroke="#8a5a2b" stroke-width="6" fill="none"/>' + ['M176 40 q-30 -6 -44 12', 'M176 40 q30 -8 44 10', 'M176 40 q-18 -22 -40 -18', 'M176 40 q18 -24 40 -16'].map((d) => `<path d="${d}" stroke="#2f9a46" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('') + '</g>';
      svg += '<path d="M760 104 L780 60" stroke="#8a5a2b" stroke-width="3"/><path d="M738 66 Q 780 36 822 54Z" fill="#ff5a5a"/><path d="M752 60 Q 780 44 806 56" stroke="#fff" stroke-width="5" fill="none"/>';
      svg += emo(640, 110, '🏐', 14, 'bob') + emo(980, 110, '🏰', 18) + emo(1080, 112, '🩴', 14) + `<g class="fly" style="animation-duration:40s"><path d="M0 56 l60 0" stroke="#fff" stroke-width="1"/><path d="M0 50 h-22 v12 h22z" fill="#fff"/></g>`;
    }
    if (vis === 'august') {
      // bunting on a string: red pennants with a white cross, white ones with a red cross
      for (let x0 = 0; x0 < W; x0 += 240) svg += `<path d="M${x0} ${TOP + 3} Q ${x0 + 120} ${TOP + 63} ${x0 + 240} ${TOP + 3}" stroke="#8a8f96" stroke-width="1" fill="none"/><circle cx="${x0}" cy="${TOP + 4}" r="2" fill="#8a8f96"/>`;
      for (let x = 4; x < W - 10; x += 20) { const t = ((x + 7) % 240) / 240; const y = TOP + 3 + 60 * t * (1 - t); const red = (x / 20 | 0) % 2 === 0; const f = red ? '#DA291C' : '#ffffff'; const k = red ? '#ffffff' : '#DA291C';
        svg += `<g class="sw" style="transform-origin:${x + 7}px ${y.toFixed(1)}px;animation-delay:-${(r() * 3).toFixed(1)}s"><path d="M${x} ${y.toFixed(1)} h14 l-7 15z" fill="${f}" stroke="${red ? 'none' : '#d9d9d9'}" stroke-width=".5"/><path d="M${x + 7} ${(y + 2).toFixed(1)} v6 M${x + 4} ${(y + 5).toFixed(1)} h6" stroke="${k}" stroke-width="1.8"/></g>`; }
      svg += '<g transform="translate(560 40)"><path d="M0 64 V0" stroke="#999" stroke-width="2"/><g class="sw" style="transform-origin:0 0"><rect x="0" y="0" width="30" height="30" fill="#DA291C"/><path d="M15 6 v18 M6 15 h18" stroke="#fff" stroke-width="6"/></g></g>';
      if (hour >= 21) { svg += '<g transform="translate(380 104)"><path d="M-22 0 L22 0" stroke="#6b4a2e" stroke-width="5"/><path class="flame" d="M-16 0 Q -8 -36 0 -46 Q 8 -36 16 0Z" fill="#FF8A3C"/><path class="flame" d="M-8 0 Q 0 -24 8 0Z" fill="#FFD24A"/></g>'; P.push(['sparks', 12]); }
    }
    if (vis === 'schule') svg += emo(380, 104, '🎒', 26, 'bob') + emo(430, 106, '✏️', 18) + emo(470, 106, '📚', 20) + emo(600, 40, '🔤', 18, 'bob');
    if (vis === 'herbst') { P.push(['leaves', 14]); if (s.key === 'erntedank') svg += emo(380, 106, '🎃', 22) + emo(420, 106, '🍎', 16) + emo(450, 106, '🌻', 20); }
    if (vis === 'sport') svg += `<g class="fly" style="animation-duration:22s"><text x="0" y="100" font-size="20">⛷️</text></g><path d="M0 30 L1200 16" stroke="#444" stroke-width="1"/>` + `<g class="fly" style="animation-duration:60s"><text x="0" y="36" font-size="18">🚡</text></g>`;
    if (vis === 'geburtstag') {
      for (let x = 0; x < W; x += 22) svg += `<path d="M${x} 4 l14 0 -7 16z" fill="${['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF'][(x / 22) % 5]}"/>`;
      ['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF'].forEach((c, i) => { const x = 300 + i * 150; svg += `<g class="bob" style="animation-delay:-${i * 0.6}s"><path d="M${x} ${60 + (i % 2) * 8} q-4 20 2 38" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/><ellipse cx="${x}" cy="${46 + (i % 2) * 8}" rx="13" ry="16" fill="${c}"/></g>`; });
      svg += banner('Happy Birthday!', '#FF7AB6', BX);
    }
    svg += `</g><use href="#fps" x="${W}"/><use href="#fps" x="${-W}"/></g>`;
    // ---- weather layer (Christmas: it always snows – the real weather stays in the corner)
    if (!o.still) {
      const n = (x) => Math.max(0, Math.round(x * mul * wildMul));
      const dx = Math.round(wind * 1.2) + (storm ? 40 : 0);
      if (kind === 'rainy' || kind === 'pouring' || kind === 'lightning') svg += fall(n(kind === 'rainy' ? 40 : 70), r, (x) => `<line class="fl" x1="${x.toFixed(0)}" y1="0" x2="${(x - 2 - wind / 10).toFixed(0)}" y2="9" stroke="#cfe3ff" stroke-width="1.3" opacity=".7" style="--dx:${-dx}px;animation-duration:${(0.6 + r() * 0.5).toFixed(2)}s;animation-delay:-${(r() * 1).toFixed(2)}s"/>`);
      if (kind === 'snowy' || kind === 'snowy-x') svg += fall(n(46), r, (x) => `<circle class="fl" cx="${x.toFixed(0)}" cy="0" r="${(1 + r() * 2).toFixed(1)}" fill="#fff" opacity=".9" style="--dx:${(-dx / 2 + (r() - 0.5) * 30).toFixed(0)}px;animation-duration:${(5 + r() * 5).toFixed(1)}s;animation-delay:-${(r() * 9).toFixed(1)}s"/>`);
      if (kind === 'fog') for (let i = 0; i < 3; i++) svg += `<rect class="fog" x="-60" y="${40 + i * 22}" width="${W + 120}" height="16" rx="8" fill="#fff" opacity=".35" style="animation-delay:-${i * 4}s"/>`;
      if (kind === 'windy' || storm) svg += fall(n(10), r, (x, k) => `<path class="fly" d="M0 ${(10 + k * 70).toFixed(0)} q20 -4 40 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6" style="animation-duration:${(3 + r() * 2).toFixed(1)}s;animation-delay:-${(r() * 4).toFixed(1)}s"/>`);
      P.forEach(([what, cnt]) => {
        if (what === 'confetti') svg += fall(n(cnt), r, (x) => `<rect class="fl" x="${x.toFixed(0)}" y="0" width="4" height="7" fill="${['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF', '#FF8A3C'][(r() * 6) | 0]}" style="--dx:${((r() - 0.5) * 60).toFixed(0)}px;animation-duration:${(3 + r() * 4).toFixed(1)}s;animation-delay:-${(r() * 6).toFixed(1)}s"/>`);
        if (what === 'hearts') svg += fall(n(cnt), r, (x) => `<g class="rise" style="animation-duration:${(7 + r() * 6).toFixed(1)}s;animation-delay:-${(r() * 10).toFixed(1)}s"><path d="M${x.toFixed(0)} ${H + 10} c-6 -8 -14 -2 -7 6 l7 7 7 -7 c7 -8 -1 -14 -7 -6z" fill="#FF6B9B" opacity=".8"/></g>`);
        if (what === 'leaves') svg += fall(n(cnt), r, (x) => `<ellipse class="fl" cx="${x.toFixed(0)}" cy="0" rx="4" ry="2.4" fill="${['#d9792b', '#b84a24', '#e0a84f'][(r() * 3) | 0]}" style="--dx:${(dx + 40 * r()).toFixed(0)}px;animation-duration:${(5 + r() * 4).toFixed(1)}s;animation-delay:-${(r() * 8).toFixed(1)}s"/>`);
        if (what === 'sparks') svg += fall(n(cnt), r, () => `<circle class="rise" cx="${(370 + r() * 20).toFixed(0)}" cy="${H - 20}" r="1.5" fill="#FFD24A" style="animation-duration:${(2 + r() * 2).toFixed(1)}s;animation-delay:-${(r() * 3).toFixed(1)}s"/>`);
      });
    }
    if (kind === 'lightning') svg += `<rect class="flash" width="${W}" height="${H}" fill="#fff"/><path class="flash" d="M700 0 L684 40 L698 40 L680 84" stroke="#fff6a8" stroke-width="3" fill="none"/>`;
    if (night && vis !== 'silvester') svg += `<rect width="${W}" height="${H}" fill="#0b1430" opacity=".18"/>`;
    svg += '</svg>';
    return `<div class="scn${o.still ? ' still' : ''}">${svg}<div class="shade"></div></div>`;
  };
  const annText = (s, lang) => { const a = s.anniversary || {}; const y = a.years; const wed = a.key === 'hochzeitstag';
    if (lang === 'en') return y ? `${y} years ${wed ? 'married' : 'together'}` : (wed ? 'Happy anniversary!' : 'Our day!');
    return y ? `${y} Jahre ${wed ? 'verheiratet' : 'zusammen'}` : (wed ? 'Hochzeitstag!' : 'Unser Tag!'); };
  // banner on the meadow below the buttons, so the navigation stays readable
  const banner = (text, col, x = 600) => `<g transform="translate(${x} 108)"><path d="M-96 -10 H96 L88 0 L96 10 H-96 L-88 0Z" fill="${col}" opacity=".92"/><text x="0" y="4.5" font-size="12" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">${esc(text)}</text></g>`;

  // ------------------------------------------------------------------------------ check effect (seasonal mini burst)
  const FX_EMO = { weihnachten: ['❄️', '⭐', '🎄'], silvester: ['✨', '🎉'], dreikoenig: ['👑', '⭐'], winter: ['❄️'], sport: ['❄️', '⛷️'], fasnacht: ['🎉', '🎊'], liebe: ['💕', '💗'],
    fruehling: ['🌸', '🌷'], ostern: ['🥚', '🐣'], pfingsten: ['🌼', '🪁'], vatertag: ['💙', '⭐'], sommer: ['☀️', '🌊'], august: ['🇨🇭', '✨'], schule: ['✏️', '⭐'], herbst: ['🍂', '🍁'], geburtstag: ['🎈', '🎉'] };
  api.burst = (host, x, y) => {
    const se = api.cur; if (!se || !FX_EMO[se.vis] || reduce() || !host) return;
    const box = document.createElement('div'); box.setAttribute('aria-hidden', 'true');
    box.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none;z-index:9998`;
    const em = FX_EMO[se.vis];
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span'); s.textContent = em[i % em.length]; const a = (i / 8) * Math.PI * 2;
      s.style.cssText = `position:absolute;font-size:18px;transition:transform .9s cubic-bezier(.2,.8,.3,1),opacity .9s;transform:translate(-50%,-50%);opacity:1`;
      box.appendChild(s);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => { s.style.transform = `translate(${Math.cos(a) * 60 - 9}px,${Math.sin(a) * 60 - 9}px) scale(.6)`; s.style.opacity = '0'; }));
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 1100);
  };

  // ------------------------------------------------------------------------------ suggestions (from noon, one per day)
  const SUG = {
    pool: ['🏊', 'Heute Badi-Wetter!', 'Pool weather today!'], poolabend: ['🌅', 'Pool-Abendschwumm', 'Evening swim in the pool'], poolparty: ['🎉', 'Pool-Party!', 'Pool party!'],
    jacuzzi: ['♨️', 'Jacuzzi am Abend', 'Hot tub this evening'], jacuzzisterne: ['🌌', 'Jacuzzi unter Sternen', 'Hot tub under the stars'], jacuzzischnee: ['❄️', 'Jacuzzi im Schnee', 'Hot tub in the snow'],
    elternjacuzzi: ['🥂', 'Eltern-Jacuzzi ab 21 Uhr', 'Parents\' hot tub from 9 pm'], kino: ['🍿', 'Homecinema-Abend', 'Home cinema night'], spiele: ['🎲', 'Spieleabend', 'Games night'],
    backen: ['🍪', 'Guetzli backen', 'Bake Christmas biscuits'], basteln: ['✂️', 'Bastel-Nachmittag', 'Crafts afternoon'], puzzle: ['🧩', 'Puzzle-Zeit', 'Puzzle time'],
    lego: ['🧱', 'Lego-Challenge', 'Lego challenge'], fotoalbum: ['📸', 'Fotoalbum anschauen', 'Look at the photo album'], grill: ['🍖', 'Grillabend', 'Barbecue evening'],
    velo: ['🚲', 'Velotour', 'Bike ride'], spaziergang: ['🚶', 'Familien-Spaziergang', 'Family walk'], pergola: ['🌿', 'Znacht in der Pergola', 'Dinner on the terrace'],
    schlitteln: ['🛷', 'Schlitteln!', 'Sledging!'], schoggi: ['☕', 'Heisse Schoggi', 'Hot chocolate'], adventsfenster: ['🪟', 'Adventsfenster anschauen', 'Visit the Advent windows'],
    ostereier: ['🥚', 'Ostereier suchen', 'Easter egg hunt'], see: ['🏖️', 'Badi am See', 'Lake swim'], glace: ['🍦', 'Glace-Zeit', 'Ice cream time'],
    teamwork: ['🏆', 'Teamwork-Belohnung!', 'Teamwork reward!'], ruhig: ['🛋️', 'Ruhiger Abend', 'Quiet evening'],
  };
  const SUB = {
    pool: ['Pool {p}° · {t}° · kein Regen bis am Abend', 'Pool {p}° · {t}° · no rain until evening'], poolabend: ['Pool {p}° und ein warmer Abend', 'Pool {p}° and a warm evening'],
    poolparty: ['Wochenende, {t}° und Pool {p}°', 'Weekend, {t}° and pool {p}°'], jacuzzi: ['Jacuzzi {j}° · trockener Abend', 'Hot tub {j}° · dry evening'],
    jacuzzisterne: ['Klare Nacht · Jacuzzi {j}°', 'Clear night · hot tub {j}°'], jacuzzischnee: ['Schnee und Jacuzzi {j}° – herrlich!', 'Snow and hot tub {j}° – lovely!'],
    elternjacuzzi: ['Kinder im Bett, Jacuzzi {j}°', 'Kids in bed, hot tub {j}°'], kino: ['Regen draussen, Popcorn drinnen', 'Rain outside, popcorn inside'],
    spiele: ['Heute ist nichts los – perfekt zum Spielen', 'Nothing on today – perfect for games'], backen: ['Es riecht nach Weihnachten', 'It smells like Christmas'],
    basteln: ['Regentag = Basteltag', 'Rainy day = crafts day'], puzzle: ['Gemeinsam Teil für Teil', 'Together, piece by piece'], lego: ['Wer baut den höchsten Turm?', 'Who builds the tallest tower?'],
    fotoalbum: ['Weisst du noch …?', 'Do you remember …?'], grill: ['{t}° und ein trockener Abend', '{t}° and a dry evening'], velo: ['{t}° und trocken', '{t}° and dry'],
    spaziergang: ['Frische Luft tut gut', 'Fresh air is good for you'], pergola: ['Warmer Abend, {t}°', 'Warm evening, {t}°'], schlitteln: ['Frischer Schnee!', 'Fresh snow!'],
    schoggi: ['Draussen nur {t}°', 'Only {t}° outside'], adventsfenster: ['Ein Spaziergang im Lichterglanz', 'A walk among the lights'], ostereier: ['Der Osterhase war da!', 'The Easter bunny was here!'],
    see: ['Sommer, Sonne, {t}°', 'Summer, sun, {t}°'], glace: ['{t}° – Zeit für eine Glace', '{t}° – time for ice cream'], teamwork: ['Alle Ämtli erledigt – zusammen feiern!', 'All chores done – celebrate together!'],
    ruhig: ['Ein gemütlicher Abend zuhause', 'A cosy evening at home'],
  };
  const LIMIT = { puzzle: 14, fotoalbum: 14, kino: 3, spiele: 2, lego: 5, basteln: 4 };
  const num = (hass, ent) => { const st = ent && hass && hass.states[ent]; if (!st) return null; const v = Number(st.attributes && st.attributes.current_temperature != null ? st.attributes.current_temperature : st.state); return isFinite(v) ? v : null; };
  // forecast: [{datetime, condition, precipitation, precipitation_probability, temperature}] (hourly if available)
  const rainBetween = (fc, from, to) => (fc || []).some((f) => { const d = new Date(f.datetime); const h = d.getHours(); const today = d.toDateString() === new Date().toDateString();
    return today && h >= from && h <= to && (['rainy', 'pouring', 'lightning-rainy', 'lightning', 'snowy-rainy', 'hail'].includes(f.condition) || Number(f.precipitation_probability) >= 50 || Number(f.precipitation) >= 0.5); });
  const condAt = (fc, h) => { const f = (fc || []).find((x) => { const d = new Date(x.datetime); return d.toDateString() === new Date().toDateString() && d.getHours() === h; }); return f && f.condition; };
  api.suggest = (snap, hass, wx, fc, now) => {
    const cfg = (snap && snap.season_cfg) || {}; if (cfg.sug_enabled === false || !wx) return null;
    now = now || new Date(); const hh = now.getHours() + now.getMinutes() / 60; const [fh, fm] = String(cfg.sug_from || '12:00').split(':').map(Number);
    if (hh < fh + (fm || 0) / 60) return null;
    const se = snap.season || {}; const vis = se.vis || 'alltag'; const m = now.getMonth() + 1; const wd = now.getDay(); const weekend = wd === 0 || wd === 6 || wd === 5;
    const t = wx.temp; const k = wx.kind; const sunny = ['sunny', 'partlycloudy'].includes(k); const wet = ['rainy', 'pouring', 'lightning'].includes(k);
    const dryEve = !rainBetween(fc, Math.max(17, now.getHours()), 22) && !wet; const dryDay = !rainBetween(fc, now.getHours(), 20) && !wet;
    const persons = snap.persons || []; const adults = persons.filter((p) => p.role === 'adult').map((p) => p.id);
    const busyEve = (ids) => ids.some((id) => ((snap.busy || {})[id] || []).some(([s, e]) => { const a = new Date(s); const b = new Date(e); return b.getHours() + b.getMinutes() / 60 > 18 && a.getHours() < 23 && b > now; }));
    const anyBusy = busyEve(persons.map((p) => p.id)); const adultsBusy = busyEve(adults);
    const pool = num(hass, cfg.pool); const jac = num(hass, cfg.jacuzzi); const poolOk = pool != null && pool >= (cfg.pool_min || 24); const jacOk = jac != null && jac >= (cfg.jacuzzi_min || 34);
    const cold = m >= 10 || m <= 4; const summer = m >= 6 && m <= 8;
    const allDone = (() => { const it = (snap.items || []).filter((i) => (i.start || '') <= snap.today && (i.due || i.start || '') >= snap.today); return it.length && it.every((i) => i.done); })();
    const c = []; const add = (key, ok, w = 1) => { if (ok) for (let i = 0; i < w; i++) c.push(key); };
    add('pool', poolOk && sunny && t >= 23 && dryDay && hh < 17 && m >= 5 && m <= 9, 3);
    add('poolabend', poolOk && t >= 24 && dryEve && hh >= 16 && m >= 5 && m <= 9, 2);
    add('poolparty', poolOk && weekend && t >= 27 && dryDay, 2);
    add('jacuzzi', jacOk && cold && dryEve && !adultsBusy, 2);
    add('jacuzzisterne', jacOk && cold && dryEve && !adultsBusy && ['clear-night', 'sunny'].includes(condAt(fc, 21) || k));
    add('jacuzzischnee', jacOk && k === 'snowy' && !adultsBusy, 2);
    add('elternjacuzzi', jacOk && cold && dryEve && !adultsBusy && hh >= 19);
    add('kino', (wet || (k === 'cloudy' && t != null && t < 12)) && !anyBusy && weekend, 2);
    add('spiele', wet && !anyBusy, 2);
    add('backen', vis === 'weihnachten' && !anyBusy, 2);
    add('basteln', wet && hh < 17);
    add('puzzle', wet);
    add('lego', wet || k === 'cloudy');
    add('fotoalbum', (wet || k === 'cloudy') && weekend);
    add('grill', t >= 20 && dryEve && m >= 4 && m <= 9 && !anyBusy, 2);
    add('velo', sunny && t >= 15 && t <= 28 && weekend && dryDay && hh < 17);
    add('spaziergang', !wet && dryDay && t != null && t > -5 && k !== 'lightning', 3);
    add('pergola', (summer || t >= 22) && dryEve && !anyBusy, 2);
    add('schlitteln', k === 'snowy' && hh < 17, 3);
    add('schoggi', t != null && t <= 5, 2);
    add('adventsfenster', vis === 'weihnachten' && hh >= 16 && !wet, 2);
    add('ostereier', ['ostersonntag', 'ostermontag'].includes(se.key), 5);
    add('see', summer && sunny && t >= 26 && weekend && dryDay && hh < 17, 2);
    add('glace', summer && t >= 25 && hh < 18, 2);
    add('teamwork', allDone, 3);
    add('ruhig', true);
    // frequency limits remembered on this device
    let last = {}; try { last = JSON.parse(localStorage.getItem('fp_sug_last') || '{}'); } catch (e) { last = {}; }
    const day = Math.floor(now.getTime() / 86400000);
    const ok = c.filter((key) => !LIMIT[key] || !last[key] || last[key] === day || day - last[key] >= LIMIT[key]);
    if (!ok.length) return null;
    const key = ok[(day * 2654435761 >>> 0) % ok.length];
    if (last[key] !== day && LIMIT[key]) { last[key] = day; try { localStorage.setItem('fp_sug_last', JSON.stringify(last)); } catch (e) { /* ignore */ } }
    const lg = snap.lang === 'en' ? 1 : 0; const fmt = (x) => String(x).replace('{p}', pool != null ? pool.toFixed(1).replace('.', lg ? '.' : ',') : '–').replace('{j}', jac != null ? Math.round(jac) : '–').replace('{t}', t != null ? t : '–');
    return { key, icon: SUG[key][0], title: SUG[key][1 + lg], text: fmt(SUB[key][lg]) };
  };
  api.weather = weather;
  api.LABEL = LABEL;
  api.reduce = reduce;
  window.FPSEASON = api;
})();
