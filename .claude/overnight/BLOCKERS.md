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
