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
    "V241049": "🔥 KNOWN-BUG-FIXED: NOT '2020 turnout' — this is a HYPOTHETICAL Harris-vs-Trump willingness question. We no longer use it for prior-vote. Replaced by V241106x.",
    "V242065": "🔥 KNOWN-BUG-FIXED: codes are INVERTED (1 = did NOT vote, 4 = sure voted). Replaced in voter-map by V242066 which is a clean binary (1=voted, 2=did not).",
    "V161158x": "🔥 KNOWN-BUG-FIXED: standard ANES 7-pt party summary 1=strong D … 7=strong R. Earlier off-by-one mapping treated 3 as 'ind' (it's lean-D) and dropped codes 6,7 to empty. Now correctly: 1,2,3 → dem, 4 → ind, 5,6,7 → rep.",
    "V201231x": "🔥 KNOWN-BUG-FIXED: same scale as V161158x. Off-by-one corrected — now 1,2,3 → dem, 4 → ind, 5,6,7 → rep.",
    "V162031x": "🔥 KNOWN-BUG-FIXED: 1=voted, 0=did not vote in 2016, -2=not ascertained (post-election survey not completed). We now drop -2 voters from the voter map (was previously folded silently).",
    "V201101": "⚠️ COVERAGE LIMIT: 'voted in 2016?' was only asked of a subset; ~4193 / 7000 respondents have -1 (inapplicable). Cohort flags (new/dropoff) only computable for the ~2860 with valid answers.",
    "V161126": "❓ UNVERIFIED but high-confidence: standard ANES 7-pt ideology self-placement (1=ext lib, 4=middle, 7=ext con). Used widely; transforms to [-1,+1] are consistent.",
    "V161215": "❓ UNVERIFIED but high-confidence: 'gov-officials do what is right' Likert 1-5; we transform via (5-x)/4 so higher=more trust.",
    "V161216": "❓ UNVERIFIED but high-confidence: 'gov run by few big interests' binary (1=few/2=all); we transform (x-1) so 1=more trust.",
    "V161217": "❓ UNVERIFIED but high-confidence: 'how much tax money wasted' (1=a lot, 3=not much); we transform (x-1)/2 so higher=more trust.",
    "V201233": "❓ UNVERIFIED but high-confidence: 2020 analog of V161215 (gov-officials do right).",
    "V201234": "❓ UNVERIFIED but high-confidence: 2020 analog of V161216 (few interests vs all).",
    "V201235": "❓ UNVERIFIED but high-confidence: 2020 analog of V161217 (tax money wasted).",
    "V160101": "❓ UNVERIFIED but high-confidence: ANES 2016 PRE survey weight.",
    "V160102": "❓ UNVERIFIED but high-confidence: ANES 2016 POST survey weight (preferred for general-election voter analyses).",
    "V200010a": "❓ UNVERIFIED but high-confidence: ANES 2020 PRE weight.",
    "V200010b": "❓ UNVERIFIED but high-confidence: ANES 2020 POST weight.",
    "V240107a": "❓ UNVERIFIED but high-confidence: ANES 2024 PRE weight (a-suffix variant).",
    "V240107b": "❓ UNVERIFIED but high-confidence: ANES 2024 POST weight (b-suffix variant).",
    "V161010d": "❓ UNVERIFIED but high-confidence: 2016 state FIPS code (numeric).",
    "V201014b": "❓ UNVERIFIED but high-confidence: 2020 state FIPS code.",
    "V243002": "❓ UNVERIFIED but high-confidence: 2024 state code (stored as string in the .csv).",
    "V162034a": "❓ UNVERIFIED but high-confidence: 2016 general-election presidential vote choice. 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=Other.",
    "V202073": "❓ UNVERIFIED but high-confidence: 2020 general-election presidential vote choice.",
    "V242067": "❓ UNVERIFIED but high-confidence: 2024 general-election presidential vote choice. 1=Harris, 2=Trump, 3=Kennedy, 4=West, 5=Stein, 6=Other.",
    "V202109x": "❓ UNVERIFIED but high-confidence: 2020 turnout summary (validated). 0/1 binary; -1=inapplicable.",
    "V242066": "❓ UNVERIFIED but high-confidence: 2024 turnout binary (1=voted for president, 2=did not). Cleaner replacement for V242065.",
    "V241106x": "❓ UNVERIFIED but high-confidence: 2024 prior-2020-vote recall. 1=did not vote 2020, 2=Biden, 3=Trump, 4=Other.",
    "V241177": "❓ UNVERIFIED but high-confidence: 2024 ideology self-placement (analog of V161126).",
    "V241227x": "❓ UNVERIFIED but high-confidence: 2024 7-pt party summary (1=strong D … 7=strong R). Already mapped correctly.",
    "V161031": "🔥 RETIRED: previously used as 'undecided pre-election' swing flag — produced right-skewed cohort. Replaced by behavioral cross-pressure definition (independents + cross-party defectors).",
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
