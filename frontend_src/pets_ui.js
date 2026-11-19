// Tierchen: pet + wheel on the person card, rising rewards after a chore, pets in the banner, the wheel,
// hatching and evolving, and the Tierchen page (fp-pets-inner). The graphics come from family-planer-pets.js
// (window.fpLoadPets); every action goes to the server (family_planer/pet), which checks it.
(() => {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const L = () => window.FPPETS || null;
  const load = () => (window.fpLoadPets ? window.fpLoadPets() : Promise.reject(new Error('pets')));
  const TXT = {
    de: { steps: ['Ei', 'Baby', 'Jungtier', 'Gross', 'Endform', 'Schein', 'Legende'], egg: 'Dein Ei', active: 'aktiv', pts: 'Punkte', coins: 'Münzen',
      who: 'Wessen Tierchen?', off: 'Tierchen aus', tabs: { garten: 'Garten', tier: 'Aktuelles Tierchen', inv: 'Inventar', samm: 'Sammlung', stat: 'Statistik' },
      dev: 'Entwicklung', hatchT: 'Ei ausbrüten', evolve: 'Entwickeln', hatch: 'Schlüpfen lassen', spend: 'Punkte einsetzen', tree: '🌿 Entwicklungsbaum',
      full: 'voll', noPts: 'keine Punkte', ready: 'Bereit!', grown: 'Ganz ausgewachsen 👑', left: 'noch {n}', care: 'Pflegen & spielen', careH: 'antippen · Spielsachen bleiben',
      nothing: 'Nichts mehr da – erledige Ämtli oder dreh am Glücksrad.', eggHint: 'Setze Punkte ein – bei {n} schlüpft dein Ei.', careThis: 'Dieses jetzt pflegen', name: 'Name geben', save: 'Speichern', back: 'Zurück',
      backColl: 'Zurück zur Sammlung', nameHint: 'z. B. Flocke', otherP: 'Andere Person', settings: 'Tierchen-Einstellungen',
      offInfo: 'Wer keine Tierchen möchte, kann sie ausschalten. Ämtli zählen weiter für Belohnungen, nur Tierchen-Punkte gibt es dann keine. Nichts geht verloren – Tierchen, Inventar und Punkte bleiben gespeichert.',
      offBtn: 'Tierchen ausschalten …', sure: 'Wirklich ausschalten?', cancel: 'Abbrechen', yesOff: 'Ja, ausschalten', offH: 'Tierchen sind ausgeschaltet',
      offP1: 'Deine Ämtli zählen ganz normal für Belohnungen – nur Tierchen-Punkte sammelst du keine.', offP2: 'Nichts geht verloren: Tierchen, Inventar und Punkte (⭐ {n}) bleiben gespeichert.', onBtn: 'Tierchen wieder einschalten',
      garden: 'Hier wohnen deine Tierchen – derselbe Garten wie oben im Banner. Sie klettern, verstecken sich und gehen baden.', gardenEmpty: 'Der Garten ist noch leer – sobald dein Ei geschlüpft ist, zieht dein Tierchen hier ein.',
      collected: 'Gesammelt {a} von {b} · Endformen {c} · Fabelwesen {d} von {e}', unknown: 'Noch nicht entdeckt · {n}', wheelOnly: '🔒 Glücksrad', line: 'Linie', special: 'Spezial', eats: 'Frisst', likes: 'Mag', together: 'Zusammen', days: '{n} Tage',
      noneYet: 'Noch keines – brüte dein Ei mit Punkten aus.', inv: { care: 'Füttern & pflegen', toys: 'Spielsachen (bleiben)', pills: 'Pillen fürs Wachsen', sleep: 'Schlafen & Garten', art: 'Artefakte' }, useAt: 'Benutzen bei Aktuelles Tierchen',
      kpi: { pets: 'Tierchen gesammelt', endf: 'Endformen', evos: 'Entwicklungen', days: 'Tage mit {n}', fed: 'Mal gefüttert', spins: 'Mal Glücksrad' },
      wheel: 'Glücksrad', spin: 'Drehen!', spun: 'Heute schon gedreht – wieder ab Mitternacht', won: 'Gewonnen!', inInv: '📦 Liegt jetzt in deinem Inventar.', daily: 'Dazu: Futter und Wasser für deine Tierchen.',
      chooseWay: 'Entwickeln – wähle den Weg', ways: 'Dein Tierchen ist bereit! Wähle einen von {n} Wegen. Das kann man nicht rückgängig machen.', oneWay: 'Dein Tierchen ist bereit! Hier gibt es nur einen Weg.', pick: 'Ja, {n} wählen!',
      hatching: 'Dein Ei schlüpft!', hatchOk: 'Super!', sleeps: '{n} schläft und tankt Energie (bis {t} Uhr).', naps: '{n} macht ein Nickerchen und tankt Energie (bis {t}). Mit einem Energydrink ist es sofort wach.', newEgg: 'Neues Ei!', eggWaits: 'Du hast ein Ei – jetzt ausbrüten', newThing: 'Neu:', hatched: '{n}! Es wohnt jetzt in deinem Garten.', foggy: '🌫️ Was nach {n} kommt, bleibt geheim – grün ist dein Weg bis jetzt.', nowLooks: 'So sieht es jetzt aus',
      prize: { grow: ['Wachstumspille', 'Für ein Tierchen deiner Wahl.'], extra: ['Haustier-Extra', 'Leckerli, Spielzeug, Energydrink, Happy-Pille …'], food: ['Futterpaket', '3 Futter und 3 Wasser.'], pts: ['+30 Punkte', 'Direkt zu deinen Tierchen-Punkten.'], egg: ['Ein neues Ei!', 'Es liegt jetzt in deiner Sammlung – setze Punkte ein, dann schlüpft es.'], eggPill: ['Grosse Wachstumspille', 'Ein Ei wartet schon – darum gibt es diesmal eine grosse Wachstumspille.'],
        dev: ['Entwicklungs-Pille', 'Bringt ein Tierchen sofort eine ganze Stufe weiter.'], again: ['Nochmals drehen!', 'Du darfst gleich noch einmal.'], star: ['Sternfeld', 'Fabelwesen-Ei, Artefakt oder Jackpot +100.'],
        fabel_egg: ['Fabelwesen-Ei!', 'Ein ganz besonderes Ei liegt jetzt in deiner Sammlung.'], artefact: ['Artefakt!', 'Etwas Seltenes für deine Tierchen.'], jackpot: ['Jackpot +100 Punkte', 'Direkt zu deinen Tierchen-Punkten.'] },
      artfx: { colour: 'Farbe:', normal: 'Normal', regenbogen: '🌈 Regenbogen', kristall: '💎 Kristall', aura: 'Sternen-Aura:', on: 'an', off: 'aus', sight: 'Weitblick: Der ganze Baum ist sichtbar – für immer.' },
      info: { what: 'Was ist das?', eff: 'Wirkung', how: 'So setzt du es ein', from: 'Woher bekommst du es?', have: 'Du hast', of: 'von höchstens', demo: '▶ Vorschau', useNow: 'Jetzt einsetzen', pick: 'Welches Tier soll aus deinem Ei schlüpfen?', wished: 'Dein Ei mit {n} liegt bereit – setze Punkte ein, dann schlüpft es.', sightOn: 'Weitblick aktiv: Der ganze Entwicklungsbaum ist bis {n} Uhr sichtbar.', noEgg: 'Dafür brauchst du ein Ei, das noch nicht geschlüpft ist.', yes: 'Ja, einsetzen', forWhom: 'Für welches Tierchen?', sure: 'Wirklich für {n} einsetzen?', sureWish: 'Wirklich ein Ei mit {n}?', ownHint: '✓ = hast du schon', fable: 'Fabelwesen', stays: 'bleibt im Inventar', usedUp: 'wird verbraucht', forGood: 'wirkt für immer', favs: 'Lieblingsessen deiner Tierchen – Futter passt immer, du musst nichts aussuchen:', tired: 'Zum Spielen braucht dein Tierchen mindestens 20 % Energie. Ist es schon ganz fröhlich, passiert nichts.', onlyNeed: 'Braucht dein Tierchen es gerade nicht, wird nichts verbraucht.', noFit: 'Keines deiner Tierchen kann das gerade brauchen.', pv: { star: 'Balken voll + Sternen-Aura!', colour: 'Neue Farbe – für immer!', sight: 'Ganzer Baum sichtbar – für immer!', wish: 'Wunsch-Ei!' }, noPet: 'Dafür brauchst du ein geschlüpftes Tierchen.', tapHint: 'Tippe auf ein Ding für eine Erklärung.',
        s1: 'Tierchen-Seite', s2: 'Aktuelles Tierchen', s3care: 'Pflegen & spielen: antippen', s3pill: 'Entwicklung: Pille antippen', s3art: 'Tierchen wählen & bestätigen', s3wish: 'Tier wählen & bestätigen', tapIt: 'Ding antippen',
        x: {
          futter: ['Das Lieblingsessen deines Tierchens – jedes Tier hat sein eigenes.', 'Hunger +35', 'Bei Ämtli (abwechselnd mit Wasser), jeden Tag 2 vom Glücksrad, Futterpaket'],
          wasser: ['Frisches Wasser zum Trinken.', 'Durst +40', 'Bei Ämtli (abwechselnd mit Futter), jeden Tag 2 vom Glücksrad, Futterpaket'],
          keks: ['Ein kleines Leckerli zwischendurch.', 'Laune +20', 'Glücksrad: Haustier-Extra'],
          energy: ['Ein Energydrink, wenn dein Tierchen tagsüber müde ist. Nachts (21–7 Uhr) schläft es, und wird es tagsüber müde, macht es von selbst ein Nickerchen von etwa einer Stunde.', 'Energie voll', 'Glücksrad: Haustier-Extra'],
          seife: ['Seife für ein Schaumbad.', 'Laune +10', 'Glücksrad: Haustier-Extra'],
          happy: ['Macht dein Tierchen sofort wieder fröhlich.', 'Laune voll', 'Manchmal bei Ämtli, Glücksrad: Haustier-Extra'],
          ball: ['Ein Ball zum Spielen. Spielsachen bleiben – du kannst sie immer wieder benutzen.', 'Laune +20, Energie −10', 'Glücksrad: Haustier-Extra'],
          wolle: ['Ein Wollknäuel zum Spielen. Bleibt in deinem Inventar.', 'Laune +20, Energie −10', 'Glücksrad: Haustier-Extra'],
          blasen: ['Seifenblasen zum Fangen. Bleiben in deinem Inventar.', 'Laune +20, Energie −10', 'Glücksrad: Haustier-Extra'],
          buerste: ['Eine weiche Bürste fürs Fell. Bleibt in deinem Inventar.', 'Laune +15', 'Glücksrad: Haustier-Extra'],
          wachs_s: ['Eine kleine Wachstumspille.', '+15 Wachstum', 'Manchmal bei Ämtli, Glücksrad: Wachstumspille'],
          wachs_m: ['Eine mittlere Wachstumspille.', '+30 Wachstum', 'Manchmal bei Ämtli, Glücksrad: Wachstumspille'],
          wachs_l: ['Eine grosse Wachstumspille.', '+60 Wachstum', 'Bei grossen Ämtli, Glücksrad: Wachstumspille oder Ei-Feld'],
          glitzerpille: ['Die Entwicklungs-Pille füllt den Balken sofort – danach tippst du auf Entwickeln.', 'Ganze Stufe', 'Glücksrad (spätestens nach 24 Drehs), selten bei Ämtli'],
          kissen: ['Ein Sternkissen für ein Nickerchen am Tag. Bleibt in deinem Inventar. Nachts (21–7 Uhr) schläft dein Tierchen sowieso, und wird es müde, macht es von selbst ein Nickerchen.', 'Energie +40', 'Glücksrad: Haustier-Extra'],
          laterne: ['Eine Laterne für gemütliches Licht. Bleibt in deinem Inventar.', 'Laune +15', 'Glücksrad: Haustier-Extra'],
          sternenstein: ['Ein Stein voller Sternenstaub: Der Balken ist sofort voll, und dein Tierchen bekommt für immer eine Sternen-Aura (im Entwicklungsbaum ein- und ausschaltbar).', 'Ganze Stufe + Sternen-Aura', 'Glücksrad: Sternfeld (Artefakt), manche Level'],
          weitblick: ['Mit dem Weitblick-Kristall siehst du den ganzen Entwicklungsbaum eines Tierchens – für immer, auch die geheimen Formen.', 'Ganzer Baum, für immer', 'Glücksrad: Sternfeld (Artefakt), manche Level'],
          zauberspiegel: ['Ein Zauberspiegel schenkt deinem Tierchen für immer die glitzernde Kristall-Farbe – im Entwicklungsbaum ein- und ausschaltbar.', 'Kristall-Farbe', 'Glücksrad: Sternfeld (Artefakt), manche Level'],
          traumkristall: ['Der Traumkristall erfüllt einen Wunsch: Du suchst ein Tier aus und bekommst sofort sein Ei.', 'Wunsch-Ei', 'Glücksrad: Sternfeld (Artefakt), manche Level'],
          regenbogenfeder: ['Eine Regenbogenfeder schenkt deinem Tierchen für immer die Regenbogen-Farbe – im Entwicklungsbaum ein- und ausschaltbar.', 'Regenbogen-Farbe', 'Glücksrad: Sternfeld (Artefakt), manche Level'] } },
      err: { not_needed: 'Das braucht dein Tierchen gerade nicht – es bleibt in deinem Inventar.', no_item: 'Davon hast du gerade nichts.', too_tired: 'Zu müde zum Spielen – gib zuerst einen Energydrink.', not_egg: 'Das geht nur mit einem Ei, das noch nicht geschlüpft ist.', bad_wish: 'Dieses Tier geht hier nicht – wähle ein anderes.', fully_grown: 'Dein Tierchen ist schon ganz gross.', egg: 'Zuerst muss dein Ei schlüpfen.', bar_full: 'Der Balken ist schon voll – jetzt entwickeln!',
        fully_grown: 'Schon ganz ausgewachsen.', no_points: 'Keine Punkte – erledige Ämtli.', not_ready: 'Noch nicht bereit.', egg: 'Ein Ei braucht noch keine Pflege.', spun: 'Heute schon gedreht.', off: 'Tierchen sind ausgeschaltet.', x: 'Hat nicht geklappt.' },
      it: { futter: 'Futter', wasser: 'Wasser', keks: 'Leckerli', energy: 'Energydrink', seife: 'Seife', happy: 'Happy-Pille', ball: 'Ball', wolle: 'Wollknäuel', blasen: 'Seifenblasen', buerste: 'Bürste', wachs_s: 'Pille S', wachs_m: 'Pille M', wachs_l: 'Pille L',
        glitzerpille: 'Entwicklungs-Pille', kissen: 'Sternkissen', laterne: 'Laterne', sternenstein: 'Sternenstein', weitblick: 'Weitblick-Kristall', zauberspiegel: 'Zauberspiegel', traumkristall: 'Traumkristall', regenbogenfeder: 'Regenbogenfeder' } },
    en: { steps: ['Egg', 'Baby', 'Young', 'Grown', 'Final form', 'Glow', 'Legend'], egg: 'Your egg', active: 'active', pts: 'points', coins: 'coins',
      who: 'Whose pets?', off: 'Pets off', tabs: { garten: 'Garden', tier: 'Current pet', inv: 'Inventory', samm: 'Collection', stat: 'Statistics' },
      dev: 'Growing', hatchT: 'Hatch the egg', evolve: 'Evolve', hatch: 'Hatch', spend: 'Use points', tree: '🌿 Evolution tree',
      full: 'full', noPts: 'no points', ready: 'Ready!', grown: 'Fully grown 👑', left: '{n} to go', care: 'Care & play', careH: 'tap · toys stay',
      nothing: 'Nothing left – do chores or spin the wheel.', eggHint: 'Use points – at {n} your egg hatches.', careThis: 'Care for this one now', name: 'Give a name', save: 'Save', back: 'Back',
      backColl: 'Back to the collection', nameHint: 'e.g. Fluffy', otherP: 'Other person', settings: 'Pet settings',
      offInfo: 'Anyone who does not want pets can switch them off. Chores still count for rewards, there are just no pet points. Nothing is lost – pets, inventory and points are kept.',
      offBtn: 'Switch pets off …', sure: 'Really switch off?', cancel: 'Cancel', yesOff: 'Yes, switch off', offH: 'Pets are switched off',
      offP1: 'Your chores count for rewards as usual – you just collect no pet points.', offP2: 'Nothing is lost: pets, inventory and points (⭐ {n}) are kept.', onBtn: 'Switch pets on again',
      garden: 'Your pets live here – the same garden as in the banner. They climb, hide and go for a swim.', gardenEmpty: 'The garden is still empty – once your egg hatches, your pet moves in.',
      collected: 'Collected {a} of {b} · final forms {c} · fable creatures {d} of {e}', unknown: 'Not discovered yet · {n}', wheelOnly: '🔒 Wheel', line: 'Line', special: 'Special', eats: 'Eats', likes: 'Likes', together: 'Together', days: '{n} days',
      noneYet: 'None yet – hatch your egg with points.', inv: { care: 'Food & care', toys: 'Toys (they stay)', pills: 'Growth pills', sleep: 'Sleep & garden', art: 'Artefacts' }, useAt: 'Use under Current pet',
      kpi: { pets: 'Pets collected', endf: 'Final forms', evos: 'Evolutions', days: 'Days with {n}', fed: 'Times fed', spins: 'Wheel spins' },
      wheel: 'Wheel', spin: 'Spin!', spun: 'Already spun today – again after midnight', won: 'You won!', inInv: '📦 It is in your inventory now.', daily: 'Plus: food and water for your pets.',
      chooseWay: 'Evolve – choose the way', ways: 'Your pet is ready! Choose one of {n} ways. This cannot be undone.', oneWay: 'Your pet is ready! There is only one way here.', pick: 'Yes, choose {n}!',
      hatching: 'Your egg hatches!', hatchOk: 'Great!', sleeps: '{n} is asleep and fills up energy (until {t}:00).', naps: '{n} takes a nap and fills up energy (until {t}). An energy drink wakes it at once.', newEgg: 'New egg!', eggWaits: 'You have an egg – hatch it now', newThing: 'New:', hatched: 'A {n}! It lives in your garden now.', foggy: '🌫️ What comes after {n} stays secret – green is your way so far.', nowLooks: 'This is how it looks now',
      prize: { grow: ['Growth pill', 'For a pet of your choice.'], extra: ['Pet extra', 'Treat, toy, energy drink, happy pill …'], food: ['Food pack', '3 food and 3 water.'], pts: ['+30 points', 'Straight to your pet points.'], egg: ['A new egg!', 'It is in your collection now – put points in and it hatches.'], eggPill: ['Big growth pill', 'An egg is already waiting – so this time you get a big growth pill.'],
        dev: ['Evolution pill', 'Takes a pet a whole step further at once.'], again: ['Spin again!', 'You may spin once more.'], star: ['Star field', 'Fable egg, artefact or jackpot +100.'],
        fabel_egg: ['Fable egg!', 'A very special egg is in your collection now.'], artefact: ['Artefact!', 'Something rare for your pets.'], jackpot: ['Jackpot +100 points', 'Straight to your pet points.'] },
      artfx: { colour: 'Colour:', normal: 'Normal', regenbogen: '🌈 Rainbow', kristall: '💎 Crystal', aura: 'Star aura:', on: 'on', off: 'off', sight: 'Far-sight: the whole tree is visible – for good.' },
      info: { what: 'What is it?', eff: 'Effect', how: 'How to use it', from: 'Where do you get it?', have: 'You have', of: 'of at most', demo: '▶ Preview', useNow: 'Use now', pick: 'Which animal should hatch from your egg?', wished: 'Your egg with {n} is ready – put points in and it hatches.', sightOn: 'Far-sight active: the whole evolution tree is visible until {n}.', noEgg: 'You need an egg that has not hatched yet.', yes: 'Yes, use it', forWhom: 'For which pet?', sure: 'Really use it for {n}?', sureWish: 'Really an egg with {n}?', ownHint: '✓ = you have it', fable: 'Fable creatures', stays: 'stays in your inventory', usedUp: 'is used up', forGood: 'works for good', favs: 'Favourite food of your pets – food always fits, nothing to choose:', tired: 'To play, your pet needs at least 20 % energy. If it is already very happy, nothing happens.', onlyNeed: 'If your pet does not need it right now, nothing is used up.', noFit: 'None of your pets can use that right now.', pv: { star: 'Bar full + star aura!', colour: 'New colour – for good!', sight: 'Whole tree visible – for good!', wish: 'Wish egg!' }, noPet: 'You need a hatched pet for this.', tapHint: 'Tap a thing for an explanation.',
        s1: 'Pets page', s2: 'Current pet', s3care: 'Care & play: tap it', s3pill: 'Growth: tap the pill', s3art: 'Pick a pet & confirm', s3wish: 'Pick an animal & confirm', tapIt: 'Tap the thing',
        x: {
          futter: ['Your pet\'s favourite food – every animal has its own.', 'Hunger +35', 'With chores (taking turns with water), 2 a day from the wheel, food pack'],
          wasser: ['Fresh water to drink.', 'Thirst +40', 'With chores (taking turns with food), 2 a day from the wheel, food pack'],
          keks: ['A little treat.', 'Mood +20', 'Wheel: pet extra'],
          energy: ['An energy drink when your pet is tired during the day. At night (9 pm–7 am) it sleeps, and when it gets tired by day it takes a nap of about an hour by itself.', 'Energy full', 'Wheel: pet extra'],
          seife: ['Soap for a bubble bath.', 'Mood +10', 'Wheel: pet extra'],
          happy: ['Makes your pet happy again right away.', 'Mood full', 'Sometimes with chores, wheel: pet extra'],
          ball: ['A ball to play with. Toys stay – you can use them again and again.', 'Mood +20, energy −10', 'Wheel: pet extra'],
          wolle: ['A wool ball to play with. It stays in your inventory.', 'Mood +20, energy −10', 'Wheel: pet extra'],
          blasen: ['Bubbles to catch. They stay in your inventory.', 'Mood +20, energy −10', 'Wheel: pet extra'],
          buerste: ['A soft brush for the fur. It stays in your inventory.', 'Mood +15', 'Wheel: pet extra'],
          wachs_s: ['A small growth pill.', '+15 growth', 'Sometimes with chores, wheel: growth pill'],
          wachs_m: ['A medium growth pill.', '+30 growth', 'Sometimes with chores, wheel: growth pill'],
          wachs_l: ['A big growth pill.', '+60 growth', 'With big chores, wheel: growth pill or egg field'],
          glitzerpille: ['The evolution pill fills the bar at once – then tap Evolve.', 'Whole step', 'Wheel (after 24 spins at the latest), rarely with chores'],
          kissen: ['A star pillow for a nap during the day. It stays in your inventory. At night (9 pm–7 am) your pet sleeps anyway, and when it gets tired it takes a nap by itself.', 'Energy +40', 'Wheel: pet extra'],
          laterne: ['A lantern for a cosy light. It stays in your inventory.', 'Mood +15', 'Wheel: pet extra'],
          sternenstein: ['A stone full of stardust: the bar is full at once and your pet gets a star aura for good (switch it on and off in the evolution tree).', 'Whole step + star aura', 'Wheel: star field (artefact), some levels'],
          weitblick: ['With the far-sight crystal you see the whole evolution tree of one pet – for good, even the secret forms.', 'Whole tree, for good', 'Wheel: star field (artefact), some levels'],
          zauberspiegel: ['A magic mirror gives your pet the sparkling crystal colour for good – switch it on and off in the evolution tree.', 'Crystal colour', 'Wheel: star field (artefact), some levels'],
          traumkristall: ['The dream crystal grants a wish: pick an animal and get its egg right away.', 'Wish egg', 'Wheel: star field (artefact), some levels'],
          regenbogenfeder: ['A rainbow feather gives your pet the rainbow colour for good – switch it on and off in the evolution tree.', 'Rainbow colour', 'Wheel: star field (artefact), some levels'] } },
      err: { not_needed: 'Your pet does not need that right now – it stays in your inventory.', no_item: 'You have none of that right now.', too_tired: 'Too tired to play – give an energy drink first.', not_egg: 'This only works with an egg that has not hatched yet.', bad_wish: 'This animal does not work here – pick another one.', fully_grown: 'Your pet is fully grown.', egg: 'Your egg has to hatch first.', bar_full: 'The bar is full – evolve now!',
        fully_grown: 'Already fully grown.', no_points: 'No points – do chores.', not_ready: 'Not ready yet.', egg: 'An egg needs no care yet.', spun: 'Already spun today.', off: 'Pets are switched off.', x: 'That did not work.' },
      it: { futter: 'Food', wasser: 'Water', keks: 'Treat', energy: 'Energy drink', seife: 'Soap', happy: 'Happy pill', ball: 'Ball', wolle: 'Wool ball', blasen: 'Bubbles', buerste: 'Brush', wachs_s: 'Pill S', wachs_m: 'Pill M', wachs_l: 'Pill L',
        glitzerpille: 'Evolution pill', kissen: 'Star pillow', laterne: 'Lantern', sternenstein: 'Star stone', weitblick: 'Far-sight crystal', zauberspiegel: 'Magic mirror', traumkristall: 'Dream crystal', regenbogenfeder: 'Rainbow feather' } },
  };
  const T = (snap) => TXT[(snap && snap.lang) === 'en' ? 'en' : 'de'];
  const fmt = (s, o) => String(s).replace(/\{(\w)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const ST = ['ei', 'baby', 'jung', 'gross', 'gross', 'gross', 'gross'];
  const NEED = { hunger: ['🍎', '#7CD06A'], durst: ['💧', '#5ec3ec'], energie: ['⚡', '#FFD34D'], laune: ['😊', '#FF8FC8'] };
  const EFF = { futter: [['hunger', '+35']], wasser: [['durst', '+40']], keks: [['laune', '+20']], energy: [['energie', 'voll']], seife: [['laune', '+10']], happy: [['laune', 'voll']],
    ball: [['laune', '+20'], ['energie', '−10']], wolle: [['laune', '+20'], ['energie', '−10']], blasen: [['laune', '+20'], ['energie', '−10']], buerste: [['laune', '+15']] };
  const ANIM = { futter: 'futter', wasser: 'trinken', keks: 'leckerli', energy: 'energy', seife: 'baden', happy: 'happy', ball: 'ball', wolle: 'ball', blasen: 'ball', buerste: 'buerste', kissen: 'schlafen', laterne: 'laterne', glitzerpille: 'entwpille', wachs_s: 'wachs_s', wachs_m: 'wachs_m', wachs_l: 'wachs_l', sternenstein: 'sternenstein', regenbogenfeder: 'regenbogenfeder', zauberspiegel: 'zauberspiegel', weitblick: 'weitblick', traumkristall: 'traumkristall' };
  const CAPS = { futter: 30, wasser: 30, keks: 20, energy: 10, seife: 10, happy: 10, wachs_s: 20, wachs_m: 20, wachs_l: 20, glitzerpille: 5 };
  const STAYS = ['ball', 'wolle', 'blasen', 'buerste', 'kissen', 'laterne'];
  const playOn = async (care, k, msg) => {
    if (!care) return; care.busy = false;
    if (k === 'laterne') { try { await care.item('laterne', [50, 40]); } catch (e) { /* no item animation */ } care.sparkle(10, '✨'); care.draw('freut'); care.msg(msg || '+15 😊'); return; }
    if (ANIM[k]) care.run(ANIM[k]);
  };
  const ARTS = ['sternenstein', 'weitblick', 'zauberspiegel', 'traumkristall', 'regenbogenfeder'];
  const KIND_OF = (k) => (CARE_ITEMS.includes(k) || TOYS.includes(k) || k === 'kissen' || k === 'laterne' ? 'care' : k.startsWith('wachs') || k === DEV ? 'pill' : 'art');
  const CARE_ITEMS = ['futter', 'wasser', 'keks', 'energy', 'seife', 'happy'];
  const TOYS = ['ball', 'buerste', 'wolle', 'blasen'];
  const PILLS = [['wachs_s', 15], ['wachs_m', 30], ['wachs_l', 60]];
  const DEV = 'glitzerpille';
  const THC = { feuer: '#FF8A3D', schnee: '#9fe6ff', nacht: '#B58CFF', wald: '#7CD06A', suess: '#FF8FC8', himmel: '#FFE27A', wasser: '#5ec3ec' };
  const FIELD_LOOK = { grow: ['grow', '#69C350'], extra: ['pet', '#3FA66B'], food: ['food', '#E0A84F'], pts: ['coin', '#F5C542'], egg: ['egg', '#E8C77A'], dev: ['devpill', '#8C5CE0'], again: ['again', '#4FA3E0'], star: ['star', '#FFC21A'] };

  // ------------------------------------------------------------- helpers (need the graphics file)
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const starters = () => L().P4.LIST.map((x) => x[0]).filter((k) => !L().TREE.FABEL.includes(k));
  const eggKind = (id, p) => (p.fabel ? L().TREE.FABEL[hash(id) % L().TREE.FABEL.length] : starters()[hash(id) % starters().length]);
  const kindName = (k) => (L().P4.LIST.find((x) => x[0] === k) || [])[1] || k || '';
  const kindOf = (p) => (p.step >= 4 && p.name ? p.name : kindName(p.kind));
  const titleOf = (p, t) => (p.step === 0 ? t.egg : p.nick || kindOf(p));
  // what is drawn: the look from the tree plus the artefact effects that are switched on (they survive every evolution)
  const lookOf = (p) => { const a = (p && p.art) || {}; return { ...((p && p.look) || {}), ...(a.skin ? { skin: a.skin } : {}), ...(a.aura_on ? { aura: 'sterne' } : {}) }; };
  const svgOf = (id, p, mood) => (p.step === 0 ? L().P4.egg(p.kind || eggKind(id, p)) : L().P4.svg(p.kind, ST[p.step], mood || 'froh', { noShadow: 1, ...lookOf(p) }));
  const themeOf = (p) => (p.look && p.look.theme) || L().TREE.TH[p.kind] || 'wald';
  const colOf = (p, fb) => (p.step ? THC[themeOf(p)] || '#FFE27A' : fb);
  const pctOf = (p, steps) => { if (p.need == null) return 100; const base = steps[p.step] || 0; return Math.max(0, Math.min(100, Math.round((p.g - base) / Math.max(1, p.need - base) * 100))); };
  const errMsg = (t, e) => t.err[String((e && e.code) || '').replace(/^pet_/, '')] || t.err.x;
  const call = (store, pid, action, extra) => store.ws('family_planer/pet', { person_id: pid, action, ...(extra || {}) });
  const person = (snap, pid) => (snap.persons || []).find((p) => p.id === pid) || {};
  const avatar = (pr, size) => { const fx = window.FPX || window.FPX_EN; return fx && fx.avatarHtml ? fx.avatarHtml({ name: pr.name, farbe: pr.color, bild: pr.image }, size) : ''; };
  const pcol = (pr) => (/^#[0-9a-f]{6}$/i.test(pr.color || '') ? pr.color : '#69C350');
  const enabled = (snap) => !!(snap && snap.pets_cfg && snap.pets_cfg.enabled);
  const toast = (host, text) => { const d = document.createElement('div'); d.className = 'pptoast'; d.textContent = text; host.appendChild(d); setTimeout(() => d.remove(), 2800); };

  // ------------------------------------------------------------- a popup (own shadow root on the body, closes on ✕ or outside)
  const MODAL_CSS = `.care .pet{max-width:var(--petmax,200px)}/* info window of an inventory thing */.box:has(.info2){max-width:880px;width:94vw}.info2{display:grid;grid-template-columns:1.15fr 1fr;gap:16px;align-items:start}.info2 .il .isec:first-of-type{margin-top:4px}@media (max-width:700px){.info2{grid-template-columns:1fr}}.ir{display:flex;flex-direction:column;gap:8px}.ir .demo{margin-top:0;height:210px}.ir .demo .cbox3{height:210px}.pick h4{margin:2px 0 6px;font:700 10.5px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#9aa3b2}.whom{display:flex;flex-wrap:wrap;gap:6px}.whom button,.wish button{background:#232833;border:2px solid #2f3541;border-radius:10px;padding:4px 6px;color:#eef1f5;font:600 11px system-ui;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:74px}.whom button svg{width:52px;height:52px}.whom button.on,.wish button.on{border-color:var(--ic,#69C350);background:color-mix(in srgb,var(--ic,#69C350) 18%,#232833)}.info2.picking{grid-template-columns:1fr}.info2.picking .il{display:none}.info2.picking .ir .demo{display:none}.pick .conf{position:sticky;bottom:0;z-index:2;display:flex;align-items:center;gap:12px;box-shadow:0 -8px 18px rgba(0,0,0,.45)}.pick .conf p{flex:1;margin:0}.pick .conf .cv{width:54px;height:54px;flex:none}.pick .conf .cv svg{width:100%;height:100%;transform:scale(1.35)}.keep{font:600 11.5px system-ui;color:#9aa3b2;margin-left:6px}.favs{margin:6px 0 0!important;font-size:12.5px!important;color:#b9c1cd!important}.favl{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.fav{display:inline-flex;align-items:center;gap:4px;background:#232833;border-radius:8px;padding:2px 8px 2px 4px;font-size:12.5px;color:#eef1f5}.fav svg{width:20px;height:20px}.pick .wish{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px;max-height:none;overflow:visible}.pick .wish button{position:relative;padding:6px 2px 4px;min-width:0}.pick .wish button svg{width:64px!important;height:64px!important;transform:scale(1.45);transform-origin:50% 60%;margin:4px 0 2px}.pick .wish button span{font-size:11.5px}.pick .wish .own{position:absolute;right:5px;top:3px;font-style:normal;color:#69C350;font-weight:900}.pick h4 small{font-weight:600;letter-spacing:0;text-transform:none;color:#7f8897;margin-left:6px}.box:has(.picking){max-height:92vh;overflow:auto}.conf{margin-top:8px;background:#232833;border:1px solid var(--ic,#69C350);border-radius:10px;padding:8px 10px}.conf p{margin:0 0 6px;font:600 14px system-ui;color:#eef1f5}.conf .irow{margin-top:0}.ib{display:flex;gap:14px;align-items:center;margin:2px 0 10px}.ib .ic{flex:none;width:76px;height:76px;border-radius:18px;background:color-mix(in srgb,var(--ic,#69C350) 18%,#1b1f27);display:flex;align-items:center;justify-content:center}.ib b{font:700 18px system-ui;display:block}.ib small{color:#9aa3b2;font-size:13px}
.isec{margin:8px 0 0}.isec h4{margin:0 0 4px;font:700 10.5px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#9aa3b2}.isec p{margin:0;font-size:14px;line-height:1.4;color:#eef1f5}.effp{display:inline-block;background:color-mix(in srgb,var(--ic,#69C350) 22%,transparent);color:#eef1f5;border-radius:8px;padding:3px 9px;font:700 13px system-ui}
.steps{display:flex;align-items:stretch;gap:6px;margin-top:4px}.steps .st{flex:1;background:#232833;border:1px solid #2f3541;border-radius:10px;padding:8px 6px;text-align:center;font-size:12px;color:#cfd6df;display:flex;flex-direction:column;align-items:center;gap:5px}.steps .st .n{font:700 11px system-ui;color:#10200c;background:var(--ic,#69C350);border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center}.steps .st .g{font-size:20px;height:26px;display:flex;align-items:center}.steps .ar{align-self:center;color:#5c6575;font-size:16px}
.demo{position:relative;margin-top:10px;height:240px;border-radius:12px;overflow:hidden}.demo .cbox3{width:100%;max-width:none;height:240px}.okb.green{background:#69C350;border-color:#69C350;color:#10200c}.dbtn{position:absolute;right:8px;bottom:8px;z-index:3}.irow{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}.ierr{color:#F5A3A3;font-size:13px;margin-top:8px;min-height:1em}
.wish{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px;max-height:260px;overflow:auto;margin-top:8px}.wish button{background:#232833;border:1px solid #2f3541;border-radius:10px;padding:6px 2px;color:#eef1f5;font:600 11px system-ui;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px}.wish button svg{width:48px;height:48px}
/* hatching and evolving: the same dark stage with a soft light as on the pet page */.spot2{background:radial-gradient(ellipse 40% 10% at 50% 93%,color-mix(in srgb,var(--tc) 40%,transparent),transparent 70%),radial-gradient(circle at 50% 52%,color-mix(in srgb,var(--tc) 12%,transparent),transparent 60%)!important}:host{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,10,.72);font-family:var(--fp-font,system-ui,sans-serif)}
    .box{position:relative;background:#171a20;color:#eef1f5;border:1px solid #2f3541;border-radius:16px;padding:16px;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 40px);overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)}
    .box::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--mc,#F5C542)}
    h3{margin:0 40px 10px 0;font-size:17px}.x{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:9px;border:1px solid #2f3541;background:#2c323d;color:#eef1f5;font-size:16px;cursor:pointer}
    .hint{color:#9aa3b2;font-size:13px}.okb{background:#2c323d;border:1px solid #2f3541;color:#eef1f5;border-radius:9px;padding:9px 16px;font:700 14px system-ui;cursor:pointer}.okb.go{background:#F5C542;border-color:#F5C542;color:#141414}
    .eopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:10px 0}.eo{display:flex;flex-direction:column;align-items:center;gap:2px;background:#1c2027;border:2px solid #2f3541;border-radius:12px;padding:8px;color:#eef1f5;cursor:pointer}
    .eo.on{border-color:var(--tc,#F5C542);box-shadow:0 0 0 3px color-mix(in srgb,var(--tc,#F5C542) 30%,transparent)}.eo svg{width:110px;height:110px;overflow:visible}.eo b{font-size:13px}.eo small{font-size:11px;color:#9aa3b2}
    .econf{display:flex;flex-direction:column;align-items:center;gap:10px}.cbox3{width:100%;max-width:320px;height:240px}
    .pz{display:grid;grid-template-columns:110px 1fr;gap:14px;align-items:center;background:#1c2027;border-radius:12px;padding:14px;box-shadow:inset 0 3px 0 var(--zc)}.pzp{display:flex;justify-content:center}
    .pz small{color:#F5C542;font:800 12px system-ui;text-transform:uppercase;letter-spacing:.08em}.pz b{display:block;font-size:20px;margin:2px 0}.pz p{margin:4px 0;font-size:13px;color:#c9ced6}
    .wheelbox{margin:0;background:none;padding:6px 0}.fogbar{font-size:12.5px;color:#cfd6df;margin-bottom:8px}`;
  const modal = (title, html, setup, color, opts) => {
    const o = opts || {}; const host = document.createElement('div'); const root = host.attachShadow({ mode: 'open' });
    // a pet in a window is never bigger than on the care page (measured there, 200 px if the page was not open)
    host.style.setProperty('--petmax', `${Math.round(window.__fpPetW || 200)}px`);
    if (o.solid) host.style.background = 'rgba(5,7,10,.97)';
    root.innerHTML = `<style>${MODAL_CSS}${L() ? L().P4.CSS + L().CARE.CSS + L().CSS : ''}</style><div class="box" style="--mc:${color || '#F5C542'}"><button class="x" aria-label="✕">✕</button><h3>${esc(title)}</h3>${html}</div>`;
    let shut = false; const close = () => { if (shut) return; shut = true; host.remove(); if (o.onClose) o.onClose(); };
    root.querySelector('.x').addEventListener('click', close);
    host.addEventListener('click', (e) => { if (e.composedPath()[0] === host) close(); });
    document.body.appendChild(host); if (setup) setup(root, close);
    return { root, close };
  };

  // ------------------------------------------------------------- the wheel: the server chooses the field, the wheel shows it
  const openWheel = async (store, pid) => {
    await load(); const snap = store.snap; const t = T(snap); const st = (snap.pets || {})[pid]; if (!st) return; const W = L().WHEEL;
    const fields = (snap.pets_cfg || {}).fields || []; const pr = person(snap, pid);
    const hub = String(pr.image || '').startsWith('av2:') && window.FPAV && window.FPAV.svg ? window.FPAV.svg(pr.image, pcol(pr)) : '';
    const svg = W.wheelSvg(hub, fields, fields.map((f) => (FIELD_LOOK[f] || ['star', '#888'])[1]), fields.map((f) => (FIELD_LOOK[f] || ['star'])[0]));
    modal(`🎡 ${t.wheel} · ${pr.name || ''}`, `<div class="wheelbox"><div class="wwrap">${W.ptrSvg}${svg}</div><button class="spin" ${st.spun ? 'disabled' : ''}>${st.spun ? t.spun : t.spin}</button><div class="res"></div></div>`, (root) => {
      const b = root.querySelector('.spin');
      b.addEventListener('click', async () => {
        b.disabled = true; let res;
        try { res = await call(store, pid, 'spin'); } catch (e) { root.querySelector('.res').textContent = errMsg(t, e); return; }
        await W.spin(root.querySelector('.wwrap'), fields.length, res.field);
        const key = res.star || (res.instead ? 'eggPill' : res.prize); const [title, what] = t.prize[key] || [key, '']; const it = (res.items || [])[0];
        const pic = it ? L().ICO.icoB(it, 96) : `<svg viewBox="0 0 24 24" width="96" height="96" style="color:#fff;background:${(FIELD_LOOK[res.prize] || ['', '#888'])[1]};border-radius:24px;padding:14px">${W.WICON[(FIELD_LOOK[res.prize] || ['star'])[0]] || ''}</svg>`;
        root.querySelector('.res').innerHTML = `<div class="pz" style="--zc:${(FIELD_LOOK[res.prize] || ['', '#F5C542'])[1]}"><div class="pzp">${pic}</div><div><small>${t.won}</small><b>${esc(it ? t.it[it] || title : title)}</b><p>${esc(what)}</p><p class="hint">${it ? t.inInv + ' ' : ''}${t.daily}</p></div></div>`;
        if (res.prize === 'again') { b.disabled = false; b.textContent = t.spin; } else b.textContent = t.spun;
      });
    }, '#FFC21A');
  };

  // ------------------------------------------------------------- evolving: up to three ways from the tree (the current form is found by its name)
  const evolveOpts = (p) => {
    const TR = L().TREE; const tr = TR.tree(p.kind);
    const find = (nd, f) => (f(nd) ? nd : (nd.kids || []).reduce((r, c) => r || find(c, f), null));
    const cur = (p.step >= 3 && p.name && find(tr, (nd) => nd.name === p.name)) || find(tr, (nd) => nd.st === ST[p.step]);
    return ((cur && cur.kids) || []).slice(0, 3).map((o) => ({ ...o, theme: o.theme || Object.keys(TR.WORD).find((th) => TR.WORD[th].some((w) => String(o.name || '').startsWith(w))) }));
  };
  const openEvolve = async (store, pid, id, after) => {
    await load(); const t = T(store.snap); const p = store.snap.pets[pid].pets[id]; const opts = evolveOpts(p); const TR = L().TREE;
    if (!opts.length) { after && after(); return; }
    modal(t.chooseWay, `<p class="hint">${opts.length > 1 ? fmt(t.ways, { n: opts.length }) : t.oneWay}</p><div class="eopts">${opts.map((o, i) => `<button class="eo" data-i="${i}" style="--tc:${THC[o.theme] || '#FFE27A'}">${L().P4.svg(p.kind, o.st, 'froh', { noShadow: 1, ...TR.look(o) })}<b>${esc(o.name)}</b>${o.theme ? `<small>${esc(TR.THEME_TXT[o.theme] || '')}</small>` : ''}</button>`).join('')}</div><div class="econf"></div>`, (root, close) => {
      root.querySelectorAll('.eo').forEach((b) => b.addEventListener('click', () => {
        const o = opts[+b.dataset.i]; root.querySelectorAll('.eo').forEach((x) => x.classList.toggle('on', x === b));
        const cf = root.querySelector('.econf'); cf.innerHTML = `<button class="okb go">${esc(fmt(t.pick, { n: o.name }))}</button><div class="cbox3 spot2" style="--tc:${THC[o.theme] || '#FFE27A'}"></div>`;
        cf.querySelector('.okb').addEventListener('click', async () => {
          const look = TR.look(o); cf.querySelector('.okb').remove();
          try { await call(store, pid, 'evolve', { pet: id, look, name: String(o.name || '').slice(0, 24) }); } catch (e) { cf.insertAdjacentText('afterbegin', errMsg(t, e)); return; }
          const cr = new (L().CARE.Care)(cf.querySelector('.cbox3'), p.kind, ST[p.step], { look: p.look || {}, noBars: 1 }); cr.evolve(o.st, look, `${o.name}!`);
          setTimeout(() => { close(); if (after) after(); }, 3400);
        });
      }));
    });
  };
  const openHatch = async (store, pid, id, after) => {
    await load(); const t = T(store.snap); const p = store.snap.pets[pid].pets[id];
    const pr = (store.snap.persons || []).find((x) => x.id === pid) || {};
    // the page and the banner behind wait until the window is closed – nobody sees the animal before it hatches
    window.__fpHatching = true;
    modal(t.hatching, `<div class="cbox3 spot2" style="margin:auto;--tc:${pcol(pr)}"></div><p class="hint" style="text-align:center;font-size:14px">…</p><div class="irow" style="justify-content:center"><button class="okb green" data-ok hidden>${esc(t.hatchOk)}</button></div>`, async (root, close) => {
      const box = root.querySelector('.cbox3'); new (L().CARE.Care)(box, p.kind || eggKind(id, p), 'ei', { noBars: 1 });
      // the server decides the animal first, so the right one comes out of the egg
      let res; try { res = await call(store, pid, 'hatch', { pet: id }); } catch (e) { root.querySelector('.hint').textContent = errMsg(t, e); return; }
      const cr = new (L().CARE.Care)(box, res.kind || p.kind || eggKind(id, p), 'ei', { noBars: 1 }); cr.run('schluepfen');
      root.querySelector('[data-ok]').addEventListener('click', close);
      setTimeout(() => { root.querySelector('.hint').textContent = fmt(t.hatched, { n: kindName(res.kind) }); root.querySelector('[data-ok]').hidden = false; }, 3200);
    }, null, { solid: true, onClose: () => { window.__fpHatching = false; if (after) after(); window.dispatchEvent(new Event('fp-hatched')); } });
  };

  // ------------------------------------------------------------- person card: pet bottom-right at the avatar (60 px), the plain wheel top-right
  const CARD_CSS = `.ring{overflow:visible}.fppet{position:absolute;right:-31px;bottom:-17px;width:60px;height:60px;padding:0;border:0;background:none;cursor:pointer;z-index:5}.fppet svg{width:100%;height:100%;overflow:visible}
    .fppet.egg svg{animation:fpwob 2.2s ease-in-out infinite;transform-origin:50% 90%}@keyframes fpwob{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-8deg)}84%{transform:rotate(7deg)}92%{transform:rotate(-3deg)}}
    .fppet .eggdot{position:absolute;left:-8px;top:-8px;font-style:normal;font-size:15px;animation:fpwob 2.2s ease-in-out infinite}
    .fppet .need{position:absolute;right:-6px;top:-6px;font-style:normal;font-size:12px;background:#fff;border-radius:10px;padding:1px 3px}
    .fpwh{position:absolute;right:12px;top:12px;width:34px;height:34px;padding:0;border:0;background:none;cursor:pointer;z-index:6}.fpwh svg{width:100%;height:100%}.fpwh.used svg{filter:grayscale(1) brightness(.75);opacity:.55}
    .lab.th.fphas .nm{padding-right:42px}@media (prefers-reduced-motion:reduce){.fppet.egg svg{animation:none}}`;
  let wheelIcon = '';
  // returns [pet button (goes into the avatar ring), wheel button (top right of the card head)]
  const headBits = (snap, pid) => {
    if (!enabled(snap) || !snap.pets || !snap.pets[pid] || !snap.pets[pid].on || !L()) return ['', ''];
    const st = snap.pets[pid]; const p = st.pets[st.active]; const t = T(snap);
    if (!wheelIcon) { const d = document.createElement('div'); d.innerHTML = L().WHEEL.knob('#888', true); const s = d.querySelector('svg'); wheelIcon = s ? s.outerHTML : '🎡'; }
    const hungry = p && p.step > 0 && p.v && p.v.hunger < 30;
    const waits = p && p.step > 0 && Object.values(st.pets).some((x) => x.step === 0);
    return [p ? `<button class="fppet${p.step === 0 ? ' egg' : ''}" data-fppet="${esc(pid)}" aria-label="${esc(titleOf(p, t))}">${svgOf(st.active, p)}${hungry ? '<i class="need">🍎</i>' : ''}${waits ? '<i class="eggdot">🥚</i>' : ''}</button>` : '',
      (snap.pets_cfg || {}).wheel ? `<button class="fpwh${st.spun ? ' used' : ''}" data-fpwheel="${esc(pid)}" aria-label="${t.wheel}">${wheelIcon}</button>` : ''];
  };

  // ------------------------------------------------------------- after a chore: what was earned rises slowly above it
  const RISE_CSS = '.fprise{position:fixed;z-index:9999;display:flex;align-items:center;gap:6px;background:#11141a;border:1px solid #3a404c;border-radius:16px;padding:2px 10px 2px 2px;pointer-events:none;white-space:nowrap;color:#fff;font:700 12px system-ui}.fprise .em{font-size:18px;padding:0 2px 0 6px}';
  const rise = (x, y, list) => {
    if (!document.getElementById('fprisecss')) { const s = document.createElement('style'); s.id = 'fprisecss'; s.textContent = RISE_CSS; document.head.appendChild(s); }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.forEach(([ic, text], n) => setTimeout(() => {
      const d = document.createElement('div'); d.className = 'fprise'; d.style.left = `${x}px`; d.style.top = `${y}px`;
      d.innerHTML = `${ic.startsWith('<') ? ic : `<span class="em">${esc(ic)}</span>`}<b>${esc(text)}</b>`; document.body.appendChild(d);
      if (reduce || !d.animate) { setTimeout(() => d.remove(), 2000); return; }
      // rises quickly (first ~40 %), then stays readable and drifts a little before it fades – same 4.2 s in total
      d.animate([{ transform: 'translate(-50%,0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-14px) scale(1.08)', opacity: 1, offset: 0.08 },
        { transform: 'translate(-50%,-62px) scale(1)', opacity: 1, offset: 0.4, easing: 'ease-out' }, { transform: 'translate(-50%,-72px)', opacity: 1, offset: 0.85 },
        { transform: 'translate(-50%,-84px)', opacity: 0 }], { duration: 4200, easing: 'linear' }).onfinish = () => d.remove();
    }, n * 900));
  };
  const lastTick = {}; const lastInv = {};
  const onTick = (snap, pid, x, y, pts, coinHtml) => {
    if (!(pts > 0)) return; const t = T(snap); const on = enabled(snap) && snap.pets && snap.pets[pid] && snap.pets[pid].on;
    lastTick[pid] = { x, y, at: Date.now() };
    rise(x, y, [[coinHtml || '🪙', `+${pts} ${t.coins}`], ...(on ? [['⭐', `+${pts} ${t.pts}`]] : [])]);
  };
  // found things (food, pills) arrive with the next update: shown at the chore that brought them
  const lastEggs = {}; const lastArts = {};
  const onSnap = (snap) => {
    if (!snap || !snap.pets) return; const t = T(snap);
    Object.entries(snap.pets).forEach(([pid, st]) => {
      // a new egg or a new artefact (wheel, level): say so, wherever the child is
      const eggs = Object.keys(st.pets).filter((k) => st.pets[k].step === 0); const arts = ARTS.filter((k) => st.inv[k]);
      const eb = lastEggs[pid]; const ab = lastArts[pid]; lastEggs[pid] = eggs; lastArts[pid] = arts;
      if (eb && ab && st.on && L() && !window.__fpHatching) {
        const news = [...eggs.filter((k) => !eb.includes(k)).map(() => ['🥚', t.newEgg]), ...arts.filter((k) => !ab.includes(k)).map((k) => [L().ICO.icoB(k, 24), `${t.newThing} ${t.it[k] || k}`])];
        const pr = (snap.persons || []).find((x) => x.id === pid);
        if (news.length) rise(window.innerWidth / 2, window.innerHeight * 0.4, news.map(([i, x]) => [i, pr ? `${pr.name}: ${x}` : x]));
      }
      const before = lastInv[pid]; lastInv[pid] = { ...st.inv }; const tk = lastTick[pid];
      if (!before || !tk || Date.now() - tk.at > 6000 || !L()) return;
      const got = Object.entries(st.inv).filter(([k, n]) => n > (before[k] || 0)).map(([k, n]) => [L().ICO.icoB(k, 24), `+${n - (before[k] || 0)} ${t.it[k] || k}`]);
      if (got.length) { delete lastTick[pid]; setTimeout(() => rise(tk.x, tk.y - 4, got), 1800); }
    });
  };

  // ------------------------------------------------------------- pets in the banner: a transparent pet layer laid exactly over the planer scene
  const SCN_CSS = '.fpscene,.fpscene.gwrap{background:none!important;border-radius:0!important}.fpscene .gscene{background:none!important}.fpscene .gdark,.fpscene .gwater{display:none}.fpscene{transition:opacity .4s}';
  const cropOf = (svg) => { const sr = svg.getBoundingClientRect(); const inv = svg.getScreenCTM().inverse(); const pt = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(inv); }; const a = pt(sr.left, sr.top); const b = pt(sr.right, sr.bottom); return [a.x, a.y, b.x, b.y]; };
  const bannerState = new WeakMap(); let bannerSheet = null;
  const bannerPets = (snap) => { const out = []; if (!enabled(snap) || !snap.pets) return out;
    (snap.persons || []).forEach((pr) => { const st = snap.pets[pr.id]; if (!st || !st.on) return; const order = [st.active, ...Object.keys(st.pets).filter((k) => k !== st.active)];
      order.forEach((id) => { const p = st.pets[id]; if (p && p.step > 0) out.push([p.kind, ST[p.step], lookOf(p)]); }); });
    return out.slice(0, 8); };
  // owner = the navigation card: the pet layer belongs to it and survives every redraw of the banner (pets keep walking)
  const banner = (bar, snap, owner) => {
    if (!bar || !owner || window.__fpHatching) return; if (!enabled(snap)) { const old = bannerState.get(owner); if (old) { old.host.remove(); bannerState.delete(owner); } return; }
    if (!L()) { load().then(() => banner(bar, snap, owner)).catch(() => {}); return; }
    const svg = bar.querySelector('.scn svg'); if (!svg || !svg.getScreenCTM()) return; const sr = svg.getBoundingClientRect(); if (!sr.width) return;
    const root = bar.getRootNode(); if (!bannerSheet) { bannerSheet = new CSSStyleSheet(); bannerSheet.replaceSync(L().P4.CSS + L().M.CSS + SCN_CSS); }
    if (root.adoptedStyleSheets && !root.adoptedStyleSheets.includes(bannerSheet)) root.adoptedStyleSheets = [...root.adoptedStyleSheets, bannerSheet];
    const want = bannerPets(snap); const wkey = JSON.stringify(want); const br = bar.getBoundingClientRect();
    const key = cropOf(svg).map((v) => Math.round(v)).join(',') + '|' + Math.round(sr.width);
    let s = bannerState.get(owner);
    if (!s || s.key !== key || s.wkey !== wkey) {
      if (s) s.host.remove();
      const host = document.createElement('div'); host.className = 'fpscene';
      host.style.cssText = `position:absolute;left:${sr.left - br.left}px;top:${sr.top - br.top}px;width:${sr.width}px;height:${sr.height}px;z-index:1;pointer-events:none;overflow:hidden`;
      bar.appendChild(host);
      const scene = new (L().M.Scene)(host, { geo: { ...L().HEADER.HEADER, draw: () => '' }, crop: cropOf(svg) }); scene.social = 0.4; try { scene.setPool(true); } catch (e) { /* no pool */ }
      want.forEach(([k, stg, look], n) => { const a = scene.add(k, stg, n % 2 ? 730 + Math.random() * 150 : 420 + Math.random() * 130, 104 + Math.random() * 8); if (look && Object.keys(look).length) { a.var = { ...look }; a.deco = [...(look.deco || [])]; a.key = ''; a.setView('front'); } });
      s = { host, scene, key, wkey, bar }; bannerState.set(owner, s);
      // a banner story plays: the pets step back behind it
      s.iv = setInterval(() => { if (!owner.isConnected) { clearInterval(s.iv); return; } const scn = s.bar.querySelector('.scn'); s.host.style.opacity = scn && scn.classList.contains('playing') ? '0' : '1'; }, 400);
    } else if (s.host.parentNode !== bar) bar.appendChild(s.host);
    s.bar = bar;
    bar.querySelectorAll(':scope > *:not(.fpscene):not(.scn)').forEach((c) => { if (getComputedStyle(c).position === 'static') c.style.position = 'relative'; if (!c.style.zIndex) c.style.zIndex = '2'; });
  };

  window.FPPET = { load, enabled, headBits, CARD_CSS, openWheel, onTick, onSnap, banner, rise, TXT };

  // ============================================================= the Tierchen page
  const PAGE_CSS = `:host{display:block}
    .card{position:relative;background:var(--fp-bg1,#171a20);border:1px solid var(--fp-line,#2f3541);border-radius:var(--fp-radius,16px);padding:14px 16px;color:var(--fp-text,#eef1f5);font-family:var(--fp-font,system-ui,sans-serif)}
    .card::before{content:"";position:absolute;left:18px;right:18px;top:-1px;height:3px;border-radius:3px;background:var(--fp-band,none);pointer-events:none}
    .tile{position:relative;background:var(--fp-bg2,#1c2027);border-radius:12px;padding:12px;margin:0 0 10px;box-shadow:inset 0 3px 0 var(--pc,#4a4f5a)}
    .hint{color:var(--fp-text2,#9aa3b2);font-size:13px;margin:6px 0 0}.sec{font:700 10.5px system-ui;letter-spacing:.08em;text-transform:uppercase;color:var(--fp-text2,#9aa3b2);margin:0 0 8px}
    button{font-family:inherit}.okb{background:var(--fp-bg3,#2c323d);border:1px solid var(--fp-line,#2f3541);color:var(--fp-text,#eef1f5);border-radius:9px;padding:8px 14px;font:700 13px system-ui;cursor:pointer}
    .okb.green{background:#69C350;border-color:#69C350;color:#10200c}
    h2{margin:2px 0 12px;font:700 19px system-ui}
    .av{position:relative;display:inline-block;width:64px;height:64px;flex:none}.av .ava{display:block;width:64px;height:64px;border-radius:50%;overflow:hidden}.av .ava>*{width:100%!important;height:100%!important}
    .av .pet{position:absolute;right:-31px;bottom:-17px;width:60px;height:60px}.av .pet svg{width:100%;height:100%;overflow:visible}
    .eggwait{display:flex;align-items:center;gap:12px;width:100%;margin:0 0 10px;padding:8px 14px;background:color-mix(in srgb,#F5C542 16%,var(--fp-bg2,#1b1f27));border:2px solid #F5C542;border-radius:14px;color:var(--fp-text,#eef1f5);font:700 15px system-ui;cursor:pointer;text-align:left}.eggwait .ew{width:44px;height:44px;flex:none}.eggwait .ew svg{width:100%;height:100%}.eggwait b{flex:1}.eggwait .go{font-size:22px;color:#F5C542}
    .axbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px;padding:8px 10px;background:var(--fp-bg2,#1b1f27);border:1px solid var(--fp-line,#2f3541);border-radius:12px}.axl{font:700 11px system-ui;color:var(--fp-text2,#9aa3b2);margin-left:6px}.axc{background:var(--fp-bg3,#2c323d);border:1px solid var(--fp-line,#2f3541);color:var(--fp-text,#eef1f5);border-radius:9px;padding:6px 10px;font:600 13px system-ui;cursor:pointer}.axc.on{background:#B58CFF;border-color:#B58CFF;color:#160c26}
    .who{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}
    .kid{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:12px 10px 10px;margin:0;cursor:pointer;border:0;color:inherit;font:inherit}
    .kid .nm{font:600 15px system-ui;margin-top:8px}.kid small{color:var(--fp-text2,#9aa3b2);font-size:12px;margin:2px 0 8px}
    .chip{display:inline-flex;align-items:center;gap:5px;background:var(--fp-bg3,#2c323d);border:1px solid var(--fp-line,#2f3541);border-radius:9px;padding:6px 10px;font-size:13px}.chip b{font-size:15px}
    .bar{display:flex;align-items:center;gap:10px;padding:10px 12px 12px}.bar .av{margin-right:22px}
    .sw{background:none;border:0;color:inherit;font:700 17px system-ui;padding:6px 8px;cursor:pointer;white-space:nowrap;max-width:170px;overflow:hidden;text-overflow:ellipsis}.sw span{color:var(--fp-text2,#9aa3b2);font-size:13px}
    .tabs{display:flex;gap:4px;background:var(--fp-bg1,#171a20);border-radius:12px;padding:4px;margin:0 auto 0 8px;flex-wrap:wrap}
    .tabs button{background:transparent;border:0;color:var(--fp-text2,#9aa3b2);border-radius:9px;padding:8px 13px;font:700 13.5px system-ui;cursor:pointer}.tabs button.on{background:var(--fp-bg3,#2c323d);color:var(--fp-text,#eef1f5)}
    .set{width:40px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--fp-bg3,#2c323d);border:1px solid var(--fp-line,#2f3541);color:var(--fp-text2,#9aa3b2);cursor:pointer}.set ha-icon{--mdc-icon-size:20px}
    .conf{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}.conf .yes{background:#5a2a2a;border-color:#a14a4a}
    .dev{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:10px;align-items:start}.dev.two{align-items:stretch}
    .big{display:flex;flex-direction:column;align-items:center;text-align:center}.big .top{align-self:stretch;display:flex;justify-content:space-between;align-items:center}
    .stg{font:800 11px system-ui;text-transform:uppercase;letter-spacing:.06em;background:color-mix(in srgb,var(--pc) 22%,#1c2027);color:var(--pc);border-radius:7px;padding:3px 8px}
    .act{font:800 10px system-ui;font-style:normal;text-transform:uppercase;letter-spacing:.05em;background:#69C350;color:#10200c;border-radius:6px;padding:2px 6px}
    .spot{width:100%;display:flex;justify-content:center;background:radial-gradient(ellipse 45% 18% at 50% 88%,color-mix(in srgb,var(--tc) 45%,transparent),transparent 70%),radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--tc) 16%,transparent),transparent 62%);margin:4px 0 2px}
    .big .spot svg{width:180px;height:180px;overflow:visible}.cbox{width:100%;margin:2px 0 0;border-radius:10px;overflow:hidden}
    .spot2{background:radial-gradient(ellipse 40% 10% at 50% 93%,color-mix(in srgb,var(--tc) 40%,transparent),transparent 70%),radial-gradient(circle at 50% 52%,color-mix(in srgb,var(--tc) 12%,transparent),transparent 60%)!important}
    .nrow{display:flex;align-items:baseline;justify-content:center;gap:6px;margin-top:6px}.nrow b{font:800 18px system-ui}.nrow small{color:var(--fp-text2,#9aa3b2);font:600 12px system-ui}
    .pen{background:none;border:0;cursor:pointer;color:var(--fp-text2,#9aa3b2);padding:2px 4px}.pen ha-icon{--mdc-icon-size:16px}
    .nick{display:flex;gap:6px;margin-top:8px;justify-content:center}.nick:empty{display:none}.nick input{height:36px;border-radius:9px;border:1px solid #F5C542;background:#11141a;color:#fff;font:600 15px system-ui;padding:0 10px;width:160px;outline:none}
    .vals{align-self:stretch;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:auto;padding-top:8px}
    .ring{display:flex;flex-direction:column;align-items:center}.ring svg{width:52px;height:52px}.ring b{font:800 13px system-ui}.ring small{font:600 11px system-ui;color:var(--fp-text2,#9aa3b2)}
    .mk{margin-top:auto;padding:11px 18px;font:800 15px system-ui}
    .side{display:flex;flex-direction:column}.dev.two .side>.tile:nth-child(2){flex:1}
    .gl{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}.gl b{font:800 15px system-ui}.gl span{color:var(--fp-text2,#9aa3b2);font:600 12.5px system-ui}
    .gl .tree{margin-left:auto;align-self:center;background:var(--fp-bg3,#2c323d);border:1px solid var(--fp-line,#2f3541);color:inherit;border-radius:9px;padding:6px 10px;font:700 12.5px system-ui;cursor:pointer}
    .gt{position:relative;height:26px;border-radius:9px;background:var(--fp-bg3,#2c323d);margin:0 0 10px;overflow:hidden}.gt i{display:block;height:100%;background:linear-gradient(90deg,#69C350,#B58CFF);border-radius:9px;transition:width .6s}.gt.ready i{background:#F5C542}
    .gt span{position:absolute;inset:0;display:flex;align-items:center;padding-left:10px;font:800 12.5px system-ui;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7)}
    .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .acts button{min-height:46px;border-radius:10px;font:800 15px system-ui;cursor:pointer;border:1px solid var(--fp-line,#2f3541);background:var(--fp-bg3,#2c323d);color:inherit;display:flex;align-items:center;justify-content:center;gap:6px}
    .acts button small{font:600 12px system-ui;color:var(--fp-text2,#9aa3b2)}.acts button[disabled]{color:#6b7380;cursor:default}
    .acts .evo:not([disabled]){background:#F5C542;color:#141414;border-color:#F5C542;box-shadow:0 3px 0 #b8902a}
    .pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px}
    .pill{display:flex;align-items:center;gap:5px;background:var(--fp-bg1,#232831);border:1px solid var(--fp-line,#2f3541);border-radius:9px;padding:4px 8px 4px 5px;color:inherit;cursor:pointer}.pill svg{width:22px;height:22px}.pill b{font:700 12px system-ui}.pill i{font:800 11px system-ui;font-style:normal;color:var(--fp-text2,#9aa3b2)}
    .things{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
    .thing{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 3px;background:var(--fp-bg1,#232831);border:1px solid var(--fp-line,#2f3541);border-radius:10px;color:inherit;cursor:pointer}
    .thing svg{width:28px;height:28px}.thing b{font:700 11.5px system-ui;line-height:1.15;text-align:center}.thing .tg{display:flex;gap:3px;flex-wrap:wrap;justify-content:center}
    .thing i{position:absolute;top:4px;right:6px;font:800 11px system-ui;font-style:normal;color:var(--fp-text2,#9aa3b2)}.thing.none{opacity:.4;cursor:default}
    .tag{font:800 10.5px system-ui;padding:2px 6px;border-radius:6px;background:color-mix(in srgb,var(--nc) 20%,#1c2027);color:var(--nc);white-space:nowrap}
    .back{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .gos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:10px}
    .go{display:flex;flex-direction:column;align-items:center;text-align:center;cursor:pointer;margin:0;font:inherit;color:inherit;border:0}.go .top{align-self:stretch;display:flex;justify-content:space-between;align-items:center}
    .go .spot svg{width:96px;height:96px;overflow:visible}.go .n{font:800 16px system-ui;margin-top:2px}.go .k{color:var(--fp-text2,#9aa3b2);font:600 11.5px system-ui;min-height:14px}
    .rows{align-self:stretch;display:flex;flex-direction:column;gap:3px;margin:8px 0;padding:8px 0;border-top:1px solid var(--fp-line,#2a303a);border-bottom:1px solid var(--fp-line,#2a303a)}
    .rows>div{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:baseline}.rows span{font:600 11.5px system-ui;color:var(--fp-text2,#9aa3b2);white-space:nowrap}.rows b{font:700 12px system-ui;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gb{align-self:stretch;height:8px;border-radius:4px;background:var(--fp-bg3,#2c323d);overflow:hidden}.gb i{display:block;height:100%;background:linear-gradient(90deg,#69C350,#B58CFF)}.gb.ready i{background:#F5C542}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px}.unk{background:var(--fp-bg1,#232831);border-radius:10px;padding:6px;text-align:center}.unk svg{width:54px;height:54px;filter:brightness(0) opacity(.45)}.unk small{display:block;font-size:11px;color:var(--fp-text2,#9aa3b2)}
    .sfil{font-size:13px;color:var(--fp-text2,#9aa3b2);margin:2px 0 10px}
    .inv .ih{display:flex;align-items:center;gap:10px;margin-bottom:8px}.inv .ih .sec{margin:0;flex:1}
    .kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.kpis .tile{display:flex;flex-direction:column;gap:2px}.kpis span{font-size:18px}.kpis b{font:800 24px system-ui;color:var(--pc)}.kpis small{color:var(--fp-text2,#9aa3b2);font-size:12px}
    .gw{border-radius:10px;overflow:hidden}.gw .gwater,.gw .gdark{display:none}
    .tw2{margin:0}.offbox h3{margin:0 0 6px;font-size:17px}.offbox p{font-size:14px;margin:6px 0}
    .pptoast{position:absolute;left:50%;top:40%;transform:translateX(-50%);z-index:20;background:#11141a;border:1px solid #F5C542;color:#fff;border-radius:12px;padding:10px 14px;font:600 13px system-ui;max-width:90%;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.6)}
    @media (max-width:760px){.dev{grid-template-columns:1fr}.gos{grid-template-columns:1fr 1fr}.kpis{grid-template-columns:repeat(3,1fr)}.things{grid-template-columns:repeat(4,1fr)}.bar{flex-wrap:wrap}.tabs{margin:0}}`;

  class FpPetsInner extends HTMLElement {
    setConfig(cfg) {
      this._cfg = cfg || {};
      if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this.shadowRoot.addEventListener('click', (e) => this._click(e)); }
      this._tab = this._tab || 'garten'; this.update();
    }
    set store(s) { this._store = s; }
    set hass(h) { this._hass = h; }
    disconnectedCallback() { clearInterval(this._vt); }
    _snap() { return (this._store && this._store.snap) || {}; }
    _t() { return T(this._snap()); }
    update() {
      if (!this.shadowRoot) return;
      if (!L()) { this.shadowRoot.innerHTML = `<style>${PAGE_CSS}</style><div class="card"><p class="hint">…</p></div>`; load().then(() => this.update()).catch(() => {}); return; }
      if (window.__fpPetPerson) { this._pid = window.__fpPetPerson; this._tab = window.__fpPetTab || 'tier'; window.__fpPetPerson = null; window.__fpPetTab = null; this._sub = null; }
      if (this._store && this._store.snap) onSnap(this._store.snap);
      if (window.__fpHatching) { clearTimeout(this._ht); this._ht = setTimeout(() => this.update(), 400); return; }
      // busy with a care animation or a typed name: the next update waits
      if (this._hold && Date.now() < this._hold) { clearTimeout(this._ht); this._ht = setTimeout(() => this.update(), this._hold - Date.now() + 50); return; }
      this._render();
    }
    _render() {
      const s = this._snap(); const t = this._t(); clearInterval(this._vt);
      if (!enabled(s)) { this.shadowRoot.innerHTML = `<style>${PAGE_CSS}</style><div class="card"><p class="hint">${t.off}</p></div>`; return; }
      const head = `<style>${PAGE_CSS}${L().P4.CSS}${L().M.CSS}${L().CARE.CSS}${L().CSS}</style>`;
      if (!this._pid || !(s.pets || {})[this._pid]) { this.shadowRoot.innerHTML = `${head}<div class="card">${this._who()}</div>`; return; }
      const pr = person(s, this._pid); const st = s.pets[this._pid];
      const bar = `<div class="tile bar" style="--pc:${pcol(pr)}">${this._av(pr, st)}<button class="sw" data-who>${esc(pr.name)} <span>▾</span></button>
        ${st.on ? `<div class="tabs">${Object.entries(t.tabs).map(([k, n]) => `<button data-tab="${k}" class="${this._tab === k ? 'on' : ''}">${n}</button>`).join('')}</div><span class="chip">⭐ <b>${st.pts}</b></span><button class="set" data-set aria-label="${t.settings}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>` : '<span style="flex:1"></span>'}</div>`;
      const setBox = this._setOpen ? `<div class="tile" style="--pc:#9aa3b2"><div class="sec">${t.settings}</div><p class="hint">${t.offInfo}</p><div class="conf">${this._sure ? `<b>${t.sure}</b><button class="okb" data-setx>${t.cancel}</button><button class="okb yes" data-off>${t.yesOff}</button>` : `<button class="okb" data-sure>${t.offBtn}</button>`}</div></div>` : '';
      const body = st.on ? this._body(s, t, pr, st) : `<div class="tile offbox" style="--pc:#555"><h3>${t.offH}</h3><p>${t.offP1}</p><p>${fmt(t.offP2, { n: st.pts })}</p><button class="okb green" data-on>${t.onBtn}</button></div>`;
      this.shadowRoot.innerHTML = `${head}<div class="card">${bar}${setBox}<div class="body">${body}</div></div>`;
      this._after(s, t, pr, st);
    }
    _av(pr, st) { const p = st && st.on ? st.pets[st.active] : null; return `<span class="av"><span class="ava">${avatar(pr, 64)}</span>${p ? `<span class="pet">${svgOf(st.active, p)}</span>` : ''}</span>`; }
    _who() {
      const s = this._snap(); const t = this._t();
      return `<h2>${t.who}</h2><div class="who">${(s.persons || []).filter((pr) => s.pets && s.pets[pr.id]).map((pr) => { const st = s.pets[pr.id]; const p = st.pets[st.active];
        return `<button class="tile kid" data-kid="${esc(pr.id)}" style="--pc:${pcol(pr)}">${this._av(pr, st)}<b class="nm">${esc(pr.name)}</b><small>${!st.on ? t.off : p ? esc(p.step ? `${titleOf(p, t)} · ${p.nick ? kindOf(p) : t.steps[p.step]}` : t.steps[0]) : ''}</small>${st.on ? `<span class="chip">⭐ <b>${st.pts}</b> ${t.pts}</span>` : ''}</button>`; }).join('')}</div>`;
    }
    _body(s, t, pr, st) {
      if (this._sub && this._sub.tree) return this._tree(s, t, st, this._sub.tree);
      if (this._sub && this._sub.pet && st.pets[this._sub.pet]) return `<div class="back"><button class="okb" data-back>‹ ${t.backColl}</button></div>${this._petView(s, t, pr, st, this._sub.pet)}`;
      if (this._tab === 'tier') return this._petView(s, t, pr, st, st.active);
      if (this._tab === 'inv') return this._inv(t, st);
      if (this._tab === 'samm') return this._coll(s, t, st);
      if (this._tab === 'stat') return this._stats(t, pr, st);
      return `<div class="tile" style="--pc:${pcol(pr)}"><div class="gw"></div><p class="hint">${Object.values(st.pets).some((p) => p.step > 0) ? t.garden : t.gardenEmpty}</p></div>`;
    }
    _tag(n, v) { return `<span class="tag" style="--nc:${NEED[n][1]}">${NEED[n][0]} ${v}</span>`; }
    _thing(t, st, id) { return `<button class="thing" data-use="${id}">${L().ICO.icoB(id === 'futter' ? (L().ICO.FOOD[(st.pets[st.active] || {}).kind] || 'apfel') : id, 34)}<b>${esc(t.it[id] || id)}</b><span class="tg">${(EFF[id] || []).map(([n, v]) => this._tag(n, v)).join('')}</span><i>${st.inv[id] || 0}×</i></button>`; }
    _petView(s, t, pr, st, id) {
      const p = st.pets[id]; const steps = (s.pets_cfg || {}).steps || []; const act = id === st.active; const egg = p.step === 0; const cares = act && !egg;
      const col = colOf(p, pcol(pr)); const nx = p.need; const amt = nx != null ? Math.min((s.pets_cfg || {}).spend || 50, st.pts, Math.max(0, nx - p.g)) : 0; const can = nx != null && !p.ready && amt > 0;
      const pills = [...PILLS.map(([k, v]) => [k, `+${v}`]), [DEV, t.it[DEV] && (s.lang === 'en' ? 'whole step' : 'ganze Stufe')]].filter(([k]) => (st.inv[k] || 0) > 0);
      const have = [...CARE_ITEMS, ...TOYS, 'kissen', 'laterne'].filter((k) => (st.inv[k] || 0) > 0);
      const waiting = !egg && Object.entries(st.pets).find(([, q]) => q.step === 0);
      const hr = new Date().getHours(); const sl = st.sleep || [21, 7]; const napEnd = p.nap ? new Date(p.nap) : null; const napping = !egg && napEnd && napEnd > new Date(); const sleeping = !egg && !napping && (hr >= sl[0] || hr < sl[1]);
      const eggCard = waiting ? `<button class="eggwait" data-gotoegg="${esc(waiting[0])}"><span class="ew">${svgOf(waiting[0], waiting[1])}</span><b>🥚 ${esc(t.eggWaits)}</b><span class="go">›</span></button>` : '';
      return `${eggCard}<div class="dev${cares ? ' two' : ''}">
        <div class="tile big" style="--pc:${col}"><div class="top"><span class="stg">${esc(t.steps[p.step])}</span>${act ? `<em class="act">${t.active}</em>` : ''}</div>
          ${cares ? `<div class="cbox" data-cbox="${esc(id)}"></div>` : `<div class="spot" style="--tc:${col}">${svgOf(id, p)}</div>`}
          <div class="nrow"><b>${esc(titleOf(p, t))}</b>${!egg && p.nick ? `<small>${esc(kindOf(p))}</small>` : ''}${egg ? '' : `<button class="pen" data-pen="${esc(id)}" aria-label="${t.name}"><ha-icon icon="mdi:pencil"></ha-icon></button>`}</div><div class="nick"></div>
          ${cares && sleeping ? `<p class="hint zz">😴 ${esc(fmt(t.sleeps, { n: titleOf(p, t), t: (st.sleep || [21, 7])[1] }))}</p>` : ''}
          ${cares && napping ? `<p class="hint zz">💤 ${esc(fmt(t.naps, { n: titleOf(p, t), t: `${String(napEnd.getHours()).padStart(2, '0')}:${String(napEnd.getMinutes()).padStart(2, '0')}` }))}</p>` : ''}
          ${cares ? '<div class="vals"></div>' : egg ? `<p class="hint">${fmt(t.eggHint, { n: nx })}</p>` : `<button class="okb green mk" data-mk="${esc(id)}">${t.careThis}</button>`}</div>
        <div class="side"><div class="tile" style="--pc:${col}"><div class="gl"><b>${egg ? t.hatchT : t.dev}</b><span>${esc(t.steps[p.step])}${nx != null ? ` → ${esc(t.steps[p.step + 1])}` : ''}</span>${egg ? '' : `<button class="tree" data-tree="${esc(id)}">${t.tree}</button>`}</div>
          <div class="gt${p.ready ? ' ready' : ''}"><i style="width:${pctOf(p, steps)}%"></i><span>${nx == null ? t.grown : p.ready ? t.ready : `${p.g} / ${nx} · ${fmt(t.left, { n: nx - p.g })}`}</span></div>
          <div class="acts"><button class="evo" data-evo="${esc(id)}" ${p.ready ? '' : 'disabled'}>${egg ? t.hatch : t.evolve}</button><button data-spend="${esc(id)}" ${can ? '' : 'disabled'}>${t.spend} <small>${can ? `${amt} ⭐ → +${amt}` : nx == null || p.ready ? t.full : t.noPts}</small></button></div>
          ${pills.length ? `<div class="pills">${pills.map(([k, v]) => `<button class="pill" data-use="${k}" data-pet="${esc(id)}">${L().ICO.icoB(k, 22)}<b>${esc(t.it[k])}</b><span class="tag" style="--nc:#B58CFF">${esc(v)}</span><i>${st.inv[k]}×</i></button>`).join('')}</div>` : ''}</div>
          ${cares ? `<div class="tile" style="--pc:${col}"><div class="gl"><b>${t.care}</b><span>${t.careH}</span></div>${have.length ? `<div class="things">${have.map((k) => this._thing(t, st, k)).join('')}</div>` : `<p class="hint">${t.nothing}</p>`}</div>` : ''}</div></div>`;
    }
    // tap on a thing: what it is, what it does, how to use it (steps + a preview on your own pet), where it comes from.
    // Artefacts: pick the pet (or the animal of the wish egg) and confirm a second time – nothing happens by a stray tap.
    _info(k) {
      const t = this._t(); const I = t.info; const st = this._snap().pets[this._pid]; const x = I.x[k] || ['', '', ''];
      const kind = KIND_OF(k); const col = { care: '#69C350', pill: '#E36BD2', art: '#B58CFF' }[kind]; const have = st.inv[k] || 0;
      const pets = Object.entries(st.pets); const active = st.pets[st.active];
      const hatchedFirst = pets.find(([id, p]) => id === st.active && p.step > 0) || pets.find(([, p]) => p.step > 0);
      const ico = (n) => L().ICO.icoB(k === 'futter' ? (L().ICO.FOOD[(active || {}).kind] || 'apfel') : k, n);
      const s3 = kind === 'care' ? I.s3care : kind === 'pill' ? I.s3pill : k === 'traumkristall' ? I.s3wish : I.s3art;
      const steps = (kind === 'art' ? [['🎒', t.tabs.inv], [ico(22), I.tapIt], [k === 'traumkristall' ? '🥚' : '✨', s3]] : [['🐾', I.s1], ['⭐', I.s2], [ico(22), s3]])
        .map(([g, l], n) => `<div class="st"><span class="n">${n + 1}</span><span class="g">${g}</span>${esc(l)}</div>`).join('<span class="ar">›</span>');
      // which pets can take this artefact
      const fits = (p) => { if (p.step === 0) return false; const a = p.art || {};
        if (k === 'weitblick') return !a.sight; if (k === 'sternenstein') return p.need != null || !a.aura;
        if (k === 'regenbogenfeder') return !(a.skins || []).includes('regenbogen'); if (k === 'zauberspiegel') return !(a.skins || []).includes('kristall'); return true; };
      // food: every animal has its own favourite – show it for the child's pets
      const favs = k === 'futter' ? pets.filter(([, p]) => p.step > 0).map(([id, p]) => { const f = L().ICO.FOOD[p.kind] || 'apfel'; return `<span class="fav">${L().ICO.icoB(f, 20)} ${esc(p.nick || kindOf(p))}: ${esc((L().ICO.FNAME || {})[f] || f)}</span>`; }).join('') : '';
      const extra = (favs ? `<p class="favs">${esc(I.favs)}</p><div class="favl">${favs}</div>` : '') + (TOYS.includes(k) ? `<p class="favs">${esc(I.tired)}</p>` : '') + (CARE_ITEMS.includes(k) ? `<p class="favs">${esc(I.onlyNeed)}</p>` : '');
      const html = `<div class="info2" style="--ic:${col}"><div class="il">
          <div class="ib"><div class="ic">${ico(48)}</div><div><b>${esc(t.it[k] || k)}</b><small>${esc(I.have)} ${have}×${CAPS[k] ? ` ${esc(I.of)} ${CAPS[k]}` : ''}</small></div></div>
          <div class="isec"><h4>${esc(I.what)}</h4><p>${esc(x[0])}</p></div>
          <div class="isec"><h4>${esc(I.eff)}</h4><span class="effp">${esc(x[1])}</span> <span class="keep">${esc(STAYS.includes(k) ? I.stays : ARTS.includes(k) && k !== 'traumkristall' ? I.forGood : I.usedUp)}</span>${extra}</div>
          <div class="isec"><h4>${esc(I.how)}</h4><div class="steps">${steps}</div></div>
          <div class="isec"><h4>${esc(I.from)}</h4><p>${esc(x[2])}</p></div></div>
        <div class="ir"><div class="demo"><div class="cbox3 spot2" style="--tc:${col}"></div><button class="okb dbtn" data-demo>${esc(I.demo)}</button></div>
          <div class="pick"></div><div class="ierr"></div>
          ${have ? `<div class="irow"><button class="okb green" data-now>${esc(I.useNow)}</button></div>` : ''}</div></div>`;
      modal(t.it[k] || k, html, (root, close) => {
        const box = root.querySelector('.cbox3'); const pick = root.querySelector('.pick'); const errEl = root.querySelector('.ierr');
        let care = null; let target = null; let wish = null;
        // the preview: the real effect on the chosen pet (or the wished egg) – nothing is used up
        const stage = (pid, kd) => {
          if (k === 'traumkristall') { care = new (L().CARE.Care)(box, kd || wish || 'koala', 'ei', { noBars: 1 }); return; }
          const pe = pid ? st.pets[pid] : (hatchedFirst && hatchedFirst[1]);
          if (!pe) { box.innerHTML = `<p class="hint" style="padding:20px;text-align:center">${esc(I.noPet)}</p>`; care = null; return; }
          care = new (L().CARE.Care)(box, pe.kind, ST[pe.step], { look: lookOf(pe), noBars: 1 });
        };
        const play = async () => {
          if (!care) return; care.busy = false;
          if (kind !== 'art') { playOn(care, k); return; }
          const sp = (ch) => care.sparkle(10, ch);
          try { await care.item(k, [50, 35]); } catch (e) { /* no item animation */ }
          if (k === 'sternenstein') { sp('✦'); care.look = { ...care.look, aura: 'sterne' }; care.draw('freut'); care.msg(I.pv.star); }
          else if (k === 'regenbogenfeder' || k === 'zauberspiegel') { sp(k === 'zauberspiegel' ? '💎' : '🌈'); care.look = { ...care.look, skin: k === 'zauberspiegel' ? 'kristall' : 'regenbogen' }; care.draw('freut'); care.msg(I.pv.colour); }
          else if (k === 'weitblick') { sp('👁'); care.draw('freut'); care.msg(I.pv.sight); }
          else if (k === 'traumkristall') { for (let n = 0; n < 8; n++) setTimeout(() => care.fx('💗', 25 + Math.random() * 50, 25 + Math.random() * 40, { dy: -40 }), n * 120); care.msg(I.pv.wish); }
        };
        stage(null); setTimeout(play, 500);
        root.querySelector('[data-demo]').addEventListener('click', () => { stage(target, wish); play(); });
        const err = (e) => { errEl.textContent = typeof e === 'string' ? e : errMsg(t, e); };
        const now = root.querySelector('[data-now]'); if (!now) return;
        const confirmRow = (q, go, pic) => { pick.insertAdjacentHTML('beforeend', `<div class="conf">${pic ? `<span class="cv">${pic}</span>` : ''}<p>${esc(q)}</p><div class="irow"><button class="okb" data-no>${esc(t.cancel || 'Abbrechen')}</button><button class="okb green" data-yes>${esc(I.yes)}</button></div></div>`);
          pick.querySelector('[data-no]').addEventListener('click', () => { const c = pick.querySelector('.conf'); if (c) c.remove(); });
          pick.querySelector('[data-yes]').addEventListener('click', go); };
        const done = (after) => { setTimeout(() => { close(); after(); }, 2400); };
        now.addEventListener('click', async () => {
          errEl.textContent = '';
          // care things and pills: straight away on the current pet (as in "Pflegen & spielen")
          if (kind !== 'art') {
            const tg = kind === 'pill' ? st.active : (hatchedFirst && hatchedFirst[0]); if (!tg) { err(I.noPet); return; }
            try { await call(this._store, this._pid, 'use', { pet: tg, item: k }); } catch (e) { err(e); return; }
            now.disabled = true; stage(tg); play(); done(() => { this.update(); const p = this._snap().pets[this._pid].pets[tg]; if (k === DEV && p && p.ready) (p.step === 0 ? openHatch : openEvolve)(this._store, this._pid, tg, () => this.update()); });
            return;
          }
          now.parentElement.remove();
          if (k === 'traumkristall') {
            // every animal; tap one, then confirm – the egg of exactly this animal comes right away
            // the whole window becomes the picker: all animals big, fable creatures apart, the ones you have marked
            root.querySelector('.info2').classList.add('picking');
            const own = new Set(Object.values(st.pets).map((q) => q.kind).filter(Boolean)); const FAB = L().TREE.FABEL;
            const btn = ([a, nm]) => `<button data-wish="${a}">${own.has(a) ? '<i class="own">✓</i>' : ''}${L().P4.svg(a, 'baby', 'froh', { noShadow: 1 })}<span>${esc(nm)}</span></button>`;
            pick.innerHTML = `<h4>${esc(I.pick)} <small>${esc(I.ownHint)}</small></h4><div class="wish">${L().P4.LIST.filter(([a]) => !FAB.includes(a)).map(btn).join('')}</div>
              <h4>✨ ${esc(I.fable)}</h4><div class="wish fab">${L().P4.LIST.filter(([a]) => FAB.includes(a)).map(btn).join('')}</div>`;
            pick.querySelectorAll('[data-wish]').forEach((b) => b.addEventListener('click', () => {
              wish = b.dataset.wish; pick.querySelectorAll('[data-wish]').forEach((x) => x.classList.toggle('on', x === b)); stage(null, wish);
              const c = pick.querySelector('.conf'); if (c) c.remove();
              const cf = () => { const c = pick.querySelector('.conf'); if (c) c.scrollIntoView({ block: 'nearest' }); };
              setTimeout(cf, 30);
              confirmRow(fmt(I.sureWish, { n: kindName(wish) }), async () => {
                let res; try { res = await call(this._store, this._pid, 'use', { pet: st.active, item: k, kind: wish }); } catch (e) { err(e); return; }
                pick.innerHTML = `<p class="hint">🥚 ${esc(fmt(I.wished, { n: kindName(wish) }))}</p>`; play();
                done(() => { if (res && res.egg) call(this._store, this._pid, 'active', { pet: res.egg }).catch(() => {}); this._tab = 'tier'; this._sub = null; this.update(); });
              }, L().P4.svg(wish, 'baby', 'freut', { noShadow: 1 }));
            }));
            return;
          }
          const ok = pets.filter(([, p]) => fits(p));
          if (!ok.length) { err(I.noFit); return; }
          pick.innerHTML = `<h4>${esc(I.forWhom)}</h4><div class="whom">${ok.map(([id, p]) => `<button data-whom="${esc(id)}">${svgOf(id, p)}<span>${esc(p.nick || kindOf(p))}</span></button>`).join('')}</div>`;
          pick.querySelectorAll('[data-whom]').forEach((b) => b.addEventListener('click', () => {
            target = b.dataset.whom; pick.querySelectorAll('[data-whom]').forEach((x) => x.classList.toggle('on', x === b)); stage(target);
            const c = pick.querySelector('.conf'); if (c) c.remove(); const p = st.pets[target];
            confirmRow(fmt(I.sure, { n: p.nick || kindOf(p) }), async () => {
              try { await call(this._store, this._pid, 'use', { pet: target, item: k }); } catch (e) { err(e); return; }
              pick.innerHTML = ''; play();
              done(() => {
                if (k === 'weitblick') { this._tab = 'tier'; this._sub = { tree: target }; this.update(); return; }
                this.update(); const q = this._snap().pets[this._pid].pets[target];
                if (k === 'sternenstein' && q && q.ready) openEvolve(this._store, this._pid, target, () => this.update());
              });
            }, svgOf(target, p));
          }));
        });
      }, col);
    }
    _inv(t, st) {
      const G = [['care', '#69C350', CARE_ITEMS, true], ['toys', '#4FA3E0', TOYS, true], ['pills', '#E36BD2', ['wachs_s', 'wachs_m', 'wachs_l', DEV], true], ['sleep', '#9aa3b2', ['kissen', 'laterne']], ['art', '#B58CFF', ['sternenstein', 'weitblick', 'zauberspiegel', 'traumkristall', 'regenbogenfeder']]];
      return G.map(([g, c, ids, use]) => `<div class="tile inv" style="--pc:${c}"><div class="ih"><div class="sec">${t.inv[g]}</div>${use ? `<button class="okb" data-tab="tier">⭐ ${t.useAt}</button>` : ''}</div><div class="things">${ids.map((k) => `<button class="thing ${st.inv[k] ? '' : 'none'}" data-info="${k}">${L().ICO.icoB(k, 34)}<b>${esc(t.it[k] || k)}</b><span class="tg">${(EFF[k] || []).map(([n, v]) => this._tag(n, v)).join('')}</span><i>${st.inv[k] || 0}×</i></button>`).join('')}</div></div>`).join('') + `<p class="hint">ℹ️ ${esc(t.info.tapHint)}</p>`;
    }
    _coll(s, t, st) {
      const steps = (s.pets_cfg || {}).steps || []; const own = Object.entries(st.pets).filter(([, p]) => p.step > 0); const eggs = Object.entries(st.pets).filter(([, p]) => p.step === 0);
      const have = new Set(own.map(([, p]) => p.kind)); const all = L().P4.LIST.map((x) => x[0]); const FAB = L().TREE.FABEL;
      const favs = (k) => Object.keys(((L().M.AB || {})[k] || {}).fav || {}).slice(0, 2).map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
      const row = (ic, l, v) => `<div><span>${ic} ${l}</span><b title="${esc(v)}">${esc(v)}</b></div>`;
      const card = ([id, p]) => { const col = colOf(p, '#FFE27A'); return `<button class="tile go" style="--pc:${col}" data-card="${esc(id)}"><div class="top"><span class="stg">${esc(t.steps[p.step])}</span>${id === st.active ? `<em class="act">${t.active}</em>` : ''}</div>
        <div class="spot" style="--tc:${col}">${svgOf(id, p)}</div><b class="n">${esc(titleOf(p, t))}</b><small class="k">${p.step && p.nick ? esc(kindOf(p)) : '&nbsp;'}</small>
        ${p.step ? `<div class="rows">${row('🔥', t.line, (L().TREE.THEME_TXT[themeOf(p)] || '').replace('-Linie', ''))}${row('✦', t.special, ((L().M.SPECIAL || {})[p.kind] || {}).n || '–')}${row('🍎', t.eats, ((L().ICO.FNAME || {})[L().ICO.FOOD[p.kind]]) || '')}${row('📍', t.likes, favs(p.kind))}${row('📅', t.together, fmt(t.days, { n: Math.max(1, Math.round((Date.now() - new Date(p.since).getTime()) / 864e5)) }))}</div>` : ''}
        <div class="gb${p.ready ? ' ready' : ''}"><i style="width:${pctOf(p, steps)}%"></i></div></button>`; };
      const unk = all.filter((k) => !have.has(k));
      return `<div class="sfil">${esc(fmt(t.collected, { a: have.size, b: all.length, c: own.filter(([, p]) => p.step >= 4).length, d: own.filter(([, p]) => FAB.includes(p.kind)).length, e: FAB.length }))}</div>
        ${own.length || eggs.length ? `<div class="gos">${[...own, ...eggs].map(card).join('')}</div>` : `<div class="tile" style="--pc:#555"><p class="hint">${t.noneYet}</p></div>`}
        <div class="tile" style="--pc:#555"><div class="sec">${esc(fmt(t.unknown, { n: unk.length }))}</div><div class="grid">${unk.map((k) => `<div class="unk">${L().P4.svg(k, 'gross', 'froh', { noShadow: 1 })}<small>${FAB.includes(k) ? t.wheelOnly : '???'}</small></div>`).join('')}</div></div>`;
    }
    _stats(t, pr, st) {
      const own = Object.values(st.pets).filter((p) => p.step > 0); const p = st.pets[st.active] || {};
      const days = p.since ? Math.max(1, Math.round((Date.now() - new Date(p.since).getTime()) / 864e5)) : 0;
      const k = (ic, v, l, c) => `<div class="tile" style="--pc:${c}"><span>${ic}</span><b>${esc(v)}</b><small>${esc(l)}</small></div>`;
      return `<div class="kpis">${[k('🐾', own.length, t.kpi.pets, '#69C350'), k('👑', own.filter((x) => x.step >= 4).length, t.kpi.endf, '#F5C542'), k('⭐', st.stats.evos || 0, t.kpi.evos, '#B58CFF'),
        k('📅', days, fmt(t.kpi.days, { n: titleOf(p, t) }), '#4FA3E0'), k('🍎', st.stats.fed || 0, t.kpi.fed, '#FF8A3D'), k('🎡', st.stats.spins || 0, t.kpi.spins, '#E36BD2')].join('')}</div>`;
    }
    _tree(s, t, st, id) {
      const p = st.pets[id];
      const a = p.art || {}; const A = t.artfx;
      // artefact effects of this pet: switch them on and off freely (they stay unlocked for good)
      const chip = (on, attr, label) => `<button class="axc${on ? ' on' : ''}" ${attr}>${label}</button>`;
      const skins = (a.skins || []).length ? `<span class="axl">${esc(A.colour)}</span>${chip(!a.skin, `data-artskin="" data-artpet="${esc(id)}"`, esc(A.normal))}${(a.skins || []).map((k) => chip(a.skin === k, `data-artskin="${k}" data-artpet="${esc(id)}"`, esc(A[k] || k))).join('')}` : '';
      const aura = a.aura ? `<span class="axl">${esc(A.aura)}</span>${chip(a.aura_on, `data-artaura="1" data-artpet="${esc(id)}"`, '✦ ' + esc(A.on))}${chip(!a.aura_on, `data-artaura="0" data-artpet="${esc(id)}"`, esc(A.off))}` : '';
      const fx = skins || aura ? `<div class="axbar">${skins}${aura}</div>` : '';
      const top = a.sight ? `<div class="fogbar hint">👁 ${esc(A.sight)}</div>` : `<div class="fogbar hint">${esc(fmt(t.foggy, { n: t.steps[Math.min(p.step, 3)] }))}</div>`;
      return `<div class="back"><button class="okb" data-back>‹ ${t.back}</button><b>${t.tree} · ${esc(titleOf(p, t))}</b></div>${fx}<div class="tile" style="--pc:#69C350">${top}<div class="tw2"></div></div>`;
    }
    // after the HTML is in place: care box, values, garden, tree
    _after(s, t, pr, st) {
      const R = this.shadowRoot;
      const cb = R.querySelector('[data-cbox]');
      if (cb) {
        const id = cb.dataset.cbox; const p = st.pets[id]; const key = this._pid + id + p.step + JSON.stringify(lookOf(p));
        this._care = new (L().CARE.Care)(cb, p.kind, ST[p.step], { look: lookOf(p), mood: p.v.hunger < 30 ? 'hungrig' : 'froh', noBars: 1 }); this._care.v = { ...this._care.v, ...p.v }; this._care.bars(); this._careKey = key;
        cb.classList.add('spot2'); cb.style.setProperty('--tc', colOf(p, pcol(pr)));
        requestAnimationFrame(() => { const pe = cb.querySelector('.pet'); const w = pe && pe.getBoundingClientRect().width; if (w > 40) window.__fpPetW = w; });
        const vals = () => { const el = R.querySelector('.vals'); if (!el || !this._care) return; el.innerHTML = Object.keys(NEED).map((n) => { const v = Math.round(Math.max(0, Math.min(100, this._care.v[n]))); const r = 19; const C = 2 * Math.PI * r;
          return `<div class="ring"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${r}" fill="none" stroke="#2c323d" stroke-width="5"/><circle cx="24" cy="24" r="${r}" fill="none" stroke="${NEED[n][1]}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(C * v / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 24 24)"/><text x="24" y="29" text-anchor="middle" font-size="15">${NEED[n][0]}</text></svg><b>${v}%</b><small>${esc({ hunger: 'Hunger', durst: s.lang === 'en' ? 'Thirst' : 'Durst', energie: s.lang === 'en' ? 'Energy' : 'Energie', laune: s.lang === 'en' ? 'Mood' : 'Laune' }[n])}</small></div>`; }).join(''); };
        vals(); this._vt = setInterval(vals, 500);
      }
      const gw = R.querySelector('.gw'); if (gw) this._garden(gw, st);
      const tw = R.querySelector('.tw2'); if (tw && this._sub && this._sub.tree) { const p = st.pets[this._sub.tree]; L().TREE.render(tw, p.kind, { size: 40, gap: 4, colW: 72, fog: (p.art || {}).sight ? null : Math.min(p.step, 3) }); }
    }
    _garden(g, st) {
      const mine = Object.values(st.pets).filter((p) => p.step > 0).slice(0, 8);
      const bar = (() => { const out = []; const walk = (n) => { if (!n || out.length) return; if (n.matches && n.matches('.bar .scn svg')) { out.push(n); return; } if (n.shadowRoot) walk(n.shadowRoot); for (const c of n.children || []) walk(c); }; walk(document.body); return out[0]; })();
      const W0 = L().WORLD; const Pt = W0.parts; const m = new Date().getMonth(); const base = m >= 2 && m <= 4 ? 'fruehling' : m >= 5 && m <= 7 ? 'sommer' : m >= 8 && m <= 10 ? 'herbst' : 'winter'; const pal = { ...W0.PAL[base], base };
      const GD = { ...L().M.GARDEN, pond: { cx: 500, cy: 213, rx: 128, ry: 13 }, roof: { x: 500, y: 236, z: 150 }, y0: 238, y1: 505, slots: { ...L().M.GARDEN.slots, seerose: [[450, 213], [545, 214], [500, 216]] } };
      let ban = '';
      if (bar) { const c = bar.cloneNode(true); c.setAttribute('viewBox', '390 0 500 120'); c.setAttribute('preserveAspectRatio', 'none'); c.removeAttribute('class'); c.setAttribute('style', 'position:absolute;left:0;top:0;width:1000px;height:240px;z-index:0;pointer-events:none'); ban = c.outerHTML; }
      const ground = base === 'winter' ? '#e8eef4' : base === 'herbst' ? '#b39a5c' : '#8FC060';
      GD.draw = () => [ban, Pt.svgL(1000, 520, 1, `<rect y="234" width="1000" height="290" fill="${ground}"/>`), Pt.svgL(1000, 520, 250, Pt.gHedge(pal, -10, 330, 252) + Pt.gHedge(pal, 680, 1010, 252)),
        Pt.svgL(1000, 520, 300, Pt.gMaple(pal, 985, 300, 1.15)), Pt.svgL(1000, 520, 338, Pt.gTree(pal)), Pt.svgL(1000, 520, 340, Pt.gBush(pal, 252, 340, 26) + Pt.gBush(pal, 690, 330, 22)),
        Pt.svgL(1000, 520, 404, Pt.gLamp()), Pt.svgL(1000, 520, 470, Pt.gBush(pal, 820, 470, 24)), Pt.svgL(1000, 520, 480, Pt.gFlowers(pal)), Pt.svgL(1000, 520, 506, Pt.gBush(pal, 70, 512, 34) + Pt.gBush(pal, 960, 512, 30))].join('');
      const host = document.createElement('div'); g.appendChild(host);
      const sc = new (L().M.Scene)(host, { geo: GD, labels: false }); sc.social = 0.4; try { sc.setPool(true); } catch (e) { /* no pool */ }
      mine.forEach((p, n) => { const a = sc.add(p.kind, ST[p.step], 120 + ((n * 137) % 760), 300 + ((n * 71) % 180)); { const lk = lookOf(p); if (Object.keys(lk).length) { a.var = { ...lk }; a.deco = [...(lk.deco || [])]; a.key = ''; a.setView('front'); } } });
    }
    async _act(action, extra, okFn) {
      const t = this._t(); try { const r = await call(this._store, this._pid, action, extra); if (okFn) okFn(r); return r; } catch (e) { toast(this.shadowRoot.querySelector('.card') || this.shadowRoot, errMsg(t, e)); return null; }
    }
    _click(e) {
      const q = (sel) => e.target.closest(sel);
      let b;
      if ((b = q('[data-kid]'))) { this._pid = b.dataset.kid; this._tab = 'garten'; this._sub = null; this._setOpen = false; this._render(); return; }
      if (q('[data-who]')) { this._pid = null; this._sub = null; this._render(); return; }
      if ((b = q('[data-tab]'))) { this._tab = b.dataset.tab; this._sub = null; this._render(); return; }
      if (q('[data-set]')) { this._setOpen = !this._setOpen; this._sure = false; this._render(); return; }
      if (q('[data-sure]')) { this._sure = true; this._render(); return; }
      if (q('[data-setx]')) { this._setOpen = false; this._sure = false; this._render(); return; }
      if (q('[data-off]')) { this._setOpen = false; this._sure = false; this._act('onoff', { on: false }); return; }
      if (q('[data-on]')) { this._act('onoff', { on: true }); return; }
      if (q('[data-back]')) { this._sub = this._sub && this._sub.tree && this._sub.from ? { pet: this._sub.from } : null; this._render(); return; }
      if ((b = q('[data-card]'))) { this._sub = { pet: b.dataset.card }; this._render(); return; }
      if ((b = q('[data-tree]'))) { this._sub = { tree: b.dataset.tree, from: this._sub && this._sub.pet }; this._render(); return; }
      if ((b = q('[data-mk]'))) { this._sub = null; this._tab = 'tier'; this._act('active', { pet: b.dataset.mk }); return; }
      if ((b = q('[data-spend]'))) { this._act('spend', { pet: b.dataset.spend, amount: (this._snap().pets_cfg || {}).spend || 50 }); return; }
      if ((b = q('[data-evo]'))) { const st = this._snap().pets[this._pid]; const p = st.pets[b.dataset.evo]; if (!p || !p.ready) return;
        if (p.step === 0) openHatch(this._store, this._pid, b.dataset.evo, () => this.update()); else openEvolve(this._store, this._pid, b.dataset.evo, () => this.update()); return; }
      if ((b = q('[data-pen]'))) { const w = this.shadowRoot.querySelector('.nick'); const p = this._snap().pets[this._pid].pets[b.dataset.pen]; const t = this._t(); this._hold = Date.now() + 120000;
        w.innerHTML = `<input maxlength="16" autocomplete="off" enterkeyhint="done" placeholder="${esc(t.nameHint)}" value="${esc(p.nick || '')}"><button class="okb" data-nicksave="${esc(b.dataset.pen)}">${t.save}</button>`;
        const inp = w.querySelector('input'); inp.focus(); inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') w.querySelector('[data-nicksave]').click(); }); return; }
      if ((b = q('[data-nicksave]'))) { const v = this.shadowRoot.querySelector('.nick input').value; this._hold = 0; this._act('nick', { pet: b.dataset.nicksave, nick: v.slice(0, 16) }); return; }
      if ((b = q('[data-info]'))) { this._info(b.dataset.info); return; }
      if ((b = q('[data-gotoegg]'))) { this._act('active', { pet: b.dataset.gotoegg }, () => { this._tab = 'tier'; this._sub = null; this.update(); }); return; }
      if ((b = q('[data-artskin]'))) { this._act('artfx', { pet: b.dataset.artpet, skin: b.dataset.artskin }); return; }
      if ((b = q('[data-artaura]'))) { this._act('artfx', { pet: b.dataset.artpet, aura: b.dataset.artaura === '1' }); return; }
      if ((b = q('[data-use]'))) {
        const item = b.dataset.use; const st = this._snap().pets[this._pid]; const id = b.dataset.pet || st.active; const anim = ANIM[item];
        this._act('use', { pet: id, item }, () => { if (anim && this._care) { this._hold = Date.now() + 2600; playOn(this._care, item); }
          if (item === DEV) { setTimeout(() => { const now = this._snap().pets[this._pid].pets[id]; if (now && now.ready) (now.step === 0 ? openHatch : openEvolve)(this._store, this._pid, id, () => this.update()); }, 900); } });
      }
    }
  }
  if (!customElements.get('fp-pets-inner')) customElements.define('fp-pets-inner', FpPetsInner);
})();
