"""
build_swing_spectrum.py — §3 distribution of swing voters across the
7-point liberal-conservative scale.

A swing voter here is a single-cycle defector: a partisan leaner who
voted for the OTHER party's nominee in 2016.
  Dem→Trump : V161158x ∈ {1,2,3} (Dem leaners+) AND V162034a = 2 (Trump)
  Rep→Clinton: V161158x ∈ {5,6,7} (Rep leaners+) AND V162034a = 1 (Clinton)

For each scale position (V161126, 1-7), report the weighted % of all
defectors who self-placed there, split by direction.

Use ANES 2016 (weighted, V160101).
"""
import json
import numpy as np
import pandas as pd

from _lib import load_anes_2016, DATA_CLEAN

LABELS = {
    1: "Extremely lib",
    2: "Liberal",
    3: "Slight lib",
    4: "Moderate",
    5: "Slight con",
    6: "Conservative",
    7: "Extremely con",
}


def main():
    d = load_anes_2016()
    w = pd.to_numeric(d["V160101"], errors="coerce").fillna(0).clip(lower=0)
    pid = pd.to_numeric(d["V161158x"], errors="coerce")
    vote = pd.to_numeric(d["V162034a"], errors="coerce")
    sp = pd.to_numeric(d["V161126"], errors="coerce")
    sp = sp.where((sp >= 1) & (sp <= 7))

    dem_to_trump = pid.isin([1, 2, 3]) & (vote == 2)
    rep_to_clinton = pid.isin([5, 6, 7]) & (vote == 1)
    any_swing = dem_to_trump | rep_to_clinton

    base = sp.notna() & pid.notna() & vote.notna() & (w > 0)

    # Distribution across scale, by direction
    n_d2t = int((base & dem_to_trump).sum())
    n_r2c = int((base & rep_to_clinton).sum())
    n_swing = int((base & any_swing).sum())

    def dist(mask):
        m = base & mask
        ww = w[m]
        scale = sp[m]
        total_w = ww.sum()
        out = {}
        n_cell = {}
        for pos in range(1, 8):
            out[pos] = round(float(ww[scale == pos].sum() / total_w) * 100, 1) if total_w > 0 else 0.0
            n_cell[pos] = int((scale == pos).sum())
        return out, n_cell

    dist_d2t, n_d2t_cell = dist(dem_to_trump)
    dist_r2c, n_r2c_cell = dist(rep_to_clinton)
    dist_all, n_all_cell = dist(any_swing)

    # Means
    def wmean(mask):
        m = base & mask
        ww = w[m]
        scale = sp[m]
        return round(float((scale * ww).sum() / ww.sum()), 2) if ww.sum() > 0 else None

    mean_d2t = wmean(dem_to_trump)
    mean_r2c = wmean(rep_to_clinton)
    mean_all = wmean(any_swing)

    # Share of swings at scale position 4 ("the middle")
    pct_at_middle = dist_all[4]

    out = {
        "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
        "variables": [
            "V160101 (weight)",
            "V161126 (self-place 7-pt lib-con; 1=Extremely lib, 7=Extremely con)",
            "V161158x (PID, 7-pt, leaners)",
            "V162034a (presidential vote; 1=Clinton, 2=Trump)",
        ],
        "definitions": {
            "Dem→Trump": "V161158x ∈ {1,2,3} (Dem leaners+) AND V162034a = 2",
            "Rep→Clinton": "V161158x ∈ {5,6,7} (Rep leaners+) AND V162034a = 1",
            "swing voter (this chart)": "any single-cycle PID-line defector",
        },
        "labels": LABELS,
        "distribution_pct": {
            "Dem_to_Trump":   dist_d2t,
            "Rep_to_Clinton": dist_r2c,
            "all_swings":     dist_all,
        },
        "weighted_mean_position": {
            "Dem_to_Trump":   mean_d2t,
            "Rep_to_Clinton": mean_r2c,
            "all_swings":     mean_all,
        },
        "pct_at_position_4_middle": pct_at_middle,
        "n_unweighted": {
            "Dem_to_Trump":   n_d2t,
            "Rep_to_Clinton": n_r2c,
            "all_swings":     n_swing,
        },
        "n_cell_unweighted": {
            "Dem_to_Trump":   n_d2t_cell,
            "Rep_to_Clinton": n_r2c_cell,
            "all_swings":     n_all_cell,
        },
        "supports": ["plain-language.md §3 [7]"],
    }

    out_path = DATA_CLEAN / "swing_spectrum.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {out_path}")
    print()
    print(f"Means on 7-pt scale (lower=more liberal):")
    print(f"  Dem→Trump    : {mean_d2t} (n={n_d2t})")
    print(f"  Rep→Clinton  : {mean_r2c} (n={n_r2c})")
    print(f"  all swings   : {mean_all} (n={n_swing})")
    print()
    print(f"% of swings at scale position 4 (exact middle): {pct_at_middle}%")
    print()
    print("Distribution by scale position (% within each group):")
    print(f"{'pos':>4} {'label':>15} {'D→T':>7} {'R→C':>7} {'all':>7}")
    for pos in range(1, 8):
        print(f"{pos:>4} {LABELS[pos]:>15} {dist_d2t[pos]:>6.1f}% {dist_r2c[pos]:>6.1f}% {dist_all[pos]:>6.1f}%")


if __name__ == "__main__":
    main()
