"""Selection checks: who Third Way counted, who it left out, and how our own samples were picked.

1. Senate, Trump-won states: every Democrat-vs-Republican Senate race Harris lost, with Third
   Way's label. Third Way claimed 7 winners as moderates; 10 red-state Democrats it did not claim
   (8 in races rated Solid R, plus Peltola and Colom, who lost competitive races).
2. House endorsement lists: every nominee on the NewDem Action Fund or WelcomePAC list, winners
   and losers. Third Way's memo counts only the winners ("flipped 29 Republican-held House seats")
   and says they "ran 15 points ahead of Harris's 2024 margin".
3. House flips: the 42 seats Democrats flipped, split by moderate-group endorsement.
4. Our samples: the 30 contested-primary House races against all 417 House races.

Outputs (data/derived/midterm2026/): selection_senate_red.csv, selection_house_lists.csv,
selection_samples.csv, exhibits_selection.json.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"


def main() -> None:
    r = pd.read_csv(D / "races.csv")
    h = pd.read_csv(D / "house_all.csv")
    h = h[h.dem_vs_rep == True].copy()  # noqa: E712

    s = r[(r.chamber == "S") & r.dem_vs_rep & (r.harris_margin < 0)].copy()
    s["group"] = np.select([s.coding_a_thirdway == "moderate", s.coding_a_thirdway == "leftier"],
                           ["claimed moderate", "called leftier"], "not claimed")
    s = s[["race_id", "state", "dem_last", "dem_won", "competitive", "group", "over_vs_harris", "harris_margin"]]
    s.to_csv(D / "selection_senate_red.csv", index=False)

    e = pd.read_csv(D / "endorser_lists.csv")
    e["race_id"] = e.state + "-" + e.district.astype(int).astype(str).str.zfill(2)
    x = e.merge(h[["race_id", "dem_nominee", "dem_won", "over_vs_harris", "rep_incumbent"]], on="race_id")
    x = x[x.apply(lambda z: z["name"].split()[-1].lower() in str(z.dem_nominee).lower(), axis=1)]
    mod = x[x.group.isin(["newdem", "welcome"])].drop_duplicates("race_id").assign(list="NewDem or WelcomePAC")
    jd = x[x.group == "justicedems"].drop_duplicates("race_id").assign(list="Justice Democrats")
    lists = pd.concat([mod, jd])[["list", "race_id", "dem_nominee", "dem_won", "over_vs_harris"]]
    lists.to_csv(D / "selection_house_lists.csv", index=False)

    f = pd.read_csv(D / "house_flips.csv")
    races30 = set(r[(r.chamber == "H") & r.dem_vs_rep].race_id)
    h["in30"] = h.race_id.isin(races30)
    h["seat"] = np.select([h.dem_incumbent, h.rep_incumbent], ["D incumbent", "R incumbent"], "open")
    samples = (h.groupby("in30").agg(n=("race_id", "size"), mean_over=("over_vs_harris", "mean"),
                                     median_harris=("harris_margin", "median"), share_won=("dem_won", "mean"),
                                     share_open=("seat", lambda v: (v == "open").mean()))
               .reset_index().assign(sample=lambda d: np.where(d.in30, "our 30 contested primaries", "other 387")))
    samples.to_csv(D / "selection_samples.csv", index=False)

    out = {
        "senate_red": json.loads(s.round(3).to_json(orient="records")),
        "house_all_mean": float(h.over_vs_harris.mean()),
        "house_all_n": int(len(h)),
        "lists": {lab: {"n": int(len(g)), "won": int(g.dem_won.sum()), "mean_over": float(g.over_vs_harris.mean()),
                        "losers_mean_over": float(g[~g.dem_won.astype(bool)].over_vs_harris.mean())
                        if (~g.dem_won.astype(bool)).any() else None}
                  for lab, g in lists.groupby("list")},
        "flips": {"n": int(len(f)), "mod_endorsed_n": int(f.mod_endorsed.sum()),
                  "mod_endorsed_mean": float(f[f.mod_endorsed == 1].over_vs_harris.mean()),
                  "other_mean": float(f[f.mod_endorsed != 1].over_vs_harris.mean())},
        "samples": json.loads(samples.round(3).to_json(orient="records")),
    }
    # Third Way label's share of the differences among the 41 races it labeled (Type II SS / total SS)
    import statsmodels.formula.api as smf
    from statsmodels.stats.anova import anova_lm
    a = r[r.dem_vs_rep & ((r.chamber == "H") | r.competitive)].dropna(subset=["coding_a_thirdway", "over_vs_harris"]).copy()
    a["mod"] = (a.coding_a_thirdway == "moderate").astype(float)
    a["senate"] = (a.chamber == "S").astype(float)
    tab = anova_lm(smf.ols("over_vs_harris ~ mod + senate + harris_margin", a).fit(), typ=2)
    out["label_share"] = {"n": int(len(a)), "share": float(tab.loc["mod", "sum_sq"] / ((a.over_vs_harris - a.over_vs_harris.mean()) ** 2).sum())}
    # terrain: median Harris margin by Third Way label, and Senate gap without Maine
    out["terrain_by_label"] = a.groupby("coding_a_thirdway").harris_margin.median().round(2).to_dict()
    sen = a[a.chamber == "S"]
    out["senate_gap_no_maine"] = float(sen[sen.coding_a_thirdway == "moderate"].over_vs_harris.mean()
                                       - sen[(sen.coding_a_thirdway == "leftier") & (sen.state != "ME")].over_vs_harris.mean())
    (D / "exhibits_selection.json").write_text(json.dumps(out))
    print(json.dumps(out, indent=1)[:3000])
    print(s.groupby("group").over_vs_harris.agg(["mean", "count"]).round(2))


if __name__ == "__main__":
    main()
