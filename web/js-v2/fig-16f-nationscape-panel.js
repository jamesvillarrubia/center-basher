// Fig 16f — Nationscape panel matrix, April → July 2020 (n=4,686).
//
// Independent cross-validation of Fig E. Different dataset, different
// scale (1-4 favorability instead of 0-100 thermometer), different time
// window (Apr-Jul vs Sep-Nov). The 1-4 scale gives gap ∈ {-3,…,+3} →
// 49 possible cells; we render each cell as a circle sized by count.
// Diagonal = no change; off-diagonal = moved. Symmetry visible at a glance.
//
// Data: scripts/build_nationscape_panel.py → nationscape_panel_april_july_2020.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_DIAG = '#3a6f9c'
const COLOR_OFF = '#9a9a9a'

export function drawNationscapePanel(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const stats = data.stats
  const records = data.respondents

  // Count per (s, n) cell
  const cellCounts = new Map()
  for (const r of records) {
    const k = `${r.s},${r.n}`
    cellCounts.set(k, (cellCounts.get(k) || 0) + 1)
  }
  const cells = [...cellCounts.entries()].map(([k, c]) => {
    const [s, n] = k.split(',').map(Number)
    return { s, n, c }
  })
  const maxCount = d3.max(cells, d => d.c)

  const W = container.clientWidth || 680
  const margin = { top: 100, right: 24, bottom: 80, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 440)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'wc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title (kept SHORT to avoid clipping)
  svg.append('text').attr('class', 'wc-title')
    .attr('x', margin.left).attr('y', 22)
    .text('Cross-check: Nationscape Apr→Jul 2020')
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text(`Same test, different dataset (n = ${records.length.toLocaleString()}). Each circle = a cell; size = # of respondents in that cell.`)
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text(`Net shift +${stats.mean_shift} on 8-pt scale. Skewness ${stats.skewness}. Diagonal cells dominate — most people didn't change.`)

  // Scales — discrete domain -3..+3
  const x = d3.scaleLinear().domain([-3.6, 3.6]).range([0, innerW])
  const y = d3.scaleLinear().domain([-3.6, 3.6]).range([innerH, 0])
  const rScale = d3.scaleSqrt().domain([0, maxCount]).range([0, 30])

  // Quadrant backgrounds
  g.append('rect').attr('x', x(0)).attr('y', 0)
    .attr('width', x(3.6) - x(0)).attr('height', y(0))
    .attr('fill', '#cad7e6').attr('opacity', 0.10)
  g.append('rect').attr('x', 0).attr('y', y(0))
    .attr('width', x(0)).attr('height', innerH - y(0))
    .attr('fill', '#e6c4be').attr('opacity', 0.10)

  // Light grid at integer ticks
  for (let i = -3; i <= 3; i++) {
    g.append('line').attr('x1', x(i)).attr('x2', x(i))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#eee').attr('stroke-width', 1)
    g.append('line').attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(i)).attr('y2', y(i))
      .attr('stroke', '#eee').attr('stroke-width', 1)
  }

  // Zero lines (heavier)
  g.append('line').attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', innerH)
    .attr('stroke', '#888').attr('stroke-width', 1)
  g.append('line').attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', '#888').attr('stroke-width', 1)

  // y = x diagonal
  g.append('line')
    .attr('x1', x(-3.6)).attr('x2', x(3.6))
    .attr('y1', y(-3.6)).attr('y2', y(3.6))
    .attr('stroke', '#1b1b1d').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.7)
  g.append('text')
    .attr('x', x(2.6)).attr('y', y(3.1))
    .attr('font-size', '10px').attr('font-style', 'italic').attr('fill', '#444')
    .text('diagonal = no change')

  // Quadrant labels
  const ql = (cx, cy, txt, color) => {
    g.append('text')
      .attr('x', x(cx)).attr('y', y(cy)).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('font-weight', '700').attr('fill', color)
      .attr('opacity', 0.55).text(txt)
  }
  ql(1.8, 3.3, 'D-stable', '#2c5b9c')
  ql(-1.8, -3.3, 'R-stable', '#b8240f')
  ql(-2.4, 3.1, 'R→D flippers', '#444')
  ql(2.4, -3.1, 'D→R flippers', '#444')

  // Bubble matrix — one circle per (s, n) cell
  for (const cell of cells) {
    const onDiag = cell.s === cell.n
    g.append('circle')
      .attr('cx', x(cell.s)).attr('cy', y(cell.n))
      .attr('r', rScale(cell.c))
      .attr('fill', onDiag ? COLOR_DIAG : COLOR_OFF)
      .attr('opacity', onDiag ? 0.78 : 0.55)
      .attr('stroke', onDiag ? '#1b4f80' : '#666').attr('stroke-width', 0.5)
    // Count label on big cells
    if (cell.c >= maxCount * 0.25) {
      g.append('text')
        .attr('x', x(cell.s)).attr('y', y(cell.n) + 3)
        .attr('text-anchor', 'middle').attr('font-size', '10px')
        .attr('font-weight', '700').attr('fill', '#fff')
        .text(cell.c)
    }
  }

  // Centroid marker
  g.append('circle')
    .attr('cx', x(stats.mean_t1)).attr('cy', y(stats.mean_t2))
    .attr('r', 8).attr('fill', '#fff').attr('stroke', '#000').attr('stroke-width', 2.5)
  g.append('text')
    .attr('x', x(stats.mean_t1) + 13).attr('y', y(stats.mean_t2) - 6)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#000')
    .text(`centroid (${stats.mean_t1}, ${stats.mean_t2})`)
  g.append('text')
    .attr('x', x(stats.mean_t1) + 13).attr('y', y(stats.mean_t2) + 9)
    .attr('font-size', '10.5px').attr('fill', '#444')
    .text(`shift +${stats.mean_shift}`)

  // Axes
  g.append('g').attr('class', 'wc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(7).tickValues([-3,-2,-1,0,1,2,3]).tickSizeOuter(0))
  g.append('g').attr('class', 'wc-axis')
    .call(d3.axisLeft(y).ticks(7).tickValues([-3,-2,-1,0,1,2,3]).tickSizeOuter(0))

  svg.append('text').attr('class', 'wc-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 36).attr('text-anchor', 'middle')
    .text('April gap (Biden − Trump favorability)')
  svg.append('text').attr('class', 'wc-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('July gap (Biden − Trump favorability)')

  // Footer
  svg.append('text').attr('class', 'wc-foot')
    .attr('x', margin.left).attr('y', H - 4)
    .text(`Source: Nationscape parallel panel. ${stats.pct_no_shift}% on diagonal · ${stats.pct_dlean_shift}% D-direction · ${stats.pct_rlean_shift}% R-direction.`)
}
