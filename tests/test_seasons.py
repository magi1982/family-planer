"""Seasons, holidays, school holidays and birthdays (seasons.py)."""
import importlib
import pathlib
import sys
import types
from datetime import date

_dir = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
_pkg = types.ModuleType("fpkg")
_pkg.__path__ = [str(_dir)]
sys.modules.setdefault("fpkg", _pkg)
S = importlib.import_module("fpkg.seasons")


def test_easter_and_advent():
    assert S.easter(2026) == date(2026, 4, 5)
    assert S.easter(2027) == date(2027, 3, 28)
    assert S.advent(2026, 1) == date(2026, 11, 29)
    assert S.advent(2026, 4) == date(2026, 12, 20)
    assert S.nth_sunday(2026, 5, 2) == date(2026, 5, 10)  # Muttertag


def test_jahreszeit():
    assert S.jahreszeit(date(2026, 4, 1)) == "fruehling"
    assert S.jahreszeit(date(2026, 7, 1)) == "sommer"
    assert S.jahreszeit(date(2026, 10, 1)) == "herbst"
    assert S.jahreszeit(date(2026, 1, 15)) == "winter"


def test_ferien_titles():
    assert S.ferien_kind("🏖️ Sommerferien") == "ferien_sommer"
    assert S.ferien_kind("Frühlingsferie") == "ferien_fruehling"
    assert S.ferien_kind("Sportferien Lea") == "ferien_sport"
    assert S.ferien_kind("Zahnarzt") is None
    r = S.ferien_ranges([{"summary": "Herbstferien", "start": "2026-10-03", "end": "2026-10-19"},
                         {"summary": "Herbstferien", "start": "2026-10-03", "end": "2026-10-19"},
                         {"summary": "Bad", "start": "x", "end": "y"}])
    assert r == [{"key": "ferien_herbst", "start": "2026-10-03", "end": "2026-10-18"}]


def test_christmas_starts_first_advent_and_snows():
    assert S.resolve({}, date(2026, 11, 28))["vis"] != "weihnachten"
    s = S.resolve({}, date(2026, 11, 29))
    assert s["vis"] == "weihnachten" and s["advent"] == 1 and s["snow"] is True and s["sub"] == "advent1"
    assert S.resolve({}, date(2026, 12, 6))["sub"] == "samichlaus"
    assert S.resolve({}, date(2026, 12, 13))["advent"] == 3
    assert S.resolve({}, date(2026, 12, 24))["sub"] == "heiligabend"
    assert S.resolve({"christmas_start": "dec1"}, date(2026, 11, 30))["vis"] != "weihnachten"


def test_lead_days_for_one_day_events():
    assert S.resolve({}, date(2026, 7, 29))["key"] == "august"
    assert S.resolve({}, date(2026, 7, 28))["key"] != "august"
    assert S.resolve({"lead_day": 0}, date(2026, 7, 31))["key"] != "august"
    assert S.resolve({"events": {"august": {"on": False}}}, date(2026, 8, 1))["key"] != "august"


def test_school_holidays_and_schulanfang():
    fer = [{"key": "ferien_sommer", "start": "2026-07-04", "end": "2026-08-09"}]
    assert S.resolve({}, date(2026, 7, 2), fer)["key"] == "ferien_sommer"
    assert S.resolve({}, date(2026, 7, 20), fer)["vis"] == "sommer"
    assert S.resolve({}, date(2026, 8, 1), fer)["key"] == "august"  # holiday beats school holidays
    assert S.resolve({}, date(2026, 8, 10), fer)["key"] == "schulanfang"


def test_birthday_wins_and_ages():
    persons = {"p1": {"birthday": "2016-08-01"}, "p2": {"birthday": "03-02"}}
    s = S.resolve({}, date(2026, 8, 1), None, persons)
    assert s["key"] == "geburtstag" and s["birthdays"] == ["p1"] and s["ages"] == {"p1": 10}
    assert S.resolve({}, date(2026, 7, 31), None, persons)["birthdays"] == []
    s = S.resolve({"priority": ["holiday", "person"]}, date(2026, 8, 1), None, persons)
    assert s["key"] == "august" and s["birthdays"] == ["p1"]


def test_anniversary():
    s = S.resolve({"wedding": "2012-06-09"}, date(2026, 6, 9))
    assert s["key"] == "hochzeitstag" and s["anniversary"] == {"key": "hochzeitstag", "years": 14}


def test_clean_settings_rejects_junk():
    c = S.clean_settings({"lead_day": 999, "weather": "sensor.x", "intensity": "evil", "priority": ["x", "season"],
                          "events": {"nope": {}, "fasnacht": {"on": 0, "lead": -5}}, "wedding": "2012-13-40"})
    assert c["lead_day"] == 30 and c["weather"] is None and c["intensity"] == "normal"
    assert c["priority"][0] == "season" and len(c["priority"]) == len(S.KINDS)
    assert c["events"] == {"fasnacht": {"on": False, "lead": 0}} and c["wedding"] == ""
    assert S.clean_date("05-17") == "05-17" and S.clean_date("<script>") == ""


def test_upcoming_lists_events():
    up = S.upcoming({}, date(2026, 11, 15))
    keys = [u["key"] for u in up]
    assert "advent" in keys and "silvester" in keys


def test_house_setting():
    assert S.clean_settings({"house": "pool"})["house"] == "pool"
    assert S.clean_settings({"house": "<x>"})["house"] == "standard"


def test_away_badge():
    V = importlib.import_module("fpkg.vacation")
    days = {"2026-11-16": "trip", "2026-11-17": "trip", "2026-11-18": "trip"}
    assert V.badge(days, date(2026, 11, 15)) == {"state": "tomorrow", "kind": "trip"}
    assert V.badge(days, date(2026, 11, 16)) == {"state": "now", "until": "2026-11-18", "kind": "trip"}
    assert V.badge(days, date(2026, 11, 19)) is None
    assert V.badge({"2026-07-01": "holiday"}, date(2026, 7, 1))["kind"] == "holiday"


def test_away_badge_with_times():
    from datetime import datetime, timedelta, timezone
    V = importlib.import_module("fpkg.vacation")
    tz = timezone(timedelta(hours=1))
    trip = [{"start": "2026-11-15T15:00:00+01:00", "end": "2026-11-17T23:30:00+01:00", "kind": "trip"}]
    at = lambda d, h, m=0: datetime(2026, 11, d, h, m, tzinfo=tz)  # noqa: E731
    assert V.badge_at(trip, at(14, 9)) == {"state": "tomorrow", "at": "15:00", "kind": "trip"}
    assert V.badge_at(trip, at(15, 10)) == {"state": "today", "at": "15:00", "kind": "trip"}
    assert V.badge_at(trip, at(15, 16)) == {"state": "now", "until": "2026-11-17T23:30+01:00", "allday": False, "kind": "trip"}
    assert V.badge_at(trip, at(18, 0)) is None
    ferien = [{"start": "2026-07-04", "end": "2026-07-12", "kind": "holiday"}]
    assert V.badge_at(ferien, datetime(2026, 7, 3, 12, tzinfo=tz))["at"] is None
    assert V.badge_at(ferien, datetime(2026, 7, 6, 12, tzinfo=tz))["until"] == "2026-07-11"
    assert V.next_change({"m": trip}, at(15, 10)) == at(15, 15)
    ev = {"summary": "Sam Paris", "start": "2026-11-15T15:00:00+01:00", "end": "2026-11-17T23:30:00+01:00"}
    P = {"m": {"name": "Sam"}}
    assert V.absence_spans({"m": [ev]}, P, V.DEFAULT_WORDS, "owner", 20) == {}  # long event: only once confirmed
    key = V.found({"m": [ev]}, P, V.DEFAULT_WORDS, "owner", 20, long_events=True)[0]["key"]
    assert V.absence_spans({"m": [ev]}, P, V.DEFAULT_WORDS, "owner", 20, {key: "away"})["m"][0]["kind"] == "trip"
