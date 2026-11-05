"""2026 state primary dates from NCSL's table (cached under data/raw/midterm2026/sources/).

Source: https://www.ncsl.org/elections-and-campaigns/2026-state-primary-election-dates
Replaces an earlier regex over Wikipedia lead text, which picked up filing
deadlines and other dates near the word "primary" (e.g. Texas Jan 15 instead of Mar 3).
"""
from __future__ import annotations

import html
import re
import sys
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import cached_url  # noqa: E402

URL = "https://www.ncsl.org/elections-and-campaigns/2026-state-primary-election-dates"
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


@lru_cache(maxsize=1)
def table() -> dict[str, dict]:
    """{state abbr: {"primary": date, "runoff": date | None}}"""
    t = cached_url(URL, "sources", "ncsl_2026_primary_dates.html").decode("utf-8", "ignore")
    t = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", "", t)
    lines = [x.strip() for x in html.unescape(re.sub(r"<[^>]+>", "\n", t)).splitlines() if x.strip()]
    out = {}
    for i, ln in enumerate(lines):
        if ln in ABBR and ABBR[ln] not in out:
            dates = []
            for nxt in lines[i + 1:i + 4]:
                m = re.fullmatch(r"(\d{2}/\d{2}/2026)", nxt)
                if not m:
                    break
                dates.append(datetime.strptime(m.group(1), "%m/%d/%Y").date())
            if dates:
                out[ABBR[ln]] = {"primary": dates[0], "runoff": dates[1] if len(dates) > 1 else None}
    return out


def primary(st: str) -> date | None:
    return table().get(st, {}).get("primary")
