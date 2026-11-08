"""Diagnostics download: structure and counts, never names, photos, PIN or list contents."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from . import FamilyPlanerConfigEntry


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: FamilyPlanerConfigEntry) -> dict[str, Any]:
    p = entry.runtime_data
    st = p.settings
    ann = st.get("announce") or {}
    return {
        "version": entry.version,
        "modules": st.get("modules"),
        "theme": st.get("theme"),
        "rollover_time": st.get("rollover_time"),
        "match_names": st.get("match_names"),
        "admin_only_edit": st.get("admin_only_edit"),
        "pin_set": bool(st.get("pin_hash")),
        "gamification": p.gamification(),
        "announce": {"enabled": ann.get("enabled"), "motion_sensors": len(ann.get("motion") or []),
                     "notify_targets": len(ann.get("notify") or []), "tts": bool(ann.get("tts"))},
        "counts": {
            "persons": len(p.data["persons"]),
            "persons_with_calendar": sum(1 for x in p.data["persons"].values() if x.get("calendar")),
            "chores": len(p.data["chores"]), "items": len(p.data["items"]), "history_days": len(p.data["history"]),
            "ledger": len(p.data["ledger"]), "rewards": len(p.data["rewards"]),
            "pending_requests": sum(1 for r in p.data["requests"].values() if r["status"] == "pending"),
        },
        "lists": [{"categories": len(lst["categories"]), "max_categories": lst.get("max_categories"),
                   "auto": lst.get("auto"), "learned": len(lst.get("assignments", {})),
                   "entity_available": hass.states.get(lst["entity"]) is not None}
                  for lst in p.data["lists"].values()],
        "ai_task_configured": bool(st.get("ai_task")),
    }
