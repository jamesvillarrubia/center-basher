"""What predicted running ahead of Harris, across every Democrat-vs-Republican House race.

The 44-race sample is too small to detect modest effects. This script uses all 417 House races
in house_all.csv and asks which blocks of facts explain the race-to-race differences:
  state        state fixed effects (where the race was)
  seat         Democratic incumbent / open seat / Republican incumbent
  terrain      Harris 2024 margin in the district
  affiliation  caucus membership and group endorsements, from house_affiliations.csv when it
               exists: progressive (Progressive Caucus, CPC PAC, Justice Democrats, WFP, Our
               Revolution, PCCC) vs moderate (New Democrat Coalition, Blue Dog, NewDem Action
               Fund, Blue Dog PAC, WelcomePAC)

Every model is run on all races and on the races at least 90% counted. Standard errors cluster
by state.

Outputs (data/derived/midterm2026/): house_drivers_anova.csv, house_drivers_coefs.csv,
house_drivers_groups.csv, exhibits_house.json.
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

D = ROOT / "data" / "derived" / "midterm2026"
PROG = {"cpc", "cpc_pac", "justice_democrats", "our_revolution", "pccc", "working_families_party"}
MOD = {"new_democrat_coalition", "new_dem_action_fund", "blue_dog_coalition", "blue_dog_pac", "welcomepac"}


def frame() -> pd.DataFrame:
    h = pd.read_csv(D / "house_all.csv")
    h = h[h.dem_vs_rep == True].dropna(subset=["over_vs_harris"]).drop_duplicates("race_id").copy()  # noqa: E712
    h["seat"] = np.select([h.dem_incumbent, h.rep_incumbent], ["D incumbent", "R incumbent"], "open")
    h["counted90"] = h.pct_reporting >= 90
    f = D / "house_affiliations.csv"
    h["has_affiliations"] = f.exists()
    if f.exists():
        a = pd.read_csv(f)
        a = a[a.race_id.notna()]
        g = a.group.str.strip()
        a["side"] = np.where(g.isin(PROG), "progressive", np.where(g.isin(MOD), "moderate", "other"))
        side = a[a.side != "other"].groupby("race_id").side.agg(lambda s: set(s))
        lab = side.map(lambda s: "both" if len(s) == 2 else next(iter(s)))
        h["affiliation"] = h.race_id.map(lab).fillna("neither")
    return h


def fit(h: pd.DataFrame, terms: list[str]):
    f = "over_vs_harris ~ " + " + ".join(terms)
    ols = smf.ols(f, data=h).fit()
    cl = smf.ols(f, data=h).fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(h.state)[0]})
    return ols, cl


def main() -> None:
    np.seterr(all="ignore")
    h = frame()
    terms = ["C(state)", "C(seat, Treatment('D incumbent'))", "harris_margin"]
    if "affiliation" in h:
        terms.append("C(affiliation, Treatment('neither'))")
    rows, coefs = [], []
    for sample, x in [("all", h), ("counted >= 90%", h[h.counted90])]:
        ols, cl = fit(x, terms)
        tab = anova_lm(ols, typ=2)
        ss_res = tab.loc["Residual", "sum_sq"]
        ss_tot = float(((x.over_vs_harris - x.over_vs_harris.mean()) ** 2).sum())
        for term, r in tab.iterrows():
            rows.append(dict(sample=sample, n=len(x), term=term, df=r.df, sum_sq=r.sum_sq, F=r.F, p=r["PR(>F)"],
                             partial_eta2=r.sum_sq / (r.sum_sq + ss_res) if term != "Residual" else np.nan,
                             share_of_total=r.sum_sq / ss_tot, r2=ols.rsquared))
        ci = cl.conf_int()
        for term in cl.params.index:
            if term.startswith("C(state)") or term == "Intercept":
                continue
            coefs.append(dict(sample=sample, n=len(x), term=term, coef=cl.params[term], ci_lo=ci.loc[term, 0],
                              ci_hi=ci.loc[term, 1], p=cl.pvalues[term]))
    # Head-to-head: progressive-affiliated vs moderate-affiliated nominees, same state, same seat type.
    duel = []
    if "affiliation" in h:
        f = "over_vs_harris ~ C(affiliation, Treatment('moderate')) + C(state) + C(seat) + harris_margin"
        for sample, x in [("all", h), ("counted >= 90%", h[h.counted90])]:
            x = x[x.affiliation.isin(["progressive", "moderate"])]
            m = smf.ols(f, data=x).fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(x.state)[0]})
            term = "C(affiliation, Treatment('moderate'))[T.progressive]"
            lo, hi = m.conf_int().loc[term]
            duel.append(dict(sample=sample, n=len(x), n_prog=int((x.affiliation == "progressive").sum()),
                             n_mod=int((x.affiliation == "moderate").sum()), prog_minus_mod=m.params[term],
                             ci_lo=lo, ci_hi=hi, p=m.pvalues[term],
                             raw_prog=x[x.affiliation == "progressive"].over_vs_harris.mean(),
                             raw_mod=x[x.affiliation == "moderate"].over_vs_harris.mean()))
    duel = pd.DataFrame(duel)
    duel.to_csv(D / "house_drivers_duel.csv", index=False)
    an, co = pd.DataFrame(rows), pd.DataFrame(coefs)
    groups = h.groupby("seat").over_vs_harris.agg(["mean", "count"]).reset_index().assign(by="seat")
    if "affiliation" in h:
        groups = pd.concat([groups, h.groupby("affiliation").over_vs_harris.agg(["mean", "count"]).reset_index()
                            .rename(columns={"affiliation": "seat"}).assign(by="affiliation")])
    an.to_csv(D / "house_drivers_anova.csv", index=False)
    co.to_csv(D / "house_drivers_coefs.csv", index=False)
    groups.to_csv(D / "house_drivers_groups.csv", index=False)
    (D / "exhibits_house.json").write_text(json.dumps({
        "anova": json.loads(an.round(4).to_json(orient="records")),
        "coefs": json.loads(co.round(4).to_json(orient="records")),
        "groups": json.loads(groups.round(3).to_json(orient="records")),
        "has_affiliations": bool(h.has_affiliations.iloc[0]),
        "duel": json.loads(duel.round(4).to_json(orient="records")),
        "wave_mean": float(h.over_vs_harris.mean()),
    }))
    pd.set_option("display.width", 200)
    print(an.round(3).to_string())
    print(co.round(2).to_string())
    print(groups.round(2).to_string())
    print(duel.round(2).to_string())


if __name__ == "__main__":
    main()
