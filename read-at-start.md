# Center-Basher — Read This First

This is a data-viz essay called **"The Center Doesn't Exist"** (working title) arguing that the
"move to the center / electability" thesis for Democratic campaigns is empirically wrong. It is a
static D3 site (`web/`) backed by ANES, CES, and VSG panel data.

Read this file before touching anything. Behavioral rules are in [`CLAUDE.md`](CLAUDE.md).

---

## 1 · Thesis (framing C — adopted 2026-05-29)

**The electability argument — "move to the center to win" — is a lie.**

Three findings carry the negative case (none depend on a contested mechanism):

1. **The center is not a coherent bloc.** Only ~1 in 6 voters are self-ID-moderate AND policy-centrist
   (loose); ~1 in 100 (strict). And the "average-to-center" centrists actually voted Trump 59/28 in
   2016 — the coherent moderate is not a Democratic prize either.
2. **Positions barely move voters.** Kalla & Broockman 2018 (49 field experiments): general-election
   persuasion ≈ 0. Gelman & King 1993: campaigns are "enlightenment" — discovery, not persuasion.
3. **The candidate cast as the establishment loses.** Trust → presidential vote flips sign with the
   White House party in 11 of 13 cycles, 1976–2024. Establishment successors (Clinton '16, Harris '24)
   lose; change-lane incumbents (Bush '04, Obama '12) win.

**Stay agnostic about the single "engine."** Two things are *context*, not the punchline:
- **The low-trust era** is real and macro (Pew 77%→19%), but trust has collapsed so universally it no
  longer *differentiates* voters — compressed variance (median 0.17, 45% at floor). It's the water
  everyone swims in, not a lever.
- **Racial-status realignment** is the cleavage that *grew* into the decider (RR electoral weight,
  net of party + ideology, tripled 0.05 (2000) → 0.92 (2020) in the ANES CDF). Held *loosely* — not
  the headline, not "the swing is racism."

### Structure — two threads, two jobs

Winning is two separate problems:
- **Choice** (picking you) — the swing/reachable voters live here.
- **Turnout** (showing up) — the no-shows live here.

"Move to the center" fails both. Choice: positions don't move voters; the lever is which *lane* you
own. Turnout: contact + stakes (not policy, not likeability) drive turnout; the gettable fail two
opposite ways (complacency vs alienation).

---

## 2 · File map — who owns what

| File | Owns | Status |
|---|---|---|
| [`reqts/plain-language.md`](reqts/plain-language.md) | **Lede prose + per-section footnotes** (user voice; canonical) | Active, user iterates |
| [`reqts/narrative.md`](reqts/narrative.md) | **Structural overlay** — parts, order, `PL §x` refs, stats table | Reference, no prose |
| [`reqts/the-center-is-a-lie.md`](reqts/the-center-is-a-lie.md) | **Technical stats doc** — derivations, full tables | Mostly stable |
| `web/` | The D3 site — needs rebuild against framing C | Pre-C build present |
| `data/raw/` | Source datasets | ANES 2016 .dta persists; others wiped (see §6) |
| `data/derived/` | Cached analysis output | TODO — create + use this instead of /tmp |
| `~/.claude/projects/.../memory/` | Cross-session memory files | Index in `MEMORY.md` |

### The prose rule
- `plain-language.md` is the **only** place lede prose lives.
- `narrative.md` references via `PL §x`. It must **never** copy or paraphrase prose.
- If you find yourself wanting to "tighten" or "condense" a user lede in another file — stop. Reference it.

---

## 3 · Pre-validated findings (load-bearing — survived adversarial review)

| Finding | Source | Where |
|---|---|---|
| Self-ID moderate ≠ policy-centrist ≠ swing | ANES 2016 (V161126 + issue items + V161158x) | PL §2, §3 |
| True Middlers ≈ 1% (strict) / 16% (loose); loose Middlers voted Trump 59/28 | ANES 2016 | PL §2 |
| 92% partisan loyalty both parties | ANES 2016 V161158x × V162034a | PL §3 |
| General-election persuasion ≈ 0 | Kalla & Broockman 2018, APSR | PL §6 |
| Pre-election low-trust non-Reps → Trump at 2× the rate of high-trust ones (n=1505) | ANES 2016 | PL §7 |
| Within-tent bolt is asymmetric (only fires when *your* candidate is establishment) | ANES 2016 D vs R sides | PL §7 |
| Authenticity crossover is role-dependent: 2016 ✓ / 2020 ✗ / 2024 ✓ | ANES 2016/2020/2024 traits | PL §8, §9 |
| Trust → presidential vote flips sign with incumbent in 11/13 cycles | ANES CDF 1976–2024 | PL §15 |
| Five-election change-lane: Bush'04, Obama'12 won (change-lane); Clinton'16, Trump'20, Harris'24 lost (establishment) | ANES CDF + 2020/2024 | PL §16 |
| VSG panel Obama→Trump switch: trust ≈ 0; racial resentment +0.66 (full model); ideology +1.00 | VSG / VOTER panel 2011–2020 | PL §11 |
| RR's electoral weight, net of party + ideology, tripled post-Obama (0.05 → 0.92) | ANES CDF | PL §11 |
| Stakes (not likeability) drives turnout: cares 81% vs doesn't 48% (full); 67/43 gettable | ANES 2016 V161005 | PL §13 |
| Likeability (warmth-to-favorite) is flat-to-negative for turnout; affect spread is steep | ANES 2016 V161086/V161087 | PL §13 |

---

## 4 · Retracted / softened claims — DO NOT REBUILD ON THESE

These were tested and **did not survive**. They're documented here so a fresh agent doesn't
re-introduce them.

| Claim | Why retracted |
|---|---|
| "Trust drives turnout" | Validated-turnout coefficient ≈ 0. Self-reported turnout was over-reported 25pp, hiding a null. |
| "Trust is the engine of swinging" | VSG panel test: trust ≈ 0 causally. Race/status is the actual driver. |
| "Center empties out under trust" | False — center is *highest*-trust pooled 1972–2024 (CDF). |
| "Low-trust = Republican" | 2016 Obama-era artifact; sign flips with incumbent. |
| "RR finding is Obama-independent because it works white-vs-white" | Wrong — Obama was the backdrop in 2016 and 2020 (Clinton was his SoS; Biden his VP). |
| "Majority of no-shows are alienated system-critics" | ~22% alienated, ~21% complacent, 57% mixed; 71% don't care. |
| "8% undecided voters" | Unanchored to data. Softened to "under 1 in 10." |
| "Distrust mobilizes when emotionally charged" (channeling) | Self-report artifact; validated turnout shows no interaction. |

---

## 5 · Open / NOT YET PROVEN

Things the framework predicts or implies but we haven't tested:

- Whether a left-populist "elites vs you" message can re-route racialized-status voters
  (VSG can't test this; needs a survey experiment).
- Whether GOTV contact can restore *efficacy* in the alienated tail (panel test needed; existing
  GOTV meta tests turnout, not efficacy mechanism).
- Whether the change-lane pattern holds for 2024 in a panel (Catalist / Blue Rose data not loaded).
- Cross-cycle within-tent low-trust bolt (1976–2024) — needs CDF re-extract (see §6).

---

## 6 · Data inventory (ALL PERSISTENT as of 2026-05-30)

| Dataset | Path | Status |
|---|---|---|
| ANES 2016 Time Series | `data/raw/anes_timeseries_2016.dta` | ✓ persistent |
| ANES 2016 vote-validation | `data/derived/anes_timeseries_2016_voteval_csv/` | ✓ persistent |
| ANES Cumulative Data File (CDF, 1948–2024) | `data/derived/anes_timeseries_cdf_csv_20260205/` | ✓ persistent |
| ANES 2020 Time Series | `data/derived/anes_timeseries_2020_csv_20220210/` | ✓ persistent |
| ANES 2024 Time Series | `data/derived/anes_timeseries_2024_csv_20260519/` | ✓ persistent |
| Democracy Fund VOTER Panel (VSG, 2011→2020) | `data/derived/VOTER-Survey-Panel-Data-Files-2021Dec/VOTER Panel Data Files/` | ✓ persistent |
| GSS 1972–2024 | — | ✗ re-extract if needed (public) |
| CES 2016 vote-validated | — | ✗ re-extract from Downloads if needed |

The large source files are gitignored (`data/derived/.gitignore`) but the directory structure
and the verification artifacts (`turnout_hump.json`, `verification_2026-05-30.md`,
`chart-turnout-hump.png`) are tracked.

To re-extract any wiped dataset:
```bash
unzip ~/Downloads/<dataset>.zip -d data/derived/<dataset>/
```

### Key variables (so you don't have to re-discover them)

**ANES 2016 standalone (.dta):**
- Weight: `V160101` (post-election); `V160102` (pre-election only)
- Self-place lib-con: `V161126` (1–7, 99 = "haven't thought")
- Party ID branched: `V161158x` (1 strong D … 7 strong R)
- Trust 3-item: `V161215` (do-right, inverted), `V161216` (run-for-all vs few big interests),
  `V161217` (not-waste). Build index as mean of three normalized to 0–1; **direction: high = grievance**.
- External efficacy: `V162215` ("officials don't care"), `V162216` ("no say"), 1–5; high = more efficacy.
- Care who wins (stakes): `V161005` (1 cares a good deal, 2 doesn't)
- Interest: `V161004` (1–3)
- Candidate thermometers: `V161086` (Clinton), `V161087` (Trump)
- Candidate traits ("honest"/"cares"): `V161111`/`V161112`/`V161113`/`V161114`
- Vote choice: `V162034a` (1 Clinton, 2 Trump, 3 Johnson, 4 Stein, 5 other)
- Vote-validation merge key: dta `V160001_orig` ↔ csv `V160001` (NOT the dta's V160001)

**ANES Cumulative File (CDF, CSV):**
- Year `VCF0004`; weight `VCF0009z`; party ID `VCF0301`; ideology `VCF0803`
- Pres vote `VCF0704` (1 Dem, 2 Rep)
- Trust items: `VCF0604` (do-right), `VCF0605` (run-for-all), `VCF0609` (not-waste). VCF0604 absent
  for 2016–2024 in current release; index runs via 0605/0609 for those cycles.
- CSV missing values: blank string, `'0'`, `'9'`, `'-9'`, `'-8'`, `'-7'`.

**ANES 2020 / 2024:** see `the-center-is-a-lie.md` §6 for trait + trust + vote variable IDs.

**VSG / VOTER Panel:** `presvote_2012`, `presvote_2016`, `presvote_2020Nov` (note: 2020 coding
flipped — 1=Trump, 2=Biden); `trustgovt_2016` (3-pt, near-degenerate); `race_deservemore_2011` +
`race_tryharder_2011` (PRE-treatment RR); `pid7_2012`, `ideo5_2016`, `persfinretro_2016`;
weight `weight_genpop_2016`. CSV is **latin-1 encoded**.

---

## 7 · Lessons learned (mistakes we made — don't repeat)

These were real mistakes in prior agent passes. Codified here so the next agent doesn't repeat them.

1. **Drift via duplicated prose.** I copied user-edited ledes into `narrative.md` "for fit," then
   paraphrased them. When the user re-edited `plain-language.md`, `narrative.md` drifted and looked
   like it had "reverted" their work. **Fix:** never duplicate prose; reference (`PL §x`). Now codified
   as Hard Gate in CLAUDE.md §1.

2. **Built thesis on under-validated causal claim.** The first version of the essay ran on
   "trust is the engine of swinging." When we finally ran the VSG panel test (pre-treatment race
   measures), trust ≈ 0 causally and racial resentment was the actual driver. This forced framing C.
   **Fix:** test causal claims with panel/pre-treatment data BEFORE building narrative on them.

3. **Single-cycle confound on partisan-trust claims.** Asserted "low-trust = Republican" from 2016.
   The ANES CDF showed the sign flips with incumbent party in 11/13 cycles — 2016 was an Obama-era
   artifact. **Fix:** cross-cycle by default for trust → partisan-vote claims.

4. **Self-reported turnout hid the null.** Asserted "trust drives turnout" using ANES self-report,
   which over-reports by ~25pp. Validated turnout showed ≈ 0. **Fix:** vote-validated > self-report,
   always. State which is used.

5. **Didn't check variance/floor before claiming null.** Trust has 45% of voters at the floor
   (median 0.17, SD 0.220). A near-null coefficient on a near-degenerate variable is a
   *compressed-variance* artifact, not a substantive null. **Fix:** check distribution before
   interpreting nulls.

6. **"Center empties out under trust"** was directionally wrong — pooled CDF 1972–2024 the center
   is *highest*-trust. **Fix:** pool multiple cycles to net out incumbent confound before claiming
   structural patterns.

7. **"RR works white-vs-white = Obama-independent"** — wrong; Obama was the backdrop in 2016 (Clinton
   was his SoS) and 2020 (Biden his VP). **Fix:** don't infer causal independence from absence of a
   "treatment" — structural context matters.

8. **Likeability ≠ what mobilizes.** Initial guess (and the user's intuition) was that
   connection/likeability drives turnout. Data: warmth-to-favorite has standardized effect **−0.10**;
   fear/affect-spread is what mobilizes. **Fix:** test the user's hypothesis before building prose
   around it. Affirm only what survives.

9. **"Majority distrustful no-shows"** — looked plausible, wasn't true. ~22% alienated, ~21%
   complacent, 71% don't care. **Fix:** flag honestly with the data and a specific rewrite. Don't
   soften silently.

10. **Lost data to /tmp wipes.** Cached ANES CDF, VSG, voteval all under `/tmp/`. Got wiped between
    sessions; had to flag re-extraction every restart. **Fix:** `data/derived/` is persistent;
    `/tmp/` is not.

11. **Mobile-first when user wanted desktop-first.** Spent effort on narrow-width tweaks before
    desktop verification. User explicitly preferred desktop-first for now. **Fix:** verify at the
    primary target viewport first (1280×900, ~680px column).

12. **"8% undecided" passed without flag.** Number was in user prose; I let it slide for several
    edits before flagging that it wasn't anchored to any of our data. **Fix:** audit any quantitative
    claim the user introduces, the moment it appears; flag immediately if unsupported.

---

## 8 · When you spawn subagents — context bundle for them

Per the user's global CLAUDE.md, subagents inherit no conversation context. When dispatching:
- Include this file's section 1 (thesis) verbatim.
- Include section 4 (retracted claims) — so they don't rebuild on refuted ground.
- Include the relevant section 6 variable IDs for any data work.
- Add the relevant CLAUDE.md hard gates (prose-sacred; statistical-claims-need-footnotes;
  pre-election-causal; vote-validated-turnout).
- Be explicit about *what to write back* — structured output (JSON schema) is best.

---

## 9 · Quick orientation by user intent

| User says… | Look here first |
|---|---|
| "the thesis" / "framing" | §1 of this file |
| "what survived" / "is X solid?" | §3 (pre-validated) |
| "didn't we find X?" | §4 (retracted) — was it refuted? |
| "rerun this analysis" | §6 (data inventory) — is it persistent or wiped? |
| "edit a section" | `reqts/plain-language.md` (sequential §0–§19 currently) |
| "rebuild a figure" | `web/`, but **confirm framing C alignment** against §1 first |
| "I think we found …" | Run the analysis and verify before agreeing |

---

*Last updated this pass: 2026-05-30.*
