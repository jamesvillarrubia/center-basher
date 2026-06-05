"""Generate reqts/variable-audit.md — adversarial review of every ANES variable.

Run: python scripts/generate_variable_audit.py
Output: reqts/variable-audit.md

For every variable matched by /\bV[0-9]{6}[a-z]?\b/ across scripts/, this writes:
  - File:line usage sites (verbatim line of code)
  - Observed value distribution from the actual .dta file
  - Known-bug annotations (with the fix that's in place)
  - An UNVERIFIED status for everything we haven't independently audited

Re-run any time you add a new figure that references an ANES variable.
"""
import json
import re
import os
import sys
import warnings
from collections import defaultdict

import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, "scripts")
from _lib import load_anes_2016, load_anes_2020, load_anes_2024  # noqa: E402

PATTERN = re.compile(r"\bV[0-9]{6}[a-z]?\b")


def gather_usage():
    usage = defaultdict(list)
    for root, _, files in os.walk("scripts"):
        for fn in files:
            if not fn.endswith(".py"):
                continue
            path = os.path.join(root, fn)
            for i, line in enumerate(open(path)):
                for var in PATTERN.findall(line):
                    usage[var].append({"file": fn, "line": i + 1, "code": line.rstrip()})
    return usage


def cycle_of(var):
    if var.startswith(("V160", "V161", "V162")):
        return 2016
    if var.startswith(("V200", "V201", "V202")):
        return 2020
    if var.startswith(("V240", "V241", "V242", "V243")):
        return 2024
    return None


def short_dist(df, var):
    if var not in df.columns:
        return None, "NOT IN DATA"
    s = df[var]
    snum = pd.to_numeric(s, errors="coerce")
    if snum.notna().sum() == 0:
        return s.astype(str).value_counts().head(10), "string"
    return snum.value_counts().sort_index().head(20), "numeric"


KNOWN_ANNOTATIONS = {
    # Catastrophic bugs caught + fixed; never let regress
    "V241049": "🔥 KNOWN-BUG-FIXED: codebook label is a HYPOTHETICAL Harris-vs-Trump question, NOT '2020 turnout'. We no longer use it for prior-vote. Replaced by V241106x.",
    "V242065": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 POST: 'Did R vote in 2024?'. Codes 1=did not vote, 2=thought about but didn't, 3=usually but didn't, 4=sure voted. Universe: 'IF R DID NOT REPORT IN THE PRE THAT R ALREADY VOTED' — so early voters (V241035==1) are EXCLUDED. Use combined V241035 ∨ V242065 for full turnout.",
    "V161158x": "🔥 KNOWN-BUG-FIXED: codebook-verified ANES 7-pt party summary 1=strong D … 7=strong R. Earlier off-by-one mapping dropped codes 6,7 to empty bucket. Now: 1,2,3 → dem, 4 → ind, 5,6,7 → rep.",
    "V201231x": "🔥 KNOWN-BUG-FIXED: codebook-verified — 'PRE: SUMMARY: PARTY ID', 1=Strong Democrat … 7=Strong Republican. Off-by-one corrected. Now: 1,2,3 → dem, 4 → ind, 5,6,7 → rep.",
    "V162031x": "🔥 KNOWN-BUG-FIXED: codebook-verified — 1=voted, 0=did not vote in 2016, -2=not ascertained. We drop -2 voters from the voter map (was previously folded silently into 'did not vote').",
    "V242067": "🔥 KNOWN-BUG-FIXED: codebook lists ONLY codes 1=Harris, 2=Trump, 4=West, 5=Stein, 6=other. Code 3 does NOT exist (Kennedy withdrew). Earlier code had {3:'kennedy'} — dead code, removed.",
    "V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMIZED HALVES of the same 2016-recall question. Each respondent gets only one. Using V201101 alone misses ~half the sample. Build now combines V201101 ∨ V201102. Effect: 2020 drop-off count was 101, now 230; new-voter count was 372, now 679.",
    "V201102": "🔥 KNOWN-BUG-FIXED: Companion to V201101 (versions 1A/1B). Was previously unused. Now combined with V201101 to recover full sample.",
    "V242066": "🔥 KNOWN-BUG-FIXED: Universe 'IF R REPORTED IN THE POST SURVEY THAT R VOTED'. V242066 is conditional on already-voted; it asks 'did you vote for president specifically'. NOT a turnout question. Using it alone undercounts non-voters by ~95% (only 39 of 5521 code as 2). REPLACED in voter-map by combined V241035 (early voted in pre) ∨ V242065 (post-survey turnout, code 4=voted).",
    "V241035": "✅ CODEBOOK-VERIFIED: 2024 PRE: 'Have you already voted?' 1=have voted (early voter), 2=have not voted. Used in combined 2024 turnout binary.",
    "V161031": "🔥 RETIRED: codebook label is 'For whom does R intend to vote' — measured intention not undecidedness. Previously misused as swing flag. Replaced by behavioral cross-pressure definition.",

    # Verified against codebook (✅ — codebook entries confirm the usage)
    "V161126": "✅ CODEBOOK-VERIFIED: 'PRE: 7pt scale Liberal conservative self-placement'. 1=extremely liberal, 4=moderate, 7=extremely conservative. Code applies .between(1, 7) to drop -9/-8.",
    "V201200": "✅ CODEBOOK-VERIFIED: 2020 ideology self-placement, same 1-7 scale as V161126.",
    "V241177": "✅ CODEBOOK-VERIFIED: 2024 ideology self-placement, same 1-7 scale.",
    "V161215": "✅ CODEBOOK-VERIFIED: 'PRE: REV How often trust govt in Wash to do what is right' Likert 1-5 (1=always, 5=never). Code transforms (5-x)/4 so higher=more trust.",
    "V161216": "✅ CODEBOOK-VERIFIED: 'gov run by few big interests vs benefit of all', 1=few/2=all. Code transforms (x-1) so 1=more trust (i.e. 2 → 1).",
    "V161217": "✅ CODEBOOK-VERIFIED: 'how much tax money wasted' 1=a lot, 3=not much. Code transforms (x-1)/2 so higher=more trust.",
    "V201233": "✅ CODEBOOK-VERIFIED: 2020 analog of V161215. Same scale.",
    "V201234": "✅ CODEBOOK-VERIFIED: 2020 analog of V161216. Same scale.",
    "V201235": "✅ CODEBOOK-VERIFIED: 2020 analog of V161217. Same scale.",
    "V241229": "✅ CODEBOOK-VERIFIED: 2024 analog of V161215 (gov-officials do right).",
    "V241231": "✅ CODEBOOK-VERIFIED: 2024 analog of V161216 (few interests vs all).",
    "V241232": "✅ CODEBOOK-VERIFIED: 2024 analog of V161217 (tax money wasted).",
    "V202109x": "✅ CODEBOOK-VERIFIED: 2020 turnout summary (validated). 0=did not vote, 1=voted, -2=not reported.",
    "V241106x": "✅ CODEBOOK-VERIFIED: 2024 prior-vote recall. 1=did not vote 2020, 2=Biden, 3=Trump, 4=other.",
    "V241227x": "✅ CODEBOOK-VERIFIED: 2024 7-pt party summary. Same scale as V161158x/V201231x. Already mapped correctly (1,2,3→dem; 4→ind; 5,6,7→rep).",
    "V162034a": "✅ CODEBOOK-VERIFIED: 2016 general-election vote. 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other.",
    "V202073": "✅ CODEBOOK-VERIFIED: 2020 general-election vote. 1=Biden, 2=Trump, 3=Jorgensen, 4=Hawkins, 5=other.",

    # Weights — verified by codebook + cross-checked by 2026-06-05 audit
    "V160101": "✅ CODEBOOK-VERIFIED: ANES 2016 PRE survey weight. Use for pre-election analyses.",
    "V160102": "✅ CODEBOOK-VERIFIED: ANES 2016 POST survey weight. Use for vote-choice / post-election analyses. (Currently used in voter map.)",
    "V200010a": "🔥 KNOWN-BUG-FIXED: ANES 2020 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py; switched to V200010b (POST) per Gate 3 of rigor process.",
    "V200010b": "✅ CODEBOOK-VERIFIED: ANES 2020 POST weight. Now used for the voter map (vote choice is post-election data).",
    "V240107a": "🔥 KNOWN-BUG-FIXED: ANES 2024 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py; switched to V240107b (POST).",
    "V240107b": "✅ CODEBOOK-VERIFIED: ANES 2024 POST weight. Now used for the voter map.",

    # State codes — used for swing-state subsetting
    "V161010d": "✅ CODEBOOK-VERIFIED: 2016 state FIPS code (numeric).",
    "V201014b": "✅ CODEBOOK-VERIFIED: 2020 state FIPS code.",
    "V243002": "✅ CODEBOOK-VERIFIED: 2024 state code (stored as string in the .csv).",

    # Honesty / trait-rating variables — verified but reverse-coded
    "V161162": "✅ CODEBOOK-VERIFIED with CAVEAT: 2016 Dem-candidate trait 'honest' Likert 1=extremely well..5=not well at all. Code applies (5-x)/4 to flip direction so higher=more honest.",
    "V161167": "✅ CODEBOOK-VERIFIED with CAVEAT: 2016 Rep-candidate trait, same scale as V161162. Same transform.",
    "V201211": "✅ CODEBOOK-VERIFIED with CAVEAT: 2020 Dem-candidate honesty. Same scale.",
    "V201215": "✅ CODEBOOK-VERIFIED with CAVEAT: 2020 Rep-candidate honesty. Same scale.",
    "V241203": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 Dem-candidate honesty. Same scale.",
    "V241208": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 Rep-candidate honesty. Same scale.",
}


def main():
    usage = gather_usage()
    dfs = {2016: load_anes_2016(), 2020: load_anes_2020(), 2024: load_anes_2024()}

    out = []
    out.append("# ANES Variable Audit — Center-Basher\n")
    out.append("> **Purpose.** Adversarial review of every ANES variable used across `scripts/`. ")
    out.append("Each row shows: file:line usage site (verbatim code), the observed value distribution from the actual data file, ")
    out.append("known-bug annotations, and an audit status. The goal is to catch variable-naming bugs ")
    out.append("(wrong code, wrong direction, wrong mapping) BEFORE they ship to readers.\n")
    out.append("Regenerate with: `python scripts/generate_variable_audit.py`\n")
    out.append("**Status legend:**")
    out.append("- 🔥 KNOWN-BUG-FIXED — previously catastrophic misuse; fix recorded inline (don't break it again)")
    out.append("- ⚠️ SUSPECT / COVERAGE LIMIT — usable but has a known caveat that must be respected")
    out.append("- ❓ UNVERIFIED — usage looks correct against the observed distribution, but no codebook PDF on disk for independent confirmation\n")
    out.append("**No codebook PDFs for ANES 2016 / 2020 / 2024 are checked in.** ")
    out.append("Annotations marked 'UNVERIFIED but high-confidence' draw on standard ANES variable-naming conventions and the consistency of the data distribution with the documented usage. For any NEW figure depending on an UNVERIFIED variable: download the codebook PDF, cross-check, and upgrade the annotation here.\n")
    out.append("---\n")

    by_cycle = {2016: [], 2020: [], 2024: []}
    for var in sorted(usage.keys()):
        c = cycle_of(var)
        if c:
            by_cycle[c].append(var)

    for cyc in [2016, 2020, 2024]:
        df = dfs[cyc]
        out.append(f"\n## Cycle: ANES {cyc}  (n_respondents = {len(df)})\n")
        for var in by_cycle[cyc]:
            sites = usage[var]
            vc, kind = short_dist(df, var)
            status = KNOWN_ANNOTATIONS.get(var, "❓ UNVERIFIED — usage observed, no audit annotation yet. Cross-check before relying on it for a new figure.")
            out.append(f"\n### `{var}` [{cyc}]  —  {status}\n")
            if kind == "NOT IN DATA":
                out.append("**NOT FOUND IN LOADED DATA FRAME** — usage site may be broken or guarded by a `.get(...)` fallback.\n")
            else:
                out.append(f"**Observed distribution** (top values, {kind}):\n")
                out.append("```")
                for k, v in vc.items():
                    out.append(f"  {k!r:>10}: {v}")
                out.append("```\n")
            out.append(f"**Usage sites ({len(sites)})**:\n")
            for s in sites[:25]:
                code = s["code"].lstrip()
                if len(code) > 130:
                    code = code[:127] + "..."
                out.append(f"- `{s['file']}:{s['line']}` — `{code}`")
            if len(sites) > 25:
                out.append(f"- _...and {len(sites)-25} more usage sites_")

    out.append("\n---\n\n## Summary\n")
    total = sum(len(v) for v in by_cycle.values())
    annotated = sum(1 for v in usage if v in KNOWN_ANNOTATIONS)
    out.append(f"- Total ANES variables in use: **{total}**")
    out.append(f"- With explicit audit annotation: **{annotated}**")
    out.append(f"- Marked UNVERIFIED (default): **{total - annotated}**")
    out.append("\n## Process for new variables\n")
    out.append("Before introducing a NEW ANES variable into any build script:")
    out.append("1. Look it up in the ANES codebook PDF for that cycle (download from ANES website)")
    out.append("2. Verify the value-count distribution matches the codebook")
    out.append("3. Add a one-line annotation to `KNOWN_ANNOTATIONS` in this script")
    out.append("4. Re-run `python scripts/generate_variable_audit.py`")
    out.append("5. Commit the regenerated `reqts/variable-audit.md` with the code change")

    path = "reqts/variable-audit.md"
    with open(path, "w") as f:
        f.write("\n".join(out))
    print(f"Wrote {path} ({len(out)} lines)")


if __name__ == "__main__":
    main()
