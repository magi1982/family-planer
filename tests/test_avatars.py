"""Every avatar combination of the builder renders and has no conflicting parts (needs Node.js)."""
import pathlib
import shutil
import subprocess

import pytest

SCRIPT = pathlib.Path(__file__).parent / "js" / "avatar_combos.js"


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_all_avatar_combinations():
    res = subprocess.run(["node", str(SCRIPT)], capture_output=True, text=True, timeout=300)
    assert res.returncode == 0, res.stderr
    assert res.stdout.startswith("ok ")
