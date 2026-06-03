// Fig 12a (Option A) — Per-treatment turnout lifts from Gerber-Green meta.
//
// Five interventions, ranked top to bottom by effect size. Policy/
// persuasion content at the bottom with 0pp; social-pressure mail at
// the top with +8.1pp. The "content vs contact" story shows in the
// visual gap.
import * as d3 from 'https://esm.sh/d3@7'

// Each row carries a short label + optional sub-line for the second
// row of text. Per-row color gives the contact tactics distinct
// identity instead of one undifferentiated green block.
const ROWS = [
  { name: 'Social-pressure mail',
    sub:  '"your neighbors are watching"',
    lift: 8.1, color: '#e85d28', kind: 'contact' },
  { name: 'Door-to-door canvassing',
    sub:  '',
    lift: 4.3, color: '#2e7d32', kind: 'contact' },
  { name: 'Volunteer phone calls',
    sub:  '',
    lift: 2.0, color: '#2c5b9c', kind: 'contact' },
  { name: 'Standard GOTV mail',
    sub:  'reminder postcards, no neighbor language',
    lift: 0.8, color: '#5b3a8e', kind: 'contact' },
  { name: 'Policy / persuasion content',
    sub:  'a flyer explaining your plan',
    lift: 0.0, color: '#bdb7a8', kind: 'content' },
]

export function drawGOTV(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 56, right: 60, bottom: 56, left: 220 }
  const innerW = W - margin.left - margin.right
  const rowH = 38
  const rowGap = 14
  const innerH = ROWS.length * rowH + (ROWS.length - 1) * rowGap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'gotv-chart')

  const x = d3.scaleLinear().domain([0, 9]).range([0, innerW])
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Headline
  svg.append('text').attr('class', 'gotv-title')
    .attr('x', margin.left).attr('y', 22)
    .text('What actually raises turnout')
  svg.append('text').attr('class', 'gotv-subtitle')
    .attr('x', margin.left).attr('y', 40)
    .text('Per-treatment percentage-point lift; Gerber-Green meta of randomized GOTV field experiments.')

  // Bars
  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i]
    const y = i * (rowH + rowGap)

    // Two-line row label using foreignObject so text wraps cleanly
    const labelGroup = svg.append('foreignObject')
      .attr('x', 0).attr('y', margin.top + y)
      .attr('width', margin.left - 12).attr('height', rowH)
      .append('xhtml:div')
      .attr('class', 'gotv-rowlabel-box')
    labelGroup.append('xhtml:p').attr('class', 'gotv-rowlabel-name').text(r.name)
    if (r.sub) {
      labelGroup.append('xhtml:p').attr('class', 'gotv-rowlabel-sub').text(r.sub)
    }

    const wPx = Math.max(x(r.lift), 1.5)
    g.append('rect').attr('class', 'gotv-bar')
      .attr('x', 0).attr('y', y).attr('width', wPx).attr('height', rowH)
      .attr('fill', r.color)

    g.append('text').attr('class', 'gotv-pct')
      .attr('x', wPx + 6).attr('y', y + rowH / 2 + 4)
      .text(`+${r.lift.toFixed(1)}pp`)
  }

  // Section divider between contact and content cells
  const divIdx = ROWS.findIndex(r => r.kind === 'content')
  const divY = divIdx * (rowH + rowGap) - rowGap / 2
  g.append('line').attr('class', 'gotv-divider')
    .attr('x1', -260).attr('x2', innerW + 70)
    .attr('y1', divY).attr('y2', divY)

  // X-axis
  const axisY = innerH + 4
  g.append('g').attr('transform', `translate(0, ${axisY})`)
    .attr('class', 'gotv-axis')
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `+${d}pp`).tickSizeOuter(0))
  g.append('text').attr('class', 'gotv-axis-title')
    .attr('x', innerW / 2).attr('y', axisY + 32).attr('text-anchor', 'middle')
    .text('average percentage-point increase in turnout')
}
