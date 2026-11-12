"""The "socialist" label: DSA-backed nominees, and Democrats targeted by Republican socialism ads.

1. DSA: House nominees reported as DSA-backed or DSA-aligned in Nov 3 2026 general elections
   (Blavity via Yahoo, 2026-11-04,
   https://www.yahoo.com/news/politics/articles/democratic-socialists-won-midterms-far-230432529.html).
   Rabb (PA-03), Gonzales-Torres (CA-34) and Vang (CA-07) had no D-vs-R November race and drop out.
   Cross-check: house_primaries.csv e_dsa marks Kiros, Tlaib, McKinney, Valdez, Rabb and
   Ocasio-Cortez, matching this list; it has no row for NY-13, LA-01 or the California races.
2. NRCC: Democrat-held districts in the NRCC's Nov 2025 "Stop socialism. Stop Democrats." Mamdani
   digital ad (Fox News, 2025-11-05, list read verbatim), mapped to 2026 races (see NRCC).

Model: over_vs_harris ~ flag + C(state) + C(seat) + harris_margin, state-clustered SEs, on all
D-vs-R House races (DSA) and on Democrat-held seats (NRCC), all races and >= 90% counted.
Output: data/derived/midterm2026/labels_models.csv
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import statsmodels.formula.api as smf

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from house_drivers import frame  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
DSA = {"NY-14": "Ocasio-Cortez", "MI-12": "Tlaib", "NY-13": "Avila Chevalier", "NY-07": "Valdez",
       "MI-13": "McKinney", "CO-01": "Kiros", "LA-01": "Jewett", "PA-03": "Rabb", "CA-34": "Gonzales-Torres",
       "CA-07": "Vang"}
# The page lists 29 districts on 2025 lines. Mapped to 2026 races: incumbents by name (Moskowitz
# FL-23 -> FL-25 after Florida's redraw); open or retired seats by number only where the lines did
# not change (ME-02, NH-01). Dropped: TX-09 and TX-35 (open, redrawn) and TX-32 (Julie Johnson is
# not the 2026 nominee there and the seat was redrawn). 26 races.
NRCC = ("CA-09 CA-13 CA-27 CA-45 CA-47 FL-09 FL-25 IN-01 ME-02 MI-08 NC-01 NH-01 NJ-09 NM-02 NV-01 NV-03 "
        "NV-04 NY-03 NY-04 NY-19 OH-09 OH-13 TX-28 TX-34 VA-07 WA-03").split()
NRCC_SOURCE = ("Fox News 2025-11-05 (Steinhauser), verbatim list of 29 Democrat-held districts, "
               "https://www.foxnews.com/politics/scoop-house-republicans-link-mayor-elect-mamdani-vulnerable-congressional-democrats")


def main() -> None:
    h = frame()
    for rid, last in DSA.items():
        row = h[h.race_id == rid]
        assert row.empty or last.split()[-1].lower() in row.dem_nominee.iloc[0].lower(), (rid, last)
    h["dsa"] = h.race_id.isin(DSA).astype(int)
    h["nrcc"] = h.race_id.isin(NRCC).astype(int)
    rows = []
    for flag, base in [("dsa", h), ("nrcc", h[h.incumbent_party_2025 == "D"])]:
        for sample, d in [("all", base), ("counted >= 90%", base[base.counted90])]:
            m = smf.ols(f"over_vs_harris ~ {flag} + C(state) + C(seat) + harris_margin", d).fit(
                cov_type="cluster", cov_kwds={"groups": pd.factorize(d.state)[0]})
            lo, hi = m.conf_int().loc[flag]
            rows.append(dict(flag=flag, sample=sample, n=int(m.nobs), k=int(d[flag].sum()),
                             raw_flagged=d[d[flag] == 1].over_vs_harris.mean(), raw_other=d[d[flag] == 0].over_vs_harris.mean(),
                             coef=m.params[flag], ci_lo=lo, ci_hi=hi, p=m.pvalues[flag],
                             source=NRCC_SOURCE if flag == "nrcc" else "Blavity/Yahoo 2026-11-04"))
    out = pd.DataFrame(rows)
    out.to_csv(D / "labels_models.csv", index=False)
    print(out.round(3).to_string())


if __name__ == "__main__":
    main()
