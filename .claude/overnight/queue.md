# Queue (phase 2) for: Apply the data-rigor audit findings (Gate-3 weight fixes + provenance)

Phase 1 (the 8-item variable audit) is complete — see git history + SUMMARY.
This phase APPLIES the findings the user began reviewing interactively.

AUTONOMOUS POSTURE (user approved this fix-class via Fig Z + Fig D before sleeping):
- APPLY: data/script weight fixes; regenerate; copy data/clean → web/data; and
  sync a FIGURE'S OWN computed number in its own caption to match corrected data
  (e.g. an r-value, a figure n). That is a factual sync, not a voice edit.
- LOG to BLOCKERS, do NOT edit: any number change that lands in BODY prose or a
  numbered FOOTNOTE; any new provenance/caption prose to author; anything that
  would change a stated CONCLUSION; any restructure. Record old→new for review.

- [x] Finding 2 — Fig D / §3 partisan loyalty. Commit the already-applied weight fix (build_partisan_loyalty.py V160101→V160102). Find where its numbers (loyalty ~87%, all-defectors 4.26→4.99%) appear: if in a figure caption, sync; if in §3 body/footnote prose, log old→new to BLOCKERS. Accept: script committed with V160102 + corrected metadata label; each changed number either synced (caption) or logged (prose); no live figure loads this data so no web/data copy needed.

- [x] Finding 3 — Fig X honesty cross-cycle weight. Determine the sample (voters-only ⇒ POST, or all-respondents perception ⇒ PRE) from build_candidate_honesty_by_trust.py; make the weight basis CONSISTENT across 2016/2020/2024 with a one-line documented rationale; regenerate; copy to web/data; sync the §16 Fig X caption r-values; commit. Accept: one consistent weight basis across cycles; data regenerated + web/data updated; caption r-values match; build runs exit 0.

- [x] Finding 4 — sweep turnout_hump + within_tent_bolt (+ check trust_by_cohort, within_cycle_multi). For each: if the analysis conditions on vote/turnout (post-election), switch to POST weight; regenerate; sync any figure-caption numbers; log body/footnote number changes to BLOCKERS. Accept: each script either uses POST (vote/turnout) or is documented as correctly PRE; changes synced or logged.

- [x] Finding 5 — Fig AA Sanders n. Determine whether the §18 caption "n = 339" or the live data n=300 is correct (check build_voter_maps_all.py: is 339 a different population — all Sanders primary voters — vs 300 plotted?). If the caption number is simply stale, sync it (figure's own n); if the data is wrong, fix the build. Accept: caption n and live voter_map_2016.json agree, with the basis noted in DECISIONS.

- [x] Finding 6 — Gate-5 provenance (Fig X, P, AA). AUDIT ONLY: write concrete recommended provenance lines (dataset+variables+filter+n+weight+method) for each into BLOCKERS.md for morning review. Do NOT insert caption prose. Accept: BLOCKERS has ready-to-paste provenance text for all three figures.

- [x] Final — regenerate variable audit if any script changed; write phase-2 SUMMARY; verify build_all-affected scripts still run. Accept: generate_variable_audit.py exits 0; SUMMARY.md updated with phase-2 outcomes + remaining BLOCKERS.
