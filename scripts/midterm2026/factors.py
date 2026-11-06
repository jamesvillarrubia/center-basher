"""Every factor considered, against overperformance: correlation table and ANOVA tables.

Sample: the 44 nominees with a coding (c) score (14 competitive Senate, 30 contested House).
Outcomes: points ahead of Harris 2024 (over_vs_harris) and of the prior race for the seat
(over_prior_seat, n 38).

Outputs (data/derived/midterm2026/):
  factors_correlations.csv  Pearson r per factor x outcome, state-cluster bootstrap 95% CI
  factors_anova.csv         Type II ANOVA of a pooled model with all full-coverage factors
  factors_wave.csv          uncentered sum-of-squares split: common shift vs race-specific
  exhibits_data.json        per-race rows plus the tables, for the exhibits page
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
from pooled import load  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
SEED = 20261106
B = 4999

FACTORS = [
    # column, label, group
    ("c_eb", "Progressive index, coverage-corrected", "Who the candidate is"),
    ("c_index", "Progressive index, raw (unsourced = 0)", "Who the candidate is"),
    ("a_moderate", "Third Way calls them moderate", "Who the candidate is"),
    ("b_estab", "Establishment-backed before the primary", "Who the candidate is"),
    ("incumbent", "Incumbent", "Who the candidate is"),
    ("prior_office", "Prior office (0 none to 3 statewide/federal)", "Name recognition"),
    ("fame_flag", "Famous before the race", "Name recognition"),
    ("log_pageviews", "Wikipedia pageviews, 12 months pre-launch (log)", "Name recognition"),
    ("trail100", "Days on the campaign trail (per 100)", "Time on the trail"),
    ("log_receipts_pv", "Money raised per vote cast (log)", "Money"),
    ("net_out_pv", "Net outside spending against the Democrat, $/vote", "Money"),
    ("prim_money_against", "Faced AIPAC, crypto or AI primary money", "Money"),
    ("harris_margin", "Harris 2024 margin in the state or district", "Terrain"),
    ("senate", "Senate race (vs House)", "Terrain"),
    ("c_n_sourced", "Positions sourced (documentation)", "Measurement"),
]
OUTCOMES = [("over_vs_harris", "vs Harris 2024"), ("over_prior_seat", "vs prior race for the seat")]


def frame() -> pd.DataFrame:
    r = load()
    r = r[r.c_index.notna()].copy()
    r["incumbent"] = r.dem_incumbent.astype(float)
    eb = pd.read_csv(D / "debias_measurement.csv").set_index("race_id").eb_mean
    r["c_eb"] = r.race_id.map(eb)
    r["log_pageviews"] = np.log10(r.pageviews_12m_pre_launch.clip(lower=1))
    r["log_receipts_pv"] = np.log10(r.dollars_per_vote_receipts.clip(lower=0.01))
    money = r[["aipac_prim_against_nominee", "crypto_prim_against_nominee", "ai_prim_against_nominee"]].fillna(0)
    r["prim_money_against"] = (money.sum(axis=1) > 0).astype(float)
    return r


def cluster_boot_r(x: np.ndarray, y: np.ndarray, g: np.ndarray, rng) -> tuple[float, float]:
    states = np.unique(g)
    idx = {s: np.flatnonzero(g == s) for s in states}
    out = []
    for _ in range(B):
        pick = rng.choice(states, size=len(states), replace=True)
        rows = np.concatenate([idx[s] for s in pick])
        xs, ys = x[rows], y[rows]
        if xs.std() == 0 or ys.std() == 0:
            continue
        out.append(np.corrcoef(xs, ys)[0, 1])
    return float(np.percentile(out, 2.5)), float(np.percentile(out, 97.5))


def perm_p(x: np.ndarray, y: np.ndarray, rng, n_perm: int = 9999) -> float:
    r0 = abs(np.corrcoef(x, y)[0, 1])
    hits = sum(abs(np.corrcoef(rng.permutation(x), y)[0, 1]) >= r0 for _ in range(n_perm))
    return (hits + 1) / (n_perm + 1)


def correlations(r: pd.DataFrame) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    rows = []
    for ycol, ylab in OUTCOMES:
        for col, lab, grp in FACTORS:
            x = r[[col, ycol, "state"]].dropna()
            xv, yv = x[col].to_numpy(float), x[ycol].to_numpy(float)
            r_ = float(np.corrcoef(xv, yv)[0, 1])
            lo, hi = cluster_boot_r(xv, yv, x.state.to_numpy(), rng)
            rows.append(dict(outcome=ycol, outcome_label=ylab, factor=col, label=lab, group=grp,
                             n=len(x), r=r_, ci_lo=lo, ci_hi=hi, p_perm=perm_p(xv, yv, rng),
                             clear_of_zero=bool(lo > 0 or hi < 0)))
    return pd.DataFrame(rows)


ANOVA_MODELS = {
    # full coverage, n 44 (Third Way's label omitted: it leaves 3 Senate races uncoded)
    "full": ["senate", "harris_margin", "incumbent", "prior_office", "log_pageviews",
             "log_receipts_pv", "net_out_pv", "prim_money_against", "b_estab", "c_eb"],
    # adds Third Way's label and its chamber interaction, n 41
    "thirdway": ["senate", "harris_margin", "incumbent", "prior_office", "log_pageviews",
                 "log_receipts_pv", "net_out_pv", "prim_money_against", "b_estab", "c_eb",
                 "a_moderate", "a_moderate:senate"],
    # adds days on the trail, n 27 (FEC launch dates unavailable; announcement dates)
    "trail": ["senate", "harris_margin", "incumbent", "prior_office", "log_pageviews",
              "log_receipts_pv", "net_out_pv", "prim_money_against", "b_estab", "c_eb", "trail100"],
}


def anova(r: pd.DataFrame) -> pd.DataFrame:
    labels = {c: l for c, l, _ in FACTORS} | {"a_moderate:senate": "Third Way label x Senate"}
    rows = []
    for ycol, ylab in OUTCOMES:
        for name, terms in ANOVA_MODELS.items():
            cols = sorted({t for term in terms for t in term.split(":")})
            x = r[cols + [ycol]].dropna()
            fit = smf.ols(f"{ycol} ~ " + " + ".join(terms), data=x).fit()
            tab = anova_lm(fit, typ=2)
            ss_res = tab.loc["Residual", "sum_sq"]
            ss_tot = float(((x[ycol] - x[ycol].mean()) ** 2).sum())
            for term, row in tab.iterrows():
                rows.append(dict(outcome=ycol, outcome_label=ylab, model=name, n=len(x), term=term,
                                 label=labels.get(term, term), df=row.df, sum_sq=row.sum_sq,
                                 F=row.F, p=row["PR(>F)"],
                                 partial_eta2=(row.sum_sq / (row.sum_sq + ss_res)) if term != "Residual" else np.nan,
                                 share_of_total=row.sum_sq / ss_tot,
                                 coef=fit.params.get(term, np.nan), r2=fit.rsquared, adj_r2=fit.rsquared_adj))
    return pd.DataFrame(rows)


def wave(r: pd.DataFrame) -> pd.DataFrame:
    rows = []
    allh = pd.read_csv(D / "races.csv")
    house = pd.read_csv(D / "house_all.csv") if (D / "house_all.csv").exists() else None
    sets = [("44 coded nominees", r.over_vs_harris.dropna())]
    if house is not None and "over_vs_harris" in house:
        hh = house[house.get("dem_vs_rep", True) == True].over_vs_harris.dropna()  # noqa: E712
        sets.append(("All Dem-vs-Rep House races", hh))
    del allh
    for lab, y in sets:
        ss_u = float((y ** 2).sum())
        ss_mean = len(y) * float(y.mean()) ** 2
        rows.append(dict(sample=lab, n=len(y), mean=float(y.mean()), sd=float(y.std(ddof=1)),
                         share_common_shift=ss_mean / ss_u, share_race_specific=1 - ss_mean / ss_u,
                         n_ahead_of_harris=int((y > 0).sum())))
    return pd.DataFrame(rows)


def house_over(r: pd.DataFrame) -> list[float]:
    h = pd.read_csv(D / "house_all.csv")
    return h[h.dem_vs_rep == True].over_vs_harris.dropna().tolist()  # noqa: E712


def main() -> None:
    r = frame()
    cor = correlations(r)
    an = anova(r)
    wv = wave(r)
    cor.to_csv(D / "factors_correlations.csv", index=False)
    an.to_csv(D / "factors_anova.csv", index=False)
    wv.to_csv(D / "factors_wave.csv", index=False)
    keep = ["race_id", "chamber", "dem_last", "dem_won", "over_vs_harris", "over_prior_seat",
            "coding_a_thirdway", "b_estab", "c_index", "c_eb", "c_n_sourced", "harris_margin"]
    races = r[keep].rename(columns={"race_id": "id", "chamber": "ch", "dem_last": "name", "dem_won": "won",
                                    "over_vs_harris": "over", "over_prior_seat": "prior",
                                    "coding_a_thirdway": "tw", "b_estab": "estab", "c_index": "c",
                                    "c_n_sourced": "ns", "harris_margin": "terrain", "c_eb": "ceb"})
    races["tw"] = races.tw.fillna("uncoded")
    out = dict(races=json.loads(races.round(3).to_json(orient="records")),
               correlations=json.loads(cor.round(4).to_json(orient="records")),
               anova=json.loads(an.round(4).to_json(orient="records")),
               wave=json.loads(wv.round(4).to_json(orient="records")),
               house_over=[round(v, 2) for v in house_over(r)])
    (D / "exhibits_data.json").write_text(json.dumps(out))
    pd.set_option("display.width", 220)
    print(cor[["outcome", "label", "n", "r", "ci_lo", "ci_hi", "p_perm", "clear_of_zero"]].round(3).to_string())
    print(an[an.model == "full"][["outcome", "label", "df", "F", "p", "partial_eta2", "share_of_total", "coef", "r2"]].round(3).to_string())
    print(an[an.model != "full"][["outcome", "model", "n", "label", "F", "p", "partial_eta2", "r2"]].round(3).to_string())
    print(wv.round(3).to_string())


if __name__ == "__main__":
    main()
