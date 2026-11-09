# Changelog

## 0.5.3 – 2026-11-09

### Wartung
- Releases entstehen jetzt automatisch, sobald alle Prüfungen (Tests, hassfest, HACS, Sicherheit) grün sind.
- Manifest um die neuen Home-Assistant-Kategorien ergänzt (*Kalender & To-dos*, *Einkaufen*).
- Buy-Me-a-Coffee-Knopf in der Beschreibung.
- Keine Änderungen an den Funktionen – Update ist optional.

## 0.5.2 – 2026-11-08

### Neu
- **Faire Punkte**: Ein ganz erledigter Tag ist für alle gleich viel wert, egal wie viele Ämtli jemand hat. Jedes erledigte Ämtli bringt sofort seinen Anteil, die Punkte im Ämtliplan wirken als Gewicht.
- Einstellungen unter *Wochenplan → Punkte & Belohnungen*: **Punkte verteilen** (Fair / Pro Ämtli) und **Punkte für einen ganzen Tag** (Standard 30), beide mit Beschreibung (DE/EN).
- Tests für die faire Verteilung.

## 0.5.1
- Alle bisher festen Werte sind jetzt einstellbar und beschrieben: Zurück-zur-Startansicht-Zeit, Zuverlässigkeits-Zeitraum,
  Mittagspause für Schulblöcke, Mindestdauer und Prüfintervall für Ferien, Anzahl Ämtli pro Ansage, Gültigkeit der
  Belohnungs-Meldung, Ersetzen ungenutzter Kategorien.
- Integrationsbeschreibung mit vollständiger Einstellungs-Übersicht inkl. Standardwerten.

## 0.5.0
- Warteschlange für einmalige Ansagen: wartet bis zur nächsten Bewegung (mit Ruhezeiten), läuft ab, wird gestrichen wenn erledigt.
- Automatische Meldungen für freigegebene Belohnungen und besondere Ämtli; neue Dienste `queue_announcement` und `clear_announcement`.

## 0.4.2
- Schule erscheint nur in „Alles“ als Blöcke (los · zuhause); „Termine“ ohne Schule; „Stundenplan“ zeigt nur Personen mit Stundenplan und jede Lektion mit Ort.

## 0.4.1
- Stundenplan in Blöcken: bis zu zwei Blöcke pro Tag (z. B. Mittag zuhause), automatische Trennung bei langen Pausen im Schulkalender.

## 0.4.0
- Besondere Ämtli nach Datum: Intervall, monatlich, jährlich, einmalig; abwechselnd, bis 60 Tage Zeit, eigene Punkte.
- Ferien pausieren Ämtli; Ferien-Wörter werden beim ersten Kalender-Sync automatisch erkannt.
- Schule & Stundenplan pro Person mit Schulweg; neue Ansicht „Stundenplan“.

## 0.3.0
- Punkte, Level, Tages- und Serienbonus, echte Belohnungen mit Freigabe (Admin oder Eltern-PIN) und Benachrichtigung.
- Ansagen bei Bewegung über Alexa oder TTS.
- Sechs Designs, eigener Seitenleisten-Eintrag (kein YAML nötig).
- Sicherheits-Härtung (Validierung, Rechte, PIN-Hash, Upload-Prüfung), CodeQL/Bandit/ESLint in der CI.
- Diagnose, Reparaturhinweise, quality_scale.yaml, Marken-Icons für Home Assistant 2026.3+.
- Neues Logo mit Erkennungsmerkmal für weitere Integrationen.

## 0.2.0
- Name „Family Planer“, Module ein-/ausschaltbar.
- Smarte Listen: mehrere Listen, Kategorien pflegen sich selbst (max. 5–20), optional mit KI.
- Tageswechsel zur gewünschten Uhrzeit, Termin-Zuordnung über Namen abschaltbar.
- Nur noch bunte Avatare, eigenes Foto hochladen. Deutsch und Englisch.

## 0.1.0
- Erste Version als Integration: Ämtliplan (mehrere Personen, Wochentage, Rhythmus, Fristen), Wochenplaner mit Terminen,
  Zuverlässigkeit und Auszeichnungen, To-do-Liste und Sensor pro Person.
