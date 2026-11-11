"""Checks behind docs/analysis/2026-yglesias-rebuttal.md (2026-11-11).

1. Competitive House seats (Harris margin under 10, about Harris under 55% two-party): mean
   over_vs_harris by affiliation, and OLS of over_vs_harris on affiliation + seat + harris_margin
   (HC1 SEs). Replicates the Fox Daily claim that progressives in those seats underran.
2. Senate nominees against the same-state 2026 governor nominee (races.csv gov_dem_margin).
3. Seats held by Democrats in 2025 that CNN shows a Republican winning.
4. House Democrats' price-and-health ad frames (emphasis/frame_shares.csv) by affiliation.
5. Senate nominees' sourced economic-populist positions (positions/positions_final.csv).

Writes rebuttal_competitive.csv, rebuttal_senate_vs_gov.csv, rebuttal_d_seats_lost.csv,
rebuttal_frames_by_affiliation.csv, rebuttal_senate_positions.csv.
"""
from pathlib import Path
import pandas as pd
import statsmodels.formula.api as smf
from house_drivers import frame

D = Path(__file__).resolve().parents[2] / "data/derived/midterm2026"


def main() -> None:
    h = frame()
    c = h[h.harris_margin < 10]
    rows = [dict(term=f"raw_mean_{g}", value=v.over_vs_harris.mean(), n=len(v)) for g, v in c.groupby("affiliation")]
    for sample, x in [("all", c), ("counted >= 90%", c[c.pct_reporting >= 90])]:
        x = x[x.affiliation.isin(["progressive", "moderate", "neither"])]
        m = smf.ols("over_vs_harris ~ C(affiliation, Treatment('neither')) + C(seat) + harris_margin", data=x).fit(cov_type="HC1")
        ci = m.conf_int()
        for g in ["moderate", "progressive"]:
            t = f"C(affiliation, Treatment('neither'))[T.{g}]"
            rows.append(dict(term=f"{sample}: {g} vs unaligned", value=m.params[t], ci_lo=ci.loc[t, 0], ci_hi=ci.loc[t, 1],
                             n=int((x.affiliation == g).sum())))
    pd.DataFrame(rows).to_csv(D / "rebuttal_competitive.csv", index=False)

    r = pd.read_csv(D / "races.csv")
    s = r[(r.chamber.str.lower().str.startswith("s")) & r.gov_dem_margin.notna() & r.dem_nominee.notna()].copy()
    s["sen_minus_gov"] = s.dem_margin - s.gov_dem_margin
    s["gov_over_harris"] = s.gov_dem_margin - s.harris_margin
    s[["race_id", "dem_nominee", "harris_margin", "dem_margin", "over_vs_harris", "gov_dem_margin", "gov_over_harris",
       "sen_minus_gov", "pct_reporting"]].sort_values("sen_minus_gov").to_csv(D / "rebuttal_senate_vs_gov.csv", index=False)

    lost = h[(h.incumbent_party_2025 == "D") & h.rep_won]
    lost[["race_id", "dem_nominee", "harris_margin", "over_vs_harris", "pct_reporting"]].to_csv(D / "rebuttal_d_seats_lost.csv", index=False)
    f = pd.read_csv(D / "emphasis/frame_shares.csv")
    f = f[(f.party == "DEM") & (f.spend_price_health > 0)].merge(h[["race_id", "affiliation"]], on="race_id")
    cols = ["villain_share", "c_corporate_share", "r_anticorp_share", "r_cap_share", "r_public_share",
            "r_protect_share", "r_taxcut_share", "trump_blame_share", "vague_share"]
    fa = f.groupby("affiliation")[cols].mean().mul(100)
    fa["n"] = f.groupby("affiliation").size()
    fa.round(1).to_csv(D / "rebuttal_frames_by_affiliation.csv")

    items = {1: "Medicare for All", 2: "billionaire or wealth tax", 3: "no corporate PAC money", 4: "conditions on Israel aid",
             5: "Green New Deal", 6: "minimum wage >= $17", 7: "end the filibuster", 8: "court expansion",
             9: "student debt / free college", 10: "anti-monopoly", 11: "no crypto PAC money", 12: "universal childcare / pre-K",
             13: "oppose Schumer / Jeffries"}
    p = pd.read_csv(D / "positions/positions_final.csv")
    p = p[p.race_id.str.endswith("-S") & (p.score != 0)].assign(item_name=lambda d: d.item.map(items))
    p[["race_id", "nominee", "item", "item_name", "score", "pre_primary", "source_url", "quote"]].to_csv(
        D / "rebuttal_senate_positions.csv", index=False)

    print(fa.round(1).T.to_string())
    print(pd.DataFrame(rows).round(2).to_string()); print(lost[["race_id", "dem_nominee", "over_vs_harris"]].round(1).to_string())


if __name__ == "__main__":
    main()
