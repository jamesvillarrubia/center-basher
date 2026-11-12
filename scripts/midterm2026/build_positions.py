"""Step 3d: coding (c) measures per nominee -> data/derived/midterm2026/positions_index.csv,
merged into races.csv. Run after build_baselines.py.

Input: data/derived/midterm2026/positions/positions_final.csv (long: race_id x 13 items;
rubric reqts/progressive-position-rubric.md). Scores +1 / +0.5 / 0 / -1; 0 means silent,
hedged or not found. Rows with race_id THIRDWAY score Third Way itself.

Measures (each also computed on two robustness item sets):
  c_index        mean of the 13 item scores (0 counts)
  c_stated       mean of the non-zero items; blank when none are non-zero
  c_n_sourced    count of non-zero items (coverage control)
  c_prog_median  1 if c_index >= the median c_index of the 44 nominees
  c_prog_03      1 if c_index >= 0.3
  c_tw_gap       c_index minus Third Way's index
Robustness item sets (an excluded item is treated as not found, score 0):
  _noind         drop items whose evidence is flagged indirect (news paraphrase)
  _preprim       keep only items with pre_primary true (drop false and unverified)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
POS = D / "positions" / "positions_final.csv"


def measures(p: pd.DataFrame, suffix: str) -> pd.DataFrame:
    g = p.groupby("race_id").score
    out = pd.DataFrame({
        f"c_index{suffix}": g.mean(),
        f"c_n_sourced{suffix}": g.apply(lambda s: int((s != 0).sum())),
        f"c_stated{suffix}": g.apply(lambda s: s[s != 0].mean() if (s != 0).any() else np.nan),
    })
    return out


def main() -> None:
    p = pd.read_csv(POS)
    assert p.groupby("race_id").size().eq(13).all(), "every race_id needs 13 items"
    p["indirect_flag"] = p.indirect.astype(str).str.lower().eq("true")
    p["pre_flag"] = p.pre_primary.astype(str).str.lower().eq("true")
    variants = {
        "": p,
        "_noind": p.assign(score=p.score.where(~p.indirect_flag, 0.0)),
        "_preprim": p.assign(score=p.score.where(p.pre_flag | (p.race_id == "THIRDWAY") | (p.score == 0), 0.0)),
    }
    m = pd.concat([measures(v, suf) for suf, v in variants.items()], axis=1)
    tw = m.loc["THIRDWAY"]
    m = m.drop(index="THIRDWAY")
    for suf in variants:
        med = m[f"c_index{suf}"].median()
        m[f"c_prog_median{suf}"] = (m[f"c_index{suf}"] >= med).astype(int)
        m[f"c_prog_03{suf}"] = (m[f"c_index{suf}"] >= 0.3).astype(int)
        m[f"c_tw_gap{suf}"] = m[f"c_index{suf}"] - tw[f"c_index{suf}"]
        m[f"c_median_cut{suf}"] = med
    m["thirdway_index"] = tw["c_index"]
    m["c_items_indirect"] = p[p.indirect_flag].groupby("race_id").size().reindex(m.index).fillna(0).astype(int)
    m["c_items_not_preprimary"] = p[(p.score != 0) & ~p.pre_flag].groupby("race_id").size().reindex(m.index).fillna(0).astype(int)
    m = m.reset_index()
    m.to_csv(D / "positions_index.csv", index=False)
    races = pd.read_csv(D / "races.csv")
    races = races[[c for c in races.columns if c not in m.columns or c == "race_id"]]
    races.merge(m, on="race_id", how="left").to_csv(D / "races.csv", index=False)
    print(f"positions_index.csv: {len(m)} nominees; Third Way index {tw['c_index']:.3f}; median c_index "
          f"{m.c_median_cut.iloc[0]:.3f}; >=3 sourced items: {(m.c_n_sourced >= 3).sum()}; "
          f"0-1 sourced: {(m.c_n_sourced <= 1).sum()}")


if __name__ == "__main__":
    main()
