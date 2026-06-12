# Decisions log

Autonomous decisions made during the overnight run. Each entry: the fork, ~5 options, the choice, and why.

## 2026-06-12 17:15 — Flavor + objective for the run
Fork: which overnight flavor/objective to run on a prose-sacred essay repo
Options:
1. objective: data-rigor figure audit  2. objective: ref/footnote integrity  3. objective: figure visual QA  4. objective: citation pass  5. dev: PR-shepherding
Chose: 1 — user picked "Data-rigor figure audit"; it fits the project's mandatory data-rigor process, is gate-safe (touches scripts/ + variable-audit.md, not prose), and is high-value since codebook .txt files are now on disk but the audit header is stale.

## 2026-06-12 17:15 — Audit tooling state (informs item 1)
Fork: is the audit already codebook-grounded or does it need wiring?
Finding: extract_codebook_entries.py READS the on-disk codebook .txt (good); generate_variable_audit.py does NOT — it uses a manual KNOWN_ANNOTATIONS dict and a stale "no codebook PDFs are checked in / download the PDF" fallback. Decision: item 1 un-stales the header + fallback message; subsequent items upgrade ❓ vars to codebook-cited annotations using codebook_entries.txt. No prose touched.

## 2026-06-12 17:19 — Turnout-variable forensic pass (queue item 2)
Checked the turnout family against on-disk codebooks. Status: V162031x 🔥, V242065 ✅(caveat), V242066 🔥, V241035 ✅, V201101/V201102 🔥, V202109x ✅ were already codebook-cited with Universe. Only V161005 was ❓. Verified V161005 against anes_2016_codebook.txt: label "PRE: Did R vote for President in 2012" (CAMPINT_PRESVTLAST), 1=voted/2=did not/-9/-8 missing, all 4270 coded (universe=all PRE respondents). Script usage V161005==1 (voted 2012) is correct → upgraded to ✅. Note: CDF turnout vars (VCF0702 validated / VCF0703 self-report) are NOT in the ANES audit table (different dataset); they are documented inline in the CDF build scripts.

## 2026-06-12 17:23 — Vote-choice + primary forensic pass (queue item 3)
Live vote-choice vars all clean: V161021a ✅, V162034a ✅, V202073 ✅, V242067 🔥, V241106x ✅, V241049 🔥 (retired). Voter-map scripts use POST weights (V160102/V200010b/V240107b) — Gate 3 OK for those.
build_voter_map_2016.py: feared a landmine (uses bugged V161022/V161023, writes same path as build_voter_maps_all.py) but it is ALREADY execution-guarded (sys.exit at line 31) + deprecated docstring, so it cannot run/overwrite. Left as-is. Annotated the comment-only refs: V161021 ✅ (primary-participation gate, not candidate choice), V161022x ⚠️ (phantom — no codebook entry; stale comment only).
Carried to item 6 (weights): build_swing_trust_turnout.py 2020 row uses PRE V200010a (line 83) while 2016/2024 rows use POST — turnout is post-election, so 2020 likely should be V200010b. build_candidate_honesty_by_trust.py uses POST V160102 for 2016 but PRE V200010a/V240107a for 2020/2024 — needs Gate-3 ruling (trait+trust items can be PRE, but cross-cycle consistency is off).

## 2026-06-12 17:26 — Party-ID + ideology forensic pass (queue item 4)
7-pt party mapping verified IDENTICAL across all three cycles (build_voter_maps_all.py lines 50/121/181): 1,2,3→dem / 5,6,7→rep / 4→ind / else "". No off-by-one; V161158x distribution shows all codes 1-7 present (890/559/490/579/500/508/721), no silent drop (Gate 2 OK). Ideology self-placements V161126/V201200/V241177 ✅; candidate placements V161128/V161129/V201202/V241179/V241180 ✅. Only ❓ was V241228 — confirmed comment-only (PRE 'PARTY IDENTITY IMPORTANCE', split-scale, replaced by V241227x); annotated ✅ not-in-live-use. CDF party/ideology (VCF0301/VCF0803) not in the ANES audit table; documented inline in CDF scripts.

## 2026-06-12 17:27 — Trust-composite forensic pass (queue item 5)
ANES trust items all ✅ with IDENTICAL, correct direction transforms across build_swing_trust_turnout.py / build_candidate_honesty_by_trust.py / build_voter_maps_all.py: do_right (V161215/V201233/V241229) = (5-x)/4; run_all (V161216/V201234/V241231) = (x-1); waste (V161217/V201235/V241232) = (x-1)/2 → composite 0..1, high=more trust. Direction matches codebook (1=always trust..5=never for do_right; benefit-all=more trust; not-much-waste=more trust). CDF trust (VCF0604/0605/0609) feeds the cross-cycle figures (V/P/K) and is documented inline in build_trust_vote_by_cycle.py with correct directions: VCF0604 REVERSED (1 always..5 never), VCF0605/0609 not reversed, with a documented coverage caveat (VCF0604 absent in the 2016-2024 CDF release → index runs on VCF0605/0609 those years). CDF codebook is PDF-only on disk (not grep-able .txt) — direction relies on inline docs + the user's prior trust→vote sign-flip sense-check. No code changes needed; trust family clean.

## 2026-06-12 17:30 — Weight-alignment audit, Gate 3 (queue item 6)
Full script→weight→type table. CORRECT (PRE weight on PRE measures): center_breakdown, center_overlap_matrix, swing_spectrum(?), warmth_fear_spread (ideology/trust/thermometers, all PRE). CORRECT (POST on vote-choice): build_voter_maps_all.py (V160102/V200010b/V240107b ✓). CDF scripts use VCF0009z (the CDF's single weight; no PRE/POST split) — OK.
Gate-3 VIOLATIONS found (post-election analysis weighted by PRE) — NOT fixed because each cascades to figure r-values/percentages printed in prose; logged to BLOCKERS:
- HIGH  Fig Z build_swing_trust_turnout.py line 83: 2020 uses PRE V200010a while 2016/2024 use POST; turnout (V202109x) is post-election → should be V200010b. Lone outlier = likely a→b typo.
- HIGH  Fig D build_partisan_loyalty.py line 14: PRE V160101, but analysis conditions on voted + vote choice (92/92 loyalty, defectors) → should be POST V160102.
- MED-HI Fig X build_candidate_honesty_by_trust.py: 2016 POST V160102 vs 2020 PRE V200010a vs 2024 PRE V240107a — cross-cycle inconsistent; pick one basis (PRE if perception-of-all-respondents, POST if voters-only) and recompute.
- MED   build_turnout_hump.py (PRE V160101 on self-report turnout) and build_within_tent_bolt.py (PRE V160101 on vote bolt) — same PRE-on-post pattern.
- NEEDS-CHECK build_trust_by_cohort.py, build_within_cycle_multi.py (mixed PRE/POST across cycles).
Root pattern: the 2020/2024 PRE→POST fix that was applied to the voter map was NOT propagated to these older single-cycle scripts.
