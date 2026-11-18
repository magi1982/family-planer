"""The Tierchen graphics are a separate file, loaded only when needed, without network or storage access."""
import pathlib
import re

_fe = pathlib.Path(__file__).parents[1] / "custom_components/family_planer/frontend"
CARDS = (_fe / "family-planer-cards.js").read_text()
PETS = (_fe / "family-planer-pets.js").read_text()
VERSION = re.search(r'VERSION = "([^"]+)"', (_fe.parent / "const.py").read_text()).group(1)


def test_planer_loads_the_pet_file_lazily_with_the_version():
    assert "window.fpLoadPets" in CARDS
    assert "'/family_planer_static'" in CARDS and f"/family-planer-pets.js?v={VERSION}" in CARDS


def test_pet_file_exports_its_parts():
    for part in ("P4", "M", "HEADER", "WORLD", "TREE", "ICO", "CARE", "WHEEL"):
        assert re.search(rf"\b{part}: window\.", PETS), part


def test_pet_file_has_no_dangerous_apis():
    for bad in ("eval(", "new Function", "fetch(", "XMLHttpRequest", "localStorage", "document.cookie", "document.write"):
        assert bad not in PETS, bad


def test_missing_dashboard_view_opens_the_panel():
    """Dashboards made before statistics/pets existed: the buttons stay visible and show the page right in the
    dashboard (kiosk mode / guided access never leaves it)."""
    import pathlib
    src = (pathlib.Path(__file__).parents[1] / "frontend_src")
    week = (src / "ui_week.js").read_text()
    nav = (src / "bridge.js").read_text()
    assert "window.__fpViews" in week and "fp-inline-page" in week
    assert "history.pushState(null, '', `/family-planer/" not in week  # never jumps to the sidebar panel
    assert "_inlinePage(key) {" in nav[nav.index("class FamilyPlanerNavCard"):nav.index("class FamilyPlanerPanel")]
    assert "window.__fpViews = this._views" in nav
    assert "if (miss && !this._editing()) return '';" not in nav


def test_inline_page_covers_the_planer_below():
    """The page shown inside a dashboard lies above the planer's pets and wheels (z-index 5-6)."""
    import pathlib
    import re
    nav = (pathlib.Path(__file__).parents[1] / "frontend_src/bridge.js").read_text()
    z = int(re.search(r"this\._page\.style\.cssText = `position:fixed;z-index:(\d+)", nav).group(1))
    assert 6 < z < 9000


def test_switching_pages_starts_at_the_top():
    """Banner and buttons stay visible: every page change scrolls to the top, the inline page locks the dashboard."""
    import pathlib
    src = pathlib.Path(__file__).parents[1] / "frontend_src"
    week = (src / "ui_week.js").read_text()
    nav = (src / "bridge.js").read_text()
    assert "const fpNavigate = (p) => {\n  fpToTop();" in week
    assert "window.fpToTop()" in nav and "document.documentElement.style.overflow = 'hidden'" in nav
    assert "document.documentElement.style.overflow = this._lockOld" in nav  # unlocked again


def test_every_inventory_thing_has_an_explanation_in_both_languages():
    """Tap on a thing in the inventory: what it is, what it does, where it comes from – for every item of pets.py."""
    import importlib.util
    import pathlib
    import re
    root = pathlib.Path(__file__).parents[1]
    spec = importlib.util.spec_from_file_location("fp_pets_items", root / "custom_components/family_planer/pets.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    ui = (root / "frontend_src/pets_ui.js").read_text()
    blocks = re.findall(r"\n        x: \{(.*?)\} \},", ui, re.S)
    assert len(blocks) == 2  # de + en
    for block in blocks:
        keys = set(re.findall(r"^\s+([a-z_]+): \[", block, re.M))
        assert set(mod.ITEMS) <= keys, set(mod.ITEMS) - keys
    assert "data-info=" in ui and "_info(k)" in ui


def test_avatar_builder_has_no_companions_any_more():
    import pathlib
    av = (pathlib.Path(__file__).parents[1] / "frontend_src/avatar.js").read_text()
    assert "const TABS = ['head', 'face', 'cloth', 'bg', 'cost', 'fx', 'season'];" in av
    assert "${petArt[o.pet]()}" not in av


def test_artefacts_pick_a_pet_with_a_second_confirmation_and_hatching_has_no_spoiler():
    import pathlib
    ui = (pathlib.Path(__file__).parents[1] / "frontend_src/pets_ui.js").read_text()
    assert "data-whom=" in ui and "data-wish=" in ui and "confirmRow(" in ui and "data-yes" in ui  # pick, then confirm
    assert "data-artskin" in ui and "data-artaura" in ui  # switch effects in the tree
    assert "window.__fpHatching = true" in ui and "if (window.__fpHatching)" in ui  # page waits while hatching
    assert "data-gotoegg" in ui and "eggdot" in ui and "t.newEgg" in ui  # a new egg is seen
    assert "const lookOf = (p)" in ui


def test_pets_in_windows_are_never_bigger_than_on_the_care_page():
    import pathlib
    ui = (pathlib.Path(__file__).parents[1] / "frontend_src/pets_ui.js").read_text()
    assert ".care .pet{max-width:var(--petmax,200px)}" in ui and "window.__fpPetW = w" in ui
    # growth pills grow, they do not show a strange next form
    assert "wachs_s: 'wachs_s', wachs_m: 'wachs_m', wachs_l: 'wachs_l'" in ui and "run('wachsen')" not in ui
