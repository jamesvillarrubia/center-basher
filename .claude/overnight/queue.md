# Queue (phase 3) for: Finish the audit — codebook-verify the remaining ❓ variables

Phases 1 (8-item audit) + 2 (apply findings) complete — see SUMMARY + git history.
Phase 3 is PURELY gate-safe: cross-check each remaining ❓ variable against its
codebook_entries.txt slice and add a codebook-cited annotation to KNOWN_ANNOTATIONS.
Touches ONLY scripts/generate_variable_audit.py + reqts/variable-audit.md. No prose,
no figures, no data/build scripts. The prose-cascading weight fixes stay in BLOCKERS
for the user. Workflow per variable: read its slice in data/derived/codebook_entries.txt,
confirm Label + Value Labels + Universe, annotate ✅/⚠️ (or 🔥 if a real bug surfaces),
then `python scripts/generate_variable_audit.py`.

- [x] §2 issue-position scale: V161178 V161181 V161184 V161189 V161193 V161196 V161198 V161204 V161208 V161213 (the 10 7-pt issue items behind the "centrist within ±0.5" definition in build_center_breakdown.py). Verify each is a 1–7 issue scale with -9/-8 missing; annotate. Accept: all 10 ✅ in variable-audit.md; none ❓; generate exits 0.

- [x] Feeling thermometers: V161086 V161087 V162078 V162079 V201151 V201152 V241156 V241157. Confirm each is a 0–100 candidate/group thermometer (missing 998/999/-9 etc.); verify the build usage; annotate. Accept: each ✅/⚠️ with the 0–100 range + missing codes noted; none ❓.

- [ ] Efficacy + remaining POST items: V162215 V162216 V202143 V202144 V242125 V242126. Confirm scale + direction (used in turnout_hump / efficacy); annotate. Accept: each annotated with scale+direction; none ❓.

- [ ] Demographics / IDs / weight-fallbacks: V160001 (respondent id) V161004 (campaign interest) V161267 V201507x V241458x V240107 (bare 2024 weight fallback) V240108a. Annotate (IDs/weights get a short note; demographics get Label+Values). Accept: none ❓.

- [ ] Final — regenerate; confirm the ❓ count is 0 (or list any genuinely un-verifiable, e.g. comment-only/phantom, with a ⚠️ reason); append phase-3 result to SUMMARY. Accept: generate_variable_audit.py exits 0; `grep -c '❓' reqts/variable-audit.md` reported; SUMMARY updated.
