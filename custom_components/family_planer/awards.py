"""Trophies and awards (no Home Assistant imports, unit-tested).

Awards are handed out on a schedule so children do not get several new trophies every day:

* weekly (Monday, for the past Monday–Sunday): crown, busy bee, perfect week, weekend hero, climber, early bird
* monthly (on the 1st, for the past month): trophy of the month
* when reached: diamond streak (30 days in a row), milestones (100 / 500 / 1000 chores), family teamwork (one day)

Every win books points once (ledger ref ``award:<id>:<period>:<person>``) and creates a celebration
(confetti on the dashboards). A person gets at most one big celebration per day; further wins that day are
shown as a small banner only.

State in ``data["awards"]``::

    {"week": "2026-11-02", "month": "2026-10", "holders": {award_id: [pid, ...]},
     "since": {award_id: iso_date}, "diamond": {pid: bool}, "milestone": {pid: level},
     "team": {"day": iso, "pids": [...]}, "day_done": {pid: iso}, "celebrations": [...]}
"""
from __future__ import annotations

import secrets
from datetime import date, timedelta

# id: icon, colour (confetti / medal), frame metal (avatar ring), confetti size, default points size, period
META: dict[str, dict] = {
    "trophy": {"icon": "mdi:trophy", "color": "#D9E4F0", "metal": "platinum", "fx": "l", "size": "l", "period": "month"},
    "crown": {"icon": "mdi:crown", "color": "#F5C542", "metal": "gold", "fx": "m", "size": "m", "period": "week"},
    "perfect": {"icon": "mdi:star-four-points", "color": "#C9D1D9", "metal": "silver", "fx": "m", "size": "m", "period": "week"},
    "bee": {"icon": "mdi:bee", "color": "#CD8A4E", "metal": "bronze", "fx": "banner", "size": "s", "period": "week"},
    "weekend": {"icon": "mdi:shield-star", "color": "#E06B6B", "metal": None, "fx": "m", "size": "s", "period": "week"},
    "climber": {"icon": "mdi:trending-up", "color": "#4FD1C5", "metal": None, "fx": "m", "size": "m", "period": "week"},
    "early": {"icon": "mdi:weather-sunset-up", "color": "#FFB74D", "metal": None, "fx": "banner", "size": "s", "period": "week"},
    "diamond": {"icon": "mdi:diamond-stone", "color": "#7FDBFF", "metal": None, "fx": "l", "size": "xl", "period": "reach"},
    "milestone": {"icon": "mdi:medal", "color": "#E0A84F", "metal": None, "fx": "m", "size": "m", "period": "reach"},
    "team": {"icon": "mdi:account-group", "color": "#C771D6", "metal": None, "fx": "l", "size": "s", "period": "day"},
}
IDS = tuple(META)
METAL_RANK = {"platinum": 4, "gold": 3, "silver": 2, "bronze": 1}
SIZES = ("none", "s", "m", "l", "xl")
MILESTONES = (100, 500, 1000)
MILESTONE_COLOR = {100: "#CD8A4E", 500: "#C9D1D9", 1000: "#F5C542"}
DIAMOND_DAYS = 30
CLIMB_MIN = 0.15
MAX_CELEBRATIONS = 40


def new_id() -> str:
    return secrets.token_hex(6)


# ------------------------------------------------------------------ settings
def clean_settings(raw: dict | None) -> dict:
    """{"items": {id: {"on": bool, "size": size}}, "early_time": "HH:MM", "confetti": bool}"""
    raw = raw or {}
    items = raw.get("items") or {}
    out = {}
    for aid, meta in META.items():
        cur = items.get(aid) or {}
        out[aid] = {"on": bool(cur.get("on", True)), "size": cur.get("size") if cur.get("size") in SIZES else meta["size"]}
    t = str(raw.get("early_time") or "12:00")
    if len(t) != 5 or t[2] != ":" or not (t[:2].isdigit() and t[3:].isdigit()) or int(t[:2]) > 23 or int(t[3:]) > 59:
        t = "12:00"
    return {"items": out, "early_time": t, "confetti": bool(raw.get("confetti", True))}


def points_for(size: str, day_points: int) -> int:
    day = max(0, int(day_points))
    return {"none": 0, "s": -(-day // 3), "m": -(-2 * day // 3), "l": day, "xl": 2 * day}.get(size, 0)


def _step(size: str, n: int) -> str:
    order = ["s", "m", "l", "xl"]
    if size not in order:
        return size
    return order[min(len(order) - 1, order.index(size) + n)]


# ------------------------------------------------------------------ statistics over a date range
def _range(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def period_stats(history: dict, pid: str, start: date, end: date) -> dict:
    """done/total chores, fair day sum, days with chores, complete days and early days in [start, end]."""
    done = total = days = complete = 0
    frac = 0.0
    lasts = []
    for d in _range(start, end):
        rec = history.get(d.isoformat(), {}).get(pid)
        if not rec or not rec.get("total"):
            continue
        done += rec.get("done", 0)
        total += rec["total"]
        days += 1
        frac += rec.get("done", 0) / rec["total"]
        if rec.get("done") == rec["total"]:
            complete += 1
            lasts.append(rec.get("last") or "")
    return {"done": done, "total": total, "days": days, "frac": round(frac, 3), "complete": complete, "lasts": lasts}


def _rate(s: dict, fair: bool) -> float:
    if fair:
        return s["frac"] / s["days"] if s["days"] else -1
    return s["done"] / s["total"] if s["total"] else -1


def _enough(s: dict, fair: bool, n: int) -> bool:
    return (s["days"] if fair else s["total"]) >= n


def _best(stats: dict[str, dict], fair: bool, minimum: int) -> list[str]:
    cand = [p for p, s in stats.items() if _enough(s, fair, minimum)]
    if not cand:
        return []
    top = max(_rate(stats[p], fair) for p in cand)
    if top <= 0:
        return []
    cand = [p for p in cand if _rate(stats[p], fair) == top]
    amount = (lambda p: stats[p]["frac"]) if fair else (lambda p: stats[p]["done"])
    most = max(amount(p) for p in cand)
    return [p for p in cand if amount(p) == most]


def week_winners(history: dict, persons: list[str], monday: date, fair: bool, early_time: str) -> dict[str, list[str]]:
    """Weekly awards for the week starting on `monday` (Mon–Sun)."""
    sunday = monday + timedelta(days=6)
    stats = {p: period_stats(history, p, monday, sunday) for p in persons}
    prev = {p: period_stats(history, p, monday - timedelta(days=7), monday - timedelta(days=1)) for p in persons}
    won: dict[str, list[str]] = {}
    won["crown"] = _best(stats, fair, 3)
    amount = (lambda s: s["frac"]) if fair else (lambda s: s["done"])
    most = max([amount(s) for s in stats.values()] or [0])
    bees = [p for p, s in stats.items() if most >= (3 if fair else 5) and amount(s) == most]
    won["bee"] = bees if len(bees) == 1 else []
    won["perfect"] = [p for p, s in stats.items() if s["total"] >= 5 and s["done"] == s["total"]]
    weekend = []
    for p in persons:
        days = [history.get((monday + timedelta(days=i)).isoformat(), {}).get(p) for i in (5, 6)]
        if all(r and r.get("total") and r.get("done") == r["total"] for r in days):
            weekend.append(p)
    won["weekend"] = weekend
    gains = {p: _rate(stats[p], fair) - _rate(prev[p], fair) for p in persons
             if _enough(stats[p], fair, 3) and _enough(prev[p], fair, 3)}
    top = max(gains.values(), default=0)
    won["climber"] = [p for p, g in gains.items() if top >= CLIMB_MIN and g == top]
    won["early"] = [p for p, s in stats.items() if sum(1 for t in s["lasts"] if t and t < early_time) >= 4]
    return won


def month_winners(history: dict, persons: list[str], first: date, fair: bool) -> list[str]:
    last = (first.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    stats = {p: period_stats(history, p, first, last) for p in persons}
    return _best(stats, fair, 10)


# ------------------------------------------------------------------ evaluation
def _state(data: dict) -> dict:
    st = data.setdefault("awards", {})
    for key, default in (("holders", {}), ("since", {}), ("diamond", {}), ("milestone", {}), ("day_done", {}),
                         ("celebrations", []), ("counted", {})):
        st.setdefault(key, default)
    st.setdefault("week", None)
    st.setdefault("month", None)
    st.setdefault("team", None)
    return st


def _celebrate(st: dict, pid: str | None, kind: str, fx: str, color: str, ts: str, today: date, value=None) -> dict | None:
    if fx in ("none", None):
        return None
    if fx in ("m", "l") and pid is not None:
        big_today = [c for c in st["celebrations"] if c.get("pid") == pid and c.get("fx") in ("m", "l")
                     and (c.get("ts") or "")[:10] == today.isoformat()]
        if big_today:
            fx = "banner"  # at most one big confetti rain per person and day
    c = {"id": new_id(), "pid": pid, "kind": kind, "fx": fx, "color": color, "ts": ts}
    if value is not None:
        c["value"] = value
    st["celebrations"].append(c)
    del st["celebrations"][:-MAX_CELEBRATIONS]
    return c


def _win(data: dict, st: dict, aid: str, pid: str, period: str, cfg: dict, day_points: int, ts: str, today: date,
         ledger_add, value=None, color: str | None = None, size: str | None = None, fx: str | None = None) -> None:
    item = cfg["items"][aid]
    pts = points_for(size or item["size"], day_points)
    ref = f"award:{aid}:{period}:{pid}"
    if pts > 0 and not any(e.get("ref") == ref for e in data.get("ledger", [])):
        ledger_add(data["ledger"], pid, pts, "award", ref, aid, ts)
    if cfg.get("confetti", True):
        _celebrate(st, pid, aid, fx or META[aid]["fx"], color or META[aid]["color"], ts, today, value)


def evaluate(data: dict, today: date, streaks: dict[str, int], cfg: dict, fair: bool, day_points: int, ts: str,
             ledger_add) -> dict:
    """Hand out due awards (idempotent). `ledger_add(ledger, pid, pts, kind, ref, text, ts)` books points."""
    st = _state(data)
    history = data.get("history", {})
    persons = [p for p in data.get("persons", {})]
    on = {aid: cfg["items"][aid]["on"] for aid in IDS}

    # milestones count every finished chore; history is trimmed after 120 days, so count each day once
    counters = data.setdefault("counters", {})
    counted = st["counted"]
    for day, per in history.items():
        for pid, rec in per.items():
            key = f"{day}|{pid}"
            if key in counted or pid not in data.get("persons", {}):
                continue
            counted[key] = True
            counters.setdefault(pid, {"done": 0})["done"] += int(rec.get("done", 0))
    horizon = (today - timedelta(days=150)).isoformat()
    for key in [k for k in counted if k[:10] < horizon]:
        counted.pop(key, None)

    # weekly awards for the last complete week
    monday = today - timedelta(days=today.weekday()) - timedelta(days=7)
    if st["week"] != monday.isoformat():
        won = week_winners(history, persons, monday, fair, cfg["early_time"])
        for aid, pids in won.items():
            pids = pids if on[aid] else []
            st["holders"][aid] = pids
            st["since"][aid] = monday.isoformat()
            for pid in pids:
                _win(data, st, aid, pid, monday.isoformat(), cfg, day_points, ts, today, ledger_add)
        st["week"] = monday.isoformat()

    # monthly trophy for the last complete month
    first = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    if st["month"] != first.isoformat()[:7]:
        pids = month_winners(history, persons, first, fair) if on["trophy"] else []
        st["holders"]["trophy"] = pids
        st["since"]["trophy"] = first.isoformat()
        for pid in pids:
            _win(data, st, "trophy", pid, first.isoformat()[:7], cfg, day_points, ts, today, ledger_add)
        st["month"] = first.isoformat()[:7]

    # diamond streak: 30 days in a row; can be won again after the streak broke
    holders = []
    for pid in persons:
        reached = streaks.get(pid, 0) >= DIAMOND_DAYS
        if reached and on["diamond"]:
            holders.append(pid)
            if not st["diamond"].get(pid):
                _win(data, st, "diamond", pid, today.isoformat(), cfg, day_points, ts, today, ledger_add,
                     value=streaks[pid])
        st["diamond"][pid] = reached
    st["holders"]["diamond"] = holders

    # milestones 100 / 500 / 1000 chores
    holders = []
    for pid in persons:
        total = counters.get(pid, {}).get("done", 0)
        level = max([m for m in MILESTONES if total >= m] or [0])
        if level and on["milestone"]:
            holders.append(pid)
            if level > st["milestone"].get(pid, 0):
                step = MILESTONES.index(level)
                _win(data, st, "milestone", pid, str(level), cfg, day_points, ts, today, ledger_add, value=level,
                     color=MILESTONE_COLOR[level], size=_step(cfg["items"]["milestone"]["size"], step),
                     fx="l" if level >= 500 else "m")
        st["milestone"][pid] = max(level, st["milestone"].get(pid, 0))
    st["holders"]["milestone"] = holders

    # family teamwork: yesterday everybody with chores finished all of them (at least two persons)
    yday = (today - timedelta(days=1)).isoformat()
    if on["team"] and (st["team"] or {}).get("day") != yday:
        recs = {p: r for p, r in history.get(yday, {}).items() if p in data.get("persons", {}) and r.get("total")}
        if len(recs) >= 2 and all(r.get("done") == r["total"] for r in recs.values()):
            st["team"] = {"day": yday, "pids": sorted(recs)}
            for pid in sorted(recs):
                _win(data, st, "team", pid, yday, cfg, day_points, ts, today, ledger_add, fx="none")
            if cfg.get("confetti", True):
                _celebrate(st, None, "team", "l", META["team"]["color"], ts, today)
    team = st["team"] or {}
    st["holders"]["team"] = list(team.get("pids", [])) if team.get("day") == yday and on["team"] else []
    for aid in IDS:
        if not on[aid]:
            st["holders"][aid] = []
    return st


def day_done(data: dict, pid: str, today: date, color: str, ts: str, cfg: dict) -> dict | None:
    """Small confetti with the name when somebody finished every chore of the day (once per day)."""
    st = _state(data)
    if st["day_done"].get(pid) == today.isoformat():
        return None
    st["day_done"][pid] = today.isoformat()
    if not cfg.get("confetti", True):
        return None
    return _celebrate(st, pid, "day", "s", color, ts, today)


# ------------------------------------------------------------------ display
def person_awards(data: dict, streaks: dict[str, int]) -> dict[str, list[dict]]:
    """Awards per person for the dashboards, most valuable first, plus the frame metal of the avatar."""
    st = _state(data)
    out: dict[str, list[dict]] = {pid: [] for pid in data.get("persons", {})}
    for aid in IDS:
        for pid in st["holders"].get(aid, []):
            if pid not in out:
                continue
            a = {"id": aid, "icon": META[aid]["icon"], "color": META[aid]["color"], "since": st["since"].get(aid)}
            if aid == "milestone":
                lvl = st["milestone"].get(pid, 0)
                a.update(value=lvl, color=MILESTONE_COLOR.get(lvl, META[aid]["color"]))
            if aid == "diamond":
                a["value"] = streaks.get(pid, 0)
            out[pid].append(a)
    for pid, s in streaks.items():
        if pid in out and s >= 3:
            out[pid].append({"id": "streak", "icon": "mdi:fire", "color": "#E06B6B", "value": s})
    return out


def frame(awards_of_person: list[dict]) -> str | None:
    metals = [META[a["id"]]["metal"] for a in awards_of_person if a["id"] in META and META[a["id"]]["metal"]]
    return max(metals, key=lambda m: METAL_RANK[m]) if metals else None


def open_awards(data: dict, today: date, streaks: dict[str, int], fair: bool, cfg: dict) -> list[dict]:
    """Awards without a holder right now, with the person closest to winning (current week/month so far)."""
    st = _state(data)
    history = data.get("history", {})
    persons = list(data.get("persons", {}))
    monday = today - timedelta(days=today.weekday())
    week = {p: period_stats(history, p, monday, today - timedelta(days=1)) for p in persons}
    month = {p: period_stats(history, p, today.replace(day=1), today - timedelta(days=1)) for p in persons}
    counters = data.get("counters", {})
    out = []
    for aid in IDS:
        if not cfg["items"][aid]["on"] or st["holders"].get(aid):
            continue
        leader, value = None, None
        if aid in ("crown", "climber", "perfect", "weekend"):
            best = _best(week, fair, 1)
            leader = best[0] if best else None
            value = round(_rate(week[leader], fair) * 100) if leader else None
        elif aid == "bee":
            amount = (lambda p: week[p]["frac"]) if fair else (lambda p: week[p]["done"])
            leader = max(persons, key=amount, default=None)
            value = amount(leader) if leader else None
        elif aid == "early":
            leader = max(persons, key=lambda p: sum(1 for t in week[p]["lasts"] if t and t < cfg["early_time"]), default=None)
            value = sum(1 for t in week[leader]["lasts"] if t and t < cfg["early_time"]) if leader else None
        elif aid == "trophy":
            best = _best(month, fair, 1)
            leader = best[0] if best else None
            value = round(_rate(month[leader], fair) * 100) if leader else None
        elif aid == "diamond":
            leader = max(persons, key=lambda p: streaks.get(p, 0), default=None)
            value = streaks.get(leader, 0) if leader else None
        elif aid == "milestone":
            leader = max(persons, key=lambda p: counters.get(p, {}).get("done", 0), default=None)
            value = counters.get(leader, {}).get("done", 0) if leader else None
        out.append({"id": aid, "icon": META[aid]["icon"], "color": META[aid]["color"], "period": META[aid]["period"],
                    "leader": leader, "value": value})
    return out
