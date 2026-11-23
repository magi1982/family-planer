"""The evolution tree finds a pet on the way it really chose (not on the first way of the same step)."""
import pathlib
import shutil
import subprocess

import pytest

SCRIPT = pathlib.Path(__file__).parent / "js" / "pet_tree_path.js"


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
def test_every_way_is_found_again_after_choosing_it():
    res = subprocess.run(["node", str(SCRIPT)], capture_output=True, text=True, timeout=120)
    assert res.returncode == 0, res.stderr + res.stdout


def test_evolve_dialog_and_tree_view_use_the_pets_own_way():
    src = (pathlib.Path(__file__).parents[1] / "frontend_src" / "pets_ui.js").read_text()
    assert "TR.nodeAt(tr, TR.pathOf(tr, p))" in src
    assert "find(tr, (nd) => nd.st === ST[p.step])" not in src
    assert "colW: 72, pet: p," in src


def test_night_veil_stays_on_the_planer_dashboard():
    """HA keeps a dashboard alive when another menu is opened: the dark night veil must not follow there."""
    src = (pathlib.Path(__file__).parents[1] / "frontend_src" / "bridge.js").read_text()
    a = src.index("    _night(on) {")
    night = src[a:src.index("    getCardSize()", a)]
    assert "addEventListener('location-changed'" in night and "n.dataset.root !== root()" in night
    assert "!this.isConnected" in night and "v.dataset.root = root();" in night


def test_egg_banner_shows_one_egg_and_opens_the_egg_locally():
    """The banner drew the egg twice (picture + 🥚) and its tap waited for a server call that changed nothing visible."""
    src = (pathlib.Path(__file__).parents[1] / "frontend_src" / "pets_ui.js").read_text()
    card = src[src.index("const eggCard = waiting"):]
    card = card[:card.index("\n")]
    assert "🥚" not in card and "data-gotoegg" in card
    assert "this._sub = { pet: b.dataset.gotoegg, egg: true }; this._render();" in src
    assert "_act('active', { pet: b.dataset.gotoegg }" not in src
