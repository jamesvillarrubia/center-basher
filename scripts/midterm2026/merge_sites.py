"""Merge the campaign-site coding pass into positions_final.csv.

Inputs: positions/coder_a_sites.csv and positions/coder_b_sites.csv, two blind codings of the
rendered campaign-site text captured for the 23 nominees with fewer than 3 sourced items
(data/raw/midterm2026/sites/, manifest.csv). Agreement and rulings are logged to
positions/reconciled_sites.csv.

Rulings (parent, 2026-11-06; also in reqts/progressive-position-rubric.md):
  AK-S item 10   +1  coders split; "block anti-competitive mergers that let grocery chains ..."
                     names a monopoly with a remedy (ruling for item 10).
  SC-S item 2    +1  coders split; "End tax breaks for the ultra-wealthy" is a tax action aimed
                     at a named top group (item 2 ruling, 2026-11-06).
  TN-09 item 2   +1  both coders 0; "Taxing the income of the richest people in our country"
                     falls under the same item 2 ruling, which MN-02 ("a tax on the
                     ultrawealthy") already set at +1.
  MD-05 item 2   +1  existing cell was 0 with the reason "fair-share language"; the page says
                     "closing loopholes that let big corporations and the ultra-wealthy avoid
                     paying their fair share", a loophole closure aimed at a named top group
                     (rubric example: "close billionaire tax loopholes"). Wayback 2026-06-22,
                     before the 2026-06-23 primary.
A reconciled non-zero cell replaces an existing 0. An existing non-zero cell is never
overwritten; any conflict is printed and logged. Known conflict: FL-25 item 1, site text +0.5
("moving toward a Medicare for All system") against the existing +1 for cosponsoring H.R. 3069;
the cosponsorship stands.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

P = ROOT / "data" / "derived" / "midterm2026" / "positions"
WB = "https://web.archive.org/web/{ts}/{url}"

RULINGS = {
    ("AK-S", 10): ("a", "sites_parent_ruling", "coders split; named monopoly (grocery chains) with remedy (block mergers), item 10 ruling"),
    ("SC-S", 2): ("b", "sites_parent_ruling", "coders split; tax action aimed at the ultra-wealthy, item 2 ruling 2026-11-06"),
}
EXTRA = [
    dict(race_id="TN-09", item=2, score=1.0, quote="Taxing the income of the richest people in our country",
         source_file="data/raw/midterm2026/sites/TN-09/wayback_pre_primary__issues.txt", variant="wayback_pre_primary",
         source_url="https://web.archive.org/web/20260509215117/https://www.votejustinj.com/issues", source_date="2026-05-09",
         pre_primary=True,
         resolution="sites_parent_ruling",
         note="both coders 0; tax action aimed at the richest, item 2 ruling 2026-11-06, consistent with MN-02"),
    dict(race_id="MD-05", item=2, score=1.0,
         quote="closing loopholes that let big corporations and the ultra-wealthy avoid paying their fair share",
         source_url="https://web.archive.org/web/20260622203055/https://www.adrianboafo.com/issues",
         source_date="2026-06-22", pre_primary=True, resolution="parent_ruling_item2_consistency",
         note="was 0 as fair-share language; loophole closure aimed at a named top group, item 2 ruling 2026-11-06"),
]


def main() -> None:
    a = pd.read_csv(P / "coder_a_sites.csv")
    b = pd.read_csv(P / "coder_b_sites.csv")
    m = a.merge(b, on=["race_id", "item"], suffixes=("_a", "_b"))
    man = pd.read_csv(ROOT / "data" / "raw" / "midterm2026" / "sites" / "manifest.csv", dtype=str)
    rows = []
    for r in m.itertuples():
        agree = r.score_a == r.score_b
        if agree and r.score_a == 0:
            continue
        side, res, note = ("a", "sites_agree", "both coders") if agree else RULINGS[(r.race_id, r.item)]
        g = lambda k: getattr(r, f"{k}_{side}")  # noqa: E731
        rows.append(dict(race_id=r.race_id, item=r.item, score=g("score"), coder_a_score=r.score_a, coder_b_score=r.score_b,
                         quote=g("quote"), source_file=g("source_file"), page_url=g("page_url"), variant=g("variant"),
                         wayback_timestamp=g("wayback_timestamp"), resolution=res, note=note))
    for e in EXTRA:
        rows.append({**e, "coder_a_score": None, "coder_b_score": None})
    rec = pd.DataFrame(rows)

    def url(row):
        if isinstance(row.get("source_url"), str):
            return row["source_url"]
        if str(row["variant"]).startswith("wayback") and pd.notna(row.get("wayback_timestamp")):
            return WB.format(ts=str(row["wayback_timestamp"]).split(".")[0], url=row["page_url"])
        if pd.isna(row.get("page_url")):
            hit = man[(man.race_id == row["race_id"]) & (man.variant == row["variant"])
                      & man.page_url.apply(lambda u: str(row["source_file"]).endswith("__" + str(u).rstrip("/").split("/")[-1] + ".txt"))]
            if len(hit):
                h = hit.iloc[0]
                return WB.format(ts=h.wayback_timestamp, url=h.page_url) if h.variant.startswith("wayback") else h.page_url
        return row.get("page_url")

    def date(row):
        if isinstance(row.get("source_date"), str):
            return row["source_date"]
        ts = str(row.get("wayback_timestamp") or "")
        if str(row["variant"]).startswith("wayback") and len(ts.split(".")[0]) >= 8:
            t = ts.split(".")[0]
            return f"{t[:4]}-{t[4:6]}-{t[6:8]}"
        if pd.isna(row.get("wayback_timestamp")) and str(row["variant"]).startswith("wayback"):
            hit = man[(man.race_id == row["race_id"]) & (man.variant == row["variant"])].wayback_timestamp.dropna()
            if len(hit):
                t = str(hit.iloc[0])
                return f"{t[:4]}-{t[4:6]}-{t[6:8]}"
        return "2026-11-06"

    rec["source_url"] = rec.apply(url, axis=1)
    rec["source_date"] = rec.apply(date, axis=1)
    rec["pre_primary"] = rec.apply(lambda x: bool(x["pre_primary"]) if isinstance(x.get("pre_primary"), bool)
                                   else x["variant"] == "wayback_pre_primary", axis=1)
    assert rec.source_url.notna().all() and rec.quote.notna().all(), "a non-zero cell lacks a URL or quote"

    pf = pd.read_csv(P / "positions_final.csv")
    conflicts = []
    for r in rec.itertuples():
        idx = pf.index[(pf.race_id == r.race_id) & (pf.item == r.item)]
        assert len(idx) == 1, (r.race_id, r.item)
        i = idx[0]
        cur = pf.at[i, "score"]
        if cur != 0 and cur != r.score:
            conflicts.append((r.race_id, r.item, cur, r.score))
            continue
        if cur == r.score and cur != 0:
            continue
        pf.loc[i, ["score", "evidence_type", "indirect", "source_date", "pre_primary", "source_url", "quote", "resolution"]] = [
            r.score, "own_words", False, r.source_date, r.pre_primary, r.source_url, r.quote, r.resolution]
        pf.at[i, "searched_note"] = f"Sites pass 2026-11-06 ({r.resolution}): {r.note}. Prior note: {pf.at[i, 'searched_note']}"
    assert not pf[(pf.score != 0) & (pf.race_id != "THIRDWAY")].source_url.isna().any(), "non-zero cell without URL"
    pf.to_csv(P / "positions_final.csv", index=False)
    rec.to_csv(P / "reconciled_sites.csv", index=False)
    print(f"reconciled non-zero cells: {len(rec)}; written to positions_final: {len(rec) - len(conflicts)}; conflicts: {conflicts}")
    print(rec.groupby("resolution").size().to_dict())


if __name__ == "__main__":
    main()
