"""A second method with the same name silently replaces the first (0.16.2: the statistics page broke)."""
import ast
import pathlib

SRC = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"


def test_no_duplicate_method_names():
    dupes = []
    for f in SRC.glob("*.py"):
        for cls in [n for n in ast.walk(ast.parse(f.read_text(encoding="utf-8"))) if isinstance(n, ast.ClassDef)]:
            seen = set()
            for fn in cls.body:
                if isinstance(fn, (ast.FunctionDef, ast.AsyncFunctionDef)) and not fn.decorator_list:
                    if fn.name in seen:
                        dupes.append(f"{f.name}:{cls.name}.{fn.name}")
                    seen.add(fn.name)
    assert not dupes, dupes
