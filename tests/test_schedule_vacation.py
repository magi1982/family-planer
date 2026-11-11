"""Free recurrence rules and holiday detection."""
from datetime import date, timedelta
import importlib.util
from pathlib import Path
import sys

_base = Path(__file__).parents[1] / "custom_components/family_planer"


def _load(name, file):
    if name in sys.modules:
        return sys.modules[name]
    spec = importlib.util.spec_from_file_location(name, _base / file)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


S = _load("fp_schedule", "schedule.py")
E = _load("fp_engine", "engine.py")
V = _load("fp_vacation", "vacation.py")
P = {"a": {"name": "Lea", "aliases": ["Ili"]}, "b": {"name": "Mia", "aliases": []}, "m": {"name": "Tom", "aliases": ["Tommy"]}}
TODAY = date(2026, 11, 6)


def days(sched, n=800, start=date(2026, 1, 1)):
    return [start + timedelta(days=i) for i in range(n) if S.occurrence(sched, start + timedelta(days=i)) is not None]


def test_half_year_interval():
    s = S.validate({"type": "interval", "start": "2026-03-15", "every": 6, "unit": "months"}, TODAY)
    assert days(s)[:3] == [date(2026, 3, 15), date(2026, 9, 15), date(2027, 3, 15)]


def test_month_end_clamping_and_weeks():
    s = S.validate({"type": "interval", "start": "2026-01-31", "every": 1, "unit": "months"}, TODAY)
    assert days(s, 100)[:3] == [date(2026, 1, 31), date(2026, 2, 28), date(2026, 3, 31)]
    w = S.validate({"type": "interval", "start": "2026-01-05", "every": 2, "unit": "weeks"}, TODAY)
    assert days(w, 30) == [date(2026, 1, 5), date(2026, 1, 19)]


def test_monthly_rules():
    last = S.validate({"type": "monthly", "every": 1, "start": "2026-01-01", "mode": "day", "day": -1}, TODAY)
    assert days(last, 70)[:2] == [date(2026, 1, 31), date(2026, 2, 28)]
    sat = S.validate({"type": "monthly", "every": 3, "start": "2026-01-01", "mode": "weekday", "nth": 1, "weekday": 6}, TODAY)
    assert days(sat, 200)[:3] == [date(2026, 1, 3), date(2026, 4, 4), date(2026, 7, 4)]


def test_yearly_and_once():
    y = S.validate({"type": "yearly", "dates": ["10-15", "04-15", "bad"]}, TODAY)
    assert y["dates"] == ["04-15", "10-15"] and days(y)[:3] == [date(2026, 4, 15), date(2026, 10, 15), date(2027, 4, 15)]
    o = S.validate({"type": "once", "dates": ["2026-11-20"]}, TODAY)
    assert days(o, 400) == [date(2026, 11, 20)]
    assert S.validate({"type": "once", "dates": []}, TODAY) is None
    assert S.validate({"type": "evil"}, TODAY) is None


def test_rotation_and_absence():
    chore = {"title": "Pneuwechsel", "persons": ["a", "b"], "rotate": True,
             "schedule": S.validate({"type": "interval", "start": "2026-11-01", "every": 1, "unit": "weeks"}, TODAY)}
    assert S.assignees(chore, P, date(2026, 11, 1)) == ["a"]
    assert S.assignees(chore, P, date(2026, 11, 8)) == ["b"]
    assert S.assignees(chore, P, date(2026, 11, 8), {"b": {"2026-11-08"}}) == ["a"]  # stand-in
    chore["rotate"] = False
    assert S.assignees(chore, P, date(2026, 11, 8), {"b": {"2026-11-08"}}) == ["a"]


def test_engine_creates_special_items_with_window():
    data = {"persons": dict(P), "chores": {}, "items": {}, "history": {}}
    data["chores"]["c"] = E.validate_chore({"title": "Luftfilter", "persons": ["m"], "window": 14,
        "schedule": {"type": "interval", "start": TODAY.isoformat(), "every": 6, "unit": "months"}}, P)
    E.rollover(data, TODAY)
    (it,) = data["items"].values()
    assert it["person_id"] == "m" and it["due"] == (TODAY + timedelta(days=13)).isoformat()


def test_holiday_pauses_without_counting():
    data = {"persons": dict(P), "chores": {"c": {"title": "Tisch", "assign": {"a": {str(i): {} for i in range(1, 8)}}}},
            "items": {}, "history": {}}
    E.rollover(data, TODAY)
    assert len(data["items"]) == 1
    away = {"a": {TODAY.isoformat(), (TODAY + timedelta(days=1)).isoformat()}}
    E.rollover(data, TODAY, away)  # holiday detected during the day: open item removed
    assert data["items"] == {}
    E.rollover(data, TODAY + timedelta(days=1), away)
    assert data["items"] == {} and data["history"] == {}  # nothing counted as missed


def test_vacation_matching_is_safe():
    w = ["Ferien", "Urlaub", "Out of office"]
    assert V.matches("Skiferien Lenzerheide", w) and V.matches("URLAUB", w) and V.matches("Out of Office", w)
    assert not V.matches("Ferienplanung besprechen", w) and not V.matches("Zahnarzt", w)
    assert V.covered_days("2026-12-24", "2026-12-27") == ["2026-12-24", "2026-12-25", "2026-12-26"]
    assert V.covered_days("2026-11-06T09:00:00+01:00", "2026-11-06T17:00:00+01:00") == []  # not a whole day
    assert V.covered_days("2026-11-06T06:00:00+01:00", "2026-11-08T12:00:00+01:00") == ["2026-11-07"]


def test_absences_for_owner_names_and_family():
    ev = {"m": [{"summary": "Lea Skilager Ferien", "start": "2026-12-01", "end": "2026-12-03"},
                {"summary": "Urlaub Italien", "start": "2026-12-10", "end": "2026-12-11"}]}
    a = V.absences(ev, P, ["Ferien", "Urlaub"], "owner")
    assert a == {"a": {"2026-12-01", "2026-12-02"}, "m": {"2026-12-10"}}
    f = V.absences(ev, P, ["Urlaub"], "family")
    assert set(f) == {"a", "b", "m"}


def test_discover_words():
    events = [{"summary": "Sommerferien", "start": "2026-07-01", "end": "2026-07-20"},
              {"summary": "Herbstferien Tessin", "start": "2026-10-03", "end": "2026-10-10"},
              {"summary": "Urlaub", "start": "2026-05-01", "end": "2026-05-04"},
              {"summary": "OOO", "start": "2026-06-01", "end": "2026-06-02"},
              {"summary": "Reise nach Rom", "start": "2026-08-01", "end": "2026-08-04"},
              {"summary": "Ferienplanung", "start": "2026-02-01T10:00:00+01:00", "end": "2026-02-01T11:00:00+01:00"}]
    assert V.discover(events) == ["Ferien", "Urlaub", "OOO"]


# ------------------------------------------------------------------ 0.9.0: holiday check "away / at home"
def test_found_and_decisions():
    persons = {"lea": {"name": "Lea"}, "tom": {"name": "Tom"}}
    ev = {"summary": "Herbstferien", "start": "2026-11-20", "end": "2026-11-23"}
    other = {"summary": "Zahnarzt", "start": "2026-11-20T10:00:00+01:00", "end": "2026-11-20T11:00:00+01:00"}
    by_owner = {"lea": [ev, other], "tom": [ev]}
    found = V.found(by_owner, persons, ["Ferien"], "owner")
    assert len(found) == 1 and found[0]["persons"] == ["lea", "tom"] and found[0]["days"][0] == "2026-11-20"
    key = found[0]["key"]
    assert key == V.event_key(ev) and len(key) == 16
    assert V.absences(by_owner, persons, ["Ferien"], "owner")["lea"] == {"2026-11-20", "2026-11-21", "2026-11-22"}
    # "we stay at home": the holiday no longer pauses chores
    assert V.absences(by_owner, persons, ["Ferien"], "owner", decisions={key: "home"}) == {}
    assert V.absences(by_owner, persons, ["Ferien"], "owner", decisions={key: "away"})["tom"]


# ------------------------------------------------------------------ 0.9.1: long events, scope, review window
def test_long_events_need_a_decision():
    persons = {"lea": {"name": "Lea"}, "tom": {"name": "Tom"}}
    camp = {"summary": "Pfadi-Lager", "start": "2026-11-20", "end": "2026-11-24"}          # several days, no word
    bday = {"summary": "Geburtstag Oma", "start": "2026-11-21", "end": "2026-11-22"}        # one all-day day: ignored
    trip = {"summary": "Messe Basel", "start": "2026-11-25T06:00:00+01:00", "end": "2026-11-26T08:00:00+01:00"}
    by_owner = {"lea": [camp, bday, trip]}
    plain = V.found(by_owner, persons, ["Ferien"], "owner")
    assert plain == []
    longs = V.found(by_owner, persons, ["Ferien"], "owner", long_events=True)
    assert [e["title"] for e in longs] == ["Pfadi-Lager", "Messe Basel"] and all(e["kind"] == "long" for e in longs)
    # without a decision a long event pauses nothing
    assert V.absences(by_owner, persons, ["Ferien"], "owner") == {}
    key = V.event_key(camp)
    away = V.absences(by_owner, persons, ["Ferien"], "owner", decisions={key: {"d": "away", "at": "2026-11-11"}})
    assert away == {"lea": {"2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"}}


def test_decision_for_family_or_persons():
    persons = {"lea": {"name": "Lea"}, "mia": {"name": "Mia"}, "tom": {"name": "Tom"}}
    ev = {"summary": "Skiferien", "start": "2026-12-26", "end": "2026-12-28"}
    by_owner = {"lea": [ev]}
    key = V.event_key(ev)
    fam = V.absences(by_owner, persons, ["Ferien"], "owner", decisions={key: {"d": "away", "family": True}})
    assert set(fam) == {"lea", "mia", "tom"}
    some = V.absences(by_owner, persons, ["Ferien"], "owner", decisions={key: {"d": "away", "persons": ["mia"]}})
    assert set(some) == {"mia"}
    assert V.decision("home")["d"] == "home" and V.decision({"d": "maybe"}) == {}


def test_review_window():
    persons = {"lea": {"name": "Lea"}}
    soon = {"summary": "Herbstferien", "start": "2026-11-20", "end": "2026-11-23"}
    later = {"summary": "Sportferien", "start": "2027-02-06", "end": "2027-02-21"}
    past = {"summary": "Sommerferien", "start": "2026-07-04", "end": "2026-08-10"}
    every = V.found({"lea": [soon, later, past]}, persons, ["Ferien"], "owner", long_events=True)
    today = date(2026, 11, 11)
    rv = V.review(every, {}, today)
    assert [e["title"] for e in rv] == ["Herbstferien"]          # two weeks ahead only, nothing past
    key = V.event_key(soon)
    rv = V.review(every, {key: {"d": "away", "at": "2026-11-11"}}, today)
    assert rv[0]["decision"] == "away"
    # decided more than 4 weeks ago: no longer listed
    assert V.review(every, {key: {"d": "away", "at": "2026-10-01"}}, today) == []
