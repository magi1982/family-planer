"""Config and options flow for Family Planer.

Options are grouped by module:
  Wochenplan / Week plan   -> family members (colour, calendar, nicknames), day change, event matching
  Smarte Listen / Smart lists -> lists (any to-do entity), category limit, daily optimisation, AI task
"""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers import selector

from . import rewards, settings_spec, validate
from .const import (
    CONF_AI_TASK,
    CONF_ALIASES,
    CONF_AUTO,
    CONF_CALENDAR,
    CONF_COLOR,
    CONF_ENTITY,
    CONF_ICON,
    CONF_LIST,
    CONF_MATCH_NAMES,
    CONF_MAX_CATEGORIES,
    CONF_MODULES,
    CONF_NAME,
    CONF_OPTIMIZE_TIME,
    CONF_PERSON,
    CONF_PERSONS,
    CONF_ROLLOVER_TIME,
    CONF_SHOW_OWNER,
    CONF_TITLE,
    DOMAIN,
    LANGUAGES,
    MODULE_LISTS,
    MODULE_WEEK,
    MODULES,
    NAME,
    STYLES,
    THEME_MIGRATE,
    THEMES,
)

TODO_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="todo"))
CALENDAR_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="calendar"))
AI_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="ai_task"))
COLOR_SELECTOR = selector.TextSelector(selector.TextSelectorConfig(type=selector.TextSelectorType.COLOR))
TIME_SELECTOR = selector.TimeSelector()
ICON_SELECTOR = selector.IconSelector()
MAX_SELECTOR = selector.NumberSelector(selector.NumberSelectorConfig(
    min=5, max=20, step=1, mode=selector.NumberSelectorMode.SLIDER))
THEME_SELECTOR = selector.SelectSelector(selector.SelectSelectorConfig(
    options=list(THEMES), mode=selector.SelectSelectorMode.LIST, translation_key="theme"))
STYLE_SELECTOR = selector.SelectSelector(selector.SelectSelectorConfig(
    options=list(STYLES), mode=selector.SelectSelectorMode.LIST, translation_key="style"))
MOTION_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(
    domain="binary_sensor", device_class=["motion", "occupancy", "presence"], multiple=True))
NOTIFY_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="notify", multiple=True))
TTS_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="tts"))
PLAYERS_SELECTOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="media_player", multiple=True))
POINTS_SELECTOR = selector.NumberSelector(selector.NumberSelectorConfig(min=0, max=1000, step=1,
                                                                         mode=selector.NumberSelectorMode.BOX))
COST_SELECTOR = selector.NumberSelector(selector.NumberSelectorConfig(min=1, max=100000, step=1,
                                                                       mode=selector.NumberSelectorMode.BOX))
COOLDOWN_SELECTOR = selector.NumberSelector(selector.NumberSelectorConfig(
    min=5, max=720, step=5, unit_of_measurement="min", mode=selector.NumberSelectorMode.BOX))
WEEKLY_SELECTOR = selector.NumberSelector(selector.NumberSelectorConfig(min=0, max=50, step=1,
                                                                         mode=selector.NumberSelectorMode.BOX))
def num(lo: int, hi: int, unit: str | None = None, step: int = 1) -> selector.NumberSelector:
    return selector.NumberSelector(selector.NumberSelectorConfig(min=lo, max=hi, step=step, unit_of_measurement=unit,
                                                                 mode=selector.NumberSelectorMode.BOX))


PIN_SELECTOR = selector.TextSelector(selector.TextSelectorConfig(type=selector.TextSelectorType.PASSWORD))
MODULES_SELECTOR = selector.SelectSelector(selector.SelectSelectorConfig(
    options=list(MODULES), multiple=True, mode=selector.SelectSelectorMode.LIST, translation_key="modules"))


def _split(text: str | None) -> list[str]:
    return [p.strip() for p in (text or "").replace(";", ",").split(",") if p.strip()]


def _hhmm(value: str | None, default: str) -> str:
    parts = (value or default).split(":")
    return f"{int(parts[0]):02d}:{int(parts[1]) if len(parts) > 1 else 0:02d}"


def _list_schema(cur: dict | None, default_name: str) -> vol.Schema:
    cur = cur or {}
    return vol.Schema({
        vol.Required(CONF_NAME, default=cur.get("name", default_name)): str,
        vol.Required(CONF_ENTITY, description={"suggested_value": cur.get("entity")}): TODO_SELECTOR,
        vol.Optional(CONF_ICON, description={"suggested_value": cur.get("icon") or "mdi:cart-outline"}): ICON_SELECTOR,
        vol.Required(CONF_MAX_CATEGORIES, default=cur.get("max_categories", 10)): MAX_SELECTOR,
        vol.Required(CONF_AUTO, default=cur.get("auto", True)): bool,
    })


class FamilyPlanerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Setup: name and modules, then the members (week plan) and a first list (smart lists)."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}

    def _de(self) -> bool:
        return (self.hass.config.language or "").lower().startswith("de")

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        # a second planner duplicates every entity; ask once before going on
        if user_input is None and self._async_current_entries() and not getattr(self, "_second_ok", False):
            return await self.async_step_second()
        errors: dict[str, str] = {}
        if user_input is not None:
            chosen = user_input.get(CONF_MODULES) or []
            if not chosen:
                errors[CONF_MODULES] = "no_module"
            else:
                self._data = {CONF_TITLE: user_input[CONF_TITLE], CONF_MODULES: {m: m in chosen for m in MODULES},
                              CONF_PERSONS: [], "lists": []}
                return await self._next()
        schema = vol.Schema({
            vol.Required(CONF_TITLE, default=NAME): str,
            vol.Required(CONF_MODULES, default=list(MODULES)): MODULES_SELECTOR,
        })
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_second(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._second_ok = True
            return await self.async_step_user()
        names = ", ".join(e.title for e in self._async_current_entries())
        return self.async_show_form(step_id="second", data_schema=vol.Schema({}),
                                    description_placeholders={"names": names})

    async def _next(self) -> ConfigFlowResult:
        mods = self._data[CONF_MODULES]
        if mods[MODULE_WEEK] and not self._data.get("_week_done"):
            return await self.async_step_week()
        if mods[MODULE_LISTS] and not self._data.get("_lists_done"):
            return await self.async_step_lists()
        data = {k: v for k, v in self._data.items() if not k.startswith("_")}
        return self.async_create_entry(title=data.pop(CONF_TITLE), data=data)

    async def async_step_week(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            names = _split(user_input.get(CONF_PERSONS))
            if not names:
                errors[CONF_PERSONS] = "no_persons"
            elif len({n.lower() for n in names}) != len(names):
                errors[CONF_PERSONS] = "duplicate_person"
            else:
                self._data[CONF_PERSONS] = names
                self._data["_week_done"] = True
                return await self._next()
        return self.async_show_form(step_id="week", data_schema=vol.Schema({vol.Required(CONF_PERSONS): str}),
                                    errors=errors)

    async def async_step_lists(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            if user_input.get(CONF_ENTITY):
                self._data["lists"] = [{"name": user_input[CONF_NAME], "entity": user_input[CONF_ENTITY],
                                        "max_categories": int(user_input[CONF_MAX_CATEGORIES])}]
            self._data["_lists_done"] = True
            return await self._next()
        schema = vol.Schema({
            vol.Required(CONF_NAME, default="Einkaufen" if self._de() else "Groceries"): str,
            vol.Optional(CONF_ENTITY): TODO_SELECTOR,
            vol.Required(CONF_MAX_CATEGORIES, default=10): MAX_SELECTOR,
        })
        return self.async_show_form(step_id="lists", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry) -> OptionsFlow:
        return FamilyPlanerOptionsFlow()


class FamilyPlanerOptionsFlow(OptionsFlow):
    """Settings grouped by module."""

    def __init__(self) -> None:
        self._person_id: str | None = None
        self._list_id: str | None = None
        self._reward_id: str | None = None

    @property
    def _planner(self):
        return self.config_entry.runtime_data

    def _de(self) -> bool:
        return self._planner.lang == "de"

    def _done(self, reload: bool) -> ConfigFlowResult:
        if reload:
            self.hass.config_entries.async_schedule_reload(self.config_entry.entry_id)
        return self.async_create_entry(data=dict(self.config_entry.options))

    def _person_options(self) -> list[selector.SelectOptionDict]:
        return [selector.SelectOptionDict(value=pid, label=p["name"]) for pid, p in self._planner.persons_sorted()]

    def _list_options(self) -> list[selector.SelectOptionDict]:
        return [selector.SelectOptionDict(value=lid, label=lst["name"])
                for lid, lst in self._planner.data["lists"].items()]

    # ---------------------------------------------------------------- top level
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        menu = ["modules", "design"]
        if self._planner.module_on(MODULE_WEEK):
            menu.append("week")
        if self._planner.module_on(MODULE_LISTS):
            menu.append("lists")
        return self.async_show_menu(step_id="init", menu_options=menu)

    async def async_step_modules(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            chosen = user_input.get(CONF_MODULES) or []
            if not chosen:
                errors[CONF_MODULES] = "no_module"
            else:
                await self._planner.async_update_settings({CONF_MODULES: {m: m in chosen for m in MODULES}})
                return self._done(reload=True)
        cur = [m for m in MODULES if self._planner.module_on(m)]
        schema = vol.Schema({vol.Required(CONF_MODULES, default=cur): MODULES_SELECTOR})
        return self.async_show_form(step_id="modules", data_schema=schema, errors=errors)

    async def async_step_design(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        st = self._planner.settings
        panel = st.get("panel") or {}
        if user_input is not None:
            await self._planner.async_update_settings({
                "theme": user_input["theme"] if user_input.get("theme") in THEMES else "ha",
                "style": user_input["style"] if user_input.get("style") in STYLES else "standard",
                "panel": {"enabled": bool(user_input.get("panel")), "title": validate.text(user_input.get("panel_title"), 40)},
                "idle_seconds": validate.integer(user_input.get("idle_seconds"), 10, 600, 45),
                "language": user_input.get("language") if user_input.get("language") in LANGUAGES else "auto",
                "fullscreen_dblclick": bool(user_input.get("fullscreen_dblclick", True)),
                "fullscreen_auto": bool(user_input.get("fullscreen_auto", False)),
            })
            return self._done(reload=True)
        schema = vol.Schema({
            vol.Required("language", default=st.get("language") if st.get("language") in LANGUAGES else "auto"):
                selector.SelectSelector(selector.SelectSelectorConfig(options=list(LANGUAGES),
                                        mode=selector.SelectSelectorMode.LIST, translation_key="language")),
            vol.Required("theme", default=THEME_MIGRATE.get(st.get("theme"), st.get("theme")) if THEME_MIGRATE.get(st.get("theme"), st.get("theme")) in THEMES else "ha"): THEME_SELECTOR,
            vol.Required("style", default=st.get("style") if st.get("style") in STYLES else "standard"): STYLE_SELECTOR,
            vol.Required("panel", default=bool(panel.get("enabled", True))): bool,
            vol.Optional("panel_title", description={"suggested_value": panel.get("title") or self.config_entry.title}): str,
            vol.Required("idle_seconds", default=validate.integer(st.get("idle_seconds"), 10, 600, 45)): num(10, 600, "s"),
            vol.Required("fullscreen_dblclick", default=bool(st.get("fullscreen_dblclick", True))): bool,
            vol.Required("fullscreen_auto", default=bool(st.get("fullscreen_auto", False))): bool,
        })
        return self.async_show_form(step_id="design", data_schema=schema)

    # ---------------------------------------------------------------- module: week plan
    async def async_step_week(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_show_menu(step_id="week", menu_options=[
            "person_add", "person_select", "person_remove", "school", "vacation", "rewards", "announce",
            "week_settings"])

    # ---- holidays
    async def async_step_vacation(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        v = self._planner.vacation_settings()
        if user_input is not None:
            words = [validate.text(w, 40) for w in _split(user_input.get("words"))]
            old_refresh = v["refresh_minutes"]
            v.update(enabled=bool(user_input.get("enabled")), words=[w for w in words if w][:30],
                     scope=user_input.get("scope") if user_input.get("scope") in ("owner", "family") else "owner",
                     min_hours=validate.integer(user_input.get("min_hours"), 12, 24, 20),
                     refresh_minutes=validate.integer(user_input.get("refresh_minutes"), 15, 240, 30))
            await self._planner.async_update_settings({"vacation": v})
            self.hass.async_create_task(self._planner.async_refresh_away(apply=True, rescan=bool(user_input.get("rescan"))))
            return self._done(reload=v["refresh_minutes"] != old_refresh)
        scope = selector.SelectSelector(selector.SelectSelectorConfig(
            options=["owner", "family"], mode=selector.SelectSelectorMode.LIST, translation_key="vacation_scope"))
        schema = vol.Schema({
            vol.Required("enabled", default=v["enabled"]): bool,
            vol.Optional("words", description={"suggested_value": ", ".join(v["words"])}): str,
            vol.Required("scope", default=v["scope"]): scope,
            vol.Required("min_hours", default=v["min_hours"]): num(12, 24, "h"),
            vol.Required("refresh_minutes", default=v["refresh_minutes"]): num(15, 240, "min", 5),
            vol.Optional("rescan", default=False): bool,
        })
        return self.async_show_form(step_id="vacation", data_schema=schema)

    # ---- school timetable per person
    async def async_step_school(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._person_id = user_input[CONF_PERSON]
            return await self.async_step_school_edit()
        schema = vol.Schema({vol.Required(CONF_PERSON): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._person_options()))})
        return self.async_show_form(step_id="school", data_schema=schema)

    async def async_step_school_edit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        person = self._planner.data["persons"].get(self._person_id or "")
        if person is None:
            return self.async_abort(reason="unknown_person")
        from .planner import clean_school
        cur = clean_school(person.get("school"))
        days = ["mon", "tue", "wed", "thu", "fri", "sat"]
        errors: dict[str, str] = {}
        if user_input is not None:
            times = {}
            for i, d in enumerate(days, start=1):
                spans = []
                for sfx in ("", "2"):
                    a, b = user_input.get(f"{d}_start{sfx}"), user_input.get(f"{d}_end{sfx}")
                    if a and b:
                        a, b = validate.hhmm(a, ""), validate.hhmm(b, "")
                        if not (a and b and a < b) or any(not (b <= s[0] or a >= s[1]) for s in spans):
                            errors[f"{d}_end{sfx}"] = "bad_times"
                        spans.append([a, b])
                    elif a or b:
                        errors[f"{d}_end{sfx}"] = "bad_times"
                if spans:
                    times[str(i)] = spans
            if not errors:
                await self._planner.async_update_person(self._person_id, {"school": {
                    "calendar": user_input.get("school_calendar"), "times": times,
                    "travel": int(user_input.get("travel_minutes") or 0) if user_input.get("travel") else 0}})
                return self._done(reload=False)
        fields: dict = {vol.Optional("school_calendar", description={"suggested_value": cur["calendar"]}): CALENDAR_SELECTOR}
        for i, d in enumerate(days, start=1):
            spans = cur["times"].get(str(i)) or []
            for n, sfx in enumerate(("", "2")):
                span = spans[n] if n < len(spans) else [None, None]
                fields[vol.Optional(f"{d}_start{sfx}", description={"suggested_value": f"{span[0]}:00" if span[0] else None})] = TIME_SELECTOR
                fields[vol.Optional(f"{d}_end{sfx}", description={"suggested_value": f"{span[1]}:00" if span[1] else None})] = TIME_SELECTOR
        fields[vol.Required("travel", default=cur["travel"] > 0)] = bool
        fields[vol.Optional("travel_minutes", default=cur["travel"] or 15)] = selector.NumberSelector(
            selector.NumberSelectorConfig(min=1, max=240, step=1, unit_of_measurement="min", mode=selector.NumberSelectorMode.BOX))
        return self.async_show_form(step_id="school_edit", data_schema=vol.Schema(fields), errors=errors,
                                    description_placeholders={"name": person["name"]})

    # ---- rewards & gamification
    def _reward_options(self) -> list[selector.SelectOptionDict]:
        return [selector.SelectOptionDict(value=rid, label=f"{r['title']} ({r['cost']})")
                for rid, r in self._planner.data["rewards"].items()]

    def _reward_schema(self, cur: dict | None) -> vol.Schema:
        cur = cur or {}
        persons = selector.SelectSelector(selector.SelectSelectorConfig(options=self._person_options(), multiple=True))
        return vol.Schema({
            vol.Required("title", default=cur.get("title", "")): str,
            vol.Optional("icon", description={"suggested_value": cur.get("icon") or "mdi:gift-outline"}): ICON_SELECTOR,
            vol.Required("cost", default=cur.get("cost", 100)): COST_SELECTOR,
            vol.Required("approval", default=cur.get("approval", True)): bool,
            vol.Optional("persons", description={"suggested_value": cur.get("persons", [])}): persons,
            vol.Required("per_week", default=cur.get("per_week", 0)): WEEKLY_SELECTOR,
        })

    async def async_step_rewards(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_show_menu(step_id="rewards",
                                    menu_options=["reward_add", "reward_select", "reward_remove", "gamification"])

    async def async_step_reward_add(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            await self._planner.async_save_reward(None, user_input)
            return self._done(reload=False)
        return self.async_show_form(step_id="reward_add", data_schema=self._reward_schema(None))

    async def async_step_reward_select(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if not self._planner.data["rewards"]:
            return self.async_abort(reason="no_rewards")
        if user_input is not None:
            self._reward_id = user_input["reward"]
            return await self.async_step_reward_edit()
        schema = vol.Schema({vol.Required("reward"): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._reward_options()))})
        return self.async_show_form(step_id="reward_select", data_schema=schema)

    async def async_step_reward_edit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        cur = self._planner.data["rewards"].get(self._reward_id or "")
        if cur is None:
            return self.async_abort(reason="no_rewards")
        if user_input is not None:
            await self._planner.async_save_reward(self._reward_id, user_input)
            return self._done(reload=False)
        return self.async_show_form(step_id="reward_edit", data_schema=self._reward_schema(cur),
                                    description_placeholders={"name": cur["title"]})

    async def async_step_reward_remove(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if not self._planner.data["rewards"]:
            return self.async_abort(reason="no_rewards")
        if user_input is not None:
            await self._planner.async_remove_reward(user_input["reward"])
            return self._done(reload=False)
        schema = vol.Schema({vol.Required("reward"): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._reward_options()))})
        return self.async_show_form(step_id="reward_remove", data_schema=schema)

    async def async_step_gamification(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        g = self._planner.gamification()
        st = self._planner.settings
        errors: dict[str, str] = {}
        if user_input is not None:
            patch: dict[str, Any] = {
                "gamification": {**{k: validate.integer(user_input.get(k), 0, 1000, v) for k, v in g.items()},
                                 "mode": user_input.get("mode") if user_input.get("mode") in rewards.MODES else "fair"},
                "reward_notify": validate.entities(user_input.get("reward_notify"), ("notify",)),
                "reward_value": validate.number(user_input.get("reward_value"), 0, 100000, 20),
                "currency": validate.currency(user_input.get("currency")),
            }
            pin = (user_input.get("pin") or "").strip()
            if pin and not user_input.get("remove_pin") and not settings_spec.pin_valid(pin):
                errors["pin"] = "bad_pin"
            if not errors:
                rewards.sync_reward_costs(self._planner.data["rewards"], patch["gamification"])
                await self._planner.async_update_settings(patch)
                self._planner.book_points()
                if user_input.get("remove_pin"):
                    await self._planner.async_set_pin(None)  # back to the start PIN, must be changed again
                elif pin:
                    await self._planner.async_set_pin(pin)
                return self._done(reload=False)
        schema = vol.Schema({
            vol.Required("mode", default=self._planner.points_mode()): selector.SelectSelector(selector.SelectSelectorConfig(
                options=list(rewards.MODES), mode=selector.SelectSelectorMode.LIST, translation_key="points_mode")),
            vol.Required("day_points", default=g["day_points"]): POINTS_SELECTOR,
            vol.Required("default_points", default=g["default_points"]): POINTS_SELECTOR,
            vol.Required("day_bonus", default=g["day_bonus"]): POINTS_SELECTOR,
            vol.Required("streak_bonus", default=g["streak_bonus"]): POINTS_SELECTOR,
            vol.Required("reward_value", default=self._planner.sizes()["value"]): selector.NumberSelector(
                selector.NumberSelectorConfig(min=0, max=100000, step=0.5, mode=selector.NumberSelectorMode.BOX)),
            vol.Required("currency", default=self._planner.sizes()["currency"]): str,
            vol.Optional("pin"): PIN_SELECTOR,
            vol.Optional("remove_pin", default=False): bool,
            vol.Optional("reward_notify", description={"suggested_value": st.get("reward_notify") or []}): NOTIFY_SELECTOR,
        })
        return self.async_show_form(step_id="gamification", data_schema=schema, errors=errors,
                                    description_placeholders={"pin": "123456 ⚠" if self._planner.pin_default else "✓"})

    # ---- spoken reminders
    async def async_step_announce(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        from .announce import DEFAULT_ANNOUNCE
        cur = {**DEFAULT_ANNOUNCE, **(self._planner.settings.get("announce") or {})}
        errors: dict[str, str] = {}
        if user_input is not None:
            new = {
                "enabled": bool(user_input.get("enabled")),
                "motion": validate.entities(user_input.get("motion"), ("binary_sensor",)),
                "notify": validate.entities(user_input.get("notify"), ("notify",)),
                "tts": validate.entity(user_input.get("tts"), ("tts",)),
                "media_players": validate.entities(user_input.get("media_players"), ("media_player",)),
                "start": validate.hhmm(user_input.get("start"), "15:00"),
                "end": validate.hhmm(user_input.get("end"), "20:00"),
                "cooldown": validate.integer(user_input.get("cooldown"), 5, 720, 60),
                "all_done": bool(user_input.get("all_done")),
                "persons": [p for p in (user_input.get("persons") or []) if p in self._planner.data["persons"]],
                "queue": bool(user_input.get("queue")),
                "queue_start": validate.hhmm(user_input.get("queue_start"), "07:00"),
                "queue_end": validate.hhmm(user_input.get("queue_end"), "21:00"),
                "queue_rewards": bool(user_input.get("queue_rewards")),
                "queue_special": bool(user_input.get("queue_special")),
                "max_items": validate.integer(user_input.get("max_items"), 1, 10, 3),
                "reward_hours": validate.integer(user_input.get("reward_hours"), 0, 48, 0),
            }
            if new["enabled"] and not new["motion"]:
                errors["motion"] = "no_motion"
            elif new["enabled"] and not (new["notify"] or (new["tts"] and new["media_players"])):
                errors["base"] = "no_target"
            else:
                await self._planner.async_update_settings({"announce": new})
                return self._done(reload=True)
        persons = selector.SelectSelector(selector.SelectSelectorConfig(options=self._person_options(), multiple=True))
        schema = vol.Schema({
            vol.Required("enabled", default=cur["enabled"]): bool,
            vol.Optional("motion", description={"suggested_value": cur["motion"]}): MOTION_SELECTOR,
            vol.Optional("notify", description={"suggested_value": cur["notify"]}): NOTIFY_SELECTOR,
            vol.Optional("tts", description={"suggested_value": cur["tts"]}): TTS_SELECTOR,
            vol.Optional("media_players", description={"suggested_value": cur["media_players"]}): PLAYERS_SELECTOR,
            vol.Required("start", default=f"{cur['start']}:00"): TIME_SELECTOR,
            vol.Required("end", default=f"{cur['end']}:00"): TIME_SELECTOR,
            vol.Required("cooldown", default=cur["cooldown"]): COOLDOWN_SELECTOR,
            vol.Required("all_done", default=cur["all_done"]): bool,
            vol.Optional("persons", description={"suggested_value": cur["persons"]}): persons,
            vol.Required("queue", default=cur["queue"]): bool,
            vol.Required("queue_start", default=f"{cur['queue_start']}:00"): TIME_SELECTOR,
            vol.Required("queue_end", default=f"{cur['queue_end']}:00"): TIME_SELECTOR,
            vol.Required("queue_rewards", default=cur["queue_rewards"]): bool,
            vol.Required("queue_special", default=cur["queue_special"]): bool,
            vol.Required("max_items", default=cur["max_items"]): num(1, 10),
            vol.Required("reward_hours", default=cur["reward_hours"]): num(0, 48, "h"),
        })
        return self.async_show_form(step_id="announce", data_schema=schema, errors=errors)

    async def async_step_week_settings(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        st = self._planner.settings
        if user_input is not None:
            new_time = validate.hhmm(_hhmm(user_input.get(CONF_ROLLOVER_TIME), "00:00"), "00:00")
            reload = new_time != st.get(CONF_ROLLOVER_TIME)
            await self._planner.async_update_settings({
                CONF_ROLLOVER_TIME: new_time,
                CONF_MATCH_NAMES: bool(user_input.get(CONF_MATCH_NAMES)),
                CONF_SHOW_OWNER: bool(user_input.get(CONF_SHOW_OWNER)),
                "admin_only_edit": bool(user_input.get("admin_only_edit")),
                "reliability_days": validate.integer(user_input.get("reliability_days"), 7, 90, 30),
                "school_gap": validate.integer(user_input.get("school_gap"), 0, 240, 0),
                "school_window": validate.integer(user_input.get("school_window"), 0, 240, 60),
                "todos": {"confirm": bool(user_input.get("todo_confirm", True)),
                          "points": validate.integer(user_input.get("todo_points"), 0, 1000, 0),
                          "keep_days": validate.integer(user_input.get("todo_keep_days"), 0, 30, 1)},
            })
            if reload:
                await self._planner.async_rollover()
            return self._done(reload=reload)
        schema = vol.Schema({
            vol.Required(CONF_ROLLOVER_TIME, default=f"{st.get(CONF_ROLLOVER_TIME, '00:00')}:00"): TIME_SELECTOR,
            vol.Required(CONF_MATCH_NAMES, default=bool(st.get(CONF_MATCH_NAMES, True))): bool,
            vol.Required(CONF_SHOW_OWNER, default=bool(st.get(CONF_SHOW_OWNER, False))): bool,
            vol.Required("admin_only_edit", default=bool(st.get("admin_only_edit", False))): bool,
            vol.Required("reliability_days", default=validate.integer(st.get("reliability_days"), 7, 90, 30)): num(7, 90, "d"),
            vol.Required("school_gap", default=validate.integer(st.get("school_gap"), 0, 240, 0)): num(0, 240, "min"),
            vol.Required("school_window", default=validate.integer(st.get("school_window", 60), 0, 240, 60)): num(0, 240, "min"),
            vol.Required("todo_confirm", default=self._planner.todo_settings()["confirm"]): bool,
            vol.Required("todo_points", default=self._planner.todo_settings()["points"]): num(0, 1000),
            vol.Required("todo_keep_days", default=self._planner.todo_settings()["keep_days"]): num(0, 30, "d"),
        })
        return self.async_show_form(step_id="week_settings", data_schema=schema)

    async def async_step_person_add(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if not name:
                errors[CONF_NAME] = "no_persons"
            elif self._planner.person_by_name(name):
                errors[CONF_NAME] = "duplicate_person"
            else:
                await self._planner.async_add_person(
                    name, color=user_input.get(CONF_COLOR), calendar=user_input.get(CONF_CALENDAR),
                    aliases=_split(user_input.get(CONF_ALIASES)))
                return self._done(reload=True)
        schema = vol.Schema({
            vol.Required(CONF_NAME): str,
            vol.Optional(CONF_COLOR): COLOR_SELECTOR,
            vol.Optional(CONF_CALENDAR): CALENDAR_SELECTOR,
            vol.Optional(CONF_ALIASES): str,
        })
        return self.async_show_form(step_id="person_add", data_schema=schema, errors=errors)

    async def async_step_person_select(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._person_id = user_input[CONF_PERSON]
            return await self.async_step_person_edit()
        schema = vol.Schema({vol.Required(CONF_PERSON): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._person_options()))})
        return self.async_show_form(step_id="person_select", data_schema=schema)

    async def async_step_person_edit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        person = self._planner.data["persons"].get(self._person_id or "")
        if person is None:
            return self.async_abort(reason="unknown_person")
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            other = self._planner.person_by_name(name)
            if not name:
                errors[CONF_NAME] = "no_persons"
            elif other and other != self._person_id:
                errors[CONF_NAME] = "duplicate_person"
            else:
                renamed = name != person["name"]
                await self._planner.async_update_person(self._person_id, {
                    "name": name,
                    "color": user_input.get(CONF_COLOR) or person.get("color"),
                    "calendar": user_input.get(CONF_CALENDAR) or None,
                    "aliases": _split(user_input.get(CONF_ALIASES)),
                })
                return self._done(reload=renamed)
        schema = vol.Schema({
            vol.Required(CONF_NAME, default=person["name"]): str,
            vol.Optional(CONF_COLOR, description={"suggested_value": person.get("color")}): COLOR_SELECTOR,
            vol.Optional(CONF_CALENDAR, description={"suggested_value": person.get("calendar")}): CALENDAR_SELECTOR,
            vol.Optional(CONF_ALIASES, description={"suggested_value": ", ".join(person.get("aliases", []))}): str,
        })
        return self.async_show_form(step_id="person_edit", data_schema=schema, errors=errors,
                                    description_placeholders={"name": person["name"]})

    async def async_step_person_remove(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            await self._planner.async_remove_person(user_input[CONF_PERSON])
            return self._done(reload=True)
        schema = vol.Schema({vol.Required(CONF_PERSON): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._person_options()))})
        return self.async_show_form(step_id="person_remove", data_schema=schema)

    # ---------------------------------------------------------------- module: smart lists
    async def async_step_lists(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_show_menu(step_id="lists",
                                    menu_options=["list_add", "list_select", "list_remove", "lists_settings"])

    def _list_spec(self, user_input: dict[str, Any]) -> dict[str, Any]:
        return {"name": user_input[CONF_NAME].strip(), "entity": user_input[CONF_ENTITY],
                "icon": user_input.get(CONF_ICON) or "", "max_categories": int(user_input[CONF_MAX_CATEGORIES]),
                "auto": bool(user_input.get(CONF_AUTO, True))}

    async def async_step_list_add(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            await self._planner.async_save_list(None, self._list_spec(user_input))
            return self._done(reload=False)
        return self.async_show_form(step_id="list_add",
                                    data_schema=_list_schema(None, "Einkaufen" if self._de() else "Groceries"))

    async def async_step_list_select(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._list_id = user_input[CONF_LIST]
            return await self.async_step_list_edit()
        schema = vol.Schema({vol.Required(CONF_LIST): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._list_options()))})
        return self.async_show_form(step_id="list_select", data_schema=schema)

    async def async_step_list_edit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        lst = self._planner.data["lists"].get(self._list_id or "")
        if lst is None:
            return self.async_abort(reason="unknown_list")
        if user_input is not None:
            await self._planner.async_save_list(self._list_id, self._list_spec(user_input))
            return self._done(reload=False)
        return self.async_show_form(step_id="list_edit", data_schema=_list_schema(lst, lst["name"]),
                                    description_placeholders={"name": lst["name"]})

    async def async_step_list_remove(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            await self._planner.async_remove_list(user_input[CONF_LIST])
            return self._done(reload=False)
        schema = vol.Schema({vol.Required(CONF_LIST): selector.SelectSelector(
            selector.SelectSelectorConfig(options=self._list_options()))})
        return self.async_show_form(step_id="list_remove", data_schema=schema)

    async def async_step_lists_settings(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        st = self._planner.settings
        if user_input is not None:
            await self._planner.async_update_settings({
                CONF_OPTIMIZE_TIME: _hhmm(user_input.get(CONF_OPTIMIZE_TIME), "03:00"),
                CONF_AI_TASK: user_input.get(CONF_AI_TASK) or None,
                "prune_days": validate.integer(user_input.get("prune_days"), 7, 365, 30),
            })
            return self._done(reload=True)
        schema = vol.Schema({
            vol.Required(CONF_OPTIMIZE_TIME, default=f"{st.get(CONF_OPTIMIZE_TIME, '03:00')}:00"): TIME_SELECTOR,
            vol.Optional(CONF_AI_TASK, description={"suggested_value": st.get(CONF_AI_TASK)}): AI_SELECTOR,
            vol.Required("prune_days", default=validate.integer(st.get("prune_days"), 7, 365, 30)): num(7, 365, "d"),
        })
        return self.async_show_form(step_id="lists_settings", data_schema=schema)
