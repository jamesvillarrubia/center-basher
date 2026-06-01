"""
build_cross_cycle_consistency.py — §3 cross-cycle vote consistency by self-ID.

Same VSG panel respondents across 2012 / 2016 / 2020 presidential elections.
Each cycle's vote captured contemporaneously (panel re-survey after each
general), so this avoids the recall-bias problem.

For each self-ID band (5-pt ideology from 2016, ideo5_2016):
  liberal   = {1=Very lib, 2=Liberal}
  moderate  = {3=Moderate}
  conservative = {4=Conservative, 5=Very con}

Partition each band's three-cycle voters into:
  always_dem   — Dem nominee in all three cycles
  always_rep   — Rep nominee in all three cycles
  switched     — voted Dem in one cycle and Rep in another (incl. mixed paths)

Vote codes:
  presvote_2012:    1 = Obama (D), 2 = Romney (R)
  presvote_2016:    1 = Clinton (D), 2 = Trump (R)
  presvote_2020Nov: 1 = Trump (R), 2 = Biden (D)   ← FLIPPED from 2016
"""
import json
import numpy as np
import pandas as pd

from _lib import load_vsg_panel, DATA_CLEAN


BANDS = [
    ("liberal",      [1, 2]),
    ("moderate",     [3]),
    ("conservative", [4, 5]),
]


def normalize_vote(d, col, dem_code, rep_code):
    """Return a Series with 'D'/'R'/NaN."""
    v = pd.to_numeric(d[col], errors="coerce")
    out = pd.Series(index=v.index, dtype="object")
    out[v == dem_code] = "D"
    out[v == rep_code] = "R"
    return out


def main():
    d = load_vsg_panel()
    w = pd.to_numeric(d["weight_genpop_2016"], errors="coerce").fillna(0).clip(lower=0)
    ideo = pd.to_numeric(d["ideo5_2016"], errors="coerce")

    v12 = normalize_vote(d, "presvote_2012",    dem_code=1, rep_code=2)
    v16 = normalize_vote(d, "presvote_2016",    dem_code=1, rep_code=2)
    v20 = normalize_vote(d, "presvote_2020Nov", dem_code=2, rep_code=1)  # FLIPPED

    base = v12.notna() & v16.notna() & v20.notna() & ideo.notna() & (w > 0)

    rows = []
    for band, codes in BANDS:
        mask = base & ideo.isin(codes)
        n = int(mask.sum())
        if n == 0:
            continue

        sub_v12 = v12[mask]; sub_v16 = v16[mask]; sub_v20 = v20[mask]
        sub_w = w[mask]

        always_d = (sub_v12 == "D") & (sub_v16 == "D") & (sub_v20 == "D")
        always_r = (sub_v12 == "R") & (sub_v16 == "R") & (sub_v20 == "R")
        switched = ~(always_d | always_r)

        def wpct(m):
            return round(float(np.average(m, weights=sub_w)) * 100, 1)

        pct_d = wpct(always_d)
        pct_r = wpct(always_r)
        pct_sw = wpct(switched)

        rows.append({
            "band": band,
            "n_unweighted": n,
            "always_dem_pct": pct_d,
            "always_rep_pct": pct_r,
            "switched_pct": pct_sw,
            "consistent_pct": round(pct_d + pct_r, 1),
        })

    df = pd.DataFrame(rows)
    csv_path = DATA_CLEAN / "cross_cycle_consistency.csv"
    df.to_csv(csv_path, index=False)

    out = {
        "source": "Democracy Fund VOTER Survey (VSG) panel — same respondents across 2012/2016/2020 presidential elections; data/derived/VOTER-Survey-Panel-Data-Files-2021Dec/...",
        "variables": [
            "presvote_2012 (1=Obama, 2=Romney)",
            "presvote_2016 (1=Clinton, 2=Trump)",
            "presvote_2020Nov (1=Trump, 2=Biden) — FLIPPED from 2016 coding",
            "ideo5_2016 (1=Very lib, 2=Lib, 3=Mod, 4=Con, 5=Very con)",
            "weight_genpop_2016",
        ],
        "filter": "Voted in all three cycles AND non-missing ideology AND positive weight.",
        "method": "Weighted partition into always-Dem, always-Rep, switched. Switched = voted both parties at some point across the three cycles.",
        "n": int(df["n_unweighted"].sum()),
        "rows": rows,
        "supports": ["plain-language.md §3 [1]"],
    }

    json_path = DATA_CLEAN / "cross_cycle_consistency.json"
    with open(json_path, "w") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote {csv_path} and {json_path}")
    print()
    print("Cross-cycle (2012/2016/2020) consistency by 2016 self-ID:")
    print(f"{'band':>13} {'n':>5} {'D-D-D':>7} {'R-R-R':>7} {'switch':>7} {'consist':>8}")
    for r in rows:
        print(f"{r['band']:>13} {r['n_unweighted']:>5} {r['always_dem_pct']:>6.1f}% {r['always_rep_pct']:>6.1f}% {r['switched_pct']:>6.1f}% {r['consistent_pct']:>7.1f}%")


if __name__ == "__main__":
    main()
