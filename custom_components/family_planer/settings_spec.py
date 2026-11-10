"""Validation of the in-dashboard settings page (no Home Assistant imports, unit-tested).

Every section turns untrusted input from the browser into a clean settings patch. Unknown keys are ignored,
numbers are clamped, entity ids must belong to the expected domain. The returned flags tell the caller what
has to happen afterwards (reload the entry for new timers, run the day change, re-scan holidays).
"""
from __future__ import annotations

from typing import Any

from . import validate

THEMES = ("ha", "light", "dark", "rainbow", "space")
STYLES = ("standard", "transparent", "glass")
# designs up to 0.8 -> new set (the old dark designs become "dark")
THEME_MIGRATE = {"loxone": "dark", "apple": "dark", "google": "dark", "nord": "dark"}
NAV_IDS = ("planer", "listen", "belohnungen", "einstellungen", "aemtliplan")
NAV_DEFAULT = {"order": ["planer", "listen", "belohnungen", "einstellungen", "aemtliplan"], "hidden": ["aemtliplan"]}


def clean_nav(raw) -> dict:
    """Order and visibility of the navigation buttons; settings can never be hidden (way back in)."""
    raw = raw if isinstance(raw, dict) else {}
    order = [x for x in (raw.get("order") or []) if x in NAV_IDS]
    order = list(dict.fromkeys(order + [x for x in NAV_DEFAULT["order"] if x not in order]))
    hidden = [x for x in (raw.get("hidden") if isinstance(raw.get("hidden"), list) else NAV_DEFAULT["hidden"])
              if x in NAV_IDS and x != "einstellungen"]
    return {"order": order, "hidden": list(dict.fromkeys(hidden))}
LANGUAGES = ("auto", "de", "en")
MODES = ("fair", "per_chore")
MODULES = ("week", "lists")
TODO_SIZES = ("none", "s", "m", "l")
SECTIONS = ("general", "vacation", "points", "announce", "lists_settings", "todos")


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


def points(data: dict, cur_game: dict, cur_mode: str, cur_notify: list,
           cur_value: float = 20, cur_currency: str = "CHF", cur_awards: dict | None = None) -> tuple[dict, set[str]]:
    game = {k: validate.integer(data.get(k, v), 0, 1000, v) for k, v in cur_game.items()}
    game["mode"] = data.get("mode") if data.get("mode") in MODES else cur_mode
    notify = validate.entities(data.get("reward_notify", cur_notify), ("notify",))
    value = validate.number(data.get("reward_value", cur_value), 0, 100000, cur_value)
    currency = validate.currency(data.get("currency", cur_currency), cur_currency)
    from .awards import clean_settings
    cur_aw = cur_awards or clean_settings(None)
    raw = data.get("awards") if isinstance(data.get("awards"), dict) else {}
    aw = clean_settings({"items": {**cur_aw["items"], **(raw.get("items") or {})},
                         "early_time": raw.get("early_time", cur_aw["early_time"]),
                         "confetti": raw.get("confetti", cur_aw["confetti"])})
    return ({"gamification": game, "reward_notify": notify, "reward_value": value, "currency": currency, "awards": aw},
            {"rebook"})


def announce(data: dict, cur: dict, persons: dict) -> tuple[dict, set[str]]:
    new = {
        "enabled": _bool(data, "enabled", cur.get("enabled")),
        "motion": validate.entities(data.get("motion", cur.get("motion")), ("binary_sensor",)),
        "notify": validate.entities(data.get("notify", cur.get("notify")), ("notify",)),
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
    }
    if new["enabled"] and not new["motion"]:
        raise SettingsError("motion", "no_motion")
    if new["enabled"] and not (new["notify"] or (new["tts"] and new["media_players"])):
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
           "keep_days": validate.integer(data.get("keep_days", cur.get("keep_days")), 0, 30, 1)}
    return {"todos": new}, set()


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
