"""
verify_figI_figK_all.py — exact numbers for every spot the V161217 fix + weight
sweep touch: Figure I grievance split (fn-5-4), Figure K terciles (fn-7-2), and the
defector/loyalist mean trust (fn-7-1). Computed under PRE/POST x buggy/corrected
V161217 so we can (a) identify the originals' config and (b) draft the corrected text.

Run: python scripts/verify_figI_figK_all.py
"""
import numpy as np
import pandas as pd

df = pd.read_stata("data/raw/anes_timeseries_2016.dta", convert_categoricals=False)
w_pre = pd.to_numeric(df["V160101"], errors="coerce").fillna(0).clip(lower=0)
w_post = pd.to_numeric(df["V160102"], errors="coerce").fillna(0).clip(lower=0)
t1 = df["V161215"].where(df["V161215"].between(1, 5))
t2 = df["V161216"].where(df["V161216"].between(1, 2))
t3 = df["V161217"].where(df["V161217"].between(1, 3))
pid = pd.to_numeric(df["V161158x"], errors="coerce")
vote = pd.to_numeric(df["V162034a"], errors="coerce").where(lambda v: v.between(1, 7))  # valid votes only
trust_buggy = pd.concat([1 - (t1 - 1) / 4, (t2 - 1) / 1, (t3 - 1) / 4], axis=1).mean(axis=1)
trust_fix   = pd.concat([1 - (t1 - 1) / 4, (t2 - 1) / 1, (t3 - 1) / 2], axis=1).mean(axis=1)

def share(num, den, w):
    return float(w[num].sum() / w[den].sum()) * 100

for wlab, w in [("PRE", w_pre), ("POST", w_post)]:
    for tlab, trust in [("buggy(t3-1)/4", trust_buggy), ("FIX(t3-1)/2", trust_fix)]:
        print(f"===== weight={wlab}  V161217={tlab} =====")
        # ---- Figure I: Dem-leaners who voted general (two-party), Dem->Trump by median ----
        dem_v = pid.isin([1, 2, 3]) & vote.isin([1, 2]) & trust.notna() & (w > 0)
        med = float(np.median(trust[dem_v]))
        hi = dem_v & (trust <= med); lo = dem_v & (trust > med)
        allr = share(dem_v & (vote == 2), dem_v, w)
        hir = share(hi & (vote == 2), hi, w)
        lor = share(lo & (vote == 2), lo, w)
        # share of electorate (full weighted sample)
        elec = share(pid.isin([1, 2, 3]) & (vote == 2) & (w > 0), pd.Series(w > 0), w)
        print(f"  FigI: all={allr:.1f}%  low-grv={lor:.1f}%  high-grv={hir:.1f}%  mult={hir/lor:.1f}x"
              f"   | elec-share={elec:.2f}%  (median trust={med:.3f})")
        # ---- Figure K: non-Rep tent broad-swing (any non-Clinton) by trust tercile ----
        nonrep = pid.between(1, 4) & vote.notna() & trust.notna() & (w > 0)
        cuts = trust[nonrep].quantile([1/3, 2/3]).values
        bands = [("low", nonrep & (trust < cuts[0])),
                 ("mid", nonrep & (trust >= cuts[0]) & (trust < cuts[1])),
                 ("high", nonrep & (trust >= cuts[1]))]
        bs = [100 - share(m & (vote == 1), m, w) for _, m in bands]
        # Rep tent: Clinton-vote rate by tercile
        rep = pid.between(5, 7) & vote.notna() & trust.notna() & (w > 0)
        rcuts = trust[rep].quantile([1/3, 2/3]).values
        rbands = [("low", rep & (trust < rcuts[0])),
                  ("mid", rep & (trust >= rcuts[0]) & (trust < rcuts[1])),
                  ("high", rep & (trust >= rcuts[1]))]
        rc = [share(m & (vote == 1), m, w) for _, m in rbands]
        print(f"  FigK non-Rep broad-swing: {bs[0]:.1f}/{bs[1]:.1f}/{bs[2]:.1f}"
              f"  | Rep->Clinton: {rc[0]:.1f}/{rc[1]:.1f}/{rc[2]:.1f}")
        # ---- fn-7-1: full-sample defector vs loyalist mean trust ----
        dem = pid.isin([1, 2, 3]); repl = pid.isin([5, 6, 7])
        defector = (dem & (vote == 2)) | (repl & (vote == 1))
        loyalist = (dem & (vote == 1)) | (repl & (vote == 2))
        dmask = defector & trust.notna() & (w > 0); lmask = loyalist & trust.notna() & (w > 0)
        dmean = float(np.average(trust[dmask], weights=w[dmask]))
        lmean = float(np.average(trust[lmask], weights=w[lmask]))
        print(f"  fn-7-1 mean trust: defectors={dmean:.3f}  loyalists={lmean:.3f}")
        print()
