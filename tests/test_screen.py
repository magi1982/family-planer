"""Black screen when idle: settings and the frontend logic (via node)."""
import shutil
import pathlib
import subprocess

import pytest

import importlib
import sys
import types

_dir = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
_pkg = types.ModuleType("fpkg")
_pkg.__path__ = [str(_dir)]
sys.modules.setdefault("fpkg", _pkg)
ss = importlib.import_module("fpkg.settings_spec")

ROOT = pathlib.Path(__file__).parents[1]


def test_screen_defaults_off_and_clean_values():
    assert ss.clean_screen(None) == {"enabled": False, "minutes": 5, "style": "black", "motion": []}
    c = ss.clean_screen({"enabled": True, "minutes": "999", "style": "<b>", "motion": ["binary_sensor.k", "light.x", "x"]})
    assert c == {"enabled": True, "minutes": 120, "style": "black", "motion": ["binary_sensor.k"]}
    assert ss.clean_screen({"minutes": "abc"})["minutes"] == 5
    assert "screen" in ss.SECTIONS


def test_screen_section_keeps_unknown_keys_out():
    patch, _ = ss.screen({"enabled": True, "evil": 1}, ss.clean_screen(None))
    assert patch["screen"]["enabled"] is True and "evil" not in patch["screen"]


def test_screen_is_in_the_bundle():
    assert "window.FPSCREEN" in (ROOT / "custom_components/family_planer/frontend/family-planer-cards.js").read_text()


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_screen_logic():
    res = subprocess.run(["node", str(ROOT / "tests/screen_check.js")], capture_output=True, text=True, timeout=60)
    assert res.returncode == 0, res.stderr + res.stdout
