"""
build_switcher_cohort_chart.py — convert the existing VSG switcher
cohort CSV to a chart-ready JSON for §17 Figure A.

Headline: the 0.77-point gap between Obama→Trump switchers and
Obama→Clinton loyalists on the VSG "trust ordinary people over experts"
item (1-4, lower = trust ordinary). This is the cohort that flipped
WI/MI/PA in 2016.

Source: data/clean/switcher_perception_vsg.csv (built upstream by
scripts/build_switcher_perception_vsg.py).
"""
import csv
import json


def main():
    rows = list(csv.DictReader(open("data/clean/switcher_perception_vsg.csv")))

    # Color and ordering by populist-orientation (lower=more anti-elite)
    order = [
        ("Romney→Trump loyalists",       "rep-pop"),
        ("Obama→Trump switchers",        "switch-pop"),
        ("[ref] All major-party voters 2012+2016", "all"),
        ("Romney→Clinton switchers",     "switch-est"),
        ("Obama→Clinton loyalists",      "dem-est"),
    ]

    cohorts = []
    for cohort_name, tag in order:
        row = next(r for r in rows if r["cohort"] == cohort_name)
        cohorts.append({
            "name": cohort_name,
            "tag":  tag,
            "n_unweighted":  int(row["n_unweighted"]),
            "n_weighted":    float(row["n_weighted"]),
            "trust_ordinary_over_experts_2017": float(row["trust_ordinary_over_experts_2017"]),
            "anti_elite_2016":                  float(row["anti_elite_2016"]),
            "trump_changes_system_2018":        float(row["trump_changes_system_2018"]),
            "system_needs_strong_leader_2017":  float(row["system_needs_strong_leader_2017"]),
        })

    payload = {
        "source": (
            "Democracy Fund VOTER Survey Panel (VSG), n=8,034 panelists tracked 2011-2020. "
            "Subset: Obama-2012 + Romney-2012 voters split by 2016 vote. "
            "Item: 'When it comes to important national issues, do you tend to trust the opinions "
            "of ordinary people more, or do you tend to trust the opinions of experts more?' "
            "(VSG 2017 wave, 1-4 scale, LOWER = trust ordinary side)."
        ),
        "headline": "Obama→Trump switchers scored 0.77 closer to 'trust ordinary over experts' than Obama→Clinton loyalists.",
        "cohorts": cohorts,
    }

    with open("data/clean/switcher_cohort_vsg.json", "w") as f:
        json.dump(payload, f, indent=2)
    print("Wrote data/clean/switcher_cohort_vsg.json")
    for c in cohorts:
        print(f"  {c['name']:<45} n={c['n_unweighted']:>5}  trust_ordinary={c['trust_ordinary_over_experts_2017']:.2f}")


if __name__ == "__main__":
    main()
