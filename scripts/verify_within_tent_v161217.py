"""
verify_within_tent_v161217.py — replicate build_within_tent_bolt.py's within-tent
broad-swing-by-tercile (the §7 Fig K 53/23/9.7 numbers) and the §5/§6 Dem->Trump
median-grievance split (10.8/3.7), under the CURRENT (buggy) V161217 = (t3-1)/4
vs the CORRECTED (t3-1)/2. Weight POST (V160102) in both. Shows what the bug moves.

Run: python scripts/verify_within_tent_v161217.py
"""
import numpy as np
import pandas as pd

df = pd.read_stata("data/raw/anes_timeseries_2016.dta", convert_categoricals=False)
w = pd.to_numeric(df["V160102"], errors="coerce").fillna(0).clip(lower=0)
t1 = df["V161215"].where(df["V161215"].between(1, 5))
t2 = df["V161216"].where(df["V161216"].between(1, 2))
t3 = df["V161217"].where(df["V161217"].between(1, 3))
pid = pd.to_numeric(df["V161158x"], errors="coerce")
vote = pd.to_numeric(df["V162034a"], errors="coerce")
voted = vote.between(1, 7)

trust_buggy = pd.concat([1 - (t1 - 1) / 4, (t2 - 1) / 1, (t3 - 1) / 4], axis=1).mean(axis=1)
trust_fixed = pd.concat([1 - (t1 - 1) / 4, (t2 - 1) / 1, (t3 - 1) / 2], axis=1).mean(axis=1)


def within_tent_broadswing(trust):
    """Non-Republican tent: broad-swing (=100% - voted Clinton) by trust tercile."""
    non_rep = pid.between(1, 4)
    base = non_rep & voted & trust.notna() & (w > 0)
    cuts = trust[base].quantile([1/3, 2/3]).values
    out = {}
    for lab, m in [("low", base & (trust < cuts[0])),
                   ("mid", base & (trust >= cuts[0]) & (trust < cuts[1])),
                   ("high", base & (trust >= cuts[1]))]:
        own = (m & (vote == 1))   # voted Clinton (own)
        broadswing = 100 - float(w[own].sum() / w[m].sum()) * 100
        out[lab] = (broadswing, int(m.sum()))
    return out


def dem_trump_by_median(trust):
    """Dem-leaners (1-3) who voted general; Dem->Trump rate split at median trust."""
    dem = pid.isin([1, 2, 3]) & vote.isin([1, 2]) & trust.notna() & (w > 0)
    med = float(np.median(trust[dem]))
    hi = dem & (trust <= med)   # high grievance = low trust
    lo = dem & (trust > med)
    rate = lambda m: float(w[m & (vote == 2)].sum() / w[m].sum()) * 100
    overall = float(w[dem & (vote == 2)].sum() / w[dem].sum()) * 100
    return overall, rate(hi), rate(lo), med


for name, trust in [("CURRENT (buggy V161217=(t3-1)/4)", trust_buggy),
                    ("CORRECTED  V161217=(t3-1)/2", trust_fixed)]:
    print("=" * 60)
    print(name)
    print("=" * 60)
    bs = within_tent_broadswing(trust)
    print("§7 Fig K — Non-Rep tent broad-swing by trust tercile:")
    print(f"  low-trust {bs['low'][0]:.1f}%  mid {bs['mid'][0]:.1f}%  high {bs['high'][0]:.1f}%"
          f"   (n {bs['low'][1]}/{bs['mid'][1]}/{bs['high'][1]})")
    ov, hi, lo, med = dem_trump_by_median(trust)
    print(f"§5/§6 — Dem->Trump by median grievance: overall {ov:.1f}%  "
          f"high-grv {hi:.1f}%  low-grv {lo:.1f}%  mult {hi/lo:.1f}x  (median {med:.3f})")
    print()
