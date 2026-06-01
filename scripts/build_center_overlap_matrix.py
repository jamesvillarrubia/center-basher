"""
build_center_overlap_matrix.py — §1 three-group overlap matrix.

The three groups everyone calls "the middle":
- M (Moderate): self-place 7-pt lib-con (V161126) in {3,4,5}
- C (Centrist): policy issue-mean within ±0.5 of center (4) on 10-item composite
- S (Swing): party-line crosser within 2016 — partisan (incl. leaners) who
  voted for the other party's nominee. From V161158x (PID) × V162034a (vote).

For each (row, col) cell: "% of row-group who are also col-group."
Diagonal = 100. Off-diagonal = the small numbers that prove the three
groups aren't the same people.

Weighted with V160101 (post-election weight).
"""
import json
import numpy as np
import pandas as pd

from _lib import load_anes_2016, DATA_CLEAN


ISSUE_VARS = [
    "V161178", "V161181", "V161184", "V161189", "V161193",
    "V161196", "V161198", "V161204", "V161208", "V161213",
]


def main():
    d = load_anes_2016()

    # Weight (post-election)
    w = pd.to_numeric(d["V160101"], errors="coerce").fillna(0).clip(lower=0)

    # M: self-ID moderate — STRICT (lib-con = 4, the dead center).
    # The broader 3-5 band sweeps in ~55% of the electorate, making the
    # "swings are 81% moderate" finding misleading: it's mostly the band
    # being wide. Strict definition is what consultants mean when they
    # say "the median voter."
    selfplace = pd.to_numeric(d["V161126"], errors="coerce")
    selfplace = selfplace.where((selfplace >= 1) & (selfplace <= 7))
    is_moderate = (selfplace == 4)

    # C: policy-centrist (issue-mean within ±0.5 of 4)
    issues = d[ISSUE_VARS].apply(pd.to_numeric, errors="coerce")
    issues = issues.where((issues >= 1) & (issues <= 7))
    policy_mean = issues.mean(axis=1)
    is_centrist = (policy_mean - 4).abs() <= 0.5

    # S: swing voter (PID-line crosser within 2016)
    pid = pd.to_numeric(d["V161158x"], errors="coerce")  # 1=SD .. 7=SR
    vote = pd.to_numeric(d["V162034a"], errors="coerce")  # 1=Clinton, 2=Trump
    dem_for_trump = pid.isin([1, 2, 3]) & (vote == 2)
    rep_for_clinton = pid.isin([5, 6, 7]) & (vote == 1)
    is_swing = dem_for_trump | rep_for_clinton

    # Base mask: respondents with non-null data on at least the dimensions
    # required to be classified into each group (we'll handle per-cell).
    groups = {"M": is_moderate, "C": is_centrist, "S": is_swing}
    base = {
        "M": selfplace.notna() & (w > 0),
        "C": policy_mean.notna() & (w > 0),
        "S": pid.notna() & vote.notna() & (w > 0),
    }

    # Cell (row, col) = weighted % of row's base who are *also* in col.
    # For diagonal we report group share of electorate (for the bar context).
    rows = []
    pop_shares = {}
    for k in ["M", "C", "S"]:
        m = base[k] & groups[k]
        share = float(np.average(groups[k][base[k]], weights=w[base[k]])) * 100
        pop_shares[k] = round(share, 1)

    matrix = {}
    n_cells = {}
    for r in ["M", "C", "S"]:
        matrix[r] = {}
        n_cells[r] = {}
        # Row base: respondents who are in group r AND have data for the col dimension
        for c in ["M", "C", "S"]:
            both_base = base[r] & base[c]
            row_pop = both_base & groups[r]
            n = int(row_pop.sum())
            if n == 0:
                matrix[r][c] = None
                n_cells[r][c] = 0
                continue
            pct = float(np.average(groups[c][row_pop], weights=w[row_pop])) * 100
            matrix[r][c] = round(pct, 1)
            n_cells[r][c] = n

    out = {
        "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
        "variables": [
            "V160101 (weight)",
            "V161126 (self-place lib-con)",
            "V161158x (PID, 7-pt, leaners)",
            "V162034a (presidential vote)",
        ] + [f"{v} (7-pt issue)" for v in ISSUE_VARS],
        "definitions": {
            "M (Moderate)": "self-place 7-pt lib-con = 4 (strict pure moderate)",
            "C (Centrist)": "10-item policy mean within ±0.5 of 4 (center)",
            "S (Swing)": "PID-line crosser: Dem-leaner→Trump or Rep-leaner→Clinton",
        },
        "method": "Weighted shares; cell (row, col) = % of row-group who are also col-group.",
        "pop_share_pct": pop_shares,
        "matrix_pct": matrix,
        "n_cells": n_cells,
        "supports": ["plain-language.md §1 [2]"],
    }

    out_path = DATA_CLEAN / "center_overlap_matrix.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote {out_path}")
    print()
    print("Population shares (% of electorate in each group):")
    for k, v in pop_shares.items(): print(f"  {k}: {v}%")
    print()
    print("Overlap matrix — % of ROW that are also COL:")
    print(f"{'':>4} {'M':>8} {'C':>8} {'S':>8}")
    for r in ["M", "C", "S"]:
        cells = "  ".join(f"{matrix[r][c]:>6.1f}%" for c in ["M", "C", "S"])
        print(f"{r:>4} {cells}")
    print()
    print("Cell n (unweighted):")
    for r in ["M", "C", "S"]:
        print(f"  {r}: ", {c: n_cells[r][c] for c in ['M','C','S']})


if __name__ == "__main__":
    main()
