"""
build_center_breakdown.py — §2 (the True Middlers / Grab-Baggers / Whatevers split).

Computes the share of the 2016 electorate and the 2016 vote distribution for each
of three "moderate" buckets, using two definitions of policy-centrist (loose and
strict) so the section can honestly present both.

Supports: plain-language.md §2 [1], [4], [5], [6].
"""
import numpy as np
import pandas as pd

from _lib import clean_var, load_anes_2016, weighted_share, write_clean


def main():
    df = load_anes_2016()
    w = clean_var(df, "V160101", 0, 1e9).fillna(0).clip(lower=0)

    # self-ID lib-con scale; 99 = "haven't thought about it"
    ideo_raw = pd.to_numeric(df["V161126"], errors="coerce")
    havent = ideo_raw.isin([99, -1])
    ideo = clean_var(df, "V161126", 1, 7, also_missing=(99,))

    # ten 7-pt issue scales — policy composite
    issue_vars = [
        "V161178", "V161181", "V161184", "V161189", "V161193",
        "V161196", "V161198", "V161204", "V161208", "V161213",
    ]
    present = [c for c in issue_vars if c in df.columns]
    ip = pd.concat([clean_var(df, c, 1, 7, also_missing=(99,)) for c in present], axis=1)
    n_items = ip.notna().sum(axis=1)
    policy_mean = ip.mean(axis=1)
    # strict-centrist = at least 70% of items within ±1 of center AND ≥4 items present
    each_in_band = ((ip - 4).abs() <= 1).sum(axis=1) / n_items.replace(0, np.nan)
    strict_centrist = (each_in_band >= 0.7) & (n_items >= 4)
    # loose = item-mean within ±0.5 of center
    loose_centrist = (policy_mean - 4).abs() <= 0.5

    # vote choice
    vch = clean_var(df, "V162034a", 1, 7)
    voted = vch.notna()
    clinton = (vch == 1)
    trump = (vch == 2)
    third = vch >= 3

    selfmod = ideo.between(3, 5)

    # bucket masks
    middler_loose = selfmod & loose_centrist
    middler_strict = selfmod & strict_centrist
    grabbagger = selfmod & ~strict_centrist
    whatever = havent

    def vote_pct(mask, target):
        m = mask & vch.notna()
        return float(np.average(target[m].astype(float), weights=w[m]) * 100) if m.any() else float("nan")

    rows = []
    for label, mask in [
        ("True Middlers (loose: issue-mean centrist)", middler_loose),
        ("True Middlers (strict: ≥70% items within ±1)", middler_strict),
        ("Grab-Baggers (self-ID mod, NOT strict centrist)", grabbagger),
        ("Whatevers (haven't thought about ideology)", whatever),
    ]:
        share = weighted_share(mask, w)
        turnout = float(np.average(voted[mask & w.gt(0)].astype(float), weights=w[mask & w.gt(0)]) * 100) if (mask & (w > 0)).any() else float("nan")
        rows.append({
            "bucket": label,
            "share_of_electorate_pct": round(share * 100, 2),
            "turnout_pct_selfrep": round(turnout, 1),
            "vote_clinton_pct": round(vote_pct(mask, clinton), 1),
            "vote_trump_pct": round(vote_pct(mask, trump), 1),
            "vote_third_pct": round(vote_pct(mask, third), 1),
            "n_unweighted": int(mask.sum()),
        })

    # reference rows for the funnel sizes
    rows.append({
        "bucket": "[ref] self-ID moderate (lib-con 3-5)",
        "share_of_electorate_pct": round(weighted_share(selfmod, w) * 100, 2),
        "turnout_pct_selfrep": np.nan,
        "vote_clinton_pct": np.nan, "vote_trump_pct": np.nan, "vote_third_pct": np.nan,
        "n_unweighted": int(selfmod.sum()),
    })
    rows.append({
        "bucket": "[ref] strict pure moderate (lib-con = 4)",
        "share_of_electorate_pct": round(weighted_share(ideo == 4, w) * 100, 2),
        "turnout_pct_selfrep": np.nan,
        "vote_clinton_pct": np.nan, "vote_trump_pct": np.nan, "vote_third_pct": np.nan,
        "n_unweighted": int((ideo == 4).sum()),
    })

    write_clean(
        name="center_breakdown",
        rows=rows,
        manifest={
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
            "variables": ["V160101 (weight)", "V161126 (self-place lib-con)",
                          "V162034a (presidential vote)",
                          *[f"{c} (7-pt issue)" for c in present]],
            "filter": "Full sample; subsets defined by self-place band × policy centrism.",
            "weight": "V160101 (post-election)",
            "method": "Weighted shares and vote-share means; policy-centrist defined two ways "
                      "(loose: issue-mean within ±0.5 of center; strict: ≥70% of items within ±1 of center).",
            "n": int((w > 0).sum()),
            "supports": ["plain-language.md §2 [1]", "§2 [4]", "§2 [5]", "§2 [6]"],
            "caveats": [
                "Strict True Middler cell is small (n~1% of voters) — SEs on vote splits are large.",
                "Turnout figures are SELF-REPORT (V162034a non-missing); over-reports vs. validated by ~25pp.",
                "ANES under-samples the truly disengaged — Whatever bucket turnout is itself an over-estimate.",
            ],
        },
    )


if __name__ == "__main__":
    main()
