"""
build_vsg_bucketed.py — Apples-to-apples test: bucket VSG's 0-100 FT
thermometers into a 1-4 favorability scale (same granularity as
Nationscape), recompute the gap on the resulting -3..+3 scale, output
in the same JSON shape so Figure F's bubble-matrix chart can render it.

This isolates SCALE GRANULARITY from TIME-WINDOW / PERIOD effects.
If the bucketed-VSG bubble matrix looks like Nationscape Apr-Jul,
then Figure F's spread is mostly scale artifact.
If bucketed VSG still looks tighter than Nationscape, then Apr-Jul
was a genuinely more turbulent window.

Bucketing:
  0-25  → 1 (very unfavorable)
  26-50 → 2 (somewhat unfavorable)
  51-75 → 3 (somewhat favorable)
  76-100→ 4 (very favorable)

Output: data/clean/vsg_bucketed_sep_nov_2020.json
"""
import json
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

VSG_PATH = "data/derived/VOTER-Survey-Panel-Data-Files-2021Dec/VOTER Panel Data Files/voter_panel.dta"


def bucket(ft):
    """0-100 → 1-4 buckets (high = favorable)."""
    return ((ft - 0.0001) // 25 + 1).clip(lower=1, upper=4)


def main():
    df = pd.read_stata(
        VSG_PATH, convert_categoricals=False,
        columns=[
            "ft_dem_2020Sep", "ft_dem_2020Nov",
            "ft_rep_2020Sep", "ft_rep_2020Nov",
        ],
    )
    for c in df.columns:
        df[c] = pd.to_numeric(df[c], errors="coerce").where(lambda x: x.between(0, 100))

    bd_sep = bucket(df["ft_dem_2020Sep"])
    br_sep = bucket(df["ft_rep_2020Sep"])
    bd_nov = bucket(df["ft_dem_2020Nov"])
    br_nov = bucket(df["ft_rep_2020Nov"])
    gap_sep = bd_sep - br_sep
    gap_nov = bd_nov - br_nov
    shift = gap_nov - gap_sep
    m = gap_sep.notna() & gap_nov.notna()

    sub_sep = gap_sep[m].astype(int)
    sub_nov = gap_nov[m].astype(int)
    sub_sh = shift[m]

    stats = {
        "n": int(m.sum()),
        "mean_t1": round(float(sub_sep.mean()), 3),
        "mean_t2": round(float(sub_nov.mean()), 3),
        "mean_shift": round(float(sub_sh.mean()), 3),
        "median_shift": float(sub_sh.median()),
        "std_shift": round(float(sub_sh.std()), 3),
        "skewness": round(
            float(((sub_sh - sub_sh.mean()) ** 3).mean() / sub_sh.std() ** 3), 3
        ) if sub_sh.std() > 0 else 0.0,
        "pct_dlean_shift": round(float((sub_sh > 0).mean() * 100), 1),
        "pct_rlean_shift": round(float((sub_sh < 0).mean() * 100), 1),
        "pct_no_shift": round(float((sub_sh == 0).mean() * 100), 1),
        "pct_shift_gt1": round(float((sub_sh.abs() >= 1).mean() * 100), 1),
        "pct_shift_gt2": round(float((sub_sh.abs() >= 2).mean() * 100), 1),
    }

    records = [
        {"s": int(s), "n": int(n)}
        for s, n in zip(sub_sep, sub_nov)
    ]

    payload = {
        "source": "VSG panel Sep+Nov 2020 (same as Fig E), with 0-100 thermometers bucketed to 1-4 favorability categories (0-25, 26-50, 51-75, 76-100). Apples-to-apples comparison with Nationscape.",
        "method": "Per-respondent gap = bucket(FT_Dem) - bucket(FT_Rep) on the resulting -3..+3 scale. Same data as Figure E; only the scale changes.",
        "caveats": [
            "Bucketing introduces artificial 'movement' for respondents whose underlying view crossed a bucket boundary but didn't otherwise change.",
            "If a respondent rated Biden 49 in Sep and Biden 51 in Nov, that crosses the bucket boundary and registers as a 1-point bucket shift even though their underlying FT moved only 2 points.",
        ],
        "stats": stats,
        "respondents": records,
    }
    out_path = "data/clean/vsg_bucketed_sep_nov_2020.json"
    with open(out_path, "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"Wrote {out_path} (n={stats['n']})")
    for k, v in stats.items():
        print(f"  {k}: {v}")

    # Quick side-by-side comparison
    print("\n=== APPLES-TO-APPLES COMPARISON ===")
    print(f"{'metric':<25} {'VSG bucketed':>15} {'Nationscape Apr-Jul':>22}")
    ns = json.load(open("data/clean/nationscape_panel_april_july_2020.json"))["stats"]
    for k in ["pct_no_shift", "pct_dlean_shift", "pct_rlean_shift", "pct_shift_gt1", "pct_shift_gt2", "mean_shift", "skewness"]:
        print(f"  {k:<23} {stats[k]:>15} {ns[k]:>22}")


if __name__ == "__main__":
    main()
