"""Step 4c: baseline sensitivity -> data/derived/midterm2026/{baseline_regressions.csv,
baseline_sensitivity.csv, seven_moderates_by_baseline.csv}, summary.json["baselines"].
Run after build_baselines.py and pooled.py.

For each baseline B (build_baselines.py) and each scope (Senate, House, pooled):
    over_B ~ coding + base_B + net_out_pv [+ senate] [+ prior_office + trail100]
base_B (the baseline's own margin) is the lean control, the analogue of Harris margin in
the original specs; for B = harris24 the model is the original one. OLS; CIs from the wild
cluster bootstrap-t of pooled.py (Rademacher per state, 9,999 draws, seed 20261105;
Senate-only models have one row per state, so this is a wild bootstrap), with
state-clustered CR1 CIs alongside.

Swing-adjusted outcomes subtract (national 2026 House margin - national margin of the
baseline's cycle). Within a scope where every row shares one cycle, the adjustment is a
constant and moves only the intercept; coefficients change only where cycles mix
(Senate prior-seat rows: 2020 and 2022; pooled prior-seat rows: 2020, 2022, 2024).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from pooled import _cluster_fit, load, wild_ci  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
SEED = 20261105
BASELINES = {
    "harris24": "Harris 2024",
    "biden20": "Biden 2020",
    "pres2cyc": "Mean of Harris 2024 and Biden 2020",
    "prior_seat": "Prior race for the seat (Senate 2020/22, House 2024)",
    "prior_seat_clean": "Prior race for the seat, excluding same-candidate rows",
    "midterm22": "2022 midterm (Senate or House)",
    "midterm22_clean": "2022 midterm, excluding same-candidate rows",
    "house26": "2026 statewide House vote (Senate only)",
}
CODINGS = {"a_moderate": "a", "b_estab": "b"}
SPECS = {"base": (), "+controls": ("prior_office", "trail100")}


def frame() -> pd.DataFrame:
    r = load()
    for b in ["prior_seat", "midterm22"]:
        clean = ~r[f"{b}_same_dem"].astype(bool)
        for suf in ["", "_adj"]:
            r[f"over_{b}_clean{suf}"] = r[f"over_{b}{suf}"].where(clean)
        r[f"base_{b}_clean"] = r[f"base_{b}"].where(clean)
    return r


def run(df, y, lean, dummy, extra, scope, rng):
    rhs = [dummy, lean, "net_out_pv", *extra] + (["senate"] if scope == "P" else [])
    x = df.dropna(subset=[y, *rhs])
    if x[dummy].nunique() < 2 or len(x) <= len(rhs) + 2:
        return None
    f = f"{y} ~ " + " + ".join(rhs)
    with np.errstate(all="ignore"):
        m = _cluster_fit(f, x)
        w = wild_ci(f, x, [dummy], rng)[dummy]
    ci = m.conf_int().loc[dummy]
    return {"n": int(m.nobs), "n_senate": int(x.senate.sum()), "clusters": int(x.state.nunique()),
            "n_coded_1": int(x[dummy].sum()), "coef": m.params[dummy], "ci_lo": ci[0], "ci_hi": ci[1],
            "ci_wild_lo": w[0], "ci_wild_hi": w[1], "p": m.pvalues[dummy]}


def main() -> None:
    rng = np.random.default_rng(SEED)
    r = frame()
    rows = []
    for bkey, blabel in BASELINES.items():
        root = bkey.replace("_clean", "")
        lean = f"base_{bkey}" if bkey.endswith("_clean") else f"base_{root}"
        for adj in ["", "_adj"]:
            y = f"over_{bkey}{adj}"
            for dummy, cl in CODINGS.items():
                for spec, extra in SPECS.items():
                    for scope in ["S", "H", "P"]:
                        df = r if scope == "P" else r[r.chamber == scope]
                        if bkey == "house26" and scope != "S":
                            continue
                        res = run(df, y, lean, dummy, extra, scope, rng)
                        rows.append({"baseline": bkey, "baseline_label": blabel,
                                     "swing_adjusted": adj == "_adj", "coding": cl, "spec": spec,
                                     "scope": scope, **(res or {"n": 0, "note": "too few rows or no variation"})})
    # Harris 2024 rerun on exactly the rows each other baseline can use, so a change
    # between baselines separates the baseline from the sample change.
    for bkey, blabel in BASELINES.items():
        if bkey == "harris24":
            continue
        for dummy, cl in CODINGS.items():
            for spec, extra in SPECS.items():
                for scope in ["S", "H", "P"]:
                    if bkey == "house26" and scope != "S":
                        continue
                    df = r if scope == "P" else r[r.chamber == scope]
                    df = df[df[f"over_{bkey}"].notna()]
                    res = run(df, "over_harris24", "base_harris24", dummy, extra, scope, rng)
                    rows.append({"baseline": f"harris24@{bkey}", "baseline_label": f"Harris 2024, rows of: {blabel}",
                                 "swing_adjusted": False, "coding": cl, "spec": spec, "scope": scope,
                                 **(res or {"n": 0, "note": "too few rows or no variation"})})
    out = pd.DataFrame(rows)
    out.to_csv(D / "baseline_regressions.csv", index=False)

    def cell(b, adj, cl, scope, spec="base"):
        q = out[(out.baseline == b) & (out.swing_adjusted == adj) & (out.coding == cl)
                & (out.scope == scope) & (out.spec == spec)]
        if q.empty or q.n.iloc[0] == 0:
            return "n/a"
        q = q.iloc[0]
        return f"{q.coef:+.1f} ({q.ci_wild_lo:+.1f} to {q.ci_wild_hi:+.1f}), n {q.n}"

    sens = []
    for spec in SPECS:
        for adj in [False, True]:
            for b in BASELINES:
                for key, lab in [(b, BASELINES[b])] + ([] if b == "harris24" or adj else
                                                        [(f"harris24@{b}", "  Harris 2024 on the same rows")]):
                    sens.append({"spec": spec, "swing_adjusted": adj, "baseline": lab,
                                 "a_senate": cell(key, adj, "a", "S", spec), "b_senate": cell(key, adj, "b", "S", spec),
                                 "a_house": cell(key, adj, "a", "H", spec), "b_house": cell(key, adj, "b", "H", spec),
                                 "b_pooled": cell(key, adj, "b", "P", spec)})
    sens = pd.DataFrame(sens)
    sens.to_csv(D / "baseline_sensitivity.csv", index=False)

    # Third Way's seven Senate moderates by baseline.
    seven = r[(r.chamber == "S") & r.state.isin(["TX", "SC", "KS", "IA", "GA", "NC", "OH"])].copy()
    seven["group"] = np.where(seven.b_estab == 1, "Schumer-backed", "not backed pre-primary")
    cols = ["over_harris24", "over_biden20", "over_pres2cyc", "over_prior_seat", "over_midterm22", "over_house26"]
    seven[["group", "state", "dem_last", *cols, "prior_seat_same_dem", "prior_seat_same_rep"]].sort_values(
        ["group", "state"]).to_csv(D / "seven_moderates_by_baseline.csv", index=False)
    s = json.loads((D / "summary.json").read_text())
    s["baselines"] = {
        "national_environment": pd.read_csv(D / "national_environment.csv", index_col=0).iloc[:, 0].round(3).to_dict(),
        "seven_group_means": {g: {c: (round(float(v.mean()), 2) if v.notna().any() else None)
                                  for c, v in grp[cols].items()} | {"n_by_col": {c: int(grp[c].notna().sum()) for c in cols}}
                              for g, grp in seven.groupby("group")},
        "missing": {c: r.loc[r[c].isna(), "race_id"].tolist()
                    for c in ["base_biden20", "base_prior_seat", "base_midterm22"]},
        "contaminated_prior_seat_same_dem": r.loc[r.prior_seat_same_dem.astype(bool), "race_id"].tolist(),
        "contaminated_midterm22_same_dem": r.loc[r.midterm22_same_dem.astype(bool), "race_id"].tolist(),
        "same_rep_prior_seat": r.loc[r.prior_seat_same_rep.astype(bool), "race_id"].tolist(),
    }
    (D / "summary.json").write_text(json.dumps(s, indent=2, default=float))
    pd.set_option("display.width", 260)
    print(sens.to_string())


if __name__ == "__main__":
    main()
