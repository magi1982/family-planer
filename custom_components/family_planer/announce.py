"""Spoken reminders: when motion is detected, tell who still has chores (or that everything is done).

Targets can be notify entities (e.g. Alexa "Announce"/"Speak" from the Alexa Devices integration) and/or a
TTS entity with media players. Time window, cooldown and the "all done" message are configurable.
"""
from __future__ import annotations

from datetime import datetime, time, timedelta
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.const import STATE_ON
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change
from homeassistant.util import dt as dt_util

from . import engine, msgqueue, speech

if TYPE_CHECKING:
    from .planner import FamilyPlanner

_LOGGER = logging.getLogger(__name__)

DEFAULT_ANNOUNCE: dict[str, Any] = {
    "enabled": False, "motion": [], "notify": [], "tts": None, "media_players": [],
    "start": "15:00", "end": "20:00", "cooldown": 60, "all_done": True, "persons": [],
    # queue: one-off messages wait for the next motion (within quiet-hours limits) until they expire
    "queue": True, "queue_start": "07:00", "queue_end": "21:00", "queue_rewards": True, "queue_special": True,
    "max_items": 3, "reward_hours": 0,  # 0 = until the next day change
    # without a motion sensor: fixed times (lunch, evening) plus a 20:00 summary of what is still open
    "fixed": True, "times": ["12:30", "18:30"], "evening": True, "evening_time": "20:00",
    "praise": True, "birthday": True,
}
BIRTHDAY_TIMES = ("08:15", "11:45", "14:30", "16:45", "19:15")


def _in_window(now: time, start: str, end: str) -> bool:
    s = time.fromisoformat(start)
    e = time.fromisoformat(end)
    return s <= now <= e if s <= e else (now >= s or now <= e)  # window over midnight


class Announcer:
    """Listens to motion sensors of one planner and speaks reminders."""

    def __init__(self, hass: HomeAssistant, planner: FamilyPlanner) -> None:
        self.hass = hass
        self.planner = planner
        self._unsub = None
        self._last: datetime | None = None
        self._all_done_day: str | None = None
        self._timers: list = []
        self._praise_day: str | None = None
        self._bday_said: dict[str, int] = {}

    @property
    def cfg(self) -> dict[str, Any]:
        return {**DEFAULT_ANNOUNCE, **(self.planner.settings.get("announce") or {})}

    @callback
    def start(self) -> None:
        self.stop()
        cfg = self.cfg
        if not (cfg["enabled"] and (cfg["notify"] or (cfg["tts"] and cfg["media_players"]))):
            return
        if cfg["motion"]:
            self._unsub = async_track_state_change_event(self.hass, cfg["motion"], self._motion)
        elif cfg["fixed"]:
            for t in cfg["times"]:
                self._at(t, "fixed")
        if cfg["evening"]:
            self._at(cfg["evening_time"], "evening")
        if cfg["birthday"]:
            for t in BIRTHDAY_TIMES:
                self._at(t, "birthday")

    def _at(self, hhmm: str, kind: str) -> None:
        try:
            h, m = (int(x) for x in hhmm.split(":"))
        except ValueError:
            return

        @callback
        def fire(_now: datetime) -> None:
            self.hass.async_create_task(self.async_timed(kind), eager_start=False)

        self._timers.append(async_track_time_change(self.hass, fire, hour=h, minute=m, second=0))

    @callback
    def stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None
        for cancel in self._timers:
            cancel()
        self._timers.clear()

    def _home(self) -> list[tuple[str, dict]]:
        """Persons the announcements are for – without those marked away (holiday check)."""
        cfg = self.cfg
        p = self.planner
        today = p.today().isoformat()
        return [(pid, x) for pid, x in p.persons_sorted() if (not cfg["persons"] or pid in cfg["persons"])
                and today not in (p.away.get(pid) or ())]

    async def async_timed(self, kind: str) -> str:
        """Fixed-time announcements (no motion sensor), the evening summary and birthday messages."""
        cfg = self.cfg
        p = self.planner
        home = self._home()
        if not home:
            return ""
        today = p.today()
        text = ""
        if kind == "birthday":
            bdays = [pid for pid in (p.season().get("birthdays") or []) if any(pid == h for h, _ in home)]
            parts = []
            for pid in bdays:
                n = self._bday_said.get(f"{today}:{pid}", 0)
                name = p.data["persons"][pid]["name"]
                msgs = speech.birthday_messages(name, p.lang, today.toordinal() + hash(pid) % 97, len(BIRTHDAY_TIMES),
                                                (p.season().get("ages") or {}).get(pid))
                if n < len(msgs):
                    parts.append(msgs[n])
                    self._bday_said[f"{today}:{pid}"] = n + 1
            text = " ".join(parts)
        else:
            open_by, done = [], []
            for pid, person in home:
                act = engine.active_items(p.data["items"], pid, today)
                titles = sorted(it["title"] for _, it in act if not it.get("done"))
                if titles:
                    open_by.append((person["name"], titles))
                elif act:
                    done.append(person["name"])
            mx = int(cfg.get("max_items", 3))
            if kind == "evening":
                text = speech.evening_message(open_by, p.lang, mx)
            else:
                text = speech.open_chores_message(open_by, p.lang, mx)
            # now and then a little praise – at most once a day, on roughly every second day
            if (cfg["praise"] and done and self._praise_day != today.isoformat() and kind != "evening"
                    and today.toordinal() % 2 == 0):
                self._praise_day = today.isoformat()
                who = done[today.toordinal() % len(done)]
                text = (text + " " + speech.praise_message(who, p.lang, today.toordinal())).strip()
        if text:
            await self.async_say(text)
        return text

    @callback
    def _motion(self, event: Event[EventStateChangedData]) -> None:
        new, old = event.data.get("new_state"), event.data.get("old_state")
        if new is None or new.state != STATE_ON or (old is not None and old.state == STATE_ON):
            return
        self.hass.async_create_task(self.async_check(sensor=event.data.get("entity_id")), eager_start=False)

    def build(self) -> tuple[str, str]:
        """Return (kind, message): kind is 'open', 'done' or '' (nothing to say)."""
        cfg = self.cfg
        p = self.planner
        today = p.today()
        persons = [(pid, x) for pid, x in p.persons_sorted() if not cfg["persons"] or pid in cfg["persons"]]
        open_by, with_items = [], []
        for pid, person in persons:
            act = engine.active_items(p.data["items"], pid, today)
            if act:
                with_items.append(person["name"])
            titles = sorted(it["title"] for _, it in act if not it.get("done"))
            if titles:
                open_by.append((person["name"], titles))
        if open_by:
            return "open", speech.open_chores_message(open_by, p.lang, int(cfg.get("max_items", 3)))
        if with_items and cfg["all_done"]:
            return "done", speech.all_done_message(with_items, p.lang)
        return "", ""

    # ---------------------------------------------------------------- queue
    @property
    def queue(self) -> list[dict]:
        return self.planner.data.setdefault("queue", [])

    def enqueue(self, text: str, until: datetime, key: str | None = None, rooms: list[str] | None = None,
                item: str | None = None) -> dict | None:
        """Remember a one-off message for the next motion (only if the queue is switched on)."""
        cfg = self.cfg
        if not (cfg["enabled"] and cfg["queue"]) or not text:
            return None
        return msgqueue.add(self.queue, text, dt_util.now(), until, key, rooms, item)

    def _chores_due(self, force: bool, now: datetime) -> tuple[str, str]:
        cfg = self.cfg
        if not force:
            if not _in_window(now.time(), cfg["start"], cfg["end"]):
                return "", ""
            if self._last and now - self._last < timedelta(minutes=int(cfg["cooldown"])):
                return "", ""
        kind, message = self.build()
        if kind == "done" and not force:
            if self._all_done_day == self.planner.today().isoformat():
                return "", ""
        return kind, message

    async def async_check(self, force: bool = False, sensor: str | None = None) -> str:
        """Motion (or a manual trigger): say queued messages plus the chore reminder."""
        cfg = self.cfg
        now = dt_util.now()
        queued: list[str] = []
        if cfg["queue"] and (force or _in_window(now.time(), cfg["queue_start"], cfg["queue_end"])):
            before = len(self.queue)
            queued = msgqueue.take(self.queue, sensor, now, self.planner.data["items"])
            if len(self.queue) != before:
                self.planner.save_soon()
        kind, message = self._chores_due(force, now)
        if kind:
            self._last = now
            if kind == "done":
                self._all_done_day = self.planner.today().isoformat()
        text = " ".join([*queued, message]).strip()
        if text:
            await self.async_say(text)
        return text

    async def async_say(self, message: str) -> None:
        cfg = self.cfg
        for ent in cfg["notify"]:
            await self._call("notify", "send_message", {"entity_id": ent, "message": message})
        if cfg["tts"] and cfg["media_players"]:
            await self._call("tts", "speak", {"entity_id": cfg["tts"], "media_player_entity_id": cfg["media_players"],
                                              "message": message, "cache": False})

    async def _call(self, domain: str, service: str, data: dict) -> None:
        try:
            await self.hass.services.async_call(domain, service, data, blocking=True)
        except Exception as err:  # noqa: BLE001 - a missing speaker must not break the planner
            _LOGGER.warning("Announcement via %s.%s failed: %s", domain, service, err)
