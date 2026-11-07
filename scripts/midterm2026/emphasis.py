"""Ad emphasis: what each 2026 House campaign spent its Facebook/Instagram ads on.

Spec: reqts/midterm-2026-emphasis.md (sections 3, 5 and 8). Input: data/raw/midterm2026/meta_ads/
(collect-meta-ads.ts). Only ads from the nominee's own pages (own == true) count.

Steps:
  units   one row per distinct ad text per candidate (body + link title + link description),
          spend summed over copies (midpoint of Meta's range; lower bound kept for sensitivity)
  codes   keyword coder, CODES below (frozen 2026-11-07)
  sample  200 de-identified units for the blind reliability check (seed 20261107)
  shares  per candidate, general-election window: spend share of issue ads per code

Outputs (data/derived/midterm2026/emphasis/): units.csv, sample_200.csv, candidate_shares.csv.
"""
from __future__ import annotations

import glob
import hashlib
import json
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

RAW = ROOT / "data" / "raw" / "midterm2026" / "meta_ads"
D = ROOT / "data" / "derived" / "midterm2026"
OUT = D / "emphasis"

W = r"\b"
CODES = {
    "prices": r"cost of living|costs?|prices?|inflation|afford\w*|grocer\w*|rent|rents|housing|mortgages?|gas|"
              r"utilit(?:y|ies)|electric(?:ity)? bills?|energy bills?|bills|tariffs?|paychecks?|wages?|price gouging",
    "health": r"health ?care|medicare|medicaid|obamacare|affordable care act|premiums?|prescriptions?|drug prices|"
              r"insulin|hospitals?|pre-existing",
    "corrupt": r"corrupt\w*|insider trading|stock trad\w*|corporate pacs?|pac money|dark money|special interests?|"
               r"lobbyists?|billionaires?|self-dealing|brib\w*|citizens united|swamp",
    "democracy": r"democracy|constitution\w*|authoritarian\w*|dictator\w*|checks and balances|rule of law|fascis\w*|"
                 r"no kings",
    "abortion": r"abortions?|reproductive|roe|pro-life|pro-choice|ivf|planned parenthood",
    "immig": r"immigra\w*|border|illegal aliens?|migrants?|deport\w*|sanctuary|amnesty",
    "crime": r"crime|criminals?|police|policing|cops|law enforcement|fentanyl|public safety|defund",
    "socialism": r"socialis\w*|communis\w*|marxis\w*|radical[- ]left|far[- ]left|mamdani|the squad|aoc",
    "war": r"iran|wars?|israel|ukraine|troops|foreign polic\w*",
}
CASE_SENSITIVE = {"immig": r"ICE"}
PROCESS = r"donat\w*|chip in|contribut\w*|deadline|match\w*|vote early|early voting|register to vote|polls? (?:open|close)|endors\w*"
ISSUES = list(CODES)
RX = {k: re.compile(W + "(?:" + v + ")" + W, re.I) for k, v in CODES.items()}
RX_CS = {k: re.compile(W + v + W) for k, v in CASE_SENSITIVE.items()}
RX_PROC = re.compile(W + "(?:" + PROCESS + ")" + W, re.I)


def code(text: str) -> dict:
    c = {k: bool(RX[k].search(text)) or (k in RX_CS and bool(RX_CS[k].search(text))) for k in ISSUES}
    issue = any(c.values())
    c["process"] = (not issue) and bool(RX_PROC.search(text))
    c["bio"] = (not issue) and not c["process"]
    return c


def mid(r: dict | None) -> tuple[float, float]:
    if not r:
        return 0.0, 0.0
    lo = float(r.get("lower_bound", 0))
    hi = float(r.get("upper_bound", lo))
    return (lo + hi) / 2, lo


def ads() -> pd.DataFrame:
    rows = []
    for f in sorted(glob.glob(str(RAW / "*.json"))):
        d = json.load(open(f))
        for a in d["ads"]:
            if not a.get("own"):
                continue
            parts = (a.get("ad_creative_bodies") or []) + (a.get("ad_creative_link_titles") or []) + \
                    (a.get("ad_creative_link_descriptions") or [])
            text = " \n".join(dict.fromkeys(p.strip() for p in parts if p and p.strip()))
            sm, sl = mid(a.get("spend"))
            rows.append(dict(race_id=d["race_id"], party=d["party"], nominee=d["nominee"], ad_id=a["id"],
                             start=a.get("ad_delivery_start_time"), text=text, spend_mid=sm, spend_lo=sl,
                             file_error=d.get("error"), file_truncated=bool(d.get("truncated")) or bool(d.get("needs_refetch"))))
    return pd.DataFrame(rows)


def primary_dates() -> pd.Series:
    p = pd.read_csv(D / "house_primaries.csv", usecols=["state", "district", "primary_date"]).dropna()
    p["race_id"] = p.state + "-" + p.district.astype(int).astype(str).str.zfill(2)
    return pd.to_datetime(p.groupby("race_id").primary_date.first(), errors="coerce")


def deidentify(text: str, names: list[str]) -> str:
    for n in names:
        for part in {n, n.split()[-1]}:
            if len(part) > 2:
                text = re.sub(r"\b" + re.escape(part) + r"\b", "[NAME]", text, flags=re.I)
    return text


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    a = ads()
    a = a[a.text.str.len() > 0].copy()
    a["start"] = pd.to_datetime(a.start, errors="coerce")
    pdates = primary_dates()
    a["primary_date"] = a.race_id.map(pdates)
    a["window_from_default"] = a.primary_date.isna()
    a["general"] = a.start > a.primary_date.fillna(pd.Timestamp("2026-06-01"))
    a["uid"] = a.text.map(lambda t: hashlib.sha1(re.sub(r"\s+", " ", t.lower()).encode()).hexdigest()[:12])
    codes = pd.DataFrame([code(t) for t in a.text], index=a.index)
    a = pd.concat([a, codes], axis=1)

    units = (a.groupby(["race_id", "party", "uid"])
             .agg(text=("text", "first"), n_ads=("ad_id", "size"), spend_mid=("spend_mid", "sum"),
                  **{k: (k, "first") for k in ISSUES + ["process", "bio"]}).reset_index())
    units.to_csv(OUT / "units.csv", index=False)

    # blind reliability sample: distinct texts, de-identified, 100 per party
    names = pd.concat([a[["race_id", "nominee"]]]).drop_duplicates()
    allnames = names.nominee.tolist()
    u = units.drop_duplicates("uid")
    # The sample is drawn once and frozen; later runs (after re-fetches) re-code the same uids.
    if not (OUT / "sample_200.csv").exists():
        samp = pd.concat([u[u.party == p].sample(100, random_state=20261107) for p in ["DEM", "REP"]])
        samp = samp.assign(text_blind=samp.text.map(lambda t: deidentify(t, allnames)))
        samp[["uid", "text_blind"]].sample(frac=1, random_state=1).to_csv(OUT / "sample_200.csv", index=False)
    ids = pd.read_csv(OUT / "sample_200.csv").uid
    u.set_index("uid").loc[ids, ["party", *ISSUES, "process", "bio"]].reset_index().to_csv(
        OUT / "sample_200_keyword.csv", index=False)

    g = a[a.general]
    issue = g[g[ISSUES].any(axis=1)]
    rows = []
    for (rid, party), x in g.groupby(["race_id", "party"]):
        ix = issue[(issue.race_id == rid) & (issue.party == party)]
        tot, tot_lo = ix.spend_mid.sum(), ix.spend_lo.sum()
        r = dict(race_id=rid, party=party, nominee=x.nominee.iloc[0], n_ads=len(x), spend_all=x.spend_mid.sum(),
                 spend_issue=tot, window_from_default=bool(x.window_from_default.iloc[0]),
                 file_truncated=bool(x.file_truncated.iloc[0]), file_error=x.file_error.iloc[0])
        for k in ISSUES:
            r[f"{k}_share"] = ix.loc[ix[k], "spend_mid"].sum() / tot if tot > 0 else np.nan
            r[f"{k}_share_lo"] = ix.loc[ix[k], "spend_lo"].sum() / tot_lo if tot_lo > 0 else np.nan
        rows.append(r)
    s = pd.DataFrame(rows)
    s.to_csv(OUT / "candidate_shares.csv", index=False)
    print(f"own ads with text: {len(a)}, distinct texts: {a.uid.nunique()}, units: {len(units)}, "
          f"candidates with general-window ads: {len(s)}, spend ${a.spend_mid.sum() / 1e6:.1f}M")
    print("share of distinct texts with each code:")
    print(u[ISSUES + ["process", "bio"]].mean().round(3).to_string())


if __name__ == "__main__":
    main()
