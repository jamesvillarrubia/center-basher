"""Coverage-corrected progressive index, and baselines that do not use Harris 2024.

Problem 1. The raw progressive index scores every item we could not source as 0. Of 572
nominee-item cells, 134 carry a source and 130 of those are non-zero, so a 0 almost always
means "not found", not "silent". The raw index therefore tracks documentation (r 0.92 with
items sourced). This script treats unsourced items as missing and estimates each nominee's
position three ways:
  stated      mean of sourced items only (c_stated, already in races.csv)
  fe          two-way fixed effects on sourced cells, score = nominee + item, so a nominee is
              not marked up or down for which items happened to be findable
  eb          empirical-Bayes: the fe estimate shrunk toward a prediction from pre-primary
              facts (progressive-group endorsement, Third Way's leftier label, establishment
              backing, AIPAC/crypto/AI money against, incumbency, chamber). Nominees with few
              sourced items lean on the prediction; well-documented nominees keep their own
              score. Uncertainty is carried into the outcome models by 2,000 posterior draws
              combined with Rubin's rules.
Problem 2. Harris 2024 may be a biased yardstick: partisans and the uninformed perceived her
ideology differently, so her margin can understate or overstate a district's Democratic
baseline in a way that tracks terrain. Non-Harris baselines:
  biden20, prior_seat, midterm22   (already in races.csv)
  hist      expected 2026 margin from Biden 2020 and the prior race for the seat, fitted on all
            Dem-vs-Rep races and predicted leave-one-state-out. No Harris input.
  house26   2026 statewide House vote, same ballot (Senate only)
  gov26     2026 governor margin, same ballot (Senate rows in states with a governor race)

Outputs (data/derived/midterm2026/): debias_measurement.csv, debias_effects.csv,
baselines_nonharris.csv.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from pooled import _cluster_fit, load, wild_ci  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
SEED = 20261106
M = 2000
PRIOR_X = ["prog_endorsed", "tw_leftier", "b_estab", "prim_money_against", "incumbent", "senate"]


def measurement(r: pd.DataFrame) -> pd.DataFrame:
    p = pd.read_csv(D / "positions" / "positions_final.csv")
    p = p[p.race_id.isin(r.race_id)]
    s = p[p.source_url.notna() & p.score.notna()].copy()
    # two-way fixed effects on sourced cells: score = theta_nominee + beta_item, items centred
    noms = sorted(r.race_id)
    items = sorted(p.item.unique())
    Xn = pd.get_dummies(s.race_id).reindex(columns=noms, fill_value=0).astype(float)
    Xi = pd.get_dummies(s.item).reindex(columns=items, fill_value=0).astype(float)
    Xi = Xi.sub(Xi.mean(axis=1) * 0, axis=0)  # keep explicit item dummies
    X = np.hstack([Xn.to_numpy(), Xi.to_numpy()[:, 1:]])  # drop one item for identification
    y = s.score.to_numpy(float)
    keep = X.any(axis=0)
    beta, *_ = np.linalg.lstsq(X[:, keep], y, rcond=None)
    full = np.full(X.shape[1], np.nan)
    full[keep] = beta
    theta = pd.Series(full[: len(noms)], index=noms)
    item_eff = np.r_[0.0, full[len(noms):]]
    item_eff = np.nan_to_num(item_eff)
    shift = item_eff.mean()  # re-centre so theta = score on the average item
    theta = theta + shift
    resid = y - X[:, keep] @ beta
    dof = len(y) - keep.sum()
    sigma2 = float(resid @ resid / max(dof, 1))
    n = s.groupby("race_id").size().reindex(noms, fill_value=0)
    out = pd.DataFrame({"race_id": noms, "n_sourced": n.to_numpy(), "theta_fe": theta.to_numpy()})
    out.attrs["sigma2"] = sigma2
    out.attrs["item_effects"] = dict(zip(items, (item_eff - shift).round(3)))
    return out


def prior_frame(r: pd.DataFrame) -> pd.DataFrame:
    x = r.set_index("race_id")
    money = x[["aipac_prim_against_nominee", "crypto_prim_against_nominee", "ai_prim_against_nominee"]].fillna(0)
    return pd.DataFrame({
        "prog_endorsed": x.nominee_prog_endorsed.fillna(0),
        "tw_leftier": (x.coding_a_thirdway == "leftier").astype(float),
        "b_estab": x.b_anointed_strict.astype(float),
        "prim_money_against": (money.sum(axis=1) > 0).astype(float),
        "incumbent": x.dem_incumbent.astype(float),
        "senate": (x.chamber == "S").astype(float),
    })


def empirical_bayes(meas: pd.DataFrame, Xp: pd.DataFrame, rng) -> tuple[pd.DataFrame, np.ndarray]:
    sigma2 = meas.attrs["sigma2"]
    m = meas.set_index("race_id").join(Xp)
    obs = m[m.n_sourced > 0]
    Z = sm.add_constant(obs[PRIOR_X])
    w = obs.n_sourced.to_numpy(float)
    fit = sm.WLS(obs.theta_fe, Z, weights=w).fit()
    resid = obs.theta_fe - fit.fittedvalues
    tau2 = max(float(np.average(resid ** 2, weights=w) - np.average(sigma2 / obs.n_sourced, weights=w)), 0.005)
    Zall = sm.add_constant(m[PRIOR_X], has_constant="add")
    gam = rng.multivariate_normal(fit.params.to_numpy(), fit.cov_params().to_numpy(), size=M)  # M x k
    mu = Zall.to_numpy() @ gam.T                                                             # n x M
    nprec = (m.n_sourced.to_numpy(float) / sigma2)[:, None]
    th = np.nan_to_num(m.theta_fe.to_numpy())[:, None]
    v = 1.0 / (nprec + 1.0 / tau2)
    mean = v * (nprec * th + mu / tau2)
    draws = mean + rng.standard_normal(mean.shape) * np.sqrt(v)
    res = m[["n_sourced", "theta_fe"]].copy()
    res["eb_mean"] = draws.mean(axis=1)
    res["eb_sd"] = draws.std(axis=1)
    res["prior_mean"] = mu.mean(axis=1)
    res["weight_on_own_items"] = (nprec / (nprec + 1 / tau2)).ravel()
    res.attrs.update(sigma2=sigma2, tau2=tau2, prior_r2=fit.rsquared, prior_params=fit.params.round(3).to_dict())
    return res.reset_index(), draws


def baselines(r: pd.DataFrame) -> pd.DataFrame:
    a = pd.read_csv(D / "races.csv")
    a = a[a.dem_vs_rep & a.dem_margin.notna()].copy()
    a["senate"] = (a.chamber == "S").astype(float)
    h = a.dropna(subset=["base_biden20", "base_prior_seat"]).copy()
    f = "dem_margin ~ base_biden20 + base_prior_seat + senate + senate:base_biden20 + senate:base_prior_seat"
    pred = pd.Series(np.nan, index=h.index)
    for st in h.state.unique():
        tr = h[h.state != st]
        pred[h.state == st] = smf.ols(f, data=tr).fit().predict(h[h.state == st])
    h["base_hist"] = pred
    h["over_hist"] = h.dem_margin - pred
    full_fit = smf.ols(f, data=h).fit()
    out = r[["race_id"]].merge(h[["race_id", "base_hist", "over_hist"]], on="race_id", how="left")
    g = r.set_index("race_id")
    out["base_gov26"] = out.race_id.map(g.gov_dem_margin.where(g.chamber == "S"))
    out["over_gov26"] = out.race_id.map(g.dem_margin) - out.base_gov26
    out.attrs.update(hist_r2=full_fit.rsquared, hist_n=int(full_fit.nobs),
                     hist_loso_rmse=float(np.sqrt(np.nanmean(h.over_hist ** 2))))
    return out


BASES = {
    "harris24": ("over_harris24", "base_harris24", "Harris 2024"),
    "biden20": ("over_biden20", "base_biden20", "Biden 2020"),
    "prior_seat": ("over_prior_seat", "base_prior_seat", "Prior race for the seat"),
    "midterm22": ("over_midterm22", "base_midterm22", "2022 midterm"),
    "hist": ("over_hist", "base_hist", "Expected margin from history, no Harris"),
    "house26": ("over_house26", "base_house26", "2026 House vote, same ballot (Senate)"),
    "gov26": ("over_gov26", "base_gov26", "2026 governor, same ballot (Senate)"),
}
CODINGS = {"c_index10": "Raw progressive index (unsourced = 0)", "c_stated10": "Sourced items only",
           "c_fe10": "Item-adjusted, sourced items only", "c_eb10": "Coverage-corrected (empirical Bayes)",
           "a_moderate": "Third Way 'moderate' label", "b_estab": "Establishment-backed"}


def effects(r: pd.DataFrame, draws: np.ndarray, rng) -> pd.DataFrame:
    rows = []
    for bk, (y, lean, blab) in BASES.items():
        scopes = ["S"] if bk in ("house26", "gov26") else ["P", "S", "H"]
        for scope in scopes:
            df = r if scope == "P" else r[r.chamber == scope]
            for cod, clab in CODINGS.items():
                rhs = [cod, lean, "net_out_pv"] + (["senate"] if scope == "P" else [])
                base = {"baseline": bk, "baseline_label": blab, "scope": scope, "coding": cod, "coding_label": clab}
                if cod == "c_eb10":
                    x = df.dropna(subset=[y, lean, "net_out_pv"])
                    if len(x) <= len(rhs) + 2:
                        continue
                    idx = r.index.get_indexer(x.index)
                    ests, vars_ = [], []
                    f = f"{y} ~ " + " + ".join(rhs)
                    for k in range(0, M, 4):  # 500 draws for the outcome stage
                        x = x.assign(c_eb10=draws[idx, k] * 10)
                        mfit = _cluster_fit(f, x)
                        ests.append(mfit.params[cod])
                        vars_.append(mfit.bse[cod] ** 2)
                    ests, vars_ = np.array(ests), np.array(vars_)
                    qbar, W, Bv = ests.mean(), vars_.mean(), ests.var(ddof=1)
                    T = W + (1 + 1 / len(ests)) * Bv
                    G = x.state.nunique()
                    from scipy import stats
                    t = stats.t.ppf(0.975, max(G - 1, 1))
                    rows.append({**base, "n": len(x), "clusters": G, "coef": qbar, "ci_lo": qbar - t * np.sqrt(T),
                                 "ci_hi": qbar + t * np.sqrt(T), "frac_missing_info": (1 + 1 / len(ests)) * Bv / T,
                                 "method": "Rubin, 500 posterior draws, CR1 by state"})
                    continue
                x = df.dropna(subset=[y, *rhs])
                if x[cod].nunique() < 2 or len(x) <= len(rhs) + 2:
                    continue
                f = f"{y} ~ " + " + ".join(rhs)
                with np.errstate(all="ignore"):
                    mfit = _cluster_fit(f, x)
                    w = wild_ci(f, x, [cod], rng)[cod]
                rows.append({**base, "n": int(mfit.nobs), "clusters": int(x.state.nunique()), "coef": mfit.params[cod],
                             "ci_lo": w[0], "ci_hi": w[1], "method": "wild cluster bootstrap by state"})
    return pd.DataFrame(rows)


def main() -> None:
    np.seterr(all="ignore")  # macOS Accelerate raises spurious matmul warnings; finiteness asserted below
    rng = np.random.default_rng(SEED)
    r = load()
    r = r[r.c_index.notna()].reset_index(drop=True)
    meas = measurement(r)
    eb, draws = empirical_bayes(meas, prior_frame(r), rng)
    attrs = {**meas.attrs, **eb.attrs}
    eb = eb.merge(r[["race_id", "c_index", "c_stated", "c_n_sourced"]], on="race_id")
    eb.attrs.update(attrs)
    bl = baselines(r)
    r = r.merge(bl, on="race_id", how="left")
    order = r.race_id.tolist()
    ebi = eb.set_index("race_id").reindex(order)
    draws = draws[[list(eb.race_id).index(rid) for rid in order]]
    r["c_index10"] = r.c_index * 10
    r["c_stated10"] = r.c_stated * 10
    r["c_fe10"] = ebi.theta_fe.to_numpy() * 10
    r["c_eb10"] = ebi.eb_mean.to_numpy() * 10
    assert np.isfinite(draws).all() and np.isfinite(r.c_eb10).all(), "non-finite EB draws"
    ef = effects(r, draws, rng)
    eb.to_csv(D / "debias_measurement.csv", index=False)
    ef.to_csv(D / "debias_effects.csv", index=False)
    bl.to_csv(D / "baselines_nonharris.csv", index=False)
    names = r.set_index("race_id").dem_last
    meas_rows = eb.assign(name=eb.race_id.map(names))[["race_id", "name", "n_sourced", "c_index", "c_stated", "theta_fe", "eb_mean", "eb_sd", "weight_on_own_items"]]
    import json
    (D / "exhibits_debias.json").write_text(json.dumps({
        "measurement": json.loads(meas_rows.round(4).to_json(orient="records")),
        "effects": json.loads(ef.round(4).to_json(orient="records")),
        "stats": {"sigma2": eb.attrs["sigma2"], "tau2": eb.attrs["tau2"], "prior_r2": eb.attrs["prior_r2"],
                  "hist_r2": bl.attrs["hist_r2"], "hist_n": bl.attrs["hist_n"], "hist_loso_rmse": bl.attrs["hist_loso_rmse"],
                  "corr_cov": {c: float(np.corrcoef(eb[c][eb[c].notna()], eb.c_n_sourced[eb[c].notna()])[0, 1])
                               for c in ["c_index", "c_stated", "theta_fe", "eb_mean"]}},
    }))
    pd.set_option("display.width", 220)
    print("sigma2", round(eb.attrs["sigma2"], 3), "tau2", round(eb.attrs["tau2"], 3), "prior R2", round(eb.attrs["prior_r2"], 3))
    print("prior params", eb.attrs["prior_params"])
    print("item effects", eb.attrs["item_effects"])
    print("hist baseline: R2", round(bl.attrs["hist_r2"], 3), "n", bl.attrs["hist_n"], "LOSO RMSE", round(bl.attrs["hist_loso_rmse"], 2))
    for c in ["c_index", "c_stated", "theta_fe", "eb_mean"]:
        ok = eb[c].notna()
        print(f"corr({c}, n_sourced) = {np.corrcoef(eb[c][ok], eb.c_n_sourced[ok])[0,1]:.2f}  (n {ok.sum()})")
    print(eb.sort_values("eb_mean", ascending=False)[["race_id", "n_sourced", "c_index", "c_stated", "theta_fe", "eb_mean", "eb_sd", "weight_on_own_items"]].round(3).to_string())
    print(ef[["baseline", "scope", "coding", "n", "coef", "ci_lo", "ci_hi"]].round(2).to_string())


if __name__ == "__main__":
    main()
