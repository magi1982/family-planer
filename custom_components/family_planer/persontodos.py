"""To-dos from a shared list (e.g. the Alexa to-do list): a name or nickname in the item assigns it to that person.

"Lea Zimmer aufräumen gross" -> person Lea, title "Zimmer aufräumen", size "l". No HA imports, unit-tested.
"""
from __future__ import annotations

import re

SIZE_WORDS = {"klein": "s", "small": "s", "mittel": "m", "medium": "m", "gross": "l", "groß": "l", "big": "l", "large": "l"}


def _re(name: str) -> re.Pattern:
    return re.compile(r"(^|[^\w])" + re.escape(name) + r"s?(?![\w])", re.I | re.U)


def match(summary: str, persons: dict) -> tuple[list[str], str, str | None]:
    """(person ids, cleaned title, size or None). Several names -> one to-do for each of them."""
    text = " ".join(str(summary or "").split())[:200]
    hits: list[str] = []
    clean = text
    for pid, p in persons.items():
        names = [p.get("name") or ""] + list(p.get("aliases") or [])
        for n in sorted({n.strip() for n in names if n and len(n.strip()) >= 2}, key=len, reverse=True):
            rx = _re(n)
            if rx.search(text):
                if pid not in hits:
                    hits.append(pid)
                clean = rx.sub(r"\1", clean)
    size = None
    m = re.search(r"[\s,(\-]*\(?\b(" + "|".join(SIZE_WORDS) + r")\)?\s*[.!]*$", clean, re.I | re.U)
    if m:
        size = SIZE_WORDS[m.group(1).lower()]
        clean = clean[:m.start()]
    clean = re.sub(r"^[\s,:;\-–+&]+|[\s,:;\-–+&]+$", "", re.sub(r"\s+(und|and|&|\+|,)\s+(?=(und|and|&|\+|,|$))", " ", clean))
    clean = re.sub(r"^(und|and)\s+|\s+(und|and)$", "", clean.strip(), flags=re.I)
    clean = re.sub(r"\s{2,}", " ", clean).strip(" ,:;-–")
    if clean:
        clean = clean[0].upper() + clean[1:]
    return hits, clean or text, size
