// Fig 16b (v6 — SIMPLIFIED) — Honesty rating among swing-state Critics
// across 12 presidential cycles (1980-2024).
//
// What this chart shows (and ONLY this):
//   - Per cycle: how low-trust voters in that cycle's battleground states
//     rated the Dem (blue) and Rep (red) candidates on honesty.
//   - ✓ on whoever WON the swing states (majority of bgs).
//   - Trust regime context: era band shading (high-trust 1980-2004 right,
//     low-trust 2008+ left) and trust value per cycle colored by regime.
//
// What we REMOVED for clarity:
//   - Right Y axis + area chart of trust (moved to Figure D)
//   - "Rule branch" row (rule mechanics shown in figcaption text)
//   - Δturnout row (lives on Figure D)
//   - Inline "wash" labels (dashed connector + grey dots is enough)
//   - Sw≠EC / Sw≠PV tags (called out in figcaption)
//
// Data: scripts/build_candidate_honesty_by_trust.py
// Fields used: dem_low_trust_swing, rep_low_trust_swing, gap_swing, is_wash_swing
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_WASH = '#9a9a9a'

export function drawHonestyCrossover(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const cycles = data.cycles.map(c => ({
    ...c,
    dem_low_trust: c.dem_low_trust_swing,
    rep_low_trust: c.rep_low_trust_swing,
    gap:           c.gap_swing,
    is_wash:       c.is_wash_swing,
  }))

  const W = container.clientWidth || 680
  const margin = { top: 34, right: 20, bottom: 105, left: 60 }
  const innerW = W - margin.left - margin.right
  const innerH = 280
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'hc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title/subtitle live in the HTML figure label + figcaption.

  // Legend
  const legY = 16
  svg.append('circle').attr('cx', margin.left + 6).attr('cy', legY).attr('r', 5).attr('fill', COLOR_DEM)
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 16).attr('y', legY + 4).text('Dem candidate')
  svg.append('circle').attr('cx', margin.left + 130).attr('cy', legY).attr('r', 5).attr('fill', COLOR_REP)
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 140).attr('y', legY + 4).text('Rep candidate')
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 240).attr('y', legY + 4)
    .attr('fill', '#2e7d32').attr('font-weight', '700').text('✓ swing-state winner')
  svg.append('line').attr('x1', margin.left + 380).attr('x2', margin.left + 398)
    .attr('y1', legY).attr('y2', legY)
    .attr('stroke', COLOR_WASH).attr('stroke-width', 2).attr('stroke-dasharray', '3,3')
  svg.append('text').attr('class', 'hc-leg').attr('x', margin.left + 402).attr('y', legY + 4)
    .attr('fill', '#777').text('grey/dashed = wash (no clear pick)')

  // Era band shading
  const x = d3.scaleBand().domain(cycles.map(c => c.cycle)).range([0, innerW]).padding(0.18)
  const colW = x.bandwidth()
  const dotOffset = Math.min(10, colW * 0.28)
  const eraDividerCycle = 2008
  const eraDividerX = x(eraDividerCycle) - x.step() / 2 + x.bandwidth() / 2
  g.append('rect').attr('x', 0).attr('y', 0)
    .attr('width', eraDividerX).attr('height', innerH)
    .attr('fill', '#fbf3e3').attr('opacity', 0.45)
  g.append('rect').attr('x', eraDividerX).attr('y', 0)
    .attr('width', innerW - eraDividerX).attr('height', innerH)
    .attr('fill', '#e8efe6').attr('opacity', 0.45)
  // Era labels
  g.append('text')
    .attr('x', eraDividerX / 2).attr('y', 12).attr('text-anchor', 'middle')
    .attr('font-size', '10.5px').attr('font-weight', '700').attr('fill', '#a06400')
    .text('High-trust era (trust ≥ 0.41)')
  g.append('text')
    .attr('x', eraDividerX + (innerW - eraDividerX) / 2).attr('y', 12).attr('text-anchor', 'middle')
    .attr('font-size', '10.5px').attr('font-weight', '700').attr('fill', '#2a6a3a')
    .text('Low-trust era (trust < 0.41)')

  // Y scale
  const y = d3.scaleLinear().domain([0, 3]).range([innerH, 0])

  // Gridlines (subtle)
  g.append('g').attr('class', 'hc-grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(''))
    .selectAll('line').attr('stroke', '#e6e6e6')

  // Y axis
  g.append('g').attr('class', 'hc-axis')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => d.toFixed(1)).tickSizeOuter(0))
  svg.append('text').attr('class', 'hc-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Critics’ "is honest" rating (0–4)')
  g.append('text').attr('class', 'hc-axis-dir')
    .attr('x', -8).attr('y', y(2.9)).attr('text-anchor', 'end').text('↑ more honest')
  g.append('text').attr('class', 'hc-axis-dir')
    .attr('x', -8).attr('y', y(0.1)).attr('text-anchor', 'end').text('↓ less honest')

  // X axis (years)
  g.append('g').attr('class', 'hc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d => `'${String(d).slice(2)}`).tickSizeOuter(0))

  // Per-cycle dots, connector, winner ✓
  for (const c of cycles) {
    const cx = x(c.cycle) + colW / 2
    const xDem = cx - dotOffset
    const xRep = cx + dotOffset
    const isWash = !!c.is_wash

    // Connector (heavier and more dashed for wash cycles)
    g.append('line').attr('class', 'hc-gapline')
      .attr('x1', xDem).attr('x2', xRep)
      .attr('y1', y(c.dem_low_trust)).attr('y2', y(c.rep_low_trust))
      .attr('stroke', isWash ? COLOR_WASH : '#888')
      .attr('stroke-width', isWash ? 1.5 : 1.5)
      .attr('stroke-dasharray', isWash ? '5,4' : null)

    // Dots (hollow for wash, solid for clear)
    g.append('circle')
      .attr('cx', xDem).attr('cy', y(c.dem_low_trust)).attr('r', 6)
      .attr('fill', isWash ? '#fff' : COLOR_DEM)
      .attr('stroke', COLOR_DEM).attr('stroke-width', isWash ? 2 : 0)
    g.append('circle')
      .attr('cx', xRep).attr('cy', y(c.rep_low_trust)).attr('r', 6)
      .attr('fill', isWash ? '#fff' : COLOR_REP)
      .attr('stroke', COLOR_REP).attr('stroke-width', isWash ? 2 : 0)

    // ✓ on swing winner — heavily faded for wash cycles (signal is weak)
    const winnerIsDem = (c.swing_winner === c.dem_name)
    const wx = winnerIsDem ? xDem : xRep
    const wy = winnerIsDem ? y(c.dem_low_trust) : y(c.rep_low_trust)
    g.append('text').attr('class', 'hc-winner-check')
      .attr('x', wx).attr('y', wy - 11).attr('text-anchor', 'middle')
      .attr('fill', '#2e7d32').attr('font-weight', '700').attr('font-size', '15px')
      .attr('opacity', isWash ? 0.30 : 1)
      .text('✓')

    // Explicit "wash" label below the year axis (back, per user feedback)
    if (isWash) {
      g.append('text').attr('class', 'hc-wash-tag')
        .attr('x', cx).attr('y', innerH + 16).attr('text-anchor', 'middle')
        .attr('font-size', '10px').attr('font-weight', '700').attr('font-style', 'italic')
        .attr('fill', COLOR_WASH)
        .text('wash')
    }

    // WH-held row
    g.append('text').attr('class', 'hc-inpower-tag')
      .attr('x', cx).attr('y', innerH + 30).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', '#555')
      .text(c.inpower === 'D' ? 'D' : 'R')

    // Trust value (color-coded by regime)
    if (c.trust_mean != null) {
      const aboveFloor = c.trust_mean >= 0.41
      g.append('text')
        .attr('x', cx).attr('y', innerH + 50).attr('text-anchor', 'middle')
        .attr('font-size', '10.5px').attr('font-weight', '700')
        .attr('fill', aboveFloor ? '#a06400' : '#2a6a3a')
        .text(c.trust_mean.toFixed(2))
    }
  }

  // Row labels
  g.append('text')
    .attr('x', -8).attr('y', innerH + 30).attr('text-anchor', 'end')
    .attr('font-size', '10px').attr('fill', '#555').attr('font-style', 'italic')
    .text('held WH')
  g.append('text')
    .attr('x', -8).attr('y', innerH + 50).attr('text-anchor', 'end')
    .attr('font-size', '10px').attr('fill', '#555').attr('font-style', 'italic')
    .text('trust (floor=0.41)')

  // Era divider (vertical between 2004 and 2008)
  g.append('line')
    .attr('x1', eraDividerX).attr('x2', eraDividerX)
    .attr('y1', 0).attr('y2', innerH)
    .attr('stroke', '#a06400').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.6)

  // Footer
}
