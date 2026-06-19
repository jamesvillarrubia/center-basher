# Blockers

Irreversible / externally-visible actions that were SKIPPED and need your call. Nothing here was executed.

## 2026-06-12 17:23 — Prose-vs-data: Sanders primary centroid n
Wanted: reconcile §18 (evidence) figcaption "Sanders' primary voter centroid (n = 339)" with live web/data/voter_map_2016.json Sanders candidate n=300.
Recommended: confirm whether 339 vs 300 is two different populations (all Sanders primary voters vs those plotted with valid coords) or a stale number; if stale, update the figcaption number to match the rebuilt data. PROSE change — left for review, not edited autonomously.
Why blocked: editing figcaption prose (prose-sacred gate).

## 2026-06-12 17:30 — Gate-3 weight violations (post-election analyses weighted PRE)
Wanted: bring post-election (vote-choice / turnout) figures onto POST weights per data-rigor-process.md Gate 3. NOT executed — each changes figure numbers that appear in figcaption/body prose (prose-sacred gate).
Recommended (do script + prose together):
  1. Fig Z build_swing_trust_turnout.py:83  V200010a → V200010b (2020); regenerate swing_trust_turnout.json; update §17 Fig Z figcaption r-values.
  2. Fig D build_partisan_loyalty.py:14      V160101 → V160102; regenerate; check §3 loyalty/defector percentages.
  3. Fig X build_candidate_honesty_by_trust.py  make weights consistent across 2016/2020/2024 (all PRE or all POST per sample definition); regenerate; update §16 Fig X figcaption r-values (-0.81 / -0.33 / +0.86 may shift).
  4. Sweep build_turnout_hump.py, build_within_tent_bolt.py, build_trust_by_cohort.py, build_within_cycle_multi.py for the same PRE-on-post pattern.
Why blocked: all four cascade to numbers printed in prose; the qualitative conclusions (sign-flip, loyalty, crossover) are expected to survive, but exact values change.

## 2026-06-12 22:16 — §2/§3 defector-stat scripts use PRE weight on a vote-conditioned analysis
Wanted: bring the §2/§3 "Swing = defector" scripts onto POST weight (Gate 3). NOT executed because their numbers are quoted in §2/§3 FOOTNOTE prose — fixing the scripts without editing those footnotes would desync data from prose.
Cluster (all weight PRE V160101 but condition on V162034a vote; metadata even mislabels V160101 as "post-election"):
  - build_center_overlap_matrix.py  → feeds §2 funnel footnote "Swing ... 4% of electorate, n=178" (web/index.html L137)
  - build_center_breakdown.py        → §2 breakdown footnote
  - build_swing_spectrum.py          → §3 fn-3-3 defector lib-con means (V160101)
Impact if switched to V160102 (POST): the all-defector rate ~4.26% → ~4.99% (footnote "4%" → "5%"); n=178 unweighted unchanged; qualitative "swing voters are rare" point unchanged. Loyalty ~unchanged.
Recommended (do scripts + footnotes together): switch each to V160102, regenerate, and update the §2 "4% of electorate" → "5%" (and re-check fn-3-3). Already done for build_partisan_loyalty.py (not quoted in prose, so committed safely).
Why blocked: cascades to numbered-footnote prose.

## 2026-06-12 22:21 — More PRE-on-post-election scripts (finding 4)
- build_within_tent_bolt.py (LIVE: §7 Figure K, fig-7-loyalty.js, web/data/within_tent_bolt.json): weights PRE V160101 (metadata mislabels it "post-election") on a VOTER-restricted, vote-conditioned analysis → Gate 3 says POST V160102. Switching changes the §7 quoted numbers ("System Critics defected at 53% and System Believers at just 10%", web/index.html ~L849). NOT executed (would desync §7 body prose). Recommended: switch to V160102, regenerate, copy data/clean→web/data, update the 53%/10% in §7 to match.
- build_turnout_hump.py (NOT live — chartTurnoutHump.js is not referenced in index.html): same PRE-on-turnout pattern (V160101 on V162031x post turnout). Low priority since nothing renders it; fix to V160102 if the turnout-hump figure is ever reactivated.
Not violations (documented, no action): build_trust_by_cohort.py (trust cohorts, no vote/turnout condition → PRE correct); build_within_cycle_multi.py (position-movement, no vote condition; 2016 uses POST while 2020/2024 use PRE — minor inconsistency, not rendered).

## 2026-06-12 22:23 — Gate-5 provenance: ready-to-paste recommendations (finding 6, audit-only)
Three load-bearing figures have thin reader-facing provenance. Suggested caption/footnote text (NOT inserted — your call on wording/placement):

**Fig X — honesty crossover (§16).** Currently narrative-only. Add:
"Source: ANES Cumulative Data File (1980–2008) + ANES standalone studies (2012/2016/2020/2024). 'Is honest' candidate-trait items per cycle — 2016 V161162 (Dem)/V161167 (Rep); 2020 V201211/V201215; 2024 V241203/V241208; 2012 ctrait_dpchonst/ctrait_rpchonst; CDF equivalents pre-2012 — rescaled 0–4 (higher = more honest). Trust composite: 2016 V161215/216/217; 2020 V201233/234/235; 2024 V241229/231/232; CDF VCF0604/0605/0609. Sample: the low-trust tercile within each cycle's battleground states. PRE weights (V160101/V200010a/V240107a; CDF VCF0009z). Weighted means per candidate per cycle."

**Fig P — RR electoral weight (§11).** Add n + weight + variable codes:
"Source: ANES Cumulative Data File, 1988–2024. Racial-resentment = 4-item Kinder-Sanders scale (VCF9039–VCF9042), each auto-oriented so high = more resentment. Per cycle: standardized weighted logistic of P(Republican two-party vote, VCF0704) on RR, net of ideology (VCF0803) and party ID (VCF0301); two-party voters only; weight VCF0009z. Plot shows the net-of-controls coefficient; n per cycle in the data file."

**Fig AA — voter map (§18).** The live JSON 'source' field is now terse ("ANES 2016 Time Series Study, weighted.") — restore the detailed provenance to the caption AND the JSON source:
"ANES 2016 Time Series, weighted V160102 (POST). x = ideology V161126 (1–7 → −1..+1); y = trust composite V161215/V161216/V161217 (0–1, higher = more trust). Party V161158x; general vote V162034a; primary V161021a. Cohorts: swing = undecided V161031; new-2016 = voted 2016 (V162031x) not 2012 (V161005); drop-off = voted 2012 not 2016."

## 2026-06-13 14:02 — §2 policy composite mixes 1-7 and 3-category scales (HIGH — touches the thesis)
Wanted: fix the §2 "moderate middle" funnel composite. build_center_breakdown.py builds a policy_mean over TEN items with clean_var(.,1,7) and classifies centrist by distance from 4. But only FIVE are 1-7 self-placement scales (V161178/181/184/189/198). The other FIVE are 3-category direction items (codes 1-3): V161193 (birthright), V161196 (wall), V161204 (affirm. action), V161208 (crime spending: 1=incr/2=same/3=decr), V161213 (ISIS troops). Their true center is 2, not 4. Averaging them in and centering at 4 biases the composite LOW, so genuine moderates (≈4 on 7-pt items, ≈2 on 3-cat items → mean ≈3) fall outside ±0.75 of 4 and are misclassified as non-centrist.
Effect: the §2 funnel (40 self-ID moderate → ~12 MidMiddlers → 1 True Middler) UNDERCOUNTS centrists, making the "1 in 100 true centrist" claim artificially strong. A hostile reviewer would flag this.
Recommended (do NOT do autonomously — changes the §2 thesis numbers + Figure C + §2 prose): either (a) use ANES's combined 7-pt summary vars for the branching items, (b) rescale each 1-3 item to the 1-7 range (or z-score all items) before averaging, or (c) drop the 5 non-7-pt items and recompute on the 5 clean scales. Then update the §2 funnel numbers (26/40/28/12/1) + Figure C + the §2 [3] footnote. EXPECT the centrist counts to rise.
Why blocked: changes a core thesis number in §2 ("The center is a lie") — needs your eyes.

## 2026-06-13 15:48 — Figure B (§1) has the SAME scale-mixing bug just fixed in §2
Wanted: apply the §2 centrist-composite fix to its §1 sibling. build_center_overlap_matrix.py (feeds Figure B "Stack the swing-voter filters") uses the identical 10-item composite (lines 24-25: V161178/181/184/189/193/196/198/204/208/213), including the five 3-category favor/oppose items (V161193/196/204/208/213) treated as 1-7. So Figure B's "policy centrists 18.2%" and the overlap rows are understated, exactly like the old §2 numbers were.
Recommended (same fix as §2, NOT done because it changes Figure B + §1 prose): switch issue_vars to the six 7-pt self-placement scales (V161178/181/184/189/198/201); regenerate center_overlap_matrix.json; copy to web/data; update the §1 prose numbers (currently 27.1% moderates / 18.2% policy-centrists / 3.9% swing / ~0.3% all-three). Expect the policy-centrist share to rise (like MidMiddler 12->23 did). The triple-intersection ~0.3% "almost no one clears all three" headline likely survives.
Why blocked: changes Figure B's displayed numbers + the §1 body prose around it.

## 2026-06-13 15:48 — Visual QA sweep results (item 2 of the 1-3 run)
Programmatic: all 30 figures render, no SVG overflow, ZERO console errors/warnings. Two real clipping bugs found + FIXED: Fig O (long y-label 'Negative economic outlook (2016)' clipped -> widened margin) and Fig S (left panel drawn at x0=0, y-axis labels clipped -> gave panels a left margin). Spot-verified clean: Fig B, C, I, T, U, AA, AB, AC, AD, Z.

## 2026-06-13 15:53 — Style pass (item 3): bare §N body links to reword (voice-level)
Em-dashes: 0. Figure labels: all 30 defined, no refs to undefined labels. Remaining: ~15 visible bare "§N" links in body prose. Most are fine parenthetical pointers (topic named + "(§N)"). The more standalone ones worth rewording to name the topic per your no-bare-marker rule:
  - "we get to that in §12"  -> name what 'that' is
  - "which is why §13 treats stakes as the dominant turnout lever" -> "the turnout section" or similar
  - "Now to the other half of the two-jobs split. §6"
  - "the mechanism named in §8 and §9"
Each is a voice choice (left for you). The clearly-parenthetical ones (e.g. "coherent middle bloc (§3)", "candidate-fit model from §16") read fine as-is.

## 2026-06-15 12:25 — Integrity harness: 3 unreferenced JS modules (dead code / staged WIP)
Wanted: resolve three module files that are imported/referenced NOWHERE (not in main.js, not by another module, not in index.html), surfaced by check_integrity.py check 4:
  - web/js-v2/fig-17c-campaign-ceiling.js  (likely a draft for the pending "C1 ceiling figure", task #4)
  - web/js-v2/fig-19a-disaffected.js       (likely superseded by fig-18* after a renumber)
  - web/js-v2/fig-19b-moveable-ground.js   (likely superseded by fig-18*)
Recommended: confirm each is dead, then either delete it or wire it in. fig-17c is probably WIP to KEEP (it maps to an open task). The two fig-19* look like post-renumber leftovers safe to delete.
Why blocked: deleting user content / source files is an ask-first action (CLAUDE.md §9). Not executed.

## 2026-06-15 12:25 — Integrity harness: Fig S (care gap) has no reproducible pipeline
Wanted: make the §13 care-gap figure (Figure S, web/js-v2/fig-13a-care-gap.js) reproducible. Its numbers (70.5 / 35.9 / 52.2 / 25.6, gaps 34.6 / 26.6) are HARDCODED JS constants, and its footnote n's (n=3,117 and n=214/301) trace to NO committed data/clean file — so check 2 (reproducibility) cannot verify them. build_turnout_hump.py contains related values but is not rendered.
Recommended: add a build_care_gap.py that computes the four shares + n's onto data/clean/care_gap.json, point fig-13a at it (data-driven, like the other live figures), and confirm the rebuilt numbers match the current hardcoded ones (EXPECT them to match; if they don't, that is a real stale-number finding to surface). This would also let check 3 trace the n's.
Why blocked: adding a build script that recomputes a figure's displayed numbers could change a published number; needs your eyes before the figure is rewired. Not executed.

## 2026-06-19 — §20 FACTUAL ERROR: "Clinton lost all three of those states" (she won Illinois)
Wanted: fix the §20 sentence after the Schumer quote. The quote names FOUR states (PA, OH, IL, WI). Clinton lost PA/OH/WI but WON Illinois (+17pts). "Clinton then lost all three of those states" is wrong AND contradicts its own footnote [54] ("Pennsylvania, Ohio, and Wisconsin").
Recommended: body → "Clinton then lost Pennsylvania, Ohio, and Wisconsin, carrying only Illinois." (accurate; matches the footnote).
Why blocked: prose/claim edit to index.html — user edits it live in Cursor; logging instead of auto-editing (concurrent-edit clobber risk).
Sources: FEC 2016 official results; Ballotpedia; Wikipedia 2016 IL/PA/OH/WI.

## 2026-06-19 — §21 TIMING ERROR: "a year before a vote was cast" (it was ~1 month)
Wanted: fix §21 2008 sentence. The 169–63 superdelegate lead is the AP's December 2007 count; Iowa caucus was Jan 3, 2008 — about one month later, not "a year before a vote was cast." Footnote correctly says "December 2007," so body contradicts footnote.
Recommended: body → "before a single vote was cast" (drop "a year"); optionally tighten "roughly three-to-one" (169:63 ≈ 2.7:1) to "nearly three-to-one."
Why blocked: prose edit to index.html (user edits live in Cursor) — logging instead.
Sources: AP Dec 2007 superdelegate count; 2008 Iowa caucus Jan 3, 2008.

## 2026-06-19 — §12 CITATION ERROR: "Get Out the Vote (3rd ed., 2019)" — 2019 is the 4th edition
Wanted: fix fn-12-1 (value 34). It cites Gerber & Green, *Get Out the Vote: How to Increase Voter Turnout* as "(3rd ed., 2019, Brookings)." Verified against Brookings: 3rd ed. = **2015**, 4th ed. = **2019**, 5th ed. = 2024. So the edition/year are mismatched.
Recommended: body footnote → "(**4th ed., 2019**, Brookings)" (keeps the 2019 date, corrects the edition). Everything else in fn-12-1/fn-12-2 is accurate — the GGL 2008 "Neighbors" social-pressure mailing = +8.1pp is exact (APSR 102(1):33–48).
Why blocked: prose edit to index.html (user edits live in Cursor) — logging instead.
Sources: Brookings Institution Press catalog; GGL 2008 APSR 102(1).

## 2026-06-19 — §24 MINOR data fix: NYT/Siena free-speech poll n is wrong
Wanted: correct fn-23-1 (value 65). It cites the NYT/Siena March-2022 free-speech poll as "n=1,000 U.S. adults." The actual poll surveyed **~1,507 respondents**, fielded **Feb 9–22, 2022** (released March 2022). The headline **84%** ("serious problem that some Americans don't speak freely") is exact and unaffected.
Recommended: change "n=1,000" → "**n≈1,507**" (and, if precise, note fieldwork was February, released March). Low priority — does not touch the argument.
Why blocked: prose edit to index.html (user edits live in Cursor) — logging instead.
Sources: Siena College Research Institute release (Mar 21 2022); NYT "America Has a Free Speech Problem" (Mar 2022).

## 2026-06-19 — §20 UNCITED+UNVERIFIED stat: "national mean was 0.24 in 2016"
Wanted: source and verify the §20 claim "the national mean was 0.24 in 2016" (trust composite). Footnote [51] lists by-ideology band means but never states the national mean; 0.24 happens to be the strong-left band mean, so the body may be conflating. Needs (a) a re-derivation from ANES 2016 (weighted mean of V161215/216/217, 0–1) and (b) the number added to fn [51].
Recommended: re-run the national mean; if ~0.24 confirmed, add "national mean ≈ 0.24" to fn [51]; if different, correct the body. (Data re-derivation, not a prose-only fix — needs the user or a data pass.)
Why blocked: requires editing index.html and/or running a data script; user edits index.html live in Cursor. Logging instead.
