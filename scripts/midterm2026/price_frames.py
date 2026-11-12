"""Price positions in ads (reqts/midterm-2026-leadership-and-price-frames.md, Part B).

  make    every price-or-health text (model codes) -> price_frames/batch_NN.csv (uid, text_blind);
          reliability sample sample_200.csv (100 per party, seed 20261108)
  merge   read coded_NN.csv and coder_a/b_200.csv; check uid sets and 0/1 codes; write
          frame_codes.csv and frame_reliability.csv (kappa vs the two coders' consensus)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402
from emphasis_batches import blind  # noqa: E402
from emphasis_reliability import kappa  # noqa: E402

E = ROOT / "data" / "derived" / "midterm2026" / "emphasis"
F = E / "price_frames"
CAUSE = ["c_tariffs", "c_war", "c_trump_gop", "c_corporate", "c_dem_policy", "c_immigration", "c_none"]
REMEDY = ["r_public", "r_cap", "r_anticorp", "r_taxcut", "r_energy", "r_housing", "r_wages", "r_endtariffs",
          "r_cutspend", "r_protect", "r_none"]
CODES = CAUSE + REMEDY + ["villain"]
PREDICTION_CODES = ["villain", "c_tariffs", "c_war", "c_trump_gop", "c_none", "r_none"]
SIZE = 350


def units() -> pd.DataFrame:
    u = pd.read_csv(E / "units.csv")
    return u[u.prices | u.health].drop_duplicates("uid")[["uid", "party", "text"]]


def make() -> None:
    F.mkdir(parents=True, exist_ok=True)
    u = blind(units())
    if not (F / "sample_200.csv").exists():
        s = pd.concat([u[u.party == p].sample(100, random_state=20261108) for p in ["DEM", "REP"]])
        s[["uid", "text_blind"]].sample(frac=1, random_state=3).to_csv(F / "sample_200.csv", index=False)
    u = u.sample(frac=1, random_state=13).reset_index(drop=True)
    n = int(np.ceil(len(u) / SIZE))
    for i, chunk in enumerate(np.array_split(u, n)):
        chunk[["uid", "text_blind"]].to_csv(F / f"batch_{i:02d}.csv", index=False)
    print(f"{len(u)} texts in {n} batches")


def check(got: pd.DataFrame, src: pd.DataFrame, name: str) -> None:
    assert set(got.uid) == set(src.uid) and len(got) == len(src), f"{name}: uid set differs"
    for k in CODES:
        assert got[k].isin([0, 1]).all(), f"{name}: {k} not 0/1"
    assert ((got.c_none == 1) == (got[CAUSE[:-1]].sum(axis=1) == 0)).all(), f"{name}: c_none rule"
    assert ((got.r_none == 1) == (got[REMEDY[:-1]].sum(axis=1) == 0)).all(), f"{name}: r_none rule"


def merge() -> None:
    parts = []
    for f in sorted(F.glob("batch_*.csv")):
        got = pd.read_csv(F / f.name.replace("batch_", "coded_"))
        check(got, pd.read_csv(f), f.name)
        parts.append(got[["uid", *CODES]])
    m = pd.concat(parts)
    m.to_csv(E / "frame_codes.csv", index=False)
    m = m.set_index("uid")
    s = pd.read_csv(F / "sample_200.csv")
    a = pd.read_csv(F / "coder_a_200.csv")
    b = pd.read_csv(F / "coder_b_200.csv")
    check(a, s, "coder_a")
    check(b, s, "coder_b")
    a, b = a.set_index("uid").loc[s.uid], b.set_index("uid").loc[s.uid]
    rows = []
    for k in CODES:
        agree = a[k] == b[k]
        rows.append(dict(code=k, prevalence_a=a[k].mean(), prevalence_model=m.loc[s.uid, k].mean(),
                         kappa_a_b=kappa(a[k], b[k]), n_consensus=int(agree.sum()),
                         kappa_model_consensus=kappa(m.loc[a.index[agree], k], a.loc[agree, k]),
                         in_prediction=k in PREDICTION_CODES))
    r = pd.DataFrame(rows)
    r["passes"] = r.kappa_model_consensus >= 0.7
    r.to_csv(E / "frame_reliability.csv", index=False)
    print(f"coded texts: {len(m)}")
    print(r.round(3).to_string())


if __name__ == "__main__":
    {"make": make, "merge": merge}[sys.argv[1]]()
