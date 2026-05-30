"""
build_partisan_loyalty.py — §3 (92/92 partisan loyalty, 1-in-25 defectors).

Supports: plain-language.md §3 [1], [2], [3], [4], [5], [6].
"""
import numpy as np
import pandas as pd

from _lib import clean_var, load_anes_2016, weighted_share, write_clean


def main():
    df = load_anes_2016()
    w = clean_var(df, "V160101", 0, 1e9).fillna(0).clip(lower=0)

    pid = clean_var(df, "V161158x", 1, 7)
    ideo = clean_var(df, "V161126", 1, 7, also_missing=(99,))
    vch = clean_var(df, "V162034a", 1, 7)
    voted = vch.notna()

    dem_lean = pid.between(1, 3)
    rep_lean = pid.between(5, 7)
    pure_ind = (pid == 4)
    clinton = (vch == 1)
    trump = (vch == 2)

    rows = []

    # 92/92 loyalty among partisans who voted
    for label, base, target in [
        ("Dem leaners/strong → Clinton", dem_lean & voted, clinton),
        ("Rep leaners/strong → Trump", rep_lean & voted, trump),
    ]:
        m = base & (w > 0)
        loyal_rate = float(np.average(target[m].astype(float), weights=w[m]) * 100) if m.any() else float("nan")
        rows.append({
            "metric": label,
            "value_pct": round(loyal_rate, 1),
            "share_of_electorate_pct": round(weighted_share(base, w) * 100, 1),
            "n_unweighted": int(m.sum()),
        })

    # defectors (cross-party voters)
    dem_defect = dem_lean & voted & (vch == 2)
    rep_defect = rep_lean & voted & (vch == 1)
    all_defect = dem_defect | rep_defect
    for label, mask in [
        ("Dem leaner voted Trump (defector)", dem_defect),
        ("Rep leaner voted Clinton (defector)", rep_defect),
        ("All defectors (1 in 25)", all_defect),
    ]:
        rows.append({
            "metric": label,
            "value_pct": round(weighted_share(mask, w) * 100, 2),
            "share_of_electorate_pct": round(weighted_share(mask, w) * 100, 2),
            "n_unweighted": int(mask.sum()),
        })

    # pure independents (1 in 7)
    pi_voted = pure_ind & voted
    pi_trump_pct = float(np.average((vch[pi_voted & (w > 0)] == 2).astype(float), weights=w[pi_voted & (w > 0)]) * 100) if (pi_voted & (w > 0)).any() else float("nan")
    rows.append({
        "metric": "Pure independents (V161158x=4)",
        "value_pct": round(weighted_share(pure_ind, w) * 100, 1),
        "share_of_electorate_pct": round(weighted_share(pure_ind, w) * 100, 1),
        "n_unweighted": int(pure_ind.sum()),
    })
    rows.append({
        "metric": "Pure independents voting Trump (of those who voted)",
        "value_pct": round(pi_trump_pct, 1),
        "share_of_electorate_pct": np.nan,
        "n_unweighted": int((pi_voted & (w > 0)).sum()),
    })

    # moderates by party
    selfmod = ideo.between(3, 5)
    for label, base, descriptor in [
        ("Self-ID moderate AND Dem-lean/strong", selfmod & dem_lean, "47% target"),
        ("Self-ID moderate AND Rep-lean/strong", selfmod & rep_lean, "32% target"),
        ("Self-ID moderate AND pure indep", selfmod & pure_ind, "21% target"),
    ]:
        m = base & (w > 0) & selfmod
        rows.append({
            "metric": label,
            "value_pct": round(weighted_share(base, w, denom_mask=selfmod) * 100, 1),
            "share_of_electorate_pct": np.nan,
            "n_unweighted": int(m.sum()),
        })

    # spectrum distribution of swing voters
    # Dem→Trump defectors' mean lib-con position
    dt = dem_defect & ideo.notna() & (w > 0)
    rt = rep_defect & ideo.notna() & (w > 0)
    rows.append({
        "metric": "Dem→Trump defectors: mean lib-con (1-7)",
        "value_pct": round(float(np.average(ideo[dt], weights=w[dt])), 2) if dt.any() else float("nan"),
        "share_of_electorate_pct": np.nan,
        "n_unweighted": int(dt.sum()),
    })
    rows.append({
        "metric": "Rep→Clinton defectors: mean lib-con (1-7)",
        "value_pct": round(float(np.average(ideo[rt], weights=w[rt])), 2) if rt.any() else float("nan"),
        "share_of_electorate_pct": np.nan,
        "n_unweighted": int(rt.sum()),
    })

    write_clean(
        name="partisan_loyalty",
        rows=rows,
        manifest={
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
            "variables": ["V160101 (weight)", "V161158x (7-pt PID, branched)",
                          "V161126 (lib-con)", "V162034a (presidential vote)"],
            "filter": "All respondents with valid weight; subsets per metric.",
            "weight": "V160101 (post-election)",
            "method": "Weighted shares and conditional means.",
            "n": int((w > 0).sum()),
            "supports": ["plain-language.md §3 [1]", "§3 [2]", "§3 [3]", "§3 [4]", "§3 [5]", "§3 [6]"],
            "caveats": [
                "Defector share is sensitive to the leaner-vs-pure-indep split definition.",
                "CES 2016 vote-validated reproduces 92% loyalty within ±1pp.",
            ],
        },
    )


if __name__ == "__main__":
    main()
