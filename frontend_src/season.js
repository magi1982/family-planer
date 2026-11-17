// ---------------------------------------------------------------------------------------------------------
// Seasons & weather: animated header scene, page background, band, check effect and suggestions.
// Everything is drawn from data (season from the server, weather from the HA weather entity) – no images.
// window.FPSEASON = { nextYear, setSnap, cur, scene, sceneKey, weather, suggest, burst, page, band, LABEL, play, canPlay }
// ---------------------------------------------------------------------------------------------------------
(() => {
  // New Year's Eve always shows the coming year; only in January (just after midnight) is the new year already the current one
  const nextYear = (d) => (d.getMonth() === 0 ? d.getFullYear() : d.getFullYear() + 1);
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
  const api = { nextYear, cur: null };
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
@keyframes fptw{0%,100%{opacity:1}50%{opacity:.25}}@keyframes fplm{0%,6%{transform:translateY(0)}35%{transform:translateY(-150px)}60%{transform:translateY(-150px)}80%{transform:translateY(-14px)}88%,100%{transform:translateY(0)}}@keyframes fplmfl{0%,2%{opacity:0;transform:scaleY(.3)}6%,34%{opacity:1;transform:scaleY(1.3)}38%,60%{opacity:0}64%,88%{opacity:1;transform:scaleY(1)}92%,100%{opacity:0;transform:scaleY(.3)}}@keyframes fpldust{0%,2%,78%{opacity:0;transform:translate(0,0)}10%,90%{opacity:.9}24%,100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.8)}}@keyframes fplring{0%,78%{opacity:0;transform:scale(.3)}84%{opacity:.9}100%{opacity:0;transform:scale(2.4)}}@keyframes fpwbob{0%,100%{transform:translateY(0)}50%{transform:translateY(1.2px)}}@keyframes fpfloe2{from{transform:translateX(60px)}to{transform:translateX(-60px)}}@keyframes fptnight{0%{opacity:0}8%,84%{opacity:.84}95%,100%{opacity:0}}@keyframes fptsky{0%,6%{opacity:0}14%,84%{opacity:1}93%,100%{opacity:0}}@keyframes fptice{0%,14%{transform:translateX(420px);opacity:0}16%{opacity:1}32%,80%{transform:translateX(0);opacity:1}90%,100%{transform:translateX(0);opacity:0}}@keyframes fptflash{0%,31%{opacity:0;transform:scale(.4)}33%{opacity:1;transform:scale(1.2)}37%,100%{opacity:0;transform:scale(1.6)}}@keyframes fpshake{0%,31%,37%,100%{transform:translate(0,0)}32%{transform:translate(-3px,1px)}33%{transform:translate(3px,-1px)}34%{transform:translate(-2px,1px)}35%{transform:translate(2px,0)}}@keyframes fpstern{0%,38%{transform:rotate(0) translate(0,0);opacity:1}52%{transform:rotate(-12deg) translate(0,-2px)}68%{transform:rotate(-30deg) translate(-6px,80px)}72%,92%{transform:rotate(-30deg) translate(-6px,110px);opacity:0}93%{transform:none;opacity:0}100%{transform:none;opacity:1}}@keyframes fpbow{0%,38%{transform:rotate(0) translate(0,0);opacity:1}50%{transform:rotate(14deg) translate(2px,8px)}64%{transform:rotate(34deg) translate(8px,90px)}70%,92%{transform:rotate(34deg) translate(8px,120px);opacity:0}93%{transform:none;opacity:0}100%{transform:none;opacity:1}}@keyframes fpsbub{0%,40%{opacity:0}46%,74%{opacity:1}82%,100%{opacity:0}}@keyframes fptboats{0%,62%{transform:translateX(0);opacity:0}66%{opacity:1}90%{transform:translateX(-520px);opacity:1}92%,100%{transform:translateX(-520px);opacity:0}}@keyframes fpbub2{0%{transform:translateY(0);opacity:0}30%{opacity:1}100%{transform:translateY(-12px);opacity:0}}@keyframes fptossx{0%,8%{transform:translateX(0)}42%,58%{transform:translateX(48px)}92%,100%{transform:translateX(0)}}@keyframes fptossy{0%,8%,42%,58%,92%,100%{transform:translateY(0)}25%,75%{transform:translateY(-24px)}}@keyframes fpmjump{0%,55%,100%{transform:translate(0,0)}68%{transform:translate(18px,-26px)}82%,92%{transform:translate(36px,0)}}@keyframes fpdust{0%,80%,100%{opacity:0;transform:scaleX(.4)}84%{opacity:.8;transform:scaleX(1)}96%{opacity:0;transform:scaleX(1.6)}}@keyframes fpfloe{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,1px)}}@keyframes fppace{0%,100%{transform:translateX(0)}45%,55%{transform:translateX(-30px)}}@keyframes fpsig2{0%{opacity:0;transform:translateX(0)}20%{opacity:1}100%{opacity:0;transform:translateX(30px)}}@keyframes fpsprk{0%,100%{transform:rotate(-38deg)}50%{transform:rotate(38deg)}}@keyframes fpdrip{to{stroke-dashoffset:-10}}@keyframes fpbounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes fpnote{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(6px,-22px);opacity:0}}@keyframes fpmhop{0%,100%{transform:translate(0,0)}25%{transform:translate(14px,-12px)}50%{transform:translate(28px,0)}75%{transform:translate(14px,-12px)}}@keyframes fpufo{0%,100%{transform:translate(0,0)}25%{transform:translate(120px,-6px)}50%{transform:translate(200px,6px)}75%{transform:translate(80px,4px)}}@keyframes fpshipb{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(1.4px) rotate(.4deg)}}@keyframes fpdolph{0%,70%,100%{transform:translate(0,14px) rotate(0);opacity:0}74%{opacity:1}80%{transform:translate(12px,-6px) rotate(-20deg)}88%{transform:translate(26px,6px) rotate(30deg);opacity:1}92%{opacity:0}}@keyframes fplava{0%{transform:translate(0,0);opacity:1}45%{transform:translate(calc(var(--lx) * .5),var(--ly))}100%{transform:translate(var(--lx),24px);opacity:0}}@keyframes fpplume{0%{transform:translate(0,0) scale(.6);opacity:.85}100%{transform:translate(var(--dx,-20px),-40px) scale(2.2);opacity:0}}@keyframes fpsig{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.4);opacity:0}}@keyframes fppop1{0%,40%,100%{opacity:0;transform:scale(.6)}48%,80%{opacity:1;transform:scale(1)}}@keyframes fpgrd{0%,40%,100%{transform:translateX(0)}50%,70%{transform:translateX(14px)}}@keyframes fpliz{0%{transform:translateX(0);opacity:0}5%{opacity:1}18%,30%{transform:translateX(70px)}42%,52%{transform:translateX(110px)}70%{transform:translateX(200px);opacity:1}76%,100%{transform:translateX(220px);opacity:0}}@keyframes fplzleg{0%,100%{transform:scaleX(1)}50%{transform:scaleX(-1)}}@keyframes fpsput{0%{transform:translateX(-40px)}100%{transform:translateX(1260px)}}@keyframes fpconc{0%{transform:translateX(-80px)}60%,100%{transform:translateX(1300px)}}@keyframes fpwl{0%,100%{opacity:0}6%,34%{opacity:1}40%{opacity:0}}@keyframes fppeek3{0%,22%,100%{transform:translateX(0)}30%,90%{transform:translateX(-30px)}34%{transform:translateX(-26px)}}@keyframes fpdove2{0%,14%{transform:translate(0,0)}100%{transform:translate(var(--tx),var(--ty))}}@keyframes fpcable2{0%,8%{transform:translate(0,0)}27%{transform:translate(var(--mx),var(--my))}46%,54%{transform:translate(var(--cx),var(--cy))}73%{transform:translate(var(--mx),var(--my))}92%,100%{transform:translate(0,0)}}@keyframes fpchole{0%,4%{opacity:0}9%,36%{opacity:1}46%,100%{opacity:0}}@keyframes fpcrab2{0%,10%{transform:translate(0,3px) scaleY(0)}17%{transform:translate(0,0) scaleY(1)}62%,68%{transform:translate(46px,0) scaleY(1)}78%,100%{transform:translate(46px,3px) scaleY(0)}}@keyframes fpcmnd{0%,70%{opacity:0}76%,84%{opacity:1}96%,100%{opacity:0}}@keyframes fpstr{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}@keyframes fpyr{0%,38%,100%{opacity:0;transform:scale(.6)}46%{opacity:1;transform:scale(1.08)}52%,78%{opacity:1;transform:scale(1)}90%{opacity:0;transform:scale(1)}}@keyframes fphop2{0%,58%,100%{transform:translateY(16px)}64%{transform:translateY(-1px)}68%,88%{transform:translateY(0)}}@keyframes fppeek2{0%,64%,100%{transform:translateY(14px)}70%,88%{transform:translateY(0)}}@keyframes fpcrab{0%{transform:translateX(0);opacity:0}8%{opacity:1}40%{transform:translateX(55px)}55%{transform:translateX(35px)}85%{transform:translateX(80px);opacity:1}100%{transform:translateX(90px);opacity:0}}@keyframes fpdove{0%,12%{transform:translate(0,0);opacity:1}100%{transform:translate(300px,-130px);opacity:0}}@keyframes fpflap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(-.5)}}@keyframes fpdrone{0%,100%{transform:translate(0,0)}25%{transform:translate(90px,-12px)}50%{transform:translate(160px,4px)}75%{transform:translate(70px,14px)}}@keyframes fprot{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.2)}}@keyframes fpball1{0%,10%{transform:translate(0,0);opacity:0}14%{opacity:1}50%{transform:translate(66px,-20px)}86%{transform:translate(132px,6px);opacity:1}90%,100%{transform:translate(132px,6px);opacity:0}}@keyframes fpball2{0%,50%{transform:translate(0,0);opacity:0}54%{opacity:1}75%{transform:translate(-66px,-20px)}96%{transform:translate(-132px,6px);opacity:1}100%{opacity:0;transform:translate(-132px,6px)}}@keyframes fppeek{0%,62%,100%{transform:translateX(0)}70%,86%{transform:translateX(-30px)}74%{transform:translateX(-26px)}}@keyframes fpnod{0%,100%{transform:rotate(0)}50%{transform:rotate(9deg)}}@keyframes fpwave2{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(20deg)}}@keyframes fpplane{0%,55%{transform:translateX(-80px)}100%{transform:translateX(1300px)}}@keyframes fpfin{0%,60%,100%{transform:translate(0,14px);opacity:0}64%{transform:translate(0,0);opacity:1}88%{transform:translate(110px,0);opacity:1}92%{transform:translate(120px,14px);opacity:0}}@keyframes fpcable{0%,8%{transform:translate(0,0)}46%,54%{transform:translate(var(--cx),var(--cy))}92%,100%{transform:translate(0,0)}}@keyframes fpski{0%{transform:translate(0,0);opacity:0}6%{opacity:1}25%{transform:translate(calc(var(--sx) * .3),calc(var(--sy) * .25)) rotate(-8deg)}50%{transform:translate(calc(var(--sx) * .55),calc(var(--sy) * .55)) rotate(8deg)}75%{transform:translate(calc(var(--sx) * .8),calc(var(--sy) * .78)) rotate(-8deg)}92%{transform:translate(var(--sx),var(--sy));opacity:1}100%{transform:translate(var(--sx),var(--sy));opacity:0}}@keyframes fphop{0%,58%,100%{transform:translateY(26px)}64%{transform:translateY(-2px)}68%,86%{transform:translateY(0)}70%{transform:translateY(-3px)}}@keyframes fpleg{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(22deg)}}@keyframes fprocket{0%{transform:translateY(70px);opacity:0}5%{opacity:1}30%{transform:translateY(0);opacity:1}34%,100%{transform:translateY(0);opacity:0}}@keyframes fpflare{0%,82%,100%{opacity:.15;transform:scale(.35)}88%{opacity:1;transform:scale(1.15)}94%{opacity:.4;transform:scale(.6)}}@keyframes fpshoot{0%,88%{opacity:0;transform:translate(0,0)}89%{opacity:1}96%{opacity:0;transform:translate(190px,66px)}100%{opacity:0;transform:translate(190px,66px)}}@keyframes fpglw{0%,100%{opacity:.55}50%{opacity:.08}}
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
.scn .tw{animation:fptw 1.8s ease-in-out infinite}.scn .glw{animation:fpglw 1.8s ease-in-out infinite}.scn .lmflame,.scn .ldust,.scn .lring{opacity:0}.scn .lmflame{transform-box:fill-box;transform-origin:50% 0}.scn .lring,.scn .ldust{transform-box:fill-box;transform-origin:center}.scn svg.t-lm .lm{animation:fplm 9s cubic-bezier(.45,0,.4,1) forwards}.scn svg.t-lm .lmflame{animation:fplmfl 9s linear forwards}.scn svg.t-lm .ldust{animation:fpldust 9s ease-out forwards}.scn svg.t-lm .lring{animation:fplring 9s ease-out forwards}.scn svg.t-lm .ufo{animation-play-state:running}.scn .wbob{animation:fpwbob 3s ease-in-out infinite}.scn .floe2{animation:fpfloe2 40s linear infinite}.scn .tnight,.scn .tsky,.scn .tice,.scn .tflash,.scn .sbub,.scn .tboats{opacity:0}.scn .stern,.scn .bow{transform-box:fill-box;transform-origin:47% 89%}.scn svg.t-titanic .tnight{animation:fptnight 34s linear forwards}.scn svg.t-titanic .tsky{animation:fptsky 34s linear forwards}.scn svg.t-titanic .tice{animation:fptice 34s ease-out forwards}.scn svg.t-titanic .tflash{animation:fptflash 34s linear forwards;transform-box:fill-box;transform-origin:center}.scn svg.t-titanic .ship{animation:fpshake 34s linear forwards}.scn svg.t-titanic .stern{animation:fpstern 34s ease-in forwards}.scn svg.t-titanic .bow{animation:fpbow 34s ease-in forwards}.scn svg.t-titanic .sbub{animation:fpsbub 34s linear forwards}.scn svg.t-titanic .tboats{animation:fptboats 34s linear forwards}.scn svg.t-titanic .bowsplash{display:none}.scn .bub2{animation:fpbub2 1.6s ease-out infinite}.scn .tossx{animation:fptossx 3.2s linear infinite}.scn .tossy{animation:fptossy 3.2s infinite;animation-timing-function:cubic-bezier(.3,0,.7,1)}.scn .mjump{animation:fpmjump 9s ease-in-out infinite}.scn .dust{animation:fpdust 9s linear infinite;transform-box:fill-box;transform-origin:center;opacity:0}.scn .floe{animation:fpfloe 14s ease-in-out infinite}.scn .pace{animation:fppace 16s ease-in-out infinite}.scn .sig2{animation:fpsig2 1.8s ease-out infinite}.scn .sprk{animation:fpsprk 4s ease-in-out infinite}.scn .drip{animation:fpdrip .5s linear infinite}.scn .bounce{animation:fpbounce 1.6s ease-in-out infinite}.scn .note{animation:fpnote 2.4s ease-out infinite}.scn .mhop{animation:fpmhop 5s ease-in-out infinite}.scn .ufo{animation:fpufo 16s ease-in-out infinite}.scn .shipb{animation:fpshipb 5s ease-in-out infinite}.scn .dolph{animation:fpdolph 9s ease-in-out infinite}.scn .lava{animation:fplava 2s ease-in infinite}.scn .plume{animation:fpplume 7s ease-out infinite;transform-box:fill-box;transform-origin:center}.scn .sig{animation:fpsig 2.1s ease-out infinite;transform-box:view-box}.scn .pop1{animation:fppop1 6s ease-in-out infinite;transform-box:fill-box;transform-origin:0 100%}.scn .grd{animation:fpgrd 12s ease-in-out infinite}.scn .liz{animation:fpliz 20s ease-in-out infinite}.scn .lzleg{animation:fplzleg .34s linear infinite;transform-box:fill-box;transform-origin:center}.scn .sput{animation:fpsput 44s linear infinite}.scn .conc{animation:fpconc 26s linear infinite}.scn .wl{animation:fpwl 23s linear infinite;opacity:0}.scn .peek3{animation:fppeek3 14s ease-in-out infinite}.scn .dove2{animation:fpdove2 11s ease-in infinite}.scn .cable2{animation:fpcable2 18s ease-in-out infinite}.scn .chole{animation:fpchole 16s linear infinite;opacity:0}.scn .crab2{animation:fpcrab2 16s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}.scn .cmnd{animation:fpcmnd 16s linear infinite;opacity:0}.scn .str{animation:fpstr 3.6s ease-in-out infinite}.scn .yr{animation:fpyr 7s ease-out infinite}.scn .hop2{animation:fphop2 9s ease-in-out infinite}.scn .peek2{animation:fppeek2 10s ease-in-out infinite}.scn .crab{animation:fpcrab 12s linear infinite}.scn .dove{animation:fpdove 9s ease-in infinite}.scn .flap{animation:fpflap .32s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}.scn .drone{animation:fpdrone 10s ease-in-out infinite}.scn .rot{animation:fprot .12s linear infinite;transform-box:fill-box;transform-origin:center}.scn .ball1{animation:fpball1 3s linear infinite}.scn .ball2{animation:fpball2 3s linear infinite}.scn .peek{animation:fppeek 11s ease-in-out infinite}.scn .nod{animation:fpnod 2.8s ease-in-out infinite}.scn .wave2{animation:fpwave2 1.6s ease-in-out infinite}.scn .plane{animation:fpplane 30s linear infinite}.scn .fin{animation:fpfin 19s ease-in-out infinite}.scn .cable{animation:fpcable 16s ease-in-out infinite}.scn .ski{animation:fpski 9s linear infinite}.scn .hop{animation:fphop 9s ease-in-out infinite}.scn .leg{animation:fpleg .9s ease-in-out infinite}.scn .step{animation:fpbob .45s ease-in-out infinite}.scn .rocket{animation:fprocket 2.6s ease-out infinite}.scn .flare{animation:fpflare 11s ease-in-out infinite}.scn .shoot{animation:fpshoot 17s linear infinite}.scn .smk{animation:fpsmk 4s ease-out infinite;transform-box:fill-box;transform-origin:center}.scn .flash{animation:fpflash 7s linear infinite}
.scn .fog{animation:fpfog 14s ease-in-out infinite}.scn .fw{animation:fpfw 2.6s ease-out infinite}.scn .rise{animation:fprise linear infinite}
.scn .bob{animation:fpbob 3s ease-in-out infinite}.scn .wave{animation:fpwave 4s linear infinite}.scn .fly{animation:fpfly linear infinite}
.scn .flame{transform-box:fill-box;transform-origin:50% 100%;animation:fpflame .5s ease-in-out infinite}.scn .sun{animation:fppulse 5s ease-in-out infinite}
.scn.still *{animation:none!important}.scn.still .fl,.scn.still .rise{display:none}`;
  api.CSS = CSS;

  // ------------------------------------------------------------------------------ house with pool & pergola
  // tall gable house facing the garden, garage joined on the left with a frosted-glass railing, pool to the south;
  // snow, pool cover in winter, lights in the evening, fairy lights in Advent, icicles below -5°
  const TILE = '#C9CDD2';
  const pool = (o, x1, x2, y1, y2, persp) => {
    // covered in winter and every night: closed at 22:00 at the latest, open again from 8:00
    const winter = o.snow || o.jz === 'winter' || (o.hour != null && (o.hour >= 22 || o.hour < 8));
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
    const glass = o.night ? '#2c3648' : '#bfe0ff';
    const wall = o.night ? '#8f8574' : '#f1e3c8'; const roof = o.night ? '#6e3326' : '#b5523b';
    const late = o.hour != null && (o.hour >= 23 || o.hour < 6);
    const on = (x, y, w, h, dur, dl) => `<rect class="wl" x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${late ? '#2e4c86' : '#FFD86B'}" style="animation-duration:${dur}s;animation-delay:-${dl}s"/>`;
    const icicles = (x1, x2, y) => { let g = ''; for (let x = x1 + 3; x < x2 - 2; x += 6) { const l = 3 + ((x * 7) % 5); g += `<path d="M${x - 1.5} ${y} L${x} ${y + l} L${x + 1.5} ${y}Z" fill="#e8f7ff" opacity=".95"/>`; } return g; };
    let g = '';
    // garage, joined to the house; flat roof with frosted glass railing
    g += `<rect x="852" y="68" width="48" height="30" fill="${wall}"/><rect x="850" y="66" width="52" height="3" fill="#a7adb5"/>`;
    g += `<rect x="852" y="56" width="48" height="10" fill="#fff" opacity="${o.night ? 0.3 : 0.6}"/><rect x="852" y="55" width="48" height="1.6" fill="#a7adb5"/>`;
    if (o.snow) g += '<rect x="850" y="53" width="52" height="2.5" rx="1.2" fill="#fff"/><rect x="850" y="64.5" width="52" height="2" fill="#fff"/>';
    if (cold) g += icicles(850, 902, 69);
    // house: tall body, gable to the front
    g += `<rect x="900" y="40" width="112" height="58" fill="${wall}"/>`;
    g += `<rect x="988" y="10" width="9" height="20" fill="#8a3b2b"/>` + smoke(o, 992, 8);
    g += `<path d="M900 40 L956 8 L1012 40Z" fill="${wall}"/><path d="M892 44 L956 6 L1020 44" fill="none" stroke="${roof}" stroke-width="7" stroke-linejoin="round"/>`;
    if (o.snow) g += '<path d="M890 41 L956 3 L1022 41" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>';
    if (cold) g += '<g>' + Array.from({ length: 7 }, (_, i) => { const x = 896 + i * 9.5; const y = 44 - (x - 892) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y} L${x} ${y + l} L${x + 1.4} ${y}Z" fill="#e8f7ff"/>`; }).join('') + Array.from({ length: 7 }, (_, i) => { const x = 960 + i * 9.5; const y = 6 + (x - 956) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y + 4} L${x} ${y + 4 + l} L${x + 1.4} ${y + 4}Z" fill="#e8f7ff"/>`; }).join('') + '</g>';
    // upper floor: smaller window left, wider window right; ground floor glass front
    g += `<rect x="916" y="46" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/><line x1="930" y1="46" x2="930" y2="62" stroke="#fff" stroke-width="1.5"/><rect x="968" y="46" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/><line x1="982" y1="46" x2="982" y2="62" stroke="#fff" stroke-width="1.5"/>`;
    // ground floor: either every pane is lit or none (lit in the evening, dark late at night)
    const low = o.night && !late ? '#FFD86B' : glass;
    g += `<rect x="910" y="76" width="38" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/><rect x="954" y="76" width="22" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/><rect x="982" y="76" width="24" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/>`;
    if (o.night) g += on(917, 47, 26, 14, 19, 3) + on(969, 47, 26, 14, 27, 14);
    // pergola: roof bar and posts only, table silhouette
    g += '<rect x="902" y="69" width="108" height="5" fill="#4a5058"/><rect x="903" y="69" width="3" height="29" fill="#4a5058"/><rect x="1006" y="69" width="3" height="29" fill="#4a5058"/><path d="M944 90 h22 M948 90 v8 M962 90 v8" stroke="#3a3f46" stroke-width="2"/>';
    if (o.snow) g += '<rect x="901" y="67" width="110" height="2.5" rx="1.2" fill="#fff"/>';
    if (o.night) g += '<rect x="906" y="74" width="100" height="1.2" fill="#FFE7A8"/>';
    if (o.vis === 'weihnachten') for (let x = 908; x < 1006; x += 7) g += `<circle class="tw" cx="${x}" cy="75.5" r="1.5" fill="${['#E5483B', '#F2B33D', '#3FA66B', '#3E8EDE'][(x / 7 | 0) % 4]}" style="animation-delay:-${(x % 7) / 3}s"/>`;
    if (cold) g += icicles(901, 1011, 74);
    if (o.jz === 'sommer' && o.vis !== 'liebe') g += parasol(o, 836, 98);
    g += pool(o, 872, 1040, 102, 113);
    return g;
  };
  // placed between the buttons and the weather corner, so the controls never hide it
  const poolHouse = (o) => `<g transform="translate(888 99) scale(.75) translate(-956 -99)">${houseS(o)}</g>`;

  // ------------------------------------------------------------------------------ the scene
  // o: { season, wx (weather()), hour, lang, intensity ('calm'|'normal'|'lots'), storm (km/h), still (bool) }
  api.sceneKey = (o) => { const s = o.season || {}; const w = o.wx || {}; return [o.hour < 8 || o.hour >= 22, o.top || 0, o.dusk, s.vis, s.jz, s.sub, s.advent, s.snow, s.key, w.kind, Math.round((w.wind || 0) / 10), o.hour >= 21 ? (o.hour >= 22 ? 2 : 1) : 0, o.night, o.intensity, o.still, o.lang, (s.anniversary || {}).years, s.beach, w.temp != null && w.temp < -5, o.narrow, !!o.frost, o.hour >= 23 || o.hour < 6, (s.fun || {}).key, w.temp != null && w.temp > 30, w.temp != null && w.temp >= 20].join('|'); };
  api.scene = (o) => {
    o = { ...o, house: 'pool' }; // there is only the house with pool (the tap stories are drawn for it)
    const s = o.season || { vis: 'alltag', jz: 'sommer' }; const fun = s.fun || null; let vis = fun && fun.scene ? fun.key : (s.vis || 'alltag');
    // summer at home: beach and house take turns in the summer holidays
    if (vis === 'sommer' && s.beach === false) vis = 'alltag'; const jz = s.jz || 'sommer'; const lang = o.lang === 'en' ? 'en' : 'de';
    const w = o.wx || { kind: 'partlycloudy', wind: 8 }; let kind = w.kind || 'partlycloudy';
    if (vis === 'moon') kind = 'clear-night';
    const hour = o.hour; const night = vis === 'moon' ? true : o.night != null ? o.night : (hour < 6 || hour >= 20 || kind === 'clear-night');
    const temp = typeof w.temp === 'number' ? w.temp : null;
    // these motifs take the place of the house
    const noHouse = ['sommer', 'vatertag', 'mobile', 'volcano', 'uk', 'moon', 'titanic', 'dino'].includes(vis); const wild = ['moon', 'titanic', 'dino', 'volcano'].includes(vis);
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
    if (vis === 'silvester' && night) sky = ['#090d24', '#2b1e52'];
    if (vis === 'sommer' && !night && ['sunny', 'partlycloudy', 'windy'].includes(kind)) sky = ['#1e9ef0', '#bfeaff'];
    if (vis === 'moon') sky = ['#000004', '#0d1128'];
    if (vis === 'volcano') sky = night ? ['#1c0a10', '#4f1a16'] : ['#b9654a', '#ffd2a0'];
    if (vis === 'dino' && !night) sky = ['#7cc4e4', '#e6f5d6'];
    // the main motif (house, or the beach / carnival scene) sits in the middle of the header: the landscape is
    // shifted by dx and repeated at the right edge, so nothing is cut; phones show a slice around the same centre
    const hasHouse = vis !== 'sommer';
    const focus = hasHouse ? 888 : vis === 'sommer' ? 760 : 600;
    const frost = !!o.frost;
    const TOP = Math.max(0, Math.min(40, Number(o.top) || 0)); // top of the visible part (garlands hang from there)
    const dx = focus - CX; const sdx = hasHouse ? 0 : -dx; const BX = hasHouse ? CX - 215 : 600; // banners: left of the house, below the navigation
    const vb = o.narrow ? `${CX - 160} 0 320 ${H}` : `0 0 ${W} ${H}`;
    let svg = `<svg viewBox="${vb}" preserveAspectRatio="xMidYMax slice" style="--wa:${wa.toFixed(1)}deg;--wd:${wd.toFixed(1)}s" aria-hidden="true">
      <defs><linearGradient id="fpsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>${frost ? '<filter id="fpfrz" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".42 .2 .08 0 .26  .12 .48 .12 0 .3  .1 .2 .5 0 .36  0 0 0 1 0"/></filter>' : ''}</defs>
      <rect width="${W}" height="${H}" fill="url(#fpsky)"/><g transform="translate(${-dx} 0)"><g id="fpb">${frost ? '<g filter="url(#fpfrz)">' : ''}`;
    // sun, moon, stars
    const lateNight = night && (hour >= 23 || hour < 5) && !['rainy', 'pouring', 'lightning'].includes(kind);
    if (night && (lateNight || !['rainy', 'pouring', 'lightning', 'snowy', 'fog', 'cloudy'].includes(kind))) {
      // now and then a star flares up, and every so often a shooting star crosses the sky
      for (let i = 0; i < 4; i++) { const x = 120 + r() * 960; const y = TOP + 8 + r() * 34; const k = (n) => n.toFixed(1);
        svg += `<g class="flare" style="transform-origin:${k(x)}px ${k(y)}px;animation-delay:-${k(r() * 11)}s;animation-duration:${k(9 + r() * 6)}s"><path d="M${k(x)} ${k(y - 6)} L${k(x + 1.2)} ${k(y - 1.2)} L${k(x + 6)} ${k(y)} L${k(x + 1.2)} ${k(y + 1.2)} L${k(x)} ${k(y + 6)} L${k(x - 1.2)} ${k(y + 1.2)} L${k(x - 6)} ${k(y)} L${k(x - 1.2)} ${k(y - 1.2)}Z" fill="#fff"/><circle cx="${k(x)}" cy="${k(y)}" r="1.4" fill="#fff"/></g>`; }
      svg += `<g transform="translate(${(260 + r() * 420).toFixed(0)} ${TOP + 6})"><g class="shoot" style="animation-delay:-${(r() * 18).toFixed(1)}s"><line x1="0" y1="0" x2="-34" y2="-12" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/><line x1="-8" y1="-3" x2="-60" y2="-21" stroke="#cfe0ff" stroke-width="1" stroke-linecap="round" opacity=".45"/></g></g>`;
    }
    if (night) {
      svg += fall(Math.round((lateNight ? 60 : 26) * mul), r, (x, k) => `<circle class="tw" cx="${x.toFixed(0)}" cy="${(k * 60).toFixed(0)}" r="${(0.6 + r()).toFixed(1)}" fill="#fff" style="animation-delay:-${(r() * 3).toFixed(1)}s"/>`);
      if (vis === 'moon') svg += '<circle cx="610" cy="28" r="22" fill="#6fb6ff" opacity=".18"/><circle cx="610" cy="28" r="14" fill="#2f6fd0"/><path d="M600 20 q6 -4 10 2 q-2 6 -8 5 q-4 -2 -2 -7z M612 30 q6 -2 8 4 q-4 6 -10 3z M603 34 q3 -1 4 2 q-2 2 -4 0z" fill="#4fae5a"/><path d="M598 26 q8 -3 16 0 M606 37 q6 1 10 -2" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/><path d="M610 14 a14 14 0 0 1 0 28 a9 14 0 0 0 0 -28z" fill="#00010a" opacity=".45"/>';
      else if (!['rainy', 'pouring', 'lightning', 'snowy', 'fog', 'cloudy'].includes(kind) || vis === 'silvester') svg += '<circle cx="640" cy="26" r="13" fill="#f6f1d5"/><circle cx="646" cy="22" r="12" fill="#22365e" opacity=".9"/>';
    } else if (glowSun) svg += `<circle cx="600" cy="88" r="40" fill="#FFB25C" opacity=".35"/><circle cx="600" cy="88" r="20" fill="#FF8A3C"/>`;
    else if (['sunny', 'partlycloudy', 'windy'].includes(kind)) svg += '<circle class="sun" cx="610" cy="28" r="17" fill="#FFE27A"/><circle cx="610" cy="28" r="30" fill="#FFE27A" opacity=".25"/>';
    if (kind === 'partlycloudy' && !night && !glowSun) [['#ff5a5a', 52], ['#ffb23d', 47], ['#ffe94d', 42], ['#55d16b', 37], ['#4aa8ff', 32], ['#8f6bff', 27]].forEach(([c, rr]) => { svg += `<path d="M${470 - rr * 2} 100 A ${rr * 2} ${rr * 1.7} 0 0 1 ${470 + rr * 2} 100" stroke="${c}" stroke-width="5" fill="none" opacity=".45"/>`; });
    // mountains (sport holidays) / sea (summer) in the background
    if (vis === 'sport' || (jz === 'winter' && vis === 'winter')) {
      svg += `<path d="M0 92 L120 40 L210 78 L330 26 L460 84 L560 48 L700 90 L820 34 L960 86 L1080 44 L1200 92 V120 H0Z" fill="${night ? '#33415c' : '#6f86a3'}"/>`;
      [[120, 40], [330, 26], [560, 48], [820, 34], [1080, 44]].forEach(([x, y]) => { svg += `<path d="M${x - 22} ${y + 12} L${x} ${y} L${x + 22} ${y + 12} L${x + 12} ${y + 9} L${x + 5} ${y + 14} L${x - 4} ${y + 9} L${x - 12} ${y + 13}Z" fill="#f4f8fc"/>`; });
      // summit cross on the high peak
      svg += '<path d="M330 26 V14 M325.5 18 H334.5" stroke="#5a3b22" stroke-width="1.6" stroke-linecap="round"/>';
      if (vis === 'sport') {
        // ski runs on the cable-car mountain (right slope), a red and a blue run, with little poles
        svg += '<path d="M1086 48 C 1104 56 1092 64 1112 70 S 1128 82 1146 90" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".95"/><path d="M1086 48 C 1104 56 1092 64 1112 70 S 1128 82 1146 90" stroke="#e8eef6" stroke-width="2" fill="none" stroke-dasharray="1 5"/>'
          + '<path d="M1092 50 C 1120 58 1136 64 1150 74 S 1166 86 1182 92" stroke="#ffffff" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
          + [[1100, 56, '#E5483B'], [1114, 72, '#E5483B'], [1132, 84, '#E5483B'], [1140, 66, '#3E8EDE'], [1166, 84, '#3E8EDE']].map(([x, y, c]) => `<path d="M${x} ${y} v-4" stroke="${c}" stroke-width="1.2"/>`).join('');
      }
    }
    // clouds
    const cN = { sunny: 1, 'clear-night': 0, partlycloudy: 3, cloudy: 6, rainy: 6, pouring: 7, lightning: 7, snowy: 5, fog: 2, windy: 4 }[kind]; const cN2 = vis === 'moon' ? 0 : cN == null ? 2 : cN;
    const cCol = ['rainy', 'pouring', 'lightning'].includes(kind) ? '#6b7682' : night ? '#3c4b68' : '#ffffff';
    for (let i = 0; i < cN2; i++) svg += cloud(4 + r() * 34, 70 + r() * 90, cCol, (0.55 + r() * 0.4).toFixed(2), (cloudDur * (0.8 + r() * 0.5)).toFixed(0), (r() * cloudDur).toFixed(0));
    // ground
    const snowGround = !wild ? (xmasSnow || kind === 'snowy' || vis === 'sport' || (vis === 'winter' && jz === 'winter' && (o.wx || {}).temp != null && o.wx.temp <= 0)) : false;
    const gCol = vis === 'dino' ? '#4f9a3a' : vis === 'volcano' ? '#4a423c' : snowGround ? '#eef4fa' : ({ fruehling: '#8fcb6a', sommer: '#6fbf4f', herbst: '#b98a45', winter: '#7d8f6a' })[jz];
    if (vis === 'moon') {
      // grey moon ground with craters, a far ridge
      svg += `<path d="M0 90 C 140 78 300 88 460 80 C 620 72 820 88 1000 80 C 1100 76 1160 86 1200 90 V120 H0Z" fill="#5f646c"/><path d="M0 98 C 200 92 400 102 600 96 C 800 90 1000 102 1200 98 V120 H0Z" fill="#a3a8b0"/>`;
      for (let i = 0; i < 16; i++) { const cx = (i * 83 + r() * 50) % W; const cy = 104 + r() * 12; const rx = 6 + r() * 16;
        svg += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.28).toFixed(1)}" fill="#7f848c"/><path d="M${(cx - rx).toFixed(0)} ${cy.toFixed(1)} a${rx.toFixed(1)} ${(rx * 0.28).toFixed(1)} 0 0 0 ${(rx * 2).toFixed(1)} 0" stroke="#c4c8ce" stroke-width="1" fill="none"/>`; }
    } else if (vis === 'titanic') {
      // open sea up to the horizon
      svg += `<rect y="78" width="${W}" height="42" fill="#1f73ad"/><rect y="78" width="${W}" height="6" fill="#4aa3d8"/><g class="wbob">${fall(40, r, (x, k) => `<path d="M${(x | 0) % 1200} ${(88 + (k * 30) % 30).toFixed(0)} q8 -4 16 0" stroke="#bfe8ff" stroke-width="1.6" fill="none" opacity=".8"/>`)}</g>`;
    } else if (vis === 'sommer') {
      svg += `<rect y="84" width="${W}" height="20" fill="#2aa7df"/><g class="wave">${fall(26, r, (x, k) => `<path d="M${(k * 0 + (x | 0) % 1200)} 88 q8 -4 16 0" stroke="#bff0ff" stroke-width="2" fill="none"/>`)}</g>`;
      svg += `<path d="M0 100 C 200 92 400 104 600 98 C 800 92 1000 104 1200 100 V120 H0Z" fill="#f2d48f"/>`;
    } else {
      svg += `<path d="M0 98 C 160 90 340 104 520 96 C 700 89 900 104 1200 98 V120 H0Z" fill="${gCol}"/>`;
      // grass tufts everywhere and a few round stones (spring / summer green, autumn straw, winter only stones)
      const gr = vis === 'dino' ? ['#2f7f2f', '#5fae46'] : vis === 'volcano' ? ['#5f7f3a', '#7a9a4a'] : snowGround ? null : ({ fruehling: ['#5fae46', '#7cc35c'], sommer: ['#4c9a36', '#6cb84a'], herbst: ['#a88a3e', '#c2a252'], winter: ['#7c8a5a', '#93a06a'] })[jz];
      if (gr) for (let i = 0; i < 46; i++) { const x = (i * 26 + r() * 18) % W; const y = 104 + r() * 12; const c = gr[i % 2];
        svg += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q-3 -7 -5 -9 M${(x + 2).toFixed(0)} ${y.toFixed(0)} q0 -8 1 -11 M${(x + 4).toFixed(0)} ${y.toFixed(0)} q3 -6 6 -8" stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`; }
      [[330, 110, 1], [345, 112, 0.7], [700, 112, 0.9], [1175, 109, 1.1], [1190, 112, 0.7], [520, 114, 0.8]].forEach(([x, y, k]) => {
        svg += `<ellipse cx="${x}" cy="${y}" rx="${(8 * k).toFixed(1)}" ry="${(5 * k).toFixed(1)}" fill="${night ? '#59606b' : '#9aa1ab'}"/><ellipse cx="${x - 2 * k}" cy="${y - 2 * k}" rx="${(4 * k).toFixed(1)}" ry="${(2 * k).toFixed(1)}" fill="${night ? '#6d7480' : '#c3c8cf'}"/>`
          + (snowGround ? `<ellipse cx="${x}" cy="${y - 4 * k}" rx="${(7 * k).toFixed(1)}" ry="${(2.4 * k).toFixed(1)}" fill="#fff"/>` : ''); });
    }
    if (night && vis !== 'moon') svg += vis === 'sommer' || vis === 'titanic' ? `<rect y="78" width="${W}" height="42" fill="#0b1430" opacity=".45"/>`
      : `<path d="M0 98 C 160 90 340 104 520 96 C 700 89 900 104 1200 98 V120 H0Z" fill="#0b1430" opacity="${snowGround ? '.35' : '.5'}"/>`;
    if (vis === 'sport') {
      const vx = 992; const vy = 92; const mx = 1036; const my = 50; const tx = 1080; const ty = 38;
      svg += `<path d="M${vx} ${vy} L${mx} ${my} L${tx} ${ty}" stroke="#2b2b2b" stroke-width=".9" fill="none"/>`
        + `<path d="M${mx} 61 V${my - 2} M${mx - 5} ${my} H${mx + 5}" stroke="#5b6470" stroke-width="2"/><path d="M${mx - 2.5} 61 l2.5 -6 l2.5 6" stroke="#5b6470" stroke-width="1" fill="none"/>`
        + `<rect x="${vx - 9}" y="${vy}" width="18" height="10" fill="#c9a77a"/><path d="M${vx - 11} ${vy} h22 l-3 -5 h-16z" fill="#7a4a2a"/><rect x="${vx - 4}" y="${vy + 3}" width="8" height="5" fill="#bfe0ff"/>`
        + `<rect x="${tx - 8}" y="${ty}" width="16" height="9" fill="#c9a77a"/><path d="M${tx - 10} ${ty} h20 l-3 -4 h-14z" fill="#7a4a2a"/><rect x="${tx - 3}" y="${ty + 3}" width="6" height="4" fill="#bfe0ff"/>`
        + `<g class="cable2" style="--mx:${mx - vx}px;--my:${my - vy}px;--cx:${tx - vx}px;--cy:${ty - vy}px"><g transform="translate(${vx} ${vy - 1})"><path d="M0 0 v4" stroke="#2b2b2b" stroke-width="1"/><rect x="-5" y="4" width="10" height="8" rx="2" fill="#E5483B"/><rect x="-3.6" y="5.4" width="7.2" height="3.4" rx="1" fill="#bfe8ff"/></g></g>`;
    }
    // everyday house and trees (a little different every season)
    const lit = vis === 'weihnachten' || night;
    const smokeOn = ['herbst', 'winter'].includes(jz) || vis === 'weihnachten';
    const own = !noHouse;
    if (own) {
      svg += poolHouse({ night, snow: snowGround, smoke: smokeOn, wind, jz, vis, temp: w.temp, hour });
      const gz = vis === 'ostern' || vis === 'fruehling' ? 'fruehling' : vis === 'herbst' ? 'herbst' : ['weihnachten', 'sport', 'silvester', 'dreikoenig'].includes(vis) ? 'winter' : jz;
      svg += redMaple(1112, 103, 0.95, gz, snowGround) + (vis === 'sport' ? '' : appleTree(1042, 104, 1.25, gz, snowGround, r)) + flowerBed(978, 106, gz, snowGround, r);
    }
    const hot = temp != null && temp > 30 && !night && !wild && jz !== 'winter' && !['weihnachten', 'sport'].includes(vis);
    if (hot) {
      // sprinkler on the lawn left of the house, swinging its fan of water
      // five sprinklers across the lawn, each swinging its fan of water at its own pace
      (own ? [180, 330, 470, 610, 1150] : [180, 330, 470, 640, 1150]).forEach((sx, k) => {
        svg += `<ellipse cx="${sx}" cy="110" rx="30" ry="4.4" fill="#3f8a2e" opacity=".45"/><rect x="${sx - 2.6}" y="104.6" width="5.2" height="5.4" rx="1" fill="${['#3E8EDE', '#F5C542', '#E5483B', '#3FA66B', '#B07CFF'][k]}"/>`
          + `<g class="sprk" style="transform-origin:${sx}px 105px;animation-duration:${(3.2 + k * 0.6).toFixed(1)}s;animation-delay:-${(k * 1.1).toFixed(1)}s">${[-26, -13, 0, 13, 26].map((a) => `<path d="M${sx} 105 q${a} -24 ${a * 2} -2" stroke="#cdeeff" stroke-width="1.1" fill="none" stroke-dasharray="2 3" class="drip"/>`).join('')}</g>`; });
      svg += `<path d="M150 112 q60 -4 180 0 t280 -2" stroke="#2f9a46" stroke-width="1.6" fill="none" opacity=".7"/>`;
      if (own && hour >= 8 && hour < 22) {
        // pool party: flamingo and donut floats, swimmers splashing, a beach ball and music
        svg += `<g class="bob" style="animation-duration:3s"><ellipse cx="846" cy="105" rx="9" ry="3.4" fill="#FF7AB6"/><ellipse cx="846" cy="105" rx="4.4" ry="1.4" fill="#4fd0e0"/><path d="M852 104 q4 -8 0 -12 q-3 -3 1 -6" stroke="#FF7AB6" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M853 86 l4 1.4 -3 1z" fill="#2b2b2b"/></g>`
          + `<g class="bob" style="animation-duration:3.6s;animation-delay:-1s"><ellipse cx="905" cy="105" rx="8.4" ry="3.2" fill="#F5C542"/><ellipse cx="905" cy="104.6" rx="7.4" ry="2.6" fill="#FF8FB3"/><ellipse cx="905" cy="105" rx="3.6" ry="1.2" fill="#4fd0e0"/>${[-5, -2, 2, 5].map((d, i) => `<path d="M${905 + d} ${104 - (i % 2)} h1.6" stroke="${['#fff', '#3E8EDE', '#7CFF8A', '#FFD84D'][i]}" stroke-width=".8"/>`).join('')}</g>`
          + [[876, '#8B5A2B', '#F3CDA6'], [932, '#F5C542', '#C99167']].map(([x, h, sk], i) => `<g class="bob" style="animation-duration:${2.2 + i * 0.5}s"><circle cx="${x}" cy="104" r="3.4" fill="${sk}"/><path d="M${x - 3.4} 103 q3.4 -5 6.8 0z" fill="${h}"/><path d="M${x - 4} 105 l-4 -5 M${x + 4} 105 l4 -5" stroke="${sk}" stroke-width="1.4" stroke-linecap="round" class="wave2" style="transform-origin:${x}px 105px"/></g><circle class="tw" cx="${x - 7}" cy="101" r="1" fill="#fff"/><circle class="tw" cx="${x + 7}" cy="100" r="1.2" fill="#fff" style="animation-delay:-.6s"/>`).join('')
          + `<g class="tossx"><g class="tossy"><circle cx="880" cy="99" r="3.4" fill="#fff"/><path d="M876.6 99 a3.4 3.4 0 0 1 6.8 0z" fill="#E5483B"/><path d="M880 95.6 v6.8" stroke="#3E8EDE" stroke-width="1.4"/></g></g>`
          + `<rect x="958" y="99" width="7" height="9" rx="1.4" fill="#2b2f36"/><circle cx="961.5" cy="103.5" r="2" fill="#555"/>${[0, 1, 2].map((i) => `<text class="note" x="${962 + i * 4}" y="98" font-size="7" fill="#FF7AB6" style="animation-delay:-${i * 0.8}s">♪</text>`).join('')}`;
      }
    }
    if (vis === 'weihnachten' || vis === 'winter' || vis === 'sport') {
      (own ? [[150, 102, 1], [250, 104, 0.8], [720, 104, 0.85]] : [[150, 102, 1], [250, 104, 0.8], [1060, 102, 0.95], [1150, 104, 0.75]]).forEach(([x, y, sc]) => { svg += fir(x, y, sc, snowGround, false, r); });
    } else if (vis !== 'sommer' && !wild) {
      (own ? [[150, 100, 1], [260, 102, 0.8], [720, 102, 0.85]] : [[150, 100, 1], [260, 102, 0.8], [1060, 100, 0.95], [1150, 102, 0.8]]).forEach(([x, y, sc]) => { svg += leafTree(x, y, sc, vis === 'fruehling' || vis === 'ostern' ? 'fruehling' : vis === 'herbst' ? 'herbst' : jz, r, true); });
    }
    if (frost) {
      // everything frozen: hoarfrost on the ground, frozen puddles and glittering ice crystals
      svg += `<path d="M0 99 C 160 92 340 105 520 97 C 700 90 900 105 1200 99 V120 H0Z" fill="#e8f2fb" opacity=".55"/>`;
      for (let i = 0; i < 5; i++) { const px = 60 + i * 250 + r() * 60; svg += `<ellipse cx="${px.toFixed(0)}" cy="${(110 + r() * 6).toFixed(1)}" rx="${(16 + r() * 12).toFixed(0)}" ry="3" fill="#bfe3f7" stroke="#ffffff" stroke-width=".6" opacity=".9"/><path d="M${(px - 8).toFixed(0)} 111 l6 -1.4 M${(px + 2).toFixed(0)} 112 l7 -2" stroke="#fff" stroke-width=".6" opacity=".9"/>`; }
      svg += '</g>';
    }
    svg += `</g><use href="#fpb" x="${W}"/><use href="#fpb" x="${-W}"/></g><g transform="translate(${sdx} 0)"><g id="fps">`;
    if (frost) for (let i = 0; i < 46; i++) { const fx = r() * W; const fy = TOP + 6 + r() * (110 - TOP); const k = 1 + r() * 1.6;
      svg += `<g class="flare" style="transform-origin:${fx.toFixed(0)}px ${fy.toFixed(0)}px;animation-delay:-${(r() * 3).toFixed(2)}s;animation-duration:${(1.6 + r() * 2).toFixed(1)}s"><path d="M${(fx - k * 2).toFixed(1)} ${fy.toFixed(1)} h${(k * 4).toFixed(1)} M${fx.toFixed(1)} ${(fy - k * 2).toFixed(1)} v${(k * 4).toFixed(1)} M${(fx - k * 1.4).toFixed(1)} ${(fy - k * 1.4).toFixed(1)} l${(k * 2.8).toFixed(1)} ${(k * 2.8).toFixed(1)} M${(fx + k * 1.4).toFixed(1)} ${(fy - k * 1.4).toFixed(1)} l${(-k * 2.8).toFixed(1)} ${(k * 2.8).toFixed(1)}" stroke="${i % 3 ? '#ffffff' : '#bfe8ff'}" stroke-width=".6" stroke-linecap="round"/></g>`; }
    // ---- season layer (items that belong to the house move with it: - dx)
    const P = [];
    if (vis === 'weihnachten') {
      if (s.sub === 'heiligabend') svg += `<g class="peek3" style="animation-delay:-4s"><g transform="translate(${760 - dx} 0)"><path d="M-6 104 l2 -20 h8 l2 20z" fill="#fff"/><path d="M-6 88 q-10 -6 -12 4 q6 -2 12 2z M6 88 q10 -6 12 4 q-6 -2 -12 2z" fill="#eef4ff" opacity=".9"/><circle cx="0" cy="79" r="5" fill="#FBE3CF"/><path d="M-5.4 79 q0 -8 5.4 -8 q5.4 0 5.4 8 q-1 -4 -5.4 -4 q-4.4 0 -5.4 4z" fill="#EBC55A"/><ellipse cx="0" cy="70" rx="6" ry="1.6" fill="none" stroke="#FFD24A" stroke-width="1.2"/><circle cx="-1.8" cy="79.6" r=".7" fill="#2b2b2b"/><circle cx="1.8" cy="79.6" r=".7" fill="#2b2b2b"/><path d="M-1.6 82 q1.6 1.4 3.2 0" stroke="#c2546a" stroke-width=".8" fill="none"/></g></g>`;
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
      if (s.sub === 'samichlaus') {
        const sx = CX - 300;
        // Samichlaus: red bishop's robe, white beard, mitre with a golden cross, crozier
        svg += `<g class="bob" style="animation-duration:4s"><path d="M${sx - 13} 108 l4 -30 h18 l4 30z" fill="#c8302e"/><path d="M${sx - 4} 78 v30 M${sx + 4} 78 v30" stroke="#F5C542" stroke-width="1.6"/><circle cx="${sx}" cy="72" r="6.5" fill="#F3CDA6"/><path d="M${sx - 7} 72 q7 14 14 0 q-2 6 -7 9 q-5 -3 -7 -9z" fill="#fff"/><path d="M${sx - 6} 67 l6 -12 l6 12z" fill="#c8302e" stroke="#F5C542" stroke-width="1"/><path d="M${sx} 57 v7 M${sx - 2.4} 60 h4.8" stroke="#F5C542" stroke-width="1.2"/><circle cx="${sx - 2.3}" cy="71" r=".8" fill="#2b2b2b"/><circle cx="${sx + 2.3}" cy="71" r=".8" fill="#2b2b2b"/><path d="M${sx + 15} 108 V62 q0 -6 5 -6 q5 0 5 5 q0 4 -4 4" stroke="#d9b14a" stroke-width="2" fill="none"/></g>`;
        // donkey with two sacks, nodding
        const dx2 = sx + 55;
        svg += `<g><path d="M${dx2 - 16} 108 v-10 M${dx2 - 8} 108 v-10 M${dx2 + 8} 108 v-10 M${dx2 + 15} 108 v-10" stroke="#7d7f86" stroke-width="3"/><ellipse cx="${dx2}" cy="92" rx="20" ry="9" fill="#9a9ca3"/><path d="M${dx2 - 20} 92 q-6 2 -6 9" stroke="#7d7f86" stroke-width="2" fill="none"/><path d="M${dx2 - 9} 84 q-4 8 0 12 h8 q4 -4 0 -12z" fill="#b8915a"/><path d="M${dx2 + 2} 84 q-3 8 0 12 h8 q3 -4 0 -12z" fill="#a37c48"/>`
          + `<g class="nod" style="transform-origin:${dx2 + 16}px 88px"><path d="M${dx2 + 14} 90 l8 -12 q6 -4 9 2 l-3 8 q-4 4 -9 3z" fill="#9a9ca3"/><ellipse cx="${dx2 + 30}" cy="82" rx="4" ry="3" fill="#c9cbd1"/><path d="M${dx2 + 22} 78 l-2 -10 l3 1 l2 8z M${dx2 + 25} 77 l1 -10 l3 2 l-1 8z" fill="#7d7f86"/><circle cx="${dx2 + 26}" cy="80" r=".9" fill="#2b2b2b"/></g></g>`;
        // Schmutzli: dark hooded robe, black beard, big grin, bundle of twigs – and he waves
        const mx = sx + 115;
        svg += `<g class="bob" style="animation-duration:2.2s;animation-delay:-.7s"><path d="M${mx - 12} 108 l3 -30 h18 l3 30z" fill="#4a3424"/><path d="M${mx - 10} 70 q10 -16 20 0 v8 h-20z" fill="#3a281b"/><circle cx="${mx}" cy="73" r="5.6" fill="#E3B48A"/><path d="M${mx - 6} 74 q6 12 12 0 q-2 7 -6 9 q-4 -2 -6 -9z" fill="#1d1d1d"/><path d="M${mx - 3} 75.5 q3 2.6 6 0" stroke="#fff" stroke-width="1.2" fill="none"/><circle cx="${mx - 2.2}" cy="71.6" r=".9" fill="#1d1d1d"/><circle cx="${mx + 2.2}" cy="71.6" r=".9" fill="#1d1d1d"/><circle cx="${mx - 3.4}" cy="74" r="1" fill="#e98a7a" opacity=".7"/><circle cx="${mx + 3.4}" cy="74" r="1" fill="#e98a7a" opacity=".7"/>`
          + `<g class="wave2" style="transform-origin:${mx + 9}px 84px"><path d="M${mx + 9} 84 l9 -8" stroke="#4a3424" stroke-width="3" stroke-linecap="round"/><path d="M${mx + 17} 77 l6 -14 M${mx + 18} 77 l9 -12 M${mx + 16} 77 l3 -15" stroke="#7a5233" stroke-width="1.2"/></g></g>`;
        svg += emo(sx + 90, 108, '🍊', 10) + emo(sx + 100, 108, '🥜', 10) + emo(sx + 30, 108, '🍫', 10);
      }
      if (s.sub === 'heiligabend') {
        // glitter everywhere on the ground, presents all around
        // glitter in a few patches, each sparkling strongly
        const spots = [[CX - 360, 112], [CX - 230, 110], [CX - 90, 114], [CX + 150, 112], [CX + 270, 110], [CX + 420, 114], [90, 112], [CX - 520, 110]];
        svg += spots.map(([sx, sy]) => `<ellipse cx="${sx}" cy="${sy}" rx="22" ry="5" fill="#fff6d6" opacity=".55"/>`).join('');
        for (let i = 0; i < 96; i++) { const [sx, sy] = spots[i % spots.length]; const gx = sx + (r() - 0.5) * 44; const gy = sy + (r() - 0.5) * 9; const k = 2.4 + r() * 3; const c = ['#ffffff', '#FFE27A', '#ffffff', '#cfe8ff'][i % 4];
          svg += `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${(k * 0.9).toFixed(1)}" fill="#fff" opacity=".35" class="tw" style="animation-duration:.9s;animation-delay:-${(r() * 0.9).toFixed(2)}s"/>`;
          svg += `<g class="flare" style="transform-origin:${gx.toFixed(0)}px ${gy.toFixed(1)}px;animation-delay:-${(r() * 3).toFixed(2)}s;animation-duration:${(1.4 + r() * 1.6).toFixed(1)}s"><path d="M${gx.toFixed(1)} ${(gy - k).toFixed(1)} L${(gx + k * 0.25).toFixed(1)} ${(gy - k * 0.25).toFixed(1)} L${(gx + k).toFixed(1)} ${gy.toFixed(1)} L${(gx + k * 0.25).toFixed(1)} ${(gy + k * 0.25).toFixed(1)} L${gx.toFixed(1)} ${(gy + k).toFixed(1)} L${(gx - k * 0.25).toFixed(1)} ${(gy + k * 0.25).toFixed(1)} L${(gx - k).toFixed(1)} ${gy.toFixed(1)} L${(gx - k * 0.25).toFixed(1)} ${(gy - k * 0.25).toFixed(1)}Z" fill="${c}"/></g>`; }
        const gift = (x, k, c1, c2) => `<g transform="translate(${x} 108) scale(${k})"><rect x="-8" y="-12" width="16" height="12" fill="${c1}"/><rect x="-9" y="-15" width="18" height="4" fill="${c1}" opacity=".85"/><path d="M0 -15 v15 M-9 -13 h18" stroke="${c2}" stroke-width="2.2"/><path d="M0 -15 q-6 -6 -6 -1 q0 2 6 1 q6 1 6 -1 q0 -5 -6 1z" fill="${c2}"/></g>`;
        [[CX - 320, 1, '#E5483B', '#FFD24A'], [CX - 296, 0.75, '#3E8EDE', '#fff'], [CX - 270, 1.1, '#3FA66B', '#E5483B'], [CX - 175, 0.8, '#B07CFF', '#FFD24A'], [CX - 152, 0.65, '#FFD24A', '#E5483B'],
          [CX + 112, 0.8, '#E5483B', '#fff'], [CX + 205, 0.9, '#FF7AB6', '#fff'], [CX + 228, 0.7, '#3E8EDE', '#FFD24A'], [CX + 300, 1, '#3FA66B', '#FFD24A'], [CX + 340, 0.8, '#E5483B', '#3FA66B'], [80, 0.9, '#B07CFF', '#fff'], [CX - 420, 0.8, '#FFD24A', '#3E8EDE']]
          .forEach(([x, k, a, b]) => { svg += gift(x, k, a, b); });
        svg += '<path class="sun" d="M560 22 l4 9 10 1 -7.5 7 2 10 -8.5 -5 -8.5 5 2 -10 -7.5 -7 10 -1z" fill="#FFD24A"/>';
      }
      if (xmasSnow && kind !== 'snowy') kind = 'snowy-x';
    }
    if ((vis === 'silvester' && night) || (vis === 'august' && hour >= 22)) {
      // a whole sky of fireworks; New Year's Eve in glittering silver and gold with the coming year in it
      const silv = vis === 'silvester';
      const cols = silv ? ['#FFD24A', '#fff3c4', '#f5f5f5', '#cfd8e3', '#FFC83D', '#e8eef6'] : ['#DA291C', '#ffffff', '#FFD24A'];
      const n = Math.round((silv ? 20 : 10) * mul);
      for (let i = 0; i < n; i++) {
        const side = r() < 0.5; const x = side ? 40 + r() * (CX - 170) : CX + 130 + r() * (W - CX - 170); const y = TOP + 10 + r() * 26; const d = (r() * 2.6).toFixed(2); const c = cols[i % cols.length];
        svg += `<line class="rocket" x1="${x.toFixed(0)}" y1="${(y + 8).toFixed(0)}" x2="${x.toFixed(0)}" y2="${(y + 18).toFixed(0)}" stroke="${c}" stroke-width="1.6" stroke-linecap="round" style="animation-delay:-${d}s"/>`;
        svg += burstRays(x, y, c, d);
        if (silv) for (let k = 0; k < 7; k++) svg += `<circle class="tw" cx="${(x + (r() - 0.5) * 44).toFixed(0)}" cy="${(y + (r() - 0.3) * 36).toFixed(0)}" r="${(0.8 + r() * 0.8).toFixed(1)}" fill="${k % 2 ? '#fff' : '#FFD24A'}" style="animation-delay:-${(r() * 1.8).toFixed(2)}s;animation-duration:.7s"/>`;
      }
      if (silv) {
        const yr = nextYear(new Date());
        [[CX - 300, TOP + 30, 0], [CX + 300, TOP + 26, 3.5]].forEach(([x, y, dl]) => {
          svg += burstRays(x, y - 4, '#FFD24A', String(dl)) + `<g class="yr" style="transform-origin:${x}px ${y}px;animation-delay:-${dl}s"><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="19" font-weight="800" font-family="system-ui,sans-serif" fill="#FFE27A" stroke="#b8860b" stroke-width=".6" letter-spacing="1">${yr}</text></g>`; });
      }
    }
    if (vis === 'silvester' && !night) {
      // the morning after: the chimney sweep brings luck from the roof, a lucky pig, clover and a toadstool, the night's rockets and streamers on the ground
      const sweep = (x, y) => `<g class="bob" style="animation-duration:3.2s"><g transform="translate(${x} ${y}) scale(.9)"><path d="M-3 0 l-1 -9 M3 0 l1 -9" stroke="#1d1d1d" stroke-width="2.4" stroke-linecap="round"/><rect x="-4.5" y="-20" width="9" height="12" rx="2" fill="#1d1d1d"/><path d="M-2 -20 v12 M2 -20 v12" stroke="#d9d9d9" stroke-width=".5"/>`
        + `<circle cx="0" cy="-24" r="4.2" fill="#F3CDA6"/><circle cx="-1.4" cy="-24.4" r=".55" fill="#2b2b2b"/><circle cx="1.4" cy="-24.4" r=".55" fill="#2b2b2b"/><path d="M-1.4 -22.2 q1.4 1 2.8 0" stroke="#7a3b22" stroke-width=".6" fill="none"/><circle cx="2.4" cy="-23" r="1" fill="#2b2b2b" opacity=".35"/>`
        + `<rect x="-3.6" y="-35" width="7.2" height="8" fill="#1d1d1d"/><rect x="-5.6" y="-27.6" width="11.2" height="1.4" fill="#1d1d1d"/><g class="wave2" style="transform-origin:4px -18px"><path d="M4 -18 l7 -10" stroke="#1d1d1d" stroke-width="2.2" stroke-linecap="round"/><path d="M11 -28 v-8" stroke="#7a5233" stroke-width="1"/><circle cx="11" cy="-37" r="3.2" fill="#2b2b2b"/></g>`
        + `<path d="M-4 -18 l-7 7" stroke="#1d1d1d" stroke-width="2.2" stroke-linecap="round"/><path d="M-16 -4 l8 -16 M-12 -2 l8 -16 M-15 -7 h4 M-13 -11 h4 M-11 -15 h4" stroke="#a87a4a" stroke-width="1"/></g></g>`;
      svg += own ? sweep(CX + 36, 52) : sweep(CX - 120, 106);
      const pig = (x) => `<g class="bob" style="animation-duration:2.6s"><ellipse cx="${x}" cy="102" rx="10" ry="7" fill="#FFB3C7"/><circle cx="${x + 9}" cy="99" r="5.4" fill="#FFB3C7"/><ellipse cx="${x + 13}" cy="100" rx="2.4" ry="2" fill="#FF8FB0"/><circle cx="${x + 12.4}" cy="100" r=".45" fill="#b0566f"/><circle cx="${x + 13.8}" cy="100" r=".45" fill="#b0566f"/><circle cx="${x + 9}" cy="97" r=".7" fill="#2b2b2b"/><path d="M${x + 6} 94 l1 -3 2 2z M${x + 10} 94 l2 -3 1 3z" fill="#FF8FB0"/><path d="M${x - 10} 100 q-4 -3 -1 -5 q2 2 -1 3" stroke="#FF8FB0" stroke-width="1" fill="none"/><path d="M${x - 5} 108 v3 M${x - 1} 108 v3 M${x + 4} 108 v3 M${x + 7} 108 v3" stroke="#FF9DB8" stroke-width="2" stroke-linecap="round"/><path d="M${x - 2} 98 h4" stroke="#F5C542" stroke-width="1.6"/><circle cx="${x}" cy="98" r="1.6" fill="#F5C542"/></g>`;
      const clover = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 0 q1 6 -1 9" stroke="#2f8a3a" stroke-width="1" fill="none"/>${[0, 90, 180, 270].map((a) => `<path d="M0 0 c-4 -2 -5 -7 -1 -7 c1 0 1 1 1 2 c0 -1 0 -2 1 -2 c4 0 3 5 -1 7z" fill="#3FA65A" transform="rotate(${a + 45})"/>`).join('')}</g>`;
      const shroom = (x) => `<rect x="${x - 2}" y="98" width="4" height="9" rx="1.5" fill="#f4efe4"/><path d="M${x - 9} 99 q9 -13 18 0z" fill="#E5483B"/><circle cx="${x - 4}" cy="95" r="1.2" fill="#fff"/><circle cx="${x + 2}" cy="93" r="1.4" fill="#fff"/><circle cx="${x + 5}" cy="97" r="1" fill="#fff"/>`;
      svg += pig(CX - 300) + clover(CX - 262, 100, 1.1) + clover(CX - 230, 104, 0.8) + shroom(CX - 205) + clover(CX + 190, 103, 0.9) + shroom(CX + 230) + clover(CX - 380, 104, 0.8);
      for (let i = 0; i < 6; i++) { const x = 60 + r() * (W - 120); svg += `<path d="M${x.toFixed(0)} 112 l${(r() * 18 - 9).toFixed(0)} -3" stroke="#7a5233" stroke-width="1"/><rect x="${(x - 1.4).toFixed(0)}" y="108" width="2.8" height="5" fill="${['#E5483B', '#3E8EDE', '#F5C542'][i % 3]}" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${x.toFixed(0)} 112)"/>`; }
      for (let i = 0; i < 14; i++) { const x = r() * W; const y = 104 + r() * 12; svg += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q3 -3 6 0 t6 0" stroke="${['#FFD24A', '#cfd8e3', '#FF7AB6', '#5CE1E6'][i % 4]}" stroke-width="1" fill="none"/>`; }
    }
    if (vis === 'dreikoenig') {
      svg += `<g class="flare" style="transform-origin:${CX}px ${TOP + 22}px;animation-duration:6s"><path d="M${CX} ${TOP + 14} l2.4 6 6.4.6 -4.8 4.2 1.4 6.2 -5.4 -3.2 -5.4 3.2 1.4 -6.2 -4.8 -4.2 6.4 -.6z" fill="#FFD24A"/></g>`;
      const king = (x, robe, cape, skin, beard, gift, dl) => `<g class="bob" style="animation-delay:-${dl}s;animation-duration:3.6s"><g transform="translate(${x} 0) scale(.74 1) translate(${-x} 0)"><path d="M${x - 13} 108 l4 -30 h18 l4 30z" fill="${robe}"/><path d="M${x - 12} 80 q-4 14 -2 28 h4 l3 -28z M${x + 12} 80 q4 14 2 28 h-4 l-3 -28z" fill="${cape}"/>`
        + `<circle cx="${x}" cy="72" r="6.4" fill="${skin}"/>${beard ? `<path d="M${x - 6} 74 q6 10 12 0 q-2 6 -6 7 q-4 -1 -6 -7z" fill="${beard}"/>` : ''}<circle cx="${x - 2.2}" cy="71" r=".8" fill="#2b2b2b"/><circle cx="${x + 2.2}" cy="71" r=".8" fill="#2b2b2b"/><path d="M${x - 2} 75 q2 1.6 4 0" stroke="#7a3b22" stroke-width=".8" fill="none"/>`
        + `<path d="M${x - 7} 66 l1.4 -9 3 4 2.6 -6 2.6 6 3 -4 1.4 9z" fill="#F5C542" stroke="#c9961f" stroke-width=".8"/><circle cx="${x}" cy="59" r="1.2" fill="#E5483B"/>`
        + `<g transform="translate(${x + 10} 90)">${gift}</g></g></g>`;
      const box = '<rect x="-4" y="-4" width="8" height="7" rx="1" fill="#F5C542"/><path d="M0 -4 v7 M-4 -1 h8" stroke="#c9961f" stroke-width="1"/>';
      const jar = '<path d="M-3 3 q-2 -4 0 -7 h6 q2 3 0 7z" fill="#cfd8e3"/><rect x="-2" y="-6" width="4" height="2" fill="#9aa7b4"/>';
      const urn = '<path d="M-3.5 3 q-1 -5 1 -7 h5 q2 2 1 7z" fill="#B07CFF"/><circle cx="0" cy="-5" r="1.2" fill="#F5C542"/>';
      svg += king(CX - 330, '#7a3fb0', '#4f2780', '#F3CDA6', '#e9e4dc', box, 0) + king(CX - 285, '#2f7f4f', '#1f5a37', '#C99167', '#3a2a1e', jar, 1.2) + king(CX - 240, '#c8302e', '#8f1f1d', '#6B4129', '', urn, 2.4);
    }
    if (vis === 'fasnacht') {
      // waving streamers, swinging lanterns, rising balloons, a marching Guggenmusik and confetti everywhere
      svg += `<path d="M0 ${TOP + 3} H${W}" stroke="#8a8f96" stroke-width="1"/>`;
      for (let x = 18; x < W; x += 48) { const c = ['#FFD84D', '#5CE1E6', '#FF7AB6', '#9EDC9E', '#B07CFF', '#FF8A3C'][(x / 48 | 0) % 6]; const len = 2 + ((x * 7) % 3); let d = `M${x} ${TOP + 3}`;
        for (let k = 0; k < len; k++) d += ` c 5 2 5 6 0 7 c -5 1 -5 5 0 7`;
        svg += `<g class="str" style="transform-origin:${x}px ${TOP + 3}px;animation-delay:-${(r() * 3.6).toFixed(1)}s;animation-duration:${(3 + r() * 1.6).toFixed(1)}s"><path d="${d}" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`; }
      for (let x = 40; x < W; x += 110) { const c = ['#FF5A7A', '#FFD84D', '#5CE1E6', '#B07CFF', '#7CFF8A'][(x / 110 | 0) % 5];
        svg += `<g class="sw" style="transform-origin:${x}px ${TOP + 4}px;animation-delay:-${(r() * 3).toFixed(1)}s"><path d="M${x} ${TOP + 4} v10" stroke="#555" stroke-width="1"/><ellipse cx="${x}" cy="${TOP + 22}" rx="7" ry="9" fill="${c}"/><path d="M${x - 7} ${TOP + 22} h14" stroke="#fff" stroke-width="1" opacity=".6"/></g>`; }
      for (let i = 0; i < 10; i++) { const x = 30 + r() * (W - 60); const c = ['#FF5A7A', '#FFD84D', '#5CE1E6', '#B07CFF', '#7CFF8A', '#FF8A3C'][i % 6];
        svg += `<g class="rise" style="animation-duration:${(9 + r() * 7).toFixed(1)}s;animation-delay:-${(r() * 14).toFixed(1)}s"><path d="M${x.toFixed(0)} ${H + 26} q-3 10 1 20" stroke="#fff" stroke-width=".8" fill="none" opacity=".7"/><ellipse cx="${x.toFixed(0)}" cy="${H + 16}" rx="7" ry="9" fill="${c}"/></g>`; }
      for (let i = 0; i < 16; i++) svg += `<circle class="tw" cx="${(r() * W).toFixed(0)}" cy="${(TOP + 8 + r() * 60).toFixed(0)}" r="1.6" fill="${['#fff', '#FFD84D', '#5CE1E6', '#FF7AB6'][i % 4]}" style="animation-delay:-${(r() * 1.8).toFixed(2)}s;animation-duration:1s"/>`;
      for (let i = 0; i < 60; i++) { const cx = r() * W; const cy = 102 + r() * 16; svg += `<rect x="${cx.toFixed(0)}" y="${cy.toFixed(1)}" width="3" height="2" rx=".5" fill="${['#FF5A7A', '#FFD84D', '#5CE1E6', '#B07CFF', '#7CFF8A', '#FF8A3C'][i % 6]}" transform="rotate(${(r() * 180).toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(1)})"/>`; }
      for (let i = 0; i < 4; i++) { const x = i % 2 ? CX + 180 + r() * 260 : 120 + r() * (CX - 320); const y = TOP + 22 + r() * 22; const d = (i * 0.65).toFixed(2);
        ['#FF5A7A', '#FFD84D', '#5CE1E6', '#B07CFF', '#7CFF8A', '#FF8A3C'].forEach((c, k) => { svg += burstRays(x + (k % 3 - 1) * 4, y + (k > 2 ? 3 : -3), c, d); }); }
      P.push(['confetti', 170]);
    }
    if (vis === 'liebe') {
      P.push(['hearts', s.anniversary ? 30 : 14]);
      if (s.anniversary || ['hochzeitstag', 'kennenlerntag'].includes(s.key)) { const bx = CX - 118; const gx = CX - 96;
        for (let i = 0; i < 130; i++) { const fx = r() * W; const fy = 103 + r() * 15; let g = `<path d="M${fx.toFixed(0)} ${fy.toFixed(0)} q-1 -5 -3 -7 M${fx.toFixed(0)} ${fy.toFixed(0)} q1 -6 3 -8 M${fx.toFixed(0)} ${fy.toFixed(0)} v-6" stroke="#7fae6a" stroke-width=".5" fill="none"/>`;
          [[-3, -7], [3, -8], [0, -6.5], [-1.6, -8.4], [1.6, -9.6], [-4, -5.6], [4.4, -6.6]].forEach(([a, b]) => { g += `<circle cx="${(fx + a).toFixed(1)}" cy="${(fy + b).toFixed(1)}" r="${(0.6 + r() * 0.5).toFixed(2)}" fill="#ffffff"/>`; });
          svg += g; }
        svg += `<g class="bob" style="animation-duration:3.4s"><path d="M${bx - 12} 108 q4 -22 12 -26 q8 4 12 26z" fill="#ffffff"/><path d="M${bx - 5} 82 h10 l-2 6 h-6z" fill="#f3f3f3"/><circle cx="${bx}" cy="76" r="5" fill="#F3CDA6"/><path d="M${bx - 5.4} 76 q0 -8 5.4 -8 q5.4 0 5.4 8 q-1 -4 -5.4 -4 q-4.4 0 -5.4 4z" fill="#8B5A2B"/><path d="M${bx + 3} 70 q9 6 6 30" stroke="#ffffff" stroke-width="4" fill="none" opacity=".75"/><circle cx="${bx - 1.8}" cy="76.4" r=".7" fill="#2b2b2b"/><circle cx="${bx + 1.8}" cy="76.4" r=".7" fill="#2b2b2b"/><path d="M${bx - 1.4} 78.6 q1.4 1.2 2.8 0" stroke="#c2546a" stroke-width=".7" fill="none"/><circle cx="${bx - 7}" cy="90" r="3" fill="#FF7AB6"/><circle cx="${bx - 9}" cy="88" r="2" fill="#ffd0dc"/></g>`
          + `<g class="bob" style="animation-duration:3.4s;animation-delay:-.3s"><path d="M${gx - 4} 108 v-12 M${gx + 4} 108 v-12" stroke="#22252b" stroke-width="3.4"/><rect x="${gx - 7}" y="82" width="14" height="16" rx="3" fill="#2b2f36"/><path d="M${gx - 2} 82 l2 6 l2 -6z" fill="#fff"/><path d="M${gx - 1.6} 83 h3.2 l-1.6 1.6z" fill="#E5483B"/><circle cx="${gx}" cy="76" r="5" fill="#E3B48A"/><path d="M${gx - 5} 75 q0 -6 5 -6 q5 0 5 6 q-2 -3 -5 -3 q-3 0 -5 3z" fill="#3a2a1e"/><circle cx="${gx - 1.8}" cy="76.4" r=".7" fill="#2b2b2b"/><circle cx="${gx + 1.8}" cy="76.4" r=".7" fill="#2b2b2b"/><path d="M${gx - 1.4} 78.6 q1.4 1.2 2.8 0" stroke="#7a3b22" stroke-width=".7" fill="none"/></g>`
          + `<g class="bob" style="animation-duration:2s">${emo(CX - 107, 62, '💕', 14)}</g>`; }
    }
    if (vis === 'fruehling' || vis === 'ostern') {
      svg += '<g transform="translate(470 102)"><path d="M0 0 L0 -34 M0 -20 L-18 -38 M0 -26 L16 -44" stroke="#7A5233" stroke-width="6" stroke-linecap="round"/><g class="sw" style="transform-origin:0 -30px">';
      for (let i = 0; i < 26; i++) svg += `<circle cx="${(r() - 0.5) * 60}" cy="${-34 - r() * 30}" r="${3 + r() * 4}" fill="${r() > 0.3 ? '#ffc4dc' : '#ffe6f0'}"/>`;
      svg += '</g></g>';
      for (let i = 0; i < 9; i++) { const x = hasHouse ? (i < 4 ? CX - 140 + i * 13 : CX + 70 + (i - 4) * 13) : 560 + i * 26; svg += `<path d="M${x} 104 v-14" stroke="#3f8f3a" stroke-width="2"/><path d="M${x - 5} 92 q5 -10 10 0 q-5 4 -10 0z" fill="${['#FF5A7A', '#FFD84D', '#FF8A3C', '#C77DFF'][i % 4]}"/>`; }
      for (let i = 0; i < 3; i++) svg += `<g class="fly" style="animation-duration:${(26 + r() * 14).toFixed(0)}s;animation-delay:-${(r() * 20).toFixed(0)}s"><path d="M0 ${24 + i * 9} q5 -5 10 0 q5 -5 10 0" stroke="#33415c" stroke-width="2" fill="none"/></g>`;
      if (vis === 'ostern') {
        // bunny holes: now and then a little white bunny peeks out and hops back in
        [[CX - 330, 0], [CX - 255, 3.1], [CX + 165, 5.7]].forEach(([x, dl]) => {
          svg += `<ellipse cx="${x}" cy="108" rx="11" ry="3.6" fill="#3b2a1e"/>`
            + `<g class="hop2" style="animation-delay:-${dl}s"><ellipse cx="${x - 2.6}" cy="94" rx="1.7" ry="5.4" fill="#fff" transform="rotate(-10 ${x - 2.6} 94)"/><ellipse cx="${x + 2.6}" cy="94" rx="1.7" ry="5.4" fill="#fff" transform="rotate(10 ${x + 2.6} 94)"/><ellipse cx="${x - 2.6}" cy="94.4" rx=".7" ry="3.6" fill="#ffc4dc" transform="rotate(-10 ${x - 2.6} 94)"/><ellipse cx="${x + 2.6}" cy="94.4" rx=".7" ry="3.6" fill="#ffc4dc" transform="rotate(10 ${x + 2.6} 94)"/><circle cx="${x}" cy="103" r="5.6" fill="#fff"/><circle cx="${x - 2}" cy="102" r=".9" fill="#2b2b2b"/><circle cx="${x + 2}" cy="102" r=".9" fill="#2b2b2b"/><circle cx="${x}" cy="104.2" r=".9" fill="#ff8fb3"/><path d="M${x - 1.4} 105.4 q1.4 1 2.8 0" stroke="#c78a9a" stroke-width=".5" fill="none"/><circle cx="${x - 3.4}" cy="104.4" r="1" fill="#ffd0dc" opacity=".8"/><circle cx="${x + 3.4}" cy="104.4" r="1" fill="#ffd0dc" opacity=".8"/></g>`
            + `<path d="M${x - 14} 108 h28 v12 h-28z" fill="${gCol}"/><path d="M${x - 11} 108 a11 3.6 0 0 0 22 0" fill="#2a1e15" opacity=".55"/>`; });
        for (let i = 0; i < 6; i++) { const ex = 200 + i * 140 + r() * 40; const ey = 104 + r() * 6; svg += `<ellipse cx="${ex.toFixed(0)}" cy="${ey.toFixed(1)}" rx="6" ry="8" fill="${['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF', '#FF8A3C'][i]}" transform="rotate(${(i % 2 ? 1 : -1) * (14 + r() * 18)} ${ex.toFixed(0)} ${ey.toFixed(1)})"/><path d="M${(ex - 5).toFixed(0)} ${(ey - 1).toFixed(1)} q5 3 10 0" stroke="#fff" stroke-width="1.2" fill="none" opacity=".75" transform="rotate(${(i % 2 ? 1 : -1) * 20} ${ex.toFixed(0)} ${ey.toFixed(1)})"/>`; }
        // chocolate bunnies hide behind bushes and peek out now and then
        const choco = (x) => `<path d="M${x} 108 q-8 0 -8 -8 q0 -6 5 -7 l-1 -9 q1 -2 2 0 l1 7 l1 -8 q1 -2 2 0 l0 9 q4 2 4 7 q0 9 -6 9z" fill="#7a4a2a"/><path d="M${x - 2} 92 l0 -6" stroke="#a0683e" stroke-width=".8"/><circle cx="${x + 1}" cy="96" r=".8" fill="#2b1a10"/><path d="M${x - 6} 102 h10" stroke="#E5483B" stroke-width="1.6"/><circle cx="${x - 1}" cy="102" r="1.3" fill="#F5C542"/>`;
        [[CX - 210, 0], [CX + 245, 4.5], [70, 8]].forEach(([x, dl], k) => { svg += `<clipPath id="fpcb${k}"><rect x="${x - 20}" y="0" width="40" height="104"/></clipPath><g clip-path="url(#fpcb${k})"><g class="peek2" style="animation-delay:-${dl}s">${choco(x)}</g></g><ellipse cx="${x}" cy="104" rx="15" ry="9" fill="#4f9a3e"/><ellipse cx="${x - 7}" cy="101" rx="8" ry="7" fill="#5fae46"/><ellipse cx="${x + 7}" cy="100" rx="8" ry="7" fill="#58a542"/>`; });
      }
      if (s.key === 'muttertag') { svg += mumHearts(); P.push(['hearts', 24]); }
    }
    if (vis === 'pfingsten') {
      const kk = s.key || '';
      // Ascension and Whitsun: a small hill with an empty cross; Whitsun: white doves across the sky; Mother's Day: hearts
      if (['auffahrt', 'pfingstsonntag', 'pfingstmontag'].includes(kk)) { const hx = CX - 300;
        svg += `<path d="M${hx - 60} 110 Q ${hx} 84 ${hx + 60} 110z" fill="#7cbf5a"/><path d="M${hx} 92 V60 M${hx - 10} 70 H${hx + 10}" stroke="#7a5233" stroke-width="4" stroke-linecap="round"/>`; }
      const dove = () => '<path d="M-9 1 l-6 -3 l1 4 l-1 3 z" fill="#eef2f7"/><ellipse cx="0" cy="0" rx="9" ry="4.6" fill="#ffffff"/><circle cx="8" cy="-3" r="3.2" fill="#ffffff"/><path d="M11 -3.4 l3 1 -3 .9z" fill="#F5A623"/><circle cx="9" cy="-3.8" r=".6" fill="#2b2b2b"/>'
        + '<g class="flap"><path d="M-1 -2 q-4 -11 -14 -9 q6 4 7 9z" fill="#f4f7fb" stroke="#d6dde6" stroke-width=".5"/></g><g class="flap" style="animation-delay:-.08s"><path d="M1 -2 q2 -12 12 -12 q-4 5 -5 12z" fill="#ffffff" stroke="#d6dde6" stroke-width=".5"/></g>';
      if (kk !== 'muttertag' && kk !== 'tag_der_arbeit') for (let i = 0; i < 6; i++) { const x0 = CX - 360 + i * 70 + (i > 2 ? 420 : 0);
        const dir = [[-380, -150], [-120, -170], [260, -160], [-260, -160], [140, -170], [400, -140]][i]; const left = dir[0] < 0;
        svg += `<g class="dove2" style="--tx:${dir[0]}px;--ty:${dir[1]}px;animation-delay:-${(i * 1.9).toFixed(1)}s"><g transform="translate(${x0} 104) scale(${left ? -1.15 : 1.15} 1.15)">${dove()}</g></g>`; }
      if (kk === 'muttertag') { svg += mumHearts(); P.push(['hearts', 24]); }
    }
    if (vis === 'vatertag') {
      // the house becomes a man cave: rock with a dark entrance, a glow inside; Dad the caveman next to a smoking campfire
      const cx = CX;
      svg += `<g transform="translate(${cx} 106) scale(.72) translate(${-cx} -106)">`;
      svg += `<path d="M${cx - 92} 106 C ${cx - 96} 76 ${cx - 70} 46 ${cx - 30} 40 C ${cx + 4} 30 ${cx + 52} 38 ${cx + 76} 60 C ${cx + 94} 76 ${cx + 98} 96 ${cx + 94} 106Z" fill="#8a8173"/>`
        + `<path d="M${cx - 70} 70 q16 -10 34 -6 M${cx + 30} 52 q18 2 28 14 M${cx - 40} 90 q10 -4 22 0 M${cx + 50} 86 q12 -2 22 4" stroke="#6f675b" stroke-width="2" fill="none"/>`
        + `<path d="M${cx - 34} 106 V82 C ${cx - 34} 56 ${cx + 30} 56 ${cx + 30} 82 V106Z" fill="#241c16"/><path d="M${cx - 26} 106 V84 C ${cx - 26} 66 ${cx + 22} 66 ${cx + 22} 84 V106Z" fill="#FF9A3C" opacity=".22" class="glw" style="animation-duration:2.6s"/>`
        + `<path d="M${cx - 24} 62 l3 7 3 -7 M${cx - 6} 58 l2 6 2 -6 M${cx + 12} 60 l3 7 3 -7" fill="#6f675b"/>`
        + `<path d="M${cx - 60} 58 l10 -4 2 6 z" fill="#5a3b22"/><path d="M${cx + 40} 50 h18 v10 h-18z" fill="#c9a77a" transform="rotate(-6 ${cx + 49} 55)"/><path d="M${cx + 43} 55 h12" stroke="#5a3b22" stroke-width="1.2" transform="rotate(-6 ${cx + 49} 55)"/>`
        + `<path d="M${cx - 80} 104 q8 -10 18 0" fill="#5f8f45"/><path d="M${cx + 70} 104 q10 -12 22 0" fill="#5f8f45"/></g>`;
      // stones and bones all around
      [[cx - 240, 108, 1.2], [cx - 205, 112, 0.7], [cx - 60, 110, 0.9], [cx + 60, 111, 1], [cx + 140, 108, 1.3], [cx + 175, 112, 0.7], [cx + 260, 110, 1.1], [cx - 320, 111, 0.9], [cx + 330, 109, 0.8]].forEach(([x, y, k]) => {
        svg += `<ellipse cx="${x}" cy="${y}" rx="${(8 * k).toFixed(1)}" ry="${(5 * k).toFixed(1)}" fill="#8d939b"/><ellipse cx="${x - 2 * k}" cy="${y - 2 * k}" rx="${(4 * k).toFixed(1)}" ry="${(2 * k).toFixed(1)}" fill="#a9afb6"/>`; });
      svg += `<path d="M${cx - 28} 112 h12 M${cx - 30} 110.6 l2 1.4 -2 1.4 M${cx - 14} 110.6 l-2 1.4 2 1.4" stroke="#f1ebdd" stroke-width="2" stroke-linecap="round" fill="none"/>`;
      // sabre-toothed tiger lying in front of the cave, flicking its tail
      const tx = cx + 92;
      svg += `<g><g class="sw" style="transform-origin:${tx - 22}px 104px"><path d="M${tx - 22} 104 q-14 -2 -16 -12" stroke="#d9862f" stroke-width="3" fill="none" stroke-linecap="round"/></g><ellipse cx="${tx - 6}" cy="104" rx="18" ry="7" fill="#e8963a"/>`
        + [-14, -8, -2, 4].map((d) => `<path d="M${tx + d} 97.5 q1 4 0 8" stroke="#7a4a1e" stroke-width="1.4" fill="none"/>`).join('')
        + `<path d="M${tx - 18} 109 v3 M${tx + 6} 109 v3" stroke="#d9862f" stroke-width="4" stroke-linecap="round"/><g class="nod" style="transform-origin:${tx + 12}px 100px"><circle cx="${tx + 14}" cy="98" r="7" fill="#e8963a"/><path d="M${tx + 9} 92 l1 -4 3 3z M${tx + 17} 92 l2 -4 2 4z" fill="#c97424"/>`
        + `<ellipse cx="${tx + 17}" cy="101" rx="4" ry="3" fill="#f6dcb2"/><circle cx="${tx + 12}" cy="96" r="1" fill="#2b2b2b"/><circle cx="${tx + 17}" cy="96" r="1" fill="#2b2b2b"/><circle cx="${tx + 17.6}" cy="99" r=".9" fill="#5a2a1a"/><path d="M${tx + 15} 102 l.8 5 1 -5 M${tx + 19} 102 l.8 5 1 -5" fill="#ffffff" stroke="#ddd" stroke-width=".3"/></g></g>`;
      // caveman dad: wild hair, big beard, fur tunic with spots, club over the shoulder
      const dx2 = cx - 140;
      svg += `<g class="bob" style="animation-duration:3.4s"><path d="M${dx2 - 4} 108 l-1 -12 M${dx2 + 4} 108 l1 -12" stroke="#C99167" stroke-width="3.6" stroke-linecap="round"/><path d="M${dx2 - 11} 98 l3 -20 h16 l3 20 l-5 -2 -3 3 -4 -3 -4 3 -3 -3z" fill="#B8742F"/>`
        + `<circle cx="${dx2 - 4}" cy="86" r="1.6" fill="#5a3412"/><circle cx="${dx2 + 4}" cy="91" r="1.4" fill="#5a3412"/><circle cx="${dx2 + 1}" cy="82" r="1.2" fill="#5a3412"/><path d="M${dx2 - 8} 78 l12 16" stroke="#9a5a22" stroke-width="2.4"/>`
        + `<circle cx="${dx2}" cy="71" r="6" fill="#C99167"/><path d="M${dx2 - 7} 70 q-1 -9 7 -9 q8 0 7 9 l-2 -3 -2 2 -3 -3 -3 3 -2 -2z" fill="#3a2414"/><path d="M${dx2 - 6} 72 q0 11 6 12 q6 -1 6 -12 q-3 3 -6 3 q-3 0 -6 -3z" fill="#4a2e18"/>`
        + `<circle cx="${dx2 - 2}" cy="70" r=".8" fill="#2b2b2b"/><circle cx="${dx2 + 2}" cy="70" r=".8" fill="#2b2b2b"/><path d="M${dx2 - 3.4} 67.6 h2.4 M${dx2 + 1} 67.6 h2.4" stroke="#3a2414" stroke-width="1.2"/><path d="M${dx2 - 2} 74.4 q2 1.6 4 0" stroke="#7a3b22" stroke-width=".8" fill="none"/>`
        + `<g class="wave2" style="transform-origin:${dx2 + 8}px 84px"><path d="M${dx2 + 8} 84 l6 -8" stroke="#C99167" stroke-width="3" stroke-linecap="round"/><path d="M${dx2 + 13} 78 l7 -16" stroke="#8a5a2b" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="${dx2 + 21}" cy="59" rx="4" ry="6" fill="#8a5a2b" transform="rotate(22 ${dx2 + 21} 59)"/></g></g>`;
      // campfire with logs, stones, flames and smoke
      const fx = cx - 104;
      svg += [-9, -4, 2, 7].map((o2) => `<ellipse cx="${fx + o2 * 1.2}" cy="109" rx="3.2" ry="2.2" fill="#8d939b"/>`).join('')
        + `<path d="M${fx - 9} 108 l18 -5 M${fx + 9} 108 l-18 -5" stroke="#6b4a2e" stroke-width="3" stroke-linecap="round"/>`
        + `<path class="flame" d="M${fx - 7} 106 Q ${fx - 4} 92 ${fx} 86 Q ${fx + 4} 92 ${fx + 7} 106Z" fill="#FF8A3C"/><path class="flame" d="M${fx - 4} 106 Q ${fx} 96 ${fx + 4} 106Z" fill="#FFD24A" style="animation-delay:-.3s"/>`
        + smoke({ smoke: true, wind }, fx, 82) + smoke({ smoke: true, wind }, fx + 2, 78);
    }
    if (vis === 'sommer') {
      const palm = (x, k, dl) => `<g class="sw" style="transform-origin:${x}px 104px;animation-delay:-${dl}s"><path d="M${x} 104 Q ${x + 6 * k} ${104 - 34 * k} ${x - 4 * k} ${104 - 64 * k}" stroke="#8a5a2b" stroke-width="${(6 * k).toFixed(1)}" fill="none"/>`
        + [[-30, -6, -44, 12], [30, -8, 44, 10], [-18, -22, -40, -18], [18, -24, 40, -16], [2, -26, 4, -30]].map(([a, b, c, d]) => `<path d="M${x - 4 * k} ${104 - 64 * k} q${a * k} ${b * k} ${c * k} ${d * k}" stroke="#2f9a46" stroke-width="${(7 * k).toFixed(1)}" fill="none" stroke-linecap="round"/>`).join('')
        + `<circle cx="${x - 2 * k}" cy="${104 - 60 * k}" r="${(3 * k).toFixed(1)}" fill="#7a4f25"/></g>`;
      svg += palm(180, 1, 0) + palm(560, 0.85, 1.2) + palm(960, 1.05, 2.1);
      // bungalow on stilts with a palm-leaf roof
      const bx = 760;
      svg += `<path d="M${bx - 34} 104 V86 M${bx - 12} 104 V86 M${bx + 12} 104 V86 M${bx + 34} 104 V86" stroke="#7a5233" stroke-width="3"/>`
        + `<rect x="${bx - 40}" y="83" width="80" height="4" fill="#a87a4a"/><rect x="${bx - 34}" y="58" width="68" height="26" fill="#c8995f"/>`
        + Array.from({ length: 8 }, (_, i) => `<path d="M${bx - 34 + i * 9.7} 58 v26" stroke="#a87a4a" stroke-width="1"/>`).join('')
        + `<rect x="${bx - 6}" y="66" width="13" height="18" fill="#6b4a2e"/><rect x="${bx - 28}" y="64" width="14" height="10" fill="#bfe8ff" stroke="#6b4a2e" stroke-width="1.4"/><rect x="${bx + 15}" y="64" width="14" height="10" fill="#bfe8ff" stroke="#6b4a2e" stroke-width="1.4"/>`
        + `<path d="M${bx - 52} 60 L${bx} 32 L${bx + 52} 60z" fill="#b8905a"/>` + Array.from({ length: 13 }, (_, i) => `<path d="M${bx} 33 L${bx - 50 + i * 8.3} 60 l${i % 2 ? 1.5 : -1.5} 4" stroke="${i % 2 ? '#8d6a3c' : '#d2ae72'}" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')
        + `<path d="M${bx + 40} 85 l14 19 M${bx + 46} 85 l14 19 M${bx + 43} 91 h6 M${bx + 47} 97 h6" stroke="#7a5233" stroke-width="2"/>`
        + `<path d="M${bx + 30} 50 l8 -3 v7z" fill="#ff5a5a"/>`;
      svg += '<path d="M1040 104 L1060 60" stroke="#8a5a2b" stroke-width="3"/><path d="M1018 66 Q 1060 36 1102 54Z" fill="#ff5a5a"/><path d="M1032 60 Q 1060 44 1086 56" stroke="#fff" stroke-width="5" fill="none"/>';
      svg += emo(640, 110, '🏐', 14, 'bob') + emo(1120, 110, '🏰', 18) + emo(1160, 112, '🩴', 14) ;
      svg += `<g class="plane"><g transform="translate(0 ${TOP + 26})"><path d="M0 0 h26 q6 0 8 3 q-2 3 -8 3 h-26 l-4 -3z" fill="#fff"/><path d="M10 0 l-6 -8 h4 l9 8z M10 6 l-6 8 h4 l9 -8z M-2 1 l-3 -5 h3 l3 4z" fill="#dbe4ee"/><circle cx="27" cy="2" r="1" fill="#5fa8e8"/><circle cx="23" cy="2" r="1" fill="#5fa8e8"/><circle cx="19" cy="2" r="1" fill="#5fa8e8"/></g></g>`;
      [[300, 0]].forEach(([fx, dl]) => { svg += `<g class="fin" style="animation-delay:-${dl}s"><path d="M${fx} 89 l5 -8 q2 4 4 8z" fill="#4b5563"/></g><rect x="${fx - 6}" y="89" width="130" height="6" fill="#2aa7df"/>`; });
      const crab = (x, dl) => `<g style="animation-delay:-${dl}s"><ellipse class="chole" cx="${x}" cy="112" rx="5" ry="1.8" fill="#8a6a35" style="animation-delay:-${dl}s"/><ellipse class="cmnd" cx="${x + 46}" cy="112" rx="6" ry="2.2" fill="#e2bf74" style="animation-delay:-${dl}s"/>`
        + `<g class="crab2" style="animation-delay:-${dl}s"><path d="M${x - 6} 110 l-3 2.4 M${x - 4} 111 l-2 2.6 M${x + 6} 110 l3 2.4 M${x + 4} 111 l2 2.6" stroke="#c8302e" stroke-width="1"/><ellipse cx="${x}" cy="109" rx="6" ry="3.4" fill="#E5483B"/><path d="M${x - 6} 107.6 q-4 -3 -2 -6 q2 1 1 3z M${x + 6} 107.6 q4 -3 2 -6 q-2 1 -1 3z" fill="#E5483B"/><circle cx="${x - 2}" cy="105.6" r="1" fill="#fff"/><circle cx="${x + 2}" cy="105.6" r="1" fill="#fff"/><circle cx="${x - 2}" cy="105.6" r=".45" fill="#2b2b2b"/><circle cx="${x + 2}" cy="105.6" r=".45" fill="#2b2b2b"/></g></g>`;
      svg += crab(430, 0) + crab(900, 8);
    }
    if (vis === 'august') {
      // bunting on a string: red pennants with a white cross, white ones with a red cross
      for (let x0 = 0; x0 < W; x0 += 240) svg += `<path d="M${x0} ${TOP + 3} Q ${x0 + 120} ${TOP + 63} ${x0 + 240} ${TOP + 3}" stroke="#8a8f96" stroke-width="1" fill="none"/><circle cx="${x0}" cy="${TOP + 4}" r="2" fill="#8a8f96"/>`;
      for (let x = 4; x < W - 10; x += 20) { const t = ((x + 7) % 240) / 240; const y = TOP + 3 + 60 * t * (1 - t); const red = (x / 20 | 0) % 2 === 0; const f = red ? '#DA291C' : '#ffffff'; const k = red ? '#ffffff' : '#DA291C';
        svg += `<g class="sw" style="transform-origin:${x + 7}px ${y.toFixed(1)}px;animation-delay:-${(r() * 3).toFixed(1)}s"><path d="M${x} ${y.toFixed(1)} h14 l-7 15z" fill="${f}" stroke="${red ? 'none' : '#d9d9d9'}" stroke-width=".5"/><path d="M${x + 7} ${(y + 2).toFixed(1)} v6 M${x + 4} ${(y + 5).toFixed(1)} h6" stroke="${k}" stroke-width="1.8"/></g>`; }
      svg += '<g transform="translate(' + (CX - 235) + ' 40)"><path d="M0 64 V0" stroke="#999" stroke-width="2"/><g class="sw" style="transform-origin:0 0"><rect x="0" y="0" width="30" height="30" fill="#DA291C"/><path d="M15 6 v18 M6 15 h18" stroke="#fff" stroke-width="6"/></g></g>';
      if (hour >= 21) { svg += '<g transform="translate(380 104)"><path d="M-22 0 L22 0" stroke="#6b4a2e" stroke-width="5"/><path class="flame" d="M-16 0 Q -8 -36 0 -46 Q 8 -36 16 0Z" fill="#FF8A3C"/><path class="flame" d="M-8 0 Q 0 -24 8 0Z" fill="#FFD24A"/></g>'; P.push(['sparks', 12]); }
    }
    if (vis === 'schule') {
      // children with school bags walk along the path, one after the other
      const kid = (shirt, bag, hair, sk) => `<g class="step" style="animation-duration:.45s"><g class="leg" style="transform-origin:0px 96px"><path d="M-2 96 l-2 10" stroke="#34495e" stroke-width="2.6" stroke-linecap="round"/></g><g class="leg" style="transform-origin:0px 96px;animation-delay:-.45s"><path d="M2 96 l2 10" stroke="#2c3e50" stroke-width="2.6" stroke-linecap="round"/></g><rect x="-4.5" y="84" width="9" height="13" rx="3" fill="${shirt}"/><rect x="-9" y="84.5" width="6" height="10" rx="1.6" fill="${bag}"/><circle cx="0.5" cy="79" r="5" fill="${sk}"/><path d="M-4.5 78 q5 -7 10 0" fill="${hair}"/><circle cx="2.6" cy="79" r=".7" fill="#2b2b2b"/></g>`;
      [['#4FA3E0', '#E5483B', '#6b4a2e', '#F3CDA6', 0], ['#F5C542', '#3FA66B', '#2b2b2b', '#C99167', 7], ['#E06B9B', '#3E8EDE', '#D4A63B', '#FBE3CF', 14]].forEach(([a, b, c, d, dl]) => { svg += `<g class="fly" style="animation-duration:30s;animation-delay:-${dl}s"><g transform="translate(0 -45) scale(1.42)">${kid(a, b, c, d)}</g></g>`; });
      svg += emo(CX - 250, 106, '🏫', 22) + emo(CX - 210, 106, '✏️', 13);
    }
    if (vis === 'herbst') { P.push(['leaves', 14]); if (s.key === 'erntedank') svg += emo(380, 106, '🎃', 22) + emo(420, 106, '🍎', 16) + emo(450, 106, '🌻', 20); }
    if (snowGround && jz === 'winter' && ['winter', 'sport', 'alltag'].includes(vis)) {
      const sx = CX - 250;
      svg += `<g><circle cx="${sx}" cy="101" r="8" fill="#fff" stroke="#dfe7ef" stroke-width=".6"/><circle cx="${sx}" cy="89" r="6" fill="#fff" stroke="#dfe7ef" stroke-width=".6"/><circle cx="${sx}" cy="80" r="4.4" fill="#fff" stroke="#dfe7ef" stroke-width=".6"/><path d="M${sx} 80 l5 1 -5 1z" fill="#FF8A3C"/><circle cx="${sx - 1.6}" cy="78.6" r=".7" fill="#2b2b2b"/><circle cx="${sx + 1.2}" cy="78.6" r=".7" fill="#2b2b2b"/><rect x="${sx - 4}" y="72" width="8" height="4" fill="#2b2b2b"/><rect x="${sx - 6}" y="75.5" width="12" height="1.4" fill="#2b2b2b"/><path d="M${sx - 5} 84 h10" stroke="#E5483B" stroke-width="2"/><path d="M${sx - 6} 88 l-8 -6 M${sx + 6} 88 l8 -6" stroke="#7a5233" stroke-width="1.2"/><circle cx="${sx}" cy="88" r=".8" fill="#2b2b2b"/><circle cx="${sx}" cy="91" r=".8" fill="#2b2b2b"/></g>`;
      const kidW = (x, shirt, hat, flip) => `<g transform="translate(${x} 0) scale(${flip ? -1.3 : 1.3} 1.3) translate(0 -24)"><path d="M-2 96 l-2 10 M2 96 l2 10" stroke="#34495e" stroke-width="2.6" stroke-linecap="round"/><rect x="-4.5" y="84" width="9" height="13" rx="3" fill="${shirt}"/><g class="wave2" style="transform-origin:3px 87px"><path d="M3 87 l6 -6" stroke="${shirt}" stroke-width="2.6" stroke-linecap="round"/></g><circle cx=".5" cy="79" r="5" fill="#F3CDA6"/><path d="M-4.6 77.6 q5 -8 10 0z" fill="${hat}"/><circle cx="2.6" cy="79" r=".7" fill="#2b2b2b"/></g>`;
      if (!night) svg += kidW(CX - 330, '#E5483B', '#3E8EDE', false) + kidW(CX - 170, '#3E8EDE', '#F5C542', true);
      if (!night) svg += `<circle class="ball1" cx="${CX - 316}" cy="82" r="2.2" fill="#fff" stroke="#dfe7ef" stroke-width=".4"/><circle class="ball2" cx="${CX - 184}" cy="82" r="2.2" fill="#fff" stroke="#dfe7ef" stroke-width=".4"/>`;
    }
    if (vis === 'geburtstag') {
      for (let x = 0; x < W; x += 22) svg += `<g class="sw" style="transform-origin:${x + 7}px ${TOP + 4}px;animation-delay:-${(r() * 3).toFixed(1)}s"><path d="M${x} ${TOP + 4} l14 0 -7 16z" fill="${['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF'][(x / 22) % 5]}"/></g>`;
      // balloons keep floating up, party poppers burst, presents and a cake with a flickering candle
      for (let i = 0; i < 14; i++) { const x = 30 + r() * (W - 60); const c = ['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF', '#FF8A3C'][i % 6];
        svg += `<g class="rise" style="animation-duration:${(8 + r() * 6).toFixed(1)}s;animation-delay:-${(r() * 12).toFixed(1)}s"><path d="M${x.toFixed(0)} ${H + 28} q-4 10 1 22" stroke="#fff" stroke-width=".8" fill="none" opacity=".7"/><ellipse cx="${x.toFixed(0)}" cy="${H + 16}" rx="9" ry="12" fill="${c}"/><ellipse cx="${(x - 3).toFixed(0)}" cy="${H + 11}" rx="2" ry="3" fill="#fff" opacity=".5"/></g>`; }
      for (let i = 0; i < 5; i++) svg += burstRays(120 + r() * (W - 240), TOP + 20 + r() * 30, ['#FF7AB6', '#FFD84D', '#5CE1E6', '#B07CFF', '#9EDC9E'][i], (r() * 2.6).toFixed(2));
      svg += emo(CX - 300, 106, '🎁', 18, 'bob') + emo(CX - 270, 107, '🎁', 14, 'bob', 'style="animation-delay:-1s"') + emo(CX + 185, 106, '🎂', 20) + `<path class="flame" d="M${CX + 185} 88 q2 3 0 5 q-2 -2 0 -5z" fill="#FFC23D"/>`;
      P.push(['confetti', 90]);
    }
    const ujack = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect width="20" height="12" fill="#012169"/><path d="M0 0 L20 12 M20 0 L0 12" stroke="#fff" stroke-width="2.4"/><path d="M0 0 L20 12 M20 0 L0 12" stroke="#C8102E" stroke-width=".9"/><path d="M10 0 V12 M0 6 H20" stroke="#fff" stroke-width="4"/><path d="M10 0 V12 M0 6 H20" stroke="#C8102E" stroke-width="2.2"/></g>`;
    const tPalm = (x, k, dl) => `<g class="sw" style="transform-origin:${x}px 106px;animation-delay:-${dl}s"><path d="M${x} 106 Q ${x + 5 * k} ${106 - 30 * k} ${x - 3 * k} ${106 - 56 * k}" stroke="#7a5a2b" stroke-width="${(5 * k).toFixed(1)}" fill="none"/>`
      + [[-26, -6, -38, 12], [26, -8, 38, 10], [-16, -20, -34, -16], [16, -22, 34, -14], [2, -24, 4, -26]].map(([a, b, c, d]) => `<path d="M${x - 3 * k} ${106 - 56 * k} q${a * k} ${b * k} ${c * k} ${d * k}" stroke="#2f8a3a" stroke-width="${(6 * k).toFixed(1)}" fill="none" stroke-linecap="round"/>`).join('') + '</g>';
    const fern = (x, y, k, c) => `<g transform="translate(${x} ${y}) scale(${k})">${[-60, -35, -12, 12, 35, 60].map((a) => `<path d="M0 0 q${(a / 4).toFixed(1)} -10 ${(a / 2.2).toFixed(1)} -16" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
    if (vis === 'moon') {
      // lunar module, flag, a hopping astronaut with footprints and a small UFO with a green alien
      const lx = CX;
      // Apollo lunar module: gold-foil descent stage on four legs with round footpads and a ladder,
      // the faceted grey ascent stage with two triangular windows, hatch, docking tunnel, thruster quads and antennas
      svg += `<g class="lm" data-tap="lm"><rect x="${lx - 40}" y="40" width="80" height="68" fill="transparent"/><path class="lmflame" d="M${lx - 6} 95 l6 16 l6 -16z" fill="#ffd27a"/><path class="lmflame" d="M${lx - 3} 95 l3 9 l3 -9z" fill="#fff6d8"/><path d="M${lx - 20} 90 L${lx - 34} 104 M${lx + 20} 90 L${lx + 34} 104 M${lx - 20} 84 L${lx - 30} 100 M${lx + 20} 84 L${lx + 30} 100" stroke="#b8bec6" stroke-width="1.6"/>`
        + `<path d="M${lx - 12} 92 L${lx - 16} 106 M${lx + 12} 92 L${lx + 16} 106" stroke="#a9b0b9" stroke-width="1.6"/>`
        + [[-34, 104], [34, 104], [-16, 106.4], [16, 106.4]].map(([a, b]) => `<ellipse cx="${lx + a}" cy="${b}" rx="4.4" ry="1.4" fill="#cdd2d8"/><ellipse cx="${lx + a}" cy="${b - 0.4}" rx="3" ry=".7" fill="#e4e7ec"/>`).join('')
        + `<path d="M${lx - 22} 92 L${lx - 22} 80 L${lx - 16} 76 H${lx + 16} L${lx + 22} 80 V92 L${lx + 16} 95 H${lx - 16}Z" fill="#c9971c"/>`
        + `<path d="M${lx - 16} 76 V95 M${lx + 16} 76 V95" stroke="#8a6410" stroke-width=".8"/><path d="M${lx - 22} 80 L${lx - 16} 82 H${lx + 16} L${lx + 22} 80" stroke="#f1c94a" stroke-width=".8" fill="none"/>`
        + `<rect x="${lx - 14}" y="83" width="9" height="9" fill="#1d1d1f" opacity=".8"/><rect x="${lx + 5}" y="83" width="9" height="9" fill="#e8c35a"/><path d="M${lx - 4} 79 l2 15 M${lx + 2} 78 l-1 16 M${lx + 9} 80 l1 12" stroke="#f6dc84" stroke-width=".7" opacity=".9"/>`
        + `<path d="M${lx - 10} 95 L${lx - 22} 104" stroke="#9aa1aa" stroke-width="1"/><path d="M${lx - 12} 97 l-3 2 M${lx - 14.6} 99 l-3 2 M${lx - 17.2} 101 l-3 2" stroke="#9aa1aa" stroke-width=".8"/><path d="M${lx - 6} 92 h8 v2 h-8z" fill="#b8bec6"/>`
        + `<path d="M${lx - 18} 76 L${lx - 19} 66 L${lx - 12} 58 H${lx - 2} L${lx + 2} 54 H${lx + 12} L${lx + 18} 60 L${lx + 19} 72 L${lx + 15} 76Z" fill="#c4c9d0"/>`
        + `<path d="M${lx - 19} 66 L${lx + 1} 66 L${lx + 2} 76 M${lx + 2} 54 L${lx + 2} 76" stroke="#9aa1aa" stroke-width=".7" fill="none"/><path d="M${lx + 3} 60 H${lx + 17} V71 H${lx + 3}Z" fill="#8f97a2"/><path d="M${lx - 17} 67 H${lx} V75 H${lx - 17}Z" fill="#d9dde2"/>`
        + `<path d="M${lx - 13} 60 L${lx - 6} 60 L${lx - 10} 65Z M${lx - 4} 60 L${lx + 1} 60 L${lx - 1} 65Z" fill="#141a26"/><rect x="${lx - 11}" y="68" width="7" height="7" rx="1" fill="#aab1ba" stroke="#7d858f" stroke-width=".5"/>`
        + `<rect x="${lx - 2}" y="50" width="8" height="4" fill="#b8bec6"/><rect x="${lx - 3}" y="49" width="10" height="1.4" fill="#9aa1aa"/>`
        + [[-20, 63], [19, 63]].map(([a, b]) => `<path d="M${lx + a - 3} ${b} h6 M${lx + a} ${b - 3} v6" stroke="#6f7782" stroke-width="1.2"/><rect x="${lx + a - 1.4}" y="${b - 1.4}" width="2.8" height="2.8" fill="#9aa1aa"/>`).join('')
        + `<path d="M${lx + 12} 56 L${lx + 20} 46" stroke="#b8bec6" stroke-width="1"/><path d="M${lx + 15} 44 a6 6 0 0 1 10 4 l-10 -4z" fill="#e6e9ee" stroke="#9aa1aa" stroke-width=".5"/><path d="M${lx - 8} 58 V48 M${lx - 11} 48 h6" stroke="#b8bec6" stroke-width=".8"/>`;
      svg += `</g>` + Array.from({ length: 14 }, (_, k) => { const a = k < 7 ? -1 : 1; return `<circle class="ldust" cx="${lx + a * (8 + (k % 7) * 3)}" cy="${104 - (k % 3)}" r="${(2 + (k % 3)).toFixed(0)}" fill="#c9cdd3" style="--dx:${a * (30 + (k % 7) * 10)}px;--dy:-${4 + (k % 4) * 3}px"/>`; }).join("") + `<ellipse class="lring" cx="${lx}" cy="105" rx="30" ry="4" fill="none" stroke="#d4d8de" stroke-width="2"/>`;
      const fx = lx + 46;
      svg += `<path d="M${fx} 107 V80" stroke="#d0d4da" stroke-width="1.2"/><ellipse cx="${fx}" cy="107" rx="3" ry=".8" fill="#7f848c"/><path d="M${fx} 81 h12" stroke="#d0d4da" stroke-width=".8"/><rect x="${fx}" y="81" width="12" height="12" fill="#DA291C"/><path d="M${fx + 6} 83.6 v6.8 M${fx + 2.6} 87 h6.8" stroke="#fff" stroke-width="2.2"/>`;
      for (let i = 0; i < 9; i++) svg += `<ellipse cx="${lx - 60 - i * 12}" cy="${108 + (i % 2) * 3}" rx="2" ry="1" fill="#7f848c"/>`;
      const ax = lx - 150;
      svg += `<ellipse class="dust" cx="${ax + 36}" cy="104" rx="10" ry="2" fill="#c9cdd3"/><g class="mjump"><g transform="translate(${ax} 0)"><path d="M-3 104 l-1 -8 M3 104 l1 -8" stroke="#eef1f5" stroke-width="3.4" stroke-linecap="round"/><rect x="-6" y="84" width="12" height="13" rx="3" fill="#eef1f5"/><rect x="-9" y="85" width="5" height="10" rx="1.4" fill="#d0d4da"/><circle cx="0" cy="79" r="6" fill="#eef1f5"/><ellipse cx="1.4" cy="79" rx="4" ry="3.4" fill="#D4A017"/><ellipse cx="0" cy="77.6" rx="1.6" ry="1" fill="#fff6c8" opacity=".8"/><g class="wave2" style="transform-origin:5px 88px"><path d="M5 88 l6 -7" stroke="#eef1f5" stroke-width="2.6" stroke-linecap="round"/><circle cx="11.4" cy="80.4" r="1.6" fill="#eef1f5"/></g><path d="M-5 89 l-3 6" stroke="#eef1f5" stroke-width="2.6" stroke-linecap="round"/><rect x="-2" y="88" width="4" height="3" fill="#B22234"/></g></g>`;
      svg += `<g class="ufo"><g transform="translate(${lx - 260} ${TOP + 30})"><ellipse cx="0" cy="-3" rx="8" ry="7" fill="#bfefff" opacity=".55"/><circle cx="0" cy="-3" r="3.6" fill="#62d65c"/><ellipse cx="-1.4" cy="-3.6" rx="1.1" ry="1.5" fill="#111"/><ellipse cx="1.4" cy="-3.6" rx="1.1" ry="1.5" fill="#111"/><path d="M-1.6 -6.4 l-1.6 -3 M1.6 -6.4 l1.6 -3" stroke="#62d65c" stroke-width=".8"/><circle cx="-3.2" cy="-9.6" r=".9" fill="#62d65c"/><circle cx="3.2" cy="-9.6" r=".9" fill="#62d65c"/>`
        + `<ellipse cx="0" cy="2" rx="17" ry="5" fill="#9aa3ae"/><ellipse cx="0" cy="1" rx="17" ry="2.6" fill="#c3cad3"/>${[-11, -4, 4, 11].map((x, i) => `<circle class="tw" cx="${x}" cy="3.6" r="1.2" fill="${['#FFD24A', '#FF5A7A', '#5CE1E6', '#7CFF8A'][i]}" style="animation-duration:.8s;animation-delay:-${i * 0.2}s"/>`).join('')}<path d="M-6 7 l-10 18 h32 l-10 -18z" fill="#bfefff" opacity=".12"/></g></g>`;
    }
    if (vis === 'titanic') {
      // the Titanic steams to the right – three of her four funnels smoke (the fourth was a dummy).
      // Tap her: night falls, the full moon rises, an iceberg drifts in, she breaks in two and sinks,
      // lifeboats with lanterns row away – then it is day again and she sails on.
      const tx = CX;
      const smokeS = (list) => list.map((fx) => Array.from({ length: 4 }, (_, k) => `<circle class="smk" cx="${tx + fx + 3}" cy="42" r="6" fill="${k % 2 ? '#3a3a3a' : '#5a5a5a'}" style="--dx:${-30 - wind}px;animation-delay:-${k}s;animation-duration:4s"/>`).join('')).join('');
      const body = `<g class="shipb"><path d="M${tx - 140} 84 h262 l18 -6 l-8 22 h-266z" fill="#1d1d1f"/><path d="M${tx - 134} 98 h258 l-2 4 h-254z" fill="#9b2b22"/><path d="M${tx - 132} 84 h246" stroke="#f1ebdd" stroke-width="1.6"/>`
        + Array.from({ length: 34 }, (_, i) => `<circle cx="${tx - 126 + i * 7.4}" cy="89" r=".8" fill="#e8d9a8"/>`).join('')
        + `<rect x="${tx - 100}" y="74" width="196" height="10" fill="#f4f1ea"/><rect x="${tx - 86}" y="68" width="166" height="6" fill="#ece8de"/>` + Array.from({ length: 26 }, (_, i) => `<rect x="${tx - 96 + i * 7.4}" y="77" width="3.4" height="3" fill="#3a3f46"/>`).join('')
        + [-62, -22, 18, 58].map((fx, i) => `<path d="M${tx + fx - 6} 68 l3 -24 h12 l-3 24z" fill="#E8A33D"/><path d="M${tx + fx - 3.2} 44 h12 l-.6 5 h-12z" fill="#1d1d1f"/>`).join('')
        + `<path d="M${tx - 124} 84 l8 -44 M${tx + 120} 84 l-6 -44" stroke="#5a4a3a" stroke-width="1.6"/><path d="M${tx - 116} 40 L${tx - 62} 44 L${tx + 58} 44 L${tx + 114} 40" stroke="#5a4a3a" stroke-width=".5" fill="none"/>`
        + `<path d="M${tx + 128} 100 q10 -2 14 -8" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/><path d="M${tx - 150} 100 q-30 2 -60 0" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/></g>`;
      // big ice floes drifting slowly to the left (the ship passes them)
      [[tx - 430, 102, 1.8], [tx - 300, 110, 1.2], [tx + 250, 108, 1.5], [tx + 430, 100, 2.2], [tx - 560, 94, 1], [tx + 560, 112, 1.4]].forEach(([x, y, k], i) => {
        svg += `<g class="floe2" style="animation-delay:-${(i * 7).toFixed(0)}s"><path d="M${x - 14 * k} ${y} l${4 * k} ${-3.4 * k} l${8 * k} ${-1 * k} l${10 * k} ${0.6 * k} l${6 * k} ${3.8 * k} l${-4 * k} ${2.6 * k} h${-20 * k}z" fill="#f4fbff"/><path d="M${x - 14 * k} ${y} l${2 * k} ${2.6 * k} h${20 * k} l${4 * k} ${-2.6 * k}" fill="#bfe3f7"/><path d="M${x - 6 * k} ${y - 2.6 * k} h${9 * k}" stroke="#dff2fb" stroke-width=".8"/></g>`; });
      // night falls (only during the story)
      svg += `<rect class="tnight" x="0" y="0" width="${W}" height="${H}" fill="#070c22"/>`
        + `<g class="tsky">${Array.from({ length: 36 }, () => `<circle cx="${(r() * W).toFixed(0)}" cy="${(TOP + r() * 60).toFixed(0)}" r="${(0.5 + r() * 0.9).toFixed(1)}" fill="#fff"/>`).join('')}<circle cx="${610 - dx}" cy="28" r="26" fill="#fff8d8" opacity=".18"/><circle cx="${610 - dx}" cy="28" r="15" fill="#fbf6e0"/><circle cx="${606 - dx}" cy="24" r="3" fill="#e8e1c4"/><circle cx="${615 - dx}" cy="32" r="2.2" fill="#e8e1c4"/></g>`;
      // the ship in two halves (stern | bow), cut at the waterline, so she can break and sink
      svg += `<clipPath id="fpst"><rect x="${tx - 260}" y="-60" width="252" height="162"/></clipPath><clipPath id="fpbw"><rect x="${tx - 8}" y="-60" width="260" height="162"/></clipPath>`
        + `<g class="ship" data-tap="titanic"><rect x="${tx - 150}" y="30" width="300" height="74" fill="transparent"/>`
        + `<g clip-path="url(#fpst)"><g class="stern">${body}${smokeS([-62, -22])}</g></g><g clip-path="url(#fpbw)"><g class="bow">${body}${smokeS([18])}</g></g>`
        + `<path class="bowsplash" d="M${tx + 130} 100 q8 -4 12 -10 M${tx + 134} 101 q10 -2 16 -6" stroke="#fff" stroke-width="1.6" fill="none" opacity=".85"/>`
        + `<path class="bowsplash" d="M${tx - 140} 101 q-40 3 -90 0 M${tx - 140} 103 q-50 5 -110 4" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/></g>`;
      // the iceberg drifts in from the right and hits the bow
      svg += `<g class="tice"><path d="M${tx + 150} 104 l6 -26 l10 -14 l8 6 l10 -22 l12 18 l6 -6 l14 26 l6 18z" fill="#eaf6fc"/><path d="M${tx + 166} 64 l8 6 l10 -22 l4 30 l-10 26 h-26z" fill="#c4e2f1"/><path d="M${tx + 150} 104 h72 l-6 6 h-60z" fill="#9fcbe2" opacity=".8"/></g>`;
      svg += `<g class="tflash"><circle cx="${tx + 146}" cy="90" r="10" fill="#fff" opacity=".8"/>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M${tx + 146} 90 l${(Math.cos(a * Math.PI / 180) * 16).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 16).toFixed(1)}" stroke="#fff" stroke-width="1.4"/>`).join('')}</g>`;
      // bubbles while she goes down
      svg += `<g class="sbub">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${tx - 30 + i * 12}" cy="98" r="${1.4 + (i % 2)}" fill="none" stroke="#e6f6ff" stroke-width=".6" class="bub2" style="animation-delay:-${i * 0.4}s"/>`).join('')}</g>`;
      // lifeboats with lanterns row away to the left
      svg += `<g class="tboats">${[[-30, 0], [6, 2], [40, -1]].map(([d, y]) => `<g transform="translate(${tx + d} ${100 + y})"><path d="M-9 0 h18 l-3 4 h-12z" fill="#f4f1ea"/><path d="M-9 0 h18" stroke="#8a6a3e" stroke-width="1"/><circle cx="-3" cy="-2.6" r="1.6" fill="#E3B48A"/><circle cx="3" cy="-2.6" r="1.6" fill="#E3B48A"/><path d="M6 0 v-8" stroke="#5a4a3a" stroke-width=".8"/><circle cx="6" cy="-9" r="4" fill="#FFD86B" opacity=".35" class="glw"/><rect x="5" y="-10" width="2.2" height="2.6" fill="#FFD86B"/></g>`).join('')}</g>`;
      for (let i = 0; i < 4; i++) svg += `<g class="fly" style="animation-duration:${24 + i * 6}s;animation-delay:-${i * 7}s"><path d="M0 ${TOP + 20 + i * 8} q4 -4 8 0 q4 -4 8 0" stroke="#f2f2f2" stroke-width="1.4" fill="none"/></g>`;
      svg += `<g class="dolph" style="transform-origin:${tx + 250}px 96px"><path d="M${tx + 240} 92 q8 -10 18 -4 l4 -4 -1 6 q-8 4 -21 2z" fill="#5f7f99"/></g>`;
    }
    if (vis === 'dino') {
      // a green jungle with a river, ferns, palms, dinosaurs and pterosaurs; a small volcano smokes far away
      svg += `<path d="M120 84 l40 -36 l14 0 l40 36z" fill="#5d4a3f"/><path d="M160 48 h14 l-3 6 h-8z" fill="#ff8a3c" opacity=".8"/>` + smoke({ smoke: true, wind }, 167, 44);
      svg += `<path d="M0 96 C 80 74 160 82 240 76 C 320 70 420 84 520 74 C 640 66 760 80 880 72 C 980 66 1100 82 1200 90 V100 H0Z" fill="#2f6f2a"/>`;
      for (let i = 0; i < 18; i++) { const x = i * 70 + r() * 30; svg += `<ellipse cx="${x.toFixed(0)}" cy="${(80 + r() * 8).toFixed(0)}" rx="${(22 + r() * 16).toFixed(0)}" ry="${(12 + r() * 6).toFixed(0)}" fill="${['#2c6a28', '#3b7f30', '#255f24'][i % 3]}"/>`; }
      svg += `<path d="M0 110 C 160 104 300 116 480 108 C 640 102 800 116 960 108 C 1060 104 1140 110 1200 108 V114 C 1140 116 1060 110 960 114 C 800 122 640 108 480 114 C 300 122 160 110 0 116Z" fill="#3a9ad0"/>`;
      svg += [80, 330, 1010, 1150].map((x, i) => tPalm(x, 0.9 + (i % 2) * 0.2, i)).join('') + [[40, 108], [210, 106], [450, 110], [820, 106], [950, 110], [1100, 106]].map(([x, y], i) => fern(x, y, 1 + (i % 3) * 0.2, i % 2 ? '#3f9a36' : '#2f8a2a')).join('');
      // brachiosaurus in the middle, nodding its long neck
      const bx = CX;
      svg += `<path d="M${bx - 30} 98 q-40 4 -62 -6 q30 2 50 -6z" fill="#6f9f5a"/><path d="M${bx - 22} 104 v-10 M${bx - 10} 106 v-10 M${bx + 14} 104 v-10 M${bx + 26} 106 v-10" stroke="#5f8f4a" stroke-width="7" stroke-linecap="round"/><ellipse cx="${bx}" cy="88" rx="36" ry="15" fill="#7fae6a"/>`
        + `<circle cx="${bx - 10}" cy="82" r="3" fill="#6f9f5a"/><circle cx="${bx + 8}" cy="86" r="2.4" fill="#6f9f5a"/><g class="nod" style="transform-origin:${bx + 26}px 80px;animation-duration:5s"><path d="M${bx + 22} 84 Q ${bx + 46} 64 ${bx + 44} 34" stroke="#7fae6a" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="${bx + 50}" cy="32" rx="9" ry="5" fill="#7fae6a"/><circle cx="${bx + 52}" cy="30" r="1.2" fill="#1d1d1d"/><path d="M${bx + 55} 34 q2 1 4 0" stroke="#3a5a2a" stroke-width=".8" fill="none"/></g>`;
      // triceratops grazing
      const tr = CX - 220;
      svg += `<g class="nod" style="transform-origin:${tr + 14}px 100px;animation-duration:4s"><ellipse cx="${tr}" cy="100" rx="17" ry="8" fill="#c27a3a"/><path d="M${tr - 10} 106 v5 M${tr - 2} 107 v5 M${tr + 6} 107 v5 M${tr + 12} 106 v5" stroke="#a8622a" stroke-width="4" stroke-linecap="round"/><path d="M${tr + 12} 92 q12 -6 12 8 q-6 4 -12 2z" fill="#e0a05a"/><ellipse cx="${tr + 22}" cy="102" rx="6" ry="4" fill="#c27a3a"/><path d="M${tr + 22} 98 l8 -6 M${tr + 18} 96 l6 -8 M${tr + 27} 101 l5 -1" stroke="#f3ead6" stroke-width="1.4" stroke-linecap="round"/><circle cx="${tr + 22}" cy="100" r=".9" fill="#1d1d1d"/><path d="M${tr - 17} 100 l-8 -2" stroke="#c27a3a" stroke-width="3" stroke-linecap="round"/></g>`;
      // T. rex walking along the river bank
      svg += `<g class="fly" style="animation-duration:46s"><g class="step" style="animation-duration:.6s"><g transform="translate(0 0)"><path d="M-22 92 q-14 2 -22 -4 q12 0 18 -6z" fill="#8a6f4a"/><ellipse cx="-4" cy="88" rx="16" ry="9" fill="#9a7f52"/><path d="M-8 96 l-2 10 M2 96 l3 10" stroke="#8a6f4a" stroke-width="4" stroke-linecap="round"/><path d="M6 82 q8 -14 16 -10 q4 4 0 8 q-6 4 -14 6z" fill="#9a7f52"/><path d="M12 82 h9" stroke="#5a4a32" stroke-width=".8"/><path d="M13 82 l1 2 1 -2 1 2 1 -2 1 2" stroke="#fff" stroke-width=".6" fill="none"/><circle cx="16" cy="76" r="1" fill="#1d1d1d"/><path d="M8 90 l4 3 M10 88 l4 2" stroke="#8a6f4a" stroke-width="1.6"/></g></g></g>`;
      // pterosaurs gliding, flapping
      [[0, 22], [14, 38]].forEach(([dl, y]) => { svg += `<g class="fly" style="animation-duration:32s;animation-delay:-${dl}s"><g transform="translate(0 ${TOP + y})"><g class="flap"><path d="M0 0 l-14 -8 l6 9z M0 0 l14 -8 l-6 9z" fill="#a0603a"/></g><path d="M-2 0 h6 l5 -1 -5 2z" fill="#8a4f2e"/><path d="M-3 -1 l-4 -2" stroke="#8a4f2e" stroke-width="1"/></g></g>`; });
      svg += `<ellipse cx="${CX + 190}" cy="110" rx="12" ry="4" fill="#8a6a3a"/>${[-6, 0, 6].map((d) => `<ellipse cx="${CX + 190 + d}" cy="107" rx="3" ry="4" fill="#f1ebdd"/>`).join('')}`;
    }
    if (vis === 'volcano') {
      // a volcano where the house stands: lava fountain, glowing flows, a big plume, palms and black sand
      const vx = CX;
      svg += `<path d="M${vx - 170} 106 C ${vx - 120} 96 ${vx - 50} 60 ${vx - 26} 38 H${vx + 26} C ${vx + 50} 60 ${vx + 120} 96 ${vx + 170} 106Z" fill="#5a4034"/><path d="M${vx - 26} 38 H${vx + 26} C ${vx + 40} 52 ${vx + 70} 80 ${vx + 120} 100 C ${vx + 60} 96 ${vx + 20} 70 ${vx} 50Z" fill="#4a3329"/>`
        + `<ellipse cx="${vx}" cy="39" rx="26" ry="4" fill="#ff7a1a"/><ellipse cx="${vx}" cy="39" rx="30" ry="9" fill="#ff8a3c" opacity=".35" class="glw" style="animation-duration:1.4s"/>`
        + `<path d="M${vx - 10} 40 C ${vx - 18} 58 ${vx - 40} 72 ${vx - 52} 96 C ${vx - 46} 100 ${vx - 40} 98 ${vx - 38} 92 C ${vx - 30} 74 ${vx - 12} 58 ${vx - 4} 42z" fill="#ff6a1a" class="glw" style="animation-duration:2s"/>`
        + `<path d="M${vx + 8} 40 C ${vx + 20} 60 ${vx + 26} 80 ${vx + 44} 102 C ${vx + 50} 104 ${vx + 54} 100 ${vx + 50} 96 C ${vx + 34} 78 ${vx + 22} 58 ${vx + 14} 40z" fill="#ffb02e" class="glw" style="animation-duration:2.6s;animation-delay:-.7s"/>`;
      for (let i = 0; i < 14; i++) { const a = (r() - 0.5) * 120; svg += `<circle class="lava" cx="${vx + (r() - 0.5) * 20}" cy="38" r="${(1.6 + r() * 2).toFixed(1)}" fill="${['#ffd23a', '#ff8a1a', '#ff5a1a'][i % 3]}" style="--lx:${a.toFixed(0)}px;--ly:-${(30 + r() * 26).toFixed(0)}px;animation-delay:-${(r() * 2.4).toFixed(2)}s;animation-duration:${(1.8 + r()).toFixed(1)}s"/>`; }
      for (let k = 0; k < 6; k++) svg += `<circle class="plume" cx="${vx + (k % 3 - 1) * 8}" cy="30" r="${10 + (k % 3) * 4}" fill="${k % 2 ? '#5a5250' : '#77706c'}" style="--dx:${-20 - wind}px;animation-delay:-${k * 1.2}s"/>`;
      for (let i = 0; i < 20; i++) svg += `<circle class="fl" cx="${(r() * W).toFixed(0)}" cy="0" r="${(0.6 + r() * 0.8).toFixed(1)}" fill="#6a6260" opacity=".7" style="--dx:${(-10 - wind).toFixed(0)}px;animation-duration:${(7 + r() * 5).toFixed(1)}s;animation-delay:-${(r() * 10).toFixed(1)}s"/>`;
      svg += [80, 240, 1000, 1140].map((x, i) => tPalm(x, 0.9 + (i % 2) * 0.15, i)).join('') + [[vx - 120, 110], [vx + 140, 108], [vx - 200, 112]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#2b2522"/><ellipse cx="${x}" cy="${y - 1}" rx="3" ry="1.4" fill="#ff6a1a" class="glw" style="animation-duration:1.6s"/>`).join('');
      svg += [[vx - 300, 110], [vx + 260, 108], [vx + 340, 112]].map(([x, y], i) => fern(x, y, 0.9, i % 2 ? '#4f8a36' : '#3f7a2e')).join('');
    }
    if (vis === 'mobile') {
      // 3 April 1973, New York: Martin Cooper calls from the street with the first mobile phone
      // skyline in the back, a radio mast sends to the giant phone, the caller with his brick phone, a yellow cab
      for (let i = 0; i < 26; i++) { const x = i * 48 + (i % 3) * 8; const h = 22 + ((i * 37) % 30); svg += `<rect x="${x}" y="${96 - h}" width="${30 + (i % 4) * 6}" height="${h + 2}" fill="${['#8b97a8', '#9aa6b6', '#7d899a'][i % 3]}" opacity=".55"/>`; }
      svg += `<path d="M${CX - 420} 96 V40 M${CX - 410} 96 V40 M${CX - 420} 52 l10 8 M${CX - 410} 52 l-10 8 M${CX - 420} 68 l10 8 M${CX - 410} 68 l-10 8 M${CX - 420} 84 l10 8 M${CX - 410} 84 l-10 8" stroke="#6b7480" stroke-width="1.2"/><path d="M${CX - 415} 40 V30" stroke="#6b7480" stroke-width="1.6"/><circle class="tw" cx="${CX - 415}" cy="29" r="1.8" fill="#E5483B" style="animation-duration:1s"/>`
        + [0, 1, 2].map((i) => `<path class="sig2" d="M${CX - 405} 26 q8 6 0 12" stroke="#3E8EDE" stroke-width="1.4" fill="none" style="animation-delay:-${i * 0.6}s"/>`).join('');
      // the giant DynaTAC
      const px = CX;
      svg += `<path d="M${px - 13} 104 V50 q0 -6 6 -6 h14 q6 0 6 6 V104z" fill="#d9d3c5" stroke="#a9a293" stroke-width="1"/><path d="M${px - 13} 60 V50 q0 -6 6 -6 h14 q6 0 6 6 V60z" fill="#3f4045"/>`
        + Array.from({ length: 3 }, (_, r2) => Array.from({ length: 5 }, (_, c) => `<circle cx="${px - 6 + c * 3}" cy="${49 + r2 * 3}" r=".7" fill="#1d1d1f"/>`).join('')).join('')
        + `<path d="M${px + 6} 44 V22" stroke="#2b2b2f" stroke-width="4.4" stroke-linecap="round"/><rect x="${px + 3.6}" y="30" width="4.8" height="2" fill="#555"/>`
        + `<rect x="${px - 10}" y="63" width="20" height="8" rx="1" fill="#120c0c"/><text x="${px}" y="69.4" text-anchor="middle" font-size="5.6" font-family="monospace" font-weight="700" fill="#ff3b30" class="tw" style="animation-duration:2.4s">1973</text>`
        + Array.from({ length: 15 }, (_, i) => `<rect x="${px - 10 + (i % 3) * 7.2}" y="${74 + Math.floor(i / 3) * 5.6}" width="5.4" height="4" rx="1" fill="${i === 12 ? '#3FA66B' : i === 14 ? '#E5483B' : '#efe9dc'}" stroke="#b9b2a2" stroke-width=".4"/>`).join('')
        + `<path d="M${px - 6} 102 h12" stroke="#a9a293" stroke-width="1.2"/>`
        + [0, 1, 2].map((i) => `<path class="sig" d="M${px + 1} 17 a7 7 0 0 1 10 0" stroke="#3E8EDE" stroke-width="1.6" fill="none" style="transform-origin:${px + 6}px 21px;animation-delay:-${i * 0.7}s"/>`).join('')
        + `<g class="pop1"><path d="M${px + 24} 34 h40 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-30 l-6 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4z" fill="#fff"/><text x="${px + 44}" y="46" text-anchor="middle" font-size="8" font-weight="700" font-family="system-ui,sans-serif" fill="#2b2b2b">${lang === 'en' ? 'Hello?' : 'Hallo?'}</text></g>`;
      // the caller in a 70s suit, the brick phone at his ear, walking up and down
      const cx2 = CX - 110;
      svg += `<g class="pace"><g transform="translate(${cx2} 0)"><path d="M-3 108 l-1 -12 M3 108 l1 -12" stroke="#4a3b2e" stroke-width="3" stroke-linecap="round"/><path d="M-6 98 l1 -16 h10 l1 16z" fill="#8a6a3e"/><path d="M-1.4 82 l1.4 6 1.4 -6z" fill="#f4efe4"/><path d="M0 84 v8" stroke="#c0392b" stroke-width="1.2"/>`
        + `<circle cx="0" cy="76" r="4.6" fill="#E3B48A"/><path d="M-4.6 75 q0 -6 4.6 -6 q5 0 4.6 6 q-2 -3 -4.6 -3 q-2.6 0 -4.6 3z" fill="#6b4a2e"/><path d="M-3.4 72.6 q3 -1.4 6 0" stroke="#4a3220" stroke-width=".8" fill="none"/><circle cx="-1.4" cy="76.4" r=".6" fill="#2b2b2b"/>`
        + `<path d="M4 84 l3 -6" stroke="#8a6a3e" stroke-width="2.6" stroke-linecap="round"/><rect x="4" y="68" width="4" height="11" rx="1" fill="#d9d3c5" transform="rotate(14 6 73)"/><path d="M7 68 v-4" stroke="#2b2b2f" stroke-width="1.2" transform="rotate(14 6 73)"/><path d="M-5 86 l-3 8" stroke="#8a6a3e" stroke-width="2.6" stroke-linecap="round"/></g></g>`;
      // kids with a tin-can telephone, a phone box and a yellow cab
      const k1 = CX - 300; const k2 = CX - 220;
      const kid2 = (x, shirt, hair, flip) => `<g transform="translate(${x} 0) scale(${flip ? -1 : 1} 1)"><path d="M-2 106 l-1 -9 M2 106 l1 -9" stroke="#34495e" stroke-width="2.6" stroke-linecap="round"/><rect x="-4.5" y="85" width="9" height="13" rx="3" fill="${shirt}"/><circle cx="0" cy="80" r="5" fill="#F3CDA6"/><path d="M-5 79 q5 -9 10 0z" fill="${hair}"/><path d="M3 88 l5 -6" stroke="${shirt}" stroke-width="2.4" stroke-linecap="round"/><rect x="6" y="78" width="4" height="5" rx="1" fill="#c9ced6"/></g>`;
      svg += kid2(k1, '#E5483B', '#6b4a2e', false) + kid2(k2, '#3E8EDE', '#D4A63B', true) + `<path d="M${k1 + 10} 80 Q ${(k1 + k2) / 2} 88 ${k2 - 10} 80" stroke="#d9c9a0" stroke-width=".7" fill="none"/>`;
      svg += `<rect x="${CX + 120}" y="62" width="22" height="46" rx="1" fill="#C0392B"/><rect x="${CX + 123}" y="68" width="16" height="32" fill="#bfe0ff" opacity=".85"/><rect x="${CX + 118}" y="58" width="26" height="5" rx="1" fill="#962d22"/><rect x="${CX + 129}" y="76" width="6" height="8" rx="1" fill="#3a3a3f"/><path d="M${CX + 132} 84 q-3 4 -1 8" stroke="#2b2b2b" stroke-width=".8" fill="none"/>`;
      svg += `<g class="fly" style="animation-duration:26s"><g transform="translate(0 0)"><path d="M-46 106 v-8 q2 -4 8 -5 l6 -7 h20 l8 7 q6 1 6 5 v8z" fill="#F5C542"/><path d="M-36 93 l5 -6 h8 v6z M-20 93 v-6 h6 l6 6z" fill="#bfe0ff"/><rect x="-30" y="83" width="10" height="3" fill="#2b2b2b"/><path d="M-46 100 h48" stroke="#2b2b2b" stroke-width="1" stroke-dasharray="2 2"/><circle cx="-36" cy="106" r="4" fill="#1d1d1d"/><circle cx="-6" cy="106" r="4" fill="#1d1d1d"/></g></g>`;
    }
    if (vis === 'uk') {
      // British Day: Buckingham Palace instead of the house, guards in their sentry boxes, a few Union Jacks
      const bx = CX;
      svg += `<rect x="${bx - 150}" y="56" width="300" height="50" fill="#ddd4c2"/><rect x="${bx - 154}" y="52" width="308" height="5" fill="#cbc1ad"/>` + Array.from({ length: 31 }, (_, i) => `<rect x="${bx - 150 + i * 10}" y="49" width="4" height="4" fill="#cbc1ad"/>`).join('')
        + [60, 74, 88].map((y) => Array.from({ length: 19 }, (_, i) => { const x = bx - 142 + i * 15.6; return Math.abs(x + 3 - bx) < 42 ? '' : `<rect x="${x.toFixed(1)}" y="${y}" width="6" height="${y === 88 ? 11 : 9}" fill="#5a6470"/>`; }).join('')).join('')
        + `<path d="M${bx - 44} 56 L${bx} 38 L${bx + 44} 56z" fill="#e6dece"/><path d="M${bx - 44} 56 L${bx} 38 L${bx + 44} 56" fill="none" stroke="#cbc1ad" stroke-width="2"/><circle cx="${bx}" cy="48" r="3.4" fill="#d4a017"/>`
        + [-36, -22, -8, 8, 22, 36].map((d) => `<rect x="${bx + d - 2.4}" y="58" width="4.8" height="40" fill="#efe8da"/>`).join('') + `<rect x="${bx - 40}" y="68" width="80" height="3" fill="#cbc1ad"/><rect x="${bx - 14}" y="62" width="28" height="6" fill="#B71C1C"/>`
        + `<path d="M${bx} 38 V18" stroke="#8a8f96" stroke-width="1.2"/><g class="sw" style="transform-origin:${bx}px 19px">${ujack(bx, 19, 0.9)}</g>`
        + `<path d="M${bx - 160} 106 H${bx + 160}" stroke="#1d1d1d" stroke-width="2"/>` + Array.from({ length: 41 }, (_, i) => `<path d="M${bx - 160 + i * 8} 106 v-10" stroke="#1d1d1d" stroke-width="1.2"/><circle cx="${bx - 160 + i * 8}" cy="95.4" r="1.1" fill="#d4a017"/>`).join('')
        + `<rect x="${bx - 14}" y="92" width="28" height="14" fill="none" stroke="#d4a017" stroke-width="1.2"/><circle cx="${bx}" cy="96" r="3" fill="#d4a017"/>`;
      const box = (x) => `<path d="M${x - 9} 108 V76 h18 v32z" fill="#1f2730"/><path d="M${x - 11} 76 L${x} 66 L${x + 11} 76z" fill="#2c3540"/><circle cx="${x}" cy="72" r="1.6" fill="#d4a017"/><rect x="${x - 6}" y="79" width="12" height="29" fill="#0f141a"/>`;
      const guard = (x, dl) => `<g class="grd" style="animation-delay:-${dl}s"><path d="M${x - 2} 108 v-10 M${x + 2} 108 v-10" stroke="#111" stroke-width="2.6"/><rect x="${x - 4.4}" y="86" width="8.8" height="13" rx="1.6" fill="#C8102E"/><path d="M${x - 4.4} 90 h8.8 M${x - 4.4} 94 h8.8" stroke="#f5f5f5" stroke-width=".6"/><path d="M${x} 86 v13" stroke="#d4a017" stroke-width=".7" stroke-dasharray="1 2"/><circle cx="${x}" cy="82.4" r="3.2" fill="#F3CDA6"/><path d="M${x - 4} 82 q-1 -16 4 -16 q5 0 4 16z" fill="#111"/><path d="M${x + 5} 98 V78" stroke="#555" stroke-width="1.2"/><path d="M${x + 5} 78 v-3" stroke="#bbb" stroke-width=".8"/></g>`;
      svg += box(bx - 186) + guard(bx - 186, 0) + box(bx + 186) + guard(bx + 186, 4);
      svg += [[bx - 330, 52], [bx + 320, 54]].map(([x, y]) => `<path d="M${x} 108 V${y}" stroke="#8a8f96" stroke-width="1.4"/><g class="sw" style="transform-origin:${x}px ${y}px">${ujack(x, y, 0.8)}</g>`).join('');
      svg += `<rect x="${bx - 260}" y="82" width="12" height="26" fill="#C8102E"/><path d="M${bx - 261} 82 q7 -6 14 0z" fill="#C8102E"/>` + [0, 1, 2, 3].map((k) => `<path d="M${bx - 258} ${86 + k * 4.6} h8 M${bx - 254} ${86 + k * 4.6} v3.6" stroke="#f3e3a8" stroke-width=".7"/>`).join('');
      // bunting in red, white and blue along the top
      for (let x0 = 0; x0 < W; x0 += 200) svg += `<path d="M${x0} ${TOP + 3} Q ${x0 + 100} ${TOP + 26} ${x0 + 200} ${TOP + 3}" stroke="#8a8f96" stroke-width=".8" fill="none"/>`;
      for (let x = 6; x < W - 8; x += 16) { const t = (x % 200) / 200; const y = TOP + 3 + 46 * t * (1 - t); svg += `<g class="sw" style="transform-origin:${x + 5}px ${y.toFixed(1)}px;animation-delay:-${(r() * 3).toFixed(1)}s"><path d="M${x} ${y.toFixed(1)} h10 l-5 11z" fill="${['#C8102E', '#ffffff', '#012169'][(x / 16 | 0) % 3]}"/></g>`; }
      // flower beds in front of the railings: red geraniums, white and blue flowers
      for (let i = 0; i < 60; i++) { const x = CX - 300 + i * 10 + r() * 4; if (Math.abs(x - CX) < 165) continue; const y = 108 + r() * 6; svg += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(1)}" r="2.2" fill="${['#C8102E', '#ffffff', '#2a52be'][i % 3]}"/>`; }
      svg += `<path d="M${CX - 160} 113 H${CX + 160}" stroke="#4f8a3a" stroke-width="5"/>` + Array.from({ length: 32 }, (_, i) => `<circle cx="${CX - 155 + i * 10}" cy="111" r="2" fill="${['#C8102E', '#ffffff', '#2a52be'][i % 3]}"/>`).join('');
      svg += `<rect x="${CX + 250}" y="92" width="8" height="16" rx="1.6" fill="#C8102E"/><rect x="${CX + 249}" y="90" width="10" height="3" rx="1.4" fill="#a00d24"/><rect x="${CX + 251.6}" y="96" width="4.8" height="1.2" fill="#1d1d1d"/>`;
    }
    if (vis === 'april') {
      // April Fools' Day: the famous spaghetti harvest, a flying pig, an April fish on the house and the sun in sunglasses
      const sp = (x, sc) => `<g transform="translate(${x} 106) scale(${sc})"><path d="M0 0 v-34 M0 -24 l-10 -10 M0 -28 l10 -9" stroke="#7a5233" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="0" cy="-42" rx="22" ry="12" fill="#5fae46"/>${Array.from({ length: 16 }, (_, i) => { const xx = -19 + i * 2.5; return `<path d="M${xx.toFixed(1)} ${-36 + (i % 3)} q2 4 0 8 q-2 4 0 ${6 + (i % 4) * 2}" stroke="#F0D27A" stroke-width="1.1" fill="none" class="sw" style="transform-origin:${xx.toFixed(1)}px -36px;animation-delay:-${(i % 5) * 0.4}s"/>`; }).join('')}</g>`;
      svg += sp(CX - 250, 1) + sp(CX + 250, 0.9) + sp(CX - 380, 0.8);
      const fx = CX - 290;
      svg += `<path d="M${fx - 8} 106 l6 -30 M${fx + 2} 106 l6 -30" stroke="#a87a4a" stroke-width="1.4"/>` + [0, 1, 2, 3, 4].map((k) => `<path d="M${fx - 7 + k * 1.2} ${101 - k * 6} h10" stroke="#a87a4a" stroke-width="1"/>`).join('')
        + `<g class="wave2" style="transform-origin:${fx + 6}px 80px"><path d="M${fx + 6} 80 l8 -6" stroke="#3E8EDE" stroke-width="2.4" stroke-linecap="round"/></g><rect x="${fx}" y="78" width="9" height="12" rx="2" fill="#3E8EDE"/><circle cx="${fx + 4.5}" cy="73" r="4.4" fill="#F3CDA6"/><path d="M${fx - 1} 71 h11 l-2 -4 h-7z" fill="#d9b25a"/><path d="M${fx + 9} 98 q6 0 10 -4 h-14z" fill="#b8905a"/><path d="M${fx + 10} 95 q4 -3 8 0" stroke="#F0D27A" stroke-width="1" fill="none"/>`;
      svg += `<g class="fly" style="animation-duration:28s"><g transform="translate(0 ${TOP + 26})"><ellipse cx="0" cy="0" rx="10" ry="6.4" fill="#FFB3C7"/><circle cx="9" cy="-2" r="4.6" fill="#FFB3C7"/><ellipse cx="12.4" cy="-1" rx="2" ry="1.6" fill="#FF8FB0"/><circle cx="9" cy="-4" r=".7" fill="#2b2b2b"/><path d="M-10 -1 q-4 -3 -1 -5" stroke="#FF8FB0" stroke-width="1" fill="none"/><path d="M-4 5 v3 M4 5 v3" stroke="#FF9DB8" stroke-width="2" stroke-linecap="round"/><g class="flap"><path d="M-2 -5 q-6 -12 -14 -8 q6 2 8 9z" fill="#fff" stroke="#ddd" stroke-width=".4"/></g><g class="flap" style="animation-delay:-.1s"><path d="M2 -5 q4 -12 12 -10 q-4 3 -6 10z" fill="#fff" stroke="#ddd" stroke-width=".4"/></g></g></g>`;
      svg += `<g class="sw" style="transform-origin:${CX - 40}px 72px"><path d="M${CX - 46} 76 q6 -8 14 -2 l5 -4 v10 l-5 -4 q-8 6 -14 0z" fill="#5CE1E6" stroke="#2a9aa8" stroke-width=".6"/><circle cx="${CX - 41}" cy="74" r=".9" fill="#1d1d1d"/><rect x="${CX - 48}" y="70" width="6" height="2" fill="#f1ebdd" transform="rotate(-20 ${CX - 45} 71)"/></g>`;
      if (!night && ['sunny', 'partlycloudy', 'windy'].includes(kind) && !glowSun) svg += `<g transform="translate(${hasHouse ? 610 - dx : 610} 28)"><rect x="-12" y="-5" width="10" height="6" rx="2" fill="#1d1d1d"/><rect x="2" y="-5" width="10" height="6" rx="2" fill="#1d1d1d"/><path d="M-2 -3 h4 M-12 -3 l-6 -2 M12 -3 l6 -2" stroke="#1d1d1d" stroke-width="1.2"/><path d="M-6 6 q6 5 12 0" stroke="#c97a00" stroke-width="1.4" fill="none"/></g>`;
    }
    // a little lizard scurries over the ground on warm days
    if (!night && (['vatertag', 'volcano', 'dino'].includes(vis) || (temp != null && temp >= 20 && ['alltag', 'fruehling', 'herbst', 'april', 'uk', 'mobile'].includes(vis)))) {
      const lz = CX - 430;
      svg += `<g class="liz"><g transform="translate(${lz} 113)"><path d="M-10 0 q-6 2 -10 -1" stroke="#5f9a3a" stroke-width="1.6" fill="none" stroke-linecap="round" class="tail"/><ellipse cx="0" cy="0" rx="8" ry="2.2" fill="#6aa84f"/><ellipse cx="9" cy="-.4" rx="3" ry="2" fill="#6aa84f"/><circle cx="10" cy="-1" r=".5" fill="#1d1d1d"/><path d="M-5 1 l-2 3 M-5 -1 l-2 -3 M4 1 l2 3 M4 -1 l2 -3" stroke="#5f9a3a" stroke-width="1.1" class="lzleg"/><path d="M-6 0 h12" stroke="#4f8a2e" stroke-width=".5" stroke-dasharray="1 1.4"/></g></g>`;
    }
    svg += `</g><use href="#fps" x="${W}"/><use href="#fps" x="${-W}"/></g>`;
    // sky visitors on special days: Sputnik at night (4–11 October), Concorde by day (26 November)
    if (fun && fun.key === 'sputnik' && night) svg += `<g class="sput"><g transform="translate(0 ${TOP + 8})"><path d="M-1.6 -.8 l-15 -3 M-1.6 -.3 l-16 -.8 M-1.6 .3 l-16 .8 M-1.6 .8 l-15 3" stroke="#c9ced6" stroke-width=".5"/><circle cx="0" cy="0" r="2.4" fill="#d9dee6"/><circle cx="-.6" cy="-.7" r=".8" fill="#fff"/><circle class="tw" cx="0" cy="0" r="4" fill="#fff" opacity=".35" style="animation-duration:1.2s"/></g></g>`;
    if (fun && fun.key === 'concorde' && !night) svg += `<g class="conc"><g transform="translate(0 ${TOP + 22})"><path d="M-110 2 h64" stroke="#fff" stroke-width="2.2" opacity=".5" stroke-linecap="round"/><path d="M-110 4.6 h60" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>`
      + `<path d="M-44 4 Q -16 3 8 4 Q -10 7 -36 9 Z" fill="#dfe5ec"/><rect x="-34" y="6" width="16" height="3" rx="1" fill="#c9d1db"/><path d="M-34 9 h16" stroke="#9fb0c2" stroke-width=".6"/>`
      + `<path d="M-48 0.8 Q -46 -1.4 -40 -1.2 L 34 -0.8 Q 42 -0.4 46 1.6 L 52 3.6 L 44 3.2 Q 40 3.4 34 3.4 L -40 3.4 Q -46 3.2 -48 0.8Z" fill="#f7f9fb"/><path d="M-40 1.4 h72" stroke="#c9d6e6" stroke-width=".5"/>`
      + Array.from({ length: 12 }, (_, i) => `<rect x="${-30 + i * 5}" y="0" width="1.4" height="1" fill="#6f8aa8"/>`).join('')
      + `<path d="M36 -0.4 q4 .2 6 1.4 l-5 0z" fill="#2b3446"/><path d="M-44 -0.6 L -52 -12 L -47 -12 L -36 -0.8z" fill="#eef2f6"/><path d="M-48 -9 l3 0" stroke="#C8102E" stroke-width="1.2"/><path d="M-50 -11 l3 0" stroke="#012169" stroke-width="1.2"/></g></g>`;
    // ---- weather layer (Christmas: it always snows – the real weather stays in the corner)
    if (!o.still && vis !== 'moon') {
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
  const mumHearts = () => { let g = ''; for (let i = 0; i < 9; i++) { const x = 60 + i * 130 + (i % 2) * 30; const y = 40 + (i % 3) * 18; const k = 0.8 + (i % 3) * 0.3;
    g += `<g class="bob" style="animation-delay:-${(i * 0.4).toFixed(1)}s;animation-duration:${(2.4 + (i % 3) * 0.5).toFixed(1)}s"><path d="M${x} ${(y + 6 * k).toFixed(1)} c${(-7 * k).toFixed(1)} ${(-6 * k).toFixed(1)} ${(-11 * k).toFixed(1)} ${(-12 * k).toFixed(1)} ${(-5 * k).toFixed(1)} ${(-16 * k).toFixed(1)} c${(3 * k).toFixed(1)} ${(-2 * k).toFixed(1)} ${(5 * k).toFixed(1)} 0 ${(5 * k).toFixed(1)} ${(2 * k).toFixed(1)} c0 ${(-2 * k).toFixed(1)} ${(2 * k).toFixed(1)} ${(-4 * k).toFixed(1)} ${(5 * k).toFixed(1)} ${(-2 * k).toFixed(1)} c${(6 * k).toFixed(1)} ${(4 * k).toFixed(1)} ${(2 * k).toFixed(1)} ${(10 * k).toFixed(1)} ${(-5 * k).toFixed(1)} ${(16 * k).toFixed(1)}z" fill="${['#FF6B9B', '#FF8FB3', '#E5483B'][i % 3]}"/></g>`; }
    return g + emo(380, 106, '💐', 24); };
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
    add('poolabend', poolOk && t >= 24 && dryEve && hh >= 16 && hh < 21 && m >= 5 && m <= 9, 2);
    add('poolparty', poolOk && weekend && t >= 27 && dryDay && hh >= 8 && hh < 21, 2);
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
  // a tap on the free scene (the header passes it here with what is needed to choose): plays the story that fits
  // now – the Titanic and the lunar module on their days, otherwise a tap story (window.FPTAPS). Returns ms or 0.
  api.play = (svg, ctx) => {
    if (!svg) return 0;
    const T = window.FPTAPS; const n = T ? T.pick(ctx) : null;
    if (n === 'lm' || n === 'titanic') {
      const el = svg.querySelector(`[data-tap="${n}"]`); const ms = { titanic: 34500, lm: 9200 }[n];
      if (!el || svg.classList.contains('t-' + n)) return 0;
      svg.classList.add('t-' + n); setTimeout(() => svg.classList.remove('t-' + n), ms); return ms;
    }
    return n && T ? T.play(svg, n, ctx.lang) : 0;
  };
  api.canPlay = (ctx) => { const T = window.FPTAPS; return !!(T && T.pick(ctx)); };
  api.reduce = reduce;
  window.FPSEASON = api;
})();
