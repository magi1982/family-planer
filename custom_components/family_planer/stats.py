"""Statistics page: who did what, how reliably, where the points come from (no HA imports, unit-tested).

Sources (all already kept by the planner):
- history (engine.py, HISTORY_DAYS): per day and person done/total, missed titles, done titles and hours
- items: today's chores (not in the history yet)
- ledger (rewards.py): every point with its kind (chore, sonder, todo, bonus, streak, award, level, adjust, reward)
- activity log (this module): to-dos and special chores ticked off, with title, list and hour
- awards state: wins ({ref: {pid, aid, day}})

Reliability only ever looks at assigned chores – special chores and to-dos never count against anyone.
"""
from __future__ import annotations

from datetime import date, timedelta

from . import awards, engine

KEEP_DAYS = 120
LOG_MAX = 6000
PERIODS = {"w": 7, "m": 30, "q": 90}
EARN = ("chore", "fair", "sonder", "todo", "bonus", "streak", "award", "level", "adjust")
SOURCE_ORDER = ("chore", "sonder", "todo", "bonus", "streak", "award", "level", "adjust")


# --------------------------------------------------------------------------------------------- activity log
def log(data: dict, ref: str, entry: dict | None, today: date) -> None:
    """Remember (entry) or forget (None) a ticked-off to-do / special chore.
    entry: {"k": "todo"|"sonder", "pid", "t": title, "src": list name, "h": hour}"""
    lg = data.setdefault("stats_log", {})
    if entry is None:
        lg.pop(ref, None)
    else:
        lg[ref] = {"k": entry.get("k"), "pid": entry.get("pid"), "t": str(entry.get("t") or "")[:80],
                   "src": str(entry.get("src") or "")[:40], "h": int(entry.get("h") or 0) % 24, "day": today.isoformat()}
    horizon = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for k in [k for k, v in lg.items() if v.get("day", "") < horizon]:
        lg.pop(k, None)
    if len(lg) > LOG_MAX:
        for k in sorted(lg, key=lambda k: lg[k].get("day", ""))[: len(lg) - LOG_MAX]:
            lg.pop(k, None)


# --------------------------------------------------------------------------------------------- helpers
def _days(today: date, n: int) -> list[str]:
    return [(today - timedelta(days=i)).isoformat() for i in range(n)]


def _today_rec(items: dict, pid: str, today: date) -> dict:
    """Today's assigned chores of a person as a history-like record (done ones count at once, open ones not yet)."""
    rec = {"done": 0, "total": 0, "missed": [], "titles": [], "hours": []}
    for _, it in engine.active_items(items, pid, today):
        rec["total"] += 1
        if it.get("done"):
            rec["done"] += 1
            rec["titles"].append(it.get("title", ""))
            at = str(it.get("done_at") or "")[11:13]
            if at.isdigit():
                rec["hours"].append(int(at))
    return rec


def _rec(data: dict, pid: str, day: str, today: date) -> dict | None:
    if day == today.isoformat():
        r = _today_rec(data.get("items", {}), pid, today)
        return r if r["total"] else None
    r = data.get("history", {}).get(day, {}).get(pid)
    return r if r and r.get("total") else None


def _missed(r: dict | None, day: str, today: date) -> int:
    """-1 = no chores that day; today's open chores are not missed yet."""
    if not r:
        return -1
    return 0 if day == today.isoformat() else max(0, r["total"] - r.get("done", 0))


def _count(xs) -> list[list]:
    out: dict[str, int] = {}
    for x in xs:
        if x:
            out[x] = out.get(x, 0) + 1
    return [[k, v] for k, v in sorted(out.items(), key=lambda kv: (-kv[1], kv[0]))]


def _streaks(flags: list[bool]) -> tuple[int, int]:
    """flags oldest -> newest: (current run at the end, longest run)."""
    best = cur = 0
    for f in flags:
        cur = cur + 1 if f else 0
        best = max(best, cur)
    return cur, best


# --------------------------------------------------------------------------------------------- per person
def person(data: dict, pid: str, today: date, per: str, fair: bool, cutoff: str) -> dict:
    n = PERIODS.get(per, 30)
    days = _days(today, n)
    prev = [(today - timedelta(days=n + i)).isoformat() for i in range(n)]
    recs = {d: _rec(data, pid, d, today) for d in days}
    t_iso = today.isoformat()
    done = sum(r["done"] for r in recs.values() if r)
    # today's open chores are not missed yet: today only counts what is done
    total = sum(r["done"] if d == t_iso else r["total"] for d, r in recs.items() if r)
    # reliability like on the planner (fair = every day weighs the same)
    rel = engine.person_stats(data.get("history", {}), data.get("items", {}), pid, today, n, fair)["reliability"]
    pd = [_rec(data, pid, d, today) for d in prev]
    p_done = sum(r["done"] for r in pd if r)
    p_total = sum(r["total"] for r in pd if r)
    rate = done / total if total else None
    p_rate = p_done / p_total if p_total else None
    trend = 0 if rate is None or p_rate is None else (1 if rate > p_rate + 0.02 else -1 if rate < p_rate - 0.02 else 0)
    # on time: only days recorded since the planner keeps the time (records with "before" / "due_times")
    timed = [r for d, r in recs.items() if r and d != t_iso and ("before" in r or "due_times" in r)]
    ontime = sum(awards.ontime_count(r, cutoff) for r in timed)
    past_total = sum(r.get("total", 0) for r in timed)
    # complete days over the whole history (streak now and record)
    hist_days = sorted(d for d in data.get("history", {}) if d < today.isoformat())
    flags = []
    for d in hist_days:
        r = data["history"][d].get(pid)
        if r and r.get("total"):
            flags.append(r.get("done") == r["total"])
    tr = _today_rec(data.get("items", {}), pid, today)
    if tr["total"] and tr["done"] == tr["total"]:
        flags.append(True)
    streak, best = _streaks(flags)
    # activity log: to-dos and special chores
    lg = [v for v in (data.get("stats_log") or {}).values() if v.get("pid") == pid and v.get("day", "") >= days[-1]]
    todos = [v for v in lg if v.get("k") == "todo"]
    sonder = [v for v in lg if v.get("k") == "sonder"]
    # points
    led = [e for e in data.get("ledger", []) if e.get("pid") == pid and str(e.get("ts", ""))[:10] >= days[-1]]
    src = {k: 0 for k in SOURCE_ORDER}
    for e in led:
        if e.get("kind") in EARN and e.get("pts", 0) > 0:
            k = "chore" if e["kind"] == "fair" else e["kind"]
            src[k] = src.get(k, 0) + int(e["pts"])
    spent = [e for e in led if e.get("kind") == "reward" and e.get("pts", 0) < 0]
    feed = sorted((e for e in data.get("ledger", []) if e.get("pid") == pid and e.get("kind") != "carry"),
                  key=lambda e: str(e.get("ts", "")), reverse=True)[:6]
    # hours: chores (history) + log
    hours = [h for r in recs.values() if r for h in r.get("hours", [])] + [v.get("h", 0) for v in lg]
    tod = [sum(1 for h in hours if h < 12), sum(1 for h in hours if 12 <= h < 18), sum(1 for h in hours if h >= 18)]
    wins = [w for w in ((data.get("awards") or {}).get("wins") or {}).values() if w.get("pid") == pid]
    return {
        "id": pid, "done": done, "total": total, "rel": rel, "ten": round(rel / 10) if total else None, "trend": trend,
        "vol": len(sonder), "todos": len(todos), "ontime": round(ontime * 100 / past_total) if past_total else None,
        "streak": streak, "best": best,
        "earned": sum(src.values()), "spent": -sum(int(e["pts"]) for e in spent),
        "spent_items": [str(e.get("text") or "")[:60] for e in spent][:6],
        "sources": [[k, v] for k, v in src.items() if v > 0],
        "award_sources": _count(e.get("text") for e in led if e.get("kind") == "award"),
        "feed": [{"pts": int(e.get("pts", 0)), "kind": e.get("kind"), "text": str(e.get("text") or "")[:60],
                  "day": str(e.get("ts", ""))[:10]} for e in feed],
        "week": [[(r or {}).get("done", 0), (r or {}).get("total", 0)] for r in (_rec(data, pid, d, today) for d in reversed(_days(today, 7)))],
        "heat": [_missed(_rec(data, pid, d, today), d, today) for d in reversed(_days(today, 84))],
        "types": {"chore": _count(t for r in recs.values() if r for t in r.get("titles", [])),
                  "sonder": _count(v.get("t") for v in sonder), "todo": _count(v.get("src") or "?" for v in todos)},
        "miss": _count(t for d, r in recs.items() if r and d != today.isoformat() for t in r.get("missed", []))[:3],
        "tod": tod,
        "awards": _count(w.get("aid") for w in wins if w.get("day", "") >= days[-1]),
        "awards_all": _count(w.get("aid") for w in wins),
    }


# --------------------------------------------------------------------------------------------- family
def family(data: dict, pids: list[str], today: date, per: str, fair: bool, cutoff: str) -> dict:
    ppl = [person(data, p, today, per, fair, cutoff) for p in pids]
    # days where everybody with chores did all of them
    flags = []
    for d in sorted(data.get("history", {})):
        if d >= today.isoformat():
            continue
        recs = [data["history"][d].get(p) for p in pids]
        recs = [r for r in recs if r and r.get("total")]
        if recs:
            flags.append(all(r.get("done") == r["total"] for r in recs))
    cur, best = _streaks(flags)
    # who did which chore how often: {title: {pid: n}}
    matrix: dict[str, dict] = {"chore": {}, "sonder": {}, "todo": {}}
    for p in ppl:
        for kind in matrix:
            for title, n in p["types"][kind]:
                matrix[kind].setdefault(title, {})[p["id"]] = n
    rows = {k: sorted(([t, v] for t, v in m.items()), key=lambda tv: (-sum(tv[1].values()), tv[0]))[:12]
            for k, m in matrix.items()}
    done = sum(p["done"] for p in ppl)
    total = sum(p["total"] for p in ppl)
    return {
        "persons": ppl, "done": done, "total": total, "ten": round(done * 10 / total) if total else None,
        "vol": sum(p["vol"] for p in ppl), "todos": sum(p["todos"] for p in ppl),
        "all_done": cur, "all_done_best": best, "rows": rows,
        "awards": sum(n for p in ppl for _, n in p["awards"]), "awards_all": sum(n for p in ppl for _, n in p["awards_all"]),
    }
