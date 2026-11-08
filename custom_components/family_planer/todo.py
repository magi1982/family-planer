"""One to-do list per family member with the chores that can be done today.

Ticking an item here (dashboard, Assist, Alexa via HA) counts exactly like ticking it on the planner card.
"""
from __future__ import annotations

from datetime import date

from homeassistant.components.todo import TodoItem, TodoItemStatus, TodoListEntity, TodoListEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import FamilyPlanerConfigEntry, engine
from .const import DOMAIN
from .const import MODULE_WEEK
from .entity import PersonEntity

PARALLEL_UPDATES = 0


async def async_setup_entry(hass: HomeAssistant, entry: FamilyPlanerConfigEntry,
                            async_add_entities: AddEntitiesCallback) -> None:
    planner = entry.runtime_data
    if not planner.module_on(MODULE_WEEK):
        return
    async_add_entities(PersonChoresTodo(planner, pid) for pid in planner.data["persons"])


class PersonChoresTodo(PersonEntity, TodoListEntity):
    """Today's chores of one person."""

    _attr_translation_key = "chores"
    _attr_supported_features = TodoListEntityFeature.UPDATE_TODO_ITEM

    def __init__(self, planner, person_id: str) -> None:
        super().__init__(planner, person_id, "chores")

    @property
    def todo_items(self) -> list[TodoItem]:
        today = self.planner.today()
        return [
            TodoItem(
                summary=it.get("title", ""),
                uid=iid,
                status=TodoItemStatus.COMPLETED if it.get("done") else TodoItemStatus.NEEDS_ACTION,
                due=date.fromisoformat(it["due"]) if it.get("due") and it["due"] != it.get("start") else None,
            )
            for iid, it in engine.active_items(self.planner.data["items"], self.person_id, today)
        ]

    async def async_update_todo_item(self, item: TodoItem) -> None:
        if item.uid not in self.planner.data["items"]:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_item")
        await self.planner.async_set_item(item.uid, item.status == TodoItemStatus.COMPLETED)
