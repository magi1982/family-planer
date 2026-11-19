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

- ✅ README (EN/DE) nachgeführt in 0.15.0 (Statistik, Taler, Filter „To-dos & Spezial“, Info-Texte, Freiwillig-Reihenfolge, leere Listen, Einstellungen)
- ✅ Release-Checkliste angepasst (0.15.0)

> **15.11.: Grosses Konzept „Saisons, Wetter & Avatare“ (Ideen 29–40).** Entwurf mit Bildern liegt beim Maintainer. Umgesetzt in 0.11.0. Beispielnamen: Lea, Mia, Nina, Sarah, Tom.

### 29. Wetter-Szene oben in der Navigation
**Status:** ✅ umgesetzt in 0.11.0

- Die oberste Leiste bekommt eine **animierte Szene** hinter Uhr, Navigation und Knöpfen (ohne Event: ein Haus mit Garten).
- Das Wetter aus einer **HA-Wetter-Entität** läuft dort immer als Animation: Sonne, teilweise bewölkt (mit Regenbogen), bewölkt, Regen, Starkregen, Gewitter (Blitz), Schnee, Nebel, Sturm, klare Nacht (Mond, Sterne).
- Klein oben rechts: Wetter-Symbol, Temperatur, Text.
- Das Haus ändert sich mit der **Jahreszeit**: Frühling Blüten, Sommer sattes Grün, Herbst orange Bäume und fallendes Laub, Winter kahle Bäume und Schnee.
- Wind bewegt Bäume, Wolken und Kaminrauch; Sturm-Schwelle einstellbar (Standard 50 km/h).

**Einstellungen:** Wetter-Entität, Sturm ab, Effekt-Stärke (dezent/normal/viel), „Bewegung reduzieren“ = keine Partikel.

### 30. Saisons, Feiertage, Bräuche und Ferien als Design-Schicht
**Status:** ✅ umgesetzt in 0.11.0

- Jede Saison ist eine **Schicht über dem gewählten Design** (Standard, Hell, Dunkel, Regenbogen, Weltall × Standard/Transparent/Glas): eigene Kopfzeilen-Szene, eigener Seitenhintergrund (wie Regenbogen), Band oben, Planer-Details (z. B. Schnee auf Kacheln, Eiszapfen-Rand), eigener Häkchen-Effekt.
- **Kein Halloween, kein Räbeliechtli, kein Martinstag.**
- **Aktivierung (Standard):** eintägige Feiertage und Bräuche 3 Tage vorher; Ferien 3 Tage vor dem ersten Ferientag; lange Saisons mit festem Start (Weihnachten ab 1. Advent, Winter ab 7.1., Frühling ab 20.3., Sommer ab 21.6., Herbst ab 23.9.).
- **Priorität bei Überschneidungen:** Geburtstag (nur Person) → Jahrestag → Feiertag → Ferien → lange Saison; per Ziehen änderbar.
- **Untersaisons** ändern Details: 1.–4. Advent (Kerzen zünden sich an), Samichlaus, Heiligabend, Dreikönig, Fasnacht, Ostern, 1. August (Fahnen, ab 21 Uhr Höhenfeuer, 22 Uhr Feuerwerk) usw.
- **Weihnachten: es schneit immer** in der Kopfzeile; echtes Wetter klein oben rechts.
- **Wildheit pro Saison** (ruhig bis wild, z. B. Silvester wild), global dämpfbar.
- Ferien kommen aus dem Kalender (Titel wie „Sportferien“, „Frühlingsferien“, „Pfingstferien“, „Sommerferien“, „Herbstferien“, „Weihnachtsferien“, auch mit Emoji). Familienferien und Ämtli-Pause bleiben wie bisher **von Hand im Ferien-Check**.
- Feiertage aus der HA-Integration „Holiday“ (Kanton wählbar) statt fest im Code.

**Liste:** Ferien (6) · Feiertage: Neujahr, Berchtoldstag, Karfreitag, Ostermontag, Tag der Arbeit, Auffahrt, Pfingstmontag, 1. August, Weihnachtstag, Stephanstag · Bräuche: Dreikönigstag, Valentinstag, Fasnacht, Frühlingsanfang, Ostersonntag, Muttertag, Pfingstsonntag, Vatertag, Sommeranfang, Schulanfang, Bettag, Herbstanfang, Erntedank, 1.–4. Advent, Samichlaus, Winteranfang, Heiligabend, Silvester · Lange Saisons: Weihnachten, Winter, Frühling, Sommer, Herbst · Persönlich: Geburtstage, Hochzeitstag, Kennenlerntag, eigene Familien-Events.

**Szenen (Auswahl):** Winterdorf mit Adventskranz · Silvester-Feuerwerk · Dreikönige mit Stern · Fasnacht als Konfetti-Bild mit Masken · Frühling mit Kirschbaum, Tulpen, Vögeln (Eier nur an Ostern) · Vatertag: Garten mit Hängematte, Papierflieger, „Danke, Papi!“ · Sommerferien am Strand (Palme, Wellen, Wasserball, Krebs, Möwen) · 1. August rot-weiss · Herbst mit Laub und Drachen.

### 31. Avatar-Extras und Avatar-Effekte pro Saison
**Status:** ✅ umgesetzt in 0.11.0

- Neues Register **„Saison“** im Avatar-Baukasten (ohne PIN): pro Event ein Kopf-Extra und eine Aura oder ein Begleiter. Kinder wählen selbst; die Wahl bleibt fürs nächste Jahr.
- **86 Saison-Extras** (5–10 pro Saison, gut die Hälfte animiert wie die Level-Effekte), z. B. Zipfelmütze mit wippendem Bommel, Rentier mit Blinknase, Hasenohren, Schweizerfahne, Strohhut, Skibrille, Partyhut, Superpapi-Umhang.
- **57 Saison-Effekte** (3–4 pro Saison) als Aura wie bei den Levels, z. B. Goldsterne-Kranz, Schneegestöber, Blütenregen, Sonnenkranz, Schweizerkreuz-Kranz, Blätterwirbel, Herz-Kranz.
- Extras und Effekte sind eine **eigene Ebene**: nach dem Event ist automatisch wieder der normale Avatar da.
- Begleiter müssen gut sichtbar im runden Bild sitzen (Test über alle Kombinationen erweitern).

### 32. Geburtstag als eigene Saison
**Status:** ✅ umgesetzt in 0.11.0

- Geburtsdatum pro Person in den Einstellungen.
- Am Geburtstag: Wimpelgirlande, Ballone und Banner „Happy Birthday“ in der Kopfzeile; die Zeile des Geburtstagskinds ist voll animiert.
- **5 Animationen**, eine pro Geburtstag den ganzen Tag, jede Person eine andere, wechselt jedes Jahr: Konfetti-Kanone, Ballon-Fahrt, Seifenblasen, Regenbogen-Disco, Sternenregen. Die Animation kommt **aus der Mitte hinter der Person**.
- Alle Punkte des Geburtstagskinds zählen **doppelt**.

### 33. Hochzeitstag und Kennenlerntag
**Status:** ✅ umgesetzt in 0.11.0

- Zwei Datumsfelder in den Einstellungen; eigene Paar-Saison mit Herzen, Extras für beide Erwachsenen, Anzeige „X Jahre verheiratet / zusammen“.

### 34. Vorschläge unter dem Wetter
**Status:** ✅ umgesetzt in 0.11.0

- Kleiner animierter Vorschlag oben rechts, **ab 12:00**, höchstens einer pro Tag, jeden Tag ein anderer.
- Gewählt (26): Pool Badi-Wetter, Pool-Abendschwumm, Pool-Party, Jacuzzi am Abend (Okt–Apr, Abend trocken, Erwachsene ohne Abendtermin), Jacuzzi unter Sternen, Jacuzzi im Schnee, Eltern-Jacuzzi (ab 21 Uhr, nur Erwachsene), Homecinema, Spieleabend, Backen (nur Weihnachts-Saison), Basteln, Puzzle (höchstens alle 14 Tage), Lego-Challenge, Fotoalbum (höchstens alle 14 Tage), Grillabend, Velotour, Spaziergang (oft, auch abends), Pergola-Znacht (Sommer/warm), Schlitteln, Heisse Schoggi, Adventsfenster, Ostereier suchen, Badi am See, Glace (tagsüber Sommer), Familien-Teamwork-Belohnung, Ruhiger Abend.

**Einstellungen:** ab Uhrzeit, Pool- und Jacuzzi-Sensor (Wassertemperatur) mit Schwelle, jeder Vorschlag ein/aus mit Bedingung und Häufigkeit. Sensoren werden ausgewählt, nie fest im Code.

### 35. Neue Ansicht „Heute“
**Status:** ✅ umgesetzt in 0.11.0

- Nur der aktuelle Tag, **Personen nebeneinander** (links nach rechts): Schule, Termine mit Jetzt-Linie, Ämtli (offene zuerst), To-dos. ‹ › für gestern/morgen, Filter.
- Einstellung **Standard-Ansicht** (Heute = Standard, oder Woche): erscheint beim Zurückkommen aus einem Menü (z. B. Avatar) und nach der Ruhezeit.

### 36. Viele To-dos: nur die 4 ältesten
**Status:** ✅ umgesetzt in 0.11.0

- Pro Person höchstens 4 To-dos (die ältesten), Rest als „+3 weitere“; jedes To-do zeigt, seit wann es offen ist. Anzahl einstellbar.

### 37. Alexa-To-dos bei der richtigen Person
**Status:** ✅ umgesetzt in 0.11.0

- Steht ein Name oder Spitzname (aus Personen) im Alexa-To-do, erscheint es bei dieser Person zum Abhaken; Punkte nach Grösse wie manuelle To-dos. „gross“/„klein“ am Ende setzt die Grösse. Abhaken wird mit Alexa abgeglichen. Mehrere Namen → je ein To-do.

### 38. Ansagen ohne Bewegungsmelder
**Status:** ✅ umgesetzt in 0.11.0

- Solange kein Bewegungsmelder eingetragen ist: feste Ansagen um **12:30** und **18:30**, um **20:00** was heute noch offen ist (max. 3 pro Person).
- Ab und zu ein **Lob** (höchstens 1× pro Tag): 100 %, Serien, Pokale, fast erreichte Belohnung.
- **Geburtstag:** 5 lustige Sonderansagen über den Tag verteilt, an das Geburtstagskind gerichtet, aus einem Pool, nie zweimal am selben Tag.
- Keine Ansagen, wenn im Ferien-Check „weg“ bestätigt ist.

### 39. Sonderämtli: freiwillig, Überraschung, Katalog
**Status:** ✅ umgesetzt in 0.11.0

- Neue Kachel **„Freiwillig“** neben den Personen, nur sichtbar, wenn etwas offen ist. Wer zuerst „Ich nehm's!“ tippt und sich auswählt, bekommt es in den eigenen Plan.
- Vergabe: freiwillig (wer zuerst) · jedes Kind · Überraschung (Zufall, Standard 2 pro Kind und Woche) · fix für eine Person.
- Erfassen (Eltern-PIN): Titel, Punkte, einmalig oder wiederkehrend (täglich, Wochentage, alle X Tage, jährlich), **Vorlauf** und **Frist** (oft inkl. Samstag), sichtbar immer / in einer Saison / bei Wetter, für wen, **geheim** (die gefeierte Person sieht nur „Geheim-Ämtli“).
- Wiederkehrende erscheinen jedes Mal wieder bei „Freiwillig“.
- **Nur Bonuspunkte:** nicht erledigt oder abgelaufen verschlechtert die Zuverlässigkeit (%) nie. Keine Sonderämtli mit dem Geschirrspüler.
- **Katalog mit 56 Vorlagen**, saisonal automatisch angeboten, z. B. Socken-Detektiv, Witz des Tages, Weihnachtslied vorsingen, Christbaumkugeln (jedes Kind, ab 10.12. bis 24.12.), Samichlaus-Versli, Maske basteln, Eier färben, Frühstück ans Bett (geheim), Laubhaufen rechen (ab Di, 5 Tage inkl. Samstag), Geburtstagskarte (3 Tage vorher, geheim).

### 40. Einstellungen dazu (alles hinter der Eltern-PIN)
**Status:** ✅ umgesetzt in 0.11.0

- Register **„Saisons & Wetter“**: Saisons an/aus, Vorlauf-Regeln, pro Event an/aus, Vorlauf, Priorität, Extras; Wetter-Entität; „Weihnachten immer Schnee“; Sturm ab; Wildheit; Vorschläge.
- **Personen:** Geburtstag + Animation (automatisch wechselnd oder fest); Hochzeitstag; Kennenlerntag.
- **Allgemein:** Standard-Ansicht, To-dos pro Person.
- **Ansagen:** feste Zeiten, Tagesabschluss 20:00, Lob, Geburtstags-Sonderansagen.
- **Sonderämtli:** Überraschungen pro Woche, Saison-Vorlagen, Kachel nur wenn offen.
- Jede Einstellung mit Beschreibung auf Deutsch und Englisch.

**Offene Fragen:**
- Reihenfolge der Umsetzung (Vorschlag: 29 Wetter-Szene → 35 Heute → 30 Saisons → 31/32 Avatare & Geburtstag → 39 Sonderämtli → 34/38/37/36).
- Zweite Wetter-Entität für den Ferienort (Skiferien)?

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
- [ ] Vor dem Bauen prüfen, ob es die Funktion (oder Teile davon) schon gibt
- [ ] Unit-Tests für die neue Logik; alle Tests grün
- [ ] Frontend neu gebaut (`python frontend_src/build.py`), englische Texte ergänzt, im Browser auf Tablet und Handy angeschaut
- [ ] Datenschutz-Suche nach echten Namen / Adressen vor jedem Commit; Beispiele nur mit Beispieldaten (Lea, Mia, Sarah, Tom)
- [ ] README.md (Englisch) und README.de.md (Deutsch): neue Funktionen und Tabelle „Alle Einstellungen“ – bei grossen Releases, sonst gesammelt
- [ ] CHANGELOG-Eintrag auf Englisch (`## x.y.z – Datum`); Version in `const.py` und `manifest.json` erhöht
- [ ] **Vor dem Release fragen** – erst nach Freigabe Version erhöhen und hochladen
- [ ] Release entsteht automatisch (`release.yml`), sobald Validate und Security grün sind – Text aus dem CHANGELOG

### 41. Eigenes Haus in der Kopfszene
Einstellung unter *Saisons & Wetter*: „Standard-Haus“ oder „Haus mit Pool & Pergola“. Entwurf freigegeben (2D, im Stil der Landschaft): zweistöckiges, hohes Haus mit Giebel zur Gartenseite, roter Dachrand, Kamin; oben zwei gleich grosse Fenster, unten drei bodenebene Fenster; schlichte Pergola (Dach, zwei Pfosten, Tisch); Garage direkt links angebaut mit Flachdach und Milchglas-Geländer; Strohschirm; Pool vorne im Süden. Passt sich an: Schnee auf Dach/Geländer/Pergola, Poolabdeckung im Winter, Fenster und Pergola-Licht am Abend, Lichterkette im Advent, **Eiszapfen unter −5°**. Adventskranz auf die Wiese neben das Haus.
**Status:** ✅ umgesetzt in 0.12.0

### 44. Abzeichen „weg“ am Avatar
Wenn eine Person als weg gilt (gleiche Erkennung wie „Ämtli pausieren“: Kalender oder Ferien-Check), zeigt ihr Avatar im Planer (Heute und Woche) ein kleines Abzeichen: am Vortag „✈️ ab morgen weg“, während der Abwesenheit „✈️ weg bis Mi“ (letzter Tag). Bei Ferien 🌴 statt ✈️.
**Status:** ✅ umgesetzt in 0.13.0

### 45. Welche Sonderämtli ins Freiwillig-Feld kommen
Heute: Reihenfolge der gespeicherten Liste (Vorlagen zuerst), wer drin ist, bleibt – eigene und Weg-Ämtli kommen oft nicht dran. Neu:
1. Vorrang für selten passende: „Nur wenn weg ist“, Geburtstag, Hochzeitstag; dann eigene Sonderämtli; dann Vorlagen.
2. Bald endende zuerst (Frist / „bis“-Zeit heute).
3. Der Rest wechselt täglich, damit nicht immer dieselben Vorlagen die Plätze belegen.
4. Ein Ämtli mit höherem Vorrang darf ein noch nicht genommenes Vorlagen-Ämtli verdrängen.
Dazu: die Korrektur gegen den Ladefehler nach Updates (Week-View-Element doppelt registriert) ist schon im Code und kommt mit diesem Update.
**Status:** ✅ umgesetzt in 0.15.0

### 46. Punkte bei To-dos, Ämtli und Sonderämtli im Planer anzeigen
To-dos geben schon Punkte (nach Grösse S/M/L oder fixem Wert), aber die Kachel zeigt sie nicht. Neu: im Etikett „☑ To-do · +N“ wie bei den Sonderämtli, in der Heute-Ansicht und in der Wochenansicht. Ohne Punkte bleibt das Etikett wie heute.
**Status:** ✅ umgesetzt (lokal, noch nicht veröffentlicht)

### 47. Kopfszene auf dem Tablet (iPad Air)
Auf 1180 px quer verdeckt der Vorschlag (z. B. „Familien-Spaziergang“) die untere Hälfte vom Haus, hochkant (820 px) liegt das Haus fast ganz hinter Vorschlag und Navigationsknöpfen. Idee: bei Tablet-Breite den Vorschlag nur als kleines Symbol neben dem Wetter zeigen (antippen = Text) und die Szene so verschieben, dass das Haus in der Lücke rechts neben der Navigation steht; hochkant die Navigation nur mit Symbolen.
**Status:** ✅ umgesetzt in 0.15.0 – Vorschlag als Symbol nur auf dem Tablet im Hochformat (Querformat zeigt ihn ganz, gewünscht)

### 48. Zuverlässigkeit rechts neben dem Avatar
Die Prozentzahl (heute grünes Bändeli unter dem Namen) auf die gleiche Höhe wie der Avatar, aber rechts. Drei Vorschläge (Screenshot rel_vorschlaege):
1. **Ring** – Kreis-Fortschritt mit Zahl in der Mitte, Farbe nach Stufe.
2. **Grosse Zahl** – „82 %“ gross in der Stufenfarbe, darunter „zuverlässig“ und ein dünner Balken.
3. **Fähnchen** – hängendes Fähnchen oben rechts an der Karte mit der Zahl (braucht am wenigsten Platz, Name und Abzeichen bleiben einzeilig).
**Status:** ✅ Fähnchen umgesetzt (etwas weiter links, lokal)

### 49. Design-Durchsicht (Vorschläge vom 15.11.)
Aus einer Durchsicht aller Ansichten auf iPad und Handy. Jeder Punkt einzeln wählbar.
1. **Handy-Personenkarten kompakter:** Avatar links, Name/Abzeichen rechts daneben (heute untereinander) – spart pro Person ca. 60 px.
2. **Handy-Werkzeugleiste einzeilig:** Heute/Woche, Filter und To-do-Knöpfe in eine waagrecht wischbare Zeile; „To-dos & Spezial“ bricht heute auf 3 Zeilen um.
3. **Handy-Kopfszene:** Haus etwas links der Mitte, damit es nicht hinter den Navigationsknöpfen verschwindet; Wetter nur als Symbol + Temperatur.
4. **Wochenansicht – Sonderämtli kompakt:** in schmalen Zellen Etikett und Augen-Knopf als kleine Symbole in einer Zeile (heute zerquetscht).
5. **Wochenansicht – Freiwillig-Zeile:** Knöpfe nicht über die ganze Breite (max. ca. 260 px), Karten nebeneinander statt untereinander.
6. **Einheitliche Punkte-Plaketten:** gleiche Form und Farbe für Ämtli, To-dos und Sonderämtli (heute gelb +10 / blaues Etikett / gelbes Etikett).
7. **Lesbarkeit:** kleine graue Grossbuchstaben-Überschriften (TERMINE, ÄMTLI …) etwas heller und grösser (Kontrast nach WCAG AA).
8. **„Heute nichts“ freundlicher:** kleines Symbol und nächster Termin bzw. „morgen: …“.
9. **Leere Listen-Seite:** Symbol, kurzer Text und Knopf „Liste einrichten“ direkt in die Einstellungen statt Pfad-Text.
10. **Belohnungen:** Fortschrittsbalken bis zur nächsten Belohnung pro Person, Belohnungen als Kärtchen mit Symbol.
11. **Nachtmodus fürs Tablet:** nach Sonnenuntergang alles etwas dunkler und ruhiger, Uhr grösser; Gartenlichter passen dazu.
12. **Weiche Übergänge:** Abhaken mit kurzem Häkchen-Animationseffekt auch in der Wochenansicht, Ansichtswechsel mit sanftem Einblenden.
**Status:** ✅ umgesetzt: 1, 2, 4–12 (8, 9, 12 in 0.15.0; Häkchen-Effekt gab es schon, neu ist das sanfte Einblenden). ❌ 3 abgelehnt (Haus auf dem Handy bleibt).

### 50. Einheitlicher Aufbau der Ämtli- und To-do-Knöpfe
Regel: Passt alles auf eine Zeile → links Text, daneben Zeit-Info (seit x Tagen, heute fällig, bis Mo); rechts Punkte, links davon die Herkunft (To-do, Liste, Kalender von …, Sonder). Passt es nicht → links oben Text, links unten Zeit-Info, rechts oben Punkte, rechts unten Herkunft. Nur zwei Schriftgrössen (Titel und klein).
Drei Stil-Vorschläge (Bild buttons.png): **A** ruhig – nur Punkte als Plakette, Infos als farbiger Text; **B** gemischt – Zeit-Info als Text, Herkunft als weiche Plakette; **C** alles Plaketten – Zeit-Info umrandet, Herkunft gefüllt, „heute fällig“ kräftig.
**Status:** ✅ Stil C (alles Plaketten) umgesetzt, lokal

### 51. Frost-Modus: alles gefriert bei starker Kälte
Wenn die Aussentemperatur unter einen einstellbaren Wert fällt (Standard −1 °C), wird die ganze Szene eingefroren: Boden mit Raureif (weiss-bläulich, auch ohne Schnee), Bäume und Büsche bereift, Eiszapfen am Dach, Pool zugefroren mit Eisfläche, Fenster mit Eisblumen am Rand, dazu feine glitzernde Eiskristalle in der Luft.
Temperaturquelle: das Attribut `temperature` der eingestellten Wetter-Entität (keine eigene Sensor-Entität). Optional: eine eigene Temperatur-Entität (z. B. Aussenfühler) in den Einstellungen wählbar, die Vorrang hat.
Einstellungen: „Frost-Modus“ ein/aus und „Gefroren ab“ (−25 … 0 °C, Standard −1 °C), jeweils mit Beschreibung DE/EN.
**Status:** ✅ umgesetzt (Quelle: Wetter-Entität); eigener Aussenfühler ❌ abgelehnt (Wetter-Entität reicht)

### 52. Info-Texte auch für Bräuche und Feiertage
Der Info-Knopf (ⓘ) neben dem Datum gibt es heute nur an den besonderen Tagen. Vorschlag: auch Schweizer Bräuche und Feiertage bekommen einen kurzen, kindgerechten Text (DE/EN), der erklärt, was gefeiert wird.
Kandidaten: Samichlaus, Heiligabend/Weihnachten, Silvester, Neujahr/Berchtoldstag, Dreikönigstag, Fasnacht, Valentinstag, Karfreitag/Ostern, Tag der Arbeit, Auffahrt, Pfingsten, Muttertag, Vatertag, 1. August, Bettag, Erntedank, Frühlings-/Sommer-/Herbst-/Winteranfang.
Nicht nötig: Wetter, Jahreszeiten, Ferien, Geburtstag, Hochzeitstag (selbsterklärend).
**Status:** ✅ umgesetzt in 0.15.0

### 53. 40 Ideen zum Antippen (Click me)
Wie Titanic und Mondfähre: in jeder Szene etwas, das beim Antippen eine kleine Geschichte abspielt; dazu der goldene „Tipp!“-Hinweis. Vorschau: Artefakt „Family Planer – 40 Ideen zum Antippen“.
1. **Sonne mit Sonnenbrille** (die Sonne): Die Sonne setzt eine Sonnenbrille auf, zwinkert und lässt die Luft über dem Boden kurz flimmern.
2. **Eigene Regenwolke** (eine Wolke): Nur aus dieser Wolke regnet es – genau auf eine Blume, die dabei gross wird und aufblüht.
3. **Goldtopf am Regenbogen** (den Regenbogen): Am Ende des Regenbogens taucht ein funkelnder Topf voller Goldtaler auf, Münzen springen heraus.
4. **Donnerschlag** (eine Gewitterwolke): Ein grosser Blitz schlägt ein, das ganze Bild wackelt, die Katze auf dem Dach springt erschrocken hoch.
5. **Schneekugel** (den Himmel): Das Bild wird zur Schneekugel: es schüttelt sich und ein dichtes Schneegestöber wirbelt durch die Szene.
6. **Nebel wegpusten** (den Nebel): Ein Windstoss bläst den Nebel weg – dahinter steht plötzlich ein Reh, das kurz schaut und davonspringt.
7. **Drachen steigen lassen** (einen Baum bei Wind): Die Blätter fliegen davon, ein bunter Drachen steigt auf und tanzt im Wind.
8. **Müder Mond** (den Mond): Der Mond gähnt, zieht eine Schlafmütze an und schnarcht kleine Zzz – nach ein paar Sekunden wacht er auf.
9. **Wünsch dir was** (den Sternenhimmel): Eine grosse Sternschnuppe saust quer über den Himmel und zerplatzt in viele kleine funkelnde Sterne.
10. **Licht im Fenster** (ein Fenster (nachts)): Das Licht geht an, eine Silhouette winkt kurz – dann geht das Licht wieder aus.
11. **Rauchringe** (den Kamin): Aus dem Kamin steigen statt Rauch drei Rauchringe und ein kleines Herz aus Rauch.
12. **Arschbombe** (den Pool): Jemand macht eine Arschbombe – riesige Wasserfontäne, Tropfen spritzen bis auf die Wiese.
13. **Apfel fällt** (den Apfelbaum): Ein Apfel fällt, hüpft zweimal über den Rasen, und ein kleiner Wurm schaut heraus und winkt.
14. **Eichhörnchen** (einen Herbstbaum): Ein Blätterwirbel – ein Eichhörnchen flitzt den Stamm hinunter, schnappt eine Nuss und verschwindet.
15. **Wasserschlacht** (einen Rasensprenger): Der Sprenger dreht durch, ein Kind rennt kreischend durch den Wasserstrahl, darin leuchtet ein kleiner Regenbogen.
16. **Eidechsen-Liegestütze** (die Eidechse): Die Eidechse bleibt stehen, macht drei Liegestütze wie echte Eidechsen und flitzt dann davon.
17. **Eiskunstlauf** (den gefrorenen Boden): Ein Kind auf Schlittschuhen gleitet über das Eis, dreht eine Pirouette und landet im Schnee.
18. **Kerze anzünden** (den Adventskranz): Ein Streichholz zündet kurz die nächste Kerze an – Glitzer steigt auf, dann wartet sie wieder auf ihren Sonntag.
19. **Samichlaus-Sack** (den Samichlaus): Der Samichlaus öffnet den Sack: Nüsse, Mandarinen und Grittibänze purzeln heraus, der Esel wackelt mit den Ohren.
20. **Christkind fliegt** (den Weihnachtsbaum): Das Christkind fliegt aus dem Baum, streut Sterne über das Haus, die Geschenke wackeln.
21. **Geschenk öffnen** (ein Geschenk): Der Deckel springt auf – ein Schachtelteufel (Springteufel) schnellt heraus und wackelt lachend.
22. **Grosses Finale** (den Himmel an Silvester): Alle Raketen auf einmal: ein riesiges Finale, das neue Jahr in grossen goldenen Ziffern.
23. **Glück vom Dach** (den Kaminfeger): Der Kaminfeger rutscht auf der Leiter vom Dach und wirft Kleeblätter, das Glücksschwein hüpft vor Freude.
24. **Dem Stern folgen** (den Stern): Die drei Könige laufen dem Stern nach; ein Dreikönigskuchen erscheint, und der kleine König springt heraus.
25. **Sprung von der Schanze** (das Bähnli): Das Bähnli saust nach oben, ein Skifahrer fährt die Piste hinunter, springt über eine Schanze und macht einen Salto.
26. **Hungriger Hase** (den Schneemann): Der Hut des Schneemanns kippt, ein Hase hoppelt heran und knabbert die Rüebli-Nase ab.
27. **Konfettikanone** (irgendwo an Fasnacht): Eine Konfettikanone schiesst eine riesige bunte Wolke ab, die Luftschlangen tanzen wild.
28. **Herz aus Herzen** (ein Herz): Das Herz zerspringt in viele kleine Herzen, die sich zu einem grossen Herz um das Haus formen.
29. **Küken schlüpft** (ein Osterei): Das Ei wackelt, bekommt Risse – ein flauschiges Küken schlüpft und piept.
30. **Hase versteckt Ei** (ein Hasenloch): Der Hase springt ganz heraus, versteckt schnell ein Ei im Gras und taucht wieder ab.
31. **Tauben-Formation** (eine Taube): Alle Tauben fliegen zusammen und formen am Himmel ein Herz, bevor sie weiterziehen.
32. **Blumen für Mama** (die Wiese am Muttertag): Aus dem Boden wächst ein riesiger Blumenstrauss, die Blüten öffnen sich nacheinander.
33. **Mammut-Steak** (das Lagerfeuer): Papa brät ein riesiges Mammut-Steak – der Säbelzahntiger schleicht heran und klaut es.
34. **Höhlenmalerei** (die Höhle): In der Höhle leuchten Höhlenmalereien auf – ein Mammut, Jäger, Handabdrücke.
35. **Falscher Hai** (die Haiflosse): Die Flosse taucht auf – darunter ist kein Hai, sondern ein Kind mit Flossen-Mütze, das lacht und abtaucht.
36. **Krabben-Tanz** (eine Krabbe): Die Krabbe klappert mit den Scheren, tanzt seitwärts im Kreis und gräbt sich wieder ein.
37. **Looping** (das Flugzeug): Das Flugzeug fliegt einen Looping und schreibt mit weissem Rauch ein Herz in den Himmel.
38. **Alphorn** (die Schweizerfahne): Ein Alphornbläser erscheint und bläst, Noten schweben übers Bild, das Höhenfeuer lodert auf.
39. **Kerzen auspusten** (den Geburtstagskuchen): Die Kerzen werden ausgepustet (kleine Rauchfahnen), dann gehen sie mit Konfetti wieder an.
40. **Ring ring!** (das Ur-Handy): Das Handy klingelt und vibriert, dann verwandelt es sich kurz in ein modernes Smartphone und zurück.
**Update-Liste (freigegeben, „Ja“ – diese werden eingebaut):** 22 Silvester-Finale (immer nächstes Jahr), 27 Gugge, 29 Küken-Parade, 40 Ring ring, 41 UFO-Entführung, 44 Haus wird Startrampe, 45 Polarlicht, 48 Sternschnuppen-Regen, 50 Sonnenfinsternis, 51 Wirbelwind, 54 Freundlicher Drache, 55 Riesen-Schneeball, 57 Chilbi, 58 Schmetterlings-Wolke, 60 Gespensternacht, 62 Riesen-Seifenblasen, 66 Grosser Komet, 67 Feuerwerk-Herz, 70 Hyperraum-Sprung, 71 Regenbogen-Explosion, 72 Riesen-Schneeflocke, 73 Glühwürmchen „Gute Nacht“, 78 Froschkonzert, 79 Eisbär-Besuch. Runde 5 dazu: 16, 19, 38, 39, 42, 56, 68. Runde 6 dazu: 49, 59, 65, 75. Runde 7 dazu: 7, 52, 63, 76, 77, 80, 86, 87, 89, 92, 99, 101, 105, 107, 110.

**Runde 8 (in Prüfung):** überarbeitet 35, 61, 74, 83, 88, 93, 94, 97, 98, 103, 106, 109.
**Verworfen („Nein“):** 32, 43, 46, 47, 53, 64, 69, 81, 82, 84, 85, 90, 91, 95, 96, 100, 102, 104, 108.
**In Arbeit (Runde 5, im Artefakt „Family Planer – Tipp-Animationen Runde 5“):** 7, 16, 19, 35, 38, 39, 42, 49, 52, 56, 59, 61, 63, 65, 68, 74, 75, 76, 77, 80 sowie 10 gigantische neue: 81 Riesen-Roboter, 82 Konfetti-Tsunami, 83 Riesen-Krake im Pool, 84 Schutzschild, 85 Zeitportal, 86 Himmelswal, 87 Feuer-Phönix, 88 Schwarzes Loch, 89 Süssigkeiten-Lawine, 90 Domino-Kette.
**Tipp-Hinweis:** sitzt immer am selben Ort – im Himmel zwischen Baum und Haus (HTML-Overlay, an den Bildrand geklemmt, nie ausserhalb); die ganze Szene ist Tippfläche. Objekte, die „hinter“ etwas durchgehen (Schiff hinter Hütte/Palmen/Schirm, Sonne/Mond hinter Haus und Hügeln), werden mit Masken versteckt.
**Status:** ✅ umgesetzt in 0.14.0 (62 Animationen, Auswahl siehe 55)

### 54. Punkte als Coin („Kerben-Taler“)
Punkte werden überall (Ämtli-Plakette, Punktestand, Belohnungen) mit einem eigenen Coin statt nur einer Zahl gezeigt. Gewählt: „Kerben-Taler ohne Doppelrand“ – flach (2D), Silberscheibe, Goldkern, ein geprägter Buchstabe in der Mitte und 5 eingeprägte Kerben im Silberring. Kein Dauerglanz: nur alle 5–9 s blitzt ein kleiner Stern kurz an einer Stelle auf (wie Sonne auf Metall), jeder Coin in eigenem Takt.
Details:
- Reines SVG, keine Bilder; bei „weniger Bewegung“ kein Aufblitzen.
- Bis 24 px (Ämtli-Plakette) bleibt der Buchstabe gut lesbar; Grössen-Test 14–40 px ok.
- Anzahl Kerben = Anzahl Personen (statt fix 5).
- Beim Abhaken fliegt der Coin von der Plakette zum Punktestand, die Zahl hüpft kurz (wie im Prototyp).
Einstellungen (mit Beschreibung DE/EN): „Buchstabe auf dem Coin“ (1 Zeichen, Standard: leer → kleiner Stern statt Buchstabe; Eingabe wird auf einen Buchstaben/Ziffer begrenzt) und „Coin anzeigen“ ein/aus (aus = Zahl wie bisher).
Datenschutz: kein Familienname im Code oder in Beispielen – der Buchstabe kommt nur aus der Einstellung.
Vorschau: Artefakt „Family Planer – Kerben-Taler, ganz schlicht“ (Nr. 4).
**Status:** ✅ umgesetzt in 0.15.0 (Einstellungen „Punkte als Taler zeigen“ und „Buchstabe auf dem Taler“)

## 55 · Welche Tipp-Animation wann läuft
**Status:** ✅ umgesetzt in 0.14.0

**Zeitfenster:** Tag (06–17 Uhr), Abend (17–20 Uhr), Nacht (20–06 Uhr, wie die Szene). Pro Zeitfenster und Tag wird **eine** Animation fest ausgewählt (vom Datum abgeleitet, nicht dieselbe wie in den letzten Tagen) → 2–3 verschiedene pro Tag; nochmal tippen spielt dieselbe nochmal.

**Reihenfolge beim Auswählen (die erste passende Stufe gewinnt):**
1. Themen-Tag mit eigener Szene: Dino-Tag 103 · Handy-Tag 40 · Vulkan-Tag 42 · Mondlandung (bestehende Mondfähre) · Titanic (bestehendes Schiff) · British Day (keine).
2. Anlass: Geburtstag 39 (Tag+Abend) · Valentin/Hochzeits-/Kennenlerntag 67 (Abend/Nacht) · Fasnacht 27 · Ostern 29 · Schulanfang 101 · 1. August 38 (Abend/Nacht) · Samichlaus 19 (Tag) · Advent–26.12. 65 (Abend/Nacht) · Silvester 93 (Tag/Abend), 22 (Nacht) · Sputnik-Woche 4.–11.10. 44 (Abend), 76 (Nacht).
3. Wetter (nur Tag, wird bei jedem Tippen live geprüft – ändert das Wetter, kommt sofort die passende Animation): Regen 68 · Sonne nach Regen 71 · teils bewölkt 49 · Wind 7 (Herbst) / 51 (sonst, Sturm) · Schnee 72/55 · Frost 79 · ab 30 °C 59 · ab 20 °C 16 · volle Sonne 50/106.
4. Jahreszeit:
   - Frühling: Tag 58, 62, 109, 56 · Nacht 76, 63
   - Sommer: Tag 75, 78, 83, 77, 98, 99, 92 · Strand 35, 52 · Abend 73, 80, 57 · Nacht 48 (nur August), 41, 74
   - Herbst: Tag 54, 77, 105 · Abend 87, 57 · Nacht 60, 66, 76
   - Winter: Tag 72, 55, 89, 79 · Nacht 45, 66
5. Überraschung (ca. 1 Tag pro Woche statt Stufe 4): Tag 61, 70, 86, 88, 94, 97, 98, 99, 106, 107 · Nacht 63, 74, 110, 41

**Gefundene Konflikte:**
- Sommer zeigt standardmässig den ganzen Sommer den Strand (kein Haus) → Pool-/Haus-Animationen würden im Sommer nie laufen. Entscheid: ab Ferienbeginn wechseln Strand und Haus mit Pool Tag für Tag ab, ausserhalb der Sommerferien immer Haus mit Pool.
- Entscheid: Standard-Haus wird entfernt, es gibt nur noch das Pool-Haus (bestehende Einstellung „standard“ wird beim Laden auf „pool“ gesetzt, Einstellung fällt weg).
- Mondlandungs-Tag hat kein Haus → 44 (Haus wird Startrampe) passt dort nicht → Sputnik-Woche. 76 (Teleskop) nicht am Mondlandungs-Tag.
- Themen-Tage ohne Haus (Handy, Vulkan, Mond, Titanic, Dino, British Day): nur ihre eigene Animation.
- 50 und 106 brauchen die volle Sonne (nicht Abendsonne, nicht bewölkt).
- Entscheid Doppeltippen: Der ganze obere Bereich (Kopfzeile mit Szenenbild) zählt nicht mehr fürs Vollbild-Doppeltippen. Ein Tipp aufs Bild startet sofort die Animation (keine Wartezeit), Vollbild an/aus geht weiter über die übrigen freien Stellen weiter unten.
- Entscheid Titanic & Mondfähre: werden genau gleich ausgelöst wie alle anderen – Tipp irgendwo aufs Bild, gleicher „Tipp!“-Hinweis am gleichen Ort im gleichen Stil; die eigenen Hinweise bei Schiff und Fähre fallen weg.
- Buttons im oberen Bereich (links Navigation, rechts weitere Knöpfe wie Info ⓘ) behalten immer ihre Funktion: ein Tipp auf einen Button startet nie eine Animation; nur freie Bildfläche zählt.
- Einstellungen: „Tipp-Animationen“ an/aus, „Überraschungen“ (aus / selten ≈ 1 Tag pro Woche / oft ≈ 3 Tage pro Woche), Standard: selten (entschieden).

## 56 · Fairere Auszeichnungen
**Status:** ✅ umgesetzt in 0.14.0 (Meilensteine nach Tagen, Pünktlich-Profi, Freiwilligen-Champion, Retter in der Not)

**Problem Meilensteine (100 / 500 / 1000 Ämtli):** Wer mehr Ämtli im Plan hat, erreicht sie schneller.
- **Entscheid: A.** A) **Alles-erledigt-Tage:** Meilenstein zählt Tage, an denen *alle eigenen* Ämtli erledigt waren (z. B. 25 / 100 / 250 Tage) – unabhängig davon, wie viele Ämtli ein Kind hat.
- B) **Quote statt Anzahl:** Meilenstein für die Erledigungsquote über 30 Tage (z. B. 80 % / 90 % / 100 %).
- C) **Persönliches Ziel:** Ziel pro Kind = eigene Ämtli pro Woche × Wochen (z. B. „10 Wochen Plan geschafft“).

**Problem Frühaufsteher:** Abend-Ämtli können gar nicht früh erledigt werden. Ersatz-Vorschläge:
1. **Pünktlich:** Jedes Ämtli zählt, wenn es innerhalb seines eigenen Zeitfensters erledigt wurde (Abend-Ämtli bis zur Abendzeit) – Auszeichnung für die höchste Pünktlichkeitsquote der Woche.
2. **Ohne Erinnerung:** Ämtli erledigt, bevor die Erinnerung/Durchsage kam.
3. **Kein Aufschieben:** Die ganze Woche kein Ämtli überfällig in den nächsten Tag gerutscht.
4. **Helferherz:** Ein Ämtli eines anderen übernommen oder ein Zusatz-/Sonder-Ämtli freiwillig gemacht.
5. **Aufholjagd:** Die eigene Quote gegenüber der Vorwoche am stärksten verbessert (fair für alle Stufen).

**Weitere Vorschläge aus vorhandenen Daten (umgesetzt: A Meilensteine nach Tagen, 6 Freiwilligen-Champion, 7 Pünktlich-Profi statt Frühaufsteher, 11 Retter in der Not; 12 Allrounder verworfen):**
6. **Freiwilligen-Champion:** am meisten freiwillige Sonder-Ämtli der Woche übernommen und erledigt (Sonder-Ämtli: wer übernommen, wann erledigt).
7. **Pünktlich-Profi:** höchster Anteil Ämtli, die vor ihrer Fälligkeit erledigt wurden (Ämtli: Start, Fälligkeit, erledigt um) – Abend-Ämtli zählen bis zum Abend.
8. **Sofort-Macher:** höchster Anteil Ämtli, die innerhalb von 30 Minuten nach ihrem Start erledigt wurden – fair, weil jedes Ämtli ab seiner eigenen Startzeit zählt.
9. **To-do-Held:** am meisten eigene To-dos der Woche abgehakt (To-dos: erledigt um).
10. **Sparfuchs:** am meisten Punkte der Woche gesammelt und behalten statt eingelöst (Punktebuch).
11. **Retter in der Not:** ein freiwilliges Sonder-Ämtli übernommen, das schon am längsten offen war (Sonder-Ämtli: seit wann offen, wann übernommen).
12. **Allrounder:** in der Woche die meisten *verschiedenen* Ämtli erledigt (Ämtli-Art pro erledigtem Ämtli).

**Freiwillige Ämtli (umgesetzt):** ohne eigene Personenauswahl kann jetzt die ganze Familie (auch Erwachsene) ein freiwilliges Ämtli übernehmen; verteilte Ämtli (jedes Kind / fix / Überraschung) gehen weiter nur an Kinder. Die Auswahl „Wer nimmt es?“ hat grosse Avatar-Kacheln statt kleiner Knöpfe.

### 57. Statistik-Seite (4. Knopf in der Navigation)
Status: ✅ umgesetzt in 0.15.0 (inkl. Pokale & Auszeichnungen pro Person und Familie)
- Neuer Knopf „Statistik“ (mdi:chart-bar) nach Belohnungen; Zeitraum Woche / Monat / 3 Monate.
- Oben Familie + je ein Knopf pro Person (→ eigene Statistik).
- Familie: Ämtli geschafft, freiwillige Ämtli, To-dos, Tage „alle alles geschafft“ (+ Rekord).
- „Wer hat was gemacht?“: Balken pro Person nach Art (Ämtli / freiwillig / To-dos).
- „Welche Ämtli – wer wie oft?“: Tabelle Ämtli × Person mit Anzahl (auch freiwillige Ämtli und To-dos).
- Unten Personenkarten (feste Reihenfolge): 10 Punkte Zuverlässigkeit, 7-Tage-Sterne, Serie → antippen = Detailseite.
- Detailseite: Kacheln, 7 Tage als Bauklötze, 12-Wochen-Kalender, „Was ich gemacht habe“ (Balken nach Art + Liste pro Art: Ämtli, freiwillige Ämtli, To-dos pro Liste), „Da üben wir noch“, „Wann ich helfe“; Knopf „‹ Familie“.
- „Woher meine Punkte kommen“: Punkte-Glas mit farbigen Schichten, Liste pro Quelle (Ämtli, freiwillige Ämtli, To-dos, Tagesbonus, Serien-Bonus, Auszeichnungen, Level-Bonus, Extra von Mama/Papa), „Für Belohnungen eingelöst“ (minus) und „Letzte Punkte“. Daten: Punkte-Buch (ledger.kind), schon vorhanden.
- ✅ Fehler behoben in 0.15.0: Punkte aus freiwilligen Ämtli zählen fürs Level und die Prognose (Zuverlässigkeit bleibt nur zugewiesene Ämtli)
- Tages-Punkte (Kalender, 7-Tage-Reihe): grün = alles, gelbgrün = 1 vergessen, orange = 2, rot = 3+, grau = frei.
- Kein Familien-Ziel, keine Retter-Statistik.
- Daten: history (120 Tage), done_at; neu nötig: Zähler pro Ämtli + Person (history kennt heute nur verpasste Titel), Titel bei freiwilligen Ämtli merken, awards.vol 60 → 120 Tage, To-do-Zähler pro Person.
- Einstellungen: Statistik-Knopf ein/aus · „Wer hat was gemacht“ für Kinder sichtbar · „Da üben wir noch“ ein/aus · Standard-Zeitraum.

### 58. Schönerer „Tipp!“-Hinweis am Haus
Status: **umgesetzt in 0.16.0** (Neon-Schild hängt vom Himmel, Saisonfarbe, Einstellungen „Tipp-Schild“ und „Nach Aktivität so lange zeigen“). Frühere Notizen: Aussehen gewählt (17.11.): **Neon-Schild hängt vom Himmel**, weiter oben (Schild bei y ≈ 3–24 der Szene, kurze Drähte vom oberen Rand), Neonfarbe je Saison. Vorschau: Artefakt „Family Planer – Neon-Tipp-Schild (Ansicht)“. Takt (Wunsch 17.11.): nach Aktivität alle 10 s.
- Vorschlag Umsetzung: Aktivität = jeder Tipp auf dem Planer (Knopf, Abhaken, Wischen, Ansicht wechseln) oder der Bewegungsmelder aus den Ansagen meldet Bewegung. Danach 2 Minuten lang alle 10 s, dann Ruhe (kein Blinken in einen leeren Raum). Läuft gerade eine Animation: Pause.
- Einstellung „Tipp-Schild“ (Saisons & Wetter, mit Beschreibung DE/EN): Aus · Nach Aktivität (Standard) · Immer (alle 30 s); dazu „Nach Aktivität so lange zeigen“ (1–10 min, Standard 2).
- Heute: gelbe Pille „Tipp!“ im Himmel zwischen Baum und Haus, alle 7 s für ca. 1,8 s (8–9× pro Minute, gut 500× pro Stunde).
- Vorschläge (alle mit Blase am Haus): 1 Comic-Sprechblase zum Dach · 2 Gedankenblase aus dem Kamin · 3 Fahne auf dem Dach · 4 Fenster leuchtet und ruft · 5 Neon-Schild auf dem First.
- Takt separat wählbar: heute (alle 7 s) · Ruhig (alle 20 s) · Am Anfang mehr (1. Minute alle 7 s, dann alle 45 s) · Nur wenn Ruhe ist (nach 2 min ohne Tipp, dann alle 30 s).
- Evtl. Einstellung „Tipp-Hinweis: Takt“ mit Beschreibung.
- 17.11.: Neon-Schild gefällt – 4 weitere Neon-Vorschläge für alle Saisons (gleicher Ort oben über der Bildmitte, auch ohne Haus; Farbe je Saison: Winter eisblau, Sommer pink, Herbst bernstein, Frühling/Spezialtage grün): A hängt vom Himmel · B Blase mit Pfeil nach unten · C Leuchtschild mit Glühbirnen (immer warmgelb) · D Schreibschrift zeichnet sich.

### 59. Ideen: Lernen, Pflichtbewusstsein, Minigames (17.11.)
Status: Ideensammlung – wartet auf Auswahl. Grundregel für alle Spiele: freigeschaltet erst, wenn die Ämtli des Tages erledigt sind; max. Spielzeit pro Tag als Einstellung; alles lokal, keine Werbung, keine Daten nach aussen.
**Pflichtbewusst werden**
1. Ämtli-Haustier: jedes Kind hat ein kleines Tier (Drache, Hamster, Fuchs …), das wächst und Tricks lernt, wenn Ämtli erledigt werden; bei vergessenen Ämtli wird es müde – stirbt nie, erholt sich sofort.
2. Persönliche Wochen-Mission: jedes Kind bekommt eine kleine Mission („3× Tisch decken ohne Erinnerung“, „jeden Tag vor 18 Uhr fertig“) mit Abzeichen.
3. Bildkarten-Routinen: Morgen- und Abendroutine als Bildkarten (Zähne, Kleider, Schulthek) – auch für Kinder, die noch nicht lesen.
4. Ämtli-Tauschbörse: Kinder tauschen Ämtli untereinander, Eltern bestätigen mit einem Tipp.
**Lernen**
5. Frage des Tages: eine kindgerechte Frage (Natur, Schweiz, Rechnen, Englisch) im Kopfbild, Schwierigkeit pro Person; richtig = kleiner Bonus.
6. Uhr lesen lernen: analoge Uhr im Planer, „Wie spät ist es?“ mit Tippen.
7. Englisch-Wort des Tages mit Bild.
**Minigames**
8. Suchbild in der Kopfszene: 5 versteckte Dinge in der aktuellen Saison-Szene finden.
9. Fang-Spiel im Kopfbild: 20 s lang Schneeflocken / Blätter / Sternschnuppen fangen, passend zur Saison.
10. Kopfrechnen-Blitz: 60 s Rechnen passend zum Alter, eigener Rekord statt Rangliste.
11. Memory mit Avataren und Saison-Bildern.
12. Glücksrad am Sonntag für eine perfekte Woche (kleiner Bonus oder Avatar-Extra).

### 60. Ämtli-Haustier und Glücksrad am Sonntag (aus #59, Punkte 1 und 12)
Status: **Runde 3** im Artefakt (17.11.), wartet auf Bewertung (Runde „pet3“). Vorher: Runde 2 im Artefakt „Family Planer – Ämtli-Haustier & Glücksrad (Entwürfe)“ (Ja / Nein / Verbessern pro Karte), wartet auf Bewertung. Runde 1 bleibt als round1.html.
- Runde 1 Feedback: „neben dem Bild“ und „Haustier-Haus“ raus, mehr und bessere Tiere, Kopfbild und Eltern-Überraschung raus, Avatar-Effekt häufiger.
- Ort: das aktuelle Tier lebt winzig im Garten der Kopfszene (Animal-Crossing-Stil, je nach Lebensraum: Boden, Klettern/Nest, Graben/Loch, Wasser/Pool, Luft/Dach und Nest, Insekten/Blumen, Sonne/Stein; Saisons: Winter-Eis, Strand, Herbst-Laubhaufen). 5. Knopf „Tierchen“ links mit eigener Seite (Garten mit allen Tieren, Pflege nur beim aktuellen, Sammlung, Tierbuch x/26) – wie Pokémon Go.
- 26 Tiere (Fuchs, Katze, Hund, Hase, Igel, Waschbär, Panda, Lama, Erdmännchen, Eichhörnchen, Hamster, Maus, Einhorn, Otter, Frosch, Axolotl, Eidechse, Chamäleon mit Farbwechsel, Drache, Eule, Pinguin, Ente, Papagei, Biene, Marienkäfer, Schmetterling): Ei → Baby (3 ganze Tage) → Jung (15) → Gross (40), deutlichere Unterschiede pro Stufe.
- 7 Stimmungen: froh, freut sich, hungrig (ab 15 Uhr noch nichts), müde (gestern vergessen), sauer (nur automatisch: <50 % in 7 Tagen oder 3 Tage in Folge vergessen), stolz, schläft. Glitzer-Variante 1 von 20. Stirbt nie.
- Sammlung unbegrenzt; im Garten der Kopfszene nur das aktuelle Tier. Zurücksetzen durch das Kind selbst mit zweimal Nachfragen.
- Glücksrad: Knopf oben rechts immer sichtbar (grau mit Wochenring, Sonntag leuchtend, „gedreht“ mit Häkchen). 24 gleich grosse Felder: Avatar-Effekt 7 · +25 Taler 5 · Haustier-Extra 3 · Jubel-Effekt 3 · Nochmals 2 · Ämtli-Joker 2 · Doppelte Punkte 1 · Goldfeld 1 (Zusatz-Dreh: 3/4 +50 Taler, 1/4 Jackpot +100). Stile bunt / Neon / Holz.
- 24 neue Avatar-Effekte (1 Woche): Regenbogen-Ring, Flammen-Rahmen, Polarlicht, Galaxie-Wirbel, Blitz-Ring, Pixel-Glitch, Musiknoten, Lava-Ring, Edelstein-Kranz, Planeten, Regenwolke, Fischschwarm, Disco-Laser, Tornado, Komet, Geister, Runen, Wurfsterne, Rakete, Plasma, Strudel, Diamant-Regen, Mondphasen, Puls-Wellen.
- Einstellungen später prüfen: Haustier an/aus, Glücksrad an/aus, Regel „gute Woche“ (Tage), Effekte im Rad.
- Runde 2 Feedback: Tiere zu dick und teils nicht erkennbar (Eidechse, Chamäleon, Drache, Erdmännchen, Eule, Pinguin, Ente, Marienkäfer), Lama raus; Igel, Frosch, Schmetterling ok; Garten-Animationen zu einfach; Glücksrad-Knopf bei jeder Person; Rad bunt mit Blinken; mehr Haustier-Extras; Tierwechsel als Gewinn (~10 %); junges Tier wechseln nur mit Tierwechsel; 9 Effekte gewählt, Rakete in Flugrichtung.
- Runde 3: 35 Tiere neu (schlank, Seitenansicht mit Gelenken; neu: Reh, Pony, Koala, Faultier, Robbe, Biber, Flamingo, Fledermaus, Kolibri, Tiger), Verhaltens-„Gehirn“ (laufen, schnuppern, klettern, graben, schwimmen, fliegen, sonnen, Apfel holen), Grössen S/M/L in der Kopfszene, 6 Vorschläge „Tier bei der Person“ (A–F, inkl. Level-Platz), Fundsachen beim Abhaken + Tamagotchi-Pflege (Hunger, Spass, Sauberkeit, Energie), Lieblingsfutter pro Tier, Garten im Animal-Crossing-Stil mit Zuhause pro Lebensraum und Tag/Nacht, runder Rad-Knopf pro Person, Rad mit Lauflichtern, Tierwechsel 2 Felder (8,3 %), 10 Haustier-Extras, 12 neue Avatar-Effekte.
- Wunsch 17.11.: **Info-Knopf mit Entwicklungsbaum** pro Tier und **wählbare Merkmale** (Masche, Glöckchen, Halstuch, Frisürchen, Stern, Sommersprossen, weisse Schwanzspitze, weisse Söckchen, Fellfarbe hell/dunkel) – Baby keine, Jung 1, Gross 2 + Farbe, jederzeit änderbar, auch in der Sammlung. In Runde 3 als Entwurf drin.
- Einstellungen später prüfen: Fundsachen an/aus, Glitzer-Funken an/aus, Werte sinken (aus/langsam/normal), Tier in der Kopfszene, Platz bei der Person.

- Runde 4 (Wunsch 17.11., im selben Artefakt, Abschnitte 8–12): **Sammelkarten** pro Tier (3 Stile: Holo, Sticker, Spiel-Karte; Seltenheit gewöhnlich/selten/episch/legendär) mit **Spezialfähigkeit** (eigene Animation pro Tier, z. B. Mäuselsprung, Feuerpuster, Bauchrutscher), **echter Grösse und echtem Gewicht** je Stufe; **Belohnung beim Abhaken** ohne Extra-Tipp: 2–4 Symbole steigen über dem Ämtli auf (immer Taler, immer etwas fürs Tier, selten Pillen/Energie-Drink/Glitzer-Funke; 3 Varianten Fächer/Liste/Plopp); **Icons** für Futter, Trinken, Pillen (Happy, Wachs, Glitzer, Schlaf-Tropfen, Vitamin, Trost-Pflaster) und Lustiges in Stil A/B; **Energie und Durst**, Happy-Pille gegen sauer, **Entwickeln-Knopf** (grau → gelb wie „Ich nehm’s!“, Kind löst die Entwicklung selbst aus); 3 Ideen: **Ausflüge**, **Tricks lernen**, **Gemüsebeet** + weitere (Freundschaften, Tierparty, Tierarzt-Spiel, Fotoalbum, Saison-Kostüme, Tier-Quiz).

- Runde 5 (17.11.): Feedback „Tiere aus Runde 3/4 passen nicht – Runde 2 war cooler, nur zu dick; alle sollen einem Muster folgen und klar erkennbar sein; erst Design, dann Animationen“. Neu gezeichnet: alle 35 Tiere in einem gemeinsamen Muster (Vorderansicht wie die Avatare, grosser Kopf, gleiche Augen/Stimmungen, schlanker Körper mit Armen und Beinen); zwei Körperformen zur Wahl: B stehend (wie Animal Crossing) / A sitzend (wie Runde 2, schlank). Runde 3 + 4 bleibt im Artefakt als round34.html.
- Runde 6 (17.11.): Feedback „viel besser; Babys putziger und runder, ein paar Fabelwesen dazu; Erdmännchen braucht Öhrchen; beide Körperformen Ja“. Babys/Jungtiere mit rundem Bauch, grösserem Kopf, grösseren Augen (2 Glanzpunkte), kurzen Beinchen. 7 Fabelwesen: Pegasus, Phönix, Greif, Kitsune, Yeti, Nessie, Wolpertinger. Dazu alle Ansichten für Garten und Kopfszene: seitlich laufend (Beine schwingen), von hinten (Klettern am Stamm), fliegend (Flügel schlagen) und badend (bis zum Bauch im Wasser) – plus Garten-Demo. Animationen erst nach Design-Freigabe.
- Runde 7/8 (17.11.): Feedback „Babys und Fabelwesen Ja; Klettern und Fliegen viel besser; Tierchen müssen auch nach vorne und hinten laufen; natürlich laufen und schwimmen; jedes Tier hat Lieblingsplätze“. Neu: Bewegungs-Steuerung (motion.js) mit 2.5D-Garten (Tiefe = Grösse), Weg um den Teich herum, Gangarten laufen/hoppeln/watscheln, Wenden über Frontansicht, Laufen auf den Betrachter zu und weg; Schwimmen in Zügen mit Wellen nur im Teich, Tauchen, Rausklettern und Schütteln; Fliegen mit Absprung, Schlagen/Gleiten, Neigung und Landung (Vogel, gross, Insekt, Falter, Fledermaus, Kolibri); Klettern je Art (Katzensprung, Eichhörnchen huscht und kopfüber, Koala Arm um Arm, Faultier hängt am Ast, Chamäleon schaukelt); Graben mit Wache stehen; Alltag (fressen, trinken, Hallo sagen, schlafen). Lieblingsplätze und Fähigkeiten für alle 42 Tiere, 30 Verhalten animiert, Ideen für später gelistet.
- Runde 9 (17.11.): Feedback „Runde 8 ok; natürlicher drehen und schräg laufen; was passiert bei Saisons und Tipp-Animationen; Entwicklungsbaum pro Tier mit Farbe, Frisur usw.“. Neu: Lenkung über Blickrichtung (Bogen statt 90°-Wende, langsamer in der Kurve, Neigen in die Kurve) mit Schrägansichten (Gesicht/Ohren/Schwanz verschieben sich, Kopfdrehen beim Umschauen). Saisons und Spezialtage im Garten (Frühling, Ostern, Sommer, 1. August, Herbst, Winter mit zugefrorenem Teich, Weihnachten, Silvester, Fasnacht, Geburtstag, Valentinstag): Garten, Kleider und saisonale Aktivitäten (Eis rutschen, Schneemann, Laubhaufen, Eier suchen, Geschenke, tanzen). Reaktionen auf Tipp-Animationen (6 live: Feuerwerk, UFO, Wirbelwind, Seifenblasen, Gute Nacht, Froschkonzert; Tabelle für alle freigegebenen). Entwicklungsbaum: Ei → Baby → Jung (3 Farben) → Gross (3 Looks) = 9 Varianten pro Tier, für alle 42 Tiere; ⓘ-Knopf in der Sammlung öffnet den Baum. Einstellungs-Vorschläge: Saison-Kleider, Reaktionen auf Tipp-Animationen, wer wählt, wann gewählt wird, ängstliche Tiere bei Feuerwerk.
- Runde 10 (17.11.): Feedback „Baum zu gross, von links nach rechts; Entwicklungen nur am Tier selbst; Mützen usw. nur für Grosse als Avatar-Element; Bäume unterschiedlich gross; mehr Animations-Beispiele; alle Fabelwesen; Fabelwesen nur am Glücksrad; Glücksrad einmal am Tag, Reset in der Nacht, bringt Futter und Trinken“. Neu: kompakter Baum links→rechts mit Linien; 4 Baumformen (A einfach, B Farbe als Jungtier, C Farbe + Merkmal, D reich: Fabelwesen, Drache, Einhorn); Körper-Merkmale statt Zubehör (Fell-Tolle, Locke, Wuschel-Kamm, Flauschbacken, Stern, Sommersprossen, Flecken, Streifen, Söckchen, Glitzerfell). Zubehör (16 Stück) nur für grosse Tiere, wie Avatar-Elemente; Saison-Kleider nur für grosse Tiere. Glücksrad: 1× pro Tag und Person, Reset um Mitternacht, 24 gleich grosse Felder, jeder Dreh = Tagesfutter für alle Tiere; Sternfeld → Zusatz-Rad mit Fabelwesen-Ei / +50 / Jackpot (Fabelwesen ≈ 1,4 % pro Dreh). 7 Fabelwesen mit Spezialfähigkeit (Regenbogenflug, Feuerkreis, Sturzflug, Fuchsfeuer, Schneestampfer, Riesenwelle, Hasensprung-Flug), Karten mit Schloss-Silhouette. 17 Tipp-Animationen mit Tier-Reaktionen live.
- Runde 11 (17.11.): Feedback „Endentwicklungen sehen fast gleich aus, zu symmetrisch; mehr Veränderung, Schein, speziellere Färbung, wild und vielfältig“. Neu: ungleiche Bäume (Äste verschieden lang, 1–3 Endformen pro Farbe), 8 Arten von Endformen (Merkmal, Muster, wild/schief, Spezialfarbe, Legende = Spezialfarbe + Schein, Schein, Zweiton, Mix), 12 Spezialfarben (Gold, Silber, Kristall, Feuer, Galaxie, Schatten, Neon, Smaragd, Rosé-Gold, Lava, Opal, Regenbogen), 7 Muster, asymmetrische Zeichen (Augenfleck, Blitz, Herz, Mond, zweifarbiges Gesicht), Flügelchen, Feenflügel, Löwenmähne, Hörnchen, Geweih, Horn, 8 Arten von Schein. Bausteine passend zum Thema jedes Tieres (Wasser, Feuer, Nacht, Wald, süss, Himmel); jede Endform mit eigenem Namen.
- Runde 12 (17.11.): Feedback „im Baum zeigen, ab wann es Effekte gibt, Entwicklungen verschieden darstellen; Tiere mit viel Entwicklung sollen am Schluss andere Formen haben (Flügel, Frisur, Schwanz, Schnabel …)“. Neu: Zeitstrahl (Ei → Baby 3 Ämtli → Jung 15 → Gross 40 → neue Form 70 → Schein 100 → Legende 150 + Happy-Pille; Spezialfarbe mit Entwicklungs-Pille, Zahlen einstellbar), Spaltenköpfe mit „ab wann“, Rahmen und Zeichen je Art (💊 gold, 🪽 lila gestrichelt, ✨ leuchtend, 👑 Regenbogen), Fortschrittsbalken bis zur nächsten Stufe. Zusätzliche Stufe „Endform“ mit 20 neuen Formen (Engels-/Drachen-/Schmetterlings-/Feuerflügel, Pfauenfächer, Kristallzacken, langer/dreifacher/Flammen-Schwanz, Mega-Mähne, Stachelfrisur, Lockenpracht, Federhaube, Tukan-/Adlerschnabel, Säbelzähne, Widderhörner, Kristallhorn, Riesengeweih, Elfenohren). Performance-Test: 25 Tiere gleichzeitig flüssig (60 Bilder/s).
- Runde 13 (17.11.): Wünsche „Tiere leben zusammen (zusammenstehen, reden, rennen), im Garten und oben beim Haus/Pool; Schlafplätze sichtbar; Pool zu = nicht baden; wie ein Game; flüssig?“. Neu: 6 gemeinsame Aktivitäten (Zusammenstehen und reden mit Sprechblasen, Fangis, Ball spielen, Wettrennen mit 3-2-1-Los und Pokal, Gänsemarsch, Kuscheln) etwa jedes dritte Mal; Nacht-Modus: jedes Tier geht an seinen Schlafplatz (Strohnest, Hütte, Körbchen, Vogelhaus, Ast, kopfüber am Ast, Erdbau, Seerosenblatt/im Wasser, Blüte), morgens gähnen und strecken; Kopfszene als zweite Welt mit gleichen Massen wie im Planer (1200 × 120, Haus x 640, Pool davor, Apfelbaum, Vogelhaus, Hütte, Nest, Körbchen, Erdbau), Pool-Abdeckung wie im Planer (22–8 Uhr, Winter, Schnee): niemand badet, wer drin ist muss raus, andere setzen sich auf die Abdeckung. Bewegungen in der Kopfszene auf die kleine Grösse angepasst. Leistung: 25 Tiere mit 60 Bildern/s.
- Runde 14 (17.11.): Wünsche „Tiere beim Haus zeigen; Zonen ums Haus und was Pool ist; vor Pflanzen durchlaufen und dahinter verstecken; animiertes zzz; Endform-Fähigkeiten (Blümchen wachsen, Blitz …)“. Neu: Kopfszene gross und in Originalgrösse; 9 Zonen (Wiesen, Terrasse, Pool, Blumenbeet, unter dem Apfelbaum, Garagendach, Hausdach, Haus = kein Zutritt) mit Overlay; Pflanzen als eigene Ebenen mit Tiefe (vorne vorbei / hinten verdeckt), 6 Verstecke + Spiel „Verstecken“ (zählen, verstecken, „Gefunden!“); animiertes z z Z an allen Schlafplätzen; 16 Endform-Fähigkeiten (Blümchen-Spur, Pilze, Kristalle, Feuer-Fussspuren, Glitzer-Pfoten, Blätterwirbel, Funken, Herzchen, Musik, Seifenblasen, Schneegestöber, Regenbogen, Blitz vom Himmel, Sternschnuppen, Schmetterlinge folgen, eigene Regenwolke), im Baum als „⚡ Fähigkeit“ (jede Legende, ~jede zweite neue Form).
- Runde 15 (17.11.): 5 Artefakte. (1) Tierchen, Stadien, Effekte: alle 42 Tiere, Bäume neu in Themenlinien (Feuer, Wasser, Nacht, Wald, Süss, Himmel, Schnee: Gross → Endform → Legende), 157 verschiedene Endformen, keine Muster/Pünktchen mehr, jede Entwicklung mit Ja/Nein/Verbessern. (2) Animationen: Sonderanimationen aller Tiere, Bewegungen, 12 Pflege-Animationen, Fähigkeiten, Spiele, Schlafen, Tipp-Reaktionen. (3) Garten und ums Haus: Garten im Stil des Planers mit Saisons (Frühling–Winter, Weihnachten, Ostern, Nacht), Header mit Herbst/Winter (Schnee, Pool zu, Schneemann), Schlafplätze erscheinen erst nachts und jedes Tier hat seinen eigenen Platz. (4) GUI: Personenkarte mit Tierchen und Glücksrad-Knopf, Ämtli-Belohnung steigt nacheinander auf, Seite „Tierchen“ (Garten, Pflege, Sammlung, Tierbuch, Statistik), Statistik umschaltbar Person ↔ Tierchen, 11 Popups, Einstellungen. (5) Spielbarkeit: Zeitrechner, Taler, Simulation Glücksrad, Abhängigkeiten, 10 Befunde (u. a. Schwellen in vollen Tagen, Glücks-Zähler, Happy-Pille nur für Entwicklung, Pause bei Ferien, neues Ei ab Gross, max. 8 Tiere im Header).
- Entscheide Runde 15 (17.11.): Entwicklung zählt **verdiente Taler** statt Ämtli (Taler werden fair verteilt; Ausgeben nimmt keinen Fortschritt weg; Sonderämtli = Sache des Kindes). Schwellen: Baby 30, Jung 150, Gross 450, Endform 800, Schein 1150, Legende 1750 Taler (≈ 2 Monate). Glücks-Zähler ja (Fabelwesen spätestens nach 60 Tagen, Entwicklungs-Pille nach 10). Neues Ei ab Gross. Zwei Pillen: Happy-Pille nur aufheitern; Entwicklungs-Pille für Spezialfarbe und Legende, vom Glücksrad und ab und zu beim Erledigen von Ämtli. Übrige Vorschläge angenommen (Pause bei Ferien, nie leiden, max. 8 Tiere im Header, Rad für Erwachsene optional, Tierwechsel als Preis, Wer wählt: Kind/Zufall).
- Ergänzung (17.11.): Drei Pillen – Happy-Pille (aufheitern), Entwicklungs-Pille (Spezialfarbe, Legende), **Wachstumspille** (+30 Wachstum für ein Tierchen nach Wahl, auch ältere). Glücksrad gibt mehr: 13 von 24 Feldern fürs Tierchen (5 Wachstumspille, 2 Entwicklungs-Pille, 3 Haustier-Extra, 2 Zubehör, 1 Tierwechsel); Rest: Avatar-Effekt 3, +20 Taler 3, Jubel 1, Joker 1, Nochmals 1, Doppelt 1, Sternfeld 1. Pille beim Ämtli: Chance = Punkte in Prozent, Sonderämtli doppelt, max. 50 %; davon 7/10 Wachstum, 2/10 Entwicklung, 1/10 Happy. Ergibt bei 80 %: Gross ≈ 11 Tage, Legende ≈ 41 Tage.
- Ergänzung 2 (17.11.): Wachstumspillen in 3 Grössen nach Ämtli-Grösse (klein +15 bis 5 Punkte, mittel +30 bei 10–15, gross +60 ab 20). Sonderämtli: doppelte Chance + immer eine Zufalls-Pille (max. 3/Tag). Futter = 7 Futterarten (Obst, Gemüse, Körner, Fisch, Fleisch, Insekten, Nektar) + Allesfutter; jedes Tier frisst 1–2 Arten; Drops passend zu den eigenen Tierchen (aktuelles ×3). Inventar mit Fächern (Planer-Design) und Maximum pro Ding (Futter 30, Pillen 5–20, Artefakte 1). Neue Dinge: Spielzeug (für immer), Gartensamen, Schlafplatz-Sachen (für immer), Postkarten. Artefakte (ca. alle 2 Wochen, Glücks-Zähler 3 Wochen): Sternenstein (ganze Stufe), Regenbogenfeder (Weg neu wählen / Spezialfarbe), Traumkristall (Wunsch-Ei, kein Fabelwesen). Fundbuch: alle Dinge, Unbekanntes als Silhouette ???. Denkfehler gelöst: Ab-/Anhaken gibt keine neuen Dinge, Spielzeug nicht verbrauchen, „Alle füttern“, Fortschritt bleibt beim Tierwechsel, keine Pillen auf Eier.
- Ergänzung 3 (17.11.): Keine Teufelshörner (Widderhörner, Hörnchen, Säbelzähne raus); Pfauenfächer nur Vögel. 11 neue themenspezifische Formen (Glut-Mähne, Blätter-Mähne, Eis-Kragen, Flossen, Mond-Schein, Sonnen-Kranz, Zucker-Horn, Pilz-Hut, Riesen-Blüte, Sternschnuppen-Schweif, Wolken-Schweif). Flügel nur für 6 Tiere als Legende (Pony, Einhorn, Katze, Reh, Tiger, Kitsune) – diese fliegen dann wirklich (Schwebeflug). Hüte passen nicht über Hörner/Geweihe/Hauben/Blüten → werden nicht angezogen, Hinweis „passt nicht“. Entwicklungsbaum mit Nebel nach der eigenen Stufe; neue Artefakte: Weitblick-Kristall (1 h ganzer Baum sichtbar) und Zauberspiegel (Weg wechseln, gleiche Stufe); Regenbogenfeder nur noch Spezialfarbe. Artefakt 2: Spezial-Animation in Schleife und im Bild, Fähigkeiten 4× häufiger.
- Ergänzung 4 (17.11.): Jedes Tierchen mehrfach: neues Ei bringt immer eine noch fehlende Art (bis alle da sind); neues Glücksrad-Feld „Geschwister-Ei“ (ersetzt Tierwechsel) = Art, die man schon hat → anderer Weg im Baum; Album „Fuchs ×2 · Wege entdeckt 3/5“, „Alle Wege“-Abzeichen, max. 3 pro Art. Rollen: 1 pflegen, +1 im Planer, max. 8 im Garten (Kommentar nannte einmal 10 – nachfragen). Entwickeln nur per Knopf + Auswahl im Baum, Pillen entwickeln nie von selbst. Taler nur beim ersten Erledigen pro Tag. Verworfen: Laden, einfache Bäume für Kleine, Rad für Erwachsene, Tierwechsel-Preis, Sonderämtli-Limit. Schwimmen repariert (Pool-Status pro Szene, niemand läuft mehr übers Wasser). Katze Vorwärtssalto, Igel-Kugel neu; Sprünge mit Vorbereitung, Strecken und Staub. Artefakt 6 mit 5 + 5 Vorschlägen Personenkarte / Bereich „Tierchen“.

### 61. Freiwillige Ämtli: wie viele darf ein Kind nehmen? (17.11.)
Status: Frage beantwortet, Idee wartet auf Entscheid.
- Heute: kein Limit – ein Kind kann jedes offene freiwillige Ämtli nehmen (nur „max. offene Ämtli“ begrenzt, wie viele gleichzeitig angeboten werden).
- Idee: Einstellung „Freiwillige Ämtli pro Person und Tag“ (unbegrenzt / 1 / 2 / 3), damit auch die anderen eine Chance haben; zusätzlich evtl. „erst wieder nehmen, wenn das genommene erledigt ist“.


## 61 · Dev- und Prod-Version parallel in Home Assistant (verworfen, 17.11. – zu heikel)
- Zweites öffentliches Repo `magi1982/family-planer-dev`; HACS installiert beide nebeneinander.
- Ein Skript (`tools/make_dev.py`) erzeugt die Dev-Variante automatisch aus demselben Code: Domain `family_planer_dev`, Name „Family Planer DEV“, Karten `family-planer-dev-card` usw., innere Elemente `fpd-…`, WebSocket-Befehle `family_planer_dev/…`, eigene Datei-URLs und eigener Speicher. So kollidiert nichts.
- Dev startet mit eigener Einrichtung und Testfamilie (Beispieldaten); standardmässig **stumm**: keine Ansagen über Alexa, keine Benachrichtigungen, keine echten To-do-Listen – damit Tests die Familie nicht stören.
- Ablauf: Änderungen → Push nach Dev → am PC testen → „prod“ → derselbe Stand ins jetzige Repo + Release.
- Tests: Skript-Test, dass in der Dev-Variante kein `family_planer/` oder `family-planer-card` mehr vorkommt.

## 62 · Grafische Fehler auf dem Tablet (Version 0.16.0, gemeldet 17.11.)
- Namen auf Personenkarten mit „…“ abgeschnitten (schmale Spalten): Name darf umbrechen bzw. kleiner werden; Prozent-Band nicht über den Namen legen.
- Ämtli-, To-do- und Sonderämtli-Texte brechen Wort für Wort und mit Silbentrennung um („Pflan-zen zu-sam-men“): Inhalt braucht die volle Breite; Punkte-Chip und Abzeichen in eine eigene Zeile statt daneben.
- Sonderämtli überlappen: Emoji, „Sonder“-Abzeichen und „+10“ liegen über dem Titel, Text läuft aus der Karte und über die Überschrift „SONDERÄMTLI“: keine festen Höhen, kein absolutes Positionieren, Raster [Haken | Text | Punkte] mit min-width:0.
- To-do-Chip zeigt eine E-Mail-Adresse und überlappt den Text: statt Adresse den Namen zeigen, Chip in eigene Zeile, sauber abschneiden.
- Rote Fehlerbox „Ansicht ‚statistik‘ fehlt in diesem Dashboard“ mitten im Kopf: für Kinder nicht sichtbar machen (nur im Bearbeiten-Modus bzw. als kleiner Hinweis), Knopf ohne Ziel ausblenden.
- Test: Layout-Test in schmalen Spalten (3–5 Personen, lange Wörter, viele Sonderämtli) mit Screenshots, bevor ausgeliefert wird.

## 63 · Grundsatz: läuft ohne Handarbeit (18.11.)
- Wer den Planer über HACS installiert, muss nichts von Hand anlegen – keine Dashboard-Ansichten, keine Helfer, keine Automationen, kein Claude/MCP.
- Jede Seite (Statistik, Belohnungen, Listen, Tierchen …) muss auch ohne eigene Dashboard-Ansicht erreichbar sein: fehlt die Ansicht, öffnet der Navigationsknopf die Seite als Fenster über dem Planer (wie die To-dos).
- Prüfen: frische Installation mit Beispieldaten → alle Knöpfe funktionieren, keine Fehlermeldung, keine leeren Seiten.

## #64 Tablet check 0.16.2 (iPad landscape, planner area 1080×810)
Seen in the live app (Chrome, same CSS size as the tablet):
- Heute: person headers have different heights (leader avatar is bigger, badges get their own row) → SCHULE/TERMINE/ÄMTLI rows don't line up across columns. Idea: fixed header height, badges as small overlay on the avatar.
- Heute: in narrow columns (~190 px) the points chip always drops to its own line → every chore card is 2 lines even for short titles; fewer chores fit on screen. Idea: points stay right of the title when the title fits.
- Woche: the date range under "KW" is cut off at the right edge ("16. – 22. Novem…"); FR/SA/SO columns cut "Ämtli" to "Ämtl".
- Woche: today's column takes most of the width, the other days are very narrow.
- Long event titles in the Termine list are cut quite early ("Gamb…") next to the "in 12 Min" chip.

## #65 Freiwillig ohne eigene Spalte, Werkzeugleiste entschlacken
Live (1080×810): sobald ein freies Sonderämtli offen ist, kommt eine 6. Spalte → alle Familienspalten 197 → 163 px, Termine/Schule werden auf "G…" / "los 07:…" gekürzt.
- A: Freiwillig als flache gelbe Leiste über den Spalten (nur wenn etwas frei ist), Karten nebeneinander mit "Ich nehm's!". (empfohlen)
- B: gelber Knopf "🙋 2 frei" in der Werkzeugleiste (an Stelle von "To-dos 14"), öffnet ein Fenster.
- C: Schild im Banner (wie "Tipp!"), öffnet ein Fenster.
- "To-dos 14": die Zahl doppelt die To-dos in den Spalten. Idee: Knopf weg, Übersicht/Neu über "+" (Menü: Ämtli · To-do · Sonderämtli) und das Haken-Symbol im Banner.
- Setting? "Freiwillig anzeigen als: Leiste / Knopf / Schild" (Default Leiste).
- Decision (user): variant B – yellow "🙋 Freiwillig" button in the toolbar that moves (wiggle/pulse), opens a popup with the cards and "Ich nehm's!"; no 6th column.
- Rename filter "To-dos & Spezial" to something short (proposal: "Extras"; alternatives "Aufgaben", "Jobs").
- Stundenplan already shows every school block of the day (Alles only shows the current block, setting "Schulfenster"). Today (Wed) has only a morning block, so it looked the same.

## #66 GUI walk-through 0.16.2 (tablet size) – proposals
- Woche: person column very wide and mostly empty (avatar centred in a tall row) → narrow label column (avatar + name on top), more room for days.
- Woche: words broken mid-word in narrow cells ("kommuniziere-n") → hyphens:auto with lang="de" or allow 3 lines.
- Woche: KW date range cut at the right; FR/SA/SO show "6 Ämtl".
- Belohnungen: "Jetzt einlösbar" is only text → big "Einlösen" button on the card.
- Belohnungen: kids with points but "Noch nichts am Laufen" → suggest the nearest reward ("Kinderbueno in 3 Tagen").
- Header: icons without labels (calendar, list, trophy, chart) → small labels under them or a tooltip on long-press.
- Statistik: no empty state – when there is no data yet, explain why ("Ab morgen siehst du hier …").
- Einstellungen: avatar parts row overflows to 2 lines on tablet; could scroll horizontally.

## #67 Symmetric chore buttons + statistics polish (preview on branch preview-cards)
- Button = grid [tick] [title + chips below] [points], everything vertically centred; points pill compact (coin 11 px). Short titles: one row, ~10 % less height; long titles: full text, a bit taller.
- Statistik: "1 Tage" → "1 Tag"; hide adult columns without chores in "Welche Ämtli"; "Wer hat was gemacht" card has a big empty area (align heights / put legend at top); "To-dos abgehakt 0" although to-dos were done → check counting; reliability cards: a person without chores → show "keine Ämtli" instead of empty dots; same circle size for all counts in a short period → scale per period.

## #68 Avatar extras: why it's gone + "new" badge (for 0.16.5)
- Avatar builder: extras that are no longer available stay visible as a greyed tile with a short reason:
  season extra → "Nur im Herbst – kommt wieder ab 1. Sept."; award extra → "Gehört zum Pokal «Krone der Woche» – zurückholen: Woche mit allen Ämtli".
  If the child was wearing it, the builder shows once: "Dein Pilzhut ist weg, weil der Herbst vorbei ist."
- Red round badge (iOS style) on the settings button in the header with the number of new extras since the person last opened the builder (per person; who is "me" = the person tile last opened on this device, else sum over children).
  New = season extras that just started, extras unlocked by a new award. Opening the person in the builder marks them as seen.
- Red dots on every level, so no child has to search: settings button in the header (total) → each person tile in the builder (only the children who got something new, with their count) → each tab (Kopf, Kleidung, Begleiter, Effekte, Saison …) → each new item tile.
- Setting (Einstellungen → Allgemein): "Neu-Hinweis am Einstellungen-Knopf" on/off, default on.
- Stored server-side per person (seen list), so it works on every tablet and for other installers without setup.

## #69 Bug: banner animation restarts when a banner button is pressed (for 0.16.5)
- Seen live: a story/animation runs in the header, a tap on a header button (page, holidays, settings) starts it again from the beginning.
- Likely cause: the header re-renders its whole shadow DOM on every change; the scene element is kept but taken out and put back in, and the browser restarts all CSS animations of a re-inserted element.
- Fix idea: on re-render only update what changed (button states, clock, badges) and never detach the scene; a test that the scene node stays connected across renders.

## #70 Tierchen – decisions from the preview round (18.11.)
- Every chore gives the same amount of **Münzen** (only for rewards) and **Punkte** (only for the pets).
- Punkte are put into the active pet with a button (up to 50 per tap) → growth bar. Hatching and "Entwickeln" stay actions; "Entwicklungsbaum" is the button that only shows the tree.
- Planer card: no pet progress; pet bottom-right at the avatar (~60 px); reliability and level as two ribbons in the same style; wheel = plain coloured wheel when free, grey when used, not touching the edge.
- Tierchen page in the main area (not a popup): "Wessen Tierchen?" first, then the child's header in its colour + "Anderes Kind".
- Pflege: "Aktuelles Tierchen pflegen: <name>", growth bar with numbers, every item shows what it does (Hunger +35 …), nothing is used when not needed (stays in the inventory), toys stay, full inventory below; no hover (tablet).
- Sammlung like Pokémon GO: growth on top, animal left, facts right (Spezial, Grösse, Gewicht, Futter, Lieblingsplatz, Tage); owned first, unknown below. Tierbuch: owned first with "Entwicklungsbaum", hidden ones below; the tree shows the current look, only the future is hidden.
- Garden = the planer's banner scene (same house, pool, season), only this child's pets, swimmers go bathing; pets step back while a banner story plays.
- Statistik on the Tierchen page: pet numbers only.
- Design everywhere: the planer's tiles (dark tile, colour on top), the planer's buttons.
- Adults: same card design; Tierchen per person on/off (Tierchen page, top). Off = still Münzen, no Punkte; nothing is lost (pets, inventory, Punkte stay). Off = no pet, no wheel on the card, no pets in the banner.
- Glücksrad: the prize is shown big (picture, name, what it does) and lands in the inventory.
- Card ribbons: one split capsule – reliability left, level right (tier colour).
- Currency names (decided): **Münzen** = planner & rewards only (page "Münzen & Belohnungen", chores, statistics, settings). **Punkte** = Tierchen only (Tierchen page shows only ⭐ Punkte, never Münzen). Glücksrad prizes are Punkte. Tree requirements count "Wachstum", never "Taler".
- Real release: rename the reward currency Punkte → Münzen in rewards.js, stats.js, settings.js, todos.js, special.js, ui_week.js, confetti.js (DE + EN "coins"); coin without letter must not show a star (⭐ belongs to the Tierchen) – use a plain gold core.
- Tierchen page structure (decided): tabs Garten · Aktuelles Tierchen (Punkte einsetzen, Entwicklungsbaum, **Entwickeln** as main button, pills) · Pflegen (care only, pet stands in the real garden of the banner, same season) · Inventar (own tab) · Sammlung · Tierbuch · Statistik. Sammlung/Tierbuch open the same pet view for any owned pet.
- Entwicklungs-Pille: always evolves one whole stage right away (any stage, also hatching).
- Pets get a name from the child: name big, kind small behind it ("Katze · aktiv"); max 16 chars, plain text only.
- Sammlung card: stage once (top), name, line / special / days together, growth bar without text. No weight/height anywhere.
- Same building blocks everywhere: frame with season band (Planer, Listen, Belohnungen, **Statistik – band missing today, bug**, Tierchen), tiles = #1c2027, radius 12, colour line `inset 0 3px 0` (planer column look) – rewards person cards (today left border), stats tiles/sections, list sections. Avatar + pet identical everywhere (64/60, right −31, bottom −17), capsule reliability | level identical.
- Chore tick: no coin flying to the avatar; the earned Münzen/Punkte rise slowly above the chore (≈4 s).
- Garden (decided): top = the real banner (house small like in the banner, pool, sky, season); below a big front garden (climbing tree, bushes, hedges, flower bed, stone, hill, lamp, bowl) in the banner's ground colour – pets run, climb, hide, swim in the pool and stay in the picture.
- Pflegen background = same spotlight as the pet view (no garden). "Dieses jetzt pflegen" (green) makes a pet the active one and opens Pflegen.
- Sammlung card: 4 per row; stage + aktiv on top, pet, name (+ kind), rows Linie / Spezial / Frisst / Mag / Zusammen (no overlap, values cut with …), growth bar.
- Page button 🐾 = mdi:paw in the planer's button style; while the Tierchen page is open only it is highlighted.
- Tierchen page (picker + head): no reliability, no level – only avatar + pet, name, pet and Punkte. The capsule stays on the planer card.
- Tabs now: Garten · Aktuelles Tierchen · Inventar · Sammlung · Statistik. **Tierbuch removed** (duplicate of Sammlung: own pets, unknown pets, tree via the pet view). **Pflegen merged** into Aktuelles Tierchen: left the pet (care animations) with name + 4 values (2×2), right "Entwickeln" (bar, Entwickeln | 50 Punkte | Baum in one row, pills) and "Pflegen & spielen" (food + toys) – everything on one tablet screen. Other pets (from Sammlung) show only Entwickeln + green "Dieses jetzt pflegen".
- Tierchen on/off: not in the head any more – behind ⚙️ (Tierchen-Einstellungen) with explanation and a second confirmation ("Wirklich ausschalten? Abbrechen / Ja, ausschalten"). Off page has a green "Tierchen wieder einschalten".
- Points button: neutral grey "Punkte einsetzen" with "50 ⭐ → +50 Wachstum"; only "Entwickeln" turns yellow. Tree button reads "🌿 Entwicklungsbaum".
- Redesign "Aktuelles Tierchen" (after "sieht scheisse aus"): one slim head bar (avatar + pet, name ▾ to switch person, tabs as plain text, ⭐ points, cog for settings); pet directly on the tile (no box in a box), name + pencil, 4 values as round gauges; right: thick progress bar with numbers inside, two buttons (Entwickeln = only yellow when ready, Punkte einsetzen), tree button top right, pills as one row of chips; "Pflegen & spielen" shows only things you have, effect as small tag in the colour of the value. Fits one tablet screen.

### 62. Bildschirm wecken bei Bewegung (18.11.)
Wunsch: kommt jemand zum Tablet (Bewegungsmelder, z. B. Shelly BLU Motion), geht das Display an.
- **Was ein Browser kann:** ein schlafendes iPad (Auto-Sperre) kann keine Webseite aufwecken – das kann nur das Gerät selbst. Darum: iPad-Auto-Sperre auf „Nie“, und der Planer macht den „Schlaf“ selbst.
- **Vorschlag:** neue Einstellung *Bildschirmschoner* (Bereich Ansagen/Kiosk): nach X Minuten ohne Bewegung und ohne Tippen wird der Planer schwarz (Uhr klein in der Ecke, optional ganz schwarz, nachts automatisch). Bewegungsmelder meldet Bewegung oder jemand tippt → sofort wieder an. Der erste Tipp weckt nur, löst nichts aus.
- Bewegungsmelder: derselbe wie bei den Ansagen (#38), mehrere möglich; ohne Melder nur „Tippen weckt“.
- Einstellungen mit Beschreibung: Schoner an/aus, nach wie vielen Minuten (2/5/10/30), Art (Uhr / ganz schwarz), Bewegungsmelder.
- Android mit Fully Kiosk: dort kann der Bildschirm wirklich ein- und ausgeschaltet werden (eigene Integration) – optional später: „Fully-Kiosk-Gerät“ wählen.
- Offen: Shelly BLU Motion ist in Home Assistant noch nicht sichtbar (kein Bluetooth/BTHome eingerichtet).
- **Umgesetzt (18.11., 0.18.0):** Einstellungen → Bildschirm: an/aus, schwarz nach X Minuten (Standard 5), ganz schwarz oder mit wandernder Uhr, Bewegungsmelder. Weck-Tipp löst nichts aus; solange Bewegung gemeldet wird, bleibt er an. Fully Kiosk (echtes Display aus) bleibt Idee.

### 63. Mehr Tierchen: 10 statt 5 nach 3 Monaten (18.11.)
Heute: ein neues Ei gibt es nur, wenn das aktive Tierchen „Gross“ wird (normal 450 Punkte) → rund alle 450 Punkte ein Tier, im Beispiel 5 in 3 Monaten.
- **A – Ei schon bei „Jung“** (150 Punkte): ~3× so viele Eier (>10), aber viele bleiben klein, wenn das Kind gleich zum neuen wechselt.
- **B – Gross bleibt, dazu zwei Extra-Wege (Vorschlag):** Glücksrad-Feld „Ei“ (2 von 24 Feldern, ~1× pro 12 Tage → ~7 in 3 Monaten, Ei nur wenn noch kein ungeschlüpftes Ei wartet) und ein Bonus-Ei für eine 7-Tage-Serie (alle Ämtli 7 Tage am Stück). Zusammen ~10–12 in 3 Monaten, die Tiere wachsen trotzdem gross.
- **Einstellung „Neue Eier“:** selten (nur Gross) / normal (Gross + Glücksrad) / oft (Gross + Glücksrad + Serie) – mit Beschreibung.
- Obergrenze bleibt: höchstens 1 wartendes Ei gleichzeitig, Sammlung max. 42 Arten.
- **Zusatz (18.11.): mehr Punkte und mehr Sonderdinge.** Vorschlag:
  - Glücksrad neu (24 Felder): Wachstums-Pille 5, Extra/Sonderding 6 (vorher 5), Futter 2 (vorher 4), Punkte 4 mit **+30 statt +20**, Entwicklungs-Pille 2, **Ei 2 (neu)**, nochmal drehen 2, Stern 1.
  - Fundsachen beim Ämtli: Pillen-Chance = Punkte × 1.5 in Prozent (vorher × 1), höchstens 60 % (vorher 50 %); Sonderämtli weiterhin doppelt.
  - Bonus für 7-Tage-Serie: Ei + 1 Extra.
- **Rechnung (18.11., 200 Durchläufe × 90 Tage, echte pets.py):** Heute schon Ø 7–8 Tiere, davon Ø 3–4 Legende (Entwicklungs-Pillen füllen eine ganze Stufe), dazwischen nur 1–2. **B leicht** (1 Rad-Ei, Punkte-Feld +30, Extras 6 Felder, Futter 2, Serien-Ei + Extra, Pillen unverändert): Ø 11–12 Tiere, Ø 3–4 Legende (min 2), Ø 4 dazwischen (bei gemischter Spielweise). **B voll** (2 Rad-Eier, Pillen ×1.5): Ø 15 Tiere – zu viele Babys. Empfehlung: B leicht.
- **Umgesetzt (18.11., 0.18.0):** Rad-Ei (Einstellung Neue Eier selten/normal/oft), Punkte-Feld +30, Extras 6, Futter 4, Entwicklungs-Pille 1 Feld + spätestens nach 24 Drehs, nochmal 1; Garten-Wachstum +3/Tag für Babys/Jungtiere. Test tests/test_pets_balance.py: Ø 10.6 Tiere, Ø 3.2–3.4 Legende (min 2), dazwischen 2.4 (Liebling) bis 4.7 (gemischt).

### 64. Inventar: jedes Ding antippbar mit Erklärung (18.11.)
Wunsch: im Inventar auf alles tippen können und erklärt bekommen, was es ist und wie man es einsetzt.
- Tipp auf ein Ding (auch auf graue, die man noch nicht hat) → kleines Fenster: grosses Bild, Name, „Was ist das?“ (1–2 Sätze), „Wirkung“ (Hunger +35, Laune voll, +30 Wachstum, ganze Stufe …), „So setzt du es ein“ (z. B. Aktuelles Tierchen → Pflegen & spielen antippen), „Woher bekommst du es?“ (Ämtli, Glücksrad, Serie …), Anzahl und Höchstmenge.
- Hat man es und kann es jetzt einsetzen: Knopf „Jetzt einsetzen“ für das aktive Tierchen (gleiche Regeln wie beim Pflegen; Pillen nur, wenn der Balken nicht voll ist).
- Sonderdinge (Kissen, Laterne, Artefakte): Erklärung, was sie bewirken; bei Artefakten auch, wofür sie im Entwicklungsbaum gebraucht werden.
- Texte DE/EN, kindgerecht, kurz.
- **Umgesetzt (18.11., 0.19.0):** Inventar antippbar mit Erklärung, Schritt-Grafik, Vorschau am eigenen Tierchen und „Jetzt einsetzen“; alle Sonderdinge haben eine echte Wirkung.

### 65. Artefakte zu Ende denken + neues Ei sichtbar machen (18.11.)
Michaels Vorgaben: im Entwicklungsbaum selbst wählen, ob ein Artefakt-Effekt aktiv ist; Tierchen-Auswahl mit doppelter Bestätigung; Traumkristall gibt dem Kind ein Ei; ein neues Ei muss man sehen.
- **Ziel-Tierchen wählen:** „Jetzt einsetzen“ → alle Tierchen als Karten (Eier nur, wo es passt) → antippen → „Wirklich für Funki einsetzen? Abbrechen / Ja“ (zweiter Schritt, kein Zufallsklick).
- **Effekte bleiben und sind schaltbar:** Farbe (Regenbogen, Kristall) und Sternen-Aura werden pro Tierchen dauerhaft gespeichert („freigeschaltet“), überleben jede Entwicklung. Im Entwicklungsbaum oben Schalter „Regenbogen-Farbe an/aus“, „Kristall an/aus“, „Sternen-Aura an/aus“ – nur eine Farbe gleichzeitig.
- **Traumkristall = Wunsch-Ei:** gibt ein neues Ei, aus dem das gewählte Tier schlüpft (Tierauswahl mit doppelter Bestätigung). Kein wartendes Ei nötig; höchstens 1 wartendes Ei gilt hier nicht (bewusstes Geschenk).
- **Neues Ei sichtbar:** heute nur in der Sammlung, ohne Hinweis. Neu: Meldung „Neues Ei! 🥚“ wenn es kommt; in „Aktuelles Tierchen“ oben eine Karte „Du hast ein Ei – jetzt ausbrüten“ (wechselt aufs Ei); Ei im Garten im Nest; kleiner Ei-Punkt am Tierchen auf der Planer-Karte.
- **Weitblick bleibt für immer – für ein Tierchen** (ultra-seltenes Artefakt): auf ein Tierchen eingesetzt, ist dessen Entwicklungsbaum für immer ganz sichtbar; andere Tierchen bleiben geheim. Im Baum steht dann „👁 Weitblick“. Öffnet nach dem Einsetzen direkt diesen Baum.
- **Vorschau** zeigt die echte Wirkung am gewählten Tierchen; **Fenster** zweispaltig und kompakt.
- **Level-Belohnungen statt Begleiter** (Level 4, 8, 13, 18, 22, 27) – Vorschlag Traumkristall, Sternenstein, Fabelwesen-Ei, Regenbogenfeder, Fabelwesen-Ei, Zauberspiegel.
- **Umgesetzt (18.11., 0.19.0):** #65 komplett – Zielwahl mit Rückfrage, Effekte dauerhaft und im Baum schaltbar, Weitblick pro Tierchen für immer, Traumkristall gibt Wunsch-Ei, Ei-Hinweise, Schlüpfen ohne Vorwegnahme, Level-Artefakte statt Begleiter (alle Kinder aktuell ≤ Level 3).
- **Umgesetzt (19.11., 0.19.0):** Nachtschlaf 21–7 Uhr (+8 Energie/h), Nickerchen unter 25 % Energie (~1 h, +40/h), Energydrink/Sternkissen beendet es; Sternfeld gibt Jackpot, wenn alle Artefakte schon da sind.
- **Idee (19.11.): Tierchen/Ei nicht mehr im Avatar** – Planer-Karte: Tierchen bekommt eigenen Platz rechts neben dem Avatar. A = Ei im Nest daneben, B = rundes Medaillon in Personenfarbe. Hinweis-Ei (🥚) und Apfel sauber am Rand statt im Gesicht. Wartet auf Michaels Wahl.
