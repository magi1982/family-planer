"""Special fun days for the header scene – no Home Assistant imports, unit-testable.

Fixed days (dinosaur day, moon landing …) replace the everyday scene or a long season; holidays, customs,
birthdays and anniversaries keep their own scene. Some days only add something to the sky (Sputnik, Concorde).
The "British day" comes ten times a year on random everyday days – never on any other special day and never
between 1 December and 6 January.
"""
from __future__ import annotations

import random
from datetime import date, timedelta

# key: (month, day, days, replaces the scene, icon, de, en, info de, info en)
FIXED: dict[str, tuple[int, int, int, bool, str, str, str, str, str]] = {
    "dino": (2, 20, 1, True, "🦕", "Tag der Dinosaurier", "Dinosaur Day",
             "Ein Tag für die Riesen der Urzeit. Dinosaurier lebten über 160 Millionen Jahre auf der Erde – lange bevor es Menschen gab.",
             "A day for the giants of prehistory. Dinosaurs lived on Earth for more than 160 million years – long before there were people."),
    "april": (4, 1, 1, True, "🐟", "1. April", "April Fools' Day",
              "Heute darf man andere in den April schicken! 1957 zeigte das britische Fernsehen eine „Spaghetti-Ernte“ im Tessin – viele glaubten es und wollten selbst Spaghetti-Bäume pflanzen.",
              "Today you may play tricks on others! In 1957 British TV showed a \"spaghetti harvest\" in Ticino, Switzerland – many believed it and wanted to grow spaghetti trees."),
    "mobile": (4, 3, 1, True, "📱", "Erster Handy-Anruf", "First mobile phone call",
               "Am 3. April 1973 telefonierte Martin Cooper in New York zum ersten Mal mit einem Handy. Es wog über ein Kilo und der Akku hielt etwa 30 Minuten.",
               "On 3 April 1973 Martin Cooper made the first mobile phone call in New York. The phone weighed over a kilo and the battery lasted about 30 minutes."),
    "titanic": (4, 15, 1, True, "🚢", "Titanic", "Titanic",
                "Am 15. April 1912 ging die Titanic auf ihrer ersten Reise unter. Sie war damals das grösste Schiff der Welt – von ihren vier Schornsteinen rauchten nur drei, der vierte war für die Optik.",
                "On 15 April 1912 the Titanic sank on her maiden voyage. She was the largest ship in the world – only three of her four funnels smoked, the fourth was just for looks."),
    "moon": (7, 20, 1, True, "🌕", "Mondlandung", "Moon landing",
             "Am 20. Juli 1969 landeten Neil Armstrong und Buzz Aldrin mit der Mondfähre „Eagle“ auf dem Mond. „Ein kleiner Schritt für einen Menschen, ein riesiger Sprung für die Menschheit.“",
             "On 20 July 1969 Neil Armstrong and Buzz Aldrin landed on the Moon in the lunar module \"Eagle\". \"That's one small step for man, one giant leap for mankind.\""),
    "volcano": (8, 27, 1, True, "🌋", "Vulkan-Tag", "Volcano day",
                "Am 27. August 1883 brach der Vulkan Krakatau in Indonesien aus – so laut, dass man es fast 5000 km weit hörte. Es war der lauteste Knall der Geschichte.",
                "On 27 August 1883 the volcano Krakatoa in Indonesia erupted – so loud it was heard almost 5,000 km away. It was the loudest sound in history."),
    "sputnik": (10, 4, 8, False, "🛰️", "Sputnik", "Sputnik",
                "Am 4. Oktober 1957 startete Sputnik 1, der erste künstliche Satellit. Er umkreiste die Erde alle 96 Minuten und piepste dabei Funksignale. In diesen Nächten fliegt er klein über den Himmel.",
                "On 4 October 1957 Sputnik 1, the first artificial satellite, was launched. It circled the Earth every 96 minutes, beeping radio signals. These nights it crosses the sky, tiny."),
    "concorde": (11, 26, 1, False, "✈️", "Concorde", "Concorde",
                 "Am 26. November 2003 flog die Concorde zum letzten Mal. Das Überschall-Flugzeug schaffte Paris–New York in rund 3½ Stunden – doppelt so schnell wie der Schall.",
                 "On 26 November 2003 Concorde made her last flight. The supersonic jet flew Paris–New York in about 3½ hours – twice the speed of sound."),
}
UK = ("uk", "🇬🇧", "British Day", "British Day",
      "Ein Tag im Zeichen von Grossbritannien: der Buckingham Palace mit den Wachen der Königsgarde und ihren hohen Bärenfellmützen. Kommt zehnmal im Jahr an einem zufälligen Tag.",
      "A day in honour of Great Britain: Buckingham Palace with the King's Guard in their tall bearskin hats. Comes ten times a year on a random day.")
UK_DAYS = 10
# info texts for customs and holidays (the ⓘ next to the date)
EVENT_INFO: dict[str, tuple[str, str]] = {
    "muttertag": ("Am zweiten Sonntag im Mai sagen wir Mama Danke. Die Idee kam aus den USA: Anna Jarvis ehrte 1908 ihre Mutter mit einem Gedenktag. In der Schweiz feiert man den Muttertag seit 1930.",
                  "On the second Sunday in May we say thank you to Mum. The idea came from the USA: in 1908 Anna Jarvis honoured her mother with a day of remembrance. Switzerland has celebrated Mother's Day since 1930."),
    "vatertag": ("Am ersten Sonntag im Juni ist in der Schweiz Vatertag – heute sagen wir Papa Danke. Die Idee hatte 1910 Sonora Smart Dodd in den USA: Ihr Vater hatte sie und ihre fünf Brüder allein grossgezogen. Heute wohnt Papa in der Männerhöhle und brät sein Essen am Lagerfeuer.",
                 "In Switzerland Father's Day is the first Sunday in June – today we say thank you to Dad. The idea came from Sonora Smart Dodd in the USA in 1910: her father had raised her and her five brothers on his own. Today Dad lives in his man cave and cooks at the campfire."),
}
EVENT_INFO.update({
    "advent": ("Advent heisst Ankunft: Die vier Sonntage vor Weihnachten bereiten wir uns auf das Fest vor. Jeden Sonntag brennt eine Kerze mehr am Adventskranz, und der Adventskalender zählt die Tage bis Weihnachten.",
               "Advent means arrival: on the four Sundays before Christmas we get ready for the feast. Each Sunday one more candle burns on the Advent wreath, and the Advent calendar counts the days until Christmas."),
    "samichlaus": ("Am 6. Dezember kommt der Samichlaus, oft mit dem Schmutzli. Er erinnert an den Bischof Nikolaus, der vor langer Zeit armen Menschen half. Wer ein Sprüchli aufsagt, bekommt Nüssli, Mandarinen und Lebkuchen.",
                   "On 6 December St. Nicholas comes, often with his helper Schmutzli. He reminds us of Bishop Nicholas, who helped poor people long ago. Whoever says a little rhyme gets nuts, tangerines and gingerbread."),
    "winteranfang": ("Heute beginnt der Winter. Es ist der kürzeste Tag und die längste Nacht des Jahres – ab morgen werden die Tage wieder länger.",
                     "Winter starts today. It is the shortest day and the longest night of the year – from tomorrow the days get longer again."),
    "heiligabend": ("Am Abend vor Weihnachten feiern viele Familien zusammen: Der Christbaum leuchtet, und es gibt Geschenke. Christinnen und Christen feiern die Geburt von Jesus.",
                    "On the evening before Christmas many families celebrate together: the Christmas tree is lit and there are presents. Christians celebrate the birth of Jesus."),
    "weihnachtstag": ("Am 25. Dezember ist Weihnachten, das Fest der Geburt von Jesus. Ein Feiertag für Familie, feines Essen und Zeit zusammen.",
                      "25 December is Christmas Day, the feast of the birth of Jesus. A holiday for family, good food and time together."),
    "stephanstag": ("Der 26. Dezember erinnert an den heiligen Stephanus. In vielen Kantonen ist frei – Zeit für Besuche und die Reste vom Festessen.",
                    "26 December remembers Saint Stephen. Many cantons have a day off – time for visits and the leftovers of the feast."),
    "silvester": ("Der letzte Tag des Jahres heisst nach Papst Silvester. Um Mitternacht begrüssen wir das neue Jahr mit Feuerwerk und wünschen uns „Es guets Neus!“.",
                  "The last day of the year is named after Pope Sylvester. At midnight we welcome the new year with fireworks and wish each other a happy new year."),
    "neujahr": ("Ein neues Jahr beginnt! Viele nehmen sich heute etwas vor, zum Beispiel mehr draussen zu spielen oder ein neues Hobby.",
                "A new year begins! Many people make a resolution today, for example to play outside more or to start a new hobby."),
    "berchtoldstag": ("Der 2. Januar ist in vielen Kantonen ein Feiertag. Woher der Name genau kommt, weiss niemand sicher – gefeiert wird mit Besuchen, Spielen und Umzügen.",
                      "2 January is a holiday in many cantons. Nobody knows for sure where the name comes from – people celebrate with visits, games and parades."),
    "dreikoenig": ("Die drei Weisen aus dem Morgenland folgten einem Stern zum Jesuskind. In der Schweiz gibt es heute den Dreikönigskuchen: Wer den kleinen König findet, ist für einen Tag König oder Königin und trägt die Krone.",
                   "The three wise men followed a star to baby Jesus. In Switzerland there is a Three Kings cake today: whoever finds the little king is king or queen for a day and wears the crown."),
    "valentin": ("Der 14. Februar ist der Tag der Liebe. Man schenkt Menschen, die man gern hat, Blumen, eine Karte oder ein Lächeln.",
                 "14 February is the day of love. You give the people you love flowers, a card or a smile."),
    "fasnacht": ("Vor der Fastenzeit wird gefeiert: Wir verkleiden uns, die Guggenmusik spielt laut, und überall fliegt Konfetti. Ein alter Brauch, um den Winter zu vertreiben.",
                 "Before Lent people celebrate: we dress up, brass bands play loudly and confetti flies everywhere. An old custom to chase away the winter."),
    "fruehlingsanfang": ("Heute beginnt der Frühling. Tag und Nacht sind fast gleich lang, und ab jetzt sind die Tage länger als die Nächte.",
                         "Spring starts today. Day and night are almost the same length, and from now on the days are longer than the nights."),
    "karfreitag": ("Am Karfreitag erinnern sich Christinnen und Christen an den Tod von Jesus. Ein ruhiger, stiller Feiertag.",
                   "On Good Friday Christians remember the death of Jesus. A calm and quiet holiday."),
    "ostersonntag": ("An Ostern feiern Christinnen und Christen, dass Jesus auferstanden ist. Der Osterhase versteckt Eier, und beim Eiertütschen gewinnt, wessen Ei ganz bleibt.",
                     "At Easter Christians celebrate that Jesus rose from the dead. The Easter bunny hides eggs, and in egg tapping whoever's egg stays whole wins."),
    "ostermontag": ("Der Tag nach Ostern ist ein Feiertag – Zeit für einen Ausflug oder die restlichen Schoggi-Eier.",
                    "The day after Easter is a holiday – time for a trip or the last chocolate eggs."),
    "tag_der_arbeit": ("Am 1. Mai ist der Tag der Arbeit. Man erinnert an alle Menschen, die arbeiten, und an faire Arbeit. In einigen Kantonen ist frei.",
                       "1 May is Labour Day. It honours everyone who works and fair working conditions. Some cantons have a day off."),
    "auffahrt": ("40 Tage nach Ostern feiern Christinnen und Christen, dass Jesus in den Himmel aufgefahren ist. Auffahrt ist immer an einem Donnerstag.",
                 "40 days after Easter Christians celebrate that Jesus ascended into heaven. Ascension Day is always on a Thursday."),
    "pfingstsonntag": ("50 Tage nach Ostern ist Pfingsten. Christinnen und Christen feiern, dass der Heilige Geist zu den Jüngern kam – man nennt es auch den Geburtstag der Kirche.",
                       "Whitsun is 50 days after Easter. Christians celebrate that the Holy Spirit came to the disciples – it is also called the birthday of the church."),
    "pfingstmontag": ("Der Montag nach Pfingsten ist ein Feiertag – oft für einen Ausflug in den Frühsommer.",
                      "The Monday after Whitsun is a holiday – often for a trip into early summer."),
    "sommeranfang": ("Heute beginnt der Sommer. Es ist der längste Tag und die kürzeste Nacht des Jahres.",
                     "Summer starts today. It is the longest day and the shortest night of the year."),
    "august": ("Am 1. August feiert die Schweiz Geburtstag. Der Sage nach schworen sich 1291 Uri, Schwyz und Unterwalden auf dem Rütli, einander zu helfen. Es gibt Höhenfeuer, Lampions und Feuerwerk.",
               "On 1 August Switzerland celebrates its birthday. According to legend, in 1291 Uri, Schwyz and Unterwalden swore on the Rütli meadow to help each other. There are bonfires, lanterns and fireworks."),
    "bettag": ("Der Eidgenössische Dank-, Buss- und Bettag ist am dritten Sonntag im September. Menschen aller Religionen denken an das, wofür sie dankbar sind. Vielerorts gibt es Zwetschgenwähe.",
               "The Federal Day of Thanksgiving is on the third Sunday in September. People of all religions think about what they are thankful for. In many places there is plum tart."),
    "herbstanfang": ("Heute beginnt der Herbst. Tag und Nacht sind fast gleich lang, und ab jetzt werden die Nächte länger.",
                     "Autumn starts today. Day and night are almost the same length, and from now on the nights get longer."),
    "erntedank": ("Beim Erntedank sagen wir Danke für alles, was auf den Feldern und Bäumen gewachsen ist. Kirchen werden mit Früchten, Gemüse und Getreide geschmückt.",
                  "At the harvest festival we say thank you for everything that grew on the fields and trees. Churches are decorated with fruit, vegetables and grain."),
})
# the scene of these events may be replaced by a fun day; holidays, customs, birthdays and anniversaries stay
SOFT_KINDS = (None, "season", "school")
_CACHE: dict[tuple, list[date]] = {}


def fixed_on(today: date) -> str | None:
    for key, (mo, d, n, *_rest) in FIXED.items():
        start = date(today.year, mo, d)
        if start <= today < start + timedelta(days=n):
            return key
    return None


def uk_days(year: int, is_plain) -> list[date]:
    """Ten random everyday days of the year (same for the whole year); is_plain(d) says if a day is an everyday day."""
    days = [date(year, 1, 1) + timedelta(days=i) for i in range((date(year + 1, 1, 1) - date(year, 1, 1)).days)]
    random.Random(year * 7919 + 13).shuffle(days)
    out = []
    for d in days:
        if (d.month == 12) or (d.month == 1 and d.day <= 6) or fixed_on(d):
            continue
        if is_plain(d):
            out.append(d)
        if len(out) >= UK_DAYS:
            break
    return sorted(out)


def dedicate(fun: dict, name: str) -> dict:
    """British Day for someone: "This day is for <name> – a keepsake of the British roots." (name from the settings)"""
    if not fun or fun.get("key") != "uk" or not name:
        return fun
    return {**fun, "info": {"de": f"Dieser Tag ist für {name} – als Andenken an die britischen Wurzeln. " + fun["info"]["de"],
                            "en": f"This day is for {name} – a keepsake of the British roots. " + fun["info"]["en"]}}


def info(key: str) -> dict:
    if key == "uk":
        k, icon, de, en, ide, ien = UK
        return {"key": k, "scene": True, "icon": icon, "label": {"de": de, "en": en}, "info": {"de": ide, "en": ien}}
    _mo, _d, _n, scene, icon, de, en, ide, ien = FIXED[key]
    return {"key": key, "scene": scene, "icon": icon, "label": {"de": de, "en": en}, "info": {"de": ide, "en": ien}}


def pick(today: date, top_kind: str | None, fun_on: bool, uk_on: bool, is_plain, sig: str = "") -> dict | None:
    """The fun day for today or None. top_kind: kind of the event that decides today's scene."""
    if fun_on:
        key = fixed_on(today)
        if key:
            f = info(key)
            if f["scene"] and top_kind not in SOFT_KINDS:
                return None
            return f
    if uk_on and top_kind in (None, "season"):
        ck = (today.year, sig)
        if ck not in _CACHE:
            if len(_CACHE) > 8:
                _CACHE.clear()
            _CACHE[ck] = uk_days(today.year, is_plain)
        if today in _CACHE[ck]:
            return info("uk")
    return None
