"""House builder, release 1: today's house is drawn by the house module, unchanged, and the pets follow it."""
import pathlib
import shutil
import subprocess

import importlib
import sys
import types

import pytest

ROOT = pathlib.Path(__file__).parents[1]
_pkg = types.ModuleType("fpkg")
_pkg.__path__ = [str(ROOT / "custom_components/family_planer")]  # package without running __init__ (no Home Assistant)
sys.modules.setdefault("fpkg", _pkg)
S = importlib.import_module("fpkg.settings_spec")


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_house_is_unchanged_and_pets_follow_it():
    res = subprocess.run(["node", str(ROOT / "tests/js/house_check.js")], capture_output=True, text=True, timeout=120)
    assert res.returncode == 0, res.stderr + res.stdout


def test_house_module_is_in_both_bundles_before_its_users():
    build = (ROOT / "frontend_src/build.py").read_text()
    assert build.index('"house.js"') < build.index('"season.js"')
    assert '[(src / "house.js").read_text()] + [(src / "pets" / f"{n}.js")' in build
    season = (ROOT / "frontend_src/season.js").read_text()
    assert "window.FPHOUSE.draw(o, cfg)" in season and "const houseS" not in season
    header = (ROOT / "frontend_src/pets/header.js").read_text()
    assert "window.FPHOUSE.geo(cfg)" in header and "[592, 32, 688, 99]" not in header


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_tap_stories_follow_the_house():
    res = subprocess.run(["node", str(ROOT / "tests/js/taps_house.js")], capture_output=True, text=True, timeout=120)
    assert res.returncode == 0, res.stderr + res.stdout


def test_house_options_are_the_same_in_python_and_js():
    import re
    js = (ROOT / "frontend_src/house.js").read_text()
    wall = re.findall(r"(\w+): '#", js[js.index("const WALL"):js.index("const ROOF")])
    roof = re.findall(r"(\w+): '#", js[js.index("const ROOF"):js.index("const SHUT")])
    assert tuple(wall) == S.HOUSE_OPTIONS["wall"] and tuple(roof) == S.HOUSE_OPTIONS["roof"]
    for k in ("windows", "facade", "left", "right", "water", "pond"):
        m = re.search(k + r": \[([^\]]*)\]", js)
        assert tuple(re.findall(r"'(\w+)'", m.group(1))) == S.HOUSE_OPTIONS[k], k
    assert "shutters" in S.HOUSE_OPTIONS and S.HOUSE_OPTIONS["shutters"][0] == "none"


def test_clean_house_keeps_only_known_parts():
    assert S.clean_house(None) == S.HOUSE_DEFAULT
    c = S.clean_house({"wall": "rot", "roof": "<script>", "left": "turm", "water": "none", "extra": 1})
    assert c["wall"] == "rot" and c["roof"] == "ziegel" and c["left"] == "turm" and c["water"] == "none" and "extra" not in c
    patch, flags = S.house({"right": "carport", "wall": 5}, S.HOUSE_DEFAULT)
    assert patch["house"]["right"] == "carport" and patch["house"]["wall"] == "creme" and not flags
    assert "house" in S.SECTIONS
