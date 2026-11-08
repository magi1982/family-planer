"""Base entity: one device per family member."""
from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, SIGNAL_UPDATE
from .planner import FamilyPlanner


class PersonEntity(Entity):
    """Entity bound to one family member of a planner."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, planner: FamilyPlanner, person_id: str, key: str) -> None:
        self.planner = planner
        self.person_id = person_id
        entry_id = planner.entry.entry_id
        person = planner.data["persons"][person_id]
        self._attr_unique_id = f"{entry_id}_{person_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{entry_id}_{person_id}")},
            name=person.get("name", person_id),
            manufacturer="Family Planer",
            model="Family member",
        )

    @property
    def available(self) -> bool:
        return self.person_id in self.planner.data["persons"]

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(
            self.hass, SIGNAL_UPDATE.format(self.planner.entry.entry_id), self.async_write_ha_state))
