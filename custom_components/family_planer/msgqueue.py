"""Announcement queue: one-off messages that wait for motion (no Home Assistant imports, unit-testable).

entry = {"id", "text", "key", "rooms": [motion entity ids] (empty = any), "until": iso datetime,
         "item": chore item id or None (dropped once that item is done or gone), "created": iso datetime}
"""
from __future__ import annotations

from datetime import datetime
import secrets

MAX_ENTRIES = 50


def add(queue: list[dict], text: str, now: datetime, until: datetime, key: str | None = None,
        rooms: list[str] | None = None, item: str | None = None) -> dict:
    """Add (or replace by key) a message; oldest entries are dropped beyond MAX_ENTRIES."""
    if key:
        queue[:] = [q for q in queue if q.get("key") != key]
    entry = {"id": secrets.token_hex(6), "text": text, "key": key or None, "rooms": list(rooms or []),
             "until": until.isoformat(), "item": item, "created": now.isoformat()}
    queue.append(entry)
    del queue[:-MAX_ENTRIES]
    return entry


def remove(queue: list[dict], key: str) -> int:
    before = len(queue)
    queue[:] = [q for q in queue if q.get("key") != key]
    return before - len(queue)


def prune(queue: list[dict], now: datetime, items: dict) -> None:
    """Drop expired messages and messages about chores that are already done."""
    keep = []
    for q in queue:
        if datetime.fromisoformat(q["until"]) <= now:
            continue
        if q.get("item"):
            it = items.get(q["item"])
            if it is None or it.get("done"):
                continue
        keep.append(q)
    queue[:] = keep


def take(queue: list[dict], sensor: str | None, now: datetime, items: dict) -> list[str]:
    """Messages to say now for motion at `sensor`; they are removed from the queue."""
    prune(queue, now, items)
    out, keep = [], []
    for q in queue:
        if not q["rooms"] or sensor in q["rooms"]:
            out.append(q["text"])
        else:
            keep.append(q)
    queue[:] = keep
    return out
