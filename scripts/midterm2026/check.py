"""Checks that pin the dataset to its sources. Prints "N passed, M failed".

Run after build_endorser_lists.py, build_house_primaries.py, build_races.py, analyze.py.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT, wiki_wikitext  # noqa: E402
from _ie import ie  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
results: list[tuple[bool, str]] = []


def check(ok: bool, msg: str) -> None:
    results.append((bool(ok), msg))


def near(a: float, b: float, tol: float) -> bool:
    return a == a and abs(a - b) <= tol


r = pd.read_csv(D / "races.csv")
S = r[r.chamber == "S"].set_index("state")
H = r[r.chamber == "H"].set_index("race_id")
hall = pd.read_csv(D / "house_all.csv").set_index("race_id")
summary = json.loads((D / "summary.json").read_text())

# Third Way, "Moderates Made Democratic Majorities" (Nov 4 2026): vs Harris, vs House Dems.
tw = {"TX": (26, 6), "SC": (22, 7), "KS": (21, 7), "IA": (17, 3), "OH": (16, 2), "GA": (20, 6), "NC": (23, 5)}
for st, (vh, vhouse) in tw.items():
    check(near(S.loc[st, "over_vs_harris"], vh, 1.0), f"TW {st} vs Harris {vh}: got {S.loc[st, 'over_vs_harris']:.1f}")
    check(near(S.loc[st, "over_vs_house_statewide"], vhouse, 1.0),
          f"TW {st} vs House {vhouse}: got {S.loc[st, 'over_vs_house_statewide']:.1f}")
for st, v in {"MI": -2, "MN": -3, "ME": -10}.items():
    check(near(S.loc[st, "over_vs_house_statewide"], v, 1.0), f"TW {st} vs House {v}: got {S.loc[st, 'over_vs_house_statewide']:.1f}")
for st, v in {"MI": 4, "MN": 3, "ME": 11, "FL": 2}.items():
    gap = S.loc[st, "gov_dem_margin"] - S.loc[st, "dem_margin"]
    check(near(gap, v, 1.0), f"TW governor-minus-Senate {st} {v}: got {gap:.1f}")
leftier_mean = S.loc[["MI", "MN", "ME"], "over_vs_harris"].mean()
check(near(leftier_mean, 5, 1.0), f"TW leftier mean vs Harris ~5: got {leftier_mean:.1f}")
mod_mean = S.loc[list(tw), "over_vs_harris"].mean()
check(near(mod_mean, 21, 1.0), f"TW moderate mean vs Harris ~21: got {mod_mean:.1f}")

# Third Way, "Center-Left Democrats Overperformed..." (Nov 5 2026): House examples.
for rid, v in {"TX-15": 43, "PA-08": 17, "NC-11": 25}.items():
    check(near(hall.loc[rid, "over_vs_harris"], v, 1.0), f"TW {rid} vs Harris {v}: got {hall.loc[rid, 'over_vs_harris']:.1f}")
check(near(hall.loc["TX-15", "harris_margin"], -18, 0.5), "TX-15 is Trump+18 in Downballot")
check(summary["house_flips"]["n_mod_endorsed"] == 31, f"moderate-endorsed flips = 31 (TW): got {summary['house_flips']['n_mod_endorsed']}")

# Statewide House vote: CNN sum vs Wikipedia infobox (Texas page).
w = wiki_wikitext("2026_United_States_House_of_Representatives_elections_in_Texas")
d_pct = float(re.search(r"percentage2 = '''([\d.]+)%", w).group(1))
r_pct = float(re.search(r"percentage1 = ([\d.]+)%", w).group(1))
check(near(S.loc["TX", "house_statewide_margin"], d_pct - r_pct, 0.6),
      f"TX House margin CNN {S.loc['TX', 'house_statewide_margin']:.2f} vs Wikipedia {d_pct - r_pct:.2f}")

# FEC independent expenditures.
d = ie()
check(d.amt.max() < 1e8, "no IE line item >= $100M after junk filter")
udp_mi = d[(d.spe_id == "C00799031") & (d.can_office == "S") & (d.can_office_state == "MI")]
check(near(udp_mi.amt.sum() / 1e6, 31.47, 1.6),
      f"UDP Michigan Senate total ~ $31.47M (Responsible Statecraft): got ${udp_mi.amt.sum() / 1e6:.2f}M")
check(S.loc["MI", "aipac_prim_against_nominee"] > 30e6, "AIPAC-network primary money against El-Sayed > $30M")

# Dataset integrity.
an = r[r.dem_vs_rep & r.dem_last.notna() & ((r.chamber == "H") | r.competitive)]
check(an.over_vs_harris.notna().all(), "every analysis row has over_vs_harris")
check(an.harris_margin.notna().all(), "every analysis row has harris_margin")
check(an.b_anointed_strict.notna().all(), "every analysis row has coding b")
check(an.b_source.notna().all(), "every analysis row has a coding-b source note")
check(len(an[an.chamber == "S"]) == 14, f"14 competitive Senate rows with a D-vs-R contest: got {len(an[an.chamber == 'S'])}")
check(S.loc["AK", "house_statewide_margin"] != S.loc["AK", "house_statewide_margin"], "AK House baseline nulled (independent outpolled D)")

# Controls: starting recognition and time on the trail (build_controls.py).
from datetime import date  # noqa: E402
from _primary_dates import table as ncsl  # noqa: E402

nc = ncsl()
check(nc["TX"]["primary"] == date(2026, 3, 3) and nc["KS"]["primary"] == date(2026, 8, 4)
      and nc["IL"]["primary"] == date(2026, 3, 17), "NCSL primary dates: TX Mar 3, KS Aug 4, IL Mar 17")
check(nc["NH"]["primary"] == date(2026, 9, 8), "NCSL NH primary Sep 8 matches Shaheen article ('September 8, 2026')")
check(an.prior_office.isin([0, 1, 2, 3]).all(), "prior_office coded 0-3 for every analysis row")
check(an.prior_office_note.notna().all() and an.nominee_wiki.str.startswith("https://en.wikipedia.org/wiki/").all(),
      "every analysis row has a prior-office note and a source link")
check(an.wiki_revid_nominee.notna().all(), "every nominee source article has a revision id")
check(an.fame_flag.isin([0, 1]).all() and (an.fame_flag == 1).eq(an.fame_note.fillna("").str.len() > 0).all(),
      "fame_flag is 0/1 and every flagged row has a note")
po = an.set_index("race_id").prior_office
check(po["GA-S"] == 3 and po["NC-S"] == 3 and po["OH-S"] == 3 and po["TX-S"] == 1 and po["KS-S"] == 0
      and po["SC-S"] == 0 and po["IA-S"] == 1, "prior office: Ossoff/Cooper/Brown 3, Talarico/Turek 1, Hamilton/Andrews 0")
check(an.set_index("race_id").late_replacement["ME-S"] == 1
      and an.set_index("race_id").launch_date["ME-S"] == "2026-07-25", "Jackson flagged late replacement, launch 2026-07-25")
check(an.days_primary_to_general.notna().all(), "every analysis row has days_primary_to_general")
ok_dates = an.days_on_trail.dropna()
check(len(ok_dates) == 0 or ((ok_dates > 0) & (ok_dates < 2200)).all(), "days_on_trail in (0, 2200) where present")
check(((an.pageviews_12m_pre_launch >= 0) | an.pageviews_12m_pre_launch.isna()).all(), "pageviews non-negative")
lv = an.launch_vs_announce_days.dropna()
check(len(lv) == 0 or (lv.abs() <= 120).mean() >= 0.75,
      f"FEC Form 2 within 120 days of the announcement for >=75% of day-precision rows: {(lv.abs() <= 120).mean() if len(lv) else 'n/a'}")
reg = pd.read_csv(D / "regressions.csv")
for ch in ["S", "H"]:
    for term in ["a_moderate", "b_estab"]:
        have = set(reg[(reg.chamber == ch) & (reg.term == term)].spec)
        check({"base", "+controls"} <= have, f"{ch} {term}: base and +controls specs present")

# Pooled Senate + House models (pooled.py).
import numpy as np  # noqa: E402
from pooled import _cluster_fit, cr1, design, load  # noqa: E402

pool = reg[reg.chamber == "P"]
for coding in ["a_moderate", "b_estab"]:
    for spec in ["base", "+controls"]:
        row = pool[(pool.term == coding) & (pool.spec == spec) & (pool["sample"] == "all")]
        check(len(row) == 1 and row.ci_wild_lo.notna().all() and row.ci_lo.notna().all(),
              f"pooled {coding} {spec}: one row with cluster and wild-bootstrap CIs")
pr = load()
nb = pool[(pool.term == "b_estab") & (pool.spec == "base") & (pool["sample"] == "all")].iloc[0]
check(nb.n == 44 and nb.n_senate == 14 and nb.clusters == pr.state.nunique() == 28,
      f"pooled coding b base: n 44, 14 Senate, 28 state clusters (got {nb.n}, {nb.n_senate}, {nb.clusters})")
na = pool[(pool.term == "a_moderate") & (pool.spec == "base") & (pool["sample"] == "all")].iloc[0]
check(na.n == 41 and na.n_senate == 11, f"pooled coding a base: n 41 (AK, MS, NH uncoded), got {na.n}")
for f, x in [("over_vs_harris ~ b_estab + senate + harris_margin + net_out_pv", pr.dropna(subset=["net_out_pv"])),
             ("over_vs_harris ~ a_moderate + senate + harris_margin + net_out_pv + prior_office + trail100"
              " + a_moderate:senate + net_out_pv:senate + harris_margin:senate + prior_office:senate + trail100:senate",
              pr.dropna(subset=["a_moderate", "net_out_pv", "prior_office", "trail100"]))]:
    with np.errstate(all="ignore"):
        X, yv, _ = design(f, x)
        g_, G_ = pd.factorize(x.state)[0], x.state.nunique()
        bb = np.linalg.solve(X.T @ X, X.T @ yv)
        se_np = np.sqrt(np.diag(cr1(X, (yv - X @ bb)[:, None], g_, G_)[0]))
    m_ = _cluster_fit(f, x)
    check(np.abs(se_np - m_.bse.values).max() < 1e-10 and np.abs(bb - m_.params.values).max() < 1e-10,
          "numpy CR1 used by the wild bootstrap matches statsmodels cluster SEs")
jt = pd.read_csv(D / "pooled_joint_tests.csv")
check(len(jt) == 8 and jt.p_wild_wcr.between(0, 1).all() and (jt.boot_draws == 9999).all(),
      "8 joint interaction tests (2 codings x 2 specs x 2 restriction sets) with WCR bootstrap p-values (B = 9,999)")
rob = pool[pool.term.isin(["a_moderate", "b_estab"]) & (pool["sample"] != "all")]
check(set(rob["sample"]) == {"drop House <90% counted", "drop FL (Nixon)"} and len(rob) == 8,
      "robustness rows: 2 samples x 2 codings x 2 specs")
check((pool[(pool["sample"] == "drop FL (Nixon)")].n_senate.max()
       == pool[(pool["sample"] == "all") & (pool.term == "b_estab") & (pool.spec == "base")].n_senate.iloc[0] - 1),
      "drop-FL sample has one fewer Senate row")

# Alternative baselines (build_baselines.py, baselines_analysis.py).
bl = pd.read_csv(D / "baselines.csv").set_index("race_id")
an_i = an.set_index("race_id")
check(np.allclose(bl.base_harris24, an_i.harris_margin.reindex(bl.index)), "base_harris24 equals harris_margin")
check(np.allclose(bl.over_harris24, an_i.over_vs_harris.reindex(bl.index)), "over_harris24 equals over_vs_harris")
check(near(bl.base_prior_seat["GA-S"], 1.2, 0.2), "GA prior seat = Jan 2021 runoff, Ossoff +1.2")
check(near(bl.base_prior_seat["FL-S"], 41.3 - 57.7, 0.6),
      "FL prior seat = 2022 Rubio-Demings (about -16.4)")
check(near(bl.base_prior_seat["OH-S"], 46.9 - 53.0, 0.3), "OH prior seat = 2022 Vance-Ryan (about -6.1)")
check(near(bl.base_biden20["GA-S"], 0.2, 0.2) and near(bl.base_biden20["TX-S"], -5.6, 0.3), "Biden 2020 state margins: GA +0.2, TX -5.6")
check(set(bl.index[bl.base_biden20.isna()]) == {"FL-20", "FL-24", "FL-25", "TN-09", "TX-34", "UT-01"},
      "Biden 2020 missing only for the six districts redrawn for 2026 with no 2020 figure")
check(bool(bl.redrawn_2024_2026[["FL-20", "TX-34", "UT-01", "TN-09"]].all()) and not bool(bl.redrawn_2024_2026[["NY-17", "PA-07"]].any()),
      "redrawn_2024_2026 flags TX-34/UT-01/FL-20/TN-09, not NY-17/PA-07")
check(bool(bl.redrawn_2022_2024["GA-13"]), "GA-13 flagged redrawn between 2022 and 2024 (Georgia's 2023 map)")
check(set(bl.index[bl.base_midterm22.isna() & bl.index.str.endswith("-S")]) == {"AK-S", "ME-S", "MI-S", "MN-S", "MS-S", "TX-S"},
      "2022 midterm Senate baseline missing for AK (no D in top two) and ME, MI, MN, MS, TX (no race)")
check(bool(bl.prior_seat_same_dem["GA-S"]) and bool(bl.prior_seat_same_rep[["KS-S", "ME-S", "MS-S"]].all()),
      "contamination flags: Ossoff's own 2020 race; Marshall, Collins, Hyde-Smith rematches")
env = pd.read_csv(D / "national_environment.csv", index_col=0).iloc[:, 0]
check(near(env["pres20"], 4.45, 0.2) and near(env["pres24"], -1.5, 0.2), f"national presidential margins 2020 {env['pres20']:.2f}, 2024 {env['pres24']:.2f}")
br = pd.read_csv(D / "baseline_regressions.csv")
h24 = br[(br.baseline == "harris24") & ~br.swing_adjusted & (br.coding == "a") & (br.scope == "S") & (br.spec == "base")].iloc[0]
orig = reg[(reg.chamber == "S") & (reg.term == "a_moderate") & (reg.spec == "base") & (reg.coding == "a: Third Way moderate")
           & (reg.y == "over_vs_harris")].iloc[0]
check(near(h24.coef, orig.coef, 1e-6), "baseline module reproduces the original Senate coding-(a) coefficient under Harris 2024")
for b_ in ["biden20", "pres2cyc", "midterm22"]:
    q = br[(br.baseline == b_) & (br.coding == "b") & (br.scope == "H") & (br.spec == "base")]
    check(len(q) == 2 and near(q.coef.iloc[0], q.coef.iloc[1], 1e-6),
          f"{b_}: swing adjustment leaves the single-cycle House coefficient unchanged")
sens = pd.read_csv(D / "baseline_sensitivity.csv")
check(len(sens) >= 30 and {"a_senate", "b_senate", "a_house", "b_house", "b_pooled"} <= set(sens.columns),
      "baseline_sensitivity.csv has the five coefficient columns")

# ANOVA variance breakdown (anova.py).
at = pd.read_csv(D / "anova_tables.csv")
ap = pd.read_csv(D / "anova_permutation.csv")
ae = pd.read_csv(D / "anova_effect_sizes.csv")
add = at[at.model == "additive"]
t2, t3 = add[add.typ == 2].copy(), add[add.typ == 3].copy()
t3["term"] = t3.term.str.replace(r"C\((\w+), Sum\)", r"\1", regex=True)
mm = t2.merge(t3, on=["baseline", "coding", "spec", "term"], suffixes=("2", "3"))
check(len(mm) > 0 and (mm.sum_sq2 - mm.sum_sq3).abs().max() < 1e-6,
      "additive models: Type II and Type III (sum-to-zero) sums of squares agree")
shares = t2.groupby(["baseline", "coding", "spec"]).share_of_total_ss.sum()
check(((shares - 1).abs() < 1e-6).all(), "additive Type II: term shares + shared + residual sum to 1 of total SS")
r0 = t2[(t2.baseline == "harris24") & (t2.coding == "b") & (t2.spec == "base") & (t2.term == "b_estab")].iloc[0]
res = t2[(t2.baseline == "harris24") & (t2.coding == "b") & (t2.spec == "base") & (t2.term == "Residual")].iloc[0]
check(near(r0.partial_eta2, r0.sum_sq / (r0.sum_sq + res.sum_sq), 1e-9), "partial eta^2 = SS / (SS + SS_resid)")
pf = ap[(ap.baseline == "harris24") & (ap.coding == "b") & (ap.spec == "base") & (ap.model == "additive") & (ap.term == "coding")].iloc[0]
check(near(pf.F_obs, r0.F, 1e-6), "permutation statistic equals the anova_lm Type II F for coding")
check(ap.p_perm_block.between(1 / 10000, 1).all() and ap.p_perm_strata.between(1 / 10000, 1).all()
      and (ap.n_perm == 9999).all(), "permutation p-values in [1/10000, 1], 9,999 permutations")
ix = ap[(ap.baseline == "harris24") & (ap.coding == "a") & (ap.model == "ancova2") & (ap.term == "coding:senate")].iloc[0]
check(ix.p_perm_block < 0.05 and ix.p_classic < 0.01, "coding (a) x chamber: classic and block-permutation p < 0.05 (Harris 2024)")
check((ap.distinct_block_relabelings >= 1).all(), "distinct block relabelings recorded for every permutation test")
check(len(ae) == 12 and (ae.boot_valid >= 9900).all() and (ae.eta2_ci_lo <= ae.partial_eta2).all(),
      "12 coding effect-size rows with >= 9,900 valid state-cluster bootstrap draws")

# Coding (c): stated progressive positions (build_positions.py, coding_c.py).
pos = pd.read_csv(D / "positions" / "positions_final.csv")
pix = pd.read_csv(D / "positions_index.csv").set_index("race_id")
check(len(pix) == 44 and set(pix.index) == set(an.race_id), "positions_index covers the 44 analysis nominees")
recomputed = pos[pos.race_id != "THIRDWAY"].groupby("race_id").score.mean()
check(np.allclose(pix.c_index, recomputed.reindex(pix.index)), "c_index = mean of the 13 item scores")
check(near(pix.thirdway_index.iloc[0], -0.346, 0.001), "Third Way's own index = -0.346")
check(near(pix.c_index["TX-S"], 0.5, 1e-9) and pix.c_n_sourced["TX-S"] == 7, "Talarico: index 0.50 on 7 sourced items")
check(int((pix.c_n_sourced >= 3).sum()) == 24, "24 nominees have 3+ sourced items (after the campaign-site pass)")
check(near(pix.c_median_cut.iloc[0], 0.1538, 0.001) and (pix.c_prog_median == (pix.c_index >= pix.c_median_cut)).all(),
      "median cut 0.154 and c_prog_median consistent")
check(pix.c_stated.isna().sum() == int((pix.c_n_sourced == 0).sum()), "stated-only index blank exactly where no item is sourced")
changed = pix.index[(pix.c_index_noind - pix.c_index).abs() > 1e-12]
check(set(changed) <= set(pix.index[pix.c_items_indirect > 0]), "drop-indirect index differs only for nominees with indirect items")
check(int(pos.indirect.astype(str).str.lower().eq("true").sum()) == 7, "7 item rows flagged indirect")
cr = pd.read_csv(D / "coding_c_regressions.csv")
six = ["a_moderate", "b_estab", "c_index10", "c_stated10", "c_prog_median", "c_prog_03"]
hb = cr[(cr.baseline == "harris24") & (cr.spec == "base") & cr.coding_var.isin(six)]
check(hb.groupby("coding_var").scope.nunique().ge(3).all() and hb.coding_var.nunique() == 6,
      "coding (c) grid: 6 codings x 3 scopes under Harris 2024 base")
a_s = hb[(hb.coding_var == "a_moderate") & (hb.scope == "S")].iloc[0]
check(near(a_s.coef, 12.35, 0.01), "coding (c) grid reproduces the Senate coding (a) coefficient")
tal = pd.read_csv(D / "coding_c_talarico_vs_thirdway.csv")
check(int(tal.disagree.sum()) == 9 and int(tal.opposite_sign.sum()) == 2, "Talarico vs Third Way: 9 items differ, 2 opposite sign")
cp = pd.read_csv(D / "coding_c_anova_permutation.csv")
check(cp.p_classic.notna().all() and cp.p_perm_block.between(1e-4, 1).all() and (cp.n_perm == 9999).all(),
      "coding (c) permutation table: classic p merged, 9,999 permutations")

fc = pd.read_csv(D / "factors_correlations.csv")
check(len(fc) == 30 and fc.groupby("outcome").size().eq(15).all(), "factor correlations: 15 factors x 2 outcomes")
r_ci = fc[(fc.outcome == "over_vs_harris") & (fc.factor == "c_index")].iloc[0]
check(r_ci.n == 44 and near(r_ci.r, np.corrcoef(an.c_index, an.over_vs_harris)[0, 1], 1e-3),
      "factor correlations: progressive index r recomputes from races.csv")
check(((fc.ci_lo <= fc.r) & (fc.r <= fc.ci_hi)).all(), "factor correlations: every r sits inside its bootstrap CI")
fa = pd.read_csv(D / "factors_anova.csv")
full = fa[(fa.outcome == "over_vs_harris") & (fa.model == "full")]
check(full.n.iloc[0] == 44 and len(full) == 11, "factor ANOVA: full model has 10 terms + residual on 44 races")
check(near(full.r2.iloc[0], 1 - full[full.term == "Residual"].share_of_total.iloc[0], 0.02),
      "factor ANOVA: R2 consistent with residual share (Type II, near-orthogonal)")
fw = pd.read_csv(D / "factors_wave.csv")
hw = fw[fw["sample"] == "All Dem-vs-Rep House races"].iloc[0]
check(hw.n == 417 and hw.n_ahead_of_harris == 412 and near(hw["mean"], 14.42, 0.01),
      "wave: 412 of 417 House Democrats ran ahead of Harris, mean +14.42 (matches summary.json)")

dm = pd.read_csv(D / "debias_measurement.csv")
check(len(dm) == 44 and dm.eb_mean.notna().all() and dm.eb_sd.gt(0).all(), "debias: corrected index and sd for all 44 nominees")
check(int(dm.n_sourced.sum()) == 144, "debias: 144 of 572 nominee-item cells sourced (after the campaign-site pass)")
de = pd.read_csv(D / "debias_effects.csv")
check(set(de.baseline) == {"harris24", "biden20", "prior_seat", "midterm22", "hist", "house26", "gov26"}, "debias: seven baselines")
eh = de[(de.baseline == "harris24") & (de.scope == "P") & (de.coding == "c_index10")].iloc[0]
cr2 = pd.read_csv(D / "coding_c_regressions.csv")
cr2 = cr2[(cr2.baseline == "harris24") & (cr2.spec == "base") & (cr2.scope == "P") & (cr2.coding_var == "c_index10")].iloc[0]
check(near(eh.coef, cr2.coef, 0.01), "debias: raw-index pooled Harris coefficient matches coding_c_regressions")
rs2 = pd.read_csv(D / "positions" / "reconciled_sites.csv")
check(len(rs2) == 22 and rs2.source_url.notna().all() and rs2.quote.notna().all(), "sites pass: 22 reconciled non-zero cells, each with URL and quote")
bn = pd.read_csv(D / "baselines_nonharris.csv")
check(int(bn.over_hist.notna().sum()) == 38, "history baseline (no Harris) covers 38 races")

import json as _json
sj = _json.loads((D / "exhibits_selection.json").read_text())
check(sj["house_all_n"] == 417 and near(sj["house_all_mean"], 14.42, 0.01), "selection: 417 House races, mean +14.42")
nd = sj["lists"]["NewDem or WelcomePAC"]
check(nd["n"] == 54 and nd["behind"] == 10 and nd["called_loss"] == 6 and near(nd["mean_over"], 14.37, 0.01), "selection: 54 NewDem/Welcome nominees, 10 lost or trail on Nov 6 calls (6 called), mean +14.37")
sr = pd.DataFrame(sj["senate_red"])
g = sr.groupby("group").over_vs_harris.agg(["mean", "size"])
check(len(sr) == 19 and g.loc["claimed moderate", "size"] == 7 and g.loc["not claimed", "size"] == 10
      and near(g.loc["claimed moderate", "mean"], 20.84, 0.01) and near(g.loc["not claimed", "mean"], 18.67, 0.01),
      "selection: 19 red-state Senate Democrats, claimed 7 at +20.84, unclaimed 10 at +18.67")
check(sj["flips"]["n"] == 48 and sj["flips"]["mod_endorsed_n"] == 30 and near(sj["flips"]["other_mean"], 18.57, 0.01), "selection: 48 flips called or leading on Nov 6, 30 moderate-backed, others +18.57")
rs = pd.read_csv(D / "race_status_20261106.csv").set_index("race_id").status
check(rs["AK-S"] == "leading D" and rs["MS-S"] == "leading D", "status: Peltola and Colom lead uncalled counts on Nov 6")
check(near(sj["label_share"]["share"], 0.0054, 0.0005) and sj["label_share"]["n"] == 41, "selection: Third Way label explains 0.5% across 41 races")
hd = pd.read_csv(D / "house_drivers_anova.csv")
st = hd[(hd["sample"] == "all") & (hd.term == "C(state)")].iloc[0]
check(st.n == 417 and near(st.share_of_total, 0.392, 0.005), "house drivers: state explains 39.2% of House differences")
du = pd.read_csv(D / "house_drivers_duel.csv").set_index("sample")
check(du.loc["all", "n"] == 195 and near(du.loc["all", "prog_minus_mod"], -0.13, 0.01) and du.loc["all", "ci_hi"] < 2.2 and du.loc["all", "ci_lo"] > -2.5,
      "head-to-head: progressive minus moderate -0.13 (CI -2.41 to 2.14), 195 races")
check(near(du.loc["counted >= 90%", "prog_minus_mod"], -2.17, 0.01) and du.loc["counted >= 90%", "ci_hi"] > 0,
      "head-to-head, >=90% counted: -2.17, CI crosses zero")

fm = pd.read_csv(D / "funding_models.csv")
hm = fm[(fm.term == "progressive minus moderate") & (fm.model == "head-to-head + relative money, sources, super PACs")].iloc[0]
check(hm.n == 189 and abs(hm.coef) < 0.1 and hm.ci_lo < -2 and hm.ci_hi > 2, "funding: head-to-head with money held constant stays near 0 (n 189)")
fb = pd.read_csv(D / "funding_by_side.csv").set_index("affiliation")
check(near(fb.loc["moderate", "median_total"], 3.04e6, 2e4) and near(fb.loc["progressive", "median_total"], 1.62e6, 2e4),
      "funding: median raised $3.04M moderate-backed vs $1.62M progressive-backed")
hf = pd.read_csv(D / "house_funding.csv")
check(hf.dem_fec_id.notna().sum() >= 420, "funding: Democratic nominees matched to FEC for at least 420 of 436 CNN House rows")

passed = sum(ok for ok, _ in results)
for ok, msg in results:
    print(("PASS " if ok else "FAIL ") + msg)
print(f"{passed} passed, {len(results) - passed} failed")
sys.exit(0 if passed == len(results) else 1)
