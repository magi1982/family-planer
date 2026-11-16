"""Runtime object of one Family Planer config entry: storage, timers, mutations, snapshots."""
from __future__ import annotations

import asyncio
import base64
import copy
import json
import logging
import secrets
from collections.abc import Callable
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_point_in_time,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util
from homeassistant.util import slugify

from . import (
    awards,
    engine,
    levels,
    lists,
    msgqueue,
    persontodos,
    rewards,
    schedule,
    seasons,
    settings_spec,
    sonder,
    speech,
    vacation,
    validate,
)
from .announce import Announcer
from .const import (
    CONF_AI_TASK,
    CONF_MATCH_NAMES,
    CONF_MODULES,
    CONF_OPTIMIZE_TIME,
    CONF_PERSONS,
    CONF_ROLLOVER_TIME,
    CONF_SHOW_OWNER,
    DEFAULT_COLORS,
    DEFAULT_SETTINGS,
    DOMAIN,
    FILES_DIR,
    FILES_URL,
    LANGUAGES,
    MAX_IMAGE_BYTES,
    MODULE_LISTS,
    MODULE_WEEK,
    SIGNAL_UPDATE,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

PERSON_FIELDS = ("name", "color", "image", "aliases", "calendar", "school", "order", "role", "birthday", "bday_anim", "season_av")
BDAY_ANIMS = 5
TEMPLATES_ADULT = {t[0]: True for t in sonder.CATALOGUE if t[8].get("adult")}
ROLES = ("kid", "adult")


def clean_school(value) -> dict:
    """School timetable of a person: calendar, blocks per weekday (e.g. morning + afternoon), travel time (0 = off)."""
    value = value if isinstance(value, dict) else {}
    times = {}
    for day, spans in (value.get("times") or {}).items():
        if str(day) not in {"1", "2", "3", "4", "5", "6", "7"} or not isinstance(spans, (list, tuple)):
            continue
        if len(spans) == 2 and all(isinstance(x, str) for x in spans):
            spans = [spans]  # old format: one block per day
        clean = []
        for span in spans[:3]:
            if isinstance(span, (list, tuple)) and len(span) == 2:
                a, b = validate.hhmm(span[0], ""), validate.hhmm(span[1], "")
                if a and b and a < b and all(b <= s[0] or a >= s[1] for s in clean):
                    clean.append([a, b])
        if clean:
            times[str(day)] = sorted(clean)
    return {"calendar": validate.entity(value.get("calendar"), ("calendar",)), "times": times,
            "travel": validate.integer(value.get("travel"), 0, 240, 0)}
LIST_FIELDS = ("name", "entity", "icon", "max_categories", "auto", "person_todos")


def parse_hhmm(value: str | None, default: str = "00:00") -> tuple[int, int]:
    try:
        h, m = (value or default).split(":")[:2]
        return max(0, min(23, int(h))), max(0, min(59, int(m)))
    except (ValueError, AttributeError):
        h, m = default.split(":")
        return int(h), int(m)


# shopping list "optimise": never let a slow list or AI keep the button spinning
LIST_READ_TIMEOUT = 15
AI_TIMEOUT = 30
AI_MAX_ITEMS = 60
REFRESH_MIN_GAP = 20
AWAY_RETRY_AFTER_START = (60, 180, 600)  # seconds after the start: read the calendars again


class FamilyPlanner:
    """Holds and persists the data of one config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self.data: dict[str, Any] = {}
        self._listeners: set[Callable[[], None]] = set()
        self._unsubs: list[Callable[[], None]] = []
        self._list_unsub: Callable[[], None] | None = None
        self._list_timers: dict[str, Callable[[], None]] = {}
        self.list_maps: dict[str, dict[str, str]] = {}
        self.announcer = Announcer(hass, self)
        self.owns_panel = False
        self.away: dict[str, set[str]] = {}
        self.away_kind: dict[str, dict[str, str]] = {}
        self.away_spans: dict[str, list[dict]] = {}
        self._away_timer = None
        self.vacation_review: list[dict] = []  # holidays found in the calendars, waiting for "away / at home"
        self._away_known = False
        self._pin_fail: list[datetime] = []
        self._ai_last: dict[str, datetime] = {}
        self._refresh_last: datetime | None = None
        self.closing = False
        self.busy: dict[str, list[list]] = {}  # today's timed events per person (suggestions)
        self._wx: dict[str, Any] = {}  # weather condition and today's maximum (special chores)
        self._ferien_day: str | None = None

    # ------------------------------------------------------------------ lifecycle
    async def async_load(self) -> None:
        stored = await self._store.async_load()
        if stored:
            self.data = stored
        else:
            self.data = {"persons": {}, "chores": {}, "items": {}, "history": {}, "settings": {}, "lists": {},
                         "ledger": [], "rewards": {}, "requests": {}}
            for name in self.entry.data.get(CONF_PERSONS, []):
                self._add_person(name)
            self.data["settings"][CONF_MODULES] = dict(self.entry.data.get(CONF_MODULES) or {})
            for spec in self.entry.data.get("lists", []):
                self.data.setdefault("lists", {})[engine.new_id()] = lists.new_list(
                    spec["name"], spec["entity"], spec.get("max_categories", 10))
        for key in ("persons", "chores", "items", "history", "settings", "lists", "rewards", "requests", "todos"):
            self.data.setdefault(key, {})
        self.data.setdefault("ledger", [])
        self.data.setdefault("ferien", [])
        self.data.setdefault("sonder_inst", {})
        if "sonder" not in self.data:  # 0.11: catalogue of fun special chores (everyday ones switched off)
            self.data["sonder"] = sonder.seed()
            self.data["sonder_tpls"] = list(sonder.TEMPLATES)
        # templates added in later versions appear once; templates that need a grown-up get the flag
        seen = set(self.data.setdefault("sonder_tpls", [d.get("tpl") for d in self.data["sonder"].values() if d.get("tpl")]))
        for tid in sonder.TEMPLATES:
            if tid not in seen:
                self.data["sonder"].setdefault(f"t_{tid}", sonder.from_template(tid))
                self.data["sonder_tpls"].append(tid)
        for d in self.data["sonder"].values():
            d.setdefault("away", [])
            d.setdefault("adult", (TEMPLATES_ADULT.get(d.get("tpl")) or False))
        settings = self.data["settings"]
        for key, val in DEFAULT_SETTINGS.items():
            if key == CONF_MODULES:
                settings[key] = {**val, **(settings.get(key) or {})}
            else:
                settings.setdefault(key, copy.deepcopy(val))
        settings.pop("shopping_list", None)  # 0.1 setting, replaced by the lists module
        if not settings.get("pin_hash"):  # start PIN 123456 – must be changed on first use
            settings["pin_hash"] = await self.hass.async_add_executor_job(rewards.hash_pin, settings_spec.DEFAULT_PIN)
            settings["pin_default"] = True

        # the day change waits until calendars are loaded, so holidays are known before anything counts as missed
        await self._store.async_save(self.data)
        self._unsubs.append(async_at_started(self.hass, self._handle_started))

        if self.module_on(MODULE_WEEK):
            h, m = parse_hhmm(settings[CONF_ROLLOVER_TIME])
            self._unsubs.append(async_track_time_change(self.hass, self._handle_rollover, hour=h, minute=m, second=5))
            self.announcer.start()
            self._unsubs.append(async_track_time_interval(
                self.hass, self._handle_away_timer, timedelta(minutes=self.vacation_settings()["refresh_minutes"])))
        if self.module_on(MODULE_WEEK) and not self.module_on(MODULE_LISTS):
            self._track_lists()  # to-do lists with names (To-dos settings)
        if self.module_on(MODULE_LISTS):
            h, m = parse_hhmm(settings[CONF_OPTIMIZE_TIME], "03:00")
            self._unsubs.append(async_track_time_change(self.hass, self._handle_optimize, hour=h, minute=m, second=20))
            self._track_lists()

    @callback
    def async_shutdown(self) -> None:
        self.closing = True
        self._changed(save=False)
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._away_timer:
            self._away_timer()
            self._away_timer = None
        if self._list_unsub:
            self._list_unsub()
            self._list_unsub = None
        self.announcer.stop()
        for cancel in self._list_timers.values():
            cancel()
        self._list_timers.clear()
        self._listeners.clear()

    @callback
    def _handle_rollover(self, _now: datetime) -> None:
        self.hass.async_create_task(self.async_rollover())

    @callback
    def _handle_optimize(self, _now: datetime) -> None:
        self.hass.async_create_task(self.async_optimize_all(use_ai=True))

    async def _handle_started(self, _hass: HomeAssistant) -> None:
        if self.module_on(MODULE_WEEK):
            await self.async_refresh_away()
            # cloud calendars (Outlook, Google …) often deliver their events only a little after the start:
            # read the absences again after 1, 3 and 10 minutes, so nobody is shown as "here" by mistake
            for delay in AWAY_RETRY_AFTER_START:
                self._unsubs.append(async_call_later(self.hass, delay, self._handle_away_retry))
            await self.async_refresh_season(force=True)
            await self.async_sync_name_lists()
        await self.async_rollover()
        if self.module_on(MODULE_LISTS):
            await self.async_optimize_all(use_ai=False)

    @callback
    def _handle_away_retry(self, _now: datetime) -> None:
        if not self.closing:
            self.hass.async_create_task(self.async_refresh_away(apply=True))

    @callback
    def _handle_away_timer(self, _now: datetime) -> None:
        self.hass.async_create_task(self.async_refresh_away(apply=True))
        self.hass.async_create_task(self.async_refresh_season())
        self.hass.async_create_task(self.async_sync_name_lists())

    # ------------------------------------------------------------------ seasons, weather, special chores
    def season_settings(self) -> dict[str, Any]:
        cur = self.settings.get("seasons") or {}
        return {**settings_spec.SUG_DEFAULTS, **seasons.clean_settings(cur),
                **{k: cur[k] for k in settings_spec.SUG_DEFAULTS if k in cur}}

    def sonder_settings(self) -> dict[str, Any]:
        return sonder.clean_settings(self.settings.get("sonder_settings"))

    def season(self) -> dict[str, Any]:
        today = self.today()
        res = seasons.resolve(self.season_settings(), today, self.data.get("ferien"), self.data["persons"])
        # birthday animation: own choice, else rotating yearly and different for everybody
        order = [pid for pid, _ in self.persons_sorted()]
        res["bday_anim"] = {}
        for pid in res["birthdays"]:
            choice = self.data["persons"][pid].get("bday_anim")
            res["bday_anim"][pid] = (choice if isinstance(choice, int) and 0 <= choice < BDAY_ANIMS
                                     else (order.index(pid) + today.year) % BDAY_ANIMS)
        return res

    async def _weather(self) -> None:
        ent = self.season_settings().get("weather")
        st = self.hass.states.get(ent) if ent else None
        if st is None:
            self._wx = {}
            return
        wx: dict[str, Any] = {"cond": st.state, "temp": st.attributes.get("temperature")}
        try:
            res = await self.hass.services.async_call("weather", "get_forecasts", {"entity_id": ent, "type": "daily"},
                                                      blocking=True, return_response=True)
            fc = ((res or {}).get(ent) or {}).get("forecast") or []
            if fc:
                wx["tmax"] = fc[0].get("temperature")
                wx["day_cond"] = fc[0].get("condition")
        except Exception as err:  # noqa: BLE001 - a weather integration without forecasts is fine
            _LOGGER.debug("No forecast from %s: %s", ent, err)
        self._wx = wx

    @staticmethod
    def _wx_kind(cond: str | None) -> str | None:
        return {"rainy": "rainy", "pouring": "rainy", "lightning-rainy": "rainy", "snowy": "snowy",
                "snowy-rainy": "snowy", "sunny": "sunny", "clear-night": "sunny", "windy": "windy",
                "windy-variant": "windy", "cloudy": "cloudy", "partlycloudy": "cloudy", "fog": "cloudy"}.get(cond or "")

    def _sonder_ctx(self, today: date, vis: str) -> dict[str, Any]:
        st = self.season_settings()
        return {"events": seasons.event_dates(today, self.data.get("ferien"), st),
                "birthdays": {pid: p["birthday"] for pid, p in self.data["persons"].items() if p.get("birthday")},
                "wedding": st.get("wedding") or None, "vis": vis,
                "weather": self._wx_kind(self._wx.get("day_cond") or self._wx.get("cond")),
                "tmax": self._wx.get("tmax") if isinstance(self._wx.get("tmax"), (int, float)) else None,
                "away": {pid for pid, days in self.away.items() if today.isoformat() in days} | self.away_now()}

    def refresh_sonder(self) -> bool:
        today = self.today()
        return sonder.refresh(self.data["sonder_inst"], self.data["sonder"], self.data["persons"], today,
                              self._sonder_ctx(today, self.season()["vis"]), self.sonder_settings())

    async def async_refresh_season(self, force: bool = False) -> None:
        """School holidays from the calendars (once a day), today's events (suggestions), weather, special chores."""
        today = self.today()
        cals = {p["calendar"]: pid for pid, p in self.data["persons"].items() if p.get("calendar")}
        start = dt_util.start_of_local_day()
        if force or self._ferien_day != today.isoformat():
            self._ferien_day = today.isoformat()
            found: list[dict] = []
            for cal in cals:
                found += await self._events(cal, start - timedelta(days=60), start + timedelta(days=300))
            fer = seasons.ferien_ranges(found)
            if fer != self.data.get("ferien"):
                self.data["ferien"] = fer[:40]
        busy: dict[str, list[list]] = {}
        for cal, pid in cals.items():
            for ev in await self._events(cal, start, start + timedelta(days=1)):
                s_, e_ = str(ev.get("start")), str(ev.get("end"))
                if len(s_) > 10:  # timed events only
                    busy.setdefault(pid, []).append([s_, e_])
        self.busy = {k: v[:20] for k, v in busy.items()}
        await self._weather()
        self.refresh_sonder()
        self._changed()

    def _birthday_bonus(self) -> None:
        """Birthday: every point the birthday child earns today counts double (one extra ledger entry)."""
        today = self.today()
        try:
            bdays = set(self.season()["birthdays"])
        except Exception:  # noqa: BLE001 - never block saving
            return
        ledger = self.data["ledger"]
        off = self.day_offset()
        for pid in bdays:
            ref = f"bday:{pid}:{today.isoformat()}"
            earned = 0
            for e in ledger:
                if e.get("pid") != pid or e.get("kind") in ("bday", "level", "redeem") or e.get("pts", 0) <= 0:
                    continue
                try:
                    day = (datetime.fromisoformat(e["ts"]) - off).date()
                except (ValueError, TypeError, KeyError):
                    continue
                if day == today:
                    earned += e["pts"]
            cur = next((e for e in ledger if e.get("ref") == ref), None)
            if cur is None and earned:
                rewards._add(ledger, pid, earned, "bday", ref, "🎂 x2", dt_util.now().isoformat())
            elif cur is not None and cur["pts"] != earned:
                if earned:
                    cur["pts"] = earned
                else:
                    ledger.remove(cur)

    def away_now(self) -> set[str]:
        """Persons away right now by the exact times (a trip from 15:00 counts from 15:00)."""
        now = dt_util.now()
        return {pid for pid, spans in self.away_spans.items() if (b := vacation.badge_at(spans, now)) and b["state"] == "now"}

    def _schedule_away_change(self) -> None:
        """Refresh badges and special chores exactly when an absence starts or ends."""
        if self._away_timer:
            self._away_timer()
            self._away_timer = None
        nxt = vacation.next_change(self.away_spans, dt_util.now())
        if nxt is None or nxt - dt_util.now() > timedelta(days=3):
            return

        @callback
        def fire(_now: datetime) -> None:
            self._away_timer = None
            if self.module_on(MODULE_WEEK):
                self.refresh_sonder()
            self._changed()
            self._schedule_away_change()

        self._away_timer = async_track_point_in_time(self.hass, fire, nxt + timedelta(seconds=5))

    def sonder_points(self, inst: dict) -> int:
        df = self.data["sonder"].get(inst.get("sid")) or {}
        return sonder.points(df, rewards.size_points(self.gamification()["day_points"]))

    async def async_sonder_claim(self, iid: str, pid: str) -> None:
        sonder.claim(self.data["sonder_inst"], self.data["sonder"], self.data["persons"], iid, pid,
                     dt_util.now().isoformat())
        self._changed()

    async def async_sonder_set(self, iid: str, done: bool) -> None:
        inst = self.data["sonder_inst"][iid]
        if inst.get("pid") is None:
            raise ValueError("not_claimed")
        inst["done"] = bool(done)
        inst["done_at"] = dt_util.now().isoformat() if done else None
        ref = f"sonder:{iid}"
        self.data["ledger"][:] = [e for e in self.data["ledger"] if e.get("ref") != ref]
        pts = self.sonder_points(inst)
        if done and pts > 0:
            df = self.data["sonder"].get(inst["sid"]) or {}
            rewards._add(self.data["ledger"], inst["pid"], pts, "sonder", ref, "⭐ " + (df.get("title") or ""),
                         dt_util.now().isoformat())
        self._changed()

    async def async_sonder_release(self, iid: str) -> None:
        """Parents: give a claimed special chore back to the volunteer tile."""
        inst = self.data["sonder_inst"][iid]
        if inst.get("done") or inst.get("mode") not in ("free", None):
            raise ValueError("not_free")
        inst["pid"] = None
        inst["claimed_at"] = None
        self._changed()

    async def async_sonder_save(self, sid: str | None, spec: dict[str, Any]) -> str:
        clean = sonder.clean_def(spec, self.data["persons"])
        if sid in self.data["sonder"]:
            clean["tpl"] = self.data["sonder"][sid].get("tpl")
            if spec.get("title") and spec.get("title") != self.data["sonder"][sid].get("title"):
                clean["title_en"] = ""
        else:
            sid = sonder.new_id()
        self.data["sonder"][sid] = clean
        # an edited definition starts fresh: open, unclaimed instances are rebuilt
        self.data["sonder_inst"] = {k: v for k, v in self.data["sonder_inst"].items()
                                    if v["sid"] != sid or v.get("done") or v.get("pid")}
        self.refresh_sonder()
        self._changed()
        await self._store.async_save(self.data)
        return sid

    async def async_sonder_delete(self, sid: str) -> None:
        self.data["sonder"].pop(sid, None)
        self.data["sonder_inst"] = {k: v for k, v in self.data["sonder_inst"].items() if v["sid"] != sid or v.get("done")}
        self._changed()
        await self._store.async_save(self.data)

    async def async_sonder_template(self, tid: str) -> str:
        """Add a catalogue template again (e.g. after deleting it)."""
        if tid not in sonder.TEMPLATES:
            raise KeyError(tid)
        sid = f"t_{tid}" if f"t_{tid}" not in self.data["sonder"] else sonder.new_id()
        self.data["sonder"][sid] = {**sonder.from_template(tid), "on": True}
        self.refresh_sonder()
        self._changed()
        await self._store.async_save(self.data)
        return sid

    # ------------------------------------------------------------------ holidays
    def vacation_settings(self) -> dict[str, Any]:
        v = self.settings.get("vacation") or {}
        return {"enabled": v.get("enabled", True), "words": list(v.get("words") or []),
                "scope": v.get("scope") if v.get("scope") in ("owner", "family") else "owner",
                "scanned": list(v.get("scanned") or []),
                "min_hours": validate.integer(v.get("min_hours"), 12, 24, 20),
                "refresh_minutes": validate.integer(v.get("refresh_minutes"), 15, 240, 30)}

    async def _events(self, entity: str, start: datetime, end: datetime) -> list[dict]:
        if self.hass.states.get(entity) is None:
            return []
        try:
            res = await self.hass.services.async_call(
                "calendar", "get_events", {"entity_id": entity, "start_date_time": start.isoformat(),
                                           "end_date_time": end.isoformat()},
                blocking=True, return_response=True)
        except Exception as err:
            _LOGGER.debug("Cannot read %s: %s", entity, err)
            self.set_status(f"calendar:{entity}", False, str(err))
            return []
        events = [e for e in (res or {}).get(entity, {}).get("events", []) if e.get("start") and e.get("end")][:2000]
        self.set_status(f"calendar:{entity}", True, str(len(events)))
        return events

    async def async_refresh_away(self, apply: bool = False, rescan: bool = False) -> None:
        """Read the person calendars: learn holiday words on the first sync, then find absences."""
        v = self.vacation_settings()
        now = dt_util.start_of_local_day()
        calendars: dict[str, list[str]] = {}
        for pid, p in self.data["persons"].items():
            if p.get("calendar"):
                calendars.setdefault(p["calendar"], []).append(pid)
        # first sync of a calendar: how does this family name holidays?
        new = [c for c in calendars if rescan or c not in v["scanned"]]
        if new:
            learned: list[str] = []
            for cal in new:
                if self.hass.states.get(cal) is None:
                    continue
                events = await self._events(cal, now - timedelta(days=365), now + timedelta(days=365))
                learned += vacation.discover(events)
                v["scanned"].append(cal)
            words = list(dict.fromkeys(v["words"] + learned)) or list(vacation.DEFAULT_WORDS)
            if words != v["words"] or new:
                added = [w for w in words if w not in v["words"]]
                v["words"] = [validate.text(w, 40) for w in words if validate.text(w, 40)][:30]
                v["scanned"] = list(dict.fromkeys(v["scanned"]))
                self.settings["vacation"] = v
                await self._store.async_save(self.data)
                if added:
                    from homeassistant.components import persistent_notification
                    msg = ((f"Ferien-Erkennung: In deinem Kalender heissen Ferien „{', '.join(added)}“. "
                            "Anpassen unter Family Planer → Konfigurieren → Wochenplan → Ferien.")
                           if self.lang == "de" else
                           (f"Holiday detection: your calendar calls time off \"{', '.join(added)}\". "
                            "Change it under Family Planer → Configure → Week plan → Holidays."))
                    persistent_notification.async_create(self.hass, msg, title=self.entry.title,
                                                         notification_id=f"{DOMAIN}_vacation_{self.entry.entry_id}")
        away: dict[str, set[str]] = {}
        if v["enabled"] and calendars:
            by_owner: dict[str | None, list[dict]] = {}
            for cal, pids in calendars.items():
                events = await self._events(cal, now - timedelta(days=7), now + timedelta(days=60))
                for pid in pids:
                    by_owner.setdefault(pid, []).extend(events)
            words = v["words"] or vacation.DEFAULT_WORDS
            decisions = self.settings.get("vacation_decisions") or {}
            self.away_kind = vacation.absence_kinds(by_owner, self.data["persons"], words, v["scope"], v["min_hours"], decisions)
            self.away_spans = vacation.absence_spans(by_owner, self.data["persons"], words, v["scope"], v["min_hours"], decisions)
            away = {pid: set(days) for pid, days in self.away_kind.items()}
            every = vacation.found(by_owner, self.data["persons"], words, v["scope"], v["min_hours"], long_events=True)
            self._vac_keys = {e["key"] for e in every}
            self.vacation_review = vacation.review(every, decisions, now.date())
        else:
            self.vacation_review = []
            self.away_kind = {}
            self.away_spans = {}
        self._schedule_away_change()
        old_spans = getattr(self, "_spans_seen", None)
        changed = away != self.away
        self.away = away
        if old_spans != self.away_spans:
            self._spans_seen = {k: list(v) for k, v in self.away_spans.items()}
            if not changed:
                if self.module_on(MODULE_WEEK):
                    self.refresh_sonder()
                self._changed(save=False)
        if changed and self.module_on(MODULE_WEEK):
            self.refresh_sonder()
        self._away_known = True
        if changed and apply:
            engine.rollover(self.data, self.today(), self.away)
            self._changed()
        elif changed:
            self._changed(save=False)

    async def async_vacation_decide(self, key: str, decision: str | None, family: bool = False,
                                    persons: list[str] | None = None, label: str | None = None) -> None:
        """Holiday found in a calendar: "away" pauses chores, "home" keeps them going, None = ask again.

        family / persons: for whom it applies (default: the persons found in the calendar).
        """
        dec = dict(self.settings.get("vacation_decisions") or {})
        if decision in ("away", "home"):
            dec[key] = {"d": decision, "family": bool(family),
                        "persons": [p for p in (persons or []) if p in self.data["persons"]][:30],
                        "at": self.today().isoformat(), "label": label if label in vacation.LABELS else ""}
        else:
            dec.pop(key, None)
        known = getattr(self, "_vac_keys", set()) | {e["key"] for e in self.vacation_review}
        dec = {k: v for k, v in dec.items() if k in known or k == key}  # forget events that are gone
        await self.async_update_settings({"vacation_decisions": dict(list(dec.items())[-60:])})
        await self.async_refresh_away(apply=True)

    async def async_person_order(self, order: list[str]) -> None:
        for n, pid in enumerate([p for p in order if p in self.data["persons"]]):
            self.data["persons"][pid]["order"] = n
        self._changed()
        await self._store.async_save(self.data)

    # ------------------------------------------------------------------ helpers
    def module_on(self, module: str) -> bool:
        return bool(self.data.get("settings", {}).get(CONF_MODULES, {}).get(module, True))

    @property
    def settings(self) -> dict[str, Any]:
        return self.data["settings"]

    @property
    def lang(self) -> str:
        return validate.language(self.data.get("settings", {}).get("language"), self.hass.config.language)

    def day_offset(self) -> timedelta:
        h, m = parse_hhmm(self.data.get("settings", {}).get(CONF_ROLLOVER_TIME))
        return timedelta(hours=h, minutes=m)

    def today(self) -> date:
        """Planner day: changes at the configured rollover time instead of midnight."""
        return (dt_util.now() - self.day_offset()).date()

    @callback
    def add_listener(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.add(cb)

        @callback
        def remove() -> None:
            self._listeners.discard(cb)

        return remove

    @callback
    def _changed(self, save: bool = True) -> None:
        if save:
            self._eval_levels()
            self._birthday_bonus()
            self._store.async_delay_save(lambda: self.data, 1)
        async_dispatcher_send(self.hass, SIGNAL_UPDATE.format(self.entry.entry_id))
        for cb in list(self._listeners):
            cb()

    def _eval_levels(self) -> None:
        """Level ups (bonus points, unlocks, celebration). Cheap; runs whenever data changed."""
        if not self.data.get("persons") or not self.module_on(MODULE_WEEK):
            return
        cfg = self.level_settings()
        ts = dt_util.now().isoformat()
        ups = levels.evaluate(self.data, self.today(), self.gamification(), cfg["season_start"], ts, rewards._add, cfg["bonus"])
        if ups:
            st = awards._state(self.data)
            for up in ups:
                c = awards._celebrate(st, up["pid"], "level", "m" if up["level"] in (6, 11, 16, 21) else "s", up["color"],
                                      ts, self.today(), value=up["level"])
                if c is not None:
                    c.update(tier=up["tier"], bonus=up["bonus"], unlocks=up["unlocks"])

    def image_allowed(self, pid: str, image: str) -> bool:
        """Level extras in a picture only for the person who unlocked them."""
        if not str(image).startswith("av2:"):
            return True
        mine = set(((self.data.get("levels") or {}).get(pid) or {}).get("unlocked") or [])
        return not ((set(str(image)[4:].split(".")) & levels.UNLOCK_IDS) - mine)

    @callback
    def save_soon(self) -> None:
        self._store.async_delay_save(lambda: self.data, 1)

    def persons_sorted(self) -> list[tuple[str, dict]]:
        return sorted(self.data["persons"].items(), key=lambda x: (x[1].get("order", 0), x[1].get("name", "")))

    def person_by_name(self, name: str) -> str | None:
        low = (name or "").strip().lower()
        for pid, p in self.data["persons"].items():
            if p.get("name", "").lower() == low:
                return pid
        return None

    def _add_person(self, name: str, **extra: Any) -> str:
        persons = self.data["persons"]
        base = slugify(name) or "person"
        pid, n = base, 2
        while pid in persons:
            pid, n = f"{base}_{n}", n + 1
        persons[pid] = {
            "name": validate.text(name, 40) or pid,
            "color": validate.color(extra.get("color"), DEFAULT_COLORS[len(persons) % len(DEFAULT_COLORS)]),
            "image": validate.image(extra.get("image")),
            "aliases": validate.aliases(extra.get("aliases")),
            "calendar": validate.entity(extra.get("calendar"), ("calendar",)),
            "school": clean_school(None),
            "order": len(persons),
        }
        return pid

    # ------------------------------------------------------------------ settings
    async def async_update_settings(self, patch: dict[str, Any]) -> None:
        for key, val in patch.items():
            if key == CONF_MODULES:
                self.settings[key] = {**self.settings.get(key, {}), **val}
            else:
                self.settings[key] = val
        self._changed()
        await self._store.async_save(self.data)

    # ------------------------------------------------------------------ week plan mutations
    def chore_points(self, chore_id: str | None) -> int:
        chore = self.data["chores"].get(chore_id or "") or {}
        default = self.gamification()["default_points"]
        return validate.integer(chore.get("points", default), 0, 1000, default)

    def reliability_days(self) -> int:
        return validate.integer(self.settings.get("reliability_days"), 7, 90, 30)

    def gamification(self) -> dict[str, int]:
        g = self.settings.get("gamification") or {}
        return {k: validate.integer(g.get(k, v), 0, 1000, v) for k, v in rewards.DEFAULTS.items()}

    def level_settings(self) -> dict[str, Any]:
        return settings_spec.clean_levels(self.settings.get("levels"))

    def award_settings(self) -> dict[str, Any]:
        return awards.clean_settings(self.settings.get("awards"))

    def theme(self) -> tuple[str, str]:
        """Design and style; designs of 0.8 and older are mapped onto the new set."""
        name = self.settings.get("theme") or "ha"
        name = settings_spec.THEME_MIGRATE.get(name, name)
        style = self.settings.get("style")
        return (name if name in settings_spec.THEMES else "ha",
                style if style in settings_spec.STYLES else "standard")

    def nav(self) -> dict[str, list[str]]:
        return settings_spec.clean_nav(self.settings.get("nav"))

    def set_status(self, source: str, ok: bool, detail: str | None = None) -> None:
        """Remember when a sync last worked (shown under Settings → Status)."""
        stt = self.data.setdefault("status", {}).setdefault(source, {})
        now = dt_util.now().isoformat(timespec="seconds")
        if ok:
            stt["ok"] = now
            stt["error"] = None
        else:
            stt["fail"] = now
            stt["error"] = (detail or "error")[:200]
        if detail and ok:
            stt["detail"] = detail[:120]
        # sources that have not reported for 30 days (e.g. a removed calendar) disappear from the status page
        old = (dt_util.now() - timedelta(days=30)).isoformat(timespec="seconds")
        allst = self.data["status"]
        for key in [k for k, v in allst.items() if max(v.get("ok") or "", v.get("fail") or "") < old]:
            allst.pop(key, None)

    def pace(self) -> dict[str, Any]:
        return rewards.pace(self.data["ledger"], list(self.data["persons"]), self.today())

    def points_mode(self) -> str:
        mode = (self.settings.get("gamification") or {}).get("mode")
        return mode if mode in rewards.MODES else "fair"

    def item_points(self) -> dict[str, int]:
        """Points each of today's chores is worth (shown on the chore button)."""
        today, fair, out = self.today(), self.points_mode() == "fair", {}
        day = self.gamification()["day_points"]
        for pid in self.data["persons"]:
            items = [(iid, self.chore_points(it.get("chore_id"))) for iid, it in engine.active_items(self.data["items"], pid, today)]
            out.update(rewards.item_points(items, fair, day))
        return out

    @callback
    def book_points(self, person_ids=None) -> None:
        """Fair mode: everybody can earn the same per day – a complete day counts, not the number of chores."""
        if self.points_mode() != "fair":
            return
        today = self.today()
        g = self.gamification()
        for pid in person_ids or list(self.data["persons"]):
            items = [(iid, it, self.chore_points(it.get("chore_id")))
                     for iid, it in engine.active_items(self.data["items"], pid, today)]
            rewards.rebook_fair(self.data, pid, items, g["day_points"], dt_util.now().isoformat())

    async def async_rollover(self) -> None:
        today = self.today()
        if self.module_on(MODULE_WEEK) and not self._away_known:
            await self.async_refresh_away()
        before = set(self.data["items"])
        engine.rollover(self.data, today, self.away)
        self._queue_special(set(self.data["items"]) - before)
        msgqueue.prune(self.data.setdefault("queue", []), dt_util.now(), self.data["items"])
        # bonuses for the day that just ended (idempotent), then keep the ledger small
        yesterday = today - timedelta(days=1)
        streaks = {pid: engine.person_stats(self.data["history"], {}, pid, today)["streak"] for pid in self.data["persons"]}
        rewards.day_bonuses(self.data, yesterday, streaks, self.gamification(), dt_util.now().isoformat())
        if self.module_on(MODULE_WEEK):
            awards.evaluate(self.data, today, streaks, self.award_settings(), self.points_mode() == "fair",
                            self.gamification()["day_points"], dt_util.now().isoformat(), rewards._add)
        rewards.trim(self.data, 400, today)
        self.set_status("rollover", True)
        self._prune_todos(today)
        self.book_points()
        if self.module_on(MODULE_WEEK):
            self.refresh_sonder()
        self._changed()

    async def async_set_item(self, item_id: str, done: bool) -> None:
        item = self.data["items"].get(item_id)
        if item is None:
            raise KeyError(item_id)
        item["done"] = bool(done)
        item["done_at"] = dt_util.now().isoformat() if done else None
        if self.points_mode() == "fair":
            self.book_points([item["person_id"]])
        else:
            rewards.chore_done(self.data, item_id, item, self.chore_points(item.get("chore_id")),
                               dt_util.now().isoformat())
        pid = item.get("person_id")
        today = self.today()
        mine = engine.active_items(self.data["items"], pid, today)
        if done and mine and all(it.get("done") for _, it in mine) and pid in self.data["persons"]:
            awards.day_done(self.data, pid, today, self.data["persons"][pid].get("color") or "#69C350",
                            dt_util.now().isoformat(), self.award_settings())
        self._changed()

    async def async_save_chore(self, chore_id: str | None, chore: dict) -> str:
        clean = engine.validate_chore(chore, self.data["persons"])
        if chore.get("points") is not None:
            clean["points"] = validate.integer(chore["points"], 0, 1000, self.gamification()["default_points"])
        elif chore_id in self.data["chores"] and "points" in self.data["chores"][chore_id]:
            clean["points"] = self.data["chores"][chore_id]["points"]
        cid = chore_id if chore_id in self.data["chores"] else engine.new_id()
        self.data["chores"][cid] = clean
        engine.rollover(self.data, self.today(), self.away)
        self._changed()
        return cid

    async def async_delete_chore(self, chore_id: str) -> None:
        self.data["chores"].pop(chore_id, None)
        engine.rollover(self.data, self.today(), self.away)
        self._changed()

    async def async_add_person(self, name: str, **extra: Any) -> str:
        pid = self._add_person(name, **extra)
        self._changed()
        await self._store.async_save(self.data)
        return pid

    async def async_update_person(self, person_id: str, patch: dict) -> None:
        person = self.data["persons"].get(person_id)
        if person is None:
            raise KeyError(person_id)
        old_image = person.get("image", "")
        clean = {"name": lambda v: validate.text(v, 40) or person["name"],
                 "color": lambda v: validate.color(v, person.get("color") or DEFAULT_COLORS[0]),
                 "image": validate.image,
                 "aliases": validate.aliases,
                 "calendar": lambda v: validate.entity(v, ("calendar",)),
                 "school": clean_school,
                 "order": lambda v: validate.integer(v, 0, 99, person.get("order", 0)),
                 "role": lambda v: v if v in ROLES else person.get("role", "kid"),
                 "birthday": seasons.clean_date,
                 "bday_anim": lambda v: v if isinstance(v, int) and 0 <= v < BDAY_ANIMS else None,
                 "season_av": validate.season_av}
        for key in PERSON_FIELDS:
            if key in patch:
                person[key] = clean[key](patch[key])
        if person.get("image") != old_image:
            await self._delete_image(old_image)
        self._changed()
        await self._store.async_save(self.data)

    async def async_remove_person(self, person_id: str) -> None:
        person = self.data["persons"].pop(person_id, None)
        if person:
            await self._delete_image(person.get("image", ""))
        for chore in self.data["chores"].values():
            chore.get("assign", {}).pop(person_id, None)
        self.data["items"] = {k: v for k, v in self.data["items"].items() if v.get("person_id") != person_id}
        self.data["todos"] = {k: v for k, v in self.data["todos"].items() if v.get("person_id") != person_id}
        for day in self.data["history"].values():
            day.pop(person_id, None)
        self.data["ledger"] = [e for e in self.data["ledger"] if e["pid"] != person_id]
        self.data["requests"] = {k: v for k, v in self.data["requests"].items() if v["pid"] != person_id}
        from homeassistant.helpers import device_registry as dr
        reg = dr.async_get(self.hass)
        if dev := reg.async_get_device(identifiers={(DOMAIN, f"{self.entry.entry_id}_{person_id}")}):
            reg.async_remove_device(dev.id)
        self._changed()
        await self._store.async_save(self.data)

    # ------------------------------------------------------------------ own photos
    def files_dir(self) -> Path:
        return Path(self.hass.config.path(FILES_DIR))

    async def async_upload_image(self, person_id: str, data_url: str) -> str:
        """Store a photo (data URL, JPEG/PNG/WebP) and use it as the person's picture."""
        if person_id not in self.data["persons"]:
            raise KeyError(person_id)
        head, _, b64 = (data_url or "").partition(",")
        ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(
            head.removeprefix("data:").split(";")[0])
        if not ext or ";base64" not in head:
            raise ValueError("unsupported image")
        raw = base64.b64decode(b64, validate=True)
        if len(raw) > MAX_IMAGE_BYTES:
            raise ValueError("image too large")
        if not (raw[:3] == b"\xff\xd8\xff" or raw[:8] == b"\x89PNG\r\n\x1a\n" or raw[8:12] == b"WEBP"):
            raise ValueError("unsupported image")
        # unguessable name: the files are served without login like everything under /local
        name = f"{slugify(person_id)}_{secrets.token_hex(12)}.{ext}"
        target = self.files_dir() / "avatars" / name

        def write() -> None:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)

        await self.hass.async_add_executor_job(write)
        image = f"img:{FILES_URL}/avatars/{name}"
        await self.async_update_person(person_id, {"image": image})
        return image

    async def _delete_image(self, image: str) -> None:
        prefix = f"img:{FILES_URL}/avatars/"
        if not image or not image.startswith(prefix):
            return
        path = self.files_dir() / "avatars" / Path(image[len(prefix):]).name
        await self.hass.async_add_executor_job(lambda: path.unlink(missing_ok=True))

    # ------------------------------------------------------------------ smart lists
    @callback
    def _track_lists(self) -> None:
        if self._list_unsub:
            self._list_unsub()
            self._list_unsub = None
        entities = sorted({lst["entity"] for lst in self.data["lists"].values() if lst.get("entity")}
                          | set(self.todo_settings()["name_lists"]))
        if entities:
            self._list_unsub = async_track_state_change_event(self.hass, entities, self._handle_list_change)

    @callback
    def _handle_list_change(self, event: Event) -> None:
        entity = event.data.get("entity_id")
        if entity in self.todo_settings()["name_lists"]:
            key = f"names:{entity}"
            if cancel := self._list_timers.pop(key, None):
                cancel()

            @callback
            def run_names(_now: datetime, entity: str = entity, key: str = key) -> None:
                self._list_timers.pop(key, None)
                self.hass.async_create_task(self.async_sync_name_list(entity))

            self._list_timers[key] = async_call_later(self.hass, 2, run_names)
        for lid, lst in self.data["lists"].items():
            if lst.get("entity") != entity:
                continue
            if cancel := self._list_timers.pop(lid, None):
                cancel()

            @callback
            def run(_now: datetime, lid: str = lid) -> None:
                self._list_timers.pop(lid, None)
                self.hass.async_create_task(self.async_refresh_list(lid, use_ai=False))

            self._list_timers[lid] = async_call_later(self.hass, 2, run)

    async def _list_items(self, entity: str) -> list[dict]:
        if self.hass.states.get(entity) is None:
            return []
        try:
            async with asyncio.timeout(LIST_READ_TIMEOUT):
                res = await self.hass.services.async_call(
                    "todo", "get_items", {"entity_id": entity, "status": ["needs_action", "completed"]},
                    blocking=True, return_response=True)
        except Exception as err:  # includes TimeoutError: a slow cloud list must never block the planner
            _LOGGER.debug("Cannot read %s: %s", entity, err)
            return []
        return (res or {}).get(entity, {}).get("items", [])

    async def _ai_suggestions(self, lst: dict, names: list[str]) -> dict[str, str]:
        ai_entity = self.settings.get(CONF_AI_TASK)
        if not ai_entity or not names or self.hass.states.get(ai_entity) is None:
            return {}
        try:
            async with asyncio.timeout(AI_TIMEOUT):
                res = await self.hass.services.async_call(
                    "ai_task", "generate_data",
                    {"task_name": "Family Planer categories", "entity_id": ai_entity,
                     "instructions": lists.ai_prompt(lst, names[:AI_MAX_ITEMS], self.lang)},
                    blocking=True, return_response=True)
        except TimeoutError:
            _LOGGER.warning("AI categorisation took longer than %s s – skipped, keywords only", AI_TIMEOUT)
            return {}
        except Exception as err:
            _LOGGER.warning("AI categorisation failed: %s", err)
            return {}
        return lists.parse_ai((res or {}).get("data"))

    async def async_refresh_list(self, list_id: str, use_ai: bool = False) -> dict[str, Any]:
        """Categorise the open items of a list; with use_ai also ask the AI about the leftovers."""
        lst = self.data["lists"].get(list_id)
        if lst is None:
            raise KeyError(list_id)
        items = await self._list_items(lst["entity"])
        ent = self.hass.states.get(lst["entity"])
        if ent is None or ent.state in ("unavailable", "unknown"):
            self.set_status(f"list:{list_id}", False, f"{lst['entity']} unavailable")
        else:
            self.set_status(f"list:{list_id}", True, str(len(items)))
        if lst.get("person_todos") and ent is not None and ent.state not in ("unavailable", "unknown"):
            self._sync_list_todos(lst["entity"], items)
        names = [it.get("summary", "") for it in items if it.get("summary")]
        open_names = [it["summary"] for it in items if it.get("summary") and it.get("status") == "needs_action"]
        before = json.dumps([lst["categories"], lst["assignments"]], sort_keys=True)
        result = None
        if lst.get("auto", True):
            ai = {}
            if use_ai and (self._ai_last.get(list_id) is None
                           or dt_util.now() - self._ai_last[list_id] > timedelta(seconds=60)):
                self._ai_last[list_id] = dt_util.now()
                leftovers = [n for n in open_names if lists.categorize(lst, n) in (None, lists.OTHER)]
                ai = await self._ai_suggestions(lst, leftovers)
            result = lists.optimize(lst, open_names, self.lang, dt_util.now().date().isoformat(), ai,
                                    validate.integer(self.settings.get("prune_days"), 7, 365, lists.PRUNE_AFTER_DAYS))
        else:
            lists.ensure_other(lst, self.lang)
        new_map = lists.item_map(lst, names)
        changed = json.dumps([lst["categories"], lst["assignments"]], sort_keys=True) != before
        if changed or new_map != self.list_maps.get(list_id):
            self.list_maps[list_id] = new_map
            self._changed(save=changed)
        return {"created": result.created if result else [], "removed": result.removed if result else [],
                "assigned": result.assigned if result else 0}

    async def async_sync_name_list(self, entity: str) -> None:
        """A to-do list chosen under To-dos: items with a name or nickname become that person's to-dos."""
        st = self.hass.states.get(entity)
        if st is None or st.state in ("unavailable", "unknown"):
            return
        self._sync_list_todos(entity, await self._list_items(entity))

    async def async_sync_name_lists(self) -> None:
        for entity in self.todo_settings()["name_lists"]:
            await self.async_sync_name_list(entity)

    def _sync_list_todos(self, entity: str, items: list[dict]) -> None:
        """Items with a name or nickname become to-dos of that person; ticking off works both ways."""
        todos = self.data["todos"]
        mine = {t.get("src"): (tid, t) for tid, t in todos.items() if str(t.get("src") or "").startswith(entity + "|")}
        seen: set[str] = set()
        changed = False
        for it in items[:300]:
            uid, summary = it.get("uid"), it.get("summary")
            if not uid or not summary:
                continue
            pids, title, size = persontodos.match(summary, self.data["persons"])
            for pid in pids[:10]:
                key = f"{entity}|{uid}|{pid}"
                seen.add(key)
                found = mine.get(key)
                if found is None:
                    if it.get("status") != "needs_action":
                        continue
                    tid = engine.new_id()
                    todos[tid] = {"created": dt_util.now().isoformat(), "done": False, "done_at": None,
                                  "title": validate.text(title, 80) or "?", "person_id": pid, "src": key,
                                  "size": size or self.todo_settings()["size"]}
                    changed = True
                else:
                    tid, todo = found
                    if it.get("status") == "completed" and not todo.get("done"):
                        self._book_todo(tid, todo, True)
                        changed = True
        for key, (tid, todo) in mine.items():
            if key not in seen and not todo.get("done"):  # deleted in the app / on Alexa
                todos.pop(tid, None)
                changed = True
        if changed:
            self._changed()

    def _book_todo(self, todo_id: str, todo: dict, done: bool) -> None:
        todo["done"] = bool(done)
        todo["done_at"] = dt_util.now().isoformat() if done else None
        ref = f"todo:{todo_id}"
        self.data["ledger"][:] = [e for e in self.data["ledger"] if e.get("ref") != ref]
        pts = self.todo_points(todo)
        if done and pts > 0:
            rewards._add(self.data["ledger"], todo["person_id"], pts, "todo", ref, todo["title"],
                         dt_util.now().isoformat())

    async def async_refresh_all(self) -> bool:
        """Refresh button in the header: pull all calendars and lists now, then recompute away, season and lists.

        At most once every REFRESH_MIN_GAP seconds (several tablets / impatient taps); returns False when skipped.
        """
        now = dt_util.now()
        if self._refresh_last and (now - self._refresh_last).total_seconds() < REFRESH_MIN_GAP:
            return False
        self._refresh_last = now
        ents = {p["calendar"] for p in self.data["persons"].values() if p.get("calendar")}
        ents |= {lst["entity"] for lst in self.data["lists"].values() if lst.get("entity")}
        ents |= set(self.todo_settings()["name_lists"])
        ents = sorted(e for e in ents if self.hass.states.get(e) is not None)
        if ents:
            try:
                async with asyncio.timeout(LIST_READ_TIMEOUT):
                    await self.hass.services.async_call("homeassistant", "update_entity", {"entity_id": ents},
                                                        blocking=True)
            except Exception as err:  # a calendar or list without polling must not stop the rest
                _LOGGER.debug("Refresh of %s failed: %s", ents, err)
        if self.module_on(MODULE_WEEK):
            await self.async_refresh_away(apply=True)
            await self.async_refresh_season(force=True)
        for lid in list(self.data["lists"]):
            await self.async_refresh_list(lid)
        await self.async_sync_name_lists()
        self._changed()
        return True

    async def async_optimize_all(self, use_ai: bool) -> None:
        for lid in list(self.data["lists"]):
            await self.async_refresh_list(lid, use_ai=use_ai)

    async def async_save_list(self, list_id: str | None, spec: dict[str, Any]) -> str:
        spec = {**spec}
        if "name" in spec:
            spec["name"] = validate.text(spec["name"], 40) or "Liste"
        if "icon" in spec:
            spec["icon"] = validate.icon(spec["icon"], "mdi:format-list-checks")
        if "entity" in spec and not validate.entity(spec["entity"], ("todo",)):
            raise ValueError("entity must be a to-do list")
        if list_id and list_id in self.data["lists"]:
            lst = self.data["lists"][list_id]
            for key in LIST_FIELDS:
                if key in spec:
                    lst[key] = lists.clamp_max(spec[key]) if key == "max_categories" else spec[key]
        else:
            list_id = engine.new_id()
            self.data["lists"][list_id] = lists.new_list(
                spec["name"], spec["entity"], spec.get("max_categories", 10), spec.get("auto", True),
                spec.get("icon", ""))
            self.data["lists"][list_id]["person_todos"] = bool(spec.get("person_todos"))
        self._track_lists()
        self._changed()
        await self._store.async_save(self.data)
        from .repairs import async_check_entities
        async_check_entities(self.hass, self)
        self.hass.async_create_task(self.async_refresh_list(list_id))
        return list_id

    async def async_remove_list(self, list_id: str) -> None:
        self.data["lists"].pop(list_id, None)
        self.list_maps.pop(list_id, None)
        self._track_lists()
        self._changed()
        await self._store.async_save(self.data)

    async def async_set_categories(self, list_id: str, categories: list[dict]) -> None:
        """Rename / reorder / delete / add categories from the dashboard. 'other' always stays last."""
        lst = self.data["lists"][list_id]
        old = {c["id"]: c for c in lst["categories"]}
        new = []
        for spec in categories:
            cid = spec.get("id")
            if cid is not None and cid not in old:
                cid = None  # ids are assigned by the server
            cat = old.get(cid) or {"id": cid or ("c" + secrets.token_hex(3)), "kb": None, "keywords": [],
                                   "last_used": dt_util.now().date().isoformat()}
            cat = {**cat, "name": validate.text(spec.get("name") or cat.get("name"), 40) or "?",
                   "icon": validate.icon(spec.get("icon"), cat.get("icon") or "mdi:tag-outline")}
            if cat["id"] != lists.OTHER:
                new.append(cat)
        limit = lists.clamp_max(lst.get("max_categories"))
        other = old.get(lists.OTHER) or {"id": lists.OTHER, "name": lists.other_name(self.lang),
                                         "icon": "mdi:dots-horizontal-circle-outline", "kb": None, "keywords": [],
                                         "last_used": None}
        lst["categories"] = new[: limit - 1] + [other]
        keep = {c["id"] for c in lst["categories"]}
        lst["assignments"] = {k: v for k, v in lst["assignments"].items() if v in keep}
        self._changed()
        await self.async_refresh_list(list_id)

    async def async_assign(self, list_id: str, item: str, category_id: str) -> None:
        """Remember the category of an item (learned for the future)."""
        lst = self.data["lists"][list_id]
        if not any(c["id"] == category_id for c in lst["categories"]):
            raise KeyError(category_id)
        lst["assignments"][lists.normalize(item)] = category_id
        self.list_maps.setdefault(list_id, {})[item] = category_id
        self._changed()

    # ------------------------------------------------------------------ parent PIN
    @property
    def pin_default(self) -> bool:
        return bool(self.settings.get("pin_default"))

    async def async_check_pin(self, pin: str | None) -> str:
        """'ok', 'change_required' (start PIN), 'wrong' or 'locked' (5 wrong tries -> 5 minutes).

        PBKDF2 runs in the executor so a PIN check never blocks the event loop.
        """
        now = dt_util.now()
        self._pin_fail = [t for t in self._pin_fail if now - t < timedelta(minutes=5)]
        if len(self._pin_fail) >= 5:
            return "locked"
        if pin and await self.hass.async_add_executor_job(rewards.check_pin, self.settings.get("pin_hash"), pin):
            self._pin_fail.clear()
            return "change_required" if self.pin_default else "ok"
        if pin:  # an empty PIN (e.g. no token yet) is not a wrong guess
            self._pin_fail.append(now)
        return "wrong"

    async def async_change_pin(self, old: str, new: str) -> str:
        res = await self.async_check_pin(old)
        if res not in ("ok", "change_required"):
            return res
        if not settings_spec.pin_valid(new) or new == old:
            return "bad_pin"
        await self.async_set_pin(new)
        return "ok"

    async def async_set_pin(self, new: str | None) -> None:
        """Store a new PIN (hashed). None resets to the start PIN, which must be changed again."""
        pin = new if new and settings_spec.pin_valid(new) else settings_spec.DEFAULT_PIN
        self.settings["pin_hash"] = await self.hass.async_add_executor_job(rewards.hash_pin, pin)
        self.settings["pin_default"] = pin == settings_spec.DEFAULT_PIN
        self._pin_fail.clear()
        from .repairs import async_check_pin
        async_check_pin(self.hass, self)
        self._changed()
        await self._store.async_save(self.data)

    # ------------------------------------------------------------------ to-dos without a date
    def todo_settings(self) -> dict[str, Any]:
        cur = self.settings.get("todos") or {}
        size = cur.get("size")
        if size not in rewards.TODO_SIZES:  # before 0.7.0 a fixed number of points was the default
            size = "s" if validate.integer(cur.get("points"), 0, 1000, 0) else "none"
        return {"confirm": bool(cur.get("confirm", True)), "size": size,
                "keep_days": validate.integer(cur.get("keep_days"), 0, 30, 1),
                "max_shown": validate.integer(cur.get("max_shown"), 1, 20, 4),
                "show_age": bool(cur.get("show_age", True)),
                "name_lists": validate.entities(cur.get("name_lists"), ("todo",))}

    def sizes(self) -> dict[str, Any]:
        """Point values of the size choices (to-dos, bonus points) and the reward categories."""
        g = self.gamification()
        value = validate.number(self.settings.get("reward_value"), 0, 100000, 20)
        return {"todo": rewards.size_points(g["day_points"]), "reward": rewards.reward_costs(g),
                "month": rewards.month_points(g), "value": value,
                "values": rewards.reward_values(value),
                "currency": validate.currency(self.settings.get("currency"))}

    def todo_points(self, todo: dict) -> int:
        size = todo.get("size")
        if size in rewards.TODO_SIZES:
            return rewards.size_points(self.gamification()["day_points"])[size]
        return validate.integer(todo.get("points"), 0, 1000, 0)

    async def async_save_todo(self, todo_id: str | None, spec: dict[str, Any], may_set_points: bool) -> str:
        title = validate.text(spec.get("title"), 80)
        pid = spec.get("person_id")
        if not title:
            raise ValueError("title")
        if pid not in self.data["persons"]:
            raise KeyError(pid)
        cur = self.data["todos"].get(todo_id or "")
        if may_set_points and spec.get("size") in rewards.TODO_SIZES:
            size = spec["size"]
        elif cur is not None and cur.get("size") in rewards.TODO_SIZES:
            size = cur["size"]
        elif cur is not None and "points" in cur:  # to-do from before 0.7.0 keeps its own points
            size = None
        else:
            size = self.todo_settings()["size"]
        if cur is None:
            todo_id = engine.new_id()
            cur = self.data["todos"][todo_id] = {"created": dt_util.now().isoformat(), "done": False, "done_at": None}
        cur.update(title=title, person_id=pid)
        if size is not None:
            cur["size"] = size
            cur.pop("points", None)
        self._changed()
        await self._store.async_save(self.data)
        return todo_id

    async def async_set_todo(self, todo_id: str, done: bool) -> None:
        todo = self.data["todos"][todo_id]
        self._book_todo(todo_id, todo, done)
        self._changed()
        await self._store.async_save(self.data)
        src = str(todo.get("src") or "")
        if src.count("|") == 2:  # from a shared list: tick it off there once everybody named in it is done
            entity, uid, _pid = src.split("|")
            same = [t for t in self.data["todos"].values() if str(t.get("src") or "").startswith(f"{entity}|{uid}|")]
            status = "completed" if all(t.get("done") for t in same) else "needs_action"
            if validate.entity(entity, ("todo",)) and self.hass.states.get(entity) is not None:
                try:
                    await self.hass.services.async_call("todo", "update_item",
                                                        {"entity_id": entity, "item": uid, "status": status}, blocking=True)
                except Exception as err:  # noqa: BLE001 - the list may not support status changes
                    _LOGGER.debug("Cannot update %s on %s: %s", uid, entity, err)

    async def async_delete_todo(self, todo_id: str) -> None:
        self.data["todos"].pop(todo_id, None)
        self._changed()
        await self._store.async_save(self.data)

    def _prune_todos(self, today: date) -> None:
        keep = self.todo_settings()["keep_days"]
        limit = (today - timedelta(days=keep)).isoformat()
        self.data["todos"] = {k: t for k, t in self.data["todos"].items()
                              if not t.get("done") or (t.get("done_at") or "9999")[:10] >= limit}

    # ------------------------------------------------------------------ settings page (PIN protected)
    def settings_view(self) -> dict[str, Any]:
        from .announce import DEFAULT_ANNOUNCE
        st = self.settings
        panel = st.get("panel") or {}
        return {
            "general": {"modules": {m: self.module_on(m) for m in (MODULE_WEEK, MODULE_LISTS)},
                        "language": st.get("language") if st.get("language") in LANGUAGES else "auto",
                        "theme": self.theme()[0], "style": self.theme()[1], "panel": bool(panel.get("enabled", True)),
                        "panel_title": panel.get("title") or "",
                        "idle_seconds": validate.integer(st.get("idle_seconds"), 10, 600, 45),
                        "fullscreen_dblclick": bool(st.get("fullscreen_dblclick", True)),
                        "fullscreen_auto": bool(st.get("fullscreen_auto", False)),
                        "nav": self.nav(), "nav_title": bool(st.get("nav_title", False)),
                        "rollover_time": st.get(CONF_ROLLOVER_TIME) or "00:00",
                        "match_names": bool(st.get(CONF_MATCH_NAMES, True)),
                        "show_owner": bool(st.get(CONF_SHOW_OWNER, False)),
                        "admin_only_edit": bool(st.get("admin_only_edit")),
                        "reliability_days": self.reliability_days(),
                        "school_gap": validate.integer(st.get("school_gap"), 0, 240, 0),
                        "school_window": validate.integer(st.get("school_window", 60), 0, 240, 60),
                        "default_view": st.get("default_view") if st.get("default_view") in settings_spec.VIEWS else "today"},
            "seasons": self.season_settings(),
            "sonder": self.sonder_settings(),
            "season_upcoming": seasons.upcoming(self.season_settings(), self.today(), self.data.get("ferien"))[:40],
            "vacation": {k: v for k, v in self.vacation_settings().items() if k != "scanned"},
            "points": {**self.gamification(), "mode": self.points_mode(),
                       "reward_notify": validate.entities(st.get("reward_notify"), ("notify",)),
                       "reward_value": self.sizes()["value"], "currency": self.sizes()["currency"],
                       "awards": self.award_settings(), "levels": self.level_settings()},
            "announce": {**DEFAULT_ANNOUNCE, **(st.get("announce") or {})},
            "lists_settings": {"optimize_time": st.get(CONF_OPTIMIZE_TIME) or "03:00", "ai_task": st.get(CONF_AI_TASK),
                               "prune_days": validate.integer(st.get("prune_days"), 7, 365, 30)},
            "todos": self.todo_settings(),
            "persons": [{"id": pid, "name": p["name"], "color": p.get("color"), "calendar": p.get("calendar"),
                         "aliases": p.get("aliases", []), "image": p.get("image", ""), "school": clean_school(p.get("school")),
                         "order": p.get("order", 0), "role": p.get("role", "kid"),
                         "birthday": p.get("birthday") or "", "bday_anim": p.get("bday_anim")}
                        for pid, p in self.persons_sorted()],
            "lists": [{"id": lid, "name": lst["name"], "entity": lst["entity"], "icon": lst.get("icon") or "",
                       "max_categories": lst.get("max_categories", 10), "auto": lst.get("auto", True), "person_todos": bool(lst.get("person_todos"))}
                      for lid, lst in self.data["lists"].items()],
            "rewards": [{"id": rid, **r} for rid, r in sorted(self.data["rewards"].items(), key=lambda x: x[1]["cost"])],
        }

    async def async_save_section(self, section: str, data: dict[str, Any]) -> set[str]:
        """Validate and store one settings section; returns follow-up flags (reload, rollover, ...)."""
        from .announce import DEFAULT_ANNOUNCE
        st = self.settings
        if section == "general":
            cur = {**st, "panel": st.get("panel") or {}, "modules": {m: self.module_on(m) for m in (MODULE_WEEK, MODULE_LISTS)}}
            patch, flags = settings_spec.general(data, cur)
        elif section == "vacation":
            patch, flags = settings_spec.vacation(data, self.vacation_settings())
        elif section == "points":
            patch, flags = settings_spec.points(data, self.gamification(), self.points_mode(), st.get("reward_notify") or [],
                                                self.sizes()["value"], self.sizes()["currency"], self.award_settings(),
                                                self.level_settings())
        elif section == "announce":
            patch, flags = settings_spec.announce(data, {**DEFAULT_ANNOUNCE, **(st.get("announce") or {})},
                                                  self.data["persons"])
        elif section == "lists_settings":
            patch, flags = settings_spec.lists_settings(data, st)
        elif section == "todos":
            patch, flags = settings_spec.todos(data, self.todo_settings())
        elif section == "seasons":
            patch, flags = settings_spec.seasons(data, self.season_settings())
        elif section == "sonder":
            patch, flags = settings_spec.sonder(data, self.sonder_settings())
        else:
            raise settings_spec.SettingsError("section", "unknown_section")
        if "gamification" in patch:
            rewards.sync_reward_costs(self.data["rewards"], patch["gamification"])
        await self.async_update_settings(patch)
        if "rebook" in flags:
            self.book_points()
        if "refresh_away" in flags:
            self.hass.async_create_task(self.async_refresh_away(apply=True, rescan="rescan" in flags))
        if "rollover" in flags:
            await self.async_rollover()
        if "name_lists" in flags:
            self._track_lists()
            self.hass.async_create_task(self.async_sync_name_lists())
        if "season" in flags or "sonder" in flags:
            self.hass.async_create_task(self.async_refresh_season(force="season" in flags))
        return flags

    # ------------------------------------------------------------------ gamification & rewards

    async def async_save_reward(self, reward_id: str | None, spec: dict[str, Any]) -> str:
        size = spec.get("size") if spec.get("size") in rewards.REWARD_SIZES else None
        clean = {
            "title": validate.text(spec.get("title"), 60) or "?",
            "icon": validate.icon(spec.get("icon"), "mdi:gift-outline"),
            "size": size,
            "cost": (rewards.reward_costs(self.gamification())[size] if size
                     else validate.integer(spec.get("cost"), 1, 100000, 100)),
            "approval": bool(spec.get("approval", True)),
            "persons": [p for p in (spec.get("persons") or []) if p in self.data["persons"]],
            "per_week": validate.integer(spec.get("per_week"), 0, 50, 0),
        }
        rid = reward_id if reward_id in self.data["rewards"] else rewards.new_id()
        self.data["rewards"][rid] = clean
        self._changed()
        await self._store.async_save(self.data)
        return rid

    async def async_remove_reward(self, reward_id: str) -> None:
        self.data["rewards"].pop(reward_id, None)
        for req in self.data["requests"].values():
            if req["rid"] == reward_id and req["status"] == "pending":
                req["status"] = "denied"
        self._changed()

    async def async_redeem(self, person_id: str, reward_id: str) -> dict:
        req = rewards.redeem(self.data, person_id, reward_id, dt_util.now())
        self._changed()
        if req["status"] == "pending":
            await self._notify_parents(req)
        return req

    async def async_decide(self, request_id: str, approve: bool) -> dict:
        was_pending = self.data["requests"].get(request_id, {}).get("status") == "pending"
        req = rewards.decide(self.data, request_id, approve, dt_util.now())
        if was_pending and self.announcer.cfg.get("queue_rewards"):
            name = self.data["persons"].get(req["pid"], {}).get("name", "")
            hours = validate.integer(self.announcer.cfg.get("reward_hours"), 0, 48, 0)
            until = dt_util.now() + timedelta(hours=hours) if hours else self.day_end()
            self.announcer.enqueue(speech.reward_decided_message(name, req["title"], req["status"] == "approved", self.lang),
                                   until, key=f"reward:{request_id}")
        self._changed()
        return req

    def day_end(self) -> datetime:
        """End of the current planner day (next day change)."""
        start = dt_util.start_of_local_day(dt_util.now() - self.day_offset()) + self.day_offset()
        return start + timedelta(days=1)

    def _queue_special(self, new_items: set[str]) -> None:
        """Announce new date-based chores once (they are rare and easy to miss)."""
        if not self.announcer.cfg.get("queue_special"):
            return
        for iid in new_items:
            it = self.data["items"][iid]
            chore = self.data["chores"].get(it.get("chore_id"), {})
            if not chore.get("schedule"):
                continue
            name = self.data["persons"].get(it["person_id"], {}).get("name", "")
            days = (date.fromisoformat(it["due"]) - date.fromisoformat(it["start"])).days + 1
            until = dt_util.start_of_local_day(date.fromisoformat(it["due"])) + timedelta(days=1)
            self.announcer.enqueue(speech.special_chore_message(name, it["title"], days, self.lang), until,
                                   key=f"item:{iid}", item=iid)

    async def async_queue_message(self, text: str, minutes: int, key: str | None, rooms: list[str]) -> bool:
        entry = self.announcer.enqueue(validate.text(text, 300), dt_util.now() + timedelta(minutes=minutes),
                                       key=validate.text(key, 80) or None,
                                       rooms=validate.entities(rooms, ("binary_sensor",)))
        self.save_soon()
        return entry is not None

    async def async_clear_message(self, key: str) -> int:
        n = msgqueue.remove(self.data.setdefault("queue", []), key)
        self.save_soon()
        return n

    async def async_adjust_points(self, person_id: str, points: int, text: str) -> None:
        rewards.adjust(self.data, person_id, validate.integer(points, -10000, 10000, 0), validate.text(text, 80),
                       dt_util.now().isoformat())
        self._changed()

    async def _notify_parents(self, req: dict) -> None:
        from homeassistant.components import persistent_notification

        from . import speech
        name = self.data["persons"].get(req["pid"], {}).get("name", "?")
        msg = speech.reward_request_message(name, req["title"], req["cost"], self.lang)
        persistent_notification.async_create(self.hass, msg, title=self.entry.title,
                                             notification_id=f"{DOMAIN}_reward_{req['id']}")
        for ent in validate.entities(self.settings.get("reward_notify"), ("notify",)):
            try:
                await self.hass.services.async_call("notify", "send_message", {"entity_id": ent, "message": msg},
                                                    blocking=True)
            except Exception as err:
                _LOGGER.warning("Reward notification via %s failed: %s", ent, err)

    def points(self) -> dict[str, dict]:
        out = {}
        for pid in self.data["persons"]:
            life = rewards.lifetime(self.data["ledger"], pid)
            out[pid] = {"balance": rewards.balance(self.data["ledger"], pid),
                        "available": rewards.available(self.data, pid),
                        "lifetime": life,
                        **levels.view(self.data, pid, self.gamification(), self.today(), self.level_settings()["season_start"], self.lang)}
        return out

    # ------------------------------------------------------------------ read model
    def stats(self) -> dict[str, dict]:
        today = self.today()
        fair = self.points_mode() == "fair"
        return {pid: engine.person_stats(self.data["history"], self.data["items"], pid, today, self.reliability_days(), fair)
                for pid in self.data["persons"]}

    def _awards_view(self, stats: dict[str, dict]) -> dict[str, dict]:
        per = awards.person_awards(self.data, {p: s["streak"] for p, s in stats.items()})
        return {pid: {"list": lst, "frame": awards.frame(lst)} for pid, lst in per.items()}

    def snapshot(self) -> dict[str, Any]:
        """Everything the dashboard cards need, JSON serializable."""
        today = self.today()
        stats = self.stats()
        limit = (today - timedelta(days=62)).isoformat()
        st = self.settings
        return {
            "entry_id": self.entry.entry_id,
            "title": self.entry.title,
            "lang": self.lang,
            "modules": {m: self.module_on(m) for m in (MODULE_WEEK, MODULE_LISTS)},
            "today": today.isoformat(),
            "day_offset_min": int(self.day_offset().total_seconds() // 60),
            "week_index": engine.week_index(today),
            "settings": {"language": st.get("language") if st.get("language") in LANGUAGES else "auto",
                         CONF_ROLLOVER_TIME: st.get(CONF_ROLLOVER_TIME), CONF_MATCH_NAMES: st.get(CONF_MATCH_NAMES),
                         CONF_SHOW_OWNER: st.get(CONF_SHOW_OWNER), "admin_only_edit": bool(st.get("admin_only_edit")),
                         "reliability_days": self.reliability_days(),
                         "school_gap": validate.integer(st.get("school_gap"), 0, 240, 0),
                         "school_window": validate.integer(st.get("school_window", 60), 0, 240, 60),
                         "idle_seconds": validate.integer(st.get("idle_seconds"), 10, 600, 45),
                         "fullscreen_dblclick": bool(st.get("fullscreen_dblclick", True)),
                         "fullscreen_auto": bool(st.get("fullscreen_auto", False)),
                         "nav": self.nav(), "nav_title": bool(st.get("nav_title", False)),
                         "early_time": self.award_settings()["early_time"],
                         "confetti": self.award_settings()["confetti"],
                         "default_view": st.get("default_view") if st.get("default_view") in settings_spec.VIEWS else "today"},
            "season": self.season(),
            "season_cfg": {k: v for k, v in self.season_settings().items()
                           if k in ("weather", "storm_kmh", "intensity", "sug_enabled", "sug_from", "pool", "pool_min",
                                    "jacuzzi", "jacuzzi_min", "xmas_snow", "anim_bday", "house", "night_mode",
                                    "frost_mode", "frost_below")},
            "busy": self.busy,
            "away_kind": self.away_kind,
            "away_badge": {pid: b for pid, spans in self.away_spans.items() if (b := vacation.badge_at(spans, dt_util.now()))},
            "sonder": sonder.view(self.data["sonder_inst"], self.data["sonder"], self.lang),
            "sonder_points": {iid: self.sonder_points(i) for iid, i in self.data["sonder_inst"].items()},
            "todos": sorted(({"id": tid, **t} for tid, t in self.data["todos"].items()),
                            key=lambda t: (t.get("done"), t.get("created") or "")),
            "todo_points": {tid: self.todo_points(t) for tid, t in self.data["todos"].items()},
            "item_points": self.item_points(),
            "todo_settings": self.todo_settings(),
            "sizes": self.sizes(),
            "pin_default": self.pin_default,
            "persons": [{"id": pid, **p} for pid, p in self.persons_sorted()],
            "chores": [{"id": cid, **c, **({"upcoming": schedule.upcoming(c, self.data["persons"], today)} if c.get("schedule") else {})}
                       for cid, c in sorted(self.data["chores"].items(), key=lambda x: x[1]["title"].lower())],
            "away": {pid: sorted(d for d in days if (today - timedelta(days=7)).isoformat() <= d
                                 <= (today + timedelta(days=35)).isoformat()) for pid, days in self.away.items()},
            "vacation": {k: v for k, v in self.vacation_settings().items() if k != "scanned"},
            "items": [{"id": iid, **it} for iid, it in self.data["items"].items()],
            "history": {d: v for d, v in self.data["history"].items() if d >= limit},
            "stats": stats,
            "awards": self._awards_view(stats),
            "open_awards": awards.open_awards(self.data, today, {p: s["streak"] for p, s in stats.items()},
                                              self.points_mode() == "fair", self.award_settings()),
            "award_settings": self.award_settings(),
            "award_points": {aid: awards.points_for(c["size"], self.gamification()["day_points"])
                             for aid, c in self.award_settings()["items"].items()},
            "celebrations": [c for c in (self.data.get("awards") or {}).get("celebrations", [])
                             if (c.get("ts") or "") >= (today - timedelta(days=2)).isoformat()],
            "counters": {pid: c.get("done", 0) for pid, c in self.data.get("counters", {}).items()},
            "pace": self.pace(),
            "status": self.data.get("status", {}),
            "vacation_review": self.vacation_review,
            "points": self.points(),
            "gamification": {**self.gamification(), "mode": self.points_mode()},
            "rewards": [{"id": rid, **r} for rid, r in sorted(self.data["rewards"].items(), key=lambda x: x[1]["cost"])],
            "requests": sorted(({"id": qid, **q} for qid, q in self.data["requests"].items()),
                               key=lambda q: q["ts"], reverse=True)[:30],
            "ledger": sorted(self.data["ledger"], key=lambda e: e["ts"], reverse=True)[:60],
            "pin_set": bool(st.get("pin_hash")),
            "theme": self.theme()[0], "style": self.theme()[1],
            "lists": [{"id": lid, "name": lst["name"], "entity": lst["entity"], "icon": lst.get("icon"),
                       "max_categories": lst.get("max_categories"), "auto": lst.get("auto", True),
                       "categories": [{"id": c["id"], "name": c["name"], "icon": c.get("icon")} for c in lst["categories"]],
                       "map": self.list_maps.get(lid, {})}
                      for lid, lst in self.data["lists"].items()],
        }

    # ------------------------------------------------------------------ import from the YAML/todo prototype
    async def async_import_legacy(self, plan: str | None, today_list: str | None,
                                  history: str | None, settings: str | None) -> dict[str, int]:
        """Import the todo-list based prototype (descriptions prefixed with 'fp1:')."""

        async def items(entity: str | None) -> list[dict]:
            if not entity:
                return []
            res = await self.hass.services.async_call(
                "todo", "get_items", {"entity_id": entity, "status": ["needs_action", "completed"]},
                blocking=True, return_response=True)
            return (res or {}).get(entity, {}).get("items", [])

        def desc(item: dict) -> dict:
            d = item.get("description") or ""
            if not d.startswith("fp1:"):
                return {}
            try:
                return json.loads(d[4:]) or {}
            except ValueError:
                return {}

        def pid_for(name: str) -> str:
            return self.person_by_name(name) or self._add_person(name)

        counts = {"persons": 0, "chores": 0, "items": 0, "history_days": 0}
        for it in await items(settings):
            if it.get("summary") != "Personen":
                continue
            for name, s in (desc(it).get("p") or {}).items():
                pid = pid_for(name)
                p = self.data["persons"][pid]
                p["color"] = validate.color(s.get("farbe"), p["color"])
                p["image"] = validate.image(s.get("bild")) or p.get("image", "")
                if s.get("alias"):
                    p["aliases"] = validate.aliases(p.get("aliases", []) + list(s["alias"]))
                counts["persons"] += 1

        for it in await items(plan):
            m = desc(it)
            z = m.get("z") if isinstance(m.get("z"), dict) else ({m["k"]: m.get("t", [])} if m.get("k") else {})
            assign: dict = {}
            for name, days in z.items():
                pid = pid_for(name)
                rules = {}
                for day in days or []:
                    r = (m.get("r") or {}).get(f"{name}|{day}") or [1, 0]
                    rules[str(day)] = {"every": r[0], "offset": r[1], "window": (m.get("f") or {}).get(f"{name}|{day}", 1)}
                assign[pid] = rules
            if it.get("summary"):
                self.data["chores"][engine.new_id()] = engine.validate_chore(
                    {"title": it["summary"], "assign": assign}, self.data["persons"])
                counts["chores"] += 1

        for it in await items(history):
            m = desc(it)
            day = it.get("summary", "")
            rec = self.data["history"].setdefault(day, {})
            for name, done, total in m.get("s") or []:
                rec[pid_for(name)] = {"done": done, "total": total, "missed": []}
            for name, title in m.get("x") or []:
                rec.setdefault(pid_for(name), {"done": 0, "total": 0, "missed": []})["missed"].append(title)
            counts["history_days"] += 1

        # items of the current day are regenerated from the plan; keep done flags where titles match
        done_today = {(desc(it).get("k"), it.get("summary")) for it in await items(today_list)
                      if it.get("status") == "completed"}
        engine.rollover(self.data, self.today(), self.away)
        for it in self.data["items"].values():
            name = self.data["persons"].get(it["person_id"], {}).get("name")
            if (name, it["title"]) in done_today:
                it["done"] = True
                counts["items"] += 1
        self._changed()
        return counts
