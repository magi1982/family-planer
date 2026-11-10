"""Constants for Family Planer."""
from __future__ import annotations

DOMAIN = "family_planer"
NAME = "Family Planer"
VERSION = "0.8.0"
STORAGE_VERSION = 1

# modules (can be switched on/off; more will follow)
MODULE_WEEK = "week"      # "Wochenplan": chores + calendars + reliability
MODULE_LISTS = "lists"    # "Smarte Listen": self-organising shopping / to-do lists
MODULES = (MODULE_WEEK, MODULE_LISTS)

CONF_TITLE = "title"
CONF_MODULES = "modules"
CONF_PERSONS = "persons"
CONF_NAME = "name"
CONF_COLOR = "color"
CONF_CALENDAR = "calendar"
CONF_ALIASES = "aliases"
CONF_PERSON = "person"
CONF_ROLLOVER_TIME = "rollover_time"
CONF_MATCH_NAMES = "match_names"
CONF_SHOW_OWNER = "show_owner"
CONF_LIST = "list"
CONF_ENTITY = "entity"
CONF_ICON = "icon"
CONF_MAX_CATEGORIES = "max_categories"
CONF_AUTO = "auto"
CONF_OPTIMIZE_TIME = "optimize_time"
CONF_AI_TASK = "ai_task"

DEFAULT_SETTINGS = {
    CONF_MODULES: {MODULE_WEEK: True, MODULE_LISTS: True},
    CONF_ROLLOVER_TIME: "00:00",
    CONF_MATCH_NAMES: True,
    CONF_SHOW_OWNER: False,
    CONF_OPTIMIZE_TIME: "03:00",
    CONF_AI_TASK: None,
    "theme": "loxone",
    "language": "auto",
    "admin_only_edit": False,
    "panel": {"enabled": True, "title": ""},
}

LANGUAGES = ("auto", "de", "en")

SIGNAL_UPDATE = f"{DOMAIN}_update_{{}}"
URL_BASE = "/family_planer_static"
FILES_URL = "/family_planer_files"
FILES_DIR = "family_planer"
CARDS_FILE = "family-planer-cards.js"
PANEL_URL = "family-planer"
THEMES = ("loxone", "ha", "apple", "google", "light", "nord")
MAX_IMAGE_BYTES = 1_500_000

DEFAULT_COLORS = ["#C771D6", "#4FA3E0", "#E0A84F", "#E06B9B", "#4FD1C5", "#69C350", "#7A7FE8", "#E06B6B"]
