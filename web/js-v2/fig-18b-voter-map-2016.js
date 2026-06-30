// Fig 18 — Multi-year, tabbed voter map (trust × ideology).
//
// Scenario-based design (2026-06-05 redesign):
//   Each "scenario" is a cohort that bundles its blob + line + centroid
//   ring as ONE toggle. User picks scenarios to overlay. (Capture-% pills
//   removed 2026-06-29; the per-preset captions state the split in prose.)
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
//   blob + line + cohort centroid ring
// `filter` selects voters in the cohort.
// `has_capture` is retained on the data but no longer drives any rendering
//   (capture-% pills were removed 2026-06-29).
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
  // Primary cohorts
  // 2016: Clinton / Sanders / Trump primary voters
  // 2020: Biden / Sanders primary voters (Trump uncontested → not interesting)
  // 2024: not included (Biden uncontested as incumbent, Trump effectively uncontested)
  { id: 'clinton_pv',  label: 'Clinton primary',     group: 'Primary',    color: COLOR_CLINTON_PV, filter: v => v.pv === 'clinton', dash: '3,2', has_capture: true, years: [2016] },
  { id: 'sanders_pv',  label: 'Sanders primary',     group: 'Primary',    color: COLOR_SANDERS_PV, filter: v => v.pv === 'sanders', dash: '3,2', has_capture: true, years: [2016, 2020] },
  { id: 'trump_pv',    label: 'Trump primary',       group: 'Primary',    color: COLOR_TRUMP_PV,   filter: v => v.pv === 'trump',   dash: '3,2', has_capture: true, years: [2016] },
  { id: 'biden_pv',    label: 'Biden primary',       group: 'Primary',    color: COLOR_CLINTON_PV, filter: v => v.pv === 'biden',   dash: '3,2', has_capture: true, years: [2020] },
]

// ---- Narrative presets (5 most impactful) ----
// Trimmed from 10 to 5 — the ones that actually carry §17/§18 weight.
// Each preset loads year + scope + scenarios + caption, and is reachable
// either from the chart's preset bar OR from inline buttons embedded in
// the prose (matching data-preset-id attribute).
const PRESETS = [
  {
    id: 'p_2016_swing',
    label: '2016 · Swing (national)',
    year: 2016, scope: 'national',
    enabled: ['swing'],
    caption: 'The swing-voter ring sits low on the trust axis, down with Sanders and Trump, while Clinton floats well above it as the lone high-trust candidate. On ideology the bloc sits near center, between the parties. If Clinton is the establishment candidate and swing voters are not, this is the spatial picture you would expect.',
  },
  {
    id: 'p_2016_activated',
    label: '2016 · Activated (national)',
    year: 2016, scope: 'national',
    enabled: ['activated'],
    caption: 'New voters who skipped 2012 but voted 2016. Their ring sits low on trust, near the swing bloc, with Clinton well above on the trust axis. Nationally Clinton actually won these voters, 45% to 38%; Trump\'s activation edge appears only in the swing states (next preset), which is where it decided the map.',
  },
  {
    id: 'p_2016_primary',
    label: '2016 · Clinton vs Sanders primary',
    year: 2016, scope: 'national',
    enabled: ['clinton_pv', 'sanders_pv'],
    caption: "Both primary electorates lean left and overlap heavily on ideology, with similar spread and each only about 8-9% reaching the conservative side. The real gap is trust: Clinton's primary voters reach higher on the trust axis while Sanders' cluster lower. Sanders' depth was with distrustful voters, not more conservative ones.",
  },
  {
    id: 'p_2024_swing',
    label: '2024 · Swing (national)',
    year: 2024, scope: 'national',
    enabled: ['swing'],
    caption: '2024 swing voters concentrate low on trust, near ideological center. Nationally they leaned Harris, 38% to 25%, with a third staying home. Trump\'s swing-voter advantage was a swing-state phenomenon (next preset), and that is where the Electoral College was decided.',
  },
  {
    id: 'p_2024_activated_ss',
    label: '2024 · Activated (swing states)',
    year: 2024, scope: 'swing',
    enabled: ['activated'],
    caption: "Activated voters in the seven swing states, the cohort that decided the 2024 Electoral College. They sit on the low-trust right, in Trump's territory, and he captured them 51% to 42%. Small cohort (n=43, 79 weighted), so read the position as indicative, not precise.",
  },
]

const __state = {
  year: 2016,
  scope: 'national',
  dataByYear: {},
  enabled: { swing: true },   // scenario id → true
  activePresetId: null,
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
      clearPreset(container)
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
    btn.addEventListener('click', () => { __state.scope = s.key; clearPreset(container); rebuildScenarioPanel(container); renderAll(container) })
    tabBar.appendChild(btn)
  })

  // Preset row (narrative-driven configurations)
  const presetBar = document.createElement('div')
  presetBar.className = 'vm-preset-bar'
  presetBar.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;margin-bottom:0.5rem;padding:8px 10px;border:1px solid #ddd;border-radius:6px;background:#fffceb;font-size:11px;'

  const scenarioPanel = document.createElement('div')
  scenarioPanel.className = 'vm-scenario-panel'
  scenarioPanel.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:0.75rem;padding:10px 12px;border:1px solid #ddd;border-radius:6px;background:#fafafa;font-size:12px;'

  const chartWrap = document.createElement('div')
  chartWrap.className = 'vm-chart-wrap'

  // Caption (appears under chart when a preset is active)
  const captionEl = document.createElement('div')
  captionEl.className = 'vm-preset-caption'
  captionEl.style.cssText = 'margin-top:0.5rem;padding:10px 12px;border-left:3px solid #b39d3f;background:#fffceb;font-size:13px;line-height:1.55;color:#444;display:none;'

  container.appendChild(tabBar)
  container.appendChild(presetBar)
  container.appendChild(scenarioPanel)
  container.appendChild(chartWrap)
  container.appendChild(captionEl)
  rebuildPresetBar(container)
  rebuildScenarioPanel(container)
  renderAll(container)

  // Wire inline preset buttons embedded in prose (data-preset-id="p_...")
  // Click → scroll to figure → load preset → flash highlight.
  for (const btn of document.querySelectorAll('[data-preset-id]')) {
    if (btn.__vmWired) continue
    btn.__vmWired = true
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const presetId = btn.getAttribute('data-preset-id')
      const preset = PRESETS.find(p => p.id === presetId)
      if (!preset) return
      // Scroll to figure, then load preset (so user sees the transition)
      container.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        loadPreset(container, preset)
        // Brief highlight flash
        const chartWrap = container.querySelector('.vm-chart-wrap')
        if (chartWrap) {
          chartWrap.style.transition = 'box-shadow 0.4s ease'
          chartWrap.style.boxShadow = '0 0 0 4px #d8c26a'
          setTimeout(() => { chartWrap.style.boxShadow = '' }, 1200)
        }
      }, 350)
    })
  }
}

function rebuildPresetBar(container) {
  const bar = container.querySelector('.vm-preset-bar')
  if (!bar) return
  bar.innerHTML = ''
  const title = document.createElement('span')
  title.textContent = 'Narratives:'
  title.style.cssText = 'font-weight:700;color:#7a5d00;font-size:11px;margin-right:6px;'
  bar.appendChild(title)
  for (const p of PRESETS) {
    const btn = document.createElement('button')
    btn.textContent = p.label
    btn.title = p.caption
    const isActive = __state.activePresetId === p.id
    btn.style.cssText = `padding:3px 9px;border-radius:3px;border:1px solid ${isActive ? '#7a5d00' : '#c8b870'};background:${isActive ? '#7a5d00' : '#fff'};color:${isActive ? '#fff' : '#5a4400'};cursor:pointer;font-size:11px;font-weight:${isActive ? '700' : '500'};`
    btn.addEventListener('click', () => loadPreset(container, p))
    bar.appendChild(btn)
  }
  // Clear button
  if (__state.activePresetId) {
    const clearBtn = document.createElement('button')
    clearBtn.textContent = '× clear'
    clearBtn.style.cssText = 'padding:3px 7px;border-radius:3px;border:1px solid #aaa;background:#fff;color:#666;cursor:pointer;font-size:11px;margin-left:6px;'
    clearBtn.addEventListener('click', () => clearPreset(container))
    bar.appendChild(clearBtn)
  }
}

function loadPreset(container, preset) {
  __state.year = preset.year
  __state.scope = preset.scope
  __state.enabled = {}
  for (const id of preset.enabled) __state.enabled[id] = true
  __state.activePresetId = preset.id
  rebuildPresetBar(container)
  rebuildScenarioPanel(container)
  renderAll(container)
  // Show caption
  const cap = container.querySelector('.vm-preset-caption')
  if (cap) {
    cap.innerHTML = `<strong style="color:#7a5d00;">${preset.label}</strong><br>${preset.caption}`
    cap.style.display = 'block'
  }
}

function clearPreset(container) {
  __state.activePresetId = null
  rebuildPresetBar(container)
  const cap = container.querySelector('.vm-preset-caption')
  if (cap) cap.style.display = 'none'
}

function scenariosForYear(year) {
  return SCENARIOS.filter(s => !s.years || s.years.includes(year))
}

function rebuildScenarioPanel(container) {
  const panel = container.querySelector('.vm-scenario-panel')
  if (!panel) return
  panel.innerHTML = ''
  const scenarios = scenariosForYear(__state.year)
  // Compute current n for each scenario so the panel can show it next to
  // the label when the cohort is active.
  const data = __state.dataByYear[__state.year]
  const voters = data ? (__state.scope === 'swing' ? data.voters.filter(v => v.s) : data.voters) : []
  function cohortN(scenario) {
    return voters.filter(scenario.filter).length
  }
  const groups = ['Behavioral', 'Party ID', 'Primary']
  for (const grp of groups) {
    const groupScenarios = scenarios.filter(s => s.group === grp)
    if (groupScenarios.length === 0) continue
    const row = document.createElement('div')
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;'
    const title = document.createElement('span')
    title.textContent = grp + ':'
    title.style.cssText = 'font-weight:700;color:#444;min-width:90px;font-size:12px;'
    row.appendChild(title)
    for (const s of groupScenarios) {
      const wrap = document.createElement('label')
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:6px;cursor:pointer;user-select:none;'
      const cb = document.createElement('input')
      cb.type = 'checkbox'; cb.checked = !!__state.enabled[s.id]
      cb.addEventListener('change', () => {
        __state.enabled[s.id] = cb.checked
        clearPreset(container)              // user is editing → not a preset state anymore
        rebuildScenarioPanel(container)     // refresh n suffixes
        renderAll(container)
      })
      const swatch = document.createElement('span')
      swatch.style.cssText = `display:inline-block;width:14px;height:10px;background:${s.color};opacity:0.45;border:1.5px solid ${s.color};border-radius:2px;`
      const txt = document.createElement('span')
      txt.textContent = s.label
      txt.style.color = '#333'
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
  let cands = data.candidates

  const W = 680
  const margin = { top: 24, right: 30, bottom: 56, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title/subtitle live in the HTML figure label + figcaption (the active
  // year/scope is shown by the tab buttons above the chart).

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
  // Weighted geometric median (Weiszfeld). Used for cohort centroid rings so
  // the marker sits inside the dense part of the (right-skewed) trust blob,
  // rather than floating above it the way a mean does. Continuous-valued, so
  // cohorts stay distinct (unlike the per-axis median, which quantizes onto
  // the ~5 discrete trust levels and collapses cohorts onto identical points).
  function geometricMedian(items) {
    if (items.length === 0) return { x: 0, y: 0 }
    let tw = 0, sx = 0, sy = 0
    for (const it of items) { const w = it.w || 1; tw += w; sx += it.x * w; sy += it.y * w }
    let cx = sx / tw, cy = sy / tw
    for (let iter = 0; iter < 200; iter++) {
      let nx = 0, ny = 0, den = 0
      for (const it of items) {
        const w = it.w || 1
        let d = Math.hypot(it.x - cx, it.y - cy)
        if (d < 1e-9) d = 1e-9
        const wd = w / d
        nx += wd * it.x; ny += wd * it.y; den += wd
      }
      const px = nx / den, py = ny / den
      if (Math.hypot(px - cx, py - cy) < 1e-7) { cx = px; cy = py; break }
      cx = px; cy = py
    }
    return { x: cx, y: cy }
  }

  // Candidate dots: geometric median of each candidate's voter base (2016 =
  // primary voters, matching the build script; 2020/2024 = general voters) —
  // the same estimator as the cohort rings, so a filled dot and an open ring
  // never differ merely by mean-vs-median. Candidate dots (and their names) are
  // ALWAYS drawn. When a primary cohort is toggled on, its open ring would land
  // exactly on the matching candidate's filled dot (same people, same geomed),
  // so we drop the redundant ring instead — see the ring-draw loop below.
  cands = data.candidates.map(c => {
    const base = year === 2016
      ? data.voters.filter(v => v.pv === c.id)
      : data.voters.filter(v => v.v === c.id)
    if (base.length === 0) return c
    const gm = geometricMedian(base)
    return { ...c, x: gm.x, y: gm.y }
  })

  // ---- 1. Blobs (one per active scenario) ----
  function drawDensity(pts, color, opts = {}) {
    // Floor of 10: the smallest real cohort is 2024 swing-states stayed-home
    // (n=14), and a small blob reads better than no blob (user call,
    // 2026-06-29). Below ~10 points a density contour is too degenerate to
    // mean anything, so we still suppress those and let the ring stand alone.
    const minN = opts.minN ?? 10
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

  // (Trend-line layer removed: the median-trust-per-ideology-bin line, its
  // ●/○ bin dots, and the ✕ sparse-bin marks added clutter and a second,
  // confusing kind of open marker without supporting the figure's claim. The
  // blob already shows the distribution; the ring shows its center.)

  // ---- 3 + 4. Markers with collision-avoidance label placement ----
  //
  // First pass: compute marker positions (candidate dots + cohort rings).
  // Second pass: draw markers + connector lines.
  // Third pass: place labels using collision avoidance against ALL markers
  // and previously-placed labels.

  // Estimate label box around a center point given text length + font size
  function labelBox(cx, cy, text, fontSize) {
    const w = text.length * fontSize * 0.55 + 6
    const h = fontSize + 4
    return { cx, cy, x1: cx - w/2, y1: cy - h/2, x2: cx + w/2, y2: cy + h/2, w, h }
  }
  function rectOverlap(a, b, pad = 2) {
    return !(a.x2 + pad < b.x1 || a.x1 - pad > b.x2 || a.y2 + pad < b.y1 || a.y1 - pad > b.y2)
  }
  // Find a label position around an anchor that doesn't collide with any
  // existing obstacle. Tries 16 angles × increasing radius.
  function placeLabel(anchorX, anchorY, text, fontSize, obstacles) {
    const w = text.length * fontSize * 0.55 + 6
    const h = fontSize + 4
    const N_ANGLES = 16
    for (let dist = 14; dist <= 110; dist += 8) {
      for (let i = 0; i < N_ANGLES; i++) {
        // Bias toward NE / above first by starting near -π/2 and alternating
        const a = -Math.PI/2 + (i % 2 === 0 ? 1 : -1) * Math.ceil(i/2) * (Math.PI * 2 / N_ANGLES)
        const cx = anchorX + Math.cos(a) * dist
        const cy = anchorY + Math.sin(a) * dist
        const rect = { cx, cy, x1: cx - w/2, y1: cy - h/2, x2: cx + w/2, y2: cy + h/2, w, h }
        if (rect.x1 < 4 || rect.x2 > innerW - 4) continue
        if (rect.y1 < 4 || rect.y2 > innerH - 4) continue
        let hit = false
        for (const o of obstacles) {
          if (rectOverlap(rect, o)) { hit = true; break }
        }
        if (!hit) return rect
      }
    }
    // Fallback: directly above the anchor
    return labelBox(anchorX, anchorY - 18, text, fontSize)
  }

  // Compute cohort centroid positions first
  const cohortMarkers = []
  for (const s of activeScenarios) {
    const inCohort = voters.filter(s.filter)
    if (inCohort.length === 0) continue
    const gm = geometricMedian(inCohort)
    const ccx = x(gm.x)
    const ccy = y(gm.y)
    cohortMarkers.push({ s, ccx, ccy, n: inCohort.length, inCohort })
  }

  // Build initial obstacle list: candidate dots (circle bboxes)
  const obstacles = []
  for (const c of cands) {
    const cx_ = x(c.x), cy_ = y(c.y)
    obstacles.push({ x1: cx_ - 11, y1: cy_ - 11, x2: cx_ + 11, y2: cy_ + 11 })
  }
  for (const m of cohortMarkers) {
    obstacles.push({ x1: m.ccx - 9, y1: m.ccy - 9, x2: m.ccx + 9, y2: m.ccy + 9 })
  }

  // Capture % pills removed 2026-06-29: a bare floating "42%" next to a dot
  // had no on-chart legend explaining it was "share of this cohort who voted
  // X," and the per-preset captions already state the same split in prose.

  // ---- Draw cohort centroid rings + their lines/blobs already drawn ----
  // Skip primary (_pv) cohorts: their centroid is the matching candidate's
  // filled dot, which is always drawn, so an open ring here is a duplicate.
  for (const m of cohortMarkers) {
    if (/_pv$/.test(m.s.id)) continue
    g.append('circle').attr('cx', m.ccx).attr('cy', m.ccy).attr('r', 7)
      .attr('fill', '#fff').attr('stroke', m.s.color).attr('stroke-width', 2.4)
  }

  // ---- Draw candidate dots ----
  for (const c of cands) {
    const cx_ = x(c.x), cy_ = y(c.y)
    g.append('circle').attr('cx', cx_).attr('cy', cy_).attr('r', 9)
      .attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
  }

  // ---- Place candidate labels (with collision avoidance) ----
  const placedLabelBoxes = []
  for (const c of cands) {
    const cx_ = x(c.x), cy_ = y(c.y)
    const lbl = placeLabel(cx_, cy_, c.short, 13, [...obstacles, ...placedLabelBoxes])
    // Thin connector if pushed beyond 18px from the dot
    const dx = lbl.cx - cx_, dy = lbl.cy - cy_
    const dist = Math.sqrt(dx*dx + dy*dy)
    if (dist > 22) {
      g.append('line').attr('x1', cx_).attr('y1', cy_).attr('x2', lbl.cx).attr('y2', lbl.cy)
        .attr('stroke', c.color).attr('stroke-opacity', 0.4).attr('stroke-width', 0.7)
    }
    g.append('text').attr('x', lbl.cx).attr('y', lbl.cy + 4).attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color).text(c.short)
    placedLabelBoxes.push(lbl)
  }

  // Cohort labels deliberately NOT rendered on the chart. The n count is
  // surfaced in the layer panel next to each scenario's checkbox; the
  // ring color matches the panel swatch so you identify the cohort there.
  // This trades on-chart density for a clean visual, since cohort rings
  // often cluster in the same region.


  // ---- Axes ----
  g.append('g').attr('class', 'vm-axis').attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'vm-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  svg.append('text').attr('class', 'vm-axis-title').attr('x', margin.left + innerW / 2).attr('y', H - 18).attr('text-anchor', 'middle')
    .text('← liberal       Ideology       conservative →')
  svg.append('text').attr('class', 'vm-axis-title').attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('Institutional trust (low ← → high)')

  // Footer
  // Cohort definitions + marker legend live in the figcaption now.
}

// Backwards-compat single-render API
export function drawVoterMap2016(selector, data, opts = {}) {
  const container = document.querySelector(selector)
  if (!container) return
  container.innerHTML = ''
  drawChart(container, data, opts)
}
