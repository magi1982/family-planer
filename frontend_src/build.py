"""Build custom_components/family_planer/frontend/family-planer-cards.js (German + English UI)."""
import pathlib
import sys

src = pathlib.Path(__file__).parent
sys.path.insert(0, str(src))
from i18n_en import PLAN, WEEK  # noqa: E402

out = src.parent / "custom_components/family_planer/frontend/family-planer-cards.js"


import re

BG = {"#111": 0, "#141414": 0, "#161616": 0, "#1e1e1e": 1, "#222": 2, "#232323": 2, "#202820": 2, "#262626": 3,
      "#2a2a2a": 3, "#2b2b2b": 3, "#2c2c2c": 3, "#2e2e2e": 4, "#2f2f2f": 4, "#313131": 4, "#333": 4, "#3a3a3a": 4, "#1f1f1f": 1, "#303030": 4, "#323232": 4, "#555": 4}
LINE = {"#3d3d3d", "#5d5d5d", "#2a2a2a", "#2c2c2c", "#2f2f2f", "#313131", "#333", "#3a3a3a", "#4a4a4a", "#5a5a5a"}
TEXT = {"#fff": "text", "#ffffff": "text", "#eee": "text", "#ececec": "text", "#ddd": "text", "#dfe": "text",
        "#ccc": "text2", "#bbb": "text2", "#aaa": "text2", "#9a9a9a": "text2", "#999": "text2", "#8c8c8c": "text2",
        "#8a8a8a": "text3", "#888": "text3", "#7a7a7a": "text3", "#777": "text3", "#6f8a66": "text3", "#666": "text3",
        "#555": "text3", "#5a5a5a": "text3", "#e5e5e5": "text", "#808080": "text3"}
DARK_TEXT = {"#111", "#141414", "#161616", "#1e1e1e", "#161616"}
HEX = re.compile(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b")
ACC = re.compile(r"rgba\(105,\s*195,\s*80,\s*\.?([0-9.]+)\)")


def _decl(prop: str, val: str) -> str:
    def acc(m):
        a = float(m.group(1)) if m.group(1).startswith(("0", "1")) else float("0." + m.group(1))
        return f"color-mix(in srgb,var(--fp-accent) {round(a * 100)}%,transparent)"
    val = ACC.sub(acc, val)
    val = re.sub(r"#69C350\b", "var(--fp-accent)", val, flags=re.I)

    def hexrep(m):
        h = m.group(0).lower()
        if prop.startswith("background"):
            return f"var(--fp-bg{BG[h]},{h})" if h in BG else h
        if prop.startswith("border") or prop.startswith("outline"):
            return f"var(--fp-line,{h})" if h in LINE or h in BG else h
        if prop == "color":
            if h in ("#a7dc93",):
                return "var(--fp-accent)"
            if h in DARK_TEXT or h == "#142010":
                return f"var(--fp-on-accent,{h})"
            return f"var(--fp-{TEXT[h]},{h})" if h in TEXT else h
        return h
    return HEX.sub(hexrep, val)


def themify(js: str) -> str:
    """Colours inside <style> blocks -> CSS variables (the card host sets them per design)."""
    def style(m):
        css = m.group(1)
        css = re.sub(r"([a-z-]+)\s*:\s*([^;{}]+)", lambda d: f"{d.group(1)}:{_decl(d.group(1), d.group(2))}", css)
        css = css.replace("border-radius:16px", "border-radius:var(--fp-radius,16px)")
        css = css.replace(f"font-family:${{FONT}}", "font-family:var(--fp-font)")
        return f"<style>{css}</style>"
    js = re.sub(r"<style>(.*?)</style>", style, js, flags=re.S)
    return js.replace("const G = '#69C350';", "const G = 'var(--fp-accent)';")


def variant(week: str, plan: str, suffix: str, glob: str) -> str:
    ren = {"lox-wochenplaner-card": f"fp-week-inner{suffix}", "lox-aemtli-plan-card": f"fp-plan-inner{suffix}",
           "window.FP ": f"window.{glob} ", "window.FP;": f"window.{glob};"}
    for a, b in ren.items():
        assert a in week or a in plan, a
        week, plan = week.replace(a, b), plan.replace(a, b)
    return "\n".join(["(() => {", week, "})();", plan])


week = themify((src / "ui_week.js").read_text())
plan = themify((src / "ui_plan.js").read_text())
week_en, plan_en = week, plan
missing = []
for table, name in ((WEEK, "week"), (PLAN, "plan")):
    for de, en in table:
        if name == "week":
            if de not in week_en:
                missing.append((name, de))
            week_en = week_en.replace(de, en)
        else:
            if de not in plan_en:
                missing.append((name, de))
            plan_en = plan_en.replace(de, en)
if missing:
    raise SystemExit("phrases not found:\n" + "\n".join(f"  [{n}] {d[:90]}" for n, d in missing))

body = "\n".join([
    "// Family Planer cards – built by frontend_src/build.py, do not edit",
    variant(week, plan, "", "FPX"),
    variant(week_en, plan_en, "-en", "FPX_EN"),
    themify((src / "lists.js").read_text()),
    themify((src / "rewards.js").read_text()),
    themify((src / "special.js").read_text()),
    (src / "bridge.js").read_text(),
])
out.parent.mkdir(parents=True, exist_ok=True)
for old in out.parent.glob("*.js"):
    if old != out:
        old.unlink()
out.write_text(body)
print(out.name, len(body))
