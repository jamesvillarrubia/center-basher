"""
build_trust_by_cohort.py — §0 generational trust collapse, 1958–2024.

Splices ANES CDF (1958–2012) with ANES standalone files (2016, 2020, 2024)
because VCF0604 is absent from CDF for 2016+. Same underlying question
("how much of the time do you think you can trust the government in
Washington to do what is right") asked in every wave; coding differs
between CDF and standalones.

- CDF VCF0604 in this release: 1=never, 4=always (4-pt scale; SCALE
  REVERSED from traditional ANES codebook, verified empirically against
  Pew's 77%-in-1964 headline — codes 3+4 give 77.7% for 1964).
- ANES standalone 2016 V161215, 2020 V201233, 2024 V241229: 5-pt scale
  with traditional coding (1=always, 5=never).

"High trust" share = "always or most of the time":
- CDF: codes 3+4
- Standalone: codes 1+2

Cohorts use standard Pew generational birth-year ranges. Supports §0.
"""
import numpy as np
import pandas as pd
import json

from _lib import cdf_num, clean_var, load_anes_cdf, load_anes_2016, load_anes_2020, load_anes_2024, DATA_CLEAN


COHORTS = [
    ("Greatest",   1927, 1900),
    ("Silent",     1945, 1928),
    ("Boomer",     1964, 1946),
    ("Gen X",      1980, 1965),
    ("Millennial", 1996, 1981),
    ("Gen Z",      2012, 1997),
]


def cohort_label(birth_year):
    if pd.isna(birth_year): return None
    for label, max_b, min_b in COHORTS:
        if min_b <= birth_year <= max_b:
            return label
    return None


def cycle_rows(year, birth_yr, trust_high_mask, weight, trust_raw):
    """Compute national + per-cohort % high trust for a single cycle.

    trust_raw is the underlying numeric trust variable (NaN if item not
    asked that wave); we use its notna() for the base mask because the
    boolean mask is True/False everywhere and can't distinguish 'item
    not asked' from 'asked but not high trust.'"""
    base = birth_yr.notna() & trust_raw.notna() & (weight > 0)
    if base.sum() < 200:
        return []
    rows = []
    nat_pct = float(np.average(trust_high_mask[base], weights=weight[base])) * 100
    rows.append({"year": int(year), "cohort": "National", "trust_pct": round(nat_pct, 1), "n": int(base.sum())})
    for label, max_b, min_b in COHORTS:
        m = base & birth_yr.between(min_b, max_b)
        n = int(m.sum())
        if n < 30: continue
        pct = float(np.average(trust_high_mask[m], weights=weight[m])) * 100
        rows.append({"year": int(year), "cohort": label, "trust_pct": round(pct, 1), "n": n})
    return rows


def from_cdf():
    cdf = load_anes_cdf()
    yr = pd.to_numeric(cdf["VCF0004"], errors="coerce")
    wt = pd.to_numeric(cdf["VCF0009z"], errors="coerce").fillna(0).clip(lower=0)
    age = cdf_num(cdf["VCF0101"])
    birth = (yr - age).round()
    t = cdf_num(cdf["VCF0604"])
    trust_high = t.isin([3, 4])  # CDF SCALE INVERTED: 3=most, 4=always
    rows = []
    for y in sorted(yr.dropna().unique()):
        if y < 1958 or y > 2014: continue
        m_yr = (yr == y)
        rows.extend(cycle_rows(y, birth[m_yr], trust_high[m_yr], wt[m_yr], t[m_yr]))
    return rows


def from_standalone_2016():
    d = load_anes_2016()
    w = clean_var(d, "V160101", 0, 1e9).fillna(0).clip(lower=0)
    age = clean_var(d, "V161267", 18, 100)
    birth = 2016 - age
    t = clean_var(d, "V161215", 1, 5)
    trust_high = t.isin([1, 2])
    return cycle_rows(2016, birth, trust_high, w, t)


def from_standalone_2020():
    d = load_anes_2020()
    w = pd.to_numeric(d["V200010a"], errors="coerce").fillna(0).clip(lower=0)
    age = clean_var(d, "V201507x", 18, 100)
    birth = 2020 - age
    t = clean_var(d, "V201233", 1, 5)
    trust_high = t.isin([1, 2])
    return cycle_rows(2020, birth, trust_high, w, t)


def from_standalone_2024():
    d = load_anes_2024()
    for w_col in ["V240107a", "V240107b", "V240108a"]:
        if w_col in d.columns:
            w = pd.to_numeric(d[w_col], errors="coerce").fillna(0).clip(lower=0)
            if w.sum() > 0: break
    else:
        w = pd.Series(1.0, index=d.index)
    age = clean_var(d, "V241458x", 18, 100)
    birth = 2024 - age
    t = clean_var(d, "V241229", 1, 5)
    trust_high = t.isin([1, 2])
    return cycle_rows(2024, birth, trust_high, w, t)


def main():
    rows = from_cdf() + from_standalone_2016() + from_standalone_2020() + from_standalone_2024()

    df = pd.DataFrame(rows).sort_values(["cohort", "year"])
    csv_path = DATA_CLEAN / "trust_by_cohort.csv"
    df.to_csv(csv_path, index=False)

    series = {}
    for cohort in ["National", "Greatest", "Silent", "Boomer", "Gen X", "Millennial", "Gen Z"]:
        sub = df[df["cohort"] == cohort].sort_values("year")
        if not sub.empty:
            series[cohort] = [{"year": int(r.year), "trust_pct": float(r.trust_pct), "n": int(r.n)} for r in sub.itertuples()]
    json_path = DATA_CLEAN / "trust_by_cohort.json"
    with open(json_path, "w") as f:
        json.dump({
            "source": "ANES CDF 1958-2012 (VCF0604) + ANES standalone 2016/2020/2024 (V161215/V201233/V241229). Headline metric: % saying 'always or most of the time.' Coding differs by source (see build_trust_by_cohort.py).",
            "series": series,
        }, f, indent=2)
    print(f"Wrote {csv_path} and {json_path}")
    print()
    print("National vs cohort trust (% always or most):")
    pivot = df.pivot(index="year", columns="cohort", values="trust_pct")
    cols = [c for c in ["National", "Greatest", "Silent", "Boomer", "Gen X", "Millennial", "Gen Z"] if c in pivot.columns]
    print(pivot[cols].to_string(float_format=lambda x: f"{x:5.1f}" if pd.notna(x) else "  .  "))


if __name__ == "__main__":
    main()
