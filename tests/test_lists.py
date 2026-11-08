"""Tests for the smart-list categorizer."""
import importlib.util
import pathlib
import sys

_path = pathlib.Path(__file__).parents[1] / "custom_components/family_planer/lists.py"
_spec = importlib.util.spec_from_file_location("fp_lists", _path)
L = importlib.util.module_from_spec(_spec)
sys.modules["fp_lists"] = L
_spec.loader.exec_module(L)

TODAY = "2026-11-06"


def test_normalize_strips_quantities():
    assert L.normalize("2x Milch") == "milch"
    assert L.normalize("Mehl 1kg") == "mehl"
    assert L.normalize("  Bananen (Bio) ") == "bananen bio"


def test_kb_lookup_compounds_and_languages():
    assert L.kb_lookup("Vollmilch") == "dairy"
    assert L.kb_lookup("Rüebli") == "produce"
    assert L.kb_lookup("Katzenfutter") == "pets"
    assert L.kb_lookup("toilet paper") == "drugstore"
    assert L.kb_lookup("WC-Papier") == "drugstore"
    assert L.kb_lookup("Spax Schrauben 4x40") == "fixings"
    assert L.kb_lookup("Geburtstagsgeschenk Oma") is None


def test_optimize_creates_categories_and_other():
    lst = L.new_list("Einkaufen", "todo.x", 10)
    res = L.optimize(lst, ["Milch", "Äpfel", "Brot", "Geschenk für Oma"], "de", TODAY)
    names = [c["name"] for c in lst["categories"]]
    assert names[-1] == "Sonstiges"
    assert {"Milchprodukte & Eier", "Obst & Gemüse", "Brot & Backwaren"} <= set(names)
    assert res.unresolved == ["Geschenk für Oma"]
    m = L.item_map(lst, ["Milch", "Geschenk für Oma"])
    assert m["Milch"] == "dairy" and m["Geschenk für Oma"] == L.OTHER


def test_limit_is_never_exceeded():
    lst = L.new_list("Einkaufen", "todo.x", 5)
    items = ["Milch", "Äpfel", "Brot", "Wasser", "Shampoo", "Schrauben", "Erde", "Chips", "Pasta"]
    L.optimize(lst, items, "de", TODAY)
    assert len(lst["categories"]) == 5
    # everything still has a home
    assert all(v for v in L.item_map(lst, items).values())


def test_lowering_limit_folds_categories():
    lst = L.new_list("Einkaufen", "todo.x", 10)
    L.optimize(lst, ["Milch", "Äpfel", "Brot", "Wasser", "Shampoo", "Chips"], "de", TODAY)
    lst["max_categories"] = 5
    L.optimize(lst, ["Milch"], "de", "2026-11-07")
    assert len(lst["categories"]) == 5
    assert lst["categories"][-1]["id"] == L.OTHER


def test_stale_category_makes_room():
    lst = L.new_list("Einkaufen", "todo.x", 5)
    L.optimize(lst, ["Milch", "Äpfel", "Brot", "Wasser"], "de", "2026-09-01")
    assert len(lst["categories"]) == 5
    res = L.optimize(lst, ["Shampoo"], "de", TODAY)
    assert "Drogerie & Hygiene" in res.created and res.removed


def test_ai_suggestions_and_learning():
    lst = L.new_list("Hornbach", "todo.h", 8)
    ai = {"Geschenk für Oma": "Geschenke", "Milch": "Milchprodukte & Eier"}
    L.optimize(lst, ["Geschenk für Oma", "Milch"], "de", TODAY, ai)
    m = L.item_map(lst, ["Geschenk für Oma", "Milch"])
    cat = next(c for c in lst["categories"] if c["id"] == m["Geschenk für Oma"])
    assert cat["name"] == "Geschenke"
    assert m["Milch"] == "dairy"


def test_parse_ai_tolerates_wrapping():
    assert L.parse_ai('Sure!\n```json\n{"Milch": "Milchprodukte"}\n```') == {"Milch": "Milchprodukte"}
    assert L.parse_ai("nope") == {}
    assert L.parse_ai({"a": "b", "c": 1}) == {"a": "b"}


def test_english_names():
    lst = L.new_list("Groceries", "todo.g", 10)
    L.optimize(lst, ["milk", "gift"], "en", TODAY)
    names = [c["name"] for c in lst["categories"]]
    assert "Dairy & eggs" in names and names[-1] == "Other"
