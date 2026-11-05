"""Step 1 (House): endorsement lists published by the groups themselves.

Inputs (fetched 2026-11-05, cached under data/raw/midterm2026/endorsers/):
- newdem2.html  https://www.newdemactionfund.com/candidates  (New Democrat Coalition Action Fund)
- welcome_elect.html  https://welcome.team/elect  ("OUR 2026 SLATE", WelcomePAC)
- jd.html  https://justicedemocrats.com/candidates/  (Justice Democrats)
Blue Dog PAC and Our Revolution did not serve a list (connection refused / 404);
those endorsements come only from Wikipedia endorsement boxes.

Output: data/derived/midterm2026/endorser_lists.csv (group, state, district, name, source_url)
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import RAW, ROOT  # noqa: E402

SRC = RAW / "endorsers"
OUT = ROOT / "data" / "derived" / "midterm2026"
ABBR = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA",
    "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
    "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
    "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}


def text_lines(name: str) -> list[str]:
    t = (SRC / name).read_text(encoding="utf-8", errors="ignore")
    t = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", "", t)
    t = html.unescape(re.sub(r"<[^>]+>", "\n", t))
    return [x.strip() for x in t.splitlines() if x.strip() and x.strip() != "‍"]


def newdem() -> list[dict]:
    lines = text_lines("newdem2.html")
    i = lines.index("Endorsed Candidates")
    out = []
    for k in range(i, len(lines)):
        m = re.fullmatch(r"([A-Za-z]{2})-(\d{1,2}|AL)", lines[k])
        if m:
            out.append({"group": "newdem", "state": m.group(1).upper(),
                        "district": 1 if m.group(2) == "AL" else int(m.group(2)),
                        "name": f"{lines[k - 2]} {lines[k - 1]}",
                        "source_url": "https://www.newdemactionfund.com/candidates"})
    return out


def welcome() -> list[dict]:
    lines = text_lines("welcome_elect.html")
    i = lines.index("OUR 2026 SLATE")
    out = []
    for k in range(i, len(lines)):
        m = re.fullmatch(r"([A-Za-z ]+)-(\d{1,2})", lines[k])
        if m and m.group(1) in ABBR:
            out.append({"group": "welcome", "state": ABBR[m.group(1)], "district": int(m.group(2)),
                        "name": lines[k - 1].title(), "source_url": "https://welcome.team/elect"})
        if lines[k].startswith("OUR CANDIDATES"):
            break
    return out


def justice_dems() -> list[dict]:
    lines = text_lines("jd.html")
    i = lines.index("Upcoming Elections", lines.index("Candidates"))
    stop = lines.index("Current Congressmembers", i + 2)
    out = []
    for k in range(i, stop):
        m = re.fullmatch(r"([A-Z]{2})-(\d{1,2})", lines[k])
        if m:
            out.append({"group": "justicedems", "state": m.group(1), "district": int(m.group(2)),
                        "name": lines[k - 1], "source_url": "https://justicedemocrats.com/candidates/"})
    return out


def main() -> None:
    rows = newdem() + welcome() + justice_dems()
    df = pd.DataFrame(rows).drop_duplicates()
    OUT.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT / "endorser_lists.csv", index=False)
    print("endorser_lists.csv:", df.group.value_counts().to_dict())


if __name__ == "__main__":
    main()
