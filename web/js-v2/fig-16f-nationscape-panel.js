// Fig 16f — Nationscape panel scatter, April → July 2020 (n=4,686).
//
// Independent cross-validation of Fig E. Different dataset, different
// scale (1-4 favorability instead of 0-100 thermometer), different time
// window (Apr-Jul vs Sep-Nov), same result: the centroid sits on the
// diagonal. Individual movement is huge (85% moved ≥1pt), aggregate
// movement is ~0.1pt out of 8.
//
// Data: scripts/build_nationscape_panel.py → nationscape_panel_april_july_2020.json
import * as d3 from 'https://esm.sh/d3@7'

export function drawNationscapePanel(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const stats = data.stats
  const records = data.respondents

  const W = container.clientWidth || 680
  const margin = { top: 90, right: 30, bottom: 80, left: 60 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 440)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'wc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title
  svg.append('text').attr('class', 'wc-title')
    .attr('x', margin.left).attr('y', 22)
    .text('Cross-validation: Nationscape panel, April → July 2020')
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text(`Different dataset, different scale, different window (n = ${records.length.toLocaleString()} matched panel respondents).`)
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text(`Same result. Net shift: ${stats.mean_shift > 0 ? '+' : ''}${stats.mean_shift} on an 8-pt scale. Skewness ${stats.skewness}. ${stats.pct_dlean_shift}% shifted D, ${stats.pct_rlean_shift}% shifted R.`)

  // Scales
  const x = d3.scaleLinear().domain([-4.5, 4.5]).range([0, innerW])
  const y = d3.scaleLinear().domain([-4.5, 4.5]).range([innerH, 0])

  // Quadrants
  g.append('rect').attr('x', x(0)).attr('y', 0)
    .attr('width', x(4.5) - x(0)).attr('height', y(0))
    .attr('fill', '#cad7e6').attr('opacity', 0.10)
  g.append('rect').attr('x', 0).attr('y', y(0))
    .attr('width', x(0)).attr('height', innerH - y(0))
    .attr('fill', '#e6c4be').attr('opacity', 0.10)

  // Grid + zero lines
  g.append('g').attr('class', 'wc-grid')
    .call(d3.axisLeft(y).ticks(9).tickSize(-innerW).tickFormat(''))
    .selectAll('line').attr('stroke', '#e6e6e6')
  g.append('g').attr('class', 'wc-grid')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(9).tickSize(-innerH).tickFormat(''))
    .selectAll('line').attr('stroke', '#e6e6e6')
  g.append('line').attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', innerH).attr('stroke', '#888').attr('stroke-width', 1)
  g.append('line').attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0)).attr('y2', y(0)).attr('stroke', '#888').attr('stroke-width', 1)

  // Diagonal
  g.append('line')
    .attr('x1', x(-4.5)).attr('x2', x(4.5))
    .attr('y1', y(-4.5)).attr('y2', y(4.5))
    .attr('stroke', '#1b1b1d').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.7)
  g.append('text')
    .attr('x', x(3.2)).attr('y', y(3.7))
    .attr('font-size', '10.5px').attr('font-style', 'italic').attr('fill', '#444')
    .text('y = x  (no change)')

  // Quadrant labels
  const ql = (cx, cy, txt, color) => {
    g.append('text')
      .attr('x', x(cx)).attr('y', y(cy)).attr('text-anchor', 'middle')
      .attr('font-size', '10.5px').attr('font-weight', '700').attr('fill', color)
      .attr('opacity', 0.55).text(txt)
  }
  ql(2.5, 4.2, 'D-stable', '#2c5b9c')
  ql(-2.5, -4.2, 'R-stable', '#b8240f')
  ql(-3, 4, 'R → D flippers', '#444')
  ql(3, -4, 'D → R flippers', '#444')

  // Dots (jittered for integer-rounded scores)
  const jitter = () => (Math.random() - 0.5) * 0.6
  for (const r of records) {
    g.append('circle')
      .attr('cx', x(r.s + jitter())).attr('cy', y(r.n + jitter()))
      .attr('r', 2.2).attr('fill', '#3a6f9c').attr('opacity', 0.18)
  }

  // Centroid marker
  g.append('circle')
    .attr('cx', x(stats.mean_t1)).attr('cy', y(stats.mean_t2))
    .attr('r', 9).attr('fill', '#fff').attr('stroke', '#000').attr('stroke-width', 2.5)
  g.append('text')
    .attr('x', x(stats.mean_t1) + 14).attr('y', y(stats.mean_t2) - 4)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#000')
    .text(`mean: (${stats.mean_t1}, ${stats.mean_t2})`)
  g.append('text')
    .attr('x', x(stats.mean_t1) + 14).attr('y', y(stats.mean_t2) + 10)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#000')
    .text(`net shift ${stats.mean_shift > 0 ? '+' : ''}${stats.mean_shift} (≈ 1.3% of scale range)`)

  // Axes
  g.append('g').attr('class', 'wc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(9).tickSizeOuter(0))
  g.append('g').attr('class', 'wc-axis')
    .call(d3.axisLeft(y).ticks(9).tickSizeOuter(0))

  svg.append('text').attr('class', 'wc-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 40).attr('text-anchor', 'middle')
    .text('April 2020 favorability gap (Biden − Trump)')
  svg.append('text').attr('class', 'wc-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('July 2020 favorability gap (Biden − Trump)')

  // Footer
  svg.append('text').attr('class', 'wc-foot')
    .attr('x', margin.left).attr('y', H - 4)
    .text(`Source: Nationscape parallel panel waves (T1 April, T2 July). ${stats.pct_shift_gt1}% moved ≥1pt; ${stats.pct_shift_gt2}% moved ≥2pt. Movement is symmetric.`)
}
