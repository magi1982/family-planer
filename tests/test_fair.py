"""Fair points: a complete day is worth the same for everybody."""
import importlib.util
import pathlib

_spec = importlib.util.spec_from_file_location("fp_rewards_fair", pathlib.Path(__file__).parents[1] / "custom_components/family_planer/rewards.py")
rewards = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rewards)


def _data():
    return {"ledger": []}


def _items(pid, n, done):
    return [(f"{pid}{i}", {"person_id": pid, "done": i < done, "title": f"A{i}"}, 10) for i in range(n)]


def test_full_day_equal_regardless_of_count():
    d = _data()
    rewards.rebook_fair(d, "a", _items("a", 2, 2), 30, "t")
    rewards.rebook_fair(d, "b", _items("b", 6, 6), 30, "t")
    assert rewards.balance(d["ledger"], "a") == 30 and rewards.balance(d["ledger"], "b") == 30


def test_partial_is_proportional_and_reopen_rebooks():
    d = _data()
    rewards.rebook_fair(d, "b", _items("b", 6, 3), 30, "t")
    assert rewards.balance(d["ledger"], "b") == 15
    rewards.rebook_fair(d, "b", _items("b", 6, 0), 30, "t")
    assert rewards.balance(d["ledger"], "b") == 0


def test_shares_sum_exactly_and_weights():
    s = rewards.fair_shares([("x", 10, True), ("y", 10, True), ("z", 10, True)], 10)
    assert sum(s.values()) == 10
    w = rewards.fair_shares([("x", 20, True), ("y", 10, True)], 30)
    assert w == {"x": 20, "y": 10}


def test_special_chore_keeps_its_own_points_and_does_not_eat_the_day():
    """A ⭐ special chore with its own rule (e.g. 400 points, several days) came into the day's split and took
    almost all of it: the normal chores showed +1 or nothing and the special one less than set."""
    normal = [(f"n{i}", 10) for i in range(7)]
    shown = rewards.item_points(normal + [("sp", 400)], True, 30, {"sp"})
    assert shown["sp"] == 400
    assert sum(shown[f"n{i}"] for i in range(7)) == 30 and min(shown[f"n{i}"] for i in range(7)) >= 4
    # booked the same way: all normal chores done = the full day, the special one on top once it is done
    d = _data()
    items = [(f"n{i}", {"person_id": "a", "done": True, "title": f"A{i}"}, 10) for i in range(7)]
    items.append(("sp", {"person_id": "a", "done": False, "title": "Big job"}, 400))
    rewards.rebook_fair(d, "a", items, 30, "t", {"sp"})
    assert rewards.balance(d["ledger"], "a") == 30
    items[-1][1]["done"] = True
    rewards.rebook_fair(d, "a", items, 30, "t", {"sp"})
    assert rewards.balance(d["ledger"], "a") == 430


def test_only_special_chores_still_give_their_points():
    assert rewards.item_points([("sp", 25)], True, 30, {"sp"}) == {"sp": 25}
