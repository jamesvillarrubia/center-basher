"""Did progressive or economic-populist Democrats raise turnout?

Turnout measure: total House votes cast in the district in 2026 divided by 2022 (log ratio),
for districts whose lines did not change between 2022 and 2026 (redrawn flags from
build_baselines.downballot) and whose 2022 race had both a Democrat and a Republican. Also split
into Democratic votes (2026 / 2022) and Republican votes (2026 / 2022), so a gain can be read as
more Democrats voting or fewer Republicans voting.

Population: same districts in both years, so population change is small; the ratio mostly
measures how many people voted. Counting is incomplete in some 2026 races, so every model is also
run on races at least 90% counted.

Candidate measures:
  House-wide (all matched races): progressive vs moderate group backing (house_drivers.frame).
  44 scored nominees: economic-populism score = sum of item scores on items 1, 2, 6, 9, 10, 12
    (Medicare for All, billionaire tax, $17 minimum wage, student debt / free college,
    anti-monopoly, universal childcare); overall progressive index c_index.
Outputs (data/derived/midterm2026/): turnout_races.csv, turnout_models.csv.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from build_baselines import cnn_rows, downballot  # noqa: E402
from house_drivers import frame as drivers_frame  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
ECON = [1, 2, 6, 9, 10, 12]


def build() -> pd.DataFrame:
    h22 = cnn_rows("2022-HG")
    h22 = h22[(h22.all_d > 0) & (h22.all_r > 0)][["state", "district", "tot", "all_d", "all_r"]]
    h22 = h22.rename(columns={"tot": "tot22", "all_d": "d22", "all_r": "r22"})
    h26 = cnn_rows("2026-HG")[["state", "district", "tot", "all_d", "all_r"]].rename(
        columns={"tot": "tot26", "all_d": "d26", "all_r": "r26"})
    db = downballot()
    same = db[(db.redrawn_2024_2026 == False) & (db.redrawn_2022_2024 == False)][["state", "district"]]  # noqa: E712
    t = same.merge(h22, on=["state", "district"]).merge(h26, on=["state", "district"])
    t["race_id"] = t.state + "-" + t.district.astype(str).str.zfill(2)
    t["log_turnout"] = np.log(t.tot26 / t.tot22)
    t["log_dem"] = np.log(t.d26 / t.d22)
    t["log_rep"] = np.log(t.r26.clip(lower=1) / t.r22)
    return t


def coef(m, term):
    lo, hi = m.conf_int().loc[term]
    return m.params[term], lo, hi, m.pvalues[term]


def main() -> None:
    np.seterr(all="ignore")
    t = build()
    h = drivers_frame().merge(t[["race_id", "tot22", "tot26", "d22", "d26", "r22", "r26", "log_turnout", "log_dem", "log_rep"]],
                              on="race_id")
    h = h[h.r26 > 0]
    t.to_csv(D / "turnout_races.csv", index=False)
    rows = []
    term = "C(affiliation, Treatment('moderate'))[T.progressive]"
    for sample, x in [("all", h), ("counted >= 90%", h[h.counted90])]:
        x2 = x[x.affiliation.isin(["progressive", "moderate"])]
        for y in ["log_turnout", "log_dem", "log_rep"]:
            m = smf.ols(f"{y} ~ C(affiliation, Treatment('moderate')) + C(state) + C(seat) + harris_margin", x2).fit(
                cov_type="cluster", cov_kwds={"groups": pd.factorize(x2.state)[0]})
            b, lo, hi, p = coef(m, term)
            rows.append(dict(sample=sample, outcome=y, measure="progressive minus moderate backing (House)",
                             n=int(m.nobs), coef_pct=100 * b, lo_pct=100 * lo, hi_pct=100 * hi, p=p))
        # does turnout growth go with running ahead of Harris?
        m = smf.ols("over_vs_harris ~ log_turnout + C(state) + C(seat) + harris_margin", x).fit(
            cov_type="cluster", cov_kwds={"groups": pd.factorize(x.state)[0]})
        b, lo, hi, p = coef(m, "log_turnout")
        rows.append(dict(sample=sample, outcome="over_vs_harris", measure="points per +10% turnout vs 2022",
                         n=int(m.nobs), coef_pct=b * np.log(1.1), lo_pct=lo * np.log(1.1), hi_pct=hi * np.log(1.1), p=p))
        rows.append(dict(sample=sample, outcome="mean", measure="mean turnout change vs 2022, %", n=len(x),
                         coef_pct=100 * (np.exp(x.log_turnout.mean()) - 1), lo_pct=np.nan, hi_pct=np.nan, p=np.nan))
        for y in ["log_dem", "log_rep"]:
            rows.append(dict(sample=sample, outcome=y, measure="mean change vs 2022, %", n=len(x),
                             coef_pct=100 * (np.exp(x[y].mean()) - 1), lo_pct=np.nan, hi_pct=np.nan, p=np.nan))

    # 44 scored nominees: econ populism and overall index
    r = pd.read_csv(D / "races.csv")
    p = pd.read_csv(D / "positions" / "positions_final.csv")
    econ = p[p.item.isin(ECON)].groupby("race_id").score.sum().rename("econ")
    s = r[(r.chamber == "H") & r.dem_vs_rep].merge(econ, on="race_id", how="left").merge(
        t[["race_id", "log_turnout", "log_dem", "log_rep"]], on="race_id")
    s["econ"] = s.econ.fillna(0)
    for x_ in ["econ", "c_index"]:
        for y in ["log_turnout", "log_dem", "log_rep"]:
            d = s.dropna(subset=[x_, y])
            m = smf.ols(f"{y} ~ {x_} + harris_margin + dem_incumbent", d).fit(cov_type="HC3")
            b, lo, hi, pv = coef(m, x_)
            unit = 1.0 if x_ == "econ" else 0.1
            rows.append(dict(sample="scored House nominees, unchanged lines", outcome=y,
                             measure=f"{x_}: % per {'+1 item' if x_ == 'econ' else '+0.1'}", n=int(m.nobs),
                             coef_pct=100 * b * unit, lo_pct=100 * lo * unit, hi_pct=100 * hi * unit, p=pv))
    out = pd.DataFrame(rows)
    out.to_csv(D / "turnout_models.csv", index=False)
    pd.set_option("display.width", 220)
    print(f"matched districts, unchanged lines: {len(t)}; with D-vs-R 2026 race in drivers frame: {len(h)}")
    print(out.round(3).to_string())


if __name__ == "__main__":
    main()
