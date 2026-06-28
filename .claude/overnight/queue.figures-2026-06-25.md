# Queue for: make hardcoded figures reproducible + rigor-clean (2026-06-25)

- [x] #5 turnout_hump weight PRE→POST. Accept: `scripts/build_turnout_hump.py` loads `V160102` (not V160101); manifest weight label says POST; `python scripts/build_turnout_hump.py` exits 0; committed.
- [x] #4 bare §N scan. Accept: every standalone `§N` in web/index.html body identified vs proper `<a class="secref">` links; findings written to OPEN-QUESTIONS.md (or "none found"); no edit to index.html.
- [x] C1 derive 22pp from ANES 2016. Accept: a script/derivation computes the trust-band vote-share swing (the 22pp bar) from ANES 2016, matching fig-16b-trust-bands data; exact value recorded (note if ≠22.0); committed.
- [x] C1 source 0.4pp + recolor + render. Accept: Kalla & Broockman 2018 exact estimate + citation captured; `fig-17c-campaign-ceiling.js` campaign bar recolored non-gray and numbers tied to the sourced values; renders in web/preview-17c.html (screenshot); committed.
- [x] #3 build_care_gap.py. Accept: `scripts/build_care_gap.py` exists and runs (exit 0); reproduces or refutes 70.5/35.9/52.2/25.6 + gaps 34.6/26.6 + n 3117/(214/301); any mismatch logged as a FINDING in OPEN-QUESTIONS.md; committed.
- [x] Prose draft for "election is in the primary" (contingent on C1 holding). Accept: 2-3 colorful options appended to OPEN-QUESTIONS.md, flagged contingent on C1 data; index.html NOT edited.
