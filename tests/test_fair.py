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
