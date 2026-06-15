# Integrity report — data ↔ prose ↔ web drift-guard

**Run:** 2026-06-15 · `python scripts/check_integrity.py --repro`
**Verdict:** ✅ CLEAN — 57 items across 4 checks, **0 drift**, exit 0.
`data/clean` confirmed pristine after the reproducibility pass.

The harness is a permanent regression guard. Re-run anytime:
- `python scripts/check_integrity.py` — fast, read-only (checks 1, 3, 4)
- `python scripts/check_integrity.py --repro` — adds check 2 (re-runs builds, restores after)

---

## Check 1 — web/data mirror  ✅ 0 drift / 23
Every `web/data/*` with a `data/clean/` source is byte-identical. 22 shared files in
sync; `voters.json` is the one expected web-only file (no clean source). **No drift.**

## Check 2 — build reproducibility  ✅ 0 drift / 29
Re-ran every `scripts/build_*.py`; each leaves its committed `data/clean/` output
unchanged per git. 28/29 reproducible. The lone non-pass is `build_voter_map_2016.py`,
the deprecated `sys.exit`-guarded builder (correctly refuses to run; captured as info,
not a crash). **No stale data anywhere — every live figure's data regenerates exactly.**

## Check 3 — number-tracing (advisory heuristic)  0 drift / 2
Footnote n's and percentages matched against real `data/clean` numeric values. Advisory
only: an untraced number is usually an external citation or an unpersisted build
intermediate, occasionally a real typo. Triage of every untraced token below.

**Sample sizes — 12/18 trace; 6 untraced, all explained:**
| n | Source | Verdict |
|---|---|---|
| n=1,164 | YouGov poll, Nov 2024 | ✅ external citation — correctly not in our data |
| n=3,445 | Pew, Sep 2025 | ✅ external citation |
| n=8,480 | Pew ATP, Jul 2023 | ✅ external citation |
| n=3,117 | Fig S care-gap, "care a good deal" turnout | ⚠ internal but **unpersisted** (see finding) |
| n=214 / 301 | Fig S care-gap, gettable subset | ⚠ internal but **unpersisted** (see finding) |
| n=1,505 | non-Republican trust-tercile subsample | ⚠ internal subsample n, not stored as a value |

**Percentages — 96/99 trace; 3 untraced, all false extractions:** `150%`, `204%`, `317%`
are deficit-change table figures (`−150%`, `+1,204%` mis-split to "204%", `+317%`) from
external budget data, not ANES shares. Not findings.

## Check 4 — figure render set  ✅ 0 drift / 3 (1 info)
- **Figure letters:** 30 defined, contiguous A..AD, no duplicates. ✅
- **Inline refs:** all 30 referenced "Figure X" letters resolve to a definition. ✅
- **JS modules:** 3 unreferenced module files (info — possible dead code / staged WIP):
  `fig-17c-campaign-ceiling.js`, `fig-19a-disaffected.js`, `fig-19b-moveable-ground.js`.

---

## Findings logged for review (not executed — see BLOCKERS.md)
1. **3 unreferenced JS modules.** `fig-17c-campaign-ceiling.js` likely WIP for the pending
   C1 ceiling figure (keep); the two `fig-19*` look like post-renumber leftovers (likely
   safe to delete). Deleting source is ask-first → logged, not done.
2. **Fig S (care gap) has no reproducible pipeline.** Its shares are hardcoded JS constants
   and its n's trace to no `data/clean` file, so check 2 can't verify them. Recommended a
   `build_care_gap.py` so the figure becomes data-driven and check-2/3 verifiable. Adding a
   script that recomputes a displayed number is ask-first → logged, not done.

## Bottom line
No data↔web drift, no stale build output, no orphan figure references. The two logged
items are provenance/cleanup, not wrong numbers. `scripts/check_integrity.py` now stands
as a re-runnable guard against the drift class that has bitten this project before.
