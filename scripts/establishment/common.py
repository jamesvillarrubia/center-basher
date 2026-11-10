"""Shared paths and Congress metadata for the Establishment-essay analyses."""
from pathlib import Path

import pandas as pd

RAW = Path("/Users/james/Sites/personal/center-basher/data/raw")
DERIVED = Path(__file__).resolve().parents[2] / "data" / "derived" / "establishment"
DERIVED.mkdir(parents=True, exist_ok=True)

# Frozen coding rule, reqts/establishment-party.md section 2a (CAP major topics).
STRUCTURE_TOPICS = {1, 8, 10, 14, 15, 17}
STRUCTURE_SUBTOPICS = {1803}
SOCIAL_TOPICS = {2, 9, 12}

# President's party by Congress (100 = D, 200 = R). Transition Congresses take the
# president who served most of the two years.
PRES_PARTY = {97: 200, 98: 200, 99: 200, 100: 200, 101: 200, 102: 200, 103: 100,
              104: 100, 105: 100, 106: 100, 107: 200, 108: 200, 109: 200, 110: 200,
              111: 100, 112: 100, 113: 100, 114: 100, 115: 200, 116: 200, 117: 100,
              118: 100, 119: 200}


def chamber_majorities() -> pd.DataFrame:
    """Seat-count majority party per chamber per Congress, from Voteview members."""
    m = pd.read_csv(RAW / "voteview/HSall_members.csv",
                    usecols=["congress", "chamber", "party_code", "icpsr"])
    m = m[m.chamber.isin(["House", "Senate"])].drop_duplicates(["congress", "chamber", "icpsr"])
    counts = m.groupby(["congress", "chamber", "party_code"]).size().unstack(fill_value=0)
    out = pd.DataFrame({"D": counts.get(100, 0), "R": counts.get(200, 0)})
    out["majority"] = (out.R > out.D).map({True: 200, False: 100})
    return out.reset_index()


def control_by_congress() -> pd.DataFrame:
    maj = chamber_majorities().pivot(index="congress", columns="chamber", values="majority")
    # Seat counts over a whole Congress include replacements, so tie or switch
    # Senates are set by hand: 107th (Jeffords switch, June 2001) counts as divided;
    # 117th (50-50, VP Harris) counts as Democratic. 110th: 49 D + 2 independents
    # caucusing with Democrats vs 49 R, so Democratic.
    maj.loc[107, "Senate"] = 0
    maj.loc[110, "Senate"] = 100
    maj.loc[117, "Senate"] = 100
    rows = []
    for c, r in maj.loc[97:119].iterrows():
        p = PRES_PARTY[c]
        unified = r.House == r.Senate == p
        rows.append({"congress": int(c), "president": p, "house": int(r.House),
                     "senate": int(r.Senate),
                     "control": ("unified_D" if p == 100 else "unified_R") if unified else "divided"})
    return pd.DataFrame(rows)
