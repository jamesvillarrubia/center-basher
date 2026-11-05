"""Step 2 (House): Democratic primary candidates, endorsements and primary results.

Reads the cached Wikipedia state pages (data/raw/midterm2026/wiki/) and writes
data/derived/midterm2026/house_primaries.csv, one row per Democratic primary
candidate who appears in an endorsement box or a primary-results box.

Rules (also in data/derived/midterm2026/README.md):
- An endorsement counts only when it is not struck through (<s>, {{strikethrough}}).
- An endorsement is "pre-primary" when its citation date is before the state's
  primary date (NCSL table, _primary_dates.py), or when it carries no date.
- Endorser groups are matched by name with the regexes in _endorse.PATTERNS.
"""
from __future__ import annotations

import re
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _endorse import PATTERNS, REF, URL, _boxes, dem_primary_section  # noqa: E402
from _fetch import ROOT, wiki_meta, wiki_wikitext  # noqa: E402
from _wiki import primary_boxes  # noqa: E402
from _primary_dates import primary as ncsl_primary  # noqa: E402

OUT = ROOT / "data" / "derived" / "midterm2026"
STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts",
    "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New_Hampshire", "NJ": "New_Jersey",
    "NM": "New_Mexico", "NY": "New_York", "NC": "North_Carolina", "ND": "North_Dakota",
    "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode_Island",
    "SC": "South_Carolina", "SD": "South_Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West_Virginia",
    "WI": "Wisconsin", "WY": "Wyoming",
}
MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
STRUCK = re.compile(r"<s>|\{\{\s*(strikethrough|strike|s)\s*\|", re.I)


def page_for(st: str) -> str:
    name = STATES[st]
    for p in (f"2026_United_States_House_of_Representatives_elections_in_{name}",
              f"2026_United_States_House_of_Representatives_election_in_{name}"):
        try:
            wiki_wikitext(p)
            return p
        except KeyError:
            continue
    raise KeyError(st)


def primary_date(wikitext: str) -> datetime | None:
    lead = wikitext[:20000]
    m = re.search(rf"primar(?:y|ies)[^.]{{0,120}}?(({MONTHS}) \d{{1,2}}, 2026)", lead)
    return datetime.strptime(m.group(1), "%B %d, %Y") if m else None


def parse_date(s: str) -> datetime | None:
    s = s.strip()
    for fmt in ("%B %d, %Y", "%Y-%m-%d", "%d %B %Y", "%b %d, %Y"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    return None


def district_sections(wikitext: str) -> dict[int, str]:
    heads = list(re.finditer(r"\n==\s*District (\d+)\s*==\s*\n", wikitext))
    if not heads:  # at-large state: the whole page is district 1
        return {1: wikitext}
    out = {}
    for k, h in enumerate(heads):
        end = heads[k + 1].start() if k + 1 < len(heads) else len(wikitext)
        out[int(h.group(1))] = wikitext[h.start():end]
    return out


def clean_name(s: str) -> str:
    s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"''.*?''|\(.*?\)|\{\{.*?\}\}|<.*?>", "", s)
    return s.strip()


def candidate_descriptions(section: str) -> dict[str, str]:
    """name -> description from the Nominee / Eliminated bullet lists."""
    out = {}
    for line in section.splitlines():
        m = re.match(r"\*\s*(\[\[[^\]]+\]\]|[^,<]+),\s*([^<]*)", line)
        if m:
            out[clean_name(m.group(1))] = m.group(2).strip()
    return out


def main() -> None:
    rows = []
    pages = []
    for st in STATES:
        page = page_for(st)
        pages.append(wiki_meta(page))
        w = wiki_wikitext(page)
        # NCSL table (primary_date() below is kept only for reference: its regex
        # picked filing deadlines and other nearby dates, fixed 2026-11-05).
        nd = ncsl_primary(st)
        pdate = datetime(nd.year, nd.month, nd.day) if nd else primary_date(w)
        for dist, sec in district_sections(w).items():
            dsec = dem_primary_section(sec)
            if not dsec:
                continue
            descs = candidate_descriptions(dsec)
            results = {}
            for b in primary_boxes(dsec):
                if re.search(r"runoff", b["title"], re.I):
                    continue
                for c in b["candidates"]:
                    results[clean_name(c["candidate"] or "")] = (c["pct"], c["winner"])
                break
            cands: dict[str, dict] = {}
            for raw_title, body in _boxes(dsec):
                title = clean_name(raw_title)
                if not title or title.lower().startswith(("declined", "withdrawn", "neutral")):
                    continue
                rec = cands.setdefault(title, {})
                for line in body.splitlines():
                    if not line.lstrip().startswith("*") or STRUCK.search(line):
                        continue
                    plain = REF.sub("", line)
                    dates = [parse_date(x) for x in re.findall(r"\|\s*date\s*=\s*([^|}]+)", line)]
                    dates = [d for d in dates if d]
                    pre = (not dates) or (pdate is None) or (min(dates) < pdate)
                    urls = URL.findall(line)
                    for key, pat in PATTERNS.items():
                        if re.search(pat, plain, re.I):
                            r = rec.setdefault(key, {"pre": False, "urls": []})
                            r["pre"] = r["pre"] or pre
                            r["urls"] += urls
            names = set(cands) | set(results)
            for name in names:
                pct, won = results.get(name, (None, None))
                e = cands.get(name, {})
                desc = next((v for k, v in descs.items() if k and (k in name or name in k)), "")
                rows.append({
                    "state": st, "district": dist, "candidate": name,
                    "description": desc[:200],
                    "primary_pct": pct, "primary_winner": won,
                    "primary_date": pdate.date().isoformat() if pdate else None,
                    **{f"e_{k}": int(bool(e.get(k, {}).get("pre"))) for k in PATTERNS},
                    "endorse_sources": " ".join(sorted({u for v in e.values() for u in v["urls"]}))[:2000],
                    "wiki_page": page,
                })
    df = pd.DataFrame(rows)
    OUT.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT / "house_primaries.csv", index=False)
    pd.DataFrame(pages).to_csv(OUT / "wiki_revisions_house.csv", index=False)
    print(f"house_primaries.csv: {len(df)} candidate rows, "
          f"{df[['state', 'district']].drop_duplicates().shape[0]} districts with a Dem primary section")


if __name__ == "__main__":
    main()
