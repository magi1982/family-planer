"""Balance: after 3 months a child has about 10 pets, about 3 at the top (Legende) and 2-3 in between.

Simulates 90 days with the real rules of pets.py (chores with drops, the daily wheel, garden growth) for two ways
of playing: always the favourite pet, or half favourite / half spread. Assumption: 25 coins for a full day,
80 % of the chores done.
"""
import importlib.util
import pathlib
import random
import statistics
import sys
from datetime import datetime, timedelta

_p = pathlib.Path(__file__).parents[1] / "custom_components/family_planer/pets.py"
_spec = importlib.util.spec_from_file_location("fp_pets_balance", _p)
pets = importlib.util.module_from_spec(_spec)
sys.modules["fp_pets_balance"] = pets
_spec.loader.exec_module(pets)


def simulate(seed, mode, days=90, ppd=25, chores=3, done=0.8):
    rng = random.Random(seed)
    st = pets.new_state(datetime(2026, 1, 1, 8))
    for day in range(days):
        now = datetime(2026, 1, 1, 8) + timedelta(days=day)
        entries = []
        all_done = True
        for c in range(chores):
            if rng.random() < done:
                pts = round(ppd / chores)
                st["pts"] += pts
                entries.append({"ref": f"{day}-{c}", "pts": pts, "kind": "chore"})
            else:
                all_done = False
        if all_done:
            st["pts"] += 5
        pets.drops(st, entries, rng)
        pets.garden_grow(st, now.date())
        for _ in range(5):
            pets.spin(st, now.date(), rng)
            if st["wheel"]:
                break
        for _ in range(300):
            pp = st["pets"]
            for k, p in list(pp.items()):
                if pets.ready(p):
                    if p["step"] == 0:
                        pets.hatch(st, k, rng)
                    else:
                        pets.evolve(st, k, {}, "", now)
            eggs = [k for k, p in pp.items() if p["step"] == 0]
            grow = [k for k, p in pp.items() if p["step"] > 0 and pets.next_need(p) is not None]
            fav = max(grow, key=lambda k: (pp[k]["step"], pp[k]["g"])) if grow else None
            tgt = eggs[0] if eggs else (fav if mode == "focus" or rng.random() < 0.5 else rng.choice(grow)) if grow else None
            if tgt is None:
                break
            st["active"] = tgt
            p = pp[tgt]
            need = pets.next_need(p) - p["g"]
            if st["inv"].get(pets.DEV_PILL) and p["step"] >= 3 and need > 200:
                pets.use(st, tgt, pets.DEV_PILL, now)
            elif any(st["inv"].get(g) for g in pets.GROW):
                pets.use(st, tgt, next(g for g in ("wachs_l", "wachs_m", "wachs_s") if st["inv"].get(g)), now)
            elif st["pts"] > 0:
                pets.spend(st, tgt, min(pets.SPEND_MAX, st["pts"]))
            else:
                break
    steps = [p["step"] for p in st["pets"].values()]
    return len(steps), sum(1 for s in steps if s == 6), sum(1 for s in steps if 2 <= s <= 5)


def _stats(mode, runs=60):
    res = [simulate(s, mode) for s in range(runs)]
    return [statistics.mean(r[i] for r in res) for i in range(3)], min(r[1] for r in res)


def test_three_months_bring_about_ten_pets_three_at_the_top_and_some_in_between():
    for mode, mid in (("focus", (2.0, 4.0)), ("mixed", (2.0, 6.0))):
        (n, top, between), top_min = _stats(mode)
        assert 9.5 <= n <= 12, (mode, n)
        assert 2.5 <= top <= 4.0 and top_min >= 2, (mode, top, top_min)
        assert mid[0] <= between <= mid[1], (mode, between)
