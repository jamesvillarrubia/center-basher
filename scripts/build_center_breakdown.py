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

    # Policy composite over the SIX genuine 7-pt liberal-conservative SELF-PLACEMENT
    # scales (each 1-7 with 4 = exactly moderate, so "distance from 4" is meaningful).
    # FIXED 2026-06-13: the earlier set mixed in five 3-category favor/oppose items
    # (V161193 birthright, V161196 wall, V161204 affirmative action, V161208 crime
    # spending, V161213 ISIS troops) coded 1-3 — their center is ~2, not 4 — which
    # biased the composite low and undercounted centrists. Those are dropped; the
    # 6th self-placement scale (V161201 environment-jobs) the old set omitted is added.
    issue_vars = [
        "V161178",  # spending & services
        "V161181",  # defense spending
        "V161184",  # govt vs private medical insurance
        "V161189",  # guaranteed jobs & income
        "V161198",  # govt assistance to blacks
        "V161201",  # environment vs jobs tradeoff
    ]
    present = [c for c in issue_vars if c in df.columns]
    ip = pd.concat([clean_var(df, c, 1, 7, also_missing=(99,)) for c in present], axis=1)
    n_items = ip.notna().sum(axis=1)
    policy_mean = ip.mean(axis=1)
    # loose = item-mean within ±0.75 of center (matches the 16%-funnel in §2 [3])
    loose_centrist = (policy_mean - 4).abs() <= 0.75
    # strict / True Middler = sits at the EXACT center (code 4) on at least 5 of the 6
    # liberal-conservative self-placement scales, and never more than one notch off on the
    # rest. On the corrected 6-scale composite this is ~0.8% of the electorate — a clean,
    # defensible "≈1 in 100" cross-issue centrist. (Retuned 2026-06-13 after the scale-mixing
    # fix raised the old loose-strict number; the integer scales make a mean-distance band
    # jump between ~5% and ~0.5%, so the count is set by how many issues must be dead-center.)
    each_in_band = ((ip - 4).abs() <= 1).sum(axis=1) / n_items.replace(0, np.nan)
    exact_center = ip.eq(4).sum(axis=1)
    strict_centrist = (exact_center >= 5) & (each_in_band >= 0.999) & (n_items >= 5)

    # vote choice
    vch = clean_var(df, "V162034a", 1, 7)
    voted = vch.notna()
    clinton = (vch == 1)
    trump = (vch == 2)
    third = vch >= 3

    selfmod = ideo.between(3, 5)

    # bucket masks
    # MidMiddlers (loose): self-ID moderate AND issue-mean within ±0.75 of center
    mid_middler = selfmod & loose_centrist
    # True Middlers (strict): self-ID mod AND issue-mean within ±0.5 AND ≥70% items within ±1
    true_middler = selfmod & strict_centrist
    # Grab-Baggers: self-ID moderate AND issue-mean OFF center (NOT loose-centrist)
    # — cleaner partition than the prior NOT-strict definition; matches §2 prose exactly
    grabbagger = selfmod & ~loose_centrist
    whatever = havent

    def vote_pct(mask, target):
        m = mask & vch.notna()
        return float(np.average(target[m].astype(float), weights=w[m]) * 100) if m.any() else float("nan")

    rows = []
    for label, mask in [
        ("MidMiddlers (self-ID mod, issue-mean ≈ centrist)", mid_middler),
        ("True Middlers (self-ID mod, centrist on each issue)", true_middler),
        ("Grab-Baggers (self-ID mod, issue-mean OFF-center)", grabbagger),
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
    # Unconditional "averages to the center" set: issue-mean within the SAME loose
    # ±0.75 band the MidMiddlers use, but with NO self-ID-moderate precondition. This is
    # the generous "look centrist on average" pool referenced from §1 ("about a third of
    # voters") — the broad set the funnel collapses out of. The MidMiddlers are just its
    # self-described-moderate slice; the rest are self-labeled liberals and conservatives
    # whose opposite extremes cancel to a middling mean (the averaging illusion, §2 body).
    # Require ≥5 of 6 issues answered: you cannot honestly say a voter "averages across
    # the issues" off one or two answers, so the loose_centrist ≥1-item rule is too weak
    # for the unconditional pool. Same ±0.75 band as the MidMiddlers, full electorate base.
    avg_to_center = ((policy_mean - 4).abs() <= 0.75) & (n_items >= 5)  # any self-ID
    rows.append({
        "bucket": "[ref] averages to center (issue-mean within ±0.75, ≥5 of 6, any self-ID)",
        "share_of_electorate_pct": round(weighted_share(avg_to_center, w) * 100, 2),
        "turnout_pct_selfrep": np.nan,
        "vote_clinton_pct": np.nan, "vote_trump_pct": np.nan, "vote_third_pct": np.nan,
        "n_unweighted": int(avg_to_center.sum()),
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
