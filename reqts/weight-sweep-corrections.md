# Draft corrections — Gate-3 weight sweep + V161217 bug (§3, §5, §7)

**Branch:** claude/dazzling-maxwell-sSHUR · **Created:** 2026-06-19 · **Status:** DRAFT — awaiting approval
**Nothing below is applied.** Verification: `scripts/verify_weight_sweep.py`,
`scripts/verify_within_tent_v161217.py`, `scripts/verify_figI_figK_all.py`.

What the "weight sweep" turned out to be: the vote-conditioned **scripts already compute with
V160102 (POST)** — only the *labels* lie. While verifying, I found a **separate V161217
construction bug** in the same script. They're split into buckets below by how confident /
how invasive each change is.

---

## BUCKET A — Weight-label fixes (SAFE, no rendered number changes) — ✅ DONE 2026-06-19

The scripts already use POST; these just make the prose/metadata honest.
**Applied & committed** (script metadata + data/clean + web/data/swing_spectrum label sync,
then fn-3-3 / fn-7-1 footnote labels). Verified number-safe: regeneration moved only label
strings; footnotes still contiguous 1–73. fn-3-3 center share 35%→36% (per commit 755879e).

### A1 · §3 fn-3-3 (`value="9"`)
- **Current:** `ANES 2016, weighted with <code>V160101</code>.`
- **Proposed:** `ANES 2016, weighted with <code>V160102</code> (POST; vote-conditioned).`
- Also: `Only 35% of all defectors self-place at the exact center … 65% are off-center` →
  **36% / 64%** (POST value; PRE rounds to 35/65). Means 3.6 / 4.7 / 4.2 are unchanged.
- Script: `build_swing_spectrum.py` docstring L13 + metadata L84 `V160101` → `V160102`.

### A2 · §7 fn-7-1 (`value="19"`)
- **Current:** `ANES 2016 weighted with <code>V160101</code>, n≈3,300.`
- **Proposed:** `ANES 2016 weighted with <code>V160102</code> (POST), n≈3,300.`
- ⚠️ The "defectors (0.23) / loyalists (0.22)" means in this same footnote do **not** reproduce
  under the within-tent trust construction (I get 0.19 / 0.22) — see Bucket C; they look computed
  with the *correct* trust index while fn-7-2's terciles use the *buggy* one. Flagged, not yet drafted.
- Script: `build_within_tent_bolt.py` metadata L98/L102 `V160101 (weight)` / `V160101 (post-election)`
  → `V160102 (POST weight)`.

---

## BUCKET B — fn-5-4 / Figure I are genuinely still PRE (number changes)

fn-5-4's "2.28% of the electorate" is the **PRE** value; POST = **2.68%**. This footnote + Figure I
are not just mislabeled, they're computed on the wrong weight AND hit by the V161217 bug (Bucket C).

### B1 · §5 fn-5-4 (`value="15"`) — weight
- **Current:** `ANES 2016, weighted by <code>V160101</code>. … <strong>2.28% of the electorate,
  n = 92</strong> ≈ <strong>7.8% of Dem-leaning voters</strong> (1 in 13).`
- **Proposed (weight + share):** `weighted by <code>V160102</code> (POST). … <strong>2.68% of the
  electorate, n = 92</strong> ≈ <strong>8.2% of Dem-leaning voters</strong> (about 1 in 12).`
  - (8.2% is stable across PRE/POST; only the electorate share moves with the weight.)
- The grievance numbers in the rest of this footnote depend on the V161217 fix → Bucket C.

---

## BUCKET C — V161217 scale bug (honest correction; changes thesis-figure numbers)

> **[Claude — honest correction]** `build_within_tent_bolt.py` (and the unrendered
> `build_turnout_hump.py`) read **V161217 as a 1–5 item and normalize `(t3−1)/4`**, but it is a
> **1–3 item** (1=a lot of waste … 3=not much). Your own audit (`generate_variable_audit.py:90`)
> says the correct transform is **`(x−1)/2`**. The bug compresses that third trust item to the
> [0, 0.5] range. Correct = `clean_var(df,"V161217",1,3)` then `(t3−1)/2`.

**Headline survives.** Non-Rep broad-swing by trust tercile (Fig K / fn-7-2), POST weight:

| tercile | current (buggy) | corrected | live footnote |
|---|---|---|---|
| low-trust  | 53.3% | **53.3%** | 53.0% |
| mid-trust  | 23.2% | **22.4%** | 23.2% |
| high-trust |  9.8% | **10.2%** |  9.7% |

→ "System Critics defect at 53%, Believers ~10%" is unchanged.

**Figure I grievance split (fig-5c, hardcoded in JS) strengthens.** Dem-leaning two-party voters,
Dem→Trump rate split at median trust, POST + corrected:

| | legacy (PRE+buggy, hardcoded) | corrected (POST+fix) |
|---|---|---|
| all Dem-leaners | 7.8% (1 in 13) | **8.2% (≈1 in 12)** |
| low-grievance (high-trust) | 3.7% | **2.7% (≈1 in 37)** |
| high-grievance (low-trust) | 10.8% (1 in 9) | **13.3% (≈1 in 8)** |
| multiplier | "~3× / roughly triple" | **~5×** |

### Locations that cite the grievance numbers (all need the same restatement)
1. `web/js-v2/fig-5c-defection.js` L8–11 — the hardcoded `ROWS` (3.7 / 7.8 / 10.8 + "1 in 27/13/9").
2. §5 Figure I figcaption (L677–679) — "7.8% (about 1 in 13) … 3.7% … 10.8%, about 1 in 9".
3. §6 body (L687) — "**roughly triple**" → **~5× / roughly quintuple** (or keep "more than triple").
4. §5 fn-5-4 (L743–746) — "10.8% (1 in 9) vs 3.7% … ~3× multiplier".

### Open issues I could NOT cleanly resolve (need a decision)
- **Provenance gap:** Figure I's numbers are **hardcoded in JS with no backing data file**, and
  fn-5-4's grievance split isn't in `within_tent_bolt.json`. Recommend adding a
  `build_dem_lean_defection.py` → `data/clean/dem_lean_defection.json` so Figure I is data-driven
  and reproducible (closes the gap + lets the figure ↔ footnote ↔ body stay in sync).
- **Mixed constructions:** fn-7-1's "0.23/0.22" means and fn-7-2's Rep-side "5.0/12.1/20.3" terciles
  do **not** reproduce from the within-tent (buggy) index — they appear to use a *different* trust
  construction. A clean fix means recomputing the **entire §5–§7 trust set on one canonical method**
  (correct V161217, POST weight, stated denominators) and re-reading every number. I can do that and
  bring back the full recomputed table for approval before any prose changes.

---

## Recommended order
1. **Approve Bucket A** (label hygiene) — apply immediately, zero number risk.
2. **Approve Bucket B** (fn-5-4 PRE→POST share) — one number (2.28→2.68 / add 8.2%).
3. **Decide on Bucket C:** either (a) I fix `build_within_tent_bolt.py`, add the Figure I backing
   script, recompute the whole §5–§7 set on one method, and bring back every changed number for a
   second approval; or (b) log it and leave the figures as-is for now.
