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
      pinChanged: 'Eltern-PIN geändert.', lock: 'Sperren', parent: 'Eltern-PIN', newPerson: '+ Person', newList: '+ Liste', delAsk: '„{t}“ wirklich löschen?', search: 'Entität wählen …',
      errors: { no_target: 'Bitte Alexa-Benachrichtigung oder TTS mit Lautsprechern wählen.', no_motion: 'Bitte mindestens einen Bewegungsmelder wählen.', no_modules: 'Mindestens ein Modul muss aktiv sein.',
        bad_times: 'Zeiten prüfen: Beginn vor Ende, Blöcke ohne Überschneidung.', name: 'Bitte einen (eindeutigen) Namen angeben.', last_person: 'Die letzte Person kann nicht entfernt werden.', list: 'Bitte Name und To-do-Liste angeben.' },
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], block: 'Block', from: 'von', to: 'bis' },
    en: { title: 'Settings', locked: 'The settings are protected by the parent PIN.', unlock: 'Unlock', save: 'Save', saved: 'Saved.',
      reloading: 'Saved – the planner is loading the new settings …', cancel: 'Cancel', del: 'Delete', add: 'Add', none: '–', pin: 'Change parent PIN',
      pinChanged: 'Parent PIN changed.', lock: 'Lock', parent: 'Parent PIN', newPerson: '+ Person', newList: '+ List', delAsk: 'Really delete "{t}"?', search: 'Choose entity …',
      errors: { no_target: 'Please choose an Alexa notify entity or TTS with speakers.', no_motion: 'Please choose at least one motion sensor.', no_modules: 'At least one module must be active.',
        bad_times: 'Check the times: start before end, blocks must not overlap.', name: 'Please enter a (unique) name.', last_person: 'The last person cannot be removed.', list: 'Please enter a name and a to-do list.' },
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], block: 'Block', from: 'from', to: 'to' },
  };

  // field: [key, type, {de, en} label, {de, en} description, extra]
  const F = (k, type, de, en, dde, den, x) => ({ k, type, label: { de, en }, desc: { de: dde, en: den }, ...(x || {}) });
  const TABS = [
    { id: 'pics', icon: 'mdi:face-man-shimmer-outline', label: { de: 'Bilder', en: 'Pictures' } },
    { id: 'general', icon: 'mdi:tune-variant', label: { de: 'Allgemein', en: 'General' }, fields: [
      F('mod_week', 'bool', 'Modul Wochenplan', 'Week plan module', 'Ämtli, Termine, Schule, Ferien, Punkte, Belohnungen und Ansagen.', 'Chores, events, school, holidays, points, rewards and announcements.'),
      F('mod_lists', 'bool', 'Modul Smarte Listen', 'Smart lists module', 'Einkaufs- und To-do-Listen, die sich selbst sortieren.', 'Shopping and to-do lists that sort themselves.'),
      F('language', 'select', 'Sprache des Family Planers', 'Family Planer language', 'Automatisch wie Profil/Home Assistant, oder fest Deutsch bzw. Englisch – unabhängig von Home Assistant.', 'Automatic like your profile/Home Assistant, or fixed German or English – independent of Home Assistant.',
        { opts: [['auto', { de: 'Automatisch', en: 'Automatic' }], ['de', 'Deutsch'], ['en', 'English']] }),
      F('theme', 'select', 'Design', 'Design', 'Farben des Planers.', 'Colours of the planner.',
        { opts: [['ha', { de: 'Standard (wie Home Assistant)', en: 'Standard (like Home Assistant)' }], ['light', { de: 'Hell', en: 'Light' }], ['dark', { de: 'Dunkel', en: 'Dark' }], ['rainbow', { de: 'Regenbogen', en: 'Rainbow' }], ['space', { de: 'Weltall', en: 'Space' }]] }),
      F('style', 'select', 'Stil der Flächen', 'Surface style', 'Transparent und Glas lassen den Hintergrund des Designs durchscheinen.', 'Transparent and glass let the design\'s background shine through.',
        { opts: [['standard', { de: 'Standard', en: 'Standard' }], ['transparent', { de: 'Transparent', en: 'Transparent' }], ['glass', { de: 'Glas', en: 'Glass' }]] }),
      F('nav', 'nav', 'Navigation: Reihenfolge und sichtbare Knöpfe', 'Navigation: order and visible buttons', 'Mit den Pfeilen verschieben, mit dem Schalter ein- oder ausblenden. „Einstellungen“ bleibt immer sichtbar. Der Ämtliplan steckt jetzt auch unter Einstellungen → Ämtli.', 'Move with the arrows, show or hide with the switch. "Settings" always stays visible. The chore plan is now also under Settings → Chores.'),
      F('nav_title', 'bool', 'Titel statt Uhrzeit in der Navigation', 'Title instead of the time in the navigation', 'Zeigt links den Namen des Planers statt Uhrzeit und Datum.', 'Shows the planner\'s name on the left instead of the time and date.'),
      F('fullscreen_dblclick', 'bool', 'Vollbild per Doppeltippen', 'Fullscreen on double tap', 'Doppeltippen auf eine freie Stelle blendet Kopfzeile und Seitenleiste aus; nochmals doppeltippen holt sie zurück.', 'Double-tap an empty spot to hide header and sidebar; double-tap again to bring them back.'),
      F('fullscreen_auto', 'bool', 'Beim Öffnen automatisch Vollbild', 'Fullscreen automatically when opened', 'Ideal für ein Wandtablet.', 'Ideal for a wall tablet.'),
      F('default_view', 'select', 'Standard-Ansicht des Planers', 'Default planner view', 'Heute: nur der aktuelle Tag, Personen nebeneinander. Woche: die ganze Woche. Diese Ansicht kommt nach der Ruhezeit und beim Zurückkehren aus einem Menü.', 'Today: the current day only, people side by side. Week: the whole week. This view comes back after the idle time and when returning from a menu.',
        { opts: [['today', { de: 'Heute', en: 'Today' }], ['week', { de: 'Woche', en: 'Week' }]] }),
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
      F('season_start', 'md', 'Neue Level-Saison ab', 'New level season from', 'Jedes Schuljahr starten alle wieder bei Level 1. Freigeschaltete Extras und Punkte zum Einlösen bleiben, der Bestwert wird als Abzeichen gespeichert.', 'Every school year everybody starts again at level 1. Unlocked extras and points to redeem stay; the best level is kept as a badge.'),
      F('level_bonus', 'bool', 'Bonuspunkte beim Level-Aufstieg', 'Bonus points on level up', 'Ein voller Tag Punkte pro Level, drei bei einer neuen Stufe (Silber, Gold, Diamant, Rubin).', 'One full day of points per level, three for a new tier (silver, gold, diamond, ruby).'),
      F('early_time', 'time', 'Frühaufsteher: alles erledigt vor', 'Early bird: everything done before', 'Zeit für die Auszeichnung „Frühaufsteher“.', 'Time for the "Early bird" award.'),
      F('confetti', 'bool', 'Konfetti', 'Confetti', 'Kleines Konfetti mit Namen, wenn jemand alle Ämtli des Tages erledigt hat; grösseres in der Pokalfarbe bei Pokalen. Höchstens ein grosses pro Person und Tag.', 'Small confetti with the name when someone has done all chores of the day; bigger ones in the trophy colour for trophies. At most one big one per person and day.'),
      F('reward_notify', 'entities', 'Anfragen zusätzlich melden an', 'Also send requests to', 'z. B. die Handy-App – zusätzlich zur Mitteilung in Home Assistant.', 'e.g. the mobile app – in addition to the Home Assistant notification.', { domain: 'notify' }),
    ] },
    { id: 'todos', icon: 'mdi:checkbox-marked-circle-outline', label: { de: 'To-dos', en: 'To-dos' }, fields: [
      F('confirm', 'bool', 'Erledigen bestätigen', 'Confirm completion', 'To-dos werden erst nach der Frage „Als erledigt markieren?“ abgehakt.', 'To-dos are only ticked off after the question "Mark as done?".'),
      F('size', 'select', 'Standard-Grösse', 'Default size', 'Gross = Punkte für einen ganzen Tag, Mittel = ⅔, Klein = ⅓ (aufgerundet). Eine andere Grösse beim Anlegen braucht die Eltern-PIN. Zählt nicht zum fairen Tageswert.', 'Large = points for a full day, medium = ⅔, small = ⅓ (rounded up). Another size when adding needs the parent PIN. Does not count towards the fair day value.',
        { opts: [['none', { de: 'Ohne Punkte', en: 'No points' }], ['s', { de: 'Klein', en: 'Small' }], ['m', { de: 'Mittel', en: 'Medium' }], ['l', { de: 'Gross', en: 'Large' }]] }),
      F('name_lists', 'entities', 'To-do-Listen mit Namen', 'To-do lists with names', 'Wie bei den Kalendern: Ein Eintrag mit Name oder Spitzname („Lea Zimmer aufräumen“ → Spitzname unter Personen) wird ein To-do dieser Person. „klein / mittel / gross“ am Schluss bestimmt die Punkte. Abhaken geht in beide Richtungen, z. B. mit der Alexa-To-do-Liste.', 'Like the calendars: an item with a name or nickname ("Sam tidy office" → nickname under People) becomes a to-do of that person. "small / medium / large" at the end sets the points. Ticking off works both ways, e.g. with the Alexa to-do list.', { domain: 'todo' }),
      F('max_shown', 'num', 'To-dos pro Person im Planer', 'To-dos per person in the planner', 'Die ältesten zuerst; weitere erscheinen als „+3 weitere“ und lassen sich aufklappen.', 'Oldest first; more show as "+3 more" and can be expanded.', { min: 1, max: 20 }),
      F('show_age', 'bool', 'Zeigen, seit wann ein To-do offen ist', 'Show how long a to-do has been open', '„seit 3 T.“ unter dem To-do.', '"for 3 d" below the to-do.'),
      F('keep_days', 'num', 'Erledigte anzeigen für', 'Show finished ones for', '0 = bis zum nächsten Tageswechsel.', '0 = until the next day change.', { min: 0, max: 30, unit: { de: 'Tage', en: 'days' } }),
    ] },
    { id: 'announce', icon: 'mdi:bullhorn-outline', label: { de: 'Ansagen', en: 'Announcements' }, fields: [
      F('enabled', 'bool', 'Ansagen einschalten', 'Enable announcements', 'Sagt bei Bewegung an, wer noch Ämtli offen hat – ohne Bewegungsmelder zu festen Zeiten. Keine Ansagen, wenn im Ferien-Check „weg“ bestätigt ist.', 'Announces on motion who still has chores open – without a motion sensor at fixed times. No announcements when "away" is confirmed in the holiday check.'),
      F('fixed', 'bool', 'Ohne Bewegungsmelder: zu festen Zeiten', 'Without motion sensor: at fixed times', 'Gilt nur, solange kein Bewegungsmelder gewählt ist.', 'Only while no motion sensor is chosen.'),
      F('times', 'words', 'Feste Zeiten', 'Fixed times', 'Mit Komma getrennt, z. B. 12:30, 18:30.', 'Comma separated, e.g. 12:30, 18:30.'),
      F('evening', 'bool', 'Abends sagen, was noch offen ist', 'Say in the evening what is still open', 'Kurze Zusammenfassung pro Person (höchstens so viele Ämtli wie unten eingestellt).', 'Short summary per person (at most as many chores as set below).'),
      F('evening_time', 'time', 'Abend-Ansage um', 'Evening announcement at', '', ''),
      F('praise', 'bool', 'Ab und zu ein Lob', 'Now and then some praise', 'Höchstens einmal am Tag, wenn jemand alles erledigt hat.', 'At most once a day when someone has done everything.'),
      F('birthday', 'bool', 'Lustige Geburtstags-Ansagen', 'Funny birthday announcements', 'Fünf verschiedene Sprüche fürs Geburtstagskind, über den Tag verteilt.', 'Five different lines for the birthday child, spread over the day.'),
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
    { id: 'seasons', icon: 'mdi:weather-partly-snowy', label: { de: 'Saisons & Wetter', en: 'Seasons & weather' }, fields: [
      F('enabled', 'bool', 'Saison-Designs', 'Season designs', 'Weihnachten, Ostern, 1. August, Ferien, Geburtstage … legen sich automatisch über das gewählte Design: Kopfbild, Hintergrund, Farbband, Avatar-Extras.', 'Christmas, Easter, Swiss National Day, holidays, birthdays … are laid over the chosen design automatically: header scene, background, band, avatar extras.'),
      F('weather', 'entity', 'Wetter-Entität', 'Weather entity', 'Für die animierte Szene oben und die Vorschläge. Leer = nur Saison ohne Wetter.', 'For the animated scene at the top and the suggestions. Empty = season only, no weather.', { domain: 'weather' }),
      F('house', 'select', 'Haus in der Szene', 'House in the scene', 'Das Haus in der Landschaft oben: das einfache Standard-Haus oder ein hohes Giebelhaus mit Pergola, angebauter Garage mit Glasgeländer und Pool im Garten (im Winter abgedeckt, unter −5° mit Eiszapfen).', 'The house in the landscape at the top: the simple standard house or a tall gabled house with pergola, attached garage with a glass railing and a pool in the garden (covered in winter, icicles below −5°).',
        { opts: [['standard', { de: 'Standard-Haus', en: 'Standard house' }], ['pool', { de: 'Haus mit Pool & Pergola', en: 'House with pool & pergola' }]] }),
      F('intensity', 'select', 'Effekt-Stärke', 'Effect strength', '„Bewegung reduzieren“ im Gerät schaltet alle Partikel aus.', '"Reduce motion" on the device turns all particles off.',
        { opts: [['calm', { de: 'Ruhig', en: 'Calm' }], ['normal', { de: 'Normal', en: 'Normal' }], ['lots', { de: 'Viel', en: 'Lots' }]] }),
      F('storm_kmh', 'num', 'Sturm ab', 'Storm from', 'Ab dieser Windgeschwindigkeit biegen sich die Bäume richtig.', 'From this wind speed the trees really bend.', { min: 20, max: 150, unit: 'km/h' }),
      F('lead_day', 'num', 'Feiertage & Bräuche zeigen ab', 'Show holidays & customs from', 'Tage vorher (z. B. 1. August ab 29. Juli).', 'Days before (e.g. Swiss National Day from 29 July).', { min: 0, max: 30, unit: { de: 'Tage', en: 'days' } }),
      F('lead_school', 'num', 'Schulferien zeigen ab', 'Show school holidays from', 'Tage vor dem ersten Ferientag. Ferien werden aus den Kalendern erkannt (Sportferien, Frühlingsferien, Pfingst-, Sommer-, Herbst-, Weihnachtsferien).', 'Days before the first day. Holidays are found in the calendars (winter sports, spring, Whitsun, summer, autumn, Christmas holidays).', { min: 0, max: 30, unit: { de: 'Tage', en: 'days' } }),
      F('christmas_start', 'select', 'Weihnachts-Saison ab', 'Christmas season from', 'Die Adventskerzen zünden sich Sonntag für Sonntag an.', 'The Advent candles light up Sunday by Sunday.',
        { opts: [['advent', { de: '1. Advent', en: '1st Advent' }], ['dec1', { de: '1. Dezember', en: '1 December' }]] }),
      F('xmas_snow', 'bool', 'An Weihnachten schneit es immer', 'It always snows at Christmas', 'Das echte Wetter bleibt klein oben rechts.', 'The real weather stays small at the top right.'),
      F('wedding', 'date', 'Hochzeitstag', 'Wedding anniversary', 'Mit Jahr zeigt der Planer „14 Jahre verheiratet“.', 'With the year the planner shows "14 years married".'),
      F('couple', 'date', 'Kennenlerntag', 'Couple anniversary', 'Der Tag, an dem ihr ein Paar wurdet.', 'The day you became a couple.'),
      F('anim_bday', 'bool', 'Geburtstagskind animieren', 'Animate the birthday child', 'Die Zeile des Geburtstagskinds feiert den ganzen Tag; alle seine Punkte zählen doppelt.', 'The birthday child\'s row celebrates all day; all their points count double.'),
      F('priority', 'prio', 'Vorrang, wenn mehreres zusammenfällt', 'Priority when several things coincide', 'Oben gewinnt.', 'Top wins.'),
      F('events', 'events', 'Saisons ein- und ausschalten', 'Switch seasons on and off', 'Pro Ereignis. Leer lassen = Standard (rechts daneben, aus den Feldern oben). Eigene Zahl = so viele Tage vorher.', 'Per event. Leave empty = default (shown on the right, from the fields above). Own number = that many days before.'),
      F('sug_enabled', 'bool', 'Vorschläge unter dem Wetter', 'Suggestions below the weather', 'Ab Mittag höchstens ein Vorschlag pro Tag, täglich ein anderer (Pool, Jacuzzi, Spieleabend, Velotour …).', 'From noon at most one suggestion a day, a different one every day (pool, hot tub, games night, bike ride …).'),
      F('sug_from', 'time', 'Vorschläge ab', 'Suggestions from', '', ''),
      F('pool', 'entity', 'Pool-Temperatur', 'Pool temperature', 'Sensor mit der Wassertemperatur.', 'Sensor with the water temperature.', { domain: 'sensor', classes: ['temperature'] }),
      F('pool_min', 'num', 'Badi-Wetter ab', 'Swimming weather from', 'Wassertemperatur.', 'Water temperature.', { min: 15, max: 40, unit: '°' }),
      F('jacuzzi', 'entity', 'Jacuzzi-Temperatur', 'Hot tub temperature', 'Wird von Herbst bis Frühling an trockenen Abenden vorgeschlagen, wenn keine Erwachsenen weg sind.', 'Suggested from autumn to spring on dry evenings when no adult is out.', { domain: 'sensor', classes: ['temperature'] }),
      F('jacuzzi_min', 'num', 'Jacuzzi bereit ab', 'Hot tub ready from', '', '', { min: 20, max: 42, unit: '°' }),
    ] },
    { id: 'sonder', icon: 'mdi:star-shooting-outline', label: { de: 'Sonderämtli', en: 'Special chores' }, fields: [
      F('enabled', 'bool', 'Sonderämtli', 'Special chores', 'Lustige Extra-Ämtli nur für Bonuspunkte: nicht erledigt oder abgelaufen verschlechtert die Zuverlässigkeit (%) nie.', 'Fun extra chores for bonus points only: not done or expired never lowers the reliability (%).'),
      F('surprise_per_week', 'num', 'Überraschungs-Ämtli pro Kind', 'Surprise chores per child', 'Pro Woche höchstens so viele zufällig zugeteilte Sonderämtli.', 'At most this many randomly assigned special chores per week.', { min: 0, max: 14 }),
      F('max_open', 'num', 'Höchstens gleichzeitig offen', 'At most open at the same time', 'Im Freiwillig-Feld.', 'In the volunteer tile.', { min: 1, max: 20 }),
    ] },
    { id: 'lists', icon: 'mdi:cart-outline', label: { de: 'Listen', en: 'Lists' }, fields: [
      F('optimize_time', 'time', 'Tägliche Optimierung um', 'Daily optimisation at', 'Ordnet Unbekanntes unter „Sonstiges“ neu ein.', 'Re-sorts unknown items from "Other".'),
      F('ai_task', 'entity', 'KI-Aufgabe (optional)', 'AI task (optional)', 'Ordnet auch Unbekanntes ein (OpenAI, Google, Ollama …).', 'Also sorts unknown items (OpenAI, Google, Ollama …).', { domain: 'ai_task' }),
      F('prune_days', 'num', 'Ungenutzte Kategorie ersetzen nach', 'Replace unused category after', 'Macht Platz, wenn die Liste voll ist.', 'Makes room when the list is full.', { min: 7, max: 365, unit: { de: 'Tage', en: 'days' } }),
    ] },
    { id: 'status', icon: 'mdi:heart-pulse', label: { de: 'Status', en: 'Status' } },
  ];
  // tab order on the page
  const ORDER = ['pics', 'general', 'persons', 'chores', 'sonder', 'points', 'todos', 'lists', 'vacation', 'seasons', 'announce', 'status'];
  const NAVL = { de: { planer: 'Planer', listen: 'Listen', aemtliplan: 'Ämtliplan', belohnungen: 'Belohnungen', einstellungen: 'Einstellungen' }, en: { planer: 'Planner', listen: 'Lists', aemtliplan: 'Chore plan', belohnungen: 'Rewards', einstellungen: 'Settings' } };
  const AWN = { de: { trophy: 'Pokal des Monats', crown: 'Krone der Woche', perfect: 'Perfekte Woche', bee: 'Fleissbiene', weekend: 'Wochenend-Held', climber: 'Aufsteiger', early: 'Frühaufsteher', diamond: 'Diamant-Serie', milestone: 'Meilensteine', team: 'Familien-Teamwork' },
    en: { trophy: 'Trophy of the month', crown: 'Crown of the week', perfect: 'Perfect week', bee: 'Busy bee', weekend: 'Weekend hero', climber: 'Climber', early: 'Early bird', diamond: 'Diamond streak', milestone: 'Milestones', team: 'Family teamwork' } };
  const AWS = { de: { none: 'Ohne Punkte', s: 'Klein', m: 'Mittel', l: 'Gross', xl: 'Riesig' }, en: { none: 'No points', s: 'Small', m: 'Medium', l: 'Large', xl: 'Giant' } };
  const SECTION = { general: 'general', vacation: 'vacation', points: 'points', todos: 'todos', announce: 'announce', lists: 'lists_settings', seasons: 'seasons', sonder: 'sonder' };
  // season events in the settings (keys from the server's catalogue)
  const SEV = { weihnachten: ['Advent & Weihnachten', 'Advent & Christmas'], samichlaus: ['Samichlaus', 'St. Nicholas'], heiligabend: ['Heiligabend', 'Christmas Eve'], weihnachtstag: ['Weihnachtstag', 'Christmas Day'], stephanstag: ['Stephanstag', 'Boxing Day'], winteranfang: ['Winteranfang', 'First day of winter'],
    silvester: ['Silvester', 'New Year\'s Eve'], neujahr: ['Neujahr', 'New Year'], berchtoldstag: ['Berchtoldstag', 'St. Berchtold\'s Day'], dreikoenig: ['Dreikönigstag', 'Epiphany'], winter: ['Winter', 'Winter'],
    valentin: ['Valentinstag', 'Valentine\'s Day'], fasnacht: ['Fasnacht', 'Carnival'], fruehlingsanfang: ['Frühlingsanfang', 'First day of spring'], fruehling: ['Frühling', 'Spring'], karfreitag: ['Karfreitag', 'Good Friday'],
    ostersonntag: ['Ostern', 'Easter'], ostermontag: ['Ostermontag', 'Easter Monday'], tag_der_arbeit: ['Tag der Arbeit', 'Labour Day'], auffahrt: ['Auffahrt', 'Ascension'], muttertag: ['Muttertag', 'Mother\'s Day'],
    pfingstsonntag: ['Pfingsten', 'Whitsun'], pfingstmontag: ['Pfingstmontag', 'Whit Monday'], vatertag: ['Vatertag', 'Father\'s Day'], sommeranfang: ['Sommeranfang', 'First day of summer'], sommer: ['Sommer', 'Summer'],
    august: ['1. August', 'Swiss National Day'], schulanfang: ['Schulanfang', 'First day of school'], bettag: ['Bettag', 'Federal Fast'], herbstanfang: ['Herbstanfang', 'First day of autumn'], erntedank: ['Erntedank', 'Harvest festival'], herbst: ['Herbst', 'Autumn'],
    ferien_sport: ['Sportferien', 'Winter sports holidays'], ferien_fruehling: ['Frühlingsferien', 'Spring holidays'], ferien_pfingsten: ['Pfingstferien', 'Whitsun holidays'], ferien_sommer: ['Sommerferien', 'Summer holidays'], ferien_herbst: ['Herbstferien', 'Autumn holidays'], ferien_weihnachten: ['Weihnachtsferien', 'Christmas holidays'],
    geburtstag: ['Geburtstage', 'Birthdays'], hochzeitstag: ['Hochzeitstag', 'Wedding anniversary'], kennenlerntag: ['Kennenlerntag', 'Couple anniversary'] };
  const PRIO = { person: ['Geburtstag', 'Birthday'], couple: ['Hochzeits- & Kennenlerntag', 'Anniversaries'], holiday: ['Feiertage', 'Public holidays'], custom: ['Bräuche', 'Customs'], school: ['Schulferien', 'School holidays'], season: ['Lange Saisons', 'Long seasons'] };
  const BDA = [['Konfetti-Kanone', 'Confetti cannon'], ['Ballon-Fahrt', 'Balloon ride'], ['Seifenblasen', 'Soap bubbles'], ['Regenbogen-Disco', 'Rainbow disco'], ['Sternenregen', 'Star shower']];

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
    // without the parent PIN only the pictures are shown; "Parent PIN" at the top right opens everything else
    update() { if (!this._data && window.FPPIN && window.FPPIN.unlocked(this._store) && !this._asked) { this._asked = true; this._load(); } else this._render(); }
    connectedCallback() { if (!this._data && window.FPPIN && this._store && window.FPPIN.unlocked(this._store) && !this._asked) { this._asked = true; setTimeout(() => this._load(), 30); } else this._render(); }
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
      if (id === 'seasons') { const f = clone(d.seasons); f.priority = f.priority || Object.keys(PRIO); f.events = f.events || {}; return f; }
      if (id === 'general') { const g = clone(d.general); g.mod_week = g.modules.week; g.mod_lists = g.modules.lists; return g; }
      if (id === 'lists') return clone(d.lists_settings);
      if (id === 'points') { const f = clone(d.points); f.early_time = (f.awards || {}).early_time || '12:00'; f.confetti = (f.awards || {}).confetti !== false;
        f.season_start = (f.levels || {}).season_start || '08-01'; f.level_bonus = (f.levels || {}).bonus !== false; return f; }
      return clone(d[id]);
    }
    _input(e, isChange) {
      const el = e.target; const ds = el.dataset;
      if (ds.avup !== undefined && isChange && el.files && el.files[0]) { const p = this._avPerson(); if (p) this._avUpload(p, el.files[0]); return; }
      if (ds.navtg) { const n = this._forms.general.nav; n.hidden = el.checked ? n.hidden.filter((x) => x !== ds.navtg) : [...n.hidden, ds.navtg]; return; }
      if (ds.evon || ds.evld) { const ev = this._forms.seasons.events = this._forms.seasons.events || {}; const k = ds.evon || ds.evld; ev[k] = { ...(ev[k] || {}) }; if (ds.evon) ev[k].on = el.checked; else if (el.value === '') delete ev[k].lead; else ev[k].lead = Number(el.value); return; }
      if (ds.sf) { this._sonderInput(el, ds); return; }
      if (ds.sq !== undefined) { this._sQ = el.value; const q = el.value.toLowerCase(); this.shadowRoot.querySelectorAll('[data-stxt]').forEach((r) => { r.hidden = !!q && !r.dataset.stxt.includes(q); }); return; }
      if (ds.awon || ds.awsz) { const it = this._forms.points.awards.items; const id = ds.awon || ds.awsz; it[id] = { ...(it[id] || {}) }; if (ds.awon) it[id].on = el.checked; else it[id].size = el.value; return; }
      if (ds.pk === 'role') { const p = this._persons[Number(ds.pi)]; if (p) p.role = el.value; return; }
      if (ds.pk === 'bday_anim') { const p = this._persons[Number(ds.pi)]; if (p) p.bday_anim = el.value === '' ? null : Number(el.value); return; }
      if (ds.k && ds.tab) {
        const f = this._forms[ds.tab]; if (!f) return;
        if (el.type === 'checkbox') f[ds.k] = el.checked;
        else if (el.type === 'number') f[ds.k] = el.value === '' ? '' : Number(el.value);
        else if (ds.type === 'words') f[ds.k] = el.value;
        else if (ds.type === 'md') { if (/^\d{4}-\d{2}-\d{2}$/.test(el.value)) f[ds.k] = el.value.slice(5); }
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
      if (t.closest('[data-unlock]')) { this._asked = true; this._load(); return; }
      const ap = t.closest('[data-avp]'); if (ap) { this._avp = ap.dataset.avp; this._render(); return; }
      const at = t.closest('[data-avtab]'); if (at) { this._avtab = at.dataset.avtab; this._render(); return; }
      const asv = t.closest('[data-avsv]'); if (asv) { this._avsv = asv.dataset.avsv; this._render(); return; }
      const avs = t.closest('[data-avs]'); if (avs && window.FPAVS) { const p = this._avPerson(); if (p) { const [v, kind, key] = avs.dataset.avs.split('|'); this._avsv = v; this._avSeason(p, window.FPAVS.toggle(p.season_av, v, kind, key)); } return; }
      if (t.closest('[data-avrnd]')) { const p = this._avPerson(); if (p) { const fx = window.FPAV.parse(this._avCode(p)).fx; this._avSave(p, window.FPAV.set(window.FPAV.random(), 'fx', fx)); } return; }
      const avb = t.closest('[data-avb]'); if (avb) { const p = this._avPerson(); if (p) { const [part, val] = avb.dataset.avb.split('|'); this._avSave(p, window.FPAV.set(this._avCode(p), part, val)); } return; }
      const tab = t.closest('[data-tabsel]'); if (tab) { this._tab = tab.dataset.tabsel; this._render(); return; }
      if (t.closest('[data-chpin]')) { try { await window.FPPIN.change(this._store, this._ctx()); this._flash(this.T.pinChanged); } catch (er) { if (er !== window.FPPIN.CANCEL) this._flash(this._errText(er), true); } return; }
      if (t.closest('[data-lock]')) { window.FPPIN.lock(this._store); this._data = null; this._asked = false; this._tab = 'pics'; this._render(); return; }
      const rm = t.closest('[data-rment]');
      if (rm) { const f = this._forms[rm.dataset.tab]; f[rm.dataset.k] = (f[rm.dataset.k] || []).filter((x) => x !== rm.dataset.rment); this._render(); return; }
      const pc = t.closest('[data-pchip]');
      if (pc) { const f = this._forms[pc.dataset.tab]; const cur = f[pc.dataset.k] || []; f[pc.dataset.k] = cur.includes(pc.dataset.pchip) ? cur.filter((x) => x !== pc.dataset.pchip) : [...cur, pc.dataset.pchip]; this._render(); return; }
      if (t.closest('[data-savetab]')) { this._saveTab(); return; }
      const prm = t.closest('[data-prmv]');
      if (prm) { const [id, d] = prm.dataset.prmv.split('|'); const o = this._forms.seasons.priority; const i = o.indexOf(id); const j = i + Number(d); if (i >= 0 && j >= 0 && j < o.length) { [o[i], o[j]] = [o[j], o[i]]; this._render(); } return; }
      if (await this._sonderClick(t)) return;
      const nm = t.closest('[data-navmv]');
      if (nm) { const [id, d] = nm.dataset.navmv.split('|'); const o = this._forms.general.nav.order; const i = o.indexOf(id); const j = i + Number(d); if (i >= 0 && j >= 0 && j < o.length) { [o[i], o[j]] = [o[j], o[i]]; this._render(); } return; }
      const pm = t.closest('[data-pmv]');
      if (pm) { const [i0, d] = pm.dataset.pmv.split('|').map(Number); const j = i0 + d; const ps = this._persons; if (j < 0 || j >= ps.length) return; [ps[i0], ps[j]] = [ps[j], ps[i0]]; this._render();
        const ids = ps.filter((p) => p.id).map((p) => p.id); const res = await this._call('family_planer/person/order', { order: ids }); if (res !== null) this._flash(this.T.saved); return; }
      const vd = t.closest('[data-vdec]');
      const vfm = t.closest('[data-vfam]'); if (vfm) { const c = this._vacChoice(vfm.dataset.vfam); c.family = !c.family; this._render(); return; }
      const vpr = t.closest('[data-vper]'); if (vpr) { const c = this._vacChoice(vpr.dataset.vkey); c.family = false; const i = c.persons.indexOf(vpr.dataset.vper); if (i >= 0) c.persons.splice(i, 1); else c.persons.push(vpr.dataset.vper); this._render(); return; }
      if (vd) { const [key, dec] = vd.dataset.vdec.split('|'); const c = this._vacChoice(key);
        const res = await this._call('family_planer/vacation/decide', { key, decision: dec || null, family: !!c.family, persons: c.family ? [] : c.persons }); if (res !== null) { delete this._vc[key]; this._flash(this.T.saved); } return; }
      const sp = t.closest('[data-psave]'); if (sp) { this._savePerson(Number(sp.dataset.psave)); return; }
      const dp = t.closest('[data-pdel]'); if (dp) { const p = this._persons[Number(dp.dataset.pdel)]; this._dlg = { kind: 'person', i: Number(dp.dataset.pdel), title: p.name }; this._render(); return; }
      if (t.closest('[data-padd]')) { this._persons.push({ id: null, name: '', color: '#4FA3E0', role: 'kid', image: '', calendar: null, aliases: [], school: { calendar: null, times: {}, travel: 0 }, open: true }); this._render(); return; }
      const po = t.closest('[data-popen]'); if (po) { const p = this._persons[Number(po.dataset.popen)]; p.open = !p.open; this._render(); return; }
      const ls = t.closest('[data-lsave]'); if (ls) { this._saveList(Number(ls.dataset.lsave)); return; }
      const ld = t.closest('[data-ldel]'); if (ld) { const l = this._lists[Number(ld.dataset.ldel)]; this._dlg = { kind: 'list', i: Number(ld.dataset.ldel), title: l.name }; this._render(); return; }
      if (t.closest('[data-ladd]')) { this._lists.push({ id: null, name: '', entity: null, icon: 'mdi:cart-outline', max_categories: 10, auto: true, person_todos: false }); this._render(); return; }
      if (t.closest('[data-yes]') && this._dlg) { const d = this._dlg; this._dlg = null; if (d.kind === 'person') await this._removePerson(d.i); else await this._removeList(d.i); this._render(); return; }
      if (t.closest('[data-close]') || t.classList.contains('ov')) { this._dlg = null; this._render(); }
    }
    async _saveTab() {
      const id = this._tab; const f = { ...this._forms[id] };
      if (id === 'general') { f.modules = { week: !!f.mod_week, lists: !!f.mod_lists }; delete f.mod_week; delete f.mod_lists; }
      if (id === 'points') { f.awards = { items: (f.awards || {}).items || {}, early_time: f.early_time, confetti: !!f.confetti }; delete f.early_time; delete f.confetti;
        f.levels = { season_start: f.season_start, bonus: !!f.level_bonus }; delete f.season_start; delete f.level_bonus; }
      if (id === 'vacation' && typeof f.words === 'string') f.words = f.words.split(',').map((x) => x.trim()).filter(Boolean);
      if (id === 'announce' && typeof f.times === 'string') f.times = f.times.split(',').map((x) => x.trim()).filter(Boolean);
      const res = await this._call('family_planer/settings/save', { section: SECTION[id], data: f });
      if (!res) return;
      if (id === 'vacation') this._forms.vacation.rescan = false;
      this._flash(res.reload ? this.T.reloading : this.T.saved);
    }
    // ---------------------------------------------------------------- special chores (definitions, catalogue)
    async _sonderLoad() { const res = await this._call('family_planer/sonder/list', {}); if (res) { this._sonder = res; this._render(); } }
    // which special chores a filter chip keeps (anchor kinds grouped like a parent thinks about them)
    _sonderPass(d, f) {
      if (f === 'all') return true;
      const t = (d.anchor || {}).t;
      const m = { on: d.on, off: !d.on, own: !d.tpl, free: d.mode === 'free', daily: t === 'daily', weekly: t === 'weekly' || t === 'every',
        occasion: ['event', 'bday', 'wedding', 'advent_week', 'advent_sunday', 'yearly', 'once'].includes(t), weather: t === 'weather' || t === 'temp' || !!d.weather,
        away: (d.away || []).length > 0, secret: !!d.secret, adult: !!d.adult };
      return !!m[f];
    }
    _sonderTab() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de);
      if (!this._sonder) { if (!this._sonderBusy) { this._sonderBusy = true; this._sonderLoad().finally(() => { this._sonderBusy = false; }); } return `<div class="hint3">…</div>`; }
      const S = this._sonder; const ed = this._sEdit;
      const SZ = { s: lbl('Klein', 'Small'), m: lbl('Mittel', 'Medium'), l: lbl('Gross', 'Large'), own: lbl('Eigene', 'Own') };
      const MD = { free: lbl('Freiwillig', 'Volunteer'), each: lbl('Jedes Kind', 'Every child'), surprise: lbl('Überraschung', 'Surprise'), fixed: lbl('Fix', 'Fixed') };
      const WDS = lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
      const when = (d) => { const a = d.anchor || {}; const off = d.off || 0; const lead = off < 0 ? lbl(` · ${-off} T. vorher`, ` · ${-off} d before`) : '';
        const span = d.end_md ? lbl(` · bis ${d.end_md.slice(3)}.${d.end_md.slice(0, 2)}.`, ` · until ${d.end_md.slice(3)}/${d.end_md.slice(0, 2)}`) : lbl(` · ${d.span} T. Zeit`, ` · ${d.span} d`);
        const base = { once: () => a.d, daily: () => lbl('täglich', 'daily'), weekly: () => '↻ ' + (a.days || []).map((x) => WDS[x - 1]).join(', '), every: () => lbl(`alle ${a.n} Tage`, `every ${a.n} days`),
          yearly: () => `${(a.md || '').slice(3)}.${(a.md || '').slice(0, 2)}.`, event: () => (SEV[a.k] || [a.k, a.k])[lang === 'en' ? 1 : 0], bday: () => lbl('Geburtstag', 'Birthday'), wedding: () => lbl('Hochzeitstag', 'Wedding anniversary'),
          advent_week: () => lbl('jede Adventswoche', 'every Advent week'), advent_sunday: () => lbl('Advents-Sonntage', 'Advent Sundays'), weather: () => lbl('Wetter: ', 'Weather: ') + a.c, temp: () => lbl(`ab ${a.min}°`, `from ${a.min}°`) }[a.t];
        const pn = (id) => (id === 'any' ? lbl('jemand', 'someone') : ((this._data.persons || []).find((p) => p.id === id) || {}).name || '?');
        const awayTxt = (d.away || []).length ? lbl(` · nur wenn ${d.away.map(pn).join(' & ')} weg`, ` · only while ${d.away.map(pn).join(' & ')} away`) : '';
        return (base ? base() : '') + lead + span + awayTxt + (d.season ? ` · ${d.season.replace('jz:', '').replace('vis:', '')}` : '') + (d.from ? lbl(` · ab ${d.from}`, ` · from ${d.from}`) : '') + (d.until ? lbl(` · bis ${d.until}`, ` · until ${d.until}`) : ''); };
      const title = (d) => (lang === 'en' && d.title_en ? d.title_en : d.title);
      if (!this._sOrd) this._sOrd = S.defs.slice().sort((x, y) => (y.on - x.on) || title(x).localeCompare(title(y))).map((d) => d.id);
      const pos = (d) => { const i = this._sOrd.indexOf(d.id); return i < 0 ? -1 : i; };
      const flt = this._sFilt || 'all'; const q = (this._sQ || '').toLowerCase();
      const FL = [['all', lbl('Alle', 'All')], ['on', lbl('Ein', 'On')], ['off', lbl('Aus', 'Off')], ['own', lbl('Eigene', 'Own')], ['free', lbl('Freiwillig', 'Volunteer')], ['daily', lbl('Täglich', 'Daily')],
        ['weekly', lbl('Wöchentlich', 'Weekly')], ['occasion', lbl('Anlass', 'Occasion')], ['weather', lbl('Wetter', 'Weather')], ['away', lbl('Wenn weg', 'While away')], ['secret', lbl('Geheim', 'Secret')], ['adult', lbl('Mit Erwachsenem', 'Needs adult')]];
      const shown = S.defs.filter((d) => this._sonderPass(d, flt));
      const filters = `<div class="flt">${FL.map(([k, n]) => { const c = k === 'all' ? S.defs.length : S.defs.filter((d) => this._sonderPass(d, k)).length;
        return c || k === flt ? `<button class="fc${k === flt ? ' on' : ''}" data-sflt="${k}">${esc(n)} <i>${c}</i></button>` : ''; }).join('')}<input class="fq" data-sq type="search" placeholder="${esc(lbl('Suchen …', 'Search …'))}" value="${esc(this._sQ || '')}"></div>`;
      const list = shown.sort((x, y) => pos(x) - pos(y)).map((d) => `<div class="sdr${d.on ? '' : ' off'}" data-stxt="${esc((title(d) + ' ' + (d.title_en || '')).toLowerCase())}"${q && !(title(d) + ' ' + (d.title_en || '')).toLowerCase().includes(q) ? ' hidden' : ''}><input type="checkbox" class="sw" data-son="${esc(d.id)}" ${d.on ? 'checked' : ''}><span class="si">${esc(d.icon)}</span>
        <span class="st"><b>${esc(title(d))}${d.secret ? ' 🤫' : ''}</b><small>${esc(when(d))} · ${esc(MD[d.mode] || d.mode)} · ${esc(SZ[d.size])}${d.size === 'own' ? ' ' + esc(d.pts) : ''}</small></span>
        <button class="sg" data-sedit="${esc(d.id)}">${lbl('Bearbeiten', 'Edit')}</button></div>${ed && ed.id === d.id ? this._sonderForm() : ''}`).join('');
      const miss = S.missing.length ? `<div class="sec2">${lbl('Vorlagen wieder hinzufügen', 'Add templates again')}</div><div class="vch">${S.missing.map((m) => `<button class="chip" data-stpl="${esc(m.id)}">${esc(m.icon)} ${esc(lang === 'en' && m.title_en ? m.title_en : m.title)}</button>`).join('')}</div>` : '';
      return `<div class="sec2">${lbl('Sonderämtli & Vorlagen', 'Special chores & templates')}</div><div class="hint3">${esc(lbl('Eingeschaltete erscheinen zur richtigen Zeit – freiwillige im Feld „Freiwillig“ beim Planer: Wer zuerst tippt, bekommt es. Wiederkehrende kommen jedes Mal neu.', 'Switched-on ones appear at the right time – volunteer ones in the "Volunteer" tile in the planner: whoever taps first gets it. Recurring ones come back every time.'))}</div>
        <button class="addb" data-snew>${lbl('+ Neues Sonderämtli', '+ New special chore')}</button>${ed && !ed.id ? this._sonderForm() : ''}${filters}<div class="sdl">${list || `<div class="hint3">${esc(lbl('Nichts gefunden.', 'Nothing found.'))}</div>`}</div>${miss}`;
    }
    _sonderForm() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const d = this._sEdit; const a = d.anchor || { t: 'once' };
      const sel = (k, opts, v) => `<select class="in" data-sf="${k}">${opts.map(([x, l]) => `<option value="${esc(x)}" ${String(v) === String(x) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      const row = (label, ctl, hint) => `<div class="row"><span class="lt"><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</span><span class="ctl">${ctl}</span></div>`;
      const WDS = lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
      const anchorCtl = sel('anchor.t', [['once', lbl('Einmalig', 'Once')], ['daily', lbl('Täglich', 'Daily')], ['weekly', lbl('Wochentage', 'Weekdays')], ['every', lbl('Alle X Tage', 'Every X days')], ['yearly', lbl('Jährlich', 'Yearly')],
        ['event', lbl('Bei einem Ereignis', 'At an event')], ['bday', lbl('Geburtstag einer Person', 'A person\'s birthday')], ['wedding', lbl('Hochzeitstag', 'Wedding anniversary')], ['advent_week', lbl('Jede Adventswoche', 'Every Advent week')],
        ['advent_sunday', lbl('Advents-Sonntage', 'Advent Sundays')], ['weather', lbl('Bei Wetter', 'With weather')], ['temp', lbl('Ab Temperatur', 'From temperature')]], a.t);
      let extra = '';
      if (a.t === 'once') extra = `<input class="in" type="date" data-sf="anchor.d" value="${esc(a.d || '')}">`;
      if (a.t === 'weekly') extra = `<span class="vch">${WDS.map((w, i) => `<button class="chip${(a.days || []).includes(i + 1) ? ' on' : ''}" data-swd="${i + 1}">${w}</button>`).join('')}</span>`;
      if (a.t === 'every') extra = `<input class="in n" type="number" min="2" max="365" data-sf="anchor.n" value="${esc(a.n || 7)}"> ${lbl('ab', 'from')} <input class="in" type="date" data-sf="anchor.d" value="${esc(a.d || '')}">`;
      if (a.t === 'yearly') extra = `<input class="in" type="date" data-sf="anchor.md" value="${esc(new Date().getFullYear() + '-' + (a.md || '01-01'))}">`;
      if (a.t === 'event') extra = sel('anchor.k', Object.entries(SEV).filter(([k]) => !['geburtstag', 'hochzeitstag', 'kennenlerntag'].includes(k)).map(([k, l]) => [k, l[lang === 'en' ? 1 : 0]]), a.k);
      if (a.t === 'weather') extra = sel('anchor.c', [['rainy', lbl('Regen', 'Rain')], ['snowy', lbl('Schnee', 'Snow')], ['sunny', lbl('Sonne', 'Sun')], ['windy', lbl('Wind', 'Wind')], ['cloudy', lbl('Bewölkt', 'Cloudy')]], a.c);
      if (a.t === 'temp') extra = `<input class="in n" type="number" min="-20" max="45" data-sf="anchor.min" value="${esc(a.min != null ? a.min : 25)}"> °`;
      const persons = (this._data.persons || []).map((p) => `<button class="chip${(d.persons || []).includes(p.id) ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-spp="${esc(p.id)}"><i></i>${esc(p.name)}</button>`).join('');
      const aw = d.away || [];
      const awayChips = `<button class="chip${aw.includes('any') ? ' on' : ''}" data-saw="any">${lbl('Irgendein Erwachsener', 'Any grown-up')}</button>` + (this._data.persons || []).filter((p) => p.role === 'adult').map((p) => `<button class="chip${aw.includes(p.id) ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-saw="${esc(p.id)}"><i></i>${esc(p.name)}</button>`).join('');
      const seasons = [['', lbl('Immer', 'Always')], ['jz:fruehling', lbl('Frühling', 'Spring')], ['jz:sommer', lbl('Sommer', 'Summer')], ['jz:herbst', lbl('Herbst', 'Autumn')], ['jz:winter', lbl('Winter', 'Winter')],
        ...Object.keys((window.FPAVS && window.FPAVS.NAMES) || {}).map((k) => [`vis:${k}`, lbl('Saison: ', 'Season: ') + window.FPAVS.NAMES[k][lang === 'en' ? 1 : 0]])];
      return `<div class="sform">
        ${row(lbl('Titel', 'Title'), `<input class="in" maxlength="80" data-sf="title" value="${esc(d.title || '')}">`)}
        ${row(lbl('Symbol', 'Symbol'), `<input class="in" style="width:80px" maxlength="8" data-sf="icon" value="${esc(d.icon || '⭐')}">`)}
        ${row(lbl('Punkte', 'Points'), sel('size', [['s', lbl('Klein', 'Small')], ['m', lbl('Mittel', 'Medium')], ['l', lbl('Gross', 'Large')], ['own', lbl('Eigene Zahl', 'Own number')]], d.size) + (d.size === 'own' ? ` <input class="in n" type="number" min="0" max="1000" data-sf="pts" value="${esc(d.pts || 10)}">` : ''), lbl('Nur Bonuspunkte – zählt nie für die Zuverlässigkeit.', 'Bonus points only – never counts for reliability.'))}
        ${row(lbl('Vergabe', 'Assignment'), sel('mode', [['free', lbl('Freiwillig (wer zuerst kommt)', 'Volunteer (first come)')], ['each', lbl('Jedes Kind bekommt eines', 'Every child gets one')], ['surprise', lbl('Überraschung (zufällig)', 'Surprise (random)')], ['fixed', lbl('Fix für die Gewählten', 'Fixed for those chosen')]], d.mode))}
        ${row(lbl('Für', 'For'), `<span class="ents">${persons}</span>`, lbl('Leer = alle Kinder.', 'Empty = all children.'))}
        ${row(lbl('Wann', 'When'), anchorCtl + ' ' + extra)}
        ${row(lbl('Vorlauf', 'Lead time'), `<span class="nw"><input class="in n" type="number" min="0" max="60" data-sf="lead" value="${esc(Math.max(0, -(d.off || 0)))}"><span class="u">${lbl('Tage vorher', 'days before')}</span></span>`, lbl('So früh erscheint es, z. B. Geburtstagskarte 3 Tage vorher.', 'This early it appears, e.g. a birthday card 3 days before.'))}
        ${row(lbl('Frist', 'Time to do it'), `<span class="nw"><input class="in n" type="number" min="1" max="60" data-sf="span" value="${esc(d.span || 1)}"><span class="u">${lbl('Tage', 'days')}</span></span>${d.end_md ? `<small> ${lbl('(bis', '(until')} ${esc(d.end_md.slice(3))}.${esc(d.end_md.slice(0, 2))}.)</small>` : ''}`, lbl('Am besten inklusive Samstag, z. B. Laub rechen ab Dienstag 5 Tage.', 'Ideally including Saturday, e.g. raking leaves from Tuesday for 5 days.'))}
        ${row(lbl('Ab / bis Uhrzeit', 'From / until time'), `<input class="in t" type="time" data-sf="from" value="${esc(d.from || '')}"> – <input class="in t" type="time" data-sf="until" value="${esc(d.until || '')}">`, lbl('Erster Tag ab, letzter Tag bis (leer = ganzer Tag).', 'First day from, last day until (empty = all day).'))}
        ${row(lbl('Sichtbar', 'Visible'), sel('season', seasons, d.season || ''))}
        ${row(lbl('Nur wenn weg ist', 'Only while away'), `<span class="ents">${awayChips}</span>`, lbl('Z. B. „Mama einen gemütlichen Abend machen“, solange Papa weg ist. Weg = Ferien oder Abwesenheit im Kalender bzw. im Ferien-Check bestätigt. Wer weg ist, bekommt das Ämtli nie.', 'E.g. "make Mum a cosy evening" while Dad is away. Away = holiday or absence in the calendar, or confirmed in the holiday check. Whoever is away never gets it.'))}
        <label class="row b"><span class="lt"><b>${lbl('Braucht einen Erwachsenen', 'Needs a grown-up')}</b><small>${esc(lbl('Kommt nicht, solange alle Erwachsenen weg sind (z. B. Kerzen anzünden).', 'Does not come while every grown-up is away (e.g. lighting candles).'))}</small></span><input type="checkbox" class="sw" data-sf="adult" ${d.adult ? 'checked' : ''}></label>
        ${row(lbl('Nur bei Wetter', 'Only with weather'), sel('weather', [['', lbl('Egal', 'Any')], ['sunny', lbl('Sonne', 'Sun')], ['rainy', lbl('Regen', 'Rain')], ['snowy', lbl('Schnee', 'Snow')], ['windy', lbl('Wind', 'Wind')], ['cloudy', lbl('Bewölkt', 'Cloudy')]], d.weather || ''))}
        <label class="row b"><span class="lt"><b>${lbl('Geheim', 'Secret')}</b><small>${esc(lbl('Im Planer steht nur „Geheim-Ämtli“ – antippen zeigt es kurz. Bei Geburtstagen bekommt das Geburtstagskind es nie.', 'The planner only shows "Secret job" – tap to reveal briefly. For birthdays the birthday child never gets it.'))}</small></span><input type="checkbox" class="sw" data-sf="secret" ${d.secret ? 'checked' : ''}></label>
        <div class="acts">${d.id ? `<button class="sg del" data-sdel>${lbl('Löschen', 'Delete')}</button>` : ''}<span class="sp"></span><button class="sg" data-scancel>${lbl('Abbrechen', 'Cancel')}</button><button class="sg ok" data-ssave>${lbl('Speichern', 'Save')}</button></div></div>`;
    }
    _sonderInput(el, ds) {
      const d = this._sEdit; if (!d) return; const k = ds.sf; let v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.type === 'number') v = el.value === '' ? '' : Number(el.value);
      if (k.startsWith('anchor.')) { const sub = k.slice(7); d.anchor = { ...(d.anchor || {}) }; if (sub === 't') d.anchor = { t: v }; else if (sub === 'md') d.anchor.md = String(v).slice(5); else d.anchor[sub] = v; if (sub === 't') this._render(); return; }
      if (k === 'lead') { d.off = -(Number(v) || 0); return; }
      if (k === 'span') { d.span = Number(v) || 1; d.end_md = null; return; }
      d[k] = v; if (k === 'size') this._render();
    }
    async _sonderClick(t) {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de);
      const fb = t.closest('[data-sflt]'); if (fb) { this._sFilt = fb.dataset.sflt; this._render(); return true; }
      const on = t.closest('[data-son]');
      if (on && this._sonder) { const d = this._sonder.defs.find((x) => x.id === on.dataset.son); if (d) { d.on = on.checked; const { id, ...data } = d; await this._call('family_planer/sonder/save', { sonder_id: id, data }); } return true; }
      const ed = t.closest('[data-sedit]'); if (ed && this._sonder) { const d = this._sonder.defs.find((x) => x.id === ed.dataset.sedit); this._sEdit = this._sEdit && this._sEdit.id === d.id ? null : clone(d); this._render(); return true; }
      if (t.closest('[data-snew]')) { this._sEdit = { id: null, title: '', icon: '⭐', size: 'm', mode: 'free', persons: [], away: [], adult: false, anchor: { t: 'once', d: new Date().toISOString().slice(0, 10) }, off: 0, span: 3, from: '', until: '', season: '', weather: '', secret: false, on: true }; this._render(); return true; }
      if (t.closest('[data-scancel]')) { this._sEdit = null; this._render(); return true; }
      const wd = t.closest('[data-swd]'); if (wd && this._sEdit) { const a = this._sEdit.anchor; const n = Number(wd.dataset.swd); a.days = (a.days || []).includes(n) ? a.days.filter((x) => x !== n) : [...(a.days || []), n]; this._render(); return true; }
      const sw = t.closest('[data-saw]'); if (sw && this._sEdit) { const c = this._sEdit.away || []; const k = sw.dataset.saw; this._sEdit.away = c.includes(k) ? c.filter((x) => x !== k) : [...c, k]; this._render(); return true; }
      const pp = t.closest('[data-spp]'); if (pp && this._sEdit) { const c = this._sEdit.persons || []; this._sEdit.persons = c.includes(pp.dataset.spp) ? c.filter((x) => x !== pp.dataset.spp) : [...c, pp.dataset.spp]; this._render(); return true; }
      if (t.closest('[data-ssave]') && this._sEdit) {
        const { id, ...data } = this._sEdit; if (!String(data.title || '').trim()) { this._flash(lbl('Bitte einen Titel eingeben.', 'Please enter a title.'), true); return true; }
        const res = await this._call('family_planer/sonder/save', { ...(id ? { sonder_id: id } : {}), data }); if (res) { this._sEdit = null; this._flash(this.T.saved); this._sonderLoad(); } return true;
      }
      if (t.closest('[data-sdel]') && this._sEdit && this._sEdit.id) { const res = await this._call('family_planer/sonder/delete', { sonder_id: this._sEdit.id }); if (res !== null) { this._sEdit = null; this._flash(this.T.saved); this._sonderLoad(); } return true; }
      const tp = t.closest('[data-stpl]'); if (tp) { const res = await this._call('family_planer/sonder/template', { template: tp.dataset.stpl }); if (res) { this._flash(this.T.saved); this._sonderLoad(); } return true; }
      return false;
    }
    async _savePerson(i) {
      const p = this._persons[i]; const times = {};
      for (const [day, spans] of Object.entries(p.school.times || {})) {
        const ok = spans.filter((s) => s && s[0] && s[1]).map((s) => [s[0].slice(0, 5), s[1].slice(0, 5)]);
        if (spans.some((s) => s && ((s[0] && !s[1]) || (!s[0] && s[1])))) { this._flash(this.T.errors.bad_times, true); return; }
        if (ok.length) times[day] = ok;
      }
      const data = { name: p.name, color: p.color, role: p.role === 'adult' ? 'adult' : 'kid', calendar: p.calendar, aliases: p.aliases || [], school: { calendar: p.school.calendar, times, travel: p.school.travel || 0 },
        birthday: p.birthday || '', bday_anim: p.bday_anim == null ? null : p.bday_anim };
      const res = await this._call('family_planer/settings/person', { ...(p.id ? { person_id: p.id } : {}), data });
      if (!res) return; p.id = res.person_id; p.open = false; this._flash(res.reload ? this.T.reloading : this.T.saved);
    }
    async _removePerson(i) { const p = this._persons[i]; if (!p.id) { this._persons.splice(i, 1); return; } const res = await this._call('family_planer/settings/person_remove', { person_id: p.id }); if (res) { this._persons.splice(i, 1); this._flash(this.T.reloading); } }
    async _saveList(i) {
      const l = this._lists[i];
      const res = await this._call('family_planer/settings/list', { ...(l.id ? { list_id: l.id } : {}), data: { name: l.name, entity: l.entity, icon: l.icon, max_categories: l.max_categories, auto: l.auto, person_todos: !!l.person_todos } });
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
      if (fd.type === 'prio') {
        const pr = Array.isArray(v) ? v : Object.keys(PRIO);
        return `<div class="row col1">${head}<div class="navl">${pr.map((id, i) => `<div class="nr"><span class="nn">${i + 1}. ${esc(PRIO[id] ? PRIO[id][lang === 'en' ? 1 : 0] : id)}</span><button class="ar" data-prmv="${esc(id)}|-1" ${i ? '' : 'disabled'} aria-label="up">▲</button><button class="ar" data-prmv="${esc(id)}|1" ${i < pr.length - 1 ? '' : 'disabled'} aria-label="down">▼</button></div>`).join('')}</div></div>`;
      }
      if (fd.type === 'events') {
        const ev = v || {}; const up = (this._data.season_upcoming || []);
        const when = (k) => { const u = up.find((x) => x.key === k); return u ? u.start.slice(8, 10) + '.' + u.start.slice(5, 7) + '.' : ''; };
        const lbl2 = (de, en) => (lang === 'en' ? en : de); const f = this._forms.seasons || {};
        // default lead time of every event, live from the two fields above (same rules as the server)
        const defLead = (k) => { if (k === 'geburtstag') return 'day'; if (['weihnachten', 'winter', 'fruehling', 'sommer', 'herbst'].includes(k)) return 0;
          if (k.startsWith('ferien_')) return Number(f.lead_school != null && f.lead_school !== '' ? f.lead_school : 3); return Number(f.lead_day != null && f.lead_day !== '' ? f.lead_day : 3); };
        return `<div class="row col1">${head}<div class="evl">${Object.keys(SEV).map((k) => { const x = ev[k] || {}; const on = x.on !== false;
          const def = defLead(k);
          return `<div class="evr${on ? '' : ' off'}"><input type="checkbox" class="sw" data-evon="${k}" ${on ? 'checked' : ''}><span class="nn">${esc(SEV[k][lang === 'en' ? 1 : 0])}</span><small>${esc(when(k))}</small><input class="in n" type="number" min="0" max="30" placeholder="${def}" data-evld="${k}" value="${x.lead != null ? esc(x.lead) : ''}" title="${esc(lbl2('Leer = Standard', 'Empty = default'))}"><small class="dl">${esc(def === 'day' ? lbl2('am Tag', 'on the day') : lbl2(`Standard ${def} T.`, `default ${def} d`))}</small></div>`; }).join('')}</div></div>`;
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
      else if (fd.type === 'md') ctl = `<input class="in" style="width:170px" type="date" ${a} value="${esc(new Date().getFullYear() + '-' + String(v || '08-01'))}">`;
      else if (fd.type === 'time') ctl = `<input class="in t" type="time" ${a} value="${esc(String(v || '').slice(0, 5))}">`;
      else if (fd.type === 'date') ctl = `<input class="in" style="width:170px" type="date" ${a} value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '')}">`;
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
            <div class="row"><span class="lt"><b>${lbl('Farbe', 'Colour')}</b><small>${lbl('Gilt auch für den Kalender der Person.', 'Also used for the person\'s calendar.')}</small></span><span class="ctl"><input class="col" type="color" data-pk="color" data-pi="${i}" value="${esc(COLOR(p.color))}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Kalender', 'Calendar')}</b><small>${lbl('Termine dieser Person.', 'Events of this person.')}</small></span><span class="ctl">${this._entSelect(`data-pk="calendar" data-pi="${i}"`, 'calendar', null, p.calendar)}</span></div>
            <div class="row"><span class="lt"><b>${lbl('Geburtstag', 'Birthday')}</b><small>${lbl('Am Geburtstag feiert der Planer: eigene Saison, animierte Zeile, doppelte Punkte. Das Jahr ist freiwillig (für „wird 10“).', 'On the birthday the planner celebrates: own season, animated row, double points. The year is optional (for "turns 10").')}</small></span><span class="ctl"><input class="in" style="width:170px" type="date" data-pk="birthday" data-pi="${i}" value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(p.birthday || '') ? p.birthday : (p.birthday ? '2000-' + p.birthday : ''))}"></span></div>
            <div class="row"><span class="lt"><b>${lbl('Geburtstags-Animation', 'Birthday animation')}</b><small>${lbl('Automatisch = jedes Jahr eine andere, und bei allen verschieden.', 'Automatic = a different one every year, and different for everybody.')}</small></span><span class="ctl"><select class="in" data-pk="bday_anim" data-pi="${i}"><option value="">${lbl('Automatisch', 'Automatic')}</option>${BDA.map((b, n) => `<option value="${n}" ${p.bday_anim === n ? 'selected' : ''}>${esc(b[lang === 'en' ? 1 : 0])}</option>`).join('')}</select></span></div>
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
          <label class="mini" title="${esc(lbl('„Lea Zimmer aufräumen gross“ wird ein To-do für Lea (Grösse am Schluss: klein, mittel, gross). Abhaken geht in beide Richtungen.', '"Lea tidy room large" becomes a to-do for Lea (size at the end: small, medium, large). Ticking off works both ways.'))}"><input type="checkbox" class="sw" data-lk="person_todos" data-li="${i}" ${l.person_todos ? 'checked' : ''}> ${lbl('Namen → To-do der Person', 'Names → to-do of the person')}</label>
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
                .avwrap{padding:10px 4px 6px}${(window.FPAV || {}).css || ''}
        .avps{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}.avpb{display:flex;align-items:center;gap:8px;height:52px;padding:0 14px 0 6px;border-radius:26px;border:1px solid #2a2a2a;background:#232323;color:inherit;font:inherit;font-size:14px;cursor:pointer}
        .avpb.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c)}
        .upl{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px}.upl label{display:inline-flex;align-items:center}.upl small{font-size:12px;color:#8a8a8a}
        .tb.pin{color:${G};border-color:${G}}
        .hint3{font-size:13px;color:#999;margin:0 2px 10px;max-width:980px}
        .evl{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px;margin-top:8px}.evr{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:#232323;border:1px solid #2a2a2a}.evr .nn{flex:1;font-size:13px}.evr small{color:#8a8a8a;font-size:11px}.evr .in.n{width:58px}.evr small.dl{min-width:86px;text-align:left;color:#7a7a7a}.evr.off{opacity:.55}
        .sdl{display:flex;flex-direction:column;gap:6px;max-width:980px;margin-top:10px}.sdr{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a}.sdr.off{opacity:.6}.sdr[hidden]{display:none}
        .flt{display:flex;flex-wrap:wrap;gap:6px;align-items:center;max-width:980px;margin-top:14px}.fc{height:32px;padding:0 12px;border-radius:16px;border:1px solid #3a3a3a;background:#262626;color:#bbb;font:inherit;font-size:13px;cursor:pointer}
        .fc i{font-style:normal;color:#777;font-size:11px;margin-left:2px}.fc.on{border-color:${G};color:${G}}.fc.on i{color:${G}}.fq{flex:1;min-width:140px;height:32px;padding:0 12px;border-radius:16px;border:1px solid #3a3a3a;background:#1b1b1b;color:#eee;font:inherit;font-size:13px}
        .sdr .si{font-size:22px}.sdr .st{flex:1;min-width:0}.sdr .st b{display:block;font-size:14px;font-weight:500}.sdr .st small{display:block;font-size:12px;color:#8a8a8a;margin-top:2px}
        .sform{padding:10px 12px;border-radius:12px;border:1px solid #3a3a3a;background:#1e1e1e;max-width:980px}
        .vch{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.vch .chip{height:30px;font-size:12px}.vbt{display:flex;gap:6px;flex-wrap:wrap}
        .vrl,.stl{display:flex;flex-direction:column;gap:8px;max-width:980px;margin-bottom:8px}.vr{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a}.vr .lt{flex:1;min-width:200px}
        .str{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:#232323;border:1px solid #2a2a2a}.str ha-icon{color:${G}}.str.bad{border-color:#E06B6B}.str.bad ha-icon{color:#E06B6B}
        @media (max-width:700px){.row{grid-template-columns:1fr}.lcard{grid-template-columns:1fr}}
      </style>`;
      const msg = this._msg ? `<div class="msg${this._err ? ' e' : ''}">${esc(this._msg)}</div>` : '';
      if (!this._data) {
        this.shadowRoot.innerHTML = `${style}<div class="card"><div class="top"><h2>${esc(T.title)}</h2><button class="tb pin" data-unlock><ha-icon icon="mdi:shield-key-outline"></ha-icon>${esc(T.parent)}</button></div>
          ${this._picsView()}${msg}</div>`;
        return;
      }
      const tab = TABS.find((x) => x.id === this._tab) || TABS[0];
      let body = '';
      if (tab.id === 'pics') body = this._picsView();
      else if (tab.id === 'persons') body = this._personsTab();
      else if (tab.id === 'chores') body = `<div class="hint3">${esc(lang === 'en' ? 'Tap a day to assign a chore. Special chores and to-dos: buttons at the top of the chore plan.' : 'Tag antippen, um ein Ämtli zuzuteilen. Besondere Ämtli und To-dos: Knöpfe oben im Ämtliplan.')}</div><div class="planhost"></div>`;
      else if (tab.id === 'status') body = this._statusTab();
      else if (tab.id === 'sonder') { const f = this._forms.sonder; body = `<div class="rows">${tab.fields.map((fd) => this._field('sonder', fd, f[fd.k])).join('')}</div><div class="bar"><button class="sg ok" data-savetab>${esc(T.save)}</button></div>` + this._sonderTab(); }
      else {
        const f = this._forms[tab.id];
        body = `<div class="rows">${tab.fields.map((fd) => this._field(tab.id, fd, f[fd.k])).join('')}</div><div class="bar"><button class="sg ok" data-savetab>${esc(T.save)}</button></div>`;
        if (tab.id === 'lists') body += this._listsExtra();
        if (tab.id === 'vacation') body = this._vacReview() + body;
      }
      const d = this._dlg;
      const dlg = d ? `<div class="ov"><div class="dlg"><div class="dh">${esc(T.delAsk.replace('{t}', d.title || ''))}</div><div class="acts"><span class="sp"></span><button class="sg" data-close>${esc(T.cancel)}</button><button class="sg del" data-yes>${esc(T.del)}</button></div></div></div>` : '';
      const mods = this._data.general.modules;
      const tabs = ORDER.map((id) => TABS.find((x) => x.id === id)).filter((x) => x && !((x.id === 'lists' && !mods.lists) || (['persons', 'chores', 'vacation', 'points', 'todos', 'announce', 'seasons', 'sonder'].includes(x.id) && !mods.week)));
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
    _avPerson() { const ps = this._snap().persons || []; return ps.find((p) => p.id === this._avp) || ps[0] || null; }
    _avCode(p) {
      const A = window.FPAV; const loc = (this._avLocal || {})[p.id]; const img = loc || p.image || '';
      if (img.startsWith('av2:')) return img;
      if (img.startsWith('av:')) return A.from1(img);
      return A.code({ ...A.parse(''), fig: p.role === 'adult' ? 'f' : 'm' });
    }
    async _avSeason(p, sel) {
      p.season_av = sel; this._render();
      try { await this._store.ws('family_planer/person/update', { person_id: p.id, season_av: sel }); }
      catch (er) { this._flash(this._errText(er), true); }
    }
    async _avSave(p, code) {
      this._avLocal = { ...(this._avLocal || {}), [p.id]: code }; this._render();
      try { await this._store.ws('family_planer/person/update', { person_id: p.id, image: code }); } catch (er) { this._flash(this._errText(er), true); }
    }
    async _avUpload(p, file) {
      // centre crop to a 320 px square JPEG in the browser, then store it in Home Assistant
      const lbl = (de, en) => (this._lang === 'en' ? en : de);
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
        const sq = Math.min(img.naturalWidth, img.naturalHeight); const c = document.createElement('canvas'); c.width = c.height = 320;
        c.getContext('2d').drawImage(img, (img.naturalWidth - sq) / 2, (img.naturalHeight - sq) / 2, sq, sq, 0, 0, 320, 320);
        URL.revokeObjectURL(url);
        await this._store.ws('family_planer/person/upload_image', { person_id: p.id, data: c.toDataURL('image/jpeg', 0.86) });
        if (this._avLocal) delete this._avLocal[p.id];
        this._flash(lbl('Foto gespeichert.', 'Photo saved.'));
      } catch (er) { this._flash(lbl('Bild konnte nicht gelesen werden.', 'The picture could not be read.'), true); }
    }
    _picsView() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const ps = s.persons || [];
      const A = window.FPAV; const FX = this._fx(); const p = this._avPerson();
      if (!p || !A) return '';
      const pic = (q, size) => { const loc = (this._avLocal || {})[q.id]; const img = loc || q.image || '';
        return FX.avatarHtml ? FX.avatarHtml({ name: q.name, farbe: COLOR(q.color), ...(/^(av2?:|svg:|img:)/.test(img) ? { bild: img } : {}) }, size) : ''; };
      return `<div class="hint3">${esc(lbl('Jede und jeder darf hier ein Bild zusammenstellen – ohne PIN. Alles andere öffnet die Eltern-PIN oben rechts.', 'Anyone may build a picture here – no PIN needed. Everything else opens with the parent PIN at the top right.'))}</div>
        <div class="avps">${ps.map((q) => `<button class="avpb${q.id === p.id ? ' on' : ''}" style="--c:${COLOR(q.color)}" data-avp="${esc(q.id)}">${pic(q, 40)}<span>${esc(q.name)}</span></button>`).join('')}</div>
        <div class="avwrap">${A.builder(this._avCode(p), COLOR(p.color), lang, this._avtab, ((s.points || {})[p.id] || {}).unlocked || [], { name: p.name, vis: this._avsv })}</div>
        <div class="upl"><label class="sg">${esc(lbl('Eigenes Foto hochladen', 'Upload own photo'))}<input type="file" accept="image/*" data-avup hidden></label><small>${esc(lbl('Wird quadratisch zugeschnitten und nur in deinem Home Assistant gespeichert.', 'Cropped to a square and stored only in your Home Assistant.'))}</small></div>`;
    }
    _vacChoice(key) {
      this._vc = this._vc || {}; if (this._vc[key]) return this._vc[key];
      const v = (this._snap().vacation_review || []).find((x) => x.key === key) || {};
      this._vc[key] = { family: !!v.family, persons: [...((v.chosen && v.chosen.length ? v.chosen : v.persons) || [])] }; return this._vc[key];
    }
    _vacReview() {
      const lang = this._lang; const lbl = (de, en) => (lang === 'en' ? en : de); const s = this._snap(); const rv = s.vacation_review || [];
      const d = (x) => String(x || '').slice(0, 10).split('-').reverse().slice(0, 2).join('.') + '.';
      const head = `<div class="sec2">${lbl('Ferien-Check', 'Holiday check')}</div><div class="hint3">${esc(lbl('Ferien und lange Termine der nächsten zwei Wochen. Entschiedene bleiben hier noch 4 Wochen und lassen sich ändern.', 'Holidays and long events of the next two weeks. Decided ones stay here for 4 more weeks and can be changed.'))}</div>`;
      if (!rv.length) return head + `<div class="hint3">${esc(lbl('Gerade nichts zu prüfen.', 'Nothing to check right now.'))}</div>`;
      const item = (v) => { const c = this._vacChoice(v.key);
        const state = v.decision === 'away' ? lbl('Entschieden: weg', 'Decided: away') : v.decision === 'home' ? lbl('Entschieden: hier', 'Decided: here') : lbl('Offen', 'Open');
        return `<div class="vr"><span class="lt"><b>${esc(v.title)}</b><small>${esc(d((v.days || [])[0] || v.start))} – ${esc(d((v.days || []).slice(-1)[0] || v.end))} · ${esc(state)}</small>
          <span class="vch"><button class="chip${c.family ? ' on' : ''}" style="--c:${G}" data-vfam="${esc(v.key)}"><i></i>${esc(lbl('Ganze Familie', 'Whole family'))}</button>${(s.persons || []).map((p) => `<button class="chip${!c.family && c.persons.includes(p.id) ? ' on' : ''}" style="--c:${COLOR(p.color)}" data-vper="${esc(p.id)}" data-vkey="${esc(v.key)}"><i></i>${esc(p.name)}</button>`).join('')}</span></span>
          <span class="vbt"><button class="sg${v.decision === 'away' ? ' ok' : ''}" data-vdec="${esc(v.key)}|away">${lbl('Weg – pausieren', 'Away – pause')}</button><button class="sg${v.decision === 'home' ? ' ok' : ''}" data-vdec="${esc(v.key)}|home">${lbl('Hier – weiterlaufen', 'Here – go on')}</button>${v.decision ? `<button class="sg" data-vdec="${esc(v.key)}|">${lbl('Zurücksetzen', 'Reset')}</button>` : ''}</span></div>`; };
      const hol = rv.filter((v) => (v.kind || 'holiday') === 'holiday'); const lng = rv.filter((v) => v.kind === 'long');
      return head + `<div class="vrl">${hol.map(item).join('')}</div>${lng.length ? `<div class="sec2">${lbl('Optional – lange Termine', 'Optional – long events')}</div><div class="vrl">${lng.map(item).join('')}</div>` : ''}`;
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
