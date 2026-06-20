"""
verify_review_findings.py — re-derive two numbers flagged in the 2026-06-19
adversarial review, using the EXACT trust-composite construction from
build_swing_trust_turnout.py (lines 107-114).

1. §20 "national mean was 0.24 in 2016" — is 0.24 the actual national mean of the
   3-item trust composite, or a conflation with the strong-left band mean?
   (Validate the construction by reproducing the moderate-swing 0.22 band mean.)
2. §3<->§5 Dem->Trump defector n: fn-3-3 says n=55, fn-5-4 says n=92 for the same
   nominal filter. Confirm the gap is the valid-V161126 (self-placement) restriction.

Run: python scripts/verify_review_findings.py
"""
import numpy as np
import pandas as pd

DTA = "data/raw/anes_timeseries_2016.dta"
df = pd.read_stata(DTA, convert_categoricals=False)

# --- trust composite, EXACT match to build_swing_trust_turnout.py ---
do = df["V161215"].where(df["V161215"].between(1, 5))   # do-right (1=always..5=never)
ra = df["V161216"].where(df["V161216"].between(1, 2))   # benefit of all vs big interests
wa = df["V161217"].where(df["V161217"].between(1, 3))   # waste tax money
trust_c = pd.concat([(5 - do) / 4, (ra - 1) / 1, (wa - 1) / 2], axis=1).mean(axis=1)

w_pre = pd.to_numeric(df["V160101"], errors="coerce").fillna(0).clip(lower=0)   # full sample
w_post = pd.to_numeric(df["V160102"], errors="coerce").fillna(0).clip(lower=0)  # voters

ideo = pd.to_numeric(df["V161126"], errors="coerce")          # 7-pt lib-con self-place
ideo = ideo.where(ideo.between(1, 7))
pid = pd.to_numeric(df["V161158x"], errors="coerce")          # 7-pt PID
vote = pd.to_numeric(df["V162034a"], errors="coerce")         # general vote (1=Clinton,2=Trump)
voted = vote.isin([1, 2])

def wmean(series, weights, mask):
    m = mask & series.notna() & (weights > 0)
    return float(np.average(series[m], weights=weights[m])), int(m.sum())

print("=" * 64)
print("§20 — national mean of the 3-item trust composite (0-1, higher=more trust)")
print("=" * 64)
m_all_pre, n_all_pre = wmean(trust_c, w_pre, trust_c.notna())
m_all_post, n_all_post = wmean(trust_c, w_post, trust_c.notna())
m_voters, n_voters = wmean(trust_c, w_post, voted)
print(f"Full sample, V160101 (PRE):   mean = {m_all_pre:.3f}  (n={n_all_pre})")
print(f"Full sample, V160102 (POST):  mean = {m_all_post:.3f}  (n={n_all_post})")
print(f"Voters only (V162034a 1/2), V160102: mean = {m_voters:.3f}  (n={n_voters})")
print(f"Unweighted full-sample mean:  {trust_c.mean():.3f}   median: {trust_c.median():.3f}")
print(f"Share at floor (<=0.10): {(trust_c <= 0.10).mean()*100:.1f}%")

print()
print("Validate construction — reproduce fn-51 band means (among VOTERS, V160102):")
bands = {"strong-left": [1, 2], "lean-left": [3], "moderate": [4],
         "lean-right": [5], "strong-right": [6, 7]}
for name, codes in bands.items():
    mb = voted & ideo.isin(codes)
    val, n = wmean(trust_c, w_post, mb)
    print(f"  {name:12s} (ideo {codes}): mean trust = {val:.3f}  (n={n})")
# moderate self-place {3,4,5} swing mean (body says 0.22)
mod_swing = voted & ideo.isin([3, 4, 5])
print(f"  [self-ID moderate {{3,4,5}} voters]: mean trust = {wmean(trust_c, w_post, mod_swing)[0]:.3f}")

print()
print("=" * 64)
print("§3<->§5 — Dem->Trump defector n reconciliation")
print("=" * 64)
dem_trump = pid.isin([1, 2, 3]) & (vote == 2)
print(f"Dem-leaner (V161158x in 1/2/3) who voted Trump (V162034a=2):")
print(f"  total n (fn-5-4 says 92):              {int(dem_trump.sum())}")
print(f"  with valid V161126 (fn-3-3 says 55):   {int((dem_trump & ideo.notna()).sum())}")
print(f"  -> dropped for missing self-placement: {int((dem_trump & ideo.isna()).sum())}")
