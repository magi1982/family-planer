// Familienplaner – Loxone-Style Karten
//  custom:lox-wochenplaner-card   Wochenkalender mit Ämtli (heute abhaken), Verlauf, Zuverlässigkeit, Kalender-Termine
//  custom:lox-aemtli-config-card  Ämtliplan bearbeiten (wie Serientermine: Text, Kind, Wochentage)
// Datenhaltung: todo.amtli_plan (Plan), todo.amtli_heute (heutige Ämtli), todo.amtli_verlauf (Tagesbilanz)
// Beschreibungen: "fp1:" + JSON   Plan {k,t:[1..7]}   Heute {k,d,c}   Verlauf {s:[[kind,erledigt,total]],x:[[kind,text]]}
const G = '#69C350';
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
// nächster Termin: „in 25 Min“; vorbei = abgeblendet
const SOON_T = ['in {n} Min', 'in {n} Std'];
const evState = (e) => { if (e.allDay) return { c: '', b: '' }; const now = new Date();
  if (e.e <= now) return { c: ' past', b: '' };
  const m = Math.round((e.s - now) / 60000);
  if (m > 0 && m <= 180) return { c: ' soon', b: `<em class="soon">${(m < 60 ? SOON_T[0] : SOON_T[1]).replace('{n}', m < 60 ? m : Math.round(m / 6) / 10)}</em>` };
  if (e.s <= now) return { c: ' now', b: '' };
  return { c: '', b: '' }; };
// Jetzt-Linie zwischen vergangenen und kommenden Terminen von heute
const nowLine = () => { const n = new Date(); return `<div class="nowl"><span>${pad(n.getHours())}:${pad(n.getMinutes())}</span></div>`; };
const withNow = (list, today, html) => { if (!today) return list.map(html).join(''); const now = new Date(); let put = false;
  const out = list.map((e) => { let pre = ''; if (!put && !e.allDay && e.s > now) { put = true; pre = nowLine(); } return pre + html(e); });
  if (!put && list.some((e) => !e.allDay)) out.push(nowLine());
  return out.join(''); };
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
// Auszeichnungen: Titel und Erklärung (Titel, warum man sie hat)
const AWT = {
  trophy: ['Pokal des Monats', 'Beste Quote im letzten Monat.'],
  crown: ['Krone der Woche', 'Beste Quote der letzten Woche.'],
  perfect: ['Perfekte Woche', 'Letzte Woche alle Ämtli erledigt.'],
  bee: ['Fleissbiene', 'Am meisten erledigt in der letzten Woche.'],
  weekend: ['Wochenend-Held', 'Am Wochenende alles erledigt.'],
  climber: ['Aufsteiger', 'Am meisten verbessert gegenüber der Vorwoche.'],
  early: ['Frühaufsteher', 'An mindestens 4 Tagen alles vor {t} Uhr erledigt.'],
  diamond: ['Diamant-Serie', '{n} Tage am Stück alles erledigt.'],
  milestone: ['Meilenstein {n}', '{n} Ämtli insgesamt erledigt.'],
  team: ['Familien-Teamwork', 'Gestern hat die ganze Familie alles erledigt.'],
  streak: ['{n}-Tage-Serie', '{n} Tage am Stück alles erledigt.'],
};
// So gewinnt man sie (Regel-Liste in den Personendetails)
const AWR = [
  ['trophy', 'mdi:trophy', '#D9E4F0', 'Pokal des Monats', 'Beste Quote eines ganzen Monats (mind. 10 Ämtli/Tage) – vergeben am Monatsersten.'],
  ['crown', 'mdi:crown', '#F5C542', 'Krone der Woche', 'Beste Quote einer Woche (mind. 3 Ämtli/Tage) – vergeben jeden Montag.'],
  ['perfect', 'mdi:star-four-points', '#C9D1D9', 'Perfekte Woche', 'Eine ganze Woche alle Ämtli erledigt (mind. 5).'],
  ['bee', 'mdi:bee', '#CD8A4E', 'Fleissbiene', 'Am meisten erledigt in einer Woche (im Modus Fair: die meisten ganzen Tage).'],
  ['weekend', 'mdi:shield-star', '#E06B6B', 'Wochenend-Held', 'Samstag und Sonntag alles erledigt.'],
  ['climber', 'mdi:trending-up', '#4FD1C5', 'Aufsteiger', 'Mindestens 15 Prozentpunkte besser als in der Vorwoche.'],
  ['early', 'mdi:weather-sunset-up', '#FFB74D', 'Frühaufsteher', 'An mindestens 4 Tagen der Woche alles vor {t} Uhr erledigt.'],
  ['diamond', 'mdi:diamond-stone', '#7FDBFF', 'Diamant-Serie', '30 Tage am Stück alles erledigt.'],
  ['milestone', 'mdi:medal', '#E0A84F', 'Meilenstein', '100, 500 und 1000 Ämtli insgesamt erledigt.'],
  ['team', 'mdi:account-group', '#C771D6', 'Familien-Teamwork', 'An einem Tag erledigt die ganze Familie alles.'],
];
// Rahmen, Krone und Medaillen – auch von der Belohnungs-Ansicht genutzt
const AWCSS = `.crown{position:absolute;top:-13px;left:0;right:0;margin:0 auto;width:20px;height:18px;justify-content:center;color:#F5C542;filter:drop-shadow(0 1px 1px rgba(0,0,0,.7)) drop-shadow(0 0 4px rgba(245,197,66,.55));z-index:3;display:flex}.crown ha-icon{--mdc-icon-size:20px}
.ring[class*=fr-]{padding:3px;box-sizing:content-box;border-radius:50%;margin:3px}.ring[class*=fr-]::before{content:"";position:absolute;inset:0;border-radius:50%;padding:3px;background:var(--fr);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;z-index:1;pointer-events:none}
.ring[class*=fr-]::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);background-size:250% 100%;mix-blend-mode:overlay;animation:fpshine 4.5s ease-in-out infinite;pointer-events:none;z-index:2}
.ring.fr-platinum{--fr:conic-gradient(from 200deg,#f7fbff,#9fb3cc,#ffffff,#b9c9de,#e9f2ff,#8ea4c0,#f7fbff);filter:drop-shadow(0 0 6px rgba(190,215,255,.45))}
.ring.fr-gold{--fr:conic-gradient(from 200deg,#fff4b8,#d4a017,#fff7cf,#b8860b,#ffe27a,#a87a0a,#fff4b8);filter:drop-shadow(0 0 6px rgba(245,197,66,.45))}
.ring.fr-silver{--fr:conic-gradient(from 200deg,#ffffff,#a8b1bc,#f3f5f8,#8a939e,#e2e6eb,#7d8792,#ffffff)}
.ring.fr-bronze{--fr:conic-gradient(from 200deg,#ffd0a0,#a35a28,#ffdcb8,#8a4a22,#e7a46c,#7a3f1c,#ffd0a0)}
@keyframes fpshine{0%,60%{background-position:150% 0}100%{background-position:-60% 0}}
@media (prefers-reduced-motion:reduce){.ring[class*=fr-]::after{animation:none;display:none}}
.md{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 32% 28%,color-mix(in srgb,var(--mc) 55%,#fff) 0%,var(--mc) 45%,color-mix(in srgb,var(--mc) 60%,#000) 100%);border:1px solid color-mix(in srgb,var(--mc) 70%,#fff);color:#1b1b1b;display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:0 1px 3px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.45)}.md ha-icon{--mdc-icon-size:13px}
.ring{position:relative;width:48px;height:48px;flex:none}.ring .lvb{position:absolute;right:-4px;bottom:-3px;z-index:4;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;border:2px solid var(--fp-bg2,#1e1e1e);background:var(--lc);color:#1b1b1b;font:800 11px/18px -apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.5)}
.ring .lvb.t-ruby{color:#fff}.ring .lvb.glow{animation:fplvglow 1.6s ease-in-out infinite;box-shadow:0 0 10px var(--lc),0 0 18px var(--lc)}.ring .lvb.fade{box-shadow:0 0 calc(var(--g) * 14px) var(--lc)}
@keyframes fplvglow{0%,100%{box-shadow:0 0 6px var(--lc),0 0 10px var(--lc);transform:scale(1)}50%{box-shadow:0 0 14px var(--lc),0 0 26px var(--lc);transform:scale(1.15)}}
@media (prefers-reduced-motion:reduce){.ring .lvb.glow{animation:none}}
.ring .ava{display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;-webkit-mask-image:-webkit-radial-gradient(white,black)}
.ring .ava > span{width:100%!important;height:100%!important;border-radius:50%}.ring .ava svg{display:block}`;
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
const AV_HC = { platin: ['#F2E6C2', '#D9C998'], blond: ['#EBC55A', '#D4A63B'], hellbraun: ['#B5814A', '#94663A'], braun: ['#8B5A2B', '#6E4520'], schwarz: ['#3A3330', '#26211F'], rot: ['#D2662F', '#A9491E'],
  grau: ['#CDD1D5', '#A9AEB3'], weiss: ['#F1F1F1', '#D2D2D2'], rosa: ['#F49AC1', '#D9779F'], blau: ['#5FA8E8', '#3F86C6'], lila: ['#A98BE8', '#8566C9'], gruen: ['#5CC98A', '#3FA56B'] };
const AV_SK = { porzellan: '#FBE3CF', hell: '#F3CDA6', pfirsich: '#EDBB8F', mittel: '#E3B48A', oliv: '#C99167', karamell: '#B07A52', dunkel: '#8D5A3B', tief: '#6B4129', espresso: '#4A2C1C' };
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
const AV_MASK = (c) => `<path d="M12.3 16.6c2.2-1 5-1 7.7.2 2.7-1.2 5.5-1.2 7.7-.2-.2 2.4-1.6 4-3.6 4-1.6 0-2.8-.8-4.1-2-1.3 1.2-2.5 2-4.1 2-2 0-3.4-1.6-3.6-4z" fill="${c}"/><circle cx="16.8" cy="18.2" r="1.25" fill="#fff"/><circle cx="23.2" cy="18.2" r="1.25" fill="#fff"/><circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>`;
const AV_ACC = {
  sommersprossen: () => `<g fill="#B5774F" opacity=".7"><circle cx="15.6" cy="20.5" r=".38"/><circle cx="16.7" cy="21.3" r=".34"/><circle cx="15.1" cy="21.7" r=".32"/><circle cx="24.4" cy="20.5" r=".38"/><circle cx="23.3" cy="21.3" r=".34"/><circle cx="24.9" cy="21.7" r=".32"/></g>`,
  sonnenbrille: () => `<g fill="#1d1d24"><rect x="14.3" y="16.9" width="5.1" height="3.6" rx="1.5"/><rect x="20.6" y="16.9" width="5.1" height="3.6" rx="1.5"/></g><path d="M19.4 18h1.2M12.5 17.5l1.8.3M27.5 17.5l-1.8.3" stroke="#1d1d24" stroke-width=".8"/><path d="M15.2 17.7l1.4-.1M21.5 17.7l1.4-.1" stroke="#fff" stroke-width=".5" opacity=".6"/>`,
  stirnband: () => `<path d="M12.1 13.8c4.9-1.9 10.9-1.9 15.8 0l-.3 2.1c-4.9-1.7-10.3-1.7-15.2 0z" fill="#4FD1C5"/><path d="M12.4 14.9c4.7-1.5 10.5-1.5 15.2 0" stroke="#fff" stroke-width=".4" opacity=".7" fill="none"/>`,
  blitz: () => AV_MASK('#F5C542').replace('<circle cx="16.9" cy="18.3" r=".6" fill="#222"/><circle cx="23.1" cy="18.3" r=".6" fill="#222"/>', '<circle cx="16.9" cy="18.3" r=".6" fill="#1d3f6e"/><circle cx="23.1" cy="18.3" r=".6" fill="#1d3f6e"/>'),
  nacht: () => AV_MASK('#4B3B8F'),
  ninja: () => `<path d="M11.4 16.8c0-6 3.8-9.8 8.6-9.8s8.6 3.8 8.6 9.8z" fill="#2B2F3A"/><path d="M12.1 20.5h15.8c-.4 4.1-3.6 6.6-7.9 6.6s-7.5-2.5-7.9-6.6z" fill="#2B2F3A"/><rect x="11.5" y="13.9" width="17" height="1.7" fill="#D63C3C"/><path d="M28.3 14.2l3.9-1.6-.7 2.3 2.1.9-4.8.6z" fill="#D63C3C"/>`,
  ritter: () => `<path d="M10.8 22.6c-.7-9.2 3.6-14.8 9.2-14.8s9.9 5.6 9.2 14.8l-2.5.5c.3-1.9.3-3.4.1-4.5H13.2c-.2 1.1-.2 2.6.1 4.5z" fill="#B9C3CE"/><path d="M13.2 18.6h13.6" stroke="#8A96A3" stroke-width=".9"/><path d="M20 8v6.4" stroke="#8A96A3" stroke-width=".9"/><path d="M19 4.4c2.6.4 4 1.9 4 3.6h-3.6z" fill="#D63C3C"/>`,
  brille: () => `<g fill="none" stroke="#2b2b2b" stroke-width=".9"><circle cx="17.1" cy="18.6" r="2.4"/><circle cx="22.9" cy="18.6" r="2.4"/><path d="M19.5 18.4h1"/></g>`,
  bart: (h) => `<path d="M12.8 20.6c.4 4.4 3.4 7.2 7.2 7.2s6.8-2.8 7.2-7.2c-1.4 1.6-3.2 2.4-4.6 2-.8-.3-1.6-.5-2.6-.5s-1.8.2-2.6.5c-1.4.4-3.2-.4-4.6-2z" fill="${h}"/><path d="M17.6 22.6q2.4 1.6 4.8 0" stroke="#7a3b22" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
  held: () => AV_MASK('#D63C3C'),
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
// Gruppen: pro Gruppe höchstens eins; Kostüme schliessen Kopfbedeckungen / Brillen / Kopfhörer aus, damit jede Kombination gut aussieht
const AV_COST = ['held', 'blitz', 'nacht', 'ninja', 'ritter', 'astro', 'pirat', 'zauber'];
const AV_HEAD = ['cap', 'krone', 'katze', 'einhorn', 'schleife', 'stirnband'];
const AV_EYES = ['brille', 'sonnenbrille'];
const AV_FACE = ['sommersprossen', 'bart', 'kopfhoerer'];
const AV_ORDER = ['sommersprossen', 'bart', 'brille', 'sonnenbrille', 'held', 'blitz', 'nacht', 'ninja', 'kopfhoerer', 'stirnband', 'schleife', 'cap', 'katze', 'einhorn', 'krone', 'pirat', 'zauber', 'ritter', 'astro'];
const AV_HAT_COST = ['ninja', 'ritter', 'astro', 'pirat', 'zauber'];
const AV_MASK_COST = ['held', 'blitz', 'nacht', 'ninja'];
const AV_BODY = { held: ['#C0392B', '<path d="M20 32.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#F5C542"/>'],
  blitz: ['#2F64A6', '<path d="M20.9 31.6l-2.7 3.7h1.9l-1 3.4 3.1-4.1h-1.9l1.2-3z" fill="#F5C542"/>'],
  nacht: ['#2A2340', '<path d="M21.4 32.3a2.7 2.7 0 1 0 .9 5 2.2 2.2 0 1 1-.9-5z" fill="#E8E3FF"/>'],
  ninja: ['#2B2F3A', '<path d="M14 33.2l12 4" stroke="#D63C3C" stroke-width="1.4"/>'], ritter: ['#9AA5B1', '<path d="M20 31.8v6.4M17 34.6h6" stroke="#D63C3C" stroke-width="1.3"/>'],
  astro: ['#E8EEF5', '<rect x="17.6" y="33" width="4.8" height="3" rx=".6" fill="#4FA3E0"/>'], zauber: ['#5B4FC4', '<circle cx="18" cy="34" r=".6" fill="#F5C542"/><circle cx="22.2" cy="36" r=".5" fill="#F5C542"/>'],
  pirat: ['#F4F4F4', '<path d="M12 33.6h16M11 36.2h18M10.4 38.8h19.2" stroke="#2F64A6" stroke-width="1.1"/>'] };
// gültige, widerspruchsfreie Extras in Zeichen-Reihenfolge
const avNorm = (age, list) => {
  let ex = (list || []).filter((a) => AV_ORDER.includes(a));
  const one = (grp) => { const hit = ex.filter((a) => grp.includes(a)); if (hit.length > 1) ex = ex.filter((a) => !grp.includes(a) || a === hit[hit.length - 1]); };
  one(AV_COST); one(AV_HEAD); one(AV_EYES);
  const c = ex.find((a) => AV_COST.includes(a));
  if (c && AV_HAT_COST.includes(c)) ex = ex.filter((a) => !AV_HEAD.includes(a));
  if (c && AV_MASK_COST.includes(c)) ex = ex.filter((a) => !AV_EYES.includes(a));
  if (c === 'ninja') ex = ex.filter((a) => a !== 'bart' && a !== 'sommersprossen');
  if (c === 'astro' || c === 'ritter') ex = ex.filter((a) => a !== 'kopfhoerer');
  if (age === 'k') ex = ex.filter((a) => a !== 'bart');
  return AV_ORDER.filter((a) => ex.includes(a));
};
const avatarGen = (code, bg) => {
  const [age0, st0, hc, sk, acc] = String(code).split('.');
  const age = ['k', 'e', 'o'].includes(age0) ? age0 : 'k';
  const st = st0 === 'glatze' && age === 'k' ? 'kurz' : st0;
  const [h1, h2] = AV_HC[hc] || AV_HC.blond; const skin = AV_SK[sk] || AV_SK.hell;
  const kid = age === 'k';
  const ex = avNorm(age, acc && acc !== '0' ? acc.split('+') : []);
  const cost = ex.find((a) => AV_COST.includes(a));
  let [bk, fr] = AV_ST[st] || [null, 'kurz'];
  if (cost === 'ninja' || cost === 'ritter') bk = null;
  const body = kid ? 'M8 41c0-7.5 5.4-11.5 12-11.5S32 33.5 32 41z' : 'M4 41c0-8.5 7-12.5 16-12.5S36 32.5 36 41z';
  let s = `<rect width="40" height="40" fill="${bg}"/>`;
  if (bk) s += AV_HB[bk](h2);
  s += cost && AV_BODY[cost] ? `<path d="${body}" fill="${AV_BODY[cost][0]}"/>${AV_BODY[cost][1]}` : `<path d="${body}" fill="#111" opacity=".28"/>`;
  s += `<rect x="17" y="23" width="6" height="7" fill="${skin}"/><ellipse cx="20" cy="18.5" rx="7.6" ry="8.4" fill="${skin}"/>`;
  if (fr && cost !== 'ninja') s += AV_HF[fr](h1);
  if (age === 'o') s += '<path d="M14.6 15.4h1.8M23.6 15.4h1.8M15.4 21.6l-.8.6M24.6 21.6l.8.6" stroke="#9a6a4a" stroke-width=".5"/>';
  const dark = ['tief', 'espresso'].includes(sk);
  s += `<circle cx="17.1" cy="18.6" r="1.05" fill="${dark ? '#1a110b' : '#3b2a1e'}"/><circle cx="22.9" cy="18.6" r="1.05" fill="${dark ? '#1a110b' : '#3b2a1e'}"/>`;
  if (!ex.includes('bart')) s += `<path d="M17.6 22q2.4 1.9 4.8 0" stroke="${dark ? '#2a1610' : '#b0613a'}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  if (kid || ['long', 'ponylang', 'zoepfe', 'dutt', 'bob', 'locken', 'pferd'].includes(st)) s += `<circle cx="15.3" cy="21" r="1.3" fill="#F29A9A" opacity="${dark ? '.3' : '.55'}"/><circle cx="24.7" cy="21" r="1.3" fill="#F29A9A" opacity="${dark ? '.3' : '.55'}"/>`;
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
  if (b.startsWith('av2:') && window.FPAV) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${window.FPAV.svg(b, k.farbe)}</span>`;
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
    // swipe left/right: next/previous week (phone: next/previous day)
    this.shadowRoot.addEventListener('touchstart', (e) => { const t = e.touches[0]; this._sw = t ? [t.clientX, t.clientY] : null; }, { passive: true });
    this.shadowRoot.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0]; if (!this._sw || !t || this._detail) return;
      const dx = t.clientX - this._sw[0], dy = t.clientY - this._sw[1]; this._sw = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) this._go(dx < 0 ? 1 : -1);
    }, { passive: true });
    this._onResize = () => { const ph = this._isPhone(); if (ph !== this._phoneOn) this._render(); };
    window.addEventListener('resize', this._onResize);
  }
  _isPhone() { const w = this.getBoundingClientRect().width || window.innerWidth; return w > 0 && w < 700; }
  // phone: one day at a time; tablet/desktop: one week at a time. Returns to today after the idle time.
  _go(step) {
    this._focus = null;
    if (this._phoneOn) {
      this._dayOff = step === 0 ? 0 : (this._dayOff || 0) + step;
      const t = startOfDay(fpDay()); const sel = addDays(t, this._dayOff);
      const wk = Math.round((addDays(sel, 1 - isoWd(sel)) - addDays(t, 1 - isoWd(t))) / (7 * 86400000));
      if (wk !== this._week) { this._week = wk; this._events = []; this._fetchEvents(); }
    } else {
      this._week = step === 0 ? 0 : this._week + step; this._dayOff = 0; this._events = []; this._fetchEvents();
    }
    clearTimeout(this._navT);
    if (this._week || this._dayOff) this._navT = setTimeout(() => { this._week = 0; this._dayOff = 0; this._focus = null; this._events = []; this._fetchEvents(); this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
    this._render();
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
    // fair: every day weighs the same – [sum of daily rates, days]; today only counts once it is complete
    const fsum = (n) => { let f = todayTot && todayDone === todayTot ? 1 : 0, c = f; for (let i = 1; i <= n; i++) { const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid]; if (s && s[1]) { f += s[0] / s[1]; c++; } } return [Math.round(f * 1000) / 1000, c]; };
    const fw = fsum(7), fm = fsum(30), fall = fsum(this._cfg.tage_zuverlaessigkeit);
    let streak = todayTot && todayDone === todayTot ? 1 : 0;
    for (let i = 1; i <= 120; i++) {
      const s = (h[ymd(addDays(today, -i))] || { s: {} }).s[kid];
      if (!s || !s[1]) continue;
      if (s[0] === s[1]) streak++; else break;
    }
    const pct = this._cfg.fair ? (fall[1] ? Math.round((fall[0] / fall[1]) * 100) : 100) : (tot ? Math.round((done / tot) * 100) : 100);
    return { pct, start: !tot, streak, w, m, fw, fm };
  }
  // Auszeichnungen kommen vom Server (vergeben jeden Montag / am Monatsersten / beim Erreichen)
  // level badge on the avatar; after a level up it glows until it was tapped (each tap plays the tier's effect)
  _lvState(name) {
    const s = this.fpStore && this.fpStore.snap; if (!s) return null;
    const p = (s.persons || []).find((x) => x.name === name); if (!p) return null;
    const pt = (s.points || {})[p.id]; if (!pt || !pt.level) return null;
    const up = pt.up && pt.up.level === pt.level && (Date.now() - Date.parse(pt.up.ts || '')) < 14 * 864e5 ? pt.up : null;
    const key = `fp_lv_${s.entry_id}_${p.id}_${pt.level}_${up ? up.ts : ''}`;
    let taps = 0; try { taps = Number(localStorage.getItem(key)) || 0; } catch (e) { taps = (this._lvMem || {})[key] || 0; }
    return { p, pt, up, key, taps };
  }
  _lvBadge(name) {
    const v = this._lvState(name); if (!v) return '';
    const g = v.up && v.taps < 20 ? (v.taps < 5 ? 'glow' : 'fade') : '';
    return `<button class="lvb t-${v.pt.tier} ${g}" data-lvtap="${esc(name)}" style="--lc:${v.pt.tier_color};--g:${g === 'fade' ? (20 - v.taps) / 15 : 0}" title="Level ${v.pt.level} · ${esc(v.pt.name)}">${v.pt.level}</button>`;
  }
  _lvTap(name, el) {
    const v = this._lvState(name); if (!v) return;
    const r = el.getBoundingClientRect();
    if (window.FPCONFETTI && window.FPCONFETTI.burst) window.FPCONFETTI.burst(r.left + r.width / 2, r.top + r.height / 2, v.pt.tier, v.pt.tier_color, v.up && v.taps < 20 ? 1 : 0.5);
    if (v.up && v.taps < 20) { try { localStorage.setItem(v.key, String(v.taps + 1)); } catch (e) { this._lvMem = { ...(this._lvMem || {}), [v.key]: v.taps + 1 }; } this._render(); }
  }
  _srvAwards(kids) {
    const s = this.fpStore && this.fpStore.snap; const A = {}; const F = {}; kids.forEach((k) => { A[k.name] = []; });
    if (!s) return { A, F };
    const byName = Object.fromEntries((s.persons || []).map((p) => [p.name, p.id]));
    const et = (s.settings || {}).early_time || '12:00';
    kids.forEach((k) => {
      const r = (s.awards || {})[byName[k.name]] || { list: [] }; F[k.name] = r.frame || '';
      A[k.name] = (r.list || []).map((a) => { const tx = AWT[a.id] || [a.id, '']; const f = (x) => x.replace(/\{n\}/g, a.value == null ? '' : a.value).replace('{t}', et);
        return { id: a.id, icon: a.icon, c: a.color, t: f(tx[0]), why: f(tx[1]) }; });
    });
    return { A, F };
  }
  _detailHtml(kids, pre, awards, frames) {
    const k = kids.find((x) => x.name === this._detail); if (!k) return '';
    const s = pre[k.name]; const lv = level(s.pct); const aw = awards[k.name] || [];
    const snap = (this.fpStore && this.fpStore.snap) || {}; const pts = snap.award_points || {}; const et = (snap.settings || {}).early_time || '12:00';
    const on = ((snap.award_settings || {}).items) || {};
    const q = (x) => (x[1] ? `${x[0]} / ${x[1]} <small>(${Math.round((x[0] / x[1]) * 100)} %)</small>` : '<small>noch keine</small>');
    const holders = (id) => kids.filter((x) => (awards[x.name] || []).some((a) => a.id === id)).map((x) => x.name).join(', ') || 'noch niemand';
    return `<div class="ovl" data-close><div class="pnl" data-keep>
      <div class="ph"><div class="ring bigr${frames[k.name] ? ' fr-' + frames[k.name] : ''}"><span class="ava">${avatarHtml(k, 64)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) : ''}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}<span class="rib" style="--rc:${lv.c}">${s.pct}%</span></div>
        <div class="phn"><div class="pn2">${esc(k.name)}</div><div class="lv" style="color:${lv.c}">${lv.t} · Zuverlässigkeit ${s.pct} %</div></div>
        <button class="nb" data-x><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="kp"><div><span>Letzte 7 Tage</span><b>${q(s.w)}</b></div><div><span>Letzte 30 Tage</span><b>${q(s.m)}</b></div><div><span>Serie</span><b>${s.streak} ${s.streak === 1 ? 'Tag' : 'Tage'}</b></div></div>
      <div class="sec2">Auszeichnungen</div>
      ${aw.length ? aw.map((a) => `<div class="aw"><span class="md lg" style="--mc:${a.c}"><ha-icon icon="${a.icon}"></ha-icon></span><div><b>${esc(a.t)}</b><div>${esc(a.why)}</div></div></div>`).join('') : '<div class="aw0">Noch keine Auszeichnung – erledige deine Ämtli und hol dir die Krone!</div>'}
      <div class="sec2">So holst du dir Auszeichnungen</div>
      ${AWR.filter(([id]) => !on[id] || on[id].on !== false).map(([id, ic, c, t, d]) => `<div class="rl2"><span class="md" style="--mc:${c}"><ha-icon icon="${ic}"></ha-icon></span><b>${t}${pts[id] ? ` <small class="pp">+${Number(pts[id])}</small>` : ''}</b><span>${d.replace('{t}', esc(et))}</span><em>aktuell: ${esc(holders(id))}</em></div>`).join('')}
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
    const tdb = e.target.closest('[data-todoid]');
    if (tdb && this.fpStore) {
      const s = this.fpStore.snap || {}; const t = (s.todos || []).find((x) => x.id === tdb.dataset.todoid); if (!t) return;
      const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
      if (!t.done && confirm && this._tdArm !== t.id) { this._tdArm = t.id; clearTimeout(this._tdT); this._tdT = setTimeout(() => { this._tdArm = null; this._render(); }, 4000); this._render(); return; }
      this._tdArm = null; if (!t.done) this._pop = { uid: t.id, t: Date.now() };
      this.fpStore.ws('family_planer/todo/set', { todo_id: t.id, done: !t.done }).catch(() => this._render()); return;
    }
    const lt = e.target.closest('[data-lvtap]'); if (lt) { this._lvTap(lt.dataset.lvtap, lt); return; }
    const pp = e.target.closest('[data-person]');
    if (pp) { this._detail = pp.dataset.person; clearTimeout(this._dT); this._dT = setTimeout(() => { this._detail = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 30) * 1000); this._render(); return; }
    const b = e.target.closest('.btn');
    if (b && this._hass) {
      const done = b.classList.contains('done');
      b.classList.toggle('done');
      // little check animation only for the chore that was just ticked off
      if (!done) { this._pop = { uid: b.dataset.uid, t: Date.now() }; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      this._call('todo', 'update_item', { item: b.dataset.uid, status: done ? 'needs_action' : 'completed' }, this._cfg.heute).catch(() => this._render());
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { fpNavigate(go.dataset.go); return; }
    const md = e.target.closest('[data-mode]');
    if (md) { this._mode = md.dataset.mode; try { localStorage.setItem('fp_mode', this._mode); } catch (er) { /* ignorieren */ } this._render(); return; }
    if (e.target.closest('[data-sync]')) { this._syncCal(); return; }
    if (e.target.closest('[data-todos]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true })); return; }
    if (e.target.closest('[data-todoadd]')) { this.dispatchEvent(new CustomEvent('fp-open-todos', { bubbles: true, composed: true, detail: { add: true } })); return; }
    const fc = e.target.closest('[data-focus]');
    if (fc) {
      const v = fc.dataset.focus; this._focus = v === ymd(fpDay()) ? null : v;
      clearTimeout(this._fT); if (this._focus) this._fT = setTimeout(() => { this._focus = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
      this._render(); return;
    }
    const n = e.target.closest('[data-nav]');
    if (n) this._go(Number(n.dataset.nav));
  }
  _render() {
    if (!this.shadowRoot || !this._cfg) return;
    const now = new Date(); const today = startOfDay(fpDay()); const tStr = ymd(today);
    const phone = this._isPhone(); this._phoneOn = phone;
    const ws = this._weekStart(); const sel = addDays(today, phone ? (this._dayOff || 0) : 0);
    const days = phone ? [sel] : [...Array(7)].map((_, i) => addDays(ws, i));
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
    const focus = phone ? ymd(sel) : (this._focus && days.some((d) => ymd(d) === this._focus)) ? this._focus : (days.some((d) => ymd(d) === tStr) ? tStr : null);
    // Spaltenbreiten: xl = heute/angetippt, m = morgen (und heute, wenn ein anderer Tag angetippt ist), s = alle anderen Tage.
    // In den Ansichten Ämtli/Termine bleiben die nächsten 2 Tage und das Wochenende mittel.
    const T = {}; const curWeek = days.some((d) => ymd(d) === tStr); const allMode = (this._mode || 'alle') === 'alle';
    days.forEach((d) => {
      const s = ymd(d); const diff = Math.round((startOfDay(d) - today) / 86400000); const we = isoWd(d) >= 6;
      T[s] = s === focus ? 'xl' : !curWeek ? 'm' : allMode ? ((s === tStr || diff === 1) ? 'm' : 's')
        : (s === tStr || we || (diff > 0 && diff <= 2)) ? 'm' : 's';
    });
    const cols = phone ? 'minmax(0,1fr)' : days.map((d) => (T[ymd(d)] === 's' ? (allMode && curWeek ? 'minmax(0,0.42fr)' : startOfDay(d) < today ? 'minmax(0,0.4fr)' : 'minmax(0,0.6fr)')
      : ({ xl: allMode && curWeek ? 'minmax(0,4.6fr)' : 'minmax(0,3.6fr)', m: allMode && curWeek ? 'minmax(0,1.5fr)' : 'minmax(0,1.15fr)' })[T[ymd(d)]])).join(' ');
    const we = addDays(ws, 6);

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
        return `<div class="c ev-c${t ? ' t' : ''}">${withNow(shown, t && ymd(d) === focus, (e) => { const st = t ? evState(e) : { c: '', b: '' }; return `<div class="ev${ymd(d) === focus ? ' w' : ''}${st.c}" style="border-color:${e.c.farbe}">${evTime(e, ymd(d) === focus)}${st.b}${ymd(d) === focus ? '<br>' : ''}${esc(e.title)}</div>`; })}${evs.length > shown.length ? `<div class="more">+${evs.length - shown.length} weitere</div>` : ''}</div>`;
      }).join('');

    const pre = {};
    kids.forEach((k) => { const mi = heute.filter((i) => i.m.k === k.name); pre[k.name] = this._stats(k.name, h, today, mi.filter((i) => i.status === 'completed').length, mi.length); });
    const { A: awards, F: frames } = this._srvAwards(kids);
    // timetable view: only persons with a timetable
    const rowKids = (this._mode || 'alle') === 'schule' ? kids.filter((x) => (this._cfg.schule || {})[x.name]) : kids;
    // to-dos and special chores (date-based plan) in the planner, clearly marked; own view "To-dos & special"
    const snapX = (this.fpStore && this.fpStore.snap) || {}; const modeX = this._mode || 'alle';
    const specIds = new Set((snapX.chores || []).filter((c) => c.schedule).map((c) => c.id));
    const pidOf = Object.fromEntries((snapX.persons || []).map((p) => [p.name, p.id]));
    const showTodos = modeX === 'alle' || modeX === 'extra';
    const rows = rowKids.map((k) => {
      const tds = showTodos ? (snapX.todos || []).filter((t) => t.person_id === pidOf[k.name] && (!t.done || (t.done_at || '').slice(0, 10) === tStr)) : [];
      const tdBtns = tds.map((t) => `<button class="btn tdo${t.done ? ' done' : ''}${this._tdArm === t.id ? ' arm' : ''}" data-todoid="${esc(t.id)}"><span class="cb"></span><span class="bt"><em class="tag">☑ To-do</em>${esc(this._tdArm === t.id ? 'Nochmals tippen zum Erledigen' : t.title)}</span></button>`).join('');
      const mine = heute.filter((i) => i.m.k === k.name && (modeX !== 'extra' || specIds.has(i.m.c))).sort((a, b) => ((a.status === 'completed') - (b.status === 'completed')) || a.summary.localeCompare(b.summary, 'de'));
      const tDone = mine.filter((i) => i.status === 'completed').length;
      const st = pre[k.name]; const aw = awards[k.name] || [];
      const lv = level(st.pct); const C = 2 * Math.PI * 24;
      const AVS = phone ? 56 : 72;
      const label = `<div class="lab" data-person="${esc(k.name)}" style="box-shadow:inset 3px 0 0 ${k.farbe}">
          <div class="ring${frames[k.name] ? ' fr-' + frames[k.name] : ''}" style="width:${AVS}px;height:${AVS}px"><span class="ava">${avatarHtml(k, AVS)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) : ''}${this._lvBadge(k.name)}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>
          <div class="lt"><div class="nm">${esc(k.name)}</div><div class="lv2"><span class="rib2" style="--rc:${lv.c}">${st.pct}%</span>${aw.slice(0, phone ? 3 : 6).map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}${aw.length > (phone ? 3 : 6) ? `<span class="mdm">+${aw.length - (phone ? 3 : 6)}</span>` : ''}</div>
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
        if (mode === 'aemtli' || mode === 'extra') return html;
        const open = (html.match(/^<div[^>]*>/) || [''])[0];
        if (!pev.length) return mode === 'termine' ? open + '<div class="none">–</div></div>' : html;
        if (tr === 's') { const evn = `<div class="evn">${pev.slice(0, 4).map((e) => `<i style="background:${e.c.farbe}"></i>`).join('')}<b>${pev.length}</b></div>`; return mode === 'termine' ? open + evn + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evn); }
        const lim = mode === 'termine' ? (wide ? 12 : 6) : mx;
        const evh = `<div class="pev ${wide ? 'xl' : 'mid'}">${withNow(pev.slice(0, lim), wide && ymd(d) === ymd(new Date()), (e) => { const st = ymd(d) === ymd(new Date()) ? evState(e) : { c: '', b: '' }; return `<div class="ev one${st.c}" style="border-color:${e.c.farbe}"><span class="et">${esc(e.title)}</span><span class="tm">${evRange(e, !wide)}</span>${st.b}<span class="src" style="background:${e.c.farbe}" title="Kalender ${esc(e.c.name)}">${wide ? esc(e.c.name) : esc((e.c.name || '?').charAt(0).toUpperCase())}</span></div>`; })}${pev.length > lim ? `<div class="more">+${pev.length - lim} weitere</div>` : ''}</div>`;
        return mode === 'termine' ? open + evh + '</div>' : html.replace(/^<div[^>]*>/, (m) => m + evh);
      };
      const cells = days.map((d) => injectEv(d, ((d) => {
        const ds = ymd(d);
        if (((this._cfg.abwesend || {})[k.name] || []).includes(ds) && !(ds === tStr && mine.length)) {
          return `<div class="c ${ds < tStr ? 'p' : ds === tStr ? 't' : 'f'} vac${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="vc"><ha-icon icon="mdi:palm-tree"></ha-icon>${T[ds] === 's' ? '' : '<span>Ferien</span>'}</div></div>`;
        }
        if (ds === tStr && ds !== focus) {
          return mine.length ? `<div class="c t" data-focus="${ds}"><div class="fc"><b>${tDone}/${mine.length}</b></div><div class="bar"><i style="width:${Math.round((tDone / mine.length) * 100)}%;background:${G}"></i></div>${tds.filter((t) => !t.done).length ? `<div class="tdn2">☑ ${tds.filter((t) => !t.done).length}</div>` : ''}</div>` : `<div class="c t" data-focus="${ds}">${tds.filter((t) => !t.done).length ? `<div class="tdn2">☑ ${tds.filter((t) => !t.done).length}</div>` : ''}</div>`;
        }
        if (ds === tStr) {
          if (!mine.length && !tds.length) return '<div class="c t"></div>';
          if (!mine.length) return `<div class="c t"><div class="bg">${tdBtns}</div></div>`;
          const all = tDone === mine.length;
          return `<div class="c t"><div class="prog"><span>${tDone} von ${mine.length} erledigt</span>${all ? '<span class="gr">Super!</span>' : ''}</div><div class="bg">` +
            mine.map((i) => `<button class="btn${specIds.has(i.m.c) ? ' spc' : ''}${i.status === 'completed' ? ' done' : ''}${this._pop && this._pop.uid === i.uid && Date.now() - this._pop.t < 600 ? ' pop' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span><span class="bt">${specIds.has(i.m.c) ? '<em class="tag">⭐ Spezial</em>' : ''}${esc(i.summary)}${dueTag(i.m, tStr)}</span></button>`).join('') + tdBtns + `</div></div>`;
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
        if (modeX === 'extra' && ds !== tStr) {
          const sp = alle.filter((i) => i.m.k === k.name && specIds.has(i.m.c) && i.status !== 'completed' && (i.m.d || '') <= ds && (i.m.e || i.m.d || '') >= ds);
          return `<div class="c ${ds < tStr ? 'p' : 'f'}${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}">${sp.map((i) => `<div class="pl spl">⭐ ${esc(i.summary)}</div>`).join('') || '<div class="none">–</div>'}</div>`;
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
      .card{position:relative;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:14px 16px;color:#ececec;font-family:${FONT}}
      .top{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
      .clock{font-size:38px;font-weight:200;color:${G};line-height:1;font-variant-numeric:tabular-nums}
      .date{font-size:24px;font-weight:300}.date b{font-weight:600}
      .sub{font-size:12px;color:#7a7a7a;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px}
      .nav{margin-left:auto;display:flex;align-items:center;gap:8px}.tdg{display:flex;gap:6px}
      .top{flex-wrap:nowrap}.card.phone .top{flex-wrap:wrap}
      .nb{background:#262626;border:1px solid #333;color:#ddd;border-radius:10px;height:42px;min-width:42px;padding:0 14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;font-size:14px;-webkit-tap-highlight-color:transparent}
      .nb ha-icon{--mdc-icon-size:22px}.nb.td{gap:6px}.tdn{background:${G};color:#141414;border-radius:10px;padding:0 7px;font-size:12px;line-height:20px}.nb.g{color:${G};border-color:rgba(105,195,80,.5)}
      .wk{font-size:12px;color:#8a8a8a;padding:0 8px;text-align:center;min-width:150px}.wk b{display:block;color:#ececec;font-size:15px;font-weight:600}
      .grid{display:grid;grid-template-columns:${phone ? '104px' : '200px'} ${cols};gap:5px;align-items:stretch}
      .card.phone .lab{flex-direction:column;align-items:flex-start;gap:6px;padding:8px 6px}.card.phone .lt .nm{font-size:13px}.card.phone .corner{visibility:hidden}
      .card.phone .bg{grid-template-columns:1fr}.card.phone .pev .src{display:none}.card.phone .btn{min-height:50px;font-size:15px}.card.phone .btn .cb{width:26px;height:26px}.card.phone .btn.done .cb::after{left:8px;top:3px;width:6px;height:12px}.card.phone .nb{min-width:46px;height:46px}.card.phone .top{gap:8px}.card.phone .seg button{padding:0 9px}
      .dnav{display:flex;align-items:center;gap:6px}.dd{font-size:14px;text-align:center;min-width:120px}.dd b{display:block;font-size:16px}
      .corner{font-size:10px;color:#555;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:6px;padding:0 4px 6px}
      .corner .leg{background:none;padding:0;margin:0;gap:4px 10px}.corner .lgi{font-size:12px}
      .pev.mid .src{display:none}
      .hd{padding:4px 10px 6px;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:1px}
      .hd{cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.hd.fx{background:#262626}
      .hd b{display:block;font-size:18px;color:#e5e5e5;font-weight:300;letter-spacing:0;text-transform:none;margin-top:2px}
      .hd.t,.hd.t b{color:${G}}.hd.t b{font-weight:500}
      .c{background:#262626;border-radius:10px;padding:8px;min-height:56px;min-width:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .c.fx{box-shadow:inset 0 0 0 1px #4a4a4a;background:#2a2a2a}
      .c.t{background:#2a2a2a;box-shadow:inset 0 0 0 1px rgba(105,195,80,.45)}
      .ev-c{min-height:38px}
      .syn{cursor:pointer;-webkit-tap-highlight-color:transparent}.syn:active{background:#2a2a2a}
      .spin .ic ha-icon,.spin2 ha-icon{animation:fpspin 1s linear infinite}
      .nowl{position:relative;height:0;border-top:2px solid #E06B6B;margin:5px 0 5px 4px}.nowl::before{content:"";position:absolute;left:-5px;top:-5px;width:8px;height:8px;border-radius:50%;background:#E06B6B}.nowl span{position:absolute;right:0;top:-8px;font-size:9px;font-weight:700;color:#E06B6B;background:var(--fp-bg2,#1e1e1e);padding:0 4px;border-radius:4px;line-height:14px}
      .ev.past{opacity:.45}.ev.now{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fp-accent,#69C350) 60%,transparent)}.ev.soon{background:color-mix(in srgb,var(--fp-accent,#69C350) 14%,#303030)}.ev em.soon{font-style:normal;font-size:10px;font-weight:700;color:var(--fp-accent,#69C350);margin:0 4px;white-space:nowrap}
      .pev{margin-bottom:6px;display:flex;flex-direction:column;gap:3px}.pev .ev{margin-top:0}
      .pev.sm .ev{font-size:10px;padding:2px 4px 2px 5px}
      .ev .du{color:#8a8a8a;font-weight:400;margin-right:5px}
      .src{display:inline-block;font-size:9px;font-weight:700;color:#141414;border-radius:6px;padding:0 5px;margin-right:5px;line-height:15px;vertical-align:1px;white-space:nowrap}
      .leg{display:flex;align-items:center;gap:12px;margin-left:auto;background:#232323;border-radius:10px;padding:8px 14px;flex-wrap:wrap}
      .leg + .nav{margin-left:0}
      .lgt{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px}
      .tnav{display:flex;gap:6px;margin-left:auto}.tnav + .seg{margin-left:0}
      .seg{display:flex;background:#232323;border-radius:10px;padding:3px;gap:2px;margin-left:auto}.seg + .leg{margin-left:0}
      .seg button{background:transparent;border:none;color:#999;font:inherit;font-size:13px;padding:0 13px;height:36px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}.seg button.on{background:#3a3a3a;color:#fff;font-weight:600}
      .ev.one{display:flex;align-items:center;gap:6px;white-space:nowrap}.ev.one .et{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:block}
      .ev.one .tm{flex:none;color:#9a9a9a;font-size:.9em;font-variant-numeric:tabular-nums}.ev.one .src{flex:none;margin:0}
      .pev.mid .ev.one{white-space:nowrap;gap:4px}.pev.mid .ev.one .tm{font-size:10px}
      .lgi{display:flex;align-items:center;gap:6px;font-size:13px;color:#ccc}.lgi i{width:10px;height:10px;border-radius:3px;display:inline-block}.ev.w{white-space:normal;line-height:1.35}.ev.w .du{margin-left:6px}@keyframes fpspin{to{transform:rotate(360deg)}}
      .lab{background:#232323;border-radius:10px;padding:8px 8px 8px 12px;display:flex;align-items:center;gap:10px;min-width:0;box-sizing:border-box}
      .lv2{display:flex;align-items:center;gap:4px;margin-top:5px;flex-wrap:wrap}
      .rib2{background:var(--rc);color:#141414;font-size:11px;font-weight:800;line-height:18px;padding:0 11px 0 7px;border-radius:3px 0 0 3px;clip-path:polygon(0 0,100% 0,86% 50%,100% 100%,0 100%);margin-right:2px;letter-spacing:.2px}
      .ic{width:38px;height:38px;border-radius:10px;background:rgba(105,195,80,.14);color:${G};display:flex;align-items:center;justify-content:center;flex:none}
      .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#161616;flex:none}
      .lt{min-width:0;flex:1}
      .lv b{font-weight:700}
      .lab[data-person]{cursor:pointer;-webkit-tap-highlight-color:transparent}.lab[data-person]:active{background:#2a2a2a}
      .rib{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);background:var(--rc);color:#141414;font-size:9px;font-weight:800;padding:1px 8px;line-height:13px;white-space:nowrap;letter-spacing:.3px;clip-path:polygon(0 0,100% 0,90% 50%,100% 100%,0 100%,10% 50%);z-index:2}
      .bdg{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap}
      ${AWCSS}
      .lv2 .md{width:32px;height:32px;border-width:1.5px}.lv2 .md ha-icon{--mdc-icon-size:19px}.lv2{gap:6px}.mdm{font-size:12px;color:#8a8a8a;font-weight:600}.pp{color:${G};font-weight:600}
      .md.lg{width:36px;height:36px}.md.lg ha-icon{--mdc-icon-size:20px}
      .ovl{position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:16px;display:flex;align-items:center;justify-content:center;z-index:10}
      .pnl{background:#1e1e1e;border:1px solid #3a3a3a;border-radius:16px;width:min(600px,94%);max-height:92%;overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.6);box-sizing:border-box}
      .ph{display:flex;align-items:center;gap:18px;margin-bottom:16px}.phn{flex:1}.pn2{font-size:24px;font-weight:600}
      .ring.bigr{width:64px;height:64px;display:flex}.ring.bigr .crown{top:-14px}.ring.bigr .crown ha-icon{--mdc-icon-size:24px}.ring.bigr .rib{font-size:11px;line-height:15px;bottom:-7px}
      .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kp div{background:#262626;border-radius:10px;padding:10px 12px}
      .kp span{display:block;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}.kp b{font-size:18px;font-weight:400}.kp small{font-size:12px;color:#888}
      .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 0 8px}
      .aw{display:flex;gap:12px;align-items:center;background:#262626;border-radius:10px;padding:10px 12px;margin-bottom:6px}.aw b{font-size:15px}.aw div div{font-size:12px;color:#aaa;margin-top:2px}
      .aw0{color:#888;font-size:13px}
      .rl2{display:grid;grid-template-columns:22px 140px 1fr;gap:3px 10px;align-items:center;font-size:12px;color:#aaa;padding:7px 0;border-top:1px solid #2a2a2a}.rl2 b{color:#ddd}
      .rl2 em{grid-column:3;font-style:normal;color:#E0A84F;font-size:11px}
      .nm{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lv{font-size:11px;margin-top:2px}
      .cls{display:flex;flex-wrap:wrap;gap:2px 8px;margin-top:2px}.cl{font-size:11px;color:#7a7a7a;display:flex;align-items:center;gap:4px}.cl i{width:7px;height:7px;border-radius:50%;display:inline-block}
      .streak{font-size:11px;color:#9a9a9a;display:flex;align-items:center;gap:3px;margin-top:3px}.streak ha-icon{--mdc-icon-size:13px;color:#E0A84F}
      .bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,135px),1fr));gap:6px}
      .btn{display:flex;align-items:center;gap:9px;width:100%;background:#323232;border:1px solid #3a3a3a;border-radius:9px;padding:6px 9px;margin:0;color:#eee;font:inherit;font-size:13px;line-height:1.25;min-height:40px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box;transition:background .2s,border-color .2s}
      .btn:active{transform:scale(.98)}
      .btn .cb{width:22px;height:22px;border-radius:50%;border:2px solid #5d5d5d;flex:none;position:relative;box-sizing:border-box;transition:all .2s}
      .btn.done{background:rgba(105,195,80,.12);border-color:rgba(105,195,80,.45)}
      .btn.done .cb{background:${G};border-color:${G}}
      .btn.done .cb::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid #1e1e1e;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
      .btn.done .bt{color:#a7dc93}
      .btn .tag{display:inline-block;font-style:normal;font-size:10px;font-weight:700;letter-spacing:.3px;padding:1px 6px;border-radius:7px;margin-right:6px;vertical-align:1px}
      .btn.spc{border-color:rgba(245,197,66,.65);background:rgba(245,197,66,.08)}.btn.spc .tag{background:rgba(245,197,66,.2);color:#F5C542}
      .btn.tdo{border:1px dashed rgba(79,163,224,.7);background:rgba(79,163,224,.07)}.btn.tdo .tag{background:rgba(79,163,224,.2);color:#4FA3E0}.btn.tdo .cb{border-radius:6px}
      .btn.tdo.arm{border-style:solid;border-color:#4FA3E0;background:rgba(79,163,224,.18)}
      .tdn2{font-size:11px;font-weight:700;color:#4FA3E0;margin-top:4px}.pl.spl{color:#F5C542}
      .btn.pop .cb{animation:fpcheck .5s cubic-bezier(.3,1.6,.5,1)}.btn.pop .cb::before{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid ${G};animation:fpring .6s ease-out forwards}
      @keyframes fpcheck{0%{transform:scale(.55)}60%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes fpring{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.3);opacity:0}}
      @media (prefers-reduced-motion:reduce){.btn.pop .cb,.btn.pop .cb::before{animation:none}}
      .due{font-style:normal;font-size:10px;font-weight:600;color:#E0A84F;border:1px solid rgba(224,168,79,.5);border-radius:8px;padding:1px 6px;margin-left:6px;white-space:nowrap;display:inline-block}
      .due.last{color:#1e1e1e;background:#E0A84F;border-color:#E0A84F}.btn.done .due{opacity:.5}
      .pl.op{color:#c39a4a}.pl.op::before{display:none}
      .pev.mid .ev{font-size:11px;padding:3px 5px 3px 6px;white-space:normal;line-height:1.3}.pev.mid .et{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ddd}
      .pev.xl .ev{padding:5px 8px;font-size:12px}.pev.xl .et{color:#eee}
      .pst{display:inline-block;font-size:11px;font-weight:700;color:#141414;background:var(--pc);border-radius:6px;padding:1px 6px;line-height:16px}
      .c.p.sm{padding:6px 4px;min-height:40px;display:flex;flex-direction:column;align-items:center;gap:4px}
      .evn{display:flex;align-items:center;gap:3px;font-size:11px;color:#aaa;margin-bottom:5px;flex-wrap:wrap;justify-content:center}.evn i{width:6px;height:6px;border-radius:50%;display:inline-block}.evn b{margin-left:2px;font-weight:600}
      .hd.ts-s{padding:4px 4px 6px;font-size:9px;letter-spacing:.5px}.hd.ts-s b{font-size:14px;color:#8a8a8a}
      .hd.ts-m b{font-size:17px}
      .c.p .big{font-size:14px}.c.p .big small{font-size:10px}.c.p .bar{margin:5px 0 4px}
      .fc{font-size:11px;color:#8a8a8a;white-space:nowrap}.fc b{font-size:18px;font-weight:300;color:#ddd;margin-right:4px}
      .opn{font-size:11px;color:#c39a4a;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .prog{font-size:11px;color:#8a8a8a;margin-bottom:4px;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.8px}.gr{color:${G};font-weight:600}
      .free{display:flex;align-items:center;gap:8px;color:#8a8a8a;font-size:14px;padding:6px 2px}.free ha-icon{color:${G}}
      .vc{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;min-height:40px;color:#4FA3E0;font-size:13px;font-weight:600;background:rgba(79,163,224,.08);border-radius:8px}.vc ha-icon{--mdc-icon-size:20px}
      .big{font-size:18px;font-weight:300;line-height:1.1}.big small{font-size:13px;color:#8a8a8a}
      .bar{height:4px;border-radius:2px;background:#3a3a3a;margin:7px 0 6px;overflow:hidden}.bar i{display:block;height:100%}
      .miss{font-size:11px;color:#d98080;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ok{font-size:11px;color:${G};display:flex;align-items:center;gap:4px}.ok ha-icon{--mdc-icon-size:14px}
      .pl{font-size:12px;color:#7a7a7a;line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pl::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#555;margin-right:6px;vertical-align:middle}
      .none{font-size:13px;color:#555}
      .ev{font-size:12px;line-height:1.3;padding:4px 6px 4px 7px;border-left:3px solid;background:#303030;border-radius:0 6px 6px 0;margin-top:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .ev:first-child{margin-top:0}.ev b{font-weight:600;color:#aaa;margin-right:5px}
      .more{font-size:11px;color:#777;margin-top:4px}
      .emptyk{grid-column:1/-1;color:#7a7a7a;padding:20px;text-align:center}
      .err{color:#E06B6B;font-size:12px;margin-top:10px}
    </style>
    <div class="card${phone ? ' phone' : ''}">
      <div class="top">
        <div class="seg">${[['alle', 'Alles'], ['aemtli', 'Ämtli'], ['extra', 'To-dos & Spezial'], ['termine', 'Termine'], ['schule', 'Stundenplan']].filter(([v]) => v !== 'schule' || Object.keys(this._cfg.schule || {}).length).map(([v, l]) => `<button class="${(this._mode || 'alle') === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        ${this._cfg.todos_knopf ? `<div class="tdg"><button class="nb td${this._cfg.todos_offen ? ' g' : ''}" data-todos title="To-dos"><ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon>${phone ? '' : 'To-dos'}${this._cfg.todos_offen ? ` <b class="tdn">${Number(this._cfg.todos_offen)}</b>` : ''}</button><button class="nb" data-todoadd title="To-do hinzufügen"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ''}
        <div class="nav">
          ${(phone ? (this._dayOff || 0) !== 0 : this._week !== 0) ? `<button class="nb g" data-nav="0">Heute</button>` : ''}
          ${cals.length && !phone ? `<button class="nb${this._syncing ? ' spin2' : ''}" data-sync title="Kalender synchronisieren"><ha-icon icon="mdi:calendar-sync-outline"></ha-icon></button>` : ''}
          <button class="nb" data-nav="-1"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          ${phone ? `<div class="dd"><b>${ymd(sel) === tStr ? 'Heute' : WDL[isoWd(sel) - 1]}</b>${sel.getDate()}. ${MON[sel.getMonth()]}</div>`
            : `<div class="wk"><b>KW ${isoWeek(ws)}</b>${ws.getDate()}. ${ws.getMonth() !== we.getMonth() ? MON[ws.getMonth()].slice(0, 3) + '. ' : ''}– ${we.getDate()}. ${MON[we.getMonth()]}</div>`}
          <button class="nb" data-nav="1"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </div>
      </div>
      <div class="grid">${head}${(!cals.length || cals.some((c) => !c.person)) ? termine : ''}${rows}${empty}</div>
      ${this._err ? `<div class="err">${esc(this._err)}</div>` : ''}
      ${this._detail ? this._detailHtml(kids, pre, awards, frames) : ''}
    </div>`;
  }
}

// Navigation zwischen den Familienplaner-Seiten (funktioniert auch im Kiosk-Modus ohne HA-Kopfzeile)
const fpNavigate = (p) => {
  const parts = location.pathname.split('/').filter(Boolean);
  history.pushState(null, '', `/${parts[0] || 'family-planer'}/${p}${location.search}`);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
};
window.FP = { AWT, AWR, AWCSS, avatarGen, FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx, planActive, AV_TYPES, PALETTE, fpNavigate, startOfDay, ymd };
customElements.define('lox-wochenplaner-card', LoxWochenplanerCard);
