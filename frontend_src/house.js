// ---------------------------------------------------------------------------------------------------------
// The house in the header, built from parts (house builder, release 1: only today's house).
// draw(o, cfg)  – the markup of the house with garage, pergola, pool (drawing coordinates: centre x 956, ground 98)
// geo(cfg)      – where everything is, in header coordinates (the house sits at x 640, scaled .75): roof line,
//                 chimney, door, pool, garage roof, walls. The pets and the animations take their places from here,
//                 so a different house later moves them along instead of leaving them in the air or in a wall.
// window.FPHOUSE = { DEFAULT, draw, geo, toHeader }
// ---------------------------------------------------------------------------------------------------------
(() => {
  if (window.FPHOUSE) return;
  // today's house: tall gable house, garage with a frosted-glass railing on the left, pergola, pool in front
  const DEFAULT = Object.freeze({ width: 112, floors: 2, roof: 'gable', garage: 'left', pergola: true, pool: true });
  const CX = 956; const GROUND = 98; const FLOOR = 29; const SCALE = 0.75;
  const toHeader = (x, y) => [640 + SCALE * (x - CX), 99 + SCALE * (y - 99)];

  // all measures of one house in drawing coordinates – the only place where the shape is decided
  const shape = (cfg) => {
    const c = { ...DEFAULT, ...(cfg || {}) };
    const x0 = CX - c.width / 2; const x1 = CX + c.width / 2; const top = GROUND - c.floors * FLOOR;
    const rise = c.width * 2 / 7; // gable height: 32 on a 112 wide house
    return {
      c, x0, x1, top, peak: top - rise,
      roofLine: [[x0 - 8, top + 4], [CX, top - rise - 2], [x1 + 8, top + 4]],
      chimney: { x: x1 - 24, y: 10, w: 9, h: 20 },
      garage: c.garage ? { x0: x0 - 48, x1: x0, top: 68, roof: 66, rail: 55 } : null,
      pool: c.pool ? { x1: 872, x2: 1040, y1: 102, y2: 113, tile: [864, 99, 1048, 117] } : null,
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
    const S = shape(cfg); const { x0, x1, top } = S; const w = x1 - x0;
    const cold = typeof o.temp === 'number' && o.temp < -5;
    const glass = o.night ? '#2c3648' : '#bfe0ff';
    const wall = o.night ? '#8f8574' : '#f1e3c8'; const roof = o.night ? '#6e3326' : '#b5523b';
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
    // house: tall body, gable to the front
    const [rl, rp, rr] = S.roofLine;
    g += `<rect x="${x0}" y="${top}" width="${w}" height="${GROUND - top}" fill="${wall}"/>`;
    g += `<rect x="${S.chimney.x}" y="${S.chimney.y}" width="${S.chimney.w}" height="${S.chimney.h}" fill="#8a3b2b"/>` + smoke(o, S.chimney.x + 4, S.chimney.y - 2);
    g += `<path d="M${x0} ${top} L${CX} ${S.peak} L${x1} ${top}Z" fill="${wall}"/><path d="M${rl[0]} ${rl[1]} L${rp[0]} ${rp[1]} L${rr[0]} ${rr[1]}" fill="none" stroke="${roof}" stroke-width="7" stroke-linejoin="round"/>`;
    if (o.snow) g += `<path d="M${rl[0] - 2} ${rl[1] - 3} L${rp[0]} ${rp[1] - 3} L${rr[0] + 2} ${rr[1] - 3}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    if (cold) {
      g += '<g>' + Array.from({ length: 7 }, (_, i) => { const x = rl[0] + 4 + i * 9.5; const y = rl[1] - (x - rl[0]) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y} L${x} ${y + l} L${x + 1.4} ${y}Z" fill="#e8f7ff"/>`; }).join('')
        + Array.from({ length: 7 }, (_, i) => { const x = rp[0] + 4 + i * 9.5; const y = rp[1] + (x - rp[0]) * 0.59; const l = 3 + (i % 3) * 2; return `<path d="M${x - 1.4} ${y + 4} L${x} ${y + 4 + l} L${x + 1.4} ${y + 4}Z" fill="#e8f7ff"/>`; }).join('') + '</g>';
    }
    // upper floor: smaller window left, wider window right; ground floor glass front
    const wy = top + 6; const wa = x0 + 16; const wb = x1 - 44;
    g += `<rect x="${wa}" y="${wy}" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/><line x1="${wa + 14}" y1="${wy}" x2="${wa + 14}" y2="${wy + 16}" stroke="#fff" stroke-width="1.5"/><rect x="${wb}" y="${wy}" width="28" height="16" rx="1" fill="${glass}" stroke="#fff" stroke-width="2"/><line x1="${wb + 14}" y1="${wy}" x2="${wb + 14}" y2="${wy + 16}" stroke="#fff" stroke-width="1.5"/>`;
    // ground floor: either every pane is lit or none (lit in the evening, dark late at night)
    const low = o.night && !late ? '#FFD86B' : glass;
    g += `<rect x="${x0 + 10}" y="76" width="38" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/><rect x="${x0 + 54}" y="76" width="22" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/><rect x="${x0 + 82}" y="76" width="${x1 - 6 - (x0 + 82)}" height="22" fill="${low}" stroke="#fff" stroke-width="1.5"/>`;
    if (o.night) g += on(wa + 1, wy + 1, 26, 14, 19, 3) + on(wb + 1, wy + 1, 26, 14, 27, 14);
    // pergola: roof bar and posts only, table silhouette
    if (S.c.pergola) {
      g += `<rect x="${x0 + 2}" y="69" width="${w - 4}" height="5" fill="#4a5058"/><rect x="${x0 + 3}" y="69" width="3" height="29" fill="#4a5058"/><rect x="${x1 - 6}" y="69" width="3" height="29" fill="#4a5058"/><path d="M${CX - 12} 90 h22 M${CX - 8} 90 v8 M${CX + 6} 90 v8" stroke="#3a3f46" stroke-width="2"/>`;
      if (o.snow) g += `<rect x="${x0 + 1}" y="67" width="${w - 2}" height="2.5" rx="1.2" fill="#fff"/>`;
      if (o.night) g += `<rect x="${x0 + 6}" y="74" width="${w - 12}" height="1.2" fill="#FFE7A8"/>`;
      if (o.vis === 'weihnachten') for (let x = x0 + 8; x < x1 - 6; x += 7) g += `<circle class="tw" cx="${x}" cy="75.5" r="1.5" fill="${['#E5483B', '#F2B33D', '#3FA66B', '#3E8EDE'][(x / 7 | 0) % 4]}" style="animation-delay:-${(x % 7) / 3}s"/>`;
      if (cold) g += icicles(x0 + 1, x1 - 1, 74);
    }
    if (o.jz === 'sommer' && o.vis !== 'liebe') g += parasol(o, (G ? G.x0 : x0) - 16, GROUND);
    if (S.pool) g += pool(o, S.pool.x1, S.pool.x2, S.pool.y1, S.pool.y2);
    return g;
  };

  // where everything is, in header coordinates (rounded like the hand-made numbers the pets used before)
  const r1 = (n) => Math.round(n * 10) / 10;
  const geo = (cfg) => {
    const S = shape(cfg); const H = toHeader;
    const [hx0] = H(S.x0, 0); const [hx1] = H(S.x1, 0); const peak = H(CX, S.roofLine[1][1])[1];
    const g = {
      ground: 99,
      roofLine: S.roofLine.map(([x, y]) => H(x, y)),
      peak: [640, peak],
      chimney: H(S.chimney.x + S.chimney.w / 2, S.chimney.y),
      door: [640, 99],
      body: [H(S.roofLine[0][0], 0)[0], Math.round(peak + 2.75), H(S.roofLine[2][0], 0)[0], 99],
      // pets: fliers above the roof, hopping onto the roof and the garage, swimming in the pool
      roofAir: [Math.round((hx0 + hx1) / 2 - (hx1 - hx0) / 2 + 2), Math.max(0, Math.round(peak) - 23), Math.round((hx0 + hx1) / 2 + (hx1 - hx0) / 2 - 2), Math.round(peak + 2.75)],
      roofPerch: { x: 640, y: 99, z: Math.round(99 - peak) },
    };
    if (S.garage) {
      const [gx0] = H(S.garage.x0, 0); const [gx1] = H(S.garage.x1, 0);
      g.garageAir = [gx0, H(0, S.garage.rail)[1] - 6, gx1, Math.round(H(0, S.garage.rail + 1)[1])];
      g.garagePerch = { x: (gx0 + gx1) / 2, y: 99, z: Math.round(99 - H(0, S.garage.rail)[1] - 2) };
      g.garageBody = [gx0, H(0, S.garage.top)[1], gx1, 99];
    }
    if (S.pool) {
      const P = S.pool; const [px1, py1] = H(P.x1, P.y1); const [px2, py2] = H(P.x2, P.y2);
      const [tx1, ty1] = H(P.tile[0], P.tile[1]); const [tx2, ty2] = H(P.tile[2], P.tile[3]);
      g.pool = [px1, r1(py1), px2, py2];
      g.poolTile = [tx1, ty1, tx2, ty2];
      g.swim = { cx: (px1 + px2) / 2, cy: r1((py1 + py2) / 2), rx: (px2 - px1) / 2, ry: r1((py2 - py1) / 2 + 0.2), n: 8 };
      g.cover = { x: (px1 + px2) / 2, y: Math.round((py1 + py2) / 2), z: 1 };
      g.terrace = [px1 - 17, Math.round(ty2), px2 + 17, 118];
      g.inPool = (x, y) => x > tx1 - 3 && x < tx2 + 3 && y > Math.round(ty1) - 2 && y < Math.round(ty2) + 1;
    }
    return g;
  };

  window.FPHOUSE = { DEFAULT, draw, geo, toHeader, shape };
})();
