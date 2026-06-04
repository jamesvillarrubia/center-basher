"""
build_within_cycle_movement.py — §16 within-cycle FT-gap movement test.

Uses VSG panel data (Sep 2020 + Nov 2020 waves, same respondents) to
quantify how much individual feeling-thermometer gap (FT_dem - FT_rep)
shifts during the last 6 weeks of a campaign.

Headline: individual movement is huge (median |shift|=6pt, 51% move 5+pt)
but population-level gap shift is tiny (+1.09 net, skewness 0.085 — symmetric).
Late-gap adds only 1.6pp predictive lift over Sep-gap for vote.

Output: data/clean/within_cycle_movement_2020.json
  - cycles: per-respondent [gap_sep, gap_nov, vote, in_swing, is_critic]
  - aggregate stats for chart annotations
"""
import json
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

VSG_PATH = "data/derived/VOTER-Survey-Panel-Data-Files-2021Dec/VOTER Panel Data Files/voter_panel.dta"
SWING_2020 = {42, 26, 55, 4, 13, 37, 12, 32}  # PA MI WI AZ GA NC FL NV


def main():
    df = pd.read_stata(VSG_PATH, convert_categoricals=False)
    cols = [
        "ft_dem_2020Sep", "ft_dem_2020Nov",
        "ft_rep_2020Sep", "ft_rep_2020Nov",
        "presvote_2020Nov", "inputstate_2020Nov", "trustgovt_2020Nov",
    ]
    d = df[cols].copy()
    for c in cols[:4]:
        d[c] = pd.to_numeric(d[c], errors="coerce").where(lambda x: x.between(0, 100))

    d["gap_sep"] = d["ft_dem_2020Sep"] - d["ft_rep_2020Sep"]
    d["gap_nov"] = d["ft_dem_2020Nov"] - d["ft_rep_2020Nov"]
    d["gap_shift"] = d["gap_nov"] - d["gap_sep"]

    state = pd.to_numeric(d["inputstate_2020Nov"], errors="coerce")
    in_swing = state.isin(SWING_2020)

    vote = pd.to_numeric(d["presvote_2020Nov"], errors="coerce")
    # 1 = Trump, 2 = Biden (verified by sample distribution matching national)
    vote_str = vote.map({1: "T", 2: "B"}).fillna("X")

    trust = pd.to_numeric(d["trustgovt_2020Nov"], errors="coerce")
    is_critic = trust == 3  # VSG 3-pt scale; 3 = "some of the time" (most distrust)

    m = d["gap_sep"].notna() & d["gap_nov"].notna()
    sub = d.loc[m].copy()
    sub["vote"] = vote_str[m].values
    sub["in_swing"] = in_swing[m].values.astype(int)
    sub["is_critic"] = is_critic[m].values.astype(int)

    # Per-respondent compact records
    records = [
        {
            "s": int(round(r.gap_sep)),
            "n": int(round(r.gap_nov)),
            "v": r.vote,
            "w": int(r.in_swing),
            "c": int(r.is_critic),
        }
        for r in sub.itertuples(index=False)
    ]

    # Aggregate stats for chart annotations
    def stats(mask):
        s = sub.loc[mask, "gap_sep"]
        n = sub.loc[mask, "gap_nov"]
        sh = sub.loc[mask, "gap_shift"]
        return {
            "n": int(mask.sum()),
            "mean_sep": round(float(s.mean()), 2),
            "mean_nov": round(float(n.mean()), 2),
            "mean_shift": round(float(sh.mean()), 3),
            "median_shift": float(sh.median()),
            "std_shift": round(float(sh.std()), 2),
            "skewness": round(float(((sh - sh.mean()) ** 3).mean() / sh.std() ** 3), 3),
            "pct_dlean_shift": round(float((sh > 0).mean() * 100), 1),
            "pct_rlean_shift": round(float((sh < 0).mean() * 100), 1),
            "pct_shift_gt5": round(float((sh.abs() > 5).mean() * 100), 1),
            "pct_shift_gt10": round(float((sh.abs() > 10).mean() * 100), 1),
            "pct_shift_gt20": round(float((sh.abs() > 20).mean() * 100), 1),
        }

    all_mask = pd.Series([True] * len(sub), index=sub.index)
    swing_mask = sub["in_swing"] == 1
    sw_critic_mask = (sub["in_swing"] == 1) & (sub["is_critic"] == 1)

    # Predictive lift: Sep gap direction vs Nov gap direction → predict vote
    voted = sub["vote"].isin(["B", "T"])
    voted_biden = sub["vote"] == "B"
    sep_pred = ((sub["gap_sep"] > 0) == voted_biden) & voted
    nov_pred = ((sub["gap_nov"] > 0) == voted_biden) & voted
    predictive_lift = {
        "n_voters": int(voted.sum()),
        "sep_predicts_vote_pct": round(float(sep_pred.sum() / voted.sum() * 100), 1),
        "nov_predicts_vote_pct": round(float(nov_pred.sum() / voted.sum() * 100), 1),
    }

    payload = {
        "source": "VSG (Voter Study Group) panel, Sep 2020 + Nov 2020 waves, same respondents.",
        "method": (
            "Per-respondent gap = FT_Democrat - FT_Republican. We compare gap at Sep "
            "wave vs Nov wave (~6 weeks apart, mid-Sep to early-Nov). Vote outcome from "
            "presvote_2020Nov (1=Trump, 2=Biden). Swing-state subset = 2020 actual "
            "battleground (PA MI WI AZ GA NC FL NV). Critics = bottom-trust tercile "
            "(VSG trustgovt_2020Nov == 3)."
        ),
        "caveats": [
            "Feeling thermometer is a proxy for candidate evaluation; not honesty specifically.",
            "Critics defined by VSG 3-pt trust scale; not directly comparable to ANES 5-pt tercile.",
        ],
        "n_total": len(sub),
        "stats_all": stats(all_mask),
        "stats_swing": stats(swing_mask),
        "stats_swing_critics": stats(sw_critic_mask),
        "predictive_lift": predictive_lift,
        "respondents": records,
    }

    out = "data/clean/within_cycle_movement_2020.json"
    with open(out, "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"Wrote {out} ({len(records)} respondents)")
    print()
    print(f"All voters (n={payload['stats_all']['n']}):")
    for k, v in payload["stats_all"].items():
        print(f"  {k}: {v}")
    print()
    print(f"Swing-state respondents (n={payload['stats_swing']['n']}):")
    for k, v in payload["stats_swing"].items():
        print(f"  {k}: {v}")
    print()
    print(f"Swing-state Critics (n={payload['stats_swing_critics']['n']}):")
    for k, v in payload["stats_swing_critics"].items():
        print(f"  {k}: {v}")
    print()
    print(f"Predictive lift: Sep gap → vote = {predictive_lift['sep_predicts_vote_pct']}%, "
          f"Nov gap → vote = {predictive_lift['nov_predicts_vote_pct']}%, "
          f"lift = +{predictive_lift['nov_predicts_vote_pct'] - predictive_lift['sep_predicts_vote_pct']:.1f}pp")


if __name__ == "__main__":
    main()
