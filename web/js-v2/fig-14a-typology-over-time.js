// Fig 14a (Option A) — Cross-cycle no-show typology, 1972-2024.
//
// Two lines on a shared time axis: the "alienated" no-show share
// (System Critics who've given up on the system) and the "complacent"
// no-show share (System Believers who don't think it matters who wins).
// The alienated line rises sharply post-2016 while the complacent line
// has been declining for 50 years.
//
// Numbers from data/clean/noshow_typology_by_cycle.csv via the
// build_noshow_typology_by_cycle.py pipeline.
import * as d3 from 'https://esm.sh/d3@7'

const ROWS = [
  { year: 1972, alienated: 26.0, complacent: 19.2 },
  { year: 1976, alienated: 34.1, complacent:  9.2 },
  { year: 1980, alienated: 40.5, complacent: 11.9 },
  { year: 1984, alienated: 21.0, complacent: 22.6 },
  { year: 1988, alienated: 28.6, complacent: 16.3 },
  { year: 1992, alienated: 31.1, complacent: 17.7 },
  { year: 2000, alienated: 40.5, complacent: 21.0 },
  { year: 2016, alienated: 35.8, complacent:  7.6 },
  { year: 2020, alienated: 49.0, complacent:  9.2 },
  { year: 2024, alienated: 52.8, complacent:  5.9 },
]

const COLOR = {
  ALIENATED: '#b8240f',   // accent red — the "given up" type
  COMPLACENT: '#5b3a8e',  // purple    — the "things are fine" type
}

export function drawTypologyOverTime(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 80, right: 180, bottom: 60, left: 60 }
  const innerW = W - margin.left - margin.right
  const innerH = 280
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'typology-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleLinear().domain([1970, 2026]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 60]).range([innerH, 0]).nice()

  // Title and subtitle
  svg.append('text').attr('class', 'ty-title')
    .attr('x', 0).attr('y', 22)
    .text('The no-show story is changing')
  svg.append('text').attr('class', 'ty-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Share of low-engagement non-voters by type, ANES Cumulative File 1972–2024.')

  // Grid
  g.append('g').attr('class', 'ty-grid')
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(''))
  // Axes
  g.append('g').attr('class', 'ty-axis')
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}%`).tickSizeOuter(0))
  g.append('g').attr('class', 'ty-axis')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d'))
      .tickValues([1972, 1980, 1988, 2000, 2016, 2024])
      .tickSizeOuter(0))

  // Lines
  const line = d3.line()
    .x(d => x(d.year))
    .y((d, i, arr) => y(arr[i].pct))
    .defined(d => d.pct !== null)

  const alienatedSeries  = ROWS.map(r => ({ year: r.year, pct: r.alienated }))
  const complacentSeries = ROWS.map(r => ({ year: r.year, pct: r.complacent }))

  g.append('path').attr('class', 'ty-line')
    .datum(alienatedSeries).attr('stroke', COLOR.ALIENATED)
    .attr('d', d3.line().x(d => x(d.year)).y(d => y(d.pct)))
  g.append('path').attr('class', 'ty-line')
    .datum(complacentSeries).attr('stroke', COLOR.COMPLACENT)
    .attr('d', d3.line().x(d => x(d.year)).y(d => y(d.pct)))

  // Dots
  for (const r of ROWS) {
    g.append('circle').attr('class', 'ty-dot')
      .attr('cx', x(r.year)).attr('cy', y(r.alienated)).attr('r', 4)
      .attr('fill', COLOR.ALIENATED)
    g.append('circle').attr('class', 'ty-dot')
      .attr('cx', x(r.year)).attr('cy', y(r.complacent)).attr('r', 4)
      .attr('fill', COLOR.COMPLACENT)
  }

  // End labels (right side)
  const lastA = alienatedSeries[alienatedSeries.length - 1]
  const lastC = complacentSeries[complacentSeries.length - 1]
  g.append('text').attr('class', 'ty-end-label')
    .attr('x', x(lastA.year) + 12).attr('y', y(lastA.pct) - 6)
    .attr('fill', COLOR.ALIENATED)
    .text('Alienated')
  g.append('text').attr('class', 'ty-end-sub')
    .attr('x', x(lastA.year) + 12).attr('y', y(lastA.pct) + 8)
    .text('"my vote doesn\'t fix anything"')
  g.append('text').attr('class', 'ty-end-label')
    .attr('x', x(lastC.year) + 12).attr('y', y(lastC.pct) - 6)
    .attr('fill', COLOR.COMPLACENT)
    .text('Complacent')
  g.append('text').attr('class', 'ty-end-sub')
    .attr('x', x(lastC.year) + 12).attr('y', y(lastC.pct) + 8)
    .text('"things are basically fine"')

  // Y-axis title
  svg.append('text').attr('class', 'ty-y-title')
    .attr('transform', `translate(16, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('share of low-engagement non-voters')
}
