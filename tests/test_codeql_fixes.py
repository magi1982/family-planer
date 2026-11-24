"""CodeQL findings (code scanning): no incomplete escaping, no replacement of a string with itself."""
import pathlib
import re

ROOT = pathlib.Path(__file__).parents[1]
SOURCES = sorted((ROOT / "frontend_src").rglob("*.js"))


def test_no_replace_with_same_string():
    """js/identity-replacement: x.replace(/a/g, 'a') does nothing and hides a mistake."""
    pat = re.compile(r"\.replace\(/((?:[^/\\]|\\.)+)/g?,\s*'([^']*)'\)")
    bad = [f"{p.name}: {m.group(0)}" for p in SOURCES for m in pat.finditer(p.read_text())
           if m.group(1).replace("\\", "") == m.group(2)]
    assert not bad, bad


def test_string_replace_with_a_plain_string_pattern_is_not_used_for_separators():
    """js/incomplete-sanitization: .replace('|', …) only changes the first match – use a /g regex."""
    bad = [f"{p.name}" for p in SOURCES if re.search(r"\.replace\('\|',", p.read_text())]
    assert not bad, bad
