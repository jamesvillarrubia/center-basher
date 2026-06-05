"""
build_voter_maps_all.py — Build §18 voter-map data for 2016, 2020, 2024.

Each cycle gets the same schema. Where a field isn't available for a cycle
(e.g. 2024 doesn't have a reliable prior-vote join), it's left as null/false.

Output:
  data/clean/voter_map_2016.json  (also written by build_voter_map_2016.py)
  data/clean/voter_map_2020.json
  data/clean/voter_map_2024.json
"""
import json
import sys
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, "scripts")
from _lib import load_anes_2016, load_anes_2020, load_anes_2024


# 2016 swing states (Cook/Sabato consensus)
SWING_2016 = {42, 26, 55, 4, 13, 37, 12, 32, 19, 39}
# 2020 swing states (post-2016 toss-ups)
SWING_2020 = {42, 26, 55, 4, 13, 37, 12, 32}
# 2024 swing states (after FL/OH became safer R)
SWING_2024 = {42, 26, 55, 4, 13, 37, 32}


def safe_num(df, col):
    if col not in df.columns:
        return pd.Series([np.nan] * len(df))
    return pd.to_numeric(df[col], errors="coerce")


def build_2016():
    df = load_anes_2016()
    ideo = safe_num(df, "V161126").where(lambda x: x.between(1, 7))
    x = (ideo - 4) / 3.0
    do_right = safe_num(df, "V161215").where(lambda v: v.between(1, 5))
    run_all  = safe_num(df, "V161216").where(lambda v: v.between(1, 2))
    waste    = safe_num(df, "V161217").where(lambda v: v.between(1, 3))
    trust = pd.concat([(5 - do_right) / 4, (run_all - 1) / 1, (waste - 1) / 2], axis=1).mean(axis=1)
    pty = safe_num(df, "V161158x")
    party = pty.apply(lambda p: "dem" if p in (1, 2) else "rep" if p in (4, 5) else "ind" if p == 3 else "")
    gen = safe_num(df, "V162034a")
    vote = gen.map({1: "clinton", 2: "trump", 3: "johnson", 4: "stein", 5: "other"}).fillna("")
    dem_prim = safe_num(df, "V161022")
    rep_prim = safe_num(df, "V161023")
    pv = [("clinton" if d == 1 else "sanders" if d == 2 else "trump" if r == 1 else "")
          for d, r in zip(dem_prim.fillna(0), rep_prim.fillna(0))]
    # Swing = behavioral cross-pressure: independents OR cross-party defectors
    swing = (party == "ind") | ((party == "dem") & (vote == "trump")) | ((party == "rep") & (vote == "clinton"))
    voted_2012 = safe_num(df, "V161005")
    voted_2016 = safe_num(df, "V162031x")
    new_2016 = ((voted_2012 == 2) & (voted_2016 == 1)).fillna(False)
    dropoff  = ((voted_2012 == 1) & (voted_2016 == 0)).fillna(False)
    w = safe_num(df, "V160102").fillna(0).clip(lower=0)
    state = safe_num(df, "V161010d")
    in_swing = state.isin(SWING_2016)
    return assemble_records(x, trust, party, vote, pv, swing, new_2016, dropoff, in_swing, w)


def build_2020():
    df = load_anes_2020()
    ideo = safe_num(df, "V201200").where(lambda x: x.between(1, 7))
    x = (ideo - 4) / 3.0
    do_right = safe_num(df, "V201233").where(lambda v: v.between(1, 5))
    run_all  = safe_num(df, "V201234").where(lambda v: v.between(1, 2))
    waste    = safe_num(df, "V201235").where(lambda v: v.between(1, 3))
    trust = pd.concat([(5 - do_right) / 4, (run_all - 1) / 1, (waste - 1) / 2], axis=1).mean(axis=1)
    pty = safe_num(df, "V201231x")
    party = pty.apply(lambda p: "dem" if p in (1, 2) else "rep" if p in (4, 5) else "ind" if p == 3 else "")
    gen = safe_num(df, "V202073")
    # 2020 post-election vote: 1=Biden, 2=Trump, 3=Jorgensen, 4=Hawkins, 5=other
    vote = gen.map({1: "biden", 2: "trump", 3: "jorgensen", 4: "hawkins", 5: "other"}).fillna("")
    pv = ["" for _ in range(len(df))]  # primary vote not heavily reported for 2020 in this format
    # Swing = behavioral cross-pressure
    swing = (party == "ind") | ((party == "dem") & (vote == "trump")) | ((party == "rep") & (vote == "biden"))
    # Prior vote: 2016 (V201101=did you vote in 2016, V201103=who)
    voted_2016 = safe_num(df, "V201101")
    voted_2020 = safe_num(df, "V202109x")
    new_2020 = ((voted_2016 == 2) & (voted_2020 == 1)).fillna(False)
    dropoff  = ((voted_2016 == 1) & (voted_2020 == 0)).fillna(False)
    w = safe_num(df, "V200010a").fillna(0).clip(lower=0)
    state = safe_num(df, "V201014b")
    in_swing = state.isin(SWING_2020)
    return assemble_records(x, trust, party, vote, pv, swing, new_2020, dropoff, in_swing, w)


def build_2024():
    df = load_anes_2024()
    ideo = safe_num(df, "V241177").where(lambda x: x.between(1, 7))
    x = (ideo - 4) / 3.0
    do_right = safe_num(df, "V241229").where(lambda v: v.between(1, 5))
    run_all  = safe_num(df, "V241231").where(lambda v: v.between(1, 2))
    waste    = safe_num(df, "V241232").where(lambda v: v.between(1, 3))
    trust = pd.concat([(5 - do_right) / 4, (run_all - 1) / 1, (waste - 1) / 2], axis=1).mean(axis=1)
    # FIXED: V241228 is a single-item party question with non-standard codes.
    # V241227x is the canonical 7-pt party ID summary (1=strong D, 7=strong R, 4=ind).
    pty = safe_num(df, "V241227x")
    party = pty.apply(lambda p: "dem" if p in (1, 2, 3) else "rep" if p in (5, 6, 7) else "ind" if p == 4 else "")
    gen = safe_num(df, "V242067")
    # 2024 vote: 1=Harris, 2=Trump, 4=West, 5=Stein, 6=Other. Code 6 was
    # silently dropped before the audit.
    vote = gen.map({1: "harris", 2: "trump", 3: "kennedy", 4: "west", 5: "stein", 6: "other"}).fillna("")
    pv = ["" for _ in range(len(df))]
    swing = (party == "ind") | ((party == "dem") & (vote == "trump")) | ((party == "rep") & (vote == "harris"))
    # PRIOR (2020) TURNOUT — fixed per adversarial audit:
    #   V241049 is NOT 2020 turnout. It's a hypothetical "if Harris vs Trump
    #   head-to-head, who would you vote for or not vote" question.
    #   V241106x is the actual prior-vote recall (1=did not vote 2020,
    #   2=Biden, 3=Trump, 4=other). voted_2020_yes = code in {2,3,4}.
    p20 = safe_num(df, "V241106x")
    voted_2020_yes = p20.isin([2, 3, 4])
    voted_2020_no  = (p20 == 1)
    # 2024 TURNOUT — fixed per audit:
    #   V242065 codes 1=did NOT vote, 4=sure voted (2 & 3 are intermediate).
    #   V242066 is the cleaner binary (1=voted for president, 2=did not).
    p24 = safe_num(df, "V242066")
    voted_2024_yes = (p24 == 1)
    voted_2024_no  = (p24 == 2)
    new_v   = (voted_2020_no  & voted_2024_yes).fillna(False)
    dropoff = (voted_2020_yes & voted_2024_no ).fillna(False)
    w = safe_num(df, "V240107a").fillna(0).clip(lower=0)
    state_str = df["V243002"].astype(str).str.strip() if "V243002" in df.columns else pd.Series([""] * len(df))
    state = pd.to_numeric(state_str, errors="coerce")
    in_swing = state.isin(SWING_2024)
    return assemble_records(x, trust, party, vote, pv, swing, new_v, dropoff, in_swing, w)


def assemble_records(x, trust, party, vote, pv, swing, new_v, dropoff, in_swing, w):
    m = x.notna() & trust.notna() & (w > 0)
    records = []
    n_swing = n_new = n_drop = n_in_swing = 0
    for i in range(len(x)):
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
            "n2":  bool(new_v.iloc[i]),
            "do":  bool(dropoff.iloc[i]),
            "s":   bool(in_swing.iloc[i]),
        }
        records.append(rec)
        n_swing += rec["sw"]; n_new += rec["n2"]; n_drop += rec["do"]; n_in_swing += rec["s"]
    return records, dict(n=len(records), n_swing=n_swing, n_new=n_new, n_drop=n_drop, n_in_swing=n_in_swing)


CANDIDATES_BY_YEAR = {
    2016: [
        {"id": "clinton", "short": "Clinton",  "color": "#2c5b9c", "x": -0.325, "y": 0.277, "n": 1064},
        {"id": "sanders", "short": "Sanders",  "color": "#4a9b6d", "x": -0.421, "y": 0.224, "n": 339},
        {"id": "trump",   "short": "Trump",    "color": "#b8240f", "x":  0.455, "y": 0.140, "n": 1002},
    ],
    2020: [
        {"id": "biden",   "short": "Biden",    "color": "#2c5b9c", "x": -0.280, "y": 0.250, "n": None},
        {"id": "trump",   "short": "Trump",    "color": "#b8240f", "x":  0.480, "y": 0.130, "n": None},
    ],
    2024: [
        {"id": "harris",  "short": "Harris",   "color": "#2c5b9c", "x": -0.270, "y": 0.235, "n": None},
        {"id": "trump",   "short": "Trump",    "color": "#b8240f", "x":  0.495, "y": 0.120, "n": None},
    ],
}


def compute_centroids(records, vote_to_label):
    """For 2020/2024, compute candidate centroids from the actual data."""
    out = {}
    for vote_key, label in vote_to_label.items():
        cohort = [r for r in records if r["v"] == vote_key and r["w"] > 0]
        if not cohort:
            continue
        sw = sum(r["w"] for r in cohort)
        cx = sum(r["x"] * r["w"] for r in cohort) / sw
        cy = sum(r["y"] * r["w"] for r in cohort) / sw
        out[label] = (round(cx, 3), round(cy, 3), len(cohort))
    return out


def main():
    for year, builder in [(2016, build_2016), (2020, build_2020), (2024, build_2024)]:
        print(f"=== {year} ===")
        records, stats = builder()
        print(f"  {stats}")

        # Compute candidate centroids from data for 2020/2024
        cands = list(CANDIDATES_BY_YEAR[year])
        if year == 2020:
            cent = compute_centroids(records, {"biden": "biden", "trump": "trump"})
            for c in cands:
                if c["id"] in cent:
                    c["x"], c["y"], c["n"] = cent[c["id"]]
        elif year == 2024:
            cent = compute_centroids(records, {"harris": "harris", "trump": "trump"})
            for c in cands:
                if c["id"] in cent:
                    c["x"], c["y"], c["n"] = cent[c["id"]]

        payload = {
            "year": year,
            "source": f"ANES {year} Time Series Study, weighted.",
            "candidates": cands,
            "n_voters": stats["n"],
            "n_swing": stats["n_swing"],
            "n_new":   stats["n_new"],
            "n_drop":  stats["n_drop"],
            "n_in_swing": stats["n_in_swing"],
            "voters":  records,
        }
        out = f"data/clean/voter_map_{year}.json"
        with open(out, "w") as f:
            json.dump(payload, f, separators=(",", ":"))
        print(f"  Wrote {out}")


if __name__ == "__main__":
    main()
