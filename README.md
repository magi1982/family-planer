![Family Planer](https://raw.githubusercontent.com/magi1982/family-planer/main/custom_components/family_planer/brand/logo@2x.png)

# Family Planer for Home Assistant

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-support-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/magibuilds)
[![Validate](https://github.com/magi1982/family-planer/actions/workflows/validate.yml/badge.svg)](https://github.com/magi1982/family-planer/actions/workflows/validate.yml)
[![Security](https://github.com/magi1982/family-planer/actions/workflows/security.yml/badge.svg)](https://github.com/magi1982/family-planer/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/magi1982/family-planer/blob/main/LICENSE)

<a href="https://buymeacoffee.com/magibuilds"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>

The family planner for your wall tablet: **chores** with points and real rewards, everyone's **events and school
timetable** at a glance, **holidays** that pause chores automatically, **spoken reminders** as soon as someone comes
home – and **shopping and to-do lists that sort themselves**. Everything is set up in the UI, **no YAML**.

🇬🇧 **English** · 🇩🇪 [Deutsch](README.de.md)

![Week view](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/week.png)

> The screenshots show the German interface. With Home Assistant set to English, everything appears in English.

---

## Contents

- [Overview](#overview)
- [Week plan module](#week-plan-module)
  - [Chores by weekday](#chores-by-weekday)
  - [Special chores by date](#special-chores-by-date)
  - [Day change at a time you choose](#day-change-at-a-time-you-choose)
  - [Events at the right person](#events-at-the-right-person)
  - [School & timetable](#school--timetable)
  - [Holidays pause chores](#holidays-pause-chores)
  - [Reliability, points, levels & awards](#reliability-points-levels--awards)
  - [Real rewards](#real-rewards)
  - [Announcements on motion](#announcements-on-motion)
  - [Pictures: avatars or your own photo](#pictures-avatars-or-your-own-photo)
- [Smart lists module](#smart-lists-module)
- [Designs](#designs)
- [Installation](#installation)
- [Setup](#setup)
- [Views & usage](#views--usage)
- [Entities](#entities)
- [Services (actions)](#services-actions)
- [Custom dashboards](#custom-dashboards)
- [Security & privacy](#security--privacy)
- [Migrating from the prototype](#migrating-from-the-prototype)
- [Removal](#removal)
- [Support](#support)

---

## Overview

| | |
|---|---|
| **Modules** | *Week plan* (chores, events, school, holidays, points, rewards, announcements) and *Smart lists* – each can be switched on or off, more modules to come |
| **Usage** | Own sidebar entry with navigation *Planner · Lists · Chore plan · Rewards*; optionally as cards in your own dashboards |
| **Setup** | Entirely via *Settings → Devices & services*, no YAML |
| **Languages** | English and German – automatically like Home Assistant, or fixed to German or English for the planner (e.g. Home Assistant in English, planner in German) |
| **Designs** | Home Assistant, Loxone, Apple Home, Google Home, Light, Nord |
| **Dependencies** | None. Calendars, lists, speakers and AI are optional – any matching entity works |
| **Requirement** | Home Assistant 2026.3 or newer |

---

## Week plan module

### Chores by weekday

![Chore plan](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/chore-plan.png)

- **Several persons** per chore, **own weekdays** per person (e.g. set the table: Lea Mon + Sat, Mia Tue + Sun).
- **Rhythm** per day: every week or every 2, 3, 4 … weeks with a selectable start week.
- **Time to complete**: "Wednesday only" or "Wednesday to Saturday". A chore only counts as "not done" once its deadline has passed.
- **Points per chore** can be set (otherwise the default applies).
- **Week overview**: how many chores each person has per weekday – keeps things fair.
- Changes apply **immediately**; the past stays as it was.

### Special chores by date

![Special chores](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/special-chores.png)

For everything that isn't weekly:

| Type | Example |
|---|---|
| **Interval** | every 6 months from 15 March – clean the air filter; every 2 weeks – change the bed linen |
| **Monthly** | on the 1st of every month; on the last day; on the 1st Saturday every 3 months – test the smoke detectors |
| **Yearly** | 15 April and 15 October – change tyres |
| **Once** | 21 November 2026 – tidy up the cellar |

- Several persons, optionally **taking turns** – if someone is on holiday, the next person takes over.
- Up to **60 days** to complete, own points.
- The list shows the **next three dates** with the responsible person.

### Day change at a time you choose

The default is midnight. If you set e.g. **03:00**, the previous day's chores can still be ticked off until 3 am;
after that, open ones count as "not done" and the new day starts. After a restart, the day change waits until the
calendars have loaded – so nobody on holiday is accidentally counted as "not done".

### Events at the right person

- One **calendar** per person – any `calendar.*` entity: Outlook/Microsoft 365 via *Remote Calendar* (ICS), Google, CalDAV, iCloud, Local Calendar …
- **Calendar colour = person colour**; every event carries a small calendar badge so you can see where it comes from.
- **Assignment by names and nicknames** (can be switched off): "Lea gymnastics" in mum's calendar appears at Lea, "Tommy in Rust" at Tom.
- Optional: show assigned events **also at the calendar owner**.
- Events on one line: title, time from–to, duration, calendar. Button to **sync immediately**.

### School & timetable

![Timetable](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/timetable.png)

Per child (or person, e.g. university/work):

- **School calendar** with the lessons (e.g. ICS from WebUntis or other school systems) **or fixed times** per weekday – up to **two blocks per day** (morning and afternoon, when the child comes home for lunch).
- Optional **travel time** to school/work in minutes.
- **"All" view**: one line per block, e.g. `🎒 leave 07:35 · home 12:00 · 07:50–11:45` and `🎒 leave 13:15 · home 15:25 · 13:30–15:10`. With a school calendar, blocks are split automatically when there is enough time between two lessons to go home.
- **"Timetable" view**: only persons with a timetable, every lesson with time and room (e.g. "Maths · Room 12").
- The **"Events"** view stays free of school; **"Chores"** shows chores only.
- No school is shown on holidays.

### Holidays pause chores

- An **all-day** (or at least 20-hour) event with a **holiday word** in a person's calendar pauses their chores – they count **neither as done nor as missed**; reliability and streak are not affected.
- Word endings count: "holiday" finds "ski holiday" and "summer holiday" – in German "Ferien" finds "Skiferien" but not "Ferienplanung".
- **Automatic detection**: on the first sync of a calendar, one year back and ahead is searched for how you name holidays (e.g. *Vacation, Holiday, OOO*). The words end up in the settings field (editable) and you get a notification.
- Applies either to the **calendar's person or the persons named in the title**, or to the **whole family**.
- If a holiday event is added during the day, open chores disappear immediately (calendars are read every 30 minutes).
- The planner shows 🌴 *Holiday*. School holidays in the school calendar deliberately do **not** pause chores (whoever is at home does chores).

### Reliability, points, levels & awards

![Rewards](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/rewards.png)

- **Reliability** in percent (30 days), coloured band per person; newcomers start at 100 % (*starter bonus*).
- **Fair points** (default): whoever finishes **all** of their chores of the day gets the same number of points (default 30) – whether they have 2 or 6 chores. Every finished chore immediately earns its share; 3 of 6 done = 50 % = 15 points. The points in the chore plan act as weights (a heavy chore with 20 counts twice as much as one with 10). Alternatively *per chore* mode: more chores, more points.
- **Bonuses**: additionally a **day bonus** for a fully completed day and a **streak bonus** for every 7-day streak. If a chore is reopened, its points are booked back.
- **10 levels** from *Starter* via *Pro* and *Hero* to *Grandmaster* – with progress bar. Redeemed points never lower the level.
- **Awards**: 👑 crown of the week, 🏆 trophy of the month, 🐝 busy bee, ⭐ perfect week, 🔥 streak, 🚀 starter bonus – tap to see why.
- **History** per person: chores, bonuses, rewards.

### Real rewards

- Parents create rewards: e.g. *ice cream = 30 points*, *30 min gaming = 50*, *5 CHF pocket money = 250*, *cinema = 400*.
- Per reward: icon, cost, **approval required** yes/no, **only for** certain persons, **at most x times per week**.
- Children redeem on the tablet; points are reserved until the parents decide.
- Parents approve as **admin** or on the tablet with a **parent PIN** (4–8 digits). Notification in Home Assistant and optionally on the phone.
- **Give points**: bonus (or deduction) with a reason, e.g. "Room tidied up perfectly +25".

### Announcements on motion

- Choose **motion sensors** (motion, presence, occupancy) and an **announcement** via
  - Alexa: notify entity *Announce* or *Speak* (*Alexa Devices* integration), or
  - a **TTS entity** (e.g. Google Translate, Piper) with speakers.
- **Time window** (e.g. 15:00–20:00) and **pause** between announcements.
- Announces who still has something open: *"Hello! Still open: Lea: set the table and empty the bin. Mia: feed the rats."*
- Optionally once a day: *"Well done! All chores for today are finished."*
- The announcement is built **fresh** on every motion – nothing outdated is stored.
- Test with the `family_planer.announce` service.

**Queue for one-off messages** – messages that only happen once wait for the next motion (within the configured quiet
hours, e.g. 07:00–21:00) and are then spoken once, together with the chore reminder:
- *"Mia, your reward '30 min gaming' has been approved. Have fun!"* – valid until the day change.
- *"Tom, 'Tyre change' is due within the next 21 days."* – for special chores; dropped as soon as the chore is done.
- Your own messages from automations with `family_planer.queue_announcement` (text, validity, optionally only certain motion sensors, key for replacing/deleting) and `family_planer.clear_announcement`.

```yaml
# Washing machine finished -> announce as soon as someone walks by (max. 3 hours)
action: family_planer.queue_announcement
data:
  message: The laundry is done, Nina's turn to hang it up.
  expires: 180
  key: laundry
  motion: [binary_sensor.hallway_motion, binary_sensor.kitchen_motion]
```

### Pictures: avatars or your own photo

![Picture selection](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/avatars.png)

- Many **colourful, illustrated avatars**: girls, boys, women, men, grandparents, dressed up (hero, astronaut, pirate, wizard, crown, cat …).
- **Upload your own photo**: cropped to a square in the browser and stored only in your Home Assistant.
- Colour per person and nicknames can be changed directly in the chore plan.

---

## Smart lists module

![Lists](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/lists.png)

- **Any number of lists**, each on any to-do entity: Alexa, AnyList, Bring!, Todoist, Google Tasks, HA shopping list … e.g. *Groceries*, *DIY store*, *To-dos*.
- **Self-maintaining categories per list**:
  - new items are sorted **immediately** – using a built-in knowledge list (English/German: groceries, drugstore, household, pet supplies, tools, screws, paint, garden, electrical, plumbing, office …),
  - **daily** at the configured time, everything still under *Other* is reorganised – optionally with an **AI task** (OpenAI, Google, Ollama …),
  - **never more than 5–20 categories** (selectable per list); rarely used ones are merged into *Other*.
- **Move an item once – the list remembers it**.
- **Rename, sort, add and delete** categories on the card.
- Add field, tick off, show/hide and delete completed items. Quantities ("2x milk", "flour 1 kg") are ignored when sorting.

---

## Designs

| Home Assistant | Loxone | Apple Home | Google Home | Light | Nord |
|---|---|---|---|---|---|
| uses your HA theme (colours, corner radius) | dark, green | black, orange | Material You | white, blue | Nord colours |

![Light design](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/theme-light.png)

Set under *Configure → Design, language & sidebar*; cards in your own dashboards can override it with `theme:`.

---

## Installation

**Home Assistant 2026.11 and newer (Marketplace):**
*Settings → Marketplace* → search for "Family Planer" → install.
As long as the integration is not yet in the catalogue: *Marketplace → Add from link* → `https://github.com/magi1982/family-planer`.

**Home Assistant 2026.3 – 2026.10 (HACS):**
HACS → ⋮ → *Custom repositories* → URL above, type *Integration* → install → restart Home Assistant.

Then: *Settings → Devices & services → Add integration → Family Planer*.

---

## Setup

When adding: **name**, **modules**, **family members** (comma separated) and optionally the **first list**.
Everything else under *Settings → Devices & services → Family Planer → Configure*. Every field there has a
description. The chores themselves are edited directly in the **Chore plan** view (also on the tablet).

### All settings

**Switch modules on/off**

| Setting | Default | Meaning |
|---|---|---|
| Active modules | both | switch *Week plan* and *Smart lists* on or off individually |

**Design, language & sidebar**

| Setting | Default | Meaning |
|---|---|---|
| Family Planer language | Automatic | *Automatic*: like your profile / Home Assistant · *Deutsch* or *English*: fixed for planner, tablet views, announcements, notifications and level names, independent of the Home Assistant language. The settings pages themselves follow your profile language. |
| Design | Loxone | Home Assistant, Loxone, Apple Home, Google Home, Light, Nord |
| Sidebar entry | on | opens the complete planner without a dashboard of your own |
| Sidebar title | name | text in the sidebar |
| Return to the start view after | 45 s | a tapped day / person jumps back to today afterwards |

**Week plan → Add / edit / remove person**

| Setting | Meaning |
|---|---|
| Name, colour | the colour is also used for the person's calendar |
| Calendar | any `calendar.*` entity |
| Nicknames in events | events with this name in the title appear at the person |

**Week plan → School & timetable** (per person)

| Setting | Meaning |
|---|---|
| School calendar / timetable | calendar with the lessons (takes priority over fixed times) |
| Mon–Sat block 1 / block 2 | fixed times, second block e.g. for the afternoon |
| Consider travel time, duration | shows "leave" and "home" per block |

**Week plan → Holidays & absence**

| Setting | Default | Meaning |
|---|---|---|
| Pause chores during holidays | on | holiday days count neither as done nor as missed |
| Words for holidays | detected automatically | e.g. *Vacation, Holiday, OOO*; word endings count ("ski holiday") |
| Holidays apply to | person / persons named | or the whole family |
| Whole day from | 20 h | minimum duration of a timed event to count as a holiday |
| Check calendars every | 30 min | how often new holidays are checked |
| Search again | – | search the calendars for holiday words again |

**Week plan → Points & rewards**

| Setting | Default | Meaning |
|---|---|---|
| Reward: title, icon, cost | – | e.g. *30 min gaming*, 50 points |
| Needs parent approval / Only for / Max per week | yes / everyone / unlimited | rules per reward |
| How points are given | Fair | *Fair*: a full day counts, not the number of chores · *Per chore*: each chore earns its points |
| Points for a full day (fair) | 30 | split across the day's chores, each finished chore earns its share immediately |
| Points per chore | 10 | *Per chore* mode: points per chore · *Fair* mode: default weight; can be changed per chore in the chore plan |
| Bonus for a fully completed day | 5 | |
| Bonus for every 7-day streak | 20 | |
| Parent PIN | – | 4–8 digits, for approvals on the tablet; locked after 5 wrong attempts |
| Also send requests to | – | additional notification (e.g. mobile app) |

**Week plan → Announcements on motion**

| Setting | Default | Meaning |
|---|---|---|
| Enable announcements | off | |
| Motion sensors | – | motion, presence, occupancy |
| Announce via (notify) / TTS + speakers | – | Alexa notify entity ("Announce"/"Speak") or TTS |
| From / Until | 15:00 / 20:00 | time window for chore reminders |
| At most every | 60 min | pause between reminders |
| Also announce when everything is done | on | once a day |
| Only for | everyone | persons included in the reminder |
| Chores per person in the announcement | 3 | further ones as "and 2 more" |
| Queue for one-off messages | on | messages wait for motion |
| Messages not before / not after | 07:00 / 21:00 | quiet hours of the queue |
| Announce approved rewards | on | |
| Reward message valid for | 0 = until day change | hours |
| Announce special chores | on | dropped once done |

**Week plan → Settings**

| Setting | Default | Meaning |
|---|---|---|
| Day change at | 00:00 | until then, the previous day's chores can be ticked off |
| Assign events by names | on | "Lea gymnastics" appears at Lea |
| Also show assigned events at the calendar owner | off | |
| Only admins may change the plan | off | children can still tick off chores and request rewards |
| Calculate reliability over | 30 days | |
| Lunch at home from | 0 = automatic | break in minutes from which the school day is split into blocks |

**Smart lists → Add / edit / remove list**

| Setting | Default | Meaning |
|---|---|---|
| List name, to-do list, icon | – | any `todo.*` entity |
| Maximum number of categories | 10 | 5–20 |
| Maintain categories automatically | on | sort immediately and optimise daily |

**Smart lists → Settings**

| Setting | Default | Meaning |
|---|---|---|
| Daily optimisation at | 03:00 | |
| AI task (optional) | – | also sorts unknown items |
| Replace unused category after | 30 days | makes room when the list is full |

---

## Views & usage

The navigation is in the same place at the top centre on every page.

**Planner** – the week in landscape format, optimised for tablets:
- Today large, the next two days and the weekend medium, past and later days narrow (past days only coloured with a count).
- Tap a day to show it large; arrows for other weeks, "Today" jumps back.
- Filters **All · Chores · Events · Timetable**.
- Tap chores directly to tick them off; deadlines ("until Sat", "due today") are visible.
- Tap a person: reliability, streak, awards and how to earn them.

**Lists** – tabs per list, add field, categories as tiles, *Categories* and *Optimise*.

**Chore plan** – persons with picture & colour, week overview, chores by weekday, **special chores** below.

**Rewards** – points, levels, pending approvals, rewards per person, history, *Give points*.

---

## Entities

Per person (device "Family member"):

| Entity | Content |
|---|---|
| `todo.<person>_chores` | today's chores – tick off via app, voice assistant or automation |
| `sensor.<person>_reliability` | reliability in %, attributes: open/done today, streak, week/month, awards |
| `sensor.<person>_points` | points balance, attributes: available, lifetime earned, level, level name, next level |

The entity IDs follow the Home Assistant language and the person's name (German: `todo.<person>_amtli`, `sensor.<person>_zuverlassigkeit`, `sensor.<person>_punkte`).

---

## Services (actions)

| Service | Purpose |
|---|---|
| `family_planer.rollover` | recalculate the day immediately |
| `family_planer.set_item` | tick off or reopen a chore by ID |
| `family_planer.add_points` | give or deduct points (person, points, reason) |
| `family_planer.announce` | trigger an announcement immediately (ignores time window/pause), returns the text |
| `family_planer.queue_announcement` | queue a one-off message for the next motion |
| `family_planer.clear_announcement` | delete a queued message by key |
| `family_planer.optimize_lists` | re-sort all smart lists now (optionally with AI) |
| `family_planer.import_legacy` | import data from the to-do list prototype |

Example automation: bonus points when the washing machine has been emptied.

```yaml
action: family_planer.add_points
data:
  person: Mia
  points: 15
  reason: Hung up the laundry
```

---

## Custom dashboards

Not necessary – but possible. The cards are loaded automatically.

```yaml
type: vertical-stack
cards:
  - type: custom:family-planer-nav-card
    paths: { planer: planer, listen: einkauf, aemtliplan: aemtliplan, belohnungen: belohnungen }
  - type: custom:family-planer-card
    view: week        # week | plan | lists | rewards
    theme: apple      # optional
    language: en      # optional, otherwise the integration setting or the HA language
```

For a full-screen tablet, a panel view per page (paths as above) and e.g. *Kiosk Mode* are recommended.

---

## Security & privacy

- Everything stays **local** in your Home Assistant; no cloud, no tracking. External services only if you choose them yourself (calendars, lists, AI).
- Input is validated on the server (colours, images, icons, texts, lengths), output is escaped in the browser.
- Parent PIN stored with PBKDF2, locked after 5 wrong attempts; optionally only admins may change the plan.
- Photos get long random file names; diagnostics downloads contain no names, photos or list contents.
- On every commit: **CodeQL**, **Bandit**, ESLint security rules, hassfest, HACS validation, tests.

Details: [SECURITY.md](https://github.com/magi1982/family-planer/blob/main/SECURITY.md)

---

## Migrating from the prototype

If you previously ran the family planner with to-do lists (`todo.amtli_plan`, `todo.amtli_heute`, `todo.amtli_verlauf`,
`todo.familienplaner_einstellungen`), take everything over with:

```yaml
action: family_planer.import_legacy
data:
  plan: todo.amtli_plan
  today: todo.amtli_heute
  history: todo.amtli_verlauf
  settings: todo.familienplaner_einstellungen
```

---

## Removal

1. *Settings → Devices & services → Family Planer → Delete*.
2. Uninstall in the Marketplace or HACS and restart Home Assistant.
3. Uploaded photos are stored in `config/family_planer/` and can be deleted.

---

## Support

If Family Planer makes your family life a little easier, I'd be happy about a
[☕ coffee](https://buymeacoffee.com/magibuilds). Thank you!

<a href="https://buymeacoffee.com/magibuilds"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>

Bugs and feature requests: [Issues](https://github.com/magi1982/family-planer/issues) · License: MIT
