"""Language setting: fixed choice wins over the Home Assistant language."""
import importlib.util
import pathlib

_spec = importlib.util.spec_from_file_location(
    "fp_validate_lang", pathlib.Path(__file__).parents[1] / "custom_components/family_planer/validate.py")
V = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(V)


def test_auto_follows_home_assistant():
    assert V.language("auto", "de") == "de"
    assert V.language(None, "de-CH") == "de"
    assert V.language("auto", "gsw") == "de"
    assert V.language("auto", "en-GB") == "en"
    assert V.language("auto", "fr") == "en"


def test_fixed_choice_wins():
    assert V.language("de", "en") == "de"
    assert V.language("en", "de") == "en"


def test_invalid_values_fall_back():
    assert V.language("xx", "de") == "de"
    assert V.language("<script>", None) == "en"
