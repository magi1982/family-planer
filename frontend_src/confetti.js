// ---------------------------------------------------------------------------
// Confetti for celebrations from the server (snapshot.celebrations):
//   day      – somebody finished every chore of the day (small, in the person's colour, with the name)
//   <award>  – a trophy was won (medium/large in the trophy's colour; "banner" = only a short note)
// Every device shows each celebration once (remembered in localStorage); old ones are skipped silently.
// Respects "reduce motion": then only the banner is shown.
// ---------------------------------------------------------------------------
(() => {
  if (window.FPCONFETTI) return;
  const TXT = {
    de: { day: 'Super, {n}! Alle Ämtli erledigt 🎉', team: 'Familien-Teamwork! Alle haben alles erledigt 🤝', won: '{n}: {a}!',
      a: { trophy: 'Pokal des Monats 🏆', crown: 'Krone der Woche 👑', perfect: 'Perfekte Woche ⭐', bee: 'Fleissbiene 🐝', weekend: 'Wochenend-Held 🦸',
        climber: 'Aufsteiger 📈', early: 'Frühaufsteher 🌅', diamond: 'Diamant-Serie 💎', milestone: 'Meilenstein {v} 🏅', team: 'Familien-Teamwork 🤝' } },
    en: { day: 'Well done, {n}! Every chore done 🎉', team: 'Family teamwork! Everybody did everything 🤝', won: '{n}: {a}!',
      a: { trophy: 'Trophy of the month 🏆', crown: 'Crown of the week 👑', perfect: 'Perfect week ⭐', bee: 'Busy bee 🐝', weekend: 'Weekend hero 🦸',
        climber: 'Climber 📈', early: 'Early bird 🌅', diamond: 'Diamond streak 💎', milestone: 'Milestone {v} 🏅', team: 'Family teamwork 🤝' } },
  };
  const COUNT = { s: 90, m: 190, l: 340 };
  const MAX_AGE_MIN = 20; // older celebrations (e.g. the tablet was asleep for hours) are not replayed
  const queue = []; let busy = false;
  const fmt = (t, o) => t.replace(/\{(\w)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shade = (hex, f) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex || '#F5C542';
    const n = parseInt(m[1], 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)))));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  const RAINBOW = ['#FF5F6D', '#FFA34F', '#FFD84F', '#4FE08A', '#4FA3E0', '#8F6BFF', '#E05FD0'];

  function banner(text, color) {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;left:50%;top:9vh;transform:translate(-50%,-20px);z-index:100000;pointer-events:none;'
      + 'background:rgba(20,20,24,.86);color:#fff;font:600 clamp(18px,3.2vw,30px)/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;'
      + `padding:14px 26px;border-radius:999px;border:2px solid ${color};box-shadow:0 10px 40px rgba(0,0,0,.45),0 0 24px ${color}55;`
      + 'opacity:0;transition:opacity .35s,transform .35s;max-width:90vw;text-align:center;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)';
    el.textContent = text;
    document.body.appendChild(el);
    window.requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)'; });
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translate(-50%,-20px)'; }, 3200);
    setTimeout(() => el.remove(), 3700);
  }

  function rain(size, color, rainbow) {
    return new Promise((resolve) => {
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;pointer-events:none';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cv.width = Math.round(window.innerWidth * dpr); const H = cv.height = Math.round(window.innerHeight * dpr);
      const cols = rainbow ? RAINBOW : [color, shade(color, 0.35), shade(color, -0.25), shade(color, 0.6), '#ffffff'];
      const n = COUNT[size] || COUNT.s; const parts = [];
      for (let i = 0; i < n; i += 1) {
        parts.push({ x: Math.random() * W, y: -Math.random() * H * (size === 'l' ? 0.9 : 0.5) - 10 * dpr, w: (5 + Math.random() * 7) * dpr, h: (8 + Math.random() * 10) * dpr,
          vx: (Math.random() - 0.5) * 2.2 * dpr, vy: (2.2 + Math.random() * 3.2) * dpr, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.24,
          sway: Math.random() * Math.PI * 2, c: cols[i % cols.length], round: Math.random() < 0.25 });
      }
      const t0 = window.performance.now(); const dur = size === 'l' ? 4600 : size === 'm' ? 3800 : 3000;
      const frame = (t) => {
        const el = t - t0; ctx.clearRect(0, 0, W, H);
        const fade = el > dur - 700 ? Math.max(0, (dur - el) / 700) : 1;
        for (const p of parts) {
          p.sway += 0.05; p.x += p.vx + Math.sin(p.sway) * 0.8 * dpr; p.y += p.vy; p.vy += 0.035 * dpr; p.r += p.vr;
          ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
          if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.sway)) + 1);
          ctx.restore();
        }
        if (el < dur) window.requestAnimationFrame(frame); else { cv.remove(); resolve(); }
      };
      window.requestAnimationFrame(frame);
    });
  }

  async function run() {
    if (busy) return; busy = true;
    while (queue.length) {
      const c = queue.shift();
      if (c.fx !== 'banner' && !reduce()) { banner(c.text, c.color); await rain(c.fx, c.color, c.rainbow); }
      else { banner(c.text, c.color); await new Promise((r) => setTimeout(r, 3800)); }
    }
    busy = false;
  }

  const KEY = (store) => `fp_seen_${(store.snap && store.snap.entry_id) || store.entryId || 'x'}`;
  const seenGet = (store) => { try { return new Set(JSON.parse(localStorage.getItem(KEY(store)) || '[]')); } catch (e) { return store._seenMem || (store._seenMem = new Set()); } };
  const seenPut = (store, set) => { const arr = [...set].slice(-120); try { localStorage.setItem(KEY(store), JSON.stringify(arr)); } catch (e) { store._seenMem = new Set(arr); } };

  // called by the bridge after every snapshot
  function check(store) {
    const s = store.snap; if (!s || !Array.isArray(s.celebrations)) return;
    if (s.settings && s.settings.confetti === false) return;
    const seen = seenGet(store); let changed = false;
    const lang = String((s.settings && s.settings.language !== 'auto' && s.settings.language) || document.documentElement.lang || 'de').startsWith('en') ? 'en' : 'de';
    const T = TXT[lang]; const now = Date.now();
    for (const c of s.celebrations) {
      if (!c || !c.id || seen.has(c.id)) continue;
      seen.add(c.id); changed = true;
      const age = (now - Date.parse(c.ts || '')) / 60000;
      if (!(age >= -5 && age <= MAX_AGE_MIN)) continue;
      const person = (s.persons || []).find((p) => p.id === c.pid); const name = person ? person.name : '';
      const text = c.kind === 'day' ? fmt(T.day, { n: name }) : c.kind === 'team' && !c.pid ? T.team
        : fmt(T.won, { n: name, a: fmt(T.a[c.kind] || c.kind, { v: c.value }) });
      if (c.kind === 'team' && c.pid) continue; // the family celebration covers everybody
      queue.push({ fx: c.fx || 's', color: c.color || '#F5C542', text, rainbow: s.theme === 'rainbow' || c.kind === 'team' });
    }
    if (changed) seenPut(store, seen);
    run();
  }

  window.FPCONFETTI = { check, rain, banner };
})();
