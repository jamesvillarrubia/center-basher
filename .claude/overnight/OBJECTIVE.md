# Overnight Objective — Data↔prose↔web integrity drift-guard

Build a reusable integrity harness that catches the data-journalism failure mode
that has repeatedly bitten this project: a number drifting between the data that
backs it, the script that computes it, the `web/data` copy a figure loads, and the
prose/footnote that quotes it. Then run it and report every discrepancy.

The deliverable is `scripts/check_integrity.py` plus a findings report at
`.claude/overnight/integrity-report.md`. The harness must be safe to re-run any time
(a regression guard), exit non-zero when it finds drift, and NEVER edit prose or data.

## The four integrity checks the harness performs
1. **web/data mirror check** — every `web/data/*.json` (and `.csv`) that has a
   `data/clean/<same-name>` source is byte-identical to it. Report drift; the known
   web-only `voters.json` (no clean source) is expected and listed, not flagged.
2. **Reproducibility check** — re-running each `scripts/build_*.py` leaves its committed
   `data/clean/` output unchanged per git. Procedure per script: run it, `git diff
   --exit-code data/clean/`, then `git checkout -- data/clean/` to restore. A non-empty
   diff means the committed output is stale vs the script (a finding). Build failures are
   captured and reported, never crash the harness.
3. **Number-tracing** — for each figure, extract the n's and percentages quoted in its
   `web/index.html` caption + footnote, and check whether a matching value exists in the
   data file that figure loads (or, for figures with hardcoded JS constants like the
   waffle, confirm the JS constant matches the data file's value). Mismatches are
   FINDINGS, not auto-fixes.
4. **Figure render set** — confirm every `Figure <Letter>` label referenced in prose has
   a defined figure block and a JS module, and vice-versa (no orphan refs, no dead modules).

## What I MAY do autonomously
- Write/iterate `scripts/check_integrity.py` and supporting helpers.
- Run all build scripts in the safe run→diff→restore pattern above.
- Write the findings report and log discrepancies.
- Fix a demonstrable MECHANICAL drift bug where the fix is unambiguous and does NOT
  change a stated conclusion: e.g. re-copy a stale `web/data` file from its in-sync
  `data/clean` source, or regenerate a derived table. Commit with the drift it fixed.

## What I must NOT do autonomously (log instead)
- Edit or rewrite any user-authored prose. Prose is sacred.
- Change any figure's displayed numbers, or any number quoted in body/footnote prose,
  even to "fix" a mismatch — log it to `BLOCKERS.md` with the exact discrepancy and a
  recommended reconciliation for morning review.
- Anything that changes a stated conclusion.
- Restructure or renumber sections.

## Done definition
`scripts/check_integrity.py` exists, runs end-to-end, exits 0 when clean and non-zero on
drift, and `.claude/overnight/integrity-report.md` lists the status of all four checks for
every figure. Every discrepancy is either fixed (mechanical, committed) or logged to
BLOCKERS.md (anything touching prose/figures/conclusions). Commit after each queue item.
