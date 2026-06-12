// Fig 16c — The baseline-regime scatter:
//   x = mean trust (0..0.55)
//   y = in-power party 2-party national PV share (40..60%)
// Each cycle is a dot, colored by in-power party, filled if in-power
// won EC, hollow if in-power lost EC. A heavy horizontal line at 50%
// marks the win/lose threshold.
//
// Background bands shade the two trust regimes:
//   - High-trust era (trust >= 0.41): pre-2008 cycles, baseline ~51-55
//   - Low-trust era (trust <  0.30): post-2008 cycles, baseline ~47-51
//   The gap between (0.30..0.41) is the transition zone.
//
// The visual headline: post-2008 cycles cluster TIGHTLY against the 50%
// line; pre-1996 cycles were spread across a much wider range.
//
// Data: web/data/candidate_honesty_by_trust.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_D = '#2c5b9c'
const COLOR_R = '#b8240f'
const BAND_HI = '#e8efe6'  // high-trust era band
const BAND_LO = '#fbe9e7'  // low-trust era band
const BAND_MID = '#f5f1e8'  // transition band

export function drawBaselineRegime(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const cycles = data.cycles.filter(c => c.in_power_2p_share != null && c.trust_mean != null)

  const W = container.clientWidth || 680
  const margin = { top: 90, right: 30, bottom: 70, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = 360
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'br-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title block
  svg.append('text').attr('class', 'br-title')
    .attr('x', 0).attr('y', 22)
    .text('The baseline shift: trust resets where 50% lives')
  svg.append('text').attr('class', 'br-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Each dot = one cycle. X = mean trust that cycle. Y = in-power party 2-party national PV share.')
  svg.append('text').attr('class', 'br-subtitle')
    .attr('x', 0).attr('y', 58)
    .text('Filled = in-power won EC. Hollow = in-power lost EC. Blue = D held; red = R held.')

  // Scales
  const x = d3.scaleLinear().domain([0.20, 0.55]).range([0, innerW])
  const y = d3.scaleLinear().domain([40, 62]).range([innerH, 0])

  // Era band shading
  g.append('rect').attr('x', x(0.41)).attr('y', 0)
    .attr('width', x(0.55) - x(0.41)).attr('height', innerH)
    .attr('fill', BAND_HI).attr('opacity', 0.55)
  g.append('rect').attr('x', x(0.30)).attr('y', 0)
    .attr('width', x(0.41) - x(0.30)).attr('height', innerH)
    .attr('fill', BAND_MID).attr('opacity', 0.55)
  g.append('rect').attr('x', x(0.20)).attr('y', 0)
    .attr('width', x(0.30) - x(0.20)).attr('height', innerH)
    .attr('fill', BAND_LO).attr('opacity', 0.55)

  // Era band labels
  g.append('text').attr('class', 'br-band-label')
    .attr('x', x(0.27)).attr('y', 14).attr('text-anchor', 'middle')
    .attr('fill', '#7a4232').attr('font-size', '11px').attr('font-weight', '700')
    .text('Low-trust regime')
  g.append('text').attr('class', 'br-band-label')
    .attr('x', x(0.27)).attr('y', 28).attr('text-anchor', 'middle')
    .attr('fill', '#7a4232').attr('font-size', '9.5px').attr('font-style', 'italic')
    .text('(baseline ~ 47–51%)')
  g.append('text').attr('class', 'br-band-label')
    .attr('x', x(0.355)).attr('y', 14).attr('text-anchor', 'middle')
    .attr('fill', '#666').attr('font-size', '11px').attr('font-weight', '600')
    .text('Transition')
  g.append('text').attr('class', 'br-band-label')
    .attr('x', x(0.48)).attr('y', 14).attr('text-anchor', 'middle')
    .attr('fill', '#3a6936').attr('font-size', '11px').attr('font-weight', '700')
    .text('High-trust regime')
  g.append('text').attr('class', 'br-band-label')
    .attr('x', x(0.48)).attr('y', 28).attr('text-anchor', 'middle')
    .attr('fill', '#3a6936').attr('font-size', '9.5px').attr('font-style', 'italic')
    .text('(baseline ~ 51–55%)')

  // 50% threshold line — heavy
  g.append('line').attr('class', 'br-threshold')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(50)).attr('y2', y(50))
    .attr('stroke', '#1b1b1d').attr('stroke-width', 2)
  g.append('text').attr('class', 'br-threshold-label')
    .attr('x', innerW - 4).attr('y', y(50) - 6).attr('text-anchor', 'end')
    .attr('font-size', '10.5px').attr('font-weight', '700').attr('fill', '#1b1b1d')
    .text('50% — win/lose threshold')

  // Axes
  g.append('g').attr('class', 'br-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('.2f')).tickSizeOuter(0))
  g.append('g').attr('class', 'br-axis')
    .call(d3.axisLeft(y).ticks(7).tickFormat(d => `${d}%`).tickSizeOuter(0))
  svg.append('text').attr('class', 'br-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 22).attr('text-anchor', 'middle')
    .text('mean trust composite (0 = none, 1 = full)')
  svg.append('text').attr('class', 'br-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('in-power party national 2-party PV share')

  // Per-cycle dots + labels
  for (const c of cycles) {
    const cx = x(c.trust_mean)
    const cy = y(c.in_power_2p_share)
    const inpowerColor = c.inpower === 'D' ? COLOR_D : COLOR_R
    const won = c.ec_winner === c.dem_name ? c.inpower === 'D' :
                c.ec_winner === c.rep_name ? c.inpower === 'R' : false

    g.append('circle').attr('class', 'br-dot')
      .attr('cx', cx).attr('cy', cy).attr('r', 7)
      .attr('fill', won ? inpowerColor : '#fff')
      .attr('stroke', inpowerColor).attr('stroke-width', 2)

    // Cycle label
    g.append('text').attr('class', 'br-dot-label')
      .attr('x', cx + 11).attr('y', cy + 3.5)
      .attr('font-size', '10.5px').attr('font-weight', '600')
      .attr('fill', '#1b1b1d')
      .text(`'${String(c.cycle).slice(2)}`)
  }

  // Footer
  svg.append('text').attr('class', 'br-foot')
    .attr('x', 0).attr('y', H - 4)
    .text('Trust composite: CDF VCF0604rev/0605/0609 (1980–2008); ANES standalone trustgov+social (2012); standalone do-right/run-for-all/waste (2016+). In-power 2-party share from CofE results.')
}
