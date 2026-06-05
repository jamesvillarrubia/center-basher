// Fig 18 — Multi-year, tabbed voter map (trust × ideology).
//
// Three years (2016 / 2020 / 2024) × two scopes (national / swing-state) ×
// per-layer toggles for both density blobs and trend lines.
//
// Layers (each independently toggleable; show blob, line, or both):
//   Party blobs:   Democratic / Republican / Independent
//   Cohort lines:  All voters / Swing / Activated (new) / Stayed-home (drop-off)
//   Cohort blobs:  Swing / Activated / Stayed-home
//
// Cohort definitions (consistent across years):
//   Swing (sw):       independents OR cross-party defectors
//   Activated (n2):   voted this cycle, NOT the prior cycle
//   Stayed-home (do): voted prior cycle, NOT this cycle
//
// Data: scripts/build_voter_maps_all.py → voter_map_2016.json / _2020 / _2024
import * as d3 from 'https://esm.sh/d3@7'
import { contourDensity } from 'https://esm.sh/d3-contour@4'

const COLOR_DEM = '#2c5b9c'
const COLOR_REP = '#b8240f'
const COLOR_IND = '#666'
const COLOR_SWING = '#a06400'
const COLOR_ACTIV = '#2e7d32'
const COLOR_DROP  = '#7a4d8a'
const COLOR_ALL   = '#1b1b1d'

function partyGroup(p) {
  if (p === 'dem') return 'D'
  if (p === 'rep') return 'R'
  return 'I'
}

// Per-candidate blob layers. 2016 uses primary voters (pv) since Sanders had
// no general-election cohort. 2020/2024 use general-election vote (v).
const CANDIDATE_LAYERS_BY_YEAR = {
  2016: {
    cand_clinton16: { kind: 'blob', label: 'Clinton (primary)', color: '#2c5b9c', visible: false, filter: v => v.pv === 'clinton' },
    cand_sanders16: { kind: 'blob', label: 'Sanders (primary)', color: '#4a9b6d', visible: false, filter: v => v.pv === 'sanders' },
    cand_trump16:   { kind: 'blob', label: 'Trump (primary)',   color: '#b8240f', visible: false, filter: v => v.pv === 'trump' },
  },
  2020: {
    cand_biden20:   { kind: 'blob', label: 'Biden (general)',   color: '#2c5b9c', visible: false, filter: v => v.v === 'biden' },
    cand_trump20:   { kind: 'blob', label: 'Trump (general)',   color: '#b8240f', visible: false, filter: v => v.v === 'trump' },
  },
  2024: {
    cand_harris24:  { kind: 'blob', label: 'Harris (general)',  color: '#2c5b9c', visible: false, filter: v => v.v === 'harris' },
    cand_trump24:   { kind: 'blob', label: 'Trump (general)',   color: '#b8240f', visible: false, filter: v => v.v === 'trump' },
  },
}

// Year-independent layers.
// DEFAULTS chosen to tell the CAUSAL swing story on first load:
//   - Swing blob + line ON (where swing voters sit + their trust trend)
//   - All other layers OFF — user toggles to overlay more
//   - show_centroids OFF (tautological "where candidate's voters are"
//     hidden by default; perceived-candidate discs carry the causal story)
const LAYER_DEFAULTS = {
  show_centroids: { kind: 'meta', label: 'Candidate-voter centroids (big dots)', color: '#666', visible: false },
  party_D:    { kind: 'blob', label: 'Democratic blob',  color: COLOR_DEM,   visible: false, filter: v => v.p === 'dem' },
  party_R:    { kind: 'blob', label: 'Republican blob',  color: COLOR_REP,   visible: false, filter: v => v.p === 'rep' },
  party_I:    { kind: 'blob', label: 'Independent blob', color: COLOR_IND,   visible: false, filter: v => v.p === 'ind' },
  line_all:   { kind: 'line', label: 'All-voter line', color: COLOR_ALL,   visible: false, filter: v => true, dash: null,  width: 2.6, stat: 'median' },
  swing_blob: { kind: 'blob', label: 'Swing blob',     color: COLOR_SWING, visible: true,  filter: v => v.sw },
  swing_line: { kind: 'line', label: 'Swing line',     color: COLOR_SWING, visible: true,  filter: v => v.sw, dash: '4,3', width: 1.9, stat: 'median' },
  activ_blob: { kind: 'blob', label: 'Activated blob', color: COLOR_ACTIV, visible: false, filter: v => v.n2 },
  activ_line: { kind: 'line', label: 'Activated line', color: COLOR_ACTIV, visible: false, filter: v => v.n2, dash: '2,3', width: 1.7, stat: 'median' },
  drop_blob:  { kind: 'blob', label: 'Stayed-home blob', color: COLOR_DROP, visible: false, filter: v => v.do },
  drop_line:  { kind: 'line', label: 'Stayed-home line', color: COLOR_DROP, visible: false, filter: v => v.do, dash: '1,3', width: 1.7, stat: 'median' },
}

function cloneLayers(src) {
  const out = {}
  for (const k of Object.keys(src)) out[k] = { ...src[k] }
  return out
}

function buildLayersForYear(year) {
  // Merge year-independent defaults with the candidate blob set for this year.
  // Preserve any visibility the user already toggled (so switching tabs is sticky).
  const out = cloneLayers(LAYER_DEFAULTS)
  const cands = CANDIDATE_LAYERS_BY_YEAR[year] || {}
  for (const k of Object.keys(cands)) out[k] = { ...cands[k] }
  return out
}

let __state = {
  year: 2016,
  scope: 'national',
  dataByYear: {},
  layers: buildLayersForYear(2016),
  // Preserve toggled visibility across year switches by candidate-name suffix.
  // E.g., if user turns ON 'cand_trump16', also turn on 'cand_trump20', 'cand_trump24'.
  stickyCandVisible: { clinton: false, sanders: false, trump: false, biden: false, harris: false },
}

export function mountVoterMapTabbed(selector, dataByYear) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''
  __state.dataByYear = dataByYear

  // Year × scope tabs
  const tabBar = document.createElement('div')
  tabBar.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center;font-size:13px;'
  const yearTabs = [2016, 2020, 2024]
  const scopeTabs = [
    { key: 'national', label: 'National' },
    { key: 'swing',    label: 'Swing states only' },
  ]
  yearTabs.forEach(y => {
    const btn = document.createElement('button')
    btn.textContent = y
    btn.dataset.year = y
    btn.className = 'vm-tab vm-year-tab'
    btn.style.cssText = 'padding:5px 14px;border-radius:4px;border:1px solid #888;background:#fff;color:#333;cursor:pointer;font-weight:600;'
    btn.addEventListener('click', () => {
      __state.year = y
      // Rebuild layer set for this year, restoring sticky candidate toggles
      const fresh = buildLayersForYear(y)
      for (const k of Object.keys(fresh)) {
        if (k.startsWith('cand_')) {
          const candName = candNameFromKey(k)
          fresh[k].visible = !!__state.stickyCandVisible[candName]
        } else if (__state.layers[k]) {
          fresh[k].visible = __state.layers[k].visible
        }
      }
      __state.layers = fresh
      rebuildLayerPanel(container)
      renderAll(container)
    })
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

  // Layer toggle panel (rebuilds when year changes so candidate set updates)
  const layerPanel = document.createElement('div')
  layerPanel.className = 'vm-layer-panel'
  layerPanel.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:0.75rem;padding:8px 10px;border:1px solid #ddd;border-radius:6px;background:#fafafa;font-size:12px;'

  const chartWrap = document.createElement('div')
  chartWrap.className = 'vm-chart-wrap'

  container.appendChild(tabBar)
  container.appendChild(layerPanel)
  container.appendChild(chartWrap)
  rebuildLayerPanel(container)
  renderAll(container)
}

function candNameFromKey(layerKey) {
  // 'cand_trump16' → 'trump'; 'cand_harris24' → 'harris'
  return layerKey.replace(/^cand_/, '').replace(/\d+$/, '')
}

function rebuildLayerPanel(container) {
  const layerPanel = container.querySelector('.vm-layer-panel')
  if (!layerPanel) return
  layerPanel.innerHTML = ''
  // Meta row — show/hide the tautological "candidate-voter centroids" view
  layerPanel.appendChild(makeLayerRow('Overlay', ['show_centroids'], container))
  // Cohort blobs (the 'where they sit' layer for each cohort)
  layerPanel.appendChild(makeLayerRow('Cohort blobs', [
    'swing_blob', 'activ_blob', 'drop_blob',
  ], container))
  // Lines (median trust per ideology bin)
  layerPanel.appendChild(makeLayerRow('Cohort lines', [
    'swing_line', 'activ_line', 'drop_line', 'line_all',
  ], container))
  // Party blobs (always-on context — off by default)
  layerPanel.appendChild(makeLayerRow('Party blobs', [
    'party_D', 'party_R', 'party_I',
  ], container))
  // Candidate-voter blobs row (this year's set)
  const candKeys = Object.keys(__state.layers).filter(k => k.startsWith('cand_'))
  if (candKeys.length > 0) {
    layerPanel.appendChild(makeLayerRow('Candidate-voter blobs', candKeys, container))
  }
}

function makeLayerRow(title, layerKeys, container) {
  const row = document.createElement('div')
  row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;'
  const titleEl = document.createElement('span')
  titleEl.textContent = title + ':'
  titleEl.style.cssText = 'font-weight:700;color:#444;min-width:170px;'
  row.appendChild(titleEl)
  for (const key of layerKeys) {
    const L = __state.layers[key]
    if (!L) continue
    const wrap = document.createElement('label')
    wrap.style.cssText = 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;user-select:none;'
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = L.visible
    cb.addEventListener('change', () => {
      __state.layers[key].visible = cb.checked
      // Sticky across years for candidate toggles
      if (key.startsWith('cand_')) {
        __state.stickyCandVisible[candNameFromKey(key)] = cb.checked
      }
      renderAll(container)
    })
    const swatch = document.createElement('span')
    swatch.style.cssText = `display:inline-block;width:12px;height:12px;background:${L.color};opacity:${L.kind === 'blob' ? 0.35 : 1};border:1px solid ${L.color};border-radius:${L.kind === 'blob' ? '2px' : '6px'};`
    const txt = document.createElement('span')
    txt.textContent = L.label
    txt.style.color = '#333'
    wrap.appendChild(cb); wrap.appendChild(swatch); wrap.appendChild(txt)
    row.appendChild(wrap)
  }
  return row
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
  const margin = { top: 110, right: 30, bottom: 108, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  svg.append('text').attr('class', 'vm-title').attr('x', margin.left).attr('y', 22)
    .text(`${year} trust × ideology voter map${swingOnly ? ' — swing states only' : ''}`)
  svg.append('text').attr('class', 'vm-subtitle').attr('x', margin.left).attr('y', 42)
    .text(`n = ${voters.length.toLocaleString()} ANES respondents. X = ideology (V161126 / V201200 / V241177). Y = trust composite (0–0.8 shown; full scale 0–1, almost no voters above 0.8).`)
  svg.append('text').attr('class', 'vm-subtitle').attr('x', margin.left).attr('y', 58)
    .text('READING THE CHART: open ring = where this cohort of voters sits (their own ideology × trust). Colored discs = where this cohort PERCEIVES each candidate (their ideology placement × cares+leadership rating). % inside disc = cohort capture share. Closer disc + higher % → identity drove capture. Closer disc + lower % → regime/other forces overrode.')

  const x = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 0.8]).range([innerH, 0])

  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', innerH).attr('stroke', '#ccc')
  g.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', y(0.4)).attr('y2', y(0.4)).attr('stroke', '#ccc')

  // BLOB LAYERS — render in declared order so party blobs go first (under), cohort blobs over.
  function drawDensity(pts, color, opts = {}) {
    const minN = opts.minN ?? 30
    if (pts.length < minN) return
    const bandwidth = opts.bandwidth ?? 28
    const thresholds = opts.thresholds ?? 6
    const fillBase = opts.fillBase ?? 0.06
    const fillStep = opts.fillStep ?? 0.10
    const strokeOp = opts.strokeOp ?? 0.30
    const density = contourDensity()
      .x(d => x(d.x)).y(d => y(d.y))
      .size([innerW, innerH]).bandwidth(bandwidth).thresholds(thresholds)(pts)
    g.append('g').selectAll('path').data(density).join('path')
      .attr('d', d3.geoPath())
      .attr('fill', color).attr('fill-opacity', (d, i) => fillBase + (i / Math.max(1, density.length)) * fillStep)
      .attr('stroke', color).attr('stroke-opacity', strokeOp).attr('stroke-width', 0.7)
  }

  // Blob rendering order (bottom → top):
  //   Party blobs first (broad), then cohort blobs, then candidate blobs on top
  const blobOrder = [
    'party_I', 'party_D', 'party_R',
    'swing_blob', 'activ_blob', 'drop_blob',
    ...Object.keys(__state.layers).filter(k => k.startsWith('cand_')),
  ]
  for (const key of blobOrder) {
    const L = __state.layers[key]
    if (!L || !L.visible) continue
    const pts = voters.filter(L.filter)
    const isCohort = key === 'swing_blob' || key === 'activ_blob' || key === 'drop_blob'
    const isCand = key.startsWith('cand_')
    if (isCand) {
      drawDensity(pts, L.color, { minN: 25, bandwidth: 30, thresholds: 6, fillBase: 0.08, fillStep: 0.16, strokeOp: 0.55 })
    } else if (isCohort) {
      drawDensity(pts, L.color, { minN: 25, bandwidth: 34, thresholds: 5, fillBase: 0.07, fillStep: 0.14, strokeOp: 0.40 })
    } else {
      drawDensity(pts, L.color, { minN: 30, bandwidth: 28, thresholds: 6, fillBase: 0.06, fillStep: 0.10, strokeOp: 0.30 })
    }
  }

  // LINE LAYERS — trend = weighted mean trust per ideology bin.
  function trendFor(filter, stat = 'mean') {
    const bins = new Map()
    for (const v of voters) {
      if (!filter(v)) continue
      const key = Math.round(v.x * 6) / 6
      const b = bins.get(key) || { items: [], sw: 0, swy: 0, n: 0 }
      const w = v.w || 1
      b.items.push({ y: v.y, w })
      b.sw += w; b.swy += w * v.y; b.n += 1
      bins.set(key, b)
    }
    function weightedMedian(items) {
      const sorted = items.slice().sort((a, b) => a.y - b.y)
      const totalW = sorted.reduce((s, it) => s + it.w, 0)
      let cum = 0
      for (const it of sorted) {
        cum += it.w
        if (cum >= totalW / 2) return it.y
      }
      return sorted[sorted.length - 1].y
    }
    return [...bins.entries()]
      .filter(([_, b]) => b.n >= 3)
      .map(([xv, b]) => ({
        x: xv,
        y: stat === 'median' ? weightedMedian(b.items) : b.swy / b.sw,
        n: b.n,
      }))
      .sort((a, b) => a.x - b.x)
  }
  const trendLine = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveMonotoneX)
  const N_HI = 40, N_LO = 15

  const lineOrder = ['line_all', 'swing_line', 'activ_line', 'drop_line']
  for (const key of lineOrder) {
    const L = __state.layers[key]
    if (!L || !L.visible) continue
    const pts = trendFor(L.filter, L.stat || 'mean')
    if (pts.length < 2) continue
    // Draw the CONNECTING LINE only through reliable bins (n >= N_LO).
    // Sparse-bin X markers float as standalone — they don't anchor the path,
    // so the line reflects where the cohort actually clusters.
    const reliablePts = pts.filter(p => p.n >= N_LO)
    if (reliablePts.length >= 2) {
      g.append('path').datum(reliablePts).attr('d', trendLine)
        .attr('fill', 'none').attr('stroke', L.color).attr('stroke-width', L.width)
        .attr('stroke-dasharray', L.dash).attr('opacity', 0.7)
    }
    for (const p of pts) {
      const cx = x(p.x), cy = y(p.y)
      if (p.n >= N_HI) {
        g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 3.5)
          .attr('fill', L.color).attr('stroke', '#fff').attr('stroke-width', 1)
      } else if (p.n >= N_LO) {
        g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 3)
          .attr('fill', '#fff').attr('stroke', L.color).attr('stroke-width', 1.5)
      } else {
        const s = 4
        g.append('line').attr('x1', cx-s).attr('x2', cx+s).attr('y1', cy-s).attr('y2', cy+s)
          .attr('stroke', L.color).attr('stroke-width', 1.6).attr('opacity', 0.55)
        g.append('line').attr('x1', cx-s).attr('x2', cx+s).attr('y1', cy+s).attr('y2', cy-s)
          .attr('stroke', L.color).attr('stroke-width', 1.6).attr('opacity', 0.55)
      }
    }
    // Place label at the rightmost RELIABLE bin (not at an X marker)
    const labelTarget = reliablePts.length > 0 ? reliablePts[reliablePts.length - 1] : pts[pts.length - 1]
    g.append('text').attr('x', x(labelTarget.x) + 6).attr('y', y(labelTarget.y) + 4)
      .attr('font-size', '10px').attr('font-weight', '700').attr('fill', L.color)
      .text(L.label.replace(/ line$/, '').replace(/^All-voter$/, 'All'))
  }

  // PERCEIVED-CANDIDATE LAYER: for each visible cohort, render:
  //   - Cohort centroid (open ring at voter self-position median)
  //   - PERCEIVED candidate position (candidate-colored dot at where this
  //     cohort PLACED the candidate on ideology × honesty)
  //   - Tether between them, labeled with capture share
  //
  // This breaks the spatial-voting tautology: where voters PERCEIVE the
  // candidate to be is independent of who they voted for. Every respondent
  // placed every candidate. Proximity between cohort centroid and
  // perceived-candidate position is a non-tautological signal of identity.
  const perceivedCohorts = [
    { key: 'swing',     layerKeys: ['swing_line', 'swing_blob'], color: COLOR_SWING, shortLabel: 'Swing' },
    { key: 'activated', layerKeys: ['activ_line', 'activ_blob'], color: COLOR_ACTIV, shortLabel: 'Activated' },
  ]
  const cohortCentroids = data.cohort_centroids || {}
  for (const pc of perceivedCohorts) {
    const visible = pc.layerKeys.some(k => __state.layers[k] && __state.layers[k].visible)
    if (!visible) continue
    // For swing-state scope, recompute cohort centroid + perceived position
    // from the filtered voter set (data has national-scope values baked in)
    let cc, perceivedByCand
    if (swingOnly) {
      // Recompute cohort centroid from swing-state voters in this cohort
      const inCohort = voters.filter(v => pc.key === 'swing' ? v.sw : v.n2)
      if (inCohort.length === 0) continue
      let tw = 0, sx = 0, sy = 0
      for (const v of inCohort) { const w = v.w || 1; tw += w; sx += v.x * w; sy += v.y * w }
      cc = { x: sx / tw, y: sy / tw, n: inCohort.length }
      perceivedByCand = {}
      for (const c of cands) {
        const isDem = c.id === 'clinton' || c.id === 'biden' || c.id === 'harris'
        const isRep = c.id === 'trump'
        if (!isDem && !isRep) continue
        const xkey = isDem ? 'px_d' : 'px_r'
        const ykey = isDem ? 'py_d' : 'py_r'
        let twP = 0, sxP = 0, syP = 0, twC = 0, twCcand = 0
        for (const v of inCohort) {
          if (v[xkey] != null && v[ykey] != null) {
            const w = v.w || 1; twP += w; sxP += v[xkey] * w; syP += v[ykey] * w
          }
          twC += v.w || 1; if (v.v === c.id) twCcand += v.w || 1
        }
        if (twP === 0) continue
        perceivedByCand[c.id] = {
          x: sxP / twP, y: syP / twP,
          capture: twC > 0 ? twCcand / twC : null,
        }
      }
    } else {
      cc = cohortCentroids[pc.key]
      perceivedByCand = {}
      for (const c of cands) {
        const p = c.perceived && c.perceived[pc.key]
        if (!p) continue
        perceivedByCand[c.id] = p
      }
    }
    if (!cc) continue
    const ccx = x(cc.x), ccy = y(cc.y)
    // Cohort centroid marker
    g.append('circle').attr('cx', ccx).attr('cy', ccy).attr('r', 7)
      .attr('fill', '#fff').attr('stroke', pc.color).attr('stroke-width', 2.4)
    g.append('text').attr('x', ccx).attr('y', ccy - 11).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('font-weight', '700').attr('fill', pc.color)
      .text(`${pc.shortLabel} center`)
    // Perceived-candidate position + tether per candidate
    for (const candId of Object.keys(perceivedByCand)) {
      const cand = cands.find(c => c.id === candId)
      if (!cand) continue
      const p = perceivedByCand[candId]
      const pcx = x(p.x), pcy = y(p.y)
      // Tether from cohort centroid to perceived candidate position
      g.append('line').attr('x1', ccx).attr('y1', ccy).attr('x2', pcx).attr('y2', pcy)
        .attr('stroke', cand.color).attr('stroke-width', 1.6)
        .attr('stroke-opacity', 0.7).attr('stroke-dasharray', '4,3')
      // Perceived position: candidate-colored ring with capture % INSIDE.
      // Candidate name labeled BELOW so the disc is self-explanatory.
      const pct = p.capture != null ? Math.round(p.capture * 100) : null
      g.append('circle').attr('cx', pcx).attr('cy', pcy).attr('r', 14)
        .attr('fill', '#fff').attr('stroke', cand.color).attr('stroke-width', 2.2)
      g.append('circle').attr('cx', pcx).attr('cy', pcy).attr('r', 14)
        .attr('fill', cand.color).attr('fill-opacity', 0.15).attr('stroke', 'none')
      if (pct != null) {
        g.append('text').attr('x', pcx).attr('y', pcy + 4.5)
          .attr('text-anchor', 'middle').attr('font-size', '12px')
          .attr('font-weight', '800').attr('fill', cand.color).text(`${pct}%`)
      }
      // Candidate name below the disc
      g.append('text').attr('x', pcx).attr('y', pcy + 28)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .attr('font-weight', '700').attr('fill', cand.color).text(cand.short)
    }
  }

  // Candidate-voter centroids — TAUTOLOGICAL view (where the candidate's
  // OWN voters self-place). Hidden by default since it conflates with the
  // perceived-candidate causal story. Toggle 'show_centroids' to display.
  if (__state.layers.show_centroids && __state.layers.show_centroids.visible) {
    for (const c of cands) {
      const cx = x(c.x); const cy = y(c.y)
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 9).attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
      const labelOffsetY = c.id === 'sanders' ? 26 : c.id === 'clinton' || c.id === 'biden' || c.id === 'harris' ? -16 : 26
      g.append('text').attr('x', cx).attr('y', cy + labelOffsetY).attr('text-anchor', 'middle')
        .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color).text(c.short)
      g.append('text').attr('x', cx).attr('y', cy + labelOffsetY + 13).attr('text-anchor', 'middle')
        .attr('font-size', '10px').attr('fill', '#444').attr('font-style', 'italic')
        .text(`(${c.x > 0 ? '+' : ''}${c.x}, ${c.y})`)
    }
  }

  // Subcohort centroids per candidate (small S/A/D markers).
  // SUPPRESSED for swing + activated when the perceived-candidate layer
  // is showing those cohorts — they tell a tautological version of the
  // same story and clutter the chart. Still shown for stayed-home.
  const cohortRender = [
    { key: 'swing', layerKeys: ['swing_line', 'swing_blob'], color: COLOR_SWING, glyph: 'swing', supressedByPerceived: true },
    { key: 'activated', layerKeys: ['activ_line', 'activ_blob'], color: COLOR_ACTIV, glyph: 'activ', supressedByPerceived: true },
    { key: 'stayed_home', layerKeys: ['drop_line', 'drop_blob'], color: COLOR_DROP, glyph: 'drop', supressedByPerceived: false },
  ]
  for (const cr of cohortRender) {
    if (!cr.layerKeys.some(k => __state.layers[k].visible)) continue
    if (cr.supressedByPerceived) continue   // perceived layer wins for these cohorts
    for (const c of cands) {
      const sc = c.subcohorts && c.subcohorts[cr.key]
      if (!sc) continue
      const bx = x(c.x), by = y(c.y)
      const sx = x(sc.x), sy = y(sc.y)
      // Tether line from base centroid to subcohort dot
      g.append('line').attr('x1', bx).attr('y1', by).attr('x2', sx).attr('y2', sy)
        .attr('stroke', c.color).attr('stroke-opacity', 0.45)
        .attr('stroke-dasharray', '2,2').attr('stroke-width', 1)
      // Outer ring in cohort color
      g.append('circle').attr('cx', sx).attr('cy', sy).attr('r', 6)
        .attr('fill', 'none').attr('stroke', cr.color).attr('stroke-width', 1.8)
      // Inner fill in candidate color
      g.append('circle').attr('cx', sx).attr('cy', sy).attr('r', 4)
        .attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 1)
      // Small label (cohort initial letter)
      const letter = cr.key === 'swing' ? 'S' : cr.key === 'activated' ? 'A' : 'D'
      g.append('text').attr('x', sx).attr('y', sy - 9).attr('text-anchor', 'middle')
        .attr('font-size', '9px').attr('font-weight', '700').attr('fill', cr.color)
        .text(letter)
    }
  }

  // Axes
  g.append('g').attr('class', 'vm-axis').attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'vm-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  svg.append('text').attr('class', 'vm-axis-title').attr('x', margin.left + innerW / 2).attr('y', H - 50).attr('text-anchor', 'middle')
    .text('← liberal       Ideology       conservative →')
  svg.append('text').attr('class', 'vm-axis-title').attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('Institutional trust  (low ← → high)')

  // Footer with cohort definitions
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 32)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text(`Swing = independents + cross-party defectors. Activated = voted this cycle, not prior. Stayed-home = voted prior cycle, not this one.`)
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 18)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text(`Big dot = candidate's mean voter position. Small dot + 'perc. X' label = where this cohort PERCEIVED the candidate to be (ideology placement × cares+leadership composite — the candidate analog of the voter trust composite). Tether labeled with capture % shows whether perceived proximity translated to capture.`)
  svg.append('text').attr('class', 'vm-foot').attr('x', margin.left).attr('y', H - 4)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text(`Line markers: ● n ≥ 40 (reliable) · ○ n ≥ 15 (moderate) · ✕ n < 15 (uncertain).`)
}

// Backwards-compat single-render API
export function drawVoterMap2016(selector, data, opts = {}) {
  const container = document.querySelector(selector)
  if (!container) return
  container.innerHTML = ''
  drawChart(container, data, opts)
}
