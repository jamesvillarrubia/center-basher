// Fig 18 — Multi-year, tabbed voter map (trust × ideology).
//
// Three years (2016 / 2020 / 2024) × two scopes (national / swing-state).
// User clicks tabs to switch. Density blobs per party (D/R/I) + candidate
// centroids + trust-by-ideology trend lines per cohort (all / swing /
// irregular).
//
// Cohort definitions (consistent across years):
//   Swing (sw):    behavioral cross-pressured — independents OR Dem voted
//                  Rep OR Rep voted Dem. Spans all three party groups.
//   Irregular (n2|do): voted current cycle but not prior (n2) OR voted
//                  prior cycle but not current (do). 2024 lacks reliable
//                  prior-vote join, so this cohort is empty for 2024.
//
// Data: scripts/build_voter_maps_all.py → voter_map_2016.json / _2020 / _2024
import * as d3 from 'https://esm.sh/d3@7'
import { contourDensity } from 'https://esm.sh/d3-contour@4'

const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_IND = '#666'

function partyGroup(p) {
  if (p === 'dem') return 'D'
  if (p === 'rep') return 'R'
  return 'I'
}

let __state = { year: 2016, scope: 'national', dataByYear: {} }

export function mountVoterMapTabbed(selector, dataByYear) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''
  __state.dataByYear = dataByYear

  // Tab bar
  const tabBar = document.createElement('div')
  tabBar.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center;font-size:13px;'
  const yearTabs = [2016, 2020, 2024]
  const scopeTabs = [
    { key: 'national',    label: 'National' },
    { key: 'swing',       label: 'Swing states only' },
  ]
  yearTabs.forEach(y => {
    const btn = document.createElement('button')
    btn.textContent = y
    btn.dataset.year = y
    btn.className = 'vm-tab vm-year-tab'
    btn.style.cssText = 'padding:5px 14px;border-radius:4px;border:1px solid #888;background:#fff;color:#333;cursor:pointer;font-weight:600;'
    btn.addEventListener('click', () => { __state.year = y; renderAll(container) })
    tabBar.appendChild(btn)
  })
  const sep = document.createElement('span'); sep.textContent = '|'; sep.style.cssText = 'color:#bbb;margin:0 4px;'
  tabBar.appendChild(sep)
  scopeTabs.forEach(s => {
    const btn = document.createElement('button')
    btn.textContent = s.label
    btn.dataset.scope = s.key
    btn.className = 'vm-tab vm-scope-tab'
    btn.style.cssText = 'padding:5px 14px;border-radius:4px;border:1px solid #888;background:#fff;color:#333;cursor:pointer;font-weight:600;'
    btn.addEventListener('click', () => { __state.scope = s.key; renderAll(container) })
    tabBar.appendChild(btn)
  })

  const chartWrap = document.createElement('div')
  chartWrap.className = 'vm-chart-wrap'

  container.appendChild(tabBar)
  container.appendChild(chartWrap)
  renderAll(container)
}

function renderAll(container) {
  // Update tab highlighting
  container.querySelectorAll('.vm-year-tab').forEach(b => {
    const active = Number(b.dataset.year) === __state.year
    b.style.background = active ? '#1b1b1d' : '#fff'
    b.style.color = active ? '#fff' : '#333'
  })
  container.querySelectorAll('.vm-scope-tab').forEach(b => {
    const active = b.dataset.scope === __state.scope
    b.style.background = active ? '#1b1b1d' : '#fff'
    b.style.color = active ? '#fff' : '#333'
  })
  const wrap = container.querySelector('.vm-chart-wrap')
  wrap.innerHTML = ''
  drawChart(wrap, __state.dataByYear[__state.year], { swingStatesOnly: __state.scope === 'swing', year: __state.year })
}

function drawChart(container, data, opts) {
  const swingOnly = !!opts.swingStatesOnly
  const year = opts.year
  const voters = swingOnly ? data.voters.filter(v => v.s) : data.voters
  const cands = data.candidates

  const W = container.clientWidth || 680
  const margin = { top: 110, right: 30, bottom: 90, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title
  svg.append('text').attr('class', 'vm-title').attr('x', margin.left).attr('y', 22)
    .text(`${year} trust × ideology voter map${swingOnly ? ' — swing states only' : ''}`)
  svg.append('text').attr('class', 'vm-subtitle').attr('x', margin.left).attr('y', 42)
    .text(`n = ${voters.length.toLocaleString()} ANES respondents. X = ideology (V161126 / V201200 / V241177). Y = trust composite (0–1).`)
  svg.append('text').attr('class', 'vm-subtitle').attr('x', margin.left).attr('y', 58)
    .text('Density blobs per party. Trend lines = weighted mean trust per ideology bin for each cohort.')

  // Scales
  const x = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', innerH).attr('stroke', '#ccc')
  g.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', y(0.5)).attr('y2', y(0.5)).attr('stroke', '#ccc')

  // Group voters by party
  const groups = { D: [], R: [], I: [] }
  for (const v of voters) groups[partyGroup(v.p)].push(v)

  function drawDensity(pts, color, thresholdsCount = 6) {
    if (pts.length < 30) return
    const density = contourDensity()
      .x(d => x(d.x)).y(d => y(d.y))
      .size([innerW, innerH]).bandwidth(28).thresholds(thresholdsCount)(pts)
    g.append('g').selectAll('path').data(density).join('path')
      .attr('d', d3.geoPath())
      .attr('fill', color).attr('fill-opacity', (d, i) => 0.06 + (i / density.length) * 0.10)
      .attr('stroke', color).attr('stroke-opacity', 0.30).attr('stroke-width', 0.7)
  }
  drawDensity(groups.I, COLOR_IND, 5)
  drawDensity(groups.D, COLOR_DEM, 6)
  drawDensity(groups.R, COLOR_REP, 6)

  // Trend lines
  function trendFor(filter, minN = 12) {
    const bins = new Map()
    for (const v of voters) {
      if (!filter(v)) continue
      const key = Math.round(v.x * 6) / 6
      const b = bins.get(key) || { sw: 0, swy: 0, n: 0 }
      const w = v.w || 1
      b.sw += w; b.swy += w * v.y; b.n += 1
      bins.set(key, b)
    }
    return [...bins.entries()]
      .filter(([_, b]) => b.n >= minN)
      .map(([xv, b]) => ({ x: xv, y: b.swy / b.sw, n: b.n }))
      .sort((a, b) => a.x - b.x)
  }
  const trendLine = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveMonotoneX)
  // Tighter minimum bin sizes so the trend lines don't spike on noisy
  // small subsamples (n<40 was producing misleading reads, esp. at
  // ideology extremes where the cross-pressured cohort is structurally tiny).
  const trends = [
    { pts: trendFor(v => true, 40),               color: '#1b1b1d', label: 'All',             dash: null,  width: 2.8 },
    { pts: trendFor(v => v.sw, 30),               color: '#a06400', label: 'Cross-pressured', dash: '4,3', width: 2.0 },
    { pts: trendFor(v => v.n2 || v.do, 15),       color: '#7a4d8a', label: 'Irregular',       dash: '2,3', width: 2.0 },
  ]
  for (const t of trends) {
    if (t.pts.length < 2) continue
    g.append('path').datum(t.pts).attr('d', trendLine)
      .attr('fill', 'none').attr('stroke', t.color).attr('stroke-width', t.width)
      .attr('stroke-dasharray', t.dash).attr('opacity', 0.9)
    for (const p of t.pts) {
      g.append('circle').attr('cx', x(p.x)).attr('cy', y(p.y)).attr('r', 3)
        .attr('fill', t.color).attr('stroke', '#fff').attr('stroke-width', 1)
    }
    const last = t.pts[t.pts.length - 1]
    g.append('text').attr('x', x(last.x) + 6).attr('y', y(last.y) + 4)
      .attr('font-size', '10px').attr('font-weight', '700').attr('fill', t.color)
      .text(t.label)
  }

  // Candidate centroids
  for (const c of cands) {
    const cx = x(c.x); const cy = y(c.y)
    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 18).attr('fill', c.color).attr('opacity', 0.18)
    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 9).attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
    const labelOffsetY = c.id === 'sanders' ? 26 : c.id === 'clinton' || c.id === 'biden' || c.id === 'harris' ? -16 : 26
    g.append('text').attr('x', cx).attr('y', cy + labelOffsetY).attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color).text(c.short)
    g.append('text').attr('x', cx).attr('y', cy + labelOffsetY + 13).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', '#444').attr('font-style', 'italic')
      .text(`(${c.x > 0 ? '+' : ''}${c.x}, ${c.y})`)
  }

  // Axes
  g.append('g').attr('class', 'vm-axis').attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'vm-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  svg.append('text').attr('class', 'vm-axis-title').attr('x', margin.left + innerW / 2).attr('y', H - 50).attr('text-anchor', 'middle')
    .text('← liberal       Ideology       conservative →')
  svg.append('text').attr('class', 'vm-axis-title').attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('Institutional trust  (low ← → high)')

  // Legend
  const legY = 78
  const items = [
    { color: COLOR_DEM, label: 'Democratic voters' },
    { color: COLOR_REP, label: 'Republican voters' },
    { color: COLOR_IND, label: 'Independent voters' },
  ]
  let lx = margin.left
  for (const it of items) {
    svg.append('rect').attr('x', lx).attr('y', legY - 4).attr('width', 14).attr('height', 8)
      .attr('fill', it.color).attr('opacity', 0.35).attr('stroke', it.color).attr('stroke-opacity', 0.6)
    svg.append('text').attr('x', lx + 20).attr('y', legY + 3).attr('font-size', '10.5px').attr('fill', '#444').text(it.label)
    lx += 20 + it.label.length * 6.5 + 18
  }

  // Footer with cohort definitions made explicit
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 18)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text(`Cross-pressured = independents + cross-party defectors (Dem voted Rep candidate OR Rep voted Dem candidate). Irregular = voted current cycle but not prior, OR prior but not current.`)
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 4)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text(`Trend lines drawn only where bin n ≥ 40 (all) / 30 (cross-pressured) / 15 (irregular).`)
}

// Backwards-compat single-render API (used if HTML still has the old element)
export function drawVoterMap2016(selector, data, opts = {}) {
  const container = document.querySelector(selector)
  if (!container) return
  container.innerHTML = ''
  drawChart(container, data, opts)
}
