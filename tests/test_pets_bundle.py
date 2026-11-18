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
    """Dashboards made before statistics/pets existed: the buttons stay visible and open the page in the panel."""
    import pathlib
    src = (pathlib.Path(__file__).parents[1] / "frontend_src")
    week = (src / "ui_week.js").read_text()
    nav = (src / "bridge.js").read_text()
    assert "window.__fpViews" in week and "/family-planer/" in week
    assert "window.__fpViews = this._views" in nav
    assert "if (miss && !this._editing()) return '';" not in nav
