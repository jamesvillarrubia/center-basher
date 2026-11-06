"""Step 4e: coding (c) (stated progressive positions) next to codings (a) and (b) ->
data/derived/midterm2026/{coding_c_regressions.csv, coding_c_crosstab.csv,
coding_c_thirdway_moderates.csv, coding_c_talarico_vs_thirdway.csv, coding_c_anova.csv,
coding_c_anova_permutation.csv, coding_c_effect_sizes.csv}, summary.json["coding_c"].
Run after anova.py.

Coding (c) enters as:
  c_index10      progressive index x 10, so the coefficient is points per +0.1 index
  c_stated10     stated-only index x 10 (nominees with at least one sourced item)
  c_prog_median  1 if index >= sample median (0.154)
  c_prog_03      1 if index >= 0.3
Models, inference and samples follow baselines_analysis.py (OLS, wild cluster bootstrap-t
CIs by state, 9,999 draws) and anova.py (Type II shares, state-block permutation).
Specs: base; +controls (prior office, days on trail); +coverage (base + c_n_sourced);
restricted (base, nominees with 3+ sourced items).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from anova import boot_effect, fit_tables, perm_tests  # noqa: E402
from baselines_analysis import run  # noqa: E402
from pooled import load  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
SEED = 20261105
CODINGS = {"a_moderate": "a: Third Way moderate", "b_estab": "b: establishment-backed",
           "c_index10": "c: progressive index (per +0.1)", "c_stated10": "c: stated-only index (per +0.1)",
           "c_prog_median": "c: index >= median", "c_prog_03": "c: index >= 0.3"}
BASELINES = ["harris24", "biden20", "pres2cyc", "prior_seat", "midterm22", "house26"]


def frame() -> pd.DataFrame:
    r = load()
    for suf in ["", "_noind", "_preprim"]:
        r[f"c_index10{suf}"] = r[f"c_index{suf}"] * 10
        r[f"c_stated10{suf}"] = r[f"c_stated{suf}"] * 10
    return r


def grid(r: pd.DataFrame, rng) -> pd.DataFrame:
    rows = []
    specs = {"base": ([], None), "+controls": (["prior_office", "trail100"], None),
             "+coverage": (["c_n_sourced"], None), "restricted 3+ sourced": ([], 3)}
    for b in BASELINES:
        y, lean = f"over_{b}", f"base_{b}"
        for cod, label in CODINGS.items():
            if b != "harris24" and cod not in ("a_moderate", "b_estab", "c_index10"):
                continue
            for spec, (extra, minsrc) in specs.items():
                if b != "harris24" and spec != "base":
                    continue
                for scope in ["S", "H", "P"]:
                    if b == "house26" and scope != "S":
                        continue
                    df = r if scope == "P" else r[r.chamber == scope]
                    if minsrc:
                        df = df[df.c_n_sourced >= minsrc]
                    res = run(df, y, lean, cod, extra, scope, rng)
                    rows.append({"baseline": b, "coding": label, "coding_var": cod, "spec": spec, "scope": scope,
                                 **(res or {"n": 0, "note": "too few rows or no variation"})})
    # robustness: coding (c) on the reduced item sets, Harris 2024, base
    for suf, lab in [("_noind", "drop indirect items"), ("_preprim", "pre-primary items only")]:
        for cod in ["c_index10", "c_stated10", "c_prog_median"]:
            for scope in ["S", "H", "P"]:
                df = r if scope == "P" else r[r.chamber == scope]
                res = run(df, "over_harris24", "base_harris24", f"{cod}{suf}", [], scope, rng)
                rows.append({"baseline": "harris24", "coding": f"{CODINGS[cod]} [{lab}]", "coding_var": f"{cod}{suf}",
                             "spec": "base", "scope": scope, **(res or {"n": 0, "note": "too few rows or no variation"})})
    return pd.DataFrame(rows)


def anova_block(rng) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    tables, perms, effects = [], [], []
    for b in ["harris24", "pres2cyc", "prior_seat"]:
        r = frame()
        r["y"], r["terrain"] = r[f"over_{b}"], r[f"base_{b}"]
        for cod in ["c_index10", "c_prog_median"]:
            for spec, extra in {"base": [], "+controls": ["prior_office", "trail100"]}.items():
                x = r.dropna(subset=["y", "terrain", cod, "net_out_pv", *extra]).copy()
                meta = {"baseline": b, "coding": cod, "spec": spec}
                tables += fit_tables(x, cod, extra, meta)
                for model in (["additive", "ancova2"] if not extra else ["additive"]):
                    for p in perm_tests(x, cod, extra, model, rng):
                        perms.append({**meta, "model": model, **p})
                t2 = [t for t in tables if t["baseline"] == b and t["coding"] == cod and t["spec"] == spec
                      and t["model"] == "additive" and t["typ"] == 2 and t["term"] == cod][0]
                effects.append({**meta, "n": len(x), "clusters": x.state.nunique(),
                                "partial_eta2": t2["partial_eta2"], "partial_omega2": t2["partial_omega2"],
                                "share_of_total_ss": t2["share_of_total_ss"], "F": t2["F"], "p_classic": t2["p_classic"],
                                **boot_effect(x, cod, extra, rng)})
    return pd.DataFrame(tables), pd.DataFrame(perms), pd.DataFrame(effects)


def main() -> None:
    rng = np.random.default_rng(SEED)
    r = frame()
    g = grid(r, rng)
    g.to_csv(D / "coding_c_regressions.csv", index=False)

    # Cross-tabs of (c) against (a) and (b)
    ct = []
    for ch in ["S", "H", "all"]:
        x = r if ch == "all" else r[r.chamber == ch]
        for col, lab in [("coding_a_thirdway", "a"), ("b_anointed_strict", "b")]:
            for k, grp in x.groupby(col):
                ct.append({"chamber": ch, "coding": lab, "group": str(k), "n": len(grp),
                           "mean_c_index": grp.c_index.mean(), "median_c_index": grp.c_index.median(),
                           "share_at_or_above_median": grp.c_prog_median.mean(),
                           "mean_c_n_sourced": grp.c_n_sourced.mean()})
    ct = pd.DataFrame(ct)
    ct.to_csv(D / "coding_c_crosstab.csv", index=False)
    corr = {ch: {"a_vs_c": float((x := (r if ch == "all" else r[r.chamber == ch])).a_moderate.corr(x.c_index, method="spearman")),
                 "b_vs_c": float(x.b_estab.corr(x.c_index, method="spearman")),
                 "n_sourced_vs_c": float(x.c_n_sourced.corr(x.c_index, method="spearman"))} for ch in ["S", "H", "all"]}

    # Third Way's moderates with their coding (c) index and the Third Way gap
    mods = r[r.coding_a_thirdway == "moderate"][["race_id", "chamber", "dem_last", "b_anointed_strict", "c_index",
                                                 "c_stated", "c_n_sourced", "c_tw_gap", "over_vs_harris"]]
    mods = mods.sort_values(["chamber", "c_index"], ascending=[False, False])
    mods.to_csv(D / "coding_c_thirdway_moderates.csv", index=False)

    # Talarico vs Third Way, item by item
    p = pd.read_csv(D / "positions" / "positions_final.csv")
    items = {1: "Medicare for All", 2: "Billionaire / wealth tax", 3: "No corporate PAC money",
             4: "No AIPAC / conditions on Israel aid", 5: "Green New Deal", 6: "Federal minimum wage >= $17",
             7: "End the filibuster", 8: "Supreme Court expansion", 9: "Student debt / free college",
             10: "Break up big tech / anti-monopoly", 11: "No crypto PAC money", 12: "Universal childcare / pre-K",
             13: "Oppose Schumer / Jeffries"}
    t = p[p.race_id == "TX-S"].set_index("item")
    w = p[p.race_id == "THIRDWAY"].set_index("item")
    tal = pd.DataFrame({"item": list(items), "item_name": list(items.values()),
                        "talarico": t.score.reindex(list(items)).values, "thirdway": w.score.reindex(list(items)).values,
                        "talarico_source": t.source_url.reindex(list(items)).values,
                        "talarico_quote": t.quote.reindex(list(items)).values,
                        "talarico_pre_primary": t.pre_primary.reindex(list(items)).values,
                        "thirdway_source": w.source_url.reindex(list(items)).values})
    tal["disagree"] = (tal.talarico != tal.thirdway) & ((tal.talarico != 0) | (tal.thirdway != 0))
    tal["opposite_sign"] = np.sign(tal.talarico) * np.sign(tal.thirdway) < 0
    tal.to_csv(D / "coding_c_talarico_vs_thirdway.csv", index=False)

    tables, perms, effects = anova_block(rng)
    tables.to_csv(D / "coding_c_anova.csv", index=False)
    cl = tables[tables.typ == 2][["baseline", "coding", "spec", "model", "term", "p_classic"]].copy()
    cl["term"] = cl.apply(lambda q: "coding:senate" if q.term == f"{q.coding}:senate"
                          else ("coding" if q.term == q.coding else q.term), axis=1)
    perms = perms.merge(cl, on=["baseline", "coding", "spec", "model", "term"], how="left")
    perms.to_csv(D / "coding_c_anova_permutation.csv", index=False)
    effects.to_csv(D / "coding_c_effect_sizes.csv", index=False)

    s = json.loads((D / "summary.json").read_text())
    s["coding_c"] = {
        "spearman": corr,
        "median_cut": float(r.c_median_cut.iloc[0]),
        "thirdway_index": float(r.thirdway_index.iloc[0]),
        "talarico": {"c_index": float(r.set_index("race_id").c_index["TX-S"]),
                     "items_disagree_with_thirdway": int(tal.disagree.sum()),
                     "items_opposite_sign": int(tal.opposite_sign.sum())},
        "coverage": {"n_3plus": int((r.c_n_sourced >= 3).sum()), "n_0_1": int((r.c_n_sourced <= 1).sum()),
                     "n_with_any": int((r.c_n_sourced >= 1).sum())},
    }
    (D / "summary.json").write_text(json.dumps(s, indent=2, default=float))
    pd.set_option("display.width", 250)
    h = g[(g.baseline == "harris24")]
    print(h[["coding", "spec", "scope", "n", "clusters", "coef", "ci_wild_lo", "ci_wild_hi"]].round(2).to_string())


if __name__ == "__main__":
    with np.errstate(all="ignore"):
        main()
