"""Pure chore logic for Family Planer (no Home Assistant imports, fully unit-testable).

Data model (stored as JSON):

persons:  {person_id: {"name", "color", "image", "aliases": [], "calendar": entity_id|None, "order": int}}
chores:   {chore_id: {"title", "assign": {person_id: {day(str "1".."7"): {"every": n, "offset": o, "window": f}}}}}
            - day 1 = Monday ... 7 = Sunday
            - every:  repeat every n weeks (1 = weekly); active when week_index(date) % every == offset
            - window: number of days to complete (1 = only that day)
items:    {item_id: {"chore_id", "person_id", "title", "start": iso, "due": iso, "done": bool, "done_at": iso|None}}
            special chores instead carry "schedule", "persons", "rotate", "window" (see schedule.py)
history:  {iso_date: {person_id: {"done": n, "total": n, "missed": [titles]}}}
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import sys
import uuid

try:  # package import (Home Assistant)
    from . import schedule as _schedule
except ImportError:  # standalone tests
    _schedule = sys.modules["fp_schedule"]

EPOCH_MONDAY = date(1970, 1, 5)
HISTORY_DAYS = 120


def week_index(d: date) -> int:
    """Number of weeks since a fixed Monday (stable across years, unlike ISO week numbers)."""
    return (d - EPOCH_MONDAY).days // 7


def new_id() -> str:
    return uuid.uuid4().hex[:12]


def day_rule(rule: dict | None) -> dict:
    """Normalize a weekday rule to {"every", "offset", "window"}."""
    rule = rule or {}
    every = max(1, int(rule.get("every", 1) or 1))
    offset = int(rule.get("offset", 0) or 0) % every
    window = max(1, min(14, int(rule.get("window", 1) or 1)))
    return {"every": every, "offset": offset, "window": window}


def rule_active(rule: dict, d: date) -> bool:
    r = day_rule(rule)
    return week_index(d) % r["every"] == r["offset"]


@dataclass(frozen=True)
class Due:
    chore_id: str
    person_id: str
    title: str
    window: int

    @property
    def key(self) -> str:
        return f"{self.chore_id}|{self.person_id}"


def due_on(chores: dict, persons: dict, d: date, away: dict | None = None) -> list[Due]:
    """All chore assignments that start on date d (persons on holiday are skipped)."""
    wd = str(d.isoweekday())
    iso = d.isoformat()
    away = away or {}
    out: list[Due] = []
    for cid, chore in chores.items():
        if chore.get("schedule"):
            window = max(1, min(60, int(chore.get("window", 1) or 1)))
            for pid in _schedule.assignees(chore, persons, d, away):
                out.append(Due(cid, pid, chore.get("title", ""), window))
            continue
        for pid, days in (chore.get("assign") or {}).items():
            if pid not in persons or iso in away.get(pid, ()):
                continue
            rule = (days or {}).get(wd)
            if rule is None:
                continue
            if rule_active(rule, d):
                out.append(Due(cid, pid, chore.get("title", ""), day_rule(rule)["window"]))
    return out


def planned_titles(chores: dict, person_id: str, d: date) -> list[dict]:
    """Chores planned to start on d for one person (used for future-day previews)."""
    wd = str(d.isoweekday())
    res = []
    for cid, chore in chores.items():
        rule = ((chore.get("assign") or {}).get(person_id) or {}).get(wd)
        if rule is not None and rule_active(rule, d):
            r = day_rule(rule)
            res.append({"chore_id": cid, "title": chore.get("title", ""), "window": r["window"],
                        "due": (d + timedelta(days=r["window"] - 1)).isoformat()})
    return sorted(res, key=lambda x: x["title"].lower())


def rollover(data: dict, today: date, away: dict | None = None) -> bool:
    """Bring data up to date for `today`. Idempotent. Returns True if anything changed.

    1. Items whose due date lies in the past are booked into history on their due date
       (done -> counts as done, open -> counts as missed) and removed.
    2. Open items that started today but are no longer planned (plan changed) are removed.
    3. Items for today's assignments are created if missing.
    4. History older than HISTORY_DAYS is trimmed.
    Absences (holidays): items due on a day the person is away are dropped without counting,
    open items of persons away today are removed and no new ones are created.
    """
    away = away or {}
    changed = False
    persons = data.setdefault("persons", {})
    chores = data.setdefault("chores", {})
    items = data.setdefault("items", {})
    history = data.setdefault("history", {})
    t_iso = today.isoformat()

    # 1. archive expired items
    for iid in [i for i, it in items.items() if it.get("due", it.get("start", "")) < t_iso]:
        it = items.pop(iid)
        day = it.get("due") or it.get("start")
        pid = it.get("person_id")
        if not day or not pid:
            continue
        if day in away.get(pid, ()) and not it.get("done"):
            changed = True
            continue  # on holiday: neither done nor missed
        rec = history.setdefault(day, {}).setdefault(pid, {"done": 0, "total": 0, "missed": []})
        rec["total"] += 1
        if it.get("done"):
            rec["done"] += 1
        else:
            rec["missed"].append(it.get("title", ""))
        changed = True

    # 2./3. reconcile today's items with the plan
    for iid in [i for i, it in items.items() if t_iso in away.get(it.get("person_id"), ()) and not it.get("done")]:
        items.pop(iid)
        changed = True
    due = {d.key: d for d in due_on(chores, persons, today, away)}
    existing = {f'{it["chore_id"]}|{it["person_id"]}': iid for iid, it in items.items() if it.get("start") == t_iso}
    for key, iid in existing.items():
        if key not in due and not items[iid].get("done"):
            items.pop(iid)
            changed = True
        elif key in due and items[iid].get("title") != due[key].title and not items[iid].get("done"):
            items[iid]["title"] = due[key].title  # follow renames for open items
            changed = True
    for key, d in due.items():
        if key in existing:
            continue
        items[new_id()] = {
            "chore_id": d.chore_id, "person_id": d.person_id, "title": d.title,
            "start": t_iso, "due": (today + timedelta(days=d.window - 1)).isoformat(),
            "done": False, "done_at": None,
        }
        changed = True

    # 4. trim history
    limit = (today - timedelta(days=HISTORY_DAYS)).isoformat()
    for day in [d for d in history if d < limit]:
        history.pop(day)
        changed = True

    data["last_rollover"] = t_iso
    return changed


def active_items(items: dict, person_id: str | None, today: date) -> list[tuple[str, dict]]:
    """Items that can be worked on today (start <= today <= due)."""
    t = today.isoformat()
    res = [(iid, it) for iid, it in items.items()
           if it.get("start", "") <= t <= it.get("due", it.get("start", ""))
           and (person_id is None or it.get("person_id") == person_id)]
    return sorted(res, key=lambda x: (x[1].get("title", "").lower(), x[0]))


def person_stats(history: dict, items: dict, person_id: str, today: date, days: int = 30) -> dict:
    """Reliability and streak. Items already done today count immediately; misses only count after their deadline."""
    done_today = sum(1 for _, it in active_items(items, person_id, today) if it.get("done"))

    def window(n: int) -> tuple[int, int]:
        d, t = done_today, done_today
        for i in range(1, n + 1):
            rec = history.get((today - timedelta(days=i)).isoformat(), {}).get(person_id)
            if rec:
                d += rec.get("done", 0)
                t += rec.get("total", 0)
        return d, t

    w, m, a = window(7), window(30), window(days)
    act = active_items(items, person_id, today)
    streak = 1 if act and all(it.get("done") for _, it in act) else 0
    for i in range(1, HISTORY_DAYS + 1):
        rec = history.get((today - timedelta(days=i)).isoformat(), {}).get(person_id)
        if not rec or not rec.get("total"):
            continue
        if rec["done"] == rec["total"]:
            streak += 1
        else:
            break
    return {
        "reliability": round(a[0] / a[1] * 100) if a[1] else 100,
        "start_bonus": a[1] == 0,
        "week": list(w), "month": list(m), "streak": streak,
        "open_today": sum(1 for _, it in act if not it.get("done")),
        "done_today": sum(1 for _, it in act if it.get("done")),
    }


AWARDS = {
    "crown": {"icon": "mdi:crown", "color": "#F5C542"},
    "trophy": {"icon": "mdi:trophy", "color": "#E0A84F"},
    "bee": {"icon": "mdi:bee", "color": "#F5C542"},
    "perfect": {"icon": "mdi:star-four-points", "color": "#69C350"},
    "streak": {"icon": "mdi:fire", "color": "#E06B6B"},
    "start": {"icon": "mdi:rocket-launch", "color": "#4FA3E0"},
}


def awards(stats: dict[str, dict]) -> dict[str, list[dict]]:
    """Awards move between persons depending on recent history."""
    res: dict[str, list[dict]] = {pid: [] for pid in stats}
    rate = lambda x: x[0] / x[1] if x[1] else -1  # noqa: E731

    def best(key: str, min_total: int) -> list[str]:
        cand = [p for p, s in stats.items() if s[key][1] >= min_total]
        if not cand:
            return []
        top = max(rate(stats[p][key]) for p in cand)
        cand = [p for p in cand if rate(stats[p][key]) == top]
        most = max(stats[p][key][0] for p in cand)
        return [p for p in cand if stats[p][key][0] == most]

    for p in best("week", 3):
        res[p].append({"id": "crown", **AWARDS["crown"], "value": stats[p]["week"]})
    for p in best("month", 10):
        res[p].append({"id": "trophy", **AWARDS["trophy"], "value": stats[p]["month"]})
    most = max([s["week"][0] for s in stats.values()] or [0])
    bees = [p for p, s in stats.items() if most >= 5 and s["week"][0] == most]
    if len(bees) == 1:
        res[bees[0]].append({"id": "bee", **AWARDS["bee"], "value": most})
    for p, s in stats.items():
        if s["week"][1] >= 5 and s["week"][0] == s["week"][1]:
            res[p].append({"id": "perfect", **AWARDS["perfect"], "value": s["week"][1]})
        if s["streak"] >= 3:
            res[p].append({"id": "streak", **AWARDS["streak"], "value": s["streak"]})
        if s["start_bonus"]:
            res[p].append({"id": "start", **AWARDS["start"], "value": 100})
    return res


def validate_chore(chore: dict, persons: dict) -> dict:
    """Sanitize a chore coming from the UI / services."""
    title = str(chore.get("title", "")).strip()
    if not title:
        raise ValueError("title must not be empty")
    assign: dict = {}
    for pid, days in (chore.get("assign") or {}).items():
        if pid not in persons:
            continue
        clean = {}
        for day, rule in (days or {}).items():
            if str(day) in {"1", "2", "3", "4", "5", "6", "7"}:
                clean[str(day)] = day_rule(rule)
        assign[pid] = clean
    out = {"title": title[:120], "assign": assign}
    sched = _schedule.validate(chore.get("schedule"), date.today())
    if sched:
        out.update(assign={}, schedule=sched, rotate=bool(chore.get("rotate")),
                   persons=[p for p in dict.fromkeys(chore.get("persons") or []) if p in persons],
                   window=max(1, min(60, int(chore.get("window", 1) or 1))))
    return out
