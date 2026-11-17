"""Unit tests for trophies and awards (0.9.0)."""
import importlib.util
from datetime import date, timedelta
from pathlib import Path

_spec = importlib.util.spec_from_file_location(
    "fp_awards", Path(__file__).parents[1] / "custom_components/family_planer/awards.py")
A = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(A)

MON = date(2026, 11, 2)  # Monday
TODAY = MON + timedelta(days=7)  # next Monday: last week is complete
TS = "2026-11-09T06:00:00+01:00"


def _add(ledger, pid, pts, kind, ref, text, ts):
    entry = {"pid": pid, "pts": pts, "kind": kind, "ref": ref, "text": text, "ts": ts}
    ledger.append(entry)
    return entry


def _data(history, persons=("lea", "mia", "tom")):
    return {"persons": {p: {"name": p} for p in persons}, "history": history, "ledger": []}


def _week(per_person, start=MON):
    """per_person: {pid: [(done, total, last), ...7 days]}"""
    hist = {}
    for pid, days in per_person.items():
        for i, rec in enumerate(days):
            if rec is None:
                continue
            done, total, last = rec
            hist.setdefault((start + timedelta(days=i)).isoformat(), {})[pid] = {
                "done": done, "total": total, "missed": [], **({"last": last} if last else {})}
    return hist


CFG = A.clean_settings(None)


def test_weekly_awards_once_per_week_with_points_and_confetti():
    hist = _week({
        "lea": [(2, 2, "08:30")] * 7,                       # perfect, weekend, crown (fair)
        "mia": [(6, 6, "18:00")] * 5 + [(3, 6, None)] * 2,  # many chores, weak weekend
        "tom": [(1, 2, None)] * 7,
    })
    data = _data(hist)
    A.evaluate(data, TODAY, {"lea": 7}, CFG, True, 30, TS, _add)
    h = data["awards"]["holders"]
    assert h["crown"] == ["lea"] and h["perfect"] == ["lea"] and h["weekend"] == ["lea"]
    assert h["bee"] == ["lea"]  # fair: 7 complete days beat 6 days
    refs = {e["ref"] for e in data["ledger"]}
    assert f"award:crown:{MON.isoformat()}:lea" in refs
    crown_pts = [e["pts"] for e in data["ledger"] if e["ref"].startswith("award:crown")]
    assert crown_pts == [20]  # medium = 2/3 of 30
    # at most one big confetti rain per person and day – the other wins become banners
    lea = [c for c in data["awards"]["celebrations"] if c["pid"] == "lea"]
    assert sum(1 for c in lea if c["fx"] in ("m", "l")) == 1
    # idempotent: evaluating again the same week changes nothing
    n = len(data["ledger"])
    A.evaluate(data, TODAY + timedelta(days=1), {"lea": 8}, CFG, True, 30, TS, _add)
    assert len(data["ledger"]) == n


def test_count_mode_bee_goes_to_most_chores():
    hist = _week({"lea": [(2, 2, None)] * 7, "mia": [(6, 6, None)] * 5 + [(3, 6, None)] * 2})
    data = _data(hist, ("lea", "mia"))
    A.evaluate(data, TODAY, {}, CFG, False, 30, TS, _add)
    assert data["awards"]["holders"]["bee"] == ["mia"] and data["awards"]["holders"]["crown"] == ["lea"]


def test_awards_can_be_switched_off_and_resized():
    cfg = A.clean_settings({"items": {"crown": {"on": False}, "perfect": {"size": "none"}}})
    data = _data(_week({"lea": [(2, 2, None)] * 7}), ("lea",))
    A.evaluate(data, TODAY, {}, cfg, True, 30, TS, _add)
    assert data["awards"]["holders"]["crown"] == []
    assert data["awards"]["holders"]["perfect"] == ["lea"]
    assert not any(e["ref"].startswith("award:perfect") for e in data["ledger"])  # size "none" = no points


def test_climber_needs_15_points_improvement():
    prev = _week({"lea": [(1, 2, None)] * 7, "mia": [(2, 2, None)] * 7}, MON - timedelta(days=7))
    cur = _week({"lea": [(2, 2, None)] * 7, "mia": [(2, 2, None)] * 7})
    data = _data({**prev, **cur}, ("lea", "mia"))
    A.evaluate(data, TODAY, {}, CFG, True, 30, TS, _add)
    assert data["awards"]["holders"]["climber"] == ["lea"]


def test_monthly_trophy_and_diamond_and_milestones():
    hist = {}
    oct1 = date(2026, 10, 1)
    for i in range(31):
        hist[(oct1 + timedelta(days=i)).isoformat()] = {"lea": {"done": 4, "total": 4, "missed": []},
                                                         "mia": {"done": 1, "total": 4, "missed": ["x"]}}
    data = _data(hist, ("lea", "mia"))
    A.evaluate(data, date(2026, 11, 2), {"lea": 31, "mia": 0}, CFG, True, 30, TS, _add)
    h = data["awards"]["holders"]
    assert h["trophy"] == ["lea"] and h["diamond"] == ["lea"]
    # milestones count days with every own chore done: 31 days -> 25-day milestone; mia never finished a day
    assert data["counters"]["lea"]["full_days"] == 31 and h["milestone"] == ["lea"]
    assert data["awards"]["milestone"]["lea"] == 25
    pts = {e["ref"].split(":")[1]: e["pts"] for e in data["ledger"] if e["pid"] == "lea"}
    assert pts["trophy"] == 30 and pts["diamond"] == 60 and pts["milestone"] == 20
    # streak breaks -> diamond goes away; reaching 30 again later wins it again
    A.evaluate(data, date(2026, 11, 3), {"lea": 0}, CFG, True, 30, TS, _add)
    assert data["awards"]["holders"]["diamond"] == []
    A.evaluate(data, date(2026, 12, 3), {"lea": 30}, CFG, True, 30, "2026-12-03T06:00:00+01:00", _add)
    assert len([e for e in data["ledger"] if e["ref"].startswith("award:diamond")]) == 2


def test_family_teamwork_and_day_done():
    yday = (TODAY - timedelta(days=1)).isoformat()
    data = _data({yday: {"lea": {"done": 2, "total": 2, "missed": []}, "mia": {"done": 3, "total": 3, "missed": []}}},
                 ("lea", "mia", "tom"))
    A.evaluate(data, TODAY, {}, CFG, True, 30, TS, _add)
    assert data["awards"]["holders"]["team"] == ["lea", "mia"]
    assert any(c["kind"] == "team" and c["pid"] is None for c in data["awards"]["celebrations"])
    first = A.day_done(data, "lea", TODAY, "#ff0000", TS, CFG)
    assert first and first["fx"] == "s" and first["color"] == "#ff0000"
    assert A.day_done(data, "lea", TODAY, "#ff0000", TS, CFG) is None  # once per day


def test_person_awards_frame_and_open_awards():
    data = _data(_week({"lea": [(2, 2, None)] * 7, "mia": [(1, 2, None)] * 7}), ("lea", "mia"))
    A.evaluate(data, TODAY, {"lea": 7}, CFG, True, 30, TS, _add)
    per = A.person_awards(data, {"lea": 7, "mia": 0})
    ids = [a["id"] for a in per["lea"]]
    assert "crown" in ids and "streak" in ids and "start" not in ids
    assert A.frame(per["lea"]) == "gold"  # crown = gold (no trophy of the month yet)
    assert A.frame(per["mia"]) is None
    open_ids = {a["id"] for a in A.open_awards(data, TODAY + timedelta(days=2), {"lea": 9}, True, CFG)}
    assert "trophy" in open_ids and "crown" not in open_ids


def test_points_sizes():
    assert [A.points_for(s, 30) for s in A.SIZES] == [0, 10, 20, 30, 60]
    assert A.points_for("s", 31) == 11


def test_milestones_are_fair_whatever_the_number_of_chores():
    hist = {}
    for i in range(25):
        hist[(date(2026, 10, 1) + timedelta(days=i)).isoformat()] = {
            "lea": {"done": 1, "total": 1, "missed": []},        # one chore a day
            "mia": {"done": 6, "total": 6, "missed": []},        # six chores a day
            "tom": {"done": 5, "total": 6, "missed": ["x"]}}     # many done, never all
    data = _data(hist)
    A.evaluate(data, date(2026, 10, 26), {}, CFG, True, 30, TS, _add)
    assert sorted(data["awards"]["holders"]["milestone"]) == ["lea", "mia"]
    assert data["awards"]["full_level"] == {"lea": 25, "mia": 25, "tom": 0}


def test_on_time_counts_evening_chores_until_the_cutoff():
    hist = {}
    for i in range(7):
        d = (MON + timedelta(days=i)).isoformat()
        hist[d] = {"lea": {"done": 2, "total": 2, "missed": [], "due_times": ["07:10", "19:30"]},   # evening chore in time
                   "mia": {"done": 2, "total": 2, "missed": [], "due_times": ["21:15"], "before": 1},  # one late each day
                   "tom": {"done": 1, "total": 1, "missed": []}}                                     # no times known
    data = _data(hist)
    A.evaluate(data, TODAY, {}, CFG, True, 30, TS, _add)
    assert data["awards"]["holders"]["ontime"] == ["lea"]
    cfg = A.clean_settings({"ontime_time": "22:00"})
    data = _data(hist)
    A.evaluate(data, TODAY, {}, cfg, True, 30, TS, _add)
    assert sorted(data["awards"]["holders"]["ontime"]) == ["lea", "mia"]


def test_volunteer_champion_and_rescuer():
    data = _data({})
    def done(iid, pid, start, claimed, day):
        A.log_volunteer(data, iid, {"pid": pid, "mode": "free", "start": start, "claimed_at": claimed + "T10:00"}, True, day)
    done("a", "lea", "2026-11-02", "2026-11-02", MON)
    done("b", "lea", "2026-11-03", "2026-11-03", MON + timedelta(days=1))
    done("c", "mia", "2026-11-01", "2026-11-04", MON + timedelta(days=2))   # waited three days for somebody
    done("d", "tom", "2026-11-04", "2026-11-04", MON + timedelta(days=2))
    done("e", "tom", "2026-11-05", "2026-11-05", MON + timedelta(days=3))
    A.log_volunteer(data, "e", {"pid": "tom", "mode": "free"}, False, MON + timedelta(days=3))  # undone again
    A.evaluate(data, TODAY, {}, CFG, True, 30, TS, _add)
    h = data["awards"]["holders"]
    assert h["volunteer"] == ["lea"] and h["rescue"] == ["mia"]
    assert any(e["ref"] == f"award:volunteer:{MON.isoformat()}:lea" for e in data["ledger"])
    # handed-out chores are no volunteering
    A.log_volunteer(data, "f", {"pid": "mia", "mode": "each", "start": "2026-11-10"}, True, TODAY)
    assert "f" not in data["awards"]["vol"]
