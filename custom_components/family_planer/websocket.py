"""Websocket API used by the Family Planer dashboard cards."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

RULE = vol.Schema({
    vol.Optional("every", default=1): vol.All(vol.Coerce(int), vol.Range(min=1, max=8)),
    vol.Optional("offset", default=0): vol.All(vol.Coerce(int), vol.Range(min=0, max=7)),
    vol.Optional("window", default=1): vol.All(vol.Coerce(int), vol.Range(min=1, max=14)),
})


def _planner(hass: HomeAssistant, msg: dict[str, Any]):
    from . import get_planner  # avoid import cycle
    return get_planner(hass, msg.get("entry_id"))


def _may_edit(connection: websocket_api.ActiveConnection, msg: dict[str, Any], planner) -> bool:
    """Plan/people/list changes: everyone, or admins only if the planner is set up that way."""
    if planner.settings.get("admin_only_edit") and not connection.user.is_admin:
        connection.send_error(msg["id"], websocket_api.ERR_UNAUTHORIZED, "Only administrators may change this")
        return False
    return True


def _parent(connection: websocket_api.ActiveConnection, msg: dict[str, Any], planner) -> bool:
    """Approving rewards and changing points: an administrator or the parent PIN."""
    if connection.user.is_admin or planner.pin_ok(msg.get("pin")):
        return True
    connection.send_error(msg["id"], websocket_api.ERR_UNAUTHORIZED, "Parent PIN required")
    return False


def _not_found(connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Family Planer is not set up")


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    for handler in (ws_subscribe, ws_set_item, ws_save_chore, ws_delete_chore, ws_update_person, ws_rollover,
                    ws_upload_image, ws_list_refresh, ws_list_categories, ws_list_assign,
                    ws_redeem, ws_decide, ws_adjust, ws_announce_test):
        websocket_api.async_register_command(hass, handler)


@websocket_api.websocket_command({vol.Required("type"): "family_planer/subscribe", vol.Optional("entry_id"): str})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Send a full snapshot now and after every change."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return

    @callback
    def forward() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], planner.snapshot()))

    connection.subscriptions[msg["id"]] = planner.add_listener(forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/item/set", vol.Optional("entry_id"): str,
    vol.Required("item_id"): str, vol.Required("done"): bool,
})
@websocket_api.async_response
async def ws_set_item(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    try:
        await planner.async_set_item(msg["item_id"], msg["done"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown item")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/chore/save", vol.Optional("entry_id"): str,
    vol.Optional("chore_id"): vol.Any(str, None), vol.Required("title"): vol.All(str, vol.Length(min=1, max=120)),
    vol.Optional("assign", default={}): vol.All(
        {vol.All(str, vol.Length(max=80)): {vol.In(["1", "2", "3", "4", "5", "6", "7"]): RULE}}, vol.Length(max=50)),
    vol.Optional("points"): vol.All(vol.Coerce(int), vol.Range(min=0, max=1000)),
    vol.Optional("schedule"): vol.Any(None, vol.Schema({
        vol.Required("type"): vol.In(["interval", "monthly", "yearly", "once"]),
        vol.Optional("start"): vol.All(str, vol.Length(max=10)),
        vol.Optional("every"): vol.All(vol.Coerce(int), vol.Range(min=1, max=365)),
        vol.Optional("unit"): vol.In(["days", "weeks", "months", "years"]),
        vol.Optional("mode"): vol.In(["day", "weekday"]),
        vol.Optional("day"): vol.All(vol.Coerce(int), vol.Range(min=-1, max=31)),
        vol.Optional("nth"): vol.All(vol.Coerce(int), vol.Range(min=-1, max=5)),
        vol.Optional("weekday"): vol.All(vol.Coerce(int), vol.Range(min=1, max=7)),
        vol.Optional("dates"): vol.All([vol.All(str, vol.Length(max=10))], vol.Length(max=24)),
    })),
    vol.Optional("persons"): vol.All([vol.All(str, vol.Length(max=80))], vol.Length(max=20)),
    vol.Optional("rotate"): bool,
    vol.Optional("window"): vol.All(vol.Coerce(int), vol.Range(min=1, max=60)),
})
@websocket_api.async_response
async def ws_save_chore(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    try:
        if not _may_edit(connection, msg, planner):
            return
        cid = await planner.async_save_chore(msg.get("chore_id"), {
            "title": msg["title"], "assign": msg["assign"], "points": msg.get("points"),
            "schedule": msg.get("schedule"), "persons": msg.get("persons"), "rotate": msg.get("rotate"),
            "window": msg.get("window")})
    except ValueError as err:
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, str(err))
        return
    connection.send_result(msg["id"], {"chore_id": cid})


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/chore/delete", vol.Optional("entry_id"): str, vol.Required("chore_id"): str,
})
@websocket_api.async_response
async def ws_delete_chore(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _may_edit(connection, msg, planner):
        return
    await planner.async_delete_chore(msg["chore_id"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/person/update", vol.Optional("entry_id"): str,
    vol.Required("person_id"): str,
    vol.Optional("color"): vol.Match(r"^#[0-9A-Fa-f]{6}$"),
    vol.Optional("image"): vol.All(str, vol.Length(max=200)),
    vol.Optional("aliases"): vol.All([vol.All(str, vol.Length(max=40))], vol.Length(max=10)),
})
@websocket_api.async_response
async def ws_update_person(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Cosmetic person settings from the dashboard (name and calendar are changed in the options flow)."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _may_edit(connection, msg, planner):
        return
    patch = {k: msg[k] for k in ("color", "image", "aliases") if k in msg}
    try:
        await planner.async_update_person(msg["person_id"], patch)
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown person")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "family_planer/rollover", vol.Optional("entry_id"): str})
@websocket_api.async_response
async def ws_rollover(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    await planner.async_rollover()
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/person/upload_image", vol.Optional("entry_id"): str,
    vol.Required("person_id"): str, vol.Required("data"): vol.All(str, vol.Length(max=2_100_000)),
})
@websocket_api.async_response
async def ws_upload_image(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Own photo for a person (the card scales it to 320 px before sending)."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _may_edit(connection, msg, planner):
        return
    try:
        image = await planner.async_upload_image(msg["person_id"], msg["data"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown person")
        return
    except ValueError as err:
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, str(err))
        return
    connection.send_result(msg["id"], {"image": image})


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/list/refresh", vol.Optional("entry_id"): str,
    vol.Required("list_id"): str, vol.Optional("ai", default=True): bool,
})
@websocket_api.async_response
async def ws_list_refresh(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Optimise the categories of one list now (same as the daily run)."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    try:
        result = await planner.async_refresh_list(msg["list_id"], use_ai=msg["ai"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown list")
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/list/categories", vol.Optional("entry_id"): str,
    vol.Required("list_id"): str,
    vol.Required("categories"): vol.All([vol.Schema({
        vol.Optional("id"): vol.Any(str, None),
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
        vol.Optional("icon"): vol.Any(vol.All(str, vol.Length(max=60)), None),
    })], vol.Length(max=20)),
})
@websocket_api.async_response
async def ws_list_categories(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Rename, reorder, add or delete categories of a list."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _may_edit(connection, msg, planner):
        return
    try:
        await planner.async_set_categories(msg["list_id"], msg["categories"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown list")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/list/assign", vol.Optional("entry_id"): str,
    vol.Required("list_id"): str, vol.Required("item"): vol.All(str, vol.Length(min=1, max=255)),
    vol.Required("category_id"): str,
})
@websocket_api.async_response
async def ws_list_assign(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Move an item to another category; the list remembers it."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    try:
        await planner.async_assign(msg["list_id"], msg["item"], msg["category_id"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown list or category")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/reward/redeem", vol.Optional("entry_id"): str,
    vol.Required("person_id"): vol.All(str, vol.Length(max=80)), vol.Required("reward_id"): vol.All(str, vol.Length(max=40)),
})
@websocket_api.async_response
async def ws_redeem(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A family member redeems points for a reward (parents approve if required)."""
    from .rewards import RewardError
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    try:
        req = await planner.async_redeem(msg["person_id"], msg["reward_id"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown reward or person")
        return
    except RewardError as err:
        connection.send_error(msg["id"], "reward_" + str(err.args[0]), str(err.args[0]))
        return
    connection.send_result(msg["id"], {"status": req["status"]})


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/reward/decide", vol.Optional("entry_id"): str,
    vol.Required("request_id"): vol.All(str, vol.Length(max=40)), vol.Required("approve"): bool,
    vol.Optional("pin"): vol.All(str, vol.Length(max=12)),
})
@websocket_api.async_response
async def ws_decide(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _parent(connection, msg, planner):
        return
    try:
        req = await planner.async_decide(msg["request_id"], msg["approve"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown request")
        return
    connection.send_result(msg["id"], {"status": req["status"]})


@websocket_api.websocket_command({
    vol.Required("type"): "family_planer/points/adjust", vol.Optional("entry_id"): str,
    vol.Required("person_id"): vol.All(str, vol.Length(max=80)),
    vol.Required("points"): vol.All(vol.Coerce(int), vol.Range(min=-10000, max=10000)),
    vol.Optional("reason", default=""): vol.All(str, vol.Length(max=80)),
    vol.Optional("pin"): vol.All(str, vol.Length(max=12)),
})
@websocket_api.async_response
async def ws_adjust(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Parents give bonus points (or take some away)."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _parent(connection, msg, planner):
        return
    try:
        await planner.async_adjust_points(msg["person_id"], msg["points"], msg["reason"])
    except KeyError:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown person")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "family_planer/announce/test", vol.Optional("entry_id"): str})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_announce_test(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Speak the current reminder now (ignores time window and cooldown)."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    connection.send_result(msg["id"], {"message": await planner.announcer.async_check(force=True)})
