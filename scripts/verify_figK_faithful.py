"""SCRATCH (not committed as pipeline): faithful replica of build_within_tent_bolt.py's
tent loop with a V161217 toggle. Prints vote_own by tercile for both tents under
buggy vs corrected, to confirm reproduction of the live figure and give corrected numbers.
No file writes."""
import numpy as np, pandas as pd
from _lib import clean_var, load_anes_2016

df = load_anes_2016()
w = clean_var(df, "V160102", 0, 1e9).fillna(0).clip(lower=0)
t1 = clean_var(df, "V161215", 1, 5)
t2 = clean_var(df, "V161216", 1, 2)

def run(fix):
    t3r = clean_var(df, "V161217", 1, 3 if fix else 5)
    t3 = (t3r - 1) / (2 if fix else 4)
    trust = pd.concat([1 - (t1 - 1) / 4, (t2 - 1) / 1, t3], axis=1).mean(axis=1)
    pid = clean_var(df, "V161158x", 1, 7)
    vch = clean_var(df, "V162034a", 1, 7)
    voted = vch.notna()
    non_rep = pid.between(1, 4); rep_lean = pid.between(5, 7)
    out = {}
    for label, tent, own in [("non_rep", non_rep, 1), ("rep", rep_lean, 2)]:
        base = tent & voted & trust.notna() & (w > 0)
        cuts = trust[base].quantile([1/3, 2/3]).values
        bands = {"low": base & (trust < cuts[0]),
                 "mid": base & (trust >= cuts[0]) & (trust < cuts[1]),
                 "high": base & (trust >= cuts[1])}
        other = 2 if own == 1 else 1
        out[label] = {b: (round(float(np.average((vch[m]==own).astype(float), weights=w[m])*100),1),
                          round(float(np.average((vch[m]==other).astype(float), weights=w[m])*100),1), int(m.sum()))
                      for b, m in bands.items()}
        # overall vote_other (Dem->Trump for non_rep) across whole tent
        out[label+"_allother"] = round(float(np.average((vch[base]==other).astype(float), weights=w[base])*100),1)
    # defectors / loyalists mean trust (full sample, two-party)
    dem=pid.isin([1,2,3]); rep=pid.isin([5,6,7])
    dfc=((dem&(vch==2))|(rep&(vch==1)))&trust.notna()&(w>0)
    loy=((dem&(vch==1))|(rep&(vch==2)))&trust.notna()&(w>0)
    out["defmean"]=round(float(np.average(trust[dfc],weights=w[dfc])),3)
    out["loymean"]=round(float(np.average(trust[loy],weights=w[loy])),3)
    return out

for fix in (False, True):
    o = run(fix)
    tag = "CORRECTED (t3-1)/2" if fix else "buggy (t3-1)/4"
    print(f"===== {tag} (POST) =====")
    for tent in ("non_rep", "rep"):
        own = "Clinton" if tent=="non_rep" else "Trump"
        oth = "Trump" if tent=="non_rep" else "Clinton"
        s = o[tent]
        print(f"  {tent} vote_own({own}) low/mid/high = "
              f"{s['low'][0]}/{s['mid'][0]}/{s['high'][0]}  (n {s['low'][2]}/{s['mid'][2]}/{s['high'][2]})")
        print(f"  {tent} vote_OTHER({oth}) low/mid/high = "
              f"{s['low'][1]}/{s['mid'][1]}/{s['high'][1]}  | overall {o[tent+'_allother']}%")
    print(f"  defector mean trust={o['defmean']}  loyalist mean trust={o['loymean']}")
    print()
