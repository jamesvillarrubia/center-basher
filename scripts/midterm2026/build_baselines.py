"""Step 3c: alternative baselines for overperformance -> data/derived/midterm2026/baselines.csv,
merged into races.csv. Run after build_controls.py.

Every baseline is a Democratic-minus-Republican margin (share of all votes x 100) in the
same geography as the 2026 race. Overperformance against baseline B = 2026 Democratic
margin minus B.

Baselines
  harris24     Harris 2024 (existing column harris_margin).
  biden20      Biden 2020. Senate: CNN 2020-PG by state. House: The Downballot, 2020 on 2026
               lines; where that tab is blank (states redrawn for 2026) and the district's
               Harris margin moved <= 1 point between 2024 and 2026 lines, the Downballot
               2024-lines figure (integer-rounded) is used and flagged.
  pres2cyc     Mean of harris24 and biden20.
  prior_seat   Senate: last regular election for the seat (CNN 2020-SG; Georgia uses the
               Jan 2021 runoff; the Florida and Ohio specials use 2022, the seat's last regular
               race). House: 2024 House result in the district (CNN 2024-HG), blank when the
               district was redrawn for 2026 or the 2024 race lacked a D or an R.
  midterm22    Senate: 2022 Senate race in the state (CNN 2022-SG, Georgia's Nov 8 first
               round), blank where no 2022 race was held or no Democrat finished in the top
               two. House: 2022 House result in the district (CNN 2022-HG), blank when the
               district was redrawn between 2022 and 2026 or the race lacked a D or an R.
  house26      Senate rows only: the 2026 statewide House vote (existing column).

Line-change flags (The Downballot sheets, cached under data/raw/midterm2026/downballot/):
  redrawn_2024_2026: |Harris margin, 2026 lines - Harris margin, 2024 lines| > 1 point.
  redrawn_2022_2024: |Biden margin, 2024 lines - Biden margin, 2022 lines| > 1 point.
  The 2024-lines sheet rounds to whole points, hence the 1-point tolerance.

Swing adjustment: each baseline's overperformance minus (national 2026 House margin minus
the national margin of the baseline's cycle). National margins are summed from the same
CNN feeds: presidential baselines use the national presidential vote; Senate and House
prior-race and midterm baselines use the national House vote of that cycle.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import RAW, ROOT, cnn  # noqa: E402
from build_races import norm  # noqa: E402

OUT = ROOT / "data" / "derived" / "midterm2026"
DB = RAW / "downballot"


def cnn_rows(code: str) -> pd.DataFrame:
    rows = []
    for r in cnn(f"national-races/{code}"):
        cs = r["candidates"]
        tot = sum(c["voteNum"] for c in cs)
        dem = sorted([c for c in cs if c["majorParty"] == "DEM"], key=lambda c: -c["voteNum"])
        rep = sorted([c for c in cs if c["majorParty"] == "REP"], key=lambda c: -c["voteNum"])
        k = r["ecKey"].split("-")
        rows.append({"key": r["ecKey"], "kind": k[1], "state": r["stateAbbreviation"],
                     "district": int(k[3]) if len(k) > 3 else 0,
                     "d_last": dem[0]["lastName"] if dem else None, "r_last": rep[0]["lastName"] if rep else None,
                     "dv": dem[0]["voteNum"] if dem else 0, "rv": rep[0]["voteNum"] if rep else 0,
                     "all_d": sum(c["voteNum"] for c in dem), "all_r": sum(c["voteNum"] for c in rep),
                     "tot": tot, "d_inc": bool(dem and dem[0]["isIncumbent"]),
                     "r_inc": bool(rep and rep[0]["isIncumbent"])})
    t = pd.DataFrame(rows)
    t["margin"] = (t.dv - t.rv) / t.tot * 100
    return t


def national(code: str) -> float:
    t = cnn_rows(code)
    return float((t.all_d.sum() - t.all_r.sum()) / t.tot.sum() * 100)


def downballot() -> pd.DataFrame:
    def rd(name, cols, skip):
        p = pd.read_csv(DB / name, skiprows=skip, header=None, dtype=str)
        p = p[p[0].str.match(r"^[A-Z]{2}-(\d\d|AL)$", na=False)].copy()
        p["state"] = p[0].str[:2]
        p["district"] = p[0].str[3:].replace("AL", "1").astype(int)
        for new, idx in cols.items():
            p[new] = pd.to_numeric(p[idx].str.rstrip("%"), errors="coerce")
        return p[["state", "district", *cols]]
    l26 = rd("pres2024_by_cd_2026lines.csv", {"h26": 9, "b26": 16}, 4)
    l24 = rd("1ng1i_Dm_620838163.csv", {"h24": 5, "b24": 8}, 3)
    l22 = rd("1CKngqOp_1871835782.csv", {"b22": 5}, 1)
    d = l26.merge(l24, on=["state", "district"], how="left").merge(l22, on=["state", "district"], how="left")
    d["redrawn_2024_2026"] = (d.h26 - d.h24).abs() > 1.0
    d["redrawn_2022_2024"] = (d.b24 - d.b22).abs() > 1.0
    return d


def main() -> None:
    races = pd.read_csv(OUT / "races.csv")
    an = races[races.dem_vs_rep & races.dem_last.notna() & ((races.chamber == "H") | races.competitive)].copy()
    pres20 = cnn_rows("2020-PG").assign(margin=lambda t: (t.all_d - t.all_r) / t.tot * 100).set_index("state")
    s20 = cnn_rows("2020-SG")
    s22 = cnn_rows("2022-SG")
    h24, h22 = cnn_rows("2024-HG"), cnn_rows("2022-HG")
    db = downballot()
    env = {"pres24": national("2024-PG"), "pres20": national("2020-PG"), "house26": national("2026-HG"),
           "house24": national("2024-HG"), "house22": national("2022-HG"), "house20": national("2020-HG")}
    rows = []
    for x in an.itertuples():
        st, dl = x.state, norm(x.dem_last)
        rl = norm(str(x.rep_nominee).split()[-1]) if isinstance(x.rep_nominee, str) else ""
        row = {"race_id": x.race_id, "base_harris24": x.harris_margin}
        notes = []
        if x.chamber == "S":
            row["base_biden20"] = pres20.margin[st]
            row["biden20_source"] = "CNN 2020-PG (state)"
            # prior race for the seat
            if st in ("FL", "OH"):
                pr = s22[(s22.state == st) & (s22.kind == "SG")].iloc[0]
                row["prior_seat_cycle"] = "2022 regular (seat's last regular race; 2026 is a special)"
                row["prior_seat_env"] = "house22"
            elif st == "GA":
                pr = s20[s20.key == "2020-SW-GA"].iloc[0]
                row["prior_seat_cycle"] = "2020 regular, Jan 5 2021 runoff"
                row["prior_seat_env"] = "house20"
            else:
                pr = s20[(s20.state == st) & (s20.kind == "SG")].iloc[0]
                row["prior_seat_cycle"] = "2020 regular"
                row["prior_seat_env"] = "house20"
            ok = pr.dv > 0 and pr.rv > 0
            row["base_prior_seat"] = pr.margin if ok else np.nan
            row["prior_seat_dem"], row["prior_seat_rep"] = pr.d_last, pr.r_last
            if st == "AK":
                notes.append("2020 Democratic nominee Al Gross ran as an independent (CNN codes him DEM)")
            # midterm 2022
            m = s22[(s22.state == st) & (s22.kind == "SG")]
            if len(m):
                m = m.iloc[0]
                top2 = m.dv > 0 and m.rv > 0 and m.dv >= sorted([m.dv, m.rv, m.tot - m.all_d - m.all_r])[-2]
                row["base_midterm22"] = m.margin if top2 else np.nan
                row["midterm22_note"] = "" if top2 else "no Democrat in the top two (2022 Alaska: Murkowski vs Tshibaka)"
                row["midterm22_dem"], row["midterm22_rep"] = m.d_last, m.r_last
            else:
                row["base_midterm22"] = np.nan
                row["midterm22_note"] = "no 2022 Senate race in the state"
            row["base_house26"] = x.house_statewide_margin
            row["redrawn_2024_2026"] = row["redrawn_2022_2024"] = False
        else:
            d = db[(db.state == st) & (db.district == x.district)].iloc[0]
            row["redrawn_2024_2026"], row["redrawn_2022_2024"] = bool(d.redrawn_2024_2026), bool(d.redrawn_2022_2024)
            if not np.isnan(d.b26):
                row["base_biden20"], row["biden20_source"] = d.b26, "Downballot, 2026 lines"
            elif not row["redrawn_2024_2026"] and not np.isnan(d.b24):
                row["base_biden20"], row["biden20_source"] = d.b24, "Downballot, 2024 lines (district unchanged; whole points)"
            else:
                row["base_biden20"], row["biden20_source"] = np.nan, "none: district redrawn for 2026 and no 2020 figure on 2026 lines"
            p = h24[(h24.state == st) & (h24.district == x.district)]
            row["prior_seat_cycle"], row["prior_seat_env"] = "2024 House", "house24"
            if len(p):
                p = p.iloc[0]
                row["prior_seat_dem"], row["prior_seat_rep"] = p.d_last, p.r_last
                contested = p.dv > 0 and p.rv > 0
                row["base_prior_seat"] = p.margin if contested and not row["redrawn_2024_2026"] else np.nan
                if not contested:
                    notes.append("2024 House race lacked a D or an R")
                if row["redrawn_2024_2026"]:
                    notes.append("district redrawn for 2026: 2024 House result is a different geography")
            m = h22[(h22.state == st) & (h22.district == x.district)]
            if len(m):
                m = m.iloc[0]
                row["midterm22_dem"], row["midterm22_rep"] = m.d_last, m.r_last
                contested = m.dv > 0 and m.rv > 0
                same = not (row["redrawn_2024_2026"] or row["redrawn_2022_2024"])
                row["base_midterm22"] = m.margin if contested and same else np.nan
                row["midterm22_note"] = ("" if contested and same else
                                         "; ".join(([] if contested else ["2022 race lacked a D or an R"])
                                                   + ([] if same else ["district redrawn between 2022 and 2026"])))
            row["base_house26"] = np.nan
        row["base_pres2cyc"] = (row["base_harris24"] + row["base_biden20"]) / 2 if not np.isnan(row["base_biden20"]) else np.nan
        # Candidate-effect contamination of the prior-seat and midterm baselines.
        for b in ("prior_seat", "midterm22"):
            dn, rn = norm(row.get(f"{b}_dem") or ""), norm(row.get(f"{b}_rep") or "")
            row[f"{b}_same_dem"] = bool(dn and (dn == dl or dl.endswith(dn)))
            row[f"{b}_same_rep"] = bool(rn and rl and rn == rl and not (x.state == "SC"))
        if x.state == "SC" and x.chamber == "S":
            notes.append("2020 Republican was Lindsey Graham; 2026 Republican was his appointed successor Darline Graham")
        row["baseline_notes"] = "; ".join(notes)
        rows.append(row)
    b = pd.DataFrame(rows)
    # Overperformance against each baseline, raw and swing-adjusted.
    cyc_env = {"harris24": "pres24", "biden20": "pres20"}
    for name in ["harris24", "biden20", "pres2cyc", "prior_seat", "midterm22", "house26"]:
        dm = an.set_index("race_id").dem_margin.reindex(b.race_id).values
        b[f"over_{name}"] = dm - b[f"base_{name}"]
        if name in cyc_env:
            shift = env["house26"] - env[cyc_env[name]]
        elif name == "pres2cyc":
            shift = env["house26"] - (env["pres24"] + env["pres20"]) / 2
        elif name == "prior_seat":
            shift = b.prior_seat_env.map(lambda e: env["house26"] - env[e])
        elif name == "midterm22":
            shift = env["house26"] - env["house22"]
        else:
            shift = 0.0  # house26 is the same cycle
        b[f"swing_{name}"] = shift
        b[f"over_{name}_adj"] = b[f"over_{name}"] - shift
    b.to_csv(OUT / "baselines.csv", index=False)
    pd.Series(env).rename("national_dem_minus_rep_margin").to_csv(OUT / "national_environment.csv")
    races = races[[c for c in races.columns if c not in b.columns or c == "race_id"]]
    races.merge(b, on="race_id", how="left").to_csv(OUT / "races.csv", index=False)
    print("national environment (D-R, % of all votes):", {k: round(v, 2) for k, v in env.items()})
    print("baselines.csv:", len(b), "rows; missing:",
          {c: int(b[c].isna().sum()) for c in b.columns if c.startswith("base_")})


if __name__ == "__main__":
    main()
