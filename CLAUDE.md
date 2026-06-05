# Center-Basher — Project Rules

> **Read [`read-at-start.md`](read-at-start.md) FIRST.** It carries the thesis, the file map, the
> findings inventory (what survived vs what was retracted), the data inventory, and the lessons
> learned from prior agent passes. This file is the *behavioral rules*; read-at-start is the *state*.

---

## 1 · Single source of truth (prose vs structure vs stats)

| File | Owns | Touch rules |
|---|---|---|
| `reqts/plain-language.md` | **Lede prose + per-section footnotes** | **User-owned voice.** Never paraphrase, condense, or "improve." Copy verbatim only. |
| `reqts/narrative.md` | **Structural overlay** — parts, order, `PL §x` refs, stats table | Mine to maintain. No prose duplicated from plain-language. |
| `reqts/the-center-is-a-lie.md` | **Technical / stats doc** — derivations, full tables, methodology | Mine to maintain. |
| `web/` | The D3 site. Vite dev at localhost:5173. | Build target. |

### HARD GATE — Prose is sacred
- **Never** rewrite, condense, paraphrase, or "tighten" a user-written lede. Copy verbatim.
- When the user edits `plain-language.md`, **no other file's prose may drift**.
- `narrative.md` references (`PL §x`), it does **not** duplicate prose.
- If you find yourself rephrasing a user line "for fit" — stop. Reference it or quote it as-is.

This rule exists because we already had a drift incident in this codebase. Don't repeat it.

---

## 1a · Data rigor process is MANDATORY

**Read [`reqts/data-rigor-process.md`](reqts/data-rigor-process.md) before touching ANY ANES variable or figure.**

That document defines the five gates every figure must pass through:
1. Codebook-grounded variable claims (annotation in `scripts/generate_variable_audit.py`)
2. Observed distribution matches the codebook
3. Pre vs Post weight alignment
4. Substantive sense-check
5. Footnote provenance

When the user says *"I see something weird in figure X"* or *"that doesn't look right"* — that is the canonical trigger for the **forensic pass** documented in `reqts/data-rigor-process.md` §"Workflow when the user says...". **Believe the user.** Almost every catastrophic bug in this project was caught because the user said something like "Trump should sit closer to swing voters" or "Independents shouldn't anchor on the right."

**Hard gates from the rigor doc** (do NOT skip):
- No new figure ships without its variables having a ✅ VERIFIED or 🔥 KNOWN-BUG-FIXED annotation in `reqts/variable-audit.md`
- Vote-choice / post-election analyses MUST use POST weights (V160102 / V200010b / V240107b), not PRE
- ANES missing codes (-9, -8, -7, -6, -1, -2) must be explicitly excluded — never let them silently fall to "valid"
- The user's intuition is a hard signal, not a nit. Run the forensic pass before pushing back.

Tools to re-run after any variable change:
```
python scripts/extract_codebook_entries.py     # refresh codebook entries
python scripts/generate_variable_audit.py      # refresh audit table
```

Bugs already caught (and now permanently annotated in `reqts/variable-audit.md`):
V241049, V242065, V161158x, V201231x, V162031x, V201101, V242067 code-3, 2020+2024 pre→post weight switch.
See `reqts/data-rigor-process.md` §"Process bugs we have already caught" for the full list.

---

## 2 · Statistical claims must be footnoted

Every statistical claim in body prose carries an inline `[N]` marker pointing to a Notes block at the
end of that section. Notes describe:

- **Source dataset** — file, year, release
- **Variables used** — variable names/codes (e.g. `V161126`, `VCF0604`)
- **Filter / sample definition** — exactly which rows
- **n** — weighted or unweighted, stated
- **Weight column** — e.g. `V160101`
- **Model / method** — weighted logistic, weighted mean, tercile binning, etc.

External claims (papers, books, polls) get a primary citation: authors, year, title, venue, DOI/URL.

**Anticipate a hostile expert reviewer.** Every claim should survive a smart skeptic with the same data.

### Specific data-discipline rules
- **Pre-election measures only** for causal claims about voting. State this explicitly.
- **Vote-validated > self-reported** turnout. Self-report in ANES over-reports by ~25pp.
- **Cross-cycle by default** for partisan-trust claims. Single-cycle is incumbent-party-confounded.
- **Variance / floor checks** before claiming a coefficient is "null." A near-degenerate variable
  (e.g. trust with 45% at floor, median 0.17) cannot discriminate even if it matters substantively
  — that's compressed variance, not a causal null.
- **State the operationalization.** If "swing" can mean multiple things (voted Trump vs voted not-Clinton),
  pick one and acknowledge the alternative in a note.

---

## 3 · Verify before affirming

When the user proposes a hypothesis, remembers a finding, or asserts a stat:

1. **Test it against current data first.** Do not build narrative on memory or intuition.
2. **Report what survives** — and what doesn't. Flag refutations explicitly.
3. If user says *"didn't we find X?"* — verify against actual data; memory can be stale.
4. If user's framing is empirically thin, **flag it with a specific rewrite suggestion**, don't paper over.

Examples of this rule firing in this project:
- User: *"trust drives turnout for the unlikely"* → tested, refuted (~0). Flagged.
- User: *"majority of no-shows are alienated system-critics"* → tested, refuted (~22%, not majority).
  Flagged with "roughly a fifth" suggested rewrite.
- User intuition: *"connection / likeability drives turnout"* → tested, refuted (likeability −0.10).
  Reported the surprise: stakes + fear-of-other drives turnout, not warmth-to-favorite.

---

## 4 · Honest correction culture

When data contradicts the user's framing:
- State the correction directly in plain English.
- Give the supporting numbers (n, source, effect size).
- Propose a tight rewrite of the affected body line.
- Mark with `> **[Claude — honest correction]**` blockquote so the user can find and resolve.

Do **not** quietly soften a claim and move on. The user explicitly asked to be told when something
doesn't survive the data.

---

## 5 · Persistent data storage

`/tmp` gets wiped between sessions. **Never cache anything important under `/tmp`.**

- Source datasets: `data/raw/`
- Cached extracts / derived tables: `data/derived/` (create if missing)
- ANES CDF, voteval, VSG panel — these are *critical*; when re-extracting from `~/Downloads/*.zip`,
  unzip to `data/raw/<dataset>/` and commit a `.gitignore` for the binary if it's large.

When you discover a wiped cache, **re-extract once, then save under `data/`** — don't rebuild under
`/tmp/` again.

---

## 6 · Numbering / cross-reference discipline

`plain-language.md` uses sequential integer section numbers (`### 0` through `### 19` currently).

When sections are added, moved, or renumbered:
1. Update all in-body `(§N)` cross-references in `plain-language.md`.
2. Update all `PL §x` references in `narrative.md`.
3. Update any `PL §x` references in `the-center-is-a-lie.md`.

**No decimals (`§3.5`) in final form.** No duplicate numbers. Flag any inconsistency before proceeding.

---

## 7 · Verification at the right viewport

For figures and web work: **desktop-first** (content column ~680px, viewport 1280×900) per explicit
user instruction. Verify desktop before mobile. Use the chrome-devtools MCP for screenshots.

---

## 8 · Commit cadence

Per the user's "commit a lot" directive:
- Commit after every meaningful unit of work — a finding, a rewrite, a renumber pass.
- Commit message: *what changed + why*. Footer: `Co-Authored-By: Claude Opus 4.X <noreply@anthropic.com>`.
- Stay on the current branch; do not switch branches without asking.

---

## 9 · When to ask vs when to act

**Ask before:**
- Major restructures of the narrative
- Deleting user content (even drafts)
- Renumbering when the user hasn't said so
- Force-pushing, rewriting history, branch operations
- Anything affecting `web/` styling beyond fixing a verified bug

**Act without asking:**
- Filling user-placed `< CLAUDE: ... >` markers
- Running data analyses to verify a claim
- Adding footnotes / citations / sourcing
- Renumbering / cross-ref fixes when user has said "renumber"
- Honest corrections when data refutes a framing (always flag, never paper over)

---

## 10 · Tooling notes

- `TodoWrite` is **not enabled**. Use `TaskCreate` / `TaskUpdate` / `TaskList`.
- Vite dev server typically at `http://localhost:5173/` for the web build.
- chrome-devtools MCP available for browser verification.
- Memory files for this project live at:
  `~/.claude/projects/-Users-james-Sites-personal-center-basher/memory/`
- Python: `pandas`, `numpy` available via `/opt/homebrew/anaconda3/...`.
- ANES `.dta` files: load with `pd.read_stata(path, convert_categoricals=False)`.

---

## 11 · The thesis (one-line reminder)

**The electability argument — "move to the center to win" — is a lie.** Center isn't a coherent bloc;
positions barely move voters; the candidate cast as the establishment loses. Trust is *context*, not
the engine; race/status realignment is the cleavage that *grew*, held loosely. Two-thread structure:
**Choice** (picking you) and **Turnout** (showing up) — different drivers, different levers, and
"move to the center" fails both.

Full thesis + framing C details in [`read-at-start.md`](read-at-start.md).
