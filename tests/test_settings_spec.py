"""Settings page validation (settings_spec) – untrusted input from the browser."""
import importlib
import pathlib
import sys
import types

import pytest

_dir = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
_pkg = types.ModuleType("fpkg")
_pkg.__path__ = [str(_dir)]  # package without running __init__ (no Home Assistant needed)
sys.modules.setdefault("fpkg", _pkg)
S = importlib.import_module("fpkg.settings_spec")


def test_general_clamps_and_flags():
    cur = {"modules": {"week": True, "lists": True}, "panel": {"enabled": True, "title": ""}, "rollover_time": "00:00"}
    patch, flags = S.general({"theme": "evil", "language": "fr", "idle_seconds": 99999, "rollover_time": "03:00",
                              "reliability_days": 1, "panel_title": "<b>x</b>" * 20}, cur)
    assert patch["theme"] == "loxone" and patch["language"] == "auto"
    assert patch["idle_seconds"] == 600 and patch["reliability_days"] == 7
    assert len(patch["panel"]["title"]) <= 40
    assert patch["rollover_time"] == "03:00" and {"reload", "rollover"} <= flags
    assert patch["fullscreen_dblclick"] is True and patch["fullscreen_auto"] is False


def test_general_needs_a_module():
    with pytest.raises(S.SettingsError):
        S.general({"modules": {"week": False, "lists": False}}, {"modules": {}})


def test_no_reload_for_cosmetic_changes():
    cur = {"modules": {"week": True, "lists": True}, "panel": {"enabled": True, "title": ""}, "rollover_time": "00:00"}
    _patch, flags = S.general({"theme": "nord", "language": "de"}, cur)
    assert "reload" not in flags


def test_announce_requires_target():
    with pytest.raises(S.SettingsError) as err:
        S.announce({"enabled": True, "motion": ["binary_sensor.hall"]}, {}, {})
    assert err.value.key == "no_target"
    patch, _ = S.announce({"enabled": True, "motion": ["binary_sensor.hall", "light.x"], "notify": ["notify.alexa"],
                           "persons": ["p1", "hacker"]}, {}, {"p1": {}})
    assert patch["announce"]["motion"] == ["binary_sensor.hall"] and patch["announce"]["persons"] == ["p1"]


def test_vacation_words_and_scope():
    patch, flags = S.vacation({"words": "Ferien; Urlaub, ,OOO", "scope": "x", "refresh_minutes": 60},
                              {"words": [], "scope": "owner", "refresh_minutes": 30})
    assert patch["vacation"]["words"] == ["Ferien", "Urlaub", "OOO"] and patch["vacation"]["scope"] == "owner"
    assert "reload" in flags


def test_points_and_entities():
    patch, _ = S.points({"mode": "per_chore", "day_points": 5000, "reward_notify": ["notify.phone", "script.x"]},
                        {"default_points": 10, "day_points": 30, "day_bonus": 5, "streak_bonus": 20}, "fair", [])
    assert patch["gamification"]["mode"] == "per_chore" and patch["gamification"]["day_points"] == 1000
    assert patch["reward_notify"] == ["notify.phone"]


def test_school_blocks():
    out = S.school({"calendar": "calendar.school", "times": {"1": [["07:50", "11:45"], ["13:30", "15:10"]], "9": [["1", "2"]]},
                    "travel": 15})
    assert out["times"] == {"1": [["07:50", "11:45"], ["13:30", "15:10"]]} and out["travel"] == 15
    with pytest.raises(S.SettingsError):
        S.school({"times": {"1": [["10:00", "09:00"]]}})
    with pytest.raises(S.SettingsError):
        S.school({"times": {"2": [["08:00", "12:00"], ["11:00", "13:00"]]}})


def test_pin_rules():
    assert S.pin_valid("4711") and S.pin_valid("12345678")
    assert not S.pin_valid("123456")  # start PIN cannot be chosen again
    assert not S.pin_valid("12a4") and not S.pin_valid("123") and not S.pin_valid(None)


def test_todo_settings():
    patch, _ = S.todos({"confirm": False, "size": "xl", "keep_days": 99}, {})
    assert patch["todos"] == {"confirm": False, "size": "s", "keep_days": 30}  # unknown size falls back
    patch, _ = S.todos({"size": "l"}, {"size": "m"})
    assert patch["todos"]["size"] == "l"


def test_reward_value_and_currency():
    game = {"default_points": 10, "day_points": 30, "day_bonus": 5, "streak_bonus": 20}
    patch, _ = S.points({"reward_value": "17,5", "currency": "<b>EUR</b>"}, game, "fair", [])
    assert patch["reward_value"] == 17.5 and "<" not in patch["currency"]
    patch, _ = S.points({"reward_value": "nan"}, game, "fair", [], 20, "CHF")
    assert patch["reward_value"] == 20 and patch["currency"] == "CHF"
    patch, _ = S.points({"reward_value": -3}, game, "fair", [])
    assert patch["reward_value"] == 0
