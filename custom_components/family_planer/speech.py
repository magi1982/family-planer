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
        return f"{person} möchte „{reward}“ für {cost} Münzen einlösen."
    return f"{person} would like to redeem \"{reward}\" for {cost} coins."


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


PRAISE = {
    "de": ["{n}, du hast heute alles erledigt. Mega!", "Bravo {n}! Alle Ämtli geschafft – das ist Teamwork.",
           "{n}, du bist heute ein echter Ämtli-Profi.", "Hey {n}, schon alles erledigt? Wow, Daumen hoch!",
           "{n}, danke für deine Hilfe heute. Du machst das super!"],
    "en": ["{n}, you finished everything today. Awesome!", "Well done {n}! All chores done – that's teamwork.",
           "{n}, you're a real chore champion today.", "Hey {n}, all done already? Wow, thumbs up!",
           "{n}, thanks for your help today. You're doing great!"],
}
BIRTHDAY = {
    "de": ["Achtung, Achtung! Heute hat {n} Geburtstag. Alle bitte einmal laut Hurra rufen!",
           "{n}, heute zählen alle deine Münzen doppelt. Geburtstagskind-Bonus!",
           "Wichtige Durchsage: Das Geburtstagskind {n} darf heute ein Lied wünschen.",
           "{n}, die Kühlschrank-Kommission hat beschlossen: Heute gibt es Kuchen!",
           "Hallo {n}! Wusstest du, dass du heute offiziell ein Jahr cooler bist?",
           "{n}, für dich gibt es heute einen Extra-Applaus. Alle klatschen jetzt!",
           "Geburtstags-Alarm! {n}, wir finden dich grossartig.",
           "{n}, die Ämtli-Polizei drückt heute ein Auge zu – aber nur ein kleines!"],
    "en": ["Attention please! Today is {n}'s birthday. Everybody shout hooray!",
           "{n}, all your coins count double today. Birthday bonus!",
           "Important announcement: birthday star {n} gets to pick a song today.",
           "{n}, the fridge committee has decided: there will be cake today!",
           "Hello {n}! Did you know you're officially one year cooler today?",
           "{n}, here's an extra round of applause for you. Everybody clap now!",
           "Birthday alert! {n}, we think you're amazing.",
           "{n}, the chore police are turning a blind eye today – but only a small one!"],
}
BIRTHDAY_AGE = {"de": "{n}, heute wirst du {a}! Herzlichen Glückwunsch!", "en": "{n}, you're turning {a} today! Happy birthday!"}


def praise_message(name: str, lang: str, seed: int) -> str:
    lst = PRAISE["de" if lang == "de" else "en"]
    return lst[seed % len(lst)].format(n=name)


def birthday_messages(name: str, lang: str, seed: int, count: int = 5, age: int | None = None) -> list[str]:
    """Funny birthday announcements for one day, all different."""
    lg = "de" if lang == "de" else "en"
    lst = BIRTHDAY[lg]
    start = seed % len(lst)
    out = [lst[(start + k) % len(lst)].format(n=name) for k in range(min(count, len(lst)))]
    if age:
        out[0] = BIRTHDAY_AGE[lg].format(n=name, a=age)
    return out


def evening_message(open_by_person: list[tuple[str, list[str]]], lang: str, max_items: int = 3) -> str:
    """20:00 summary: what is still open today."""
    msg = open_chores_message(open_by_person, lang, max_items)
    if not msg:
        return ""
    head = "Guten Abend! Bevor der Tag zu Ende ist" if lang == "de" else "Good evening! Before the day ends"
    return msg.replace("Hallo! Noch offen" if lang == "de" else "Hello! Still to do", head + (", noch offen" if lang == "de" else ", still to do"), 1)
