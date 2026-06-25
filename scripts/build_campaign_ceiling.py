"""
build_campaign_ceiling.py — §17/C1 "campaign ceiling" nomination bar (~23pp).

Reproduces the "WHO you nominate" bar in fig-17c-campaign-ceiling.js: how much
the candidate's trust position moves general-election vote share, measured as
the Clinton-vote swing across trust terciles, for four "reachable coalition"
definitions. The figure uses the NON-REPUBLICAN coalition (Dem + Dem-leaners +
pure independents), where the swing is ~23pp (90.5% high-trust -> 67.6% low-trust).

This resolves a provenance discrepancy: fig-17c originally claimed "same data as
§16 Figure B," but Figure B is the ANES CDF series, whose trust composite is
DEGENERATE for 2016 (VCF0604 absent -> 2 coarse items -> ~11.3pp artifact). The
single-year ANES 2016 timeseries trust items (V161215/216/217) are far more
discriminating and give the real ~23pp. (The campaign bar ≈0 is Kalla & Broockman
2018, APSR 112(1):148–166 — a literature constant, not computed here.)

Variables (ANES 2016 Time Series):
  V160102 (POST weight); V162034a (pres vote, 1=Clinton); V161158x (7pt PID);
  V161126 (7pt ideology); V161215/V161216/V161217 (3-item trust -> grievance).
Missing codes excluded via clean_var. Terciles taken WITHIN each coalition.
"""
import sys, os
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from _lib import clean_var, load_anes_2016, write_clean


def main():
    df = load_anes_2016()
    w = clean_var(df, "V160102", 0, 1e9).fillna(0).clip(lower=0)

    # ── trust as inverse grievance (same 3 items as build_turnout_hump.py) ──
    t1 = clean_var(df, "V161215", 1, 5)   # 1 always trust .. 5 never
    t2 = clean_var(df, "V161216", 1, 2)   # 1 few big interests, 2 benefit of all
    t3 = clean_var(df, "V161217", 1, 3)   # 1 lot of waste .. 3 not much
    griev = pd.concat([
        (t1 - 1) / 4,    # high grievance at 5
        (2 - t2),        # high grievance at 1
        (3 - t3) / 2,    # high grievance at 1
    ], axis=1).mean(axis=1)
    trust = -griev       # HIGH = more trust

    # ── Clinton vote: V162034a, 1 = Clinton ──
    vote = clean_var(df, "V162034a", 1, 7)
    clinton = (vote == 1).astype(float)
    clinton[vote.isna()] = np.nan

    pid = clean_var(df, "V161158x", 1, 7)     # 1-3 Dem/lean, 4 pure ind, 5-7 Rep
    ideo = clean_var(df, "V161126", 1, 7)     # 1-3 lib, 4 mod, 5-7 con

    coalitions = {
        "full_electorate":        w > 0,
        "dems_and_leaners":       pid.between(1, 3),
        "non_republicans":        pid.between(1, 4),
        "liberals_and_moderates": ideo.between(1, 4),
    }

    def wmean(mask):
        m = mask & clinton.notna() & (w > 0)
        return (float(np.average(clinton[m], weights=w[m])) * 100, int(m.sum())) if m.any() else (float("nan"), 0)

    rows = []
    for name, cmask in coalitions.items():
        base = cmask & trust.notna() & (w > 0)
        # Equal-thirds terciles by RANK (method='first' breaks the coarse
        # composite's ties so the three bands are equal-sized — the standard
        # tercile, matching build_vote_share_by_trust_band.py). A plain
        # `trust < quantile` split would make wildly unequal bins on this
        # tie-heavy composite and inflate the swing (see NOTE in caveats).
        r = trust[base].rank(method="first")
        band = pd.qcut(r, 3, labels=["low", "mid", "high"])
        lo = pd.Series(False, index=trust.index)
        hi = pd.Series(False, index=trust.index)
        lo.loc[band[band == "low"].index] = True    # low trust
        hi.loc[band[band == "high"].index] = True   # high trust
        lo_pct, lo_n = wmean(lo)
        hi_pct, hi_n = wmean(hi)
        rows.append({
            "coalition": name,
            "hi_trust_clinton_pct": round(hi_pct, 1),
            "lo_trust_clinton_pct": round(lo_pct, 1),
            "swing_pp": round(hi_pct - lo_pct, 1),
            "n_lo": lo_n, "n_hi": hi_n,
        })

    print("\nCLINTON VOTE SHARE BY TRUST TERCILE (ANES 2016, POST weight)")
    print("=" * 64)
    print(f"{'coalition':<24}{'hi-trust':>9}{'lo-trust':>9}{'swing':>8}{'n lo/hi':>12}")
    for r in rows:
        nstr = f"{r['n_lo']}/{r['n_hi']}"
        print(f"{r['coalition']:<24}{r['hi_trust_clinton_pct']:>8.1f}%{r['lo_trust_clinton_pct']:>8.1f}%"
              f"{r['swing_pp']:>7.1f}{nstr:>12}")
    ceiling = next(r for r in rows if r["coalition"] == "non_republicans")
    print(f"\nfig-17c nomination bar = non_republicans swing = {ceiling['swing_pp']}pp "
          f"({ceiling['hi_trust_clinton_pct']}% -> {ceiling['lo_trust_clinton_pct']}%)")

    write_clean(
        name="campaign_ceiling",
        rows=rows,
        manifest={
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
            "variables": [
                "V160102 (POST weight)", "V162034a (pres vote; 1=Clinton)",
                "V161158x (7pt party ID)", "V161126 (7pt ideology)",
                "V161215/V161216/V161217 (3-item trust composite -> grievance, inverted)",
            ],
            "filter": "Trust terciles taken WITHIN each coalition. ANES missing codes excluded via clean_var.",
            "weight": "V160102 (POST) — post-election vote choice analysis.",
            "method": (
                "Per coalition, tercile-split the inverse-grievance trust composite; "
                "compute weighted % voting Clinton in the low-trust vs high-trust tercile; "
                "swing = high-trust% minus low-trust%. The figure uses the non-Republican coalition."
            ),
            "n": int((w > 0).sum()),
            "supports": ["fig-17c-campaign-ceiling.js (nomination bar ~23pp)"],
            "caveats": [
                "Vote is self-report (V162034a), not validated; pattern is the signal.",
                "Campaign bar (≈0) is NOT computed here — it is Kalla & Broockman 2018 (APSR 112:148–166).",
                "The §16 Figure B CDF series gives only ~11.3pp for 2016 because VCF0604 is absent "
                "from the CDF post-2012, degrading that composite to 2 coarse items. The timeseries "
                "items used here are more discriminating; the ~23pp is the better-grounded figure.",
            ],
        },
    )
    print("Done.")


if __name__ == "__main__":
    main()
