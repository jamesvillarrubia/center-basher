"""Step 4b: pooled Senate + House models -> regressions.csv (chamber "P"), pooled_interactions.csv,
summary.json["pooled"]. Run after analyze.py.

Model: over_vs_harris ~ coding_dummy + senate + harris_margin + net_out_pv [+ prior_office + trail100]
Rows: every analysis row of both chambers (competitive Senate races with a D-vs-R
contest; House districts with a contested progressive-vs-moderate primary and a
D-vs-R general). Coding (a) excludes the three Senate races Third Way did not code
(AK, MS, NH); House "unaligned" and "leftier" nominees are 0.

Inference: OLS coefficients; standard errors clustered by state (CR1, statsmodels
cov_type="cluster"). With 20-28 clusters, CIs also come from a wild cluster
bootstrap-t (unrestricted, Rademacher weights drawn per state, B = 9,999, seed 20261105),
CI = beta_hat - q * se_cluster at the bootstrap t quantiles. HC3 CIs are reported
alongside for comparison.

Pooling test: the same model plus senate x (coding, net_out_pv, harris_margin) and,
in the +controls spec, senate x (prior_office, trail100). Joint test of all
interactions = 0: cluster-robust Wald F, and a restricted wild cluster bootstrap
(WCR) p-value: residuals from the model without interactions, Rademacher weights per
state, the cluster Wald statistic recomputed on each draw.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
B = 9999
SEED = 20261105
CODINGS = {"a_moderate": "a: Third Way moderate", "b_estab": "b: establishment-backed pre-primary (strict)"}
SPECS = {"base": (), "+controls": ("prior_office", "trail100")}


def load() -> pd.DataFrame:
    r = pd.read_csv(D / "races.csv")
    r = r[r.dem_vs_rep & r.dem_last.notna() & ((r.chamber == "H") | r.competitive)].copy()
    r["senate"] = (r.chamber == "S").astype(float)
    r["net_out_pv"] = r.net_outside_against_dem_gen_per_vote
    r["a_moderate"] = (r.coding_a_thirdway == "moderate").astype(float).where(r.coding_a_thirdway.notna())
    r["b_estab"] = r.b_anointed_strict.astype(float)
    r["trail100"] = r.days_on_trail / 100
    return r


def _cluster_fit(formula: str, df: pd.DataFrame):
    return smf.ols(formula, data=df).fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(df.state)[0]})


def cr1(X: np.ndarray, U: np.ndarray, g: np.ndarray, G: int) -> np.ndarray:
    """CR1 cluster covariance for each column of U (n x B) -> (B, k, k).

    Same small-sample factor as statsmodels: G/(G-1) * (n-1)/(n-k).
    """
    n, k = X.shape
    XtXi = np.linalg.inv(X.T @ X)
    S = np.zeros((G, k, U.shape[1]))
    np.add.at(S, g, X[:, :, None] * U[:, None, :])          # per-cluster scores
    meat = np.einsum("gkb,glb->bkl", S, S)
    c = G / (G - 1) * (n - 1) / (n - k)
    return c * np.einsum("ij,bjk,kl->bil", XtXi, meat, XtXi)


def design(formula: str, df: pd.DataFrame):
    m = smf.ols(formula, data=df)
    return m.exog, m.endog, list(m.exog_names)


def wild_ci(formula: str, df: pd.DataFrame, terms: list[str], rng: np.random.Generator) -> dict:
    """Unrestricted wild cluster bootstrap-t CIs (Rademacher per state) for `terms`."""
    X, y, names = design(formula, df)
    g, G = pd.factorize(df.state)[0], df.state.nunique()
    XtXi = np.linalg.inv(X.T @ X)
    beta = XtXi @ X.T @ y
    u = y - X @ beta
    se = np.sqrt(np.diag(cr1(X, u[:, None], g, G)[0]))
    W = rng.choice([-1.0, 1.0], size=(G, B))[g]               # n x B
    Ys = (X @ beta)[:, None] + W * u[:, None]
    Bs = XtXi @ X.T @ Ys                                      # k x B
    Us = Ys - X @ Bs
    ses = np.sqrt(np.diagonal(cr1(X, Us, g, G), axis1=1, axis2=2)).T   # k x B
    out = {}
    for t in terms:
        j = names.index(t)
        tb = (Bs[j] - beta[j]) / ses[j]
        q_hi, q_lo = np.nanquantile(tb, [0.975, 0.025])
        out[t] = (beta[j] - q_hi * se[j], beta[j] - q_lo * se[j])
    return out


def fit_one(df, dummy, extra, label, spec, sample, rng, interact=False):
    cols = ["over_vs_harris", dummy, "senate", "harris_margin", "net_out_pv", *extra]
    x = df.dropna(subset=cols)
    rhs = [dummy, "senate", "harris_margin", "net_out_pv", *extra]
    ints = []
    if interact:
        ints = [f"{v}:senate" for v in [dummy, "net_out_pv", "harris_margin", *extra]]
    formula = "over_vs_harris ~ " + " + ".join(rhs + ints)
    m = _cluster_fit(formula, x)
    hc3 = smf.ols(formula, data=x).fit(cov_type="HC3")
    terms = list(m.params.index.drop("Intercept"))
    wild = wild_ci(formula, x, terms, rng)
    ci, ci3 = m.conf_int(), hc3.conf_int()
    rows = []
    for t in m.params.index:
        rows.append({
            "chamber": "P", "coding": label, "spec": spec + (" +interactions" if interact else ""),
            "sample": sample, "y": "over_vs_harris", "term": t, "n": int(m.nobs),
            "n_senate": int(x.senate.sum()), "clusters": int(x.state.nunique()),
            "n_coded_1": int(x[dummy].sum()), "coef": m.params[t],
            "se_cluster": m.bse[t], "ci_lo": ci.loc[t, 0], "ci_hi": ci.loc[t, 1],
            "ci_wild_lo": wild[t][0] if t in wild else np.nan, "ci_wild_hi": wild[t][1] if t in wild else np.nan,
            "ci_hc3_lo": ci3.loc[t, 0], "ci_hc3_hi": ci3.loc[t, 1], "p": m.pvalues[t],
            "r2": m.rsquared, "cov": "cluster(state) CR1; wild cluster bootstrap-t (Rademacher, B=9999); HC3",
        })
    joint = None
    if interact:
        joint = []
        # (1) all interactions = 0; (2) all except harris_margin:senate, which stays in
        #     both models (separates the terrain slope from the other factors).
        sub = [t for t in ints if t != "harris_margin:senate"]
        for tested, tlist, restr in [("all interactions", ints, rhs),
                                     ("all but harris_margin:senate", sub, rhs + ["harris_margin:senate"])]:
            jt = joint_test(x, formula, "over_vs_harris ~ " + " + ".join(restr), tlist, rng)
            jt.update({"coding": label, "spec": spec, "sample": sample, "tested": tested,
                       "terms": ";".join(tlist), "n": int(m.nobs),
                       "clusters": int(x.state.nunique()), "restrictions": len(tlist)})
            joint.append(jt)
    return rows, joint


def joint_test(x, f_full, f_restr, ints, rng) -> dict:
    m = _cluster_fit(f_full, x)
    R = " , ".join(f"{t} = 0" for t in ints)
    ft = m.f_test(R)
    X, y, names = design(f_full, x)
    Xr, _, _ = design(f_restr, x)
    g, G = pd.factorize(x.state)[0], x.state.nunique()
    idx = [names.index(t) for t in ints]
    XtXi = np.linalg.inv(X.T @ X)

    def wald(Y):
        Bt = XtXi @ X.T @ Y
        V = cr1(X, Y - X @ Bt, g, G)
        out = []
        for b_ in range(Y.shape[1]):
            r = Bt[idx, b_]
            Vr = V[b_][np.ix_(idx, idx)]
            out.append(float(r @ np.linalg.pinv(Vr) @ r))
        return np.array(out)

    w_obs = wald(y[:, None])[0]
    br = np.linalg.lstsq(Xr, y, rcond=None)[0]
    u_r = y - Xr @ br
    W = rng.choice([-1.0, 1.0], size=(G, B))[g]
    wb = wald((Xr @ br)[:, None] + W * u_r[:, None])
    hc3 = smf.ols(f_full, data=x).fit(cov_type="HC3").f_test(R)
    return {"F_cluster": float(np.squeeze(ft.fvalue)), "df_num": int(ft.df_num), "df_denom": float(ft.df_denom),
            "p_cluster": float(ft.pvalue), "wald_obs": w_obs,
            "p_wild_wcr": float((np.sum(wb >= w_obs) + 1) / (B + 1)), "boot_draws": B,
            "F_hc3": float(np.squeeze(hc3.fvalue)), "p_hc3": float(hc3.pvalue)}


def main() -> None:
    rng = np.random.default_rng(SEED)
    r = load()
    samples = {
        "all": r,
        "drop House <90% counted": r[~((r.chamber == "H") & (r.pct_reporting < 90))],
        "drop FL (Nixon)": r[r.race_id != "FL-S"],
    }
    rows, joints = [], []
    for dummy, label in CODINGS.items():
        for spec, extra in SPECS.items():
            for sname, df in samples.items():
                rr, _ = fit_one(df, dummy, extra, label, spec, sname, rng)
                rows += rr
            rr, jt = fit_one(r, dummy, extra, label, spec, "all", rng, interact=True)
            rows += rr
            joints += jt
    pooled = pd.DataFrame(rows)
    reg = pd.read_csv(D / "regressions.csv")
    reg = reg[reg.chamber != "P"]
    reg = pd.concat([reg, pooled], ignore_index=True, sort=False)
    reg.to_csv(D / "regressions.csv", index=False)
    jdf = pd.DataFrame(joints)
    ints = pooled[pooled.term.str.contains(":senate")]
    ints.to_csv(D / "pooled_interactions.csv", index=False)
    jdf.to_csv(D / "pooled_joint_tests.csv", index=False)
    s = json.loads((D / "summary.json").read_text())
    s["pooled"] = {
        "headline": pooled[pooled.term.isin(CODINGS) & ~pooled.spec.str.contains("interactions")][
            ["coding", "spec", "sample", "n", "n_senate", "clusters", "coef", "ci_lo", "ci_hi",
             "ci_wild_lo", "ci_wild_hi", "ci_hc3_lo", "ci_hc3_hi"]].round(3).to_dict("records"),
        "joint_tests": jdf.round(4).to_dict("records"),
        "house_under_90_dropped": r[(r.chamber == "H") & (r.pct_reporting < 90)].race_id.tolist(),
    }
    (D / "summary.json").write_text(json.dumps(s, indent=2, default=float))
    pd.set_option("display.width", 250)
    h = pooled[pooled.term.isin(CODINGS)]
    print(h[["coding", "spec", "sample", "n", "n_senate", "clusters", "coef", "ci_lo", "ci_hi",
             "ci_wild_lo", "ci_wild_hi", "ci_hc3_lo", "ci_hc3_hi"]].round(2).to_string())
    print(ints[["coding", "spec", "term", "n", "clusters", "coef", "ci_lo", "ci_hi", "ci_wild_lo", "ci_wild_hi"]].round(2).to_string())
    print(jdf.round(3).to_string())


if __name__ == "__main__":
    # numpy on macOS Accelerate raises spurious divide/overflow warnings inside matmul on
    # well-conditioned designs (condition numbers 88-258 here); check.py confirms the numpy
    # CR1 standard errors match statsmodels to 1e-10.
    with np.errstate(all="ignore"):
        main()
