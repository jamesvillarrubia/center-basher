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
