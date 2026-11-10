// Family Planer cards – built by frontend_src/build.py, do not edit
(() => {
// Familienplaner – Loxone-Style Karten
//  custom:fp-week-inner   Wochenkalender mit Ämtli (heute abhaken), Verlauf, Zuverlässigkeit, Kalender-Termine
//  custom:lox-aemtli-config-card  Ämtliplan bearbeiten (wie Serientermine: Text, Kind, Wochentage)
// Datenhaltung: todo.amtli_plan (Plan), todo.amtli_heute (heutige Ämtli), todo.amtli_verlauf (Tagesbilanz)
// Beschreibungen: "fp1:" + JSON   Plan {k,t:[1..7]}   Heute {k,d,c}   Verlauf {s:[[kind,erledigt,total]],x:[[kind,text]]}
const G = 'var(--fp-accent)';
const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WDL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const PALETTE = ['#69C350', '#4FA3E0', '#E0A84F', '#C771D6', '#E06B6B', '#4FD1C5'];
const CALCOL = ['#4FA3E0', '#E0A84F', '#C771D6', '#4FD1C5', '#E06B6B'];
const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoWd = (d) => d.getDay() || 7;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// planner day: changes at the configured day-change time (window.FP_DAY_OFFSET_MIN)
const fpDay = () => new Date(Date.now() - (window.FP_DAY_OFFSET_MIN || 0) * 60000);
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDesc = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };
const isoWeek = (d) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); };
// Zuteilung eines Plan-Ämtli: neues Format {z:{Person:[Tage]}}, altes Format {k, t} wird automatisch übernommen
const planZ = (m) => (m && m.z && typeof m.z === 'object') ? m.z : (m && m.k ? { [m.k]: m.t || [] } : {});
// Rhythmus: m.r = {"Person|Wochentag": [alle_n_Wochen, offset]}; aktiv, wenn Wochenindex % n == offset
const weekIdx = (d) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1970, 0, 5)) / 604800000);
const planActive = (m, kid, wd, date) => { const r = (m && m.r && m.r[`${kid}|${wd}`]) || null; if (!r || !(r[0] > 1)) return true; return weekIdx(date) % r[0] === r[1]; };
// Frist: Heute-Item {d: Start, e: Fristende}; Plan m.f = {"Person|Wochentag": Anzahl Tage}
const dueTag = (m, tStr) => { const e = m.e || m.d; if (!e) return ''; if (e > tStr) return `<em class="due">bis ${WD[isoWd(new Date(e + 'T00:00:00')) - 1]}</em>`; if (m.d && m.d < tStr) return '<em class="due last">heute fällig</em>'; return ''; };
// Termin-Zeit mit Dauer: breit "14:30–15:20 · 50 Min", schmal "14:30 · 50′"
const durTxt = (ms, short) => { const m = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(m / 60), r = m % 60;
  if (short) return h ? (r ? `${h}h${pad(r)}` : `${h}h`) : `${m}′`;
  return h ? (r ? `${h} h ${r} Min` : `${h} h`) : `${m} Min`; };
const evTime = (e, wide) => {
  if (e.allDay) { const n = Math.round((e.e - e.s) / 86400000); return `<b>${wide ? 'Ganztägig' : 'Ganzt.'}</b>${n > 1 ? `<span class="du">${n} Tage</span>` : ''}`; }
  const t = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
  return wide ? `<b>${t(e.s)}–${t(e.e)}</b><span class="du">${durTxt(e.e - e.s)}</span>` : `<b>${t(e.s)}</b><span class="du">${durTxt(e.e - e.s, true)}</span>`;
};
const level = (p) => p === null ? { c: '#5a5a5a', t: 'Noch keine Daten' }
  : p >= 90 ? { c: G, t: 'Super zuverlässig' }
  : p >= 75 ? { c: '#A8CF45', t: 'Zuverlässig' }
  : p >= 50 ? { c: '#E0A84F', t: 'Geht noch besser' }
  : { c: '#E06B6B', t: 'Unzuverlässig' };
// Avatare (flache SVG-Portraits): maedchen-lang, maedchen-zoepfe, maedchen-dutt, frau, mann
const SKIN = '#F3CDA6', HAIR = '#EBC55A', HAIR2 = '#D4A63B';
const AV_TYPES = ['maedchen-lang', 'maedchen-zoepfe', 'maedchen-dutt', 'frau', 'mann'];
const avatarSvg = (type, bg) => {
  const kid = type.startsWith('maedchen');
  const back = {
    'maedchen-lang': `<path d="M11 19c0-7 4-11.5 9-11.5s9 4.5 9 11.5v10.5c0 1.5-1.5 2.5-3 2.5H14c-1.5 0-3-1-3-2.5z" fill="${HAIR2}"/>`,
    'maedchen-zoepfe': `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/>`,
    'maedchen-dutt': `<circle cx="20" cy="7.2" r="4.4" fill="${HAIR2}"/>`,
    'frau': `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v14c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${HAIR2}"/>`,
    'mann': ''
  }[type] || '';
  const front = {
    'maedchen-lang': `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${HAIR}"/><rect x="23.4" y="11.4" width="4.2" height="1.7" rx=".85" fill="#FF7AA8" transform="rotate(-25 25.5 12.2)"/>`,
    'maedchen-zoepfe': `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${HAIR}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
    'maedchen-dutt': `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${HAIR}"/><rect x="17.1" y="9.4" width="5.8" height="1.7" rx=".85" fill="#7FC8F8"/>`,
    'frau': `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${HAIR}"/><circle cx="12.5" cy="21.6" r=".8" fill="#fff"/><circle cx="27.5" cy="21.6" r=".8" fill="#fff"/>`,
    'mann': `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${HAIR}"/>`
  }[type] || '';
  const body = kid ? `<path d="M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z" fill="#111" opacity=".28"/>` : `<path d="M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z" fill="#111" opacity=".28"/>`;
  const face = `<rect x="17" y="23" width="6" height="7" fill="${SKIN}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${SKIN}"/>`;
  const eyes = `<circle cx="17.1" cy="18.6" r="1.05" fill="#3b2a1e"/><circle cx="22.9" cy="18.6" r="1.05" fill="#3b2a1e"/><path d="M17.6 22q2.4 1.9 4.8 0" stroke="#b0613a" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  const cheeks = type !== 'mann' ? `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/>` : '';
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/>${back}${body}${face}${front}${eyes}${cheeks}</svg>`;
};
const avatarBase = (k, size) => (k.avatar && AV_TYPES.includes(k.avatar))
  ? `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarSvg(k.avatar, k.farbe)}</span>`
  : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size * 0.42)}px;color:#161616;flex:none">${esc((k.name || '?').charAt(0).toUpperCase())}</span>`;
// Avatar-Baukasten: 'av:<alter>.<frisur>.<haarfarbe>.<haut>.<extras>'  alter k=Kind e=Erwachsen o=Grosseltern; extras mit + verbunden, 0 = keine
const AV_HC = { blond: ['#EBC55A', '#D4A63B'], braun: ['#8B5A2B', '#6E4520'], schwarz: ['#3A3330', '#26211F'], rot: ['#D2662F', '#A9491E'], grau: ['#CDD1D5', '#A9AEB3'] };
const AV_SK = { hell: '#F3CDA6', mittel: '#E3B48A', oliv: '#C99167', dunkel: '#8D5A3B' };
const AV_HB = {
  long: (c) => `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v13c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${c}"/>`,
  zoepfe: (c) => `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/>`,
  dutt: (c) => `<circle cx="20" cy="7.2" r="4.4" fill="${c}"/>`,
  bob: (c) => `<path d="M10.8 19c0-7 4-11.5 9.2-11.5s9.2 4.5 9.2 11.5v6.5c0 1.2-1 2-2.2 2H13c-1.2 0-2.2-.8-2.2-2z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="11.5" cy="15" r="3.6"/><circle cx="28.5" cy="15" r="3.6"/><circle cx="10.8" cy="21" r="3.4"/><circle cx="29.2" cy="21" r="3.4"/><circle cx="12" cy="26.5" r="3"/><circle cx="28" cy="26.5" r="3"/></g>`,
  pferd: (c) => `<path d="M26.5 10.5c4.5.5 6.5 5 6 10.5-.4 4.2-2.6 6.4-4.2 7 1-3.4 1.2-7.6-.2-11z" fill="${c}"/>`
};
const AV_HF = {
  long: (c) => `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${c}"/>`,
  pony: (c) => `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${c}"/>`,
  zoepfe: (c) => `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${c}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
  dutt: (c) => `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${c}"/>`,
  kurz: (c) => `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${c}"/>`,
  seite: (c) => `<path d="M12 18c-.4-6.4 3.4-10.4 8-10.4 4.8 0 8.4 3.6 8 9.6-2.4-2.6-6.6-4.6-12.2-4.2-1.4.8-3 2.8-3.8 5z" fill="${c}"/>`,
  stachel: (c) => `<path d="M11.9 17.6l.3-5.2 1.9 1.3.8-4.4 2.1 2.3 1.5-4.6 1.8 4.1 2.2-3.8 1.2 4.4 2.5-2.5.3 4.8 1.6.6c.4 1.2.3 2.2 0 3-1.3-2.4-3.6-3.9-8.2-3.9s-6.8 1.5-8 3.9z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="14" cy="11.2" r="3.4"/><circle cx="20" cy="9.2" r="3.6"/><circle cx="26" cy="11.2" r="3.4"/><circle cx="12" cy="15.2" r="2.8"/><circle cx="28" cy="15.2" r="2.8"/></g>`,
  glatze: (c) => `<path d="M12.2 20.5c-.9-2.2-.5-4.6.8-5.6.5 1.9.6 3.6-.8 5.6zM27.8 20.5c.9-2.2.5-4.6-.8-5.6-.5 1.9-.6 3.6.8 5.6z" fill="${c}"/>`
};
const AV_ST = { long: ['long', 'long'], ponylang: ['long', 'pony'], zoepfe: ['zoepfe', 'zoepfe'], dutt: ['dutt', 'dutt'], bob: ['bob', 'pony'], locken: ['locken', 'locken'], pferd: ['pferd', 'seite'], kurz: [null, 'kurz'], seite: [null, 'seite'], stachel: [null, 'stachel'], lockenkurz: [null, 'locken'], glatze: [null, 'glatze'] };
const AV_ACC = {
  brille: () => `<g fill="none" stroke="#2b2b2b" stroke-width=".9"><circle cx="17.1" cy="18.6" r="2.4"/><circle cx="22.9" cy="18.6" r="2.4"/><path d="M19.5 18.4h1"/></g>`,
  bart: (h) => `<path d="M12.8 20.6c.4 4.4 3.4 7.2 7.2 7.2s6.8-2.8 7.2-7.2c-1.4 1.6-3.2 2.4-4.6 2-.8-.3-1.6-.5-2.6-.5s-1.8.2-2.6.5c-1.4.4-3.2-.4-4.6-2z" fill="${h}"/><path d="M17.6 22.6q2.4 1.6 4.8 0" stroke="#7a3b22" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
  held: () => `<path d="M12.3 16.6c2.2-1 5-1 7.7.2 2.7-1.2 5.5-1.2 7.7-.2-.2 2.4-1.6 4-3.6 4-1.6 0-2.8-.8-4.1-2-1.3 1.2-2.5 2-4.1 2-2 0-3.4-1.6-3.6-4z" fill="#D63C3C"/><circle cx="16.8" cy="18.2" r="1.25" fill="#fff"/><circle cx="23.2" cy="18.2" r="1.25" fill="#fff"/><circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>`,
  astro: () => `<circle cx="20" cy="18.6" r="11.6" fill="rgba(170,215,255,.22)" stroke="#E8EEF5" stroke-width="2.2"/><path d="M27.5 9.8l2.6-3.4" stroke="#E8EEF5" stroke-width="1.2"/><circle cx="30.4" cy="6.1" r="1.2" fill="#E06B6B"/>`,
  pirat: () => `<path d="M11.4 15.6c.6-5.2 4-8.4 8.6-8.4s8 3.2 8.6 8.4c-2.6-1.4-5.4-2-8.6-2s-6 .6-8.6 2z" fill="#C0392B"/><circle cx="14.5" cy="11.5" r=".8" fill="#fff"/><circle cx="19" cy="9.8" r=".8" fill="#fff"/><circle cx="24" cy="11" r=".8" fill="#fff"/><path d="M12.4 15.8l15.4 4.8" stroke="#1e1e1e" stroke-width=".8"/><ellipse cx="22.9" cy="18.8" rx="2.1" ry="1.9" fill="#1e1e1e"/>`,
  zauber: () => `<path d="M8.5 13.8c4.5-1.4 18.5-1.4 23 0-1.6-.6-3.4-1.6-4.6-1.8L21.2 1.2l-5.6 10.8c-1.4.2-4.2 1-7.1 1.8z" fill="#5B4FC4"/><circle cx="18.2" cy="8.4" r=".8" fill="#F5C542"/><circle cx="22.4" cy="10.6" r=".6" fill="#F5C542"/><circle cx="20.6" cy="5.4" r=".5" fill="#F5C542"/>`,
  krone: () => `<path d="M12.6 10.8l1.4-5.4 3.1 3.3L20 3.6l2.9 5.1 3.1-3.3 1.4 5.4z" fill="#F5C542"/><circle cx="20" cy="7.8" r=".95" fill="#E06B6B"/><circle cx="15.6" cy="9.3" r=".6" fill="#4FA3E0"/><circle cx="24.4" cy="9.3" r=".6" fill="#4FA3E0"/>`,
  katze: () => `<path d="M11.2 11.6l1.2-6.6 4.6 4.4zM28.8 11.6l-1.2-6.6-4.6 4.4z" fill="#3a3a3a"/><path d="M12.5 9.9l.6-3.2 2.1 2.1zM27.5 9.9l-.6-3.2-2.1 2.1z" fill="#F29A9A"/><path d="M13.4 21.2l-3.2-.6M13.4 22.2l-3.2.4M26.6 21.2l3.2-.6M26.6 22.2l3.2.4" stroke="#555" stroke-width=".5"/><circle cx="20" cy="20.6" r=".7" fill="#E07A8A"/>`,
  einhorn: () => `<path d="M18.5 9.4L20 .9l1.5 8.5z" fill="#F5C542"/><path d="M18.9 7.6l2.3-.7M19.3 5.2l1.7-.5M19.7 3l1-.3" stroke="#D99A2B" stroke-width=".55"/><circle cx="14.6" cy="9.6" r="1.5" fill="#FF7AA8"/><circle cx="25.4" cy="9.6" r="1.5" fill="#B69CF2"/>`,
  cap: () => `<path d="M11.6 15.2c.4-5.2 4-8.2 8.4-8.2s8 3 8.4 8.2z" fill="#3E7CC9"/><path d="M19 14.4c4.2 0 8.4.4 12.2 1.6-.6.9-2.1 1.1-3.9 1-2.8-.4-5.5-.6-8.3-.6z" fill="#2F64A6"/><circle cx="20" cy="7.4" r=".9" fill="#2F64A6"/>`,
  kopfhoerer: () => `<path d="M10.4 19.5c0-6.4 4.2-10.6 9.6-10.6s9.6 4.2 9.6 10.6" fill="none" stroke="#333" stroke-width="1.7"/><rect x="8.6" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/><rect x="27.8" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/>`,
  schleife: () => `<path d="M24.6 9.6l3.8-2.2v4.4zM24.6 9.6l-3.8-2.2v4.4z" fill="#FF7AA8"/><circle cx="24.6" cy="9.6" r="1.1" fill="#E0568A"/>`
};
const avatarGen = (code, bg) => {
  const [age, st, hc, sk, acc] = String(code).split('.');
  const [h1, h2] = AV_HC[hc] || AV_HC.blond; const skin = AV_SK[sk] || AV_SK.hell;
  const [bk, fr] = AV_ST[st] || [null, 'kurz']; const kid = age === 'k';
  const ex = acc && acc !== '0' ? acc.split('+') : [];
  const body = kid ? 'M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z' : 'M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z';
  let s = `<rect width="40" height="40" fill="${bg}"/>`;
  if (bk) s += AV_HB[bk](h2);
  s += ex.includes('astro') ? `<path d="${body}" fill="#E8EEF5"/>` : ex.includes('held') ? `<path d="${body}" fill="#C0392B"/><path d="M20 32.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#F5C542"/>` : `<path d="${body}" fill="#111" opacity=".28"/>`;
  s += `<rect x="17" y="23" width="6" height="7" fill="${skin}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${skin}"/>`;
  if (fr) s += AV_HF[fr](h1);
  if (age === 'o') s += '<path d="M14.6 15.4h1.8M23.6 15.4h1.8M15.4 21.6l-.8.6M24.6 21.6l.8.6" stroke="#9a6a4a" stroke-width=".5"/>';
  s += '<circle cx="17.1" cy="18.6" r="1.05" fill="#3b2a1e"/><circle cx="22.9" cy="18.6" r="1.05" fill="#3b2a1e"/>';
  if (!ex.includes('bart')) s += '<path d="M17.6 22q2.4 1.9 4.8 0" stroke="#b0613a" stroke-width="1" fill="none" stroke-linecap="round"/>';
  if (kid || ['long', 'ponylang', 'zoepfe', 'dutt', 'bob', 'locken', 'pferd'].includes(st)) s += '<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/>';
  ex.forEach((a) => { if (AV_ACC[a]) s += AV_ACC[a](h2); });
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
};
// Termin-Zeit kurz: "14:30–15:20" bzw. schmal "14:30–15"
const evRange = (e, short) => {
  if (e.allDay) return short ? 'ganzt.' : 'ganztägig';
  const t = (x) => (short && !x.getMinutes() ? String(x.getHours()) : pad(x.getHours()) + ':' + pad(x.getMinutes()));
  return `${t(e.s)}–${t(e.e)}`;
};
// Bild einer Person: k.bild = 'av:<code>' (Baukasten), 'svg:<portrait>' oder 'mdi:<icon>' (aus den Einstellungen), sonst k.avatar aus der Kartenkonfig
const avatarHtml = (k, size) => {
  const b = k.bild || '';
  if (b.startsWith('img:')) return `<img src="${esc(b.slice(4))}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:none;display:inline-block">`;
  if (b.startsWith('av:')) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarGen(b.slice(3), k.farbe)}</span>`;
  if (b.startsWith('mdi:')) return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;flex:none;color:#161616"><ha-icon icon="${esc(b)}" style="--mdc-icon-size:${Math.round(size * 0.6)}px"></ha-icon></span>`;
  if (b.startsWith('svg:')) return avatarBase({ ...k, avatar: b.slice(4) }, size);
  return avatarBase(k, size);
};
const daysLabel = (t) => {
  const s = [...(t || [])].sort((a, b) => a - b).join(',');
  if (s === '1,2,3,4,5,6,7') return 'Täglich';
  if (s === '1,2,3,4,5') return 'Werktags';
  if (s === '6,7') return 'Wochenende';
  return (t || []).length ? [...t].sort((a, b) => a - b).map((d) => WD[d - 1]).join(', ') : 'Nie';
};

class FpBase extends HTMLElement {
  setConfig(config) {
    this._cfg = this._normalize(config || {});
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._bind(); }
    this._teardown();
    this._data = {};
    this._render(true);
    this._ensure();
  }
  set hass(h) { this._hass = h; this._ensure(); }
  get hass() { return this._hass; }
  connectedCallback() { this._ensure(); }
  disconnectedCallback() { this._teardown(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', min_rows: 6 }; }
  _teardown() {
    (this._unsubs || []).forEach((p) => p.then((u) => u && u()).catch(() => {}));
    this._unsubs = null;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
  _ensure() {
    if (!this._hass || !this._cfg || !this.isConnected || this._unsubs) return;
    this._unsubs = this._lists().map(([key, ent]) => this._hass.connection.subscribeMessage(
      (m) => { this._data[key] = m.items || []; this._render(); },
      { type: 'todo/item/subscribe', entity_id: ent }
    ).catch((e) => { this._err = `${ent}: ${(e && e.message) || e}`; this._render(); }));
    if (this._started) this._started();
  }
  _kids() {
    const list = (this._cfg.kinder || []).map((k) => (typeof k === 'string' ? { name: k } : { ...k }));
    const names = new Set(list.map((k) => k.name));
    for (const p of this._data.plan || []) {
      for (const k of Object.keys(planZ(parseDesc(p.description)))) { if (k && !names.has(k)) { names.add(k); list.push({ name: k }); } }
    }
    const ps = this._settingsP();
    return list.map((k, i) => { const o = ps[k.name] || {}; return { ...k, ...(o.bild ? { bild: o.bild } : {}), alias: [...new Set([...(k.alias || []), ...(o.alias || [])])], farbe: o.farbe || k.farbe || PALETTE[i % PALETTE.length] }; });
  }
  _settingsItem() { return ((this._data && this._data.settings) || []).find((i) => i.summary === 'Personen') || null; }
  _settingsP() { const it = this._settingsItem(); const m = it ? parseDesc(it.description) : {}; return (m && m.p) || {}; }
  _call(domain, service, data, entity) {
    return this._hass.callService(domain, service, data, entity ? { entity_id: entity } : undefined);
  }
}

/* ============================ WOCHENPLANER ============================ */
class LoxWochenplanerCard extends FpBase {
  _normalize(c) {
    return { plan: 'todo.amtli_plan', heute: 'todo.amtli_heute', verlauf: 'todo.amtli_verlauf', einstellungen: 'todo.familienplaner_einstellungen', kalender: [], kinder: [], tage_zuverlaessigkeit: 30, titel: 'Familienplaner', ...c };
  }
  _lists() { return [['plan', this._cfg.plan], ['heute', this._cfg.heute], ['verlauf', this._cfg.verlauf], ['settings', this._cfg.einstellungen]]; }
  _bind() {
    this._week = 0; this._events = []; this._tick = 0;
    try { this._mode = localStorage.getItem('fp_mode') || 'alle'; } catch (e) { this._mode = 'alle'; }
    this.shadowRoot.addEventListener('click', (e) => this._onClick(e));
  }
  _started() {
    this._lastDay = ymd(fpDay());
    this._fetchEvents();
    this._timer = setInterval(() => {
      this._tick++;
      const t = ymd(fpDay());
      if (t !== this._lastDay || this._tick % 20 === 0) { this._lastDay = t; this._fetchEvents(); }
      this._render();
    }, 30000);
  }
  _weekStart() { const t = startOfDay(fpDay()); return addDays(addDays(t, 1 - isoWd(t)), this._week * 7); }
  _calendars() {
    return (this._cfg.kalender || []).map((c) => (typeof c === 'string' ? { entity: c } : { ...c })).map((c, i) => {
      const st = this._hass && this._hass.states[c.entity];
      // Farbe des Kalenders = Farbe der Person, der er gehört
      const pk = c.person ? this._kids().find((x) => x.name === c.person) : null;
      return { ...c, farbe: (pk && pk.farbe) || c.farbe || CALCOL[i % CALCOL.length], name: c.name || (st ? st.attributes.friendly_name : c.entity) };
    });
  }
  async _fetchEvents() {
    const cals = this._calendars();
    if (!cals.length || !this._hass) { this._events = []; return; }
    const ws = this._weekStart(); const we = addDays(ws, 7); const res = [];
    await Promise.all(cals.map(async (c) => {
      try {
        const ev = await this._hass.callApi('GET', `calendars/${c.entity}?start=${encodeURIComponent(ws.toISOString())}&end=${encodeURIComponent(we.toISOString())}`);
        for (const e of ev || []) {
          const allDay = !!(e.start && e.start.date && !e.start.dateTime);
          const s = allDay ? new Date(e.start.date + 'T00:00:00') : new Date(e.start.dateTime || e.start);
          const en = allDay ? new Date(e.end.date + 'T00:00:00') : new Date((e.end && (e.end.dateTime || e.end)) || s);
          res.push({ title: e.summary || '', loc: e.location || '', s, e: en > s ? en : new Date(s.getTime() + 60000), allDay, c });
        }
      } catch (err) { /* Kalender nicht erreichbar */ }
    }));
    this._events = res; this._render();
  }
  _syncCal() {
    const ents = this._calendars().map((c) => c.entity);
    if (!ents.length || this._syncing || !this._hass) return;
    this._syncing = true; this._render();
    this._call('homeassistant', 'update_entity', { entity_id: ents }).catch(() => {})
      .finally(() => setTimeout(() => { this._syncing = false; this._fetchEvents(); }, 2500));
  }
  _history() {
    const h = {};
    for (const it of this._data.verlauf || []) {
      const m = parseDesc(it.description);
      const day = h[it.summary] || (h[it.summary] = { s: {}, x: [] });
      for (const [k, done, tot] of m.s || []) { const c = day.s[k] || [0, 0]; day.s[k] = [c[0] + done, c[1] + tot]; }
      for (const x of m.x || []) day.x.push(x);
    }
    return h;
  }
  _stats(kid, h, today, todayDone, todayTot) {
    // [erledigt, total] der letzten n Tage + heute bereits erledigte
    const sum = (n) => { let d = todayDone, t = todayDone; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s) { d += s[0]; t += s[1]; } } return [d, t]; };
    const w = sum(7), m = sum(30), all = sum(this._cfg.tage_zuverlaessigkeit);
    const done = all[0], tot = all[1];
    let streak = todayTot && todayDone === todayTot ? 1 : 0;
    for (let i = 1; i <= 120; i++) {
      const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid];
      if (!s || !s[1]) continue;
      if (s[0] === s[1]) streak++; else break;
    }
    return { pct: tot ? Math.round((done / tot) * 100) : 100, start: !tot, streak, w, m };
  }
  // Auszeichnungen aus dem Verlauf (wandern je nach Leistung zwischen den Personen)
  _awards(kids, pre) {
    const A = {}; kids.forEach((k) => { A[k.name] = []; });
    const rate = (x) => (x[1] ? x[0] / x[1] : -1); const pc = (x) => Math.round(rate(x) * 100);
    const best = (key, minTot) => {
      const c = kids.filter((k) => pre[k.name][key][1] >= minTot); if (!c.length) return [];
      const top = Math.max(...c.map((k) => rate(pre[k.name][key]))); const c2 = c.filter((k) => rate(pre[k.name][key]) === top);
      const td = Math.max(...c2.map((k) => pre[k.name][key][0])); return c2.filter((k) => pre[k.name][key][0] === td).map((k) => k.name);
    };
    best('w', 3).forEach((n) => A[n].push({ id: 'krone', icon: 'mdi:crown', c: '#F5C542', t: 'Krone der Woche', why: `Beste Quote der letzten 7 Tage: ${pre[n].w[0]} von ${pre[n].w[1]} Ämtli (${pc(pre[n].w)} %).` }));
    best('m', 10).forEach((n) => A[n].push({ id: 'pokal', icon: 'mdi:trophy', c: '#E0A84F', t: 'Pokal des Monats', why: `Beste Quote der letzten 30 Tage: ${pre[n].m[0]} von ${pre[n].m[1]} Ämtli (${pc(pre[n].m)} %).` }));
    const maxDone = Math.max(0, ...kids.map((k) => pre[k.name].w[0]));
    const fl = kids.filter((k) => maxDone >= 5 && pre[k.name].w[0] === maxDone);
    if (fl.length === 1) A[fl[0].name].push({ id: 'fleiss', icon: 'mdi:bee', c: '#F5C542', t: 'Fleissbiene', why: `Am meisten Ämtli erledigt: ${maxDone} in den letzten 7 Tagen.` });
    kids.forEach((k) => {
      const s = pre[k.name];
      if (s.w[1] >= 5 && s.w[0] === s.w[1]) A[k.name].push({ id: 'perfekt', icon: 'mdi:star-four-points', c: '#69C350', t: 'Perfekte Woche', why: `Alle ${s.w[1]} Ämtli der letzten 7 Tage erledigt.` });
      if (s.streak >= 3) A[k.name].push({ id: 'serie', icon: 'mdi:fire', c: '#E06B6B', t: `${s.streak}-Tage-Serie`, why: `${s.streak} Tage am Stück alle Ämtli erledigt.` });
      if (s.start) A[k.name].push({ id: 'start', icon: 'mdi:rocket-launch', c: '#4FA3E0', t: 'Startbonus', why: 'Noch keine abgeschlossenen Ämtli-Tage – du startest mit 100 %. Halte sie hoch!' });
    });
    return A;
  }
  _detailHtml(kids, pre, awards) {
    const k = kids.find((x) => x.name === this._detail); if (!k) return '';
    const s = pre[k.name]; const lv = level(s.pct); const aw = awards[k.name] || [];
    const q = (x) => (x[1] ? `${x[0]} / ${x[1]} <small>(${Math.round((x[0] / x[1]) * 100)} %)</small>` : '<small>noch keine</small>');
    const holders = (id) => kids.filter((x) => (awards[x.name] || []).some((a) => a.id === id)).map((x) => x.name).join(', ') || 'noch niemand';
    const RULES = [['mdi:crown', '#F5C542', 'Krone der Woche', 'Beste Quote der letzten 7 Tage (mind. 3 Ämtli).', 'krone'], ['mdi:trophy', '#E0A84F', 'Pokal des Monats', 'Beste Quote der letzten 30 Tage (mind. 10 Ämtli).', 'pokal'], ['mdi:bee', '#F5C542', 'Fleissbiene', 'Am meisten Ämtli erledigt in den letzten 7 Tagen (mind. 5).', 'fleiss'], ['mdi:star-four-points', '#69C350', 'Perfekte Woche', 'Alle Ämtli der letzten 7 Tage erledigt (mind. 5).', 'perfekt'], ['mdi:fire', '#E06B6B', 'Serie', 'Mindestens 3 Tage am Stück alles erledigt.', 'serie'], ['mdi:rocket-launch', '#4FA3E0', 'Startbonus', 'Wer neu startet, beginnt mit 100 %.', 'start']];
    return `<div class="ovl" data-close><div class="pnl" data-keep>
      <div class="ph"><div class="ring bigr">${avatarHtml(k, 64)}${aw.some((a) => a.id === 'krone') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}<span class="rib" style="--rc:${lv.c}">${s.pct}%</span></div>
        <div class="phn"><div class="pn2">${esc(k.name)}</div><div class="lv" style="color:${lv.c}">${s.start ? 'Startbonus' : lv.t} · Zuverlässigkeit ${s.pct} %</div></div>
        <button class="nb" data-x><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="kp"><div><span>Letzte 7 Tage</span><b>${q(s.w)}</b></div><div><span>Letzte 30 Tage</span><b>${q(s.m)}</b></div><div><span>Serie</span><b>${s.streak} ${s.streak === 1 ? 'Tag' : 'Tage'}</b></div></div>
      <div class="sec2">Auszeichnungen</div>
      ${aw.length ? aw.map((a) => `<div class="aw"><span class="md lg" style="--mc:${a.c}"><ha-icon icon="${a.icon}"></ha-icon></span><div><b>${esc(a.t)}</b><div>${esc(a.why)}</div></div></div>`).join('') : '<div class="aw0">Noch keine Auszeichnung – erledige deine Ämtli und hol dir die Krone!</div>'}
      <div class="sec2">So holst du dir Auszeichnungen</div>
      ${RULES.map(([ic, c, t, d, id]) => `<div class="rl2"><span class="md" style="--mc:${c}"><ha-icon icon="${ic}"></ha-icon></span><b>${t}</b><span>${d}</span>${['krone', 'pokal', 'fleiss'].includes(id) ? `<em>aktuell: ${esc(holders(id))}</em>` : ''}</div>`).join('')}
    </div></div>`;
  }
  _planFor(kid, date) {
    if (((this._cfg.abwesend || {})[kid] || []).includes(ymd(date))) return [];
    const wd = isoWd(date);
    return (this._data.plan || []).map((p) => ({ t: p.summary, m: parseDesc(p.description) }))
      .filter((p) => (planZ(p.m)[kid] || []).includes(wd) && planActive(p.m, kid, wd, date)).map((p) => { const f = (p.m.f || {})[`${kid}|${wd}`] || 1; return f > 1 ? `${p.t} (bis ${WD[(wd - 1 + f - 1) % 7]})` : p.t; }).sort((a, b) => a.localeCompare(b, 'de'));
  }
  _onClick(e) {
    if (e.target.closest('[data-x]')) { this._detail = null; this._render(); return; }
    if (e.target.closest('[data-keep]')) return;
    if (e.target.closest('[data-close]')) { this._detail = null; this._render(); return; }
    const pp = e.target.closest('[data-person]');
    if (pp) { this._detail = pp.dataset.person; clearTimeout(this._dT); this._dT = setTimeout(() => { this._detail = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 30) * 1000); this._render(); return; }
    const b = e.target.closest('.btn');
    if (b && this._hass) {
      const done = b.classList.contains('done');
      b.classList.toggle('done');
      this._call('todo', 'update_item', { item: b.dataset.uid, status: done ? 'needs_action' : 'completed' }, this._cfg.heute).catch(() => this._render());
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { fpNavigate(go.dataset.go); return; }
    const md = e.target.closest('[data-mode]');
    if (md) { this._mode = md.dataset.mode; try { localStorage.setItem('fp_mode', this._mode); } catch (er) { /* ignorieren */ } this._render(); return; }
    if (e.target.closest('[data-sync]')) { this._syncCal(); return; }
    if (e.target.closest('[data-todos]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true })); return; }
    const fc = e.target.closest('[data-focus]');
    if (fc) {
      const v = fc.dataset.focus; this._focus = v === ymd(fpDay()) ? null : v;
      clearTimeout(this._fT); if (this._focus) this._fT = setTimeout(() => { this._focus = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
      this._render(); return;
    }
    const n = e.target.closest('[data-nav]');
    if (n) { const v = n.dataset.nav; this._focus = null; this._week = v === '0' ? 0 : this._week + Number(v); this._events = []; this._render(); this._fetchEvents(); }
  }
  _render() {
    if (!this.shadowRoot || !this._cfg) return;
    const now = new Date(); const today = startOfDay(fpDay()); const tStr = ymd(today);
    const ws = this._weekStart(); const days = [...Array(7)].map((_, i) => addDays(ws, i));
    const kids = this._kids(); const h = this._history(); const cals = this._calendars();
    // Termine immer mit der aktuellen Farbe der Kalender-Besitzerin/des Besitzers anzeigen
    this._events.forEach((e) => { const cc = cals.find((x) => x.entity === e.c.entity); if (cc) e.c = cc; });
    // Termin-Zuordnung: Name im Titel (z. B. "Lea Turnen") -> bei dieser Person; sonst beim Kalender-Besitzer
    const nameRe = (n) => new RegExp('(^|[^\\p{L}])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?(?![\\p{L}])', 'iu');
    const kRes = kids.flatMap((x) => [x.name, ...(x.alias || [])].map((a) => [x.name, nameRe(a)]));
    const evWho = new Map(this._events.map((e) => {
      if (e.c.schule) return [e, e.c.person ? [e.c.person] : []];
      const hit = this._cfg.termine_nach_namen === false ? [] : [...new Set(kRes.filter(([, re]) => re.test(e.title)).map(([n]) => n))];
      const own = e.c.person ? [e.c.person] : [];
      return [e, hit.length ? (this._cfg.auch_beim_besitzer ? [...new Set([...hit, ...own])] : hit) : own];
    }));
    const alle = (this._data.heute || []).map((i) => ({ ...i, m: parseDesc(i.description) }));
    const heute = alle.filter((i) => (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= tStr);
    const focus = (this._focus && days.some((d) => ymd(d) === this._focus)) ? this._focus : (days.some((d) => ymd(d) === tStr) ? tStr : null);
    // Spaltenbreiten: xl = heute/angetippt, m = morgen (und heute, wenn ein anderer Tag angetippt ist), s = alle anderen Tage.
    // In den Ansichten Ämtli/Termine bleiben die nächsten 2 Tage und das Wochenende mittel.
    const T = {}; const curWeek = days.some((d) => ymd(d) === tStr); const allMode = (this._mode || 'alle') === 'alle';
    days.forEach((d) => {
      const s = ymd(d); const diff = Math.round((startOfDay(d) - today) / 86400000); const we = isoWd(d) >= 6;
      T[s] = s === focus ? 'xl' : !curWeek ? 'm' : allMode ? ((s === tStr || diff === 1) ? 'm' : 's')
        : (s === tStr || we || (diff > 0 && diff <= 2)) ? 'm' : 's';
    });
    const cols = days.map((d) => (T[ymd(d)] === 's' ? (allMode && curWeek ? 'minmax(0,0.42fr)' : startOfDay(d) < today ? 'minmax(0,0.4fr)' : 'minmax(0,0.6fr)')
      : ({ xl: allMode && curWeek ? 'minmax(0,4.6fr)' : 'minmax(0,3.6fr)', m: allMode && curWeek ? 'minmax(0,1.5fr)' : 'minmax(0,1.15fr)' })[T[ymd(d)]])).join(' ');
    const we = days[6];

    const legCals = cals.filter((c) => !c.schule);
    const head = `<div class="corner">${legCals.length ? `<div class="leg">${legCals.map((c) => `<span class="lgi"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')}</div>` : ''}<span>Tag antippen für Details</span></div>` + days.map((d) => {
      const t = ymd(d) === tStr;
      return `<div class="hd${t ? ' t' : ''}${ymd(d) === focus ? ' fx' : ''} ts-${T[ymd(d)]}" data-focus="${ymd(d)}">${WD[isoWd(d) - 1]}${t ? ' · Heute' : ''}<b>${d.getDate()}.</b></div>`;
    }).join('');

    const calLabel = legCals.length
      ? legCals.map((c) => `<span class="cl"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')
      : '<span class="cl">Outlook folgt</span>';
    const termine = `<div class="lab syn${this._syncing ? ' spin' : ''}" data-sync title="Kalender jetzt synchronisieren"><div class="ic"><ha-icon icon="${this._syncing ? 'mdi:sync' : 'mdi:calendar-sync-outline'}"></ha-icon></div><div class="lt"><div class="nm">Termine</div><div class="cls">${calLabel}</div></div></div>` +
      days.map((d) => {
        const ds = startOfDay(d), de = addDays(ds, 1);
        const evs = this._events.filter((e) => !(evWho.get(e) || []).length && e.s < de && e.e > ds).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const t = ymd(d) === tStr;
        const shown = evs.slice(0, ymd(d) === focus ? 6 : 2);
        return `<div class="c ev-c${t ? ' t' : ''}">${shown.map((e) => `<div class="ev${ymd(d) === focus ? ' w' : ''}" style="border-color:${e.c.farbe}">${evTime(e, ymd(d) === focus)}${ymd(d) === focus ? '<br>' : ''}${esc(e.title)}</div>`).join('')}${evs.length > shown.length ? `<div class="more">+${evs.length - shown.length} weitere</div>` : ''}</div>`;
      }).join('');

    const pre = {};
    kids.forEach((k) => { const mi = heute.filter((i) => i.m.k === k.name); pre[k.name] = this._stats(k.name, h, today, mi.filter((i) => i.status === 'completed').length, mi.length); });
    const awards = this._awards(kids, pre);
    // timetable view: only persons with a timetable
    const rowKids = (this._mode || 'alle') === 'schule' ? kids.filter((x) => (this._cfg.schule || {})[x.name]) : kids;
    const rows = rowKids.map((k) => {
      const mine = heute.filter((i) => i.m.k === k.name).sort((a, b) => a.summary.localeCompare(b.summary, 'de'));
      const tDone = mine.filter((i) => i.status === 'completed').length;
      const st = pre[k.name]; const aw = awards[k.name] || [];
      const lv = level(st.pct); const C = 2 * Math.PI * 24;
      const label = `<div class="lab" data-person="${esc(k.name)}" style="box-shadow:inset 3px 0 0 ${k.farbe}">
          <div class="ring"><span class="ava">${avatarHtml(k, 48)}</span>${aw.some((a) => a.id === 'krone') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>
          <div class="lt"><div class="nm">${esc(k.name)}</div><div class="lv2"><span class="rib2" style="--rc:${lv.c}">${st.pct}%</span>${aw.map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}</div>
          </div>
          </div>`;
      const injectEv = (d, html) => {
        const dS = startOfDay(d), dE = addDays(dS, 1); const tr = T[ymd(d)]; const wide = tr === 'xl'; const mx = wide ? 5 : 3;
        const pevAll = this._events.filter((e) => (evWho.get(e) || []).includes(k.name) && e.s < dE && e.e > dS).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        // school: lessons from the school calendar, else fixed times; condensed to leave / start–end / home
        const sc = (this._cfg.schule || {})[k.name]; const awayD = ((this._cfg.abwesend || {})[k.name] || []).includes(ymd(d));
        const hm = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
        const at = (t) => { const x = new Date(dS); const [hh, mm] = t.split(':').map(Number); x.setHours(hh, mm, 0, 0); return x; };
        const schoolC = { farbe: k.farbe, name: 'Schule', schule: true };
        let lessons = awayD ? [] : pevAll.filter((e) => e.c.schule && !e.allDay);
        if (!awayD && !lessons.length && sc && sc.zeiten && sc.zeiten[isoWd(d)]) {
          const zz = sc.zeiten[isoWd(d)]; const spans = typeof zz[0] === 'string' ? [zz] : zz;
          lessons = spans.map((z) => ({ title: 'Schule', s: at(z[0]), e: at(z[1]), allDay: false, c: schoolC }));
        }
        // blocks: a long break (time to go home and back) splits the day, e.g. morning + afternoon with lunch at home
        const wg = (sc && sc.weg) || 0; const gapMin = Number(this._cfg.schulpause) > 0 ? Number(this._cfg.schulpause) : Math.max(45, 2 * wg + 15); const blocks = [];
        [...lessons].sort((a, b) => a.s - b.s).forEach((e) => {
          const lb = blocks[blocks.length - 1];
          if (lb && (e.s - lb.e) / 60000 < gapMin) { if (e.e > lb.e) lb.e = e.e; } else blocks.push({ s: e.s, e: e.e });
        });
        // a school block shows up only from X min before leaving until X min after being home (setting, 0 = always)
        const win = Number(this._cfg.schulfenster) || 0;
        const blockEvs = blocks.filter((bk) => !win || (now >= new Date(bk.s - (wg + win) * 60000) && now <= new Date(+bk.e + (wg + win) * 60000)))
          .map((bk) => ({ title: wg ? `🎒 los ${hm(new Date(bk.s - wg * 60000))} · zuhause ${hm(new Date(+bk.e + wg * 60000))}` : '🎒 Schule',
          s: new Date(bk.s), e: new Date(bk.e), allDay: false, c: schoolC }));
        const rest = pevAll.filter((e) => !e.c.schule);
        const mode0 = this._mode || 'alle';
        // blocks only in "all"; the calendar view shows appointments without school; the timetable shows every lesson
        const detail = lessons.map((e) => ({ ...e, title: e.loc ? `${e.title} · ${e.loc}` : e.title }));
        const pev = mode0 === 'schule' ? detail : mode0 === 'termine' ? rest : [...blockEvs, ...rest].sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const mode = mode0 === 'schule' ? 'termine' : mode0;
        if (mode === 'aemtli') return html;
        const open = (html.match(/^<div[^>]*>/) || [''])[0];
        if (!pev.length) return mode === 'termine' ? open + '<div class="none">–</div></div>' : html;
        if (tr === 's') { const evn = `<div class="evn">${pev.slice(0, 4).map((e) => `<i style="background:${e.c.farbe}"></i>`).join('')}<b>${pev.length}</b></div>`; return mode === 'termine' ? open + evn + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evn); }
        const lim = mode === 'termine' ? (wide ? 12 : 6) : mx;
        const evh = `<div class="pev ${wide ? 'xl' : 'mid'}">${pev.slice(0, lim).map((e) => `<div class="ev one" style="border-color:${e.c.farbe}"><span class="et">${esc(e.title)}</span><span class="tm">${evRange(e, !wide)}</span><span class="src" style="background:${e.c.farbe}" title="Kalender ${esc(e.c.name)}">${wide ? esc(e.c.name) : esc((e.c.name || '?').charAt(0).toUpperCase())}</span></div>`).join('')}${pev.length > lim ? `<div class="more">+${pev.length - lim} weitere</div>` : ''}</div>`;
        return mode === 'termine' ? open + evh + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evh);
      };
      const cells = days.map((d) => injectEv(d, ((d) => {
        const ds = ymd(d);
        if (((this._cfg.abwesend || {})[k.name] || []).includes(ds) && !(ds === tStr && mine.length)) {
          return `<div class="c ${ds < tStr ? 'p' : ds === tStr ? 't' : 'f'} vac${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="vc"><ha-icon icon="mdi:palm-tree"></ha-icon>${T[ds] === 's' ? '' : '<span>Ferien</span>'}</div></div>`;
        }
        if (ds === tStr && ds !== focus) {
          return mine.length ? `<div class="c t" data-focus="${ds}"><div class="fc"><b>${tDone}/${mine.length}</b></div><div class="bar"><i style="width:${Math.round((tDone / mine.length) * 100)}%;background:${G}"></i></div></div>` : `<div class="c t" data-focus="${ds}"></div>`;
        }
        if (ds === tStr) {
          if (!mine.length) return '<div class="c t"></div>';
          const all = tDone === mine.length;
          return `<div class="c t"><div class="prog"><span>${tDone} von ${mine.length} erledigt</span>${all ? '<span class="gr">Super!</span>' : ''}</div><div class="bg">` +
            mine.map((i) => `<button class="btn${i.status === 'completed' ? ' done' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span><span class="bt">${esc(i.summary)}${dueTag(i.m, tStr)}</span></button>`).join('') + `</div></div>`;
        }
        if (ds < tStr) {
          const s = h[ds] && h[ds].s[k.name];
          if (!s || !s[1]) return `<div class="c p${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="none">–</div></div>`;
          const pct = Math.round((s[0] / s[1]) * 100); const col = pct === 100 ? G : pct >= 50 ? '#E0A84F' : '#E06B6B';
          if (T[ds] === 's') return `<div class="c p sm" data-focus="${ds}"><div class="pst" style="--pc:${col}">${s[0]}/${s[1]}</div></div>`;
          const miss = h[ds].x.filter((x) => x[0] === k.name).map((x) => x[1]);
          return `<div class="c p${ds === focus ? ' fx' : ''}" data-focus="${ds}"><div class="big">${s[0]}<small> / ${s[1]}</small></div><div class="bar"><i style="width:${pct}%;background:${col}"></i></div>` +
            (pct === 100 ? `<div class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${ds === focus ? 'Alles erledigt' : ''}</div>` : (ds === focus ? miss.map((m) => `<div class="miss">✕ ${esc(m)}</div>`).join('') : `<div class="miss">✕ ${miss.length}</div>`)) + `</div>`;
        }
        const pl = this._planFor(k.name, d);
        const opl = alle.filter((i) => i.m.k === k.name && i.status !== 'completed' && (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= ds);
        if (T[ds] !== 's') {
          const lim = ds === focus ? 99 : 4;
          const op = opl.map((i) => `<div class="pl op">⏳ ${esc(i.summary)}</div>`).join('');
          return `<div class="c f${ds === focus ? ' fx' : ''}" data-focus="${ds}">${op}${pl.length ? pl.slice(0, lim).map((p) => `<div class="pl">${esc(p)}</div>`).join('') + (pl.length > lim ? `<div class="more">+${pl.length - lim} weitere</div>` : '') : ''}</div>`;
        }
        return `<div class="c f" data-focus="${ds}">${pl.length ? `<div class="fc"><b>${pl.length}</b>Ämtli</div>` : ''}${opl.length ? `<div class="opn">⏳ ${opl.length} offen</div>` : ''}</div>`;
      })(d))).join('');
      return label + cells;
    }).join('');

    const empty = !kids.length ? `<div class="emptyk">Noch keine Ämtli geplant – im Tab „Ämtliplan“ anlegen.</div>` : '';

    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:14px 16px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
      .top{display:flex;align-items:center;gap:16px;margin-bottom:8px;flex-wrap:wrap}
      .clock{font-size:38px;font-weight:200;color:${G};line-height:1;font-variant-numeric:tabular-nums}
      .date{font-size:24px;font-weight:300}.date b{font-weight:600}
      .sub{font-size:12px;color:var(--fp-text3,#7a7a7a);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px}
      .nav{margin-left:auto;display:flex;align-items:center;gap:8px}
      .nb{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);color:var(--fp-text,#ddd);border-radius:10px;height:42px;min-width:42px;padding:0 14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;font-size:14px;-webkit-tap-highlight-color:transparent}
      .nb ha-icon{--mdc-icon-size:22px}.nb.td{gap:6px}.tdn{background:${G};color:var(--fp-on-accent,#141414);border-radius:10px;padding:0 7px;font-size:12px;line-height:20px}.nb.g{color:${G};border-color:color-mix(in srgb,var(--fp-accent) 50%,transparent)}
      .wk{font-size:12px;color:var(--fp-text3,#8a8a8a);padding:0 8px;text-align:center;min-width:150px}.wk b{display:block;color:var(--fp-text,#ececec);font-size:15px;font-weight:600}
      .grid{display:grid;grid-template-columns:178px ${cols};gap:5px;align-items:stretch}
      .corner{font-size:10px;color:var(--fp-text3,#555);display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:6px;padding:0 4px 6px}
      .corner .leg{background:none;padding:0;margin:0;gap:4px 10px}.corner .lgi{font-size:12px}
      .pev.mid .src{display:none}
      .hd{padding:4px 10px 6px;font-size:11px;color:var(--fp-text3,#8a8a8a);text-transform:uppercase;letter-spacing:1px}
      .hd{cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.hd.fx{background:var(--fp-bg3,#262626)}
      .hd b{display:block;font-size:18px;color:var(--fp-text,#e5e5e5);font-weight:300;letter-spacing:0;text-transform:none;margin-top:2px}
      .hd.t,.hd.t b{color:${G}}.hd.t b{font-weight:500}
      .c{background:var(--fp-bg3,#262626);border-radius:10px;padding:8px;min-height:56px;min-width:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .c.fx{box-shadow:inset 0 0 0 1px #4a4a4a;background:var(--fp-bg3,#2a2a2a)}
      .c.t{background:var(--fp-bg3,#2a2a2a);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .ev-c{min-height:38px}
      .syn{cursor:pointer;-webkit-tap-highlight-color:transparent}.syn:active{background:var(--fp-bg3,#2a2a2a)}
      .spin .ic ha-icon,.spin2 ha-icon{animation:fpspin 1s linear infinite}
      .pev{margin-bottom:6px;display:flex;flex-direction:column;gap:3px}.pev .ev{margin-top:0}
      .pev.sm .ev{font-size:10px;padding:2px 4px 2px 5px}
      .ev .du{color:var(--fp-text3,#8a8a8a);font-weight:400;margin-right:5px}
      .src{display:inline-block;font-size:9px;font-weight:700;color:var(--fp-on-accent,#141414);border-radius:6px;padding:0 5px;margin-right:5px;line-height:15px;vertical-align:1px;white-space:nowrap}
      .leg{display:flex;align-items:center;gap:12px;margin-left:auto;background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 14px;flex-wrap:wrap}
      .leg + .nav{margin-left:0}
      .lgt{font-size:10px;color:var(--fp-text3,#666);text-transform:uppercase;letter-spacing:1px}
      .tnav{display:flex;gap:6px;margin-left:auto}.tnav + .seg{margin-left:0}
      .seg{display:flex;background:var(--fp-bg2,#232323);border-radius:10px;padding:3px;gap:2px;margin-left:auto}.seg + .leg{margin-left:0}
      .seg button{background:transparent;border:none;color:var(--fp-text2,#999);font:inherit;font-size:13px;padding:0 13px;height:36px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}.seg button.on{background:var(--fp-bg4,#3a3a3a);color:var(--fp-text,#fff);font-weight:600}
      .ev.one{display:flex;align-items:center;gap:6px;white-space:nowrap}.ev.one .et{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:block}
      .ev.one .tm{flex:none;color:var(--fp-text2,#9a9a9a);font-size:.9em;font-variant-numeric:tabular-nums}.ev.one .src{flex:none;margin:0}
      .pev.mid .ev.one{white-space:nowrap;gap:4px}.pev.mid .ev.one .tm{font-size:10px}
      .lgi{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#ccc)}.lgi i{width:10px;height:10px;border-radius:3px;display:inline-block}.ev.w{white-space:normal;line-height:1.35}.ev.w .du{margin-left:6px}@keyframes fpspin{to{transform:rotate(360deg)}}
      .lab{background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:10px;min-width:0;box-sizing:border-box}
      .lv2{display:flex;align-items:center;gap:4px;margin-top:5px;flex-wrap:wrap}
      .rib2{background:var(--rc);color:var(--fp-on-accent,#141414);font-size:11px;font-weight:800;line-height:18px;padding:0 11px 0 7px;border-radius:3px 0 0 3px;clip-path:polygon(0 0,100% 0,86% 50%,100% 100%,0 100%);margin-right:2px;letter-spacing:.2px}
      .ic{width:38px;height:38px;border-radius:10px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center;flex:none}
      .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:var(--fp-on-accent,#161616);flex:none}
      .lt{min-width:0;flex:1}
      .lv b{font-weight:700}
      .lab[data-person]{cursor:pointer;-webkit-tap-highlight-color:transparent}.lab[data-person]:active{background:var(--fp-bg3,#2a2a2a)}
      .rib{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);background:var(--rc);color:var(--fp-on-accent,#141414);font-size:9px;font-weight:800;padding:1px 8px;line-height:13px;white-space:nowrap;letter-spacing:.3px;clip-path:polygon(0 0,100% 0,90% 50%,100% 100%,0 100%,10% 50%);z-index:2}
      .crown{position:absolute;top:-10px;left:50%;transform:translateX(-50%) rotate(-10deg);color:#f5c542;filter:drop-shadow(0 1px 1px rgba(0,0,0,.7));z-index:2;display:flex}.crown ha-icon{--mdc-icon-size:18px}
      .bdg{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap}
      .md{width:18px;height:18px;border-radius:50%;background:color-mix(in srgb,var(--mc) 22%,transparent);border:1px solid var(--mc);color:var(--mc);display:inline-flex;align-items:center;justify-content:center;flex:none}.md ha-icon{--mdc-icon-size:12px}
      .lv2 .md{width:30px;height:30px;border-width:2px}.lv2 .md ha-icon{--mdc-icon-size:20px}.lv2{gap:6px}
      .md.lg{width:36px;height:36px}.md.lg ha-icon{--mdc-icon-size:20px}
      .ovl{position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:10}
      .pnl{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);width:min(600px,94%);max-height:92%;overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.6);box-sizing:border-box}
      .ph{display:flex;align-items:center;gap:18px;margin-bottom:16px}.phn{flex:1}.pn2{font-size:24px;font-weight:600}
      .ring.bigr{width:64px;height:64px;display:flex}.ring.bigr .crown{top:-14px}.ring.bigr .crown ha-icon{--mdc-icon-size:24px}.ring.bigr .rib{font-size:11px;line-height:15px;bottom:-7px}
      .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kp div{background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px}
      .kp span{display:block;font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}.kp b{font-size:18px;font-weight:400}.kp small{font-size:12px;color:var(--fp-text3,#888)}
      .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
      .aw{display:flex;gap:12px;align-items:center;background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px;margin-bottom:6px}.aw b{font-size:15px}.aw div div{font-size:12px;color:var(--fp-text2,#aaa);margin-top:2px}
      .aw0{color:var(--fp-text3,#888);font-size:13px}
      .rl2{display:grid;grid-template-columns:22px 140px 1fr;gap:3px 10px;align-items:center;font-size:12px;color:var(--fp-text2,#aaa);padding:7px 0;border-top:1px solid var(--fp-line,#2a2a2a)}.rl2 b{color:var(--fp-text,#ddd)}
      .rl2 em{grid-column:3;font-style:normal;color:#e0a84f;font-size:11px}
      .nm{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lv{font-size:11px;margin-top:2px}
      .cls{display:flex;flex-wrap:wrap;gap:2px 8px;margin-top:2px}.cl{font-size:11px;color:var(--fp-text3,#7a7a7a);display:flex;align-items:center;gap:4px}.cl i{width:7px;height:7px;border-radius:50%;display:inline-block}
      .ring{position:relative;width:48px;height:48px;flex:none}
      .ring .ava{display:block;width:48px;height:48px;border-radius:50%;overflow:hidden;-webkit-mask-image:-webkit-radial-gradient(white,black)}
      .ring .ava > span{width:100%!important;height:100%!important;border-radius:50%}.ring .ava svg{display:block}
      .streak{font-size:11px;color:var(--fp-text2,#9a9a9a);display:flex;align-items:center;gap:3px;margin-top:3px}.streak ha-icon{--mdc-icon-size:13px;color:#e0a84f}
      .bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,135px),1fr));gap:6px}
      .btn{display:flex;align-items:center;gap:9px;width:100%;background:var(--fp-bg4,#323232);border:1px solid var(--fp-line,#3a3a3a);border-radius:9px;padding:6px 9px;margin:0;color:var(--fp-text,#eee);font:inherit;font-size:13px;line-height:1.25;min-height:40px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box;transition:background .2s,border-color .2s}
      .btn:active{transform:scale(.98)}
      .btn .cb{width:22px;height:22px;border-radius:50%;border:2px solid var(--fp-line,#5d5d5d);flex:none;position:relative;box-sizing:border-box;transition:all .2s}
      .btn.done{background:color-mix(in srgb,var(--fp-accent) 1200%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .btn.done .cb{background:${G};border-color:${G}}
      .btn.done .cb::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid var(--fp-line,#1e1e1e);border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
      .btn.done .bt{color:var(--fp-accent)}
      .due{font-style:normal;font-size:10px;font-weight:600;color:#e0a84f;border:1px solid rgba(224,168,79,.5);border-radius:8px;padding:1px 6px;margin-left:6px;white-space:nowrap;display:inline-block}
      .due.last{color:var(--fp-on-accent,#1e1e1e);background:#e0a84f;border-color:#e0a84f}.btn.done .due{opacity:.5}
      .pl.op{color:#c39a4a}.pl.op::before{display:none}
      .pev.mid .ev{font-size:11px;padding:3px 5px 3px 6px;white-space:normal;line-height:1.3}.pev.mid .et{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fp-text,#ddd)}
      .pev.xl .ev{padding:5px 8px;font-size:12px}.pev.xl .et{color:var(--fp-text,#eee)}
      .pst{display:inline-block;font-size:11px;font-weight:700;color:var(--fp-on-accent,#141414);background:var(--pc);border-radius:6px;padding:1px 6px;line-height:16px}
      .c.p.sm{padding:6px 4px;min-height:40px;display:flex;flex-direction:column;align-items:center;gap:4px}
      .evn{display:flex;align-items:center;gap:3px;font-size:11px;color:var(--fp-text2,#aaa);margin-bottom:5px;flex-wrap:wrap;justify-content:center}.evn i{width:6px;height:6px;border-radius:50%;display:inline-block}.evn b{margin-left:2px;font-weight:600}
      .hd.ts-s{padding:4px 4px 6px;font-size:9px;letter-spacing:.5px}.hd.ts-s b{font-size:14px;color:var(--fp-text3,#8a8a8a)}
      .hd.ts-m b{font-size:17px}
      .c.p .big{font-size:14px}.c.p .big small{font-size:10px}.c.p .bar{margin:5px 0 4px}
      .fc{font-size:11px;color:var(--fp-text3,#8a8a8a);white-space:nowrap}.fc b{font-size:18px;font-weight:300;color:var(--fp-text,#ddd);margin-right:4px}
      .opn{font-size:11px;color:#c39a4a;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .prog{font-size:11px;color:var(--fp-text3,#8a8a8a);margin-bottom:4px;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.8px}.gr{color:${G};font-weight:600}
      .free{display:flex;align-items:center;gap:8px;color:var(--fp-text3,#8a8a8a);font-size:14px;padding:6px 2px}.free ha-icon{color:${G}}
      .vc{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;min-height:40px;color:#4fa3e0;font-size:13px;font-weight:600;background:rgba(79,163,224,.08);border-radius:8px}.vc ha-icon{--mdc-icon-size:20px}
      .big{font-size:18px;font-weight:300;line-height:1.1}.big small{font-size:13px;color:var(--fp-text3,#8a8a8a)}
      .bar{height:4px;border-radius:2px;background:var(--fp-bg4,#3a3a3a);margin:7px 0 6px;overflow:hidden}.bar i{display:block;height:100%}
      .miss{font-size:11px;color:#d98080;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ok{font-size:11px;color:${G};display:flex;align-items:center;gap:4px}.ok ha-icon{--mdc-icon-size:14px}
      .pl{font-size:12px;color:var(--fp-text3,#7a7a7a);line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pl::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--fp-bg4,#555);margin-right:6px;vertical-align:middle}
      .none{font-size:13px;color:var(--fp-text3,#555)}
      .ev{font-size:12px;line-height:1.3;padding:4px 6px 4px 7px;border-left:3px solid;background:var(--fp-bg4,#303030);border-radius:0 6px 6px 0;margin-top:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .ev:first-child{margin-top:0}.ev b{font-weight:600;color:var(--fp-text2,#aaa);margin-right:5px}
      .more{font-size:11px;color:var(--fp-text3,#777);margin-top:4px}
      .emptyk{grid-column:1/-1;color:var(--fp-text3,#7a7a7a);padding:20px;text-align:center}
      .err{color:#e06b6b;font-size:12px;margin-top:10px}
    </style>
    <div class="card">
      <div class="top">
        <div class="clock">${pad(now.getHours())}:${pad(now.getMinutes())}</div>
        <div><div class="sub">${esc(this._cfg.titel)}</div><div class="date">${WDL[isoWd(now) - 1]}, <b>${now.getDate()}. ${MON[now.getMonth()]}</b></div></div>
        <div class="seg">${[['alle', 'Alles'], ['aemtli', 'Ämtli'], ['termine', 'Termine'], ['schule', 'Stundenplan']].filter(([v]) => v !== 'schule' || Object.keys(this._cfg.schule || {}).length).map(([v, l]) => `<button class="${(this._mode || 'alle') === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        <div class="nav">
          ${this._cfg.todos_knopf ? `<button class="nb td${this._cfg.todos_offen ? ' g' : ''}" data-todos title="To-dos"><ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>To-dos${this._cfg.todos_offen ? ` <b class="tdn">${Number(this._cfg.todos_offen)}</b>` : ''}</button>` : ''}
          ${this._week !== 0 ? `<button class="nb g" data-nav="0">Heute</button>` : ''}
          ${cals.length ? `<button class="nb${this._syncing ? ' spin2' : ''}" data-sync title="Kalender synchronisieren"><ha-icon icon="mdi:calendar-sync-outline"></ha-icon></button>` : ''}
          <button class="nb" data-nav="-1"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          <div class="wk"><b>KW ${isoWeek(ws)}</b>${ws.getDate()}. ${ws.getMonth() !== we.getMonth() ? MON[ws.getMonth()].slice(0, 3) + '. ' : ''}– ${we.getDate()}. ${MON[we.getMonth()]}</div>
          <button class="nb" data-nav="1"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </div>
      </div>
      <div class="grid">${head}${(!cals.length || cals.some((c) => !c.person)) ? termine : ''}${rows}${empty}</div>
      ${this._err ? `<div class="err">${esc(this._err)}</div>` : ''}
      ${this._detail ? this._detailHtml(kids, pre, awards) : ''}
    </div>`;
  }
}

// Navigation zwischen den Familienplaner-Seiten (funktioniert auch im Kiosk-Modus ohne HA-Kopfzeile)
const fpNavigate = (p) => {
  const parts = location.pathname.split('/').filter(Boolean);
  history.pushState(null, '', `/${parts[0] || 'family-planer'}/${p}${location.search}`);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
};
window.FPX = { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx, planActive, AV_TYPES, PALETTE, fpNavigate, startOfDay, ymd };
customElements.define('fp-week-inner', LoxWochenplanerCard);

})();
// Familienplaner – Ämtliplan v3: pro Ämtli mehrere Personen, pro Person Wochentage mit Rhythmus
// custom:fp-plan-inner   (nutzt window.FPX aus dem Familienplaner-Modul)
// Plan-Beschreibung: "fp1:" + {"z": {"Lea": [1,3]}, "r": {"Lea|1": [2, 0]}}
//   r: alle n Wochen, aktiv wenn Wochenindex (seit 5.1.1970) % n == offset; fehlt r => jede Woche
customElements.whenDefined('fp-week-inner').then(() => {
  const { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx } = window.FPX;
  const rgba = (hex, a) => { const h = (hex || '#888888').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const mondayOfIdx = (idx) => { const u = new Date(Date.UTC(1970, 0, 5) + idx * 604800000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const curIdx = () => weekIdx(new Date());
  const nextKw = (n, o) => { const c = curIdx(); for (let i = 0; i < n; i++) if ((c + i) % n === o) return isoWeek(mondayOfIdx(c + i)); return null; };
  const dayTxt = (p, d, r, f) => { const x = r[`${p}|${d}`]; const fv = (f || {})[`${p}|${d}`] || 1; const ex = []; if (fv > 1) ex.push(`bis ${WD[(d - 1 + fv - 1) % 7]}`); if (x && x[0] > 1) ex.push(`alle ${x[0]} Wo., nächste KW ${nextKw(x[0], x[1])}`); return ex.length ? `${WD[d - 1]} (${ex.join(', ')})` : WD[d - 1]; };
  const daysTxt = (p, t, r, f) => {
    const s = [...(t || [])].sort((a, b) => a - b); const j = s.join(',');
    const anyR = s.some((d) => (r[`${p}|${d}`] || [1])[0] > 1 || ((f || {})[`${p}|${d}`] || 1) > 1);
    if (!anyR) { if (j === '1,2,3,4,5,6,7') return 'täglich'; if (j === '1,2,3,4,5') return 'werktags'; if (j === '6,7') return 'Wochenende'; }
    return s.length ? s.map((d) => dayTxt(p, d, r, f)).join(', ') : 'keine Tage';
  };

  // Bildauswahl pro Person (eigene Portraits + Material-Design-Icons)
  const ICONS = [
    ['Mädchen', ['svg:maedchen-lang', 'svg:maedchen-zoepfe', 'svg:maedchen-dutt', 'av:k.long.braun.hell.0', 'av:k.long.schwarz.mittel.0', 'av:k.long.rot.hell.0', 'av:k.ponylang.blond.hell.schleife', 'av:k.ponylang.braun.oliv.0', 'av:k.ponylang.schwarz.hell.brille', 'av:k.zoepfe.braun.mittel.0', 'av:k.zoepfe.schwarz.dunkel.0', 'av:k.zoepfe.rot.hell.0', 'av:k.dutt.braun.oliv.0', 'av:k.bob.blond.hell.0', 'av:k.bob.schwarz.mittel.0', 'av:k.bob.braun.hell.brille', 'av:k.locken.braun.dunkel.0', 'av:k.locken.schwarz.oliv.schleife', 'av:k.locken.rot.hell.0', 'av:k.pferd.blond.hell.0', 'av:k.pferd.braun.mittel.0', 'av:k.long.blond.hell.kopfhoerer']],
    ['Jungen', ['av:k.kurz.blond.hell.0', 'av:k.kurz.braun.hell.0', 'av:k.kurz.schwarz.mittel.0', 'av:k.kurz.rot.hell.0', 'av:k.stachel.blond.hell.0', 'av:k.stachel.braun.oliv.0', 'av:k.stachel.schwarz.dunkel.0', 'av:k.seite.braun.hell.0', 'av:k.seite.blond.mittel.brille', 'av:k.lockenkurz.schwarz.dunkel.0', 'av:k.lockenkurz.braun.oliv.0', 'av:k.kurz.blond.hell.cap', 'av:k.kurz.braun.mittel.kopfhoerer', 'av:k.seite.rot.hell.cap']],
    ['Frauen', ['svg:frau', 'av:e.long.braun.mittel.0', 'av:e.long.schwarz.oliv.0', 'av:e.long.rot.hell.0', 'av:e.ponylang.blond.hell.0', 'av:e.ponylang.braun.hell.brille', 'av:e.bob.braun.hell.0', 'av:e.bob.blond.hell.brille', 'av:e.bob.schwarz.dunkel.0', 'av:e.dutt.blond.hell.0', 'av:e.dutt.braun.oliv.brille', 'av:e.locken.braun.dunkel.0', 'av:e.locken.blond.hell.0', 'av:e.pferd.blond.hell.0', 'av:e.pferd.schwarz.mittel.0', 'av:e.pferd.rot.hell.0']],
    ['Männer', ['svg:mann', 'av:e.kurz.braun.hell.0', 'av:e.kurz.schwarz.oliv.0', 'av:e.kurz.braun.hell.bart', 'av:e.kurz.blond.hell.bart', 'av:e.seite.braun.mittel.brille', 'av:e.seite.schwarz.dunkel.0', 'av:e.seite.blond.hell.0', 'av:e.stachel.blond.hell.0', 'av:e.lockenkurz.schwarz.dunkel.bart', 'av:e.glatze.braun.hell.bart', 'av:e.glatze.schwarz.mittel.brille', 'av:e.kurz.rot.hell.bart+brille', 'av:e.kurz.blond.hell.cap']],
    ['Grosseltern', ['av:o.dutt.grau.hell.brille', 'av:o.bob.grau.hell.0', 'av:o.locken.grau.mittel.0', 'av:o.long.grau.hell.brille', 'av:o.kurz.grau.hell.brille', 'av:o.glatze.grau.hell.bart+brille', 'av:o.seite.grau.oliv.bart', 'av:o.glatze.grau.dunkel.0']],
    ['Verkleidet', ['av:k.kurz.blond.hell.held', 'av:k.long.blond.hell.held', 'av:k.zoepfe.braun.hell.held', 'av:k.kurz.braun.hell.astro', 'av:k.zoepfe.blond.hell.astro', 'av:k.kurz.schwarz.mittel.pirat', 'av:k.long.rot.hell.pirat', 'av:k.long.blond.hell.zauber', 'av:k.stachel.braun.hell.zauber', 'av:k.long.blond.hell.krone', 'av:k.kurz.blond.hell.krone', 'av:k.zoepfe.braun.hell.katze', 'av:k.long.blond.hell.katze', 'av:k.long.blond.hell.einhorn', 'av:k.ponylang.braun.mittel.einhorn', 'av:k.dutt.blond.hell.kopfhoerer', 'av:e.kurz.braun.hell.held', 'av:e.long.blond.hell.krone']],
    ['Symbole & Smileys', ['mdi:face-woman', 'mdi:face-man', 'mdi:baby-face-outline', 'mdi:account-cowboy-hat', 'mdi:emoticon-cool-outline', 'mdi:emoticon-happy-outline', 'mdi:emoticon-excited-outline', 'mdi:emoticon-tongue-outline']],
    ['Superheld & Abenteuer', ['mdi:shield-star', 'mdi:lightning-bolt', 'mdi:flash', 'mdi:domino-mask', 'mdi:ninja', 'mdi:pirate', 'mdi:sword', 'mdi:shield-crown', 'mdi:crown', 'mdi:castle', 'mdi:wizard-hat', 'mdi:magic-staff', 'mdi:skull-crossbones', 'mdi:treasure-chest']],
    ['Weltall & Roboter', ['mdi:rocket-launch', 'mdi:ufo', 'mdi:alien', 'mdi:robot', 'mdi:robot-happy', 'mdi:star-shooting', 'mdi:earth', 'mdi:moon-waning-crescent', 'mdi:telescope', 'mdi:atom']],
    ['Tiere', ['mdi:unicorn', 'mdi:unicorn-variant', 'mdi:cat', 'mdi:dog', 'mdi:dog-side', 'mdi:rabbit', 'mdi:rodent', 'mdi:horse', 'mdi:horse-variant', 'mdi:owl', 'mdi:penguin', 'mdi:panda', 'mdi:koala', 'mdi:elephant', 'mdi:teddy-bear', 'mdi:turtle', 'mdi:fish', 'mdi:dolphin', 'mdi:shark', 'mdi:jellyfish', 'mdi:bee', 'mdi:butterfly', 'mdi:ladybug', 'mdi:snake', 'mdi:spider', 'mdi:duck', 'mdi:bird', 'mdi:pig', 'mdi:cow', 'mdi:sheep', 'mdi:paw', 'mdi:ghost']],
    ['Sport', ['mdi:soccer', 'mdi:basketball', 'mdi:volleyball', 'mdi:tennis', 'mdi:table-tennis', 'mdi:hockey-sticks', 'mdi:swim', 'mdi:bike', 'mdi:skateboard', 'mdi:ski', 'mdi:karate', 'mdi:run', 'mdi:gymnastics', 'mdi:trophy']],
    ['Musik & Hobby', ['mdi:guitar-electric', 'mdi:guitar-acoustic', 'mdi:piano', 'mdi:music', 'mdi:microphone-variant', 'mdi:headphones', 'mdi:dance-ballroom', 'mdi:drama-masks', 'mdi:palette', 'mdi:brush', 'mdi:camera', 'mdi:gamepad-variant', 'mdi:controller-classic', 'mdi:puzzle', 'mdi:chess-knight', 'mdi:book-open-variant']],
    ['Essen', ['mdi:ice-cream', 'mdi:pizza', 'mdi:cupcake', 'mdi:cookie', 'mdi:candy', 'mdi:popcorn', 'mdi:hamburger', 'mdi:food-apple', 'mdi:fruit-watermelon', 'mdi:carrot']],
    ['Natur & Fahrzeuge', ['mdi:flower', 'mdi:flower-tulip', 'mdi:palm-tree', 'mdi:cactus', 'mdi:mushroom', 'mdi:clover', 'mdi:weather-sunny', 'mdi:weather-night', 'mdi:snowflake', 'mdi:fire', 'mdi:diamond-stone', 'mdi:heart', 'mdi:star', 'mdi:car-sports', 'mdi:airplane', 'mdi:helicopter', 'mdi:train', 'mdi:sail-boat', 'mdi:tractor', 'mdi:motorbike', 'mdi:fire-truck', 'mdi:bus-school']]
  ];
  // only the multi-coloured illustrated avatars (no plain one-colour icons)
  const AVATARS = ICONS.filter(([, ids]) => ids.every((x) => !x.startsWith('mdi:')));
  const COLS = ['#69C350', '#A8CF45', '#4FD1C5', '#4FA3E0', '#7A7FE8', '#C771D6', '#E06B9B', '#E06B6B', '#E0A84F', '#F5C542', '#9AA5B1'];

  class LoxAemtliPlanCard extends FpBase {
    _normalize(c) { return { plan: 'todo.amtli_plan', script: 'script.aemtli_tageswechsel', einstellungen: 'todo.familienplaner_einstellungen', kinder: [], titel: 'Ämtliplan', ...c }; }
    _lists() { return [['plan', this._cfg.plan], ['settings', this._cfg.einstellungen]]; }
    getCardSize() { return 10; }
    _bind() {
      this._new = { t: '', z: {}, r: {}, f: {} }; this._confirm = null; this._msg = ''; this._pick = null;
      const r = this.shadowRoot;
      r.addEventListener('click', (e) => this._onClick(e));
      r.addEventListener('change', (e) => this._onChange(e));
      r.addEventListener('input', (e) => { if (e.target.dataset.new === 't') this._new.t = e.target.value; });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur(); });
      r.addEventListener('focusout', () => setTimeout(() => { if (this._dirty && !this._editing()) { this._dirty = false; this._render(); } }, 60));
    }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && a.tagName === 'INPUT'; }
    _order() { return this._kids().map((k) => k.name); }
    _rows() {
      const order = this._order();
      const first = (z) => Math.min(99, ...Object.keys(z).map((k) => { const i = order.indexOf(k); return i < 0 ? 98 : i; }));
      return (this._data.plan || []).map((p) => { const m = parseDesc(p.description); return { uid: p.uid, t: p.summary, pts: (typeof m.p === 'number' ? m.p : null), z: planZ(m), r: (m.r && typeof m.r === 'object') ? m.r : {}, f: (m.f && typeof m.f === 'object') ? m.f : {} }; })
        .sort((a, b) => (first(a.z) - first(b.z)) || a.t.localeCompare(b.t, 'de'));
    }
    _find(uid) { return this._rows().find((r) => r.uid === uid); }
    _desc(z, r, f) {
      const zo = {}; const ro = {}; const fo = {}; f = f || {};
      for (const [k, v] of Object.entries(z)) {
        zo[k] = [...new Set(v)].sort((a, b) => a - b);
        for (const d of zo[k]) { const x = r[`${k}|${d}`]; if (x && x[0] > 1) ro[`${k}|${d}`] = [x[0], ((x[1] % x[0]) + x[0]) % x[0]]; const fv = f[`${k}|${d}`]; if (fv > 1) fo[`${k}|${d}`] = fv; }
      }
      const o = { z: zo }; if (Object.keys(ro).length) o.r = ro; if (Object.keys(fo).length) o.f = fo;
      return 'fp1:' + JSON.stringify(o);
    }
    _sync() {
      clearTimeout(this._syncT);
      this._syncT = setTimeout(() => { if (this._cfg.script) this._call('script', 'turn_on', {}, this._cfg.script).catch(() => {}); }, 1200);
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(true); clearTimeout(this._msgT); this._msgT = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _add() {
      const t = (this._new.t || '').trim();
      if (!t) return this._flash('Bitte einen Ämtli-Text eingeben.', true);
      if (!Object.values(this._new.z).some((v) => v.length)) return this._flash('Bitte mindestens einer Person einen Wochentag zuordnen.', true);
      this._call('todo', 'add_item', { item: t, description: this._desc(this._new.z, this._new.r, this._new.f) }, this._cfg.plan).then(() => {
        this._new = { t: '', z: {}, r: {}, f: {} }; this._pick = null; this._flash(`„${t}“ hinzugefügt`); this._sync();
      }).catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    _ctx(el) {
      const isNew = !!el.closest('.add'); const row = el.closest('.row[data-uid]');
      const r = !isNew && row ? this._find(row.dataset.uid) : null;
      const src = isNew ? this._new : r;
      return { isNew, r, key: isNew ? 'new' : (r && r.uid), z: src ? JSON.parse(JSON.stringify(src.z)) : null, rr: src ? JSON.parse(JSON.stringify(src.r || {})) : null, ff: src ? JSON.parse(JSON.stringify(src.f || {})) : null };
    }
    _apply(ctx) {
      if (ctx.isNew) { this._new.z = ctx.z; this._new.r = ctx.rr; this._new.f = ctx.ff; this._render(true); return; }
      if (!ctx.r) return;
      // optimistisch im lokalen Datenstand übernehmen, damit die Anzeige sofort stimmt
      const desc = this._desc(ctx.z, ctx.rr, ctx.ff);
      const it = (this._data.plan || []).find((p) => p.uid === ctx.r.uid); if (it) it.description = desc;
      this._render(true);
      this._call('todo', 'update_item', { item: ctx.r.uid, description: desc }, this._cfg.plan)
        .then(() => this._sync()).catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    _isPick(key, p, d) { const k = this._pick; return !!k && k.key === key && k.p === p && k.d === d; }
    _onClick(e) {
      const t = e.target;
      const ip = t.closest('[data-ip]');
      if (ip) { this._ip = this._ip === ip.dataset.ip ? null : ip.dataset.ip; this._render(true); return; }
      if (t.closest('[data-ipclose]')) { this._ip = null; this._render(true); return; }
      const bi = t.closest('[data-bild]'); if (bi && this._ip) { this._savePerson(this._ip, { bild: bi.dataset.bild }); return; }
      const co = t.closest('[data-col]'); if (co && this._ip) { this._savePerson(this._ip, { farbe: co.dataset.col }); return; }
      if (t.closest('[data-add]')) { const inp = this.shadowRoot.querySelector('[data-new="t"]'); if (inp) this._new.t = inp.value; this._add(); return; }
      const arw = t.closest('.arw');
      if (arw) {
        const ctx = this._ctx(t); if (!ctx.z) return; const p = arw.dataset.p;
        const day = t.closest('[data-day]');
        if (day) {
          const d = Number(day.dataset.day); const has = (ctx.z[p] || []).includes(d);
          if (!has) { ctx.z[p] = [...(ctx.z[p] || []), d]; this._pick = { key: ctx.key, p, d }; this._apply(ctx); }
          else { this._pick = this._isPick(ctx.key, p, d) ? null : { key: ctx.key, p, d }; this._render(true); }
          return;
        }
        const pre = t.closest('[data-preset]');
        if (pre) { ctx.z[p] = pre.dataset.preset.split(',').map(Number); Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rmp]')) { delete ctx.z[p]; Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        const pk = this._pick; if (!pk) return; const rk = `${pk.p}|${pk.d}`;
        const rn = t.closest('[data-rn]');
        if (rn) { const n = Number(rn.dataset.rn); if (n <= 1) delete ctx.rr[rk]; else ctx.rr[rk] = [n, curIdx() % n]; this._apply(ctx); return; }
        const ro = t.closest('[data-ro]');
        if (ro && ctx.rr[rk]) { ctx.rr[rk][1] = Number(ro.dataset.ro); this._apply(ctx); return; }
        const fx = t.closest('[data-fx]');
        if (fx) { const v = Number(fx.dataset.fx); if (v <= 1) delete ctx.ff[rk]; else ctx.ff[rk] = v; this._apply(ctx); return; }
        if (t.closest('[data-rdel]')) { ctx.z[pk.p] = (ctx.z[pk.p] || []).filter((x) => x !== pk.d); delete ctx.rr[rk]; delete ctx.ff[rk]; this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rclose]')) { this._pick = null; this._render(true); return; }
        return;
      }
      const del = t.closest('[data-del]');
      if (del) {
        const ctx = this._ctx(t); if (!ctx.r) return; const r = ctx.r;
        if (this._confirm === r.uid) {
          this._confirm = null;
          this._call('todo', 'remove_item', { item: [r.uid] }, this._cfg.plan).then(() => { this._flash(`„${r.t}“ gelöscht`); this._sync(); }).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        } else {
          this._confirm = r.uid; this._render(true);
          clearTimeout(this._cT); this._cT = setTimeout(() => { this._confirm = null; this._render(); }, 3000);
        }
      }
    }
    _onChange(e) {
      const el = e.target;
      if (el.dataset.upload !== undefined && this._ip && el.files && el.files[0]) { this._upload(this._ip, el.files[0]); return; }
      if (el.dataset.alias !== undefined && this._ip) {
        const al = [...new Set(el.value.split(',').map((s) => s.trim()).filter(Boolean))];
        this._savePerson(this._ip, { alias: al }); this._flash(al.length ? `Spitznamen gespeichert: ${al.join(', ')}` : 'Spitznamen entfernt'); return;
      }
      if (el.dataset.addp !== undefined) {
        const v = el.value; if (!v) return; const ctx = this._ctx(el); if (!ctx.z) return;
        ctx.z[v] = ctx.z[v] || []; this._apply(ctx); return;
      }
      if (el.dataset.f === 'p') {
        const ctx = this._ctx(el); if (!ctx.r) return;
        const n = el.value === '' ? null : Math.max(0, Math.min(1000, Math.round(Number(el.value) || 0)));
        this._call('todo', 'update_item', { item: ctx.r.uid, points: n }, this._cfg.plan).then(() => this._flash('Punkte gespeichert')).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        return;
      }
      if (el.dataset.f === 't') {
        const ctx = this._ctx(el); if (!ctx.r) return; const v = el.value.trim();
        if (v && v !== ctx.r.t) this._call('todo', 'update_item', { item: ctx.r.uid, rename: v }, this._cfg.plan).catch((er) => this._flash(`Fehler: ${er.message || er}`, true));
        else el.value = ctx.r.t;
      }
    }
    _picker(key, p, d, rr, farbe, ff) {
      const x = rr[`${p}|${d}`]; const n = x && x[0] > 1 ? x[0] : 1; const o = x ? x[1] : 0; const c = curIdx();
      const fv = (ff || {})[`${p}|${d}`] || 1;
      const fRow = `<div class="pr"><span class="plb">Zeit zum Erledigen</span>${[1, 2, 3, 4, 5, 6, 7].map((k) => `<button class="sg${k === fv ? ' on' : ''}" data-fx="${k}">${k === 1 ? `nur am ${WD[d - 1]}` : `bis ${WD[(d - 1 + k - 1) % 7]} · ${k} Tage`}</button>`).join('')}</div>`;
      const starts = n > 1 ? [...Array(n)].map((_, i) => {
        const idx = c + i; const off = idx % n; const kw = isoWeek(mondayOfIdx(idx));
        return `<button class="sg${off === o ? ' on' : ''}" data-ro="${off}">${i === 0 ? 'diese Woche' : i === 1 ? 'nächste Woche' : `in ${i} Wochen`} · KW ${kw}</button>`;
      }).join('') : '';
      return `<div class="pick" style="--c:${farbe};--cb:${rgba(farbe, 0.2)}">
        <div class="pr"><span class="plb">${WD[d - 1]} · ${esc(p)}</span>
          ${[1, 2, 3, 4].map((k) => `<button class="sg${k === n ? ' on' : ''}" data-rn="${k}">${k === 1 ? 'jede Woche' : `alle ${k} Wochen`}</button>`).join('')}</div>
        ${n > 1 ? `<div class="pr"><span class="plb">Start</span>${starts}</div>` : ''}
        ${fRow}<div class="pr"><button class="sg rm" data-rdel>Tag entfernen</button><button class="sg ok" data-rclose>Fertig</button></div>
      </div>`;
    }
    _asg(key, z, rr, ff) {
      ff = ff || {};
      const kids = this._kids(); const order = this._order();
      const person = (n) => kids.find((k) => k.name === n) || { name: n, farbe: '#888888' };
      const names = Object.keys(z).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const lines = names.map((n) => {
        const k = person(n); const t = z[n] || [];
        const pk = this._pick && this._pick.key === key && this._pick.p === n ? this._pick : null;
        return `<div class="arw" data-p="${esc(n)}"><div class="ar">${avatarHtml(k, 30)}<span class="pn">${esc(n)}</span>
          <div class="days">${WD.map((w, i) => {
            const d = i + 1; const on = t.includes(d); const x = rr[`${n}|${d}`]; const rh = on && x && x[0] > 1; const fv = on ? (ff[`${n}|${d}`] || 1) : 1; const tag = [rh ? x[0] + 'W' : '', fv > 1 ? fv + 'T' : ''].filter(Boolean).join('·');
            return `<button class="day${on ? ' on' : ''}${(rh || fv > 1) ? ' rh' : ''}${pk && pk.d === d ? ' sel' : ''}" data-day="${d}" style="--c:${k.farbe};--cb:${rgba(k.farbe, 0.2)}">${w}${tag ? `<small>${tag}</small>` : ''}</button>`;
          }).join('')}</div>
          <button class="pre" data-preset="1,2,3,4,5,6,7">tägl.</button><button class="pre" data-preset="1,2,3,4,5">Mo–Fr</button>
          <button class="rmp" data-rmp title="Person entfernen">✕</button></div>
          ${pk && t.includes(pk.d) ? this._picker(key, n, pk.d, rr, k.farbe, ff) : ''}</div>`;
      }).join('');
      const free = kids.filter((k) => !(k.name in z));
      return lines + (free.length ? `<select class="sel addp" data-addp><option value="" selected>+ Person zuteilen</option>${free.map((k) => `<option value="${esc(k.name)}">${esc(k.name)}</option>`).join('')}</select>` : '');
    }
    _savePerson(name, patch) {
      const ps = JSON.parse(JSON.stringify(this._settingsP())); ps[name] = { ...(ps[name] || {}), ...patch };
      const desc = 'fp1:' + JSON.stringify({ p: ps }); const it = this._settingsItem();
      if (it) it.description = desc; else this._data.settings = [...(this._data.settings || []), { summary: 'Personen', uid: '_neu', description: desc }];
      this._render(true);
      const call = it && it.uid !== '_neu'
        ? this._call('todo', 'update_item', { item: it.uid, description: desc }, this._cfg.einstellungen)
        : this._call('todo', 'add_item', { item: 'Personen', description: desc }, this._cfg.einstellungen);
      call.catch((e) => this._flash(`Fehler: ${e.message || e}`, true));
    }
    async _upload(name, file) {
      // centre crop to a 320 px square JPEG in the browser, then store it in Home Assistant
      if (!this._hass || !this._hass.fpUpload) return this._flash('Hochladen ist hier nicht verfügbar.', true);
      this._uploading = true; this._render(true);
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
        const s = Math.min(img.naturalWidth, img.naturalHeight); const c = document.createElement('canvas'); c.width = c.height = 320;
        c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 320, 320);
        URL.revokeObjectURL(url);
        await this._hass.fpUpload(name, c.toDataURL('image/jpeg', 0.86));
        this._flash('Foto gespeichert');
      } catch (er) { this._flash(`Fehler: ${(er && er.message) || 'Bild konnte nicht gelesen werden'}`, true); }
      this._uploading = false; this._render(true);
    }
    _iconPicker(k) {
      if (!k) return '';
      const cur = k.bild || (k.avatar ? 'svg:' + k.avatar : '');
      return `<div class="ipk" style="--c:${k.farbe}">
        <div class="iph">${avatarHtml(k, 60)}<div class="iphn"><b>${esc(k.name)}</b><span>Bild und Farbe antippen – wird sofort überall übernommen</span></div><button class="sg ok" data-ipclose>Fertig</button></div>
        <div class="ipl">Spitznamen in Terminen</div>
        <input class="in" data-alias value="${esc(((this._settingsP()[k.name] || {}).alias || []).join(', '))}" placeholder="z. B. Tommy, Mimi – mit Komma trennen" style="max-width:420px">
        <div class="ips2">Steht einer dieser Namen im Termintitel, erscheint der Termin bei ${esc(k.name)}.</div>
        <div class="ipl">Farbe</div><div class="cols">${COLS.map((c) => `<button class="clr${(k.farbe || '').toLowerCase() === c.toLowerCase() ? ' on' : ''}" data-col="${c}" style="background:${c}"></button>`).join('')}</div>
        <div class="ipl">Eigenes Foto</div><div class="upl">${(k.bild || '').startsWith('img:') ? avatarHtml(k, 56) : ''}<label class="sg up">${this._uploading ? 'Wird hochgeladen …' : 'Foto hochladen'}<input type="file" accept="image/*" data-upload hidden></label><span class="ips2">Wird quadratisch zugeschnitten und nur in deinem Home Assistant gespeichert.</span></div>
        ${AVATARS.map(([title, ids]) => `<div class="ipl">${title}</div><div class="igrid">${ids.map((id) => `<button class="ib${cur === id ? ' on' : ''}" data-bild="${id}">${avatarHtml({ ...k, bild: id }, 44)}</button>`).join('')}</div>`).join('')}
      </div>`;
    }
    _render(force) {
      if (!this.shadowRoot || !this._cfg) return;
      if (!force && this._editing()) { this._dirty = true; return; }
      const kids = this._kids(); const rows = this._rows();
      // Wochenübersicht: durchschnittliche Anzahl Ämtli pro Person und Tag (Rhythmus anteilig)
      const cnt = {}; kids.forEach((k) => { cnt[k.name] = [0, 0, 0, 0, 0, 0, 0]; });
      rows.forEach((r) => Object.entries(r.z).forEach(([n, t]) => { if (!cnt[n]) cnt[n] = [0, 0, 0, 0, 0, 0, 0]; (t || []).forEach((d) => { const x = r.r[`${n}|${d}`]; cnt[n][d - 1] += x && x[0] > 1 ? 1 / x[0] : 1; }); }));
      const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
      const max = Math.max(1, ...Object.values(cnt).flat());
      const overview = `<div class="ov"><div></div>${WD.map((w) => `<div class="ovh">${w}</div>`).join('')}<div class="ovh">Ø Woche</div>` +
        kids.map((k) => `<div class="ovp">${avatarHtml(k, 24)}<span>${esc(k.name)}</span></div>` +
          cnt[k.name].map((n) => `<div class="ovc" style="background:${n ? rgba(k.farbe, 0.12 + (0.5 * n) / max) : 'var(--fp-bg3,#262626)'};color:${n ? 'var(--fp-text,#fff)' : 'var(--fp-text3,#555)'}">${n ? fmt(n) : '·'}</div>`).join('') +
          `<div class="ovt">${fmt(cnt[k.name].reduce((a, b) => a + b, 0))}</div>`).join('') + `</div>`;
      const sum = (z, r, f) => Object.entries(z).map(([n, t]) => `<b>${esc(n)}:</b> ${daysTxt(n, t, r, f)}`).join('<br>') || 'Noch niemandem zugeteilt';
      const body = rows.map((r) => `
        <div class="row" data-uid="${esc(r.uid)}">
          <div class="tcol"><div class="tl"><input class="in" data-f="t" value="${esc(r.t)}"><label class="pts" title="Punkte bzw. Gewicht für dieses Ämtli (im fairen Modus: Anteil am Tageswert)"><input class="in pn" data-f="p" type="number" min="0" max="1000" inputmode="numeric" value="${r.pts == null ? '' : r.pts}" placeholder="${Number(this._cfg.punkte_standard) || 10}"><span>Pkt.</span></label></div><div class="rl">${sum(r.z, r.r, r.f)}</div></div>
          <div class="asg">${this._asg(r.uid, r.z, r.r, r.f)}</div>
          <button class="del${this._confirm === r.uid ? ' cf' : ''}" data-del>${this._confirm === r.uid ? 'Löschen?' : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button>
        </div>`).join('');
      const nw = this._new;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:20px 22px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
        .head{display:flex;align-items:center;gap:14px;margin-bottom:16px}
        .badge{width:46px;height:46px;border-radius:12px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center}.badge ha-icon{--mdc-icon-size:26px}
        .title{font-size:20px;font-weight:600}.subt{font-size:13px;color:var(--fp-text2,#8c8c8c);margin-top:3px}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .ov{display:grid;grid-template-columns:150px repeat(7,minmax(34px,58px)) 70px;gap:4px;align-items:center;background:var(--fp-bg2,#232323);border-radius:12px;padding:12px;width:max-content;max-width:100%;box-sizing:border-box}
        .ovh{font-size:11px;color:var(--fp-text3,#777);text-align:center;text-transform:uppercase;letter-spacing:.8px}
        .ovp{display:flex;align-items:center;gap:8px;font-size:14px;min-width:0}.ovp span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ovc{height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
        .ovt{text-align:center;font-size:14px;color:var(--fp-text2,#bbb);font-weight:600}
        .list{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2f2f2f);border-radius:12px;overflow:hidden}
        .row{display:grid;grid-template-columns:minmax(200px,1fr) auto 56px;gap:16px;align-items:start;padding:14px;border-top:1px solid var(--fp-line,#313131)}.row:first-child{border-top:none}
        .in,.sel{background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text,#eee);border-radius:9px;height:44px;padding:0 12px;font:inherit;font-size:15px;width:100%;box-sizing:border-box;outline:none}
        .in:focus,.sel:focus{border-color:color-mix(in srgb,var(--fp-accent) 70%,transparent)}
        .sel{-webkit-appearance:none;appearance:none}
        .tl{display:flex;gap:8px}.pts{display:flex;align-items:center;gap:4px;flex:none;color:var(--fp-text3,#8a8a8a);font-size:12px}.pts .pn{width:70px;text-align:center;padding:0 6px}
        .rl{font-size:12px;color:var(--fp-text3,#8a8a8a);margin:6px 0 0 2px;line-height:1.6}.rl b{color:var(--fp-text2,#bbb);font-weight:600}
        .asg{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
        .ar{display:flex;align-items:center;gap:8px}
        .pn{width:74px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .days{display:flex;gap:4px}
        .day{width:40px;height:40px;border-radius:9px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#808080);font:inherit;font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}
        .day small{font-size:9px;font-weight:700;opacity:.9}
        .day.on{background:var(--cb);border-color:var(--c);color:var(--c)}
        .day.rh{border-style:dashed}
        .day.sel{box-shadow:0 0 0 2px #1e1e1e,0 0 0 4px var(--c)}
        .pre{height:32px;border-radius:var(--fp-radius,16px);background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#999);font:inherit;font-size:11px;padding:0 10px;cursor:pointer}
        .rmp{width:32px;height:32px;border-radius:50%;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);font-size:13px;cursor:pointer;padding:0}
        .pick{margin:8px 0 4px 38px;background:var(--fp-bg1,#1f1f1f);border:1px solid var(--c);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
        .pr{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
        .plb{font-size:12px;color:var(--c);font-weight:600;min-width:86px}
        .sg{height:34px;border-radius:17px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#bbb);font:inherit;font-size:12px;padding:0 12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .sg.on{background:var(--cb);border-color:var(--c);color:var(--c);font-weight:600}
        .sg.rm{color:#e06b6b;border-color:rgba(224,107,107,.5)}.sg.ok{margin-left:auto;background:${G};border-color:${G};color:var(--fp-on-accent,#142010);font-weight:600}
        .addp{width:220px;height:38px;font-size:13px;color:var(--fp-text2,#aaa);border-style:dashed}
        .del{height:44px;border-radius:9px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);cursor:pointer;font:inherit;font-size:11px;font-weight:600;padding:0;display:flex;align-items:center;justify-content:center}
        .del.cf{background:#e06b6b;border-color:#e06b6b;color:var(--fp-on-accent,#1e1e1e)}.del ha-icon{--mdc-icon-size:20px}
        .add{margin-top:16px;background:var(--fp-bg2,#232323);border:1px dashed var(--fp-line,#3d3d3d);border-radius:12px;padding:14px}
        .add .row{padding:0;border:none}
        .addb{height:44px;border-radius:9px;background:${G};border:none;color:var(--fp-on-accent,#142010);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.addb ha-icon{--mdc-icon-size:24px}
        .msg{font-size:13px;margin-top:10px;min-height:18px}
        .empty{padding:24px;text-align:center;color:var(--fp-text3,#777)}
        .foot{font-size:12px;color:var(--fp-text3,#666);margin-top:12px;line-height:1.5}
        .pers{display:flex;flex-wrap:wrap;gap:8px}
        .pc{display:flex;align-items:center;gap:10px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);border-radius:30px;padding:4px 14px 4px 4px;color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .pc ha-icon{--mdc-icon-size:14px;color:var(--fp-text3,#777)}.pc.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .ipk{margin-top:10px;background:var(--fp-bg2,#232323);border:1px solid var(--c);border-radius:14px;padding:14px 16px}
        .iph{display:flex;align-items:center;gap:14px;margin-bottom:6px}.iphn{flex:1}.iphn b{display:block;font-size:18px}.iphn span{font-size:12px;color:var(--fp-text3,#888)}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.upl .up{cursor:pointer;display:inline-flex;align-items:center}
        .ipl{font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px}
        .cols{display:flex;gap:8px;flex-wrap:wrap}
        .clr{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.clr.on{border-color:#fff;box-shadow:0 0 0 2px #1e1e1e inset}
        .igrid{display:flex;flex-wrap:wrap;gap:6px}
        .ips2{font-size:11px;color:var(--fp-text3,#777);margin-top:5px}
        .ib{width:56px;height:56px;border-radius:12px;background:var(--fp-bg3,#2a2a2a);border:1px solid var(--fp-line,#333);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
        .ib.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
      </style>
      <div class="card">
        <div class="head"><div class="badge"><ha-icon icon="mdi:clipboard-text-clock-outline"></ha-icon></div>
          <div><div class="title">${esc(this._cfg.titel)}</div><div class="subt">Tag antippen = zuteilen · nochmals antippen = Zeit zum Erledigen (z. B. Mi bis Sa) und Rhythmus (alle 2–4 Wochen). Änderungen gelten ab sofort.</div></div></div>
        <div class="sec">Personen · Bild & Farbe</div>
        <div class="pers">${kids.map((k) => `<button class="pc${this._ip === k.name ? ' on' : ''}" data-ip="${esc(k.name)}" style="--c:${k.farbe}">${avatarHtml(k, 40)}<span>${esc(k.name)}</span><ha-icon icon="mdi:pencil"></ha-icon></button>`).join('')}</div>
        ${this._ip ? this._iconPicker(kids.find((k) => k.name === this._ip)) : ''}
        <div class="sec">Wochenübersicht</div>
        ${overview}
        <div class="sec">Ämtli</div>
        <div class="list">${body || '<div class="empty">Noch keine Ämtli – unten hinzufügen.</div>'}</div>
        <div class="add"><div class="sec" style="margin-top:0">Neues Ämtli</div>
          <div class="row">
            <div class="tcol"><input class="in" data-new="t" placeholder="z. B. Tisch abräumen" value="${esc(nw.t)}"><div class="rl">${sum(nw.z, nw.r, nw.f || {})}</div></div>
            <div class="asg">${this._asg('new', nw.z, nw.r, nw.f || {})}</div>
            <button class="addb" data-add title="Hinzufügen"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="msg" style="color:${this._msgErr ? '#E06B6B' : G}">${esc(this._msg || '')}</div>
        ${this._err ? `<div class="msg" style="color:#E06B6B">${esc(this._err)}</div>` : ''}
        <div class="foot">Gestrichelter Rahmen = Frist oder Rhythmus („4T“ = 4 Tage Zeit, „2W“ = alle 2 Wochen). Ein Ämtli mit Frist zählt erst als „nicht gemacht“, wenn die Frist abgelaufen ist. Täglich um ${esc(this._cfg.tageswechsel || '24:00')} werden unerledigte Ämtli als „nicht gemacht“ gezählt und die Ämtli für den neuen Tag erstellt.</div>
      </div>`;
    }
  }
  if (!customElements.get('fp-plan-inner')) customElements.define('fp-plan-inner', LoxAemtliPlanCard);
});

(() => {
// Familienplaner – Loxone-Style Karten
//  custom:fp-week-inner-en   Wochenkalender mit Ämtli (heute abhaken), Verlauf, Zuverlässigkeit, Kalender-Termine
//  custom:lox-aemtli-config-card  Ämtliplan bearbeiten (wie Serientermine: Text, Kind, Wochentage)
// Datenhaltung: todo.amtli_plan (Plan), todo.amtli_heute (heutige Ämtli), todo.amtli_verlauf (Tagesbilanz)
// Beschreibungen: "fp1:" + JSON   Plan {k,t:[1..7]}   Heute {k,d,c}   Verlauf {s:[[kind,erledigt,total]],x:[[kind,text]]}
const G = 'var(--fp-accent)';
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WDL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PALETTE = ['#69C350', '#4FA3E0', '#E0A84F', '#C771D6', '#E06B6B', '#4FD1C5'];
const CALCOL = ['#4FA3E0', '#E0A84F', '#C771D6', '#4FD1C5', '#E06B6B'];
const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoWd = (d) => d.getDay() || 7;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// planner day: changes at the configured day-change time (window.FP_DAY_OFFSET_MIN)
const fpDay = () => new Date(Date.now() - (window.FP_DAY_OFFSET_MIN || 0) * 60000);
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDesc = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };
const isoWeek = (d) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); };
// Zuteilung eines Plan-Ämtli: neues Format {z:{Person:[Tage]}}, altes Format {k, t} wird automatisch übernommen
const planZ = (m) => (m && m.z && typeof m.z === 'object') ? m.z : (m && m.k ? { [m.k]: m.t || [] } : {});
// Rhythmus: m.r = {"Person|Wochentag": [alle_n_Wochen, offset]}; aktiv, wenn Wochenindex % n == offset
const weekIdx = (d) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1970, 0, 5)) / 604800000);
const planActive = (m, kid, wd, date) => { const r = (m && m.r && m.r[`${kid}|${wd}`]) || null; if (!r || !(r[0] > 1)) return true; return weekIdx(date) % r[0] === r[1]; };
// Frist: Heute-Item {d: Start, e: Fristende}; Plan m.f = {"Person|Wochentag": Anzahl Tage}
const dueTag = (m, tStr) => { const e = m.e || m.d; if (!e) return ''; if (e > tStr) return `<em class="due">until ${WD[isoWd(new Date(e + 'T00:00:00')) - 1]}</em>`; if (m.d && m.d < tStr) return '<em class="due last">due today</em>'; return ''; };
// Termin-Zeit mit Dauer: breit "14:30–15:20 · 50 Min", schmal "14:30 · 50′"
const durTxt = (ms, short) => { const m = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(m / 60), r = m % 60;
  if (short) return h ? (r ? `${h}h${pad(r)}` : `${h}h`) : `${m}′`;
  return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${m} min`; };
const evTime = (e, wide) => {
  if (e.allDay) { const n = Math.round((e.e - e.s) / 86400000); return `<b>${wide ? 'All day' : 'All day'}</b>${n > 1 ? `<span class="du">${n} days</span>` : ''}`; }
  const t = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
  return wide ? `<b>${t(e.s)}–${t(e.e)}</b><span class="du">${durTxt(e.e - e.s)}</span>` : `<b>${t(e.s)}</b><span class="du">${durTxt(e.e - e.s, true)}</span>`;
};
const level = (p) => p === null ? { c: '#5a5a5a', t: 'No data yet' }
  : p >= 90 ? { c: G, t: 'Super reliable' }
  : p >= 75 ? { c: '#A8CF45', t: 'Reliable' }
  : p >= 50 ? { c: '#E0A84F', t: 'Room to improve' }
  : { c: '#E06B6B', t: 'Unreliable' };
// Avatare (flache SVG-Portraits): maedchen-lang, maedchen-zoepfe, maedchen-dutt, frau, mann
const SKIN = '#F3CDA6', HAIR = '#EBC55A', HAIR2 = '#D4A63B';
const AV_TYPES = ['maedchen-lang', 'maedchen-zoepfe', 'maedchen-dutt', 'frau', 'mann'];
const avatarSvg = (type, bg) => {
  const kid = type.startsWith('maedchen');
  const back = {
    'maedchen-lang': `<path d="M11 19c0-7 4-11.5 9-11.5s9 4.5 9 11.5v10.5c0 1.5-1.5 2.5-3 2.5H14c-1.5 0-3-1-3-2.5z" fill="${HAIR2}"/>`,
    'maedchen-zoepfe': `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${HAIR2}"/>`,
    'maedchen-dutt': `<circle cx="20" cy="7.2" r="4.4" fill="${HAIR2}"/>`,
    'frau': `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v14c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${HAIR2}"/>`,
    'mann': ''
  }[type] || '';
  const front = {
    'maedchen-lang': `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${HAIR}"/><rect x="23.4" y="11.4" width="4.2" height="1.7" rx=".85" fill="#FF7AA8" transform="rotate(-25 25.5 12.2)"/>`,
    'maedchen-zoepfe': `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${HAIR}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
    'maedchen-dutt': `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${HAIR}"/><rect x="17.1" y="9.4" width="5.8" height="1.7" rx=".85" fill="#7FC8F8"/>`,
    'frau': `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${HAIR}"/><circle cx="12.5" cy="21.6" r=".8" fill="#fff"/><circle cx="27.5" cy="21.6" r=".8" fill="#fff"/>`,
    'mann': `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${HAIR}"/>`
  }[type] || '';
  const body = kid ? `<path d="M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z" fill="#111" opacity=".28"/>` : `<path d="M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z" fill="#111" opacity=".28"/>`;
  const face = `<rect x="17" y="23" width="6" height="7" fill="${SKIN}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${SKIN}"/>`;
  const eyes = `<circle cx="17.1" cy="18.6" r="1.05" fill="#3b2a1e"/><circle cx="22.9" cy="18.6" r="1.05" fill="#3b2a1e"/><path d="M17.6 22q2.4 1.9 4.8 0" stroke="#b0613a" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  const cheeks = type !== 'mann' ? `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/>` : '';
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/>${back}${body}${face}${front}${eyes}${cheeks}</svg>`;
};
const avatarBase = (k, size) => (k.avatar && AV_TYPES.includes(k.avatar))
  ? `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarSvg(k.avatar, k.farbe)}</span>`
  : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size * 0.42)}px;color:#161616;flex:none">${esc((k.name || '?').charAt(0).toUpperCase())}</span>`;
// Avatar-Baukasten: 'av:<alter>.<frisur>.<haarfarbe>.<haut>.<extras>'  alter k=Kind e=Erwachsen o=Grosseltern; extras mit + verbunden, 0 = keine
const AV_HC = { blond: ['#EBC55A', '#D4A63B'], braun: ['#8B5A2B', '#6E4520'], schwarz: ['#3A3330', '#26211F'], rot: ['#D2662F', '#A9491E'], grau: ['#CDD1D5', '#A9AEB3'] };
const AV_SK = { hell: '#F3CDA6', mittel: '#E3B48A', oliv: '#C99167', dunkel: '#8D5A3B' };
const AV_HB = {
  long: (c) => `<path d="M10.5 19c0-7.5 4.2-12 9.5-12s9.5 4.5 9.5 12v13c0 2-2 3.5-4 3.5h-11c-2 0-4-1.5-4-3.5z" fill="${c}"/>`,
  zoepfe: (c) => `<ellipse cx="9.6" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/><ellipse cx="30.4" cy="22.5" rx="2.8" ry="5.4" fill="${c}"/>`,
  dutt: (c) => `<circle cx="20" cy="7.2" r="4.4" fill="${c}"/>`,
  bob: (c) => `<path d="M10.8 19c0-7 4-11.5 9.2-11.5s9.2 4.5 9.2 11.5v6.5c0 1.2-1 2-2.2 2H13c-1.2 0-2.2-.8-2.2-2z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="11.5" cy="15" r="3.6"/><circle cx="28.5" cy="15" r="3.6"/><circle cx="10.8" cy="21" r="3.4"/><circle cx="29.2" cy="21" r="3.4"/><circle cx="12" cy="26.5" r="3"/><circle cx="28" cy="26.5" r="3"/></g>`,
  pferd: (c) => `<path d="M26.5 10.5c4.5.5 6.5 5 6 10.5-.4 4.2-2.6 6.4-4.2 7 1-3.4 1.2-7.6-.2-11z" fill="${c}"/>`
};
const AV_HF = {
  long: (c) => `<path d="M11.8 18c.2-6.5 3.8-10.3 8.2-10.3 4.6 0 8.2 3.8 8.2 10.3-2.8-.8-5.6-2.8-7.4-5.6-1.9 3-5.2 5-9 5.6z" fill="${c}"/>`,
  pony: (c) => `<path d="M11.8 17c0-6 3.7-9.6 8.2-9.6s8.2 3.6 8.2 9.6c-1.4-1.6-2.4-2.4-3.4-2.6l-.8 1.6-1.2-1.8-1.4 1.8-1.4-1.8-1.4 1.8-1.2-1.8-.8 1.6c-1.4.3-2.6 1.1-3.8 2.6z" fill="${c}"/>`,
  zoepfe: (c) => `<path d="M11.9 18c-.3-6.5 3.6-10.6 8.1-10.6s8.4 4.1 8.1 10.6c-1.3-2.7-3.5-4.5-6.3-5.2-.6.9-1.2 1.5-1.8 1.9-.6-.4-1.2-1-1.8-1.9-2.8.7-5 2.5-6.3 5.2z" fill="${c}"/><circle cx="10.9" cy="16.8" r="1.7" fill="#FF7AA8"/><circle cx="29.1" cy="16.8" r="1.7" fill="#FF7AA8"/>`,
  dutt: (c) => `<path d="M11.9 18c-.2-6.2 3.6-10.2 8.1-10.2s8.3 4 8.1 10.2c-1.6-2.6-4.4-4.6-8.1-4.6s-6.5 2-8.1 4.6z" fill="${c}"/>`,
  kurz: (c) => `<path d="M12.2 17.5c-.6-6.4 3.3-10.4 7.8-10.4 4.8 0 8.6 3.8 7.9 10.4-.7-2.6-2.2-4.2-3.9-4.8-2.6 1.3-6.7 1.4-9.6.2-1 .9-1.8 2.4-2.2 4.6z" fill="${c}"/>`,
  seite: (c) => `<path d="M12 18c-.4-6.4 3.4-10.4 8-10.4 4.8 0 8.4 3.6 8 9.6-2.4-2.6-6.6-4.6-12.2-4.2-1.4.8-3 2.8-3.8 5z" fill="${c}"/>`,
  stachel: (c) => `<path d="M11.9 17.6l.3-5.2 1.9 1.3.8-4.4 2.1 2.3 1.5-4.6 1.8 4.1 2.2-3.8 1.2 4.4 2.5-2.5.3 4.8 1.6.6c.4 1.2.3 2.2 0 3-1.3-2.4-3.6-3.9-8.2-3.9s-6.8 1.5-8 3.9z" fill="${c}"/>`,
  locken: (c) => `<g fill="${c}"><circle cx="14" cy="11.2" r="3.4"/><circle cx="20" cy="9.2" r="3.6"/><circle cx="26" cy="11.2" r="3.4"/><circle cx="12" cy="15.2" r="2.8"/><circle cx="28" cy="15.2" r="2.8"/></g>`,
  glatze: (c) => `<path d="M12.2 20.5c-.9-2.2-.5-4.6.8-5.6.5 1.9.6 3.6-.8 5.6zM27.8 20.5c.9-2.2.5-4.6-.8-5.6-.5 1.9-.6 3.6.8 5.6z" fill="${c}"/>`
};
const AV_ST = { long: ['long', 'long'], ponylang: ['long', 'pony'], zoepfe: ['zoepfe', 'zoepfe'], dutt: ['dutt', 'dutt'], bob: ['bob', 'pony'], locken: ['locken', 'locken'], pferd: ['pferd', 'seite'], kurz: [null, 'kurz'], seite: [null, 'seite'], stachel: [null, 'stachel'], lockenkurz: [null, 'locken'], glatze: [null, 'glatze'] };
const AV_ACC = {
  brille: () => `<g fill="none" stroke="#2b2b2b" stroke-width=".9"><circle cx="17.1" cy="18.6" r="2.4"/><circle cx="22.9" cy="18.6" r="2.4"/><path d="M19.5 18.4h1"/></g>`,
  bart: (h) => `<path d="M12.8 20.6c.4 4.4 3.4 7.2 7.2 7.2s6.8-2.8 7.2-7.2c-1.4 1.6-3.2 2.4-4.6 2-.8-.3-1.6-.5-2.6-.5s-1.8.2-2.6.5c-1.4.4-3.2-.4-4.6-2z" fill="${h}"/><path d="M17.6 22.6q2.4 1.6 4.8 0" stroke="#7a3b22" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
  held: () => `<path d="M12.3 16.6c2.2-1 5-1 7.7.2 2.7-1.2 5.5-1.2 7.7-.2-.2 2.4-1.6 4-3.6 4-1.6 0-2.8-.8-4.1-2-1.3 1.2-2.5 2-4.1 2-2 0-3.4-1.6-3.6-4z" fill="#D63C3C"/><circle cx="16.8" cy="18.2" r="1.25" fill="#fff"/><circle cx="23.2" cy="18.2" r="1.25" fill="#fff"/><circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>`,
  astro: () => `<circle cx="20" cy="18.6" r="11.6" fill="rgba(170,215,255,.22)" stroke="#E8EEF5" stroke-width="2.2"/><path d="M27.5 9.8l2.6-3.4" stroke="#E8EEF5" stroke-width="1.2"/><circle cx="30.4" cy="6.1" r="1.2" fill="#E06B6B"/>`,
  pirat: () => `<path d="M11.4 15.6c.6-5.2 4-8.4 8.6-8.4s8 3.2 8.6 8.4c-2.6-1.4-5.4-2-8.6-2s-6 .6-8.6 2z" fill="#C0392B"/><circle cx="14.5" cy="11.5" r=".8" fill="#fff"/><circle cx="19" cy="9.8" r=".8" fill="#fff"/><circle cx="24" cy="11" r=".8" fill="#fff"/><path d="M12.4 15.8l15.4 4.8" stroke="#1e1e1e" stroke-width=".8"/><ellipse cx="22.9" cy="18.8" rx="2.1" ry="1.9" fill="#1e1e1e"/>`,
  zauber: () => `<path d="M8.5 13.8c4.5-1.4 18.5-1.4 23 0-1.6-.6-3.4-1.6-4.6-1.8L21.2 1.2l-5.6 10.8c-1.4.2-4.2 1-7.1 1.8z" fill="#5B4FC4"/><circle cx="18.2" cy="8.4" r=".8" fill="#F5C542"/><circle cx="22.4" cy="10.6" r=".6" fill="#F5C542"/><circle cx="20.6" cy="5.4" r=".5" fill="#F5C542"/>`,
  krone: () => `<path d="M12.6 10.8l1.4-5.4 3.1 3.3L20 3.6l2.9 5.1 3.1-3.3 1.4 5.4z" fill="#F5C542"/><circle cx="20" cy="7.8" r=".95" fill="#E06B6B"/><circle cx="15.6" cy="9.3" r=".6" fill="#4FA3E0"/><circle cx="24.4" cy="9.3" r=".6" fill="#4FA3E0"/>`,
  katze: () => `<path d="M11.2 11.6l1.2-6.6 4.6 4.4zM28.8 11.6l-1.2-6.6-4.6 4.4z" fill="#3a3a3a"/><path d="M12.5 9.9l.6-3.2 2.1 2.1zM27.5 9.9l-.6-3.2-2.1 2.1z" fill="#F29A9A"/><path d="M13.4 21.2l-3.2-.6M13.4 22.2l-3.2.4M26.6 21.2l3.2-.6M26.6 22.2l3.2.4" stroke="#555" stroke-width=".5"/><circle cx="20" cy="20.6" r=".7" fill="#E07A8A"/>`,
  einhorn: () => `<path d="M18.5 9.4L20 .9l1.5 8.5z" fill="#F5C542"/><path d="M18.9 7.6l2.3-.7M19.3 5.2l1.7-.5M19.7 3l1-.3" stroke="#D99A2B" stroke-width=".55"/><circle cx="14.6" cy="9.6" r="1.5" fill="#FF7AA8"/><circle cx="25.4" cy="9.6" r="1.5" fill="#B69CF2"/>`,
  cap: () => `<path d="M11.6 15.2c.4-5.2 4-8.2 8.4-8.2s8 3 8.4 8.2z" fill="#3E7CC9"/><path d="M19 14.4c4.2 0 8.4.4 12.2 1.6-.6.9-2.1 1.1-3.9 1-2.8-.4-5.5-.6-8.3-.6z" fill="#2F64A6"/><circle cx="20" cy="7.4" r=".9" fill="#2F64A6"/>`,
  kopfhoerer: () => `<path d="M10.4 19.5c0-6.4 4.2-10.6 9.6-10.6s9.6 4.2 9.6 10.6" fill="none" stroke="#333" stroke-width="1.7"/><rect x="8.6" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/><rect x="27.8" y="17.6" width="3.6" height="5.8" rx="1.6" fill="#E06B6B"/>`,
  schleife: () => `<path d="M24.6 9.6l3.8-2.2v4.4zM24.6 9.6l-3.8-2.2v4.4z" fill="#FF7AA8"/><circle cx="24.6" cy="9.6" r="1.1" fill="#E0568A"/>`
};
const avatarGen = (code, bg) => {
  const [age, st, hc, sk, acc] = String(code).split('.');
  const [h1, h2] = AV_HC[hc] || AV_HC.blond; const skin = AV_SK[sk] || AV_SK.hell;
  const [bk, fr] = AV_ST[st] || [null, 'kurz']; const kid = age === 'k';
  const ex = acc && acc !== '0' ? acc.split('+') : [];
  const body = kid ? 'M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z' : 'M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z';
  let s = `<rect width="40" height="40" fill="${bg}"/>`;
  if (bk) s += AV_HB[bk](h2);
  s += ex.includes('astro') ? `<path d="${body}" fill="#E8EEF5"/>` : ex.includes('held') ? `<path d="${body}" fill="#C0392B"/><path d="M20 32.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#F5C542"/>` : `<path d="${body}" fill="#111" opacity=".28"/>`;
  s += `<rect x="17" y="23" width="6" height="7" fill="${skin}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${skin}"/>`;
  if (fr) s += AV_HF[fr](h1);
  if (age === 'o') s += '<path d="M14.6 15.4h1.8M23.6 15.4h1.8M15.4 21.6l-.8.6M24.6 21.6l.8.6" stroke="#9a6a4a" stroke-width=".5"/>';
  s += '<circle cx="17.1" cy="18.6" r="1.05" fill="#3b2a1e"/><circle cx="22.9" cy="18.6" r="1.05" fill="#3b2a1e"/>';
  if (!ex.includes('bart')) s += '<path d="M17.6 22q2.4 1.9 4.8 0" stroke="#b0613a" stroke-width="1" fill="none" stroke-linecap="round"/>';
  if (kid || ['long', 'ponylang', 'zoepfe', 'dutt', 'bob', 'locken', 'pferd'].includes(st)) s += '<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity=".55"/>';
  ex.forEach((a) => { if (AV_ACC[a]) s += AV_ACC[a](h2); });
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
};
// Termin-Zeit kurz: "14:30–15:20" bzw. schmal "14:30–15"
const evRange = (e, short) => {
  if (e.allDay) return short ? 'all day' : 'all day';
  const t = (x) => (short && !x.getMinutes() ? String(x.getHours()) : pad(x.getHours()) + ':' + pad(x.getMinutes()));
  return `${t(e.s)}–${t(e.e)}`;
};
// Bild einer Person: k.bild = 'av:<code>' (Baukasten), 'svg:<portrait>' oder 'mdi:<icon>' (aus den Einstellungen), sonst k.avatar aus der Kartenkonfig
const avatarHtml = (k, size) => {
  const b = k.bild || '';
  if (b.startsWith('img:')) return `<img src="${esc(b.slice(4))}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:none;display:inline-block">`;
  if (b.startsWith('av:')) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${avatarGen(b.slice(3), k.farbe)}</span>`;
  if (b.startsWith('mdi:')) return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${k.farbe};display:inline-flex;align-items:center;justify-content:center;flex:none;color:#161616"><ha-icon icon="${esc(b)}" style="--mdc-icon-size:${Math.round(size * 0.6)}px"></ha-icon></span>`;
  if (b.startsWith('svg:')) return avatarBase({ ...k, avatar: b.slice(4) }, size);
  return avatarBase(k, size);
};
const daysLabel = (t) => {
  const s = [...(t || [])].sort((a, b) => a - b).join(',');
  if (s === '1,2,3,4,5,6,7') return 'Daily';
  if (s === '1,2,3,4,5') return 'Weekdays';
  if (s === '6,7') return 'Weekend';
  return (t || []).length ? [...t].sort((a, b) => a - b).map((d) => WD[d - 1]).join(', ') : 'Never';
};

class FpBase extends HTMLElement {
  setConfig(config) {
    this._cfg = this._normalize(config || {});
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._bind(); }
    this._teardown();
    this._data = {};
    this._render(true);
    this._ensure();
  }
  set hass(h) { this._hass = h; this._ensure(); }
  get hass() { return this._hass; }
  connectedCallback() { this._ensure(); }
  disconnectedCallback() { this._teardown(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', min_rows: 6 }; }
  _teardown() {
    (this._unsubs || []).forEach((p) => p.then((u) => u && u()).catch(() => {}));
    this._unsubs = null;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
  _ensure() {
    if (!this._hass || !this._cfg || !this.isConnected || this._unsubs) return;
    this._unsubs = this._lists().map(([key, ent]) => this._hass.connection.subscribeMessage(
      (m) => { this._data[key] = m.items || []; this._render(); },
      { type: 'todo/item/subscribe', entity_id: ent }
    ).catch((e) => { this._err = `${ent}: ${(e && e.message) || e}`; this._render(); }));
    if (this._started) this._started();
  }
  _kids() {
    const list = (this._cfg.kinder || []).map((k) => (typeof k === 'string' ? { name: k } : { ...k }));
    const names = new Set(list.map((k) => k.name));
    for (const p of this._data.plan || []) {
      for (const k of Object.keys(planZ(parseDesc(p.description)))) { if (k && !names.has(k)) { names.add(k); list.push({ name: k }); } }
    }
    const ps = this._settingsP();
    return list.map((k, i) => { const o = ps[k.name] || {}; return { ...k, ...(o.bild ? { bild: o.bild } : {}), alias: [...new Set([...(k.alias || []), ...(o.alias || [])])], farbe: o.farbe || k.farbe || PALETTE[i % PALETTE.length] }; });
  }
  _settingsItem() { return ((this._data && this._data.settings) || []).find((i) => i.summary === 'Personen') || null; }
  _settingsP() { const it = this._settingsItem(); const m = it ? parseDesc(it.description) : {}; return (m && m.p) || {}; }
  _call(domain, service, data, entity) {
    return this._hass.callService(domain, service, data, entity ? { entity_id: entity } : undefined);
  }
}

/* ============================ WOCHENPLANER ============================ */
class LoxWochenplanerCard extends FpBase {
  _normalize(c) {
    return { plan: 'todo.amtli_plan', heute: 'todo.amtli_heute', verlauf: 'todo.amtli_verlauf', einstellungen: 'todo.familienplaner_einstellungen', kalender: [], kinder: [], tage_zuverlaessigkeit: 30, titel: 'Familienplaner', ...c };
  }
  _lists() { return [['plan', this._cfg.plan], ['heute', this._cfg.heute], ['verlauf', this._cfg.verlauf], ['settings', this._cfg.einstellungen]]; }
  _bind() {
    this._week = 0; this._events = []; this._tick = 0;
    try { this._mode = localStorage.getItem('fp_mode') || 'alle'; } catch (e) { this._mode = 'alle'; }
    this.shadowRoot.addEventListener('click', (e) => this._onClick(e));
  }
  _started() {
    this._lastDay = ymd(fpDay());
    this._fetchEvents();
    this._timer = setInterval(() => {
      this._tick++;
      const t = ymd(fpDay());
      if (t !== this._lastDay || this._tick % 20 === 0) { this._lastDay = t; this._fetchEvents(); }
      this._render();
    }, 30000);
  }
  _weekStart() { const t = startOfDay(fpDay()); return addDays(addDays(t, 1 - isoWd(t)), this._week * 7); }
  _calendars() {
    return (this._cfg.kalender || []).map((c) => (typeof c === 'string' ? { entity: c } : { ...c })).map((c, i) => {
      const st = this._hass && this._hass.states[c.entity];
      // Farbe des Kalenders = Farbe der Person, der er gehört
      const pk = c.person ? this._kids().find((x) => x.name === c.person) : null;
      return { ...c, farbe: (pk && pk.farbe) || c.farbe || CALCOL[i % CALCOL.length], name: c.name || (st ? st.attributes.friendly_name : c.entity) };
    });
  }
  async _fetchEvents() {
    const cals = this._calendars();
    if (!cals.length || !this._hass) { this._events = []; return; }
    const ws = this._weekStart(); const we = addDays(ws, 7); const res = [];
    await Promise.all(cals.map(async (c) => {
      try {
        const ev = await this._hass.callApi('GET', `calendars/${c.entity}?start=${encodeURIComponent(ws.toISOString())}&end=${encodeURIComponent(we.toISOString())}`);
        for (const e of ev || []) {
          const allDay = !!(e.start && e.start.date && !e.start.dateTime);
          const s = allDay ? new Date(e.start.date + 'T00:00:00') : new Date(e.start.dateTime || e.start);
          const en = allDay ? new Date(e.end.date + 'T00:00:00') : new Date((e.end && (e.end.dateTime || e.end)) || s);
          res.push({ title: e.summary || '', loc: e.location || '', s, e: en > s ? en : new Date(s.getTime() + 60000), allDay, c });
        }
      } catch (err) { /* Kalender nicht erreichbar */ }
    }));
    this._events = res; this._render();
  }
  _syncCal() {
    const ents = this._calendars().map((c) => c.entity);
    if (!ents.length || this._syncing || !this._hass) return;
    this._syncing = true; this._render();
    this._call('homeassistant', 'update_entity', { entity_id: ents }).catch(() => {})
      .finally(() => setTimeout(() => { this._syncing = false; this._fetchEvents(); }, 2500));
  }
  _history() {
    const h = {};
    for (const it of this._data.verlauf || []) {
      const m = parseDesc(it.description);
      const day = h[it.summary] || (h[it.summary] = { s: {}, x: [] });
      for (const [k, done, tot] of m.s || []) { const c = day.s[k] || [0, 0]; day.s[k] = [c[0] + done, c[1] + tot]; }
      for (const x of m.x || []) day.x.push(x);
    }
    return h;
  }
  _stats(kid, h, today, todayDone, todayTot) {
    // [erledigt, total] der letzten n Tage + heute bereits erledigte
    const sum = (n) => { let d = todayDone, t = todayDone; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s) { d += s[0]; t += s[1]; } } return [d, t]; };
    const w = sum(7), m = sum(30), all = sum(this._cfg.tage_zuverlaessigkeit);
    const done = all[0], tot = all[1];
    let streak = todayTot && todayDone === todayTot ? 1 : 0;
    for (let i = 1; i <= 120; i++) {
      const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid];
      if (!s || !s[1]) continue;
      if (s[0] === s[1]) streak++; else break;
    }
    return { pct: tot ? Math.round((done / tot) * 100) : 100, start: !tot, streak, w, m };
  }
  // Auszeichnungen aus dem Verlauf (wandern je nach Leistung zwischen den Personen)
  _awards(kids, pre) {
    const A = {}; kids.forEach((k) => { A[k.name] = []; });
    const rate = (x) => (x[1] ? x[0] / x[1] : -1); const pc = (x) => Math.round(rate(x) * 100);
    const best = (key, minTot) => {
      const c = kids.filter((k) => pre[k.name][key][1] >= minTot); if (!c.length) return [];
      const top = Math.max(...c.map((k) => rate(pre[k.name][key]))); const c2 = c.filter((k) => rate(pre[k.name][key]) === top);
      const td = Math.max(...c2.map((k) => pre[k.name][key][0])); return c2.filter((k) => pre[k.name][key][0] === td).map((k) => k.name);
    };
    best('w', 3).forEach((n) => A[n].push({ id: 'krone', icon: 'mdi:crown', c: '#F5C542', t: 'Crown of the week', why: `Best rate of the last 7 days: ${pre[n].w[0]} of ${pre[n].w[1]} chores (${pc(pre[n].w)} %).` }));
    best('m', 10).forEach((n) => A[n].push({ id: 'pokal', icon: 'mdi:trophy', c: '#E0A84F', t: 'Trophy of the month', why: `Best rate of the last 30 days: ${pre[n].m[0]} of ${pre[n].m[1]} chores (${pc(pre[n].m)} %).` }));
    const maxDone = Math.max(0, ...kids.map((k) => pre[k.name].w[0]));
    const fl = kids.filter((k) => maxDone >= 5 && pre[k.name].w[0] === maxDone);
    if (fl.length === 1) A[fl[0].name].push({ id: 'fleiss', icon: 'mdi:bee', c: '#F5C542', t: 'Busy bee', why: `Most chores done: ${maxDone} in the last 7 days.` });
    kids.forEach((k) => {
      const s = pre[k.name];
      if (s.w[1] >= 5 && s.w[0] === s.w[1]) A[k.name].push({ id: 'perfekt', icon: 'mdi:star-four-points', c: '#69C350', t: 'Perfect week', why: `All ${s.w[1]} chores of the last 7 days done.` });
      if (s.streak >= 3) A[k.name].push({ id: 'serie', icon: 'mdi:fire', c: '#E06B6B', t: `${s.streak}-day streak`, why: `All chores done ${s.streak} days in a row.` });
      if (s.start) A[k.name].push({ id: 'start', icon: 'mdi:rocket-launch', c: '#4FA3E0', t: 'Starter bonus', why: 'No finished chore days yet – you start at 100 %. Keep it up!' });
    });
    return A;
  }
  _detailHtml(kids, pre, awards) {
    const k = kids.find((x) => x.name === this._detail); if (!k) return '';
    const s = pre[k.name]; const lv = level(s.pct); const aw = awards[k.name] || [];
    const q = (x) => (x[1] ? `${x[0]} / ${x[1]} <small>(${Math.round((x[0] / x[1]) * 100)} %)</small>` : '<small>none yet</small>');
    const holders = (id) => kids.filter((x) => (awards[x.name] || []).some((a) => a.id === id)).map((x) => x.name).join(', ') || 'nobody yet';
    const RULES = [['mdi:crown', '#F5C542', 'Crown of the week', 'Best rate of the last 7 days (at least 3 chores).', 'krone'], ['mdi:trophy', '#E0A84F', 'Trophy of the month', 'Best rate of the last 30 days (at least 10 chores).', 'pokal'], ['mdi:bee', '#F5C542', 'Busy bee', 'Most chores done in the last 7 days (at least 5).', 'fleiss'], ['mdi:star-four-points', '#69C350', 'Perfect week', 'All chores of the last 7 days done (at least 5).', 'perfekt'], ['mdi:fire', '#E06B6B', 'Streak', 'Everything done at least 3 days in a row.', 'serie'], ['mdi:rocket-launch', '#4FA3E0', 'Starter bonus', 'Newcomers start at 100 %.', 'start']];
    return `<div class="ovl" data-close><div class="pnl" data-keep>
      <div class="ph"><div class="ring bigr">${avatarHtml(k, 64)}${aw.some((a) => a.id === 'krone') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}<span class="rib" style="--rc:${lv.c}">${s.pct}%</span></div>
        <div class="phn"><div class="pn2">${esc(k.name)}</div><div class="lv" style="color:${lv.c}">${s.start ? 'Starter bonus' : lv.t} · Reliability ${s.pct} %</div></div>
        <button class="nb" data-x><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="kp"><div><span>Last 7 days</span><b>${q(s.w)}</b></div><div><span>Last 30 days</span><b>${q(s.m)}</b></div><div><span>Streak</span><b>${s.streak} ${s.streak === 1 ? 'day' : 'days'}</b></div></div>
      <div class="sec2">Awards</div>
      ${aw.length ? aw.map((a) => `<div class="aw"><span class="md lg" style="--mc:${a.c}"><ha-icon icon="${a.icon}"></ha-icon></span><div><b>${esc(a.t)}</b><div>${esc(a.why)}</div></div></div>`).join('') : '<div class="aw0">No award yet – do your chores and win the crown!</div>'}
      <div class="sec2">How to earn awards</div>
      ${RULES.map(([ic, c, t, d, id]) => `<div class="rl2"><span class="md" style="--mc:${c}"><ha-icon icon="${ic}"></ha-icon></span><b>${t}</b><span>${d}</span>${['krone', 'pokal', 'fleiss'].includes(id) ? `<em>now: ${esc(holders(id))}</em>` : ''}</div>`).join('')}
    </div></div>`;
  }
  _planFor(kid, date) {
    if (((this._cfg.abwesend || {})[kid] || []).includes(ymd(date))) return [];
    const wd = isoWd(date);
    return (this._data.plan || []).map((p) => ({ t: p.summary, m: parseDesc(p.description) }))
      .filter((p) => (planZ(p.m)[kid] || []).includes(wd) && planActive(p.m, kid, wd, date)).map((p) => { const f = (p.m.f || {})[`${kid}|${wd}`] || 1; return f > 1 ? `${p.t} (until ${WD[(wd - 1 + f - 1) % 7]})` : p.t; }).sort((a, b) => a.localeCompare(b, 'de'));
  }
  _onClick(e) {
    if (e.target.closest('[data-x]')) { this._detail = null; this._render(); return; }
    if (e.target.closest('[data-keep]')) return;
    if (e.target.closest('[data-close]')) { this._detail = null; this._render(); return; }
    const pp = e.target.closest('[data-person]');
    if (pp) { this._detail = pp.dataset.person; clearTimeout(this._dT); this._dT = setTimeout(() => { this._detail = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 30) * 1000); this._render(); return; }
    const b = e.target.closest('.btn');
    if (b && this._hass) {
      const done = b.classList.contains('done');
      b.classList.toggle('done');
      this._call('todo', 'update_item', { item: b.dataset.uid, status: done ? 'needs_action' : 'completed' }, this._cfg.heute).catch(() => this._render());
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { fpNavigate(go.dataset.go); return; }
    const md = e.target.closest('[data-mode]');
    if (md) { this._mode = md.dataset.mode; try { localStorage.setItem('fp_mode', this._mode); } catch (er) { /* ignorieren */ } this._render(); return; }
    if (e.target.closest('[data-sync]')) { this._syncCal(); return; }
    if (e.target.closest('[data-todos]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true })); return; }
    const fc = e.target.closest('[data-focus]');
    if (fc) {
      const v = fc.dataset.focus; this._focus = v === ymd(fpDay()) ? null : v;
      clearTimeout(this._fT); if (this._focus) this._fT = setTimeout(() => { this._focus = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
      this._render(); return;
    }
    const n = e.target.closest('[data-nav]');
    if (n) { const v = n.dataset.nav; this._focus = null; this._week = v === '0' ? 0 : this._week + Number(v); this._events = []; this._render(); this._fetchEvents(); }
  }
  _render() {
    if (!this.shadowRoot || !this._cfg) return;
    const now = new Date(); const today = startOfDay(fpDay()); const tStr = ymd(today);
    const ws = this._weekStart(); const days = [...Array(7)].map((_, i) => addDays(ws, i));
    const kids = this._kids(); const h = this._history(); const cals = this._calendars();
    // Termine immer mit der aktuellen Farbe der Kalender-Besitzerin/des Besitzers anzeigen
    this._events.forEach((e) => { const cc = cals.find((x) => x.entity === e.c.entity); if (cc) e.c = cc; });
    // Termin-Zuordnung: Name im Titel (z. B. "Lea Turnen") -> bei dieser Person; sonst beim Kalender-Besitzer
    const nameRe = (n) => new RegExp('(^|[^\\p{L}])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?(?![\\p{L}])', 'iu');
    const kRes = kids.flatMap((x) => [x.name, ...(x.alias || [])].map((a) => [x.name, nameRe(a)]));
    const evWho = new Map(this._events.map((e) => {
      if (e.c.schule) return [e, e.c.person ? [e.c.person] : []];
      const hit = this._cfg.termine_nach_namen === false ? [] : [...new Set(kRes.filter(([, re]) => re.test(e.title)).map(([n]) => n))];
      const own = e.c.person ? [e.c.person] : [];
      return [e, hit.length ? (this._cfg.auch_beim_besitzer ? [...new Set([...hit, ...own])] : hit) : own];
    }));
    const alle = (this._data.heute || []).map((i) => ({ ...i, m: parseDesc(i.description) }));
    const heute = alle.filter((i) => (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= tStr);
    const focus = (this._focus && days.some((d) => ymd(d) === this._focus)) ? this._focus : (days.some((d) => ymd(d) === tStr) ? tStr : null);
    // Spaltenbreiten: xl = heute/angetippt, m = morgen (und heute, wenn ein anderer Tag angetippt ist), s = alle anderen Tage.
    // In den Ansichten Ämtli/Termine bleiben die nächsten 2 Tage und das Wochenende mittel.
    const T = {}; const curWeek = days.some((d) => ymd(d) === tStr); const allMode = (this._mode || 'alle') === 'alle';
    days.forEach((d) => {
      const s = ymd(d); const diff = Math.round((startOfDay(d) - today) / 86400000); const we = isoWd(d) >= 6;
      T[s] = s === focus ? 'xl' : !curWeek ? 'm' : allMode ? ((s === tStr || diff === 1) ? 'm' : 's')
        : (s === tStr || we || (diff > 0 && diff <= 2)) ? 'm' : 's';
    });
    const cols = days.map((d) => (T[ymd(d)] === 's' ? (allMode && curWeek ? 'minmax(0,0.42fr)' : startOfDay(d) < today ? 'minmax(0,0.4fr)' : 'minmax(0,0.6fr)')
      : ({ xl: allMode && curWeek ? 'minmax(0,4.6fr)' : 'minmax(0,3.6fr)', m: allMode && curWeek ? 'minmax(0,1.5fr)' : 'minmax(0,1.15fr)' })[T[ymd(d)]])).join(' ');
    const we = days[6];

    const legCals = cals.filter((c) => !c.schule);
    const head = `<div class="corner">${legCals.length ? `<div class="leg">${legCals.map((c) => `<span class="lgi"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')}</div>` : ''}<span>Tap a day for details</span></div>` + days.map((d) => {
      const t = ymd(d) === tStr;
      return `<div class="hd${t ? ' t' : ''}${ymd(d) === focus ? ' fx' : ''} ts-${T[ymd(d)]}" data-focus="${ymd(d)}">${WD[isoWd(d) - 1]}${t ? ' · Today' : ''}<b>${d.getDate()}.</b></div>`;
    }).join('');

    const calLabel = legCals.length
      ? legCals.map((c) => `<span class="cl"><i style="background:${c.farbe}"></i>${esc(c.name)}</span>`).join('')
      : '<span class="cl">no calendar</span>';
    const termine = `<div class="lab syn${this._syncing ? ' spin' : ''}" data-sync title="Sync calendars now"><div class="ic"><ha-icon icon="${this._syncing ? 'mdi:sync' : 'mdi:calendar-sync-outline'}"></ha-icon></div><div class="lt"><div class="nm">Events</div><div class="cls">${calLabel}</div></div></div>` +
      days.map((d) => {
        const ds = startOfDay(d), de = addDays(ds, 1);
        const evs = this._events.filter((e) => !(evWho.get(e) || []).length && e.s < de && e.e > ds).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const t = ymd(d) === tStr;
        const shown = evs.slice(0, ymd(d) === focus ? 6 : 2);
        return `<div class="c ev-c${t ? ' t' : ''}">${shown.map((e) => `<div class="ev${ymd(d) === focus ? ' w' : ''}" style="border-color:${e.c.farbe}">${evTime(e, ymd(d) === focus)}${ymd(d) === focus ? '<br>' : ''}${esc(e.title)}</div>`).join('')}${evs.length > shown.length ? `<div class="more">+${evs.length - shown.length} more</div>` : ''}</div>`;
      }).join('');

    const pre = {};
    kids.forEach((k) => { const mi = heute.filter((i) => i.m.k === k.name); pre[k.name] = this._stats(k.name, h, today, mi.filter((i) => i.status === 'completed').length, mi.length); });
    const awards = this._awards(kids, pre);
    // timetable view: only persons with a timetable
    const rowKids = (this._mode || 'alle') === 'schule' ? kids.filter((x) => (this._cfg.schule || {})[x.name]) : kids;
    const rows = rowKids.map((k) => {
      const mine = heute.filter((i) => i.m.k === k.name).sort((a, b) => a.summary.localeCompare(b.summary, 'de'));
      const tDone = mine.filter((i) => i.status === 'completed').length;
      const st = pre[k.name]; const aw = awards[k.name] || [];
      const lv = level(st.pct); const C = 2 * Math.PI * 24;
      const label = `<div class="lab" data-person="${esc(k.name)}" style="box-shadow:inset 3px 0 0 ${k.farbe}">
          <div class="ring"><span class="ava">${avatarHtml(k, 48)}</span>${aw.some((a) => a.id === 'krone') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>
          <div class="lt"><div class="nm">${esc(k.name)}</div><div class="lv2"><span class="rib2" style="--rc:${lv.c}">${st.pct}%</span>${aw.map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}</div>
          </div>
          </div>`;
      const injectEv = (d, html) => {
        const dS = startOfDay(d), dE = addDays(dS, 1); const tr = T[ymd(d)]; const wide = tr === 'xl'; const mx = wide ? 5 : 3;
        const pevAll = this._events.filter((e) => (evWho.get(e) || []).includes(k.name) && e.s < dE && e.e > dS).sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        // school: lessons from the school calendar, else fixed times; condensed to leave / start–end / home
        const sc = (this._cfg.schule || {})[k.name]; const awayD = ((this._cfg.abwesend || {})[k.name] || []).includes(ymd(d));
        const hm = (x) => pad(x.getHours()) + ':' + pad(x.getMinutes());
        const at = (t) => { const x = new Date(dS); const [hh, mm] = t.split(':').map(Number); x.setHours(hh, mm, 0, 0); return x; };
        const schoolC = { farbe: k.farbe, name: 'School', schule: true };
        let lessons = awayD ? [] : pevAll.filter((e) => e.c.schule && !e.allDay);
        if (!awayD && !lessons.length && sc && sc.zeiten && sc.zeiten[isoWd(d)]) {
          const zz = sc.zeiten[isoWd(d)]; const spans = typeof zz[0] === 'string' ? [zz] : zz;
          lessons = spans.map((z) => ({ title: 'School', s: at(z[0]), e: at(z[1]), allDay: false, c: schoolC }));
        }
        // blocks: a long break (time to go home and back) splits the day, e.g. morning + afternoon with lunch at home
        const wg = (sc && sc.weg) || 0; const gapMin = Number(this._cfg.schulpause) > 0 ? Number(this._cfg.schulpause) : Math.max(45, 2 * wg + 15); const blocks = [];
        [...lessons].sort((a, b) => a.s - b.s).forEach((e) => {
          const lb = blocks[blocks.length - 1];
          if (lb && (e.s - lb.e) / 60000 < gapMin) { if (e.e > lb.e) lb.e = e.e; } else blocks.push({ s: e.s, e: e.e });
        });
        // a school block shows up only from X min before leaving until X min after being home (setting, 0 = always)
        const win = Number(this._cfg.schulfenster) || 0;
        const blockEvs = blocks.filter((bk) => !win || (now >= new Date(bk.s - (wg + win) * 60000) && now <= new Date(+bk.e + (wg + win) * 60000)))
          .map((bk) => ({ title: wg ? `🎒 leave ${hm(new Date(bk.s - wg * 60000))} · home ${hm(new Date(+bk.e + wg * 60000))}` : '🎒 School',
          s: new Date(bk.s), e: new Date(bk.e), allDay: false, c: schoolC }));
        const rest = pevAll.filter((e) => !e.c.schule);
        const mode0 = this._mode || 'alle';
        // blocks only in "all"; the calendar view shows appointments without school; the timetable shows every lesson
        const detail = lessons.map((e) => ({ ...e, title: e.loc ? `${e.title} · ${e.loc}` : e.title }));
        const pev = mode0 === 'schule' ? detail : mode0 === 'termine' ? rest : [...blockEvs, ...rest].sort((a, b) => (b.allDay - a.allDay) || (a.s - b.s));
        const mode = mode0 === 'schule' ? 'termine' : mode0;
        if (mode === 'aemtli') return html;
        const open = (html.match(/^<div[^>]*>/) || [''])[0];
        if (!pev.length) return mode === 'termine' ? open + '<div class="none">–</div></div>' : html;
        if (tr === 's') { const evn = `<div class="evn">${pev.slice(0, 4).map((e) => `<i style="background:${e.c.farbe}"></i>`).join('')}<b>${pev.length}</b></div>`; return mode === 'termine' ? open + evn + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evn); }
        const lim = mode === 'termine' ? (wide ? 12 : 6) : mx;
        const evh = `<div class="pev ${wide ? 'xl' : 'mid'}">${pev.slice(0, lim).map((e) => `<div class="ev one" style="border-color:${e.c.farbe}"><span class="et">${esc(e.title)}</span><span class="tm">${evRange(e, !wide)}</span><span class="src" style="background:${e.c.farbe}" title="Calendar ${esc(e.c.name)}">${wide ? esc(e.c.name) : esc((e.c.name || '?').charAt(0).toUpperCase())}</span></div>`).join('')}${pev.length > lim ? `<div class="more">+${pev.length - lim} more</div>` : ''}</div>`;
        return mode === 'termine' ? open + evh + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evh);
      };
      const cells = days.map((d) => injectEv(d, ((d) => {
        const ds = ymd(d);
        if (((this._cfg.abwesend || {})[k.name] || []).includes(ds) && !(ds === tStr && mine.length)) {
          return `<div class="c ${ds < tStr ? 'p' : ds === tStr ? 't' : 'f'} vac${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="vc"><ha-icon icon="mdi:palm-tree"></ha-icon>${T[ds] === 's' ? '' : '<span>Holiday</span>'}</div></div>`;
        }
        if (ds === tStr && ds !== focus) {
          return mine.length ? `<div class="c t" data-focus="${ds}"><div class="fc"><b>${tDone}/${mine.length}</b></div><div class="bar"><i style="width:${Math.round((tDone / mine.length) * 100)}%;background:${G}"></i></div></div>` : `<div class="c t" data-focus="${ds}"></div>`;
        }
        if (ds === tStr) {
          if (!mine.length) return '<div class="c t"></div>';
          const all = tDone === mine.length;
          return `<div class="c t"><div class="prog"><span>${tDone} of ${mine.length} done</span>${all ? '<span class="gr">Great!</span>' : ''}</div><div class="bg">` +
            mine.map((i) => `<button class="btn${i.status === 'completed' ? ' done' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span><span class="bt">${esc(i.summary)}${dueTag(i.m, tStr)}</span></button>`).join('') + `</div></div>`;
        }
        if (ds < tStr) {
          const s = h[ds] && h[ds].s[k.name];
          if (!s || !s[1]) return `<div class="c p${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="none">–</div></div>`;
          const pct = Math.round((s[0] / s[1]) * 100); const col = pct === 100 ? G : pct >= 50 ? '#E0A84F' : '#E06B6B';
          if (T[ds] === 's') return `<div class="c p sm" data-focus="${ds}"><div class="pst" style="--pc:${col}">${s[0]}/${s[1]}</div></div>`;
          const miss = h[ds].x.filter((x) => x[0] === k.name).map((x) => x[1]);
          return `<div class="c p${ds === focus ? ' fx' : ''}" data-focus="${ds}"><div class="big">${s[0]}<small> / ${s[1]}</small></div><div class="bar"><i style="width:${pct}%;background:${col}"></i></div>` +
            (pct === 100 ? `<div class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${ds === focus ? 'All done' : ''}</div>` : (ds === focus ? miss.map((m) => `<div class="miss">✕ ${esc(m)}</div>`).join('') : `<div class="miss">✕ ${miss.length}</div>`)) + `</div>`;
        }
        const pl = this._planFor(k.name, d);
        const opl = alle.filter((i) => i.m.k === k.name && i.status !== 'completed' && (i.m.d || '') <= tStr && (i.m.e || i.m.d || '') >= ds);
        if (T[ds] !== 's') {
          const lim = ds === focus ? 99 : 4;
          const op = opl.map((i) => `<div class="pl op">⏳ ${esc(i.summary)}</div>`).join('');
          return `<div class="c f${ds === focus ? ' fx' : ''}" data-focus="${ds}">${op}${pl.length ? pl.slice(0, lim).map((p) => `<div class="pl">${esc(p)}</div>`).join('') + (pl.length > lim ? `<div class="more">+${pl.length - lim} more</div>` : '') : ''}</div>`;
        }
        return `<div class="c f" data-focus="${ds}">${pl.length ? `<div class="fc"><b>${pl.length}</b>chores</div>` : ''}${opl.length ? `<div class="opn">⏳ ${opl.length} open</div>` : ''}</div>`;
      })(d))).join('');
      return label + cells;
    }).join('');

    const empty = !kids.length ? `<div class="emptyk">No chores planned yet – add them under "Chore plan".</div>` : '';

    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:14px 16px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
      .top{display:flex;align-items:center;gap:16px;margin-bottom:8px;flex-wrap:wrap}
      .clock{font-size:38px;font-weight:200;color:${G};line-height:1;font-variant-numeric:tabular-nums}
      .date{font-size:24px;font-weight:300}.date b{font-weight:600}
      .sub{font-size:12px;color:var(--fp-text3,#7a7a7a);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px}
      .nav{margin-left:auto;display:flex;align-items:center;gap:8px}
      .nb{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);color:var(--fp-text,#ddd);border-radius:10px;height:42px;min-width:42px;padding:0 14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;font-size:14px;-webkit-tap-highlight-color:transparent}
      .nb ha-icon{--mdc-icon-size:22px}.nb.td{gap:6px}.tdn{background:${G};color:var(--fp-on-accent,#141414);border-radius:10px;padding:0 7px;font-size:12px;line-height:20px}.nb.g{color:${G};border-color:color-mix(in srgb,var(--fp-accent) 50%,transparent)}
      .wk{font-size:12px;color:var(--fp-text3,#8a8a8a);padding:0 8px;text-align:center;min-width:150px}.wk b{display:block;color:var(--fp-text,#ececec);font-size:15px;font-weight:600}
      .grid{display:grid;grid-template-columns:178px ${cols};gap:5px;align-items:stretch}
      .corner{font-size:10px;color:var(--fp-text3,#555);display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:6px;padding:0 4px 6px}
      .corner .leg{background:none;padding:0;margin:0;gap:4px 10px}.corner .lgi{font-size:12px}
      .pev.mid .src{display:none}
      .hd{padding:4px 10px 6px;font-size:11px;color:var(--fp-text3,#8a8a8a);text-transform:uppercase;letter-spacing:1px}
      .hd{cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.hd.fx{background:var(--fp-bg3,#262626)}
      .hd b{display:block;font-size:18px;color:var(--fp-text,#e5e5e5);font-weight:300;letter-spacing:0;text-transform:none;margin-top:2px}
      .hd.t,.hd.t b{color:${G}}.hd.t b{font-weight:500}
      .c{background:var(--fp-bg3,#262626);border-radius:10px;padding:8px;min-height:56px;min-width:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .c.fx{box-shadow:inset 0 0 0 1px #4a4a4a;background:var(--fp-bg3,#2a2a2a)}
      .c.t{background:var(--fp-bg3,#2a2a2a);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .ev-c{min-height:38px}
      .syn{cursor:pointer;-webkit-tap-highlight-color:transparent}.syn:active{background:var(--fp-bg3,#2a2a2a)}
      .spin .ic ha-icon,.spin2 ha-icon{animation:fpspin 1s linear infinite}
      .pev{margin-bottom:6px;display:flex;flex-direction:column;gap:3px}.pev .ev{margin-top:0}
      .pev.sm .ev{font-size:10px;padding:2px 4px 2px 5px}
      .ev .du{color:var(--fp-text3,#8a8a8a);font-weight:400;margin-right:5px}
      .src{display:inline-block;font-size:9px;font-weight:700;color:var(--fp-on-accent,#141414);border-radius:6px;padding:0 5px;margin-right:5px;line-height:15px;vertical-align:1px;white-space:nowrap}
      .leg{display:flex;align-items:center;gap:12px;margin-left:auto;background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 14px;flex-wrap:wrap}
      .leg + .nav{margin-left:0}
      .lgt{font-size:10px;color:var(--fp-text3,#666);text-transform:uppercase;letter-spacing:1px}
      .tnav{display:flex;gap:6px;margin-left:auto}.tnav + .seg{margin-left:0}
      .seg{display:flex;background:var(--fp-bg2,#232323);border-radius:10px;padding:3px;gap:2px;margin-left:auto}.seg + .leg{margin-left:0}
      .seg button{background:transparent;border:none;color:var(--fp-text2,#999);font:inherit;font-size:13px;padding:0 13px;height:36px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}.seg button.on{background:var(--fp-bg4,#3a3a3a);color:var(--fp-text,#fff);font-weight:600}
      .ev.one{display:flex;align-items:center;gap:6px;white-space:nowrap}.ev.one .et{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:block}
      .ev.one .tm{flex:none;color:var(--fp-text2,#9a9a9a);font-size:.9em;font-variant-numeric:tabular-nums}.ev.one .src{flex:none;margin:0}
      .pev.mid .ev.one{white-space:nowrap;gap:4px}.pev.mid .ev.one .tm{font-size:10px}
      .lgi{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#ccc)}.lgi i{width:10px;height:10px;border-radius:3px;display:inline-block}.ev.w{white-space:normal;line-height:1.35}.ev.w .du{margin-left:6px}@keyframes fpspin{to{transform:rotate(360deg)}}
      .lab{background:var(--fp-bg2,#232323);border-radius:10px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:10px;min-width:0;box-sizing:border-box}
      .lv2{display:flex;align-items:center;gap:4px;margin-top:5px;flex-wrap:wrap}
      .rib2{background:var(--rc);color:var(--fp-on-accent,#141414);font-size:11px;font-weight:800;line-height:18px;padding:0 11px 0 7px;border-radius:3px 0 0 3px;clip-path:polygon(0 0,100% 0,86% 50%,100% 100%,0 100%);margin-right:2px;letter-spacing:.2px}
      .ic{width:38px;height:38px;border-radius:10px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center;flex:none}
      .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:var(--fp-on-accent,#161616);flex:none}
      .lt{min-width:0;flex:1}
      .lv b{font-weight:700}
      .lab[data-person]{cursor:pointer;-webkit-tap-highlight-color:transparent}.lab[data-person]:active{background:var(--fp-bg3,#2a2a2a)}
      .rib{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);background:var(--rc);color:var(--fp-on-accent,#141414);font-size:9px;font-weight:800;padding:1px 8px;line-height:13px;white-space:nowrap;letter-spacing:.3px;clip-path:polygon(0 0,100% 0,90% 50%,100% 100%,0 100%,10% 50%);z-index:2}
      .crown{position:absolute;top:-10px;left:50%;transform:translateX(-50%) rotate(-10deg);color:#f5c542;filter:drop-shadow(0 1px 1px rgba(0,0,0,.7));z-index:2;display:flex}.crown ha-icon{--mdc-icon-size:18px}
      .bdg{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap}
      .md{width:18px;height:18px;border-radius:50%;background:color-mix(in srgb,var(--mc) 22%,transparent);border:1px solid var(--mc);color:var(--mc);display:inline-flex;align-items:center;justify-content:center;flex:none}.md ha-icon{--mdc-icon-size:12px}
      .lv2 .md{width:30px;height:30px;border-width:2px}.lv2 .md ha-icon{--mdc-icon-size:20px}.lv2{gap:6px}
      .md.lg{width:36px;height:36px}.md.lg ha-icon{--mdc-icon-size:20px}
      .ovl{position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:10}
      .pnl{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);width:min(600px,94%);max-height:92%;overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.6);box-sizing:border-box}
      .ph{display:flex;align-items:center;gap:18px;margin-bottom:16px}.phn{flex:1}.pn2{font-size:24px;font-weight:600}
      .ring.bigr{width:64px;height:64px;display:flex}.ring.bigr .crown{top:-14px}.ring.bigr .crown ha-icon{--mdc-icon-size:24px}.ring.bigr .rib{font-size:11px;line-height:15px;bottom:-7px}
      .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kp div{background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px}
      .kp span{display:block;font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}.kp b{font-size:18px;font-weight:400}.kp small{font-size:12px;color:var(--fp-text3,#888)}
      .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
      .aw{display:flex;gap:12px;align-items:center;background:var(--fp-bg3,#262626);border-radius:10px;padding:10px 12px;margin-bottom:6px}.aw b{font-size:15px}.aw div div{font-size:12px;color:var(--fp-text2,#aaa);margin-top:2px}
      .aw0{color:var(--fp-text3,#888);font-size:13px}
      .rl2{display:grid;grid-template-columns:22px 140px 1fr;gap:3px 10px;align-items:center;font-size:12px;color:var(--fp-text2,#aaa);padding:7px 0;border-top:1px solid var(--fp-line,#2a2a2a)}.rl2 b{color:var(--fp-text,#ddd)}
      .rl2 em{grid-column:3;font-style:normal;color:#e0a84f;font-size:11px}
      .nm{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lv{font-size:11px;margin-top:2px}
      .cls{display:flex;flex-wrap:wrap;gap:2px 8px;margin-top:2px}.cl{font-size:11px;color:var(--fp-text3,#7a7a7a);display:flex;align-items:center;gap:4px}.cl i{width:7px;height:7px;border-radius:50%;display:inline-block}
      .ring{position:relative;width:48px;height:48px;flex:none}
      .ring .ava{display:block;width:48px;height:48px;border-radius:50%;overflow:hidden;-webkit-mask-image:-webkit-radial-gradient(white,black)}
      .ring .ava > span{width:100%!important;height:100%!important;border-radius:50%}.ring .ava svg{display:block}
      .streak{font-size:11px;color:var(--fp-text2,#9a9a9a);display:flex;align-items:center;gap:3px;margin-top:3px}.streak ha-icon{--mdc-icon-size:13px;color:#e0a84f}
      .bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,135px),1fr));gap:6px}
      .btn{display:flex;align-items:center;gap:9px;width:100%;background:var(--fp-bg4,#323232);border:1px solid var(--fp-line,#3a3a3a);border-radius:9px;padding:6px 9px;margin:0;color:var(--fp-text,#eee);font:inherit;font-size:13px;line-height:1.25;min-height:40px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box;transition:background .2s,border-color .2s}
      .btn:active{transform:scale(.98)}
      .btn .cb{width:22px;height:22px;border-radius:50%;border:2px solid var(--fp-line,#5d5d5d);flex:none;position:relative;box-sizing:border-box;transition:all .2s}
      .btn.done{background:color-mix(in srgb,var(--fp-accent) 1200%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 45%,transparent)}
      .btn.done .cb{background:${G};border-color:${G}}
      .btn.done .cb::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid var(--fp-line,#1e1e1e);border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
      .btn.done .bt{color:var(--fp-accent)}
      .due{font-style:normal;font-size:10px;font-weight:600;color:#e0a84f;border:1px solid rgba(224,168,79,.5);border-radius:8px;padding:1px 6px;margin-left:6px;white-space:nowrap;display:inline-block}
      .due.last{color:var(--fp-on-accent,#1e1e1e);background:#e0a84f;border-color:#e0a84f}.btn.done .due{opacity:.5}
      .pl.op{color:#c39a4a}.pl.op::before{display:none}
      .pev.mid .ev{font-size:11px;padding:3px 5px 3px 6px;white-space:normal;line-height:1.3}.pev.mid .et{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fp-text,#ddd)}
      .pev.xl .ev{padding:5px 8px;font-size:12px}.pev.xl .et{color:var(--fp-text,#eee)}
      .pst{display:inline-block;font-size:11px;font-weight:700;color:var(--fp-on-accent,#141414);background:var(--pc);border-radius:6px;padding:1px 6px;line-height:16px}
      .c.p.sm{padding:6px 4px;min-height:40px;display:flex;flex-direction:column;align-items:center;gap:4px}
      .evn{display:flex;align-items:center;gap:3px;font-size:11px;color:var(--fp-text2,#aaa);margin-bottom:5px;flex-wrap:wrap;justify-content:center}.evn i{width:6px;height:6px;border-radius:50%;display:inline-block}.evn b{margin-left:2px;font-weight:600}
      .hd.ts-s{padding:4px 4px 6px;font-size:9px;letter-spacing:.5px}.hd.ts-s b{font-size:14px;color:var(--fp-text3,#8a8a8a)}
      .hd.ts-m b{font-size:17px}
      .c.p .big{font-size:14px}.c.p .big small{font-size:10px}.c.p .bar{margin:5px 0 4px}
      .fc{font-size:11px;color:var(--fp-text3,#8a8a8a);white-space:nowrap}.fc b{font-size:18px;font-weight:300;color:var(--fp-text,#ddd);margin-right:4px}
      .opn{font-size:11px;color:#c39a4a;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .prog{font-size:11px;color:var(--fp-text3,#8a8a8a);margin-bottom:4px;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.8px}.gr{color:${G};font-weight:600}
      .free{display:flex;align-items:center;gap:8px;color:var(--fp-text3,#8a8a8a);font-size:14px;padding:6px 2px}.free ha-icon{color:${G}}
      .vc{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;min-height:40px;color:#4fa3e0;font-size:13px;font-weight:600;background:rgba(79,163,224,.08);border-radius:8px}.vc ha-icon{--mdc-icon-size:20px}
      .big{font-size:18px;font-weight:300;line-height:1.1}.big small{font-size:13px;color:var(--fp-text3,#8a8a8a)}
      .bar{height:4px;border-radius:2px;background:var(--fp-bg4,#3a3a3a);margin:7px 0 6px;overflow:hidden}.bar i{display:block;height:100%}
      .miss{font-size:11px;color:#d98080;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ok{font-size:11px;color:${G};display:flex;align-items:center;gap:4px}.ok ha-icon{--mdc-icon-size:14px}
      .pl{font-size:12px;color:var(--fp-text3,#7a7a7a);line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pl::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--fp-bg4,#555);margin-right:6px;vertical-align:middle}
      .none{font-size:13px;color:var(--fp-text3,#555)}
      .ev{font-size:12px;line-height:1.3;padding:4px 6px 4px 7px;border-left:3px solid;background:var(--fp-bg4,#303030);border-radius:0 6px 6px 0;margin-top:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .ev:first-child{margin-top:0}.ev b{font-weight:600;color:var(--fp-text2,#aaa);margin-right:5px}
      .more{font-size:11px;color:var(--fp-text3,#777);margin-top:4px}
      .emptyk{grid-column:1/-1;color:var(--fp-text3,#7a7a7a);padding:20px;text-align:center}
      .err{color:#e06b6b;font-size:12px;margin-top:10px}
    </style>
    <div class="card">
      <div class="top">
        <div class="clock">${pad(now.getHours())}:${pad(now.getMinutes())}</div>
        <div><div class="sub">${esc(this._cfg.titel)}</div><div class="date">${WDL[isoWd(now) - 1]}, <b>${now.getDate()} ${MON[now.getMonth()]}</b></div></div>
        <div class="seg">${[['alle', 'All'], ['aemtli', 'Chores'], ['termine', 'Events'], ['schule', 'Timetable']].filter(([v]) => v !== 'schule' || Object.keys(this._cfg.schule || {}).length).map(([v, l]) => `<button class="${(this._mode || 'alle') === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        <div class="nav">
          ${this._cfg.todos_knopf ? `<button class="nb td${this._cfg.todos_offen ? ' g' : ''}" data-todos title="To-dos"><ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>To-dos${this._cfg.todos_offen ? ` <b class="tdn">${Number(this._cfg.todos_offen)}</b>` : ''}</button>` : ''}
          ${this._week !== 0 ? `<button class="nb g" data-nav="0">Today</button>` : ''}
          ${cals.length ? `<button class="nb${this._syncing ? ' spin2' : ''}" data-sync title="Sync calendars"><ha-icon icon="mdi:calendar-sync-outline"></ha-icon></button>` : ''}
          <button class="nb" data-nav="-1"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          <div class="wk"><b>Week ${isoWeek(ws)}</b>${ws.getDate()} ${ws.getMonth() !== we.getMonth() ? MON[ws.getMonth()].slice(0, 3) + ' ' : ''}– ${we.getDate()} ${MON[we.getMonth()]}</div>
          <button class="nb" data-nav="1"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </div>
      </div>
      <div class="grid">${head}${(!cals.length || cals.some((c) => !c.person)) ? termine : ''}${rows}${empty}</div>
      ${this._err ? `<div class="err">${esc(this._err)}</div>` : ''}
      ${this._detail ? this._detailHtml(kids, pre, awards) : ''}
    </div>`;
  }
}

// Navigation zwischen den Familienplaner-Seiten (funktioniert auch im Kiosk-Modus ohne HA-Kopfzeile)
const fpNavigate = (p) => {
  const parts = location.pathname.split('/').filter(Boolean);
  history.pushState(null, '', `/${parts[0] || 'family-planer'}/${p}${location.search}`);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
};
window.FPX_EN = { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx, planActive, AV_TYPES, PALETTE, fpNavigate, startOfDay, ymd };
customElements.define('fp-week-inner-en', LoxWochenplanerCard);

})();
// Familienplaner – Ämtliplan v3: pro Ämtli mehrere Personen, pro Person Wochentage mit Rhythmus
// custom:fp-plan-inner-en   (nutzt window.FPX_EN aus dem Familienplaner-Modul)
// Plan-Beschreibung: "fp1:" + {"z": {"Lea": [1,3]}, "r": {"Lea|1": [2, 0]}}
//   r: alle n Wochen, aktiv wenn Wochenindex (seit 5.1.1970) % n == offset; fehlt r => jede Woche
customElements.whenDefined('fp-week-inner-en').then(() => {
  const { FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx } = window.FPX_EN;
  const rgba = (hex, a) => { const h = (hex || '#888888').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const mondayOfIdx = (idx) => { const u = new Date(Date.UTC(1970, 0, 5) + idx * 604800000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const curIdx = () => weekIdx(new Date());
  const nextKw = (n, o) => { const c = curIdx(); for (let i = 0; i < n; i++) if ((c + i) % n === o) return isoWeek(mondayOfIdx(c + i)); return null; };
  const dayTxt = (p, d, r, f) => { const x = r[`${p}|${d}`]; const fv = (f || {})[`${p}|${d}`] || 1; const ex = []; if (fv > 1) ex.push(`until ${WD[(d - 1 + fv - 1) % 7]}`); if (x && x[0] > 1) ex.push(`every ${x[0]} wks, next week ${nextKw(x[0], x[1])}`); return ex.length ? `${WD[d - 1]} (${ex.join(', ')})` : WD[d - 1]; };
  const daysTxt = (p, t, r, f) => {
    const s = [...(t || [])].sort((a, b) => a - b); const j = s.join(',');
    const anyR = s.some((d) => (r[`${p}|${d}`] || [1])[0] > 1 || ((f || {})[`${p}|${d}`] || 1) > 1);
    if (!anyR) { if (j === '1,2,3,4,5,6,7') return 'daily'; if (j === '1,2,3,4,5') return 'weekdays'; if (j === '6,7') return 'weekend'; }
    return s.length ? s.map((d) => dayTxt(p, d, r, f)).join(', ') : 'no days';
  };

  // Bildauswahl pro Person (eigene Portraits + Material-Design-Icons)
  const ICONS = [
    ['Girls', ['svg:maedchen-lang', 'svg:maedchen-zoepfe', 'svg:maedchen-dutt', 'av:k.long.braun.hell.0', 'av:k.long.schwarz.mittel.0', 'av:k.long.rot.hell.0', 'av:k.ponylang.blond.hell.schleife', 'av:k.ponylang.braun.oliv.0', 'av:k.ponylang.schwarz.hell.brille', 'av:k.zoepfe.braun.mittel.0', 'av:k.zoepfe.schwarz.dunkel.0', 'av:k.zoepfe.rot.hell.0', 'av:k.dutt.braun.oliv.0', 'av:k.bob.blond.hell.0', 'av:k.bob.schwarz.mittel.0', 'av:k.bob.braun.hell.brille', 'av:k.locken.braun.dunkel.0', 'av:k.locken.schwarz.oliv.schleife', 'av:k.locken.rot.hell.0', 'av:k.pferd.blond.hell.0', 'av:k.pferd.braun.mittel.0', 'av:k.long.blond.hell.kopfhoerer']],
    ['Boys', ['av:k.kurz.blond.hell.0', 'av:k.kurz.braun.hell.0', 'av:k.kurz.schwarz.mittel.0', 'av:k.kurz.rot.hell.0', 'av:k.stachel.blond.hell.0', 'av:k.stachel.braun.oliv.0', 'av:k.stachel.schwarz.dunkel.0', 'av:k.seite.braun.hell.0', 'av:k.seite.blond.mittel.brille', 'av:k.lockenkurz.schwarz.dunkel.0', 'av:k.lockenkurz.braun.oliv.0', 'av:k.kurz.blond.hell.cap', 'av:k.kurz.braun.mittel.kopfhoerer', 'av:k.seite.rot.hell.cap']],
    ['Women', ['svg:frau', 'av:e.long.braun.mittel.0', 'av:e.long.schwarz.oliv.0', 'av:e.long.rot.hell.0', 'av:e.ponylang.blond.hell.0', 'av:e.ponylang.braun.hell.brille', 'av:e.bob.braun.hell.0', 'av:e.bob.blond.hell.brille', 'av:e.bob.schwarz.dunkel.0', 'av:e.dutt.blond.hell.0', 'av:e.dutt.braun.oliv.brille', 'av:e.locken.braun.dunkel.0', 'av:e.locken.blond.hell.0', 'av:e.pferd.blond.hell.0', 'av:e.pferd.schwarz.mittel.0', 'av:e.pferd.rot.hell.0']],
    ['Men', ['svg:mann', 'av:e.kurz.braun.hell.0', 'av:e.kurz.schwarz.oliv.0', 'av:e.kurz.braun.hell.bart', 'av:e.kurz.blond.hell.bart', 'av:e.seite.braun.mittel.brille', 'av:e.seite.schwarz.dunkel.0', 'av:e.seite.blond.hell.0', 'av:e.stachel.blond.hell.0', 'av:e.lockenkurz.schwarz.dunkel.bart', 'av:e.glatze.braun.hell.bart', 'av:e.glatze.schwarz.mittel.brille', 'av:e.kurz.rot.hell.bart+brille', 'av:e.kurz.blond.hell.cap']],
    ['Grandparents', ['av:o.dutt.grau.hell.brille', 'av:o.bob.grau.hell.0', 'av:o.locken.grau.mittel.0', 'av:o.long.grau.hell.brille', 'av:o.kurz.grau.hell.brille', 'av:o.glatze.grau.hell.bart+brille', 'av:o.seite.grau.oliv.bart', 'av:o.glatze.grau.dunkel.0']],
    ['Dressed up', ['av:k.kurz.blond.hell.held', 'av:k.long.blond.hell.held', 'av:k.zoepfe.braun.hell.held', 'av:k.kurz.braun.hell.astro', 'av:k.zoepfe.blond.hell.astro', 'av:k.kurz.schwarz.mittel.pirat', 'av:k.long.rot.hell.pirat', 'av:k.long.blond.hell.zauber', 'av:k.stachel.braun.hell.zauber', 'av:k.long.blond.hell.krone', 'av:k.kurz.blond.hell.krone', 'av:k.zoepfe.braun.hell.katze', 'av:k.long.blond.hell.katze', 'av:k.long.blond.hell.einhorn', 'av:k.ponylang.braun.mittel.einhorn', 'av:k.dutt.blond.hell.kopfhoerer', 'av:e.kurz.braun.hell.held', 'av:e.long.blond.hell.krone']],
    ['Symbole & Smileys', ['mdi:face-woman', 'mdi:face-man', 'mdi:baby-face-outline', 'mdi:account-cowboy-hat', 'mdi:emoticon-cool-outline', 'mdi:emoticon-happy-outline', 'mdi:emoticon-excited-outline', 'mdi:emoticon-tongue-outline']],
    ['Superheld & Abenteuer', ['mdi:shield-star', 'mdi:lightning-bolt', 'mdi:flash', 'mdi:domino-mask', 'mdi:ninja', 'mdi:pirate', 'mdi:sword', 'mdi:shield-crown', 'mdi:crown', 'mdi:castle', 'mdi:wizard-hat', 'mdi:magic-staff', 'mdi:skull-crossbones', 'mdi:treasure-chest']],
    ['Weltall & Roboter', ['mdi:rocket-launch', 'mdi:ufo', 'mdi:alien', 'mdi:robot', 'mdi:robot-happy', 'mdi:star-shooting', 'mdi:earth', 'mdi:moon-waning-crescent', 'mdi:telescope', 'mdi:atom']],
    ['Tiere', ['mdi:unicorn', 'mdi:unicorn-variant', 'mdi:cat', 'mdi:dog', 'mdi:dog-side', 'mdi:rabbit', 'mdi:rodent', 'mdi:horse', 'mdi:horse-variant', 'mdi:owl', 'mdi:penguin', 'mdi:panda', 'mdi:koala', 'mdi:elephant', 'mdi:teddy-bear', 'mdi:turtle', 'mdi:fish', 'mdi:dolphin', 'mdi:shark', 'mdi:jellyfish', 'mdi:bee', 'mdi:butterfly', 'mdi:ladybug', 'mdi:snake', 'mdi:spider', 'mdi:duck', 'mdi:bird', 'mdi:pig', 'mdi:cow', 'mdi:sheep', 'mdi:paw', 'mdi:ghost']],
    ['Sport', ['mdi:soccer', 'mdi:basketball', 'mdi:volleyball', 'mdi:tennis', 'mdi:table-tennis', 'mdi:hockey-sticks', 'mdi:swim', 'mdi:bike', 'mdi:skateboard', 'mdi:ski', 'mdi:karate', 'mdi:run', 'mdi:gymnastics', 'mdi:trophy']],
    ['Musik & Hobby', ['mdi:guitar-electric', 'mdi:guitar-acoustic', 'mdi:piano', 'mdi:music', 'mdi:microphone-variant', 'mdi:headphones', 'mdi:dance-ballroom', 'mdi:drama-masks', 'mdi:palette', 'mdi:brush', 'mdi:camera', 'mdi:gamepad-variant', 'mdi:controller-classic', 'mdi:puzzle', 'mdi:chess-knight', 'mdi:book-open-variant']],
    ['Essen', ['mdi:ice-cream', 'mdi:pizza', 'mdi:cupcake', 'mdi:cookie', 'mdi:candy', 'mdi:popcorn', 'mdi:hamburger', 'mdi:food-apple', 'mdi:fruit-watermelon', 'mdi:carrot']],
    ['Natur & Fahrzeuge', ['mdi:flower', 'mdi:flower-tulip', 'mdi:palm-tree', 'mdi:cactus', 'mdi:mushroom', 'mdi:clover', 'mdi:weather-sunny', 'mdi:weather-night', 'mdi:snowflake', 'mdi:fire', 'mdi:diamond-stone', 'mdi:heart', 'mdi:star', 'mdi:car-sports', 'mdi:airplane', 'mdi:helicopter', 'mdi:train', 'mdi:sail-boat', 'mdi:tractor', 'mdi:motorbike', 'mdi:fire-truck', 'mdi:bus-school']]
  ];
  // only the multi-coloured illustrated avatars (no plain one-colour icons)
  const AVATARS = ICONS.filter(([, ids]) => ids.every((x) => !x.startsWith('mdi:')));
  const COLS = ['#69C350', '#A8CF45', '#4FD1C5', '#4FA3E0', '#7A7FE8', '#C771D6', '#E06B9B', '#E06B6B', '#E0A84F', '#F5C542', '#9AA5B1'];

  class LoxAemtliPlanCard extends FpBase {
    _normalize(c) { return { plan: 'todo.amtli_plan', script: 'script.aemtli_tageswechsel', einstellungen: 'todo.familienplaner_einstellungen', kinder: [], titel: 'Chore plan', ...c }; }
    _lists() { return [['plan', this._cfg.plan], ['settings', this._cfg.einstellungen]]; }
    getCardSize() { return 10; }
    _bind() {
      this._new = { t: '', z: {}, r: {}, f: {} }; this._confirm = null; this._msg = ''; this._pick = null;
      const r = this.shadowRoot;
      r.addEventListener('click', (e) => this._onClick(e));
      r.addEventListener('change', (e) => this._onChange(e));
      r.addEventListener('input', (e) => { if (e.target.dataset.new === 't') this._new.t = e.target.value; });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur(); });
      r.addEventListener('focusout', () => setTimeout(() => { if (this._dirty && !this._editing()) { this._dirty = false; this._render(); } }, 60));
    }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && a.tagName === 'INPUT'; }
    _order() { return this._kids().map((k) => k.name); }
    _rows() {
      const order = this._order();
      const first = (z) => Math.min(99, ...Object.keys(z).map((k) => { const i = order.indexOf(k); return i < 0 ? 98 : i; }));
      return (this._data.plan || []).map((p) => { const m = parseDesc(p.description); return { uid: p.uid, t: p.summary, pts: (typeof m.p === 'number' ? m.p : null), z: planZ(m), r: (m.r && typeof m.r === 'object') ? m.r : {}, f: (m.f && typeof m.f === 'object') ? m.f : {} }; })
        .sort((a, b) => (first(a.z) - first(b.z)) || a.t.localeCompare(b.t, 'de'));
    }
    _find(uid) { return this._rows().find((r) => r.uid === uid); }
    _desc(z, r, f) {
      const zo = {}; const ro = {}; const fo = {}; f = f || {};
      for (const [k, v] of Object.entries(z)) {
        zo[k] = [...new Set(v)].sort((a, b) => a - b);
        for (const d of zo[k]) { const x = r[`${k}|${d}`]; if (x && x[0] > 1) ro[`${k}|${d}`] = [x[0], ((x[1] % x[0]) + x[0]) % x[0]]; const fv = f[`${k}|${d}`]; if (fv > 1) fo[`${k}|${d}`] = fv; }
      }
      const o = { z: zo }; if (Object.keys(ro).length) o.r = ro; if (Object.keys(fo).length) o.f = fo;
      return 'fp1:' + JSON.stringify(o);
    }
    _sync() {
      clearTimeout(this._syncT);
      this._syncT = setTimeout(() => { if (this._cfg.script) this._call('script', 'turn_on', {}, this._cfg.script).catch(() => {}); }, 1200);
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(true); clearTimeout(this._msgT); this._msgT = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _add() {
      const t = (this._new.t || '').trim();
      if (!t) return this._flash('Please enter a chore.', true);
      if (!Object.values(this._new.z).some((v) => v.length)) return this._flash('Please give at least one person a weekday.', true);
      this._call('todo', 'add_item', { item: t, description: this._desc(this._new.z, this._new.r, this._new.f) }, this._cfg.plan).then(() => {
        this._new = { t: '', z: {}, r: {}, f: {} }; this._pick = null; this._flash(`"${t}" added`); this._sync();
      }).catch((e) => this._flash(`Error: ${e.message || e}`, true));
    }
    _ctx(el) {
      const isNew = !!el.closest('.add'); const row = el.closest('.row[data-uid]');
      const r = !isNew && row ? this._find(row.dataset.uid) : null;
      const src = isNew ? this._new : r;
      return { isNew, r, key: isNew ? 'new' : (r && r.uid), z: src ? JSON.parse(JSON.stringify(src.z)) : null, rr: src ? JSON.parse(JSON.stringify(src.r || {})) : null, ff: src ? JSON.parse(JSON.stringify(src.f || {})) : null };
    }
    _apply(ctx) {
      if (ctx.isNew) { this._new.z = ctx.z; this._new.r = ctx.rr; this._new.f = ctx.ff; this._render(true); return; }
      if (!ctx.r) return;
      // optimistisch im lokalen Datenstand übernehmen, damit die Anzeige sofort stimmt
      const desc = this._desc(ctx.z, ctx.rr, ctx.ff);
      const it = (this._data.plan || []).find((p) => p.uid === ctx.r.uid); if (it) it.description = desc;
      this._render(true);
      this._call('todo', 'update_item', { item: ctx.r.uid, description: desc }, this._cfg.plan)
        .then(() => this._sync()).catch((e) => this._flash(`Error: ${e.message || e}`, true));
    }
    _isPick(key, p, d) { const k = this._pick; return !!k && k.key === key && k.p === p && k.d === d; }
    _onClick(e) {
      const t = e.target;
      const ip = t.closest('[data-ip]');
      if (ip) { this._ip = this._ip === ip.dataset.ip ? null : ip.dataset.ip; this._render(true); return; }
      if (t.closest('[data-ipclose]')) { this._ip = null; this._render(true); return; }
      const bi = t.closest('[data-bild]'); if (bi && this._ip) { this._savePerson(this._ip, { bild: bi.dataset.bild }); return; }
      const co = t.closest('[data-col]'); if (co && this._ip) { this._savePerson(this._ip, { farbe: co.dataset.col }); return; }
      if (t.closest('[data-add]')) { const inp = this.shadowRoot.querySelector('[data-new="t"]'); if (inp) this._new.t = inp.value; this._add(); return; }
      const arw = t.closest('.arw');
      if (arw) {
        const ctx = this._ctx(t); if (!ctx.z) return; const p = arw.dataset.p;
        const day = t.closest('[data-day]');
        if (day) {
          const d = Number(day.dataset.day); const has = (ctx.z[p] || []).includes(d);
          if (!has) { ctx.z[p] = [...(ctx.z[p] || []), d]; this._pick = { key: ctx.key, p, d }; this._apply(ctx); }
          else { this._pick = this._isPick(ctx.key, p, d) ? null : { key: ctx.key, p, d }; this._render(true); }
          return;
        }
        const pre = t.closest('[data-preset]');
        if (pre) { ctx.z[p] = pre.dataset.preset.split(',').map(Number); Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rmp]')) { delete ctx.z[p]; Object.keys(ctx.ff).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.ff[k]); Object.keys(ctx.rr).filter((k) => k.startsWith(p + '|')).forEach((k) => delete ctx.rr[k]); this._pick = null; this._apply(ctx); return; }
        const pk = this._pick; if (!pk) return; const rk = `${pk.p}|${pk.d}`;
        const rn = t.closest('[data-rn]');
        if (rn) { const n = Number(rn.dataset.rn); if (n <= 1) delete ctx.rr[rk]; else ctx.rr[rk] = [n, curIdx() % n]; this._apply(ctx); return; }
        const ro = t.closest('[data-ro]');
        if (ro && ctx.rr[rk]) { ctx.rr[rk][1] = Number(ro.dataset.ro); this._apply(ctx); return; }
        const fx = t.closest('[data-fx]');
        if (fx) { const v = Number(fx.dataset.fx); if (v <= 1) delete ctx.ff[rk]; else ctx.ff[rk] = v; this._apply(ctx); return; }
        if (t.closest('[data-rdel]')) { ctx.z[pk.p] = (ctx.z[pk.p] || []).filter((x) => x !== pk.d); delete ctx.rr[rk]; delete ctx.ff[rk]; this._pick = null; this._apply(ctx); return; }
        if (t.closest('[data-rclose]')) { this._pick = null; this._render(true); return; }
        return;
      }
      const del = t.closest('[data-del]');
      if (del) {
        const ctx = this._ctx(t); if (!ctx.r) return; const r = ctx.r;
        if (this._confirm === r.uid) {
          this._confirm = null;
          this._call('todo', 'remove_item', { item: [r.uid] }, this._cfg.plan).then(() => { this._flash(`"${r.t}" deleted`); this._sync(); }).catch((er) => this._flash(`Error: ${er.message || er}`, true));
        } else {
          this._confirm = r.uid; this._render(true);
          clearTimeout(this._cT); this._cT = setTimeout(() => { this._confirm = null; this._render(); }, 3000);
        }
      }
    }
    _onChange(e) {
      const el = e.target;
      if (el.dataset.upload !== undefined && this._ip && el.files && el.files[0]) { this._upload(this._ip, el.files[0]); return; }
      if (el.dataset.alias !== undefined && this._ip) {
        const al = [...new Set(el.value.split(',').map((s) => s.trim()).filter(Boolean))];
        this._savePerson(this._ip, { alias: al }); this._flash(al.length ? `Nicknames saved: ${al.join(', ')}` : 'Nicknames removed'); return;
      }
      if (el.dataset.addp !== undefined) {
        const v = el.value; if (!v) return; const ctx = this._ctx(el); if (!ctx.z) return;
        ctx.z[v] = ctx.z[v] || []; this._apply(ctx); return;
      }
      if (el.dataset.f === 'p') {
        const ctx = this._ctx(el); if (!ctx.r) return;
        const n = el.value === '' ? null : Math.max(0, Math.min(1000, Math.round(Number(el.value) || 0)));
        this._call('todo', 'update_item', { item: ctx.r.uid, points: n }, this._cfg.plan).then(() => this._flash('Points saved')).catch((er) => this._flash(`Error: ${er.message || er}`, true));
        return;
      }
      if (el.dataset.f === 't') {
        const ctx = this._ctx(el); if (!ctx.r) return; const v = el.value.trim();
        if (v && v !== ctx.r.t) this._call('todo', 'update_item', { item: ctx.r.uid, rename: v }, this._cfg.plan).catch((er) => this._flash(`Error: ${er.message || er}`, true));
        else el.value = ctx.r.t;
      }
    }
    _picker(key, p, d, rr, farbe, ff) {
      const x = rr[`${p}|${d}`]; const n = x && x[0] > 1 ? x[0] : 1; const o = x ? x[1] : 0; const c = curIdx();
      const fv = (ff || {})[`${p}|${d}`] || 1;
      const fRow = `<div class="pr"><span class="plb">Time to do it</span>${[1, 2, 3, 4, 5, 6, 7].map((k) => `<button class="sg${k === fv ? ' on' : ''}" data-fx="${k}">${k === 1 ? `only on ${WD[d - 1]}` : `until ${WD[(d - 1 + k - 1) % 7]} · ${k} days`}</button>`).join('')}</div>`;
      const starts = n > 1 ? [...Array(n)].map((_, i) => {
        const idx = c + i; const off = idx % n; const kw = isoWeek(mondayOfIdx(idx));
        return `<button class="sg${off === o ? ' on' : ''}" data-ro="${off}">${i === 0 ? 'this week' : i === 1 ? 'next week' : `in ${i} weeks`} · week ${kw}</button>`;
      }).join('') : '';
      return `<div class="pick" style="--c:${farbe};--cb:${rgba(farbe, 0.2)}">
        <div class="pr"><span class="plb">${WD[d - 1]} · ${esc(p)}</span>
          ${[1, 2, 3, 4].map((k) => `<button class="sg${k === n ? ' on' : ''}" data-rn="${k}">${k === 1 ? 'every week' : `every ${k} weeks`}</button>`).join('')}</div>
        ${n > 1 ? `<div class="pr"><span class="plb">Start</span>${starts}</div>` : ''}
        ${fRow}<div class="pr"><button class="sg rm" data-rdel>Remove day</button><button class="sg ok" data-rclose>Done</button></div>
      </div>`;
    }
    _asg(key, z, rr, ff) {
      ff = ff || {};
      const kids = this._kids(); const order = this._order();
      const person = (n) => kids.find((k) => k.name === n) || { name: n, farbe: '#888888' };
      const names = Object.keys(z).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const lines = names.map((n) => {
        const k = person(n); const t = z[n] || [];
        const pk = this._pick && this._pick.key === key && this._pick.p === n ? this._pick : null;
        return `<div class="arw" data-p="${esc(n)}"><div class="ar">${avatarHtml(k, 30)}<span class="pn">${esc(n)}</span>
          <div class="days">${WD.map((w, i) => {
            const d = i + 1; const on = t.includes(d); const x = rr[`${n}|${d}`]; const rh = on && x && x[0] > 1; const fv = on ? (ff[`${n}|${d}`] || 1) : 1; const tag = [rh ? x[0] + 'W' : '', fv > 1 ? fv + 'T' : ''].filter(Boolean).join('·');
            return `<button class="day${on ? ' on' : ''}${(rh || fv > 1) ? ' rh' : ''}${pk && pk.d === d ? ' sel' : ''}" data-day="${d}" style="--c:${k.farbe};--cb:${rgba(k.farbe, 0.2)}">${w}${tag ? `<small>${tag}</small>` : ''}</button>`;
          }).join('')}</div>
          <button class="pre" data-preset="1,2,3,4,5,6,7">daily</button><button class="pre" data-preset="1,2,3,4,5">Mon–Fri</button>
          <button class="rmp" data-rmp title="Remove person">✕</button></div>
          ${pk && t.includes(pk.d) ? this._picker(key, n, pk.d, rr, k.farbe, ff) : ''}</div>`;
      }).join('');
      const free = kids.filter((k) => !(k.name in z));
      return lines + (free.length ? `<select class="sel addp" data-addp><option value="" selected>+ Assign person</option>${free.map((k) => `<option value="${esc(k.name)}">${esc(k.name)}</option>`).join('')}</select>` : '');
    }
    _savePerson(name, patch) {
      const ps = JSON.parse(JSON.stringify(this._settingsP())); ps[name] = { ...(ps[name] || {}), ...patch };
      const desc = 'fp1:' + JSON.stringify({ p: ps }); const it = this._settingsItem();
      if (it) it.description = desc; else this._data.settings = [...(this._data.settings || []), { summary: 'Personen', uid: '_neu', description: desc }];
      this._render(true);
      const call = it && it.uid !== '_neu'
        ? this._call('todo', 'update_item', { item: it.uid, description: desc }, this._cfg.einstellungen)
        : this._call('todo', 'add_item', { item: 'Personen', description: desc }, this._cfg.einstellungen);
      call.catch((e) => this._flash(`Error: ${e.message || e}`, true));
    }
    async _upload(name, file) {
      // centre crop to a 320 px square JPEG in the browser, then store it in Home Assistant
      if (!this._hass || !this._hass.fpUpload) return this._flash('Uploading is not available here.', true);
      this._uploading = true; this._render(true);
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
        const s = Math.min(img.naturalWidth, img.naturalHeight); const c = document.createElement('canvas'); c.width = c.height = 320;
        c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 320, 320);
        URL.revokeObjectURL(url);
        await this._hass.fpUpload(name, c.toDataURL('image/jpeg', 0.86));
        this._flash('Photo saved');
      } catch (er) { this._flash(`Error: ${(er && er.message) || 'Could not read the picture'}`, true); }
      this._uploading = false; this._render(true);
    }
    _iconPicker(k) {
      if (!k) return '';
      const cur = k.bild || (k.avatar ? 'svg:' + k.avatar : '');
      return `<div class="ipk" style="--c:${k.farbe}">
        <div class="iph">${avatarHtml(k, 60)}<div class="iphn"><b>${esc(k.name)}</b><span>Tap a picture and colour – applied everywhere right away</span></div><button class="sg ok" data-ipclose>Done</button></div>
        <div class="ipl">Nicknames in events</div>
        <input class="in" data-alias value="${esc(((this._settingsP()[k.name] || {}).alias || []).join(', '))}" placeholder="e.g. Tommy, Mikey – separate with commas" style="max-width:420px">
        <div class="ips2">If one of these names is in an event title, the event is shown at ${esc(k.name)}.</div>
        <div class="ipl">Colour</div><div class="cols">${COLS.map((c) => `<button class="clr${(k.farbe || '').toLowerCase() === c.toLowerCase() ? ' on' : ''}" data-col="${c}" style="background:${c}"></button>`).join('')}</div>
        <div class="ipl">Own photo</div><div class="upl">${(k.bild || '').startsWith('img:') ? avatarHtml(k, 56) : ''}<label class="sg up">${this._uploading ? 'Uploading …' : 'Upload photo'}<input type="file" accept="image/*" data-upload hidden></label><span class="ips2">Cropped to a square and stored only in your Home Assistant.</span></div>
        ${AVATARS.map(([title, ids]) => `<div class="ipl">${title}</div><div class="igrid">${ids.map((id) => `<button class="ib${cur === id ? ' on' : ''}" data-bild="${id}">${avatarHtml({ ...k, bild: id }, 44)}</button>`).join('')}</div>`).join('')}
      </div>`;
    }
    _render(force) {
      if (!this.shadowRoot || !this._cfg) return;
      if (!force && this._editing()) { this._dirty = true; return; }
      const kids = this._kids(); const rows = this._rows();
      // Wochenübersicht: durchschnittliche Anzahl Ämtli pro Person und Tag (Rhythmus anteilig)
      const cnt = {}; kids.forEach((k) => { cnt[k.name] = [0, 0, 0, 0, 0, 0, 0]; });
      rows.forEach((r) => Object.entries(r.z).forEach(([n, t]) => { if (!cnt[n]) cnt[n] = [0, 0, 0, 0, 0, 0, 0]; (t || []).forEach((d) => { const x = r.r[`${n}|${d}`]; cnt[n][d - 1] += x && x[0] > 1 ? 1 / x[0] : 1; }); }));
      const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
      const max = Math.max(1, ...Object.values(cnt).flat());
      const overview = `<div class="ov"><div></div>${WD.map((w) => `<div class="ovh">${w}</div>`).join('')}<div class="ovh">Ø week</div>` +
        kids.map((k) => `<div class="ovp">${avatarHtml(k, 24)}<span>${esc(k.name)}</span></div>` +
          cnt[k.name].map((n) => `<div class="ovc" style="background:${n ? rgba(k.farbe, 0.12 + (0.5 * n) / max) : 'var(--fp-bg3,#262626)'};color:${n ? 'var(--fp-text,#fff)' : 'var(--fp-text3,#555)'}">${n ? fmt(n) : '·'}</div>`).join('') +
          `<div class="ovt">${fmt(cnt[k.name].reduce((a, b) => a + b, 0))}</div>`).join('') + `</div>`;
      const sum = (z, r, f) => Object.entries(z).map(([n, t]) => `<b>${esc(n)}:</b> ${daysTxt(n, t, r, f)}`).join('<br>') || 'Not assigned yet';
      const body = rows.map((r) => `
        <div class="row" data-uid="${esc(r.uid)}">
          <div class="tcol"><div class="tl"><input class="in" data-f="t" value="${esc(r.t)}"><label class="pts" title="Points or weight for this chore (in fair mode: share of the day value)"><input class="in pn" data-f="p" type="number" min="0" max="1000" inputmode="numeric" value="${r.pts == null ? '' : r.pts}" placeholder="${Number(this._cfg.punkte_standard) || 10}"><span>pts</span></label></div><div class="rl">${sum(r.z, r.r, r.f)}</div></div>
          <div class="asg">${this._asg(r.uid, r.z, r.r, r.f)}</div>
          <button class="del${this._confirm === r.uid ? ' cf' : ''}" data-del>${this._confirm === r.uid ? 'Delete?' : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button>
        </div>`).join('');
      const nw = this._new;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:20px 22px;color:var(--fp-text,#ececec);font-family:var(--fp-font)}
        .head{display:flex;align-items:center;gap:14px;margin-bottom:16px}
        .badge{width:46px;height:46px;border-radius:12px;background:color-mix(in srgb,var(--fp-accent) 1400%,transparent);color:${G};display:flex;align-items:center;justify-content:center}.badge ha-icon{--mdc-icon-size:26px}
        .title{font-size:20px;font-weight:600}.subt{font-size:13px;color:var(--fp-text2,#8c8c8c);margin-top:3px}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .ov{display:grid;grid-template-columns:150px repeat(7,minmax(34px,58px)) 70px;gap:4px;align-items:center;background:var(--fp-bg2,#232323);border-radius:12px;padding:12px;width:max-content;max-width:100%;box-sizing:border-box}
        .ovh{font-size:11px;color:var(--fp-text3,#777);text-align:center;text-transform:uppercase;letter-spacing:.8px}
        .ovp{display:flex;align-items:center;gap:8px;font-size:14px;min-width:0}.ovp span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ovc{height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
        .ovt{text-align:center;font-size:14px;color:var(--fp-text2,#bbb);font-weight:600}
        .list{background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2f2f2f);border-radius:12px;overflow:hidden}
        .row{display:grid;grid-template-columns:minmax(200px,1fr) auto 56px;gap:16px;align-items:start;padding:14px;border-top:1px solid var(--fp-line,#313131)}.row:first-child{border-top:none}
        .in,.sel{background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text,#eee);border-radius:9px;height:44px;padding:0 12px;font:inherit;font-size:15px;width:100%;box-sizing:border-box;outline:none}
        .in:focus,.sel:focus{border-color:color-mix(in srgb,var(--fp-accent) 70%,transparent)}
        .sel{-webkit-appearance:none;appearance:none}
        .tl{display:flex;gap:8px}.pts{display:flex;align-items:center;gap:4px;flex:none;color:var(--fp-text3,#8a8a8a);font-size:12px}.pts .pn{width:70px;text-align:center;padding:0 6px}
        .rl{font-size:12px;color:var(--fp-text3,#8a8a8a);margin:6px 0 0 2px;line-height:1.6}.rl b{color:var(--fp-text2,#bbb);font-weight:600}
        .asg{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
        .ar{display:flex;align-items:center;gap:8px}
        .pn{width:74px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .days{display:flex;gap:4px}
        .day{width:40px;height:40px;border-radius:9px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#808080);font:inherit;font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}
        .day small{font-size:9px;font-weight:700;opacity:.9}
        .day.on{background:var(--cb);border-color:var(--c);color:var(--c)}
        .day.rh{border-style:dashed}
        .day.sel{box-shadow:0 0 0 2px #1e1e1e,0 0 0 4px var(--c)}
        .pre{height:32px;border-radius:var(--fp-radius,16px);background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#999);font:inherit;font-size:11px;padding:0 10px;cursor:pointer}
        .rmp{width:32px;height:32px;border-radius:50%;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);font-size:13px;cursor:pointer;padding:0}
        .pick{margin:8px 0 4px 38px;background:var(--fp-bg1,#1f1f1f);border:1px solid var(--c);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
        .pr{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
        .plb{font-size:12px;color:var(--c);font-weight:600;min-width:86px}
        .sg{height:34px;border-radius:17px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#bbb);font:inherit;font-size:12px;padding:0 12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .sg.on{background:var(--cb);border-color:var(--c);color:var(--c);font-weight:600}
        .sg.rm{color:#e06b6b;border-color:rgba(224,107,107,.5)}.sg.ok{margin-left:auto;background:${G};border-color:${G};color:var(--fp-on-accent,#142010);font-weight:600}
        .addp{width:220px;height:38px;font-size:13px;color:var(--fp-text2,#aaa);border-style:dashed}
        .del{height:44px;border-radius:9px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text3,#888);cursor:pointer;font:inherit;font-size:11px;font-weight:600;padding:0;display:flex;align-items:center;justify-content:center}
        .del.cf{background:#e06b6b;border-color:#e06b6b;color:var(--fp-on-accent,#1e1e1e)}.del ha-icon{--mdc-icon-size:20px}
        .add{margin-top:16px;background:var(--fp-bg2,#232323);border:1px dashed var(--fp-line,#3d3d3d);border-radius:12px;padding:14px}
        .add .row{padding:0;border:none}
        .addb{height:44px;border-radius:9px;background:${G};border:none;color:var(--fp-on-accent,#142010);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.addb ha-icon{--mdc-icon-size:24px}
        .msg{font-size:13px;margin-top:10px;min-height:18px}
        .empty{padding:24px;text-align:center;color:var(--fp-text3,#777)}
        .foot{font-size:12px;color:var(--fp-text3,#666);margin-top:12px;line-height:1.5}
        .pers{display:flex;flex-wrap:wrap;gap:8px}
        .pc{display:flex;align-items:center;gap:10px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#333);border-radius:30px;padding:4px 14px 4px 4px;color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .pc ha-icon{--mdc-icon-size:14px;color:var(--fp-text3,#777)}.pc.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .ipk{margin-top:10px;background:var(--fp-bg2,#232323);border:1px solid var(--c);border-radius:14px;padding:14px 16px}
        .iph{display:flex;align-items:center;gap:14px;margin-bottom:6px}.iphn{flex:1}.iphn b{display:block;font-size:18px}.iphn span{font-size:12px;color:var(--fp-text3,#888)}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.upl .up{cursor:pointer;display:inline-flex;align-items:center}
        .ipl{font-size:11px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px}
        .cols{display:flex;gap:8px;flex-wrap:wrap}
        .clr{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.clr.on{border-color:#fff;box-shadow:0 0 0 2px #1e1e1e inset}
        .igrid{display:flex;flex-wrap:wrap;gap:6px}
        .ips2{font-size:11px;color:var(--fp-text3,#777);margin-top:5px}
        .ib{width:56px;height:56px;border-radius:12px;background:var(--fp-bg3,#2a2a2a);border:1px solid var(--fp-line,#333);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
        .ib.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
      </style>
      <div class="card">
        <div class="head"><div class="badge"><ha-icon icon="mdi:clipboard-text-clock-outline"></ha-icon></div>
          <div><div class="title">${esc(this._cfg.titel)}</div><div class="subt">Tap a day = assign · tap again = time to do it (e.g. Wed to Sat) and rhythm (every 2–4 weeks). Changes apply right away.</div></div></div>
        <div class="sec">People · picture & colour</div>
        <div class="pers">${kids.map((k) => `<button class="pc${this._ip === k.name ? ' on' : ''}" data-ip="${esc(k.name)}" style="--c:${k.farbe}">${avatarHtml(k, 40)}<span>${esc(k.name)}</span><ha-icon icon="mdi:pencil"></ha-icon></button>`).join('')}</div>
        ${this._ip ? this._iconPicker(kids.find((k) => k.name === this._ip)) : ''}
        <div class="sec">Week overview</div>
        ${overview}
        <div class="sec">Chores</div>
        <div class="list">${body || '<div class="empty">No chores yet – add one below.</div>'}</div>
        <div class="add"><div class="sec" style="margin-top:0">New chore</div>
          <div class="row">
            <div class="tcol"><input class="in" data-new="t" placeholder="e.g. clear the table" value="${esc(nw.t)}"><div class="rl">${sum(nw.z, nw.r, nw.f || {})}</div></div>
            <div class="asg">${this._asg('new', nw.z, nw.r, nw.f || {})}</div>
            <button class="addb" data-add title="Add"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="msg" style="color:${this._msgErr ? '#E06B6B' : G}">${esc(this._msg || '')}</div>
        ${this._err ? `<div class="msg" style="color:#E06B6B">${esc(this._err)}</div>` : ''}
        <div class="foot">Dashed frame = deadline or rhythm ("4T" = 4 days, "2W" = every 2 weeks). A chore with a deadline only counts as missed once the deadline has passed. Every day at ${esc(this._cfg.tageswechsel || '24:00')} open chores are counted as missed and the chores for the new day are created.</div>
      </div>`;
    }
  }
  if (!customElements.get('fp-plan-inner-en')) customElements.define('fp-plan-inner-en', LoxAemtliPlanCard);
});

// ---------------------------------------------------------------------------
// Smart lists card ("Smarte Listen"): any to-do list, grouped by self-organising categories
// rendered inside custom:family-planer-card (view: lists)
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { add: 'Was fehlt?', addb: 'Hinzufügen', sorting: 'Wird einsortiert …', done: 'Erledigt', clear: 'Erledigte löschen',
      cats: 'Kategorien', optimize: 'Optimieren', optimizing: 'Optimiere …', move: 'Kategorie wählen', learned: 'Gemerkt: „{i}“ → {c}',
      empty: 'Die Liste ist leer – oben etwas hinzufügen.', nolists: 'Noch keine Liste eingerichtet. Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Smarte Listen.',
      unavailable: 'Liste nicht erreichbar', edit: 'Kategorien bearbeiten', limit: '{n} von max. {m}', newcat: '+ Kategorie', save: 'Speichern', cancel: 'Abbrechen',
      other: 'bleibt immer zuletzt', created: 'Neu: {x}', removed: 'Zusammengefasst: {x}', nothing: 'Alles ist schon gut sortiert.', err: 'Fehler: ', del: 'Löschen' },
    en: { add: 'What do you need?', addb: 'Add', sorting: 'Sorting …', done: 'Done', clear: 'Clear done',
      cats: 'Categories', optimize: 'Optimise', optimizing: 'Optimising …', move: 'Choose category', learned: 'Remembered: "{i}" → {c}',
      empty: 'The list is empty – add something above.', nolists: 'No list set up yet. Settings → Devices & services → Family Planer → Configure → Smart lists.',
      unavailable: 'List not available', edit: 'Edit categories', limit: '{n} of max. {m}', newcat: '+ Category', save: 'Save', cancel: 'Cancel',
      other: 'always stays last', created: 'New: {x}', removed: 'Merged: {x}', nothing: 'Everything is sorted well already.', err: 'Error: ', del: 'Delete' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));

  class FpListsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        const r = this.shadowRoot;
        r.addEventListener('click', (e) => this._click(e));
        r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.addin !== undefined) this._add(); });
        r.addEventListener('input', (e) => { if (e.target.dataset.addin !== undefined) this._draft = e.target.value; if (e.target.dataset.cn !== undefined) this._edit[+e.target.dataset.cn].name = e.target.value; });
      }
      try { this._sel = this._sel || localStorage.getItem('fp_list') || null; } catch (e) { /* ignore */ }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) this._resub(); }
    disconnectedCallback() { this._unsub(); }
    connectedCallback() { if (this._hass && !this._sub) this._resub(); }
    update() { this._resub(); this._render(); }
    _lists() { return (this._store && this._store.snap && this._store.snap.lists) || []; }
    _cur() { const ls = this._lists(); return ls.find((l) => l.id === this._sel) || ls[0] || null; }
    _unsub() { if (this._sub) { this._sub.then((u) => u && u()).catch(() => {}); this._sub = null; this._subEnt = null; } }
    _resub() {
      const l = this._cur(); if (!this._hass || !l || !this.isConnected) return;
      if (this._subEnt === l.entity) return;
      this._unsub(); this._items = null; this._subEnt = l.entity; this._err = null;
      this._sub = this._hass.connection.subscribeMessage((m) => { this._items = m.items || []; this._render(); },
        { type: 'todo/item/subscribe', entity_id: l.entity }).catch((e) => { this._err = (e && e.message) || String(e); this._render(); });
    }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    _svc(service, data) { const l = this._cur(); return this._hass.callService('todo', service, data, { entity_id: l.entity }).catch((e) => this._flash(this.T.err + (e.message || e), true)); }
    _add() {
      const v = (this._draft || '').trim(); if (!v) return;
      this._draft = ''; const inp = this.shadowRoot.querySelector('[data-addin]'); if (inp) inp.value = '';
      this._svc('add_item', { item: v });
    }
    async _click(e) {
      const t = e.target; const l = this._cur();
      const tab = t.closest('[data-tab]');
      if (tab) { this._sel = tab.dataset.tab; try { localStorage.setItem('fp_list', this._sel); } catch (er) { /* ignore */ } this._move = null; this._resub(); this._render(); return; }
      if (!l) return;
      if (t.closest('[data-addb]')) { this._add(); return; }
      const mv = t.closest('[data-mv]');
      if (mv) { e.stopPropagation(); this._move = mv.dataset.mv; this._render(); return; }
      const to = t.closest('[data-to]');
      if (to && this._move) {
        const item = this._move; const cat = l.categories.find((c) => c.id === to.dataset.to); this._move = null;
        this._store.ws('family_planer/list/assign', { list_id: l.id, item, category_id: cat.id })
          .then(() => this._flash(fmt(this.T.learned, { i: item, c: cat.name }))).catch((er) => this._flash(this.T.err + (er.message || er), true));
        this._render(); return;
      }
      if (t.classList.contains('ov') || t.closest('[data-x]')) { this._move = null; this._edit = null; this._render(); return; }
      const it = t.closest('[data-uid]');
      if (it) { const done = it.dataset.st === 'completed'; it.classList.toggle('done'); this._svc('update_item', { item: it.dataset.uid, status: done ? 'needs_action' : 'completed' }); return; }
      if (t.closest('[data-clear]')) { this._hass.callService('todo', 'remove_completed_items', {}, { entity_id: l.entity }).catch((er) => this._flash(this.T.err + (er.message || er), true)); return; }
      if (t.closest('[data-showdone]')) { this._showDone = !this._showDone; this._render(); return; }
      if (t.closest('[data-opt]')) {
        if (this._busy) return; this._busy = true; this._render();
        try {
          const r = await this._store.ws('family_planer/list/refresh', { list_id: l.id, ai: true });
          const parts = [];
          if (r && r.created && r.created.length) parts.push(fmt(this.T.created, { x: r.created.join(', ') }));
          if (r && r.removed && r.removed.length) parts.push(fmt(this.T.removed, { x: r.removed.join(', ') }));
          this._flash(parts.join(' · ') || this.T.nothing);
        } catch (er) { this._flash(this.T.err + (er.message || er), true); }
        this._busy = false; this._render(); return;
      }
      if (t.closest('[data-cats]')) { this._edit = l.categories.map((c) => ({ ...c })); this._render(); return; }
      if (this._edit) {
        const up = t.closest('[data-up]'); const dn = t.closest('[data-dn]'); const rm = t.closest('[data-rm]');
        const ed = this._edit; const others = ed.filter((c) => c.id !== 'other');
        if (up || dn) { const i = +(up || dn).dataset[up ? 'up' : 'dn']; const j = i + (up ? -1 : 1); if (j >= 0 && j < others.length) { [others[i], others[j]] = [others[j], others[i]]; this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; } this._render(); return; }
        if (rm) { const i = +rm.dataset.rm; others.splice(i, 1); this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; this._render(); return; }
        if (t.closest('[data-newcat]')) { if (ed.length < l.max_categories) { others.push({ id: null, name: '', icon: 'mdi:tag-outline' }); this._edit = [...others, ...ed.filter((c) => c.id === 'other')]; } this._render(); return; }
        if (t.closest('[data-save]')) {
          const cats = this._edit.filter((c) => (c.name || '').trim()).map((c) => ({ id: c.id, name: c.name.trim(), icon: c.icon }));
          this._edit = null; this._render();
          this._store.ws('family_planer/list/categories', { list_id: l.id, categories: cats }).catch((er) => this._flash(this.T.err + (er.message || er), true));
        }
      }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const ls = this._lists(); const l = this._cur();
      const active = this.shadowRoot.activeElement; const keepFocus = active && active.dataset && active.dataset.addin !== undefined;
      let body = '';
      if (!l) body = `<div class="empty">${esc(T.nolists)}</div>`;
      else if (this._err) body = `<div class="empty">${esc(T.unavailable)}: ${esc(this._err)}</div>`;
      else if (this._items) {
        const open = this._items.filter((i) => i.status === 'needs_action');
        const done = this._items.filter((i) => i.status === 'completed');
        const groups = new Map(l.categories.map((c) => [c.id, []])); const pending = [];
        open.forEach((i) => { const cid = l.map[i.summary]; if (cid && groups.has(cid)) groups.get(cid).push(i); else pending.push(i); });
        const row = (i) => `<div class="it${i.status === 'completed' ? ' done' : ''}" data-uid="${esc(i.uid)}" data-st="${i.status}"><span class="cb"></span><span class="tx">${esc(i.summary)}</span>${i.status === 'needs_action' ? `<button class="mv" data-mv="${esc(i.summary)}" title="${esc(T.move)}"><ha-icon icon="mdi:swap-horizontal"></ha-icon></button>` : ''}</div>`;
        const sec = (icon, name, items, cls) => `<section class="${cls || ''}"><h3><ha-icon icon="${esc(icon)}"></ha-icon><span>${esc(name)}</span><em>${items.length}</em></h3>${items.map(row).join('')}</section>`;
        const secs = [];
        if (pending.length) secs.push(sec('mdi:timer-sand', T.sorting, pending, 'pend'));
        l.categories.forEach((c) => { const g = groups.get(c.id); if (g.length) secs.push(sec(c.icon || 'mdi:tag-outline', c.name, g)); });
        body = (secs.length ? `<div class="cols">${secs.join('')}</div>` : `<div class="empty">${esc(T.empty)}</div>`) +
          (done.length ? `<div class="dn"><button class="lnk" data-showdone><ha-icon icon="mdi:chevron-${this._showDone ? 'up' : 'down'}"></ha-icon>${esc(T.done)} (${done.length})</button><button class="lnk" data-clear><ha-icon icon="mdi:broom"></ha-icon>${esc(T.clear)}</button></div>` +
            (this._showDone ? `<div class="donel">${done.map(row).join('')}</div>` : '') : '');
      }
      const moveDlg = this._move && l ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.move)}<b>${esc(this._move)}</b></div><div class="chips">${l.categories.map((c) => `<button class="chip${l.map[this._move] === c.id ? ' on' : ''}" data-to="${esc(c.id)}"><ha-icon icon="${esc(c.icon || 'mdi:tag-outline')}"></ha-icon>${esc(c.name)}</button>`).join('')}</div></div></div>` : '';
      const ed = this._edit;
      const editDlg = ed && l ? (() => { const others = ed.filter((c) => c.id !== 'other'); const oth = ed.find((c) => c.id === 'other');
        return `<div class="ov"><div class="dlg wide"><div class="dh">${esc(T.edit)} · ${esc(l.name)}<span class="lim">${esc(fmt(T.limit, { n: ed.length, m: l.max_categories }))}</span></div>
          ${others.map((c, i) => `<div class="er"><ha-icon icon="${esc(c.icon || 'mdi:tag-outline')}"></ha-icon><input class="in" data-cn="${ed.indexOf(c)}" value="${esc(c.name)}"><button class="ib" data-up="${i}"><ha-icon icon="mdi:arrow-up"></ha-icon></button><button class="ib" data-dn="${i}"><ha-icon icon="mdi:arrow-down"></ha-icon></button><button class="ib rm" data-rm="${i}" title="${esc(T.del)}"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button></div>`).join('')}
          ${oth ? `<div class="er"><ha-icon icon="${esc(oth.icon)}"></ha-icon><input class="in" data-cn="${ed.indexOf(oth)}" value="${esc(oth.name)}"><span class="hint">${esc(T.other)}</span></div>` : ''}
          <div class="ea">${ed.length < l.max_categories ? `<button class="sg" data-newcat>${esc(T.newcat)}</button>` : '<span></span>'}<span class="sp"></span><button class="sg" data-x>${esc(T.cancel)}</button><button class="sg ok" data-save>${esc(T.save)}</button></div></div></div>`; })() : '';
      const openCount = (x) => (x.id === (l && l.id) && this._items ? this._items.filter((i) => i.status === 'needs_action').length : null);
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:16px;font-family:var(--fp-font);color:var(--fp-text,#ececec);position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .tabs{display:flex;gap:8px;flex-wrap:wrap;flex:1}
        .tab{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#ccc);font:inherit;font-size:14px;cursor:pointer}
        .tab.on{background:color-mix(in srgb,var(--fp-accent) 1600%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:${G};font-weight:600}
        .tab em{font-style:normal;font-size:11px;background:var(--fp-bg4,#333);color:var(--fp-text,#ddd);border-radius:9px;padding:1px 7px}
        .tab.on em{background:${G};color:var(--fp-on-accent,#141414)}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        .tb.busy ha-icon{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
        ha-icon{--mdc-icon-size:18px}
        .addr{display:flex;gap:8px;margin:14px 0 16px}
        .in{flex:1;height:44px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 14px;outline:none;min-width:0}
        .in:focus{border-color:${G}}
        .addb{width:52px;height:44px;border-radius:10px;border:none;background:${G};color:var(--fp-on-accent,#141414);cursor:pointer}
        .addb ha-icon{--mdc-icon-size:24px}
        .cols{columns:3 250px;column-gap:12px}
        section{break-inside:avoid;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2c2c2c);border-radius:12px;padding:10px 10px 6px;margin:0 0 12px}
        section.pend{border-style:dashed;border-color:var(--fp-line,#4a4a4a)}
        h3{display:flex;align-items:center;gap:8px;margin:0 2px 8px;font-size:12px;font-weight:600;color:var(--fp-text2,#9a9a9a);text-transform:uppercase;letter-spacing:1px}
        h3 ha-icon{color:${G}}h3 span{flex:1}h3 em{font-style:normal;color:var(--fp-text3,#666)}
        .it{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 4px 0 10px;border-radius:9px;background:var(--fp-bg3,#2a2a2a);margin-bottom:6px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .cb{width:20px;height:20px;border-radius:50%;border:2px solid var(--fp-line,#5a5a5a);flex:none;box-sizing:border-box}
        .it.done{background:var(--fp-bg2,#202820)}.it.done .cb{background:${G};border-color:${G}}.it.done .tx{color:var(--fp-text3,#6f8a66);text-decoration:line-through}
        .tx{flex:1;font-size:15px;line-height:1.25;padding:8px 0;word-break:break-word}
        .mv{width:36px;height:36px;border:none;background:none;color:var(--fp-text3,#666);cursor:pointer;border-radius:8px}
        .mv:hover{color:var(--fp-text2,#ccc);background:var(--fp-bg4,#333)}
        .dn{display:flex;gap:10px;margin-top:4px}
        .lnk{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--fp-text3,#888);font:inherit;font-size:13px;cursor:pointer;padding:6px 4px}
        .donel{columns:3 250px;column-gap:12px;margin-top:6px}
        .empty{color:var(--fp-text3,#888);padding:30px 10px;text-align:center;font-size:14px}
        .msg{position:absolute;left:50%;transform:translateX(-50%);top:12px;background:#2e3a2a;border:1px solid ${G};color:var(--fp-text,#dfe);padding:8px 16px;border-radius:10px;font-size:13px;z-index:5}
        .msg.e{background:#3a2626;border-color:#e06b6b}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:flex-start;justify-content:center;padding-top:60px;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:16px;width:min(560px,92%)}
        .dlg.wide{width:min(640px,94%)}
        .dh{font-size:13px;color:var(--fp-text2,#999);margin-bottom:12px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.dh b{color:var(--fp-text,#eee);font-size:16px}
        .lim{margin-left:auto;font-size:12px;color:var(--fp-text3,#777)}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .chip{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:20px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer}
        .chip.on{border-color:${G};color:${G}}
        .er{display:flex;align-items:center;gap:8px;margin-bottom:8px}.er>ha-icon{color:${G}}
        .er .in{height:38px;font-size:14px}
        .ib{width:38px;height:38px;border-radius:9px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#bbb);cursor:pointer}
        .ib.rm:hover{color:#e06b6b}
        .hint{font-size:12px;color:var(--fp-text3,#777);white-space:nowrap}
        .ea{display:flex;gap:8px;margin-top:12px;align-items:center}.sp{flex:1}
        .sg{height:38px;border-radius:19px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}
      </style>
      <div class="card">
        <div class="top"><div class="tabs">${ls.map((x) => { const n = openCount(x); return `<button class="tab${l && x.id === l.id ? ' on' : ''}" data-tab="${esc(x.id)}"><ha-icon icon="${esc(x.icon || 'mdi:format-list-checks')}"></ha-icon>${esc(x.name)}${n ? `<em>${n}</em>` : ''}</button>`; }).join('')}</div>
          ${l ? `<button class="tb" data-cats><ha-icon icon="mdi:shape-outline"></ha-icon>${esc(T.cats)}</button><button class="tb${this._busy ? ' busy' : ''}" data-opt><ha-icon icon="mdi:auto-fix"></ha-icon>${esc(this._busy ? T.optimizing : T.optimize)}</button>` : ''}</div>
        ${l ? `<div class="addr"><input class="in" data-addin placeholder="${esc(T.add)}" value="${esc(this._draft || '')}" enterkeyhint="done"><button class="addb" data-addb title="${esc(T.addb)}"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ''}
        ${body}
        ${moveDlg}${editDlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
      if (keepFocus) { const i = this.shadowRoot.querySelector('[data-addin]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    }
  }
  if (!customElements.get('fp-lists-inner')) customElements.define('fp-lists-inner', FpListsInner);
})();

// ---------------------------------------------------------------------------
// Points & rewards card: levels, reward shop, parent approval (admin or PIN), bonus points, history
// rendered inside custom:family-planer-card (view: rewards)
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TXT = {
    de: { title: 'Punkte & Belohnungen', pts: 'Punkte', lvl: 'Level', next: 'noch {n} bis Level {l}', max: 'Höchstes Level erreicht!',
      shop: 'Belohnungen für {name}', shopAll: 'Alle Belohnungen', pickHint: 'Person antippen, um ihre Belohnungen zu sehen und einzulösen.', forOnly: 'nur für {n}', redeem: 'Einlösen', missing: 'noch {n} Punkte', approval: 'mit Freigabe', noapproval: 'sofort',
      week: 'max. {n}× pro Woche', none: 'Noch keine Belohnungen. Eltern legen sie hier mit „Bearbeiten“ an (Eltern-PIN).',
      pending: 'Wartet auf Freigabe', approve: 'Freigeben', deny: 'Ablehnen', history: 'Verlauf', bonus: 'Punkte geben',
      pin: 'Eltern-PIN', ok: 'OK', cancel: 'Abbrechen', reason: 'Grund (optional)', give: 'Vergeben',
      sent: '„{t}“ angefragt – die Eltern werden benachrichtigt.', done: '„{t}“ eingelöst. Viel Spass!', approved: 'Freigegeben', denied: 'Abgelehnt',
      reserved: '{n} reserviert', err: { not_enough_points: 'Nicht genug Punkte.', weekly_limit: 'Diese Woche schon so oft eingelöst.', not_allowed: 'Diese Belohnung ist nicht für dich.', unauthorized: 'Falsche PIN oder keine Berechtigung.', pin_wrong: 'Falsche PIN.', pin_locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.' },
      kinds: { chore: 'Ämtli', bonus: 'Tagesbonus', streak: 'Serienbonus', adjust: 'Bonus', reward: 'Belohnung', carry: 'Übertrag', todo: 'To-do' },
      edit: 'Bearbeiten', editDone: 'Fertig', add: 'Neue Belohnung', changePin: 'PIN ändern', del: 'Löschen', save: 'Speichern',
      rTitle: 'Belohnung', rIcon: 'Icon', rCost: 'Kosten in Punkten', rApproval: 'Eltern müssen freigeben', rPersons: 'Nur für (leer = alle)', rWeek: 'Höchstens pro Woche (0 = unbegrenzt)',
      delAsk: '„{t}“ wirklich löschen? Offene Anfragen dafür werden abgelehnt.', saved: 'Gespeichert.', pinChanged: 'Eltern-PIN geändert.',
      startPin: 'Die Start-PIN 123456 ist noch aktiv. Bitte jetzt eine eigene Eltern-PIN festlegen – vorher sind Belohnungen und Einstellungen gesperrt.',
      rCat: 'Kategorie', own: 'Eigene Punkte', approx: 'ca.', minus: 'Abziehen',
      sizes: { s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Mega gross', xxl: 'Riesig' },
      catHint: 'Gross = so viel, wie man in einem Monat mit allen Ämtli verdient (inkl. Boni). Die Punkte passen sich an, wenn die Punkte-Einstellungen ändern.' },
    en: { title: 'Points & rewards', pts: 'points', lvl: 'Level', next: '{n} more to level {l}', max: 'Highest level reached!',
      shop: 'Rewards for {name}', shopAll: 'All rewards', pickHint: 'Tap a person to see and redeem their rewards.', forOnly: 'only for {n}', redeem: 'Redeem', missing: '{n} points to go', approval: 'needs approval', noapproval: 'instant',
      week: 'max. {n}× per week', none: 'No rewards yet. Parents add them here with "Edit" (parent PIN).',
      pending: 'Waiting for approval', approve: 'Approve', deny: 'Decline', history: 'History', bonus: 'Give points',
      pin: 'Parent PIN', ok: 'OK', cancel: 'Cancel', reason: 'Reason (optional)', give: 'Give',
      sent: '"{t}" requested – the parents are notified.', done: '"{t}" redeemed. Have fun!', approved: 'Approved', denied: 'Declined',
      reserved: '{n} reserved', err: { not_enough_points: 'Not enough points.', weekly_limit: 'Already redeemed that often this week.', not_allowed: 'This reward is not for you.', unauthorized: 'Wrong PIN or not allowed.', pin_wrong: 'Wrong PIN.', pin_locked: 'Too many wrong tries – please wait 5 minutes.' },
      kinds: { chore: 'Chore', bonus: 'Day bonus', streak: 'Streak bonus', adjust: 'Bonus', reward: 'Reward', carry: 'Carried over', todo: 'To-do' },
      edit: 'Edit', editDone: 'Done', add: 'New reward', changePin: 'Change PIN', del: 'Delete', save: 'Save',
      rTitle: 'Reward', rIcon: 'Icon', rCost: 'Cost in points', rApproval: 'Parents must approve', rPersons: 'Only for (empty = everyone)', rWeek: 'At most per week (0 = unlimited)',
      delAsk: 'Really delete "{t}"? Pending requests for it are declined.', saved: 'Saved.', pinChanged: 'Parent PIN changed.',
      startPin: 'The start PIN 123456 is still active. Please choose your own parent PIN now – until then rewards and settings are locked.',
      rCat: 'Category', own: 'Own points', approx: 'approx.', minus: 'Take away',
      sizes: { s: 'Small', m: 'Medium', l: 'Large', xl: 'Mega', xxl: 'Giant' },
      catHint: 'Large = what you earn in a month with every chore done (incl. bonuses). Points follow the point settings automatically.' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const RSIZES = ['s', 'm', 'l', 'xl', 'xxl'];
  const money = (s, k) => { const z = s.sizes || {}; const v = (z.values || {})[k]; return v ? `${Number(v).toLocaleString('de-CH', { maximumFractionDigits: 2 })} ${z.currency || ''}`.trim() : ''; };
  const av = (p, size) => (window.FPX && window.FPX.avatarHtml
    ? window.FPX.avatarHtml({ name: p.name, farbe: COLOR(p.color), bild: /^(av:[a-z0-9.+]+|svg:[a-z-]+|img:\/family_planer_files\/avatars\/[a-z0-9_]+\.(jpg|png|webp))$/.test(p.image || '') ? p.image : '' }, size)
    : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${p.color};display:inline-block"></span>`);

  class FpRewardsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { const d = e.target.dataset; if (!this._dlg) return; if (d.bp !== undefined) this._dlg.points = e.target.value; if (d.br !== undefined) this._dlg.reason = e.target.value;
          if (d.rf) this._dlg.r[d.rf] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; });
        this.shadowRoot.addEventListener('change', (e) => { const d = e.target.dataset; if (this._dlg && d.rf && e.target.type === 'checkbox') this._dlg.r[d.rf] = e.target.checked; });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { this._render(); }
    _snap() { return (this._store && this._store.snap) || null; }
    _flash(msg, err) { this._msg = msg; this._msgErr = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4000); }
    _errText(e) { const code = String((e && (e.code || e.message)) || e).replace(/^reward_/, ''); return this.T.err[code] || (e && e.message) || code; }
    _isAdmin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
    _ctx() { return { lang: this._cfg.lang, host: this }; }
    // approvals and points: admins act directly, everyone else with the parent PIN (unlock token)
    async _parent(action) {
      if (this._isAdmin()) return action({});
      try { const token = await window.FPPIN.ensure(this._store, this._ctx()); return action({ token }); } catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(this._errText(e), true); return null; }
    }
    // reward changes: always the parent PIN, also for admins
    async _pinned(type, data) {
      try { return await window.FPPIN.call(this._store, type, data, this._ctx()); } catch (e) { if (e !== window.FPPIN.CANCEL) this._flash(this._errText(e), true); return null; }
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const pc = t.closest('[data-p]'); if (pc) { this._sel = this._sel === pc.dataset.p ? null : pc.dataset.p; this._render(); return; }
      const rd = t.closest('[data-redeem]');
      if (rd) {
        const r = s.rewards.find((x) => x.id === rd.dataset.redeem); const pid = this._sel; if (!pid) return;
        try { const res = await this._store.ws('family_planer/reward/redeem', { person_id: pid, reward_id: r.id }); this._flash(fmt(res.status === 'approved' ? this.T.done : this.T.sent, { t: r.title })); } catch (er) { this._flash(this._errText(er), true); }
        return;
      }
      const dc = t.closest('[data-decide]');
      if (dc) { const id = dc.dataset.decide; const approve = dc.dataset.ok === '1'; this._parent((extra) => this._store.ws('family_planer/reward/decide', { request_id: id, approve, ...extra }).then(() => this._flash(approve ? this.T.approved : this.T.denied)).catch((er) => this._flash(this._errText(er), true))); return; }
      if (t.closest('[data-bonus]')) { this._dlg = { kind: 'bonus', points: String(((s.sizes || {}).todo || {}).s || 10), reason: '', person: this._sel || (s.persons[0] && s.persons[0].id) }; this._render(); return; }
      const bz = t.closest('[data-bsize]'); if (bz && this._dlg && this._dlg.kind === 'bonus') { const n = ((s.sizes || {}).todo || {})[bz.dataset.bsize] || 0; this._dlg.points = String(this._dlg.neg ? -n : n); this._render(); return; }
      if (t.closest('[data-bneg]') && this._dlg && this._dlg.kind === 'bonus') { this._dlg.neg = !this._dlg.neg; this._dlg.points = String(-(Number(this._dlg.points) || 0)); this._render(); return; }
      const bp = t.closest('[data-bperson]'); if (bp && this._dlg) { this._dlg.person = bp.dataset.bperson; this._render(); return; }
      if (t.closest('[data-give]') && this._dlg) {
        const d = this._dlg; const pts = Math.round(Number(d.points) || 0); if (!pts) return;
        this._parent((extra) => this._store.ws('family_planer/points/adjust', { person_id: d.person, points: pts, reason: d.reason || '', ...extra }).then(() => { this._dlg = null; this._render(); }).catch((er) => this._flash(this._errText(er), true)));
        return;
      }
      if (t.closest('[data-chpin]')) {
        try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); }
        return;
      }
      if (t.closest('[data-edit]')) {
        if (this._edit) { this._edit = false; this._render(); return; }
        try { await window.FPPIN.ensure(this._store, this._ctx()); this._edit = true; this._render(); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); }
        return;
      }
      const er = t.closest('[data-redit]');
      if (er) {
        const r = s.rewards.find((x) => x.id === er.dataset.redit) || { title: '', icon: 'mdi:gift-outline', size: 's', cost: ((s.sizes || {}).reward || {}).s || 100, approval: true, persons: [], per_week: 0 };
        this._dlg = { kind: 'reward', id: r.id || null, r: { ...r, size: r.size || (r.id ? 'custom' : 's'), persons: [...(r.persons || [])] } }; this._render(); return;
      }
      const rz = t.closest('[data-rsize]');
      if (rz && this._dlg && this._dlg.kind === 'reward') { const k = rz.dataset.rsize; this._dlg.r.size = k; if (k !== 'custom') this._dlg.r.cost = ((s.sizes || {}).reward || {})[k] || this._dlg.r.cost; this._render(); return;
      }
      const ic = t.closest('[data-ricon]'); if (ic && this._dlg && this._dlg.kind === 'reward') { this._dlg.r.icon = ic.dataset.ricon; this._render(); return; }
      const rp = t.closest('[data-rperson]');
      if (rp && this._dlg && this._dlg.kind === 'reward') { const ps = this._dlg.r.persons; const i = ps.indexOf(rp.dataset.rperson); if (i >= 0) ps.splice(i, 1); else ps.push(rp.dataset.rperson); this._render(); return; }
      if (t.closest('[data-rsave]') && this._dlg) {
        const d = this._dlg; const r = d.r; if (!String(r.title || '').trim()) return;
        const data = { title: r.title, icon: r.icon, cost: Math.round(Number(r.cost) || 0), approval: !!r.approval, persons: r.persons, per_week: Math.round(Number(r.per_week) || 0), ...(RSIZES.includes(r.size) ? { size: r.size } : {}) };
        const res = await this._pinned('family_planer/reward/save', { ...(d.id ? { reward_id: d.id } : {}), data });
        if (res) { this._dlg = null; this._flash(this.T.saved); }
        return;
      }
      if (t.closest('[data-rdel]') && this._dlg) { this._dlg = { kind: 'confirm', id: this._dlg.id, title: this._dlg.r.title }; this._render(); return; }
      if (t.closest('[data-ryes]') && this._dlg) {
        const res = await this._pinned('family_planer/reward/remove', { reward_id: this._dlg.id });
        if (res !== null) { this._dlg = null; this._flash(this.T.saved); }
        return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const s = this._snap();
      if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons; const sel = persons.find((p) => p.id === this._sel) || null;  // nobody selected = everything
      const pts = s.points || {};
      const cards = persons.map((p) => { const x = pts[p.id] || { balance: 0, available: 0, level: 1, name: '', progress: 0, next: null, lifetime: 0 };
        return `<button class="pc${sel && p.id === sel.id ? ' on' : ''}" data-p="${esc(p.id)}" style="--c:${COLOR(p.color)}">${av(p, 52)}
          <div class="pi"><b>${esc(p.name)}</b><span class="lv">${esc(T.lvl)} ${x.level} · ${esc(x.name)}</span>
          <span class="bar"><i style="width:${Math.max(3, x.progress)}%"></i></span>
          <span class="nx">${x.next == null ? esc(T.max) : esc(fmt(T.next, { n: x.next - x.lifetime, l: x.level + 1 }))}</span></div>
          <div class="pt"><strong>${x.balance}</strong><span>${esc(T.pts)}</span>${x.balance !== x.available ? `<em>${esc(fmt(T.reserved, { n: x.balance - x.available }))}</em>` : ''}</div></button>`; }).join('');
      const avail = sel ? (pts[sel.id] || {}).available || 0 : 0;
      const rw = this._edit || !sel ? s.rewards : s.rewards.filter((r) => !r.persons || !r.persons.length || r.persons.includes(sel.id));
      const only = (r) => (r.persons && r.persons.length ? ' · ' + esc(fmt(T.forOnly, { n: r.persons.map((pid) => (persons.find((p) => p.id === pid) || {}).name).filter(Boolean).join(', ') })) : '');
      const edit = this._edit && window.FPPIN.unlocked(this._store);
      if (this._edit && !edit) this._edit = false;
      const shop = edit ? `<div class="shop">${rw.map((r) => `<div class="rw"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}${r.persons && r.persons.length ? ' · ' + esc(r.persons.map((pid) => (persons.find((p) => p.id === pid) || {}).name).filter(Boolean).join(', ')) : ''}</span></div>
          <button class="tb" data-redit="${esc(r.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button></div>`).join('')}
          <button class="rw add" data-redit=""><ha-icon icon="mdi:plus"></ha-icon>${esc(T.add)}</button></div>`
        : !s.rewards.length ? `<div class="empty">${esc(T.none)}</div>` : !sel ? `<div class="hint2">${esc(T.pickHint)}</div><div class="shop">${rw.map((r) => `<div class="rw"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${only(r)}</span></div></div>`).join('')}</div>`
        : `<div class="shop">${rw.map((r) => { const ok = avail >= r.cost;
        return `<div class="rw${ok ? '' : ' lock'}"><div class="ri"><ha-icon icon="${esc(r.icon)}"></ha-icon></div><div class="rt"><b>${esc(r.title)}</b>
          <span>${r.size && T.sizes[r.size] ? esc(T.sizes[r.size]) + ' · ' : ''}${r.cost} ${esc(T.pts)} · ${esc(r.approval ? T.approval : T.noapproval)}${r.per_week ? ' · ' + esc(fmt(T.week, { n: r.per_week })) : ''}</span>
          ${ok ? '' : `<span class="ms"><span class="bar"><i style="width:${Math.round((avail / r.cost) * 100)}%"></i></span>${esc(fmt(T.missing, { n: r.cost - avail }))}</span>`}</div>
          <button class="rb" data-redeem="${esc(r.id)}" ${ok ? '' : 'disabled'}>${esc(T.redeem)}</button></div>`; }).join('')}</div>`;
      const name = (pid) => (persons.find((p) => p.id === pid) || {}).name || '?';
      const pend = s.requests.filter((q) => q.status === 'pending' && (!sel || q.pid === sel.id));
      const pending = pend.length ? `<div class="sec">${esc(T.pending)}</div><div class="pend">${pend.map((q) => `<div class="pq"><b>${esc(name(q.pid))}</b><span>${esc(q.title)} · ${q.cost} ${esc(T.pts)}</span>
          <button class="sg ok" data-decide="${esc(q.id)}" data-ok="1">${esc(T.approve)}</button><button class="sg" data-decide="${esc(q.id)}" data-ok="0">${esc(T.deny)}</button></div>`).join('')}</div>` : '';
      const hist = sel ? s.ledger.filter((e) => e.pid === sel.id).slice(0, 12) : [];
      const history = hist.length ? `<div class="sec">${esc(T.history)}</div><div class="hist">${hist.map((e) => `<div class="hr"><span class="k">${esc(T.kinds[e.kind] || e.kind)}</span><span class="tx">${esc(e.kind === 'bonus' || e.kind === 'streak' ? '' : e.text)}</span><span class="d">${esc((e.ts || '').slice(5, 10).split('-').reverse().join('.'))}</span><b class="${e.pts < 0 ? 'neg' : ''}">${e.pts > 0 ? '+' : ''}${e.pts}</b></div>`).join('')}</div>` : '';
      const d = this._dlg;
      let dlg = '';
      if (d && d.kind === 'reward') { const r = d.r;
        const icons = ['mdi:gift-outline', 'mdi:ice-cream', 'mdi:controller-classic-outline', 'mdi:television-classic', 'mdi:cash', 'mdi:movie-open-outline', 'mdi:pizza', 'mdi:bed-clock', 'mdi:tablet', 'mdi:book-open-variant', 'mdi:soccer', 'mdi:star-outline'];
        dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(d.id ? r.title : T.add)}</div>
          <label class="fl">${esc(T.rTitle)}<input class="in" data-rf="title" maxlength="60" value="${esc(r.title)}"></label>
          <label class="fl">${esc(T.rIcon)}<span class="icons">${icons.map((i) => `<button class="ib${r.icon === i ? ' on' : ''}" data-ricon="${i}"><ha-icon icon="${i}"></ha-icon></button>`).join('')}</span><input class="in" data-rf="icon" maxlength="70" value="${esc(r.icon)}" placeholder="mdi:…"></label>
          <div class="fl">${esc(T.rCat)}<div class="cats">${[...RSIZES, 'custom'].map((k) => { const n = ((s.sizes || {}).reward || {})[k]; const mv = money(s, k);
            return `<button class="cat${r.size === k ? ' on' : ''}" data-rsize="${k}"><b>${esc(k === 'custom' ? T.own : T.sizes[k])}</b>${k === 'custom' ? '' : `<span>${n} ${esc(T.pts)}${mv ? ` · ${esc(T.approx)} ${esc(mv)}` : ''}</span>`}</button>`; }).join('')}</div><span class="hint">${esc(T.catHint)}</span></div>
          <div class="row2">${r.size === 'custom' ? `<label class="fl">${esc(T.rCost)}<input class="in" type="number" min="1" max="100000" inputmode="numeric" data-rf="cost" value="${esc(r.cost)}"></label>` : ''}
          <label class="fl">${esc(T.rWeek)}<input class="in" type="number" min="0" max="50" inputmode="numeric" data-rf="per_week" value="${esc(r.per_week)}"></label></div>
          <label class="ck"><input type="checkbox" data-rf="approval" ${r.approval ? 'checked' : ''}>${esc(T.rApproval)}</label>
          <div class="fl">${esc(T.rPersons)}<div class="bps">${persons.map((p) => `<button class="chip${r.persons.includes(p.id) ? ' on' : ''}" data-rperson="${esc(p.id)}">${av(p, 22)}${esc(p.name)}</button>`).join('')}</div></div>
          <div class="ea">${d.id ? `<button class="sg del" data-rdel>${esc(T.del)}</button>` : ''}<span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-rsave>${esc(T.save)}</button></div></div></div>`; }
      if (d && d.kind === 'confirm') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(T.delAsk, { t: d.title }))}</div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-ryes>${esc(T.del)}</button></div></div></div>`;
      if (d && d.kind === 'bonus') dlg = `<div class="ov"><div class="dlg"><div class="dh">${esc(T.bonus)}</div>
          <div class="bps">${persons.map((p) => `<button class="chip${p.id === d.person ? ' on' : ''}" data-bperson="${esc(p.id)}">${av(p, 22)}${esc(p.name)}</button>`).join('')}</div>
          <div class="cats">${['s', 'm', 'l'].map((k) => { const n = ((s.sizes || {}).todo || {})[k] || 0; const on = Math.abs(Number(d.points)) === n;
            return `<button class="cat${on ? ' on' : ''}" data-bsize="${k}"><b>${esc(T.sizes[k])}</b><span>${d.neg ? '−' : '+'}${n} ${esc(T.pts)}</span></button>`; }).join('')}
            <button class="cat${d.neg ? ' on neg' : ''}" data-bneg><b>${esc(T.minus)}</b><span>−</span></button></div>
          <div class="br"><input class="in num" data-bp type="number" value="${esc(d.points)}" inputmode="numeric"><input class="in" data-br placeholder="${esc(T.reason)}" value="${esc(d.reason || '')}" maxlength="80"></div>
          <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ok" data-give>${esc(T.give)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:18px;font-family:var(--fp-font);color:var(--fp-text,#ececec);position:relative;min-height:300px}
        .top{display:flex;align-items:center;gap:12px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
.cats{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.cat{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:92px;padding:8px 12px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#262626);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer;text-align:left}
        .cat b{font-weight:600;color:var(--fp-text,#eee)}.cat span{font-size:11px;color:var(--fp-text2,#999)}.cat.on{border-color:var(--fp-accent);background:var(--fp-bg2,#202820)}.cat.on span{color:var(--fp-accent)}.cat.neg{border-color:#e06b6b;background:#3a2626}
        .hint{display:block;font-size:11px;color:var(--fp-text3,#888);margin-top:2px}
        .people{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
        .pc{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px solid var(--fp-line,#2a2a2a);background:var(--fp-bg2,#232323);color:inherit;font:inherit;text-align:left;cursor:pointer;border-left:4px solid var(--c)}
        .pc.on{border-color:var(--c);background:var(--fp-bg3,#262626)}
        .pi{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.pi b{font-size:16px}
        .lv{font-size:12px;color:var(--fp-text2,#aaa)}.nx{font-size:11px;color:var(--fp-text3,#777)}
        .bar{display:block;height:6px;border-radius:3px;background:var(--fp-bg4,#333);overflow:hidden}.bar i{display:block;height:100%;background:${G};border-radius:3px}
        .pt{display:flex;flex-direction:column;align-items:flex-end}.pt strong{font-size:28px;line-height:1;color:${G}}.pt span{font-size:11px;color:var(--fp-text3,#888)}.pt em{font-style:normal;font-size:10px;color:#e0a84f}
        .sec{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
        .shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
        .rw{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2a2a2a)}
        .ri{width:48px;height:48px;border-radius:12px;background:color-mix(in srgb,var(--fp-accent) 1600%,transparent);color:${G};display:flex;align-items:center;justify-content:center;flex:none}.ri ha-icon{--mdc-icon-size:26px}
        .rw.lock .ri{background:var(--fp-bg4,#2e2e2e);color:var(--fp-text3,#777)}
        .rt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.rt b{font-size:15px}.rt span{font-size:12px;color:var(--fp-text2,#999)}.ms{display:flex;flex-direction:column;gap:3px}
        .rb{height:40px;padding:0 16px;border-radius:10px;border:none;background:${G};color:var(--fp-on-accent,#141414);font:inherit;font-weight:600;cursor:pointer}
        .rb[disabled]{background:var(--fp-bg4,#333);color:var(--fp-text3,#777);cursor:default}
        .pend,.hist{display:flex;flex-direction:column;gap:6px}.hint2{font-size:13px;color:var(--fp-text2,#999);margin:0 2px 8px}
        .pq{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:var(--fp-bg3,#262626);border:1px dashed var(--fp-line,#4a4a4a)}.pq span{flex:1;color:var(--fp-text2,#bbb);font-size:14px}
        .hr{display:grid;grid-template-columns:110px 1fr 60px 60px;gap:8px;align-items:center;padding:8px 12px;border-radius:9px;background:var(--fp-bg2,#232323);font-size:13px}
        .hr .k{color:var(--fp-text2,#aaa)}.hr .tx{color:var(--fp-text,#ddd);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hr .d{color:var(--fp-text3,#777)}.hr b{text-align:right;color:${G}}.hr b.neg{color:#e06b6b}
        .empty{color:var(--fp-text3,#888);padding:20px 10px;font-size:14px;line-height:1.5}
        .sg{height:38px;border-radius:19px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:flex-start;justify-content:center;padding-top:50px;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:18px;width:min(460px,92%)}
        .dlg.pin{width:280px;text-align:center}.dh{font-size:15px;font-weight:600;margin-bottom:12px}
        .dots{display:flex;gap:10px;justify-content:center;margin:6px 0 14px}.dots i{width:12px;height:12px;border-radius:50%;border:2px solid var(--fp-line,#5a5a5a)}.dots i.on{background:${G};border-color:${G}}
        .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
        .key{height:54px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg4,#2e2e2e);color:var(--fp-text,#eee);font:inherit;font-size:20px;cursor:pointer}.key.okk{background:${G};color:var(--fp-on-accent,#141414);font-size:15px;font-weight:600}
        .bps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
        .chip{display:flex;align-items:center;gap:6px;height:38px;padding:0 12px 0 6px;border-radius:19px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text,#ddd);font:inherit;font-size:14px;cursor:pointer}.chip.on{border-color:${G};color:${G}}
        .br{display:flex;gap:8px}.in{flex:1;height:42px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 12px;outline:none;min-width:0}.in.num{flex:none;width:90px}
        .ea{display:flex;gap:8px;margin-top:14px}.sp{flex:1}
        .msg{position:absolute;left:50%;transform:translateX(-50%);top:12px;background:#2e3a2a;border:1px solid ${G};color:var(--fp-text,#dfe);padding:8px 16px;border-radius:10px;font-size:13px;z-index:5;max-width:80%}
        .msg.e{background:#3a2626;border-color:#e06b6b}
        .warn{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:rgba(224,168,79,.14);border:1px solid #e0a84f;color:#f0d3a0;font-size:14px;margin-bottom:12px}.warn span{flex:1}
        .rw.add{justify-content:center;gap:8px;border:1px dashed var(--fp-line,#4a4a4a);background:transparent;color:var(--fp-text2,#bbb);font:inherit;font-size:14px;cursor:pointer;min-height:72px}
        .fl{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--fp-text2,#aaa);margin-bottom:12px}.fl .in{flex:none;width:100%;box-sizing:border-box}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .ck{display:flex;align-items:center;gap:10px;font-size:14px;margin-bottom:12px;cursor:pointer}.ck input{width:20px;height:20px;accent-color:${G}}
        .icons{display:flex;flex-wrap:wrap;gap:6px}.ib{width:40px;height:40px;border-radius:10px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);cursor:pointer;display:flex;align-items:center;justify-content:center}.ib.on{border-color:${G};color:${G}}
        .sg.del{background:#3a2626;border-color:#e06b6b;color:#f3b4b4}
        .dlg{max-height:calc(100% - 70px);overflow:auto}
      </style>
      <div class="card">
        <div class="top"><h2>${esc(T.title)}</h2>${edit ? `<button class="tb" data-chpin><ha-icon icon="mdi:form-textbox-password"></ha-icon>${esc(T.changePin)}</button>` : ''}
          <button class="tb" data-edit><ha-icon icon="${edit ? 'mdi:check' : 'mdi:pencil-outline'}"></ha-icon>${esc(edit ? T.editDone : T.edit)}</button>
          <button class="tb" data-bonus><ha-icon icon="mdi:star-plus-outline"></ha-icon>${esc(T.bonus)}</button></div>
        ${s.pin_default ? `<div class="warn"><ha-icon icon="mdi:shield-alert-outline"></ha-icon><span>${esc(T.startPin)}</span><button class="sg ok" data-chpin>${esc(T.changePin)}</button></div>` : ''}
        <div class="people">${cards}</div>
        ${pending}
        <div class="sec">${esc(sel ? fmt(T.shop, { name: sel.name }) : T.shopAll)}</div>${shop}
        ${history}
        ${dlg}
        ${this._msg ? `<div class="msg${this._msgErr ? ' e' : ''}">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-rewards-inner')) customElements.define('fp-rewards-inner', FpRewardsInner);
})();

// ---------------------------------------------------------------------------
// Special chores: free recurrence (every n days/weeks/months/years, monthly, yearly dates, one-off),
// several persons with optional rotation, time window and points. Shown below the chore plan.
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const pad = (n) => String(n).padStart(2, '0');
  const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const TXT = {
    de: { title: 'Besondere Ämtli', sub: 'Nach Datum statt Wochentag – z. B. jedes halbe Jahr Luftfilter reinigen, Pneuwechsel im April und Oktober, einmalig Keller räumen.',
      add: '+ Besonderes Ämtli', none: 'Noch keine besonderen Ämtli.', name: 'Was ist zu tun?', ph: 'z. B. Luftfilter reinigen',
      types: { interval: 'Intervall', monthly: 'Monatlich', yearly: 'Jährlich', once: 'Einmalig' },
      every: 'alle', units: { days: 'Tage', weeks: 'Wochen', months: 'Monate', years: 'Jahre' }, from: 'ab',
      mdays: 'Monate', onday: 'am Tag', last: 'letzter', onweekday: 'am', nths: { 1: '1.', 2: '2.', 3: '3.', 4: '4.', '-1': 'letzten' },
      wd: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], wdl: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      dates: 'Daten', adddate: 'Datum hinzufügen', persons: 'Wer?', rotate: 'abwechselnd', window: 'Zeit zum Erledigen', days: 'Tage', points: 'Punkte',
      save: 'Speichern', cancel: 'Abbrechen', del: 'Löschen?', next: 'Nächstes Mal', err: 'Bitte Titel, mindestens eine Person und ein Datum/Intervall angeben.',
      sum: { interval: (s, u) => `alle ${s.every} ${u} ab ${s.start.split('-').reverse().join('.')}`, monthly_day: (s) => `${s.every > 1 ? `alle ${s.every} Monate` : 'monatlich'} am ${s.day === -1 ? 'letzten Tag' : s.day + '.'}`,
        monthly_wd: (s, n, w) => `${s.every > 1 ? `alle ${s.every} Monate` : 'monatlich'} am ${n} ${w}`, yearly: (d) => `jährlich am ${d}`, once: (d) => `einmalig am ${d}` },
      rot: 'abwechselnd', win: (n) => `${n} Tage Zeit` },
    en: { title: 'Special chores', sub: 'By date instead of weekday – e.g. clean the air filter every six months, change tyres in April and October, clear the cellar once.',
      add: '+ Special chore', none: 'No special chores yet.', name: 'What needs doing?', ph: 'e.g. clean the air filter',
      types: { interval: 'Interval', monthly: 'Monthly', yearly: 'Yearly', once: 'Once' },
      every: 'every', units: { days: 'days', weeks: 'weeks', months: 'months', years: 'years' }, from: 'from',
      mdays: 'months', onday: 'on day', last: 'last', onweekday: 'on the', nths: { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', '-1': 'last' },
      wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], wdl: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      dates: 'Dates', adddate: 'Add date', persons: 'Who?', rotate: 'take turns', window: 'Time to do it', days: 'days', points: 'Points',
      save: 'Save', cancel: 'Cancel', del: 'Delete?', next: 'Next', err: 'Please enter a title, at least one person and a date/interval.',
      sum: { interval: (s, u) => `every ${s.every} ${u} from ${s.start}`, monthly_day: (s) => `${s.every > 1 ? `every ${s.every} months` : 'monthly'} on day ${s.day === -1 ? 'last' : s.day}`,
        monthly_wd: (s, n, w) => `${s.every > 1 ? `every ${s.every} months` : 'monthly'} on the ${n} ${w}`, yearly: (d) => `yearly on ${d}`, once: (d) => `once on ${d}` },
      rot: 'taking turns', win: (n) => `${n} days to do it` },
  };

  class FpSpecialInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        const r = this.shadowRoot;
        r.addEventListener('click', (e) => this._click(e));
        r.addEventListener('change', (e) => this._change(e));
        r.addEventListener('input', (e) => { if (e.target.dataset.k === 'title') this._ed.title = e.target.value; });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { if (!this._editing()) this._render(); }
    _editing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!a && /INPUT|SELECT/.test(a.tagName); }
    _snap() { return (this._store && this._store.snap) || null; }
    _fmtDate(iso) { const [y, m, d] = iso.split('-'); return this._cfg.lang === 'en' ? `${d}/${m}/${y}` : `${d}.${m}.${y}`; }
    _fmtMd(md) { const [m, d] = md.split('-'); return this._cfg.lang === 'en' ? `${d}/${m}` : `${d}.${m}.`; }
    _summary(c) {
      const T = this.T; const s = c.schedule;
      if (s.type === 'interval') return T.sum.interval({ ...s, start: this._cfg.lang === 'en' ? s.start : s.start }, T.units[s.unit]);
      if (s.type === 'monthly') return s.mode === 'weekday' ? T.sum.monthly_wd(s, T.nths[String(s.nth)], T.wdl[s.weekday - 1]) : T.sum.monthly_day(s);
      if (s.type === 'yearly') return T.sum.yearly(s.dates.map((d) => this._fmtMd(d)).join(', '));
      return T.sum.once(s.dates.map((d) => this._fmtDate(d)).join(', '));
    }
    _new() { const s = this._snap(); return { id: null, title: '', points: null, persons: s && s.persons[0] ? [s.persons[0].id] : [], rotate: false, window: 7,
      schedule: { type: 'interval', every: 6, unit: 'months', start: todayIso(), mode: 'day', day: 1, nth: 1, weekday: 6, dates: [] } }; }
    _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      if (t.closest('[data-add]')) { this._ed = this._new(); this._render(); return; }
      const ed = t.closest('[data-edit]');
      if (ed) { const c = s.chores.find((x) => x.id === ed.dataset.edit); this._ed = { id: c.id, title: c.title, points: c.points ?? null, persons: [...(c.persons || [])], rotate: !!c.rotate, window: c.window || 1,
        schedule: { every: 1, unit: 'months', start: todayIso(), mode: 'day', day: 1, nth: 1, weekday: 6, dates: [], ...c.schedule } }; this._render(); return; }
      const dl = t.closest('[data-del]');
      if (dl) { const id = dl.dataset.del; if (this._confirm !== id) { this._confirm = id; this._render(); return; }
        this._confirm = null; this._store.ws('family_planer/chore/delete', { chore_id: id }).catch((er) => this._flash(er)); return; }
      if (!this._ed) return;
      const ty = t.closest('[data-type]'); if (ty) { this._ed.schedule.type = ty.dataset.type; this._render(); return; }
      const pp = t.closest('[data-person]'); if (pp) { const id = pp.dataset.person; const l = this._ed.persons; this._ed.persons = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; this._render(); return; }
      if (t.closest('[data-rotate]')) { this._ed.rotate = !this._ed.rotate; this._render(); return; }
      const rd = t.closest('[data-rmdate]'); if (rd) { this._ed.schedule.dates = this._ed.schedule.dates.filter((x) => x !== rd.dataset.rmdate); this._render(); return; }
      if (t.closest('[data-cancel]')) { this._ed = null; this._render(); return; }
      if (t.closest('[data-save]')) this._save();
    }
    _change(e) {
      const el = e.target; const k = el.dataset.k; if (!k || !this._ed) return;
      const sc = this._ed.schedule; const num = (v) => (v === '' ? null : Number(v));
      if (k === 'title') this._ed.title = el.value;
      else if (k === 'points') this._ed.points = num(el.value);
      else if (k === 'window') this._ed.window = Math.max(1, Math.min(60, num(el.value) || 1));
      else if (k === 'adddate' && el.value) { const v = sc.type === 'yearly' ? el.value.slice(5) : el.value; if (!sc.dates.includes(v)) sc.dates = [...sc.dates, v].sort(); el.value = ''; }
      else if (k === 'start') sc.start = el.value || todayIso();
      else if (k === 'mstart') sc.start = (el.value || todayIso().slice(0, 7)) + '-01';
      else if (['every', 'day', 'nth', 'weekday'].includes(k)) sc[k] = num(el.value);
      else if (k === 'unit' || k === 'mode') sc[k] = el.value;
      this._render();
    }
    _flash(er) { this._msg = String((er && er.message) || er); this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4000); }
    async _save() {
      const e = this._ed; const sc = e.schedule;
      const sched = { type: sc.type };
      if (sc.type === 'interval') Object.assign(sched, { every: sc.every || 1, unit: sc.unit, start: sc.start });
      if (sc.type === 'monthly') Object.assign(sched, { every: sc.every || 1, start: sc.start, mode: sc.mode, ...(sc.mode === 'weekday' ? { nth: sc.nth, weekday: sc.weekday } : { day: sc.day }) });
      if (sc.type === 'yearly' || sc.type === 'once') sched.dates = sc.dates;
      if (!e.title.trim() || !e.persons.length || ((sc.type === 'yearly' || sc.type === 'once') && !sc.dates.length)) { this._flash(this.T.err); return; }
      const msg = { title: e.title.trim(), assign: {}, schedule: sched, persons: e.persons, rotate: e.rotate && e.persons.length > 1, window: e.window || 1 };
      if (e.id) msg.chore_id = e.id;
      if (typeof e.points === 'number') msg.points = Math.max(0, Math.min(1000, Math.round(e.points)));
      try { await this._store.ws('family_planer/chore/save', msg); this._ed = null; this._render(); } catch (er) { this._flash(er); }
    }
    _editor(s) {
      const T = this.T; const e = this._ed; const sc = e.schedule;
      const opt = (v, l, cur) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(l)}</option>`;
      let rule = '';
      if (sc.type === 'interval') rule = `${esc(T.every)} <input class="in n" type="number" min="1" max="365" data-k="every" value="${sc.every || 1}"> <select class="in" data-k="unit">${Object.entries(T.units).map(([v, l]) => opt(v, l, sc.unit)).join('')}</select> ${esc(T.from)} <input class="in d" type="date" data-k="start" value="${esc(sc.start)}">`;
      if (sc.type === 'monthly') rule = `${esc(T.every)} <input class="in n" type="number" min="1" max="24" data-k="every" value="${sc.every || 1}"> ${esc(T.mdays)} ${esc(T.from)} <input class="in d" type="month" data-k="mstart" value="${esc((sc.start || todayIso()).slice(0, 7))}">
        <select class="in" data-k="mode">${opt('day', T.onday, sc.mode)}${opt('weekday', T.onweekday, sc.mode)}</select>
        ${sc.mode === 'weekday' ? `<select class="in" data-k="nth">${['1', '2', '3', '4', '-1'].map((n) => opt(n, T.nths[n], sc.nth)).join('')}</select><select class="in" data-k="weekday">${T.wdl.map((w, i) => opt(i + 1, w, sc.weekday)).join('')}</select>`
          : `<select class="in" data-k="day">${[...Array(31)].map((_, i) => opt(i + 1, `${i + 1}.`, sc.day)).join('')}${opt(-1, T.last, sc.day)}</select>`}`;
      if (sc.type === 'yearly' || sc.type === 'once') rule = `<span class="chips">${sc.dates.map((d) => `<span class="dchip">${esc(sc.type === 'yearly' ? this._fmtMd(d) : this._fmtDate(d))}<button data-rmdate="${esc(d)}">✕</button></span>`).join('')}</span>
        <label class="adl">${esc(T.adddate)} <input class="in d" type="date" data-k="adddate"></label>`;
      return `<div class="ed">
        <input class="in t" data-k="title" placeholder="${esc(T.ph)}" value="${esc(e.title)}" maxlength="120">
        <div class="seg">${Object.entries(T.types).map(([v, l]) => `<button class="${sc.type === v ? 'on' : ''}" data-type="${v}">${esc(l)}</button>`).join('')}</div>
        <div class="rule">${rule}</div>
        <div class="row"><span class="lb">${esc(T.persons)}</span>${s.persons.map((p) => `<button class="pc${e.persons.includes(p.id) ? ' on' : ''}" data-person="${esc(p.id)}" style="--c:${COLOR(p.color)}">${esc(p.name)}</button>`).join('')}
          ${e.persons.length > 1 ? `<button class="pc tg${e.rotate ? ' on' : ''}" data-rotate>⇄ ${esc(T.rotate)}</button>` : ''}</div>
        <div class="row"><span class="lb">${esc(T.window)}</span><input class="in n" type="number" min="1" max="60" data-k="window" value="${e.window}"> ${esc(T.days)}
          <span class="lb" style="margin-left:18px">${esc(T.points)}</span><input class="in n" type="number" min="0" max="1000" data-k="points" value="${e.points ?? ''}" placeholder="${(s.gamification || {}).default_points || 10}"></div>
        <div class="row end"><button class="sg" data-cancel>${esc(T.cancel)}</button><button class="sg ok" data-save>${esc(T.save)}</button></div></div>`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._snap(); if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const T = this.T; const name = (pid) => (s.persons.find((p) => p.id === pid) || {}).name || '?';
      const list = s.chores.filter((c) => c.schedule);
      const rows = list.map((c) => `<div class="it">
          <div class="m"><b>${esc(c.title)}</b><span>${esc(this._summary(c))} · ${esc(T.win(c.window || 1))}${c.rotate ? ' · ' + esc(T.rot) : ''}${typeof c.points === 'number' ? ` · ${c.points} ${esc(T.points)}` : ''}</span>
          <span class="nx">${esc(T.next)}: ${(c.upcoming || []).map((u) => `${esc(this._fmtDate(u.date))} · ${esc(u.persons.map(name).join(', '))}`).join(' &nbsp;|&nbsp; ') || '–'}</span></div>
          <div class="ps">${(c.persons || []).map((pid) => { const p = s.persons.find((x) => x.id === pid); return p ? `<i style="background:${COLOR(p.color)}" title="${esc(p.name)}"></i>` : ''; }).join('')}</div>
          <button class="ib" data-edit="${esc(c.id)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>
          <button class="ib${this._confirm === c.id ? ' cf' : ''}" data-del="${esc(c.id)}">${this._confirm === c.id ? esc(T.del) : '<ha-icon icon="mdi:trash-can-outline"></ha-icon>'}</button></div>`).join('');
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-top:12px}
        .card{background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:18px 22px;color:var(--fp-text,#ececec);font-family:var(--fp-font);position:relative}
        h2{margin:0;font-size:17px;font-weight:600}.sub{font-size:13px;color:var(--fp-text2,#8c8c8c);margin:4px 0 14px}
        .it{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--fp-bg3,#262626);border:1px solid var(--fp-line,#2a2a2a);margin-bottom:8px}
        .m{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.m b{font-size:15px}.m span{font-size:12px;color:var(--fp-text2,#aaa)}.m .nx{color:${G}}
        .ps{display:flex;gap:4px}.ps i{width:14px;height:14px;border-radius:50%;display:inline-block}
        .ib{min-width:40px;height:40px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg4,#2e2e2e);color:var(--fp-text2,#bbb);cursor:pointer;font:inherit;font-size:12px}.ib.cf{color:#e06b6b;border-color:#e06b6b;padding:0 10px}
        ha-icon{--mdc-icon-size:18px}
        .add{height:40px;border-radius:10px;border:1px dashed var(--fp-line,#4a4a4a);background:none;color:${G};font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
        .none{color:var(--fp-text3,#777);font-size:13px;margin-bottom:10px}
        .ed{border:1px solid color-mix(in srgb,var(--fp-accent) 50%,transparent);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--fp-bg2,#232323);display:flex;flex-direction:column;gap:12px}
        .in{background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text,#eee);border-radius:9px;height:40px;padding:0 10px;font:inherit;font-size:14px;outline:none;box-sizing:border-box;color-scheme:dark}
        .in:focus{border-color:color-mix(in srgb,var(--fp-accent) 70%,transparent)}.in.t{width:100%;font-size:16px;height:44px}.in.n{width:76px;text-align:center}.in.d{width:auto}
        .seg{display:flex;gap:6px;flex-wrap:wrap}.seg button,.pc{height:36px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 14px;cursor:pointer}
        .seg button.on{background:color-mix(in srgb,var(--fp-accent) 1600%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:${G};font-weight:600}
        .pc{border-left:4px solid var(--c,#666)}.pc.on{background:var(--fp-bg4,#333);color:var(--fp-text,#fff);border-color:var(--c,${G})}.pc.tg{border-left:1px solid var(--fp-line,#3a3a3a)}.pc.tg.on{color:${G};border-color:${G}}
        .rule,.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--fp-text2,#ccc)}.row.end{justify-content:flex-end}
        .lb{font-size:12px;color:var(--fp-text3,#888);text-transform:uppercase;letter-spacing:.8px}
        .chips{display:flex;gap:6px;flex-wrap:wrap}.dchip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 4px 0 12px;border-radius:var(--fp-radius,16px);background:var(--fp-bg4,#333);font-size:13px}
        .dchip button{border:none;background:none;color:var(--fp-text2,#999);cursor:pointer;font-size:12px}.adl{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#999)}
        .sg{height:38px;border-radius:19px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;padding:0 16px;cursor:pointer}.sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}
        .msg{color:#e06b6b;font-size:13px;margin-top:8px}
      </style><div class="card"><h2>${esc(T.title)}</h2><div class="sub">${esc(T.sub)}</div>
        ${this._ed ? this._editor(s) : ''}
        ${rows || (this._ed ? '' : `<div class="none">${esc(T.none)}</div>`)}
        ${this._ed ? '' : `<button class="add" data-add>${esc(T.add)}</button>`}
        ${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}</div>`;
    }
  }
  if (!customElements.get('fp-special-inner')) customElements.define('fp-special-inner', FpSpecialInner);
})();

// ---------------------------------------------------------------------------
// To-dos without a date: assigned to a person, stay until done. Ticking off asks for confirmation
// (setting), unlike chores which are ticked with one tap. Shown below the planner and the chore plan.
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const TXT = {
    de: { title: 'To-dos', sub: 'Ohne Datum – bleiben stehen, bis sie erledigt sind.', none: 'Keine offenen To-dos.', ph: 'Neues To-do …', add: 'Hinzufügen',
      ask: '„{t}“ als erledigt markieren?', reopen: '„{t}“ wieder öffnen?', yes: 'Erledigt', yesOpen: 'Wieder öffnen', cancel: 'Abbrechen', del: 'Löschen',
      delAsk: '„{t}“ löschen?', pts: 'Punkte', sizeHint: 'Grösse ändern braucht die Eltern-PIN', err: 'Konnte nicht gespeichert werden.',
      sizes: { none: 'Ohne Punkte', s: 'Klein', m: 'Mittel', l: 'Gross' }, open: 'To-dos', openN: 'To-dos ({n})', close: 'Schliessen' },
    en: { title: 'To-dos', sub: 'No date – they stay until they are done.', none: 'No open to-dos.', ph: 'New to-do …', add: 'Add',
      ask: 'Mark "{t}" as done?', reopen: 'Reopen "{t}"?', yes: 'Done', yesOpen: 'Reopen', cancel: 'Cancel', del: 'Delete',
      delAsk: 'Delete "{t}"?', pts: 'points', sizeHint: 'Changing the size needs the parent PIN', err: 'Could not be saved.',
      sizes: { none: 'No points', s: 'Small', m: 'Medium', l: 'Large' }, open: 'To-dos', openN: 'To-dos ({n})', close: 'Close' },
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));

  class FpTodosInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this.T = TXT[cfg.lang === 'en' ? 'en' : 'de'];
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => { if (e.target.dataset.new !== undefined) this._text = e.target.value; });
        this.shadowRoot.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.new !== undefined) { e.preventDefault(); this._add(); } });
      }
      this._render();
    }
    set store(s) { this._store = s; }
    update() { if (!this._typing()) this._render(); }
    _typing() { const a = this.shadowRoot && this.shadowRoot.activeElement; return !!(a && a.tagName === 'INPUT'); }
    _snap() { return (this._store && this._store.snap) || null; }
    _flash(m) { this._msg = m; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 3500); }
    async _add() {
      const s = this._snap(); const title = String(this._text || '').trim(); if (!title || !s) return;
      const pid = this._person || (s.persons[0] && s.persons[0].id);
      const def = this._defSize(s); const size = this._size || def;
      try {
        if (size !== def) await window.FPPIN.call(this._store, 'family_planer/todo/save', { person_id: pid, title, size }, { lang: this._cfg.lang, host: this });
        else await this._store.ws('family_planer/todo/save', { person_id: pid, title });
        this._text = ''; this._size = null; this._render();
      } catch (e) { if (e !== (window.FPPIN && window.FPPIN.CANCEL)) this._flash(this.T.err); }
    }
    async _click(e) {
      const t = e.target; const s = this._snap(); if (!s) return;
      const p = t.closest('[data-person]'); if (p) { this._person = p.dataset.person; this._render(); return; }
      if (t.closest('[data-add]')) { this._add(); return; }
      const sz = t.closest('[data-size]'); if (sz) { this._size = sz.dataset.size; this._render(); return; }
      const td = t.closest('[data-todo]');
      if (td) {
        const it = (s.todos || []).find((x) => x.id === td.dataset.todo); if (!it) return;
        const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
        if (confirm || it.done) { this._dlg = { kind: 'done', it }; this._render(); return; }
        this._set(it, true); return;
      }
      const dl = t.closest('[data-del]'); if (dl) { const it = (s.todos || []).find((x) => x.id === dl.dataset.del); if (it) { this._dlg = { kind: 'del', it }; this._render(); } return; }
      if (t.closest('[data-yes]') && this._dlg) {
        const d = this._dlg; this._dlg = null;
        if (d.kind === 'done') this._set(d.it, !d.it.done);
        else { try { await this._store.ws('family_planer/todo/delete', { todo_id: d.it.id }); } catch (er) { this._flash(this.T.err); } }
        this._render(); return;
      }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    _defSize(s) { const v = s && s.todo_settings && s.todo_settings.size; return ['none', 's', 'm', 'l'].includes(v) ? v : 's'; }
    _pts(s, it) { const sz = (s.sizes && s.sizes.todo) || {}; return it.size ? (sz[it.size] || 0) : (it.points || 0); }
    async _set(it, done) { try { await this._store.ws('family_planer/todo/set', { todo_id: it.id, done }); } catch (e) { this._flash(this.T.err); } }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._snap(); const T = this.T; if (!s) { this.shadowRoot.innerHTML = ''; return; }
      const persons = s.persons || []; const todos = s.todos || [];
      const sel = persons.find((p) => p.id === this._person) || persons[0];
      const groups = persons.map((p) => ({ p, list: todos.filter((x) => x.person_id === p.id) })).filter((g) => g.list.length);
      const d = this._dlg;
      const dlg = !d ? '' : `<div class="ov"><div class="dlg"><div class="dh">${esc(fmt(d.kind === 'del' ? T.delAsk : d.it.done ? T.reopen : T.ask, { t: d.it.title }))}</div>
        <div class="ea"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg ${d.kind === 'del' ? 'del' : 'ok'}" data-yes>${esc(d.kind === 'del' ? T.del : d.it.done ? T.yesOpen : T.yes)}</button></div></div></div>`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-top:12px}
        .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:16px 18px;font-family:var(--fp-font);color:var(--fp-text,#ececec)}
        h3{margin:0;font-size:17px;font-weight:600}.sub{font-size:12px;color:var(--fp-text3,#888);margin:2px 0 12px}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
        .g{border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a);border-left:4px solid var(--c);padding:8px 10px}
        .gn{font-size:13px;font-weight:600;color:var(--c);margin:2px 2px 6px}
        .t{display:flex;align-items:center;gap:8px;width:100%;min-height:42px;padding:6px 8px;border-radius:9px;border:none;background:transparent;color:inherit;font:inherit;font-size:15px;text-align:left;cursor:pointer}
        .t:hover{background:var(--fp-bg3,#2a2a2a)}.box{width:22px;height:22px;border-radius:6px;border:2px solid var(--fp-line,#5a5a5a);flex:none;display:flex;align-items:center;justify-content:center}
        .t.done{color:var(--fp-text3,#777);text-decoration:line-through}.t.done .box{background:${G};border-color:${G};color:var(--fp-on-accent,#141414)}
        .tt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}.pt{font-size:11px;color:${G}}
        .x{width:30px;height:30px;border-radius:8px;border:none;background:transparent;color:var(--fp-text3,#777);cursor:pointer;flex:none}.x:hover{color:#e06b6b;background:var(--fp-bg4,#2e2e2e)}
        .row{display:flex}.empty{color:var(--fp-text3,#888);font-size:14px;padding:4px 2px 10px}
        .add{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
        .chip{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}.chip.on{border-color:var(--c);color:var(--c)}
        .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
        .in{flex:1;min-width:180px;height:42px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 12px;outline:none}
        .sizes{display:flex;flex-wrap:wrap;gap:6px}.sz{height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}
        .sz b{color:${G};font-weight:600}.sz.on{border-color:${G};color:var(--fp-text,#fff);background:var(--fp-bg2,#202820)}
        .sg{height:40px;border-radius:20px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}.sg.del{background:#3a2626;border-color:#e06b6b;color:#f3b4b4}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:18px;width:min(420px,92%)}.dh{font-size:16px;font-weight:600;margin-bottom:14px;line-height:1.4}
        .ea{display:flex;gap:8px}.sp{flex:1}
        .msg{position:absolute;right:14px;top:12px;background:#3a2626;border:1px solid #e06b6b;color:#fdd;padding:6px 12px;border-radius:10px;font-size:13px}
      </style><div class="card">
        <h3>${esc(T.title)}</h3><div class="sub">${esc(T.sub)}</div>
        ${groups.length ? `<div class="grid">${groups.map(({ p, list }) => `<div class="g" style="--c:${COLOR(p.color)}"><div class="gn">${esc(p.name)}</div>
          ${list.map((x) => `<div class="row"><button class="t${x.done ? ' done' : ''}" data-todo="${esc(x.id)}"><span class="box">${x.done ? '✓' : ''}</span><span class="tt">${esc(x.title)}</span>${this._pts(s, x) ? `<span class="pt">+${this._pts(s, x)}</span>` : ''}</button>
            <button class="x" data-del="${esc(x.id)}" aria-label="${esc(T.del)}">✕</button></div>`).join('')}</div>`).join('')}</div>` : `<div class="empty">${esc(T.none)}</div>`}
        <div class="add">${persons.map((p) => `<button class="chip${sel && p.id === sel.id ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-person="${esc(p.id)}"><i></i>${esc(p.name)}</button>`).join('')}
          <input class="in" data-new maxlength="80" placeholder="${esc(T.ph)}" value="${esc(this._text || '')}">
          <span class="sizes" title="${esc(T.sizeHint)}">${['none', 's', 'm', 'l'].map((k) => { const n = ((s.sizes && s.sizes.todo) || {})[k] || 0; const on = (this._size || this._defSize(s)) === k;
            return `<button class="sz${on ? ' on' : ''}" data-size="${k}">${esc(T.sizes[k])}${k !== 'none' ? ` <b>+${n}</b>` : ''}</button>`; }).join('')}</span>
          <button class="sg ok" data-add>${esc(T.add)}</button></div>
        ${dlg}${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}
      </div>`;
    }
  }
  if (!customElements.get('fp-todos-inner')) customElements.define('fp-todos-inner', FpTodosInner);
})();

// ---------------------------------------------------------------------------
// Settings page inside the planner (view: settings). Everything that the Home Assistant options dialogs
// offer, in one place, with a description next to every field. Always protected by the parent PIN.
// ---------------------------------------------------------------------------
(() => {
  const G = 'var(--fp-accent)';
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const L = (o, lang) => (o && (o[lang] || o.de)) || '';
  const clone = (o) => JSON.parse(JSON.stringify(o || {}));

  const UI = {
    de: { title: 'Einstellungen', locked: 'Die Einstellungen sind mit der Eltern-PIN geschützt.', unlock: 'Entsperren', save: 'Speichern', saved: 'Gespeichert.',
      reloading: 'Gespeichert – der Planer lädt die neuen Einstellungen …', cancel: 'Abbrechen', del: 'Löschen', add: 'Hinzufügen', none: '–', pin: 'Eltern-PIN ändern',
      pinChanged: 'Eltern-PIN geändert.', lock: 'Sperren', newPerson: '+ Person', newList: '+ Liste', delAsk: '„{t}“ wirklich löschen?', search: 'Entität wählen …',
      errors: { no_target: 'Bitte Alexa-Benachrichtigung oder TTS mit Lautsprechern wählen.', no_motion: 'Bitte mindestens einen Bewegungsmelder wählen.', no_modules: 'Mindestens ein Modul muss aktiv sein.',
        bad_times: 'Zeiten prüfen: Beginn vor Ende, Blöcke ohne Überschneidung.', name: 'Bitte einen (eindeutigen) Namen angeben.', last_person: 'Die letzte Person kann nicht entfernt werden.', list: 'Bitte Name und To-do-Liste angeben.' },
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], block: 'Block', from: 'von', to: 'bis' },
    en: { title: 'Settings', locked: 'The settings are protected by the parent PIN.', unlock: 'Unlock', save: 'Save', saved: 'Saved.',
      reloading: 'Saved – the planner is loading the new settings …', cancel: 'Cancel', del: 'Delete', add: 'Add', none: '–', pin: 'Change parent PIN',
      pinChanged: 'Parent PIN changed.', lock: 'Lock', newPerson: '+ Person', newList: '+ List', delAsk: 'Really delete "{t}"?', search: 'Choose entity …',
      errors: { no_target: 'Please choose an Alexa notify entity or TTS with speakers.', no_motion: 'Please choose at least one motion sensor.', no_modules: 'At least one module must be active.',
        bad_times: 'Check the times: start before end, blocks must not overlap.', name: 'Please enter a (unique) name.', last_person: 'The last person cannot be removed.', list: 'Please enter a name and a to-do list.' },
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], block: 'Block', from: 'from', to: 'to' },
  };

  // field: [key, type, {de, en} label, {de, en} description, extra]
  const F = (k, type, de, en, dde, den, x) => ({ k, type, label: { de, en }, desc: { de: dde, en: den }, ...(x || {}) });
  const TABS = [
    { id: 'general', icon: 'mdi:tune-variant', label: { de: 'Allgemein', en: 'General' }, fields: [
      F('mod_week', 'bool', 'Modul Wochenplan', 'Week plan module', 'Ämtli, Termine, Schule, Ferien, Punkte, Belohnungen und Ansagen.', 'Chores, events, school, holidays, points, rewards and announcements.'),
      F('mod_lists', 'bool', 'Modul Smarte Listen', 'Smart lists module', 'Einkaufs- und To-do-Listen, die sich selbst sortieren.', 'Shopping and to-do lists that sort themselves.'),
      F('language', 'select', 'Sprache des Family Planers', 'Family Planer language', 'Automatisch wie Profil/Home Assistant, oder fest Deutsch bzw. Englisch – unabhängig von Home Assistant.', 'Automatic like your profile/Home Assistant, or fixed German or English – independent of Home Assistant.',
        { opts: [['auto', { de: 'Automatisch', en: 'Automatic' }], ['de', 'Deutsch'], ['en', 'English']] }),
      F('theme_pin', 'bool', 'Design-Wechsel nur mit Eltern-PIN', 'Changing the design needs the parent PIN', 'Das Design wählt man oben rechts in der Navigation (Palette). Eingeschaltet fragt die Auswahl nach der Eltern-PIN.', 'The design is picked at the top right of the navigation (palette). When on, the picker asks for the parent PIN.'),
      F('fullscreen_dblclick', 'bool', 'Vollbild per Doppeltippen', 'Fullscreen on double tap', 'Doppeltippen auf eine freie Stelle blendet Kopfzeile und Seitenleiste aus; nochmals doppeltippen holt sie zurück.', 'Double-tap an empty spot to hide header and sidebar; double-tap again to bring them back.'),
      F('fullscreen_auto', 'bool', 'Beim Öffnen automatisch Vollbild', 'Fullscreen automatically when opened', 'Ideal für ein Wandtablet.', 'Ideal for a wall tablet.'),
      F('idle_seconds', 'num', 'Zurück zur Startansicht nach', 'Return to the start view after', 'Angetippter Tag / Person springt danach zurück zu heute.', 'A tapped day / person jumps back to today afterwards.', { min: 10, max: 600, unit: 's' }),
      F('panel', 'bool', 'Eintrag in der Seitenleiste', 'Sidebar entry', 'Öffnet den kompletten Planer ohne eigenes Dashboard.', 'Opens the complete planner without a dashboard of your own.'),
      F('panel_title', 'text', 'Titel in der Seitenleiste', 'Sidebar title', 'Leer = Name der Integration.', 'Empty = name of the integration.', { max: 40 }),
      F('rollover_time', 'time', 'Tageswechsel um', 'Day change at', 'Bis dahin können Ämtli des Vortags noch abgehakt werden.', 'Until then, the previous day\'s chores can still be ticked off.'),
      F('match_names', 'bool', 'Termine anhand von Namen zuordnen', 'Assign events by names', '„Lea Turnen“ erscheint bei Lea, auch wenn es im Kalender von Mama steht.', '"Lea gymnastics" appears at Lea even if it is in mum\'s calendar.'),
      F('show_owner', 'bool', 'Auch beim Kalenderbesitzer zeigen', 'Also show at the calendar owner', 'Zugeordnete Termine zusätzlich bei der Person des Kalenders anzeigen.', 'Show assigned events also at the calendar\'s person.'),
      F('admin_only_edit', 'bool', 'Plan nur durch Admins änderbar', 'Only admins may change the plan', 'Kinder können trotzdem abhaken und Belohnungen anfragen.', 'Children can still tick off chores and request rewards.'),
      F('reliability_days', 'num', 'Zuverlässigkeit berechnen über', 'Calculate reliability over', 'Zeitraum für die Prozentzahl pro Person.', 'Period for the percentage per person.', { min: 7, max: 90, unit: { de: 'Tage', en: 'days' } }),
      F('school_gap', 'num', 'Heimweg über Mittag ab', 'Lunch at home from', 'Pause in Minuten, ab der der Schultag in zwei Blöcke geteilt wird (0 = automatisch).', 'Break in minutes from which the school day is split into two blocks (0 = automatic).', { min: 0, max: 240, unit: 'min' }),
      F('school_window', 'num', 'Schule nur rund um die Schulzeit zeigen', 'Show school only around school time', 'So viele Minuten vor dem Losgehen bis nach dem Heimkommen erscheint der Schulblock in der Ansicht „Alles“ (0 = immer).', 'Minutes before leaving and after being home in which the school block shows in the "All" view (0 = always).', { min: 0, max: 240, unit: 'min' }),
    ] },
    { id: 'persons', icon: 'mdi:account-multiple-outline', label: { de: 'Personen & Schule', en: 'People & school' } },
    { id: 'vacation', icon: 'mdi:palm-tree', label: { de: 'Ferien', en: 'Holidays' }, fields: [
      F('enabled', 'bool', 'Ämtli in den Ferien pausieren', 'Pause chores during holidays', 'Ferientage zählen weder als erledigt noch als verpasst.', 'Holiday days count neither as done nor as missed.'),
      F('words', 'words', 'Wörter für Ferien', 'Words for holidays', 'Mit Komma getrennt. Wortenden zählen: „Ferien“ findet „Skiferien“.', 'Comma separated. Word endings count: "holiday" finds "ski holiday".'),
      F('scope', 'select', 'Ferien gelten für', 'Holidays apply to', 'Nur die Person des Kalenders bzw. die im Titel genannten – oder die ganze Familie.', 'Only the calendar\'s person or those named in the title – or the whole family.',
        { opts: [['owner', { de: 'Person / Genannte', en: 'Person / persons named' }], ['family', { de: 'Ganze Familie', en: 'Whole family' }]] }),
      F('min_hours', 'num', 'Ganzer Tag ab', 'Whole day from', 'Mindestdauer eines Termins mit Uhrzeit, um als Ferientag zu zählen.', 'Minimum duration of a timed event to count as a holiday.', { min: 12, max: 24, unit: 'h' }),
      F('refresh_minutes', 'num', 'Kalender prüfen alle', 'Check calendars every', 'Wie oft auf neue Ferien geprüft wird.', 'How often new holidays are checked.', { min: 15, max: 240, unit: 'min' }),
      F('rescan', 'bool', 'Kalender neu nach Ferien-Wörtern durchsuchen', 'Search calendars for holiday words again', 'Einmalig beim Speichern.', 'Once when saving.'),
    ] },
    { id: 'points', icon: 'mdi:star-circle-outline', label: { de: 'Punkte', en: 'Points' }, fields: [
      F('mode', 'select', 'Punkte verteilen', 'How points are given', 'Fair: ein ganz erledigter Tag ist für alle gleich viel wert. Pro Ämtli: mehr Ämtli, mehr Punkte.', 'Fair: a fully completed day is worth the same for everybody. Per chore: more chores, more points.',
        { opts: [['fair', { de: 'Fair', en: 'Fair' }], ['per_chore', { de: 'Pro Ämtli', en: 'Per chore' }]] }),
      F('day_points', 'num', 'Punkte für einen ganzen Tag (fair)', 'Points for a full day (fair)', 'Wird auf die Ämtli des Tages verteilt.', 'Split across the day\'s chores.', { min: 0, max: 1000 }),
      F('default_points', 'num', 'Punkte pro Ämtli (Standard bzw. Gewicht)', 'Points per chore (default or weight)', 'Pro Ämtli im Ämtliplan änderbar.', 'Can be changed per chore in the chore plan.', { min: 0, max: 1000 }),
      F('day_bonus', 'num', 'Tagesbonus', 'Day bonus', 'Für einen ganz erledigten Tag.', 'For a fully completed day.', { min: 0, max: 1000 }),
      F('streak_bonus', 'num', 'Serienbonus', 'Streak bonus', 'Für jede 7-Tage-Serie.', 'For every 7-day streak.', { min: 0, max: 1000 }),
      F('reward_value', 'num', 'Gegenwert einer grossen Belohnung', 'Value of a large reward', 'Gross = so viel, wie man in einem Monat mit allen Ämtli inkl. Boni verdient. Klein = ¼, Mittel = ½, Mega = 2×, Riesig = 5×. Nur zur Orientierung.', 'Large = what you earn in a month with every chore done incl. bonuses. Small = ¼, medium = ½, mega = 2×, giant = 5×. Just a guide.', { min: 0, max: 100000, step: 0.5 }),
      F('currency', 'text', 'Währung', 'Currency', 'z. B. CHF oder €.', 'e.g. CHF or €.', { max: 8 }),
      F('reward_notify', 'entities', 'Anfragen zusätzlich melden an', 'Also send requests to', 'z. B. die Handy-App – zusätzlich zur Mitteilung in Home Assistant.', 'e.g. the mobile app – in addition to the Home Assistant notification.', { domain: 'notify' }),
    ] },
    { id: 'todos', icon: 'mdi:checkbox-marked-circle-outline', label: { de: 'To-dos', en: 'To-dos' }, fields: [
      F('confirm', 'bool', 'Erledigen bestätigen', 'Confirm completion', 'To-dos werden erst nach der Frage „Als erledigt markieren?“ abgehakt.', 'To-dos are only ticked off after the question "Mark as done?".'),
      F('size', 'select', 'Standard-Grösse', 'Default size', 'Gross = Punkte für einen ganzen Tag, Mittel = ⅔, Klein = ⅓ (aufgerundet). Eine andere Grösse beim Anlegen braucht die Eltern-PIN. Zählt nicht zum fairen Tageswert.', 'Large = points for a full day, medium = ⅔, small = ⅓ (rounded up). Another size when adding needs the parent PIN. Does not count towards the fair day value.',
        { opts: [['none', { de: 'Ohne Punkte', en: 'No points' }], ['s', { de: 'Klein', en: 'Small' }], ['m', { de: 'Mittel', en: 'Medium' }], ['l', { de: 'Gross', en: 'Large' }]] }),
      F('keep_days', 'num', 'Erledigte anzeigen für', 'Show finished ones for', '0 = bis zum nächsten Tageswechsel.', '0 = until the next day change.', { min: 0, max: 30, unit: { de: 'Tage', en: 'days' } }),
    ] },
    { id: 'announce', icon: 'mdi:bullhorn-outline', label: { de: 'Ansagen', en: 'Announcements' }, fields: [
      F('enabled', 'bool', 'Ansagen einschalten', 'Enable announcements', 'Sagt bei Bewegung an, wer noch Ämtli offen hat.', 'Announces on motion who still has chores open.'),
      F('motion', 'entities', 'Bewegungsmelder', 'Motion sensors', 'Bewegung, Präsenz oder Anwesenheit.', 'Motion, presence or occupancy.', { domain: 'binary_sensor', classes: ['motion', 'occupancy', 'presence'] }),
      F('notify', 'entities', 'Ansage über (Alexa)', 'Announce via (Alexa)', 'Benachrichtigungs-Entität „Ankündigen“ oder „Sprechen“ der Integration Alexa Devices.', 'Notify entity "Announce" or "Speak" of the Alexa Devices integration.', { domain: 'notify' }),
      F('tts', 'entity', 'Sprachausgabe (TTS)', 'Text-to-speech (TTS)', 'Alternativ zu Alexa, zusammen mit Lautsprechern.', 'Alternative to Alexa, together with speakers.', { domain: 'tts' }),
      F('media_players', 'entities', 'Lautsprecher für TTS', 'Speakers for TTS', '', '', { domain: 'media_player' }),
      F('start', 'time', 'Von', 'From', 'Zeitfenster für Ämtli-Erinnerungen.', 'Time window for chore reminders.'),
      F('end', 'time', 'Bis', 'Until', '', ''),
      F('cooldown', 'num', 'Höchstens alle', 'At most every', 'Pause zwischen zwei Erinnerungen.', 'Pause between two reminders.', { min: 5, max: 720, unit: 'min' }),
      F('all_done', 'bool', 'Auch ansagen, wenn alles erledigt ist', 'Also announce when everything is done', 'Einmal pro Tag.', 'Once a day.'),
      F('persons', 'persons', 'Nur für', 'Only for', 'Leer = alle Personen.', 'Empty = everyone.'),
      F('max_items', 'num', 'Ämtli pro Person in der Ansage', 'Chores per person in the announcement', 'Weitere als „und 2 weitere“.', 'Further ones as "and 2 more".', { min: 1, max: 10 }),
      F('queue', 'bool', 'Warteschlange für einmalige Meldungen', 'Queue for one-off messages', 'Meldungen warten auf die nächste Bewegung.', 'Messages wait for the next motion.'),
      F('queue_start', 'time', 'Meldungen frühestens ab', 'Messages not before', 'Ruhezeiten der Warteschlange.', 'Quiet hours of the queue.'),
      F('queue_end', 'time', 'Meldungen spätestens bis', 'Messages not after', '', ''),
      F('queue_rewards', 'bool', 'Freigegebene Belohnungen ansagen', 'Announce approved rewards', '', ''),
      F('reward_hours', 'num', 'Belohnungs-Meldung gültig für', 'Reward message valid for', '0 = bis zum Tageswechsel.', '0 = until the day change.', { min: 0, max: 48, unit: 'h' }),
      F('queue_special', 'bool', 'Besondere Ämtli ansagen', 'Announce special chores', 'Entfällt, sobald das Ämtli erledigt ist.', 'Dropped once the chore is done.'),
    ] },
    { id: 'lists', icon: 'mdi:cart-outline', label: { de: 'Listen', en: 'Lists' }, fields: [
      F('optimize_time', 'time', 'Tägliche Optimierung um', 'Daily optimisation at', 'Ordnet Unbekanntes unter „Sonstiges“ neu ein.', 'Re-sorts unknown items from "Other".'),
      F('ai_task', 'entity', 'KI-Aufgabe (optional)', 'AI task (optional)', 'Ordnet auch Unbekanntes ein (OpenAI, Google, Ollama …).', 'Also sorts unknown items (OpenAI, Google, Ollama …).', { domain: 'ai_task' }),
      F('prune_days', 'num', 'Ungenutzte Kategorie ersetzen nach', 'Replace unused category after', 'Macht Platz, wenn die Liste voll ist.', 'Makes room when the list is full.', { min: 7, max: 365, unit: { de: 'Tage', en: 'days' } }),
    ] },
  ];
  const SECTION = { general: 'general', vacation: 'vacation', points: 'points', todos: 'todos', announce: 'announce', lists: 'lists_settings' };

  class FpSettingsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this._lang = cfg.lang === 'en' ? 'en' : 'de'; this.T = UI[this._lang];
      this._tab = this._tab || 'general';
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this._click(e));
        this.shadowRoot.addEventListener('input', (e) => this._input(e));
        this.shadowRoot.addEventListener('change', (e) => this._input(e, true));
      }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    update() { if (!this._data && window.FPPIN && window.FPPIN.unlocked(this._store)) this._load(); }
    connectedCallback() { if (!this._data && !this._asked) { this._asked = true; setTimeout(() => this._load(), 50); } }
    _ctx() { return { lang: this._lang, host: this }; }
    _flash(m, err) { this._msg = m; this._err = !!err; this._render(); clearTimeout(this._mt); this._mt = setTimeout(() => { this._msg = ''; this._render(); }, 4500); }
    _errText(e) {
      const code = String((e && (e.code || e.message)) || e).replace(/^invalid_/, '');
      return this.T.errors[code] || (e && e.message) || code;
    }
    async _call(type, data) {
      try { return await window.FPPIN.call(this._store, type, data, this._ctx()); } catch (e) {
        if (e === window.FPPIN.CANCEL) return null;
        if (e && e.code === 'pin_required') { this._data = null; }
        this._flash(this._errText(e), true); return null;
      }
    }
    async _load() {
      if (!this._store || !window.FPPIN) return;
      const res = await this._call('family_planer/settings/get', {});
      if (!res) { this._render(); return; }
      this._data = res; this._forms = {};
      for (const t of TABS) if (t.fields) this._forms[t.id] = this._formFor(t.id);
      this._persons = clone(res.persons); this._lists = clone(res.lists);
      this._render();
    }
    _formFor(id) {
      const d = this._data;
      if (id === 'general') { const g = clone(d.general); g.mod_week = g.modules.week; g.mod_lists = g.modules.lists; return g; }
      if (id === 'lists') return clone(d.lists_settings);
      return clone(d[id]);
    }
    _input(e, isChange) {
      const el = e.target; const ds = el.dataset;
      if (ds.k && ds.tab) {
        const f = this._forms[ds.tab]; if (!f) return;
        if (el.type === 'checkbox') f[ds.k] = el.checked;
        else if (el.type === 'number') f[ds.k] = el.value === '' ? '' : Number(el.value);
        else if (ds.type === 'words') f[ds.k] = el.value;
        else if (ds.addent !== undefined) { if (isChange && el.value) { const cur = Array.isArray(f[ds.k]) ? f[ds.k] : []; if (!cur.includes(el.value)) cur.push(el.value); f[ds.k] = cur; this._render(); } }
        else f[ds.k] = el.value || (ds.type === 'entity' ? null : el.value);
        if (el.tagName === 'SELECT' && isChange && ds.addent === undefined) this._render();
        return;
      }
      if (ds.pk) { // person field
        const p = this._persons[Number(ds.pi)]; if (!p) return;
        if (ds.pk === 'time') { const [day, n, w] = ds.pt.split('|'); const t = p.school.times; const spans = t[day] || (t[day] = [[null, null], [null, null]]); while (spans.length < 2) spans.push([null, null]); spans[Number(n)][w === 's' ? 0 : 1] = el.value || null; return; }
        if (ds.pk === 'school_calendar') p.school.calendar = el.value || null;
        else if (ds.pk === 'travel') p.school.travel = Number(el.value) || 0;
        else if (ds.pk === 'aliases') p.aliases = el.value.split(',').map((x) => x.trim()).filter(Boolean);
        else p[ds.pk] = el.value || (ds.pk === 'calendar' ? null : el.value);
        return;
      }
      if (ds.lk) { const l = this._lists[Number(ds.li)]; if (!l) return; l[ds.lk] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value; }
    }
    async _click(e) {
      const t = e.target;
      if (t.closest('[data-unlock]')) { this._load(); return; }
      const tab = t.closest('[data-tabsel]'); if (tab) { this._tab = tab.dataset.tabsel; this._render(); return; }
      if (t.closest('[data-chpin]')) { try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); } return; }
      if (t.closest('[data-lock]')) { window.FPPIN.lock(this._store); this._data = null; this._render(); return; }
      const rm = t.closest('[data-rment]');
      if (rm) { const f = this._forms[rm.dataset.tab]; f[rm.dataset.k] = (f[rm.dataset.k] || []).filter((x) => x !== rm.dataset.rment); this._render(); return; }
      const pc = t.closest('[data-pchip]');
      if (pc) { const f = this._forms[pc.dataset.tab]; const cur = f[pc.dataset.k] || []; f[pc.dataset.k] = cur.includes(pc.dataset.pchip) ? cur.filter((x) => x !== pc.dataset.pchip) : [...cur, pc.dataset.pchip]; this._render(); return; }
      if (t.closest('[data-savetab]')) { this._saveTab(); return; }
      const sp = t.closest('[data-psave]'); if (sp) { this._savePerson(Number(sp.dataset.psave)); return; }
      const dp = t.closest('[data-pdel]'); if (dp) { const p = this._persons[Number(dp.dataset.pdel)]; this._dlg = { kind: 'person', i: Number(dp.dataset.pdel), title: p.name }; this._render(); return; }
      if (t.closest('[data-padd]')) { this._persons.push({ id: null, name: '', color: '#4FA3E0', calendar: null, aliases: [], school: { calendar: null, times: {}, travel: 0 }, open: true }); this._render(); return; }
      const po = t.closest('[data-popen]'); if (po) { const p = this._persons[Number(po.dataset.popen)]; p.open = !p.open; this._render(); return; }
      const ls = t.closest('[data-lsave]'); if (ls) { this._saveList(Number(ls.dataset.lsave)); return; }
      const ld = t.closest('[data-ldel]'); if (ld) { const l = this._lists[Number(ld.dataset.ldel)]; this._dlg = { kind: 'list', i: Number(ld.dataset.ldel), title: l.name }; this._render(); return; }
      if (t.closest('[data-ladd]')) { this._lists.push({ id: null, name: '', entity: null, icon: 'mdi:cart-outline', max_categories: 10, auto: true }); this._render(); return; }
      if (t.closest('[data-yes]') && this._dlg) { const d = this._dlg; this._dlg = null; if (d.kind === 'person') await this._removePerson(d.i); else await this._removeList(d.i); this._render(); return; }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    async _saveTab() {
      const id = this._tab; const f = { ...this._forms[id] };
      if (id === 'general') { f.modules = { week: !!f.mod_week, lists: !!f.mod_lists }; delete f.mod_week; delete f.mod_lists; }
      if (id === 'vacation' && typeof f.words === 'string') f.words = f.words.split(',').map((x) => x.trim()).filter(Boolean);
      const res = await this._call('family_planer/settings/save', { section: SECTION[id], data: f });
      if (!res) return;
      if (id === 'vacation') this._forms.vacation.rescan = false;
      this._flash(res.reload ? this.T.reloading : this.T.saved);
    }
    async _savePerson(i) {
      const p = this._persons[i]; const times = {};
      for (const [day, spans] of Object.entries(p.school.times || {})) {
        const ok = spans.filter((s) => s && s[0] && s[1]).map((s) => [s[0].slice(0, 5), s[1].slice(0, 5)]);
        if (spans.some((s) => s && ((s[0] && !s[1]) || (!s[0] && s[1])))) { this._flash(this.T.errors.bad_times, true); return; }
        if (ok.length) times[day] = ok;
      }
      const data = { name: p.name, color: p.color, calendar: p.calendar, aliases: p.aliases || [], school: { calendar: p.school.calendar, times, travel: p.school.travel || 0 } };
      const res = await this._call('family_planer/settings/person', { ...(p.id ? { person_id: p.id } : {}), data });
      if (!res) return; p.id = res.person_id; p.open = false; this._flash(res.reload ? this.T.reloading : this.T.saved);
    }
    async _removePerson(i) { const p = this._persons[i]; if (!p.id) { this._persons.splice(i, 1); return; } const res = await this._call('family_planer/settings/person_remove', { person_id: p.id }); if (res) { this._persons.splice(i, 1); this._flash(this.T.reloading); } }
    async _saveList(i) {
      const l = this._lists[i];
      const res = await this._call('family_planer/settings/list', { ...(l.id ? { list_id: l.id } : {}), data: { name: l.name, entity: l.entity, icon: l.icon, max_categories: l.max_categories, auto: l.auto } });
      if (res) { l.id = res.list_id; this._flash(this.T.saved); }
    }
    async _removeList(i) { const l = this._lists[i]; if (!l.id) { this._lists.splice(i, 1); return; } const res = await this._call('family_planer/settings/list_remove', { list_id: l.id }); if (res !== null) { this._lists.splice(i, 1); this._flash(this.T.saved); } }

    _entities(domain, classes) {
      const st = (this._hass && this._hass.states) || {};
      return Object.keys(st).filter((e) => e.startsWith(domain + '.') && (!classes || classes.includes((st[e].attributes || {}).device_class)))
        .sort().map((e) => [e, (st[e].attributes || {}).friendly_name || e]);
    }
    _entSelect(attrs, domain, classes, value, placeholder) {
      const opts = this._entities(domain, classes);
      if (value && !opts.some(([e]) => e === value)) opts.unshift([value, value]);
      return `<select class="in" ${attrs}><option value="">${esc(placeholder || this.T.none)}</option>${opts.map(([e, n]) => `<option value="${esc(e)}" ${e === value ? 'selected' : ''}>${esc(n)} · ${esc(e)}</option>`).join('')}</select>`;
    }
    _field(tab, fd, v) {
      const lang = this._lang; const a = `data-tab="${tab}" data-k="${fd.k}" data-type="${fd.type}"`;
      const unit = fd.unit ? `<span class="u">${esc(typeof fd.unit === 'string' ? fd.unit : L(fd.unit, lang))}</span>` : '';
      let ctl = '';
      if (fd.type === 'bool') return `<label class="row b"><span class="lt"><b>${esc(L(fd.label, lang))}</b>${fd.desc[lang] ? `<small>${esc(L(fd.desc, lang))}</small>` : ''}</span><input type="checkbox" class="sw" ${a} ${v ? 'checked' : ''}></label>`;
      if (fd.type === 'num') ctl = `<span class="nw"><input class="in n" type="number" inputmode="${fd.step && fd.step < 1 ? 'decimal' : 'numeric'}" min="${fd.min}" max="${fd.max}" step="${fd.step || 1}" ${a} value="${esc(v)}">${unit}</span>`;
      else if (fd.type === 'time') ctl = `<input class="in t" type="time" ${a} value="${esc(String(v || '').slice(0, 5))}">`;
      else if (fd.type === 'text') ctl = `<input class="in" maxlength="${fd.max || 80}" ${a} value="${esc(v)}">`;
      else if (fd.type === 'words') ctl = `<input class="in" maxlength="600" ${a} value="${esc(Array.isArray(v) ? v.join(', ') : v)}">`;
      else if (fd.type === 'select') ctl = `<select class="in" ${a}>${fd.opts.map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(typeof l === 'string' ? l : L(l, lang))}</option>`).join('')}</select>`;
      else if (fd.type === 'entity') ctl = this._entSelect(a, fd.domain, fd.classes, v);
      else if (fd.type === 'entities') {
        const cur = Array.isArray(v) ? v : [];
        ctl = `<div class="ents">${cur.map((e) => `<span class="ec">${esc(((this._hass && this._hass.states[e]) || { attributes: {} }).attributes.friendly_name || e)}<button data-rment="${esc(e)}" data-tab="${tab}" data-k="${fd.k}" aria-label="x">✕</button></span>`).join('')}
          ${this._entSelect(`${a} data-addent`, fd.domain, fd.classes, '', '+ ' + this.T.search)}</div>`;
      } else if (fd.type === 'persons') {
        const cur = Array.isArray(v) ? v : [];
        ctl = `<div class="ents">${(this._data.persons || []).map((p) => `<button class="chip${cur.includes(p.id) ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-pchip="${esc(p.id)}" data-tab="${tab}" data-k="${fd.k}"><i></i>${esc(p.name)}</button>`).join('')}</div>`;
      }
      return `<div class="row"><span class="lt"><b>${esc(L(fd.label, lang))}</b>${fd.desc[lang] ? `<small>${esc(L(fd.desc, lang))}</small>` : ''}</span><span class="ctl">${ctl}</span></div>`;
    }
    _personsTab() {
      const T = this.T; const lang = this._lang;
      const lbl = (de, en) => (lang === 'en' ? en : de);
      return `${this._persons.map((p, i) => {
        const times = (p.school && p.school.times) || {};
        const sch = [1, 2, 3, 4, 5, 6].map((d) => { const spans = times[String(d)] || []; return `<div class="day"><b>${esc(T.days[d - 1])}</b>${[0, 1].map((n) => { const s = spans[n] || [null, null];
          return `<span class="blk">${esc(T.block)} ${n + 1}: <input class="in t" type="time" data-pk="time" data-pi="${i}" data-pt="${d}|${n}|s" value="${esc((s[0] || '').slice(0, 5))}"> – <input class="in t" type="time" data-pk="time" data-pi="${i}" data-pt="${d}|${n}|e" value="${esc((s[1] || '').slice(0, 5))}"></span>`; }).join('')}</div>`; }).join('');
        return `<div class="pcard" style="--c:${COLOR(p.color)}"><button class="ph" data-popen="${i}"><i></i><b>${esc(p.name || lbl('Neue Person', 'New person'))}</b><span class="sp"></span><ha-icon icon="${p.open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon></button>
          ${p.open ? `<div class="pb">
            <div class="row"><span class="lt"><b>${lbl('Name', 'Name')}</b></span><span class="ctl"><input class="in" maxlength="40" data-pk="name" data-pi="${i}" value="${esc(p.name)}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Farbe', 'Colour')}</b><small>${lbl('Gilt auch für den Kalender der Person.', 'Also used for the person\'s calendar.')}</small></span><span class="ctl"><input class="col" type="color" data-pk="color" data-pi="${i}" value="${esc(COLOR(p.color))}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Kalender', 'Calendar')}</b><small>${lbl('Termine dieser Person.', 'Events of this person.')}</small></span><span class="ctl">${this._entSelect(`data-pk="calendar" data-pi="${i}"`, 'calendar', null, p.calendar)}</span></div>
            <div class="row"><span class="lt"><b>${lbl('Spitznamen', 'Nicknames')}</b><small>${lbl('Mit Komma getrennt – Termine mit diesem Namen erscheinen bei der Person.', 'Comma separated – events with this name appear at the person.')}</small></span><span class="ctl"><input class="in" maxlength="300" data-pk="aliases" data-pi="${i}" value="${esc((p.aliases || []).join(', '))}"></span></div>
            <div class="sec2">${lbl('Schule & Stundenplan', 'School & timetable')}</div>
            <div class="row"><span class="lt"><b>${lbl('Schulkalender', 'School calendar')}</b><small>${lbl('Kalender mit den Lektionen – hat Vorrang vor festen Zeiten.', 'Calendar with the lessons – takes priority over fixed times.')}</small></span><span class="ctl">${this._entSelect(`data-pk="school_calendar" data-pi="${i}"`, 'calendar', null, p.school && p.school.calendar)}</span></div>
            <div class="row"><span class="lt"><b>${lbl('Schulweg', 'Travel time')}</b><small>${lbl('Zeigt „los“ und „zuhause“ pro Block (0 = aus).', 'Shows "leave" and "home" per block (0 = off).')}</small></span><span class="ctl"><span class="nw"><input class="in n" type="number" min="0" max="240" data-pk="travel" data-pi="${i}" value="${esc((p.school && p.school.travel) || 0)}"><span class="u">min</span></span></span></div>
            <div class="days">${sch}</div>
            <div class="acts">${p.id ? `<button class="sg del" data-pdel="${i}">${esc(T.del)}</button>` : ''}<span class="sp"></span><button class="sg ok" data-psave="${i}">${esc(T.save)}</button></div>
          </div>` : ''}</div>`; }).join('')}
        <button class="addb" data-padd>${esc(T.newPerson)}</button>`;
    }
    _listsExtra() {
      const T = this.T; const lbl = (de, en) => (this._lang === 'en' ? en : de);
      return `<div class="sec2">${lbl('Listen', 'Lists')}</div>${this._lists.map((l, i) => `<div class="lcard">
          <input class="in" maxlength="40" placeholder="${lbl('Name', 'Name')}" data-lk="name" data-li="${i}" value="${esc(l.name)}">
          ${this._entSelect(`data-lk="entity" data-li="${i}"`, 'todo', null, l.entity, lbl('To-do-Liste wählen …', 'Choose to-do list …'))}
          <input class="in" maxlength="70" placeholder="mdi:cart-outline" data-lk="icon" data-li="${i}" value="${esc(l.icon)}">
          <label class="mini">${lbl('Max. Kategorien', 'Max. categories')} <input class="in n" type="number" min="5" max="20" data-lk="max_categories" data-li="${i}" value="${esc(l.max_categories)}"></label>
          <label class="mini"><input type="checkbox" class="sw" data-lk="auto" data-li="${i}" ${l.auto ? 'checked' : ''}> ${lbl('Kategorien automatisch pflegen', 'Maintain categories automatically')}</label>
          <span class="acts"><button class="sg del" data-ldel="${i}">${esc(T.del)}</button><button class="sg ok" data-lsave="${i}">${esc(T.save)}</button></span></div>`).join('')}
        <button class="addb" data-ladd>${esc(T.newList)}</button>`;
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const T = this.T; const lang = this._lang;
      const style = `<style>
        :host{display:block}
        .card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:18px;font-family:var(--fp-font);color:var(--fp-text,#ececec);min-height:360px}
        .top{display:flex;align-items:center;gap:10px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg3,#262626);color:var(--fp-text2,#bbb);font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
        .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
        .tab{display:flex;align-items:center;gap:8px;height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--fp-line,#2a2a2a);background:var(--fp-bg2,#232323);color:var(--fp-text2,#bbb);font:inherit;font-size:14px;cursor:pointer}
        .tab.on{border-color:${G};color:${G};background:var(--fp-bg3,#262626);font-weight:600}
        .rows{display:flex;flex-direction:column;gap:2px;max-width:980px}
        .row{display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1.1fr);gap:16px;align-items:center;padding:12px 4px;border-bottom:1px solid var(--fp-line,#262626)}
        .row.b{grid-template-columns:1fr auto;cursor:pointer}
        .lt{display:flex;flex-direction:column;gap:3px}.lt b{font-size:15px;font-weight:500}.lt small{font-size:12px;color:var(--fp-text3,#8a8a8a);line-height:1.4}
        .ctl{display:flex;justify-content:flex-start}
        .in{height:42px;border-radius:10px;border:1px solid var(--fp-line,#333);background:var(--fp-bg0,#141414);color:var(--fp-text,#eee);font:inherit;font-size:15px;padding:0 12px;outline:none;width:100%;box-sizing:border-box;min-width:0}
        .in:focus{border-color:${G}}select.in{padding:0 8px}.in.n{width:110px}.in.t{width:120px}
        .nw{display:flex;align-items:center;gap:8px}.u{color:var(--fp-text3,#888);font-size:13px}
        .sw{appearance:none;-webkit-appearance:none;width:50px;height:30px;border-radius:15px;background:var(--fp-bg4,#3a3a3a);position:relative;cursor:pointer;flex:none;margin:0;transition:background .15s}
        .sw::after{content:'';position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#ddd;transition:left .15s}
        .sw:checked{background:${G}}.sw:checked::after{left:23px;background:#fff}
        .ents{display:flex;flex-wrap:wrap;gap:6px;width:100%}.ents select{flex:1;min-width:200px}
        .ec{display:flex;align-items:center;gap:6px;height:34px;padding:0 4px 0 12px;border-radius:17px;background:var(--fp-bg3,#2b2b2b);border:1px solid var(--fp-line,#3a3a3a);font-size:13px}
        .ec button{width:26px;height:26px;border-radius:13px;border:none;background:transparent;color:var(--fp-text2,#999);cursor:pointer}.ec button:hover{color:#e06b6b}
        .chip{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2b2b2b);color:var(--fp-text2,#ccc);font:inherit;font-size:13px;cursor:pointer}.chip.on{border-color:var(--c);color:var(--c)}
        .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
        .bar{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;max-width:980px}
        .sg{height:42px;border-radius:21px;background:var(--fp-bg4,#2e2e2e);border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);font:inherit;font-size:14px;padding:0 18px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:var(--fp-on-accent,#141414);font-weight:600}.sg.del{background:#3a2626;border-color:#e06b6b;color:#f3b4b4}
        .pcard{border:1px solid var(--fp-line,#2a2a2a);border-left:4px solid var(--c);border-radius:12px;background:var(--fp-bg2,#232323);margin-bottom:10px;max-width:980px}
        .ph{display:flex;align-items:center;gap:10px;width:100%;height:52px;padding:0 14px;border:none;background:transparent;color:inherit;font:inherit;font-size:16px;cursor:pointer}
        .ph i{width:14px;height:14px;border-radius:50%;background:var(--c)}.sp{flex:1}
        .pb{padding:0 14px 14px}.col{width:60px;height:42px;border:none;background:transparent;padding:0;cursor:pointer}
        .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 4px 6px}
        .days{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin-top:8px}
        .day{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:10px;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a)}.day b{font-size:13px;color:var(--fp-text2,#bbb)}
        .blk{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fp-text3,#888)}.blk .in.t{width:110px;height:38px}
        .acts{display:flex;gap:8px;margin-top:14px;align-items:center}
        .addb{height:46px;border-radius:12px;border:1px dashed var(--fp-line,#4a4a4a);background:transparent;color:var(--fp-text2,#bbb);font:inherit;font-size:14px;cursor:pointer;padding:0 18px;margin-top:4px}
        .lcard{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:8px;align-items:center;padding:12px;border-radius:12px;background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#2a2a2a);margin-bottom:8px;max-width:980px}
        .lcard .mini{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--fp-text2,#aaa)}.lcard .acts{margin:0;justify-content:flex-end}
        .lockd{display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 20px;color:var(--fp-text2,#aaa);text-align:center}.lockd ha-icon{--mdc-icon-size:48px;color:${G}}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:var(--fp-radius,16px);display:flex;align-items:center;justify-content:center;z-index:4}
        .dlg{background:var(--fp-bg2,#232323);border:1px solid var(--fp-line,#3a3a3a);border-radius:14px;padding:18px;width:min(420px,92%)}.dh{font-size:16px;font-weight:600;margin-bottom:14px}
        .msg{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#2e3a2a;border:1px solid ${G};color:var(--fp-text,#dfe);padding:10px 18px;border-radius:12px;font-size:14px;z-index:20;max-width:80%}
        .msg.e{background:#3a2626;border-color:#e06b6b;color:#fdd}
        @media (max-width:700px){.row{grid-template-columns:1fr}.lcard{grid-template-columns:1fr}}
      </style>`;
      const msg = this._msg ? `<div class="msg${this._err ? ' e' : ''}">${esc(this._msg)}</div>` : '';
      if (!this._data) {
        this.shadowRoot.innerHTML = `${style}<div class="card"><div class="top"><h2>${esc(T.title)}</h2></div>
          <div class="lockd"><ha-icon icon="mdi:shield-lock-outline"></ha-icon><div>${esc(T.locked)}</div><button class="sg ok" data-unlock>${esc(T.unlock)}</button></div>${msg}</div>`;
        return;
      }
      const tab = TABS.find((x) => x.id === this._tab) || TABS[0];
      let body = '';
      if (tab.id === 'persons') body = this._personsTab();
      else {
        const f = this._forms[tab.id];
        body = `<div class="rows">${tab.fields.map((fd) => this._field(tab.id, fd, f[fd.k])).join('')}</div><div class="bar"><button class="sg ok" data-savetab>${esc(T.save)}</button></div>`;
        if (tab.id === 'lists') body += this._listsExtra();
      }
      const d = this._dlg;
      const dlg = d ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.delAsk.replace('{t}', d.title || ''))}</div><div class="acts"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-yes>${esc(T.del)}</button></div></div></div>` : '';
      const mods = this._data.general.modules;
      const tabs = TABS.filter((x) => !((x.id === 'lists' && !mods.lists) || (['persons', 'vacation', 'points', 'todos', 'announce'].includes(x.id) && !mods.week)));
      this.shadowRoot.innerHTML = `${style}<div class="card">
        <div class="top"><h2>${esc(T.title)}</h2><button class="tb" data-chpin><ha-icon icon="mdi:form-textbox-password"></ha-icon>${esc(T.pin)}</button><button class="tb" data-lock><ha-icon icon="mdi:lock-outline"></ha-icon>${esc(T.lock)}</button></div>
        <div class="tabs">${tabs.map((x) => `<button class="tab${x.id === tab.id ? ' on' : ''}" data-tabsel="${x.id}"><ha-icon icon="${x.icon}"></ha-icon>${esc(L(x.label, lang))}</button>`).join('')}</div>
        ${body}${dlg}${msg}</div>`;
    }
  }
  if (!customElements.get('fp-settings-inner')) customElements.define('fp-settings-inner', FpSettingsInner);
})();

// ---------------------------------------------------------------------------
// Parent PIN: keypad dialog, forced change of the start PIN 123456, short-lived unlock token.
// window.FPPIN.call(store, type, data, { lang, host }) sends a PIN-protected command and asks for the PIN
// only when needed. The PIN itself is never stored in the browser – only the server's 10-minute token in memory.
// ---------------------------------------------------------------------------
(() => {
  if (window.FPPIN) return;
  const TXT = {
    de: { unlock: 'Eltern-PIN', old: 'Aktuelle PIN', neu: 'Neue PIN (4–8 Ziffern)', again: 'Neue PIN wiederholen', ok: 'OK', cancel: 'Abbrechen',
      start: 'Die Start-PIN 123456 muss zuerst geändert werden.', wrong: 'Falsche PIN.', locked: 'Zu viele Fehlversuche – bitte 5 Minuten warten.',
      bad: 'Die neue PIN muss 4–8 Ziffern haben und darf nicht 123456 sein.', nomatch: 'Die PINs stimmen nicht überein.', changed: 'PIN geändert.' },
    en: { unlock: 'Parent PIN', old: 'Current PIN', neu: 'New PIN (4–8 digits)', again: 'Repeat new PIN', ok: 'OK', cancel: 'Cancel',
      start: 'The start PIN 123456 must be changed first.', wrong: 'Wrong PIN.', locked: 'Too many wrong tries – please wait 5 minutes.',
      bad: 'The new PIN must have 4–8 digits and must not be 123456.', nomatch: 'The PINs do not match.', changed: 'PIN changed.' },
  };
  const VARS = ['--fp-bg0', '--fp-bg1', '--fp-bg2', '--fp-bg3', '--fp-bg4', '--fp-line', '--fp-text', '--fp-text2', '--fp-text3', '--fp-accent', '--fp-on-accent', '--fp-radius', '--fp-font'];
  const tokens = new Map(); // store -> { t, exp }
  const CANCEL = 'cancel';

  // one keypad dialog; steps = [{ title, hint }] -> resolves with the entered values
  function keypad(ctx, steps, firstMsg) {
    const T = TXT[ctx.lang === 'en' ? 'en' : 'de'];
    return new Promise((resolve, reject) => {
      const el = document.createElement('div');
      const cs = ctx.host ? getComputedStyle(ctx.host) : null;
      el.style.cssText = 'position:fixed;inset:0;z-index:9999;' + (cs ? VARS.map((v) => `${v}:${cs.getPropertyValue(v)}`).join(';') : '');
      const root = el.attachShadow({ mode: 'open' });
      const vals = []; let step = 0; let pin = ''; let msg = firstMsg || ''; let err = !!firstMsg;
      const close = () => { el.remove(); document.removeEventListener('keydown', onKey, true); };
      const press = (k) => {
        if (k === 'del') pin = pin.slice(0, -1);
        else if (k === 'ok') { if (pin.length < 4) return; vals.push(pin); pin = ''; step += 1; msg = ''; if (step >= steps.length) { close(); resolve(vals); return; } }
        else if (pin.length < 8 && /^\d$/.test(k)) pin += k;
        draw();
      };
      const onKey = (e) => {
        if (e.key === 'Escape') { close(); reject(CANCEL); return; }
        if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') press('ok'); else return;
        e.preventDefault(); e.stopPropagation();
      };
      document.addEventListener('keydown', onKey, true);
      root.addEventListener('click', (e) => {
        const k = e.target.closest('[data-k]'); if (k) { press(k.dataset.k); return; }
        if (e.target.closest('[data-x]') || e.target.classList.contains('ov')) { close(); reject(CANCEL); }
      });
      const draw = () => {
        const s = steps[step];
        root.innerHTML = `<style>
          .ov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:var(--fp-font,system-ui,sans-serif)}
          .d{background:var(--fp-bg2,#232323);color:var(--fp-text,#eee);border:1px solid var(--fp-line,#3a3a3a);border-radius:var(--fp-radius,16px);padding:20px;width:290px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5)}
          h3{margin:0 0 4px;font-size:16px;font-weight:600}.st{font-size:12px;color:var(--fp-text3,#888);margin-bottom:8px}
          .m{font-size:13px;min-height:18px;margin:4px 0 8px;color:var(--fp-text2,#bbb)}.m.e{color:#E06B6B}
          .dots{display:flex;gap:10px;justify-content:center;margin:8px 0 14px}.dots i{width:12px;height:12px;border-radius:50%;border:2px solid var(--fp-text3,#666)}.dots i.on{background:var(--fp-accent,#69C350);border-color:var(--fp-accent,#69C350)}
          .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
          button{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
          .k{height:56px;border-radius:12px;border:1px solid var(--fp-line,#3a3a3a);background:var(--fp-bg3,#2e2e2e);color:var(--fp-text,#eee);font-size:21px}
          .k.ok{background:var(--fp-accent,#69C350);color:var(--fp-on-accent,#141414);font-size:15px;font-weight:600}
          .x{height:38px;border-radius:19px;background:transparent;border:1px solid var(--fp-line,#3a3a3a);color:var(--fp-text2,#ccc);padding:0 18px}
        </style><div class="ov"><div class="d" role="dialog" aria-modal="true">
          <h3>${s.title}</h3>${steps.length > 1 ? `<div class="st">${step + 1} / ${steps.length}</div>` : ''}
          <div class="m${err ? ' e' : ''}">${msg || s.hint || ''}</div>
          <div class="dots">${Array.from({ length: Math.max(4, pin.length) }, (_, i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join('')}</div>
          <div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((k) => `<button class="k${k === 'ok' ? ' ok' : ''}" data-k="${k}" aria-label="${k}">${k === 'del' ? '⌫' : k === 'ok' ? T.ok : k}</button>`).join('')}</div>
          <button class="x" data-x>${T.cancel}</button></div></div>`;
        err = false;
      };
      draw();
      document.body.appendChild(el);
    });
  }

  const T = (ctx) => TXT[ctx.lang === 'en' ? 'en' : 'de'];
  const cached = (store) => { const c = tokens.get(store); return c && c.exp > Date.now() ? c.t : null; };
  const remember = (store, res) => { tokens.set(store, { t: res.token, exp: Date.now() + Math.max(60, (res.ttl || 600) - 60) * 1000 }); return res.token; };

  async function change(store, ctx, msg) {
    let note = msg || T(ctx).start;
    for (;;) {
      const [old, neu, again] = await keypad(ctx, [{ title: T(ctx).old }, { title: T(ctx).neu }, { title: T(ctx).again }], note);
      if (neu !== again) { note = T(ctx).nomatch; continue; }
      try { return remember(store, await store.ws('family_planer/pin/change', { old, new: neu })); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_wrong') note = T(ctx).wrong; else if (c === 'pin_locked') note = T(ctx).locked; else if (c === 'pin_bad_pin') note = T(ctx).bad; else throw e;
      }
    }
  }

  async function ensure(store, ctx) {
    const t = cached(store); if (t) return t;
    if (store.snap && store.snap.pin_default) return change(store, ctx);
    let note = '';
    for (;;) {
      const [pin] = await keypad(ctx, [{ title: T(ctx).unlock }], note);
      try { return remember(store, await store.ws('family_planer/pin/unlock', { pin })); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_change_required') return change(store, ctx);
        if (c === 'pin_wrong') note = T(ctx).wrong; else if (c === 'pin_locked') note = T(ctx).locked; else throw e;
      }
    }
  }

  async function call(store, type, data, ctx) {
    for (let i = 0; i < 3; i += 1) {
      const token = await ensure(store, ctx);
      try { return await store.ws(type, { ...(data || {}), token }); } catch (e) {
        const c = e && e.code;
        if (c === 'pin_required') { tokens.delete(store); continue; }
        if (c === 'pin_change_required') { tokens.delete(store); await change(store, ctx); continue; }
        throw e;
      }
    }
    throw new Error('pin');
  }

  window.FPPIN = {
    call, ensure, CANCEL,
    change: (store, ctx) => change(store, ctx, ' '),
    unlocked: (store) => !!cached(store),
    lock: (store) => tokens.delete(store),
    token: (store) => cached(store),
  };
})();

// ---------------------------------------------------------------------------
// Fullscreen on double tap: hides the Home Assistant sidebar and header (and uses real browser fullscreen
// where allowed). Double-tap again to leave. Taps on buttons, chores and inputs never trigger it.
// window.FPKIOSK.attach(element, store)
// ---------------------------------------------------------------------------
(() => {
  if (window.FPKIOSK) return;
  const STYLE_ID = 'fp-kiosk-style';
  let on = false;
  let autoDone = false;

  const roots = () => {
    const out = [];
    try {
      const ha = document.querySelector('home-assistant'); const main = ha && ha.shadowRoot && ha.shadowRoot.querySelector('home-assistant-main');
      const mr = main && main.shadowRoot; if (!mr) return out;
      out.push([mr, 'ha-sidebar{display:none!important} ha-drawer{--mdc-drawer-width:0px!important} :host{--mdc-drawer-width:0px!important}']);
      const drawer = mr.querySelector('ha-drawer'); if (drawer && drawer.shadowRoot) out.push([drawer.shadowRoot, '.mdc-drawer{display:none!important;width:0!important} .mdc-drawer-app-content{margin-left:0!important;margin-inline-start:0!important}']);
      const ppr = mr.querySelector('partial-panel-resolver');
      const lov = ppr && ppr.querySelector('ha-panel-lovelace');
      const root = lov && lov.shadowRoot && lov.shadowRoot.querySelector('hui-root');
      if (root && root.shadowRoot) out.push([root.shadowRoot, '.header,.toolbar,app-header{display:none!important} #view,.view,hui-view-container{padding-top:0!important;min-height:100vh!important} :host{--header-height:0px!important}']);
    } catch (e) { /* layout of Home Assistant changed – real fullscreen still works */ }
    return out;
  };
  const apply = (state) => {
    for (const [root, css] of roots()) {
      let st = root.getElementById ? root.getElementById(STYLE_ID) : root.querySelector('#' + STYLE_ID);
      if (state) { if (!st) { st = document.createElement('style'); st.id = STYLE_ID; root.appendChild(st); } st.textContent = css; } else if (st) st.remove();
    }
    window.dispatchEvent(new Event('resize'));
  };
  const set = (state, gesture) => {
    on = state; apply(on);
    const de = document.documentElement;
    try {
      if (on && gesture && de.requestFullscreen && !document.fullscreenElement) de.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) { /* not allowed (e.g. iOS) – hiding header and sidebar is enough */ }
  };
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && on) { on = false; apply(false); } });
  window.addEventListener('location-changed', () => { if (on) setTimeout(() => apply(true), 300); });

  const INTERACTIVE = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'LABEL', 'HA-ICON-BUTTON', 'HA-SWITCH', 'HA-CHECKBOX']);
  // only elements between the tap target and the planner itself count; data-fp-theme marks hosts, not controls
  const interactive = (path, host) => {
    for (const n of path) {
      if (n === host) return false;
      if (!n || n.nodeType !== 1) continue;
      const keys = Object.keys(n.dataset || {}).filter((k) => k !== 'fpTheme');
      if (INTERACTIVE.has(n.tagName) || n.getAttribute('role') === 'button' || n.hasAttribute('contenteditable') || keys.length) return true;
    }
    return false;
  };

  function attach(el, store) {
    if (el.__fpKiosk) return; el.__fpKiosk = true;
    let last = 0; let lx = 0; let ly = 0;
    const enabled = () => !(store && store.snap && store.snap.settings && store.snap.settings.fullscreen_dblclick === false);
    el.addEventListener('pointerup', (e) => {
      if (e.__fpk || !enabled() || e.button > 0) return; e.__fpk = true;
      if (interactive(e.composedPath(), el)) { last = 0; return; }
      const now = Date.now();
      if (now - last < 350 && Math.abs(e.clientX - lx) < 30 && Math.abs(e.clientY - ly) < 30) { last = 0; set(!on, true); return; }
      last = now; lx = e.clientX; ly = e.clientY;
    });
    const auto = () => { if (!autoDone && store && store.snap && store.snap.settings && store.snap.settings.fullscreen_auto) { autoDone = true; setTimeout(() => set(true, false), 400); } };
    if (store) store.listen(auto);
  }
  window.FPKIOSK = { attach, set, get on() { return on; } };
})();

// ---------------------------------------------------------------------------
// Family Planer integration bridge
// Feeds the dashboard UI from the integration (websocket "family_planer/subscribe")
// and turns UI writes into family_planer/* commands. Cards:
//   type: custom:family-planer-card      view: week | plan | lists   (entry_id, language optional)
//   type: custom:family-planer-nav-card
// ---------------------------------------------------------------------------
(() => {
  const VIRT = { plan: 'family_planer.plan', heute: 'family_planer.heute', verlauf: 'family_planer.verlauf', settings: 'family_planer.settings', script: 'family_planer.rollover' };
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const IMAGE = (i) => (/^(av:[a-z0-9.+]{1,80}|svg:[a-z-]{1,30}|img:\/family_planer_files\/avatars\/[a-z0-9_]{1,120}\.(jpg|png|webp))$/.test(i || '') ? i : '');
  const isVirt = (e) => typeof e === 'string' && e.startsWith('family_planer.');
  const enc = (o) => 'fp1:' + JSON.stringify(o);
  const dec = (s) => { if (!s || !String(s).startsWith('fp1:')) return {}; try { return JSON.parse(String(s).slice(4)) || {}; } catch (e) { return {}; } };

  class Store {
    constructor(conn, entryId) {
      this.conn = conn; this.entryId = entryId; this.snap = null; this.err = null; this.subs = new Set();
      this._subscribe(0);
    }
    // the integration reloads after some settings changes: subscribe again until it is back
    _subscribe(tries) {
      const msg = { type: 'family_planer/subscribe' }; if (this.entryId) msg.entry_id = this.entryId;
      this.unsub = this.conn.subscribeMessage((s) => {
        if (s && s.reload) { this._resubscribe(); return; }
        this.snap = s; this.err = null; this.subs.forEach((f) => f());
      }, msg).catch((e) => {
        if (tries > 0 && tries < 30) { setTimeout(() => this._subscribe(tries + 1), 2000); return; }
        this.err = (e && e.message) || String(e); this.subs.forEach((f) => f());
      });
    }
    _resubscribe() {
      const old = this.unsub; this.unsub = null;
      Promise.resolve(old).then((u) => { if (typeof u === 'function') u(); }).catch(() => {});
      setTimeout(() => this._subscribe(1), 1500);
    }
    static get(conn, entryId) {
      const reg = Store._reg || (Store._reg = new Map());
      const k = entryId || '';
      let s = reg.get(k);
      if (!s || s.conn !== conn) { s = new Store(conn, entryId); reg.set(k, s); }
      return s;
    }
    listen(f) { this.subs.add(f); if (this.snap || this.err) setTimeout(f, 0); return () => this.subs.delete(f); }
    ws(type, data) { const m = { type, ...data }; if (this.entryId) m.entry_id = this.entryId; return this.conn.sendMessagePromise(m); }
    person(id) { return ((this.snap && this.snap.persons) || []).find((p) => p.id === id); }
    personByName(n) { return ((this.snap && this.snap.persons) || []).find((p) => p.name === n); }

    // ---------- snapshot -> legacy todo items
    items(kind) {
      const s = this.snap; if (!s) return [];
      const name = (pid) => (this.person(pid) || {}).name || pid;
      if (kind === 'plan') return s.chores.filter((c) => !c.schedule).map((c) => ({ uid: c.id, summary: c.title, status: 'needs_action', description: enc({ ...this.toLegacy(c.assign), ...(typeof c.points === 'number' ? { p: c.points } : {}) }) }));
      if (kind === 'heute') return s.items.map((i) => ({ uid: i.id, summary: i.title, status: i.done ? 'completed' : 'needs_action', description: enc({ k: name(i.person_id), d: i.start, e: i.due, c: i.chore_id }) }));
      if (kind === 'verlauf') return Object.entries(s.history).map(([day, per]) => ({ uid: day, summary: day, status: 'completed',
        description: enc({ s: Object.entries(per).map(([pid, r]) => [name(pid), r.done, r.total]), x: Object.entries(per).flatMap(([pid, r]) => (r.missed || []).map((t) => [name(pid), t])) }) }));
      if (kind === 'settings') return [{ uid: 'personen', summary: 'Personen', status: 'needs_action',
        description: enc({ p: Object.fromEntries(s.persons.map((p) => [p.name, { farbe: COLOR(p.color), bild: IMAGE(p.image), alias: p.aliases || [] }])) }) }];
      return [];
    }
    toLegacy(assign) {
      const z = {}, r = {}, f = {};
      for (const [pid, days] of Object.entries(assign || {})) {
        const n = (this.person(pid) || {}).name; if (!n) continue;
        z[n] = Object.keys(days).map(Number).sort((a, b) => a - b);
        for (const [d, rule] of Object.entries(days)) {
          if (rule.every > 1) r[`${n}|${d}`] = [rule.every, rule.offset || 0];
          if (rule.window > 1) f[`${n}|${d}`] = rule.window;
        }
      }
      const o = { z }; if (Object.keys(r).length) o.r = r; if (Object.keys(f).length) o.f = f; return o;
    }
    fromLegacy(m) {
      const assign = {}; const z = (m && m.z) || (m && m.k ? { [m.k]: m.t || [] } : {});
      for (const [n, days] of Object.entries(z)) {
        const p = this.personByName(n); if (!p) continue;
        const a = assign[p.id] = {};
        for (const d of days) {
          const rr = (m.r || {})[`${n}|${d}`]; const every = rr && rr[0] > 1 ? rr[0] : 1;
          a[String(d)] = { every, offset: every > 1 ? ((rr[1] % every) + every) % every : 0, window: Math.max(1, Math.min(14, (m.f || {})[`${n}|${d}`] || 1)) };
        }
      }
      return assign;
    }

    // ---------- legacy writes -> integration commands
    async todo(kind, service, data) {
      if (kind === 'heute' && service === 'update_item') return this.ws('family_planer/item/set', { item_id: data.item, done: data.status === 'completed' });
      if (kind === 'plan') {
        if (service === 'add_item') return this.ws('family_planer/chore/save', { title: data.item, assign: this.fromLegacy(dec(data.description)) });
        if (service === 'update_item') {
          const c = this.snap.chores.find((x) => x.id === data.item); if (!c) throw new Error('Ämtli nicht gefunden');
          const msg = { chore_id: c.id, title: data.rename || c.title, assign: data.description ? this.fromLegacy(dec(data.description)) : c.assign };
          const pts = 'points' in data ? data.points : c.points;
          if (typeof pts === 'number') msg.points = pts;
          return this.ws('family_planer/chore/save', msg);
        }
        if (service === 'remove_item') return Promise.all([].concat(data.item).map((id) => this.ws('family_planer/chore/delete', { chore_id: id })));
      }
      if (kind === 'settings' && (service === 'add_item' || service === 'update_item')) {
        const p = dec(data.description).p || {};
        return Promise.all(Object.entries(p).map(([n, o]) => {
          const per = this.personByName(n); if (!per) return null;
          const patch = { person_id: per.id };
          if (/^#[0-9A-Fa-f]{6}$/.test(o.farbe || '')) patch.color = o.farbe;
          if (typeof o.bild === 'string') patch.image = o.bild;
          if (Array.isArray(o.alias)) patch.aliases = o.alias;
          return this.ws('family_planer/person/update', patch);
        }));
      }
      return null;
    }
  }

  // hass object handed to the inner UI: real hass + virtual todo entities
  const wrapHass = (hass, store) => {
    const real = hass.connection;
    const conn = Object.create(real, {
      subscribeMessage: { value: (cb, msg) => {
        if (msg && msg.type === 'todo/item/subscribe' && isVirt(msg.entity_id)) {
          const kind = Object.keys(VIRT).find((k) => VIRT[k] === msg.entity_id);
          const off = store.listen(() => { if (store.err) return; cb({ items: store.items(kind) }); });
          return store.err ? Promise.reject(new Error(store.err)) : Promise.resolve(off);
        }
        return real.subscribeMessage(cb, msg);
      } },
    });
    return Object.create(hass, {
      connection: { value: conn },
      fpUpload: { value: (name, data) => { const p = store.personByName(name); if (!p) return Promise.reject(new Error(name)); return store.ws('family_planer/person/upload_image', { person_id: p.id, data }); } },
      callService: { value: (domain, service, data, target) => {
        const ent = target && target.entity_id;
        if (domain === 'todo' && isVirt(ent)) return store.todo(Object.keys(VIRT).find((k) => VIRT[k] === ent), service, data || {});
        if (domain === 'script' && ent === VIRT.script) return store.ws('family_planer/rollover', {});
        return hass.callService(domain, service, data, target);
      } },
    });
  };

  // card option `language` > integration setting (Design & sidebar) > profile / HA language
  const LANG = (hass, cfg, store) => {
    const fixed = store && store.snap && store.snap.settings && store.snap.settings.language;
    const l = String((cfg && cfg.language) || (fixed === 'de' || fixed === 'en' ? fixed : '') ||
      (hass && ((hass.locale && hass.locale.language) || hass.language)) || 'de').toLowerCase();
    return l.startsWith('de') || l.startsWith('gsw') ? 'de' : 'en';
  };
  const INNER = { week: 'fp-week-inner', plan: 'fp-plan-inner', lists: 'fp-lists-inner', rewards: 'fp-rewards-inner', settings: 'fp-settings-inner' };
  const STORE_VIEWS = ['lists', 'rewards', 'settings'];
  const tag = (view, lang) => (!STORE_VIEWS.includes(view) && lang === 'en' ? INNER[view] + '-en' : INNER[view]);
  // designs: CSS variables read by every card (inherited through the shadow roots)
  const SYS = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const THEMES = {
    loxone: { bg0: '#141414', bg1: '#1e1e1e', bg2: '#232323', bg3: '#262626', bg4: '#2e2e2e', line: '#333', text: '#ececec', text2: '#aaa', text3: '#777', accent: '#69C350', 'on-accent': '#141414', radius: '16px', font: SYS },
    ha: { bg0: 'var(--primary-background-color,#111)', bg1: 'var(--ha-card-background,var(--card-background-color,#1c1c1c))', bg2: 'var(--secondary-background-color,#202020)',
      bg3: 'color-mix(in srgb,var(--primary-text-color,#fff) 6%,var(--card-background-color,#1c1c1c))', bg4: 'color-mix(in srgb,var(--primary-text-color,#fff) 11%,var(--card-background-color,#1c1c1c))',
      line: 'var(--divider-color,#333)', text: 'var(--primary-text-color,#eee)', text2: 'var(--secondary-text-color,#aaa)', text3: 'var(--disabled-text-color,#777)',
      accent: 'var(--primary-color,#03a9f4)', 'on-accent': 'var(--text-primary-color,#fff)', radius: 'var(--ha-card-border-radius,12px)', font: 'var(--ha-font-family-body,Roboto,sans-serif)' },
    apple: { bg0: '#000', bg1: '#1c1c1e', bg2: '#242426', bg3: '#2c2c2e', bg4: '#3a3a3c', line: '#38383a', text: '#fff', text2: '#aeaeb2', text3: '#8e8e93', accent: '#FF9F0A', 'on-accent': '#000', radius: '22px', font: SYS },
    google: { bg0: '#131314', bg1: '#1e1f20', bg2: '#242628', bg3: '#2d2f31', bg4: '#37393b', line: '#444746', text: '#e3e3e3', text2: '#c4c7c5', text3: '#8e918f', accent: '#a8c7fa', 'on-accent': '#062e6f', radius: '24px', font: '"Google Sans",Roboto,Arial,sans-serif' },
    light: { bg0: '#f2f3f5', bg1: '#ffffff', bg2: '#f6f7f9', bg3: '#eef0f3', bg4: '#e4e7eb', line: '#dfe3e8', text: '#1f2328', text2: '#57606a', text3: '#8c959f', accent: '#1f7aec', 'on-accent': '#ffffff', radius: '16px', font: SYS },
    nord: { bg0: '#242933', bg1: '#2e3440', bg2: '#343b48', bg3: '#3b4252', bg4: '#434c5e', line: '#4c566a', text: '#eceff4', text2: '#d8dee9', text3: '#9aa3b5', accent: '#88c0d0', 'on-accent': '#2e3440', radius: '16px', font: SYS },
  };
  const THEME_NAMES = { ha: { de: 'Home Assistant', en: 'Home Assistant' }, loxone: { de: 'Loxone', en: 'Loxone' }, apple: { de: 'Apple Home', en: 'Apple Home' },
    google: { de: 'Google Home', en: 'Google Home' }, light: { de: 'Hell', en: 'Light' }, nord: { de: 'Nord', en: 'Nord' } };
  // miniature of the planner in a design: top bar, a person column and a few chore tiles (one ticked off)
  const themeMini = (name) => {
    const t = THEMES[name]; const r = `calc(${t.radius} / 3)`;
    const tile = (on) => `<i style="display:block;height:9px;border-radius:3px;background:${on ? t.accent : t.bg4};border:1px solid ${t.line}"></i>`;
    return `<span class="mini" style="background:${t.bg0};border-radius:${r}">
      <span style="display:flex;gap:4px;align-items:center;background:${t.bg1};border:1px solid ${t.line};border-radius:5px;padding:3px 5px">
        <b style="width:18px;height:4px;border-radius:2px;background:${t.text3}"></b><b style="margin-left:auto;width:14px;height:6px;border-radius:3px;background:${t.accent}"></b><b style="width:14px;height:6px;border-radius:3px;background:${t.bg3}"></b></span>
      <span style="display:grid;grid-template-columns:14px 1fr 1fr;gap:4px;margin-top:4px;background:${t.bg1};border:1px solid ${t.line};border-radius:5px;padding:4px">
        <b style="width:12px;height:12px;border-radius:50%;background:${t.accent};opacity:.85"></b>${tile(true)}${tile(false)}
        <b style="width:12px;height:12px;border-radius:50%;background:${t.text2};opacity:.6"></b>${tile(false)}${tile(true)}</span></span>`;
  };
  const themeSwatch = (name) => { const t = THEMES[name];
    return `<span class="sw" style="background:${t.bg1};border-color:${t.line}"><i style="background:${t.accent}"></i><i style="background:${t.bg4}"></i><i style="background:${t.text2}"></i></span>`; };
  const applyTheme = (el, name) => {
    const t = THEMES[name] || THEMES.loxone;
    Object.entries(t).forEach(([k, v]) => el.style.setProperty(`--fp-${k}`, v));
    el.dataset.fpTheme = THEMES[name] ? name : 'loxone';
  };
  const MSG = { de: { off: 'Das Modul „{m}“ ist ausgeschaltet. Einschalten unter Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren → Module.', week: 'Wochenplan', lists: 'Smarte Listen' },
    en: { off: 'The module "{m}" is switched off. Switch it on under Settings → Devices & services → Family Planer → Configure → Modules.', week: 'Week plan', lists: 'Smart lists' } };

  class FamilyPlanerCard extends HTMLElement {
    static getStubConfig() { return { view: 'week' }; }
    setConfig(c) {
      this._cfg = { view: 'week', ...(c || {}) };
      if (!INNER[this._cfg.view]) throw new Error('view: week | plan | lists | rewards | settings');
      this._sig = null; this._inner = null; this.innerHTML = ''; this._attach();
    }
    set hass(h) { this._hass = h; this._attach(); if (this._inner && this._wrapped) this._inner.hass = STORE_VIEWS.includes(this._cfg.view) ? h : this._wrap(); }
    // to-do window of the planer (opened from the button in the top bar of the week view)
    _todoWin(lang) {
      if (!this._win || this._win.parentNode !== this) {
        const win = document.createElement('div');
        win.style.cssText = 'position:fixed;inset:0;z-index:20;display:none;align-items:flex-start;justify-content:center;background:rgba(10,10,10,.72);padding:6vh 3vw;overflow:auto;box-sizing:border-box';
        const box = document.createElement('div'); box.style.cssText = 'position:relative;width:min(1000px,100%)';
        const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕';
        x.setAttribute('aria-label', lang === 'en' ? 'Close' : 'Schliessen');
        x.style.cssText = 'position:absolute;right:10px;top:22px;z-index:5;width:40px;height:40px;border-radius:20px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ddd;font-size:18px;cursor:pointer';
        x.addEventListener('click', () => this._showTodos(false));
        win.addEventListener('click', (e) => { if (e.target === win) this._showTodos(false); });
        box.appendChild(x); win.appendChild(box); this.appendChild(win);
        this._win = win; this._winBox = box;
      }
      if (!this._todoEv) {
        this._todoEv = true;
        this.addEventListener('fp-open-todos', () => this._showTodos(true));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._win && this._win.style.display !== 'none') this._showTodos(false); });
      }
      return this._winBox;
    }
    _showTodos(on) { if (this._win) this._win.style.display = on ? 'flex' : 'none'; if (on && this._todos) this._todos.update(); }
    getCardSize() { return this._cfg && this._cfg.view === 'plan' ? 10 : 12; }
    getGridOptions() { return { columns: 'full', min_rows: 6 }; }
    connectedCallback() { this._attach(); }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; } }
    _wrap() { if (!this._wrapped || this._wrappedFor !== this._hass) { this._wrapped = wrapHass(this._hass, this._store); this._wrappedFor = this._hass; } return this._wrapped; }
    _attach() {
      if (!this._hass || !this._cfg || !this.isConnected || this._off) return;
      this._store = Store.get(this._hass.connection, this._cfg.entry_id);
      this._off = this._store.listen(() => this._sync());
      if (window.FPKIOSK) window.FPKIOSK.attach(this, this._store);
    }
    _sync() {
      const s = this._store.snap;
      if (!s) { if (this._store.err) this.innerHTML = `<ha-card style="padding:16px">Family Planer: ${this._store.err}</ha-card>`; return; }
      const lang = LANG(this._hass, this._cfg, this._store); const view = this._cfg.view;
      const mod = view === 'lists' ? 'lists' : view === 'settings' ? null : 'week';
      applyTheme(this, this._cfg.theme || s.theme);
      if (mod && s.modules && s.modules[mod] === false) {
        this._inner = null; this._sig = 'off';
        this.innerHTML = `<ha-card style="padding:20px;color:#bbb;background:#1e1e1e">${MSG[lang].off.replace('{m}', MSG[lang][mod])}</ha-card>`; return;
      }
      window.FP_DAY_OFFSET_MIN = s.day_offset_min || 0;
      if (STORE_VIEWS.includes(view)) {
        if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._inner = document.createElement(INNER[view]); this._inner.store = this._store; this._inner.setConfig({ lang }); this.appendChild(this._inner); this._inner.hass = this._hass; this._wrapped = true; }
        else this._inner.update();
        return;
      }
      const st = s.settings || {};
      const kinder = s.persons.map((p) => ({ name: p.name, farbe: COLOR(p.color), ...(IMAGE(p.image) ? { bild: IMAGE(p.image) } : {}), alias: p.aliases || [] }));
      const schoolName = lang === 'en' ? 'School' : 'Schule';
      const kalender = s.persons.filter((p) => p.calendar).map((p) => ({ entity: p.calendar, person: p.name }))
        .concat(s.persons.filter((p) => p.school && p.school.calendar).map((p) => ({ entity: p.school.calendar, person: p.name, schule: true, name: schoolName })))
        .concat((this._cfg.kalender || []).map((k) => (typeof k === 'string' ? { entity: k } : k)));
      const roll = st.rollover_time && st.rollover_time !== '00:00' ? st.rollover_time : '24:00';
      const cfg = { ...this._cfg, punkte_standard: (s.gamification || {}).default_points, titel: this._cfg.titel || (view === 'plan' ? (lang === 'en' ? 'Chore plan' : 'Ämtliplan') : s.title), kinder, kalender,
        schule: Object.fromEntries(s.persons.filter((p) => p.school && (p.school.calendar || Object.keys(p.school.times || {}).length))
          .map((p) => [p.name, { zeiten: p.school.times || {}, weg: p.school.travel || 0 }])),
        abwesend: Object.fromEntries(s.persons.map((p) => [p.name, (s.away || {})[p.id] || []])),
        tage_zuverlaessigkeit: st.reliability_days || 30, schulpause: st.school_gap || 0, ruhe_sekunden: st.idle_seconds || 45,
        schulfenster: st.school_window == null ? 60 : st.school_window,
        todos_knopf: view === 'week', todos_offen: (s.todos || []).filter((t) => !t.done).length,
        termine_nach_namen: st.match_names !== false, auch_beim_besitzer: !!st.show_owner, tageswechsel: roll,
        plan: VIRT.plan, heute: VIRT.heute, verlauf: VIRT.verlauf, einstellungen: VIRT.settings, script: VIRT.script };
      const sig = JSON.stringify([lang, cfg.schulfenster, cfg.todos_offen, cfg.tage_zuverlaessigkeit, cfg.schulpause, cfg.ruhe_sekunden, cfg.schule, cfg.abwesend, cfg.punkte_standard, cfg.titel, kinder.map((k) => [k.name, k.farbe]), kalender, cfg.termine_nach_namen, cfg.auch_beim_besitzer, roll]);
      if (!this._inner || this._lang !== lang) { this._lang = lang; this.innerHTML = ''; this._special = null; this._todos = null; this._inner = document.createElement(tag(view, lang)); this.appendChild(this._inner); this._sig = null; }
      if (sig !== this._sig) { this._sig = sig; this._inner.setConfig(cfg); this._inner.hass = this._wrap(); }
      // planner: to-dos open in their own window (button in the top bar); chore plan: below the plan
      const host = view === 'week' ? this._todoWin(lang) : this;
      if (!this._todos || this._todos.parentNode !== host) { if (this._todos) this._todos.remove(); this._todos = document.createElement('fp-todos-inner'); this._todos.store = this._store; this._todos.setConfig({ lang }); host.appendChild(this._todos); }
      else this._todos.update();
      if (view === 'plan') {
        if (!this._special || this._special.parentNode !== this) { this._special = document.createElement('fp-special-inner'); this._special.store = this._store; this._special.setConfig({ lang }); this.insertBefore(this._special, this._todos); }
        else this._special.update();
      }
    }
  }
  if (!customElements.get('family-planer-card')) customElements.define('family-planer-card', FamilyPlanerCard);

  // Navigation bar: one button per active module view, same place on every page (also in kiosk mode)
  const NAV = { de: { planer: 'Planer', listen: 'Listen', aemtliplan: 'Ämtliplan', belohnungen: 'Belohnungen', einstellungen: 'Einstellungen' }, en: { planer: 'Planner', listen: 'Lists', aemtliplan: 'Chore plan', belohnungen: 'Rewards', einstellungen: 'Settings' } };
  const NAV_ICON = { planer: 'mdi:calendar-week', listen: 'mdi:cart-outline', aemtliplan: 'mdi:clipboard-text-clock-outline', belohnungen: 'mdi:trophy-outline', einstellungen: 'mdi:cog-outline' };
  const NAV_MOD = { planer: 'week', listen: 'lists', aemtliplan: 'week', belohnungen: 'week', einstellungen: null };
  const NAV_VIEW = { planer: 'week', listen: 'lists', aemtliplan: 'plan', belohnungen: 'rewards', einstellungen: 'settings' };
  class FamilyPlanerNavCard extends HTMLElement {
    setConfig(c) {
      this._cfg = { ...(c || {}) };
      // paths of the dashboard views, e.g. { planer: 'planer', listen: 'einkauf', aemtliplan: 'aemtliplan' }
      this._paths = { planer: 'planer', listen: 'listen', aemtliplan: 'aemtliplan', belohnungen: 'belohnungen', einstellungen: 'einstellungen', ...(this._cfg.paths || this._cfg.pfade || {}) };
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => {
          if (e.target.closest('[data-menu]')) { this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true })); return; }
          const b = e.target.closest('[data-go]'); if (b && window.FPX) { window.FPX.fpNavigate(b.dataset.go); return; }
          if (e.target.closest('[data-themes]')) { this._open = !this._open; this._render(); return; }
          const th = e.target.closest('[data-theme]'); if (th) this._setTheme(th.dataset.theme);
        });
        // a tap outside the design picker closes it
        this._outside = (e) => { if (this.isConnected && this._open && !e.composedPath().includes(this)) { this._open = false; this._render(); } };
        window.addEventListener('pointerdown', this._outside, true);
        window.addEventListener('location-changed', () => this._render());
      }
      this._render();
    }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) { this._store = Store.get(h.connection, this._cfg.entry_id); this._off = this._store.listen(() => this._render()); } }
    disconnectedCallback() { if (this._off) { this._off(); this._off = null; this._hass = null; } }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: 'full', rows: 1 }; }
    async _setTheme(name) {
      const s = this._store && this._store.snap; if (!s || !THEMES[name]) return;
      this._open = false;
      if (name === s.theme) { this._render(); return; }
      const lang = LANG(this._hass, this._cfg, this._store);
      try {
        if (s.settings && s.settings.theme_pin && window.FPPIN) await window.FPPIN.call(this._store, 'family_planer/theme/set', { theme: name }, { lang, host: this });
        else await this._store.ws('family_planer/theme/set', { theme: name });
      } catch (e) { this._err = lang === 'en' ? 'Design could not be changed.' : 'Design konnte nicht geändert werden.'; clearTimeout(this._et); this._et = setTimeout(() => { this._err = ''; this._render(); }, 3500); }
      this._render();
    }
    _render() {
      if (!this.shadowRoot || !this._cfg) return;
      const s = this._store && this._store.snap; const lang = LANG(this._hass, this._cfg, this._store);
      const mods = (s && s.modules) || { week: true, lists: true };
      const order = this._cfg.order || ['planer', 'listen', 'aemtliplan', 'belohnungen', 'einstellungen'];
      if (s) applyTheme(this, this._cfg.theme || s.theme);
      const cur = location.pathname.split('/').filter(Boolean).pop();
      const btns = order.filter((k) => NAV[lang][k] && (!NAV_MOD[k] || mods[NAV_MOD[k]] !== false));
      const title = this._cfg.titel || this._cfg.title || (s && s.title) || 'Family Planer';
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;margin-bottom:8px}
        .bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;background:var(--fp-bg1);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);padding:6px 10px 6px 16px;font-family:var(--fp-font);color:var(--fp-text)}
        .t{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
        .mid{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
        button{display:flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:10px;border:1px solid var(--fp-line);background:var(--fp-bg3);color:var(--fp-text2);font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}
        button.on{background:color-mix(in srgb,var(--fp-accent) 16%,transparent);border-color:color-mix(in srgb,var(--fp-accent) 60%,transparent);color:var(--fp-accent);font-weight:600}
        button.menu{padding:0 10px}
        button ha-icon{--mdc-icon-size:20px}
        .rt{display:flex;justify-content:flex-end;position:relative}
        button.thb{padding:0 10px 0 8px;gap:8px}.sw{display:flex;gap:3px;align-items:center;padding:4px 5px;border:1px solid;border-radius:7px}.sw i{display:block;width:8px;height:16px;border-radius:3px}
        .pop{position:absolute;right:0;top:48px;z-index:30;width:min(560px,90vw);background:var(--fp-bg1);border:1px solid var(--fp-line);border-radius:var(--fp-radius,14px);box-shadow:0 12px 32px rgba(0,0,0,.45);padding:12px}
        .ph{font-size:12px;color:var(--fp-text3);text-transform:uppercase;letter-spacing:1px;margin:0 2px 10px;display:flex;align-items:center;gap:6px}
        .tg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .tg button{height:auto;flex-direction:column;align-items:stretch;padding:8px;gap:6px;border-radius:12px;font-size:13px;color:var(--fp-text)}
        .tg button.on{border-width:2px}
        .tn{display:flex;align-items:center;justify-content:center;gap:4px}
        .mini{display:block;padding:5px;box-sizing:border-box}.mini b{display:block}
        .err{position:absolute;right:0;top:48px;background:#3a2626;border:1px solid #E06B6B;color:#fdd;padding:6px 12px;border-radius:10px;font-size:13px;white-space:nowrap}
      </style><div class="bar"><span class="t">${this._cfg.menu ? '<button class="menu" data-menu><ha-icon icon="mdi:menu"></ha-icon></button>' : ''}${title.replace(/[<>&"']/g, '')}</span><div class="mid">${btns.map((k) => `<button class="${this._paths[k] === cur ? 'on' : ''}" data-go="${this._paths[k]}"><ha-icon icon="${NAV_ICON[k]}"></ha-icon>${NAV[lang][k]}</button>`).join('')}</div>${this._picker(s, lang)}</div>`;
    }
    _picker(s, lang) {
      if (!s || this._cfg.theme_picker === false) return '<span></span>';
      const cur = THEMES[s.theme] ? s.theme : 'loxone'; const nm = (k) => THEME_NAMES[k][lang === 'en' ? 'en' : 'de'];
      const pin = s.settings && s.settings.theme_pin;
      return `<span class="rt"><button class="thb${this._open ? ' on' : ''}" data-themes title="Design" aria-expanded="${this._open ? 'true' : 'false'}">${themeSwatch(cur)}<ha-icon icon="mdi:palette-outline"></ha-icon></button>
        ${this._open ? `<div class="pop" role="dialog"><div class="ph"><ha-icon icon="mdi:palette-outline"></ha-icon>${lang === 'en' ? 'Design' : 'Design'}${pin ? ' · <ha-icon icon="mdi:lock-outline"></ha-icon>' : ''}</div><div class="tg">${Object.keys(THEMES).map((k) =>
          `<button class="${k === cur ? 'on' : ''}" data-theme="${k}">${themeMini(k)}<span class="tn">${k === cur ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}${nm(k)}</span></button>`).join('')}</div></div>` : ''}
        ${this._err ? `<div class="err">${this._err}</div>` : ''}</span>`;
    }
  }
  if (!customElements.get('family-planer-nav-card')) customElements.define('family-planer-nav-card', FamilyPlanerNavCard);

  // Sidebar panel: the complete planer without any dashboard or YAML
  class FamilyPlanerPanel extends HTMLElement {
    set hass(h) { this._hass = h; this._render(); }
    set narrow(n) { this._narrow = !!n; this._render(true); }
    set panel(p) { this._panel = p; this._render(); }
    connectedCallback() { this._onLoc = () => this._render(); window.addEventListener('location-changed', this._onLoc); window.addEventListener('popstate', this._onLoc); this._render(); }
    disconnectedCallback() { window.removeEventListener('location-changed', this._onLoc); window.removeEventListener('popstate', this._onLoc); }
    _render(force) {
      if (!this._hass || !this.isConnected) return;
      const cfg = (this._panel && this._panel.config) || {};
      const seg = location.pathname.split('/').filter(Boolean)[1] || 'planer';
      const view = NAV_VIEW[seg] || 'week';
      if (!this._wrap) {
        this.style.cssText = 'display:block;min-height:100vh;box-sizing:border-box;padding:8px;background:var(--fp-bg0,#141414)';
        this._wrap = true; this._nav = document.createElement('family-planer-nav-card'); this.appendChild(this._nav);
        if (window.FPKIOSK) window.FPKIOSK.attach(this, Store.get(this._hass.connection, cfg.entry_id));
      }
      const store = Store.get(this._hass.connection, cfg.entry_id);
      if (!this._offTheme) this._offTheme = store.listen(() => { if (store.snap) applyTheme(this, store.snap.theme); });
      if (force || this._navNarrow !== this._narrow) { this._navNarrow = this._narrow; this._nav.setConfig({ entry_id: cfg.entry_id, menu: this._narrow }); }
      this._nav.hass = this._hass;
      if (this._view !== view) {
        this._view = view; if (this._card) this._card.remove();
        this._card = document.createElement('family-planer-card'); this._card.setConfig({ view, entry_id: cfg.entry_id }); this.appendChild(this._card);
      }
      this._card.hass = this._hass;
    }
  }
  if (!customElements.get('family-planer-panel')) customElements.define('family-planer-panel', FamilyPlanerPanel);

  window.customCards = window.customCards || [];
  window.customCards.push(
    { type: 'family-planer-card', name: 'Family Planer', description: 'view: week (Wochenplan), plan (Ämtliplan), lists (Smarte Listen), rewards (Belohnungen) oder settings (Einstellungen); theme optional', preview: false },
    { type: 'family-planer-nav-card', name: 'Family Planer Navigation', description: 'Planer · Listen · Ämtliplan', preview: false });
})();
