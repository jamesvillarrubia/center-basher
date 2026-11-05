"""Pull Democratic-primary endorsement boxes from cached Wikipedia wikitext."""
from __future__ import annotations

import re

BOX = re.compile(r"\{\{Endorsements box\|top\|title=([^|}]*)[^}]*\}\}(.*?)\{\{Endorsements box\|bottom\}\}", re.S)
REF = re.compile(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>", re.S)
URL = re.compile(r"\|\s*url\s*=\s*(\S+?)\s*(?=\||\}\})")

# Endorser patterns. Order matters only for readability.
PATTERNS = {
    # party / leadership (anointed marker)
    "dscc": r"\bDSCC\b|Democratic Senatorial Campaign Committee",
    "dccc": r"\bDCCC\b|Democratic Congressional Campaign Committee|Red to Blue",
    "schumer": r"Chuck Schumer",
    "jeffries": r"Hakeem Jeffries",
    "smp": r"Senate Majority PAC",
    "hmp": r"House Majority PAC",
    # moderate PACs (Third Way's own House coding)
    "welcome": r"Welcome ?PAC|WelcomePAC",
    "newdem": r"New Democrat(ic)? (Coalition )?Action Fund|NewDem Action Fund|New Democrat Coalition",
    "bluedog": r"Blue Dog",
    # money groups
    "aipac": r"(?<!Track )\bAIPAC\b(?! Tracker)|American Israel Public Affairs|United Democracy Project",
    "dmfi": r"Democratic Majority for Israel|\bDMFI\b",
    "fairshake": r"Fairshake|Protect Progress",
    # progressive
    "justicedems": r"Justice Democrats",
    "ourrev": r"Our Revolution",
    "pccc": r"Progressive Change Campaign Committee|\bPCCC\b",
    "cpc": r"Congressional Progressive Caucus",
    "wfp": r"Working Families Party",
    "dsa": r"Democratic Socialists of America",
    "sanders": r"Bernie Sanders",
    "aoc": r"Alexandria Ocasio-Cortez",
    "trackaipac": r"Track AIPAC",
}
PROGRESSIVE = {"justicedems", "ourrev", "pccc", "cpc", "wfp", "dsa", "sanders", "aoc"}
MODERATE = {"welcome", "newdem", "bluedog"}
LEADERSHIP = {"dscc", "dccc", "schumer", "jeffries", "smp", "hmp"}
MONEY = {"aipac", "dmfi", "fairshake"}


def _match_braces(text: str, i: int) -> int:
    """Index just past the '}}' closing the '{{' at text[i]."""
    depth = 0
    k = i
    while k < len(text) - 1:
        if text.startswith("{{", k):
            depth += 1
            k += 2
        elif text.startswith("}}", k):
            depth -= 1
            k += 2
            if depth == 0:
                return k
        else:
            k += 1
    return len(text)


def dem_primary_section(wikitext: str, anchor: int = 0, end: int | None = None) -> str:
    """Text of the first Democratic primary section at any heading level."""
    text = wikitext[anchor:end]
    m = re.search(r"\n(=+)\s*Democratic(?:[–-]Farmer[–-]Labor)?(?: Party)? primary\s*=+\s*\n", text)
    if not m:
        return ""
    lvl = len(m.group(1))
    rest = text[m.end():]
    nxt = re.search(r"\n={1,%d}[^=\n][^\n]*?=+\s*\n" % lvl, rest)
    return text[m.start(): m.end() + (nxt.start() if nxt else len(rest))]


def _boxes(section: str):
    """Yield (title, body) for both endorsement-box styles."""
    for m in BOX.finditer(section):
        yield m.group(1), m.group(2)
    for m in re.finditer(r"\{\{Endorsements box\s*\n", section):
        j = _match_braces(section, m.start())
        body = section[m.start():j]
        t = re.search(r"\|\s*title\s*=\s*([^\n|]*)", body)
        yield (t.group(1) if t else "?"), body


def endorsements(section: str) -> dict[str, dict]:
    """{candidate title: {key: [source urls]}} for every endorsement box."""
    out: dict[str, dict] = {}
    for raw_title, body in _boxes(section):
        title = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", raw_title).strip()
        hits: dict[str, list[str]] = out.setdefault(title, {})
        for line in body.splitlines():
            if not line.lstrip().startswith("*"):
                continue
            plain = REF.sub("", line)
            urls = URL.findall(line)
            for key, pat in PATTERNS.items():
                if re.search(pat, plain, re.I):
                    hits.setdefault(key, []).extend(urls or ["(wikipedia, no inline url)"])
    return out
