"""
build_warmth_fear_spread.py — §13 turnout by three feeling-quintile measures.

Three ways of slicing how strongly a 2016 voter felt:
- warmth-to-favorite  = max(Clinton thermo, Trump thermo) / 100    ("love your own")
- coldness-to-other   = (100 - min(Clinton thermo, Trump thermo)) / 100   ("fear the other")
- affect-spread       = |Clinton thermo − Trump thermo| / 100     ("love + fear combined")

For each, bin into quintiles and report self-reported turnout (V162034a
presence, weighted by V160101). Thermo items are V161086 / V161087.
"""
import json
import numpy as np
import pandas as pd

from _lib import load_anes_2016, clean_var, DATA_CLEAN


def main():
    d = load_anes_2016()
    w = pd.to_numeric(d["V160101"], errors="coerce").fillna(0).clip(lower=0)

    # Thermometers: 0-100 valid; ANES uses 998 / 999 for refused/don't know etc
    thermo_c = clean_var(d, "V161086", 0, 100)
    thermo_t = clean_var(d, "V161087", 0, 100)
    # V162034a is the post-election presidential vote choice. Codes ≥1 mean
    # voted for somebody (Clinton, Trump, third-party, etc.); codes ≤0 are
    # sentinels (-1 inapplicable / didn't vote; -6/-7/-8/-9 missingness).
    vote = pd.to_numeric(d["V162034a"], errors="coerce")
    voted = (vote >= 1) & (vote <= 9)

    # V161004 = political interest. 1 = very, 2 = somewhat, 3 = not very.
    # The "gettable" subset (per §13 footnote [2]) is V161004 = 3, the voters
    # GOTV is actually trying to reach.
    interest = pd.to_numeric(d["V161004"], errors="coerce")
    is_gettable = (interest == 3)

    base_all      = thermo_c.notna() & thermo_t.notna() & (w > 0)
    base_gettable = base_all & is_gettable

    warmth     = pd.concat([thermo_c, thermo_t], axis=1).max(axis=1) / 100.0
    coldness   = (100.0 - pd.concat([thermo_c, thermo_t], axis=1).min(axis=1)) / 100.0
    spread     = (thermo_c - thermo_t).abs() / 100.0

    def quintile_turnout(metric, label, base):
        m = base & metric.notna()
        x = metric[m]
        ww = w[m]
        yy = voted[m]
        # Equal-count quintiles via pd.qcut. duplicates='drop' handles the
        # repeated-tie case for the coldness metric without collapsing rows.
        try:
            quintile = pd.qcut(x, 5, labels=[1, 2, 3, 4, 5], duplicates='drop')
        except ValueError:
            quintile = pd.qcut(x.rank(method='first'), 5, labels=[1, 2, 3, 4, 5])
        rows = []
        for q in range(1, 6):
            sel = (quintile == q)
            if sel.sum() == 0:
                continue
            ww_q = ww[sel]
            yy_q = yy[sel]
            turnout_pct = float(np.average(yy_q, weights=ww_q)) * 100
            rows.append({
                "q": q,
                "turnout_pct": round(turnout_pct, 1),
                "n_unweighted": int(sel.sum()),
                "metric_low":  round(float(x[sel].min()), 3),
                "metric_high": round(float(x[sel].max()), 3),
            })
        return rows

    # Two passes: full sample and gettable subset.
    warmth_all,    coldness_all,    spread_all    = (
        quintile_turnout(warmth,   "warmth",   base_all),
        quintile_turnout(coldness, "coldness", base_all),
        quintile_turnout(spread,   "spread",   base_all),
    )
    warmth_get,    coldness_get,    spread_get    = (
        quintile_turnout(warmth,   "warmth",   base_gettable),
        quintile_turnout(coldness, "coldness", base_gettable),
        quintile_turnout(spread,   "spread",   base_gettable),
    )

    out = {
        "source": "ANES 2016 Time Series — data/raw/anes_timeseries_2016.dta",
        "variables": [
            "V160101 (weight)",
            "V161086 (Clinton feeling thermometer 0-100)",
            "V161087 (Trump feeling thermometer 0-100)",
            "V162034a (presidential vote; non-missing = turnout proxy)",
        ],
        "definitions": {
            "warmth_to_favorite":   "max(V161086, V161087) / 100  — 'love your own'",
            "coldness_to_other":    "(100 - min(V161086, V161087)) / 100  — 'fear the other'",
            "affect_spread":        "|V161086 - V161087| / 100  — 'love + fear combined'",
        },
        "method": "Weighted quintile binning on each metric; turnout = % of bin with V162034a non-missing, weighted by V160101.",
        "all": {
            "label": "All voters (full ANES 2016 sample)",
            "warmth":   warmth_all,
            "coldness": coldness_all,
            "spread":   spread_all,
        },
        "gettable": {
            "label": "Gettable voters (V161004 = 3, low political interest)",
            "warmth":   warmth_get,
            "coldness": coldness_get,
            "spread":   spread_get,
        },
        "supports": ["plain-language.md §13 [4]", "plain-language.md §13 [5]"],
    }

    out_path = DATA_CLEAN / "warmth_fear_spread.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote {out_path}")
    for label, ws, cs, sp in [
        ("ALL voters",      warmth_all, coldness_all, spread_all),
        ("GETTABLE voters", warmth_get, coldness_get, spread_get),
    ]:
        print()
        print(f"=== {label} ===")
        print(f"{'Q':>4} {'warmth (love own)':>22} {'coldness (fear other)':>26} {'spread (love+fear)':>22}")
        for q in range(1, 6):
            w_row = next((r for r in ws if r['q'] == q), None)
            c_row = next((r for r in cs if r['q'] == q), None)
            s_row = next((r for r in sp if r['q'] == q), None)
            w_str = f"{w_row['turnout_pct']:5.1f}% (n={w_row['n_unweighted']:>3d})" if w_row else "  --  "
            c_str = f"{c_row['turnout_pct']:5.1f}% (n={c_row['n_unweighted']:>3d})" if c_row else "  --  "
            s_str = f"{s_row['turnout_pct']:5.1f}% (n={s_row['n_unweighted']:>3d})" if s_row else "  --  "
            print(f"{q:>4} {w_str:>22} {c_str:>26} {s_str:>22}")


if __name__ == "__main__":
    main()
