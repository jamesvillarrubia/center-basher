"""Center-illusion distributions for the social card.

Shows the averaging artifact: a voter's MEAN across 6 issue self-placements
piles up near the center, but the INDIVIDUAL positions those means average
over are far more spread out. Among voters whose mean lands centrist, the
raw positions are NOT clustered at 4 — the "center" is cancellation.

ANES 2016 Time Series, weighted V160101. 6 genuine 7-pt lib-con
self-placement issue scales (same set as fn-2-1):
V161178, V161181, V161184, V161189, V161198, V161201.  Output -> JSON.
"""
import json
import numpy as np
import pandas as pd

PATH = "data/raw/anes_timeseries_2016.dta"
ISSUES = ["V161178", "V161181", "V161184", "V161189", "V161198", "V161201"]
W = "V160101"

df = pd.read_stata(PATH, convert_categoricals=False, columns=ISSUES + [W])

# Keep only valid 1..7 responses; everything else (negatives, DK/NA) -> NaN.
X = df[ISSUES].where((df[ISSUES] >= 1) & (df[ISSUES] <= 7))
w = df[W].where(df[W] > 0)

answered = X.notna().sum(axis=1)
mask = (answered >= 5) & w.notna()
X, w = X[mask], w[mask]
answered = answered[mask]

# center on 0 (position 4 = exact center) -> range -3..+3
Xc = X - 4.0
meanpos = Xc.mean(axis=1)                       # each voter's averaged position

BINS = np.arange(-3.25, 3.26, 0.5)              # -3..+3 in half-point bins
centers = ((BINS[:-1] + BINS[1:]) / 2).round(2)

def whist(vals, weights):
    h, _ = np.histogram(vals, bins=BINS, weights=weights)
    return (h / h.sum() * 100).round(2)

# (A) distribution of the AVERAGED position (the illusion: fat center)
distA = whist(meanpos.values, w.values)

# (B) distribution of ALL INDIVIDUAL positions, each response weighted by
#     its respondent's weight (what the means are built from)
long_vals = Xc.values.flatten()
long_w = np.repeat(w.values[:, None], len(ISSUES), axis=1).flatten()
ok = ~np.isnan(long_vals)
distB = whist(long_vals[ok], long_w[ok])

# (C) among voters whose MEAN is centrist (|mean| <= 0.75), the spread of
#     their individual positions — proves cancellation, not moderation
cen = meanpos.abs() <= 0.75
cv = Xc[cen].values.flatten()
cw = np.repeat(w[cen].values[:, None], len(ISSUES), axis=1).flatten()
cok = ~np.isnan(cv)
distC = whist(cv[cok], cw[cok])
cen_share = float((w[cen].sum() / w.sum() * 100).round(1))

out = {
    "source": "ANES 2016 Time Series (data/raw/anes_timeseries_2016.dta), weighted V160101",
    "issues": ISSUES,
    "axis": "position centered on 4 (0 = exact center); bins are half-point",
    "bin_centers": centers.tolist(),
    "dist_averaged_position": distA.tolist(),
    "dist_individual_positions": distB.tolist(),
    "dist_individual_within_centrist_mean": distC.tolist(),
    "centrist_mean_share_pct": cen_share,
    "n_voters": int(mask.sum()),
}
with open("data/derived/center_illusion.json", "w") as f:
    json.dump(out, f, indent=2)

# ---- text summary so we can eyeball the shapes ----
def bar(vals, k=40):
    m = max(vals)
    for c, v in zip(centers, vals):
        print(f"{c:+.2f}  {'#' * round(v / m * k):<{k}} {v:5.1f}%")

print(f"n voters (>=5 of 6 issues) = {out['n_voters']}")
print(f"share with centrist MEAN (|mean|<=0.75) = {cen_share}%\n")
print("A) distribution of AVERAGED position (the 'center' illusion):")
bar(distA)
print("\nB) distribution of INDIVIDUAL positions (what the means average over):")
bar(distB)
print("\nC) individual positions AMONG centrist-mean voters (cancellation check):")
bar(distC)
