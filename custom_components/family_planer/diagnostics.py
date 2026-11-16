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
        "pin_is_start_pin": bool(st.get("pin_default")),
        "language": st.get("language"),
        "gamification": p.gamification(),
        "announce": {"enabled": ann.get("enabled"), "motion_sensors": len(ann.get("motion") or []),
                     "notify_targets": len(ann.get("notify") or []), "tts": bool(ann.get("tts"))},
        "counts": {
            "persons": len(p.data["persons"]),
            "persons_with_calendar": sum(1 for x in p.data["persons"].values() if x.get("calendar")),
            "chores": len(p.data["chores"]), "items": len(p.data["items"]), "history_days": len(p.data["history"]),
            "ledger": len(p.data["ledger"]), "rewards": len(p.data["rewards"]),
            "todos_open": sum(1 for t in p.data.get("todos", {}).values() if not t.get("done")),
            "pending_requests": sum(1 for r in p.data["requests"].values() if r["status"] == "pending"),
        },
        "lists": [{"categories": len(lst["categories"]), "max_categories": lst.get("max_categories"),
                   "auto": lst.get("auto"), "learned": len(lst.get("assignments", {})),
                   "entity_available": hass.states.get(lst["entity"]) is not None}
                  for lst in p.data["lists"].values()],
        "ai_task_configured": bool(st.get("ai_task")),
        "away": _away(p),
        "sonder": _sonder(p),
    }


def _away(p) -> dict[str, Any]:
    """Holiday / trip detection without names or titles: persons as P1, P2 … in planner order."""
    idx = {pid: f"P{n + 1}" for n, (pid, _) in enumerate(p.persons_sorted())}
    v = p.vacation_settings()
    st_dec = p.settings.get("vacation_decisions") or {}
    return {
        "enabled": v.get("enabled"), "scope": v.get("scope"), "min_hours": v.get("min_hours"),
        "words": len(v.get("words") or []), "decisions": len(st_dec),
        "spans": {idx.get(pid, "?"): [{"start": s_["start"], "end": s_["end"], "kind": s_["kind"]} for s_ in spans]
                  for pid, spans in p.away_spans.items()},
        "away_now": sorted(idx.get(pid, "?") for pid in p.away_now()),
        "review": [{"kind": e.get("kind"), "start": e.get("start"), "end": e.get("end"),
                    "persons": [idx.get(x, "?") for x in e.get("persons", [])], "decision": e.get("decision"),
                    "chosen": [idx.get(x, "?") for x in e.get("chosen", [])], "family": e.get("family"),
                    "decision_stored": e.get("key") in st_dec}
                   for e in p.vacation_review],
    }


def _sonder(p) -> dict[str, Any]:
    defs = p.data.get("sonder") or {}
    inst = p.data.get("sonder_inst") or {}
    return {"defs": len(defs), "defs_on": sum(1 for d in defs.values() if d.get("on")),
            "defs_away": sum(1 for d in defs.values() if d.get("on") and d.get("away")),
            "instances": len(inst), "instances_open": sum(1 for i in inst.values() if not i.get("done"))}
