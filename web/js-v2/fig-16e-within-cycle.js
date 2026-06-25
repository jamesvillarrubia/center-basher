// Fig 16e — Within-cycle FT-gap movement, 2020 Sep → 2020 Nov.
//
// Each dot is one VSG panel respondent. X = their Sep gap, Y = their Nov gap.
// The diagonal y=x is "no change." Dispersion off the diagonal = individual
// movement. The CENTROID barely moves — that's the symmetry.
//
// Key visual claims:
//   1. Huge cloud of dots scattered far from the diagonal (individuals move)
//   2. The cloud is SYMMETRIC about the diagonal (skewness ≈ 0)
//   3. The Sep- and Nov-mean lines are within ~1pt of each other
//   4. Quadrant counts: D-stay, R-stay, R→D flippers, D→R flippers
//      The flipper counts are tiny AND nearly equal.
//
// Data: scripts/build_within_cycle_movement.py
import * as d3 from 'https://esm.sh/d3@7'

// Color BY DIRECTION OF MOVEMENT (matches Figure F).
// Above diagonal = moved toward Biden. Below = moved toward Trump.
// Exactly on diagonal = didn't change.
const C_D = '#2c5b9c'   // above-diagonal movers
const C_R = '#b8240f'   // below-diagonal movers
const C_NO = '#666'     // on-diagonal stays

export function drawWithinCycle(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = 680
  const margin = { top: 100, right: 30, bottom: 90, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 480)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'wc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const all = data.respondents
  const stats = data.stats_all
  const swStats = data.stats_swing
  const lift = data.predictive_lift

  // Title block
  svg.append('text').attr('class', 'wc-title')
    .attr('x', 0).attr('y', 22)
    .text('Within-cycle FT-gap movement, Sep → Nov 2020')
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', 0).attr('y', 42)
    .text(`Most people MOVED. D-shifts and R-shifts cancel — so the centroid stays on the diagonal.`)
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', 0).attr('y', 58)
    .text(`n = ${all.length.toLocaleString()}. Net shift ${stats.mean_shift > 0 ? '+' : ''}${stats.mean_shift}pt on 200-pt scale. Skewness ${stats.skewness}.`)
  // Tally row
  svg.append('text')
    .attr('x', 0).attr('y', 78)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', C_D)
    .text(`${stats.pct_dlean_shift}% moved toward Biden`)
  svg.append('text')
    .attr('x', margin.left + 180).attr('y', 78)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', C_R)
    .text(`${stats.pct_rlean_shift}% moved toward Trump`)
  svg.append('text')
    .attr('x', margin.left + 360).attr('y', 78)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', C_NO)
    .text(`${(100 - stats.pct_dlean_shift - stats.pct_rlean_shift).toFixed(1)}% didn't change`)

  // Scales
  const x = d3.scaleLinear().domain([-100, 100]).range([0, innerW])
  const y = d3.scaleLinear().domain([-100, 100]).range([innerH, 0])

  // Triangle tints by movement direction (matches Figure F)
  g.append('polygon')
    .attr('points', `${x(-100)},${y(-100)} ${x(100)},${y(100)} ${x(-100)},${y(100)}`)
    .attr('fill', C_D).attr('opacity', 0.06)
  g.append('polygon')
    .attr('points', `${x(-100)},${y(-100)} ${x(100)},${y(100)} ${x(100)},${y(-100)}`)
    .attr('fill', C_R).attr('opacity', 0.06)

  // Gridlines + axes (zero lines emphasized)
  g.append('g').attr('class', 'wc-grid')
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(''))
    .selectAll('line').attr('stroke', '#e6e6e6')
  g.append('g').attr('class', 'wc-grid')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-innerH).tickFormat(''))
    .selectAll('line').attr('stroke', '#e6e6e6')
  g.append('line').attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', innerH)
    .attr('stroke', '#888').attr('stroke-width', 1)
  g.append('line').attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', '#888').attr('stroke-width', 1)

  // y = x diagonal (no-change line)
  g.append('line').attr('class', 'wc-diagonal')
    .attr('x1', x(-100)).attr('x2', x(100))
    .attr('y1', y(-100)).attr('y2', y(100))
    .attr('stroke', '#1b1b1d').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.7)
  g.append('text')
    .attr('x', x(70)).attr('y', y(80))
    .attr('font-size', '10.5px').attr('font-style', 'italic').attr('fill', '#444')
    .text('y = x  (no change)')

  // Triangle labels (movement direction)
  g.append('text')
    .attr('x', x(-65)).attr('y', y(85)).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', C_D)
    .attr('opacity', 0.65).text('moved toward Biden')
  g.append('text')
    .attr('x', x(65)).attr('y', y(-85)).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', C_R)
    .attr('opacity', 0.65).text('moved toward Trump')

  // Dots colored by DIRECTION OF MOVEMENT (matches Figure F).
  // Above diagonal (n > s) = blue (D-direction).
  // Below diagonal (n < s) = red (R-direction).
  // On diagonal (n == s) = grey.
  const jitter = () => (Math.random() - 0.5) * 1.2
  for (const r of all) {
    const color = r.n > r.s ? C_D : r.n < r.s ? C_R : C_NO
    g.append('circle')
      .attr('cx', x(r.s + jitter())).attr('cy', y(r.n + jitter()))
      .attr('r', 1.6).attr('fill', color).attr('opacity', 0.4)
  }

  // Centroid markers — Sep mean → Nov mean (the population-level shift)
  const cxSep = x(stats.mean_sep)
  const cySep = y(stats.mean_sep)  // place Sep centroid on diagonal
  const cxAvg = x(stats.mean_sep)
  const cyAvg = y(stats.mean_nov)
  g.append('circle').attr('cx', cxAvg).attr('cy', cyAvg).attr('r', 8)
    .attr('fill', '#fff').attr('stroke', '#000').attr('stroke-width', 2.5)
  g.append('text')
    .attr('x', cxAvg + 14).attr('y', cyAvg + 4)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#000')
    .text(`mean: (${stats.mean_sep}, ${stats.mean_nov})  net shift ${stats.mean_shift > 0 ? '+' : ''}${stats.mean_shift}`)

  // Axes
  g.append('g').attr('class', 'wc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0))
  g.append('g').attr('class', 'wc-axis')
    .call(d3.axisLeft(y).ticks(7).tickSizeOuter(0))

  svg.append('text').attr('class', 'wc-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 40).attr('text-anchor', 'middle')
    .text('Sep 2020 FT gap (Dem − Rep)')
  svg.append('text').attr('class', 'wc-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Nov 2020 FT gap (Dem − Rep)')

  // Predictive-lift footer note (no separate legend — colors documented in subtitle/figcaption)
  svg.append('text').attr('x', 0).attr('y', 98).attr('font-size', '10.5px').attr('fill', '#444')
    .text(`Sep gap predicts vote ${lift.sep_predicts_vote_pct}% · Nov gap ${lift.nov_predicts_vote_pct}% · lift +${(lift.nov_predicts_vote_pct - lift.sep_predicts_vote_pct).toFixed(1)}pp`)

  // Footer
  svg.append('text').attr('class', 'wc-foot')
    .attr('x', 0).attr('y', H - 4)
    .text(`Source: VSG panel, Sep & Nov 2020 waves (same respondents). Symmetric distribution off the y=x diagonal → ${stats.pct_dlean_shift}% shifted toward D, ${stats.pct_rlean_shift}% toward R.`)
}
