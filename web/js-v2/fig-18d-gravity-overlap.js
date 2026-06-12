// Fig 18d — Coalition × moveable-mass overlap (port of v1 chartGravity).
//
// The headline finding from v1: Sanders' primary coalition was 40.1%
// moveable voters — 3× Clinton's rate. Clinton's coalition was locked
// into already-engaged Democratic loyalists. Sanders' was anchored in
// the contestable mass. When Sanders left the ballot, the contestable
// mass had no Democratic option.
//
// Visualized as two stacked bars per candidate: locked-in vs moveable
// share of their primary coalition. Sanders' moveable share dwarfs
// Clinton's.
//
// Data: hardcoded from v1 chartGravity header (V161032 × V161004 cross-tab).
import * as d3 from 'https://esm.sh/d3@7'

const COHORTS = [
  { name: 'Sanders primary',  n: 339, moveable: 136, color: '#4a9b6d', emoji: '🌊' },
  { name: 'Clinton primary',  n: 444, moveable:  59, color: '#2c5b9c', emoji: '🏛️' },
  { name: 'Trump primary',    n: 393, moveable:  60, color: '#b8240f', emoji: '👑' },
]

export function drawGravityOverlap(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 90, right: 40, bottom: 60, left: 150 }
  const rowH = 38, gap = 18
  const innerW = W - margin.left - margin.right
  const innerH = COHORTS.length * (rowH + gap) - gap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  svg.append('text').attr('class', 'gw-title')
    .attr('x', 0).attr('y', 22)
    .text('Sanders\' coalition was 3× as moveable as Clinton\'s')
  svg.append('text').attr('class', 'gw-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Each row = one candidate\'s 2016 primary voter coalition (ANES 2016, n shown). Stacked: locked-in vs moveable.')
  svg.append('text').attr('class', 'gw-subtitle')
    .attr('x', 0).attr('y', 58)
    .text('"Moveable" = undecided OR low-turnout-history voter. They\'re the cohort campaigns actually fight for.')

  const x = d3.scaleLinear().domain([0, 50]).range([0, innerW])

  for (let i = 0; i < COHORTS.length; i++) {
    const c = COHORTS[i]
    const y0 = i * (rowH + gap)
    const movePct = c.moveable / c.n * 100
    const lockPct = 100 - movePct

    g.append('text')
      .attr('x', -8).attr('y', y0 + rowH / 2 + 5).attr('text-anchor', 'end')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', '#1b1b1d')
      .text(c.name)
    g.append('text')
      .attr('x', -8).attr('y', y0 + rowH / 2 + 20).attr('text-anchor', 'end')
      .attr('font-size', '10px').attr('fill', '#888')
      .text(`n=${c.n}`)

    // Moveable bar (full color)
    g.append('rect')
      .attr('x', 0).attr('y', y0)
      .attr('width', x(movePct)).attr('height', rowH)
      .attr('fill', c.color).attr('opacity', 0.85)
    g.append('text')
      .attr('x', x(movePct) / 2).attr('y', y0 + rowH / 2 + 5).attr('text-anchor', 'middle')
      .attr('fill', '#fff').attr('font-size', '13px').attr('font-weight', '700')
      .text(`${movePct.toFixed(1)}%`)
    g.append('text')
      .attr('x', x(movePct) / 2).attr('y', y0 + rowH / 2 - 8).attr('text-anchor', 'middle')
      .attr('fill', '#fff').attr('font-size', '9.5px').attr('font-style', 'italic')
      .text('moveable')

    // The remaining (locked-in) area is just the empty bar to the scale max
    g.append('rect')
      .attr('x', x(movePct)).attr('y', y0)
      .attr('width', innerW - x(movePct)).attr('height', rowH)
      .attr('fill', '#eee').attr('opacity', 0.6)
    g.append('text')
      .attr('x', x(movePct) + (innerW - x(movePct)) / 2).attr('y', y0 + rowH / 2 + 5).attr('text-anchor', 'middle')
      .attr('fill', '#888').attr('font-size', '11px')
      .text(`${lockPct.toFixed(1)}% locked-in`)
  }

  g.append('g').attr('transform', `translate(0, ${innerH + 6})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d}%`).tickSizeOuter(0))

  svg.append('text').attr('class', 'gw-foot')
    .attr('x', 0).attr('y', H - 4).attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Source: ANES 2016 (V161032 vote intention × V161004 prior turnout). "Moveable" = undecided OR low-turnout-history. Sanders coalition: 40.1% (3.0× Clinton).')
}
