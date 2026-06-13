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

---

# Phase 2 Summary — Applying the audit findings (interactive → autonomous)

Phase 2 began during an interactive findings review (user approved Fig Z + Fig D),
then continued autonomously via /overnight. Posture: apply data/script weight fixes
+ sync a figure's OWN computed numbers in its caption; log anything that lands in
body/footnote prose or changes a conclusion.

## Applied + committed (3 figure fixes + 2 caption syncs)
1. **Fig Z (trust×turnout, §17)** — 2020 weight PRE V200010a → POST V200010b (Gate 3).
   r-values: overall −0.33→−0.37, low-trust era −0.81→−0.80 (+0.86 unchanged; sign-flip
   intact). Regenerated, copied data/clean→web/data, synced caption + JS comment + docstring.
2. **Fig D / partisan loyalty** — PRE V160101 → POST V160102. Not a live figure; loyalty
   ~unchanged (87%), all-defectors 4.26%→4.99%. Committed (not quoted in prose).
3. **Fig X (honesty crossover, §16)** — 2016 weight POST V160102 → PRE V160101 for
   cross-cycle consistency (sample is pre-election perception, not voter-restricted).
   2016 dot moved imperceptibly (gap −1.03→−1.10); "9 of 12" + 12/12 swing pattern intact;
   no prose value quoted. Regenerated + copied to web/data.
4. **Fig AA (voter map, §18)** — caption Sanders centroid n 339→300 (339 was a stale
   hardcoded default; the figure plots the computed n=300).

## Logged for your review (would desync prose / change conclusions) — see BLOCKERS.md
- §2/§3 defector-stat cluster (build_center_overlap_matrix / center_breakdown / swing_spectrum):
  PRE weight on vote-conditioned stats; feeds quoted footnotes ("4% defectors, n=178" → ~5%).
- §7 within_tent_bolt (LIVE Figure K): PRE on voter-restricted vote analysis; quoted "53% / 10%"
  in §7 → switch to POST + update prose together.
- turnout_hump: same pattern but NOT rendered (low priority).
- Gate-5 provenance: ready-to-paste caption text drafted for Fig X, Fig P, Fig AA.

## Not violations (documented)
trust_by_cohort, within_cycle_multi — PRE measures, no vote/turnout condition.

## State
Audit regenerates clean (2116 lines); high-risk variable families still 0 ❓; the three
changed build scripts run green; weight vars all annotated. All work on branch
claude/dazzling-maxwell-sSHUR, none pushed.
