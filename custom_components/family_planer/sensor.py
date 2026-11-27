"""Reliability and points sensors per family member (usable in automations)."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.util import dt as dt_util

from . import FamilyPlanerConfigEntry, engine
from . import awards as fp_awards
from . import school as fp_school
from .const import MODULE_WEEK, SIGNAL_SCHOOL
from .entity import PersonEntity

PARALLEL_UPDATES = 0


async def async_setup_entry(hass: HomeAssistant, entry: FamilyPlanerConfigEntry,
                            async_add_entities: AddEntitiesCallback) -> None:
    planner = entry.runtime_data
    if not planner.module_on(MODULE_WEEK):
        return
    entities: list[SensorEntity] = []
    for pid in planner.data["persons"]:
        entities += [ReliabilitySensor(planner, pid), PointsSensor(planner, pid)]
    if planner.school_entities()["sensors"]:
        for pid in planner.school_persons():
            entities += [SchoolTimeSensor(planner, pid, "leave"), SchoolTimeSensor(planner, pid, "home")]
    async_add_entities(entities)


class ReliabilitySensor(PersonEntity, SensorEntity):
    """Share of chores done in the last 30 days (100 % while there is no history yet)."""

    _attr_translation_key = "reliability"
    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 0

    def __init__(self, planner, person_id: str) -> None:
        super().__init__(planner, person_id, "reliability")

    def _stats(self) -> dict[str, Any]:
        return engine.person_stats(self.planner.data["history"], self.planner.data["items"],
                                   self.person_id, self.planner.today(), self.planner.reliability_days())

    @property
    def native_value(self) -> int:
        return self._stats()["reliability"]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        s = self._stats()
        all_stats = self.planner.reliability_stats()
        streaks = {p: x["streak"] for p, x in all_stats.items()}
        awards = fp_awards.person_awards(self.planner.data, streaks).get(self.person_id, [])
        return {
            "open_today": s["open_today"],
            "done_today": s["done_today"],
            "streak": s["streak"],
            "week_done": s["week"][0], "week_total": s["week"][1],
            "month_done": s["month"][0], "month_total": s["month"][1],
            "awards": [a["id"] for a in awards],
            "frame": fp_awards.frame(awards),
        }


class PointsSensor(PersonEntity, SensorEntity):
    """Points that can be spent on rewards; level in the attributes."""

    _attr_translation_key = "points"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, planner, person_id: str) -> None:
        super().__init__(planner, person_id, "points")

    @property
    def native_value(self) -> int:
        return self.planner.points()[self.person_id]["balance"]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        p = self.planner.points()[self.person_id]
        return {"available": p["available"], "lifetime": p["lifetime"], "level": p["level"],
                "level_name": p["name"], "tier": p["tier"], "season_points": p["xp"], "next_level_at": p["next"]}


class SchoolTimeSensor(PersonEntity, SensorEntity):
    """Next time a person leaves for school / is home again (timestamp, for automations and reminders)."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, planner, person_id: str, kind: str) -> None:
        super().__init__(planner, person_id, f"school_{kind}")
        self.kind = kind
        self._attr_translation_key = f"school_{kind}"
        self._timer = None

    def _block(self) -> dict | None:
        return fp_school.next_block(self.planner.school_upcoming.get(self.person_id, []), dt_util.now(), self.kind)

    @property
    def native_value(self) -> datetime | None:
        bk = self._block()
        return bk[self.kind] if bk else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        bk = self._block()
        if not bk:
            return {}
        return {"leave": bk["leave"].isoformat(), "start": bk["start"].isoformat(),
                "end": bk["end"].isoformat(), "home": bk["home"].isoformat(), "lessons": len(bk["lessons"])}

    @callback
    def _refresh(self, *_: Any) -> None:
        """Write the state and wake up again right after the shown time has passed."""
        if self._timer:
            self._timer()
            self._timer = None
        self.async_write_ha_state()
        bk = self._block()
        if bk:
            self._timer = async_track_point_in_time(self.hass, self._refresh, bk[self.kind] + timedelta(seconds=1))

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(async_dispatcher_connect(
            self.hass, SIGNAL_SCHOOL.format(self.planner.entry.entry_id), self._refresh))
        self.async_on_remove(self._cancel)
        self._refresh()

    @callback
    def _cancel(self) -> None:
        if self._timer:
            self._timer()
            self._timer = None
