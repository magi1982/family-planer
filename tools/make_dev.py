"""Build the DEV channel of Family Planer: a copy that runs side by side with the live integration.

    python3 tools/make_dev.py OUT_DIR [--version 0.20.0-dev.1]

Writes a complete HACS repository to OUT_DIR (custom_components/family_planer_dev, hacs.json, README.md, LICENSE).
Everything that could collide with the live integration gets its own name:

* domain, services, websocket commands, storage and photo folder: family_planer -> family_planer_dev
* panel, cards file and custom elements: family-planer -> family-planer-dev, fp-*-inner -> fpd-*-inner
* browser globals, events and localStorage keys: FP* -> FPD*, fp*/__fp* -> fpd*/__fpd*, P4 -> PD4, fp_ -> fpd_
* display name "Family Planer" -> "Family Planer DEV", icons get a purple DEV band

A line containing the marker ``fp-live`` is copied unchanged (code that has to name the live integration, e.g. to
copy its data). Existing OUT_DIR content outside custom_components/family_planer_dev is kept (e.g. .git).
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "custom_components" / "family_planer"
LIVE, DEV = "family_planer", "family_planer_dev"
KEEP = "fp-live"
NAME, DEV_NAME = "Family Planer", "Family Planer DEV"

COMMON = [
    (re.compile(r"family_planer(?!_dev)"), "family_planer_dev"),
    (re.compile(r"(?<!magi1982/)family-planer(?!-dev)"), "family-planer-dev"),
]
JS = [
    (re.compile(r"(?<![\w-])fp-([a-z]+-inner(?:-en)?)\b"), r"fpd-\1"),
    (re.compile(r"(['\"`])fp-(hatched|night|refresh)\1"), r"\1fpd-\2\1"),
    (re.compile(r"\bFP([A-Z0-9_]+)\b"), r"FPD\1"),
    (re.compile(r"\b__fp(\w)"), r"__fpd\1"),
    (re.compile(r"\b__FP(\w)"), r"__FPD\1"),
    (re.compile(r"\bfp([A-Z]\w*)"), r"fpd\1"),
    (re.compile(r"(?<=['\"`])fp_"), "fpd_"),
    (re.compile(r"\bP4\b"), "PD4"),
]
TEXT_SUFFIXES = {".py", ".js", ".json", ".yaml", ".yml", ".md", ".txt"}


def convert(text: str, js: bool) -> str:
    out = []
    for line in text.splitlines(keepends=True):
        if KEEP not in line:
            for rx, rep in COMMON + (JS if js else []):
                line = rx.sub(rep, line)
        out.append(line)
    return "".join(out)


def dev_icon(src: Path, dst: Path) -> None:
    """Purple diagonal DEV band in the lower right corner (like the DEV app icons of other projects)."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:  # icons stay as they are
        shutil.copyfile(src, dst)
        return
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    band = Image.new("RGBA", (min(w, h) * 2, max(8, min(w, h) // 6)), (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    d.rectangle([0, 0, band.width, band.height], fill=(124, 58, 237, 255))
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", int(band.height * 0.72))
    except OSError:
        font = ImageFont.load_default()
    tw = d.textlength("DEV", font=font)
    d.text(((band.width - tw) / 2, band.height * 0.1), "DEV", fill="white", font=font)
    band = band.rotate(45, expand=True, resample=Image.BICUBIC)
    cx, cy = w - int(h * 0.2), int(h * 0.8)
    img.alpha_composite(band, (max(-band.width, cx - band.width // 2), max(-band.height, cy - band.height // 2)))
    img.save(dst)


def build(out: Path, version: str | None) -> Path:
    target = out / "custom_components" / DEV
    if target.exists():
        shutil.rmtree(target)
    for f in sorted(SRC.rglob("*")):
        if f.is_dir() or "__pycache__" in f.parts:
            continue
        rel = f.relative_to(SRC)
        dst = target / Path(*(p.replace("family-planer", "family-planer-dev") for p in rel.parts))
        dst.parent.mkdir(parents=True, exist_ok=True)
        if f.suffix == ".png" and "brand" in rel.parts:
            dev_icon(f, dst)
        elif f.suffix in TEXT_SUFFIXES:
            dst.write_text(convert(f.read_text(encoding="utf-8"), f.suffix == ".js"), encoding="utf-8")
        else:
            shutil.copyfile(f, dst)

    man = json.loads((target / "manifest.json").read_text(encoding="utf-8"))
    man["name"] = DEV_NAME
    if version:
        man["version"] = version
    man["documentation"] = "https://github.com/magi1982/family-planer-dev"
    (target / "manifest.json").write_text(json.dumps(man, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    const = target / "const.py"
    txt = const.read_text(encoding="utf-8")
    txt = txt.replace(f'NAME = "{NAME}"', f'NAME = "{DEV_NAME}"')
    if version:
        txt = re.sub(r'^VERSION = ".*"$', f'VERSION = "{version}"', txt, flags=re.M)
    const.write_text(txt, encoding="utf-8")

    for tr in [target / "strings.json", *sorted((target / "translations").glob("*.json"))]:
        data = json.loads(tr.read_text(encoding="utf-8"))
        cfg = data.get("config", {})
        if cfg.get("title") == NAME:
            cfg["title"] = DEV_NAME
        tr.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    (out / "hacs.json").write_text(json.dumps(
        {"name": DEV_NAME, "render_readme": True,
         "homeassistant": json.loads((ROOT / "hacs.json").read_text())["homeassistant"]}, indent=2) + "\n")
    shutil.copyfile(ROOT / "LICENSE", out / "LICENSE")
    (out / "README.md").write_text(README.format(version=man["version"]), encoding="utf-8")
    return target


README = """# Family Planer DEV

**Development channel of [Family Planer](https://github.com/magi1982/family-planer) – version {version}.**
Generated automatically from the development branch; do not edit this repository by hand.

Runs **side by side** with the live Family Planer: own integration (`family_planer_dev`), own data, own entities,
own sidebar entry (*Family Planer DEV*) and own cards (`custom:family-planer-dev-card`, …). Removing it never touches
the live planner.

🇩🇪 **Entwicklungskanal** des Family Planer. Läuft parallel zum Live-Planer mit eigenen Daten und eigenem
Seitenleisten-Eintrag. Kann jederzeit entfernt werden, ohne den Live-Planer zu berühren.

## Install
HACS → ⋮ → *Custom repositories* → `https://github.com/magi1982/family-planer-dev`, type *Integration* → install →
restart Home Assistant → *Settings → Devices & services → Add integration → Family Planer DEV*.

Tip: switch announcements off in the DEV planner (they are off by default), otherwise both planners talk.
"""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("out", type=Path)
    ap.add_argument("--version")
    a = ap.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    print(build(a.out, a.version))
    return 0


if __name__ == "__main__":
    sys.exit(main())
