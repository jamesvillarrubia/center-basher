"""C9: executive orders vs public laws per Congress, 97th-117th (1981-2022).

Refuted if the ratio of executive orders to public laws shows no upward trend.
Laws: CAP US public laws 20.1, commemorative laws excluded. Orders: CAP US
executive orders 26.1, commemorative excluded, counted by Congress.
"""
import json

import numpy as np
import pandas as pd

from common import DERIVED, RAW

laws = pd.read_csv(RAW / "comparative_agendas/us_public_laws_20.1.csv", encoding="latin-1", low_memory=False)
laws = laws[laws.filter_commemorative != 1]
eos = pd.read_csv(RAW / "comparative_agendas/us_executive_orders_26.1.csv", encoding="latin-1", low_memory=False)
eos_all_by_year = eos.groupby("year").size()
eos = eos[eos.commemorative != 1]

lc = laws.groupby("congress").size().rename("laws")
ec = eos.groupby("congress").size().rename("orders")
df = pd.concat([lc, ec], axis=1).loc[97:117].astype(int)
df["orders_per_100_laws"] = (100 * df.orders / df.laws).round(1)
slope = np.polyfit(df.index, df.orders_per_100_laws, 1)[0]
# Sensitivity: drop the 116th-117th (COVID orders, 2021 transition).
slope_ex = np.polyfit(df.loc[97:115].index, df.loc[97:115].orders_per_100_laws, 1)[0]
first, last = df.iloc[:5].orders_per_100_laws.mean(), df.iloc[-5:].orders_per_100_laws.mean()

out = {
    "claim": "C9",
    "window": "97th-117th Congress (1981-2022)",
    "by_congress": df.reset_index(names="congress").to_dict("records"),
    "slope_orders_per_100_laws_per_congress": round(float(slope), 2),
    "slope_excluding_116_117": round(float(slope_ex), 2),
    "laws_mean_97_101": round(float(df.loc[97:101].laws.mean()), 1),
    "laws_mean_113_117": round(float(df.loc[113:117].laws.mean()), 1),
    "mean_first5": round(float(first), 1),
    "mean_last5": round(float(last), 1),
    "orders_by_year_2017_2025_all": eos_all_by_year.loc[2017:2025].astype(int).to_dict(),
    "verdict": ("WEAK: trend comes from the 116th-117th only" if slope > 0 and slope_ex <= 0.2
                else "SURVIVES" if slope > 0 and last > first else "REFUTED"),
}
(DERIVED / "c9_exec_vs_laws.json").write_text(json.dumps(out, indent=2))
print(df.to_string())
print({k: v for k, v in out.items() if k != "by_congress"})
