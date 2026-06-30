# Proposal: Wikimedia image integration

**Branch:** claude/dazzling-maxwell-sSHUR
**Created:** 2026-06-30
**Status:** Direction approved (2026-06-30) — **historical-only, grayscale, inline + collected credits.** Candidate portraits dropped. Awaiting go to download + build.

## Locked decisions
- **Type:** historical / voting images only (no candidate portraits).
- **Treatment:** grayscale (most picks are B&W already).
- **Credits:** short inline credit under each image **and** a collected "Image credits" section.

## Core set (Phase 1 — 3 Part dividers)
| Part | Image | Commons / source | License |
|---|---|---|---|
| I · The myth of the center | Truman 1948 whistle-stop campaign (the electability upset) | NARA / Truman Library; Commons cat. "Harry S. Truman 1948 presidential campaign" | PD (US federal) |
| IV · The turnout | Woman Suffrage Procession, March 3 1913 | `File:Woman_Suffrage_Procession_1913_opening.jpg` | PD Mark 1.0 |
| V · The regime | Voting Rights Act signing, Aug 6 1965 (LBJ + MLK, photo by Y. Okamoto) | LBJ Library / NARA / Commons | PD (US federal) |

Exact Commons filenames for the Truman and VRA images get confirmed at download.
Optional later: Part II ("Winning is hard") and Part VI ("The payoff").

## Objective
Add a sparse, purposeful layer of photographic images (candidates, voting,
historical) sourced from Wikimedia Commons, without diluting the essay's
data-first credibility. Every image earns its place the way a figure does.

## Principles
- **Sparse and load-bearing.** The D3 figures are the stars. Photos anchor a
  beat or a Part; they are not decorative filler.
- **Self-host everything.** Download from Commons, optimize, commit to the repo,
  serve locally. Never hotlink Commons (breaks, and is poor etiquette).
- **Consistent treatment.** One visual system: uniform widths, optional
  grayscale/duotone so portraits don't clash with the colored charts, a caption
  + credit line on each.
- **Accessibility.** Meaningful `alt` text on every image.
- **Attribution always**, even for public domain (courtesy + provenance). A
  single "Image credits" section collects title · author · source · license.

## License policy
- **Prefer PD (US-government works) and CC0.** These cover nearly all of the
  candidate portraits and federal buildings.
- **CC-BY / CC-BY-SA** acceptable *with* attribution (BY-SA also obliges
  share-alike on the image, not the whole page — fine).
- **Avoid NC and ND.** The site runs a Substack signup + analytics, so treat it
  as commercial-adjacent (rules out NC); ND would forbid cropping/grayscale.
- **Re-verify each file's license at integration** — Commons tags can change.

## Placement map

### Candidates — official PD portraits, small inline, at their beats
| Section | Figure | Commons file (verified ✓ / to confirm) | License |
|---|---|---|---|
| §18 (2016) | Hillary Clinton | official Secretary of State portrait (confirm) | PD (State Dept) |
| §18 (2016) | Bernie Sanders | `File:Bernie_Sanders.jpg` ✓ | PD (US Senate) |
| §18/§19 | Donald Trump | `File:Donald_Trump_official_portrait.jpg` ✓ (2017) | PD (White House) |
| §19 (2024) | Kamala Harris | `File:Kamala_Harris_1448x1448.jpg` ✓ (CC0) or VP portrait | CC0 / PD |
| §21 (2020) | Joe Biden | official presidential portrait 2021 (confirm) | PD (White House) |
| §21 (2020) | Pete Buttigieg | official DOT Secretary portrait (confirm) | PD |
| §21 (2020) | Amy Klobuchar | official Senate portrait (confirm) | PD (US Senate) |
| §21 (2020) | Elizabeth Warren | official Senate portrait (confirm) | PD (US Senate) |
| §21 (2020) | Jim Clyburn | official House portrait (confirm) | PD (US House) |

Treatment idea for §21: a small left-to-right "cast" strip (Buttigieg ·
Klobuchar → Biden, with Warren held apart) that literally pictures the
consolidation the paragraph describes.

### Voting / historical — Part dividers and thematic anchors
| Spot | Image | Source | License |
|---|---|---|---|
| §0 (institutionally adrift / birthright) | U.S. Supreme Court Building | Commons (PD/CC) | PD or CC-BY |
| Part divider | Voting Rights Act of 1965 signing (LBJ) | `Category:Voting_Rights_Act_of_1965` | PD (federal) |
| Part divider | Voter line / registration drive | `Category:Voting_lines_in_the_United_States` or LoC/NARA on Commons | PD |
| §15/§18 realignment | period campaign/voting image | Commons/LoC | PD |

For genuine 1960s voter-registration / Selma imagery the richest PD troves are
the **Library of Congress** and **NARA** collections (many already mirrored on
Commons) — confirm the specific file and its Commons license at integration.

## Technical integration
- **Directory:** `web/assets/img/` (portraits in `…/people/`, scenes in
  `…/historical/`).
- **Pipeline:** download original → resize to ≤1600px wide → export `.webp`
  (+ `.jpg` fallback) → commit. Keep each file < ~200 KB after optimization.
- **Markup:** reuse the existing `<figure class="fig">` / `<figcaption>`
  pattern; portraits get a lighter `.portrait` class. `loading="lazy"` on all.
- **CSS:** one shared system — `.essay-img`, `.portrait`, `.part-image`;
  optional `filter: grayscale(1)` for cohesion; fully responsive; respects the
  ~680px content column.
- **Credits:** a new collapsible `<details class="howweknow"><summary>Image
  credits</summary>` block near the end, one line per image. No new numbered
  footnotes (avoids a renumber).

## Phasing
1. **Candidates** at §18–§22 (clearest wins, all PD).
2. **1–2 historical/voting** Part-divider images.
3. **§0 institutional** image (SCOTUS/Capitol).

Ship and review Phase 1 before committing to 2–3.

## Risks / notes
- **Page weight** — optimize + lazy-load; self-hosting adds repo binaries
  (acceptable, kept small).
- **Personality-rights** warnings on a few files (e.g., Harris VP portrait):
  fine for editorial commentary (this is commentary, not endorsement or a
  commercial product), but noted.
- **Tone risk** — keep it sparse; if it starts feeling like a news article,
  pull back.

## Open decisions (need your call)
1. **Visual treatment:** grayscale/duotone (recommended, for cohesion with the
   colored charts) vs full color?
2. **Density:** candidates only, or candidates + historical Part dividers?
3. **Credits:** inline caption credit, one collected "Image credits" section,
   or both (recommended: short inline credit + a collected section)?
