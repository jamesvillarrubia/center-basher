"""
build_within_tent_bolt.py — §7 (low-trust within-tent bolt; asymmetric).

Produces, for each "tent" (Dem-leaners+indep vs Rep-leaners+strong), the
2016 vote split by pre-election institutional-trust tercile. Two metrics:
  - narrow swing (voted the other-party nominee only)
  - broad swing (voted anything other than your own party's nominee)

Supports: plain-language.md §7 [1]-[5].
"""
import numpy as np
import pandas as pd

from _lib import clean_var, load_anes_2016, weighted_share, write_clean


def main():
    df = load_anes_2016()
    w = clean_var(df, "V160102", 0, 1e9).fillna(0).clip(lower=0)

    # 3-item institutional trust index, PRE-election wave
    t1 = clean_var(df, "V161215", 1, 5)
    t2 = clean_var(df, "V161216", 1, 2)
    t3 = clean_var(df, "V161217", 1, 5)
    # Build index 0..1 where HIGH = MORE trust (consistent with the body language)
    # Direction notes:
    #   V161215: 1 always..5 never → higher = LESS trust → normalize to 1-(s-1)/4
    #   V161216: 1 few big int..2 benefit all → higher = MORE trust → normalize to (s-1)/1
    #   V161217: 1 a lot waste..5 not at all → higher = MORE trust → normalize (s-1)/4
    trust = pd.concat([
        1 - (t1 - 1) / 4,
        (t2 - 1) / 1,
        (t3 - 1) / 4,
    ], axis=1).mean(axis=1)

    pid = clean_var(df, "V161158x", 1, 7)
    vch = clean_var(df, "V162034a", 1, 7)
    voted = vch.notna()

    # tents
    non_rep = pid.between(1, 4)    # Dem leaners + pure indeps
    rep_lean = pid.between(5, 7)   # Rep leaners + strong

    rows = []
    # tercile bins of trust within each tent (so trust band is comparable within-tent)
    for tent_label, tent_mask, own_winner_code, other_code, own_label, other_label in [
        ("Non-Republicans (Dems+indeps)", non_rep, 1, 2, "Clinton (own)", "Trump (other)"),
        ("Republicans (lean/strong)", rep_lean, 2, 1, "Trump (own)", "Clinton (other)"),
    ]:
        base = tent_mask & voted & trust.notna() & (w > 0)
        if not base.any():
            continue
        # tercile cuts on the in-tent subset
        cuts = trust[base].quantile([1/3, 2/3]).values
        for band_label, band_mask in [
            ("low-trust",  base & (trust <  cuts[0])),
            ("mid-trust",  base & (trust >= cuts[0]) & (trust < cuts[1])),
            ("high-trust", base & (trust >= cuts[1])),
        ]:
            n = int(band_mask.sum())
            if n == 0:
                continue
            voted_other = float(np.average((vch[band_mask] == other_code).astype(float), weights=w[band_mask]) * 100)
            voted_own = float(np.average((vch[band_mask] == own_winner_code).astype(float), weights=w[band_mask]) * 100)
            voted_third = float(np.average((vch[band_mask] >= 3).astype(float), weights=w[band_mask]) * 100)
            mean_trust = float(np.average(trust[band_mask], weights=w[band_mask]))
            rows.append({
                "tent": tent_label,
                "trust_band": band_label,
                "vote_own_pct": round(voted_own, 1),
                "vote_other_pct": round(voted_other, 1),
                "vote_third_pct": round(voted_third, 1),
                "broad_swing_pct": round(100 - voted_own, 1),  # anything-but-own
                "mean_trust_index": round(mean_trust, 3),
                "n_unweighted": n,
            })

    # add a "defectors' mean trust" reference row across both tents
    defectors = ((non_rep & (vch == 2)) | (rep_lean & (vch == 1))) & trust.notna() & (w > 0)
    if defectors.any():
        rows.append({
            "tent": "[ref] all defectors",
            "trust_band": "—",
            "vote_own_pct": np.nan,
            "vote_other_pct": np.nan,
            "vote_third_pct": np.nan,
            "broad_swing_pct": np.nan,
            "mean_trust_index": round(float(np.average(trust[defectors], weights=w[defectors])), 3),
            "n_unweighted": int(defectors.sum()),
        })

    write_clean(
        name="within_tent_bolt",
        rows=rows,
        manifest={
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
            "variables": [
                "V160101 (weight)", "V161158x (PID)", "V162034a (vote)",
                "V161215/V161216/V161217 (3-item trust index, PRE-election)",
            ],
            "filter": "Voters within each tent (Dems+indeps vs Republicans) with valid trust + vote.",
            "weight": "V160101 (post-election)",
            "method": (
                "3-item trust index 0..1 (HIGH=MORE trust); terciles taken WITHIN each tent. "
                "Within-tent vote splits by trust band. Broad-swing = 100% - voted-own."
            ),
            "n": int(((non_rep | rep_lean) & voted & trust.notna() & (w > 0)).sum()),
            "supports": ["plain-language.md §7 [1]", "§7 [2]", "§7 [3]", "§7 [4]", "§7 [5]"],
            "caveats": [
                "Trust is measured pre-election; vote is measured post-election — NOT circular.",
                "'Broad swing' = any vote other than the own-team nominee (Trump + third + abstain-counted-as-non-Clinton-among-Dems). 'Narrow swing' = voted the other-party nominee only.",
                "Republicans face Trump (an outsider) — within-tent bolt is asymmetric and only fires when YOUR candidate is cast as the establishment.",
            ],
        },
    )


if __name__ == "__main__":
    main()
