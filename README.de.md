![Family Planer](https://raw.githubusercontent.com/magi1982/family-planer/main/custom_components/family_planer/brand/logo@2x.png)

# Family Planer für Home Assistant

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-unterst%C3%BCtzen-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/magibuilds)
[![Validate](https://github.com/magi1982/family-planer/actions/workflows/validate.yml/badge.svg)](https://github.com/magi1982/family-planer/actions/workflows/validate.yml)
[![Security](https://github.com/magi1982/family-planer/actions/workflows/security.yml/badge.svg)](https://github.com/magi1982/family-planer/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/magi1982/family-planer/blob/main/LICENSE)

<a href="https://buymeacoffee.com/magibuilds"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>

Der Familienplaner fürs Wandtablet: **Ämtli** mit Punkten und echten Belohnungen, **Termine und Stundenplan**
jeder Person auf einen Blick, **Ferien**, die Ämtli automatisch pausieren, **Ansagen** über Alexa sobald jemand
heimkommt – und **Einkaufs- und To-do-Listen, die sich selbst sortieren**. Alles wird in der Oberfläche
eingerichtet, **kein YAML**.

🇬🇧 [English](README.md) · 🇩🇪 **Deutsch**

![Wochenansicht](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/week.png)

---

## Inhalt

- [Überblick](#überblick)
- [Modul Wochenplan](#modul-wochenplan)
  - [Ämtli nach Wochentag](#ämtli-nach-wochentag)
  - [Besondere Ämtli nach Datum](#besondere-ämtli-nach-datum)
  - [Tageswechsel zur gewünschten Uhrzeit](#tageswechsel-zur-gewünschten-uhrzeit)
  - [Termine bei der richtigen Person](#termine-bei-der-richtigen-person)
  - [Schule & Stundenplan](#schule--stundenplan)
  - [Ferien pausieren Ämtli](#ferien-pausieren-ämtli)
  - [Zuverlässigkeit, Punkte, Level & Auszeichnungen](#zuverlässigkeit-punkte-level--auszeichnungen)
  - [Echte Belohnungen](#echte-belohnungen)
  - [Ansagen bei Bewegung](#ansagen-bei-bewegung)
  - [Bilder: Avatare oder eigenes Foto](#bilder-avatare-oder-eigenes-foto)
- [Modul Smarte Listen](#modul-smarte-listen)
- [Designs](#designs)
- [Installation](#installation)
- [Einrichtung](#einrichtung)
- [Ansichten & Bedienung](#ansichten--bedienung)
- [Entitäten](#entitäten)
- [Dienste (Aktionen)](#dienste-aktionen)
- [Eigene Dashboards](#eigene-dashboards)
- [Sicherheit & Datenschutz](#sicherheit--datenschutz)
- [Umstieg vom Prototyp](#umstieg-vom-prototyp)
- [Entfernen](#entfernen)
- [Unterstützen](#unterstützen)

---

## Überblick

| | |
|---|---|
| **Module** | *Wochenplan* (Ämtli, Termine, Schule, Ferien, Punkte, Belohnungen, Ansagen) und *Smarte Listen* – einzeln ein- und ausschaltbar, weitere Module folgen |
| **Bedienung** | Eigener Eintrag in der Seitenleiste mit Navigation *Planer · Listen · Ämtliplan · Belohnungen*; optional als Karten in eigenen Dashboards |
| **Einrichtung** | Komplett über *Einstellungen → Geräte & Dienste*, kein YAML |
| **Sprachen** | Deutsch und Englisch (Einstellungen und Oberfläche, folgt der HA-Sprache) |
| **Designs** | Home Assistant, Loxone, Apple Home, Google Home, Hell, Nord |
| **Abhängigkeiten** | Keine. Kalender, Listen, Lautsprecher und KI sind optional – es funktioniert jede passende Entität |
| **Voraussetzung** | Home Assistant 2026.3 oder neuer |

---

## Modul Wochenplan

### Ämtli nach Wochentag

![Ämtliplan](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/chore-plan.png)

- Pro Ämtli **mehrere Personen**, pro Person **eigene Wochentage** (z. B. Tisch decken: Lea Mo + Sa, Mia Di + So).
- **Rhythmus** pro Tag: jede Woche oder alle 2, 3, 4 … Wochen mit wählbarer Startwoche.
- **Zeit zum Erledigen**: „nur am Mittwoch“ oder „Mittwoch bis Samstag“. Erst nach Ablauf der Frist zählt ein Ämtli als „nicht gemacht“.
- **Punkte pro Ämtli** einstellbar (sonst gilt der Standardwert).
- **Wochenübersicht**: wie viele Ämtli jede Person pro Wochentag hat – so bleibt es fair.
- Änderungen gelten **sofort**; die Vergangenheit bleibt, wie sie war.

### Besondere Ämtli nach Datum

![Besondere Ämtli](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/special-chores.png)

Für alles, was nicht wöchentlich ist:

| Art | Beispiel |
|---|---|
| **Intervall** | alle 6 Monate ab 15.03. – Luftfilter reinigen; alle 2 Wochen – Bettwäsche wechseln |
| **Monatlich** | am 1. jedes Monats; am letzten Tag; am 1. Samstag alle 3 Monate – Rauchmelder testen |
| **Jährlich** | 15.04. und 15.10. – Pneuwechsel |
| **Einmalig** | 21.11.2026 – Keller aufräumen |

- Mehrere Personen, wahlweise **abwechselnd** – ist jemand in den Ferien, übernimmt die nächste Person.
- Bis zu **60 Tage** Zeit zum Erledigen, eigene Punkte.
- Die Liste zeigt die **nächsten drei Termine** mit der zuständigen Person.

### Tageswechsel zur gewünschten Uhrzeit

Standard ist Mitternacht. Stellst du z. B. **03:00** ein, können die Ämtli des Vortags bis 3 Uhr nachts noch
abgehakt werden; danach zählen offene als „nicht gemacht“ und der neue Tag beginnt. Nach einem Neustart wartet der
Tageswechsel, bis die Kalender geladen sind – so wird niemand in den Ferien versehentlich als „nicht gemacht“ gezählt.

### Termine bei der richtigen Person

- Pro Person ein **Kalender** – jede `calendar.*`-Entität: Outlook/Microsoft 365 über *Remote Calendar* (ICS), Google, CalDAV, iCloud, Local Calendar …
- **Farbe des Kalenders = Farbe der Person**; jeder Termin trägt ein kleines Kalender-Abzeichen, damit man sieht, woher er stammt.
- **Zuordnung über Namen und Spitznamen** (abschaltbar): „Lea Turnen“ im Kalender von Mama erscheint bei Lea, „Tommy in Rust“ bei Tom.
- Optional: zugeordnete Termine **zusätzlich beim Kalenderbesitzer** anzeigen.
- Termine einzeilig: Titel, Zeit von–bis, Dauer, Kalender. Button zum **sofortigen Synchronisieren**.

### Schule & Stundenplan

![Stundenplan](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/timetable.png)

Pro Kind (oder Person, z. B. Studium/Arbeit):

- **Schulkalender** mit den Lektionen (z. B. ICS aus WebUntis, Schulnetz, LehrerOffice) **oder feste Zeiten** pro Wochentag – bis zu **zwei Blöcke pro Tag** (Vormittag und Nachmittag, wenn das Kind über Mittag heimkommt).
- Optional der **Schul-/Arbeitsweg** in Minuten.
- **Ansicht „Alles“**: pro Block eine Zeile, z. B. `🎒 los 07:35 · zuhause 12:00 · 07:50–11:45` und `🎒 los 13:15 · zuhause 15:25 · 13:30–15:10`. Beim Schulkalender werden Blöcke automatisch getrennt, wenn zwischen zwei Lektionen genug Zeit für den Heimweg ist.
- **Ansicht „Stundenplan“**: nur Personen mit Stundenplan, jede Lektion mit Zeit und Ort (z. B. „Mathematik · Zimmer 12“).
- **Ansicht „Termine“** bleibt frei von Schule; **„Ämtli“** zeigt nur Ämtli.
- An Ferientagen wird keine Schule angezeigt.

### Ferien pausieren Ämtli

- Ein **ganztägiger** (oder mindestens 20 Stunden langer) Termin mit einem **Ferien-Wort** im Kalender einer Person pausiert ihre Ämtli – sie zählen **weder als erledigt noch als verpasst**, Zuverlässigkeit und Serie bleiben unberührt.
- Wortenden zählen: „Ferien“ findet „Skiferien“ und „Sommerferien“, aber nicht „Ferienplanung“.
- **Automatische Erkennung**: Beim ersten Sync eines Kalenders wird ein Jahr zurück und voraus gesucht, wie ihr Ferien nennt (z. B. *Ferien, Urlaub, OOO*). Die Wörter landen im Einstellungsfeld (änderbar) und du bekommst eine Mitteilung.
- Gilt wahlweise für die **Person des Kalenders bzw. die im Titel genannten Personen** oder für die **ganze Familie**.
- Wird ein Ferien-Termin während des Tages eingetragen, verschwinden offene Ämtli sofort (Kalender werden alle 30 Minuten gelesen).
- Im Planer erscheint 🌴 *Ferien*. Schulferien im Schulkalender pausieren bewusst **nicht** (wer daheim ist, macht Ämtli).

### Zuverlässigkeit, Punkte, Level & Auszeichnungen

![Belohnungen](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/rewards.png)

- **Zuverlässigkeit** in Prozent (30 Tage), farbiges Band pro Person; Neue starten mit 100 % (*Startbonus*).
- **Faire Punkte** (Standard): Wer **alle** Ämtli des Tages erledigt, bekommt gleich viele Punkte (Standard 30) – egal ob 2 oder 6 Ämtli. Jedes erledigte Ämtli bringt sofort seinen Anteil; 3 von 6 erledigt = 50 % = 15 Punkte. Die Punkte im Ämtliplan wirken als Gewicht (ein schweres Ämtli mit 20 zählt doppelt so viel wie eines mit 10). Alternativ Modus *Pro Ämtli*: mehr Ämtli, mehr Punkte.
- **Punkte**: zusätzlich **Tagesbonus** für einen ganz erledigten Tag, **Serienbonus** für jede 7-Tage-Serie. Wird ein Ämtli wieder geöffnet, werden die Punkte zurückgebucht.
- **10 Level** von *Starter* über *Profi* und *Held* bis *Grossmeister* – mit Fortschrittsbalken. Eingelöste Punkte senken das Level nie.
- **Auszeichnungen**: 👑 Krone der Woche, 🏆 Pokal des Monats, 🐝 Fleissbiene, ⭐ Perfekte Woche, 🔥 Serie, 🚀 Startbonus – antippen zeigt, warum.
- **Verlauf** pro Person: Ämtli, Boni, Belohnungen.

### Echte Belohnungen

- Eltern legen Belohnungen an: z. B. *Glace = 30 Punkte*, *30 Min Gamen = 50*, *5 Fr. Taschengeld = 250*, *Kino = 400*.
- Pro Belohnung: Icon, Kosten, **Freigabe nötig** ja/nein, **nur für** bestimmte Personen, **höchstens x-mal pro Woche**.
- Kinder lösen am Tablet ein; Punkte werden reserviert, bis die Eltern entscheiden.
- Eltern geben frei als **Admin** oder am Tablet mit **Eltern-PIN** (4–8 Ziffern). Mitteilung in Home Assistant und optional aufs Handy.
- **Punkte geben**: Bonus (oder Abzug) mit Grund, z. B. „Zimmer super aufgeräumt +25“.

### Ansagen bei Bewegung

- **Bewegungsmelder** wählen (Bewegung, Präsenz, Anwesenheit) und eine **Ansage** über
  - Alexa: Benachrichtigungs-Entität *Ankündigen* oder *Sprechen* (Integration *Alexa Devices*), oder
  - eine **TTS-Entität** (z. B. Google Translate, Piper) mit Lautsprechern.
- **Zeitfenster** (z. B. 15–20 Uhr) und **Pause** zwischen Ansagen.
- Ansage, wer noch was offen hat: *„Hallo! Noch offen: Lea: Tisch decken und Abfall leeren. Mia: Ratten füttern.“*
- Optional einmal pro Tag: *„Super gemacht! Alle Ämtli für heute sind erledigt.“*
- Die Ansage wird bei jeder Bewegung **frisch** erstellt – es wird nichts Veraltetes gespeichert.
- Testen per Dienst `family_planer.announce`.

**Warteschlange für einmalige Meldungen** – Meldungen, die nur einmal passieren, warten bis zur nächsten Bewegung
(innerhalb der eingestellten Ruhezeiten, z. B. 07–21 Uhr) und werden dann einmal gesagt, zusammen mit der Ämtli-Erinnerung:
- *„Mia, deine Belohnung ‹30 Min Gamen› wurde freigegeben. Viel Spass!“* – gültig bis zum Tageswechsel.
- *„Tom, in den nächsten 21 Tagen ist ‹Pneuwechsel› dran.“* – für besondere Ämtli; wird gestrichen, sobald das Ämtli erledigt ist.
- Eigene Meldungen aus Automationen mit `family_planer.queue_announcement` (Text, Gültigkeit, optional nur bestimmte Bewegungsmelder, Schlüssel zum Ersetzen/Löschen) und `family_planer.clear_announcement`.

```yaml
# Waschmaschine fertig -> Ansage, sobald jemand vorbeikommt (max. 3 Stunden)
action: family_planer.queue_announcement
data:
  message: Die Wäsche ist fertig, Nina ist dran mit Aufhängen.
  expires: 180
  key: waesche
  motion: [binary_sensor.gang_bewegung, binary_sensor.kueche_bewegung]
```

### Bilder: Avatare oder eigenes Foto

![Bildauswahl](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/avatars.png)

- Viele **bunte, gezeichnete Avatare**: Mädchen, Jungen, Frauen, Männer, Grosseltern, Verkleidete (Held, Astronaut, Pirat, Zauberer, Krone, Katze …).
- **Eigenes Foto hochladen**: wird im Browser quadratisch zugeschnitten und nur in deinem Home Assistant gespeichert.
- Farbe pro Person und Spitznamen direkt im Ämtliplan änderbar.

---

## Modul Smarte Listen

![Listen](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/lists.png)

- **Beliebig viele Listen**, jede auf einer beliebigen To-do-Entität: Alexa, AnyList, Bring!, Todoist, Google Tasks, HA-Einkaufsliste … z. B. *Einkaufen Lebensmittel*, *Einkaufen Hornbach*, *Todos*.
- **Kategorien pro Liste, die sich selbst pflegen**:
  - neue Einträge werden **sofort** einsortiert – über eine eingebaute Wissensliste (Deutsch/Englisch, Lebensmittel, Drogerie, Haushalt, Tierbedarf, Werkzeug, Schrauben, Farbe, Garten, Elektro, Sanitär, Büro …),
  - **täglich** zur eingestellten Uhrzeit wird alles, was noch unter *Sonstiges* liegt, neu geordnet – optional mit einer **KI-Aufgabe** (OpenAI, Google, Ollama …),
  - **nie mehr als 5–20 Kategorien** (pro Liste wählbar); selten genutzte werden unter *Sonstiges* zusammengefasst.
- Eintrag **einmal verschieben – die Liste merkt es sich**.
- Kategorien auf der Karte **umbenennen, sortieren, hinzufügen, löschen**.
- Hinzufügen-Feld, abhaken, erledigte ein-/ausblenden und löschen. Mengenangaben („2x Milch“, „Mehl 1 kg“) werden beim Einordnen ignoriert.

---

## Designs

| Home Assistant | Loxone | Apple Home | Google Home | Hell | Nord |
|---|---|---|---|---|---|
| übernimmt dein HA-Design (Farben, Rundungen) | dunkel, Grün | schwarz, Orange | Material You | weiss, Blau | Nord-Farben |

![Design Hell](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/theme-light.png)

Einstellbar unter *Konfigurieren → Design & Seitenleiste*; Karten in eigenen Dashboards können es mit `theme:` überschreiben.

---

## Installation

**Home Assistant 2026.11 und neuer (Marketplace):**
*Einstellungen → Marketplace* → „Family Planer“ suchen → installieren.
Solange die Integration noch nicht im Katalog ist: *Marketplace → Über Link hinzufügen* → `https://github.com/magi1982/family-planer`.

**Home Assistant 2026.3 – 2026.10 (HACS):**
HACS → ⋮ → *Benutzerdefinierte Repositories* → URL oben, Typ *Integration* → installieren → Home Assistant neu starten.

Danach: *Einstellungen → Geräte & Dienste → Integration hinzufügen → Family Planer*.

---

## Einrichtung

Beim Hinzufügen: **Name**, **Module**, **Familienmitglieder** (mit Komma getrennt) und optional die **erste Liste**.
Alles Weitere unter *Einstellungen → Geräte & Dienste → Family Planer → Konfigurieren*. Jedes Feld hat dort eine
Beschreibung. Die Ämtli selbst werden direkt in der Ansicht **Ämtliplan** bearbeitet (auch am Tablet).

### Alle Einstellungen

**Module ein-/ausschalten**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Aktive Module | beide | *Wochenplan* und *Smarte Listen* einzeln ein-/ausschalten |

**Design & Seitenleiste**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Design | Loxone | Home Assistant, Loxone, Apple Home, Google Home, Hell, Nord |
| Eintrag in der Seitenleiste | ein | Öffnet den kompletten Planer ohne eigenes Dashboard |
| Titel in der Seitenleiste | Name | Text in der Seitenleiste |
| Zurück zur Startansicht nach | 45 s | Angetippter Tag / Person springt danach zurück zu heute |

**Wochenplan → Person hinzufügen / bearbeiten / entfernen**

| Einstellung | Bedeutung |
|---|---|
| Name, Farbe | Farbe gilt auch für den Kalender der Person |
| Kalender | beliebige `calendar.*`-Entität |
| Spitznamen | Termine mit diesem Namen im Titel erscheinen bei der Person |

**Wochenplan → Schule & Stundenplan** (pro Person)

| Einstellung | Bedeutung |
|---|---|
| Schulkalender | Kalender mit den Lektionen (hat Vorrang vor festen Zeiten) |
| Mo–Sa Block 1 / Block 2 | feste Zeiten, zweiter Block z. B. für den Nachmittag |
| Schulweg berücksichtigen, Dauer | zeigt „los“ und „zuhause“ je Block |

**Wochenplan → Ferien & Abwesenheit**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Ämtli in den Ferien pausieren | ein | Ferien-Tage zählen weder als erledigt noch als verpasst |
| Wörter für Ferien | automatisch erkannt | z. B. *Ferien, Urlaub, OOO*; Wortenden zählen („Skiferien“) |
| Ferien gelten für | Person / Genannte | oder ganze Familie |
| Ganzer Tag ab | 20 h | Mindestdauer eines Termins mit Uhrzeit, um als Ferientag zu zählen |
| Kalender prüfen alle | 30 min | Wie oft auf neue Ferien geprüft wird |
| Neu durchsuchen | – | Kalender erneut nach Ferien-Wörtern durchsuchen |

**Wochenplan → Punkte & Belohnungen**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Belohnung: Titel, Icon, Kosten | – | z. B. *30 Min Gamen*, 50 Punkte |
| Freigabe nötig / Nur für / Max. pro Woche | ja / alle / unbegrenzt | Regeln pro Belohnung |
| Punkte verteilen | Fair | *Fair*: ein ganzer Tag zählt, nicht die Anzahl Ämtli · *Pro Ämtli*: jedes Ämtli bringt seine Punkte |
| Punkte für einen ganzen Tag (fair) | 30 | Wird auf die Ämtli des Tages verteilt, jedes erledigte bringt sofort seinen Anteil |
| Punkte pro Ämtli | 10 | Modus *Pro Ämtli*: Punkte je Ämtli · Modus *Fair*: Standard-Gewicht; pro Ämtli im Ämtliplan änderbar |
| Tagesbonus | 5 | ganz erledigter Tag |
| Serienbonus | 20 | jede 7-Tage-Serie |
| Eltern-PIN | – | 4–8 Ziffern, für Freigaben am Tablet; Sperre nach 5 Fehlversuchen |
| Anfragen melden an | – | zusätzliche Benachrichtigung (z. B. Handy-App) |

**Wochenplan → Ansagen bei Bewegung**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Ansagen einschalten | aus | |
| Bewegungsmelder | – | Bewegung, Präsenz, Anwesenheit |
| Ansage über / TTS + Lautsprecher | – | Alexa-Benachrichtigung („Ankündigen“/„Sprechen“) oder TTS |
| Von / Bis | 15:00 / 20:00 | Zeitfenster für Ämtli-Erinnerungen |
| Höchstens alle | 60 min | Pause zwischen Erinnerungen |
| Auch ansagen, wenn alles erledigt ist | ein | einmal pro Tag |
| Nur für | alle | Personen in der Erinnerung |
| Ämtli pro Person in der Ansage | 3 | weitere als „und 2 weitere“ |
| Warteschlange für einmalige Meldungen | ein | Meldungen warten auf Bewegung |
| Meldungen frühestens ab / spätestens bis | 07:00 / 21:00 | Ruhezeiten der Warteschlange |
| Freigegebene Belohnungen ansagen | ein | |
| Belohnungs-Meldung gültig für | 0 = bis Tageswechsel | Stunden |
| Besondere Ämtli ansagen | ein | entfällt, wenn erledigt |

**Wochenplan → Einstellungen**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Tageswechsel um | 00:00 | bis dahin können Ämtli des Vortags abgehakt werden |
| Termine anhand von Namen zuordnen | ein | „Lea Turnen“ erscheint bei Lea |
| Auch beim Kalenderbesitzer zeigen | aus | |
| Plan nur durch Admins änderbar | aus | Kinder können abhaken und Belohnungen anfragen |
| Zuverlässigkeit berechnen über | 30 Tage | |
| Heimweg über Mittag ab | 0 = automatisch | Pause in Minuten, ab der der Schultag in Blöcke geteilt wird |

**Smarte Listen → Liste hinzufügen / bearbeiten / entfernen**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Name, To-do-Liste, Icon | – | jede `todo.*`-Entität |
| Höchstens so viele Kategorien | 10 | 5–20 |
| Kategorien automatisch pflegen | ein | sofort einsortieren und täglich optimieren |

**Smarte Listen → Einstellungen**

| Einstellung | Standard | Bedeutung |
|---|---|---|
| Tägliche Optimierung um | 03:00 | |
| KI-Aufgabe | – | optional, ordnet auch Unbekanntes ein |
| Ungenutzte Kategorie ersetzen nach | 30 Tage | macht Platz, wenn die Liste voll ist |

---

## Ansichten & Bedienung

Die Navigation ist auf allen Seiten oben in der Mitte an derselben Stelle.

**Planer** – die Woche im Querformat, optimiert fürs Tablet:
- Heute gross, die nächsten zwei Tage und das Wochenende mittel, Vergangenheit und spätere Tage schmal (vergangene Tage nur farbig mit Anzahl).
- Tag antippen zeigt ihn gross; Pfeile für andere Wochen, „Heute“ springt zurück.
- Filter **Alles · Ämtli · Termine · Stundenplan**.
- Ämtli direkt antippen zum Abhaken; Fristen („bis Sa“, „heute fällig“) sichtbar.
- Person antippen: Zuverlässigkeit, Serie, Auszeichnungen und wie man sie bekommt.

**Listen** – Tabs pro Liste, Hinzufügen-Feld, Kategorien als Kacheln, *Kategorien* und *Optimieren*.

**Ämtliplan** – Personen mit Bild & Farbe, Wochenübersicht, Ämtli nach Wochentag, darunter **Besondere Ämtli**.

**Belohnungen** – Punkte, Level, offene Freigaben, Belohnungen pro Person, Verlauf, *Punkte geben*.

---

## Entitäten

Pro Person (Gerät „Familienmitglied“):

| Entität | Inhalt |
|---|---|
| `todo.<person>_amtli` | Heutige Ämtli – abhaken auch per App, Sprachassistent oder Automation |
| `sensor.<person>_zuverlassigkeit` | Zuverlässigkeit in %, Attribute: offen/erledigt heute, Serie, Woche/Monat, Auszeichnungen |
| `sensor.<person>_punkte` | Punktestand, Attribute: verfügbar, gesamt verdient, Level, Level-Name, nächstes Level |

Die Entitäten-IDs richten sich nach der HA-Sprache und dem Personennamen.

---

## Dienste (Aktionen)

| Dienst | Zweck |
|---|---|
| `family_planer.rollover` | Tag sofort neu berechnen |
| `family_planer.set_item` | Ämtli per ID abhaken oder öffnen |
| `family_planer.add_points` | Punkte geben oder abziehen (Person, Punkte, Grund) |
| `family_planer.announce` | Ansage sofort auslösen (ohne Zeitfenster/Pause), gibt den Text zurück |
| `family_planer.queue_announcement` | Einmalige Meldung für die nächste Bewegung vormerken |
| `family_planer.clear_announcement` | Vorgemerkte Meldung per Schlüssel löschen |
| `family_planer.optimize_lists` | Alle Smarten Listen jetzt neu sortieren (optional mit KI) |
| `family_planer.import_legacy` | Daten aus dem To-do-Listen-Prototyp übernehmen |

Beispiel-Automation: Bonuspunkte, wenn die Waschmaschine ausgeräumt wurde.

```yaml
action: family_planer.add_points
data:
  person: Mia
  points: 15
  reason: Wäsche aufgehängt
```

---

## Eigene Dashboards

Nicht nötig – aber möglich. Die Karten werden automatisch geladen.

```yaml
type: vertical-stack
cards:
  - type: custom:family-planer-nav-card
    paths: { planer: planer, listen: einkauf, aemtliplan: aemtliplan, belohnungen: belohnungen }
  - type: custom:family-planer-card
    view: week        # week | plan | lists | rewards
    theme: apple      # optional
    language: de      # optional, sonst HA-Sprache
```

Für ein Vollbild-Tablet empfiehlt sich eine Panel-Ansicht pro Seite (Pfade wie oben) und z. B. *Kiosk Mode*.

---

## Sicherheit & Datenschutz

- Alles bleibt **lokal** in deinem Home Assistant; keine Cloud, kein Tracking. Externe Dienste nur, wenn du sie selbst wählst (Kalender, Listen, KI).
- Eingaben werden serverseitig geprüft (Farben, Bilder, Icons, Texte, Längen), Ausgaben im Browser maskiert.
- Eltern-PIN mit PBKDF2 gespeichert, Sperre nach 5 Fehlversuchen; optional dürfen nur Admins den Plan ändern.
- Fotos haben lange Zufallsnamen; Diagnose-Downloads enthalten keine Namen, Fotos oder Listeninhalte.
- Bei jedem Commit: **CodeQL**, **Bandit**, ESLint-Sicherheitsregeln, hassfest, HACS-Prüfung, Tests.

Details: [SECURITY.md](https://github.com/magi1982/family-planer/blob/main/SECURITY.md)

---

## Umstieg vom Prototyp

Wer den Familienplaner vorher mit To-do-Listen (`todo.amtli_plan`, `todo.amtli_heute`, `todo.amtli_verlauf`,
`todo.familienplaner_einstellungen`) betrieben hat, übernimmt alles mit:

```yaml
action: family_planer.import_legacy
data:
  plan: todo.amtli_plan
  today: todo.amtli_heute
  history: todo.amtli_verlauf
  settings: todo.familienplaner_einstellungen
```

---

## Entfernen

1. *Einstellungen → Geräte & Dienste → Family Planer → Löschen*.
2. Im Marketplace bzw. in HACS deinstallieren und Home Assistant neu starten.
3. Hochgeladene Fotos liegen in `config/family_planer/` und können gelöscht werden.

---

## Unterstützen

Wenn der Family Planer euren Familienalltag etwas leichter macht, freue ich mich über einen
[☕ Kaffee](https://www.buymeacoffee.com/magibuilds). Danke!

<a href="https://buymeacoffee.com/magibuilds"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>

Fehler und Wünsche: [Issues](https://github.com/magi1982/family-planer/issues)
