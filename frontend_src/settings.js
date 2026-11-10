// ---------------------------------------------------------------------------
// Settings page inside the planner (view: settings). Everything that the Home Assistant options dialogs
// offer, in one place, with a description next to every field. Always protected by the parent PIN.
// ---------------------------------------------------------------------------
(() => {
  const G = '#69C350';
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
      F('theme', 'select', 'Design', 'Design', 'Farben des Planers. Auch oben rechts in der Navigation wählbar (mit Vorschau).', 'Colours of the planner. Also available at the top right of the navigation (with preview).',
        { opts: [['ha', { de: 'Standard (wie Home Assistant)', en: 'Standard (like Home Assistant)' }], ['light', { de: 'Hell', en: 'Light' }], ['dark', { de: 'Dunkel', en: 'Dark' }], ['rainbow', { de: 'Regenbogen', en: 'Rainbow' }], ['space', { de: 'Weltall', en: 'Space' }]] }),
      F('style', 'select', 'Stil der Flächen', 'Surface style', 'Transparent und Glas lassen den Hintergrund des Designs durchscheinen.', 'Transparent and glass let the design\'s background shine through.',
        { opts: [['standard', { de: 'Standard', en: 'Standard' }], ['transparent', { de: 'Transparent', en: 'Transparent' }], ['glass', { de: 'Glas', en: 'Glass' }]] }),
      F('nav', 'nav', 'Navigation: Reihenfolge und sichtbare Knöpfe', 'Navigation: order and visible buttons', 'Mit den Pfeilen verschieben, mit dem Schalter ein- oder ausblenden. „Einstellungen“ bleibt immer sichtbar. Der Ämtliplan steckt jetzt auch unter Einstellungen → Ämtli.', 'Move with the arrows, show or hide with the switch. "Settings" always stays visible. The chore plan is now also under Settings → Chores.'),
      F('nav_title', 'bool', 'Titel statt Uhrzeit in der Navigation', 'Title instead of the time in the navigation', 'Zeigt links den Namen des Planers statt Uhrzeit und Datum.', 'Shows the planner\'s name on the left instead of the time and date.'),
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
    { id: 'persons', icon: 'mdi:account-multiple-outline', label: { de: 'Personen', en: 'People' } },
    { id: 'chores', icon: 'mdi:clipboard-text-clock-outline', label: { de: 'Ämtli', en: 'Chores' } },
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
      F('awards', 'awards', 'Pokale & Auszeichnungen', 'Trophies & awards', 'Pro Auszeichnung ein/aus und wie viele Punkte sie bringt (beim Gewinnen, und wieder, wenn man sie neu gewinnt). Klein = ⅓, Mittel = ⅔, Gross = 1×, Riesig = 2× der Punkte für einen ganzen Tag.', 'Per award on/off and how many points it gives (when won, and again when won anew). Small = ⅓, medium = ⅔, large = 1×, giant = 2× the points for a full day.'),
      F('early_time', 'time', 'Frühaufsteher: alles erledigt vor', 'Early bird: everything done before', 'Zeit für die Auszeichnung „Frühaufsteher“.', 'Time for the "Early bird" award.'),
      F('confetti', 'bool', 'Konfetti', 'Confetti', 'Kleines Konfetti mit Namen, wenn jemand alle Ämtli des Tages erledigt hat; grösseres in der Pokalfarbe bei Pokalen. Höchstens ein grosses pro Person und Tag.', 'Small confetti with the name when someone has done all chores of the day; bigger ones in the trophy colour for trophies. At most one big one per person and day.'),
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
    { id: 'status', icon: 'mdi:heart-pulse', label: { de: 'Status', en: 'Status' } },
  ];
  // tab order on the page
  const ORDER = ['general', 'persons', 'chores', 'points', 'todos', 'lists', 'vacation', 'announce', 'status'];
  const NAVL = { de: { planer: 'Planer', listen: 'Listen', aemtliplan: 'Ämtliplan', belohnungen: 'Belohnungen', einstellungen: 'Einstellungen' }, en: { planer: 'Planner', listen: 'Lists', aemtliplan: 'Chore plan', belohnungen: 'Rewards', einstellungen: 'Settings' } };
  const AWN = { de: { trophy: 'Pokal des Monats', crown: 'Krone der Woche', perfect: 'Perfekte Woche', bee: 'Fleissbiene', weekend: 'Wochenend-Held', climber: 'Aufsteiger', early: 'Frühaufsteher', diamond: 'Diamant-Serie', milestone: 'Meilensteine', team: 'Familien-Teamwork' },
    en: { trophy: 'Trophy of the month', crown: 'Crown of the week', perfect: 'Perfect week', bee: 'Busy bee', weekend: 'Weekend hero', climber: 'Climber', early: 'Early bird', diamond: 'Diamond streak', milestone: 'Milestones', team: 'Family teamwork' } };
  const AWS = { de: { none: 'Ohne Punkte', s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Riesig' }, en: { none: 'No points', s: 'Small', m: 'Medium', l: 'Large', xl: 'Giant' } };
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
    set hass(h) { this._hass = h; if (this._plan) this._plan.hass = h; }
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
      if (id === 'points') { const f = clone(d.points); f.early_time = (f.awards || {}).early_time || '12:00'; f.confetti = (f.awards || {}).confetti !== false; return f; }
      return clone(d[id]);
    }
    _input(e, isChange) {
      const el = e.target; const ds = el.dataset;
      if (ds.navtg) { const n = this._forms.general.nav; n.hidden = el.checked ? n.hidden.filter((x) => x !== ds.navtg) : [...n.hidden, ds.navtg]; return; }
      if (ds.awon || ds.awsz) { const it = this._forms.points.awards.items; const id = ds.awon || ds.awsz; it[id] = { ...(it[id] || {}) }; if (ds.awon) it[id].on = el.checked; else it[id].size = el.value; return; }
      if (ds.pk === 'role') { const p = this._persons[Number(ds.pi)]; if (p) p.role = el.value; return; }
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
      const nm = t.closest('[data-navmv]');
      if (nm) { const [id, d] = nm.dataset.navmv.split('|'); const o = this._forms.general.nav.order; const i = o.indexOf(id); const j = i + Number(d); if (i >= 0 && j >= 0 && j < o.length) { [o[i], o[j]] = [o[j], o[i]]; this._render(); } return; }
      const pm = t.closest('[data-pmv]');
      if (pm) { const [i0, d] = pm.dataset.pmv.split('|').map(Number); const j = i0 + d; const ps = this._persons; if (j < 0 || j >= ps.length) return; [ps[i0], ps[j]] = [ps[j], ps[i0]]; this._render();
        const ids = ps.filter((p) => p.id).map((p) => p.id); const res = await this._call('family_planer/person/order', { order: ids }); if (res !== null) this._flash(this.T.saved); return; }
      const pa = t.closest('[data-pav]'); if (pa) { const p = this._persons[Number(pa.dataset.pav)]; p.av = !p.av; this._render(); return; }
      const ab = t.closest('[data-avb]');
      if (ab) { const p = this._persons[Number(ab.closest('[data-avi]').dataset.avi)]; const [part, val] = ab.dataset.avb.split('|'); const FX = this._fx();
        p.image = FX.avSet(String(p.image || '').startsWith('av:') ? p.image : 'av:k.kurz.braun.hell.0', part, val); this._render(); return; }
      const vd = t.closest('[data-vdec]');
      if (vd) { const [key, decision] = vd.dataset.vdec.split('|'); const res = await this._call('family_planer/vacation/decide', { key, decision }); if (res !== null) this._flash(this.T.saved); return; }
      const sp = t.closest('[data-psave]'); if (sp) { this._savePerson(Number(sp.dataset.psave)); return; }
      const dp = t.closest('[data-pdel]'); if (dp) { const p = this._persons[Number(dp.dataset.pdel)]; this._dlg = { kind: 'person', i: Number(dp.dataset.pdel), title: p.name }; this._render(); return; }
      if (t.closest('[data-padd]')) { this._persons.push({ id: null, name: '', color: '#4FA3E0', role: 'kid', image: '', calendar: null, aliases: [], school: { calendar: null, times: {}, travel: 0 }, open: true }); this._render(); return; }
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
      if (id === 'points') { f.awards = { items: (f.awards || {}).items || {}, early_time: f.early_time, confetti: !!f.confetti }; delete f.early_time; delete f.confetti; }
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
      const data = { name: p.name, color: p.color, role: p.role === 'adult' ? 'adult' : 'kid', ...(p.image ? { image: p.image } : {}), calendar: p.calendar, aliases: p.aliases || [], school: { calendar: p.school.calendar, times, travel: p.school.travel || 0 } };
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
    _fx() { return (this._lang === 'en' ? window.FPX_EN : window.FPX) || window.FPX || {}; }
    _snap() { return (this._store && this._store.snap) || {}; }
    _field(tab, fd, v) {
      const lang = this._lang; const a = `data-tab="${tab}" data-k="${fd.k}" data-type="${fd.type}"`;
      const head = `<span class="lt"><b>${esc(L(fd.label, lang))}</b>${fd.desc[lang] ? `<small>${esc(L(fd.desc, lang))}</small>` : ''}</span>`;
      if (fd.type === 'nav') {
        const n = v || { order: [], hidden: [] }; const mods = this._data.general.modules;
        return `<div class="row col1">${head}<div class="navl">${n.order.map((id, i) => { const off = (id === 'listen' && !mods.lists) || (['planer', 'belohnungen', 'aemtliplan'].includes(id) && !mods.week);
          return `<div class="nr${off ? ' off' : ''}"><span class="nn">${esc(NAVL[lang][id] || id)}</span><button class="ar" data-navmv="${esc(id)}|-1" ${i ? '' : 'disabled'} aria-label="up">▲</button><button class="ar" data-navmv="${esc(id)}|1" ${i < n.order.length - 1 ? '' : 'disabled'} aria-label="down">▼</button>
            <input type="checkbox" class="sw" data-navtg="${esc(id)}" ${n.hidden.includes(id) ? '' : 'checked'} ${id === 'einstellungen' ? 'disabled' : ''}></div>`; }).join('')}</div></div>`;
      }
      if (fd.type === 'awards') {
        const it = (v && v.items) || {}; const pts = this._snap().award_points || {};
        return `<div class="row col1">${head}<div class="awl">${Object.keys(AWN.de).map((id) => { const x = it[id] || { on: true, size: 's' };
          return `<div class="awr"><input type="checkbox" class="sw" data-awon="${id}" ${x.on ? 'checked' : ''}><span class="nn">${esc(AWN[lang][id])}</span>
            <select class="in sz" data-awsz="${id}">${Object.entries(AWS[lang]).map(([k, l]) => `<option value="${k}" ${x.size === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><span class="u">${pts[id] != null ? '= ' + pts[id] : ''}</span></div>`; }).join('')}</div></div>`;
      }
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
        const FX = this._fx(); const img = /^(av:|svg:|img:|mdi:)/.test(p.image || '') ? p.image : '';
        const pic = FX.avatarHtml ? FX.avatarHtml({ name: p.name || '?', farbe: COLOR(p.color), ...(img ? { bild: img } : {}) }, 34) : '<i></i>';
        return `<div class="pcard" style="--c:${COLOR(p.color)}"><div class="phw"><button class="ph" data-popen="${i}">${pic}<b>${esc(p.name || lbl('Neue Person', 'New person'))}</b><em class="rl">${esc(p.role === 'adult' ? lbl('Erwachsen', 'Adult') : lbl('Kind', 'Child'))}</em><span class="sp"></span><ha-icon icon="${p.open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon></button>
          <button class="ar" data-pmv="${i}|-1" ${i ? '' : 'disabled'} aria-label="up">▲</button><button class="ar" data-pmv="${i}|1" ${i < this._persons.length - 1 ? '' : 'disabled'} aria-label="down">▼</button></div>
          ${p.open ? `<div class="pb">
            <div class="row"><span class="lt"><b>${lbl('Name', 'Name')}</b></span><span class="ctl"><input class="in" maxlength="40" data-pk="name" data-pi="${i}" value="${esc(p.name)}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Rolle', 'Role')}</b><small>${lbl('Kinder stehen oben im Planer und zählen für die Prognosen. Erwachsene können trotzdem Ämtli und Pokale haben.', 'Children are listed first in the planner and count for the forecasts. Adults can still have chores and trophies.')}</small></span><span class="ctl"><select class="in" data-pk="role" data-pi="${i}"><option value="kid" ${p.role !== 'adult' ? 'selected' : ''}>${lbl('Kind', 'Child')}</option><option value="adult" ${p.role === 'adult' ? 'selected' : ''}>${lbl('Erwachsen', 'Adult')}</option></select></span></div>
            <div class="row"><span class="lt"><b>${lbl('Bild', 'Picture')}</b><small>${lbl('Figur, Frisur, Haut, Extras und Verkleidung frei kombinieren. Das Bild darf jeder auch ohne PIN im Ämtliplan ändern.', 'Combine figure, hair, skin, extras and costume freely. Anyone may also change the picture without the PIN in the chore plan.')}</small></span><span class="ctl"><button class="sg" data-pav="${i}">${p.av ? lbl('Baukasten schliessen', 'Close builder') : lbl('Bild zusammenstellen', 'Build picture')}</button></span></div>
            ${p.av && FX.avBuilder ? `<div class="avwrap" data-avi="${i}">${FX.avBuilder(String(p.image || '').startsWith('av:') ? p.image : 'av:k.kurz.braun.hell.0', COLOR(p.color))}</div>` : ''}
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
        .card{position:relative;background:#1e1e1e;border:1px solid #2a2a2a;border-radius:16px;padding:18px;font-family:${FONT};color:#ececec;min-height:360px}
        .top{display:flex;align-items:center;gap:10px;margin-bottom:14px}.top h2{margin:0;font-size:20px;font-weight:600;flex:1}
        .tb{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:10px;border:1px solid #333;background:#262626;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        ha-icon{--mdc-icon-size:20px}
        .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
        .tab{display:flex;align-items:center;gap:8px;height:42px;padding:0 14px;border-radius:12px;border:1px solid #2a2a2a;background:#232323;color:#bbb;font:inherit;font-size:14px;cursor:pointer}
        .tab.on{border-color:${G};color:${G};background:#262626;font-weight:600}
        .rows{display:flex;flex-direction:column;gap:2px;max-width:980px}
        .row{display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1.1fr);gap:16px;align-items:center;padding:12px 4px;border-bottom:1px solid #262626}
        .row.b{grid-template-columns:1fr auto;cursor:pointer}
        .lt{display:flex;flex-direction:column;gap:3px}.lt b{font-size:15px;font-weight:500}.lt small{font-size:12px;color:#8a8a8a;line-height:1.4}
        .ctl{display:flex;justify-content:flex-start}
        .in{height:42px;border-radius:10px;border:1px solid #333;background:#141414;color:#eee;font:inherit;font-size:15px;padding:0 12px;outline:none;width:100%;box-sizing:border-box;min-width:0}
        .in:focus{border-color:${G}}select.in{padding:0 8px}.in.n{width:110px}.in.t{width:120px}
        .nw{display:flex;align-items:center;gap:8px}.u{color:#888;font-size:13px}
        .sw{appearance:none;-webkit-appearance:none;width:50px;height:30px;border-radius:15px;background:#3a3a3a;position:relative;cursor:pointer;flex:none;margin:0;transition:background .15s}
        .sw::after{content:'';position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#ddd;transition:left .15s}
        .sw:checked{background:${G}}.sw:checked::after{left:23px;background:#fff}
        .ents{display:flex;flex-wrap:wrap;gap:6px;width:100%}.ents select{flex:1;min-width:200px}
        .ec{display:flex;align-items:center;gap:6px;height:34px;padding:0 4px 0 12px;border-radius:17px;background:#2b2b2b;border:1px solid #3a3a3a;font-size:13px}
        .ec button{width:26px;height:26px;border-radius:13px;border:none;background:transparent;color:#999;cursor:pointer}.ec button:hover{color:#E06B6B}
        .chip{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ccc;font:inherit;font-size:13px;cursor:pointer}.chip.on{border-color:var(--c);color:var(--c)}
        .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
        .bar{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;max-width:980px}
        .sg{height:42px;border-radius:21px;background:#2e2e2e;border:1px solid #3a3a3a;color:#ccc;font:inherit;font-size:14px;padding:0 18px;cursor:pointer}
        .sg.ok{background:${G};border-color:${G};color:#141414;font-weight:600}.sg.del{background:#3a2626;border-color:#E06B6B;color:#f3b4b4}
        .pcard{border:1px solid #2a2a2a;border-left:4px solid var(--c);border-radius:12px;background:#232323;margin-bottom:10px;max-width:980px}
        .ph{display:flex;align-items:center;gap:10px;width:100%;height:52px;padding:0 14px;border:none;background:transparent;color:inherit;font:inherit;font-size:16px;cursor:pointer}
        .ph i{width:14px;height:14px;border-radius:50%;background:var(--c)}.sp{flex:1}
        .pb{padding:0 14px 14px}.col{width:60px;height:42px;border:none;background:transparent;padding:0;cursor:pointer}
        .sec2{font-size:12px;color:${G};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:18px 4px 6px}
        .days{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin-top:8px}
        .day{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:10px;background:#1e1e1e;border:1px solid #2a2a2a}.day b{font-size:13px;color:#bbb}
        .blk{display:flex;align-items:center;gap:6px;font-size:12px;color:#888}.blk .in.t{width:110px;height:38px}
        .acts{display:flex;gap:8px;margin-top:14px;align-items:center}
        .addb{height:46px;border-radius:12px;border:1px dashed #4a4a4a;background:transparent;color:#bbb;font:inherit;font-size:14px;cursor:pointer;padding:0 18px;margin-top:4px}
        .lcard{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:8px;align-items:center;padding:12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a;margin-bottom:8px;max-width:980px}
        .lcard .mini{display:flex;align-items:center;gap:8px;font-size:13px;color:#aaa}.lcard .acts{margin:0;justify-content:flex-end}
        .lockd{display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 20px;color:#aaa;text-align:center}.lockd ha-icon{--mdc-icon-size:48px;color:${G}}
        .ov{position:absolute;inset:0;background:rgba(10,10,10,.72);border-radius:16px;display:flex;align-items:center;justify-content:center;z-index:4}
        .dlg{background:#232323;border:1px solid #3a3a3a;border-radius:14px;padding:18px;width:min(420px,92%)}.dh{font-size:16px;font-weight:600;margin-bottom:14px}
        .msg{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#2e3a2a;border:1px solid ${G};color:#dfe;padding:10px 18px;border-radius:12px;font-size:14px;z-index:20;max-width:80%}
        .msg.e{background:#3a2626;border-color:#E06B6B;color:#fdd}
        .row.col1{grid-template-columns:1fr}
        .navl,.awl{display:flex;flex-direction:column;gap:6px;max-width:560px}.nr,.awr{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:#232323;border:1px solid #2a2a2a}.nr.off{opacity:.5}
        .nn{flex:1;font-size:14px}.ar{width:34px;height:34px;border-radius:9px;border:1px solid #3a3a3a;background:#2b2b2b;color:#ccc;cursor:pointer;font-size:11px}.ar[disabled]{opacity:.3;cursor:default}
        .in.sz{width:140px;height:36px}.awr .u{min-width:44px;text-align:right}
        .phw{display:flex;align-items:center;gap:6px;padding-right:10px}.phw .ph{flex:1}.rl{font-style:normal;font-size:12px;color:#888;border:1px solid #3a3a3a;border-radius:10px;padding:1px 8px}
        .avwrap{padding:10px 4px 6px;border-bottom:1px solid #262626}${(window.FPX || {}).AVB_CSS || ''}
        .hint3{font-size:13px;color:#999;margin:0 2px 10px;max-width:980px}
        .vrl,.stl{display:flex;flex-direction:column;gap:8px;max-width:980px;margin-bottom:8px}.vr{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a}.vr .lt{flex:1;min-width:200px}
        .str{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a}.str ha-icon{color:${G}}.str.bad{border-color:#E06B6B}.str.bad ha-icon{color:#E06B6B}
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
      else if (tab.id === 'chores') body = `<div class="hint3">${esc(lang === 'en' ? 'Tap a day to assign a chore. Special chores and to-dos: buttons at the top of the chore plan.' : 'Tag antippen, um ein Ämtli zuzuteilen. Besondere Ämtli und To-dos: Knöpfe oben im Ämtliplan.')}</div><div class="planhost"></div>`;
      else if (tab.id === 'status') body = this._statusTab();
      else {
        const f = this._forms[tab.id];
        body = `<div class="rows">${tab.fields.map((fd) => this._field(tab.id, fd, f[fd.k])).join('')}</div><div class="bar"><button class="sg ok" data-savetab>${esc(T.save)}</button></div>`;
        if (tab.id === 'lists') body += this._listsExtra();
        if (tab.id === 'vacation') body = this._vacReview() + body;
      }
      const d = this._dlg;
      const dlg = d ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.delAsk.replace('{t}', d.title || ''))}</div><div class="acts"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-yes>${esc(T.del)}</button></div></div></div>` : '';
      const mods = this._data.general.modules;
      const tabs = ORDER.map((id) => TABS.find((x) => x.id === id)).filter((x) => x && !((x.id === 'lists' && !mods.lists) || (['persons', 'chores', 'vacation', 'points', 'todos', 'announce'].includes(x.id) && !mods.week)));
      this.shadowRoot.innerHTML = `${style}<div class="card">
        <div class="top"><h2>${esc(T.title)}</h2><button class="tb" data-chpin><ha-icon icon="mdi:form-textbox-password"></ha-icon>${esc(T.pin)}</button><button class="tb" data-lock><ha-icon icon="mdi:lock-outline"></ha-icon>${esc(T.lock)}</button></div>
        <div class="tabs">${tabs.map((x) => `<button class="tab${x.id === tab.id ? ' on' : ''}" data-tabsel="${x.id}"><ha-icon icon="${x.icon}"></ha-icon>${esc(L(x.label, lang))}</button>`).join('')}</div>
        ${body}${dlg}${msg}</div>`;
      if (tab.id === 'chores') this._mountPlan();
    }
    // the chore plan lives in settings now: the full plan card (with special chores and to-dos) inside this tab
    _mountPlan() {
      const host = this.shadowRoot.querySelector('.planhost'); if (!host || !this._hass) return;
      if (!this._plan) { this._plan = document.createElement('family-planer-card'); this._plan.setConfig({ view: 'plan', ...(this._snap().entry_id ? { entry_id: this._snap().entry_id } : {}) }); }
      host.appendChild(this._plan); this._plan.hass = this._hass;
    }
    _vacReview() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const rv = s.vacation_review || [];
      if (!rv.length) return '';
      const nm = (pid) => ((s.persons || []).find((p) => p.id === pid) || {}).name || '';
      const d = (x) => String(x || '').slice(0, 10).split('-').reverse().slice(0, 2).join('.') + '.';
      return `<div class="sec2">${lbl('Ferien im Kalender', 'Holidays in the calendar')}</div><div class="vrl">${rv.map((v) => `<div class="vr"><span class="lt"><b>${esc(v.title)}</b><small>${esc(d((v.days || [])[0] || v.start))} – ${esc(d((v.days || []).slice(-1)[0] || v.end))}${(v.persons || []).length ? ' · ' + esc(v.persons.map(nm).filter(Boolean).join(', ')) : ''}</small></span>
        <button class="sg${v.decision === 'away' ? ' ok' : ''}" data-vdec="${esc(v.key)}|away">${lbl('Weg – Ämtli pausieren', 'Away – pause chores')}</button><button class="sg${v.decision === 'home' ? ' ok' : ''}" data-vdec="${esc(v.key)}|home">${lbl('Zu Hause – Ämtli laufen', 'At home – chores go on')}</button></div>`).join('')}</div>`;
    }
    _statusTab() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const st = s.status || {};
      const t = (x) => { if (!x) return ''; const dt = new Date(x); return isNaN(dt) ? String(x) : `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}. ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`; };
      const name = (k) => { const [kind, id] = k.split(/:(.*)/s);
        if (kind === 'calendar') { const e = ((this._hass && this._hass.states[id]) || { attributes: {} }).attributes.friendly_name; return lbl('Kalender ', 'Calendar ') + (e || id); }
        if (kind === 'list') return lbl('Liste ', 'List ') + (((s.lists || []).find((l) => l.id === id) || {}).name || id);
        if (kind === 'rollover') return lbl('Tageswechsel', 'Day change');
        return k; };
      const keys = Object.keys(st).sort();
      if (!keys.length) return `<div class="hint3">${esc(lbl('Noch keine Meldungen – sie erscheinen nach dem ersten Abgleich.', 'No reports yet – they appear after the first sync.'))}</div>`;
      return `<div class="hint3">${esc(lbl('Letzter erfolgreicher Abgleich und letzter Fehler pro Quelle.', 'Last successful sync and last error per source.'))}</div><div class="stl">${keys.map((k) => { const x = st[k] || {}; const bad = x.fail && (!x.ok || x.fail > x.ok);
        return `<div class="str${bad ? ' bad' : ''}"><ha-icon icon="${bad ? 'mdi:alert-circle-outline' : 'mdi:check-circle-outline'}"></ha-icon><span class="lt"><b>${esc(name(k))}</b><small>${esc([x.ok ? 'OK: ' + t(x.ok) : '', x.fail ? lbl('Fehler: ', 'Error: ') + t(x.fail) + (x.error ? ' – ' + x.error : '') : ''].filter(Boolean).join(' · '))}</small></span></div>`; }).join('')}</div>`;
    }
  }
  if (!customElements.get('fp-settings-inner')) customElements.define('fp-settings-inner', FpSettingsInner);
})();
