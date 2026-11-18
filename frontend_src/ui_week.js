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
const FPL = 'de';
const TX = {
  de: { fer: 'Ferien', awy: 'Nicht da', today: 'Heute', week: 'Woche', since: 'seit {n} T.', more: '+{n} weitere', less: 'weniger', vol: 'Freiwillig', volSub: 'Wer zuerst kommt …', take: 'Ich nehm\'s!', who: 'Wer nimmt es?',
    secret: '🤫 Geheim-Ämtli', reveal: 'Anzeigen', pts: '{n} M.', x2: 'Münzen x2', bday: 'Geburtstag', spc: 'Sonder', spcH: 'Sonderämtli', open: '{n} offen', rel: 'Zuverlässigkeit', cancel: 'Abbrechen', none: 'Nichts geplant – frei!',
    school: 'Schule', events: 'Termine', chores: 'Ämtli', todos: 'To-dos', allDone: 'Alles erledigt!', of: '{a} von {b}', plan: 'Geplant', tomS: 'Morgen', nextS: 'Als Nächstes',
    awNow: 'weg bis {d}', awToday: 'heute weg', awTom: 'ab morgen weg', awTomAt: 'morgen ab {t} weg', awAt: 'ab {t} weg', wd: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] },
  en: { fer: 'Holiday', awy: 'Away', today: 'Today', week: 'Week', since: 'for {n} d', more: '+{n} more', less: 'less', vol: 'Volunteer', volSub: 'First come, first served …', take: 'I\'ll take it!', who: 'Who takes it?',
    secret: '🤫 Secret job', reveal: 'Show', pts: '{n} pts', x2: 'Points x2', bday: 'Birthday', spc: 'Extra', spcH: 'Special chores', open: '{n} open', rel: 'Reliability', cancel: 'Cancel', none: 'Nothing planned – free!',
    school: 'School', events: 'Events', chores: 'Chores', todos: 'To-dos', allDone: 'All done!', of: '{a} of {b}', plan: 'Planned', tomS: 'Tomorrow', nextS: 'Next up',
    awNow: 'away until {d}', awToday: 'away today', awTom: 'away from tomorrow', awTomAt: 'away tomorrow from {t}', awAt: 'away from {t}', wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
}[FPL];
// birthday animations behind the birthday child (one per day, chosen by the server)
const BDAY_FX = (n) => {
  const C = ['#FF7AB6', '#FFD84D', '#5CE1E6', '#9EDC9E', '#B07CFF', '#FF8A3C'];
  let h = '';
  if (n === 0) for (let i = 0; i < 18; i++) { const a = (i / 18) * 360; h += `<i class="cf" style="--a:${a}deg;--c:${C[i % 6]};animation-delay:-${(i % 6) * 0.25}s"></i>`; }
  if (n === 1) for (let i = 0; i < 6; i++) h += `<i class="bl" style="--x:${(i - 2.5) * 22}px;--c:${C[i]};animation-delay:-${i * 0.7}s"></i>`;
  if (n === 2) for (let i = 0; i < 10; i++) h += `<i class="bu" style="--x:${(i % 5 - 2) * 26}px;--s:${10 + (i * 7) % 14}px;animation-delay:-${i * 0.45}s"></i>`;
  if (n === 3) h = '<i class="rd"></i><i class="rd r2"></i>';
  if (n === 4) for (let i = 0; i < 14; i++) { const a = (i / 14) * 360; h += `<i class="st" style="--a:${a}deg;animation-delay:-${(i % 7) * 0.3}s">★</i>`; }
  return `<span class="bdx b${n}" aria-hidden="true">${h}</span>`;
};
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
  ontime: ['Pünktlich-Profi', 'Den grössten Teil der Ämtli rechtzeitig erledigt (bis {t} Uhr am letzten Tag).'],
  volunteer: ['Freiwilligen-Champion', 'Am meisten freiwillige Ämtli übernommen und erledigt.'],
  rescue: ['Retter in der Not', 'Ein freiwilliges Ämtli übernommen, das am längsten offen war.'],
  diamond: ['Diamant-Serie', '{n} Tage am Stück alles erledigt.'],
  milestone: ['Meilenstein {n}', '{n} Tage mit allen eigenen Ämtli erledigt.'],
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
  ['ontime', 'mdi:clock-check-outline', '#FFB74D', 'Pünktlich-Profi', 'Mindestens 80 % der Ämtli einer Woche rechtzeitig erledigt – vor dem letzten Tag oder an diesem bis {t} Uhr. Abend-Ämtli zählen also auch.'],
  ['volunteer', 'mdi:hand-heart', '#8BC34A', 'Freiwilligen-Champion', 'Am meisten freiwillige Ämtli einer Woche übernommen und erledigt.'],
  ['rescue', 'mdi:lifebuoy', '#FF7043', 'Retter in der Not', 'Ein freiwilliges Ämtli übernommen, das am längsten (mind. einen Tag) offen war.'],
  ['diamond', 'mdi:diamond-stone', '#7FDBFF', 'Diamant-Serie', '30 Tage am Stück alles erledigt.'],
  ['milestone', 'mdi:medal', '#E0A84F', 'Meilenstein', '25, 100 und 250 Tage mit allen eigenen Ämtli erledigt – fair, egal wie viele Ämtli jemand hat.'],
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
// points coin (coin.js); '' when switched off
const fpCoin = (px) => (window.FPCOIN ? window.FPCOIN.svg(px) : '');
const evRange = (e, short) => {
  if (e.allDay) return short ? 'ganzt.' : 'ganztägig';
  const t = (x) => (short && !x.getMinutes() ? String(x.getHours()) : pad(x.getHours()) + ':' + pad(x.getMinutes()));
  return `${t(e.s)}–${t(e.e)}`;
};
// Bild einer Person: k.bild = 'av:<code>' (Baukasten), 'svg:<portrait>' oder 'mdi:<icon>' (aus den Einstellungen), sonst k.avatar aus der Kartenkonfig
const avatarHtml = (k, size) => {
  const b = k.bild || '';
  if (b.startsWith('img:')) return `<img src="${esc(b.slice(4))}" alt="" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:none;display:inline-block">`;
  if (b.startsWith('av2:') && window.FPAV) return `<span class="avs" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:inline-flex;flex:none">${window.FPAVS ? window.FPAVS.decorate(b, k.farbe, k.name) : window.FPAV.svg(b, k.farbe)}</span>`;
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

// one big friendly eye with lashes, drawn like the avatar builder's eyes
const REVEAL_EYE = '<svg viewBox="0 0 34 24" width="32" height="23" aria-hidden="true"><path d="M2 13C6.5 6 11.5 4 17 4s10.5 2 15 9c-4.5 7-9.5 9-15 9S6.5 20 2 13z" fill="#fff" stroke="#3b2a1e" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17" cy="13" r="6" fill="#4f86d9"/><circle cx="17" cy="13" r="3" fill="#1a110b"/><circle cx="19.2" cy="10.8" r="1.5" fill="#fff"/><path d="M6 7.5 4 5M11 5 10 2.8M17 4V1.8M23 5 24 2.8M28 7.5 30 5" stroke="#3b2a1e" stroke-width="1.4" stroke-linecap="round"/></svg>';
class FpBase extends HTMLElement {
  setConfig(config) {
    this._cfg = this._normalize(config || {});
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._bind(); if (!this.lang) this.lang = FPL; }
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
    if (this._onFpRefresh) { window.removeEventListener('fp-refresh', this._onFpRefresh); this._onFpRefresh = null; }
    if (this._onFitResize) { window.removeEventListener('resize', this._onFitResize); this._onFitResize = null; }
    this._unsubs = null;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
  _ensure() {
    if (!this._hass || !this._cfg || !this.isConnected || this._unsubs) return;
    // header refresh button: pull the calendars again and reload the events
    this._onFpRefresh = () => { if (this._syncCal) this._syncCal(); }; window.addEventListener('fp-refresh', this._onFpRefresh);
    this._onFitResize = () => { clearTimeout(this._fitT); this._fitT = setTimeout(() => { if (this._fit) this._fit(); }, 150); }; window.addEventListener('resize', this._onFitResize);
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
    this._view = null; // null = the default view from the settings (Today or Week)
    window.addEventListener('location-changed', () => { if (this._view) { this._view = null; this._render(); } });
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
    const viewNow = this._view || (((this.fpStore && this.fpStore.snap) || {}).settings || {}).default_view || 'today';
    if (this._phoneOn || viewNow === 'today') {
      this._dayOff = step === 0 ? 0 : (this._dayOff || 0) + step;
      const t = startOfDay(fpDay()); const sel = addDays(t, this._dayOff);
      const wk = Math.round((addDays(sel, 1 - isoWd(sel)) - addDays(t, 1 - isoWd(t))) / (7 * 86400000));
      if (wk !== this._week) { this._week = wk; this._events = []; this._fetchEvents(); }
    } else {
      this._week = step === 0 ? 0 : this._week + step; this._dayOff = 0; this._events = []; this._fetchEvents();
    }
    clearTimeout(this._navT);
    if (this._week || this._dayOff || this._view) this._navT = setTimeout(() => { this._week = 0; this._dayOff = 0; this._focus = null; this._view = null; this._events = []; this._fetchEvents(); this._render(); }, (Number(this._cfg.ruhe_sekunden) || 45) * 1000);
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
  // special chores of one person today (bonus points only, never part of the reliability)
  _sonderVisible(it, tStr) {
    if (!(it.start <= tStr && it.end >= tStr)) return false;
    const n = new Date(); const hm = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
    if (it.start === tStr && it.from && hm < it.from) return false;
    if (it.end === tStr && it.until && hm > it.until && !it.done) return false;
    return true;
  }
  _sonderTitle(it) {
    return !it.secret ? esc(it.title) : this._reveal === it.id ? `<span class="rvx">${esc(it.title)}</span>` : TX.secret;
  }
  // points a chore / to-do is worth (from the snapshot); 0 = show nothing
  _pts(kind, id) { const s = (this.fpStore && this.fpStore.snap) || {}; const n = Math.round(Number((s[kind] || {})[id]) || 0); return n > 0 ? n : 0; }
  // every task button is built the same: title, then small rounded info chips, points right-aligned
  // every task button is built the same: left title + time info (seit / heute fällig / bis Mo), right source + points.
  // Fits on one line → one line; otherwise left: title over time, right: points over source (see _fit()).
  _bi(title, time, src, pts) {
    // line 1: title over the full width; line 2: chips left, points + open/done field right (no tick circle)
    const meta = `${time || ''}${src || ''}`;
    return `<span class="bin"><span class="bx">${title}</span><span class="b2"><span class="bm">${meta}</span><span class="br">${pts > 0 ? `<b class="ptr">${fpCoin(11)}+${pts}</b>` : ''}<i class="stt" aria-hidden="true"></i></span></span></span>`;
  }
  _fit() {
    const root = this.shadowRoot; if (!root) return;
    root.querySelectorAll('.tcol').forEach((c) => c.classList.toggle('nar', c.clientWidth > 0 && c.clientWidth < 320));
    // a title that does not fit on one line (cut with "…" or pushing the chips to a second line) switches the button to two lines
    root.querySelectorAll('.bin').forEach((b) => { b.classList.remove('two'); const x = b.querySelector('.bx'); const l = b.firstElementChild; const r = b.lastElementChild;
      if ((x && x.scrollWidth > x.clientWidth + 1) || (r && l && r.offsetTop > l.offsetTop + 2) || b.closest('.tcol.nar')) b.classList.add('two'); });
  }
  _listName(t) {
    // the server's label (owner name instead of an e-mail address); never show an address on the tablet
    const ent = String(t.src || '').split('|')[0]; const st = ent && this._hass && this._hass.states[ent];
    const lab = ((this.fpStore && this.fpStore.snap && this.fpStore.snap.list_labels) || {})[ent];
    if (lab) return lab;
    if (!st) return '';
    const fn = String((st.attributes || {}).friendly_name || ent);
    const m = fn.match(/^\s*([^\s@]+)@\S+\s*(.*)$/);
    return m ? (m[2] || m[1]) : fn;
  }
  // separate, calm button on the right – far from the tick, so revealing never ticks the job off
  _revealBtn(it, hot) {
    // the eye stays while the job is shown: a second tap hides it again (never ticks it off)
    return it.secret ? `<button class="rvb${hot ? ' y' : ''}${this._reveal === it.id ? ' on' : ''}" data-reveal="${esc(it.id)}" title="${TX.reveal}" aria-label="${TX.reveal}">${REVEAL_EYE}</button>` : '';
  }
  _sonderBtns(snap, pid, tStr) {
    const pts = snap.sonder_points || {};
    return (snap.sonder || []).filter((it) => it.pid === pid && (it.done ? (it.done_at || '').slice(0, 10) === tStr : this._sonderVisible(it, tStr)))
      .map((it) => { const b = `<button class="btn spc2${it.done ? ' done' : ''}${this._pop && this._pop.uid === it.id && Date.now() - this._pop.t < 600 ? ' pop' : ''}" data-sonder="${esc(it.id)}"><span class="cb"></span>${this._bi(this._sonderTitle(it), '', `<em class="tag">${esc(it.icon)}<span class="tl"> ${TX.spc}</span></em>`, Number(pts[it.id]) || 0)}</button>`;
        const r = it.done ? '' : this._revealBtn(it); return r ? `<div class="spw">${b}${r}</div>` : b; }).join('');
  }
  // an absent day: "Holiday" only for real holidays (or when chosen in the check), otherwise "Away"
  _awayLook(snap, name, ds) {
    const p = ((snap && snap.persons) || []).find((x) => x.name === name);
    const kind = p ? (((snap.away_kind || {})[p.id]) || {})[ds] : null;
    return kind === 'holiday' ? { icon: 'mdi:palm-tree', text: TX.fer } : { icon: 'mdi:airplane', text: TX.awy };
  }
  // empty day: friendly box with the next event of this person (tomorrow / weekday)
  _noneBox(k, dSel, evWho) {
    const from = addDays(startOfDay(dSel), 1); const until = addDays(from, 7);
    const nx = (this._events || []).filter((e) => (evWho.get(e) || []).includes(k.name) && e.s >= from && e.s < until && !(e.c && e.c.schule))
      .sort((a, b) => a.s - b.s)[0];
    let sub = '';
    if (nx) {
      const dd = Math.round((startOfDay(nx.s) - startOfDay(dSel)) / 86400000);
      sub = `<small>${esc(dd === 1 ? TX.tomS : TX.wd[nx.s.getDay()])}: ${esc(nx.title)}${nx.allDay ? '' : ` · ${pad(nx.s.getHours())}:${pad(nx.s.getMinutes())}`}</small>`;
    }
    return `<div class="none2"><ha-icon icon="mdi:balloon"></ha-icon><div><b>${esc(TX.none)}</b>${sub}</div></div>`;
  }
  // what a chore brings rises slowly above it: coins (rewards) and, with pets on, the same number of Tierchen points
  _coinFly(btn) {
    try {
      if (!btn || !window.FPPET) return;
      const ptr = btn.querySelector('.ptr'); const col = btn.closest('.tcol'); const lab = col && col.querySelector('.lab.th');
      const pts = Number(((ptr && ptr.textContent) || '').replace(/[^0-9]/g, '')) || 0; if (!pts || !lab) return;
      const snap = (this.fpStore && this.fpStore.snap) || {}; const pr = (snap.persons || []).find((x) => x.name === lab.dataset.person); if (!pr) return;
      const r = btn.getBoundingClientRect(); const coin = ptr.querySelector('svg');
      window.FPPET.onTick(snap, pr.id, r.left + r.width / 2, r.top - 6, pts, coin ? coin.outerHTML : '');
    } catch (e) { /* no animation */ }
  }
  _volCards(snap, tStr, persons) {
    const pts = snap.sonder_points || {};
    const open = (snap.sonder || []).filter((it) => it.pid == null && !it.done && this._sonderVisible(it, tStr));
    return open.map((it) => {
      // who takes it: big avatar tiles for the whole family (easy to hit on the tablet), cancel as a small link
      const who = this._claim === it.id ? `<div class="vpick"><span class="vq">${TX.who}</span><div class="vps">${persons.filter((p) => (it.elig || []).includes(p.id)).map((p) => `<button class="vp" data-claimp="${esc(it.id)}|${esc(p.id)}" style="--c:${p.farbe}">${avatarHtml(p, 46)}<b>${esc(p.name)}</b></button>`).join('')}</div><button class="vx" data-claim="${esc(it.id)}">${TX.cancel}</button></div>` : '';
      // secret chore: one tile with one border, split by a line – chore left, eye right (same as in the columns)
      const rv = this._revealBtn(it, true);
      const main = `<span class="vi">${esc(it.icon)}</span><span class="vt">${this._sonderTitle(it)}<small>${it.until && it.end === tStr ? ` · ⏰ ${esc(it.until)}` : it.end > tStr ? ` · ⏳ ${esc(it.end.slice(8, 10))}.${esc(it.end.slice(5, 7))}.` : ''}</small></span>${pts[it.id] ? `<b class="ptr">${fpCoin(13)}+${Number(pts[it.id])}</b>` : ''}<div class="vbtn"><button class="take" data-claim="${esc(it.id)}">🙋 ${TX.take}</button></div>${who}`;
      return rv ? `<div class="vcard vsplit"><div class="vmain">${main}</div>${rv}</div>` : `<div class="vcard">${main}</div>`;
    }).join('');
  }
  // badge "away" next to the person: the day before and while away (same detection as pausing chores)
  _awBadge(snap, pid) {
    const b = ((snap || {}).away_badge || {})[pid]; if (!b) return '';
    const ic = b.kind === 'holiday' ? '🌴' : '✈️'; let txt;
    if (b.state === 'tomorrow') txt = b.at ? TX.awTomAt.replace('{t}', b.at) : TX.awTom;
    else if (b.state === 'today') txt = TX.awAt.replace('{t}', b.at);
    else {
      // until: a date (all-day) or Swiss-time date and time "2026-11-17T23:30+01:00"
      const day = String(b.until).slice(0, 10); const tm = b.allday ? '' : String(b.until).slice(11, 16);
      const isToday = day === ymd(startOfDay(new Date())); const wd = TX.wd[new Date(day + 'T12:00:00').getDay()];
      txt = b.allday ? (isToday ? TX.awToday : TX.awNow.replace('{d}', wd)) : TX.awNow.replace('{d}', isToday ? tm : `${wd} ${tm}`);
    }
    return `<div class="awb${b.state === 'now' ? ' now' : ''}">${ic} ${esc(txt)}</div>`;
  }
  _lvBadge(name) {
    const v = this._lvState(name); if (!v) return '';
    const g = v.up && v.taps < 20 ? (v.taps < 5 ? 'glow' : 'fade') : '';
    return `<button class="lvb t-${v.pt.tier} ${g}" data-lvtap="${esc(name)}" style="--lc:${v.pt.tier_color};--g:${g === 'fade' ? (20 - v.taps) / 15 : 0}" title="Level ${v.pt.level} · ${esc(v.pt.name)}">${v.pt.level}</button>`;
  }
  _lvCap(name, relC, pct, title) {
    const v = this._lvState(name);
    const lvl = v ? (() => { const g = v.up && v.taps < 20 ? (v.taps < 5 ? 'glow' : 'fade') : '';
      return `<button class="lvl ${g}" data-lvtap="${esc(name)}" style="--lc:${v.pt.tier_color};--g:${g === 'fade' ? (20 - v.taps) / 15 : 0}" title="Level ${v.pt.level} · ${esc(v.pt.name)}"><i>★</i><b>${v.pt.level}</b><small>${esc(v.pt.name)}</small></button>`; })() : '';
    return `<div class="cap"><span class="rel" style="--rc:${relC}" title="${title}"><i>✓</i><b>${pct}%</b></span>${lvl}</div>`;
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
    const et = (s.settings || {}).ontime_time || '20:00';
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
    const snap = (this.fpStore && this.fpStore.snap) || {}; const pts = snap.award_points || {}; const et = (snap.settings || {}).ontime_time || '20:00';
    const on = ((snap.award_settings || {}).items) || {};
    const q = (x) => (x[1] ? `${x[0]} / ${x[1]} <small>(${Math.round((x[0] / x[1]) * 100)} %)</small>` : '<small>noch keine</small>');
    const holders = (id) => kids.filter((x) => (awards[x.name] || []).some((a) => a.id === id)).map((x) => x.name).join(', ') || 'noch niemand';
    return `<div class="ovl" data-close><div class="pnl" data-keep>
      <div class="ph"><div class="ring bigr${frames[k.name] ? ' fr-' + frames[k.name] : ''}"><span class="ava">${avatarHtml(k, 64)}</span>${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) + (window.FPAVS ? window.FPAVS.outer(k.name) : '') : ''}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}<span class="rib" style="--rc:${lv.c}">${s.pct}%</span></div>
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
    const fpp = e.target.closest('[data-fppet]');
    if (fpp) { window.__fpPetPerson = fpp.dataset.fppet; window.__fpPetTab = 'tier'; fpNavigate((window.__fpPaths || {}).tierchen || 'tierchen'); return; }
    const fpw = e.target.closest('[data-fpwheel]');
    if (fpw && window.FPPET && this.fpStore) { window.FPPET.openWheel(this.fpStore, fpw.dataset.fpwheel); return; }
    if (e.target.closest('[data-x]')) { this._detail = null; this._render(); return; }
    if (e.target.closest('[data-keep]')) return;
    if (e.target.closest('[data-close]')) { this._detail = null; this._render(); return; }
    const tdb = e.target.closest('[data-todoid]');
    if (tdb && this.fpStore) {
      const s = this.fpStore.snap || {}; const t = (s.todos || []).find((x) => x.id === tdb.dataset.todoid); if (!t) return;
      const confirm = !s.todo_settings || s.todo_settings.confirm !== false;
      if (!t.done && confirm && this._tdArm !== t.id) { this._tdArm = t.id; clearTimeout(this._tdT); this._tdT = setTimeout(() => { this._tdArm = null; this._render(); }, 4000); this._render(); return; }
      // one press at a time: until the server answered, further presses on this to-do are ignored (no double coins)
      this._tdBusy = this._tdBusy || new Set(); if (this._tdBusy.has(t.id)) return;
      this._tdFlown = this._tdFlown || new Set();
      this._tdArm = null; if (!t.done) { if (!this._tdFlown.has(t.id)) { this._tdFlown.add(t.id); this._coinFly(tdb); } this._pop = { uid: t.id, t: Date.now() }; }
      this._tdBusy.add(t.id); const free = () => setTimeout(() => this._tdBusy.delete(t.id), 600);
      this.fpStore.ws('family_planer/todo/set', { todo_id: t.id, done: !t.done }).then(free, () => { free(); this._render(); }); return;
    }
    const vw = e.target.closest('[data-view]');
    if (vw) { const chg = this._view !== vw.dataset.view; this._view = vw.dataset.view; this._dayOff = 0; this._week = 0; this._go(0); if (chg) fadeIn(this.shadowRoot && this.shadowRoot.querySelector('.grid, .tgrid') || this); return; }
    const tm = e.target.closest('[data-tdmore]'); if (tm) { this._tdMore = this._tdMore === tm.dataset.tdmore ? null : tm.dataset.tdmore; this._render(); return; }
    const rv = e.target.closest('[data-reveal]'); if (rv && this._reveal === rv.dataset.reveal) { this._reveal = null; clearTimeout(this._rvT); this._render(); return; }
    if (rv) { this._reveal = rv.dataset.reveal; try { const b = rv.getBoundingClientRect(); if (window.FPCONFETTI && window.FPCONFETTI.burst) window.FPCONFETTI.burst(b.left + b.width / 2, b.top + b.height / 2, 'silver', '#F5C542', 0.45); } catch (err) { /* no effect */ } clearTimeout(this._rvT); this._rvT = setTimeout(() => { this._reveal = null; this._render(); }, 5000); this._render(); return; }
    if (e.target.closest('[data-volopen]')) { this._volOpen = true; this._render(); return; }
    const vcx = e.target.closest('[data-volclose]'); if (vcx && (e.target === vcx || vcx.tagName === 'BUTTON')) { this._volOpen = false; this._claim = null; this._render(); return; }
    const cl = e.target.closest('[data-claim]'); if (cl) { this._claim = this._claim === cl.dataset.claim ? null : cl.dataset.claim; this._render(); return; }
    const cp = e.target.closest('[data-claimp]');
    if (cp && this.fpStore) { const [iid, pid] = cp.dataset.claimp.split('|'); this._claim = null; this._volOpen = false; this.fpStore.ws('family_planer/sonder/claim', { inst_id: iid, person_id: pid }).catch(() => this._render()); return; }
    const sb = e.target.closest('[data-sonder]');
    if (sb && this.fpStore) {
      const it = ((this.fpStore.snap || {}).sonder || []).find((x) => x.id === sb.dataset.sonder); if (!it) return;
      if (!it.done) { this._coinFly(sb); this._pop = { uid: it.id, t: Date.now() }; const r = sb.getBoundingClientRect(); if (window.FPSEASON) window.FPSEASON.burst(this, r.left + 20, r.top + r.height / 2); }
      this.fpStore.ws('family_planer/sonder/set', { inst_id: it.id, done: !it.done }).catch(() => this._render()); return;
    }
    const lt = e.target.closest('[data-lvtap]'); if (lt) { this._lvTap(lt.dataset.lvtap, lt); return; }
    const pp = e.target.closest('[data-person]');
    if (pp) { this._detail = pp.dataset.person; clearTimeout(this._dT); this._dT = setTimeout(() => { this._detail = null; this._render(); }, (Number(this._cfg.ruhe_sekunden) || 30) * 1000); this._render(); return; }
    const b = e.target.closest('.btn');
    if (b && this._hass) {
      const done = b.classList.contains('done');
      b.classList.toggle('done');
      // little check animation only for the chore that was just ticked off
      if (!done) { this._coinFly(b); this._pop = { uid: b.dataset.uid, t: Date.now() }; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); const r = b.getBoundingClientRect(); if (window.FPSEASON) window.FPSEASON.burst(this, r.left + 20, r.top + r.height / 2); }
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
    // Tierchen: graphics come from their own file (once), found things rise above the chore that brought them
    const fpSnap = this.fpStore && this.fpStore.snap;
    if (window.FPPET && fpSnap && window.FPPET.enabled(fpSnap)) { if (!window.FPPETS && !this._petLoad) { this._petLoad = true; window.FPPET.load().then(() => this._render()).catch(() => {}); } window.FPPET.onSnap(fpSnap); }
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
    const snapX = (this.fpStore && this.fpStore.snap) || {}; const modeX = this._mode || 'alle'; if (window.FPCOIN) window.FPCOIN.config(snapX);
    const specIds = new Set((snapX.chores || []).filter((c) => c.schedule).map((c) => c.id));
    const pidOf = Object.fromEntries((snapX.persons || []).map((p) => [p.name, p.id]));
    const showTodos = modeX === 'alle' || modeX === 'extra';
    // events, lessons and condensed school blocks of one person on one day (week grid and Today view)
    const dayEv = (k, d) => {
      const dS = startOfDay(d), dE = addDays(dS, 1);
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
      return { pevAll, lessons, blockEvs, rest };
    };
    const rows = rowKids.map((k) => {
      const tdAll = showTodos ? (snapX.todos || []).filter((t) => t.person_id === pidOf[k.name] && (!t.done || (t.done_at || '').slice(0, 10) === tStr)) : [];
      const tdOpen = tdAll.filter((t) => !t.done); const maxTd = Number((snapX.todo_settings || {}).max_shown) || 4;
      const tds = this._tdMore === k.name ? tdAll : [...tdOpen.slice(0, maxTd), ...tdAll.filter((t) => t.done)];
      const tdRest = this._tdMore === k.name ? 0 : Math.max(0, tdOpen.length - maxTd);
      const ageOf = (t) => { if ((snapX.todo_settings || {}).show_age === false || t.done || !t.created) return ''; const n = Math.round((today - startOfDay(new Date(t.created))) / 86400000); return n >= 1 ? `<small class="age">${TX.since.replace('{n}', n)}</small>` : ''; };
      const tdBtns = tds.map((t) => `<button class="btn tdo${t.done ? ' done' : ''}${this._tdArm === t.id ? ' arm' : ''}" data-todoid="${esc(t.id)}"><span class="cb"></span>${this._bi(esc(this._tdArm === t.id ? 'Nochmals tippen zum Erledigen' : t.title), ageOf(t), `<em class="tag">${t.src && this._listName(t) ? `📋<span class="tl"> ${esc(this._listName(t))}</span>` : '☑<span class="tl"> To-do</span>'}</em>`, this._pts('todo_points', t.id))}</button>`).join('')
        + (tdRest ? `<button class="tdmore" data-tdmore="${esc(k.name)}">${TX.more.replace('{n}', tdRest)}</button>` : this._tdMore === k.name && tdOpen.length > maxTd ? `<button class="tdmore" data-tdmore="${esc(k.name)}">${TX.less}</button>` : '')
        + (showTodos ? this._sonderBtns(snapX, pidOf[k.name], tStr) : '');
      const mine = heute.filter((i) => i.m.k === k.name && (modeX !== 'extra' || specIds.has(i.m.c))).sort((a, b) => ((a.status === 'completed') - (b.status === 'completed')) || a.summary.localeCompare(b.summary, 'de'));
      const tDone = mine.filter((i) => i.status === 'completed').length;
      const st = pre[k.name]; const aw = awards[k.name] || [];
      const lv = level(st.pct); const C = 2 * Math.PI * 24;
      const AVS = phone ? 56 : 72;
      const seX = snapX.season || {}; const isBday = (seX.birthdays || []).includes(pidOf[k.name]);
      const label = `<div class="lab${isBday ? ' bday' : ''}" data-person="${esc(k.name)}" style="box-shadow:inset 3px 0 0 ${k.farbe}">
          <div class="ring${frames[k.name] ? ' fr-' + frames[k.name] : ''}" style="width:${AVS}px;height:${AVS}px"><span class="ava">${avatarHtml(k, AVS)}</span>${isBday && seX.anim_bday !== false ? BDAY_FX(Number((seX.bday_anim || {})[pidOf[k.name]]) || 0) : ''}${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) + (window.FPAVS ? window.FPAVS.outer(k.name) : '') : ''}${this._lvBadge(k.name)}${aw.some((a) => a.id === 'crown') ? '<span class="crown"><ha-icon icon="mdi:crown"></ha-icon></span>' : ''}</div>
          <div class="lt"><div class="nm">${esc(k.name)}${isBday ? ` <span class="x2" title="${TX.x2}">🎂 x2</span>` : ''}</div>${this._awBadge(snapX, pidOf[k.name])}<div class="lv2"><span class="rib2" style="--rc:${lv.c}">${st.pct}%</span>${aw.slice(0, phone ? 3 : 6).map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}${aw.length > (phone ? 3 : 6) ? `<span class="mdm">+${aw.length - (phone ? 3 : 6)}</span>` : ''}</div>
          </div>
          </div>`;
      const injectEv = (d, html) => {
        const dS = startOfDay(d), dE = addDays(dS, 1); const tr = T[ymd(d)]; const wide = tr === 'xl'; const mx = wide ? 5 : 3;
        const { lessons, blockEvs, rest } = dayEv(k, d);
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
          const aw = this._awayLook(snapX, k.name, ds);
          return `<div class="c ${ds < tStr ? 'p' : ds === tStr ? 't' : 'f'} vac${T[ds] === 's' ? ' sm' : ''}" data-focus="${ds}"><div class="vc"><ha-icon icon="${aw.icon}"></ha-icon>${T[ds] === 's' ? '' : `<span>${aw.text}</span>`}</div></div>`;
        }
        if (ds === tStr && ds !== focus) {
          return mine.length ? `<div class="c t" data-focus="${ds}"><div class="fc"><b>${tDone}/${mine.length}</b></div><div class="bar"><i style="width:${Math.round((tDone / mine.length) * 100)}%;background:${G}"></i></div>${tdOpen.length ? `<div class="tdn2">☑ ${tdOpen.length}</div>` : ''}</div>` : `<div class="c t" data-focus="${ds}">${tdOpen.length ? `<div class="tdn2">☑ ${tdOpen.length}</div>` : ''}</div>`;
        }
        if (ds === tStr) {
          if (!mine.length && !tdBtns) return '<div class="c t"></div>';
          if (!mine.length) return `<div class="c t"><div class="bg">${tdBtns}</div></div>`;
          const all = tDone === mine.length;
          return `<div class="c t"><div class="prog"><span>${tDone} von ${mine.length} erledigt</span>${all ? '<span class="gr">Super!</span>' : ''}</div><div class="bg">` +
            mine.map((i) => `<button class="btn${specIds.has(i.m.c) ? ' spc' : ''}${i.status === 'completed' ? ' done' : ''}${this._pop && this._pop.uid === i.uid && Date.now() - this._pop.t < 600 ? ' pop' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span>${this._bi(esc(i.summary), dueTag(i.m, tStr), specIds.has(i.m.c) ? '<em class="tag">⭐<span class="tl"> Spezial</span></em>' : '', this._pts('item_points', i.uid))}</button>`).join('') + tdBtns + `</div></div>`;
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
    // volunteer cards: only while a special chore is waiting for the fastest child
    const kidsP = kids.map((k) => ({ ...k, id: pidOf[k.name] }));
    const volHtml = this._volCards(snapX, tStr, kidsP);
    const volCount = (volHtml.match(/class="vcard"/g) || []).length;
    if (!volCount) this._volOpen = false;
    const volRow = ''; // the volunteer cards live in the yellow toolbar button and its popup (no extra column)
    const viewNow = this._view || (snapX.settings || {}).default_view || 'today';
    let todayGrid = '';
    if (viewNow === 'today') {
      const dSel = addDays(today, this._dayOff || 0); const dStr = ymd(dSel); const isT = dStr === tStr;
      const cols = rowKids.map((k) => {
        const pid = pidOf[k.name]; const st = pre[k.name]; const lv = level(st.pct); const aw = awards[k.name] || [];
        const isBday = ((snapX.season || {}).birthdays || []).includes(pid); const seX = snapX.season || {};
        const away = ((this._cfg.abwesend || {})[k.name] || []).includes(dStr);
        const ev = dayEv(k, dSel);
        // one header line per section: "Ämtli · 1 von 4" left, "Alles erledigt!" right
        const sec = (title, html, info, right) => (html ? `<div class="tsec"><div class="tsh"><span>${title}${info ? ` · ${info}` : ''}</span>${right || ''}</div>${html}</div>` : '');
        const evRow = (e) => { const est = isT ? evState(e) : { c: '', b: '' }; return `<div class="ev one${est.c}" style="border-color:${e.c.farbe}"><span class="et">${esc(e.title)}</span><span class="tm">${evRange(e, false)}</span>${est.b}</div>`; };
        const school = ['alle', 'schule'].includes(modeX) ? (modeX === 'schule' ? ev.lessons.map((e) => ({ ...e, title: e.loc ? `${e.title} · ${e.loc}` : e.title })) : ev.blockEvs) : [];
        const evs = ['alle', 'termine'].includes(modeX) ? ev.rest : [];
        let chores = ''; let tdh = ''; let sph = ''; let chInfo = ''; let chRight = ''; let tdInfo = '';
        if (['alle', 'aemtli', 'extra'].includes(modeX)) {
          if (isT) {
            const mine = heute.filter((i) => i.m.k === k.name && (modeX !== 'extra' || specIds.has(i.m.c))).sort((a, b) => ((a.status === 'completed') - (b.status === 'completed')) || a.summary.localeCompare(b.summary, 'de'));
            const dn = mine.filter((i) => i.status === 'completed').length;
            if (mine.length) { chInfo = TX.of.replace('{a}', dn).replace('{b}', mine.length); chRight = dn === mine.length ? `<span class="gr">${TX.allDone}</span>` : ''; }
            chores = mine.length ? '<div class="bg one">' + mine.map((i) => `<button class="btn${specIds.has(i.m.c) ? ' spc' : ''}${i.status === 'completed' ? ' done' : ''}${this._pop && this._pop.uid === i.uid && Date.now() - this._pop.t < 600 ? ' pop' : ''}" data-uid="${esc(i.uid)}"><span class="cb"></span>${this._bi(esc(i.summary), dueTag(i.m, tStr), specIds.has(i.m.c) ? '<em class="tag">⭐<span class="tl"> Spezial</span></em>' : '', this._pts('item_points', i.uid))}</button>`).join('') + '</div>' : '';
          } else {
            const pl = this._planFor(k.name, dSel); chores = pl.map((x) => `<div class="pl">${esc(x)}</div>`).join('');
          }
        }
        if (isT && ['alle', 'extra'].includes(modeX)) {
          const tdAll = (snapX.todos || []).filter((t) => t.person_id === pid && (!t.done || (t.done_at || '').slice(0, 10) === tStr));
          const tdOpen = tdAll.filter((t) => !t.done); const maxTd = Number((snapX.todo_settings || {}).max_shown) || 4;
          const list = this._tdMore === k.name ? tdAll : [...tdOpen.slice(0, maxTd), ...tdAll.filter((t) => t.done)];
          const rest = this._tdMore === k.name ? 0 : Math.max(0, tdOpen.length - maxTd);
          const ageOf = (t) => { if ((snapX.todo_settings || {}).show_age === false || t.done || !t.created) return ''; const n = Math.round((today - startOfDay(new Date(t.created))) / 86400000); return n >= 1 ? `<small class="age">${TX.since.replace('{n}', n)}</small>` : ''; };
          tdh = list.map((t) => `<button class="btn tdo${t.done ? ' done' : ''}${this._tdArm === t.id ? ' arm' : ''}" data-todoid="${esc(t.id)}"><span class="cb"></span>${this._bi(esc(this._tdArm === t.id ? 'Nochmals tippen zum Erledigen' : t.title), ageOf(t), `<em class="tag">${t.src && this._listName(t) ? `📋<span class="tl"> ${esc(this._listName(t))}</span>` : '☑<span class="tl"> To-do</span>'}</em>`, this._pts('todo_points', t.id))}</button>`).join('')
            + (rest ? `<button class="tdmore" data-tdmore="${esc(k.name)}">${TX.more.replace('{n}', rest)}</button>` : '');
          if (tdh) tdh = `<div class="bg one">${tdh}</div>`;
          if (tdOpen.length) tdInfo = TX.open.replace('{n}', tdOpen.length);
          sph = this._sonderBtns(snapX, pid, tStr); if (sph) sph = `<div class="bg one">${sph}</div>`;
        }
        const awL = away ? this._awayLook(snapX, k.name, dStr) : null;
        const body = away ? `<div class="vc"><ha-icon icon="${awL.icon}"></ha-icon><span>${awL.text}</span></div>`
          : (sec(TX.school, withNow(school, isT, evRow)) + sec(TX.events, withNow(evs, isT, evRow)) + sec(TX.chores, chores, chInfo, chRight) + sec(TX.todos, tdh, tdInfo) + sec(TX.spcH, sph)) || this._noneBox(k, dSel, evWho);
        const petBits = window.FPPET ? window.FPPET.headBits(snapX, pidOf[k.name]) : ['', ''];
        return `<div class="tcol${isBday ? ' bday' : ''}" style="--pc:${k.farbe}"><div class="lab th${petBits[1] ? ' fphas' : ''}" data-person="${esc(k.name)}">
          <div class="ring${frames[k.name] ? ' fr-' + frames[k.name] : ''}" style="width:64px;height:64px"><span class="ava">${avatarHtml(k, 64)}</span>${isBday && seX.anim_bday !== false ? BDAY_FX(Number((seX.bday_anim || {})[pidOf[k.name]]) || 0) : ''}${String(k.bild || '').startsWith('av2:') && window.FPAV ? window.FPAV.outer(k.bild) + (window.FPAVS ? window.FPAVS.outer(k.name) : '') : ''}${petBits[0]}</div>${petBits[1]}
          <div class="lt"><div class="nm">${esc(k.name)}${isBday ? ` <span class="x2" title="${TX.x2}">🎂 x2</span>` : ''}</div>${this._lvCap(k.name, lv.c, st.pct, TX.rel)}${this._awBadge(snapX, pidOf[k.name])}<div class="lv2">${aw.slice(0, 4).map((a) => `<span class="md" style="--mc:${a.c}" title="${esc(a.t)}"><ha-icon icon="${a.icon}"></ha-icon></span>`).join('')}</div></div></div>
          <div class="tbody">${body}</div></div>`;
      });
      todayGrid = `<div class="tgrid" style="grid-template-columns:${phone ? '1fr' : `repeat(auto-fit,minmax(min(100%,150px),1fr))`}">${cols.join('')}</div>`;
    }

    this.shadowRoot.innerHTML = `<style>${window.FPPET ? window.FPPET.CARD_CSS : ''}${window.FPPETS ? window.FPPETS.P4.CSS : ''}
      :host{display:block}
      .card{position:relative;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:14px 16px;color:#ececec;font-family:${FONT}}
      .top{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
      .clock{font-size:38px;font-weight:200;color:${G};line-height:1;font-variant-numeric:tabular-nums}
      .date{font-size:24px;font-weight:300}.date b{font-weight:600}
      .sub{font-size:12px;color:#7a7a7a;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px}
      .nav{margin-left:auto;display:flex;align-items:center;gap:8px}.tdg{display:flex;gap:6px}
      .top{flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px}.top::-webkit-scrollbar{display:none}
      .top > *{flex:none}.seg button{white-space:nowrap}.card.phone .top{gap:8px}.card.phone .seg button{padding:0 10px}
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
      .hd{padding:4px 10px 6px;font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:1px}
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
      .lgt{font-size:11px;color:#8f8f8f;text-transform:uppercase;letter-spacing:1px}
      .tnav{display:flex;gap:6px;margin-left:auto}.tnav + .seg{margin-left:0}
      .seg{display:flex;background:#232323;border-radius:10px;padding:3px;gap:2px;margin-left:auto}.seg + .leg{margin-left:0}
      .seg button{background:transparent;border:none;color:#999;font:inherit;font-size:13px;padding:0 13px;height:36px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}.seg button.on{background:#3a3a3a;color:#fff;font-weight:600}
      .ev.one{display:flex;align-items:center;gap:6px;white-space:nowrap}.ev.one .et{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:block}
      .ev.one .tm{flex:none;color:#9a9a9a;font-size:.9em;font-variant-numeric:tabular-nums}.ev.one .src{flex:none;margin:0}
      .pev.mid .ev.one{white-space:nowrap;gap:4px}.pev.mid .ev.one .tm{font-size:10px}
      /* today columns: event title on its own line(s), time and badge below – nothing important gets cut */
      .tcol .ev.one{flex-wrap:wrap;white-space:normal;row-gap:1px}.tcol .ev.one .et{flex:1 1 100%;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:break-word}
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
      .nm{font-size:15px;font-weight:600;line-height:1.2;overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
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
      .btn.done .bx{color:#a7dc93}
      .btn .tag{display:inline-block;font-style:normal;font-size:11px;font-weight:700;letter-spacing:.3px;padding:1px 6px;border-radius:7px;margin-right:6px;vertical-align:1px}
      .btn.spc{border-color:rgba(245,197,66,.65);background:rgba(245,197,66,.08)}.btn.spc .tag{background:rgba(245,197,66,.2);color:#F5C542}
      .btn.tdo{border:1px dashed rgba(79,163,224,.7);background:rgba(79,163,224,.07)}.btn.tdo .tag{background:rgba(79,163,224,.2);color:#4FA3E0}.btn.tdo .cb{border-radius:6px}
      .btn.tdo.arm{border-style:solid;border-color:#4FA3E0;background:rgba(79,163,224,.18)}
      .tdn2{font-size:11px;font-weight:700;color:#4FA3E0;margin-top:4px}.pl.spl{color:#F5C542}
      .btn.pop .cb{animation:fpcheck .5s cubic-bezier(.3,1.6,.5,1)}.btn.pop .cb::before{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid ${G};animation:fpring .6s ease-out forwards}
      @keyframes fpcheck{0%{transform:scale(.55)}60%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes fpring{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.3);opacity:0}}
      @media (prefers-reduced-motion:reduce){.btn.pop .cb,.btn.pop .cb::before{animation:none}}
      .due{color:#E0A84F;border:1px solid rgba(224,168,79,.6);line-height:15px;border-radius:8px;padding:1px 6px;margin-left:6px;white-space:nowrap;display:inline-block}
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
      .prog{font-size:12px;font-weight:600;color:#a3a3a3;margin-bottom:4px;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.8px}.gr{color:${G};font-weight:600}
      .free{display:flex;align-items:center;gap:8px;color:#8a8a8a;font-size:14px;padding:6px 2px}.free ha-icon{color:${G}}
      .vc{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;min-height:40px;color:#4FA3E0;font-size:13px;font-weight:600;background:rgba(79,163,224,.08);border-radius:8px}.vc ha-icon{--mdc-icon-size:20px}
      .big{font-size:18px;font-weight:300;line-height:1.1}.big small{font-size:13px;color:#8a8a8a}
      .bar{height:4px;border-radius:2px;background:#3a3a3a;margin:7px 0 6px;overflow:hidden}.bar i{display:block;height:100%}
      .miss{font-size:11px;color:#d98080;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ok{font-size:11px;color:${G};display:flex;align-items:center;gap:4px}.ok ha-icon{--mdc-icon-size:14px}
      .pl{font-size:12px;color:#7a7a7a;line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pl::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#555;margin-right:6px;vertical-align:middle}
      .none{font-size:13px;color:#555}.none2{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--pc,#69C350) 10%,transparent);color:var(--fp-text2,#aaa)}.none2 ha-icon{--mdc-icon-size:26px;color:var(--pc,#69C350);flex:none;animation:fpnb 3s ease-in-out infinite}@keyframes fpnb{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.none2 b{display:block;font-size:14px;color:var(--fp-text,#eee)}.none2 small{display:block;font-size:12px;margin-top:2px}@media (prefers-reduced-motion:reduce){.none2 ha-icon{animation:none}}
      .ev{font-size:12px;line-height:1.3;padding:4px 6px 4px 7px;border-left:3px solid;background:#303030;border-radius:0 6px 6px 0;margin-top:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .ev:first-child{margin-top:0}.ev b{font-weight:600;color:#aaa;margin-right:5px}
      .more{font-size:11px;color:#777;margin-top:4px}
      .emptyk{grid-column:1/-1;color:#7a7a7a;padding:20px;text-align:center}
      .seg.vw{margin-left:0}.seg.vw + .seg{margin-left:auto}
      .tgrid{display:grid;gap:8px;align-items:start}.tcol{background:#232323;border-radius:12px;min-width:0;box-shadow:inset 0 3px 0 var(--pc,#555);overflow:hidden}
      .tcol .lab.th{background:transparent;padding:12px 10px 8px;position:relative;overflow:visible}
      .lab.th .cap{display:inline-flex;align-items:stretch;margin:6px 0 2px;border-radius:999px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.08);font:800 12px/1 system-ui,sans-serif;max-width:100%}
      .lab.th .cap>*{display:flex;align-items:center;gap:5px;padding:5px 10px 5px 7px;color:#141414;white-space:nowrap;border:0;font:inherit;cursor:default}
      .lab.th .cap i{font-style:normal;width:17px;height:17px;border-radius:50%;background:rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;font-size:10.5px;color:#fff}
      .lab.th .cap .rel{background:linear-gradient(180deg,color-mix(in srgb,var(--rc) 82%,white),var(--rc))}
      .lab.th .cap .lvl{cursor:pointer;background:linear-gradient(180deg,color-mix(in srgb,var(--lc) 78%,white),var(--lc));border-left:1px solid rgba(0,0,0,.25)}.lab.th .cap .lvl small{font:700 10px system-ui,sans-serif;opacity:.75}
      .lab.th .cap .lvl.glow{animation:fplvglow 1.6s ease-in-out infinite}.tcol.nar .lab.th .cap .lvl small{display:none}
      .lab.th .flg{position:absolute;top:-1px;right:24px;width:42px;padding:7px 0 15px;background:var(--rc);color:#141414;font-size:13px;font-weight:800;text-align:center;letter-spacing:.2px;clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%);z-index:2}
      .lab.th .nm{padding-right:50px}.tcol.nar .lab.th{flex-direction:column;align-items:flex-start;gap:6px}.tcol.nar .btn{padding:6px 7px;gap:6px;font-size:12.5px}.tcol.nar .btn .cb{width:19px;height:19px}.tcol.nar .btn.done .cb::after{left:5px;top:1px}.tcol.nar .vcard{grid-template-columns:24px minmax(0,1fr);padding:8px;gap:6px}.tcol.nar .vcard .vi{font-size:18px}.tcol.nar .lab.th .lt{width:100%}.tcol.nar .lab.th .nm{padding-right:0}.lab.th .lv2:empty{display:none}
      .card.phone .lab.th .flg{right:12px;width:36px;font-size:11px;padding:5px 0 12px}.card.phone .tcol .lab.th{flex-direction:row;align-items:center;gap:12px;padding:10px 12px 8px}.card.phone .tcol .lab.th .lt{flex:1;min-width:0}.card.phone .lab.th .nm{padding-right:46px}.tbody{padding:0 8px 10px;display:flex;flex-direction:column;gap:8px}
      .tsec{display:flex;flex-direction:column;gap:4px}.tsh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:12px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:.9px;margin:4px 2px 0;white-space:nowrap}.tsh > span:first-child{overflow:hidden;text-overflow:ellipsis}
      .bg.one{grid-template-columns:minmax(0,1fr)}

      .tdmore{background:none;border:1px dashed #3a3a3a;color:#999;border-radius:10px;font:inherit;font-size:12px;padding:6px 10px;cursor:pointer;text-align:left}
      .bin{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;align-self:stretch;justify-content:space-between}
      .bin .bx{white-space:normal;overflow:visible;display:block;overflow-wrap:break-word;word-break:normal;hyphens:manual;line-height:1.28;max-width:100%}
      .bin .b2{display:flex;align-items:center;gap:4px;min-width:0}.bin .bm{display:flex;flex-wrap:wrap;gap:3px 4px;min-width:0;flex:1 1 auto}
      .bin .br{display:flex;align-items:center;gap:4px;margin:0 0 0 auto;flex:none}.bin .ptr{display:inline-flex;align-items:center;height:22px;line-height:22px;border-radius:11px;padding:0 8px 0 5px;font-size:11.5px;box-sizing:border-box}.bin .ptr .fpcoin{margin:0 2px 0 0}
      .btn > .cb{display:none}.btn{padding:7px 9px}
      .stt{display:none;width:22px;height:22px;border-radius:50%;background:#5BBF4A;box-sizing:border-box;flex:none;position:relative}
      .btn.done .stt{display:inline-block}.btn.done .stt::after{content:'';position:absolute;left:8px;top:4.5px;width:5px;height:9px;border:solid #102a0c;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
      .btn.arm .stt{display:inline-block;background:#E0A84F}
      .bin .bm .tag,.bin .bm .due,.bin .bm .age{font-size:10.5px;line-height:16px;padding:0 6px}
      .bl{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;min-width:0;flex:1 1 auto}.br{display:flex;flex-wrap:wrap;align-items:center;gap:4px 5px;justify-content:flex-end;flex:0 1 auto;min-width:0;margin-left:auto}
      .bx{white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis}
      .c .bg:not(.one) .bin.two .tag .tl,.c .spw .bin.two .tag .tl{display:none}.btn .tag{max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}
      .btn .tag,.due,.age,.ptr{display:inline-block;margin:0;font-style:normal;font-size:11px;font-weight:700;line-height:17px;padding:0 8px;border-radius:9px;white-space:nowrap;letter-spacing:.2px}
      .age{color:#aab2bf;border:1px solid #4a505c;line-height:15px;font-weight:600}
      .ptr{background:rgba(245,197,66,.18);color:#F5C542}.ptr .fpcoin{margin:0 3px 0 -5px}.btn.done .ptr,.btn.done .tag,.btn.done .age{opacity:.6}
      .btn.spc2{border-color:rgba(245,197,66,.55)}.btn.spc2 .tag{color:#F5C542;background:rgba(245,197,66,.18)}
      .spw{display:flex;gap:6px;align-items:stretch;min-width:0}.spw > .btn{flex:1;min-width:0}.spw .br{flex:0 1 auto;min-width:0}.tcol .spw .rvb{min-width:40px;width:40px;padding:0}.tcol .spw .rvb svg{width:22px;height:16px}.tcol.nar .spw{flex-direction:column}.tcol.nar .spw .rvb{width:auto;height:34px}
      .rvb.on{background:rgba(245,197,66,.18);border-color:#F5C542}.rvb{flex:none;display:flex;align-items:center;justify-content:center;min-width:56px;border:1px solid #444;background:transparent;border-radius:10px;padding:6px 12px;cursor:pointer}.rvb svg{display:block}.rvb.y{border-color:#F5C542;background:#F5C542}
      /* secret chore: one tile with one border, split by a line – chore left (tap = done), eye right (tap = show) */
      .spw{gap:0;border:1px solid rgba(245,197,66,.55);border-radius:10px;overflow:hidden}.spw:has(> .btn.done){border-color:rgba(91,191,74,.6)}
      .spw > .btn,.spw > .btn.spc2{border:none;border-radius:0}.tcol.nar .spw{flex-direction:row}
      .spw > .rvb,.tcol .spw > .rvb,.tcol.nar .spw > .rvb,.c .spw > .rvb{border:none;border-left:1px solid rgba(245,197,66,.4);border-radius:0;width:46px;min-width:46px;height:auto;padding:0;background:rgba(245,197,66,.06)}.spw > .rvb svg{width:27px;height:20px}
      .spw > .rvb.on{background:rgba(245,197,66,.2)}
      .ptp{display:inline-block;margin-left:6px;padding:0 7px;border-radius:9px;background:rgba(245,197,66,.16);color:#F5C542;font-size:11px;font-weight:700;line-height:17px;vertical-align:middle;white-space:nowrap;font-style:normal}.done .ptp{opacity:.6}
      .lab.vol{background:linear-gradient(135deg,rgba(245,197,66,.16),#232323 70%)}.ring.vr{display:flex;align-items:center;justify-content:center;border-radius:50%;background:#2b2b2b;font-size:30px;box-shadow:0 0 0 2px rgba(245,197,66,.55)}
      .vs2{font-size:11px;font-weight:400;color:#8a8a8a}.rvx{display:inline-block;animation:fprvx 5s ease-out both;background:linear-gradient(100deg,currentColor 40%,#FFE27A 50%,currentColor 60%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}@keyframes fprvx{0%{opacity:0;filter:blur(8px);transform:scale(.5) rotate(-6deg);background-position:100% 0}12%{opacity:1;filter:blur(0);transform:scale(1.15) rotate(2deg)}20%{transform:scale(1) rotate(0)}40%{background-position:0 0}86%{opacity:1;filter:blur(0)}100%{opacity:.25;filter:blur(4px)}}@media (prefers-reduced-motion:reduce){.rvx{animation:none}}.vl1{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .vcard{display:grid;grid-template-columns:32px minmax(0,1fr);align-items:center;gap:8px 8px;padding:10px;border-radius:10px;background:#2b2b2b;border:1px solid rgba(245,197,66,.4);animation:fpvin .5s ease-out}
      .vcard .vi{font-size:22px;text-align:center;align-self:start}.vcard .vt{min-width:0;font-size:13px;line-height:1.3;overflow-wrap:break-word}.vcard > .ptr{grid-column:2;justify-self:start}
      .vcard .vbtn,.vcard .vpick{grid-column:1 / -1}.vbtn{display:flex;gap:8px}.vbtn .take{flex:1 1 auto;max-width:200px;height:40px;animation:fppul 2.4s ease-in-out infinite}
      .c.vc2{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-content:flex-start;align-items:flex-start}.c.vc2 .vcard{flex:1 1 240px;max-width:340px}
      .c .bg:not(.one) > .spw{grid-column:span 2}.c .spw .btn .bin{min-width:0}.c .spw .rvb{width:36px;min-width:36px;height:auto;padding:0}.c .spw .rvb svg{width:22px;height:16px}.vbtn .rvb{width:52px;height:40px;min-width:52px;padding:0}.vcard .vt small{display:block;color:#F5C542;font-size:11px;margin-top:2px}
      .take{border:none;border-radius:10px;padding:8px 12px;background:#F5C542;color:#141414;font:inherit;font-size:13px;font-weight:700;cursor:pointer;animation:fpwig 2.4s ease-in-out infinite}
      .vpick{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:12px;background:#232323;animation:fpvin .25s ease-out}.vq{font-size:13px;font-weight:600;color:#ddd}
      .vps{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px}
      .vp{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:92px;padding:8px 4px;border:2px solid var(--c,#555);border-radius:14px;background:color-mix(in srgb,var(--c,#555) 16%,#262626);color:#eee;font:inherit;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .vp:active{transform:scale(.95)}.vp b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
      .vx{align-self:flex-end;border:0;background:none;color:#999;font:inherit;font-size:13px;padding:6px 8px;cursor:pointer;text-decoration:underline}
      .who{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.who span{font-size:12px;color:#aaa;margin-right:4px}
      .wp{display:flex;align-items:center;gap:6px;border:1px solid var(--c,#444);background:#232323;color:inherit;border-radius:18px;padding:2px 10px 2px 2px;font:inherit;font-size:13px;cursor:pointer}.wp.x{padding:4px 10px;border-color:#444;color:#999}
      @keyframes fpvin{from{transform:translateY(-6px);opacity:0}to{transform:none;opacity:1}}
      @keyframes fppul{0%,80%,100%{transform:none}88%{transform:scale(1.04)}}@keyframes fpwig{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(-4deg)}95%{transform:rotate(4deg)}}
      .x2{font-size:11px;font-weight:700;color:#FF7AB6;margin-left:4px;white-space:nowrap}
      .awb{display:inline-block;max-width:100%;box-sizing:border-box;margin:3px 0 2px;padding:1px 8px;border-radius:10px;font-size:11px;line-height:1.3;background:#2b2b2b;border:1px dashed #555;color:#bbb}.awb.now{border-style:solid;border-color:#4FA3E0;color:#cfe6fa;background:rgba(79,163,224,.14)}
      .lab.bday{position:relative;overflow:visible;background:linear-gradient(120deg,rgba(255,122,182,.22),rgba(255,216,77,.18),rgba(92,225,230,.18),rgba(176,124,255,.22));background-size:300% 300%;animation:fpbdg 6s ease-in-out infinite}
      .lab.bday .ring,.lab.bday .lt{position:relative;z-index:2}
      .tcol.bday{background:linear-gradient(160deg,rgba(255,122,182,.20),rgba(255,216,77,.14),rgba(92,225,230,.14),rgba(176,124,255,.20));background-size:300% 300%;animation:fpbdg 6s ease-in-out infinite}.tcol.bday .lab.th{animation:none;background:transparent}
      @keyframes fpbdg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
      .bdx{position:absolute;left:50%;top:50%;width:0;height:0;z-index:1;pointer-events:none}
      .bdx i{position:absolute;left:0;top:0;display:block}
      .bdx .cf{width:6px;height:10px;border-radius:2px;background:var(--c);animation:fpcf 1.6s ease-out infinite}
      @keyframes fpcf{0%{transform:rotate(var(--a)) translateY(0) scale(.4);opacity:1}80%{opacity:1}100%{transform:rotate(var(--a)) translateY(-64px) rotate(240deg) scale(1);opacity:0}}
      .bdx .bl{width:18px;height:22px;border-radius:50% 50% 46% 46%;background:var(--c);margin:-11px 0 0 -9px;animation:fpbl 4.2s ease-in infinite}
      .bdx .bl::after{content:"";position:absolute;left:8px;top:22px;width:1px;height:16px;background:rgba(255,255,255,.6)}
      @keyframes fpbl{0%{transform:translate(0,10px) scale(.3);opacity:0}15%{opacity:1}100%{transform:translate(var(--x),-80px) scale(1);opacity:0}}
      .bdx .bu{width:var(--s);height:var(--s);border-radius:50%;border:1.5px solid rgba(160,220,255,.9);background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.8),rgba(160,220,255,.15) 40%,transparent 70%);margin:calc(var(--s) / -2) 0 0 calc(var(--s) / -2);animation:fpbu 3.4s ease-out infinite}
      @keyframes fpbu{0%{transform:translate(0,0) scale(.2);opacity:0}15%{opacity:1}100%{transform:translate(var(--x),-70px) scale(1.2);opacity:0}}
      .bdx .rd{width:88px;height:88px;margin:-44px 0 0 -44px;border-radius:50%;background:conic-gradient(#FF5A5A,#FFB23D,#FFE94D,#55D16B,#4AA8FF,#8F6BFF,#FF5A5A);-webkit-mask:radial-gradient(circle,transparent 33px,#000 34px,#000 38px,transparent 39px,transparent 40px,#000 41px,#000 43px,transparent 44px);mask:radial-gradient(circle,transparent 33px,#000 34px,#000 38px,transparent 39px,transparent 40px,#000 41px,#000 43px,transparent 44px);animation:fpspin 3s linear infinite;opacity:.85}
      .bdx .rd.r2{width:104px;height:104px;margin:-52px 0 0 -52px;background:repeating-conic-gradient(rgba(255,255,255,.18) 0 8deg,transparent 8deg 24deg);-webkit-mask:none;mask:none;animation-duration:9s;animation-direction:reverse}
      .bdx .st{color:#FFD84D;font-size:14px;font-style:normal;margin:-8px 0 0 -5px;text-shadow:0 0 6px rgba(255,216,77,.8);animation:fpst 2.1s ease-out infinite}
      @keyframes fpst{0%{transform:rotate(var(--a)) translateY(0) scale(.3);opacity:0}20%{opacity:1}100%{transform:rotate(var(--a)) translateY(-70px) scale(1.1);opacity:0}}
      @media (prefers-reduced-motion:reduce){.bdx,.take,.lab.bday{animation:none}.bdx i{animation:none;opacity:0}}
      .err{color:#E06B6B;font-size:12px;margin-top:10px}
      .nb.volb{background:#F5C542;color:#3a2a00;border-color:#F5C542;font-weight:600;gap:6px;padding:0 12px;transform-origin:50% 90%;animation:fpwig 3.2s ease-in-out infinite,fpglow 3.2s ease-in-out infinite}.nb.volb .vh{font-size:18px;line-height:1}.nb.volb .tdn{background:#3a2a00;color:#F5C542}
      @keyframes fpwig{0%,76%,100%{transform:rotate(0)}80%{transform:rotate(-2.5deg)}84%{transform:rotate(2deg)}88%{transform:rotate(-1deg)}92%{transform:rotate(0)}}
      @keyframes fpglow{0%,60%,100%{box-shadow:0 0 0 0 rgba(245,197,66,0)}78%{box-shadow:0 0 0 4px rgba(245,197,66,.25)}92%{box-shadow:0 0 0 8px rgba(245,197,66,0)}}
      .vpop{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:fpvin .25s ease-out}
      .vbox{background:#232323;border:1px solid rgba(245,197,66,.5);border-radius:16px;padding:14px;width:min(560px,100%);max-height:calc(100% - 32px);overflow:auto;box-sizing:border-box}
      .vhd{display:flex;align-items:center;gap:8px;margin-bottom:12px}.vhd .vh{font-size:26px}.vhd b{font-size:18px;color:#F5C542}.vhd .vs2{flex:1;color:#aaa;font-size:13px}.vcl{width:40px;height:40px;border-radius:50%;border:none;background:#333;color:#ddd;font-size:16px;cursor:pointer}
      .vlist{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;align-items:start}.vlist .vcard{align-content:start}
      .vcard.vsplit{display:flex;padding:0;gap:0;align-items:stretch;overflow:hidden}.vcard.vsplit .vmain{flex:1;min-width:0;display:grid;grid-template-columns:32px minmax(0,1fr);align-items:center;gap:8px;padding:10px}.vcard.vsplit .vmain .vbtn,.vcard.vsplit .vmain .vpick{grid-column:1 / -1}.vcard.vsplit .vmain > .ptr{grid-column:2;justify-self:start}
      .vcard.vsplit > .rvb{flex:none;width:46px;min-width:46px;height:auto;padding:0;border:none;border-left:1px solid rgba(245,197,66,.4);border-radius:0;background:rgba(245,197,66,.06)}.vcard.vsplit > .rvb.on{background:rgba(245,197,66,.2)}.vcard.vsplit > .rvb svg{width:27px;height:20px}
      @media (prefers-reduced-motion:reduce){.nb.volb{animation:none}}
    </style>
    <div class="card${phone ? ' phone' : ''}">
      <div class="top">
        <div class="seg vw">${[['today', TX.today], ['week', TX.week]].map(([v, l]) => `<button class="${viewNow === v ? 'on' : ''}" data-view="${v}">${l}</button>`).join('')}</div>
        <div class="seg">${[['alle', 'Alles'], ['aemtli', 'Ämtli'], ['extra', 'Extras'], ['termine', 'Termine'], ['schule', 'Stundenplan']].filter(([v]) => v !== 'schule' || Object.keys(this._cfg.schule || {}).length).map(([v, l]) => `<button class="${(this._mode || 'alle') === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        ${volCount ? `<button class="nb volb" data-volopen title="${TX.vol}" aria-label="${TX.vol}"><span class="vh">🙋</span>${phone ? '' : TX.vol}<b class="tdn">${volCount}</b></button>` : ''}
        ${this._cfg.todos_knopf ? `<div class="tdg"><button class="nb" data-todoadd title="To-dos" aria-label="To-dos"><ha-icon icon="mdi:checkbox-marked-circle-outline"></ha-icon></button></div>` : ''}
        <div class="nav">
          ${(phone || viewNow === 'today' ? (this._dayOff || 0) !== 0 : this._week !== 0) ? `<button class="nb g" data-nav="0">Heute</button>` : ''}
          ${cals.length && !phone ? `<button class="nb${this._syncing ? ' spin2' : ''}" data-sync title="Kalender synchronisieren"><ha-icon icon="mdi:calendar-sync-outline"></ha-icon></button>` : ''}
          <button class="nb" data-nav="-1"><ha-icon icon="mdi:chevron-left"></ha-icon></button>
          ${phone || viewNow === 'today' ? (() => { const dd = addDays(today, this._dayOff || 0); return `<div class="dd"><b>${ymd(dd) === tStr ? 'Heute' : WDL[isoWd(dd) - 1]}</b>${dd.getDate()}. ${MON[dd.getMonth()]}</div>`; })()
            : `<div class="wk"><b>KW ${isoWeek(ws)}</b>${ws.getDate()}. ${ws.getMonth() !== we.getMonth() ? MON[ws.getMonth()].slice(0, 3) + '. ' : ''}– ${we.getDate()}. ${MON[we.getMonth()]}</div>`}
          <button class="nb" data-nav="1"><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        </div>
      </div>
      ${this._volOpen && volCount ? `<div class="vpop" data-volclose><div class="vbox" role="dialog" aria-label="${TX.vol}"><div class="vhd"><span class="vh">🙋</span><b>${TX.vol}</b><span class="vs2">${TX.volSub}</span><button class="vcl" data-volclose aria-label="${TX.cancel}">✕</button></div><div class="vlist">${volHtml}</div></div></div>` : ''}
      ${todayGrid || `<div class="grid">${head}${(!cals.length || cals.some((c) => !c.person)) ? termine : ''}${rows}${volRow}${empty}</div>`}
      ${this._err ? `<div class="err">${esc(this._err)}</div>` : ''}
      ${this._detail ? this._detailHtml(kids, pre, awards, frames) : ''}
    </div>`;
    this._fit();
  }
}

// Navigation zwischen den Familienplaner-Seiten (funktioniert auch im Kiosk-Modus ohne HA-Kopfzeile)
// soft fade-in when a page or view appears (skipped with "reduce motion")
const fadeIn = (el) => {
  try {
    if (!el || !el.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  } catch (e) { /* ignore */ }
};
const fpNavigate = (p) => {
  const parts = location.pathname.split('/').filter(Boolean);
  // a dashboard without this view (e.g. made before statistics/pets existed): the nav card shows the page right here, below
  // itself – the dashboard is never left (kiosk mode, iPad guided access)
  const views = window.__fpViews;
  if (views && !views.has(p)) {
    const key = Object.entries(window.__fpPaths || {}).find(([, v]) => v === p);
    window.dispatchEvent(new CustomEvent('fp-inline-page', { detail: { key: key ? key[0] : p } })); return;
  }
  history.pushState(null, '', `/${parts[0] || 'family-planer'}/${p}${location.search}`);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
};
window.FP = { AWT, AWR, AWCSS, avatarGen, FpBase, avatarHtml, parseDesc, planZ, esc, WD, G, FONT, isoWeek, weekIdx, planActive, AV_TYPES, PALETTE, fpNavigate, fadeIn, startOfDay, ymd };
if (!customElements.get('lox-wochenplaner-card')) customElements.define('lox-wochenplaner-card', LoxWochenplanerCard);
