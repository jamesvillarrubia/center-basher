"""
build_turnout_hump.py — §14 (stakes × efficacy → the turnout hump).

Produces, for low-engagement voters (the gettable), per grievance-tercile:
  - stakes pct (V161005 "care a good deal")
  - efficacy /5 (mean of V162215, V162216)
  - turnout pct (V162031x self-report, since vote-validated cells get tiny)
  - n

Also computes the alienated/complacent/mixed composition of low-engagement
non-voters.

Supports: plain-language.md §14 [1], [2]. Replaces the inline JSON used by
web/js/chartTurnoutHump.js (the chart should pull from data/clean/turnout_hump.csv).
"""
import numpy as np
import pandas as pd

from _lib import clean_var, load_anes_2016, weighted_share, write_clean


def main():
    df = load_anes_2016()
    w = clean_var(df, "V160101", 0, 1e9).fillna(0).clip(lower=0)

    interest = clean_var(df, "V161004", 1, 3)
    lo_eng = (interest == 3)

    t1 = clean_var(df, "V161215", 1, 5)
    t2 = clean_var(df, "V161216", 1, 2)
    t3 = clean_var(df, "V161217", 1, 3)
    # grievance index (high = MORE grievance = LESS trust)
    griev = pd.concat([
        (t1 - 1) / 4,         # V161215: 1 always..5 never → grievance high at 5
        (2 - t2),             # V161216: 1 few big int (high griev), 2 benefit all
        (3 - t3) / 2,         # V161217: 1 lot waste (high griev)..3 not much (codebook 1-3 item)
    ], axis=1).mean(axis=1)

    e1 = clean_var(df, "V162215", 1, 5)
    e2 = clean_var(df, "V162216", 1, 5)
    # efficacy = mean of two items; 1-5 scale; high = MORE efficacy (more likely DISAGREE "officials don't care")
    efficacy = pd.concat([e1, e2], axis=1).mean(axis=1)

    care = clean_var(df, "V161005", 1, 2)
    stakes = (care == 1).astype(float)
    stakes[care.isna()] = np.nan

    # turnout V162031x: 0 no / 1 yes
    turn = clean_var(df, "V162031x", 0, 1)

    def wm(mask, s):
        m = mask & s.notna() & (w > 0)
        return float(np.average(s[m], weights=w[m])) if m.any() else float("nan")

    # tercile cuts on grievance WITHIN low-engagement subset (so cells are
    # comparable, not driven by the whole electorate's distribution)
    base = lo_eng & griev.notna()
    cuts = griev[base].quantile([1/3, 2/3]).values

    bands = [
        ("low",  base & (griev <  cuts[0])),
        ("mid",  base & (griev >= cuts[0]) & (griev < cuts[1])),
        ("high", base & (griev >= cuts[1])),
    ]
    rows = []
    for band_label, band_mask in bands:
        rows.append({
            "subset": "gettable (low-engagement)",
            "grievance_band": band_label,
            "stakes_pct": round(wm(band_mask, stakes) * 100, 1) if not np.isnan(wm(band_mask, stakes)) else None,
            "efficacy_5pt": round(wm(band_mask, efficacy), 2) if not np.isnan(wm(band_mask, efficacy)) else None,
            "turnout_pct_selfrep": round(wm(band_mask, turn) * 100, 1) if not np.isnan(wm(band_mask, turn)) else None,
            "n_unweighted": int(band_mask.sum()),
        })

    # composition of low-engagement non-voters
    noshow = lo_eng & (turn == 0)
    g_med, e_med = float(np.nanmedian(griev)), float(np.nanmedian(efficacy))
    high_g, low_g = (griev >= g_med), (griev < g_med)
    high_e, low_e = (efficacy >= e_med), (efficacy < e_med)
    alienated = noshow & high_g & low_e
    complacent = noshow & low_g & high_e
    mixed = noshow & ~((high_g & low_e) | (low_g & high_e))
    total_noshow = weighted_share(noshow, w)

    for label, mask in [
        ("alienated (high grievance + low efficacy)", alienated),
        ("complacent (low grievance + high efficacy)", complacent),
        ("mixed", mixed),
    ]:
        share = float(w[mask].sum() / w[noshow].sum()) if w[noshow].sum() > 0 else float("nan")
        rows.append({
            "subset": "low-engagement no-shows",
            "grievance_band": label,
            "stakes_pct": None,
            "efficacy_5pt": None,
            "turnout_pct_selfrep": None,
            "n_unweighted": int(mask.sum()),
            # extra column packed into stakes_pct as the composition fraction would
            # break schema. Use a separate "share" column.
        })
        rows[-1]["share_of_noshows_pct"] = round(share * 100, 1)

    # share of electorate that's low-engagement no-shows
    rows.append({
        "subset": "low-engagement no-shows TOTAL",
        "grievance_band": "—",
        "stakes_pct": None,
        "efficacy_5pt": None,
        "turnout_pct_selfrep": None,
        "n_unweighted": int(noshow.sum()),
        "share_of_noshows_pct": round(total_noshow * 100, 1),
    })

    # how many no-shows say they "don't care a good deal who wins"
    dontcare = noshow & (care == 2)
    if w[noshow].sum() > 0:
        rows.append({
            "subset": "low-engagement no-shows: 'don't care a good deal'",
            "grievance_band": "—",
            "stakes_pct": None,
            "efficacy_5pt": None,
            "turnout_pct_selfrep": None,
            "n_unweighted": int(dontcare.sum()),
            "share_of_noshows_pct": round(float(w[dontcare].sum() / w[noshow].sum()) * 100, 1),
        })

    write_clean(
        name="turnout_hump",
        rows=rows,
        manifest={
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
            "variables": [
                "V160101 (weight)", "V161004 (interest)", "V161005 (care who wins)",
                "V161215/216/217 (3-item trust → grievance index)",
                "V162215 / V162216 (efficacy items)", "V162031x (self-report turnout)",
            ],
            "filter": "Low-engagement subset = V161004 == 3 ('not too / not at all interested').",
            "weight": "V160101 (post-election)",
            "method": (
                "Grievance tercile cuts taken WITHIN the low-engagement subset. "
                "Composition counts use median splits on the FULL electorate's grievance and efficacy."
            ),
            "n": int((lo_eng & (w > 0)).sum()),
            "supports": ["plain-language.md §14 [1]", "§14 [2]"],
            "caveats": [
                "Turnout figures are SELF-REPORT (V162031x); over-report ~25pp vs validated. The gradient pattern is the reliable signal; absolute levels are inflated.",
                "Per-cell n ranges ~100–200 for tercile rows; hump shape is suggestive, gradients reliable.",
                "ANES under-samples the truly disengaged → alienated tail likely undercounted; CES vote-validated or Catalist L2-matched files would tighten.",
            ],
        },
    )


if __name__ == "__main__":
    main()
