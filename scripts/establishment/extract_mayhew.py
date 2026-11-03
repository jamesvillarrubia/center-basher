#!/opt/homebrew/anaconda3/bin/python3
"""Mechanical extraction of David Mayhew's lists of important enactments, 1981-2024.

Output: data/derived/establishment/mayhew_laws_1981_2024.csv
        data/derived/establishment/mayhew_extract_notes.md

Edge cases are hand-fixed here, in the script, never in the CSV.
Run: /opt/homebrew/anaconda3/bin/python3 extract_mayhew.py
"""
import csv
import os
import re
from collections import Counter, defaultdict

RAW = "/Users/james/Sites/personal/center-basher/data/raw/mayhew/txt"
OUT = "/Users/james/.t3/worktrees/center-basher/t3-dbd19e71/data/derived/establishment"

WORDS = set()
if os.path.exists("/usr/share/dict/words"):
    with open("/usr/share/dict/words", encoding="utf-8", errors="ignore") as fh:
        WORDS = {w.strip().lower() for w in fh}

# Periods after these tokens do not end a title.
ABBREV = {"st", "no", "jr", "sr", "mr", "mrs", "dr", "inc", "co", "corp", "vs",
          "gov", "sen", "rep", "g.i", "u.s", "d.c", "i", "ii"}

MONTHS = ("January|February|March|April|May|June|July|August|September|October|"
          "November|December")


def congress_of(year):
    return (year - 1789) // 2 + 1


def read(name):
    with open(os.path.join(RAW, name), encoding="utf-8", errors="replace") as fh:
        return fh.read().replace("\r\n", "\n").replace("\r", "\n").replace("\f", "\n")


def join_lines(lines):
    """Join wrapped lines; a hyphen at a line break is dropped only if the
    joined word is in the dictionary (compet-ition -> competition,
    risk-management stays)."""
    out = ""
    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue
        if out.endswith("-") and ln and ln[0].isalpha() and out[-2:-1].isalpha():
            m1 = re.search(r"([A-Za-z]+)-$", out)
            m2 = re.match(r"([A-Za-z]+)", ln)
            if m1 and m2 and (m1.group(1) + m2.group(1)).lower() in WORDS:
                out = out[:-1] + ln
            else:
                out = out + ln
        else:
            out = (out + " " + ln) if out else ln
    return re.sub(r"\s+", " ", out).strip()


def split_title(text, dash_ok=False):
    """Title = text up to the first sentence-ending period (not an abbreviation).
    Returns (title, description). If no period, whole text is the title."""
    dash = text.find(" - ") if dash_ok else -1
    for m in re.finditer(r"\.[\"'”’]?(?:\s+|$)", text):
        if dash != -1 and dash < m.start():
            break
        before = text[:m.start()]
        tok = re.search(r"([A-Za-z.]+)$", before)
        if tok and tok.group(1).lower().rstrip(".") in ABBREV:
            continue
        end = m.start() + 1 + (1 if m.group(0)[1:2] and m.group(0)[1] in "\"'”’" else 0)
        return text[:end].strip(), text[end:].strip()
    if dash != -1:
        return text[:dash].strip(), text[dash + 3:].strip()
    return text.strip(), ""


def trailing_year(text, title, years):
    """Year of enactment for flagged-list entries: (1) a year ending the entry
    text ('... 1992.'), else (2) the last year in the title ('... Act of 1993'),
    else (3) the last year anywhere in the text. Only years inside the
    Congress's two years count."""
    def ys(t):
        return [int(y) for y in re.findall(r"(?<!\d)(19\d\d|20\d\d)(?!\d)", t)
                if int(y) in years]
    m = re.search(r"(?<!\d)(19\d\d|20\d\d)[.\s)]*$", text)
    if m and int(m.group(1)) in years:
        return int(m.group(1))
    for cand in (ys(title), ys(text)):
        if cand:
            return cand[-1]
    return None


# ---------------------------------------------------------------- flagged-entry files
def parse_flagged(name, strip_margin, first_year, last_year):
    """Files where each law starts with a * / # flag at line start."""
    lines = read(name).split("\n")
    cur_cong_years = None
    entries = []  # (years, [lines])
    cur = None
    hdr = re.compile(r"^\s*(\d{4})-(\d{2,4})\b")
    for raw in lines:
        ln = raw
        if re.match(r"^\s*PAGE\b", ln):
            continue
        m = hdr.match(ln)
        if m and (not strip_margin or True):
            y1 = int(m.group(1))
            y2 = y1 + 1
            cur_cong_years = (y1, y2)
            cur = None
            # 1993-94 header lines may carry the first entry after the header
            ln = ln[m.end():]
            # (1991-2002 file only) drop margin labels
        if strip_margin:
            ln = MARGIN.sub("", ln)
            ln = MARGIN.sub("", ln)
        if cur_cong_years is None:
            continue
        if cur_cong_years[0] < first_year or cur_cong_years[0] > last_year:
            cur = None
            continue
        if re.match(r"^\s*[#*]+", ln):
            cur = [ln]
            entries.append((cur_cong_years, cur))
        elif cur is not None:
            if ln.strip() == "":
                # blank line: may separate entries or may be internal; keep going
                continue
            cur.append(ln)
    out = []
    for years, ls in entries:
        first = re.sub(r"^\s*[#*]+\s*", "", ls[0])
        text = join_lines([first] + ls[1:])
        out.append((years, text))
    return out


# margin labels of the 1991-2002 two-column layout
MARGIN = re.compile(
    r"^\s*(?:Clinton|Bush 4[13]|[DR] Cong|[DR] Senate|[DR] House|\(after|May 01\)|"
    r"\(early 2001\)|\(early\s*$)\s*")


def flagged_laws(name, strip_margin, y_lo, y_hi):
    res = []
    for years, text in parse_flagged(name, strip_margin, y_lo, y_hi):
        title, desc = split_title(text)
        yr = trailing_year(text, title, set(years))
        res.append(dict(year=yr, congress=congress_of(years[0]), title=title,
                        description=desc, source_file=name))
    return res


# ---------------------------------------------------------------- paragraph files
YEAR_HDR = re.compile(
    r"^\s*(?:(?:Important )?[Ll]aws for calendar |CALENDAR |LAWS FOR CALENDAR )(20\d\d)\s*[:.]"
    r"|^\s*(20\d\d):\s*$")


def parse_paragraphs(name, end_re, congress, skip_re=None, fixes=()):
    raw = read(name)
    for old, new in fixes:
        assert old in raw, (name, old)
        raw = raw.replace(old, new)
    lines = raw.split("\n")
    year = None
    paras = []  # (year, [lines])
    cur = []
    started = False

    def flush():
        nonlocal cur
        if cur and year is not None:
            paras.append((year, cur))
        cur = []

    for ln in lines:
        if re.match(r"^\s*\d+\s*$", ln):  # page numbers
            continue
        m = YEAR_HDR.match(ln)
        if m and not (started and cur and not ln.strip()):
            flush()
            year = int(m.group(1) or m.group(2))
            started = True
            rest = ln[m.end():].strip()
            if rest and not rest.startswith("(See"):
                cur = [rest]
            continue
        if not started:
            continue
        if end_re.match(ln):
            flush()
            break
        if ln.strip() == "":
            flush()
        else:
            cur.append(ln)
    else:
        flush()
    out = []
    for y, ls in paras:
        text = join_lines(ls)
        if skip_re and skip_re.match(text):
            continue
        out.append((y, text))
    return out


def paragraph_laws(name, end_re, congress_list, dash_ok=False, skip_re=None,
                   fixes=()):
    res = []
    for y, text in parse_paragraphs(name, end_re, None, skip_re, fixes):
        if text.lower().startswith("no selections"):
            continue
        title, desc = split_title(text, dash_ok)
        res.append(dict(year=y, congress=congress_of(y), title=title,
                        description=desc, source_file=name))
    return res


END_COMMON = re.compile(
    r"^\s*(Sources:|Selected references|General wrap|Wrapup sources|Wrap-up sources|"
    r"Wrap-up sources|The closest calls|The close calls|For three reasons|Prominent|"
    r"The wrapup stories|A NOTE ON|CITES|Methodology|The thirteen)", re.I)

SOURCES = [
    # (file, how to read, list used)
]


def build():
    laws = []
    notes = []

    # 1981-1990
    f = "Enactments_1947_1990.txt"
    laws += flagged_laws(f, False, 1981, 1989)
    notes.append((f, "Table 4.1 (Divided We Govern), Congresses 1981-82 through 1989-90; "
                  "laws flagged * / # / *# (Sweep One, Sweep Two, or both) all kept; "
                  "flags stripped from the title."))

    f = "dataset_DWG04_laws_1991_2002.txt"
    laws += flagged_laws(f, True, 1991, 2001)
    notes.append((f, "Table E.2, Congresses 1991-92 through 2001-02 (Sweep One laws, "
                  "all starred). The two 2001-02 blocks (early 2001; after May 2001) "
                  "are both kept."))

    laws += paragraph_laws("dataset_DWG04_laws_2003_2004.txt", END_COMMON, None)
    notes.append(("dataset_DWG04_laws_2003_2004.txt",
                  "Main list under '2003:' and '2004:' headers (10 enactments)."))
    laws += paragraph_laws("dataset_DWG04_laws_2005_2006.txt", END_COMMON, None)
    notes.append(("dataset_DWG04_laws_2005_2006.txt",
                  "Main list under '2005:' and '2006:' headers (14 enactments)."))
    laws += paragraph_laws("dataset_DWG_laws_2007_2008.txt", END_COMMON, None)
    notes.append(("dataset_DWG_laws_2007_2008.txt",
                  "List under '2007:' and '2008:' headers (13 enactments). Text before "
                  "the first header (including 'Not listed are...') is skipped."))
    laws += paragraph_laws(
        "dataset_DWG_laws_2009_10.txt", END_COMMON, None,
        skip_re=re.compile(r"^and, during the lameduck", re.I))
    notes.append(("dataset_DWG_laws_2009_10.txt",
                  "List under 'Laws for calendar 2009/2010'. The connector paragraph "
                  "'and, during the lameduck congressional session of December 2010:' "
                  "is skipped; the entries after it are kept as 2010."))
    laws += paragraph_laws("dataset_DWG_laws_2011_12.txt", END_COMMON, None)
    notes.append(("dataset_DWG_laws_2011_12.txt", "List under 'Laws for calendar 2011/2012'."))
    laws += paragraph_laws("dataset-DWG-laws-2013-14.txt", END_COMMON, None)
    notes.append(("dataset-DWG-laws-2013-14.txt",
                  "List under 'Important laws for calendar 2013/2014' (first occurrence); "
                  "the long preface before it is skipped."))
    laws += paragraph_laws("dataset-DWG-laws-2015-16-2ba0cwe.txt", END_COMMON, None)
    notes.append(("dataset-DWG-laws-2015-16-2ba0cwe.txt", "List under 'Laws for calendar 2015/2016'."))
    laws += paragraph_laws("dataset-DWG-laws-2017-18ABCD-2-002-1kdgjur.txt", END_COMMON, None)
    notes.append(("dataset-DWG-laws-2017-18ABCD-2-002-1kdgjur.txt",
                  "The 'ABCD' in the file name does not mark separate lists; the file holds "
                  "one list under 'Laws for calendar 2017' and 'Laws for calendar 2018', "
                  "followed by wrap-up references and per-item details, which are skipped. "
                  "Mayhew codes the 16 CRA repeals as one law and two disaster-relief "
                  "installments (2017-18) as one law, dated by the year of its list."))
    laws += paragraph_laws("list_of_important_enactments_2019-2020.txt", END_COMMON, None)
    notes.append(("list_of_important_enactments_2019-2020.txt",
                  "List under 'Laws for calendar 2019/2020'; 'Selected references' sections skipped."))
    laws += paragraph_laws(
        "2023-01-11-117thCongressLawsEnacted.txt", END_COMMON, None, dash_ok=True)
    notes.append(("2023-01-11-117thCongressLawsEnacted.txt",
                  "List under 'CALENDAR 2021/2022' (13 items). The file separates the Inflation "
                  "Reduction Act and 'Post Office overhaul' with a form feed instead of a blank line; "
                  "read() converts form feeds to newlines. Titles in this file are separated "
                  "from descriptions by ' - ' or '. '."))
    laws += paragraph_laws("List-of-Important-Enactments-2023-2024.txt", END_COMMON, None)
    notes.append(("List-of-Important-Enactments-2023-2024.txt",
                  "List under 'CALENDAR 2023: No selections.' and 'CALENDAR 2024' "
                  "(8 enactments); 'CITES FOR...' sections skipped."))
    return laws, notes


def main():
    laws, notes = build()
    os.makedirs(OUT, exist_ok=True)
    # year-less entries keep blank year; order by congress then source order
    laws.sort(key=lambda d: d["congress"])  # stable: preserves source order
    # congress/year sanity: calendar year must fall in the congress
    for d in laws:
        if d["year"] is not None:
            assert congress_of(d["year"]) == d["congress"], d
    path = os.path.join(OUT, "mayhew_laws_1981_2024.csv")
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["id", "year", "congress", "title", "description", "source_file"])
        for i, d in enumerate(laws, 1):
            w.writerow([i, d["year"] if d["year"] is not None else "", d["congress"],
                        d["title"], d["description"], d["source_file"]])

    # notes
    by_file_year = defaultdict(Counter)
    by_file_cong = defaultdict(Counter)
    for d in laws:
        by_file_year[d["source_file"]][d["year"] if d["year"] else "blank"] += 1
        by_file_cong[d["source_file"]][d["congress"]] += 1
    lines = ["# Mayhew extraction notes", "",
             "Generated by `scripts/establishment/extract_mayhew.py`. "
             "Ignored on purpose: `datasets-laws-1991-2014-arnold-20f8cyy.txt` (a different author's list).",
             ""]
    for f, how in notes:
        lines.append(f"## {f}")
        lines.append(how)
        lines.append("")
        cnt = by_file_year[f]
        keys = sorted(cnt, key=lambda k: (k == "blank", str(k)))
        lines.append("Laws per year: " + ", ".join(f"{k}: {cnt[k]}" for k in keys))
        lines.append("")
    lines.append("## Year assignment and splitting rules")
    lines.append("")
    lines.append("- Paragraph-style files (2003 onward): year is the section header ('2007:', 'Laws for calendar 2007').")
    lines.append("- Flagged files (1981-2002): year is the last 4-digit year inside the entry text that falls in "
                 "that Congress's two years. Entries with no such year have a blank `year` column; "
                 "`congress` still comes from the list header.")
    lines.append("- Title: text up to the first sentence-ending period (abbreviations such as G.I., St., No. skipped), "
                 "or the first ' - ' in the 117th Congress file. If an entry has no period, the whole text is the "
                 "title and the description is empty. Trailing years/months after the title stay in the description.")
    lines.append("- Line-break hyphens are removed only when the joined word is in /usr/share/dict/words.")
    lines.append("")
    blank = [d for d in laws if d["year"] is None]
    lines.append(f"## Entries with blank year ({len(blank)})")
    lines.append("")
    for d in blank:
        lines.append(f"- Congress {d['congress']}: {d['title']}")
    lines.append("")
    # unsure splits: titles over 90 chars, or no description, in flagged files
    lines.append("## Entries with an uncertain title/description split")
    lines.append("")
    for d in laws:
        if len(d["title"]) > 90 or not d["description"] or d["description"] in (
                "(March)", "(October)", "(November)", "(December)", "(June)"):
            lines.append(f"- Congress {d['congress']}: {d['title'][:140]}")
    lines.append("")
    with open(os.path.join(OUT, "mayhew_extract_notes.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    # verification printout from the CSV itself
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    cc = Counter(int(r["congress"]) for r in rows)
    for c in range(97, 119):
        print(c, cc.get(c, 0))
    print("total", len(rows))
    yc = Counter(r["year"] or "blank" for r in rows)
    print({k: yc[k] for k in sorted(yc)})


if __name__ == "__main__":
    main()
