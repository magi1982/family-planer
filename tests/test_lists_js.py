"""Small frontend helpers checked with Node.js: smart list optimise states and the "Tap!" sign settings."""
import pathlib
import shutil
import subprocess

import pytest


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_list_optimise_states():
    script = pathlib.Path(__file__).parent / "js" / "list_opt.js"
    res = subprocess.run(["node", str(script)], capture_output=True, text=True, timeout=60)
    assert res.returncode == 0, res.stderr
    assert "ok" in res.stdout


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_tap_sign_helpers():
    script = pathlib.Path(__file__).parent / "js" / "tap_hint.js"
    res = subprocess.run(["node", str(script)], capture_output=True, text=True, timeout=60)
    assert res.returncode == 0, res.stderr
    assert "ok" in res.stdout
