# Overnight Objective — Data-rigor figure audit

Run the forensic data-rigor audit (the 5 gates in `reqts/data-rigor-process.md`)
on every figure in the essay (Figures A–AD in `web/index.html`).

For each figure, verify the variables it depends on against all five gates:
1. **Codebook-grounded** — every ANES/data variable claim annotated and correct
   (annotation lives in `scripts/generate_variable_audit.py`; table in
   `reqts/variable-audit.md`).
2. **Observed distribution matches the codebook** — value counts line up.
3. **Pre vs Post weight alignment** — vote-choice / post-election analyses MUST
   use POST weights (V160102 / V200010b / V240107b etc.), not PRE.
4. **Substantive sense-check** — the numbers make directional sense.
5. **Footnote provenance** — the figure's footnote names dataset, variables,
   filter, n, weight, method.

## What I MAY do autonomously
- Fix verified DATA bugs in `scripts/` and regenerate derived tables under
  `data/derived/`.
- Refresh `reqts/variable-audit.md` (via `scripts/extract_codebook_entries.py`
  + `scripts/generate_variable_audit.py`).
- Add ✅ VERIFIED / 🔥 KNOWN-BUG-FIXED annotations.
- Fix a figure's JS data constants ONLY when they are demonstrably wrong vs the
  regenerated source data (a transcription/stale-number bug), and screenshot-verify.

## What I must NOT do autonomously (log instead)
- Edit or rewrite any user-authored prose. (Prose is sacred.)
- Restructure sections, renumber sections, or change the narrative.
- Change a figure in a way that would alter a stated conclusion.
- Any finding that contradicts a body claim → log to `DECISIONS.md` (the call I
  made) and, if it needs a prose change, `BLOCKERS.md` (recommended rewrite for
  morning review). Do NOT silently change prose.

## Done definition
Every figure has a current ✅/🔥 annotation in `reqts/variable-audit.md`, the
audit table regenerates clean, and any discrepancy is either fixed in
data/scripts (committed) or logged for review. Commit after each figure.
