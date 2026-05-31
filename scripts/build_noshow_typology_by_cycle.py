"""
build_noshow_typology_by_cycle.py — §14 cross-cycle no-show typology.

For each presidential cycle 1972-2024, classify low-engagement no-shows
(VCF0310==3 AND VCF0702==1) by (grievance × efficacy) cuts and report the
share of each type:
  - alienated:  high grievance + low efficacy
  - complacent: low grievance + high efficacy
  - mixed:      everyone else

Methodology choice (v2): grievance uses TERCILE cuts on the FULL electorate
that cycle; efficacy uses the raw VCF0613 categorical response (1=agree
"people like me have no say" = LOW efficacy; 2=disagree = HIGH efficacy;
3=neither = MID efficacy). This avoids the binary-median-collapse problem
when VCF0613 is heavily skewed in modern cycles.

Tests whether the 2016 finding ("roughly a third alienated, a third
complacent, a third mixed") holds across cycles.

Supports: plain-language.md §14 [1], [2].
"""
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, write_clean


PRES_CYCLES = [1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024]


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    wt = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)

    interest = cdf_num(cdf["VCF0310"])  # 1=very much, 2=somewhat, 3=not much
    turnout = cdf_num(cdf["VCF0702"])   # 1=did not vote, 2=voted
    eff_item = cdf_num(cdf["VCF0613"])  # 1=agree no-say (LOW eff), 2=disagree (HIGH eff), 3=neither

    # Trust composite — same as build_trust_vote_by_cycle.py
    t1 = cdf_num(cdf["VCF0604"])  # do-right: 1=always..5=never (high val = LESS trust)
    t2 = cdf_num(cdf["VCF0605"])  # 1=few big int, 2=benefit all (high = MORE trust)
    t3 = cdf_num(cdf["VCF0609"])  # 1=a lot waste..3=not at all (high = MORE trust)

    def norm(s, lo, hi, reverse=False):
        x = (s - lo) / (hi - lo)
        return (1 - x) if reverse else x

    a = norm(t1, 1, 5, reverse=True)
    b = norm(t2, 1, 2, reverse=False)
    c = norm(t3, 1, 3, reverse=False)
    trust = pd.concat([a, b, c], axis=1).mean(axis=1)
    grievance = 1 - trust   # high grievance = LOW trust

    def wquantile(s, w, q):
        """Weighted quantile."""
        order = s.argsort()
        s_sorted = s.iloc[order].values
        w_sorted = w.iloc[order].values
        cw = np.cumsum(w_sorted)
        tot = cw[-1]
        idx = np.searchsorted(cw, q * tot)
        idx = min(idx, len(s_sorted) - 1)
        return s_sorted[idx]

    rows = []
    for y_ in PRES_CYCLES:
        m_all = (yr == y_) & (wt > 0)
        if m_all.sum() < 200:
            continue

        # Grievance terciles on the FULL electorate that cycle (weighted)
        g_full = grievance[m_all].dropna()
        w_full = wt[m_all].loc[g_full.index]

        if len(g_full) < 100:
            continue

        g_t1 = wquantile(g_full, w_full, 1.0 / 3.0)
        g_t2 = wquantile(g_full, w_full, 2.0 / 3.0)

        # Low-engagement no-shows
        m_noshow = m_all & (interest == 3) & (turnout == 1)
        if m_noshow.sum() < 40:
            continue

        g_ns = grievance[m_noshow]
        e_ns = eff_item[m_noshow]   # raw 1/2/3
        w_ns = wt[m_noshow]

        ok = g_ns.notna() & e_ns.notna()
        g_ns, e_ns, w_ns = g_ns[ok], e_ns[ok], w_ns[ok]
        n_valid = int(ok.sum())
        if n_valid < 30:
            continue

        high_g = g_ns >= g_t2
        low_g = g_ns < g_t1
        # mid_g = ~high_g & ~low_g  (implicit)

        low_e = e_ns == 1   # "agree" no-say
        high_e = e_ns == 2  # "disagree"

        alienated = high_g & low_e
        complacent = low_g & high_e
        mixed = ~(alienated | complacent)

        tot_w = float(w_ns.sum())
        if tot_w == 0:
            continue
        share_a = float(w_ns[alienated].sum() / tot_w * 100)
        share_c = float(w_ns[complacent].sum() / tot_w * 100)
        share_m = float(w_ns[mixed].sum() / tot_w * 100)

        # Diagnostic: composition of full electorate by efficacy item
        full_eff = eff_item[m_all].dropna()
        full_eff_w = wt[m_all].loc[full_eff.index]
        ef_lo = float(full_eff_w[full_eff == 1].sum() / full_eff_w.sum() * 100)
        ef_mid = float(full_eff_w[full_eff == 3].sum() / full_eff_w.sum() * 100)
        ef_hi = float(full_eff_w[full_eff == 2].sum() / full_eff_w.sum() * 100)

        # Diagnostic: composition of low-engagement no-shows by efficacy item
        ef_lo_ns = float(w_ns[e_ns == 1].sum() / tot_w * 100)
        ef_mid_ns = float(w_ns[e_ns == 3].sum() / tot_w * 100)
        ef_hi_ns = float(w_ns[e_ns == 2].sum() / tot_w * 100)

        rows.append({
            "cycle": int(y_),
            "n_noshows_valid": n_valid,
            "share_alienated_pct": round(share_a, 1),
            "share_complacent_pct": round(share_c, 1),
            "share_mixed_pct": round(share_m, 1),
            "noshow_eff_low_pct": round(ef_lo_ns, 1),
            "noshow_eff_mid_pct": round(ef_mid_ns, 1),
            "noshow_eff_high_pct": round(ef_hi_ns, 1),
            "full_eff_low_pct": round(ef_lo, 1),
            "full_eff_mid_pct": round(ef_mid, 1),
            "full_eff_high_pct": round(ef_hi, 1),
        })

    write_clean(
        name="noshow_typology_by_cycle",
        rows=rows,
        manifest={
            "source": "ANES CDF 1948-2024 — data/derived/anes_timeseries_cdf_csv_20260205/.",
            "variables": [
                "VCF0004 (cycle)", "VCF0009z (weight)", "VCF0310 (interest)",
                "VCF0702 (self-report turnout)", "VCF0613 (efficacy: 'people like me have no say')",
                "VCF0604 + VCF0605 + VCF0609 (trust composite)",
            ],
            "filter": "Low-engagement subset (VCF0310==3); no-shows (VCF0702==1) within that subset.",
            "weight": "VCF0009z",
            "method": "Grievance = 1 - trust composite (3-item, rescaled 0-1). TERCILE cuts on grievance "
                      "in the FULL electorate that cycle (weighted). Efficacy uses RAW VCF0613 categories "
                      "(1=agree no-say -> LOW efficacy, 2=disagree -> HIGH efficacy, 3=neither -> MID). "
                      "Alienated = high-G tercile + low-E; complacent = low-G tercile + high-E; mixed = "
                      "everything else.",
            "n": int(sum(r["n_noshows_valid"] for r in rows)),
            "supports": ["plain-language.md §14 [1]", "§14 [2]"],
            "caveats": [
                "VCF0613 is a SINGLE efficacy item — the only one with consistent cross-cycle coverage in "
                "CDF. The 2016 build (turnout_hump.csv) uses a 2-item efficacy composite (V162215 + V162216) "
                "and gives different (richer) classifications. Cross-cycle results here are coarser.",
                "Self-report turnout (VCF0702) over-reports validated turnout by ~25pp; the COMPOSITIONAL "
                "split across types is the reliable signal, absolute turnout levels are inflated.",
                "ANES under-samples the truly disengaged — the alienated tail is likely undercounted.",
                "In some cycles VCF0613 'neither' (3) is genuinely empty; in those cycles the trichotomy "
                "collapses to a dichotomy. This is a coverage limitation of the CDF, not a substantive finding.",
                "The 'mixed' bucket grows when either grievance is in the mid-tercile or efficacy is the "
                "mid value — by construction it includes ~⅓ on grievance alone, so 'mixed' is the baseline "
                "expectation, not an interesting finding.",
            ],
        },
    )


if __name__ == "__main__":
    main()
