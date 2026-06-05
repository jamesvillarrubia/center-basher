// Fig 18b — The 2016 trust × ideology voter map, density-blob version.
//
// User feedback: dots were unclear, "blobby areas were much more
// communicative." Rebuilt using d3.contourDensity() per party. Each
// party group (D / R / Independent) gets its own density contours.
// Candidate centroids overlaid on top.
//
// Visual story for §18: blue Dem blob sits high-trust establishment-left.
// Red Rep blob sits low-trust right. Independent blob sits low-trust
// center. Sanders' primary voter centroid sits IN the independent /
// low-trust blob — not in the Dem blob.
//
// Data: scripts/build_voter_map_2016.py → voter_map_2016.json
import * as d3 from 'https://esm.sh/d3@7'
import { contourDensity } from 'https://esm.sh/d3-contour@4'

const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_IND = '#666'
const COLOR_SANDERS = '#4a9b6d'

function partyGroup(p) {
  if (p === 'strong_dem' || p === 'lean_dem') return 'D'
  if (p === 'strong_rep' || p === 'lean_rep') return 'R'
  return 'I'
}

export function drawVoterMap2016(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const voters = data.voters
  const cands  = data.candidates
  const W = container.clientWidth || 680
  const margin = { top: 110, right: 30, bottom: 90, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'vm-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title
  svg.append('text').attr('class', 'vm-title')
    .attr('x', margin.left).attr('y', 22)
    .text('Where were Sanders voters actually sitting in 2016?')
  svg.append('text').attr('class', 'vm-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text(`Density blobs per party (n = ${voters.length.toLocaleString()} ANES respondents). X = ideology. Y = institutional trust.`)
  svg.append('text').attr('class', 'vm-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text('Sanders sits in the Independent / low-trust blob — not in the Democratic blob.')

  // Scales
  const x = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

  // Zero axes — light
  g.append('line').attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', innerH).attr('stroke', '#ccc').attr('stroke-width', 1)
  g.append('line').attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0.5)).attr('y2', y(0.5)).attr('stroke', '#ccc').attr('stroke-width', 1)

  // Group voters by party
  const groups = { D: [], R: [], I: [] }
  for (const v of voters) {
    groups[partyGroup(v.p)].push(v)
  }

  // Density contour helper
  function drawDensity(pts, color, thresholdsCount = 6) {
    const density = contourDensity()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .size([innerW, innerH])
      .bandwidth(28)
      .thresholds(thresholdsCount)(pts)

    g.append('g')
      .selectAll('path')
      .data(density)
      .join('path')
      .attr('d', d3.geoPath())
      .attr('fill', color)
      .attr('fill-opacity', (d, i) => 0.06 + (i / density.length) * 0.10)
      .attr('stroke', color)
      .attr('stroke-opacity', 0.30)
      .attr('stroke-width', 0.7)
  }

  // Draw in order: weakest party (Independent) first, then Dem, Rep on top
  drawDensity(groups.I, COLOR_IND, 5)
  drawDensity(groups.D, COLOR_DEM, 6)
  drawDensity(groups.R, COLOR_REP, 6)

  // Trust-by-ideology trend line — per ideology bucket, weighted mean trust
  const bins = new Map()
  for (const v of voters) {
    const key = Math.round(v.x * 6) / 6  // ANES 7-pt scale resolution
    const b = bins.get(key) || { sw: 0, swy: 0, n: 0 }
    const w = v.w || 1
    b.sw += w
    b.swy += w * v.y
    b.n += 1
    bins.set(key, b)
  }
  const trendPts = [...bins.entries()]
    .filter(([_, b]) => b.n >= 30)  // drop sparse bins
    .map(([xv, b]) => ({ x: xv, y: b.swy / b.sw, n: b.n }))
    .sort((a, b) => a.x - b.x)
  const trendLine = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveMonotoneX)
  g.append('path').datum(trendPts).attr('d', trendLine)
    .attr('fill', 'none').attr('stroke', '#1b1b1d').attr('stroke-width', 2.5)
    .attr('opacity', 0.85)
  // Trend-line label at the rightmost point
  const last = trendPts[trendPts.length - 1]
  g.append('text')
    .attr('x', x(last.x) + 6).attr('y', y(last.y) + 4)
    .attr('font-size', '10.5px').attr('font-weight', '700').attr('fill', '#1b1b1d')
    .text('avg. trust by ideology')
  // Dots at each bin
  for (const p of trendPts) {
    g.append('circle').attr('cx', x(p.x)).attr('cy', y(p.y)).attr('r', 3.5)
      .attr('fill', '#1b1b1d').attr('stroke', '#fff').attr('stroke-width', 1)
  }

  // Candidate centroids — drawn on top, BIG and labeled
  for (const c of cands) {
    const cx = x(c.x)
    const cy = y(c.y)
    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', 18)
      .attr('fill', c.color).attr('opacity', 0.18)
    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', 9)
      .attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
    const labelOffsetY = c.id === 'sanders' ? 26 : c.id === 'clinton' ? -16 : 26
    g.append('text')
      .attr('x', cx).attr('y', cy + labelOffsetY).attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color)
      .text(c.short)
    g.append('text')
      .attr('x', cx).attr('y', cy + labelOffsetY + 13).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', '#444').attr('font-style', 'italic')
      .text(`(${c.x > 0 ? '+' : ''}${c.x}, ${c.y})`)
  }

  // Axes
  g.append('g').attr('class', 'vm-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'vm-axis')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))

  svg.append('text').attr('class', 'vm-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 50).attr('text-anchor', 'middle')
    .text('← liberal       Ideology (V161126)       conservative →')
  svg.append('text').attr('class', 'vm-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Institutional trust  (low ← → high)')

  // Legend — party blobs
  const legY = 78
  const lx = margin.left
  const items = [
    { color: COLOR_DEM, label: 'Democratic voters' },
    { color: COLOR_REP, label: 'Republican voters' },
    { color: COLOR_IND, label: 'Independent voters' },
  ]
  let lxCursor = lx
  for (const it of items) {
    svg.append('rect').attr('x', lxCursor).attr('y', legY - 4).attr('width', 14).attr('height', 8)
      .attr('fill', it.color).attr('opacity', 0.35)
      .attr('stroke', it.color).attr('stroke-opacity', 0.6).attr('stroke-width', 0.7)
    svg.append('text').attr('x', lxCursor + 20).attr('y', legY + 3)
      .attr('font-size', '10.5px').attr('fill', '#444').text(it.label)
    lxCursor += 20 + it.label.length * 6.5 + 18
  }

  // Footer
  svg.append('text').attr('class', 'vm-foot')
    .attr('x', margin.left).attr('y', H - 6)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Source: ANES 2016 (V161126 ideology, V161215/16/17 trust composite). Density contours via d3.contourDensity. Candidate centroids = voter-base means.')
}
