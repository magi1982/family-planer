# Ideen für die nächste Version (0.6.0)

> Arbeitsweise: Ideen werden hier gesammelt. Code wird erst geschrieben, wenn der Maintainer „mach es“ sagt.
> Jedes Update durchläuft die Release-Checkliste unten. **Vor jedem Release wird gefragt**; Release Notes und CHANGELOG sind auf Englisch.

## Ideen

### 1. To-dos im Ämtliplan (ohne Ablaufdatum)
**Status:** Idee – noch nicht umgesetzt

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
**Status:** Idee – noch nicht umgesetzt

- Neue Ansicht **„Einstellungen“** direkt im Family Planer (Seitenleiste/Tablet), statt der mühsamen Home-Assistant-Dialoge.
- Übersichtlich in Kacheln/Tabs: *Personen & Kalender*, *Schule*, *Ferien*, *Punkte & Belohnungen*, *Ansagen*, *Listen*, *Design & Sprache*, *Allgemein*.
- Direkte Bearbeitung mit Live-Vorschau (z. B. Farbe, Design, Sprache), Personen per Drag & Drop sortieren, Entitäten mit Suche auswählen.
- Jede Einstellung mit kurzer Beschreibung (DE/EN) direkt daneben.
- Die bisherigen HA-Optionen bleiben als Fallback bestehen.

**Mögliche Einstellungen / Schutz:**
- Zugriff immer mit **Eltern-PIN** (entschieden), optional zusätzlich nur für Admins

### 3. Belohnungen im Dashboard anlegen und ändern – mit Eltern-PIN
**Status:** Idee – noch nicht umgesetzt

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
**Status:** Idee – noch nicht umgesetzt

- **Doppelklick / Doppeltippen** auf den Family Planer schaltet in den **Vollbildmodus** (Kopfzeile und Seitenleiste von Home Assistant verschwinden), nochmals doppeltippen beendet ihn – wie in der früheren lokalen Version.
- Funktioniert in der Seitenleisten-Ansicht und auf Dashboard-Karten; Doppeltippen auf Ämtli, Knöpfe oder Eingabefelder löst es nicht aus.
- Fallback, wenn der Browser kein echtes Vollbild erlaubt (z. B. iPhone-Safari): Kopfzeile und Seitenleiste ausblenden.

**Mögliche Einstellungen:**
- Vollbild per Doppelklick ein/aus (Standard: ein)
- Beim Öffnen automatisch Vollbild (Standard: aus)

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
