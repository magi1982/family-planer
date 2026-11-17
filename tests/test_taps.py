"""Tap stories of the header scene: they render and the right one plays on the right day (needs Node.js)."""
import pathlib
import shutil
import subprocess

import pytest

SCRIPT = pathlib.Path(__file__).parent / "js" / "taps_pick.js"


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_tap_stories_and_choice():
    res = subprocess.run(["node", str(SCRIPT)], capture_output=True, text=True, timeout=300)
    assert res.returncode == 0, res.stderr
    assert res.stdout.startswith("ok ")
