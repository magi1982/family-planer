"""Statistics page (stats.py)."""
import importlib
import pathlib
import sys
import types
from datetime import date

_dir = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
_pkg = types.ModuleType("fpkg")
_pkg.__path__ = [str(_dir)]
sys.modules.setdefault("fpkg", _pkg)
ST = importlib.import_module("fpkg.stats")
AW = importlib.import_module("fpkg.awards")

TODAY = date(2026, 11, 17)


def _data():
    h = {
        "2026-11-16": {"a": {"done": 2, "total": 3, "missed": ["Altpapier"], "titles": ["Tisch decken", "Zimmer"], "hours": [7, 19]},
                       "b": {"done": 1, "total": 1, "missed": [], "titles": ["Katze"], "hours": [16]}},
        "2026-11-15": {"a": {"done": 2, "total": 2, "missed": [], "titles": ["Tisch decken", "Tisch decken"], "hours": [18, 18]},
                       "b": {"done": 1, "total": 1, "missed": [], "titles": ["Katze"], "hours": [8]}},
        "2026-11-14": {"a": {"done": 1, "total": 1, "missed": [], "titles": ["Zimmer"], "hours": [12]},
                       "b": {"done": 0, "total": 1, "missed": ["Katze"], "titles": [], "hours": []}},
    }
    items = {"i1": {"person_id": "a", "title": "Tisch decken", "start": "2026-11-17", "due": "2026-11-17", "done": True,
                    "done_at": "2026-11-17T07:30:00"},
             "i2": {"person_id": "a", "title": "Zimmer", "start": "2026-11-17", "due": "2026-11-17", "done": False}}
    ledger = [{"pid": "a", "pts": 30, "kind": "chore", "ts": "2026-11-16T19:00", "text": "Tisch decken"},
              {"pid": "a", "pts": 40, "kind": "sonder", "ts": "2026-11-16T10:00", "text": "⭐ Kuchen"},
              {"pid": "a", "pts": 50, "kind": "award", "ts": "2026-11-16T06:00", "text": "crown", "ref": "award:crown:2026-11-09:a"},
              {"pid": "a", "pts": -60, "kind": "reward", "ts": "2026-11-15T12:00", "text": "Kino"},
              {"pid": "a", "pts": 10, "kind": "carry", "ts": "2026-08-01T00:00", "text": ""}]
    return {"history": h, "items": items, "ledger": ledger, "persons": {"a": {}, "b": {}}}


def test_log_add_remove_and_trim():
    d = {}
    ST.log(d, "todo:1", {"k": "todo", "pid": "a", "t": "Hausaufgaben", "src": "Schule", "h": 17}, TODAY)
    ST.log(d, "sonder:x", {"k": "sonder", "pid": "a", "t": "Kuchen backen", "h": 10}, TODAY)
    assert len(d["stats_log"]) == 2
    ST.log(d, "todo:1", None, TODAY)  # undone
    assert list(d["stats_log"]) == ["sonder:x"]
    d["stats_log"]["old"] = {"k": "todo", "pid": "a", "day": "2026-01-01"}
    ST.log(d, "todo:2", {"k": "todo", "pid": "a"}, TODAY)
    assert "old" not in d["stats_log"]


def test_person_counts_types_points_and_heat():
    d = _data()
    ST.log(d, "todo:1", {"k": "todo", "pid": "a", "t": "Hausaufgaben", "src": "Schule", "h": 17}, TODAY)
    ST.log(d, "sonder:x", {"k": "sonder", "pid": "a", "t": "Kuchen backen", "h": 10}, TODAY)
    p = ST.person(d, "a", TODAY, "w", False, "20:00")
    assert (p["done"], p["total"]) == (6, 7)  # history 5/6 + today 1 done (the open one does not count yet)
    assert p["vol"] == 1 and p["todos"] == 1
    assert p["types"]["chore"][0] == ["Tisch decken", 4]
    assert p["types"]["todo"] == [["Schule", 1]] and p["types"]["sonder"] == [["Kuchen backen", 1]]
    assert p["miss"] == [["Altpapier", 1]]
    assert dict(p["sources"]) == {"chore": 30, "sonder": 40, "award": 50} and p["earned"] == 120 and p["spent"] == 60
    assert p["spent_items"] == ["Kino"]
    assert all(f["kind"] != "carry" for f in p["feed"])
    assert p["week"][-1] == [1, 2] and p["week"][-2] == [2, 3]
    assert len(p["heat"]) == 84 and p["heat"][-1] == 0 and p["heat"][-2] == 1 and p["heat"][-3] == 0 and p["heat"][0] == -1
    assert p["tod"] == [3, 2, 3]  # morning 7, 7 (today), 10 · afternoon 12, 17 · evening 19, 18, 18
    assert p["streak"] == 0 and p["best"] == 2


def test_reliability_only_counts_assigned_chores():
    d = _data()
    for i in range(5):
        ST.log(d, f"sonder:{i}", {"k": "sonder", "pid": "b", "t": "X"}, TODAY)
    p = ST.person(d, "b", TODAY, "w", False, "20:00")
    assert (p["done"], p["total"]) == (2, 3) and p["rel"] == 67  # special chores never change it


def test_family_matrix_streak_and_awards():
    d = _data()
    st = AW._state(d)  # first run takes the wins from the ledger
    assert st["wins"]["award:crown:2026-11-09:a"]["aid"] == "crown"
    AW.log_win(st, "award:bee:2026-11-09:b", "b", "bee", TODAY)
    AW.log_win(st, "award:bee:2026-11-09:b", "b", "bee", TODAY)  # idempotent
    f = ST.family(d, ["a", "b"], TODAY, "m", False, "20:00")
    assert f["awards"] == 2 and f["awards_all"] == 2
    tisch = dict(f["rows"]["chore"])["Tisch decken"]
    assert tisch == {"a": 4}
    assert dict(f["rows"]["chore"])["Katze"] == {"b": 2}
    assert f["all_done"] == 0 and f["all_done_best"] == 1  # only the 15th was complete for both


def test_ontime_only_from_recorded_days():
    d = _data()
    p = ST.person(d, "a", TODAY, "w", False, "20:00")
    assert p["ontime"] is None  # old records without times: no number instead of a wrong 0 %
    d["history"]["2026-11-16"]["a"]["due_times"] = ["07:00", "21:00"]
    p = ST.person(d, "a", TODAY, "w", False, "20:00")
    assert p["ontime"] == 33  # 1 of 3 chores that day in time
