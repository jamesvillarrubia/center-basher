"""
verify_weight_sweep.py — Gate-3 PRE vs POST weight sweep for the vote-conditioned
defector footnotes fn-3-3 (§3) and fn-5-4 (§5). Computes every number in each
footnote under BOTH V160101 (PRE) and V160102 (POST) so we can resync prose to the
correct weight without drift.

Run: python scripts/verify_weight_sweep.py
"""
import numpy as np
import pandas as pd

df = pd.read_stata("data/raw/anes_timeseries_2016.dta", convert_categoricals=False)

w_pre = pd.to_numeric(df["V160101"], errors="coerce").fillna(0).clip(lower=0)
w_post = pd.to_numeric(df["V160102"], errors="coerce").fillna(0).clip(lower=0)
pid = pd.to_numeric(df["V161158x"], errors="coerce")
vote = pd.to_numeric(df["V162034a"], errors="coerce")
ideo = pd.to_numeric(df["V161126"], errors="coerce").where(lambda s: s.between(1, 7))

# 3-item trust composite (same construction as build_within_tent_bolt.py)
t1 = df["V161215"].where(df["V161215"].between(1, 5))
t2 = df["V161216"].where(df["V161216"].between(1, 2))
t3 = df["V161217"].where(df["V161217"].between(1, 5))
trust = pd.concat([(5 - t1) / 4, (t2 - 1) / 1, (5 - t3) / 4], axis=1).mean(axis=1)

dem = pid.isin([1, 2, 3])
rep = pid.isin([5, 6, 7])
voted_gen = vote.isin([1, 2])
dem_trump = dem & (vote == 2)
rep_clinton = rep & (vote == 1)
defector = dem_trump | rep_clinton


def wmean(series, w, mask):
    m = mask & series.notna() & (w > 0)
    return float(np.average(series[m], weights=w[m])), int(m.sum())


def wshare(numer_mask, denom_mask, w):
    n = (numer_mask & (w > 0))
    d = (denom_mask & (w > 0))
    return float(w[n].sum() / w[d].sum()) * 100


for label, w in [("PRE  (V160101)", w_pre), ("POST (V160102)", w_post)]:
    print("=" * 60)
    print(label)
    print("=" * 60)
    # ---- fn-3-3: defector self-placement means (denominator needs valid V161126) ----
    dt_m, dt_n = wmean(ideo, w, dem_trump)
    rc_m, rc_n = wmean(ideo, w, rep_clinton)
    all_m, all_n = wmean(ideo, w, defector)
    # % of defectors at exact center (4) vs off-center, weighted, valid ideo only
    dm = defector & ideo.notna() & (w > 0)
    at_center = float(w[dm & (ideo == 4)].sum() / w[dm].sum()) * 100
    print("fn-3-3 (self-placement V161126 means):")
    print(f"  Dem→Trump mean = {dt_m:.2f} (n={dt_n});  Rep→Clinton mean = {rc_m:.2f} (n={rc_n})")
    print(f"  combined mean  = {all_m:.2f};  at exact center(4) = {at_center:.0f}%  off-center = {100-at_center:.0f}%")

    # ---- fn-5-4: within-tent Dem→Trump by grievance ----
    # share of electorate (denominator = all weighted respondents)
    n_dt = int((dem_trump & (w > 0)).sum())
    share_elec = wshare(dem_trump, pd.Series(True, index=df.index), w)
    # share of Dem-leaning VOTERS (denominator = Dem-leaners who voted general)
    share_demvoters = wshare(dem_trump, dem & voted_gen, w)
    # grievance split among Dem-leaning voters: above/below median trust
    dem_voters = dem & voted_gen & trust.notna() & (w > 0)
    med = np.median(trust[dem_voters])
    hi_grv = dem_voters & (trust <= med)   # LOW trust = HIGH grievance
    lo_grv = dem_voters & (trust > med)
    def_hi = float(w[hi_grv & (vote == 2)].sum() / w[hi_grv].sum()) * 100
    def_lo = float(w[lo_grv & (vote == 2)].sum() / w[lo_grv].sum()) * 100
    print("fn-5-4 (within-tent Dem→Trump):")
    print(f"  share of electorate = {share_elec:.2f}%  (n={n_dt});  share of Dem-leaning voters = {share_demvoters:.1f}%")
    print(f"  high-grievance defect = {def_hi:.1f}%;  low-grievance = {def_lo:.1f}%;  multiplier = {def_hi/def_lo:.1f}x  (grievance median trust={med:.3f})")
    print()
