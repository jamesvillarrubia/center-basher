"""
build_dem_lean_defection.py — §5 Figure I: defection rate to Trump among
Dem-leaners, by institutional-trust (grievance) level.

Closes a provenance gap: Figure I's numbers were previously hardcoded in
web/js-v2/fig-5c-defection.js with no backing data file.

Population : Dem-leaners and stronger (V161158x in {1,2,3}) who cast a valid
            presidential vote (V162034a in 1..7) — "Dem-leaners who actually voted."
Defection : voted Trump (V162034a == 2).
Grievance : 3-item institutional-trust index (V161215/V161216/V161217), 0..1
            HIGH = MORE trust, split at the weighted median of Dem-lean voters.
            High-grievance = LOW trust (<= median); low-grievance = HIGH trust.
            V161217 is the codebook-verified 1-3 item -> (x-1)/2 (see audit).
Weight    : V160102 (POST; vote-conditioned, Gate 3).

Output    : data/clean/dem_lean_defection.json (rows for the figure + provenance).
Run       : python scripts/build_dem_lean_defection.py
"""
import json

import numpy as np

from _lib import DATA_CLEAN, clean_var, load_anes_2016


def one_in(pct):
    if pct <= 0:
        return "—"
    return f"≈ 1 in {round(100.0 / pct)}"


def main():
    df = load_anes_2016()
    w = clean_var(df, "V160102", 0, 1e9).fillna(0).clip(lower=0)

    t1 = clean_var(df, "V161215", 1, 5)   # trust do-right (1 always..5 never)
    t2 = clean_var(df, "V161216", 1, 2)   # benefit of all vs few big interests
    t3 = clean_var(df, "V161217", 1, 3)   # waste tax money (1 a lot..3 not much) — 1-3 item
    trust = (
        (1 - (t1 - 1) / 4) + (t2 - 1) / 1 + (t3 - 1) / 2
    ) / 3.0

    pid = clean_var(df, "V161158x", 1, 7)
    vote = clean_var(df, "V162034a", 1, 7)

    base = pid.isin([1, 2, 3]) & vote.notna() & trust.notna() & (w > 0)
    to_trump = vote == 2

    def rate(mask):
        m = base & mask
        return float(np.average((to_trump[m]).astype(float), weights=w[m]) * 100), int(m.sum())

    # weighted median trust among the Dem-lean voter base
    order = trust[base].sort_values().index
    cw = w[order].cumsum()
    med = float(trust[order][cw >= cw.iloc[-1] / 2].iloc[0])

    all_pct, all_n = rate(trust.notna())
    low_pct, low_n = rate(trust > med)    # low grievance = high trust
    high_pct, high_n = rate(trust <= med)  # high grievance = low trust

    rows = [
        {"key": "lowgriev",  "label": "Low-grievance (high-trust)",
         "pct": round(low_pct, 1),  "inline": one_in(low_pct),  "n": low_n},
        {"key": "all",       "label": "All Dem-leaners",
         "pct": round(all_pct, 1),  "inline": one_in(all_pct),  "n": all_n},
        {"key": "highgriev", "label": "High-grievance (low-trust)",
         "pct": round(high_pct, 1), "inline": one_in(high_pct), "n": high_n},
    ]
    out = {
        "rows": rows,
        "multiplier": round(high_pct / low_pct, 1) if low_pct > 0 else None,
        "median_trust": round(med, 3),
        "meta": {
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
            "population": "Dem-leaners (V161158x in {1,2,3}) who cast a valid presidential vote (V162034a 1-7)",
            "defection": "voted Trump (V162034a == 2)",
            "trust_index": "mean of [1-(V161215-1)/4, (V161216-1)/1, (V161217-1)/2], 0-1 high=more trust",
            "grievance_split": "weighted median of the Dem-lean voter base; high-grievance = trust <= median",
            "weight": "V160102 (POST)",
            "pipeline": "scripts/build_dem_lean_defection.py",
        },
    }
    out_path = DATA_CLEAN / "dem_lean_defection.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"wrote {out_path}")
    for r in rows:
        print(f"  {r['label']:30s} {r['pct']:>5}%  {r['inline']}  (n={r['n']})")
    print(f"  multiplier = {out['multiplier']}x   median trust = {out['median_trust']}")


if __name__ == "__main__":
    main()
