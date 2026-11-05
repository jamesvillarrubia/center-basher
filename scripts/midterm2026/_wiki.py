"""Parse Wikipedia election boxes from cached wikitext."""
from __future__ import annotations

import re

BOX = re.compile(r"\{\{Election box begin(.*?)\{\{Election box end\}\}", re.S)
CAND = re.compile(r"\{\{Election box (winning )?candidate(?: with party link)?(?: no change)?\s*\|(.*?)\}\}\s*(?=\{\{|\n|$)", re.S)


def _field(body: str, name: str) -> str | None:
    m = re.search(rf"\|\s*{name}\s*=\s*([^|}}]*?(?:\[\[[^\]]*\]\][^|}}]*?)*)\s*(?=\||$)", "|" + body)
    return m.group(1).strip() if m else None


def _clean(s: str | None) -> str | None:
    if s is None:
        return None
    s = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>", "", s, flags=re.S)
    s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"\{\{[^}]*\}\}|'''|''", "", s)
    return s.strip()


def boxes(wikitext: str) -> list[dict]:
    out = []
    for m in BOX.finditer(wikitext):
        block = m.group(0)
        tm = re.search(r"title\s*=\s*(.*?)\n", block)
        title = _clean(tm.group(1)) if tm else ""
        cands = []
        for c in CAND.finditer(block):
            body = c.group(2)
            votes = _clean(_field(body, "votes"))
            pct = _clean(_field(body, "percentage"))
            cands.append({
                "winner": bool(c.group(1)),
                "party": _clean(_field(body, "party")),
                "candidate": _clean(_field(body, "candidate")),
                "votes": int(votes.replace(",", "")) if votes and re.fullmatch(r"[\d,]+", votes) else None,
                "pct": float(pct.rstrip("%")) if pct and re.fullmatch(r"[\d.]+%?", pct) else None,
            })
        out.append({"title": title, "start": m.start(), "candidates": cands})
    return out


def general_box(wikitext: str) -> dict | None:
    """The general-election box: last box whose title is not a primary/runoff/poll."""
    gen = [b for b in boxes(wikitext)
           if not re.search(r"primary|runoff|caucus|convention|hypothetical", b["title"], re.I)
           and len(b["candidates"]) >= 2]
    return gen[-1] if gen else None


def primary_boxes(wikitext: str, party: str = "Democratic") -> list[dict]:
    return [b for b in boxes(wikitext) if re.search(rf"{party}.*primary", b["title"], re.I)]
