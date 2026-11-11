"""Levels per season: thresholds, season reset, bonus, unlocks."""
from datetime import date
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("fp_levels", Path(__file__).parents[1] / "custom_components/family_planer/levels.py")
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
GAME = {"day_points": 30, "day_bonus": 5, "streak_bonus": 20}


def _add(ledger, pid, pts, kind, ref, text, ts):
    ledger.append({"id": ref, "pid": pid, "pts": pts, "kind": kind, "ref": ref, "text": text, "ts": ts})


def _earn(data, pid, pts, day="2026-09-01"):
    data["ledger"].append({"id": f"e{len(data['ledger'])}", "pid": pid, "pts": pts, "kind": "chore", "ref": "", "text": "", "ts": day + "T18:00:00"})


def test_curve_matches_the_targets():
    fd = L.full_day(GAME)
    # 80 % reliable for 10 months (~304 days) reaches Diamond, 95 % reaches Ruby
    assert L.level_for(round(0.80 * 304 * fd), GAME) == 16
    assert L.level_for(round(0.95 * 304 * fd), GAME) == 21
    assert L.level_for(0, GAME) == 1 and L.level_for(L.threshold(5, GAME), GAME) == 5
    assert [L.tier(n)[0] for n in (1, 5, 6, 11, 16, 21, 30)] == ["bronze", "bronze", "silver", "gold", "diamond", "ruby", "ruby"]
    assert L.name(21, "de") == "Allerkrassester Krassomat" and L.name(30, "en").endswith("+6")


def test_season_start():
    assert L.season_start(date(2026, 11, 11)) == date(2026, 8, 1)
    assert L.season_start(date(2027, 7, 31)) == date(2026, 8, 1)
    assert L.season_start(date(2027, 8, 1), "08-01") == date(2027, 8, 1)
    assert L.season_start(date(2027, 1, 5), "bad") == date(2026, 8, 1)


def test_level_up_bonus_unlocks_and_reset():
    data = {"persons": {"lea": {}}, "ledger": []}
    assert L.evaluate(data, date(2026, 9, 1), GAME, "08-01", "t0", _add) == []      # first run: only records
    _earn(data, "lea", L.threshold(5, GAME))
    ups = L.evaluate(data, date(2026, 9, 2), GAME, "08-01", "t1", _add)
    assert ups[0]["level"] == 5 and set(ups[0]["unlocks"]) == {"levelcap", "goldbrille", "hamster", "funkelsprossen", "sternchen"}
    bonus = [e for e in data["ledger"] if e["kind"] == "level"]
    assert len(bonus) == 4 and ups[0]["bonus"] == 4 * round(L.full_day(GAME))
    # bonus points do not count for the level, and nothing is booked twice
    assert L.evaluate(data, date(2026, 9, 3), GAME, "08-01", "t2", _add) == []
    assert L.xp(data["ledger"], "lea", date(2026, 8, 1)) == L.threshold(5, GAME)
    # new school year: back to level 1, best level and unlocks stay
    L.evaluate(data, date(2027, 8, 2), GAME, "08-01", "t3", _add)
    st = data["levels"]["lea"]
    assert st["level"] == 1 and st["best"]["2026-08-01"] == 5 and "hamster" in st["unlocked"]
    assert L.view(data, "lea", GAME, date(2027, 8, 2), "08-01", "de")["level"] == 1
