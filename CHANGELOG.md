# Changelog

## 0.5.3 – 2026-11-09

### Maintenance
- Releases are now created automatically once all checks (tests, hassfest, HACS, security) pass.
- Manifest now declares the new Home Assistant categories (*Calendars & to-dos*, *Shopping & groceries*).
- Buy Me a Coffee button in the description.
- No functional changes – this update is optional.

## 0.5.2 – 2026-11-08

### New
- **Fair points**: a fully completed day is worth the same for everybody, no matter how many chores someone has. Every finished chore immediately earns its share; the points in the chore plan act as weights.
- Settings under *Weekly plan → Points & rewards*: **How points are given** (fair / per chore) and **Points for a full day** (default 30), both with descriptions (DE/EN).
- Tests for the fair distribution.

## 0.5.1
- All previously fixed values are now configurable and documented: return-to-home-view delay, reliability period,
  lunch break for school blocks, minimum duration and check interval for holidays, number of chores per announcement,
  validity of reward messages, replacement of unused categories.
- Integration description with a complete settings overview including default values.

## 0.5.0
- Queue for one-off announcements: waits for the next motion (respecting quiet hours), expires, and is dropped once done.
- Automatic messages for approved rewards and special chores; new services `queue_announcement` and `clear_announcement`.

## 0.4.2
- School appears as blocks (leave · home) only in "All"; "Events" without school; "Timetable" shows only persons with a timetable, each lesson with its room.

## 0.4.1
- Timetable in blocks: up to two blocks per day (e.g. lunch at home), split automatically on long breaks in the school calendar.

## 0.4.0
- Special chores by date: interval, monthly, yearly, once; rotating, up to 60 days to complete, own points.
- Holidays pause chores; holiday keywords are detected automatically on the first calendar sync.
- School & timetable per person including travel time; new "Timetable" view.

## 0.3.0
- Points, levels, day and streak bonuses, real rewards with approval (admin or parent PIN) and notifications.
- Announcements on motion via Alexa or TTS.
- Six designs, own sidebar entry (no YAML needed).
- Security hardening (validation, permissions, PIN hash, upload checks), CodeQL/Bandit/ESLint in CI.
- Diagnostics, repair issues, quality_scale.yaml, brand icons for Home Assistant 2026.3+.
- New logo with a recognisable trait for future integrations.

## 0.2.0
- Name "Family Planer", modules can be switched on and off.
- Smart lists: multiple lists, self-maintaining categories (max. 5–20), optional AI.
- Day change at a configurable time; event assignment by name can be switched off.
- Colourful avatars only, upload your own photo. German and English.

## 0.1.0
- First version as an integration: chore plan (multiple persons, weekdays, rhythm, deadlines), weekly planner with events,
  reliability and awards, to-do list and sensor per person.
