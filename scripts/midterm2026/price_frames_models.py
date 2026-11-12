"""Frozen predictions F1 to F4 (reqts/midterm-2026-leadership-and-price-frames.md, section 6).

Per candidate, general-election window: share of price-or-health ad money (spend midpoint) whose
text carries each frame code (frame_codes.csv). Codes below their reliability bar
(frame_reliability.csv) are reported and left out of the models.
Output: data/derived/midterm2026/emphasis/frame_shares.csv, frame_models.csv
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
from emphasis import ads, primary_dates  # noqa: E402
from emphasis_models import CTRL, FLOOR, fit, row  # noqa: E402
from house_drivers import frame  # noqa: E402
from price_frames import CODES  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
E = D / "emphasis"
GROUPS = {"trump_blame": ["c_tariffs", "c_war", "c_trump_gop"]}


def shares() -> pd.DataFrame:
    a = ads()
    a = a[a.text.str.len() > 0].copy()
    a["uid"] = a.text.map(lambda t: hashlib.sha1(re.sub(r"\s+", " ", t.lower()).encode()).hexdigest()[:12])
    a["start"] = pd.to_datetime(a.start, errors="coerce")
    a["general"] = a.start > a.race_id.map(primary_dates()).fillna(pd.Timestamp("2026-06-01"))
    fc = pd.read_csv(E / "frame_codes.csv").set_index("uid")
    g = a[a.general & a.uid.isin(fc.index)].join(fc, on="uid")
    for k, cols in GROUPS.items():
        g[k] = g[cols].max(axis=1)
    g["vague"] = ((g.c_none == 1) & (g.r_none == 1)).astype(int)
    codes = CODES + list(GROUPS) + ["vague"]
    rows = []
    for (rid, party), x in g.groupby(["race_id", "party"]):
        tot = x.spend_mid.sum()
        r = dict(race_id=rid, party=party, spend_price_health=tot, n_ads=len(x))
        for k in codes:
            r[f"{k}_share"] = x.loc[x[k] == 1, "spend_mid"].sum() / tot if tot > 0 else np.nan
        rows.append(r)
    return pd.DataFrame(rows)


def main() -> None:
    rel = pd.read_csv(E / "frame_reliability.csv").set_index("code")
    failed = set(rel.index[~rel.passes])
    s = shares()
    s.to_csv(E / "frame_shares.csv", index=False)
    cs = pd.read_csv(E / "candidate_shares.csv")
    cs["complete"] = ~cs.file_truncated.astype(bool) & cs.file_error.isna()
    s = s.merge(cs[["race_id", "party", "spend_all", "complete"]], on=["race_id", "party"], how="left")
    keep = s[(s.spend_all >= FLOOR) & s.complete]

    # F4: party gap in mean share, every code
    m = keep.groupby("party")[[c for c in keep.columns if c.endswith("_share")]].mean().T
    m["gap_d_minus_r"] = m.DEM - m.REP
    m = m.assign(reliable=[c.removesuffix("_share") not in failed for c in m.index])
    print("mean share of price-or-health ad money, candidates >= $10k, complete files:")
    print((m * [100, 100, 100, 1]).round(1).sort_values("gap_d_minus_r").to_string())

    h = frame().set_index("race_id")
    fund = pd.read_csv(D / "house_funding.csv").drop_duplicates("race_id").set_index("race_id")[["log_money_ratio"]]
    d = keep[keep.party == "DEM"].set_index("race_id")
    d = h.join(d, how="inner").join(fund).reset_index()
    rows = []
    preds = [("F1 villain share", "villain_share", {"villain"}),
             ("F2 Trump-blame share", "trump_blame_share", set(GROUPS["trump_blame"])),
             ("F3 vague share", "vague_share", {"c_none", "r_none"})]
    explore = [(f"explore {c}", f"{c}_share", {c}) for c in CODES if c not in {"villain"}]
    for label, term, need in preds + explore:
        nz = int((d[term] > 0).sum())
        note = f"per +10 share points; {nz} Democrats with any" + ("; UNRELIABLE code" if need & failed else "") + \
            ("; TOO FEW (< 15) to read" if nz < 15 else "")
        mm = fit(f"over_vs_harris ~ {term} + {CTRL}", d)
        rows.append(row(label, "Democrat >= $10k", mm, term, 0.1, note))
        dm = d.dropna(subset=["log_money_ratio"])
        mm = fit(f"over_vs_harris ~ {term} + log_money_ratio + {CTRL}", dm)
        rows.append(row(label + " + money", "Democrat >= $10k", mm, term, 0.1, note))
    out = pd.DataFrame(rows)
    out.to_csv(E / "frame_models.csv", index=False)
    m.to_csv(E / "frame_party_means.csv")
    pd.set_option("display.width", 220)
    print(f"Democrats in models: {len(d)}")
    print(out.round(3).to_string())


if __name__ == "__main__":
    main()
