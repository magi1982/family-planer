"""One school calendar per person with a timetable: one event per school block (read-only).

Time = lessons (e.g. 07:50–11:45); the description holds "leave / home" (travel time) and every lesson with
its room. No events on holidays, exactly like the planner card. Works with calendar cards and calendar
triggers in automations (with offset, e.g. 15 minutes before).
"""
from __future__ import annotations

from datetime import datetime

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from . import FamilyPlanerConfigEntry
from . import school as fp_school
from .const import MODULE_WEEK, SIGNAL_SCHOOL
from .entity import PersonEntity

PARALLEL_UPDATES = 0


async def async_setup_entry(hass: HomeAssistant, entry: FamilyPlanerConfigEntry,
                            async_add_entities: AddEntitiesCallback) -> None:
    planner = entry.runtime_data
    if not planner.module_on(MODULE_WEEK) or not planner.school_entities()["calendar"]:
        return
    async_add_entities(SchoolCalendar(planner, pid) for pid in planner.school_persons())


def to_event(bk: dict, lang: str, travel: int) -> CalendarEvent:
    return CalendarEvent(start=bk["start"], end=bk["end"],
                         summary="🎒 Schule" if lang == "de" else "🎒 School",
                         description=fp_school.describe(bk, lang, travel),
                         location=fp_school.location(bk) or None)


class SchoolCalendar(PersonEntity, CalendarEntity):
    """School blocks of one person."""

    _attr_translation_key = "school"

    def __init__(self, planner, person_id: str) -> None:
        super().__init__(planner, person_id, "school")

    def _travel(self) -> int:
        return int(((self.planner.data["persons"].get(self.person_id) or {}).get("school") or {}).get("travel") or 0)

    @property
    def event(self) -> CalendarEvent | None:
        bk = fp_school.next_block(self.planner.school_upcoming.get(self.person_id, []), dt_util.now(), "end")
        return to_event(bk, self.planner.lang, self._travel()) if bk else None

    async def async_get_events(self, hass: HomeAssistant, start_date: datetime, end_date: datetime) -> list[CalendarEvent]:
        blocks = await self.planner.async_school_blocks(self.person_id, start_date, end_date)
        return [to_event(bk, self.planner.lang, self._travel()) for bk in blocks]

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(async_dispatcher_connect(
            self.hass, SIGNAL_SCHOOL.format(self.planner.entry.entry_id), self.async_write_ha_state))
