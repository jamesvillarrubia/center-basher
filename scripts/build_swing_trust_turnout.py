"""
build_swing_trust_turnout.py — §16 swing-state TRUST vs swing-state TURNOUT
scatter across 11 presidential cycles (1980-2020; 2024 turnout variable
needs verification, omitted for now).

For each cycle:
  - swing_trust = weighted mean of the trust composite, restricted to ANES
    respondents living in that cycle's battleground states (cycle-specific
    set from build_candidate_honesty_by_trust.py).
  - swing_turnout = weighted share of those same respondents reporting they
    voted (self-reported; ANES over-reports by ~25pp but the relative
    pattern across cycles is meaningful).

Headline pattern: the trust↔turnout relationship FLIPS at the
Authenticity-Floor boundary (~0.41). High-trust era (1980-2004): positive
correlation r=+0.86. Low-trust era (2008-2020): negative r=-0.99.

Output: data/clean/swing_trust_turnout.json
"""
import json
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, DATA_CLEAN
import warnings; warnings.filterwarnings("ignore")

BG = {
    1980: [42, 39, 17, 26, 55, 34, 29, 9],
    1984: [25, 27, 19, 44, 15],
    1988: [42, 17, 26, 24, 29, 35, 34],
    1992: [39, 12, 13, 37, 34, 9, 33, 21, 32],
    1996: [47, 12, 39, 21, 32, 4, 13],
    2000: [12, 39, 35, 19, 33, 55, 42, 26, 41],
    2004: [39, 42, 26, 55, 12, 35, 32, 19, 33, 27],
    2008: [39, 42, 12, 51, 37, 18, 8, 29, 32, 33, 30],
    2012: [39, 12, 51, 37, 8, 32, 33, 19, 55],
    2016: [26, 55, 42, 12, 39, 37, 4, 19],
    2020: [42, 26, 55, 4, 13, 37, 12, 32],
}

def norm(s, lo, hi, rev=False):
    x = (s - lo) / (hi - lo)
    return (1 - x) if rev else x


def main():
    rows = []

    # CDF cycles (1980-2008)
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf['VCF0004'], errors='coerce')
    w = pd.to_numeric(cdf['VCF0009z'], errors='coerce').fillna(0).clip(lower=0)
    state = pd.to_numeric(cdf['VCF0901a'], errors='coerce')
    t1, t2, t3 = cdf_num(cdf['VCF0604']), cdf_num(cdf['VCF0605']), cdf_num(cdf['VCF0609'])
    trust = pd.concat([norm(t1,1,5,True), norm(t2,1,2), norm(t3,1,3)], axis=1).mean(axis=1)
    vote = pd.to_numeric(cdf['VCF0702'], errors='coerce')  # 1=no, 2=yes
    voted = (vote == 2)

    for y in [1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008]:
        fips = set(BG[y])
        m = (yr == y) & state.isin(fips) & trust.notna() & vote.between(1,2) & (w > 0)
        if m.sum() < 30:
            continue
        trust_sw = float(np.average(trust[m], weights=w[m]))
        turnout_sw = float(np.average(voted[m].astype(float), weights=w[m])) * 100
        rows.append({
            'cycle': y,
            'swing_trust': round(trust_sw, 3),
            'swing_turnout': round(turnout_sw, 1),
            'n': int(m.sum()),
            'source': 'CDF',
        })

    # Standalone cycles
    standalone = [
        (2012, lambda: pd.read_stata('data/raw/anes_2012/anes_timeseries_2012.dta',
                                      convert_categoricals=False,
                                      columns=['postvote_presvtwho','trustgov_trustgrev',
                                               'trustgov_trustgstd','trust_social',
                                               'weight_full','sample_stfips']),
         'postvote_presvtwho', 'weight_full', 'sample_stfips'),
        (2016, None, 'V162031x', 'V160102', 'V161010d'),
        (2020, None, 'V202109x', 'V200010a', 'V201014b'),
    ]
    from _lib import load_anes_2016, load_anes_2020
    loaders = {2016: load_anes_2016, 2020: load_anes_2020}
    for entry in standalone:
        y = entry[0]
        loader = entry[1] or loaders[y]
        vote_var, wt_var, st_var = entry[2], entry[3], entry[4]
        df = loader()
        fips = set(BG[y])
        if y == 2012:
            g_rev = df['trustgov_trustgrev'].where(df['trustgov_trustgrev'].between(1,5))
            g_std = df['trustgov_trustgstd'].where(df['trustgov_trustgstd'].between(1,4))
            g_trust = ((g_rev - 1) / 4.0).fillna((4 - g_std) / 3.0)
            s_trust = (5 - df['trust_social'].where(df['trust_social'].between(1,5))) / 4.0
            trust_c = pd.concat([g_trust, s_trust], axis=1).mean(axis=1)
            # postvote_presvtwho coded: 1=Obama, 2=Romney, 5=other => voted
            voted_y = df[vote_var].isin([1, 2, 5])
        else:
            cols = {2016: ('V161215','V161216','V161217'), 2020: ('V201233','V201234','V201235')}
            do_v, ra_v, wa_v = cols[y]
            do = df[do_v].where(df[do_v].between(1,5))
            ra = df[ra_v].where(df[ra_v].between(1,2))
            wa = df[wa_v].where(df[wa_v].between(1,3))
            trust_c = pd.concat([(5-do)/4, (ra-1)/1, (wa-1)/2], axis=1).mean(axis=1)
            # voter-validated: 1=voted
            vt = pd.to_numeric(df[vote_var], errors='coerce')
            voted_y = vt == 1
        w_y = pd.to_numeric(df[wt_var], errors='coerce').fillna(0).clip(lower=0)
        state_y = pd.to_numeric(df[st_var], errors='coerce')
        m = state_y.isin(fips) & trust_c.notna() & (w_y > 0)
        if m.sum() < 30: continue
        trust_sw = float(np.average(trust_c[m], weights=w_y[m]))
        turnout_sw = float(np.average(voted_y[m].astype(float), weights=w_y[m])) * 100
        rows.append({
            'cycle': y,
            'swing_trust': round(trust_sw, 3),
            'swing_turnout': round(turnout_sw, 1),
            'n': int(m.sum()),
            'source': 'standalone',
        })

    rows.sort(key=lambda r: r['cycle'])

    # Compute correlations
    trust_arr = np.array([r['swing_trust'] for r in rows])
    turnout_arr = np.array([r['swing_turnout'] for r in rows])
    overall_r = float(np.corrcoef(trust_arr, turnout_arr)[0,1])
    pre = [r for r in rows if r['cycle'] <= 2004]
    post = [r for r in rows if r['cycle'] >= 2008]
    pre_r = float(np.corrcoef([r['swing_trust'] for r in pre],
                              [r['swing_turnout'] for r in pre])[0,1]) if len(pre) >= 3 else None
    post_r = float(np.corrcoef([r['swing_trust'] for r in post],
                               [r['swing_turnout'] for r in post])[0,1]) if len(post) >= 3 else None

    payload = {
        'source': 'ANES CDF (1980-2008) + ANES standalone files (2012-2020). 2024 omitted (vote-validated coding shift).',
        'method': (
            'For each cycle, restrict to ANES respondents living in that cycle\'s '
            'battleground states (cycle-specific set, see BG_BY_CYCLE in '
            'build_candidate_honesty_by_trust.py). Compute weighted mean of the '
            'trust composite (CDF: VCF0604rev/0605/0609; 2012: trustgov + trust_social; '
            '2016-2020: do-right/run-for-all/waste). Compute weighted self-reported '
            'turnout (CDF: VCF0702==2; 2012: voted for any candidate; 2016/2020: '
            'voter-validated vote==1).'
        ),
        'caveats': [
            'ANES self-reported turnout over-reports by ~25pp; absolute levels not comparable to VEP. Relative patterns across cycles are meaningful.',
            '2024 omitted: V242065 coding (4=majority of respondents) needs verification.',
            'Trust composite definition shifts between CDF and standalone files; 2012 mean (0.519) sits high because trust_social inflates the composite.',
        ],
        'overall_r': round(overall_r, 3),
        'pre_2008_r': round(pre_r, 3) if pre_r is not None else None,
        'post_2004_r': round(post_r, 3) if post_r is not None else None,
        'cycles': rows,
    }

    out_path = DATA_CLEAN / 'swing_trust_turnout.json'
    with open(out_path, 'w') as f:
        json.dump(payload, f, indent=2)
    print(f'Wrote {out_path}')
    print()
    print(f"{'cyc':>4} {'trust':>7} {'turnout':>8} {'n':>6}")
    for r in rows:
        print(f"{r['cycle']:>4} {r['swing_trust']:>7.3f} {r['swing_turnout']:>7.1f}% {r['n']:>6}")
    print()
    print(f"Pearson r overall: {overall_r:+.3f}")
    print(f"Pre-2008 (n={len(pre)}): r = {pre_r:+.3f}" if pre_r is not None else "")
    print(f"Post-2004 (n={len(post)}): r = {post_r:+.3f}" if post_r is not None else "")


if __name__ == '__main__':
    main()
