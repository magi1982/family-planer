// ---------------------------------------------------------------------------
// Tap stories for the header scene: a tap anywhere on the free scene plays one animation that fits
// today (fun day, holiday, weather, season, time of day). Every story is an SVG overlay laid over the
// real scene; playing it adds the class "go-<n>" to the scene's <svg> for the length of the story.
// All coordinates are in the 1200 x 120 view box (pool house).
// window.FPTAPS = { list, css(), pick(ctx), play(svg, n, lang), EN }
// ---------------------------------------------------------------------------
(() => {
  const T = [];
  let css = '';
  const add = (o) => T.push(o);
  // keyframes + rule helpers
  const K = (name, frames) => { css += `@keyframes ${name}{${frames}}`; };
  const A = (n, sel, name, dur, extra) => { css += `.go-${n} ${sel}{animation:${name} ${dur}s ${extra || 'ease-in-out'} forwards}`; };
  const hide = (n, sels) => { css += sels.map((s) => `.tp-${n} ${s}`).join(',') + '{opacity:0}'; };
  const fb = (sel) => { css += `${sel}{transform-box:fill-box;transform-origin:center}`; };
  const fbb = (sel) => { css += `${sel}{transform-box:fill-box;transform-origin:50% 100%}`; };

  // ---------------------------------------------------------------- little figures
  const kid = (x, y, shirt, hair, sk) => `<g transform="translate(${x} ${y})"><path d="M-2 0 l-1 -9 M2 0 l1 -9" stroke="#34495e" stroke-width="2.6" stroke-linecap="round"/><rect x="-4.5" y="-21" width="9" height="13" rx="3" fill="${shirt}"/><circle cx="0" cy="-26" r="5" fill="${sk || '#F3CDA6'}"/><path d="M-5 -27 q5 -9 10 0z" fill="${hair}"/><circle cx="1.6" cy="-26" r=".7" fill="#2b2b2b"/></g>`;
  const star = (x, y, r, c) => `<path d="M${x} ${y - r} L${x + r * 0.25} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.25} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.25} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.25} ${y - r * 0.25}Z" fill="${c || '#fff'}"/>`;
  const heart = (x, y, k, c) => `<path d="M${x} ${y + 6 * k} c${-7 * k} ${-5 * k} ${-9 * k} ${-11 * k} ${-4.6 * k} ${-13 * k} c${2.4 * k} ${-1 * k} ${4 * k} ${0.4 * k} ${4.6 * k} ${2 * k} c${0.6 * k} ${-1.6 * k} ${2.2 * k} ${-3 * k} ${4.6 * k} ${-2 * k} c${4.4 * k} ${2 * k} ${2.4 * k} ${8 * k} ${-4.6 * k} ${13 * k}z" fill="${c}"/>`;
  const conf = (n, x0, w, y0) => Array.from({ length: n }, (_, i) => `<rect class="cf" x="${(x0 + (i * 37) % w).toFixed(0)}" y="${y0}" width="3" height="2" fill="${['#FF5A7A', '#FFD84D', '#5CE1E6', '#B07CFF', '#7CFF8A', '#FF8A3C'][i % 6]}" style="--dx:${((i * 13) % 40) - 20}px;--dy:${60 + (i * 7) % 50}px;--r:${(i * 47) % 360}deg;animation-delay:${((i % 9) * 0.12).toFixed(2)}s"/>`).join('');
  K('cff', '0%{opacity:0;transform:translate(0,0) rotate(0)}5%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}');

  // story helpers: mv = move/show an element along keyframes, loop = an endless little motion while the story runs
  let kc = 0;
  const mv = (n, sel, dur, frames, ease) => { const k = `m${n}_${++kc}`; K(k, frames.map(([p, tr, o]) => `${Math.max(0, Math.min(100, p))}%{transform:${tr || 'none'};opacity:${o == null ? 1 : o}}`).join('')); css += `.go-${n} ${sel}{animation:${k} ${dur}s ${ease || 'ease-in-out'} forwards}`; };
  const loop = (n, sel, k, dur) => { css += `.go-${n} ${sel}{animation:${k} ${dur}s ease-in-out infinite}`; };
  K('bobk', '0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}'); K('wigk', '0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}'); K('flapk', '0%,100%{transform:scaleY(1)}50%{transform:scaleY(-.6)}');
  css += '.flp,.gnr,.kk7,.kk7r,.sqr,.gmr,.ckr,.dnc{transform-box:fill-box;transform-origin:center}';
  K('rnk', '0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(60px);opacity:0}');
  K('k3m', '0%{transform:translate(0,0)}40%{transform:translate(calc(var(--dx) * .5),-22px)}100%{transform:translate(var(--dx),10px)}');
  K('k5s', '0%{transform:translate(0,-20px)}25%{transform:translate(30px,10px)}50%{transform:translate(-20px,30px)}75%{transform:translate(20px,50px)}100%{transform:translate(0,70px)}');
  K('k5x', '0%,100%{transform:translateX(0)}10%{transform:translateX(-8px)}20%{transform:translateX(8px)}30%{transform:translateX(-6px)}40%{transform:translateX(0)}');
  K('k11', '0%{opacity:0;transform:translate(0,0) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translate(-20px,-40px) scale(2.2)}'); css += '.rr11{transform-box:fill-box;transform-origin:center}';
  K('k16p', '0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}');

  // ================================================================ WEATHER & SKY
  const KP7 = { ka: [[14, 489, 81], [24, 530, 30], [36, 566, 18], [48, 546, 40], [62, 584, 22], [80, 540, 30], [94, 489, 81]],
    kb: [[16, 609, 81], [28, 652, 24], [42, 700, 36], [56, 690, 16], [74, 724, 28], [94, 609, 81]],
    kc: [[18, 729, 81], [30, 776, 28], [40, 826, 40], [52, 808, 14], [66, 864, 28], [80, 830, 22], [94, 729, 81]] };

  // 7 BIG – kite festival: gusts of wind, three kids each fly a kite on a string (one long dragon kite), the kites loop and dance, leaves swirl, then they are reeled in
  add({ n: 7, big: true, t: 'Drachenfest', scene: 'Wind (Herbst)', where: 'den Himmel', dur: 20,
    g: `<g class="gu7">${[0, 1, 2, 3, 4].map((i) => `<path d="M${-40 + i * 8} ${30 + i * 16} q60 -10 120 0 t120 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".75" stroke-linecap="round"/>`).join('')}</g>`
      + [[480, '#3E8EDE', '#D4A63B'], [600, '#E5483B', '#6b4a2e'], [720, '#3FA66B', '#2b2b2b']].map(([x, c, h], i) => `<g class="kd7 k7${i}"><g class="kk7r">${kid(x, 108, c, h)}<path d="M${x + 4} 86 l5 -5" stroke="#F3CDA6" stroke-width="2" stroke-linecap="round"/></g></g>`).join('')
      // strings: a line from each kid's hand to its kite, drawn with SVG <line> whose end follows the kite (animated with the same keyframes as the kite)
      + [['ka', 489, 81, 14], ['kb', 609, 81, 14], ['kc', 729, 81, 6]].map(([k, hx, hy, oy]) => { const pts = KP7[k];
        const fr = [[0, hx, hy], [pts[0][0] - 2, hx, hy]].concat(pts.map(([p, x, y]) => [p, x, y + oy])).concat([[100, hx, hy]]);
        const vals = fr.map(([, x, y]) => `M${hx} ${hy} Q ${((hx + x) / 2 - 10).toFixed(0)} ${((hy + y) / 2 + 8).toFixed(0)} ${x} ${y}`).join(';');
        return `<path class="str7" d="M${hx} ${hy} L${hx} ${hy}" stroke="#fff" stroke-width=".7" fill="none" opacity=".9"><animate attributeName="d" begin="indefinite" dur="20s" values="${vals}" keyTimes="${fr.map(([p]) => (p / 100).toFixed(2)).join(';')}" calcMode="spline" keySplines="${fr.slice(1).map(() => '.42 0 .58 1').join(';')}" fill="remove"/></path>`; }).join('')
      + `<g class="kt7 kta"><g class="kk7"><path d="M0 -12 l11 12 l-11 15 l-11 -15z" fill="#3E8EDE"/><path d="M0 -12 v27 M-11 0 h22" stroke="#fff" stroke-width=".9"/><path d="M0 15 q-5 7 0 12 q5 5 0 10" stroke="#FFD24A" stroke-width="1.4" fill="none"/></g></g>`
      + `<g class="kt7 ktb"><g class="kk7"><rect x="-9" y="-9" width="18" height="10" fill="#FFD24A"/><rect x="-9" y="5" width="18" height="10" fill="#FFD24A"/><path d="M-9 -9 v24 M9 -9 v24" stroke="#c99a1e" stroke-width="1"/><path d="M0 15 q-4 6 0 10 q4 4 0 8" stroke="#E5483B" stroke-width="1.2" fill="none"/></g></g>`
      + `<g class="kt7 ktc"><g class="kk7"><g transform="scale(-1 1)"><circle cx="0" cy="0" r="7" fill="#3FA66B"/><circle cx="2.4" cy="-2" r="1.4" fill="#fff"/><circle cx="2.8" cy="-2" r=".7" fill="#1d1d1d"/><path d="M5 2 q3 1 4 -1" stroke="#E5483B" stroke-width="1.2" fill="none"/><path d="M-4 -6 l-2 -5 4 3z M0 -7 l0 -6 3 4z" fill="#FFD24A"/>${Array.from({ length: 9 }, (_, i) => `<circle class="tl7" style="animation-delay:-${(i * 0.12).toFixed(2)}s" cx="${-8 - i * 6}" cy="${2 + (i % 2) * 2}" r="${4.4 - i * .3}" fill="${['#3FA66B', '#FFD24A', '#E5483B'][i % 3]}"/>`).join('')}</g></g></g>`
      + Array.from({ length: 14 }, (_, i) => `<path class="lf7" style="--x:${(i * 83) % 1200}px;animation-delay:${(1 + (i % 7) * .5).toFixed(1)}s" d="M0 0 q4 -4 8 0 q-4 4 -8 0z" fill="${['#E58A2B', '#C8452B', '#E8B23A'][i % 3]}"/>`).join('') });
  hide(7, ['.gu7', '.kd7', '.kt7', '.lf7']); css += '.str7{opacity:0}.go-7 .str7{opacity:.9}';
  K('k7g', '0%{transform:translateX(-100px);opacity:0}10%{opacity:1}100%{transform:translateX(1300px);opacity:0}'); css += '.go-7 .gu7{animation:k7g 2.6s linear 3}';
  [0, 1, 2].forEach((i) => mv(7, `.k7${i}`, 20, [[0, `translateX(${-60 + i * 30}px)`, 0], [4, `translateX(${-60 + i * 30}px)`, 1], [12, 'translateX(0)', 1], [94, 'translateX(0)', 1], [100, 'translateX(0)', 0]]));
  // kite paths (kite centre positions in the view box); the strings use the same points via the "d" property
  const KP = { ka: [489, KP7.ka], kb: [609, KP7.kb], kc: [729, KP7.kc] };
  Object.entries(KP).forEach(([k, [, pts]]) => {
    const fr = [[0, `translate(${pts[0][1]}px,${pts[0][2]}px) scale(.3)`, 0], [pts[0][0] - 2, `translate(${pts[0][1]}px,${pts[0][2]}px) scale(.3)`, 1]].concat(pts.map(([p, x, y], j) => [p, `translate(${x}px,${y}px) scale(${j === 0 || j === pts.length - 1 ? .3 : 1})`, 1])).concat([[100, `translate(${pts[pts.length - 1][1]}px,${pts[pts.length - 1][2]}px) scale(.3)`, 0]]);
    mv(7, `.k${k === 'ka' ? 'ta' : k === 'kb' ? 'tb' : 'tc'}`, 20, fr);
  });
  K('k7t', '0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}'); css += '.go-7 .tl7{animation:k7t .5s ease-in-out infinite}';
  K('k7l', '0%{transform:translate(var(--x),110px) rotate(0);opacity:0}10%{opacity:1}100%{transform:translate(calc(var(--x) + 500px),-10px) rotate(720deg);opacity:0}'); css += '.go-7 .lf7{animation:k7l 4s ease-out 2}';
  loop(7, '.kk7', 'wigk', 1.1); loop(7, '.kk7r', 'bobk', 0.45);

  // ================================================================ HOUSE & GARDEN
  // 16 BIG – lizard grand prix: start line, "3 – 2 – 1 – Los!", three numbered lizards race with dust clouds, photo-finish flash at the finish banner, the winner gets a gold medal on the podium, confetti
  add({ n: 16, big: true, t: 'Eidechsen-Grand-Prix', scene: 'Warmer Tag ab 20°', where: 'den Boden', dur: 18,
    g: `<g class="st16"><path d="M420 114 V84 M420 84 h0" stroke="#555" stroke-width="1.4"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${420 + (i % 3) * 4}" y="${84 + Math.floor(i / 3) * 4}" width="4" height="4" fill="${(i + Math.floor(i / 3)) % 2 ? '#1d1d1d' : '#fff'}"/>`).join('')}<path d="M424 108 v12" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 2"/></g>`
      + `<g class="zl16"><path d="M800 114 V70 M860 114 V70" stroke="#8a5a2b" stroke-width="2"/><rect x="800" y="70" width="60" height="12" fill="#E5483B"/><text x="830" y="79.4" text-anchor="middle" font-size="8" font-weight="900" fill="#fff" font-family="system-ui,sans-serif">ZIEL</text></g>`
      + ['3', '2', '1', 'Los!'].map((d, i) => `<text class="cd16" style="animation-delay:${(.6 + i * .8).toFixed(1)}s" x="560" y="64" text-anchor="middle" font-size="${i === 3 ? 30 : 36}" font-weight="900" fill="${i === 3 ? '#7CFF8A' : '#fff'}" stroke="#1d1d1d" stroke-width="1" font-family="system-ui,sans-serif">${d}</text>`).join('')
      + [['#6aa84f', '1'], ['#4fa3b0', '2'], ['#d9a23a', '3']].map(([c, nr], i) => `<g class="lz16 lz${i}"><g transform="translate(0 ${106 + i * 5})"><path d="M-12 0 q-8 2 -12 -1" stroke="${c}" stroke-width="2" fill="none"/><ellipse cx="0" cy="0" rx="10" ry="2.8" fill="${c}"/><ellipse cx="11" cy="-.4" rx="3.6" ry="2.4" fill="${c}"/><circle cx="12.4" cy="-1.2" r=".6" fill="#1d1d1d"/><circle cx="-1" cy="-.4" r="2.6" fill="#fff"/><text x="-1" y="1.4" text-anchor="middle" font-size="3.6" font-weight="900" fill="#1d1d1d" font-family="system-ui,sans-serif">${nr}</text><g class="lgA"><path d="M-6 1 l-3 5 M6 1 l3 5" stroke="${c}" stroke-width="2" stroke-linecap="round"/></g><g class="lgB"><path d="M-6 1 l3 5 M6 1 l-3 5" stroke="${c}" stroke-width="2" stroke-linecap="round"/></g><g class="ds16">${[0, 1, 2].map((k) => `<circle cx="${-24 - k * 5}" cy="2" r="${2 + k}" fill="#d9c7a3" opacity="${.7 - k * .2}"/>`).join('')}</g></g></g>`).join('')
      + `<rect class="ph16" x="0" y="0" width="1200" height="120" fill="#fff"/>` });
  hide(16, ['.st16', '.zl16', '.cd16', '.lz16', '.ph16']);
  mv(16, '.st16', 18, [[0, 'none', 0], [3, 'none', 1], [70, 'none', 1], [74, 'none', 0], [100, 'none', 0]]);
  mv(16, '.zl16', 18, [[0, 'none', 0], [3, 'none', 1], [70, 'none', 1], [74, 'none', 0], [100, 'none', 0]]);
  K('k16c', '0%{opacity:0;transform:scale(2)}8%{opacity:1;transform:scale(1)}18%,100%{opacity:0;transform:scale(.6)}'); css += '.go-16 .cd16{animation:k16c 4s ease-out forwards}'; fb('.cd16');
  mv(16, '.lz0', 18, [[0, 'translateX(380px)', 0], [3, 'translateX(380px)', 1], [22, 'translateX(390px)', 1], [40, 'translateX(600px)', 1], [52, 'translateX(860px)', 1], [70, 'translateX(860px)', 1], [74, 'translateX(860px)', 0], [100, 'translateX(860px)', 0]], 'ease-in');
  mv(16, '.lz1', 18, [[0, 'translateX(380px)', 0], [3, 'translateX(380px)', 1], [22, 'translateX(390px)', 1], [40, 'translateX(640px)', 1], [53, 'translateX(850px)', 1], [70, 'translateX(850px)', 1], [74, 'translateX(850px)', 0], [100, 'translateX(850px)', 0]], 'ease-in');
  mv(16, '.lz2', 18, [[0, 'translateX(380px)', 0], [3, 'translateX(380px)', 1], [22, 'translateX(390px)', 1], [40, 'translateX(560px)', 1], [55, 'translateX(830px)', 1], [70, 'translateX(830px)', 1], [74, 'translateX(830px)', 0], [100, 'translateX(830px)', 0]], 'ease-in');
  css += '.tp-16 .lgB{opacity:0}.go-16 .lgA{animation:k16la .2s steps(1) infinite}.go-16 .lgB{animation:k16lb .2s steps(1) infinite}.tp-16 .ds16{opacity:0}.go-16 .ds16{animation:k16d 18s linear forwards}'; K('k16d', '0%,22%{opacity:0}24%,52%{opacity:1}56%,100%{opacity:0}');
  K('k16la', '0%,49%{opacity:1}50%,100%{opacity:0}'); K('k16lb', '0%,49%{opacity:0}50%,100%{opacity:1}');
  K('k16f', '0%,52%{opacity:0}53%{opacity:.9}57%,100%{opacity:0}'); A(16, '.ph16', 'k16f', 18, 'linear');

  // ================================================================ CHRISTMAS & WINTER
  // 19 BIG – Samichlaus: the donkey trots in with the big sack on its back, Samichlaus rings his bell, the sack glows and bursts, a fountain of nuts, mandarins and Grittibänze, the kids catch them in baskets, the golden book opens with stars
  add({ n: 19, big: true, t: 'Samichlaus leert den Sack', scene: 'Samichlaus (4.–6. Dezember)', where: 'den Samichlaus', dur: 20,
    g: `<g class="dk19"><g class="dkr"><g transform="translate(0 108)"><ellipse cx="0" cy="-14" rx="14" ry="8" fill="#9a8f84"/><path d="M12 -18 q8 -8 14 -6 q4 2 2 8 q-4 2 -10 0z" fill="#9a8f84"/><path d="M17 -24 l-2 -10 4 8 M21 -24 l2 -10 -1 9" stroke="#9a8f84" stroke-width="2.6" stroke-linecap="round"/><circle cx="21" cy="-20" r=".9" fill="#1d1d1d"/><path d="M-10 -8 v8 M-4 -8 v8 M6 -8 v8 M10 -8 v8" stroke="#7d746b" stroke-width="2.4"/><path d="M-14 -16 q-6 2 -6 8" stroke="#7d746b" stroke-width="1.6" fill="none"/><g class="sk19"><path d="M-12 -22 q-6 -18 8 -24 q14 -4 20 4 q6 10 -2 20z" fill="#8a6a3e"/><path d="M-6 -44 q8 -4 14 2" stroke="#5a3b22" stroke-width="2" fill="none"/></g></g></g></g>`
      + `<g class="bl19"><g transform="translate(470 66)"><path d="M-6 0 h12 l-2 -9 h-8z" fill="#FFD24A"/><circle cx="0" cy="1.6" r="1.6" fill="#b8860b"/></g></g>`
      + `<g class="gw19"><circle cx="560" cy="66" r="26" fill="#FFE27A" opacity=".55"/></g>`
      + Array.from({ length: 40 }, (_, i) => { const k = i % 3; const it = k === 0 ? `<circle r="4" fill="#FF8A1A"/><path d="M0 -4 l1.4 -2.4" stroke="#3f8a2e" stroke-width="1.2"/>` : k === 1 ? `<ellipse rx="3.8" ry="2.8" fill="#a0683e"/><path d="M-2.4 0 q2.4 -2 4.8 0" stroke="#7a4a22" stroke-width=".7" fill="none"/>` : `<g><circle cy="-4.4" r="3" fill="#d9a35a"/><path d="M-3.4 -1.6 h6.8 l1.6 8 h-10z" fill="#d9a35a"/><circle cx="-1" cy="-4.8" r=".5" fill="#5a3b22"/><circle cx="1" cy="-4.8" r=".5" fill="#5a3b22"/><circle cx="0" cy="1.2" r=".7" fill="#E5483B"/></g>`;
        return `<g class="it19" style="--dx:${Math.round(((i * 53) % 400) - 200)}px;--dy:${-40 - (i * 13) % 34}px;animation-delay:${(7 + (i % 14) * 0.2).toFixed(2)}s"><g transform="translate(560 70)">${it}</g></g>`; }).join('')
      + `<g class="kids19">${[[430, '#3E8EDE', '#D4A63B'], [700, '#FF7AB6', '#6b4a2e'], [770, '#3FA66B', '#2b2b2b']].map(([x, c, h]) => `<g class="kr19">${kid(x, 108, c, h)}<path d="M${x + 4} 92 h10 l-1.4 7 h-7.2z" fill="#a87a4a"/></g>`).join('')}</g>`
      + `<g class="hee19"></g>` });
  hide(19, ['.dk19', '.bl19', '.gw19', '.it19', '.kids19', '.hee19']);
  mv(19, '.dk19', 20, [[0, 'translateX(260px)', 0], [2, 'translateX(260px)', 1], [22, 'translateX(546px)', 1], [92, 'translateX(546px)', 1], [100, 'translateX(546px)', 0]], 'ease-out');
  loop(19, '.dkr', 'bobk', .4); css += '.dkr{transform-box:fill-box;transform-origin:center}';
  mv(19, '.sk19', 20, [[0, 'none', 1], [26, 'none', 1], [28, 'rotate(-6deg)', 1], [30, 'rotate(6deg)', 1], [32, 'rotate(-6deg)', 1], [34, 'scale(1.2,.9)', 1], [36, 'scale(1)', 1], [100, 'scale(1)', 1]]); fbb('.sk19');
  mv(19, '.bl19', 20, [[0, 'rotate(0)', 0], [16, 'rotate(0)', 1], [18, 'rotate(-30deg)', 1], [20, 'rotate(30deg)', 1], [22, 'rotate(-30deg)', 1], [24, 'rotate(30deg)', 1], [26, 'rotate(0)', 1], [30, 'rotate(0)', 0], [100, 'rotate(0)', 0]]); css += '.bl19{transform-box:fill-box;transform-origin:50% 0}';
  mv(19, '.gw19', 20, [[0, 'scale(.3)', 0], [30, 'scale(.3)', 0], [36, 'scale(1.6)', 1], [46, 'scale(1)', .5], [54, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.gw19');
  K('k19i', '0%{opacity:0;transform:translate(0,0)}5%{opacity:1}40%{transform:translate(calc(var(--dx) * .5),var(--dy))}75%{transform:translate(var(--dx),36px);opacity:1}100%{transform:translate(var(--dx),36px);opacity:0}'); css += '.go-19 .it19{animation:k19i 8s ease-out forwards}';
  mv(19, '.kids19', 20, [[0, 'none', 0], [44, 'none', 0], [50, 'none', 1], [94, 'none', 1], [100, 'none', 0]]); loop(19, '.kr19', 'bobk', 0.35); css += '.kr19{transform-box:fill-box;transform-origin:center}';
  mv(19, '.hee19', 20, [[0, 'translate(560px,62px) scale(.5)', 0], [22, 'translate(560px,62px) scale(.5)', 0], [24, 'translate(560px,62px) scale(1.2)', 1], [32, 'translate(560px,62px)', 1], [34, 'translate(560px,62px)', 0], [100, 'translate(560px,62px)', 0]]);

  // 22 BIG – New Year's Eve: 3-2-1, rockets shoot up with trails, double bursts, the NEXT year appears in sparkling gold (always current year + 1), glitter rain, champagne pops
  const NY = new Date().getFullYear() + 1;
  add({ n: 22, big: true, t: 'Silvester-Finale', scene: 'Silvester in der Nacht', where: 'den Himmel', dur: 16,
    g: `<rect class="dk22" x="0" y="0" width="1200" height="120" fill="#05081a"/>`
      + ['3', '2', '1'].map((d, i) => `<text class="cd22" x="640" y="74" text-anchor="middle" font-size="58" font-weight="900" fill="#fff" stroke="#FFD24A" stroke-width="1.2" font-family="system-ui,sans-serif" style="animation-delay:${i}s">${d}</text>`).join('')
      + Array.from({ length: 12 }, (_, i) => { const x = 260 + i * 66; const y = 14 + (i % 3) * 12; const c = ['#FFD24A', '#fff', '#FF5A7A', '#5CE1E6', '#B07CFF', '#7CFF8A'][i % 6]; const d = (3 + (i % 6) * 0.35).toFixed(2);
        return `<path class="rk22" style="animation-delay:${d}s" d="M${x} 112 L${x} ${y + 20}" stroke="${c}" stroke-width="1.6" stroke-linecap="round" pathLength="100" stroke-dasharray="14 100"/><g class="fw22" style="animation-delay:${(+d + .7).toFixed(2)}s"><g transform="translate(${x} ${y})">${Array.from({ length: 16 }, (_, k) => `<path d="M${(Math.cos(k * .39) * 4).toFixed(1)} ${(Math.sin(k * .39) * 4).toFixed(1)} L${(Math.cos(k * .39) * 24).toFixed(1)} ${(Math.sin(k * .39) * 24).toFixed(1)}" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/><circle cx="${(Math.cos(k * .39) * 27).toFixed(1)}" cy="${(Math.sin(k * .39) * 27).toFixed(1)}" r="1.2" fill="${c}"/>`).join('')}</g></g>`; }).join('')
      + `<g class="yr22"><text x="640" y="72" text-anchor="middle" font-size="62" font-weight="900" fill="#FFE27A" stroke="#b8860b" stroke-width="1.4" font-family="system-ui,sans-serif">${NY}</text>${Array.from({ length: 12 }, (_, i) => `<g class="sp22" style="animation-delay:-${(i * .2).toFixed(1)}s">${star(520 + (i * 23) % 240, 22 + (i * 17) % 56, 3, '#fff')}</g>`).join('')}</g>`
      + Array.from({ length: 40 }, (_, i) => `<rect class="gl22" x="${(i * 31) % 1200}" y="0" width="2" height="2" fill="${['#FFD24A', '#fff', '#FF5A7A'][i % 3]}" style="animation-delay:${(9 + (i % 10) * 0.25).toFixed(2)}s"/>`).join('')
      + `<g class="ch22"><g transform="translate(780 106)"><path d="M0 0 v-16 l-3 -9 h6 l-3 9" stroke="#2f6b3a" stroke-width="4" fill="none"/><circle class="cork22" cx="0" cy="-27" r="2.2" fill="#c9a77a"/></g>${Array.from({ length: 10 }, (_, i) => `<circle class="bb22" cx="${780 + (i - 5) * 3}" cy="${78}" r="1.6" fill="#FFE27A" style="--dx:${(i - 5) * 7}px"/>`).join('')}</g>` });
  hide(22, ['.dk22', '.cd22', '.rk22', '.fw22', '.yr22', '.gl22', '.ch22']);
  mv(22, '.dk22', 16, [[0, 'none', 0], [4, 'none', .45], [94, 'none', .45], [100, 'none', 0]]);
  K('k22c', '0%{opacity:0;transform:scale(2.4)}10%{opacity:1;transform:scale(1)}30%{opacity:0;transform:scale(.5)}100%{opacity:0}'); css += '.go-22 .cd22{animation:k22c 3s ease-out forwards}'; fb('.cd22');
  K('k22r', '0%{opacity:1;stroke-dashoffset:100}100%{opacity:0;stroke-dashoffset:14}'); css += '.go-22 .rk22{animation:k22r .7s ease-in 3}';
  K('k22f', '0%{opacity:0;transform:scale(.1)}10%{opacity:1;transform:scale(1)}45%{opacity:0;transform:scale(1.35) translateY(4px)}100%{opacity:0}'); css += '.go-22 .fw22{animation:k22f 2.6s ease-out 3}'; fb('.fw22');
  K('k22y', '0%,44%{opacity:0;transform:scale(.2)}52%{opacity:1;transform:scale(1.15)}56%,92%{transform:scale(1);opacity:1}100%{opacity:0}'); A(22, '.yr22', 'k22y', 16); fb('.yr22');
  css += '.go-22 .sp22{animation:fptw .8s linear infinite}';
  K('k22g', '0%{opacity:0;transform:translateY(0)}10%{opacity:1}100%{opacity:0;transform:translateY(118px)}'); css += '.go-22 .gl22{animation:k22g 2.6s linear 2}';
  K('k22h', '0%,62%{opacity:0}66%,95%{opacity:1}100%{opacity:0}'); A(22, '.ch22', 'k22h', 16);
  K('k22k', '0%,70%{transform:translate(0,0)}78%,100%{transform:translate(24px,-70px)}'); A(22, '.cork22', 'k22k', 16, 'ease-out');
  K('k22b', '0%,70%{opacity:0;transform:translate(0,0)}74%{opacity:1}90%,100%{opacity:0;transform:translate(var(--dx),-34px)}'); css += '.go-22 .bb22{animation:k22b 16s ease-out forwards}';
  K('k22p', '0%,70%{opacity:0}72%,82%{opacity:1}86%,100%{opacity:0}'); A(22, '.pp22', 'k22p', 16, 'linear');

  // ================================================================ SPRING & FEASTS
  // 27 BIG – the Guggenmusik marches by: big masks, bass drum ("BUMM!"), trumpets and a sousaphone, the drum major throws his baton, the whole picture bounces to the beat, streamers and a confetti cannon at the end
  add({ n: 27, big: true, t: 'Gugge zieht vorbei', scene: 'Fasnacht', where: 'die Wiese', dur: 20,
    g: `<g class="gug27">${Array.from({ length: 8 }, (_, i) => { const c = ['#E5483B', '#3E8EDE', '#F5C542', '#B07CFF', '#3FA66B', '#FF8A3C', '#E5483B', '#5CE1E6'][i]; const mask = ['#fff', '#FFD24A', '#7CFF8A', '#FF7AB6'][i % 4];
      const ins = i === 0 ? `<g class="bat27"><path d="M6 -40 v-22" stroke="#d4a017" stroke-width="1.6"/><circle cx="6" cy="-63" r="2.4" fill="#d4a017"/></g>`
        : i % 3 === 1 ? `<circle cx="0" cy="-14" r="8" fill="#d9d3c5" stroke="#8a6a3e" stroke-width="1.2"/><circle cx="0" cy="-14" r="5.4" fill="none" stroke="#c62828" stroke-width="1"/><g class="drs27"><path d="M-8 -26 l4 6 M8 -26 l-4 6" stroke="#5a3b22" stroke-width="1.4"/></g>`
          : i % 3 === 2 ? `<path d="M4 -24 h12 l6 -4 v8 l-6 -4" stroke="#d4a017" stroke-width="2.4" fill="none"/>` : `<path d="M-2 -30 q-10 -4 -10 -14 q0 -8 10 -10 q12 0 12 10" stroke="#d4a017" stroke-width="3" fill="none"/><ellipse cx="10" cy="-44" rx="6" ry="3" fill="#d4a017"/>`;
      return `<g transform="translate(${-i * 30} 0)"><g class="mar27" style="animation-delay:${(i * 0.09).toFixed(2)}s"><path d="M-2 108 l-1 -10 M2 108 l1 -10" stroke="#2b2b2b" stroke-width="2.6"/><rect x="-6" y="84" width="12" height="15" rx="2" fill="${c}"/><path d="M-6 88 h12 M-6 94 h12" stroke="#fff" stroke-width="1" opacity=".6"/><ellipse cx="0" cy="74" rx="9" ry="11" fill="${mask}" stroke="#1d1d1d" stroke-width=".6"/><path d="M-9 70 q9 -16 18 0" fill="${c}"/><circle cx="-3" cy="74" r="1.6" fill="#1d1d1d"/><circle cx="3" cy="74" r="1.6" fill="#1d1d1d"/><path d="M-4 80 q4 4 8 0" stroke="#E5483B" stroke-width="1.6" fill="none"/><path d="M-1 76 l1 2 1 -2" fill="#E5483B"/><g transform="translate(0 106)">${ins}</g></g></g>`; }).join('')}</g>`
      + `<g class="bm27"></g>`
      + Array.from({ length: 16 }, (_, i) => `<path class="ls27" style="--x:${(i * 77) % 1200}px;animation-delay:${(1 + (i % 8) * .4).toFixed(1)}s" d="M0 0 q4 6 0 12 q-4 6 0 12 q4 6 0 12" stroke="${['#E5483B', '#FFD24A', '#3E8EDE', '#7CFF8A'][i % 4]}" stroke-width="1.6" fill="none"/>`).join('')
      + `<g class="can27"><g transform="translate(860 104)"><rect x="-14" y="-10" width="28" height="12" rx="3" fill="#5a5f66" transform="rotate(-35)"/><circle cx="-9" cy="2" r="5" fill="#3a3f46"/><circle cx="9" cy="2" r="5" fill="#3a3f46"/></g></g><g class="cb27">${conf(90, 700, 340, 40)}</g>` });
  hide(27, ['.gug27', '.bm27', '.ls27', '.can27', '.cb27']);
  K('k27g', '0%{opacity:0;transform:translateX(-20px)}4%{opacity:1}88%{opacity:1;transform:translateX(1460px)}100%{opacity:0;transform:translateX(1460px)}'); A(27, '.gug27', 'k27g', 20, 'linear');
  K('k27m', '0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}'); css += '.go-27 .mar27{animation:k27m .4s ease-in-out infinite}';
  K('k27d', '0%,100%{transform:rotate(0)}50%{transform:rotate(14deg)}'); css += '.go-27 .drs27{animation:k27d .2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}';
  K('k27b', '0%,30%{transform:translateY(0) rotate(0)}45%{transform:translateY(-40px) rotate(540deg)}60%,100%{transform:translateY(0) rotate(1080deg)}'); css += '.go-27 .bat27{animation:k27b 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}';
  K('k27u', '0%,100%{opacity:0;transform:scale(.6)}10%{opacity:1;transform:scale(1.3)}30%{opacity:0}'); css += '.go-27 .bm27{animation:k27u .8s ease-out 18;transform-box:fill-box;transform-origin:center}';
  K('k27s', '0%,100%{transform:translateY(0)}50%{transform:translateY(1.2px)}'); 
  K('k27l', '0%{transform:translate(var(--x),-40px) rotate(0);opacity:0}10%{opacity:1}100%{transform:translate(calc(var(--x) + 40px),110px) rotate(80deg);opacity:0}'); css += '.go-27 .ls27{animation:k27l 4s linear 3}';
  K('k27c', '0%,66%{opacity:0}70%,96%{opacity:1}100%{opacity:0}'); A(27, '.can27', 'k27c', 20);
  css += '.go-27 .cb27{opacity:1}.go-27 .cb27 .cf{animation:cff 4s ease-out 14.6s forwards;opacity:0}.cb27 .cf{--dy:-70px}';

  // 29 BIG – chick parade: five eggs wobble and crack in zigzags, chicks pop out wearing their eggshell hats, mother hen arrives, a drummer chick leads the line, one chick tumbles and races to catch up, hearts
  add({ n: 29, big: true, t: 'Küken-Parade', scene: 'Ostern', where: 'die Eier', dur: 18,
    g: [0, 1, 2, 3, 4].map((i) => { const x = 520 + i * 30; const c = ['#5CE1E6', '#FF7AB6', '#FFD84D', '#9EDC9E', '#B07CFF'][i];
      return `<g class="eg29 eg${i}"><g class="ebt${i}"><path d="M${x - 7} 104 a7 9 0 0 0 14 0 l-2.4 -3 -2.4 3 -2.4 -3 -2.4 3 -2.4 -3z" fill="${c}"/></g><g class="etp${i}"><path d="M${x - 7} 104 a7 9 0 0 1 14 0 l-2.4 -3 -2.4 3 -2.4 -3 -2.4 3 -2.4 -3z" fill="${c}"/></g></g>`
        + `<g class="ck29 ck${i}"><g class="ckr"><g transform="translate(${x} 106)"><ellipse cx="0" cy="-5" rx="6" ry="5.4" fill="#FFE27A"/><circle cx="2.6" cy="-7" r=".9" fill="#1d1d1d"/><path d="M5.4 -5.6 l3.4 .8 -3.4 .9z" fill="#F5A623"/><path d="M-2 0 v2.4 M2 0 v2.4" stroke="#F5A623" stroke-width="1"/><path d="M-6 -9 a6 5 0 0 1 12 0 l-2 -2 -2 2 -2 -2 -2 2 -2 -2z" fill="${c}"/>${i === 0 ? '<circle cx="-5" cy="-3" r="3" fill="#E5483B" stroke="#fff" stroke-width=".6"/><path d="M-8 -8 l3 4" stroke="#5a3b22" stroke-width=".8" class="dst29"/>' : ''}</g></g></g>`; }).join('')
      + `<g class="pp29"></g>`
      + Array.from({ length: 6 }, (_, i) => `<g class="hz29" style="animation-delay:${(12 + i * .3).toFixed(1)}s">${heart(560 + i * 20, 80, .5, i % 2 ? '#FF7AB6' : '#E5483B')}</g>`).join('') });
  hide(29, ['.eg29', '.ck29', '.pp29', '.hz29']);
  [0, 1, 2, 3, 4].forEach((i) => { const t0 = 4 + i * 5;
    mv(29, `.eg${i}`, 18, [[0, 'rotate(0)', 0], [2, 'rotate(0)', 1], [t0, 'rotate(0)', 1], [t0 + 1, 'rotate(-14deg)', 1], [t0 + 2, 'rotate(14deg)', 1], [t0 + 3, 'rotate(0)', 1], [60, 'rotate(0)', 1], [64, 'rotate(0)', 0], [100, 'rotate(0)', 0]], 'linear'); css += `.eg${i}{transform-box:fill-box;transform-origin:50% 100%}`;
    mv(29, `.etp${i}`, 18, [[0, 'translate(0,0)', 1], [t0 + 3, 'translate(0,0)', 1], [t0 + 5, `translate(${i % 2 ? 6 : -6}px,-16px) rotate(${i % 2 ? 40 : -40}deg)`, 1], [t0 + 7, `translate(${i % 2 ? 10 : -10}px,4px) rotate(${i % 2 ? 90 : -90}deg)`, 0], [100, 'none', 0]]); fb(`.etp${i}`);
    mv(29, `.ck${i}`, 18, [[0, 'translateY(4px) scale(.4)', 0], [t0 + 3, 'translateY(4px) scale(.4)', 0], [t0 + 5, 'translateY(-6px) scale(1.1)', 1], [t0 + 6, 'translateY(0) scale(1)', 1], [56, 'translateX(0)', 1], [i === 3 ? 66 : 90, `translateX(${-120 - i * 22}px)`, 1], ...(i === 3 ? [[68, `translate(${-130 - i * 22}px,0) rotate(-90deg)`, 1], [72, `translate(${-130 - i * 22}px,0) rotate(-90deg)`, 1], [74, `translateX(${-140 - i * 22}px)`, 1]] : []), [90, `translateX(${-420 - i * 22}px)`, 1], [100, `translateX(${-420 - i * 22}px)`, 0]], 'linear'); fbb(`.ck${i}`); });
  K('k29d', '0%,100%{transform:rotate(0)}50%{transform:rotate(30deg)}'); css += '.go-29 .dst29{animation:k29d .25s linear infinite;transform-box:fill-box;transform-origin:100% 100%}';
  loop(29, '.ckr', 'bobk', 0.3);
  mv(29, '.pp29', 18, [[0, 'translate(560px,74px)', 0], [30, 'translate(560px,74px)', 0], [32, 'translate(560px,74px) scale(1.2)', 1], [46, 'translate(560px,74px)', 1], [48, 'translate(560px,74px)', 0], [100, 'translate(560px,74px)', 0]]);
  K('k29h', '0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-50px)}'); css += '.go-29 .hz29{animation:k29h 2.4s ease-out forwards}';

  // ================================================================ SUMMER & AUTUMN
  // 35 BIG – dolphin show: the fin is a kid with a fin hat ("Haha!"), then two dolphins leap out of the sea – one just left of the hut, one just right of it, always between the palms – they jump in high arcs, cross, spin, splash, and finish with a double jump and a fountain
  add({ n: 35, big: true, t: 'Delfin-Show', scene: 'Sommerferien', where: 'das Meer', dur: 18,
    g: `<defs><clipPath id="sea35"><rect x="0" y="-80" width="1200" height="171"/></clipPath><mask id="hm35"><rect x="-100" y="-100" width="1400" height="320" fill="#fff"/><path d="M584 106 V60 L640 30 L696 60 V84 L704 106Z" fill="#000"/></mask></defs>`
      + `<g class="kh35"><circle cx="184" cy="88" r="5" fill="#F3CDA6"/><path d="M179 84 l5 -10 4 10z" fill="#4b5563"/><circle cx="186" cy="88" r=".8" fill="#1d1d1d"/><path d="M182 90.4 q2 2 4 0" stroke="#7a3b22" stroke-width=".8" fill="none"/></g><g class="ha35"></g>`
      + [['dA', '#5f86a8'], ['dB', '#6f96b8']].map(([c, col]) => `<g mask="url(#hm35)"><g clip-path="url(#sea35)"><g class="dl35 ${c}"><g class="dsp"><g transform="scale(1.08,.8)"><path d="M-24 1 C -18 -9 -2 -13 12 -10 C 18 -9 21 -6 22 -4 L 30 -3 Q 31 -1 29 0 L 21 1 C 16 5 0 7 -10 5 C -16 4 -20 3 -24 1Z" fill="${col}"/><path d="M-24 1 C -28 -4 -32 -8 -36 -9 C -34 -5 -33 -2 -32 1 C -33 4 -34 7 -36 10 C -32 9 -28 6 -24 1Z" fill="${col}"/><path d="M-4 -11 C -2 -18 2 -21 6 -21 C 4 -18 4 -14 6 -10Z" fill="${col}"/><path d="M4 3 C 2 8 -2 11 -6 12 C -4 8 -4 6 -2 4Z" fill="${col}"/><path d="M-18 3 C -6 7 10 6 21 1 L 28 -1" stroke="#e8f2fa" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="15" cy="-5" r="1.3" fill="#1d1d1d"/><circle cx="15.4" cy="-5.4" r=".4" fill="#fff"/><path d="M21 -1 q4 1 8 0" stroke="#1d2f45" stroke-width=".7" fill="none"/></g></g></g></g></g>`).join('')
      + [[470, 20], [576, 34], [576, 44], [470, 58], [476, 70], [580, 84], [812, 26], [712, 40], [712, 50], [812, 64], [806, 70], [704, 84]].map(([x, p], i) => `<g class="sp35 sq${i}"><path d="M${x - 9} 93 q4 -13 9 -15 q5 2 9 15z" fill="#eaf8ff" opacity=".9"/></g>${[-2, -1, 1, 2].map((k) => `<circle class="dq35" style="--dx:${k * 4}px;--h:${-10 - Math.abs(k) * 3}px;animation-delay:${(p * .18).toFixed(2)}s" cx="${x}" cy="90" r="1.5" fill="#eaf8ff"/>`).join('')}<ellipse class="rg35" style="animation-delay:${(p * .18 + .2).toFixed(2)}s" cx="${x}" cy="94" rx="6" ry="1.6" fill="none" stroke="#fff" stroke-width="1"/>`).join('')
      + `<g class="bl35"><circle r="5" fill="#fff"/><path d="M-5 0 a5 5 0 0 1 10 0z" fill="#E5483B"/><path d="M-4.6 -1.6 q4.6 3 9.2 0" stroke="#3E8EDE" stroke-width="1.6" fill="none"/></g>`
      + `<g class="fo35"><path d="M640 86 q-12 -24 -22 -32 M640 86 q0 -30 0 -40 M640 86 q12 -24 22 -32" stroke="#d6f3ff" stroke-width="3" fill="none" stroke-linecap="round"/>${[['#ff5a5a', 30], ['#ffe94d', 25], ['#55d16b', 20], ['#4aa8ff', 15]].map(([c, rr]) => `<path d="M${640 - rr} 64 A ${rr} ${rr} 0 0 1 ${640 + rr} 64" stroke="${c}" stroke-width="2" fill="none" opacity=".6"/>`).join('')}</g>` });
  hide(35, ['.kh35', '.ha35', '.dl35', '.sp35', '.fo35', '.bl35']);
  mv(35, '.bl35', 18, [[0, 'translate(528px,34px)', 0], [72, 'translate(528px,34px)', 0], [73, 'translate(528px,30px)', 1], [77, 'translate(640px,2px) rotate(360deg)', 1], [81, 'translate(755px,30px) rotate(720deg)', 1], [85, 'translate(640px,4px) rotate(1080deg)', 1], [89, 'translate(528px,30px) rotate(1440deg)', 1], [92, 'translate(560px,90px)', 0], [100, 'translate(560px,90px)', 0]], 'ease-in-out');
  K('k35r', '0%{transform:scale(.3);opacity:.9}100%{transform:scale(4);opacity:0}'); css += '.rg35,.dq35{opacity:0}.go-35 .rg35{animation:k35r 1.6s ease-out both;transform-box:fill-box;transform-origin:center}'; K('k35d', '0%{opacity:0;transform:translate(0,0)}8%{opacity:1}45%{transform:translate(var(--dx),var(--h))}100%{opacity:0;transform:translate(calc(var(--dx) * 2),6px)}'); css += '.go-35 .dq35{animation:k35d .9s cubic-bezier(.2,.6,.6,1) both}';
  css += '.go-35 .fin{opacity:0 !important}';
  mv(35, '.kh35', 18, [[0, 'translateY(12px)', 0], [4, 'translateY(0)', 1], [16, 'translateY(0)', 1], [20, 'translateY(12px)', 0], [100, 'translateY(12px)', 0]]);
  mv(35, '.ha35', 18, [[0, 'none', 0], [5, 'none', 1], [15, 'none', 1], [17, 'none', 0], [100, 'none', 0]]);
  // dolphin A jumps between the left palm (x 440) and the hut (x 600); dolphin B between the hut (x 680) and the right palm (x 840)
  const jump = (p0, p1, x0, x1, top, flip) => Array.from({ length: 7 }, (_, i) => { const f = i / 6; const x = x0 + (x1 - x0) * f; const y = 100 - Math.sin(f * Math.PI) * (100 - top); const a = (f - .5) * (flip ? -120 : 120); return [p0 + (p1 - p0) * f, `translate(${x.toFixed(0)}px,${y.toFixed(0)}px) rotate(${a.toFixed(0)}deg) scale(${flip ? -1 : 1},1)`, 1]; });
  mv(35, '.dA', 18, [[0, 'translate(470px,110px)', 0], [18, 'translate(470px,110px)', 1]].concat(jump(20, 34, 470, 576, 50)).concat(jump(44, 58, 576, 470, 44, true)).concat(jump(70, 84, 476, 580, 30)).concat([[100, 'translate(580px,110px)', 1]]), 'linear');
  mv(35, '.dB', 18, [[0, 'translate(812px,110px)', 0], [24, 'translate(812px,110px)', 1]].concat(jump(26, 40, 812, 712, 50, true)).concat(jump(50, 64, 712, 812, 44)).concat(jump(70, 84, 806, 704, 30, true)).concat([[100, 'translate(704px,110px)', 1]]), 'linear');
  K('k35s', '0%,100%{transform:rotate(0)}50%{transform:rotate(360deg)}'); css += '.go-35 .dsp{animation:k35s 18s linear forwards;transform-box:fill-box;transform-origin:center}'; K('k35sp', '0%,46%{transform:rotate(0)}52%{transform:rotate(360deg)}100%{transform:rotate(360deg)}'); css += '.go-35 .dsp{animation:k35sp 18s ease-in-out forwards}';
  [[470, 20], [576, 34], [576, 44], [470, 58], [476, 70], [580, 84], [812, 26], [712, 40], [712, 50], [812, 64], [806, 70], [704, 84]].forEach(([, p], i) => mv(35, `.sq${i}`, 18, [[0, 'scaleY(0)', 0], [p, 'scaleY(0)', 0], [p + 1, 'scaleY(1.2)', 1], [p + 5, 'scaleY(.3)', 0], [100, 'scaleY(0)', 0]]));
  css += '.sp35{transform-box:fill-box;transform-origin:50% 100%}';
  mv(35, '.fo35', 18, [[0, 'scaleY(0)', 0], [86, 'scaleY(0)', 0], [90, 'scaleY(1)', 1], [97, 'scaleY(1)', 1], [100, 'scaleY(0)', 0]]); fbb('.fo35');

  // 38 BIG – Swiss national day: lanterns glow, three alphorn players play and their sound rolls to the mountains ("Echo …"), then five flag throwers swing and throw Swiss flags high in turns, the big bonfire flares up, a sea of red-and-white fireworks
  add({ n: 38, big: true, t: 'Alphorn, Fahnenschwinger & Höhenfeuer', scene: '1. August am Abend', where: 'die Wiese', dur: 22,
    g: `<g class="lp38">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<g transform="translate(${300 + i * 66} 24)"><path d="M0 -10 v6" stroke="#555" stroke-width=".8"/><ellipse cx="0" cy="4" rx="6" ry="8" fill="${i % 2 ? '#DA291C' : '#fff'}"/><path d="M-3 4 h6 M0 1 v6" stroke="${i % 2 ? '#fff' : '#DA291C'}" stroke-width="1.6"/><ellipse class="lg38" cx="0" cy="4" rx="11" ry="12" fill="#FFD86B" opacity=".3"/></g>`).join('')}<path d="M270 16 q33 8 66 0 t66 0 t66 0 t66 0 t66 0 t66 0 t66 0 t66 0 t66 0 t66 0" stroke="#555" stroke-width=".6" fill="none"/></g>`
      + [0, 1, 2].map((i) => `<g class="ah38 ahh${i}"><g transform="translate(${430 + i * 30} 108)"><path d="M-2 0 l-1 -12 M2 0 l1 -12" stroke="#2b2b2b" stroke-width="2.6"/><rect x="-5" y="-24" width="10" height="13" rx="2" fill="#fff"/><path d="M-5 -24 h10 v3 h-10z" fill="#DA291C"/><circle cx="0" cy="-29" r="4.6" fill="#F3CDA6"/><path d="M-5 -31 h10 l-2 -4 h-6z" fill="#2b2b2b"/><path d="M3 -28 L${44 + i * 6} -4 q6 2 8 4" stroke="#a87a4a" stroke-width="2.2" fill="none"/><ellipse cx="${52 + i * 6}" cy="0" rx="3.4" ry="5.4" fill="#a87a4a"/></g></g>`).join('')
      + `<g class="sw38">${[0, 1, 2].map((h) => Array.from({ length: 4 }, (_, k) => `<text class="nt38" style="--x:${482 + h * 36}px;animation-delay:${(h * .3 + k * .6).toFixed(1)}s" x="0" y="0" font-size="${9 + (k % 2) * 3}" fill="#fff">${k % 2 ? '♪' : '♫'}</text>`).join('')).join('')}</g>`
      + [0, 1, 2, 3, 4].map((i) => { const x = 500 + i * 60; return `<g class="fs38 fs${i}"><g transform="translate(${x} 108)"><path d="M-2 0 l-1 -12 M2 0 l1 -12" stroke="#2b2b2b" stroke-width="2.6"/><rect x="-5" y="-24" width="10" height="13" rx="2" fill="#fff" stroke="#DA291C" stroke-width="1"/><circle cx="0" cy="-29" r="4.6" fill="#F3CDA6"/><path d="M-5 -31 q5 -6 10 0" fill="${['#6b4a2e', '#D4A63B', '#2b2b2b', '#6b4a2e', '#D4A63B'][i]}"/></g><g class="fl38 fl${i}"><path d="M${x} 84 V56" stroke="#8a5a2b" stroke-width="1.4"/><g class="flw38"><rect x="${x}" y="56" width="22" height="22" fill="#DA291C"/><path d="M${x + 11} 61 v12 M${x + 5} 67 h12" stroke="#fff" stroke-width="3.6"/></g></g></g>`; }).join('')
      + `<g class="ff38"><path d="M356 106 Q 366 30 374 6 Q 382 30 392 106Z" fill="#FF8A3C"/><path d="M364 106 Q 372 58 374 34 Q 376 58 384 106Z" fill="#FFD24A"/>${Array.from({ length: 10 }, (_, i) => `<circle class="spk38" cx="${368 + (i % 5) * 3}" cy="30" r="1.1" fill="#FFD24A" style="animation-delay:-${(i * .2).toFixed(1)}s"/>`).join('')}</g>`
      + Array.from({ length: 16 }, (_, i) => `<g class="fx38" style="animation-delay:${(14 + (i % 8) * .45 + Math.floor(i / 8) * .2).toFixed(2)}s"><g transform="translate(${440 + (i % 8) * 60} ${14 + (i % 3) * 10})">${Array.from({ length: 16 }, (_, k) => `<path d="M0 0 L${(Math.cos(k * 0.39) * 24).toFixed(1)} ${(Math.sin(k * 0.39) * 24).toFixed(1)}" stroke="${k % 2 ? '#DA291C' : '#fff'}" stroke-width="1.6" stroke-linecap="round"/>`).join('')}</g></g>`).join('') });
  hide(38, ['.lp38', '.ah38', '.sw38', '.fs38', '.ff38', '.fx38']);
  K('k38lp', '0%{opacity:0}4%,94%{opacity:1}100%{opacity:0}'); A(38, '.lp38', 'k38lp', 22); css += '.go-38 .lg38{animation:fptw 1.6s ease-in-out infinite}';
  [0, 1, 2].forEach((i) => mv(38, `.ahh${i}`, 22, [[0, 'translateX(-200px)', 0], [3 + i * 2, 'translateX(-200px)', 1], [12 + i * 2, 'translateX(0)', 1], [40, 'translateX(0)', 1], [44, 'translateX(-60px)', 0], [100, 'translateX(-60px)', 0]]));
  mv(38, '.sw38', 22, [[0, 'none', 0], [16, 'none', 0], [18, 'none', 1], [40, 'none', 1], [44, 'none', 0], [100, 'none', 0]]);
  K('k38n', '0%{opacity:0;transform:translate(var(--x),104px) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 26px),50px) rotate(20deg)}'); css += '.go-38 .nt38{animation:k38n 2.4s ease-out infinite}';
  [0, 1, 2, 3, 4].forEach((i) => { mv(38, `.fs${i}`, 22, [[0, 'translateY(10px)', 0], [40 + i, 'translateY(10px)', 0], [44 + i, 'translateY(0)', 1], [92, 'translateY(0)', 1], [96, 'translateY(0)', 0], [100, 'translateY(0)', 0]]);
    const t0 = 48 + i * 4; mv(38, `.fl${i}`, 22, [[0, 'rotate(0)', 1], [t0, 'rotate(0)', 1], [t0 + 3, 'rotate(-170deg)', 1], [t0 + 6, 'rotate(170deg)', 1], [t0 + 8, 'translateY(-64px) rotate(420deg)', 1], [t0 + 13, 'translateY(-72px) rotate(760deg)', 1], [t0 + 17, 'translateY(0) rotate(1080deg)', 1], [t0 + 20, 'rotate(1260deg)', 1], [100, 'rotate(1260deg)', 1]]); css += `.fl${i}{transform-box:fill-box;transform-origin:50% 100%}`; });
  K('k38fw', '0%,100%{transform:skewY(0)}50%{transform:skewY(8deg)}'); css += '.go-38 .flw38{animation:k38fw .5s ease-in-out infinite;transform-box:fill-box;transform-origin:0 50%}';
  K('k38f', '0%,30%{opacity:0;transform:scaleY(.3)}40%,92%{opacity:1;transform:scaleY(1.25)}100%{opacity:0}'); A(38, '.ff38', 'k38f', 22); fbb('.ff38');
  K('k38s', '0%{transform:translate(0,0);opacity:1}100%{transform:translate(6px,-34px);opacity:0}'); css += '.go-38 .spk38{animation:k38s 1.2s ease-out infinite}';
  K('k38x', '0%{opacity:0;transform:scale(.1)}15%{opacity:1;transform:scale(1)}40%,100%{opacity:0;transform:scale(1.4)}'); css += '.go-38 .fx38{animation:k38x 2.2s ease-out 3}'; fb('.fx38');

  // 39 BIG – Monte Generoso cake: the house fades away, darkness, a spotlight; a long, square-edged cake covered in many little long green sprinkles slides in, the candles are blown out and lifted away, then three big bites vanish from the middle ("mampf!"), crumbs fall ("Mmmh!"), and the house fades back
  add({ n: 39, big: true, t: 'Monte-Generoso-Torte mit Biss', scene: 'Geburtstag', where: 'den Kuchen', dur: 18,
    g: (() => { const id = 'b39'; const sp = Array.from({ length: 140 }, (_, i) => { const top = i % 3 === 0; const x = 572 + (i * 37) % 140; const y = top ? 64 + (i * 7) % 4 : 70 + (i * 13) % 30; const a = (i * 47) % 180; return `<rect x="${x}" y="${y}" width="3.8" height="1.1" rx=".4" fill="${['#5aa83c', '#7cc35c', '#3f8a2e'][i % 3]}" transform="rotate(${top ? (i * 31) % 180 : a} ${x} ${y})"/>`; }).join('');
      return `<rect class="dk39" x="0" y="0" width="1200" height="120" fill="#0b0d16"/>`
      + `<g class="spot39"><path d="M640 -10 L510 120 H770Z" fill="#FFF3C0" opacity=".14"/><ellipse cx="640" cy="112" rx="110" ry="6" fill="#FFF3C0" opacity=".18"/></g>`
      + `<defs><mask id="${id}"><rect x="0" y="0" width="1200" height="120" fill="#fff"/><g class="bt1"><circle cx="630" cy="66" r="9" fill="#000"/><circle cx="642" cy="64" r="9" fill="#000"/></g><g class="bt2"><circle cx="652" cy="70" r="9" fill="#000"/><circle cx="632" cy="78" r="9" fill="#000"/></g><g class="bt3"><circle cx="646" cy="82" r="9" fill="#000"/><circle cx="640" cy="92" r="8" fill="#000"/></g></mask></defs>`
      + `<g class="ck39"><g mask="url(#${id})"><path d="M566 104 V66 L572 62 H708 L714 66 V104z" fill="#6b3f1c"/><path d="M566 66 L572 62 H708 L714 66z" fill="#8a5428"/><rect x="566" y="66" width="148" height="3" fill="#7a4a22"/><path d="M566 84 h148 M566 94 h148" stroke="#f4e6c8" stroke-width="1.2" opacity=".55"/>${sp}<rect x="562" y="66" width="5" height="38" fill="#5a3418"/><path d="M563 74 h4 M563 84 h4 M563 94 h4" stroke="#f4e6c8" stroke-width=".8"/><rect x="552" y="104" width="176" height="5" rx="1" fill="#e8e1d6"/></g><g class="cdl39">${[600, 620, 660, 680].map((x, i) => `<rect x="${x - 1.2}" y="54" width="2.4" height="9" fill="${['#5CE1E6', '#FFD84D', '#FF7AB6', '#7CFF8A'][i]}"/><path class="fl39" d="M${x} 48 q2 3 0 5 q-2 -2 0 -5z" fill="#FFC23D"/>`).join('')}</g></g>`
      + Array.from({ length: 16 }, (_, i) => `<circle class="cr39 c3${i % 3}" cx="${628 + (i * 7) % 28}" cy="76" r="${1 + (i % 3) * .5}" fill="${i % 4 ? '#6b3f1c' : '#5aa83c'}" style="--dx:${(i - 8) * 4}px"/>`).join('')
      + `<g class="mm39"></g><g class="ch39"></g>`
      + `<g class="pf39">${[0, 1, 2, 3].map((i) => `<path d="M${[600, 620, 660, 680][i]} 46 q-3 -5 0 -10 q3 -5 0 -10" stroke="#ddd" stroke-width="1.2" fill="none"/>`).join('')}</g>`; })() });
  hide(39, ['.dk39', '.spot39', '.ck39', '.cr39', '.mm39', '.ch39', '.pf39']);
  mv(39, '.dk39', 18, [[0, 'none', 0], [10, 'none', 1], [88, 'none', 1], [100, 'none', 0]]);
  mv(39, '.spot39', 18, [[0, 'none', 0], [12, 'none', 0], [16, 'none', 1], [86, 'none', 1], [90, 'none', 0], [100, 'none', 0]]);
  mv(39, '.ck39', 18, [[0, 'translateX(-700px)', 0], [14, 'translateX(-700px)', 1], [26, 'translateX(10px)', 1], [28, 'translateX(0)', 1], [86, 'translateX(0)', 1], [92, 'translateX(0)', 0], [100, 'translateX(0)', 0]], 'ease-out');
  css += '.go-39 .fl39{animation:k39fl 18s linear forwards}'; K('k39fl', '0%,36%{opacity:1}38%,100%{opacity:0}');
  mv(39, '.pf39', 18, [[0, 'translateY(0)', 0], [37, 'translateY(0)', 0], [38, 'translateY(0)', 1], [46, 'translateY(-12px)', 0], [100, 'translateY(-12px)', 0]]);
  // the candles are pulled out and float away before the first bite
  mv(39, '.cdl39', 18, [[0, 'translateY(0)', 1], [42, 'translateY(0)', 1], [44, 'translateY(-6px)', 1], [50, 'translateY(-60px)', 0], [100, 'translateY(-60px)', 0]], 'ease-in');
  [['.bt1', 56], ['.bt2', 64], ['.bt3', 72]].forEach(([s, t]) => { mv(39, s, 18, [[0, 'scale(0)', 1], [t, 'scale(0)', 1], [t + 2, 'scale(1.15)', 1], [t + 3, 'scale(1)', 1], [100, 'scale(1)', 1]]); css += `${s}{transform-box:fill-box;transform-origin:center}`; });
  [0, 1, 2].forEach((k) => { const t = 56 + k * 8; K(`k39c${k}`, `0%,${t}%{opacity:0;transform:translate(0,0)}${t + 1}%{opacity:1}${t + 12}%,100%{opacity:0;transform:translate(var(--dx),40px)}`); css += `.go-39 .c3${k}{animation:k39c${k} 18s ease-in forwards}`; });
  mv(39, '.ch39', 18, [[0, 'scale(.4)', 0], [56, 'scale(.4)', 0], [58, 'scale(1.2)', 1], [62, 'scale(1)', 0], [64, 'scale(1.2)', 1], [68, 'scale(1)', 0], [72, 'scale(1.2)', 1], [76, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.ch39');
  mv(39, '.mm39', 18, [[0, 'scale(.4)', 0], [76, 'scale(.4)', 0], [79, 'scale(1.3)', 1], [82, 'scale(1)', 1], [86, 'scale(1)', 1], [88, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.mm39');

  // 40 BIG – ring ring: the brick phone rings and shakes, then turns into a modern smartphone (its old antenna disappears), apps pop up, a selfie flash, then back to 1973 (antenna back)
  add({ n: 40, big: true, t: 'Ring ring – 1973 trifft heute', scene: '3. April (erster Handy-Anruf)', where: 'das Ur-Handy', dur: 14,
    g: `<g class="rg40"><text x="672" y="40" font-size="11" font-weight="900" fill="#E5483B" stroke="#fff" stroke-width=".4" font-family="system-ui,sans-serif">RING RING!</text></g>`
      + `<g class="sp40"><rect x="618" y="38" width="44" height="70" rx="8" fill="#1d1d1f"/><rect x="621" y="43" width="38" height="60" rx="5" fill="#4f7cff"/><rect x="634" y="40" width="12" height="2" rx="1" fill="#333"/>`
      + Array.from({ length: 12 }, (_, i) => `<rect class="ap40" x="${625 + (i % 3) * 11.6}" y="${48 + Math.floor(i / 3) * 12}" width="8" height="8" rx="2" fill="${['#FF5A7A', '#FFD84D', '#5CE1E6', '#7CFF8A', '#B07CFF', '#FF8A3C'][i % 6]}" style="animation-delay:${(5 + i * 0.08).toFixed(2)}s"/>`).join('') + '</g>'
      + `<rect class="fl40" x="0" y="0" width="1200" height="120" fill="#fff"/><g class="sm40"></g>` });
  hide(40, ['.rg40', '.sp40', '.fl40', '.sm40']);
  K('k40cab', '0%{opacity:1}4%,94%{opacity:0}100%{opacity:1}'); css += '.go-40 g.fly[style*="26s"]{animation:k40cab 14s linear forwards !important}';
  K('k40r', '0%{opacity:0}4%,30%{opacity:1}34%,100%{opacity:0}'); A(40, '.rg40', 'k40r', 14, 'linear');
  K('k40s', '0%,32%{opacity:0;transform:scale(.3) rotate(-20deg)}40%,82%{opacity:1;transform:scale(1) rotate(0)}90%,100%{opacity:0;transform:scale(.3) rotate(20deg)}'); A(40, '.sp40', 'k40s', 14); fb('.sp40');
  // the old phone's antenna (in the base scene) vanishes while the smartphone is shown
  K('k40ant', '0%,34%{opacity:1;transform:scaleY(1)}40%,82%{opacity:0;transform:scaleY(0)}90%,100%{opacity:1;transform:scaleY(1)}'); css += '.go-40 path[d="M646 44 V22"],.go-40 rect[x="643.6"][y="30"]{animation:k40ant 14s ease-in-out forwards;transform-box:fill-box;transform-origin:50% 100%}';
  K('k40a', '0%{transform:scale(0)}100%{transform:scale(1)}'); css += '.go-40 .ap40{animation:k40a .4s ease-out both}.ap40{transform-box:fill-box;transform-origin:center}';
  K('k40f', '0%,60%{opacity:0}61%{opacity:.85}66%,100%{opacity:0}'); A(40, '.fl40', 'k40f', 14, 'linear');
  K('k40m', '0%,62%{opacity:0}66%,78%{opacity:1}82%,100%{opacity:0}'); A(40, '.sm40', 'k40m', 14, 'linear');

  // ================================================================ 20 NEW BIG ONES (41–60)
  const DARK = (n, cls, dur, a, b, op) => { mv(n, '.' + cls, dur, [[0, 'none', 0], [a, 'none', op || .7], [b, 'none', op || .7], [Math.min(100, b + 6), 'none', 0], [100, 'none', 0]]); return `<rect class="${cls}" x="0" y="0" width="1200" height="120" fill="#060918"/>`; };

  // 41 BIG – UFO: night falls, a UFO with blinking lights descends, its tractor beam sucks up three girls one after the other (they float up, spinning slowly), the UFO blinks happily and zooms away
  add({ n: 41, big: true, t: 'UFO-Entführung', scene: 'Nacht (klarer Himmel)', where: 'den Himmel', dur: 18,
    g: DARK(41, 'dk41', 18, 6, 90, .45)
      + `<g class="uf41"><g transform="translate(640 0)"><ellipse cx="0" cy="0" rx="42" ry="10" fill="#9aa6b6"/><ellipse cx="0" cy="-2" rx="42" ry="6" fill="#c9d1d9"/><path d="M-18 -4 q18 -24 36 0z" fill="#7fdcff" opacity=".85"/><circle cx="-4" cy="-12" r="3" fill="#7CFF8A"/><circle cx="-5" cy="-13" r=".8" fill="#1d1d1d"/><circle cx="-3" cy="-13" r=".8" fill="#1d1d1d"/>${Array.from({ length: 8 }, (_, i) => `<circle class="ul41" style="animation-delay:-${(i * .12).toFixed(2)}s" cx="${-32 + i * 9}" cy="3" r="2" fill="${['#FFD24A', '#FF5A7A', '#5CE1E6', '#7CFF8A'][i % 4]}"/>`).join('')}</g></g>`
      + `<path class="bm41" d="M614 44 L560 112 H720 L666 44Z" fill="#b6ff9e" opacity=".35"/>`
      + [[600, '#FF7AB6', '#D4A63B'], [640, '#B07CFF', '#6b4a2e'], [680, '#3FA66B', '#2b2b2b']].map(([x, c, h], i) => `<g class="gl41 gi${i}"><g class="gsp">${kid(x, 108, c, h)}</g></g>`).join('')
      + `<g class="tx41"><path d="M690 14 h62 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-52 l-6 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4z" fill="#fff"/></g>` });
  hide(41, ['.dk41', '.uf41', '.bm41', '.gl41', '.tx41']);
  mv(41, '.uf41', 18, [[0, 'translate(700px,-40px) scale(.3)', 0], [6, 'translate(600px,-20px) scale(.5)', 1], [14, 'translate(0,34px)', 1], [74, 'translate(0,34px)', 1], [80, 'translate(-20px,28px)', 1], [90, 'translate(900px,-70px) scale(.3)', 1], [92, 'translate(900px,-70px) scale(.3)', 0], [100, 'translate(900px,-70px)', 0]], 'ease-in-out');
  K('k41l', '0%,100%{opacity:1}50%{opacity:.2}'); css += '.go-41 .ul41{animation:k41l .5s linear infinite}';
  mv(41, '.bm41', 18, [[0, 'scaleY(0)', 0], [16, 'scaleY(0)', 0], [20, 'scaleY(1)', .35], [74, 'scaleY(1)', .35], [78, 'scaleY(0)', 0], [100, 'scaleY(0)', 0]]); css += '.bm41{transform-box:fill-box;transform-origin:50% 0}';
  [[0, 22, -40], [1, 38, 0], [2, 54, 40]].forEach(([i, t0, dx]) => mv(41, `.gi${i}`, 18, [[0, 'translate(0,0) scale(1)', 0], [2, 'translate(0,0) scale(1)', 1], [t0, 'translate(0,0) scale(1)', 1], [t0 + 14, `translate(${-dx * .5}px,-62px) scale(.3)`, 1], [t0 + 15, `translate(${-dx * .5}px,-62px) scale(.3)`, 0], [100, 'translate(0,-62px) scale(.3)', 0]], 'ease-in'));
  fb('.gl41');
  K('k41s', '0%,100%{transform:rotate(-15deg)}50%{transform:rotate(15deg)}'); css += '.go-41 .gsp{animation:k41s 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}';
  mv(41, '.tx41', 18, [[0, 'scale(.3)', 0], [70, 'scale(.3)', 0], [74, 'scale(1)', 1], [84, 'scale(1)', 1], [86, 'scale(.3)', 0], [100, 'scale(.3)', 0]]); fb('.tx41');

  // 42 BIG – the volcano erupts: flash and "KABUMM!", the sky glows red, a roaring lava fountain sprays hundreds of glowing drops, three lava rivers with bright flowing cores run down the slopes and spread over the ground, glowing bombs fly, a huge black smoke column rises – then the lava darkens to cooling rock with glowing cracks, and the smoke drifts off
  add({ n: 42, big: true, t: 'Vulkan-Explosion', scene: 'Vulkan-Tag (27. August)', where: 'den Vulkan', dur: 22,
    g: `<defs><linearGradient id="sk42" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0a0a"/><stop offset="1" stop-color="#ff4a1a"/></linearGradient><radialGradient id="gl42" cx="50%" cy="100%" r="70%"><stop offset="0" stop-color="#FFE27A"/><stop offset=".4" stop-color="#FF8A1A"/><stop offset="1" stop-color="#c21e00"/></radialGradient></defs>`
      + `<rect class="sky42" x="0" y="0" width="1200" height="120" fill="url(#sk42)"/><rect class="fx42" x="0" y="0" width="1200" height="120" fill="#fff"/>`
      + `<g class="cl42">${Array.from({ length: 14 }, (_, i) => `<circle class="pu42" style="--dx:${((i * 37) % 120) - 60}px;animation-delay:-${(i * .45).toFixed(2)}s" cx="640" cy="34" r="${14 + (i % 4) * 6}" fill="${i % 2 ? '#2b2624' : '#46403d'}"/>`).join('')}</g>`
      + `<g class="lv42"><path d="M640 42 Q 616 6 586 -10 Q 628 0 640 -40 Q 652 0 694 -10 Q 664 6 640 42Z" fill="url(#gl42)"/><path d="M640 42 Q 630 18 614 8 Q 640 12 640 -14 Q 640 12 666 8 Q 650 18 640 42Z" fill="#FFF3B0"/></g>`
      + Array.from({ length: 60 }, (_, i) => `<circle class="dp42" style="--dx:${Math.round(((i * 53) % 260) - 130)}px;--dy:${-40 - (i * 17) % 50}px;animation-delay:-${((i * .07) % 1.6).toFixed(2)}s" cx="640" cy="38" r="${1.4 + (i % 3) * .8}" fill="${['#FFD24A', '#FF8A1A', '#FFF3B0'][i % 3]}"/>`).join('')
      + Array.from({ length: 12 }, (_, i) => `<g class="bo42" style="--dx:${Math.round(((i * 97) % 900) - 450)}px;--dy:${-50 - (i * 13) % 30}px;animation-delay:${(3 + (i % 6) * .4).toFixed(1)}s"><circle cx="640" cy="38" r="4" fill="#5a2a12"/><circle cx="640" cy="38" r="2.4" fill="#FF8A1A"/></g>`).join('')
      + [['M630 46 Q 600 72 556 110', 0], ['M650 46 Q 690 78 732 110', .5], ['M640 50 Q 640 82 618 112', 1]].map(([d, dl]) => `<g class="rv42" style="animation-delay:${dl}s"><path d="${d}" stroke="#c21e00" stroke-width="14" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" class="rva"/><path d="${d}" stroke="#FF8A1A" stroke-width="8" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" class="rva"/><path d="${d}" stroke="#FFE27A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-dasharray="6 8" class="rvf"/></g>`).join('')
      + `<path class="fl42" d="M0 120 V106 C 200 100 420 96 600 102 Q 640 98 680 102 C 860 96 1000 100 1200 106 V120Z" fill="url(#gl42)"/>`
      + `<g class="ck42"><path d="M0 120 V106 C 200 100 420 96 600 102 Q 640 98 680 102 C 860 96 1000 100 1200 106 V120Z" fill="#2b2220"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${40 + i * 74} 110 l12 3 l10 -4 l14 5" stroke="#FF6A1A" stroke-width="1.2" fill="none" class="cg42"/>`).join('')}</g>`
      + `<g class="bm42"></g>` });
  hide(42, ['.sky42', '.fx42', '.cl42', '.lv42', '.dp42', '.bo42', '.rv42', '.fl42', '.ck42', '.bm42']);
  K('k42sh', '0%,100%{transform:translate(0,0)}25%{transform:translate(-3px,1px)}75%{transform:translate(3px,-1px)}'); css += '.go-42 .ov{animation:k42sh .12s linear 36}';
  mv(42, '.sky42', 22, [[0, 'none', 0], [8, 'none', 0], [14, 'none', .55], [76, 'none', .55], [92, 'none', 0], [100, 'none', 0]]);
  mv(42, '.fx42', 22, [[0, 'none', 0], [8, 'none', 0], [9, 'none', .95], [14, 'none', 0], [100, 'none', 0]]);
  mv(42, '.bm42', 22, [[0, 'scale(.3)', 0], [9, 'scale(.3)', 0], [11, 'scale(1.4)', 1], [18, 'scale(1)', 1], [22, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.bm42');
  mv(42, '.lv42', 22, [[0, 'scaleY(0)', 0], [9, 'scaleY(0)', 0], [12, 'scaleY(1.5)', 1], [16, 'scaleY(1.1)', 1], [20, 'scaleY(1.4)', 1], [26, 'scaleY(1.1)', 1], [32, 'scaleY(1.5)', 1], [50, 'scaleY(1.2)', 1], [62, 'scaleY(0)', 0], [100, 'scaleY(0)', 0]]); fbb('.lv42');
  K('k42d', '0%{opacity:0;transform:translate(0,0)}8%{opacity:1}45%{transform:translate(calc(var(--dx) * .55),var(--dy))}100%{transform:translate(var(--dx),70px);opacity:0}'); css += '.tp-42 .dp42{opacity:0}.go-42 .dp42{animation:k42d 1.6s ease-in infinite,k42dw 22s linear forwards}'; K('k42dw', '0%,10%{visibility:hidden}11%,58%{visibility:visible}60%,100%{visibility:hidden}');
  K('k42b', '0%{opacity:0;transform:translate(0,0)}5%{opacity:1}45%{transform:translate(calc(var(--dx) * .6),var(--dy))}100%{transform:translate(var(--dx),78px);opacity:0}'); css += '.go-42 .bo42{animation:k42b 2.8s ease-out 3}';
  K('k42p', '0%{transform:translate(0,0) scale(.5);opacity:.95}100%{transform:translate(var(--dx),-90px) scale(2.4);opacity:0}'); css += '.go-42 .pu42{animation:k42p 6s ease-out infinite;transform-box:fill-box;transform-origin:center}';
  mv(42, '.cl42', 22, [[0, 'none', 0], [10, 'none', 0], [14, 'none', 1], [80, 'none', 1], [94, 'none', 0], [100, 'none', 0]]);
  K('k42r', '0%,14%{stroke-dashoffset:100}40%,100%{stroke-dashoffset:0}'); css += '.go-42 .rva{animation:k42r 22s ease-out forwards}';
  K('k42f', 'to{stroke-dashoffset:-28}'); css += '.go-42 .rvf{animation:k42f .6s linear infinite}';
  mv(42, '.rv42', 22, [[0, 'none', 0], [14, 'none', 1], [78, 'none', 1], [90, 'none', 0], [100, 'none', 0]]);
  K('k42fl', '0%,30%{clip-path:inset(0 50% 0 50%);opacity:1}54%{clip-path:inset(0 0 0 0);opacity:1}76%{opacity:1}88%,100%{opacity:0}'); A(42, '.fl42', 'k42fl', 22, 'ease-out');
  mv(42, '.ck42', 22, [[0, 'none', 0], [70, 'none', 0], [84, 'none', 1], [94, 'none', 1], [100, 'none', 0]]); css += '.go-42 .cg42{animation:fptw 1.2s linear infinite}';

  // 44 BIG – Apollo launch: it gets dark, the house turns into a launch pad with a service tower, a big white moon rocket rises out of the house, countdown, a huge fire and smoke clouds, the rocket lifts off and disappears up, the smoke slowly clears and the house is back
  add({ n: 44, big: true, t: 'Haus wird Startrampe', scene: 'Mondlandungs-Tag (20. Juli)', where: 'das Haus', dur: 18,
    g: DARK(44, 'dk44', 18, 4, 90, .78)
      + `<g class="tw44"><path d="M690 112 V20 M712 112 V20 M690 20 h22" stroke="#E5483B" stroke-width="2.4" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<path d="M690 ${104 - i * 10} L712 ${96 - i * 10} M712 ${104 - i * 10} L690 ${96 - i * 10}" stroke="#E5483B" stroke-width="1"/>`).join('')}<path class="arm44" d="M690 40 h-36" stroke="#9aa6b6" stroke-width="2.4"/><rect x="580" y="108" width="140" height="6" fill="#5f6772"/><circle class="lt44" cx="701" cy="18" r="2.4" fill="#FF3B30"/></g>`
      + `<g class="rk44"><g transform="translate(640 108) scale(.82)"><rect x="-10" y="-92" width="20" height="86" fill="#f4f6f8" stroke="#9aa6b6" stroke-width="1"/><path d="M-10 -92 L0 -112 L10 -92z" fill="#f4f6f8" stroke="#9aa6b6" stroke-width="1"/><path d="M0 -112 v-8" stroke="#9aa6b6" stroke-width="1.2"/><rect x="-10" y="-60" width="20" height="4" fill="#1d1d1d"/><rect x="-10" y="-30" width="20" height="4" fill="#1d1d1d"/><text x="0" y="-38" text-anchor="middle" font-size="5" font-weight="900" fill="#1d1d1d" font-family="system-ui,sans-serif" transform="rotate(-90 0 -38)">USA</text><path d="M-10 -20 l-10 14 h10z M10 -20 l10 14 h-10z" fill="#1d1d1d"/><g class="fm44"><path d="M-9 -6 q9 50 18 0z" fill="#FF8A1A"/><path d="M-5 -6 q5 30 10 0z" fill="#FFE27A"/></g></g></g>`
      + ['3', '2', '1', 'Liftoff!'].map((d, i) => `<text class="cd44" style="animation-delay:${(4 + i * .8).toFixed(1)}s" x="800" y="60" text-anchor="middle" font-size="${i === 3 ? 22 : 34}" font-weight="900" fill="#fff" stroke="#1d1d1d" stroke-width=".8" font-family="system-ui,sans-serif">${d}</text>`).join('')
      + `<g class="sm44">${Array.from({ length: 22 }, (_, i) => `<circle cx="${480 + (i % 11) * 32}" cy="${104 + Math.floor(i / 11) * 8}" r="${16 + (i % 3) * 6}" fill="${i % 2 ? '#e6e9ee' : '#cfd4da'}"/>`).join('')}</g>`
      + `<g class="fb44"><ellipse cx="640" cy="110" rx="50" ry="10" fill="#FF8A1A"/><ellipse cx="640" cy="110" rx="26" ry="6" fill="#FFE27A"/></g>` });
  hide(44, ['.dk44', '.tw44', '.rk44', '.cd44', '.sm44', '.fb44']);
  mv(44, '.tw44', 18, [[0, 'scaleY(0)', 0], [6, 'scaleY(0)', 1], [16, 'scaleY(1)', 1], [86, 'scaleY(1)', 1], [92, 'scaleY(0)', 0], [100, 'scaleY(0)', 0]]); fbb('.tw44');
  mv(44, '.arm44', 18, [[0, 'scaleX(1)', 1], [36, 'scaleX(1)', 1], [42, 'scaleX(.1)', 1], [100, 'scaleX(.1)', 1]]); css += '.arm44{transform-box:fill-box;transform-origin:100% 50%}'; css += '.go-44 .lt44{animation:fptw .6s linear infinite}';
  mv(44, '.rk44', 18, [[0, 'translateY(100px)', 0], [10, 'translateY(100px)', 1], [24, 'translateY(0)', 1], [46, 'translateY(0)', 1], [48, 'translate(-1px,0)', 1], [50, 'translate(1px,0)', 1], [76, 'translateY(-240px)', 1], [78, 'translateY(-240px)', 0], [100, 'translateY(-240px)', 0]], 'ease-in');
  K('k44f', '0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.5)}'); css += '.tp-44 .fm44{opacity:0}.go-44 .fm44{animation:k44f .12s linear infinite,k44o 18s linear forwards;transform-box:fill-box;transform-origin:50% 0}'; K('k44o', '0%,44%{opacity:0}46%,78%{opacity:1}80%,100%{opacity:0}');
  K('k44c', '0%{opacity:0;transform:scale(2)}10%{opacity:1;transform:scale(1)}20%,100%{opacity:0}'); css += '.go-44 .cd44{animation:k44c 4s ease-out forwards}'; fb('.cd44');
  mv(44, '.fb44', 18, [[0, 'scale(.2)', 0], [44, 'scale(.2)', 0], [48, 'scale(1.4)', 1], [60, 'scale(1)', .8], [70, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.fb44');
  mv(44, '.sm44', 18, [[0, 'scale(.1)', 0], [44, 'scale(.1)', 0], [56, 'scale(1.3)', 1], [80, 'scale(1.6)', .8], [96, 'scale(2)', 0], [100, 'scale(2)', 0]]); fbb('.sm44');

  // 45 BIG – northern lights: the sky darkens, green and violet curtains of light wave across the whole sky, stars twinkle, a fox sits on the hill and looks up, the lights slowly fade
  add({ n: 45, big: true, t: 'Polarlicht', scene: 'Winter in der Nacht', where: 'den Himmel', dur: 18,
    g: DARK(45, 'dk45', 18, 6, 88, .55)
      + [['#7CFF8A', 0], ['#5CE1E6', 1], ['#B07CFF', 2]].map(([c, i]) => `<path class="au45 au${i}" d="M0 ${30 + i * 8} Q 150 ${8 + i * 6} 300 ${28 + i * 6} T 600 ${24 + i * 6} T 900 ${30 + i * 4} T 1200 ${22 + i * 6} V ${60 + i * 6} Q 900 ${50 + i * 4} 600 ${56 + i * 4} T 0 ${62 + i * 6}Z" fill="${c}" opacity=".35"/>`).join('')
      + Array.from({ length: 30 }, (_, i) => `<circle class="st45" style="animation-delay:-${(i * .17).toFixed(2)}s" cx="${(i * 41) % 1200}" cy="${4 + (i * 13) % 30}" r="${.8 + (i % 3) * .3}" fill="#fff"/>`).join('')
      + `` });
  hide(45, ['.dk45', '.au45', '.st45']);
  K('k45a', '0%,100%{transform:translateX(0) skewX(0)}50%{transform:translateX(-40px) skewX(-8deg)}'); css += '.go-45 .au45{animation:k45a 5s ease-in-out infinite,k45o 18s linear forwards}.go-45 .au1{animation-duration:6.4s,18s}.go-45 .au2{animation-duration:7.6s,18s}'; K('k45o', '0%,8%{opacity:0}20%,80%{opacity:.4}96%,100%{opacity:0}');
  css += '.go-45 .st45{animation:fptw 1.4s ease-in-out infinite}';

  // 48 BIG – meteor shower: the sky darkens, dozens of shooting stars streak diagonally, the last and biggest one curves over and bursts into a golden wish-star that hovers over the house
  add({ n: 48, big: true, t: 'Sternschnuppen-Regen', scene: 'Sommernacht (Perseiden im August)', where: 'den Himmel', dur: 16,
    g: DARK(48, 'dk48', 16, 6, 88, .45)
      + Array.from({ length: 28 }, (_, i) => `<g class="ms48" style="--x:${(i * 97) % 1300}px;animation-delay:${(1 + (i % 14) * .45 + Math.floor(i / 14) * .2).toFixed(2)}s"><path d="M0 0 l46 -16" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/><circle cx="0" cy="0" r="1.6" fill="#fff"/></g>`).join('')
      + `<g class="bg48"><path d="M1100 0 Q 900 20 660 46" stroke="#FFE27A" stroke-width="2.6" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></g><g class="ws48">${star(660, 46, 12, '#FFE27A')}<circle cx="660" cy="46" r="16" fill="#FFE27A" opacity=".25"/></g>` });
  hide(48, ['.dk48', '.ms48', '.bg48', '.ws48']);
  K('k48m', '0%{opacity:0;transform:translate(var(--x),-20px)}5%{opacity:1}40%{opacity:1}60%,100%{opacity:0;transform:translate(calc(var(--x) - 200px),50px)}'); css += '.go-48 .ms48{animation:k48m 1.6s linear 3}';
  K('k48b', '0%,62%{stroke-dashoffset:100;opacity:1}76%{stroke-dashoffset:0;opacity:1}82%,100%{stroke-dashoffset:0;opacity:0}'); css += '.go-48 .bg48{opacity:1}.go-48 .bg48 path{animation:k48b 16s ease-in forwards}';
  mv(48, '.ws48', 16, [[0, 'scale(.2) rotate(0)', 0], [76, 'scale(.2)', 0], [80, 'scale(1.5) rotate(90deg)', 1], [84, 'scale(1) rotate(135deg)', 1], [94, 'scale(1) rotate(180deg)', 1], [100, 'scale(.2) rotate(220deg)', 0]]); fb('.ws48');

  // 49 BIG – the farting unicorn: a (slightly smaller) white unicorn trots over the rainbow leaving stars, jumps into the middle of the garden, lifts its rainbow tail – "Pfffrrrt!" – and the glitter cloud swells until the whole picture is nothing but colourful clouds and sparkles; then it all fades back to the house and the unicorn gallops off giggling
  const uni = (cls) => `<g class="${cls}"><path d="M-22 -4 q-14 -2 -18 14 q6 -6 10 -6 q-2 8 2 12 q2 -10 8 -14" fill="#FF9AC8"/><path d="M-22 -2 q-12 2 -14 14" stroke="#B07CFF" stroke-width="2" fill="none"/><path d="M-22 0 q-10 4 -10 16" stroke="#5CE1E6" stroke-width="1.6" fill="none"/>`
    + `<g class="ulb"><path d="M-14 6 v14 M10 6 v14" stroke="#f1f1f6" stroke-width="4" stroke-linecap="round"/><path d="M-16 20 h4 M8 20 h4" stroke="#b8a3c9" stroke-width="2.4"/></g>`
    + `<ellipse cx="-2" cy="0" rx="22" ry="10" fill="#fff"/><g class="ula"><path d="M-8 6 v14 M16 6 v14" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/><path d="M-10 20 h4 M14 20 h4" stroke="#b8a3c9" stroke-width="2.6"/></g>`
    + `<path d="M12 -6 Q 18 -20 24 -28 L 32 -26 Q 28 -14 22 2Z" fill="#fff"/><path d="M22 -30 Q 32 -34 42 -26 Q 45 -21 40 -18 Q 33 -19 27 -16Z" fill="#fff"/><ellipse cx="42" cy="-21" rx="2.4" ry="1.6" fill="#f3d6e4"/><circle cx="41.4" cy="-21.4" r=".5" fill="#a0627e"/>`
    + `<path d="M26 -31 l1 -6 3 5z" fill="#fff" stroke="#e6d6ee" stroke-width=".5"/><path d="M30 -32 l8 -14 -2 16z" fill="#FFD24A"/><path d="M32 -36 l4 -1 M33 -40 l3 -1" stroke="#c99a1e" stroke-width=".7"/>`
    + `<circle cx="33" cy="-26" r="1.4" fill="#1d1d1d"/><circle cx="33.5" cy="-26.5" r=".4" fill="#fff"/><path d="M34 -23.5 q1.6 .6 2.6 -.4" stroke="#1d1d1d" stroke-width=".5" fill="none"/>`
    + `<path d="M24 -30 q-6 4 -8 10 q-2 6 -6 10 M22 -28 q-4 6 -2 12" stroke="#FF7AB6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M25 -30 q-8 6 -10 14" stroke="#B07CFF" stroke-width="2" fill="none"/><path d="M26 -30 q-6 8 -4 16" stroke="#5CE1E6" stroke-width="1.6" fill="none"/></g>`;
  add({ n: 49, big: true, t: 'Einhorn mit Glitzer-Pups', scene: 'Teilweise bewölkt (mit Regenbogen)', where: 'den Regenbogen', dur: 22,
    g: `<g class="rb49 needrb">${[['#ff5a5a', 52], ['#ffb23d', 47], ['#ffe94d', 42], ['#55d16b', 37], ['#4aa8ff', 32], ['#8f6bff', 27]].map(([c, rr]) => `<path d="M${222 - rr * 2} 100 A ${rr * 2} ${rr * 1.7} 0 0 1 ${222 + rr * 2} 100" stroke="${c}" stroke-width="5" fill="none" opacity=".45"/>`).join('')}</g>`
      + `<g class="uc49"><g class="ucr"><g class="ucf"><g transform="scale(.66)">${uni('un49')}</g></g></g></g>`
      + Array.from({ length: 14 }, (_, i) => `<g class="ts49" style="animation-delay:${(1 + i * .45).toFixed(2)}s">${star(0, 0, 3, ['#FFE27A', '#FF7AB6', '#5CE1E6'][i % 3])}</g>`).join('')
      + `<g class="pf49"></g>`
      + `<g class="fc49">${Array.from({ length: 70 }, (_, i) => `<circle class="fp49" style="--tx:${(i * 89) % 1300 - 50}px;--ty:${(i * 37) % 140 - 10}px;--d:${(i % 14) * .06}s" cx="0" cy="0" r="${22 + (i % 5) * 7}" fill="${['#FFB3E0', '#E6C6FF', '#FFE6F4', '#C6F0FF', '#FFF2B3', '#C9FFD8'][i % 6]}"/>`).join('')}</g>`
      + `<g class="gl49">${Array.from({ length: 40 }, (_, i) => `<g class="fs49" style="animation-delay:-${(i * .07).toFixed(2)}s">${star((i * 61) % 1200, 8 + (i * 23) % 104, 2.6, ['#fff', '#FFE27A', '#5CE1E6', '#FF7AB6'][i % 4])}</g>`).join('')}</g>`
      + `<g class="gg49"></g>` });
  hide(49, ['.rb49', '.uc49', '.ts49', '.pf49', '.fc49', '.gl49', '.gg49']);
  mv(49, '.uc49', 22, [[0, 'translate(110px,96px)', 0], [4, 'translate(120px,90px)', 1], [12, 'translate(160px,40px)', 1], [20, 'translate(222px,24px)', 1], [28, 'translate(290px,40px)', 1], [36, 'translate(330px,94px)', 1], [46, 'translate(600px,94px)', 1], [84, 'translate(600px,94px)', 1], [98, 'translate(1260px,94px)', 1], [100, 'translate(1260px,94px)', 0]], 'ease-in-out');
  K('k49rb', '0%{opacity:0}4%,90%{opacity:1}100%{opacity:0}'); css += '.go-49 .rb49{animation:k49rb 22s linear forwards}';
  K('k49r', '0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-2deg)}'); css += '.go-49 .ucr{animation:k49r .38s ease-in-out infinite}';
  K('k49l', '0%,100%{transform:rotate(-24deg)}50%{transform:rotate(24deg)}'); css += '.go-49 .ula{animation:k49l .38s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}.go-49 .ulb{animation:k49l .38s ease-in-out infinite reverse;transform-box:fill-box;transform-origin:50% 0}';
  K('k49t', '0%{opacity:0;transform:translate(150px,44px) scale(.2)}10%{opacity:1;transform:translate(200px,30px) scale(1)}100%{opacity:0;transform:translate(220px,64px) scale(.4)}'); css += '.go-49 .ts49{animation:k49t 2s ease-out forwards}';
  mv(49, '.pf49', 22, [[0, 'scale(.4)', 0], [48, 'scale(.4)', 0], [51, 'scale(1.35)', 1], [58, 'scale(1)', 1], [60, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.pf49');
  // the cloud: every puff starts at the unicorn's tail and swells out to cover the whole picture, holds, then everything fades back
  K('k49p', '0%,48%{opacity:0;transform:translate(586px,90px) scale(.1)}50%{opacity:1}64%,80%{opacity:1;transform:translate(var(--tx),var(--ty)) scale(1.4)}90%,100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1.6)}'); css += '.go-49 .fc49{opacity:1}.tp-49 .fp49{opacity:0}.go-49 .fp49{animation:k49p 22s ease-out forwards;animation-delay:var(--d)}';
  K('k49g', '0%,60%{opacity:0}66%,80%{opacity:1}88%,100%{opacity:0}'); css += '.go-49 .gl49{animation:k49g 22s linear forwards}.go-49 .fs49{animation:fptw .5s linear infinite}';
  mv(49, '.gg49', 22, [[0, 'scale(.4)', 0], [86, 'scale(.4)', 0], [88, 'scale(1.2)', 1], [96, 'scale(1)', 1], [98, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.gg49');

  // 50 BIG – solar eclipse: the moon slides in front of the sun, the sky gets dark, stars come out, a glowing ring (corona) and a diamond ring sparkle, birds fly home, then it gets bright again
  add({ n: 50, big: true, t: 'Sonnenfinsternis', scene: 'Sonniger Tag', where: 'die Sonne', dur: 18,
    g: DARK(50, 'dk50', 18, 30, 66, .78)
      + `<g class="co50"><circle cx="362" cy="28" r="20" fill="#FFF3C0" opacity=".4"/><circle cx="362" cy="28" r="15" fill="none" stroke="#fff" stroke-width="2.4" opacity=".9"/></g>`
      + `<circle class="mo50" cx="362" cy="28" r="14" fill="#141724"/>`
      + `<g class="di50">${star(374, 18, 8, '#fff')}</g>`
      + Array.from({ length: 24 }, (_, i) => `<circle class="st50" style="animation-delay:-${(i * .2).toFixed(1)}s" cx="${(i * 53) % 1200}" cy="${4 + (i * 17) % 40}" r="1" fill="#fff"/>`).join('')
      + `<g class="bd50">${[0, 1, 2, 3].map((i) => `<path d="M${i * 14} ${i * 4} q4 -4 8 0 q4 -4 8 0" stroke="#1d1d1d" stroke-width="1.2" fill="none"/>`).join('')}</g>` });
  hide(50, ['.dk50', '.co50', '.mo50', '.di50', '.st50', '.bd50']);
  mv(50, '.mo50', 18, [[0, 'translateX(-60px)', 0], [6, 'translateX(-60px)', 1], [34, 'translateX(0)', 1], [64, 'translateX(0)', 1], [92, 'translateX(60px)', 1], [96, 'translateX(60px)', 0], [100, 'translateX(60px)', 0]], 'linear');
  mv(50, '.co50', 18, [[0, 'scale(.8)', 0], [32, 'scale(.8)', 0], [38, 'scale(1.2)', 1], [62, 'scale(1.2)', 1], [68, 'scale(.8)', 0], [100, 'scale(.8)', 0]]); fb('.co50');
  mv(50, '.di50', 18, [[0, 'scale(0)', 0], [32, 'scale(0)', 0], [34, 'scale(1.4) rotate(45deg)', 1], [37, 'scale(0)', 0], [100, 'scale(0)', 0]]); fb('.di50');
  K('k50s', '0%,30%{opacity:0}40%,62%{opacity:1}70%,100%{opacity:0}'); A(50, '.st50', 'k50s', 18, 'linear');
  mv(50, '.bd50', 18, [[0, 'translate(900px,30px)', 0], [28, 'translate(900px,30px)', 1], [44, 'translate(500px,60px)', 1], [48, 'translate(470px,70px)', 0], [100, 'translate(470px,70px)', 0]], 'linear');

  // 51 BIG – the whirlwind: a little tornado spins in, sucks up the leaves, a hat, a towel and a football, everything circles around, then it drops it all, and the leaves land in the shape of a heart
  add({ n: 51, big: true, t: 'Wirbelwind', scene: 'Wind / Sturm', where: 'den Rasen', dur: 18,
    g: `<g class="tn51">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="0" cy="${-i * 9}" rx="${4 + i * 2.6}" ry="${2 + i * .6}" fill="none" stroke="#7d8794" stroke-width="2.4" opacity=".85" class="tnr" style="animation-delay:-${(i * .07).toFixed(2)}s"/>`).join('')}</g>`
      + Array.from({ length: 12 }, (_, i) => `<g class="it51" style="--r:${12 + (i % 4) * 8}px;--h:${-20 - (i * 7) % 60}px;animation-delay:-${(i * .15).toFixed(2)}s">${i === 0 ? '<path d="M-6 0 q6 -8 12 0 h4" stroke="#E5483B" stroke-width="3" fill="#E5483B"/>' : i === 1 ? '<rect x="-7" y="-3" width="14" height="6" fill="#5CE1E6"/><path d="M-7 0 h14" stroke="#fff" stroke-width="1"/>' : i === 2 ? '<circle r="4.4" fill="#fff" stroke="#1d1d1d" stroke-width=".8"/><path d="M0 -2 l2 1.4 -.8 2.4 h-2.4 l-.8 -2.4z" fill="#1d1d1d"/>' : `<path d="M-4 0 q4 -4 8 0 q-4 4 -8 0z" fill="${['#E58A2B', '#C8452B', '#E8B23A'][i % 3]}"/>`}</g>`).join('')
      + (() => { const pts = Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return [640 + 16 * Math.pow(Math.sin(a), 3) * 2.4, 96 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 1.3]; });
        return `<g class="ht51">${pts.map(([x, y], i) => `<path d="M${(x - 4).toFixed(0)} ${y.toFixed(0)} q4 -4 8 0 q-4 4 -8 0z" fill="${['#E58A2B', '#C8452B', '#E8B23A'][i % 3]}"/>`).join('')}</g>`; })() });
  hide(51, ['.tn51', '.it51', '.ht51']);
  mv(51, '.tn51', 18, [[0, 'translate(1000px,110px) scale(.2)', 0], [6, 'translate(900px,110px) scale(1)', 1], [30, 'translate(640px,110px)', 1], [70, 'translate(640px,110px)', 1], [80, 'translate(500px,110px) scale(.3)', 0], [100, 'translate(500px,110px)', 0]]);
  K('k51r', '0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}'); css += '.go-51 .tnr{animation:k51r .3s ease-in-out infinite}';
  K('k51i', '0%{transform:translate(640px,110px) rotate(0) translateX(var(--r)) translateY(var(--h))}100%{transform:translate(640px,110px) rotate(360deg) translateX(var(--r)) translateY(var(--h))}');
  css += '.go-51 .it51{animation:k51i .9s linear infinite,k51o 18s linear forwards}'; K('k51o', '0%,26%{opacity:0}32%,70%{opacity:1}76%,100%{opacity:0}');
  mv(51, '.ht51', 18, [[0, 'translateY(-60px)', 0], [72, 'translateY(-60px)', 0], [80, 'translateY(0)', 1], [94, 'translateY(0)', 1], [100, 'translateY(0)', 0]], 'ease-out');

  // 52 BIG – pirate ship out on the water: a pirate ship sails in from the right far out on the sea (behind the hut), the black flag waves, it fires three cannonballs that splash into the sea, the pirates shout "Arrr!" and it sails out of the picture on the left
  add({ n: 52, big: true, t: 'Piratenschiff', scene: 'Sommerferien (Strand)', where: 'das Meer', dur: 20,
    g: `<defs><mask id="hut52" maskUnits="userSpaceOnUse" x="-200" y="-100" width="1600" height="320"><rect x="-200" y="-100" width="1600" height="320" fill="#fff"/><path d="M60 104 Q 66.0 70.0 56.0 40.0" stroke="#000" stroke-width="9.0" fill="none"/><path d="M56.0 40.0 q-30.0 -6.0 -44.0 12.0" stroke="#000" stroke-width="11.0" fill="none" stroke-linecap="round"/><path d="M56.0 40.0 q30.0 -8.0 44.0 10.0" stroke="#000" stroke-width="11.0" fill="none" stroke-linecap="round"/><path d="M56.0 40.0 q-18.0 -22.0 -40.0 -18.0" stroke="#000" stroke-width="11.0" fill="none" stroke-linecap="round"/><path d="M56.0 40.0 q18.0 -24.0 40.0 -16.0" stroke="#000" stroke-width="11.0" fill="none" stroke-linecap="round"/><path d="M56.0 40.0 q2.0 -26.0 4.0 -30.0" stroke="#000" stroke-width="11.0" fill="none" stroke-linecap="round"/><path d="M440 104 Q 445.1 75.1 436.6 49.6" stroke="#000" stroke-width="8.1" fill="none"/><path d="M436.6 49.6 q-25.5 -5.1 -37.4 10.2" stroke="#000" stroke-width="9.9" fill="none" stroke-linecap="round"/><path d="M436.6 49.6 q25.5 -6.8 37.4 8.5" stroke="#000" stroke-width="9.9" fill="none" stroke-linecap="round"/><path d="M436.6 49.6 q-15.3 -18.7 -34.0 -15.3" stroke="#000" stroke-width="9.9" fill="none" stroke-linecap="round"/><path d="M436.6 49.6 q15.3 -20.4 34.0 -13.6" stroke="#000" stroke-width="9.9" fill="none" stroke-linecap="round"/><path d="M436.6 49.6 q1.7 -22.1 3.4 -25.5" stroke="#000" stroke-width="9.9" fill="none" stroke-linecap="round"/><path d="M840 104 Q 846.3 68.3 835.8 36.8" stroke="#000" stroke-width="9.3" fill="none"/><path d="M835.8 36.8 q-31.5 -6.3 -46.2 12.6" stroke="#000" stroke-width="11.4" fill="none" stroke-linecap="round"/><path d="M835.8 36.8 q31.5 -8.4 46.2 10.5" stroke="#000" stroke-width="11.4" fill="none" stroke-linecap="round"/><path d="M835.8 36.8 q-18.9 -23.1 -42.0 -18.9" stroke="#000" stroke-width="11.4" fill="none" stroke-linecap="round"/><path d="M835.8 36.8 q18.9 -25.2 42.0 -16.8" stroke="#000" stroke-width="11.4" fill="none" stroke-linecap="round"/><path d="M835.8 36.8 q2.1 -27.3 4.2 -31.5" stroke="#000" stroke-width="11.4" fill="none" stroke-linecap="round"/><path d="M586 61 L640 31 L694 61 L676 61 V106 H604 V61Z" fill="#000"/><path d="M676 84 l16 22 h-8 l-14 -19z" fill="#000"/><path d="M896 67 Q 940 35 984 55Z" fill="#000" stroke="#000" stroke-width="3"/><path d="M920 106 L940 60" stroke="#000" stroke-width="5"/><rect x="-200" y="95" width="1600" height="40" fill="#000"/></mask></defs>`
      + `<g mask="url(#hut52)"><g class="sh52"><g class="shr"><g transform="translate(0 93) scale(.72)"><path d="M-50 -8 h100 l-14 16 h-72z" fill="#6b3a18"/><path d="M-50 -8 h100" stroke="#a87a4a" stroke-width="2"/><path d="M-36 -2 h72" stroke="#4a2810" stroke-width="1"/>${[-30, -10, 10, 30].map((x) => `<circle cx="${x}" cy="-1" r="2.2" fill="#1d1d1d"/>`).join('')}<path d="M0 -8 V-64 M-28 -8 V-50" stroke="#5a3b22" stroke-width="2"/><path d="M-2 -60 q-24 12 0 28z M-2 -30 q-20 10 0 20z M-30 -46 q-18 8 0 20z" fill="#f4eedd"/><g class="fl52"><rect x="-18" y="-74" width="18" height="11" fill="#1d1d1d"/><circle cx="-9" cy="-70" r="2.6" fill="#fff"/><path d="M-13 -65 l8 2.4 M-5 -65 l-8 2.4" stroke="#fff" stroke-width=".9"/></g><g><circle cx="-20" cy="-14" r="3" fill="#F3CDA6"/><path d="M-24 -16 h8 l-1 -3 h-6z" fill="#E5483B"/><circle cx="20" cy="-14" r="3" fill="#F3CDA6"/><path d="M16 -16 h8 l-1 -3 h-6z" fill="#1d1d1d"/></g></g></g></g>`
      + `<g class="wk52"><path d="M0 92 q20 -3 40 0 t40 0" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/></g>`
      + [0, 1, 2].map((i) => `<g class="cb52 cbk${i}"><circle cx="0" cy="0" r="2.4" fill="#1d1d1d"/></g><g class="pf52 pfk${i}"><circle cx="0" cy="0" r="7" fill="#eef1f5" opacity=".9"/><circle cx="2" cy="1" r="3.4" fill="#FFB02E"/><circle cx="-5" cy="-3" r="4.4" fill="#eef1f5" opacity=".8"/></g><g class="sp52 spk${i}"><path d="M-7 2 q3.5 -12 7 -14 q3.5 2 7 14z" fill="#d6f3ff"/></g>`).join('') + '</g>'
      + `<g class="ar52"></g>` + `${[0, 1, 2].map((i) => `<g class="gu52" style="--y:${18 + i * 9}px;animation-delay:${(i * 1.6).toFixed(1)}s"><path d="M-5 0 q2.5 -3 5 0 q2.5 -3 5 0" stroke="#fff" stroke-width="1.2" fill="none"/></g>`).join('')}` });
  hide(52, ['.sh52', '.wk52', '.cb52', '.pf52', '.sp52', '.ar52', '.gu52']);
  K('k52g', '0%{transform:translate(1250px,var(--y))}100%{transform:translate(-50px,calc(var(--y) + 10px))}'); css += '.go-52 .gu52{animation:k52g 9s linear 2}';
  // the ship moves right → left at constant speed: x = 1300 − 14.75·p (p = percent)
  const SX = (p) => 1300 - 14.75 * p;
  mv(52, '.sh52', 20, [[0, `translateX(${SX(0)}px)`, 1], [100, `translateX(${SX(100)}px)`, 1]], 'linear');
  mv(52, '.wk52', 20, [[0, `translateX(${SX(0) + 34}px)`, .9], [100, `translateX(${SX(100) + 34}px)`, .9]], 'linear');
  K('k52r', '0%,100%{transform:rotate(-2.5deg) translateY(0)}50%{transform:rotate(2.5deg) translateY(1px)}'); css += '.go-52 .shr{animation:k52r 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}';
  K('k52f', '0%,100%{transform:skewY(0)}50%{transform:skewY(-10deg)}'); css += '.go-52 .fl52{animation:k52f .5s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 50%}';
  // three shots between the palms on the right, while the ship is at x≈1020, 960, 900 (no hut in the way); balls splash far out
  [[0, 19], [1, 23], [2, 27]].forEach(([i, t]) => { const x = SX(t) - 36; const tx = x - 180;
    mv(52, `.cbk${i}`, 20, [[0, `translate(${x}px,90px)`, 0], [t, `translate(${x}px,90px)`, 0], [t + 1, `translate(${x}px,90px)`, 1], [t + 4, `translate(${(x + tx) / 2}px,62px)`, 1], [t + 8, `translate(${tx}px,90px)`, 1], [t + 9, `translate(${tx}px,90px)`, 0], [100, 'none', 0]], 'linear');
    mv(52, `.pfk${i}`, 20, [[0, `translate(${x - 4}px,89px) scale(.3)`, 0], [t, `translate(${x - 4}px,89px) scale(.3)`, 0], [t + 1, `translate(${x - 4}px,89px) scale(1)`, 1], [t + 6, `translate(${x - 10}px,82px) scale(1.7)`, 0], [100, 'none', 0]]);
    mv(52, `.spk${i}`, 20, [[0, `translate(${tx}px,91px) scaleY(0)`, 0], [t + 8, `translate(${tx}px,91px) scaleY(0)`, 0], [t + 9, `translate(${tx}px,91px) scaleY(1.2)`, 1], [t + 13, `translate(${tx}px,91px) scaleY(.4)`, 0], [100, 'none', 0]]); });
  css += '.sp52{transform-box:fill-box;transform-origin:50% 100%}';
  mv(52, '.ar52', 20, [[0, 'translate(940px,52px)', 0], [30, 'translate(940px,52px)', 0], [32, 'translate(940px,52px) scale(1.3)', 1], [40, 'translate(940px,52px)', 1], [42, 'translate(940px,52px)', 0], [100, 'translate(940px,52px)', 0]]);

  // 54 BIG – friendly dragon: a big friendly dragon swoops in low over the hills (always fully in the picture), loops once around the house, lands on the roof, toasts a marshmallow for a kid with a tiny flame, blows smoke rings, wags its tail and waves goodbye
  add({ n: 54, big: true, t: 'Freundlicher Drache', scene: 'Herbst', where: 'den Himmel', dur: 20,
    g: `<g class="dr54"><g class="drr"><g transform="translate(0 0) scale(.9)"><g class="tl54"><path d="M-24 4 q-20 6 -34 -2 q-6 -4 -10 2 l-4 -6 6 -2 q4 -4 10 0 q12 6 28 0" fill="#3FA66B"/></g><ellipse cx="0" cy="0" rx="26" ry="12" fill="#4fbf6a"/><ellipse cx="0" cy="5" rx="18" ry="6" fill="#FFE27A"/>${[-14, -6, 2, 10].map((x) => `<path d="M${x} -11 l3 -6 3 6z" fill="#E5483B"/>`).join('')}<path d="M20 -6 q10 -14 20 -12 q8 2 6 8 q-2 6 -12 6z" fill="#4fbf6a"/><circle cx="38" cy="-12" r="2" fill="#fff"/><circle cx="38.6" cy="-12" r="1" fill="#1d1d1d"/><path d="M42 -4 q3 1 5 -1" stroke="#1d1d1d" stroke-width=".8" fill="none"/><circle cx="44" cy="-8" r=".7" fill="#1d1d1d"/><path d="M30 -18 l-2 -6 4 4z M36 -18 l0 -6 3 5z" fill="#FFD24A"/><g class="wg54"><path d="M-6 -8 q-14 -26 -34 -22 q12 6 16 12 q-10 -4 -16 0 q12 4 18 12z" fill="#3a9a55"/></g><path d="M-10 10 v8 M10 10 v8" stroke="#3a9a55" stroke-width="4"/><g class="wv54"><path d="M14 4 l8 -8" stroke="#4fbf6a" stroke-width="3" stroke-linecap="round"/></g></g></g></g>`
      + `<g class="fi54"><path d="M0 0 q8 -3 14 0 q-6 3 -14 0z" fill="#FF8A3C"/><path d="M2 0 q5 -1.6 8 0 q-3 1.6 -8 0z" fill="#FFD24A"/></g>`
      + `<g class="ki54">${kid(712, 108, '#B07CFF', '#D4A63B')}<path d="M718 88 L712 56" stroke="#8a5a2b" stroke-width="1"/><rect class="mm54" x="709.5" y="51" width="5" height="5" rx="1.4" fill="#fff"/></g>`
      + [0, 1, 2].map((i) => `<ellipse class="sr54" style="animation-delay:${(12 + i * .5).toFixed(1)}s" cx="0" cy="0" rx="5" ry="2.4" fill="none" stroke="#dfe3e8" stroke-width="1.8"/>`).join('')
      + `<g class="by54"></g>` });
  hide(54, ['.dr54', '.fi54', '.ki54', '.sr54', '.by54']);
  mv(54, '.dr54', 20, [[0, 'translate(-80px,60px)', 1], [12, 'translate(380px,50px)', 1], [20, 'translate(560px,30px)', 1], [26, 'translate(760px,50px) scaleX(-1)', 1], [32, 'translate(560px,62px) scaleX(-1)', 1], [38, 'translate(560px,40px)', 1], [44, 'translate(660px,32px)', 1], [84, 'translate(660px,32px)', 1], [100, 'translate(1300px,30px)', 1]], 'ease-in-out');
  css += '.dr54{transform-box:view-box}';
  K('k54w', '0%,100%{transform:scaleY(1)}50%{transform:scaleY(-.5)}'); css += '.go-54 .wg54{animation:k54w .4s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 100%}';
  K('k54t', '0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}'); css += '.go-54 .tl54{animation:k54t .8s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 50%}';
  K('k54v', '0%,84%,100%{transform:rotate(0)}88%,96%{transform:rotate(-40deg)}92%{transform:rotate(10deg)}'); css += '.go-54 .wv54{animation:k54v 20s linear forwards;transform-box:fill-box;transform-origin:0 100%}';
  mv(54, '.ki54', 20, [[0, 'translateX(200px)', 0], [30, 'translateX(200px)', 1], [40, 'translateX(0)', 1], [86, 'translateX(0)', 1], [92, 'translateX(200px)', 0], [100, 'translateX(200px)', 0]]);
  mv(54, '.fi54', 20, [[0, 'translate(698px,26px) scale(.3)', 0], [46, 'translate(698px,26px) scale(.3)', 0], [48, 'translate(700px,28px) scale(1) rotate(60deg)', 1], [58, 'translate(700px,28px) scale(1.2) rotate(60deg)', 1], [60, 'translate(700px,28px) scale(.3)', 0], [100, 'translate(700px,28px)', 0]]);
  K('k54m', '0%,52%{fill:#fff}60%,100%{fill:#c98a48}'); css += '.go-54 .mm54{animation:k54m 20s linear forwards}';
  K('k54s', '0%{opacity:0;transform:translate(700px,26px) scale(.4)}10%{opacity:1}100%{opacity:0;transform:translate(760px,-4px) scale(2.4)}'); css += '.tp-54 .sr54{opacity:0}.go-54 .sr54{animation:k54s 2s ease-out forwards;transform-box:fill-box;transform-origin:center}';
  mv(54, '.by54', 20, [[0, 'scale(.4)', 0], [84, 'scale(.4)', 0], [86, 'scale(1.2)', 1], [94, 'scale(1)', 1], [96, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.by54');

  // 55 BIG – the giant snowball: a snowball rolls down from the mountains and grows bigger and bigger, the kids jump aside, it crashes into the house – the house is a snowman for a moment – then everything shakes off the snow
  add({ n: 55, big: true, t: 'Riesen-Schneeball', scene: 'Winter mit Schnee', where: 'die Berge', dur: 16,
    g: `<g class="sb55"><circle class="sbr" cx="0" cy="0" r="10" fill="#fff" stroke="#dfe7ef" stroke-width="1.4"/><path class="sbr" d="M-6 -4 q4 -2 6 2 M2 4 q3 -2 5 1" stroke="#c9d6e3" stroke-width="1.2" fill="none"/></g>`
      + `<g class="kd55">${kid(560, 108, '#E5483B', '#D4A63B')}${kid(720, 108, '#3E8EDE', '#6b4a2e')}</g>`
      + `<g class="hs55"><path d="M590 112 Q 560 60 600 40 Q 640 10 680 40 Q 720 60 690 112Z" fill="#fff"/><circle cx="626" cy="56" r="3" fill="#2b2b2b"/><circle cx="654" cy="56" r="3" fill="#2b2b2b"/><path d="M640 62 l14 3 -14 3z" fill="#FF8A3C"/><path d="M626 76 q14 8 28 0" stroke="#2b2b2b" stroke-width="2" fill="none" stroke-dasharray="2 3"/><rect x="622" y="20" width="36" height="16" fill="#2b2b2b"/><rect x="614" y="34" width="52" height="4" fill="#2b2b2b"/></g>`
      + Array.from({ length: 24 }, (_, i) => `<circle class="sf55" cx="640" cy="70" r="${2 + (i % 3)}" fill="#fff" style="--dx:${Math.round(Math.cos(i * .26) * 120)}px;--dy:${Math.round(Math.sin(i * .26) * 50 - 20)}px"/>`).join('')
      + `<g class="ou55"></g>` });
  hide(55, ['.sb55', '.kd55', '.hs55', '.sf55', '.ou55']);
  mv(55, '.sb55', 16, [[0, 'translate(1000px,60px) scale(.3)', 0], [4, 'translate(980px,64px) scale(.4)', 1], [30, 'translate(800px,94px) scale(2)', 1], [44, 'translate(660px,80px) scale(3.6)', 1], [46, 'translate(640px,76px) scale(4)', 0], [100, 'translate(640px,76px)', 0]], 'ease-in');
  K('k55r', '0%{transform:rotate(0)}100%{transform:rotate(-720deg)}'); css += '.go-55 .sbr{animation:k55r 1.6s linear infinite;transform-box:fill-box;transform-origin:center}';
  mv(55, '.kd55', 16, [[0, 'none', 0], [4, 'none', 1], [30, 'none', 1], [34, 'translateY(-16px)', 1], [38, 'translateY(0)', 1], [92, 'none', 1], [100, 'none', 0]]);
  mv(55, '.hs55', 16, [[0, 'scale(.6)', 0], [44, 'scale(.6)', 0], [46, 'scale(1.1)', 1], [50, 'scale(1)', 1], [76, 'scale(1)', 1], [78, 'rotate(-4deg)', 1], [80, 'rotate(4deg)', 1], [82, 'scale(1.1)', 0], [100, 'scale(1)', 0]]); fbb('.hs55');
  K('k55f', '0%,80%{opacity:0;transform:translate(0,0)}82%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy))}'); css += '.go-55 .sf55{animation:k55f 16s ease-out forwards}';
  mv(55, '.ou55', 16, [[0, 'scale(.4)', 0], [45, 'scale(.4)', 0], [48, 'scale(1.3)', 1], [56, 'scale(1)', 1], [58, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.ou55');

  // 56 BIG – a whole day in time-lapse: it starts at night-blue dawn, the sun rises from behind the hills (sunrise glow), climbs, passes BEHIND the house, glows orange at sunset and sinks behind the hills, night with moon (also behind the house) and stars, windows light up one by one, pink dawn and a second sunrise – then the normal sky is back
  add({ n: 56, big: true, t: 'Ein Tag im Zeitraffer', scene: 'Jeder Tag', where: 'die Sonne', dur: 18,
    g: `<defs><linearGradient id="gd56" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a8a"/><stop offset=".7" stop-color="#ff8ab0"/><stop offset="1" stop-color="#ffc06a"/></linearGradient><linearGradient id="gs56" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a3c"/><stop offset="1" stop-color="#ffd06a"/></linearGradient>`
      + `<mask id="hm56"><rect x="-100" y="-100" width="1400" height="320" fill="#fff"/><path d="M0 120 V100 C 200 96 400 100 600 97 C 800 94 1000 99 1200 98 V120Z" fill="#000"/><path d="M588 104 V58 L640 21 L692 58 V104Z" fill="#000"/><rect x="661" y="25" width="13" height="20" fill="#000"/><circle cx="12" cy="58" r="21" fill="#000"/><circle cx="470" cy="58" r="22" fill="#000"/><rect x="465" y="60" width="10" height="45" fill="#000"/><ellipse cx="793" cy="40" rx="46" ry="32" fill="#000"/><rect x="786" y="60" width="14" height="45" fill="#000"/><circle cx="862" cy="70" r="17" fill="#000"/><circle cx="1100" cy="52" r="22" fill="#000"/><rect x="1094" y="60" width="12" height="45" fill="#000"/><circle cx="1196" cy="60" r="16" fill="#000"/></mask></defs>`
      + `<rect class="nt56" x="0" y="0" width="1200" height="120" fill="#060918"/><rect class="dw56" x="0" y="0" width="1200" height="120" fill="url(#gd56)"/><rect class="or56" x="0" y="0" width="1200" height="120" fill="url(#gs56)"/>`
      + Array.from({ length: 40 }, (_, i) => `<circle class="st56" style="animation-delay:-${(i * .13).toFixed(2)}s" cx="${(i * 31) % 1200}" cy="${4 + (i * 13) % 56}" r="${.8 + (i % 3) * .3}" fill="#fff"/>`).join('')
      + `<g mask="url(#hm56)"><g class="su56"><circle cx="0" cy="0" r="26" fill="#FFD24A" opacity=".25"/><circle cx="0" cy="0" r="15" fill="#FFD24A"/></g><g class="mo56"><circle cx="0" cy="0" r="12" fill="#f4f1de"/><circle cx="-3" cy="-2" r="2" fill="#d9d3b8"/><circle cx="3" cy="4" r="1.6" fill="#d9d3b8"/></g></g>`
      + [[611, 60, 19.5, 10.5], [650, 60, 19.5, 10.5], [593, 82, 28, 16.5], [637, 82, 16.5, 16.5], [660, 82, 18, 16.5]].map(([x, y, w, h], i) => `<rect class="wn56" style="--d:${i}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFD86B"/>`).join('')
      + `<g class="tm56"><rect x="1050" y="6" width="130" height="20" rx="10" fill="#000" opacity=".45"/><text x="1115" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">Zeitraffer ▶▶</text></g>` });
  hide(56, ['.nt56', '.dw56', '.or56', '.st56', '.su56', '.mo56', '.wn56', '.tm56']);
  K('k56hs', '0%{opacity:1}3%,95%{opacity:0}100%{opacity:1}'); css += '.go-56 .sun,.go-56 circle[r="30"][opacity=".25"]{animation:k56hs 18s linear forwards !important}';
  // sun: rises at x≈180 from behind the hills, arcs over (behind the house) and sets at x≈1080; rises again at the end
  const arc = (p0, p1, x0, x1, top) => Array.from({ length: 9 }, (_, i) => { const f = i / 8; const x = x0 + (x1 - x0) * f; const y = 112 - Math.sin(f * Math.PI) * (112 - top); return [p0 + (p1 - p0) * f, `translate(${x.toFixed(0)}px,${y.toFixed(0)}px)`, 1]; });
  mv(56, '.su56', 18, [[0, 'translate(180px,116px)', 0], [2, 'translate(180px,116px)', 1]].concat(arc(4, 34, 180, 1080, 8)).concat([[36, 'translate(1080px,120px)', 0], [80, 'translate(180px,120px)', 0], [81, 'translate(180px,116px)', 1]]).concat(arc(82, 99, 180, 420, 8).slice(0, 5)).concat([[100, 'translate(300px,40px)', 0]]), 'linear');
  mv(56, '.mo56', 18, [[0, 'translate(180px,120px)', 0], [38, 'translate(180px,120px)', 1]].concat(arc(40, 76, 180, 1080, 14)).concat([[78, 'translate(1080px,120px)', 0], [100, 'translate(1080px,120px)', 0]]), 'linear');
  mv(56, '.dw56', 18, [[0, 'none', 0], [2, 'none', .7], [10, 'none', 0], [74, 'none', 0], [80, 'none', .7], [90, 'none', 0], [100, 'none', 0]]);
  mv(56, '.or56', 18, [[0, 'none', 0], [26, 'none', 0], [33, 'none', .6], [40, 'none', 0], [100, 'none', 0]]);
  mv(56, '.nt56', 18, [[0, 'none', .5], [6, 'none', 0], [34, 'none', 0], [42, 'none', .82], [74, 'none', .82], [82, 'none', 0], [100, 'none', 0]]);
  K('k56s', '0%{opacity:.6}6%,38%{opacity:0}46%,72%{opacity:1}80%,100%{opacity:0}'); css += '.go-56 .st56{animation:k56s 18s linear forwards,fptw 1s linear infinite}';
  K('k56w', '0%,40%{opacity:0}42%,66%{opacity:.95}68%,100%{opacity:0}'); css += '.go-56 .wn56{animation:k56w 18s steps(1) forwards;animation-delay:calc(var(--d) * .35s)}';
  K('k56t', '0%{opacity:0}4%,94%{opacity:1}100%{opacity:0}'); A(56, '.tm56', 'k56t', 18, 'linear');

  // 57 BIG – fun fair: a Ferris wheel grows in the garden and turns with colourful gondolas, a carousel spins, light chains blink, a candy-floss kid walks past, then everything folds away
  add({ n: 57, big: true, t: 'Chilbi im Garten', scene: 'Herbst / Sommer am Abend', where: 'die Wiese', dur: 20,
    g: `<g class="fw57"><path d="M700 110 L720 60 L740 110" stroke="#9aa6b6" stroke-width="2.4" fill="none"/><g class="wh57"><circle cx="720" cy="60" r="38" fill="none" stroke="#c9d1d9" stroke-width="2"/>${Array.from({ length: 10 }, (_, i) => `<path d="M720 60 L${(720 + Math.cos(i * .628) * 38).toFixed(1)} ${(60 + Math.sin(i * .628) * 38).toFixed(1)}" stroke="#c9d1d9" stroke-width="1"/><circle class="lb57" style="animation-delay:-${(i * .1).toFixed(1)}s" cx="${(720 + Math.cos(i * .628) * 38).toFixed(1)}" cy="${(60 + Math.sin(i * .628) * 38).toFixed(1)}" r="1.6" fill="#FFD24A"/>`).join('')}</g>${Array.from({ length: 10 }, (_, i) => `<g class="gd57" style="--a:${(i * 36)}deg"><rect x="-5" y="0" width="10" height="7" rx="2" fill="${['#E5483B', '#3E8EDE', '#FFD24A', '#3FA66B', '#B07CFF'][i % 5]}"/></g>`).join('')}</g>`
      + `<g class="ca57"><path d="M520 110 V80" stroke="#8a5a2b" stroke-width="2"/><path d="M490 80 L520 62 L550 80Z" fill="#FF7AB6"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${490 + i * 7.5} 80 q3.75 4 7.5 0" fill="${i % 2 ? '#fff' : '#E5483B'}"/>`).join('')}<rect x="490" y="104" width="60" height="6" fill="#a87a4a"/><g class="hs57">${[0, 1, 2].map((i) => `<g transform="translate(${500 + i * 20} 94)"><path d="M0 -14 V6" stroke="#d4a017" stroke-width="1"/><ellipse cx="0" cy="0" rx="6" ry="3.4" fill="${['#fff', '#FFD24A', '#5CE1E6'][i]}"/><circle cx="5" cy="-3" r="2" fill="${['#fff', '#FFD24A', '#5CE1E6'][i]}"/></g>`).join('')}</g></g>`
      + `<g class="cf57">${kid(0, 108, '#3FA66B', '#D4A63B')}<path d="M6 92 v-10" stroke="#ddd" stroke-width="1"/><circle cx="6" cy="78" r="6" fill="#FFB3C7"/></g>` });
  hide(57, ['.fw57', '.ca57', '.cf57']);
  mv(57, '.fw57', 20, [[0, 'scale(0)', 0], [4, 'scale(0)', 1], [12, 'scale(1)', 1], [90, 'scale(1)', 1], [98, 'scale(0)', 1], [100, 'scale(0)', 0]]); fbb('.fw57');
  K('k57w', '0%{transform:rotate(0)}100%{transform:rotate(360deg)}'); css += '.go-57 .wh57{animation:k57w 8s linear infinite;transform-origin:720px 60px}';
  K('k57g', '0%{transform:translate(720px,60px) rotate(var(--a)) translateX(38px) rotate(calc(-1 * var(--a)))}100%{transform:translate(720px,60px) rotate(calc(var(--a) + 360deg)) translateX(38px) rotate(calc(-1 * var(--a) - 360deg))}'); css += '.go-57 .gd57{animation:k57g 8s linear infinite}';
  css += '.go-57 .lb57{animation:fptw .6s linear infinite}';
  mv(57, '.ca57', 20, [[0, 'scale(0)', 0], [8, 'scale(0)', 1], [16, 'scale(1)', 1], [90, 'scale(1)', 1], [98, 'scale(0)', 1], [100, 'scale(0)', 0]]); fbb('.ca57');
  K('k57h', '0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}'); css += '.go-57 .hs57 > g{animation:k57h .8s ease-in-out infinite}.go-57 .hs57 > g:nth-child(2){animation-delay:-.27s}.go-57 .hs57 > g:nth-child(3){animation-delay:-.53s}';
  mv(57, '.cf57', 20, [[0, 'translateX(300px)', 0], [24, 'translateX(300px)', 1], [80, 'translateX(900px)', 1], [84, 'translateX(940px)', 0], [100, 'translateX(940px)', 0]], 'linear');

  // 58 BIG – butterfly cloud: hundreds of butterflies rise from the meadow in colourful waves, spiral around the house, gather into one giant glowing butterfly in the sky that flaps its wings three times, then burst apart in all directions
  add({ n: 58, big: true, t: 'Schmetterlings-Wolke', scene: 'Frühling', where: 'die Wiese', dur: 18,
    g: Array.from({ length: 70 }, (_, i) => { const ang = (i / 70) * Math.PI * 2; const wing = i % 2 ? 1 : -1; const rr = 10 + (i * 7) % 34; const tx = 640 + wing * Math.abs(Math.cos(ang)) * rr * 1.6; const ty = 46 + Math.sin(ang) * rr * .9;
      return `<g class="bf58" style="--sx:${(i * 61) % 1200}px;--tx:${tx.toFixed(0)}px;--ty:${ty.toFixed(0)}px;--ex:${Math.round(Math.cos(i) * 700)}px;--ey:${Math.round(Math.sin(i) * 120)}px;animation-delay:${((i % 14) * .08).toFixed(2)}s"><g class="bfw"><path d="M0 0 q-5 -6 -6 0 q1 4 6 0 q5 -6 6 0 q-1 4 -6 0z" fill="${['#FF7AB6', '#FFD24A', '#5CE1E6', '#B07CFF', '#FF8A3C', '#7CFF8A'][i % 6]}"/></g></g>`; }).join('')
      + `<g class="gb58"><path d="M640 50 q-46 -56 -84 -14 q-8 34 84 14 q-46 34 -46 46 q12 12 46 -46 q46 -56 84 -14 q8 34 -84 14 q46 34 46 46 q-12 12 -46 -46z" fill="#FFB3E0" opacity=".35"/><path d="M640 20 v60" stroke="#5a3b22" stroke-width="2"/><path d="M640 20 q-6 -10 -12 -12 M640 20 q6 -10 12 -12" stroke="#5a3b22" stroke-width="1" fill="none"/></g>` });
  hide(58, ['.bf58', '.gb58']);
  K('k58b', '0%{opacity:0;transform:translate(var(--sx),112px)}6%{opacity:1}24%{transform:translate(calc(var(--sx) * .3 + 420px),30px)}36%{transform:translate(calc(var(--sx) * .2 + 560px),80px)}48%,74%{transform:translate(var(--tx),var(--ty))}90%{opacity:1}100%{opacity:0;transform:translate(calc(var(--tx) + var(--ex)),calc(var(--ty) + var(--ey)))}'); css += '.go-58 .bf58{animation:k58b 18s ease-in-out forwards}';
  K('k58w', '0%,100%{transform:scaleX(1)}50%{transform:scaleX(.2)}'); css += '.go-58 .bfw{animation:k58w .2s linear infinite;transform-box:fill-box;transform-origin:center}';
  mv(58, '.gb58', 18, [[0, 'scale(.6)', 0], [48, 'scale(.6)', 0], [54, 'scale(1.1)', 1], [58, 'scale(.5,1)', 1], [62, 'scale(1.1)', 1], [66, 'scale(.5,1)', 1], [70, 'scale(1.1)', 1], [76, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.gb58');

  // 59 BIG – water slide from the roof: a ladder and a smooth slide in ONE single arc from the roof right into the middle of the pool, water runs down, three kids slide one after another with arms up ("Juhuu!"), each lands with a splash in the pool, the third with a huge cannonball ("PLATSCH!")
  const SL1 = 'M672 44 C 730 44 728 96 640 103';
  add({ n: 59, big: true, t: 'Wasserrutsche vom Dach', scene: 'Über 30 Grad (Pool)', where: 'das Haus', dur: 18,
    g: `<g class="ld59"><path d="M690 104 V40 M700 104 V40" stroke="#9aa6b6" stroke-width="1.6"/>${Array.from({ length: 7 }, (_, i) => `<path d="M690 ${98 - i * 9} h10" stroke="#9aa6b6" stroke-width="1.4"/>`).join('')}</g>`
      + `<g class="ws59"><path class="wsp" d="${SL1}" stroke="#2f6fb8" stroke-width="12" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path class="wsp" d="${SL1}" stroke="#3E8EDE" stroke-width="9" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path class="wsp" d="${SL1}" stroke="#9fdcff" stroke-width="3" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path class="wfl" d="${SL1}" stroke="#fff" stroke-width="1" fill="none" stroke-dasharray="3 7"/></g>`
      + [['#E5483B', '#D4A63B'], ['#3FA66B', '#6b4a2e'], ['#FF7AB6', '#2b2b2b']].map(([c, h], i) => `<g class="sk59 sk${i}" style="offset-path:path('M672 38 C 730 38 728 90 640 97');animation-delay:${(5 + i * 3).toFixed(1)}s"><path d="M-3 -6 l-3 -6 M3 -6 l3 -6" stroke="#F3CDA6" stroke-width="1.6" stroke-linecap="round"/><circle cx="0" cy="-4" r="3.6" fill="#F3CDA6"/><path d="M-3.6 -5 q3.6 -5 7.2 0z" fill="${h}"/><rect x="-3" y="-1" width="6" height="5" rx="2" fill="${c}"/></g>`).join('')
      + [0, 1, 2].map((i) => `<g class="sp59" style="animation-delay:${(7.2 + i * 3).toFixed(1)}s"><path d="M${i === 2 ? 620 : 630} 104 q${i === 2 ? 10 : 6} -${i === 2 ? 38 : 22} ${i === 2 ? 20 : 10} -${i === 2 ? 46 : 26} q${i === 2 ? 10 : 4} ${i === 2 ? 8 : 4} ${i === 2 ? 20 : 10} ${i === 2 ? 46 : 26}z" fill="#d6f3ff"/>${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${624 + k * 6}" cy="${80 - (k % 2) * 8 - (i === 2 ? 14 : 0)}" r="1.8" fill="#d6f3ff"/>`).join('')}</g>`).join('')
      + `<g class="jh59"></g><g class="pl59"></g>` });
  hide(59, ['.ld59', '.ws59', '.sk59', '.sp59', '.jh59', '.pl59']);
  mv(59, '.ld59', 18, [[0, 'scaleY(0)', 0], [4, 'scaleY(0)', 1], [10, 'scaleY(1)', 1], [92, 'scaleY(1)', 1], [96, 'scaleY(0)', 0], [100, 'scaleY(0)', 0]]); fbb('.ld59');
  css += '.go-59 .ws59{opacity:1}'; K('k59p', '0%,6%{stroke-dashoffset:100;opacity:1}22%,90%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}'); css += '.go-59 .wsp{animation:k59p 18s ease-out forwards}';
  K('k59f', 'to{stroke-dashoffset:-20}'); css += '.tp-59 .wfl{opacity:0}.go-59 .wfl{animation:k59f .5s linear infinite,k59fo 18s linear forwards}'; K('k59fo', '0%,22%{opacity:0}24%,90%{opacity:.9}100%{opacity:0}');
  K('k59s', '0%{offset-distance:0%;opacity:1}100%{offset-distance:100%;opacity:1}'); css += '.sk59{offset-rotate:0deg}.go-59 .sk59{animation:k59s 2.2s ease-in both}';
  K('k59x', '0%{opacity:0;transform:scaleY(.2)}20%{opacity:1;transform:scaleY(1.2)}100%{opacity:0;transform:scaleY(.6)}'); css += '.go-59 .sp59{animation:k59x 1.4s ease-out both;transform-box:fill-box;transform-origin:50% 100%}';
  mv(59, '.jh59', 18, [[0, 'scale(.4)', 0], [28, 'scale(.4)', 0], [32, 'scale(1.2)', 1], [74, 'scale(1)', 1], [78, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.jh59');
  mv(59, '.pl59', 18, [[0, 'scale(.4)', 0], [90, 'scale(.4)', 0], [91, 'scale(1.4)', 1], [96, 'scale(1)', 1], [100, 'scale(1)', 0]]); fb('.pl59');

  // 60 BIG – spooky night: the lights flicker, the sky turns purple, ghosts fly out of the chimney, pumpkins light up with faces, a swarm of bats circles the moon, "BUH!" – then everyone laughs ("Hihi!") and it is cosy again
  add({ n: 60, big: true, t: 'Gespensternacht', scene: 'Herbst in der Nacht', where: 'das Haus', dur: 18,
    g: `<rect class="pu60" x="0" y="0" width="1200" height="120" fill="#3b1a5a"/>`
      + [0, 1, 2].map((i) => `<g class="gh60 gh${i}"><g class="ghr"><path d="M-8 6 v-12 q8 -12 16 0 v12 l-3 -3 -2.6 3 -2.4 -3 -2.4 3 -2.6 -3z" fill="#fff" opacity=".92"/><circle cx="-3" cy="-4" r="1.4" fill="#1d1d1d"/><circle cx="3" cy="-4" r="1.4" fill="#1d1d1d"/><ellipse cx="0" cy="1" rx="1.6" ry="2.2" fill="#1d1d1d"/></g></g>`).join('')
      + [560, 600, 700, 740].map((x, i) => `<g class="pk60" style="animation-delay:${(4 + i * .4).toFixed(1)}s"><g transform="translate(${x} 110)"><ellipse cx="0" cy="-6" rx="9" ry="7" fill="#FF8A1A"/><path d="M0 -13 v-3" stroke="#3f8a2e" stroke-width="1.6"/><path d="M-5 -8 l2 -3 2 3z M1 -8 l2 -3 2 3z M-5 -4 q5 4 10 0 l-2 1 -2 -1 -2 1 -2 -1z" fill="#FFE27A"/></g></g>`).join('')
      + Array.from({ length: 10 }, (_, i) => `<g class="bt60" style="--a:${i * 36}deg;--r:${18 + (i % 3) * 8}px;animation-delay:-${(i * .2).toFixed(1)}s"><path d="M0 0 q-4 -4 -8 -1 q2 0 3 2 q-2 0 -3 2 q4 1 8 -3 q4 4 8 3 q-1 -2 -3 -2 q1 -2 3 -2 q-4 -3 -8 1z" fill="#1d1d1d"/></g>`).join('')
      + `<g class="bu60"><text x="640" y="64" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" stroke="#3b1a5a" stroke-width="1.2" font-family="system-ui,sans-serif">BUH!</text></g><g class="hi60"></g>` });
  hide(60, ['.pu60', '.gh60', '.pk60', '.bt60', '.bu60', '.hi60']);
  mv(60, '.pu60', 18, [[0, 'none', 0], [2, 'none', .3], [3, 'none', 0], [4, 'none', .4], [5, 'none', 0], [10, 'none', .55], [86, 'none', .55], [96, 'none', 0], [100, 'none', 0]], 'steps(1)');
  [[0, 680, 600], [1, 520, 680], [2, 820, 590]].forEach(([i, x2, x3]) => mv(60, `.gh${i}`, 18, [[0, 'translate(667px,32px) scale(.2)', 0], [10 + i * 4, 'translate(667px,32px) scale(.2)', 0], [16 + i * 4, 'translate(667px,10px) scale(1)', 1], [36 + i * 4, `translate(${x2}px,30px)`, 1], [56 + i * 2, `translate(${x3}px,20px)`, 1], [64, 'translate(640px,40px) scale(1.6)', 1], [70, `translate(${x2}px,10px) scale(1)`, 1], [84, `translate(${x2 + 200}px,-20px)`, 1], [88, `translate(${x2 + 200}px,-20px)`, 0], [100, 'translate(0,0)', 0]]));
  loop(60, '.ghr', 'bobk', .7);
  K('k60p', '0%{opacity:0;transform:scale(.3)}10%{opacity:1;transform:scale(1)}90%{opacity:1}100%{opacity:1}'); css += '.go-60 .pk60{animation:k60p 12s ease-out forwards;transform-box:fill-box;transform-origin:50% 100%}';
  K('k60b', '0%{transform:translate(800px,30px) rotate(var(--a)) translateX(var(--r)) rotate(calc(-1 * var(--a)))}100%{transform:translate(800px,30px) rotate(calc(var(--a) + 360deg)) translateX(var(--r)) rotate(calc(-1 * var(--a) - 360deg))}'); css += '.go-60 .bt60{animation:k60b 3s linear infinite,k60bo 18s linear forwards}'; K('k60bo', '0%,20%{opacity:0}26%,84%{opacity:1}90%,100%{opacity:0}');
  mv(60, '.bu60', 18, [[0, 'scale(.3)', 0], [62, 'scale(.3)', 0], [64, 'scale(1.4)', 1], [70, 'scale(1)', 1], [72, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.bu60');
  mv(60, '.hi60', 18, [[0, 'scale(.4)', 0], [74, 'scale(.4)', 0], [78, 'scale(1.2)', 1], [88, 'scale(1)', 1], [90, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.hi60');

  // ================================================================ 20 NEW BIG ONES (61–80)
  const ring = (n, cx, cy, r, c) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * .6, c]; });
  const heartPts = (n, cx, cy, k) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + 16 * Math.pow(Math.sin(a), 3) * k, cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * k * .62]; });
  void ring;

  // 61 BIG – meteor impact: the sky reddens, a huge glowing meteor with a three-layer fiery tail and sparks races in, hits the hills behind the house – blinding flash, an orange fireball dome, a shockwave ring, flying rocks and a mushroom of smoke; the crater glows, a little green alien climbs out, waves "Hallo!", hops into a tiny saucer and zips away
  add({ n: 61, big: true, pull: true, t: 'Meteor mit Besuch', scene: 'Jeder Tag', where: 'den Himmel', dur: 18,
    g: `<rect class="rd61" x="0" y="0" width="1200" height="120" fill="#ff5a2a"/>`
      + `<g class="me61"><path d="M0 0 L-150 -60" stroke="#ff5a1a" stroke-width="16" stroke-linecap="round" opacity=".35"/><path d="M0 0 L-110 -44" stroke="#FFB02E" stroke-width="9" stroke-linecap="round" opacity=".7"/><path d="M0 0 L-70 -28" stroke="#FFF3B0" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="0" r="10" fill="#6b3a1c"/><circle cx="-2" cy="-2" r="4" fill="#8a5a2b"/><circle cx="0" cy="0" r="16" fill="#FF8A1A" opacity=".45"/>${Array.from({ length: 10 }, (_, i) => `<circle class="ms61" style="animation-delay:-${(i * .1).toFixed(1)}s" cx="${-20 - i * 12}" cy="${-8 - i * 5 + (i % 2) * 8}" r="1.6" fill="#FFE27A"/>`).join('')}</g>`
      + `<g class="cs61"><path d="M780 109 l-50 2 l-26 -2 l-30 3" stroke="#2b1d16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M780 109 l60 1 l34 -3 l28 2" stroke="#2b1d16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M780 109 l-24 5" stroke="#2b1d16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M780 109 l30 5" stroke="#2b1d16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M780 109 l-80 -1" stroke="#2b1d16" stroke-width="1.6" fill="none" stroke-linecap="round"/></g><rect class="fl61" x="0" y="0" width="1200" height="120" fill="#fff"/>`
      + `<g class="fb61"><path d="M690 108 A 90 72 0 0 1 870 108Z" fill="#FF8A1A"/><path d="M725 108 A 55 44 0 0 1 835 108Z" fill="#FFE27A"/></g>`
      + `<ellipse class="sw61" cx="780" cy="108" rx="30" ry="8" fill="none" stroke="#fff" stroke-width="3"/>`
      + Array.from({ length: 14 }, (_, i) => `<circle class="rk61" style="--dx:${Math.round(((i * 71) % 400) - 200)}px;--dy:${-30 - (i * 13) % 30}px" cx="780" cy="104" r="${2 + (i % 3)}" fill="#5a3a2a"/>`).join('')
      + `<g class="mu61"><ellipse cx="780" cy="40" rx="44" ry="18" fill="#6b5f5a"/><ellipse cx="780" cy="36" rx="30" ry="12" fill="#857873"/><rect x="770" y="50" width="20" height="58" fill="#6b5f5a"/></g>`
      + `<g class="cr61"><ellipse cx="780" cy="110" rx="34" ry="6" fill="#3a2a22"/><ellipse cx="780" cy="109" rx="20" ry="3.4" fill="#FF8A1A" class="glw"/></g>`
      + `<g class="al61"><g transform="translate(780 107)"><ellipse cx="0" cy="-6" rx="5" ry="6" fill="#7CFF8A"/><ellipse cx="-2" cy="-8" rx="1.6" ry="2.2" fill="#1d1d1d"/><ellipse cx="2" cy="-8" rx="1.6" ry="2.2" fill="#1d1d1d"/><path d="M-3 -12 l-3 -6 M3 -12 l3 -6" stroke="#7CFF8A" stroke-width="1"/><circle cx="-6" cy="-18" r="1.2" fill="#FFE27A"/><circle cx="6" cy="-18" r="1.2" fill="#FFE27A"/><g class="aw61"><path d="M5 -4 l5 -5" stroke="#7CFF8A" stroke-width="2" stroke-linecap="round"/></g></g></g>`
      + `<g class="hi61"><path d="M792 50 h46 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-36 l-6 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4z" fill="#fff"/></g>`
      + `<g class="us61"><ellipse cx="0" cy="0" rx="14" ry="4" fill="#9aa6b6"/><path d="M-6 -2 q6 -9 12 0z" fill="#7fdcff"/><circle cx="0" cy="-4" r="1.6" fill="#7CFF8A"/></g>` + `<g class="bo61"></g>` + `${[0, 1].map((s) => `<g class="dw61 dw${s}"><ellipse cx="0" cy="104" rx="40" ry="9" fill="#b9a68a" opacity=".75"/><ellipse cx="${s ? 30 : -30}" cy="100" rx="24" ry="8" fill="#cbb89b" opacity=".6"/></g>`).join('')}${Array.from({ length: 14 }, (_, i) => `<path class="rk61" style="--dx:${(i - 7) * 26}px;--h:${-50 - (i % 4) * 14}px;animation-delay:${(4.1 + (i % 5) * .05).toFixed(2)}s" d="M780 104 l3 -3 4 1 1 4 -4 3 -4 -1z" fill="#5a4a3a"/>`).join('')}` });
  css += '.hi61{display:none}'; css += '.tx41{display:none}';
  hide(61, ['.cs61', '.bo61', '.rd61', '.me61', '.fl61', '.fb61', '.sw61', '.rk61', '.mu61', '.cr61', '.al61', '.hi61', '.us61']);
  hide(61, ['.dw61', '.rk61']);
  mv(61, '.cs61', 18, [[0, 'scaleX(0)', 0], [23, 'scaleX(0)', 1], [27, 'scaleX(1)', 1], [92, 'scaleX(1)', 1], [98, 'scaleX(1)', 0], [100, 'scaleX(1)', 0]]); css += '.cs61{transform-box:view-box;transform-origin:780px 109px}';
  K('k61j', '0%,22%,44%,100%{transform:none}23%{transform:translate(-12px,8px) rotate(-1.6deg)}24%{transform:translate(13px,-9px) rotate(1.5deg)}25%{transform:translate(-10px,6px) rotate(-1deg)}27%{transform:translate(9px,-5px)}29%{transform:translate(-7px,4px)}32%{transform:translate(5px,-2px)}36%{transform:translate(-3px,1px)}40%{transform:translate(1px,0)}'); css += '.go-61 > .pull{animation:k61j 18s linear forwards}';
  mv(61, '.dw0', 18, [[0, 'translateX(780px) scale(.2)', 0], [23, 'translateX(780px) scale(.2)', 1], [40, 'translateX(380px) scale(2.4,1.4)', 0], [100, 'translateX(380px)', 0]], 'ease-out'); mv(61, '.dw1', 18, [[0, 'translateX(780px) scale(.2)', 0], [23, 'translateX(780px) scale(.2)', 1], [40, 'translateX(1180px) scale(2.4,1.4)', 0], [100, 'translateX(1180px)', 0]], 'ease-out');
  K('k61r', '0%{opacity:1;transform:translate(0,0) rotate(0)}50%{transform:translate(calc(var(--dx) * .6),var(--h)) rotate(200deg)}100%{opacity:1;transform:translate(var(--dx),14px) rotate(400deg)}'); css += '.tp-61 .rk61{opacity:0}.go-61 .rk61{animation:k61r 1.6s cubic-bezier(.3,0,.7,1) both;transform-box:fill-box;transform-origin:center}';
  mv(61, '.bo61', 18, [[0, 'scale(.3)', 0], [23, 'scale(.3)', 0], [25, 'scale(1.4)', 1], [34, 'scale(1)', 1], [38, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.bo61');
  mv(61, '.rd61', 18, [[0, 'none', 0], [6, 'none', .25], [22, 'none', .35], [40, 'none', 0], [100, 'none', 0]]);
  mv(61, '.me61', 18, [[0, 'translate(140px,-50px) scale(.5)', 0], [4, 'translate(200px,-20px) scale(.6)', 1], [22, 'translate(780px,104px) scale(1.2)', 1], [23, 'translate(780px,104px)', 0], [100, 'translate(780px,104px)', 0]], 'ease-in');
  css += '.go-61 .ms61{animation:fptw .3s linear infinite}';
  mv(61, '.fl61', 18, [[0, 'none', 0], [22, 'none', 0], [23, 'none', 1], [26, 'none', .7], [32, 'none', 0], [100, 'none', 0]]);
  mv(61, '.fb61', 18, [[0, 'scale(.2)', 0], [22, 'scale(.2)', 0], [24, 'scale(1.6)', 1], [34, 'scale(1.2)', .7], [38, 'scale(1)', 0], [100, 'scale(1)', 0]]); fbb('.fb61');
  mv(61, '.sw61', 18, [[0, 'scale(.2)', 0], [23, 'scale(.2)', 1], [38, 'scale(12,6)', 0], [100, 'scale(12,6)', 0]]); fb('.sw61');
  K('k61sh', '0%,22%,34%,100%{transform:translate(0,0)}24%{transform:translate(-4px,2px)}26%{transform:translate(4px,-2px)}28%{transform:translate(-3px,1px)}30%{transform:translate(2px,0)}'); css += '.go-61 .ov{animation:k61sh 18s linear}';
  K('k61r', '0%,22%{opacity:0;transform:translate(0,0)}24%{opacity:1}36%{transform:translate(calc(var(--dx) * .6),var(--dy))}46%,100%{opacity:0;transform:translate(var(--dx),20px)}'); css += '.go-61 .rk61{animation:k61r 18s ease-out forwards}';
  mv(61, '.mu61', 18, [[0, 'scale(.2)', 0], [24, 'scale(.2)', 0], [34, 'scale(1)', .9], [50, 'scale(1.3) translateY(-10px)', 0], [100, 'scale(1.3)', 0]]); fbb('.mu61');
  mv(61, '.cr61', 18, [[0, 'none', 0], [24, 'none', 0], [26, 'none', 1], [94, 'none', 1], [100, 'none', 0]]);
  mv(61, '.al61', 18, [[0, 'translateY(12px)', 0], [46, 'translateY(12px)', 0], [52, 'translateY(-4px)', 1], [56, 'translateY(0)', 1], [76, 'translateY(0)', 1], [80, 'translateY(-14px) scale(.6)', 0], [100, 'translateY(-14px)', 0]]);
  K('k61w', '0%,100%{transform:rotate(0)}50%{transform:rotate(-40deg)}'); css += '.go-61 .aw61{animation:k61w .5s ease-in-out infinite;transform-box:fill-box;transform-origin:0 100%}';
  mv(61, '.hi61', 18, [[0, 'scale(.3)', 0], [56, 'scale(.3)', 0], [60, 'scale(1)', 1], [74, 'scale(1)', 1], [78, 'scale(.3)', 0], [100, 'scale(.3)', 0]]); fb('.hi61');
  mv(61, '.us61', 18, [[0, 'translate(780px,60px)', 0], [74, 'translate(780px,60px)', 0], [76, 'translate(780px,80px)', 1], [80, 'translate(780px,78px)', 1], [92, 'translate(1300px,-20px)', 1], [94, 'translate(1300px,-20px)', 0], [100, 'translate(1300px,-20px)', 0]], 'ease-in');

  // 62 BIG – giant soap bubbles: two kids with bubble wands blow huge shimmering bubbles that float over the whole picture, wobble, merge and pop with a sparkle – the last one is so big it wraps the whole house for a moment
  add({ n: 62, big: true, t: 'Riesen-Seifenblasen', scene: 'Frühling / Sommer', where: 'die Wiese', dur: 18,
    g: `<defs><radialGradient id="sb62" cx="35%" cy="30%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="#e6f7ff" stop-opacity=".25"/><stop offset=".8" stop-color="#b6e3ff" stop-opacity=".18"/><stop offset=".92" stop-color="#ffb3e0" stop-opacity=".55"/><stop offset="1" stop-color="#9fdcff" stop-opacity=".8"/></radialGradient></defs>`
      + `<g class="kd62">${kid(500, 108, '#FF7AB6', '#D4A63B')}<path d="M504 88 l10 -12" stroke="#5CE1E6" stroke-width="1.4"/><circle cx="516" cy="74" r="3.4" fill="none" stroke="#5CE1E6" stroke-width="1.2"/>${kid(780, 108, '#3E8EDE', '#6b4a2e')}<path d="M776 88 l-10 -12" stroke="#B07CFF" stroke-width="1.4"/><circle cx="764" cy="74" r="3.4" fill="none" stroke="#B07CFF" stroke-width="1.2"/></g>`
      + Array.from({ length: 10 }, (_, i) => `<g class="bb62" style="--sx:${i % 2 ? 764 : 516}px;--tx:${280 + (i * 97) % 700}px;--ty:${10 + (i * 23) % 50}px;--r:${(.6 + (i % 4) * .35).toFixed(2)};animation-delay:${(1.5 + i * .9).toFixed(1)}s"><circle cx="0" cy="0" r="14" fill="url(#sb62)" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/><g class="pp62">${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M${(Math.cos(k) * 10).toFixed(1)} ${(Math.sin(k) * 10).toFixed(1)} l${(Math.cos(k) * 6).toFixed(1)} ${(Math.sin(k) * 6).toFixed(1)}" stroke="#fff" stroke-width="1.2"/>`).join('')}</g></g>`).join('')
      + `<g class="hb62"><ellipse cx="640" cy="68" rx="80" ry="54" fill="url(#sb62)" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/></g>` });
  hide(62, ['.kd62', '.bb62', '.hb62']);
  mv(62, '.kd62', 18, [[0, 'none', 0], [4, 'none', 1], [94, 'none', 1], [100, 'none', 0]]);
  K('k62b', '0%{opacity:0;transform:translate(var(--sx),74px) scale(.1)}6%{opacity:1;transform:translate(var(--sx),68px) scale(calc(var(--r) * .8))}40%{transform:translate(calc((var(--sx) + var(--tx)) / 2),calc(var(--ty) + 20px)) scale(var(--r)) rotate(10deg)}78%{opacity:1;transform:translate(var(--tx),var(--ty)) scale(calc(var(--r) * 1.1)) rotate(-10deg)}80%,100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(calc(var(--r) * 1.4))}'); css += '.go-62 .bb62{animation:k62b 6s ease-in-out forwards}';
  K('k62p', '0%,78%{opacity:0;transform:scale(.6)}80%{opacity:1;transform:scale(1)}90%,100%{opacity:0;transform:scale(1.8)}'); css += '.pp62{opacity:0}.go-62 .pp62{animation:k62p 6s ease-out forwards;animation-delay:inherit}';
  mv(62, '.hb62', 18, [[0, 'scale(.1) translateY(30px)', 0], [70, 'scale(.1) translateY(30px)', 0], [76, 'scale(1)', 1], [86, 'scale(1.05,0.95)', 1], [90, 'scale(1.2)', 0], [100, 'scale(1.2)', 0]]); fb('.hb62');

  // 63 BIG – laser show: night, a disco ball rises above the roof, coloured beams fan up into the sky AND down onto the meadow – every downward beam ends exactly in its own light spot on the grass, which runs along with it – they draw a star and a heart, fog glows, final flash
  add({ n: 63, big: true, t: 'Laser-Show', scene: 'Nacht', where: 'das Haus', dur: 16,
    g: DARK(63, 'dk63', 16, 4, 92, .6)
      + `<g class="db63"><path d="M640 0 v14" stroke="#9aa1aa"/><circle cx="640" cy="22" r="8" fill="#cfd8e3"/>${[0, 1, 2, 3].map((i) => `<path d="M633 ${18 + i * 3} h14" stroke="#8f99a6" stroke-width=".5"/>`).join('')}</g>`
      + `<g class="lz63">${Array.from({ length: 24 }, (_, i) => `<path class="lb63" style="--a:${-76 + i * 6.6}deg;animation-delay:-${(i * .09).toFixed(2)}s" d="M640 22 L640 -1500" stroke="${['#FF3DC8', '#33E6FF', '#7CFF8A', '#FFE27A'][i % 4]}" stroke-width="1.6" opacity=".85"/>`).join('')}`
      + Array.from({ length: 14 }, (_, i) => { const c = ['#33E6FF', '#FF3DC8', '#FFE27A', '#7CFF8A'][i % 4]; const base = 90 + i * 85; const xs = Array.from({ length: 9 }, (_, k) => (base + Math.sin(k * 1.6 + i) * 70).toFixed(0)); const vals = xs.map((x) => `M640 24 L${x} 108`).join(';');
        return `<path d="M640 24 L${xs[0]} 108" stroke="${c}" stroke-width="1.4" opacity=".8"><animate attributeName="d" begin="indefinite" dur="2.4s" repeatCount="6" values="${vals};M640 24 L${xs[0]} 108"/></path><ellipse cx="${xs[0]}" cy="108" rx="10" ry="3" fill="${c}" opacity=".7"><animate attributeName="cx" begin="indefinite" dur="2.4s" repeatCount="6" values="${xs.join(';')};${xs[0]}"/></ellipse>`; }).join('') + '</g>'
      + `<path class="st63" d="${(() => { const p = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 12 : 30; const a = (i * 36 - 90) * Math.PI / 180; return `${(460 + Math.cos(a) * r).toFixed(0)} ${(50 + Math.sin(a) * r).toFixed(0)}`; }); return 'M' + p.join(' L') + 'Z'; })()}" stroke="#33E6FF" stroke-width="2.2" fill="none" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`
      + `<path class="ht63" d="M${heartPts(30, 820, 50, 2).map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L')}Z" stroke="#FF3DC8" stroke-width="2.2" fill="none" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`
      + `<rect class="fo63" x="0" y="86" width="1200" height="34" fill="#B07CFF"/><rect class="ff63" x="0" y="0" width="1200" height="120" fill="#fff"/>` });
  hide(63, ['.dk63', '.db63', '.lz63', '.st63', '.ht63', '.fo63', '.ff63']);
  mv(63, '.db63', 16, [[0, 'translateY(-30px)', 0], [6, 'translateY(0)', 1], [92, 'translateY(0)', 1], [100, 'translateY(-30px)', 0]]);
  K('k63l', '0%,100%{transform:rotate(calc(var(--a) - 20deg))}50%{transform:rotate(calc(var(--a) + 20deg))}'); css += '.go-63 .lb63{animation:k63l 1.2s ease-in-out infinite;transform-origin:640px 22px}';
  mv(63, '.lz63', 16, [[0, 'none', 0], [8, 'none', 0], [10, 'none', 1], [90, 'none', 1], [94, 'none', 0], [100, 'none', 0]]);
  K('k63d', '0%,44%{stroke-dashoffset:100;opacity:1}54%,60%{stroke-dashoffset:0;opacity:1}64%,100%{opacity:0;stroke-dashoffset:0}'); css += '.go-63 .st63{animation:k63d 16s linear forwards}';
  K('k63h', '0%,48%{stroke-dashoffset:100;opacity:1}58%,64%{stroke-dashoffset:0;opacity:1}68%,100%{opacity:0;stroke-dashoffset:0}'); css += '.go-63 .ht63{animation:k63h 16s linear forwards}';
  mv(63, '.fo63', 16, [[0, 'none', 0], [12, 'none', .12], [88, 'none', .12], [96, 'none', 0], [100, 'none', 0]]);
  mv(63, '.ff63', 16, [[0, 'none', 0], [88, 'none', 0], [89, 'none', .8], [94, 'none', 0], [100, 'none', 0]]);

  // 65 BIG – the light house (exactly on the house): hundreds of bulbs light up one by one along the real roof line, the walls, the garage, the chimney and every window, then chase in colour waves, a power flicker, an illuminated reindeer appears on the lawn, icicle lights drip from the eaves – and a big star on the roof tip sends out rays
  // house geometry in scene coordinates (the pool house: x' = 640 + .75·(x − 956), y' = 99 + .75·(y − 99))
  const HP = (x, y) => [640 + .75 * (x - 956), 99 + .75 * (y - 99)];
  const along = (pts, step) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i]; const [bx, by] = pts[i + 1]; const L = Math.hypot(bx - ax, by - ay); const n = Math.max(1, Math.round(L / step)); for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]); } out.push(pts[pts.length - 1]); return out; };
  const LHOUSE = [].concat(
    along([HP(892, 44), HP(956, 5), HP(1020, 44)], 3.2),
    along([HP(900, 46), HP(900, 98)], 3.4), along([HP(1012, 46), HP(1012, 98)], 3.4),
    along([HP(988, 30), HP(988, 10), HP(997, 10), HP(997, 26)], 3),
    along([HP(850, 66), HP(902, 66)], 3.4), along([HP(852, 68), HP(852, 98)], 3.4),
    along([HP(916, 46), HP(944, 46), HP(944, 62), HP(916, 62), HP(916, 46)], 3), along([HP(968, 46), HP(996, 46), HP(996, 62), HP(968, 62), HP(968, 46)], 3),
    along([HP(902, 69), HP(1010, 69)], 3.2));
  const DEER = [[520, 100], [522, 92], [528, 88], [540, 88], [548, 84], [552, 78], [556, 74], [560, 76], [556, 80], [552, 86], [552, 100], [546, 92], [530, 92], [528, 100], [552, 74], [550, 66], [546, 62], [554, 66], [558, 62], [556, 70]];
  add({ n: 65, big: true, t: 'Lichterhaus', scene: 'Advent / Weihnachten (abends)', where: 'das Haus', dur: 20,
    g: `<g class="lh65">${LHOUSE.map(([x, y], i) => `<circle class="bl65" style="--i:${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5"/>`).join('')}</g>`
      + `<g class="ic65">${along([HP(892, 46), HP(956, 7), HP(1020, 46)], 5).map(([x, y], i) => `<path class="ic" style="animation-delay:-${(i * .07).toFixed(2)}s" d="M${x.toFixed(1)} ${(y + 1).toFixed(1)} v${(4 + (i % 3) * 2).toFixed(0)}" stroke="#eaf8ff" stroke-width="1" stroke-linecap="round"/>`).join('')}</g>`
      + `<g class="dr65">${DEER.map(([x, y], i) => `<circle class="dl65" style="animation-delay:-${(i * .1).toFixed(1)}s" cx="${x}" cy="${y}" r="1.5" fill="#fff6c8"/>`).join('')}<path d="M520 100 L522 92 L528 88 L540 88 L548 84 L552 78 L556 74 L560 76 L556 80 L552 86 L552 100 M546 92 L530 92 L528 100 M552 74 L550 66 L546 62 M550 66 L554 66 L558 62" stroke="#fff6c8" stroke-width=".6" fill="none" opacity=".6"/></g>`
      + `<rect class="pw65" x="0" y="0" width="1200" height="120" fill="#000"/>`
      + `<g class="sr65"><g class="ry65">${Array.from({ length: 12 }, (_, i) => `<path d="M640 26 L${(640 + Math.cos(i * .524) * 44).toFixed(0)} ${(26 + Math.sin(i * .524) * 26).toFixed(0)}" stroke="#FFE27A" stroke-width="1" opacity=".6"/>`).join('')}</g>${star(640, 24, 10, '#FFE27A')}<circle cx="640" cy="24" r="15" fill="#FFE27A" opacity=".3"/></g>` });
  hide(65, ['.lh65', '.ic65', '.dr65', '.pw65', '.sr65']);
  // each bulb switches on in turn (≈6 s for all), then colour chase waves run around the house
  const NB = LHOUSE.length;
  K('k65on', '0%{opacity:0;transform:scale(.2)}100%{opacity:1;transform:scale(1)}'); K('k65c', '0%{fill:#FF5A7A}25%{fill:#FFD24A}50%{fill:#5CE1E6}75%{fill:#7CFF8A}100%{fill:#FF5A7A}');
  css += `.go-65 .lh65{opacity:1}.bl65{fill:#FFD24A;opacity:0;transform-box:fill-box;transform-origin:center}.go-65 .bl65{animation:k65on .3s ease-out calc(var(--i) * ${(6 / NB).toFixed(4)}s) both,k65c 1.6s linear calc(7s - var(--i) * .02s) infinite}`;
  K('k65lo', '0%,94%{opacity:1}100%{opacity:0}'); css += '.go-65 .lh65{animation:k65lo 20s linear forwards}';
  mv(65, '.ic65', 20, [[0, 'none', 0], [34, 'none', 0], [38, 'none', 1], [94, 'none', 1], [100, 'none', 0]]); K('k65i', '0%,100%{opacity:.4}50%{opacity:1}'); css += '.go-65 .ic{animation:k65i 1s ease-in-out infinite}';
  mv(65, '.dr65', 20, [[0, 'none', 0], [42, 'none', 0], [46, 'none', 1], [94, 'none', 1], [100, 'none', 0]]); css += '.go-65 .dl65{animation:fptw .9s linear infinite}';
  mv(65, '.pw65', 20, [[0, 'none', 0], [56, 'none', 0], [57, 'none', .75], [58, 'none', 0], [59, 'none', .75], [60, 'none', 0], [62, 'none', .85], [64, 'none', 0], [100, 'none', 0]], 'steps(1)');
  mv(65, '.sr65', 20, [[0, 'scale(0) rotate(0)', 0], [66, 'scale(0)', 0], [72, 'scale(1.5) rotate(72deg)', 1], [76, 'scale(1) rotate(72deg)', 1], [94, 'scale(1) rotate(72deg)', 1], [100, 'scale(0)', 0]]); fb('.sr65');
  K('k65r', 'to{transform:rotate(30deg)}'); css += '.go-65 .ry65{animation:k65r 3s linear infinite;transform-origin:640px 26px}';

  // 66 BIG – the great comet: night falls, a huge comet with a long glowing blue-white tail slowly crosses the whole sky, sparkles trail behind, the stars twinkle and the kids watch from the meadow
  add({ n: 66, big: true, t: 'Grosser Komet', scene: 'Nacht', where: 'den Himmel', dur: 18,
    g: DARK(66, 'dk66', 18, 6, 88, .55)
      + `<defs><linearGradient id="ct66" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#9fe8ff" stop-opacity=".8"/><stop offset="1" stop-color="#5CE1E6" stop-opacity="0"/></linearGradient></defs>`
      + `<g class="cm66"><path d="M0 0 L-260 -40 L-260 -14 Z" fill="url(#ct66)" opacity=".7"/><path d="M0 0 L-200 -60 L-200 -50 Z" fill="url(#ct66)" opacity=".4"/><circle cx="0" cy="0" r="6" fill="#fff"/><circle cx="0" cy="0" r="12" fill="#bff0ff" opacity=".4"/>${Array.from({ length: 10 }, (_, i) => `<circle class="cs66" style="animation-delay:-${(i * .2).toFixed(1)}s" cx="${-20 - i * 18}" cy="${-4 - i * 3}" r="1" fill="#fff"/>`).join('')}</g>`
      + Array.from({ length: 30 }, (_, i) => `<circle class="st66" style="animation-delay:-${(i * .17).toFixed(2)}s" cx="${(i * 41) % 1200}" cy="${4 + (i * 13) % 40}" r="${.8 + (i % 3) * .3}" fill="#fff"/>`).join('')
      + `<g class="kd66">${kid(560, 108, '#FF7AB6', '#D4A63B')}${kid(578, 108, '#3E8EDE', '#6b4a2e')}${kid(596, 108, '#3FA66B', '#2b2b2b')}</g>` });
  hide(66, ['.dk66', '.cm66', '.st66', '.kd66']);
  mv(66, '.cm66', 18, [[0, 'translate(100px,30px) rotate(10deg)', 0], [8, 'translate(160px,34px) rotate(10deg)', 1], [88, 'translate(1100px,60px) rotate(10deg)', 1], [94, 'translate(1160px,62px) rotate(10deg)', 0], [100, 'translate(1160px,62px)', 0]], 'linear');
  css += '.go-66 .cs66,.go-66 .st66{animation:fptw 1.2s linear infinite}'; K('k66s', '0%,8%{opacity:0}14%,88%{opacity:1}94%,100%{opacity:0}'); A(66, '.st66', 'k66s', 18, 'linear'); css += '.go-66 .st66{animation:k66s 18s linear forwards,fptw 1.2s linear infinite}';
  mv(66, '.kd66', 18, [[0, 'none', 0], [10, 'none', 1], [90, 'none', 1], [100, 'none', 0]]);

  // 67 BIG – fireworks heart: night, rockets rise in a ring, burst one after another and their sparks draw a giant glowing heart in the sky, inside it a smaller heart, then everything rains down in gold
  add({ n: 67, big: true, t: 'Feuerwerk-Herz', scene: 'Valentinstag / Hochzeitstag (abends)', where: 'den Himmel', dur: 16,
    g: DARK(67, 'dk67', 16, 4, 92, .5)
      + heartPts(18, 640, 50, 2.6).map(([x, y], i) => `<path class="rk67" style="animation-delay:${(1 + i * .12).toFixed(2)}s" d="M640 116 L${x.toFixed(0)} ${y.toFixed(0)}" stroke="#FFE27A" stroke-width="1.2" pathLength="100" stroke-dasharray="10 100" stroke-dashoffset="100"/><g class="bs67" style="animation-delay:${(1.9 + i * .12).toFixed(2)}s"><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})">${Array.from({ length: 8 }, (_, k) => `<path d="M0 0 L${(Math.cos(k * .785) * 7).toFixed(1)} ${(Math.sin(k * .785) * 7).toFixed(1)}" stroke="${i % 2 ? '#FF5A7A' : '#FF7AB6'}" stroke-width="1.4" stroke-linecap="round"/>`).join('')}<circle r="2" fill="#fff"/></g></g>`).join('')
      + `<g class="ih67">${heart(640, 52, 1.4, '#FF3D7A')}</g>`
      + Array.from({ length: 40 }, (_, i) => `<circle class="gr67" style="--x:${560 + (i * 17) % 160}px;animation-delay:${(9 + (i % 10) * .2).toFixed(1)}s" cx="0" cy="0" r="1.2" fill="#FFD24A"/>`).join('') });
  hide(67, ['.dk67', '.rk67', '.bs67', '.ih67', '.gr67']);
  K('k67r', '0%{opacity:1;stroke-dashoffset:100}100%{opacity:0;stroke-dashoffset:10}'); css += '.go-67 .rk67{animation:k67r .8s ease-in forwards}';
  K('k67b', '0%{opacity:0;transform:scale(.2)}20%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}'); css += '.go-67 .bs67{animation:k67b 7s ease-out forwards;transform-box:fill-box;transform-origin:center}';
  mv(67, '.ih67', 16, [[0, 'scale(0)', 0], [30, 'scale(0)', 0], [36, 'scale(1.3)', 1], [40, 'scale(1)', 1], [56, 'scale(1.15)', 1], [60, 'scale(1)', 1], [64, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.ih67');
  K('k67g', '0%{opacity:0;transform:translate(var(--x),40px)}10%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 10px),116px)}'); css += '.go-67 .gr67{animation:k67g 3s linear forwards}';

  // 68 BIG – underwater world: it rains so much that water rises over the whole picture, fish swim through the garden, a turtle paddles past the house, bubbles rise, a little yellow submarine waves – then the water drains away
  add({ n: 68, big: true, t: 'Unterwasser-Garten', scene: 'Regen', where: 'den Himmel', dur: 18,
    g: `<rect class="wa68" x="0" y="0" width="1200" height="120" fill="#1e7fd0"/><path class="sf68" d="M0 0 q30 -4 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#bff0ff" stroke-width="2" fill="none"/>`
      + [[0, '#FF8A1A', 1], [1, '#FFD24A', .8], [2, '#FF5A7A', .9], [3, '#5CE1E6', .7], [4, '#B07CFF', 1.1]].map(([i, c, k]) => `<g class="fi68 f68${i}"><g transform="scale(${k})"><ellipse cx="0" cy="0" rx="8" ry="4.4" fill="${c}"/><path d="M8 0 l6 -4 v8z" fill="${c}"/><circle cx="-4" cy="-1" r="1" fill="#1d1d1d"/><path d="M-2 -4 q2 -3 4 0" stroke="${c}" stroke-width="1.4" fill="none"/></g></g>`).join('')
      + `<g class="tu68"><g transform="scale(-1 1)"><ellipse cx="0" cy="0" rx="12" ry="7" fill="#3f8a2e"/><path d="M-8 -2 h16 M-6 3 h12 M0 -6 v12" stroke="#2f6b22" stroke-width="1"/><ellipse cx="-14" cy="-1" rx="4" ry="3" fill="#7cc35c"/><circle cx="-15" cy="-2" r=".7" fill="#1d1d1d"/><path class="fp68" d="M-6 6 l-4 4 M6 6 l4 4 M-6 -6 l-4 -4 M6 -6 l4 -4" stroke="#7cc35c" stroke-width="2.4" stroke-linecap="round"/></g></g>`
      + `<g class="sb68"><ellipse cx="0" cy="0" rx="20" ry="9" fill="#FFD24A"/><rect x="-4" y="-16" width="8" height="8" rx="2" fill="#FFD24A"/><path d="M2 -16 v-4 h4" stroke="#8a6a10" stroke-width="1" fill="none"/>${[-10, 0, 10].map((x) => `<circle cx="${x}" cy="0" r="3" fill="#7fdcff" stroke="#8a6a10" stroke-width=".8"/>`).join('')}<path d="M20 0 l6 -5 v10z" fill="#E5A800"/></g>`
      + Array.from({ length: 24 }, (_, i) => `<circle class="bu68" style="--x:${(i * 53) % 1200}px;animation-delay:${(4 + (i % 12) * .4).toFixed(1)}s" cx="0" cy="0" r="${1.4 + (i % 3)}" fill="none" stroke="#e6f7ff" stroke-width=".8"/>`).join('') });
  hide(68, ['.wa68', '.sf68', '.fi68', '.tu68', '.sb68', '.bu68']);
  mv(68, '.wa68', 18, [[0, 'translateY(120px)', .5], [16, 'translateY(0)', .5], [84, 'translateY(0)', .5], [98, 'translateY(120px)', .5], [100, 'translateY(120px)', 0]], 'ease-in-out');
  mv(68, '.sf68', 18, [[0, 'translateY(120px)', 1], [16, 'translateY(2px)', 1], [84, 'translateY(2px)', 1], [98, 'translateY(120px)', 1], [100, 'translateY(120px)', 0]], 'ease-in-out');
  [[0, 20, 40], [1, 24, 70], [2, 30, 54], [3, 36, 90], [4, 42, 30]].forEach(([i, t, y]) => mv(68, `.f68${i}`, 18, [[0, `translate(1260px,${y}px)`, 0], [t, `translate(1260px,${y}px)`, 1], [t + 30, `translate(${600 - i * 40}px,${y + 10}px)`, 1], [t + 46, `translate(-60px,${y}px)`, 1], [100, `translate(-60px,${y}px)`, 0]], 'linear'));
  mv(68, '.tu68', 18, [[0, 'translate(-40px,80px)', 0], [22, 'translate(-40px,80px)', 1], [80, 'translate(900px,70px)', 1], [84, 'translate(960px,70px)', 0], [100, 'translate(960px,70px)', 0]], 'linear');
  K('k68f', '0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}'); css += '.go-68 .fp68{animation:k68f .6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}';
  mv(68, '.sb68', 18, [[0, 'translate(1260px,40px)', 0], [30, 'translate(1260px,40px)', 1], [56, 'translate(700px,46px)', 1], [64, 'translate(680px,42px)', 1], [84, 'translate(300px,36px)', 1], [88, 'translate(260px,36px)', 0], [100, 'translate(260px,36px)', 0]], 'ease-in-out');
  K('k68b', '0%{opacity:0;transform:translate(var(--x),116px)}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 10px),10px)}'); css += '.go-68 .bu68{animation:k68b 4s linear 2}';

  // 70 BIG – hyperspace jump: the picture darkens, stars appear and stretch into long light streaks rushing outwards from the centre (warp speed!), a white flash – and back in the garden
  add({ n: 70, big: true, t: 'Hyperraum-Sprung', scene: 'Jeder Tag', where: 'den Himmel', dur: 12,
    g: DARK(70, 'dk70', 12, 8, 84, .95)
      + Array.from({ length: 70 }, (_, i) => { const a = (i * 137.5) * Math.PI / 180; const r0 = 6 + (i % 7) * 4; return `<path class="wp70" style="--a:${(a * 180 / Math.PI).toFixed(0)}deg;animation-delay:${(2 + (i % 10) * .05).toFixed(2)}s" d="M${(640 + Math.cos(a) * r0).toFixed(0)} ${(60 + Math.sin(a) * r0 * .5).toFixed(0)} L${(640 + Math.cos(a) * (r0 + 2)).toFixed(0)} ${(60 + Math.sin(a) * (r0 + 2) * .5).toFixed(0)}" stroke="${i % 5 ? '#fff' : '#9fdcff'}" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`; }).join('')
      + `<rect class="wf70" x="0" y="0" width="1200" height="120" fill="#fff"/><g class="wt70"></g>` });
  hide(70, ['.dk70', '.wp70', '.wf70', '.wt70']);
  K('k70w', '0%{opacity:0;transform:scale(1)}10%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(30)}'); css += '.go-70 .wp70{animation:k70w 1.6s ease-in 5;transform-origin:640px 60px}';
  mv(70, '.wf70', 12, [[0, 'none', 0], [82, 'none', 0], [84, 'none', 1], [94, 'none', 0], [100, 'none', 0]]);
  mv(70, '.wt70', 12, [[0, 'scale(.4)', 0], [20, 'scale(.4)', 0], [24, 'scale(1.4)', 1], [70, 'scale(1)', 1], [74, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.wt70');

  // 71 BIG – rainbow explosion: a small rainbow appears over the house, grows, then bursts outward in rings of colour that sweep over the whole picture, leaving colourful sparkles that float down
  add({ n: 71, big: true, t: 'Regenbogen-Explosion', scene: 'Sonne nach Regen', where: 'das Haus', dur: 14,
    g: `<g class="rb71">${[['#ff5a5a', 36], ['#ff9a3c', 31], ['#ffe94d', 26], ['#55d16b', 21], ['#4aa8ff', 16], ['#8a6bff', 11]].map(([c, r]) => `<path d="M${640 - r} 40 A ${r} ${r} 0 0 1 ${640 + r} 40" stroke="${c}" stroke-width="4" fill="none"/>`).join('')}</g>`
      + ['#ff5a5a', '#ff9a3c', '#ffe94d', '#55d16b', '#4aa8ff', '#8a6bff'].map((c, i) => `<circle class="rr71" style="animation-delay:${(5 + i * .25).toFixed(2)}s" cx="640" cy="50" r="10" fill="none" stroke="${c}" stroke-width="6" opacity=".8"/>`).join('')
      + Array.from({ length: 40 }, (_, i) => `<g class="sp71" style="--x:${(i * 31) % 1200}px;--y:${(i * 17) % 60}px;animation-delay:${(6 + (i % 10) * .2).toFixed(1)}s">${star(0, 0, 2.6, ['#ff5a5a', '#ffe94d', '#55d16b', '#4aa8ff', '#8a6bff', '#FF7AB6'][i % 6])}</g>`).join('') });
  hide(71, ['.rb71', '.rr71', '.sp71']);
  mv(71, '.rb71', 14, [[0, 'scale(.2)', 0], [6, 'scale(.4)', 1], [30, 'scale(1.6)', 1], [34, 'scale(1.9)', 1], [36, 'scale(2.4)', 0], [100, 'scale(2.4)', 0]]); css += '.rb71{transform-origin:640px 40px}';
  K('k71r', '0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(70)}'); css += '.go-71 .rr71{animation:k71r 2.6s ease-out forwards;transform-origin:640px 50px}';
  K('k71s', '0%{opacity:0;transform:translate(var(--x),var(--y)) rotate(0)}10%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 20px),116px) rotate(360deg)}'); css += '.go-71 .sp71{animation:k71s 5s linear forwards}';

  // 72 BIG – giant snowflake: a tiny snowflake drifts down to the middle, grows into a huge glittering ice crystal over the house, slowly turns and sparkles, then shatters into hundreds of little snowflakes that snow down
  add({ n: 72, big: true, t: 'Riesen-Schneeflocke', scene: 'Winter', where: 'den Himmel', dur: 16,
    g: `<g class="sf72"><g class="sfr">${Array.from({ length: 6 }, (_, i) => `<g transform="rotate(${i * 60} 640 50)"><path d="M640 50 V6 M640 18 l-8 -8 M640 18 l8 -8 M640 30 l-10 -8 M640 30 l10 -8 M640 10 l-4 -4 M640 10 l4 -4" stroke="#e6f7ff" stroke-width="2.6" stroke-linecap="round" fill="none"/><circle cx="640" cy="6" r="2" fill="#fff"/></g>`).join('')}<circle cx="640" cy="50" r="6" fill="#fff"/><circle cx="640" cy="50" r="50" fill="#bff0ff" opacity=".12"/></g></g>`
      + Array.from({ length: 10 }, (_, i) => `<g class="gs72" style="animation-delay:-${(i * .3).toFixed(1)}s">${star(600 + (i * 19) % 80, 14 + (i * 13) % 70, 2.4, '#fff')}</g>`).join('')
      + Array.from({ length: 70 }, (_, i) => `<circle class="sn72" style="--dx:${Math.round(Math.cos(i) * (100 + (i * 7) % 500))}px;animation-delay:${(.02 * (i % 20)).toFixed(2)}s" cx="640" cy="50" r="${1 + (i % 3) * .6}" fill="#fff"/>`).join('') });
  hide(72, ['.sf72', '.gs72', '.sn72']);
  mv(72, '.sf72', 16, [[0, 'translate(-100px,-60px) scale(.08)', 0], [4, 'translate(-60px,-40px) scale(.08)', 1], [20, 'translate(0,0) scale(.1)', 1], [36, 'scale(1)', 1], [68, 'scale(1.05)', 1], [70, 'scale(1.3)', 0], [100, 'scale(1.3)', 0]], 'ease-in-out'); css += '.sf72{transform-origin:640px 50px}';
  K('k72r', '0%{transform:rotate(0)}100%{transform:rotate(60deg)}'); css += '.go-72 .sfr{animation:k72r 8s linear infinite;transform-origin:640px 50px}';
  K('k72g', '0%,34%{opacity:0}40%,68%{opacity:1}70%,100%{opacity:0}'); css += '.go-72 .gs72{animation:k72g 16s linear forwards,fptw .6s linear infinite}';
  K('k72n', '0%,68%{opacity:0;transform:translate(0,0)}70%{opacity:1}100%{opacity:.6;transform:translate(var(--dx),70px)}'); css += '.go-72 .sn72{animation:k72n 16s ease-out forwards}';

  // 73 BIG – fireflies say good night: dusk falls, hundreds of fireflies rise from the grass, swarm around the trees and the house, then gather to write "Gute Nacht" in glowing letters, blink three times and fly apart
  add({ n: 73, big: true, t: 'Glühwürmchen-Gruss', scene: 'Sommer am Abend', where: 'die Wiese', dur: 18,
    g: DARK(73, 'dk73', 18, 6, 90, .6)
      + (() => { const F = { G: ['01110', '10000', '10110', '10010', '01110'], u: ['00000', '10010', '10010', '10010', '01110'], t: ['01000', '11100', '01000', '01000', '00110'], e: ['00000', '01100', '11110', '10000', '01110'], N: ['10010', '11010', '10110', '10010', '10010'], a: ['00000', '01110', '00010', '01110', '01110'], c: ['00000', '01110', '10000', '10000', '01110'], h: ['10000', '10000', '11100', '10010', '10010'], ' ': ['0', '0', '0', '0', '0'] };
        const pts = []; let x0 = 0; 'Gute Nacht'.split('').forEach((ch) => { const g = F[ch]; g.forEach((row, ry) => row.split('').forEach((v, rx) => { if (v === '1') pts.push([x0 + rx * 5, ry * 6]); })); x0 += (g[0].length + 1) * 5; });
        const w = x0; return pts.map(([x, y], i) => `<g class="ff73" style="--sx:${(i * 53) % 1200}px;--tx:${(640 - w / 2 + x).toFixed(0)}px;--ty:${(30 + y).toFixed(0)}px;animation-delay:${(i % 15 * .05).toFixed(2)}s"><circle r="3.6" fill="#E9FF7A" opacity=".35"/><circle r="1.4" fill="#fbffd0"/></g>`).join(''); })() });
  hide(73, ['.dk73', '.ff73']);
  K('k73', '0%{opacity:0;transform:translate(var(--sx),112px)}8%{opacity:1}24%{transform:translate(calc(var(--sx) * .5 + 300px),60px)}34%{transform:translate(calc(var(--sx) * .3 + 450px),30px)}48%,80%{transform:translate(var(--tx),var(--ty))}52%,60%,68%{opacity:1}56%,64%{opacity:.2}92%{opacity:1}100%{opacity:0;transform:translate(calc(var(--tx) * 1.2 - 128px),-20px)}'); css += '.go-73 .ff73{animation:k73 18s ease-in-out forwards}';

  // 74 BIG – drone light show: night, two hundred real little drones (four rotors, a light underneath) take off from the whole garden with a hum, fill the sky and fly giant shapes: a star, the house, a heart, a rocket and a huge checkmark, they flash in waves – then land again
  add({ n: 74, big: true, t: 'Drohnen-Lichtshow', scene: 'Nacht', where: 'den Himmel', dur: 22,
    g: DARK(74, 'dk74', 22, 4, 92, .65)
      + (() => { const N = 320;
        // every formation is a FILLED shape: grid points inside the outline, spread evenly over the drones
        const inPoly = (x, y, P) => { let c = false; for (let a = 0, b = P.length - 1; a < P.length; b = a++) { const [xa, ya] = P[a]; const [xb, yb] = P[b]; if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) c = !c; } return c; };
        const fill = (test, x0, x1, y0, y1) => { const pts = []; for (let y = y0; y <= y1; y += 4) for (let x = x0; x <= x1; x += 6) if (test(x, y)) pts.push([x + ((y / 4) % 2) * 3, y]); return Array.from({ length: N }, (_, k) => pts[Math.floor(k * pts.length / N)]); };
        const starP = Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? 15 : 38; const a = (k * 36 - 90) * Math.PI / 180; return [640 + Math.cos(a) * r * 3.4, 58 + Math.sin(a) * r * 1.4]; });
        const houseP = [[520, 108], [520, 50], [640, 6], [760, 50], [760, 108]]; const win = (x, y) => (x > 548 && x < 600 && y > 62 && y < 86) || (x > 680 && x < 732 && y > 62 && y < 86) || (x > 622 && x < 658 && y > 80);
        const heartP = heartPts(120, 640, 54, 6.4); const rocketP = [[640, 2], [672, 34], [672, 84], [700, 106], [580, 106], [608, 84], [608, 34]];
        const seg = (x, y, ax, ay, bx, by) => { const dx = bx - ax; const dy = by - ay; const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - ax - u * dx, (y - ay - u * dy) * 2.4); };
        const S0 = Array.from({ length: N }, (_, k) => { const f = (k % 160) / 160; const row = Math.floor(k / 160); return [60 + f * 1100, 54 + Math.sin(f * Math.PI * 4) * 30 + row * 8]; });
        const S1 = fill((x, y) => inPoly(x, y, starP), 500, 780, 4, 112);
        const S2 = fill((x, y) => inPoly(x, y, houseP) && !win(x, y), 520, 760, 6, 108);
        const S3 = fill((x, y) => inPoly(x, y, heartP), 500, 780, 4, 112);
        const S4 = fill((x, y) => inPoly(x, y, rocketP) && !(Math.hypot(x - 640, (y - 46) * 1.6) < 10), 580, 700, 2, 106);
        const S5 = fill((x, y) => Math.min(seg(x, y, 470, 50, 580, 100), seg(x, y, 580, 100, 860, 10)) < 16, 460, 870, 6, 110);
        const V = (S, i) => `${S[i][0].toFixed(0)}px,${S[i][1].toFixed(0)}px`;
        return Array.from({ length: N }, (_, i) => `<g class="dr74" style="--g:${(30 + (i * 67) % 1140)}px;--z:${V(S0, i)};--a:${V(S1, i)};--b:${V(S2, i)};--c:${V(S3, i)};--d:${V(S4, i)};--e:${V(S5, i)};--w:${(i % 20) * .03}s;--h:-${((i * 67) % 1140 / 1140 * 3.6).toFixed(2)}s"><path d="M-2.4 0 h4.8 M-2.8 -.7 h1.4 M1.4 -.7 h1.4" stroke="#3a3f46" stroke-width=".8"/><circle class="dl74" cx="0" cy="1" r="1.4"/></g>`).join(''); })()
      + `<g class="tx74"></g>` });
  hide(74, ['.dk74', '.dr74']);
  K('k74', '0%{opacity:0;transform:translate(var(--g),112px)}4%{opacity:1}10%,18%{transform:translate(var(--z))}25%,32%{transform:translate(var(--a))}39%,46%{transform:translate(var(--b))}53%,60%{transform:translate(var(--c))}67%,74%{transform:translate(var(--d))}81%,88%{transform:translate(var(--e))}96%{opacity:1}100%{opacity:0;transform:translate(var(--g),112px)}');
  hide(74, ['.tx74']); mv(74, '.tx74', 22, [[0, 'none', 0], [6, 'none', 1], [92, 'none', 1], [96, 'none', 0], [100, 'none', 0]]); css += '.go-74 .dr74 .dl74{filter:drop-shadow(0 0 2.4px currentColor)}';
  css += '.go-74 .dr74{animation:k74 22s ease-in-out forwards}';
  K('k74l', '0%,100%{color:#FF2BD6}17%{color:#00F0FF}33%{color:#39FF14}50%{color:#FFF01F}67%{color:#FF6B00}83%{color:#B026FF}'); K('k74f', '0%,100%{opacity:1}50%{opacity:.3}');
  css += '.dl74{fill:currentColor;color:#FF2BD6}.go-74 .dl74{animation:k74l 3.6s linear infinite,k74f .8s ease-in-out infinite;animation-delay:var(--h),var(--w)}';

  // 75 BIG – pool fountain show with real water: clear water jets arc out of the pool and fall back down – you see the drops fall and splash rings on the water and spray on the deck – they dance in waves, criss-cross and pulse, lit softly from below, and a giant centre jet ends in a crown that rains back into the pool
  add({ n: 75, big: true, t: 'Wasserspiele im Pool', scene: 'Sommer (Pool)', where: 'den Pool', dur: 18,
    g: Array.from({ length: 11 }, (_, i) => { const x = 586 + i * 10.6; const side = i < 5 ? -1 : i > 5 ? 1 : 0; const far = 14 + Math.abs(5 - i) * 4;
      return `<g class="jt75 j75${i}"><path d="M${x.toFixed(1)} 104 Q ${(x + side * far * .6).toFixed(1)} 30 ${(x + side * far).toFixed(1)} 104" stroke="#d9f4ff" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".55"/><path d="M${x.toFixed(1)} 104 Q ${(x + side * far * .6).toFixed(1)} 30 ${(x + side * far).toFixed(1)} 104" stroke="#fff" stroke-width="1.2" fill="none" stroke-dasharray="2 4" class="wf75"/></g><g class="dp75 dq75${i}">${[0, 1, 2].map((k) => `<circle class="dd75" style="--x:${(x + side * far).toFixed(1)}px;animation-delay:-${(k * .33).toFixed(2)}s" cx="0" cy="0" r="1.4" fill="#eaf8ff"/>`).join('')}<ellipse class="rg75" style="animation-delay:-${(i * .13).toFixed(2)}s" cx="${(x + side * far).toFixed(1)}" cy="104" rx="3" ry="1" fill="none" stroke="#fff" stroke-width=".8"/></g>`; }).join('')
      + `<g class="gl75"><ellipse cx="640" cy="104" rx="64" ry="5" fill="#9ff3ff" opacity=".35"/></g>`
      + `<g class="cj75"><path d="M640 104 V6" stroke="#bff0ff" stroke-width="8" stroke-linecap="round" opacity=".55"/><path d="M640 104 V8" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`
      + Array.from({ length: 36 }, (_, i) => `<circle class="cr75" style="--dx:${Math.round(Math.cos(i * .175 + Math.PI) * 60)}px" cx="640" cy="8" r="${1.4 + (i % 3) * .6}" fill="#eaf8ff"/>`).join('') });
  hide(75, ['.jt75', '.dp75', '.gl75', '.cj75', '.cr75']);
  for (let i = 0; i < 11; i++) { const ph = (i % 4) * 2.5; K(`k75j${i}`, `0%,4%{opacity:0;transform:scaleY(0)}8%{opacity:1;transform:scaleY(.6)}${14 + ph}%{transform:scaleY(1)}${22 + ph}%{transform:scaleY(.4)}${30 + ph}%{transform:scaleY(1)}40%{transform:scaleY(${i % 2 ? .5 : 1})}48%{transform:scaleY(${i % 2 ? 1 : .5})}56%{transform:scaleY(${(1 - Math.abs(5 - i) / 8).toFixed(2)})}64%{transform:scaleY(.6)}70%{transform:scaleY(.25)}88%{opacity:1;transform:scaleY(.25)}100%{opacity:0;transform:scaleY(0)}`); css += `.go-75 .j75${i}{animation:k75j${i} 18s ease-in-out forwards;transform-box:fill-box;transform-origin:50% 100%}`; }
  K('k75w', 'to{stroke-dashoffset:-12}'); css += '.go-75 .wf75{animation:k75w .4s linear infinite}';
  K('k75d', '0%{transform:translate(var(--x),80px);opacity:0}20%{opacity:1}100%{transform:translate(var(--x),104px);opacity:.2}'); css += '.go-75 .dd75{animation:k75d 1s ease-in infinite}';
  K('k75r', '0%{transform:scale(.4);opacity:1}100%{transform:scale(3);opacity:0}'); css += '.go-75 .rg75{animation:k75r 1.1s ease-out infinite;transform-box:fill-box;transform-origin:center}';
  mv(75, '.dp75', 18, [[0, 'none', 0], [6, 'none', 0], [10, 'none', 1], [88, 'none', 1], [94, 'none', 0], [100, 'none', 0]]);
  K('k75g', '0%,100%{fill:#9ff3ff}33%{fill:#ffb3e0}66%{fill:#fff2b3}'); css += '.go-75 .gl75 ellipse{animation:k75g 3s linear infinite}'; mv(75, '.gl75', 18, [[0, 'none', 0], [6, 'none', 1], [92, 'none', 1], [100, 'none', 0]]);
  mv(75, '.cj75', 18, [[0, 'scaleY(0)', 0], [70, 'scaleY(0)', 0], [76, 'scaleY(1.05)', 1], [82, 'scaleY(.95)', 1], [86, 'scaleY(1)', 1], [89, 'scaleY(0)', 0], [100, 'scaleY(0)', 0]]); fbb('.cj75');
  K('k75c', '0%,86%{opacity:0;transform:translate(0,0)}87%{opacity:1}93%{transform:translate(var(--dx),-6px)}100%{opacity:.3;transform:translate(calc(var(--dx) * 1.2),96px)}'); css += '.go-75 .cr75{animation:k75c 18s ease-in forwards}';

  // 76 BIG – look through the telescope: at night a kid sets up a telescope and points it at the moon – the picture zooms into the round telescope view (black all around, crosshairs, a moment out of focus): the moon surface with craters fills the view, the Earth hangs in the black sky, an astronaut hops across in slow moon jumps, plants a Swiss flag and waves, a tiny moon rover drives by – then the view closes like a camera iris and we are back in the garden
  add({ n: 76, big: true, t: 'Blick durchs Teleskop', scene: 'Nacht', where: 'den Mond', dur: 20,
    g: `<g class="kd76">${kid(470, 108, '#3E8EDE', '#6b4a2e')}<path d="M490 108 l6 -14 l6 14 M496 94 v14" stroke="#5f6772" stroke-width="1.2"/><g transform="translate(496 92) rotate(-28)"><rect x="-16" y="-3" width="30" height="6" rx="1.5" fill="#c9d1d9"/><rect x="12" y="-4" width="5" height="8" rx="1" fill="#8f99a6"/><rect x="-20" y="-2" width="5" height="4" fill="#5f6772"/></g></g>`
      + `<g class="tv76"><defs><clipPath id="cp76"><ellipse cx="640" cy="60" rx="170" ry="56"/></clipPath><mask id="ms76"><rect x="-200" y="-100" width="1600" height="320" fill="#fff"/><ellipse cx="640" cy="60" rx="170" ry="56" fill="#000"/></mask></defs>`
      + `<g clip-path="url(#cp76)"><g class="fc76"><rect x="460" y="0" width="360" height="120" fill="#03040b"/>${Array.from({ length: 60 }, (_, i) => `<circle cx="${470 + (i * i * 7919 + i * 31) % 340}" cy="${6 + (i * i * 104729 + i * 17) % 62}" r="${i % 4 ? .5 : .9}" fill="#fff"/>`).join('')}`
      + `<circle cx="740" cy="26" r="11" fill="#2f6fb8"/><path d="M733 21 q5 -5 10 0 q2 5 -4 7z M738 32 q5 0 7 -4" fill="#4fae5a"/><path d="M729 26 a11 11 0 0 0 22 0" fill="#0b1a33" opacity=".35"/>`
      + `<ellipse cx="640" cy="232" rx="360" ry="150" fill="#c9c6bb"/><ellipse cx="640" cy="232" rx="360" ry="150" fill="none" stroke="#e7e3d6" stroke-width="2"/>${[[602, 96, 7], [626, 88, 4], [664, 92, 9], [690, 100, 5], [612, 108, 5], [650, 106, 6], [588, 104, 3], [520, 104, 8], [540, 96, 4], [730, 96, 7], [760, 104, 10], [560, 110, 6], [714, 110, 4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * .45).toFixed(1)}" fill="#a9a597"/><ellipse cx="${x}" cy="${y - r * .12}" rx="${r * .8}" ry="${(r * .3).toFixed(1)}" fill="#bdb9ac"/>`).join('')}`
      + `<g class="fg76"><path d="M652 84 V64" stroke="#d9d9d9" stroke-width="1"/><rect x="652" y="64" width="12" height="9" fill="#E5483B"/><path d="M658 66 v5 M655.5 68.5 h5" stroke="#fff" stroke-width="1.6"/></g>`
      + `<g class="rv76"><rect x="-7" y="-5" width="14" height="5" rx="1" fill="#d9d9d9"/><rect x="-4" y="-9" width="8" height="1.4" fill="#3E8EDE"/><path d="M0 -5 v-4" stroke="#999"/><circle cx="-5" cy="1" r="2" fill="#555"/><circle cx="5" cy="1" r="2" fill="#555"/></g>`
      + `<g class="as76"><g class="asw"><rect x="-3.5" y="-9" width="7" height="9" rx="2.5" fill="#fff"/><rect x="-6" y="-8" width="3" height="6" rx="1" fill="#c9d1d9"/><circle cx="0" cy="-12.5" r="4" fill="#fff"/><path d="M-2.4 -13.5 h4.8 a2.4 2.4 0 0 1 -4.8 0z" fill="#FFB02E"/><path d="M-1.6 0 l-1 4 M1.6 0 l1 4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><g class="aw76"><path d="M3 -7 l5 -5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g></g></g>`
      + `<g class="du76">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${(i - 2) * 3}" cy="0" r="1.2" fill="#bdb9ac"/>`).join('')}</g><g class="hi76"></g></g></g>`
      + `<rect x="-200" y="-100" width="1600" height="320" fill="#020308" mask="url(#ms76)"/><ellipse cx="640" cy="60" rx="170" ry="56" fill="none" stroke="#2b2f3a" stroke-width="4"/><path d="M640 8 V32 M640 88 V112 M480 60 H600 M680 60 H800" stroke="#7CFF8A" stroke-width=".6" opacity=".6"/><text x="770" y="106" font-size="6" fill="#7CFF8A" opacity=".7" font-family="ui-monospace,monospace">ZOOM x250</text></g>` });
  hide(76, ['.kd76', '.tv76']);
  mv(76, '.kd76', 20, [[0, 'none', 0], [3, 'none', 1], [12, 'none', 1], [14, 'none', 0], [86, 'none', 0], [90, 'none', 1], [97, 'none', 1], [100, 'none', 0]]);
  mv(76, '.tv76', 20, [[0, 'scale(5)', 0], [10, 'scale(5)', 0], [16, 'scale(1)', 1], [84, 'scale(1)', 1], [90, 'scale(0)', 1], [91, 'scale(0)', 0], [100, 'scale(0)', 0]], 'ease-in-out'); css += '.tv76{transform-origin:640px 60px;transform-box:view-box}';
  K('k76f', '0%,14%{filter:blur(3px)}20%{filter:blur(1.5px)}24%,100%{filter:blur(0)}'); css += '.go-76 .fc76{animation:k76f 20s ease-out forwards}';
  // the astronaut hops in slow low-gravity arcs from the left to the flag spot, plants the flag and waves
  const MH = (p0, x0, x1) => [[p0, `translate(${x0}px,84px)`, 1], [p0 + 3, `translate(${(x0 + x1) / 2}px,62px)`, 1], [p0 + 6, `translate(${x1}px,84px)`, 1]];
  mv(76, '.as76', 20, [[0, 'translate(596px,96px)', 1], [20, 'translate(596px,96px)', 1]].concat(MH(22, 596, 612)).concat(MH(30, 612, 628)).concat(MH(38, 628, 644)).concat([[60, 'translate(644px,84px)', 1], [100, 'translate(644px,84px)', 1]]));
  mv(76, '.du76', 20, [[0, 'translate(612px,84px) scale(0)', 0], [28, 'translate(612px,84px) scale(0)', 1], [30, 'translate(612px,84px) scale(2)', 0], [36, 'translate(628px,84px) scale(0)', 1], [38, 'translate(628px,84px) scale(2)', 0], [44, 'translate(644px,84px) scale(0)', 1], [46, 'translate(644px,84px) scale(2)', 0], [100, 'scale(0)', 0]]);
  mv(76, '.fg76', 20, [[0, 'scaleY(0)', 0], [48, 'scaleY(0)', 0], [52, 'scaleY(1)', 1], [100, 'scaleY(1)', 1]]); fbb('.fg76');
  K('k76w', '0%,54%,82%,100%{transform:rotate(0)}58%,66%,74%{transform:rotate(-40deg)}62%,70%,78%{transform:rotate(10deg)}'); css += '.go-76 .aw76{animation:k76w 20s ease-in-out forwards;transform-box:fill-box;transform-origin:0 100%}';
  mv(76, '.hi76', 20, [[0, 'none', 0], [56, 'none', 0], [58, 'none', 1], [78, 'none', 1], [80, 'none', 0], [100, 'none', 0]]);
  mv(76, '.rv76', 20, [[0, 'translate(560px,98px)', 1], [58, 'translate(560px,98px)', 1], [84, 'translate(720px,100px)', 1], [100, 'translate(720px,100px)', 1]], 'linear');

  // 77 BIG – treasure hunt: an old map unrolls in the sky with a dotted path and an X, a kid follows the path across the garden, digs at the X with a shovel, the chest pops up, opens and a golden light beam with coins shoots up
  add({ n: 77, big: true, t: 'Schatzsuche', scene: 'Sommer / Herbst', where: 'die Wiese', dur: 18,
    g: `<g class="mp77"><g transform="translate(640 30)"><rect x="-50" y="-20" width="100" height="40" rx="4" fill="#f1dfb0" stroke="#a87a4a" stroke-width="1.4"/><path d="M-40 10 q20 -20 40 -6 t36 -10" stroke="#a87a4a" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/><path d="M30 -10 l8 8 M38 -10 l-8 8" stroke="#E5483B" stroke-width="2.4"/><circle cx="-40" cy="10" r="2" fill="#3E8EDE"/><path d="M-20 -14 l3 -4 3 4z M-8 -14 l3 -4 3 4z" fill="#3f8a2e"/></g></g>`
      + `<path class="pt77" d="M260 110 q70 -12 140 -2 t125 0" stroke="#d9a35a" stroke-width="2" stroke-dasharray="4 4" fill="none" pathLength="100" stroke-dashoffset="100"/><g class="x77"><path d="M520 106 l10 8 M530 106 l-10 8" stroke="#E5483B" stroke-width="2.4"/></g>`
      + `<g class="kd77"><g class="kdr">${kid(0, 108, '#3FA66B', '#D4A63B')}<g class="sh77"><path d="M6 92 l10 14" stroke="#8a5a2b" stroke-width="1.4"/><path d="M14 104 l5 4 -3 2z" fill="#9aa1aa"/></g></g></g>`
      + `<g class="ch77"><g transform="translate(525 110)"><rect x="-12" y="-10" width="24" height="10" fill="#8a5a2b"/><path d="M-12 -10 h24 v3 h-24z" fill="#d4a017"/><g class="ld77"><path d="M-12 -10 q12 -10 24 0z" fill="#a87a4a"/></g></g></g>`
      + `<path class="bm77" d="M525 100 L498 -10 H552Z" fill="#FFE27A" opacity=".4"/>` + Array.from({ length: 10 }, (_, i) => `<circle class="co77" style="--dx:${(i - 5) * 9}px;animation-delay:${(13 + i * .12).toFixed(1)}s" cx="525" cy="98" r="2.4" fill="#FFD24A" stroke="#b8860b" stroke-width=".5"/>`).join('') + `${Array.from({ length: 10 }, (_, i) => `<circle class="dt77" style="--dx:${(i - 5) * 5}px;animation-delay:${(9 + (i % 5) * .3).toFixed(1)}s" cx="525" cy="106" r="1.6" fill="#7a5233"/>`).join('')}${[0, 1, 2].map((i) => `<path class="jw77" style="--dx:${(i - 1) * 14}px" d="M470 96 l3 -3 3 3 -3 4z" fill="${['#5CE1E6', '#FF5A7A', '#7CFF8A'][i]}"/>`).join('')}` });
  hide(77, ['.dt77', '.jw77', '.mp77', '.pt77', '.x77', '.kd77', '.ch77', '.bm77', '.co77']);
  K('k77d', '0%{opacity:0;transform:translate(0,0)}10%{opacity:1}60%{transform:translate(var(--dx),-18px)}100%{opacity:0;transform:translate(calc(var(--dx) * 1.6),0)}'); css += '.go-77 .dt77{animation:k77d .9s ease-out 3}';
  K('k77j', '0%,72%{opacity:0;transform:translate(0,0)}76%{opacity:1}90%{transform:translate(var(--dx),-40px)}100%{opacity:0;transform:translate(var(--dx),-50px)}'); css += '.go-77 .jw77{animation:k77j 18s ease-out forwards}';
  mv(77, '.mp77', 18, [[0, 'scaleX(0)', 0], [4, 'scaleX(.05)', 1], [12, 'scaleX(1)', 1], [30, 'scaleX(1)', 1], [36, 'scaleX(0)', 0], [100, 'scaleX(0)', 0]]); fb('.mp77');
  K('k77p', '0%,14%{stroke-dashoffset:100;opacity:1}44%,92%{stroke-dashoffset:0;opacity:1}100%{opacity:0}'); css += '.go-77 .pt77{animation:k77p 18s linear forwards}';
  mv(77, '.x77', 18, [[0, 'none', 0], [14, 'none', 0], [16, 'none', 1], [60, 'none', 1], [62, 'none', 0], [100, 'none', 0]]);
  mv(77, '.kd77', 18, [[0, 'translateX(240px)', 0], [16, 'translateX(260px)', 1], [44, 'translateX(504px)', 1], [94, 'translateX(504px)', 1], [100, 'translateX(504px)', 0]], 'linear'); loop(77, '.kdr', 'bobk', .35); css += '.kdr{transform-box:fill-box;transform-origin:center}';
  K('k77s', '0%,46%,62%,100%{transform:rotate(0)}50%,58%{transform:rotate(-40deg)}54%{transform:rotate(10deg)}'); css += '.go-77 .sh77{animation:k77s 18s ease-in-out forwards;transform-box:fill-box;transform-origin:0 0}';
  mv(77, '.ch77', 18, [[0, 'translateY(12px)', 0], [60, 'translateY(12px)', 0], [64, 'translateY(-4px)', 1], [66, 'translateY(0)', 1], [94, 'translateY(0)', 1], [100, 'translateY(0)', 0]]);
  mv(77, '.ld77', 18, [[0, 'rotate(0)', 1], [68, 'rotate(0)', 1], [72, 'rotate(-70deg)', 1], [100, 'rotate(-70deg)', 1]]); css += '.ld77{transform-box:fill-box;transform-origin:0 100%}';
  mv(77, '.bm77', 18, [[0, 'scaleY(0)', 0], [70, 'scaleY(0)', 0], [74, 'scaleY(1)', .45], [92, 'scaleY(1)', .45], [96, 'scaleY(1)', 0], [100, 'scaleY(1)', 0]]); css += '.bm77{transform-box:fill-box;transform-origin:50% 100%}';
  K('k77c', '0%{opacity:0;transform:translate(0,0)}10%{opacity:1}50%{transform:translate(var(--dx),-50px)}100%{opacity:0;transform:translate(calc(var(--dx) * 1.6),10px)}'); css += '.go-77 .co77{animation:k77c 2s ease-out 2}';

  // 78 BIG – frog concert in the pool: lily pads float onto the pool, five frogs jump onto them one by one, puff up their throats and croak a song ("Quak!"), notes float up, the big frog conducts – then they all jump into the water with a splash
  add({ n: 78, big: true, t: 'Froschkonzert', scene: 'Frühling / Sommer (Pool)', where: 'den Pool', dur: 18,
    g: [0, 1, 2, 3, 4].map((i) => `<g class="lp78" style="animation-delay:${(.4 * i).toFixed(1)}s"><ellipse cx="${592 + i * 24}" cy="104" rx="9" ry="3" fill="#3f9a36"/><path d="M${592 + i * 24} 104 l9 -1" stroke="#2f7a2a" stroke-width="1"/></g>`).join('')
      + [0, 1, 2, 3, 4].map((i) => `<g class="fr78 fr${i}"><g transform="translate(${592 + i * 24} 102) scale(${i === 2 ? 1.3 : 1})"><ellipse cx="0" cy="-4" rx="6" ry="4.4" fill="#5fae46"/><circle cx="-3" cy="-8" r="2.2" fill="#5fae46"/><circle cx="3" cy="-8" r="2.2" fill="#5fae46"/><circle cx="-3" cy="-8.4" r="1.2" fill="#fff"/><circle cx="3" cy="-8.4" r="1.2" fill="#fff"/><circle cx="-3" cy="-8.4" r=".6" fill="#1d1d1d"/><circle cx="3" cy="-8.4" r=".6" fill="#1d1d1d"/><ellipse class="th78" cx="0" cy="-2" rx="3" ry="2" fill="#d6f3a0"/><path d="M-6 -1 l-3 2 M6 -1 l3 2" stroke="#4f9a3a" stroke-width="1.4"/>${i === 2 ? '<path class="bt78" d="M6 -6 l8 -8" stroke="#1d1d1d" stroke-width="1"/>' : ''}</g></g>`).join('')
      + Array.from({ length: 10 }, (_, i) => `<text class="nt78" style="--x:${590 + (i % 5) * 24}px;animation-delay:${(6 + i * .5).toFixed(1)}s" x="0" y="0" font-size="9" fill="#fff">${i % 2 ? '♪' : '♫'}</text>`).join('')
      + `<g class="qk78"></g>`
      + [0, 1, 2, 3, 4].map((i) => `<g class="sp78" style="animation-delay:${(15 + i * .2).toFixed(1)}s"><path d="M${586 + i * 24} 104 q6 -14 12 0" fill="#d6f3ff"/></g>`).join('') });
  hide(78, ['.lp78', '.fr78', '.nt78', '.qk78', '.sp78']);
  K('k78l', '0%{opacity:0;transform:translateX(-40px)}10%,90%{opacity:1;transform:translateX(0)}100%{opacity:0}'); css += '.go-78 .lp78{animation:k78l 17s ease-out forwards}';
  [0, 1, 2, 3, 4].forEach((i) => mv(78, `.fr${i}`, 18, [[0, 'translate(-60px,-30px)', 0], [8 + i * 4, 'translate(-60px,-30px)', 0], [9 + i * 4, 'translate(-40px,-30px)', 1], [12 + i * 4, 'translate(-20px,-40px)', 1], [15 + i * 4, 'translate(0,0)', 1], [82 + i, 'translate(0,0)', 1], [86 + i, 'translate(0,-16px)', 1], [89 + i, 'translate(4px,8px)', 0], [100, 'translate(4px,8px)', 0]]));
  K('k78t', '0%,100%{transform:scale(1)}50%{transform:scale(1.8)}'); css += '.go-78 .th78{animation:k78t .5s ease-in-out infinite;transform-box:fill-box;transform-origin:center}';
  K('k78b', '0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}'); css += '.go-78 .bt78{animation:k78b .5s ease-in-out infinite;transform-box:fill-box;transform-origin:0 100%}';
  K('k78n', '0%{opacity:0;transform:translate(var(--x),92px)}20%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 14px),50px)}'); css += '.go-78 .nt78{animation:k78n 2.4s ease-out 2}';
  mv(78, '.qk78', 18, [[0, 'scale(.4)', 0], [40, 'scale(.4)', 0], [44, 'scale(1.2)', 1], [74, 'scale(1)', 1], [78, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.qk78');
  K('k78s', '0%{opacity:0;transform:scaleY(.2)}20%{opacity:1;transform:scaleY(1.2)}100%{opacity:0;transform:scaleY(.4)}'); css += '.go-78 .sp78{animation:k78s 1.2s ease-out both;transform-box:fill-box;transform-origin:50% 100%}';

  // 79 BIG – polar bear visit: on the frozen ground a big polar bear strolls in, sniffs, slides on its belly across the ice, a snowflake lands on its nose, it sneezes, waves and wanders off
  add({ n: 79, big: true, t: 'Eisbär-Besuch', scene: 'Frost (Eislandschaft)', where: 'die Eisfläche', dur: 18,
    g: `<g class="pb79"><g class="pbb"><g transform="translate(0 108)"><ellipse cx="0" cy="-12" rx="22" ry="11" fill="#f4f6f8"/><path d="M18 -18 q12 -6 16 0 q2 6 -6 8 h-10z" fill="#f4f6f8"/><circle cx="20" cy="-21" r="2.4" fill="#f4f6f8"/><circle cx="31" cy="-14" r="1.4" fill="#1d1d1d"/><circle cx="26" cy="-17" r=".8" fill="#1d1d1d"/><path class="pl79a" d="M-14 -4 v8 M8 -4 v8" stroke="#e6ebf0" stroke-width="5" stroke-linecap="round"/><path class="pl79b" d="M-8 -4 v8 M14 -4 v8" stroke="#dfe5ea" stroke-width="5" stroke-linecap="round"/><path d="M-22 -14 q-4 0 -4 4" stroke="#e6ebf0" stroke-width="3" fill="none"/></g></g></g>`
      + `<g class="sf79"><path d="M0 -4 v8 M-4 0 h8 M-3 -3 l6 6 M3 -3 l-6 6" stroke="#fff" stroke-width="1"/></g>`
      + `<g class="hz79"></g>`
      + Array.from({ length: 12 }, (_, i) => `<circle class="ip79" style="--dx:${(i - 6) * 6}px;--dy:${-6 - (i % 3) * 5}px" cx="0" cy="0" r="1.6" fill="#e6f7ff"/>`).join('') });
  hide(79, ['.pb79', '.sf79', '.hz79', '.ip79']);
  mv(79, '.pb79', 18, [[0, 'translateX(-60px)', 1], [22, 'translateX(420px)', 1], [28, 'translateX(440px)', 1], [30, 'translate(460px,4px) rotate(4deg)', 1], [44, 'translate(640px,4px) rotate(4deg)', 1], [46, 'translateX(650px)', 1], [76, 'translateX(650px)', 1], [100, 'translateX(1300px)', 1]], 'ease-in-out');
  K('k79w', '0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}'); css += '.go-79 .pbb{animation:k79w .7s ease-in-out infinite}';
  mv(79, '.sf79', 18, [[0, 'translate(690px,10px)', 0], [46, 'translate(690px,10px)', 1], [58, 'translate(680px,94px) rotate(180deg)', 1], [60, 'translate(680px,94px)', 0], [100, 'translate(680px,94px)', 0]], 'linear');
  mv(79, '.hz79', 18, [[0, 'translate(690px,70px) scale(.4)', 0], [62, 'translate(690px,70px) scale(.4)', 0], [64, 'translate(690px,70px) scale(1.3)', 1], [72, 'translate(690px,70px)', 1], [74, 'translate(690px,70px)', 0], [100, 'translate(690px,70px)', 0]]);
  K('k79i', '0%,62%{opacity:0;transform:translate(684px,94px)}63%{opacity:1}74%,100%{opacity:0;transform:translate(calc(684px + var(--dx)),calc(94px + var(--dy)))}'); css += '.go-79 .ip79{animation:k79i 18s ease-out forwards}';

  // 80 BIG – sky lanterns: dusk, three kids each light a lantern and let it rise into the warm sky; they light three more – one catches fire, flares up, tumbles down burning with a smoke trail, crashes on the meadow and glows out to embers ("Oh nein!") while the others float away
  add({ n: 80, big: true, t: 'Himmelslaternen', scene: 'Sommer am Abend', where: 'die Wiese', dur: 22,
    g: `<defs><linearGradient id="sk80" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1440"/><stop offset=".8" stop-color="#7a3a5a"/><stop offset="1" stop-color="#ff8a5a"/></linearGradient></defs><rect class="sk80" x="0" y="0" width="1200" height="120" fill="url(#sk80)"/>`
      + `<g class="kd80">${[[520, '#FF7AB6', '#D4A63B'], [560, '#3E8EDE', '#6b4a2e'], [760, '#3FA66B', '#2b2b2b']].map(([x, c, h]) => kid(x, 108, c, h)).join('')}</g>`
      + [[526, 1.2, 0], [566, 1.6, 0], [766, 2, 0], [526, 9, 1], [566, 9.4, 2], [766, 9.8, 0]].map(([x, d, kind], i) => `<g class="sl80 sl8${i}${kind === 1 ? ' burn80' : ''}" style="--x:${x}px;--dx:${[-30, 10, 40, -10, 20, -40][i]}px;animation-delay:${d}s"><g class="slw"><ellipse cx="0" cy="0" rx="12" ry="13" fill="#FFB02E" opacity=".3"/><path d="M-5 -8 h10 l1.6 12 h-13.2z" fill="#FFD27A"/><path d="M-6 4 h12" stroke="#e8a030" stroke-width="1"/><ellipse cx="0" cy="2.4" rx="2.2" ry="1.4" fill="#fff6c8"/>${kind === 1 ? `<g class="fi80"><path d="M-6 -8 q3 -10 6 -4 q3 -10 6 4z" fill="#FF6A1A"/><path d="M-3 -8 q2 -6 3 -2 q2 -6 3 2z" fill="#FFE27A"/></g>` : ''}</g></g>`).join('')
      + `<g class="tr80">${Array.from({ length: 10 }, (_, i) => `<circle class="sm80" style="animation-delay:-${(i * .1).toFixed(1)}s" cx="0" cy="${-i * 4}" r="${2 + i * .4}" fill="#4a4040" opacity=".5"/>`).join('')}</g>`
      + `<g class="em80"><ellipse cx="600" cy="108" rx="10" ry="2.4" fill="#FF6A1A" class="glw"/>${Array.from({ length: 8 }, (_, i) => `<circle class="sp80" style="--dx:${(i - 4) * 6}px" cx="600" cy="106" r="1.2" fill="#FFD24A"/>`).join('')}<path d="M596 104 q-2 -6 0 -10 M604 104 q2 -6 0 -10" stroke="#777" stroke-width="1.2" fill="none" class="smk80"/></g>`
      + `<g class="oh80"></g>` + `${Array.from({ length: 26 }, (_, i) => `<g class="fz80" style="--x:${(40 + (i * 461) % 1140)}px;--s:${(.5 + (i % 4) * .18).toFixed(2)};animation-delay:${(5 + (i % 13) * .7).toFixed(1)}s"><circle r="4" fill="#ffb347" opacity=".35"/><rect x="-1.8" y="-2.4" width="3.6" height="4.8" rx="1" fill="#ffd27a"/></g>`).join('')}<g class="eb80">${Array.from({ length: 22 }, (_, i) => `<circle class="es80" style="--dx:${(i - 11) * 6}px;--dy:${-20 - (i % 5) * 9}px" cx="600" cy="104" r="1.4" fill="${i % 2 ? '#FFB02E' : '#ff5a1a'}"/>`).join('')}<circle class="gw80" cx="600" cy="104" r="14" fill="#ff7a1a" opacity=".5"/></g>${[0, 1, 2, 3].map((i) => `<circle class="sm80" style="animation-delay:${(13.8 + i * .5).toFixed(1)}s" cx="600" cy="100" r="5" fill="#6b6b6b" opacity=".5"/>`).join('')}` });
  hide(80, ['.sk80', '.kd80', '.sl80', '.tr80', '.em80', '.oh80']);
  hide(80, ['.fz80', '.eb80', '.sm80']);
  K('k80z', '0%{opacity:0;transform:translate(var(--x),112px) scale(var(--s))}10%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 40px),-20px) scale(calc(var(--s) * .5))}'); css += '.go-80 .fz80{animation:k80z 9s ease-out both}';
  mv(80, '.eb80', 22, [[0, 'none', 0], [62, 'none', 0], [63, 'none', 1], [80, 'none', 1], [86, 'none', 0], [100, 'none', 0]]);
  K('k80e', '0%{transform:translate(0,0);opacity:1}60%{transform:translate(calc(var(--dx) * .7),var(--dy))}100%{transform:translate(var(--dx),2px);opacity:0}'); css += '.go-80 .es80{animation:k80e 1.4s ease-out 13.8s both}';
  K('k80g', '0%,100%{opacity:.25}50%{opacity:.6}'); css += '.go-80 .gw80{animation:k80g .4s ease-in-out infinite}';
  K('k80s', '0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:.6}100%{opacity:0;transform:translate(10px,-60px) scale(3)}'); css += '.tp-80 .sm80{opacity:0}.go-80 .sm80{animation:k80s 3s ease-out both;transform-box:fill-box;transform-origin:center}';
  mv(80, '.sk80', 22, [[0, 'none', 0], [8, 'none', .7], [92, 'none', .7], [100, 'none', 0]]);
  mv(80, '.kd80', 22, [[0, 'none', 0], [4, 'none', 1], [92, 'none', 1], [100, 'none', 0]]);
  K('k80', '0%{opacity:0;transform:translate(var(--x),86px) scale(.9)}6%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + var(--dx)),-40px) scale(.45)}'); css += '.go-80 .sl80:not(.burn80){animation:k80 12s ease-in forwards}';
  // the burning one: rises, catches fire, tumbles down to x≈600 and crashes on the meadow
  K('k80b', '0%{opacity:0;transform:translate(526px,86px) scale(.9) rotate(0)}6%{opacity:1}30%{transform:translate(510px,40px) scale(.8) rotate(0)}40%{transform:translate(520px,30px) scale(.8) rotate(-20deg)}55%{transform:translate(560px,60px) scale(.8) rotate(160deg)}70%{transform:translate(600px,104px) scale(.7) rotate(300deg);opacity:1}72%,100%{opacity:0;transform:translate(600px,106px) scale(.6) rotate(320deg)}'); css += '.go-80 .burn80{animation:k80b 12s ease-in forwards}';
  K('k80f', '0%,30%{opacity:0;transform:scale(.3)}34%{opacity:1;transform:scale(1.4)}50%,70%{opacity:1;transform:scale(1.2)}72%,100%{opacity:0}'); css += '.tp-80 .fi80{opacity:0}.go-80 .fi80{animation:k80f 12s linear 9s both;transform-box:fill-box;transform-origin:50% 100%}';
  K('k80t', '0%,74%{opacity:0;transform:translate(520px,30px)}76%{opacity:1;transform:translate(520px,30px)}84%{transform:translate(560px,60px)}92%{opacity:1;transform:translate(600px,104px)}100%{opacity:0;transform:translate(600px,104px)}'); css += '.go-80 .tr80{animation:k80t 22s linear forwards}';
  mv(80, '.em80', 22, [[0, 'none', 0], [92, 'none', 0]]); K('k80e', '0%,91%{opacity:0}92%{opacity:1}100%{opacity:.6}'); css += '.go-80 .em80{animation:k80e 22s linear forwards}';
  K('k80s', '0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--dx),-14px);opacity:0}'); css += '.go-80 .sp80{animation:k80s .8s ease-out 20.3s 2 both}';
  mv(80, '.oh80', 22, [[0, 'scale(.4)', 0], [64, 'scale(.4)', 0], [66, 'scale(1.2)', 1], [76, 'scale(1)', 1], [78, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.oh80');

  // ================================================================ 10 GIANT ONES (81–90)

  // 83 GIANT – the kraken in the pool: the pool water starts to bubble and swirl, eight giant tentacles shoot out of the pool higher than the house, wave around, one juggles a beach ball and a rubber ring, one gives a high five to the chimney, then a huge friendly octopus head peeks up, winks – and everything slurps back into the pool with a big splash
  add({ n: 83, big: true, t: 'Riesen-Krake im Pool', scene: 'Sommer (Pool)', where: 'den Pool', dur: 20,
    g: `<defs><clipPath id="pl83"><rect x="-300" y="-300" width="1800" height="403.5"/></clipPath></defs><g class="bb83">${Array.from({ length: 12 }, (_, i) => `<circle class="bu83" style="animation-delay:-${(i * .2).toFixed(1)}s" cx="${584 + (i * 11) % 116}" cy="104" r="2" fill="none" stroke="#fff" stroke-width=".8"/>`).join('')}</g>`
      + `<g clip-path="url(#pl83)">` + Array.from({ length: 8 }, (_, i) => { const x = 588 + i * 15; const h = 70 + (i % 3) * 14; const s = i % 2 ? 1 : -1;
        return `<g class="te83 t83${i}"><path d="M${x} 106 C ${x + s * 18} ${106 - h * .4} ${x - s * 18} ${106 - h * .7} ${x + s * 8} ${106 - h}" stroke="#B0408a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${x} 106 C ${x + s * 18} ${106 - h * .4} ${x - s * 18} ${106 - h * .7} ${x + s * 8} ${106 - h}" stroke="#E07ac0" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="1 5"/></g>`; }).join('')
      + `<g class="hd83"><ellipse cx="640" cy="96" rx="34" ry="22" fill="#B0408a"/><ellipse cx="626" cy="92" rx="6" ry="7" fill="#fff"/><ellipse cx="654" cy="92" rx="6" ry="7" fill="#fff"/><circle cx="627" cy="93" r="3" fill="#1d1d1d"/><g class="wk83"><circle cx="655" cy="93" r="3" fill="#1d1d1d"/></g><circle cx="624" cy="100" r="3" fill="#ff8ac8" opacity=".6"/><circle cx="656" cy="100" r="3" fill="#ff8ac8" opacity=".6"/></g></g>` + `<g class="fm83"><ellipse cx="640" cy="103.5" rx="42" ry="2.6" fill="#eaf8ff" opacity=".9"/><ellipse cx="640" cy="103.5" rx="30" ry="1.4" fill="#fff"/></g>`
      + `<g class="ba83"><circle r="7" fill="#fff"/><path d="M-7 0 h14 M0 -7 v14" stroke="#E5483B" stroke-width="2.4"/></g><g class="rg83"><circle r="7" fill="none" stroke="#FF8A1A" stroke-width="4"/><path d="M-5 -5 l3 3 M5 5 l-3 -3" stroke="#fff" stroke-width="2"/></g>`
      + `<g class="sp83"><path d="M560 106 q20 -40 40 -50 q20 6 40 0 q20 6 40 0 q20 10 40 50z" fill="#d6f3ff"/></g><g class="sl83"></g>` + `${Array.from({ length: 16 }, (_, i) => `<circle class="wd83" style="--dx:${(i - 8) * 8}px;--dy:${-20 - (i % 4) * 10}px;animation-delay:-${(i * .12).toFixed(2)}s" cx="640" cy="104" r="2" fill="#d6f3ff"/>`).join('')}` });
  hide(83, ['.fm83', '.bb83', '.te83', '.hd83', '.ba83', '.rg83', '.sp83', '.sl83']);
  K('k83d', '0%{transform:translate(0,0);opacity:1}50%{transform:translate(calc(var(--dx) * .6),var(--dy))}100%{transform:translate(var(--dx),0);opacity:0}'); css += '.tp-83 .wd83{opacity:0}.go-83 .wd83{animation:k83d 1.2s ease-out 14 2.6s}';
  mv(83, '.bb83', 20, [[0, 'none', 0], [2, 'none', 1], [20, 'none', 1], [24, 'none', 0], [100, 'none', 0]]); K('k83b', '0%{transform:translateY(0);opacity:1}100%{transform:translateY(-10px);opacity:0}'); css += '.go-83 .bu83{animation:k83b 1s ease-out infinite}';
  for (let i = 0; i < 8; i++) { mv(83, `.t83${i}`, 20, [[0, 'scaleY(0)', 0], [26 + i * 1.2, 'scaleY(0)', 1], [32 + i * 1.2, 'scaleY(1.1)', 1], [36 + i * 1.2, 'scaleY(1)', 1], [84, 'scaleY(1)', 1], [88, 'scaleY(0)', 1], [100, 'scaleY(0)', 0]]); css += `.t83${i}{transform-box:fill-box;transform-origin:50% 100%}`; }
  K('k83w', '0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}'); css += '.go-83 .te83 path{animation:k83w 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}';
  mv(83, '.hd83', 20, [[0, 'translateY(40px)', 0], [6, 'translateY(40px)', 0], [12, 'translateY(16px)', 1], [16, 'translateY(16px) rotate(-6deg)', 1], [20, 'translateY(16px) rotate(6deg)', 1], [24, 'translateY(4px)', 1], [84, 'translateY(4px)', 1], [88, 'translateY(40px)', 0], [100, 'translateY(40px)', 0]]); fb('.hd83');
  mv(83, '.fm83', 20, [[0, 'scaleX(.2)', 0], [8, 'scaleX(.2)', 0], [12, 'scaleX(1)', 1], [86, 'scaleX(1)', 1], [90, 'scaleX(.2)', 0], [100, 'scaleX(.2)', 0]]); fb('.fm83');
  K('k83k', '0%,70%,76%,100%{transform:scaleY(1)}72%,74%{transform:scaleY(.1)}'); css += '.go-83 .wk83{animation:k83k 20s linear forwards;transform-box:fill-box;transform-origin:center}';
  const JB = (p, x, y) => [p, `translate(${x}px,${y}px)`, 1];
  mv(83, '.ba83', 20, [[0, 'translate(620px,30px)', 0], [32, 'translate(620px,30px)', 0], JB(34, 620, 30), JB(38, 680, 0), JB(42, 600, 20), JB(46, 680, 0), JB(50, 600, 20), JB(54, 660, -4), [58, 'translate(760px,90px)', 1], [62, 'translate(760px,100px)', 0], [100, 'translate(760px,100px)', 0]], 'ease-in-out');
  mv(83, '.rg83', 20, [[0, 'translate(680px,30px)', 0], [34, 'translate(680px,30px)', 0], JB(36, 680, 30), JB(40, 600, 0), JB(44, 680, 20), JB(48, 600, 0), JB(52, 680, 20), [58, 'translate(520px,100px)', 1], [62, 'translate(520px,104px)', 0], [100, 'translate(520px,104px)', 0]], 'ease-in-out');
  mv(83, '.sp83', 20, [[0, 'scaleY(0)', 0], [86, 'scaleY(0)', 0], [88, 'scaleY(1.2)', 1], [94, 'scaleY(.5)', 0], [100, 'scaleY(0)', 0]]); fbb('.sp83');
  mv(83, '.sl83', 20, [[0, 'scale(.4)', 0], [84, 'scale(.4)', 0], [87, 'scale(1.3)', 1], [94, 'scale(1)', 1], [96, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.sl83');

  // 86 GIANT – the sky whale: the sky turns deep blue like the sea, bubbles rise, and a gigantic whale – as long as half the picture – swims slowly through the sky between the clouds, little fish follow it, blows a fountain of stars from its blowhole and swims on
  add({ n: 86, big: true, t: 'Himmelswal', scene: 'Jeder Tag', where: 'den Himmel', dur: 22,
    g: `<rect class="sea86" x="0" y="0" width="1200" height="120" fill="#1e5fa8"/>`
      + Array.from({ length: 20 }, (_, i) => `<circle class="bu86" style="--x:${(i * 63) % 1200}px;animation-delay:-${(i * .4).toFixed(1)}s" cx="0" cy="0" r="${1.4 + (i % 3)}" fill="none" stroke="#e6f7ff" stroke-width=".8"/>`).join('')
      + `<defs><linearGradient id="g86" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34598f"/><stop offset=".6" stop-color="#22406b"/><stop offset="1" stop-color="#1a3254"/></linearGradient></defs><g class="wh86"><g class="whb"><g class="ft86"><path d="M-246 2 C -268 -10 -290 -34 -324 -42 C -304 -26 -298 -12 -288 2 C -298 16 -304 30 -324 46 C -290 38 -268 14 -246 2Z" fill="#22406b"/></g><path d="M232 4 C 230 -22 182 -44 100 -48 C 20 -52 -80 -46 -160 -28 C -200 -20 -228 -8 -252 -2 L -252 6 C -222 14 -170 28 -100 34 C 0 42 120 42 192 30 C 216 26 230 16 232 4Z" fill="url(#g86)"/><path d="M-150 30 C -60 44 80 46 196 28 C 214 24 226 16 230 8 C 200 20 150 24 110 22 C 40 30 -60 32 -150 30Z" fill="#c9d6ea" opacity=".9"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${96 + i * 12} ${24 + Math.sin(i / 8 * 3.1) * 2} q4 6 10 ${8 - i * .4}" stroke="#93a8c8" stroke-width="1.3" fill="none"/>`).join('')}<path d="M230 6 C 204 14 150 18 108 13" stroke="#152a45" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-118 -34 l-16 -12 l4 14z" fill="#22406b"/>${[[176, -30], [192, -22], [160, -36], [204, -12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#5d7fae"/>`).join('')}<circle cx="140" cy="2" r="4.4" fill="#0e1b2c"/><circle cx="141.6" cy=".6" r="1.4" fill="#fff"/><g class="pf86"><path d="M86 26 C 70 50 40 72 6 78 C 30 62 54 46 66 28Z" fill="#2b4a78"/><path d="M86 26 C 70 50 40 72 6 78" stroke="#c9d6ea" stroke-width="2" fill="none" opacity=".6"/></g></g></g>`
      + `<g class="fo86">${Array.from({ length: 12 }, (_, i) => `<g class="fs86" style="--dx:${(i - 6) * 10}px;--dy:${-30 - (i % 4) * 8}px">${star(0, 0, 3, ['#FFE27A', '#fff', '#5CE1E6'][i % 3])}</g>`).join('')}</g>`
      + Array.from({ length: 0 }, (_, i) => `<ellipse class="sg86" style="animation-delay:${(9 + i * .6).toFixed(1)}s" cx="0" cy="0" rx="20" ry="10" fill="none" stroke="#bff0ff" stroke-width="1.6"/>`).join('')
      + Array.from({ length: 8 }, (_, i) => `<g class="fi86" style="--o:${i * 26}px;--oy:${(i % 3) * 10}px"><ellipse rx="5" ry="2.6" fill="${['#FFD24A', '#FF8A1A', '#5CE1E6'][i % 3]}"/><path d="M-5 0 l-4 -3 v6z" fill="${['#FFD24A', '#FF8A1A', '#5CE1E6'][i % 3]}"/><circle cx="2.6" cy="-.6" r=".7" fill="#1d1d1d"/></g>`).join('') + `<g class="ry86">${Array.from({ length: 6 }, (_, i) => `<path d="M${200 + i * 170} 0 L${160 + i * 170} 120 H${200 + i * 170 + 30}Z" fill="#bff0ff" opacity=".12"/>`).join('')}</g>${[0, 1, 2].map((i) => `<g class="jl86" style="--x:${300 + i * 300}px;animation-delay:-${(i * 2).toFixed(0)}s"><path d="M-8 0 q8 -12 16 0z" fill="#ffb3e0" opacity=".85"/><path d="M-6 0 q-2 6 0 12 M0 0 q2 6 0 12 M6 0 q-2 6 0 12" stroke="#ffb3e0" stroke-width="1" fill="none"/></g>`).join('')}` });
  hide(86, ['.ry86', '.sea86', '.bu86', '.wh86', '.fo86', '.sg86', '.fi86']);
  mv(86, '.ry86', 22, [[0, 'none', 0], [8, 'none', 1], [90, 'none', 1], [100, 'none', 0]]);
  K('k86j', '0%{transform:translate(var(--x),110px);opacity:0}10%{opacity:1}50%{transform:translate(calc(var(--x) + 20px),50px)}90%{opacity:1}100%{transform:translate(var(--x),-20px);opacity:0}'); css += '.tp-86 .jl86{opacity:0}.go-86 .jl86{animation:k86j 8s ease-in-out infinite}';
  mv(86, '.sea86', 22, [[0, 'none', 0], [8, 'none', .55], [90, 'none', .55], [100, 'none', 0]]);
  K('k86b', '0%{opacity:0;transform:translate(var(--x),120px)}10%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 20px),-10px)}'); css += '.go-86 .bu86{animation:k86b 5s linear infinite}';
  mv(86, '.wh86', 22, [[0, 'translate(-300px,56px) scale(.6)', 1], [50, 'translate(560px,46px) scale(.6)', 1], [100, 'translate(1620px,56px) scale(.6)', 1]], 'linear');
  K('k86w', '0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(4px) rotate(1deg)}'); css += '.go-86 .whb{animation:k86w 4s ease-in-out infinite}';
  K('k86t', '0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}'); css += '.go-86 .ft86{animation:k86t 2s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 50%}';
  K('k86f', '0%,46%{opacity:0;transform:translate(0,0)}48%{opacity:1}64%,100%{opacity:0;transform:translate(var(--dx),var(--dy))}'); css += '.go-86 .fs86{animation:k86f 22s ease-out forwards}';
  mv(86, '.fo86', 22, [[0, 'translate(650px,17px)', 1], [100, 'translate(650px,17px)', 1]]);
  K('k86p', '0%,100%{transform:rotate(-6deg)}50%{transform:rotate(10deg)}'); css += '.go-86 .pf86{animation:k86p 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 0}';
  K('k86i', '0%{transform:translate(calc(-600px - var(--o)),calc(86px + var(--oy)))}100%{transform:translate(calc(1500px - var(--o)),calc(80px + var(--oy)))}'); css += '.go-86 .fi86{animation:k86i 22s linear forwards}';

  // 87 GIANT – the fire phoenix: dusk, a glowing ember rises from the garden, bursts into a gigantic bird of fire with wings across the whole sky, it flaps slowly, raining sparks, circles once over the house, folds into a ball of light and bursts into thousands of golden sparks that drift down
  add({ n: 87, big: true, t: 'Feuer-Phönix', scene: 'Herbst am Abend', where: 'den Himmel', dur: 20,
    g: `<rect class="dk87" x="0" y="0" width="1200" height="120" fill="#1a0a14"/>`
      + `<g class="em87"><circle r="6" fill="#FFE27A"/><circle r="12" fill="#FF8A1A" opacity=".4"/></g>`
      + `<g class="ph87"><g transform="translate(640 46)"><g class="wl87"><path d="M0 0 Q -80 -60 -260 -30 Q -200 -10 -220 10 Q -150 0 -170 24 Q -90 10 -20 14z" fill="#FF6A1A" opacity=".9"/><path d="M0 4 Q -70 -40 -200 -16 Q -140 0 -150 14 Q -80 6 -16 14z" fill="#FFD24A" opacity=".9"/></g><g class="wr87"><path d="M0 0 Q 80 -60 260 -30 Q 200 -10 220 10 Q 150 0 170 24 Q 90 10 20 14z" fill="#FF6A1A" opacity=".9"/><path d="M0 4 Q 70 -40 200 -16 Q 140 0 150 14 Q 80 6 16 14z" fill="#FFD24A" opacity=".9"/></g><ellipse cx="0" cy="8" rx="12" ry="20" fill="#FF8A1A"/><circle cx="0" cy="-16" r="8" fill="#FFB02E"/><path d="M6 -16 l8 3 -8 2z" fill="#FFE27A"/><circle cx="2" cy="-18" r="1.4" fill="#fff"/><path d="M-4 -22 q-6 -14 4 -18 q-2 8 4 10 q0 -10 8 -12 q-4 12 -4 18" fill="#FFD24A"/><path d="M0 28 q-20 30 -10 60 q6 -24 10 -30 q4 6 10 30 q10 -30 -10 -60z" fill="#FF6A1A" opacity=".85"/></g></g>`
      + Array.from({ length: 40 }, (_, i) => `<circle class="sk87" style="--x:${380 + (i * 37) % 520}px;--y:${20 + (i * 13) % 50}px;animation-delay:-${(i * .1).toFixed(1)}s" cx="0" cy="0" r="1.4" fill="${['#FFE27A', '#FF8A1A', '#fff'][i % 3]}"/>`).join('')
      + `<g class="lb87"><circle cx="640" cy="46" r="20" fill="#FFF3B0"/><circle cx="640" cy="46" r="34" fill="#FFD24A" opacity=".3"/></g>`
      + Array.from({ length: 60 }, (_, i) => `<circle class="gs87" style="--dx:${Math.round(Math.cos(i * .105) * (60 + (i * 7) % 300))}px;--dy:${Math.round(Math.sin(i * .105) * (20 + (i * 3) % 50))}px" cx="640" cy="46" r="1.6" fill="#FFD24A"/>`).join('') + `<g class="hg87"><circle cx="640" cy="50" r="120" fill="#FF8A1A" opacity=".15"/></g>${Array.from({ length: 30 }, (_, i) => `<circle class="as87" style="--x:${(i * 41) % 1200}px;animation-delay:${(8 + (i % 10) * .4).toFixed(1)}s" cx="0" cy="0" r="1" fill="#9a8f84"/>`).join('')}` + `${Array.from({ length: 36 }, (_, i) => `<circle class="em87" style="--x:${(i * 337) % 1200}px;animation-delay:${(3 + (i % 12) * .45).toFixed(2)}s" r="${(1 + (i % 3) * .5).toFixed(1)}" fill="${['#FFB02E', '#ff5a1a', '#FFE27A'][i % 3]}"/>`).join('')}` });
  hide(87, ['.hg87', '.as87', '.dk87', '.em87', '.ph87', '.sk87', '.lb87', '.gs87']);
  hide(87, ['.em87']);
  K('k87e', '0%{opacity:0;transform:translate(var(--x),-6px)}10%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 30px),118px)}'); css += '.go-87 .em87{animation:k87e 4.5s linear 3 both}.go-87 .ov > g{filter:drop-shadow(0 0 3px #ff8a1a)}';
  mv(87, '.hg87', 20, [[0, 'scale(.2)', 0], [18, 'scale(.2)', 0], [26, 'scale(1)', 1], [76, 'scale(1)', 1], [84, 'scale(1.5)', 0], [100, 'scale(1)', 0]]); fb('.hg87');
  K('k87a', '0%{transform:translate(var(--x),-6px);opacity:0}10%{opacity:.8}100%{transform:translate(calc(var(--x) + 20px),116px);opacity:0}'); css += '.go-87 .as87{animation:k87a 5s linear forwards}';
  mv(87, '.dk87', 20, [[0, 'none', 0], [6, 'none', .55], [90, 'none', .55], [100, 'none', 0]]);
  mv(87, '.em87', 20, [[0, 'translate(640px,110px)', 0], [4, 'translate(640px,110px)', 1], [16, 'translate(640px,50px)', 1], [18, 'translate(640px,46px) scale(3)', 0], [100, 'translate(640px,46px)', 0]]);
  mv(87, '.ph87', 20, [[0, 'scale(.05)', 0], [17, 'scale(.05)', 1], [24, 'scale(1.05)', 1], [28, 'scale(1)', 1], [40, 'translate(-120px,4px) scale(.8)', 1], [52, 'translate(0,10px) scale(.7)', 1], [64, 'translate(120px,4px) scale(.8)', 1], [72, 'scale(1)', 1], [78, 'scale(.1)', 1], [79, 'scale(.1)', 0], [100, 'scale(.1)', 0]], 'ease-in-out'); css += '.ph87{transform-origin:640px 46px}';
  K('k87l', '0%,100%{transform:rotate(0) scaleY(1)}50%{transform:rotate(14deg) scaleY(.7)}'); css += '.go-87 .wl87{animation:k87l 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 60%}';
  K('k87r', '0%,100%{transform:rotate(0) scaleY(1)}50%{transform:rotate(-14deg) scaleY(.7)}'); css += '.go-87 .wr87{animation:k87r 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:0 60%}';
  K('k87s', '0%{opacity:0;transform:translate(var(--x),var(--y))}20%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + 10px),calc(var(--y) + 60px))}'); css += '.go-87 .sk87{animation:k87s 1.8s linear infinite,k87so 20s linear forwards}'; K('k87so', '0%,20%{visibility:hidden}22%,76%{visibility:visible}78%,100%{visibility:hidden}');
  mv(87, '.lb87', 20, [[0, 'scale(.3)', 0], [76, 'scale(.3)', 0], [78, 'scale(1.2)', 1], [82, 'scale(.8)', 1], [84, 'scale(1.6)', 0], [100, 'scale(1.6)', 0]]); fb('.lb87');
  K('k87g', '0%,83%{opacity:0;transform:translate(0,0)}84%{opacity:1}100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 50px))}'); css += '.go-87 .gs87{animation:k87g 20s ease-out forwards}';

  // 88 GIANT – black hole: the light dims, a real-looking black hole opens in the sky (black shadow, thin bright photon ring, a glowing accretion disk bent over and under it by its gravity), a storm of dust spirals in – and then the WHOLE picture gets pulled in: house, trees, clouds, sun, everything stretches, spins and disappears into it. Darkness. The hole shrinks to a dot – BANG, a big-bang flash, and everything flies back out to where it was
  add({ n: 88, big: true, pull: true, t: 'Schwarzes Loch', scene: 'Jeder Tag', where: 'den Himmel', dur: 20,
    g: DARK(88, 'dk88', 20, 34, 60, .5)
      + `<defs><linearGradient id="ad88" x1="0" x2="1"><stop offset="0" stop-color="#ff7a1a" stop-opacity="0"/><stop offset=".25" stop-color="#ffb347"/><stop offset=".5" stop-color="#fff4d6"/><stop offset=".75" stop-color="#ffb347"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></linearGradient><filter id="gl88" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
      + Array.from({ length: 60 }, (_, i) => { const a = i * 137.5; const r = 120 + (i * 37) % 420; return `<g class="dp88" style="--a:${a.toFixed(0)}deg;--r:${r}px;animation-delay:${(2.4 + (i % 20) * .22).toFixed(2)}s"><rect x="-3" y="-.6" width="6" height="1.2" fill="${['#cfe0ff', '#fff', '#9fd0ff'][i % 3]}"/></g>`; }).join('')
      + `<g class="bh88" filter="url(#gl88)"><circle cx="640" cy="50" r="28" fill="none" stroke="#fff" stroke-width=".6" opacity=".35"/><circle cx="640" cy="50" r="22" fill="#000" opacity=".35"/><circle cx="640" cy="50" r="17" fill="#000"/><circle cx="640" cy="50" r="18" fill="none" stroke="#e9f1ff" stroke-width="1"/></g>`
      + `<circle class="pt88" cx="640" cy="50" r="2" fill="#fff"/><circle class="bb88" cx="640" cy="50" r="10" fill="#fff"/><circle class="rg88" cx="640" cy="50" r="10" fill="none" stroke="#fff" stroke-width="3"/><rect class="fl88" x="-200" y="0" width="1600" height="120" fill="#fff"/>`
      + `<g class="tx88"></g><g class="bg88"></g>` });
  hide(88, ['.dk88', '.dp88', '.bh88', '.pt88', '.bb88', '.rg88', '.fl88', '.tx88', '.bg88']);
  mv(88, '.bh88', 20, [[0, 'scale(0)', 0], [6, 'scale(0)', 1], [14, 'scale(1)', 1], [52, 'scale(1.25)', 1], [60, 'scale(1.25)', 1], [64, 'scale(0)', 1], [65, 'scale(0)', 0], [100, 'scale(0)', 0]]); fb('.bh88');
  K('k88p', '0%{opacity:0;transform:translate(640px,50px) rotate(var(--a)) translateX(var(--r))}10%{opacity:1}100%{opacity:0;transform:translate(640px,50px) rotate(calc(var(--a) + 540deg)) translateX(0) scaleX(4)}'); css += '.go-88 .dp88{animation:k88p 3.4s cubic-bezier(.6,0,1,1) both 2}';
  // the scene itself is pulled in (everything except the sky, the overlay and the tap area) and later bursts back out
  K('k88s', '0%,22%{transform:none;opacity:1}30%{transform:rotate(25deg) scale(.9,.8)}44%{transform:rotate(240deg) scale(.25,.12);opacity:1}52%{transform:rotate(540deg) scale(0);opacity:0}64%{transform:rotate(540deg) scale(0);opacity:0}66%{opacity:1}80%{transform:rotate(0) scale(1.05)}84%,100%{transform:none;opacity:1}');
  css += '.go-88 > .pull{animation:k88s 20s cubic-bezier(.55,0,.6,1) forwards;transform-origin:640px 50px;transform-box:view-box}';
  K('k88w', '0%,24%,56%,100%{translate:0 0}30%{translate:-2px 1px}36%{translate:2px -1px}42%{translate:-2px 0}48%{translate:2px 1px}'); css += '.go-88 .ov{animation:k88w 20s linear}';
  mv(88, '.pt88', 20, [[0, 'scale(0)', 0], [60, 'scale(0)', 0], [62, 'scale(2)', 1], [64, 'scale(.5)', 1], [65, 'scale(0)', 0], [100, 'scale(0)', 0]]); fb('.pt88');
  mv(88, '.bb88', 20, [[0, 'scale(0)', 0], [64, 'scale(0)', 1], [70, 'scale(40)', 0], [100, 'scale(40)', 0]]); fb('.bb88');
  mv(88, '.rg88', 20, [[0, 'scale(0)', 0], [64, 'scale(0)', 1], [74, 'scale(70)', 0], [100, 'scale(70)', 0]]); fb('.rg88');
  mv(88, '.fl88', 20, [[0, 'none', 0], [64, 'none', 0], [65, 'none', .9], [72, 'none', 0], [100, 'none', 0]]);
  mv(88, '.tx88', 20, [[0, 'none', 0], [40, 'none', 0], [44, 'none', 1], [56, 'none', 1], [60, 'none', 0], [100, 'none', 0]]);
  mv(88, '.bg88', 20, [[0, 'scale(.3)', 0], [65, 'scale(.3)', 0], [68, 'scale(1.4)', 1], [78, 'scale(1)', 1], [82, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.bg88');

  // 89 GIANT – the candy avalanche: the mountains rumble, then a gigantic avalanche of sweets thunders down over the whole picture – gummy bears, lollipops, candy canes, chocolate bars and sprinkles bounce and tumble across the meadow, a giant lollipop lands like a tree in the garden and a pile of sweets stays until it melts away
  add({ n: 89, big: true, t: 'Süssigkeiten-Lawine', scene: 'Winter mit Bergen', where: 'die Berge', dur: 18,
    g: Array.from({ length: 70 }, (_, i) => { const k = i % 5; const c = ['#FF5A7A', '#FFD24A', '#7CFF8A', '#5CE1E6', '#B07CFF', '#FF8A3C'][i % 6];
      const it = k === 0 ? `<g><circle cy="-4" r="3" fill="${c}"/><ellipse cy="2" rx="3.6" ry="4.2" fill="${c}"/><circle cx="-2.6" cy="-6.6" r="1.2" fill="${c}"/><circle cx="2.6" cy="-6.6" r="1.2" fill="${c}"/></g>` : k === 1 ? `<g><path d="M0 0 v10" stroke="#fff" stroke-width="1.4"/><circle r="5" fill="${c}"/><path d="M-3 -2 q3 -3 6 0 q-3 3 -6 0" stroke="#fff" stroke-width="1" fill="none"/></g>` : k === 2 ? `<path d="M0 8 V-4 q0 -5 5 -5 q5 0 5 5" stroke="#fff" stroke-width="3" fill="none"/><path d="M0 8 V-4 q0 -5 5 -5 q5 0 5 5" stroke="#E5483B" stroke-width="3" fill="none" stroke-dasharray="2 2"/>` : k === 3 ? `<rect x="-6" y="-3" width="12" height="6" fill="#6b3f1c"/><path d="M-2 -3 v6 M2 -3 v6" stroke="#5a3418" stroke-width=".8"/>` : `<rect x="-3" y="-1" width="6" height="2" rx="1" fill="${c}"/>`;
      return `<g class="cd89" style="--x:${(i * 17) % 1200}px;--y:${80 + (i * 7) % 30}px;--r:${(i * 61) % 360}deg;animation-delay:${(2 + (i % 20) * .18).toFixed(2)}s">${it}</g>`; }).join('')
      + `<g class="gl89"><path d="M520 112 V40" stroke="#fff" stroke-width="4"/><circle cx="520" cy="32" r="22" fill="#FF7AB6"/><path d="M520 32 m-16 0 a16 16 0 1 0 16 -16 a12 12 0 1 1 -12 12 a8 8 0 1 0 8 -8" stroke="#fff" stroke-width="3" fill="none"/></g>`
      + `<g class="rm89"></g>` + [[470, '#E5483B', '#D4A63B', 0], [610, '#3E8EDE', '#6b4a2e', .2], [760, '#FF7AB6', '#2b2b2b', .4]].map(([x, c, h, d]) => `<g class="kd89"><g class="kj89" style="animation-delay:-${d}s">${kid(x, 110, c, h)}<path d="M${x - 4} 92 l-6 -9 M${x + 4} 92 l6 -9" stroke="#F3CDA6" stroke-width="2" stroke-linecap="round"/></g></g>`).join('') + `<g class="jh89"></g>` + `<path class="ch89" d="M700 20 C 660 60 620 70 560 96 C 520 108 400 108 300 110" stroke="#6b3f1c" stroke-width="10" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path class="ch89" d="M700 20 C 660 60 620 70 560 96 C 520 108 400 108 300 110" stroke="#8a5428" stroke-width="4" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>` });
  hide(89, ['.cd89', '.gl89', '.rm89', '.kd89']); css += '.ch89{display:none}';
  K('k89rain', '0%{opacity:0;transform:translate(var(--x),-30px) rotate(0)}6%{opacity:1}70%{transform:translate(var(--x),var(--y)) rotate(var(--r))}78%{transform:translate(var(--x),calc(var(--y) - 7px)) rotate(var(--r))}86%,94%{opacity:1;transform:translate(var(--x),var(--y)) rotate(var(--r))}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(var(--r))}');
  css += '.go-89 .cd89{animation-name:k89rain !important;animation-duration:11s !important;animation-timing-function:ease-in !important;animation-fill-mode:both !important;animation-iteration-count:1 !important}';
  mv(89, '.kd89', 18, [[0, 'none', 0], [8, 'none', 1], [92, 'none', 1], [100, 'none', 0]]); K('k89j', '0%,100%{transform:translateY(0)}45%{transform:translateY(-12px)}'); css += '.go-89 .kj89{animation:k89j .55s ease-in-out infinite}';
  K('k89r', '0%,8%{stroke-dashoffset:100;opacity:1}40%,86%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}'); css += '.go-89 .ch89{animation:k89r 18s ease-out forwards}';
  K('k89sh', '0%,100%{transform:translate(0,0)}25%{transform:translate(-2px,1px)}75%{transform:translate(2px,-1px)}'); css += '.go-89 .ov{animation:k89sh .15s linear 12}';
  K('k89c', '0%{opacity:0;transform:translate(calc(var(--x) * .4 + 700px),-20px) rotate(0)}8%{opacity:1}40%{transform:translate(calc(var(--x) * .7 + 200px),40px) rotate(calc(var(--r) * .6))}60%{transform:translate(var(--x),var(--y)) rotate(var(--r))}64%{transform:translate(var(--x),calc(var(--y) - 8px)) rotate(var(--r))}68%,88%{opacity:1;transform:translate(var(--x),var(--y)) rotate(var(--r))}100%{opacity:0;transform:translate(var(--x),calc(var(--y) + 10px)) rotate(var(--r)) scale(.4)}'); css += '.go-89 .cd89{animation:k89c 13s ease-in forwards}';
  mv(89, '.gl89', 18, [[0, 'translateY(-160px) rotate(-30deg)', 0], [40, 'translateY(-160px) rotate(-30deg)', 1], [50, 'translateY(0) rotate(4deg)', 1], [54, 'rotate(-3deg)', 1], [58, 'rotate(0)', 1], [92, 'rotate(0)', 1], [100, 'rotate(0)', 0]], 'ease-in'); css += '.gl89{transform-box:fill-box;transform-origin:50% 100%}';
  mv(89, '.jh89', 18, [[0, 'none', 0], [40, 'none', 0], [44, 'none', 1], [86, 'none', 1], [90, 'none', 0], [100, 'none', 0]]); css += '.tp-89 .jh89{opacity:0}';
  mv(89, '.rm89', 18, [[0, 'scale(.4)', 0], [16, 'scale(.4)', 0], [20, 'scale(1.3)', 1], [30, 'scale(1)', 1], [34, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.rm89');

  // ================================================================ 10 CRAZY ONES (91–100)

  // 92 CRAZY – zero gravity: the ground rumbles, a warning flashes "SCHWERKRAFT: 0 %" – and everything starts to float: the pool water rises as a giant wobbling water bubble, three kids drift up laughing and turn slow somersaults, the beach ball, apples and leaves float around, the house lifts off a little. Then the world does a full barrel roll ("SCHWERKRAFT: NEUSTART") and gravity comes back: everything drops, the water bubble crashes into the pool with a huge splash, the kids land on their feet – "Puh!"
  add({ n: 92, big: true, pull: true, t: 'Schwerelos', scene: 'Jeder Tag', where: 'den Himmel', dur: 20,
    g: `<rect class="pe92" x="579" y="101.5" width="122" height="8" rx="2" fill="#d8e4ea"/>`
      + `<g class="wb92"><g class="wbw"><ellipse cx="0" cy="0" rx="40" ry="16" fill="#5fc4e8" opacity=".85"/><ellipse cx="-10" cy="-6" rx="16" ry="4" fill="#fff" opacity=".55"/><ellipse cx="14" cy="6" rx="10" ry="3" fill="#2a8cc0" opacity=".5"/></g></g>`
      + [[530, '#FF7AB6', '#D4A63B', 0], [760, '#3E8EDE', '#6b4a2e', 1], [810, '#3FA66B', '#2b2b2b', 2]].map(([x, c, h, i]) => `<g class="kd92 kf${i}"><g class="ks92 ks${i}">${kid(x, 108, c, h)}<path d="M${x - 4} 92 l-7 -6 M${x + 4} 92 l7 -6" stroke="#F3CDA6" stroke-width="2" stroke-linecap="round"/></g></g>`).join('')
      + `<g class="fl92 fb92"><circle cx="700" cy="104" r="6" fill="#fff"/><path d="M694 104 h12 M700 98 v12" stroke="#E5483B" stroke-width="2"/></g>`
      + [[786, 52], [800, 44], [812, 56], [778, 40]].map(([x, y], i) => `<g class="fl92 ap92 a${i}"><circle cx="${x}" cy="${y}" r="3" fill="#E5483B"/><path d="M${x} ${y - 3} l1 -2" stroke="#6b4a2e"/></g>`).join('')
      + Array.from({ length: 8 }, (_, i) => `<g class="fl92 lf92 l${i}"><path d="M${430 + i * 60} 110 q4 -4 8 0 q-4 4 -8 0z" fill="${['#5aa83c', '#E58A2B', '#3f8a2e'][i % 3]}"/></g>`).join('')
      + `<g class="wn92"><rect x="760" y="10" width="190" height="22" rx="4" fill="#1d1d1d" opacity=".8"/><text x="855" y="25" text-anchor="middle" font-size="11" font-weight="900" fill="#FFD24A" font-family="ui-monospace,monospace">⚠ SCHWERKRAFT: 0 %</text></g>`
      + `<g class="rs92"><rect x="760" y="10" width="190" height="22" rx="4" fill="#1d1d1d" opacity=".8"/><text x="855" y="25" text-anchor="middle" font-size="11" font-weight="900" fill="#7CFF8A" font-family="ui-monospace,monospace">SCHWERKRAFT: NEUSTART</text></g>`
      + `<g class="sp92"><path d="M590 104 q10 -34 24 -40 q8 18 14 -6 q10 26 18 0 q8 18 16 4 q12 6 22 42z" fill="#d6f3ff"/></g>` + Array.from({ length: 14 }, (_, i) => `<circle class="dr92" style="--dx:${(i - 7) * 9}px;--dy:${-30 - (i % 4) * 10}px" cx="640" cy="100" r="2" fill="#bfe8ff"/>`).join('')
      + `<g class="ph92"></g><g class="wi92"></g>` });
  hide(92, ['.pe92', '.wb92', '.kd92', '.fl92', '.wn92', '.rs92', '.sp92', '.dr92', '.ph92', '.wi92']);
  K('k92sh', '0%,2%,9%,100%{translate:0 0}3%{translate:-3px 1px}5%{translate:3px -1px}7%{translate:-2px 0}'); css += '.go-92 .ov{animation:k92sh 20s linear}';
  // the house and garden lift a little and sway while gravity is off, and drop back with a bump
  K('k92p', '0%,10%{transform:none}20%{transform:translateY(-5px) rotate(-.6deg)}35%{transform:translateY(-7px) rotate(.6deg)}50%{transform:translateY(-5px) rotate(-.4deg)}62%{transform:translateY(-6px)}76%{transform:translateY(2px)}79%,100%{transform:none}'); css += '.go-92 > .pull{animation:k92p 20s ease-in-out forwards;transform-origin:640px 100px;transform-box:view-box}';
  K('k92r', '0%,64%{transform:none}74%{transform:perspective(700px) rotateX(360deg)}100%{transform:perspective(700px) rotateX(360deg)}'); css += '.go-92{animation:k92r 20s cubic-bezier(.6,0,.4,1) forwards;transform-origin:50% 50%}';
  mv(92, '.wn92', 20, [[0, 'none', 0], [2, 'none', 1], [4, 'none', 0], [6, 'none', 1], [8, 'none', 0], [10, 'none', 1], [60, 'none', 1], [62, 'none', 0], [100, 'none', 0]]);
  mv(92, '.rs92', 20, [[0, 'none', 0], [64, 'none', 0], [66, 'none', 1], [76, 'none', 1], [78, 'none', 0], [100, 'none', 0]]);
  mv(92, '.pe92', 20, [[0, 'none', 0], [12, 'none', 0], [16, 'none', 1], [77, 'none', 1], [79, 'none', 0], [100, 'none', 0]]);
  mv(92, '.wb92', 20, [[0, 'translate(640px,104px) scale(.4,.2)', 0], [12, 'translate(640px,104px) scale(.4,.2)', 1], [24, 'translate(640px,60px) scale(1)', 1], [40, 'translate(630px,44px) scale(1)', 1], [56, 'translate(650px,48px) scale(1)', 1], [64, 'translate(640px,46px) scale(1)', 1], [76, 'translate(640px,46px) scale(1)', 1], [79, 'translate(640px,100px) scale(1.4,.5)', 1], [80, 'translate(640px,104px) scale(1.4,.3)', 0], [100, 'translate(640px,104px)', 0]], 'ease-in-out');
  K('k92w', '0%,100%{transform:scale(1,1)}25%{transform:scale(1.12,.86)}50%{transform:scale(.9,1.12)}75%{transform:scale(1.06,.92)}'); css += '.go-92 .wbw{animation:k92w 1.6s ease-in-out infinite}';
  [[0, -50, -260], [1, -62, 300], [2, -44, -340]].forEach(([i, h, r]) => {
    mv(92, `.kf${i}`, 20, [[0, 'translateY(0)', 1], [12 + i * 2, 'translateY(0)', 1], [30, `translateY(${h}px)`, 1], [46, `translateY(${h + 8}px)`, 1], [62, `translateY(${h - 4}px)`, 1], [76, `translateY(${h}px)`, 1], [80, 'translateY(0)', 1], [82, 'translateY(-4px)', 1], [84, 'translateY(0)', 1], [100, 'translateY(0)', 1]], 'ease-in-out');
    mv(92, `.ks${i}`, 20, [[0, 'rotate(0)', 1], [14, 'rotate(0)', 1], [76, `rotate(${r}deg)`, 1], [79, 'rotate(360deg)', 1], [100, 'rotate(360deg)', 1]], 'ease-in-out'); });
  css += '.ks92{transform-box:fill-box;transform-origin:50% 60%}.tp-92 .kd92{opacity:0}.go-92 .kd92{opacity:1}';
  mv(92, '.fb92', 20, [[0, 'none', 0], [12, 'none', 1], [36, 'translate(-30px,-60px) rotate(200deg)', 1], [60, 'translate(20px,-50px) rotate(400deg)', 1], [76, 'translate(0,-56px) rotate(500deg)', 1], [80, 'translate(0,0)', 1], [84, 'translate(4px,-10px)', 1], [88, 'translate(8px,0)', 1], [96, 'translate(8px,0)', 1], [100, 'translate(8px,0)', 0]]);
  for (let i = 0; i < 4; i++) mv(92, `.a${i}`, 20, [[0, 'none', 0], [14, 'none', 1], [40, `translate(${(i - 2) * 14}px,${-14 - i * 4}px)`, 1], [76, `translate(${(i - 2) * 20}px,${-18 - i * 5}px)`, 1], [80, `translate(${(i - 2) * 24}px,${58 - i * 8 + 46}px)`, 1], [96, `translate(${(i - 2) * 24}px,${58 - i * 8 + 46}px)`, 1], [100, `translate(${(i - 2) * 24}px,${58 - i * 8 + 46}px)`, 0]], 'ease-in-out');
  for (let i = 0; i < 8; i++) mv(92, `.l${i}`, 20, [[0, 'none', 0], [12, 'none', 1], [40, `translate(${(i % 3 - 1) * 20}px,${-40 - i * 6}px) rotate(${i * 90}deg)`, 1], [76, `translate(${(i % 3 - 1) * 30}px,${-50 - i * 5}px) rotate(${i * 180}deg)`, 1], [84, 'translate(0,0) rotate(0)', 1], [96, 'none', 1], [100, 'none', 0]], 'ease-in-out');
  mv(92, '.sp92', 20, [[0, 'scaleY(0)', 0], [79, 'scaleY(0)', 0], [80, 'scaleY(1.2)', 1], [86, 'scaleY(.2)', 0], [100, 'scaleY(0)', 0]]); fbb('.sp92');
  K('k92d', '0%,79%{opacity:0;transform:translate(0,0)}80%{opacity:1}86%{transform:translate(calc(var(--dx) * .6),var(--dy))}92%,100%{opacity:0;transform:translate(var(--dx),0)}'); css += '.tp-92 .dr92{opacity:0}.go-92 .dr92{animation:k92d 20s ease-out forwards}';
  mv(92, '.wi92', 20, [[0, 'scale(.4)', 0], [24, 'scale(.4)', 0], [27, 'scale(1.2)', 1], [44, 'scale(1)', 1], [46, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.wi92');
  mv(92, '.ph92', 20, [[0, 'scale(.4)', 0], [84, 'scale(.4)', 0], [87, 'scale(1.2)', 1], [96, 'scale(1)', 1], [99, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.ph92');

  // 93 CRAZY – mega party: the bass drops, the WHOLE picture pulses and changes colour like a disco, strobe flashes, rings of sound boom out from the house, kids dance on the roof, confetti cannons, a giant bouncing "PARTY!"
  add({ n: 93, big: true, t: 'Mega-Party', scene: 'Jeder Tag', where: 'das Haus', dur: 16,
    g: DARK(93, 'dk93', 16, 8, 92, .55) + [0, 1, 2, 3].map((i) => `<circle class="bs93" style="animation-delay:${(i * .5).toFixed(1)}s" cx="640" cy="70" r="20" fill="none" stroke="#fff" stroke-width="3"/>`).join('')
      + [[612, '#FF7AB6', '#D4A63B'], [640, '#3E8EDE', '#6b4a2e'], [668, '#3FA66B', '#2b2b2b']].map(([x, c, h]) => `<g class="dn93"><g class="dnr">${kid(x, 50, c, h)}</g></g>`).join('')
      + `<g class="pt93"></g>`
      + `<g class="cf93">${conf(120, 640, 600, 50)}</g><rect class="sb93" x="0" y="0" width="1200" height="120" fill="#fff"/>` + `${['3', '2', '1', 'DROP!'].map((s, i) => `<g class="cd93 c${i}"><text x="640" y="72" text-anchor="middle" font-size="${i === 3 ? 34 : 40}" font-weight="900" fill="#fff" stroke="#c2185b" stroke-width="1.4" font-family="system-ui,sans-serif">${s}</text></g>`).join('')}<g class="db93"><path d="M640 -20 v24" stroke="#9aa1aa"/><circle cx="640" cy="10" r="7" fill="#dfe6ee"/><path d="M633 8 h14 M634 12 h12 M640 3 v14" stroke="#9aa6b6" stroke-width=".6"/></g>${Array.from({ length: 14 }, (_, i) => `<ellipse class="ls93" style="--x:${(i * 89) % 1200}px;animation-delay:-${(i * .3).toFixed(1)}s" cx="0" cy="104" rx="10" ry="3" fill="${['#FF3DC8', '#33E6FF', '#FFE27A', '#7CFF8A'][i % 4]}" opacity=".7"/>`).join('')}${Array.from({ length: 40 }, (_, i) => `<rect class="eq93" style="animation-delay:-${((i * 7) % 10 * .06).toFixed(2)}s" x="${20 + i * 30}" y="96" width="14" height="24" fill="${['#FF3DC8', '#33E6FF', '#FFE27A', '#7CFF8A'][i % 4]}" opacity=".8"/>`).join('')}` });
  hide(93, ['.dk93', '.bs93', '.dn93', '.pt93', '.cf93', '.sb93']);
  hide(93, ['.cd93', '.db93', '.ls93', '.eq93']);
  [0, 1, 2, 3].forEach((i) => mv(93, `.c${i}`, 16, [[0, 'scale(.4)', 0], [i * 2.2, 'scale(.4)', 0], [i * 2.2 + .5, 'scale(1.4)', 1], [i * 2.2 + 2, 'scale(1)', i === 3 ? 1 : 0], [i * 2.2 + 3, 'scale(1)', 0], [100, 'scale(1)', 0]])); fb('.cd93');
  mv(93, '.db93', 16, [[0, 'translateY(-30px)', 0], [9, 'translateY(-30px)', 0], [14, 'translateY(0)', 1], [90, 'translateY(0)', 1], [96, 'translateY(-30px)', 0], [100, 'translateY(-30px)', 0]]); K('k93r', 'to{transform:rotate(360deg)}'); css += '.go-93 .db93 circle{animation:k93r 2s linear infinite;transform-box:fill-box;transform-origin:center}';
  K('k93l', '0%{transform:translateX(var(--x))}50%{transform:translateX(calc(var(--x) + 120px))}100%{transform:translateX(var(--x))}'); css += '.go-93 .ls93{animation:k93l 3s ease-in-out infinite}';
  K('k93q', '0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}'); css += '.go-93 .eq93{animation:k93q .45s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}';
  css += '.go-93 .eq93{opacity:.45}.go-93 .ls93{opacity:.6}';
  K('k93', '0%,6%{filter:none;transform:none}10%{filter:hue-rotate(90deg) saturate(1.8)}20%{filter:hue-rotate(200deg) saturate(2) brightness(1.1)}30%{filter:hue-rotate(300deg) saturate(1.8)}40%{filter:hue-rotate(40deg) saturate(2)}50%{filter:hue-rotate(160deg) saturate(2) brightness(1.15)}60%{filter:hue-rotate(260deg) saturate(1.8)}70%{filter:hue-rotate(20deg) saturate(2)}80%{filter:hue-rotate(120deg) saturate(1.6)}92%,100%{filter:none}');
  K('k93p', '0%,100%{transform:scale(1)}50%{transform:scale(1.02)}'); 
  K('k93b', '0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(9)}'); css += '.go-93 .bs93{animation:k93b 2s ease-out infinite;transform-box:fill-box;transform-origin:center}';
  mv(93, '.dn93', 16, [[0, 'none', 0], [8, 'none', 0], [12, 'none', 1], [92, 'none', 1], [100, 'none', 0]]); K('k93d', '0%,100%{transform:translateY(0) rotate(-10deg)}50%{transform:translateY(-6px) rotate(10deg)}'); css += '.go-93 .dnr{animation:k93d .45s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}';
  K('k93t', '0%,100%{transform:scale(1) rotate(-4deg)}50%{transform:scale(1.25) rotate(4deg)}'); mv(93, '.pt93', 16, [[0, 'none', 0], [8, 'none', 0], [10, 'none', 1], [92, 'none', 1], [100, 'none', 0]]); css += '.go-93 .pt93 text{animation:k93t .45s ease-in-out infinite;transform-box:fill-box;transform-origin:center}';
  css += '.go-93 .cf93{opacity:1}.go-93 .cf93 .cf{animation:cff 3s ease-out 4s 3;opacity:0}.cf93 .cf{--dy:-70px}';
  K('k93s', '0%,8%{opacity:0}9%{opacity:.6}10%,30%{opacity:0}31%{opacity:.6}32%,50%{opacity:0}51%{opacity:.6}52%,70%{opacity:0}71%{opacity:.6}72%,100%{opacity:0}'); A(93, '.sb93', 'k93s', 16, 'linear');

  // 94 CRAZY – matrix mode: the picture fades into dark green, dense code rain in three depths pours down over everything (bright white heads, fading tails), and then terminal windows pop open one after another all over the sky and type away – family commands like "ämtli --status", "ping oma.local", "make znüni" with progress bars; one terminal says "Folge dem weissen Kaninchen …" and a little white rabbit hops across the meadow; finally all terminals close, the rain thins out and "Alle Ämtli erledigt ✓ – zurück in die echte Welt" appears before the real picture returns
  add({ n: 94, big: true, t: 'Matrix-Modus', scene: 'Jeder Tag', where: 'den Himmel', dur: 18,
    g: `<rect class="bk94" x="-300" y="-20" width="1800" height="160" fill="#010a03"/>`
      + Array.from({ length: 84 }, (_, i) => { const z = i % 3; const fs = [6, 8, 11][z]; const len = 14; return `<g class="cr94" style="--x:${((i * 151) % 1500) - 150}px;--s:${(1.1 + ((i * 7) % 10) * .16 + (2 - z) * .5).toFixed(2)}s;animation-delay:-${((i * .37) % 3).toFixed(2)}s,0s" opacity="${[.4, .7, 1][z]}">${Array.from({ length: len }, (_, k) => `<text x="0" y="${(k * fs * 1.05).toFixed(1)}" font-size="${fs}" font-family="ui-monospace,monospace" fill="${k === len - 1 ? '#eaffea' : '#2bff5a'}" opacity="${(.12 + k / len * .88).toFixed(2)}">${'01アイウエオカキクケコサシスセソ'[(i * 7 + k * 5) % 17]}</text>`).join('')}</g>`; }).join('')
      + (() => { const T = [[70, 6, ['$ ssh familie@planer', 'Verbunden ✓']], [300, 26, ['$ ämtli --status', 'Zimmer ✓  Tisch ✓  Hund ✓']], [530, 4, ['$ ping oma.local', '64 bytes: 12 ms ♥']], [760, 22, ['$ top', 'kuchen.exe   99 % CPU']], [990, 6, ['$ make znüni', '[████████░░] 80 %']], [170, 60, ['$ git push --kinder', 'Schlafenszeit: 20:00']], [410, 70, ['$ cat wochenplan.txt', 'Mo Schwimmen · Mi Flöte']], [650, 58, ['Wach auf …', 'Folge dem weissen Kaninchen …']], [880, 70, ['$ sudo ferien --jetzt', 'Passwort: ********']], [1090, 50, ['$ uptime', 'Familie: 365 Tage ♥']]];
        return T.map(([x, y, L], i) => `<g class="tm94 m${i}"><rect x="${x}" y="${y}" width="170" height="${14 + L.length * 10}" rx="3" fill="#020d04" fill-opacity=".92" stroke="#2bff5a" stroke-width=".8"/><rect x="${x}" y="${y}" width="170" height="7" rx="3" fill="#0b3a16"/><circle cx="${x + 5}" cy="${y + 3.5}" r="1.5" fill="#ff5a5a"/><circle cx="${x + 10}" cy="${y + 3.5}" r="1.5" fill="#FFD24A"/><circle cx="${x + 15}" cy="${y + 3.5}" r="1.5" fill="#7CFF8A"/>${L.map((s, k) => `<text class="tl94 l${i}_${k}" x="${x + 5}" y="${y + 16 + k * 10}" font-size="7" font-family="ui-monospace,monospace" fill="${s.startsWith('$') ? '#2bff5a' : '#d9ffd9'}">${s}</text>`).join('')}<rect class="cu94" x="${x + 5 + L[L.length - 1].length * 4.2}" y="${y + 10 + (L.length - 1) * 10}" width="4" height="7" fill="#2bff5a"/></g>`).join(''); })()
      + `<g class="rb94"><ellipse cx="0" cy="-4" rx="6" ry="4" fill="#fff"/><circle cx="5" cy="-8" r="3" fill="#fff"/><path d="M5 -10 l-1 -7 l2 0z M7 -10 l1 -7 l1 1z" fill="#fff"/><circle cx="6.4" cy="-8.4" r=".6" fill="#ff5a7a"/><circle cx="-6" cy="-5" r="1.8" fill="#fff"/></g>`
      + `<g class="ok94"><rect x="430" y="40" width="420" height="34" rx="4" fill="#010a03" opacity=".9" stroke="#2bff5a" stroke-width=".8"/><text x="640" y="61" text-anchor="middle" font-size="12" font-weight="900" fill="#2bff5a" font-family="ui-monospace,monospace">Alle Ämtli erledigt ✓ – zurück in die echte Welt</text></g>` });
  hide(94, ['.bk94', '.cr94', '.tm94', '.rb94', '.ok94']);
  mv(94, '.bk94', 18, [[0, 'none', 0], [6, 'none', .8], [84, 'none', .8], [92, 'none', 0], [100, 'none', 0]]);
  K('k94r', '0%{transform:translate(var(--x),-150px)}100%{transform:translate(var(--x),130px)}'); K('k94ro', '0%,2%{opacity:0}8%,82%{opacity:1}90%,100%{opacity:0}');
  css += '.go-94 .cr94{animation:k94r 2s linear infinite,k94ro 18s linear forwards;animation-duration:var(--s),18s}';
  for (let i = 0; i < 10; i++) { const a = 10 + i * 5.2; mv(94, `.m${i}`, 18, [[0, 'scale(0)', 0], [a, 'scale(0)', 0], [a + 1.2, 'scale(1.06)', 1], [a + 2, 'scale(1)', 1], [76 + i * .6, 'scale(1)', 1], [77.4 + i * .6, 'scale(0,.1)', 0], [100, 'scale(0)', 0]]); fb(`.m${i}`);
    [0, 1].forEach((k) => { K(`k94t${i}_${k}`, `0%,${a + 2 + k * 2.4}%{clip-path:inset(0 100% 0 0)}${a + 4.2 + k * 2.4}%,100%{clip-path:inset(0 0 0 0)}`); css += `.go-94 .l${i}_${k}{animation:k94t${i}_${k} 18s steps(14) forwards}`; }); }
  K('k94c', '0%,49%{opacity:1}50%,100%{opacity:0}'); css += '.go-94 .cu94{animation:k94c .7s steps(1) infinite}';
  mv(94, '.rb94', 18, [[0, 'translate(560px,108px)', 0], [56, 'translate(560px,108px)', 0], [57, 'translate(560px,108px)', 1]].concat(Array.from({ length: 8 }, (_, k) => [[59 + k * 2.4, `translate(${590 + k * 40}px,96px)`, 1], [60.2 + k * 2.4, `translate(${610 + k * 40}px,108px)`, 1]]).flat()).concat([[79, 'translate(900px,108px)', 0], [100, 'translate(900px,108px)', 0]]), 'ease-in-out');
  mv(94, '.ok94', 18, [[0, 'scale(.3)', 0], [80, 'scale(.3)', 0], [83, 'scale(1)', 1], [92, 'scale(1)', 1], [95, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.ok94');

  // 97 CRAZY – pixel explosion: the picture turns into big retro pixels block by block (in random order, like an old game loading), then "8-BIT BOOM!" – the pixels explode in all directions, swirl, fly back and snap into place, and finally vanish block by block until the sharp picture is back; a score counter runs in the corner
  add({ n: 97, big: true, t: 'Pixel-Explosion', scene: 'Jeder Tag', where: 'das Haus', dur: 16,
    g: (() => { const S = 20; let s = ''; let i = 0;
      const col = (x, y) => { const cx = x + S / 2; const cy = y + S / 2;
        if (Math.hypot(cx - 362, cy - 28) < 22) return '#FFE27A';
        if (cx >= 577 && cx < 703 && cy >= 100 && cy < 112) return '#5fc4e8';
        if (cx >= 598 && cx < 682 && cy >= 30 && cy < 58 && Math.abs(cx - 640) < (cy - 29) * 1.7) return '#c0583f';
        if (cx >= 598 && cx < 682 && cy >= 56 && cy < 99) return cy > 80 ? '#cfe6fb' : '#f1e3c8';
        if (cx >= 562 && cx < 598 && cy >= 66 && cy < 99) return '#e6dcc6';
        if (Math.hypot(cx - 794, (cy - 56) * 1.2) < 40) return '#4f9a3e';
        if (Math.hypot(cx - 472, (cy - 70) * 1.2) < 22) return '#5aa83c';
        if (cy >= 98) return (x / S + y / S) % 2 ? '#6fbf4a' : '#5aa83c';
        return cy < 40 ? '#78b7ee' : '#a8d6f6'; };
      for (let y = 0; y < 120; y += S) for (let x = -40; x < 1260; x += S) { const a = Math.atan2(y - 60, x - 640) + (i % 7) * .1;
        s += `<rect class="px97" style="--dx:${Math.round(Math.cos(a) * (160 + (i * 37) % 300))}px;--dy:${Math.round(Math.sin(a) * (50 + (i * 13) % 100))}px;--r:${(i * 61) % 540 - 270}deg;animation-delay:${((i * 7) % 20 * .02).toFixed(2)}s,${((i * 97) % 100 * .024).toFixed(3)}s" x="${x}" y="${y}" width="${S + .4}" height="${S + .4}" fill="${col(x, y)}"/>`; i++; }
      return `<g class="pg97">${s}</g>`; })()
      + `<rect class="fx97" x="-300" y="0" width="1800" height="120" fill="#fff"/><g class="bm97"></g><g class="sc97"><text x="1080" y="18" text-anchor="end" font-size="10" font-weight="900" fill="#fff" stroke="#1d1d1d" stroke-width=".4" font-family="ui-monospace,monospace">SCORE 999999  1UP</text></g>` });
  hide(97, ['.pg97', '.fx97', '.bm97', '.sc97']);
  K('k97m', '0%,26%{transform:none}48%,56%{transform:translate(var(--dx),var(--dy)) rotate(var(--r))}76%,100%{transform:none}');
  K('k97o', '0%{opacity:0}4%,78%{opacity:1}84%,100%{opacity:0}');
  css += '.go-97 .pg97{opacity:1}.tp-97 .px97{opacity:0}.go-97 .px97{animation:k97m 16s ease-in-out forwards,k97o 16s steps(1) forwards;transform-box:fill-box;transform-origin:center;will-change:transform}';
  mv(97, '.fx97', 16, [[0, 'none', 0], [25, 'none', 0], [26, 'none', .8], [30, 'none', 0], [100, 'none', 0]]);
  mv(97, '.bm97', 16, [[0, 'scale(.3)', 0], [26, 'scale(.3)', 0], [29, 'scale(1.4)', 1], [40, 'scale(1)', 1], [44, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.bm97');
  mv(97, '.sc97', 16, [[0, 'none', 0], [4, 'none', 1], [92, 'none', 1], [96, 'none', 0], [100, 'none', 0]]);

  // 98 CRAZY – roller coaster: first the track builds itself from the far left edge to the right – lattice support towers grow out of the ground one after another and the red double rails with sleepers appear along them, up a lift hill, over the roof and through a big loop; only when the whole track stands does a sleek three-car train with kids (arms up) roll in from the far left, click slowly up the lift hill, plunge down, race over the roof, through the loop and out on the right; then the coaster folds away
  const RCP = [[-40, 104], [60, 104, 220, 104, 300, 104], [340, 104, 380, 100, 410, 70], [430, 46, 444, 16, 470, 16], [500, 16, 520, 92, 560, 92], [600, 92, 620, 26, 690, 26], [740, 26, 790, 86, 860, 86], [935, 86, 935, 24, 895, 24], [855, 24, 855, 86, 912, 88], [980, 90, 1060, 96, 1320, 96]];
  const RC = 'M' + RCP[0].join(' ') + RCP.slice(1).map((p) => ' C ' + p.join(' ')).join('');
  const BZ = (p0, c, t1) => { const u = 1 - t1; return [u * u * u * p0[0] + 3 * u * u * t1 * c[0] + 3 * u * t1 * t1 * c[2] + t1 * t1 * t1 * c[4], u * u * u * p0[1] + 3 * u * u * t1 * c[1] + 3 * u * t1 * t1 * c[3] + t1 * t1 * t1 * c[5]]; };
  const RCL = (() => { const L = [0]; let p0 = RCP[0]; let tot = 0; RCP.slice(1).forEach((c) => { let q = p0; for (let k = 1; k <= 60; k++) { const r = BZ(p0, c, k / 60); tot += Math.hypot(r[0] - q[0], r[1] - q[1]); q = r; } L.push(tot); p0 = c.slice(4); }); return L.map((v) => v / tot * 100); })();
  const RCY = (x0) => { let best = null; let p0 = RCP[0]; RCP.slice(1).forEach((c, si) => { for (let k = 0; k <= 40; k++) { const [x, y] = BZ(p0, c, k / 40); if (si !== 6 && si !== 7 && Math.abs(x - x0) < 3 && (best === null || y > best)) best = y; } p0 = c.slice(4); }); return best; };
  const tower = (x, y) => { if (y === null || y > 100) return ''; let s = `<path d="M${x - 3} ${y + 2} V108 M${x + 3} ${y + 2} V108" stroke="#7d8a99" stroke-width="1.2"/>`; for (let yy = y + 4; yy < 106; yy += 6) s += `<path d="M${x - 3} ${yy} L${x + 3} ${Math.min(108, yy + 6)}" stroke="#9aa6b6" stroke-width=".6"/>`; return s; };
  const car = (lead, c) => `<g transform="translate(0 -5)"><path d="M-11 3 V-2 Q-11 -5 -6 -5 H${lead ? 6 : 8} Q${lead ? 14 : 11} -5 ${lead ? 17 : 11} 3Z" fill="${c}"/><path d="M-11 0 H${lead ? 15 : 11}" stroke="#fff" stroke-width="1"/><circle cx="-6" cy="4" r="1.8" fill="#2b2b2b"/><circle cx="6" cy="4" r="1.8" fill="#2b2b2b"/><circle cx="0" cy="-8" r="2.8" fill="#F3CDA6"/><path d="M-2.6 -9 q2.6 -4 5.2 0z" fill="#6b4a2e"/><path d="M-2 -10 l-2 -6 M2 -10 l2 -6" stroke="#F3CDA6" stroke-width="1.3" stroke-linecap="round"/></g>`;
  add({ n: 98, big: true, t: 'Achterbahn', scene: 'Jeder Tag', where: 'den Himmel', dur: 22,
    g: `<defs><clipPath id="cl98"><rect x="-80" y="-60" width="0" height="220"><animate attributeName="width" begin="indefinite" dur="22s" values="0;0;1440;1440" keyTimes="0;.03;.3;1" fill="freeze"/></rect></clipPath></defs>`
      + `<g class="tw98">${Array.from({ length: 34 }, (_, i) => { const x = -20 + i * 40; return x > 846 && x < 930 ? '' : `<g class="tws" style="animation-delay:${(.66 + (x + 80) / 1440 * 5.94).toFixed(2)}s">${tower(x, RCY(x))}</g>`; }).join('')}<g class="tws" style="animation-delay:4.2s">${tower(872, 86)}${tower(918, 86)}</g></g>`
      + `<g class="rl98" clip-path="url(#cl98)"><path d="${RC}" stroke="#4b5563" stroke-width="5" fill="none" stroke-dasharray="1.2 3.4" pathLength="360"/><path d="${RC}" stroke="#E5483B" stroke-width="1.4" fill="none" transform="translate(0 -1.6)"/><path d="${RC}" stroke="#E5483B" stroke-width="1.4" fill="none" transform="translate(0 1.6)"/></g>`
      + [0, 1, 2].map((i) => `<g class="tr98 tc${i}" style="offset-path:path('${RC}');offset-rotate:auto">${car(i === 0, ['#FFD24A', '#3E8EDE', '#FF5A7A'][i])}</g>`).join('') });
  hide(98, ['.tw98', '.rl98', '.tr98']);
  K('k98tw', '0%{transform:scaleY(0)}100%{transform:scaleY(1)}'); css += '.tws{transform-box:fill-box;transform-origin:50% 100%}.tp-98 .tws{transform:scaleY(0)}.go-98 .tws{animation:k98tw .5s ease-out both}';
  mv(98, '.tw98', 22, [[0, 'none', 1], [92, 'none', 1], [98, 'translateY(20px)', 0], [100, 'translateY(20px)', 0]]);
  mv(98, '.rl98', 22, [[0, 'none', 1], [92, 'none', 1], [98, 'none', 0], [100, 'none', 0]]);
  { const gap = 26 / 1700 * 100; const P = [[0, 0], [32, 0], [40, RCL[2]], [54, RCL[3]], [58, RCL[4]], [63, RCL[5]], [67, RCL[6]], [74, RCL[8]], [86, 100]];
    [0, 1, 2].forEach((i) => { const f = (d) => `${Math.max(0, Math.min(100, d - i * gap)).toFixed(2)}%`;
      K(`k98c${i}`, `0%,31%{offset-distance:0%;opacity:0}` + P.slice(1).map(([p, d], k) => `${p}%{offset-distance:${f(d)};opacity:1;animation-timing-function:${k === 1 ? 'linear' : k === 2 ? 'ease-in' : 'ease-in-out'}}`).join('') + '88%,100%{offset-distance:100%;opacity:0}');
      css += `.go-98 .tc${i}{animation:k98c${i} 22s linear forwards}`; }); }

  // 99 CRAZY – trampoline to space: a kid bounces on a big trampoline – higher, higher, the mat stretches deep – the last jump becomes a launch with a speed trail: the sky turns from blue to violet to black, the ground becomes the curved Earth far below, stars come out, a satellite drifts past, an astronaut floats over for a high five (sparks!), then the kid falls back, a parachute pops and it floats down onto the trampoline – "Juhuu! Nochmal!"
  add({ n: 99, big: true, t: 'Trampolin ins All', scene: 'Jeder Tag', where: 'den Rasen', dur: 22,
    g: `<g class="tr99"><path d="M488 108 l-6 6 M552 108 l6 6 M500 108 v6 M540 108 v6" stroke="#2b2b2b" stroke-width="2"/><ellipse cx="520" cy="106" rx="34" ry="5" fill="#3E8EDE"/><path class="mt99" d="M490 106 Q 520 106 550 106" stroke="#1d1d1d" stroke-width="3" fill="none"><animate attributeName="d" begin="indefinite" dur="22s" values="M490 106 Q 520 106 550 106;M490 106 Q 520 112 550 106;M490 106 Q 520 106 550 106;M490 106 Q 520 116 550 106;M490 106 Q 520 106 550 106;M490 106 Q 520 120 550 106;M490 106 Q 520 106 550 106;M490 106 Q 520 106 550 106;M490 106 Q 520 112 550 106;M490 106 Q 520 106 550 106" keyTimes="0;.06;.09;.13;.16;.21;.24;.86;.89;1" fill="freeze"/></path></g>`
      + `<defs><linearGradient id="sk99" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05040f"/><stop offset=".55" stop-color="#1b1446"/><stop offset=".8" stop-color="#3d2a7a"/><stop offset="1" stop-color="#6aa6e8"/></linearGradient></defs>`
      + `<rect class="sp99" x="-200" y="0" width="1600" height="120" fill="url(#sk99)"/><g class="ea99"><ellipse cx="640" cy="330" rx="900" ry="230" fill="#2f6fb8"/><ellipse cx="640" cy="330" rx="900" ry="230" fill="none" stroke="#9fd8ff" stroke-width="5" opacity=".7"/><path d="M180 112 q60 -14 120 -6 q40 8 80 -2 M780 106 q80 -12 160 0" stroke="#4fae5a" stroke-width="10" fill="none" opacity=".8"/></g>`
      + Array.from({ length: 40 }, (_, i) => `<circle class="st99" cx="${(i * 31) % 1200}" cy="${3 + (i * 13) % 80}" r="${i % 5 ? .8 : 1.4}" fill="#fff"/>`).join('')
      + `<g class="sa99"><rect x="-6" y="-3" width="12" height="6" fill="#c9d1d9"/><rect x="-24" y="-2.5" width="16" height="5" fill="#3E8EDE"/><rect x="8" y="-2.5" width="16" height="5" fill="#3E8EDE"/><path d="M0 -3 v-5" stroke="#c9d1d9"/><circle cx="0" cy="-9" r="1.4" fill="#FF5A5A"/></g>`
      + `<g class="as99"><g transform="scale(1.4)"><rect x="-4" y="-2" width="8" height="10" rx="3" fill="#fff"/><rect x="-6" y="-1" width="3" height="7" rx="1" fill="#c9d1d9"/><circle cx="0" cy="-6" r="5" fill="#fff"/><path d="M-3 -7 h6 a3 3 0 0 1 -6 0z" fill="#FFB02E"/><path d="M4 0 l6 -5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M-2 8 l-1 5 M2 8 l1 5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g></g>`
      + `<g class="tl99"><path d="M0 0 V60" stroke="#FFE27A" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M0 0 V40" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`
      + `<g class="kd99"><g class="pc99"><path d="M-18 -40 q18 -22 36 0z" fill="#FF7AB6"/><path d="M-18 -40 q6 -4 12 0 q6 -4 12 0 q6 -4 12 0" fill="#fff" opacity=".5"/><path d="M-18 -40 L0 -18 M18 -40 L0 -18 M0 -42 V-18" stroke="#ddd" stroke-width=".6"/></g><g class="ks99"><g transform="scale(1.4)">${kid(0, 0, '#FF7AB6', '#D4A63B')}<path d="M-4 -16 l-6 -8 M4 -16 l6 -8" stroke="#F3CDA6" stroke-width="2" stroke-linecap="round"/></g></g></g>`
      + `<g class="hf99"><circle cx="0" cy="0" r="10" fill="#FFE27A" opacity=".8"/>${Array.from({ length: 10 }, (_, i) => `<path d="M0 0 L${(Math.cos(i * .63) * 18).toFixed(1)} ${(Math.sin(i * .63) * 18).toFixed(1)}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`).join('')}</g>`
      + `<g class="tx99"></g><g class="ju99"></g><g class="al99"><text x="960" y="110" font-size="9" font-weight="900" fill="#9fd8ff" font-family="ui-monospace,monospace">HÖHE: 100 km</text></g>` });
  hide(99, ['.tr99', '.sp99', '.ea99', '.st99', '.sa99', '.as99', '.tl99', '.kd99', '.hf99', '.tx99', '.ju99', '.al99']);
  mv(99, '.tr99', 22, [[0, 'none', 0], [2, 'none', 1], [26, 'none', 1], [27, 'none', 0], [80, 'none', 0], [82, 'none', 1], [96, 'none', 1], [100, 'none', 0]]);
  mv(99, '.kd99', 22, [[0, 'translate(520px,106px)', 0], [2, 'translate(520px,106px)', 1], [4, 'translate(520px,84px)', 1], [6, 'translate(520px,108px)', 1], [10, 'translate(520px,60px)', 1], [13, 'translate(520px,112px)', 1], [17, 'translate(520px,30px)', 1], [21, 'translate(520px,116px)', 1], [27, 'translate(560px,-60px)', 1], [28, 'translate(600px,140px)', 1], [36, 'translate(640px,70px)', 1], [56, 'translate(660px,64px)', 1], [62, 'translate(640px,-60px)', 1], [64, 'translate(560px,-40px)', 1], [72, 'translate(540px,40px)', 1], [86, 'translate(520px,106px)', 1], [96, 'translate(520px,106px)', 1], [100, 'translate(520px,106px)', 0]], 'ease-in-out');
  mv(99, '.ks99', 22, [[0, 'rotate(0)', 1], [17, 'rotate(0)', 1], [21, 'rotate(360deg)', 1], [36, 'rotate(360deg)', 1], [44, 'rotate(330deg)', 1], [52, 'rotate(390deg)', 1], [60, 'rotate(360deg)', 1], [100, 'rotate(360deg)', 1]]); css += '.ks99{transform-box:fill-box;transform-origin:50% 50%}';
  mv(99, '.pc99', 22, [[0, 'scale(0)', 0], [64, 'scale(0)', 0], [67, 'scale(1.2)', 1], [69, 'scale(1)', 1], [86, 'scale(1)', 1], [89, 'scale(0)', 0], [100, 'scale(0)', 0]]); fbb('.pc99');
  mv(99, '.tl99', 22, [[0, 'translate(560px,60px) scaleY(0)', 0], [22, 'translate(540px,60px) scaleY(0)', 0], [24, 'translate(540px,40px) scaleY(1)', 1], [27, 'translate(560px,-40px) scaleY(1)', 0], [100, 'translate(560px,-40px)', 0]]);
  mv(99, '.sp99', 22, [[0, 'none', 0], [22, 'none', 0], [28, 'none', 1], [60, 'none', 1], [68, 'none', 0], [100, 'none', 0]]);
  mv(99, '.ea99', 22, [[0, 'translateY(120px)', 0], [24, 'translateY(120px)', 0], [30, 'translateY(0)', 1], [60, 'translateY(0)', 1], [66, 'translateY(120px)', 0], [100, 'translateY(120px)', 0]]);
  K('k99s', '0%,26%{opacity:0}32%,58%{opacity:1}64%,100%{opacity:0}'); css += '.go-99 .st99{animation:k99s 22s linear forwards}';
  mv(99, '.sa99', 22, [[0, 'translate(1260px,24px)', 0], [30, 'translate(1150px,22px) rotate(-10deg)', 1], [58, 'translate(250px,30px) rotate(20deg)', 1], [62, 'translate(180px,30px)', 0], [100, 'translate(180px,30px)', 0]], 'linear');
  mv(99, '.as99', 22, [[0, 'translate(880px,10px)', 0], [28, 'translate(880px,10px)', 0], [32, 'translate(860px,20px)', 1], [42, 'translate(700px,52px) rotate(-10deg)', 1], [50, 'translate(694px,56px) rotate(5deg)', 1], [58, 'translate(820px,14px) rotate(20deg)', 1], [62, 'translate(840px,10px)', 0], [100, 'translate(840px,10px)', 0]], 'ease-in-out');
  mv(99, '.hf99', 22, [[0, 'translate(680px,52px) scale(0)', 0], [44, 'translate(680px,52px) scale(0)', 0], [46, 'translate(680px,52px) scale(1.4)', 1], [50, 'translate(680px,52px) scale(.2)', 0], [100, 'translate(680px,52px) scale(0)', 0]]);
  mv(99, '.tx99', 22, [[0, 'scale(.4)', 0], [45, 'scale(.4)', 0], [47, 'scale(1.2)', 1], [56, 'scale(1)', 1], [58, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.tx99');
  mv(99, '.al99', 22, [[0, 'none', 0], [30, 'none', 0], [32, 'none', 1], [58, 'none', 1], [60, 'none', 0], [100, 'none', 0]]);
  mv(99, '.ju99', 22, [[0, 'scale(.4)', 0], [86, 'scale(.4)', 0], [88, 'scale(1.2)', 1], [98, 'scale(1)', 1], [100, 'scale(1)', 0]]); fb('.ju99');

  // ================================================================ 10 NERDY ONES (101–110)

  // 101 NERDY – first school day: the sky turns into a giant green chalkboard, chalk writes "1 + 1 = 2", "ABC" and "E = mc²" by itself (with chalk dust), the school bell rings, three kids put on their school bags – which turn out to be jetpacks – and fly off to school with flame trails; the board is wiped clean with a big sponge
  add({ n: 101, big: true, t: 'Schulthek-Jetpack', scene: 'Schulstart', where: 'den Himmel', dur: 20,
    g: `<g class="cb101"><rect x="430" y="4" width="600" height="62" rx="3" fill="#2f5d45" stroke="#8a5a2b" stroke-width="5"/><rect x="430" y="64" width="600" height="4" fill="#a87a4a"/></g>`
      + [['1 + 1 = 2', 460, 30], ['A B C', 660, 30], ['E = mc²', 850, 30], ['a² + b² = c²', 540, 54], ['π ≈ 3.14', 800, 54]].map(([s, x, y], i) => `<text class="ch101 c${i}" x="${x}" y="${y}" font-size="15" font-weight="700" fill="#f4f4ec" font-family="'Comic Sans MS','Chalkboard SE',cursive">${s}</text>`).join('')
      + `<g class="sg101"><rect x="0" y="-8" width="40" height="16" rx="3" fill="#FFD24A"/><rect x="0" y="-8" width="40" height="5" fill="#3E8EDE"/></g><g class="bl101"></g>`
      + [[480, '#FF7AB6', '#D4A63B', '#E5483B'], [560, '#3E8EDE', '#6b4a2e', '#3FA66B'], [760, '#3FA66B', '#2b2b2b', '#B07CFF']].map(([x, c, h, b], i) => `<g class="kd101 k${i}">${kid(x, 108, c, h)}<rect x="${x - 9}" y="86" width="6" height="10" rx="1.5" fill="${b}"/><path class="fl101" d="M${x - 8} 96 l2 9 l2 -9z" fill="#FF8A1A"/><path class="fl101" d="M${x - 7} 96 l1 5 l1 -5z" fill="#FFE27A"/></g>`).join('') });
  hide(101, ['.cb101', '.ch101', '.sg101', '.bl101', '.kd101']); css += '.tp-101 .fl101{opacity:0}';
  mv(101, '.cb101', 20, [[0, 'scaleY(0)', 0], [2, 'scaleY(.05)', 1], [8, 'scaleY(1)', 1], [86, 'scaleY(1)', 1], [92, 'scaleY(0)', 0], [100, 'scaleY(0)', 0]]); css += '.cb101{transform-box:fill-box;transform-origin:50% 0}';
  [0, 1, 2, 3, 4].forEach((i) => { K(`k101c${i}`, `0%,${10 + i * 6}%{clip-path:inset(0 100% 0 0);opacity:1}${15 + i * 6}%,66%{clip-path:inset(0 0 0 0);opacity:1}76%,100%{clip-path:inset(0 0 0 0);opacity:0}`); css += `.go-101 .c${i}{animation:k101c${i} 20s steps(10) forwards}`; });
  mv(101, '.sg101', 20, [[0, 'translate(440px,30px)', 0], [64, 'translate(440px,30px)', 0], [66, 'translate(450px,20px)', 1], [70, 'translate(980px,30px)', 1], [74, 'translate(450px,50px)', 1], [78, 'translate(980px,50px)', 1], [80, 'translate(980px,40px)', 0], [100, 'translate(980px,40px)', 0]], 'ease-in-out');
  mv(101, '.bl101', 20, [[0, 'none', 0], [40, 'none', 0], [42, 'translateX(-3px)', 1], [44, 'translateX(3px)', 1], [46, 'translateX(-3px)', 1], [48, 'translateX(3px)', 1], [54, 'none', 1], [56, 'none', 0], [100, 'none', 0]]);
  [0, 1, 2].forEach((i) => mv(101, `.k${i}`, 20, [[0, 'scale(1.4)', 0], [4, 'scale(1.4)', 1], [50 + i * 3, 'scale(1.4)', 1], [56 + i * 3, 'translate(10px,-24px) scale(1.4) rotate(8deg)', 1], [66 + i * 3, `translate(${200 - i * 40}px,-50px) scale(1.4) rotate(14deg)`, 1], [78 + i * 2, `translate(${640 - i * 120}px,-80px) scale(1.4) rotate(20deg)`, 1], [82 + i * 2, `translate(${760 - i * 120}px,-130px) scale(1.4)`, 0], [100, 'none', 0]], 'ease-in-out')); fbb('.kd101');
  K('k101f', '0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.6)}'); css += '.go-101 .fl101{animation:k101f .15s linear infinite,k101fo 20s steps(1) forwards;transform-box:fill-box;transform-origin:50% 0}'; K('k101fo', '0%,49%{opacity:0}50%,100%{opacity:1}');

  // 103 NERDY – Dino-Tag: a flock of six big pteranodons glides in from the left in a loose V, flapping slowly, their shadows sweeping over the meadow; one swoops down over the water and snaps a jumping fish ("Schnapp!"). Meanwhile a velociraptor pokes its head out of the ferns on the right, looks around in jerky bird-like moves, blinks, sniffs, tilts its head at you ("?") – then the pteranodons screech and it darts off to the left across the meadow
  const ptero = (c) => `<g class="pf103"><path d="M0 0 C -8 -12 -24 -14 -38 -6 C -26 -3 -12 1 0 4Z" fill="${c}"/><path d="M0 0 C 8 -12 24 -14 38 -6 C 26 -3 12 1 0 4Z" fill="${c}" opacity=".85"/></g><path d="M-8 1 C -2 -2 8 -2 12 0 L 24 1.5 L 12 3 C 6 4 -2 4 -8 1Z" fill="${c}"/><path d="M9 -1 L -3 -9 L 6 -2Z" fill="${c}"/><circle cx="10" cy="0" r=".9" fill="#1d1d1d"/>`;
  const FL = [[0, 0], [-34, -10], [-34, 12], [-68, -20], [-68, 22], [-102, 2]];
  add({ n: 103, big: true, t: 'Flugsaurier & Raptor', scene: 'Dino-Tag', where: 'den Himmel', dur: 20,
    g: `<g class="sh103">${FL.map(([dx]) => `<ellipse cx="${dx}" cy="108" rx="14" ry="2" fill="#000" opacity=".18"/>`).join('')}</g>`
      + `<g class="fk103">${FL.map(([dx, dy], i) => i === 0 ? '' : `<g transform="translate(${dx} ${dy})"><g class="bob103" style="animation-delay:-${(i * .3).toFixed(1)}s">${ptero(['#8a6a52', '#7a5f4a', '#9a7558', '#806048', '#8f6c50', '#7c5a44'][i])}</g></g>`).join('')}</g>`
      + `<g class="lp103"><g class="bob103">${ptero('#a0765a')}</g></g>`
      + `<g class="fi103"><path d="M-5 0 q5 -4 10 0 q-5 4 -10 0z M5 0 l4 -3 v6z" fill="#5fc4e8"/></g><g class="sn103"></g>`
      + `<g class="rp103"><g class="rr103">`
      + `<path d="M24 -20 C 40 -24 56 -28 72 -32 C 58 -24 44 -18 26 -14Z" fill="#7b8f4a"/>`
      + `<g class="lg103 la"><path d="M14 -14 L 18 -6 L 12 0 L 18 0" stroke="#5f7238" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><g class="lg103 lb"><path d="M8 -14 L 10 -6 L 4 0 L 10 0" stroke="#6b7f3e" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`
      + `<ellipse cx="12" cy="-18" rx="16" ry="8" fill="#8aa05a" transform="rotate(-12 12 -18)"/><path d="M2 -22 q8 -3 16 0 M4 -18 q8 -3 16 0" stroke="#6b7f3e" stroke-width="1.2" fill="none"/><path d="M0 -16 l-6 2 l2 2 M2 -14 l-5 3" stroke="#6b7f3e" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      + `<path d="M2 -22 C -2 -28 -6 -34 -8 -38 L -2 -40 C 0 -34 4 -28 8 -24Z" fill="#8aa05a"/>`
      + `<g class="hd103"><path d="M-2 -38 C -2 -44 -8 -46 -14 -44 L -26 -40 C -28 -38 -27 -36 -25 -36 L -12 -34 C -6 -33 -2 -34 -2 -38Z" fill="#9ab468"/><path d="M-25 -36.5 L -12 -35" stroke="#5f7238" stroke-width=".7"/>${[-23, -20, -17, -14].map((x) => `<path d="M${x} -36.2 l.8 1.4 l.8 -1.4z" fill="#fff"/>`).join('')}<g class="ey103"><circle cx="-10" cy="-41" r="1.8" fill="#FFD24A"/><ellipse cx="-10" cy="-41" rx=".5" ry="1.5" fill="#1d1d1d"/></g><circle cx="-24" cy="-39.6" r=".5" fill="#2e3a1c"/><path d="M-12 -44 l3 -2 l2 1.4" stroke="#5f7238" stroke-width=".8" fill="none"/></g>`
      + `</g></g>`
      + `<g class="fn103">${[[-30, 'M0 0 C -6 -14 -20 -24 -34 -26 C -22 -20 -12 -10 -6 0Z'], [-14, 'M0 0 C -2 -18 -10 -30 -20 -36 C -12 -24 -8 -12 -6 0Z'], [0, 'M0 0 C 0 -18 4 -30 10 -38 C 6 -26 4 -12 4 0Z'], [12, 'M0 0 C 4 -16 14 -26 28 -30 C 16 -22 8 -12 6 0Z'], [24, 'M0 0 C 6 -10 18 -18 34 -18 C 20 -12 10 -6 6 0Z'], [-22, 'M0 0 C -10 -8 -24 -10 -36 -8 C -24 -4 -12 0 -4 2Z']].map(([dx, d], i) => `<path transform="translate(${830 + dx} 110)" d="${d}" fill="${['#3f8a2e', '#4c9a38', '#357a26'][i % 3]}"/>`).join('')}</g>`
      + `<g class="qm103"></g><g class="kr103"></g>` });
  hide(103, ['.sh103', '.fk103', '.lp103', '.fi103', '.sn103', '.rp103', '.fn103', '.qm103', '.kr103']);
  K('k103f', '0%,100%{transform:scaleY(1)}50%{transform:scaleY(-.55)}'); css += '.go-103 .pf103{animation:k103f .9s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}';
  K('k103b', '0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}'); css += '.go-103 .bob103{animation:k103b .9s ease-in-out infinite}';
  mv(103, '.fk103', 20, [[0, 'translate(-140px,34px)', 1], [8, 'translate(-140px,34px)', 1], [36, 'translate(520px,22px)', 1], [64, 'translate(1340px,14px)', 1], [100, 'translate(1340px,14px)', 1]], 'linear');
  mv(103, '.sh103', 20, [[0, 'translateX(-120px)', 0], [8, 'translateX(-120px)', 1], [36, 'translateX(540px)', 1], [62, 'translateX(1320px)', 1], [64, 'translateX(1340px)', 0], [100, 'translateX(1340px)', 0]], 'linear');
  mv(103, '.lp103', 20, [[0, 'translate(-140px,34px)', 1], [8, 'translate(-140px,34px)', 1], [24, 'translate(330px,28px)', 1], [32, 'translate(560px,86px) rotate(14deg)', 1], [35, 'translate(640px,88px) rotate(-6deg)', 1], [42, 'translate(800px,40px) rotate(-18deg)', 1], [60, 'translate(1340px,14px)', 1], [100, 'translate(1340px,14px)', 1]], 'ease-in-out');
  mv(103, '.fi103', 20, [[0, 'translate(630px,96px)', 0], [30, 'translate(630px,96px)', 0], [31, 'translate(630px,96px) rotate(-40deg)', 1], [34, 'translate(636px,84px)', 1], [35, 'translate(660px,90px)', 1], [42, 'translate(822px,42px) rotate(-18deg)', 1], [44, 'translate(860px,36px)', 0], [100, 'translate(860px,36px)', 0]], 'ease-in-out');
  mv(103, '.sn103', 20, [[0, 'translate(640px,70px) scale(.4)', 0], [35, 'translate(640px,70px) scale(.4)', 0], [37, 'translate(640px,70px) scale(1.2)', 1], [44, 'translate(640px,70px) scale(1)', 1], [46, 'translate(640px,70px)', 0], [100, 'translate(640px,70px)', 0]]);
  // the raptor stands behind the fern bush and rises, looks around, then runs off left
  mv(103, '.fn103', 20, [[0, 'none', 0], [3, 'none', 1], [94, 'none', 1], [100, 'none', 0]]);
  mv(103, '.rp103', 20, [[0, 'translate(840px,140px)', 1], [12, 'translate(840px,140px)', 1], [20, 'translate(840px,110px)', 1], [70, 'translate(840px,110px)', 1], [72, 'translate(840px,110px) scaleX(1)', 1], [86, 'translate(-160px,110px)', 1], [100, 'translate(-160px,110px)', 1]], 'ease-in');
  K('k103h', '0%,20%{transform:rotate(0)}24%,30%{transform:rotate(-12deg)}31%,38%{transform:rotate(10deg)}39%,44%{transform:rotate(0)}46%{transform:rotate(4deg) translateX(-1px)}48%{transform:rotate(-2deg)}50%{transform:rotate(4deg)}52%,58%{transform:rotate(18deg)}60%,100%{transform:rotate(0)}'); css += '.go-103 .hd103{animation:k103h 20s steps(1) forwards;transform-box:fill-box;transform-origin:90% 80%}';
  K('k103e', '0%,33%,35%,55%,57%,100%{transform:scaleY(1)}34%,56%{transform:scaleY(.1)}'); css += '.go-103 .ey103{animation:k103e 20s linear forwards;transform-box:fill-box;transform-origin:center}';
  K('k103l', '0%,100%{transform:rotate(-28deg)}50%{transform:rotate(28deg)}'); css += '.go-103 .lg103{animation:k103l .22s linear 14.4s infinite;transform-box:fill-box;transform-origin:30% 0}.go-103 .lb{animation-delay:14.51s}';
  K('k103r', '0%,71%{transform:rotate(0)}73%,86%{transform:rotate(-14deg)}100%{transform:rotate(-14deg)}'); css += '.go-103 .rr103{animation:k103r 20s ease-out forwards;transform-box:fill-box;transform-origin:30% 100%}';
  K('k103s', '0%,70%,76%,100%{transform:none}71%{transform:rotate(4deg)}72%{transform:rotate(-5deg)}73%{transform:rotate(3deg)}74%{transform:rotate(-2deg)}'); css += '.go-103 .fn103 path{animation:k103s 20s linear forwards;transform-box:fill-box;transform-origin:50% 100%}';
  mv(103, '.qm103', 20, [[0, 'scale(.4)', 0], [52, 'scale(.4)', 0], [54, 'scale(1.3)', 1], [62, 'scale(1)', 1], [64, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.qm103');
  mv(103, '.kr103', 20, [[0, 'scale(.4)', 0], [66, 'scale(.4)', 0], [68, 'scale(1.3)', 1], [74, 'scale(1)', 1], [76, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.kr103');

  // 105 NERDY – snake: a pixel snake slithers out of the grass in sharp 90° turns, eats the apples one by one (each "+1" makes it longer), its trail glows, it races round the tree in a square spiral – and finally bites its own tail: "GAME OVER – NOCHMAL?" and dissolves into pixels
  add({ n: 105, big: true, t: 'Snake', scene: 'Sommer/Herbst mit Apfelbaum', where: 'den Apfelbaum', dur: 18,
    g: (() => { const pts = [[300, 100], [420, 100], [420, 60], [540, 60], [540, 20], [740, 20], [740, 80], [860, 80], [860, 40], [960, 40], [960, 100], [700, 100], [700, 50], [800, 50]];
      const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
      const apples = [[420, 80], [540, 40], [740, 50], [860, 60], [960, 70]];
      return `<path class="tr105" d="${d}" stroke="#7CFF8A" stroke-width="2" fill="none" opacity=".35" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`
        + `<path class="sn105" d="${d}" stroke="#3FA66B" stroke-width="7" fill="none" stroke-linejoin="miter" stroke-linecap="square" pathLength="100" stroke-dasharray="6 200" stroke-dashoffset="6"/>`
        + `<g class="hd105" style="offset-path:path('${d}');offset-rotate:auto"><rect x="-4" y="-4.4" width="8" height="8.8" fill="#2e8a4e"/><rect x="0" y="-3" width="2" height="2" fill="#fff"/><rect x="0" y="1" width="2" height="2" fill="#fff"/><path d="M4 0 h4 l2 -2 M8 0 l2 2" stroke="#E5483B" stroke-width=".8" fill="none"/></g>`
        + apples.map(([x, y], i) => `<g class="ap105 a${i}"><rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="#E5483B"/><rect x="${x - 1}" y="${y - 7}" width="2" height="3" fill="#6b4a2e"/></g><g class="pl105 q${i}"><text x="${x}" y="${y - 10}" text-anchor="middle" font-size="9" font-weight="900" fill="#FFE27A" stroke="#1d1d1d" stroke-width=".4" font-family="ui-monospace,monospace">+1</text></g>`).join('')
        + `<g class="go105"><rect x="520" y="34" width="240" height="34" fill="#0b0f1e" opacity=".85"/><text x="640" y="56" text-anchor="middle" font-size="13" font-weight="900" fill="#7CFF8A" font-family="ui-monospace,monospace">GAME OVER – NOCHMAL?</text></g>`; })() });
  hide(105, ['.tr105', '.sn105', '.hd105', '.ap105', '.pl105', '.go105']);
  css += '.go-105 .ap105{opacity:1}';
  K('k105h', '0%,4%{offset-distance:0%;opacity:0}5%{opacity:1}80%{offset-distance:100%;opacity:1}86%,100%{offset-distance:100%;opacity:0}'); css += '.go-105 .hd105{animation:k105h 18s steps(160) forwards}';
  K('k105s', '0%,4%{stroke-dasharray:4 200;stroke-dashoffset:4;opacity:1}24%{stroke-dasharray:8 200}44%{stroke-dasharray:12 200}60%{stroke-dasharray:16 200}80%{stroke-dasharray:22 200;stroke-dashoffset:-78;opacity:1}86%,100%{stroke-dasharray:22 200;stroke-dashoffset:-78;opacity:0}'); css += '.go-105 .sn105{animation:k105s 18s steps(160) forwards}';
  K('k105t', '0%,4%{stroke-dashoffset:100;opacity:.35}80%{stroke-dashoffset:0;opacity:.35}88%,100%{opacity:0;stroke-dashoffset:0}'); css += '.go-105 .tr105{animation:k105t 18s steps(160) forwards}';
  [16, 27, 39, 50, 62].forEach((p, i) => { mv(105, `.a${i}`, 18, [[0, 'none', 1], [p, 'none', 1], [p + .5, 'scale(1.6)', 0], [100, 'none', 0]]); mv(105, `.q${i}`, 18, [[0, 'none', 0], [p, 'none', 0], [p + .5, 'none', 1], [p + 5, 'translateY(-10px)', 0], [100, 'none', 0]]); });
  css += '.ap105{transform-box:fill-box;transform-origin:center}';
  mv(105, '.go105', 18, [[0, 'none', 0], [80, 'none', 0], [81, 'none', 1], [83, 'none', 0], [84, 'none', 1], [96, 'none', 1], [100, 'none', 0]]);

  // 106 NERDY – the sun installs an update: a loading ring spins exactly around the sun, a small update window pops up in the middle in front of the house ("Sonne 2.0 wird installiert …"), the bar crawls to 99 % – then the sun starts to glow brighter and brighter, its light swells over the sky until the whole picture is pure white – and when it fades back the sun is wearing sunglasses: "Update erfolgreich ✓"
  add({ n: 106, big: true, t: 'Sonnen-Update', scene: 'Jeder Tag mit Sonne', where: 'die Sonne', dur: 18,
    g: `<defs><radialGradient id="sg106"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fffbe0"/><stop offset=".7" stop-color="#FFE27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient></defs>`
      + `<g class="ld106">${Array.from({ length: 12 }, (_, i) => `<rect x="360.6" y="-6" width="2.8" height="8" rx="1.4" fill="#fff" opacity="${(.15 + i / 12 * .85).toFixed(2)}" transform="rotate(${i * 30} 362 28)"/>`).join('')}</g>`
      + `<g class="wn106"><rect x="566" y="44" width="148" height="38" rx="5" fill="#f4f6fb" stroke="#9aa6b6" stroke-width=".8"/><rect x="566" y="44" width="148" height="9" rx="5" fill="#3E8EDE"/><rect x="566" y="49" width="148" height="4" fill="#3E8EDE"/><text x="571" y="51" font-size="5.5" font-weight="900" fill="#fff" font-family="system-ui,sans-serif">System-Update</text><text x="571" y="63" font-size="7" font-weight="900" fill="#1d2430" font-family="system-ui,sans-serif">Sonne 2.0 wird installiert …</text><rect x="571" y="69" width="114" height="6" rx="2" fill="#dfe6ee"/><rect class="pb106" x="571" y="69" width="114" height="6" rx="2" fill="#3FA66B"/><text class="pc106" x="689" y="74.5" font-size="6" font-weight="900" fill="#1d2430" font-family="ui-monospace,monospace">99 %</text></g>`
      + `<circle class="gw106" cx="362" cy="28" r="30" fill="url(#sg106)"/><rect class="wt106" x="-300" y="-20" width="1800" height="160" fill="#fffef6"/>`
      + `<g class="gl106"><path d="M347 25 h30" stroke="#1d1d1d" stroke-width="1.6"/><path d="M348 24 h12 v4 q0 5 -6 5 q-6 0 -6 -5z" fill="#1d1d1d"/><path d="M364 24 h12 v4 q0 5 -6 5 q-6 0 -6 -5z" fill="#1d1d1d"/><path d="M350 26 l3 -1" stroke="#fff" stroke-width=".8" opacity=".7"/><path d="M366 26 l3 -1" stroke="#fff" stroke-width=".8" opacity=".7"/><path d="M356 37 q6 4 12 0" stroke="#b5523b" stroke-width="1.2" fill="none" stroke-linecap="round"/></g>`
      + `<g class="ok106"><rect x="566" y="48" width="148" height="22" rx="5" fill="#fff" stroke="#3FA66B" stroke-width="1"/><text x="640" y="62.5" text-anchor="middle" font-size="9" font-weight="900" fill="#3FA66B" font-family="system-ui,sans-serif">Update erfolgreich ✓</text></g>` });
  hide(106, ['.ld106', '.wn106', '.gw106', '.wt106', '.gl106', '.ok106']);
  mv(106, '.ld106', 18, [[0, 'rotate(0)', 0], [4, 'rotate(0)', 1], [44, 'rotate(1200deg)', 1], [46, 'rotate(1260deg)', 0], [100, 'rotate(1260deg)', 0]], 'linear'); fb('.ld106');
  mv(106, '.wn106', 18, [[0, 'scale(.3)', 0], [8, 'scale(.3)', 0], [11, 'scale(1)', 1], [50, 'scale(1)', 1], [56, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.wn106');
  K('k106p', '0%,12%{transform:scaleX(0)}26%{transform:scaleX(.6)}34%,100%{transform:scaleX(.99)}'); css += '.go-106 .pb106{animation:k106p 18s ease-out forwards;transform-box:fill-box;transform-origin:0 50%}';
  K('k106c', '0%,33%{opacity:0}34%,100%{opacity:1}'); A(106, '.pc106', 'k106c', 18, 'linear');
  K('k106b', '0%,12%{opacity:1}16%{opacity:.4}20%,100%{opacity:1}'); css += '.go-106 .pc106{animation:k106c 18s linear forwards,k106b 1s linear 6.2s infinite}';
  mv(106, '.gw106', 18, [[0, 'scale(1)', 0], [40, 'scale(1)', 0], [44, 'scale(1.6)', 1], [52, 'scale(5)', 1], [60, 'scale(16)', 1], [66, 'scale(40)', 1], [74, 'scale(40)', 1], [82, 'scale(1)', 0], [100, 'scale(1)', 0]], 'ease-in'); fb('.gw106');
  mv(106, '.wt106', 18, [[0, 'none', 0], [48, 'none', 0], [58, 'none', .45], [64, 'none', 1], [72, 'none', 1], [82, 'none', 0], [100, 'none', 0]], 'ease-in-out');
  mv(106, '.gl106', 18, [[0, 'translateY(-40px)', 0], [74, 'translateY(-40px)', 0], [80, 'translateY(0)', 1], [97, 'translateY(0)', 1], [100, 'translateY(0)', 0]], 'ease-out');
  mv(106, '.ok106', 18, [[0, 'scale(.3)', 0], [78, 'scale(.3)', 0], [81, 'scale(1.1)', 1], [84, 'scale(1)', 1], [94, 'scale(1)', 1], [97, 'scale(1)', 0], [100, 'scale(1)', 0]]); fb('.ok106');

  // 107 NERDY – synthwave mode: the scene switches into a retro 80s computer world – the sky turns purple-black, a huge striped neon sun rises behind the house, a glowing grid floor rushes towards you, the house turns into a neon outline, palm silhouettes slide in, "FAMILY PLANER 1986" appears in chrome letters – then the VHS tape rewinds and the normal day returns
  add({ n: 107, big: true, t: 'Synthwave 1986', scene: 'Jeder Tag', where: 'den Himmel', dur: 18,
    g: `<defs><linearGradient id="sk107" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0221"/><stop offset=".7" stop-color="#3a0a5e"/><stop offset="1" stop-color="#ff2a8a"/></linearGradient><linearGradient id="su107" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe94d"/><stop offset="1" stop-color="#ff2a8a"/></linearGradient><linearGradient id="ch107" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#7ad7ff"/><stop offset=".52" stop-color="#2a1a5e"/><stop offset="1" stop-color="#ff9ae0"/></linearGradient><clipPath id="sc107"><rect x="0" y="0" width="1200" height="78"/></clipPath></defs>`
      + `<g class="sw107"><rect x="-200" y="0" width="1600" height="120" fill="url(#sk107)"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 41) % 1200}" cy="${(i * 13) % 50}" r=".8" fill="#fff"/>`).join('')}`
      + `<g clip-path="url(#sc107)"><g class="su107"><circle cx="640" cy="70" r="46" fill="url(#su107)"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="590" y="${62 + i * 6}" width="100" height="${1 + i * .6}" fill="#3a0a5e"/>`).join('')}</g></g>`
      + `<rect x="-200" y="78" width="1600" height="42" fill="#0d0221"/><g class="gr107">${Array.from({ length: 31 }, (_, i) => `<path d="M640 78 L${(640 + (i - 15) * 90).toFixed(0)} 120" stroke="#ff2a8a" stroke-width=".8"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<path class="hl107" style="animation-delay:-${(i * .25).toFixed(2)}s" d="M-200 0 H1400" stroke="#ff2a8a" stroke-width=".8"/>`).join('')}</g>`
      + `<path d="M598 98 V55 H682 V98 M586 61 L640 31 L694 61 M562 98 V66 H598 M600 98 H690" stroke="#5CE1E6" stroke-width="1.6" fill="none" filter="drop-shadow(0 0 3px #5CE1E6)"/><rect x="610" y="59" width="21" height="12" fill="none" stroke="#ff9ae0" stroke-width="1"/><rect x="649" y="59" width="21" height="12" fill="none" stroke="#ff9ae0" stroke-width="1"/>`
      + [[180, 1], [300, .8], [960, 1], [1080, .8]].map(([x, k]) => `<g fill="#0d0221"><path d="M${x} 80 q${4 * k} ${-24 * k} ${-2 * k} ${-46 * k}" stroke="#0d0221" stroke-width="${4 * k}" fill="none"/>${[[-24, 8], [24, 6], [-14, -10], [14, -12]].map(([a, b]) => `<path d="M${x - 2 * k} ${80 - 46 * k} q${a * k * .5} ${(b - 10) * k * .5} ${a * k} ${b * k}" stroke="#0d0221" stroke-width="${5 * k}" fill="none" stroke-linecap="round"/>`).join('')}</g>`).join('')
      + `<text x="640" y="22" text-anchor="middle" font-size="18" font-weight="900" font-style="italic" fill="url(#ch107)" stroke="#ff2a8a" stroke-width=".6" font-family="system-ui,sans-serif" letter-spacing="2">FAMILY PLANER 1986</text></g>`
      + `<g class="vh107"><rect x="-200" y="0" width="1600" height="120" fill="#000" opacity=".3"/>${Array.from({ length: 6 }, (_, i) => `<rect class="vl107" style="animation-delay:-${(i * .1).toFixed(1)}s" x="-200" y="0" width="1600" height="3" fill="#fff" opacity=".4"/>`).join('')}<text x="40" y="20" font-size="12" font-weight="900" fill="#fff" font-family="ui-monospace,monospace">◀◀ REW</text></g><g class="pl107"><text x="40" y="20" font-size="12" font-weight="900" fill="#fff" font-family="ui-monospace,monospace">▶ PLAY</text></g>` });
  hide(107, ['.sw107', '.vh107', '.pl107']);
  mv(107, '.pl107', 18, [[0, 'none', 0], [2, 'none', 1], [10, 'none', 1], [12, 'none', 0], [100, 'none', 0]]);
  mv(107, '.sw107', 18, [[0, 'none', 0], [6, 'none', 0], [12, 'none', 1], [82, 'none', 1], [90, 'none', 0], [100, 'none', 0]]);
  mv(107, '.su107', 18, [[0, 'translateY(60px)', 1], [12, 'translateY(60px)', 1], [34, 'translateY(0)', 1], [100, 'translateY(0)', 1]], 'ease-out');
  K('k107h', '0%{transform:translateY(78px)}100%{transform:translateY(120px)}'); css += '.go-107 .hl107{animation:k107h 2s cubic-bezier(.6,0,1,1) infinite}';
  mv(107, '.vh107', 18, [[0, 'none', 0], [80, 'none', 0], [81, 'none', 1], [94, 'none', 1], [96, 'none', 0], [100, 'none', 0]]);
  K('k107v', '0%{transform:translateY(120px)}100%{transform:translateY(-10px)}'); css += '.go-107 .vl107{animation:k107v .5s linear infinite}';
  K('k107r', '0%,80%,96%,100%{transform:none}82%{transform:translateX(-8px) skewX(4deg)}86%{transform:translateX(6px)}90%{transform:translateX(-4px) skewX(-3deg)}'); css += '.go-107{animation:k107r 18s steps(1) forwards}';

  // 109 NERDY – twin fractal trees: two seeds fall – one between the little tree and the house, one on the right of the house – and two fractal trees grow in real time, every branch splitting into two again and again (recursion depth 8), the fresh tips light up as they grow; then fresh green leaves sprout at all 512 tips, pink blossoms pop open with a sparkle, and finally a breeze blows the petals away across the picture; "f(n) = 2 · f(n−1)"
  add({ n: 109, big: true, t: 'Fraktal-Bäume', scene: 'Frühling', where: 'die Wiese', dur: 20,
    g: (() => { const tree = (X, k, w) => { const B = []; const tips = []; const go = (x, y, a, len, d) => { const x2 = x + Math.cos(a) * len * w; const y2 = y + Math.sin(a) * len; B.push([x, y, x2, y2, d]); if (d >= 8) { tips.push([x2, y2]); return; } go(x2, y2, a - .44 + (d % 3) * .03, len * .74, d + 1); go(x2, y2, a + .4 - (d % 2) * .04, len * .72, d + 1); };
        go(X, 107, -Math.PI / 2, 17, 0);
        return `<g class="fr109">${B.map(([x, y, x2, y2, d]) => `<path class="br109" style="animation-delay:${(1.6 + d * .5).toFixed(2)}s" d="M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${d < 3 ? '#5b3d24' : d < 6 ? '#7a5232' : '#6a8f3a'}" stroke-width="${Math.max(.45, 3.6 - d * .45).toFixed(2)}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}</g>`
          + `<g class="lv109">${tips.filter((_, i) => i % 2 === 0).map(([x, y], i) => `<circle class="lf109" style="animation-delay:${(6.2 + (i % 30) * .03).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${['#7ccf4e', '#5fb83c', '#9ae05e'][i % 3]}"/>`).join('')}</g>`
          + `<g class="bl109">${tips.map(([x, y], i) => `<circle class="bo109" style="--dx:${(80 + (i * 37) % 260) * k}px;--dy:${(i * 13) % 50 - 40}px;animation-delay:${(8 + (i % 40) * .03).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="${['#FF9AC0', '#fff', '#FF7AB6', '#ffd1e3'][i % 4]}"/>`).join('')}</g>`
          + `<circle class="sd109" cx="${X}" cy="107" r="1.8" fill="#8a5a2b"/>`; };
      return tree(526, 1, 1.05) + tree(742, 1, .9)
        + `<g class="sp109">${[[510, 54], [540, 48], [526, 40], [728, 56], [756, 50], [742, 42]].map(([x, y], i) => `<g style="animation-delay:-${(i * .2).toFixed(1)}s" class="tw109">${star(x, y, 2.4, '#fff')}</g>`).join('')}</g>`
        + `<g class="fx109"></g>`; })() });
  hide(109, ['.fr109', '.lv109', '.bl109', '.sd109', '.sp109', '.fx109']);
  mv(109, '.sd109', 20, [[0, 'translateY(-110px)', 1], [7, 'translateY(0)', 1], [9, 'translateY(0)', 0], [100, 'translateY(0)', 0]], 'ease-in');
  K('k109b', '0%{stroke-dashoffset:1;stroke:#d8ff9a}70%{stroke-dashoffset:0;stroke:#d8ff9a}100%{stroke-dashoffset:0}'); css += '.go-109 .fr109{opacity:1}.go-109 .br109{animation:k109b .55s ease-out forwards}';
  K('k109v', '0%{transform:scale(0)}70%{transform:scale(1.3)}100%{transform:scale(1)}'); css += '.go-109 .lv109{opacity:1}.tp-109 .lf109{transform:scale(0)}.go-109 .lf109{animation:k109v .5s ease-out both;transform-box:fill-box;transform-origin:center}';
  K('k109o', '0%{transform:scale(0);opacity:1}6%{transform:scale(1.6)}10%{transform:scale(1)}55%{transform:scale(1) translate(0,0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(320deg);opacity:0}'); css += '.go-109 .bl109{opacity:1}.tp-109 .bo109{opacity:0}.go-109 .bo109{animation:k109o 11s ease-in both;transform-box:fill-box;transform-origin:center}';
  mv(109, '.sp109', 20, [[0, 'none', 0], [40, 'none', 0], [42, 'none', 1], [56, 'none', 1], [60, 'none', 0], [100, 'none', 0]]); css += '.go-109 .tw109{animation:fptw .7s linear infinite}';
  mv(109, '.fx109', 20, [[0, 'none', 0], [8, 'none', 1], [90, 'none', 1], [96, 'none', 0], [100, 'none', 0]]);
  K('k109f', '0%,92%{opacity:1}100%{opacity:0}'); css += '.go-109 .fr109,.go-109 .lv109{animation:k109f 20s linear forwards}';

  // 110 NERDY – orrery: the sky darkens, the sun grows into the centre of a giant clockwork solar system: eight planets with their real colours (Saturn with rings, Jupiter with its red spot) circle on tilted orbits – the inner ones fast, the outer ones slow, exactly as Kepler said – a comet swings through, labels pop up, then everything shrinks back into the sun
  add({ n: 110, big: true, t: 'Sonnensystem', scene: 'Jeder Tag', where: 'den Himmel', dur: 22,
    g: DARK(110, 'dk110', 22, 4, 90, .75)
      + `<g class="ss110"><circle cx="640" cy="54" r="12" fill="#FFD24A"/><circle cx="640" cy="54" r="20" fill="#FFD24A" opacity=".25"/>`
      + [['Merkur', 30, 2, '#b3a89a', .9], ['Venus', 52, 3.2, '#e8c27a', 1.5], ['Erde', 76, 3.4, '#3E8EDE', 2.4], ['Mars', 100, 2.6, '#d9663b', 3.6], ['Jupiter', 150, 7, '#d9a86b', 6], ['Saturn', 200, 6, '#e7cf8f', 9], ['Uranus', 248, 4.4, '#8fe0e8', 13], ['Neptun', 292, 4.2, '#4a6fe0', 17]].map(([nm, r, s, c, T], i) => `<ellipse cx="640" cy="54" rx="${r * 1.3}" ry="${(r * .26).toFixed(1)}" fill="none" stroke="#fff" stroke-width=".4" opacity=".35"/><g class="pl110" style="offset-path:path('M${640 + r * 1.3} 54 A ${r * 1.3} ${(r * .26).toFixed(1)} 0 1 1 ${(640 - r * 1.3)} 54 A ${r * 1.3} ${(r * .26).toFixed(1)} 0 1 1 ${640 + r * 1.3} 54');offset-rotate:0deg;animation-duration:${T}s;animation-delay:-${(i * 1.7).toFixed(1)}s"><circle r="${s}" fill="${c}"/>${nm === 'Saturn' ? `<ellipse rx="${s * 2}" ry="${s * .5}" fill="none" stroke="#c9b27a" stroke-width="1.2"/>` : ''}${nm === 'Jupiter' ? `<ellipse cx="2" cy="2" rx="1.8" ry="1" fill="#b5523b"/><path d="M-7 -2 h14 M-6.4 1 h12.8" stroke="#b58a52" stroke-width=".8"/>` : ''}${nm === 'Erde' ? `<circle cx="5" cy="-3" r=".9" fill="#ddd"/>` : ''}<text class="lb110" x="0" y="${-s - 3}" text-anchor="middle" font-size="6" font-weight="900" fill="#fff" font-family="system-ui,sans-serif">${nm}</text></g>`).join('')
      + `<g class="co110" style="offset-path:path('M1300 -20 Q 640 140 -100 10');offset-rotate:auto"><path d="M0 0 L-40 -3 L-40 3Z" fill="#bff0ff" opacity=".6"/><circle r="2.4" fill="#fff"/></g></g>` });
  hide(110, ['.dk110', '.ss110']);
  mv(110, '.ss110', 22, [[0, 'scale(0)', 0], [4, 'scale(0)', 1], [14, 'scale(1)', 1], [86, 'scale(1)', 1], [94, 'scale(0)', 1], [100, 'scale(0)', 0]], 'ease-in-out'); css += '.ss110{transform-origin:640px 54px;transform-box:view-box}';
  K('k110o', 'from{offset-distance:0%}to{offset-distance:100%}'); css += '.go-110 .pl110{animation-name:k110o;animation-timing-function:linear;animation-iteration-count:infinite}';
  K('k110l', '0%,30%{opacity:0}34%,70%{opacity:1}74%,100%{opacity:0}'); css += '.go-110 .lb110{animation:k110l 22s linear forwards}.tp-110 .lb110{opacity:0}';
  K('k110c', '0%,40%{offset-distance:0%;opacity:0}42%{opacity:1}70%{offset-distance:100%;opacity:1}72%,100%{offset-distance:100%;opacity:0}'); css += '.go-110 .co110{animation:k110c 22s ease-in-out forwards}';



  // English for the few words that explain a story
  const EN = { 'ZIEL': 'FINISH', 'Los!': 'Go!', 'Zeitraffer ▶▶': 'Time-lapse ▶▶', 'BUH!': 'BOO!', '⚠ SCHWERKRAFT: 0 %': '⚠ GRAVITY: 0 %',
    'SCHWERKRAFT: NEUSTART': 'GRAVITY: RESTART', '$ ssh familie@planer': '$ ssh family@planner', 'Verbunden ✓': 'Connected ✓',
    '$ ämtli --status': '$ chores --status', 'Zimmer ✓  Tisch ✓  Hund ✓': 'Room ✓  Table ✓  Dog ✓', '$ ping oma.local': '$ ping grandma.local',
    'kuchen.exe   99 % CPU': 'cake.exe   99 % CPU', '$ make znüni': '$ make snack', '$ git push --kinder': '$ git push --kids',
    'Schlafenszeit: 20:00': 'Bedtime: 20:00', '$ cat wochenplan.txt': '$ cat weekplan.txt', 'Mo Schwimmen · Mi Flöte': 'Mon swimming · Wed flute',
    'Wach auf …': 'Wake up …', 'Folge dem weissen Kaninchen …': 'Follow the white rabbit …', '$ sudo ferien --jetzt': '$ sudo holidays --now',
    'Passwort: ********': 'Password: ********', 'Familie: 365 Tage ♥': 'Family: 365 days ♥',
    'Alle Ämtli erledigt ✓ – zurück in die echte Welt': 'All chores done ✓ – back to the real world', 'HÖHE: 100 km': 'ALTITUDE: 100 km',
    'GAME OVER – NOCHMAL?': 'GAME OVER – AGAIN?', 'Sonne 2.0 wird installiert …': 'Installing Sun 2.0 …', 'Update erfolgreich ✓': 'Update complete ✓',
    'Merkur': 'Mercury', 'Erde': 'Earth', 'Neptun': 'Neptune' };
  const tr = (g, lang) => (lang === 'en' ? g.replace(/>([^<>]+)</g, (m, x) => (EN[x.trim()] ? `>${EN[x.trim()]}<` : m)) : g);

  // ---------------------------------------------------------------- which story plays when
  // tier 1 fun day with its own scene · 2 occasion · 3 strong weather (live) · 4 season and time of day
  // (sunny extras join) · 5 surprise day (about 1 day a week on "rare", 3 on "often")
  const NOHOUSE = ['sommer', 'vatertag', 'mobile', 'volcano', 'uk', 'moon', 'titanic', 'dino'];
  const FUN = { dino: 103, mobile: 40, volcano: 42, moon: 'lm', titanic: 'titanic' };
  const SEASON = {
    fruehling: { day: [58, 62, 109, 56], night: [76, 63] },
    sommer: { day: [75, 78, 83, 77, 98, 99, 92], eve: [57], night: [73, 80, 41, 74] },
    herbst: { day: [54, 77, 105], eve: [87, 57], night: [60, 66, 76] },
    winter: { day: [89], night: [45, 66] },
  };
  // stories for any day of the year, mixed in from the second tap on
  const EVERY = { day: [56, 86, 92, 98, 99, 107], night: [66, 76, 110, 63, 74, 41] };
  const SURPRISE = { day: [61, 70, 86, 88, 93, 94, 97, 106, 107], night: [63, 74, 110, 41] };
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  // the same story all day for one slot; day by day it walks through the pool, so two days in a row never repeat
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const daily = (pool, d, slot) => {
    if (!pool.length) return null; const n = pool.length;
    const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    const step = [3, 5, 7, 1].find((k) => gcd(k, n) === 1);
    return pool[(day * step + hash(`${slot}|${pool.join(',')}`)) % n];
  };
  const surpriseDay = (d, mode) => { if (mode === 'off') return false; const h = hash('surprise|' + iso(d)) % 7; return mode === 'often' ? h < 3 : h === 0; };
  // ctx: { season, wx: { kind, temp }, hour, night, frost, date, surprises: 'off'|'rare'|'often', rained: bool }
  const pick = (ctx) => {
    const s = ctx.season || {}; const fun = s.fun || null; const d = ctx.date || new Date(); const w = ctx.wx || {}; const kind = w.kind || '';
    let vis = fun && fun.scene ? fun.key : (s.vis || 'alltag'); if (vis === 'sommer' && s.beach === false) vis = 'alltag';
    const hour = ctx.hour != null ? ctx.hour : d.getHours();
    const night = ctx.night != null ? !!ctx.night : (hour < 6 || hour >= 20); const eve = !night && hour >= 17; const slot = night ? 'night' : eve ? 'eve' : 'day';
    // 1. a fun day with its own scene shows only its own story
    if (fun && fun.scene) return Object.prototype.hasOwnProperty.call(FUN, fun.key) ? FUN[fun.key] : null;
    if (fun && fun.key === 'sputnik') return night ? 76 : 44;
    // the beach (summer holidays): dolphins and the pirate ship by day
    if (vis === 'sommer') return night ? null : daily([35, 52], d, slot);
    if (NOHOUSE.includes(vis)) return null;
    // 2. occasions and 3. strong weather lead: the first tap of the day (in this part of the day) shows them
    const lead = (() => {
      if ((s.birthdays || []).length && !night) return 39;
      if (vis === 'liebe' && (night || eve)) return 67;
      if (vis === 'fasnacht') return 27;
      if (vis === 'ostern' && !night) return 29;
      if (vis === 'schule' && !night) return 101;
      if (vis === 'august' && (night || eve)) return 38;
      if (s.sub === 'samichlaus' && !night) return 19;
      if (vis === 'weihnachten' && (night || eve)) return 65;
      if (vis === 'silvester' && s.key === 'silvester') return night ? 22 : 93;
      if (!night) {
        if (['rainy', 'pouring', 'lightning'].includes(kind)) return 68;
        if (ctx.rained && ['sunny', 'partlycloudy'].includes(kind)) return 71;
        if (kind === 'windy') return s.jz === 'herbst' ? 7 : 51;
        if (ctx.frost) return 79;
        if (kind === 'snowy' || (s.snow && s.jz === 'winter')) return daily([72, 55], d, slot);
        if (kind === 'sunny' && w.temp != null && w.temp >= 30) return 59;
        if (kind === 'partlycloudy') return 49;
      }
      return null;
    })();
    // 5. surprise day, 4. season and time of day (sunny extras join)
    const surprise = surpriseDay(d, ctx.surprises || 'rare');
    const P = SEASON[s.jz] || SEASON.sommer;
    const pool = (night ? P.night : eve && P.eve ? P.eve : P.day).slice();
    if (night && s.jz === 'sommer' && d.getMonth() === 7) pool.push(48);
    if (!night && kind === 'sunny') { pool.push(50, 106); if (w.temp != null && w.temp >= 20) pool.push(16); }
    const first = lead != null ? lead : surprise ? daily(night ? SURPRISE.night : SURPRISE.day, d, slot) : daily(pool, d, slot);
    const tap = Math.max(0, Math.floor(Number(ctx.tap) || 0));
    if (!tap) return first;
    // every further tap: the next story from everything that fits now (weather, season, every-day stories,
    // surprises on a surprise day) – in a mixed order of the day, none twice before all have played
    const wx = [];
    if (!night) {
      if (['rainy', 'pouring', 'lightning'].includes(kind)) wx.push(68);
      if (ctx.rained && ['sunny', 'partlycloudy'].includes(kind)) wx.push(71);
      if (kind === 'windy') wx.push(s.jz === 'herbst' ? 7 : 51);
      if (ctx.frost) wx.push(79);
      if (kind === 'snowy' || (s.snow && s.jz === 'winter')) wx.push(72, 55);
      if (kind === 'sunny' && w.temp != null && w.temp >= 30) wx.push(59);
      if (kind === 'partlycloudy') wx.push(49);
    }
    const all = [...new Set([...wx, ...pool, ...(night ? EVERY.night : EVERY.day), ...(surprise ? (night ? SURPRISE.night : SURPRISE.day) : [])])].filter((n) => n !== first);
    const key = `${iso(d)}|${slot}`; all.sort((a, b) => hash(`${key}|${a}`) - hash(`${key}|${b}`));
    const order = [first, ...all];
    return order[tap % order.length];
  };

  // stories drawn on parts of today's house: they only play when the chosen house has that part (house builder);
  // shape = today's body (width, floors, gable roof, chimney): the dragon, the slide, the ghosts, the light house,
  // the roof party and the neon outline sit exactly on today's roof and chimney
  const NEEDS = { 59: ['pool', 'shape'], 75: 'pool', 78: 'pool', 83: 'pool', 92: 'pool', 65: ['garage', 'shape'], 54: 'shape', 60: 'shape', 93: 'shape', 107: 'shape' };
  const pickAny = pick;
  const pickFor = (ctx) => {
    const f = window.FPHOUSE ? window.FPHOUSE.features() : { pool: true, garage: true, shape: true };
    const ok = (n) => !NEEDS[n] || [].concat(NEEDS[n]).every((k) => f[k]);
    const n0 = pickAny(ctx); if (n0 == null || ok(n0)) return n0;
    const t0 = Math.max(0, Math.floor(Number(ctx.tap) || 0));
    for (let k = 1; k <= 40; k++) { const n = pickAny({ ...ctx, tap: t0 + k }); if (n == null) return null; if (ok(n)) return n; }
    return null;
  };

  // how often the scene was tapped today in this part of the day (kept on this device), so each tap moves on
  const slotOf = (ctx) => { const d = ctx.date || new Date(); const h = ctx.hour != null ? ctx.hour : d.getHours(); const night = ctx.night != null ? !!ctx.night : (h < 6 || h >= 20); return `${iso(d)}|${night ? 'night' : h >= 17 ? 'eve' : 'day'}`; };
  let tapMem = { k: '', n: 0 };
  const readTaps = () => { try { const v = JSON.parse(localStorage.getItem('fp_taps') || 'null'); if (v && typeof v.k === 'string' && Number.isFinite(v.n)) tapMem = v; } catch (e) { /* storage blocked: memory only */ } return tapMem; };
  const taps = (ctx) => { const v = readTaps(); return v.k === slotOf(ctx) ? v.n : 0; };
  const bump = (ctx) => { const k = slotOf(ctx); const v = readTaps(); tapMem = { k, n: v.k === k ? v.n + 1 : 1 }; try { localStorage.setItem('fp_taps', JSON.stringify(tapMem)); } catch (e) { /* memory only */ } };

  // lay a story over the rendered scene <svg> and play it; returns how long it plays (ms), 0 when nothing starts
  const play = (svg, n, lang) => {
    const o = T.find((x) => x.n === n); if (!svg || !o || svg.getAttribute('data-fpplay')) return 0;
    svg.querySelectorAll(':scope > .ov').forEach((x) => x.remove());
    Array.from(svg.classList).filter((c) => /^tp-\d+$/.test(c)).forEach((c) => svg.classList.remove(c));
    svg.classList.add('tp-' + n);
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); layer.setAttribute('class', 'ov');
    layer.innerHTML = tr(typeof o.g === 'function' ? o.g() : o.g, lang); // built only from the story templates above
    // parts a story needs from the scene (the rainbow): only drawn by the story when the scene does not show them
    if (svg.querySelector('.rbw')) layer.querySelectorAll('.needrb').forEach((x) => x.remove());
    svg.appendChild(layer);
    // stories that move the whole picture ("pull") get the scene wrapped in one plain group while they play
    let wrap = null; const ov = svg.querySelector(':scope > .ov');
    if (o.pull) { wrap = document.createElementNS('http://www.w3.org/2000/svg', 'g'); wrap.setAttribute('class', 'pull');
      Array.from(svg.children).slice(1).forEach((ch) => { if (ch !== ov && ch.tagName !== 'defs' && ch.tagName !== 'style') wrap.appendChild(ch); });
      svg.insertBefore(wrap, ov); }
    const c = 'go-' + n; svg.setAttribute('data-fpplay', String(n)); svg.classList.add(c);
    svg.querySelectorAll('.ov animate').forEach((a) => { try { a.beginElement(); } catch (e) { /* SMIL not supported */ } });
    const ms = o.dur * 1000 + 300;
    setTimeout(() => { if (wrap && wrap.parentNode === svg) { while (wrap.firstChild) svg.insertBefore(wrap.firstChild, wrap); wrap.remove(); }
      svg.classList.remove(c); svg.removeAttribute('data-fpplay'); if (ov.parentNode) ov.remove(); }, ms);
    return ms;
  };

  window.FPTAPS = { list: T, css: () => css, pick: pickFor, play, taps, bump, EN, SEASON, SURPRISE, EVERY };
})();
