"""Reliability of the keyword coder against two blind coders (spec section 8).

Inputs (data/derived/midterm2026/emphasis/): sample_200_keyword.csv (emphasis.py),
coder_a_200.csv and coder_b_200.csv (blind Sonnet coders, codebook in section 3).
Per code: kappa between the two coders; consensus = units where they agree; kappa of the keyword
coder against the consensus. Bars: prices and socialism >= 0.8, every other code >= 0.7.
Output: emphasis_reliability.csv
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
from sklearn.metrics import cohen_kappa_score

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

E = ROOT / "data" / "derived" / "midterm2026" / "emphasis"
CODES = ["prices", "health", "corrupt", "democracy", "abortion", "immig", "crime", "socialism", "war", "process", "bio"]
BAR = {"prices": 0.8, "socialism": 0.8}


def kappa(x, y) -> float:
    return float(cohen_kappa_score(x, y)) if len(set(x) | set(y)) > 1 else float("nan")


def main() -> None:
    k = pd.read_csv(E / "sample_200_keyword.csv").set_index("uid")
    a = pd.read_csv(E / "coder_a_200.csv").set_index("uid")
    b = pd.read_csv(E / "coder_b_200.csv").set_index("uid")
    assert set(k.index) == set(a.index) == set(b.index) and len(k) == 200, "uid sets differ"
    a, b = a.loc[k.index], b.loc[k.index]
    rows = []
    for c in CODES:
        ka, kb, kk = a[c].astype(int), b[c].astype(int), k[c].astype(int)
        agree = ka == kb
        rows.append(dict(code=c, prevalence_a=ka.mean(), prevalence_b=kb.mean(), prevalence_keyword=kk.mean(),
                         kappa_a_b=kappa(ka, kb), pct_agree_a_b=agree.mean(), n_consensus=int(agree.sum()),
                         kappa_keyword_consensus=kappa(kk[agree], ka[agree]),
                         kappa_keyword_a=kappa(kk, ka), kappa_keyword_b=kappa(kk, kb),
                         bar=BAR.get(c, 0.7)))
    r = pd.DataFrame(rows)
    r["passes"] = r.kappa_keyword_consensus >= r.bar
    r.to_csv(E / "emphasis_reliability.csv", index=False)
    pd.set_option("display.width", 200)
    print(r.round(3).to_string())


if __name__ == "__main__":
    main()
