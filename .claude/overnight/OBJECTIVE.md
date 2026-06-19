# Overnight Objective — Adversarial claim fact-check (ENTIRE essay)

Fact-check every empirical and factual claim in the WHOLE of `web/index.html` (§0–§25) the
way a hostile expert reviewer would, and audit citation coverage against the granular
per-claim standard. Prioritize EXTERNAL/verifiable claims (polls, academic papers, named
quotes, historical facts) — those are where errors like the §20 "Clinton lost Illinois"
mistake hide. Spot-check the ANES/data claims for footnote provenance + sanity (they are
self-sourced via the project's data-rigor process; do not re-derive every number).

**§20–21 are DONE** (see claim-review.md: 2 factual errors + 1 citation gap found). This
expansion covers the rest of the essay.

**Original priority (kept for reference): the institutional/political claims in §20–23.** These are the riskiest because they are political/historical assertions drawn
from web research rather than the ANES data spine:
- §20 — the Chuck Schumer July-2016 "blue-collar / two moderate Republicans" quote (wording,
  date, venue) and "Clinton then lost all three states."
- §21 — the 2008 superdelegate lead (169–63, "a year before a vote"); the 2016 DNC leaked
  emails + *Wilding v. DNC Services Corp.* (charter neutrality "unenforceable," "back room /
  cigars," dismissed as a private corporation); the 2024 calendar reorder (Biden's request,
  Feb 2023, SC first); South Carolina "not the most diverse state nor competitive," last
  Democratic in a presidential general in 1976; the 2020 consolidation (Biden 4th/5th/2nd
  then 1st in SC; Buttigieg led the moderate lane; Buttigieg/Klobuchar dropped + endorsed
  before Super Tuesday; Obama "hidden hand" reported but denied; Warren stayed in).
- §21 — the Innovator's Dilemma framing (is Christensen's mechanism characterized correctly?).

Then, if time permits, sweep the §20 swing-voter stats and any other data claims.

For each claim: (1) state it + location; (2) verify against ≥2 independent credible sources;
(3) verdict — SOLID / SHAKY (overstated, needs hedge) / WRONG (contradicted) / UNVERIFIABLE;
(4) citation check — does it carry its own granular footnote with a real source?; (5) for
SHAKY/WRONG, the precise problem + a recommended fix.

## What I MAY do autonomously
- Web research to verify or refute claims.
- Write findings to `.claude/overnight/claim-review.md`; log actionable problems to BLOCKERS.md.

## What I must NOT do autonomously
- Edit ANY prose, claim, number, or footnote in `web/index.html`, or any data/script. The
  user edits `index.html` live in Cursor; an autonomous write risks clobbering their work
  (already happened once this session). LOG everything for review instead.
- No `git push`, no branch operations.

## Done definition
Every priority §20–23 claim has a verdict + citation-check in `claim-review.md`; each
SHAKY/WRONG item is in BLOCKERS.md with a recommended fix and the sources checked. Commit
the report after each cluster.
