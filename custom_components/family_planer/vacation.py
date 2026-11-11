"""Holiday detection from calendar events (no Home Assistant imports, unit-testable).

An event pauses chores only when it is *safe* that someone is away:
  - the title contains one of the configured words (whole word or end of a compound: "Skiferien" matches "Ferien",
    "Ferienplanung" does not), and
  - the event covers the whole day (all-day event, or at least 20 hours of that day).
"""
from __future__ import annotations

from collections import Counter
from datetime import date, datetime, timedelta
import hashlib
import re

DEFAULT_WORDS = ["Ferien", "Urlaub", "Vacation", "Holiday", "Holidays", "Abwesend", "Out of office"]
# known ways people name time off (lower case); compounds are matched by suffix
KNOWN_STEMS = ["ferien", "urlaub", "vacation", "holiday", "holidays", "vacances", "vacanze", "abwesend", "abwesenheit",
               "auszeit", "reise", "trip", "kurzurlaub", "skilager", "lager", "out of office", "ooo", "away", "off",
               "betriebsferien", "schulferien", "pto", "leave", "ferie", "frei"]
# stems that are too generic to pause chores on their own unless the user confirms them
WEAK = {"reise", "trip", "lager", "away", "off", "frei", "leave"}
FULL_DAY_SECONDS = 20 * 3600
LONG_DAY_HOURS = 6  # a long event counts for every day it takes at least this many hours of


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


def event_key(ev: dict) -> str:
    """Stable id of a holiday event (title + start + end) for the "away / at home" decision."""
    raw = f'{ev.get("summary") or ""}|{ev.get("start")}|{ev.get("end")}'
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _long(ev: dict, min_hours: float) -> bool:
    """A long event without a holiday word: timed and at least min_hours, or all-day over several days."""
    try:
        s, all_day = _parse(ev["start"])
        e, _ = _parse(ev["end"])
    except (KeyError, ValueError):
        return False
    if all_day:
        return (e - s).days >= 2
    return (e - s).total_seconds() >= min_hours * 3600


def found(events_by_owner: dict[str | None, list[dict]], persons: dict, words: list[str], scope: str,
          min_hours: float = 20, long_events: bool = False) -> list[dict]:
    """Holiday events with the persons and days they cover (one entry per event, owners merged).

    kind "holiday": the title has a holiday word; kind "long" (only with long_events): a long event without one.
    """
    out: dict[str, dict] = {}
    for owner, events in events_by_owner.items():
        for ev in events:
            title = ev.get("summary") or ""
            if matches(title, words):
                kind = "holiday"
            elif long_events and _long(ev, min_hours):
                kind = "long"
            else:
                continue
            days = covered_days(ev["start"], ev["end"], min_hours)
            if not days and kind == "long":
                days = covered_days(ev["start"], ev["end"], LONG_DAY_HOURS)  # e.g. a 26 h trip over two days
            if not days:
                continue
            key = event_key(ev)
            entry = out.setdefault(key, {"key": key, "kind": kind, "title": title[:120], "start": str(ev["start"])[:25],
                                         "end": str(ev["end"])[:25], "days": days, "persons": []})
            for pid in who(title, owner, persons, scope):
                if pid not in entry["persons"]:
                    entry["persons"].append(pid)
    return sorted(out.values(), key=lambda e: e["days"][0])


def decision(raw) -> dict:
    """Stored decision -> {"d": "away" | "home", "family": bool, "persons": [ids], "at": iso date}."""
    if isinstance(raw, str):
        return {"d": raw, "family": False, "persons": [], "at": ""}
    if not isinstance(raw, dict) or raw.get("d") not in ("away", "home"):
        return {}
    return {"d": raw["d"], "family": bool(raw.get("family")), "persons": [p for p in raw.get("persons") or [] if isinstance(p, str)][:30],
            "at": str(raw.get("at") or "")[:10]}


def absences(events_by_owner: dict[str | None, list[dict]], persons: dict, words: list[str], scope: str,
             min_hours: float = 20, decisions: dict | None = None) -> dict[str, set[str]]:
    """{person_id: {iso dates}} from calendar events grouped by the calendar owner.

    Holiday events pause chores unless decided "home"; long events without a holiday word only when decided "away".
    A decision can name the whole family or single persons instead of the detected ones.
    """
    decisions = decisions or {}
    out: dict[str, set[str]] = {}
    for ev in found(events_by_owner, persons, words, scope, min_hours, long_events=True):
        dec = decision(decisions.get(ev["key"]))
        if dec.get("d") == "home" or (ev["kind"] == "long" and dec.get("d") != "away"):
            continue
        who_ = list(persons) if dec.get("family") else [p for p in dec.get("persons", []) if p in persons] or ev["persons"]
        for pid in who_:
            out.setdefault(pid, set()).update(ev["days"])
    return out


def review(entries: list[dict], decisions: dict, today: date, ahead_days: int = 14, keep_days: int = 28) -> list[dict]:
    """Events to confirm: not over yet, starting within ahead_days; decided ones stay keep_days after the decision."""
    t = today.isoformat()
    soon = (today + timedelta(days=ahead_days)).isoformat()
    old = (today - timedelta(days=keep_days)).isoformat()
    out = []
    for e in entries:
        if e["days"][-1] < t or e["days"][0] > soon:
            continue
        dec = decision(decisions.get(e["key"]))
        if dec and dec["at"] and dec["at"] < old:
            continue
        out.append({**e, "decision": dec.get("d"), "family": dec.get("family", False), "chosen": dec.get("persons", []),
                    "decided_at": dec.get("at", "")})
    return out[:30]


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
