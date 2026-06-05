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
    # PERCEIVED-CANDIDATE positions — non-tautological identity signal.
    # CODEBOOK-VERIFIED:
    #   V161128/V161129 = R places Dem/Rep cand on 1-7 lib-cons scale
    #   V161159/V161160 = Dem cand "strong leadership"/"really cares" 1-5
    #   V161164/V161165 = Rep cand same two traits
    #
    # Y AXIS = 2-item composite (cares + strong leadership) averaged.
    # This is the candidate analog of the voter trust composite which
    # measures system responsiveness + competence. Honesty was the prior
    # y-axis source but it's a personal-virtue dimension, not the trust-in-
    # institutions dimension we want. Switched 2026-06-05.
    dem_perc_x = (safe_num(df, "V161128").where(lambda v: v.between(1, 7)) - 4) / 3.0
    rep_perc_x = (safe_num(df, "V161129").where(lambda v: v.between(1, 7)) - 4) / 3.0
    d_lead  = (5 - safe_num(df, "V161159").where(lambda v: v.between(1, 5))) / 4.0
    d_cares = (5 - safe_num(df, "V161160").where(lambda v: v.between(1, 5))) / 4.0
    r_lead  = (5 - safe_num(df, "V161164").where(lambda v: v.between(1, 5))) / 4.0
    r_cares = (5 - safe_num(df, "V161165").where(lambda v: v.between(1, 5))) / 4.0
    dem_perc_y = pd.concat([d_lead, d_cares], axis=1).mean(axis=1)
    rep_perc_y = pd.concat([r_lead, r_cares], axis=1).mean(axis=1)
    return assemble_records(x, trust, party, vote, pv, swing, new_2016, dropoff, in_swing, w,
                            dem_perc_x=dem_perc_x, dem_perc_y=dem_perc_y,
                            rep_perc_x=rep_perc_x, rep_perc_y=rep_perc_y,
                            dem_id="clinton", rep_id="trump")


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
    # Perceived candidate positions: V201202/03 (ideology),
    # V201208+V201209 (Biden lead+cares) / V201212+V201213 (Trump lead+cares)
    dem_perc_x = (safe_num(df, "V201202").where(lambda v: v.between(1, 7)) - 4) / 3.0
    rep_perc_x = (safe_num(df, "V201203").where(lambda v: v.between(1, 7)) - 4) / 3.0
    d_lead  = (5 - safe_num(df, "V201208").where(lambda v: v.between(1, 5))) / 4.0
    d_cares = (5 - safe_num(df, "V201209").where(lambda v: v.between(1, 5))) / 4.0
    r_lead  = (5 - safe_num(df, "V201212").where(lambda v: v.between(1, 5))) / 4.0
    r_cares = (5 - safe_num(df, "V201213").where(lambda v: v.between(1, 5))) / 4.0
    dem_perc_y = pd.concat([d_lead, d_cares], axis=1).mean(axis=1)
    rep_perc_y = pd.concat([r_lead, r_cares], axis=1).mean(axis=1)
    return assemble_records(x, trust, party, vote, pv, swing, new_2020, dropoff, in_swing, w,
                            dem_perc_x=dem_perc_x, dem_perc_y=dem_perc_y,
                            rep_perc_x=rep_perc_x, rep_perc_y=rep_perc_y,
                            dem_id="biden", rep_id="trump")


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
    # Perceived candidate positions: V241179/80 (ideology),
    # V241200+V241201 (Harris lead+cares) / V241205+V241206 (Trump lead+cares)
    dem_perc_x = (safe_num(df, "V241179").where(lambda v: v.between(1, 7)) - 4) / 3.0
    rep_perc_x = (safe_num(df, "V241180").where(lambda v: v.between(1, 7)) - 4) / 3.0
    d_lead  = (5 - safe_num(df, "V241200").where(lambda v: v.between(1, 5))) / 4.0
    d_cares = (5 - safe_num(df, "V241201").where(lambda v: v.between(1, 5))) / 4.0
    r_lead  = (5 - safe_num(df, "V241205").where(lambda v: v.between(1, 5))) / 4.0
    r_cares = (5 - safe_num(df, "V241206").where(lambda v: v.between(1, 5))) / 4.0
    dem_perc_y = pd.concat([d_lead, d_cares], axis=1).mean(axis=1)
    rep_perc_y = pd.concat([r_lead, r_cares], axis=1).mean(axis=1)
    return assemble_records(x, trust, party, vote, pv, swing, new_v, dropoff, in_swing, w,
                            dem_perc_x=dem_perc_x, dem_perc_y=dem_perc_y,
                            rep_perc_x=rep_perc_x, rep_perc_y=rep_perc_y,
                            dem_id="harris", rep_id="trump")


def assemble_records(x, trust, party, vote, pv, swing, new_v, dropoff, in_swing, w,
                     dem_perc_x=None, dem_perc_y=None, rep_perc_x=None, rep_perc_y=None,
                     dem_id=None, rep_id=None):
    m = x.notna() & trust.notna() & (w > 0)
    records = []
    n_swing = n_new = n_drop = n_in_swing = 0
    perc_meta = {
        "dem_perc_x": dem_perc_x, "dem_perc_y": dem_perc_y,
        "rep_perc_x": rep_perc_x, "rep_perc_y": rep_perc_y,
        "dem_id": dem_id, "rep_id": rep_id,
    }
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
        # Attach perceived-candidate positions per respondent. Stored as
        # px_d/py_d (perceived Dem cand) and px_r/py_r (perceived Rep cand).
        # NaN -> None so JSON serializes cleanly.
        def safe(series):
            if series is None: return None
            v = series.iloc[i] if hasattr(series, "iloc") else None
            return None if (v is None or pd.isna(v)) else round(float(v), 3)
        rec["px_d"] = safe(perc_meta["dem_perc_x"])
        rec["py_d"] = safe(perc_meta["dem_perc_y"])
        rec["px_r"] = safe(perc_meta["rep_perc_x"])
        rec["py_r"] = safe(perc_meta["rep_perc_y"])
        records.append(rec)
        n_swing += rec["sw"]; n_new += rec["n2"]; n_drop += rec["do"]; n_in_swing += rec["s"]
    return records, dict(
        n=len(records), n_swing=n_swing, n_new=n_new, n_drop=n_drop, n_in_swing=n_in_swing,
        dem_id=perc_meta["dem_id"], rep_id=perc_meta["rep_id"],
    )


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
    """Return (mx, my, x25, x75, y25, y75, n) where (mx,my) is the weighted
    MEAN — that's the centroid for the candidate dot. IQR still uses 25th/75th
    weighted percentiles so the ellipse shows real distribution boundaries."""
    xs = [r["x"] for r in rows]
    ys = [r["y"] for r in rows]
    ws = [r["w"] for r in rows]
    sw = sum(ws)
    mx = sum(x_i * w_i for x_i, w_i in zip(xs, ws)) / sw
    my = sum(y_i * w_i for y_i, w_i in zip(ys, ws)) / sw
    return (
        round(mx, 3),
        round(my, 3),
        round(weighted_quantile(xs, ws, 0.25), 3),
        round(weighted_quantile(xs, ws, 0.75), 3),
        round(weighted_quantile(ys, ws, 0.25), 3),
        round(weighted_quantile(ys, ws, 0.75), 3),
        len(rows),
    )


def compute_centroids(records, vote_to_label):
    """Per-candidate MEAN (x, y) + IQR ellipse parameters.

    Returns {label: dict(x, y, x25, x75, y25, y75, n)} so the chart can draw
    both the centroid dot AND an IQR ellipse showing each base's spread.
    User direction 2026-06-05: median produced too-coarse centroids on the
    trust composite (only 5 discrete y values cluster at 0.083/0.167/0.25/
    0.333), making distinct cohorts visually identical. Mean reveals the
    underlying gradient; IQR ellipse still uses 25th/75th percentiles so
    distribution boundaries are honest.
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

        # PERCEIVED CANDIDATE POSITIONS BY COHORT — non-tautological signal
        # of candidate identity. For each (cohort × candidate), compute the
        # weighted mean perceived position (where voters in that cohort
        # PLACED the candidate) + capture share (what % voted for them).
        dem_id, rep_id = stats.get("dem_id"), stats.get("rep_id")
        cohort_filters = [
            ("swing", lambda r: r["sw"]),
            ("activated", lambda r: r["n2"]),
            ("stayed_home", lambda r: r["do"]),
            ("all", lambda r: True),
        ]
        def wmean_pair(rows, xkey, ykey):
            xs, ys, ws = [], [], []
            for r in rows:
                if r.get(xkey) is None or r.get(ykey) is None: continue
                if r["w"] <= 0: continue
                xs.append(r[xkey]); ys.append(r[ykey]); ws.append(r["w"])
            if not ws or sum(ws) == 0: return None
            tw = sum(ws)
            return {
                "x": round(sum(x_i * w_i for x_i, w_i in zip(xs, ws)) / tw, 3),
                "y": round(sum(y_i * w_i for y_i, w_i in zip(ys, ws)) / tw, 3),
                "n": len(xs),
            }
        def capture_share(rows, cand_id):
            if not rows: return None
            tw = sum(r["w"] for r in rows)
            if tw == 0: return None
            cw = sum(r["w"] for r in rows if r.get("v") == cand_id)
            return round(cw / tw, 3)
        for c in cands:
            perc_field, cand_id = ("d", dem_id) if c["id"] == dem_id else ("r", rep_id) if c["id"] == rep_id else (None, None)
            if perc_field is None:
                # 2016 Sanders — no general-election capture; skip perceived layer
                continue
            perc = {}
            for cohort_name, filt in cohort_filters:
                rows = [r for r in records if filt(r) and r["w"] > 0]
                pos = wmean_pair(rows, f"px_{perc_field}", f"py_{perc_field}")
                cap = capture_share(rows, cand_id) if cohort_name != "stayed_home" else 0.0
                if pos is None and cap is None: continue
                perc[cohort_name] = {**(pos or {}), "capture": cap}
            c["perceived"] = perc

        # Also bake cohort-centroid (voter self-position median) per cohort
        # so the chart can render the proximity tethers symmetrically.
        cohort_self_centroids = {}
        for cohort_name, filt in cohort_filters:
            rows = [r for r in records if filt(r) and r["w"] > 0]
            if not rows: continue
            xs = [r["x"] for r in rows]; ys = [r["y"] for r in rows]; ws = [r["w"] for r in rows]
            tw = sum(ws)
            cohort_self_centroids[cohort_name] = {
                "x": round(sum(x_i * w_i for x_i, w_i in zip(xs, ws)) / tw, 3),
                "y": round(sum(y_i * w_i for y_i, w_i in zip(ys, ws)) / tw, 3),
                "n": len(rows),
            }

        payload = {
            "year": year,
            "source": f"ANES {year} Time Series Study, weighted.",
            "candidates": cands,
            "cohort_centroids": cohort_self_centroids,
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
