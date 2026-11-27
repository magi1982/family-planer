"""School blocks for the school calendar and the leave / home sensors (same rules as the planner card)."""
import importlib.util
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

_base = Path(__file__).parents[1] / "custom_components/family_planer"


def _load(name, file):
    if name in sys.modules:
        return sys.modules[name]
    spec = importlib.util.spec_from_file_location(name, _base / file)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load("fp_school", "school.py")
TZ = timezone(timedelta(hours=1))
MON = date(2026, 11, 30)  # a Monday


def ev(start, end, summary="Mathematik", location="Zimmer 12"):
    return {"start": f"{MON.isoformat()}T{start}:00+01:00", "end": f"{MON.isoformat()}T{end}:00+01:00",
            "summary": summary, "location": location}


def day(school, events, away=None, gap=0, d=MON):
    return S.day_blocks(school, S.lessons_from_events(events, TZ), d, TZ, away, gap, "Schule")


def hm(x):
    return x.strftime("%H:%M")


def test_calendar_lessons_split_at_lunch_with_leave_and_home():
    events = [ev("07:50", "08:35"), ev("08:40", "11:45", "Deutsch", "Zimmer 3"), ev("13:30", "15:10", "Turnen", "Halle")]
    bl = day({"travel": 15}, events)
    assert [(hm(b["leave"]), hm(b["start"]), hm(b["end"]), hm(b["home"])) for b in bl] == [
        ("07:35", "07:50", "11:45", "12:00"), ("13:15", "13:30", "15:10", "15:25")]
    assert len(bl[0]["lessons"]) == 2
    text = S.describe(bl[0], "de", 15)
    assert text.splitlines()[0] == "los 07:35 · zuhause 12:00"
    assert "07:50–08:35 Mathematik · Zimmer 12" in text and "08:40–11:45 Deutsch · Zimmer 3" in text
    assert S.describe(bl[0], "en", 15).startswith("leave 07:35 · home 12:00")
    assert S.location(bl[0]) == ""  # rooms differ
    assert S.location(bl[1]) == "Halle"


def test_short_breaks_stay_in_one_block_and_gap_setting_wins():
    events = [ev("07:50", "11:45"), ev("12:15", "15:00")]  # 30 min break
    assert len(day({"travel": 10}, events)) == 1
    assert len(day({"travel": 10}, events, gap=20)) == 2  # own setting: split from 20 min
    assert S.gap_minutes(0, 0) == 45 and S.gap_minutes(0, 40) == 95 and S.gap_minutes(30, 40) == 30


def test_no_travel_time_means_leave_equals_start_and_no_leave_line():
    bl = day({"travel": 0}, [ev("08:00", "12:00")])
    assert bl[0]["leave"] == bl[0]["start"] and bl[0]["home"] == bl[0]["end"]
    assert S.describe(bl[0], "de", 0) == "08:00–12:00 Mathematik · Zimmer 12"


def test_fixed_times_when_calendar_has_no_lessons_that_day():
    school = {"times": {"1": [["07:45", "11:50"], ["13:30", "15:05"]]}, "travel": 20}
    bl = day(school, [])
    assert [(hm(b["leave"]), hm(b["home"])) for b in bl] == [("07:25", "12:10"), ("13:10", "15:25")]
    assert day(school, [], d=MON + timedelta(days=1)) == []  # Tuesday: nothing set


def test_all_day_events_are_ignored_and_holidays_have_no_school():
    events = [{"start": MON.isoformat(), "end": (MON + timedelta(days=1)).isoformat(), "summary": "Sporttag"},
              ev("08:00", "12:00")]
    assert len(day({"travel": 0}, events)) == 1
    assert day({"travel": 0}, events, away={MON.isoformat()}) == []


def test_bad_events_never_break_anything():
    events = [{"start": "kaputt", "end": "x"}, {"start": None, "end": None}, ev("10:00", "09:00"), {}]
    assert day({"travel": 5}, events) == []


def test_range_blocks_and_next_block():
    school = {"times": {str(i): [["08:00", "12:00"]] for i in range(1, 6)}, "travel": 10}
    start = datetime(2026, 11, 30, 0, 0, tzinfo=TZ)
    bl = S.range_blocks(school, [], start, start + timedelta(days=7), TZ, set(), 0, "Schule")
    assert len(bl) == 5  # Monday to Friday
    # range is capped (calendar cards may ask for long ranges)
    long = S.range_blocks(school, [], start, start + timedelta(days=400), TZ, set(), 0, "Schule")
    assert len(long) <= S.MAX_DAYS
    now = datetime(2026, 11, 30, 7, 55, tzinfo=TZ)  # after leaving, before school starts
    assert hm(S.next_block(bl, now, "leave")["leave"]) == "07:50" and S.next_block(bl, now, "leave")["start"].day == 1
    assert S.next_block(bl, now, "home")["start"].day == 30
    assert S.next_block(bl, now, "end")["start"].day == 30
    assert S.next_block([], now, "end") is None


def test_utc_events_are_shown_in_local_time():
    events = [{"start": "2026-11-30T07:00:00Z", "end": "2026-11-30T10:00:00Z", "summary": "Englisch"}]
    bl = day({"travel": 0}, events)
    assert (hm(bl[0]["start"]), hm(bl[0]["end"])) == ("08:00", "11:00")
