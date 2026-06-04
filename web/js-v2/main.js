// Center-basher v2 — section-by-section
import { drawTrustByCohort } from './fig-0-cohort.js'
import { drawOverlapMatrix } from './fig-1-overlap.js'
import { drawHundredVoters } from './fig-2-waffle.js'
import { drawCrossCycleConsistency } from './fig-3-consistency.js'
import { drawSwingSpectrum } from './fig-3b-swing-spectrum.js'
import { drawDefection } from './fig-5c-defection.js'
import { drawLoyalty } from './fig-7-loyalty.js'
import { drawPerceptionPanels } from './fig-8a-perception-panels.js'
import { drawCycleCards } from './fig-9c-cycle-cards.js'
import { drawTrustFork } from './fig-10-fork.js'
import { drawSwitchCoefficients } from './fig-11a-coefficients.js'
import { drawRRTimeline } from './fig-11b-rr-over-time.js'
import { drawMechanism } from './fig-11c-mechanism.js'
import { drawGOTV } from './fig-12a-gotv-bars.js'
import { drawCareGap } from './fig-13a-care-gap.js'
import { drawTurnoutCoef } from './fig-13c-coefficients.js'
import { drawTypologyOverTime } from './fig-14a-typology-over-time.js'
import { drawTrustVoteCycles } from './fig-15a-trust-vote-cycles.js'
import { drawChangeLaneScoreboard } from './fig-16a-scoreboard.js'
import { drawEconPuzzle } from './fig-16b-econ-puzzle.js'
import { drawTrustBandsByCycle } from './fig-16b-trust-bands.js'
import { drawHonestyCrossover } from './fig-16b-honesty-crossover.js'
import { drawSwitcherGap } from './fig-16c-switcher-gap.js'
import { drawBaselineRegime } from './fig-16c-baseline-regime.js'
import { drawTrustTurnout } from './fig-16d-trust-turnout.js'
import { drawWithinCycle } from './fig-16e-within-cycle.js'
import { drawNationscapePanel } from './fig-16f-nationscape-panel.js'
import { drawWeeklyTrajectory } from './fig-16g-weekly-trajectory.js'
import { drawSwitcherCohort } from './fig-17a-switcher-cohort.js'

async function init() {
  // §0 — trust by cohort
  const cohort = await (await fetch('data/trust_by_cohort.json')).json()
  drawTrustByCohort('#fig-0-svg', cohort)

  // §1 — three-group overlap matrix
  const overlap = await (await fetch('data/center_overlap_matrix.json')).json()
  drawOverlapMatrix('#fig-1-svg', overlap)

  // §2 — 100-voter waffle (counts hard-coded in fig-2-waffle.js from ANES 2016)
  drawHundredVoters('#fig-2-svg')

  // §3 — cross-cycle vote consistency by self-ID (VSG panel 2012/2016/2020)
  const consistency = await (await fetch('data/cross_cycle_consistency.json')).json()
  drawCrossCycleConsistency('#fig-3-svg', consistency)

  // §3b — swing voters distributed across the 7-pt lib-con scale (ANES 2016 defectors)
  const spectrum = await (await fetch('data/swing_spectrum.json')).json()
  drawSwingSpectrum('#fig-3b-svg', spectrum)

  // §4 — pure typographic comparison cards (Option B); no JS chart needed.

  // §5 — three options to choose from
  drawDefection('#fig-5c-svg')

  // §6 — pure typographic K&B card; no JS chart needed.

  // §7 — loyalty rate by trust level, two panels (plain-language redesign)
  drawLoyalty('#fig-7-target')

  // §8 — perception panels (matches §7 structure)
  drawPerceptionPanels('#fig-8a-target')

  // §9 — cycle cards with on/off pills
  drawCycleCards('#fig-9c-target')

  // §10 — single trust-fork visual: same act, opposite read
  drawTrustFork('#fig-10-target')

  // §11 — three options to choose from
  drawSwitchCoefficients('#fig-11a-svg')
  drawRRTimeline('#fig-11b-svg')
  drawMechanism('#fig-11c-target')

  // §12 — ranked turnout-lift bars (per intervention)
  drawGOTV('#fig-12a-svg')

  // §13 — care-gap chart + standardized-coefficient race.
  // (Dropped the warmth/spread quintile chart because the pattern doesn't
  // hold up under multi-cycle pooling; the §13 prose now leans on the
  // coefficient model + care-gap.)
  drawCareGap('#fig-13a-svg')
  drawTurnoutCoef('#fig-13c-svg')

  // §14 — cross-cycle no-show typology trend
  drawTypologyOverTime('#fig-14a-svg')

  // §15 — per-cycle trust→vote coefficient bar chart
  drawTrustVoteCycles('#fig-15a-svg')

  // §16 — change-lane scoreboard + honesty crossover (Figure B Concept 1 trust-bands hidden per user feedback)
  drawChangeLaneScoreboard('#fig-16a-target')
  const hcData = await (await fetch(`data/candidate_honesty_by_trust.json?cyclebg=v3&t=${Date.now()}`, {cache: 'no-store'})).json()
  drawHonestyCrossover('#fig-16b2-svg', hcData)
  // Baseline-regime scatter (reuses same JSON)
  drawBaselineRegime('#fig-16c-svg', hcData)
  // Swing-state trust × turnout scatter
  const ttData = await (await fetch(`data/swing_trust_turnout.json?v=${Date.now()}`, {cache: 'no-store'})).json()
  drawTrustTurnout('#fig-16d-svg', ttData)
  // Within-cycle FT-gap movement (VSG panel 2020 Sep→Nov)
  const wcData = await (await fetch(`data/within_cycle_movement_2020.json?v=${Date.now()}`, {cache: 'no-store'})).json()
  drawWithinCycle('#fig-16e-svg', wcData)

  // §17 — Switcher cohort gap (VSG panel)
  const scData = await (await fetch(`data/switcher_cohort_vsg.json?v=${Date.now()}`, {cache: 'no-store'})).json()
  drawSwitcherCohort('#fig-17a-svg', scData)
  // Cross-validation: Nationscape Apr→Jul panel
  const nsPanel = await (await fetch(`data/nationscape_panel_april_july_2020.json?v=${Date.now()}`, {cache: 'no-store'})).json()
  drawNationscapePanel('#fig-16f-svg', nsPanel)
  // Weekly aggregate trajectory — 3-cycle 538 polling averages
  const wtData = await (await fetch(`data/poll_trajectory_multi.json?v=${Date.now()}`, {cache: 'no-store'})).json()
  drawWeeklyTrajectory('#fig-16g-svg', wtData)
}

init().catch(err => {
  console.error(err)
  const target = document.querySelector('#fig-0-svg') || document.body
  target.innerHTML =
    `<pre style="color:#b8240f;padding:1rem;border:1px solid #b8240f;border-radius:6px">Init failed: ${err.message}</pre>`
})
