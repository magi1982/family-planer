# Ideen für die nächste Version (0.6.0)

> Arbeitsweise: Ideen werden hier gesammelt. Code wird erst geschrieben, wenn der Maintainer „mach es“ sagt.
> Jedes Update durchläuft die Release-Checkliste unten.

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
- [ ] README: Funktionsbeschreibung und Tabelle „Alle Einstellungen“ ergänzt
- [ ] CHANGELOG-Eintrag; Version in `const.py` und `manifest.json` erhöht
