"""Layout guards for the planer card (tablet bugs fixed in 0.16.1)."""
from pathlib import Path

SRC = (Path(__file__).parents[1] / "frontend_src/ui_week.js").read_text()
NAV = (Path(__file__).parents[1] / "frontend_src/bridge.js").read_text()


def test_task_buttons_do_not_use_display_contents():
    # display:contents in the two-line button overlapped title, tag and points on the tablet
    assert ".bin.two .bl,.bin.two .br{display:contents}" not in SRC
    assert ".bin{flex:1;min-width:0;display:flex;flex-wrap:wrap" in SRC


def test_no_syllable_hyphenation_in_titles():
    assert "hyphens:auto" not in SRC


def test_single_column_lists_can_shrink():
    # 1fr has the button's min-content as minimum and pushed points out of narrow columns
    assert ".bg.one{grid-template-columns:minmax(0,1fr)}" in SRC


def test_names_wrap_instead_of_ellipsis():
    nm = SRC.split("\n      .nm{", 1)[1].split("}", 1)[0]
    assert "text-overflow:ellipsis" not in nm and "-webkit-line-clamp:2" in nm


def test_person_columns_wrap_on_small_screens():
    assert "repeat(auto-fit,minmax(min(100%,150px),1fr))" in SRC


def test_nav_hides_buttons_without_view_unless_editing():
    assert "_editing()" in NAV
    assert "if (miss && !this._editing()) return '';" in NAV
