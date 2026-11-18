// Family Planer Tierchen graphics – built by frontend_src/build.py, do not edit
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
    const hr = B.hr; const x = 50; const y = B.hy - (o.longLegs && form === 'stand' ? 0 : 0);
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
    // long bird legs (flamingo) are drawn by the body; extend
    if (o.longLegs && form === 'stand') mid2 = mid2.replace(/v9 a/g, 'v9 a');
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
    const top = [G.pond.cx, G.pond.cy - G.pond.ry * 1.42], bot = [G.pond.cx, Math.min(508, G.pond.cy + G.pond.ry * 1.36)];
    const d = (p) => Math.hypot(p[0] - x0, p[1] - y0) + Math.hypot(x1 - p[0], y1 - p[1]);
    const via = d(top) < d(bot) ? top : bot; const side = x1 > x0 ? -1 : 1;
    return [[via[0] + side * G.pond.rx * .55, via[1] + (via === top ? 8 : -6)], via, [via[0] - side * G.pond.rx * .55, via[1] + (via === top ? 8 : -6)], [x1, y1]].filter((p, i, a) => i === a.length - 1 || Math.sign(p[0] - x0) === Math.sign(x1 - x0) || Math.abs(p[0] - x0) > 30);
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

/* Family Planer – the planner header scene (house + pool) as a second world for the pet motion engine (design draft, round 13).
   Same coordinates as the real header: viewBox 0 0 1200 120, house centred at x 640, pool right in front of it. */
(() => {
  const M = window.FPMOTION; const rnd = (a, b) => a + Math.random() * (b - a);
  const inPool = (x, y) => x > 568 && x < 712 && y > 97 && y < 114;
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
    { n: 'Terrasse vor dem Pool', c: '#FFD34D', r: [560, 113, 720, 118], walk: 1 },
    { n: 'Pool – offen: baden, zu: auf der Abdeckung', c: '#3AA0DA', r: [577, 101.3, 703, 109.5], pool: 1 },
    { n: 'Blumenbeet', c: '#FF8FB0', r: [718, 104, 754, 112] },
    { n: 'Unter dem Apfelbaum', c: '#2E8A4A', r: [770, 104, 830, 118], walk: 1 },
    { n: 'Wiese rechts', c: '#8CE07A', r: [754, 101, 1060, 118], walk: 4 },
    { n: 'Garagendach – Flieger und Kletterer', c: '#B58CFF', r: [562, 60, 598, 67], air: 1 },
    { n: 'Hausdach – nur Flieger', c: '#B58CFF', r: [600, 6, 680, 32], air: 1 },
    { n: 'Haus – kein Zutritt', c: '#E5483B', r: [592, 32, 688, 99], no: 1 },
  ];
  const HIDES = [{ x: 455, y: 105, n: 'hinter dem Busch' }, { x: 1015, y: 107, n: 'hinter dem grossen Busch' }, { x: 548, y: 99.6, n: 'hinter dem Busch an der Garage' }, { x: 794, y: 104.6, n: 'hinter dem Apfelbaum' }, { x: 736, y: 107.5, n: 'im Blumenbeet' }, { x: 985, y: 112.5, n: 'hinter dem kleinen Busch' }];
  const zonesSvg = () => `<svg class="gzones" viewBox="0 0 1200 120" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:1200px;height:120px;z-index:4300;pointer-events:none">${ZONES.map((z) => `<rect x="${z.r[0]}" y="${z.r[1]}" width="${z.r[2] - z.r[0]}" height="${z.r[3] - z.r[1]}" fill="${z.c}" fill-opacity="${z.no ? .25 : .28}" stroke="${z.c}" stroke-width=".8" ${z.air ? 'stroke-dasharray="3 2"' : ''} rx="1.5"/>`).join('')}${HIDES.map((h) => `<circle cx="${h.x}" cy="${h.y}" r="2.4" fill="#fff" stroke="#2a3140" stroke-width=".6"/><text x="${h.x}" y="${h.y + .9}" text-anchor="middle" font-size="3" font-weight="900" fill="#2a3140">👀</text>`).join('')}${ZONES.map((z, i) => `<text x="${(z.r[0] + z.r[2]) / 2}" y="${z.no ? 70 : z.r[1] - 1.5}" text-anchor="middle" font-size="4.6" font-weight="800" fill="#1e2430" stroke="#fff" stroke-width="1.6" paint-order="stroke" font-family="system-ui">${z.n}</text>`).join('')}</svg>`;
  const pickZone = () => { const W = ZONES.filter((z) => z.walk); const tot = W.reduce((a, z) => a + z.walk, 0); let r = Math.random() * tot; for (const z of W) { r -= z.walk; if (r <= 0) return z; } return W[0]; };
  const HEADER = {
    W: 1200, H: 120, y0: 98, y1: 118, base: 46, sk: .3, zk: .3, fxk: .55, rippleK: .22, poolOpen: true,
    pond: { cx: 640, cy: 105.4, rx: 63, ry: 4.3, n: 8 },
    tree: { x: 794, y: 106, branchY: 72, branchX: 812 },
    branchZ: (x) => 106 - (74 - (x - 794) * .12),
    roof: { x: 640, y: 99, z: 70 }, stone: { x: 580, y: 99, z: 31 }, post: { x: 872, y: 112, z: 34 },
    flowers: [[724, 109], [736, 112], [748, 108]], bowl: { x: 700, y: 116 }, nest: { x: 764, y: 116 }, hill: { x: 960, y: 110 },
    cover: { x: 640, y: 105, z: 1 }, race: [740, 1060, 109, 113],
    beds: { huette: { x: 520, y: 108 }, korb: { x: 714, y: 116 }, vogelhaus: { x: 872, y: 112, z: 34 }, seerose: { x: 660, y: 106 }, bau: { x: 960, y: 110 }, nest: { x: 764, y: 116 } },
    hides: HIDES, zones: ZONES,
    free: () => { for (;;) { const z = pickZone(); const p = [rnd(z.r[0] + 4, z.r[2] - 4), rnd(z.r[1] + .5, z.r[3] - .5)]; if (!inPool(p[0], p[1])) return p; } },
    draw: () => bgSvg() + PLANTS.map(([z, inner]) => `<svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:1200px;height:120px;z-index:${z};pointer-events:none">${inner}</svg>`).join(''),
  };
  window.FPHEADER = { HEADER, ZONES, HIDES, zonesSvg };
})();

/* Family Planer – worlds for the pets (design draft, round 15): the garden (Tierchen page) and the header scene (house + pool).
   Both are drawn in the planner's style (modern white house, dark roof, mountains) and change with the season and the night.
   Sleeping places (nest, hut, basket, bird house, burrow, lily pad / swim ring) are NOT part of the scenery: they pop up
   when an animal goes to sleep and disappear when it wakes up; every animal gets its own place. */
(() => {
  const M = window.FPMOTION; const G = M.GARDEN; const H = window.FPHEADER.HEADER;
  const SE = (se) => { const S = M.SEASONS[se] || M.SEASONS.sommer; return { base: S.base || 'sommer', se, decor: S.decor }; };
  const PAL = {
    fruehling: { sky: ['#8fd3ff', '#e8f7ff'], hill: ['#c6e8a4', '#b2df8c'], grass: ['#9bd970', '#74c252'], crown: ['#6cc455', '#57b047', '#4a9e3c'], fruit: '#FF9EC8', mtn: '#b7cde4', snowcap: 1 },
    sommer: { sky: ['#6cc3ff', '#d6f0ff'], hill: ['#b3e08f', '#a4db7f'], grass: ['#8fd165', '#62b645'], crown: ['#5fb548', '#4fa83f', '#3f9535'], fruit: '#E5483B', mtn: '#a9c3de', snowcap: 1 },
    herbst: { sky: ['#9cc7e6', '#f4e8d6'], hill: ['#d8c47a', '#cdb46a'], grass: ['#b8bf62', '#96a24a'], crown: ['#F2A03A', '#E5793A', '#D9572E'], fruit: '#C2312A', mtn: '#a8b8c8', snowcap: 1 },
    winter: { sky: ['#b4cbe2', '#eef3f8'], hill: ['#f2f6fa', '#e6eef5'], grass: ['#f7fafc', '#e3ebf3'], crown: null, fruit: null, mtn: '#c9d8e6', snowcap: 2 },
  };
  const svgL = (W, Hh, z, inner, cls) => `<svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" class="${cls || ''}" style="position:absolute;left:0;top:0;width:${W}px;height:${Hh}px;z-index:${z};pointer-events:none">${inner}</svg>`;
  // ---------------------------------------------------------------- garden (1000 × 520)
  const gTree = (p) => { const x = 150, y = 338; let s = `<path d="M${x - 22} ${y} q-12 6 -22 4 q14 -6 22 -16z M${x + 22} ${y} q12 6 22 4 q-14 -6 -22 -16z" fill="#7a4c2a"/><rect x="${x - 22}" y="96" width="44" height="${y - 96}" rx="10" fill="#8a5a34"/><path d="M${x - 10} 150 q4 10 0 20 M${x + 10} 220 q-4 10 0 22 M${x - 8} 280 q4 9 0 18" stroke="#6b4224" stroke-width="3" fill="none"/>
      <path d="M166 196 Q210 186 286 172 L288 182 Q214 196 168 208z" fill="#8a5a34"/>`;
    if (!p.crown) s += `<path d="M150 100 L110 50 M150 110 L196 56 M150 96 L150 30 M116 58 L96 46 M190 62 L214 50" stroke="#7a4c2a" stroke-width="7" stroke-linecap="round"/><path d="M112 52 q10 -6 18 0 M140 30 q10 -6 20 0 M186 58 q12 -6 24 0 M240 174 q20 -8 46 -4" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    else s += `<g><circle cx="150" cy="78" r="72" fill="${p.crown[1]}"/><circle cx="86" cy="104" r="48" fill="${p.crown[2]}"/><circle cx="214" cy="104" r="50" fill="${p.crown[2]}"/><circle cx="120" cy="40" r="44" fill="${p.crown[1]}"/><circle cx="188" cy="44" r="42" fill="${p.crown[0]}"/><circle cx="128" cy="62" r="28" fill="${p.crown[0]}"/><circle cx="198" cy="84" r="22" fill="${p.crown[0]}"/></g>
      ${[[110, 120], [196, 128], [160, 52], [92, 86], [222, 96], [140, 100]].map(([a, b2]) => `<circle cx="${a}" cy="${b2}" r="${p.fruit === '#FF9EC8' ? 9 : 7}" fill="${p.fruit}"/>`).join('')}`;
    return s; };
  const gMaple = (p, x, y, sc) => { const c = p.base === 'winter' ? null : p.base === 'herbst' ? ['#E5483B', '#F08A3D', '#C2312A'] : p.base === 'fruehling' ? ['#e86a38', '#f08a52', '#d9572e'] : ['#d9572e', '#e86a38', '#c94a26'];
    return `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-5" y="-60" width="10" height="60" fill="#7a4a2a"/>${c ? `<circle cx="0" cy="-78" r="30" fill="${c[0]}"/><circle cx="-20" cy="-62" r="20" fill="${c[1]}"/><circle cx="20" cy="-64" r="20" fill="${c[2]}"/>` : '<path d="M0 -58 L-18 -86 M0 -64 L16 -92 M0 -70 L0 -100" stroke="#7a4a2a" stroke-width="4" stroke-linecap="round"/><path d="M-20 -88 q6 -4 12 0 M12 -94 q6 -4 12 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'}</g>`; };
  const gFir = (x, y, sc, snow) => `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-4" y="-14" width="8" height="14" fill="#6b4224"/><path d="M0 -90 L-26 -40 H-12 L-32 -10 H32 L12 -40 H26z" fill="#2f7a46"/>${snow ? '<path d="M0 -90 L-12 -66 L0 -70 L12 -66z M-20 -40 h40 l-6 -4 h-28z" fill="#fff"/>' : ''}</g>`;
  const gHouse = (p) => { const w = p.base === 'winter';
    return `<rect x="384" y="214" width="58" height="48" fill="#e9e4dc"/><rect x="384" y="204" width="58" height="10" fill="#9fdcff" opacity=".55"/><path d="M384 204 h58" stroke="#c9d1d9" stroke-width="2"/>
      ${w ? '<rect x="384" y="200" width="58" height="6" rx="3" fill="#fff"/>' : ''}
      <path d="M432 190 L520 128 L608 190 V262 H432Z" fill="#f6f1ea"/><path d="M428 192 L520 126 L612 192" stroke="#4f5562" stroke-width="10" fill="none" stroke-linejoin="round"/>
      ${w ? '<path d="M424 190 L520 120 L616 190 L604 192 L520 134 L436 192z" fill="#fff"/>' : ''}
      <rect x="568" y="138" width="12" height="34" fill="#8a8f99"/>${w ? '<rect x="566" y="134" width="16" height="6" rx="3" fill="#fff"/>' : ''}${p.base !== 'sommer' ? '<g class="smk" fill="#e8edf2" opacity=".85"><circle cx="574" cy="124" r="6"/><circle cx="580" cy="112" r="8"/><circle cx="574" cy="98" r="9"/></g>' : ''}
      <rect x="462" y="168" width="34" height="20" fill="#bfe6ff"/><rect x="544" y="168" width="34" height="20" fill="#bfe6ff"/>
      <rect x="446" y="216" width="146" height="5" fill="#8a6a4a"/><rect x="452" y="224" width="48" height="38" fill="#9fd4f0"/><rect x="506" y="224" width="28" height="38" fill="#7fc0e6"/><rect x="540" y="224" width="46" height="38" fill="#9fd4f0"/>
      <path d="M476 224 v38 M562 224 v38" stroke="#fff" stroke-width="2" opacity=".6"/>`; };
  const gLights = () => `<g class="wl"><path d="M892 38 a30 30 0 1 0 0 56 a24 24 0 1 1 0 -56z" fill="#FFF6D8"/>${[[120, 40], [300, 90], [420, 30], [640, 80], [760, 30], [960, 120], [200, 140], [540, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')}</g><rect class="wl" x="462" y="168" width="34" height="20" fill="#FFE59A"/><rect class="wl" x="544" y="168" width="34" height="20" fill="#FFE59A"/><rect class="wl" x="452" y="224" width="48" height="38" fill="#FFD98A"/><rect class="wl" x="540" y="224" width="46" height="38" fill="#FFD98A"/><g class="wl"><circle cx="930" cy="${404 - 86}" r="26" fill="#FFE59A" opacity=".35"/><circle cx="930" cy="${404 - 86}" r="7" fill="#FFF3C0"/></g>`;
  const gPond = (p) => { const P = G.pond; const ice = p.base === 'winter';
    return `<ellipse cx="${P.cx}" cy="${P.cy + 4}" rx="${P.rx + 16}" ry="${P.ry + 12}" fill="${ice ? '#e3ebf2' : '#8a7a5a'}" opacity=".35"/>
      ${[...Array(18)].map((_, i) => { const a = i / 18 * Math.PI * 2; return `<ellipse cx="${(P.cx + Math.cos(a) * (P.rx + 10)).toFixed(1)}" cy="${(P.cy + 3 + Math.sin(a) * (P.ry + 8)).toFixed(1)}" rx="${12 + (i % 3) * 2}" ry="7" fill="${ice ? '#e8eef4' : i % 2 ? '#b9b3a8' : '#a9a397'}"/>`; }).join('')}
      <ellipse cx="${P.cx}" cy="${P.cy}" rx="${P.rx}" ry="${P.ry}" fill="${ice ? '#d7ecf8' : `url(#gwat${p.u})`}"/>
      ${ice ? `<path d="M${P.cx - 90} ${P.cy - 10} l40 14 l30 -8 M${P.cx + 20} ${P.cy + 24} l40 -10 l26 12" stroke="#fff" stroke-width="2" fill="none"/>` : `<ellipse cx="${P.cx - 50}" cy="${P.cy - 22}" rx="60" ry="9" fill="#fff" opacity=".22"/>`}
      ${p.base === 'sommer' || p.base === 'fruehling' ? `<g fill="#5fb548"><ellipse cx="${P.cx - 110}" cy="${P.cy + 18}" rx="14" ry="5"/><ellipse cx="${P.cx + 120}" cy="${P.cy - 14}" rx="12" ry="4.5"/></g><circle cx="${P.cx - 104}" cy="${P.cy + 15}" r="3.4" fill="#FF8FC8"/>` : ''}`; };
  const gReeds = (p) => p.base === 'winter' ? '' : [[P0(0), 0], [P0(1), 1]].map(([x, i]) => `<g transform="translate(${x} ${G.pond.cy - G.pond.ry + 10})">${[-6, 0, 6, 11].map((d, j) => `<path d="M${d} 0 q${j % 2 ? 3 : -3} -18 ${j % 2 ? 1 : -1} -34" stroke="${p.base === 'herbst' ? '#b9a050' : '#5aa040'}" stroke-width="3" fill="none"/>${j % 2 ? `<ellipse cx="${d + (j % 2 ? 1 : -1)}" cy="-30" rx="2.6" ry="7" fill="#7a4a2a"/>` : ''}`).join('')}</g>`).join('');
  const P0 = (i) => [G.pond.cx + G.pond.rx - 30, G.pond.cx - G.pond.rx + 40][i];
  const gHedge = (p, x0, x1, y) => { const c = p.base === 'winter' ? ['#d9e6ef', '#c9d8e6'] : p.base === 'herbst' ? ['#9a9a40', '#b3a64a'] : ['#3f8f3a', '#4ea345']; let s = ''; for (let x = x0; x < x1; x += 26) s += `<circle cx="${x}" cy="${y - 10}" r="18" fill="${c[(x / 26 | 0) % 2]}"/>`; return s + `<rect x="${x0 - 10}" y="${y - 12}" width="${x1 - x0 + 20}" height="12" fill="${c[0]}"/>`; };
  const gBush = (p, x, y, w) => { const c = p.base === 'winter' ? ['#d6e2ec', '#e8eff5', '#fff'] : p.base === 'herbst' ? ['#a8a43e', '#c9b04a', '#E5793A'] : ['#3f9a3a', '#4caa44', '#56b34b']; return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-${w * .45}" rx="${w}" ry="${w * .55}" fill="${c[0]}"/><ellipse cx="${-w * .45}" cy="-${w * .35}" rx="${w * .6}" ry="${w * .45}" fill="${c[1]}"/><ellipse cx="${w * .5}" cy="-${w * .4}" rx="${w * .55}" ry="${w * .45}" fill="${c[2]}"/>${p.base === 'fruehling' || p.base === 'sommer' ? `<circle cx="${-w * .25}" cy="-${w * .72}" r="${w * .1}" fill="#FF8FB0"/><circle cx="${w * .35}" cy="-${w * .55}" r="${w * .09}" fill="#fff"/>` : ''}</g>`; };
  const gFlowers = (p) => { const f = G.flowers; const cols = p.base === 'herbst' ? ['#F08A3D', '#B85AD0', '#F2C230'] : ['#FF7FA6', '#FFC94D', '#B58CFF'];
    return `<rect x="270" y="456" width="150" height="24" rx="6" fill="#8a5a34"/><rect x="274" y="452" width="142" height="12" rx="5" fill="${p.base === 'winter' ? '#f4f8fc' : '#6b4224'}"/>` + (p.base === 'winter' ? '' : f.map(([x, y], i) => `<path d="M${x} ${y} V${y - 44}" stroke="#4c9a38" stroke-width="4"/><ellipse cx="${x - 8}" cy="${y - 18}" rx="9" ry="4" fill="#5fb548"/><g fill="${cols[i]}">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + Math.cos(a / 57.3) * 9).toFixed(1)}" cy="${(y - 48 + Math.sin(a / 57.3) * 9).toFixed(1)}" r="7"/>`).join('')}</g><circle cx="${x}" cy="${y - 48}" r="6" fill="#FFF3B0"/>`).join('')); };
  const gLamp = () => `<rect x="926" y="${404 - 86}" width="8" height="86" rx="3" fill="#4f5562"/><path d="M918 ${404 - 92} h24 l-4 -12 h-16z" fill="#4f5562"/><rect x="922" y="${404 - 90}" width="16" height="10" fill="#FFF3C0" opacity=".6"/>`;
  let UID = 0;
  G.draw = (sc, se0) => { const u = ++UID; const s0 = SE(se0 || sc.season); const p = { ...PAL[s0.base], base: s0.base, u }; const W = 1000, Hh = 520; const night = '';
    const base = `<defs><linearGradient id="gsky${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient><linearGradient id="ggr${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.grass[0]}"/><stop offset="1" stop-color="${p.grass[1]}"/></linearGradient><radialGradient id="gwat${u}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#9fe4ff"/><stop offset="1" stop-color="#3f9fda"/></radialGradient></defs>
      <rect width="${W}" height="${Hh}" fill="url(#gsky${u})"/><g class="dy"><circle cx="880" cy="66" r="38" fill="#FFE68A"/><circle cx="880" cy="66" r="54" fill="#FFE68A" opacity=".22"/></g>
      <g fill="#fff" opacity=".9"><ellipse cx="250" cy="70" rx="46" ry="16"/><ellipse cx="282" cy="60" rx="30" ry="18"/><ellipse cx="660" cy="44" rx="40" ry="13"/><ellipse cx="688" cy="36" rx="24" ry="14"/></g>
      <path d="M0 200 L90 120 L170 170 L280 96 L390 176 L470 140 L600 186 L700 110 L820 168 L900 124 L1000 160 V260 H0z" fill="${p.mtn}"/>
      <path d="M262 112 L280 96 L298 112 L288 108 L280 114 L272 108z M684 124 L700 110 L716 124 L706 120 L700 126 L694 120z M76 132 L90 120 L104 132z M888 134 L900 124 L912 134z" fill="#fff"${p.snowcap > 1 ? ' transform="scale(1 1)"' : ''}/>
      ${p.snowcap > 1 ? '<path d="M240 130 L280 96 L320 128 L300 124 L280 132 L262 126z M660 140 L700 110 L740 140 L720 134 L700 142 L682 136z" fill="#fff"/>' : ''}
      <path d="M0 236 Q120 196 260 228 Q380 200 520 232 Q660 196 800 226 Q900 206 1000 222 V280 H0z" fill="${p.hill[0]}"/><path d="M0 252 Q160 228 330 252 Q520 228 700 254 Q860 236 1000 250 V290 H0z" fill="${p.hill[1]}"/>
      <rect y="255" width="${W}" height="${Hh - 255}" fill="url(#ggr${u})"/>
      ${p.base === 'winter' ? '' : `<g stroke="${p.grass[1]}" stroke-width="2.4" stroke-linecap="round" opacity=".55">${[[60, 300], [240, 420], [520, 470], [880, 300], [980, 470], [140, 400], [430, 330], [620, 300], [80, 500], [820, 505]].map(([x, y]) => `<path d="M${x} ${y} l-3 -8 M${x + 4} ${y} l0 -10 M${x + 8} ${y} l3 -8"/>`).join('')}</g>`}
      <path d="M506 262 C498 310 430 360 446 420 S502 490 484 520 H556 C578 480 520 440 524 400 S566 320 534 262z" fill="${p.base === 'winter' ? '#e9eef3' : '#e8d6a8'}"/>
      ${[[516, 280], [500, 320], [474, 362], [470, 404], [492, 446], [510, 490]].map(([x, y], i) => `<ellipse cx="${x + 10}" cy="${y}" rx="${14 + i}" ry="${5 + i * .5}" fill="${p.base === 'winter' ? '#dfe7ee' : '#cbb68a'}"/>`).join('')}
      ${gPond(p)}
      <ellipse cx="${G.hill.x}" cy="${G.hill.y}" rx="58" ry="17" fill="${p.base === 'winter' ? '#eef3f8' : '#ddbb82'}"/><ellipse cx="${G.hill.x}" cy="${G.hill.y - 4}" rx="36" ry="9" fill="${p.base === 'winter' ? '#fff' : '#e9cc96'}"/>
      <ellipse cx="${G.stone.x}" cy="${G.stone.y - 6}" rx="48" ry="20" fill="#b9b3a8"/><ellipse cx="${G.stone.x - 6}" cy="${G.stone.y - 14}" rx="34" ry="9" fill="${p.base === 'winter' ? '#fff' : '#d3cec5'}"/>
      <path d="M${G.bowl.x - 22} ${G.bowl.y - 12} h44 l-6 12 h-32z" fill="#4FA3E0"/><ellipse cx="${G.bowl.x}" cy="${G.bowl.y - 12}" rx="22" ry="5" fill="#3A86C8"/><g fill="#d9a25a"><circle cx="${G.bowl.x - 8}" cy="${G.bowl.y - 14}" r="3.4"/><circle cx="${G.bowl.x}" cy="${G.bowl.y - 15}" r="3.4"/><circle cx="${G.bowl.x + 8}" cy="${G.bowl.y - 14}" r="3.4"/></g>`;
    const layers = [
      svgL(W, Hh, 0, base),
      svgL(W, Hh, 250, (p.base === 'winter' ? gFir(320, 250, .7, 1) + gFir(690, 252, .8, 1) + gFir(40, 258, .9, 1) : gMaple(p, 330, 250, .6) + gMaple(p, 700, 252, .7)) + gHedge(p, 0, 380, 262) + gHedge(p, 640, 1000, 262)),
      svgL(W, Hh, 262, gHouse(p) + (s0.se === 'weihnachten' ? [...Array(9)].map((_, i) => `<circle cx="${440 + i * 20}" cy="${200 - (i < 5 ? i * 16 : (8 - i) * 16) + 2}" r="3.4" fill="${['#FF5A5A', '#FFD34D', '#7FD3FF', '#8CE07A'][i % 4]}"/>`).join('') : '')),
      svgL(W, Hh, 300, gMaple(p, 985, 300, 1.15)),
      svgL(W, Hh, 338, gTree(p)),
      svgL(W, Hh, 340, gBush(p, 252, 340, 26) + gReeds(p)),
      svgL(W, Hh, 362, ''),
      svgL(W, Hh, 404, gLamp()),
      svgL(W, Hh, 480, gFlowers(p)),
      svgL(W, Hh, 506, gBush(p, 70, 512, 34) + gBush(p, 960, 512, 30)),
      s0.decor ? svgL(W, Hh, 600, s0.decor()) : '',
      svgL(W, Hh, 4050, gLights(), 'wl'),
    ];
    return layers.join('') + night;
  };
  G.hides = [{ x: 150, y: 330, n: 'hinter dem Apfelbaum' }, { x: 252, y: 334, n: 'hinter dem Busch' }, { x: 70, y: 506, n: 'hinter dem Busch vorne' }, { x: 960, y: 506, n: 'hinter dem Busch rechts' }, { x: 346, y: 470, n: 'im Blumenbeet' }, { x: 985, y: 294, n: 'hinter dem Ahorn' }];
  G.slots = { nest: [[70, 470], [140, 486], [40, 496], [200, 470], [110, 500]], huette: [[352, 322], [262, 316], [800, 312]], korb: [[655, 506], [570, 508], [250, 500], [720, 500]], vogelhaus: [[930, 404, 104], [985, 300, 120]],
    bau: [[892, 300], [858, 310], [926, 312]], seerose: [[690, 432], [810, 410], [760, 452], [640, 412]], ast: [[214], [244], [272]] };
  // ---------------------------------------------------------------- header (1200 × 120) – same places as the planner
  const hPal = (b) => ({ fruehling: { g: ['#86cc5c', '#71bd4c'], sky: ['#8acff7', '#e2f4ff'] }, sommer: { g: ['#79c257', '#6ab34b'], sky: ['#7fc4f2', '#d8efff'] }, herbst: { g: ['#b4b85e', '#9ea44c'], sky: ['#9fc4e2', '#f2e6d6'] }, winter: { g: ['#f4f8fc', '#e3ebf3'], sky: ['#b4cbe2', '#eef3f8'] } })[b];
  const hBush = (p, x, y, w) => gBush(p, x, y, w);
  H.pool = true;
  H.draw = (sc, se0) => { const u = ++UID; const s0 = SE(se0 || sc.season); const p = { ...PAL[s0.base], base: s0.base, ...hPal(s0.base) }; const w = s0.base === 'winter';
    const crown = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
    const apple = w ? `<g transform="translate(794 106)"><rect x="-3" y="-38" width="6" height="38" fill="#8a5a34"/><path d="M0 -36 L-12 -52 M0 -40 L12 -56 M0 -38 L0 -60" stroke="#7a4c2a" stroke-width="2.4" stroke-linecap="round"/><path d="M-14 -53 q4 -2 6 0 M10 -57 q4 -2 6 0" stroke="#fff" stroke-width="2"/></g>`
      : `<g transform="translate(794 106)"><rect x="-3" y="-38" width="6" height="38" fill="#8a5a34"/><path d="M2 -30 L26 -34" stroke="#8a5a34" stroke-width="3"/>${crown(0, -46, 18, p.crown[1])}${crown(-12, -38, 11, p.crown[0])}${crown(13, -40, 12, p.crown[0])}<circle cx="-6" cy="-48" r="2.4" fill="${p.fruit}"/><circle cx="8" cy="-38" r="2.4" fill="${p.fruit}"/><circle cx="-12" cy="-36" r="2.2" fill="${p.fruit}"/></g>`;
    const maple = w ? '' : `<g transform="translate(864 103)"><rect x="-2.5" y="-30" width="5" height="30" fill="#7a4a2a"/>${crown(0, -38, 14, s0.base === 'herbst' ? '#E5483B' : '#d9572e')}${crown(-9, -30, 9, s0.base === 'herbst' ? '#F08A3D' : '#e86a38')}${crown(9, -31, 9, '#c94a26')}</g>`;
    const firs = w ? `${gFir(864, 103, .38, 1)}${gFir(472, 100, .3, 1)}` : '';
    const bg = `<defs><linearGradient id="hsky${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient></defs>
      <rect width="1200" height="120" fill="url(#hsky${u})"/>
      <path d="M0 80 L120 46 L220 72 L330 38 L460 74 L560 52 L700 78 L820 44 L960 70 L1080 40 L1200 66 V100 H0z" fill="${p.mtn}"/><path d="M300 52 L330 38 L360 52 Z M800 54 L820 44 L842 55 Z M1060 50 L1080 40 L1100 51Z" fill="#fff"/>${w ? '<path d="M90 56 L120 46 L150 58z M520 58 L560 52 L600 60z" fill="#fff"/>' : ''}
      <path d="M0 98 C160 90 340 104 520 96 C700 89 900 104 1200 98 V120 H0Z" fill="${p.g[0]}"/><path d="M0 108 C300 104 600 112 1200 106 V120 H0Z" fill="${p.g[1]}"/>
      <g fill="#ffffff" opacity=".9"><ellipse cx="180" cy="22" rx="30" ry="9"/><ellipse cx="200" cy="17" rx="18" ry="9"/><ellipse cx="980" cy="16" rx="26" ry="8"/></g>
      <rect x="562" y="67" width="36" height="31" fill="#e9e4dc"/><rect x="562" y="62" width="36" height="5" fill="#9fdcff" opacity=".7"/>${w ? '<rect x="561" y="60" width="38" height="3" rx="1.5" fill="#fff"/>' : ''}
      <rect x="598" y="54.8" width="84" height="43.5" fill="#f6f1ea"/><path d="M596 33 L640 7 L684 33 V55 H596Z" fill="#f6f1ea"/><path d="M592 32 L640 3.5 L688 32" stroke="#5a5f6a" stroke-width="5.2" fill="none" stroke-linejoin="round"/>${w ? '<path d="M590 31 L640 1 L690 31 L686 32 L640 5.6 L594 32z" fill="#fff"/>' : ''}
      <rect x="664" y="11" width="7" height="15" fill="#8a8f99"/>${s0.base !== 'sommer' ? '<g class="smk" fill="#e8edf2" opacity=".85"><circle cx="667" cy="6" r="2.4"/><circle cx="670" cy="1" r="3"/></g>' : ''}<rect x="610" y="37" width="21" height="12" fill="#bfe6ff"/><rect x="649" y="37" width="21" height="12" fill="#bfe6ff"/>
      <rect x="605" y="82" width="28" height="16" fill="#9fd4f0"/><rect x="638" y="82" width="17" height="16" fill="#7fc0e6"/><rect x="659" y="82" width="18" height="16" fill="#9fd4f0"/><rect x="599" y="77" width="81" height="3" fill="#8a6a4a"/>
      ${s0.se === 'weihnachten' ? [...Array(9)].map((_, i) => `<circle cx="${596 + i * 11}" cy="${33 - (i < 5 ? i * 6.5 : (8 - i) * 6.5)}" r="1.6" fill="${['#FF5A5A', '#FFD34D', '#7FD3FF', '#8CE07A'][i % 4]}"/>`).join('') : ''}
      <rect x="571" y="99" width="138" height="13.5" rx="2" fill="#e8e2d6"/><rect x="577" y="101.3" width="126" height="8.2" fill="#5ec3ec"/><path d="M590 104 h20 M640 106 h24 M680 103 h12" stroke="#fff" stroke-width=".8" opacity=".7"/>
      <rect class="gcover" x="577" y="101.3" width="126" height="8.2" fill="#3f4f5c" style="opacity:${sc.poolOpen !== false ? 0 : 1};transition:opacity .8s"/><path class="gcover" d="M608.5 101.3 V109.5 M640 101.3 V109.5 M671.5 101.3 V109.5" stroke="#5a6c7a" style="opacity:${sc.poolOpen !== false ? 0 : 1};transition:opacity .8s"/>${w ? '<rect class="gcover" x="577" y="101.3" width="126" height="8.2" fill="#fff" opacity=".55"/>' : ''}
      ${s0.base === 'sommer' ? '<g><path d="M550 98 v-26" stroke="#8a5a34" stroke-width="1.6"/><path d="M530 74 Q550 60 570 74z" fill="#FF6F91"/></g>' : ''}`;
    const flow = w ? '' : `<ellipse cx="736" cy="110" rx="17" ry="3.4" fill="#8a5a34"/>${[[724, 109], [730, 111], [736, 112], [742, 110], [748, 108]].map(([x, y], i) => `<path d="M${x} ${y} v-10" stroke="#4c9a38" stroke-width="1.4"/><circle cx="${x}" cy="${y - 11}" r="2.8" fill="${(s0.base === 'herbst' ? ['#F08A3D', '#F2C230', '#B85AD0'] : ['#FF7FA6', '#FFE066', '#FFC94D', '#FF7FA6', '#B58CFF'])[i % 3]}"/>`).join('')}`;
    const lamp = '<rect x="870.6" y="78" width="2.8" height="34" fill="#4f5562"/><path d="M868 76 h8 l-1.4 -4 h-5.2z" fill="#4f5562"/>';
    const lights = '<g class="wl"><path d="M1103 11 a7 7 0 1 0 0 14 a5.6 5.6 0 1 1 0 -14z" fill="#FFF6D8"/><circle cx="300" cy="14" r=".8" fill="#fff"/><circle cx="420" cy="8" r=".8" fill="#fff"/><circle cx="900" cy="10" r=".8" fill="#fff"/></g><rect class="wl" x="610" y="37" width="21" height="12" fill="#FFE59A"/><rect class="wl" x="649" y="37" width="21" height="12" fill="#FFE59A"/><rect class="wl" x="605" y="82" width="28" height="16" fill="#FFD98A"/><rect class="wl" x="659" y="82" width="18" height="16" fill="#FFD98A"/><g class="wl"><circle cx="872" cy="74" r="7" fill="#FFE59A" opacity=".4"/><circle cx="872" cy="74" r="2" fill="#FFF3C0"/></g>';
    return [svgL(1200, 120, 0, bg), svgL(1200, 120, 106, apple + firs), svgL(1200, 120, 103, maple), svgL(1200, 120, 110, flow), svgL(1200, 120, 107, hBush(p, 455, 107, 11)), svgL(1200, 120, 109, hBush(p, 1015, 109, 13)), svgL(1200, 120, 101, hBush(p, 548, 101, 8)), svgL(1200, 120, 114, hBush(p, 985, 114, 7)), svgL(1200, 120, 112, lamp), s0.base === 'winter' && sc.season !== 'silvester' ? svgL(1200, 120, 113, `<g transform="translate(940 113) scale(.32)"><circle cx="0" cy="-16" r="18" fill="#fff"/><circle cx="0" cy="-44" r="13" fill="#fff"/><circle cx="-4" cy="-47" r="1.6" fill="#222"/><circle cx="4" cy="-47" r="1.6" fill="#222"/><path d="M0 -43 l9 2 l-9 2z" fill="#F08A24"/><path d="M-12 -34 h24" stroke="#E5483B" stroke-width="4"/></g>`) : '', svgL(1200, 120, 4050, lights, 'wl')].join('');
  };
  H.slots = { nest: [[764, 116], [744, 117], [784, 117], [728, 117]], huette: [[520, 108], [478, 111], [1040, 110]], korb: [[714, 116], [700, 117], [690, 115]], vogelhaus: [[872, 112, 36]],
    bau: [[960, 110], [940, 113], [985, 112]], seerose: [[640, 105.6], [608, 106], [672, 105.4]], ast: [[804], [812], [820]] };
  // ---------------------------------------------------------------- sleeping places (width in garden px, svg anchored at the bottom centre, z offset)
  const BED_SVG = {
    nest: [76, '<svg viewBox="-38 -22 76 24"><ellipse cx="0" cy="-8" rx="36" ry="12" fill="#c99a52"/><ellipse cx="0" cy="-11" rx="28" ry="7" fill="#e8c87e"/><path d="M-34 -8 q10 -6 20 0 M-18 -3 q14 -6 28 0 M8 -9 q12 -5 24 1 M-30 -12 q8 -3 16 0" stroke="#a6782e" stroke-width="2" fill="none"/></svg>', -1],
    huette: [84, '<svg viewBox="-42 -82 84 84"><rect x="-34" y="-48" width="68" height="48" rx="3" fill="#C98A52"/><path d="M-42 -44 L0 -78 L42 -44z" fill="#8a4f2a"/><path d="M-42 -44 L0 -78 L42 -44" stroke="#6b3a1e" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M-15 0 v-24 a15 15 0 0 1 30 0 v24z" fill="#3a2414"/><path d="M-30 -36 h16 M14 -36 h16 M-30 -22 h12 M18 -22 h12" stroke="#b47a44" stroke-width="2"/><rect x="-10" y="-62" width="20" height="9" rx="2" fill="#fff"/><path d="M-5 -58 h10" stroke="#8a4f2a" stroke-width="2"/></svg>', 2],
    korb: [66, '<svg viewBox="-33 -26 66 28"><ellipse cx="0" cy="-10" rx="31" ry="12" fill="#b9874e"/><ellipse cx="0" cy="-14" rx="26" ry="7.5" fill="#FF8FB0"/><ellipse cx="-8" cy="-15" rx="8" ry="3" fill="#FFB3CC"/><path d="M-31 -10 Q0 8 31 -10" stroke="#8a5e30" stroke-width="3" fill="none"/><path d="M-26 -4 l4 -8 M-14 0 l3 -9 M0 1 v-10 M14 0 l-3 -9 M26 -4 l-4 -8" stroke="#8a5e30" stroke-width="1.6"/></svg>', -1],
    vogelhaus: [34, '<svg viewBox="-17 -34 34 36"><rect x="-2" y="-8" width="4" height="10" fill="#4f5562"/><rect x="-12" y="-26" width="24" height="20" rx="2" fill="#E9C27A"/><path d="M-16 -24 L0 -36 L16 -24z" fill="#C4553A"/><circle cx="0" cy="-17" r="4.4" fill="#3a2414"/><rect x="-6" y="-11" width="12" height="2" fill="#8a5a34"/></svg>', -1],
    bau: [64, '<svg viewBox="-32 -18 64 20"><ellipse cx="0" cy="-6" rx="30" ry="10" fill="#c9a26a"/><ellipse cx="2" cy="-7" rx="13" ry="6.5" fill="#4a2e18"/><ellipse cx="2" cy="-8.5" rx="10" ry="4" fill="#2a1a0e"/><circle cx="-22" cy="-6" r="3" fill="#b88e58"/><circle cx="22" cy="-4" r="2.4" fill="#b88e58"/></svg>', -1],
    seerose: [62, '<svg viewBox="-31 -10 62 12"><path d="M0 -2 m-28 0 a28 8 0 1 0 56 0 a28 8 0 1 0 -56 0z M0 -2 L18 -8 L22 -2z" fill="#4fa83f" fill-rule="evenodd"/><path d="M-28 -2 a28 8 0 0 0 56 0" fill="#3f9535"/><g transform="translate(-12 -6)"><path d="M0 0 l-4 -6 l4 2 l4 -2z" fill="#FF8FC8"/></g></svg>', -1],
  };
  H.bedSvg = { seerose: [64, '<svg viewBox="-32 -12 64 14"><ellipse cx="0" cy="-4" rx="30" ry="8" fill="#FF6F91"/><ellipse cx="0" cy="-5" rx="17" ry="4" fill="#5ec3ec"/><path d="M-22 -9 l6 9 M22 -9 l-6 9 M-4 -12 v8 M8 -12 v8" stroke="#fff" stroke-width="4"/></svg>', -1] };
  window.FPWORLD = { BED_SVG, PAL, parts: { gTree, gMaple, gFir, gHedge, gBush, gFlowers, gLamp, svgL, SE } };
})();

/* Family Planer – development tree per pet (design draft, round 9).
   Egg -> Baby -> Young (the child picks a colour) -> Adult (the child picks a look). 3 x 3 = 9 different adults per animal. */
(() => {
  // colour of the young animal: name + palette override (first one is always the natural colour)
  const COL = {
    fuchs: [['Rotfuchs', {}], ['Silberfuchs', { c: '#8E96A3', tipC: '#fff' }], ['Polarfuchs', { c: '#F2F4F6', b: '#fff', earIn: '#9AA3AD', legC: '#C9D1DA', armC: '#C9D1DA' }]],
    katze: [['Grau getigert', {}], ['Rot getigert', { c: '#F0A35E', b: '#FFF1DE' }], ['Schwarz', { c: '#3A3D45', b: '#5A5E68' }]],
    hund: [['Braun', {}], ['Golden', { c: '#E9C27A', b: '#FFF1D6', earC: '#C99A50' }], ['Schwarz', { c: '#3B3B40', b: '#ECECEC', earC: '#26262A' }]],
    hase: [['Hellbraun', {}], ['Schneeweiss', { c: '#F7F7F5', footC: '#fff' }], ['Schoko', { c: '#8A6448', b: '#E9D3BE' }]],
    igel: [['Natur', {}], ['Hell', { spikes: '#D9C7AE', c: '#FFF4EA' }], ['Nacht', { spikes: '#4A4F63' }]],
    waschbaer: [['Grau', {}], ['Rötlich', { c: '#B98A6A', earC: '#8A5E40' }], ['Silber', { c: '#C9CED6', earC: '#9AA3AD' }]],
    panda: [['Klassisch', {}], ['Roter Panda', { c: '#E07A3F', earC: '#7A2E12', armC: '#3A1E10', legC: '#3A1E10' }], ['Braun', { earC: '#6A4A32', armC: '#6A4A32', legC: '#6A4A32' }]],
    erdmann: [['Natur', {}], ['Hell', { c: '#EAD7B5' }], ['Dunkel', { c: '#A88A64', earC: '#3A2E22' }]],
    eichhorn: [['Rot', {}], ['Grau', { c: '#8E96A3', b: '#F2F4F6' }], ['Schwarz', { c: '#3A3530', b: '#8A7A6A' }]],
    hamster: [['Gold', {}], ['Weiss', { c: '#F7F4EE', earC: '#E8D8C8', cheeks: '#FFE3E8' }], ['Grau', { c: '#A7ADB5', earC: '#8A9099' }]],
    maus: [['Grau', {}], ['Weiss', { c: '#F7F5F2' }], ['Braun', { c: '#9A7454' }]],
    einhorn: [['Regenbogen', {}], ['Pastell', { maneC: ['#FFD6E8', '#D6F0FF', '#E8D6FF'] }], ['Gold', { c: '#FFF4D6', maneC: ['#F7C948', '#FFE08A', '#FFFFFF'] }]],
    otter: [['Braun', {}], ['Hell', { c: '#B98A5E', armC: '#9A6A40' }], ['Schoko', { c: '#5A3A24', armC: '#46301E' }]],
    frosch: [['Grün', {}], ['Blau', { c: '#3A86C8', b: '#BFE0FF' }], ['Rot', { c: '#E5483B', b: '#FFD0C8' }]],
    axolotl: [['Rosa', {}], ['Wild', { c: '#7E8A62', b: '#C2CCA4', gills: '#4A5A3A' }], ['Gold', { c: '#F7C948', b: '#FFF0B8', gills: '#E09A20' }]],
    eidechse: [['Grün', {}], ['Blau', { c: '#4A90D9', b: '#CDE6FF', spots: '#2A5A9A' }], ['Gelb', { c: '#E8C23A', b: '#FFF2B8', spots: '#A07A10' }]],
    chamae: [['Grün', {}], ['Türkis', { c: '#2FB5B5', b: '#C0F0F0', stripesV: '#7FE0E0' }], ['Orange', { c: '#F08A3D', b: '#FFE0C0', stripesV: '#FFC08A' }]],
    drache: [['Grün', {}], ['Rot', { c: '#D9483B', b: '#F7D08A', wings: '#F08A6A' }], ['Blau', { c: '#3A86C8', b: '#CDE6FF', wings: '#7FB8F0' }]],
    eule: [['Waldkauz', {}], ['Schneeeule', { c: '#F4F4F2', b: '#fff', wingC: '#D6DADF' }], ['Grau', { c: '#8E96A3', wingC: '#6E7480' }]],
    pinguin: [['Kaiser', {}], ['Zwergpinguin', { c: '#4A6E9A' }], ['Felsen', { c: '#262626' }]],
    papagei: [['Rot', {}], ['Blau-gelb', { c: '#3E8EDE', b: '#F7C948', wingC: '#2A6AB0' }], ['Grün', { c: '#3CC48A', b: '#F7D44A', wingC: '#E5483B' }]],
    biene: [['Honig', {}], ['Orange', { c: '#F59A3B' }], ['Pastell', { c: '#FFE08A' }]],
    reh: [['Natur', {}], ['Hell', { c: '#D9A878' }], ['Weisses Reh', { c: '#F4EFE8', legC: '#E0D6CA' }]],
    pony: [['Braun', {}], ['Schimmel', { c: '#E9E6E1', muzC: '#D6D0C8', maneC: ['#C9C2B8', '#FFFFFF'] }], ['Rappe', { c: '#3A3530', muzC: '#5A524A', maneC: ['#1E1A16', '#3A3530'] }]],
    koala: [['Grau', {}], ['Hell', { c: '#C9CED6' }], ['Braun', { c: '#A8927E' }]],
    faultier: [['Natur', {}], ['Hell', { c: '#C9AE8E' }], ['Moos', { c: '#8E9A6A' }]],
    robbe: [['Grau', {}], ['Hell', { c: '#B9C3CC', b: '#E1E6EA' }], ['Dunkel', { c: '#5A6470' }]],
    biber: [['Braun', {}], ['Hell', { c: '#B07A48' }], ['Dunkel', { c: '#5A3A24' }]],
    fledermaus: [['Lila', {}], ['Braun', { c: '#7A5A44', b: '#9A7A64' }], ['Silber', { c: '#9AA3AD', b: '#C9CED6' }]],
    kolibri: [['Grün', {}], ['Blau', { c: '#3A86C8' }], ['Lila', { c: '#9A6ADF' }]],
    tiger: [['Orange', {}], ['Weisser Tiger', { c: '#F4F1EC' }], ['Gold', { c: '#F7C948' }]],
    pegasus: [['Weiss', {}], ['Nacht', { c: '#3A4060', muzC: '#4A5070', wings: '#5A6090', maneC: ['#B9A2FF', '#7FD3FF', '#FFFFFF'] }], ['Rosé', { c: '#FFE6F0', wings: '#FFD0E3' }]],
    phoenix: [['Feuer', {}], ['Eis', { c: '#3A86C8', b: '#9FD0FF', wingC: '#7FB8F0', wings: '#9FD0FF' }], ['Gold', { c: '#E8B53A', b: '#FFE08A', wingC: '#F7C948', wings: '#FFE08A' }]],
    greif: [['Gold', {}], ['Schnee', { bodyC: '#E9E6E1', wings: '#C9C2B8', wingC: '#C9C2B8' }], ['Dunkel', { bodyC: '#8A6A48', wings: '#5A4632', wingC: '#5A4632' }]],
    kitsune: [['Weiss', {}], ['Feuer', { c: '#F08A3D' }], ['Nacht', { c: '#3A3F5C', earIn: '#7FD3FF' }]],
    yeti: [['Schnee', {}], ['Eisblau', { c: '#CDE6FF', armC: '#BFD8F5', legC: '#BFD8F5' }], ['Bigfoot', { c: '#8A6A48', b: '#B99A7A', armC: '#7A5A3E', legC: '#7A5A3E' }]],
    nessie: [['Grün', {}], ['Blau', { c: '#3A86C8', b: '#BFE0FF', spots: '#2A5A9A' }], ['Lila', { c: '#9A6ADF', b: '#E6D6FF', spots: '#6A3AAF' }]],
    wolpi: [['Natur', {}], ['Weiss', { c: '#F2EEE8', earC: '#F2EEE8' }], ['Dunkel', { c: '#6A5038', earC: '#6A5038' }]],
  };
  // ---------------------------------------------------------------- round 11: varied, uneven trees with wild end forms
  // shape: A = small (one choice at the end), B = colour when young, each colour leads to 1–3 end forms (uneven),
  // C = colour already as a baby, uneven branches, D = rich (Fabelwesen, dragon, unicorn)
  const SHAPE = {};
  ['biene', 'kaefer', 'falter', 'kolibri', 'maus', 'hamster'].forEach((k) => { SHAPE[k] = 'A'; });
  ['igel', 'erdmann', 'frosch', 'axolotl', 'eidechse', 'chamae', 'pinguin', 'ente', 'koala', 'faultier', 'robbe', 'biber', 'flamingo', 'fledermaus', 'reh'].forEach((k) => { SHAPE[k] = 'B'; });
  ['fuchs', 'katze', 'hund', 'hase', 'waschbaer', 'panda', 'eichhorn', 'otter', 'eule', 'papagei', 'pony', 'tiger'].forEach((k) => { SHAPE[k] = 'C'; });
  ['einhorn', 'drache', 'pegasus', 'phoenix', 'greif', 'kitsune', 'yeti', 'nessie', 'wolpi'].forEach((k) => { SHAPE[k] = 'D'; });
  const SHAPE_TXT = { A: 'klein – erst am Ende wird gewählt', B: 'Farbe als Jungtier, jede Farbe führt zu anderen Endformen', C: 'schon das Baby wählt, die Äste sind verschieden lang', D: 'reich – viele Wege, Schein und Spezialfarben' };
  const FABEL = ['pegasus', 'phoenix', 'greif', 'kitsune', 'yeti', 'nessie', 'wolpi'];
  const THEME = {
    wasser: { skins: ['kristall', 'opal', 'smaragd', 'silber'], pats: ['tupfen', 'sternchen'], auras: ['blau', 'sterne'], extra: [['back', 'feenfluegel'], ['under', 'mondsichel']] },
    feuer: { skins: ['feuer', 'lava', 'gold'], pats: ['zebra', 'leopard'], auras: ['flammen', 'funken'], extra: [['under', 'blitz']] },
    nacht: { skins: ['galaxie', 'schatten', 'neon'], pats: ['sternchen', 'zebra'], auras: ['sterne', 'regenbogen'], extra: [['under', 'mondsichel'], ['under', 'augenfleck'], ['back', 'feenfluegel']] },
    wald: { skins: ['smaragd', 'gold', 'rosegold'], pats: ['tarn', 'leopard', 'tupfen'], auras: ['gold', 'funken'], extra: [['deco', 'geweih'], ['back', 'maehne'], ['under', 'augenfleck']] },
    suess: { skins: ['rosegold', 'opal', 'regenbogen'], pats: ['herzchen', 'tupfen', 'kariert'], auras: ['herzen', 'rosa'], extra: [['back', 'feenfluegel'], ['back', 'fluegelchen'], ['under', 'herzfleck']] },
    himmel: { skins: ['regenbogen', 'silber', 'opal', 'gold'], pats: ['sternchen', 'tupfen'], auras: ['regenbogen', 'sterne'], extra: [['back', 'feenfluegel'], ['deco', 'einhornhorn'], ['under', 'mondsichel']] },
  };
  const TH = { fuchs: 'feuer', katze: 'nacht', hund: 'wald', hase: 'suess', igel: 'wald', waschbaer: 'nacht', panda: 'suess', erdmann: 'wald', eichhorn: 'wald', hamster: 'suess', maus: 'suess', einhorn: 'himmel', otter: 'wasser', frosch: 'wasser', axolotl: 'wasser', eidechse: 'feuer', chamae: 'wald', drache: 'feuer', eule: 'nacht', pinguin: 'wasser', ente: 'wasser', papagei: 'himmel', biene: 'suess', kaefer: 'suess', falter: 'himmel', reh: 'wald', pony: 'himmel', koala: 'suess', faultier: 'wald', robbe: 'wasser', biber: 'wasser', flamingo: 'suess', fledermaus: 'nacht', kolibri: 'himmel', tiger: 'feuer', pegasus: 'himmel', phoenix: 'feuer', greif: 'wald', kitsune: 'nacht', yeti: 'wasser', nessie: 'wasser', wolpi: 'wald' };
  const MPOOL = { wasser: ['flossen', 'rueckenzacken', 'langschwanz', 'elfenohren'], feuer: ['glutmaehne', 'flammenschwanz', 'stachelfrisur', 'sonnenkranz'], nacht: ['mondhalo', 'sternschweif', 'dreischwanz', 'elfenohren'], wald: ['blattmaehne', 'pilzhut', 'grossgeweih', 'lockenpracht', 'langschwanz'], suess: ['zuckerhorn', 'riesenbluete', 'lockenpracht', 'dreischwanz'], himmel: ['wolkenschweif', 'sonnenkranz', 'kristallhorn', 'megamaehne'] };
  // wings: only a few animals get them, only as legend, and then they can really fly (Schwebeflug)
  const WINGS = { pony: 'engelsfluegel', einhorn: 'engelsfluegel', katze: 'engelsfluegel', tiger: 'drachenfluegel', reh: 'schmetterlingsfluegel', kitsune: 'feuerfluegel' };
  const ABP = { wasser: ['blasen', 'kristall', 'schnee', 'regenbogen'], feuer: ['feuer', 'blitz', 'funken'], nacht: ['sterne', 'blitz', 'glitzer'], wald: ['bluemchen', 'pilze', 'blaetter', 'falter'], suess: ['herzchen', 'bluemchen', 'falter', 'regenbogen'], himmel: ['regenbogen', 'wolke', 'noten', 'sterne'] };
  const REQ = { ei: 'Start', baby: 'ab 30 Wachstum', jung: 'ab 150 Wachstum – Farbe wählen', gross: 'ab 450 Wachstum', merkmal: 'ab 450 Wachstum – wird gross', farbe: 'ab 450 Wachstum + 1 Entwicklungs-Pille', schein: 'ab 1150 Wachstum', form: 'ab 800 Wachstum – neue Form', legende: 'ab 1750 Wachstum + 1 Entwicklungs-Pille' };
  // ---------------------------------------------------------------- round 15: every colour opens a theme line that grows step by step
  // Gross (450 Wachstum earned): one body feature · Endform (800): a new shape · Legende (1750 + Entwicklungs-Pille): special colour, glow, 2nd shape and an ability
  // no patterns, no dots – only shapes, colours, glow and marks
  THEME.schnee = { skins: ['silber', 'kristall', 'opal'], auras: ['blau', 'sterne'], extra: [['under', 'mondsichel'], ['back', 'feenfluegel']] };
  MPOOL.schnee = ['eiskragen', 'rueckenzacken', 'kristallhorn', 'megamaehne'];
  ABP.schnee = ['schnee', 'kristall', 'sterne'];
  const WORD = { feuer: ['Glut', 'Flammen', 'Lava'], wasser: ['Tau', 'Wellen', 'Ozean'], nacht: ['Mond', 'Schatten', 'Galaxie'], wald: ['Moos', 'Wald', 'Urwald'], suess: ['Zucker', 'Feen', 'Zauber'], himmel: ['Wolken', 'Sternen', 'Himmels'], schnee: ['Frost', 'Eis', 'Polar'] };
  const THEME_TXT = { feuer: 'Feuer-Linie', wasser: 'Wasser-Linie', nacht: 'Nacht-Linie', wald: 'Wald-Linie', suess: 'Zauber-Linie', himmel: 'Himmels-Linie', schnee: 'Frost-Linie' };
  const LSKIN = { feuer: 'lava', wasser: 'kristall', nacht: 'galaxie', wald: 'smaragd', suess: 'rosegold', himmel: 'regenbogen', schnee: 'silber' };
  const LAURA = { feuer: 'flammen', wasser: 'blau', nacht: 'sterne', wald: 'gold', suess: 'herzen', himmel: 'regenbogen', schnee: 'blau' };
  const LMARK = { feuer: 'blitz', wasser: 'mondsichel', nacht: 'mondsichel', wald: null, suess: 'herzfleck', himmel: null, schnee: 'mondsichel' };
  const strongTh = (name) => /polar|schnee|weiss|silber|eis|schimmel|pastell|schwarz|nacht|schatten|dunkel|rappe|lila|rot|feuer|orange|gold|lava|rötlich|honig|blau|türkis|wild|rosa|rosé|pink/.test((name || '').toLowerCase());
  const themeOf = (k, name, i) => { const n = (name || '').toLowerCase();
    if (/silber|gold/.test(n)) return 'himmel';
    if (/polar|schnee|weiss|eis|schimmel|pastell/.test(n)) return 'schnee';
    if (/schwarz|nacht|schatten|dunkel|rappe|lila/.test(n)) return 'nacht';
    if (/rot|feuer|orange|lava|rötlich|honig/.test(n)) return 'feuer';
    if (/blau|türkis|wild/.test(n)) return 'wasser';
    if (/rosa|rosé|pink/.test(n)) return 'suess';
    if (/grün|moos|braun|natur|hell/.test(n) && i > 0) return 'wald';
    const order = [TH[k] || 'wald', 'nacht', 'schnee', 'feuer', 'suess', 'himmel', 'wasser', 'wald']; return order[i % order.length]; };
  const TRAITS = ['fell_tolle', 'fell_locke', 'fell_irokese', 'backen', 'stern', 'socken', 'glitzer'];
  const MARKS = ['blitz', 'herzfleck', 'mondsichel', 'augenfleck', 'halbgesicht'];
  const rng = (k) => { let x = [...k].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 11) + 1; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; };
  const tree = (k) => {
    const P4 = window.P4; const r = rng(k); const nm = (P4.LIST.find((q) => q[0] === k) || [])[1] || k; const sh = SHAPE[k] || 'B'; const bird = !!P4.BY[k][2].bird;
    const cols = (COL[k] || [['Natur', {}]]); const NAMES = new Set(); const usedTh = new Set();
    const TH_ORDER = ['feuer', 'nacht', 'schnee', 'wald', 'suess', 'himmel', 'wasser'];
    const pre = {}; cols.forEach(([cn], i) => { if (strongTh(cn) && !Object.values(pre).includes(themeOf(k, cn, i))) pre[i] = themeOf(k, cn, i); }); Object.values(pre).forEach((t) => usedTh.add(t));
    const uthI = (i, th) => (pre[i] ? pre[i] : uth(th));
    const uth = (th) => { if (!usedTh.has(th)) { usedTh.add(th); return th; } const o = TH_ORDER.filter((t) => !usedTh.has(t)); const t2 = o[Math.floor(r() * o.length)] || th; usedTh.add(t2); return t2; };
    const n = (st, kind, look, name, kids) => { let nn = name; let i = 2; while (NAMES.has(nn)) nn = `${name} ${['', '', 'II', 'III', 'IV'][i++] || i}`; NAMES.add(nn); return { st, kind, ...look, name: nn, kids: kids || [] }; };
    const usedT = new Set(); const pick = (arr) => { const f = arr.filter((v) => !usedT.has(v)); const src = f.length ? f : arr; const v = src[Math.floor(r() * src.length)]; usedT.add(v); return v; };
    const pool = (th) => [...new Set([...(bird ? ['tukan', 'haken', 'kakadu', 'faecher'] : []), ...MPOOL[th]])].filter((m) => !(bird && ['megamaehne', 'elfenohren', 'lockenpracht', 'glutmaehne', 'blattmaehne', 'pilzhut'].includes(m))); let wingUsed = false;
    // one line: Gross (feature) -> Endform (shape) -> Legende (colour, glow, 2nd shape, ability). depth = 1..3
    const line = (th, base, depth, wide) => {
      const W = WORD[th]; const tr = pick(TRAITS); const mk = r() < .5 ? pick(MARKS.filter((m) => m !== 'augenfleck' || th === 'nacht')) : null;
      const g = { ...base, deco: [...(base.deco || []), tr], under: mk ? [mk] : [] };
      const m1 = pick(pool(th)); const f = { ...g, morph: [m1] };
      let m2 = pick(pool(th).filter((m) => m !== m1)); if (WINGS[k] && !wingUsed && depth >= 3) { m2 = WINGS[k]; wingUsed = true; } const leg = { ...f, morph: [m1, m2], skin: LSKIN[th], aura: LAURA[th], ability: pick(ABP[th]), under: LMARK[th] ? [...new Set([...(g.under || []), LMARK[th]])] : g.under };
      const kids2 = []; if (depth >= 2) { const fNode = n('gross', 'form', f, `${W[1]}-${nm}`); if (depth >= 3) fNode.kids.push(n('gross', 'legende', leg, `${W[2]}-${nm}`)); else if (r() < .5) fNode.kids.push(n('gross', 'schein', { ...f, aura: LAURA[th] }, `Leucht-${W[1]}-${nm}`)); kids2.push(fNode); }
      const gNode = n('gross', 'merkmal', g, `${W[0]}-${nm}`, kids2);
      const out = [gNode];
      if (wide) { const sk = pick(THEME[th].skins); out.push(n('gross', 'farbe', { ...base, skin: sk, deco: [...(base.deco || []), pick(TRAITS)] }, `${P4.SKIN[sk][0]}${bird ? 'feder' : P4.BY[k][2].reptile || P4.BY[k][2].frog || P4.BY[k][2].insect ? 'haut' : 'fell'}-${nm}`)); }
      return out;
    };
    const ei = (kids) => n('ei', 'ei', {}, 'Ei', kids);
    if (sh === 'A') { const c = cols[0]; const th = uth(themeOf(k, c[0], 0)); const th2 = uth(themeOf(k, 'x', 2));
      return ei([n('baby', 'baby', {}, 'Baby', [n('jung', 'jung', { pal: c[1] }, 'Jung', [...line(th, { pal: c[1] }, 1, true), ...line(th2, { pal: c[1] }, 2, false)])])]); }
    if (sh === 'B') { const depths = [3, 2, 1].sort(() => r() - .5);
      return ei([n('baby', 'baby', {}, 'Baby', cols.map(([cn, p], i) => { const th = uthI(i, themeOf(k, cn, i)); return n('jung', 'jung', { pal: p, theme: th }, `${cn}`, line(th, { pal: p }, depths[i % 3], i === 0 && r() < .5)); }))]); }
    if (sh === 'C') { const depths = [3, 3, 2].sort(() => r() - .5);
      return ei([n('baby', 'baby', {}, 'Baby', cols.map(([cn, p], i) => { const th = uthI(i, themeOf(k, cn, i)); return n('jung', 'jung', { pal: p, theme: th }, `${cn}`, line(th, { pal: p }, depths[i % 3], i === 1)); }))]); }
    // D: the baby already picks its colour, the young one a feature, every line reaches a legend
    return ei(cols.map(([cn, p], i) => { const th = uthI(i, themeOf(k, cn, i)); const th2 = i < 2 ? uth(themeOf(k, 'x', i + 3)) : th; const t1 = pick(TRAITS), t2 = pick(TRAITS);
      return n('baby', 'baby', { pal: p, theme: th }, cn, [n('jung', 'jung', { pal: p, deco: [t1] }, `${cn} · ${P4.TRAIT_TXT[t1]}`, line(th, { pal: p, deco: [t1] }, 3, false)), ...(i < 2 ? [n('jung', 'jung', { pal: p, deco: [t2] }, `${cn} · ${P4.TRAIT_TXT[t2]}`, line(th2, { pal: p, deco: [t2] }, 3, false))] : [])]); }));
  };
  const feat = (nd) => { const P4 = window.P4; const f = [nd.skin && 'Spezialfarbe ' + P4.SKIN[nd.skin][0], nd.aura && P4.AURA_TXT[nd.aura], ...(nd.morph || []).map((m) => P4.MORPH_TXT[m]), ...(nd.under || []).map((u) => P4.UNDER_TXT[u]), ...(nd.back || []).map((b) => P4.BACK_TXT[b]), ...(nd.deco || []).map((d) => P4.TRAIT_TXT[d] || ({ hoernchen: 'Hörnchen', geweih: 'Geweih', einhornhorn: 'Horn' })[d])].filter(Boolean); if (nd.ability && window.FPMOTION && window.FPMOTION.ABIL[nd.ability]) f.unshift('⚡ Fähigkeit: ' + window.FPMOTION.ABIL[nd.ability].n); const fu = [...new Set(f)]; return fu.length ? `<span class="chips2">${fu.map((x) => `<i>${x}</i>`).join('')}</span>` : ''; };
  const look = (nd) => ({ pal: nd.pal, deco: nd.deco, under: nd.under, back: nd.back, skin: nd.skin, aura: nd.aura, morph: nd.morph, ability: nd.ability });
  const endForms = (k) => { const out = []; const walk = (nd) => { if (!nd.kids.length) out.push(nd); nd.kids.forEach(walk); }; walk(tree(k)); return out; };
  const leaves = (t) => t.kids.length ? t.kids.reduce((a, c) => a + leaves(c), 0) : 1;
  // compact left-to-right drawing: columns Ei | Baby | Jung | Gross, curved lines, the chosen path is highlighted
  const BADGE = { merkmal: ['⭐', 'gross'], farbe: ['💊', 'Spezialfarbe'], schein: ['✨', 'Schein'], form: ['🪽', 'neue Form'], legende: ['👑', 'Legende'] };
  const COLS = ['Ei', 'Baby', 'Jung', 'Gross', 'Endform', 'Legende'];
  // short labels: a column is only ~72 px wide, "Wachstum" under every column did not fit
  const COLREQ = ['', 'ab 30', 'ab 150', 'ab 450', 'ab 800', 'ab 1750'];
  const render = (host, k, opt) => {
    const P4 = window.P4; const o = opt || {}; const NS = o.size || 44, GAP = o.gap || 6, CW = o.colW || 78; const t = tree(k);
    const L = leaves(t); const H = L * (NS + GAP); const nodes = []; const edges = []; let li = 0; let maxCol = 0;
    const lay = (nd, col, path) => { maxCol = Math.max(maxCol, col); let y; if (!nd.kids.length) { y = li * (NS + GAP) + NS / 2; li += 1; } else { const ys = nd.kids.map((c, i) => lay(c, col + 1, path.concat(i))); y = (ys[0] + ys[ys.length - 1]) / 2; nd.kids.forEach((c, i) => edges.push([col, y, col + 1, ys[i], path.concat(i), c.kind])); } nodes.push({ nd, col, y, path }); return y; };
    lay(t, 0, []);
    let sel = o.sel || (() => { const p = []; let c = t; while (c.kids.length) { p.push(c.kids.length - 1); c = c.kids[c.kids.length - 1]; } return p; })();
    const onPath = (p) => p.length <= sel.length && p.every((v, i) => sel[i] === v);
    const x = (col) => col * CW + NS / 2; const head = o.small ? 0 : 36;
    // fog: everything after column o.fog is a secret silhouette (the Weitblick-Kristall lifts it for 1 hour)
    const hid = (col) => o.fog != null && col > o.fog; const SIL = 'style="display:block;width:100%;height:100%;filter:brightness(0);opacity:.5"';
    const draw = () => {
      let leaf = t; sel.forEach((i) => { leaf = leaf.kids[i]; });
      const W = maxCol * CW + NS; const ecol = { form: '#B58CFF', legende: '#FFD34D', schein: '#7FE3FF', farbe: '#F5C542' };
      host.innerHTML = `<div class="tx"><div class="tg" style="width:${W}px;height:${H + head}px">${o.small ? '' : COLS.slice(0, maxCol + 1).map((c, i) => `<div class="th" style="left:${x(i) - CW / 2}px;width:${CW}px"><b>${c}</b><small>${COLREQ[i]}</small></div>`).join('')}
        <svg width="${W}" height="${H}" class="tl" style="top:${head}px">${edges.map(([c0, y0, c1, y1, p, kd]) => `<path d="M${x(c0) + NS / 2 - 2} ${y0} C${x(c0) + CW / 2 + 6} ${y0} ${x(c1) - CW / 2 - 6} ${y1} ${x(c1) - NS / 2 + 2} ${y1}" fill="none" stroke="${onPath(p) ? '#69C350' : ecol[kd] ? ecol[kd] + '55' : '#39414f'}" stroke-width="${onPath(p) ? 2.6 : 1.6}" ${kd === 'form' || kd === 'legende' ? 'stroke-dasharray="4 3"' : ''}/>`).join('')}</svg>
        ${nodes.map(({ nd, col, y, path }) => `<button class="tn k-${hid(col) ? 'fog' : nd.kind} ${onPath(path) ? 'on' : ''}" data-p="${path.join('.')}" style="left:${x(col) - NS / 2}px;top:${y - NS / 2 + head}px;width:${NS}px;height:${NS}px" title="${hid(col) ? '??? – noch geheim' : nd.name + ' – ' + (REQ[nd.kind] || '')}">${nd.st === 'ei' ? P4.egg(k) : `<span ${hid(col) ? SIL : 'style="display:block;width:100%;height:100%"'}>${P4.svg(k, nd.st, 'froh', { noShadow: 1, ...(hid(col) ? {} : look(nd)), aura: !hid(col) && (nd.kind === 'schein' || nd.kind === 'legende') ? nd.aura : undefined })}</span>`}${BADGE[nd.kind] && !o.small && !hid(col) ? `<span class="bdg">${BADGE[nd.kind][0]}</span>` : ''}</button>`).join('')}</div>
        ${!o.small && o.fog != null && sel.length > o.fog ? `<div class="tf"><span ${SIL}>${P4.svg(k, 'gross', 'froh', { noShadow: 1 })}</span><small><b>??? – noch geheim</b><span class="rq">Mit dem <b>Weitblick-Kristall</b> siehst du 1 Stunde lang den ganzen Baum.</span></small></div>` : o.small ? `<div class="tf">${P4.svg(k, 'gross', 'freut', { noShadow: 1, ...look(leaf) })}</div>` : `<div class="tf">${P4.svg(k, 'gross', 'freut', { noShadow: 1, ...look(leaf) })}<small><b>${leaf.name}</b>${BADGE[leaf.kind] ? `<span class="kb k-${leaf.kind}">${BADGE[leaf.kind][0]} ${BADGE[leaf.kind][1]}</span>` : ''}${feat(leaf)}<span class="rq">So bekommt man es: <b>${REQ[leaf.kind] || ''}</b></span></small></div>`}</div>`;
      host.querySelectorAll('.tn').forEach((b) => b.addEventListener('click', () => { const p = b.dataset.p ? b.dataset.p.split('.').map(Number) : []; let c = t; p.forEach((i) => { c = c.kids[i]; }); while (c.kids.length) { p.push(0); c = c.kids[0]; } sel = p; draw(); }));
    };
    draw();
  };
  window.FPTREE = { THEME_TXT, WORD, REQ, BADGE, feat, tree, render, leaves, look, endForms, COL, SHAPE, SHAPE_TXT, FABEL, THEME, TH };
})();

/* Family Planer – item icons (approved in round 3: food, drinks, pills, fun things). */
(() => {
  let gid = 0;
  const ICO = {
    apfel: '<circle cx="12" cy="13.5" r="8" fill="#E5483B"/><path d="M12 5.5v3" stroke="#5a3a1c" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="15" cy="5.6" rx="3" ry="1.5" fill="#5FB043"/><ellipse cx="9" cy="10.5" rx="2" ry="1.4" fill="#fff" opacity=".35"/>',
    beeren: '<circle cx="9" cy="14" r="4" fill="#5B5FD6"/><circle cx="15" cy="15" r="4" fill="#6A6FE8"/><circle cx="12" cy="9" r="4" fill="#4A4EC4"/><path d="M12 5l2-3" stroke="#5FB043" stroke-width="1.4"/>',
    fisch: '<path d="M3 12c4-6 11-6 15 0-4 6-11 6-15 0z" fill="#7FBEE8"/><path d="M17 12l5-4v8z" fill="#5AA0D6"/><circle cx="7" cy="11" r="1.1" fill="#1d2430"/>',
    knochen: '<path d="M6 9a2.5 2.5 0 1 1 3-3l6 6a2.5 2.5 0 1 1 3 3 2.5 2.5 0 1 1-3 3l-6-6a2.5 2.5 0 1 1-3-3z" fill="#F4EBDD" stroke="#CFC2AE" stroke-width=".8"/>',
    karotte: '<path d="M14 7L4 20l13-9z" fill="#F08A24"/><path d="M14 7l3-4M15 8l5-2M15.5 8.5l4 1" stroke="#5FB043" stroke-width="1.6" stroke-linecap="round"/>',
    bambus: '<rect x="10" y="2" width="4" height="20" rx="1.5" fill="#7CC35A"/><path d="M10 8h4M10 15h4" stroke="#4E8A34" stroke-width="1.2"/><path d="M14 9q4-2 6 0-3 2-6 0z" fill="#5FB043"/>',
    nuss: '<ellipse cx="12" cy="14" rx="7" ry="6.5" fill="#B9773A"/><path d="M5 11q7-7 14 0z" fill="#7A4A22"/><path d="M12 4v3" stroke="#7A4A22" stroke-width="1.6"/>',
    koerner: '<ellipse cx="8" cy="13" rx="2" ry="3" fill="#E9C46A"/><ellipse cx="13" cy="11" rx="2" ry="3" fill="#F4D58D"/><ellipse cx="16" cy="16" rx="2" ry="3" fill="#E0B44E"/><ellipse cx="10" cy="18" rx="2" ry="3" fill="#F4D58D"/>',
    kaese: '<path d="M3 17l15-9 3 2v9H3z" fill="#FFD34D"/><path d="M3 17l15-9 3 2-15 7z" fill="#FFE27A"/><circle cx="10" cy="17.5" r="1.4" fill="#E0B030"/><circle cx="16" cy="15" r="1" fill="#E0B030"/>',
    grille: '<ellipse cx="12" cy="14" rx="7" ry="3.6" fill="#7A9A3A"/><circle cx="18" cy="12.5" r="2.6" fill="#6A8A2A"/><path d="M6 15l-3 4M10 16l-1 4M14 16l1 4M19 10l3-5M18 10l1-6" stroke="#4A6A1A" stroke-width="1"/>',
    wurm: '<path d="M3 16c3-6 5 4 8-2s5 4 8-2" fill="none" stroke="#F29AA0" stroke-width="3.4" stroke-linecap="round"/><circle cx="19.4" cy="12" r=".7" fill="#1d2430"/>',
    chili: '<path d="M18 5c-1 9-6 14-14 15 6-4 8-8 9-14z" fill="#E5352D"/><path d="M13 6q3-3 6-1" stroke="#5FB043" stroke-width="2" fill="none" stroke-linecap="round"/>',
    nektar: '<g fill="#FF8FC8"><circle cx="12" cy="7" r="3.4"/><circle cx="17" cy="11" r="3.4"/><circle cx="15" cy="17" r="3.4"/><circle cx="9" cy="17" r="3.4"/><circle cx="7" cy="11" r="3.4"/></g><circle cx="12" cy="12.5" r="3" fill="#FFD34D"/>',
    blatt: '<path d="M4 20C4 9 11 4 20 4c0 9-5 16-16 16z" fill="#5FB043"/><path d="M4 20L17 7" stroke="#3E8A2A" stroke-width="1.2"/>',
    zweig: '<path d="M3 19L20 6" stroke="#8A5A34" stroke-width="2.6" stroke-linecap="round"/><path d="M10 14l-2-5M14 11l4 2" stroke="#8A5A34" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="7" cy="8" rx="2.4" ry="1.4" fill="#5FB043"/>',
    garnele: '<path d="M18 6c-8 0-13 5-12 11 3-1 4-3 4-6 2 2 6 1 8-1z" fill="#FF8A6A"/><path d="M8 8l-4-4M9 7l-2-5" stroke="#E5604A" stroke-width=".9"/>',
    keule: '<path d="M6 6c4-4 11 0 9 6s-7 4-9 0" fill="#C9763A"/><path d="M11 13l6 6" stroke="#F4EBDD" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="19.5" r="1.8" fill="#F4EBDD"/>',
    leckerli: '<circle cx="12" cy="12" r="8.5" fill="#D9A15A"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="#B57E3A" stroke-width="1"/><circle cx="9" cy="10" r="1.3" fill="#6B3E26"/><circle cx="14.5" cy="9" r="1.1" fill="#6B3E26"/><circle cx="13" cy="14.5" r="1.3" fill="#6B3E26"/>',
    ball: '<circle cx="12" cy="12" r="8.5" fill="#FF6B6B"/><path d="M4 10q8 4 16 0M5 15q7 3 14 0" stroke="#fff" stroke-width="1.6" fill="none"/>',
    buerste: '<rect x="3" y="9" width="12" height="6" rx="2" fill="#B07CFF"/><path d="M15 12h6" stroke="#8A5ADB" stroke-width="2.4" stroke-linecap="round"/><path d="M5 15v3M8 15v3M11 15v3M13.5 15v3" stroke="#cfd6df" stroke-width="1.2"/>',
    seife: '<rect x="4" y="9" width="16" height="10" rx="3" fill="#8FD6F2"/><circle cx="17" cy="6" r="2" fill="none" stroke="#bfe8ff" stroke-width="1"/><circle cx="13" cy="4.5" r="1.3" fill="none" stroke="#bfe8ff" stroke-width="1"/>',
    taler: '<circle cx="12" cy="12" r="9" fill="#E6EBF0"/><circle cx="12" cy="12" r="5.6" fill="#FFD84A"/><path d="M12 8.6l1.1 2.2 2.4.3-1.7 1.6.4 2.4-2.2-1.2-2.2 1.2.4-2.4-1.7-1.6 2.4-.3z" fill="#9a6f0a"/>',
    glitzer: '<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#FFE27A"/><path d="M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8z" fill="#fff"/>',
    ei: '<path d="M12 3c5 0 8 8 8 12.5S16.5 22 12 22s-8-2.5-8-6.5S7 3 12 3z" fill="#F7F0FF" stroke="#C9B5E8" stroke-width="1"/><path d="M5 14c3-2 5 1 7-1s5 1 7-1" stroke="#B07CFF" stroke-width="1.6" fill="none"/>',
    hut: '<path d="M4 15h16l-2-2V8c0-3-12-3-12 0v5z" fill="#E5483B"/><rect x="3" y="14.5" width="18" height="3" rx="1.5" fill="#B5302A"/><circle cx="12" cy="5" r="2" fill="#fff"/>',
  };  Object.assign(ICO, {
    wasser: '<path d="M12 2.5C9 7 6 10.5 6 14a6 6 0 0 0 12 0c0-3.5-3-7-6-11.5z" fill="#5AB8F0"/><ellipse cx="9.6" cy="13" rx="1.4" ry="2.4" fill="#fff" opacity=".55"/>',
    milch: '<path d="M8 3h8v3l2 3v12H6V9l2-3z" fill="#F4F6F8" stroke="#C9D1D9" stroke-width=".8"/><rect x="6" y="11" width="12" height="5" fill="#4FA3E0"/><path d="M8 3h8v2H8z" fill="#4FA3E0"/>',
    saft: '<path d="M6 6h12l-1.5 15h-9z" fill="#FFB347"/><path d="M6 6h12l-.4 4H6.4z" fill="#FFD27A"/><path d="M14 6l3-4" stroke="#FF6B6B" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.5" cy="5" r="2.6" fill="#FFE27A" stroke="#F5A623" stroke-width=".6"/>',
    honig: '<path d="M7 8h10v11a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" fill="#F5B83D"/><rect x="6.5" y="5" width="11" height="3.4" rx="1" fill="#C9763A"/><path d="M9 12h6M9 15h6" stroke="#FFE08A" stroke-width="1"/>',
    kakao: '<path d="M5 9h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#E8D2B6"/><path d="M17 11h1.6a2.2 2.2 0 0 1 0 4.4H17" stroke="#E8D2B6" stroke-width="1.6" fill="none"/><ellipse cx="11" cy="9.4" rx="5.6" ry="1.4" fill="#7A4A22"/><path d="M9 6q1-2 0-4M12 6q1-2 0-4" stroke="#cfd6df" stroke-width=".9" fill="none" stroke-linecap="round"/>',
    energy: '<rect x="7" y="3" width="10" height="19" rx="2.6" fill="#7A4AE8"/><rect x="7" y="3" width="10" height="3" rx="1.4" fill="#B9C2CC"/><path d="M13 8l-4 6h3l-1 5 4-6.5h-3z" fill="#FFE27A"/>',
    happy: '<rect x="3" y="8" width="18" height="8" rx="4" fill="#FF8FC8"/><path d="M12 8h5a4 4 0 0 1 0 8h-5z" fill="#FFE27A"/><path d="M6 11.2v.1M9 11.2v.1M6.2 13.4q1.4 1.3 2.8 0" stroke="#7a2e4a" stroke-width="1" stroke-linecap="round" fill="none"/>',
    wachs: '<rect x="3" y="8" width="18" height="8" rx="4" fill="#69C350"/><path d="M12 8h5a4 4 0 0 1 0 8h-5z" fill="#fff"/><path d="M7 15v-5M5.4 11.6L7 10l1.6 1.6" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    glitzerpille: '<rect x="3" y="8" width="18" height="8" rx="4" fill="#B07CFF"/><path d="M12 8h5a4 4 0 0 1 0 8h-5z" fill="#7FE3FF"/><path d="M7.4 9.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="#fff"/>',
    schlaf: '<path d="M9 3h6v3l2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-2z" fill="#4A5BB8"/><rect x="9.6" y="1.6" width="4.8" height="2.4" rx="1" fill="#2E3A80"/><path d="M14.5 12.2a3 3 0 1 1-3.6-2.6 2.4 2.4 0 0 0 3.6 2.6z" fill="#FFE9A8"/>',
    vitamin: '<circle cx="12" cy="12" r="8" fill="#FF8A3D"/><circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 2.4" opacity=".7"/><text x="12" y="15.6" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="system-ui">C</text>',
    pflaster: '<rect x="2" y="8.5" width="20" height="7" rx="3.5" fill="#F2C9A0" transform="rotate(-30 12 12)"/><rect x="8.6" y="8.5" width="6.8" height="7" fill="#E8B88A" transform="rotate(-30 12 12)"/><path d="M11 11.4h.01M13 12.6h.01M11.6 13.4h.01" stroke="#C9965E" stroke-width="1.2" stroke-linecap="round"/><path d="M5 18l1-1" stroke="#FF8FC8" stroke-width="1.4"/>',
    keks: '<circle cx="12" cy="12" r="8.5" fill="#E0A55A"/><circle cx="12" cy="12" r="6.5" fill="#FF8FC8"/><circle cx="9" cy="10" r=".9" fill="#FFE27A"/><circle cx="14" cy="9" r=".9" fill="#7FD3FF"/><circle cx="13" cy="14" r=".9" fill="#69C350"/><circle cx="9.6" cy="14.4" r=".9" fill="#fff"/>',
    regenbogen: '<path d="M3 17a9 9 0 0 1 18 0" stroke="#FF6B6B" stroke-width="2.2" fill="none"/><path d="M5.4 17a6.6 6.6 0 0 1 13.2 0" stroke="#FFD34D" stroke-width="2.2" fill="none"/><path d="M7.8 17a4.2 4.2 0 0 1 8.4 0" stroke="#69C350" stroke-width="2.2" fill="none"/><path d="M10.2 17a1.8 1.8 0 0 1 3.6 0" stroke="#4FA3E0" stroke-width="2.2" fill="none"/>',
    goldapfel: '<circle cx="12" cy="13.5" r="8" fill="#FFC21A"/><path d="M12 5.5v3" stroke="#8A5A1A" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="15" cy="5.6" rx="3" ry="1.5" fill="#5FB043"/><ellipse cx="9" cy="10.5" rx="2" ry="1.4" fill="#fff" opacity=".6"/><path d="M17 15l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#fff"/>',
    sternenstaub: '<path d="M7 20h10l-1-8H8z" fill="#3A3D6A"/><path d="M8 12h8" stroke="#6A6DA8" stroke-width="1.4"/><path d="M12 3l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1z" fill="#FFE27A"/><circle cx="10" cy="16" r=".8" fill="#FFE27A"/><circle cx="14" cy="17.4" r=".7" fill="#fff"/>',
    feder: '<path d="M18 3C9 5 6 12 6 18l2-2c3-1 8-5 10-13z" fill="#F7F3FA" stroke="#C9B5E8" stroke-width=".8"/><path d="M5 21L15 8" stroke="#C9B5E8" stroke-width="1"/>',
    wachs_s: '<rect x="5" y="9" width="14" height="6" rx="3" fill="#69C350"/><path d="M12 9h4a3 3 0 0 1 0 6h-4z" fill="#fff"/><path d="M8.5 13.6v-3.2M7.3 11.6l1.2-1.2 1.2 1.2" stroke="#fff" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wachs_m: '<rect x="3" y="8" width="18" height="8" rx="4" fill="#3FA9E0"/><path d="M12 8h5a4 4 0 0 1 0 8h-5z" fill="#fff"/><path d="M6 15v-5M4.4 11.6L6 10l1.6 1.6M9 15v-5M7.4 11.6L9 10l1.6 1.6" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wachs_l: '<rect x="2" y="7" width="20" height="10" rx="5" fill="#F5B82E"/><path d="M12 7h5a5 5 0 0 1 0 10h-5z" fill="#FFF3C4"/><path d="M5 15.4V9.6M3.6 11L5 9.6 6.4 11M8 15.4V9.6M6.6 11L8 9.6 9.4 11M11 15.4V9.6M9.6 11L11 9.6 12.4 11" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 4l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="#FFE27A"/>',
    sternenstein: '<path d="M6 15l2-6 5-3 5 3 1 6-4 4-6 0z" fill="#3B2E6E"/><path d="M8 9l5-3 5 3-5 2z" fill="#6E5CC8"/><path d="M13 11l5-2 1 6-4 4z" fill="#2A2050"/><circle cx="10" cy="13" r=".9" fill="#9FE6FF"/><circle cx="14" cy="15" r=".7" fill="#FFE27A"/><circle cx="12" cy="9" r=".6" fill="#fff"/><path d="M19 3l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#FFE27A"/><path d="M4 5l.5 1.1 1.1.5-1.1.5-.5 1.1-.5-1.1-1.1-.5 1.1-.5z" fill="#9FE6FF"/>',
    regenbogenfeder: '<path d="M5 20C6 13 11 6 19 3c-1 7-6 13-14 17z" fill="#FF6B6B"/><path d="M6.5 18.5C8 13 12 8 17.5 5c-1 5-5 10-11 13.5z" fill="#FFD34D"/><path d="M8 17c1.6-4 4.5-7.6 8-10-1 4-4 7.6-8 10z" fill="#7CD06A"/><path d="M9.6 15.4c1.2-2.6 3-4.8 5-6.4-.8 2.6-2.6 4.8-5 6.4z" fill="#5EC3EC"/><path d="M4 21L13 11" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>',
    traumkristall: '<path d="M12 2l5 6-5 14-5-14z" fill="#FF8FC8"/><path d="M12 2l5 6h-10z" fill="#FFC4E1"/><path d="M12 8v14l5-14z" fill="#D85FA0"/><circle cx="12" cy="11" r="2.2" fill="#fff" opacity=".85"/><path d="M12 9.6c-.8 1.2-.8 2.2 0 2.8.8-.6.8-1.6 0-2.8z" fill="#FFE27A"/>',
    samen: '<path d="M4 20h16l-2-7H6z" fill="#B87A4B"/><path d="M6 13h12" stroke="#8B5A33" stroke-width="1.4"/><path d="M12 13V7" stroke="#5FB043" stroke-width="1.6" stroke-linecap="round"/><path d="M12 9c-3 0-4-2-4-4 3 0 4 2 4 4zM12 8c3 0 4-2 4-4-3 0-4 2-4 4z" fill="#7CD06A"/>',
    kissen: '<path d="M3 9c3-2 15-2 18 0 1 3 1 6 0 8-3 2-15 2-18 0-1-2-1-5 0-8z" fill="#B58CFF"/><path d="M5 10c3-1 11-1 14 0" stroke="#D9C4FF" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M12 12.4l.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1 1.5-.2z" fill="#FFE27A"/>',
    laterne: '<path d="M10 3h4v2h-4z" fill="#555"/><path d="M8 6h8l1 12H7z" fill="#FFD34D" opacity=".9"/><path d="M8 6h8l1 12H7z" fill="none" stroke="#7A5A20" stroke-width="1.2"/><path d="M12 9c-1.4 2-1.4 4 0 5 1.4-1 1.4-3 0-5z" fill="#FF8A3D"/><path d="M6 18h12v2H6z" fill="#7A5A20"/>',
    wolle: '<circle cx="12" cy="12" r="7.5" fill="#FF6B9A"/><path d="M6 9c4 1 9 6 11 10M5 13c4 0 8 3 9 7M8 5.6c3 2 7 7 10.6 8.6M12 4.6c2 2 5 4 7 5" stroke="#FFB3CB" stroke-width="1.2" fill="none"/><path d="M17.8 17.5c1.5 1 2.5 2.5 3.4 4" stroke="#FF6B9A" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
    drachen: '<path d="M12 2l7 7-7 8-7-8z" fill="#5EC3EC"/><path d="M12 2v15M5 9h14" stroke="#fff" stroke-width="1"/><path d="M12 2l7 7h-7z" fill="#FFD34D"/><path d="M5 9h7v8z" fill="#FF6B6B"/><path d="M12 17c-1 2 1 2 0 4s1 2 0 3" stroke="#7A5A20" stroke-width="1.1" fill="none"/>',
    blasen: '<circle cx="9" cy="12" r="5" fill="#9FE6FF" opacity=".35" stroke="#9FE6FF" stroke-width="1.2"/><circle cx="16.5" cy="7.5" r="3.4" fill="#FFC4E1" opacity=".35" stroke="#FFC4E1" stroke-width="1.1"/><circle cx="17" cy="16" r="2.4" fill="#C9F0B0" opacity=".35" stroke="#C9F0B0" stroke-width="1"/><path d="M7 10a2.5 2.5 0 0 1 2-1.6" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/>',
    napf: '<path d="M3 13h18l-2 6H5z" fill="#E06B6B"/><path d="M3 13h18" stroke="#B84A4A" stroke-width="1.4"/><circle cx="8" cy="11.6" r="1.6" fill="#E6A43F"/><circle cx="11.5" cy="11" r="1.7" fill="#C9763A"/><circle cx="15" cy="11.6" r="1.6" fill="#E6A43F"/><circle cx="13.4" cy="10" r="1.2" fill="#B85E2A"/>',
    postkarte: '<rect x="3" y="6" width="18" height="12" rx="1.5" fill="#FFF3DC"/><rect x="15" y="8" width="4" height="4.4" fill="#5EC3EC"/><path d="M5 10h8M5 12.6h7M5 15h6" stroke="#C4A27A" stroke-width="1" stroke-linecap="round"/>',
    namensschild: '<path d="M4 9h16v8H4z" fill="#C98A52"/><path d="M4 9h16v8H4z" fill="none" stroke="#8B5A33" stroke-width="1.2"/><path d="M8 9l4-5 4 5" stroke="#8B5A33" stroke-width="1.2" fill="none"/><path d="M7 13h10" stroke="#FFF3DC" stroke-width="1.4" stroke-linecap="round"/>',
    weitblick: '<path d="M7 20h10l-1.5-3h-7z" fill="#8B5A33"/><circle cx="12" cy="10.5" r="7" fill="#7FD3FF" opacity=".85"/><circle cx="12" cy="10.5" r="7" fill="none" stroke="#fff" stroke-width=".8"/><path d="M7.5 10.5c2.6-3 6.4-3 9 0-2.6 3-6.4 3-9 0z" fill="#fff"/><circle cx="12" cy="10.5" r="1.9" fill="#3A2F6E"/><circle cx="12.6" cy="9.9" r=".6" fill="#fff"/><path d="M9 6.2a5 5 0 0 1 3-1.2" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/>',
    zauberspiegel: '<path d="M11 15.5h2l1 6h-4z" fill="#C98A52"/><ellipse cx="12" cy="9" rx="6.2" ry="7.2" fill="#F5C542"/><ellipse cx="12" cy="9" rx="4.8" ry="5.8" fill="#B58CFF"/><path d="M9.4 6.4c1-1.6 3-2.2 4.6-1.6" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M10 11.5l2-3 2 3-2 1.6z" fill="#FFE27A"/><path d="M19 3l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="#FFE27A"/>',
    kleeblatt: '<g fill="#5FB043"><circle cx="9" cy="9" r="3.4"/><circle cx="15" cy="9" r="3.4"/><circle cx="9" cy="15" r="3.4"/><circle cx="15" cy="15" r="3.4"/></g><path d="M12 12l4 9" stroke="#4E8A34" stroke-width="1.6" stroke-linecap="round"/>',
  });  const icoB = (k, s) => { gid += 1; return `<svg viewBox="-2 -2 28 28" width="${s}" height="${s}"><defs><filter id="ib${gid}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="1.6" stdDeviation="1" flood-color="#000" flood-opacity=".45"/></filter><radialGradient id="ig${gid}" cx="35%" cy="25%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="12" cy="12" r="12.5" fill="#262a33" stroke="#3a404c" stroke-width="1"/><g filter="url(#ib${gid})" transform="translate(1.8 1.8) scale(.85)">${ICO[k] || ''}</g><circle cx="12" cy="12" r="12" fill="url(#ig${gid})"/></svg>`; };
  const FOOD = { fuchs: 'beeren', katze: 'fisch', hund: 'knochen', hase: 'karotte', igel: 'wurm', waschbaer: 'apfel', panda: 'bambus', erdmann: 'grille', eichhorn: 'nuss', hamster: 'koerner', maus: 'kaese', einhorn: 'apfel', otter: 'fisch', frosch: 'grille', axolotl: 'wurm', eidechse: 'grille', chamae: 'grille', drache: 'chili', eule: 'wurm', pinguin: 'fisch', ente: 'koerner', papagei: 'nuss', biene: 'nektar', kaefer: 'blatt', falter: 'nektar', reh: 'apfel', pony: 'karotte', koala: 'blatt', faultier: 'blatt', robbe: 'fisch', biber: 'zweig', flamingo: 'garnele', fledermaus: 'beeren', kolibri: 'nektar', tiger: 'keule', pegasus: 'apfel', phoenix: 'chili', greif: 'keule', kitsune: 'beeren', yeti: 'beeren', nessie: 'fisch', wolpi: 'karotte' };
  const FNAME = { apfel: 'Apfel', beeren: 'Beeren', fisch: 'Fisch', knochen: 'Knochen', karotte: 'Karotte', bambus: 'Bambus', nuss: 'Nuss', koerner: 'Körner', kaese: 'Käse', grille: 'Grille', wurm: 'Wurm', chili: 'Chili', nektar: 'Nektar', blatt: 'Blatt', zweig: 'Zweig', garnele: 'Garnele', keule: 'Fleisch' };
  window.FPICO = { ICO, icoB, FOOD, FNAME };
})();

/* Family Planer – care animations in the front view (design draft, round 15): feeding, drinking, treats, energy drink,
   pills, growing up, hatching, playing, brushing, bathing. Used by the animation page and by the GUI popups. */
(() => {
  const P4 = window.P4; const IC = window.FPICO; const rnd = (a, b) => a + Math.random() * (b - a);
  const CSS = `.care{position:relative;overflow:hidden;border-radius:16px;background:radial-gradient(ellipse at 50% 115%,#4f9a3f 0 30%,#2b4a2a 31%,#16241a 70%);aspect-ratio:4/3;width:100%}
  .care .pet{position:absolute;left:50%;bottom:6%;width:62%;transform:translateX(-50%);transform-origin:50% 100%}.care .pet svg{width:100%;height:auto;display:block;overflow:visible}
  .care .it{position:absolute;width:15%;left:8%;bottom:8%;z-index:3;pointer-events:none}.care .it svg{width:100%;height:auto;display:block}
  .care .fx{position:absolute;pointer-events:none;z-index:4;font:800 15px system-ui;color:#fff;text-shadow:0 1px 3px #000;white-space:nowrap}
  .care .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:5}
  .care .bars{position:absolute;left:3%;top:4%;display:flex;flex-direction:column;gap:4px;z-index:2;width:40%}.care .bar .bn{font:600 10.5px system-ui;color:#e8e8e8;width:50px;flex:none}
  .care .bar{display:flex;align-items:center;gap:5px;font:700 10.5px system-ui;color:#e8edf2}.care .bar i{flex:1;height:7px;border-radius:4px;background:#0006;overflow:hidden}.care .bar i b{display:block;height:100%;border-radius:4px;transition:width .9s cubic-bezier(.3,1.4,.5,1)}
  .care .msg{position:absolute;left:0;right:0;top:40%;text-align:center;font:900 20px system-ui;color:#FFE27A;text-shadow:0 2px 6px #000;opacity:0;z-index:6;pointer-events:none}
  .care .crack{position:absolute;inset:0}`;
  const BARS = [['hunger', '🍎', '#7CD06A', 'Hunger'], ['durst', '💧', '#5ec3ec', 'Durst'], ['energie', '⚡', '#FFD34D', 'Energie'], ['laune', '😊', '#FF8FC8', 'Laune']];
  class Care {
    constructor(host, k, stage, o) {
      this.o = o || {}; this.k = k; this.st = stage || 'gross'; this.mood = this.o.mood || 'froh'; this.look = this.o.look || {}; this.v = { hunger: 45, durst: 50, energie: 60, laune: 55, ...(this.o.v || {}) };
      host.classList.add('care'); host.innerHTML = `<div class="bars">${BARS.map(([b, i, c, n]) => `<div class="bar">${i}<small class="bn">${n}</small><i><b data-b="${b}" style="background:${c}"></b></i></div>`).join('')}</div><div class="pet"></div><div class="flash"></div><div class="msg"></div>`;
      if (this.o.noBars) host.querySelector('.bars').style.display = 'none';
      this.h = host; this.pet = host.querySelector('.pet'); this.draw(); this.bars(); this.busy = false;
    }
    draw(mood) { if (mood) this.mood = mood; this.pet.innerHTML = this.st === 'ei' ? P4.egg(this.k) : P4.svg(this.k, this.st, this.mood, { noShadow: 1, noBowl: 1, ...this.look }); }
    bars() { this.h.querySelectorAll('[data-b]').forEach((b) => { b.style.width = Math.max(4, Math.min(100, this.v[b.dataset.b])) + '%'; }); }
    add(b, n) { this.v[b] = Math.min(100, this.v[b] + n); this.bars(); }
    fx(txt, x, y, o) { const p = o || {}; const e = document.createElement('div'); e.className = 'fx'; e.textContent = txt; e.style.left = x + '%'; e.style.top = y + '%'; e.style.fontSize = (p.size || 15) + 'px'; this.h.appendChild(e);
      e.animate([{ transform: 'translate(-50%,0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-10px) scale(1.1)', opacity: 1, offset: .2 }, { transform: `translate(calc(-50% + ${p.dx || 0}px),${p.dy || -60}px) scale(1)`, opacity: 0 }], { duration: p.dur || 1400, easing: 'ease-out' }).onfinish = () => e.remove(); }
    item(key, to) { const e = document.createElement('div'); e.className = 'it'; e.innerHTML = IC.icoB(key, 60); this.h.appendChild(e); const t = to || [50, 52];
      const a = e.animate([{ left: '8%', bottom: '8%', transform: 'scale(.6) rotate(0)' }, { left: ((8 + t[0]) / 2) + '%', bottom: '62%', transform: 'scale(1) rotate(-20deg)', offset: .5 }, { left: (t[0] - 7) + '%', bottom: (100 - t[1] - 8) + '%', transform: 'scale(.5) rotate(20deg)', opacity: 1, offset: .92 }, { left: (t[0] - 7) + '%', bottom: (100 - t[1] - 8) + '%', transform: 'scale(.1)', opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(.3,.7,.4,1)' }); return new Promise((r) => { a.onfinish = () => { e.remove(); r(); }; }); }
    pa(frames, ms) { return new Promise((r) => { this.pet.animate(frames, { duration: ms, easing: 'ease-in-out' }).onfinish = r; }); }
    chew(n) { const f = []; for (let i = 0; i < n; i++) f.push({ transform: 'translateX(-50%) scale(1,1)' }, { transform: 'translateX(-50%) scale(1.04,.95)' }); f.push({ transform: 'translateX(-50%)' }); return this.pa(f, n * 260); }
    msg(t) { const m = this.h.querySelector('.msg'); m.textContent = t; m.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.08)', offset: .2 }, { opacity: 1, transform: 'scale(1)', offset: .8 }, { opacity: 0 }], { duration: 2200 }); }
    flash(ms) { this.h.querySelector('.flash').animate([{ opacity: 0 }, { opacity: .95, offset: .4 }, { opacity: 0 }], { duration: ms || 700 }); }
    sparkle(n, ch) { for (let i = 0; i < n; i++) setTimeout(() => this.fx(ch || '✨', rnd(25, 75), rnd(25, 70), { dy: -rnd(30, 70), dx: rnd(-30, 30), size: rnd(12, 20) }), i * 70); }
    async run(kind) {
      if (this.busy) return; this.busy = true; const k = this.k; const food = (IC.FOOD && IC.FOOD[k]) || 'apfel';
      try {
        if (kind === 'futter') { this.draw('hungrig'); await this.item(food); await this.chew(5); this.add('hunger', 35); this.draw('freut'); this.fx('+ Satt 🍎', 50, 30); this.sparkle(3, '💛'); }
        if (kind === 'trinken') { await this.item('wasser'); await this.chew(3); this.add('durst', 40); this.draw('freut'); this.fx('+ Durst gelöscht 💧', 50, 30); }
        if (kind === 'leckerli') { await this.item('keks'); await this.chew(3); this.add('laune', 20); this.draw('freut'); for (let i = 0; i < 5; i++) setTimeout(() => this.fx('💗', rnd(35, 65), 35), i * 150); await this.pa([{ transform: 'translateX(-50%)' }, { transform: 'translateX(-50%) translateY(-14%)' }, { transform: 'translateX(-50%)' }], 500); }
        if (kind === 'energy') { await this.item('energy'); await this.chew(2); this.draw('stolz'); await this.pa([...Array(10)].map((_, i) => ({ transform: `translateX(calc(-50% + ${i % 2 ? 4 : -4}px)) scale(${1 + i * .01})` })), 700); this.sparkle(8, '⚡'); this.add('energie', 100); this.fx('ENERGIE VOLL! ⚡', 50, 25, { size: 17 }); await this.pa([{ transform: 'translateX(-50%)' }, { transform: 'translateX(-50%) translateY(-22%) rotate(-8deg)' }, { transform: 'translateX(-50%) translateY(-22%) rotate(8deg)', offset: .6 }, { transform: 'translateX(-50%)' }], 800); }
        if (kind === 'happy') { this.draw('sauer'); await new Promise((r) => setTimeout(r, 600)); await this.item('happy'); await this.chew(2); this.flash(500); this.draw('freut'); this.add('laune', 100); ['🌈', '💗', '⭐', '😊', '🎉'].forEach((c, i) => setTimeout(() => this.fx(c, rnd(30, 70), rnd(30, 60), { size: 22 }), i * 120)); this.msg('Wieder fröhlich!'); await this.pa([{ transform: 'translateX(-50%) rotate(0)' }, { transform: 'translateX(-50%) rotate(-10deg) translateY(-8%)' }, { transform: 'translateX(-50%) rotate(10deg) translateY(-8%)' }, { transform: 'translateX(-50%)' }], 900); }
        if (kind.startsWith('wachs_')) { const g = { wachs_s: [15, 1.05, 3], wachs_m: [30, 1.1, 5], wachs_l: [60, 1.16, 8] }[kind]; await this.item(kind); await this.chew(2); this.draw('stolz');
          for (let i = 0; i < g[2]; i++) setTimeout(() => this.fx('⬆', rnd(30, 70), rnd(45, 70), { dy: -rnd(40, 70), size: rnd(14, 22) }), i * 110);
          await this.pa([{ transform: 'translateX(-50%) scale(1)' }, { transform: `translateX(-50%) scale(${g[1]})`, offset: .45 }, { transform: `translateX(-50%) scale(${g[1]})`, offset: .7 }, { transform: 'translateX(-50%) scale(1)' }], 1300); this.draw('freut'); this.msg(`+${g[0]} Wachstum`); this.sparkle(g[2], '🌱'); }
        if (kind === 'sternenstein') { this.h.style.transition = 'background .8s'; const bg = this.h.style.background; this.h.style.background = 'radial-gradient(circle at 50% 30%,#3a2f6e,#0d0f14 75%)'; await this.item('sternenstein', [50, 30]); for (let i = 0; i < 10; i++) setTimeout(() => this.fx('✦', rnd(15, 85), rnd(10, 40), { size: rnd(10, 18) }), i * 90);
          await this.pa([...Array(8)].map((_, i) => ({ transform: `translateX(-50%) translateY(${-i * 1.5}%)`, filter: `drop-shadow(0 0 ${i * 3}px #9fe6ff)` })), 1000); this.h.style.background = bg; await this.evolve(this.st === 'baby' ? 'jung' : 'gross', this.o.next || { morph: ['engelsfluegel'], aura: 'sterne' }, 'Eine ganze Stufe!'); }
        if (kind === 'regenbogenfeder') { await this.item('regenbogenfeder', [50, 40]); const cs = ['#FF6B6B', '#FFD34D', '#7CD06A', '#5EC3EC', '#B58CFF']; for (let i = 0; i < 18; i++) setTimeout(() => { const a = i / 18 * 6.28; this.fx('●', 50 + Math.cos(a) * 30, 50 + Math.sin(a) * 26, { size: 12 }); const l = this.h.lastChild; if (l) l.style.color = cs[i % 5]; }, i * 60);
          await new Promise((r) => setTimeout(r, 1200)); await this.evolve(this.st, { ...this.look, skin: 'regenbogen' }, 'Neue Farbe gewählt!'); }
        if (kind === 'traumkristall') { await this.item('traumkristall', [50, 35]); this.flash(600); this.msg('Wunsch-Ei!'); for (let i = 0; i < 8; i++) setTimeout(() => this.fx('💗', rnd(25, 75), rnd(25, 65), { dy: -rnd(30, 60) }), i * 120); await new Promise((r) => setTimeout(r, 1400)); this.k = this.o.wish || 'koala'; this.look = {}; this.busy = false; await this.run('schluepfen'); this.busy = true; }
        if (kind === 'weitblick') { await this.item('weitblick', [50, 30]); for (let i = 0; i < 12; i++) setTimeout(() => this.fx(['✦', '👁', '✨'][i % 3], rnd(15, 85), rnd(15, 75), { size: rnd(12, 20) }), i * 90); this.flash(500); this.draw('freut'); this.msg('Ganzer Baum sichtbar – 1 Stunde!'); }
        if (kind === 'zauberspiegel') { await this.item('zauberspiegel', [50, 35]); await this.pa([...Array(8)].map((_, i) => ({ transform: `translateX(-50%) scaleX(${i % 2 ? -1 : 1})` })), 1200); await this.evolve(this.st, this.o.other || { ...this.look, skin: 'kristall' }, 'Verwandelt!'); }
        if (kind === 'entwpille') { await this.item('glitzerpille'); await this.chew(2); this.draw('stolz'); this.sparkle(8, '✨'); this.msg('Pille bereit – jetzt ⭐ Entwickeln!'); }
        if (kind === 'pille') { await this.item('glitzerpille'); await this.chew(2); await this.evolve(this.st, this.o.next || { skin: 'gold' }, 'Spezialfarbe!'); }
        if (kind === 'wachsen') { const nx = this.st === 'baby' ? 'jung' : this.st === 'jung' ? 'gross' : 'gross'; await this.evolve(nx, this.st === 'gross' ? this.o.next || { morph: ['engelsfluegel'] } : this.look, nx === 'jung' ? 'Ist jetzt ein Jungtier!' : 'Ist jetzt gross!'); }
        if (kind === 'schluepfen') { this.st = 'ei'; this.draw(); const fr = [...Array(14)].map((_, i) => ({ transform: `translateX(-50%) rotate(${i % 2 ? 10 + i : -10 - i}deg)` })); await this.pa(fr, 1600); this.pet.insertAdjacentHTML('beforeend', '<svg class="crack" viewBox="0 0 100 100"><path d="M34 52 l8 -6 l6 8 l8 -8 l6 7 l6 -5" stroke="#5a4632" stroke-width="2" fill="none"/></svg>'); await this.pa([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.1,.9)' }, { transform: 'translateX(-50%) scale(1)' }], 500); this.flash(600); this.st = 'baby'; this.draw('freut'); this.sparkle(8, '✨'); ['🥚', '🐣'].forEach((c, i) => setTimeout(() => this.fx(c, 40 + i * 20, 70, { size: 22 }), i * 200)); this.msg('Geschlüpft!'); await this.pa([{ transform: 'translateX(-50%) scale(.3)' }, { transform: 'translateX(-50%) scale(1.15)' }, { transform: 'translateX(-50%) scale(1)' }], 700); }
        if (kind === 'ball') { const b = document.createElement('div'); b.className = 'it'; b.innerHTML = IC.icoB('ball', 50); this.h.appendChild(b); const a = b.animate([{ left: '10%', bottom: '8%' }, { left: '30%', bottom: '60%', offset: .3 }, { left: '46%', bottom: '58%', offset: .5 }, { left: '70%', bottom: '70%', offset: .75 }, { left: '92%', bottom: '8%' }], { duration: 1600, easing: 'ease-in-out' }); setTimeout(() => { this.draw('freut'); this.pa([{ transform: 'translateX(-50%)' }, { transform: 'translateX(-50%) translateY(-28%)' }, { transform: 'translateX(-50%)' }], 600); }, 500); await new Promise((r) => { a.onfinish = r; }); b.remove(); this.add('laune', 20); this.add('energie', -10); this.fx('+ Laune 😄', 50, 30); }
        if (kind === 'buerste') { const b = document.createElement('div'); b.className = 'it'; b.innerHTML = IC.icoB('buerste', 54); this.h.appendChild(b); const a = b.animate([...Array(8)].map((_, i) => ({ left: (36 + (i % 2) * 22) + '%', bottom: (40 + (i % 3) * 8) + '%', transform: `rotate(${i % 2 ? 20 : -20}deg)` })), { duration: 1800 }); this.sparkle(10, '✨'); await new Promise((r) => { a.onfinish = r; }); b.remove(); this.draw('stolz'); this.add('laune', 15); this.fx('Glänzt! ✨', 50, 25); }
        if (kind === 'baden') { this.sparkle(16, '🫧'); await this.pa([...Array(8)].map((_, i) => ({ transform: `translateX(-50%) rotate(${i % 2 ? 6 : -6}deg)` })), 1400); this.draw('freut'); this.fx('Sauber! 🫧', 50, 25); this.add('laune', 10); }
        if (kind === 'schlafen') { this.draw('schlaeft'); for (let i = 0; i < 6; i++) setTimeout(() => this.fx(['z', 'z', 'Z'][i % 3], 64 + i, 30, { dx: 22, dy: -50, size: 16 + (i % 3) * 5, dur: 1800 }), i * 450); await new Promise((r) => setTimeout(r, 3000)); this.add('energie', 50); this.draw('froh'); this.fx('Ausgeschlafen ⚡', 50, 25); }
      } finally { this.busy = false; }
    }
    async evolve(nextStage, look, text) {
      const sil = [{ filter: 'brightness(1)' }, { filter: 'brightness(4) saturate(0)', offset: .3 }, { filter: 'brightness(4) saturate(0)', offset: .7 }, { filter: 'brightness(1)' }];
      this.sparkle(10, '✨'); await this.pa([...Array(12)].map((_, i) => ({ transform: `translateX(-50%) scale(${1 + Math.sin(i) * .05})`, filter: `brightness(${1 + i * .25})` })), 1500);
      this.flash(900); this.st = nextStage; this.look = { ...(this.look || {}), ...(look || {}) }; this.draw('freut');
      this.pet.animate(sil, { duration: 900 }); await this.pa([{ transform: 'translateX(-50%) scale(.6)' }, { transform: 'translateX(-50%) scale(1.15)' }, { transform: 'translateX(-50%) scale(1)' }], 800);
      ['⭐', '✨', '🌟', '✨', '⭐'].forEach((c, i) => setTimeout(() => this.fx(c, 20 + i * 15, 60, { dy: -90, size: 22 }), i * 90)); this.msg(text || 'Entwickelt!');
    }
  }
  window.FPCARE = { Care, CSS };
})();

/* Family Planer – daily lucky wheel (design draft, round 10).
   Once a day per person, resets at midnight. Every spin also brings food and drink for all pets. Fabelwesen only via the star field. */
(() => {
  const WICON = {
    aura: '<circle cx="12" cy="12" r="5.5" fill="currentColor" opacity=".35"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    coin: '<circle cx="12" cy="12" r="9" fill="#E6EBF0"/><circle cx="12" cy="12" r="5.6" fill="#FFD84A"/><path d="M12 8.6l1.1 2.2 2.4.3-1.7 1.6.4 2.4-2.2-1.2-2.2 1.2.4-2.4-1.7-1.6 2.4-.3z" fill="#9a6f0a"/>', pet: '<ellipse cx="12" cy="15.5" rx="5" ry="4.2" fill="currentColor"/><circle cx="5.8" cy="10" r="2.2" fill="currentColor"/><circle cx="9.6" cy="6.4" r="2.2" fill="currentColor"/><circle cx="14.4" cy="6.4" r="2.2" fill="currentColor"/><circle cx="18.2" cy="10" r="2.2" fill="currentColor"/>',
    swap: '<path d="M4 9h13l-3-3M20 15H7l3 3" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    confetti: '<path d="M4 20l5-13 8 8z" fill="currentColor"/><circle cx="17" cy="5" r="1.6" fill="currentColor"/><circle cx="20" cy="10" r="1.3" fill="currentColor"/>',
    again: '<path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M17 3v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    joker: '<rect x="5" y="3" width="14" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.6l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor"/>',
    x2: '<text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="900" fill="currentColor" font-family="system-ui">×2</text>',
    gold: '<path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 16.9 6.1 20l1.2-6.5L2.5 8.9 9.1 8z" fill="#fff" stroke="#B8860B" stroke-width="1"/><text x="12" y="14.6" text-anchor="middle" font-size="6.5" font-weight="900" fill="#7a5200">?</text>',
  };
  WICON.hat = '<path d="M5 15c0-5 3-9 7-9s7 4 7 9z" fill="currentColor"/><rect x="3" y="15" width="18" height="3.4" rx="1.7" fill="currentColor"/><circle cx="12" cy="5" r="2" fill="currentColor"/>';
  WICON.star = '<path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 16.9 6.1 20l1.2-6.5L2.5 8.9 9.1 8z" fill="#fff" stroke="#B8860B" stroke-width="1"/><circle cx="12" cy="12.4" r="2.6" fill="#B07CFF"/>';
  WICON.egg = '<path d="M12 3c4 0 7 6 7 10.5S16 21 12 21s-7-3-7-7.5S8 3 12 3z" fill="currentColor"/><path d="M6 12l3 2 3-2 3 2 3-2" stroke="#fff" stroke-width="1.4" fill="none"/>';
  WICON.food = '<path d="M4 12h16l-2 7H6z" fill="currentColor"/><circle cx="9" cy="10" r="2.2" fill="currentColor"/><circle cx="13" cy="9" r="2.2" fill="currentColor"/><circle cx="16" cy="10.5" r="2" fill="currentColor"/>';
  WICON.grow = '<rect x="2" y="8" width="20" height="8" rx="4" fill="currentColor"/><path d="M12 8h6a4 4 0 0 1 0 8h-6z" fill="#fff" opacity=".55"/><path d="M7 14.6V9.4M5.2 11.2L7 9.4l1.8 1.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  WICON.devpill = '<rect x="2" y="8" width="20" height="8" rx="4" fill="currentColor"/><path d="M12 8h6a4 4 0 0 1 0 8h-6z" fill="#7FE3FF"/><path d="M7 9.4l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" fill="#fff"/>';
  const PRIZES = [
    ['grow', 'grow', 'Wachstumspille', 'Klein, mittel oder gross – Wachstum für ein Tierchen deiner Wahl.', 5, '#69C350'],
    ['fx', 'aura', 'Avatar-Effekt für 1 Woche', 'Einer der Avatar-Effekte, zufällig.', 3, '#B07CFF'],
    ['pet', 'pet', 'Haustier-Extra', 'Leckerli, Spielzeug, Samen, Energydrink oder Happy-Pille.', 3, '#3FA66B'],
    ['t20', 'coin', '+20 Punkte', 'Direkt zu deinen Tierchen-Punkten.', 3, '#F5C542'],
    ['dev', 'devpill', 'Entwicklungs-Pille', 'Für Spezialfarbe und Legende.', 2, '#8C5CE0'],
    ['zub', 'hat', 'Zubehör fürs grosse Tierchen', 'Mütze, Brille, Halstuch, Krone … – wie ein Avatar-Element zum Anziehen.', 2, '#3FBF9B'],
    ['swap', 'swap', 'Tierwechsel', 'Ein junges Tier darf gegen ein anderes getauscht werden.', 1, '#FF8A3D'],
    ['jubel', 'confetti', 'Jubel-Effekt für 1 Woche', 'Eigenes Konfetti beim Abhaken.', 1, '#FF6FD8'],
    ['joker', 'joker', 'Ämtli-Joker', 'Ein vergessenes Ämtli zählt nicht.', 1, '#E06B6B'],
    ['again', 'again', 'Nochmals drehen!', 'Sofort noch ein Dreh.', 1, '#4FA3E0'],
    ['x2', 'x2', 'Doppelte Punkte für einen Tag', 'Am nächsten Tag zählt alles doppelt.', 1, '#2A6AB0'],
    ['star', 'star', 'Sternfeld', 'Zusatz-Rad mit 3 Feldern: Fabelwesen-Ei, Artefakt oder Jackpot +100.', 1, '#FFC21A'],
  ];
  const STAR = [['egg', 'Fabelwesen-Ei!', '#B07CFF'], ['star', 'Artefakt!', '#3A2F6E'], ['gold', 'Jackpot +100 Punkte', '#FF8A3D']];
  const FIELDS = (() => { const out = []; const left = PRIZES.map((p) => p[4]); let last = -1;
    for (let n = 0; n < 24; n++) { let best = -1; for (let i = 0; i < PRIZES.length; i++) { if (!left[i] || i === last) continue; if (best < 0 || left[i] > left[best]) best = i; } if (best < 0) best = left.findIndex((x) => x > 0); out.push(best); left[best]--; last = best; }
    return out; })();
  const rr = (d) => d * Math.PI / 180;
  const sector = (C, R, a0, a1) => `M${C} ${C} L${(C + R * Math.cos(rr(a0))).toFixed(1)} ${(C + R * Math.sin(rr(a0))).toFixed(1)} A${R} ${R} 0 0 1 ${(C + R * Math.cos(rr(a1))).toFixed(1)} ${(C + R * Math.sin(rr(a1))).toFixed(1)}Z`;
  const wheelSvg = (hub, fields, colors, icons) => {
    const n = fields.length; const Rr = 132, C = 160; let s = ''; const a = 360 / n;
    fields.forEach((f, i) => { const a0 = -90 - a / 2 + i * a, a1 = a0 + a;
      s += `<path d="${sector(C, Rr, a0, a1)}" fill="${colors[i]}" stroke="#fff" stroke-width="2"/><path d="${sector(C, Rr, a0, a1)}" fill="url(#wsh)"/>`;
      const am = (a0 + a1) / 2; const sz = n > 6 ? 22 : 40; const ix = C + Rr * (n > 6 ? .76 : .62) * Math.cos(rr(am)), iy = C + Rr * (n > 6 ? .76 : .62) * Math.sin(rr(am));
      s += `<g transform="translate(${(ix - sz / 2).toFixed(1)} ${(iy - sz / 2).toFixed(1)}) rotate(${(am + 90).toFixed(1)} ${sz / 2} ${sz / 2})" style="color:#fff"><svg width="${sz}" height="${sz}" viewBox="0 0 24 24">${WICON[icons[i]]}</svg></g>`; });
    const bulbs = Array.from({ length: 24 }, (_, i) => { const q = rr(i * 15 - 90 + 7.5); return `<circle class="bulb ${i % 2 ? 'bo' : 'be'}" cx="${(C + (Rr + 10) * Math.cos(q)).toFixed(1)}" cy="${(C + (Rr + 10) * Math.sin(q)).toFixed(1)}" r="4.2" fill="#FFF3B0" style="filter:drop-shadow(0 0 3px #FFD34D)"/>`; }).join('');
    return `<svg class="w" viewBox="0 0 320 320"><defs><radialGradient id="wsh" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient></defs><circle cx="${C}" cy="${C}" r="${Rr + 18}" fill="#24304A"/><circle cx="${C}" cy="${C}" r="${Rr + 18}" fill="none" stroke="#FFD34D" stroke-width="3"/><g class="rot" style="transform-origin:160px 160px">${s}</g><g class="bulbs">${bulbs}</g><circle cx="${C}" cy="${C}" r="31" fill="#fff" stroke="#FFD34D" stroke-width="4"/>${hub ? `<defs><clipPath id="hubc"><circle cx="${C}" cy="${C - 4}" r="30"/></clipPath></defs><g clip-path="url(#hubc)"><svg x="${C - 30}" y="${C - 34}" width="60" height="60" viewBox="0 0 100 100">${hub}</svg></g>` : ''}</svg>`;
  };
  const ptrSvg = '<svg class="ptr" viewBox="0 0 30 40"><path d="M15 38 L3 10 A12 12 0 1 1 27 10 Z" fill="#FFD34D" stroke="#B8860B" stroke-width="2"/><circle cx="15" cy="12" r="5" fill="#fff"/></svg>';
  // spin one wheel; resolves with the index of the field under the pointer
  const spin = (box, n, k, ms) => new Promise((done) => {
    const rot = box.querySelector('.rot'); const ptr = box.querySelector('.ptr'); const bulbs = [...box.querySelectorAll('.bulb')]; const a = 360 / n;
    const start = +(rot.dataset.a || 0); const target = start + 360 * (n > 6 ? 6 : 4) + ((360 - k * a) - (start % 360) + 360) % 360; const T = ms || 5200; const t0 = performance.now(); let lastF = -1;
    bulbs.forEach((b) => b.classList.remove('be', 'bo'));
    const frame = (now) => { const t = Math.min(1, (now - t0) / T); const e = 1 - Math.pow(1 - t, 4); const ang = start + (target - start) * e; rot.style.transform = `rotate(${ang}deg)`; rot.dataset.a = ang;
      const f = Math.floor((ang + a / 2) / a); if (f !== lastF) { lastF = f; ptr.animate([{ transform: 'rotate(-14deg)' }, { transform: 'rotate(0)' }], { duration: 120 }); }
      const chase = Math.floor(now / (60 + t * 300)) % 24; bulbs.forEach((b, i) => { b.style.opacity = (i - chase + 24) % 24 < 3 ? '1' : '.25'; });
      if (t < 1) requestAnimationFrame(frame); else { bulbs.forEach((b, i) => { b.style.opacity = ''; b.classList.add(i % 2 ? 'bo' : 'be'); }); done(k); } };
    requestAnimationFrame(frame);
  });
  // the small round wheel button in every person card: ready (glowing) / spun today (grey with tick, back at midnight)
  const mini = (col) => { let s = ''; const cols = ['#B07CFF', '#69C350', '#F5C542', '#FF8A3D', '#FF6FD8', '#E06B6B', '#3FBF9B', '#4FA3E0']; for (let i = 0; i < 8; i++) { const a0 = rr(i * 45 - 90), a1 = rr(i * 45 - 45); s += `<path d="M12 12 L${(12 + 10 * Math.cos(a0)).toFixed(2)} ${(12 + 10 * Math.sin(a0)).toFixed(2)} A10 10 0 0 1 ${(12 + 10 * Math.cos(a1)).toFixed(2)} ${(12 + 10 * Math.sin(a1)).toFixed(2)}Z" fill="${cols[i]}" stroke="#fff" stroke-width=".6"/>`; } return `<svg class="mw" viewBox="0 0 24 24">${s}<circle cx="12" cy="12" r="3" fill="#fff" stroke="${col}" stroke-width="1.2"/></svg>`; };
  const dots = () => `<svg class="dots" viewBox="0 0 50 50">${Array.from({ length: 12 }, (_, i) => { const q = rr(i * 30); return `<circle class="${i % 2 ? 'bo' : 'be'}" cx="${(25 + 23 * Math.cos(q)).toFixed(1)}" cy="${(25 + 23 * Math.sin(q)).toFixed(1)}" r="1.8" fill="#FFE27A"/>`; }).join('')}</svg>`;
  const knob = (col, ready) => ready ? `<span class="wb glow">${mini(col)}${dots()}</span>` : `<span class="wb grey">${mini(col)}<span class="ok"></span></span>`;
  window.FPWHEEL = { PRIZES, STAR, FIELDS, WICON, wheelSvg, ptrSvg, spin, knob };
})();

// shared styles of the evolution tree and the wheel (used in the Tierchen popups)
window.FPLIBCSS = `.wb{position:absolute;right:0;top:0;width:36px;height:36px;border-radius:50%;background:#262a31;border:2px solid #353b46;display:flex;align-items:center;justify-content:center}
.wb svg.mw{width:26px;height:26px}.wb.grey svg.mw{filter:grayscale(1) brightness(.75)}
.wb .pr{position:absolute;inset:-5px;width:calc(100% + 10px);height:calc(100% + 10px)}
.wb.glow{border-color:#FFD34D;box-shadow:0 0 0 3px rgba(255,211,77,.3),0 0 16px rgba(255,211,77,.7);animation:wglow 1.4s ease-in-out infinite}
.wb.glow svg.mw{animation:wspin 5s linear infinite}
.wb .dots{position:absolute;inset:-7px;width:calc(100% + 14px);height:calc(100% + 14px)}
.wb .ok{position:absolute;right:-5px;bottom:-5px;width:16px;height:16px;border-radius:50%;background:#3FA66B;border:2px solid #1f2228;display:flex;align-items:center;justify-content:center}
.wb .ok::after{content:"";width:3px;height:6px;border:solid #fff;border-width:0 1.6px 1.6px 0;transform:rotate(45deg) translate(-.5px,-.5px)}
@keyframes wglow{50%{box-shadow:0 0 0 5px rgba(255,211,77,.12),0 0 24px rgba(255,211,77,.85)}}@keyframes wspin{to{transform:rotate(360deg)}}
.be{animation:be2 .6s steps(1) infinite}.bo{animation:bo2 .6s steps(1) infinite}@keyframes be2{0%{opacity:1}50%{opacity:.2}}@keyframes bo2{0%{opacity:.2}50%{opacity:1}}
.wheelbox{margin:0 14px 10px;background:#0f1115;border-radius:12px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px}
.wwrap{position:relative;width:320px;height:320px;max-width:100%}
.wwrap svg.w{width:100%;height:100%}
.wwrap .ptr{position:absolute;left:50%;top:-10px;width:30px;height:40px;margin-left:-15px;transform-origin:50% 25%;z-index:2}
.spin{font:800 15px system-ui;border:0;border-radius:22px;padding:11px 26px;background:#F5C542;color:#141414;cursor:pointer;min-height:44px}
.tw2,.tw3,.tw4,.tw5{overflow-x:auto}.tw2{margin:0 14px 12px;background:radial-gradient(ellipse at 50% 120%,#2b4a2a,#0f1115 70%);border-radius:14px;padding:10px}
.tx{display:flex;align-items:center;gap:14px;flex-wrap:wrap;max-width:100%;overflow-x:auto}.tg{position:relative;flex:none}.tg svg.tl{position:absolute;left:0;top:0}
.tn{position:absolute;padding:0;border-radius:10px;border:2px solid #2a3140;background:#151a20;cursor:pointer;overflow:visible}.tn svg{width:100%;height:100%;overflow:visible}.tn.on{border-color:#69C350;background:#1c2a1d}
.tf{display:flex;flex-direction:column;align-items:center;min-width:110px}.tf svg{width:110px;height:110px;overflow:visible}.tf small{font-size:11.5px;color:#cfd6df;text-align:center;line-height:1.3}
.spin:disabled{background:#3a3f4a;color:#9aa3b2;cursor:default;font-size:13px}
.wwrap.sm{width:170px;height:170px}.hatch{text-align:center}.hatch .egg svg{width:110px;height:110px;overflow:visible}.hatch small{display:block;color:#FFE27A;font-weight:700}
.tf b{color:#FFE27A}.tf{max-width:180px}.tf svg{width:130px;height:130px}
.th{position:absolute;top:0;text-align:center}.th b{display:block;font-size:11.5px;white-space:nowrap}.th small{display:block;font-size:10px;color:#FFE27A;white-space:nowrap}
.tn .bdg{position:absolute;right:-7px;top:-7px;font-size:12px;line-height:1}.tn.k-farbe{border-color:#F5C542}.tn.k-form{border-color:#B58CFF;border-style:dashed}.tn.k-schein{border-color:#7FE3FF;box-shadow:0 0 8px #7FE3FF}.tn.k-legende{border-color:transparent;background:linear-gradient(#151a20,#151a20) padding-box,conic-gradient(#FF5A5A,#FFD34D,#8CE07A,#7FD3FF,#B58CFF,#FF5A5A) border-box}.tn.on{box-shadow:0 0 0 2px #69C350}
.kb{display:inline-block;margin:4px 0 2px;font-size:11px;font-weight:800;padding:2px 8px;border-radius:9px;background:#252932}.kb.k-farbe{color:#F5C542}.kb.k-form{color:#CDB8FF}.kb.k-schein{color:#7FE3FF}.kb.k-legende{color:#FFE27A}
.rq{display:block;margin-top:5px;font-size:11px;color:#cfd6df}.rq b{color:#9fe39a}`;

window.FPPETS = { P4: window.P4, M: window.FPMOTION, HEADER: window.FPHEADER, WORLD: window.FPWORLD, TREE: window.FPTREE, ICO: window.FPICO, CARE: window.FPCARE, WHEEL: window.FPWHEEL, CSS: window.FPLIBCSS };