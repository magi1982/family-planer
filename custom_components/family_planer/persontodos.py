"""To-dos from a shared list (e.g. the Alexa to-do list): a name or nickname in the item assigns it to that person.

"Lea Zimmer aufräumen gross" -> person Lea, title "Zimmer aufräumen", size "l". No HA imports, unit-tested.
"""
from __future__ import annotations

import re

SIZE_WORDS = {"klein": "s", "small": "s", "mittel": "m", "medium": "m", "gross": "l", "groß": "l", "big": "l", "large": "l"}


def _re(name: str) -> re.Pattern:
    return re.compile(r"(^|[^\w])" + re.escape(name) + r"s?(?![\w])", re.I | re.U)


def match(summary: str, persons: dict) -> tuple[list[str], str, str | None]:
    """(person ids, title, size or None). Several names -> one to-do for each of them.

    Names at the start decide ("Lea und Mia Tisch decken" -> both) and are removed from the title; a name later in
    the text only counts when none stands at the start ("Lea Kalender für Mia machen" -> Lea only). Without a
    leading name the first name in the text assigns it and stays part of the title ("Fotos für Mia bearbeiten").
    """
    text = " ".join(str(summary or "").split())[:200]
    first: dict[str, int] = {}  # pid -> position of its first mention
    names: list[tuple[str, str]] = []
    for pid, p in persons.items():
        for n in {n.strip() for n in [p.get("name") or ""] + list(p.get("aliases") or []) if n and len(n.strip()) >= 2}:
            names.append((pid, n))
            m = _re(n).search(text)
            if m:
                first[pid] = min(first.get(pid, len(text)), m.start())
    lead_pids: list[str] = []
    names.sort(key=lambda x: len(x[1]), reverse=True)
    clean = text
    lead = re.compile(r"^\s*(?:und|and|&|\+|,|:|-|–)?\s*", re.I)
    while True:  # strip leading names and joiners
        stripped = lead.sub("", clean, count=1)
        for pid_, n in names:
            m = re.match(re.escape(n) + r"s?(?![\w])[\s,:;\-–]*", stripped, re.I | re.U)
            if m:
                clean = stripped[m.end():]
                if pid_ not in lead_pids:
                    lead_pids.append(pid_)
                break
        else:
            break
    hits = lead_pids or ([min(first, key=first.get)] if first else [])
    size = None
    m = re.search(r"[\s,(\-]*\(?\b(" + "|".join(SIZE_WORDS) + r")\)?\s*[.!]*$", clean, re.I | re.U)
    if m and hits:
        size = SIZE_WORDS[m.group(1).lower()]
        clean = clean[:m.start()]
    clean = re.sub(r"^(und|and)\s+", "", clean.strip(" ,:;-–"), flags=re.I).strip()
    if clean:
        clean = clean[0].upper() + clean[1:]
    return hits, clean or text, size


_EMAIL = re.compile(r"^\s*([^\s@]+)@[^\s@]+\.[^\s@]+\s*(.*)$", re.U)


def list_label(friendly_name: str, persons: dict) -> str:
    """Short label of a to-do list for chips: never an e-mail address.

    Account lists are often named "<e-mail> <list>" (e.g. "lea@example.org To-do-Liste"). The label is then the
    person the address belongs to (first part matched against names and nicknames), else the list name, else the
    first part of the address. Other names stay as they are.
    """
    name = " ".join(str(friendly_name or "").split())[:80]
    m = _EMAIL.match(name)
    if not m:
        return name
    local, rest = m.group(1).lower(), m.group(2).strip()
    parts = [p for p in re.split(r"[._\-+]", local) if p]
    best = ""
    for p in persons.values():
        for n in [p.get("name") or ""] + list(p.get("aliases") or []):
            k = n.strip().lower()
            if len(k) >= 2 and (k == local or k in parts) and len(k) > len(best):
                best, label = k, str(p.get("name") or n).strip()
    if best:
        return label
    return rest or (parts[0].capitalize() if parts else local)
