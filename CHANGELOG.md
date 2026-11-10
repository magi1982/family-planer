# Changelog

## 0.8.1 – 2026-11-10

### Improved
- **Fair mode is fair everywhere**: reliability percentage, crown of the week, trophy of the month and busy bee now count every day the same (average of the daily rates / most complete chore days) instead of counting single chores. Somebody with 2 chores a day has the same chance as somebody with 6. *Per chore* mode is unchanged. Also applies to the reliability sensor and its award attributes.
- **Rewards view**: with nobody selected, every reward shows the persons it is for (picture and name, or "For everyone"); tapping a name selects that person.

### Fixed
- Rewards of one person no longer appear as if they were for everybody in the overview.

## 0.8.0 – 2026-11-10

### New
- **Design picker in the navigation**: a colour swatch at the top right shows the current design; tapping it opens a picker with a mini preview of every design (Home Assistant, Loxone, Apple Home, Google Home, Light, Nord). One tap switches for every device.
- New setting *Changing the design needs the parent PIN* (default off). The design field moved from the settings page to the picker; the Home Assistant options keep it.
- Navigation card option `theme_picker: false` hides the picker.

### Security
- New websocket command `family_planer/theme/set`: whitelisted design names only, respects *Only admins may change the plan* and, if enabled, the parent-PIN token.

## 0.7.0 – 2026-11-10

### New
- **Sizes instead of points for to-dos**: *No points*, *Small*, *Medium* or *Large*. Large = the points for a full day (setting), medium = ⅔, small = ⅓ – always rounded up to whole points. New setting *To-dos: default size*; another size when adding needs the parent PIN. Older to-dos keep their points.
- **Give points** (rewards view) offers the same *Small / Medium / Large* choice, plus *Take away* and a number of your own.
- **Reward categories**: *Small*, *Medium*, *Large*, *Mega* and *Giant*. Large = what a person earns in a month with every chore done every day, including day and streak bonuses; small = ¼, medium = ½, mega = 2×, giant = 5×. Costs follow the point settings automatically; *Own points* is still available.
- New settings *Value of a large reward* (default 20) and *Currency* (default CHF): the dialog shows an approximate money value for every category.
- **School only when it matters**: in the "All" view a school block appears 60 minutes before leaving and disappears 60 minutes after getting home, for each block. New setting *Show school only around school time* (0 = always).
- **To-dos button** at the top right of the planner opens the to-dos in a window of their own (with the number of open to-dos); the chore plan still shows them at the bottom.

### Improved
- "All" view: today large, tomorrow medium, every other day very narrow.
- Today's chores sit two side by side, so more fits on a landscape tablet.
- Empty days stay empty – no more "free" / "Free today" text.
- Trophies and awards next to the percentage are larger.

### Fixed
- Rewards view: with nobody selected it now shows all rewards and all pending requests; tapping a person shows only theirs (tap again to clear). Before, the first person was always selected and pending requests of one person were shown for everybody.

## 0.6.0 – 2026-11-10

### New
- **Settings page in the planner** (*Settings* in the navigation): all options with descriptions in tabs – general, people & school, holidays, points, to-dos, announcements, lists. Entities are picked from lists, invalid input is refused with a clear message. Protected by the parent PIN.
- **Edit rewards in the dashboard**: add, change and delete rewards directly in the *Rewards* view – always with the parent PIN.
- **Parent PIN**: start PIN `123456` that must be changed on first use (repair notice while active); change it in the dashboard; one PIN entry unlocks for 10 minutes; *Lock* ends it.
- **To-dos without a date**: per person, stay until done, ticking off asks for confirmation; optional points. Shown below the planner and the chore plan.
- **Fullscreen on double tap**: hides the Home Assistant header and sidebar (real fullscreen where allowed); optional automatic fullscreen when opened.
- New settings: *Fullscreen on double tap*, *Fullscreen automatically when opened*, *To-dos: confirm completion / default points / show finished ones for*, *Reset parent PIN to 123456*.

### Improved
- The dashboard reconnects by itself after the integration reloads (e.g. after saving settings).
- PIN checks no longer block Home Assistant (PBKDF2 runs in the executor).

### Security
- Settings input is rebuilt from known keys only (`settings_spec.py`), unit-tested; PIN unlock tokens are random, short-lived and bound to the entry. See SECURITY.md (items 12–15).

## 0.5.4 – 2026-11-10

### New
- **Language setting** under *Configure → Design, language & sidebar*: *Automatic* (follows your profile / Home Assistant), *Deutsch* or *English*. A fixed language applies to the planner, tablet views, announcements, notifications and level names – e.g. Home Assistant in English, Family Planer in German.
- Priority: `language:` option of a dashboard card > integration setting > profile / Home Assistant language.
- Tests for the language selection.

### Note
- The settings pages of the integration are rendered by Home Assistant and keep following your profile language.

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
