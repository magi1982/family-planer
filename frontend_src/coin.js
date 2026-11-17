// Points as a coin ("Kerben-Taler"): flat silver disc, gold core, a stamped letter (or a small star) and one notch
// per family member in the silver ring. No constant shine: every 5–9 s a small star flashes at one spot,
// each coin in its own rhythm. Pure SVG with SMIL animation (works in every shadow root without extra CSS);
// with "reduce motion" the flash is left out.
(() => {
  if (window.FPCOIN) return;
  const cfg = { show: true, letter: '', notches: 5 };
  let uid = 0;
  const LETTER = /^[A-Za-z0-9ÄÖÜ]$/;
  const still = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  // settings come with every snapshot: { settings: { coin: { show, letter } }, persons: [...] }
  const config = (snap) => {
    const c = ((snap || {}).settings || {}).coin || {};
    cfg.show = c.show !== false;
    const l = String(c.letter || '').slice(0, 1).toUpperCase(); cfg.letter = LETTER.test(l) ? l : '';
    const n = ((snap || {}).persons || []).length; cfg.notches = n >= 1 && n <= 12 ? n : 5;
  };
  const star = (cx, cy, R, fill) => `<path d="M${Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? R * 0.4 : R; const t = (i * 36 - 90) * Math.PI / 180; return `${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r).toFixed(1)}`; }).join(' L')}Z" fill="${fill}"/>`;
  const notches = (n) => Array.from({ length: n }, (_, i) => {
    const a = (i * 360) / n - 90; const t = a * Math.PI / 180; const x = 50 + Math.cos(t) * 36; const y = 50 + Math.sin(t) * 36;
    return `<rect x="${(x - 1.2).toFixed(1)}" y="${(y - 4.4).toFixed(1)}" width="2.4" height="8.8" fill="#8f99a6" transform="rotate(${(a + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }).join('');
  const flash = (k) => {
    if (still()) return '';
    const dur = (5 + ((k * 1.7) % 4)).toFixed(1); const del = (-((k * 2.3) % 5)).toFixed(1);
    const s = 9; const d = `M0 ${-s} Q${s * 0.12} ${-s * 0.12} ${s} 0 Q${s * 0.12} ${s * 0.12} 0 ${s} Q${-s * 0.12} ${s * 0.12} ${-s} 0 Q${-s * 0.12} ${-s * 0.12} 0 ${-s}Z`;
    return `<g transform="translate(74 70)"><path d="${d}" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;.92;.95;1" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values=".1;.1;1;.1" keyTimes="0;.92;.95;1" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/></path></g>`;
  };
  // svg(px): inline coin, '' when the coin is switched off
  const svg = (px, cls) => {
    if (!cfg.show) return '';
    const id = `fpc${++uid}`; const k = uid; const sz = Number(px) || 16;
    const mark = cfg.letter
      ? `<text x="50" y="62" text-anchor="middle" font-size="34" font-weight="700" font-family="Georgia,'Times New Roman',serif" fill="#9a6f0a">${cfg.letter}</text>`
      : star(50, 52, 15, '#9a6f0a');
    return `<svg class="fpcoin${cls ? ' ' + cls : ''}" viewBox="${sz <= 24 ? '3 3 94 94' : '0 0 100 100'}" width="${sz}" height="${sz}" aria-hidden="true" focusable="false" style="flex:none;vertical-align:-.18em;overflow:visible">`
      + `<defs><clipPath id="${id}"><path d="M0 0 H100 L0 100Z"/></clipPath></defs>`
      + `<circle cx="50" cy="50" r="44" fill="#C3CBD4"/><circle cx="50" cy="50" r="44" fill="#E6EBF0" clip-path="url(#${id})"/>`
      + `<circle cx="50" cy="50" r="28" fill="#E8B020"/><circle cx="50" cy="50" r="28" fill="#FFD84A" clip-path="url(#${id})"/>`
      + `${mark}${notches(cfg.notches)}${flash(k)}</svg>`;
  };
  // fly(from, to): a coin flies from one element to another (both measured now), the target hops a little
  const fly = (from, to, onEnd) => {
    try {
      if (!cfg.show || !from || !to || still() || !document.body.animate) return;
      const a = from.getBoundingClientRect(); const b = to.getBoundingClientRect(); if (!a.width || !b.width) return;
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;left:${a.left}px;top:${a.top + a.height / 2 - 11}px;width:22px;height:22px;pointer-events:none;z-index:9999`;
      el.innerHTML = svg(22); document.body.appendChild(el);
      const dx = b.left + b.width / 2 - a.left - 11; const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const an = el.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 40}px) scale(1.5)`, offset: 0.5 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 0.9 }],
        { duration: 750, easing: 'cubic-bezier(.4,0,.6,1)' });
      an.onfinish = () => { el.remove(); if (onEnd) onEnd(); };
    } catch (e) { /* no animation */ }
  };
  const hop = (el) => { try { if (el && el.animate && !still()) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 350, easing: 'ease-out' }); } catch (e) { /* ignore */ } };
  window.FPCOIN = { config, svg, fly, hop, cfg };
})();
