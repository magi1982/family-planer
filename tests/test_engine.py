"""Unit tests for the pure chore engine."""
from datetime import date, timedelta
import importlib.util
from pathlib import Path

_sspec = importlib.util.spec_from_file_location(
    "fp_schedule", Path(__file__).parents[1] / "custom_components/family_planer/schedule.py")
schedule = importlib.util.module_from_spec(_sspec)
import sys; sys.modules["fp_schedule"] = schedule
_sspec.loader.exec_module(schedule)
_spec = importlib.util.spec_from_file_location(
    "fp_engine", Path(__file__).parents[1] / "custom_components/family_planer/engine.py")
engine = importlib.util.module_from_spec(_spec)
import sys; sys.modules["fp_engine"] = engine
_spec.loader.exec_module(engine)

WED = date(2026, 11, 4)  # Wednesday
PERSONS = {"p1": {"name": "Lea"}, "p2": {"name": "Mia"}}


def base():
    return {"persons": dict(PERSONS), "chores": {}, "items": {}, "history": {}}


def test_daily_and_weekday_generation():
    d = base()
    d["chores"]["c1"] = {"title": "Tisch decken", "assign": {"p1": {str(i): {} for i in range(1, 8)}}}
    d["chores"]["c2"] = {"title": "Altpapier", "assign": {"p2": {"2": {}}}}  # Tuesday only
    engine.rollover(d, WED)
    titles = sorted((it["person_id"], it["title"]) for it in d["items"].values())
    assert titles == [("p1", "Tisch decken")]


def test_idempotent():
    d = base()
    d["chores"]["c1"] = {"title": "A", "assign": {"p1": {"3": {}}}}
    engine.rollover(d, WED)
    assert engine.rollover(d, WED) is False
    assert len(d["items"]) == 1


def test_multiple_persons_same_chore():
    d = base()
    d["chores"]["c1"] = {"title": "Zimmer", "assign": {"p1": {"3": {}}, "p2": {"3": {}}}}
    engine.rollover(d, WED)
    assert sorted(it["person_id"] for it in d["items"].values()) == ["p1", "p2"]


def test_rhythm_every_two_weeks():
    d = base()
    off = engine.week_index(WED) % 2
    d["chores"]["c1"] = {"title": "Ratten", "assign": {"p1": {"3": {"every": 2, "offset": off}}}}
    d["chores"]["c2"] = {"title": "Andere Woche", "assign": {"p1": {"3": {"every": 2, "offset": (off + 1) % 2}}}}
    engine.rollover(d, WED)
    assert [it["title"] for it in d["items"].values()] == ["Ratten"]
    d2 = base(); d2["chores"] = d["chores"]
    engine.rollover(d2, WED + timedelta(days=7))
    assert [it["title"] for it in d2["items"].values()] == ["Andere Woche"]


def test_window_keeps_item_until_due_then_counts_missed_on_due_date():
    d = base()
    d["chores"]["c1"] = {"title": "Zimmer", "assign": {"p1": {"3": {"window": 4}}}}
    engine.rollover(d, WED)
    (iid, it), = d["items"].items()
    assert it["due"] == "2026-11-07"
    for i in range(1, 4):  # Thu..Sat still open, not archived
        engine.rollover(d, WED + timedelta(days=i))
        assert iid in d["items"]
        assert engine.active_items(d["items"], "p1", WED + timedelta(days=i))
    engine.rollover(d, date(2026, 11, 8))  # Sunday -> archived on Saturday
    assert iid not in d["items"]
    assert d["history"]["2026-11-07"]["p1"] == {"done": 0, "total": 1, "missed": ["Zimmer"]}


def test_done_items_counted_as_done():
    d = base()
    d["chores"]["c1"] = {"title": "A", "assign": {"p1": {"3": {}}}}
    engine.rollover(d, WED)
    next(iter(d["items"].values()))["done"] = True
    engine.rollover(d, WED + timedelta(days=1))
    assert d["history"]["2026-11-04"]["p1"] == {"done": 1, "total": 1, "missed": []}


def test_plan_change_removes_open_and_keeps_done():
    d = base()
    d["chores"]["c1"] = {"title": "A", "assign": {"p1": {"3": {}}}}
    d["chores"]["c2"] = {"title": "B", "assign": {"p1": {"3": {}}}}
    engine.rollover(d, WED)
    for it in d["items"].values():
        if it["title"] == "B":
            it["done"] = True
    d["chores"]["c1"]["assign"]["p1"] = {}
    d["chores"]["c2"]["assign"]["p1"] = {}
    engine.rollover(d, WED)
    assert [it["title"] for it in d["items"].values()] == ["B"]


def test_rename_follows_for_open_items():
    d = base()
    d["chores"]["c1"] = {"title": "Alt", "assign": {"p1": {"3": {}}}}
    engine.rollover(d, WED)
    d["chores"]["c1"]["title"] = "Neu"
    engine.rollover(d, WED)
    assert next(iter(d["items"].values()))["title"] == "Neu"


def test_stats_and_start_bonus():
    d = base()
    s = engine.person_stats(d["history"], d["items"], "p1", WED)
    assert s["reliability"] == 100 and s["start_bonus"]
    d["history"] = {"2026-11-03": {"p1": {"done": 1, "total": 2, "missed": ["x"]}},
                    "2026-11-02": {"p1": {"done": 2, "total": 2, "missed": []}}}
    s = engine.person_stats(d["history"], d["items"], "p1", WED)
    assert s["reliability"] == 75 and s["week"] == [3, 4] and s["streak"] == 0


def test_streak_and_awards():
    hist = {}
    for i in range(1, 8):
        day = (WED - timedelta(days=i)).isoformat()
        hist[day] = {"p1": {"done": 2, "total": 2, "missed": []}, "p2": {"done": 1, "total": 2, "missed": ["y"]}}
    stats = {p: engine.person_stats(hist, {}, p, WED) for p in PERSONS}
    assert stats["p1"]["streak"] == 7
    aw = engine.awards(stats)
    ids1 = {a["id"] for a in aw["p1"]}
    assert {"crown", "trophy", "bee", "perfect", "streak"} <= ids1
    assert not any(a["id"] == "crown" for a in aw["p2"])


def test_history_trim():
    d = base()
    d["history"] = {"2020-01-01": {"p1": {"done": 1, "total": 1, "missed": []}}}
    engine.rollover(d, WED)
    assert d["history"] == {}


def test_validate_chore():
    c = engine.validate_chore({"title": "  X ", "assign": {"p1": {"3": {"every": 0, "window": 99}, "9": {}}, "zz": {"1": {}}}}, PERSONS)
    assert c == {"title": "X", "assign": {"p1": {"3": {"every": 1, "offset": 0, "window": 14}}}}


def test_fair_mode_counts_days_not_chores():
    """Fair mode: 2 of 2 chores per day is as good as 6 of 6; the person with more chores gets no head start."""
    hist = {}
    for i in range(1, 8):
        day = (WED - timedelta(days=i)).isoformat()
        hist[day] = {"p1": {"done": 2, "total": 2, "missed": []},           # few chores, always all done
                     "p2": {"done": 6 if i > 1 else 3, "total": 6, "missed": []}}  # many chores, one half day
    unfair = {p: engine.person_stats(hist, {}, p, WED) for p in PERSONS}
    fair = {p: engine.person_stats(hist, {}, p, WED, fair=True) for p in PERSONS}
    # counting chores, p2 is the busy bee (39 vs 14 chores)
    assert any(a["id"] == "bee" for a in engine.awards(unfair)["p2"])
    # counting days, p1 has 7 complete days, p2 only 6.5 – p1 gets crown and bee
    assert fair["p1"]["week_fair"] == [7.0, 7] and fair["p2"]["week_fair"] == [6.5, 7]
    aw = engine.awards(fair, fair=True)
    assert {"crown", "bee"} <= {a["id"] for a in aw["p1"]}
    assert not any(a["id"] in ("crown", "bee") for a in aw["p2"])
    assert fair["p2"]["reliability"] == 93  # average of the daily rates (6.5 / 7)
    assert unfair["p2"]["reliability"] == 93  # 39 / 42 – same here, but weighted by chores


def test_fair_today_counts_only_when_complete():
    items = {"a": {"person_id": "p1", "title": "x", "done": True, "start": WED.isoformat(), "due": WED.isoformat()},
             "b": {"person_id": "p1", "title": "y", "done": False, "start": WED.isoformat(), "due": WED.isoformat()}}
    s = engine.person_stats({}, items, "p1", WED, fair=True)
    assert s["week_fair"] == [0.0, 0] and s["reliability"] == 100
    items["b"]["done"] = True  # day complete -> counts as one full day
    assert engine.person_stats({}, items, "p1", WED, fair=True)["week_fair"] == [1.0, 1]
