# Overnight Run Summary — Data↔prose↔web integrity drift-guard

**Objective:** Build a reusable integrity harness catching number drift between data,
build scripts, the `web/data` copy figures load, and the prose that quotes it; then run
it and report.
**Result:** Queue complete (4/4). `scripts/check_integrity.py` shipped with all four
checks. Full run: **57 items, 0 drift, exit 0**, `data/clean` pristine after. The essay's
data layer is verifiably clean; two provenance/cleanup items logged for review.

## Delivered
- **`scripts/check_integrity.py`** — re-runnable guard (read-only by default; `--repro`
  adds the build-reproducibility pass that mutates then git-restores `data/clean`; refuses
  a dirty tree).
- **`.claude/overnight/integrity-report.md`** — full results + triage of every advisory.

## What the harness proved clean
- **web/data mirror:** 22 shared files byte-identical to `data/clean`; `voters.json`
  correctly the one expected web-only file. 0 drift.
- **Build reproducibility:** 28/29 `build_*.py` regenerate their committed output exactly;
  the one non-pass is the deprecated `build_voter_map_2016.py` (sys.exit-guarded). No
  stale data. 0 drift.
- **Figure render set:** 30 figure letters contiguous A..AD, no dups; all 30 inline
  "Figure X" refs resolve. 0 orphans.
- **Number-tracing (advisory):** every untraced footnote token explained — 3 external
  poll cites (YouGov/Pew), 3 internal care-gap/subsample n's (unpersisted), 3 "percentages"
  that are budget-deficit figures. No stale/typo numbers found.

## Logged for your review (NOT executed — see BLOCKERS.md)
1. **3 unreferenced JS modules** — `fig-17c-campaign-ceiling.js` (likely WIP for the
   pending C1 ceiling figure → keep), `fig-19a-disaffected.js` + `fig-19b-moveable-ground.js`
   (likely post-renumber leftovers → likely deletable). Deleting source is ask-first.
2. **Fig S (care gap) has no reproducible pipeline** — hardcoded JS constants; n's trace to
   no data file. Recommended `build_care_gap.py` to make it data-driven + check-verifiable.
   Adding a script that recomputes a displayed number is ask-first.

## Also this session (before the overnight run)
- Wired the 38% "averages to center" illusion into §2, fulfilling §1's footnote promise
  (commit e26df6a). New reproducible ref row in `build_center_breakdown.py`.

## State
All work on branch `claude/dazzling-maxwell-sSHUR`, none pushed. Harness exits 0 (clean).
The prior data-rigor audit objective + its 3-phase summary are archived as
`OBJECTIVE.audit-2026-06-13.md` / `SUMMARY.audit-2026-06-13.md`.
