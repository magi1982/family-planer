"""Family Planer: week plan (chores, calendars, rewards) and smart lists for the whole family.

Everything is set up in the UI: integration options, a sidebar panel and dashboard cards. No YAML needed.
"""
from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType

from .const import CARDS_FILE, DOMAIN, FILES_DIR, FILES_URL, PANEL_URL, URL_BASE, VERSION
from .planner import FamilyPlanner
from .repairs import async_check_entities, async_check_pin
from .websocket import async_register_websocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.TODO, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
CARDS_URL = f"{URL_BASE}/{CARDS_FILE}?v={VERSION}"

type FamilyPlanerConfigEntry = ConfigEntry[FamilyPlanner]


def get_planner(hass: HomeAssistant, entry_id: str | None = None) -> FamilyPlanner | None:
    """Return the planner of a loaded entry (the first one if no id is given)."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is not ConfigEntryState.LOADED:
            continue
        if entry_id is None or entry.entry_id == entry_id:
            return entry.runtime_data
    return None


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register websocket API, services and the dashboard cards once."""
    async_register_websocket(hass)
    await _async_register_frontend(hass)

    def _planner(call: ServiceCall) -> FamilyPlanner:
        planner = get_planner(hass, call.data.get("entry_id"))
        if planner is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        return planner

    async def handle_rollover(call: ServiceCall) -> None:
        await _planner(call).async_rollover()

    async def handle_set_item(call: ServiceCall) -> None:
        planner = _planner(call)
        try:
            await planner.async_set_item(call.data["item_id"], call.data.get("done", True))
        except KeyError as err:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_item") from err

    async def handle_optimize(call: ServiceCall) -> None:
        await _planner(call).async_optimize_all(use_ai=call.data.get("ai", True))

    async def handle_announce(call: ServiceCall) -> ServiceResponse:
        message = await _planner(call).announcer.async_check(force=True)
        return {"message": message}

    async def handle_queue(call: ServiceCall) -> ServiceResponse:
        ok = await _planner(call).async_queue_message(call.data["message"], call.data.get("expires", 240),
                                                     call.data.get("key"), call.data.get("motion", []))
        return {"queued": ok}

    async def handle_clear(call: ServiceCall) -> ServiceResponse:
        return {"removed": await _planner(call).async_clear_message(call.data["key"])}

    async def handle_points(call: ServiceCall) -> None:
        planner = _planner(call)
        try:
            pid = call.data["person"] if call.data["person"] in planner.data["persons"] else planner.person_by_name(call.data["person"])
            await planner.async_adjust_points(pid or "", call.data["points"], call.data.get("reason", ""))
        except KeyError as err:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_person") from err

    async def handle_import(call: ServiceCall) -> ServiceResponse:
        return await _planner(call).async_import_legacy(
            call.data.get("plan"), call.data.get("today"), call.data.get("history"), call.data.get("settings"))

    base = {vol.Optional("entry_id"): cv.string}
    hass.services.async_register(DOMAIN, "rollover", handle_rollover, schema=vol.Schema(base))
    hass.services.async_register(DOMAIN, "set_item", handle_set_item, schema=vol.Schema({
        **base, vol.Required("item_id"): cv.string, vol.Optional("done", default=True): cv.boolean}))
    hass.services.async_register(DOMAIN, "optimize_lists", handle_optimize, schema=vol.Schema({
        **base, vol.Optional("ai", default=True): cv.boolean}))
    hass.services.async_register(DOMAIN, "announce", handle_announce, schema=vol.Schema(base),
                                 supports_response=SupportsResponse.OPTIONAL)
    hass.services.async_register(DOMAIN, "queue_announcement", handle_queue, schema=vol.Schema({
        **base, vol.Required("message"): vol.All(cv.string, vol.Length(min=1, max=300)),
        vol.Optional("expires", default=240): vol.All(vol.Coerce(int), vol.Range(min=1, max=10080)),
        vol.Optional("key"): vol.All(cv.string, vol.Length(max=80)),
        vol.Optional("motion", default=[]): cv.entity_ids}), supports_response=SupportsResponse.OPTIONAL)
    hass.services.async_register(DOMAIN, "clear_announcement", handle_clear, schema=vol.Schema({
        **base, vol.Required("key"): vol.All(cv.string, vol.Length(max=80))}), supports_response=SupportsResponse.OPTIONAL)
    hass.services.async_register(DOMAIN, "add_points", handle_points, schema=vol.Schema({
        **base, vol.Required("person"): cv.string,
        vol.Required("points"): vol.All(vol.Coerce(int), vol.Range(min=-10000, max=10000)),
        vol.Optional("reason", default=""): vol.All(cv.string, vol.Length(max=80))}))
    hass.services.async_register(DOMAIN, "import_legacy", handle_import, schema=vol.Schema({
        **base,
        vol.Optional("plan"): cv.entity_id, vol.Optional("today"): cv.entity_id,
        vol.Optional("history"): cv.entity_id, vol.Optional("settings"): cv.entity_id,
    }), supports_response=SupportsResponse.OPTIONAL)
    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled cards (loaded in every dashboard) and the folder for uploaded photos."""
    path = Path(__file__).parent / "frontend"
    if getattr(hass, "http", None) is None:
        return
    from homeassistant.components.frontend import add_extra_js_url
    from homeassistant.components.http import StaticPathConfig

    files = Path(hass.config.path(FILES_DIR))
    await hass.async_add_executor_job(lambda: (files / "avatars").mkdir(parents=True, exist_ok=True))
    await hass.http.async_register_static_paths([
        StaticPathConfig(URL_BASE, str(path), True),
        StaticPathConfig(FILES_URL, str(files), False),
    ])
    add_extra_js_url(hass, CARDS_URL)


async def _async_register_panel(hass: HomeAssistant, entry: FamilyPlanerConfigEntry) -> bool:
    """Sidebar entry with the full planner – works without creating a dashboard."""
    from homeassistant.components import frontend, panel_custom

    planner = entry.runtime_data
    panel = planner.settings.get("panel") or {}
    if not panel.get("enabled", True) or PANEL_URL in hass.data.get(frontend.DATA_PANELS, {}):
        return False
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name="family-planer-panel",
        sidebar_title=(panel.get("title") or entry.title)[:40],
        sidebar_icon="mdi:calendar-heart",
        module_url=CARDS_URL,
        require_admin=False,
        config={"entry_id": entry.entry_id},
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: FamilyPlanerConfigEntry) -> bool:
    planner = FamilyPlanner(hass, entry)
    await planner.async_load()
    entry.runtime_data = planner
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    planner.owns_panel = await _async_register_panel(hass, entry)
    async_check_pin(hass, planner)

    async def _check(_hass: HomeAssistant) -> None:
        async_check_entities(hass, planner)

    entry.async_on_unload(async_at_started(hass, _check))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: FamilyPlanerConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        planner = entry.runtime_data
        if getattr(planner, "owns_panel", False):
            from homeassistant.components import frontend
            frontend.async_remove_panel(hass, PANEL_URL)
        planner.async_shutdown()
    return unloaded
