# Figures — iteration doc

A section-by-section menu of every candidate figure. Each entry has:
- **what it shows** (one sentence)
- **what story it tells** (one sentence — why a reader needs it)
- **data source** (which clean CSV backs it)
- **status:** `BUILT` (in the live web build) · `LEGACY` (built but may need rebuilding under framing C) · `CANDIDATE` (proposed; not yet built) · `OBSOLETE` (was built, now off-thesis)
- **complexity:** `easy` (small bar / line / dot chart) · `medium` (multi-panel or annotation-heavy) · `hard` (interactive / custom encoding)

The goal: pick the ~8–12 figures that *most efficiently* tell the negative thesis.
Discard the rest. Then build the chosen set in `web/js/chart*.js`.

---

## §0 · The era — trust collapse

**Fig 0 · "The trust collapse, 1958–2024."**
What: single line chart, Pew "trust government to do what's right" from 77% (1964 peak) to ~22% (2024).
Why: the spine. Every later claim leans on this one trend.
Data: Pew (external — fetch and cache as `data/clean/era_trust_pew.csv`).
Status: `CANDIDATE` (we don't have the Pew series cached locally; pulling it would take ~30 seconds).
Complexity: `easy`.

---

## §1 · "Win the middle" — conventional wisdom

(framing beat — no chart.)

---

## §2 · The center is a lie

**Fig 2 · "Three kinds of 'moderates' — and how they actually voted."**
What: three grouped bars (or a small Sankey), one per bucket — True Middler (1%), Grab-Bagger (39%), Whatever (26%) — each with a stacked vote split Clinton / Trump / 3rd.
Why: makes the bullet list scannable; the visual immediately collapses the "center as a coherent group" story.
Data: `data/clean/center_breakdown.csv`.
Status: `CANDIDATE`.
Complexity: `easy`.

**Fig 2-alt · "The funnel."**
What: a vertical funnel showing 100% electorate → 40% self-ID moderate → 12% loose centrist → 1% strict centrist.
Why: same story as Fig 2 but in funnel form — more visceral.
Data: same.
Status: `CANDIDATE`.
Complexity: `easy`.

---

## §3 · Who actually swings

**Fig 3 · "Most voters are locked in."**
What: stacked bar — partisan loyalty 92%/92% / pure indeps 15% / defectors 4%.
Why: visualizes "swing voters are very rare."
Data: `data/clean/partisan_loyalty.csv`.
Status: `LEGACY` (`web/js/chartSwing.js` exists and may already do this).
Complexity: `easy`.

---

## §4 · Two completely different jobs

**Fig 4 · "Ideology decides who; engagement decides whether."**
What: two bar pairs side by side — `ideology → choice 2.30 / trust 0.62` and `ideology → turnout 0.03 / trust 0.02`. Same axis; the visual cliff is the point.
Why: the §4 pivot. Reader needs to see the asymmetry instantly.
Data: hard-coded from §4 [2] (small table).
Status: `LEGACY` (`web/js/chartJobs.js` exists).
Complexity: `easy`.

---

## §5 · Buried assumptions — the 9-box grid

**Fig 5 · "The 9-box grid — and what it hides."**
What: 3×3 matrix with each cell labeled (bank / GOTV / persuade / avoid …), and three red annotations pointing at the buried assumptions.
Why: makes the critique concrete — the reader sees the grid the way a campaign sees it.
Data: schematic; no CSV.
Status: `LEGACY` (`web/js/chartPlaybook.js` is the 9-box).
Complexity: `medium` (annotation-heavy).

---

## §6 · Race set at the nomination

**Fig 6 · "49 experiments, ≈0 effect."**
What: forest plot of 49 K&B point estimates with the meta-estimate at zero.
Why: the most-replicated finding in modern campaign science — readers need to see the cloud of zeros.
Data: external (K&B 2018 supplementary materials).
Status: `CANDIDATE` (medium effort — need to pull the K&B replication data).
Complexity: `medium`.

**Fig 6B · "What actually shifts turnout."**
What: bar chart — policy message ≈0pp / GOTV mail +0.8 / phone +2.0 / canvass +4.3 / social-pressure +8.1.
Why: the §12 evidence base; helps the reader see "contact beats content."
Data: hard-coded Gerber-Green meta.
Status: `BUILT` (`web/js/chartTurnoutLevers.js`).
Complexity: `easy`.

**Fig 6C · "The turnout hump (stakes × efficacy)."**
What: three crossing lines (stakes ↑, efficacy ↓, turnout humps mid) across grievance bands.
Why: §14's two-failure-modes evidence.
Data: `data/clean/turnout_hump.csv`.
Status: `BUILT` (`web/js/chartTurnoutHump.js`).
Complexity: `medium`.

---

## §7 · The within-tent bolt

**Fig 7 · "Inside the tent: who bolts when the candidate is the establishment."**
What: two side-by-side bar groups (Dem tent on left, Rep tent on right), each showing vote split by low / mid / high trust band; annotated to show the Dem-tent bolt firing while the Rep-tent bolt doesn't.
Why: the asymmetry IS the §7 sharpening — one visualization shows that the bolt only fires when YOUR candidate is the establishment.
Data: `data/clean/within_tent_bolt.csv`.
Status: `CANDIDATE`.
Complexity: `medium`.

**Fig 7B · "It holds across cycles (mostly)."**
What: small-multiples — one mini-chart per cycle 1972–2024, each showing the within-establishment-tent narrow-swing % by trust tercile, annotated to mark 1996 and 2008 as the exceptions.
Why: the cross-cycle evidence flagged in the §7 NOTE.
Data: `data/clean/within_tent_bolt_by_cycle.csv`.
Status: `CANDIDATE`.
Complexity: `hard` (14 panels + annotation).

---

## §8 / §9 · Authenticity crossover

**Fig 8 · "The honest-and-cares-about-me crossover."**
What: butterfly chart for 2016 — low-trust voters rate Trump 1.58 / Clinton 0.54 honest; high-trust voters the exact reverse.
Why: the most striking single visual of the trust-as-perception story.
Data: hard-coded from §8 [2].
Status: `LEGACY` (chart name to confirm).
Complexity: `easy`.

**Fig 9 · "The crossover proves itself — on / off / on."**
What: three butterfly charts side by side — 2016, 2020, 2024 — with 2020 annotated as the "incumbent Trump, magic vanishes" cycle.
Why: the falsifier; readers see the role-dependent pattern with their own eyes.
Data: hard-coded (ANES trait items 2016/2020/2024).
Status: `CANDIDATE`.
Complexity: `medium`.

---

## §10 · Flip-flop for free

**Fig 10 · "Same flip, opposite reaction — the honesty gap."**
What: dot plot with two pairs — Trump 3.72 honest / Clinton 3.95; below them, the Barber-Pope experimental shift (Republican position shifts toward stated-Trump position).
Why: shows the asymmetry concrete.
Data: hard-coded from §10 [1] [2].
Status: `CANDIDATE`.
Complexity: `easy`.

---

## §11 · So what flips a switcher

**Fig 11 · "The panel test — trust ≈ 0; status is the engine."**
What: horizontal bar chart of the standardized coefficients from the VSG panel — trust 0.00 / RR +0.97 / ideology +1.00 / econ +0.22 — with trust visibly dwarfed.
Why: the centerpiece of the §11 finding.
Data: `data/clean/panel_switch_vsg.csv`.
Status: `CANDIDATE`.
Complexity: `easy`.

**Fig 11B · "RR's electoral weight, 1988–2024."**
What: line chart of net-of-controls RR coefficient by cycle, with the Obama 2008 vertical line and a shaded band 2016–2020 at the peak.
Why: §11 [4] visualized. Makes the "5× rise post-Obama" tangible.
Data: `data/clean/rr_weight_by_cycle.csv`.
Status: `CANDIDATE`.
Complexity: `easy`.

---

## §15 · "Just 2016" — every election

**Fig 15 · "Trust → vote, every cycle 1972–2024."**
What: vertical bars per cycle, height = trust standardized coefficient, color = WH party at election time (red = Rep, blue = Dem). The eye sees the sign-flip pattern.
Why: the most powerful single proof of the cross-cycle rule. Possibly the best figure in the whole essay.
Data: `data/clean/trust_vote_by_cycle.csv`.
Status: `CANDIDATE`.
Complexity: `easy`.

---

## §16 · The puzzle (Obama/Bush won; Clinton/Harris lost)

**Fig 16 · "The change-lane scoreboard."**
What: five-row table (2004/2012/2016/2020/2024) with role, trust→vote, cast-as, result; each "WON / LOST" boxed.
Why: the visual reveals the pattern that fundamentals can't.
Data: `the-center-is-a-lie.md §10` table; can be exported to `data/clean/change_lane.csv`.
Status: `CANDIDATE`.
Complexity: `easy`.

---

## §17 · What actually happened in 2016

**Fig 17 · "The Sanders → Trump consolidation arithmetic, by swing state."**
What: three bar pairs (WI / MI / PA), each showing Trump margin (small) vs Sanders→Trump defectors (taller).
Why: the §17 closer made visceral.
Data: hard-coded (CES vote-validated).
Status: `LEGACY` (`web/js/chartConsolidation.js`).
Complexity: `easy`.

---

## §18 · The bad trade

**Fig 18 · "Swing voters by ideology — and the trade-off."**
What: 5 vertical bars (strong-left / lean-left / moderate / lean-right / strong-right) showing swing rate and mean trust simultaneously (twin-axis or color-encoded). Annotate the lean-left bar as "the lowest-trust group" and moderate as "the largest but flattest mass."
Why: the bad-trade visualization — the trade-off literally shows itself.
Data: small CSV — should be saved as `data/clean/swing_by_ideology.csv`.
Status: `CANDIDATE`.
Complexity: `medium`.

---

## §19 · Closing

(prose-only; no chart needed.)

---

## Iteration questions for the author

- **Which figures are *load-bearing*?** My top-five if you forced me to pick: **15, 6C, 7, 11B, 18.** Those five carry the negative thesis end-to-end. Everything else is helpful but not load-bearing.
- **Which existing legacy figures need to go?** Anything wired around "trust is the engine of swinging" that we softened to "context" under framing C. Specifically worth auditing: `chartCampaignCeiling`, `chartDisaffected`, `chartGravity`, `chartSignal`.
- **What's the figure budget?** A NYT-style data essay typically carries 6–10 chart figures + 2–3 illustrative ones. 16 is too many; 5 is enough if they each pull weight.

When you're ready, mark a figure `KEEP` / `BUILD` / `KILL` and I'll execute. Or say "build the top five" and I'll start with Fig 15.
