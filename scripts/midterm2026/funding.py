"""Money in every 2026 Democrat-vs-Republican House race, and whether it changes the findings.

For both nominees in each of the 417 House races (FEC candidate summary, last pre-election
filing, mostly through Oct 14 2026):
  total raised; small-donor money (individual contributions under $200, unitemized); large-donor
  money (itemized individual contributions); PAC money (other committees); party money;
  self-funding (candidate contributions plus loans).
Relative measures: Democrat's share of the two candidates' money; log ratio of Democrat to
Republican money; Democrat's small-donor share of individual money.
Super PACs and other outside groups (FEC independent expenditures, general election): spending
that helps the Democrat (for the Democrat or against the Republican) minus spending that hurts.

Questions answered:
  1. Does the moderate-vs-progressive head-to-head (house_drivers.py) change once money is held
     constant?
  2. How much of the race-to-race difference does money explain?
  3. Did moderate-backed nominees have more money, more PAC money, or less small-donor money?

Outputs (data/derived/midterm2026/): house_funding.csv, funding_models.csv, funding_by_side.csv,
exhibits_funding.json.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from statsmodels.stats.anova import anova_lm

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from _ie import ie  # noqa: E402
from build_races import cnn_table, norm  # noqa: E402
from house_drivers import frame as drivers_frame  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
BULK = ROOT / "data" / "raw" / "fec" / "bulk2026"
NUM = ["Total_Receipt", "Individual_Itemized_Contribution", "Individual_Unitemized_Contribution",
       "Individual_Contribution", "Other_Committee_Contribution", "Party_Committee_Contribution",
       "Cand_Contribution", "Cand_Loan"]


def summary() -> pd.DataFrame:
    c = pd.read_csv(BULK / "candidate_summary_2026.csv", dtype=str)
    c = c[c.Cand_Office == "H"].copy()
    for k in NUM:
        c[k] = pd.to_numeric(c[k], errors="coerce").fillna(0.0)
    c["dist"] = pd.to_numeric(c.Cand_Office_Dist, errors="coerce").fillna(0).astype(int)
    c["last"] = c.Cand_Name.str.split(",").str[0].map(norm)
    return c


def match(c: pd.DataFrame, st: str, dist: int, party: str, last: str | None):
    if not last:
        return None
    q = c[(c.Cand_Office_St == st) & (c.Cand_Party_Affiliation == party) & (c["last"] == norm(last))]
    q = q[q.dist.isin([dist, 0, 1] if dist in (0, 1) else [dist])]
    return None if q.empty else q.sort_values("Total_Receipt", ascending=False).iloc[0]


def build() -> pd.DataFrame:
    c = summary()
    t = cnn_table("2026-HG")
    t["race_id"] = t.state + "-" + t.district.astype(str).str.zfill(2)
    d = ie()
    d = d[(d.can_office == "H") & (d.ele_type == "G")]
    sums = d.groupby(["cand_id", "sup_opp"]).amt.sum().unstack(fill_value=0.0)
    rows = []
    for r in t.itertuples():
        dm = match(c, r.state, r.district, "DEM", r.dem_last)
        rp = match(c, r.state, r.district, "REP", (r.rep_nominee or "").split(" ")[-1] if r.rep_nominee else None)
        row = {"race_id": r.race_id, "total_votes": r.total_votes,
               "dem_fec_id": None if dm is None else dm.Cand_Id, "rep_fec_id": None if rp is None else rp.Cand_Id}
        for pre, m in [("dem", dm), ("rep", rp)]:
            if m is None:
                continue
            row[f"{pre}_total"] = m.Total_Receipt
            row[f"{pre}_small"] = m.Individual_Unitemized_Contribution
            row[f"{pre}_large"] = m.Individual_Itemized_Contribution
            row[f"{pre}_indiv"] = m.Individual_Contribution
            row[f"{pre}_pac"] = m.Other_Committee_Contribution
            row[f"{pre}_party"] = m.Party_Committee_Contribution
            row[f"{pre}_self"] = m.Cand_Contribution + m.Cand_Loan
            row[f"{pre}_cvg_end"] = m.Coverage_End_Date
        g = lambda cid, so: float(sums.loc[cid, so]) if cid in sums.index and so in sums.columns else 0.0  # noqa: E731
        di, ri = row["dem_fec_id"], row["rep_fec_id"]
        row["ie_help_dem"] = g(di, "S") + g(ri, "O")
        row["ie_hurt_dem"] = g(di, "O") + g(ri, "S")
        rows.append(row)
    f = pd.DataFrame(rows)
    floor = 1000.0
    f["dem_money_share"] = f.dem_total / (f.dem_total.fillna(0) + f.rep_total.fillna(0))
    f["log_money_ratio"] = np.log10(f.dem_total.fillna(0).clip(lower=floor) / f.rep_total.fillna(0).clip(lower=floor))
    f["dem_small_share"] = f.dem_small / f.dem_indiv.where(f.dem_indiv > 0)
    f["dem_pac_share"] = f.dem_pac / f.dem_total.where(f.dem_total > 0)
    f["dem_self_share"] = f.dem_self / f.dem_total.where(f.dem_total > 0)
    f["log_dem_per_vote"] = np.log10((f.dem_total.fillna(0) / f.total_votes).clip(lower=0.01))
    f["log_rep_per_vote"] = np.log10((f.rep_total.fillna(0) / f.total_votes).clip(lower=0.01))
    f["ie_net_pv"] = (f.ie_help_dem - f.ie_hurt_dem) / f.total_votes
    return f


def main() -> None:
    np.seterr(all="ignore")
    f = build()
    f.to_csv(D / "house_funding.csv", index=False)
    h = drivers_frame().merge(f.drop(columns=["total_votes"]), on="race_id", how="left")
    base = "C(state) + C(seat) + harris_margin"
    money = "log_money_ratio + dem_small_share + dem_pac_share + dem_self_share + ie_net_pv"
    money_abs = "log_dem_per_vote + log_rep_per_vote + dem_small_share + dem_pac_share + dem_self_share + ie_net_pv"
    rows = []
    x2 = h[h.affiliation.isin(["progressive", "moderate"])].dropna(subset=["log_money_ratio", "dem_small_share", "dem_pac_share", "dem_self_share"])
    term = "C(affiliation, Treatment('moderate'))[T.progressive]"
    for label, rhs, data in [
        ("head-to-head, no money", base, x2),
        ("head-to-head + relative money, sources, super PACs", f"{base} + {money}", x2),
        ("head-to-head + each side's money per vote, sources, super PACs", f"{base} + {money_abs}", x2),
        ("head-to-head + money, >=90% counted", f"{base} + {money}", x2[x2.counted90]),
    ]:
        m = smf.ols(f"over_vs_harris ~ C(affiliation, Treatment('moderate')) + {rhs}", data=data).fit(
            cov_type="cluster", cov_kwds={"groups": pd.factorize(data.state)[0]})
        lo, hi = m.conf_int().loc[term]
        rows.append(dict(model=label, n=int(m.nobs), term="progressive minus moderate", coef=m.params[term], ci_lo=lo, ci_hi=hi,
                         p=m.pvalues[term], r2=m.rsquared))
        for v in ["log_money_ratio", "dem_small_share", "dem_pac_share", "dem_self_share", "ie_net_pv", "log_dem_per_vote", "log_rep_per_vote"]:
            if v in m.params:
                lo, hi = m.conf_int().loc[v]
                rows.append(dict(model=label, n=int(m.nobs), term=v, coef=m.params[v], ci_lo=lo, ci_hi=hi, p=m.pvalues[v], r2=m.rsquared))
    mods = pd.DataFrame(rows)
    mods.to_csv(D / "funding_models.csv", index=False)

    # share of all-House differences explained, with money in the drivers model
    xa = h.dropna(subset=["log_money_ratio", "dem_small_share", "dem_pac_share", "dem_self_share"])
    ols = smf.ols(f"over_vs_harris ~ C(affiliation, Treatment('neither')) + {base} + {money}", data=xa).fit()
    tab = anova_lm(ols, typ=2)
    tot = float(((xa.over_vs_harris - xa.over_vs_harris.mean()) ** 2).sum())
    shares = (tab.sum_sq / tot).rename("share_of_total").reset_index().rename(columns={"index": "term"})
    shares["p"] = tab["PR(>F)"].values
    shares["n"] = len(xa)

    by = (h[h.affiliation.isin(["progressive", "moderate"])].groupby("affiliation")
          .agg(n=("race_id", "size"), median_total=("dem_total", "median"), median_rep_total=("rep_total", "median"),
               median_money_share=("dem_money_share", "median"), median_small_share=("dem_small_share", "median"),
               median_pac_share=("dem_pac_share", "median"), mean_over=("over_vs_harris", "mean")).reset_index())
    by.to_csv(D / "funding_by_side.csv", index=False)
    cover = {"races": int(len(f)), "dem_matched": int(f.dem_fec_id.notna().sum()), "rep_matched": int(f.rep_fec_id.notna().sum()),
             "model_n_all": int(len(xa)), "summary_fetched": (BULK / "candidate_summary_2026.fetched_utc.txt").read_text().strip()}
    (D / "exhibits_funding.json").write_text(json.dumps({
        "models": json.loads(mods.round(4).to_json(orient="records")),
        "shares": json.loads(shares.round(4).to_json(orient="records")),
        "by_side": json.loads(by.round(4).to_json(orient="records")),
        "coverage": cover}))
    pd.set_option("display.width", 220)
    print(cover)
    print(mods.round(3).to_string())
    print(shares.round(4).to_string())
    print(by.round(3).to_string())


if __name__ == "__main__":
    main()
