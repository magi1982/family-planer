"""Reliability and points sensors per family member (usable in automations)."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import FamilyPlanerConfigEntry, engine
from . import awards as fp_awards
from .const import MODULE_WEEK
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
        all_stats = self.planner.stats()
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
