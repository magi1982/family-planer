"""Announcement queue."""
from datetime import datetime, timedelta
import importlib.util
from pathlib import Path
import sys

_p = Path(__file__).parents[1] / "custom_components/family_planer"


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, _p / file)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


Q = _load("fp_msgqueue", "msgqueue.py")
SP = _load("fp_speech2", "speech.py")
NOW = datetime(2026, 11, 6, 16, 0)


def test_add_replace_and_take():
    q = []
    Q.add(q, "Wäsche fertig", NOW, NOW + timedelta(hours=4), key="wash")
    Q.add(q, "Wäsche fertig, Nina ist dran", NOW, NOW + timedelta(hours=4), key="wash")
    Q.add(q, "Nur im Gang", NOW, NOW + timedelta(hours=4), rooms=["binary_sensor.gang"])
    assert len(q) == 2
    assert Q.take(q, "binary_sensor.kueche", NOW, {}) == ["Wäsche fertig, Nina ist dran"]
    assert Q.take(q, "binary_sensor.kueche", NOW, {}) == []
    assert Q.take(q, "binary_sensor.gang", NOW, {}) == ["Nur im Gang"] and q == []


def test_expiry_and_done_items():
    q = []
    Q.add(q, "alt", NOW - timedelta(hours=5), NOW - timedelta(minutes=1))
    Q.add(q, "Pneuwechsel", NOW, NOW + timedelta(days=3), item="i1")
    assert Q.take(q, None, NOW, {"i1": {"done": True}}) == []
    Q.add(q, "Luftfilter", NOW, NOW + timedelta(days=3), item="i2")
    assert Q.take(q, None, NOW, {"i2": {"done": False}}) == ["Luftfilter"]


def test_remove_and_limit():
    q = []
    for i in range(60):
        Q.add(q, str(i), NOW, NOW + timedelta(hours=1))
    assert len(q) == Q.MAX_ENTRIES and q[0]["text"] == "10"
    Q.add(q, "x", NOW, NOW + timedelta(hours=1), key="k")
    assert Q.remove(q, "k") == 1


def test_messages():
    assert SP.reward_decided_message("Mia", "Glace", True, "de") == "Mia, deine Belohnung „Glace“ wurde freigegeben. Viel Spass!"
    assert SP.special_chore_message("Tom", "Pneuwechsel", 21, "de") == "Tom, in den nächsten 21 Tagen ist „Pneuwechsel“ dran."
    assert "today" in SP.special_chore_message("A", "B", 1, "en")
