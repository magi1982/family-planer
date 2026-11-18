"""Regression: pets must exist right after start/update – not only after the first change (0.17.0 showed no eggs)."""
import ast
import pathlib

SRC = (pathlib.Path(__file__).parents[1] / "custom_components/family_planer/planner.py").read_text()


def _method(name):
    tree = ast.parse(SRC)
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == name:
            return node
    raise AssertionError(name)


def _calls(node):
    return [n.func.attr for n in ast.walk(node) if isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute)]


def test_pets_are_created_when_the_planner_loads():
    calls = _calls(_method("async_load"))
    assert "_pets_sync" in calls
    # before the first save, so the eggs are stored right away
    assert calls.index("_pets_sync") < calls.index("async_save")


def test_pets_follow_every_change():
    assert "_pets_sync" in _calls(_method("_changed"))


def test_setting_a_todo_twice_books_nothing_new():
    src = ast.get_source_segment(SRC, _method("async_set_todo"))
    guard = src.index('bool(todo.get("done")) == bool(done)')
    assert guard < src.index("_book_todo")


def test_frontend_ignores_presses_while_a_todo_is_saving():
    root = pathlib.Path(__file__).parents[1] / "frontend_src"
    assert "_tdBusy" in (root / "ui_week.js").read_text()
    assert "_busy" in (root / "todos.js").read_text()


def test_ticking_a_chore_twice_books_nothing_new():
    src = ast.get_source_segment(SRC, _method("async_set_item"))
    assert src.index('bool(item.get("done")) == bool(done)') < src.index("book_points")


def test_pet_points_service_is_admin_only():
    init = (pathlib.Path(__file__).parents[1] / "custom_components/family_planer/__init__.py").read_text()
    assert 'async_register_admin_service(hass, DOMAIN, "add_pet_points"' in init


def test_coins_rise_only_the_first_time_a_chore_is_ticked():
    week = (pathlib.Path(__file__).parents[1] / "frontend_src/ui_week.js").read_text()
    assert "if (fl.keys.has(key)) return;" in week
    for key in ("`c:${b.dataset.uid}`", "`t:${t.id}`", "`s:${it.id}`"):
        assert key in week
