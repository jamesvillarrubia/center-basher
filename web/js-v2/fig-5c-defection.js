// Fig 5c (Option C) — Trump defection rate among Dem-leaners by trust level.
//
// Data-driven from data/dem_lean_defection.json (scripts/build_dem_lean_defection.py):
// ANES 2016 weighted by V160102 (POST). "Dem-leaners" = V161158x ∈ {1,2,3} who voted.
// Trust = 3-item index (V161215/216/217, V161217 the codebook 1-3 item). High-grievance
// = below-median trust. Pass the fetched JSON object as the second argument.
import * as d3 from 'https://esm.sh/d3@7'

export function drawDefection(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  if (!data || !data.rows) throw new Error('drawDefection requires dem_lean_defection.json data')
  const ROWS = data.rows
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 14, right: 130, bottom: 50, left: 220 }
  const innerW = W - margin.left - margin.right
  const rowH = 36
  const rowGap = 12
  const innerH = ROWS.length * rowH + (ROWS.length - 1) * rowGap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'defection-chart')

  const x = d3.scaleLinear().domain([0, 15]).range([0, innerW])
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Background track for each row (full width, faint)
  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i]
    const y = i * (rowH + rowGap)
    g.append('rect').attr('class', 'defection-track')
      .attr('x', 0).attr('y', y).attr('width', innerW).attr('height', rowH)
    const wPx = x(r.pct)
    g.append('rect').attr('class', 'defection-bar')
      .attr('x', 0).attr('y', y).attr('width', wPx).attr('height', rowH)
    g.append('text').attr('class', 'defection-pct')
      .attr('x', wPx + 8).attr('y', y + rowH / 2 + 4)
      .text(`${r.pct.toFixed(1)}%`)
    g.append('text').attr('class', 'defection-inline')
      .attr('x', wPx + 8 + 50).attr('y', y + rowH / 2 + 4)
      .text(r.inline)
    svg.append('text').attr('class', 'defection-rowlabel')
      .attr('x', margin.left - 12).attr('y', margin.top + y + rowH / 2 + 4)
      .attr('text-anchor', 'end')
      .text(r.label)
  }

  // X-axis
  const axisY = innerH + 4
  g.append('g').attr('transform', `translate(0, ${axisY})`)
    .attr('class', 'defection-axis')
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSizeOuter(0))
  g.append('text').attr('class', 'defection-axis-title')
    .attr('x', innerW / 2).attr('y', axisY + 32)
    .attr('text-anchor', 'middle')
    .text('% of Dem-leaners who voted Trump in 2016')
}
