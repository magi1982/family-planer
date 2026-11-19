"""The DEV channel (tools/make_dev.py) must be able to run side by side with the live integration."""
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("make_dev", ROOT / "tools" / "make_dev.py")
make_dev = importlib.util.module_from_spec(spec)
spec.loader.exec_module(make_dev)


def _build(tmp_path):
    target = make_dev.build(tmp_path, "9.9.9-dev.1")
    files = {p.relative_to(target).as_posix(): p.read_text(encoding="utf-8")
             for p in target.rglob("*") if p.is_file() and p.suffix in make_dev.TEXT_SUFFIXES}
    return target, files


def test_dev_has_own_domain_and_names(tmp_path):
    target, files = _build(tmp_path)
    assert target.name == "family_planer_dev"
    man = json.loads(files["manifest.json"])
    assert man["domain"] == "family_planer_dev" and man["name"] == "Family Planer DEV" and man["version"] == "9.9.9-dev.1"
    assert 'DOMAIN = "family_planer_dev"' in files["const.py"]
    assert 'PANEL_URL = "family-planer-dev"' in files["const.py"]
    assert json.loads((tmp_path / "hacs.json").read_text())["name"] == "Family Planer DEV"


def test_no_live_names_left(tmp_path):
    _target, files = _build(tmp_path)
    for name, text in files.items():
        for line in text.splitlines():
            if make_dev.KEEP in line:
                continue
            assert not re.search(r"family_planer(?!_dev)", line), (name, line)
            assert not re.search(r"(?<!magi1982/)family-planer(?!-dev)", line), (name, line)


def test_frontend_names_do_not_collide(tmp_path):
    _target, files = _build(tmp_path)
    live = "".join((ROOT / "custom_components/family_planer/frontend" / f).read_text(encoding="utf-8")
                   for f in ("family-planer-cards.js", "family-planer-pets.js"))
    dev = files["frontend/family-planer-dev-cards.js"] + files["frontend/family-planer-dev-pets.js"]
    elements = re.compile(r"customElements\.define\('([a-z0-9-]+)'")
    globals_ = re.compile(r"window\.([A-Za-z_$][\w$]*)\s*=")
    keys = re.compile(r"localStorage\.setItem\((['\"`][^'\"`]+)")
    for rx in (elements, globals_, keys):
        both = set(rx.findall(live)) & set(rx.findall(dev)) - {"customCards"}  # HA's shared card list
        assert not both, (rx.pattern, both)
    assert set(elements.findall(dev))


def test_python_compiles(tmp_path):
    _target, files = _build(tmp_path)
    for name, text in files.items():
        if name.endswith(".py"):
            compile(text, name, "exec")
