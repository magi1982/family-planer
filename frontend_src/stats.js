// ---------------------------------------------------------------------------
// Statistics page: the family first (who did what, awards), then one page per person (reliability as 10 dots,
// 7 days as blocks, 12 weeks as coloured dots, what I did, where my points come from, my awards)
// rendered inside custom:family-planer-card (view: stats); data from the websocket command family_planer/stats
// ---------------------------------------------------------------------------
(() => {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLOR = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#69C350');
  const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? '' : o[k]));
  const MC = ['#69C350', '#C6D94B', '#F2A541', '#E0584F'];  // day dots: all done, 1, 2, 3+ forgotten
  const TYPE_C = { chore: '#69C350', sonder: '#F2A541', todo: '#A88BFA' };
  const SRC_C = { chore: '#69C350', sonder: '#F2A541', todo: '#A88BFA', bonus: '#F5C542', streak: '#FF8A5B', award: '#4FA3E0', level: '#3FBF9B', adjust: '#E88BC4', reward: '#F08A80' };
  const TXT = {
    de: { title: 'Statistik', fam: 'Familie', back: 'Familie', per: { w: 'Woche', m: 'Monat', q: '3 Monate' },
      choresDone: 'Ämtli geschafft', ofTen: '{n} von 10 erledigt', vol: 'Freiwillige Ämtli', volSub: 'ohne Auftrag erledigt', todos: 'To-dos abgehakt', todosSub: 'aus Listen und Aufgaben',
      allDone: 'Alle alles geschafft', allDoneN: '{n} Tage', record: 'Rekord: {n} Tage', who: 'Wer hat was gemacht?', total: '{n} total',
      types: { chore: 'Ämtli', sonder: 'Freiwillige Ämtli', todo: 'To-dos' }, matrix: 'Welche Ämtli – wer wie oft?', matrixSub: 'je grösser der Kreis, desto öfter', sum: 'Total',
      awards: 'Pokale & Auszeichnungen', awPeriod: 'in diesem Zeitraum', awAll: 'insgesamt', noAw: 'Noch keine – weiter so!',
      you: 'Und jetzt du!', youSub: 'Tipp auf deine Karte für deine ganze Statistik', rel: 'Zuverlässigkeit', tenOf: '{n} von 10', streakTxt: '{n} Tage am Stück alles geschafft',
      leg: ['alles', '1 vergessen', '2', '3+', 'frei'], legLong: ['alles geschafft', '1 vergessen', '2 vergessen', '3 oder mehr', 'frei'],
      heroT: '{name} schafft {n} von 10 Ämtli', heroNone: 'Noch keine Ämtli in diesem Zeitraum', detail: 'Von {t} Ämtli hast du {d} erledigt.',
      praise: ['Jeder Tag ist eine neue Chance.', 'Gut gemacht – da geht noch was!', 'Super zuverlässig!', 'Perfekt! Wirklich alles geschafft.'],
      trend: { 1: 'Besser als im Zeitraum davor', 0: 'Gleich gut wie im Zeitraum davor', '-1': 'Etwas weniger als im Zeitraum davor' },
      tDone: 'Ämtli erledigt', tDoneSub: 'von {n} Ämtli', tVol: 'Freiwillig geholfen', tVolSub: 'Ämtli ohne Auftrag', tTodo: 'To-dos abgehakt', tTodoSub: 'aus Listen und Aufgaben',
      tOn: 'Rechtzeitig fertig', tOnSub: 'bis {t} Uhr erledigt', tStreak: 'Tage am Stück', tBest: 'Rekord: {n} Tage', tPts: 'Münzen gesammelt', tPtsSub: 'für Belohnungen',
      week7: 'Meine letzten 7 Tage', block: '1 Klotz = 1 Ämtli', done: 'erledigt', open: 'offen / nicht geschafft', star: 'alles geschafft',
      weeks12: 'Meine letzten 12 Wochen', dot: 'Jeder Punkt ist ein Tag', fullDays: 'An {n} Tagen hast du alles geschafft!',
      did: 'Was ich gemacht habe', things: '{n} Sachen erledigt', nothing: 'Noch nichts',
      pts: 'Woher meine Münzen kommen', ptsHead: '{e} verdient · {s} eingelöst', earned: 'Münzen verdient', spent: 'Für Belohnungen eingelöst', saving: 'noch nichts eingelöst – du sparst!',
      src: { chore: ['Ämtli', 'deine normalen Ämtli'], sonder: ['Freiwillige Ämtli', 'Sonderämtli, die du gemacht hast'], todo: ['To-dos', 'abgehakte Aufgaben'], bonus: ['Tagesbonus', 'an Tagen mit allem geschafft'],
        streak: ['Serien-Bonus', 'für viele Tage am Stück'], award: ['Auszeichnungen', 'Pokale und Auszeichnungen'], level: ['Level-Bonus', 'für ein neues Level'], adjust: ['Extra von Mama/Papa', 'Bonus von den Eltern'] },
      last: 'Letzte Münzen', today: 'heute', yday: 'gestern', myAw: 'Meine Auszeichnungen', practice: 'Da üben wir noch', missed: '{n}× vergessen', tip: 'Tipp: Erinnerung im Planer einschalten',
      when: 'Wann ich helfe', tod: ['Morgen', 'Nachmittag', 'Abend'], todTxt: ['Du bist ein Morgen-Mensch!', 'Du hilfst am liebsten nach der Schule!', 'Du bist ein Abend-Helfer!'],
      load: 'Statistik wird geladen …', err: 'Statistik konnte nicht geladen werden.', planner: 'Planer', wd: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] },
    en: { title: 'Statistics', fam: 'Family', back: 'Family', per: { w: 'Week', m: 'Month', q: '3 months' },
      choresDone: 'Chores done', ofTen: '{n} of 10 done', vol: 'Volunteer chores', volSub: 'done without being asked', todos: 'To-dos ticked off', todosSub: 'from lists and tasks',
      allDone: 'Everyone did everything', allDoneN: '{n} days', record: 'Record: {n} days', who: 'Who did what?', total: '{n} total',
      types: { chore: 'Chores', sonder: 'Volunteer chores', todo: 'To-dos' }, matrix: 'Which chores – who how often?', matrixSub: 'the bigger the circle, the more often', sum: 'Total',
      awards: 'Trophies & awards', awPeriod: 'in this period', awAll: 'all time', noAw: 'None yet – keep going!',
      you: 'And now you!', youSub: 'Tap your card for your full statistics', rel: 'Reliability', tenOf: '{n} of 10', streakTxt: '{n} days in a row all done',
      leg: ['all', '1 forgotten', '2', '3+', 'free'], legLong: ['all done', '1 forgotten', '2 forgotten', '3 or more', 'free'],
      heroT: '{name} does {n} of 10 chores', heroNone: 'No chores in this period yet', detail: 'You did {d} of {t} chores.',
      praise: ['Every day is a new chance.', 'Well done – there is more in you!', 'Super reliable!', 'Perfect! Really everything done.'],
      trend: { 1: 'Better than the period before', 0: 'As good as the period before', '-1': 'A little less than the period before' },
      tDone: 'Chores done', tDoneSub: 'of {n} chores', tVol: 'Volunteered', tVolSub: 'chores without being asked', tTodo: 'To-dos ticked off', tTodoSub: 'from lists and tasks',
      tOn: 'Done in time', tOnSub: 'done by {t}', tStreak: 'Days in a row', tBest: 'Record: {n} days', tPts: 'Points collected', tPtsSub: 'for rewards',
      week7: 'My last 7 days', block: '1 block = 1 chore', done: 'done', open: 'open / not done', star: 'all done',
      weeks12: 'My last 12 weeks', dot: 'Every dot is a day', fullDays: 'You did everything on {n} days!',
      did: 'What I did', things: '{n} things done', nothing: 'Nothing yet',
      pts: 'Where my points come from', ptsHead: '{e} earned · {s} redeemed', earned: 'points earned', spent: 'Redeemed for rewards', saving: 'nothing redeemed yet – you are saving!',
      src: { chore: ['Chores', 'your normal chores'], sonder: ['Volunteer chores', 'special chores you did'], todo: ['To-dos', 'ticked-off tasks'], bonus: ['Day bonus', 'on days with everything done'],
        streak: ['Streak bonus', 'for many days in a row'], award: ['Awards', 'trophies and awards'], level: ['Level bonus', 'for a new level'], adjust: ['Extra from Mum/Dad', 'bonus from the parents'] },
      last: 'Latest points', today: 'today', yday: 'yesterday', myAw: 'My awards', practice: 'Still practising', missed: '{n}× forgotten', tip: 'Tip: switch on a reminder in the planner',
      when: 'When I help', tod: ['Morning', 'Afternoon', 'Evening'], todTxt: ['You are a morning person!', 'You like to help after school!', 'You are an evening helper!'],
      load: 'Loading statistics …', err: 'Statistics could not be loaded.', planner: 'Planner', wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  };
  const IMG = /^(av:[a-z0-9.+]+|av2:[a-z0-9.]+|svg:[a-z-]+|img:\/family_planer_files\/avatars\/[a-z0-9_]+\.(jpg|png|webp))$/;
  const av = (p, size) => (window.FPX && window.FPX.avatarHtml
    ? window.FPX.avatarHtml({ name: p.name, farbe: COLOR(p.color), bild: IMG.test(p.image || '') ? p.image : '' }, size)
    : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${COLOR(p.color)};display:inline-block"></span>`);
  const coin = (px) => (window.FPCOIN ? window.FPCOIN.svg(px) : '');
  const STAR = '<svg viewBox="0 0 24 24" width="{s}" height="{s}" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="{c}"/></svg>';
  const star = (s, c) => STAR.replace(/\{s\}/g, s).replace('{c}', c);

  class FpStatsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg; this._lang = cfg.lang === 'en' ? 'en' : 'de'; this.T = TXT[this._lang];
      if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this.shadowRoot.addEventListener('click', (e) => this._click(e)); }
      this._render();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    connectedCallback() { this._load(); }
    disconnectedCallback() { clearTimeout(this._t); }
    // new data arrives often (every tick-off): reload the statistics at most every 15 s
    update() { const now = Date.now(); if (!this._data || now - (this._at || 0) > 15000) this._load(); else { clearTimeout(this._t); this._t = setTimeout(() => this._load(), 15000); } }
    async _load() {
      if (!this._store || this._busy) return;
      this._busy = true; this._at = Date.now();
      try { this._data = await this._store.ws('family_planer/stats', this._per ? { period: this._per } : {}); this._err = null; if (!this._per) this._per = this._data.period; } catch (e) { this._err = e; }
      this._busy = false; this._render();
    }
    _click(e) {
      const t = e.target;
      const pr = t.closest('[data-per]'); if (pr) { if (this._per !== pr.dataset.per) { this._per = pr.dataset.per; this._data = null; this._render(); this._load(); } return; }
      const who = t.closest('[data-who]');
      if (who) { this._who = who.dataset.who || null; this._render(); const fx = window.FPX || window.FPX_EN; if (fx && fx.fadeIn) fx.fadeIn(this.shadowRoot.querySelector('.page')); try { this.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (er) { /* ignore */ } }
    }
    _snap() { return (this._store && this._store.snap) || {}; }
    _awMeta() {
      const fx = (this._lang === 'en' ? window.FPX_EN : window.FPX) || window.FPX || {}; const m = {};
      (fx.AWR || []).forEach(([id, icon, color, title]) => { m[id] = { icon, color, title }; }); return m;
    }
    _render() {
      if (!this.shadowRoot) return;
      const T = this.T; const s = this._snap(); if (window.FPCOIN) window.FPCOIN.config(s);
      const persons = s.persons || [];
      let body;
      if (!this._data) body = `<div class="msg">${esc(this._err ? T.err : T.load)}</div>`;
      else {
        const d = this._data; const byId = Object.fromEntries((d.persons || []).map((p) => [p.id, p]));
        const p = this._who && persons.find((x) => x.id === this._who);
        body = p && byId[p.id] ? this._person(p, byId[p.id], d) : this._family(persons, byId, d);
      }
      const chips = `<div class="bar"><button class="chip${this._who ? '' : ' on'}" data-who="" aria-pressed="${!this._who}"><span class="fi"><ha-icon icon="mdi:account-group"></ha-icon></span>${esc(T.fam)}</button>${persons.map((p) => `<button class="chip${this._who === p.id ? ' on' : ''}" data-who="${esc(p.id)}" aria-pressed="${this._who === p.id}" style="--pc:${COLOR(p.color)}">${av(p, 34)}${esc(p.name)}</button>`).join('')}
        <div class="seg" role="group">${['w', 'm', 'q'].map((k) => `<button class="${(this._per || 'w') === k ? 'on' : ''}" data-per="${k}" aria-pressed="${(this._per || 'w') === k}">${esc(T.per[k])}</button>`).join('')}</div></div>`;
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="card">${chips}<div class="page">${body}</div></div>`;
    }
    // ----------------------------------------------------------------------------------- family
    _family(persons, byId, d) {
      const T = this.T; const st = d.settings || {}; const aw = this._awMeta();
      const tiles = `<div class="tiles4">
        <div class="tile" style="--pc:#69C350"><b style="color:#69C350">${d.done}</b><span>${esc(T.choresDone)}</span>${d.ten != null ? `<small>${esc(fmt(T.ofTen, { n: d.ten }))}</small>` : ''}</div>
        <div class="tile" style="--pc:#F2A541"><b style="color:#F2A541">${d.vol}</b><span>${esc(T.vol)}</span><small>${esc(T.volSub)}</small></div>
        <div class="tile" style="--pc:#A88BFA"><b style="color:#A88BFA">${d.todos}</b><span>${esc(T.todos)}</span><small>${esc(T.todosSub)}</small></div>
        <div class="tile" style="--pc:#FF8A5B"><b style="color:#FF8A5B">${esc(fmt(T.allDoneN, { n: d.all_done }))}</b><span>${esc(T.allDone)}</span><small>${esc(fmt(T.record, { n: d.all_done_best }))}</small></div></div>`;
      const ppl = persons.filter((p) => byId[p.id]);
      const mx = Math.max(1, ...ppl.map((p) => byId[p.id].done + byId[p.id].vol + byId[p.id].todos));
      const seg = (n, c) => (n ? `<span style="width:${(n / mx * 100).toFixed(1)}%;min-width:26px;background:${c}">${n}</span>` : '');
      const who = st.compare === false ? '' : `<section class="sec w5"><h2>${esc(T.who)}</h2>${ppl.map((p) => { const x = byId[p.id]; return `<div class="whorow"><div class="wh">${av(p, 26)}<b>${esc(p.name)}</b><small>${esc(fmt(T.total, { n: x.done + x.vol + x.todos }))}</small></div><div class="stack">${seg(x.done, TYPE_C.chore)}${seg(x.vol, TYPE_C.sonder)}${seg(x.todos, TYPE_C.todo)}</div></div>`; }).join('')}
        <div class="legend">${['chore', 'sonder', 'todo'].map((k) => `<span><i style="background:${TYPE_C[k]}"></i>${esc(T.types[k])}</span>`).join('')}</div></section>`;
      const awRow = (list) => list.map(([id, n]) => { const m = aw[id] || { icon: 'mdi:medal', color: '#E0A84F', title: id }; return `<span class="aw" title="${esc(m.title)}"><span class="md" style="--mc:${COLOR(m.color)}"><ha-icon icon="${esc(m.icon)}"></ha-icon></span><b>${n}×</b><small>${esc(m.title)}</small></span>`; }).join('');
      const awards = `<section class="sec ${st.compare === false ? 'w12' : 'w7'}"><h2>${esc(T.awards)}</h2><div class="awtot"><div><b>${d.awards}</b><small>${esc(T.awPeriod)}</small></div><div><b>${d.awards_all}</b><small>${esc(T.awAll)}</small></div></div>
        ${ppl.map((p) => { const x = byId[p.id]; return `<div class="awp"><div class="wh">${av(p, 26)}<b>${esc(p.name)}</b><small>${x.awards_all.reduce((a, b) => a + b[1], 0)} ${esc(T.awAll)}</small></div><div class="aws">${x.awards.length ? awRow(x.awards) : `<span class="none">${esc(T.noAw)}</span>`}</div></div>`; }).join('')}</section>`;
      const rows = d.rows || {}; const mxn = Math.max(1, ...['chore', 'sonder', 'todo'].flatMap((k) => (rows[k] || []).flatMap(([, v]) => Object.values(v))));
      const cell = (n, c) => (n ? `<span class="ball" style="width:${Math.round(22 + Math.min(1, n / mxn) * 16)}px;height:${Math.round(22 + Math.min(1, n / mxn) * 16)}px;background:${c}">${n}</span>` : '<span class="dash">–</span>');
      const matrix = st.compare === false ? '' : `<section class="sec w12"><div class="hd"><h2>${esc(T.matrix)}</h2><small>${esc(T.matrixSub)}</small></div><div class="tw"><table><thead><tr><th class="l"></th>${ppl.map((p) => `<th>${esc(p.name)}</th>`).join('')}<th>${esc(T.sum)}</th></tr></thead><tbody>
        ${['chore', 'sonder', 'todo'].map((k) => ((rows[k] || []).length ? `<tr class="grp"><td colspan="${ppl.length + 2}" style="color:${TYPE_C[k]}">${esc(T.types[k])}</td></tr>${rows[k].map(([title, v]) => `<tr><td class="l">${esc(k === 'todo' && title === 'Planer' ? T.planner : title)}</td>${ppl.map((p) => `<td>${cell(v[p.id] || 0, TYPE_C[k])}</td>`).join('')}<td class="tot">${Object.values(v).reduce((a, b) => a + b, 0)}</td></tr>`).join('')}` : '')).join('')}
        </tbody></table></div></section>`;
      const cards = `<div class="hd2"><h2>${esc(T.you)}</h2><small>${esc(T.youSub)}</small><span class="legend r">${[0, 1, 2, 3].map((i) => `<span><i class="o" style="background:${MC[i]}"></i>${esc(T.leg[i])}</span>`).join('')}</span></div>
        <div class="cards">${ppl.map((p) => this._pcard(p, byId[p.id])).join('')}</div>`;
      return `${tiles}<div class="grid">${who}${awards}${matrix}</div>${cards}`;
    }
    _praise(ten) { const P = this.T.praise; return ten >= 10 ? P[3] : ten >= 9 ? P[2] : ten >= 7 ? P[1] : P[0]; }
    _dots(ten) { return Array.from({ length: 10 }, (_, i) => `<i class="${i < (ten || 0) ? 'on' : ''}"></i>`).join(''); }
    _days7(x) {
      const T = this.T; const now = new Date();
      return x.week.map(([k, n], i) => { const dd = new Date(now); dd.setDate(now.getDate() - 6 + i); const m = n - k; const today = i === 6;
        const c = !n ? 'var(--fp-bg4,#2c323d)' : (today && m > 0 ? 'var(--fp-bg4,#2c323d)' : MC[Math.min(3, m)]);
        return `<span class="d7"><span class="dd" style="background:${c}">${n && m === 0 ? star(15, '#0f1115') : ''}</span><small>${esc(T.wd[dd.getDay()])}</small></span>`; }).join('');
    }
    _pcard(p, x) {
      const T = this.T;
      return `<button class="pc" data-who="${esc(p.id)}" style="--pc:${COLOR(p.color)}"><div class="pch">${av(p, 56)}<div><b>${esc(p.name)}</b><small>${x.ten != null ? esc(this._praise(x.ten)) : ''}</small></div><ha-icon icon="mdi:chevron-right"></ha-icon></div>
        ${x.ten != null ? `<div class="rl"><span>${esc(T.rel)}</span><b>${esc(fmt(T.tenOf, { n: x.ten }))}</b></div><div class="ten sm">${this._dots(x.ten)}</div>` : ''}
        <div class="d7s">${this._days7(x)}</div><div class="stk"><ha-icon icon="mdi:fire"></ha-icon>${esc(fmt(T.streakTxt, { n: x.streak }))}</div></button>`;
    }
    // ----------------------------------------------------------------------------------- one person
    _person(p, x, d) {
      const T = this.T; const st = d.settings || {}; const s = this._snap(); const cutoff = (s.settings || {}).ontime_time || '20:00'; const aw = this._awMeta();
      const hero = `<section class="sec hero w5"><div class="lbl"><ha-icon icon="mdi:shield-check-outline"></ha-icon>${esc(T.rel)}</div>
        <div class="ht">${x.ten != null ? esc(fmt(T.heroT, { name: p.name, n: x.ten })) : esc(T.heroNone)}</div>
        ${x.ten != null ? `<div class="ten" role="img" aria-label="${esc(fmt(T.tenOf, { n: x.ten }))}">${this._dots(x.ten)}</div>
        <div class="pr"><ha-icon icon="mdi:emoticon-happy-outline"></ha-icon><div><b>${esc(this._praise(x.ten))}</b><small>${esc(fmt(T.detail, { d: x.done, t: x.total }))}</small></div></div>
        <div class="tr"><ha-icon icon="${x.trend > 0 ? 'mdi:trending-up' : x.trend < 0 ? 'mdi:trending-down' : 'mdi:trending-neutral'}"></ha-icon>${esc(T.trend[String(x.trend)])}</div>` : ''}</section>`;
      const tile = (icon, c, n, label, sub) => `<div class="tile t6"><span class="ti" style="--tc:${c}"><ha-icon icon="${icon}"></ha-icon></span><b>${n}</b><span>${esc(label)}</span><small>${sub}</small></div>`;
      const tiles = `<div class="tiles6 w7">${tile('mdi:check-bold', '#69C350', x.done, T.tDone, esc(fmt(T.tDoneSub, { n: x.total })))}${tile('mdi:hand-heart', '#F2A541', x.vol, T.tVol, esc(T.tVolSub))}
        ${tile('mdi:checkbox-marked-outline', '#A88BFA', x.todos, T.tTodo, esc(T.tTodoSub))}${tile('mdi:clock-check-outline', '#4FA3E0', x.ontime != null ? x.ontime + ' %' : '–', T.tOn, esc(fmt(T.tOnSub, { t: cutoff })))}
        ${tile('mdi:fire', '#FF8A5B', x.streak, T.tStreak, esc(fmt(T.tBest, { n: x.best })))}${tile('mdi:star-circle-outline', '#F5C542', `${coin(26)}${x.earned}`, T.tPts, esc(T.tPtsSub))}</div>`;
      // 7 days as blocks: the blocks shrink when a day has many chores
      const maxN = Math.max(1, ...x.week.map((w) => w[1])); const bh = Math.max(9, Math.min(28, Math.floor((168 - (maxN - 1) * 4) / maxN)));
      const now = new Date();
      const week = `<section class="sec w6"><div class="hd"><h2>${esc(T.week7)}</h2><small>${esc(T.block)}</small></div><div class="blocks">${x.week.map(([k, n], i) => { const dd = new Date(now); dd.setDate(now.getDate() - 6 + i);
        return `<div class="bc"><span class="bs">${n && k === n ? star(20, '#F5C542') : ''}</span><div class="bk">${Array.from({ length: n }, (_, j) => `<i class="${j < k ? 'on' : ''}" style="height:${bh}px;border-radius:${Math.min(7, Math.round(bh / 3))}px"></i>`).join('')}</div><b>${n ? `${k}/${n}` : '–'}</b><small class="${i === 6 ? 'tdy' : ''}">${esc(i === 6 ? T.today : T.wd[dd.getDay()])}</small></div>`; }).join('')}</div>
        <div class="legend"><span><i style="background:#69C350"></i>${esc(T.done)}</span><span><i class="dsh"></i>${esc(T.open)}</span><span>${star(14, '#F5C542')}${esc(T.star)}</span></div></section>`;
      const heatCols = []; for (let w = 0; w < 12; w++) heatCols.push(x.heat.slice(w * 7, w * 7 + 7));
      const full = x.heat.filter((v) => v === 0).length;
      const heat = `<section class="sec w6"><div class="hd"><h2>${esc(T.weeks12)}</h2><small>${esc(T.dot)}</small></div><div class="heat">${heatCols.map((c) => `<div>${c.map((v) => `<i style="background:${v < 0 ? 'var(--fp-bg4,#2c323d)' : MC[Math.min(3, v)]}"></i>`).join('')}</div>`).join('')}</div>
        <div class="legend">${[0, 1, 2, 3, 4].map((i) => `<span><i class="o" style="background:${i < 4 ? MC[i] : 'var(--fp-bg4,#2c323d)'}"></i>${esc(T.legLong[i])}</span>`).join('')}</div><p class="note">${esc(fmt(T.fullDays, { n: full }))}</p></section>`;
      const tot = { chore: x.done, sonder: x.vol, todo: x.todos }; const all = Math.max(1, x.done + x.vol + x.todos);
      const did = `<section class="sec w12"><div class="hd"><h2>${esc(T.did)}</h2><small>${esc(fmt(T.things, { n: x.done + x.vol + x.todos }))}</small></div>
        <div class="stack big">${['chore', 'sonder', 'todo'].map((k) => (tot[k] ? `<span style="width:${(tot[k] / all * 100).toFixed(1)}%;min-width:30px;background:${TYPE_C[k]}">${tot[k]}</span>` : '')).join('')}</div>
        <div class="cols3">${['chore', 'sonder', 'todo'].map((k) => { const it = (x.types[k] || []).slice(0, 6); const m = it.length ? it[0][1] : 1;
          return `<div><div class="th"><i style="background:${TYPE_C[k]}"></i><b>${esc(T.types[k])}</b><b class="n">${tot[k]}</b></div>${it.length ? it.map(([t, n]) => `<div class="li"><div><span>${esc(k === 'todo' && t === 'Planer' ? T.planner : t)}</span><b>${n}×</b></div><i><i style="width:${Math.round(n / m * 100)}%;background:${TYPE_C[k]}"></i></i></div>`).join('') : `<span class="none">${esc(T.nothing)}</span>`}</div>`; }).join('')}</div></section>`;
      // points
      const earned = Math.max(1, x.earned);
      const src = x.sources.map(([k, n]) => { const a = T.src[k] || [k, '']; const extra = k === 'award' && x.award_sources.length ? x.award_sources.map(([id, c]) => `${(aw[id] || { title: id }).title}${c > 1 ? ` ${c}×` : ''}`).join(', ') : a[1];
        return `<div class="srow"><i style="background:${SRC_C[k] || '#888'}"></i><div><b>${esc(a[0])}</b><small>${esc(extra)}</small></div><b>+${n}</b></div>`; }).join('');
      const jar = x.sources.map(([k, n]) => `<i style="height:${Math.max(6, Math.round(n / earned * 190))}px;background:${SRC_C[k] || '#888'}"></i>`).join('');
      const dayTxt = (day) => { const t0 = new Date(); const iso = (dd) => `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`; const y = new Date(t0); y.setDate(t0.getDate() - 1);
        if (day === iso(t0)) return T.today; if (day === iso(y)) return T.yday; const dd = new Date(day + 'T12:00'); return `${T.wd[dd.getDay()]} ${dd.getDate()}.${dd.getMonth() + 1}.`; };
      const feedTxt = (f) => (f.kind === 'award' ? ((aw[f.text] || {}).title || f.text) : f.kind === 'bonus' ? (T.src.bonus[0]) : f.kind === 'streak' ? T.src.streak[0] : f.kind === 'level' ? T.src.level[0] : String(f.text || '').replace(/^⭐ /, ''));
      const pts = `<section class="sec w12 ptsec"><div class="hd"><h2>${esc(T.pts)}</h2><small>${esc(fmt(T.ptsHead, { e: x.earned, s: x.spent }))}</small></div><div class="pgrid">
        <div class="jarw"><span class="lid"></span><div class="jar" role="img" aria-label="${esc(x.sources.map(([k, n]) => `${(T.src[k] || [k])[0]} ${n}`).join(', '))}">${jar}</div><b>${coin(22)}${x.earned}</b><small>${esc(T.earned)}</small></div>
        <div class="srcs">${src || `<span class="none">${esc(T.nothing)}</span>`}<div class="srow sp"><ha-icon icon="mdi:gift-outline"></ha-icon><div><b>${esc(T.spent)}</b><small>${esc(x.spent ? x.spent_items.join(', ') : T.saving)}</small></div><b class="neg">${x.spent ? '−' + x.spent : '0'}</b></div></div>
        <div class="feed"><div class="lbl">${esc(T.last)}</div>${x.feed.map((f) => `<div class="fr"><i style="background:${SRC_C[f.kind === 'fair' ? 'chore' : f.kind] || '#888'}"></i><div><span>${esc(feedTxt(f))}</span><small>${esc(dayTxt(f.day))}</small></div><b class="${f.pts < 0 ? 'neg' : 'pos'}">${f.pts > 0 ? '+' + f.pts : '−' + -f.pts}</b></div>`).join('')}</div></div></section>`;
      const awRow = (list) => list.map(([id, n]) => { const m = aw[id] || { icon: 'mdi:medal', color: '#E0A84F', title: id }; return `<span class="aw"><span class="md" style="--mc:${COLOR(m.color)}"><ha-icon icon="${esc(m.icon)}"></ha-icon></span><b>${n}×</b><small>${esc(m.title)}</small></span>`; }).join('');
      const myAw = `<section class="sec w12"><div class="hd"><h2>${esc(T.myAw)}</h2><small>${x.awards.reduce((a, b) => a + b[1], 0)} ${esc(T.awPeriod)} · ${x.awards_all.reduce((a, b) => a + b[1], 0)} ${esc(T.awAll)}</small></div><div class="aws">${x.awards_all.length ? awRow(x.awards_all) : `<span class="none">${esc(T.noAw)}</span>`}</div></section>`;
      const practice = st.practice === false || !x.miss.length ? '' : `<section class="sec w6"><h2>${esc(T.practice)}</h2>${x.miss.map(([t, n]) => `<div class="mi"><ha-icon icon="mdi:lightbulb-on-outline"></ha-icon><div><b>${esc(t)}</b><small>${esc(fmt(T.missed, { n }))}</small></div></div>`).join('')}<small class="tip">${esc(T.tip)}</small></section>`;
      const tm = Math.max(1, ...x.tod); const bi = x.tod.some((v) => v) ? x.tod.indexOf(Math.max(...x.tod)) : -1;
      const when = `<section class="sec ${practice ? 'w6' : 'w12'}"><h2>${esc(T.when)}</h2><div class="tod">${x.tod.map((n, i) => `<div><b>${n}</b><i style="height:${Math.max(6, Math.round(n / tm * 90))}px;background:${['#F5C542', '#4FA3E0', '#A88BFA'][i]}"></i><small>${esc(T.tod[i])}</small></div>`).join('')}</div>${bi >= 0 ? `<p class="note g">${esc(T.todTxt[bi])}</p>` : ''}</section>`;
      return `<div class="grid">${hero}${tiles}${week}${heat}${did}${pts}${myAw}${practice}${when}</div>`;
    }
  }

  const CSS = `
    :host{display:block}
    .card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}.card{position:relative;background:var(--fp-bg1,#1e1e1e);border:1px solid var(--fp-line,#2a2a2a);border-radius:var(--fp-radius,16px);padding:16px;color:var(--fp-text,#ececec);font-family:var(--fp-font,system-ui,sans-serif);-webkit-backdrop-filter:var(--fp-blur,none);backdrop-filter:var(--fp-blur,none);box-shadow:var(--fp-glow,none)}
    button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
    h2{margin:0;font-size:17px}small{color:var(--fp-text2,#a9b1bd)}
    .msg{padding:40px;text-align:center;color:var(--fp-text2,#aaa)}
    .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px}
    .chip{display:flex;align-items:center;gap:8px;height:48px;padding:0 16px 0 5px;border-radius:24px;border:2px solid var(--fp-line,#2f3541);background:var(--fp-bg2,#1c2027);font-size:15px;font-weight:600;color:var(--fp-text2,#a9b1bd)}
    .chip.on{border-color:var(--pc,var(--fp-accent,#69C350));background:var(--fp-bg3,#232831);color:var(--fp-text,#eee)}
    .chip .fi{width:36px;height:36px;border-radius:50%;background:var(--fp-accent,#69C350);color:var(--fp-on-accent,#111);display:flex;align-items:center;justify-content:center}
    .seg{margin-left:auto;display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--fp-bg2,#171a20);border:1px solid var(--fp-line,#2f3541)}
    .seg button{height:40px;padding:0 14px;border:0;border-radius:9px;background:transparent;font-size:14px;font-weight:600;color:var(--fp-text2,#a9b1bd)}
    .seg button.on{background:var(--fp-accent,#69C350);color:var(--fp-on-accent,#111)}
    .grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px;margin-bottom:14px}
    .sec{background:var(--fp-bg2,#171a20);border:0;border-radius:12px;box-shadow:inset 0 3px 0 var(--pc,var(--fp-accent,#69C350));padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
    .w5{grid-column:span 5}.w6{grid-column:span 6}.w7{grid-column:span 7}.w12{grid-column:span 12}
    .hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .tiles4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
    .tile{background:var(--fp-bg2,#171a20);border:0;border-radius:12px;box-shadow:inset 0 3px 0 var(--pc,var(--fp-accent,#69C350));padding:14px;display:flex;flex-direction:column;gap:2px;min-width:0}
    .tile b{font-size:32px;line-height:1.1;display:flex;align-items:center;gap:6px}.tile span{font-size:14px;font-weight:600}.tile small{font-size:12px}
    .tiles6{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .ti{width:38px;height:38px;border-radius:11px;background:color-mix(in srgb,var(--tc) 18%,transparent);color:var(--tc);display:flex;align-items:center;justify-content:center;margin-bottom:4px}
    .legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--fp-text2,#a9b1bd)}.legend span{display:flex;align-items:center;gap:5px}
    .legend i{width:13px;height:13px;border-radius:3px;display:inline-block}.legend i.o{border-radius:50%}.legend i.dsh{border:2px dashed var(--fp-text3,#6f7886);box-sizing:border-box}
    .legend.r{margin-left:auto}
    .whorow{display:flex;flex-direction:column;gap:6px}.wh{display:flex;align-items:center;gap:8px}.wh small{margin-left:auto}
    .stack{display:flex;height:26px;border-radius:8px;overflow:hidden;gap:2px}.stack span{display:flex;align-items:center;justify-content:center;color:#111;font-size:12px;font-weight:800}.stack.big{height:30px}
    .awtot{display:flex;gap:12px}.awtot div{flex:1;background:var(--fp-bg3,#1c2027);border-radius:12px;padding:10px 12px}.awtot b{display:block;font-size:28px;color:#F5C542}
    .awp{display:flex;flex-direction:column;gap:6px}.aws{display:flex;flex-wrap:wrap;gap:8px}
    .aw{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border-radius:18px;background:var(--fp-bg3,#1c2027)}.aw b{font-size:14px}.aw small{font-size:12px}
    .md{width:28px;height:28px;border-radius:50%;background:color-mix(in srgb,var(--mc) 22%,transparent);color:var(--mc);display:flex;align-items:center;justify-content:center}.md ha-icon{--mdc-icon-size:18px}
    .none{font-size:13px;color:var(--fp-text3,#8a93a1)}
    .tw{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:14px}th{font-size:13px;padding:6px 2px;min-width:64px}th.l,td.l{text-align:left;padding:6px 4px;min-width:150px}
    td{text-align:center;padding:4px 2px;border-top:1px solid var(--fp-line,#262b34)}tr.grp td{border-top:0;text-align:left;padding:12px 4px 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
    .ball{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:#111;font-size:12px;font-weight:800}.dash{color:var(--fp-text3,#6f7886)}.tot{color:var(--fp-text2,#a9b1bd);font-weight:600}
    .hd2{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:6px 0 10px}.hd2 h2{font-size:21px}
    .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
    .pc{display:flex;flex-direction:column;gap:12px;text-align:left;padding:16px;border-radius:12px;border:0;background:var(--fp-bg2,#171a20);box-shadow:inset 0 3px 0 var(--pc)}
    .pch{display:flex;align-items:center;gap:12px}.pch>div{flex:1;min-width:0}.pch b{display:block;font-size:20px}.pch small{color:#a8e08f;font-weight:600}
    .rl{display:flex;justify-content:space-between;font-size:13px;color:var(--fp-text2,#a9b1bd)}.rl b{color:var(--fp-text,#eee)}
    .ten{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:7px}.ten i{aspect-ratio:1;border-radius:50%;border:2px dashed var(--fp-text3,#6f7886);box-sizing:border-box}.ten i.on{background:#69C350;border:0}.ten.sm{gap:5px}
    .d7s{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.d7{display:flex;flex-direction:column;align-items:center;gap:3px}.d7 small{font-size:11px}
    .dd{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .stk{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--fp-text2,#a9b1bd)}.stk ha-icon{color:#FF8A5B;--mdc-icon-size:18px}
    .hero .lbl{display:flex;align-items:center;gap:6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--fp-text2,#a9b1bd)}.hero .lbl ha-icon{color:#69C350;--mdc-icon-size:18px}
    .ht{font-size:25px;font-weight:800;line-height:1.2}
    .pr{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,#69C350 12%,transparent)}.pr ha-icon{color:#69C350;--mdc-icon-size:30px}.pr b{display:block;color:#a8e08f}
    .tr{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--fp-text2,#a9b1bd)}.tr ha-icon{color:#4FA3E0}
    .blocks{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;align-items:end}.bc{display:flex;flex-direction:column;align-items:center;gap:5px}.bs{height:20px}
    .bk{display:flex;flex-direction:column-reverse;gap:4px;height:168px;width:100%;align-items:center}.bk i{flex:none;width:100%;max-width:54px;box-sizing:border-box;border:2px dashed var(--fp-text3,#6f7886)}.bk i.on{background:#69C350;border:0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}
    .bc b{font-size:13px}.bc small{font-size:12px}.bc small.tdy{color:#69C350;font-weight:700}
    .heat{display:flex;gap:5px}.heat div{display:grid;grid-template-rows:repeat(7,16px);gap:5px}.heat i{width:16px;height:16px;border-radius:50%}
    .note{margin:0;font-size:14px}.note.g{color:#a8e08f;font-weight:600}
    .cols3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.th{display:flex;align-items:center;gap:8px;margin-bottom:6px}.th i{width:13px;height:13px;border-radius:4px}.th .n{margin-left:auto;font-size:18px}
    .li{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}.li>div{display:flex;justify-content:space-between;font-size:14px;gap:8px}.li>i{height:8px;border-radius:4px;background:var(--fp-bg4,#2c323d);display:block}.li>i>i{display:block;height:8px;border-radius:4px}
    .pgrid{display:grid;grid-template-columns:200px minmax(0,1fr) minmax(0,.9fr);gap:18px}
    .jarw{display:flex;flex-direction:column;align-items:center;gap:6px}.lid{width:130px;height:12px;border-radius:6px 6px 2px 2px;background:var(--fp-bg4,#3a414d)}
    .jar{width:150px;height:210px;margin-top:-6px;border:3px solid var(--fp-text3,#4a515d);border-top:0;border-radius:10px 10px 30px 30px;padding:5px;box-sizing:border-box;display:flex;flex-direction:column-reverse;gap:2px;overflow:hidden;background:var(--fp-bg0,#12151a)}.jar i{flex:none;border-radius:4px}
    .jarw b{font-size:26px;color:#F5C542;display:flex;align-items:center;gap:6px}
    .srcs{display:flex;flex-direction:column;gap:2px}.srow{display:flex;align-items:center;gap:10px;padding:6px 4px;border-bottom:1px solid var(--fp-line,#262b34)}.srow>i{width:13px;height:13px;border-radius:50%;flex:none}.srow>div{flex:1;min-width:0}.srow>div b{display:block;font-size:14px}.srow>div small{font-size:12px}
    .srow.sp{border:0;margin-top:6px;border-radius:10px;background:color-mix(in srgb,#F08A80 12%,transparent)}.srow.sp ha-icon{color:#F08A80;--mdc-icon-size:18px}
    .neg{color:#F08A80}.pos{color:#a8e08f}
    .feed{display:flex;flex-direction:column;gap:7px}.feed .lbl{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--fp-text2,#a9b1bd)}
    .fr{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:10px;background:var(--fp-bg3,#1c2027)}.fr>i{width:10px;height:10px;border-radius:50%;flex:none}.fr>div{flex:1;min-width:0}.fr span{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fr small{font-size:11px}
    .mi{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;background:color-mix(in srgb,#F2A541 12%,transparent)}.mi ha-icon{color:#F2A541}.mi b{display:block;font-size:15px}.tip{font-size:12px}
    .tod{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end;height:140px}.tod div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px;height:100%}.tod i{width:100%;max-width:64px;border-radius:10px 10px 4px 4px}.tod small{font-size:12px}
    @media (max-width:900px){.w5,.w6,.w7{grid-column:span 12}.pgrid{grid-template-columns:1fr 1fr}.feed{grid-column:span 2}.cols3{grid-template-columns:1fr}}
    @media (max-width:600px){.tiles4{grid-template-columns:repeat(2,minmax(0,1fr))}.tiles6{grid-template-columns:repeat(2,minmax(0,1fr))}.seg{margin-left:0;width:100%}.seg button{flex:1}
      .chip{padding:0 12px 0 4px}.pgrid{grid-template-columns:1fr}.feed{grid-column:auto}.heat{gap:3px}.heat i{width:12px;height:12px}.heat div{grid-template-rows:repeat(7,12px);gap:3px}.legend.r{margin-left:0}}
  `;
  if (!customElements.get('fp-stats-inner')) customElements.define('fp-stats-inner', FpStatsInner);
})();
