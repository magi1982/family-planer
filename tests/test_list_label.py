"""Chips show the owner of a list, never an e-mail address."""
import importlib.util
import pathlib

_spec = importlib.util.spec_from_file_location("fp_persontodos_lbl", pathlib.Path(__file__).parents[1] / "custom_components/family_planer/persontodos.py")
persontodos = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(persontodos)

P = {"a": {"name": "Lea", "aliases": ["Leli"]}, "b": {"name": "Tom"}, "c": {"name": "Mia"}}


def test_email_list_becomes_owner_name():
    assert persontodos.list_label("lea@example.org To-do-Liste", P) == "Lea"
    assert persontodos.list_label("tom.muster@example.org Einkaufsliste", P) == "Tom"
    assert persontodos.list_label("leli@example.org Ikea", P) == "Lea"


def test_unknown_owner_shows_list_name_not_address():
    assert persontodos.list_label("zoe@example.org Hornbach", P) == "Hornbach"
    assert persontodos.list_label("zoe.x@example.org", P) == "Zoe"
    assert "@" not in persontodos.list_label("x@example.org", {})


def test_normal_names_unchanged():
    assert persontodos.list_label("Alexa To-do", P) == "Alexa To-do"
    assert persontodos.list_label("Lea Ämtli", P) == "Lea Ämtli"
