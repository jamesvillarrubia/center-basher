"""
build_voter_map_2016.py — Build §18 Figure A data directly from ANES 2016.

Per-voter fields needed:
  x:           V161126 ideology (-1 = strong liberal, +1 = strong conservative)
  y:           trust composite from V161215/V161216/V161217 (0 = no trust, 1 = full)
  p:           party affiliation (V161158x: strong/lean dem, ind, strong/lean rep)
  v:           general election vote (V162034a recoded to clinton/trump/johnson/stein/other)
  pv:          democratic primary vote (V161022x recoded to clinton/sanders/other)
  swing:       1 if respondent reported being undecided in pre-election (V161031==2)
  new_2016:    1 if voted 2016 but NOT in 2012 (V161005 == 2)
  dropoff:     1 if voted 2012 but NOT in 2016 (V161005 == 1 AND V162031x != 1)
  w:           V160102 weight

Candidate centroids stay hardcoded from the v1 candidates.js methodology
(ANES voter-base means for Clinton, Trump, Sanders).
"""
import json
import sys
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

sys.path.insert(0, "scripts")
from _lib import load_anes_2016


def main():
    df = load_anes_2016()

    # IDEOLOGY: V161126 is 1-7 (1=ext lib, 7=ext con). Map to -1..+1.
    ideo = pd.to_numeric(df["V161126"], errors="coerce").where(lambda x: x.between(1, 7))
    x = (ideo - 4) / 3.0  # 1 → -1, 7 → +1, 4 → 0

    # TRUST: 3-item composite
    do_right = pd.to_numeric(df["V161215"], errors="coerce").where(lambda v: v.between(1, 5))
    run_all  = pd.to_numeric(df["V161216"], errors="coerce").where(lambda v: v.between(1, 2))
    waste    = pd.to_numeric(df["V161217"], errors="coerce").where(lambda v: v.between(1, 3))
    # Normalize each to 0-1 with HIGH = more trust
    do_right_n = (5 - do_right) / 4.0   # 1=always (high trust) → 1.0, 5=never → 0
    run_all_n  = (run_all - 1) / 1.0    # 1=few interests (low trust) → 0, 2=all → 1
    waste_n    = (waste - 1) / 2.0      # 1=a lot wasted → 0, 3=not much → 1
    trust = pd.concat([do_right_n, run_all_n, waste_n], axis=1).mean(axis=1)

    # PARTY (V161158x: 1=strong D, 2=lean D, 3=ind, 4=lean R, 5=strong R, 6=DK, 7=other)
    pty_raw = pd.to_numeric(df["V161158x"], errors="coerce")
    def pty_label(p):
        if p in (1, 2): return "dem"
        if p in (4, 5): return "rep"
        if p == 3:      return "ind"
        return ""
    party = pty_raw.apply(pty_label)

    # GENERAL VOTE (V162034a: 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other)
    gen = pd.to_numeric(df["V162034a"], errors="coerce")
    vote_map = {1: "clinton", 2: "trump", 3: "johnson", 4: "stein", 5: "other"}
    vote = gen.map(vote_map).fillna("")

    # PRIMARY VOTE (V161021 = which primary; V161022 = Dem candidate, V161023 = Rep candidate)
    # V161022: 1=Clinton, 2=Sanders, 3=O'Malley, 4=other
    dem_prim = pd.to_numeric(df["V161022"], errors="coerce") if "V161022" in df.columns else pd.Series([], dtype=float)
    rep_prim = pd.to_numeric(df["V161023"], errors="coerce") if "V161023" in df.columns else pd.Series([], dtype=float)
    def prim_label(d, r):
        if d == 1: return "clinton"
        if d == 2: return "sanders"
        if r == 1: return "trump"  # 1 in V161023 = Trump
        return ""
    pv = [prim_label(d, r) for d, r in zip(dem_prim.fillna(0), rep_prim.fillna(0))]

    # SWING (behavioral): cross-pressured voters whose vote did not match a
    # straight partisan signal. Three components:
    #   • Independents (party=ind) — structurally not committed to either side
    #   • Dem→Trump defectors (party_lean dem but voted Trump in general)
    #   • Rep→Clinton defectors (party_lean rep but voted Clinton in general)
    # The old V161031 definition (undecided pre-election) was right-skewed
    # because it captured "wavering Republican" sentiment in 2016 specifically,
    # not the broader cross-pressured cohort.
    swing = (
        (party == "ind")
        | ((party == "dem") & (vote == "trump"))
        | ((party == "rep") & (vote == "clinton"))
    )

    # 2012 turnout (V161005: 1=yes, 2=no)
    voted_2012 = pd.to_numeric(df["V161005"], errors="coerce")
    voted_2012_yes = (voted_2012 == 1)
    voted_2012_no  = (voted_2012 == 2)
    # 2016 validated turnout (V162031x: 1=voted, 0=didn't, -2=no post)
    voted_2016 = pd.to_numeric(df["V162031x"], errors="coerce") if "V162031x" in df.columns else None
    voted_2016_yes = (voted_2016 == 1) if voted_2016 is not None else pd.Series([False] * len(df))
    voted_2016_no  = (voted_2016 == 0) if voted_2016 is not None else pd.Series([False] * len(df))

    # New voters: didn't vote 2012, voted 2016
    new_2016 = (voted_2012_no & voted_2016_yes).fillna(False)
    # Drop-off voters: voted 2012, didn't vote 2016
    dropoff  = (voted_2012_yes & voted_2016_no).fillna(False)
    # Returning voters: voted both
    returning = (voted_2012_yes & voted_2016_yes).fillna(False)

    # WEIGHT
    w = pd.to_numeric(df.get("V160102", df.get("V160101")), errors="coerce").fillna(0).clip(lower=0)

    # STATE FIPS — V161010d
    state = pd.to_numeric(df["V161010d"], errors="coerce") if "V161010d" in df.columns else pd.Series([None]*len(df))
    # 2016 swing states: PA=42, MI=26, WI=55, AZ=4, GA=13, NC=37, FL=12, NV=32, IA=19, OH=39
    SWING_2016 = {42, 26, 55, 4, 13, 37, 12, 32, 19, 39}
    in_swing = state.isin(SWING_2016)

    # Drop rows missing core fields
    m = x.notna() & trust.notna() & (w > 0)
    records = []
    n_new = n_drop = n_swing = 0
    for i in range(len(df)):
        if not m.iloc[i]:
            continue
        rec = {
            "x":   round(float(x.iloc[i]), 3),
            "y":   round(float(trust.iloc[i]), 3),
            "p":   party.iloc[i],
            "v":   vote.iloc[i],
            "pv":  pv[i],
            "w":   round(float(w.iloc[i]), 3),
            "sw":  bool(swing.iloc[i]),
            "n2":  bool(new_2016.iloc[i]),
            "do":  bool(dropoff.iloc[i]),
            "s":   bool(in_swing.iloc[i]),
        }
        records.append(rec)
        n_new   += rec["n2"]
        n_drop  += rec["do"]
        n_swing += rec["sw"]
    print(f"Total voters: {len(records)}")
    print(f"  swing (undecided pre-election): {n_swing}")
    print(f"  new voters (2016 yes, 2012 no): {n_new}")
    print(f"  drop-off (2012 yes, 2016 no):   {n_drop}")

    # Candidate centroids (hardcoded from v1 candidates.js)
    candidates = [
        {"id": "clinton", "name": "Hillary Clinton", "short": "Clinton",
         "party": "D", "color": "#2c5b9c", "x": -0.325, "y": 0.277, "n": 1064,
         "note": "general-election voter centroid (n=1,064)"},
        {"id": "sanders", "name": "Bernie Sanders", "short": "Sanders",
         "party": "I", "color": "#4a9b6d", "x": -0.421, "y": 0.224, "n": 339,
         "note": "PRIMARY voter centroid (n=339)"},
        {"id": "trump",   "name": "Donald Trump",   "short": "Trump",
         "party": "R", "color": "#b8240f", "x":  0.455, "y": 0.140, "n": 1002,
         "note": "general-election voter centroid (n=1,002)"},
    ]

    def dist(a, b): return ((a["x"]-b["x"])**2 + (a["y"]-b["y"])**2) ** 0.5
    c, s, t = candidates
    distances = {
        "sanders_to_clinton": round(dist(s, c), 3),
        "sanders_to_trump":   round(dist(s, t), 3),
        "sanders_to_clinton_trust_only": round(abs(s["y"]-c["y"]), 3),
        "sanders_to_trump_trust_only":   round(abs(s["y"]-t["y"]), 3),
    }

    payload = {
        "source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust composite (0-1, higher=more trust). Cohorts: swing=V161031 undecided; new_2016=voted 2016 (V162031x), not 2012 (V161005); drop-off=voted 2012, not 2016.",
        "method": "Per-respondent fields. Candidate centroids = ANES voter-base means. Sanders is Democratic primary voters (no general-election cohort).",
        "candidates": candidates,
        "distances": distances,
        "n_voters": len(records),
        "n_swing": n_swing,
        "n_new":   n_new,
        "n_drop":  n_drop,
        "voters":  records,
    }
    with open("data/clean/voter_map_2016.json", "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"Wrote data/clean/voter_map_2016.json")


if __name__ == "__main__":
    main()
