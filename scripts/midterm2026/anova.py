"""Step 4d: variance breakdown -> data/derived/midterm2026/{anova_tables.csv, anova_permutation.csv,
anova_effect_sizes.csv}, summary.json["anova"]. Run after baselines_analysis.py.

Pooled rows (pooled.load(): competitive Senate + contested-primary House, D-vs-R general).
Outcome: overperformance against baseline B (harris24, pres2cyc, prior_seat).
Terrain covariate: B's own margin (Harris 2024 margin when B = harris24), as in section 10.

Models
  additive:  y ~ coding + terrain + senate + net_out_pv [+ prior_office + trail100]
  ancova2:   y ~ coding * senate + terrain       (two-way coding x chamber, terrain covariate)
Type II tables from statsmodels anova_lm(typ=2). Type III tables refit with sum-to-zero
contrasts (C(., Sum)) for coding and chamber, anova_lm(typ=3). In an additive model with no
interaction, Type II and Type III sums of squares coincide; they can differ only in ancova2.

Effect sizes per term: partial eta^2 = SS / (SS + SS_resid); partial omega^2 =
(SS - df * MS_resid) / (SS + (N - df) * MS_resid); share of model SS = SS / (SS_total - SS_resid).
Type II SS of correlated terms do not sum to the model SS; the remainder is reported as
"shared (not attributable)".

Permutation p-values for the coding term (and coding x chamber in ancova2), 9,999
permutations, seed 20261105, statistic = the Type II F:
  block:  whole-state label vectors permuted among states with the same chamber
          composition (e.g. one-Senate-row states among themselves); states with a unique
          composition keep their labels. Respects the state clustering.
  strata: labels permuted across rows within each chamber (ignores the clustering).
p = (1 + #{F_perm >= F_obs}) / (1 + 9,999).

State-cluster bootstrap (9,999 resamples of states with replacement) percentile CIs for the
coding term's partial eta^2 and partial omega^2 in the additive models.
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
SEED = 20261105
NPERM = 9999
NBOOT = 9999
BASELINES = {"harris24": "Harris 2024", "pres2cyc": "Mean of Harris 2024 and Biden 2020",
             "prior_seat": "Prior race for the seat"}
CODINGS = {"a_moderate": "a", "b_estab": "b"}
SPECS = {"base": [], "+controls": ["prior_office", "trail100"]}


def frame(baseline: str) -> pd.DataFrame:
    r = load()
    r["y"] = r[f"over_{baseline}"]
    r["terrain"] = r[f"base_{baseline}"]
    return r


def effect_rows(tab: pd.DataFrame, n: int, meta: dict) -> list[dict]:
    resid = tab.loc["Residual"]
    ms_res = resid.sum_sq / resid.df
    ss_total_model = None
    out = []
    terms = [t for t in tab.index if t not in ("Residual", "Intercept")]
    for t in terms:
        ss, df_ = tab.loc[t, "sum_sq"], tab.loc[t, "df"]
        out.append({**meta, "term": t, "sum_sq": ss, "df": df_, "F": tab.loc[t, "F"],
                    "p_classic": tab.loc[t, "PR(>F)"],
                    "partial_eta2": ss / (ss + resid.sum_sq),
                    "partial_omega2": (ss - df_ * ms_res) / (ss + (n - df_) * ms_res)})
    out.append({**meta, "term": "Residual", "sum_sq": resid.sum_sq, "df": resid.df})
    return out


def fit_tables(x: pd.DataFrame, coding: str, extra: list[str], meta: dict) -> list[dict]:
    rows = []
    rhs = [coding, "terrain", "senate", "net_out_pv", *extra]
    m = smf.ols("y ~ " + " + ".join(rhs), data=x).fit()
    ss_model = m.ess
    for typ, model in [(2, m),
                       (3, smf.ols("y ~ " + " + ".join([f"C({coding}, Sum)", "terrain", "C(senate, Sum)",
                                                         "net_out_pv", *extra]), data=x).fit())]:
        tab = anova_lm(model, typ=typ)
        er = effect_rows(tab, len(x), {**meta, "model": "additive", "typ": typ, "n": len(x),
                                      "r2": m.rsquared, "ss_model": ss_model, "ss_total": m.centered_tss})
        attributable = sum(e["sum_sq"] for e in er if e["term"] != "Residual")
        for e in er:
            if e["term"] != "Residual":
                e["share_of_model_ss"] = e["sum_sq"] / ss_model
                e["share_of_total_ss"] = e["sum_sq"] / m.centered_tss
        er.append({**meta, "model": "additive", "typ": typ, "n": len(x), "term": "shared (not attributable)",
                   "sum_sq": ss_model - attributable, "share_of_model_ss": (ss_model - attributable) / ss_model,
                   "share_of_total_ss": (ss_model - attributable) / m.centered_tss})
        for e in er:
            if e["term"] == "Residual":
                e["share_of_total_ss"] = e["sum_sq"] / m.centered_tss
        rows += er
    if not extra:  # two-way coding x chamber ANCOVA, terrain covariate
        for typ, f in [(2, f"y ~ {coding} * senate + terrain"),
                       (3, f"y ~ C({coding}, Sum) * C(senate, Sum) + terrain")]:
            mm = smf.ols(f, data=x).fit()
            tab = anova_lm(mm, typ=typ)
            er = effect_rows(tab, len(x), {**meta, "model": "ancova2", "typ": typ, "n": len(x),
                                          "r2": mm.rsquared, "ss_model": mm.ess, "ss_total": mm.centered_tss})
            for e in er:
                e["share_of_total_ss"] = e["sum_sq"] / mm.centered_tss
                if e["term"] != "Residual":
                    e["share_of_model_ss"] = e["sum_sq"] / mm.ess
            rows += er
    return rows


# ---------------------------------------------------------------- fast F statistics
def _rss(X: np.ndarray, y: np.ndarray) -> float:
    b, *_ = np.linalg.lstsq(X, y, rcond=None)
    e = y - X @ b
    return float(e @ e)


def f_terms(x: pd.DataFrame, cvec: np.ndarray, extra: list[str], model: str) -> dict:
    """Type II F for coding (and coding:senate in ancova2) with coding vector cvec."""
    y = x.y.values
    one = np.ones(len(x))
    s = x.senate.values
    if model == "additive":
        others = np.column_stack([one, x.terrain.values, s, x.net_out_pv.values, *[x[c].values for c in extra]])
        full = np.column_stack([others, cvec])
        rss_f = _rss(full, y)
        dfr = len(y) - full.shape[1]
        return {"coding": (_rss(others, y) - rss_f) / (rss_f / dfr)}
    base = np.column_stack([one, s, x.terrain.values])
    add = np.column_stack([base, cvec])
    inter = np.column_stack([add, cvec * s])
    rss_i = _rss(inter, y)
    dfr = len(y) - inter.shape[1]
    ms = rss_i / dfr
    return {"coding": (_rss(base, y) - _rss(add, y)) / ms,           # Type II: A | B, ignoring A:B
            "coding:senate": (_rss(add, y) - rss_i) / ms}


def block_groups(x: pd.DataFrame) -> list[list[np.ndarray]]:
    """Row-index lists per state, grouped by the state's chamber composition (e.g. "HS")."""
    order = x.sort_values(["state", "chamber", "race_id"])
    groups: dict[str, list[np.ndarray]] = {}
    for _, g in order.groupby("state", sort=True):
        groups.setdefault("".join(g.chamber), []).append(g.index.values)
    return [v for v in groups.values() if len(v) >= 2]


def block_perm(c0: np.ndarray, groups, rng) -> np.ndarray:
    """Permute whole-state label vectors among states with the same chamber composition."""
    c = c0.copy()
    for idx_lists in groups:
        src = [c0[ix] for ix in idx_lists]
        for ix, j in zip(idx_lists, rng.permutation(len(idx_lists))):
            c[ix] = src[j]
    return c


def strata_perm(c0: np.ndarray, strata, rng) -> np.ndarray:
    c = c0.copy()
    for ix in strata:
        c[ix] = c0[rng.permutation(ix)]
    return c


def perm_tests(x, coding, extra, model, rng) -> list[dict]:
    x = x.reset_index(drop=True)
    obs = f_terms(x, x[coding].values, extra, model)
    out = []
    counts = {k: {"block": 0, "strata": 0} for k in obs}
    c0 = x[coding].values.astype(float)
    groups = block_groups(x)
    strata = [np.where(x.chamber.values == ch)[0] for ch in ("S", "H")]
    for _ in range(NPERM):
        fb = f_terms(x, block_perm(c0, groups, rng), extra, model)
        fs = f_terms(x, strata_perm(c0, strata, rng), extra, model)
        for k in obs:
            counts[k]["block"] += fb[k] >= obs[k] - 1e-12
            counts[k]["strata"] += fs[k] >= obs[k] - 1e-12
    import math
    from collections import Counter
    n_distinct = 1
    for idx_lists in groups:
        vecs = Counter(tuple(c0[i]) for i in idx_lists)
        n_distinct *= math.factorial(len(idx_lists)) // int(np.prod([math.factorial(v) for v in vecs.values()]))
    sig = x.sort_values(["state", "chamber"]).groupby("state").chamber.apply("".join)
    exch = sig[sig.map(sig.value_counts()) >= 2].index
    for k, f in obs.items():
        out.append({"term": k, "F_obs": f, "p_perm_block": (1 + counts[k]["block"]) / (1 + NPERM),
                    "p_perm_strata": (1 + counts[k]["strata"]) / (1 + NPERM), "n_perm": NPERM,
                    "rows_in_exchangeable_blocks": int(x.state.isin(exch).sum()), "n": len(x),
                    "distinct_block_relabelings": n_distinct})
    return out


def boot_effect(x, coding, extra, rng) -> dict:
    x = x.reset_index(drop=True)
    states = x.state.unique()
    idx_by = {s: x.index[x.state == s].values for s in states}
    eta, omg = [], []
    for _ in range(NBOOT):
        pick = rng.choice(states, size=len(states), replace=True)
        ix = np.concatenate([idx_by[s] for s in pick])
        xb = x.iloc[ix]
        if xb[coding].nunique() < 2:
            continue
        y = xb.y.values
        one = np.ones(len(xb))
        others = np.column_stack([one, xb.terrain.values, xb.senate.values, xb.net_out_pv.values,
                                  *[xb[c].values for c in extra]])
        full = np.column_stack([others, xb[coding].values])
        if np.linalg.matrix_rank(full) < full.shape[1]:
            continue
        rss_f, rss_r = _rss(full, y), _rss(others, y)
        ss = rss_r - rss_f
        dfr = len(y) - full.shape[1]
        ms = rss_f / dfr
        eta.append(ss / (ss + rss_f))
        omg.append((ss - ms) / (ss + (len(y) - 1) * ms))
    return {"eta2_ci_lo": np.quantile(eta, 0.025), "eta2_ci_hi": np.quantile(eta, 0.975),
            "omega2_ci_lo": np.quantile(omg, 0.025), "omega2_ci_hi": np.quantile(omg, 0.975),
            "boot_valid": len(eta)}


def main() -> None:
    rng = np.random.default_rng(SEED)
    tables, perms, effects = [], [], []
    for bkey, blabel in BASELINES.items():
        r = frame(bkey)
        for coding, cl in CODINGS.items():
            for spec, extra in SPECS.items():
                x = r.dropna(subset=["y", "terrain", coding, "net_out_pv", *extra]).copy()
                meta = {"baseline": bkey, "baseline_label": blabel, "coding": cl, "spec": spec}
                tables += fit_tables(x, coding, extra, meta)
                for model in (["additive", "ancova2"] if not extra else ["additive"]):
                    for p in perm_tests(x, coding, extra, model, rng):
                        perms.append({**meta, "model": model, **p})
                t2 = [t for t in tables if t["baseline"] == bkey and t["coding"] == cl and t["spec"] == spec
                      and t["model"] == "additive" and t["typ"] == 2 and t["term"] == coding][0]
                effects.append({**meta, "n": len(x), "clusters": x.state.nunique(),
                                "partial_eta2": t2["partial_eta2"], "partial_omega2": t2["partial_omega2"],
                                "share_of_model_ss": t2["share_of_model_ss"], **boot_effect(x, coding, extra, rng)})
    tab = pd.DataFrame(tables)
    tab.to_csv(D / "anova_tables.csv", index=False)
    pm = pd.DataFrame(perms)
    cl = tab[tab.typ == 2][["baseline", "coding", "spec", "model", "term", "p_classic"]]
    cl["term"] = cl.term.replace({"a_moderate": "coding", "b_estab": "coding",
                                  "a_moderate:senate": "coding:senate", "b_estab:senate": "coding:senate"})
    pm = pm.merge(cl, on=["baseline", "coding", "spec", "model", "term"], how="left")
    pm.to_csv(D / "anova_permutation.csv", index=False)
    ef = pd.DataFrame(effects)
    ef.to_csv(D / "anova_effect_sizes.csv", index=False)
    s = json.loads((D / "summary.json").read_text())
    s["anova"] = {"effect_sizes": ef.round(4).to_dict("records"),
                  "permutation": pm.round(4).to_dict("records")}
    (D / "summary.json").write_text(json.dumps(s, indent=2, default=float))
    pd.set_option("display.width", 250)
    print(ef.round(3).to_string())
    print(pm.round(4).to_string())


if __name__ == "__main__":
    with np.errstate(all="ignore"):
        main()
