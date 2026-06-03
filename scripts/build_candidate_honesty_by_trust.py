"""
build_candidate_honesty_by_trust.py — §16 candidate honesty crossover among
System Critics across multiple presidential cycles.

Pre-2016 cycles (1980-2008): pulled from ANES Cumulative Data File via
VCF0354 (Dem candidate honesty) and VCF0355 (Rep candidate honesty),
both on a 1-4 "fits how well" scale (1=extremely well, 4=not well).
We rescale to 0-3 with HIGH = more honest, then * (4/3) so it lives on
the same 0-4 axis as the standalone-file 2016+ numbers.

Recent cycles (2016/2020/2024): the validated 0-4 numbers already used
in fig-9 and elsewhere are hard-coded here for consistency.

For each cycle we compute the weighted mean honesty rating among
System Critics (bottom trust tercile that cycle).
"""
import json
import numpy as np
import pandas as pd

from _lib import cdf_num, load_anes_cdf, DATA_CLEAN


# Who held the White House going into each cycle's election + who won
META = {
    1980: { 'inpower': 'D', 'dem_name': 'Carter',   'rep_name': 'Reagan',   'winner': 'Reagan'  },
    1984: { 'inpower': 'R', 'dem_name': 'Mondale',  'rep_name': 'Reagan',   'winner': 'Reagan'  },
    1988: { 'inpower': 'R', 'dem_name': 'Dukakis',  'rep_name': 'Bush GHW', 'winner': 'Bush GHW' },
    1992: { 'inpower': 'R', 'dem_name': 'Clinton',  'rep_name': 'Bush GHW', 'winner': 'Clinton' },
    1996: { 'inpower': 'D', 'dem_name': 'Clinton',  'rep_name': 'Dole',     'winner': 'Clinton' },
    2000: { 'inpower': 'D', 'dem_name': 'Gore',     'rep_name': 'Bush GWB', 'winner': 'Bush GWB' },
    2004: { 'inpower': 'R', 'dem_name': 'Kerry',    'rep_name': 'Bush GWB', 'winner': 'Bush GWB' },
    2008: { 'inpower': 'R', 'dem_name': 'Obama',    'rep_name': 'McCain',   'winner': 'Obama'   },
    2016: { 'inpower': 'D', 'dem_name': 'Clinton',  'rep_name': 'Trump',    'winner': 'Trump'   },
    2020: { 'inpower': 'R', 'dem_name': 'Biden',    'rep_name': 'Trump',    'winner': 'Biden'   },
    2024: { 'inpower': 'D', 'dem_name': 'Harris',   'rep_name': 'Trump',    'winner': 'Trump'   },
}

# Standalone-file ratings (already on a 0-4 scale with HIGH = more honest).
# Source: §9 footnote [1] / fig-9c-cycle-cards.js data.
RECENT = {
    2016: { 'dem_low_trust': 0.54, 'rep_low_trust': 1.58 },
    2020: { 'dem_low_trust': 1.43, 'rep_low_trust': 0.96 },
    2024: { 'dem_low_trust': 0.98, 'rep_low_trust': 1.39 },
}

def norm(s, lo, hi, reverse=False):
    x = (s - lo) / (hi - lo)
    return (1 - x) if reverse else x


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    w  = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)

    # Trust composite
    t1 = cdf_num(cdf["VCF0604"])
    t2 = cdf_num(cdf["VCF0605"])
    t3 = cdf_num(cdf["VCF0609"])
    trust = pd.concat([
        norm(t1, 1, 5, reverse=True),
        norm(t2, 1, 2, reverse=False),
        norm(t3, 1, 3, reverse=False),
    ], axis=1).mean(axis=1)

    # Candidate honesty items (1=extremely well..4=not well at all)
    h_dem = pd.to_numeric(cdf["VCF0354"], errors="coerce").where(lambda x: x.between(1, 4))
    h_rep = pd.to_numeric(cdf["VCF0355"], errors="coerce").where(lambda x: x.between(1, 4))

    out = []
    for y in sorted(META):
        meta = META[y]

        if y in RECENT:
            # Use the existing 0-4 scaled standalone values
            r = RECENT[y]
            out.append({
                'cycle':           y,
                'dem_low_trust':   round(r['dem_low_trust'], 2),
                'rep_low_trust':   round(r['rep_low_trust'], 2),
                'source':          'standalone',
                **meta,
            })
            continue

        # CDF: tercile-cut trust this cycle, compute mean honesty
        # rating (rescaled 0-3 → 0-4 via *4/3) for each candidate among
        # the bottom tercile.
        m = (yr == y) & h_dem.notna() & h_rep.notna() & trust.notna() & (w > 0)
        if m.sum() < 100:
            print(f"  skip {y}: insufficient obs ({m.sum()})")
            continue

        cutoff = trust[m].quantile(1/3)
        low = trust[m] <= cutoff

        dem_low = (4 - h_dem[m])[low]   # rescale to 0-3
        rep_low = (4 - h_rep[m])[low]
        ww      = w[m][low]

        # Rescale 0-3 → 0-4 for visual parity with standalone-file cycles
        dem_avg = float(np.average(dem_low, weights=ww)) * 4.0/3.0
        rep_avg = float(np.average(rep_low, weights=ww)) * 4.0/3.0

        out.append({
            'cycle':           y,
            'dem_low_trust':   round(dem_avg, 2),
            'rep_low_trust':   round(rep_avg, 2),
            'source':          'cdf (rescaled 0-3 → 0-4)',
            **meta,
        })

    payload = {
        'source': 'ANES Cumulative Data File (1980-2008) + ANES standalone files (2016/2020/2024).',
        'variables': [
            'VCF0354 (Dem candidate honesty, 1=fits very well..4=not well)',
            'VCF0355 (Rep candidate honesty, same scale)',
            'VCF0604/0605/0609 (3-item trust composite)',
            'VCF0009z (weight)',
        ],
        'method': (
            'Per cycle: tercile-cut trust composite on full electorate. '
            'Compute weighted mean of CANDIDATE HONESTY among the bottom tercile '
            '(System Critics). Pre-2016 CDF values rescaled from 0-3 to 0-4 via *4/3 '
            'to share an axis with the standalone-file 2016+ ratings.'
        ),
        'cycles': out,
        'caveats': [
            'Pre-2016 (CDF) and 2016+ (standalone) use different underlying ANES items '
            'with different question wordings. The rescaled values are roughly '
            'comparable but not identical. The qualitative claim (which candidate is '
            'higher among Critics) is robust to this rescaling.',
            'VCF0354/0355 are absent in the CDF for 1972, 1976, and 2012, so those cycles '
            'are not included.',
        ],
    }

    out_path = DATA_CLEAN / 'candidate_honesty_by_trust.json'
    with open(out_path, 'w') as f:
        json.dump(payload, f, indent=2)
    print(f'Wrote {out_path}')
    print()
    print(f"{'cycle':>6} {'in-power':>10} {'Dem (low-tr)':>14} {'Rep (low-tr)':>14} {'higher':>10} {'won':>10}")
    for r in out:
        higher = 'Dem' if r['dem_low_trust'] > r['rep_low_trust'] else 'Rep'
        print(f"{r['cycle']:>6} {r['inpower']:>10} {r['dem_low_trust']:>13.2f} {r['rep_low_trust']:>13.2f} {higher:>10} {r['winner']:>10}")


if __name__ == '__main__':
    main()
