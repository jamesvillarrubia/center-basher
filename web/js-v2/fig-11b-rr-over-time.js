// Fig 11b (Option B) — Racial-resentment electoral weight, 1988-2024.
//
// The "line that grew." Net effect of racial-resentment items on
// presidential vote, after controlling for ideology and party ID, by
// cycle. Source: §11 footnote [4] — properly oriented 4-item
// Kinder-Sanders scale on ANES CDF.
import * as d3 from 'https://esm.sh/d3@7'

const CYCLES = [
  { year: 1988, coef: 0.48 },
  { year: 2000, coef: 0.33 },
  { year: 2004, coef: 0.69 },
  { year: 2008, coef: 0.98 },
  { year: 2012, coef: 0.88 },
  { year: 2016, coef: 1.55 },
  { year: 2020, coef: 1.48 },
  { year: 2024, coef: 1.18 },
]

const ANNOTATIONS = [
  { year: 2008, text: 'Obama elected', dy: -40 },
  { year: 2016, text: 'Trump campaign', dy: -28 },
]

export function drawRRTimeline(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 24, right: 24, bottom: 56, left: 50 }
  const innerW = W - margin.left - margin.right
  const innerH = 260
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'rr-time-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleLinear().domain([1986, 2026]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 1.8]).range([innerH, 0]).nice()

  // Gridlines
  g.append('g').attr('class', 'rr-grid')
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(''))
  // Axes
  g.append('g').attr('class', 'rr-axis')
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => d.toFixed(1)).tickSizeOuter(0))
  g.append('g').attr('class', 'rr-axis')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).tickValues([1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024]).tickSizeOuter(0))

  // Line + dots
  const line = d3.line().x(d => x(d.year)).y(d => y(d.coef))
  g.append('path').attr('class', 'rr-line')
    .datum(CYCLES).attr('d', line)
  for (const c of CYCLES) {
    g.append('circle').attr('class', 'rr-dot')
      .attr('cx', x(c.year)).attr('cy', y(c.coef)).attr('r', 5)
    g.append('text').attr('class', 'rr-pt-label')
      .attr('x', x(c.year)).attr('y', y(c.coef) - 10)
      .attr('text-anchor', 'middle')
      .text(c.coef.toFixed(2))
  }

  // Vertical annotation marker (Obama elected)
  for (const a of ANNOTATIONS) {
    const cycle = CYCLES.find(c => c.year === a.year)
    if (!cycle) continue
    const ax = x(a.year)
    const ay = y(cycle.coef)
    g.append('line').attr('class', 'rr-annot-line')
      .attr('x1', ax).attr('x2', ax)
      .attr('y1', ay + (a.dy > 0 ? 12 : -10))
      .attr('y2', ay + (a.dy > 0 ? a.dy - 4 : a.dy + 4))
    g.append('text').attr('class', 'rr-annot-text')
      .attr('x', ax).attr('y', ay + a.dy)
      .attr('text-anchor', 'middle')
      .text(a.text)
  }

  // Title

  // Y-axis title
  svg.append('text').attr('class', 'rr-y-title')
    .attr('transform', `translate(14, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('coefficient on Republican vote')
}
