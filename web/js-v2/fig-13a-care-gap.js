// Fig 13a (Option A) — The "care vs don't care" turnout gap.
//
// Two side-by-side panels: full electorate and the gettable
// (low-engagement) subset. Each panel a paired bar: "cares a good
// deal" vs "doesn't care," with the gap labelled in pp.
import * as d3 from 'https://esm.sh/d3@7'

const PANELS = [
  {
    key: 'all',
    title: 'All voters',
    bars: [
      { label: 'Care a good deal', pct: 70.5, color: '#b8240f' },
      { label: 'Don’t care',       pct: 35.9, color: '#bdb7a8' },
    ],
    gap: 34.6,
  },
  {
    key: 'gettable',
    title: 'Low-engagement voters (the "gettable" ones)',
    bars: [
      { label: 'Care a good deal', pct: 52.2, color: '#b8240f' },
      { label: 'Don’t care',       pct: 25.6, color: '#bdb7a8' },
    ],
    gap: 26.6,
  },
]

export function drawCareGap(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const panelGap = 24
  const panelW = (W - panelGap) / 2
  const margin = { top: 100, right: 16, bottom: 56, left: 16 }
  const innerH = 240
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'caregap-chart')

  svg.append('text').attr('class', 'cg-title')
    .attr('x', 0).attr('y', 22)
    .text('Stakes is the single biggest turnout lever')
  svg.append('text').attr('class', 'cg-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Self-reported turnout (ANES 2016) by whether the voter cares who wins. Weighted.')

  function drawPanel(panel, x0) {
    const g = svg.append('g').attr('transform', `translate(${x0}, ${margin.top})`)
    g.append('text').attr('class', 'cg-panel-title')
      .attr('x', panelW / 2).attr('y', -22).attr('text-anchor', 'middle')
      .text(panel.title)

    const padding = 24
    const innerW = panelW - padding * 2
    const inner = g.append('g').attr('transform', `translate(${padding}, 0)`)

    const x = d3.scaleBand().domain(panel.bars.map(b => b.label))
      .range([0, innerW]).padding(0.25)
    const y = d3.scaleLinear().domain([0, 80]).range([innerH, 0])

    // Gridlines + axes
    inner.append('g').attr('class', 'cg-grid')
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(''))
    inner.append('g').attr('class', 'cg-axis')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}%`).tickSizeOuter(0))
    inner.append('g').attr('class', 'cg-axis')
      .attr('transform', `translate(0, ${innerH})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))

    // Bars
    for (const b of panel.bars) {
      const bx = x(b.label)
      const by = y(b.pct)
      inner.append('rect').attr('class', 'cg-bar')
        .attr('x', bx).attr('y', by)
        .attr('width', x.bandwidth()).attr('height', innerH - by)
        .attr('fill', b.color)
      inner.append('text').attr('class', 'cg-pct')
        .attr('x', bx + x.bandwidth() / 2).attr('y', by - 6)
        .attr('text-anchor', 'middle')
        .text(`${b.pct.toFixed(1)}%`)
    }

    // Gap annotation
    inner.append('text').attr('class', 'cg-gap')
      .attr('x', innerW / 2).attr('y', innerH + 40)
      .attr('text-anchor', 'middle')
      .text(`${panel.gap.toFixed(1)}-point gap`)
  }

  drawPanel(PANELS[0], 0)
  drawPanel(PANELS[1], panelW + panelGap)
}
