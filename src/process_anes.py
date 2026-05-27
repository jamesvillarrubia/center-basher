"""
Process raw ANES data into clean JSON for the 2D visualization.

Input:  data/raw/anes_timeseries_2016*.dta   (Stata format, Sep 2019 release)
Output: data/processed/voters_2d.json
        data/processed/quadrant_summary.json
        data/processed/candidate_centroids.json

TRUST INDEX — CORRECTED (discovered via data investigation):
  The original trust vars (V162215–V162218) are POLITICAL EFFICACY items
  ("officials don't care," "have no say"), not institutional trust.
  Correlation with Trump vote using those: r ≈ 0.05 (no signal).

  Correct trust variable is V161215 (PRE: "How often trust govt in Washington
  to do what is right") — correlation with Trump vote: r = −0.323.

  Two-item pre-election trust index (preferred — no post-election response bias):
    V161215: trust govt to do right thing  (1=always … 5=never) → invert
    V161218: how many in govt are corrupt  (1=none … 5=all) → invert

  Voter-base centroids (mean trust of each candidate's voters):
    Clinton: 0.424   Trump: 0.284   Johnson: 0.333   Stein: 0.371
  These anchor the candidate y-positions in candidates.js.

IDEOLOGY AXIS:
  V161126: 7-pt liberal-conservative self-placement, rescaled −1…+1.
  99 = "haven't thought much about it" → treated as missing.

OTHER VARIABLES:
  V161159: 5-pt party ID (1=Strong Dem … 5=Strong Rep)
  V162034a: presidential vote (1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other)
"""

import json
import pathlib
import sys

import numpy as np
import pandas as pd

RAW_DIR = pathlib.Path("data/raw")
OUT_DIR = pathlib.Path("data/processed")
OUT_DIR.mkdir(exist_ok=True)

IDEOLOGY_VAR   = "V161126"
PARTY_ID_VAR   = "V161159"
VOTE_VAR       = "V162034a"
REGISTERED_VAR = "V161011"   # Pre: registered to vote (1=yes, 2=no, 3=dk)
PRIMARY_VAR    = "V161021a"  # Pre: for whom did R vote in presidential primary
# V161021a codes: 1=Clinton, 2=Sanders, 3=other Dem, 4=Trump, 5=Cruz, 6=Kasich, 7=Rubio, 8=other Rep, 9=other
INTEREST_VAR   = "V161004"   # Pre: how interested in following campaigns (1=very, 2=somewhat, 3=not much)
STRENGTH_VAR   = "V161032"   # Pre: preference strength for intended candidate (1=strong, 2=not strong)

# SYSTEMIC INSTITUTIONAL-TRUST INDEX (3 items).
# Each recoded so higher = MORE trust, then averaged over available items.
# NOTE: the ANES battery items are NOT coded in the same direction — half had
# to be flipped. An earlier version mislabeled V161217/V161219 and inverted all
# items uniformly, which is why "averaging cancelled the signal."
#   V161215  trust govt to do what is right   1=always..5=never   -> (5-v)/4
#   V161216  run for benefit of all vs few    1=few interests, 2=benefit of all -> (v-1)/1
#   V161217  govt wastes tax money            1=a lot..3=not much -> (v-1)/2
# Validated: r(index, trump_vote) = -0.324 (vs -0.296 for V161215 alone);
# Cronbach alpha = 0.586 (vs 0.16 when corruption is mixed in).
TRUST_ITEMS = [
    ("V161215", 5, True),    # (var, max_code, invert?) invert: high code = less trust
    ("V161216", 2, False),   # high code (2) = benefit of all = more trust
    ("V161217", 3, False),   # high code (3) = not much waste = more trust
]

# Perceived corruption — a SEPARATE construct, kept off the trust axis.
# V161218 "how many running govt are corrupt" (1=none..5=all). It runs OPPOSITE
# the systemic items (Clinton voters rate govt MORE corrupt than Trump voters:
# 0.55 vs 0.43) because it was measured pre-election under a Democratic admin and
# "corruption" was a contested, bipartisan frame in 2016. Stored as `corrupt`
# (0=none .. 1=all) for a possible standalone panel.
CORRUPT_VAR = "V161218"
# V161219 ("how often can PEOPLE be trusted") is SOCIAL trust — not used.

MISSING_CODES = [-9, -8, -7, -6, -5, -4, -1]


def load_anes(path: pathlib.Path) -> pd.DataFrame:
    if path.suffix == ".dta":
        return pd.read_stata(path, convert_categoricals=False)
    return pd.read_csv(path, low_memory=False)


def clean_variable(series: pd.Series, valid_range: tuple, extra_missing=()) -> pd.Series:
    lo, hi = valid_range
    out = series.copy().astype(float)
    out[out.isin(MISSING_CODES)] = np.nan
    if extra_missing:
        out[out.isin(extra_missing)] = np.nan
    out[(out < lo) | (out > hi)] = np.nan
    return out


def build_trust_index(df: pd.DataFrame) -> pd.Series:
    """
    3-item systemic institutional-trust index, normalized 0–1 (higher = more trust).
    Each item recoded so higher = more trust, then averaged over available items.
    See TRUST_ITEMS for the per-item recoding and validation stats.
    """
    cols = []
    for var, maxval, invert in TRUST_ITEMS:
        if var not in df.columns:
            print(f"Warning: trust item {var} not found, skipping.")
            continue
        s = clean_variable(df[var], (1, maxval))
        s = (maxval - s) / (maxval - 1) if invert else (s - 1) / (maxval - 1)
        cols.append(s)
    if not cols:
        raise ValueError("No trust variables found.")
    return pd.concat(cols, axis=1).mean(axis=1)


def perceived_corruption(df: pd.DataFrame) -> pd.Series:
    """V161218 normalized 0–1, higher = MORE corrupt (1=none → 0.0, 5=all → 1.0)."""
    if CORRUPT_VAR not in df.columns:
        return pd.Series(np.nan, index=df.index)
    return (clean_variable(df[CORRUPT_VAR], (1, 5)) - 1) / 4


def ideology_to_x(series: pd.Series) -> pd.Series:
    s = clean_variable(series, (1, 7), extra_missing=(99,))
    return (s - 4) / 3.0


def party_label(val: float) -> str:
    if np.isnan(val):
        return "unknown"
    return {1: "strong_dem", 2: "lean_dem", 3: "independent",
            4: "lean_rep", 5: "strong_rep"}.get(int(val), "unknown")


def vote_label(val: float) -> str:
    return {1: "clinton", 2: "trump", 3: "johnson", 4: "stein",
            5: "other"}.get(int(val), "other") if not np.isnan(val) else "no_vote"


def main():
    candidates = list(RAW_DIR.glob("anes_timeseries_2016*.dta"))
    if not candidates:
        print("No ANES 2016 DTA file found in data/raw/.")
        print("Download the Stata (.dta) version from:")
        print("  https://electionstudies.org/data-center/2016-time-series-study/")
        sys.exit(0)

    df = load_anes(candidates[0])
    print(f"Loaded {len(df)} respondents")

    df["x"] = ideology_to_x(df[IDEOLOGY_VAR])
    df["y"] = build_trust_index(df)
    df["corrupt"] = perceived_corruption(df)
    df["party"] = clean_variable(df[PARTY_ID_VAR], (1, 5)).map(
        lambda v: party_label(v) if not np.isnan(v) else "unknown"
    )
    df["vote"] = clean_variable(df[VOTE_VAR], (1, 5)).map(
        lambda v: vote_label(v) if not np.isnan(v) else "no_vote"
    )
    # registered: 1=yes, 2=no → boolean; missing → False (conservative)
    reg_raw = clean_variable(df[REGISTERED_VAR], (1, 2)) if REGISTERED_VAR in df.columns else pd.Series(np.nan, index=df.index)
    df["registered"] = (reg_raw == 1)

    # primary_vote: who they voted for in the primary
    def primary_label(val):
        if np.isnan(val): return None
        return {1: "clinton", 2: "sanders", 4: "trump"}.get(int(val), "other")
    pri_raw = clean_variable(df[PRIMARY_VAR], (1, 9)) if PRIMARY_VAR in df.columns else pd.Series(np.nan, index=df.index)
    df["primary_vote"] = pri_raw.map(lambda v: primary_label(v) if not np.isnan(v) else None)

    # engagement: campaign interest (1=very, 2=somewhat, 3=not much) → high/medium/low
    int_raw = clean_variable(df[INTEREST_VAR], (1, 3)) if INTEREST_VAR in df.columns else pd.Series(np.nan, index=df.index)
    def interest_label(v):
        if np.isnan(v): return None
        return {1: "high", 2: "medium", 3: "low"}.get(int(v))
    df["engagement"] = int_raw.map(interest_label)

    # decided: preference strength (1=strong → decided, 2=not strong → soft)
    str_raw = clean_variable(df[STRENGTH_VAR], (1, 2)) if STRENGTH_VAR in df.columns else pd.Series(np.nan, index=df.index)
    df["decided"] = str_raw.map(lambda v: True if not np.isnan(v) and int(v) == 1 else (False if not np.isnan(v) and int(v) == 2 else None))

    # voter_segment: 2×2 of engagement × decided
    def segment(row):
        e = row["engagement"]
        d = row["decided"]
        if e is None or d is None:
            return "unknown"
        if d:     # strong preference
            return "decided_engaged"   if e in ("high", "medium") else "decided_disengaged"
        else:     # weak preference
            return "undecided_engaged" if e in ("high", "medium") else "undecided_disengaged"
    df["segment"] = df.apply(segment, axis=1)

    voters = df[["x", "y", "corrupt", "party", "vote", "registered", "primary_vote",
                 "engagement", "decided", "segment"]].dropna(subset=["x", "y"])
    voters = voters.round({"x": 3, "y": 3, "corrupt": 3})

    # to_json emits NaN as null (valid JSON); plain json.dumps would not.
    (OUT_DIR / "voters_2d.json").write_text(voters.to_json(orient="records"))
    print(f"Wrote {len(voters)} records to data/processed/voters_2d.json")

    print("\nParty breakdown:")
    print(voters["party"].value_counts().to_string())
    print("\nVote breakdown:")
    print(voters["vote"].value_counts().to_string())
    print(f"\nIdeology range: {voters['x'].min():.2f} to {voters['x'].max():.2f}, mean {voters['x'].mean():.2f}")
    print(f"Trust range:    {voters['y'].min():.2f} to {voters['y'].max():.2f}, mean {voters['y'].mean():.2f}")

    # Voter-base centroids per candidate (anchor candidate y-positions)
    print("\n=== Voter-base trust centroids (use to anchor candidate y-positions) ===")
    centroids = {}
    for vote_code, label in [(1,"clinton"), (2,"trump"), (3,"johnson"), (4,"stein")]:
        mask = (voters["vote"] == label)
        cx = voters.loc[mask, "x"].mean()
        cy = voters.loc[mask, "y"].mean()
        n  = mask.sum()
        centroids[label] = {"x": round(cx, 3), "y": round(cy, 3), "n": int(n)}
        print(f"  {label}: x={cx:.3f}, y={cy:.3f}  (n={n})")
    (OUT_DIR / "candidate_centroids.json").write_text(json.dumps(centroids, indent=2))
    print("Wrote data/processed/candidate_centroids.json")

    # Quadrant summary
    def quadrant(row):
        return ("right" if row["x"] > 0 else "left") + "_" + \
               ("high_trust" if row["y"] > 0.5 else "low_trust")

    voters = voters.copy()
    voters["quadrant"] = voters.apply(quadrant, axis=1)
    summary = (
        voters.groupby(["quadrant", "party", "vote"])
        .size().reset_index(name="count")
        .to_dict(orient="records")
    )
    (OUT_DIR / "quadrant_summary.json").write_text(json.dumps(summary))
    print("Wrote data/processed/quadrant_summary.json")

    # Validation: correlation of trust with trump vote
    btv = voters[voters["vote"].isin(["clinton","trump"])].copy()
    btv["is_trump"] = (btv["vote"] == "trump").astype(float)
    r = btv[["y","is_trump"]].corr().iloc[0,1]
    print(f"\nValidation: r(trust_index, trump_vote) = {r:.3f}  (was ≈0.05 with old efficacy vars)")


if __name__ == "__main__":
    main()
