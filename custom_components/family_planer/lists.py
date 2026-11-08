"""Smart lists: self-organising categories for any to-do list (no Home Assistant imports, unit-testable).

A list keeps its own categories:   {"id", "name", "icon", "kb", "keywords": [...], "last_used": iso date}
and learned assignments:           {normalized item name: category id}

Matching order for an item: learned assignment -> custom keywords of a category -> built-in knowledge
base (category with the same "kb" key). Everything else is "uncategorized" and is handled by `optimize`,
which creates categories from the knowledge base or an AI suggestion but never exceeds `max_categories`.
"""
from __future__ import annotations

from dataclasses import dataclass, field
import re
import secrets

OTHER = "other"
MIN_CATEGORIES = 5
MAX_CATEGORIES = 20
PRUNE_AFTER_DAYS = 30

# key, German name, English name, icon, keywords (lower case, German + English; compounds match by suffix)
KB: list[tuple[str, str, str, str, tuple[str, ...]]] = [
    ("produce", "Obst & Gemüse", "Fruit & vegetables", "mdi:food-apple", (
        "apfel", "äpfel", "birne", "banane", "orange", "mandarine", "zitrone", "limette", "traube", "beere", "erdbeere",
        "himbeere", "heidelbeere", "kiwi", "mango", "ananas", "melone", "pfirsich", "nektarine", "aprikose", "pflaume",
        "kirsche", "avocado", "tomate", "gurke", "salat", "rucola", "spinat", "karotte", "rüebli", "möhre", "kartoffel",
        "zwiebel", "knoblauch", "peperoni", "paprika", "zucchetti", "zucchini", "aubergine", "brokkoli", "broccoli",
        "blumenkohl", "kohl", "lauch", "sellerie", "fenchel", "pilz", "champignon", "radieschen", "mais", "kürbis",
        "ingwer", "petersilie", "basilikum", "schnittlauch", "koriander", "frühlingszwiebel", "süsskartoffel", "randen",
        "apple", "pear", "banana", "lemon", "lime", "grape", "berry", "berries", "tomato", "cucumber", "lettuce",
        "spinach", "carrot", "potato", "onion", "garlic", "pepper", "mushroom", "herbs", "vegetable", "fruit", "gemüse",
        "obst")),
    ("bakery", "Brot & Backwaren", "Bread & bakery", "mdi:baguette", (
        "brot", "zopf", "brötchen", "weggli", "gipfeli", "croissant", "toast", "baguette", "bagel", "semmel",
        "laugen", "knäcke", "wraps", "tortilla", "kuchen", "bread", "bun", "rolls")),
    ("dairy", "Milchprodukte & Eier", "Dairy & eggs", "mdi:cheese", (
        "milch", "joghurt", "jogurt", "quark", "rahm", "sahne", "butter", "käse", "mozzarella", "parmesan", "feta",
        "mascarpone", "ricotta", "frischkäse", "hüttenkäse", "eier", "ei", "skyr", "kefir", "milk", "yogurt", "yoghurt",
        "cream", "cheese", "eggs", "egg")),
    ("meat", "Fleisch & Fisch", "Meat & fish", "mdi:food-steak", (
        "fleisch", "hack", "poulet", "hähnchen", "huhn", "rind", "schwein", "kalb", "lamm", "wurst", "würstchen",
        "cervelat", "schinken", "speck", "salami", "aufschnitt", "steak", "schnitzel", "lachs", "thon", "fisch",
        "crevetten", "garnelen", "meat", "chicken", "beef", "pork", "ham", "bacon", "sausage", "salmon", "fish",
        "shrimp", "tuna")),
    ("frozen", "Tiefkühl", "Frozen", "mdi:snowflake", (
        "tiefkühl", "tk", "glace", "eis", "pommes", "frites", "fischstäbchen", "frozen", "ice cream")),
    ("pantry", "Vorrat & Konserven", "Pantry", "mdi:pasta", (
        "nudeln", "pasta", "spaghetti", "penne", "reis", "risotto", "couscous", "bulgur", "linsen", "bohnen",
        "kichererbsen", "mehl", "zucker", "hefe", "backpulver", "haferflocken", "müesli", "müsli", "cornflakes",
        "konserve", "dose", "pelati", "tomatenmark", "passata", "bouillon", "brühe", "suppe", "öl", "olivenöl",
        "essig", "honig", "konfi", "konfitüre", "marmelade", "nutella", "erdnussbutter", "nüsse", "mandeln",
        "rice", "flour", "sugar", "oats", "cereal", "beans", "lentils", "canned", "oil", "vinegar", "honey", "jam")),
    ("spices", "Gewürze & Saucen", "Spices & sauces", "mdi:shaker-outline", (
        "salz", "pfeffer", "gewürz", "curry", "zimt", "paprikapulver", "oregano", "senf", "ketchup", "mayonnaise",
        "mayo", "sauce", "sosse", "sojasauce", "aromat", "maggi", "salt", "spice", "mustard", "dressing")),
    ("sweets", "Süsses & Snacks", "Sweets & snacks", "mdi:candy", (
        "schokolade", "schoggi", "guetzli", "kekse", "chips", "snack", "bonbon", "gummibärchen", "riegel", "popcorn",
        "salzstangen", "nüssli", "chocolate", "cookies", "candy", "crisps", "biscuits")),
    ("drinks", "Getränke", "Drinks", "mdi:bottle-soda-classic-outline", (
        "wasser", "mineral", "saft", "sirup", "cola", "limonade", "eistee", "tee", "kaffee", "kapseln", "bier", "wein",
        "prosecco", "smoothie", "water", "juice", "soda", "coffee", "tea", "beer", "wine")),
    ("drugstore", "Drogerie & Hygiene", "Toiletries", "mdi:lotion-outline", (
        "zahnpasta", "zahnbürste", "shampoo", "duschgel", "seife", "deo", "creme", "lotion", "sonnencreme",
        "rasierer", "binden", "tampons", "wattestäbchen", "watte", "taschentücher", "toilettenpapier", "wc-papier",
        "windeln", "feuchttücher", "pflaster", "toothpaste", "soap", "deodorant", "tissues", "toilet paper",
        "diapers")),
    ("household", "Haushalt & Putzen", "Household & cleaning", "mdi:spray-bottle", (
        "waschmittel", "weichspüler", "spülmittel", "geschirrspüler", "tabs", "putzmittel", "reiniger", "schwamm",
        "lappen", "abfallsack", "müllbeutel", "kehrichtsack", "alufolie", "frischhaltefolie", "backpapier",
        "haushaltpapier", "küchenrolle", "batterien", "kerzen", "detergent", "dish soap", "cleaner", "sponge",
        "trash bags", "foil", "batteries", "candles")),
    ("pets", "Tierbedarf", "Pets", "mdi:paw", (
        "katzenfutter", "hundefutter", "futter", "streu", "einstreu", "heu", "leckerli", "nager", "ratten",
        "pet food", "cat food", "dog food", "litter")),
    ("tools", "Werkzeug", "Tools", "mdi:hammer-wrench", (
        "hammer", "schraubenzieher", "schraubendreher", "zange", "bohrer", "bit", "säge", "meter", "wasserwaage",
        "cutter", "akku", "werkzeug", "screwdriver", "drill", "saw", "pliers", "tool")),
    ("fixings", "Schrauben & Befestigung", "Fasteners", "mdi:screw-flat-top", (
        "schraube", "dübel", "nagel", "mutter", "unterlagsscheibe", "kabelbinder", "haken", "klebeband", "tape",
        "silikon", "leim", "kleber", "screw", "nail", "anchor", "glue")),
    ("paint", "Farbe & Lack", "Paint", "mdi:format-paint", (
        "farbe", "lack", "grundierung", "pinsel", "roller", "abdeckband", "abdeckfolie", "spachtel", "paint", "brush")),
    ("garden", "Garten", "Garden", "mdi:flower", (
        "erde", "dünger", "samen", "pflanze", "blumen", "topf", "rasen", "gartenschlauch", "kompost", "rindenmulch",
        "soil", "fertilizer", "seeds", "plant", "pot")),
    ("electric", "Elektro & Licht", "Electrical & lighting", "mdi:lightbulb-outline", (
        "lampe", "leuchtmittel", "glühbirne", "led", "kabel", "stecker", "verlängerung", "steckdose", "schalter",
        "lamp", "bulb", "cable", "plug", "socket")),
    ("building", "Holz & Baustoffe", "Wood & building", "mdi:wall", (
        "holz", "brett", "latte", "platte", "spanplatte", "mdf", "zement", "mörtel", "gips", "fliese", "wood",
        "board", "plank", "cement", "tiles")),
    ("plumbing", "Sanitär", "Plumbing", "mdi:pipe", (
        "rohr", "siphon", "dichtung", "wasserhahn", "armatur", "duschkopf", "pipe", "faucet", "seal")),
    ("office", "Büro & Schule", "Office & school", "mdi:pencil", (
        "papier", "heft", "ordner", "stift", "bleistift", "kugelschreiber", "leuchtstift", "radiergummi", "schere",
        "kuvert", "couvert", "druckerpatrone", "toner", "pen", "pencil", "notebook", "folder", "envelope")),
]
KB_BY_KEY = {k[0]: k for k in KB}
_QTY = re.compile(
    r"^\s*(\d+[.,]?\d*\s*(x|×|stk\.?|stück|pck\.?|pack|packung|kg|g|gr|l|dl|ml|cl)?\s+)|"
    r"\s+(\d+[.,]?\d*\s*(x|×|stk\.?|stück|pck\.?|pack|packung|kg|g|gr|l|dl|ml|cl)?)\s*$",
    re.IGNORECASE)


def normalize(name: str) -> str:
    """Lower case, quantities stripped ('2x Milch', 'Mehl 1kg' -> 'milch', 'mehl')."""
    s = (name or "").strip().lower()
    for _ in range(2):
        s = _QTY.sub(" ", s).strip()
    s = re.sub(r"[()\[\],;:!?]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def _kw_score(keyword: str, text: str) -> int:
    """Length of the keyword if it matches a word (exact, prefix or compound suffix) of the text."""
    if " " in keyword or "-" in keyword:
        return len(keyword) + 2 if keyword in text else 0
    for word in re.split(r"[\s\-/]+", text):
        if word == keyword:
            return len(keyword) + 2
        if len(keyword) >= 4 and (word.startswith(keyword) or word.endswith(keyword)):
            return len(keyword)
        if len(keyword) == 3 and word.startswith(keyword) and len(word) <= 5:
            return 1
    return 0


def kb_lookup(name: str) -> str | None:
    """Best knowledge-base category key for an item, or None."""
    text = normalize(name)
    best, score = None, 0
    for key, _de, _en, _icon, words in KB:
        for kw in words:
            sc = _kw_score(kw, text)
            if sc > score:
                best, score = key, sc
    return best


def kb_name(key: str, lang: str) -> str:
    entry = KB_BY_KEY[key]
    return entry[1] if lang == "de" else entry[2]


def other_name(lang: str) -> str:
    return "Sonstiges" if lang == "de" else "Other"


def new_list(name: str, entity: str, max_categories: int = 10, auto: bool = True, icon: str = "") -> dict:
    return {"name": name, "entity": entity, "icon": icon or "mdi:format-list-checks", "auto": bool(auto),
            "max_categories": clamp_max(max_categories), "categories": [], "assignments": {}}


def clamp_max(value) -> int:
    try:
        return max(MIN_CATEGORIES, min(MAX_CATEGORIES, int(value)))
    except (TypeError, ValueError):
        return 10


def ensure_other(lst: dict, lang: str) -> dict:
    for cat in lst["categories"]:
        if cat["id"] == OTHER:
            return cat
    cat = {"id": OTHER, "name": other_name(lang), "icon": "mdi:dots-horizontal-circle-outline", "kb": None,
           "keywords": [], "last_used": None}
    lst["categories"].append(cat)
    return cat


def categorize(lst: dict, name: str) -> str | None:
    """Category id of an item in this list, or None if nothing matches."""
    text = normalize(name)
    cats = {c["id"]: c for c in lst["categories"]}
    cid = lst["assignments"].get(text)
    if cid in cats:
        return cid
    best, score = None, 0
    for cat in lst["categories"]:
        for kw in cat.get("keywords", []):
            sc = _kw_score(kw.lower(), text)
            if sc > score:
                best, score = cat["id"], sc
    if best:
        return best
    key = kb_lookup(text)
    if key:
        for cat in lst["categories"]:
            if cat.get("kb") == key:
                return cat["id"]
    return None


def _match_existing(lst: dict, label: str) -> str | None:
    low = label.strip().lower()
    for cat in lst["categories"]:
        if cat["name"].lower() == low:
            return cat["id"]
    for key, de, en, _icon, _w in KB:
        if low in (de.lower(), en.lower()):
            for cat in lst["categories"]:
                if cat.get("kb") == key:
                    return cat["id"]
    return None


@dataclass
class OptimizeResult:
    created: list[str] = field(default_factory=list)
    removed: list[str] = field(default_factory=list)
    assigned: int = 0
    unresolved: list[str] = field(default_factory=list)


def optimize(lst: dict, items: list[str], lang: str, today: str, ai: dict[str, str] | None = None,
             prune_days: int = PRUNE_AFTER_DAYS) -> OptimizeResult:
    """Put every open item into a category, creating categories as needed but never more than the limit.

    `ai` optionally maps item names to a suggested category label (from an AI task).
    Categories unused for prune_days make room when the list is full and new kinds of items appear.
    """
    res = OptimizeResult()
    ai = {normalize(k): v for k, v in (ai or {}).items() if isinstance(v, str) and v.strip()}
    limit = clamp_max(lst.get("max_categories"))
    ensure_other(lst, lang)

    def room() -> bool:
        return len(lst["categories"]) < limit

    def add_category(name: str, kb: str | None, icon: str | None) -> str:
        cid = kb or ("c" + secrets.token_hex(3))
        while any(c["id"] == cid for c in lst["categories"]):
            cid = "c" + secrets.token_hex(3)
        cat = {"id": cid, "name": name, "icon": icon or "mdi:tag-outline", "kb": kb, "keywords": [], "last_used": today}
        lst["categories"].insert(len(lst["categories"]) - 1, cat)  # keep "other" last
        res.created.append(name)
        return cid

    def prune_one() -> bool:
        """Drop the least recently used category (not 'other', not used today) to make room."""
        used_now = {categorize(lst, n) for n in items}
        stale = [c for c in lst["categories"] if c["id"] != OTHER and c["id"] not in used_now
                 and (c.get("last_used") or "") < _days_before(today, prune_days)]
        if not stale:
            return False
        victim = min(stale, key=lambda c: c.get("last_used") or "")
        _remove(lst, victim["id"])
        res.removed.append(victim["name"])
        return True

    # 1. lowered limit: fold the least recently used categories into "other"
    while len(lst["categories"]) > limit:
        cands = [c for c in lst["categories"] if c["id"] != OTHER]
        victim = min(cands, key=lambda c: c.get("last_used") or "")
        _remove(lst, victim["id"])
        res.removed.append(victim["name"])

    # 2. place items that match nothing (or only "other")
    for name in items:
        cid = categorize(lst, name)
        if cid and cid != OTHER:
            continue
        text = normalize(name)
        target = None
        label = ai.get(text)
        if label:
            target = _match_existing(lst, label)
            if target is None and (room() or prune_one()):
                key = next((k for k, de, en, _i, _w in KB if label.lower() in (de.lower(), en.lower())), None)
                target = add_category(label.strip()[:40], key, KB_BY_KEY[key][3] if key else None)
            if target:
                lst["assignments"][text] = target
        else:
            key = kb_lookup(text)
            if key:
                target = next((c["id"] for c in lst["categories"] if c.get("kb") == key), None)
                if target is None and (room() or prune_one()):
                    target = add_category(kb_name(key, lang), key, KB_BY_KEY[key][3])
        if target:
            res.assigned += 1
        else:
            res.unresolved.append(name)

    # 3. remember which categories are in use
    for name in items:
        cid = categorize(lst, name) or OTHER
        for cat in lst["categories"]:
            if cat["id"] == cid:
                cat["last_used"] = today
    return res


def _remove(lst: dict, cid: str) -> None:
    lst["categories"] = [c for c in lst["categories"] if c["id"] != cid]
    lst["assignments"] = {k: v for k, v in lst["assignments"].items() if v != cid}


def _days_before(iso: str, days: int) -> str:
    from datetime import date, timedelta
    return (date.fromisoformat(iso) - timedelta(days=days)).isoformat()


def item_map(lst: dict, items: list[str]) -> dict[str, str]:
    """Item summary -> category id (uncategorized items go to 'other')."""
    return {n: categorize(lst, n) or OTHER for n in items}


def ai_prompt(lst: dict, items: list[str], lang: str) -> str:
    cats = [c["name"] for c in lst["categories"]]
    limit = clamp_max(lst.get("max_categories"))
    if lang == "de":
        return (f"Ordne Einträge der Liste „{lst['name']}“ Kategorien zu (wie Abteilungen im Laden). "
                f"Vorhandene Kategorien: {', '.join(cats)}. Verwende möglichst vorhandene Kategorien. "
                f"Neue Kategorien nur wenn nötig, insgesamt höchstens {limit} Kategorien. "
                f"Kurze deutsche Kategorienamen. Antworte NUR mit einem JSON-Objekt Eintrag -> Kategorie.\n"
                f"Einträge: {', '.join(items)}")
    return (f"Assign the entries of the list \"{lst['name']}\" to categories (like store departments). "
            f"Existing categories: {', '.join(cats)}. Prefer existing categories; create new ones only if "
            f"needed, at most {limit} categories in total. Short English names. Reply ONLY with a JSON object "
            f"entry -> category.\nEntries: {', '.join(items)}")


def parse_ai(text) -> dict[str, str]:
    """Extract the {item: category} object from an AI reply (tolerates code fences and prose)."""
    import json
    if isinstance(text, dict):
        return {str(k): str(v) for k, v in text.items() if isinstance(v, str)}
    m = re.search(r"\{.*\}", str(text or ""), re.DOTALL)
    if not m:
        return {}
    try:
        data = json.loads(m.group(0))
    except ValueError:
        return {}
    return {str(k): str(v) for k, v in data.items() if isinstance(v, str)} if isinstance(data, dict) else {}
