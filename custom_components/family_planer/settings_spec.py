"""Validation of the in-dashboard settings page (no Home Assistant imports, unit-tested).

Every section turns untrusted input from the browser into a clean settings patch. Unknown keys are ignored,
numbers are clamped, entity ids must belong to the expected domain. The returned flags tell the caller what
has to happen afterwards (reload the entry for new timers, run the day change, re-scan holidays).
"""
from __future__ import annotations

import re
from typing import Any

from . import seasons as seasons_mod, sonder as sonder_mod, validate

THEMES = ("ha", "light", "dark", "rainbow", "space")
STYLES = ("standard", "transparent", "glass")
# designs up to 0.8 -> new set (the old dark designs become "dark")
THEME_MIGRATE = {"loxone": "dark", "apple": "dark", "google": "dark", "nord": "dark"}
NAV_IDS = ("planer", "listen", "belohnungen", "statistik", "tierchen", "einstellungen", "aemtliplan")
NAV_DEFAULT = {"order": ["planer", "listen", "belohnungen", "statistik", "tierchen", "einstellungen", "aemtliplan"], "hidden": ["aemtliplan"]}


def clean_nav(raw) -> dict:
    """Order and visibility of the navigation buttons; settings can never be hidden (way back in)."""
    raw = raw if isinstance(raw, dict) else {}
    order = list(dict.fromkeys(x for x in (raw.get("order") or []) if x in NAV_IDS))
    # new buttons (e.g. statistics) go to their default place: right after the button they follow by default
    for i, x in enumerate(NAV_DEFAULT["order"]):
        if x not in order:
            prev = NAV_DEFAULT["order"][i - 1] if i else None
            order.insert(order.index(prev) + 1 if prev in order else len(order), x)
    hidden = [x for x in (raw.get("hidden") if isinstance(raw.get("hidden"), list) else NAV_DEFAULT["hidden"])
              if x in NAV_IDS and x != "einstellungen"]
    return {"order": order, "hidden": list(dict.fromkeys(hidden))}
LANGUAGES = ("auto", "de", "en")
MODES = ("fair", "per_chore")
MODULES = ("week", "lists")
TODO_SIZES = ("none", "s", "m", "l")
SECTIONS = ("general", "vacation", "points", "announce", "lists_settings", "todos", "seasons", "sonder", "pets", "screen", "house")
VIEWS = ("today", "week")


class SettingsError(ValueError):
    """Input that cannot be saved; .field names the offending field, .key is a translatable code."""

    def __init__(self, field: str, key: str) -> None:
        super().__init__(f"{field}: {key}")
        self.field = field
        self.key = key


def _bool(data: dict, key: str, cur: Any) -> bool:
    return bool(data[key]) if key in data else bool(cur)


def general(data: dict, cur: dict) -> tuple[dict, set[str]]:
    panel = cur.get("panel") or {}
    patch = {
        "modules": {m: _bool(data.get("modules") or {}, m, (cur.get("modules") or {}).get(m, True)) for m in MODULES},
        "language": data.get("language") if data.get("language") in LANGUAGES else (cur.get("language") or "auto"),
        "theme": data.get("theme") if data.get("theme") in THEMES else THEME_MIGRATE.get(cur.get("theme"), cur.get("theme") if cur.get("theme") in THEMES else "ha"),
        "style": data.get("style") if data.get("style") in STYLES else (cur.get("style") if cur.get("style") in STYLES else "standard"),
        "nav": clean_nav(data["nav"]) if "nav" in data else clean_nav(cur.get("nav")),
        "nav_title": _bool(data, "nav_title", cur.get("nav_title", False)),
        "panel": {"enabled": _bool(data, "panel", panel.get("enabled", True)),
                  "title": validate.text(data.get("panel_title", panel.get("title", "")), 40)},
        "idle_seconds": validate.integer(data.get("idle_seconds", cur.get("idle_seconds")), 10, 600, 45),
        "fullscreen_dblclick": _bool(data, "fullscreen_dblclick", cur.get("fullscreen_dblclick", True)),
        "fullscreen_auto": _bool(data, "fullscreen_auto", cur.get("fullscreen_auto", False)),
        "rollover_time": validate.hhmm(data.get("rollover_time"), cur.get("rollover_time") or "00:00"),
        "match_names": _bool(data, "match_names", cur.get("match_names", True)),
        "show_owner": _bool(data, "show_owner", cur.get("show_owner", False)),
        "admin_only_edit": _bool(data, "admin_only_edit", cur.get("admin_only_edit", False)),
        "reliability_days": validate.integer(data.get("reliability_days", cur.get("reliability_days")), 7, 90, 30),
        "school_gap": validate.integer(data.get("school_gap", cur.get("school_gap")), 0, 240, 0),
        "school_window": validate.integer(data.get("school_window", cur.get("school_window", 60)), 0, 240, 60),
        "hide_done": _bool(data, "hide_done", cur.get("hide_done", True)),
        "hide_past": validate.integer(data.get("hide_past", cur.get("hide_past", 30)), 0, 240, 30),
        "default_view": data.get("default_view") if data.get("default_view") in VIEWS else (cur.get("default_view") if cur.get("default_view") in VIEWS else "today"),
    }
    if not any(patch["modules"].values()):
        raise SettingsError("modules", "no_modules")
    flags = set()
    if (patch["modules"] != {m: (cur.get("modules") or {}).get(m, True) for m in MODULES}
            or patch["panel"] != {"enabled": panel.get("enabled", True), "title": panel.get("title", "")}
            or patch["rollover_time"] != (cur.get("rollover_time") or "00:00")):
        flags.add("reload")
    if patch["rollover_time"] != (cur.get("rollover_time") or "00:00"):
        flags.add("rollover")
    return patch, flags


def vacation(data: dict, cur: dict) -> tuple[dict, set[str]]:
    words = data.get("words", cur.get("words", []))
    if isinstance(words, str):
        words = words.replace(";", ",").split(",")
    clean_words = [w for w in (validate.text(w, 40) for w in words or []) if w][:30]
    new = {**cur,
           "enabled": _bool(data, "enabled", cur.get("enabled", True)),
           "words": clean_words,
           "scope": data.get("scope") if data.get("scope") in ("owner", "family") else cur.get("scope", "owner"),
           "min_hours": validate.integer(data.get("min_hours", cur.get("min_hours")), 12, 24, 20),
           "refresh_minutes": validate.integer(data.get("refresh_minutes", cur.get("refresh_minutes")), 15, 240, 30)}
    flags = {"refresh_away"}
    if new["refresh_minutes"] != cur.get("refresh_minutes"):
        flags.add("reload")
    if data.get("rescan"):
        flags.add("rescan")
    return {"vacation": new}, flags


def clean_levels(raw) -> dict:
    """{"season_start": "MM-DD" (start of the school year), "bonus": bool (extra points per level)}"""
    raw = raw if isinstance(raw, dict) else {}
    md = str(raw.get("season_start") or "08-01")
    try:
        m, d = (int(x) for x in md.split("-"))
        from datetime import date as _d
        _d(2024, m, d)
        md = f"{m:02d}-{d:02d}"
    except (ValueError, TypeError):
        md = "08-01"
    return {"season_start": md, "bonus": bool(raw.get("bonus", True))}


_COIN_LETTER = re.compile(r"^[A-Za-z0-9ÄÖÜ]$")


STATS_PERIODS = ("w", "m", "q")


def clean_stats(raw) -> dict:
    """Statistics page: {"compare": kids see "who did what" for everybody, "practice": show "still practising",
    "period": default period w/m/q}"""
    raw = raw if isinstance(raw, dict) else {}
    return {"compare": bool(raw.get("compare", True)), "practice": bool(raw.get("practice", True)),
            "period": raw.get("period") if raw.get("period") in STATS_PERIODS else "w"}


def clean_coin(raw) -> dict:
    """{"show": bool (points as a coin), "letter": one letter or digit on the coin, "" = small star}"""
    raw = raw if isinstance(raw, dict) else {}
    letter = str(raw.get("letter") or "").strip()[:1].upper()
    return {"show": bool(raw.get("show", True)), "letter": letter if _COIN_LETTER.match(letter) else ""}


PET_SPEEDS = ("slow", "normal", "fast")
PET_DECAY = ("off", "slow", "normal")
PET_EGGS = ("rare", "normal", "often")
PETS_DEFAULT = {"enabled": True, "adults": False, "wheel": True, "speed": "normal", "decay": "slow", "eggs": "normal"}


def clean_pets(raw) -> dict:
    """Tierchen: on/off for the family, start state for grown-ups, daily wheel, growth speed, how fast needs sink, new eggs."""
    raw = raw if isinstance(raw, dict) else {}
    d = PETS_DEFAULT
    return {"enabled": bool(raw.get("enabled", d["enabled"])), "adults": bool(raw.get("adults", d["adults"])),
            "wheel": bool(raw.get("wheel", d["wheel"])),
            "speed": raw.get("speed") if raw.get("speed") in PET_SPEEDS else d["speed"],
            "decay": raw.get("decay") if raw.get("decay") in PET_DECAY else d["decay"],
            "eggs": raw.get("eggs") if raw.get("eggs") in PET_EGGS else d["eggs"]}


def pets(data: dict, cur: dict) -> tuple[dict, set[str]]:
    return {"pets": clean_pets({**cur, **{k: v for k, v in (data or {}).items() if k in PETS_DEFAULT}})}, set()


SCREEN_STYLES = ("black", "clock")
SCREEN_DEFAULT = {"enabled": False, "minutes": 5, "style": "black", "motion": []}


def clean_screen(raw) -> dict:
    """Screen saver: black after some minutes without touch or motion; a motion sensor or a tap wakes it."""
    raw = raw if isinstance(raw, dict) else {}
    d = SCREEN_DEFAULT
    try:
        minutes = int(raw.get("minutes", d["minutes"]))
    except (TypeError, ValueError):
        minutes = d["minutes"]
    return {"enabled": bool(raw.get("enabled", d["enabled"])), "minutes": max(1, min(120, minutes)),
            "style": raw.get("style") if raw.get("style") in SCREEN_STYLES else d["style"],
            "motion": validate.entities(raw.get("motion", d["motion"]), ("binary_sensor",), limit=10)}


def screen(data: dict, cur: dict) -> tuple[dict, set[str]]:
    return {"screen": clean_screen({**cur, **{k: v for k, v in (data or {}).items() if k in SCREEN_DEFAULT}})}, set()


# house builder: the parts of the house in the header (same lists as frontend_src/house.js, a test keeps them equal)
HOUSE_OPTIONS = {
    "wall": ("creme", "weiss", "grau", "sand", "gelb", "rot", "blau", "gruen", "schwedenrot", "anthrazit"),
    "roof": ("ziegel", "dunkelrot", "schiefer", "anthrazit", "gruen", "braun", "blau", "kupfer"),
    "windows": ("steg", "sprossen", "gross", "bogen"),
    "shutters": ("none", "gruen", "blau", "rot", "weiss", "holz"),
    "facade": ("glatt", "holz", "klinker", "fachwerk", "sockel"),
    "left": ("garage", "carport", "huette", "winter", "turm", "velo", "pergola", "none"),
    "right": ("none", "garage", "carport", "huette", "winter", "turm", "velo", "pergola"),
    "water": ("pool", "rund", "jacuzzi", "plansch", "none"),
    "pond": ("auto",),
    "width": ("normal", "schmal", "breit"),
    "floors": ("2", "1", "3"),
    "roofform": ("sattel", "krueppel", "walm", "zelt", "mansarde", "pult", "flach", "tonne"),
    "chimney": ("ja", "nein"),
}
HOUSE_DEFAULT = {"wall": "creme", "roof": "ziegel", "windows": "steg", "shutters": "none", "facade": "glatt",
                 "left": "garage", "right": "none", "water": "pool", "pond": "auto",
                 "width": "normal", "floors": "2", "roofform": "sattel", "chimney": "ja"}


def clean_house(raw) -> dict:
    """The house in the header: one choice per part; anything unknown falls back to today's house."""
    raw = raw if isinstance(raw, dict) else {}
    return {k: raw.get(k) if raw.get(k) in HOUSE_OPTIONS[k] else d for k, d in HOUSE_DEFAULT.items()}


def house(data: dict, cur: dict) -> tuple[dict, set[str]]:
    return {"house": clean_house({**cur, **{k: v for k, v in (data or {}).items() if k in HOUSE_DEFAULT}})}, set()


def points(data: dict, cur_game: dict, cur_mode: str, cur_notify: list,
           cur_value: float = 20, cur_currency: str = "CHF", cur_awards: dict | None = None,
           cur_levels: dict | None = None, cur_coin: dict | None = None,
           cur_stats: dict | None = None) -> tuple[dict, set[str]]:
    game = {k: validate.integer(data.get(k, v), 0, 1000, v) for k, v in cur_game.items()}
    game["mode"] = data.get("mode") if data.get("mode") in MODES else cur_mode
    notify = validate.entities(data.get("reward_notify", cur_notify), ("notify",))
    value = validate.number(data.get("reward_value", cur_value), 0, 100000, cur_value)
    currency = validate.currency(data.get("currency", cur_currency), cur_currency)
    from .awards import clean_settings
    cur_aw = cur_awards or clean_settings(None)
    raw = data.get("awards") if isinstance(data.get("awards"), dict) else {}
    aw = clean_settings({"items": {**cur_aw["items"], **(raw.get("items") or {})},
                         "ontime_time": raw.get("ontime_time", cur_aw.get("ontime_time", "20:00")),
                         "confetti": raw.get("confetti", cur_aw["confetti"])})
    cur_lv = clean_levels(cur_levels)
    raw_lv = data.get("levels") if isinstance(data.get("levels"), dict) else {}
    lv = clean_levels({**cur_lv, **raw_lv})
    raw_coin = data.get("coin") if isinstance(data.get("coin"), dict) else {}
    coin = clean_coin({**clean_coin(cur_coin), **raw_coin})
    raw_stats = data.get("stats") if isinstance(data.get("stats"), dict) else {}
    stats = clean_stats({**clean_stats(cur_stats), **raw_stats})
    return ({"gamification": game, "reward_notify": notify, "reward_value": value, "currency": currency, "awards": aw,
             "levels": lv, "coin": coin, "stats": stats},
            {"rebook"})


def _times(raw) -> list[str]:
    """'12:30, 18:30' or a list -> sorted unique HH:MM values (max 6)."""
    if isinstance(raw, str):
        raw = raw.split(",")
    out = [validate.hhmm(str(x).strip(), "") for x in (raw or [])][:12]
    return sorted({x for x in out if x})[:6]


def announce(data: dict, cur: dict, persons: dict) -> tuple[dict, set[str]]:
    new = {
        "enabled": _bool(data, "enabled", cur.get("enabled")),
        "motion": validate.entities(data.get("motion", cur.get("motion")), ("binary_sensor",)),
        "notify": validate.entities(data.get("notify", cur.get("notify")), ("notify",)),
        "scripts": validate.entities(data.get("scripts", cur.get("scripts")), ("script",), limit=5),
        "tts": validate.entity(data.get("tts", cur.get("tts")), ("tts",)),
        "media_players": validate.entities(data.get("media_players", cur.get("media_players")), ("media_player",)),
        "start": validate.hhmm(data.get("start"), cur.get("start") or "15:00"),
        "end": validate.hhmm(data.get("end"), cur.get("end") or "20:00"),
        "cooldown": validate.integer(data.get("cooldown", cur.get("cooldown")), 5, 720, 60),
        "all_done": _bool(data, "all_done", cur.get("all_done", True)),
        "persons": [p for p in (data.get("persons", cur.get("persons")) or []) if p in persons],
        "queue": _bool(data, "queue", cur.get("queue", True)),
        "queue_start": validate.hhmm(data.get("queue_start"), cur.get("queue_start") or "07:00"),
        "queue_end": validate.hhmm(data.get("queue_end"), cur.get("queue_end") or "21:00"),
        "queue_rewards": _bool(data, "queue_rewards", cur.get("queue_rewards", True)),
        "queue_special": _bool(data, "queue_special", cur.get("queue_special", True)),
        "max_items": validate.integer(data.get("max_items", cur.get("max_items")), 1, 10, 3),
        "reward_hours": validate.integer(data.get("reward_hours", cur.get("reward_hours")), 0, 48, 0),
        "fixed": _bool(data, "fixed", cur.get("fixed", True)),
        "times": _times(data.get("times", cur.get("times", ["12:30", "18:30"]))),
        "evening": _bool(data, "evening", cur.get("evening", True)),
        "evening_time": validate.hhmm(data.get("evening_time"), cur.get("evening_time") or "18:15"),
        "praise": _bool(data, "praise", cur.get("praise", True)),
        "birthday": _bool(data, "birthday", cur.get("birthday", True)),
        "birthday_times": _times(data.get("birthday_times", cur.get("birthday_times", ["07:00", "12:15", "15:30", "18:15", "19:30"])))
        or ["07:00", "12:15", "15:30", "18:15", "19:30"],
    }
    if new["enabled"] and not new["motion"] and not new["fixed"]:
        raise SettingsError("motion", "no_motion")
    if new["enabled"] and not (new["notify"] or new["scripts"] or (new["tts"] and new["media_players"])):
        raise SettingsError("notify", "no_target")
    return {"announce": new}, {"reload"}


def lists_settings(data: dict, cur: dict) -> tuple[dict, set[str]]:
    patch = {
        "optimize_time": validate.hhmm(data.get("optimize_time"), cur.get("optimize_time") or "03:00"),
        "ai_task": validate.entity(data.get("ai_task", cur.get("ai_task")), ("ai_task",)),
        "prune_days": validate.integer(data.get("prune_days", cur.get("prune_days")), 7, 365, 30),
    }
    return patch, ({"reload"} if patch["optimize_time"] != (cur.get("optimize_time") or "03:00") else set())


def todos(data: dict, cur: dict) -> tuple[dict, set[str]]:
    new = {"confirm": _bool(data, "confirm", cur.get("confirm", True)),
           "size": data.get("size") if data.get("size") in TODO_SIZES else cur.get("size", "s"),
           "keep_days": validate.integer(data.get("keep_days", cur.get("keep_days")), 0, 30, 1),
           "max_shown": validate.integer(data.get("max_shown", cur.get("max_shown")), 1, 20, 4),
           "show_age": _bool(data, "show_age", cur.get("show_age", True)),
           "name_lists": validate.entities(data.get("name_lists", cur.get("name_lists")), ("todo",))}
    return {"todos": new}, {"name_lists"} if new["name_lists"] != (cur.get("name_lists") or []) else set()


SUG_DEFAULTS = {"sug_enabled": True, "sug_from": "12:00", "pool": None, "pool_min": 24, "jacuzzi": None, "jacuzzi_min": 34}


def seasons(data: dict, cur: dict) -> tuple[dict, set[str]]:
    """Seasons & weather: design layer, lead days, weather entity, anniversaries and suggestions."""
    merged = {**cur, **{k: v for k, v in data.items() if k in seasons_mod.DEFAULTS}}
    clean = seasons_mod.clean_settings(merged)
    clean.update({
        "sug_enabled": _bool(data, "sug_enabled", cur.get("sug_enabled", True)),
        "sug_from": validate.hhmm(data.get("sug_from"), cur.get("sug_from") or "12:00"),
        "pool": validate.entity(data.get("pool", cur.get("pool")), ("sensor", "water_heater", "climate")),
        "pool_min": validate.integer(data.get("pool_min", cur.get("pool_min")), 15, 40, 24),
        "jacuzzi": validate.entity(data.get("jacuzzi", cur.get("jacuzzi")), ("sensor", "water_heater", "climate")),
        "jacuzzi_min": validate.integer(data.get("jacuzzi_min", cur.get("jacuzzi_min")), 20, 42, 34),
    })
    return {"seasons": clean}, {"season"}


def sonder(data: dict, cur: dict) -> tuple[dict, set[str]]:
    return {"sonder_settings": sonder_mod.clean_settings({**cur, **data})}, {"sonder"}


def school(data: dict) -> dict:
    """{"calendar", "times": {"1": [[start, end], ...]}, "travel"} – overlapping or reversed blocks are refused."""
    times: dict[str, list[list[str]]] = {}
    for day, spans in (data.get("times") or {}).items():
        if str(day) not in {"1", "2", "3", "4", "5", "6", "7"}:
            continue
        clean: list[list[str]] = []
        for span in (spans or [])[:3]:
            if not isinstance(span, (list, tuple)) or len(span) != 2:
                raise SettingsError(f"times.{day}", "bad_times")
            a, b = validate.hhmm(span[0], ""), validate.hhmm(span[1], "")
            if not (a and b and a < b) or any(not (b <= s[0] or a >= s[1]) for s in clean):
                raise SettingsError(f"times.{day}", "bad_times")
            clean.append([a, b])
        if clean:
            times[str(day)] = sorted(clean)
    return {"calendar": validate.entity(data.get("calendar"), ("calendar",)), "times": times,
            "travel": validate.integer(data.get("travel"), 0, 240, 0)}


def pin_valid(pin: Any) -> bool:
    """New parent PINs: 4–8 digits and not the well-known start PIN."""
    return isinstance(pin, str) and pin.isdigit() and 4 <= len(pin) <= 8 and pin != DEFAULT_PIN


DEFAULT_PIN = "123456"
