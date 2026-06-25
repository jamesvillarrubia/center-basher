"""
build_care_gap.py — §13 care-gap: turnout by "care a good deal who wins".

Computes, for ALL voters and the LOW-ENGAGEMENT subset (V161004==3):
  - Weighted validated turnout% for care=good (V161005==1) vs care=not (V161005==2)
  - The care-turnout gap in pp
  - Unweighted n for each cell

Supports: plain-language.md §13.

Key finding: The hardcoded numbers in fig-13a-care-gap.js (70.5/35.9 for ALL,
52.2/25.6 for LOW-ENG) do NOT reproduce from ANES 2016 with any combination of
standard weight/turnout variables. The gradient direction and approximate gap
magnitude are confirmed, but the absolute turnout rates are materially different.
See caveats for detail.
"""
import sys
import numpy as np
import pandas as pd

# Allow running from repo root or from scripts/
if __name__ == "__main__":
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from _lib import (
    clean_var,
    load_anes_2016,
    load_anes_2016_voteval,
    write_clean,
)


def main():
    df = load_anes_2016()

    # ── merge validated vote from voteval file ──────────────────────────────
    # _lib docstring: "dta V160001_orig ↔ csv V160001"
    vv = load_anes_2016_voteval()
    df["_key"] = pd.to_numeric(df["V160001_orig"], errors="coerce")
    vv["_key"] = pd.to_numeric(vv["V160001"], errors="coerce")
    df = df.merge(vv[["_key", "vote2016"]], on="_key", how="left")

    # POST weight: this is a post-election analysis (validated turnout is
    # determined after the election); use POST weight V160102.
    # POST weight is 0 for those who did not complete the post-wave interview;
    # those drop out naturally via the (w > 0) masks below.
    w = clean_var(df, "V160102", 0, 1e9).fillna(0).clip(lower=0)

    # ── validated turnout ───────────────────────────────────────────────────
    # vote2016 from the ANES 2016 voteval merge file: 1=voted, 0=did not vote.
    # This is a record-check match against state voter files; covers all 4,270
    # respondents (merge_type=1 for 4,220 of them; 51 are type-2 secondary
    # matches). Preferred over self-report (V162031x), which over-reports ~25pp.
    turn_val = pd.to_numeric(df["vote2016"], errors="coerce")

    # ── care variable: V161005 ──────────────────────────────────────────────
    # 1 = "care a good deal who wins", 2 = "don't care much".
    # Exclude -8 (refused) and -9 (don't know) via clean_var.
    care = clean_var(df, "V161005", 1, 2)
    care_good = care == 1
    care_not = care == 2

    # ── low-engagement subset ───────────────────────────────────────────────
    # V161004: 1=very interested, 2=somewhat, 3=not much interested.
    # "Gettable" = 3 (not much interested), matching build_turnout_hump.py.
    interest = clean_var(df, "V161004", 1, 3)
    lo_eng = interest == 3

    def cell(coalition_mask, care_mask):
        """Weighted validated turnout% and unweighted n within intersection."""
        m = coalition_mask & care_mask & turn_val.notna() & (w > 0)
        if not m.any():
            return float("nan"), 0
        pct = float(np.average(turn_val[m], weights=w[m])) * 100
        n = int(m.sum())
        return pct, n

    rows = []

    # ALL voters (w > 0)
    all_mask = w > 0
    g_all, g_n_all = cell(all_mask, care_good)
    d_all, d_n_all = cell(all_mask, care_not)
    rows.append({
        "subset": "all",
        "label": "All voters",
        "care_pct": round(g_all, 1),
        "dontcare_pct": round(d_all, 1),
        "gap_pp": round(g_all - d_all, 1),
        "n_care": g_n_all,
        "n_dontcare": d_n_all,
        "target_care": 70.5,
        "target_dontcare": 35.9,
        "target_gap": 34.6,
        "turnout_variable": "vote2016 (validated, voteval merge)",
        "weight": "V160102 (POST)",
    })

    # LOW-ENGAGEMENT subset (V161004 == 3)
    g_le, g_n_le = cell(lo_eng, care_good)
    d_le, d_n_le = cell(lo_eng, care_not)
    rows.append({
        "subset": "low_engagement",
        "label": "Low-engagement voters (V161004==3)",
        "care_pct": round(g_le, 1),
        "dontcare_pct": round(d_le, 1),
        "gap_pp": round(g_le - d_le, 1),
        "n_care": g_n_le,
        "n_dontcare": d_n_le,
        "target_care": 52.2,
        "target_dontcare": 25.6,
        "target_gap": 26.6,
        "turnout_variable": "vote2016 (validated, voteval merge)",
        "weight": "V160102 (POST)",
    })

    # ── print summary ───────────────────────────────────────────────────────
    print()
    print("CARE-GAP REPRODUCTION RESULTS vs fig-13a-care-gap.js TARGETS")
    print("=" * 70)
    hdr = f"{'Subset':<22} {'Computed':<12} {'Target':<10} {'Delta':>6}"
    print(f"\n{'Metric':<22} {hdr}")
    print("-" * 72)

    for r in rows:
        lbl = r["subset"].upper()
        for metric, computed, target in [
            ("care%",     r["care_pct"],     r["target_care"]),
            ("dontcare%", r["dontcare_pct"], r["target_dontcare"]),
            ("gap pp",    r["gap_pp"],       r["target_gap"]),
        ]:
            delta = computed - target
            ok = "OK" if abs(delta) <= 1.5 else "MISMATCH"
            print(
                f"  {lbl:<10} {metric:<10} "
                f"computed={computed:.1f}  target={target:.1f}  "
                f"Δ={delta:+.1f}pp  [{ok}]"
            )
        print(
            f"  {lbl:<10} {'n care/dc':<10} "
            f"computed={r['n_care']}/{r['n_dontcare']}  "
            f"target=?/{('214/301' if r['subset']=='low_engagement' else '~?')}"
        )
        print()

    write_clean(
        name="care_gap",
        rows=rows,
        manifest={
            "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta; "
                      "validated vote from data/derived/anes_timeseries_2016_voteval_csv/",
            "variables": [
                "V160102 (POST weight)",
                "V161005 (care a good deal who wins; 1=yes, 2=no)",
                "V161004 (political interest; 3=not much → low-engagement subset)",
                "vote2016 (validated turnout from voteval merge; 0/1)",
            ],
            "filter": (
                "Low-engagement subset = V161004 == 3 ('not much interested'), "
                "matching build_turnout_hump.py convention. "
                "All analysis excludes ANES standard missing codes "
                "(-9,-8,-7,-6,-5,-4,-3,-2,-1) via clean_var."
            ),
            "weight": "V160102 (POST weight). POST used because validated vote is "
                      "a post-election measure. Respondents without post-wave "
                      "interview (POST weight = 0) are excluded.",
            "method": (
                "Validated turnout (vote2016, record-check match) for each care "
                "category. Weighted mean within coalition. Gap = care% minus "
                "dontcare%."
            ),
            "n": int((w > 0).sum()),
            "supports": ["plain-language.md §13"],
            "caveats": [
                "NON-REPRODUCTION FINDING: The hardcoded targets in "
                "fig-13a-care-gap.js (ALL: 70.5/35.9, LOW-ENG: 52.2/25.6) "
                "DO NOT match ANES 2016 validated turnout under any combination "
                "of standard weights/filters tried. Our computed values are "
                "systematically 10-19pp HIGHER (ALL care: 80.8 vs 70.5; "
                "ALL dontcare: 50.2 vs 35.9; LOW-ENG care: 68.2 vs 52.2; "
                "LOW-ENG dontcare: 44.3 vs 25.6). The targets may derive from "
                "CCES/CES, a different year, or a now-lost calculation.",
                "GRADIENT CONFIRMED: direction (care >> dontcare) and the "
                "qualitative pattern (low-eng gap ≈ ALL gap × 0.8) are "
                "consistent across all weight/turnout combinations tried.",
                "The low-engagement footnote n targets (214 care, 301 dontcare) "
                "match exactly: these are raw unweighted counts of (V161004==3 & "
                "V161005==1/2), confirming the ANES 2016 file and low-eng "
                "filter definition are correct.",
                "Validated turnout overall: 3,077 of 4,270 respondents (72%). "
                "The ANES validated match rate is high vs national VEP turnout "
                "(60%); ANES over-samples voters.",
                "Self-report turnout (V162031x) is even more inflated: 91%/68% "
                "for care/dontcare (ALL), 79%/61% (LOW-ENG); validated is "
                "preferred but still shows ANES selection bias.",
            ],
        },
    )
    print("Done.")


if __name__ == "__main__":
    main()
