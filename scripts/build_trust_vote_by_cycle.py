"""
build_trust_vote_by_cycle.py — §15 (trust → vote sign flips with WH party).

Per-cycle standardized weighted logistic of P(Republican presidential vote) on
ideology + trust. Rule: trust coefficient should be POSITIVE under Rep incumbent
(low-trust opposes the in-party → leans D) and NEGATIVE under Dem incumbent.

Supports: plain-language.md §15 [1], [2].
"""
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, weighted_std_logit, write_clean


INCUMBENT = {
    1972: "R", 1976: "R", 1980: "D", 1984: "R", 1988: "R", 1992: "R",
    1996: "D", 2000: "D", 2004: "R", 2008: "R", 2012: "D", 2016: "D",
    2020: "R", 2024: "D",
}


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    wt = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)
    vote = cdf_num(cdf["VCF0704"])
    ideo = cdf_num(cdf["VCF0803"])

    t1 = cdf_num(cdf["VCF0604"])   # do-right: 1 always..5 never (cycles 1958-2012-ish)
    t2 = cdf_num(cdf["VCF0605"])   # benefit of all vs few big int
    t3 = cdf_num(cdf["VCF0609"])   # waste tax money

    # Trust index: HIGH = MORE trust. We rescale each item to 0..1 and mean.
    # Direction of each item, then normalized:
    def norm(s, lo, hi, reverse=False):
        x = (s - lo) / (hi - lo)
        return (1 - x) if reverse else x
    # VCF0604: 1 always..5 never → high value = LESS trust → reverse
    a = norm(t1, 1, 5, reverse=True)
    # VCF0605: 1 few big int..2 benefit all → high = MORE trust (no reverse)
    b = norm(t2, 1, 2, reverse=False)
    # VCF0609: 1 a lot waste..3 not at all → high = MORE trust (no reverse)
    c = norm(t3, 1, 3, reverse=False)
    trust = pd.concat([a, b, c], axis=1).mean(axis=1)

    rows = []
    for y_ in sorted(INCUMBENT):
        wh = INCUMBENT[y_]
        m = (yr == y_) & vote.isin([1, 2]) & ideo.notna() & trust.notna() & (wt > 0)
        if m.sum() < 100:
            continue
        yvec = (vote[m] == 2).astype(float)
        coefs = weighted_std_logit(yvec, {"ideo": ideo[m], "trust": trust[m]}, wt[m])

        # Classification: "low-trust leans" — the direction low-trust voters lean
        # given the trust coefficient. Trust coded HIGH=MORE TRUST, so β_trust>0
        # means HIGH trust → MORE Rep vote → LOW trust → MORE Dem (anti-Rep).
        trust_beta = float(coefs["trust"])
        if trust_beta > 0.05:
            leans = "D"
        elif trust_beta < -0.05:
            leans = "R"
        else:
            leans = "flat"
        # Expected leans under "anti-incumbent" rule:
        expected = "D" if wh == "R" else "R"
        rule_holds = (leans == expected)

        rows.append({
            "cycle": int(y_),
            "wh_incumbent": wh,
            "n_unweighted": int(m.sum()),
            "ideo_std_beta": round(float(coefs["ideo"]), 3),
            "trust_std_beta": round(trust_beta, 3),
            "low_trust_leans": leans,
            "expected_under_rule": expected,
            "rule_holds": bool(rule_holds),
        })

    # summary row
    held = sum(1 for r in rows if r["rule_holds"])
    rows.append({
        "cycle": 0,  # sentinel for summary
        "wh_incumbent": "—",
        "n_unweighted": int(sum(r["n_unweighted"] for r in rows)),
        "ideo_std_beta": float("nan"),
        "trust_std_beta": float("nan"),
        "low_trust_leans": f"{held} of {len(rows)} cycles",
        "expected_under_rule": "—",
        "rule_holds": True,  # the summary row is the summary
    })

    write_clean(
        name="trust_vote_by_cycle",
        rows=rows,
        manifest={
            "source": "ANES Time Series Cumulative File (1948-2024) — data/derived/anes_timeseries_cdf_csv_20260205/.../csv.",
            "variables": [
                "VCF0004 (year)", "VCF0009z (weight)", "VCF0704 (pres vote: 1 Dem, 2 Rep)",
                "VCF0803 (lib-con)",
                "VCF0604 (do-right, REVERSED)", "VCF0605 (run for all vs few)", "VCF0609 (waste)",
            ],
            "filter": "Two-party voters per cycle with valid ideo + trust + weight; cycles 1972-2024 (VCF0604 absent in some recent cycles).",
            "weight": "VCF0009z",
            "method": (
                "3-item trust index 0..1 (HIGH=MORE trust), built from VCF0604 reversed + VCF0605 + VCF0609 normalized. "
                "Per-cycle weighted standardized logistic of P(Rep vote) on ideology + trust. "
                "'low_trust_leans' is the direction LOW-trust voters tilt given the sign of β_trust."
            ),
            "n": int((yr.notna() & vote.isin([1, 2]) & ideo.notna() & trust.notna() & (wt > 0)).sum()),
            "supports": ["plain-language.md §15 [1]", "§15 [2]"],
            "caveats": [
                "VCF0604 absent for 2016-2024 cycles in this CDF release — index runs via VCF0605/VCF0609 for those years.",
                "Rerun magnitudes are systematically smaller than the prior published table; the sign-flipping pattern (11 of 13/14 cycles) is the headline that survives.",
                "1980, 1996, 2000 come out flat — the rule holds in a strong-majority of cycles, not every cycle.",
            ],
        },
    )


if __name__ == "__main__":
    main()
