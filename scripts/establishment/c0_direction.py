"""C0 step 2: direction of Mayhew's important laws by party control.

Rubric: reqts/establishment-direction-rubric.md (frozen before coding).
Inputs: two blind coders' files. Reports agreement, then the C0 test per coder
and on the laws both coders agree on.
"""
import json

import pandas as pd

from common import DERIVED, control_by_congress


def kappa(a: pd.Series, b: pd.Series) -> float:
    po = (a == b).mean()
    cats = set(a) | set(b)
    pe = sum((a == c).mean() * (b == c).mean() for c in cats)
    return float((po - pe) / (1 - pe))


laws = pd.read_csv(DERIVED / "mayhew_laws_1981_2024.csv")
a = pd.read_csv(DERIVED / "coder_a.csv").set_index("id")
b = pd.read_csv(DERIVED / "coder_b.csv").set_index("id")
df = laws.set_index("id").join(a[["set", "direction"]]).join(b[["set", "direction"]], rsuffix="_b")
df = df.rename(columns={"set": "set_a", "direction": "dir_a", "direction_b": "dir_b"})
df = df.join(control_by_congress().set_index("congress").control, on="congress")

agree = {
    "set_pct": round(100 * float((df.set_a == df.set_b).mean()), 1),
    "set_kappa": round(kappa(df.set_a, df.set_b), 2),
    "direction_pct": round(100 * float((df.dir_a == df.dir_b).mean()), 1),
    "direction_kappa": round(kappa(df.dir_a, df.dir_b), 2),
    "opposite_signs": int(((df.dir_a * df.dir_b) == -1).sum()),
}


def test(sub: pd.DataFrame, s: str, d: str) -> dict:
    st = sub[sub[s] == "structure"]
    res = {}
    for ctl in ["unified_D", "unified_R", "divided"]:
        g = st[st.control == ctl]
        res[ctl] = {"n": int(len(g)),
                    "toward_pct": round(100 * float((g[d] == 1).mean()), 1) if len(g) else None,
                    "away_pct": round(100 * float((g[d] == -1).mean()), 1) if len(g) else None}
    gap = abs(res["unified_D"]["toward_pct"] - res["unified_R"]["toward_pct"])
    res["gap_toward_D_vs_R"] = round(gap, 1)
    res["verdict"] = "REFUTED" if gap > 15 else "SURVIVES"
    return res


both = df[(df.set_a == df.set_b) & (df.dir_a == df.dir_b)]
out = {
    "claim": "C0",
    "agreement": agree,
    "coder_a": test(df, "set_a", "dir_a"),
    "coder_b": test(df, "set_b", "dir_b"),
    "agreed_only": test(both, "set_a", "dir_a"),
    "agreed_n": int(len(both)),
}
# Unified-control structure laws, for reading.
uni = df[(df.control != "divided") & ((df.set_a == "structure") | (df.set_b == "structure"))]
out["unified_structure_laws"] = uni.reset_index()[["id", "congress", "control", "title", "dir_a", "dir_b"]].to_dict("records")
(DERIVED / "c0_direction.json").write_text(json.dumps(out, indent=2, default=str))
print(json.dumps({k: v for k, v in out.items() if k != "unified_structure_laws"}, indent=1))
print(uni[["congress", "control", "title", "dir_a", "dir_b"]].to_string())
