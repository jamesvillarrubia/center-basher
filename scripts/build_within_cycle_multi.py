"""
build_within_cycle_multi.py — §16 within-cycle FT-gap movement across
THREE cycles (2016, 2020, 2024), using ANES standalone PRE→POST waves
(same respondents).

Same test as fig-16e but applied to multiple cycles: if the centroid
sits on the diagonal in every cycle, the §16 use of pre-election Critics'
measures is robust across the modern era.

Variables used:
  2016: V161086 (Clinton PRE FT), V161087 (Trump PRE),
        V162078 (Clinton POST), V162079 (Trump POST), V160102 (weight)
  2020: V201151 (Biden PRE), V201152 (Trump PRE),
        V202143 (Biden POST), V202144 (Trump POST), V200010a (weight)
  2024: V241156 (Harris PRE), V241157 (Trump PRE),
        V242125 (Dem POST), V242126 (Rep POST), V240107a (weight)

Window: PRE wave conducted late Sep - early Nov; POST late Nov - early Jan.
~ 6-10 weeks apart. (Plus the actual election in between.)

Output: data/clean/within_cycle_multi.json
"""
import json
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

import sys
sys.path.insert(0, "scripts")
from _lib import load_anes_2016, load_anes_2020, load_anes_2024


CYCLES = [
    {
        "year": 2016,
        "dem_name": "Clinton",
        "rep_name": "Trump",
        "loader": load_anes_2016,
        "dem_pre": "V161086", "rep_pre": "V161087",
        "dem_post": "V162078", "rep_post": "V162079",
        "weight": "V160102",
    },
    {
        "year": 2020,
        "dem_name": "Biden",
        "rep_name": "Trump",
        "loader": load_anes_2020,
        "dem_pre": "V201151", "rep_pre": "V201152",
        "dem_post": "V202143", "rep_post": "V202144",
        "weight": "V200010a",
    },
    {
        "year": 2024,
        "dem_name": "Harris",
        "rep_name": "Trump",
        "loader": load_anes_2024,
        "dem_pre": "V241156", "rep_pre": "V241157",
        "dem_post": "V242125", "rep_post": "V242126",
        "weight": "V240107a",
    },
]


def process_cycle(cfg):
    df = cfg["loader"]()
    dpre = pd.to_numeric(df[cfg["dem_pre"]], errors="coerce").where(lambda x: x.between(0, 100))
    rpre = pd.to_numeric(df[cfg["rep_pre"]], errors="coerce").where(lambda x: x.between(0, 100))
    dpst = pd.to_numeric(df[cfg["dem_post"]], errors="coerce").where(lambda x: x.between(0, 100))
    rpst = pd.to_numeric(df[cfg["rep_post"]], errors="coerce").where(lambda x: x.between(0, 100))
    w = pd.to_numeric(df[cfg["weight"]], errors="coerce").fillna(0).clip(lower=0)

    gap_pre = dpre - rpre
    gap_post = dpst - rpst
    shift = gap_post - gap_pre

    m = gap_pre.notna() & gap_post.notna() & (w > 0)
    if m.sum() == 0:
        return None

    records = [
        {"s": int(round(p)), "n": int(round(q))}
        for p, q in zip(gap_pre[m], gap_post[m])
    ]
    # Weighted mean (population stats)
    wm = w[m]
    mean_pre = float(np.average(gap_pre[m], weights=wm))
    mean_post = float(np.average(gap_post[m], weights=wm))
    mean_shift = float(np.average(shift[m], weights=wm))
    sh = shift[m]
    skew = float(((sh - sh.mean()) ** 3).mean() / sh.std() ** 3) if sh.std() > 0 else 0.0
    return {
        "year": cfg["year"],
        "dem_name": cfg["dem_name"],
        "rep_name": cfg["rep_name"],
        "n": int(m.sum()),
        "mean_pre": round(mean_pre, 2),
        "mean_post": round(mean_post, 2),
        "mean_shift": round(mean_shift, 3),
        "median_shift": float(sh.median()),
        "std_shift": round(float(sh.std()), 2),
        "skewness": round(skew, 3),
        "pct_dlean_shift": round(float((sh > 0).mean() * 100), 1),
        "pct_rlean_shift": round(float((sh < 0).mean() * 100), 1),
        "pct_shift_gt5": round(float((sh.abs() > 5).mean() * 100), 1),
        "pct_shift_gt10": round(float((sh.abs() > 10).mean() * 100), 1),
        "respondents": records,
    }


def main():
    out = {
        "source": "ANES standalone time-series files (2016, 2020, 2024). PRE/POST waves, same respondents.",
        "method": "Per-respondent gap = FT_Dem - FT_Rep at PRE wave (~Oct) vs POST wave (~Dec). The PRE-POST window spans the election itself plus ~6-10 weeks.",
        "cycles": [],
    }
    for cfg in CYCLES:
        print(f"Processing {cfg['year']}...")
        r = process_cycle(cfg)
        if r is None:
            print(f"  skipped {cfg['year']}: no data")
            continue
        print(f"  n={r['n']}, mean shift {r['mean_shift']:+.2f}, skewness {r['skewness']:+.3f}, %D-shift {r['pct_dlean_shift']}%, %R-shift {r['pct_rlean_shift']}%")
        out["cycles"].append(r)

    path = "data/clean/within_cycle_multi.json"
    with open(path, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"\nWrote {path}")


if __name__ == "__main__":
    main()
