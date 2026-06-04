"""
build_nationscape_panel.py — §16 Figure E expansion using Nationscape data.

Two outputs:
 1. nationscape_panel_april_july_2020.json — Same-respondent April→July 2020
    favorability gap (Biden vs Trump). 5,972 matched panel respondents from
    the Nationscape parallel reinterviews. Tests within-cycle gap stability
    at a DIFFERENT window than VSG Sep→Nov. Cross-validation of Figure E.
 2. nationscape_weekly_trajectory.json — Aggregate weekly mean FT-gap from
    77 cross-sectional weekly waves (Jul 2019 → Dec 2020). ~350K total
    respondents. Shows that the AGGREGATE gap barely budges across the
    entire 16-month campaign window.

Note: Nationscape uses a 1-4 favorability scale, not a 0-100 thermometer.
We invert (5 - x) so HIGH = more favorable, then compute gap = Biden_fav -
Trump_fav. Range: -4 (Biden hated, Trump loved) to +4 (reverse).
"""
import json
import os
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

NS_ROOT = "data/raw/nationscape"


def fav_gap(df):
    """Return per-row gap = favorability(Biden) - favorability(Trump).
    Inverted from raw codes so HIGH = more favorable. Range -4..+4."""
    b = pd.to_numeric(df["cand_favorability_biden"], errors="coerce").where(lambda x: x.between(1, 4))
    t = pd.to_numeric(df["cand_favorability_trump"], errors="coerce").where(lambda x: x.between(1, 4))
    return (5 - b) - (5 - t)


def build_panel():
    """April→July 2020 same-respondent gap shift."""
    t1 = pd.read_stata(
        f"{NS_ROOT}/phase_parallel_v20210301/ns20200402_parallel/ns20200402_parallel.dta",
        convert_categoricals=False,
        columns=["response_id", "cand_favorability_biden", "cand_favorability_trump"],
    )
    t2 = pd.read_stata(
        f"{NS_ROOT}/phase_parallel_v20210301/ns20200716_parallel/ns20200716_parallel.dta",
        convert_categoricals=False,
        columns=["response_id", "cand_favorability_biden", "cand_favorability_trump"],
    )
    t1["pid"] = t1["response_id"].astype(str).str[4:]
    t2["pid"] = t2["response_id"].astype(str).str[4:]
    t1["gap_t1"] = fav_gap(t1)
    t2["gap_t2"] = fav_gap(t2)
    merged = t1[["pid", "gap_t1"]].merge(t2[["pid", "gap_t2"]], on="pid", how="inner")
    merged = merged.dropna(subset=["gap_t1", "gap_t2"])
    merged["shift"] = merged["gap_t2"] - merged["gap_t1"]
    n = len(merged)
    sh = merged["shift"]
    stats = {
        "n": int(n),
        "mean_t1": round(float(merged["gap_t1"].mean()), 3),
        "mean_t2": round(float(merged["gap_t2"].mean()), 3),
        "mean_shift": round(float(sh.mean()), 3),
        "median_shift": float(sh.median()),
        "std_shift": round(float(sh.std()), 3),
        "skewness": round(
            float(((sh - sh.mean()) ** 3).mean() / sh.std() ** 3), 3
        ) if sh.std() > 0 else 0.0,
        "pct_dlean_shift": round(float((sh > 0).mean() * 100), 1),
        "pct_rlean_shift": round(float((sh < 0).mean() * 100), 1),
        "pct_no_shift": round(float((sh == 0).mean() * 100), 1),
        "pct_shift_gt1": round(float((sh.abs() >= 1).mean() * 100), 1),
        "pct_shift_gt2": round(float((sh.abs() >= 2).mean() * 100), 1),
    }
    records = [
        {"s": int(round(r.gap_t1)), "n": int(round(r.gap_t2))}
        for r in merged.itertuples(index=False)
    ]
    payload = {
        "source": (
            "Nationscape (VSG/Democracy Fund) parallel panel reinterviews, "
            "April 2020 (T1) and July 2020 (T2). Same respondents, ~14 weeks apart."
        ),
        "method": (
            "Per-respondent gap = favorability(Biden) - favorability(Trump) on a "
            "1-4 favorability scale (inverted so higher = more favorable). "
            "Range -4 (Biden hated, Trump loved) to +4 (reverse)."
        ),
        "caveats": [
            "Favorability proxies for overall affect, not honesty specifically.",
            "1-4 integer scale (vs VSG's 0-100 thermometer) means coarser granularity.",
            "April→July window predates the active general-election campaign; spans pandemic-onset and George Floyd protests as confounders.",
        ],
        "stats": stats,
        "respondents": records,
    }
    out_path = "data/clean/nationscape_panel_april_july_2020.json"
    with open(out_path, "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"Wrote {out_path} (n={n})")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    return stats


def build_weekly_trajectory():
    """Aggregate weekly mean gap from all 77 cross-sectional waves."""
    waves = []
    for phase in ("phase_1_v20210301", "phase_2_v20210301", "phase_3_v20210301"):
        phase_dir = f"{NS_ROOT}/{phase}"
        if not os.path.isdir(phase_dir):
            continue
        for d in sorted(os.listdir(phase_dir)):
            wave_path = f"{phase_dir}/{d}/{d}.dta"
            if os.path.exists(wave_path):
                waves.append((d, wave_path))
    weekly_data = []
    for wave_id, p in waves:
        try:
            df = pd.read_stata(
                p, convert_categoricals=False,
                columns=["cand_favorability_biden", "cand_favorability_trump"],
            )
        except Exception:
            continue
        gap = fav_gap(df)
        m = gap.notna()
        n = int(m.sum())
        if n < 100:
            continue
        # Parse date from wave_id (ns20190718 → 2019-07-18)
        try:
            d_str = wave_id[2:10]
            date = f"{d_str[:4]}-{d_str[4:6]}-{d_str[6:8]}"
        except Exception:
            continue
        weekly_data.append({
            "wave": wave_id,
            "date": date,
            "n": n,
            "mean_gap": round(float(gap[m].mean()), 3),
            "se_gap": round(float(gap[m].std() / np.sqrt(n)), 3),
        })
    weekly_data.sort(key=lambda r: r["date"])
    # Overall summary
    all_means = np.array([w["mean_gap"] for w in weekly_data])
    summary = {
        "n_waves": len(weekly_data),
        "total_n": sum(w["n"] for w in weekly_data),
        "mean_of_means": round(float(all_means.mean()), 3),
        "min_mean": round(float(all_means.min()), 3),
        "max_mean": round(float(all_means.max()), 3),
        "range": round(float(all_means.max() - all_means.min()), 3),
        "std_of_means": round(float(all_means.std()), 3),
    }
    payload = {
        "source": "Nationscape weekly cross-sectional waves, Jul 2019 - Dec 2020.",
        "method": "Each wave is an independent ~6,000-respondent sample. Weekly mean of gap = favorability(Biden) - favorability(Trump), 1-4 inverted scale.",
        "caveats": [
            "Cross-sectional (different respondents each week), not panel.",
            "Trajectory reflects sample composition + true opinion shifts.",
        ],
        "summary": summary,
        "weekly": weekly_data,
    }
    out_path = "data/clean/nationscape_weekly_trajectory.json"
    with open(out_path, "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"\nWrote {out_path} ({len(weekly_data)} waves, total N={summary['total_n']})")
    for k, v in summary.items():
        print(f"  {k}: {v}")


def main():
    print("=== Panel test: April → July 2020 same-respondent ===")
    build_panel()
    print()
    print("=== Weekly trajectory: 77 cross-sectional waves Jul'19 → Dec'20 ===")
    build_weekly_trajectory()


if __name__ == "__main__":
    main()
