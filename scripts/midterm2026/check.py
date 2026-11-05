"""Checks that pin the dataset to its sources. Prints "N passed, M failed".

Run after build_endorser_lists.py, build_house_primaries.py, build_races.py, analyze.py.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT, wiki_wikitext  # noqa: E402
from _ie import ie  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
results: list[tuple[bool, str]] = []


def check(ok: bool, msg: str) -> None:
    results.append((bool(ok), msg))


def near(a: float, b: float, tol: float) -> bool:
    return a == a and abs(a - b) <= tol


r = pd.read_csv(D / "races.csv")
S = r[r.chamber == "S"].set_index("state")
H = r[r.chamber == "H"].set_index("race_id")
hall = pd.read_csv(D / "house_all.csv").set_index("race_id")
summary = json.loads((D / "summary.json").read_text())

# Third Way, "Moderates Made Democratic Majorities" (Nov 4 2026): vs Harris, vs House Dems.
tw = {"TX": (26, 6), "SC": (22, 7), "KS": (21, 7), "IA": (17, 3), "OH": (16, 2), "GA": (20, 6), "NC": (23, 5)}
for st, (vh, vhouse) in tw.items():
    check(near(S.loc[st, "over_vs_harris"], vh, 1.0), f"TW {st} vs Harris {vh}: got {S.loc[st, 'over_vs_harris']:.1f}")
    check(near(S.loc[st, "over_vs_house_statewide"], vhouse, 1.0),
          f"TW {st} vs House {vhouse}: got {S.loc[st, 'over_vs_house_statewide']:.1f}")
for st, v in {"MI": -2, "MN": -3, "ME": -10}.items():
    check(near(S.loc[st, "over_vs_house_statewide"], v, 1.0), f"TW {st} vs House {v}: got {S.loc[st, 'over_vs_house_statewide']:.1f}")
for st, v in {"MI": 4, "MN": 3, "ME": 11, "FL": 2}.items():
    gap = S.loc[st, "gov_dem_margin"] - S.loc[st, "dem_margin"]
    check(near(gap, v, 1.0), f"TW governor-minus-Senate {st} {v}: got {gap:.1f}")
leftier_mean = S.loc[["MI", "MN", "ME"], "over_vs_harris"].mean()
check(near(leftier_mean, 5, 1.0), f"TW leftier mean vs Harris ~5: got {leftier_mean:.1f}")
mod_mean = S.loc[list(tw), "over_vs_harris"].mean()
check(near(mod_mean, 21, 1.0), f"TW moderate mean vs Harris ~21: got {mod_mean:.1f}")

# Third Way, "Center-Left Democrats Overperformed..." (Nov 5 2026): House examples.
for rid, v in {"TX-15": 43, "PA-08": 17, "NC-11": 25}.items():
    check(near(hall.loc[rid, "over_vs_harris"], v, 1.0), f"TW {rid} vs Harris {v}: got {hall.loc[rid, 'over_vs_harris']:.1f}")
check(near(hall.loc["TX-15", "harris_margin"], -18, 0.5), "TX-15 is Trump+18 in Downballot")
check(summary["house_flips"]["n_mod_endorsed"] == 31, f"moderate-endorsed flips = 31 (TW): got {summary['house_flips']['n_mod_endorsed']}")

# Statewide House vote: CNN sum vs Wikipedia infobox (Texas page).
w = wiki_wikitext("2026_United_States_House_of_Representatives_elections_in_Texas")
d_pct = float(re.search(r"percentage2 = '''([\d.]+)%", w).group(1))
r_pct = float(re.search(r"percentage1 = ([\d.]+)%", w).group(1))
check(near(S.loc["TX", "house_statewide_margin"], d_pct - r_pct, 0.6),
      f"TX House margin CNN {S.loc['TX', 'house_statewide_margin']:.2f} vs Wikipedia {d_pct - r_pct:.2f}")

# FEC independent expenditures.
d = ie()
check(d.amt.max() < 1e8, "no IE line item >= $100M after junk filter")
udp_mi = d[(d.spe_id == "C00799031") & (d.can_office == "S") & (d.can_office_state == "MI")]
check(near(udp_mi.amt.sum() / 1e6, 31.47, 1.6),
      f"UDP Michigan Senate total ~ $31.47M (Responsible Statecraft): got ${udp_mi.amt.sum() / 1e6:.2f}M")
check(S.loc["MI", "aipac_prim_against_nominee"] > 30e6, "AIPAC-network primary money against El-Sayed > $30M")

# Dataset integrity.
an = r[r.dem_vs_rep & r.dem_last.notna() & ((r.chamber == "H") | r.competitive)]
check(an.over_vs_harris.notna().all(), "every analysis row has over_vs_harris")
check(an.harris_margin.notna().all(), "every analysis row has harris_margin")
check(an.b_anointed_strict.notna().all(), "every analysis row has coding b")
check(an.b_source.notna().all(), "every analysis row has a coding-b source note")
check(len(an[an.chamber == "S"]) == 14, f"14 competitive Senate rows with a D-vs-R contest: got {len(an[an.chamber == 'S'])}")
check(S.loc["AK", "house_statewide_margin"] != S.loc["AK", "house_statewide_margin"], "AK House baseline nulled (independent outpolled D)")

# Controls: starting recognition and time on the trail (build_controls.py).
from datetime import date  # noqa: E402
from _primary_dates import table as ncsl  # noqa: E402

nc = ncsl()
check(nc["TX"]["primary"] == date(2026, 3, 3) and nc["KS"]["primary"] == date(2026, 8, 4)
      and nc["IL"]["primary"] == date(2026, 3, 17), "NCSL primary dates: TX Mar 3, KS Aug 4, IL Mar 17")
check(nc["NH"]["primary"] == date(2026, 9, 8), "NCSL NH primary Sep 8 matches Shaheen article ('September 8, 2026')")
check(an.prior_office.isin([0, 1, 2, 3]).all(), "prior_office coded 0-3 for every analysis row")
check(an.prior_office_note.notna().all() and an.nominee_wiki.str.startswith("https://en.wikipedia.org/wiki/").all(),
      "every analysis row has a prior-office note and a source link")
check(an.wiki_revid_nominee.notna().all(), "every nominee source article has a revision id")
check(an.fame_flag.isin([0, 1]).all() and (an.fame_flag == 1).eq(an.fame_note.fillna("").str.len() > 0).all(),
      "fame_flag is 0/1 and every flagged row has a note")
po = an.set_index("race_id").prior_office
check(po["GA-S"] == 3 and po["NC-S"] == 3 and po["OH-S"] == 3 and po["TX-S"] == 1 and po["KS-S"] == 0
      and po["SC-S"] == 0 and po["IA-S"] == 1, "prior office: Ossoff/Cooper/Brown 3, Talarico/Turek 1, Hamilton/Andrews 0")
check(an.set_index("race_id").late_replacement["ME-S"] == 1
      and an.set_index("race_id").launch_date["ME-S"] == "2026-07-25", "Jackson flagged late replacement, launch 2026-07-25")
check(an.days_primary_to_general.notna().all(), "every analysis row has days_primary_to_general")
ok_dates = an.days_on_trail.dropna()
check(len(ok_dates) == 0 or ((ok_dates > 0) & (ok_dates < 2200)).all(), "days_on_trail in (0, 2200) where present")
check(((an.pageviews_12m_pre_launch >= 0) | an.pageviews_12m_pre_launch.isna()).all(), "pageviews non-negative")
lv = an.launch_vs_announce_days.dropna()
check(len(lv) == 0 or (lv.abs() <= 120).mean() >= 0.75,
      f"FEC Form 2 within 120 days of the announcement for >=75% of day-precision rows: {(lv.abs() <= 120).mean() if len(lv) else 'n/a'}")
reg = pd.read_csv(D / "regressions.csv")
for ch in ["S", "H"]:
    for term in ["a_moderate", "b_estab"]:
        have = set(reg[(reg.chamber == ch) & (reg.term == term)].spec)
        check({"base", "+controls"} <= have, f"{ch} {term}: base and +controls specs present")

passed = sum(ok for ok, _ in results)
for ok, msg in results:
    print(("PASS " if ok else "FAIL ") + msg)
print(f"{passed} passed, {len(results) - passed} failed")
sys.exit(0 if passed == len(results) else 1)
