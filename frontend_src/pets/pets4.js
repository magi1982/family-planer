// Ämtli-Tierchen v4: one shared pattern for all animals (front view like the avatars, big head, slim body).
// window.P4 = { LIST, BY, svg(kind, stage, mood, opt), egg(kind), CSS }   opt: { body: 'sit'|'stand', shiny, view }
// viewBox 0 0 100 100, ground at y = 95. Everything is drawn at "gross" size and scaled per stage.
(() => {
  const hx = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const lt = (c, t) => mix(c, '#ffffff', t); const dk = (c, t) => mix(c, '#000000', t);
  const f = (n) => (Math.round(n * 10) / 10).toString();
  let uid = 0; let defs = ''; let CUR = {};
  const G = (c) => { const id = 'v' + (++uid); defs += `<radialGradient id="${id}" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="${lt(c, .2)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${dk(c, .13)}"/></radialGradient>`; return `url(#${id})`; };
  const E = (x, y, rx, ry, fill, ex) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" ${ex || ''}/>`;
  const C = (x, y, r, fill, ex) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" ${ex || ''}/>`;
  const P = (d, fill, ex) => `<path d="${d}" fill="${fill}" ${ex || ''}/>`;
  const S = (d, col, w, ex) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" ${ex || ''}/>`;
  const R = (a, x, y) => `transform="rotate(${f(a)} ${f(x)} ${f(y)})"`;
  const INK = '#1d2430'; const PINK = '#F7B6C2';

  // ---------------------------------------------------------------- faces (same for every animal)
  const face = (x, y, r, mood, o) => {
    const bk = o.bk || 0; const ex = r * (o.eyeGap || .38) * (1 - .05 * bk), er = r * (o.eyeR || .14) * (1 + .3 * bk), ey = y + r * ((o.eyeY || 0) + .08 * bk);
    let s = '';
    if (o.eyeRing) s += E(x - ex, ey, er * 2, er * 2.1, o.eyeRing) + E(x + ex, ey, er * 2, er * 2.1, o.eyeRing);
    if (mood === 'schlaeft') s += S(`M${f(x - ex - er)} ${f(ey)} q${f(er)} ${f(er)} ${f(er * 2)} 0 M${f(x + ex - er)} ${f(ey)} q${f(er)} ${f(er)} ${f(er * 2)} 0`, o.eyeC || INK, 1.5);
    else if (mood === 'freut' || mood === 'stolz') s += S(`M${f(x - ex - er)} ${f(ey + er * .4)} q${f(er)} ${f(-er * 1.7)} ${f(er * 2)} 0 M${f(x + ex - er)} ${f(ey + er * .4)} q${f(er)} ${f(-er * 1.7)} ${f(er * 2)} 0`, o.eyeC || INK, 1.7);
    else {
      const lk = mood === 'hungrig' ? er * .45 : 0;
      if (o.eyeWhite) s += C(x - ex, ey, er * 1.45, '#fff') + C(x + ex, ey, er * 1.45, '#fff');
      s += `<g class="${mood === 'froh' ? 'blink' : ''}">${C(x - ex, ey + lk * .4, er, o.eyeC || INK)}${C(x + ex, ey + lk * .4, er, o.eyeC || INK)}${C(x - ex + er * .35, ey - er * .38, er * .38, '#fff')}${C(x + ex + er * .35, ey - er * .38, er * .38, '#fff')}${bk ? C(x - ex - er * .35, ey + er * .4, er * .17, '#fff') + C(x + ex - er * .35, ey + er * .4, er * .17, '#fff') : ''}</g>`;
      if (mood === 'muede') s += E(x - ex, ey - er * .6, er * 1.25, er * .75, o.lid || o.c) + E(x + ex, ey - er * .6, er * 1.25, er * .75, o.lid || o.c) + S(`M${f(x - ex - er)} ${f(ey - er * .05)} h${f(er * 2)} M${f(x + ex - er)} ${f(ey - er * .05)} h${f(er * 2)}`, INK, 1);
      if (mood === 'sauer') s += S(`M${f(x - ex - er * 1.4)} ${f(ey - er * 2)} L${f(x - ex + er * 1.1)} ${f(ey - er * 1.15)} M${f(x + ex + er * 1.4)} ${f(ey - er * 2)} L${f(x + ex - er * 1.1)} ${f(ey - er * 1.15)}`, INK, 1.6);
    }
    const bl = ['froh', 'freut', 'stolz'].includes(mood) ? '#FF8FA3' : mood === 'sauer' ? '#FF5A4A' : '';
    const br = r * (.13 + .05 * bk); if (bl && !o.noBlush) s += E(x - r * .62, y + r * (.3 + .06 * bk), br, br * .8, bl, `opacity="${.5 + .15 * bk}"`) + E(x + r * .62, y + r * (.3 + .06 * bk), br, br * .8, bl, `opacity="${.5 + .15 * bk}"`);
    return s;
  };
  const mouth = (x, y, mood, w) => {
    const k = w || 1;
    if (mood === 'sauer') return S(`M${f(x - 2.8 * k)} ${f(y + 1.4)} q${f(2.8 * k)} -2.4 ${f(5.6 * k)} 0`, INK, 1.2);
    if (mood === 'muede') return S(`M${f(x - 1.8 * k)} ${f(y + .4)} h${f(3.6 * k)}`, INK, 1.1);
    if (mood === 'schlaeft') return C(x, y + .4, 1, INK);
    if (mood === 'hungrig') return E(x, y + .9, 2.2 * k, 1.9, '#7a2a2a') + E(x + .6, y + 2.8, 1.1, 1.4, '#F28BA0');
    if (mood === 'freut') return P(`M${f(x - 3 * k)} ${f(y)} q${f(3 * k)} ${f(4.4)} ${f(6 * k)} 0z`, '#B8455A');
    return S(`M${f(x - 2.8 * k)} ${f(y)} q${f(1.4 * k)} 1.8 ${f(2.8 * k)} 0 q${f(1.4 * k)} 1.8 ${f(2.8 * k)} 0`, INK, 1.15);
  };
  const moodFx = (mood, x, y, r) => {
    if (mood === 'schlaeft') return `<text class="zz" x="${f(x + r * .9)}" y="${f(y - r * .7)}" font-size="8" font-weight="800" fill="#9fb4d6" font-family="system-ui">z</text><text class="zz" style="animation-delay:.8s" x="${f(x + r * 1.25)}" y="${f(y - r * 1.15)}" font-size="11" font-weight="800" fill="#9fb4d6" font-family="system-ui">Z</text>`;
    if (mood === 'muede') return `<text class="zz" x="${f(x + r * .95)}" y="${f(y - r * .8)}" font-size="8" font-weight="800" fill="#9fb4d6" font-family="system-ui">…</text>`;
    if (mood === 'freut') return `<path class="ht" d="M${f(x + r * 1.05)} ${f(y - r * .9)} c-2 -3 -6 -1 -4 2 l4 4 l4 -4 c2 -3 -2 -5 -4 -2z" fill="#FF6F91"/><path class="ht" style="animation-delay:.7s" d="M${f(x - r * 1.25)} ${f(y - r * .6)} c-1.5 -2.5 -5 -1 -3 1.6 l3 3 l3 -3 c1.6 -2.6 -1.5 -4 -3 -1.6z" fill="#FF6F91"/>`;
    if (mood === 'sauer') return `<g class="puff">${S(`M${f(x + r * .95)} ${f(y - r * 1.05)} l3 -3 m-1 4 l4 -1 m-6 -1 l1 -4`, '#E5483B', 1.6)}</g>`;
    if (mood === 'stolz') return `<g class="tw">${P(`M${f(x + r * 1.05)} ${f(y - r * 1.1)} l1.4 3 3.2 .4 -2.3 2.2 .6 3.2 -2.9 -1.6 -2.9 1.6 .6 -3.2 -2.3 -2.2 3.2 -.4z`, '#FFD34D')}</g>`;
    return '';
  };

  // ---------------------------------------------------------------- shared body (sit or stand)
  // returns the body parts and where the head, arms and tail attach
  const body = (o, st, form) => {
    const kid = st === 'baby'; const c = o.bodyC || o.c; const belly = o.b; const limb = o.limbC || dk(c, .06);
    const bk = st === 'baby' ? 1 : st === 'jung' ? .5 : 0;   // baby look: round tummy, big head, short legs
    const hr = (o.hr || 17) * (1 + .26 * bk);
    let back = '', mid = '', front = '';
    let hy, sh, tail;
    if (form === 'stand') {
      const lift = o.longLegs ? 15 : 0; const yT = 62 + 5 * bk - lift, yB = 85 + 2 * bk - lift, wT = (o.bw || 8.5) * (1 + .32 * bk), wB = (o.bw || 8.5) * 1.3 * (1 + .3 * bk);
      hy = yT - hr * (.62 + .08 * bk) - (o.longLegs ? 17 : 0); sh = [50 - wT + 1, yT + 3, 50 + wT - 1, yT + 3]; tail = [50 + wB * .7, yB - 4];
      if (o.longLegs) { const lc = o.legC || limb; mid += `<g class="fL">${S(`M46 ${f(yB - 2)} V${f(yB + 9)} l-1.5 6 V93`, lc, 1.8)}${E(45, 93.6, 3.4, 1.5, lc)}</g><g class="fR">${S(`M54 ${f(yB - 2)} V${f(yB + 9)} l1.5 6 V93`, lc, 1.8)}${E(55, 93.6, 3.4, 1.5, lc)}</g>`; }
      if (o.neckLong) { hy -= 13; mid += S(`M50 ${f(yT + 4)} C${f(56)} ${f(yT - 4)} ${f(44)} ${f(hy + hr * 1.4)} 50 ${f(hy + hr * .5)}`, c, 9.5); }
      if (o.longLegs) mid += S(`M50 ${f(yT + 1)} C${f(60)} ${f(yT - 6)} ${f(40)} ${f(hy + hr * 1.9)} 50 ${f(hy + hr * .6)}`, c, 4.2);
      if (!o.noLegs && !o.longLegs) {
        const lw = o.lw || 5.6; const lc = o.legC || limb;
        const lh = 9 - 3 * bk; const lw2 = lw * (1 + .2 * bk);
        mid += `<g class="fL">${P(`M${f(50 - 7.5)} ${f(yB - 3)} v${f(lh)} a${f(lw2 / 2)} ${f(lw2 / 2)} 0 0 0 ${f(lw2)} 0 v${f(-lh)}z`, lc)}${E(50 - 5.2, 93.4, 4.4, 2.3, o.footC || dk(lc, .1))}</g><g class="fR">${P(`M${f(50 + 7.5 - lw2)} ${f(yB - 3)} v${f(lh)} a${f(lw2 / 2)} ${f(lw2 / 2)} 0 0 0 ${f(lw2)} 0 v${f(-lh)}z`, lc)}${E(50 + 5.2, 93.4, 4.4, 2.3, o.footC || dk(lc, .1))}</g>`;
      }
      mid += P(`M${f(50 - wT)} ${f(yT)} C${f(50 - wT - 2)} ${f(yT + 9)} ${f(50 - wB - 1)} ${f(yB - 6)} ${f(50 - wB + 1)} ${f(yB - 1)} Q50 ${f(yB + 3)} ${f(50 + wB - 1)} ${f(yB - 1)} C${f(50 + wB + 1)} ${f(yB - 6)} ${f(50 + wT + 2)} ${f(yT + 9)} ${f(50 + wT)} ${f(yT)} Q50 ${f(yT - 3)} ${f(50 - wT)} ${f(yT)}z`, G(c));
      if (belly) mid += E(50, (yT + yB) / 2 + 3, wT * .72, (yB - yT) * .36, belly);
    } else {
      const cy = 80 + 1.5 * bk, rx = (o.bw || 8.5) * 1.55 * (1 + .22 * bk), ry = 13.5 - 1.5 * bk;
      hy = cy - ry - hr * (.55 + .06 * bk); if (o.neckLong) { hy -= 11; mid += S(`M50 ${f(cy - ry + 4)} C56 ${f(cy - ry - 4)} 44 ${f(hy + hr * 1.4)} 50 ${f(hy + hr * .5)}`, c, 9.5); } sh = [50 - rx * .6, cy - ry * .45, 50 + rx * .6, cy - ry * .45]; tail = [50 + rx * .8, cy + ry * .4];
      if (!o.noLegs) mid += E(50 - rx * .5, 92.6, rx * .36, 2.8, o.footC || dk(o.legC || limb, .1)) + E(50 + rx * .5, 92.6, rx * .36, 2.8, o.footC || dk(o.legC || limb, .1));
      mid += E(50, cy, rx, ry, G(c));
      if (belly) mid += E(50, cy + 2, rx * .6, ry * .7, belly);
    }
    return { back, mid, front, hy, hr, sh, tail, limb, bk };
  };
  const arms = (o, sh, form, kind) => {
    const c = o.armC || o.limbC || dk(o.bodyC || o.c, .06); let s = '';
    if (kind === 'none') return '';
    if (kind === 'wing') { const wc = o.wingC || dk(o.bodyC || o.c, .1); return P(`M${f(sh[0] + 1)} ${f(sh[1] - 2)} q-8 4 -7 16 q4 -2 8 -8z`, G(wc)) + P(`M${f(sh[2] - 1)} ${f(sh[3] - 2)} q8 4 7 16 q-4 -2 -8 -8z`, G(wc)); }
    if (kind === 'flipper') return P(`M${f(sh[0] + 1)} ${f(sh[1] - 1)} q-7 6 -5 15 q4 -3 6 -9z`, G(c)) + P(`M${f(sh[2] - 1)} ${f(sh[3] - 1)} q7 6 5 15 q-4 -3 -6 -9z`, G(c));
    const bk = o._bk || 0; const dy = (form === 'stand' ? 11 : 8) * (1 - .3 * bk), dx = form === 'stand' ? 3.6 : 1.5;
    s += S(`M${f(sh[0])} ${f(sh[1])} q${f(-dx)} ${f(dy * .5)} ${f(-dx + 1)} ${f(dy)}`, c, 4.2) + S(`M${f(sh[2])} ${f(sh[3])} q${f(dx)} ${f(dy * .5)} ${f(dx - 1)} ${f(dy)}`, c, 4.2);
    s += C(sh[0] - dx + 1, sh[1] + dy, 2.5, o.pawC || c) + C(sh[2] + dx - 1, sh[3] + dy, 2.5, o.pawC || c);
    return s;
  };

  // ---------------------------------------------------------------- tails (behind the body, to the right)
  const TAIL = {
    bushy: (o, x, y, k) => `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${P(`M${f(x - 2)} ${f(y + 2)} Q${f(x + 22 * k)} ${f(y + 4)} ${f(x + 17 * k)} ${f(y - 22 * k)} Q${f(x + 6 * k)} ${f(y - 10 * k)} ${f(x - 2)} ${f(y + 2)}z`, G(o.tc || o.c))}${o.tipC ? P(`M${f(x + 18 * k)} ${f(y - 15 * k)} Q${f(x + 20.5 * k)} ${f(y - 23 * k)} ${f(x + 14 * k)} ${f(y - 23 * k)} Q${f(x + 13 * k)} ${f(y - 18 * k)} ${f(x + 18 * k)} ${f(y - 15 * k)}z`, o.tipC) : ''}</g>`,
    curl: (o, x, y, k) => S(`M${f(x - 2)} ${f(y)} Q${f(x + 16 * k)} ${f(y + 2)} ${f(x + 13 * k)} ${f(y - 16 * k)} q-1 -6 -6 -3.5`, o.tc || o.c, 3.6, `class="wag" style="transform-origin:${f(x)}px ${f(y)}px"`),
    wag: (o, x, y, k) => S(`M${f(x - 2)} ${f(y - 2)} q${f(10 * k)} ${f(-3 * k)} ${f(9 * k)} ${f(-13 * k)}`, o.tc || o.c, 4.2, `class="wagf" style="transform-origin:${f(x)}px ${f(y)}px"`),
    pom: (o, x, y) => C(x + 1, y + 1, 4.6, '#fff') + C(x, y, 2, '#fff', 'opacity=".6"'),
    thin: (o, x, y, k) => S(`M${f(x - 2)} ${f(y + 2)} q${f(14 * k)} ${f(4 * k)} ${f(16 * k)} ${f(-8 * k)} t${f(6 * k)} ${f(-6 * k)}`, o.tc || '#E7A8A8', 1.8, `class="wag" style="transform-origin:${f(x)}px ${f(y)}px"`),
    meer: (o, x, y, k) => S(`M${f(x - 2)} ${f(y + 3)} q${f(14 * k)} ${f(2)} ${f(18 * k)} ${f(10 * k)}`, o.tc || o.c, 2.6) + C(x + 18 * k, y + 13 * k, 1.4, '#2a2420'),
    ringed: (o, x, y, k) => `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${P(`M${f(x - 2)} ${f(y + 1)} Q${f(x + 17 * k)} ${f(y + 3)} ${f(x + 16 * k)} ${f(y - 18 * k)} Q${f(x + 8 * k)} ${f(y - 11 * k)} ${f(x - 2)} ${f(y + 1)}z`, G(o.tc || o.c))}${[.3, .55, .8].map((t) => S(`M${f(x + 9 * k + t * 6 * k)} ${f(y - 18 * k * t + 1)} l${f(5 * k)} ${f(2 * k)}`, '#2D3036', 2.6)).join('')}</g>`,
    squirrel: (o, x, y, k) => `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${P(`M${f(x - 3)} ${f(y + 4)} C${f(x + 24 * k)} ${f(y + 6)} ${f(x + 27 * k)} ${f(y - 32 * k)} ${f(x + 8 * k)} ${f(y - 38 * k)} C${f(x - 4)} ${f(y - 40 * k)} ${f(x + 1)} ${f(y - 26 * k)} ${f(x + 9 * k)} ${f(y - 28 * k)} C${f(x + 16 * k)} ${f(y - 20 * k)} ${f(x + 6 * k)} ${f(y - 4)} ${f(x - 3)} ${f(y + 4)}z`, G(o.tc || o.c))}${S(`M${f(x + 4 * k)} ${f(y - 2)} C${f(x + 18 * k)} ${f(y - 6 * k)} ${f(x + 18 * k)} ${f(y - 28 * k)} ${f(x + 8 * k)} ${f(y - 33 * k)}`, lt(o.c, .3), 1.2, 'stroke-dasharray="1.5 3" opacity=".8"')}</g>`,
    flat: (o, x, y, k) => P(`M${f(x - 3)} ${f(y + 5)} q${f(16 * k)} ${f(7 * k)} ${f(21 * k)} ${f(-1 * k)} q${f(-5 * k)} ${f(-6 * k)} ${f(-21 * k)} ${f(-5 * k)}z`, '#4B3B30') + S(`M${f(x + 4 * k)} ${f(y + 2)} l${f(4 * k)} ${f(5 * k)} M${f(x + 10 * k)} ${f(y + 1)} l${f(3 * k)} ${f(5 * k)} M${f(x + 1)} ${f(y + 5)} l${f(17 * k)} ${f(-1 * k)}`, '#6B5848', .6),
    otter: (o, x, y, k) => P(`M${f(x - 3)} ${f(y - 1)} Q${f(x + 14 * k)} ${f(y)} ${f(x + 20 * k)} ${f(y + 9 * k)} Q${f(x + 10 * k)} ${f(y + 7 * k)} ${f(x - 3)} ${f(y + 5)}z`, G(o.tc || o.c)),
    horse: (o, x, y, k) => { const cols = o.maneC || ['#3A2618']; return `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${cols.map((cc, i) => S(`M${f(x - 2)} ${f(y - 2)} Q${f(x + (10 + i * 2) * k)} ${f(y - 4)} ${f(x + (12 + i * 2) * k)} ${f(y + (14 - i) * k)}`, cc, 3.2 - i * .3)).join('')}</g>`; },
    stripe: (o, x, y, k) => { const d = `M${f(x - 2)} ${f(y + 1)} q${f(13 * k)} ${f(2)} ${f(15 * k)} ${f(-14 * k)}`; return `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${S(d, o.c, 3.4)}${S(d, '#2a2420', 3.5, 'stroke-dasharray="1.8 2.6"')}${C(x + 15 * k, y - 13 * k, 1.8, '#2a2420')}</g>`; },
    deer: (o, x, y) => E(x, y - 2, 3, 3.6, o.c) + E(x + .5, y - 1, 2, 2.6, '#fff'),
    lizard: (o, x, y, k) => P(`M${f(x - 3)} ${f(y - 2)} C${f(x + 12 * k)} ${f(y)} ${f(x + 18 * k)} ${f(y + 8 * k)} ${f(x + 26 * k)} ${f(y + 3 * k)} C${f(x + 20 * k)} ${f(y + 13 * k)} ${f(x + 8 * k)} ${f(y + 9 * k)} ${f(x - 3)} ${f(y + 5)}z`, G(o.c)),
    chamae: (o, x, y, k) => S(`M${f(x - 3)} ${f(y)} C${f(x + 14 * k)} ${f(y)} ${f(x + 16 * k)} ${f(y + 12 * k)} ${f(x + 10 * k)} ${f(y + 13 * k)} C${f(x + 5 * k)} ${f(y + 14 * k)} ${f(x + 5 * k)} ${f(y + 8 * k)} ${f(x + 9 * k)} ${f(y + 8.5 * k)}`, o.c, 3.6),
    dragon: (o, x, y, k) => P(`M${f(x - 3)} ${f(y - 3)} C${f(x + 12 * k)} ${f(y - 2)} ${f(x + 16 * k)} ${f(y + 8 * k)} ${f(x + 22 * k)} ${f(y + 2 * k)} C${f(x + 17 * k)} ${f(y + 12 * k)} ${f(x + 6 * k)} ${f(y + 9 * k)} ${f(x - 3)} ${f(y + 4)}z`, G(o.c)) + P(`M${f(x + 22 * k)} ${f(y + 2 * k)} l${f(3 * k)} ${f(-4 * k)} l${f(1 * k)} ${f(6 * k)} l${f(-5 * k)} ${f(1 * k)}z`, o.a),
    bird: (o, x, y, k) => P(`M${f(x - 4)} ${f(y - 2)} l${f(10 * k)} ${f(4 * k)} l${f(-1 * k)} ${f(4 * k)} l${f(-9 * k)} ${f(-2 * k)}z`, G(o.tc || dk(o.c, .1))),
    parrot: (o, x, y, k) => P(`M${f(x - 4)} ${f(y - 2)} l${f(8 * k)} ${f(16 * k)} l${f(-3 * k)} ${f(1 * k)} l${f(-8 * k)} ${f(-13 * k)}z`, '#3E8EDE') + P(`M${f(x - 3)} ${f(y - 1)} l${f(6 * k)} ${f(14 * k)} l${f(-2 * k)} ${f(.8 * k)}z`, '#E5483B'),
    kitsune: (o, x, y, k) => { const n = o._st === 'baby' ? 3 : o._st === 'jung' ? 5 : 9; let g = ''; for (let i = 0; i < n; i++) { const a = (-70 + i * (110 / Math.max(1, n - 1))); g += `<g ${R(a + 20, x - 2, y + 2)}>${P(`M${f(x - 2)} ${f(y + 2)} Q${f(x + 16 * k)} ${f(y + 6)} ${f(x + 20 * k)} ${f(y - 12 * k)} Q${f(x + 9 * k)} ${f(y - 8 * k)} ${f(x - 2)} ${f(y + 2)}z`, G(o.c), 'stroke="#E8DCCF" stroke-width=".5"')}${P(`M${f(x + 20 * k)} ${f(y - 12 * k)} Q${f(x + 19 * k)} ${f(y - 5 * k)} ${f(x + 15 * k)} ${f(y - 4 * k)} Q${f(x + 16 * k)} ${f(y - 9 * k)} ${f(x + 20 * k)} ${f(y - 12 * k)}z`, '#C9A6FF')}</g>`; } return `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${g}</g>`; },
    flame: (o, x, y, k) => `<g class="wag" style="transform-origin:${f(x)}px ${f(y)}px">${['#FFD34D', '#FF8A3D', '#E5483B'].map((c, i) => P(`M${f(x - 3)} ${f(y)} Q${f(x + (10 + i * 3) * k)} ${f(y - (6 - i * 4) * k)} ${f(x + (20 + i * 2) * k)} ${f(y - (16 - i * 10) * k)} Q${f(x + (12 + i * 2) * k)} ${f(y + (2 + i * 2) * k)} ${f(x - 3)} ${f(y + 4)}z`, c)).join('')}</g>`,
    lion: (o, x, y, k) => S(`M${f(x - 2)} ${f(y + 1)} q${f(12 * k)} ${f(2)} ${f(14 * k)} ${f(-12 * k)}`, o.bodyC || o.c, 2.4) + E(x + 14 * k, y - 13 * k, 2.6 * k, 3.4 * k, dk(o.bodyC || o.c, .35)),
    humps: (o, x, y, k) => C(x + 10 * k, y - 1, 6 * k, G(o.c)) + C(x + 22 * k, y + 2, 4.5 * k, G(o.c)) + P(`M${f(x + 26 * k)} ${f(y + 3)} l${f(6 * k)} ${f(-5 * k)} l${f(-1 * k)} ${f(8 * k)}z`, G(o.c)),
    seal: (o, x, y) => P(`M${f(x - 6)} ${f(y + 5)} l8 -1 l-1 5 z M${f(x - 10)} ${f(y + 7)} l-2 5 l7 -2z`, dk(o.c, .1)),
  };
  // ---------------------------------------------------------------- ears
  const EARS = {
    point: (o, x, y, r, m, k) => { const ec = o.earC || o.c; const ic = o.earIn || PINK; const h = k || 1; return P(`M${f(x - r * .95)} ${f(y - r * .25)} L${f(x - r * .72)} ${f(y - r * 1.4 * h)} L${f(x - r * .18)} ${f(y - r * .82)}z`, G(ec)) + P(`M${f(x + r * .95)} ${f(y - r * .25)} L${f(x + r * .72)} ${f(y - r * 1.4 * h)} L${f(x + r * .18)} ${f(y - r * .82)}z`, G(ec)) + P(`M${f(x - r * .8)} ${f(y - r * .48)} L${f(x - r * .7)} ${f(y - r * 1.1 * h)} L${f(x - r * .4)} ${f(y - r * .8)}z`, ic) + P(`M${f(x + r * .8)} ${f(y - r * .48)} L${f(x + r * .7)} ${f(y - r * 1.1 * h)} L${f(x + r * .4)} ${f(y - r * .8)}z`, ic); },
    round: (o, x, y, r, m, k) => { const er = r * (k || .32); const ec = o.earC || o.c; return C(x - r * .72, y - r * .72, er, G(ec)) + C(x + r * .72, y - r * .72, er, G(ec)) + (o.earIn === false ? '' : C(x - r * .72, y - r * .72, er * .55, o.earIn || PINK) + C(x + r * .72, y - r * .72, er * .55, o.earIn || PINK)); },
    long: (o, x, y, r, m) => { const L = r * 1.75; const d = m === 'muede' || m === 'schlaeft' ? 38 : m === 'sauer' ? 22 : 8; return [-1, 1].map((sg) => E(x + sg * r * .38, y - r * .62 - L * .5, r * .25, L * .55, G(o.earC || o.c), R(sg * d, x + sg * r * .38, y - r * .62)) + E(x + sg * r * .38, y - r * .62 - L * .5, r * .11, L * .42, o.earIn || PINK, R(sg * d, x + sg * r * .38, y - r * .62))).join(''); },
    flop: (o, x, y, r) => E(x - r * .93, y + r * .05, r * .3, r * .62, G(o.earC || dk(o.c, .2)), R(16, x - r * .93, y)) + E(x + r * .93, y + r * .05, r * .3, r * .62, G(o.earC || dk(o.c, .2)), R(-16, x + r * .93, y)),
    side: (o, x, y, r) => [-1, 1].map((sg) => E(x + sg * r * .98, y - r * .12, r * .22, r * .26, G(o.earC || dk(o.c, .3))) + E(x + sg * r * 1.0, y - r * .1, r * .1, r * .14, '#2a2018')).join(''),
    tiny: (o, x, y, r) => C(x - r * .8, y - r * .55, r * .17, o.earC || dk(o.c, .12)) + C(x + r * .8, y - r * .55, r * .17, o.earC || dk(o.c, .12)),
    tuft: (o, x, y, r, m) => EARS.point(o, x, y, r, m, 1.1) + S(`M${f(x - r * .72)} ${f(y - r * 1.5)} l-1.6 -4.2 M${f(x - r * .72)} ${f(y - r * 1.5)} l.6 -4.4 M${f(x + r * .72)} ${f(y - r * 1.5)} l1.6 -4.2 M${f(x + r * .72)} ${f(y - r * 1.5)} l-.6 -4.4`, dk(o.c, .3), 1.3),
    horse: (o, x, y, r) => P(`M${f(x - r * .55)} ${f(y - r * .8)} l${f(-r * .12)} ${f(-r * .55)} l${f(r * .35)} ${f(r * .38)}z M${f(x + r * .55)} ${f(y - r * .8)} l${f(r * .12)} ${f(-r * .55)} l${f(-r * .35)} ${f(r * .38)}z`, G(o.c)) + P(`M${f(x - r * .55)} ${f(y - r * .86)} l${f(-r * .06)} ${f(-r * .32)} l${f(r * .18)} ${f(r * .2)}z M${f(x + r * .55)} ${f(y - r * .86)} l${f(r * .06)} ${f(-r * .32)} l${f(-r * .18)} ${f(r * .2)}z`, PINK),
    deer: (o, x, y, r) => [-1, 1].map((sg) => E(x + sg * r * 1.0, y - r * .55, r * .48, r * .24, G(o.c), R(sg * -25, x + sg * r * 1.0, y - r * .55)) + E(x + sg * r * 1.0, y - r * .55, r * .3, r * .12, '#F2C9B8', R(sg * -25, x + sg * r * 1.0, y - r * .55))).join(''),
    koala: (o, x, y, r) => [-1, 1].map((sg) => C(x + sg * r * .9, y - r * .5, r * .5, G(o.c)) + C(x + sg * r * .9, y - r * .5, r * .32, '#F4F1EC') + [0, 1, 2].map((i) => C(x + sg * r * (1.2 + i * .05), y - r * (.75 - i * .25), r * .12, '#F4F1EC')).join('')).join(''),
    bat: (o, x, y, r) => [-1, 1].map((sg) => P(`M${f(x + sg * r * .3)} ${f(y - r * .7)} L${f(x + sg * r * 1.0)} ${f(y - r * 1.65)} L${f(x + sg * r * .95)} ${f(y - r * .25)}z`, G(o.c)) + P(`M${f(x + sg * r * .42)} ${f(y - r * .68)} L${f(x + sg * r * .92)} ${f(y - r * 1.38)} L${f(x + sg * r * .86)} ${f(y - r * .42)}z`, PINK)).join(''),
  };

  // ---------------------------------------------------------------- animals: colours + features
  // h: head extras before face (markings), top: extras after face (horn, antlers, mane), back: behind the head
  const fox = { c: '#EE7A2F', b: '#FFF3E6', ear: 'point', earIn: '#3A2A22', tail: 'bushy', tipC: '#FFF7EC', tk: 1.15, nose: INK, legC: '#3A2A22', armC: '#3A2A22', bw: 7.5,
    h: (x, y, r) => P(`M${f(x - r * .98)} ${f(y + r * .05)} Q${f(x - r * .45)} ${f(y + r * .15)} ${f(x)} ${f(y + r * .85)} Q${f(x + r * .45)} ${f(y + r * .15)} ${f(x + r * .98)} ${f(y + r * .05)} Q${f(x + r * .75)} ${f(y + r * .95)} ${f(x)} ${f(y + r * 1.02)} Q${f(x - r * .75)} ${f(y + r * .95)} ${f(x - r * .98)} ${f(y + r * .05)}z`, '#FFF7EC') };
  const LIST = [
    ['fuchs', 'Fuchs', fox, 'boden', 'Orangefarben mit weissen Wangen, schwarzen Söckchen und dem buschigen Schwanz mit weisser Spitze.'],
    ['katze', 'Katze', { c: '#A3ACB8', b: '#EEF1F5', ear: 'point', tail: 'curl', nose: '#E8909A', whisk: 1, bw: 7.5,
      h: (x, y, r, st) => (st === 'baby' ? '' : S(`M${f(x - 3)} ${f(y - r * .92)} l1 4 M${f(x)} ${f(y - r * .98)} v4.6 M${f(x + 3)} ${f(y - r * .92)} l-1 4 M${f(x - r * .95)} ${f(y + 1)} l4 .6 M${f(x + r * .95)} ${f(y + 1)} l-4 .6`, '#6F7885', 1.4)),
      bodyX: (b, st) => (st === 'baby' ? '' : S(`M${f(45)} ${f(66)} q2 2 0 4 M${f(55)} ${f(66)} q-2 2 0 4`, '#6F7885', 1.3)) }, 'klettern', 'Grau getigert mit Streifen auf der Stirn, Schnurrhaaren und geringeltem Schwanz.'],
    ['hund', 'Hund', { c: '#CF9562', b: '#F6E2C8', ear: 'flop', earC: '#8A5A34', tail: 'wag', nose: INK, tongue: 1, bw: 8,
      h: (x, y, r, st) => (st === 'baby' ? '' : E(x + r * .4, y - r * .05, r * .32, r * .3, '#8A5A34')),
      neck: (x, y, st) => (st === 'gross' ? S(`M${f(x - 8)} ${f(y)} Q${f(x)} ${f(y + 4)} ${f(x + 8)} ${f(y)}`, '#E5483B', 2.6) + C(x, y + 2.6, 1.8, '#F5C542') : '') }, 'boden', 'Schlappohren, ein brauner Fleck ums Auge, die Zunge hängt raus; gross mit rotem Halsband.'],
    ['hase', 'Hase', { c: '#D8C6B0', b: '#FFFFFF', ear: 'long', tail: 'pom', nose: '#E8909A', whisk: 1, teeth: 1, bw: 7.5, footC: '#F2EADF' }, 'graben', 'Lange Ohren (hängen, wenn er müde ist), zwei Hasenzähne, weisser Puschelschwanz.'],
    ['igel', 'Igel', { c: '#E9D2AE', b: '#F7E8D3', ear: 'tiny', earC: '#B08A64', nose: INK, bw: 8.5, spikes: '#7A5A3E', snout: 1,
      h: (x, y, r, st) => P(`M${f(x - r * 1.02)} ${f(y + r * .1)} Q${f(x - r * 1.05)} ${f(y - r * 1.15)} ${f(x)} ${f(y - r * 1.1)} Q${f(x + r * 1.05)} ${f(y - r * 1.15)} ${f(x + r * 1.02)} ${f(y + r * .1)} Q${f(x + r * .7)} ${f(y - r * .5)} ${f(x)} ${f(y - r * .45)} Q${f(x - r * .7)} ${f(y - r * .5)} ${f(x - r * 1.02)} ${f(y + r * .1)}z`, '#8A6A4A') + E(x, y + r * .45, r * .42, r * .32, '#F7E8D3') }, 'graben', 'Stacheln auf Kopf und Rücken (mehr mit jeder Stufe), spitze Nase.'],
    ['waschbaer', 'Waschbär', { c: '#949AA2', b: '#E3E6EA', ear: 'round', earC: '#6E747C', earIn: '#F4F5F6', tail: 'ringed', nose: INK, armC: '#3A3D42', legC: '#3A3D42', bw: 8,
      h: (x, y, r) => P(`M${f(x - r * .98)} ${f(y - r * .02)} Q${f(x - r * .5)} ${f(y - r * .48)} ${f(x)} ${f(y - r * .1)} Q${f(x + r * .5)} ${f(y - r * .48)} ${f(x + r * .98)} ${f(y - r * .02)} Q${f(x + r * .5)} ${f(y + r * .36)} ${f(x)} ${f(y + r * .12)} Q${f(x - r * .5)} ${f(y + r * .36)} ${f(x - r * .98)} ${f(y - r * .02)}z`, '#2D3036') + S(`M${f(x - r * .7)} ${f(y - r * .38)} q${f(r * .3)} ${f(-r * .25)} ${f(r * .55)} 0 M${f(x + r * .7)} ${f(y - r * .38)} q${f(-r * .3)} ${f(-r * .25)} ${f(-r * .55)} 0`, '#F4F5F6', 1.6) }, 'klettern', 'Schwarze Maske mit weissen Brauen, dunkle Pfoten und geringelter Schwanz.'],
    ['panda', 'Panda', { c: '#F5F5F3', b: null, ear: 'round', earC: '#26292E', earIn: false, nose: INK, armC: '#26292E', legC: '#26292E', bw: 9,
      h: (x, y, r) => E(x - r * .4, y + r * .02, r * .27, r * .34, '#26292E', R(-22, x - r * .4, y)) + E(x + r * .4, y + r * .02, r * .27, r * .34, '#26292E', R(22, x + r * .4, y)),
      bodyX: (b, st, form) => (form === 'stand' ? P('M41 62 Q50 67 59 62 L60 68 Q50 72 40 68z', '#26292E') : P('M37 70 Q50 76 63 70 L63 75 Q50 80 37 75z', '#26292E')) + (st === 'gross' ? `<g transform="translate(60 70) rotate(-20)">${P('M-1.2 -14 h2.4 v24 h-2.4z', '#7DBE4A')}${S('M-1.2 -6 h2.4 M-1.2 2 h2.4', '#4E8A2A', 1)}${P('M1 -10 q6 -2 8 -6 q-4 1 -8 3z', '#8FD15A')}</g>` : '') }, 'boden', 'Schwarze Ohren, Augenflecken, Arme und Beine; gross knabbert er Bambus.'],
    ['erdmann', 'Erdmännchen', { c: '#D8BA8C', b: '#F1E1C4', ear: 'side', earC: '#5A4632', tail: 'meer', nose: INK, eyeRing: '#4A3A2A', bw: 6.4, hr: 15.5, snout: 1,
      h: (x, y, r) => S(`M${f(x - r * .6)} ${f(y - r * .7)} q${f(r * .6)} ${f(-r * .2)} ${f(r * 1.2)} 0`, '#B8966A', 1.2) + P(`M${f(x - r * .42)} ${f(y + r * .18)} Q${f(x)} ${f(y + r * .05)} ${f(x + r * .42)} ${f(y + r * .18)} Q${f(x + r * .3)} ${f(y + r * .8)} ${f(x)} ${f(y + r * .82)} Q${f(x - r * .3)} ${f(y + r * .8)} ${f(x - r * .42)} ${f(y + r * .18)}z`, '#F1E1C4') }, 'graben', 'Schlank und aufrecht, dunkle Augenringe, dünner Schwanz mit dunkler Spitze.'],
    ['eichhorn', 'Eichhörnchen', { c: '#CB6A2E', b: '#F7E1C8', ear: 'tuft', earIn: '#F7E1C8', tail: 'squirrel', tk: 1.2, nose: INK, bw: 7,
      bodyX: (b, st) => (st === 'gross' ? `<g transform="translate(50 ${b.form === 'stand' ? 74 : 81})">${E(0, 0, 3.2, 3.6, '#B9773A')}${P('M-3.4 -1 q3.4 -4 6.8 0z', '#7A4A22')}</g>` : '') }, 'klettern', 'Riesiger buschiger Schwanz, Pinselohren, weisser Bauch – gross mit einer Nuss.'],
    ['hamster', 'Hamster', { c: '#F0A85C', b: '#FFF1DE', ear: 'round', earC: '#E09048', tail: null, nose: '#E8909A', whisk: 1, bw: 8, hr: 17.5, cheeks: '#FFE3C2',
      h: (x, y, r) => P(`M${f(x - r * .45)} ${f(y - r * .1)} Q${f(x)} ${f(y - r * .35)} ${f(x + r * .45)} ${f(y - r * .1)} L${f(x + r * .55)} ${f(y + r * .9)} L${f(x - r * .55)} ${f(y + r * .9)}z`, '#FFF1DE') }, 'graben', 'Goldbraun mit weisser Blesse und dicken Backen – stopft sie mit Körnern voll.'],
    ['maus', 'Maus', { c: '#ADA7A1', b: '#EFE9E4', ear: 'round', earK: .5, tail: 'thin', nose: '#E8909A', whisk: 1, bw: 6.6, hr: 15.5, snout: 1 }, 'graben', 'Riesige runde Ohren, rosa Näschen und langer dünner Schwanz.'],
    ['einhorn', 'Einhorn', { c: '#F8F4FB', b: null, horse: 1, muzC: '#F3E6F5', ear: 'horse', tail: 'horse', maneC: ['#FF8FC8', '#FFD34D', '#7FD3FF', '#B07CFF'], footC: '#C9B5E8', legC: '#EFE8F5', bw: 8, horn: 1 }, 'boden', 'Pferdekopf mit langer Schnauze, Regenbogen-Mähne, goldenes Horn und Hufe.'],
    ['otter', 'Otter', { c: '#80563A', b: '#E3C29E', ear: 'tiny', tail: 'otter', nose: INK, whisk: 1, bw: 7, armC: '#6A4228',
      h: (x, y, r) => E(x, y + r * .35, r * .62, r * .45, '#E8CBA6'),
      bodyX: (b, st) => (st === 'gross' ? E(50, b.form === 'stand' ? 74 : 80, 3.6, 2.8, G('#9AA3AE')) : '') }, 'wasser', 'Brauner Körper, helles Gesicht, Schnurrhaare – hält seinen Lieblingsstein.'],
    ['frosch', 'Frosch', { c: '#6CC04A', b: '#D9F2B5', frog: 1, nose: false, bw: 9, noBlushUp: 1 }, 'wasser', 'Breiter Kopf, Glubschaugen oben drauf, breites Lächeln, Schwimmhäute.'],
    ['axolotl', 'Axolotl', { c: '#FFA3C7', b: '#FFD6E6', gills: '#E0508A', nose: false, wide: 1, tail: 'otter', tc: '#FFB8D4', bw: 8 }, 'wasser', 'Rosa, breites Lächeln und gekräuselte Kiemen, die mit jeder Stufe wachsen.'],
    ['eidechse', 'Eidechse', { c: '#6BBF4A', b: '#D8F0A8', reptile: 1, eyeWhite: 1,
      hx: (x, y, r) => [[-.45, -.6], [0, -.75], [.45, -.6], [-.2, -.4], [.25, -.38]].map(([a, b]) => C(x + a * r, y + b * r, r * .09, '#3A7A2A')).join('') + S(`M${f(x - r * 1.0)} ${f(y + r * .2)} q${f(r * .3)} ${f(r * .25)} ${f(r * .6)} ${f(r * .1)} M${f(x + r * 1.0)} ${f(y + r * .2)} q${f(-r * .3)} ${f(r * .25)} ${f(-r * .6)} ${f(r * .1)}`, '#E8E07A', 1.4), tail: 'lizard', tk: 1.1, nose: false, bw: 6.6, spots: '#3A7A2A', claws: 1 }, 'sonne', 'Grün mit dunklen Punkten, flacher Kopf, Krallenfinger und langer spitzer Schwanz.'],
    ['chamae', 'Chamäleon', { c: '#4FBF6E', b: '#C8F0D0', reptile: 1, casque: 1, turret: 1, tail: 'chamae', nose: false, bw: 7.5, shift: 1, stripesV: '#8FE0A6' }, 'sonne', 'Helm auf dem Kopf, Dreh-Augen in Kegeln, Ringelschwanz – wechselt die Farbe.'],
    ['drache', 'Drache', { c: '#4FA34A', b: '#E8E3A0', a: '#E5483B', reptile: 1, horns: 1, wings: '#7CC36A', tail: 'dragon', tk: 1.1, nose: false, bw: 8, belly: 1, fang: 1 }, 'luft', 'Hörner, Flügel, rote Rückenzacken, gestreifter Bauch und Pfeilspitzen-Schwanz.'],
    ['eule', 'Eule', { c: '#9C6B44', b: '#EBD3AD', bird: 'owl', ear: null, tail: null, wingC: '#7A5034', legC: '#E3A33B', footC: '#E3A33B', bw: 9.5, hr: 17, eyeWhite: 1, eyeC: '#2a1a10' }, 'luft', 'Gesichtsschleier, Federohren, grosse orange Augen und Krallenfüsse.'],
    ['pinguin', 'Pinguin', { c: '#2F3946', b: '#F6F8FA', bird: 'peng', tail: null, legC: '#F5A623', footC: '#F5A623', bw: 9.5, hr: 16.5 }, 'wasser', 'Schwarzer Frack, weisser Bauch, gelber Halsfleck, Flossen und orange Füsse.'],
    ['ente', 'Ente', { c: '#F7D44A', b: '#FFF2B0', bird: 'duck', wingC: '#9A948A', tail: 'bird', legC: '#F08A1E', footC: '#F08A1E', bw: 8.5 }, 'wasser', 'Gelbes Küken → Jungente → Stockente mit grünem Kopf und weissem Halsring.'],
    ['papagei', 'Papagei', { c: '#E5483B', b: '#F06A50', bird: 'parrot', tail: 'parrot', wingC: '#3E8EDE', legC: '#7a7a7a', footC: '#7a7a7a', bw: 8 }, 'luft', 'Roter Ara mit weissem Gesicht, krummem Schnabel, blau-gelben Flügeln und langem Schwanz.'],
    ['biene', 'Biene', { c: '#F5C33B', b: null, insect: 'bee', tail: null, legC: '#2B2420', footC: '#2B2420', armC: '#2B2420', bw: 8.5 }, 'luft', 'Gelb-schwarz gestreift, pelzig, durchsichtige Flügel, Fühler und kleiner Stachel.'],
    ['kaefer', 'Marienkäfer', { c: '#262626', bodyC: '#E5352D', b: null, insect: 'lady', tail: null, legC: '#1E1E1E', footC: '#1E1E1E', armC: '#1E1E1E', bw: 9, hr: 14 }, 'luft', 'Roter Panzer mit schwarzen Punkten (gross 7) wie ein Umhang, schwarzer Kopf mit weissen Flecken.'],
    ['falter', 'Schmetterling', { c: '#5B4A7A', b: null, insect: 'fly', tail: null, legC: '#3a2d50', footC: '#3a2d50', armC: '#3a2d50', bw: 6 }, 'luft', 'Raupe → Puppe → Schmetterling mit grossen bunten Flügeln.'],
    ['reh', 'Reh', { c: '#BE7E4A', b: '#F2E0C8', ear: 'deer', tail: 'deer', nose: INK, bw: 7, legC: '#A86A3A', footC: '#3A2618', snout: 1, spotsBaby: 1, antler: 1 }, 'boden', 'Grosse Ohren, schwarze Nase, Baby mit weissen Tupfen, gross mit kleinem Geweih.'],
    ['pony', 'Pony', { c: '#A8693E', b: null, horse: 1, muzC: '#C9A27E', ear: 'horse', tail: 'horse', maneC: ['#3A2618', '#5A3A24'], footC: '#3A2618', bw: 8.5, blaze: 1 }, 'boden', 'Pferdekopf mit weisser Blesse, dunkler Mähne und Hufen.'],
    ['koala', 'Koala', { c: '#9AA3AD', b: '#E9ECEF', ear: 'koala', nose: false, bw: 8.5, bigNose: 1 }, 'klettern', 'Grau, riesige flauschige Ohren und die grosse dunkle Nase.'],
    ['faultier', 'Faultier', { c: '#A88A6A', b: '#D9C3A6', ear: null, nose: false, bw: 8.5, sloth: 1, claws: 1 }, 'klettern', 'Helle Gesichtsmaske mit dunklen Augenstreifen, lange Krallen – lächelt immer.'],
    ['robbe', 'Robbe', { c: '#8C98A4', b: '#B9C3CC', ear: null, tail: 'seal', nose: INK, whisk: 1, bw: 9, noLegs: 1, flippers: 1, spots: '#6E7A86' }, 'wasser', 'Rundes Gesicht mit Schnurrhaaren, Flossen statt Pfoten – Baby schneeweiss.'],
    ['biber', 'Biber', { c: '#8A5A34', b: '#B98A5E', ear: 'tiny', tail: 'flat', nose: INK, whisk: 1, teeth: '#F4A73A', bw: 8.5 }, 'wasser', 'Brauner Pelz, orange Nagezähne und platter Kellenschwanz.'],
    ['flamingo', 'Flamingo', { c: '#FF8FB0', b: null, bird: 'flamingo', tail: 'bird', legC: '#E9708F', footC: '#E9708F', bw: 7, longLegs: 1, hr: 13 }, 'wasser', 'Rosa, langer Hals, gebogener Schnabel mit schwarzer Spitze, lange Beine.'],
    ['fledermaus', 'Fledermaus', { c: '#6E5A72', b: '#8E7A8E', ear: 'bat', nose: false, bw: 7, batWings: 1, fang: 1 }, 'luft', 'Spitze grosse Ohren, kleine Zähnchen und Flügel aus Haut.'],
    ['kolibri', 'Kolibri', { c: '#3CC48A', b: '#F2F2EA', bird: 'humm', tail: 'bird', legC: '#333', footC: '#333', bw: 6.4, hr: 14.5 }, 'luft', 'Winzig, schillernd grün, roter Hals, langer dünner Schnabel und schwirrende Flügel.'],
    ['tiger', 'Tiger', { c: '#F08A24', b: '#FFF4E4', ear: 'round', earIn: '#2A2420', tail: 'stripe', tk: 1.1, nose: '#E8909A', whisk: 1, bw: 8.5,
      h: (x, y, r) => E(x, y + r * .4, r * .55, r * .38, '#FFF4E4') + S(`M${f(x - 3)} ${f(y - r * .92)} l1 4 M${f(x)} ${f(y - r * .98)} v4.6 M${f(x + 3)} ${f(y - r * .92)} l-1 4 M${f(x - r * .98)} ${f(y - 2)} l4.5 1 M${f(x - r * .98)} ${f(y + 2)} l4 0 M${f(x + r * .98)} ${f(y - 2)} l-4.5 1 M${f(x + r * .98)} ${f(y + 2)} l-4 0`, '#2A2420', 1.6),
      bodyX: (b, st) => S(b.form === 'stand' ? 'M43 66 q2 2 0 5 M57 66 q-2 2 0 5 M44 75 q2 2 0 4 M56 75 q-2 2 0 4' : 'M38 75 q3 2 0 5 M62 75 q-3 2 0 5 M40 84 q3 2 0 4 M60 84 q-3 2 0 4', '#2A2420', 1.6) }, 'boden', 'Orange mit schwarzen Streifen, weisse Schnauze – schon das Baby ist gestreift.'],

    ['pegasus', 'Pegasus', { c: '#F4F7FF', b: null, horse: 1, muzC: '#E3EAF8', ear: 'horse', tail: 'horse', maneC: ['#9FD0FF', '#B9A2FF', '#FFFFFF'], wings: '#FFFFFF', feather: 1, footC: '#B9C2CC', legC: '#E8EDF7', bw: 8 }, 'luft', 'FABELWESEN · Geflügeltes Pferd mit Wolken-Mähne – die Federflügel wachsen mit jeder Stufe.'],
    ['phoenix', 'Phönix', { c: '#E5483B', b: '#FFB347', bird: 'phoenix', wingC: '#FF8A3D', wings: '#FFB347', feather: 1, tail: 'flame', tk: 1.15, legC: '#F5B83D', footC: '#F5B83D', bw: 8,
      hx: (x, y, r, st) => (st === 'baby' ? '' : `<g class="wag" style="transform-origin:${f(x)}px ${f(y - r * .8)}px">${['#FFD34D', '#FF8A3D', '#E5483B'].map((c, i) => P(`M${f(x - 3 + i * 3)} ${f(y - r * .85)} Q${f(x - 5 + i * 4)} ${f(y - r * (1.5 + (i === 1 ? .3 : 0)))} ${f(x - 1 + i * 2)} ${f(y - r * (1.7 + (i === 1 ? .35 : 0)))} Q${f(x + 1 + i * 2)} ${f(y - r * 1.3)} ${f(x - 1 + i * 3)} ${f(y - r * .85)}z`, c)).join('')}</g>`) }, 'luft', 'FABELWESEN · Feuervogel mit Flammen-Krone und Flammen-Schwanz; das Küken ist ein kleines Glutkügelchen.'],
    ['greif', 'Greif', { c: '#F4F1EC', bodyC: '#D9A55A', b: '#F2DDB0', bird: 'griffin', wingC: '#B07A48', wings: '#B07A48', feather: 1, tail: 'lion', legC: '#C99448', footC: '#B5803A', bw: 8.5 }, 'luft', 'FABELWESEN · Adlerkopf mit gelbem Hakenschnabel, Löwenkörper mit Quastenschwanz und braune Flügel.'],
    ['kitsune', 'Kitsune', { c: '#FFF4E8', b: '#FFFFFF', ear: 'point', earIn: '#C9A6FF', tail: 'kitsune', tk: .95, nose: INK, legC: '#F2E6DA', bw: 7.5,
      h: (x, y, r) => E(x, y + r * .42, r * .5, r * .34, '#FFFFFF') + P(`M${f(x)} ${f(y - r * .75)} q${f(-r * .12)} ${f(r * .2)} 0 ${f(r * .38)} q${f(r * .12)} ${f(-r * .18)} 0 ${f(-r * .38)}z`, '#E5483B') + S(`M${f(x - r * .62)} ${f(y - r * .22)} q${f(-r * .22)} ${f(-r * .05)} ${f(-r * .32)} ${f(-r * .22)} M${f(x + r * .62)} ${f(y - r * .22)} q${f(r * .22)} ${f(-r * .05)} ${f(r * .32)} ${f(-r * .22)}`, '#E5483B', 1.3) }, 'boden', 'FABELWESEN · Weisser Zauberfuchs mit roten Zeichen – Baby 3 Schwänze, Jung 5, Gross 9!'],
    ['yeti', 'Yeti', { c: '#F2F6FA', b: '#E1EAF2', ear: null, nose: '#5A6E8C', bw: 9.5, armC: '#E8EEF4', legC: '#E8EEF4', footC: '#9FB4D6', pawC: '#9FB4D6',
      h: (x, y, r) => E(x, y + r * .15, r * .68, r * .6, '#A9BCDA') + [-.55, -.2, .15, .5].map((a, i) => P(`M${f(x + a * r - 3)} ${f(y - r * .82)} Q${f(x + a * r)} ${f(y - r * (1.25 + (i % 2) * .15))} ${f(x + a * r + 3)} ${f(y - r * .82)}z`, '#F2F6FA')).join('') + [-1, 1].map((sg) => P(`M${f(x + sg * r * .95)} ${f(y - r * .1)} q${f(sg * r * .3)} ${f(r * .15)} ${f(sg * r * .05)} ${f(r * .45)}z`, '#F2F6FA')).join('') }, 'boden', 'FABELWESEN · Flauschiger Schneemensch mit blauem Gesicht und blauen Pfoten – liebt den Winter.'],
    ['nessie', 'Nessie', { c: '#3FBF9B', b: '#BFF0DE', ear: null, nose: false, neckLong: 1, noLegs: 1, flippers: 1, tail: 'humps', tk: 1, bw: 9, spots: '#2E8A6A', hr: 15,
      hx: (x, y, r) => C(x - r * .35, y - r * .9, r * .14, '#2E8A6A') + C(x + r * .35, y - r * .9, r * .14, '#2E8A6A') + C(x - 1.4, y + r * .25, .6, '#2E8A6A') + C(x + 1.4, y + r * .25, .6, '#2E8A6A') }, 'wasser', 'FABELWESEN · Das freundliche Seeungeheuer: langer Hals, Flossen, Buckel im Wasser – taucht im Pool auf.'],
    ['wolpi', 'Wolpertinger', { c: '#B9946A', b: '#F2E6D2', ear: 'long', earC: '#B9946A', tail: 'pom', nose: '#E8909A', whisk: 1, fang: 1, antler: 1, wings: '#E9D3A6', feather: 1, bw: 7.5, footC: '#8A6A48' }, 'boden', 'FABELWESEN · Das lustige Alpen-Fabeltier: Hase mit Geweih, kleinen Flügeln und Zähnchen.'],
  ];
  const BY = Object.fromEntries(LIST.map((x) => [x[0], x]));
  const ST = { baby: .6, jung: .8, gross: 1 };

  // ---------------------------------------------------------------- one animal
  const draw = (k, st, mood, form) => {
    const o = CUR.pal ? { ...BY[k][2], ...CUR.pal } : BY[k][2]; const big = st === 'gross'; const mid = st !== 'baby';
    let back = '', mid2 = '', headB = '', head = '', top = '', front = '';
    // special stages: caterpillar / pupa / tadpole
    if (k === 'falter' && st !== 'gross') return st === 'baby' ? caterpillar(mood) : pupa(mood);
    if (k === 'frosch' && st === 'baby') return tadpole(mood);
    const dlook = { ...o };
    if (k === 'ente') { dlook.c = st === 'baby' ? '#F7D44A' : st === 'jung' ? '#F4E3A2' : '#B5AFA6'; dlook.b = st === 'gross' ? '#F2EDE4' : '#FFF6CC'; }
    if (k === 'robbe' && st === 'baby') { dlook.c = '#F4F4F0'; dlook.b = '#FFFFFF'; }
    if (k === 'flamingo') dlook.c = st === 'baby' ? '#C9C9C9' : st === 'jung' ? '#F7C2CF' : '#FF7FA6';
    if (k === 'pinguin' && st === 'baby') { dlook.c = '#8C96A2'; dlook.b = '#DDE2E8'; }
    if (k === 'papagei' && st === 'baby') { dlook.c = '#B9C2CC'; dlook.b = '#DDE2E8'; dlook.wingC = '#9AA3AE'; }
    const B = body(dlook, st, form); dlook._bk = B.bk; dlook._st = st;
    const hr = B.hr; const x = 50; const y = B.hy;
    const tk = (o.tk || 1) * (st === 'baby' ? .7 : st === 'jung' ? .88 : 1);
    const MO = CUR.morph || []; const tk2 = tk * (MO.includes('langschwanz') ? 1.9 : 1);
    if (o.tail && TAIL[o.tail]) { const one = TAIL[o.tail](dlook, B.tail[0], B.tail[1], tk2); back += MO.includes('dreischwanz') ? [-28, 0, 28].map((a) => `<g transform="rotate(${a} ${f(B.tail[0])} ${f(B.tail[1])})">${one}</g>`).join('') : one; }
    back += tailMorph(MO, B.tail[0], B.tail[1], 1);
    if (MO.includes('flammenschwanz')) back += ['#E5483B', '#FF8A3D', '#FFD34D'].map((c, i) => P(`M${f(B.tail[0])} ${f(B.tail[1])} q${f(10 - i * 2)} ${f(-6 + i)} ${f(14 - i * 3)} ${f(-22 + i * 5)} q${f(-2)} ${f(10)} ${f(-6 + i)} ${f(14 - i * 2)} q${f(4)} ${f(-6)} ${f(-8 + i * 2)} ${f(8 - i * 2)}z`, c, 'class="flk"')).join('');
    if (o.wings || o.batWings) back += wings(dlook, st, form, B);
    if (o.insect === 'bee' || o.insect === 'fly') back += insectWings(dlook, st, form, B);
    if (o.insect === 'lady') back += ladyShell(st, form);
    if (o.bird === 'humm') back += insectWings({ insect: 'bee' }, st, form, B);
    // spikes behind (hedgehog)
    if (o.spikes) { const n = big ? 22 : mid ? 16 : 11; const cy0 = (y + 80) / 2; const RX = hr * 1.25, RY = (80 - y) / 2 + hr * 1.0; const L = big ? 6 : mid ? 4.5 : 3; let pts = ''; for (let i = 0; i <= n; i++) { const a = Math.PI * (.92 + 1.16 * i / n); const a2 = Math.PI * (.92 + 1.16 * (i + .5) / n); pts += `${f(x + Math.cos(a) * RX)},${f(cy0 + Math.sin(a) * RY)} ${f(x + Math.cos(a2) * (RX + L))},${f(cy0 + Math.sin(a2) * (RY + L))} `; } back += `<polygon points="${pts}" fill="${G(o.spikes)}"/>`; }
    mid2 += B.mid;
    if (o.bodyX) mid2 += o.bodyX({ form }, st, form);
    if (o.belly) mid2 += S(form === 'stand' ? 'M45 68 h10 M44.5 72 h11 M45 76 h10 M46 80 h8' : 'M42 76 h16 M41 80 h18 M42 84 h16', dk(o.b, .2), .8);
    if (o.spots && mid) mid2 += [[45, 70], [55, 68], [52, 77], [44, 79], [57, 81]].map(([a, b2]) => C(a, form === 'stand' ? b2 : b2 + 6, 1.2, o.spots, 'opacity=".75"')).join('');
    if (o.spotsBaby && st !== 'gross') mid2 += [[45, 68], [55, 70], [50, 74], [44, 78], [56, 79]].map(([a, b2]) => C(a, form === 'stand' ? b2 : b2 + 6, 1.1, '#fff')).join('');
    if (o.stripesV && mid) mid2 += S(form === 'stand' ? 'M46 64 v18 M54 64 v18' : 'M44 70 v20 M56 70 v20', o.stripesV, 1.4, 'opacity=".8"');
    if (o.insect === 'bee') mid2 += beeStripes(form, st);
    if (o.insect === 'lady') { const ys = form === 'stand' ? [66, 72, 78] : [72, 80, 87]; const n = st === 'baby' ? 2 : st === 'jung' ? 4 : 6; mid2 += S(`M50 ${f(ys[0] - 4)} V${f(ys[2] + 5)}`, '#1E1E1E', .9) + [[-4.5, 0], [4.5, 0], [-6, 1], [6, 1], [-4, 2], [4, 2]].slice(0, n).map(([dx, i]) => C(50 + dx, ys[i], 1.9, '#1E1E1E')).join(''); }
    // arms
    const armKind = o.bird ? (o.bird === 'peng' ? 'flipper' : 'wing') : o.flippers ? 'flipper' : o.batWings ? 'none' : 'paw';
    front += arms(dlook, B.sh, form, armKind);
    if (o.claws) front += [B.sh[0] - (form === 'stand' ? 2.6 : .5), B.sh[2] + (form === 'stand' ? 2.6 : .5)].map((cx) => S(`M${f(cx - 1.5)} ${f(B.sh[1] + (form === 'stand' ? 12.5 : 9.5))} l-.6 2 M${f(cx)} ${f(B.sh[1] + (form === 'stand' ? 13 : 10))} v2.2 M${f(cx + 1.5)} ${f(B.sh[1] + (form === 'stand' ? 12.5 : 9.5))} l.6 2`, '#F3E6CC', .8)).join('');
    if (o.neck) front += o.neck(x, y + hr * .9, st);
    // long bird legs (flamingo) are drawn completely by the body
    // ears behind the head
    headB += morphBack((CUR.morph || []).filter((d) => ['megamaehne','elfenohren','glutmaehne','blattmaehne','eiskragen','flossen','mondhalo','sonnenkranz'].includes(d)), x, y, hr, dlook, {});
    if (o.ear && EARS[o.ear]) headB += EARS[o.ear](dlook, x, y, hr, mood, o.earK);
    if (o.horns && mid) { const L = big ? 1 : .6; headB += [-1, 1].map((sg) => P(`M${f(x + sg * hr * .3)} ${f(y - hr * .8)} Q${f(x + sg * hr * .75)} ${f(y - hr * (1.05 + .25 * L))} ${f(x + sg * hr * (.95 + .2 * L))} ${f(y - hr * (1.15 + .35 * L))} Q${f(x + sg * hr * .85)} ${f(y - hr * .85)} ${f(x + sg * hr * .7)} ${f(y - hr * .62)}z`, '#F3E2B0', 'stroke="#C9B07A" stroke-width=".5"')).join(''); }
    if (o.gills) { const n = big ? 4 : mid ? 3 : 2; headB += [-1, 1].map((sg) => Array.from({ length: n }, (_, i) => { const a = (-40 + i * (60 / Math.max(1, n - 1))) * Math.PI / 180; const x0 = x + sg * hr * .85, y0 = y - hr * .1 + i * 1.5; const L = hr * (big ? .75 : .55); return S(`M${f(x0)} ${f(y0)} q${f(sg * L * .5)} ${f(-L * .2 + Math.sin(a) * L * .3)} ${f(sg * L)} ${f(Math.sin(a) * L)}`, o.gills, 2.6) + C(x0 + sg * L, y0 + Math.sin(a) * L, 1.5, o.gills); }).join('')).join(''); }
    if (o.horse) headB += maneBack(dlook, x, y, hr, st);
    // head base
    let hx = x, hy = y;
    if (o.horse) head += E(x, y - hr * .05, hr * .82, hr * .95, G(dlook.c)) + E(x, y + hr * .62, hr * .66, hr * .48, G(o.muzC || lt(dlook.c, .3)));
    else if (o.frog) head += E(x, y + 1, hr * 1.25, hr * .85, G(dlook.c)) + C(x - hr * .62, y - hr * .62, hr * .42, G(dlook.c)) + C(x + hr * .62, y - hr * .62, hr * .42, G(dlook.c));
    else if (o.reptile) head += E(x, y, hr * 1.08, hr * .9, G(dlook.c)) + (o.casque ? '' : E(x, y + hr * .4, hr * .7, hr * .35, o.b, 'opacity=".55"'));
    else if (o.wide) head += E(x, y, hr * 1.18, hr * .92, G(dlook.c));
    else head += C(x, y, hr, G(dlook.c));
    const hb = head.length;
    // muzzle and markings
    if (o.bird) head += birdHead(dlook, k, st, x, y, hr);
    else if (o.insect) head += insectHead(o.insect, st, x, y, hr);
    else if (o.h) head += o.h(x, y, hr, st);
    if (o.hx) head += o.hx(x, y, hr, st);
    if (!o.bird && !o.insect && !o.horse && !o.frog && !o.reptile && !o.wide && !o.h && !o.sloth) head += E(x, y + hr * .42, hr * .5, hr * .35, o.b || lt(o.c, .4));
    if (o.horse && o.blaze) head += P(`M${f(x - hr * .12)} ${f(y - hr * .8)} L${f(x + hr * .12)} ${f(y - hr * .8)} L${f(x + hr * .25)} ${f(y + hr * .6)} L${f(x - hr * .25)} ${f(y + hr * .6)}z`, '#fff', 'opacity=".9"');
    if (o.sloth) head += E(x, y + hr * .05, hr * .82, hr * .62, '#EADBC6') + [-1, 1].map((sg) => P(`M${f(x + sg * hr * .75)} ${f(y + hr * .05)} q${f(-sg * hr * .3)} ${f(-hr * .38)} ${f(-sg * hr * .6)} ${f(-hr * .05)} q${f(sg * hr * .1)} ${f(hr * .32)} ${f(sg * hr * .6)} ${f(hr * .2)}z`, '#5A4632')).join('');
    if (o.casque) head += P(`M${f(x - hr * .75)} ${f(y - hr * .55)} Q${f(x)} ${f(y - hr * (big ? 2.05 : mid ? 1.75 : 1.4))} ${f(x + hr * .75)} ${f(y - hr * .55)}z`, G(dk(dlook.c, .05))) + S(`M${f(x - hr * .4)} ${f(y - hr * .75)} Q${f(x)} ${f(y - hr * (big ? 1.55 : mid ? 1.35 : 1.1))} ${f(x + hr * .4)} ${f(y - hr * .75)}`, lt(dlook.c, .35), 1.2);
    if (o.cheeks) head += C(x - hr * .78, y + hr * .3, hr * .34, G(o.cheeks)) + C(x + hr * .78, y + hr * .3, hr * .34, G(o.cheeks));
    if (o.snout && !o.h) head += E(x, y + hr * .45, hr * .42, hr * .32, o.b || lt(o.c, .4));
    // face
    const fo = { bk: B.bk, c: dlook.c, eyeR: o.frog ? .2 : o.bird === 'owl' ? .2 : .14, eyeGap: o.frog ? .62 : o.reptile ? .5 : o.horse ? .5 : .38, eyeY: o.frog ? -.62 : o.horse ? -.2 : o.bird === 'owl' ? -.1 : 0, eyeRing: o.eyeRing, eyeWhite: o.eyeWhite || o.frog, eyeC: o.eyeC, noBlush: o.bird === 'owl' };
    if (o.turret) { fo.eyeGap = .62; fo.eyeY = -.1; head += [-1, 1].map((sg) => E(x + sg * hr * .62, y - hr * .1, hr * .3, hr * .3, G(lt(dlook.c, .1)))).join(''); }
    if (o.bird === 'owl') head += C(x - hr * .4, y - hr * .1, hr * .3, '#F5B83D') + C(x + hr * .4, y - hr * .1, hr * .3, '#F5B83D');
    front += '';
    let F = face(x, y, hr, mood, fo);
    if (o.bird === 'owl') F = face(x, y, hr, mood, { ...fo, eyeGap: .4, eyeR: .17 });
    top += F;
    // nose + mouth
    const my = y + hr * (o.frog ? .42 : o.horse ? .7 : o.bird ? .62 : .58);
    if (o.horse) top += C(x - hr * .25, y + hr * .62, hr * .07, dk(dlook.c, .4)) + C(x + hr * .25, y + hr * .62, hr * .07, dk(dlook.c, .4)) + mouth(x, y + hr * .82, mood, .8);
    else if (o.bigNose) top += E(x, y + hr * .28, hr * .3, hr * .36, '#3A3D42') + E(x - hr * .08, y + hr * .16, hr * .08, hr * .05, '#fff', 'opacity=".5"') + mouth(x, y + hr * .74, mood, .8);
    else if (o.sloth) top += E(x, y + hr * .3, hr * .16, hr * .11, '#3a2a20') + mouth(x, y + hr * .55, mood, .8);
    else if (!o.bird && !o.insect) {
      if (o.nose !== false) top += E(x, y + hr * .3, 2.3, 1.7, o.nose || INK);
      if (o.reptile) top += C(x - 1.6, y + hr * .25, .6, dk(dlook.c, .4)) + C(x + 1.6, y + hr * .25, .6, dk(dlook.c, .4));
      top += mouth(x, my - (o.frog ? 0 : 0), mood, o.frog || o.wide ? 1.5 : 1);
      if (o.teeth && mid && mood !== 'freut') top += `<rect x="${f(x - 2)}" y="${f(my + .4)}" width="4" height="${f(big ? 3.2 : 2.4)}" rx=".6" fill="${typeof o.teeth === 'string' ? o.teeth : '#fff'}" stroke="#c9c2b8" stroke-width=".3"/>`;
      if (o.fang && mid && mood !== 'freut') top += P(`M${f(x - 2)} ${f(my + .3)} l.8 2 .8 -2z M${f(x + .4)} ${f(my + .3)} l.8 2 .8 -2z`, '#fff');
      if (o.tongue && (mood === 'froh' || mood === 'freut')) top += E(x + .5, my + 2.6, 1.6, 2, '#F06A7E');
      if (o.reptile && !o.horns && mood === 'froh') top += S(`M${f(x)} ${f(my + 1)} v3 l-1.2 1.4 M${f(x)} ${f(my + 4)} l1.2 1.4`, '#E5485A', .8);
    } else if (o.insect) top += mouth(x, y + hr * .5, mood, .8);
    else top += '';
    if (o.whisk) top += S(`M${f(x - hr * .38)} ${f(y + hr * .35)} l${f(-hr * .6)} -2 M${f(x - hr * .38)} ${f(y + hr * .46)} l${f(-hr * .6)} 2 M${f(x + hr * .38)} ${f(y + hr * .35)} l${f(hr * .6)} -2 M${f(x + hr * .38)} ${f(y + hr * .46)} l${f(hr * .6)} 2`, '#6b7380', .7);
    if (o.horn) { const H = big ? 14 : mid ? 8 : 3.5; top += P(`M${f(x - 2.6)} ${f(y - hr * .82)} L${f(x)} ${f(y - hr * .82 - H)} L${f(x + 2.6)} ${f(y - hr * .82)}z`, '#F7D46B', 'stroke="#C99A16" stroke-width=".5"') + S(`M${f(x - 1.6)} ${f(y - hr * .82 - H * .3)} l3 -1 M${f(x - 1)} ${f(y - hr * .82 - H * .6)} l2 -.8`, '#C99A16', .6); }
    if (o.horse) top += maneFront(dlook, x, y, hr, st);
    if (o.antler && (big || (o.ear === 'long' && mid))) top += S(`M${f(x - hr * .4)} ${f(y - hr * .85)} l-2 -7 l-3 -2 M${f(x - hr * .4 - 1.2)} ${f(y - hr * .85 - 4)} l2.6 -2.4 M${f(x + hr * .4)} ${f(y - hr * .85)} l2 -7 l3 -2 M${f(x + hr * .4 + 1.2)} ${f(y - hr * .85 - 4)} l-2.6 -2.4`, '#6B4A2A', 2.2);
    if (o.horns && mid) top += [-1, 1].map((sg) => P(`M${f(x + sg * hr * .15)} ${f(y - hr * .95)} l${f(sg * 1.6)} -3.6 l${f(sg * 1.6)} 3.4z`, o.a)).join('');
    if (o.bird === 'owl' && mid) top += P(`M${f(x - hr * .82)} ${f(y - hr * .55)} l${f(-hr * .15)} ${f(-hr * .55)} l${f(hr * .5)} ${f(hr * .3)}z M${f(x + hr * .82)} ${f(y - hr * .55)} l${f(hr * .15)} ${f(-hr * .55)} l${f(-hr * .5)} ${f(hr * .3)}z`, dk(dlook.c, .15));
    const S0 = ST[st];
    const BD = { x: 50, y0: B.sh[1] - 3, y1: form === 'stand' ? 86 : 90, w: (B.sh[2] - B.sh[0]) / 2 + 1 };
    const inner = `${morphBack((CUR.morph || []).filter((d) => !['megamaehne','elfenohren','glutmaehne','blattmaehne','eiskragen','flossen','mondhalo','sonnenkranz'].includes(d)), x, y, hr, dlook, BD)}<g class="tl">${backX(CUR.back, x, y, hr, dlook, st, BD)}${back}</g>${mid2}<g class="er">${headB}</g>${head.slice(0, hb)}<g class="fc">${under(CUR.under, x, y, hr, dlook)}${head.slice(hb)}${top}${morphTop(CUR.morph, x, y, hr, dlook)}</g>${front}${patt(CUR.pat, x, y, hr, BD, form)}${deco(CUR.deco, x, y, hr, 'front', dlook, st, { x: 50, y0: B.sh[1] - 3, y1: form === 'stand' ? 86 : 90, w: (B.sh[2] - B.sh[0]) / 2 + 1, feet: form === 'stand' ? [[44.8, 93.4], [55.2, 93.4]] : [[50 - (B.sh[2] - B.sh[0]) * .5, 92.6], [50 + (B.sh[2] - B.sh[0]) * .5, 92.6]] })}`;
    return { s: `<g transform="translate(50 95) scale(${S0}) translate(-50 -95)">${inner}</g>`, fx: moodFx(mood, 50, 95 - (95 - y) * S0, hr * S0), hy: 95 - (95 - y) * S0, hr: hr * S0 };
  };
  // ---------------------------------------------------------------- species parts
  const maneBack = (o, x, y, hr, st) => { const cols = o.maneC; const n = st === 'baby' ? 1 : st === 'jung' ? 2 : cols.length; return cols.slice(0, n).map((c, i) => P(`M${f(x - hr * .5 + i * 1.6)} ${f(y - hr * .95)} Q${f(x - hr * 1.3)} ${f(y - hr * .2 + i * 2)} ${f(x - hr * .95 + i * 1.5)} ${f(y + hr * 1.2)} Q${f(x - hr * .5)} ${f(y + hr * .3)} ${f(x - hr * .2)} ${f(y - hr * .6)}z`, c)).join(''); };
  const maneFront = (o, x, y, hr, st) => { const cols = o.maneC; const n = st === 'baby' ? 1 : st === 'jung' ? 2 : cols.length; return cols.slice(0, n).map((c, i) => P(`M${f(x - hr * .45 + i * 2.4)} ${f(y - hr * .98)} q${f(hr * .2)} ${f(hr * .35)} ${f(-hr * .05)} ${f(hr * .6)} q${f(hr * .3)} ${f(-hr * .2)} ${f(hr * .4)} ${f(-hr * .6)}z`, c)).join(''); };
  const wings = (o, st, form, B) => {
    const big = st === 'gross'; const mid = st !== 'baby'; const sx = 50, sy = B.sh[1] - (o.batWings ? 2 : o.feather ? 2 : 6);
    if (o.batWings) { const W = big ? 32 : mid ? 24 : 15; return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'}" style="transform-origin:${f(sx + sg * 5)}px ${f(sy)}px">${P(`M${f(sx + sg * 5)} ${f(sy)} L${f(sx + sg * W * .55)} ${f(sy - 10)} L${f(sx + sg * W)} ${f(sy - 4)} Q${f(sx + sg * W * .9)} ${f(sy + 4)} ${f(sx + sg * W * .72)} ${f(sy + 3)} Q${f(sx + sg * W * .6)} ${f(sy + 9)} ${f(sx + sg * W * .42)} ${f(sy + 6)} Q${f(sx + sg * W * .26)} ${f(sy + 12)} ${f(sx + sg * 5)} ${f(sy + 9)}z`, G(dk(o.c, .1)))}${S(`M${f(sx + sg * 5)} ${f(sy)} L${f(sx + sg * W * .55)} ${f(sy - 10)} L${f(sx + sg * W)} ${f(sy - 4)} M${f(sx + sg * W * .55)} ${f(sy - 10)} L${f(sx + sg * W * .72)} ${f(sy + 3)} M${f(sx + sg * W * .55)} ${f(sy - 10)} L${f(sx + sg * W * .42)} ${f(sy + 6)}`, dk(o.c, .35), .7)}</g>`).join(''); }
    if (o.feather) { const W = big ? 24 : mid ? 16 : 9; const wc = o.wings; return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'}" style="transform-origin:${f(sx + sg * 4)}px ${f(sy)}px">${P(`M${f(sx + sg * 4)} ${f(sy + 4)} Q${f(sx + sg * W * .5)} ${f(sy - W * .9)} ${f(sx + sg * W * 1.1)} ${f(sy - W * .75)} Q${f(sx + sg * W * 1.05)} ${f(sy - W * .4)} ${f(sx + sg * W * .9)} ${f(sy - W * .3)} Q${f(sx + sg * W * .95)} ${f(sy - W * .05)} ${f(sx + sg * W * .72)} ${f(sy)} Q${f(sx + sg * W * .75)} ${f(sy + W * .22)} ${f(sx + sg * W * .5)} ${f(sy + W * .2)} Q${f(sx + sg * W * .45)} ${f(sy + W * .4)} ${f(sx + sg * 6)} ${f(sy + 8)}z`, G(wc))}${S(`M${f(sx + sg * W * .35)} ${f(sy - W * .35)} q${f(sg * W * .3)} ${f(-W * .1)} ${f(sg * W * .5)} ${f(-W * .3)} M${f(sx + sg * W * .35)} ${f(sy - W * .05)} q${f(sg * W * .25)} 0 ${f(sg * W * .45)} ${f(-W * .1)}`, dk(wc, .18), .7)}</g>`).join(''); }
    const W = big ? 26 : mid ? 17 : 8;
    return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'}" style="transform-origin:${f(sx + sg * 4)}px ${f(sy)}px">${P(`M${f(sx + sg * 4)} ${f(sy)} L${f(sx + sg * W * .6)} ${f(sy - W * .9)} L${f(sx + sg * W * 1.1)} ${f(sy - W * .5)} Q${f(sx + sg * W)} ${f(sy)} ${f(sx + sg * W * .75)} ${f(sy - 1)} Q${f(sx + sg * W * .55)} ${f(sy + 5)} ${f(sx + sg * W * .35)} ${f(sy + 2)} Q${f(sx + sg * 10)} ${f(sy + 8)} ${f(sx + sg * 4)} ${f(sy + 6)}z`, G(o.wings))}${S(`M${f(sx + sg * 4)} ${f(sy)} L${f(sx + sg * W * .6)} ${f(sy - W * .9)} L${f(sx + sg * W * 1.1)} ${f(sy - W * .5)} M${f(sx + sg * W * .6)} ${f(sy - W * .9)} L${f(sx + sg * W * .75)} ${f(sy - 1)} M${f(sx + sg * W * .6)} ${f(sy - W * .9)} L${f(sx + sg * W * .35)} ${f(sy + 2)}`, dk(o.c, .25), .8)}</g>`).join('');
  };
  const insectWings = (o, st, form, B) => {
    const sx = 50, sy = B.sh[1]; const big = st === 'gross';
    if (o.insect === 'bee') { const W = big ? 20 : 14; return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'} buzzw" style="transform-origin:${f(sx + sg * 3)}px ${f(sy)}px">${E(sx + sg * W * .75, sy - W * .45, W * .6, W * .4, '#EAF6FF', `opacity=".8" stroke="#B8D8F0" stroke-width=".5" ${R(sg * -30, sx + sg * W * .7, sy - W * .5)}`)}${E(sx + sg * W * .55, sy + 1, W * .35, W * .24, '#EAF6FF', `opacity=".7" ${R(sg * 15, sx + sg * W * .55, sy + 1)}`)}</g>`).join(''); }
    const W = big ? 26 : 18; const cols = ['#8E6CF0', '#FF8FC8'];
    return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'} flapw" style="transform-origin:${f(sx)}px ${f(sy)}px">${P(`M${f(sx)} ${f(sy)} C${f(sx + sg * W * .3)} ${f(sy - W * 1.0)} ${f(sx + sg * W * 1.1)} ${f(sy - W * .9)} ${f(sx + sg * W * .9)} ${f(sy - W * .1)} C${f(sx + sg * W * .8)} ${f(sy + W * .15)} ${f(sx + sg * W * .3)} ${f(sy + W * .05)} ${f(sx)} ${f(sy)}z`, G(cols[0]))}${P(`M${f(sx)} ${f(sy + 2)} C${f(sx + sg * W * .7)} ${f(sy + W * .1)} ${f(sx + sg * W * .75)} ${f(sy + W * .6)} ${f(sx + sg * W * .35)} ${f(sy + W * .55)} C${f(sx + sg * W * .15)} ${f(sy + W * .5)} ${f(sx + sg * 2)} ${f(sy + W * .3)} ${f(sx)} ${f(sy + 2)}z`, G(cols[1]))}${C(sx + sg * W * .62, sy - W * .55, W * .14, '#FFC94D')}${C(sx + sg * W * .45, sy + W * .32, W * .09, '#fff', 'opacity=".8"')}</g>`).join('');
  };
  const ladyShell = (st, form) => {
    const big = st === 'gross'; const y0 = form === 'stand' ? 58 : 66; const h = form === 'stand' ? 30 : 30; const W = 17;
    const spots = st === 'baby' ? [[-.5, .4], [.5, .4]] : st === 'jung' ? [[-.55, .3], [.55, .3], [-.4, .7], [.4, .7]] : [[-.55, .25], [.55, .25], [-.62, .6], [.62, .6], [-.35, .85], [.35, .85], [0, .55]];
    return [-1, 1].map((sg) => P(`M50 ${f(y0)} Q${f(50 + sg * W * 1.15)} ${f(y0 + 2)} ${f(50 + sg * W)} ${f(y0 + h * .75)} Q${f(50 + sg * W * .6)} ${f(y0 + h)} 50 ${f(y0 + h * .95)}z`, G('#E5352D'))).join('') + spots.map(([sx, sy]) => C(50 + sx * W, y0 + sy * h * .9, big ? 2.6 : 2.2, '#1E1E1E')).join('') + S(`M50 ${f(y0)} V${f(y0 + h * .95)}`, '#1E1E1E', .9);
  };
  const beeStripes = (form, st) => (form === 'stand' ? [66, 72, 78].slice(0, st === 'baby' ? 2 : 3).map((yy) => P(`M${f(41.5 + (yy - 62) * .12)} ${f(yy)} H${f(58.5 - (yy - 62) * .12)} v2.6 H${f(41.5 + (yy - 62) * .12)}z`, '#2B2420')).join('') : [72, 79, 86].slice(0, st === 'baby' ? 2 : 3).map((yy) => P(`M${f(37 + Math.abs(80 - yy) * .4)} ${f(yy)} H${f(63 - Math.abs(80 - yy) * .4)} v3 H${f(37 + Math.abs(80 - yy) * .4)}z`, '#2B2420')).join('')) + E(50, form === 'stand' ? 86 : 94, 1.4, 2, '#2B2420');
  const insectHead = (t, st, x, y, hr) => {
    let s = '';
    if (t === 'bee') s += S(`M${f(x - hr * .3)} ${f(y - hr * .85)} q${f(-hr * .2)} ${f(-hr * .6)} ${f(-hr * .55)} ${f(-hr * .7)} M${f(x + hr * .3)} ${f(y - hr * .85)} q${f(hr * .2)} ${f(-hr * .6)} ${f(hr * .55)} ${f(-hr * .7)}`, '#2B2420', 1.2) + C(x - hr * .85, y - hr * 1.55, 1.6, '#2B2420') + C(x + hr * .85, y - hr * 1.55, 1.6, '#2B2420') + S(`M${f(x - hr * .7)} ${f(y - hr * .55)} q${f(hr * .7)} ${f(-hr * .3)} ${f(hr * 1.4)} 0`, '#C9921A', 1, 'opacity=".6"');
    if (t === 'lady') s += S(`M${f(x - hr * .3)} ${f(y - hr * .85)} q${f(-hr * .1)} ${f(-hr * .6)} ${f(-hr * .45)} ${f(-hr * .75)} M${f(x + hr * .3)} ${f(y - hr * .85)} q${f(hr * .1)} ${f(-hr * .6)} ${f(hr * .45)} ${f(-hr * .75)}`, '#1E1E1E', 1.1) + C(x - hr * .75, y - hr * 1.62, 1.5, '#1E1E1E') + C(x + hr * .75, y - hr * 1.62, 1.5, '#1E1E1E') + E(x - hr * .62, y + hr * .55, hr * .22, hr * .14, '#fff', 'opacity=".9"') + E(x + hr * .62, y + hr * .55, hr * .22, hr * .14, '#fff', 'opacity=".9"');
    if (t === 'fly') s += S(`M${f(x - hr * .25)} ${f(y - hr * .9)} q${f(-hr * .2)} ${f(-hr * .7)} ${f(-hr * .6)} ${f(-hr * .8)} M${f(x + hr * .25)} ${f(y - hr * .9)} q${f(hr * .2)} ${f(-hr * .7)} ${f(hr * .6)} ${f(-hr * .8)}`, '#3a2d50', 1.1) + C(x - hr * .85, y - hr * 1.7, 1.7, '#FFC94D') + C(x + hr * .85, y - hr * 1.7, 1.7, '#FFC94D');
    return s;
  };
  const birdHead = (o, k, st, x, y, hr) => {
    const big = st === 'gross'; const mid = st !== 'baby'; let s = '';
    if (o.bird === 'owl') s += E(x, y + hr * .05, hr * .9, hr * .75, '#F2E2C2') + S(`M${f(x)} ${f(y - hr * .7)} v${f(hr * .5)}`, dk(o.c, .1), 1.2) + P(`M${f(x - 2)} ${f(y + hr * .2)} L${f(x + 2)} ${f(y + hr * .2)} L${f(x)} ${f(y + hr * .55)}z`, '#E3A33B');
    if (o.bird === 'peng') s += P(`M${f(x - hr * .75)} ${f(y + hr * .7)} Q${f(x - hr * .8)} ${f(y - hr * .2)} ${f(x - hr * .2)} ${f(y - hr * .15)} Q${f(x)} ${f(y + hr * .05)} ${f(x + hr * .2)} ${f(y - hr * .15)} Q${f(x + hr * .8)} ${f(y - hr * .2)} ${f(x + hr * .75)} ${f(y + hr * .7)} Q${f(x)} ${f(y + hr * 1.05)} ${f(x - hr * .75)} ${f(y + hr * .7)}z`, o.b) + (big ? E(x - hr * .82, y + hr * .25, hr * .18, hr * .3, '#F7B731') + E(x + hr * .82, y + hr * .25, hr * .18, hr * .3, '#F7B731') : '') + P(`M${f(x - 2.4)} ${f(y + hr * .32)} L${f(x + 2.4)} ${f(y + hr * .32)} L${f(x)} ${f(y + hr * .62)}z`, big ? '#2a2a2a' : '#3a3a3a') + (big ? S(`M${f(x - 1.6)} ${f(y + hr * .4)} h3.2`, '#F59A23', 1) : '');
    if (o.bird === 'duck') { if (big) s += P(`M${f(x - hr)} ${f(y + hr * .2)} A${f(hr)} ${f(hr)} 0 0 1 ${f(x + hr)} ${f(y + hr * .2)} L${f(x + hr * .9)} ${f(y + hr * .5)} Q${f(x)} ${f(y + hr * .7)} ${f(x - hr * .9)} ${f(y + hr * .5)}z`, G('#2E8A4A')) + S(`M${f(x - hr * .85)} ${f(y + hr * .78)} Q${f(x)} ${f(y + hr * 1.0)} ${f(x + hr * .85)} ${f(y + hr * .78)}`, '#fff', 1.6); else if (st === 'baby') s += S(`M${f(x - 1)} ${f(y - hr * .95)} q-1 -4 2 -5 M${f(x + 1)} ${f(y - hr * .95)} q2 -3 4 -2`, '#EFC53A', 1.2);
      s += E(x, y + hr * .42, hr * .45, hr * .2, big ? '#E8C23A' : '#F08A1E') + E(x, y + hr * .5, hr * .38, hr * .14, big ? '#D9AE24' : '#E07A10'); }
    if (o.bird === 'parrot') { if (mid) s += E(x - hr * .38, y, hr * .32, hr * .4, '#fff') + E(x + hr * .38, y, hr * .32, hr * .4, '#fff'); s += P(`M${f(x - 3.2)} ${f(y + hr * .2)} Q${f(x)} ${f(y + hr * .05)} ${f(x + 3.2)} ${f(y + hr * .2)} Q${f(x + 2.4)} ${f(y + hr * .75)} ${f(x)} ${f(y + hr * .9)} Q${f(x - .6)} ${f(y + hr * .5)} ${f(x - 3.2)} ${f(y + hr * .2)}z`, '#3a3a3a') + P(`M${f(x - 2)} ${f(y + hr * .45)} Q${f(x)} ${f(y + hr * .62)} ${f(x + 2)} ${f(y + hr * .45)} L${f(x)} ${f(y + hr * .58)}z`, '#cfcfcf'); }
    if (o.bird === 'flamingo') s += P(`M${f(x - 2.6)} ${f(y + hr * .15)} Q${f(x + 1)} ${f(y + hr * .1)} ${f(x + 3)} ${f(y + hr * .3)} Q${f(x + 3.4)} ${f(y + hr * .8)} ${f(x + 1)} ${f(y + hr * 1.0)} Q${f(x + 1.6)} ${f(y + hr * .55)} ${f(x - 2.6)} ${f(y + hr * .5)}z`, mid ? '#F2E6E6' : '#555') + (mid ? P(`M${f(x + 2.4)} ${f(y + hr * .6)} Q${f(x + 3.4)} ${f(y + hr * .8)} ${f(x + 1)} ${f(y + hr * 1.0)} Q${f(x + 1.4)} ${f(y + hr * .75)} ${f(x + 1.6)} ${f(y + hr * .6)}z`, '#2a2a2a') : '');
    if (o.bird === 'griffin') s += P(`M${f(x - 3.2)} ${f(y + hr * .15)} Q${f(x)} ${f(y + hr * .02)} ${f(x + 3.2)} ${f(y + hr * .15)} Q${f(x + 2.6)} ${f(y + hr * .7)} ${f(x)} ${f(y + hr * .85)} Q${f(x - .4)} ${f(y + hr * .45)} ${f(x - 3.2)} ${f(y + hr * .15)}z`, '#F5B83D') + S(`M${f(x - hr * .75)} ${f(y - hr * .3)} l${f(hr * .3)} ${f(hr * .1)} M${f(x + hr * .75)} ${f(y - hr * .3)} l${f(-hr * .3)} ${f(hr * .1)}`, '#C9C2B8', 1.2);
    if (o.bird === 'phoenix') s += P(`M${f(x - 2.6)} ${f(y + hr * .2)} L${f(x + 2.6)} ${f(y + hr * .2)} L${f(x)} ${f(y + hr * .62)}z`, '#F5B83D');
    if (o.bird === 'griffin') s += P(`M${f(x - 3.2)} ${f(y + hr * .15)} Q${f(x)} ${f(y + hr * .02)} ${f(x + 3.2)} ${f(y + hr * .15)} Q${f(x + 2.6)} ${f(y + hr * .7)} ${f(x)} ${f(y + hr * .85)} Q${f(x - .4)} ${f(y + hr * .45)} ${f(x - 3.2)} ${f(y + hr * .15)}z`, '#F5B83D') + S(`M${f(x - hr * .75)} ${f(y - hr * .3)} l${f(hr * .3)} ${f(hr * .1)} M${f(x + hr * .75)} ${f(y - hr * .3)} l${f(-hr * .3)} ${f(hr * .1)}`, '#C9C2B8', 1.2);
    if (o.bird === 'phoenix') s += P(`M${f(x - 2.6)} ${f(y + hr * .2)} L${f(x + 2.6)} ${f(y + hr * .2)} L${f(x)} ${f(y + hr * .62)}z`, '#F5B83D');
    if (o.bird === 'humm') s += (big ? E(x, y + hr * .9, hr * .5, hr * .2, '#E5304F') : '') + S(`M${f(x + hr * .1)} ${f(y + hr * .38)} l${f(hr * (big ? 1.25 : .8))} ${f(hr * .12)}`, '#2a2a2a', 1.4) + E(x + hr * .05, y + hr * .38, 1.8, 1.4, '#2a2a2a');
    return s;
  };
  const caterpillar = (mood) => { let s = ''; for (let i = 4; i >= 0; i--) s += C(34 + i * 7, 88 - (i % 2) * 2, 6.5, G(i % 2 ? '#8CD06A' : '#6CBF4F')) + C(34 + i * 7, 84 - (i % 2) * 2, 1.4, '#FFC94D'); s += C(72, 82, 9, G('#7CC85A')) + S('M68 74 l-3 -6 M76 74 l3 -6', '#3a2d50', 1.2) + C(65, 68, 1.6, '#FF8FC8') + C(79, 68, 1.6, '#FF8FC8') + face(72, 82, 9, mood, { c: '#7CC85A', eyeR: .16 }) + mouth(72, 86.5, mood, .6); return { s: `<g transform="translate(50 95) scale(.85) translate(-50 -95)">${s}</g>`, fx: moodFx(mood, 70, 80, 8), hy: 80, hr: 8 }; };
  const pupa = (mood) => ({ s: `${S('M50 28 v8', '#7a5230', 2)}${P('M50 36 C62 40 63 62 56 80 Q50 90 44 80 C37 62 38 40 50 36z', G('#B5C98A'))}${S('M43 52 Q50 56 57 52 M42 62 Q50 66 58 62 M44 72 Q50 76 56 72', '#8EA35E', 1.2)}${face(50, 50, 9, mood === 'froh' ? 'schlaeft' : mood, { c: '#B5C98A', eyeR: .14 })}`, fx: moodFx(mood, 50, 50, 9), hy: 50, hr: 9 });
  const tadpole = (mood) => ({ s: `<g class="wag" style="transform-origin:46px 80px">${P('M46 80 C30 74 22 82 16 78 C22 88 32 90 46 86z', G('#4E8A34'))}</g>${C(55, 82, 12, G('#5FA83E'))}${face(55, 80, 12, mood, { c: '#5FA83E', eyeR: .16, eyeGap: .42, eyeWhite: 1 })}${mouth(55, 87, mood, .8)}`, fx: moodFx(mood, 55, 80, 12), hy: 80, hr: 12 });

  const svg = (kind, stage, mood, opt) => {
    const o = opt || {}; mood = mood || 'froh'; stage = stage || 'gross'; const form = o.body || 'stand';
    if (!BY[kind]) return ''; uid += 1; defs = ''; CUR = { pal: o.pal, deco: o.deco, pat: o.pat, under: o.under, back: o.back, morph: o.morph };
    const r = draw(kind, stage, mood, form); CUR = {};
    const skId = o.skin ? skinDef(o.skin) : ''; const S0 = ({ baby: .6, jung: .8, gross: 1 })[stage]; const cyA = 95 - 33 * S0;
    const au = aura(o.aura, cyA, S0); const so = o.skin ? skinOver(o.skin, cyA, S0) : '';
    const sp = BY[kind][2];
    const anim = ({ freut: 'hop', muede: 'sway', sauer: 'shake', hungrig: 'look', stolz: 'proud', froh: 'idle', schlaeft: 'breath' })[mood];
    const bowl = mood === 'hungrig' && !o.noBowl ? `<g transform="translate(80 92)">${P('M-7 0 h14 l-2 4 h-10z', '#4FA3E0')}${E(0, 0, 7, 1.5, '#3A86C8')}</g>` : '';
    const sh = E(50, 95.5, 20 * ({ baby: .62, jung: .82, gross: 1 })[stage], 2.2, '#000', 'opacity=".16"');
    const filt = o.shiny ? ' style="filter:hue-rotate(160deg) saturate(1.2)"' : sp.shift ? ' class="chroma"' : '';
    const spk = o.shiny ? '<g class="spk"><path d="M14 22l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fff"/><path d="M84 16l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z" fill="#FFF3A0"/></g>' : '';
    const skG = (h) => o.skin === 'regenbogen' ? `<g class="rbw">${h}</g>` : skId ? `<g filter="url(#${skId})">${h}</g>` : h;
    return `<svg class="p4 m-${mood}" viewBox="${o.view || '0 0 100 100'}" xmlns="http://www.w3.org/2000/svg" overflow="visible"><defs>${defs}</defs>${o.noShadow ? '' : sh}${au}<g${filt}><g class="${anim}">${skG(r.s)}${so}</g></g>${r.fx}${bowl}${spk}</svg>`;
  };
  const egg = (kind) => {
    const c = (BY[kind] && BY[kind][2].c) || '#9AA3AD'; uid += 1; const id = 'eg' + uid;
    return `<svg class="p4 egg" viewBox="0 0 100 100"><defs><radialGradient id="${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="${lt(c, .78)}"/><stop offset="1" stop-color="${lt(c, .5)}"/></radialGradient></defs><ellipse cx="50" cy="95.5" rx="13" ry="2" fill="#000" opacity=".15"/><g class="wob"><path d="M50 50c10 0 16 16 16 28 0 10-7 17-16 17s-16-7-16-17c0-12 6-28 16-28z" fill="url(#${id})"/><path d="M36 76c5-3 9 2 14-1s9 2 15-1" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity=".75"/><circle cx="44" cy="64" r="3" fill="${c}" opacity=".55"/><circle cx="57" cy="86" r="2.4" fill="${c}" opacity=".55"/></g></svg>`;
  };




  // ================================================================ shape changes for end forms (round 12): wings, fans, spikes, long tails, big hair, beaks, fangs, horns
  const MORPH_TXT = { glutmaehne: 'Glut-Mähne', blattmaehne: 'Blätter-Mähne', eiskragen: 'Eis-Kragen', flossen: 'Wasser-Flossen', mondhalo: 'Mond-Schein', sonnenkranz: 'Sonnen-Kranz', zuckerhorn: 'Zucker-Horn', pilzhut: 'Pilz-Hut', riesenbluete: 'Riesen-Blüte', sternschweif: 'Sternschnuppen-Schweif', wolkenschweif: 'Wolken-Schweif', engelsfluegel: 'Engelsflügel', drachenfluegel: 'Drachenflügel', schmetterlingsfluegel: 'Schmetterlingsflügel', feuerfluegel: 'Feuerflügel', faecher: 'Pfauenfächer', rueckenzacken: 'Kristallzacken', langschwanz: 'Extra-langer Schwanz', dreischwanz: 'Drei Schwänze', flammenschwanz: 'Flammenschwanz', megamaehne: 'Mega-Mähne', stachelfrisur: 'Stachelfrisur', lockenpracht: 'Lockenpracht', kakadu: 'Federhaube', tukan: 'Tukan-Schnabel', haken: 'Adlerschnabel', saebelzahn: 'Säbelzähne', widderhoerner: 'Widderhörner', kristallhorn: 'Kristallhorn', grossgeweih: 'Riesengeweih', elfenohren: 'Elfenohren' };
  const mWing = (kind, o, b, sc) => {
    const sx = 50, sy = b.y0 + 4; const W = 34 * (sc || 1);
    const one = (sg) => {
      if (kind === 'engelsfluegel') { const c = o.wings && o.wings !== '#FFFFFF' ? lt(o.wings, .5) : '#FFFFFF'; let p = `M${f(sx + sg * 3)} ${f(sy + 2)} C${f(sx + sg * W * .3)} ${f(sy - W * .9)} ${f(sx + sg * W * .9)} ${f(sy - W * 1.15)} ${f(sx + sg * W * 1.15)} ${f(sy - W * .95)}`; for (let i = 0; i < 5; i++) { const t = i / 4; p += ` Q${f(sx + sg * W * (1.2 - t * .5))} ${f(sy - W * (.75 - t * .9))} ${f(sx + sg * W * (1.05 - t * .55))} ${f(sy - W * (.6 - t * .95))}`; } p += ` Q${f(sx + sg * W * .25)} ${f(sy + W * .35)} ${f(sx + sg * 3)} ${f(sy + 8)}z`;
        return P(p, G(c), 'stroke="#d9e2ec" stroke-width=".7"') + S(`M${f(sx + sg * W * .25)} ${f(sy - W * .35)} q${f(sg * W * .35)} ${f(-W * .25)} ${f(sg * W * .7)} ${f(-W * .45)} M${f(sx + sg * W * .2)} ${f(sy - W * .05)} q${f(sg * W * .35)} ${f(-W * .1)} ${f(sg * W * .65)} ${f(-W * .2)}`, '#d9e2ec', .8); }
      if (kind === 'drachenfluegel') { const c = o.wings || dk(o.c, .15); return P(`M${f(sx + sg * 3)} ${f(sy)} L${f(sx + sg * W * .55)} ${f(sy - W * 1.05)} L${f(sx + sg * W * 1.25)} ${f(sy - W * .75)} Q${f(sx + sg * W * 1.1)} ${f(sy - W * .3)} ${f(sx + sg * W * .95)} ${f(sy - W * .35)} Q${f(sx + sg * W * .85)} ${f(sy)} ${f(sx + sg * W * .65)} ${f(sy - W * .1)} Q${f(sx + sg * W * .5)} ${f(sy + W * .25)} ${f(sx + sg * W * .32)} ${f(sy + W * .08)} Q${f(sx + sg * W * .2)} ${f(sy + W * .35)} ${f(sx + sg * 3)} ${f(sy + 9)}z`, G(c)) + S(`M${f(sx + sg * 3)} ${f(sy)} L${f(sx + sg * W * .55)} ${f(sy - W * 1.05)} L${f(sx + sg * W * 1.25)} ${f(sy - W * .75)} M${f(sx + sg * W * .55)} ${f(sy - W * 1.05)} L${f(sx + sg * W * .95)} ${f(sy - W * .35)} M${f(sx + sg * W * .55)} ${f(sy - W * 1.05)} L${f(sx + sg * W * .65)} ${f(sy - W * .1)} M${f(sx + sg * W * .55)} ${f(sy - W * 1.05)} L${f(sx + sg * W * .32)} ${f(sy + W * .08)}`, dk(c, .35), 1) + C(sx + sg * W * .55, sy - W * 1.05, 1.6, '#F3E2B0'); }
      if (kind === 'schmetterlingsfluegel') { const c1 = '#B58CFF', c2 = '#FF8FC8'; return P(`M${f(sx)} ${f(sy)} C${f(sx + sg * W * .3)} ${f(sy - W * 1.2)} ${f(sx + sg * W * 1.3)} ${f(sy - W * 1.1)} ${f(sx + sg * W * 1.05)} ${f(sy - W * .15)}z`, G(c1), 'stroke="#fff" stroke-width=".7"') + P(`M${f(sx)} ${f(sy + 3)} C${f(sx + sg * W * .9)} ${f(sy + W * .05)} ${f(sx + sg * W * .9)} ${f(sy + W * .7)} ${f(sx + sg * W * .35)} ${f(sy + W * .6)}z`, G(c2), 'stroke="#fff" stroke-width=".7"') + C(sx + sg * W * .7, sy - W * .55, W * .14, '#FFE066') + C(sx + sg * W * .7, sy - W * .55, W * .06, '#fff') + C(sx + sg * W * .5, sy + W * .35, W * .08, '#fff', 'opacity=".8"'); }
      if (kind === 'feuerfluegel') return ['#E5483B', '#FF8A3D', '#FFD34D'].map((c, i) => P(`M${f(sx + sg * 3)} ${f(sy + 3)} Q${f(sx + sg * W * (.5 - i * .1))} ${f(sy - W * (1.2 - i * .25))} ${f(sx + sg * W * (1.25 - i * .25))} ${f(sy - W * (1.05 - i * .25))} Q${f(sx + sg * W * (.9 - i * .2))} ${f(sy - W * (.55 - i * .15))} ${f(sx + sg * W * (1.05 - i * .25))} ${f(sy - W * (.25 - i * .05))} Q${f(sx + sg * W * .55)} ${f(sy - W * .05)} ${f(sx + sg * W * .75)} ${f(sy + W * .25)} Q${f(sx + sg * W * .35)} ${f(sy + W * .1)} ${f(sx + sg * 3)} ${f(sy + 9)}z`, c, i ? 'class="flk"' : '')).join('');
      return '';
    };
    return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'} bigw" style="transform-origin:${f(sx + sg * 3)}px ${f(sy + 2)}px">${one(sg)}</g>`).join('');
  };
  const tailMorph = (MO, tx, ty, sg) => {
    let h = '';
    if (MO.includes('sternschweif')) { h += P(`M${f(tx)} ${f(ty - 2)} Q${f(tx + sg * 14)} ${f(ty - 6)} ${f(tx + sg * 26)} ${f(ty - 24)} Q${f(tx + sg * 16)} ${f(ty - 4)} ${f(tx)} ${f(ty + 3)}z`, G('#B58CFF'), 'opacity=".9"') + P(`M${f(tx)} ${f(ty - 1)} Q${f(tx + sg * 12)} ${f(ty - 4)} ${f(tx + sg * 22)} ${f(ty - 18)} Q${f(tx + sg * 13)} ${f(ty - 3)} ${f(tx)} ${f(ty + 2)}z`, '#E8E2FF', 'opacity=".7"');
      [[24, -22, 2.6], [17, -12, 1.8], [10, -5, 1.4]].forEach(([dx, dy, s2]) => { const sx = tx + sg * dx, sy = ty + dy; h += P(`M${f(sx)} ${f(sy - s2 * 1.6)} L${f(sx + s2 * .5)} ${f(sy - s2 * .5)} L${f(sx + s2 * 1.6)} ${f(sy)} L${f(sx + s2 * .5)} ${f(sy + s2 * .5)} L${f(sx)} ${f(sy + s2 * 1.6)} L${f(sx - s2 * .5)} ${f(sy + s2 * .5)} L${f(sx - s2 * 1.6)} ${f(sy)} L${f(sx - s2 * .5)} ${f(sy - s2 * .5)}z`, '#FFE27A'); }); }
    if (MO.includes('wolkenschweif')) [[6, -4, 4.2], [12, -10, 5], [18, -18, 4.4], [21, -25, 3.4], [9, -14, 3]].forEach(([dx, dy, rr2], i) => { h += C(tx + sg * dx, ty + dy, rr2, i % 2 ? '#FFFFFF' : '#EAF4FF', 'stroke="#c9dcf0" stroke-width=".5"'); });
    return h;
  };
  const morphBack = (list, x, y, r, o, b) => (list || []).map((d) => {
    if (['engelsfluegel', 'drachenfluegel', 'schmetterlingsfluegel', 'feuerfluegel'].includes(d)) return mWing(d, o, b);
    if (d === 'faecher') { const cx = 50, cy = b.y1 - 2; const cols = [o.c, lt(o.c, .25), dk(o.c, .1)]; return [...Array(11)].map((_, i) => { const a = (-160 + i * 14) * Math.PI / 180; const L = 40; const ex = cx + Math.cos(a) * L, ey = cy + Math.sin(a) * L * 1.05; return S(`M${f(cx)} ${f(cy)} L${f(ex)} ${f(ey)}`, dk(o.c, .3), 1) + E(ex, ey, 6.4, 8.2, G(cols[i % 3]), R(a * 57.3 + 90, ex, ey)) + C(ex, ey, 3.2, '#3AA0DA') + C(ex, ey, 1.6, '#1e2a5a'); }).join(''); }
    if (d === 'rueckenzacken') return [-2, -1, 0, 1, 2].map((i) => { const bx = 50 + i * r * .42, by = y - r * .2 + Math.abs(i) * r * .35; const h = r * (1.25 - Math.abs(i) * .22); return P(`M${f(bx - r * .2)} ${f(by)} L${f(bx + i * r * .12)} ${f(by - h)} L${f(bx + r * .2)} ${f(by)}z`, G('#9fe6ff'), 'stroke="#fff" stroke-width=".8"'); }).join('');
    if (d === 'megamaehne') { const hc = o.hairC || (o.maneC ? o.maneC[0] : dk(o.c, .25)); return P(`M${f(x - r * .9)} ${f(y - r * .5)} Q${f(x - r * 1.35)} ${f(y + r * .6)} ${f(x - r * 1.2)} ${f(y + r * 1.9)} Q${f(x - r * .7)} ${f(y + r * 1.5)} ${f(x - r * .45)} ${f(y + r * 1.75)} L${f(x + r * .45)} ${f(y + r * 1.75)} Q${f(x + r * .7)} ${f(y + r * 1.5)} ${f(x + r * 1.2)} ${f(y + r * 1.9)} Q${f(x + r * 1.35)} ${f(y + r * .6)} ${f(x + r * .9)} ${f(y - r * .5)} Q${f(x)} ${f(y - r * 1.5)} ${f(x - r * .9)} ${f(y - r * .5)}z`, G(hc)); }
    if (d === 'glutmaehne') return [...Array(11)].map((_, i) => { const a = (-200 + i * 22) * Math.PI / 180; const bx = x + Math.cos(a) * r * .85, by = y + Math.sin(a) * r * .85; const tx2 = x + Math.cos(a) * r * 1.75, ty2 = y + Math.sin(a) * r * 1.75 - r * .25; const nx = -Math.sin(a) * r * .32, ny = Math.cos(a) * r * .32;
      return ['#E5483B', '#FF8A3D', '#FFD34D'].map((c, j) => { const k2 = 1 - j * .28; return P(`M${f(bx - nx * k2)} ${f(by - ny * k2)} Q${f(x + Math.cos(a) * r * 1.3 + nx * .6)} ${f(y + Math.sin(a) * r * 1.3 + ny * .6)} ${f(bx + (tx2 - bx) * k2)} ${f(by + (ty2 - by) * k2)} Q${f(x + Math.cos(a) * r * 1.2 - nx * .2)} ${f(y + Math.sin(a) * r * 1.2 - ny * .2)} ${f(bx + nx * k2)} ${f(by + ny * k2)}z`, c, j ? 'class="flk"' : ''); }).join(''); }).join('');
    if (d === 'blattmaehne') return [...Array(10)].map((_, i) => { const a = (-195 + i * 23) * Math.PI / 180; const ex = x + Math.cos(a) * r * 1.22, ey = y + Math.sin(a) * r * 1.22; const c = ['#5FB043', '#7CD06A', '#4E8A34'][i % 3]; return E(ex, ey, r * .32, r * .62, G(c), R(a * 57.3 + 90, ex, ey)) + S(`M${f(x + Math.cos(a) * r * .8)} ${f(y + Math.sin(a) * r * .8)} L${f(x + Math.cos(a) * r * 1.7)} ${f(y + Math.sin(a) * r * 1.7)}`, '#3d6e28', .6); }).join('');
    if (d === 'eiskragen') return [...Array(9)].map((_, i) => { const bx = x + (i - 4) * r * .27; const by = y + r * .78 - Math.abs(i - 4) * r * .1; const h = r * (.7 - Math.abs(i - 4) * .06); return P(`M${f(bx - r * .15)} ${f(by)} L${f(bx)} ${f(by + h)} L${f(bx + r * .15)} ${f(by)}z`, G(i % 2 ? '#BFEFFF' : '#9fe6ff'), 'stroke="#fff" stroke-width=".6"'); }).join('') + [...Array(7)].map((_, i) => { const a = (-180 + i * 30) * Math.PI / 180; const ex = x + Math.cos(a) * r * 1.15, ey = y + Math.sin(a) * r * 1.0; return P(`M${f(ex)} ${f(ey - r * .3)} L${f(ex + r * .12)} ${f(ey)} L${f(ex)} ${f(ey + r * .3)} L${f(ex - r * .12)} ${f(ey)}z`, '#E8FAFF', 'opacity=".9"'); }).join('');
    if (d === 'flossen') return [-1, 1].map((sg) => [0, 1, 2].map((i) => { const bx = x + sg * r * .82, by = y - r * .35 + i * r * .35; const a = sg * (-35 + i * 30); return E(bx + sg * r * .45, by - r * .05, r * .55, r * .16, G(i === 1 ? '#5EC3EC' : '#9fe6ff'), R(a, bx, by)) + S(`M${f(bx)} ${f(by)} l${f(sg * r * .9)} 0`, '#fff', .5, `${R(a, bx, by)} opacity=".7"`); }).join('')).join('') + P(`M${f(x - r * .25)} ${f(y - r * .9)} Q${f(x)} ${f(y - r * 1.75)} ${f(x + r * .25)} ${f(y - r * .9)}z`, G('#5EC3EC'), 'stroke="#fff" stroke-width=".6"');
    if (d === 'mondhalo') { const mx = x + r * .1, my = y - r * .55; return P(`M${f(mx - r * 1.3)} ${f(my)} A${f(r * 1.3)} ${f(r * 1.3)} 0 1 1 ${f(mx + r * 1.3)} ${f(my)} A${f(r * 1.05)} ${f(r * 1.0)} 0 1 0 ${f(mx - r * 1.3)} ${f(my)}z`, G('#E8E2FF'), 'stroke="#B58CFF" stroke-width=".8"') + [[-1.45, -.4, .2], [1.5, -.2, .16], [.2, -1.55, .14]].map(([a, b2, s2]) => P(`M${f(mx + a * r)} ${f(my + b2 * r - s2 * r * 1.6)} L${f(mx + a * r + s2 * r * .5)} ${f(my + b2 * r)} L${f(mx + a * r)} ${f(my + b2 * r + s2 * r * 1.6)} L${f(mx + a * r - s2 * r * .5)} ${f(my + b2 * r)}z`, '#FFE27A')).join(''); }
    if (d === 'sonnenkranz') return [...Array(14)].map((_, i) => { const a = i / 14 * Math.PI * 2; const b1 = r * 1.0, b2 = r * (i % 2 ? 1.55 : 1.85); return P(`M${f(x + Math.cos(a - .14) * b1)} ${f(y + Math.sin(a - .14) * b1)} L${f(x + Math.cos(a) * b2)} ${f(y + Math.sin(a) * b2)} L${f(x + Math.cos(a + .14) * b1)} ${f(y + Math.sin(a + .14) * b1)}z`, i % 2 ? '#FFE27A' : '#F5B82E'); }).join('') + C(x, y, r * 1.02, 'none', 'stroke="#FFE27A" stroke-width="1.2" opacity=".8"');
    if (d === 'elfenohren') return [-1, 1].map((sg) => P(`M${f(x + sg * r * .75)} ${f(y - r * .45)} L${f(x + sg * r * 2.0)} ${f(y - r * .85)} L${f(x + sg * r * .85)} ${f(y + r * .1)}z`, G(o.earC || o.c)) + P(`M${f(x + sg * r * .85)} ${f(y - r * .35)} L${f(x + sg * r * 1.7)} ${f(y - r * .72)} L${f(x + sg * r * .9)} ${f(y - r * .05)}z`, o.earIn || PINK, 'opacity=".8"')).join('');
    return '';
  }).join('');
  const morphTop = (list, x, y, r, o) => (list || []).map((d) => {
    const hc = o.hairC || dk(o.c, .2);
    if (d === 'stachelfrisur') return [-3, -2, -1, 0, 1, 2, 3].map((i) => P(`M${f(x + i * r * .2 - r * .16)} ${f(y - r * .7 + Math.abs(i) * r * .06)} L${f(x + i * r * .36)} ${f(y - r * (1.85 - Math.abs(i) * .18))} L${f(x + i * r * .2 + r * .16)} ${f(y - r * .7 + Math.abs(i) * r * .06)}z`, G(i % 2 ? hc : lt(hc, .15)))).join('');
    if (d === 'lockenpracht') return [[-.7, -.75], [-.35, -1.05], [0, -1.15], [.35, -1.05], [.7, -.75], [-.9, -.35], [.9, -.35], [-.2, -1.35], [.25, -1.32]].map(([a, c2]) => C(x + a * r, y + c2 * r, r * .32, G(hc))).join('');
    if (d === 'kakadu') return [-2, -1, 0, 1, 2].map((i) => P(`M${f(x + i * 1.6)} ${f(y - r * .85)} Q${f(x + i * 2 - 3)} ${f(y - r * 1.9)} ${f(x - r * .4 + i * 2.6)} ${f(y - r * (2.1 - Math.abs(i) * .12))} Q${f(x + i * 1.2 + 1)} ${f(y - r * 1.4)} ${f(x + i * 1.6 + 1.6)} ${f(y - r * .85)}z`, ['#FFD34D', '#FFE680', '#FFC21A'][Math.abs(i) % 3])).join('');
    if (d === 'tukan') return P(`M${f(x - r * .28)} ${f(y + r * .18)} Q${f(x + r * .9)} ${f(y + r * .05)} ${f(x + r * 1.45)} ${f(y + r * .55)} Q${f(x + r * .9)} ${f(y + r * .85)} ${f(x - r * .2)} ${f(y + r * .62)}z`, G('#FF8A1E'), 'stroke="#b8560e" stroke-width=".6"') + P(`M${f(x + r * 1.1)} ${f(y + r * .36)} Q${f(x + r * 1.35)} ${f(y + r * .42)} ${f(x + r * 1.45)} ${f(y + r * .55)} Q${f(x + r * 1.3)} ${f(y + r * .66)} ${f(x + r * 1.1)} ${f(y + r * .7)}z`, '#1e1e24') + S(`M${f(x - r * .2)} ${f(y + r * .4)} Q${f(x + r * .6)} ${f(y + r * .42)} ${f(x + r * 1.4)} ${f(y + r * .56)}`, '#b8560e', .8) + P(`M${f(x - r * .15)} ${f(y + r * .2)} Q${f(x + r * .5)} ${f(y + r * .12)} ${f(x + r * .8)} ${f(y + r * .25)}`, '#FFE066', 'opacity=".9"');
    if (d === 'haken') return P(`M${f(x - r * .42)} ${f(y + r * .2)} Q${f(x)} ${f(y - r * .02)} ${f(x + r * .42)} ${f(y + r * .2)} Q${f(x + r * .38)} ${f(y + r * .72)} ${f(x + r * .05)} ${f(y + r * .95)} Q${f(x - r * .02)} ${f(y + r * .7)} ${f(x - r * .15)} ${f(y + r * .62)} Q${f(x - r * .4)} ${f(y + r * .5)} ${f(x - r * .42)} ${f(y + r * .2)}z`, G('#F7C948'), 'stroke="#a0780e" stroke-width=".7"');
    if (d === 'saebelzahn') return [-1, 1].map((sg) => P(`M${f(x + sg * r * .14 - 1.4)} ${f(y + r * .55)} L${f(x + sg * r * .2)} ${f(y + r * 1.15)} L${f(x + sg * r * .14 + 1.4)} ${f(y + r * .55)}z`, '#FFFFFF', 'stroke="#c9c2b8" stroke-width=".5"')).join('');
    if (d === 'widderhoerner') return [-1, 1].map((sg) => S(`M${f(x + sg * r * .45)} ${f(y - r * .75)} C${f(x + sg * r * 1.35)} ${f(y - r * 1.2)} ${f(x + sg * r * 1.55)} ${f(y + r * .15)} ${f(x + sg * r * 1.05)} ${f(y + r * .25)} C${f(x + sg * r * .75)} ${f(y + r * .25)} ${f(x + sg * r * .75)} ${f(y - r * .15)} ${f(x + sg * r * 1.0)} ${f(y - r * .2)}`, '#E8D2A0', 3.2) + S(`M${f(x + sg * r * .45)} ${f(y - r * .75)} C${f(x + sg * r * 1.35)} ${f(y - r * 1.2)} ${f(x + sg * r * 1.55)} ${f(y + r * .15)} ${f(x + sg * r * 1.05)} ${f(y + r * .25)}`, '#B89A60', .7, 'stroke-dasharray="1.4 1.8"')).join('');
    if (d === 'zuckerhorn') { const b = y - r * .8; return P(`M${f(x - 3.6)} ${f(b)} L${f(x)} ${f(b - 20)} L${f(x + 3.6)} ${f(b)}z`, '#FFF4FA', 'stroke="#FF8FC8" stroke-width=".6"') + [0, 1, 2, 3].map((i) => S(`M${f(x - 3.4 + i * .8)} ${f(b - i * 4.6)} L${f(x + 3.2 - i * .8)} ${f(b - 3 - i * 4.6)}`, '#FF6FA8', 1.5)).join(''); }
    if (d === 'pilzhut') { const b = y - r * .78; return P(`M${f(x - r * .5)} ${f(b + 1)} h${f(r)} v-3 h${f(-r)}z`, '#F3E6D0') + P(`M${f(x - r * 1.0)} ${f(b - 2)} Q${f(x - r * .9)} ${f(b - r * 1.05)} ${f(x)} ${f(b - r * 1.1)} Q${f(x + r * .9)} ${f(b - r * 1.05)} ${f(x + r * 1.0)} ${f(b - 2)}z`, G('#C9763A'), 'stroke="#8B5A33" stroke-width=".7"') + S(`M${f(x - r * .7)} ${f(b - r * .55)} Q${f(x)} ${f(b - r * .85)} ${f(x + r * .7)} ${f(b - r * .55)}`, '#F0C58A', 1.1); }
    if (d === 'riesenbluete') { const b = y - r * 1.05; return [...Array(6)].map((_, i) => { const a = (-90 + (i - 2.5) * 32) * Math.PI / 180; const ex = x + Math.cos(a) * r * .55, ey = b + Math.sin(a) * r * .55; return E(ex, ey, r * .22, r * .5, G(i % 2 ? '#FF8FC8' : '#FFB3D9'), R(a * 57.3 + 90, ex, ey)); }).join('') + C(x, b, r * .22, '#FFD34D') + E(x - r * .5, y - r * .7, r * .3, r * .12, '#5FB043', R(-20, x - r * .5, y - r * .7)) + E(x + r * .5, y - r * .7, r * .3, r * .12, '#5FB043', R(20, x + r * .5, y - r * .7)); }
    if (d === 'kristallhorn') return P(`M${f(x - 3.4)} ${f(y - r * .8)} L${f(x - 1)} ${f(y - r * .8 - 18)} L${f(x + 1.5)} ${f(y - r * .8 - 22)} L${f(x + 3.6)} ${f(y - r * .8)}z`, G('#9fe6ff'), 'stroke="#fff" stroke-width=".8"') + S(`M${f(x)} ${f(y - r * .8 - 4)} l1 -12`, '#fff', .8, 'opacity=".8"');
    if (d === 'grossgeweih') return [-1, 1].map((sg) => S(`M${f(x + sg * r * .35)} ${f(y - r * .82)} l${f(sg * 3)} -10 l${f(sg * 6)} -6 M${f(x + sg * r * .35 + sg * 1.6)} ${f(y - r * .82 - 5)} l${f(sg * 7)} -1 M${f(x + sg * r * .35 + sg * 3)} ${f(y - r * .82 - 10)} l${f(-sg * 1)} -7 M${f(x + sg * r * .35 + sg * 6)} ${f(y - r * .82 - 13)} l${f(sg * 4)} -4`, '#8a6a3a', 2.4)).join('');
    return '';
  }).join('');
  // ================================================================ wild end forms: skins (colour maps), patterns, asymmetric marks, extras, auras
  const SKIN = {
    gold: ['Gold', ['#3a2400', '#9a6a10', '#f2c230', '#fff3b0']], silber: ['Silber', ['#1e2228', '#6d7682', '#c9d1db', '#ffffff']], kristall: ['Kristall', ['#0d2a4a', '#3a8fd0', '#9fe6ff', '#ffffff']],
    feuer: ['Feuer', ['#2a0500', '#c22a10', '#ff8a1e', '#ffe680']], galaxie: ['Galaxie', ['#0a0620', '#3a1e7a', '#b05ad8', '#ffd6f5']], schatten: ['Schatten', ['#050508', '#1d1a2e', '#4a4470', '#c9c2ff']],
    neon: ['Neon', ['#08001a', '#ff2bd6', '#36f0ff', '#ffffff']], smaragd: ['Smaragd', ['#031a10', '#0f7a4a', '#45d98a', '#e0ffe8']], rosegold: ['Rosé-Gold', ['#3a1a1a', '#b86a6a', '#f2b8a8', '#fff0ea']],
    lava: ['Lava', ['#120000', '#6a0a00', '#ff4a00', '#ffd000']], opal: ['Opal', ['#5a4a7a', '#a0c4ff', '#ffc6f0', '#ffffff']], regenbogen: ['Regenbogen', null],
  };
  const PAT_TXT = { tupfen: 'Tupfen', zebra: 'Zebra-Streifen', leopard: 'Leoparden-Flecken', tarn: 'Tarnmuster', herzchen: 'Herzchen-Muster', sternchen: 'Sternchen-Muster', kariert: 'Karo' };
  const UNDER_TXT = { augenfleck: 'Fleck ums Auge', halbgesicht: 'zweifarbiges Gesicht', blitz: 'Blitz auf der Backe', herzfleck: 'Herz auf der Backe', mondsichel: 'Mond auf der Stirn' };
  const BACK_TXT = { fluegelchen: 'Flügelchen', maehne: 'Löwenmähne', feenfluegel: 'Feenflügel' };
  const AURA_TXT = { gold: 'Goldschein', blau: 'Eisschein', rosa: 'Rosaschein', regenbogen: 'Regenbogenschein', funken: 'Funkenwirbel', herzen: 'Herzchen-Wolke', sterne: 'Sternenkranz', flammen: 'Flammenkranz' };
  const skinDef = (key) => { const sk = SKIN[key]; if (!sk || !sk[1]) return ''; const id = 'sk' + (++uid); const ch = (i) => sk[1].map((h) => (parseInt(h.slice(1 + i * 2, 3 + i * 2), 16) / 255).toFixed(3)).join(' ');
    defs += `<filter id="${id}" color-interpolation-filters="sRGB" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values=".33 .59 .11 0 0 .33 .59 .11 0 0 .33 .59 .11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="${ch(0)}"/><feFuncG type="table" tableValues="${ch(1)}"/><feFuncB type="table" tableValues="${ch(2)}"/></feComponentTransfer>${key === 'neon' ? '<feMorphology operator="dilate" radius=".4"/><feGaussianBlur stdDeviation=".3"/>' : ''}</filter>`; return id; };
  const skinOver = (key, cy, R) => {
    if (key === 'galaxie') return '';
    if (key === 'kristall') return S(`M${f(50 - 8 * R)} ${f(cy - 20 * R)} l${f(5 * R)} ${f(6 * R)} l${f(-3 * R)} ${f(6 * R)} M${f(50 + 6 * R)} ${f(cy + 2 * R)} l${f(4 * R)} ${f(5 * R)} l${f(-5 * R)} ${f(4 * R)} M${f(50 + 2 * R)} ${f(cy - 30 * R)} l${f(4 * R)} ${f(4 * R)}`, '#fff', .8, 'opacity=".8"');
    if (key === 'feuer' || key === 'lava') return [-6, 0, 6].map((dx, i) => P(`M${f(50 + dx * R - 3 * R)} ${f(cy - 34 * R)} q${f(3 * R)} ${f(-9 * R)} ${f(3 * R)} ${f(-12 * R)} q${f(1 * R)} ${f(6 * R)} ${f(3 * R)} ${f(12 * R)}z`, ['#ff8a1e', '#ffd000', '#ff4a00'][i], 'class="flk" opacity=".9"')).join('');
    if (key === 'gold' || key === 'silber' || key === 'rosegold') return P(`M${f(50 - 9 * R)} ${f(cy - 24 * R)} l${f(1.2 * R)} ${f(3 * R)} ${f(3 * R)} ${f(1.2 * R)} ${f(-3 * R)} ${f(1.2 * R)} ${f(-1.2 * R)} ${f(3 * R)} ${f(-1.2 * R)} ${f(-3 * R)} ${f(-3 * R)} ${f(-1.2 * R)} ${f(3 * R)} ${f(-1.2 * R)}z`, '#fff', 'class="twk"');
    return '';
  };
  const aura = (key, cy, R) => {
    if (!key) return '';
    const id = 'au' + (++uid); const col = { gold: '#FFD34D', blau: '#7FD3FF', rosa: '#FF8FC8', regenbogen: '#B58CFF', funken: '#FFE680', herzen: '#FF8FB0', sterne: '#FFF3A0', flammen: '#FF8A1E' }[key] || '#fff';
    defs += `<radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".75"/><stop offset=".55" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
    let s = `<ellipse class="aur${key === 'regenbogen' ? ' rbw' : ''}" cx="50" cy="${f(cy)}" rx="${f(34 * R)}" ry="${f(40 * R)}" fill="url(#${id})"/>`;
    if (key === 'funken' || key === 'sterne' || key === 'herzen' || key === 'flammen') s += `<g class="orb" style="transform-origin:50px ${f(cy)}px">${[0, 1, 2, 3, 4, 5].map((i) => { const a = i / 6 * Math.PI * 2; const x = 50 + Math.cos(a) * 30 * R, y = cy + Math.sin(a) * 34 * R; return key === 'herzen' ? P(`M${f(x)} ${f(y + 2)} c-3 -2 -2 -4.4 0 -3 c2 -1.4 3 1 0 3z`, '#FF6F91') : key === 'flammen' ? P(`M${f(x - 2)} ${f(y + 2)} q2 -6 2 -8 q1 4 2 8z`, '#FF8A1E') : P(`M${f(x)} ${f(y - 3)} l.8 2.2 2.2 .8 -2.2 .8 -.8 2.2 -.8 -2.2 -2.2 -.8 2.2 -.8z`, key === 'sterne' ? '#FFF3A0' : '#FFE680'); }).join('')}</g>`;
    return `<g class="aura">${s}</g>`;
  };
  const backX = (list, x, y, r, o, st, b) => (list || []).map((d) => {
    if (d === 'fluegelchen') return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'}" style="transform-origin:${f(50 + sg * 4)}px ${f(b.y0 + 4)}px">${P(`M${f(50 + sg * 4)} ${f(b.y0 + 5)} q${f(sg * 6)} -9 ${f(sg * 13)} -8 q${f(-sg * 1)} 3 ${f(sg * 1)} 5 q${f(-sg * 3)} 1 ${f(-sg * 2)} 4 q${f(-sg * 5)} 2 ${f(-sg * 12)} 1z`, G('#fff'), 'stroke="#d9e2ec" stroke-width=".5"')}</g>`).join('');
    if (d === 'feenfluegel') return [-1, 1].map((sg) => `<g class="${sg > 0 ? 'wgr' : 'wgl'}" style="transform-origin:${f(50 + sg * 3)}px ${f(b.y0 + 4)}px">${E(50 + sg * 13, b.y0 - 4, 10, 6, '#CDB8FF', `opacity=".75" stroke="#fff" stroke-width=".6" ${R(sg * -35, 50 + sg * 13, b.y0 - 4)}`)}${E(50 + sg * 11, b.y0 + 8, 7, 4, '#FFC6F0', `opacity=".75" ${R(sg * 25, 50 + sg * 11, b.y0 + 8)}`)}</g>`).join('');
    if (d === 'maehne') return [...Array(14)].map((_, i) => { const a = i / 14 * Math.PI * 2; return E(x + Math.cos(a) * r * 1.02, y + Math.sin(a) * r * 1.0, r * .32, r * .2, i % 2 ? dk(o.c, .25) : dk(o.c, .12), R(a * 57.3, x + Math.cos(a) * r * 1.02, y + Math.sin(a) * r * 1.0)); }).join('');
    return '';
  }).join('');
  const under = (list, x, y, r, o) => (list || []).map((d) => {
    if (d === 'augenfleck') return E(x - r * .4, y - r * .02, r * .3, r * .27, lum(o.c) > .55 ? dk(o.c, .55) : lt(o.c, .65), R(-15, x - r * .4, y));
    if (d === 'halbgesicht') return P(`M${f(x)} ${f(y - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + r)}z`, lum(o.c) > .55 ? dk(o.c, .3) : lt(o.c, .45), 'opacity=".85"');
    if (d === 'blitz') return P(`M${f(x + r * .62)} ${f(y - r * .15)} l${f(-r * .16)} ${f(r * .26)} h${f(r * .12)} l${f(-r * .14)} ${f(r * .26)} l${f(r * .26)} ${f(-r * .32)} h${f(-r * .12)} l${f(r * .1)} ${f(-r * .2)}z`, '#FFD34D');
    if (d === 'herzfleck') return P(`M${f(x + r * .58)} ${f(y + r * .36)} c-3 -2 -2 -4.4 0 -3 c2 -1.4 3 1 0 3z`, '#FF6F91');
    if (d === 'mondsichel') return P(`M${f(x - 2)} ${f(y - r * .78)} a4 4 0 1 0 5 5 a3.2 3.2 0 1 1 -5 -5z`, '#FFF3A0');
    return '';
  }).join('');
  const lum = (h) => { const n = parseInt(h.slice(1), 16); return (((n >> 16) & 255) * .3 + ((n >> 8) & 255) * .59 + (n & 255) * .11) / 255; };
  const patt = (key, x, y, r, b, form) => {
    if (!key) return ''; const id = 'pc' + (++uid); const cy = (b.y0 + b.y1) / 2;
    defs += `<clipPath id="${id}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .97)}"/><ellipse cx="${f(b.x)}" cy="${f(cy)}" rx="${f(b.w * 1.05)}" ry="${f((b.y1 - b.y0) / 2 + 1.5)}"/></clipPath>`;
    const pts = []; for (let yy = y - r; yy < b.y1 + 3; yy += 5.2) for (let xx = 50 - r; xx < 50 + r; xx += 5.6) pts.push([xx + ((yy / 5.2) % 2 ? 2.8 : 0), yy]);
    let s = '';
    if (key === 'tupfen') s = pts.map(([a, c]) => C(a, c, 1.2, '#fff', 'opacity=".7"')).join('');
    if (key === 'herzchen') s = pts.filter((_, i) => i % 2).map(([a, c]) => P(`M${f(a)} ${f(c + 1.4)} c-2 -1.4 -1.4 -3 0 -2 c1.4 -1 2 .6 0 2z`, '#FF6F91', 'opacity=".8"')).join('');
    if (key === 'sternchen') s = pts.filter((_, i) => i % 2).map(([a, c]) => P(`M${f(a)} ${f(c - 1.8)} l.6 1.2 1.3 .2 -1 .9 .3 1.3 -1.2 -.7 -1.2 .7 .3 -1.3 -1 -.9 1.3 -.2z`, '#FFF3A0')).join('');
    if (key === 'zebra') s = [...Array(9)].map((_, i) => S(`M${f(50 - r)} ${f(y - r + i * 7)} q${f(r * .6)} 3 ${f(r)} 0 t${f(r)} 0`, '#1e1e24', 1.8, 'opacity=".75"')).join('');
    if (key === 'leopard') s = pts.filter((_, i) => i % 3 === 0).map(([a, c]) => C(a, c, 1.6, 'none', 'stroke="#2a1a10" stroke-width="1" stroke-dasharray="2.4 1.2" opacity=".75"') + C(a, c, .8, '#8a5a24', 'opacity=".6"')).join('');
    if (key === 'tarn') s = pts.filter((_, i) => i % 2 === 0).map(([a, c], i) => E(a, c, 2.8, 1.8, ['#4f6b3a', '#8a7a4a', '#2f3f24'][i % 3], `opacity=".65" ${R(i * 37, a, c)}`)).join('');
    if (key === 'kariert') s = [...Array(10)].map((_, i) => S(`M${f(50 - r + i * 4.4)} ${f(y - r)} V${f(b.y1 + 2)}`, '#E5483B', 1.1, 'opacity=".45"') + S(`M${f(50 - r)} ${f(y - r + i * 6)} H${f(50 + r)}`, '#E5483B', 1.1, 'opacity=".45"')).join('');
    return `<g clip-path="url(#${id})">${s}</g>`;
  };
  // ================================================================ decorations: chosen looks (development tree) and season outfits
  // keys: hair (tolle, punk, zoepfe, locke, krone, schleife, blume), neck (masche, gloeckchen, halstuch, kette), face (brille),
  // season (muetze, schal, sonnenbrille, strohhut, blatt, blumenkranz, nikolaus, partyhut, hasenohren, maske, herzreif, zylinder, skibrille, fahne)
  const HAT_NO = ['muetze', 'strohhut', 'zylinder', 'nikolaus', 'partyhut', 'hasenohren'];
  const DECO_TXT = { tolle: 'Tolle', punk: 'Punk-Frisur', zoepfe: 'Zöpfchen', locke: 'Locke', krone: 'Krone', schleife: 'Schleife', blume: 'Blume im Haar', masche: 'Fliege', gloeckchen: 'Glöckchen', halstuch: 'Halstuch', kette: 'Herz-Kette', brille: 'Brille', muetze: 'Mütze', schal: 'Schal', sonnenbrille: 'Sonnenbrille', strohhut: 'Strohhut', blatt: 'Herbstblatt', blumenkranz: 'Blumenkranz', nikolaus: 'Samichlaus-Mütze', partyhut: 'Partyhut', hasenohren: 'Hasenohren', maske: 'Fasnachtsmaske', herzreif: 'Herz-Haarreif', zylinder: 'Zylinder', skibrille: 'Skibrille', fahne: 'Schweizer Fähnchen' };
  const TRAIT_TXT = { fell_tolle: 'Fell-Tolle', fell_locke: 'Locke', fell_irokese: 'Wuschel-Kamm', backen: 'Flauschbacken', stern: 'Stern auf der Stirn', sommersprossen: 'Sommersprossen', flecken: 'Flecken', streifen: 'Streifen', socken: 'weisse Söckchen', glitzer: 'Glitzerfell' };
  const deco = (list0, x, y, r, v, o, st, bd) => {
    const TOPM = (CUR.morph || []).some((m) => /kristallhorn|grossgeweih|kakadu|zuckerhorn|pilzhut|riesenbluete|stachelfrisur|widder/.test(m)); const list = TOPM ? (list0 || []).filter((d) => !HAT_NO.includes(d)) : list0;
    if (!list || !list.length) return '';
    const b = bd || { x: 50, y0: 66, y1: 86, w: 8, feet: [[44.8, 93.4], [55.2, 93.4]] };
    const hc = o.hairC || dk(o.c, .18); const side = v === 'side'; const back = v === 'back';
    const T = (inner) => side ? `<g transform="translate(${f(x)} ${f(y)}) rotate(-10) scale(.82 1) translate(${f(-x)} ${f(-y)})">${inner}</g>` : inner;
    const out = list.map((d) => {
      switch (d) {
        case 'fell_tolle': return T(P(`M${f(x - r * .3)} ${f(y - r * .82)} Q${f(x - r * .2)} ${f(y - r * 1.5)} ${f(x + r * .42)} ${f(y - r * 1.3)} Q${f(x + r * .1)} ${f(y - r * 1.18)} ${f(x + r * .25)} ${f(y - r * .86)}z`, G(lt(o.c, .08))));
        case 'fell_locke': return T(S(`M${f(x)} ${f(y - r * .9)} c0 -6 ${f(r * .4)} -6 ${f(r * .35)} -2 c-.2 2 -3 2 -2.6 -.4`, dk(o.c, .12), 2.6));
        case 'fell_irokese': return T([-2, -1, 0, 1, 2].map((i) => P(`M${f(x + i * r * .16 - r * .1)} ${f(y - r * .9 + Math.abs(i) * r * .05)} L${f(x + i * r * .19)} ${f(y - r * (1.42 - Math.abs(i) * .13))} L${f(x + i * r * .16 + r * .1)} ${f(y - r * .9 + Math.abs(i) * r * .05)}z`, i % 2 ? dk(o.c, .1) : o.c)).join(''));
        case 'backen': if (back) return ''; return (side ? [1] : [-1, 1]).map((sg) => { const bx = side ? x - r * .55 : x + sg * r * .92; return P(`M${f(bx)} ${f(y - r * .05)} l${f(sg * r * .28)} ${f(r * .12)} l${f(-sg * r * .16)} ${f(r * .1)} l${f(sg * r * .24)} ${f(r * .14)} l${f(-sg * r * .3)} ${f(r * .12)}z`, o.b || lt(o.c, .45)); }).join('');
        case 'stern': if (back) return ''; { const sx = side ? x + r * .2 : x, sy = y - r * .58; return P(`M${f(sx)} ${f(sy - 3.4)} l1 2.4 2.6 .3 -2 1.7 .6 2.6 -2.2 -1.4 -2.2 1.4 .6 -2.6 -2 -1.7 2.6 -.3z`, '#fff', 'opacity=".95"'); }
        case 'sommersprossen': if (back) return ''; return (side ? [1] : [-1, 1]).map((sg) => { const cx0 = side ? x + r * .35 : x + sg * r * .55; return [[0, 0], [2.2, -.6], [1, 1.8]].map(([dx, dy]) => C(cx0 + dx * sg - (side ? 0 : 1), y + r * .22 + dy, .7, dk(o.c, .35))).join(''); }).join('');
        case 'flecken': { const fc = (o.spotC) || (dk(o.c, .3)); const bx = b.x; return [[-.45, .25], [.4, .45], [-.1, .75], [.5, .1]].map(([dx, dy], i) => E(bx + dx * b.w, b.y0 + (b.y1 - b.y0) * dy, 2.4 - i * .25, 1.9 - i * .2, fc, 'opacity=".75"')).join('') + (back ? '' : C(x - r * .45, y - r * .55, r * .14, fc, 'opacity=".7"')); }
        case 'streifen': { const sc = dk(o.c, .38); return S(`M${f(x - r * .25)} ${f(y - r * .95)} l1 4 M${f(x)} ${f(y - r)} v4.4 M${f(x + r * .25)} ${f(y - r * .95)} l-1 4`, sc, 1.4) + S(`M${f(b.x - b.w * .8)} ${f(b.y0 + 4)} l3 1.4 M${f(b.x - b.w * .85)} ${f(b.y0 + 9)} l3.4 1.2 M${f(b.x + b.w * .8)} ${f(b.y0 + 4)} l-3 1.4 M${f(b.x + b.w * .85)} ${f(b.y0 + 9)} l-3.4 1.2`, sc, 1.3); }
        case 'socken': return b.feet.map(([fx, fy]) => E(fx + (side ? 1.5 : 0), fy - .3, 3.9, 2, '#fff')).join('');
        case 'glitzer': return [[b.x - b.w * .5, b.y0 + 5], [b.x + b.w * .45, b.y0 + 12], [x + r * .7, y - r * .8]].map(([gx, gy]) => P(`M${f(gx)} ${f(gy - 2.6)} l.7 1.9 1.9 .7 -1.9 .7 -.7 1.9 -.7 -1.9 -1.9 -.7 1.9 -.7z`, '#FFF7C0')).join('');
        case 'hoernchen': return T([-1, 1].map((sg) => P(`M${f(x + sg * r * .35)} ${f(y - r * .82)} q${f(sg * r * .05)} ${f(-r * .45)} ${f(sg * r * .28)} ${f(-r * .55)} q${f(-sg * r * .02)} ${f(r * .3)} ${f(sg * r * .02)} ${f(r * .5)}z`, '#F3E2B0', 'stroke="#C9B07A" stroke-width=".5"')).join(''));
        case 'geweih': return T(S(`M${f(x - r * .4)} ${f(y - r * .85)} l-2 -7 l-3 -2 M${f(x - r * .4 - 1.2)} ${f(y - r * .85 - 4)} l2.6 -2.4 M${f(x + r * .4)} ${f(y - r * .85)} l2 -7 l3 -2 M${f(x + r * .4 + 1.2)} ${f(y - r * .85 - 4)} l-2.6 -2.4`, '#8a6a3a', 2.2));
        case 'einhornhorn': return T(P(`M${f(x - 2.2)} ${f(y - r * .82)} L${f(x + 1.5)} ${f(y - r * .82 - 11)} L${f(x + 2.6)} ${f(y - r * .82)}z`, '#F7D46B', 'stroke="#C99A16" stroke-width=".5"'));
        case 'tolle': return T(P(`M${f(x - r * .3)} ${f(y - r * .82)} Q${f(x - r * .2)} ${f(y - r * 1.55)} ${f(x + r * .45)} ${f(y - r * 1.35)} Q${f(x + r * .1)} ${f(y - r * 1.2)} ${f(x + r * .25)} ${f(y - r * .86)}z`, G(hc)));
        case 'punk': return T([-2, -1, 0, 1, 2].map((i) => P(`M${f(x + i * r * .17 - r * .1)} ${f(y - r * .88 + Math.abs(i) * r * .05)} L${f(x + i * r * .2)} ${f(y - r * (1.55 - Math.abs(i) * .14))} L${f(x + i * r * .17 + r * .1)} ${f(y - r * .88 + Math.abs(i) * r * .05)}z`, i % 2 ? '#7A5CFF' : '#FF4FA3')).join(''));
        case 'zoepfe': return back || side ? C(x - r * .78, y - r * .5, r * .22, G(hc)) : [-1, 1].map((sg) => C(x + sg * r * .82, y - r * .48, r * .24, G(hc)) + P(`M${f(x + sg * r * .7)} ${f(y - r * .72)} l${f(sg * -3)} -2 v4z M${f(x + sg * r * .7)} ${f(y - r * .72)} l${f(sg * 3)} -2 v4z`, '#FF6F91')).join('');
        case 'locke': return T(S(`M${f(x)} ${f(y - r * .9)} c0 -6 ${f(r * .4)} -6 ${f(r * .35)} -2 c-.2 2 -3 2 -2.6 -.4`, hc, 2.4));
        case 'krone': return T(P(`M${f(x - r * .42)} ${f(y - r * .82)} l0 ${f(-r * .42)} l${f(r * .21)} ${f(r * .2)} l${f(r * .21)} ${f(-r * .3)} l${f(r * .21)} ${f(r * .3)} l${f(r * .21)} ${f(-r * .2)} l0 ${f(r * .42)}z`, '#F7C948', 'stroke="#C99A16" stroke-width=".6"') + C(x, y - r * 1.04, 1.2, '#E5483B'));
        case 'schleife': return T(P(`M${f(x + r * .45)} ${f(y - r * .8)} l-6 -4 v8z M${f(x + r * .45)} ${f(y - r * .8)} l6 -4 v8z`, '#FF6F91') + C(x + r * .45, y - r * .8, 1.6, '#E04876'));
        case 'blume': return T([0, 72, 144, 216, 288].map((a) => C(x - r * .6 + Math.cos(a / 57.3) * 2.4, y - r * .72 + Math.sin(a / 57.3) * 2.4, 1.9, '#FFF')).join('') + C(x - r * .6, y - r * .72, 1.5, '#FFC94D'));
        case 'masche': return back ? '' : (() => { const nx = side ? x - r * .05 : x, ny = y + r * .95; return P(`M${f(nx)} ${f(ny)} l-5 -3 v6z M${f(nx)} ${f(ny)} l5 -3 v6z`, '#E5483B') + C(nx, ny, 1.4, '#B8322A'); })();
        case 'gloeckchen': { const nx = side ? x - r * .05 : x, ny = y + r * .92; return P(`M${f(nx - r * .55)} ${f(ny - 1)} Q${f(nx)} ${f(ny + 2.4)} ${f(nx + r * .55)} ${f(ny - 1)} v1.8 Q${f(nx)} ${f(ny + 4.2)} ${f(nx - r * .55)} ${f(ny + .8)}z`, '#4FA3E0') + (back ? '' : C(nx, ny + 3.6, 2.2, G('#F7C948')) + S(`M${f(nx - 1)} ${f(ny + 4.4)} h2`, '#9a7410', .5)); }
        case 'halstuch': { const nx = side ? x - r * .05 : x, ny = y + r * .88; return P(`M${f(nx - r * .6)} ${f(ny)} L${f(nx + r * .6)} ${f(ny)} L${f(nx)} ${f(ny + r * .6)}z`, '#3A86C8') + (back ? '' : C(nx - 1.5, ny + 2, .7, '#fff') + C(nx + 2, ny + 1.6, .7, '#fff') + C(nx, ny + 4, .7, '#fff')); }
        case 'kette': if (back) return ''; { const nx = side ? x - r * .05 : x, ny = y + r * .9; return S(`M${f(nx - r * .45)} ${f(ny - 1)} Q${f(nx)} ${f(ny + 3)} ${f(nx + r * .45)} ${f(ny - 1)}`, '#F7C948', .8) + P(`M${f(nx)} ${f(ny + 5)} c-3 -2 -2 -4.4 0 -3 c2 -1.4 3 1 0 3z`, '#FF4F7B'); }
        case 'brille': if (back) return ''; return side ? C(x + r * .4, y - r * .08, r * .22, 'none', 'stroke="#2a2a2a" stroke-width="1"') : [-1, 1].map((sg) => C(x + sg * r * .38, y, r * .21, 'none', 'stroke="#2a2a2a" stroke-width="1"')).join('') + S(`M${f(x - r * .17)} ${f(y)} h${f(r * .34)}`, '#2a2a2a', 1);
        case 'sonnenbrille': if (back) return ''; return side ? E(x + r * .42, y - r * .06, r * .26, r * .19, '#1e2430') : [-1, 1].map((sg) => E(x + sg * r * .38, y + .4, r * .26, r * .2, '#1e2430') + E(x + sg * r * .38 - 1.2, y - .8, r * .08, r * .04, '#fff', 'opacity=".6"')).join('') + S(`M${f(x - r * .14)} ${f(y)} h${f(r * .28)}`, '#1e2430', 1.2);
        case 'skibrille': if (back) return S(`M${f(x - r)} ${f(y - r * .55)} Q${f(x)} ${f(y - r * .35)} ${f(x + r)} ${f(y - r * .55)}`, '#FF4F7B', 2.4); return T(S(`M${f(x - r)} ${f(y - r * .62)} Q${f(x)} ${f(y - r * .5)} ${f(x + r)} ${f(y - r * .62)}`, '#FF4F7B', 2.2) + E(x, y - r * .62, r * .6, r * .22, G('#7FD3FF'), 'stroke="#2a2a2a" stroke-width=".8"'));
        case 'muetze': return T(P(`M${f(x - r * .82)} ${f(y - r * .42)} Q${f(x - r * .85)} ${f(y - r * 1.3)} ${f(x)} ${f(y - r * 1.3)} Q${f(x + r * .85)} ${f(y - r * 1.3)} ${f(x + r * .82)} ${f(y - r * .42)}z`, G('#E5483B')) + P(`M${f(x - r * .86)} ${f(y - r * .38)} Q${f(x)} ${f(y - r * .62)} ${f(x + r * .86)} ${f(y - r * .38)} v${f(r * .22)} Q${f(x)} ${f(y - r * .4)} ${f(x - r * .86)} ${f(y - r * .16)}z`, '#fff') + C(x, y - r * 1.36, r * .2, '#fff'));
        case 'schal': { const nx = side ? x - r * .05 : x, ny = y + r * .9; return P(`M${f(nx - r * .7)} ${f(ny - 2)} Q${f(nx)} ${f(ny + 3)} ${f(nx + r * .7)} ${f(ny - 2)} v3.4 Q${f(nx)} ${f(ny + 6.4)} ${f(nx - r * .7)} ${f(ny + 1.4)}z`, '#E5483B') + (back ? '' : P(`M${f(nx + r * .25)} ${f(ny + 2)} l2 9 h3.4 l-1.6 -9z`, '#E5483B') + S(`M${f(nx + r * .25 + 1.5)} ${f(ny + 6)} h3`, '#fff', 1.1)); }
        case 'strohhut': return T(E(x, y - r * .78, r * 1.05, r * .2, '#F2CE7A') + P(`M${f(x - r * .5)} ${f(y - r * .8)} Q${f(x - r * .5)} ${f(y - r * 1.32)} ${f(x)} ${f(y - r * 1.32)} Q${f(x + r * .5)} ${f(y - r * 1.32)} ${f(x + r * .5)} ${f(y - r * .8)}z`, '#F2CE7A') + S(`M${f(x - r * .5)} ${f(y - r * .9)} h${f(r)}`, '#E5483B', 1.6));
        case 'blatt': return T(P(`M${f(x + r * .1)} ${f(y - r * .9)} q${f(r * .2)} ${f(-r * .6)} ${f(r * .7)} ${f(-r * .45)} q${f(-r * .1)} ${f(r * .5)} ${f(-r * .7)} ${f(r * .45)}z`, '#F08A3D') + S(`M${f(x + r * .1)} ${f(y - r * .9)} l${f(r * .55)} ${f(-r * .35)}`, '#B85A1E', .6));
        case 'blumenkranz': return T([-.6, -.3, 0, .3, .6].map((a, i) => C(x + a * r, y - r * (.86 + (.12 - Math.abs(a) * .2)), r * .14, ['#FF7FA6', '#FFC94D', '#fff', '#B58CFF', '#FF7FA6'][i]) + C(x + a * r, y - r * (.86 + (.12 - Math.abs(a) * .2)), r * .05, '#FFC94D')).join(''));
        case 'nikolaus': return T(P(`M${f(x - r * .72)} ${f(y - r * .62)} Q${f(x - r * .2)} ${f(y - r * 1.9)} ${f(x + r * .95)} ${f(y - r * 1.25)} Q${f(x + r * .5)} ${f(y - r * 1.05)} ${f(x + r * .72)} ${f(y - r * .62)}z`, G('#E5483B')) + E(x, y - r * .62, r * .82, r * .17, '#fff') + C(x + r * .98, y - r * 1.22, r * .16, '#fff'));
        case 'partyhut': return T(P(`M${f(x - r * .4)} ${f(y - r * .82)} L${f(x + r * .05)} ${f(y - r * 1.75)} L${f(x + r * .45)} ${f(y - r * .82)}z`, G('#7A5CFF')) + S(`M${f(x - r * .25)} ${f(y - r * 1.1)} l${f(r * .55)} ${f(-r * .05)} M${f(x - r * .12)} ${f(y - r * 1.38)} l${f(r * .35)} 0`, '#FFC94D', 1.4) + C(x + r * .05, y - r * 1.78, r * .12, '#FF4FA3'));
        case 'hasenohren': return T([-1, 1].map((sg) => E(x + sg * r * .35, y - r * 1.35, r * .16, r * .5, '#fff', `stroke="#f3d6de" stroke-width=".5" ${R(sg * 10, x + sg * r * .35, y - r)}`) + E(x + sg * r * .35, y - r * 1.35, r * .07, r * .36, '#FFB3C6', R(sg * 10, x + sg * r * .35, y - r))).join('') + S(`M${f(x - r * .7)} ${f(y - r * .7)} Q${f(x)} ${f(y - r * 1.1)} ${f(x + r * .7)} ${f(y - r * .7)}`, '#fff', 1.4));
        case 'maske': if (back) return ''; return side ? E(x + r * .38, y - r * .05, r * .3, r * .2, '#B58CFF') : P(`M${f(x - r * .7)} ${f(y - r * .2)} Q${f(x - r * .35)} ${f(y - r * .42)} ${f(x)} ${f(y - r * .15)} Q${f(x + r * .35)} ${f(y - r * .42)} ${f(x + r * .7)} ${f(y - r * .2)} Q${f(x + r * .6)} ${f(y + r * .3)} ${f(x + r * .3)} ${f(y + r * .2)} Q${f(x)} ${f(y + r * .05)} ${f(x - r * .3)} ${f(y + r * .2)} Q${f(x - r * .6)} ${f(y + r * .3)} ${f(x - r * .7)} ${f(y - r * .2)}z`, '#B58CFF', 'opacity=".92"') + [-1, 1].map((sg) => C(x + sg * r * .36, y, r * .17, '#fff', 'opacity=".25"')).join('') + P(`M${f(x + r * .6)} ${f(y - r * .3)} q4 -8 8 -6 q-4 1 -7 7z`, '#FFC94D');
        case 'herzreif': return T(S(`M${f(x - r * .82)} ${f(y - r * .5)} Q${f(x)} ${f(y - r * 1.25)} ${f(x + r * .82)} ${f(y - r * .5)}`, '#FF4F7B', 1.2) + [-1, 1].map((sg) => S(`M${f(x + sg * r * .3)} ${f(y - r * .9)} l${f(sg * 2)} -6`, '#FF4F7B', .8) + P(`M${f(x + sg * r * .3 + sg * 2)} ${f(y - r * .9 - 4)} c-3 -2 -2 -4.4 0 -3 c2 -1.4 3 1 0 3z`, '#FF4F7B')).join(''));
        case 'zylinder': return T(E(x, y - r * .8, r * .72, r * .14, '#1e2430') + `<rect x="${f(x - r * .45)}" y="${f(y - r * 1.55)}" width="${f(r * .9)}" height="${f(r * .75)}" rx="1.4" fill="#2a3142"/>` + S(`M${f(x - r * .45)} ${f(y - r * .95)} h${f(r * .9)}`, '#F7C948', 1.6));
        case 'fahne': return T(S(`M${f(x + r * .6)} ${f(y - r * .7)} v${f(-r * .95)}`, '#8a5a34', 1) + `<rect x="${f(x + r * .6)}" y="${f(y - r * 1.65)}" width="${f(r * .5)}" height="${f(r * .5)}" fill="#E5302D"/>` + P(`M${f(x + r * .8)} ${f(y - r * 1.55)} h${f(r * .1)} v${f(r * .1)} h${f(r * .1)} v${f(r * .1)} h${f(-r * .1)} v${f(r * .1)} h${f(-r * .1)} v${f(-r * .1)} h${f(-r * .1)} v${f(-r * .1)} h${f(r * .1)}z`, '#fff'));
        default: return '';
      }
    });
    return out.join('');
  };
  // ================================================================ other views for the garden: side (walk), back (climb), fly, swim
  // side-view details per animal: sl = snout length, beak type, extra(x, y, r, st) drawn on the head
  const SIDE = {
    fuchs: { sl: .35, snoutC: '#FFF7EC', earC: '#3A2A22' }, katze: { sl: .08 }, hund: { sl: .25, snoutC: '#F6E2C8' }, hase: { sl: .1, snoutC: '#FFFFFF' },
    igel: { sl: .3 }, waschbaer: { sl: .25, mask: '#2D3036' }, panda: { sl: .12, patch: '#26292E' }, erdmann: { sl: .3, ring: '#4A3A2A' }, eichhorn: { sl: .15 },
    hamster: { sl: .06 }, maus: { sl: .3 }, otter: { sl: .15, snoutC: '#E8CBA6' }, biber: { sl: .18 }, reh: { sl: .3 }, koala: { sl: .05, bigNose: 1 }, faultier: { sl: .05, stripe: '#5A4632' },
    robbe: { sl: .15 }, tiger: { sl: .12, snoutC: '#FFF4E4' }, kitsune: { sl: .3, snoutC: '#FFFFFF' }, yeti: { sl: .05, snoutC: '#A9BCDA' }, wolpi: { sl: .1, snoutC: '#F2E6D2' },
  };
  const eyeSide = (x, y, r, mood, col) => {
    const er = r * .15;
    if (mood === 'schlaeft') return S(`M${f(x - er)} ${f(y)} q${f(er)} ${f(er)} ${f(er * 2)} 0`, col || INK, 1.4);
    if (mood === 'freut' || mood === 'stolz') return S(`M${f(x - er)} ${f(y + er * .4)} q${f(er)} ${f(-er * 1.7)} ${f(er * 2)} 0`, col || INK, 1.6);
    return C(x, y, er, col || INK) + C(x + er * .35, y - er * .38, er * .38, '#fff');
  };
  const sideEar = (o, k, x, y, r, far) => {
    const c = far ? dk(o.earC || o.c, .2) : (o.earC || o.c); const t = o.ear; const ic = o.earIn || PINK;
    if (t === 'point' || t === 'tuft' || t === 'horse') { const h = t === 'horse' ? .5 : 1; let s = P(`M${f(x - r * .55)} ${f(y - r * .55)} L${f(x - r * .25)} ${f(y - r * (1.35 * h + (t === 'horse' ? .45 : 0)))} L${f(x + r * .15)} ${f(y - r * .8)}z`, G(c)); if (!far && t !== 'horse') s += P(`M${f(x - r * .42)} ${f(y - r * .65)} L${f(x - r * .25)} ${f(y - r * 1.1)} L${f(x)} ${f(y - r * .8)}z`, ((SIDE[k] || {}).earC) || ic); if (t === 'tuft') s += S(`M${f(x - r * .25)} ${f(y - r * 1.38)} l-1 -4`, dk(o.c, .3), 1.2); return s; }
    if (t === 'round') return C(x - r * .2, y - r * .78, r * (o.earK || .32), G(c)) + (far || o.earIn === false ? '' : C(x - r * .2, y - r * .78, r * (o.earK || .32) * .55, ic));
    if (t === 'long') return E(x - r * .3, y - r * 1.4, r * .25, r * .95, G(c), R(-22, x - r * .3, y - r * .6)) + (far ? '' : E(x - r * .3, y - r * 1.4, r * .11, r * .75, ic, R(-22, x - r * .3, y - r * .6)));
    if (t === 'flop') return far ? '' : E(x - r * .2, y + r * .1, r * .3, r * .6, G(o.earC || dk(o.c, .2)), R(12, x - r * .2, y));
    if (t === 'deer') return E(x - r * .55, y - r * .6, r * .5, r * .22, G(c), R(-30, x - r * .55, y - r * .6));
    if (t === 'koala') return far ? '' : C(x - r * .35, y - r * .6, r * .52, G(c)) + C(x - r * .35, y - r * .6, r * .33, '#F4F1EC');
    if (t === 'bat') return P(`M${f(x - r * .3)} ${f(y - r * .6)} L${f(x - r * .5)} ${f(y - r * 1.7)} L${f(x + r * .15)} ${f(y - r * .8)}z`, G(c));
    if (t === 'side') return far ? '' : E(x - r * .45, y - r * .2, r * .2, r * .24, G(o.earC || dk(o.c, .3)));
    if (t === 'tiny') return far ? '' : C(x - r * .4, y - r * .6, r * .16, o.earC || dk(o.c, .12));
    return '';
  };
  const sideHead = (k, o, st, mood, x, y, r) => {
    const sd = SIDE[k] || {}; let s = ''; const c = o.c; const mid = st !== 'baby'; const big = st === 'gross';
    s += sideEar(o, k, x + r * .12, y, r, 1);
    if (o.horse) { s += E(x, y, r * .85, r * .9, G(c)) + P(`M${f(x + r * .1)} ${f(y - r * .5)} Q${f(x + r * 1.3)} ${f(y - r * .2)} ${f(x + r * 1.4)} ${f(y + r * .45)} Q${f(x + r * 1.1)} ${f(y + r * .85)} ${f(x + r * .3)} ${f(y + r * .75)}z`, G(o.muzC || lt(c, .2))) + C(x + r * 1.2, y + r * .4, r * .07, dk(c, .45)) + S(`M${f(x + r * .9)} ${f(y + r * .65)} q${f(r * .15)} ${f(r * .05)} ${f(r * .3)} 0`, INK, .9);
      if (o.blaze) s += P(`M${f(x + r * .3)} ${f(y - r * .65)} Q${f(x + r * .9)} ${f(y - r * .35)} ${f(x + r * 1.25)} ${f(y + r * .1)} L${f(x + r * 1.15)} ${f(y + r * .2)} Q${f(x + r * .8)} ${f(y - r * .2)} ${f(x + r * .2)} ${f(y - r * .5)}z`, '#fff', 'opacity=".9"');
      const n = st === 'baby' ? 1 : st === 'jung' ? 2 : o.maneC.length; s += o.maneC.slice(0, n).map((mc, i) => P(`M${f(x - r * .1 + i)} ${f(y - r * .95)} Q${f(x - r * 1.0)} ${f(y - r * .4 + i * 2)} ${f(x - r * .9 + i)} ${f(y + r * 1.0)} Q${f(x - r * .4)} ${f(y + r * .2)} ${f(x + r * .1)} ${f(y - r * .7)}z`, mc)).join('');
      if (o.horn) { const H = big ? 14 : mid ? 8 : 3.5; s += P(`M${f(x + r * .3)} ${f(y - r * .8)} L${f(x + r * .55 + H * .45)} ${f(y - r * .8 - H)} L${f(x + r * .65)} ${f(y - r * .65)}z`, '#F7D46B', 'stroke="#C99A16" stroke-width=".5"'); }
      s += sideEar(o, k, x + r * .12, y, r, 0) + eyeSide(x + r * .35, y - r * .2, r, mood); return s; }
    if (o.bird) { s += C(x, y, r, G(c)); const bx = x + r * .85, by = y + r * .1;
      if (o.bird === 'duck') { if (big) s += P(`M${f(x - r)} ${f(y + r * .2)} A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y + r * .2)} L${f(x + r * .9)} ${f(y + r * .55)} Q${f(x)} ${f(y + r * .75)} ${f(x - r * .9)} ${f(y + r * .55)}z`, G('#2E8A4A')); s += P(`M${f(bx - 2)} ${f(by - 1)} Q${f(bx + r * .6)} ${f(by - 2)} ${f(bx + r * .65)} ${f(by + 1.5)} Q${f(bx + r * .3)} ${f(by + 3.5)} ${f(bx - 2)} ${f(by + 3)}z`, big ? '#E8C23A' : '#F08A1E'); }
      else if (o.bird === 'parrot' || o.bird === 'griffin' || o.bird === 'owl') { const bc = o.bird === 'parrot' ? '#3a3a3a' : o.bird === 'griffin' ? '#F5B83D' : '#E3A33B'; if (o.bird === 'owl') s += E(x + r * .25, y, r * .7, r * .75, '#F2E2C2'); if (o.bird === 'parrot' && mid) s += E(x + r * .35, y, r * .4, r * .45, '#fff'); s += P(`M${f(bx - 2)} ${f(by - 3)} Q${f(bx + r * .5)} ${f(by - 3)} ${f(bx + r * .45)} ${f(by + r * .45)} Q${f(bx + r * .2)} ${f(by + 1)} ${f(bx - 2)} ${f(by + 2)}z`, bc); }
      else if (o.bird === 'flamingo') s += P(`M${f(bx - 2)} ${f(by - 2)} L${f(bx + r * .6)} ${f(by)} Q${f(bx + r * .75)} ${f(by + r * .5)} ${f(bx + r * .45)} ${f(by + r * .65)} L${f(bx - 1)} ${f(by + 2)}z`, mid ? '#F2E6E6' : '#555') + (mid ? P(`M${f(bx + r * .55)} ${f(by + r * .1)} Q${f(bx + r * .75)} ${f(by + r * .5)} ${f(bx + r * .45)} ${f(by + r * .65)} L${f(bx + r * .45)} ${f(by + r * .3)}z`, '#2a2a2a') : '');
      else if (o.bird === 'humm') s += S(`M${f(bx - 1)} ${f(by)} l${f(r * (big ? 1.3 : .8))} ${f(1)}`, '#2a2a2a', 1.3) + (big ? E(x + r * .45, y + r * .6, r * .35, r * .2, '#E5304F') : '');
      else s += P(`M${f(bx - 2)} ${f(by - 2)} L${f(bx + r * .55)} ${f(by + .5)} L${f(bx - 2)} ${f(by + 2.5)}z`, o.bird === 'peng' ? '#2a2a2a' : '#F5B83D');
      if (o.bird === 'peng') s += E(x + r * .35, y + r * .2, r * .5, r * .55, o.b);
      if (o.bird === 'phoenix' && mid) s += ['#FFD34D', '#FF8A3D', '#E5483B'].map((cc, i) => P(`M${f(x - r * .2 - i * 3)} ${f(y - r * .8)} Q${f(x - r * .4 - i * 4)} ${f(y - r * 1.6)} ${f(x - r * .9 - i * 3)} ${f(y - r * 1.5)} Q${f(x - r * .5 - i * 3)} ${f(y - r * 1.1)} ${f(x - r * .3 - i * 3)} ${f(y - r * .8)}z`, cc)).join('');
      if (o.bird === 'owl' && mid) s += P(`M${f(x - r * .3)} ${f(y - r * .8)} l${f(-r * .1)} ${f(-r * .5)} l${f(r * .4)} ${f(r * .35)}z`, dk(c, .15));
      return s + eyeSide(x + r * .4, y - r * .1, r, mood, o.bird === 'owl' ? '#2a1a10' : null) + E(x + r * .3, y + r * .4, r * .15, r * .1, '#FF8FA3', 'opacity=".5"'); }
    if (o.insect) { s += C(x, y, r, G(o.insect === 'bee' ? '#F5C33B' : o.insect === 'lady' ? '#262626' : c)); s += S(`M${f(x + r * .2)} ${f(y - r * .85)} q${f(r * .3)} ${f(-r * .6)} ${f(r * .8)} ${f(-r * .6)}`, '#2B2420', 1.1) + C(x + r, y - r * 1.45, 1.5, o.insect === 'fly' ? '#FFC94D' : '#2B2420');
      return s + eyeSide(x + r * .4, y - r * .05, r, mood, o.insect === 'lady' ? '#fff' : null) + S(`M${f(x + r * .55)} ${f(y + r * .45)} q${f(r * .15)} ${f(r * .12)} ${f(r * .3)} 0`, o.insect === 'lady' ? '#fff' : INK, .9); }
    if (o.frog) { s += E(x + r * .1, y + 1, r * 1.1, r * .8, G(c)) + C(x + r * .25, y - r * .62, r * .42, G(c)) + C(x + r * .3, y - r * .62, r * .26, '#fff') + eyeSide(x + r * .35, y - r * .62, r * 1.2, mood); return s + S(`M${f(x + r * .3)} ${f(y + r * .35)} Q${f(x + r * .8)} ${f(y + r * .55)} ${f(x + r * 1.15)} ${f(y + r * .2)}`, INK, 1.1); }
    if (o.reptile || o.wide) { s += E(x + r * .15, y, r * 1.05, r * .82, G(c)) + E(x + r * .7, y + r * .18, r * .55, r * .4, G(c));
      if (o.casque) s += P(`M${f(x - r * .9)} ${f(y - r * .2)} Q${f(x - r * .7)} ${f(y - r * (big ? 1.7 : 1.3))} ${f(x + r * .3)} ${f(y - r * .75)}z`, G(dk(c, .05)));
      if (o.horns && mid) s += P(`M${f(x - r * .2)} ${f(y - r * .7)} Q${f(x - r * .9)} ${f(y - r * 1.2)} ${f(x - r * 1.3)} ${f(y - r * 1.1)} Q${f(x - r * .8)} ${f(y - r * .8)} ${f(x - r * .4)} ${f(y - r * .4)}z`, '#F3E2B0');
      if (o.gills) s += [0, 1, 2].map((i) => S(`M${f(x - r * .6)} ${f(y - r * .2 + i * 3)} q${f(-r * .4)} ${f(-2 + i)} ${f(-r * .8)} ${f(-3 + i * 2)}`, o.gills, 2.4)).join('');
      if (o.hx) s += '';
      if (o.turret) s += C(x + r * .45, y - r * .2, r * .32, G(lt(c, .1)));
      s += eyeSide(x + r * .45, y - r * .2, r * 1.1, mood) + C(x + r * 1.15, y + r * .05, .6, dk(c, .4)) + S(`M${f(x + r * .55)} ${f(y + r * .42)} q${f(r * .3)} ${f(r * .12)} ${f(r * .6)} ${f(-r * .05)}`, INK, .9);
      if (o.reptile && !o.horns && mood === 'froh') s += S(`M${f(x + r * 1.25)} ${f(y + r * .3)} h3 l1.2 -1 M${f(x + r * 1.25 + 3)} ${f(y + r * .3)} l1.2 1`, '#E5485A', .8);
      return s; }
    // mammals
    const sl = sd.sl == null ? .15 : sd.sl; s += C(x, y, r, G(c));
    if (o.spikes) { let pts = ''; const n = 9; for (let i = 0; i <= n; i++) { const a = Math.PI * (.55 + .9 * i / n); const a2 = Math.PI * (.55 + .9 * (i + .5) / n); pts += `${f(x - r * .1 + Math.cos(a) * r * .95)},${f(y + Math.sin(a) * -r * .95)} ${f(x - r * .1 + Math.cos(a2) * r * 1.4)},${f(y + Math.sin(a2) * -r * 1.4)} `; } s += `<polygon points="${pts}" fill="${G(o.spikes)}"/>`; }
    if (sd.patch) s += E(x + r * .35, y - r * .05, r * .3, r * .34, sd.patch, R(-15, x + r * .35, y));
    if (sd.mask) s += P(`M${f(x - r * .3)} ${f(y - r * .2)} Q${f(x + r * .4)} ${f(y - r * .45)} ${f(x + r * .95)} ${f(y - r * .05)} Q${f(x + r * .45)} ${f(y + r * .25)} ${f(x - r * .3)} ${f(y + r * .15)}z`, sd.mask);
    if (sd.ring) s += C(x + r * .35, y - r * .05, r * .26, sd.ring);
    if (sd.stripe) s += P(`M${f(x + r * .05)} ${f(y - r * .1)} q${f(r * .3)} ${f(-r * .3)} ${f(r * .65)} ${f(-r * .05)} q${f(-r * .3)} ${f(r * .3)} ${f(-r * .65)} ${f(r * .2)}z`, sd.stripe);
    if (k === 'tiger' || k === 'katze') s += S(`M${f(x - r * .3)} ${f(y - r * .95)} l1 4 M${f(x - r * .65)} ${f(y - r * .7)} l2 3 M${f(x - r * .9)} ${f(y - r * .2)} l3 1`, k === 'tiger' ? '#2A2420' : '#6F7885', 1.4);
    if (k === 'kitsune') s += P(`M${f(x + r * .1)} ${f(y - r * .75)} q${f(-r * .1)} ${f(r * .2)} 0 ${f(r * .35)} q${f(r * .1)} ${f(-r * .17)} 0 ${f(-r * .35)}z`, '#E5483B');
    if (k === 'yeti') s += E(x + r * .45, y + r * .1, r * .55, r * .55, '#A9BCDA') + [-.4, 0, .3].map((a) => P(`M${f(x + a * r - 3)} ${f(y - r * .82)} Q${f(x + a * r)} ${f(y - r * 1.25)} ${f(x + a * r + 3)} ${f(y - r * .82)}z`, c)).join('');
    if (o.cheeks) s += C(x + r * .25, y + r * .35, r * .32, G(o.cheeks));
    s += E(x + r * (.72 + sl * .9), y + r * .28, r * (.32 + sl), r * .27, sd.snoutC || o.b || lt(c, .35));
    const nx = x + r * (.95 + sl * 1.8);
    if (sd.bigNose) s += E(nx - r * .1, y + r * .15, r * .2, r * .25, '#3A3D42');
    else if (o.nose !== false) s += E(nx, y + r * .17, 1.9, 1.5, o.nose || INK);
    if (o.teeth && mid && mood !== 'freut') s += `<rect x="${f(nx - 2.4)}" y="${f(y + r * .45)}" width="2.2" height="${f(big ? 3 : 2.2)}" rx=".5" fill="${typeof o.teeth === 'string' ? o.teeth : '#fff'}"/>`;
    if (o.whisk) s += S(`M${f(nx - 2)} ${f(y + r * .3)} l${f(r * .55)} -1.5 M${f(nx - 2)} ${f(y + r * .4)} l${f(r * .55)} 1.5`, '#6b7380', .6);
    s += S(`M${f(nx - r * .45)} ${f(y + r * .48)} q${f(r * .2)} ${f(r * .14)} ${f(r * .4)} 0`, INK, 1);
    if (o.tongue && mood !== 'sauer') s += E(nx - r * .25, y + r * .62, 1.3, 1.8, '#F06A7E');
    s += sideEar(o, k, x, y, r, 0);
    if (o.antler && (big || (o.ear === 'long' && mid))) s += S(`M${f(x)} ${f(y - r * .85)} l-1 -7 l-3 -2 M${f(x - .6)} ${f(y - r * .85 - 4)} l2.6 -2.4`, '#6B4A2A', 2);
    s += eyeSide(x + r * .4, y - r * .08, r, mood) + E(x + r * .35, y + r * .35, r * .14, r * .1, '#FF8FA3', 'opacity=".5"');
    return s;
  };
  const drawSide = (k, st, mood, wantWalk, md) => {
    const m = md || {};
    const o0 = BY[k][2]; const o = { ...o0, ...(CUR.pal || {}) };
    if (k === 'ente') { o.c = st === 'baby' ? '#F7D44A' : st === 'jung' ? '#F4E3A2' : '#B5AFA6'; o.b = st === 'gross' ? '#F2EDE4' : '#FFF6CC'; }
    if (k === 'flamingo') o.c = st === 'baby' ? '#C9C9C9' : st === 'jung' ? '#F7C2CF' : '#FF7FA6';
    if (k === 'robbe' && st === 'baby') { o.c = '#F4F4F0'; o.b = '#fff'; }
    if (k === 'pinguin' && st === 'baby') { o.c = '#8C96A2'; o.b = '#DDE2E8'; }
    if (k === 'falter' && st !== 'gross') return draw(k, st, mood, 'stand');
    if (k === 'frosch' && st === 'baby') return draw(k, st, mood, 'stand');
    o._st = st; const bk = st === 'baby' ? 1 : st === 'jung' ? .5 : 0; o._bk = bk;
    const c = o.bodyC || o.c; const hr = (o.hr || 17) * (1 + .26 * bk); const lift = o.longLegs ? 15 : 0;
    const yT = 62 + 5 * bk - lift, yB = 85 + 2 * bk - lift, wT = (o.bw || 8.5) * .85 * (1 + .3 * bk), wB = (o.bw || 8.5) * 1.1 * (1 + .3 * bk);
    const cx = 48; let hy = yT - hr * (.62 + .08 * bk) - (o.longLegs ? 17 : 0) - (o.neckLong ? 13 : 0); const hx = 51 + hr * .1;
    let back = '', mid = '', front = '';
    const lc = o.legC || dk(c, .06); const lw = (o.lw || 5.6) * (1 + .2 * bk); const lh = 9 - 3 * bk;
    const tk = (o.tk || 1) * (st === 'baby' ? .7 : st === 'jung' ? .88 : 1);
    const tx = cx - wB * .75, ty = yB - 5;
    const MOs = CUR.morph || []; if (o.tail && TAIL[o.tail]) back += `<g transform="matrix(-1 0 0 1 ${f(2 * tx)} 0)">${TAIL[o.tail](o, tx, ty, tk * (MOs.includes('langschwanz') ? 1.9 : 1))}</g>`; back += tailMorph(MOs, tx, ty, -1);
    const bw = MOs.find((d) => /fluegel/.test(d)); if (bw) back += `<g transform="translate(${f(cx - 50)} 0) rotate(28 50 ${f(yT + 6)}) translate(50 ${f(yT + 6)}) scale(.68) translate(-50 ${f(-yT - 6)})"><g class="wgS" style="transform-origin:50px ${f(yT + 6)}px">${mWing(bw, o, { y0: yT + 2 }).split('</g>')[0].replace(/^<g[^>]*>/, '')}</g></g>`;
    const wingCol = o.wings || (o.bird && o.bird !== 'peng' ? (o.wingC || dk(c, .12)) : null);
    // legs (far leg darker) with walking classes
    const flyB = m.fly && (o.bird || o.insect);
    if (flyB && o.longLegs) back += S(`M${f(cx - 2)} ${f(yB - 2)} l-14 4 l-6 0 M${f(cx - 2)} ${f(yB - 1)} l-14 6 l-6 1`, lc, 1.8);
    else if (flyB && !o.noLegs) back += E(cx + 1, yB + 1, 3.4, 1.8, o.footC || dk(lc, .1)) + E(cx - 3, yB + .5, 3.4, 1.8, dk(o.footC || lc, .2));
    else if (o.longLegs) { back += `<g class="lgA" style="transform-origin:${cx}px ${f(yB - 2)}px">${S(`M${cx - 1} ${f(yB - 2)} V${f(yB + 9)} l-1.5 6 V93`, dk(lc, .15), 1.8)}</g>`; front += `<g class="lgB" style="transform-origin:${cx}px ${f(yB - 2)}px">${S(`M${cx + 1} ${f(yB - 2)} V${f(yB + 9)} l1.5 6 V93`, lc, 1.8)}${E(cx + 4, 93.6, 3.4, 1.5, lc)}</g>`; }
    else if (!o.noLegs) { const leg = (x0, col, cls) => `<g class="${cls}" style="transform-origin:${f(x0 + lw / 2)}px ${f(yB - 3)}px">${P(`M${f(x0)} ${f(yB - 3)} v${f(lh)} a${f(lw / 2)} ${f(lw / 2)} 0 0 0 ${f(lw)} 0 v${f(-lh)}z`, col)}${E(x0 + lw / 2 + 1.5, 93.4, 4.2, 2.2, o.footC || dk(col, .1))}</g>`; back += leg(cx - lw + 1, dk(lc, .15), m.fly ? 'lgA tuck' : 'lgA'); mid += leg(cx - 1, lc, m.fly ? 'lgB tuck' : 'lgB'); }
    else back += P(`M${f(cx - wB)} ${f(yB - 2)} q${f(-6)} 4 ${f(-9)} 9 l7 -1z`, dk(c, .1));
    // flight wings: far wing behind the body, near wing over it; both beat together around the shoulder
    let wingNear = '';
    const wSc = st === 'baby' ? .55 : st === 'jung' ? .78 : 1;
    if (m.fly && !o.insect && o.bird !== 'humm' && (o.wings || o.batWings || o.bird)) {
      const sx = cx + 1, sy = yT + 4, W = 30 * wSc; const wc = o.wings || o.wingC || dk(c, .12);
      const feather = (col) => P(`M${f(sx)} ${f(sy)} C${f(sx - W * .15)} ${f(sy - W * .45)} ${f(sx - W * .55)} ${f(sy - W * .95)} ${f(sx - W * 1.05)} ${f(sy - W * 1.0)} Q${f(sx - W * .95)} ${f(sy - W * .78)} ${f(sx - W * 1.0)} ${f(sy - W * .66)} Q${f(sx - W * .82)} ${f(sy - W * .52)} ${f(sx - W * .86)} ${f(sy - W * .38)} Q${f(sx - W * .66)} ${f(sy - W * .28)} ${f(sx - W * .68)} ${f(sy - W * .12)} Q${f(sx - W * .44)} ${f(sy - W * .06)} ${f(sx - W * .4)} ${f(sy + W * .1)} Q${f(sx - W * .18)} ${f(sy + W * .12)} ${f(sx)} ${f(sy + 6)}z`, G(col)) + S(`M${f(sx - W * .2)} ${f(sy - W * .3)} q${f(-W * .3)} ${f(-W * .2)} ${f(-W * .62)} ${f(-W * .32)} M${f(sx - W * .15)} ${f(sy - W * .05)} q${f(-W * .25)} ${f(-W * .05)} ${f(-W * .5)} ${f(-W * .1)}`, dk(col, .2), .7);
      const membrane = (col) => P(`M${f(sx)} ${f(sy)} L${f(sx - W * .45)} ${f(sy - W * .95)} L${f(sx - W * 1.05)} ${f(sy - W * .7)} Q${f(sx - W * .9)} ${f(sy - W * .35)} ${f(sx - W * .78)} ${f(sy - W * .4)} Q${f(sx - W * .62)} ${f(sy - W * .05)} ${f(sx - W * .5)} ${f(sy - W * .15)} Q${f(sx - W * .32)} ${f(sy + W * .15)} ${f(sx)} ${f(sy + 7)}z`, G(col)) + S(`M${f(sx)} ${f(sy)} L${f(sx - W * .45)} ${f(sy - W * .95)} L${f(sx - W * 1.05)} ${f(sy - W * .7)} M${f(sx - W * .45)} ${f(sy - W * .95)} L${f(sx - W * .78)} ${f(sy - W * .4)} M${f(sx - W * .45)} ${f(sy - W * .95)} L${f(sx - W * .5)} ${f(sy - W * .15)}`, dk(col, .35), .8);
      const shape = o.batWings || (o.wings && !o.bird && !o.feather && k !== 'pegasus' && k !== 'wolpi') ? membrane : feather;
      back += `<g class="wgF" style="transform-origin:${f(sx)}px ${f(sy)}px">${shape(dk(o.batWings ? c : wc, .18))}</g>`;
      wingNear = `<g class="wgN" style="transform-origin:${f(sx)}px ${f(sy)}px">${shape(o.batWings ? dk(c, .1) : wc)}</g>`;
    } else if (o.wings || o.batWings) back += `<g class="wgS" style="transform-origin:${f(cx - 1)}px ${f(yT + 3)}px">${o.batWings ? P(`M${f(cx - 1)} ${f(yT + 3)} L${f(cx - 14)} ${f(yT - 12)} L${f(cx - 26)} ${f(yT - 6)} Q${f(cx - 22)} ${f(yT + 2)} ${f(cx - 18)} ${f(yT + 1)} Q${f(cx - 14)} ${f(yT + 8)} ${f(cx - 9)} ${f(yT + 5)} Q${f(cx - 6)} ${f(yT + 11)} ${f(cx)} ${f(yT + 9)}z`, G(dk(c, .1))) : P(`M${f(cx - 1)} ${f(yT + 4)} Q${f(cx - 10)} ${f(yT - 16)} ${f(cx - 24)} ${f(yT - 14)} Q${f(cx - 20)} ${f(yT - 6)} ${f(cx - 22)} ${f(yT - 2)} Q${f(cx - 16)} ${f(yT + 2)} ${f(cx - 16)} ${f(yT + 6)} Q${f(cx - 8)} ${f(yT + 8)} ${f(cx + 1)} ${f(yT + 10)}z`, G(o.wings))}</g>`;
    if (o.insect === 'bee' || o.insect === 'fly' || o.bird === 'humm') back += `<g class="wgS buzzw" style="transform-origin:${f(cx)}px ${f(yT + 2)}px">${o.insect === 'fly' ? P(`M${f(cx)} ${f(yT + 2)} C${f(cx - 8)} ${f(yT - 22)} ${f(cx - 26)} ${f(yT - 20)} ${f(cx - 20)} ${f(yT - 2)} C${f(cx - 22)} ${f(yT + 10)} ${f(cx - 10)} ${f(yT + 12)} ${f(cx)} ${f(yT + 6)}z`, G('#8E6CF0')) : E(cx - 13, yT - 13, 12, 6.5, '#EAF6FF', `opacity=".85" stroke="#B8D8F0" stroke-width=".5" ${R(-50, cx - 13, yT - 13)}`) + E(cx - 9, yT - 4, 8, 4.5, '#EAF6FF', `opacity=".7" ${R(-20, cx - 9, yT - 4)}`)}</g>`;
    if (o.spikes) { let pts = ''; const n = 10; for (let i = 0; i <= n; i++) { const a = Math.PI * (.5 + .75 * i / n); const a2 = Math.PI * (.5 + .75 * (i + .5) / n); pts += `${f(cx + Math.cos(a) * wB * 1.2)},${f((yT + yB) / 2 - Math.sin(a) * (yB - yT) * .6)} ${f(cx + Math.cos(a2) * wB * 1.7)},${f((yT + yB) / 2 - Math.sin(a2) * (yB - yT) * .85)} `; } back += `<polygon points="${pts}" fill="${G(o.spikes)}"/>`; }
    if (o.longLegs || o.neckLong) mid += S(`M${f(cx + 2)} ${f(yT + 3)} C${f(cx + 10)} ${f(yT - 6)} ${f(hx - 6)} ${f(hy + hr * 1.6)} ${f(hx - 2)} ${f(hy + hr * .5)}`, c, o.neckLong ? 9 : 4.2);
    mid += P(`M${f(cx - wT)} ${f(yT)} C${f(cx - wT - 2)} ${f(yT + 9)} ${f(cx - wB - 1)} ${f(yB - 6)} ${f(cx - wB + 1)} ${f(yB - 1)} Q${f(cx)} ${f(yB + 3)} ${f(cx + wB - 1)} ${f(yB - 1)} C${f(cx + wB + 2)} ${f(yB - 6)} ${f(cx + wT + 3)} ${f(yT + 9)} ${f(cx + wT)} ${f(yT)} Q${f(cx)} ${f(yT - 3)} ${f(cx - wT)} ${f(yT)}z`, G(c));
    if (o.b && !o.insect) mid += E(cx + wT * .55, (yT + yB) / 2 + 3, wT * .45, (yB - yT) * .36, o.b);
    if (o.insect === 'bee') mid += [0, 1, 2].map((i) => P(`M${f(cx - wB + 1)} ${f(yT + 5 + i * 6)} h${f(wB * 2 - 1)} v2.6 h${f(-wB * 2 + 1)}z`, '#2B2420')).join('');
    if (o.insect === 'lady') { mid += P(`M${f(cx + 3)} ${f(yT - 1)} Q${f(cx - wB * 2)} ${f(yT + 2)} ${f(cx - wB * 1.3)} ${f(yB + 1)} L${f(cx + 3)} ${f(yB - 1)}z`, G('#E5352D')) + [[-.9, .3], [-1.3, .6], [-.5, .65], [-.8, .85]].slice(0, st === 'baby' ? 1 : st === 'jung' ? 2 : 4).map(([a, b]) => C(cx + a * wB, yT + b * (yB - yT), 2.1, '#1E1E1E')).join(''); }
    if (o.bodyX && ['panda', 'tiger'].includes(k)) mid += k === 'panda' ? P(`M${f(cx - wT)} ${f(yT + 2)} h${f(wT * 2)} v6 h${f(-wT * 2)}z`, '#26292E') : S(`M${f(cx - 4)} ${f(yT + 4)} q2 2 0 5 M${f(cx + 2)} ${f(yT + 6)} q2 2 0 5`, '#2A2420', 1.5);
    // near arm (paw or wing)
    mid += wingNear;
    const ac = o.armC || dk(c, .06); const ax = cx + 2, ay = yT + 3; const adY = 11 * (1 - .3 * bk);
    if (wingNear && o.bird) front += '';
    else if (o.bird) front += `<g class="arm" style="transform-origin:${f(ax)}px ${f(ay)}px">${P(`M${f(ax + 2)} ${f(ay - 2)} q-9 3 -9 16 q6 -3 10 -9z`, G(o.bird === 'peng' ? dk(c, .05) : (o.wingC || dk(c, .1))))}</g>`;
    else if (!o.batWings && !o.flippers) front += `<g class="arm" style="transform-origin:${f(ax)}px ${f(ay)}px">${S(`M${f(ax)} ${f(ay)} q1 ${f(adY * .5)} 2 ${f(adY)}`, ac, 4.2)}${C(ax + 2, ay + adY, 2.5, o.pawC || ac)}</g>`;
    else if (o.flippers) front += `<g class="arm" style="transform-origin:${f(ax)}px ${f(ay)}px">${P(`M${f(ax)} ${f(ay - 1)} q2 8 7 13 q-5 0 -8 -7z`, G(dk(c, .08)))}</g>`;
    const head = `<g transform="translate(${f(hx)} ${f(hy)}) scale(.82 1) translate(${f(-hx)} ${f(-hy)})">${morphBack((CUR.morph || []).filter((d) => ['megamaehne','elfenohren','glutmaehne','blattmaehne','eiskragen','flossen','mondhalo','sonnenkranz'].includes(d) && d !== 'elfenohren' && d !== 'megamaehne'), hx, hy, hr, o, {})}</g>` + sideHead(k, o, st, mood, hx, hy, hr) + `<g transform="translate(${f(hx)} ${f(hy)}) scale(.82 1) translate(${f(-hx)} ${f(-hy)})">${morphTop((CUR.morph || []).filter((d) => /frisur|locken|kakadu|widder|geweih|kristallhorn|zuckerhorn|pilzhut|riesenbluete/.test(d)), hx, hy, hr, o)}</g>` + deco(CUR.deco, hx, hy, hr, 'side', o, st, { x: cx, y0: yT + 2, y1: yB - 2, w: wT, feet: [[cx + 1.5, 93.4], [cx - 4, 93.4]] });
    const S0 = ST[st];
    const wl = 95 - (95 - (o.longLegs ? 92 : yT + (yB - yT) * (o.bird || o.frog ? .7 : .55))) * S0;
    return { wl, s: `<g transform="translate(50 95) scale(${S0}) translate(-50 -95)"><g class="${wantWalk ? 'walk' : ''}">${back}${mid}<g class="hdS" style="transform-origin:${f(hx)}px ${f(hy + hr)}px">${head}</g>${front}</g></g>`, fx: moodFx(mood, 50, 95 - (95 - hy) * S0, hr * S0), hy, hr };
  };
  const drawBack = (k, st, mood, climb) => {
    const o0 = BY[k][2]; const o = { ...o0, ...(CUR.pal || {}) }; if (k === 'falter' && st !== 'gross') return draw(k, st, mood, 'stand');
    if (k === 'ente') o.c = st === 'baby' ? '#F7D44A' : st === 'jung' ? '#F4E3A2' : '#B5AFA6';
    if (k === 'flamingo') o.c = st === 'baby' ? '#C9C9C9' : st === 'jung' ? '#F7C2CF' : '#FF7FA6';
    o._st = st; const bk = st === 'baby' ? 1 : st === 'jung' ? .5 : 0; o._bk = bk; const big = st === 'gross'; const mid2 = st !== 'baby';
    const o2 = { ...o, b: null };
    const B = body(o2, st, 'stand');
    const x = 50, y = B.hy, hr = B.hr; const c = o.bodyC || o.c;
    let s = '';
    s += B.mid;
    if (k === 'panda') s += P('M41 62 Q50 67 59 62 L60 68 Q50 72 40 68z', '#26292E');
    if (k === 'tiger') s += S('M44 66 q6 3 12 0 M43 72 q7 3 14 0 M44 78 q6 3 12 0', '#2A2420', 1.6);
    if (o.insect === 'bee') s += beeStripes('stand', st);
    if (o.insect === 'lady') { s += P(`M${f(50 - B.sh[2] + 50 - 4)} 60 Q50 54 ${f(B.sh[2] + 4)} 60 L${f(B.sh[2] + 6)} 84 Q50 90 ${f(50 - (B.sh[2] - 50) - 6)} 84z`, G('#E5352D')) + S('M50 57 V88', '#1E1E1E', 1) + [[-5, 66], [5, 66], [-6, 74], [6, 74], [-4, 81], [4, 81]].slice(0, st === 'baby' ? 2 : st === 'jung' ? 4 : 6).map(([dx, yy]) => C(50 + dx, yy, 2.1, '#1E1E1E')).join(''); }
    // head (back side)
    let hd = '';
    if (o.ear && EARS[o.ear]) hd += EARS[o.ear]({ ...o, earIn: false }, x, y, hr, mood, o.earK);
    if (o.horns && mid2) hd += [-1, 1].map((sg) => P(`M${f(x + sg * hr * .3)} ${f(y - hr * .8)} Q${f(x + sg * hr * .75)} ${f(y - hr * 1.2)} ${f(x + sg * hr * 1.05)} ${f(y - hr * 1.35)} Q${f(x + sg * hr * .85)} ${f(y - hr * .85)} ${f(x + sg * hr * .7)} ${f(y - hr * .62)}z`, '#F3E2B0')).join('');
    hd += o.frog ? E(x, y + 1, hr * 1.25, hr * .85, G(c)) + C(x - hr * .62, y - hr * .62, hr * .42, G(c)) + C(x + hr * .62, y - hr * .62, hr * .42, G(c)) : o.reptile || o.wide ? E(x, y, hr * 1.08, hr * .9, G(dk(c, .05))) : o.horse ? E(x, y - hr * .05, hr * .82, hr * .95, G(dk(c, .04))) : C(x, y, hr, G(dk(o.c, .04)));
    if (o.casque) hd += P(`M${f(x - hr * .75)} ${f(y - hr * .55)} Q${f(x)} ${f(y - hr * (big ? 2.05 : 1.6))} ${f(x + hr * .75)} ${f(y - hr * .55)}z`, G(dk(c, .08)));
    if (o.horse) { const n = st === 'baby' ? 1 : st === 'jung' ? 2 : o.maneC.length; hd += o.maneC.slice(0, n).map((mc, i) => P(`M${f(x - 4 + i * 2)} ${f(y - hr * .95)} Q${f(x - 6 + i * 2)} ${f(y + hr * .2)} ${f(x - 3 + i * 2)} ${f(y + hr * 1.5)} L${f(x + 3 + i * 2)} ${f(y + hr * 1.5)} Q${f(x + 3 + i * 2)} ${f(y)} ${f(x + 2 + i * 2)} ${f(y - hr * .95)}z`, mc)).join(''); }
    if (o.bird === 'owl' && mid2) hd += P(`M${f(x - hr * .82)} ${f(y - hr * .55)} l${f(-hr * .15)} ${f(-hr * .55)} l${f(hr * .5)} ${f(hr * .3)}z M${f(x + hr * .82)} ${f(y - hr * .55)} l${f(hr * .15)} ${f(-hr * .55)} l${f(-hr * .5)} ${f(hr * .3)}z`, dk(c, .15));
    if (o.bird === 'duck' && big) hd = hd.replace(/fill="url\(#v\d+\)" \/>$/, '') + C(x, y, hr, G('#2E8A4A'));
    if (o.bird === 'phoenix' && mid2) hd += ['#FFD34D', '#FF8A3D', '#E5483B'].map((cc, i) => P(`M${f(x - 3 + i * 3)} ${f(y - hr * .85)} Q${f(x - 5 + i * 4)} ${f(y - hr * 1.6)} ${f(x - 1 + i * 2)} ${f(y - hr * 1.75)} Q${f(x + 1 + i * 2)} ${f(y - hr * 1.3)} ${f(x - 1 + i * 3)} ${f(y - hr * .85)}z`, cc)).join('');
    if (o.spikes) { let pts = ''; const n = big ? 20 : 14; for (let i = 0; i <= n; i++) { const a = Math.PI * (.95 + 1.1 * i / n); const a2 = Math.PI * (.95 + 1.1 * (i + .5) / n); pts += `${f(x + Math.cos(a) * hr * .95)},${f(y + 14 + Math.sin(a) * (hr + 14) * .95)} ${f(x + Math.cos(a2) * hr * 1.25)},${f(y + 14 + Math.sin(a2) * (hr + 14) * 1.12)} `; } hd += `<polygon points="${pts}" fill="${G(o.spikes)}"/>` + E(x, y + 14, hr * .95, (hr + 14) * .92, G(o.spikes)); }
    if (k === 'tiger' || k === 'katze') hd += S(`M${f(x - 4)} ${f(y - hr * .6)} q4 3 8 0 M${f(x - 6)} ${f(y - hr * .2)} q6 3 12 0`, k === 'tiger' ? '#2A2420' : '#6F7885', 1.5);
    hd += S(`M${f(x - 1.5)} ${f(y - hr * .55)} q1.5 -2 3 0`, dk(o.c, .2), .9);
    if (o.antler && (big || (o.ear === 'long' && mid2))) hd += S(`M${f(x - hr * .4)} ${f(y - hr * .85)} l-2 -7 l-3 -2 M${f(x + hr * .4)} ${f(y - hr * .85)} l2 -7 l3 -2`, '#6B4A2A', 2);
    // wings and tail in front (we look at the back)
    let wg = '';
    if (o.wings || o.batWings) wg += wings(o, st, 'stand', B);
    if (o.insect === 'bee' || o.insect === 'fly' || o.bird === 'humm') wg += insectWings(o.bird === 'humm' ? { insect: 'bee' } : o, st, 'stand', B);
    if (o.bird && o.bird !== 'peng' && !o.wings) wg += P(`M${f(B.sh[0] + 2)} ${f(B.sh[1] - 3)} q-8 4 -6 18 q5 -3 8 -10z M${f(B.sh[2] - 2)} ${f(B.sh[3] - 3)} q8 4 6 18 q-5 -3 -8 -10z`, G(o.wingC || dk(c, .12)));
    const tk = (o.tk || 1) * (st === 'baby' ? .7 : st === 'jung' ? .88 : 1);
    const MOb = CUR.morph || []; let tl = ''; if (o.tail && TAIL[o.tail]) tl = `<g transform="rotate(-35 50 82)">${TAIL[o.tail](o, 49, 82, tk * (MOb.includes('langschwanz') ? 1.9 : 1))}</g>`;
    wg += morphBack(MOb.filter((d) => /fluegel|faecher|zacken/.test(d)), x, y, hr, o, { x: 50, y0: B.sh[1] - 3, y1: 86, w: 8 }) + morphTop(MOb.filter((d) => /frisur|locken|kakadu|widder|geweih|horn|pilzhut|riesenbluete/.test(d)), x, y, hr, o) + morphBack(MOb.filter((d) => ['megamaehne','elfenohren','glutmaehne','blattmaehne','eiskragen','flossen','mondhalo','sonnenkranz'].includes(d) && !['elfenohren','megamaehne'].includes(d)), x, y, hr, o, {});
    // arms: up for climbing
    const ac = o.armC || dk(c, .06); let ar = '';
    if (climb && !o.noLegs) ar = [-1, 1].map((sg) => `<g class="${sg < 0 ? 'clA' : 'clB'}" style="transform-origin:${f(50 + sg * 7)}px ${f(B.sh[1])}px">${S(`M${f(50 + sg * 7)} ${f(B.sh[1])} q${f(sg * 9)} -6 ${f(sg * 10)} -20`, ac, 4.4)}${C(50 + sg * 17, B.sh[1] - 20, 2.8, o.pawC || ac)}</g>`).join('');
    else ar = arms(o, B.sh, 'stand', o.bird ? (o.bird === 'peng' ? 'flipper' : 'wing') : o.flippers ? 'flipper' : o.batWings ? 'none' : 'paw');
    const S0 = ST[st];
    return { s: `<g transform="translate(50 95) scale(${S0}) translate(-50 -95)">${s}<g class="erb">${hd}${deco(CUR.deco, x, y, hr, 'back', o, st, { x: 50, y0: B.sh[1] - 3, y1: 86, w: (B.sh[2] - B.sh[0]) / 2 + 1, feet: [[44.8, 93.4], [55.2, 93.4]] })}</g>${wg}<g class="tl">${tl}</g>${ar}</g>`, fx: moodFx(mood, 50, 95 - (95 - y) * S0, hr * S0), hy: y, hr };
  };
  const FLIERS = ['eule', 'papagei', 'ente', 'drache', 'biene', 'kaefer', 'falter', 'fledermaus', 'kolibri', 'pegasus', 'phoenix', 'greif', 'wolpi', 'flamingo'];
  const SWIMMERS = ['ente', 'otter', 'pinguin', 'frosch', 'axolotl', 'robbe', 'biber', 'flamingo', 'nessie'];
  const CLIMBERS = ['katze', 'waschbaer', 'eichhorn', 'koala', 'faultier', 'chamae', 'kitsune', 'yeti'];
  const view = (kind, stage, mood, v, opt) => {
    const o = opt || {}; mood = mood || 'froh'; stage = stage || 'gross';
    if (!BY[kind]) return ''; uid += 1; defs = ''; CUR = { pal: o.pal, deco: o.deco, pat: o.pat, under: o.under, back: o.back, morph: o.morph };
    let r; let extra = ''; let pre = ''; let cls = '';
    if (v === 'side' || v === 'walk') { r = drawSide(kind, stage, mood, v === 'walk'); cls = v === 'walk' ? ' walking' : ''; }
    else if (v === 'flySide') { r = drawSide(kind, stage, mood, false, { fly: 1 }); }
    else if (v === 'swimSide') { r = drawSide(kind, stage, mood, false); const id = 'sc' + (++uid); const wl = r.wl || 80; defs += `<clipPath id="${id}"><rect x="-60" y="-80" width="220" height="${f(wl + 80)}"/></clipPath>`; r = { ...r, s: `<g clip-path="url(#${id})">${r.s}</g>` }; extra = `<path d="M${f(30)} ${f(wl)} h40" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>`; pre = `<!--wl:${f(wl)}-->`; }
    else if (v === 'climbNT') { r = drawBack(kind, stage, mood, true); }
    else if (v === 'back' || v === 'climb') { r = drawBack(kind, stage, mood, v === 'climb'); if (v === 'climb') pre = `<rect x="38" y="0" width="24" height="100" rx="6" fill="#8A5A34"/><path d="M42 10 q3 6 0 12 M56 30 q-3 6 0 12 M44 55 q3 6 0 12 M55 75 q-3 5 0 10" stroke="#6B4224" stroke-width="1.4" fill="none"/>`; cls = v === 'climb' ? ' climbing' : ''; }
    else if (v === 'fly') {
      const b = BY[kind][2]; const save = { ...b };
      b.noLegs = 1; if (b.bird && b.bird !== 'peng' && !b.wings && b.bird !== 'humm') { b.wings = b.wingC || dk(b.c, .12); b.feather = 1; }
      r = draw(kind, stage, mood, 'stand'); Object.keys(b).forEach((kk) => { if (!(kk in save)) delete b[kk]; }); Object.assign(b, save);
      cls = ' flying'; pre = '';
    } else if (v === 'swim') {
      r = draw(kind, stage, mood, 'sit'); const id = 'wc' + (++uid); defs += `<clipPath id="${id}"><rect x="-20" y="-40" width="140" height="${f(84 + 40)}"/></clipPath><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3FF" stop-opacity=".85"/><stop offset="1" stop-color="#3A97D0" stop-opacity=".95"/></linearGradient>`;
      r = { ...r, s: `<g clip-path="url(#${id})">${r.s}</g>` };
      extra = `<path d="M4 84 q6 -2 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 V97 Q50 101 4 97z" fill="url(#${id}w)"/><g class="rip">${E(50, 84.5, 24, 3, 'none', 'stroke="#fff" stroke-width="1.2" opacity=".9"')}${E(50, 84.5, 32, 4.4, 'none', 'stroke="#fff" stroke-width=".8" opacity=".5"')}</g><g class="bubl">${C(30, 90, 1.2, '#fff', 'opacity=".7"')}${C(70, 92, 1, '#fff', 'opacity=".6"')}</g>`;
      cls = ' swimming';
    } else return svg(kind, stage, mood, opt);
    CUR = {};
    const skId = o.skin ? skinDef(o.skin) : ''; const S0v = ({ baby: .6, jung: .8, gross: 1 })[stage]; const au = aura(o.aura, 95 - 33 * S0v, S0v);
    if (o.skin === 'regenbogen') r = { ...r, s: `<g class="rbw">${r.s}</g>` }; else if (skId) r = { ...r, s: `<g filter="url(#${skId})">${r.s}</g>` };
    const sp = BY[kind][2];
    const sh = o.noShadow || ['flySide', 'swimSide', 'climbNT'].includes(v) ? '' : v === 'fly' ? E(50, 97, 12 * ST[stage], 1.6, '#000', 'opacity=".1"') : v === 'swim' || v === 'climb' ? '' : E(50, 95.5, 18 * ST[stage], 2.2, '#000', 'opacity=".16"');
    const filt = sp.shift ? ' class="chroma"' : '';
    const lift = v === 'fly' ? ' transform="translate(0 -10)"' : '';
    const anC = v === 'fly' ? 'hov' : ['flySide', 'swimSide', 'climbNT'].includes(v) ? '' : 'idle';
    return `<svg class="p4 m-${mood}${cls}" viewBox="${o.view || '0 0 100 100'}" xmlns="http://www.w3.org/2000/svg" overflow="visible"><defs>${defs}</defs>${pre}${sh}${au}<g${lift}><g${filt}><g class="${anC}">${r.s}</g></g>${r.fx}</g>${extra}</svg>`;
  };
  const CSS = `.p4{overflow:visible}.p4 *{transform-box:view-box}
.p4 .idle{animation:p4idle 3.4s ease-in-out infinite;transform-origin:50px 95px}@keyframes p4idle{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.018)}}
.p4 .hop{animation:p4hop .9s ease-in-out infinite;transform-origin:50px 95px}@keyframes p4hop{0%,55%,100%{transform:translateY(0)}25%{transform:translateY(-5px)}}
.p4 .sway{animation:p4sway 3s ease-in-out infinite;transform-origin:50px 95px}@keyframes p4sway{50%{transform:rotate(-3deg)}}
.p4 .shake{animation:p4shake 1.6s ease-in-out infinite;transform-origin:50px 95px}@keyframes p4shake{0%,70%,100%{transform:translateX(0)}75%,85%{transform:translateX(-1px)}80%,90%{transform:translateX(1px)}}
.p4 .look{animation:p4look 2.4s ease-in-out infinite;transform-origin:50px 95px}@keyframes p4look{50%{transform:rotate(4deg)}}
.p4 .proud{animation:p4proud 2.4s ease-in-out infinite;transform-origin:50px 95px}@keyframes p4proud{50%{transform:scale(1.03)}}
.p4 .breath{animation:p4idle 3s ease-in-out infinite;transform-origin:50px 95px}
.p4 .wag{animation:p4wag 2.4s ease-in-out infinite}.p4.m-freut .wag,.p4 .wagf{animation:p4wag .5s ease-in-out infinite}@keyframes p4wag{0%,100%{transform:rotate(0)}50%{transform:rotate(-9deg)}}
.p4 .blink{animation:p4blink 4.5s infinite;transform-origin:center;transform-box:fill-box}@keyframes p4blink{0%,93%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
.p4 .wgl{animation:p4wl 3.6s ease-in-out infinite}.p4 .wgr{animation:p4wr 3.6s ease-in-out infinite}@keyframes p4wl{0%,80%,100%{transform:rotate(0)}88%{transform:rotate(10deg)}}@keyframes p4wr{0%,80%,100%{transform:rotate(0)}88%{transform:rotate(-10deg)}}
.p4 .buzzw{animation-duration:.12s;animation-name:p4buzz}@keyframes p4buzz{50%{transform:rotate(-18deg)}}
.p4 .flapw{animation:p4flap 2.4s ease-in-out infinite}@keyframes p4flap{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.82)}}
.p4 .zz{animation:p4z 2.6s ease-in-out infinite}@keyframes p4z{0%{opacity:0;transform:translate(0,3px)}30%,70%{opacity:1}100%{opacity:0;transform:translate(3px,-4px)}}
.p4 .ht{animation:p4h 1.6s ease-out infinite}@keyframes p4h{0%{opacity:0;transform:translateY(3px)}30%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
.p4 .puff{animation:p4h 1.8s ease-out infinite}.p4 .tw{animation:p4tw 2s ease-in-out infinite}@keyframes p4tw{50%{opacity:.4}}
.p4 .chroma{animation:p4chroma 9s ease-in-out infinite}@keyframes p4chroma{0%,100%{filter:hue-rotate(0)}33%{filter:hue-rotate(-60deg)}66%{filter:hue-rotate(95deg) saturate(1.2)}}
.p4.egg .wob{animation:p4wob 3s ease-in-out infinite;transform-origin:50px 94px}@keyframes p4wob{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-6deg)}82%{transform:rotate(5deg)}88%{transform:rotate(-3deg)}}
.p4 .spk{animation:p4tw 1.2s ease-in-out infinite}

.p4.walking .lgA{animation:p4legA .5s ease-in-out infinite}.p4.walking .lgB{animation:p4legB .5s ease-in-out infinite}.p4.walking .arm{animation:p4legB .5s ease-in-out infinite}
.p4.walking .walk{animation:p4bob .25s ease-in-out infinite alternate}@keyframes p4bob{to{transform:translateY(-1.2px)}}
@keyframes p4legA{0%,100%{transform:rotate(22deg)}50%{transform:rotate(-22deg)}}@keyframes p4legB{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(22deg)}}
.p4.climbing .clA{animation:p4clA 1s ease-in-out infinite}.p4.climbing .clB{animation:p4clB 1s ease-in-out infinite}@keyframes p4clA{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}@keyframes p4clB{0%,100%{transform:translateY(5px)}50%{transform:translateY(0)}}
.p4.flying .wgl,.p4.flying .wgr,.p4.flying .wgS{animation-duration:.36s!important}.p4.flying .wgl{animation-name:p4fl}.p4.flying .wgr{animation-name:p4fr}@keyframes p4fl{0%,100%{transform:rotate(0)}50%{transform:rotate(28deg)}}@keyframes p4fr{0%,100%{transform:rotate(0)}50%{transform:rotate(-28deg)}}
.p4 .wgS{animation:p4ws .36s ease-in-out infinite}@keyframes p4ws{50%{transform:rotate(-30deg)}}
.p4 .hov{animation:p4hov 1.4s ease-in-out infinite}@keyframes p4hov{50%{transform:translateY(-3px)}}
.p4 .rip{animation:p4rip 2s ease-in-out infinite;transform-origin:50px 84px}@keyframes p4rip{50%{transform:scaleX(1.1);opacity:.6}}
.p4.swimming .idle{animation:p4bobw 2.2s ease-in-out infinite}@keyframes p4bobw{50%{transform:translateY(1.5px)}}
.p4 .bigw{animation:p4bw 2.8s ease-in-out infinite!important}.p4 .wgl.bigw{animation-name:p4bwl!important}@keyframes p4bw{50%{transform:rotate(-7deg)}}@keyframes p4bwl{50%{transform:rotate(7deg)}}
.p4 .aura .aur{animation:p4aur 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes p4aur{50%{transform:scale(1.08);opacity:.75}}.p4 .orb{animation:p4orb 6s linear infinite}@keyframes p4orb{to{transform:rotate(360deg)}}
.p4 .rbw{animation:p4rbw 3s linear infinite}@keyframes p4rbw{to{filter:hue-rotate(360deg) saturate(1.3)}}.p4 .twk{animation:p4twk 1.6s ease-in-out infinite}@keyframes p4twk{50%{opacity:.2}}.p4 .flk{animation:p4flk .5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:bottom}@keyframes p4flk{to{transform:scaleY(1.25) skewX(4deg)}}
.p4 .fc{transform:translateX(calc(var(--tn, 0) * 4.6px))}.p4 .er{transform:translateX(calc(var(--tn, 0) * -1.4px))}.p4 .tl{transform:translateX(calc(var(--tn, 0) * -6px))}.p4 .erb{transform:translateX(calc(var(--tn, 0) * 2px))}
@media (prefers-reduced-motion:reduce){.p4 *{animation:none!important}}`;
  window.P4 = { HAT_NO, MORPH_TXT, SKIN, PAT_TXT, UNDER_TXT, BACK_TXT, AURA_TXT, TRAIT_TXT, DECO_TXT, LIST, BY, svg, egg, CSS, view, FLIERS, SWIMMERS, CLIMBERS };
})();
