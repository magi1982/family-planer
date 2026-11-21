"""Tierchen (pets): growth, care, inventory and the daily wheel (no Home Assistant imports, unit-testable).

Store layout (``data["pets"]``):

    {pid: {"on": bool,                      # pets switched on for this person (off = no points, nothing lost)
           "pts": int,                      # Tierchen-Punkte (separate from the reward coins)
           "base": int | None,              # lifetime coins already turned into points (see sync_points)
           "active": pet id,                # the pet that is cared for and sits on the planer card
           "pets": {pet id: PET},
           "inv": {item: count},
           "wheel": "YYYY-MM-DD" | "",      # day of the last spin
           "luck": {"fabel": days, "dev": spins},   # pity counters
           "drops": [ledger refs],          # chores that already dropped something (re-ticking drops nothing)
           "stats": {"fed", "spins", "evos"}}}

    PET = {"kind": str | None (None while an egg), "fabel": bool (egg from the star field), "step": 0..6,
           "g": growth, "look": {...}, "name": evolution name, "nick": child's name,
           "since": iso date, "v": {hunger, durst, energie, laune}, "vt": iso time of v}

Points: every coin a person earns (reward ledger, lifetime – spending coins never takes points away) is
turned into the same number of Tierchen-Punkte while pets are on. Switched off: coins yes, points no.
Growth only comes from points the child puts in, pills and the wheel; evolving is always the child's own action.
"""
from __future__ import annotations

import random
import re
import secrets
from datetime import date, datetime, timedelta

# ------------------------------------------------------------------ catalogue
FOOD = {"fuchs": "beeren", "katze": "fisch", "hund": "knochen", "hase": "karotte", "igel": "wurm", "waschbaer": "apfel",
        "panda": "bambus", "erdmann": "grille", "eichhorn": "nuss", "hamster": "koerner", "maus": "kaese", "einhorn": "apfel",
        "otter": "fisch", "frosch": "grille", "axolotl": "wurm", "eidechse": "grille", "chamae": "grille", "drache": "chili",
        "eule": "wurm", "pinguin": "fisch", "ente": "koerner", "papagei": "nuss", "biene": "nektar", "kaefer": "blatt",
        "falter": "nektar", "reh": "apfel", "pony": "karotte", "koala": "blatt", "faultier": "blatt", "robbe": "fisch",
        "biber": "zweig", "flamingo": "garnele", "fledermaus": "beeren", "kolibri": "nektar", "tiger": "keule",
        "pegasus": "apfel", "phoenix": "chili", "greif": "keule", "kitsune": "beeren", "yeti": "beeren", "nessie": "fisch",
        "wolpi": "karotte"}
KINDS = tuple(FOOD)
FABEL = ("pegasus", "phoenix", "greif", "kitsune", "yeti", "nessie", "wolpi")
STARTERS = tuple(k for k in KINDS if k not in FABEL)
MAX_PER_KIND = 3
# growth needed for each step: Ei, Baby, Jungtier, Gross, Endform, Schein, Legende
STEPS = (0, 30, 150, 450, 800, 1150, 1750)
STEP_NAMES = ("ei", "baby", "jung", "gross", "endform", "schein", "legende")
NEW_EGG_AT = 3          # reaching "Gross" brings a new egg
SPEND_MAX = 50          # points per tap
SPEEDS = {"slow": 1.5, "normal": 1.0, "fast": 0.6}

NEEDS = ("hunger", "durst", "energie", "laune")
NEED_FLOOR = 10         # pets never suffer: values never drop below this
DECAY = {"off": 0.0, "slow": 0.5, "normal": 1.0}
DECAY_PER_H = {"hunger": 3.0, "durst": 4.0, "energie": 2.0, "laune": 1.5}
# at night the pet sleeps and fills up its energy (local time of Home Assistant): no more tired pets in the morning
SLEEP_FROM, SLEEP_TO, SLEEP_PER_H = 21, 7, 8.0
# by day a tired pet takes a nap of about an hour by itself – unless the child gives it something first
NAP_BELOW, NAP_HOURS, NAP_PER_H = 25.0, 1.0, 40.0


def asleep(at: datetime) -> bool:
    return at.hour >= SLEEP_FROM or at.hour < SLEEP_TO

# item: (kind, effect) – care items are used up, toys stay, pills grow
CARE = {"futter": {"hunger": 35}, "wasser": {"durst": 40}, "keks": {"laune": 20}, "energy": {"energie": 100},
        "seife": {"laune": 10}, "happy": {"laune": 100}}
TOYS = {"ball": {"laune": 20, "energie": -10}, "wolle": {"laune": 20, "energie": -10},
        "blasen": {"laune": 20, "energie": -10}, "buerste": {"laune": 15}}
GROW = {"wachs_s": 15, "wachs_m": 30, "wachs_l": 60}
# sleeping things stay (like toys) and need no energy: the pillow refills energy, the lantern brings a good mood
REST = {"kissen": {"energie": 40}, "laterne": {"laune": 15}}
DEV_PILL = "glitzerpille"
ARTEFACTS = ("sternenstein", "weitblick", "zauberspiegel", "traumkristall", "regenbogenfeder")
EXTRAS = ("keks", "energy", "seife", "happy", "ball", "wolle", "blasen", "buerste", "kissen", "laterne")
CAPS = {"futter": 30, "wasser": 30, "keks": 20, "energy": 10, "seife": 10, "happy": 10, "wachs_s": 20, "wachs_m": 20,
        "wachs_l": 20, DEV_PILL: 5, "ball": 1, "wolle": 1, "blasen": 1, "buerste": 1, "kissen": 1, "laterne": 1,
        **{a: 1 for a in ARTEFACTS}}
ITEMS = tuple(CAPS)

# the daily wheel: 24 equal fields (same order is used by the planer to draw the wheel)
# "pts" gives PRIZE_PTS points; "egg" a new egg (only when none is waiting, otherwise a big growth pill).
# How many egg fields depends on the setting "new eggs": rare 0 / normal 1 / often 2 (taken from food).
PRIZES = (("grow", 6), ("extra", 6), ("food", 4), ("pts", 4), ("dev", 1), ("egg", 1), ("again", 1), ("star", 1))
PRIZE_PTS = 30
EGG_MODES = {"rare": 0, "normal": 1, "often": 2}
# pets in the garden (not the active one) grow a little by themselves every day – only babies and young ones,
# so there are always some pets "in between"; checked by tests/test_pets_balance.py (10 pets after 3 months)
GARDEN_GROW = 3
GARDEN_UNTIL = 3        # step below which garden growth works (Baby, Jungtier)
GARDEN_MAX_DAYS = 7     # a long pause does not pay out all at once
STAR = ("fabel_egg", "artefact", "jackpot")
FABEL_PITY_DAYS = 60    # a fable egg at the latest after this many spins without one
DEV_PITY_SPINS = 24     # an evolution pill at the latest after this many spins without one (balance: tests/test_pets_balance.py)


def prizes(eggs: str = "normal") -> tuple:
    """The 24 fields for an egg setting: egg fields are taken from (or given back to) the food fields."""
    want = EGG_MODES.get(eggs, 1)
    out = []
    for k, n in PRIZES:
        if k == "egg":
            n = want
        elif k == "food":
            n = n + 1 - want
        if n > 0:
            out.append((k, n))
    return tuple(out)


def wheel_fields(eggs: str = "normal") -> list[str]:
    """24 fields, the big prizes spread around the wheel (never two equal fields next to each other)."""
    left = {k: n for k, n in prizes(eggs)}
    out: list[str] = []
    last = None
    for _ in range(sum(left.values())):
        pick = max((k for k in left if left[k] and k != last), key=lambda k: left[k], default=None)
        if pick is None:
            pick = next(k for k in left if left[k])
        out.append(pick)
        left[pick] -= 1
        last = pick
    return out


FIELDS = tuple(wheel_fields())
FIELDS_BY_MODE = {m: tuple(wheel_fields(m)) for m in EGG_MODES}


class PetError(ValueError):
    """Reason in .args[0] – a translatable code shown to the child (e.g. not_needed, no_item)."""


def new_id() -> str:
    return secrets.token_hex(5)


# ------------------------------------------------------------------ helpers
def thresholds(speed: str = "normal") -> tuple[int, ...]:
    f = SPEEDS.get(speed, 1.0)
    return tuple(round(s * f) for s in STEPS)


def next_need(pet: dict, speed: str = "normal") -> int | None:
    """Growth needed for the next step (None = fully grown)."""
    th = thresholds(speed)
    return th[pet["step"] + 1] if pet["step"] + 1 < len(th) else None


def ready(pet: dict, speed: str = "normal") -> bool:
    need = next_need(pet, speed)
    return need is not None and pet["g"] >= need


def _now_iso(now: datetime) -> str:
    return now.replace(microsecond=0).isoformat()


def new_egg(now: datetime, fabel: bool = False) -> dict:
    return {"kind": None, "fabel": bool(fabel), "step": 0, "g": 0, "look": {}, "name": "", "nick": "",
            "since": now.date().isoformat(), "v": {n: 70 for n in NEEDS}, "vt": _now_iso(now)}


def new_state(now: datetime, on: bool = True) -> dict:
    eid = new_id()
    return {"on": bool(on), "pts": 0, "base": None, "active": eid, "pets": {eid: new_egg(now)},
            "inv": {"futter": 3, "wasser": 3}, "wheel": "", "luck": {"fabel": 0, "dev": 0}, "drops": [],
            "stats": {"fed": 0, "spins": 0, "evos": 0}}


def gift_toy(st: dict, rng: random.Random) -> str:
    """One-time present (0.19.8): a random toy for everyone, one they don't have yet if possible. '' = already given."""
    if st.get("gift_toy"):
        return ""
    st["gift_toy"] = True
    pool = [t for t in TOYS if not st["inv"].get(t)] or list(TOYS)
    toy = rng.choice(sorted(pool))
    return toy if add_item(st, toy) else ""


def ensure(data: dict, persons: dict, now: datetime, adults_default: bool = False) -> bool:
    """Every person gets a state (kids switched on, adults as set); removed persons are dropped. True = changed."""
    store = data.setdefault("pets", {})
    changed = False
    for pid, p in persons.items():
        if pid not in store:
            store[pid] = new_state(now, on=(p.get("role") != "adult") or adults_default)
            changed = True
    for pid in [k for k in store if k not in persons]:
        del store[pid]
        changed = True
    return changed


def add_item(st: dict, item: str, n: int = 1) -> int:
    """Put n of an item into the inventory (up to its maximum); returns how many really went in."""
    if item not in CAPS or n <= 0:
        return 0
    have = st["inv"].get(item, 0)
    put = max(0, min(n, CAPS[item] - have))
    if put:
        st["inv"][item] = have + put
    return put


def _take(st: dict, item: str) -> None:
    if st["inv"].get(item, 0) <= 0:
        raise PetError("no_item")
    st["inv"][item] -= 1
    if not st["inv"][item]:
        del st["inv"][item]


def _pet(st: dict, pet_id: str) -> dict:
    pet = st["pets"].get(pet_id)
    if pet is None:
        raise PetError("no_pet")
    return pet


# ------------------------------------------------------------------ points and drops
def sync_points(st: dict, lifetime_coins: int) -> int:
    """Turn newly earned coins into Tierchen-Punkte; returns the points added (may be negative after un-ticking).

    While pets are off, earnings are only remembered (base moves on) – switching on again does not pay them out,
    but nothing that was already there is lost.
    """
    if st["base"] is None:
        st["base"] = lifetime_coins
        return 0
    delta = lifetime_coins - st["base"]
    st["base"] = lifetime_coins
    if not st["on"] or not delta:
        return 0
    st["pts"] += delta
    return delta


def grant(st: dict, points: int) -> int:
    """Pet points given by a parent (service add_pet_points): only pet points, no coins. Returns the new total."""
    points = int(points)
    if not -1000 <= points <= 1000:
        raise PetError("bad_amount")
    st["pts"] = max(0, st["pts"] + points) if points < 0 else st["pts"] + points
    return st["pts"]


def _grow_pill(pts: int) -> str:
    return "wachs_s" if pts < 10 else "wachs_m" if pts < 20 else "wachs_l"


def drops(st: dict, entries: list[dict], rng: random.Random) -> list[str]:
    """Things found when chores are done: always food or a drink, sometimes a pill.

    entries: new ledger entries (chore / todo / sonder) of this person. Every ref drops only once, so
    un-ticking and ticking again brings nothing new. Pill chance = points in percent (special chores double,
    at most 50 %); of the pills 7/10 growth (size by the chore's points), 2/10 evolution, 1/10 happy.
    """
    if not st["on"]:
        return []
    seen = set(st["drops"])
    got: list[str] = []
    for e in entries:
        ref = e.get("ref") or ""
        if not ref or ref in seen or e.get("pts", 0) <= 0 or e.get("kind") not in ("chore", "fair", "todo", "sonder"):
            continue
        seen.add(ref)
        st["drops"].append(ref)
        food = "futter" if (len(st["drops"]) % 2) else "wasser"
        if add_item(st, food):
            got.append(food)
        chance = min(50, e["pts"] * (2 if e["kind"] == "sonder" else 1))
        if rng.random() * 100 < chance:
            r = rng.random()
            pill = _grow_pill(e["pts"]) if r < .7 else DEV_PILL if r < .9 else "happy"
            if add_item(st, pill):
                got.append(pill)
    st["drops"] = st["drops"][-400:]
    return got


# ------------------------------------------------------------------ needs (they sink slowly, never below the floor)
def decay(pet: dict, now: datetime, mode: str = "normal", paused: bool = False) -> None:
    """Bring the care values up to now. Away (holidays) = paused: values stay as they were."""
    try:
        then = datetime.fromisoformat(pet["vt"])
    except (KeyError, TypeError, ValueError):
        then = now
    if then.tzinfo is None and now.tzinfo is not None:
        then = then.replace(tzinfo=now.tzinfo)
    hours = max(0.0, (now - then).total_seconds() / 3600)
    pet["vt"] = _now_iso(now)
    f = DECAY.get(mode, 1.0)
    if paused or not f or not hours or pet["step"] == 0:
        return
    for n in NEEDS:
        if n != "energie":
            pet["v"][n] = max(NEED_FLOOR, round(pet["v"].get(n, 70) - DECAY_PER_H[n] * f * hours, 1))
    # energy in quarter hours: it sinks by day and fills up while the pet sleeps at night
    e = float(pet["v"].get("energie", 70))
    step = 0.25
    at = then
    try:
        nap = datetime.fromisoformat(pet.get("nap") or "")
        if nap.tzinfo is None and now.tzinfo is not None:
            nap = nap.replace(tzinfo=now.tzinfo)
    except ValueError:
        nap = None
    for _ in range(int(min(hours, 96) / step)):
        at += timedelta(hours=step)
        if asleep(at):
            e = min(100.0, e + SLEEP_PER_H * step)
        elif nap and at <= nap:
            e = min(100.0, e + NAP_PER_H * step)
        elif e < NAP_BELOW:  # tired: a nap of about an hour
            nap = at + timedelta(hours=NAP_HOURS)
            e = min(100.0, e + NAP_PER_H * step)
        else:
            e = max(NEED_FLOOR, e - DECAY_PER_H["energie"] * f * step)
    pet["v"]["energie"] = round(e, 1)
    pet["nap"] = _now_iso(nap) if nap and nap > now else ""


# ------------------------------------------------------------------ actions (each raises PetError with a reason code)
def spend(st: dict, pet_id: str, amount: int, speed: str = "normal") -> int:
    """Put points into a pet's growth (at most SPEND_MAX per tap, never more than it still needs)."""
    pet = _pet(st, pet_id)
    need = next_need(pet, speed)
    if need is None:
        raise PetError("fully_grown")
    if pet["g"] >= need:
        raise PetError("bar_full")
    amt = min(int(amount), SPEND_MAX, st["pts"], need - pet["g"])
    if amt <= 0:
        raise PetError("no_points")
    st["pts"] -= amt
    pet["g"] += amt
    return amt


def use(st: dict, pet_id: str, item: str, now: datetime, speed: str = "normal", wish: str | None = None) -> dict:
    """Use an item on a pet. Nothing is used up when the pet does not need it."""
    pet = _pet(st, pet_id)
    if item not in CAPS:
        raise PetError("no_item")
    if st["inv"].get(item, 0) <= 0:
        raise PetError("no_item")
    if item in GROW:
        need = next_need(pet, speed)
        if need is None:
            raise PetError("fully_grown")
        if pet["g"] >= need:
            raise PetError("bar_full")
        _take(st, item)
        add = min(GROW[item], need - pet["g"])
        pet["g"] += add
        return {"grow": add}
    if item == DEV_PILL:
        need = next_need(pet, speed)
        if need is None:
            raise PetError("fully_grown")
        _take(st, item)
        pet["g"] = max(pet["g"], need)
        return {"ready": True}
    if item in ARTEFACTS:
        return _use_artefact(st, pet, item, now, speed, wish)
    if pet["step"] == 0:
        raise PetError("egg")
    if item in ("energy", "kissen"):
        pet["nap"] = ""  # the child gave energy: no nap needed any more
    if item in REST:
        eff = REST[item]
        if all(pet["v"].get(n, 0) >= 95 for n in eff):
            raise PetError("not_needed")
    elif item in CARE:
        eff = CARE[item]
        if all(pet["v"].get(n, 0) >= 95 for n in eff):
            raise PetError("not_needed")
        _take(st, item)
    elif item in TOYS:
        eff = TOYS[item]
        if pet["v"].get("energie", 0) < 20:
            raise PetError("too_tired")
        if pet["v"].get("laune", 0) >= 95:
            raise PetError("not_needed")
    else:
        raise PetError("not_usable")
    for n, d in eff.items():
        pet["v"][n] = max(NEED_FLOOR, min(100, pet["v"].get(n, 70) + d))
    pet["vt"] = _now_iso(now)
    if item == "futter":
        st["stats"]["fed"] += 1
    return {"v": dict(pet["v"])}


# ------------------------------------------------------------------ artefacts: their effect stays with the pet for good
ART_SKINS = {"regenbogenfeder": "regenbogen", "zauberspiegel": "kristall"}
# levels that used to unlock an avatar companion give an artefact instead (once per level and school year)
LEVEL_ARTEFACTS = {4: "sternenstein", 8: "regenbogenfeder", 13: "weitblick", 18: "zauberspiegel", 22: "traumkristall",
                   27: "sternenstein"}


def art(pet: dict) -> dict:
    """What artefacts did to this pet: unlocked colours, star aura, far-sight – and what is switched on."""
    a = pet.setdefault("art", {})
    a.setdefault("skins", [])
    a.setdefault("aura", False)
    a.setdefault("sight", False)
    a.setdefault("skin", "")
    a.setdefault("aura_on", False)
    return a


def _use_artefact(st: dict, pet: dict, item: str, now: datetime, speed: str, wish: str | None) -> dict:
    if item == "traumkristall":
        # the child picks an animal and gets the egg of exactly that animal right away
        if wish not in KINDS:
            raise PetError("bad_wish")
        _take(st, item)
        eid = new_id()
        egg = new_egg(now, fabel=wish in FABEL)
        egg["wish"] = wish
        st["pets"][eid] = egg
        return {"egg": eid, "wish": wish}
    if pet["step"] == 0:
        raise PetError("egg")
    a = art(pet)
    if item == "weitblick":
        if a["sight"]:
            raise PetError("not_needed")
        _take(st, item)
        a["sight"] = True
        return {"sight": True}
    if item == "sternenstein":
        need = next_need(pet, speed)
        if need is None and a["aura"]:
            raise PetError("fully_grown")
        _take(st, item)
        if need is not None:
            pet["g"] = max(pet["g"], need)
        a["aura"] = a["aura_on"] = True
        return {"ready": need is not None, "art": dict(a)}
    skin = ART_SKINS[item]
    if skin in a["skins"]:
        raise PetError("not_needed")
    _take(st, item)
    a["skins"].append(skin)
    a["skin"] = skin
    return {"art": dict(a)}


def set_art(st: dict, pet_id: str, skin: str | None, aura: bool | None) -> dict:
    """The child switches unlocked artefact effects on or off (in the evolution tree)."""
    pet = _pet(st, pet_id)
    a = art(pet)
    if skin is not None:
        if skin and skin not in a["skins"]:
            raise PetError("locked")
        a["skin"] = skin
    if aura is not None:
        if aura and not a["aura"]:
            raise PetError("locked")
        a["aura_on"] = bool(aura)
    return {"art": dict(a)}


def level_gifts(st: dict, levels_reached: list[int], season: str) -> list[str]:
    """Artefacts for levels reached (once per level and season); returns the items given."""
    got = []
    done = st.setdefault("level_gifts", [])
    for lvl in levels_reached:
        item = LEVEL_ARTEFACTS.get(lvl)
        key = f"{season}:{lvl}"
        if item and key not in done and add_item(st, item):  # a full slot (artefacts: 1) waits until it is used
            done.append(key)
            got.append(item)
    st["level_gifts"] = done[-60:]
    return got


def hatch(st: dict, pet_id: str, rng: random.Random, speed: str = "normal") -> str:
    """The egg hatches (growth full): the kind is a missing one (fable eggs: a missing fable)."""
    pet = _pet(st, pet_id)
    if pet["step"] != 0:
        raise PetError("not_egg")
    if not ready(pet, speed):
        raise PetError("not_ready")
    have: dict[str, int] = {}
    for p in st["pets"].values():
        if p.get("kind"):
            have[p["kind"]] = have.get(p["kind"], 0) + 1
    pool = FABEL if pet.get("fabel") else STARTERS
    missing = [k for k in pool if k not in have]
    pick = missing or [k for k in pool if have.get(k, 0) < MAX_PER_KIND] or list(pool)
    pet["kind"] = pet.pop("wish") if pet.get("wish") in KINDS else rng.choice(sorted(pick))
    pet["step"] = 1
    st["stats"]["evos"] += 1
    return pet["kind"]


_LOOK_KEY = re.compile(r"^[a-z_]{1,16}$")
_LOOK_VAL = re.compile(r"^[a-z0-9_-]{0,24}$")
_CTRL = re.compile(r"[\x00-\x1f<>\"&]")


def clean_look(raw) -> dict:
    """The look chosen in the evolution tree: only short plain words (it is drawn, never shown as HTML)."""
    out: dict = {}
    if not isinstance(raw, dict):
        return out
    for k, v in list(raw.items())[:16]:
        if not isinstance(k, str) or not _LOOK_KEY.match(k):
            continue
        if isinstance(v, bool) or (isinstance(v, (int, float)) and abs(v) < 1e6) or (isinstance(v, str) and _LOOK_VAL.match(v)):
            out[k] = v
        elif isinstance(v, list):
            out[k] = [x for x in v[:8] if isinstance(x, str) and _LOOK_VAL.match(x)]
    return out


def clean_name(raw, limit: int) -> str:
    return _CTRL.sub("", str(raw or "")).strip()[:limit]


def evolve(st: dict, pet_id: str, look, name, now: datetime, speed: str = "normal") -> dict:
    """The child evolves its pet (bar full): next step with the look chosen in the tree. Reaching Gross brings a new egg."""
    pet = _pet(st, pet_id)
    if pet["step"] == 0:
        raise PetError("egg")
    if not ready(pet, speed):
        raise PetError("not_ready")
    pet["step"] += 1
    pet["look"] = clean_look(look)
    pet["name"] = clean_name(name, 24)
    st["stats"]["evos"] += 1
    egg = None
    if pet["step"] == NEW_EGG_AT:
        egg = new_id()
        st["pets"][egg] = new_egg(now)
    return {"step": pet["step"], "egg": egg}


def set_active(st: dict, pet_id: str) -> None:
    _pet(st, pet_id)
    st["active"] = pet_id


def set_nick(st: dict, pet_id: str, nick) -> str:
    pet = _pet(st, pet_id)
    pet["nick"] = clean_name(nick, 16)
    return pet["nick"]


def set_on(st: dict, on: bool) -> None:
    """Switching off or on never loses anything (pets, inventory and points stay)."""
    st["on"] = bool(on)


# ------------------------------------------------------------------ the garden
def garden_grow(st: dict, today: date, paused: bool = False, speed: str = "normal") -> int:
    """Once a day the other pets in the garden grow a little by themselves (babies and young ones only).

    Never past a full bar (the child still evolves them), at most GARDEN_MAX_DAYS at once, nothing while off or
    on holiday (the day still moves on). Returns the growth added.
    """
    last = st.get("garden")
    st["garden"] = today.isoformat()
    if not last or not st["on"] or paused:
        return 0
    try:
        days = (today - date.fromisoformat(last)).days
    except ValueError:
        return 0
    days = max(0, min(GARDEN_MAX_DAYS, days))
    added = 0
    for k, pet in st["pets"].items():
        need = next_need(pet, speed)
        if k == st["active"] or not 0 < pet["step"] < GARDEN_UNTIL or need is None or pet["g"] >= need:
            continue
        add = min(GARDEN_GROW * days, need - pet["g"])
        pet["g"] += add
        added += add
    return added


# ------------------------------------------------------------------ the daily wheel
def spin(st: dict, today: date, rng: random.Random, eggs: str = "normal") -> dict:
    """One spin per day (reset at midnight). Every spin brings food and a drink for the day plus the field's prize."""
    if not st["on"]:
        raise PetError("off")
    if st["wheel"] == today.isoformat():
        raise PetError("spun")
    st["wheel"] = today.isoformat()
    st["stats"]["spins"] += 1
    st["luck"]["fabel"] += 1
    st["luck"]["dev"] += 1
    add_item(st, "futter", 2)
    add_item(st, "wasser", 2)
    fields = FIELDS_BY_MODE.get(eggs, FIELDS)
    idx = rng.randrange(len(fields))
    if st["luck"]["fabel"] >= FABEL_PITY_DAYS:
        idx = fields.index("star")
    elif st["luck"]["dev"] >= DEV_PITY_SPINS and fields[idx] not in ("dev", "star"):
        idx = fields.index("dev")
    field = fields[idx]
    res: dict = {"field": idx, "prize": field, "items": []}
    if field == "grow":
        it = rng.choice(("wachs_s", "wachs_s", "wachs_m", "wachs_m", "wachs_l"))
        if add_item(st, it):
            res["items"].append(it)
    elif field == "extra":
        it = rng.choice([x for x in EXTRAS if st["inv"].get(x, 0) < CAPS[x]] or ["keks"])
        if add_item(st, it):
            res["items"].append(it)
    elif field == "food":
        add_item(st, "futter", 3)
        add_item(st, "wasser", 3)
        res["items"] += ["futter", "wasser"]
    elif field == "pts":
        st["pts"] += PRIZE_PTS
        res["pts"] = PRIZE_PTS
    elif field == "egg":
        if any(p["step"] == 0 for p in st["pets"].values()):
            if add_item(st, "wachs_l"):  # an egg is already waiting: a big growth pill instead
                res["items"].append("wachs_l")
            res["instead"] = True
        else:
            eid = new_id()
            st["pets"][eid] = new_egg(datetime.combine(today, datetime.min.time()))
            res["egg"] = eid
    elif field == "dev":
        st["luck"]["dev"] = 0
        if add_item(st, DEV_PILL):
            res["items"].append(DEV_PILL)
    elif field == "again":
        st["wheel"] = ""
    if field == "star":
        star = rng.choice(STAR)
        if st["luck"]["fabel"] >= FABEL_PITY_DAYS:
            star = "fabel_egg"
        res["star"] = star
        if star == "fabel_egg":
            st["luck"]["fabel"] = 0
            eid = new_id()
            st["pets"][eid] = new_egg(datetime.combine(today, datetime.min.time()), fabel=True)
            res["egg"] = eid
        elif star == "artefact" and any(not st["inv"].get(a) for a in ARTEFACTS):
            it = rng.choice([a for a in ARTEFACTS if not st["inv"].get(a)])
            add_item(st, it)
            res["items"].append(it)
        else:  # the jackpot – also when every artefact is already in the inventory (nothing is lost)
            res["star"] = "jackpot"
            st["pts"] += 100
            res["pts"] = 100
    return res


# ------------------------------------------------------------------ what the planer gets
def view(st: dict, speed: str = "normal", today: date | None = None) -> dict:
    """A copy for the browser: with the growth needed for the next step and whether the bar is full.

    "spun" is only true on the day of the spin – the wheel is free again on the next planner day."""
    pets = {}
    for k, p in st["pets"].items():
        pets[k] = {**p, "art": dict(art(dict(p))), "need": next_need(p, speed), "ready": ready(p, speed),
                   "v": {n: round(p["v"].get(n, 70)) for n in NEEDS}}
    return {"on": st["on"], "pts": st["pts"], "active": st["active"], "pets": pets, "inv": dict(st["inv"]), "sleep": [SLEEP_FROM, SLEEP_TO],
            "spun": bool(st["wheel"]) and (today is None or st["wheel"] == today.isoformat()), "wheel_day": st["wheel"], "stats": dict(st["stats"])}
