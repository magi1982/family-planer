"""Seasons, public holidays, customs, school holidays, birthdays and anniversaries (no HA imports, unit-tested).

The planner shows one *season* at a time as a design layer (header scene, background, avatar extras). This module
knows when each event takes place, how many days before it starts to show, and which one wins when several overlap.
"""
from __future__ import annotations

from datetime import date, timedelta
import re

from . import validate

# ---------------------------------------------------------------------------------------------- date helpers


def easter(year: int) -> date:
    """Easter Sunday (Gregorian calendar, anonymous algorithm)."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l_ = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l_) // 451
    month, day = divmod(h + l_ - 7 * m + 114, 31)
    return date(year, month, day + 1)


def nth_sunday(year: int, month: int, n: int) -> date:
    d = date(year, month, 1)
    d += timedelta(days=(6 - d.weekday()) % 7)
    return d + timedelta(weeks=n - 1)


def advent(year: int, n: int = 1) -> date:
    """n-th Advent Sunday (1st = fourth Sunday before Christmas)."""
    xmas = date(year, 12, 25)
    fourth = xmas - timedelta(days=(xmas.weekday() + 1) % 7 or 7)
    return fourth - timedelta(weeks=4 - n)


# ---------------------------------------------------------------------------------------------- catalogue
# kind: holiday (public holiday), custom (Brauch), season (long season), school (holidays from the calendar),
#       person (birthday), couple (anniversary)
KINDS = ("person", "couple", "holiday", "custom", "school", "season")
PRIORITY = ["person", "couple", "holiday", "custom", "school", "season"]
# visual themes the frontend can draw (header scene, background, avatar extras and effects)
VISUALS = ("alltag", "weihnachten", "silvester", "dreikoenig", "winter", "sport", "fasnacht", "liebe", "fruehling",
           "ostern", "pfingsten", "vatertag", "sommer", "august", "schule", "herbst", "geburtstag")

# key: (kind, visual, de, en, wild 1..5)
EVENTS: dict[str, tuple[str, str, str, str, int]] = {
    "weihnachten": ("season", "weihnachten", "Advent & Weihnachten", "Advent & Christmas", 2),
    "advent": ("custom", "weihnachten", "Advent", "Advent", 2),
    "samichlaus": ("custom", "weihnachten", "Samichlaus", "St. Nicholas", 2),
    "winteranfang": ("custom", "weihnachten", "Winteranfang", "First day of winter", 1),
    "heiligabend": ("custom", "weihnachten", "Heiligabend", "Christmas Eve", 3),
    "weihnachtstag": ("holiday", "weihnachten", "Weihnachten", "Christmas Day", 2),
    "stephanstag": ("holiday", "weihnachten", "Stephanstag", "Boxing Day", 2),
    "silvester": ("custom", "silvester", "Silvester", "New Year's Eve", 5),
    "neujahr": ("holiday", "silvester", "Neujahr", "New Year", 4),
    "berchtoldstag": ("holiday", "silvester", "Berchtoldstag", "St. Berchtold's Day", 3),
    "dreikoenig": ("custom", "dreikoenig", "Dreikönigstag", "Epiphany", 2),
    "winter": ("season", "winter", "Winter", "Winter", 1),
    "valentin": ("custom", "liebe", "Valentinstag", "Valentine's Day", 2),
    "fasnacht": ("custom", "fasnacht", "Fasnacht", "Carnival", 4),
    "fruehlingsanfang": ("custom", "fruehling", "Frühlingsanfang", "First day of spring", 2),
    "fruehling": ("season", "fruehling", "Frühling", "Spring", 2),
    "karfreitag": ("holiday", "ostern", "Karfreitag", "Good Friday", 1),
    "ostersonntag": ("custom", "ostern", "Ostern", "Easter", 2),
    "ostermontag": ("holiday", "ostern", "Ostermontag", "Easter Monday", 2),
    "tag_der_arbeit": ("holiday", "pfingsten", "Tag der Arbeit", "Labour Day", 1),
    "auffahrt": ("holiday", "pfingsten", "Auffahrt", "Ascension Day", 1),
    "muttertag": ("custom", "pfingsten", "Muttertag", "Mother's Day", 2),
    "pfingstsonntag": ("custom", "pfingsten", "Pfingsten", "Whitsun", 1),
    "pfingstmontag": ("holiday", "pfingsten", "Pfingstmontag", "Whit Monday", 1),
    "vatertag": ("custom", "vatertag", "Vatertag", "Father's Day", 2),
    "sommeranfang": ("custom", "sommer", "Sommeranfang", "First day of summer", 3),
    "sommer": ("season", "sommer", "Sommer", "Summer", 3),
    "august": ("holiday", "august", "1. August", "Swiss National Day", 4),
    "schulanfang": ("custom", "schule", "Schulanfang", "First day of school", 2),
    "bettag": ("custom", "herbst", "Bettag", "Federal Day of Thanksgiving", 1),
    "herbstanfang": ("custom", "herbst", "Herbstanfang", "First day of autumn", 2),
    "erntedank": ("custom", "herbst", "Erntedank", "Harvest festival", 2),
    "herbst": ("season", "herbst", "Herbst", "Autumn", 2),
    "ferien_sport": ("school", "sport", "Sportferien", "Winter sports holidays", 3),
    "ferien_fruehling": ("school", "fruehling", "Frühlingsferien", "Spring holidays", 2),
    "ferien_pfingsten": ("school", "pfingsten", "Pfingstferien", "Whitsun holidays", 2),
    "ferien_sommer": ("school", "sommer", "Sommerferien", "Summer holidays", 3),
    "ferien_herbst": ("school", "herbst", "Herbstferien", "Autumn holidays", 2),
    "ferien_weihnachten": ("school", "weihnachten", "Weihnachtsferien", "Christmas holidays", 2),
    "geburtstag": ("person", "geburtstag", "Geburtstag", "Birthday", 4),
    "hochzeitstag": ("couple", "liebe", "Hochzeitstag", "Wedding anniversary", 2),
    "kennenlerntag": ("couple", "liebe", "Kennenlerntag", "Couple anniversary", 2),
}
# words in calendar titles -> kind of school holidays (whole words or word endings, case-insensitive)
FERIEN_WORDS = [
    ("ferien_sport", ("sportferien", "skiferien", "skilager", "winterferien", "fasnachtsferien", "sport holidays", "ski holidays")),
    ("ferien_fruehling", ("frühlingsferien", "fruehlingsferien", "frühlingsferie", "osterferien", "spring break", "spring holidays", "easter holidays")),
    ("ferien_pfingsten", ("pfingstferien", "auffahrtsferien", "whitsun holidays")),
    ("ferien_sommer", ("sommerferien", "summer holidays", "summer vacation")),
    ("ferien_herbst", ("herbstferien", "autumn holidays", "fall break")),
    ("ferien_weihnachten", ("weihnachtsferien", "christmas holidays", "winter break")),
]
JZ = ("fruehling", "sommer", "herbst", "winter")


def _ranges(year: int) -> dict[str, tuple[date, date]]:
    """(first, last) day of every date-based event of one year (Fasnacht and long seasons span several days)."""
    e = easter(year)
    a1 = advent(year, 1)
    one = lambda d: (d, d)  # noqa: E731
    return {
        "neujahr": one(date(year, 1, 1)), "berchtoldstag": one(date(year, 1, 2)), "dreikoenig": one(date(year, 1, 6)),
        "valentin": one(date(year, 2, 14)), "fasnacht": (e - timedelta(days=52), e - timedelta(days=47)),
        "fruehlingsanfang": one(date(year, 3, 20)), "karfreitag": one(e - timedelta(days=2)), "ostersonntag": one(e),
        "ostermontag": one(e + timedelta(days=1)), "tag_der_arbeit": one(date(year, 5, 1)),
        "auffahrt": one(e + timedelta(days=39)), "muttertag": one(nth_sunday(year, 5, 2)),
        "pfingstsonntag": one(e + timedelta(days=49)), "pfingstmontag": one(e + timedelta(days=50)),
        "vatertag": one(nth_sunday(year, 6, 1)), "sommeranfang": one(date(year, 6, 21)), "august": one(date(year, 8, 1)),
        "bettag": one(nth_sunday(year, 9, 3)), "herbstanfang": one(date(year, 9, 23)), "erntedank": one(nth_sunday(year, 10, 1)),
        "advent": (a1, date(year, 12, 23)), "samichlaus": one(date(year, 12, 6)), "winteranfang": one(date(year, 12, 21)),
        "heiligabend": one(date(year, 12, 24)), "weihnachtstag": one(date(year, 12, 25)), "stephanstag": one(date(year, 12, 26)),
        "silvester": one(date(year, 12, 31)),
        # long seasons (fixed start, see settings); the Christmas season starts on the 1st Advent by default
        "weihnachten": (a1, date(year, 12, 26)),
        "winter": (date(year, 1, 7), e - timedelta(days=53)),
        "fruehling": (date(year, 3, 20), date(year, 6, 20)),
        "sommer": (date(year, 6, 21), date(year, 9, 22)),
        "herbst": (date(year, 9, 23), a1 - timedelta(days=1)),
    }


def jahreszeit(d: date) -> str:
    """Season of the year for the everyday house scene."""
    md = (d.month, d.day)
    if (3, 20) <= md < (6, 21):
        return "fruehling"
    if (6, 21) <= md < (9, 23):
        return "sommer"
    if (9, 23) <= md < (12, 21):
        return "herbst"
    return "winter"


def ferien_kind(title: str) -> str | None:
    low = (title or "").lower()
    toks = [t for t in re.split(r"[^\wäöüß]+", low) if t]
    for key, words in FERIEN_WORDS:
        for w in words:
            if " " in w:
                if w in low:
                    return key
            elif any(t == w or t.startswith(w) or (len(w) > 6 and t.endswith(w)) for t in toks):
                return key
    return None


def ferien_ranges(events: list[dict]) -> list[dict]:
    """School holidays from calendar events: [{"key", "start", "end"}] (end inclusive), duplicates merged."""
    out: dict[tuple[str, str], dict] = {}
    for ev in events or []:
        key = ferien_kind(ev.get("summary") or "")
        if not key:
            continue
        try:
            s = date.fromisoformat(str(ev.get("start"))[:10])
            e_raw = str(ev.get("end"))
            e = date.fromisoformat(e_raw[:10])
            if len(e_raw) == 10 and e > s:  # all-day: end is exclusive
                e -= timedelta(days=1)
        except ValueError:
            continue
        if e < s or (e - s).days > 62:
            continue
        cur = out.get((key, s.isoformat()))
        if cur is None or e.isoformat() > cur["end"]:
            out[(key, s.isoformat())] = {"key": key, "start": s.isoformat(), "end": e.isoformat()}
    return sorted(out.values(), key=lambda r: r["start"])


def _md(value) -> tuple[int, int, int | None] | None:
    """'YYYY-MM-DD' or 'MM-DD' -> (month, day, year|None)."""
    s = str(value or "")
    m = re.match(r"^(?:(\d{4})-)?(\d{2})-(\d{2})$", s)
    if not m:
        return None
    y = int(m.group(1)) if m.group(1) else None
    mo, d = int(m.group(2)), int(m.group(3))
    try:
        date(2024, mo, d)
    except ValueError:
        return None
    return mo, d, y


def clean_date(value) -> str:
    """Birthday / anniversary as entered: 'YYYY-MM-DD' (year optional -> 'MM-DD'); invalid -> ''."""
    p = _md(value)
    if not p:
        return ""
    mo, d, y = p
    if y is not None and not 1900 <= y <= 2100:
        y = None
    return f"{y:04d}-{mo:02d}-{d:02d}" if y else f"{mo:02d}-{d:02d}"


def _on_year(mo: int, d: int, year: int) -> date:
    try:
        return date(year, mo, d)
    except ValueError:  # 29 February
        return date(year, 2, 28)


# ---------------------------------------------------------------------------------------------- settings
DEFAULTS = {
    "enabled": True, "lead_day": 3, "lead_school": 3, "christmas_start": "advent", "xmas_snow": True,
    "weather": None, "storm_kmh": 50, "intensity": "normal", "priority": list(PRIORITY),
    "events": {}, "wedding": "", "couple": "", "anim_bday": True, "house": "standard",
}
INTENSITY = ("calm", "normal", "lots")
HOUSES = ("standard", "pool")


def clean_settings(raw) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    ev_in = raw.get("events") if isinstance(raw.get("events"), dict) else {}
    events = {}
    for key, val in ev_in.items():
        if key in EVENTS and isinstance(val, dict):
            item = {"on": bool(val.get("on", True))}
            if val.get("lead") is not None:
                item["lead"] = validate.integer(val.get("lead"), 0, 30, 3)
            events[key] = item
    prio = [k for k in (raw.get("priority") or []) if k in KINDS]
    prio = list(dict.fromkeys(prio + [k for k in PRIORITY if k not in prio]))
    return {
        "enabled": bool(raw.get("enabled", True)),
        "lead_day": validate.integer(raw.get("lead_day"), 0, 30, 3),
        "lead_school": validate.integer(raw.get("lead_school"), 0, 30, 3),
        "christmas_start": raw.get("christmas_start") if raw.get("christmas_start") in ("advent", "dec1") else "advent",
        "xmas_snow": bool(raw.get("xmas_snow", True)),
        "weather": validate.entity(raw.get("weather"), ("weather",)),
        "storm_kmh": validate.integer(raw.get("storm_kmh"), 20, 150, 50),
        "intensity": raw.get("intensity") if raw.get("intensity") in INTENSITY else "normal",
        "priority": prio,
        "events": events,
        "wedding": clean_date(raw.get("wedding")),
        "couple": clean_date(raw.get("couple")),
        "anim_bday": bool(raw.get("anim_bday", True)),
        "house": raw.get("house") if raw.get("house") in HOUSES else "standard",
    }


def _lead(cfg: dict, key: str) -> int:
    ov = (cfg.get("events") or {}).get(key) or {}
    if "lead" in ov:
        return ov["lead"]
    kind = EVENTS[key][0]
    if key == "advent":  # the Christmas season starts on the 1st Advent itself
        return 0
    if kind == "school":
        return cfg["lead_school"]
    if kind in ("holiday", "custom", "couple"):
        return cfg["lead_day"]
    return 0


def _on(cfg: dict, key: str) -> bool:
    return ((cfg.get("events") or {}).get(key) or {}).get("on", True)


# ---------------------------------------------------------------------------------------------- resolution


def occurrences(cfg: dict, today: date, ferien: list[dict] | None = None, persons: dict | None = None) -> list[dict]:
    """Every event that is shown today (lead included): [{"key", "kind", "start", "end", "show", "pid"?}]."""
    out = []
    for year in (today.year - 1, today.year, today.year + 1):
        for key, (s, e) in _ranges(year).items():
            if key in ("weihnachten", "advent") and cfg.get("christmas_start") == "dec1":
                s = max(s, date(year, 12, 1))
            out.append({"key": key, "start": s, "end": e})
    # Schulanfang: first Monday after the summer holidays found in the calendar
    for r in ferien or []:
        out.append({"key": r["key"], "start": date.fromisoformat(r["start"]), "end": date.fromisoformat(r["end"])})
        if r["key"] == "ferien_sommer":
            end = date.fromisoformat(r["end"])
            first = end + timedelta(days=1)
            first += timedelta(days=(7 - first.weekday()) % 7)
            out.append({"key": "schulanfang", "start": first, "end": first})
    for pid, p in (persons or {}).items():
        md = _md(p.get("birthday"))
        if md:
            for year in (today.year, today.year + 1):
                d = _on_year(md[0], md[1], year)
                out.append({"key": "geburtstag", "start": d, "end": d, "pid": pid,
                            "age": (year - md[2]) if md[2] else None})
    for key in ("wedding", "couple"):
        md = _md(cfg.get(key))
        if md:
            for year in (today.year, today.year + 1):
                d = _on_year(md[0], md[1], year)
                out.append({"key": "hochzeitstag" if key == "wedding" else "kennenlerntag", "start": d, "end": d,
                            "years": (year - md[2]) if md[2] else None})
    shown = []
    for o in out:
        if not _on(cfg, o["key"]):
            continue
        lead = 0 if o["key"] == "geburtstag" else _lead(cfg, o["key"])
        o["show"] = o["start"] - timedelta(days=lead)
        o["kind"] = EVENTS[o["key"]][0]
        if o["show"] <= today <= o["end"]:
            shown.append(o)
    return shown


def resolve(cfg: dict, today: date, ferien: list[dict] | None = None, persons: dict | None = None) -> dict:
    """The season the planner shows today and everything the frontend needs to draw it."""
    cfg = clean_settings(cfg)
    jz = jahreszeit(today)
    base = {"enabled": cfg["enabled"], "key": None, "vis": "alltag", "kind": None, "jz": jz, "sub": None, "advent": 0,
            "wild": 1, "snow": False, "birthdays": [], "ages": {}, "anniversary": None, "label": None,
            "intensity": cfg["intensity"], "weather": cfg["weather"], "storm_kmh": cfg["storm_kmh"],
            "anim_bday": cfg["anim_bday"]}
    if not cfg["enabled"]:
        return base
    occ = occurrences(cfg, today, ferien, persons)
    bdays = [o for o in occ if o["key"] == "geburtstag" and o["start"] == today]
    base["birthdays"] = [o["pid"] for o in bdays]
    base["ages"] = {o["pid"]: o["age"] for o in bdays if o.get("age")}
    ann = [o for o in occ if o["kind"] == "couple" and o["start"] == today]
    if ann:
        base["anniversary"] = {"key": ann[0]["key"], "years": ann[0].get("years")}
    rank = {k: i for i, k in enumerate(cfg["priority"])}
    # a birthday lead (person row) only shows on the day itself; long seasons are the fallback layer
    cands = [o for o in occ if not (o["key"] == "geburtstag" and o["start"] != today)]

    def order(o):
        today_on = o["start"] <= today <= o["end"]
        return (rank.get(o["kind"], 9), not today_on, abs((o["start"] - today).days))
    cands.sort(key=order)
    xmas_days = {"weihnachten", "advent", "samichlaus", "winteranfang", "heiligabend", "weihnachtstag", "stephanstag",
                 "ferien_weihnachten"}
    if cands:
        top = cands[0]
        kind, vis, de, en, wild = EVENTS[top["key"]]
        # the season label stays the main event; during Christmas the details (Advent, St. Nicholas) are the sub-season
        base.update(key=top["key"], vis=vis, kind=kind, wild=wild, label={"de": de, "en": en},
                    start=top["start"].isoformat(), end=top["end"].isoformat())
    keys = {o["key"] for o in occ}
    if base["vis"] == "weihnachten" or (keys & xmas_days and base["vis"] in ("alltag", "winter", "herbst")):
        base["vis"] = "weihnachten"
        a1 = advent(today.year, 1)
        base["advent"] = sum(1 for n in (1, 2, 3, 4) if advent(today.year, n) <= today) if a1 <= today <= date(today.year, 12, 26) else 0
        if today.month == 12 and 4 <= today.day <= 6:
            base["sub"] = "samichlaus"
        elif today.month == 12 and 24 <= today.day <= 26:
            base["sub"] = "heiligabend"
        elif base["advent"]:
            base["sub"] = f"advent{base['advent']}"
        base["snow"] = cfg["xmas_snow"]
        if base["key"] in (None, "winter", "herbst"):
            base.update(key="weihnachten", kind="season", wild=EVENTS["weihnachten"][4],
                        label={"de": EVENTS["weihnachten"][2], "en": EVENTS["weihnachten"][3]})
    if base["vis"] == "dreikoenig":
        base["sub"] = "dreikoenig"
    if base["vis"] == "ostern":
        base["sub"] = {"karfreitag": "karfreitag", "ostersonntag": "ostern", "ostermontag": "ostermontag"}.get(base["key"])
    if base["vis"] == "pfingsten":
        base["sub"] = base["key"]
    if base["vis"] == "august":
        base["sub"] = "august"
    if base["vis"] == "silvester":
        base["sub"] = base["key"]
    return base


def upcoming(cfg: dict, today: date, ferien: list[dict] | None = None, persons: dict | None = None, days: int = 400) -> list[dict]:
    """Next events (settings page / year list): [{"key", "start", "end", "show", "kind"}]."""
    cfg = clean_settings(cfg)
    out = []
    for year in (today.year, today.year + 1):
        for key, (s, e) in _ranges(year).items():
            if key in ("weihnachten", "advent") and cfg.get("christmas_start") == "dec1":
                s = max(s, date(year, 12, 1))
            if today <= e and s <= today + timedelta(days=days):
                lead = _lead(cfg, key)
                out.append({"key": key, "kind": EVENTS[key][0], "start": s.isoformat(), "end": e.isoformat(),
                            "show": (s - timedelta(days=lead)).isoformat(), "on": _on(cfg, key)})
    for r in ferien or []:
        if r["end"] >= today.isoformat():
            s = date.fromisoformat(r["start"])
            out.append({"key": r["key"], "kind": "school", "start": r["start"], "end": r["end"],
                        "show": (s - timedelta(days=_lead(cfg, r["key"]))).isoformat(), "on": _on(cfg, r["key"])})
    out.sort(key=lambda o: o["start"])
    return out[:80]


def event_dates(today: date, ferien: list[dict] | None = None, cfg: dict | None = None) -> dict[str, list[date]]:
    """Start day of every event in the years around today (special chores anchor on these)."""
    cfg = clean_settings(cfg or {})
    out: dict[str, list[date]] = {}
    for year in (today.year - 1, today.year, today.year + 1):
        for key, (s, _e) in _ranges(year).items():
            out.setdefault(key, []).append(s)
    for r in ferien or []:
        out.setdefault(r["key"], []).append(date.fromisoformat(r["start"]))
        if r["key"] == "ferien_sommer":
            first = date.fromisoformat(r["end"]) + timedelta(days=1)
            out.setdefault("schulanfang", []).append(first + timedelta(days=(7 - first.weekday()) % 7))
    return out
