"""Leadership endorsements and results (reqts/midterm-2026-leadership-and-price-frames.md, Part A).

Input: leadership_endorsements.csv (sourced rows), house_drivers.frame(), house_primaries.csv,
races.csv (Senate).
  L1  over_vs_harris ~ backed_pre + C(state) + C(seat) + harris_margin (then + log_money_ratio)
  L2  Democrats who flipped a seat or won with |harris_margin| <= 10 without pre-primary backing
  L3  contested primaries: nominee backed vs nominee beat a backed rival vs neither
Outputs: leadership_models.csv, leadership_winners_unbacked.csv, leadership_contested.csv
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from emphasis_models import CTRL, fit, row  # noqa: E402
from house_drivers import frame  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
PICK = {"jeffries", "dccc_red_to_blue", "hmp_primary"}  # leadership choosing a candidate
HOUSE = PICK | {"dccc_frontline"}
SENATE = {"schumer", "dscc", "smp_primary"}


def key(name: str) -> str:
    n = unicodedata.normalize("NFKD", str(name)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z ]", "", n).split()[-1] if n.strip() else ""


def truthy(s: pd.Series) -> pd.Series:
    return s.astype(str).str.lower().isin(["true", "1", "yes"])


def main() -> None:
    e = pd.read_csv(D / "leadership_endorsements.csv")
    e["last"] = e.candidate.map(key)
    e["pre"] = truthy(e.pre_primary)
    h = frame()
    h["last"] = h.dem_nominee.map(key)
    he = e[e.chamber.str.upper().str.startswith("H")]

    def backed(rid, last, endorsers, pre_only=True):
        x = he[(he.race_id == rid) & (he["last"] == last) & he.endorser.isin(endorsers)]
        return bool((x.pre if pre_only else pd.Series(True, index=x.index)).any())

    h["backed_pre"] = [backed(r, l, HOUSE) for r, l in zip(h.race_id, h["last"])]
    h["picked_pre"] = [backed(r, l, PICK) for r, l in zip(h.race_id, h["last"])]
    h["backed_any"] = [backed(r, l, HOUSE, False) for r, l in zip(h.race_id, h["last"])]
    fund = pd.read_csv(D / "house_funding.csv").drop_duplicates("race_id").set_index("race_id")[["log_money_ratio"]]
    h = h.join(fund, on="race_id")
    for c in ["backed_pre", "picked_pre"]:
        h[c + "_i"] = h[c].astype(int)

    rows = []
    for name, d in [("all D-vs-R", h), (">= 90% counted", h[h.counted90])]:
        for term in ["backed_pre_i", "picked_pre_i"]:
            m = fit(f"over_vs_harris ~ {term} + {CTRL}", d)
            rows.append(row(f"L1 {term}", name, m, term, 1, f"points; backed n={int(d[term].sum())}"))
            dm = d.dropna(subset=["log_money_ratio"])
            m = fit(f"over_vs_harris ~ {term} + log_money_ratio + {CTRL}", dm)
            rows.append(row(f"L1 {term} + money", name, m, term, 1, f"points; backed n={int(dm[term].sum())}"))

    # L2: winners without pre-primary backing
    flip = h.dem_won.astype(bool) & (h.incumbent_party_2025 == "R")
    close = h.dem_won.astype(bool) & (h.harris_margin.abs() <= 10)
    w = h[(flip | close)].assign(flip=flip[flip | close])
    w = w[["race_id", "dem_nominee", "flip", "harris_margin", "over_vs_harris", "dem_margin", "backed_pre", "picked_pre",
           "backed_any"]].sort_values("over_vs_harris", ascending=False)
    w.to_csv(D / "leadership_winners_unbacked.csv", index=False)

    # L3: contested primaries
    p = pd.read_csv(D / "house_primaries.csv")
    p["race_id"] = p.state + "-" + p.district.astype(int).astype(str).str.zfill(2)
    p["last"] = p.candidate.map(key)
    p["backed"] = [bool(he[(he.race_id == r) & (he["last"] == l) & he.endorser.isin(PICK) & he.pre].shape[0])
                   for r, l in zip(p.race_id, p["last"])]
    nom = h.set_index("race_id")
    groups = []
    for rid, x in p.groupby("race_id"):
        if rid not in nom.index or len(x) < 2:
            continue
        n = x[x["last"] == nom.at[rid, "last"]]
        pct = n.primary_pct.max() if len(n) else np.nan
        rival_backed = bool(x[(x["last"] != nom.at[rid, "last"]) & x.backed].shape[0])
        nom_backed = bool(nom.at[rid, "picked_pre"])
        if not (pct < 70 or rival_backed):
            continue
        g = "nominee backed" if nom_backed else ("beat a backed rival" if rival_backed else "neither backed")
        groups.append(dict(race_id=rid, group=g, nominee_primary_pct=pct))
    c = nom.join(pd.DataFrame(groups).set_index("race_id"), how="inner").reset_index()
    c.to_csv(D / "leadership_contested.csv", index=False)
    for g in ["beat a backed rival", "neither backed"]:
        x = c[c.group.isin(["nominee backed", g])].assign(t=lambda d: (d.group == g).astype(int))
        if x.t.nunique() == 2:
            for f, lab in [(f"over_vs_harris ~ t + C(seat) + harris_margin", "seat + harris"),
                           (f"over_vs_harris ~ t + {CTRL}", "state FE")]:
                m = smf.ols(f, x).fit(cov_type="HC1")
                rows.append(row(f"L3 {g} minus backed ({lab})", "contested primaries", m, "t", 1,
                                f"n {g}={int(x.t.sum())}, backed={int((1 - x.t).sum())}"))
    out = pd.DataFrame(rows)
    out.to_csv(D / "leadership_models.csv", index=False)
    pd.set_option("display.width", 220)
    print(f"D-vs-R races {len(h)}; backed_pre {int(h.backed_pre.sum())}; picked_pre {int(h.picked_pre.sum())}")
    print(out.round(3).to_string())
    print("\nL2 winners in flips or |harris| <= 10:")
    print(w.round(1).to_string(index=False))
    print("\nL3 contested groups:")
    print(c.groupby("group").over_vs_harris.describe().round(1).to_string())


if __name__ == "__main__":
    main()
