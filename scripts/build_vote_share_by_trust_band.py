"""
build_vote_share_by_trust_band.py — §16 trust-band vote share by cycle.

For each presidential cycle 1972-2024, partition voters into trust terciles
(low = System Critics, high = System Believers) on that cycle's full
electorate, then compute the weighted % of each tercile that voted for the
IN-POWER party's candidate. The headline pattern: System Critics
consistently vote against the in-power party. The exceptions (Bush 2004,
Obama 2012) are cycles where the in-power party's candidate held the
change lane.
"""
import json
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, DATA_CLEAN


# Party going into the cycle (held the White House for previous term).
# 1972: Nixon R holding, 1976: Ford R holding (post-Nixon), etc.
INCUMBENT = {
    1972: "R", 1976: "R", 1980: "D", 1984: "R", 1988: "R", 1992: "R",
    1996: "D", 2000: "D", 2004: "R", 2008: "R", 2012: "D", 2016: "D",
    2020: "R", 2024: "D",
}

# Cycles where the in-power party's candidate kept the change lane,
# from §16's scoreboard. Used to label exception cycles in the output.
KEPT_CHANGE_LANE = {2004, 2012}


def norm(s, lo, hi, reverse=False):
    x = (s - lo) / (hi - lo)
    return (1 - x) if reverse else x


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    wt = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)
    vote = cdf_num(cdf["VCF0704"])   # 1=Dem, 2=Rep

    t1 = cdf_num(cdf["VCF0604"])
    t2 = cdf_num(cdf["VCF0605"])
    t3 = cdf_num(cdf["VCF0609"])

    a = norm(t1, 1, 5, reverse=True)
    b = norm(t2, 1, 2, reverse=False)
    c = norm(t3, 1, 3, reverse=False)
    trust = pd.concat([a, b, c], axis=1).mean(axis=1)

    rows = []
    for y_ in sorted(INCUMBENT):
        wh = INCUMBENT[y_]
        # In-power party's candidate vote code (1=Dem, 2=Rep)
        in_power_code = 1 if wh == "D" else 2

        m = (yr == y_) & vote.isin([1, 2]) & trust.notna() & (wt > 0)
        if m.sum() < 100:
            continue

        cycle_trust = trust[m]
        cycle_vote  = vote[m]
        cycle_wt    = wt[m]

        # Tercile cuts on this cycle's full electorate (so cohort
        # definitions are cycle-specific).
        try:
            quintile = pd.qcut(cycle_trust, 3, labels=["low", "mid", "high"], duplicates='drop')
        except ValueError:
            quintile = pd.qcut(cycle_trust.rank(method='first'), 3, labels=["low", "mid", "high"])

        cycle_record = {
            "cycle": int(y_),
            "wh_incumbent": wh,
            "n_unweighted": int(m.sum()),
            "kept_change_lane": (y_ in KEPT_CHANGE_LANE),
        }
        for band in ["low", "mid", "high"]:
            sel = (quintile == band)
            if sel.sum() == 0:
                cycle_record[f"{band}_inpower_share"] = None
                cycle_record[f"{band}_n"] = 0
                continue
            yes = (cycle_vote[sel] == in_power_code).astype(float)
            share = float(np.average(yes, weights=cycle_wt[sel])) * 100
            cycle_record[f"{band}_inpower_share"] = round(share, 1)
            cycle_record[f"{band}_n"] = int(sel.sum())

        rows.append(cycle_record)

    out = {
        "source": "ANES Cumulative Data File 1948-2024; presidential cycles 1972-2024.",
        "variables": [
            "VCF0004 (year)",
            "VCF0009z (weight)",
            "VCF0704 (presidential vote; 1=Dem, 2=Rep)",
            "VCF0604, VCF0605, VCF0609 (3-item trust composite, HIGH=MORE trust)",
        ],
        "method": (
            "Per cycle, normalize 3-item trust composite to [0,1] HIGH=MORE trust. "
            "Tercile-split on that cycle's full electorate. "
            "For each tercile compute weighted % who voted for the in-power party's "
            "candidate. Tagged kept_change_lane=true for 2004 (Bush, wartime leadership "
            "lane) and 2012 (Obama, residual hope/change)."
        ),
        "cycles": rows,
    }

    out_path = DATA_CLEAN / "vote_share_by_trust_band.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {out_path}")
    print()
    print(f"{'Cycle':>6} {'WH':>3} {'Low(SC)':>8} {'Mid':>6} {'High(SB)':>9} {'Gap(L-H)':>10} {'Change':>8}")
    for r in rows:
        l = r['low_inpower_share']
        h = r['high_inpower_share']
        gap = (l - h) if (l is not None and h is not None) else None
        print(f"{r['cycle']:>6} {r['wh_incumbent']:>3} {l:>7.1f}% {r['mid_inpower_share']:>5.1f}% {h:>8.1f}% {gap:>9.1f} {'✓' if r['kept_change_lane'] else ''}")


if __name__ == "__main__":
    main()
