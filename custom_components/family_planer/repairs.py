"""Repair issues: tell the user when a configured entity (calendar, list, sensor, speaker) is gone."""
from __future__ import annotations

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN


@callback
def async_check_entities(hass: HomeAssistant, planner) -> None:
    """Create one issue per missing entity, remove issues that are fixed."""
    st = planner.settings
    ann = st.get("announce") or {}
    wanted: dict[str, str] = {}
    for p in planner.data["persons"].values():
        if p.get("calendar"):
            wanted[p["calendar"]] = p["name"]
    for lst in planner.data["lists"].values():
        wanted[lst["entity"]] = lst["name"]
    if ann.get("enabled"):
        for ent in [*(ann.get("motion") or []), *(ann.get("notify") or []), *(ann.get("media_players") or [])]:
            wanted[ent] = ent
        if ann.get("tts"):
            wanted[ann["tts"]] = ann["tts"]
    if st.get("ai_task"):
        wanted[st["ai_task"]] = "AI"
    entry_id = planner.entry.entry_id
    prefix = f"missing_{entry_id}_"
    reg = ir.async_get(hass)
    for issue_id in [i for (d, i) in reg.issues if d == DOMAIN and i.startswith(prefix)]:
        ent = issue_id[len(prefix):]
        if ent not in wanted or hass.states.get(ent) is not None:
            ir.async_delete_issue(hass, DOMAIN, issue_id)
    for ent, used_by in wanted.items():
        if hass.states.get(ent) is None:
            ir.async_create_issue(hass, DOMAIN, prefix + ent, is_fixable=False, severity=ir.IssueSeverity.WARNING,
                                  translation_key="missing_entity",
                                  translation_placeholders={"entity": ent, "used_by": used_by})


@callback
def async_check_pin(hass: HomeAssistant, planner) -> None:
    """Warn while the well-known start PIN 123456 is still active."""
    issue_id = f"default_pin_{planner.entry.entry_id}"
    if planner.pin_default:
        ir.async_create_issue(hass, DOMAIN, issue_id, is_fixable=False, severity=ir.IssueSeverity.WARNING,
                              translation_key="default_pin")
    else:
        ir.async_delete_issue(hass, DOMAIN, issue_id)
