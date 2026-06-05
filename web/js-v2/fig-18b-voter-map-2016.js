// Fig 18 — Multi-year, tabbed voter map (trust × ideology).
//
// Scenario-based design (2026-06-05 redesign):
//   Each "scenario" is a cohort that bundles its blob + line + centroid
//   ring + capture pills as ONE toggle. User picks scenarios to overlay.
//
//   Behavioral scenarios:   Swing / Activated / Stayed-home
//   Party-ID scenarios:     Democrats / Republicans / Independents
//   Primary scenarios:      Clinton primary / Sanders primary / Trump primary (2016 only)
//
// Always shown: candidate-voter centroids (big colored dots), candidate name labels.
// Default: Swing scenario ON, all others OFF.
//
// Data: scripts/build_voter_maps_all.py → voter_map_2016.json / _2020 / _2024

import * as d3 from 'https://esm.sh/d3@7'
import { contourDensity } from 'https://esm.sh/d3-contour@4'

// ---- Colors ----
const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_IND = '#666'
const COLOR_SWING = '#a06400'
const COLOR_ACTIV = '#2e7d32'
const COLOR_DROP  = '#7a4d8a'
const COLOR_CLINTON_PV = '#5588cc'
const COLOR_SANDERS_PV = '#4a9b6d'
const COLOR_TRUMP_PV   = '#d35a3d'

// ---- Scenarios ----
// Each scenario is one toggle that bundles:
//   blob + line + cohort centroid + capture pills next to candidate dots
// `filter` selects voters in the cohort.
// `has_capture` controls whether capture % pills render (stayed-home doesn't vote).
// `years` (optional) restricts the scenario to a subset of cycles.
const SCENARIOS = [
  // Behavioral cohorts
  { id: 'swing',       label: 'Swing voters',        group: 'Behavioral', color: COLOR_SWING, filter: v => v.sw, dash: '4,3', has_capture: true },
  { id: 'activated',   label: 'Activated (new)',     group: 'Behavioral', color: COLOR_ACTIV, filter: v => v.n2, dash: '2,3', has_capture: true },
  { id: 'stayed_home', label: 'Stayed-home',         group: 'Behavioral', color: COLOR_DROP,  filter: v => v.do, dash: '1,3', has_capture: false },
  // Party ID cohorts
  { id: 'dem',         label: 'Democrats',           group: 'Party ID',   color: COLOR_DEM,   filter: v => v.p === 'dem', dash: '5,2', has_capture: true },
  { id: 'rep',         label: 'Republicans',         group: 'Party ID',   color: COLOR_REP,   filter: v => v.p === 'rep', dash: '5,2', has_capture: true },
  { id: 'ind',         label: 'Independents',        group: 'Party ID',   color: COLOR_IND,   filter: v => v.p === 'ind', dash: '5,2', has_capture: true },
  // Primary cohorts (2016 only)
  { id: 'clinton_pv',  label: 'Clinton primary',     group: 'Primary',    color: COLOR_CLINTON_PV, filter: v => v.pv === 'clinton', dash: '3,2', has_capture: true, years: [2016] },
  { id: 'sanders_pv',  label: 'Sanders primary',     group: 'Primary',    color: COLOR_SANDERS_PV, filter: v => v.pv === 'sanders', dash: '3,2', has_capture: true, years: [2016] },
  { id: 'trump_pv',    label: 'Trump primary',       group: 'Primary',    color: COLOR_TRUMP_PV,   filter: v => v.pv === 'trump',   dash: '3,2', has_capture: true, years: [2016] },
]

const __state = {
  year: 2016,
  scope: 'national',
  dataByYear: {},
  enabled: { swing: true },   // scenario id → true
}

export function mountVoterMapTabbed(selector, dataByYear) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''
  __state.dataByYear = dataByYear

  const tabBar = document.createElement('div')
  tabBar.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center;font-size:13px;'
  ;[2016, 2020, 2024].forEach(yr => {
    const btn = document.createElement('button')
    btn.textContent = yr; btn.dataset.year = yr; btn.className = 'vm-tab vm-year-tab'
    btn.style.cssText = 'padding:5px 14px;border-radius:4px;border:1px solid #888;background:#fff;color:#333;cursor:pointer;font-weight:600;'
    btn.addEventListener('click', () => {
      __state.year = yr
      rebuildScenarioPanel(container)
      renderAll(container)
    })
    tabBar.appendChild(btn)
  })
  const sep = document.createElement('span'); sep.textContent = '|'; sep.style.cssText = 'color:#bbb;margin:0 4px;'
  tabBar.appendChild(sep)
  ;[{ key: 'national', label: 'National' }, { key: 'swing', label: 'Swing states only' }].forEach(s => {
    const btn = document.createElement('button')
    btn.textContent = s.label; btn.dataset.scope = s.key; btn.className = 'vm-tab vm-scope-tab'
    btn.style.cssText = 'padding:5px 14px;border-radius:4px;border:1px solid #888;background:#fff;color:#333;cursor:pointer;font-weight:600;'
    btn.addEventListener('click', () => { __state.scope = s.key; renderAll(container) })
    tabBar.appendChild(btn)
  })

  const scenarioPanel = document.createElement('div')
  scenarioPanel.className = 'vm-scenario-panel'
  scenarioPanel.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:0.75rem;padding:10px 12px;border:1px solid #ddd;border-radius:6px;background:#fafafa;font-size:12px;'

  const chartWrap = document.createElement('div')
  chartWrap.className = 'vm-chart-wrap'

  container.appendChild(tabBar)
  container.appendChild(scenarioPanel)
  container.appendChild(chartWrap)
  rebuildScenarioPanel(container)
  renderAll(container)
}

function scenariosForYear(year) {
  return SCENARIOS.filter(s => !s.years || s.years.includes(year))
}

function rebuildScenarioPanel(container) {
  const panel = container.querySelector('.vm-scenario-panel')
  if (!panel) return
  panel.innerHTML = ''
  const scenarios = scenariosForYear(__state.year)
  const groups = ['Behavioral', 'Party ID', 'Primary']
  for (const g of groups) {
    const groupScenarios = scenarios.filter(s => s.group === g)
    if (groupScenarios.length === 0) continue
    const row = document.createElement('div')
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;'
    const title = document.createElement('span')
    title.textContent = g + ':'
    title.style.cssText = 'font-weight:700;color:#444;min-width:90px;font-size:12px;'
    row.appendChild(title)
    for (const s of groupScenarios) {
      const wrap = document.createElement('label')
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:6px;cursor:pointer;user-select:none;'
      const cb = document.createElement('input')
      cb.type = 'checkbox'; cb.checked = !!__state.enabled[s.id]
      cb.addEventListener('change', () => {
        __state.enabled[s.id] = cb.checked
        renderAll(container)
      })
      const swatch = document.createElement('span')
      swatch.style.cssText = `display:inline-block;width:14px;height:10px;background:${s.color};opacity:0.45;border:1.5px solid ${s.color};border-radius:2px;`
      const txt = document.createElement('span')
      txt.textContent = s.label; txt.style.color = '#333'
      wrap.appendChild(cb); wrap.appendChild(swatch); wrap.appendChild(txt)
      row.appendChild(wrap)
    }
    panel.appendChild(row)
  }
}

function renderAll(container) {
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
  const margin = { top: 110, right: 30, bottom: 92, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title + subtitle
  svg.append('text').attr('class', 'vm-title').attr('x', margin.left).attr('y', 22)
    .text(`${year} trust × ideology voter map${swingOnly ? ' — swing states only' : ''}`)
  svg.append('text').attr('class', 'vm-subtitle').attr('x', margin.left).attr('y', 42)
    .text(`n = ${voters.length.toLocaleString()} ANES respondents. X = self-reported ideology (1-7 → -1..+1). Y = institutional trust composite (0–0.8 shown).`)
  svg.append('text').attr('class', 'vm-subtitle').attr('x', margin.left).attr('y', 58)
    .text('Each scenario toggles a cohort blob + trust-by-ideology line + open ring (cohort centroid) + capture % pills next to candidate dots.')

  const x = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 0.8]).range([innerH, 0])

  // Center crosshairs
  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', innerH).attr('stroke', '#ccc')
  g.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', y(0.4)).attr('y2', y(0.4)).attr('stroke', '#ccc')

  // Active scenarios for this year
  const activeScenarios = scenariosForYear(year).filter(s => __state.enabled[s.id])

  // Helper: weighted median
  function weightedMedian(items, key) {
    const sorted = items.slice().sort((a, b) => a[key] - b[key])
    const total = sorted.reduce((s, it) => s + (it.w || 1), 0)
    let cum = 0
    for (const it of sorted) {
      cum += (it.w || 1)
      if (cum >= total / 2) return it[key]
    }
    return sorted[sorted.length - 1][key]
  }
  function weightedMean(items, key) {
    let tw = 0, s = 0
    for (const it of items) { const w = it.w || 1; tw += w; s += it[key] * w }
    return tw > 0 ? s / tw : 0
  }

  // ---- 1. Blobs (one per active scenario) ----
  function drawDensity(pts, color, opts = {}) {
    const minN = opts.minN ?? 25
    if (pts.length < minN) return
    const density = contourDensity()
      .x(d => x(d.x)).y(d => y(d.y))
      .size([innerW, innerH]).bandwidth(opts.bandwidth ?? 30).thresholds(opts.thresholds ?? 6)(pts)
    g.append('g').selectAll('path').data(density).join('path')
      .attr('d', d3.geoPath())
      .attr('fill', color).attr('fill-opacity', (d, i) => 0.06 + (i / Math.max(1, density.length)) * 0.14)
      .attr('stroke', color).attr('stroke-opacity', 0.4).attr('stroke-width', 0.8)
  }
  for (const s of activeScenarios) {
    drawDensity(voters.filter(s.filter), s.color)
  }

  // ---- 2. Lines (median trust per ideology bin, one per active scenario) ----
  function trendFor(filter) {
    const bins = new Map()
    for (const v of voters) {
      if (!filter(v)) continue
      const key = Math.round(v.x * 6) / 6
      const b = bins.get(key) || { items: [], n: 0 }
      b.items.push({ y: v.y, w: v.w || 1 }); b.n += 1
      bins.set(key, b)
    }
    return [...bins.entries()]
      .filter(([_, b]) => b.n >= 3)
      .map(([xv, b]) => ({ x: xv, y: weightedMedian(b.items, 'y'), n: b.n }))
      .sort((a, b) => a.x - b.x)
  }
  const trendLine = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveMonotoneX)
  const N_HI = 40, N_LO = 15
  for (const s of activeScenarios) {
    const pts = trendFor(s.filter)
    if (pts.length < 2) continue
    const reliable = pts.filter(p => p.n >= N_LO)
    if (reliable.length >= 2) {
      g.append('path').datum(reliable).attr('d', trendLine)
        .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 1.8)
        .attr('stroke-dasharray', s.dash).attr('opacity', 0.7)
    }
    for (const p of pts) {
      const cx_ = x(p.x), cy_ = y(p.y)
      if (p.n >= N_HI) {
        g.append('circle').attr('cx', cx_).attr('cy', cy_).attr('r', 3.2).attr('fill', s.color).attr('stroke', '#fff').attr('stroke-width', 1)
      } else if (p.n >= N_LO) {
        g.append('circle').attr('cx', cx_).attr('cy', cy_).attr('r', 2.8).attr('fill', '#fff').attr('stroke', s.color).attr('stroke-width', 1.3)
      } else {
        const sz = 3.5
        g.append('line').attr('x1', cx_ - sz).attr('x2', cx_ + sz).attr('y1', cy_ - sz).attr('y2', cy_ + sz).attr('stroke', s.color).attr('stroke-width', 1.4).attr('opacity', 0.55)
        g.append('line').attr('x1', cx_ - sz).attr('x2', cx_ + sz).attr('y1', cy_ + sz).attr('y2', cy_ - sz).attr('stroke', s.color).attr('stroke-width', 1.4).attr('opacity', 0.55)
      }
    }
  }

  // ---- 3. Big candidate centroids (ALWAYS shown) ----
  for (const c of cands) {
    const cx_ = x(c.x), cy_ = y(c.y)
    g.append('circle').attr('cx', cx_).attr('cy', cy_).attr('r', 9).attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
    const labelOffsetY = c.id === 'sanders' ? 26 : (c.id === 'clinton' || c.id === 'biden' || c.id === 'harris' ? -16 : 26)
    g.append('text').attr('x', cx_).attr('y', cy_ + labelOffsetY).attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color).text(c.short)
  }

  // ---- 4. Per-scenario cohort centroid + capture pills ----
  // For multiple active scenarios, stack capture pills vertically next to each candidate
  // (one pill per active scenario per candidate).
  const stackOffsets = new Map()   // candidateId → next vertical offset for pill
  for (const s of activeScenarios) {
    const inCohort = voters.filter(s.filter)
    if (inCohort.length === 0) continue

    // Cohort centroid (weighted-mean x,y)
    const ccx_v = weightedMean(inCohort, 'x')
    const ccy_v = weightedMean(inCohort, 'y')
    const ccx = x(ccx_v), ccy = y(ccy_v)
    g.append('circle').attr('cx', ccx).attr('cy', ccy).attr('r', 7)
      .attr('fill', '#fff').attr('stroke', s.color).attr('stroke-width', 2.2)
    g.append('text').attr('x', ccx).attr('y', ccy - 10).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('font-weight', '700').attr('fill', s.color)
      .text(`${s.label} · n=${inCohort.length}`)

    if (!s.has_capture) continue

    // Capture pills, stacked vertically near each candidate dot
    let totalW = 0
    for (const v of inCohort) totalW += (v.w || 1)
    for (const c of cands) {
      if (c.id === 'sanders') continue   // primary-only, no general capture
      let candW = 0
      for (const v of inCohort) { if (v.v === c.id) candW += (v.w || 1) }
      if (totalW === 0) continue
      const pct = Math.round((candW / totalW) * 100)
      const cx_ = x(c.x), cy_ = y(c.y)
      const isLeft = c.x < 0
      const baseX = isLeft ? cx_ - 38 : cx_ + 38
      const slotIdx = stackOffsets.get(c.id) || 0
      const baseY = cy_ - 22 + slotIdx * 19
      stackOffsets.set(c.id, slotIdx + 1)
      const pillW = 44
      g.append('rect').attr('x', baseX - pillW / 2).attr('y', baseY - 9).attr('width', pillW).attr('height', 16)
        .attr('rx', 3).attr('fill', '#fff').attr('stroke', s.color).attr('stroke-width', 1.4)
      g.append('text').attr('x', baseX).attr('y', baseY + 4)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .attr('font-weight', '800').attr('fill', s.color).text(`${pct}%`)
    }
  }

  // ---- Axes ----
  g.append('g').attr('class', 'vm-axis').attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'vm-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  svg.append('text').attr('class', 'vm-axis-title').attr('x', margin.left + innerW / 2).attr('y', H - 48).attr('text-anchor', 'middle')
    .text('← liberal       Ideology       conservative →')
  svg.append('text').attr('class', 'vm-axis-title').attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('Institutional trust (low ← → high)')

  // Footer
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 22)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Swing = independents + cross-party defectors. Activated = voted this cycle, not the prior. Stayed-home = voted prior, not this. Primary = 2016 only.')
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 8)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Line markers: ● n ≥ 40 (reliable) · ○ n ≥ 15 (moderate) · ✕ n < 15 (uncertain).')
}

// Backwards-compat single-render API
export function drawVoterMap2016(selector, data, opts = {}) {
  const container = document.querySelector(selector)
  if (!container) return
  container.innerHTML = ''
  drawChart(container, data, opts)
}
