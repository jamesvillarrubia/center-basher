# Overnight Objective — statistical audit + style/gravitas pass (2026-06-25)

Audit "The Center Is a Lie" (web/index.html) for (1) statistical MISTAKES, (2) statistical
OVERCLAIMS (causal language on correlational findings, false precision, "proves/all/most"
without support), (3) a thorough STYLE/writing check, and (4) lift the OPENING to the
flow/gravitas/register of the final paragraphs (the coda). James emphasized the beginning.

## Deliverables (analysis docs in docs/analysis/, committed locally; index.html NOT edited)
- **Gravitas/opening** (James's priority, do FIRST): characterize the coda's register, diagnose
  why the opening (§0–§2) feels lighter, and DRAFT 2–3 opening rewrites in James's voice that
  carry the coda's gravitas. He reviews/places them.
- **Statistical audit**: every body statistical claim cross-checked vs the data + footnotes +
  reqts/data-rigor-process.md gates; extend the prior `claim-review.md` (2026-06-19 fact-check),
  don't redo it. Flag mistakes AND overclaims with a specific rewrite per item.
- **Style audit**: AI-cadence, em-dash overuse, and James's known voice prefs (no staccato
  fragments / negation-correction / if-then antithesis; mirror long momentum sentences; granular
  per-claim citations; no bare §N markers; lede = body size). Line-level flags + suggested fixes.
- **Synthesis**: a prioritized summary + pointer in OPEN-QUESTIONS.md.

## HARD CONSTRAINTS
- **NEVER edit web/index.html** — prose-sacred HARD GATE + James edits it in Cursor. Reads only.
  All rewrites are DRAFTS in docs/analysis/ for James to apply.
- **Commit analysis docs LOCALLY only. Do NOT push or deploy.**
- Believe the user's intuitions; flag overclaims honestly with numbers (CLAUDE.md §3/§4).
- Capacity SLOW (87%) — cheapest viable model, single Sonnet subagents (never parallel), reserve
  Opus for the gravitas drafting (voice judgment). If capacity hits STOP, committed progress
  survives; resume after reset.
