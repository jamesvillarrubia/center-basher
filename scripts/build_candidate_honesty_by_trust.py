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


# Who held the White House + EC winner + popular-vote winner
META = {
    1980: { 'inpower': 'D', 'dem_name': 'Carter',   'rep_name': 'Reagan',   'ec_winner': 'Reagan',  'pv_winner': 'Reagan'  },
    1984: { 'inpower': 'R', 'dem_name': 'Mondale',  'rep_name': 'Reagan',   'ec_winner': 'Reagan',  'pv_winner': 'Reagan'  },
    1988: { 'inpower': 'R', 'dem_name': 'Dukakis',  'rep_name': 'Bush GHW', 'ec_winner': 'Bush GHW','pv_winner': 'Bush GHW' },
    1992: { 'inpower': 'R', 'dem_name': 'Clinton',  'rep_name': 'Bush GHW', 'ec_winner': 'Clinton', 'pv_winner': 'Clinton' },
    1996: { 'inpower': 'D', 'dem_name': 'Clinton',  'rep_name': 'Dole',     'ec_winner': 'Clinton', 'pv_winner': 'Clinton' },
    2000: { 'inpower': 'D', 'dem_name': 'Gore',     'rep_name': 'Bush GWB', 'ec_winner': 'Bush GWB','pv_winner': 'Gore'    },
    2004: { 'inpower': 'R', 'dem_name': 'Kerry',    'rep_name': 'Bush GWB', 'ec_winner': 'Bush GWB','pv_winner': 'Bush GWB' },
    2008: { 'inpower': 'R', 'dem_name': 'Obama',    'rep_name': 'McCain',   'ec_winner': 'Obama',   'pv_winner': 'Obama'   },
    2012: { 'inpower': 'D', 'dem_name': 'Obama',    'rep_name': 'Romney',   'ec_winner': 'Obama',   'pv_winner': 'Obama'   },
    2016: { 'inpower': 'D', 'dem_name': 'Clinton',  'rep_name': 'Trump',    'ec_winner': 'Trump',   'pv_winner': 'Clinton' },
    2020: { 'inpower': 'R', 'dem_name': 'Biden',    'rep_name': 'Trump',    'ec_winner': 'Biden',   'pv_winner': 'Biden'   },
    2024: { 'inpower': 'D', 'dem_name': 'Harris',   'rep_name': 'Trump',    'ec_winner': 'Trump',   'pv_winner': 'Trump'   },
}

# Standalone-file ratings (already on a 0-4 scale with HIGH = more honest).
# 2012 from ANES 2012 Time Series (ctrait_dpchonst/ctrait_rpchonst,
# rescaled 1-5 → 0-4 via 5-x; trust from trustgov_grev|grstd + trust_social).
# 2016/2020/2024 from §9 footnote [1] / fig-9c-cycle-cards.js data.
RECENT = {
    2012: { 'dem_low_trust': 2.01, 'rep_low_trust': 1.39 },
    2016: { 'dem_low_trust': 0.54, 'rep_low_trust': 1.58 },
    2020: { 'dem_low_trust': 1.43, 'rep_low_trust': 0.96 },
    2024: { 'dem_low_trust': 0.98, 'rep_low_trust': 1.39 },
}

# Expanded swing-state set (FIPS codes). Big 5 + NC/AZ/GA/NV — used as
# fallback for the trust-mean denominator and as the legacy chart input.
EXPANDED_SWING_FIPS = frozenset({42, 26, 55, 39, 12,  # PA, MI, WI, OH, FL
                                 37, 4, 13, 32})       # NC, AZ, GA, NV

# Cycle-specific battlegrounds (FIPS codes). Drawn from pre-election
# toss-up consensus per cycle. Pre-1992 sets approximate "closest 5-8
# contests" since the battleground concept doesn't cleanly apply to
# Reagan-era national waves. Modern (1992+) sets reflect Cook/Sabato-
# style consensus toss-ups.
BG_BY_CYCLE = {
    1980: [42, 39, 17, 26, 55, 34, 29, 9],          # PA OH IL MI WI NJ MO CT
    1984: [25, 27, 19, 44, 15],                      # MA MN IA RI HI
    1988: [42, 17, 26, 24, 29, 35, 34],              # PA IL MI MD MO NM NJ
    1992: [39, 12, 13, 37, 34, 9, 33, 21, 32],       # OH FL GA NC NJ CT NH KY NV
    1996: [47, 12, 39, 21, 32, 4, 13],               # TN FL OH KY NV AZ GA
    2000: [12, 39, 35, 19, 33, 55, 42, 26, 41],      # FL OH NM IA NH WI PA MI OR
    2004: [39, 42, 26, 55, 12, 35, 32, 19, 33, 27],  # OH PA MI WI FL NM NV IA NH MN
    2008: [39, 42, 12, 51, 37, 18, 8, 29, 32, 33, 30],  # OH PA FL VA NC IN CO MO NV NH MT
    2012: [39, 12, 51, 37, 8, 32, 33, 19, 55],       # OH FL VA NC CO NV NH IA WI
    2016: [26, 55, 42, 12, 39, 37, 4, 19],           # MI WI PA FL OH NC AZ IA
    2020: [42, 26, 55, 4, 13, 37, 12, 32],           # PA MI WI AZ GA NC FL NV
    2024: [42, 26, 55, 4, 13, 37, 32],               # PA MI WI AZ GA NC NV
}

# FIPS codes of battleground states where D won that cycle (used to
# compute the swing winner via "majority of contested states won").
# Cross-verified against state CofE certified results.
BG_D_WINS_BY_CYCLE = {
    1980: set(),                              # Reagan sweep of bg
    1984: {27},                                # MN only (Mondale's home)
    1988: set(),                               # Bush swept all listed bg
    1992: {39, 13, 34, 9, 33, 21, 32},         # OH GA NJ CT NH KY NV (Clinton; lost FL NC)
    1996: {47, 12, 39, 32, 4},                 # TN FL OH NV AZ (Clinton; lost KY GA)
    2000: {35, 19, 55, 42, 26, 41},            # NM IA WI PA MI OR (Gore; lost FL OH NH)
    2004: {42, 26, 55, 33, 27},                # PA MI WI NH MN (Kerry; lost OH FL NM NV IA)
    2008: {39, 42, 12, 51, 37, 18, 8, 32, 33}, # OH PA FL VA NC IN CO NV NH (Obama; lost MO MT)
    2012: {39, 12, 51, 8, 32, 33, 19, 55},     # OH FL VA CO NV NH IA WI (Obama; lost NC)
    2016: set(),                               # Trump won all listed bg
    2020: {42, 26, 55, 4, 13, 32},             # PA MI WI AZ GA NV (Biden; lost NC FL)
    2024: set(),                               # Trump won all listed bg
}

# Weighted mean of the trust composite (0-1 scale, HIGH=more trust) per cycle.
# CDF (1980-2008): VCF0604(rev)/0605/0609 — same composite the tercile is cut on.
# 2012: trustgov_grev|grstd + trust_social — same as the tercile composite.
# 2016/2020/2024: 3-item gov-trust composite from the standalone files
# (do-right + run-for-all + waste), normalized 0-1 HIGH=trust.
TRUST_MEAN = {
    1980: 0.401, 1984: 0.416, 1988: 0.428, 1992: 0.396, 1996: 0.406,
    2000: 0.423, 2004: 0.459, 2008: 0.367, 2012: 0.519, 2016: 0.231,
    2020: 0.239, 2024: 0.242,
}

# Cycles where the Critics' Dem-vs-Rep gap is too small to call a "pick"
# (|gap| < WASH_THRESHOLD on the 0-4 honesty scale). Coin-flippy cycles.
WASH_THRESHOLD = 0.20

# Authenticity-Floor rule thresholds. Above TRUST_HIGH and with a narrow
# Critics gap (< GAP_LARGE), in-power party retains. Below the trust
# floor, OR with a big Critics gap, Critics' pick wins.
TRUST_HIGH = 0.41
GAP_LARGE  = 0.30

# Hand-curated D 2-party vote share in the canonical Big-5 battleground
# states (PA, MI, WI, OH, FL) per cycle. Source: state CofE certified
# results. Each value is D% / (D% + R%) for that state.
BIG5 = {
    1980: { 'PA': 46.1, 'MI': 43.5, 'WI': 46.6, 'OH': 43.8, 'FL': 39.4 },
    1984: { 'PA': 46.3, 'MI': 39.5, 'WI': 46.0, 'OH': 41.3, 'FL': 35.9 },
    1988: { 'PA': 48.8, 'MI': 46.4, 'WI': 51.6, 'OH': 45.4, 'FL': 39.1 },
    1992: { 'PA': 55.6, 'MI': 51.5, 'WI': 50.6, 'OH': 47.5, 'FL': 47.0 },
    1996: { 'PA': 55.1, 'MI': 56.7, 'WI': 55.0, 'OH': 52.4, 'FL': 51.5 },
    2000: { 'PA': 52.2, 'MI': 52.6, 'WI': 50.1, 'OH': 48.2, 'FL': 50.0 },
    2004: { 'PA': 51.3, 'MI': 51.7, 'WI': 50.2, 'OH': 48.9, 'FL': 47.5 },
    2008: { 'PA': 55.2, 'MI': 57.9, 'WI': 56.4, 'OH': 51.4, 'FL': 51.4 },
    2012: { 'PA': 52.7, 'MI': 54.7, 'WI': 52.6, 'OH': 50.7, 'FL': 50.2 },
    2016: { 'PA': 49.6, 'MI': 49.9, 'WI': 49.6, 'OH': 45.8, 'FL': 49.4 },
    2020: { 'PA': 50.6, 'MI': 51.4, 'WI': 50.3, 'OH': 47.5, 'FL': 48.7 },
    2024: { 'PA': 49.2, 'MI': 49.4, 'WI': 49.6, 'OH': 45.0, 'FL': 45.5 },
}

# National VEP turnout % (voting-eligible population). Source: US
# Elections Project (Michael McDonald), https://electproject.org.
TURNOUT_VEP = {
    1980: 52.6, 1984: 53.3, 1988: 50.3, 1992: 58.1, 1996: 51.7, 2000: 54.2,
    2004: 60.1, 2008: 61.6, 2012: 58.6, 2016: 60.1, 2020: 66.6, 2024: 63.9,
}

# In-power party 2-party national PV share (D/(D+R) when in-power=D, else
# R/(D+R)). From CQ Press / state CofE certified results.
IN_POWER_2P_SHARE = {
    1980: 44.7, 1984: 59.2, 1988: 53.9, 1992: 45.3, 1996: 55.2, 2000: 50.0,
    2004: 51.2, 2008: 46.2, 2012: 51.6, 2016: 51.1, 2020: 47.7, 2024: 49.2,
}

# Cycle ordering for delta calculations
_PRIOR_CYCLE = {y: prev for y, prev in zip(
    sorted(IN_POWER_2P_SHARE), [None] + sorted(IN_POWER_2P_SHARE)[:-1]
)}

def authenticity_floor_predict(gap, trust_mean, inpower, dem_name, rep_name):
    """The Authenticity Floor decision tree. Returns predicted winner name."""
    if abs(gap) >= GAP_LARGE:
        return dem_name if gap > 0 else rep_name
    if trust_mean >= TRUST_HIGH:
        # in-power party retains
        return dem_name if inpower == 'D' else rep_name
    # low trust + narrow Critics' edge: in-power loses (Critics' direction)
    return dem_name if gap >= 0 else rep_name


def _assemble_row(y, dem_avg, rep_avg, source, meta):
    gap        = dem_avg - rep_avg
    trust_mean = TRUST_MEAN.get(y)
    # Big-5 D-share (legacy; kept for the baseline-regime chart)
    swing      = BIG5.get(y) or {}
    swing_d    = round(sum(swing.values()) / len(swing), 2) if swing else None
    # CYCLE-SPECIFIC battleground winner: majority of bg states won by D
    bg_states  = BG_BY_CYCLE.get(y, [])
    bg_d_wins  = BG_D_WINS_BY_CYCLE.get(y, set())
    bg_n       = len(bg_states)
    bg_d_n     = len(bg_d_wins)
    bg_d_share_states = round(100.0 * bg_d_n / bg_n, 1) if bg_n else None
    swing_winner = (meta['dem_name'] if bg_n and bg_d_n * 2 > bg_n
                    else meta['rep_name'] if bg_n else None)
    predicted = authenticity_floor_predict(
        gap, trust_mean, meta['inpower'], meta['dem_name'], meta['rep_name'],
    )
    prior_to = TURNOUT_VEP.get(_PRIOR_CYCLE.get(y)) if _PRIOR_CYCLE.get(y) else None
    cur_to   = TURNOUT_VEP.get(y)
    delta_to = (cur_to - prior_to) if (prior_to is not None and cur_to is not None) else None
    return {
        'cycle':           y,
        'dem_low_trust':   round(dem_avg, 2),
        'rep_low_trust':   round(rep_avg, 2),
        'gap':             round(gap, 2),
        'is_wash':         abs(gap) < WASH_THRESHOLD,
        'trust_mean':      trust_mean,
        'turnout_vep':     cur_to,
        'turnout_delta':   round(delta_to, 1) if delta_to is not None else None,
        'turnout_surge':   (delta_to is not None and delta_to >= 2.0),
        'in_power_2p_share': IN_POWER_2P_SHARE.get(y),
        'swing_d_share':   swing_d,                   # Big-5 avg D 2pty share
        'bg_states_n':     bg_n,                       # # cycle-specific bg states
        'bg_d_wins_n':     bg_d_n,                     # # of those D won
        'bg_d_share_states': bg_d_share_states,        # % of bg states D won
        'swing_winner':    swing_winner,               # by majority of bg states
        'predicted_winner': predicted,
        'rule_hits_pv':    predicted == meta['pv_winner'],
        'rule_hits_ec':    predicted == meta['ec_winner'],
        'rule_hits_swing': swing_winner is None or predicted == swing_winner,
        'source':          source,
        **meta,
    }

def norm(s, lo, hi, reverse=False):
    x = (s - lo) / (hi - lo)
    return (1 - x) if reverse else x


def _compute_swing_recent(year):
    """Compute (dem_swing, rep_swing) honesty among low-trust voters
    in CYCLE-SPECIFIC battleground states from the standalone ANES file.
    Returns (None, None, n) if year not handled."""
    import numpy as np
    bg_set = set(BG_BY_CYCLE.get(year, [])) or EXPANDED_SWING_FIPS
    if year == 2012:
        df = pd.read_stata('data/raw/anes_2012/anes_timeseries_2012.dta',
                            convert_categoricals=False,
                            columns=['ctrait_dpchonst','ctrait_rpchonst',
                                     'trustgov_trustgrev','trustgov_trustgstd',
                                     'trust_social','weight_full','sample_stfips'])
        hd = (5 - df['ctrait_dpchonst'].where(df['ctrait_dpchonst'].between(1,5)))
        hr = (5 - df['ctrait_rpchonst'].where(df['ctrait_rpchonst'].between(1,5)))
        g_rev = df['trustgov_trustgrev'].where(df['trustgov_trustgrev'].between(1,5))
        g_std = df['trustgov_trustgstd'].where(df['trustgov_trustgstd'].between(1,4))
        g_trust = ((g_rev - 1) / 4.0).fillna((4 - g_std) / 3.0)
        s_trust = (5 - df['trust_social'].where(df['trust_social'].between(1,5))) / 4.0
        trust = pd.concat([g_trust, s_trust], axis=1).mean(axis=1)
        w = df['weight_full'].fillna(0).clip(lower=0)
        state = pd.to_numeric(df['sample_stfips'], errors='coerce')
    elif year == 2016:
        from _lib import load_anes_2016
        df = load_anes_2016()
        do_right = df['V161215'].where(df['V161215'].between(1,5))
        run_all  = df['V161216'].where(df['V161216'].between(1,2))
        waste    = df['V161217'].where(df['V161217'].between(1,3))
        trust = pd.concat([(5-do_right)/4, (run_all-1)/1, (waste-1)/2], axis=1).mean(axis=1)
        # V161162 = Dem (Clinton) "is honest" trait; V161167 = Rep (Trump). 1=very well..5=not well.
        hd = 5 - df['V161162'].where(df['V161162'].between(1,5))
        hr = 5 - df['V161167'].where(df['V161167'].between(1,5))
        w = pd.to_numeric(df.get('V160102', df.get('V160101')), errors='coerce').fillna(0).clip(lower=0)
        state = pd.to_numeric(df['V161010d'], errors='coerce')
    elif year == 2020:
        from _lib import load_anes_2020
        df = load_anes_2020()
        do_right = df['V201233'].where(df['V201233'].between(1,5))
        run_all  = df['V201234'].where(df['V201234'].between(1,2))
        waste    = df['V201235'].where(df['V201235'].between(1,3))
        trust = pd.concat([(5-do_right)/4, (run_all-1)/1, (waste-1)/2], axis=1).mean(axis=1)
        # V201211 = Biden honest; V201215 = Trump honest. Verified to reproduce hardcoded RECENT.
        hd = 5 - df['V201211'].where(df['V201211'].between(1,5))
        hr = 5 - df['V201215'].where(df['V201215'].between(1,5))
        w = pd.to_numeric(df.get('V200010a', df.get('V200010b')), errors='coerce').fillna(0).clip(lower=0)
        state = pd.to_numeric(df['V201014b'], errors='coerce')
    elif year == 2024:
        from _lib import load_anes_2024
        df = load_anes_2024()
        do_right = df['V241229'].where(df['V241229'].between(1,5))
        run_all  = df['V241231'].where(df['V241231'].between(1,2))
        waste    = df['V241232'].where(df['V241232'].between(1,3))
        trust = pd.concat([(5-do_right)/4, (run_all-1)/1, (waste-1)/2], axis=1).mean(axis=1)
        # V241203 = Harris honest; V241208 = Trump honest. Verified.
        hd = 5 - df['V241203'].where(df['V241203'].between(1,5))
        hr = 5 - df['V241208'].where(df['V241208'].between(1,5))
        w = pd.to_numeric(df.get('V240107a', df.get('V240107')), errors='coerce').fillna(0).clip(lower=0)
        state_str = df['V243002'].astype(str).str.strip()
        state = pd.to_numeric(state_str, errors='coerce')
    else:
        return None, None, 0

    m = hd.notna() & hr.notna() & trust.notna() & (w > 0)
    if m.sum() < 100:
        return None, None, 0
    cutoff = trust[m].quantile(1/3)
    sel = m & (trust <= cutoff) & state.isin(bg_set)
    if sel.sum() < 30:
        return None, None, int(sel.sum())
    import numpy as np
    # Cast to float arrays since pandas where() can leave object dtype on some columns
    dem_vals = pd.to_numeric(hd[sel], errors='coerce').astype(float)
    rep_vals = pd.to_numeric(hr[sel], errors='coerce').astype(float)
    weights  = pd.to_numeric(w[sel], errors='coerce').astype(float)
    dem_avg = float(np.average(dem_vals, weights=weights))
    rep_avg = float(np.average(rep_vals, weights=weights))
    return dem_avg, rep_avg, int(sel.sum())


def main():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    w  = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)
    state = pd.to_numeric(cdf["VCF0901a"], errors="coerce")

    # Trust composite
    t1 = cdf_num(cdf["VCF0604"])
    t2 = cdf_num(cdf["VCF0605"])
    t3 = cdf_num(cdf["VCF0609"])
    trust = pd.concat([
        norm(t1, 1, 5, reverse=True),
        norm(t2, 1, 2, reverse=False),
        norm(t3, 1, 3, reverse=False),
    ], axis=1).mean(axis=1)

    # Candidate honesty items (1=extremely well..4=not well at all).
    # VCF0354/0355 covers 1980-2008; VCF0358/0359 is a closely related
    # candidate-character trait that also has 2012 data, used as a
    # back-fill for that one cycle only.
    h_dem      = pd.to_numeric(cdf["VCF0354"], errors="coerce").where(lambda x: x.between(1, 4))
    h_rep      = pd.to_numeric(cdf["VCF0355"], errors="coerce").where(lambda x: x.between(1, 4))
    h_dem_alt  = pd.to_numeric(cdf["VCF0358"], errors="coerce").where(lambda x: x.between(1, 4))
    h_rep_alt  = pd.to_numeric(cdf["VCF0359"], errors="coerce").where(lambda x: x.between(1, 4))

    out = []
    for y in sorted(META):
        meta = META[y]

        if y in RECENT:
            r = RECENT[y]
            d, rp = r['dem_low_trust'], r['rep_low_trust']
            row = _assemble_row(y, d, rp, 'standalone', meta)
            # Compute swing-state-only version for recent cycles
            ds, rs, n_sw = _compute_swing_recent(y)
            row['dem_low_trust_swing'] = round(ds, 2) if ds is not None else None
            row['rep_low_trust_swing'] = round(rs, 2) if rs is not None else None
            row['n_swing'] = n_sw
            if ds is not None and rs is not None:
                row['gap_swing']    = round(ds - rs, 2)
                row['is_wash_swing'] = abs(ds - rs) < WASH_THRESHOLD
            out.append(row)
            continue

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

        row = _assemble_row(y, dem_avg, rep_avg, 'cdf VCF0354/0355', meta)

        # Swing-state subset: same trust tercile cut, then filter to
        # cycle-specific battleground FIPS.
        bg_set_y = set(BG_BY_CYCLE.get(y, [])) or EXPANDED_SWING_FIPS
        sel_sw = m & (trust <= cutoff) & state.isin(bg_set_y)
        n_sw = int(sel_sw.sum())
        if n_sw >= 30:
            dem_sw = float(np.average((4 - h_dem[sel_sw]), weights=w[sel_sw])) * 4.0/3.0
            rep_sw = float(np.average((4 - h_rep[sel_sw]), weights=w[sel_sw])) * 4.0/3.0
            row['dem_low_trust_swing'] = round(dem_sw, 2)
            row['rep_low_trust_swing'] = round(rep_sw, 2)
            row['gap_swing']    = round(dem_sw - rep_sw, 2)
            row['is_wash_swing'] = abs(dem_sw - rep_sw) < WASH_THRESHOLD
        else:
            row['dem_low_trust_swing'] = None
            row['rep_low_trust_swing'] = None
        row['n_swing'] = n_sw
        out.append(row)

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
            'Pre-2012 (CDF) and 2012+ (standalone files) use different underlying ANES '
            'items with different question wordings; rescaled to a common 0-4 axis. '
            'The qualitative claim (which candidate is higher among Critics) is robust '
            'across both sources.',
            '2012 from ANES 2012 Time Series standalone (ctrait_dpchonst/ctrait_rpchonst, '
            '1-5 → 0-4 via 5-x); trust composite from trustgov_grev|grstd + trust_social.',
            '1972 and 1976 are omitted (honesty trait not asked in CDF for those cycles).',
        ],
    }

    out_path = DATA_CLEAN / 'candidate_honesty_by_trust.json'
    with open(out_path, 'w') as f:
        json.dump(payload, f, indent=2)
    print(f'Wrote {out_path}')
    print()
    print(f"{'cyc':>4} {'trust':>6} {'gap':>6} {'swD%':>6} {'TO%':>5} {'predict':>10} "
          f"{'PV':>10} {'EC':>10} {'Swing':>10} {'p/e/s':>6}")
    pv_hits = ec_hits = sw_hits = 0
    for r in out:
        pv = '✓' if r['rule_hits_pv'] else '✗'
        ec = '✓' if r['rule_hits_ec'] else '✗'
        sw = '✓' if r['rule_hits_swing'] else '✗'
        pv_hits += r['rule_hits_pv']
        ec_hits += r['rule_hits_ec']
        sw_hits += r['rule_hits_swing']
        sw_d = r['swing_d_share'] if r['swing_d_share'] is not None else 0
        print(f"{r['cycle']:>4} {r['trust_mean']:>6.3f} {r['gap']:>+6.2f} {sw_d:>6.2f} "
              f"{r['turnout_vep']:>5.1f} {r['predicted_winner']:>10} "
              f"{r['pv_winner']:>10} {r['ec_winner']:>10} "
              f"{r['swing_winner'] or '-':>10} {pv}{ec}{sw:>4}")
    n = len(out)
    print(f"\nAuthenticity-Floor rule: PV {pv_hits}/{n}  EC {ec_hits}/{n}  Swing {sw_hits}/{n}")


if __name__ == '__main__':
    main()
