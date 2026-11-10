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

## Ideen für die nächste Version

### 5. „+ Hinzufügen“-Knopf oben rechts im Ämtliplan
**Status:** Idee – noch nicht umgesetzt

- Im **Ämtliplan** oben rechts ein gut sichtbarer Knopf **„+ Hinzufügen“** (auf dem Tablet gross genug zum Tippen).
- Ein Tipp öffnet eine kleine Auswahl:
  - **Besonderes Ämtli** – mit Datum, Wiederholung (Intervall, monatlich, jährlich, einmalig) und Frist, z. B. *Luftfilter reinigen alle 6 Monate* oder *Pneuwechsel am 15. März*
  - **To-do** – ohne Datum, bleibt bis erledigt
- Danach direkt das passende Formular (Titel, Person(en), Punkte, Icon) – ohne zuerst nach unten zu den bestehenden Abschnitten scrollen zu müssen.
- Gleicher Knopf auf Deutsch und Englisch; optisch wie die übrigen Knöpfe im gewählten Design.

**Mögliche Einstellungen** (bei der Umsetzung prüfen, jeweils mit Beschreibung DE/EN):
- Wer über den Knopf hinzufügen darf: alle, nur Eltern (Eltern-PIN) oder nur Admins
- Knopf auch in der Wochenansicht (Planer) anzeigen: ja/nein

**Offene Fragen:**
- Soll der Knopf auch für normale (wiederkehrende) Ämtli gelten oder nur für besondere Ämtli und To-dos?

### 6. Kleinere Verbesserungen aus der ersten Installation
**Status:** Idee – noch nicht umgesetzt

- **Fehlende Dashboard-Seite melden:** Zeigt die Navigationsleiste auf eine Seite, die es im Dashboard nicht gibt (z. B. `einstellungen`), springt Home Assistant still auf die erste Seite. Besser: Knopf ausblenden oder einen Hinweis zeigen, welche Ansicht/`paths` fehlt.
- **Zweiten Planer bewusst anlegen:** Wird die Integration ein zweites Mal hinzugefügt, entstehen alle Entitäten doppelt (`_2`). Beim Einrichten fragen „Es gibt schon einen Planer – wirklich einen zweiten anlegen?“.

### 7. Platin-, Gold-, Silber- und Bronzerahmen statt kleiner Krone
**Status:** Idee – noch nicht umgesetzt

- Statt der kleinen Krone auf dem Kopf der Figur bekommt das runde Personenbild einen **edlen, coolen Rahmen** (Platin, Gold, Silber oder Bronze), je nach Auszeichnung.
- Rahmen z. B. als goldener Verlauf (hell → dunkel) mit leichtem Glanz bzw. sanftem Schimmer; dezent animiert, ohne vom Planer abzulenken.
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
