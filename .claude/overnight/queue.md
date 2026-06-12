# Queue for: Data-rigor forensic audit of every figure's ANES variables (5 gates)

- [x] Baseline + un-stale the audit tooling. Run `python scripts/extract_codebook_entries.py` (writes data/derived/codebook_entries.txt) and `python scripts/generate_variable_audit.py` (rewrites reqts/variable-audit.md); both exit 0. Fix the stale "No codebook PDFs are checked in" header + the ❓-fallback message in generate_variable_audit.py to reflect that anes_2016/2020/2024_codebook.txt ARE on disk. Accept: both scripts exit 0; codebook_entries.txt exists and is non-empty; grep shows the stale "no codebook PDF" string is gone.

- [x] Turnout-variable forensic pass (highest historical risk: V242065/V242066/V201101/V241035/V162031x). For every turnout variable used in scripts/, cross-check Label + Value Labels + Universe against its codebook_entries.txt slice; upgrade KNOWN_ANNOTATIONS to a codebook-cited ✅/🔥/⚠️. Accept: no turnout variable used in any build script renders as ❓ in variable-audit.md; the V242065/V242066/V201101 🔥 annotations remain and cite the codebook Universe; generate_variable_audit.py exits 0.

- [ ] Vote-choice + primary-vote forensic pass (V161021a, V162031x, V201231x, V241049/V241106x, V242067, per-cycle pres-vote vars). Cross-check each against codebook; confirm Gate-3 POST weight on vote-choice scripts. Accept: each such variable used has a codebook-cited annotation (none ❓); any PRE-weight-on-vote-choice is fixed in the script or logged to BLOCKERS.

- [ ] Party-ID + ideology forensic pass (V161158x/V201231x/V241158x 7-pt party; lib-con self + candidate placements). Verify the 1..7 → dem/ind/rep mapping has no off-by-one and ideology direction is correct. Accept: party-ID mapping verified against codebook for each cycle (no code silently dropped); none ❓; audit regenerates.

- [ ] Trust-composite forensic pass (institutional-trust items per cycle + CDF trust). Verify each item's code direction matches the (5−x)/4-style transforms in the build scripts. Accept: each trust item used has a codebook-cited annotation with verified direction; none ❓.

- [ ] Weight-alignment audit (Gate 3) across ALL build_*.py. Produce a script→weight→PRE/POST→is-vote-choice table in DECISIONS.md. Accept: every vote-choice/post-election build script uses a POST weight (V160102/V200010b/V240107b); any violation fixed-in-script or logged to BLOCKERS.

- [ ] Footnote-provenance spot-check (Gate 5) for load-bearing figures (voter map AA, honesty X, trust→vote V, RR weight P, VSG switcher AC, trust×turnout Z). AUDIT ONLY — do not add prose. Accept: for each, confirm the footnote names dataset+variables+filter+n+weight+method; every gap logged to DECISIONS.md with a recommended footnote for morning review.

- [ ] Final regenerate + SUMMARY. Accept: generate_variable_audit.py exits 0; grep confirms zero ❓ among the turnout/vote-choice/party-ID/trust variables actually used in build scripts; SUMMARY.md written listing what was verified, what was fixed, and any BLOCKERS.
