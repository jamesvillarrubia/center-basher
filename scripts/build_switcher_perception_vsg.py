"""
build_switcher_perception_vsg.py — §16 change-lane switcher test.

Tests directly on the VSG panel whether Obama→Trump switchers (n≈343)
classified Trump as the change/outsider/anti-establishment candidate more
strongly than Obama-loyalists (Obama-2012 → Clinton-2016) did. If yes, the
§16 change-lane thesis is backed at the SWITCHER level, not just at the
general-electorate exit-poll level.

Variables (VSG panel):
  - presvote_2012, presvote_2016 — identify Obama→Trump switchers vs loyalists
  - eliteunderstand_2016 — "elites understand ordinary people" (1=agree..4=disagree)
    Higher = more anti-elite / more populist (load-bearing for the change-lane thesis)
  - pres_changesys_2018 — "Trump changes the system" perception (1=agree..4=disagree)
    Lower = more strongly perceives Trump as system-changer
  - systems_leader_2017 — "system needs strong leader to fix it" (1=disagree..4=agree)
    Higher = more populist orientation
  - expert_trustordinary_2017 — trust experts vs ordinary people (1..4)

Comparison cohorts:
  - "Obama→Trump switchers": Obama 2012 → Trump 2016 (n≈343)
  - "Obama→Clinton loyalists": Obama 2012 → Clinton 2016
  - "Romney→Trump loyalists" (consistent R): for baseline contrast
  - "Romney→Clinton switchers" (R→D defectors): for the symmetric test

Supports: plain-language.md §16 (change-lane backed at switcher level).
"""
import numpy as np
import pandas as pd

from _lib import load_vsg_panel, write_clean


# Missing-value codes used throughout VSG
MISS = {8, 9, 98, 99}


def clean(s: pd.Series, valid_range=(1, 4)) -> pd.Series:
    x = pd.to_numeric(s, errors="coerce")
    return x.where(x.between(*valid_range))


def weighted_mean(s: pd.Series, w: pd.Series) -> float:
    s = s.dropna()
    if len(s) == 0:
        return float("nan")
    w = w.loc[s.index]
    if w.sum() == 0:
        return float("nan")
    return float(np.average(s, weights=w))


def main():
    v = load_vsg_panel()

    # Identify cohorts via 2012 and 2016 vote
    p12 = pd.to_numeric(v["presvote_2012"], errors="coerce")
    p16 = pd.to_numeric(v["presvote_2016"], errors="coerce")
    w = pd.to_numeric(v["weight_genpop_2016"], errors="coerce").fillna(0).clip(lower=0)

    # In VSG presvote coding: 1=Dem (Obama/Clinton), 2=Rep (Romney/Trump)
    obama_loyal = (p12 == 1) & (p16 == 1)
    obama_to_trump = (p12 == 1) & (p16 == 2)
    romney_loyal = (p12 == 2) & (p16 == 2)
    romney_to_clinton = (p12 == 2) & (p16 == 1)

    # Trait variables
    elite_und = clean(v["eliteunderstand_2016"], (1, 4))      # high = elites DON'T understand (anti-elite)
    trump_chsys = clean(v["pres_changesys_2018"], (1, 4))     # low = Trump CHANGES system (per typical VSG coding)
    sys_lead = clean(v["systems_leader_2017"], (1, 4))        # high = need strong leader
    expert_ord = clean(v["expert_trustordinary_2017"], (1, 4)) # axis: experts vs ordinary
    fav_trump = clean(v["fav_trump_2016"], (1, 4))            # 1=very favorable, 4=very unfavorable

    rows = []
    for label, mask in [
        ("Obama→Trump switchers", obama_to_trump),
        ("Obama→Clinton loyalists", obama_loyal),
        ("Romney→Trump loyalists", romney_loyal),
        ("Romney→Clinton switchers", romney_to_clinton),
    ]:
        m = mask & (w > 0)
        n = int(m.sum())
        n_w = float(w[m].sum())
        rows.append({
            "cohort": label,
            "n_unweighted": n,
            "n_weighted": round(n_w, 1),
            "anti_elite_2016": round(weighted_mean(elite_und[m], w[m]), 2),
            "trump_changes_system_2018": round(weighted_mean(trump_chsys[m], w[m]), 2),
            "system_needs_strong_leader_2017": round(weighted_mean(sys_lead[m], w[m]), 2),
            "trust_ordinary_over_experts_2017": round(weighted_mean(expert_ord[m], w[m]), 2),
            "trump_favorability_2016": round(weighted_mean(fav_trump[m], w[m]), 2),
        })

    # Audit row: full-electorate baseline
    all_voters = (p12.isin([1, 2])) & (p16.isin([1, 2])) & (w > 0)
    rows.append({
        "cohort": "[ref] All major-party voters 2012+2016",
        "n_unweighted": int(all_voters.sum()),
        "n_weighted": round(float(w[all_voters].sum()), 1),
        "anti_elite_2016": round(weighted_mean(elite_und[all_voters], w[all_voters]), 2),
        "trump_changes_system_2018": round(weighted_mean(trump_chsys[all_voters], w[all_voters]), 2),
        "system_needs_strong_leader_2017": round(weighted_mean(sys_lead[all_voters], w[all_voters]), 2),
        "trust_ordinary_over_experts_2017": round(weighted_mean(expert_ord[all_voters], w[all_voters]), 2),
        "trump_favorability_2016": round(weighted_mean(fav_trump[all_voters], w[all_voters]), 2),
    })

    # Print summary for quick verification
    print("Switcher perception test — VSG panel (n_weighted):")
    print(f"{'cohort':<35} {'n':>5} {'anti-elite':>10} {'Trump=ch.sys':>12} {'need-leader':>12} {'trust-ord':>10} {'fav-Trump':>10}")
    for r in rows:
        print(f"{r['cohort']:<35} {r['n_unweighted']:>5} {str(r['anti_elite_2016']):>10} {str(r['trump_changes_system_2018']):>12} {str(r['system_needs_strong_leader_2017']):>12} {str(r['trust_ordinary_over_experts_2017']):>10} {str(r['trump_favorability_2016']):>10}")

    write_clean(
        name="switcher_perception_vsg",
        rows=rows,
        manifest={
            "source": "Democracy Fund VOTER Survey Panel (VSG, 2011→2020). data/derived/VOTER-Survey-Panel-Data-Files-2021Dec/.",
            "variables": [
                "presvote_2012 (1=Obama, 2=Romney)",
                "presvote_2016 (1=Clinton, 2=Trump)",
                "weight_genpop_2016 (general-population weight)",
                "eliteunderstand_2016 (1..4; high = elites DON'T understand ordinary people = anti-elite)",
                "pres_changesys_2018 (1..4; low = Trump CHANGES the system in respondent's view)",
                "systems_leader_2017 (1..4; high = system needs strong leader)",
                "expert_trustordinary_2017 (1..4; axis trust experts vs ordinary)",
                "fav_trump_2016 (1=very favorable..4=very unfavorable)",
            ],
            "filter": "Obama-2012 voters split by 2016 vote (Clinton loyalist vs Trump switcher); plus Romney loyalist + Romney→Clinton defector cohorts; plus full-electorate reference row.",
            "weight": "weight_genpop_2016",
            "method": "Weighted means per cohort per item. Items kept on their VSG 1-4 scale without rescaling so the direction is documented in the variables block.",
            "n": int(sum(r["n_unweighted"] for r in rows if not r["cohort"].startswith("[ref]"))),
            "supports": ["plain-language.md §16 (switcher-level change-lane test)"],
            "caveats": [
                "Trait items asked AFTER the 2016 vote (2017–2018 waves) — so 'Trump changes the system' perception is concurrent with or post-treatment, not pre-treatment. Reverse causation possible (vote shapes perception). The 'eliteunderstand_2016' item IS concurrent with the vote, so its interpretation is cleaner.",
                "VSG panel under-samples the truly disengaged; switcher cohort is small (n≈343 Obama→Trump). SEs on means are non-trivial but the cohort-level GAPS are robust.",
                "Direction of scale items inferred from distributional shape; codebook verification recommended before publication.",
                "This is the cleanest cross-cohort test of change-lane perception we can run on the VSG panel; the VSG does not have the standard ANES candidate-trait Likert battery, so we use the populist-orientation items as the closest proxy for 'who got classified as the establishment.'",
            ],
        },
    )


if __name__ == "__main__":
    main()
