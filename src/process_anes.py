"""
Process raw ANES data into clean JSON for the 2D visualization.

Input:  data/raw/anes_timeseries_2016*.dta   (Stata format, Sep 2019 release)
Output: data/processed/voters_2d.json
        data/processed/quadrant_summary.json
"""

import json
import pathlib
import sys

import numpy as np
import pandas as pd

RAW_DIR = pathlib.Path("data/raw")
OUT_DIR = pathlib.Path("data/processed")
OUT_DIR.mkdir(exist_ok=True)

# ANES 2016 variable names → friendly names
IDEOLOGY_VAR = "V161126"       # 1=extremely liberal … 7=extremely conservative
PARTY_ID_VAR = "V161155"       # 1=strong Dem … 7=strong Rep
VOTE_VAR = "V162034a"          # 1=Clinton, 2=Trump, 3=Johnson, 4=Stein

TRUST_VARS = {
    "trust_fed_govt":   "V162215",  # trust in federal government
    "trust_congress":   "V162216",
    "trust_scotus":     "V162217",
    "trust_media":      "V162218",
}

MISSING_CODES = [-9, -8, -7, -6, -5, -4, -1]


def load_anes(path: pathlib.Path) -> pd.DataFrame:
    if path.suffix == ".dta":
        # convert_categoricals=False keeps numeric codes instead of Stata labels
        return pd.read_stata(path, convert_categoricals=False)
    return pd.read_csv(path, low_memory=False)


def clean_variable(series: pd.Series, valid_range: tuple) -> pd.Series:
    lo, hi = valid_range
    out = series.copy().astype(float)
    out[out.isin(MISSING_CODES)] = np.nan
    out[(out < lo) | (out > hi)] = np.nan
    return out


def build_trust_index(df: pd.DataFrame) -> pd.Series:
    """
    Average across institutional trust items.
    Each item is recoded so higher = MORE trust (0–1 scale).
    ANES trust items: 1=always/most of the time, 2=about half, 3=some of the time, 4=never.
    Invert and normalize to 0–1.
    """
    cols = []
    for name, var in TRUST_VARS.items():
        if var not in df.columns:
            print(f"Warning: {var} ({name}) not found in data, skipping.")
            continue
        s = clean_variable(df[var], (1, 4))
        # invert: 4→0, 1→1 normalized
        s = (4 - s) / 3.0
        cols.append(s)
    if not cols:
        raise ValueError("No trust variables found. Check ANES column names.")
    return pd.concat(cols, axis=1).mean(axis=1)


def ideology_to_x(series: pd.Series) -> pd.Series:
    """Recode 1–7 ideology to -1 (left) … +1 (right)."""
    s = clean_variable(series, (1, 7))
    return (s - 4) / 3.0  # center at 4 (moderate)


def party_label(val: float) -> str:
    if np.isnan(val):
        return "unknown"
    if val <= 2:
        return "strong_dem"
    if val <= 3:
        return "lean_dem"
    if val == 4:
        return "independent"
    if val <= 5:
        return "lean_rep"
    return "strong_rep"


def vote_label(val: float) -> str:
    mapping = {1: "clinton", 2: "trump", 3: "johnson", 4: "stein"}
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
    df["party"] = clean_variable(df[PARTY_ID_VAR], (1, 7)).map(
        lambda v: party_label(v) if not np.isnan(v) else "unknown"
    )
    df["vote"] = clean_variable(df[VOTE_VAR], (1, 4)).map(
        lambda v: vote_label(v) if not np.isnan(v) else "no_vote"
    )

    voters = df[["x", "y", "party", "vote"]].dropna(subset=["x", "y"])
    voters = voters.round({"x": 3, "y": 3})

    records = voters.to_dict(orient="records")
    (OUT_DIR / "voters_2d.json").write_text(json.dumps(records))
    print(f"Wrote {len(records)} records to data/processed/voters_2d.json")

    # Quadrant summary
    def quadrant(row):
        x_label = "right" if row["x"] > 0 else "left"
        y_label = "high_trust" if row["y"] > 0.5 else "low_trust"
        return f"{x_label}_{y_label}"

    voters["quadrant"] = voters.apply(quadrant, axis=1)
    summary = (
        voters.groupby(["quadrant", "party", "vote"])
        .size()
        .reset_index(name="count")
        .to_dict(orient="records")
    )
    (OUT_DIR / "quadrant_summary.json").write_text(json.dumps(summary))
    print("Wrote data/processed/quadrant_summary.json")


if __name__ == "__main__":
    main()
