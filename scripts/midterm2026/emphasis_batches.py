"""Batches for blind model coding of every distinct ad text (spec section 11).

  make   data/derived/midterm2026/emphasis/batches/batch_NN.csv (uid, text_blind), ~350 texts each
  make-new  after a re-fetch: texts with no model code go to new batches numbered after the last
  merge  read batches/coded_NN.csv, check every uid is coded once with valid 0/1 codes and the
         process/bio rule, write model_codes.csv; score against the sample 1 and 2 consensus
"""
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from emphasis import ads  # noqa: E402
from emphasis_reliability import BAR, CODES, kappa  # noqa: E402

E = ROOT / "data" / "derived" / "midterm2026" / "emphasis"
B = E / "batches"
SIZE = 350
PARTIAL = "--partial" in sys.argv  # skip batches still being coded (interim check only)
ISSUES = CODES[:9]


def make() -> None:
    B.mkdir(parents=True, exist_ok=True)
    u = pd.read_csv(E / "units.csv").drop_duplicates("uid")[["uid", "text"]]
    names = sorted({p for n in ads().nominee.unique() for p in {n, n.split()[-1]} if len(p) > 2}, key=len, reverse=True)
    rx = re.compile(r"\b(?:" + "|".join(map(re.escape, names)) + r")\b")  # case-sensitive
    u["text_blind"] = u.text.map(lambda t: rx.sub("[NAME]", t))
    u = u.sample(frac=1, random_state=11).reset_index(drop=True)
    n = int(np.ceil(len(u) / SIZE))
    for i, chunk in enumerate(np.array_split(u, n)):
        chunk[["uid", "text_blind"]].to_csv(B / f"batch_{i:02d}.csv", index=False)
    print(f"{len(u)} texts in {n} batches")


def blind(u: pd.DataFrame) -> pd.DataFrame:
    names = sorted({p for n in ads().nominee.unique() for p in {n, n.split()[-1]} if len(p) > 2}, key=len, reverse=True)
    rx = re.compile(r"\b(?:" + "|".join(map(re.escape, names)) + r")\b")  # case-sensitive
    return u.assign(text_blind=u.text.map(lambda t: rx.sub("[NAME]", t)))


def make_new() -> None:
    a = ads()
    a = a[a.text.str.len() > 0].copy()
    a["uid"] = a.text.map(lambda t: hashlib.sha1(re.sub(r"\s+", " ", t.lower()).encode()).hexdigest()[:12])
    coded = set(pd.read_csv(E / "model_codes.csv").uid)
    u = a[~a.uid.isin(coded)].drop_duplicates("uid")[["uid", "text"]]
    u = blind(u).sample(frac=1, random_state=12).reset_index(drop=True)
    start = 1 + max(int(f.stem.split("_")[1]) for f in B.glob("batch_*.csv"))
    n = int(np.ceil(len(u) / SIZE))
    for i, chunk in enumerate(np.array_split(u, n)):
        chunk[["uid", "text_blind"]].to_csv(B / f"batch_{start + i:02d}.csv", index=False)
    print(f"{len(u)} new texts in batches {start}..{start + n - 1}")


def merge() -> None:
    parts = []
    for f in sorted(B.glob("batch_*.csv")):
        c = B / f.name.replace("batch_", "coded_")
        src = pd.read_csv(f)
        if not c.exists():
            print(f"missing {c.name}")
            continue
        got = pd.read_csv(c)
        if PARTIAL and (set(got.uid) != set(src.uid) or len(got) != len(src)):
            print(f"incomplete {c.name}: {len(got)} of {len(src)}")
            continue
        assert set(got.uid) == set(src.uid) and len(got) == len(src), f"{c.name}: uid set differs"
        for k in CODES:
            assert got[k].isin([0, 1]).all(), f"{c.name}: {k} not 0/1"
        issue = got[ISSUES].sum(axis=1) > 0
        assert ((issue & (got.process + got.bio == 0)) | (~issue & (got.process + got.bio == 1))).all(), f"{c.name}: process/bio rule"
        parts.append(got[["uid", *CODES]])
    m = pd.concat(parts)
    m.to_csv(E / "model_codes.csv", index=False)
    m = m.set_index("uid")
    rows = []
    for name, x, y in [("1", "coder_a_200.csv", "coder_b_200.csv"), ("2", "coder_c_200.csv", "coder_d_200.csv")]:
        a = pd.read_csv(E / x).set_index("uid")
        b = pd.read_csv(E / y).set_index("uid").loc[a.index]
        ok = a.index.isin(m.index)
        for k in CODES:
            agree = (a[k] == b[k]) & ok
            rows.append(dict(sample=name, code=k, n=int(agree.sum()),
                             kappa_model_consensus=kappa(m.loc[a.index[agree], k].astype(int), a.loc[agree, k].astype(int)),
                             bar=BAR.get(k, 0.7)))
    r = pd.DataFrame(rows)
    r["passes"] = r.kappa_model_consensus >= r.bar
    r.to_csv(E / "model_reliability.csv", index=False)
    print(f"coded texts: {len(m)}")
    print(r.round(3).to_string())


if __name__ == "__main__":
    {"make": make, "make-new": make_new, "merge": merge}[sys.argv[1]]()
