"""Input hardening shared by websocket API, services, options flow and import (no HA imports).

Everything that can end up in the dashboard, a notification or a spoken announcement passes through here,
so the frontend escaping is only the second line of defence.
"""
from __future__ import annotations

import math
import re
import unicodedata
from typing import Any

COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")
ICON_RE = re.compile(r"^mdi:[a-z0-9-]{1,64}$")
ENTITY_RE = re.compile(r"^[a-z_]+\.[a-z0-9_]{1,200}$")
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
# pictures: generated avatars (builder v2 'av2:m.lang.braun.hell.0.0.0.blau.0.0.0.0', old 'av:k.long.blond.hell.0'), built-in portraits ('svg:frau') or uploaded photos
IMAGE_RE = re.compile(
    r"^(?:av:[a-z]\.[a-z]{2,12}\.[a-z]{2,12}\.[a-z]{2,12}\.[a-z0-9+]{1,40}"
    r"|av2:(?:[a-z0-9]{1,14}\.){11}[a-z0-9]{1,14}"
    r"|svg:[a-z-]{2,30}"
    r"|img:/family_planer_files/avatars/[a-z0-9_]{1,80}_[0-9a-f]{24}\.(?:jpg|png|webp))$")


def text(value, max_len: int) -> str:
    """Printable text only: no control / format characters, collapsed whitespace, length-limited."""
    s = "".join(ch if unicodedata.category(ch)[0] not in ("C",) else " " for ch in str(value or ""))
    s = re.sub(r"\s+", " ", s).strip()
    return s[:max_len].strip()


def color(value, fallback: str) -> str:
    return value if isinstance(value, str) and COLOR_RE.match(value) else fallback


def icon(value, fallback: str) -> str:
    return value if isinstance(value, str) and ICON_RE.match(value) else fallback


def image(value) -> str:
    return value if isinstance(value, str) and IMAGE_RE.match(value) else ""


def entity(value, domains: tuple[str, ...]) -> str | None:
    if isinstance(value, str) and ENTITY_RE.match(value) and value.split(".", 1)[0] in domains:
        return value
    return None


def entities(values, domains: tuple[str, ...], limit: int = 20) -> list[str]:
    out: list[str] = []
    for v in values if isinstance(values, (list, tuple)) else ([values] if values else []):
        e = entity(v, domains)
        if e and e not in out:
            out.append(e)
    return out[:limit]


def hhmm(value, fallback: str) -> str:
    if isinstance(value, str):
        v = value[:5]
        if TIME_RE.match(v):
            return v
    return fallback


def aliases(values) -> list[str]:
    out: list[str] = []
    for a in values or []:
        t = text(a, 40)
        if t and t.lower() not in (x.lower() for x in out):
            out.append(t)
    return out[:10]


def integer(value, lo: int, hi: int, fallback: int) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return fallback


def number(value, lo: float, hi: float, fallback: float) -> float:
    """A finite number in [lo, hi], rounded to 2 decimals (e.g. a money amount)."""
    try:
        num = float(str(value).replace(",", ".").replace("'", ""))
    except (TypeError, ValueError):
        return fallback
    if not math.isfinite(num):
        return fallback
    return round(max(lo, min(hi, num)), 2)


def currency(value, fallback: str = "CHF") -> str:
    """Short currency label: letters, digits, currency symbols, dot, dash and space only (max. 8)."""
    out = "".join(ch for ch in text(value, 16) if ch.isalnum() or ch in " .-'" or unicodedata.category(ch) == "Sc")
    return out.strip()[:8].strip() or fallback


def language(setting: Any, system: Any) -> str:
    """Language of the planner: a fixed choice ("de"/"en") wins, otherwise the Home Assistant language."""
    if setting in ("de", "en"):
        return setting
    return "de" if str(system or "").lower().startswith(("de", "gsw")) else "en"
