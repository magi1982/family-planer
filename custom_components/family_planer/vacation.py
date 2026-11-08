"""Holiday detection from calendar events (no Home Assistant imports, unit-testable).

An event pauses chores only when it is *safe* that someone is away:
  - the title contains one of the configured words (whole word or end of a compound: "Skiferien" matches "Ferien",
    "Ferienplanung" does not), and
  - the event covers the whole day (all-day event, or at least 20 hours of that day).
"""
from __future__ import annotations

from collections import Counter
from datetime import date, datetime, timedelta
import re

DEFAULT_WORDS = ["Ferien", "Urlaub", "Vacation", "Holiday", "Holidays", "Abwesend", "Out of office"]
# known ways people name time off (lower case); compounds are matched by suffix
KNOWN_STEMS = ["ferien", "urlaub", "vacation", "holiday", "holidays", "vacances", "vacanze", "abwesend", "abwesenheit",
               "auszeit", "reise", "trip", "kurzurlaub", "skilager", "lager", "out of office", "ooo", "away", "off",
               "betriebsferien", "schulferien", "pto", "leave", "ferie", "frei"]
# stems that are too generic to pause chores on their own unless the user confirms them
WEAK = {"reise", "trip", "lager", "away", "off", "frei", "leave"}
FULL_DAY_SECONDS = 20 * 3600


def _tokens(text: str) -> list[str]:
    return [t for t in re.split(r"[^\wäöüÄÖÜß]+", text.lower()) if t]


def matches(title: str, words: list[str]) -> bool:
    low = (title or "").lower()
    toks = _tokens(low)
    for w in words:
        w = (w or "").strip().lower()
        if not w:
            continue
        if " " in w or "-" in w:
            if w in low:
                return True
            continue
        for t in toks:
            if t == w or (len(w) >= 4 and t.endswith(w)):
                return True
    return False


def _parse(value) -> tuple[datetime | date, bool]:
    s = str(value)
    if len(s) == 10:
        return date.fromisoformat(s), True
    return datetime.fromisoformat(s), False


def covered_days(start, end, min_hours: float = 20) -> list[str]:
    """ISO dates fully covered by an event (all-day: start..end-1; timed: at least min_hours of the day)."""
    s, all_day = _parse(start)
    e, _ = _parse(end)
    out = []
    if all_day:
        d = s
        while d < e:
            out.append(d.isoformat())
            d += timedelta(days=1)
        return out
    d = s.date()
    while d <= e.date():
        day_start = datetime.combine(d, datetime.min.time(), tzinfo=s.tzinfo)
        day_end = day_start + timedelta(days=1)
        overlap = (min(e, day_end) - max(s, day_start)).total_seconds()
        if overlap >= min_hours * 3600:
            out.append(d.isoformat())
        d += timedelta(days=1)
    return out


def who(title: str, owner: str | None, persons: dict, scope: str) -> list[str]:
    """Persons an absence applies to: everyone (scope family), named persons, else the calendar owner."""
    if scope == "family":
        return list(persons)
    low = (title or "").lower()
    named = []
    for pid, p in persons.items():
        names = [p.get("name", "")] + list(p.get("aliases") or [])
        if any(n and re.search(r"(^|[^\wäöü])" + re.escape(n.lower()) + r"s?($|[^\wäöü])", low) for n in names):
            named.append(pid)
    return named or ([owner] if owner else [])


def absences(events_by_owner: dict[str | None, list[dict]], persons: dict, words: list[str], scope: str,
             min_hours: float = 20) -> dict[str, set[str]]:
    """{person_id: {iso dates}} from calendar events grouped by the calendar owner."""
    out: dict[str, set[str]] = {}
    for owner, events in events_by_owner.items():
        for ev in events:
            title = ev.get("summary") or ""
            if not matches(title, words):
                continue
            days = covered_days(ev["start"], ev["end"], min_hours)
            if not days:
                continue
            for pid in who(title, owner, persons, scope):
                out.setdefault(pid, set()).update(days)
    return out


def discover(events: list[dict]) -> list[str]:
    """How this calendar names time off: known words found in multi-day / all-day event titles."""
    found: Counter = Counter()
    for ev in events:
        if not covered_days(ev.get("start"), ev.get("end")):
            continue
        title = (ev.get("summary") or "").lower()
        for stem in KNOWN_STEMS:
            if stem in WEAK:
                continue
            if matches(title, [stem]):
                found[stem] += 1
    words = []
    for stem, _n in found.most_common():
        nice = "OOO" if stem == "ooo" else ("Out of office" if stem == "out of office" else stem.capitalize())
        # a compound stem ("Schulferien") is already covered by the shorter stem ("Ferien")
        if not any(matches(nice, [w]) for w in words):
            words.append(nice)
    return words
