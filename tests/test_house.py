"""House builder, release 1: today's house is drawn by the house module, unchanged, and the pets follow it."""
import pathlib
import shutil
import subprocess

import pytest

ROOT = pathlib.Path(__file__).parents[1]


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_house_is_unchanged_and_pets_follow_it():
    res = subprocess.run(["node", str(ROOT / "tests/js/house_check.js")], capture_output=True, text=True, timeout=120)
    assert res.returncode == 0, res.stderr + res.stdout


def test_house_module_is_in_both_bundles_before_its_users():
    build = (ROOT / "frontend_src/build.py").read_text()
    assert build.index('"house.js"') < build.index('"season.js"')
    assert '[(src / "house.js").read_text()] + [(src / "pets" / f"{n}.js")' in build
    season = (ROOT / "frontend_src/season.js").read_text()
    assert "window.FPHOUSE.draw(o)" in season and "const houseS" not in season
    header = (ROOT / "frontend_src/pets/header.js").read_text()
    assert "window.FPHOUSE.geo()" in header and "[592, 32, 688, 99]" not in header
