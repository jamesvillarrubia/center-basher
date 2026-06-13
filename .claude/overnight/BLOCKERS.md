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
