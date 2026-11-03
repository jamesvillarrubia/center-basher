"""C1: Congress approval (Gallup) vs House incumbent reelection rate, 1974-2024.

Refuted if reelection falls when approval falls at a comparable slope. Operational
test: regress reelection rate (% of incumbents seeking reelection who won) on the
election-year mean Gallup approval; refuted if the slope is 0.5 pp per approval
point or steeper. Sources: Brookings Vital Statistics on Congress table 2-7
(2026 release); Gallup "Congress and the Public" approval series.
"""
import json

import numpy as np
import pandas as pd

from common import DERIVED, RAW

vs = pd.read_excel(RAW / "congress_stats/brookings_vs_2-7.xlsx", header=2)
vs = vs.rename(columns={"Year": "year", "Percentage of those seeking reelection": "reelect_pct"})
vs = vs[pd.to_numeric(vs.year, errors="coerce").notna()][["year", "reelect_pct"]].astype(float)

g = pd.read_html(RAW / "congress_stats/gallup_congress.html")[0]
g.columns = ["date", "approve"]
g["date"] = pd.to_datetime(g.date, errors="coerce")
g = g.dropna()
g["year"] = g.date.dt.year
appr = g.groupby("year").approve.mean().rename("approve")

df = vs.set_index("year").join(appr, how="inner").loc[1974:2024]
slope, intercept = np.polyfit(df.approve, df.reelect_pct, 1)
r = float(np.corrcoef(df.approve, df.reelect_pct)[0, 1])
recent = df.loc[2008:]

out = {
    "claim": "C1",
    "n_elections": int(len(df)),
    "by_year": df.round(1).reset_index().to_dict("records"),
    "slope_pp_reelect_per_pp_approval": round(float(slope), 3),
    "r": round(r, 2),
    "since_2008_mean_approval": round(float(recent.approve.mean()), 1),
    "since_2008_mean_reelect": round(float(recent.reelect_pct.mean()), 1),
    "since_2008_min_reelect": float(recent.reelect_pct.min()),
    "gallup_latest": g.sort_values("date").iloc[-1][["date", "approve"]].astype(str).to_dict(),
    "verdict": "REFUTED" if slope >= 0.5 else "SURVIVES",
}
(DERIVED / "c1_approval_vs_reelection.json").write_text(json.dumps(out, indent=2))
print(df.round(1).to_string())
print({k: v for k, v in out.items() if k != "by_year"})
