![Family Planer](https://raw.githubusercontent.com/magi1982/family-planer/main/custom_components/family_planer/brand/logo@2x.png)

# Family Planer for Home Assistant

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-support-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/magibuilds)
[![Validate](https://github.com/magi1982/family-planer/actions/workflows/validate.yml/badge.svg)](https://github.com/magi1982/family-planer/actions/workflows/validate.yml)
[![Security](https://github.com/magi1982/family-planer/actions/workflows/security.yml/badge.svg)](https://github.com/magi1982/family-planer/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/magi1982/family-planer/blob/main/LICENSE)

<a href="https://buymeacoffee.com/magibuilds"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>

The family planner for your wall tablet: **chores** with points and real rewards, everyone's **events and school
timetable** at a glance, **holidays** that pause chores automatically, **spoken reminders** as soon as someone comes
home – and **shopping and to-do lists that sort themselves**. On top, a **living header** shows your house in the real
weather and time of day, through the seasons, Swiss customs and special days. Everything is set up in the UI, **no YAML**.

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
  - [Statistics](#statistics)
  - [Real rewards](#real-rewards)
  - [Parent PIN](#parent-pin)
  - [To-dos without a date](#to-dos-without-a-date)
  - [Announcements on motion](#announcements-on-motion)
  - [Pictures: avatars or your own photo](#pictures-avatars-or-your-own-photo)
- [Smart lists module](#smart-lists-module)
- [Designs](#designs)
- [Seasons & weather](#seasons--weather)
- [Special chores for volunteers](#special-chores-for-volunteers)
- [Pets (Tierchen)](#pets-tierchen)
- [Navigation](#navigation)
- [Settings in the planner](#settings-in-the-planner)
- [Fullscreen on double tap](#fullscreen-on-double-tap)
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
| **Usage** | Own sidebar entry with navigation *Planner · Lists · Chore plan · Rewards · Settings*; optionally as cards in your own dashboards; fullscreen on double tap |
| **Setup** | Directly in the planner (*Settings*, protected by the parent PIN) or via *Settings → Devices & services* – no YAML |
| **Languages** | English and German – automatically like Home Assistant, or fixed to German or English for the planner (e.g. Home Assistant in English, planner in German) |
| **Designs** | Standard (Home Assistant), Light, Dark, Rainbow, Space – each as Standard, Transparent or Glass |
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
- **Only when it matters**: in the "All" view a school block appears **1 hour before leaving** and disappears **1 hour after getting home** – for each block separately. The minutes are adjustable (*Show school only around school time*, 0 = always show).
- **"Timetable" view**: only persons with a timetable, every lesson with time and room (e.g. "Maths · Room 12").
- The **"Events"** view stays free of school; **"Chores"** shows chores only.
- No school is shown on holidays.

### Holidays pause chores

**Away badge**: with the real times from the calendar, a small badge below the name shows *✈️ away tomorrow from 15:00*, on the day *✈️ away from 15:00*, then *✈️ away until Tue 23:30* (🌴 for holidays), so everybody sees who is away. The holiday check button (beach icon) is always there: it shows who is away and every detected entry, and answers can be changed later. Right below it, the **refresh button** pulls all calendars and lists at once (no PIN, at most every 20 s). The design is chosen under *Settings → General*.

- An **all-day** (or at least 20-hour) event with a **holiday word** in a person's calendar pauses their chores – they count **neither as done nor as missed**; reliability and streak are not affected.
- Word endings count: "holiday" finds "ski holiday" and "summer holiday" – in German "Ferien" finds "Skiferien" but not "Ferienplanung".
- **Automatic detection**: on the first sync of a calendar, one year back and ahead is searched for how you name holidays (e.g. *Vacation, Holiday, OOO*). The words end up in the settings field (editable) and you get a notification.
- Applies either to the **calendar's person or the persons named in the title**, or to the **whole family**.
- If a holiday event is added during the day, open chores disappear immediately (calendars are read every 30 minutes).
- **Holiday check**: from **two weeks before** a holiday, the 🌴 button in the navigation asks: **Away – pause chores** or **Here – chores go on**, and for whom: the **whole family** or single persons. Past holidays are ignored.
- **Long events without a holiday word** (longer than the set number of hours, e.g. a camp or a trip) appear below as **Optional**; without a decision they pause nothing.
- Once decided, an entry disappears from the popup. Under *Settings → Holidays* it stays for **4 weeks** and can still be changed or reset.
- The planner shows 🌴 *Holiday*. School holidays in the school calendar deliberately do **not** pause chores (whoever is at home does chores).

### Reliability, points, levels & awards

> Since 0.17.0 the reward currency is called **coins** everywhere (planner, rewards, statistics, settings, announcements). *Points* are only the [pet points](#pets-tierchen).

![Rewards](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/rewards.png)

- **Reliability** in percent (30 days), coloured band per person. It only counts **assigned chores** – special chores and to-dos never lower it.
- **Points as a coin** (setting, on by default): points show a small coin – silver ring, gold core, one notch per family member and a letter of your choice (or a little star). Every few seconds a tiny star flashes on it like sun on metal; when a chore is ticked off the coin flies to the person's picture. Off = just the number.
- **Fair points** (default): whoever finishes **all** of their chores of the day gets the same number of points (default 30) – whether they have 2 or 6 chores. Every finished chore immediately earns its share; 3 of 6 done = 50 % = 15 points. The points in the chore plan act as weights (a heavy chore with 20 counts twice as much as one with 10). Alternatively *per chore* mode: more chores, more points.
- **Bonuses**: additionally a **day bonus** for a fully completed day and a **streak bonus** for every 7-day streak. If a chore is reopened, its points are booked back.
- **Levels per school year** (season, starts on 1 August – adjustable): from *Starter* via *Hero* and *Legend* up to wonderfully silly names beyond level 21. The levels come in **tiers – bronze (1–5), silver (6–10), gold (11–15), diamond (16–20) and ruby (21+)**; the level badge on the picture shows the tier colour. Redeemed points never lower the level.
- **Level-up celebration**: a banner with the new level name, confetti in the tier colour, optional **bonus points** (one full day per level, three days at a new tier) – and every level **unlocks avatar extras** (cap, golden glasses, hamster, baby dragon, phoenix, crowns, wings, galaxy …) that only this person can wear. They stay after the season reset.
- **Easter egg:** tap the level badge on the picture – every tier has its own effect (sparks, golden rain, star explosion with flash, ruby eruption that shakes the screen). Right after a level-up the badge glows for a few taps.

![Level-up](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/levels.png)

- **Awards and trophies** – each one has a period, so nobody collects three trophies a day:

  | Award | Won | Frame / points (default) |
  |---|---|---|
  | 🏆 Trophy of the month | best rate of the previous month, on the 1st | **platinum** frame · large |
  | 👑 Crown of the week | best rate of the previous week, on Monday | **gold** frame · medium |
  | ⭐ Perfect week | every chore of a whole week done | **silver** frame · medium |
  | 🐝 Busy bee | most done in a week | **bronze** frame · small |
  | 🛡️ Weekend hero | Saturday and Sunday everything done | small |
  | 📈 Climber | at least 15 points better than the week before | medium |
  | ⏰ On-time pro | at least 80 % of the week's chores done in time – before their last day or on it by 20:00 (adjustable), so evening chores count too | small |
  | 🙋 Volunteer champion | took on and did the most volunteer chores of the week | medium |
  | 🛟 Rescuer | took on the volunteer chore that had been waiting longest (at least a day) | small |
  | 💎 Diamond streak | 30 days in a row everything done | giant |
  | 🏅 Milestones | 25, 100 and 250 days with every own chore done – fair however many chores somebody has | medium |
  | 👪 Family teamwork | the whole family finished everything on one day | small |
  | 🔥 Streak | days in a row (changes daily, no points) | – |

- The **best award sets a metallic frame** around the picture (platinum, gold, silver, bronze) with a gentle shine; the crown sits straight above the head.
- **Points per award**: once per win, and again when it is won anew. Sizes: small = ⅓, medium = ⅔, large = 1×, giant = 2× the points for a full day. Every award can be switched off or resized under *Settings → Points*.
- **Confetti for everyone** (adults too): small confetti with the name when somebody has done all of their chores for the day; medium or large confetti in the trophy colour for trophies. At most one big confetti per person and day; daily changing awards (streak, busy bee) get none. Can be switched off; respects *reduce motion*.
- **Fair for percentages and awards, too**: in *Fair* mode, reliability, crown of the week, trophy of the month and busy bee count **every day the same** – no matter if 2 or 6 chores. The rate is the average of the daily rates; the busy bee has the most complete chore days. In *Per chore* mode single chores count as before.
- **History** per person: chores, bonuses, rewards.

### Statistics

A fourth button, **Statistics**, shows what the family has done – simple enough for children.

- **Family first:** chores done, volunteer chores, to-dos, days on which *everybody did everything* (with record), **trophies & awards** of the period and all time per person, **"Who did what?"** (chores / volunteer chores / to-dos per person) and **"Which chores – who how often?"** as a table (bigger circle = more often). Below, one card per person with reliability as **10 dots** (*Lea does 9 of 10 chores*), the last 7 days as coloured dots and the current streak.
- **Buttons at the top** for *Family* and every person; a tap on a card opens the own page.
- **Own page:** the 10 dots with a short praise and the trend, tiles (chores, volunteered, to-dos, done in time, days in a row with record, points), the **last 7 days as building blocks** (1 block = 1 chore – the blocks get smaller on busy days, the number below), **12 weeks as dots** (green = all done, yellow-green = 1 forgotten, orange = 2, red = 3 or more, grey = no chores), **What I did** (per type and chore), **Where my points come from** (a points jar with a layer per source: chores, volunteer chores, to-dos, day bonus, streak bonus, awards, level bonus, extra from the parents – plus *redeemed for rewards* and the latest points), **My awards**, **Still practising** (the chores forgotten most often, kindly worded) and **When I help** (morning / afternoon / evening).
- **Period:** week, month or 3 months (a tap switches). The figures come from the data the planner keeps anyway (about 120 days); which chore was done and when is recorded from version 0.15.0 on.
- Settings under *Settings → Points*: default period, *compare people* (family tables on/off) and *Still practising* on/off. The button can be hidden like the others.

### Real rewards

- Parents create rewards **directly in the *Rewards* view** with **"+ Reward"** on a person's tile, and change or delete them by tapping the pencil next to a reward (always with the parent PIN): e.g. *ice cream = 30 points*, *30 min gaming = 50*, *5 CHF pocket money = 250*, *cinema = 400*. With nobody chosen in the dialog the reward is for everyone.
- Per reward: icon, **category**, **approval required** yes/no, **only for** certain persons, **at most x times per week**.
- **Categories instead of doing the maths**:

  | Category | Points | Example with defaults | Value (default 20) |
  |---|---|---|---|
  | Small | ¼ of large | 283 | approx. 5 |
  | Medium | ½ of large | 565 | approx. 10 |
  | **Large** | what you earn in **one month** with **every chore done every day** – incl. day and streak bonus | 30 × (30 + 5) + 4 × 20 = **1130** | 20 |
  | Mega | 2 × large | 2260 | approx. 40 |
  | Giant | 5 × large | 5650 | approx. 100 |

  When the point settings change, the costs follow automatically. *Own points* is still available for special cases. The **value of a large reward** (e.g. 20 CHF) is adjustable and only meant as a guide.
- **View**: at the top **still to win** – every trophy nobody holds right now, with how to win it, when it is awarded, its points and who is ahead.
- Below, a **tile per person** like in the planner: picture with frame, medals, points and level, **what is running** (requests waiting for approval, rewards made for this person or the next goal with progress and *"in about 6 days"*) and a **"+ Reward"** button that creates a reward for exactly this person (parent PIN).
- Tapping a person shows their awards, their rewards and history; with nobody selected you see all rewards with the persons they are for.
- **Forecast** in the reward dialog: how many days the family average needs for the chosen cost, and how long each person needs at their current pace.
- Children redeem on the tablet; points are reserved until the parents decide.
- Parents approve as **admin** or on the tablet with a **parent PIN** (4–8 digits). Notification in Home Assistant and optionally on the phone.
- **Extra points** are given with a to-do of the right size (Small · Medium · Large); the action `family_planer.add_points` stays available for automations.

### Parent PIN

- **Start PIN `123456`** – it must be **changed on first use** (current PIN, new PIN, repeat). Until then, rewards and settings cannot be changed, and Home Assistant shows a repair notice.
- **What needs the PIN**: every change – chores and the chore plan, special chores, to-dos (add/delete), persons (name, colour, calendar, role, order), lists, rewards, the design, holiday decisions and the settings page. Approving rewards and giving points as well (admins may do these two without it).
- **What does not**: ticking off chores and to-dos, redeeming rewards, and **changing a picture** (figure, hair, skin tone, extras, costume) – anyone may change any picture.
- 4–8 digits, never `123456` again; locked for 5 minutes after 5 wrong attempts; stored only as a PBKDF2 hash.
- After entering it once, the planner stays unlocked for **10 minutes** (refreshed while you work, *Lock* ends it immediately). The PIN itself is never stored in the browser.
- Change it any time: *Settings → Parent PIN → Change parent PIN*. Forgotten? *Settings → Devices & services → Family Planer → Configure → Points & rewards → Reset parent PIN to 123456* (admins only).

### To-dos without a date

At most the **4 oldest** open to-dos per person are shown in the planner (adjustable), *+2 more* expands the rest; below each to-do it says how long it has been open. **To-dos from a shared list** (e.g. the Alexa to-do list): choose the list under *Settings → To-dos → To-do lists with names* (or switch on *Names → to-do of the person* for a smart list). An item with a name or nickname (*"Lea tidy room large"*) becomes a to-do of that person; a trailing *klein / mittel / gross* (small / medium / large) sets the size and the points, several names at the start give one to-do each (*"Lea and Mia set the table"*); a name further on stays part of the title (*"Lea calendar for Mia"* → only Lea); without a name at the start the first name counts; and ticking off works both ways.

![To-dos](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/todos.png)

- Simple to-dos for a person **without due date or repetition** – they stay until they are done (e.g. *tidy up the room*, *return library books*).
- In the **planner** via the **"To-dos"** button at the top right (with the number of open to-dos) in a window of their own; in the **chore plan** at the bottom. Grouped by person; add one with person + text.
- **Ticking off asks for confirmation** ("Mark as done?") – unlike chores, which are ticked with one tap. Can be switched off.
- **Size instead of points**: *No points*, **Small**, **Medium** or **Large**. Large = points for a full day (setting, default 30), medium = ⅔, small = ⅓ – always rounded up to whole points (30 → 10 / 20 / 30). The default size is adjustable; another size when adding needs the parent PIN. To-dos do not count towards the fair day value.
- Finished to-dos stay visible for a configurable number of days, then disappear.

### Announcements on motion

**Without a motion sensor** the planner announces at fixed times (default 12:30 and 18:30). In addition, optional: a summary at 20:00 of what is still open (at most the set number of chores per person), now and then some praise (at most once a day), and on birthdays five funny announcements for the birthday child, spread over the day. Nothing is announced while *away* is confirmed in the holiday check.

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

- **Avatar builder** under *Settings* – **without the PIN**, anyone may change any picture:
  1. **Skin tone** (9) and **hair colour** (12, incl. pink, blue, purple, green)
  2. **Person**: girl, boy, woman, man, grandma, grandpa
  3. **Hair**, chosen separately: 18 styles – short, side parting, spiky, messy, undercut, mohawk, short curls, bald, long, long with fringe, pigtails, ponytail, bun, space buns, bob, long curls, afro, dreadlocks
  4. Tabs with lots of extras: **Head** (cap, bobble hat, crown, flower crown, cat / bunny / bear ears, unicorn, party hat, headphones, headband, bow), **Face** (glasses, sunglasses, freckles, glitter, plaster, tiger or butterfly face paint, beard, moustache), **Clothes** (T-shirt colour, motif, scarf, bow tie, necklace), **Buddy** (cat, dog, bunny, parrot, lizard, monkey, mini dragon, penguin, fox, robot, owl, balloon, football, guitar, magic wand), **Background** (8 patterns over the person's colour, which always stays)
  5. **Costumes** as a layer over the person: astronaut, Mars suit, our own heroes *Star Power*, *Sparkwing*, *Moon Fairy*, *Turbo* and *Shooting Star*, ninja, knight, pirate, wizard, princess, prince, dino, firefighter – background and buddy stay
- 🎲 **Random** for a surprise. Parts that would clash (e.g. a cap under a helmet) are left out automatically; an automated test draws over 30 000 combinations.
- Plus many ready-made avatars: girls, boys, women, men, grandparents, dressed up.
- **Upload your own photo**: cropped to a square in the browser and stored only in your Home Assistant.
- Colour, nicknames and everything else of a person: *Settings → People* (parent PIN).

---

## Smart lists module

![Lists](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/lists.png)

- **Any number of lists**, each on any to-do entity: Alexa, AnyList, Bring!, Todoist, Google Tasks, HA shopping list … e.g. *Groceries*, *DIY store*, *To-dos*.
- **Self-maintaining categories per list**:
  - new items are sorted **immediately** – using a built-in knowledge list (English/German: groceries, drugstore, household, pet supplies, tools, screws, paint, garden, electrical, plumbing, office …),
  - **daily** at the configured time, everything still under *Other* is reorganised – optionally with an **AI task** (OpenAI, Google, Ollama …),
  - **never more than 5–20 categories** (selectable per list); rarely used ones are merged into *Other*.
- **Move an item once – the list remembers it**.
- **No list yet?** The page shows a short explanation and a **Set up a list** button that opens *Settings → Lists* directly.
- **Rename, sort, add and delete** categories on the card.
- Add field, tick off, show/hide and delete completed items. Quantities ("2x milk", "flour 1 kg") are ignored when sorting.

---

## Designs

| Standard | Light | Dark | Rainbow | Space |
|---|---|---|---|---|
| follows your Home Assistant theme | white, blue | dark, green | dark with a rainbow band and colourful glow | deep blue with stars and nebula |

Each design comes in three **styles**: *Standard*, *Transparent* and *Glass* (frosted surfaces over the design's background). Older designs (Loxone, Apple, Google, Nord) are switched to *Dark* automatically.

**Design**: choose the design and the surface style under *Settings → General*; it applies to every device at once (parent PIN).

- Still available under *Settings → General* and *Configure → Design, language & sidebar*. Cards in your own dashboards can override it with `theme:` / `style:`. `theme_picker: false` on the navigation card hides the picker.
- Your own dashboard can use the design's background with `background: var(--fp-page)` on the view.

## Seasons & weather

**Weather scene.** Choose a weather entity under *Settings → Seasons & weather* and the navigation turns into a small animated landscape: a house, trees, clouds, sun or moon behind the clock and the buttons. Day and night follow the real sun (`sun.sun`; without it the clock decides), with a glowing sky around sunset and sunrise and a darker ground at night. *Night mode* (on by default) dims the dashboard slightly after sunset and makes the clock bigger; stars flare up now and then and a shooting star crosses the sky. Ten weather states (sun, partly cloudy with a rainbow, clouds, rain, pouring rain, thunderstorm, snow, fog, wind, clear night) and the season of the year change the picture – blossoms in spring, green in summer, orange trees and falling leaves in autumn, bare trees in winter. Wind moves trees, clouds and chimney smoke; above the *storm threshold* (default 50 km/h) they really bend. The current weather is shown small at the top right. *House in the scene*: the simple standard house or a tall gabled house with pergola, attached garage with a frosted-glass railing and a pool in the garden (covered in winter, icicles below −5°), plus a garden with a big apple tree, a small red maple and a flower bed that blooms white and violet in summer. The house (or the beach / carnival scene) always sits in the middle of the header. *Effect strength* (calm / normal / lots); *Reduce motion* on the device turns all particles off.

**Frost mode** (on by default, *Settings → Seasons & weather*): when the temperature of the selected weather entity drops to *Frozen from* (default −1 °C, adjustable −25 … 0 °C), the whole scene freezes – hoarfrost on the ground, the house and the trees, frozen puddles and glittering ice crystals in the air. No extra sensor is needed.

**Special days.** On some days the header gets its own scene: Dinosaur Day (20 Feb), April Fools' Day, the first mobile phone call (3 Apr), Titanic (15 Apr), Moon landing (20 Jul) and a volcano (27 Aug); Sputnik crosses the night sky from 4 to 11 October and Concorde flies by on 26 November. Holidays, customs and birthdays always come first. A chip next to the date with an ⓘ explains the day. **British Days**: ten random ordinary days a year show Buckingham Palace with the King's Guard; with *British Day for* you can dedicate them to someone. On 15 April you can tap the Titanic – it sinks and comes back. Both can be switched off under *Settings → Seasons & weather*. Above 30 °C there is a pool party and the sprinkler runs.

**Tap animations** (setting, on by default). A tap on the free picture at the top plays an animation that fits the day – there are more than 60. A glowing neon sign *TAP!* hanging down from the top edge above the house shows when one is ready; its colour matches the season. The setting **Tap sign** decides when it shows: *Off*, *After activity* (default – every 10 seconds for a while after someone taps the planner or a motion sensor of the announcements reports movement, see **After activity, show for**, 1–10 minutes) or *Always* (every 30 seconds). It never shows while an animation plays. Which one plays is chosen in this order:

| Step | When | Examples |
|---|---|---|
| 1 | Special day with its own scene | Dinosaur Day: pterosaurs and a raptor · first mobile call · volcano · Moon landing: the lunar module lifts off · Titanic |
| 2 | Occasion | birthday cake · Valentine's / anniversaries · carnival · Easter · first day of school · Swiss National Day · St. Nicholas · Advent lights · New Year's Eve fireworks · Sputnik week |
| 3 | Strong weather (checked at every tap) | rain · rainbow after rain · wind · snow · frost · above 30 °C |
| 4 | Season and time of day | a different one by day, in the evening and at night, e.g. butterflies in spring, pool fun in summer, a dragon in autumn, northern lights in winter |
| 5 | Surprise day | black hole, Matrix mode, pixel explosion, synthwave 1986 … |

Within a day the same animation plays again for the same time of day; the next day brings another one. *Surprises* (setting): off, rare (about one day a week, default) or often (about three days a week); occasions and weather always come first. Buttons in the header keep working as usual, and a double tap on the header never toggles fullscreen.

**Summer.** From the first day of the summer holidays (found in the calendars) beach and house with pool take turns day by day; outside the holidays summer is spent at home.

**Seasons as a design layer.** Over every design and style the planner lays the current season: own header scene, page background, colour band, a little burst when ticking off and the avatar extras.

| Kind | Events | Shown from |
|---|---|---|
| Long seasons | Advent & Christmas (from the 1st Advent, candles light up Sunday by Sunday; St. Nicholas and Christmas Eve as sub-seasons; it always snows), winter, spring, summer, autumn | start day |
| Public holidays | New Year, St. Berchtold's Day, Good Friday, Easter Monday, Labour Day, Ascension, Whit Monday, Swiss National Day (bonfire from 9 pm, fireworks from 10 pm), Christmas Day, Boxing Day | 3 days before |
| Customs | Epiphany, Valentine's Day, carnival, first days of the seasons, Easter, Mother's Day, Whitsun, Father's Day, first day of school, Federal Day of Thanksgiving, harvest festival, Advent Sundays, St. Nicholas, Christmas Eve, New Year's Eve | 3 days before |
| School holidays | from calendar titles: Sportferien, Frühlingsferien, Pfingstferien, Sommerferien (a beach), Herbstferien, Weihnachtsferien | 3 days before |
| Personal | birthdays, wedding anniversary, couple anniversary | the day itself |

**Info texts:** customs and public holidays (St. Nicholas, Christmas, New Year's Eve, Epiphany, carnival, Easter, Ascension, Whitsun, Swiss National Day, Federal Day of Thanksgiving, the first days of the seasons …) get an ⓘ chip next to the date with a short text for children explaining what is celebrated.

Every event can be switched off or get its own lead time; the *priority* decides when several coincide (default: birthday > anniversary > public holiday > custom > school holidays > long season). Pausing chores during your own family holidays stays in the [holiday check](#holidays-pause-chores).

**Birthdays.** Enter the birth date per person (*Settings → People*, the year is optional). On the day the header gets bunting, balloons and a *Happy Birthday* banner, and the birthday child's row celebrates all day with one of five animations coming from behind the person: confetti cannon, balloon ride, soap bubbles, rainbow disco or star shower – a different one for everybody and every year, or a fixed one per person. **All points of the birthday child count double.**

**Anniversaries.** Wedding and couple anniversary under *Settings → Seasons & weather* – floating hearts and *14 years married*.

**Seasonal avatar extras.** While a season, holiday or birthday is on, the avatar builder has a *Season* register (no PIN) with only that season's choices: up to three extras (87 in total, many animated – Santa hat, reindeer with blinking nose, sparkler, Swiss flag, straw hat, bunny ears …) and one of 57 effects as an aura. Without a choice everybody automatically gets a different extra. Extras are a separate layer: after the season the normal picture is back by itself.

**Suggestions.** From noon (adjustable) one suggestion per day appears below the weather, a different one every day: pool weather (needs a pool temperature sensor, water from 24°, sunny, no rain until the evening), evening swim, pool party, hot tub from autumn to spring on dry evenings when no adult has an evening appointment (also *under the stars*, *in the snow*, *for parents from 9 pm*; needs a hot-tub temperature sensor), home cinema, games night, baking (Christmas only), crafts, puzzle and photo album (at most every 14 days), Lego challenge, barbecue, bike ride, family walk, dinner on the terrace, sledging, hot chocolate, Advent windows, Easter egg hunt, lake swim, ice cream, a teamwork reward when everybody is done, or simply a quiet evening.

## Special chores for volunteers

Fun extra jobs that only give **bonus points** – not done or expired never lowers the reliability (%). Under *Settings → Special chores* (parent PIN) there is a catalogue of 58 templates with sensible timing (Christmas baubles for every child from 10 to 24 December, a birthday card 3 days before, raking leaves from Tuesday for 5 days including Saturday, dyeing eggs before Easter, hanging the Swiss flag …); everyday ones start switched off. Create your own with title, symbol, points (small / medium / large / own), assignment, when (once, daily, weekdays, every X days, yearly, at an event, a person's birthday, the wedding anniversary, Advent, weather, temperature), lead time, time to do it, time of day, visibility (always / in a season / with some weather) and *secret*.

- **Volunteer**: the job waits in the *Volunteer* tile next to the people (only visible while something is open). Whoever in the family comes first (grown-ups too) taps *I'll take it!*, picks themselves on the big avatar tile and the job moves into their row. Recurring ones come back every time.
- **Order in the Volunteer tile:** rare ones first (only while someone is away, birthday, wedding day), then your own special chores, then the catalogue; within that the one that ends first. Catalogue jobs nobody took make room the next day, so the tile changes daily, and a more important job may push out a catalogue job nobody has taken yet.
- **Every child**, **Surprise** (random, default at most 2 per child and week) or **Fixed**.
- **Only while away**: limit a chore to days when a chosen grown-up (or any grown-up) is away – same detection as pausing chores (calendar or holiday check). *Needs a grown-up* hides a chore while every grown-up is away.
- **Secret**: the planner shows *Secret job*; a tap on the eye button on the right reveals it for 5 seconds (yellow while nobody has taken the job, grey after). For birthdays the birthday child never gets it.

## Pets (Tierchen)

Every family member can raise little pets that grow with the chores – like a small collecting game on the tablet. Grown-ups start with pets switched off and can switch them on themselves.

- **Coins and points:** every chore gives **coins** (for real rewards, see [Real rewards](#real-rewards)) and, with pets on, **the same number of pet points**. Points are only for the pets; spending coins never takes points away. Switched off, a person still earns coins but no points – and nothing that was there is lost.
- **On the person card:** the current pet sits at the bottom right of the picture (an egg wobbles); a tap opens the pets page for this person. The plain **wheel** at the top right is colourful when it is free and grey once spun today.
- **When a chore is ticked off**, what it brought rises slowly above it: *+10 coins*, *+10 points* and things found (food, sometimes a pill). Ticking off again brings nothing new.
- **Growth:** *Use points* (up to 50 per tap) fills the growth bar. **Hatching and evolving are always the child's own action**: when the bar is full, *Hatch* or *Evolve* turns yellow. Steps: egg → baby (30) → young (150) → grown (450) → final form (800) → glow (1150) → legend (1750). Reaching *grown* brings a **new egg**, with a kind the child does not have yet (at most 3 of a kind).
- **Evolving** opens the evolution tree: up to three ways (colour, look, theme line such as fire, water, night). The tree shows the way so far; what comes next stays secret.
- **Care:** hunger, thirst, energy and mood go down slowly and never below 10 % – pets never suffer, and during holidays everything pauses. Food, drinks, treats and pills are only used when the pet needs them; toys stay.
- **Pills:** growth pills S/M/L add growth, the **evolution pill** takes a pet a whole step further at once (also an egg).
- **Wheel of fortune:** once a day per person, free again at midnight. Every spin brings food and water plus a prize: growth pill, pet extra, food pack, +20 points, evolution pill, spin again or the star field (fable egg, artefact or jackpot). The server chooses the field; the wheel only shows it. A fable egg comes at the latest after 60 spins.
- **Pets page** (🐾 in the navigation): *Garden* (the same house, pool and season as the header, with a big front garden where the pets run, climb, hide and swim), *Current pet* (develop and care in one screen), *Inventory*, *Collection* (cards with line, special ability, food, favourite places and days together; unknown kinds as silhouettes) and *Statistics*.
- **Names:** every pet can get its own name (up to 16 characters); the name shows big, the kind small beside it.
- **In the header** up to 8 pets of the family walk around the house and pool; when a header story plays, they step back behind it.
- The graphics come in their own file (`family-planer-pets.js`) that is only loaded when pets are on, so the planner stays fast.

## Navigation

- **Left:** the time with weekday and date beside it, the page buttons below. **Right:** weather and the **holiday check** 🌴 stacked, settings beside them – both sides are built the same way.
- **Refresh** sits in *Settings* (top bar): it reloads all calendars and lists at once.
- **Holiday check** 🌴 (each entry can be shown as *Holiday* or *Away*; a day off shows *Away* unless it is a real holiday): a badge shows how many holidays and long events of the next two weeks are undecided (details under *Holidays pause chores*). Parent PIN.
- **Statistics** is the new fourth button (after *Rewards*); see [Statistics](#statistics).
- **Order and visible buttons** under *Settings → General*. If a button points to a view your dashboard does not have, it is shown dashed with a hint instead of opening an empty page.
- **Today**: a red now line separates past and coming events, the next event shows *in 25 min*; ticking off a chore plays a short check animation.
- **Today view**: *Today | Week* at the top left. *Today* shows only the current day with the people side by side as columns – school, events with the now line, chores (open first), to-dos and special chores; ‹ › for the other days, all filters work. *Settings → General → Default view* decides which one is shown after the idle time and when coming back from another page (default *Today*).
- **Filters** *All · Chores · To-dos & special · Events · Timetable*. A day without anything shows *Nothing planned – free!* with the next event (*Tomorrow: …*). Switching between *Today* and *Week* fades in softly.
- **Tablet in portrait**: the suggestion below the weather shrinks to its symbol; a tap shows the text. In landscape it stays fully visible.
- **Phone**: the planner shows only today, with ‹ › arrows and swipe for the other days; it returns to today after the idle time. The person cards are compact: picture left, name and badges beside it.

## Settings in the planner

![Settings](https://raw.githubusercontent.com/magi1982/family-planer/main/docs/settings.png)

Everything that the Home Assistant dialogs offer, in one clear page – also on the tablet: **Settings** in the navigation.
- Protected by the **parent PIN** (always, also for admins).
- **Without the PIN** the page shows only the **pictures** (avatar builder and photo upload). **"Parent PIN"** at the top right opens every tab: *Pictures*, *General* (modules, language, design and style, navigation order, fullscreen, sidebar, day change, …), *People* (order, role child/adult, colour, calendar, nicknames, school calendar, blocks per weekday, travel time), ***Chores*** (the complete chore plan – **"+ Special chore"** and **"+ To-do"** open a form in a popup; the separate chore-plan page is hidden by default), *Points* (incl. every award with on/off and size, on-time time, confetti, coin, statistics), *To-dos*, *Lists*, *Holidays* (holiday check), *Announcements*, ***Status*** (last successful sync and last error for every calendar, list and the day change; sources silent for 30 days disappear).
- Every field with a short description; invalid input is refused with a clear message (e.g. announcements without speaker).
- Changes that need new timers (day change, modules, lists, announcements) reload the integration automatically; the planner reconnects by itself.
- The dialogs under *Settings → Devices & services → Family Planer → Configure* remain available.

## Fullscreen on double tap

- **Double-tap an empty spot** of the planner (margins, gaps; not the picture in the header – a tap there plays an animation) → Home Assistant's header and sidebar disappear, and the browser switches to real fullscreen where allowed. Double-tap again to leave.
- Taps on chores, buttons and input fields never trigger it, so nothing is ticked off by accident.
- Optional: **fullscreen automatically when opened** – ideal for a wall tablet. Both under *Settings → General*.

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
Everything else directly in the planner under **Settings** (parent PIN) or under *Settings → Devices & services → Family Planer → Configure*. Every field has a
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
| Design | Standard | Standard (Home Assistant), Light, Dark, Rainbow, Space |
| Style | Standard | Standard, Transparent, Glass |
| Sidebar entry | on | opens the complete planner without a dashboard of your own |
| Sidebar title | name | text in the sidebar |
| Return to the start view after | 45 s | a tapped day / person jumps back to today afterwards |
| Fullscreen on double tap | on | double-tap an empty spot hides header and sidebar (real fullscreen where allowed) |
| Fullscreen automatically when opened | off | ideal for a wall tablet |

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

**Week plan → Coins & rewards**

| Setting | Default | Meaning |
|---|---|---|
| Reward: title, icon, category | – | *Small · Medium · Large · Mega · Giant* or own points |
| Needs parent approval / Only for / Max per week | yes / everyone / unlimited | rules per reward |
| How points are given | Fair | *Fair*: a full day counts, not the number of chores · *Per chore*: each chore earns its points |
| Points for a full day (fair) | 30 | split across the day's chores, each finished chore earns its share immediately |
| Points per chore | 10 | *Per chore* mode: points per chore · *Fair* mode: default weight; can be changed per chore in the chore plan |
| Bonus for a fully completed day | 5 | |
| Bonus for every 7-day streak | 20 | |
| Parent PIN | 123456 (must be changed) | 4–8 digits, not 123456; protects rewards, settings, approvals and points; locked after 5 wrong attempts. *Reset parent PIN to 123456* if forgotten |
| Also send requests to | – | additional notification (e.g. mobile app) |
| Value of a large reward | 20 | money value as a guide; small ¼, medium ½, mega 2×, giant 5× |
| Currency | CHF | shown after the amounts |
| On-time pro: in time until | 20:00 | a chore counts as in time before its last day or on it by this time |
| Show points as a coin | on | coin next to the points; off = only the number |
| Letter on the coin | – (star) | one letter or digit, e.g. your family initial |
| Statistics: period when opening | Week | Week · Month · 3 months |
| Statistics: compare people | on | family tables *Who did what?* and *Which chores – who how often?* |
| Statistics: "Still practising" | on | chores forgotten most often on the own page |

**Pets** (*Settings → Pets*)

| Setting | Default | Meaning |
|---|---|---|
| Pets | on | pets page, pets on the cards and in the header, wheel of fortune; off hides everything, nothing is lost |
| Grown-ups start with pets | off | for newly added grown-ups; everyone can switch their own pets on and off on the pets page |
| Wheel of fortune | on | once a day per person, free again at midnight |
| Growth speed | Normal | Slow / Normal / Fast – how much growth each step needs (normal: hatching after about 3 chores, final form after about 2 months) |
| Needs go down | Slowly | Not at all / Slowly / Normal – hunger, thirst, energy and mood; never below 10 %, paused during holidays |

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
| Show school only around school time | 60 min | the school block appears X minutes before leaving until X minutes after getting home ("All" view); 0 = always |
| To-dos: confirm completion | on | ask "Mark as done?" before ticking off a to-do |
| To-dos: default size | Small | *No points · Small (⅓) · Medium (⅔) · Large (a full day)*; another size when adding needs the parent PIN |
| To-dos: show finished ones for | 1 day | 0 = until the next day change |

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
- **"All" view**: **today large, tomorrow medium, every other day very narrow** (past days only coloured with a count). In "Chores" and "Events" the next two days and the weekend are medium.
- Today's chores sit **two side by side**, so more fits on a landscape screen.
- Nothing planned leaves the cell **empty** (no "free").
- **Trophies and awards** next to the percentage are large and easy to see.
- The **"To-dos"** button at the top right opens the to-dos in a window of their own.
- Tap a day to show it large; arrows for other weeks, "Today" jumps back.
- Filters **All · Chores · Events · Timetable**.
- Tap chores directly to tick them off; deadlines ("until Sat", "due today") are visible.
- Tap a person: reliability, streak, awards and how to earn them.

**Lists** – tabs per list, add field, categories as tiles, *Categories* and *Optimise* (runs in the background: a small spinner shows the work, the page stays usable and the result appears when it is done).

**Chore plan** – week overview, chores by weekday, **special chores** and **to-dos** below; *+ Special chore* and *+ To-do* at the top open a popup.

In the planner: **"To-dos"** button at the top right → a window with every person's to-dos (tap → confirm → done).

**Rewards** – a tile per person (points, level, frame, running rewards, *+ Reward*), pending approvals, all rewards (pencil = change, parent PIN), still-to-win trophies, history.

**Settings** – pictures for everyone; all other settings with descriptions behind the parent PIN (see above).

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
    paths: { planer: planer, listen: einkauf, belohnungen: belohnungen, statistik: statistik, einstellungen: einstellungen }
  - type: custom:family-planer-card
    view: week        # week | plan | lists | rewards | stats | settings
    theme: space      # optional: ha | light | dark | rainbow | space
    style: glass      # optional: standard | transparent | glass
    language: en      # optional, otherwise the integration setting or the HA language
```

For a full-screen tablet, a panel view per page (paths as above) and e.g. *Kiosk Mode* are recommended. **New in 0.15.0:** for the *Statistics* button add a view with the path `statistik` and a card with `view: stats` (the sidebar panel needs nothing); until then the button shows as dashed.

---

## Security & privacy

- Everything stays **local** in your Home Assistant; no cloud, no tracking. External services only if you choose them yourself (calendars, lists, AI).
- Input is validated on the server (colours, images, icons, texts, lengths), output is escaped in the browser.
- Parent PIN stored with PBKDF2 (checked outside the event loop), start PIN must be changed, locked after 5 wrong attempts; unlocks are random 10-minute server tokens – the PIN never stays in the browser. Optionally only admins may change the plan.
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
