// Fig 16b (v5 — SWING STATE FILTER) — Honesty rating among System
// Critics WHO LIVE IN SWING STATES, across 12 presidential cycles
// (1980-2024). Filters out the highly partisan states (CA, TX, NY, WY,
// etc.) where campaigns don't compete and Critics' honesty ratings are
// largely baked-in partisan reflex.
//
// Swing-state set (consistent across cycles): PA, MI, WI, OH, FL, NC,
// AZ, GA, NV. Anachronistic for the 1980s (Reagan-era battlegrounds
// included IL/NJ/MO) but defensible for the modern era; documented in
// the figcaption.
//
// Same chart mechanics as the national version: ✓ on popular-vote
// winner; "EC≠PV" tag for 2000 and 2016. Per-cycle sample sizes shown
// in the data JSON (n_swing field) — ranges from 73 (2004) to 859 (2020).
//
// Data: scripts/build_candidate_honesty_by_trust.py → candidate_honesty_by_trust.json
// Fields used: dem_low_trust_swing, rep_low_trust_swing, gap_swing, is_wash_swing
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_SPLIT = '#a06400'
const COLOR_WASH = '#9a9a9a'

export function drawHonestyCrossover(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  // Pull swing-state values; cycles missing swing data fall back to null
  // so they render with the "n/a" marker.
  const cycles = data.cycles.map(c => ({
    ...c,
    dem_low_trust: c.dem_low_trust_swing,
    rep_low_trust: c.rep_low_trust_swing,
    gap:           c.gap_swing,
    is_wash:       c.is_wash_swing,
  }))
  // eslint-disable-next-line no-console
  console.log('[fig-16b] swing values:', cycles.map(c => ({
    cycle: c.cycle, d: c.dem_low_trust, r: c.rep_low_trust, gap: c.gap, wash: c.is_wash
  })))
  const W = container.clientWidth || 680
  const margin = { top: 110, right: 24, bottom: 150, left: 90 }
  const innerW = W - margin.left - margin.right
  const innerH = 280
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'hc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title block
  svg.append('text').attr('class', 'hc-title')
    .attr('x', margin.left).attr('y', 22)
    .text('Swing-state Critics’ "is honest" rating per cycle')
  svg.append('text').attr('class', 'hc-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text('Low-trust voters in each cycle’s actual battleground states only — the voters campaigns actually fight for.')
  svg.append('text').attr('class', 'hc-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text('✓ on the SWING-STATE winner (Big-5 D-share ≥ 50%). Grey/dashed = "wash" (|gap| < 0.2).')

  // Legend
  const legY = 78
  svg.append('circle').attr('cx', margin.left + 6).attr('cy', legY + 4).attr('r', 5).attr('fill', COLOR_DEM)
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 16).attr('y', legY + 8)
    .text('Dem candidate')
  svg.append('circle').attr('cx', margin.left + 130).attr('cy', legY + 4).attr('r', 5).attr('fill', COLOR_REP)
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 140).attr('y', legY + 8)
    .text('Rep candidate')
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 240).attr('y', legY + 8)
    .attr('fill', '#2e7d32').attr('font-weight', '700')
    .text('✓ = swing-state winner')

  // X scale (cycle as band)
  const x = d3.scaleBand().domain(cycles.map(c => c.cycle)).range([0, innerW]).padding(0.2)
  const colW = x.bandwidth()
  const dotOffset = Math.min(10, colW * 0.25)

  // Y scale
  const y = d3.scaleLinear().domain([0, 3]).range([innerH, 0])

  // Gridlines
  g.append('g').attr('class', 'hc-grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(''))

  // Y axis
  g.append('g').attr('class', 'hc-axis')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => d.toFixed(1)).tickSizeOuter(0))
  svg.append('text').attr('class', 'hc-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Critics’ "is honest" rating (0–4)')
  // Direction labels
  g.append('text').attr('class', 'hc-axis-dir')
    .attr('x', -8).attr('y', y(2.85)).attr('text-anchor', 'end')
    .text('↑ more honest')
  g.append('text').attr('class', 'hc-axis-dir')
    .attr('x', -8).attr('y', y(0.15)).attr('text-anchor', 'end')
    .text('↓ less honest')

  // X axis (years)
  g.append('g').attr('class', 'hc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d => `'${String(d).slice(2)}`).tickSizeOuter(0))

  // Per cycle: draw two dots + connecting line + winner ✓
  for (const c of cycles) {
    const cx = x(c.cycle) + colW / 2
    const xDem = cx - dotOffset
    const xRep = cx + dotOffset
    const isWash = !!c.is_wash

    // Connecting line (gap) — dashed for wash
    const line = g.append('line').attr('class', 'hc-gapline')
      .attr('x1', xDem).attr('x2', xRep)
      .attr('y1', y(c.dem_low_trust)).attr('y2', y(c.rep_low_trust))
    if (isWash) line.attr('stroke-dasharray', '3,3').attr('stroke', COLOR_WASH)

    // Dem dot
    g.append('circle').attr('class', 'hc-dot')
      .attr('cx', xDem).attr('cy', y(c.dem_low_trust)).attr('r', 6)
      .attr('fill', isWash ? COLOR_WASH : COLOR_DEM)
      .attr('stroke', isWash ? COLOR_DEM : 'none').attr('stroke-width', isWash ? 1.5 : 0)
    // Rep dot
    g.append('circle').attr('class', 'hc-dot')
      .attr('cx', xRep).attr('cy', y(c.rep_low_trust)).attr('r', 6)
      .attr('fill', isWash ? COLOR_WASH : COLOR_REP)
      .attr('stroke', isWash ? COLOR_REP : 'none').attr('stroke-width', isWash ? 1.5 : 0)

    // Winner ✓ (SWING-STATE winner — D won Big 5 ≥ 50% D-share).
    // Consistent with the Critics subset: swing-state Critics' pick is
    // checked against swing-state outcome, not national PV.
    const winnerIsDem = (c.swing_winner === c.dem_name)
    const wx = winnerIsDem ? xDem : xRep
    const wy = winnerIsDem ? y(c.dem_low_trust) : y(c.rep_low_trust)
    g.append('text').attr('class', 'hc-winner-check')
      .attr('x', wx).attr('y', wy - 12).attr('text-anchor', 'middle')
      .attr('opacity', isWash ? 0.35 : 1)
      .text('✓')

    // Flag cycles where Swing winner diverged from EC OR national PV
    const tags = []
    if (c.swing_winner !== c.ec_winner) tags.push('Sw≠EC')
    if (c.swing_winner !== c.pv_winner) tags.push('Sw≠PV')
    if (tags.length) {
      g.append('text').attr('class', 'hc-split-tag')
        .attr('x', cx).attr('y', innerH + 50).attr('text-anchor', 'middle')
        .attr('fill', COLOR_SPLIT).attr('font-weight', '700').attr('font-size', '9px')
        .text(tags.join(' '))
    }

    // "wash" tag for low-gap cycles
    if (isWash) {
      g.append('text').attr('class', 'hc-wash-tag')
        .attr('x', cx).attr('y', innerH + 50).attr('text-anchor', 'middle')
        .attr('fill', COLOR_WASH).attr('font-weight', '700').attr('font-size', '10px')
        .attr('font-style', 'italic')
        .text('wash')
    }

    // In-power tag below the cycle
    g.append('text').attr('class', 'hc-inpower-tag')
      .attr('x', cx).attr('y', innerH + 32).attr('text-anchor', 'middle')
      .text(c.inpower === 'D' ? 'D held WH' : 'R held WH')

    // Trust mean
    if (c.trust_mean != null) {
      g.append('text').attr('class', 'hc-trust-tag')
        .attr('x', cx).attr('y', innerH + 68).attr('text-anchor', 'middle')
        .attr('font-size', '9.5px').attr('fill', '#555')
        .text(c.trust_mean.toFixed(2))
    }

    // Turnout delta (with surge highlight)
    if (c.turnout_delta != null) {
      const isSurge = c.turnout_surge
      const sign = c.turnout_delta >= 0 ? '+' : ''
      g.append('text').attr('class', 'hc-todelta-tag')
        .attr('x', cx).attr('y', innerH + 84).attr('text-anchor', 'middle')
        .attr('font-size', '9.5px')
        .attr('font-weight', isSurge ? '700' : '400')
        .attr('fill', isSurge ? '#b8240f' : '#555')
        .text(`${sign}${c.turnout_delta.toFixed(1)}`)
    }
  }
  // Row labels
  g.append('text')
    .attr('x', -8).attr('y', innerH + 68).attr('text-anchor', 'end')
    .attr('font-size', '9.5px').attr('fill', '#555').attr('font-style', 'italic')
    .text('mean trust (0–1)')
  g.append('text')
    .attr('x', -8).attr('y', innerH + 84).attr('text-anchor', 'end')
    .attr('font-size', '9.5px').attr('fill', '#555').attr('font-style', 'italic')
    .text('Δ turnout (pp)')

  // Footer note
  svg.append('text').attr('class', 'hc-foot')
    .attr('x', margin.left).attr('y', H - 4)
    .text('Cycle-specific battlegrounds (5–11 states per cycle, pre-election toss-up consensus). Winner = majority of bg states won. Sample sizes 48–751.')
}
