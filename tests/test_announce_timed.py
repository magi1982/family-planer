"""Timed announcements (evening summary, birthday lines) wait for the next motion when a motion sensor is set."""
import asyncio
import importlib
import pathlib
import sys
import types
from datetime import date, datetime

_dir = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
NOW = [datetime(2026, 11, 19, 18, 20)]


def _stub(name, **attrs):
    m = types.ModuleType(name)
    m.__dict__.update(attrs)
    sys.modules.setdefault(name, m)
    return sys.modules[name]


# tiny stand-ins for the Home Assistant parts announce.py imports (no Home Assistant needed)
_stub("homeassistant")
_stub("homeassistant.const", STATE_ON="on")
_stub("homeassistant.core", Event=object, EventStateChangedData=dict, HomeAssistant=object, callback=lambda f: f)
_stub("homeassistant.helpers")
_stub("homeassistant.helpers.event", async_track_state_change_event=lambda *a: None, async_track_time_change=lambda *a, **k: None)
_stub("homeassistant.util")
_dt = types.SimpleNamespace(now=lambda: NOW[0])
sys.modules["homeassistant.util"].dt = _dt
_stub("homeassistant.util.dt", now=_dt.now)
_pkg = types.ModuleType("fpann")
_pkg.__path__ = [str(_dir)]
sys.modules.setdefault("fpann", _pkg)
A = importlib.import_module("fpann.announce")


class Planner:
    lang = "de"

    def __init__(self, motion):
        self.settings = {"announce": {"enabled": True, "motion": ["binary_sensor.m"] if motion else [], "scripts": ["script.s"]}}
        self.data = {"items": {}, "persons": {"P1": {"name": "Lea"}}, "queue": []}
        self.away = {}

    def today(self):
        return date(2026, 11, 19)

    def persons_sorted(self):
        return [("P1", self.data["persons"]["P1"])]

    def season(self):
        return {"birthdays": ["P1"], "ages": {}}

    def save_soon(self):
        pass


def _ann(motion=True):
    a = A.Announcer(None, Planner(motion))
    said = []

    async def say(text):
        said.append(text)
    a.async_say = say
    return a, said


def test_with_motion_birthday_waits_for_motion():
    a, said = _ann()
    asyncio.run(a.async_timed("birthday"))
    assert said == [] and "birthday" in a._pending  # due, but nobody there yet
    asyncio.run(a.async_check(sensor="binary_sensor.m"))
    assert len(said) == 1 and "Lea" in said[0]
    said.clear()
    asyncio.run(a.async_check(sensor="binary_sensor.m"))
    assert said == []  # said once


def test_without_motion_sensor_it_speaks_right_away():
    a, said = _ann(motion=False)
    asyncio.run(a.async_timed("birthday"))
    assert len(said) == 1 and not a._pending


def test_pending_expires_with_the_day():
    a, said = _ann()
    a._pending = {"birthday": "2026-11-18"}
    asyncio.run(a.async_check(sensor="binary_sensor.m"))
    assert said == [] and a._pending == {}


def test_defaults_are_the_new_times():
    assert A.DEFAULT_ANNOUNCE["evening_time"] == "18:15"
    assert A.DEFAULT_ANNOUNCE["birthday_times"] == ["07:00", "12:15", "15:30", "18:15", "19:30"]
