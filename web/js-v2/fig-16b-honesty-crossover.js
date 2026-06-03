// Fig 16b (Concept 2, v4) — Honesty rating among System Critics across
// 12 presidential cycles (1980-2024), with popular-vote winner marked.
//
// Pre-2016 cycles come from the ANES Cumulative File (VCF0354/VCF0355,
// 2012 backfilled from VCF0358/VCF0359, all rescaled to a 0-4 axis).
// 2016/2020/2024 come from the standalone files.
//
// We mark the POPULAR-VOTE winner with ✓ (not the EC winner). This
// gives the same total of 4 mismatches as EC-framing but swaps
// 2000 (Gore — Critics pick + PV winner, EC loser) into a hit and
// 2016 (Trump — Critics pick + EC winner, PV loser) into a miss.
// Cycles where EC ≠ PV are flagged with a small "EC≠PV" tag.
//
// Data: scripts/build_candidate_honesty_by_trust.py → candidate_honesty_by_trust.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_SPLIT = '#a06400'

export function drawHonestyCrossover(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const cycles = data.cycles
  const W = container.clientWidth || 680
  const margin = { top: 110, right: 24, bottom: 110, left: 60 }
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
    .text('Critics’ "is honest" rating per cycle — and who won')
  svg.append('text').attr('class', 'hc-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text('Mean rating from low-trust voters (bottom trust tercile that cycle), 0–4 axis.')
  svg.append('text').attr('class', 'hc-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text('✓ on the popular-vote winner. "EC≠PV" flags cycles where the EC split from the popular vote (2000, 2016).')

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
    .text('✓ = popular-vote winner')

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

    // Connecting line (gap)
    g.append('line').attr('class', 'hc-gapline')
      .attr('x1', xDem).attr('x2', xRep)
      .attr('y1', y(c.dem_low_trust)).attr('y2', y(c.rep_low_trust))

    // Dem dot
    g.append('circle').attr('class', 'hc-dot')
      .attr('cx', xDem).attr('cy', y(c.dem_low_trust)).attr('r', 6)
      .attr('fill', COLOR_DEM)
    // Rep dot
    g.append('circle').attr('class', 'hc-dot')
      .attr('cx', xRep).attr('cy', y(c.rep_low_trust)).attr('r', 6)
      .attr('fill', COLOR_REP)

    // Winner ✓ (popular-vote winner)
    const pvWinnerIsDem = (c.pv_winner === c.dem_name)
    const wx = pvWinnerIsDem ? xDem : xRep
    const wy = pvWinnerIsDem ? y(c.dem_low_trust) : y(c.rep_low_trust)
    g.append('text').attr('class', 'hc-winner-check')
      .attr('x', wx).attr('y', wy - 12).attr('text-anchor', 'middle')
      .text('✓')

    // EC ≠ PV tag (2000, 2016) — placed below in-power tag to avoid year ticks
    if (c.ec_winner !== c.pv_winner) {
      g.append('text').attr('class', 'hc-split-tag')
        .attr('x', cx).attr('y', innerH + 50).attr('text-anchor', 'middle')
        .attr('fill', COLOR_SPLIT).attr('font-weight', '700').attr('font-size', '10px')
        .text('EC≠PV')
    }

    // In-power tag below the cycle
    g.append('text').attr('class', 'hc-inpower-tag')
      .attr('x', cx).attr('y', innerH + 32).attr('text-anchor', 'middle')
      .text(c.inpower === 'D' ? 'D held WH' : 'R held WH')
  }

  // Footer note
  svg.append('text').attr('class', 'hc-foot')
    .attr('x', margin.left).attr('y', H - 4)
    .text('CDF VCF0354/0355 (1980–2008), ANES standalone files (2012–2024). Critics = bottom trust tercile that cycle.')
}
