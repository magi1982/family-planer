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
    return `<svg class="w" viewBox="0 0 320 320"><defs><radialGradient id="wsh" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient></defs><circle cx="${C}" cy="${C}" r="${Rr + 18}" fill="#24304A"/><circle cx="${C}" cy="${C}" r="${Rr + 18}" fill="none" stroke="#FFD34D" stroke-width="3"/><g class="rot" style="transform-origin:160px 160px">${s}</g><g class="bulbs">${bulbs}</g><circle cx="${C}" cy="${C}" r="31" fill="#fff" stroke="#FFD34D" stroke-width="4"/>${hub ? `<svg x="${C - 30}" y="${C - 34}" width="60" height="60" viewBox="0 0 100 100" overflow="visible">${hub}</svg>` : ''}</svg>`;
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
