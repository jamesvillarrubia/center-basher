"""
Process raw ANES data into clean JSON for the 2D visualization.

Input:  data/raw/anes_timeseries_2016*.dta   (Stata format, Sep 2019 release)
Output: data/processed/voters_2d.json
        data/processed/quadrant_summary.json

Variable notes (verified against Sep 2019 release):
  V161126  — 7-pt ideology: 1=extremely liberal … 7=extremely conservative
              99 = "haven't thought much about it" (treated as missing)
  V161159  — 5-pt party summary: 1=Strong Dem, 2=Weak Dem, 3=Independent,
              4=Weak Rep, 5=Strong Rep
  V162034a — presidential vote: 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other
  V162215–V162218 — trust in fed govt/Congress/SCOTUS/media:
              1=Always, 2=Most of the time, 3=About half, 4=Some of the time, 5=Never
"""

import json
import pathlib
import sys

import numpy as np
import pandas as pd

RAW_DIR = pathlib.Path("data/raw")
OUT_DIR = pathlib.Path("data/processed")
OUT_DIR.mkdir(exist_ok=True)

IDEOLOGY_VAR = "V161126"
PARTY_ID_VAR = "V161159"   # 5-point summary (1=Strong Dem … 5=Strong Rep)
VOTE_VAR     = "V162034a"

TRUST_VARS = {
    "trust_fed_govt": "V162215",
    "trust_congress": "V162216",
    "trust_scotus":   "V162217",
    "trust_media":    "V162218",
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
    Average trust across four institutional items, normalized 0–1 (higher = more trust).
    ANES scale: 1=Always … 5=Never  →  invert: (5 - value) / 4
    """
    cols = []
    for name, var in TRUST_VARS.items():
        if var not in df.columns:
            print(f"Warning: {var} ({name}) not found in data, skipping.")
            continue
        s = clean_variable(df[var], (1, 5))
        s = (5 - s) / 4.0   # 5→0 (never trust), 1→1 (always trust)
        cols.append(s)
    if not cols:
        raise ValueError("No trust variables found. Check ANES column names.")
    return pd.concat(cols, axis=1).mean(axis=1)


def ideology_to_x(series: pd.Series) -> pd.Series:
    """Recode 1–7 ideology to -1 (left) … +1 (right). 99='haven't thought' → NaN."""
    s = clean_variable(series, (1, 7), extra_missing=(99,))
    return (s - 4) / 3.0


def party_label(val: float) -> str:
    """Map 5-pt party ID to label. 1=Strong Dem, 2=Weak Dem, 3=Ind, 4=Weak Rep, 5=Strong Rep."""
    if np.isnan(val):
        return "unknown"
    mapping = {1: "strong_dem", 2: "lean_dem", 3: "independent", 4: "lean_rep", 5: "strong_rep"}
    return mapping.get(int(val), "unknown")


def vote_label(val: float) -> str:
    mapping = {1: "clinton", 2: "trump", 3: "johnson", 4: "stein", 5: "other"}
    return mapping.get(int(val), "other") if not np.isnan(val) else "no_vote"


def main():
    candidates = list(RAW_DIR.glob("anes_timeseries_2016*.dta"))
    if not candidates:
        print("No ANES 2016 DTA file found in data/raw/.")
        print("Download the Stata (.dta) version from:")
        print("  https://electionstudies.org/data-center/2016-time-series-study/")
        print("and place it in data/raw/")
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

    voters = df[["x", "y", "party", "vote"]].dropna(subset=["x", "y"])
    voters = voters.round({"x": 3, "y": 3})

    records = voters.to_dict(orient="records")
    (OUT_DIR / "voters_2d.json").write_text(json.dumps(records))
    print(f"Wrote {len(records)} records to data/processed/voters_2d.json")

    # Print sanity check
    print("\nParty breakdown:")
    print(voters["party"].value_counts().to_string())
    print("\nVote breakdown:")
    print(voters["vote"].value_counts().to_string())
    print(f"\nIdeology range: {voters['x'].min():.2f} to {voters['x'].max():.2f}, mean {voters['x'].mean():.2f}")
    print(f"Trust range:    {voters['y'].min():.2f} to {voters['y'].max():.2f}, mean {voters['y'].mean():.2f}")

    # Quadrant summary
    def quadrant(row):
        x_label = "right" if row["x"] > 0 else "left"
        y_label = "high_trust" if row["y"] > 0.5 else "low_trust"
        return f"{x_label}_{y_label}"

    voters = voters.copy()
    voters["quadrant"] = voters.apply(quadrant, axis=1)
    summary = (
        voters.groupby(["quadrant", "party", "vote"])
        .size()
        .reset_index(name="count")
        .to_dict(orient="records")
    )
    (OUT_DIR / "quadrant_summary.json").write_text(json.dumps(summary))
    print("\nWrote data/processed/quadrant_summary.json")


if __name__ == "__main__":
    main()
