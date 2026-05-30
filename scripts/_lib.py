"""
Shared utilities for the center-basher analysis pipeline.

Every build_*.py script in this directory imports from here. The goal is that each
analysis is repeatable, testable, and publishable: one script per claim in
plain-language.md, each producing a versioned CSV in data/clean/ with a sidecar
manifest documenting source, variables, filter, n, weight, and method.

Usage in a build script:

    from _lib import (load_anes_2016, load_anes_cdf, load_vsg_panel,
                       clean_var, weighted_mean, weighted_std_logit,
                       write_clean)

    df = load_anes_2016()
    w  = clean_var(df, "V160101", lo=0, hi=1e9).fillna(0).clip(lower=0)
    # ... analysis ...
    write_clean(
        name="my_analysis",
        rows=[...],
        manifest={
            "source": "ANES 2016 (data/raw/anes_timeseries_2016.dta)",
            "variables": [...],
            "filter": "...",
            "n": int(...),
            "weight": "V160101",
            "method": "weighted logistic",
            "caveats": ["..."],
            "supports": ["plain-language.md §X [Y]"],
        },
    )
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ── paths ───────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = ROOT / "data" / "raw"
DATA_DERIVED = ROOT / "data" / "derived"
DATA_CLEAN = ROOT / "data" / "clean"
DATA_CLEAN.mkdir(parents=True, exist_ok=True)

# ── canonical ANES missing-value codes ──────────────────────────────────────
ANES_MISSING = (-9, -8, -7, -6, -5, -4, -3, -2, -1)


def clean_var(
    df: pd.DataFrame, varname: str, lo: float, hi: float, also_missing=()
) -> pd.Series:
    """Coerce an ANES variable to numeric, knock out standard missing codes and
    out-of-range values. Returns a Series aligned to df.

    The same pattern shows up in every analysis script; centralized so direction
    bugs and missing-value bugs are caught once.
    """
    if varname not in df.columns:
        return pd.Series(np.nan, index=df.index)
    s = pd.to_numeric(df[varname], errors="coerce").astype(float)
    s = s.where(~s.isin(ANES_MISSING))
    if also_missing:
        s = s.where(~s.isin(also_missing))
    s = s.where((s >= lo) & (s <= hi))
    return s


def weighted_mean(s: pd.Series, w: pd.Series, mask: Optional[pd.Series] = None) -> float:
    """Weighted mean of s under optional mask. Returns NaN if no usable rows."""
    m = s.notna() & w.notna() & (w > 0)
    if mask is not None:
        m = m & mask
    if not m.any():
        return float("nan")
    return float(np.average(s[m], weights=w[m]))


def weighted_share(mask: pd.Series, w: pd.Series, denom_mask: Optional[pd.Series] = None) -> float:
    """Weighted share of mask within denom (default: all w>0). Returns 0..1."""
    base = (w > 0) if denom_mask is None else (denom_mask & (w > 0))
    if not base.any():
        return float("nan")
    return float(w[mask & base].sum() / w[base].sum())


def weighted_std_logit(
    y: pd.Series,
    X: Dict[str, pd.Series],
    w: pd.Series,
    max_iter: int = 150,
) -> Dict[str, float]:
    """Weighted standardized logistic regression. Returns {name: standardized β}.

    Each predictor is standardized to the analysis sample (weighted mean and SD),
    so coefficients are |β·SD|-comparable. Intercept dropped from the return value.
    """
    df = pd.DataFrame({**X, "y": y, "w": w}).dropna()
    df = df[df["w"] > 0]
    if len(df) < 30:
        return {k: float("nan") for k in X}
    names = list(X)
    # weighted-standardize each predictor
    Xs = []
    for k in names:
        s = df[k].values
        mu = np.average(s, weights=df["w"].values)
        sd = np.sqrt(np.average((s - mu) ** 2, weights=df["w"].values))
        Xs.append((s - mu) / sd if sd > 0 else s * 0)
    Xs = np.column_stack(Xs)
    Xn = np.column_stack([np.ones(len(Xs)), Xs])
    b = np.zeros(Xn.shape[1])
    yv, wv = df["y"].values, df["w"].values
    for _ in range(max_iter):
        p = 1.0 / (1.0 + np.exp(-Xn @ b))
        Wd = wv * p * (1 - p)
        g = Xn.T @ (wv * (yv - p))
        H = -(Xn * Wd[:, None]).T @ Xn
        try:
            b = b - np.linalg.solve(H + 1e-9 * np.eye(len(b)), g)
        except np.linalg.LinAlgError:
            break
    return dict(zip(names, b[1:]))


# ── dataset loaders ─────────────────────────────────────────────────────────
def load_anes_2016() -> pd.DataFrame:
    return pd.read_stata(
        DATA_RAW / "anes_timeseries_2016.dta", convert_categoricals=False
    )


def load_anes_2020() -> pd.DataFrame:
    return pd.read_csv(
        DATA_DERIVED
        / "anes_timeseries_2020_csv_20220210"
        / "anes_timeseries_2020_csv_20220210.csv",
        low_memory=False,
    )


def load_anes_2024() -> pd.DataFrame:
    return pd.read_csv(
        DATA_DERIVED
        / "anes_timeseries_2024_csv_20260519"
        / "anes_timeseries_2024_csv_20260519.csv",
        low_memory=False,
    )


def load_anes_cdf() -> pd.DataFrame:
    return pd.read_csv(
        DATA_DERIVED
        / "anes_timeseries_cdf_csv_20260205"
        / "anes_timeseries_cdf_csv_20260205.csv",
        low_memory=False,
    )


def load_anes_2016_voteval() -> pd.DataFrame:
    """Vote-validation merge: dta V160001_orig ↔ csv V160001 (NOT the dta V160001)."""
    return pd.read_csv(
        DATA_DERIVED
        / "anes_timeseries_2016_voteval_csv"
        / "anes_timeseries_2016_voteval.csv"
    )


def load_vsg_panel() -> pd.DataFrame:
    """Democracy Fund VOTER Survey panel (2011→2020). Note latin-1 encoding."""
    return pd.read_csv(
        DATA_DERIVED
        / "VOTER-Survey-Panel-Data-Files-2021Dec"
        / "VOTER Panel Data Files"
        / "voter_panel.csv",
        low_memory=False,
        encoding="latin-1",
    )


# ── output writer ───────────────────────────────────────────────────────────
def write_clean(name: str, rows: List[Dict[str, Any]], manifest: Dict[str, Any]) -> None:
    """Write a clean CSV + sidecar manifest JSON under data/clean/.

    The manifest must include keys:
      source (str), variables (list[str]), filter (str), n (int),
      weight (str | None), method (str), supports (list[str]), caveats (list[str])

    The CSV is the rows; the JSON is the manifest plus the row count.
    """
    csv_path = DATA_CLEAN / f"{name}.csv"
    json_path = DATA_CLEAN / f"{name}.json"
    df = pd.DataFrame(rows)
    df.to_csv(csv_path, index=False)
    manifest = dict(manifest)
    manifest.setdefault("name", name)
    manifest.setdefault("schema", list(df.columns))
    manifest["row_count"] = int(len(df))
    with open(json_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"  → wrote {csv_path.name} + {json_path.name}  ({len(df)} rows)")


def cdf_num(s: pd.Series) -> pd.Series:
    """CDF-specific numeric coercion: knock out standard missing + the CDF's own
    sentinel 0 and 8/9 codes used in some series."""
    x = pd.to_numeric(s, errors="coerce")
    return x.where(~x.isin([0, -1, -8, -9, 8, 9]))
