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


def test_unicorn_story_always_has_a_rainbow():
    taps = (Path(__file__).parents[1] / "frontend_src/taps.js").read_text()
    season = (Path(__file__).parents[1] / "frontend_src/season.js").read_text()
    # the scene marks its rainbow; story 49 brings its own one and drops it only if the scene shows one
    assert 'class="rbw"' in season
    assert 'class="rb49 needrb"' in taps and "querySelectorAll('.needrb')" in taps


def test_volunteer_is_a_toolbar_button_not_a_column():
    """Free special chores: yellow toolbar button + popup, the family columns keep their width."""
    js = (Path(__file__).parents[1] / "frontend_src/ui_week.js").read_text(encoding="utf-8")
    assert "data-volopen" in js and 'class="vpop"' in js
    assert 'class="tcol volc"' not in js
    assert "['extra', 'Extras']" in js
    assert "data-todos " not in js  # the To-dos counter button is gone; "+" opens the to-do overview
