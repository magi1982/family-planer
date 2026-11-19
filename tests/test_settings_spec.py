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
    assert patch["theme"] == "ha" and patch["language"] == "auto" and patch["style"] == "standard"
    assert patch["idle_seconds"] == 600 and patch["reliability_days"] == 7
    assert len(patch["panel"]["title"]) <= 40
    assert patch["rollover_time"] == "03:00" and {"reload", "rollover"} <= flags
    assert patch["fullscreen_dblclick"] is True and patch["fullscreen_auto"] is False
    assert patch["hide_done"] is True and patch["hide_past"] == 30  # tidy "All" view by default


def test_general_tidy_all_view():
    cur = {"modules": {"week": True, "lists": True}, "panel": {}}
    patch, _ = S.general({"hide_done": False, "hide_past": 9999}, cur)
    assert patch["hide_done"] is False and patch["hide_past"] == 240
    patch, _ = S.general({}, {**cur, "hide_past": 0})
    assert patch["hide_past"] == 0  # 0 = never hide, kept when not sent
    assert S.general({"hide_past": "x"}, cur)[0]["hide_past"] == 30  # bad input: the default


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
    assert patch["todos"] == {"confirm": False, "size": "s", "keep_days": 30, "max_shown": 4, "show_age": True, "name_lists": []}  # unknown size falls back
    patch, flags = S.todos({"name_lists": ["todo.alexa", "light.x"]}, {})
    assert patch["todos"]["name_lists"] == ["todo.alexa"] and "name_lists" in flags
    assert S.todos({"max_shown": 0}, {})[0]["todos"]["max_shown"] == 1
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


def test_theme_style_migration_and_nav():
    cur = {"theme": "apple", "modules": {"week": True, "lists": True}, "panel": {}}
    patch, _ = S.general({}, cur)
    assert patch["theme"] == "dark" and patch["style"] == "standard"  # designs of 0.8 map onto the new set
    patch, _ = S.general({"theme": "space", "style": "glass"}, cur)
    assert patch["theme"] == "space" and patch["style"] == "glass"
    patch, _ = S.general({"theme": "evil", "style": "<x>"}, {**cur, "theme": "rainbow", "style": "transparent"})
    assert patch["theme"] == "rainbow" and patch["style"] == "transparent"
    assert "theme_pin" not in patch
    nav = S.clean_nav({"order": ["belohnungen", "evil", "planer"], "hidden": ["einstellungen", "listen", "x"]})
    # new buttons join right after the one they follow by default
    assert nav["order"][:2] == ["belohnungen", "statistik"] and set(nav["order"]) == set(S.NAV_IDS)
    assert nav["order"].index("planer") < nav["order"].index("listen")
    assert nav["hidden"] == ["listen"]  # settings can never be hidden
    assert S.clean_nav(None)["hidden"] == ["aemtliplan"]


def test_award_settings_in_points_section():
    game = {"default_points": 10, "day_points": 30, "day_bonus": 5, "streak_bonus": 20}
    patch, _ = S.points({"awards": {"items": {"crown": {"on": False, "size": "xl"}, "bee": {"size": "huge"}},
                                    "ontime_time": "25:00", "confetti": False}}, game, "fair", [])
    aw = patch["awards"]
    assert aw["items"]["crown"] == {"on": False, "size": "xl"}
    assert aw["items"]["bee"]["size"] == "s" and aw["items"]["bee"]["on"] is True  # invalid size -> default
    assert aw["ontime_time"] == "20:00" and aw["confetti"] is False


def test_announce_fixed_times_without_motion():
    patch, _ = S.announce({"enabled": True, "notify": ["notify.alexa"], "times": "18:30, 12:30, 99:00, x"}, {}, {})
    a = patch["announce"]
    assert a["times"] == ["12:30", "18:30"] and a["fixed"] and a["evening_time"] == "18:15"
    assert a["birthday_times"] == ["07:00", "12:15", "15:30", "18:15", "19:30"]
    b = S.announce({"enabled": True, "notify": ["notify.alexa"], "birthday_times": "19:30, 07:00, x"}, {}, {})[0]["announce"]
    assert b["birthday_times"] == ["07:00", "19:30"]
    with pytest.raises(S.SettingsError):
        S.announce({"enabled": True, "notify": ["notify.alexa"], "fixed": False}, {}, {})


def test_seasons_and_sonder_sections():
    patch, flags = S.seasons({"weather": "weather.home", "pool": "light.x", "jacuzzi": "sensor.tub", "lead_day": 5,
                              "wedding": "2012-06-09", "sug_from": "nope"}, {})
    se = patch["seasons"]
    assert se["weather"] == "weather.home" and se["pool"] is None and se["jacuzzi"] == "sensor.tub"
    assert se["lead_day"] == 5 and se["wedding"] == "2012-06-09" and se["sug_from"] == "12:00" and "season" in flags
    assert S.sonder({"surprise_per_week": 99}, {})[0]["sonder_settings"]["surprise_per_week"] == 14
    assert S.general({"default_view": "evil"}, {"modules": {}})[0]["default_view"] == "today"


def test_coin_settings():
    # 0.15.0: points as a coin – one letter or digit, anything else falls back to the star
    assert S.clean_coin(None) == {"show": True, "letter": ""}
    assert S.clean_coin({"letter": "lea"})["letter"] == "L"
    assert S.clean_coin({"letter": "<"})["letter"] == ""
    assert S.clean_coin({"letter": "7", "show": False}) == {"show": False, "letter": "7"}
    game = {"day_points": 30, "day_bonus": 5, "streak_bonus": 20, "default_points": 10}
    patch, _ = S.points({"coin": {"letter": "ä"}}, game, "fair", [], cur_coin={"show": False, "letter": "X"})
    assert patch["coin"] == {"show": False, "letter": "Ä"}


def test_pet_settings_are_cleaned():
    out = S.clean_pets({"enabled": 0, "adults": "yes", "wheel": True, "speed": "warp", "decay": "off", "eggs": "lots", "evil": "<x>"})
    assert out == {"enabled": False, "adults": True, "wheel": True, "speed": "normal", "decay": "off", "eggs": "normal"}
    assert S.clean_pets({"eggs": "often"})["eggs"] == "often"
    assert S.clean_pets(None) == S.PETS_DEFAULT
    patch, flags = S.pets({"speed": "fast", "evil": 1}, S.PETS_DEFAULT)
    assert patch == {"pets": {**S.PETS_DEFAULT, "speed": "fast"}} and flags == set()


def test_points_sensor_unit_stays_points():
    """The unit must not change (0.17.0 changed it to coins and HA stopped the long-term statistics)."""
    import json
    base = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
    for f, unit in (("strings.json", "points"), ("translations/en.json", "points"), ("translations/de.json", "Punkte")):
        data = json.loads((base / f).read_text())
        assert data["entity"]["sensor"]["points"]["unit_of_measurement"] == unit, f


def test_announce_via_script_is_a_target_and_only_scripts_pass():
    patch, _ = S.announce({"enabled": True, "motion": ["binary_sensor.hall"],
                           "scripts": ["script.say_living", "notify.x", "script.bad id", "light.y"]}, {}, {})
    assert patch["announce"]["scripts"] == ["script.say_living"]


def test_announcer_hands_the_text_to_scripts_as_message():
    src = (pathlib.Path(__file__).parents[1] / "custom_components/family_planer/announce.py").read_text()
    assert '"script", "turn_on", {"entity_id": ent, "variables": {"message": message}}' in src
    assert 'cfg["notify"] or cfg["scripts"]' in src
