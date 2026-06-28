# Overnight Objective — Make hardcoded figures reproducible + rigor-clean (2026-06-25)

James is away (kids, intermittent access) and directed this run via /overnight. EDITS to
`scripts/` and `web/js-v2/` ARE authorized this run. The goal: kill the "where did this number
come from?" vulnerability on the figures a hostile reviewer would attack, plus two small fixes.

## Work
- **C1 — `fig-17c` campaign ceiling (James LOVES it; make it bulletproof).** Make it data-backed:
  - The **22pp** "WHO you nominate" bar = trust-band vote-share swing (90%→68%) within the
    relevant coalition, derived from ANES 2016 — same data as §16 Figure B / `fig-16b-trust-bands`.
    Replicate the exact number; if it isn't 22.0, use the real one and note it.
  - The **0.4pp** "campaign" bar is a LITERATURE number (Kalla & Broockman 2018, "The Minimal
    Persuasive Effects of Campaign Contact in General Elections," 49 field experiments). Nail the
    EXACT reported estimate + a precise citation. Not an ANES computation.
  - **Recolor** the gray campaign bar to a non-gray color (James asked). Keep the blue nomination bar.
  - Verify it renders in `web/preview-17c.html`.
- **#3 — `scripts/build_care_gap.py`.** Reproduce the §13 care-gap numbers from ANES 2016
  (70.5 / 35.9 → 34.6pp for all; 52.2 / 25.6 → 26.6pp for low-engagement; n 3,117 and 214/301).
  If the rebuild disagrees, that's a REAL FINDING — log it, don't paper over.
- **#4 — bare §N scan.** Find any genuinely-bare `§N` in `web/index.html` body (standalone, not
  `<a class="secref">§N</a>`). Report; don't edit index.html.
- **#5 — `scripts/build_turnout_hump.py` weight.** `V160101` (PRE) → `V160102` (POST) + fix the
  manifest label that wrongly calls V160101 "post-election." Verify the script still runs.
- **Prose draft (contingent on C1).** If C1's data holds (nomination >> campaign), draft 2-3
  colorful options for James's "the election is in the primary / institutional thumb on the
  primary scale = boot on the party's neck in the general" line. LOG to OPEN-QUESTIONS for James
  to place. Do NOT write it into index.html.

## HARD CONSTRAINTS
- **Commit LOCALLY only. Do NOT push or deploy** (production branch auto-deploys → blocker).
- **NEVER edit `web/index.html`** — James is editing it in Cursor (concurrent-edit risk). Reads OK.
- Prose-sacred gate holds. If a computed number differs from a PUBLISHED figure, LOG + flag in
  `OPEN-QUESTIONS.md`; never silently change a published number.
- Follow `reqts/data-rigor-process.md` gates: POST weights for post-election analyses; exclude
  ANES missing codes (-9,-8,-7,-6,-1,-2); load `.dta` with `convert_categoricals=False`.
- Capacity is SLOW — cheapest viable model, offload data work to single Sonnet subagents, no
  parallel fan-out, reserve Opus for genuinely hard judgment.
