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
# v2 (2026-11-07), revised on sample 1; validated on sample 2 only. Spec sections 8 and 9.
CODES = {
    "prices": r"cost of living|costs?|prices?|pricier|inflation|afford\w*|grocer\w*|rent|rents|rental|housing|"
              r"mortgages?|gas|utilit(?:y|ies)|electric(?:ity)? bills?|energy bills?|power bills?|bills|tariffs?|"
              r"expensive|cheaper|price gouging|paycheck to paycheck|make ends meet|kitchen table",
    "health": r"health ?care|medicare|medicaid|obamacare|affordable care act|premiums?|prescriptions?|drug prices|"
              r"insulin|hospitals?|pre-existing",
    "corrupt": r"corrupt\w*|insider trading|stock trad\w*|corporate pacs?|pac money|dark money|big money|"
               r"special interests?|lobbyists?|self-dealing|brib\w*|citizens united|swamp|won'?t be bought|"
               r"bought (?:and paid|by)|megadonors?|mega-donors?|billionaire (?:donors?|class|buddies|friends|backers)|"
               r"funded by|aipac|get(?:ting)? rich|washington insiders?",
    "democracy": r"democracy|authoritarian\w*|dictator\w*|checks and balances|rule of law|fascis\w*|no kings|"
                 r"monarch\w*|rig\w* (?:the |our |their |congressional )?(?:maps?|elections?)|gerrymander\w*|"
                 r"redistrict\w*|power grab|impeach\w*|political retaliation|voting rights|buy elections|"
                 r"constitutional crisis|lawless\w*",
    "abortion": r"abortions?|reproductive|roe|pro-life|pro-choice|ivf|planned parenthood",
    "immig": r"immigra\w*|border|illegal aliens?|migrants?|deport\w*|sanctuary|amnesty",
    "crime": r"crime|criminals?|policing|cops|law enforcement|fentanyl|public safety|defund|cartels?",
    "socialism": r"socialis\w*|communis\w*|marxis\w*|radical[- ]left|far[- ]left|mamdani|the squad|aoc",
    "war": r"iran|wars?|israel|ukraine|gaza|foreign polic\w*|national (?:defense|security)|military|"
           r"defense appropriations",
}
# Phrases removed before a code is searched: they carry the code's words without its topic.
EXCLUDE = {
    "prices": r"pay(?:s|ing)? the price|price of (?:freedom|liberty)|afford to (?:fall|lose|let|miss|sit|wait|be)\w*|"
              r"affordable (?:health ?care|care act)|cost taxpayers",
    "war": r"culture wars?|war chest|war room",
}
CASE_SENSITIVE = {"immig": r"ICE"}
PROCESS = (r"donat\w*|chip in|contribut\w*|deadline|match\w*|vote early|early voting|register to vote|"
           r"polls? (?:open|close)|endors\w*|yard signs?|request a sign|volunteer\w*|rally|kick ?off|cast your ballot|"
           r"vote (?:for|by)|election day|voting locations|survey|any amount")
ISSUES = list(CODES)
RX = {k: re.compile(W + "(?:" + v + ")" + W, re.I) for k, v in CODES.items()}
RX_CS = {k: re.compile(W + v + W) for k, v in CASE_SENSITIVE.items()}
RX_EX = {k: re.compile(v, re.I) for k, v in EXCLUDE.items()}
RX_PROC = re.compile(W + "(?:" + PROCESS + ")" + W, re.I)


def code(text: str) -> dict:
    c = {}
    for k in ISSUES:
        t = RX_EX[k].sub(" ", text) if k in RX_EX else text
        c[k] = bool(RX[k].search(t)) or (k in RX_CS and bool(RX_CS[k].search(t)))
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
                text = re.sub(r"\b" + re.escape(part) + r"\b", "[NAME]", text)  # case-sensitive: "harder" stays
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
    # Sample 2 (validation, spec section 9): fresh units, none from sample 1, drawn once.
    if not (OUT / "sample2_200.csv").exists():
        rest = u[~u.uid.isin(ids)]
        s2 = pd.concat([rest[rest.party == p].sample(100, random_state=20261108) for p in ["DEM", "REP"]])
        s2 = s2.assign(text_blind=s2.text.map(lambda t: deidentify(t, allnames)))
        s2[["uid", "text_blind"]].sample(frac=1, random_state=2).to_csv(OUT / "sample2_200.csv", index=False)
    ids2 = pd.read_csv(OUT / "sample2_200.csv").uid
    u.set_index("uid").loc[ids2, ["party", *ISSUES, "process", "bio"]].reset_index().to_csv(
        OUT / "sample2_200_keyword.csv", index=False)

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
