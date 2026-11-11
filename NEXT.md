# Ideen für die nächsten Versionen

> Arbeitsweise: Ideen werden hier gesammelt. Code wird erst geschrieben, wenn der Maintainer „mach es“ sagt.
> Jedes Update durchläuft die Release-Checkliste unten. **Vor jedem Release wird gefragt**; Release Notes und CHANGELOG sind auf Englisch.

## Umgesetzt in 0.6.0

### 1. To-dos im Ämtliplan (ohne Ablaufdatum)
**Status:** ✅ umgesetzt in 0.6.0

- Ein einfaches To-do kann einer Person im Ämtliplan zugeordnet werden, **ohne Datum und ohne Wiederholung**.
- Es bleibt sichtbar, bis es erledigt ist, und wandert nicht beim Tageswechsel weg.
- **Erledigen mit Bestätigung:** Ein Klick öffnet die Frage „Als erledigt markieren?“ mit den Antworten *Ja* oder *Abbrechen*. Erst nach dem *Ja* ist das To-do erledigt. Bei Ämtli reicht dagegen ein einfacher Klick.
- Optisch klar von den Ämtli unterschieden (eigenes Symbol oder eigener Abschnitt).

**Mögliche Einstellungen** (bei der Umsetzung prüfen, jeweils mit Beschreibung auf Deutsch und Englisch):
- Bestätigung beim Erledigen ein oder aus (Standard: ein)
- Punkte für To-dos: keine, feste Punkte oder pro To-do wählbar
- Wer To-dos anlegen darf: alle oder nur Eltern/Admin
- Erledigte To-dos nach X Tagen ausblenden
- Offene To-dos in Ansagen erwähnen: ja oder nein

**Offene Fragen:**
- Sollen To-dos Punkte geben, und zählen sie für den fairen Tageswert?
- Sollen To-dos auch als `todo`-Entität in Home Assistant erscheinen?

### 2. Schöne Einstellungs-Oberfläche im Planer
**Status:** ✅ umgesetzt in 0.6.0

- Neue Ansicht **„Einstellungen“** direkt im Family Planer (Seitenleiste/Tablet), statt der mühsamen Home-Assistant-Dialoge.
- Übersichtlich in Kacheln/Tabs: *Personen & Kalender*, *Schule*, *Ferien*, *Punkte & Belohnungen*, *Ansagen*, *Listen*, *Design & Sprache*, *Allgemein*.
- Direkte Bearbeitung mit Live-Vorschau (z. B. Farbe, Design, Sprache), Personen per Drag & Drop sortieren, Entitäten mit Suche auswählen.
- Jede Einstellung mit kurzer Beschreibung (DE/EN) direkt daneben.
- Die bisherigen HA-Optionen bleiben als Fallback bestehen.

**Mögliche Einstellungen / Schutz:**
- Zugriff immer mit **Eltern-PIN** (entschieden), optional zusätzlich nur für Admins

### 3. Belohnungen im Dashboard anlegen und ändern – mit Eltern-PIN
**Status:** ✅ umgesetzt in 0.6.0

- In der Ansicht *Belohnungen* Belohnungen **hinzufügen, bearbeiten, löschen** (Titel, Icon, Punkte, Freigabe nötig, nur für, max. pro Woche).
- **Jede Änderung verlangt die Eltern-PIN** (auch für Admins am Tablet).
- **Start-PIN 123456**, änderbar im Dashboard (alte PIN + neue PIN) und in den Einstellungen.

**Sicherheit (bei der Umsetzung):**
- Solange die Start-PIN aktiv ist: deutlicher Hinweis im Dashboard und als Reparaturhinweis in Home Assistant („Bitte Eltern-PIN ändern“), optional Pflicht zur Änderung beim ersten Gebrauch.
- PIN weiterhin nur gehasht (PBKDF2), Sperre nach 5 Fehlversuchen, PIN-Prüfung serverseitig.

**Entschieden:**
- Die Änderung der Start-PIN wird **beim ersten Gebrauch erzwungen** (vorher keine Änderungen an Belohnungen oder Einstellungen möglich).
- Dieselbe Eltern-PIN schützt auch die **Einstellungs-Oberfläche** (Idee 2).

### 4. Vollbild per Doppelklick
**Status:** ✅ umgesetzt in 0.6.0

- **Doppelklick / Doppeltippen** auf den Family Planer schaltet in den **Vollbildmodus** (Kopfzeile und Seitenleiste von Home Assistant verschwinden), nochmals doppeltippen beendet ihn – wie in der früheren lokalen Version.
- Funktioniert in der Seitenleisten-Ansicht und auf Dashboard-Karten; Doppeltippen auf Ämtli, Knöpfe oder Eingabefelder löst es nicht aus.
- Fallback, wenn der Browser kein echtes Vollbild erlaubt (z. B. iPhone-Safari): Kopfzeile und Seitenleiste ausblenden.

**Mögliche Einstellungen:**
- Vollbild per Doppelklick ein/aus (Standard: ein)
- Beim Öffnen automatisch Vollbild (Standard: aus)

## Umgesetzt in 0.7.0

- To-dos und *Punkte geben* mit Grössen *Klein / Mittel / Gross* (Gross = Tagesmaximum, Klein = ⅓ aufgerundet)
- Belohnungs-Kategorien *Klein / Mittel / Gross / Mega gross / Riesig* (Gross = ein Monat mit allen Ämtli inkl. Boni), Gegenwert einstellbar
- Schulblöcke nur 1 h vor dem Losgehen bis 1 h nach dem Heimkommen (einstellbar)
- Grössere Pokale, kein „frei“-Text, Spaltenbreiten heute/morgen/Rest, Ämtli zu zweit nebeneinander
- To-dos im Planer über einen Knopf oben rechts in eigenem Fenster
- Fehler: Belohnungen ohne Auswahl für alle, mit Auswahl nur für die Person

## Umgesetzt in 0.8.0

- Design-Auswahl oben rechts in der Navigation mit Mini-Vorschau, optional nur mit Eltern-PIN

## Umgesetzt in 0.8.1

- Fair-Modus auch bei Prozent, Krone, Pokal und Fleissbiene (jeder Tag zählt gleich)
- Belohnungen: Übersicht mit Personen pro Belohnung, Auswahl zeigt nur deren Belohnungen

## Umgesetzt in 0.9.0

- „+ Besonderes Ämtli“ und „+ To-do“ oben im Ämtliplan; „+“ neben „To-dos“ im Planer
- Hinweis bei fehlender Dashboard-Ansicht in der Navigation; Rückfrage beim Anlegen eines zweiten Planers
- Rahmen Platin (Pokal) / Gold (Krone) / Silber (Perfekte Woche) / Bronze (Fleissbiene), Krone gerade und mittig
- Startbonus entfernt; Medaillen metallisch; 6 neue Pokale (Aufsteiger, Frühaufsteher, Wochenend-Held, Diamant, Meilensteine, Teamwork)
- Pokale pro Woche / Monat / beim Erreichen, Punkte pro Gewinn (auch beim erneuten Gewinnen), jede Auszeichnung ein/aus und Grösse einstellbar
- Konfetti für alle: klein mit Namen bei „alles erledigt“, mittel/gross in Pokalfarbe, höchstens ein grosses pro Person und Tag
- Handy: nur heute mit ‹ › und Wischen
- Kopfzeile auf einer Ebene, Uhrzeit und Datum in der Navigation
- Designs Standard (HA), Hell, Dunkel, Regenbogen, Weltall – je Standard / Transparent / Glas
- Personen-Reihenfolge und Rolle (Kind/Erwachsen), Kinder oben
- Ferien-Check in der Navigation: weg (Ämtli pausieren) oder zu Hause
- Belohnungen: „Noch zu gewinnen“ oben, Personen-Kacheln mit „+ Belohnung“ und laufenden Belohnungen, Prognose (Familienschnitt und pro Person)
- Navigation: Reihenfolge und sichtbare Knöpfe einstellbar; Ämtliplan unter Einstellungen → Ämtli
- Einstellungen: Allgemein, Personen, Ämtli, Punkte, To-dos, Listen, Ferien, Ansagen, Status
- PIN-Regel: jede Änderung braucht die Eltern-PIN, ausser Bild ändern, abhaken und einlösen
- Avatar-Baukasten: Figur, 12 Frisuren, 12 Haarfarben, 9 Hautfarben, kombinierbare Extras, eigene Helden-Kostüme (keine Marvel/DC-Figuren); Test über alle Kombinationen
- Aus Idee 18: offene Ämtli zuerst, Jetzt-Linie, nächster Termin „in 25 Min“, vergangene Termine abgeblendet, Häkchen-Animation beim Abhaken, Wischen, Rückkehr zu heute

## Archiv: Ideen 5–18 (Details zu 0.9.0)

> **10.11.: Maintainer: „Alles in eins und bitte jetzt machen“** – Ideen 5–18 kommen gemeinsam in **0.9.0**.

### 5. „+ Hinzufügen“-Knopf oben rechts im Ämtliplan
**Status:** ✅ umgesetzt in 0.9.0

- Im **Ämtliplan** oben rechts ein gut sichtbarer Knopf **„+ Hinzufügen“** (auf dem Tablet gross genug zum Tippen).
- Ein Tipp öffnet eine kleine Auswahl:
  - **Besonderes Ämtli** – mit Datum, Wiederholung (Intervall, monatlich, jährlich, einmalig) und Frist, z. B. *Luftfilter reinigen alle 6 Monate* oder *Pneuwechsel am 15. März*
  - **To-do** – ohne Datum, bleibt bis erledigt
- Danach direkt das passende Formular (Titel, Person(en), Punkte, Icon) – ohne zuerst nach unten zu den bestehenden Abschnitten scrollen zu müssen.
- Gleicher Knopf auf Deutsch und Englisch; optisch wie die übrigen Knöpfe im gewählten Design.

**Mögliche Einstellungen** (bei der Umsetzung prüfen, jeweils mit Beschreibung DE/EN):
- Wer über den Knopf hinzufügen darf: alle, nur Eltern (Eltern-PIN) oder nur Admins
- Knopf auch in der Wochenansicht (Planer) anzeigen: ja/nein

**Entschieden (10.11.):** Zwei getrennte Knöpfe oben – **„+ Besonderes Ämtli“** und **„+ To-do“** (wie im Planer). Da der Ämtliplan in die Einstellungen wandert (Idee 16), sitzen die Knöpfe dort im Untermodul *Ämtli*; der Planer bekommt neben „To-dos“ ebenfalls ein „+“.

### 6. Kleinere Verbesserungen aus der ersten Installation
**Status:** ✅ umgesetzt in 0.9.0

- **Fehlende Dashboard-Seite melden:** Zeigt die Navigationsleiste auf eine Seite, die es im Dashboard nicht gibt (z. B. `einstellungen`), springt Home Assistant still auf die erste Seite. Besser: Knopf ausblenden oder einen Hinweis zeigen, welche Ansicht/`paths` fehlt.
- **Zweiten Planer bewusst anlegen:** Wird die Integration ein zweites Mal hinzugefügt, entstehen alle Entitäten doppelt (`_2`). Beim Einrichten fragen „Es gibt schon einen Planer – wirklich einen zweiten anlegen?“.

### 7. Platin-, Gold-, Silber- und Bronzerahmen statt kleiner Krone
**Status:** ✅ umgesetzt in 0.9.0

- Statt der kleinen Krone auf dem Kopf der Figur bekommt das runde Personenbild einen **edlen, coolen Rahmen** (Platin, Gold, Silber oder Bronze), je nach Auszeichnung.
- Rahmen als metallischer Verlauf (hell → dunkel) mit leichtem Glanz bzw. sanftem Schimmer; dezent animiert, ohne vom Planer abzulenken.
- Gilt überall, wo das runde Bild erscheint: Planer (Personenspalte), Personendetails, Belohnungen.
- Optisch passend zu jedem Design (Loxone, Apple, Google, Hell, Nord, Home Assistant), auch im hellen Design gut sichtbar.

**Mögliche Einstellungen** (bei der Umsetzung prüfen, jeweils mit Beschreibung DE/EN):
- Rahmen animiert (Schimmer) ein/aus – Standard: ein; auf Geräten mit „Bewegung reduzieren“ automatisch aus
- Krone zusätzlich anzeigen: ja/nein (Standard: nein)

**Entschieden:** Vier Rahmen – **Platin, Gold, Silber, Bronze** – je für eine Auszeichnung. Vorschlag für die Zuordnung (nach Schwierigkeit):

| Rahmen | Auszeichnung | Warum |
|---|---|---|
| **Platin** | 🏆 Pokal des Monats | beste Quote über 30 Tage – am schwersten |
| **Gold** | 👑 Krone der Woche | beste Quote der letzten 7 Tage |
| **Silber** | ⭐ Perfekte Woche | 7 Tage alle Ämtli erledigt |
| **Bronze** | 🐝 Fleissbiene | meiste erledigte Ämtli der Woche |

- Hat jemand mehrere Auszeichnungen, zeigt das Bild den **wertvollsten Rahmen**; die übrigen bleiben als kleine Abzeichen neben der Prozentzahl.
- Platin bekommt einen kühlen, weiss-bläulichen Schimmer, Gold warm-gelb, Silber hellgrau, Bronze kupferfarben.
- Antippen der Person zeigt wie bisher, warum sie den Rahmen hat.

**Offene Fragen:**
- Passt die Zuordnung oben so?
- Krone und Rahmen zusammen? Der Maintainer wünscht inzwischen (siehe Idee 8), dass die kleine Krone **gerade über dem Kopf** bleibt – Vorschlag: Krone der Woche = Krone über dem Kopf **und** Goldrahmen; die Einstellung „Krone zusätzlich anzeigen“ entfällt dann.

### 8. Auszeichnungen: Startbonus weg, Krone gerade, alles cooler, 6 neue Pokale
**Status:** ✅ umgesetzt in 0.9.0

**Startbonus entfernen**
- 🚀 *Startbonus* fällt als Auszeichnung weg (Abzeichen, Regel-Liste, Sensor-Attribut `awards`). Neue Personen starten weiterhin mit 100 % Zuverlässigkeit, aber ohne eigenes Abzeichen.

**Krone genau und gerade über dem Kopf**
- Heute ist die Krone um −10° gedreht und leicht versetzt (`.crown … rotate(-10deg)`). Neu: **waagrecht und genau mittig** über dem Kopf, auf jeder Bildgrösse (Planer 56 px, Detail 64 px, Belohnungen) gleich.

**Abzeichen cooler und besser sichtbar**
- Grössere, **metallisch gefüllte Medaillen** statt dünner Ringe: Verlauf, feiner Rand, leichter Glanz; Icon in Weiss bzw. dunkel auf hellem Metall.
- Gut lesbar auf jedem Design (auch *Hell*), Kontrast geprüft.
- Kurzer **Schimmer**, wenn eine Auszeichnung neu dazukommt (mit „Bewegung reduzieren“ aus).
- Auf schmalen Bildschirmen höchstens 3 Abzeichen + „+2“.

**6 neue Pokale** (alle auch im Modus *Fair* sinnvoll, ohne neue Datenerfassung):

| Pokal | Icon | Regel | Daten |
|---|---|---|---|
| **Aufsteiger** | 📈 `mdi:trending-up` | grösste Verbesserung der Tagesquote ggü. der Vorwoche (mind. +15 Prozentpunkte) | Verlauf |
| **Frühaufsteher** | 🌅 `mdi:weather-sunset-up` | an mind. 4 der letzten 7 Tage alle Ämtli **vor 12 Uhr** erledigt | `done_at` der Ämtli |
| **Wochenend-Held** | 🦸 `mdi:shield-star` | am letzten Wochenende (Sa + So) alle Ämtli erledigt | Verlauf |
| **Diamant-Serie** | 💎 `mdi:diamond-stone` | 30 Tage am Stück alles erledigt (die 🔥-Serie bleibt für 3+ Tage) | Verlauf |
| **Meilenstein** | 🏅 `mdi:medal` | 100 / 500 / 1000 erledigte Ämtli insgesamt (Stufen Bronze/Silber/Gold) | Verlauf/Punktebuch |
| **Familien-Teamwork** | 🤝 `mdi:account-group` | an einem Tag haben **alle** Personen alles erledigt → alle bekommen ihn für diesen Tag | Verlauf |

- Jeder neue Pokal mit Erklärung beim Antippen (DE/EN) und in der Regel-Liste.

**Mögliche Einstellungen** (bei der Umsetzung prüfen, jeweils mit Beschreibung DE/EN):
- Welche Auszeichnungen angezeigt werden (Häkchen pro Auszeichnung) – Standard: alle
- Uhrzeit für *Frühaufsteher* (Standard 12:00)

**Entschieden (10.11.):** Alle Pokale und Gamification-Auszeichnungen geben **Punkte**. Vorschlag (Grössen wie bei To-dos, Gross = Tagesmaximum):

| Klein | Mittel | Gross | 2 × Gross |
|---|---|---|---|
| 🐝 Fleissbiene, 🦸 Wochenend-Held, 🌅 Frühaufsteher | 👑 Krone, ⭐ Perfekte Woche, 📈 Aufsteiger, 🏅 Meilenstein 100 | 🏆 Pokal des Monats, 🏅 Meilenstein 500, 🤝 Teamwork (pro Tag Klein) | 💎 Diamant-Serie, 🏅 Meilenstein 1000 |

- Punkte gibt es **einmal pro Gewinn** (nicht jeden Tag, solange man ihn hält); wandert ein Pokal weiter, bleiben die Punkte. Gewinnt man ihn später **wieder**, gibt es wieder Punkte und Konfetti. ✅ *Punkte-Tabelle am 10.11. bestätigt.*
- **Nicht zu viel** (entschieden 10.11.): Es soll **nicht jeden Tag mehrere Pokale pro Kind** geben. Darum:
  - **Wochen-Auszeichnungen** (👑 Krone, 🐝 Fleissbiene, ⭐ Perfekte Woche, 🦸 Wochenend-Held, 📈 Aufsteiger, 🌅 Frühaufsteher) werden **einmal pro Woche** vergeben (Montag früh für die Vorwoche) und gelten dann die ganze Woche – kein tägliches Hin und Her.
  - 🏆 **Pokal des Monats** einmal pro Monat (am 1.).
  - 💎 Diamant-Serie, 🏅 Meilenstein und 🤝 Teamwork beim Erreichen (selten).
  - Pro Person **höchstens 1 grosser Konfettiregen pro Tag**; weitere Gewinne am selben Tag nur als kurzer Banner.
  - 🔥 Serie bleibt die einzige täglich wechselnde Anzeige (ohne Konfetti und ohne Punkte).
- Einstellung: Punkte pro Auszeichnung anpassbar bzw. ausschaltbar.

### 9. Handy im Hochformat (gefunden am iPhone-Screenshot)
**Status:** ✅ umgesetzt in 0.9.0

- Auf schmalen Bildschirmen (iPhone hoch) überlappen sich Spalten: Ämtli-Texte werden abgeschnitten („Garderob…“), Zahlen in den schmalen Tagen liegen übereinander („5 4 4 Ämtli“), „SUPER“ läuft in die Nachbarspalte.
- **Entschieden (10.11.):** Unter ca. 700 px eine eigene Handy-Ansicht mit **nur einem Tag (heute)**; oben **‹ und ›** zum Blättern zu früheren/späteren Tagen (und Wischen), „Heute“-Knopf zum Zurückspringen. Ämtli einspaltig, Personenspalte schmal (Bild + Prozent).
- Gleiches Verhalten im Dashboard und im Seitenleisten-Panel.

### 10. Konfetti 🎉
**Status:** ✅ umgesetzt in 0.9.0

- Hat eine Person **alle Ämtli des Tages** erledigt: **kleiner Konfettiregen** über den ganzen Bildschirm mit dem **Namen** („Super, Lea! 🎉“), in der Farbe der Person. ✅ *Für alle Personen, auch Eltern (10.11.).*
- Neuer **Pokal** gewonnen: Konfetti **in der Farbe des Pokals** (Krone gold, Diamant türkis/weiss, Bronze kupfer …), **mittel oder gross je nach Schwierigkeit**:
  - mittel: 👑 Krone, ⭐ Perfekte Woche, 📈 Aufsteiger, 🦸 Wochenend-Held, 🏅 Meilenstein 100
  - gross: 🏆 Pokal des Monats, 💎 Diamant-Serie, 🏅 Meilenstein 500/1000, 🤝 Familien-Teamwork
  - **kein Konfetti** für Auszeichnungen, die sofort oder täglich wechseln (🔥 Serie, 🐝 Fleissbiene, 🌅 Frühaufsteher)
- Jede Feier nur **einmal pro Gewinn** und **auf jedem Gerät nur einmal** (merken, was schon gefeiert wurde); dauert 2–4 s, blockiert nichts, mit „Bewegung reduzieren“ nur ein kurzer Banner ohne Animation.
- Einstellungen: Konfetti ein/aus; Lautstärke/Ton optional (Standard aus).

### 11. Planer-Kopfzeile auf einer Ebene
**Status:** ✅ umgesetzt in 0.9.0

- Heute zwei Zeilen (Uhrzeit/Datum + Alles/Ämtli/Termine + Tage blättern, darunter To-dos). Neu **eine Zeile**: Alles · Ämtli · Termine | To-dos (+ „+“) | ‹ KW › / Kalender-Sync.
- **Datum und Uhrzeit** wandern in die **oberste Leiste** (Navigation) – anstelle von „FAMILY PLANER“ (Name optional per Einstellung).
- Mehr Platz für den Plan, vor allem auf dem Tablet quer.

### 12. Neue Designs + Stil-Optionen
**Status:** ✅ umgesetzt in 0.9.0

**Entschieden (10.11.):** Die bisherigen Designs (Loxone, Apple Home, Google Home, Nord) werden ersetzt durch:

| Design | Beschreibung |
|---|---|
| **Standard** | entspricht **Home Assistant** – übernimmt Farben und Hell/Dunkel des HA-Themes (Standard für neue Installationen) |
| **Hell** | heller, ruhiger Hintergrund, kräftige Akzente, gut lesbar bei Tageslicht |
| **Dunkel** | Dark Mode – tiefes Grau/Schwarz, gedämpfte Flächen, ideal fürs Tablet in der Küche am Abend |
| **Regenbogen** | dunkler Grund, Akzente als Regenbogen-Verlauf (Navigation, aktive Knöpfe, Fortschritt, Konfetti), Personen behalten ihre Farbe |
| **Weltall** | tiefblau-violetter Nachthimmel mit dezenten Sternen, leuchtende Akzente – Kinder-tauglich, aber nicht kitschig |

- **Stil-Optionen bleiben** für jedes Design: **Standard · Transparent · Glas** (wie bei Apple: durchscheinend mit Unschärfe `backdrop-filter`, feiner heller Rand; Fallback ohne Unschärfe).
- Design-Auswahl oben rechts: erste Zeile Designs (Mini-Vorschau), zweite Zeile Stil.
- **Umstellung bestehender Installationen**: Home Assistant → Standard, Hell → Hell, Loxone/Apple/Google/Nord → Dunkel (Akzentfarbe bleibt, wo möglich). Karten-Option `theme:` akzeptiert alte Namen weiter.
- Medaillen, Ringe und Rundungen in allen Designs einheitlich und „cooler“ (siehe Idee 8).

✅ *„Weltall“ als fünftes Design bestätigt (10.11.).*

### 13. Personen sortieren (Kinder oben, Eltern unten)
**Status:** ✅ umgesetzt in 0.9.0

- **Reihenfolge der Personen** frei festlegen (Pfeile ↑↓ bzw. Ziehen) im Untermodul *Personen*; gilt in Planer, Belohnungen, To-dos, Auswahllisten.
- Optional Rolle **Kind / Erwachsener** pro Person (hilft auch bei Konfetti nur für Kinder, Belohnungen).

### 14. Ferien aus dem Kalender bestätigen
**Status:** ✅ umgesetzt in 0.9.0

- Erkennt der Planer Ferien/Urlaub im Kalender (Stichwörter aus den Einstellungen), erscheint **oben rechts neben der Design-Auswahl** ein **Prüfen-Symbol** (z. B. `mdi:beach` mit Punkt).
- Antippen zeigt die gefundenen Ferien mit Datum; pro Eintrag wählen: **„Wir sind weg – Ämtli pausieren“** oder **„Wir sind zu Hause – Ämtli weiterführen“** (optional pro Person).
- Die Entscheidung wird gespeichert; das Symbol verschwindet, wenn alles bestätigt ist. Unbestätigt gilt die heutige Einstellung.

### 15. Belohnungen: Prognose + Ansicht wie im Planer
**Status:** ✅ umgesetzt in 0.9.0

- **Prognose beim Erstellen/Bearbeiten** einer Belohnung: „Im Familienschnitt erreichbar in **ca. 12 Tagen**“ und pro Person „Lea mit ihrem aktuellen Schnitt: **ca. 9 Tage**“ (Schnitt = Punkte der letzten 30 Tage pro Tag inkl. Boni/Pokale; bereits gesparte Punkte werden abgezogen).
- Auch im Laden pro Belohnung bei der gewählten Person: „noch ca. 5 Tage“.
- **Belohnungen-Seite neu**:
  - Oben die **noch nicht vergebenen Pokale** – antippen zeigt, **wie man ihn gewinnt** und wer am nächsten dran ist.
  - Darunter die **Personen als Karten wie im Planer** (Bild, Prozent, Auszeichnungen); antippen öffnet die **Personendetails wie im Planer** plus Punkte, Verlauf, Belohnungen der Person und Prognosen.
  - **Jede Personen-Kachel** hat einen Knopf **„+ Belohnung“** (legt eine Belohnung direkt für diese Person an, Eltern-PIN) und zeigt die **laufenden Belohnungen**: offene/freigegebene Anfragen und die Belohnungen, auf die sie gerade spart – mit Fortschritt und Prognose (ergänzt 10.11.).

### 16. Navigation & Einstellungen neu ordnen
**Status:** ✅ umgesetzt in 0.9.0

- **Reihenfolge der Navigation** (Planer, Listen, Belohnungen, Einstellungen …) in den Einstellungen änderbar, einzelne Bereiche ausblendbar.
- **Ämtliplan wandert in die Einstellungen.** Einstellungen mit Untermodulen (Kacheln/Tabs links):
  - **Allgemein** (Sprache, Design-Optionen, Zeiten, Navigation)
  - **Personen** (Name, Bild, Farbe, Kalender, Spitznamen, Stundenplan, Reihenfolge, Rolle)
  - **Ämtli** (bisheriger Ämtliplan + „+ Besonderes Ämtli“, „+ To-do“)
  - **Punkte & Belohnungen**, **To-dos**, **Listen**, **Ferien**, **Ansagen**
  - **Status / Synchronisierung**: läuft der Kalender-Sync, Einkaufsliste, Ansagen? Zeitpunkt der **letzten erfolgreichen** Synchronisierung je Quelle, letzter Fehler, Knopf „jetzt synchronisieren“.
- **PIN-Regel**: **Ohne PIN** darf man nur **sein Bild** ändern – also alles im Avatar-Baukasten: Figur, Frisur, Haarfarbe, **Hautfarbe/Hautton**, **Accessoires** und Verkleidungen. **Alles andere** (Name, Farbe, Kalender, Reihenfolge, Ämtli, Punkte, Einstellungen …) braucht die Eltern-PIN. Ämtli abhaken bleibt natürlich frei.
- **Alle Einstellungen überprüfen**: doppelte/veraltete Felder entfernen (z. B. Design-Feld, Startbonus, alte To-do-Punkte), Texte und Standardwerte an die neuen Funktionen anpassen, HA-Optionsdialog angleichen.

### 17. Avatar-Baukasten
**Status:** ✅ umgesetzt in 0.9.0

- Statt einer festen Bilderliste ein **Baukasten** mit Live-Vorschau:
  - **Grundfigur**: Kind (Mädchen/Junge), Erwachsene, Grosseltern
  - **Frisur** (mehr Auswahl) und **Haarfarbe** (blond, hellbraun, braun, schwarz, rot, grau, bunt …)
  - **Hautfarbe / Hautton** (mind. 8 Abstufungen von sehr hell bis sehr dunkel, warm/kühl)
  - **Accessoires** (mehrere kombinierbar): Kopfhörer, Hut, Cap, Mütze, Brille, Sonnenbrille, Schleife, Haarreif, Krone, Ohrringe, Bart, Sommersprossen
  - **Verkleidungen**: Astronaut, Pirat, Prinzessin, Ritter, Zauberer, Einhorn-Haarreif, Tier-Mützen und **eigene Superhelden-Kostüme** (Umhang, Maske, Emblem in Wunschfarbe)
- **Jede Kombination muss gut aussehen**: feste Ebenen-Reihenfolge, Accessoires passen sich der Frisur an (z. B. Hut verdeckt hohe Frisuren sauber), unpassende Kombinationen werden ausgegraut statt kaputt gezeichnet; automatischer Test, der alle Kombinationen zeichnet und auf Überlappungsfehler prüft.
- Ohne PIN änderbar (siehe Idee 16) – auch die Bilder anderer Personen, das ist ausdrücklich okay (10.11.); bestehende Bilder bleiben gültig.
- **Hinweis:** Echte Marvel- oder andere Marken-Helden (Spider-Man, Iron Man …) kann ich nicht nachzeichnen – sie sind geschützt, und das Repo ist öffentlich. Stattdessen eigene Helden-Kostüme, die man frei einfärben kann.

### 18. Planer allgemein besser (Vorschläge von Claude – bitte bestätigen)
**Status:** ✅ umgesetzt in 0.9.0

- **Jetzt-Linie** und nächster Termin hervorgehoben („in 25 Min: Turnen“).
- Nach **45 s ohne Berührung** automatisch zurück zu heute/Alles (Einstellung „Ruhezeit“ gibt es schon – auf Planer-Ansicht ausweiten).
- **Wischen** links/rechts für Tage bzw. Wochen.
- Grössere Tippflächen für Kinder, Häkchen mit kleiner Animation.
- Ämtli des Tages nach **noch offen zuerst** sortieren, erledigte darunter.


## Umgesetzt in 0.9.1

- Fehler: Design-Auswahl und Ferien-Check bei *Glas* / *Transparent* verdeckt – Popups liegen jetzt immer zuoberst (20)
- Belohnungen: Kacheln zuerst, „Noch zu gewinnen“ darunter, ohne „Bearbeiten“ und „Punkte geben“, Stift zum Ändern (21)
- Einstellungen: ohne PIN nur Bilder, „Eltern-PIN“ öffnet alles; Bildauswahl aus dem Ämtliplan entfernt; „+ Besonderes Ämtli“ / „+ To-do“ im Popup (22)
- Avatar-Baukasten v2 mit Ebenen, 18 Frisuren, Begleitern, 8 Hintergründen und Verkleidungen (23)
- Ferien-Check: 2 Wochen vorher, ohne Vergangene, ganze Familie oder Personen, lange Termine als „Optional“, 4 Wochen in den Einstellungen (24)
- Aus 19: Häkchen-Animation und Jetzt-Linie (schon in 0.9.0), grössere Tippflächen auf dem Handy, Status-Quellen nach 30 Tagen ausblenden

## Archiv: Ideen 19–24 (Details zu 0.9.1)

### 20. Fehler: Design-Auswahl und Ferien-Check bei Stil „Glas“ verdeckt
**Status:** ✅ umgesetzt in 0.9.1

- Mit Stil *Glas* (und *Transparent*) verschwinden die Popups der Navigation (Design, Ferien) hinter dem Planer.
- Ursache: `backdrop-filter` macht Navigation und Planer zu eigenen Ebenen; der Planer kommt später im Dashboard und liegt darum oben.
- Lösung: Navigationskarte bekommt eine eigene, höhere Ebene (`position:relative; z-index`), Popups liegen immer zuoberst. Mit allen 5 Designs × 3 Stilen prüfen.

### 21. Belohnungen aufräumen
**Status:** ✅ umgesetzt in 0.9.1

- „Noch zu gewinnen“ **unter** die Personenkacheln.
- Knopf **„Bearbeiten“ entfällt**: Belohnungen werden über „+ Belohnung“ auf der Personenkachel angelegt; Antippen einer Belohnung (Kachel oder Liste) öffnet sie zum Ändern/Löschen (Eltern-PIN).
- **„Punkte geben“ entfällt** in der Oberfläche – dafür gibt es To-dos mit Grösse. Der Dienst für Automationen bleibt.
- „Eltern-PIN ändern“ nur noch unter Einstellungen.

### 22. Einstellungen: ohne PIN nur der Avatar-Baukasten
**Status:** ✅ umgesetzt in 0.9.1

- Öffnet man *Einstellungen*, sieht man **nur die Personen mit ihrem Avatar** und den Baukasten – jeder darf jedes Bild ändern.
- Oben rechts **„Eltern-PIN“**: nach der Eingabe erscheinen alle Register (Allgemein, Personen, Ämtli, Punkte, To-dos, Listen, Ferien, Ansagen, Status). *Sperren* blendet sie wieder aus.
- Die Bildauswahl im Ämtliplan (Einstellungen → Ämtli) **entfällt** – Bilder gibt es nur noch im Baukasten. Farbe, Name usw. bleiben unter *Personen*.
- Register *Ämtli*: **„+ Besonderes Ämtli“** und **„+ To-do“** öffnen ein **Popup** mit dem Formular statt nach unten zu scrollen.

### 23. Avatar-Baukasten neu denken
**Status:** ✅ umgesetzt in 0.9.1

Aufbau von oben nach unten, mit grosser Live-Vorschau links (auf dem Handy oben). Jeder Teil wird **separat** gewählt:
1. **Hautfarbe** (9 Farbpunkte) und **Haarfarbe** (12 Farbpunkte).
2. **Person** – wenige Grundfiguren: *Mädchen, Junge, Frau, Mann, Grosi, Grosspapi* (Körperform, Gesicht).
3. **Frisur** – separat wählbar, **mindestens 15**, für jede Person: z. B. lang, lang mit Pony, Zöpfe, Dutt, Bob, Locken, Pferdeschwanz, Afro, Rastas, Space-Buns, Undercut, Irokese, kurz, Seitenscheitel, stachelig, Wuschel, Glatze.
4. **Accessoires in Registern** (pro Register höchstens eins, Register frei kombinierbar), jedes Teil als kleine Vorschau auf dem aktuellen Avatar:
   - *Kopf*: Cap, Mütze mit Bommel, Krone, Haarreif mit Blume, Katzen-/Hasen-/Bärenohren, Einhorn-Horn, Partyhut, Kopfhörer, Stirnband
   - *Gesicht*: Brille rund/eckig, Sonnenbrille, Sommersprossen, Wangen-Glitzer, Bart, Schnauz, Pflaster, Gesichtsfarbe Tiger/Schmetterling
   - *Kleidung*: T-Shirt-Farbe (Palette) plus Motiv (Stern, Herz, Blitz, Fussball, Rakete), Schal, Fliege, Kette
   - *Begleiter*: Katze, Hund, Hase, Papagei, **Eidechse, Äffchen**, Mini-Drache, Pinguin, Fuchs, Roboter, Eule – dazu Ballon, Fussball, Gitarre, Zauberstab
   - *Hintergrund*: **8 Muster über der Farbe der Person** (die Personenfarbe bleibt immer sichtbar): Sterne, Regenbogen, Herzen, Konfetti, Weltall, Wolken, Blasen, Blitze
5. **Verkleidung** als **eigene Ebene über der Person**: Raumanzüge (Astronaut, Mars-Anzug), Superhelden-Kostüme (eigene Figuren, z. B. Sternenkraft, Funkenflug, Mondfee, Turbo, Sternschnuppe – keine Marvel/DC), Ninja, Ritter, Pirat, Zauberer, Prinzessin/Prinz, Dino, Feuerwehr. Kopfteile der Verkleidung blenden Kopf-Accessoires aus; Hintergrund und Begleiter bleiben.
- Knopf **„Zufall“** für einen überraschenden Avatar.
- Neues Bild-Format `av2:` mit Ebenen; alte `av:`-Bilder werden automatisch übernommen.
- Test zeichnet weiterhin jede Kombination und prüft Überschneidungen.

### 24. Ferien-Check verbessern
**Status:** ✅ umgesetzt in 0.9.1

- Anzeigen erst **2 Wochen vor Beginn**; **vergangene** Einträge nicht mehr berücksichtigen.
- Pro Eintrag: **„Weg – Ämtli pausieren“** oder **„Hier – Ämtli laufen weiter“**.
- Pro Eintrag zusätzlich wählen: **ganze Familie** oder **einzelne Personen**.
- **Lange Termine ohne Ferien-Wort** (über der eingestellten Stundenzahl, z. B. Lager, Reisen) erscheinen **unter den Ferien als eigener Abschnitt „Optional“**. Ohne Entscheid pausieren sie nichts.
- **Einmal entschieden**, verschwindet ein Eintrag aus dem Ferien-Popup oben rechts (Zähler zählt nur Offene). Unter *Einstellungen → Ferien* bleibt er noch **4 Wochen** sichtbar und kann dort geändert werden.

### 19. Kleinigkeiten nach 0.9.0
**Status:** ✅ umgesetzt in 0.9.1

- Noch grössere Tippflächen im Handy-Modus prüfen
- Status-Seite: Quellen, die es nicht mehr gibt (gelöschter Kalender), nach 30 Tagen ausblenden

## Umgesetzt in 0.10.0

- Grössere Avatare im Planer (25), To-dos und besondere Ämtli im Planer gekennzeichnet (26), Ansicht „To-dos & Spezial“ (27)
- Levels pro Schuljahr mit Bronze bis Rubin, Level-Bonus, Abzeichen mit Leuchten und Effekten beim Antippen, Freischaltungen Level 2–40 mit kleinen und grossen Effekten (28)

## Ideen für die nächste Version

- README (EN/DE) gesammelt nachführen: Levels, Freischaltungen, Planer-Ansicht „To-dos & Spezial“, Bilder ohne PIN, Ferien-Check v2
- Release-Checkliste unten an die sparsame Arbeitsweise anpassen (README nur alle paar Releases)

---

## Release-Checkliste (bei jedem Update)

### Cyber Security
- [ ] Alle Eingaben werden serverseitig geprüft (`validate.py`): Texte, Längen, Farben, Icons, Entitäten, Zeiten
- [ ] Jede Ausgabe im Frontend wird escaped (`esc()`), kein ungeprüftes `innerHTML`
- [ ] WebSocket-Befehle prüfen die Rechte (`_may_edit`, `_parent` mit Admin oder PIN)
- [ ] Keine Geheimnisse im Code oder Log; PIN nur gehasht (PBKDF2), Sperre bleibt aktiv
- [ ] Uploads prüfen Magic Bytes und Grösse und erhalten einen Zufallsnamen
- [ ] Bandit, CodeQL und ESLint (no-unsanitized) ohne Befund
- [ ] Neue Abhängigkeiten geprüft (keine oder begründet)

### Home Assistant Best Practices
- [ ] Alles über Konfiguration und Optionen einstellbar, kein YAML nötig
- [ ] Neue Einstellungen mit `data_description` auf Deutsch und Englisch; die Schlüssel in de/en/strings sind gleich
- [ ] Entitäten mit `translation_key`, `unique_id` und `has_entity_name`; Icons in `icons.json`
- [ ] Neue Services in `services.yaml` und in den Übersetzungen
- [ ] Kein blockierender Code im Event-Loop; Timer werden beim Entladen abgemeldet
- [ ] `diagnostics` schwärzt sensible Daten; `quality_scale.yaml` ist aktuell
- [ ] hassfest und die HACS-Prüfung sind grün

### Qualität und Doku
- [ ] Unit-Tests für die neue Logik; alle Tests grün
- [ ] Frontend neu gebaut, englische Texte ergänzt, alle Designs geprüft
- [ ] README.md (Englisch) und README.de.md (Deutsch): Funktionsbeschreibung und Tabelle „Alle Einstellungen“ in beiden ergänzt
- [ ] CHANGELOG-Eintrag auf Englisch (`## x.y.z – Datum`); Version in `const.py` und `manifest.json` erhöht
- [ ] **Vor dem Release fragen** – erst nach Freigabe Version erhöhen und hochladen
- [ ] Release entsteht automatisch (`release.yml`), sobald Validate und Security grün sind – Text aus dem CHANGELOG
