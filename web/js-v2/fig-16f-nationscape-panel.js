// Fig 16f — Nationscape panel, April → July 2020 (n=4,686).
//
// Color tells the story: BLUE cells = above the diagonal (D-direction
// shifters). RED cells = below (R-direction). GREY cells = no change.
// Most people MOVED — only 15% sit on the diagonal. The blue and red
// totals are nearly equal (44.3% vs 40.7%), so the centroid stays put.
//
// The point is symmetry, NOT stasis.
//
// Data: scripts/build_nationscape_panel.py
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_D = '#2c5b9c'   // above diagonal (D-direction movers)
const COLOR_R = '#b8240f'   // below diagonal (R-direction movers)
const COLOR_NO = '#888'     // diagonal (no change)

export function drawNationscapePanel(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const stats = data.stats
  const records = data.respondents

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

  // Totals for each region
  let nDir = 0, nRDir = 0, nDiag = 0
  for (const cell of cells) {
    if (cell.n > cell.s) nDir += cell.c
    else if (cell.n < cell.s) nRDir += cell.c
    else nDiag += cell.c
  }
  const total = nDir + nRDir + nDiag

  const W = 680
  const margin = { top: 110, right: 24, bottom: 80, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 440)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'wc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title — make the headline match the actual finding
  svg.append('text').attr('class', 'wc-title')
    .attr('x', 0).attr('y', 22)
    .text('Cross-check: Nationscape Apr→Jul 2020')
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', 0).attr('y', 42)
    .text(`85% of people MOVED. But D-shifts and R-shifts cancel — so the centroid sits on the diagonal.`)
  svg.append('text').attr('class', 'wc-subtitle')
    .attr('x', 0).attr('y', 58)
    .text(`n = ${records.length.toLocaleString()}. Each circle = a cell; size = # of respondents. Net shift +${stats.mean_shift} on 8-pt scale.`)
  // Tally line
  svg.append('text')
    .attr('x', 0).attr('y', 80)
    .attr('font-size', '11px').attr('font-weight', '700')
    .append('tspan').attr('fill', COLOR_D)
    .text(`${(nDir/total*100).toFixed(1)}% moved toward Biden`)
  svg.append('text')
    .attr('x', margin.left + 175).attr('y', 80)
    .attr('font-size', '11px').attr('font-weight', '700')
    .append('tspan').attr('fill', COLOR_R)
    .text(`${(nRDir/total*100).toFixed(1)}% moved toward Trump`)
  svg.append('text')
    .attr('x', margin.left + 350).attr('y', 80)
    .attr('font-size', '11px').attr('font-weight', '700')
    .append('tspan').attr('fill', COLOR_NO)
    .text(`${(nDiag/total*100).toFixed(1)}% didn't change`)

  // Scales
  const x = d3.scaleLinear().domain([-3.6, 3.6]).range([0, innerW])
  const y = d3.scaleLinear().domain([-3.6, 3.6]).range([innerH, 0])
  const rScale = d3.scaleSqrt().domain([0, maxCount]).range([0, 26])

  // Subtle quadrant tints by direction
  // Above diagonal triangle = D-direction (light blue)
  g.append('polygon')
    .attr('points', `${x(-3.6)},${y(-3.6)} ${x(3.6)},${y(3.6)} ${x(-3.6)},${y(3.6)}`)
    .attr('fill', COLOR_D).attr('opacity', 0.05)
  // Below diagonal triangle = R-direction (light red)
  g.append('polygon')
    .attr('points', `${x(-3.6)},${y(-3.6)} ${x(3.6)},${y(3.6)} ${x(3.6)},${y(-3.6)}`)
    .attr('fill', COLOR_R).attr('opacity', 0.05)

  // Integer grid
  for (let i = -3; i <= 3; i++) {
    g.append('line').attr('x1', x(i)).attr('x2', x(i))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#eee').attr('stroke-width', 1)
    g.append('line').attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(i)).attr('y2', y(i))
      .attr('stroke', '#eee').attr('stroke-width', 1)
  }
  // Zero lines
  g.append('line').attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', innerH)
    .attr('stroke', '#bbb').attr('stroke-width', 1)
  g.append('line').attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', '#bbb').attr('stroke-width', 1)

  // y = x diagonal
  g.append('line')
    .attr('x1', x(-3.6)).attr('x2', x(3.6))
    .attr('y1', y(-3.6)).attr('y2', y(3.6))
    .attr('stroke', '#1b1b1d').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0.75)

  // Triangle labels
  g.append('text')
    .attr('x', x(-2.5)).attr('y', y(2.5)).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', COLOR_D)
    .attr('opacity', 0.7).text('moved toward Biden')
  g.append('text')
    .attr('x', x(2.5)).attr('y', y(-2.5)).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', COLOR_R)
    .attr('opacity', 0.7).text('moved toward Trump')

  // Bubble matrix
  for (const cell of cells) {
    const color = cell.n > cell.s ? COLOR_D
                : cell.n < cell.s ? COLOR_R : COLOR_NO
    g.append('circle')
      .attr('cx', x(cell.s)).attr('cy', y(cell.n))
      .attr('r', rScale(cell.c))
      .attr('fill', color).attr('opacity', 0.75)
      .attr('stroke', d3.rgb(color).darker(0.7)).attr('stroke-width', 0.5)
    if (cell.c >= maxCount * 0.35) {
      g.append('text')
        .attr('x', x(cell.s)).attr('y', y(cell.n) + 3)
        .attr('text-anchor', 'middle').attr('font-size', '10px')
        .attr('font-weight', '700').attr('fill', '#fff')
        .text(cell.c)
    }
  }

  // Centroid
  g.append('circle')
    .attr('cx', x(stats.mean_t1)).attr('cy', y(stats.mean_t2))
    .attr('r', 7).attr('fill', '#fff').attr('stroke', '#000').attr('stroke-width', 2.5)
  g.append('text')
    .attr('x', x(stats.mean_t1) + 11).attr('y', y(stats.mean_t2) - 8)
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#000')
    .text(`centroid (${stats.mean_t1}, ${stats.mean_t2})`)
  g.append('text')
    .attr('x', x(stats.mean_t1) + 11).attr('y', y(stats.mean_t2) + 7)
    .attr('font-size', '10px').attr('fill', '#444')
    .text(`shift +${stats.mean_shift} ≈ on the diagonal`)

  // Axes
  g.append('g').attr('class', 'wc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).tickValues([-3,-2,-1,0,1,2,3]).tickSizeOuter(0))
  g.append('g').attr('class', 'wc-axis')
    .call(d3.axisLeft(y).tickValues([-3,-2,-1,0,1,2,3]).tickSizeOuter(0))
  svg.append('text').attr('class', 'wc-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 36).attr('text-anchor', 'middle')
    .text('April gap (Biden − Trump favorability)')
  svg.append('text').attr('class', 'wc-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('July gap')

  // Footer
  svg.append('text').attr('class', 'wc-foot')
    .attr('x', 0).attr('y', H - 4)
    .text(`Source: Nationscape parallel panel waves. Skewness ${stats.skewness} ≈ 0 confirms statistical symmetry around the diagonal.`)
}
