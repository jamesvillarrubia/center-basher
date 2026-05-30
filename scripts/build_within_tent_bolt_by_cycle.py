"""
build_within_tent_bolt_by_cycle.py — §7 cross-cycle confirmation.

For each presidential election in the CDF (1972-2024), inside each "tent"
(Dem-leaners+indeps vs Rep-leaners+strong), compute the % voting the OTHER
party's nominee by within-tent trust tercile.

Hypothesis (from §15 / §16): the within-tent bolt fires more strongly when
YOUR candidate is cast as the establishment — i.e., when your party holds the
White House and your candidate is the in-party heir. Under Dem WH, Dem-tent
low-trust voters should defect more; under Rep WH, Rep-tent low-trust voters
should defect more.

Supports: plain-language.md §7 (cross-cycle confirmation).
"""
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, write_clean

# White-House incumbent party at election time (the party defending the office)
INCUMBENT = {
    1972: "R", 1976: "R", 1980: "D", 1984: "R", 1988: "R", 1992: "R",
    1996: "D", 2000: "D", 2004: "R", 2008: "R", 2012: "D", 2016: "D",
    2020: "R", 2024: "D",
}


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    wt = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)
    pid = cdf_num(cdf["VCF0301"])
    vote = cdf_num(cdf["VCF0704"])    # 1 Dem, 2 Rep

    # Build trust index per row using whichever items are present.
    # Direction: HIGH = MORE trust.
    t1 = cdf_num(cdf["VCF0604"])      # do-right: 1 always..5 never (reverse)
    t2 = cdf_num(cdf["VCF0605"])      # run for all=2 vs few=1
    t3 = cdf_num(cdf["VCF0609"])      # waste: 1 a lot..3 not at all
    def norm(s, lo, hi, reverse=False):
        x = (s - lo) / (hi - lo)
        return (1 - x) if reverse else x
    trust = pd.concat([
        norm(t1, 1, 5, reverse=True),
        norm(t2, 1, 2),
        norm(t3, 1, 3),
    ], axis=1).mean(axis=1)

    rows = []
    summary = {"D-tent_holds": 0, "D-tent_tested": 0, "R-tent_holds": 0, "R-tent_tested": 0}
    for y_, wh in sorted(INCUMBENT.items()):
        for tent_label, tent_mask, own_code, other_code in [
            ("Dems+indeps (VCF0301 1-4)", pid.between(1, 4), 1, 2),
            ("Reps (VCF0301 5-7)",        pid.between(5, 7), 2, 1),
        ]:
            base = (yr == y_) & tent_mask & vote.isin([1, 2]) & trust.notna() & (wt > 0)
            if base.sum() < 60:    # need enough cells for terciles
                continue
            # within-tent within-cycle terciles
            t_in = trust[base]
            try:
                cuts = t_in.quantile([1/3, 2/3]).values
            except Exception:
                continue
            band_lookup = []
            for label, m in [
                ("low-trust",  base & (trust <  cuts[0])),
                ("mid-trust",  base & (trust >= cuts[0]) & (trust < cuts[1])),
                ("high-trust", base & (trust >= cuts[1])),
            ]:
                n = int(m.sum())
                if n < 15:
                    band_lookup.append(None)
                    continue
                voted_other = float(np.average((vote[m] == other_code).astype(float), weights=wt[m]) * 100)
                voted_own = float(np.average((vote[m] == own_code).astype(float), weights=wt[m]) * 100)
                rows.append({
                    "cycle": int(y_),
                    "wh_incumbent": wh,
                    "tent": tent_label,
                    "tent_short": "D" if "Dems" in tent_label else "R",
                    "trust_band": label,
                    "vote_own_pct": round(voted_own, 1),
                    "vote_other_pct": round(voted_other, 1),
                    "narrow_swing_pct": round(voted_other, 1),
                    "broad_swing_pct": round(100 - voted_own, 1),
                    "n_unweighted": n,
                })
                band_lookup.append(voted_other)
            # Rule-holds test: low-trust narrow-swing > high-trust narrow-swing,
            # AND your tent is the establishment one (own party holds WH).
            if all(v is not None for v in band_lookup):
                lo_v, _, hi_v = band_lookup
                tent_short = "D" if "Dems" in tent_label else "R"
                is_establishment_tent = (tent_short == wh)
                if is_establishment_tent:
                    summary[f"{tent_short}-tent_tested"] += 1
                    if lo_v > hi_v + 2:  # +2pp tolerance
                        summary[f"{tent_short}-tent_holds"] += 1

    # summary row
    rows.append({
        "cycle": 0, "wh_incumbent": "—",
        "tent": "[summary] est-tent low>high cycles",
        "tent_short": "—",
        "trust_band": "—",
        "vote_own_pct": np.nan, "vote_other_pct": np.nan,
        "narrow_swing_pct": float(summary["D-tent_holds"] + summary["R-tent_holds"]),
        "broad_swing_pct": float(summary["D-tent_tested"] + summary["R-tent_tested"]),
        "n_unweighted": 0,
    })

    write_clean(
        name="within_tent_bolt_by_cycle",
        rows=rows,
        manifest={
            "source": "ANES Time Series Cumulative File (1948-2024) — data/derived/anes_timeseries_cdf_csv_20260205/.../csv.",
            "variables": [
                "VCF0004 (year)", "VCF0009z (weight)", "VCF0301 (7-pt PID)",
                "VCF0704 (pres vote: 1 Dem, 2 Rep)",
                "VCF0604 (reversed) / VCF0605 / VCF0609 (3-item trust index, HIGH=MORE trust)",
            ],
            "filter": (
                "Two-party voters within each tent (Dem leaners+indeps vs Rep leaners+strong), "
                "with valid trust + weight; trust terciles taken WITHIN each tent within each cycle. "
                "Bands with n<15 dropped. Cycles where tent has total n<60 dropped."
            ),
            "weight": "VCF0009z",
            "method": (
                "Within each (cycle, tent) cell, % voting the OTHER nominee by within-tent trust tercile. "
                "Narrow swing = voted other-party nominee. Broad swing = 100 - voted own. "
                "Rule-holds count: in cycles where YOUR tent's party holds the White House (i.e., your candidate "
                "is the establishment continuity figure), low-trust narrow-swing should exceed high-trust by >2pp. "
                "Summary row sums D-tent and R-tent establishment-cycles counted."
            ),
            "n": int((trust.notna() & vote.isin([1, 2]) & (wt > 0) & yr.isin(list(INCUMBENT))).sum()),
            "supports": ["plain-language.md §7 (cross-cycle confirmation)"],
            "caveats": [
                "VCF0604 absent in 2016-2024 — trust index runs on VCF0605/VCF0609 only for those cycles.",
                "Tercile cuts taken WITHIN each (cycle, tent) so 'low-trust' is relative to that subgroup, "
                "not the full electorate. This is the only defensible cross-cycle comparison given the "
                "compressed-variance trust collapse documented in §11 [3].",
                "VCF0301 leaner-vs-pure-indep coding is consistent across the CDF; CES validation in 2016 within ±1pp.",
            ],
        },
    )


if __name__ == "__main__":
    main()
