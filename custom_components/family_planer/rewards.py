"""Points, levels and real rewards (no Home Assistant imports, unit-testable).

ledger:   [{"id", "pid", "pts", "kind", "ref", "text", "ts"}]      kinds: chore, bonus, streak, adjust, reward
rewards:  {rid: {"title", "icon", "cost", "approval", "persons": [], "per_week": 0}}
requests: {qid: {"rid", "pid", "cost", "title", "status": pending|approved|denied, "ts", "decided"}}
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
import hashlib
import hmac
import secrets

LEVELS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]
LEVEL_NAMES = {
    "de": ["Starter", "Helfer", "Anpacker", "Profi", "Meister", "Held", "Champion", "Legende", "Superstar", "Grossmeister"],
    "en": ["Starter", "Helper", "Go-getter", "Pro", "Master", "Hero", "Champion", "Legend", "Superstar", "Grandmaster"],
}
DEFAULTS = {"default_points": 10, "day_points": 30, "day_bonus": 5, "streak_bonus": 20}
MODES = ("fair", "per_chore")


def new_id() -> str:
    return secrets.token_hex(6)


# ------------------------------------------------------------------ balances
def balance(ledger: list[dict], pid: str) -> int:
    return sum(e["pts"] for e in ledger if e["pid"] == pid)


def lifetime(ledger: list[dict], pid: str) -> int:
    """Everything ever earned (rewards do not lower the level)."""
    return sum(e["pts"] for e in ledger if e["pid"] == pid and e["kind"] != "reward" and e["pts"] > 0)


def reserved(requests: dict, pid: str) -> int:
    return sum(r["cost"] for r in requests.values() if r["pid"] == pid and r["status"] == "pending")


def available(data: dict, pid: str) -> int:
    return balance(data["ledger"], pid) - reserved(data["requests"], pid)


def level(points: int, lang: str) -> dict:
    idx = max(i for i, floor in enumerate(LEVELS) if points >= floor)
    nxt = LEVELS[idx + 1] if idx + 1 < len(LEVELS) else None
    names = LEVEL_NAMES["de" if lang == "de" else "en"]
    return {"level": idx + 1, "name": names[idx], "floor": LEVELS[idx], "next": nxt,
            "progress": 100 if nxt is None else round((points - LEVELS[idx]) / (nxt - LEVELS[idx]) * 100)}


def _has(ledger: list[dict], ref: str) -> bool:
    return any(e.get("ref") == ref for e in ledger)


def _add(ledger: list[dict], pid: str, pts: int, kind: str, ref: str, text: str, ts: str) -> dict:
    entry = {"id": new_id(), "pid": pid, "pts": int(pts), "kind": kind, "ref": ref, "text": text, "ts": ts}
    ledger.append(entry)
    return entry


# ------------------------------------------------------------------ earning
def chore_done(data: dict, item_id: str, item: dict, points: int, ts: str) -> None:
    """Book (or un-book) the points of one chore item; idempotent per item."""
    ref = f"item:{item_id}"
    data["ledger"][:] = [e for e in data["ledger"] if e.get("ref") != ref]
    if item.get("done") and points > 0:
        _add(data["ledger"], item["person_id"], points, "chore", ref, item.get("title", ""), ts)


def fair_shares(items: list[tuple[str, int, bool]], day_points: int) -> dict[str, int]:
    """Fair mode: a fully completed day is worth day_points for everybody, however many chores they have.

    items: (item id, weight, done) of one person's chores of the day. Each chore earns its share of
    day_points (weight / total weight); cumulative rounding makes a complete day add up to exactly day_points.
    """
    total = sum(max(1, w) for _, w, _ in items)
    out: dict[str, int] = {}
    if not total or day_points <= 0:
        return {iid: 0 for iid, _, _ in items}
    cum, prev = 0.0, 0
    for iid, w, _done in sorted(items):
        cum += day_points * max(1, w) / total
        now = round(cum)
        out[iid] = now - prev
        prev = now
    return out


def rebook_fair(data: dict, pid: str, items: list[tuple[str, dict, int]], day_points: int, ts: str) -> None:
    """Re-book the chore points of one person's current items (done ones get their fair share)."""
    shares = fair_shares([(iid, w, bool(it.get("done"))) for iid, it, w in items], day_points)
    for iid, it, _w in items:
        ref = f"item:{iid}"
        old = next((e for e in data["ledger"] if e.get("ref") == ref), None)
        pts = shares.get(iid, 0) if it.get("done") else 0
        if old and old["pts"] == pts:
            continue
        data["ledger"][:] = [e for e in data["ledger"] if e.get("ref") != ref]
        if pts > 0:
            _add(data["ledger"], pid, pts, "chore", ref, it.get("title", ""), old["ts"] if old else ts)


def day_bonuses(data: dict, day: date, streaks: dict[str, int], settings: dict, ts: str) -> list[dict]:
    """Bonus for a fully completed day and every 7th day of a streak (idempotent per person and day)."""
    out = []
    rec_day = data["history"].get(day.isoformat(), {})
    bonus = int(settings.get("day_bonus", DEFAULTS["day_bonus"]))
    streak_bonus = int(settings.get("streak_bonus", DEFAULTS["streak_bonus"]))
    for pid, rec in rec_day.items():
        if pid not in data["persons"] or not rec.get("total") or rec.get("done") != rec.get("total"):
            continue
        ref = f"day:{day.isoformat()}:{pid}"
        if bonus > 0 and not _has(data["ledger"], ref):
            out.append(_add(data["ledger"], pid, bonus, "bonus", ref, day.isoformat(), ts))
        s = streaks.get(pid, 0)
        sref = f"streak:{day.isoformat()}:{pid}"
        if streak_bonus > 0 and s and s % 7 == 0 and not _has(data["ledger"], sref):
            out.append(_add(data["ledger"], pid, streak_bonus, "streak", sref, str(s), ts))
    return out


def adjust(data: dict, pid: str, pts: int, text: str, ts: str) -> dict:
    if pid not in data["persons"]:
        raise KeyError(pid)
    return _add(data["ledger"], pid, pts, "adjust", f"adj:{new_id()}", text, ts)


# ------------------------------------------------------------------ spending
class RewardError(ValueError):
    """Reason in .args[0]: not_enough_points, not_allowed, weekly_limit."""


def redeem(data: dict, pid: str, rid: str, now: datetime) -> dict:
    reward = data["rewards"].get(rid)
    if reward is None or pid not in data["persons"]:
        raise KeyError(rid)
    if reward.get("persons") and pid not in reward["persons"]:
        raise RewardError("not_allowed")
    if reward.get("per_week"):
        since = (now - timedelta(days=7)).isoformat()
        used = sum(1 for r in data["requests"].values()
                   if r["rid"] == rid and r["pid"] == pid and r["status"] != "denied" and r["ts"] >= since)
        if used >= reward["per_week"]:
            raise RewardError("weekly_limit")
    cost = int(reward["cost"])
    if available(data, pid) < cost:
        raise RewardError("not_enough_points")
    qid = new_id()
    req = {"rid": rid, "pid": pid, "cost": cost, "title": reward["title"], "status": "pending",
           "ts": now.isoformat(), "decided": None}
    data["requests"][qid] = req
    if not reward.get("approval", True):
        decide(data, qid, True, now)
    return {"id": qid, **req}


def decide(data: dict, qid: str, approve: bool, now: datetime) -> dict:
    req = data["requests"].get(qid)
    if req is None:
        raise KeyError(qid)
    if req["status"] != "pending":
        return req
    req["status"] = "approved" if approve else "denied"
    req["decided"] = now.isoformat()
    if approve:
        _add(data["ledger"], req["pid"], -req["cost"], "reward", f"req:{qid}", req["title"], now.isoformat())
    return req


def trim(data: dict, keep_days: int, today: date) -> None:
    """Fold ledger entries older than keep_days into one carry entry per person; drop old decided requests."""
    limit = (today - timedelta(days=keep_days)).isoformat()
    old = [e for e in data["ledger"] if e["ts"] < limit and e["kind"] != "carry"]
    if old:
        keep = [e for e in data["ledger"] if not (e["ts"] < limit and e["kind"] != "carry")]
        per: dict[str, tuple[int, int]] = {}
        for e in old:
            b, life = per.get(e["pid"], (0, 0))
            per[e["pid"]] = (b + e["pts"], life + (e["pts"] if e["pts"] > 0 and e["kind"] != "reward" else 0))
        for pid, (b, life) in per.items():
            # carry keeps balance; lifetime points live on in a positive 'carry' + negative 'reward' pair
            keep.append({"id": new_id(), "pid": pid, "pts": life, "kind": "carry", "ref": f"carry:{limit}:{pid}",
                         "text": "", "ts": limit})
            if b - life:
                keep.append({"id": new_id(), "pid": pid, "pts": b - life, "kind": "reward",
                             "ref": f"carryr:{limit}:{pid}", "text": "", "ts": limit})
        data["ledger"][:] = keep
    data["requests"] = {k: v for k, v in data["requests"].items()
                        if v["status"] == "pending" or (v.get("decided") or v["ts"]) >= limit}


# ------------------------------------------------------------------ parent PIN
def hash_pin(pin: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode(), bytes.fromhex(salt), 200_000).hex()
    return f"pbkdf2${salt}${digest}"


def check_pin(stored: str | None, pin: str | None) -> bool:
    if not stored or not pin:
        return False
    try:
        _algo, salt, digest = stored.split("$")
        test = hashlib.pbkdf2_hmac("sha256", str(pin).encode(), bytes.fromhex(salt), 200_000).hex()
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(test, digest)
