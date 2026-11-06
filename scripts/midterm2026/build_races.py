"""Step 3: one row per race (Democratic nominee) -> data/derived/midterm2026/races.csv

Senate: every 2026 Senate race in CNN's results feed (35), with a `competitive`
flag (Cook Political Report rating of Nov 2, 2026 not "Solid", parsed from the
Wikipedia ratings table). House: every district whose Democratic primary was
contested between a progressive-backed and a moderate/money-backed candidate
(rule in README.md), plus a `house_all` side table for the national baseline.

Reruns entirely from cached raw data. Inputs:
  data/raw/midterm2026/cnn/*.json        CNN results API (2026-SG, 2026-HG, 2026-GG, 2024-PG)
  data/raw/midterm2026/downballot/pres2024_by_cd_2026lines.csv
  data/raw/midterm2026/wiki/*.json       Wikipedia wikitext (revision ids in wiki_revisions_*.csv)
  data/raw/fec/bulk2026/                 FEC bulk: independent expenditures, weball26, cn26
  data/derived/midterm2026/house_primaries.csv, endorser_lists.csv  (steps 1-2)
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _endorse import PROGRESSIVE, dem_primary_section, endorsements  # noqa: E402
from _fetch import ROOT, cnn, wiki_meta, wiki_wikitext  # noqa: E402
from _ie import ie  # noqa: E402
from _wiki import primary_boxes  # noqa: E402

OUT = ROOT / "data" / "derived" / "midterm2026"
BULK = ROOT / "data" / "raw" / "fec" / "bulk2026" / "x"
SENATE_PAGE = "2026_United_States_Senate_elections"
SPECIAL = {"FL": "special_election_in_Florida", "OH": "special_election_in_Ohio"}
STATE_NAMES = {"AK": "Alaska", "FL": "Florida", "GA": "Georgia", "IA": "Iowa", "KS": "Kansas",
               "ME": "Maine", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
               "NE": "Nebraska", "NH": "New_Hampshire", "NC": "North_Carolina", "OH": "Ohio",
               "SC": "South_Carolina", "TX": "Texas"}


SUFFIX = re.compile(r"^(jr\.?|sr\.?|ii|iii|iv|md|phd|\{\{.*|endorse.*)$", re.I)


def surname(name: str) -> str:
    """Last real token of a candidate name (drops Jr./Sr./II and template debris)."""
    toks = [t for t in re.sub(r"\{\{[^}]*\}\}|[,()]", " ", str(name)).split() if not SUFFIX.match(t)]
    return toks[-1] if toks else ""


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z]", "", s.lower())


# --------------------------------------------------------------------------- results
def cnn_table(code: str) -> pd.DataFrame:
    rows = []
    for r in cnn(f"national-races/{code}"):
        cs = r["candidates"]
        tot = sum(c["voteNum"] for c in cs)
        dem = sorted([c for c in cs if c["majorParty"] == "DEM"], key=lambda c: -c["voteNum"])
        rep = sorted([c for c in cs if c["majorParty"] == "REP"], key=lambda c: -c["voteNum"])
        parts = r["ecKey"].split("-")
        rows.append({
            "state": r["stateAbbreviation"],
            "district": int(parts[3]) if len(parts) > 3 else 0,
            "dem_nominee": dem[0]["fullName"] if dem else None,
            "dem_last": dem[0]["lastName"] if dem else None,
            "dem_incumbent": bool(dem and dem[0]["isIncumbent"]),
            "rep_nominee": rep[0]["fullName"] if rep else None,
            "rep_incumbent": bool(rep and rep[0]["isIncumbent"]),
            "dem_votes": dem[0]["voteNum"] if dem else 0,
            "rep_votes": rep[0]["voteNum"] if rep else 0,
            "all_dem_votes": sum(c["voteNum"] for c in dem),
            "all_rep_votes": sum(c["voteNum"] for c in rep),
            "total_votes": tot,
            "dem_won": bool(dem and dem[0]["winner"]),
            "top_other_votes": max([c["voteNum"] for c in cs if c["majorParty"] not in ("DEM", "REP")] or [0]),
            "rep_won": bool(rep and rep[0]["winner"]),
            "pct_reporting": r["percentReporting"],
            "cnn_extracted_at": r.get("extractedAt"),
        })
    t = pd.DataFrame(rows)
    t["dem_margin"] = (t.dem_votes - t.rep_votes) / t.total_votes * 100
    t["indep_outpolled_dem"] = t.top_other_votes > t.dem_votes
    return t


def harris_by_state() -> pd.Series:
    t = cnn_table("2024-PG")
    return pd.Series(((t.all_dem_votes - t.all_rep_votes) / t.total_votes * 100).values, index=t.state)


def harris_by_district() -> pd.DataFrame:
    p = pd.read_csv(ROOT / "data/raw/midterm2026/downballot/pres2024_by_cd_2026lines.csv",
                    skiprows=3, header=0, dtype=str)
    p = p.iloc[:, :10]
    p.columns = ["District", "Incumbent", "Party", "x", "H", "T", "Tot", "Hp", "Tp", "M"]
    p = p[p.District.str.match(r"^[A-Z]{2}-(\d\d|AL)$", na=False)].copy()
    p["state"] = p.District.str[:2]
    p["district"] = p.District.str[3:].replace("AL", "1").astype(int)
    p["harris_margin"] = p.M.str.rstrip("%").astype(float)
    p["incumbent_2025"] = p.Incumbent
    p["incumbent_party_2025"] = p.Party.str.strip("()")
    return p[["state", "district", "harris_margin", "incumbent_2025", "incumbent_party_2025"]]


def statewide_house(h: pd.DataFrame) -> pd.Series:
    """D minus R share of the summed House vote, by state (all districts).

    NaN when any district had no D-vs-R contest beyond one seat, or an independent
    outpolled the Democrat (the sum then measures ballot access, not support).
    """
    h = h.assign(bad=(h.dem_votes == 0) | (h.rep_votes == 0) | h.indep_outpolled_dem)
    g = h.groupby("state").agg(d=("all_dem_votes", "sum"), r=("all_rep_votes", "sum"),
                               t=("total_votes", "sum"), bad=("bad", "sum"),
                               indep=("indep_outpolled_dem", "sum"))
    m = (g.d - g.r) / g.t * 100
    return m.where((g.bad <= 1) & (g.indep == 0))


def senate_ratings() -> dict[str, str]:
    w = wiki_wikitext(SENATE_PAGE)
    t = w[w.find("== Predictions =="): w.find("\n== Generic", w.find("== Predictions =="))]
    out = {}
    for r in t.split("\n|-\n")[1:]:
        st = re.search(r"^! \[\[[^|]*\|([^\]]+)\]\]", r, re.M)
        cook = re.search(r"<!--Cook-->\s*\|\s*\{\{USRaceRating\|([^}]*)\}\}", r)
        if st and cook:
            out[st.group(1)] = cook.group(1).split("|")[0] + ("" if "|" not in cook.group(1)
                                                             else "_" + cook.group(1).split("|")[1])
    return out


# --------------------------------------------------------------------------- FEC
def fec_candidates() -> pd.DataFrame:
    cn = pd.read_csv(BULK / "cn.txt", sep="|", header=None, dtype=str).iloc[:, :8]
    cn.columns = ["cand_id", "name", "party", "year", "st", "office", "dist", "ici"]
    wb = pd.read_csv(BULK / "weball26.txt", sep="|", header=None, dtype=str)
    wb = wb[[0, 5, 17, 25, 26, 27]]
    wb.columns = ["cand_id", "receipts", "indiv", "pac", "party_contrib", "cvg_end"]
    for c in ["receipts", "indiv", "pac", "party_contrib"]:
        wb[c] = pd.to_numeric(wb[c], errors="coerce")
    cn = cn.merge(wb, on="cand_id", how="left")
    cn["last"] = cn.name.str.split(",").str[0].map(norm)
    cn["dist"] = pd.to_numeric(cn.dist, errors="coerce").fillna(0).astype(int)
    return cn


def match_cand(cn: pd.DataFrame, st: str, office: str, dist: int, last: str) -> pd.Series | None:
    q = cn[(cn.st == st) & (cn.office == office) & (cn["last"] == norm(last))]
    if office == "H":
        q = q[q.dist.isin([dist, 0] if dist == 1 else [dist])]
    if q.empty:
        return None
    return q.sort_values("receipts", ascending=False, na_position="last").iloc[0]


def ie_sums(d: pd.DataFrame, cand_ids: set[str], phase: str) -> dict:
    cand_ids = {c for c in cand_ids if isinstance(c, str)}
    x = d[d.cand_id.isin(cand_ids) & (d.ele_type == phase)]
    out = {"sup": x[x.sup_opp == "S"].amt.sum(), "opp": x[x.sup_opp == "O"].amt.sum()}
    for g in ["aipac", "crypto", "ai"]:
        y = x[x.group == g]
        out[f"{g}_sup"] = y[y.sup_opp == "S"].amt.sum()
        out[f"{g}_opp"] = y[y.sup_opp == "O"].amt.sum()
    return out


def money_block(d, cn, st, office, dist, nominee_last, rival_lasts, rep_last) -> dict:
    nom = match_cand(cn, st, office, dist, nominee_last) if nominee_last else None
    rep = match_cand(cn, st, office, dist, rep_last) if rep_last else None
    rivals = [match_cand(cn, st, office, dist, r) for r in rival_lasts]
    rivals = [r for r in rivals if r is not None and (nom is None or r.cand_id != nom.cand_id)]
    nid = {nom.cand_id} if nom is not None else set()
    # IE rows sometimes carry a different cand_id spelling; add ids by name match too.
    if nom is not None:
        nid |= set(d[(d.can_office_state == st) & (d.can_office == office)
                     & (d.cand_name.str.split(",").str[0].map(norm) == norm(nominee_last))].cand_id.dropna())
    rid = {r.cand_id for r in rivals}
    rpid = {rep.cand_id} if rep is not None else set()
    if rep is not None:
        rpid |= set(d[(d.can_office_state == st) & (d.can_office == office)
                      & (d.cand_name.str.split(",").str[0].map(norm) == norm(rep_last))].cand_id.dropna())
    gn, gr = ie_sums(d, nid, "G"), ie_sums(d, rpid, "G")
    pn, pr = ie_sums(d, nid, "P"), ie_sums(d, rid, "P")
    row = {
        "fec_cand_id": nom.cand_id if nom is not None else None,
        "receipts": nom.receipts if nom is not None else None,
        "receipts_pac": nom.pac if nom is not None else None,
        "receipts_cvg_end": nom.cvg_end if nom is not None else None,
        "rep_receipts": rep.receipts if rep is not None else None,
        "ie_gen_for_dem": gn["sup"] + gr["opp"],
        "ie_gen_against_dem": gn["opp"] + gr["sup"],
        "ie_prim_for_nominee": pn["sup"] + pr["opp"],
        "ie_prim_against_nominee": pn["opp"] + pr["sup"],
    }
    for g in ["aipac", "crypto", "ai"]:
        row[f"{g}_prim_for_nominee"] = pn[f"{g}_sup"] + pr[f"{g}_opp"]
        row[f"{g}_prim_against_nominee"] = pn[f"{g}_opp"] + pr[f"{g}_sup"]
        row[f"{g}_gen_for_dem"] = gn[f"{g}_sup"] + gr[f"{g}_opp"]
        row[f"{g}_gen_against_dem"] = gn[f"{g}_opp"] + gr[f"{g}_sup"]
    return row


# --------------------------------------------------------------------------- codings
# Coding (a): Third Way, "Moderates Made Democratic Majorities" / "Center-Left
# Democrats Overperformed and Delivered the Majority" (both thirdway.org, Nov 4-5, 2026).
TW_SENATE = {
    "GA": "moderate", "NC": "moderate", "TX": "moderate", "SC": "moderate", "KS": "moderate",
    "IA": "moderate", "OH": "moderate",
    "MI": "leftier", "MN": "leftier", "ME": "leftier",
    "FL": "leftier",  # implied: memo contrasts "moderate" Jolly with Nixon
}
# Coding (b), Senate: pre-primary backing. Each entry: anointed (strict), anointed (soft),
# insider, and the source. strict = formal endorsement or announced recruitment by
# Schumer/DSCC, or AIPAC/DMFI/crypto/AI endorsement or primary IE before the primary.
# soft = strict, or reported as leadership's preferred pick / DSCC donor events / SMP-funded
# group spending, without a formal endorsement.
SENATE_B = {
    "AK": (1, 1, 1, "Schumer recruit (Washington Examiner, Oct 15 2025); former U.S. Rep."),
    "FL": (0, 0, 1, "Vindman was leadership's recruit (NOTUS, Aug 2026); Nixon sitting state rep."),
    "GA": (1, 1, 1, "Incumbent senator; DMFI not listed; DSCC protects incumbents (no source fetched)"),
    "IA": (0, 1, 1, "No formal Schumer/DSCC endorsement; DSCC donor meet-and-greet, 'widely seen as Schumer's pick', VoteVets $9.8M primary IE (Bleeding Heartland; Wash. Examiner); sitting state rep."),
    "KS": (0, 0, 0, "No recruitment found; DSCC statement only after Aug 4 primary (dscc.org); pastor, no office."),
    "ME": (0, 0, 1, "Pre-primary anointed candidate was Mills (Schumer+DSCC, NOTUS Apr 30 2026); Jackson nominated by convention Jul 25 2026; former state Senate president."),
    "MI": (0, 0, 0, "Schumer endorsed Stevens Jun 17 2026; AIPAC/DMFI/UDP backed Stevens; El-Sayed held no office at filing."),
    "MN": (0, 0, 1, "Jeffries, AIPAC, DMFI endorsed Craig; Flanagan sitting Lt. Governor."),
    "MS": (0, 1, 0, "Schumer met Colom repeatedly to recruit him (Mississippi Today, Sep 21 2026); no formal endorsement; DSCC excluded MS until Oct; district attorney counted as non-legislative office -> 0."),
    "NH": (1, 1, 1, "AIPAC and DMFI endorsed Pappas pre-primary (Wikipedia endorsement box); sitting U.S. Rep."),
    "NC": (1, 1, 1, "Schumer recruit and endorsement (Washington Examiner, Oct 15 2025); DMFI; former governor."),
    "OH": (1, 1, 1, "Schumer recruit (Washington Examiner, Oct 15 2025); former senator."),
    "SC": (0, 0, 0, "No recruitment found; SMP stayed out (Post and Courier); pediatrician, no office."),
    "TX": (0, 0, 1, "Schumer neutral: 'does not have a preference' (Axios, Dec 9 2025); PCCC endorsed Talarico Feb 24 2026; sitting state rep."),
}
OFFICE_RE = re.compile(r"incumbent|U\.S\. representative|state (senator|representative|delegate|"
                       r"assembly)|assemblymember|state legislat|mayor|council ?member|city council|"
                       r"county (commissioner|executive|supervisor)|commissioner|lieutenant governor|"
                       r"attorney general|state treasurer|secretary of state|comptroller|"
                       r"chief of staff|congressional (aide|staffer)|lobbyist|former (U\.S\. )?representative",
                       re.I)


def build_senate(cn, d, hstate) -> pd.DataFrame:
    s = cnn_table("2026-SG")
    harris = harris_by_state()
    gov = cnn_table("2026-GG").set_index("state")
    ratings = senate_ratings()
    from build_endorser_lists import ABBR
    name2ab = dict(ABBR)
    rows = []
    for _, r in s.iterrows():
        st = r.state
        rating = next((v for k, v in ratings.items() if name2ab.get(k) == st), None)
        row = r.to_dict()
        row.update({"chamber": "S", "race_id": f"{st}-S"})
        row["cook_rating"] = rating
        row["harris_margin"] = harris[st]
        row["house_statewide_margin"] = hstate.get(st)
        row["gov_dem_margin"] = gov.dem_margin.get(st) if st in gov.index else None
        page = None
        if st in STATE_NAMES:
            page = f"2026_United_States_Senate_{SPECIAL.get(st, 'election_in_' + STATE_NAMES[st])}"
        rivals = []
        if page:
            w = wiki_wikitext(page)
            boxes = [b for b in primary_boxes(w, "Democratic") if not re.search("runoff", b["title"], re.I)]
            if boxes:
                rivals = [re.sub(r"\(.*?\)", "", c["candidate"] or "").strip().split()[-1]
                          for c in boxes[0]["candidates"] if c["candidate"]]
                rivals = [x for x in rivals if norm(x) != norm(r.dem_last or "")]
            row["wiki_page"] = page
            row["wiki_revid"] = wiki_meta(page)["revid"]
        rep_last = r.rep_nominee.split()[-1] if r.rep_nominee else None
        if st == "SC":
            rep_last = "Graham"
        row.update(money_block(d, cn, st, "S", 0, r.dem_last, rivals, rep_last) if r.dem_last else {})
        row["primary_rivals"] = ";".join(rivals)
        row["coding_a_thirdway"] = TW_SENATE.get(st)
        b = SENATE_B.get(st)
        if b:
            row["b_anointed_strict"], row["b_anointed_soft"], row["b_insider"], row["b_source"] = b
        rows.append(row)
    return pd.DataFrame(rows)


def build_house(cn, d) -> tuple[pd.DataFrame, pd.DataFrame]:
    h = cnn_table("2026-HG").merge(harris_by_district(), on=["state", "district"], how="left")
    h["chamber"] = "H"
    h["race_id"] = h.state + "-" + h.district.astype(str).str.zfill(2)
    h["over_vs_harris"] = h.dem_margin - h.harris_margin
    contested = (h.dem_votes > 0) & (h.rep_votes > 0)
    h["dem_vs_rep"] = contested
    st_mean = h[contested].groupby("state").over_vs_harris.mean()
    h["over_vs_state_house_mean"] = h.over_vs_harris - h.state.map(st_mean)

    hp = pd.read_csv(OUT / "house_primaries.csv")
    el = pd.read_csv(OUT / "endorser_lists.csv")
    hp["ln"] = hp.candidate.map(lambda s: norm(surname(s)))
    el["ln"] = el.name.map(lambda s: norm(str(s).split()[-1]))
    for g in ["newdem", "welcome", "justicedems"]:
        e = el[el.group == g][["state", "district", "ln"]].assign(**{f"l_{g}": 1})
        hp = hp.merge(e, on=["state", "district", "ln"], how="left")
        hp[f"l_{g}"] = hp[f"l_{g}"].fillna(0).astype(int)
    # primary IE by money groups, matched by last name within district
    p = d[(d.can_office == "H") & (d.ele_type == "P")].copy()
    p["district"] = pd.to_numeric(p.can_office_dis, errors="coerce").fillna(1).astype(int).replace(0, 1)
    p["ln"] = p.cand_name.str.split(",").str[0].map(norm)
    pm = p[p.group.notna()].groupby(["can_office_state", "district", "ln", "sup_opp"]).amt.sum().unstack(fill_value=0)
    pm = pm.reset_index().rename(columns={"can_office_state": "state", "S": "money_prim_sup", "O": "money_prim_opp"})
    hp = hp.merge(pm, on=["state", "district", "ln"], how="left")
    for c in ["money_prim_sup", "money_prim_opp"]:
        hp[c] = hp.get(c, 0).fillna(0) if c in hp else 0
    prog_e = [f"e_{k}" for k in PROGRESSIVE]
    hp["side_prog"] = ((hp[prog_e].max(axis=1) == 1) | (hp.l_justicedems == 1) | (hp.money_prim_opp > 0)).astype(int)
    hp["side_mod"] = ((hp[["e_welcome", "e_newdem", "e_bluedog", "e_aipac", "e_dmfi", "e_fairshake",
                           "e_dccc", "e_jeffries", "e_hmp"]].max(axis=1) == 1)
                      | (hp.money_prim_sup > 0)).astype(int)

    def is_contested(x: pd.DataFrame) -> bool:
        P = set(x[x.side_prog == 1].candidate)
        M = set(x[x.side_mod == 1].candidate)
        return any(a != b for a in P for b in M)

    flags = hp.groupby(["state", "district"])[["candidate", "side_prog", "side_mod"]].apply(is_contested)
    uni = flags[flags].reset_index()[["state", "district"]]
    u = h.merge(uni, on=["state", "district"])
    rows = []
    for _, r in u.iterrows():
        x = hp[(hp.state == r.state) & (hp.district == r.district)]
        dl = norm(r.dem_last or "")
        nom = x[x.ln.map(lambda v: bool(v) and (v == dl or dl.endswith(v)))]
        if len(nom):
            # One person can appear under name variants ("Justin Pearson" in the
            # candidate list, "Justin J. Pearson" in an endorsement box): merge them.
            merged = nom.iloc[0].copy()
            for c in nom.columns:
                if c.startswith(("e_", "l_", "side_", "money_prim")):
                    merged[c] = nom[c].max()
            desc = nom.description.dropna()
            merged["description"] = desc.iloc[0] if len(desc) else None
            nom = merged
        else:
            nom = None
        rival_l = [surname(c) for c in x.candidate]
        rival_l = [v for v in rival_l if v and not (norm(v) == dl or dl.endswith(norm(v)))]
        row = r.to_dict()
        row.update(money_block(d, cn, r.state, "H", r.district, r.dem_last, rival_l,
                               r.rep_nominee.split()[-1] if r.rep_nominee else None))
        row["primary_rivals"] = ";".join(rival_l)
        row["wiki_page"] = x.wiki_page.iloc[0]
        if nom is not None:
            mod = bool(nom.l_newdem or nom.l_welcome or nom.e_welcome or nom.e_newdem or nom.e_bluedog)
            prog = bool(nom.side_prog and not (nom.money_prim_opp > 0 and not
                                                (nom[[f"e_{k}" for k in PROGRESSIVE]].max() or nom.l_justicedems)))
            row["coding_a_thirdway"] = "moderate" if mod else ("leftier" if prog else "unaligned")
            row["nominee_prog_endorsed"] = int(bool(nom[[f"e_{k}" for k in PROGRESSIVE]].max() or nom.l_justicedems))
            row["nominee_mod_pac_endorsed"] = int(mod)
            anointed = bool(nom[["e_dccc", "e_jeffries", "e_hmp", "e_aipac", "e_dmfi", "e_fairshake"]].max()
                            or nom.money_prim_sup > 0
                            or (x[x.ln != nom.ln].money_prim_opp.sum() > 0))
            row["b_anointed_strict"] = int(anointed)
            row["b_anointed_soft"] = int(anointed)
            # Variant named in the brief: also count Third Way-aligned PACs, using only
            # Wikipedia endorsements dated before the primary (the PACs' own lists are undated).
            row["b_anointed_incl_modpac"] = int(anointed or bool(nom[["e_welcome", "e_newdem", "e_bluedog"]].max()))
            row["b_insider"] = int(bool(r.dem_incumbent or OFFICE_RE.search(str(nom.description))))
            row["b_source"] = ("Wikipedia endorsement box (pre-primary): "
                               + ",".join(k[2:] for k in ["e_dccc", "e_jeffries", "e_hmp", "e_aipac", "e_dmfi", "e_fairshake"] if nom[k])
                               + f"; money-group primary IE for nominee ${nom.money_prim_sup:,.0f}"
                               + f"; description: {str(nom.description)[:80]}")
            row["nominee_description"] = nom.description
        rows.append(row)
    return pd.DataFrame(rows), h


def main() -> None:
    cn, d = fec_candidates(), ie()
    house_out, house_all = build_house(cn, d)
    hstate = statewide_house(cnn_table("2026-HG"))
    sen = build_senate(cn, d, hstate)
    races = pd.concat([sen, house_out], ignore_index=True, sort=False)
    races["over_vs_harris"] = races.dem_margin - races.harris_margin
    races["dem_vs_rep"] = (races.dem_votes > 0) & (races.rep_votes > 0) & ~races.indep_outpolled_dem.fillna(False).astype(bool)
    races["over_vs_house_statewide"] = races.dem_margin - races.house_statewide_margin
    races["dollars_per_vote_receipts"] = races.receipts / races.total_votes
    races["net_outside_against_dem_gen"] = races.ie_gen_against_dem - races.ie_gen_for_dem
    races["net_outside_against_dem_gen_per_vote"] = races.net_outside_against_dem_gen / races.total_votes
    races["money_prim_against_nominee"] = races[[f"{g}_prim_against_nominee" for g in ["aipac", "crypto", "ai"]]].sum(axis=1)
    races["money_prim_for_nominee"] = races[[f"{g}_prim_for_nominee" for g in ["aipac", "crypto", "ai"]]].sum(axis=1)
    races["over_per_dollar_per_vote"] = races.over_vs_harris / races.dollars_per_vote_receipts
    races["competitive"] = races.apply(
        lambda r: (r.chamber == "H") or (isinstance(r.cook_rating, str) and not r.cook_rating.startswith("Solid")), axis=1)
    # Funded marker: PAC share of receipts in the top quartile among nominees in the analysis set.
    races["pac_share"] = races.receipts_pac / races.receipts
    for ch in ["S", "H"]:
        m = (races.chamber == ch) & races.competitive & races.dem_last.notna()
        q = races.loc[m, "pac_share"].quantile(0.75)
        races.loc[m, "b_funded"] = (races.loc[m, "pac_share"] >= q).astype(int)
    races["b_establishment_2of3"] = ((races[["b_anointed_strict", "b_insider", "b_funded"]].fillna(0).sum(axis=1)) >= 2).astype(int)
    races["b_anointed_incl_modpac"] = races.b_anointed_incl_modpac.where(races.chamber == "H", races.b_anointed_strict)
    races["coding_b_anointed"] = races.b_anointed_strict.map({1: "establishment-backed", 0: "not backed"})
    cols = ["race_id", "chamber", "state", "district", "competitive", "cook_rating",
            "dem_nominee", "dem_last", "dem_incumbent", "rep_nominee", "rep_incumbent",
            "dem_votes", "rep_votes", "total_votes", "pct_reporting", "dem_won", "dem_vs_rep", "indep_outpolled_dem", "dem_margin",
            "harris_margin", "over_vs_harris", "house_statewide_margin", "over_vs_house_statewide",
            "over_vs_state_house_mean", "gov_dem_margin",
            "coding_a_thirdway", "coding_b_anointed", "b_anointed_strict", "b_anointed_soft", "b_anointed_incl_modpac",
            "b_insider", "b_funded", "b_establishment_2of3", "b_source",
            "nominee_prog_endorsed", "nominee_mod_pac_endorsed", "nominee_description", "primary_rivals",
            "fec_cand_id", "receipts", "receipts_pac", "pac_share", "receipts_cvg_end", "rep_receipts",
            "dollars_per_vote_receipts", "over_per_dollar_per_vote",
            "ie_gen_for_dem", "ie_gen_against_dem", "net_outside_against_dem_gen",
            "net_outside_against_dem_gen_per_vote", "ie_prim_for_nominee", "ie_prim_against_nominee",
            "money_prim_for_nominee", "money_prim_against_nominee",
            "aipac_prim_for_nominee", "aipac_prim_against_nominee", "crypto_prim_for_nominee",
            "crypto_prim_against_nominee", "ai_prim_for_nominee", "ai_prim_against_nominee",
            "aipac_gen_for_dem", "aipac_gen_against_dem", "crypto_gen_for_dem", "crypto_gen_against_dem",
            "ai_gen_for_dem", "ai_gen_against_dem", "wiki_page", "wiki_revid", "cnn_extracted_at"]
    races = races[[c for c in cols if c in races.columns]]
    races.to_csv(OUT / "races.csv", index=False)
    keep = ["race_id", "state", "district", "dem_nominee", "dem_incumbent", "rep_incumbent", "dem_votes",
            "rep_votes", "total_votes", "pct_reporting", "dem_won", "rep_won", "dem_margin", "harris_margin",
            "over_vs_harris", "dem_vs_rep", "incumbent_party_2025", "cnn_extracted_at"]
    house_all[keep].to_csv(OUT / "house_all.csv", index=False)
    print(f"races.csv: {len(races)} rows "
          f"(Senate {int((races.chamber == 'S').sum())}, competitive {int(((races.chamber == 'S') & races.competitive).sum())}; "
          f"House contested-primary {int((races.chamber == 'H').sum())}); house_all.csv: {len(house_all)} rows")


if __name__ == "__main__":
    main()
