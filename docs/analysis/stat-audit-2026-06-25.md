# Statistical Audit — "The Center Is a Lie"
**Date:** 2026-06-25  
**Auditor:** Hostile-expert subagent (read-only pass)  
**Scope:** `web/index.html` §0–§25 + coda; all material body statistical claims  
**Method:** Section-by-section classification — OK / MISTAKE / OVERCLAIM  
**Prior baseline:** `.claude/overnight/claim-review.md` (2026-06-19 audit)  
**Hard rules respected:** No edits to web/ files; no git operations; one new file only.

---

## Section A — Still-Open Items from Prior Audit (claim-review.md)

These were flagged before 2026-06-25 and remain unresolved. Do not re-derive; act on the
numbered choices in OPEN-QUESTIONS.md.

### A1 · F2 · §7 — "90% → 47%" trust split has no reproducible derivation (BLOCKER)

**Location:** §7 body + Figure K figcaption  
**Quote:** "less trust meant a much lower chance of voting Clinton (90% → 47%)"  
**Status:** OPEN-QUESTIONS.md F2. No coalition definition in ANES 2016 reproduces a 47%
low-trust endpoint. Full electorate gives 73→33; non-Republicans 90.5→67.6; Dems 94→81.
Source unknown — possibly a single-item trust split, a different subgroup, or an error.  
**Action required:** Source/verify before publication, or replace with the ~23pp non-Republican
figure (C1) that is now data-backed and reproducible.

### A2 · F1 · §16 Figure B — understates 2016/2020/2024 trust effects (VCF0604 absent)

**Location:** §16, Figure B (rendered)  
**Status:** OPEN-QUESTIONS.md F1. VCF0604 is entirely absent in 2016/2020/2024, so Figure B's
trust composite collapses to two coarse items for the three most recent cycles. Figure B reads
11.3pp swing in 2016; the richer ANES timeseries items give ~23pp for the same year.
**Figure B likely understates the main effect the essay argues for.**  
**Action required:** Re-derive recent cycles from richer timeseries trust items, or add a
prominent caveat that recent-cycle bands use a degraded 2-item composite.

### A3 · #3 · §13 Figure S (care gap) — bar values unverified

**Location:** §13 body + Figure S  
**Status:** OPEN-QUESTIONS.md #3. Hardcoded values (70.5 / 35.9 / 52.2 / 25.6) do NOT
reproduce from ANES 2016 validated turnout (80.8 / 50.2 / 68.2 / 44.3). Values are 10–19pp
*lower* than ANES validated — and lower than ANES self-report — which is unusual. Source is
unknown (possibly CES/CCES, a different year, or a lost calculation). The gradient survives;
the specific bar values are unverified.  
**Action required:** Re-source (confirm where 70.5/35.9 came from and cite it) or re-base on
ANES 2016 validated.

### A4 · C1 · Fig 17c — "22pp" is a ceiling, not a candidate-A-vs-B delta

**Location:** C1 figure (preview-17c.html; not yet wired into index.html)  
**Status:** OPEN-QUESTIONS.md C1 BRIDGE. The 22pp is a positional association across voters
sorted by trust, not a counterfactual result from swapping nominees. Caption language drafted
in OPEN-QUESTIONS to prevent the misread.  
**Action required:** Wire caption note before the figure lands in index.html.

---

## Section B — New MISTAKES (body/footnote discrepancies; ordered by severity)

### B1 · §22 — KFF tracking start year: body says 2016, footnote says 2017 ⚠ MODERATE

**Location:** §22 body + fn-22-2  
**Body quote:** "The Kaiser Family Foundation began tracking it in 2016 specifically because
Sanders made it a national issue"  
**Footnote fn-22-2:** "KFF began including M4A wording in 2017 specifically because Sanders
made it a national issue in 2016"  
**Problem:** One-year discrepancy. The causal framing (Sanders made it an issue in 2016) is
shared by both, but the body says KFF started tracking *in* 2016 while the footnote says the
tracking began in *2017* in response to 2016 events. A reader who checks the KFF archive will
catch this. The footnote version is almost certainly correct (tracking lags the event).  
**Fix:** Change body to: "The Kaiser Family Foundation began including Medicare for All polling
in 2017, specifically because Sanders had made it a national issue the previous year."

---

### B2 · §3 — Figcaption says 35%, fn-3-3 says 36% for defectors in middle band ⚠ MINOR

**Location:** §3 figcaption for the defection funnel figure + fn-3-3  
**Figcaption:** "only 35% of all defectors sit in the middle band"  
**fn-3-3:** "Only 36% of all defectors self-place at the exact center (position 4)"  
**Problem:** 1pp discrepancy between the two placements of what appears to be the same stat.
Note: the two definitions may differ (figcaption = "middle band" which could span positions 3–5;
fn-3-3 = "exact center, position 4 only"), but if so the distinction is not stated in the text.
Either the figcaption is wrong, or the two figures measure slightly different things and should
be labeled as such.  
**Fix option A (if same definition):** Reconcile to one number — likely 36% per the footnote
(which gives the more precise definition).  
**Fix option B (if different definitions):** Add a parenthetical to the figcaption: "35% in the
broad middle band (positions 3–5); 36% at the exact center (position 4)" to prevent reader
confusion.

---

## Section C — OVERCLAIMS (require hedges or qualifications)

### C1 · §14 — "largest turnout in history" is true only in absolute headcount ⚠ MODERATE

**Location:** §14 body  
**Quote:** "in 2020 we had the largest turnout in history"  
**Problem:** In absolute vote count (158.4M), yes. But as a share of the Voting Eligible
Population (VEP), 2020's ~66.8% trails 1876 (~82%), 1900 (~73%), and other pre-20th-century
cycles. The unqualified "largest in history" asserts the absolute-count version as if it were
the VEP-share version; a hostile reviewer will flag this immediately.  
**Fix:** "in 2020 we had the largest *raw* turnout in American history" or, better for the
argument: "in 2020 we had the largest turnout in modern history, with roughly two in three
eligible voters casting a ballot" — which is accurate and still striking.

---

### C2 · §17 — Time for Change "four out of five" overcounts 2016 as a model hit ⚠ MODERATE

**Location:** §17 body + fn-17-1  
**Quote:** "Four winners out of five, from a formula you could run in August"  
**fn-17-1:** Acknowledges the model "called a Trump popular-vote win → 51.1%, so Clinton won
the popular vote but lost the Electoral College"  
**Problem:** The model predicted Trump to win the popular vote; he lost it by ~2.1pp. The model
is being counted as correct because Trump won the Electoral College — but the model itself
produces a national popular-vote estimate, not an electoral-college prediction. Counting 2016
as a model "hit" on the basis of an outcome the model did not specifically forecast is a
sleight of hand a hostile reviewer will call out. The footnote actually *admits* the miss but
the body counts it as a success.  
**Fix:** Either drop 2016 from the denominator ("four out of five since 1980, though the model
called a Trump popular-vote win in 2016 that didn't materialize — he won the Electoral College
instead") or change the framing to "four popular-vote calls out of five, with 2016 a miss on
the popular vote." The essay's structural point — fundamentals dominate late-breaking news —
survives with an honest framing.

---

### C3 · §11 Figure P — figcaption claims "every presidential cycle 1988–2024" but 1992 and 1996 are missing ⚠ MINOR

**Location:** §11, Figure P figcaption + fn-11-4  
**Figcaption (paraphrase):** racial resentment slope coefficient "across every presidential
cycle from 1988 to 2024"  
**fn-11-4 coefficient series:** 1988 / 2000 / 2004 / 2008 / 2012 / 2016 / 2020 / 2024 —
**1992 and 1996 are not listed**  
**Problem:** The figcaption says "every cycle" but the footnote series skips two cycles (likely
due to VCF9039-9042 availability gaps). A reviewer who counts the bars or the series will
notice.  
**Fix:** Change figcaption to "selected presidential cycles, 1988–2024" and add a one-line
note in fn-11-4: "1992 and 1996 omitted; VCF racial resentment items not available in those
years."

---

## Section D — Already-Logged Findings (cross-reference only)

These items are fully documented in OPEN-QUESTIONS.md and were confirmed still-open during
this audit. No re-derivation performed; recorded here for completeness.

| ID | Location | Finding | Status |
|----|----------|---------|--------|
| F1 | §16 Fig B | VCF0604 absent 2016–2024; swing understated | OPEN |
| F2 | §7 / Fig K | 90%→47% trust split unverifiable | OPEN |
| #3 | §13 Fig S | Care-gap bar values don't reproduce from ANES validated | OPEN |
| C1 | Fig 17c | 22pp is a positional ceiling, not candidate-swap delta | OPEN (caption fix needed before wiring) |

Prior BLOCKERS from claim-review.md (2026-06-19) — all resolved in live HTML:
- Illinois fix (§20 now "lost Pennsylvania, Ohio, and Wisconsin, carrying only Illinois") ✅
- Timing fix (§21 now "before a single vote was cast") ✅
- GOTV edition (now correctly "4th ed., 2019") ✅
- NYT/Siena n (now ~1,507) ✅
- fn-3-3 n=55/92 explanation ✅
- §20 national mean 0.23 now cited with full provenance ✅

---

## Section E — Claims Spot-Checked and OK

The following material claims were verified (via prior audit, cross-reference, or in-text
citation check) and cleared during this session.

| § | Claim | Verdict | Source |
|---|-------|---------|--------|
| §0 | Pew 77%/22% trust collapse | OK | Prior audit confirmed |
| §1 | Defined claim framing (no falsifiable stat) | OK | — |
| §3 | Funnel logic / n=55 / n=92 / n=26 | OK | fn-3-3 now explains discrepancy |
| §6 | Kalla & Broockman: 49 experiments, effect≈0, APSR 112(1):148-166 | OK | Prior audit confirmed; fn citation accurate |
| §7 | 53.3%/22.4%/10.2% System Critic/Mid/Believer defection rates | OK (internal) | fn-7-2; reproducibility separate from F2 |
| §9 | Barber & Pope 2019 APSR 113(1):38-54 in-group leader experiment | OK | Citation matches |
| §11 | Mutz PNAS 115(19):E4330-E4339 | OK | Prior audit confirmed |
| §11 | RR coefficient directional trend (rising 1988–2016, slight pullback 2020–24) | OK (directionally) | fn-11-4; caveat: 1992/1996 gaps (see C3) |
| §12 | GGL social pressure +8.1pp, APSR 102(1):33-48 | OK | Prior audit confirmed |
| §12 | GOTV "4th ed., 2019" | OK | Blocker resolved |
| §13 | Bryan et al. 2011 PNAS 108(31):12653-12656, voter-identity +11pp | OK (with note) | Citation accurate; note that effect was measured in a presidential election (high-turnout ceiling); effect may be smaller in lower-turnout settings — defensible as stated |
| §13 | Care-gap gradient direction (care ≫ don't-care; low-eng amplifies) | OK | Gradient holds even if absolute values are unverified (OPEN-QUESTIONS #3) |
| §15 | 10/14 trust-flip count | OK | Prior audit found airtight |
| §16 | Exit polls 83-14 / 89% / 81-18 | OK | Prior audit confirmed |
| §20 | "lost Pennsylvania, Ohio, and Wisconsin, carrying only Illinois" | OK | Blocker resolved |
| §20 | National mean trust score now 0.23 with provenance footnote | OK | fn-20-1 verified |
| §21 | "before a single vote was cast" | OK | Blocker resolved |
| §22 | KFF M4A 56%/61% | OK | Prior audit confirmed |
| §22 | Gallup M4A support 36%/49%/~46% | OK | Prior audit confirmed |
| §22 | McCombs & Shaw POQ 36(2):176-187 | OK | Prior audit confirmed |
| §24 | NYT/Siena 84% / n≈1,507 | OK | Blocker resolved |
| §24 | Pew 53%/52% | OK | Prior audit confirmed |
| §25 | Pew money-in-politics 80%/73%/70% | OK | Prior audit confirmed |
| §25 | Gilens-Page 1,779 policy cases, Perspectives on Politics 12(3):564-581 | OK | Prior audit confirmed |

---

## Reviewer Note — Dual Honesty-Scale Notation (§8/§10) · FOR JAMES'S AWARENESS

Not a mistake in itself, but a potential reader-confusion point not logged elsewhere.

**fn-8-1** (§8): honesty rescaled to 0–4, **HIGH = trait fits better** (via `5 − raw`).  
**fn-10-2** (§10): honesty as raw 1–5 scale, **higher = LESS honest** (Trump 3.72, Clinton 3.95).

Two different conventions appear in adjacent sections without cross-referencing. A reader who
reads both footnotes sequentially will need to hold both conventions in their head and may
misread the Clinton/Trump comparison direction. The numbers are internally consistent, but the
lack of a pointer from fn-10-2 back to fn-8-1's rescaling method could trip up a careful reader.

**Suggested fix (low priority):** Add to fn-10-2: "(raw scale; higher = trait fits worse —
see fn-8-1 for the 0–4 rescaling used in Figure L)."

---

## Summary Counts

| Category | Count |
|----------|-------|
| Still-open prior items (Section A) | 4 |
| New MISTAKES (Section B) | 2 |
| New OVERCLAIMS (Section C) | 3 |
| Already-logged / cross-ref only (Section D) | 4 |
| Cleared OK (Section E) | 25+ |
| Advisory notes (no change required) | 1 |

**Priority order for next action:**
1. A1 (F2) — §7 "90%→47%" unverifiable; BLOCKER before publication
2. A2 (F1) — §16 Fig B understates the essay's main effect; BLOCKER
3. A3 (#3) — §13 Fig S bar values unverified; BLOCKER
4. B1 — §22 KFF year discrepancy (body 2016 vs footnote 2017); easy 1-word fix
5. C1–C3 — three overclaims; each a 1–2 sentence hedge in body or footnote
6. B2 — §3 figcaption/footnote 35% vs 36%; easy reconciliation
7. A4 (C1) — caption language for the ceiling figure before it lands in index.html
