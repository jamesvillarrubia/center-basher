"""Reliability of the keyword coder against two blind coders (spec section 8).

Inputs (data/derived/midterm2026/emphasis/): sample 1 (tuning: sample_200_keyword.csv, coder_a/b) and
sample 2 (validation: sample2_200_keyword.csv, coder_c/d). Only sample 2 decides pass/fail (section 9).
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


SAMPLES = {"1": ("sample_200_keyword.csv", "coder_a_200.csv", "coder_b_200.csv", "tuning"),
           "2": ("sample2_200_keyword.csv", "coder_c_200.csv", "coder_d_200.csv", "validation")}


def run(which: str) -> pd.DataFrame:
    kf, af, bf, role = SAMPLES[which]
    k = pd.read_csv(E / kf).set_index("uid")
    a = pd.read_csv(E / af).set_index("uid")
    b = pd.read_csv(E / bf).set_index("uid")
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
    r = pd.DataFrame(rows).assign(sample=which, role=role)
    r["passes"] = r.kappa_keyword_consensus >= r.bar
    return r


def main() -> None:
    which = [w for w in SAMPLES if all((E / f).exists() for f in SAMPLES[w][:3])]
    r = pd.concat([run(w) for w in which])
    r.to_csv(E / "emphasis_reliability.csv", index=False)
    pd.set_option("display.width", 220)
    print(r[["sample", "role", "code", "kappa_a_b", "kappa_keyword_consensus", "bar", "passes"]].round(3).to_string())


if __name__ == "__main__":
    main()
