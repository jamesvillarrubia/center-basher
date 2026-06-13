// Fig 11a (Option A) — Coefficient race: what predicts Obama→Trump switching.
//
// Standardized weighted logistic from the VSG panel. Pre-treatment
// racial-resentment items (measured 2011, four years before the vote)
// dominate the model; trust is essentially zero once controls go in.
//
// Numbers from §11 footnote [2], "full model" row.
import * as d3 from 'https://esm.sh/d3@7'

// Each row's coefficient is shown in the "more switching" direction.
// The trust item is relabeled "Distrust" with its sign flipped so all
// five bars point the same way and the comparison reads cleanly.
const ROWS = [
  { name: 'Conservative ideology (2016)',     coef: 1.00, color: '#5b3a8e' },
  { name: 'Racial resentment (2011)',         coef: 0.66, color: '#b8240f' },
  { name: 'Republican party ID (2012)',       coef: 0.37, color: '#2c5b9c' },
  { name: 'Negative economic outlook (2016)', coef: 0.22, color: '#e9a52e' },
  { name: 'Distrust in government (2016)',    coef: 0.15, color: '#6b6b70',
    note: '↳ near-universal in 2016 (71% of voters in bottom quartile), can’t discriminate' },
]

export function drawSwitchCoefficients(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 24, right: 80, bottom: 80, left: 226 }
  const innerW = W - margin.left - margin.right
  const rowH = 28
  const rowGap = 14
  const innerH = ROWS.length * rowH + (ROWS.length - 1) * rowGap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'switch-coef-chart')

  // All five bars now point right (toward "more Obama→Trump switching"),
  // so the axis starts at zero.
  const x = d3.scaleLinear().domain([0, 1.1]).range([0, innerW])
  const x0 = x(0)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title

  // Zero baseline ("no effect")
  g.append('line').attr('class', 'sc-zero')
    .attr('x1', x0).attr('x2', x0).attr('y1', -4).attr('y2', innerH + 4)
  g.append('text').attr('class', 'sc-zero-label')
    .attr('x', x0).attr('y', -8).attr('text-anchor', 'start')
    .text('no effect')

  // Bars
  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i]
    const y = i * (rowH + rowGap)

    // Row label
    svg.append('text').attr('class', 'sc-rowlabel')
      .attr('x', margin.left - 12).attr('y', margin.top + y + rowH / 2 + 4)
      .attr('text-anchor', 'end')
      .text(r.name)

    // Bar grows from x=0 toward the coefficient
    const bx0 = x(Math.min(0, r.coef))
    const bw = Math.abs(x(r.coef) - x0)
    g.append('rect').attr('class', 'sc-bar')
      .attr('x', bx0).attr('y', y).attr('width', bw).attr('height', rowH)
      .attr('fill', r.color)
      .attr('opacity', Math.abs(r.coef) < 0.2 ? 0.35 : 0.95)

    // Coefficient label
    const label = (r.coef >= 0 ? '+' : '') + r.coef.toFixed(2)
    const labelX = r.coef >= 0 ? x(r.coef) + 6 : x(r.coef) - 6
    g.append('text').attr('class', 'sc-coef-label')
      .attr('x', labelX).attr('y', y + rowH / 2 + 4)
      .attr('text-anchor', r.coef >= 0 ? 'start' : 'end')
      .text(label)

    // Optional inline annotation (e.g. compressed-variance note)
    if (r.note) {
      g.append('text').attr('class', 'sc-row-note')
        .attr('x', 6).attr('y', y + rowH + 11)
        .text(r.note)
    }
  }

  // X-axis at the bottom
  const axisY = innerH + 26
  g.append('g').attr('transform', `translate(0, ${axisY})`)
    .attr('class', 'sc-axis')
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d.toFixed(1)).tickSizeOuter(0))
  g.append('text').attr('class', 'sc-axis-title')
    .attr('x', innerW / 2).attr('y', axisY + 34).attr('text-anchor', 'middle')
    .text('standardized coefficient on P(Trump | Obama-2012 voter)')
}
