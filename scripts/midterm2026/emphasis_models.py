"""Frozen predictions P1 to P4 for ad emphasis (spec sections 5 and 6), on model codes (section 11).

Sample: D-vs-R House races (house_drivers.frame). Shares are general-election-window spend on
issue ads (candidate_shares.csv). Per section 5, races where either candidate spent under
$10,000 on Meta in the window are dropped; candidates whose ad files are incomplete (truncated
or awaiting a page-ID re-fetch) are dropped and counted. Sensitivity: Democrat-only threshold.

  P1  over_vs_harris ~ dem price_share (per +10 share points) + C(state) + C(seat) + harris_margin
      (then + log_money_ratio); all races and >= 90% counted
  P2  dem price_share ~ moderate vs progressive backing, same controls
  P3  over_vs_harris ~ Republican spend on socialism-coded ads per vote cast
  P4  median price_gap (Democrat price_share minus Republican's) > 0
Output: data/derived/midterm2026/emphasis/emphasis_models.csv
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from house_drivers import frame  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
E = D / "emphasis"
FLOOR = 10_000.0
CTRL = "C(state) + C(seat) + harris_margin"


def fit(f: str, d: pd.DataFrame):
    mod = smf.ols(f, d)  # drops rows with a missing variable; clusters follow the rows kept
    return mod.fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(d.loc[mod.data.row_labels].state)[0]})


def row(label, sample, m, term, scale=1.0, note=""):
    lo, hi = m.conf_int().loc[term]
    return dict(prediction=label, sample=sample, n=int(m.nobs), term=term, coef=m.params[term] * scale,
                ci_lo=lo * scale, ci_hi=hi * scale, p=m.pvalues[term], note=note)


def main() -> None:
    s = pd.read_csv(E / "candidate_shares.csv")
    s["incomplete"] = (s.file_truncated.astype(bool) | s.file_error.notna()).astype(float)
    dem = s[s.party == "DEM"].set_index("race_id").add_prefix("d_")
    rep = s[s.party == "REP"].set_index("race_id").add_prefix("r_")
    h = frame().set_index("race_id").join(dem).join(rep)
    fund = pd.read_csv(D / "house_funding.csv").drop_duplicates("race_id").set_index("race_id")[["log_money_ratio"]]
    h = h.join(fund).reset_index()
    h["price_gap"] = h.d_prices_share - h.r_prices_share
    h["soc_pv"] = h.r_socialism_share * h.r_spend_issue / h.total_votes

    both = h[(h.d_spend_all >= FLOOR) & (h.r_spend_all >= FLOOR) & ~h.d_incomplete.fillna(1.0).astype(bool)
             & ~h.r_incomplete.fillna(1.0).astype(bool)].copy()
    donly = h[(h.d_spend_all >= FLOOR) & ~h.d_incomplete.fillna(1.0).astype(bool)].copy()
    counts = dict(races=len(h), dem_has_ads=int(h.d_spend_all.notna().sum()), both_floor=len(both), dem_floor=len(donly),
                  dem_incomplete=int(h.d_incomplete.fillna(0.0).astype(bool).sum()),
                  rep_incomplete=int(h.r_incomplete.fillna(0.0).astype(bool).sum()))
    rows = []
    for name, d in [("both >= $10k", both), ("both >= $10k, >= 90% counted", both[both.counted90]),
                    ("Democrat >= $10k (sensitivity)", donly)]:
        m = fit(f"over_vs_harris ~ d_prices_share + {CTRL}", d)
        rows.append(row("P1 price share -> points ahead of Harris", name, m, "d_prices_share", 0.1, "per +10 share points"))
        dm = d.dropna(subset=["log_money_ratio"])
        m = fit(f"over_vs_harris ~ d_prices_share + log_money_ratio + {CTRL}", dm)
        rows.append(row("P1 + money", name, m, "d_prices_share", 0.1, "per +10 share points"))
        x = d[d.affiliation.isin(["progressive", "moderate"])]
        if x.affiliation.nunique() == 2:
            m = fit(f"d_prices_share ~ C(affiliation, Treatment('moderate')) + {CTRL}", x)
            rows.append(row("P2 progressive minus moderate price share", name, m,
                            "C(affiliation, Treatment('moderate'))[T.progressive]", 100, "share points"))
    for name, d in [("both >= $10k", both), ("both >= $10k, >= 90% counted", both[both.counted90])]:
        m = fit(f"over_vs_harris ~ soc_pv + {CTRL}", d)
        sd = d.soc_pv.std()
        rows.append(row("P3 Republican socialism-ad spend per vote -> points ahead", name, m, "soc_pv", sd,
                        f"per 1 SD (${sd:.3f}/vote)"))
    out = pd.DataFrame(rows)
    g = both.price_gap.dropna()  # races where both candidates ran issue ads
    p4 = dict(prediction="P4 median price gap (D minus R share)", sample="both >= $10k", n=int(both.price_gap.notna().sum()),
              term="price_gap", coef=100 * both.price_gap.median(), ci_lo=np.nan, ci_hi=np.nan, p=np.nan,
              note=f"share points; D ahead in {(g > 0).mean():.0%}, tied in {(g == 0).mean():.0%} of races")
    out = pd.concat([out, pd.DataFrame([p4])])
    desc = both[["d_prices_share", "r_prices_share", "d_socialism_share", "r_socialism_share", "d_corrupt_share",
                 "r_corrupt_share", "d_health_share", "r_health_share", "d_immig_share", "r_immig_share",
                 "d_democracy_share", "r_democracy_share"]].median().round(3)
    out.to_csv(E / "emphasis_models.csv", index=False)
    pd.set_option("display.width", 220)
    print(counts)
    print(out.round(3).to_string())
    print("median shares, both >= $10k:")
    print(desc.to_string())


if __name__ == "__main__":
    main()
