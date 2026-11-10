"""Tests for points, levels, rewards, PIN and input validation."""
from datetime import date, datetime
import importlib.util
import pathlib
import sys

import pytest

_base = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, _base / file)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


R = _load("fp_rewards", "rewards.py")
V = _load("fp_validate", "validate.py")
NOW = datetime(2026, 11, 6, 18, 0)
TS = NOW.isoformat()


def data():
    return {"persons": {"lea": {}, "mia": {}}, "ledger": [], "requests": {}, "history": {},
            "rewards": {"game": {"title": "30 Min Gamen", "icon": "mdi:controller", "cost": 50, "approval": True,
                                 "persons": [], "per_week": 2},
                        "ice": {"title": "Glace", "icon": "mdi:ice-cream", "cost": 20, "approval": False,
                                "persons": ["mia"], "per_week": 0}}}


def test_chore_points_are_idempotent_and_reversible():
    d = data()
    item = {"person_id": "lea", "title": "Tisch decken", "done": True}
    R.chore_done(d, "i1", item, 10, TS)
    R.chore_done(d, "i1", item, 10, TS)
    assert R.balance(d["ledger"], "lea") == 10
    item["done"] = False
    R.chore_done(d, "i1", item, 10, TS)
    assert R.balance(d["ledger"], "lea") == 0


def test_levels():
    assert R.level(0, "de")["name"] == "Starter"
    lv = R.level(300, "en")
    assert lv["level"] == 3 and lv["next"] == 500 and lv["progress"] == 20
    assert R.level(99999, "de")["next"] is None


def test_redeem_with_approval_reserves_points():
    d = data()
    R.adjust(d, "lea", 120, "Start", TS)
    req = R.redeem(d, "lea", "game", NOW)
    assert req["status"] == "pending"
    assert R.available(d, "lea") == 70 and R.balance(d["ledger"], "lea") == 120
    R.decide(d, req["id"], True, NOW)
    assert R.balance(d["ledger"], "lea") == 70
    assert R.lifetime(d["ledger"], "lea") == 120  # spending never lowers the level


def test_denied_request_frees_points_and_limits():
    d = data()
    R.adjust(d, "lea", 200, "", TS)
    q = R.redeem(d, "lea", "game", NOW)
    R.decide(d, q["id"], False, NOW)
    assert R.available(d, "lea") == 200
    R.redeem(d, "lea", "game", NOW)
    R.redeem(d, "lea", "game", NOW)
    with pytest.raises(R.RewardError, match="weekly_limit"):
        R.redeem(d, "lea", "game", NOW)


def test_reward_rules():
    d = data()
    with pytest.raises(R.RewardError, match="not_allowed"):
        R.redeem(d, "lea", "ice", NOW)
    with pytest.raises(R.RewardError, match="not_enough_points"):
        R.redeem(d, "mia", "ice", NOW)
    R.adjust(d, "mia", 20, "", TS)
    assert R.redeem(d, "mia", "ice", NOW)["status"] == "approved"  # no approval needed
    assert R.balance(d["ledger"], "mia") == 0


def test_day_and_streak_bonus():
    d = data()
    d["history"]["2026-11-05"] = {"lea": {"done": 3, "total": 3, "missed": []},
                                  "mia": {"done": 1, "total": 2, "missed": ["x"]}}
    s = {"day_bonus": 5, "streak_bonus": 20}
    R.day_bonuses(d, date(2026, 11, 5), {"lea": 7}, s, TS)
    R.day_bonuses(d, date(2026, 11, 5), {"lea": 7}, s, TS)
    assert R.balance(d["ledger"], "lea") == 25 and R.balance(d["ledger"], "mia") == 0


def test_trim_keeps_balance_and_lifetime():
    d = data()
    R.adjust(d, "lea", 100, "", "2025-01-01T00:00:00")
    d["ledger"].append({"id": "x", "pid": "lea", "pts": -40, "kind": "reward", "ref": "r", "text": "",
                        "ts": "2025-01-02T00:00:00"})
    R.adjust(d, "lea", 5, "", TS)
    R.trim(d, 365, date(2026, 11, 6))
    assert R.balance(d["ledger"], "lea") == 65 and R.lifetime(d["ledger"], "lea") == 105


def test_pin():
    h = R.hash_pin("4711")
    assert R.check_pin(h, "4711") and not R.check_pin(h, "0000") and not R.check_pin(None, "4711")
    assert not R.check_pin("garbage", "4711")


def test_validation():
    assert V.color("#AbCdEf", "#000000") == "#AbCdEf"
    assert V.color("red;background:url(x)", "#000000") == "#000000"
    assert V.image("av:k.long.blond.hell.0") and V.image("svg:frau")
    assert V.image("img:/family_planer_files/avatars/lea_" + "a" * 24 + ".jpg")
    assert V.image("img:https://evil.example/x.png") == ""
    assert V.image("img:/family_planer_files/avatars/../../secrets.yaml") == ""
    assert V.icon("mdi:cart-outline", "x") == "mdi:cart-outline" and V.icon('mdi:x" onload="', "d") == "d"
    assert V.text("A\u0000B‮ C  ", 10) == "A B C"
    assert V.entity("calendar.tom", ("calendar",)) and V.entity("todo.x", ("calendar",)) is None
    assert V.hhmm("03:30:00", "00:00") == "03:30" and V.hhmm("25:00", "00:00") == "00:00"
    assert V.aliases(["Tommy", "tommy", " ", "x" * 50]) == ["Tommy", "x" * 40]


S = _load("fp_speech", "speech.py")


def test_speech():
    msg = S.open_chores_message([("Lea", ["Tisch decken", "Abfall", "WC", "Zimmer"]), ("Mia", ["Ratten"])], "de")
    assert msg == "Hallo! Noch offen: Lea: Tisch decken, Abfall, WC und 1 weitere. Mia: Ratten."
    assert S.open_chores_message([("A", [])], "en") == ""
    assert "All chores" in S.all_done_message(["A"], "en")


# ------------------------------------------------------------------ sizes (0.7.0)
def test_size_points_round_up():
    assert R.size_points(30) == {"none": 0, "s": 10, "m": 20, "l": 30}
    assert R.size_points(31) == {"none": 0, "s": 11, "m": 21, "l": 31}  # always rounded up
    assert R.size_points(1)["s"] == 1 and R.size_points(0)["s"] == 0 and R.size_points(-5)["l"] == 0


def test_month_points_and_reward_costs():
    game = {"day_points": 30, "day_bonus": 5, "streak_bonus": 20}
    assert R.month_points(game) == 30 * 35 + 4 * 20  # 1130: every day complete for a month incl. bonuses
    costs = R.reward_costs(game)
    assert costs == {"s": 283, "m": 565, "l": 1130, "xl": 2260, "xxl": 5650}
    assert R.reward_costs({"day_points": 0, "day_bonus": 0, "streak_bonus": 0})["s"] == 1  # never free
    assert R.reward_values(20) == {"s": 5.0, "m": 10.0, "l": 20, "xl": 40, "xxl": 100}


def test_sync_reward_costs_follows_settings():
    rewards = {"a": {"title": "Kino", "size": "l", "cost": 1}, "b": {"title": "Glace", "cost": 50}}
    assert R.sync_reward_costs(rewards, {"day_points": 30, "day_bonus": 5, "streak_bonus": 20})
    assert rewards["a"]["cost"] == 1130 and rewards["b"]["cost"] == 50  # own cost stays untouched
    assert not R.sync_reward_costs(rewards, {"day_points": 30, "day_bonus": 5, "streak_bonus": 20})


# ------------------------------------------------------------------ 0.9.0: forecast pace
def test_pace_per_day_since_first_booking():
    today = date(2026, 11, 10)
    ledger = [{"pid": "a", "pts": 30, "kind": "chore", "ts": "2026-11-09T10:00"},
              {"pid": "a", "pts": 30, "kind": "chore", "ts": "2026-11-10T10:00"},
              {"pid": "a", "pts": -50, "kind": "reward", "ts": "2026-11-10T11:00"},
              {"pid": "a", "pts": 20, "kind": "award", "ts": "2026-11-10T06:00"},
              {"pid": "b", "pts": 10, "kind": "chore", "ts": "2026-10-01T10:00"}]  # older than 30 days
    p = R.pace(ledger, ["a", "b"], today)
    assert p["persons"]["a"] == 40.0  # 80 points over 2 days, spending ignored
    assert p["persons"]["b"] == 0.0 and p["family"] == 40.0
