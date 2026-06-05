# Data Rigor Process — Center-Basher

> **Purpose.** This document defines the auditable process for verifying that EVERY data claim, EVERY variable, and EVERY figure in this project is rigorous, codebook-grounded, and reproducible. It exists because the project has had repeated catastrophic variable bugs that almost shipped to readers — silent miscodings of party ID, turnout, and vote choice. The process below is what catches those before they ship.

> **Hard rule.** No figure ships to readers unless it has been through the gates below. If a figure exists in `web/` that hasn't been through them, treat it as suspect until it has.

---

## The five gates

Every figure passes through ALL five gates in order. A failure at any gate is a STOP — fix at that gate before continuing.

### Gate 1 — Codebook-grounded variable claims

Every ANES variable used in a build script must have:

- **A codebook entry on disk** (`data/raw/anes_codebooks/anes_<year>_codebook.txt`)
- **A line-level annotation** in `scripts/generate_variable_audit.py`'s `KNOWN_ANNOTATIONS` dict that states what the codebook says (verbatim quote when possible)
- **A row in `reqts/variable-audit.md`** showing the observed distribution side-by-side with the annotation

**Three fields of the codebook entry must be checked, not one:**

1. **Label** — what the variable IS (e.g. "PRE: Already voted in General Election", NOT a primary-vote question). This is the field most often skipped because the variable is named after the script's purpose ("dem_prim", "voted_2020") instead of named after the variable's actual meaning.
2. **Value Labels** — what each code means (1=yes, 2=no, -9=refused, etc.)
3. **Universe** — WHO was asked the question. This field is often skipped, and it has caused multiple catastrophic bugs (V242066, V201101). Examples of dangerous Universe values:
   - `"IF R REPORTED IN THE POST SURVEY THAT R VOTED"` → conditional question, not a turnout question
   - `"IF R SELECTED FOR VERSION 1A OF 1A/1B SPLICE"` → randomized half-sample; companion variable for the other half
   - `"IF TRAIT IS 1ST FOR DPC / IF TRAIT IS NOT 1ST FOR DPC"` → safe (covers everyone via the OR)
   - `"IF R IS REGISTERED"` → only registered voters

**If the Universe is anything other than "all respondents," you MUST either:**
- (a) Document the restriction in the annotation and respect it in the analysis, OR
- (b) Find the companion variable(s) and combine to recover the full sample

Status legend:
- ✅ **VERIFIED**: codebook entry on disk + Universe checked + annotation + matches observed distribution
- 🔥 **KNOWN-BUG-FIXED**: was wrong, now correct, with a permanent annotation so it can't silently regress
- ⚠️ **COVERAGE LIMIT** / **CAVEAT**: usable but with documented constraint
- ❓ **UNVERIFIED**: NOT to be used in a figure until upgraded to one of the above

**Failure mode this catches**: off-by-one variable codings (V161158x), inverted scales (V242065), wrong variable entirely (V241049 ≠ 2020 turnout), **universe-restricted variables used as full-sample variables (V242066 caught 39 of 822 actual non-voters; V201101 alone missed half the 2020 sample)**.

### Gate 2 — Observed distribution matches the codebook

For each variable, the actual `.dta` value-counts must match what the codebook says exists. If the codebook says codes 1-7 with -9/-8 as missing, and the data shows 1-7 plus a giant unlabeled 99 bucket, something is wrong.

Tools:
- `python scripts/generate_variable_audit.py` regenerates `reqts/variable-audit.md` with current distributions
- `python scripts/extract_codebook_entries.py` regenerates `data/derived/codebook_entries.txt` with codebook entries

**Failure mode this catches**: silent bucket truncation, missing-data codes treated as valid (V162031x `-2` was being silently dropped into "did not vote").

### Gate 3 — Pre vs Post sample alignment

ANES has both PRE (pre-election) and POST (post-election) weights. Vote-choice questions are post-election, so vote-choice figures must use POST weights. Trust / ideology / party-ID questions are pre-election and can use PRE weights.

Mapping for this project:
| Cycle | Pre weight | Post weight | Use for vote-choice |
|---|---|---|---|
| 2016 | V160101 | V160102 | V160102 |
| 2020 | V200010a | V200010b | V200010b |
| 2024 | V240107a | V240107b | V240107b |

**Failure mode this catches**: pre-weight applied to post-election analyses, inflating respondents who never finished the post-election survey.

### Gate 4 — Substantive sense-check

Before shipping the figure, ask:
- Does this look directionally right? E.g., conservatives should sit on the right, liberals on the left
- Does the magnitude make sense? A 50pp gap in any cohort is more likely a bug than a finding
- Does it match the user's intuition? When the user says "that doesn't look right" — TREAT IT AS A HARD SIGNAL, NOT A NIT. Almost every catastrophic bug in this project was caught because the user said "Trump should sit closer to swing voters" or "Independents shouldn't anchor on the right."

**Failure mode this catches**: bugs that pass mechanical checks but produce a chart that's substantively wrong.

### Gate 5 — Footnote provenance

Every statistical claim in body prose carries an inline `[N]` marker pointing to a Notes block at the end of that section. Notes must specify:

- Source dataset (file, year, release)
- Variables used (variable codes, e.g. V161126)
- Filter / sample definition (exactly which rows)
- n (weighted or unweighted, stated)
- Weight column (e.g. V160102)
- Model / method (weighted mean, logistic regression, etc.)

External claims (papers, polls, books) get a primary citation: authors, year, title, venue, DOI/URL.

**Failure mode this catches**: an undocumented claim that nobody can later defend or reproduce. "Anticipate a hostile expert reviewer."

---

## How to add a NEW figure (the checklist)

For every new figure (or significantly modified figure), in order:

1. **Spec the figure** — write what it should show, what it would prove, and which variables it needs
2. **For each variable**:
   - Find it in the codebook (`grep -A 30 "^V######" data/raw/anes_codebooks/anes_<year>_codebook.txt`)
   - Add or upgrade its entry in `scripts/generate_variable_audit.py`'s `KNOWN_ANNOTATIONS` dict
   - Run `python scripts/generate_variable_audit.py` to refresh the audit table
3. **Build the figure data**:
   - Use POST weights for vote-choice analyses; PRE weights for pre-election analyses
   - Drop ANES missing codes (-9, -8, -7, -6, -1, -2, etc.) explicitly — never let them fall to "valid" by accident
   - Sample size after filtering: print it; if it dropped by more than expected, investigate
4. **Substantively sense-check**: load the chart, look at it, ask "does this look directionally correct?"
5. **Footnote the prose**: add `[N]` markers + Notes block per Gate 5 above
6. **Run the full variable audit** before commit:
   ```bash
   python scripts/generate_variable_audit.py
   python scripts/extract_codebook_entries.py
   ```
7. **Commit** with a message that names the figure + the variables it depends on

---

## How to audit an EXISTING figure (the forensic pass)

Use this when you suspect a figure is wrong, or as a periodic check:

1. **Identify all variables the figure depends on**:
   ```bash
   grep -rEho '\bV[0-9]{6}[a-z]?\b' scripts/build_<that_figure>.py | sort -u
   ```
2. **For each variable, pull its codebook entry**:
   ```bash
   grep -B 1 -A 30 "^\(.*\s\)\?V######" data/raw/anes_codebooks/anes_<year>_codebook.txt
   ```
3. **Cross-check the code's transformation against the codebook**:
   - Does the value mapping match? (e.g. `1 → "dem"` only if codebook says 1 = Strong Democrat)
   - Does the direction match? (e.g. `(5 - x) / 4` only if codebook says 1 = high trust, 5 = low trust)
   - Are missing codes excluded? (e.g. `.between(1, 7)` to exclude -9, -8)
   - Is the sample restricted correctly? (e.g. some questions only asked of subset)
4. **Verify the weight column matches the analysis**:
   - Vote-choice / post-election → POST weight
   - Pre-election / trust / party-ID → PRE weight (OK to use POST for cross-domain comparability if all questions are POST-available)
5. **Substantively sense-check** the rendered figure
6. **Update `reqts/variable-audit.md`** with any new annotations or fixed bugs

---

## Tools

| Tool | Purpose |
|---|---|
| `data/raw/anes_codebooks/*.txt` | Codebooks for ANES 2016 / 2020 / 2024 (downloaded from electionstudies.org) |
| `scripts/generate_variable_audit.py` | Regenerates `reqts/variable-audit.md` from current code + data |
| `scripts/extract_codebook_entries.py` | Regenerates `data/derived/codebook_entries.txt` (codebook entry per variable) |
| `reqts/variable-audit.md` | The audit table itself — read this before relying on any variable |
| `data/derived/codebook_entries.txt` | Quick-reference codebook slice per variable |

---

## Workflow when the user says "I see something weird in figure X"

This is the canonical trigger for the forensic pass. Steps:

1. **Believe the user**. User intuition has caught every catastrophic bug in this project so far. Do not dismiss it.
2. **Identify the figure** and the build script(s) feeding it
3. **Run the forensic pass** (above) on every variable that figure touches
4. **Report findings** with the honest-correction convention (`> **[Claude — honest correction]**`)
5. **Fix the bug**, rebuild the data, copy to `web/data/`, ask the user to reload
6. **Update `reqts/variable-audit.md`** with the new 🔥 KNOWN-BUG-FIXED annotation so it can't silently regress
7. **Commit** with a descriptive message: what was wrong, what the actual codebook says, what the fix is

---

## What "rigorous" actually means here

- "I think this variable means X" is NOT rigorous
- "The codebook on line N of `anes_<year>_codebook.txt` says X" IS rigorous
- "It looks right" is NOT a substitute for the codebook check
- The user catching a bug 6 turns later means we shipped 6 turns of work on bad data
- A bug found mid-figure costs ~30 minutes; a bug found after publishing costs the user's credibility

The rigor is in the SOURCE chain: variable → codebook entry → annotation → audit row → figure → footnote. If any link is missing, fix the link before adding more figures.

---

## Process bugs we have already caught (don't repeat)

- **V241049** was used as "2020 turnout" — actually a hypothetical Harris-vs-Trump question
- **V242065** was used as "voted in 2024" with code 1 meaning voted — actually 1 = did NOT vote (inverted)
- **V161158x / V201231x** off-by-one mapping silently dropped 875 / 2,286 strong Republicans
- **V162031x `-2`** was being treated as "did not vote" — actually means "not ascertained"
- **V242067 code 3** was mapped to "kennedy" — codebook says code 3 does not exist (Kennedy withdrew)
- **2020 / 2024 PRE weights** were used for vote-choice analyses — should be POST weights
- **V242066 [UNIVERSE BUG]** was used as 2024 turnout. Universe is "IF R REPORTED IN THE POST SURVEY THAT R VOTED" — it's a conditional sub-question ("of voters, did you vote for president"), not a turnout question. Only 39 of 5,521 respondents code as non-voters. The actual 2024 turnout binary requires combining V241035 (early voted in pre) with V242065 (post-survey turnout).
- **V201101 [UNIVERSE BUG]** was used alone as "voted in 2016." Universe is "IF R SELECTED FOR VERSION 1A OF 1A/1B SPLICE" — randomized half-sample. The companion V201102 covers the other half. Using V201101 alone missed ~half the 2020 sample. Cohort counts (drop-off, new) approximately DOUBLED after the fix.
- **V161022 [LABEL MISMATCH BUG]** was used as "Democratic primary vote (1=Clinton, 2=Sanders)". Its actual codebook label is "PRE: Already voted in General Election" (1=have voted early, 2=have not voted yet). This labeled 3,467 'have-not-voted-yet' respondents as Sanders primary voters and put the Sanders centroid at x=0 (the average of the whole electorate). The actual primary-vote variable is V161021a (codes 1=Clinton, 2=Sanders, 3=Another Dem, 4=Trump, ...). V161023 (early-vote method) was similarly misused as Republican primary. Now corrected to V161021a; Sanders primary cohort dropped from 2,448 to 300, centroid moved from x=0 to x=-0.67.

**This bug exposes a Gate 1 weakness**: the audit checked Value Labels exist, but didn't verify the variable's LABEL matches the variable's USAGE. Going forward, Gate 1 also requires reading the codebook's Label line for each variable and confirming the code's semantic claim about that variable.

**Pattern**: every catastrophic bug except the off-by-one ones came from a missed Universe clause. That's why Gate 1 now requires both **Value Labels** AND **Universe** to be checked, and that's why Gate 1 is the most important gate.

Every one of these would have shipped to readers without this process. They didn't, because:
1. The codebook is on disk and grep-able
2. The audit table forces an annotation per variable
3. The user's "that looks weird" instinct was treated as a hard signal

Keep all three.
