"""Levels per season (school year) – no Home Assistant imports, unit-testable.

Thresholds are counted in "full days": the points of a day with every chore done, incl. day bonus and the share of
the streak bonus. With the default settings a reliable child (about 80 %) reaches Diamond (level 16) in about
10 months, a very reliable one (about 95 %) Ruby (level 21).

state data["levels"][pid] = {"season": iso, "level": n, "best": {season: n}, "unlocked": [ids], "up": {"level", "ts"}}
"""
from __future__ import annotations

from datetime import date

DIAMOND_DAYS = 243   # level 16 after ~10 months at ~80 %
RUBY_DAYS = 288      # level 21 after ~10 months at ~95 %
RUBY_STEP = 10       # every further level
TIERS = [(1, "bronze", "#CD8A4E"), (6, "silver", "#C9D1D9"), (11, "gold", "#F5C542"), (16, "diamond", "#7FDBFF"), (21, "ruby", "#E0115F")]
NAMES = {
    "de": ["Starter", "Helfer", "Macher", "Profi", "Ass", "Champion", "Held", "Meister", "Turbo", "Superstar",
           "Superheld", "Legende", "Titan", "Gigant", "Megastar", "Diamantheld", "Kristallkönig", "Glitzergott", "Funkelfürst",
           "Grossmeister", "Allerkrassester Krassomat", "Ultra-Mega-Giga-Boss", "Galaktischer Oberkrass-Imperator",
           "Unfassbarster Superduper-Weltmeister"],
    "en": ["Starter", "Helper", "Doer", "Pro", "Ace", "Champion", "Hero", "Master", "Turbo", "Superstar",
           "Superhero", "Legend", "Titan", "Giant", "Megastar", "Diamond hero", "Crystal king", "Glitter god", "Sparkle lord",
           "Grandmaster", "Most Epic Epicness Ever", "Ultra-Mega-Giga Boss", "Galactic Supreme Awesomator",
           "Unbelievablest Super-Duper Champion"],
}
# avatar extras unlocked per level (only the person who reached it can use them; they stay after the season reset)
UNLOCKS = {
    2: ["levelcap"], 3: ["goldbrille"], 4: ["hamster"], 5: ["funkelsprossen", "sternchen"],
    6: ["comic"], 7: ["skaterhelm"], 8: ["babydrache"], 9: ["rennfahrer"], 10: ["silberaura", "gluehwuermchen"],
    11: ["sonnenuntergang"], 12: ["edelkrone"], 13: ["phoenix"], 14: ["goldritter"], 15: ["leuchtaugen", "goldglanz"],
    16: ["diamantbrille"], 17: ["kristallhoehle"], 18: ["kristallfuchs"], 19: ["eiskoenig"], 20: ["goldfluegel", "goldregen"],
    21: ["rubinkrone"], 22: ["rubindrache"], 23: ["lavagalaxie"], 24: ["feuertitan"], 25: ["rubinsplitter", "feuerfunken"],
    26: ["rubinumhang"], 27: ["szepter"], 28: ["rubinmaske"], 29: ["rubinglanz"], 30: ["flammenaura", "komet"],
    35: ["herzfunken", "schneeflocken"], 40: ["blitzgewitter", "galaxie"],
}
UNLOCK_IDS = {x for v in UNLOCKS.values() for x in v}


def full_day(game: dict) -> float:
    return max(1.0, float(game.get("day_points", 30)) + float(game.get("day_bonus", 0)) + float(game.get("streak_bonus", 0)) / 7)


def days_for(level: int) -> float:
    """Full days needed for a level (level 1 = 0)."""
    if level <= 1:
        return 0.0
    if level <= 16:
        return DIAMOND_DAYS * ((level - 1) / 15) ** 1.6
    if level <= 21:
        return DIAMOND_DAYS + (RUBY_DAYS - DIAMOND_DAYS) * (level - 16) / 5
    return RUBY_DAYS + RUBY_STEP * (level - 21)


def threshold(level: int, game: dict) -> int:
    return round(days_for(level) * full_day(game))


def tier(level: int) -> tuple[str, str]:
    name, color = TIERS[0][1], TIERS[0][2]
    for start, n, c in TIERS:
        if level >= start:
            name, color = n, c
    return name, color


def level_for(xp: int, game: dict) -> int:
    n = 1
    while xp >= threshold(n + 1, game) and n < 999:
        n += 1
    return n


def name(level: int, lang: str) -> str:
    names = NAMES["de" if lang == "de" else "en"]
    if level <= len(names):
        return names[level - 1]
    return f"{names[-1]} +{level - len(names)}"


def season_start(today: date, start_md: str = "08-01") -> date:
    """First day of the current season (school year): the last start date on or before today."""
    try:
        month, day = (int(x) for x in start_md.split("-"))
        this_year = date(today.year, month, day)
    except (ValueError, TypeError):
        this_year = date(today.year, 8, 1)
    return this_year if today >= this_year else this_year.replace(year=today.year - 1)


XP_KINDS = ("chore", "fair", "bonus", "streak", "todo", "award", "adjust")


def xp(ledger: list[dict], pid: str, start: date) -> int:
    """Points earned in this season (level bonuses and redeemed rewards do not count)."""
    s = start.isoformat()
    return sum(e["pts"] for e in ledger if e["pid"] == pid and e["kind"] in XP_KINDS and e["pts"] > 0 and e["ts"][:10] >= s)


def info(points: int, game: dict, lang: str) -> dict:
    n = level_for(points, game)
    floor, nxt = threshold(n, game), threshold(n + 1, game)
    t, color = tier(n)
    return {"level": n, "name": name(n, lang), "tier": t, "tier_color": color, "floor": floor, "next": nxt,
            "progress": round((points - floor) / max(1, nxt - floor) * 100)}


def evaluate(data: dict, today: date, game: dict, start_md: str, ts: str, add, bonus_on: bool = True) -> list[dict]:
    """Level ups since the last call: bonus points (kind "level", idempotent per season and level) and unlocks.

    Returns [{"pid", "level", "tier", "color", "bonus", "unlocks"}] for the celebrations. The very first run only
    records the current state (no bonus rain for points earned before levels existed).
    """
    start = season_start(today, start_md).isoformat()
    state = data.setdefault("levels", {})
    first_run = not state
    ups = []
    for pid in data.get("persons", {}):
        st = state.setdefault(pid, {"season": start, "level": 1, "best": {}, "unlocked": [], "up": None})
        if st.get("season") != start:   # new school year: remember the best level, start again at 1
            st["best"][st["season"]] = max(st["best"].get(st["season"], 0), st.get("level", 1))
            st["season"], st["level"], st["up"] = start, 1, None
        n = level_for(xp(data.get("ledger", []), pid, season_start(today, start_md)), game)
        if n <= st["level"]:
            continue
        new_unlocks: list[str] = []
        bonus = 0
        for lv in range(st["level"] + 1, n + 1):
            for u in UNLOCKS.get(lv, []):
                if u not in st["unlocked"]:
                    st["unlocked"].append(u)
                    new_unlocks.append(u)
            if first_run or not bonus_on:
                continue
            days = 3 if lv in (6, 11, 16, 21) else 1
            pts = round(full_day(game) * days)
            ref = f"level:{start}:{pid}:{lv}"
            if not any(e.get("ref") == ref for e in data.get("ledger", [])):
                add(data.setdefault("ledger", []), pid, pts, "level", ref, str(lv), ts)
                bonus += pts
        st["level"] = n
        st["best"][start] = max(st["best"].get(start, 0), n)
        if not first_run:
            t, color = tier(n)
            st["up"] = {"level": n, "ts": ts}
            ups.append({"pid": pid, "level": n, "tier": t, "color": color, "bonus": bonus, "unlocks": new_unlocks})
    return ups


def view(data: dict, pid: str, game: dict, today: date, start_md: str, lang: str) -> dict:
    st = (data.get("levels") or {}).get(pid) or {}
    pts = xp(data.get("ledger", []), pid, season_start(today, start_md))
    return {**info(pts, game, lang), "xp": pts, "unlocked": list(st.get("unlocked") or []),
            "best": dict(st.get("best") or {}), "up": st.get("up")}
