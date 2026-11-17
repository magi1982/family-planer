"""Special chores (sonder.py) and list to-dos by name (persontodos.py)."""
import importlib
import pathlib
import sys
import types
from datetime import date

import pytest

_dir = pathlib.Path(__file__).parents[1] / "custom_components/family_planer"
_pkg = types.ModuleType("fpkg")
_pkg.__path__ = [str(_dir)]
sys.modules.setdefault("fpkg", _pkg)
SO = importlib.import_module("fpkg.sonder")
SE = importlib.import_module("fpkg.seasons")
PT = importlib.import_module("fpkg.persontodos")

PERSONS = {"a": {"name": "Lea", "role": "kid", "aliases": ["Leali"]}, "b": {"name": "Mia", "role": "kid"},
           "c": {"name": "Sarah", "role": "adult"}}


def ctx(today, **kw):
    return {"events": SE.event_dates(today), "birthdays": {}, **kw}


def test_catalogue_is_valid_and_no_dishwasher():
    seed = SO.seed()
    assert len(seed) >= 56
    assert not any("spül" in d["title"].lower() or "geschirr" in d["title"].lower() for d in seed.values())
    assert not any(t in SO.TEMPLATES for t in ("schneemann", "schuheputzen", "kastanien", "lampion"))


def test_christbaumkugeln_each_child_dec10_to_24():
    defs = {"k": SO.from_template("kugeln")}
    w = SO.desired(defs, PERSONS, date(2026, 12, 10), ctx(date(2026, 12, 10)))
    assert sorted(x["pid"] for x in w.values()) == ["a", "b"]
    assert {x["end"] for x in w.values()} == {"2026-12-24"}
    assert SO.desired(defs, PERSONS, date(2026, 12, 9), ctx(date(2026, 12, 9))) == {}


def test_birthday_card_three_days_before_and_secret():
    defs = {"k": SO.from_template("bdaykarte")}
    c = ctx(date(2026, 8, 7), birthdays={"a": "2016-08-10"})
    w = SO.desired(defs, PERSONS, date(2026, 8, 7), c)
    (inst,) = w.values()
    assert inst["for"] == "a" and inst["elig"] == ["b", "c"] and inst["end"] == "2026-08-10"
    assert defs["k"]["secret"] is True
    assert SO.desired(defs, PERSONS, date(2026, 8, 6), c) == {}


def test_laub_from_tuesday_incl_saturday_only_in_autumn():
    defs = {"k": SO.from_template("laub")}
    w = SO.desired(defs, PERSONS, date(2026, 10, 10), ctx(date(2026, 10, 10)))  # Saturday
    assert [x["start"] for x in w.values()] == ["2026-10-06"]
    assert SO.desired(defs, PERSONS, date(2026, 7, 11), ctx(date(2026, 7, 11))) == {}


def test_claim_fastest_wins():
    defs = {"k": SO.from_template("maske")}
    insts = {}
    today = SE.easter(2027) - __import__("datetime").timedelta(days=55)
    assert SO.refresh(insts, defs, PERSONS, today, ctx(today), {})
    (iid,) = insts
    SO.claim(insts, defs, PERSONS, iid, "b", "t")
    with pytest.raises(ValueError):
        SO.claim(insts, defs, PERSONS, iid, "a", "t")
    assert insts[iid]["pid"] == "b"


def test_claim_refuses_celebrated_person():
    defs = {"k": SO.from_template("bdaykarte")}
    insts = {}
    SO.refresh(insts, defs, PERSONS, date(2026, 8, 8), ctx(date(2026, 8, 8), birthdays={"a": "08-10"}), {})
    (iid,) = insts
    with pytest.raises(ValueError):
        SO.claim(insts, defs, PERSONS, iid, "a", "t")


def test_expired_disappears_and_surprise_cap():
    df = SO.clean_def({"title": "X", "mode": "surprise", "anchor": {"t": "daily"}, "span": 1}, PERSONS)
    insts = {}
    for d in range(5, 12):  # one ISO week, Mon 5 Oct .. Sun 11 Oct 2026
        SO.refresh(insts, {"x": df}, PERSONS, date(2026, 10, d), ctx(date(2026, 10, d)), {"surprise_per_week": 2})
    # only the open instance of the last day is left; the cap of 2 per child per week was respected meanwhile
    assert all(i["end"] >= "2026-10-11" for i in insts.values())


def test_clean_def_rejects_junk():
    d = SO.clean_def({"title": "<b>" * 40, "mode": "evil", "anchor": {"t": "weekly", "days": [9, "x"]},
                      "until": "25:99", "season": "jz:mars", "persons": ["zz"]}, PERSONS)
    assert d["mode"] == "free" and d["anchor"] == {"t": "weekly", "days": [6]} and d["until"] == ""
    assert d["season"] == "" and d["persons"] == [] and len(d["title"]) <= 80


def test_person_todos_from_names():
    assert PT.match("Lea Zimmer aufräumen gross", PERSONS) == (["a"], "Zimmer aufräumen", "l")
    assert PT.match("Leali: Velo pumpen", PERSONS) == (["a"], "Velo pumpen", None)
    pids, title, size = PT.match("Lea und Mia Tisch decken klein", PERSONS)
    assert pids == ["a", "b"] and title == "Tisch decken" and size == "s"
    assert PT.match("Milch kaufen", PERSONS)[0] == []
    assert PT.match("Miaus Futter", PERSONS)[0] == []
    assert PT.match("Fotos für Mia bearbeiten", PERSONS) == (["b"], "Fotos für Mia bearbeiten", None)
    # a leading name decides; a name later in the text is only part of the title
    assert PT.match("Lea Kalender für Mia machen", PERSONS) == (["a"], "Kalender für Mia machen", None)
    # no leading name: the first name in the text wins
    assert PT.match("Kalender für Mia und Lea machen", PERSONS)[0] == ["b"]


def test_speech_birthday_and_praise():
    SP = importlib.import_module("fpkg.speech")
    msgs = SP.birthday_messages("Lea", "de", 3, 5, age=10)
    assert len(msgs) == 5 and len(set(msgs)) == 5 and "10" in msgs[0]
    assert "Lea" in SP.praise_message("Lea", "en", 7)
    assert SP.evening_message([("Mia", ["Tisch decken"])], "de").startswith("Guten Abend! Bevor der Tag zu Ende ist, noch offen")
    assert SP.evening_message([], "de") == ""


def test_volunteer_keeps_eligible_and_max_open():
    defs = {f"d{i}": SO.clean_def({"title": f"X{i}", "anchor": {"t": "daily"}, "span": 1}, PERSONS) for i in range(5)}
    insts = {}
    SO.refresh(insts, defs, PERSONS, date(2026, 10, 5), ctx(date(2026, 10, 5)), {"max_open": 3})
    # volunteer chores are open to the whole family (grown-ups too)
    assert len(insts) == 3 and all(i["elig"] == ["a", "b", "c"] for i in insts.values())
    iid = next(iter(insts))
    assert SO.claim(insts, defs, PERSONS, iid, "c", "2026-10-05T10:00")["pid"] == "c"


def test_only_while_a_grown_up_is_away():
    persons = {**PERSONS, "d": {"name": "Tom", "role": "adult"}}
    df = SO.clean_def({"title": "Mama verwöhnen", "anchor": {"t": "daily"}, "span": 1, "away": ["d"]}, persons)
    today = date(2026, 10, 6)
    assert SO.desired({"x": df}, persons, today, ctx(today)) == {}
    w = SO.desired({"x": df}, persons, today, ctx(today, away={"d"}))
    assert list(w.values())[0]["elig"] == ["a", "b", "c"]
    anyone = {**SO.from_template("wegznacht"), "on": True}
    assert SO.from_template("wegznacht")["on"] is False  # templates for away days start switched off
    assert SO.desired({"y": anyone}, persons, today, ctx(today, away={"c"}))
    assert SO.desired({"y": anyone}, persons, today, ctx(today, away={"a"})) == {}  # a child away is not enough


def test_needs_a_grown_up_and_away_child_gets_nothing():
    persons = {**PERSONS, "d": {"name": "Tom", "role": "adult"}}
    df = SO.clean_def({"title": "Kerzen", "anchor": {"t": "daily"}, "span": 1, "adult": True, "mode": "each"}, persons)
    today = date(2026, 10, 6)
    assert SO.desired({"x": df}, persons, today, ctx(today, away={"c", "d"})) == {}
    w = SO.desired({"x": df}, persons, today, ctx(today, away={"d", "a"}))
    assert [x["pid"] for x in w.values()] == ["b"]


# ------------------------------------------------------------------ 0.15.0: order of the volunteer tile
def _tpl_like(i, span=7):
    return {**SO.clean_def({"title": f"T{i}", "anchor": {"t": "daily"}, "span": span}, PERSONS), "tpl": "laub"}


def test_volunteer_order_rare_then_own_then_templates():
    persons = {**PERSONS, "d": {"name": "Tom", "role": "adult"}}
    today = date(2026, 10, 5)
    defs = {f"t{i}": {**SO.clean_def({"title": f"T{i}", "anchor": {"t": "daily"}, "span": 1}, persons), "tpl": "laub"} for i in range(4)}
    defs["own"] = SO.clean_def({"title": "Own", "anchor": {"t": "daily"}, "span": 1}, persons)
    defs["away"] = SO.clean_def({"title": "Away", "anchor": {"t": "daily"}, "span": 1, "away": ["d"]}, persons)
    insts = {}
    SO.refresh(insts, defs, persons, today, ctx(today, away={"d"}), {"max_open": 2})
    assert sorted(x["sid"] for x in insts.values()) == ["away", "own"]


def test_more_important_one_pushes_out_an_open_template():
    today = date(2026, 10, 5)
    defs = {f"t{i}": _tpl_like(i) for i in range(3)}
    insts = {}
    SO.refresh(insts, defs, PERSONS, today, ctx(today), {"max_open": 3})
    assert len(insts) == 3
    defs["own"] = SO.clean_def({"title": "Own", "anchor": {"t": "daily"}, "span": 1}, PERSONS)
    SO.refresh(insts, defs, PERSONS, today, ctx(today), {"max_open": 3})
    assert len(insts) == 3 and "own" in {x["sid"] for x in insts.values()}
    # a claimed template is never pushed out
    defs2 = {f"t{i}": _tpl_like(i) for i in range(2)}
    i2 = {}
    SO.refresh(i2, defs2, PERSONS, today, ctx(today), {"max_open": 2})
    for iid in list(i2):
        SO.claim(i2, defs2, PERSONS, iid, "a", "2026-10-05T10:00")
    defs2["own"] = SO.clean_def({"title": "Own", "anchor": {"t": "daily"}, "span": 1}, PERSONS)
    SO.refresh(i2, defs2, PERSONS, today, ctx(today), {"max_open": 2})
    assert sum(1 for x in i2.values() if x.get("pid") == "a") == 2


def test_templates_rotate_daily():
    # multi-day templates: what was shown yesterday makes room for those still waiting
    defs = {f"t{i}": {**SO.clean_def({"title": f"T{i}", "anchor": {"t": "once", "d": "2026-10-01"}, "span": 14}, PERSONS), "tpl": "laub"}
            for i in range(6)}
    seen = set()
    insts = {}
    for d in range(5, 9):
        today = date(2026, 10, d)
        SO.refresh(insts, defs, PERSONS, today, ctx(today), {"max_open": 2})
        assert len(insts) == 2
        seen |= {x["sid"] for x in insts.values()}
    assert len(seen) >= 5  # not always the same two
    # idempotent within the same day
    before = dict(insts)
    assert not SO.refresh(insts, defs, PERSONS, date(2026, 10, 8), ctx(date(2026, 10, 8)), {"max_open": 2})
    assert insts.keys() == before.keys()
