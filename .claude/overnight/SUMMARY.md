# Overnight Run Summary — Data-rigor figure audit

**Objective:** Run the 5-gate data-rigor audit on every figure's ANES variables.
**Result:** Queue complete (8/8). Zero ❓ remain among the four high-risk variable
categories (turnout, vote-choice/primary, party-ID/ideology, trust). No data or
build scripts were changed, so the live figures are byte-identical — all work was
annotation/audit + logging. Every figure-affecting fix that would cascade to prose
was logged for review, not executed (prose-sacred gate respected).

## What was verified (all 5 gates, high-risk families)
- **Turnout** (V162031x, V242065, V242066, V201101/V201102, V241035, V202109x, V161005): all 🔥/✅, Universe cited where it bit before. Upgraded V161005 ❓→✅ (codebook: "Did R vote for President in 2012", all 4270 coded).
- **Vote-choice + primary** (V161021a, V162034a, V202073, V242067, V241049, V241106x): clean, POST-weighted in the live voter map. Annotated the two comment-only ❓ (V161021 ✅ gate-question, V161022x ⚠️ phantom).
- **Party-ID + ideology**: 7-pt mapping IDENTICAL and correct across all 3 cycles (1,2,3→dem / 5,6,7→rep / 4→ind), no off-by-one, all codes present (Gate 2). Annotated V241228 ❓→✅ (comment-only).
- **Trust composite**: directions verified, identical transforms across all builders; CDF trust documented inline with correct reversal logic.

## What was fixed (committed, gate-safe — no data/prose touched)
1. Un-staled `generate_variable_audit.py`: it claimed "No codebook PDFs are checked in / download the PDF" — but anes_2016/2020/2024_codebook.txt ARE on disk. Header/legend/process now point at the on-disk codebooks. Regenerated audit + codebook_entries.txt.
2. Codebook-cited annotations added: V161005, V161021, V161022x, V241228.

## Findings flagged for your review (NOT executed — see BLOCKERS.md / DECISIONS.md)
**Gate-3 weight violations (the biggest find).** The 2020/2024 PRE→POST weight fix
applied to the voter map was never propagated to several older single-cycle scripts.
Each cascades to figure numbers printed in prose, so they're logged with recommended
fixes:
- **Fig Z** (trust×turnout): 2020 row uses PRE V200010a (lone outlier; 2016/2024 use POST) — turnout is post-election → V200010b. Affects the r-values you set this session.
- **Fig D** (partisan loyalty): PRE V160101 on a vote-choice analysis (conditions on `voted`) → V160102.
- **Fig X** (honesty crossover): cross-cycle weight inconsistency (2016 POST, 2020/2024 PRE).
- Same PRE-on-post pattern in turnout_hump, within_tent_bolt; needs-check: trust_by_cohort, within_cycle_multi.

**Prose-vs-data discrepancy.** Fig AA caption says Sanders primary centroid n=339;
live voter_map_2016.json has n=300. Reconcile (likely two populations, or a stale number).

**Gate-5 provenance gaps (caption additions).** Fig X caption is narrative-only (no
dataset/variables/weight/method/n); Fig P omits n+weight+VCF codes; Fig AA omits
weight+V-codes from the visible caption. Recommendations in DECISIONS.md.

## Safe-but-worth-knowing
- `build_voter_map_2016.py` is the OLD single-cycle builder that uses the bugged
  V161022/V161023 primary vars and writes the same path as build_voter_maps_all.py.
  It is already hard-guarded (`sys.exit` at top) + deprecated, so it can't run. Left as-is.

## Remaining for a future pass (out of scope this run)
33 ❓ variables, all LOWER-RISK than the audited four categories: feeling
thermometers, issue-position items, efficacy items, RR-scale items, and one
weight-fallback ref (bare V240107). None are turnout/vote/party/trust. A follow-up
run could codebook-verify these the same way.

## Commits this run
8 commits (one per queue item), all on branch claude/dazzling-maxwell-sSHUR, none pushed.

[2026-06-12 17:33:50] QUEUE-COMPLETE emitted by agent. Run finished cleanly.
