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
