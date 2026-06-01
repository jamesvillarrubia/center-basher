"""
build_swing_state_trust.py — §16 swing-state trust trends.

For each presidential cycle 2000-2024, compute the 3-item trust composite mean
within key swing states (WI, MI, PA, FL, OH, AZ, GA, NC, NV) plus reference
states (NY, CA, TX, AL) plus the national average. This is the data backing
the §16 first caveat: that the change-lane rule predicts Electoral College
outcomes via swing-state margins, not the national popular vote.

The hypothesis is that swing-state trust tracks (or runs slightly below) the
national average, but the variation in WI/MI/PA in 2016 and 2024 should
correlate with the cycle's outcome.

Trust composite: same as build_trust_vote_by_cycle.py — VCF0604 (do-right,
reversed) + VCF0605 (run for benefit of all) + VCF0609 (waste tax money),
normalized 0..1 with HIGH = MORE trust.

Supports: plain-language.md §16 (first caveat — swing-state trust trends).
"""
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, write_clean


PRES_CYCLES = [2000, 2004, 2008, 2012, 2016, 2020, 2024]

# FIPS codes
SWING_STATES = {
    55: "WI", 26: "MI", 42: "PA", 12: "FL", 39: "OH",
    4: "AZ", 13: "GA", 37: "NC", 32: "NV",
}
REF_STATES = {
    36: "NY (ref-blue)", 6: "CA (ref-blue)",
    48: "TX (ref-red)", 1: "AL (ref-red)",
}
INCUMBENT = {
    2000: "D", 2004: "R", 2008: "R", 2012: "D",
    2016: "D", 2020: "R", 2024: "D",
}


def norm(s, lo, hi, reverse=False):
    x = (s - lo) / (hi - lo)
    return (1 - x) if reverse else x


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    state = pd.to_numeric(cdf["VCF0901a"], errors="coerce")
    wt = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)

    # Trust composite (HIGH = MORE trust)
    t1 = cdf_num(cdf["VCF0604"])
    t2 = cdf_num(cdf["VCF0605"])
    t3 = cdf_num(cdf["VCF0609"])
    a = norm(t1, 1, 5, reverse=True)
    b = norm(t2, 1, 2, reverse=False)
    c = norm(t3, 1, 3, reverse=False)
    trust = pd.concat([a, b, c], axis=1).mean(axis=1)

    rows = []
    for y_ in PRES_CYCLES:
        m_all = (yr == y_) & (wt > 0) & trust.notna()
        n_nat = int(m_all.sum())
        if n_nat < 50:
            continue
        nat_mean = float(np.average(trust[m_all], weights=wt[m_all]))

        rows.append({
            "cycle": int(y_),
            "wh_incumbent": INCUMBENT[y_],
            "state": "[national]",
            "fips": None,
            "n_unweighted": n_nat,
            "trust_mean": round(nat_mean, 3),
            "diff_from_national": 0.000,
            "swing_category": "national",
        })

        for code, name in {**SWING_STATES, **REF_STATES}.items():
            m_st = m_all & (state == code)
            n_st = int(m_st.sum())
            if n_st < 20:
                # too small to report
                rows.append({
                    "cycle": int(y_), "wh_incumbent": INCUMBENT[y_],
                    "state": name, "fips": code,
                    "n_unweighted": n_st,
                    "trust_mean": None,
                    "diff_from_national": None,
                    "swing_category": ("swing" if code in SWING_STATES else "ref"),
                })
                continue
            st_mean = float(np.average(trust[m_st], weights=wt[m_st]))
            rows.append({
                "cycle": int(y_), "wh_incumbent": INCUMBENT[y_],
                "state": name, "fips": code,
                "n_unweighted": n_st,
                "trust_mean": round(st_mean, 3),
                "diff_from_national": round(st_mean - nat_mean, 3),
                "swing_category": ("swing" if code in SWING_STATES else "ref"),
            })

    # Print compact summary
    print("Swing-state trust by cycle (mean, 0-1 scale; diff vs national):")
    df = pd.DataFrame(rows)
    pivot = df.pivot_table(index="state", columns="cycle", values="trust_mean", aggfunc="first")
    print(pivot.round(3).to_string())
    print()
    print("Diff from national:")
    pivot_diff = df.pivot_table(index="state", columns="cycle", values="diff_from_national", aggfunc="first")
    print(pivot_diff.round(3).to_string())

    # Summary: average diff-from-national across cycles for each swing state
    swing_only = df[df["swing_category"] == "swing"]
    swing_avg_diff = swing_only.groupby("state")["diff_from_national"].mean().round(3)
    print("\nMean diff-from-national across cycles (swing states):")
    print(swing_avg_diff.to_string())

    write_clean(
        name="swing_state_trust",
        rows=rows,
        manifest={
            "source": "ANES CDF 1948-2024 — data/derived/anes_timeseries_cdf_csv_20260205/.",
            "variables": [
                "VCF0004 (cycle)", "VCF0009z (weight)", "VCF0901a (state FIPS)",
                "VCF0604 (gov do-right, reversed)", "VCF0605 (benefit of all)",
                "VCF0609 (waste tax money)",
            ],
            "filter": "Presidential cycles 2000-2024. State sample n >= 20 required for state estimate.",
            "weight": "VCF0009z",
            "method": "Trust composite = mean of 3 items normalized 0-1 (HIGH = MORE trust). "
                      "Weighted mean per cycle per state. 'diff_from_national' = state mean minus "
                      "that cycle's national mean.",
            "n": int(sum(r["n_unweighted"] for r in rows if r["state"] != "[national]")),
            "supports": ["plain-language.md §16 (popular-vote-vs-EC caveat)"],
            "caveats": [
                "ANES state n is small (typically 50-300 per cycle per swing state); "
                "individual cycle-state estimates have wide SEs. The PATTERN across cycles "
                "and across states is what's load-bearing, not any single number.",
                "VCF0604 missing 2016-2024; trust composite for those cycles uses 0605+0609 only "
                "(matches the §15 pipeline footnote).",
                "Self-reported trust is concurrent with the vote, not pre-treatment. "
                "Trust and partisanship co-vary; partisan composition of each state's sample "
                "shapes the trust mean as well.",
                "States with n < 20 in a cycle are reported as missing rather than estimated.",
            ],
        },
    )


if __name__ == "__main__":
    main()
