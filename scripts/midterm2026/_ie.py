"""FEC independent expenditures, 2026 cycle, from the bulk file (no API key).

Dedupe rule: drop every row whose file_num is named as prev_file_num by a later
filing (the amendment supersedes it), then drop exact repeats of
(spender, candidate, support/oppose, amount, dissemination-or-expenditure date,
payee, purpose), which removes 24/48-hour notices re-reported on regular
Schedule E.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
BULK = ROOT / "data" / "raw" / "fec" / "bulk2026"

# Spender groups named in the brief, matched on FEC committee id.
# UDP pass-throughs: committees that received >= $1M from UDP in 2025-26
# (FEC Schedule B for C00799031, top 60 disbursements by amount, fetched 2026-11-05).
GROUPS = {
    "aipac": {
        "C00799031": "United Democracy Project (UDP)",
        "C00710848": "DMFI PAC",
        "C00936724": "Elect Chicago Women (UDP-funded)",
        "C00854299": "Bold America (UDP-funded)",
        "C00863472": "EDW Action Fund (UDP-funded)",
        "C00757419": "SD PAC (UDP-funded)",
        "C00935049": "Affordable Chicago Now (UDP-funded)",
        "C00950600": "Palmetto Action (UDP-funded)",
    },
    "crypto": {
        "C00835959": "Fairshake",
        "C00848440": "Protect Progress",
        "C00836221": "Defend American Jobs",
    },
    "ai": {
        "C00923417": "Think Big",
        "C00916692": "American Mission",
    },
}
_ID2GROUP = {cid: g for g, ids in GROUPS.items() for cid in ids}


def group_of(spe_id: str) -> str | None:
    return _ID2GROUP.get(spe_id)


@lru_cache(maxsize=1)
def ie() -> pd.DataFrame:
    d = pd.read_csv(BULK / "independent_expenditure_2026.csv", dtype=str)
    d["amt"] = pd.to_numeric(d.exp_amo, errors="coerce").fillna(0.0)
    d = d[~d.file_num.isin(set(d.prev_file_num.dropna()))]
    d = d.assign(dt=d.dissem_dt.fillna(d.exp_date))
    d = d.drop_duplicates(["spe_id", "cand_id", "sup_opp", "amt", "dt", "pay", "pur"])
    # Junk filings: single line items of $100M or more (Form 5 filings listing
    # "Warren Buffet", "TANKING", "DJIA" as $1-9 billion expenditures, 2026-11-05 file).
    d = d[d.amt < 1e8]
    d["group"] = d.spe_id.map(group_of)
    return d
