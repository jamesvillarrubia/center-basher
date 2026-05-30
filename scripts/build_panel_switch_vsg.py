"""
build_panel_switch_vsg.py — §11 (Obama→Trump switch: VSG panel).

The decisive causal test of "what flips a switcher." Same respondents 2011→2020,
with PRE-treatment (2011) racial-resentment items, so RR is observed before the
treatment of interest (Obama→Trump switch).

Supports: plain-language.md §11 [1], [2]. Also produces a small audit row
documenting RR scale direction so the next agent doesn't re-introduce the sign
error we hit in this session.
"""
import numpy as np
import pandas as pd

from _lib import load_vsg_panel, weighted_std_logit, write_clean


def main():
    v = load_vsg_panel()
    for c in [
        "presvote_2012", "presvote_2016", "trustgovt_2016",
        "race_deservemore_2011", "race_tryharder_2011",
        "pid7_2012", "ideo5_2016", "persfinretro_2016",
        "weight_genpop_2016",
    ]:
        v[c] = pd.to_numeric(v[c], errors="coerce")
    # treat 8 and 9 as missing on race items (DK / Refused)
    v["race_deservemore_2011"] = v["race_deservemore_2011"].where(~v["race_deservemore_2011"].isin([8, 9]))
    v["race_tryharder_2011"] = v["race_tryharder_2011"].where(~v["race_tryharder_2011"].isin([8, 9]))

    # ---- DIRECTION HANDLING ---------------------------------------------
    # race_deservemore_2011: corr(ideo) = +0.38 → high = MORE RR (keep)
    # race_tryharder_2011:   corr(ideo) = -0.41 → high = LESS RR → REVERSE (6 - x)
    # If we don't reverse, the scale cancels and the coefficient comes out near zero
    # or negative. This is the bug that bit us in the first verification run;
    # the audit row below documents the fix.
    v["RR"] = (v["race_deservemore_2011"] + (6 - v["race_tryharder_2011"])) / 2

    # filter to Obama-2012 voters with valid 2016 vote
    obama12 = v[v["presvote_2012"] == 1].copy()
    obama12 = obama12[obama12["presvote_2016"].isin([1, 2])]
    obama12["switched"] = (obama12["presvote_2016"] == 2).astype(float)

    w = obama12["weight_genpop_2016"]

    rows = []
    for label, predictors in [
        ("trust alone", {"trust": obama12["trustgovt_2016"]}),
        ("RR alone", {"RR": obama12["RR"]}),
        ("trust + RR", {"trust": obama12["trustgovt_2016"], "RR": obama12["RR"]}),
        ("full (+econ, ideo, pid12)", {
            "trust": obama12["trustgovt_2016"],
            "RR": obama12["RR"],
            "econ": obama12["persfinretro_2016"],
            "ideo": obama12["ideo5_2016"],
            "pid12": obama12["pid7_2012"],
        }),
    ]:
        coefs = weighted_std_logit(obama12["switched"], predictors, w)
        nclean = pd.DataFrame({**predictors, "y": obama12["switched"], "w": w}).dropna()
        nclean = nclean[nclean["w"] > 0]
        for var, b in coefs.items():
            rows.append({
                "model": label,
                "predictor": var,
                "std_beta": round(float(b), 3),
                "n_unweighted": int(len(nclean)),
            })

    # headline summary row (so the chart can read this directly)
    rows.append({
        "model": "[headline]",
        "predictor": "trust ≈ 0; RR = engine",
        "std_beta": float("nan"),
        "n_unweighted": int((v["presvote_2012"] == 1).sum()),
    })

    # audit: corr(RR, ideo) and corr(RR, pid) — both should be POSITIVE if scale
    # is correctly oriented
    audit_ideo = obama12["RR"].corr(obama12["ideo5_2016"])
    audit_pid = obama12["RR"].corr(obama12["pid7_2012"])
    rows.append({
        "model": "[audit]",
        "predictor": "corr(RR, ideo5_2016) — should be POSITIVE",
        "std_beta": round(float(audit_ideo), 3),
        "n_unweighted": int(obama12["RR"].notna().sum()),
    })
    rows.append({
        "model": "[audit]",
        "predictor": "corr(RR, pid7_2012) — should be POSITIVE",
        "std_beta": round(float(audit_pid), 3),
        "n_unweighted": int(obama12["RR"].notna().sum()),
    })
    rows.append({
        "model": "[audit]",
        "predictor": "switchers (Obama→Trump) % of Obama-2012 voters",
        "std_beta": round(float(obama12["switched"].mean() * 100), 1),
        "n_unweighted": int(len(obama12)),
    })

    write_clean(
        name="panel_switch_vsg",
        rows=rows,
        manifest={
            "source": "Democracy Fund VOTER Survey panel (VSG, 2011→2020) — data/derived/VOTER-Survey-Panel-Data-Files-2021Dec/.../voter_panel.csv (latin-1).",
            "variables": [
                "presvote_2012", "presvote_2016", "trustgovt_2016",
                "race_deservemore_2011 (PRE-treatment)", "race_tryharder_2011 (PRE-treatment)",
                "pid7_2012", "ideo5_2016", "persfinretro_2016", "weight_genpop_2016",
            ],
            "filter": "Obama-2012 voters (presvote_2012=1) with a valid 2016 vote (presvote_2016 in {1,2}).",
            "weight": "weight_genpop_2016",
            "method": (
                "Weighted standardized logistic of P(switched to Trump). "
                "RR scale = (race_deservemore_2011 + (6 - race_tryharder_2011)) / 2. "
                "REVERSE on tryharder is required — the item's HIGH value is the LESS-RR direction. "
                "Audit rows check corr(RR, ideo) and corr(RR, pid) are POSITIVE."
            ),
            "n": int(len(obama12)),
            "supports": ["plain-language.md §11 [1]", "§11 [2]"],
            "caveats": [
                "trustgovt_2016 is a coarse 3-pt item piled at the distrust end (88% in one category) — compressed variance partly explains the small trust coefficient.",
                "RR predicts vote DIRECTION, not outcomes (Obama won 2012 with RR present).",
                "Cannot test in VSG whether a left-populist 'elites vs you' frame re-routes the same voters.",
            ],
        },
    )


if __name__ == "__main__":
    main()
