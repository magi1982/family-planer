"""Free recurrence rules for chores besides the weekly plan (no Home Assistant imports, unit-testable).

schedule = {"type": "interval", "start": "2026-03-15", "every": 6, "unit": "months"}   # every half year
           {"type": "monthly", "every": 1, "start": "2026-01-01", "mode": "day", "day": 1}       # 1st of the month (-1 = last)
           {"type": "monthly", "every": 3, "start": "2026-01-01", "mode": "weekday", "nth": 1, "weekday": 6}  # 1st Sat every 3 months
           {"type": "yearly", "dates": ["04-15", "10-15"]}                                       # tyre change spring/autumn
           {"type": "once", "dates": ["2026-11-20"]}                                             # one-off
A chore with a schedule also has: "persons": [pid], "rotate": bool, "window": days (1..60).
"""
from __future__ import annotations

import calendar
from datetime import date, timedelta
import re

TYPES = ("interval", "monthly", "yearly", "once")
UNITS = ("days", "weeks", "months", "years")
MD_RE = re.compile(r"^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")


def _date(value, fallback: date) -> date:
    try:
        return date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        return fallback


def _int(value, lo: int, hi: int, fallback: int) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return fallback


def add_months(d: date, months: int, day: int | None = None) -> date:
    m = d.month - 1 + months
    y, m = d.year + m // 12, m % 12 + 1
    last = calendar.monthrange(y, m)[1]
    return date(y, m, min(day or d.day, last))


def months_between(a: date, b: date) -> int:
    return (b.year - a.year) * 12 + b.month - a.month


def validate(sched: dict | None, today: date) -> dict | None:
    """Sanitize a schedule coming from the UI; None if invalid."""
    if not isinstance(sched, dict) or sched.get("type") not in TYPES:
        return None
    t = sched["type"]
    if t == "interval":
        return {"type": t, "start": _date(sched.get("start"), today).isoformat(),
                "every": _int(sched.get("every"), 1, 365, 1),
                "unit": sched.get("unit") if sched.get("unit") in UNITS else "months"}
    if t == "monthly":
        out = {"type": t, "every": _int(sched.get("every"), 1, 24, 1),
               "start": _date(sched.get("start"), today).replace(day=1).isoformat()}
        if sched.get("mode") == "weekday":
            nth = _int(sched.get("nth"), -1, 5, 1)
            out.update(mode="weekday", nth=nth if nth != 0 else 1, weekday=_int(sched.get("weekday"), 1, 7, 6))
        else:
            day = _int(sched.get("day"), -1, 31, 1)
            out.update(mode="day", day=day if day != 0 else 1)
        return out
    dates = sched.get("dates") if isinstance(sched.get("dates"), list) else []
    if t == "yearly":
        clean = sorted({str(x) for x in dates if MD_RE.match(str(x))})
    else:
        clean = sorted({_date(x, today).isoformat() for x in dates if re.match(r"^\d{4}-\d{2}-\d{2}$", str(x))})
    return {"type": t, "dates": clean[:24]} if clean else None


def _nth_weekday(y: int, m: int, nth: int, weekday: int) -> date | None:
    days = [date(y, m, d) for d in range(1, calendar.monthrange(y, m)[1] + 1) if date(y, m, d).isoweekday() == weekday]
    if nth == -1:
        return days[-1]
    return days[nth - 1] if 0 < nth <= len(days) else None


def occurrence(sched: dict, d: date) -> int | None:
    """Occurrence number if the schedule fires on d (used for rotation), else None."""
    t = sched["type"]
    if t == "interval":
        s = date.fromisoformat(sched["start"])
        if d < s:
            return None
        every, unit = sched["every"], sched["unit"]
        if unit in ("days", "weeks"):
            period = every * (7 if unit == "weeks" else 1)
            diff = (d - s).days
            return diff // period if diff % period == 0 else None
        period = every * (12 if unit == "years" else 1)
        mb = months_between(s, d)
        if mb % period or add_months(s, mb) != d:
            return None
        return mb // period
    if t == "monthly":
        s = date.fromisoformat(sched["start"])
        mb = months_between(s, d)
        if mb < 0 or mb % sched["every"]:
            return None
        if sched.get("mode") == "weekday":
            hit = _nth_weekday(d.year, d.month, sched["nth"], sched["weekday"])
        else:
            last = calendar.monthrange(d.year, d.month)[1]
            hit = date(d.year, d.month, last if sched["day"] == -1 else min(sched["day"], last))
        return mb // sched["every"] if hit == d else None
    if t == "yearly":
        md = d.strftime("%m-%d")
        dates = sched["dates"]
        if not calendar.isleap(d.year) and md == "02-28" and "02-29" in dates:
            md = "02-29"
        return d.year * len(dates) + dates.index(md) if md in dates else None
    if t == "once":
        iso = d.isoformat()
        return sched["dates"].index(iso) if iso in sched["dates"] else None
    return None


def assignees(chore: dict, persons: dict, d: date, away: dict | None = None) -> list[str]:
    """Persons who get this chore on d (respecting rotation and absences)."""
    sched = chore.get("schedule")
    if not sched:
        return []
    occ = occurrence(sched, d)
    if occ is None:
        return []
    away = away or {}
    iso = d.isoformat()
    people = [p for p in chore.get("persons", []) if p in persons]
    if not people:
        return []
    present = [p for p in people if iso not in away.get(p, ())]
    if chore.get("rotate"):
        # the person whose turn it is; if away, the next one present takes over
        start = occ % len(people)
        for i in range(len(people)):
            p = people[(start + i) % len(people)]
            if p in present:
                return [p]
        return []
    return present


def upcoming(chore: dict, persons: dict, today: date, count: int = 3, horizon: int = 800) -> list[dict]:
    """Next occurrences (date + persons) for previews."""
    out = []
    for i in range(horizon):
        d = today + timedelta(days=i)
        who = assignees(chore, persons, d)
        if who:
            out.append({"date": d.isoformat(), "persons": who})
            if len(out) >= count:
                break
    return out
