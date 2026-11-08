# Mitmachen / Checkliste für neue Funktionen

Jede neue Funktion ist erst fertig, wenn:

1. **Einstellungen geprüft** – alles, was Nutzer sinnvoll anpassen möchten (Zeiten, Grenzen, Schwellen, Ein/Aus),
   ist unter *Konfigurieren* einstellbar, mit sinnvollem Standardwert und Beschreibung (`data_description`).
2. **Übersetzungen** – `strings.json`, `translations/de.json` und `translations/en.json` haben dieselben Schlüssel.
3. **Integrationsbeschreibung** – `README.md` beschreibt die Funktion (Deutsch ausführlich, Englisch kurz) und die
   Tabelle *Alle Einstellungen* ist aktuell.
4. **CHANGELOG.md** – Eintrag in der neuen Version; `manifest.json` und `const.py` haben dieselbe Versionsnummer.
5. **Tests & Prüfungen** – `pytest`, hassfest, HACS-Prüfung und der Security-Workflow sind grün.
6. **Sicherheit** – neue Eingaben werden serverseitig validiert (`validate.py`), Ausgaben im Frontend mit `esc()`.
