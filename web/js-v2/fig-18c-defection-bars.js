// Fig 18c — The state-by-state arithmetic, visualized.
//
// Ports the v1 chartConsolidation. Per decisive state (WI / MI / PA):
// Trump's certified margin vs the Sanders→Trump defector bucket
// (CES 2016 vote-validated). The bucket exceeded the margin 2.7×–5.3×
// in every decisive state.
//
// The visual hits the §18 reframe at a glance: the defection numbers
// dwarf Trump's margins. Clinton didn't need to "do better." The
// arithmetic was always going to lose without those voters, and those
// voters were structurally never hers (Figure A).
//
// Data hardcoded (3 states × 2 bars × 2 numbers each) — comes from
// CES 2016 + state Certified Election Office results.
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_MARGIN = '#888'         // grey for Trump's margin (the unit being exceeded)
const COLOR_DEFECT = '#b8240f'      // red for the Sanders→Trump bucket

const STATES = [
  { st: 'Wisconsin',    margin:  22748, defect:  60960, pool: 567936, rate: 11, mult: '2.7×' },
  { st: 'Michigan',     margin:  10704, defect:  56208, pool: 595222, rate:  9, mult: '5.3×' },
  { st: 'Pennsylvania', margin:  44292, defect: 131432, pool: 731881, rate: 18, mult: '3.0×' },
]

export function drawDefectionBars(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 34, right: 30, bottom: 70, left: 130 }
  const rowH = 22, pairGap = 10, groupGap = 36
  const innerW = W - margin.left - margin.right
  const innerH = STATES.length * (2 * rowH + pairGap + groupGap) - groupGap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'db-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title/subtitle live in the HTML figure label + figcaption.

  // Legend
  const legY = 14
  svg.append('rect').attr('x', 0).attr('y', legY)
    .attr('width', 12).attr('height', 12).attr('fill', COLOR_MARGIN)
  svg.append('text').attr('x', 18).attr('y', legY + 10)
    .attr('font-size', '11.5px').attr('fill', '#444')
    .text('Trump’s certified margin')
  svg.append('rect').attr('x', 180).attr('y', legY)
    .attr('width', 12).attr('height', 12).attr('fill', COLOR_DEFECT)
  svg.append('text').attr('x', 198).attr('y', legY + 10)
    .attr('font-size', '11.5px').attr('fill', '#444')
    .text('Sanders→Trump defectors (CES vote-validated)')

  // Scales
  const maxVal = d3.max(STATES, s => s.defect) * 1.45
  const x = d3.scaleLinear().domain([0, maxVal]).range([0, innerW])
  const fmt = n => n.toLocaleString()

  let y = 0
  for (const s of STATES) {
    // State label
    g.append('text')
      .attr('x', -8).attr('y', y + rowH + 2).attr('text-anchor', 'end')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', '#1b1b1d')
      .text(s.st)

    // Margin bar (grey)
    g.append('rect')
      .attr('x', 0).attr('y', y)
      .attr('width', x(s.margin)).attr('height', rowH)
      .attr('fill', COLOR_MARGIN).attr('rx', 2)
    g.append('text')
      .attr('x', x(s.margin) + 6).attr('y', y + rowH - 6)
      .attr('font-size', '11px').attr('font-weight', '700').attr('fill', COLOR_MARGIN)
      .text(fmt(s.margin))

    // Defector bar (red)
    const y2 = y + rowH + pairGap
    g.append('rect')
      .attr('x', 0).attr('y', y2)
      .attr('width', x(s.defect)).attr('height', rowH)
      .attr('fill', COLOR_DEFECT).attr('rx', 2)
    g.append('text')
      .attr('x', x(s.defect) + 6).attr('y', y2 + rowH - 6)
      .attr('font-size', '11px').attr('font-weight', '700').attr('fill', COLOR_DEFECT)
      .text(`${fmt(s.defect)}  ·  ${s.mult} the margin`)

    // Rate annotation
    g.append('text')
      .attr('x', -8).attr('y', y + rowH + 20).attr('text-anchor', 'end')
      .attr('font-size', '10px').attr('fill', '#666').attr('font-style', 'italic')
      .text(`${s.rate}% of ${(s.pool / 1000).toFixed(0)}k Sanders primary voters`)

    y += 2 * rowH + pairGap + groupGap
  }

  // X axis
  g.append('g').attr('class', 'db-axis')
    .attr('transform', `translate(0, ${y - groupGap + 4})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d / 1000 + 'k').tickSizeOuter(0))

  // Footer
}
