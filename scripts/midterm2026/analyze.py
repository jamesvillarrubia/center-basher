"""Step 4: regressions and summary numbers -> data/derived/midterm2026/{regressions.csv,summary.json}

Model (run once per chamber x coding):
    over_vs_harris ~ coding_dummy + net_outside_against_dem_gen_per_vote + harris_margin
OLS; 95% CIs from HC3 (small-sample heteroskedasticity-robust) standard errors.
Each race counts once (unweighted). Rows: Democratic nominee faced a Republican
(dem_vs_rep) and, for the Senate, Cook rated the race other than Solid on Nov 2 2026.
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


SPECS = {
    "base": (),
    "+controls": ("prior_office", "trail100"),
    "+prior_office": ("prior_office",),
    "+trail": ("trail100",),
    "+controls+fame": ("prior_office", "trail100", "fame_flag"),
}


def fit(df: pd.DataFrame, dummy: str, label: str, chamber: str, y: str = "over_vs_harris",
        controls: tuple[str, ...] = ("net_out_pv", "harris_margin"), spec: str = "base") -> list[dict]:
    cols = [y, dummy, *controls]
    x = df.dropna(subset=cols)
    out = []
    if x[dummy].nunique() < 2 or len(x) <= len(cols) + 1:
        return [{"chamber": chamber, "coding": label, "spec": spec, "y": y, "term": dummy, "n": len(x),
                 "note": "too few rows or no variation"}]
    ols = smf.ols(f"{y} ~ {' + '.join([dummy, *controls])}", data=x)
    m, cov = ols.fit(cov_type="HC3"), "HC3"
    if not np.all(np.isfinite(m.bse)):  # a leverage-1 point makes HC3 undefined
        m, cov = ols.fit(cov_type="HC1"), "HC1"
    ci = m.conf_int()
    for term in m.params.index:
        out.append({"chamber": chamber, "coding": label, "spec": spec, "y": y, "term": term, "n": int(m.nobs),
                    "n_coded_1": int(x[dummy].sum()), "coef": m.params[term], "se_hc3": m.bse[term],
                    "ci_lo": ci.loc[term, 0], "ci_hi": ci.loc[term, 1], "p": m.pvalues[term],
                    "r2": m.rsquared, "df_resid": int(m.df_resid), "cov": cov})
    return out


def fit_specs(df, dummy, label, chamber, y="over_vs_harris", controls=("net_out_pv", "harris_margin")):
    rows = []
    for spec, extra in SPECS.items():
        rows += fit(df, dummy, label, chamber, y=y, controls=tuple(controls) + extra, spec=spec)
    # Base model on exactly the rows the +controls model can use, so a change between
    # "base" and "+controls" separates the control's effect from the sample change.
    same = df.dropna(subset=list(SPECS["+controls"]))
    rows += fit(same, dummy, label, chamber, y=y, controls=tuple(controls), spec="base (+controls rows)")
    return rows


def main() -> None:
    r = pd.read_csv(D / "races.csv")
    r["net_out_pv"] = r.net_outside_against_dem_gen_per_vote
    r["a_moderate"] = (r.coding_a_thirdway == "moderate").astype(float).where(r.coding_a_thirdway.notna())
    r["b_estab"] = r.b_anointed_strict
    r["b_estab_soft"] = r.b_anointed_soft
    r["b_estab_modpac"] = r.b_anointed_incl_modpac
    r["b_estab_2of3"] = r.b_establishment_2of3.where(r.b_anointed_strict.notna())
    r["trail100"] = r.days_on_trail / 100 if "days_on_trail" in r else np.nan
    base = r[r.dem_vs_rep & r.dem_last.notna()]
    sen = base[(base.chamber == "S") & base.competitive]
    hou = base[base.chamber == "H"]
    rows: list[dict] = []
    for ch, df in [("S", sen), ("H", hou)]:
        for dummy, label in [("a_moderate", "a: Third Way moderate"),
                             ("b_estab", "b: establishment-backed pre-primary (strict)"),
                             ("b_estab_soft", "b: establishment-backed (soft)"),
                             ("b_estab_2of3", "b: establishment 2-of-3 markers"),
                             ("b_estab_modpac", "b: establishment-backed incl. Third Way-aligned PACs")]:
            rows += fit_specs(df, dummy, label, ch)
            rows += fit_specs(df, dummy, label + " [no money control]", ch, controls=("harris_margin",))
        if ch == "S":
            same = df[df.a_moderate.notna()]
            rows += fit_specs(same, "b_estab", "b: establishment-backed (strict) [same 11 races as a]", ch)
            rows += fit_specs(same, "b_estab", "b: establishment-backed (strict) [same 11 races as a]", ch,
                        y="over_vs_house_statewide", controls=("net_out_pv",))
            for dummy, label in [("a_moderate", "a: Third Way moderate"), ("b_estab", "b: establishment-backed pre-primary (strict)")]:
                rows += fit_specs(df, dummy, label, ch, y="over_vs_house_statewide", controls=("net_out_pv",))
        if ch == "H":
            for dummy, label in [("a_moderate", "a: Third Way moderate"), ("b_estab", "b: establishment-backed pre-primary (strict)")]:
                rows += fit_specs(df.assign(inc=df.dem_incumbent.astype(float)), dummy, label + " [+incumbent]", ch,
                            controls=("net_out_pv", "harris_margin", "inc"))
    reg = pd.DataFrame(rows)
    if "note" not in reg:
        reg["note"] = None
    reg.to_csv(D / "regressions.csv", index=False)

    # Terrain baseline: every Senate D-vs-R race, overperformance on Harris margin.
    allsen = base[base.chamber == "S"].copy()
    tm = smf.ols("over_vs_harris ~ harris_margin", data=allsen).fit(cov_type="HC3")
    allsen["terrain_resid"] = tm.resid
    hall = pd.read_csv(D / "house_all.csv")
    hall = hall[hall.dem_vs_rep]
    hm = smf.ols("over_vs_harris ~ harris_margin", data=hall).fit(cov_type="HC3")

    # House flips: moderate-PAC-endorsed nominee (NewDem Action Fund / Welcome lists,
    # or Wikipedia Welcome/NewDem/Blue Dog box) vs every other Democrat who flipped an R seat.
    sys.path.insert(0, str(Path(__file__).parent))
    from build_races import norm, surname
    el = pd.read_csv(D / "endorser_lists.csv")
    hp = pd.read_csv(D / "house_primaries.csv")
    mod_names = {(r_.state, int(r_.district), norm(surname(r_.name))) for r_ in el[el.group.isin(["newdem", "welcome"])].itertuples()}
    mod_names |= {(r_.state, int(r_.district), norm(surname(r_.candidate))) for r_ in
                  hp[(hp.e_welcome == 1) | (hp.e_newdem == 1) | (hp.e_bluedog == 1)].itertuples()}
    # Third Way's Nov 5 memo names three winners "cross endorsed by moderates and Our
    # Revolution": Sam Forstag, Bob Brooks, Brian Poindexter. Blue Dog PAC's list could not
    # be fetched, so these come from the memo text.
    mod_names |= {("MT", 1, "forstag"), ("PA", 7, "brooks"), ("OH", 7, "poindexter")}
    prog_names = {(r_.state, int(r_.district), norm(surname(r_.name))) for r_ in el[el.group == "justicedems"].itertuples()}
    pcols = [c for c in hp.columns if c in ("e_justicedems", "e_ourrev", "e_pccc", "e_cpc", "e_wfp", "e_dsa", "e_sanders", "e_aoc")]
    prog_names |= {(r_.state, int(r_.district), norm(surname(r_.candidate))) for r_ in hp[hp[pcols].max(axis=1) == 1].itertuples()}

    def key(r_):
        return (r_.state, int(r_.district), norm(surname(r_.dem_nominee)))

    hall["mod_endorsed"] = [key(r_) in mod_names for r_ in hall.itertuples()]
    hall["prog_endorsed"] = [key(r_) in prog_names for r_ in hall.itertuples()]
    flips = hall[(hall.incumbent_party_2025 == "R") & hall.dem_won].copy()
    flips.to_csv(D / "house_flips.csv", index=False)
    fm = smf.ols("over_vs_harris ~ mod_endorsed + harris_margin", data=flips.assign(mod_endorsed=flips.mod_endorsed.astype(float))).fit(cov_type="HC3")
    hall_m = smf.ols("over_vs_harris ~ mod_endorsed + harris_margin + dem_incumbent",
                     data=hall.assign(mod_endorsed=hall.mod_endorsed.astype(float), dem_incumbent=hall.dem_incumbent.astype(float))).fit(cov_type="HC3")
    f90 = flips[flips.pct_reporting >= 90]
    fm90 = smf.ols("over_vs_harris ~ mod_endorsed + harris_margin", data=f90.assign(mod_endorsed=f90.mod_endorsed.astype(float))).fit(cov_type="HC3")
    house_flip_summary = {
        "n_flips_ge90_reporting": int(len(f90)),
        "coef_mod_endorsed_ge90": round(fm90.params["mod_endorsed"], 2),
        "ci_ge90": [round(v, 2) for v in fm90.conf_int().loc["mod_endorsed"]],
        "n_flips": int(len(flips)), "n_mod_endorsed": int(flips.mod_endorsed.sum()),
        "mean_over_mod_endorsed": round(flips[flips.mod_endorsed].over_vs_harris.mean(), 2),
        "mean_over_other": round(flips[~flips.mod_endorsed].over_vs_harris.mean(), 2),
        "mean_over_prog_endorsed": round(flips[flips.prog_endorsed].over_vs_harris.mean(), 2),
        "n_prog_endorsed": int(flips.prog_endorsed.sum()),
        "coef_mod_endorsed_ctrl_harris": round(fm.params["mod_endorsed"], 2),
        "ci": [round(v, 2) for v in fm.conf_int().loc["mod_endorsed"]],
        "all_417_coef_mod_endorsed_ctrl_harris_inc": round(hall_m.params["mod_endorsed"], 2),
        "all_417_ci": [round(v, 2) for v in hall_m.conf_int().loc["mod_endorsed"]],
        "all_417_n_mod_endorsed": int(hall.mod_endorsed.sum()),
    }

    def mean_by(df, col):
        return {str(k): {"n": int(len(g)), "mean_over_vs_harris": round(g.over_vs_harris.mean(), 2)}
                for k, g in df.groupby(col)}

    summary = {
        "senate_all_dem_vs_rep": {"n": int(len(allsen)), "mean_over": round(allsen.over_vs_harris.mean(), 2),
                                  "slope_on_harris": round(tm.params["harris_margin"], 3),
                                  "slope_ci": [round(v, 3) for v in tm.conf_int().loc["harris_margin"]],
                                  "r2": round(tm.rsquared, 3)},
        "senate_noncompetitive_trump_states": {
            "n": int(((~allsen.competitive) & (allsen.harris_margin < 0)).sum()),
            "mean_over": round(allsen[(~allsen.competitive) & (allsen.harris_margin < 0)].over_vs_harris.mean(), 2),
            "races": allsen[(~allsen.competitive) & (allsen.harris_margin < 0)][["state", "dem_last", "over_vs_harris"]].round(1).values.tolist()},
        "senate_terrain_residuals": allsen[allsen.competitive][["state", "dem_last", "coding_a_thirdway", "b_anointed_strict", "over_vs_harris", "terrain_resid"]].round(2).values.tolist(),
        "senate_competitive_by_a": mean_by(sen[sen.coding_a_thirdway.notna()], "coding_a_thirdway"),
        "senate_competitive_by_b": mean_by(sen, "b_anointed_strict"),
        "senate_competitive_vs_house_by_a": {str(k): round(g.over_vs_house_statewide.mean(), 2) for k, g in sen.groupby("coding_a_thirdway")},
        "senate_competitive_vs_house_by_b": {str(k): round(g.over_vs_house_statewide.mean(), 2) for k, g in sen.groupby("b_anointed_strict")},
        "house_all_dem_vs_rep": {"n": int(len(hall)), "mean_over": round(hall.over_vs_harris.mean(), 2),
                                 "mean_over_trump_won": round(hall[hall.harris_margin < 0].over_vs_harris.mean(), 2),
                                 "n_trump_won": int((hall.harris_margin < 0).sum()),
                                 "mean_over_dem_flips": round(hall[(hall.incumbent_party_2025 == "R") & hall.dem_won].over_vs_harris.mean(), 2),
                                 "n_dem_flips": int(((hall.incumbent_party_2025 == "R") & hall.dem_won).sum()),
                                 "slope_on_harris": round(hm.params["harris_margin"], 3),
                                 "slope_ci": [round(v, 3) for v in hm.conf_int().loc["harris_margin"]]},
        "house_flips": house_flip_summary,
        "house_contested_by_a": mean_by(hou[hou.coding_a_thirdway.notna()], "coding_a_thirdway"),
        "house_contested_by_b": mean_by(hou[hou.b_anointed_strict.notna()], "b_anointed_strict"),
        "crosstab_a_b": {"senate": pd.crosstab(sen.coding_a_thirdway, sen.b_anointed_strict).to_dict(),
                         "house": pd.crosstab(hou.coding_a_thirdway, hou.b_anointed_strict).to_dict()},
    }
    def grp(df):
        return {"n": int(len(df)), "races": df.state.tolist(),
                "mean_over_vs_harris": round(df.over_vs_harris.mean(), 2),
                "mean_over_vs_house": round(df.over_vs_house_statewide.mean(), 2),
                "n_house_baseline": int(df.over_vs_house_statewide.notna().sum())}
    a_ = allsen
    summary["senate_groups"] = {
        "tw_moderate_estab_backed": grp(a_[(a_.coding_a_thirdway == "moderate") & (a_.b_anointed_strict == 1)]),
        "tw_moderate_not_backed": grp(a_[(a_.coding_a_thirdway == "moderate") & (a_.b_anointed_strict == 0)]),
        "tw_leftier_incl_FL": grp(a_[a_.coding_a_thirdway == "leftier"]),
        "tw_leftier_MI_MN_ME": grp(a_[a_.state.isin(["MI", "MN", "ME"])]),
        "noncompetitive_trump_won": grp(a_[(~a_.competitive) & (a_.harris_margin < 0)]),
        "noncompetitive_harris_won": grp(a_[(~a_.competitive) & (a_.harris_margin > 0)]),
        "competitive_uncoded_AK_MS_NH": grp(a_[a_.competitive & a_.coding_a_thirdway.isna()]),
    }
    an = pd.concat([sen, hou])
    money = {}
    for ch, df in an.groupby("chamber"):
        m = {}
        for g in ["aipac", "crypto", "ai"]:
            for ph in ["prim", "gen"]:
                for side in (["for_nominee", "against_nominee"] if ph == "prim" else ["for_dem", "against_dem"]):
                    col = f"{g}_{ph}_{side}"
                    m[col] = {"total_usd": round(float(df[col].sum())), "n_races_nonzero": int((df[col] > 0).sum()),
                              "races": df.loc[df[col] > 0, "race_id"].tolist()}
        m["nominees_won_despite_money_prim_against"] = df.loc[df.money_prim_against_nominee > 0, ["race_id", "dem_last", "money_prim_against_nominee", "dem_won"]].round(0).values.tolist()
        m["median_over_per_dollar_per_vote_by_a"] = {str(k): round(g_.over_per_dollar_per_vote.median(), 3) for k, g_ in df.groupby("coding_a_thirdway")}
        m["median_over_per_dollar_per_vote_by_b"] = {str(k): round(g_.over_per_dollar_per_vote.median(), 3) for k, g_ in df.groupby("b_anointed_strict")}
        m["median_receipts_per_vote_by_a"] = {str(k): round(g_.dollars_per_vote_receipts.median(), 2) for k, g_ in df.groupby("coding_a_thirdway")}
        money[ch] = m
    summary["money"] = money
    from _ie import ie
    d_ = ie()
    gt = {}
    for g_, x in d_[d_.group.notna()].groupby("group"):
        dem = x.cand_pty_aff.str.contains("DEM", na=False)
        gt[g_] = {"total_usd": round(float(x.amt.sum())),
                  "dem_primary_usd": round(float(x[dem & (x.ele_type == "P")].amt.sum())),
                  "dated_by_2026_07_21_usd": round(float(x[pd.to_datetime(x.dt, format="%d-%b-%y", errors="coerce") <= "2026-07-21"].amt.sum()))}
    summary["money_group_totals_cycle"] = gt
    # Overlap among incumbency, prior office, recognition and time on the trail.
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    import statsmodels.api as sm
    VARS = ["a_moderate", "b_estab", "incumbent", "prior_office", "fame_flag", "log_pageviews",
            "trail100", "days_primary_to_general", "harris_margin", "net_out_pv"]
    coll_rows, vif_rows = [], []
    for ch, df in [("S", sen), ("H", hou)]:
        z = df.assign(incumbent=df.dem_incumbent.astype(float),
                      log_pageviews=np.log10(df.pageviews_12m_pre_launch.astype(float) + 1))
        c = z[VARS].astype(float).corr()
        for i, v1 in enumerate(VARS):
            for v2 in VARS[i + 1:]:
                pair = z[[v1, v2]].dropna()
                coll_rows.append({"chamber": ch, "var1": v1, "var2": v2, "r": c.loc[v1, v2], "n": len(pair)})
        for coding in ["a_moderate", "b_estab"]:
            for design in (["prior_office", "trail100", "harris_margin", "net_out_pv"],
                           ["prior_office", "trail100", "incumbent", "harris_margin", "net_out_pv"],
                           ["prior_office", "trail100", "incumbent", "fame_flag", "log_pageviews", "harris_margin", "net_out_pv"]):
                X = z[[coding, *design]].dropna().astype(float)
                Xc = sm.add_constant(X)
                for k, v in enumerate(X.columns):
                    vif_rows.append({"chamber": ch, "coding": coding, "design": "+".join(design), "n": len(X),
                                     "term": v, "vif": variance_inflation_factor(Xc.values, k + 1)})
    pd.DataFrame(coll_rows).to_csv(D / "collinearity_corr.csv", index=False)
    pd.DataFrame(vif_rows).to_csv(D / "collinearity_vif.csv", index=False)

    # Third Way's seven Senate moderates: non-backed four vs Schumer-backed three.
    seven = sen[sen.state.isin(["TX", "SC", "KS", "IA", "GA", "NC", "OH"])].copy()
    seven["group"] = np.where(seven.b_anointed_strict == 1, "Schumer-backed", "not backed pre-primary")
    keep7 = ["group", "state", "dem_last", "dem_incumbent", "prior_office", "prior_office_note", "fame_flag",
             "fame_note", "pageviews_12m_pre_launch", "poll_name_id", "announce_date", "fec_f2_first_2026",
             "launch_date", "days_on_trail", "primary_date", "days_primary_to_general",
             "over_vs_harris", "over_vs_house_statewide"]
    seven[[c for c in keep7 if c in seven]].sort_values(["group", "state"]).to_csv(D / "seven_moderates.csv", index=False)
    summary["seven_moderates_group_means"] = {
        g: {k: (round(float(v.mean()), 2) if v.notna().any() else None)
            for k, v in grp[["prior_office", "fame_flag", "pageviews_12m_pre_launch", "days_on_trail",
                             "days_primary_to_general", "over_vs_harris", "over_vs_house_statewide"]].items()}
        for g, grp in seven.groupby("group")}
    summary["controls_missing"] = {
        ch: {c: int(df[c].isna().sum()) for c in ["prior_office", "days_on_trail", "poll_name_id",
                                                   "pageviews_12m_pre_launch", "days_primary_to_general"]}
        | {"n": int(len(df))} for ch, df in [("S", sen), ("H", hou)]}

    (D / "summary.json").write_text(json.dumps(summary, indent=2, default=float))
    show = reg[(reg.term.isin(["a_moderate", "b_estab", "b_estab_soft", "b_estab_2of3", "b_estab_modpac"]) | reg.note.notna())
               & reg.spec.isin(["base", "base (+controls rows)", "+controls"])]
    pd.set_option("display.width", 220)
    print(show[["chamber", "coding", "spec", "y", "n", "n_coded_1", "coef", "ci_lo", "ci_hi", "p"]].round(2).to_string())
    print(json.dumps({k: summary[k] for k in ["senate_all_dem_vs_rep", "senate_noncompetitive_trump_states", "house_all_dem_vs_rep", "house_flips", "senate_competitive_by_a", "senate_competitive_by_b", "senate_competitive_vs_house_by_a", "senate_competitive_vs_house_by_b", "house_contested_by_a", "house_contested_by_b", "crosstab_a_b"]}, default=float, indent=1))


if __name__ == "__main__":
    main()
