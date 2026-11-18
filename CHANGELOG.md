# Changelog

## 0.17.1 – 2026-11-18
### Fixed
- **To-dos could be pressed several times:** before the server answered, every press counted as "done" again and coins flew up each time. Presses are now ignored while a to-do is being saved, coins rise only once per to-do, and the server ignores a to-do that is already in the requested state. The balance itself was never booked twice.
- **No eggs after the update to 0.17.0:** pets were only created with the first change in the planner (e.g. ticking off a chore). They are now created right when Home Assistant starts. A test covers it.

## 0.17.0 – 2026-11-18
### Added
- **Pets (Tierchen):** every family member can raise little pets that grow with the chores. Every chore gives coins (rewards) and, with pets on, the same number of pet points. Points are put into a pet's growth; hatching and evolving are always the child's own action (choice of up to three ways in the evolution tree). Reaching *grown* brings a new egg with a kind the child does not have yet. Care (hunger, thirst, energy, mood) goes down slowly, never below 10 % and pauses during holidays; things are only used when needed, toys stay.
- **Pets page** (new 🐾 navigation button): garden with the header's house, pool and season, *current pet* (develop and care in one screen), inventory, collection cards, pet statistics. Pets can get their own name.
- **On the person card:** the current pet at the picture and a plain **wheel of fortune** (once a day, free again at midnight; the server picks the field). Up to 8 pets walk in the header and step back behind header stories.
- **Settings → Pets:** on/off, grown-ups start with pets (off by default), wheel, growth speed, how fast needs go down – each with a description. Everyone can switch their own pets on or off on the pets page (behind ⚙️ with a confirmation); nothing is lost.
- The pet graphics come in their own file (`family-planer-pets.js`), loaded only when pets are on.

### Changed
- **The reward currency is called *coins* (Münzen) everywhere** – planner, *Coins & rewards*, statistics, settings, Home Assistant dialogs, sensors and announcements. *Points* are only the pet points. A coin without a family letter shows a small ring instead of a star (the star belongs to the pet points).
- **Ticking off a chore:** instead of a coin flying to the picture, what was earned rises slowly above the chore (*+10 coins*, *+10 points*, things found).
- **Reliability and level as one capsule** on the person card (reliability left, level right; tap the level as before).
- **One tile style everywhere:** statistics now have the season line on top like every page; statistics, rewards and lists tiles use the planer's coloured top line.
- **Volunteer button wiggles only slightly** (about 2° instead of 9°, no zoom, softer glow).
- **Secret chores in the volunteer popup** use the same split tile as in the columns: chore left, eye right, one border.

### Fixed
- **"Tap!" sign looked blurry on the tablet:** it sat on half pixels and had a double glow on the text. Now whole pixels, a darker plate and a thin glow – sharp letters.

## 0.16.4 – 2026-11-18
### Changed
- **New chore buttons:** no tick circle any more. The title runs over the full width; below it the hints (*until Fri*, *To-do*, *Special*) sit on the left and the coins on the right. A done chore gets a green tick of the same height next to the coins and a green border. In the week view the coin rows of neighbouring buttons line up. Buttons are about 10 % lower.
- **Secret chores as one split tile:** chore and eye share one border, divided by a line – left half ticks the chore, right half reveals it. Also in narrow columns (no extra row for the eye any more). The eye half is a bit wider.
- **Events and school in the today columns on two lines:** the title gets its own line (up to two), time and "in 12 min" sit below – titles and departure times are no longer cut to "G…" / "los 07:…".
- **No more "To-dos" counter button** in the planer toolbar: the count repeated what the columns already show, and with the volunteer button the toolbar got too wide on a tablet (the date was cut off). In its place a single to-do icon button opens the to-do overview with the input field.

## 0.16.3 – 2026-11-18
### Fixed
- **Statistics page was empty** ("could not be loaded"): a second method with the same name replaced the statistics query. Renamed; a new test catches duplicate method names.
- **"Tap!" sign after every button:** the sign came 1.5 s after each tap and restarted on every page. It now waits for 8 s without a tap and shares one timer across all pages.
- **E-mail address on to-do chips:** to-dos from an account list (named "<e-mail> <list>", e.g. Outlook / Microsoft To Do) showed the e-mail address on the tablet. The chip now shows the owner's name (matched against names and nicknames), else the list name – never the address. Statistics use the same label.

### Changed
- **Volunteer chores as a yellow button:** free special chores no longer add a sixth column (which made every family column narrower). A wiggling yellow *🙋 Volunteer* button with the count sits in the toolbar and opens a popup with the cards and *I'll take it!*.
- Filter **"To-dos & Spezial" is now "Extras"**.

## 0.16.2 – 2026-11-18

### Fixed
- **Season hat over the own cap:** the automatic season extra (e.g. the toadstool hat in autumn) no longer covers a hat, glasses, scarf or pet the person chose – it takes the next extra that fits. If a child picked a season hat themselves and then chooses a new hat, the season hat is taken off.
- **Avatar builder:** every change was already saved at once, but nothing showed it – now a short *Saved ✓* appears, and the hint says that changes are saved immediately.
- **Unicorn story without a rainbow:** at dawn and dusk the scene shows no rainbow, but the unicorn still trotted over it. The story now brings its own rainbow when the scene has none.

## 0.16.1 – 2026-11-18

### Fixed
- **Tablet layout of the planer:** chore, to-do and special-chore buttons no longer overlap (emoji, *Special* tag and points lay on top of the title, text ran out of the card). The button is now a simple wrapping row: title first, then the chips; in narrow columns the title gets the full width.
- **No more one-word-per-line text with syllable breaks** ("Plan-zen zu-sam-men"): titles wrap at word boundaries and use the whole width of the button.
- **Names are no longer cut to "M…":** names wrap to two lines; in narrow columns the picture sits on top and the name below it.
- **Points and tags no longer stick out of narrow columns**, also in the volunteer cards (*I'll take it!*) – their points moved under the text.
- **Many people on a small screen:** person columns wrap to a second row instead of becoming too narrow.
- **Navigation:** a button whose dashboard view does not exist is hidden; it (and the hint how to add the view) only shows while the dashboard is being edited – no red error box for the kids.

## 0.16.0 – 2026-11-17

### Added
- **Tap sign:** a glowing neon sign *TAP!* hangs down from the top edge above the house on two short wires, swings out and disappears again – it shows that an animation is ready in the picture at the top. Its colour matches the season (winter ice blue, summer pink, autumn amber, spring and special days green). New settings under *Seasons & weather*: **Tap sign** – *Off*, *After activity* (default: every 10 seconds after someone taps the planner or a motion sensor of the announcements reports movement, then it rests) or *Always (every 30 seconds)* – and **After activity, show for** (1–10 minutes, default 2). It never shows while an animation plays.

### Changed
- **Optimise (smart lists) now runs completely in the background:** the button answers at once, a small spinner next to it shows that the planner is working, and the page stays fully usable. The result (new or removed categories) appears when it is done, also when the AI takes a while.
- The yellow *Tap!* bubble in the sky is replaced by the tap sign.

## 0.15.0 – 2026-11-17

### Added
- **Statistics** (new fourth button after *Rewards*): the family first – chores, volunteer chores, to-dos, days on which everybody did everything (with record), **trophies & awards** per person (period and all time), *Who did what?* per type and *Which chores – who how often?* as a table – then one card per person. The own page shows reliability as **10 dots**, tiles, the last 7 days as **building blocks** (smaller on busy days), 12 weeks as **coloured dots** (green all done, yellow-green 1 forgotten, orange 2, red 3+), *What I did* per type, *Where my points come from* (a points jar per source, redeemed rewards, latest points), *My awards*, *Still practising* and *When I help*. Week, month or 3 months. Settings: default period, compare people, *Still practising*.
- **Points as a coin** (setting, on by default): a small silver-and-gold coin with one notch per family member and a letter of your choice (or a star) next to the points on chores, to-dos, special chores and rewards; a tiny star flashes on it now and then, and the coin flies to the person's picture when something is ticked off. Respects *reduce motion*.
- **Info texts for customs and public holidays:** the ⓘ chip next to the date explains St. Nicholas, Advent, Christmas, New Year's Eve, Epiphany, carnival, Easter, Ascension, Whitsun, Swiss National Day, the Federal Day of Thanksgiving, the first days of the seasons and more – short and for children (DE/EN).
- **Empty lists page:** a short explanation and a **Set up a list** button that opens *Settings → Lists* directly.

### Changed
- **Volunteer tile order:** rare special chores (only while someone is away, birthday, wedding day) first, then your own, then the catalogue; the one that ends first leads. Catalogue jobs nobody took make room the next day (daily rotation), and a more important job may push out an untaken catalogue job.
- **"Nothing planned – free!"** instead of *Nothing today*, with a balloon and the next event (*Tomorrow: …*).
- **Phone:** compact person cards in the Today view (picture left, name and badges beside it).
- **Tablet in portrait:** the suggestion below the weather shrinks to its symbol, a tap shows the text; landscape is unchanged.
- **Soft fade-in** when a page opens and when switching between *Today* and *Week*.
- The planner now records which chore was done and at what hour, which special chores and to-dos were ticked off (with list) and every award won – the data for the statistics (kept about 120 days, awards 400 days). Volunteer chores are kept 120 days instead of 60.

### Fixed
- **Points from volunteer chores** now count for the level and for the reward forecast (*in about X days*) like all other earned points. Reliability is unchanged: it only ever counts assigned chores.

## 0.14.0 – 2026-11-17

### Added
- **Volunteer champion** (weekly award): whoever took on and did the most volunteer chores of the week.
- **Rescuer** (weekly award): whoever took on the volunteer chore that had been waiting longest (at least a day).
- **Tap animations** (setting, on by default): a tap on the free picture in the header plays one of more than 60 animations that fits the day – special days, occasions (birthday, carnival, Easter, first day of school, Swiss National Day, St. Nicholas, Advent, New Year's Eve, Sputnik week), strong weather (checked at every tap), season and time of day (a different one by day, in the evening and at night). A yellow "Tap!" hint always sits at the same spot in the sky between the tree and the house.
- **Surprises** (setting: off, rare – default, about one day a week – or often): on surprise days something crazy plays instead of the season animation (black hole, Matrix mode, pixel explosion, synthwave 1986 …).
- **Summer at home:** from the first day of the summer holidays beach and house with pool take turns day by day; outside the holidays summer is shown at home, so the pool animations play too.

### Changed
- **Milestones are fair:** they now count days with every own chore done (25 / 100 / 250 days) instead of the number of chores, so a child with fewer chores is not behind.
- **On-time pro replaces the early bird:** the early bird could not be won with evening chores. The new weekly award goes to the best share (at least 80 %) of chores done in time – before their last day or on it by 20:00 (adjustable).
- **Volunteer chores** are open to the whole family (grown-ups too) unless persons are chosen for the chore; chores that are handed out (each / fixed / surprise) still go to the children. The "Who takes it?" picker now shows big avatar tiles that are easy to hit on a tablet.
- **Titanic and lunar module** now start like every other animation: a tap anywhere on the free picture; their own arrow hints are gone.
- **Double tap:** the header picture never toggles fullscreen any more (a tap there plays an animation); buttons in the header always keep their own function.
- **Lists – Optimise** answers at once: a list read in the last 45 s is reused, the keywords sort right away and the AI sorts the rest in the background (the list updates live when it is done).

### Removed
- **Standard house:** the header always shows the house with pool & pergola (the setting *House in the scene* is gone; a saved "standard" becomes the pool house).

### Fixed
- The New Year's Eve fireworks in the header now always show the coming year (before, they showed the current year until December).
- **Absences after a restart or update:** cloud calendars often deliver their events only a little after Home Assistant has started, so absences and the holiday check could stay empty until the next regular refresh. The planner now reads the calendars again 1, 3 and 10 minutes after the start.

## 0.13.3 – 2026-11-16

### Added
- **Titanic to tap:** tapping the ship on 15 April tells the story: night falls, the full moon rises, an iceberg drifts in, the ship breaks in two and sinks, lifeboats with lanterns row away – then it is day again. Big ice floes drift by. Now and then a bouncing golden arrow with "Tap!" and sparkles shows the kids where to tap (also on the lunar module).
- **Lunar module to tap:** on 20 July it lifts off into space and lands again in a cloud of moon dust; a small Swiss flag is planted next to it.
- **Info texts for Mother's Day and Father's Day** – the info chip next to the date now also works for customs (more can follow).
- **British Day for …** (setting): an optional name; the info text then says the day is for this person as a keepsake of the British roots.
- **Special days** (setting, on by default): their own header scene on Dinosaur Day (20 Feb), April Fools' Day (spaghetti harvest), the first mobile phone call (3 Apr), Titanic (15 Apr), the Moon landing (20 Jul) and a volcano day (27 Aug); Sputnik crosses the night sky 4–11 October and Concorde flies by on 26 November. Holidays, customs, birthdays and anniversaries keep their own scene. A chip with an info button explains the day.
- **British Days** (setting, on by default): ten random ordinary days a year show Buckingham Palace with the King's Guard instead of the house – never at Christmas, on holidays, school holidays or other special days.
- **Hot days:** above 30 °C a pool party with floats and a lawn sprinkler; on warm days a little lizard scurries across the ground.
- **Secret chores:** revealing one plays a small sparkle animation; tapping the eye again hides it (it is never ticked off by accident).
- **Frost mode** (setting with threshold, default −1 °C): in hard frost the header scene freezes – hoarfrost on everything, frozen puddles, glittering ice crystals. Uses the temperature of the selected weather entity.
- **Night mode** (setting under *Seasons & weather*, on by default): after the real sunset (`sun.sun`) a soft dark veil lies over the dashboard and the clock gets bigger; animations keep running. On a clear night single stars flare up now and then and a shooting star crosses the sky every so often.
- **Diagnostics** now include the holiday / trip detection and the special-chore counts – anonymised (persons as P1, P2 …, no titles or names) – so problems with *away* can be checked from the diagnostics download.

### Changed
- **Scenes:** on hot days the ball flies in an arc from child to child; the lunar module looks like the original Apollo LM; after 23:00 only a dark blue light flickers upstairs now and then. Rubber Duck Day was removed.
- **Absences:** a day off shows *Away* ✈️ unless it really is a holiday (*Holiday* 🌴 for school holidays and holiday words). In the holiday check (top right) every entry can be set to *Holiday* or *Away*.
- **Scenes:** five sprinklers and a ball thrown between the swimmers on hot days, a slower lizard away from the pool, a slow moon jump with dust, ice floes around the Titanic, New York 1973 for the first mobile call (skyline, radio mast, the caller, a yellow cab), red-white-blue bunting and flowers on British Days (no bus), Sputnik with its four antennas trailing, a more realistic Concorde.
- **Scenes, round 4:** at night the house is darker and now and then a light goes on upstairs (the ground floor is either fully lit or dark); no snowball kids at night; New Year's Day with a chimney sweep on the roof, a lucky pig, clover and a toadstool instead of emojis; slimmer three kings; cable car with valley station, mast and top station behind the trees, ski runs only on its mountain, a summit cross; Christmas Eve glitter in bright patches and the Christ child stays out longer; baby's breath on the meadow and no parasol on the wedding anniversary; carnival streamers hang from the top and sway, no emojis; chocolate bunnies stay behind the bushes; doves fly out of the picture in all directions; Father's Day with a man cave, a caveman dad and a smoking campfire; summer with one shark fin and crabs that come out of a sand hole and dig in again.
- **Volunteer column:** title and *First come, first served* in one line.
- **Header:** left the time with weekday and date next to it, the three buttons below – symmetric to the right side. The *Refresh* button moved into *Settings* (top bar) and reloads all calendars and lists from there.
- **Scenes, round 3:** darker ground at night; New Year's Eve with silver and gold glitter fireworks showing the coming year (night only), New Year's Day by day with lucky charms; three kings for Epiphany; winter sports with ski runs and the cable car on the mountain next to the house; on snowy winter days a snowman and children throwing snowballs; Easter bunnies only peek out with their heads, chocolate bunnies hide behind bushes, tilted eggs; stronger glitter on Christmas Eve; a bridal couple on the wedding anniversary; shark fins that rise and sink at the horizon and crabs on the beach; carnival now with your own house, confetti on the ground and confetti explosions; new doves that start on the ground and fly up flapping; Father's Day with dad on a ride-on mower, a drone and the grill.
- **Week view:** the volunteer row is at the bottom; its cards sit side by side with normal-sized buttons. A special chore in a narrow cell spans two cells, so title and eye fit.
- **Toolbar in one line** on every screen (swipe sideways on the phone if it does not fit).
- **Every task button is built the same:** left the title and the time chip (*for 2 d*, *due today*, *until Mon*), right the source chip (*To-do*, the name of the to-do list, *Special*, *Extra*) and the points – all as rounded chips in one size. If it does not fit on one line: title and time on the left, points and source on the right, one above the other. In narrow week cells the source shows its symbol only.
- **Better readability:** section headers (*Events*, *Chores*, *To-dos* …) and progress lines are larger and brighter.
- **More customs and fixes in the scene:** Samichlaus with his donkey and a cheerful Schmutzli; Christmas Eve with glitter on the ground, presents everywhere and the Christkind peeking out from behind the tree; the cable car climbs the mountain and a skier carves down the slope in the winter sports holidays; an empty cross on Ascension Day and Whitsun, white doves at Whitsun; funny floating things instead of hearts on Father's Day; a plane flies by now and then and a shark fin surfaces at the beach; fireworks keep away from the house; late at night (from 23:00) stars show even through clouds. No banners in the scene any more.
- **Avatars:** birthday animations are centred on the avatar (also in the week view), the rainbow rings are smaller; companions and small effects sit a little further inside the round picture so nothing is cut off.
- **Season scenes reworked:** a whole sky of rockets and crackling fireworks on New Year's Eve, crowns beside the house on Epiphany, a very colourful Fasnacht with lanterns, balloons and a marching Guggenmusik, rabbit holes with little white bunnies peeking out at Easter, many animated hearts on Mother's Day (no banner), a grill with smoke and a football on Father's Day, doves and a picnic at Pentecost, a beach bungalow with palms in the summer holidays, children with school bags walking to school, and a much livelier birthday with rising balloons and party poppers. The 1 August flag stands beside the house.
- **Pool covered at night** (22:00–8:00), pool suggestions only until 21:00.

## 0.13.2 – 2026-11-15

### Added
- **Refresh button in the header:** pulls all person calendars, smart lists and to-do lists with names right away, then recomputes absences, the season scene and the list categories; the week view reloads its events. No PIN (it only reads), at most once every 20 s. It sits below the holiday check.
- **Filters for chores and special chores:** chips at the top of the chore plan (per person, daily, with deadline / rhythm, not assigned) and of the special chores (on, off, own, volunteer, daily, weekly, occasion, weather, while away, secret, needs adult), each with a count, plus a search box.

### Changed
- **One header line per section in the today view:** *Chores · 1 of 4* with *All done!* on the right, *To-dos · 3 open*; special chores have their own section instead of sitting under the to-dos. The settings button sits at the top right.
- **Tidier, symmetric header:** time with the special-day label (e.g. *3rd Advent*) on top, the full date below (*Sunday, 13 December*); planner, lists and rewards as square icon buttons right next to it. On the right everything has the same height: weather and suggestion tiles, holiday check and refresh stacked, settings as a square button at the edge.
- **Our garden in the scene (own house):** a big apple tree (blossoms in spring, apples in summer and autumn, bare in winter), a smaller red maple (bright red in autumn) and a flower bed with white and violet flowers in summer – the right side of the house is no longer empty.
- **Real day and night:** the scene follows Home Assistant's `sun.sun` (night when the sun is below the horizon, before only by the clock 20–6). Around sunset and sunrise with sun or a few clouds the sky glows orange / pink with a low sun.
- **Garden lights at night:** small lights shine up into the trees and bushes. More grass tufts everywhere and a few round stones (snow caps in winter).
- **Christmas lights and Swiss bunting:** the fairy lights hang on a sagging wire and every bulb glows and sparkles in its own colour; on 1 August a string of red and white pennants with little Swiss crosses sways along the top. Spring tulips grow beside the house instead of in front of the pool. The parasol by the pool is now a brown thatched one (palm leaves) and only stands there in summer; the fairy-light bulbs are a little smaller.
- **Reliability as a hanging flag:** in the today view the percentage hangs as a small flag in the level colour at the top right of each person card, level with the avatar (before: a ribbon below the name).
- **Garlands hang from the visible top edge** at every header size; the 1 August bunting is fixed at the top like a real string of pennants. On phones the navigation moves to a second row in the header.
- **Volunteer tile, symmetric:** symbol and title on top, below *I'll take it* (full width, gentle pulse instead of the wiggle) and the eye button side by side, both 40 px high.
- **Rainbow design:** the selected button uses a calm two-colour gradient (pink → violet) instead of all rainbow colours; the rainbow band stays.
- **House in the middle of the scene:** every landscape and season is shifted so the house (or the beach / carnival scene) sits in the free middle of the header, also on tablets; the landscape repeats seamlessly at the right edge. Advent wreath, Christmas tree and presents stay next to the house, banners sit below the navigation.
- **Design picker removed from the header** – choose the design under *Settings → General*. The header is calmer and leaves more room for the scene.
- **Points on every task in the planner:** chores show *+N* next to the title (fair mode: their share of the day's points), to-dos and special chores show it in their label. The values come from the server, so they always match what gets booked.


### Fixed
- Chimney and fire smoke now rises from the chimney instead of drifting across the sky; clear nights no longer show clouds.
- **Date in the header** shows the weekday in full again (a second, short weekday list overwrote it).
- **Lists no longer jump while you work:** switching a special chore on or assigning a day to a chore keeps the row where it is (the order is fixed while the page is open); saving no longer blanks the list and throws you back to the top.
- **Shopping list *Optimise* no longer hangs:** reading the list is limited to 15 s and the AI to 30 s (at most 60 items per request); if it takes longer, the planner sorts by keywords only and the button shows *taking too long* after 60 s at the latest.
- **To-dos from a list with several names:** a name at the start decides ("Lea calendar for Mia" → only Lea, the title keeps "for Mia"). Without a leading name the first name in the text assigns it. Before, every name got its own to-do.
- **Secret special chores:** revealing the title is now a separate eye button on the right (avatar-builder style, no wiggle) – yellow like *I'll take it* in the volunteer tile, subtle grey once somebody has taken the job. Before, the small "tap to reveal" label sat inside the chore button, so tapping it often ticked the chore off.
- **No more "already defined" error** after an update when the old and the new card bundle are both loaded (e.g. iOS app cache).

## 0.13.1 – 2026-11-15

### Fixed
- **Away badge uses the real times** from the calendar (Home Assistant time zone): the day before *✈️ away tomorrow from 15:00*, on the day *✈️ away from 15:00 today*, then *✈️ away until Tue 23:30*. Before, a trip starting in the afternoon only showed from the next full day. Badges and special chores *only while away* switch exactly when the absence starts or ends; pausing chores still uses whole days.
- **The holiday check could not be opened** once every entry was answered, so there was no way to see or change a decision. The button is now always there while holiday detection is on (the red number only for open questions). It shows *Who is away?* at the top and lists answered entries too, with the current answer highlighted and changeable.

## 0.13.0 – 2026-11-15

### New
- **Away badge on the avatar**: the day before someone is away the planner shows *✈️ away from tomorrow* below their name, while away *✈️ away until Wed* (🌴 for holidays) – in the Today and Week views. Same detection as pausing chores (calendar or holiday check).
- **Special chores while a grown-up is away**: a special chore can be limited to days when a chosen grown-up (or any grown-up) is away – e.g. "make Mum a cosy evening" while Dad is on a trip. Away uses the same detection as pausing chores: holiday or absence in the calendar, or confirmed in the holiday check. Whoever is away never gets the chore. 13 new templates for these days, all switched off so you create your own from them – switch one on, pick under *Only while away* who is away and adjust the text: help with dinner, a picture or note for whoever is away, a secret cosy evening, make dinner, tidy up the house, help with the laundry, clean the guest toilet, ask Mum how to help, tuck Mum into bed, offer her a tea or coffee, be kind all day, pay her a compliment, tell her something she does well.
- **Needs a grown-up**: chores like lighting the Advent candles or shovelling snow with a grown-up no longer appear while every grown-up is away.

## 0.12.1 – 2026-11-15

### Fixed
- On phones the header only showed the middle of the landscape (sky, rainbow), so the house was out of view. Narrow screens now centre the scene on the house.

### Changed
- **To-do lists with names** (*Settings → To-dos*): any to-do list – e.g. the Alexa to-do list – can now be chosen directly, like a calendar; it no longer has to be a smart list. Items with a name or nickname become to-dos of that person and ticking off works both ways. Only names at the start are removed from the title; a name in the middle stays part of it.
- Navigation: the lists button shows a list icon instead of a shopping cart.
- Avatar builder: the *Season* register only appears while a season, holiday or birthday is on, and only shows the extras and effects of that season.
- *Settings → Seasons & weather → Switch seasons on and off*: every event shows its default lead time next to the field (e.g. *default 3 d*, *on the day* for birthdays), taken from the fields above; the empty field shows the same number in grey instead of a dash.

## 0.12.0 – 2026-11-15

### New
- **House with pool & pergola** for the header scene (*Settings → Seasons & weather → House in the scene*): a tall gabled house facing the garden with two upper windows, floor-level windows below, a simple pergola, an attached garage with a frosted-glass railing on its flat roof, a thatched parasol and a pool in front. It follows the weather and seasons like the standard house: snow on roof, railing and pergola, pool covered in winter, lit windows and pergola light in the evening, fairy lights at Christmas and **icicles below −5°**. The Advent wreath moves to the meadow so it never hides the house.

## 0.11.0 – 2026-11-15

### New
- **Weather scene in the navigation**: an animated landscape with a house behind clock, buttons and design picker, always visible. It follows a weather entity of your choice with ten states (sun, partly cloudy with a rainbow, clouds, rain, pouring rain, thunderstorm, snow, fog, wind, clear night) and the season of the year (spring blossoms, green summer, orange autumn with falling leaves, bare winter trees). Wind moves the trees, clouds and chimney smoke; a storm threshold makes them bend. Small icon, temperature and text at the top right. *Reduce motion* on the device turns all particles off.
- **Seasons, public holidays, customs and school holidays as a design layer** over every design and style: own header scene, page background, colour band, check-off effect and avatar extras. Christmas (from the 1st Advent, with Advent candles lighting up Sunday by Sunday, St. Nicholas, Christmas Eve – and it always snows), New Year's Eve and New Year with fireworks, Epiphany, winter, winter sports holidays, carnival (confetti), Valentine's Day, spring, Easter, Ascension, Whitsun, Mother's Day, Father's Day (hammock, paper plane, *Thank you, Dad!*), summer and summer holidays (a beach), Swiss National Day (flags, bonfire from 9 pm, fireworks from 10 pm), first day of school, Federal Day of Thanksgiving, harvest festival, autumn. One-day events start 3 days before, school holidays 3 days before the first day (both adjustable per event); priority birthday > anniversary > holiday > custom > school holidays > long season, adjustable. School holidays are found in the calendar titles (Sportferien, Frühlingsferien, Pfingst-, Sommer-, Herbst-, Weihnachtsferien). Pausing chores during family holidays stays in the manual holiday check.
- **Seasonal avatar extras and effects**: new *Season* register in the avatar builder (no PIN) with 87 extras (many animated: bobbling Santa hat, blinking reindeer nose, sparkler, fluttering Swiss flag, dripping ice cream …) and 57 effects as an aura. Up to three extras and one effect per season; without a choice everybody gets a different extra automatically. They are a separate layer – after the season the normal picture is back.
- **Birthday season**: birth date per person (year optional). Bunting, balloons and a *Happy Birthday* banner in the header; the birthday child's row celebrates all day with one of five animations coming from behind the person (confetti cannon, balloon ride, soap bubbles, rainbow disco, star shower) – a different one for everybody and every year, or chosen per person. **All points of the birthday child count double.**
- **Wedding and couple anniversary**: dates in the settings, a love season with floating hearts and *14 years married*.
- **Suggestions below the weather** from noon, at most one per day and a different one every day: pool weather (pool sensor of your choice), evening swim, pool party, hot tub in the evening / under the stars / in the snow / for parents from 9 pm (only on dry evenings without an adult's evening appointment), home cinema, games night, baking (Christmas only), crafts, puzzle and photo album (at most every 14 days), Lego challenge, barbecue, bike ride, family walk, dinner on the terrace, sledging, hot chocolate, Advent windows, Easter egg hunt, lake swim, ice cream, teamwork reward and a quiet evening.
- **Today view**: only the current day, people side by side as columns – school, events with the now line, chores (open first), to-dos and special chores. ‹ › for the other days, all filters work. Setting *Default view* (Today or Week) – used after the idle time and when coming back from another page.
- **To-dos**: at most the 4 oldest per person in the planner (adjustable), *+2 more* expands them; shows how long a to-do has been open.
- **To-dos from a shared list** (e.g. the Alexa to-do list): a name or nickname in an item makes it a to-do of that person, a trailing *klein / mittel / gross* sets the size and the points; several names give one to-do each. Ticking off works both ways. Per list: *Names → to-do of the person*.
- **Announcements without a motion sensor**: at fixed times (default 12:30 and 18:30), a summary at 20:00 of what is still open (max. 3 per person), now and then some praise (max. once a day), and on birthdays five funny announcements for the birthday child, spread over the day. Nothing is announced when *away* is confirmed in the holiday check.
- **Special chores (*Sonderämtli*)**: fun extra jobs for bonus points only – not done or expired never lowers the reliability. New *Volunteer* tile next to the people, visible only while something is open: the fastest child taps *I'll take it!* and gets it. Assignment *volunteer*, *every child*, *surprise* (random, default at most 2 per child and week) or *fixed*; one-off or recurring (daily, weekdays, every X days, yearly, at an event, a birthday, the wedding anniversary, Advent, weather, temperature) with lead time and time to do it, visible always / in a season / with some weather, and *secret* (shows *Secret job*; the birthday child never gets their own birthday card). Catalogue of 58 templates with sensible timing, e.g. Christmas baubles for every child from 10 to 24 December, a birthday card 3 days before, raking leaves from Tuesday for 5 days including Saturday. Everyday templates start switched off.
- Settings: new tabs **Seasons & weather** and **Special chores**, birthday and birthday animation per person, default view, to-dos per person, announcement times – all behind the parent PIN with German and English descriptions.

### Security
- New commands validated on the server; volunteer claims and ticking off special chores work without the PIN like ticking off chores, everything else needs the parent-PIN token. See SECURITY.md #25–#27.

## 0.10.0 – 2026-11-11

### New
- **Levels per school year**: 20+ levels in five tiers – bronze, silver, gold, diamond and ruby (21+, with names like *Most Epic Epicness Ever*). Thresholds are counted in full days and follow the point settings: about 80 % reliability reaches diamond in ~10 months, about 95 % ruby. A new season starts every school year (setting, default 1 August); the best level is kept, unlocked extras and points stay.
- **Level-up bonus**: one full day of points per level, three for a new tier (can be switched off), with a banner and confetti.
- **Level badge on the avatar** in the tier colour. After a level up it glows; every tap plays the tier's effect (copper sparks, silver stars, golden rain, diamond explosion, ruby eruption with a shaking screen), up to 20 times – the glow fades after the 5th tap.
- **Unlockable avatar extras** for every level (hats, glasses, buddies, backgrounds, costumes), only for the person who reached the level. Levels 5, 15, 25 … unlock small effects inside the picture, levels 10, 20, 30 … big effects that reach a little beyond it (silver aura, fireflies, golden wings, golden rain, flame aura, comet …). They are always visible in the planner and can be switched in the builder.
- **To-dos and special chores in the planner**, clearly marked (☑ to-do with a dashed border, ⭐ special chore in gold); to-dos are ticked with two taps when confirmation is on. New view **To-dos & special** next to All / Chores / Events.
- **Bigger avatars** in the planner (72 px on tablets, 56 px on phones).

### Security
- The server only accepts level extras in a picture for the person who unlocked them; picture codes stay whitelisted (`av2:` + up to 14 parts of `[a-z0-9]`). See SECURITY.md #24.

## 0.9.1 – 2026-11-11

### New
- **Avatar builder rebuilt**: skin tone (9) and hair colour (12) first, then the person (girl, boy, woman, man, grandma, grandpa), **18 hair styles** chosen separately, and tabs full of extras – head, face, clothes (T-shirt colour and motif), **buddies** (incl. lizard, monkey, mini dragon, penguin, fox, robot, owl), **8 backgrounds** over the person's colour, and **costumes** as a layer over the person (space suits, our own superheroes, ninja, knight, pirate, wizard, princess, prince, dino, firefighter). 🎲 *Random* button. Old pictures are converted automatically; a test draws over 30 000 combinations.
- **Settings without the PIN show only the pictures** – anyone may change any picture or upload a photo. *Parent PIN* at the top right opens all other tabs.
- **Holiday check reworked**: entries appear two weeks before they start, past ones are ignored; per entry *away – pause chores* or *here – chores go on*, for the whole family or chosen persons. **Long events without a holiday word** appear as *Optional* (they pause nothing without a decision). Decided entries leave the navigation popup and stay under *Settings → Holidays* for 4 weeks.
- *+ Special chore* and *+ To-do* in the chore plan open the form in a **popup**.

### Changed
- Rewards: tiles first, *still to win* below them. The *Edit* and *Give points* buttons are gone – rewards are added with *+ Reward* on a tile and changed with the pencil next to them; extra points are given with a to-do. *Change parent PIN* lives under Settings.
- The picture picker left the chore plan; colour and nicknames are under *Settings → People*.
- Bigger tap targets on the phone; the status page drops sources that have been silent for 30 days.

### Fixed
- With the styles *Glass* and *Transparent*, the design picker and the holiday check were hidden behind the planner. Popups of the navigation now always lie on top.

### Security
- Picture codes of the new builder are whitelisted on the server (`av2:` + 12 parts of `[a-z0-9]`); the holiday decision accepts only known person ids. See SECURITY.md #22–23.

## 0.9.0 – 2026-11-11

### New
- **Trophies reworked**: metallic frames around the picture – platinum (trophy of the month), gold (crown of the week), silver (perfect week), bronze (busy bee) – with a gentle shine; the crown sits straight and centred above the head. Medals are metallic and larger.
- **Six new awards**: climber, early bird (time adjustable), weekend hero, diamond streak (30 days), milestones (100 / 500 / 1000 chores) and family teamwork.
- Awards are given **per week, per month or when reached** (no more three trophies a day), and **earn points** once per win – again when won anew. Every award can be switched off or resized (*Settings → Points*).
- **Confetti for everyone**: small confetti with the name when somebody has finished the day; medium or large confetti in the trophy colour for trophies. At most one big confetti per person and day; none for daily changing awards. Respects *reduce motion*; can be switched off.
- **New designs**: Standard (follows Home Assistant), Light, Dark, Rainbow and Space – each with the styles Standard, Transparent and Glass. Older designs move to Dark automatically.
- **Navigation in one row** with time and date, an adjustable **order and visibility of the buttons**, a hint when a button points to a missing dashboard view, and a **holiday check**: for every holiday found in the calendars choose *away* (chores pause) or *at home* (chores go on).
- **Rewards page**: *still to win* on top (rule, period, points, who is ahead), a tile per person with frame, medals, **running rewards** and a **"+ Reward"** button, person details, and a **forecast** in the reward dialog (family average and per person).
- **Settings** reorganised: General, People, **Chores** (the complete chore plan now lives here), Points, To-dos, Lists, Holidays, Announcements, **Status** (last sync and last error per calendar, list and day change).
- **People**: order (children first) and role (child / adult).
- **Avatar builder**: figure, 12 hair styles, 12 hair colours, 9 skin tones, combinable extras and original costumes (our own heroes, ninja, knight, astronaut, pirate, wizard). Clashing parts are left out automatically; a test renders every combination.
- **"+ Special chore" and "+ To-do"** at the top of the chore plan, **"+"** next to *To-dos* in the planner.
- **Phone**: the planner shows only today, with ‹ › arrows and swipe.
- Today's events: a red **now line** between past and coming events, the next one shows *in 25 min*, past ones are dimmed.
- Ticking off a chore plays a short check animation (off with *reduce motion*).
- Adding a second planner now asks for confirmation first.

### Changed
- **Parent PIN for every change**: chores, the chore plan, special chores, to-dos, persons, lists, announcement test and the design. Without the PIN you can still tick off chores and to-dos, redeem rewards and change any picture.
- The starter bonus is gone. Open chores are listed first.
- The separate chore-plan page is hidden in the navigation by default (it can be shown again under *Settings → General*).

### Security
- New websocket commands `family_planer/vacation/decide` and `family_planer/person/order` (validated, parent PIN). Navigation and award settings are whitelisted. See SECURITY.md #18–21.

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
