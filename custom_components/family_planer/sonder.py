"""Special chores ("Sonderämtli"): fun extra jobs for bonus points (no HA imports, unit-tested).

A *definition* says what, when and for whom; every day the planner turns the definitions into *instances*
(one job with a time window). Open "free" instances wait in the volunteer tile until the fastest child
claims them. Special chores only ever give points: missed or expired ones never count against reliability,
which is why they live outside the normal chore items.
"""
from __future__ import annotations

from datetime import date, timedelta
import random
import re
import secrets

from . import seasons, validate

MODES = ("free", "each", "surprise", "fixed")
SIZES = ("s", "m", "l", "own")
ANCHORS = ("once", "daily", "weekly", "every", "yearly", "event", "bday", "wedding", "advent_week", "advent_sunday",
           "weather", "temp")
WEATHER = ("sunny", "rainy", "snowy", "windy", "cloudy")
DEFAULTS = {"enabled": True, "surprise_per_week": 2, "max_open": 6}


def new_id() -> str:
    return secrets.token_hex(6)


def _hhmm(v) -> str:
    v = str(v or "")
    return v if re.match(r"^([01]\d|2[0-3]):[0-5]\d$", v) else ""


# --------------------------------------------------------------------------------------------- catalogue
# (id, emoji, de, en, size, anchor, off, span, extra) – off: first visible day relative to the anchor,
# span: number of days it stays open. extra: from/until (HH:MM), season ("jz:sommer" / "vis:weihnachten"),
# mode ("each" = every child gets one), secret (birthday child / parents don't see what it is), next_wd, on.
_W = lambda *d: {"t": "weekly", "days": list(d)}  # noqa: E731
CATALOGUE = [
    ("socken", "🧦", "Socken-Detektiv: alle einzelnen Socken finden und Paare machen", "Sock detective: find all single socks and pair them", "m", _W(5), 0, 3, {"on": False}),
    ("witz", "😂", "Witz des Tages beim Znacht erzählen", "Tell the joke of the day at dinner", "s", {"t": "daily"}, 0, 1, {"from": "12:00", "until": "19:00", "on": False}),
    ("pflanzen", "🪴", "Pflanzen-Flüsterer: alle Pflanzen giessen und jeder ein Kompliment machen", "Plant whisperer: water every plant and give it a compliment", "s", _W(1, 4), 0, 2, {"on": False}),
    ("schuhparade", "👟", "Schuh-Parade: alle Schuhe in der Garderobe in Reih und Glied", "Shoe parade: line up all shoes in the hall", "m", _W(2), 0, 1, {"until": "20:00", "on": False}),
    ("saugrennen", "🏁", "Staubsauger-Rennen: ein Zimmer in Rekordzeit saugen", "Vacuum race: hoover one room in record time", "m", _W(3), 0, 4, {"on": False}),
    ("fernbedienung", "📺", "Fernbedienungs-Finder: alle Fernbedienungen an ihren Platz", "Remote finder: put every remote back in its place", "s", _W(4), 0, 1, {"until": "20:00", "on": False}),
    ("post", "📬", "Briefkasten-Postbote: Post holen und an alle verteilen", "Postie: fetch the post and hand it out", "s", _W(1, 2, 3, 4, 5, 6), 0, 1, {"from": "12:00", "until": "18:00", "on": False}),
    ("menu", "📝", "Menü-Chef: das Znacht-Menü schön aufschreiben", "Menu chef: write tonight's dinner menu nicely", "s", {"t": "daily"}, 0, 1, {"from": "12:00", "until": "18:00", "on": False}),
    ("agent", "🕵️", "Geheimagent: jemandem heimlich eine Freude machen", "Secret agent: secretly make someone happy", "m", _W(6), 0, 2, {"on": False}),
    ("gutenacht", "📖", "Gute-Nacht-Geschichte für ein Geschwister vorlesen", "Read a bedtime story to a sibling", "m", {"t": "daily"}, 0, 1, {"from": "12:00", "until": "20:00", "on": False}),
    ("kissen", "🛋️", "Kissen-Profi: alle Sofakissen aufschütteln", "Cushion pro: plump up all sofa cushions", "s", _W(1), 0, 1, {"until": "20:00", "on": False}),
    ("tischdeko", "🌼", "Tischdeko-Künstler: den Znacht-Tisch dekorieren", "Table artist: decorate the dinner table", "m", _W(5, 6, 7), 0, 1, {"from": "12:00", "until": "18:00", "on": False}),
    ("haustier", "🐾", "Haustier-Spa: das Haustier bürsten und verwöhnen", "Pet spa: brush and pamper the pet", "s", _W(6), 0, 2, {"on": False}),
    ("kuehlschrank", "🧊", "Kühlschrank-Tetris: aufräumen, Abgelaufenes melden", "Fridge Tetris: tidy up, report anything out of date", "l", _W(3), 0, 3, {"on": False}),
    ("hoehle", "⛺", "Regentag: Höhle bauen und danach wieder aufräumen", "Rainy day: build a den and tidy it up afterwards", "m", {"t": "weather", "c": "rainy"}, 0, 1, {"from": "12:00", "until": "19:00"}),
    ("schnee", "❄️", "Schnee schaufeln mit einem Erwachsenen", "Shovel snow with a grown-up", "l", {"t": "weather", "c": "snowy"}, 0, 1, {"until": "18:00"}),
    ("sonnencreme", "🧴", "Sonnencreme-Erinnerer für alle", "Sun cream reminder for everyone", "s", {"t": "temp", "min": 25}, 0, 1, {"until": "11:00"}),
    ("lied", "🎶", "Ein Weihnachtslied vorsingen", "Sing a Christmas song", "s", {"t": "advent_week"}, 1, 7, {}),
    ("guetzli", "🍪", "Guetzli ausstechen und verzieren", "Cut out and decorate Christmas biscuits", "m", {"t": "event", "k": "advent"}, 1, 6, {}),
    ("wunschzettel", "✉️", "Wunschzettel in Schönschrift", "Wish list in your best handwriting", "s", {"t": "event", "k": "advent"}, 0, 0, {"end_md": "12-05", "mode": "each"}),
    ("schneeflocken", "❄️", "Fenster mit Schneeflocken bekleben", "Decorate the windows with snowflakes", "m", {"t": "event", "k": "advent"}, 0, 5, {}),
    ("xmaskarte", "💌", "Weihnachtskarte für Grosi und Grosspapi basteln", "Make a Christmas card for the grandparents", "m", {"t": "yearly", "md": "12-01"}, 0, 15, {}),
    ("kugeln", "🎄", "Christbaumkugeln aufhängen", "Hang the Christmas baubles", "m", {"t": "yearly", "md": "12-10"}, 0, 15, {"mode": "each"}),
    ("gedicht", "📜", "Weihnachtsgedicht auswendig lernen", "Learn a Christmas poem by heart", "l", {"t": "event", "k": "advent"}, 0, 0, {"end_md": "12-24"}),
    ("kerzen", "🕯️", "Adventskerzen mit einem Erwachsenen anzünden", "Light the Advent candles with a grown-up", "s", {"t": "advent_sunday"}, 0, 1, {"until": "20:00"}),
    ("chlausversli", "🎅", "Ein Samichlaus-Versli aufsagen", "Recite a St. Nicholas rhyme", "m", {"t": "yearly", "md": "12-01"}, 0, 6, {"mode": "each"}),
    ("vorsaetze", "🎯", "Vorsätze-Plakat für die Familie malen", "Paint a New Year's resolutions poster", "m", {"t": "yearly", "md": "12-27"}, 0, 5, {}),
    ("konfetti", "🎊", "Konfetti-Aufräum-Profi", "Confetti clean-up pro", "m", {"t": "yearly", "md": "01-01"}, 0, 2, {}),
    ("countdown", "⏱️", "Countdown-Ansager um Mitternacht", "Midnight countdown announcer", "s", {"t": "yearly", "md": "12-31"}, 0, 1, {"from": "12:00"}),
    ("koenigskuchen", "👑", "Dreikönigskuchen aufschneiden und verteilen", "Cut and share the King cake", "s", {"t": "yearly", "md": "01-06"}, 0, 1, {"from": "12:00", "until": "20:00"}),
    ("maske", "🎭", "Maske basteln", "Make a carnival mask", "m", {"t": "event", "k": "fasnacht"}, -5, 6, {}),
    ("herzbriefli", "💕", "Herzen-Briefli an alle schreiben", "Write little heart letters to everyone", "m", {"t": "yearly", "md": "02-14"}, -3, 4, {"until": "09:00"}),
    ("komplimente", "🌟", "Komplimente-Runde beim Znacht leiten", "Lead a round of compliments at dinner", "s", {"t": "yearly", "md": "02-14"}, 0, 1, {"from": "12:00", "until": "20:00"}),
    ("kerzentisch", "🕯️", "Für die Eltern den Tisch mit Kerzen decken", "Set the table with candles for the parents", "m", {"t": "wedding"}, 0, 1, {"from": "12:00", "until": "18:00", "secret": True}),
    ("blumenstrauss", "💐", "Blumenstrauss für den Tisch pflücken", "Pick a bunch of flowers for the table", "s", _W(3), 0, 4, {"season": "jz:fruehling"}),
    ("velo", "🚲", "Velo putzen und pumpen", "Clean and pump up the bike", "m", {"t": "yearly", "md": "03-20"}, 0, 5, {"next_wd": 2}),
    ("eierfaerben", "🥚", "Eier färben", "Dye Easter eggs", "m", {"t": "event", "k": "ostersonntag"}, -4, 3, {}),
    ("osternest", "🧺", "Osternest für ein Geschwister verstecken", "Hide an Easter nest for a sibling", "m", {"t": "event", "k": "ostersonntag"}, -1, 2, {"until": "09:00", "secret": True}),
    ("hasenrennen", "🐰", "Hasen-Hüpfrennen im Garten", "Bunny hop race in the garden", "s", {"t": "event", "k": "ostermontag"}, 0, 1, {"until": "18:00"}),
    ("mamikarte", "💗", "Urkunde „Super-Mami“ malen", "Draw a 'Super Mum' certificate", "m", {"t": "event", "k": "muttertag"}, -3, 4, {"until": "09:00", "secret": True}),
    ("mamizmorge", "🥐", "Frühstück ans Bett für Mami", "Breakfast in bed for Mum", "l", {"t": "event", "k": "muttertag"}, -1, 2, {"until": "09:00", "secret": True}),
    ("papikarte", "💙", "Urkunde „Super-Papi“ malen", "Draw a 'Super Dad' certificate", "m", {"t": "event", "k": "vatertag"}, -3, 4, {"until": "09:00", "secret": True}),
    ("papizmorge", "🥐", "Frühstück ans Bett für Papi", "Breakfast in bed for Dad", "l", {"t": "event", "k": "vatertag"}, -1, 2, {"until": "09:00", "secret": True}),
    ("picknick", "🧺", "Picknick packen", "Pack the picnic", "m", {"t": "event", "k": "auffahrt"}, -1, 2, {"until": "10:00"}),
    ("drachen", "🪁", "Drachen basteln", "Build a kite", "l", {"t": "event", "k": "pfingstsonntag"}, -5, 6, {}),
    ("poolblaetter", "🍃", "Blätter aus dem Pool fischen", "Fish the leaves out of the pool", "m", _W(1, 4), 0, 2, {"season": "jz:sommer"}),
    ("gartenmoebel", "🪑", "Gartenmöbel abwischen", "Wipe the garden furniture", "m", _W(2), 0, 5, {"season": "jz:sommer"}),
    ("glacetester", "🍦", "Glace-Tester (erst nach allen Ämtli!)", "Ice cream tester (only after all chores!)", "s", {"t": "temp", "min": 28}, 0, 1, {"until": "18:00"}),
    ("fahne", "🇨🇭", "Schweizerfahne aufhängen", "Hang up the Swiss flag", "s", {"t": "yearly", "md": "07-29"}, 0, 3, {}),
    ("augustlied", "🎤", "Ein Lied zum 1. August singen", "Sing a song for Swiss National Day", "s", {"t": "yearly", "md": "08-01"}, -3, 4, {}),
    ("thek", "🎒", "Schulthek packen und Stifte spitzen", "Pack the school bag and sharpen the pencils", "s", {"t": "event", "k": "schulanfang"}, -3, 3, {"until": "19:00", "mode": "each"}),
    ("laub", "🍂", "Laubhaufen rechen – und reinspringen", "Rake a leaf pile – and jump in", "m", _W(2), 0, 6, {"season": "jz:herbst"}),
    ("herbstdeko", "🍁", "Herbstdeko aus Blättern basteln", "Make autumn decorations from leaves", "m", {"t": "event", "k": "herbstanfang"}, 0, 5, {"next_wd": 2}),
    ("bdaykarte", "🎂", "Geburtstagskarte basteln", "Make a birthday card", "m", {"t": "bday"}, -3, 4, {"until": "08:00", "secret": True}),
    ("bdayplakat", "🌈", "Kompliment-Plakat für das Geburtstagskind", "Compliment poster for the birthday child", "m", {"t": "bday"}, -3, 4, {"secret": True}),
    ("ballone", "🎈", "Ballone aufblasen", "Blow up the balloons", "m", {"t": "bday"}, -1, 2, {"from": "12:00", "until": "07:00", "secret": True}),
    ("bdaytisch", "🎁", "Geburtstagstisch dekorieren", "Decorate the birthday table", "m", {"t": "bday"}, -1, 1, {"from": "12:00", "until": "21:00", "secret": True}),
    ("bdaylied", "🎵", "Geburtstagslied am Morgen singen", "Sing happy birthday in the morning", "s", {"t": "bday"}, -1, 2, {"until": "09:00", "secret": True}),
]
TEMPLATES = {t[0]: t for t in CATALOGUE}


def from_template(tid: str) -> dict:
    tid_, icon, de, en, size, anchor, off, span, extra = TEMPLATES[tid]
    return clean_def({"tpl": tid_, "icon": icon, "title": de, "title_en": en, "size": size, "anchor": anchor, "off": off,
                      "span": span, "from": extra.get("from", ""), "until": extra.get("until", ""),
                      "season": extra.get("season", ""), "mode": extra.get("mode", "free"),
                      "secret": extra.get("secret", False), "next_wd": extra.get("next_wd"), "end_md": extra.get("end_md"),
                      "on": extra.get("on", True)}, {})


def seed() -> dict:
    """Catalogue as editable definitions; the everyday ones start switched off so the volunteer tile stays calm."""
    return {f"t_{tid}": from_template(tid) for tid in TEMPLATES}


# --------------------------------------------------------------------------------------------- validation


def _anchor(raw) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    t = raw.get("t") if raw.get("t") in ANCHORS else "once"
    if t == "once":
        d = seasons.clean_date(raw.get("d"))
        return {"t": "once", "d": d if len(d) == 10 else ""}
    if t == "weekly":
        days = sorted({int(x) for x in raw.get("days") or [] if str(x).isdigit() and 1 <= int(x) <= 7})
        return {"t": "weekly", "days": days or [6]}
    if t == "every":
        d = seasons.clean_date(raw.get("d"))
        return {"t": "every", "n": validate.integer(raw.get("n"), 2, 365, 7), "d": d if len(d) == 10 else "2026-01-05"}
    if t == "yearly":
        md = seasons.clean_date(raw.get("md"))
        return {"t": "yearly", "md": md[-5:] if md else "01-01"}
    if t == "event":
        return {"t": "event", "k": raw.get("k") if raw.get("k") in seasons.EVENTS else "advent"}
    if t == "weather":
        return {"t": "weather", "c": raw.get("c") if raw.get("c") in WEATHER else "rainy"}
    if t == "temp":
        return {"t": "temp", "min": validate.integer(raw.get("min"), -20, 45, 25)}
    return {"t": t}


def clean_def(raw, persons: dict) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    size = raw.get("size") if raw.get("size") in SIZES else "m"
    season = str(raw.get("season") or "")
    if not (season == "" or (season.startswith("jz:") and season[3:] in seasons.JZ)
            or (season.startswith("vis:") and season[4:] in seasons.VISUALS)):
        season = ""
    nwd = raw.get("next_wd")
    end_md = seasons.clean_date(raw.get("end_md") or "")
    return {
        "title": validate.text(raw.get("title"), 80) or "?",
        "title_en": validate.text(raw.get("title_en"), 80),
        "icon": validate.text(raw.get("icon"), 8) or "⭐",
        "size": size, "pts": validate.integer(raw.get("pts"), 0, 1000, 10) if size == "own" else None,
        "mode": raw.get("mode") if raw.get("mode") in MODES else "free",
        "persons": [p for p in (raw.get("persons") or []) if p in persons][:20] if persons else list(raw.get("persons") or [])[:20],
        "anchor": _anchor(raw.get("anchor")),
        "off": validate.integer(raw.get("off"), -60, 60, 0),
        "span": validate.integer(raw.get("span"), 0, 60, 1),
        "end_md": end_md[-5:] if end_md else None,
        "next_wd": int(nwd) if str(nwd).isdigit() and 1 <= int(nwd) <= 7 else None,
        "from": _hhmm(raw.get("from")), "until": _hhmm(raw.get("until")),
        "season": season, "weather": raw.get("weather") if raw.get("weather") in WEATHER else "",
        "secret": bool(raw.get("secret")), "on": bool(raw.get("on", True)),
        "tpl": raw.get("tpl") if raw.get("tpl") in TEMPLATES else None,
    }


def clean_settings(raw) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    return {"enabled": bool(raw.get("enabled", True)),
            "surprise_per_week": validate.integer(raw.get("surprise_per_week"), 0, 14, 2),
            "max_open": validate.integer(raw.get("max_open"), 1, 20, 6)}


# --------------------------------------------------------------------------------------------- dates


def _with_wd(d: date, wd: int | None) -> date:
    if not wd:
        return d
    return d + timedelta(days=(wd - d.isoweekday()) % 7)


def anchors(df: dict, around: date, ctx: dict) -> list[tuple[date, str | None]]:
    """Anchor dates near `around` (+ the celebrated person for birthdays). ctx: events {key: [date]},
    birthdays {pid: 'MM-DD'}, wedding 'MM-DD', weather 'rainy', tmax 27."""
    a = df["anchor"]
    t = a["t"]
    lo, hi = around - timedelta(days=70), around + timedelta(days=70)
    out: list[tuple[date, str | None]] = []
    if t == "once" and a.get("d"):
        out.append((date.fromisoformat(a["d"]), None))
    elif t == "daily":
        out.append((around, None))
    elif t == "weekly":
        for k in range(-9, 2):
            d0 = around + timedelta(days=7 * k)
            for wd in a["days"]:
                out.append((d0 - timedelta(days=d0.isoweekday() - wd), None))
    elif t == "every":
        start = date.fromisoformat(a["d"])
        if around >= start:
            n = (around - start).days // a["n"]
            out += [(start + timedelta(days=a["n"] * k), None) for k in range(max(0, n - 6), n + 2)]
    elif t == "yearly":
        mo, dd = int(a["md"][:2]), int(a["md"][3:])
        out += [(seasons._on_year(mo, dd, y), None) for y in (around.year - 1, around.year, around.year + 1)]
    elif t == "event":
        out += [(d, None) for d in (ctx.get("events") or {}).get(a["k"], [])]
    elif t == "bday":
        for pid, md in (ctx.get("birthdays") or {}).items():
            mo, dd = int(md[-5:-3]), int(md[-2:])
            out += [(seasons._on_year(mo, dd, y), pid) for y in (around.year, around.year + 1)]
    elif t == "wedding" and ctx.get("wedding"):
        md = ctx["wedding"]
        out += [(seasons._on_year(int(md[-5:-3]), int(md[-2:]), y), None) for y in (around.year, around.year + 1)]
    elif t == "advent_sunday":
        out += [(seasons.advent(around.year, n), None) for n in (1, 2, 3, 4)]
    elif t == "advent_week":  # Monday after each Advent Sunday – the anchor is the Sunday, off=1
        out += [(seasons.advent(around.year, n), None) for n in (1, 2, 3, 4)]
    elif t == "weather" and ctx.get("weather") == a["c"]:
        out.append((around, None))
    elif t == "temp" and ctx.get("tmax") is not None and ctx["tmax"] >= a["min"]:
        out.append((around, None))
    return [(d, p) for d, p in out if lo <= d <= hi]


def window(df: dict, anchor: date) -> tuple[date, date]:
    start = _with_wd(anchor + timedelta(days=df["off"]), df.get("next_wd"))
    if df.get("end_md"):
        end = seasons._on_year(int(df["end_md"][:2]), int(df["end_md"][3:]), start.year)
        if end < start:
            end = start
    else:
        end = start + timedelta(days=max(1, df["span"]) - 1)
    return start, end


def _season_ok(df: dict, d: date, ctx: dict) -> bool:
    s = df.get("season")
    if not s:
        return True
    if s.startswith("jz:"):
        return seasons.jahreszeit(d) == s[3:]
    return ctx.get("vis") == s[4:]


def _eligible(df: dict, persons: dict) -> list[str]:
    if df["persons"]:
        return [p for p in df["persons"] if p in persons]
    kids = [p for p, x in persons.items() if x.get("role", "kid") != "adult"]
    return kids or list(persons)


# --------------------------------------------------------------------------------------------- instances


def desired(defs: dict, persons: dict, today: date, ctx: dict) -> dict[str, dict]:
    """Instances that should be open today: {iid: {sid, start, end, pid, for, mode}}."""
    out: dict[str, dict] = {}
    for sid, df in defs.items():
        if not df.get("on"):
            continue
        if df["weather"] and ctx.get("weather") != df["weather"]:
            continue
        for anc, for_pid in anchors(df, today, ctx):
            start, end = window(df, anc)
            if not (start <= today <= end) or not _season_ok(df, start, ctx):
                continue
            elig = [p for p in _eligible(df, persons) if p != for_pid]
            if not elig:
                continue
            base = f"{sid}:{anc.isoformat()}" + (f":{for_pid}" if for_pid else "")
            common = {"sid": sid, "start": start.isoformat(), "end": end.isoformat(), "for": for_pid, "mode": df["mode"]}
            if df["mode"] == "each":
                for pid in elig:
                    out[f"{base}:{pid}"] = {**common, "pid": pid}
            elif df["mode"] == "fixed":
                for pid in elig[:3]:
                    out[f"{base}:{pid}"] = {**common, "pid": pid}
            else:
                out[base] = {**common, "pid": None, "elig": elig}
    return out


def _week(d: str) -> tuple[int, int]:
    return date.fromisoformat(d).isocalendar()[:2]


def refresh(insts: dict, defs: dict, persons: dict, today: date, ctx: dict, cfg: dict) -> bool:
    """Bring the stored instances up to date (idempotent). Returns True if something changed."""
    cfg = clean_settings(cfg)
    want = desired(defs, persons, today, ctx) if cfg["enabled"] else {}
    changed = False
    t = today.isoformat()
    for iid in list(insts):
        inst = insts[iid]
        if inst.get("done"):
            if (inst.get("done_at") or "")[:10] < (today - timedelta(days=3)).isoformat() and inst["end"] < t:
                insts.pop(iid)
                changed = True
            continue
        expired = inst["end"] < t
        gone = iid not in want and inst.get("pid") is None
        if expired or gone or inst.get("sid") not in defs:
            insts.pop(iid)
            changed = True
    for iid, w in want.items():
        if iid in insts:
            continue
        inst = {k: v for k, v in w.items() if k != "elig" or w["mode"] == "free"}
        inst.update(done=False, done_at=None, claimed_at=None)
        if w["mode"] == "free" and sum(1 for x in insts.values() if x.get("pid") is None and not x.get("done")) >= cfg["max_open"]:
            continue
        if w["mode"] == "surprise":
            wk = _week(w["start"])
            load = {p: sum(1 for x in insts.values() if x.get("mode") == "surprise" and x.get("pid") == p
                           and _week(x["start"]) == wk) for p in w["elig"]}
            free = [p for p in w["elig"] if load[p] < cfg["surprise_per_week"]]
            if not free:
                continue
            rnd = random.Random(iid)
            lowest = min(load[p] for p in free)
            inst["pid"] = rnd.choice(sorted(p for p in free if load[p] == lowest))
        insts[iid] = inst
        changed = True
    return changed


def claim(insts: dict, defs: dict, persons: dict, iid: str, pid: str, ts: str) -> dict:
    """Fastest child wins: a free instance becomes theirs. Raises ValueError when not possible."""
    inst = insts.get(iid)
    if inst is None:
        raise KeyError(iid)
    if inst.get("pid") is not None:
        raise ValueError("taken")
    if pid not in persons or pid == inst.get("for"):
        raise ValueError("not_allowed")
    df = defs.get(inst["sid"]) or {}
    if df and pid not in _eligible(df, persons):
        raise ValueError("not_allowed")
    inst["pid"] = pid
    inst["claimed_at"] = ts
    return inst


def points(df: dict, size_points: dict) -> int:
    if df.get("size") == "own":
        return int(df.get("pts") or 0)
    return int(size_points.get(df.get("size") or "m", 0))


def view(insts: dict, defs: dict, lang: str) -> list[dict]:
    out = []
    for iid, inst in sorted(insts.items(), key=lambda x: (x[1]["end"], x[0])):
        df = defs.get(inst["sid"])
        if not df:
            continue
        title = (df.get("title_en") if lang == "en" and df.get("title_en") else df["title"])
        out.append({"id": iid, **inst, "title": title, "icon": df["icon"], "size": df["size"], "secret": df["secret"],
                    "from": df["from"], "until": df["until"]})
    return out
