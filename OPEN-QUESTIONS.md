# Open Questions — for James

**Branch:** claude/dazzling-maxwell-sSHUR · **Updated:** 2026-06-25 (re-verified against current code/data)
Answer inline (a word or two per item is fine). Ordered by how much they affect the essay.

> **Resolved since 2026-06-15:**
> - Mobile responsiveness shipped — every figure now scales proportionally (fixed `viewBox 0 0 680 H`), verified live.
> - Real auto-deploy wired — `.github/workflows/deploy.yml` builds + `wrangler pages deploy`s on every push (the Cloudflare git webhook never fired; CI owns deploys now). See `infra/README.md`.
> - Cross-year trust-LEVEL incumbency control done (was item #6) — now in §15 fn 45.

---

## 1. §2 — is "38%" the number you want?  ⬅ the one real content call
I wired the "averages to center" illusion into §2 (fulfilling §1's promise). The honest,
internally-consistent figure is **37.59% → "38%"** of the electorate (issue-mean within
±0.75 of center, ≥5 of 6 scales answered, full base — same band as the MidMiddlers, same
"100 voters" base as the funnel and the 1-in-100 True Middler).

You'd previously anchored on **"37%"** — that was the older ±0.5 / restricted-base number.
On §2's own band + base it rounds to 38, not 37.

**Current state in index.html:** body says **38%** (line ~244); footnote spells out "37.59%
of the electorate (rounded to 38%)" (line ~295). So "keep 38%" is the no-op.

**Pick one:**
- [ ] Keep **38%** (current) — most consistent with §2's funnel
- [ ] Use **"more than a third"** only, no digit in the body (38% stays in the footnote)
- [ ] Force **"37%"** (I'd footnote that it's the ±0.5 / restricted-base figure)
- [ ] Other: ___

> Review it live at §2, the paragraph starting "The mirage is also bigger…".

---

## 2. Three unreferenced JS modules — delete or keep?  ✅ RE-VERIFIED 2026-06-25
`main.js` imports **none** of these three; their exported functions
(`drawCampaignCeiling`, `drawDisaffected`, `drawMoveableGround`) are called nowhere.

- `web/js-v2/fig-17c-campaign-ceiling.js` — draft for the pending **C1 "ceiling" figure**
  (policy record doesn't buy trust). **Keep.**
- `web/js-v2/fig-19a-disaffected.js`
- `web/js-v2/fig-19b-moveable-ground.js` — orphaned **§18/§19 renumber leftovers**. The live
  `#fig-19a-svg` / `#fig-19b-mount` mounts are fed by `drawSwitcherCohort` (fig-18a) and
  `mountVoterMapTabbed` (fig-18b), **not** these files. **Safe to delete.**

> Correction: an earlier note in this session claimed these two were live and shouldn't be
> deleted — that was a misread of the mount IDs. They are genuinely dead. Original rec stands.

**Your call:**
- [ ] Delete the two `fig-19*`, keep `fig-17c` — (recommended; I can do it in one commit)
- [ ] Delete all three
- [ ] Keep all three (leave as-is)
- [ ] Let me look closer at one first: ___

---

## 3. Fig S (care gap) — 🔥 NON-REPRODUCTION FINDING (built 2026-06-25)
`scripts/build_care_gap.py` now exists and reproduces the §13 care-gap from ANES 2016. **The
figure's hardcoded turnout %s DO NOT reproduce.** Computed (validated turnout, POST weight V160102,
ANES missing codes excluded):

| cell | figure says | ANES 2016 (validated) | self-report |
|---|---|---|---|
| ALL · care a good deal | 70.5 | **80.8** | 91 |
| ALL · don't care | 35.9 | **50.2** | 68 |
| LOW-ENG · care | 52.2 | **68.2** | 79 |
| LOW-ENG · don't care | 25.6 | **44.3** | 61 |

The figure's numbers are **10–19pp LOWER** than ANES validated turnout — and lower than self-report
too, which is unusual (self-report normally over-states). **But:** the low-eng n's (214 care / 301
don't-care) match ANES *exactly* as raw unweighted counts, so the dataset and the V161004==3 low-eng
filter are correct — only the turnout %s come from elsewhere (likely CES/CCES, a different year, or a
lost calc). The **gradient holds** (care ≫ don't-care; low-eng gap ≈ 0.8× the all gap), so the §13
*story* survives; the *specific bar values* are unverified.

I did **not** touch `fig-13a-care-gap.js` or index.html. Your call:
- [ ] Re-source: confirm where 70.5/35.9/52.2/25.6 came from (CES? which year?) and cite it; keep numbers if a real source exists.
- [ ] Re-base on ANES 2016 validated (80.8/50.2/68.2/44.3) — honest + now-reproducible, but changes published bar values + n's (you'd edit fig-13a). (my lean, if no source surfaces)
- [ ] Keep as-is, add a "source pending" footnote.
- [ ] Other: ___

---

## 4. Bare "§N" body links — ✅ CLEAN (full scan 2026-06-25)
Ran a context-aware scan of the whole `web/index.html`: **all 29 in-body cross-references are
proper `<a class="secref">§N</a>` links. Zero genuinely-bare prose `§N` markers.** The 4
originally-flagged phrases are gone. Every other `§N` token in the file is structural, not a
prose cross-ref: `<!-- §N -->` section-divider comments, `<p class="seclabel">§N · Title</p>`
section labels, and two `<code>`-wrapped repo-file references in footnotes (provenance, fine).
Nothing to fix. **Closing this item** unless you spot one I miss.

---

## 5. Minor hygiene — `turnout_hump` weight (low priority)
`build_turnout_hump.py` still uses PRE weight on a post-election turnout analysis (Gate-3).
It's **not rendered** in the essay, so it's cosmetic. (Script still present, unchanged.)
- [ ] Fix it (1-line, gate-clean) · [ ] Leave it (not rendered)

---

## 6. What's the next run? (no rush)
The integrity guard is done; cross-year trust control is done. Standing menu:
- [ ] New analyses — Fig 11 counterfactual / C1 ceiling figure
- [ ] Figure build-out — Fig 12 multi-year toggle, the "signals" chart
- [ ] Short cleanup — items 2–5 above, batched
- [ ] Other: ___

---

## NEW (2026-06-25) — "the election is in the primary" line  (drafted while you were away)

**C1 CONFIRMED ✅ (2026-06-25).** The premise holds in the data: within the reachable
(non-Republican) coalition the candidate's trust position swings Clinton vote share ~23 points
(90.5% → 67.6% across trust terciles, ANES 2016), while the general-election campaign moves it
≈0 (Kalla & Broockman 2018). So the general is largely settled the day the party picks its
nominee, and any institutional thumb on the primary scale is self-sabotage. I won't place this in
index.html (you're in Cursor); pick/remix one and drop it where it fits (near the C1 ceiling
figure, or the §21 primary / superdelegate material).

- **A (closest to your seed):** "If who you nominate moves twenty-odd points of the vote and the
  campaign that follows moves almost none, the election is effectively over the day the party picks
  its nominee. Every institutional thumb on the primary scale, then, is a boot on the party's own
  neck come November."

- **B (plainer 'real election' lead):** "This is why the real election is the primary. By the time
  the general begins, the nominee's trust position is locked and the campaign can barely move it. A
  party that leans on its own primary to crown the safe, 'electable' choice isn't hedging its bets,
  it's choosing the November result in advance, and usually choosing wrong."

- **C (most colorful):** "The campaign is theater; the casting is the election. Whoever the party
  installs in the primary is, give or take half a point, who wins or loses in the fall. So when the
  establishment leans on the primary scale it isn't steadying the party, it's kneeling on its own
  windpipe and calling it discipline."

Imagery (boot / windpipe) is deliberately violent per your "boot on the neck" steer; dial to taste.
Ties to the Platner/Maine live example (centrists withholding support in a primary) and the §16–19
"establishment-cast candidate loses" spine.

---

## NEW FINDINGS (2026-06-25 overnight run) — figure-data integrity

### F1 — 🔥 §16 Figure B understates recent-cycle trust effects (VERIFIED, affects a RENDERED figure)
`build_vote_share_by_trust_band.py` builds its trust composite from VCF0604/VCF0605/VCF0609.
**VCF0604 is entirely absent (0 valid obs) in 2016, 2020 AND 2024** (verified directly; present
in 2012). So for the three most recent cycles the composite collapses to two coarse items
(VCF0605/VCF0609, values 0/1/2/3), and the tercile split on that coarse variable is unreliable
(many ties → rank-assigned bands). Consequence: Figure B's **2016 swing reads 11.3pp**, but the
richer ANES-timeseries trust items (V161215/216/217) give **~23pp** for the same year (see C1).
**Figure B likely UNDERSTATES the trust→vote effect in 2016/2020/2024** — the very effect the essay
argues for. This connects to the known "VCF0604 absent post-2012" caveat.
- [ ] Re-derive Figure B's recent cycles (2016/2020/2024) from each year's richer timeseries trust
      items where available, or add a prominent caveat that recent-cycle bands use a degraded 2-item
      composite. (recommended — needs a proper forensic pass per data-rigor-process.md before editing
      the rendered figure; I did NOT change fig-16b.)
- [ ] Leave as-is / you'll handle.

### F2 — §7 "trust → Clinton 90% → 47%" has no reproducible derivation
index.html §7 (≈ line 940) cites a 90%→47% (43pp) trust→Clinton swing. **No coalition definition in
ANES 2016 reproduces a 47% low-trust endpoint** (full electorate gives 73→33; non-Republicans
90.5→67.6; Dems 94→81). Source unknown — possibly a single-item trust split, a different subgroup,
or an error. Flag for source-check before publication. (Not edited.)
- [ ] I'll source/verify it · [ ] You'll handle · [ ] Replace with the ~23pp non-Rep figure (C1)

### C1 — ✅ RESOLVED, data-backed & REPRODUCIBLE (was item 2 / the "loved" figure)
`fig-17c` is now grounded: nomination bar **~22pp** = ANES 2016 trust-band Clinton swing within the
non-Republican coalition (**89.7→67.2, reproducible via `scripts/build_campaign_ceiling.py`**);
campaign bar ≈0 = Kalla & Broockman 2018 (APSR 112:148–166); gray→amber recolor; "~55×" headline
dropped (it was 22/0.4 placeholder arithmetic). Forensic note: the ~22pp is robust ONLY with standard
equal-thirds terciles; a naive `<quantile` split inflates it to ~43pp (see F2). Verified in
web/preview-17c.html, committed. **Still not wired into index.html — your call where/whether it lands.**

### C1 BRIDGE (James's Q 2026-06-25) — the "22pp" is a ceiling, not a candidate-A-vs-B delta
A reader will assume "WHO you nominate moves 22 points" means "nominate A instead of B → +22 in
November." But the 22pp is measured across DIFFERENT VOTERS facing the SAME 2016 contest (reachable
voters sorted by their own trust: hi-trust 90% Clinton, lo-trust 67%). It is a positional
association, not a counterfactual candidate-swap. The bridge is the essay's spine: a voter's vote
turns on whether they read THIS candidate as part of the system they distrust, so the primary is a
choice of the candidate's trust position, and 22pp is the size of the prize that choice controls —
realized to the degree the two primary candidates are read differently on the establishment axis,
and (per the ≈0 campaign bar) LOCKED the moment you nominate. Draft caption line to prevent the
misread:
> "Read it as a ceiling, not a guarantee: 22 points is how much trust sorts voters' choice within one
> contest. A primary collects it to the degree the candidates differ on the establishment axis — and
> once nominated, that position is set; the campaign moves it ≈0."

---

## AUDIT SYNTHESIS (2026-06-25 overnight) — three new analysis docs

Full detail in `docs/analysis/`: **opening-gravitas**, **stat-audit**, **style-audit** (all DRAFTS;
index.html untouched). Prioritized across all three:

**Must-resolve before publish (statistical):**
1. The 3 blockers already above — F1 (Fig B understates recent cycles, VCF0604 absent), F2 (§7 "90→47"
   unsourced), #3 (care-gap bar values don't reproduce). Plus the C1 ceiling caption.
2. **§17 overclaim** (sharpest new find): the Time-for-Change "four out of five" counts 2016 as a model
   hit, but the model predicted Trump to WIN the popular vote and he lost it by ~2pp. A hostile reviewer
   pounces. Fix: drop 2016 from the hit count or footnote the contradiction.
3. **§14 "largest turnout in history"** — true only as raw headcount; as VEP share 2020 trails 1876/1900.
   Fix: "largest raw turnout" / "modern-era."
4. **§22 KFF year** (body 2016 vs footnote 2017) and **§3 35% vs 36%** figcaption/footnote mismatch — quick.
5. **§11 "every cycle 1988–2024"** figcaption but the series skips 1992/96 — "selected cycles."

**Style (highest-value):**
6. **§21** "The center isn't where elections are won. It's a comforting story. And it's a lie." — the most
   naked AI-cadence beat in the essay, at a peak. Collapse to one momentum sentence (keep the title echo
   if you want it, but not as three fragments).
7. **§11** "It does not mean half the country is simply racist. It means…" — negation-correction; merge.
8. **Em-dash sweep** — ~22 in body prose; the worst 14 are listed with comma/colon swaps.
9. **§0 hedges** ("A quick note on the data", "a very useful place to look") set the entry register below
   the coda — ties to gravitas below.

**Gravitas (your priority — `opening-gravitas` doc):**
10. Three drafted §0 opening ledes (my lean: option B, which foreshadows the coda's "experiment/withdrawal"
    frame). Plus: **move the §0 ¶3 data note** out of the opening (demote to a footnote) — it's the single
    biggest momentum-killer at the front. Say the word and I'll draft §1–§2 openers to match.
