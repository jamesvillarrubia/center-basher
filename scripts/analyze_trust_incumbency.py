"""
Task #7 — cross-year trust-LEVEL incumbency control.

Question: in single-cycle ANES readings (e.g. 2016, taken under Obama), is
Republican institutional trust artificially DEFLATED (their party is out of the
White House) and Democratic trust artificially INFLATED? Quantify the
"in-party-president" bump on trust LEVELS so we can state clearly whether any
party-vs-party trust comparison in a single cycle is confounded by incumbency.

Data: ANES Time Series Cumulative File (CSV), 1958-2024.
Trust item: VCF0604 (trust govt to do what is right; 1=none..4=just about always,
higher = more trust) for the long series. 3-item index (VCF0604/0605/0609) used
where 0604 is absent (2016+). Party: VCF0301 (7pt; 1-3 Dem incl leaners,
5-7 Rep incl leaners). Weight: VCF0009z. Year: VCF0004.
Missing codes treated per the CDF convention: ' ', '0', '9' (+ NaN).
"""
import numpy as np
import pandas as pd
from pathlib import Path

CSV = Path("data/derived/anes_timeseries_cdf_csv_20260205/anes_timeseries_cdf_csv_20260205.csv")

# President's PARTY in the White House at survey time (fall of the even year).
# D = Democratic president, R = Republican president.
PREZ = {
    1958: "R", 1960: "R",                          # Eisenhower
    1962: "D", 1964: "D",                           # Kennedy/Johnson
    1966: "D", 1968: "D",                           # Johnson
    1970: "R", 1972: "R", 1974: "R",               # Nixon/Ford
    1976: "R",                                      # Ford (survey fall '76)
    1978: "D", 1980: "D",                           # Carter
    1982: "R", 1984: "R", 1986: "R", 1988: "R",    # Reagan
    1990: "R", 1992: "R",                           # Bush 41
    1994: "D", 1996: "D", 1998: "D", 2000: "D",    # Clinton
    2002: "R", 2004: "R", 2006: "R", 2008: "R",    # Bush 43
    2010: "D", 2012: "D", 2014: "D", 2016: "D",    # Obama
    2018: "R", 2020: "R",                           # Trump
    2022: "D", 2024: "D",                           # Biden
}

MISS = {" ", "", "0", "9", "8", "nan", "NaN"}

def num(s):
    """Coerce a CDF string column to float, mapping missing tokens to NaN."""
    s = s.astype(str).str.strip()
    s = s.where(~s.isin(MISS), np.nan)
    return pd.to_numeric(s, errors="coerce")

cols = ["VCF0004", "VCF0301", "VCF0303", "VCF0604", "VCF0605", "VCF0609", "VCF0009z"]
df = pd.read_csv(CSV, usecols=lambda c: c in cols, dtype=str, low_memory=False)
print("loaded", len(df), "rows; columns present:", sorted(df.columns))

year = num(df["VCF0004"])
pid7 = num(df["VCF0301"])
w    = num(df["VCF0009z"])

# Trust items -> 0..1, higher = more trust.
t604 = num(df["VCF0604"])           # 1 none .. 4 always
trust604 = (t604 - 1) / 3.0
trust604 = trust604.where(t604.between(1, 4))

t605 = num(df["VCF0605"])           # 1 = run for benefit of all (trusting); 2 = few big interests
trust605 = pd.Series(np.nan, index=df.index)
trust605 = trust605.mask(t605 == 1, 1.0).mask(t605 == 2, 0.0)

t609 = num(df["VCF0609"])           # 1 a lot waste .. 3 not much waste -> higher = more trust
trust609 = (t609 - 1) / 2.0
trust609 = trust609.where(t609.between(1, 3))

# 3-item index = mean of available items (matches project construction spirit).
idx3 = pd.concat([trust604, trust605, trust609], axis=1).mean(axis=1, skipna=True)

party = pd.Series(np.nan, index=df.index, dtype=object)
party = party.mask(pid7.between(1, 3), "D").mask(pid7.between(5, 7), "R")
prez = year.map(PREZ)
inparty = ((party == "D") & (prez == "D")) | ((party == "R") & (prez == "R"))
inparty = inparty.where(party.notna() & prez.notna())

base = pd.DataFrame({"year": year, "party": party, "prez": prez,
                     "inparty": inparty, "w": w, "t604": trust604, "idx3": idx3})

def wmean(d, col):
    m = d[[col, "w"]].dropna()
    return np.average(m[col], weights=m["w"]) if len(m) and m["w"].sum() else np.nan

# ---- Availability: which trust item is present each year ----
print("\n=== non-missing trust counts by year (604 / idx3) ===")
for y in sorted(set(year.dropna())):
    sub = base[base.year == y]
    n604 = sub.t604.notna().sum()
    nidx = sub.idx3.notna().sum()
    if n604 or nidx:
        print(f"{int(y)}: 604 n={n604:5d}  idx3 n={nidx:5d}  prez={PREZ.get(int(y),'?')}")

# ---- By-year Dem vs Rep trust + gap, using best available measure ----
print("\n=== weighted mean trust by party, by year (Dem, Rep, Dem-Rep gap) ===")
print(f"{'year':>5} {'prez':>4} {'measure':>7} {'Dem':>6} {'Rep':>6} {'D-R gap':>8}")
rows = []
for y in sorted(set(year.dropna())):
    sub = base[base.year == y]
    measure = "604" if sub.t604.notna().sum() > 200 else "idx3"
    col = "t604" if measure == "604" else "idx3"
    d = wmean(sub[sub.party == "D"], col)
    r = wmean(sub[sub.party == "R"], col)
    if np.isnan(d) or np.isnan(r):
        continue
    gap = d - r
    rows.append((int(y), PREZ.get(int(y), "?"), measure, d, r, gap))
    print(f"{int(y):>5} {PREZ.get(int(y),'?'):>4} {measure:>7} {d:6.3f} {r:6.3f} {gap:+8.3f}")

res = pd.DataFrame(rows, columns=["year", "prez", "measure", "dem", "rep", "gap"])

# ---- Does the Dem-Rep trust gap track which party holds the WH? ----
print("\n=== mean Dem-Rep trust gap by president's party ===")
for p in ["D", "R"]:
    g = res[res.prez == p].gap
    print(f"  {p}-president years (n={len(g):2d}): mean Dem-Rep gap = {g.mean():+.3f}")
print("  Interpretation: positive gap = Democrats more trusting than Republicans.")
print("  If incumbency drives trust, the gap should be MORE positive under D presidents,")
print("  MORE negative (Reps higher) under R presidents.")

# ---- Pooled in-party bump, netting out year + stable party differences ----
# OLS via numpy: trust ~ rep_dummy + inparty + year fixed effects (weighted).
m = base.dropna(subset=["t604", "inparty", "party", "w", "year"]).copy()
m = m[m.party.isin(["D", "R"])]
yrs = sorted(m.year.unique())
X = np.column_stack([
    np.ones(len(m)),
    (m.party == "R").astype(float).values,
    m.inparty.astype(float).values,
] + [(m.year == yy).astype(float).values for yy in yrs[1:]])  # year FE (drop first)
y = m.t604.values
wv = m.w.values
W = np.sqrt(wv)
Xw = X * W[:, None]
yw = y * W
beta, *_ = np.linalg.lstsq(Xw, yw, rcond=None)
print("\n=== pooled weighted OLS: trust(VCF0604, 0-1) ~ Republican + in-party + year FE ===")
print(f"  n = {len(m)}, cycles = {len(yrs)}  (VCF0604 years only)")
print(f"  Republican (stable party offset): {beta[1]:+.4f}")
print(f"  IN-PARTY-PRESIDENT bump:          {beta[2]:+.4f}   <-- the incumbency effect")
print(f"  => holding your own party in the White House raises stated trust by ~{beta[2]:.3f} on the 0-1 scale,")
print(f"     i.e. ~{beta[2]*3:.2f} points on the original 1-4 'do what is right' scale.")

# ---- 2016 vs 2020 adjacent-cycle flip (Dem prez -> Rep prez), same idx3 items ----
print("\n=== adjacent-cycle check: Dem-Rep trust gap, 2016 (Obama/D) vs 2020 (Trump/R) ===")
for y in [2012, 2016, 2020, 2024]:
    sub = base[base.year == y]
    col = "t604" if sub.t604.notna().sum() > 200 else "idx3"
    d = wmean(sub[sub.party == "D"], col)
    r = wmean(sub[sub.party == "R"], col)
    if not (np.isnan(d) or np.isnan(r)):
        print(f"  {y} (prez={PREZ[y]}, {col}): Dem={d:.3f} Rep={r:.3f}  gap(D-R)={d-r:+.3f}")
