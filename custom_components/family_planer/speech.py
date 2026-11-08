"""Texts for spoken announcements (no Home Assistant imports, unit-testable)."""
from __future__ import annotations


def _join(parts: list[str], lang: str) -> str:
    if len(parts) <= 1:
        return "".join(parts)
    word = " und " if lang == "de" else " and "
    return ", ".join(parts[:-1]) + word + parts[-1]


def open_chores_message(open_by_person: list[tuple[str, list[str]]], lang: str, max_items: int = 3) -> str:
    """'Hallo! Noch offen: Lea: Tisch decken und Abfall leeren. Mia: Ratten füttern.'"""
    chunks = []
    for name, titles in open_by_person:
        if not titles:
            continue
        shown = titles[:max_items]
        rest = len(titles) - len(shown)
        if rest:
            shown = shown + [f"{rest} weitere" if lang == "de" else f"{rest} more"]
        chunks.append(f"{name}: {_join(shown, lang)}")
    if not chunks:
        return ""
    head = "Hallo! Noch offen" if lang == "de" else "Hello! Still to do"
    return f"{head}: " + ". ".join(chunks) + "."


def all_done_message(names: list[str], lang: str) -> str:
    if lang == "de":
        return "Super gemacht! Alle Ämtli für heute sind erledigt." if names else ""
    return "Well done! All chores for today are finished." if names else ""


def reward_request_message(person: str, reward: str, cost: int, lang: str) -> str:
    if lang == "de":
        return f"{person} möchte „{reward}“ für {cost} Punkte einlösen."
    return f"{person} would like to redeem \"{reward}\" for {cost} points."


def reward_decided_message(person: str, reward: str, approved: bool, lang: str) -> str:
    if lang == "de":
        return (f"{person}, deine Belohnung „{reward}“ wurde freigegeben. Viel Spass!" if approved
                else f"{person}, deine Belohnung „{reward}“ wurde diesmal nicht freigegeben.")
    return (f"{person}, your reward \"{reward}\" was approved. Have fun!" if approved
            else f"{person}, your reward \"{reward}\" was not approved this time.")


def special_chore_message(person: str, title: str, days: int, lang: str) -> str:
    if lang == "de":
        tail = "heute" if days <= 1 else f"in den nächsten {days} Tagen"
        return f"{person}, {tail} ist „{title}“ dran."
    tail = "today" if days <= 1 else f"within the next {days} days"
    return f"{person}, \"{title}\" is due {tail}."
