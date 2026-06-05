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
    # V161158x is the standard ANES 7-pt party summary:
    #   1=Strong D, 2=Weak D, 3=Lean D, 4=Pure Independent,
    #   5=Lean R, 6=Weak R, 7=Strong R
    pty = safe_num(df, "V161158x")
    party = pty.apply(lambda p: "dem" if p in (1, 2, 3) else "rep" if p in (5, 6, 7) else "ind" if p == 4 else "")
    gen = safe_num(df, "V162034a")
    vote = gen.map({1: "clinton", 2: "trump", 3: "johnson", 4: "stein", 5: "other"}).fillna("")
    # PRIMARY VOTE — 2016 ANES uses V161021a (NOT V161022 / V161023).
    # CODEBOOK-VERIFIED: V161021a 'For which candidate did R vote in Presidential prim'
    #   1=Clinton, 2=Sanders, 3=Another Dem, 4=Trump, 5=Cruz, 6=Kasich,
    #   7=Rubio, 8=Another Rep, 9=Someone else not D/R.
    # Universe: IF R VOTED IN A PRESIDENTIAL PRIMARY OR CAUCUS.
    #
    # KNOWN-BUG-FIXED 2026-06-05: earlier code used V161022 ("Already voted
    # in General Election", 1=have voted, 2=have not voted) treating code
    # 2 as 'sanders'. That misclassified 3,467 respondents as Sanders
    # primary voters. And V161023 ("In what manner did R vote") had been
    # misused as the Republican primary; that is the early-vote method
    # question, not a candidate question.
    prim = safe_num(df, "V161021a")
    pv_map = {1: "clinton", 2: "sanders", 4: "trump"}
    pv = [pv_map.get(int(p), "") if pd.notna(p) and p in pv_map else "" for p in prim]
    # Swing = behavioral cross-pressure: independents OR cross-party defectors
    swing = (party == "ind") | ((party == "dem") & (vote == "trump")) | ((party == "rep") & (vote == "clinton"))
    voted_2012 = safe_num(df, "V161005")
    voted_2016 = safe_num(df, "V162031x")
    # AUDIT FIX (per user direction): drop V162031x == -2 (not ascertained)
    # respondents from the dataset entirely. -2 = the post-election turnout
    # question wasn't successfully asked, so we cannot classify them as
    # voters or non-voters and should not include them in the voter map.
    ascertained_2016 = voted_2016.isin([0, 1])  # only keep clean 0/1 values
    new_2016 = ((voted_2012 == 2) & (voted_2016 == 1)).fillna(False)
    dropoff  = ((voted_2012 == 1) & (voted_2016 == 0)).fillna(False)
    w = safe_num(df, "V160102").fillna(0).clip(lower=0)
    state = safe_num(df, "V161010d")
    in_swing = state.isin(SWING_2016)
    # Apply the -2 drop by zeroing the weight (assemble_records filters w > 0)
    w = w.where(ascertained_2016, 0)
    return assemble_records(x, trust, party, vote, pv, swing, new_2016, dropoff, in_swing, w)


def build_2020():
    df = load_anes_2020()
    ideo = safe_num(df, "V201200").where(lambda x: x.between(1, 7))
    x = (ideo - 4) / 3.0
    do_right = safe_num(df, "V201233").where(lambda v: v.between(1, 5))
    run_all  = safe_num(df, "V201234").where(lambda v: v.between(1, 2))
    waste    = safe_num(df, "V201235").where(lambda v: v.between(1, 3))
    trust = pd.concat([(5 - do_right) / 4, (run_all - 1) / 1, (waste - 1) / 2], axis=1).mean(axis=1)
    # V201231x is the standard ANES 7-pt party summary (same scale as 2016/2024):
    #   1=Strong D, 2=Weak D, 3=Lean D, 4=Pure Independent,
    #   5=Lean R, 6=Weak R, 7=Strong R
    pty = safe_num(df, "V201231x")
    party = pty.apply(lambda p: "dem" if p in (1, 2, 3) else "rep" if p in (5, 6, 7) else "ind" if p == 4 else "")
    gen = safe_num(df, "V202073")
    # 2020 post-election vote: 1=Biden, 2=Trump, 3=Jorgensen, 4=Hawkins, 5=other
    vote = gen.map({1: "biden", 2: "trump", 3: "jorgensen", 4: "hawkins", 5: "other"}).fillna("")
    pv = ["" for _ in range(len(df))]  # primary vote not heavily reported for 2020 in this format
    # Swing = behavioral cross-pressure
    swing = (party == "ind") | ((party == "dem") & (vote == "trump")) | ((party == "rep") & (vote == "biden"))
    # Prior vote: 2020 ANES split-sampled the 2016-recall question into
    # V201101 (version 1A) and V201102 (version 1B). EACH respondent got
    # only one of the two; the other shows -1 (inapplicable). Using V201101
    # alone misses ~half the sample.
    # CORRECT: take whichever value the respondent has.
    v1 = safe_num(df, "V201101")
    v2 = safe_num(df, "V201102")
    voted_2016 = pd.Series([float("nan")] * len(df), index=df.index)
    voted_2016 = voted_2016.where(~v1.isin([1, 2]), v1)
    voted_2016 = voted_2016.where(~v2.isin([1, 2]), v2)
    voted_2020 = safe_num(df, "V202109x")
    new_2020 = ((voted_2016 == 2) & (voted_2020 == 1)).fillna(False)
    dropoff  = ((voted_2016 == 1) & (voted_2020 == 0)).fillna(False)
    # Weight: V200010b is POST weight (correct for vote-choice analysis since
    # voters' vote is collected post-election). V200010a was incorrectly used
    # earlier; the audit caught it.
    w = safe_num(df, "V200010b").fillna(0).clip(lower=0)
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
    # 2024 vote: 1=Harris, 2=Trump, 4=West, 5=Stein, 6=Other.
    # CODEBOOK-VERIFIED: code 3 does NOT exist for this variable. Kennedy
    # withdrew from the race before the codebook was finalized. Earlier
    # versions of this code had {3: "kennedy"} — that's dead code and removed.
    vote = gen.map({1: "harris", 2: "trump", 4: "west", 5: "stein", 6: "other"}).fillna("")
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
    # 2024 TURNOUT — corrected 2026-06-05 after V242066-universe miss.
    #
    # V242066 Universe: "IF R REPORTED IN THE POST SURVEY THAT R VOTED".
    # That means V242066 is asking "of voters, did you vote for PRESIDENT".
    # It is NOT a turnout question. Used as such, it under-counts non-voters
    # by ~95% (only 39 of 5521 respondents have V242066==2).
    #
    # V242065 Universe: "IF R DID NOT REPORT IN THE PRE THAT R ALREADY VOTED".
    # So V242065 captures everyone who hadn't already early-voted. Codes
    # 1/2/3 = various did-not-vote; 4 = sure voted.
    #
    # V241035 == 1: "Have voted" in pre-election (early voters).
    #
    # CORRECT turnout binary combines both:
    #   voted = (V241035 == 1)  OR  (V242065 == 4)
    #   not_voted = (V242065 in {1,2,3}) AND NOT (V241035 == 1)
    early_voted = (safe_num(df, "V241035") == 1)
    v242065 = safe_num(df, "V242065")
    voted_2024_yes = (early_voted | (v242065 == 4)).fillna(False)
    voted_2024_no  = (v242065.isin([1, 2, 3]) & ~early_voted).fillna(False)
    new_v   = (voted_2020_no  & voted_2024_yes).fillna(False)
    dropoff = (voted_2020_yes & voted_2024_no ).fillna(False)
    # Weight: V240107b is POST weight (correct for vote-choice analysis).
    # V240107a is PRE weight — was incorrectly used earlier.
    w = safe_num(df, "V240107b").fillna(0).clip(lower=0)
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


def weighted_median(values, weights):
    """Weighted median: smallest v such that cumulative weight ≥ totalW/2."""
    pairs = sorted(zip(values, weights), key=lambda p: p[0])
    total = sum(w for _, w in pairs)
    cum = 0
    for v, w in pairs:
        cum += w
        if cum >= total / 2:
            return v
    return pairs[-1][0]


def weighted_quantile(values, weights, q):
    """Weighted q-quantile (q in [0, 1])."""
    pairs = sorted(zip(values, weights), key=lambda p: p[0])
    total = sum(w for _, w in pairs)
    cum = 0
    for v, w in pairs:
        cum += w
        if cum >= total * q:
            return v
    return pairs[-1][0]


def median_and_iqr(rows):
    """Return (mx, my, x25, x75, y25, y75, n) for a list of {x,y,w} records."""
    xs = [r["x"] for r in rows]
    ys = [r["y"] for r in rows]
    ws = [r["w"] for r in rows]
    return (
        round(weighted_median(xs, ws), 3),
        round(weighted_median(ys, ws), 3),
        round(weighted_quantile(xs, ws, 0.25), 3),
        round(weighted_quantile(xs, ws, 0.75), 3),
        round(weighted_quantile(ys, ws, 0.25), 3),
        round(weighted_quantile(ys, ws, 0.75), 3),
        len(rows),
    )


def compute_centroids(records, vote_to_label):
    """Per-candidate MEDIAN (x, y) + IQR ellipse parameters.

    Returns {label: dict(x, y, x25, x75, y25, y75, n)} so the chart can draw
    both the median dot AND an IQR ellipse showing each base's spread.
    """
    out = {}
    for vote_key, label in vote_to_label.items():
        cohort = [r for r in records if r["v"] == vote_key and r["w"] > 0]
        if not cohort:
            continue
        mx, my, x25, x75, y25, y75, n = median_and_iqr(cohort)
        out[label] = {
            "x": mx, "y": my, "n": n,
            "x25": x25, "x75": x75, "y25": y25, "y75": y75,
        }
    return out


def compute_subcohort_centroids(records, vote_keys):
    """Per-candidate MEDIAN (x, y) for within-base subcohorts (swing /
    activated / stayed-home). Matches the main-centroid switch to median.
    """
    cohorts = [("sw", "swing"), ("n2", "activated"), ("do", "stayed_home")]
    out = {}
    for vk in vote_keys:
        base = [r for r in records if r["v"] == vk and r["w"] > 0]
        if not base:
            continue
        sub = {}
        for flag, label in cohorts:
            rows = [r for r in base if r.get(flag)]
            if not rows:
                continue
            xs = [r["x"] for r in rows]
            ys = [r["y"] for r in rows]
            ws = [r["w"] for r in rows]
            cx = weighted_median(xs, ws)
            cy = weighted_median(ys, ws)
            sub[label] = {"x": round(cx, 3), "y": round(cy, 3), "n": len(rows)}
        if sub:
            out[vk] = sub
    return out


def main():
    for year, builder in [(2016, build_2016), (2020, build_2020), (2024, build_2024)]:
        print(f"=== {year} ===")
        records, stats = builder()
        print(f"  {stats}")

        # Compute candidate centroids from data — MEDIAN (x, y), per
        # rigor-process decision 2026-06-05.
        cands = list(CANDIDATES_BY_YEAR[year])
        def apply_centroid(c, info):
            for k in ("x", "y", "n", "x25", "x75", "y25", "y75"):
                if k in info:
                    c[k] = info[k]

        if year == 2016:
            # 2016 centroids match the candidate-blob layer: ALL three are
            # PRIMARY voters. Earlier code used general for Clinton+Trump
            # and primary for Sanders — inconsistent bases.
            cent = {}
            for pv_key in ["clinton", "sanders", "trump"]:
                cohort = [r for r in records if r.get("pv") == pv_key and r["w"] > 0]
                if not cohort:
                    continue
                mx, my, x25, x75, y25, y75, n = median_and_iqr(cohort)
                cent[pv_key] = dict(x=mx, y=my, n=n, x25=x25, x75=x75, y25=y25, y75=y75)
            for c in cands:
                if c["id"] in cent:
                    apply_centroid(c, cent[c["id"]])
        elif year == 2020:
            cent = compute_centroids(records, {"biden": "biden", "trump": "trump"})
            for c in cands:
                if c["id"] in cent:
                    apply_centroid(c, cent[c["id"]])
        elif year == 2024:
            cent = compute_centroids(records, {"harris": "harris", "trump": "trump"})
            for c in cands:
                if c["id"] in cent:
                    apply_centroid(c, cent[c["id"]])

        # Sub-cohort centroids per candidate (swing / activated / stayed-home)
        general_keys = [c["id"] for c in cands if c["id"] != "sanders"]
        sub_cents = compute_subcohort_centroids(records, general_keys)
        for c in cands:
            if c["id"] in sub_cents:
                c["subcohorts"] = sub_cents[c["id"]]

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
