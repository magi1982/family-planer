# Rollen, Kiosk & eigene App – Konzept

Stand: 19.11.2026 · Ziel-Version 0.20.0 · Entwicklung im **DEV-Kanal** (siehe unten), der Live-Planer bleibt unverändert,
bis alles getestet ist.

## Ziel

Ein Planer für alle. Jede Person meldet sich mit **eigener PIN** an und sieht, was ihre **Rolle** erlaubt:
der Admin alles, ein Elternteil z. B. Ämtli und Sonderämtli, Kinder nur ihre eigenen Daten. Das Wand-Tablet läuft
als **Kiosk** und zeigt den Tag der Familie wie heute. Zugriff **nur im Heim-WLAN**, ohne Home-Assistant-Konto.

## Entscheidungen

| # | Entscheidung |
|---|---|
| 1 | Nur Heim-WLAN; Zugriffe über Nabu Casa / von aussen werden abgewiesen |
| 2 | Im Kiosk darf jeder alle Ämtli und To-dos abhaken (wie heute), es wird protokolliert („Kiosk“) |
| 3 | Im Kiosk sind Tierchen nur sichtbar (Personenkarte, Header). Pflegen, Entwickeln, Glücksrad, Inventar nur im eigenen Bereich |
| 4 | Belohnungen einlösen im Kiosk nur mit eigener PIN |
| 5 | Erste PIN eines Kindes nur mit Freigabe eines Elternteils (PIN oder Einladungs-QR) |
| 6 | Kinder dürfen standardmässig die Einkaufsliste benutzen (pro Rolle abschaltbar) |
| 7 | Design und Sprache gelten für die ganze Familie |
| 8 | Ein Release, intern Schicht für Schicht gebaut; getestet im DEV-Kanal parallel zum Live-Planer |

## 1. Personen, Rollen, Rechte

Jede Person: eigene PIN (4–8 Ziffern, selbst gewählt und änderbar), eine Rolle, optional verknüpfter HA-Benutzer.

**Rechte** (pro Rolle frei wählbar):

| Recht | Bedeutet | heutige Befehle |
|---|---|---|
| `chores` | Ämtliplan verwalten | chore/save, chore/delete |
| `special` | Sonderämtli verwalten | sonder/save, sonder/delete, sonder/template, sonder/list |
| `todos` | To-dos für andere anlegen/löschen, Grösse festlegen | todo/save, todo/delete |
| `rewards` | Belohnungen verwalten | reward/save, reward/remove |
| `approve` | Belohnungen freigeben | reward/decide |
| `coins` | Münzen vergeben/abziehen | points/adjust |
| `vacation` | Ferien-Check entscheiden | vacation/decide |
| `family` | Ämtli, Münzen, Statistik aller sehen | (Filter) |
| `calendar` | alle Termine sehen | (Filter) |
| `lists` | Listen benutzen | Listen ansehen, hinzufügen, abhaken |
| `lists_admin` | Listen verwalten | list/categories, list/assign, settings/list, settings/list_remove |
| `people` | Personen, Rollen, PINs, Geräte | person/*, settings/person*, Rollen, Geräte |
| `settings` | Einstellungen, Design, Ansagen, Saisons | settings/*, theme/set, announce/test, rollover, refresh |

**Rollen** (vorgegeben, anpassbar, eigene möglich):

- **Admin** – immer alle Rechte, nicht einschränkbar; mindestens eine Person bleibt Admin.
- **Elternteil** – alles ausser `people` und `settings`.
- **Kind** – nur `lists`; sonst nur die eigenen Sachen.
- **Kiosk** – Geräte-Rolle (siehe 3).

Immer ohne besonderes Recht erlaubt, aber **nur für sich selbst**: eigene Ämtli/To-dos abhaken, Sonderämtli
übernehmen, eigene Tierchen, eigene Belohnungen einlösen, eigenes Bild, eigene PIN, eigene Geräte.

## 2. Eigener Bereich (Kinder und alle ohne `family`)

- **Heute / Woche:** eigene Ämtli, To-dos, Sonderämtli, freiwillige Sonderämtli zum Übernehmen.
- **Kalender:** eigene Termine, Stundenplan und per Name zugeordnete Termine aus anderen Kalendern
  („Lea Turnen“ bei Mama). Fremde Termine kommen nicht aufs Gerät.
- **Tierchen:** alles (Garten, Pflege, Entwickeln, Inventar, Sammlung, Glücksrad).
- **Belohnungen:** Münzen, Level, Auszeichnungen, Einlösen, Verlauf.
- **Statistik:** eigene Seite; Familienvergleich nur mit `family`.
- **Mein Bild, meine PIN, meine Geräte.** Fremde Bilder ändern ist nicht mehr möglich.

Erwachsene mit Rechten sehen zusätzlich die passenden Seiten; offene Freigaben als Badge.

## 3. Kiosk

- Tagesansicht der Familie wie heute (Personen, Termine, Ämtli, Header).
- Ohne PIN: Ämtli und To-dos abhaken, freiwillige Sonderämtli übernehmen (auf sich tippen).
- Tierchen nur sichtbar: kein Glücksrad-Knopf, keine Ei-Hinweise, kein Tierchen-Knopf in der Navigation;
  ein Tipp aufs Tier macht nur eine kleine Animation.
- **Auf sich tippen + eigene PIN** → 10 Minuten mit den eigenen Rechten (ersetzt die Eltern-PIN), dann zurück.
- Belohnungen einlösen nur so (mit eigener PIN).
- Ein Gerät wird einmalig mit Admin-PIN zum Kiosk und bleibt es.
- Schwarzer Bildschirm, Vollbild, Zurückspringen nach Wartezeit: nur im Kiosk.
- **QR-Knopf** in der Navigation (siehe 5).

## 4. Login & Geräte

- Adresse: `http://<HA im WLAN>:8123/family-planer/` (kein HA-Konto nötig).
- Login-Bildschirm: Avatare + „Kiosk“ (nur auf freigegebenen Geräten); PIN; „Angemeldet bleiben“ (Standard an).
- Gerät bekommt einen zufälligen Schlüssel (Server speichert nur den Hash), 180 Tage gültig, bei Nutzung verlängert.
- Geräteliste: Name, zuletzt benutzt, abmelden. Person entfernt → Geräte abgemeldet.
- Erste PIN eines Kindes: Elternteil gibt frei (PIN oder Einladungs-QR), dann wählt das Kind.
- PIN vergessen: Eltern/Admin setzen zurück.
- 5 falsche PINs → Person 5 Minuten gesperrt; zusätzlich Bremse pro IP.

## 5. QR-Code & Home-Bildschirm

- QR-Knopf im Kiosk (und unter *Personen & Rollen*): QR-Code, Adresse als Text, Anleitung **iPad · iPhone · Android**;
  schliesst nach der Kiosk-Wartezeit.
- Adresse = interne URL von HA, in den Einstellungen überschreibbar (z. B. `homeassistant.local`); nie Nabu Casa.
  Ohne interne URL: Hinweis statt Code.
- QR-Code wird lokal erzeugt (kleiner MIT-Generator im Bundle, in THIRD_PARTY_NOTICES).
- **Einladungs-QR pro Kind:** Elternteil + PIN → Code 10 Min. / einmal gültig → Gerät ist freigegeben, Kind wählt PIN.
- Anleitung iPad: Kamera → Link in Safari → Teilen (oben bzw. „…“) → „Zum Home-Bildschirm“ → „Als Web-App öffnen“
  an → Hinzufügen → **über die Kachel öffnen und erst dort anmelden** (Kachel hat eigenen Speicher).
- Im normalen Browser: Hinweis-Banner „Leg mich als App auf den Home-Bildschirm“ mit passender Anleitung.
- Web-App-Manifest: Icon, Name, ohne Browser-Leiste, Notch berücksichtigt.

## 6. Home Assistant (Seitenleiste, Dashboards)

- Person ↔ HA-Benutzer verknüpfbar → in HA automatisch angemeldet, ohne PIN.
- HA-Admin ohne Verknüpfung = Admin (Notausgang).
- HA-Benutzer ohne Verknüpfung (z. B. Wand-Tablet mit eigenem HA-Konto) = Kiosk.
- Eigene Dashboards und Dienste (`add_points`, `announce`, …) bleiben.

## 7. Umbau im Hintergrund

1. **Rechte an einer Stelle:** jeder Befehl deklariert Recht + betroffene Person; Test prüft, dass kein Befehl
   ohne Deklaration existiert.
2. **Gefilterter Snapshot pro Login** (`planner.snapshot()` heute für alle gleich).
3. **Kalender auf dem Server:** Termine holen, per Name zuordnen (heute im Browser, `ui_week.js`), zwischenspeichern.
4. **Umgebung vom Server:** Wetter, Sonne, Pool/Whirlpool, Bewegungsmelder – nur konfigurierte Entitäten.
5. **Listen über den Server.**
6. **Eigener Websocket** der Integration (Login, Geräte, nur lokal), gleiche Befehle wie die HA-Variante.
7. **Frontend wiederverwenden:** Ersatz für das `hass`-Objekt, eigenes `ha-icon`, neue Seiten (Login,
   Rollen-Editor, Geräte, Meine PIN, Kiosk-Freigabe, QR).
8. **Protokoll „wer“:** Abhaken, Freigaben, Änderungen mit Person bzw. „Kiosk“.

## 8. Umstellung beim Update

- Bisherige Eltern-PIN gilt einmalig für alle Erwachsenen; jeder wählt danach seine eigene.
- Alle Erwachsenen starten als Admin, Kinder als Kind (ohne PIN).
- „Nur Admins dürfen den Plan ändern“ geht in den Rollen auf.
- Daten, Punkte, Tierchen bleiben.

## DEV-Kanal

Eine Integration kann in HA nicht zweimal laufen. `tools/make_dev.py` erzeugt deshalb aus dem Arbeitsbranch eine
Kopie mit eigenen Namen: Domain `family_planer_dev`, Seitenleiste *Family Planer DEV*, Karten
`custom:family-planer-dev-card`, eigene Daten, eigene Entitäten, violettes DEV-Band im Icon. Live und DEV laufen
gleichzeitig (geprüft: beide Bundles auf einer Seite ohne Konflikte; `tests/test_dev_build.py`).

Veröffentlicht wird die Kopie im Repository `magi1982/family-planer-dev` (HACS erlaubt nur eine Integration pro
Repository). Installation: HACS → Benutzerdefinierte Repositories → `…/family-planer-dev`, Typ Integration.

Damit mit echten Daten getestet werden kann, bekommt die DEV-Version beim Einrichten die Option
**„Daten vom Live-Planer übernehmen“** (einmalige Kopie; der Live-Planer wird nur gelesen). Ansagen sind im DEV
standardmässig aus, damit nicht beide Planer sprechen.

## Reihenfolge

| # | Schritt | Stand |
|---|---|---|
| 0 | DEV-Kanal: Build-Skript, Test, Repository, Datenübernahme vom Live-Planer | Skript + Test ✅ |
| 1 | Personen-PINs, Rollen, Rechte, Geräte-Schlüssel, Sperren, Umstellung | offen |
| 2 | Rechte in allen Befehlen, gefilterter Snapshot, Protokoll „wer“ | offen |
| 3 | Kalender, Umgebung und Listen über den Server | offen |
| 4 | Eigener Websocket, nur lokal, `hass`-Ersatz, `ha-icon`-Ersatz | offen |
| 5 | Login, Kiosk, eigener Bereich, Rollen-Editor, Geräte, Tierchen-Einschränkung | offen |
| 6 | QR-Code, Einladungs-QR, Home-Bildschirm-Anleitung, Web-App-Manifest | offen |
| 7 | Tests (Rechte-Matrix), Sicherheitsprüfung, README de/en, Release 0.20.0 | offen |
