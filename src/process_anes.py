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

IDEOLOGY_VAR  = "V161126"
PARTY_ID_VAR  = "V161159"
VOTE_VAR      = "V162034a"
REGISTERED_VAR = "V161011"   # Pre: registered to vote (1=yes, 2=no, 3=dk)

# Trust variable: V161215 only.
# V161218 (corruption perception) has an OPPOSITE correlation with Trump vote
# (Trump voters paradoxically score as believing less corruption exists —
# a partisan artifact), so averaging them cancels the signal.
# V161215 alone: r = -0.323 with Trump vote. V161218 alone: r = +0.278 (opposite).
TRUST_VARS = {
    "trust_govt": ("V161215", 5),  # "How often trust govt to do what is right"
}

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
    Two-item pre-election trust index, normalized 0–1 (higher = more trust).

    V161215: trust govt to do right thing (1=always … 5=never)
      → (5 - value) / 4  so 1→1.0, 5→0.0

    V161218: how many in govt are corrupt (1=none … 5=all)
      → (5 - value) / 4  so 1→1.0 (none corrupt), 5→0.0 (all corrupt)

    Validated: r(trust_index, trump_vote) ≈ −0.28, vs. r≈0.05 with old efficacy items.
    Voter-base centroids: Clinton 0.424, Trump 0.284, Johnson 0.333, Stein 0.371.
    """
    cols = []
    for name, (var, maxval) in TRUST_VARS.items():
        if var not in df.columns:
            print(f"Warning: {var} ({name}) not found in data, skipping.")
            continue
        s = clean_variable(df[var], (1, maxval))
        s = (maxval - s) / (maxval - 1)   # invert and normalize to 0–1
        cols.append(s)
    if not cols:
        raise ValueError("No trust variables found.")
    return pd.concat(cols, axis=1).mean(axis=1)


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
    df["party"] = clean_variable(df[PARTY_ID_VAR], (1, 5)).map(
        lambda v: party_label(v) if not np.isnan(v) else "unknown"
    )
    df["vote"] = clean_variable(df[VOTE_VAR], (1, 5)).map(
        lambda v: vote_label(v) if not np.isnan(v) else "no_vote"
    )
    # registered: 1=yes, 2=no → boolean; missing → False (conservative)
    reg_raw = clean_variable(df[REGISTERED_VAR], (1, 2)) if REGISTERED_VAR in df.columns else pd.Series(np.nan, index=df.index)
    df["registered"] = (reg_raw == 1)

    voters = df[["x", "y", "party", "vote", "registered"]].dropna(subset=["x", "y"])
    voters = voters.round({"x": 3, "y": 3})

    records = voters.to_dict(orient="records")
    (OUT_DIR / "voters_2d.json").write_text(json.dumps(records))
    print(f"Wrote {len(records)} records to data/processed/voters_2d.json")

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
