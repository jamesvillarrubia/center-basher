// Fig 16b (Concept 1, v2) — The TRUST GAP between System Believers and
// System Critics in voting for the in-power party.
//
// Single signed line/bar showing (Believers' vote-share for in-power) -
// (Critics' vote-share for in-power) per cycle 1972-2024. Negative values
// = Believers more loyal to in-power than Critics (the §7 pattern).
// Positive values = Critics MORE loyal than Believers (anomalous /
// inverted). Zero = no trust polarization.
//
// Regions of interest:
//   • 1972-1992: high-trust era, big gaps, in-power party can still win
//     when Believers are numerous in absolute terms
//   • 1996-2024: low-trust era, gaps shrink because everyone is now
//     low-trust, but the SAME directional rule still costs in-power party
//   • 2004 and 2012 (yellow): in-power held the change lane and won
//   • 2000 (anomalous positive gap): Critics more loyal than Believers
//   • 2020 (zero gap): Trump as incumbent flattened the trust signal
//
// Data: scripts/build_vote_share_by_trust_band.py
import * as d3 from 'https://esm.sh/d3@7'

const COLOR = {
  GAP:       '#6b6b70',
  EXCEPTION: '#e9a52e',
  ANOMALY:   '#b8240f',
  AXIS:      '#1b1b1d',
}

// Popular vote share for the IN-POWER party's candidate (2-party + total
// adjusted, FEC certified results). Source: Wikipedia / FEC tabulations.
const POP_VOTE = {
  1972: 60.7, 1976: 48.0, 1980: 41.0, 1984: 58.8, 1988: 53.4, 1992: 37.4,
  1996: 49.2, 2000: 48.4, 2004: 50.7, 2008: 45.7, 2012: 51.1, 2016: 48.2,
  2020: 46.8, 2024: 48.3,
}

export function drawTrustBandsByCycle(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  // Compute gap = Believers' loyalty - Critics' loyalty (positive => Believers more loyal)
  const rows = data.cycles
    .filter(r => r.low_inpower_share !== null && r.high_inpower_share !== null)
    .map(r => ({
      cycle: r.cycle,
      gap:   r.high_inpower_share - r.low_inpower_share,
      believers: r.high_inpower_share,
      critics:   r.low_inpower_share,
      kept_change_lane: r.kept_change_lane,
      wh: r.wh_incumbent,
      popVote: POP_VOTE[r.cycle] ?? null,
    }))

  const W = container.clientWidth || 680
  const margin = { top: 110, right: 70, bottom: 70, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = 260
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'tb-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title block
  svg.append('text').attr('class', 'tb-title')
    .attr('x', 0).attr('y', 22)
    .text('The trust gap: Believers’ vs Critics’ loyalty to the in-power party')
  svg.append('text').attr('class', 'tb-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Each bar is the gap that cycle. Bars above the line = Believers more loyal (the §7 pattern, every cycle except 2000).')
  svg.append('text').attr('class', 'tb-subtitle')
    .attr('x', 0).attr('y', 58)
    .text('Yellow bars = in-power candidate kept the change lane and won. Red = anomalous inversion (Critics more loyal than Believers).')

  // Legend
  const legY = 78
  svg.append('rect').attr('x', margin.left).attr('y', legY)
    .attr('width', 14).attr('height', 10).attr('fill', COLOR.GAP)
  svg.append('text').attr('class', 'tb-leg').attr('x', margin.left + 20).attr('y', legY + 8)
    .text('Gap bar')
  svg.append('rect').attr('x', margin.left + 100).attr('y', legY)
    .attr('width', 14).attr('height', 10).attr('fill', COLOR.EXCEPTION)
  svg.append('text').attr('class', 'tb-leg').attr('x', margin.left + 120).attr('y', legY + 8)
    .text('Change-lane exception')
  svg.append('line').attr('x1', margin.left + 280).attr('x2', margin.left + 296)
    .attr('y1', legY + 5).attr('y2', legY + 5).attr('stroke', '#2c5b9c').attr('stroke-width', 2.5)
  svg.append('text').attr('class', 'tb-leg').attr('x', margin.left + 302).attr('y', legY + 8)
    .text('In-power popular-vote share (right axis)')

  // X scale (cycle)
  const x = d3.scaleBand().domain(rows.map(r => r.cycle)).range([0, innerW]).padding(0.18)
  // Y scale (gap in percentage points). Min around -10 (anomalies), max around 40.
  const yMax = 45
  const yMin = -10
  const y = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]).nice()
  const y0 = y(0)

  // Gridlines
  g.append('g').attr('class', 'tb-grid')
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(''))

  // Zero baseline (highlighted)
  g.append('line').attr('class', 'tb-axis-zero')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', y0).attr('y2', y0)
  g.append('text').attr('class', 'tb-axis-zero-label')
    .attr('x', -8).attr('y', y0 + 4).attr('text-anchor', 'end')
    .text('0pp')

  // Y axis
  g.append('g').attr('class', 'tb-axis')
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d > 0 ? '+' : ''}${d}pp`).tickSizeOuter(0))
  // X axis
  g.append('g').attr('class', 'tb-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d => `'${String(d).slice(2)}`).tickSizeOuter(0))

  // Y-axis title
  svg.append('text').attr('class', 'tb-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Believers’ in-power vote share − Critics’ (pp)')

  // Bars
  for (const r of rows) {
    const isException = r.kept_change_lane
    const isAnomaly = r.gap < 0
    const color = isException ? COLOR.EXCEPTION : (isAnomaly ? COLOR.ANOMALY : COLOR.GAP)
    const barX = x(r.cycle)
    const barW = x.bandwidth()
    const barY = r.gap >= 0 ? y(r.gap) : y0
    const barH = Math.abs(y(r.gap) - y0)

    g.append('rect').attr('class', 'tb-bar')
      .attr('x', barX).attr('y', barY)
      .attr('width', barW).attr('height', Math.max(barH, 1.5))
      .attr('fill', color)
      .attr('opacity', 0.92)

    // Value label above the bar
    const labelY = r.gap >= 0 ? barY - 4 : barY + barH + 12
    g.append('text').attr('class', 'tb-bar-val')
      .attr('x', barX + barW / 2).attr('y', labelY).attr('text-anchor', 'middle')
      .text(`${r.gap >= 0 ? '+' : ''}${r.gap.toFixed(0)}`)
  }

  // Region annotations — high-trust era vs low-trust era
  const earlyEnd = (x(1992) + x.bandwidth()) + x.step() / 2
  g.append('text').attr('class', 'tb-region-label')
    .attr('x', earlyEnd / 2 + 12).attr('y', -6).attr('text-anchor', 'middle')
    .text('High-trust era: big gaps, big polarization')
  g.append('text').attr('class', 'tb-region-label')
    .attr('x', earlyEnd + (innerW - earlyEnd) / 2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Low-trust era: gaps shrink, but same rule')
  // Divider
  g.append('line').attr('class', 'tb-region-divider')
    .attr('x1', earlyEnd).attr('x2', earlyEnd)
    .attr('y1', 0).attr('y2', innerH)

  // Secondary Y axis (right) — in-power popular-vote share
  const yPop = d3.scaleLinear().domain([30, 65]).range([innerH, 0])
  g.append('g').attr('class', 'tb-axis tb-axis-right')
    .attr('transform', `translate(${innerW}, 0)`)
    .call(d3.axisRight(yPop).ticks(5).tickFormat(d => `${d}%`).tickSizeOuter(0))
  svg.append('text').attr('class', 'tb-axis-title')
    .attr('transform', `translate(${W - 18}, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('in-power popular-vote share')

  // 50% reference line on the right axis
  g.append('line').attr('class', 'tb-50-line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', yPop(50)).attr('y2', yPop(50))
  g.append('text').attr('class', 'tb-50-label')
    .attr('x', innerW + 6).attr('y', yPop(50) + 3)
    .text('50%')

  // Popular-vote line + dots over the bars
  const lineGen = d3.line()
    .x(d => x(d.cycle) + x.bandwidth() / 2)
    .y(d => yPop(d.popVote))
    .defined(d => d.popVote !== null)
  g.append('path').attr('class', 'tb-popvote-line')
    .datum(rows).attr('d', lineGen)
  for (const r of rows) {
    if (r.popVote === null) continue
    g.append('circle').attr('class', 'tb-popvote-dot')
      .attr('cx', x(r.cycle) + x.bandwidth() / 2).attr('cy', yPop(r.popVote)).attr('r', 4)
  }
}
