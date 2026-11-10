"""Websocket API used by the Family Planer dashboard cards."""
from __future__ import annotations

import secrets
import time
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


PIN_ERRORS = {"wrong": "Wrong parent PIN", "locked": "Too many wrong PINs – try again in 5 minutes",
              "change_required": "The start PIN must be changed first", "bad_pin": "The new PIN is not valid"}
TOKEN_TTL = 600  # seconds a PIN unlock stays valid (refreshed on every use)
_TOKENS: dict[str, tuple[str, float]] = {}  # token -> (entry_id, expiry); module level so it survives reloads


def _issue_token(entry_id: str) -> str:
    now = time.monotonic()
    for tok, (_eid, exp) in list(_TOKENS.items()):
        if exp < now:
            _TOKENS.pop(tok, None)
    while len(_TOKENS) >= 20:
        _TOKENS.pop(next(iter(_TOKENS)))
    token = secrets.token_urlsafe(32)
    _TOKENS[token] = (entry_id, now + TOKEN_TTL)
    return token


def _token_ok(entry_id: str, token: Any) -> bool:
    if not isinstance(token, str):
        return False
    now = time.monotonic()
    for tok, (eid, exp) in list(_TOKENS.items()):
        if secrets.compare_digest(tok, token):
            if exp < now or eid != entry_id:
                return False
            _TOKENS[tok] = (eid, now + TOKEN_TTL)
            return True
    return False


def _pin_error(connection: websocket_api.ActiveConnection, msg: dict[str, Any], res: str) -> None:
    connection.send_error(msg["id"], "pin_" + res, PIN_ERRORS.get(res, res))


def _unlocked(connection: websocket_api.ActiveConnection, msg: dict[str, Any], planner) -> bool:
    """Settings and reward changes: always the parent PIN (as a short-lived unlock token)."""
    if planner.pin_default:
        _pin_error(connection, msg, "change_required")
        return False
    if _token_ok(planner.entry.entry_id, msg.get("token")):
        return True
    connection.send_error(msg["id"], "pin_required", "Parent PIN required")
    return False


async def _parent(connection: websocket_api.ActiveConnection, msg: dict[str, Any], planner) -> bool:
    """Approving rewards and changing points: an administrator, an unlock token or the parent PIN."""
    if connection.user.is_admin or (not planner.pin_default and _token_ok(planner.entry.entry_id, msg.get("token"))):
        return True
    res = await planner.async_check_pin(msg.get("pin"))
    if res == "ok":
        return True
    _pin_error(connection, msg, res)
    return False


def _not_found(connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Family Planer is not set up")


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    for handler in (ws_subscribe, ws_set_item, ws_save_chore, ws_delete_chore, ws_update_person, ws_rollover,
                    ws_upload_image, ws_list_refresh, ws_list_categories, ws_list_assign,
                    ws_redeem, ws_decide, ws_adjust, ws_announce_test,
                    ws_pin_unlock, ws_pin_change, ws_settings_get, ws_settings_save, ws_person_save, ws_person_remove,
                    ws_list_save, ws_list_remove, ws_reward_save, ws_reward_remove,
                    ws_todo_save, ws_todo_set, ws_todo_delete):
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
        # while the entry reloads (new settings), tell the card to subscribe again
        payload = {"reload": True} if planner.closing else planner.snapshot()
        connection.send_message(websocket_api.event_message(msg["id"], payload))

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
    vol.Optional("pin"): vol.All(str, vol.Length(max=12)), vol.Optional("token"): vol.All(str, vol.Length(max=64)),
})
@websocket_api.async_response
async def ws_decide(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not await _parent(connection, msg, planner):
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
    vol.Optional("pin"): vol.All(str, vol.Length(max=12)), vol.Optional("token"): vol.All(str, vol.Length(max=64)),
})
@websocket_api.async_response
async def ws_adjust(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Parents give bonus points (or take some away)."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not await _parent(connection, msg, planner):
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


# ---------------------------------------------------------------------- parent PIN, settings page, rewards
TOKEN = vol.All(str, vol.Length(max=64))
ID = vol.All(str, vol.Length(max=40))
DATA = vol.All(dict, vol.Length(max=60))


def _reload_if(hass: HomeAssistant, planner, flags: set[str]) -> None:
    if "reload" in flags:
        hass.config_entries.async_schedule_reload(planner.entry.entry_id)


@websocket_api.websocket_command({vol.Required("type"): "family_planer/pin/unlock", vol.Optional("entry_id"): str,
                                  vol.Required("pin"): vol.All(str, vol.Length(max=12))})
@websocket_api.async_response
async def ws_pin_unlock(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Check the parent PIN once and hand out a short-lived unlock token."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    res = await planner.async_check_pin(msg["pin"])
    if res != "ok":
        _pin_error(connection, msg, res)
        return
    connection.send_result(msg["id"], {"token": _issue_token(planner.entry.entry_id), "ttl": TOKEN_TTL})


@websocket_api.websocket_command({vol.Required("type"): "family_planer/pin/change", vol.Optional("entry_id"): str,
                                  vol.Required("old"): vol.All(str, vol.Length(max=12)),
                                  vol.Required("new"): vol.All(str, vol.Length(max=12))})
@websocket_api.async_response
async def ws_pin_change(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    res = await planner.async_change_pin(msg["old"], msg["new"])
    if res != "ok":
        _pin_error(connection, msg, res)
        return
    connection.send_result(msg["id"], {"token": _issue_token(planner.entry.entry_id), "ttl": TOKEN_TTL})


@websocket_api.websocket_command({vol.Required("type"): "family_planer/settings/get", vol.Optional("entry_id"): str,
                                  vol.Required("token"): TOKEN})
@callback
def ws_settings_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if _unlocked(connection, msg, planner):
        connection.send_result(msg["id"], planner.settings_view())


@websocket_api.websocket_command({vol.Required("type"): "family_planer/settings/save", vol.Optional("entry_id"): str,
                                  vol.Required("token"): TOKEN, vol.Required("section"): vol.In(
                                      ["general", "vacation", "points", "announce", "lists_settings", "todos"]),
                                  vol.Required("data"): DATA})
@websocket_api.async_response
async def ws_settings_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    from .settings_spec import SettingsError
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    try:
        flags = await planner.async_save_section(msg["section"], msg["data"])
    except SettingsError as err:
        connection.send_error(msg["id"], "invalid_" + err.key, err.field)
        return
    connection.send_result(msg["id"], {"reload": "reload" in flags})
    _reload_if(hass, planner, flags)


@websocket_api.websocket_command({vol.Required("type"): "family_planer/settings/person", vol.Optional("entry_id"): str,
                                  vol.Required("token"): TOKEN, vol.Optional("person_id"): ID,
                                  vol.Required("data"): DATA})
@websocket_api.async_response
async def ws_person_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Add or edit a family member: name, colour, calendar, nicknames, school."""
    from . import validate
    from .settings_spec import SettingsError, school
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    data = msg["data"]
    name = validate.text(data.get("name"), 40)
    pid = msg.get("person_id")
    other = planner.person_by_name(name) if name else None
    if not name or (other and other != pid):
        connection.send_error(msg["id"], "invalid_name", "name")
        return
    try:
        patch: dict[str, Any] = {"name": name}
        for key in ("color", "calendar"):
            if key in data:
                patch[key] = data[key]
        if "aliases" in data:
            patch["aliases"] = data["aliases"] if isinstance(data["aliases"], list) else []
        if "school" in data:
            patch["school"] = school(data["school"] or {})
    except SettingsError as err:
        connection.send_error(msg["id"], "invalid_" + err.key, err.field)
        return
    reload = True
    if pid:
        if pid not in planner.data["persons"]:
            connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown person")
            return
        reload = name != planner.data["persons"][pid]["name"]
        await planner.async_update_person(pid, patch)
    else:
        pid = await planner.async_add_person(name)
        await planner.async_update_person(pid, patch)
    connection.send_result(msg["id"], {"person_id": pid, "reload": reload})
    _reload_if(hass, planner, {"reload"} if reload else set())


@websocket_api.websocket_command({vol.Required("type"): "family_planer/settings/person_remove",
                                  vol.Optional("entry_id"): str, vol.Required("token"): TOKEN,
                                  vol.Required("person_id"): ID})
@websocket_api.async_response
async def ws_person_remove(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    if len(planner.data["persons"]) <= 1 or msg["person_id"] not in planner.data["persons"]:
        connection.send_error(msg["id"], "invalid_last_person", "person_id")
        return
    await planner.async_remove_person(msg["person_id"])
    connection.send_result(msg["id"], {"reload": True})
    _reload_if(hass, planner, {"reload"})


@websocket_api.websocket_command({vol.Required("type"): "family_planer/settings/list", vol.Optional("entry_id"): str,
                                  vol.Required("token"): TOKEN, vol.Optional("list_id"): ID,
                                  vol.Required("data"): DATA})
@websocket_api.async_response
async def ws_list_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    from . import validate
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    data = msg["data"]
    spec = {"name": validate.text(data.get("name"), 40), "entity": validate.entity(data.get("entity"), ("todo",)),
            "icon": validate.icon(data.get("icon"), "mdi:cart-outline"),
            "max_categories": validate.integer(data.get("max_categories"), 5, 20, 10), "auto": bool(data.get("auto", True))}
    if not spec["name"] or not spec["entity"]:
        connection.send_error(msg["id"], "invalid_list", "entity" if spec["name"] else "name")
        return
    list_id = msg.get("list_id")
    if list_id and list_id not in planner.data["lists"]:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown list")
        return
    lid = await planner.async_save_list(list_id, spec)
    connection.send_result(msg["id"], {"list_id": lid})


@websocket_api.websocket_command({vol.Required("type"): "family_planer/settings/list_remove",
                                  vol.Optional("entry_id"): str, vol.Required("token"): TOKEN,
                                  vol.Required("list_id"): ID})
@websocket_api.async_response
async def ws_list_remove(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    await planner.async_remove_list(msg["list_id"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "family_planer/reward/save", vol.Optional("entry_id"): str,
                                  vol.Required("token"): TOKEN, vol.Optional("reward_id"): ID,
                                  vol.Required("data"): DATA})
@websocket_api.async_response
async def ws_reward_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Add or change a reward from the dashboard – always with the parent PIN."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    rid = msg.get("reward_id")
    if rid and rid not in planner.data["rewards"]:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown reward")
        return
    rid = await planner.async_save_reward(rid, msg["data"])
    connection.send_result(msg["id"], {"reward_id": rid})


@websocket_api.websocket_command({vol.Required("type"): "family_planer/reward/remove", vol.Optional("entry_id"): str,
                                  vol.Required("token"): TOKEN, vol.Required("reward_id"): ID})
@websocket_api.async_response
async def ws_reward_remove(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _unlocked(connection, msg, planner):
        return
    await planner.async_remove_reward(msg["reward_id"])
    connection.send_result(msg["id"])


# ---------------------------------------------------------------------- to-dos without a date
@websocket_api.websocket_command({vol.Required("type"): "family_planer/todo/save", vol.Optional("entry_id"): str,
                                  vol.Optional("todo_id"): ID, vol.Required("person_id"): ID,
                                  vol.Required("title"): vol.All(str, vol.Length(max=200)),
                                  vol.Optional("points"): vol.All(vol.Coerce(int), vol.Range(min=0, max=1000)),
                                  vol.Optional("token"): TOKEN})
@websocket_api.async_response
async def ws_todo_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Anyone who may edit the plan can add to-dos; own points per to-do need the parent PIN."""
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _may_edit(connection, msg, planner):
        return
    tid = msg.get("todo_id")
    if tid and tid not in planner.data["todos"]:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown to-do")
        return
    may_points = not planner.pin_default and _token_ok(planner.entry.entry_id, msg.get("token"))
    if "points" in msg and not may_points:
        connection.send_error(msg["id"], "pin_required", "Parent PIN required for points")
        return
    try:
        tid = await planner.async_save_todo(tid, msg, may_points)
    except (KeyError, ValueError):
        connection.send_error(msg["id"], "invalid_todo", "title or person")
        return
    connection.send_result(msg["id"], {"todo_id": tid})


@websocket_api.websocket_command({vol.Required("type"): "family_planer/todo/set", vol.Optional("entry_id"): str,
                                  vol.Required("todo_id"): ID, vol.Required("done"): bool})
@websocket_api.async_response
async def ws_todo_set(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if msg["todo_id"] not in planner.data["todos"]:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown to-do")
        return
    await planner.async_set_todo(msg["todo_id"], msg["done"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "family_planer/todo/delete", vol.Optional("entry_id"): str,
                                  vol.Required("todo_id"): ID})
@websocket_api.async_response
async def ws_todo_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    planner = _planner(hass, msg)
    if planner is None:
        _not_found(connection, msg)
        return
    if not _may_edit(connection, msg, planner):
        return
    await planner.async_delete_todo(msg["todo_id"])
    connection.send_result(msg["id"])
