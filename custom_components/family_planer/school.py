"""School days as blocks (no Home Assistant imports, unit-testable).

Same rules as the planner card: lessons come from the school calendar (timed events only), otherwise from the
fixed times per weekday. A long break (time to go home and back) splits the day into blocks, e.g. morning and
afternoon with lunch at home. Every block knows when to leave and when the person is home again (travel time).
On days the person is away (holidays) there is no school.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta, tzinfo

MAX_DAYS = 100  # longest range a calendar card may ask for at once


def gap_minutes(setting: int, travel: int) -> int:
    """Break from which the day is split: the setting, or automatically twice the travel time plus 15 (min. 45)."""
    return setting if setting and setting > 0 else max(45, 2 * travel + 15)


def _parse(value, tz: tzinfo) -> tuple[datetime | None, bool]:
    """Calendar value -> (aware local datetime, all_day)."""
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, date):
        return datetime.combine(value, time(), tz), True
    else:
        text = str(value or "")
        if len(text) == 10:
            try:
                return datetime.combine(date.fromisoformat(text), time(), tz), True
            except ValueError:
                return None, False
        try:
            dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None, False
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=tz)
    return dt.astimezone(tz), False


def lessons_from_events(events: list[dict], tz: tzinfo) -> dict[date, list[dict]]:
    """Timed events of the school calendar grouped by local day; all-day events (holidays, notes) are ignored."""
    out: dict[date, list[dict]] = {}
    for ev in events or []:
        s, all_day = _parse(ev.get("start"), tz)
        e, _ = _parse(ev.get("end"), tz)
        if all_day or s is None or e is None or e <= s:
            continue
        out.setdefault(s.date(), []).append({
            "title": str(ev.get("summary") or "")[:120], "start": s, "end": e,
            "location": str(ev.get("location") or "")[:120]})
    return out


def fixed_lessons(school: dict, day: date, tz: tzinfo, label: str) -> list[dict]:
    spans = (school.get("times") or {}).get(str(day.isoweekday())) or []
    out = []
    for a, b in spans:
        ha, ma = (int(x) for x in a.split(":"))
        hb, mb = (int(x) for x in b.split(":"))
        out.append({"title": label, "start": datetime.combine(day, time(ha, ma), tz),
                    "end": datetime.combine(day, time(hb, mb), tz), "location": ""})
    return out


def blocks(lessons: list[dict], travel: int, gap: int) -> list[dict]:
    """Merge lessons into blocks; leave = start - travel, home = end + travel."""
    out: list[dict] = []
    for les in sorted(lessons, key=lambda x: x["start"]):
        last = out[-1] if out else None
        if last and (les["start"] - last["end"]).total_seconds() / 60 < gap:
            last["end"] = max(last["end"], les["end"])
            last["lessons"].append(les)
        else:
            out.append({"start": les["start"], "end": les["end"], "lessons": [les]})
    for bk in out:
        bk["leave"] = bk["start"] - timedelta(minutes=travel)
        bk["home"] = bk["end"] + timedelta(minutes=travel)
    return out


def day_blocks(school: dict, lessons_by_day: dict[date, list[dict]], day: date, tz: tzinfo,
               away: set[str] | None, gap_setting: int, label: str) -> list[dict]:
    if day.isoformat() in (away or set()):
        return []
    lessons = lessons_by_day.get(day) or fixed_lessons(school, day, tz, label)
    travel = int(school.get("travel") or 0)
    return blocks(lessons, travel, gap_minutes(gap_setting, travel))


def range_blocks(school: dict, events: list[dict], start: datetime, end: datetime, tz: tzinfo,
                 away: set[str] | None, gap_setting: int, label: str) -> list[dict]:
    """All blocks that overlap [start, end), at most MAX_DAYS days."""
    start, end = start.astimezone(tz), end.astimezone(tz)
    end = min(end, start + timedelta(days=MAX_DAYS))
    by_day = lessons_from_events(events, tz)
    out = []
    d = start.date()
    while d <= end.date():
        out += [b for b in day_blocks(school, by_day, d, tz, away, gap_setting, label)
                if b["start"] < end and b["end"] > start]
        d += timedelta(days=1)
    return out


def describe(bk: dict, lang: str, travel: int) -> str:
    """Event description: leave / home (with travel time) and the lessons with room."""
    def hm(x: datetime) -> str:
        return x.strftime("%H:%M")

    lines = []
    if travel:
        lines.append(f"los {hm(bk['leave'])} · zuhause {hm(bk['home'])}" if lang == "de"
                     else f"leave {hm(bk['leave'])} · home {hm(bk['home'])}")
    for les in bk["lessons"]:
        what = les["title"] + (f" · {les['location']}" if les.get("location") else "")
        lines.append(f"{hm(les['start'])}–{hm(les['end'])} {what}")
    return "\n".join(lines)


def location(bk: dict) -> str:
    """Location of the block only if all its lessons share it (rooms differ: see the description)."""
    locs = {les.get("location") or "" for les in bk["lessons"]}
    return locs.pop() if len(locs) == 1 else ""


def next_block(items: list[dict], now: datetime, key: str) -> dict | None:
    """First block whose `key` time (leave / home / end) is still ahead."""
    return next((b for b in sorted(items, key=lambda x: x[key]) if b[key] > now), None)
