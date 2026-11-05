"""Step 3b: starting name recognition and time on the campaign trail -> data/derived/midterm2026/controls.csv

Merged into races.csv by build_races.py (columns listed in README.md).

Prior office (ordinal, highest office held at launch, including the current one):
  3 = statewide elected (by voters), 2 = U.S. House, 1 = state legislature or a
  citywide office in a top-25 U.S. city, 0 = none of these. County, municipal,
  district-attorney and appointed offices are 0, flagged in `local_office`.
  Source per nominee: the nominee's Wikipedia article (revision in `wiki_revid_nominee`);
  the cited sentence is in `prior_office_note`.
Fame flag: 1 when the article documents prominence outside elected office that
  predates launch (national media, sport, religion, family name). Note in `fame_note`.
Launch: earliest FEC Form 2 (statement of candidacy) with election_year 2026, receipt
  date (FEC API /filings/, cached). Cross-check: announcement date from the article.
  Late replacement nominees use the date they became the candidate (flag `late_replacement`).
Primary date: NCSL 2026 primary-date table (_primary_dates.py).
Pageviews: Wikimedia REST per-article monthly views (agent=user), 12 full months
  ending the month before the anchor, summed over the article and every title that
  redirects to it (old names after a page move). Anchor: the announcement date (day
  or month precision), else the FEC Form 2 date, else 2025-01-01. Cross-check only.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
from datetime import date
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT, cached_url, fec, wiki_meta  # noqa: E402
from _primary_dates import primary as ncsl_primary  # noqa: E402

OUT = ROOT / "data" / "derived" / "midterm2026"
ELECTION = date(2026, 11, 3)
W = "https://en.wikipedia.org/wiki/"

# race_id: (article, prior_office, office note, local_office, fame, fame note,
#           announce date ISO or None, precision day|month|year|None, announce note)
NOMINEES = {
    "AK-S": ("Mary Peltola", 3, "U.S. Rep. for Alaska at-large 2022-25 (elected statewide)", 0, 0, "", "2026-01-12", "day", "Alaska Beacon, Jan 12 2026: 'Mary Peltola announces run for Alaska U.S. Senate' (not in the Wikipedia article)"),
    "FL-S": ("Angie Nixon", 1, "Florida House member since 2020", 0, 0, "", "2026-01-22", "day", "'On January 22, 2026, Nixon launched her campaign'"),
    "GA-S": ("Jon Ossoff", 3, "U.S. senator since 2021 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "IA-S": ("Josh Turek", 1, "Iowa House member since 2023", 0, 1, "Paralympic gold medalist (2016, 2020), four-time Paralympian", "2025-08-12", "day", "'On August 12, 2025, Turek announced his candidacy'"),
    "KS-S": ("Adam Hamilton (pastor)", 0, "no elected office", 0, 1, "senior pastor of the largest United Methodist congregation in the U.S.; author of 30+ books", "2026-04-01", "month", "'announced his candidacy ... in April 2026'"),
    "ME-S": ("Troy Jackson", 1, "Maine Senate president 2018-24", 0, 0, "", "2026-07-08", "day", "FEC committee filed July 7, 2026; formally announced 'the next day'; nominated at convention July 25"),
    "MI-S": ("Abdul El-Sayed", 0, "appointed health director (Detroit, Wayne County); no elected office", 0, 1, "host of Crooked Media podcast 'America Dissected' since 2019; 2018 statewide gubernatorial candidate", "2025-04-01", "month", "'In April 2025 ... El-Sayed launched his campaign'"),
    "MN-S": ("Peggy Flanagan", 3, "Lieutenant Governor of Minnesota since 2019", 0, 0, "", "2025-02-13", "day", "'On February 13, 2025, Flanagan announced her candidacy'"),
    "MS-S": ("Scott Colom", 0, "district attorney, 16th Judicial District since 2016", 1, 0, "", "2025-09-01", "month", "'In September 2025, Colom announced his candidacy'"),
    "NC-S": ("Roy Cooper", 3, "Governor of North Carolina 2017-25", 0, 0, "", "2025-07-28", "day", "'On July 28, 2025, Cooper announced'"),
    "NH-S": ("Chris Pappas (American politician)", 2, "U.S. Rep. NH-01 since 2019", 0, 0, "", "2025-03-01", "month", "'In March 2025 ... it was reported' (article)"),
    "OH-S": ("Sherrod Brown", 3, "U.S. senator 2007-25", 0, 0, "", "2025-08-01", "month", "'In August 2025, Brown announced his campaign'"),
    "SC-S": ("Annie Andrews", 0, "no elected office (2022 House nominee)", 0, 0, "", "2025-05-29", "day", "'On May 29, 2025, Andrews announced her candidacy'"),
    "TX-S": ("James Talarico", 1, "Texas House member since 2018", 0, 1, "viral legislative videos and an appearance on The Joe Rogan Experience (before launch)", "2025-09-09", "day", "'On September 9, 2025, Talarico announced'"),
    "AZ-01": ("Amish Shah", 1, "Arizona House 2019-24", 0, 0, "", "2025-05-01", "month", "'In May 2025, Shah announced'"),
    "AZ-04": ("Greg Stanton", 2, "U.S. Rep. since 2019 (incumbent); mayor of Phoenix 2012-18", 0, 0, "", None, None, "incumbent"),
    "FL-20": ("Debbie Wasserman Schultz", 2, "U.S. Rep. since 2005 (incumbent, switched district)", 0, 0, "", "2026-05-22", "day", "'announced on May 22 that she would instead run in Florida's 20th'"),
    "FL-24": ("Oliver Gilbert", 0, "Miami-Dade County commissioner; former Miami Gardens mayor", 1, 0, "", "2026-06-01", "month", "'announced his candidacy ... in June 2026'"),
    "FL-25": ("Jared Moskowitz", 2, "U.S. Rep. since 2023 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "GA-13": ("Jasmine Clark", 1, "Georgia House since 2019", 0, 0, "", "2025-06-01", "month", "'In June 2025, Clark announced her candidacy'"),
    "HI-01": ("Ed Case", 2, "U.S. Rep. since 2019 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "IL-02": ("Donna Miller", 0, "Cook County commissioner", 1, 0, "", None, None, "no announcement date found"),
    "IL-07": ("La Shawn K. Ford", 1, "Illinois House since 2007", 0, 0, "", None, None, "no announcement date found"),
    "IL-08": ("Melissa Bean", 2, "U.S. Rep. 2005-11", 0, 0, "", "2025-09-01", "month", "'In September 2025, Bean announced'"),
    "IL-09": ("Daniel Biss", 1, "Illinois House and Senate; Evanston mayor 2021-26", 0, 0, "", "2025-01-01", "year", "'In 2025, he announced his candidacy' (year only)"),
    "MD-05": ("Adrian Boafo", 1, "Maryland House of Delegates since 2023", 0, 0, "", None, None, "no announcement date found"),
    "ME-02": ("Matthew Dunlap", 1, "Maine House; Secretary of State and Auditor are chosen by the legislature, not voters", 0, 0, "", "2025-10-06", "day", "'On October 6, 2025, Dunlap announced a primary challenge'"),
    "MI-13": ("Donavan McKinney", 1, "Michigan House since 2023", 0, 0, "", "2025-04-01", "month", "'In April 2025, McKinney announced'"),
    "MN-02": ("Matt Little", 1, "Minnesota Senate 2017-21", 0, 0, "", "2025-04-30", "day", "'On April 30, 2025, Little announced'"),
    "MO-01": ("Wesley Bell", 2, "U.S. Rep. since 2025 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "NE-02": ("Denise Powell", 0, "no elected office", 0, 0, "", "2025-05-01", "month", "'In May 2025, Powell launched her campaign'"),
    "NH-01": ("Stefany Shaheen", 0, "no elected office", 0, 1, "daughter of U.S. Sen. Jeanne Shaheen", "2025-05-01", "month", "'In May 2025, Shaheen announced her candidacy'"),
    "NJ-06": ("Frank Pallone", 2, "U.S. Rep. since 1988 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "NY-06": ("Grace Meng", 2, "U.S. Rep. since 2013 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "NY-10": ("Brad Lander", 1, "New York City comptroller 2022-25 (citywide, top-25 city)", 0, 0, "", "2025-12-10", "day", "'On December 10, 2025, Lander announced'"),
    "NY-13": ("Darializa Avila Chevalier", 0, "no elected office", 0, 0, "", None, None, "no announcement date found"),
    "NY-17": ("Cait Conley", 0, "no elected office (appointed NSC/CISA posts)", 0, 0, "", "2025-03-24", "day", "'On March 24, 2025, Conley announced'"),
    "OR-04": ("Val Hoyle", 2, "U.S. Rep. since 2023 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "PA-07": ("Bob Brooks (Pennsylvania politician)", 0, "no elected office (firefighters' union president)", 0, 0, "", None, None, "no announcement date found"),
    "TN-09": ("Justin J. Pearson", 1, "Tennessee House since 2023", 0, 1, "one of the 'Tennessee Three' expelled in April 2023 (national coverage)", "2025-10-08", "day", "'On October 8, 2025, Pearson announced'"),
    "TX-34": ("Vicente Gonzalez (American politician)", 2, "U.S. Rep. since 2017 (incumbent)", 0, 0, "", None, None, "incumbent"),
    "UT-01": ("Ben McAdams", 2, "U.S. Rep. 2019-21; Salt Lake County mayor", 0, 0, "", "2025-11-13", "day", "'McAdams announced his run on November 13' (2025)"),
    "VA-02": ("Elaine Luria", 2, "U.S. Rep. 2019-23", 0, 0, "", None, None, "no announcement date found"),
    "WI-03": ("Rebecca Cooke (politician)", 0, "no elected office (appointed WEDC board)", 0, 0, "", None, None, "no announcement date found"),
}
# Late replacement nominees: date they became the candidate (brief: Jackson, 2026-07-25).
LATE = {"ME-S": ("2026-07-25", "Maine Democratic convention nominated Jackson 566-5 (Star-Advertiser, Jul 25 2026)")}


def form2_dates(ids: list[str]) -> pd.DataFrame:
    rows = []
    page = 1
    while True:
        d = fec("filings", _tries=2, candidate_id=sorted(ids), form_type="F2", min_receipt_date="2020-11-04",
                per_page=100, sort="receipt_date", page=page)
        rows += [{"cid": x["candidate_id"], "rd": x["receipt_date"][:10], "ey": x.get("election_year"),
                  "amend": x.get("amendment_indicator"), "office": x.get("office")} for x in d["results"]]
        if page >= (d.get("pagination", {}).get("pages") or 1):
            break
        page += 1
    df = pd.DataFrame(rows).drop_duplicates()
    return df[df.ey == 2026].sort_values("rd").groupby("cid").first().reset_index()


def pageviews(title: str, anchor: date) -> int | None:
    end = date(anchor.year, anchor.month, 1)
    start = date(end.year - 1, end.month, 1)
    t = urllib.parse.quote(title.replace(" ", "_"), safe="")
    url = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/"
           f"{t}/monthly/{start:%Y%m%d}00/{end:%Y%m%d}00")
    try:
        body = cached_url(url, "pageviews", f"{t}_{start:%Y%m}_{end:%Y%m}.json", gap=1.0)
    except Exception as e:  # 404 = no article (or no views) in the window
        if "404" in str(e):
            return 0
        raise
    items = json.loads(body).get("items", [])
    # end month is exclusive: drop it if the API returned it
    return int(sum(i["views"] for i in items if i["timestamp"][:6] != f"{end:%Y%m}"))


def redirects(title: str) -> list[str]:
    """Titles that redirect to the article (old names after a move), via the MediaWiki API."""
    q = urllib.parse.urlencode({"action": "query", "prop": "redirects", "titles": title, "rdlimit": "max",
                                "rdnamespace": 0, "format": "json", "formatversion": 2})
    t = urllib.parse.quote(title.replace(" ", "_"), safe="")
    body = cached_url(f"https://en.wikipedia.org/w/api.php?{q}", "wiki_redirects", f"{t}.json", gap=1.5)
    pages = json.loads(body)["query"]["pages"]
    return [r["title"] for p in pages for r in p.get("redirects", [])]


def pageviews_all(title: str, anchor: date) -> tuple[int, int]:
    """Views of the article plus every title redirecting to it; (total, n_redirects)."""
    rd = redirects(title)
    return sum(pageviews(t, anchor) or 0 for t in [title, *rd]), len(rd)


def main() -> None:
    races = pd.read_csv(OUT / "races.csv")
    an = races[races.dem_vs_rep & races.dem_last.notna() & ((races.chamber == "H") | races.competitive)]
    missing = sorted(set(an.race_id) - set(NOMINEES))
    if missing:
        raise SystemExit(f"no hand-coded row for {missing}")
    try:
        f2 = form2_dates(an.fec_cand_id.dropna().tolist())
        f2_status = "ok"
    except Exception as e:  # FEC DEMO_KEY rate limit
        f2, f2_status = pd.DataFrame(columns=["cid", "rd", "amend"]), f"FEC API unavailable: {e}"
    rows = []
    for x in an.itertuples():
        art, po, pon, loc, fame, famen, ann, prec, annn = NOMINEES[x.race_id]
        meta = wiki_meta(art.replace(" ", "_"))
        f = f2[f2.cid == x.fec_cand_id]
        fec_date = f.rd.iloc[0] if len(f) else None
        late = LATE.get(x.race_id)
        if late:
            launch, launch_src = late[0], "late replacement: date became the candidate"
        elif fec_date:
            launch, launch_src = fec_date, "FEC Form 2 receipt"
        elif ann and prec in ("day", "month"):
            launch, launch_src = ann, f"announcement ({prec}); FEC Form 2 not retrieved"
        else:
            launch, launch_src = None, "unsourced"
        pdate = ncsl_primary(x.state)
        if ann and prec in ("day", "month"):
            anchor, anchor_src = date.fromisoformat(ann), "announcement"
        elif fec_date:
            anchor, anchor_src = date.fromisoformat(fec_date), "FEC Form 2"
        else:
            anchor, anchor_src = date(2025, 1, 1), "default 2025-01-01"
        pv, n_rd = pageviews_all(art, anchor)
        row = {
            "race_id": x.race_id,
            "nominee_wiki": W + urllib.parse.quote(art.replace(" ", "_")),
            "wiki_revid_nominee": meta["revid"],
            "prior_office": po, "prior_office_note": pon, "local_office": loc,
            "fame_flag": fame, "fame_note": famen,
            "poll_name_id": None,
            "poll_name_id_note": "no pre-launch public poll found" if x.race_id in ("TX-S", "KS-S", "SC-S", "IA-S")
            else "not searched; no pre-launch poll known",
            "pageviews_12m_pre_launch": pv,
            "pageviews_redirects_counted": n_rd,
            "pageviews_anchor": anchor.isoformat(),
            "pageviews_anchor_source": anchor_src,
            "pageviews_flag": "0 views with no redirects for a long-serving member: title-history undercount"
            if x.race_id == "TX-34" else "",
            "fec_f2_first_2026": fec_date,
            "fec_f2_status": f2_status if fec_date is None else "ok",
            "announce_date": ann, "announce_precision": prec, "announce_note": annn,
            "launch_date": launch,
            "launch_source": launch_src,
            "late_replacement": int(bool(late)),
            "late_replacement_note": late[1] if late else "",
            "launch_vs_announce_days": (date.fromisoformat(fec_date) - date.fromisoformat(ann)).days
            if fec_date and ann and prec == "day" else None,
            "days_on_trail": (ELECTION - date.fromisoformat(launch)).days if launch else None,
            "primary_date": pdate.isoformat() if pdate else None,
            "days_primary_to_general": (ELECTION - pdate).days if pdate else None,
            "days_nominee_to_general": (ELECTION - date.fromisoformat(late[0])).days if late
            else ((ELECTION - pdate).days if pdate else None),
        }
        rows.append(row)
    df = pd.DataFrame(rows)
    df.to_csv(OUT / "controls.csv", index=False)
    # Write the control columns into races.csv (rerun after build_races.py).
    races = races[[c for c in races.columns if c not in df.columns or c == "race_id"]]
    races.merge(df, on="race_id", how="left").to_csv(OUT / "races.csv", index=False)
    print(f"controls.csv: {len(df)} rows; FEC Form 2 dates for {df.fec_f2_first_2026.notna().sum()} "
          f"({f2_status[:60]}); announce dates {df.announce_date.notna().sum()}")


if __name__ == "__main__":
    main()
