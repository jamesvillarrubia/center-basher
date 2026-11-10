"""C0: party control vs the structure and social agendas, 97th-117th Congress.

Step 1 only (topic counts). Share of non-commemorative public laws in the
structure and social topic sets (reqts/establishment-party.md section 2a), by
unified D, unified R, and divided control. The direction check (does a structure
law favor incumbent industry) needs the hand-coded CBO list and is NOT done here,
so this script cannot pass or refute C0 on its own refutation criterion.
"""
import json

import pandas as pd

from common import DERIVED, RAW, SOCIAL_TOPICS, STRUCTURE_SUBTOPICS, STRUCTURE_TOPICS, control_by_congress

laws = pd.read_csv(RAW / "comparative_agendas/us_public_laws_20.1.csv", encoding="latin-1", low_memory=False)
laws = laws[(laws.filter_commemorative != 1) & laws.congress.between(97, 117)]
laws["set"] = "other"
laws.loc[laws.majortopic.isin(STRUCTURE_TOPICS) | laws.subtopic.isin(STRUCTURE_SUBTOPICS), "set"] = "structure"
laws.loc[laws.majortopic.isin(SOCIAL_TOPICS), "set"] = "social"

ctl = control_by_congress().set_index("congress")
per = laws.groupby(["congress", "set"]).size().unstack(fill_value=0)
per["total"] = per.sum(axis=1)
per["structure_pct"] = (100 * per.structure / per.total).round(1)
per["social_pct"] = (100 * per.social / per.total).round(1)
per = per.join(ctl.control)

by_control = per.groupby("control")[["structure", "social", "total"]].sum()
by_control["structure_pct"] = (100 * by_control.structure / by_control.total).round(1)
by_control["social_pct"] = (100 * by_control.social / by_control.total).round(1)
by_control["congresses"] = per.groupby("control").size()

out = {
    "claim": "C0",
    "step": "topic counts only; direction check pending",
    "by_congress": per.reset_index().to_dict("records"),
    "by_control": by_control.reset_index().to_dict("records"),
    "verdict": "INCOMPLETE",
}
(DERIVED / "c0_control_vs_agenda.json").write_text(json.dumps(out, indent=2, default=int))
print(per[["structure", "social", "total", "structure_pct", "social_pct", "control"]].to_string())
print(by_control.to_string())
