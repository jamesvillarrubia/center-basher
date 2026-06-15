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

## 2026-06-12 17:31 — Footnote-provenance spot-check, Gate 5 (queue item 7, audit-only)
Well-documented (dataset+variables/desc+filter+n+weight+method present): Fig V (trust→vote), Fig AC (VSG switcher), Fig Z (trust×turnout, even names V241035/V242065/V240107b). Provenance GAPS (recommend caption/footnote additions — NOT edited, prose-sacred):
- Fig X (honesty crossover): caption is narrative-only. Names neither dataset, variable codes, weight, method, nor per-cycle n. Recommend a provenance line: ANES 2016/2020/2024; honesty trait items (2016 V161162/V161167; 2020 V201211/V201215; 2024 V241203/+); trust composite (V161215/216/217 etc.); low-trust tercile within each cycle's battleground states; weighted means; n per cycle. NB: also carries the item-6 weight inconsistency.
- Fig P (RR weight): names ANES CDF + 4-item Kinder-Sanders scale + 'standardized coef net of ideology/party ID', but omits per-cycle n, the weight (VCF0009z), and the VCF variable codes. Recommend adding.
- Fig AA (voter map): visible caption names dataset/n/cohorts/method but NOT the weight (V160102) or V-codes (V161126, V161215/216/217) — those live in the JSON 'source' field, not reader-facing. Recommend surfacing weight + key V-codes. (Also the n=339-vs-data-300 item already in BLOCKERS.)

## 2026-06-12 22:14 — Phase 2 kickoff: applying audit findings autonomously
Fork: user invoked /overnight mid-way through interactive findings review (Fig Z done+approved, Fig D weight-fix applied uncommitted). How to proceed unattended on prose-touching fixes?
Options: 1. log everything, change nothing  2. apply data fixes only, log all prose  3. apply data fixes + sync figure-own caption numbers, log body/footnote prose + new provenance  4. apply everything incl body prose  5. wait/ask
Chose: 3 — user explicitly approved this exact fix-class twice (Fig Z incl caption r-value sync, Fig D weight). Caption number-syncs are factual, not voice edits, and don't trip the prose-sacred lede gate. Body/footnote number changes, new provenance prose, and any conclusion change still get logged for morning review.

## 2026-06-12 22:21 — Finding 4 sweep
turnout_hump + within_tent_bolt are genuine PRE-on-post violations; trust_by_cohort + within_cycle_multi are not (PRE measures). within_tent_bolt is live (§7) with quoted defection rates → logged not edited (desync risk). turnout_hump is not rendered → logged low-priority. No scripts modified this finding (conservative: avoid desyncing §7 prose / touching unused output).

## 2026-06-12 22:23 — Finding 5: Sanders n 339→300 (caption synced)
The §18 Fig AA caption quoted n=339 — the STALE hardcoded default in CANDIDATES_BY_YEAR[2016] (build_voter_maps_all.py:290), which computation overrides. The live figure plots the computed Sanders centroid n=300 (matches the documented post-V161021a-fix value; bug doc says 300). Synced caption 339→300 (figure's own n). Minor cleanup (NOT done, low priority): the hardcoded 2016 defaults (Clinton 1064, Sanders 339, Trump 1002) are all overridden by computed (399/300/335) and could be updated to match for clarity, but they don't affect output.

## 2026-06-15 12:05 — New run objective (prior audit objective complete)
Fork: user ran /overnight with no flavor; existing OBJECTIVE.md (data-rigor audit) is COMPLETE (queue 5/5, 0 ❓), so proceeding on it is a no-op. User had just been shown a 4-option menu for the next objective and ran /overnight without picking.
Options:
1. Drift-guard integrity harness (my explicit recommendation; safest — pure verification, never edits prose)
2. New analyses (Fig 11 counterfactual / C1 ceiling / cross-year trust) — produces findings that feed prose
3. Figure build-out (Fig 12 toggle, signals chart) — design-heavy, needs user calls
4. Short safe cleanup (turnout_hump, within_cycle_multi, bare-§N diffs)
Chose: 1 — user ran /overnight right after I recommended it and declined to pick otherwise; it is also the lowest-regret (cannot touch prose/figures/conclusions). Announced in chat with an explicit offer to switch.
