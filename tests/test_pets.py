"""Tierchen logic: points, drops, care, growth, evolving, eggs and the daily wheel."""
import importlib.util
import pathlib
import random
import sys
from datetime import date, datetime, timedelta, timezone

import pytest

_spec = importlib.util.spec_from_file_location("fp_pets", pathlib.Path(__file__).parents[1] / "custom_components/family_planer/pets.py")
pets = importlib.util.module_from_spec(_spec)
sys.modules["fp_pets"] = pets
_spec.loader.exec_module(pets)

NOW = datetime(2026, 11, 18, 16, 0, tzinfo=timezone.utc)
PERSONS = {"lea": {"name": "Lea", "role": "kid"}, "tom": {"name": "Tom", "role": "adult"}}


def state(**kw):
    st = pets.new_state(NOW)
    st.update(kw)
    return st


def egg_id(st):
    return st["active"]


# ------------------------------------------------------------------ setup
def test_ensure_kids_on_adults_off_by_default():
    data = {}
    assert pets.ensure(data, PERSONS, NOW) is True
    assert data["pets"]["lea"]["on"] is True
    assert data["pets"]["tom"]["on"] is False
    assert pets.ensure(data, PERSONS, NOW) is False
    pets.ensure(data, {"lea": PERSONS["lea"]}, NOW)
    assert "tom" not in data["pets"]


def test_adults_default_setting():
    data = {}
    pets.ensure(data, PERSONS, NOW, adults_default=True)
    assert data["pets"]["tom"]["on"] is True


def test_new_person_starts_with_an_egg_and_some_food():
    st = pets.new_state(NOW)
    pet = st["pets"][st["active"]]
    assert pet["step"] == 0 and pet["kind"] is None
    assert st["inv"]["futter"] > 0 and st["inv"]["wasser"] > 0


# ------------------------------------------------------------------ points
def test_points_follow_earned_coins_and_off_keeps_everything():
    st = state()
    assert pets.sync_points(st, 100) == 0          # first sync only remembers the start
    assert pets.sync_points(st, 130) == 30
    assert st["pts"] == 30
    pets.set_on(st, False)
    assert pets.sync_points(st, 180) == 0          # off: coins yes, points no
    assert st["pts"] == 30                         # nothing lost
    pets.set_on(st, True)
    assert pets.sync_points(st, 190) == 10         # only what is earned after switching on again
    assert st["pts"] == 40


def test_unticking_takes_the_points_back():
    st = state()
    pets.sync_points(st, 0)
    pets.sync_points(st, 10)
    assert pets.sync_points(st, 0) == -10
    assert st["pts"] == 0


def test_spending_coins_never_lowers_points():
    # lifetime coins never sink when coins are spent on rewards, so points stay
    st = state()
    pets.sync_points(st, 200)
    assert pets.sync_points(st, 200) == 0


# ------------------------------------------------------------------ drops
def test_drops_once_per_chore_and_always_something():
    st = state()
    st["inv"] = {}
    rng = random.Random(1)
    e = {"ref": "item:a", "pts": 10, "kind": "chore"}
    got = pets.drops(st, [e], rng)
    assert got and got[0] in ("futter", "wasser")
    assert pets.drops(st, [e], rng) == []          # re-ticking brings nothing new


def test_drops_off_and_other_kinds_bring_nothing():
    st = state(on=False)
    assert pets.drops(st, [{"ref": "item:a", "pts": 10, "kind": "chore"}], random.Random(1)) == []
    st = state()
    assert pets.drops(st, [{"ref": "adj:1", "pts": 10, "kind": "adjust"}], random.Random(1)) == []


def test_pill_chance_is_capped_at_half():
    st = state()
    rng = random.Random(7)
    pills = 0
    for i in range(400):
        got = pets.drops(st, [{"ref": f"item:{i}", "pts": 200, "kind": "chore"}], rng)
        pills += any(g not in ("futter", "wasser") for g in got)
        st["inv"] = {}
    assert 140 < pills < 260


def test_inventory_has_a_maximum():
    st = state()
    st["inv"] = {"futter": 29}
    assert pets.add_item(st, "futter", 5) == 1
    assert st["inv"]["futter"] == 30
    assert pets.add_item(st, "unknown", 1) == 0


# ------------------------------------------------------------------ growth, hatching, evolving
def test_spend_points_into_growth():
    st = state(pts=120)
    eid = egg_id(st)
    assert pets.spend(st, eid, 50) == 30           # the egg only needs 30
    assert st["pts"] == 90
    with pytest.raises(pets.PetError, match="bar_full"):
        pets.spend(st, eid, 50)


def test_spend_without_points():
    st = state(pts=0)
    with pytest.raises(pets.PetError, match="no_points"):
        pets.spend(st, egg_id(st), 50)


def test_spend_never_more_than_fifty_per_tap():
    st = state(pts=500)
    eid = egg_id(st)
    st["pets"][eid].update(step=1, kind="fuchs", g=30)
    assert pets.spend(st, eid, 999) == 50


def test_hatch_needs_full_bar_and_picks_a_missing_kind():
    st = state(pts=30)
    eid = egg_id(st)
    with pytest.raises(pets.PetError, match="not_ready"):
        pets.hatch(st, eid, random.Random(1))
    pets.spend(st, eid, 50)
    kind = pets.hatch(st, eid, random.Random(1))
    assert kind in pets.STARTERS
    assert st["pets"][eid]["step"] == 1


def test_fable_egg_hatches_a_fable():
    st = state()
    eid = pets.new_id()
    st["pets"][eid] = pets.new_egg(NOW, fabel=True)
    st["pets"][eid]["g"] = 30
    assert pets.hatch(st, eid, random.Random(2)) in pets.FABEL


def test_hatch_prefers_kinds_the_child_does_not_have():
    st = state()
    st["pets"] = {f"p{i}": {**pets.new_egg(NOW), "kind": k, "step": 1} for i, k in enumerate(pets.STARTERS[:-1])}
    eid = pets.new_id()
    st["pets"][eid] = {**pets.new_egg(NOW), "g": 30}
    assert pets.hatch(st, eid, random.Random(3)) == pets.STARTERS[-1]


def test_evolve_only_with_full_bar_and_reaching_gross_brings_an_egg():
    st = state()
    eid = egg_id(st)
    st["pets"][eid].update(step=2, kind="fuchs", g=449)
    with pytest.raises(pets.PetError, match="not_ready"):
        pets.evolve(st, eid, {}, "", NOW)
    st["pets"][eid]["g"] = 450
    res = pets.evolve(st, eid, {"theme": "feuer", "deco": ["mane"]}, "Glut-Fuchs", NOW)
    assert res["step"] == 3 and res["egg"] in st["pets"]
    assert st["pets"][res["egg"]]["step"] == 0
    assert st["pets"][eid]["name"] == "Glut-Fuchs"


def test_eggs_cannot_evolve():
    st = state()
    with pytest.raises(pets.PetError, match="egg"):
        pets.evolve(st, egg_id(st), {}, "", NOW)


def test_look_and_names_are_cleaned():
    look = pets.clean_look({"theme": "feuer", "skin": "<script>", "Bad Key": 1, "deco": ["a", "<b>", 3], "n": 2})
    assert look == {"theme": "feuer", "deco": ["a"], "n": 2}
    assert pets.clean_look("nope") == {}
    assert "<" not in pets.clean_name('<img src=x onerror="1">Flocke', 40) and '"' not in pets.clean_name('a"b', 16)
    assert "<" not in pets.clean_name("<b>Flo</b>", 16)
    assert len(pets.clean_name("x" * 50, 16)) == 16


def test_growth_speed_setting():
    assert pets.thresholds("fast")[1] < pets.thresholds("normal")[1] < pets.thresholds("slow")[1]


# ------------------------------------------------------------------ pills
def test_growth_pill_and_not_used_when_bar_full():
    st = state()
    eid = egg_id(st)
    st["pets"][eid].update(step=1, kind="fuchs", g=30)
    st["inv"]["wachs_m"] = 1
    assert pets.use(st, eid, "wachs_m", NOW) == {"grow": 30}
    assert "wachs_m" not in st["inv"]
    st["pets"][eid]["g"] = 150
    st["inv"]["wachs_s"] = 1
    with pytest.raises(pets.PetError, match="bar_full"):
        pets.use(st, eid, "wachs_s", NOW)
    assert st["inv"]["wachs_s"] == 1               # nothing lost


def test_evolution_pill_fills_the_bar_at_any_step_also_eggs():
    st = state()
    eid = egg_id(st)
    st["inv"][pets.DEV_PILL] = 2
    assert pets.use(st, eid, pets.DEV_PILL, NOW) == {"ready": True}
    assert pets.ready(st["pets"][eid])
    st["pets"][eid].update(step=4, kind="fuchs", g=800)
    pets.use(st, eid, pets.DEV_PILL, NOW)
    assert st["pets"][eid]["g"] == 1150


# ------------------------------------------------------------------ care
def test_care_item_is_not_used_when_not_needed():
    st = state()
    eid = egg_id(st)
    st["pets"][eid].update(step=1, kind="fuchs")
    st["pets"][eid]["v"]["hunger"] = 96
    with pytest.raises(pets.PetError, match="not_needed"):
        pets.use(st, eid, "futter", NOW)
    assert st["inv"]["futter"] == 3
    st["pets"][eid]["v"]["hunger"] = 40
    pets.use(st, eid, "futter", NOW)
    assert st["pets"][eid]["v"]["hunger"] == 75 and st["inv"]["futter"] == 2
    assert st["stats"]["fed"] == 1


def test_toys_stay_and_need_energy():
    st = state()
    eid = egg_id(st)
    st["pets"][eid].update(step=1, kind="fuchs")
    st["inv"]["ball"] = 1
    st["pets"][eid]["v"].update(energie=60, laune=50)
    pets.use(st, eid, "ball", NOW)
    assert st["inv"]["ball"] == 1                  # toys stay
    assert st["pets"][eid]["v"]["laune"] == 70 and st["pets"][eid]["v"]["energie"] == 50
    st["pets"][eid]["v"]["energie"] = 10
    with pytest.raises(pets.PetError, match="too_tired"):
        pets.use(st, eid, "ball", NOW)


def test_eggs_need_no_care():
    st = state()
    with pytest.raises(pets.PetError, match="egg"):
        pets.use(st, egg_id(st), "futter", NOW)


def test_unknown_items_and_pets():
    st = state()
    with pytest.raises(pets.PetError, match="no_item"):
        pets.use(st, egg_id(st), "rocket", NOW)
    with pytest.raises(pets.PetError, match="no_pet"):
        pets.use(st, "nope", "futter", NOW)


def test_values_sink_slowly_never_below_floor_and_pause_when_away():
    pet = {**pets.new_egg(NOW), "step": 1, "kind": "fuchs"}
    pets.decay(pet, NOW + timedelta(hours=10))
    assert pet["v"]["hunger"] == 40
    pets.decay(pet, NOW + timedelta(days=30))
    assert min(pet["v"].values()) == pets.NEED_FLOOR
    pet2 = {**pets.new_egg(NOW), "step": 1, "kind": "fuchs"}
    pets.decay(pet2, NOW + timedelta(days=5), paused=True)
    assert pet2["v"]["hunger"] == 70
    pet3 = {**pets.new_egg(NOW), "step": 1, "kind": "fuchs"}
    pets.decay(pet3, NOW + timedelta(hours=10), mode="off")
    assert pet3["v"]["hunger"] == 70


# ------------------------------------------------------------------ other actions
def test_active_nick_and_on_off():
    st = state()
    eid = egg_id(st)
    other = pets.new_id()
    st["pets"][other] = pets.new_egg(NOW)
    pets.set_active(st, other)
    assert st["active"] == other
    with pytest.raises(pets.PetError):
        pets.set_active(st, "nope")
    assert pets.set_nick(st, eid, '  Flo"cke<> ') == "Flocke"
    pets.set_on(st, False)
    assert st["on"] is False and st["pets"]


# ------------------------------------------------------------------ wheel
def test_wheel_has_24_fields_and_no_neighbours_alike():
    f = pets.FIELDS
    assert len(f) == 24
    assert all(f[i] != f[i + 1] for i in range(23))
    assert {k: f.count(k) for k, _ in pets.PRIZES} == dict(pets.PRIZES)


def test_wheel_once_a_day_with_daily_food():
    st = state()
    st["inv"] = {}
    day = date(2026, 11, 18)
    res = pets.spin(st, day, random.Random(4))
    assert 0 <= res["field"] < 24 and res["prize"] == pets.FIELDS[res["field"]]
    assert st["inv"]["futter"] >= 2 and st["inv"]["wasser"] >= 2
    if res["prize"] != "again":
        with pytest.raises(pets.PetError, match="spun"):
            pets.spin(st, day, random.Random(4))
    pets.spin(st, day + timedelta(days=1), random.Random(4))


def test_wheel_again_allows_a_second_spin():
    st = state()
    rng = random.Random()
    idx = pets.FIELDS.index("again")
    rng.randrange = lambda n: idx
    pets.spin(st, date(2026, 11, 18), rng)
    assert st["wheel"] == ""


def test_wheel_off_person_cannot_spin():
    with pytest.raises(pets.PetError, match="off"):
        pets.spin(state(on=False), date(2026, 11, 18), random.Random(1))


def test_wheel_pity_counters():
    st = state()
    st["luck"]["fabel"] = pets.FABEL_PITY_DAYS - 1
    res = pets.spin(st, date(2026, 11, 18), random.Random(5))
    assert res["star"] == "fabel_egg" and st["pets"][res["egg"]]["fabel"] is True
    st2 = state()
    st2["luck"]["dev"] = pets.DEV_PITY_SPINS - 1
    rng = random.Random()
    rng.randrange = lambda n: pets.FIELDS.index("grow")
    assert pets.spin(st2, date(2026, 11, 18), rng)["prize"] == "dev"


def test_wheel_fields_per_egg_setting():
    for mode, eggs in (("rare", 0), ("normal", 1), ("often", 2)):
        f = pets.FIELDS_BY_MODE[mode]
        assert len(f) == 24 and f.count("egg") == eggs and f.count("food") == 5 - eggs
        assert all(f[i] != f[i + 1] for i in range(23))
    assert pets.FIELDS_BY_MODE["normal"] == pets.FIELDS


def _fixed(field, mode="normal"):
    rng = random.Random(1)
    rng.randrange = lambda n: pets.FIELDS_BY_MODE[mode].index(field)
    return rng


def test_wheel_points_field_gives_30():
    st = state()
    res = pets.spin(st, date(2026, 11, 18), _fixed("pts"))
    assert res["pts"] == 30 and st["pts"] == 30


def test_wheel_egg_field_gives_an_egg_only_when_none_waits():
    st = state()
    eid = egg_id(st)
    st["pets"][eid]["g"] = 30
    pets.hatch(st, eid, random.Random(2))
    res = pets.spin(st, date(2026, 11, 18), _fixed("egg"))
    assert res["egg"] in st["pets"] and st["pets"][res["egg"]]["step"] == 0
    # the next day an egg is still waiting: a big growth pill instead, no second egg
    res2 = pets.spin(st, date(2026, 11, 19), _fixed("egg"))
    assert "egg" not in res2 and res2["instead"] and st["inv"]["wachs_l"] == 1
    assert sum(1 for p in st["pets"].values() if p["step"] == 0) == 1


def test_garden_growth_babies_and_young_ones_only():
    st = state()
    day = date(2026, 11, 18)
    st["pets"] = {"a": {**pets.new_egg(datetime(2026, 11, 1)), "step": 4, "g": 800},
                  "b": {**pets.new_egg(datetime(2026, 11, 1)), "step": 1, "g": 40},
                  "c": {**pets.new_egg(datetime(2026, 11, 1)), "step": 3, "g": 460},
                  "d": {**pets.new_egg(datetime(2026, 11, 1)), "step": 2, "g": 448},
                  "e": pets.new_egg(datetime(2026, 11, 1))}
    st["active"] = "a"
    assert pets.garden_grow(st, day) == 0  # first day only remembers the date
    assert pets.garden_grow(st, day + timedelta(days=2)) == 2 * pets.GARDEN_GROW + 2
    assert st["pets"]["b"]["g"] == 46 and st["pets"]["d"]["g"] == 450  # never past a full bar
    assert st["pets"]["a"]["g"] == 800 and st["pets"]["c"]["g"] == 460 and st["pets"]["e"]["g"] == 0
    # a long break pays out at most a week, holidays and switched-off pets pay nothing
    assert pets.garden_grow(st, day + timedelta(days=60)) == pets.GARDEN_MAX_DAYS * pets.GARDEN_GROW
    assert pets.garden_grow(st, day + timedelta(days=61), paused=True) == 0
    st["on"] = False
    assert pets.garden_grow(st, day + timedelta(days=62)) == 0
    assert st["garden"] == (day + timedelta(days=62)).isoformat()  # the day moves on, nothing is saved up


def test_view_tells_need_and_ready():
    st = state()
    eid = egg_id(st)
    st["pets"][eid]["g"] = 30
    v = pets.view(st)
    assert v["pets"][eid]["need"] == 30 and v["pets"][eid]["ready"] is True
    assert v["spun"] is False



def test_grant_gives_only_pet_points_and_never_goes_below_zero():
    st = state()
    assert pets.grant(st, 50) == 50 and st["pts"] == 50
    assert pets.grant(st, -80) == 0
    with pytest.raises(pets.PetError):
        pets.grant(st, 5000)


# ------------------------------------------------------------------ special things (0.19)
def _hatched(st, kind="fuchs", step=1, g=None):
    eid = egg_id(st)
    p = st["pets"][eid]
    p.update(kind=kind, step=step, g=pets.STEPS[step] if g is None else g)
    return eid


def test_wish_crystal_picks_the_animal_of_an_egg():
    st = state()
    eid = egg_id(st)
    st["inv"]["traumkristall"] = 1
    with pytest.raises(pets.PetError, match="bad_wish"):
        pets.use(st, eid, "traumkristall", datetime(2026, 11, 18), wish="pegasus")  # a fable only from a fable egg
    pets.use(st, eid, "traumkristall", datetime(2026, 11, 18), wish="koala")
    assert "traumkristall" not in st["inv"]
    st["pets"][eid]["g"] = 30
    assert pets.hatch(st, eid, random.Random(1)) == "koala" and "wish" not in st["pets"][eid]


def test_wish_crystal_only_on_eggs():
    st = state()
    eid = _hatched(st)
    st["inv"]["traumkristall"] = 1
    with pytest.raises(pets.PetError, match="not_egg"):
        pets.use(st, eid, "traumkristall", datetime(2026, 11, 18), wish="koala")
    assert st["inv"]["traumkristall"] == 1


def test_star_stone_fills_the_bar_and_gives_a_star_aura():
    st = state()
    eid = _hatched(st, step=2)
    st["inv"]["sternenstein"] = 1
    res = pets.use(st, eid, "sternenstein", datetime(2026, 11, 18))
    assert res["ready"] and pets.ready(st["pets"][eid]) and st["pets"][eid]["look"]["aura"] == "sterne"


def test_feather_and_mirror_change_the_colour_once():
    st = state()
    eid = _hatched(st)
    st["inv"].update(regenbogenfeder=1, zauberspiegel=1)
    pets.use(st, eid, "regenbogenfeder", datetime(2026, 11, 18))
    assert st["pets"][eid]["look"]["skin"] == "regenbogen"
    pets.use(st, eid, "zauberspiegel", datetime(2026, 11, 18))
    assert st["pets"][eid]["look"]["skin"] == "kristall"
    st["inv"]["zauberspiegel"] = 1
    with pytest.raises(pets.PetError, match="not_needed"):
        pets.use(st, eid, "zauberspiegel", datetime(2026, 11, 18))


def test_far_sight_shows_the_tree_for_an_hour():
    st = state()
    st["inv"]["weitblick"] = 1
    pets.use(st, egg_id(st), "weitblick", datetime(2026, 11, 18, 19, 0))
    assert st["sight"] == "2026-11-18T20:00:00" and pets.view(st)["sight"] == st["sight"]


def test_pillow_and_lantern_stay_and_help():
    st = state()
    eid = _hatched(st)
    st["inv"].update(kissen=1, laterne=1)
    st["pets"][eid]["v"]["energie"] = 10
    pets.use(st, eid, "kissen", datetime(2026, 11, 18))
    assert st["pets"][eid]["v"]["energie"] == 50 and st["inv"]["kissen"] == 1  # stays
    st["pets"][eid]["v"]["laune"] = 99
    with pytest.raises(pets.PetError, match="not_needed"):
        pets.use(st, eid, "laterne", datetime(2026, 11, 18))
