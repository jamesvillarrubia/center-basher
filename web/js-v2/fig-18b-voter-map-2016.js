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
  flat: false,                // trust-line ("flatten") view toggle
  __prevFlat: false,          // last mode rendered, so only the flip animates
}

// In flat mode the left-right ideology axis collapses and every marker slides
// onto a single horizontal trust line. The cluster lives in ~0.1–0.35, so the
// axis is truncated at TRUST_MAX to spread it out; a small note flags the
// sparse tail above. DEM_NOMINEE_IDS anchors the headline "cohort → nominee"
// gap that carries the §16/§18 thesis.
const TRUST_MAX = 0.6
const DEM_NOMINEE_IDS = ['clinton', 'biden', 'harris']

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

  // Flatten-to-trust toggle: collapses ideology, slides every marker onto a
  // single trust line. Animated (markers tween between the two views).
  const sep2 = document.createElement('span'); sep2.textContent = '|'; sep2.style.cssText = 'color:#bbb;margin:0 4px;'
  tabBar.appendChild(sep2)
  const flatBtn = document.createElement('button')
  flatBtn.className = 'vm-flat-toggle'
  flatBtn.style.cssText = 'padding:5px 14px;border-radius:4px;border:2px solid #7a5d00;background:#7a5d00;color:#fff;cursor:pointer;font-weight:700;'
  flatBtn.addEventListener('click', () => { __state.flat = !__state.flat; renderAll(container) })
  tabBar.appendChild(flatBtn)

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
  const flatBtn = container.querySelector('.vm-flat-toggle')
  if (flatBtn) flatBtn.textContent = __state.flat ? '◀ Back to 2D map' : 'Flatten to trust axis ▶'
  // NB: do NOT wipe the chart wrapper — drawChart reuses a persistent SVG so
  // the 2D↔flat flip can animate marker positions.
  const wrap = container.querySelector('.vm-chart-wrap')
  drawChart(wrap, __state.dataByYear[__state.year], { swingStatesOnly: __state.scope === 'swing', year: __state.year })
}

// Weighted geometric median (Weiszfeld). Used for cohort centroid rings + the
// candidate dots so the marker sits inside the dense part of the (right-skewed)
// trust blob rather than floating above it the way a mean does. Continuous, so
// cohorts stay distinct (unlike a per-axis median, which quantizes onto the ~5
// discrete trust levels and collapses cohorts onto identical points).
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

// Tiny weighted Gaussian KDE on the trust axis, sampled across the line. Used
// only for the flat-mode distribution ridges.
function kde1d(values, weights, scale, bandwidth) {
  const [lo, hi] = scale.domain()
  const totalW = weights.reduce((s, w) => s + w, 0) || 1
  const out = []
  const STEPS = 80
  for (let i = 0; i <= STEPS; i++) {
    const t = lo + (hi - lo) * (i / STEPS)
    let d = 0
    for (let j = 0; j < values.length; j++) {
      const u = (t - values[j]) / bandwidth
      d += weights[j] * Math.exp(-0.5 * u * u)
    }
    d = d / (totalW * bandwidth * Math.sqrt(2 * Math.PI))
    out.push([scale(t), d])
  }
  return out
}

function drawChart(container, data, opts) {
  const swingOnly = !!opts.swingStatesOnly
  const year = opts.year
  const flat = __state.flat
  const animate = __state.__prevFlat !== flat   // only the 2D↔flat flip animates
  __state.__prevFlat = flat
  const dur = animate ? 750 : 0
  const voters = swingOnly ? data.voters.filter(v => v.s) : data.voters

  const W = 680
  const margin = { top: 24, right: 30, bottom: 56, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  // Persistent SVG + layer groups, so a mode flip tweens marker positions
  // instead of redrawing from scratch.
  let svg = d3.select(container).select('svg.vm-svg')
  if (svg.empty()) {
    svg = d3.select(container).append('svg').attr('class', 'vm-svg').attr('viewBox', `0 0 ${W} ${H}`)
    svg.append('g').attr('class', 'plot').attr('transform', `translate(${margin.left},${margin.top})`)
  }
  const g = svg.select('g.plot')
  const fade = (sel, op) => { dur === 0 ? sel.style('opacity', op) : sel.transition().duration(dur).style('opacity', op) }

  // ---- Scales ----
  // 2D: x = ideology (-1..1), y = trust (0..0.8, up = high trust).
  // Flat: trust maps to the HORIZONTAL axis (truncated at TRUST_MAX), ideology
  // collapses onto a single baseline.
  const x2d = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y2d = d3.scaleLinear().domain([0, 0.8]).range([innerH, 0])
  const trustX = d3.scaleLinear().domain([0, TRUST_MAX]).range([40, innerW - 40])
  const baseY = innerH * 0.46
  const px = pt => flat ? trustX(pt.y) : x2d(pt.x)
  const py = pt => flat ? baseY : y2d(pt.y)

  const activeScenarios = scenariosForYear(year).filter(s => __state.enabled[s.id])

  // Candidate centroids (geometric median of each candidate's voter base:
  // 2016 = primary voters, matching the build script; 2020/2024 = general
  // voters). Always drawn as the filled circle.
  //
  // `.gen` = the "up-for-grabs" square: the persuadable voters (swing OR
  // activated) this candidate actually WON, placed at their geometric median.
  // Scope-aware (uses the scope-filtered `voters`), so the National/Swing-state
  // toggle splits it. Stayed-home can't be "won" (they didn't vote) and are
  // excluded; Sanders has no general/up-for-grabs marker (not on the Nov ballot).
  // A small-n floor keeps it from drawing off a handful of points.
  const UP_FOR_GRABS = v => v.sw || v.n2
  const cands = data.candidates.map(c => {
    const base = year === 2016
      ? data.voters.filter(v => v.pv === c.id)
      : data.voters.filter(v => v.v === c.id)
    const out = base.length ? { ...c, ...geometricMedian(base) } : { ...c }
    const won = voters.filter(v => UP_FOR_GRABS(v) && v.v === c.id)
    if (won.length >= 8) {
      const g = geometricMedian(won)
      out.gen = { x: g.x, y: g.y, n: won.length }
    }
    return out
  })

  // Cohort centroids.
  const cohorts = []
  for (const s of activeScenarios) {
    const inCohort = voters.filter(s.filter)
    if (inCohort.length === 0) continue
    const gm = geometricMedian(inCohort)
    cohorts.push({ s, id: s.id, x: gm.x, y: gm.y, n: inCohort.length, voters: inCohort })
  }

  // ====================================================================
  //  BG LAYER — 2D crosshairs + blobs. Present only in 2D mode.
  // ====================================================================
  let bg = g.select('g.bg'); if (bg.empty()) bg = g.append('g').attr('class', 'bg')
  bg.selectAll('*').remove()
  fade(bg, flat ? 0 : 1)
  if (!flat) {
    bg.append('line').attr('x1', x2d(0)).attr('x2', x2d(0)).attr('y1', 0).attr('y2', innerH).attr('stroke', '#ccc')
    bg.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', y2d(0.4)).attr('y2', y2d(0.4)).attr('stroke', '#ccc')
    // Floor of 10: below ~10 points a density contour is too degenerate to mean
    // anything; let the ring stand alone there.
    function drawDensity(pts, color) {
      if (pts.length < 10) return
      const density = contourDensity()
        .x(d => x2d(d.x)).y(d => y2d(d.y))
        .size([innerW, innerH]).bandwidth(30).thresholds(6)(pts)
      bg.append('g').selectAll('path').data(density).join('path')
        .attr('d', d3.geoPath())
        .attr('fill', color).attr('fill-opacity', (d, i) => 0.06 + (i / Math.max(1, density.length)) * 0.14)
        .attr('stroke', color).attr('stroke-opacity', 0.4).attr('stroke-width', 0.8)
    }
    for (const c of cohorts) drawDensity(c.voters, c.s.color)
  }

  // ====================================================================
  //  FLAT LAYER — trust number line + per-cohort 1D distribution ridges.
  // ====================================================================
  let fl = g.select('g.flatlayer'); if (fl.empty()) fl = g.append('g').attr('class', 'flatlayer')
  fl.selectAll('*').remove()
  fade(fl, flat ? 1 : 0)
  if (flat) {
    fl.append('line').attr('x1', trustX(0)).attr('x2', trustX(TRUST_MAX))
      .attr('y1', baseY).attr('y2', baseY).attr('stroke', '#333').attr('stroke-width', 1.5)
    for (const t of [0, 0.2, 0.4, 0.6]) {
      fl.append('line').attr('x1', trustX(t)).attr('x2', trustX(t))
        .attr('y1', baseY - 5).attr('y2', baseY + 5).attr('stroke', '#333')
      fl.append('text').attr('x', trustX(t)).attr('y', baseY + 20)
        .attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', '#777').text(t.toFixed(1))
    }
    // 1D density ridge per active cohort, just above the line.
    const ridgeH = 70
    for (const c of cohorts) {
      const kde = kde1d(c.voters.map(v => v.y), c.voters.map(v => v.w || 1), trustX, 0.05)
      const maxD = d3.max(kde, d => d[1]) || 1
      const ry = d3.scaleLinear().domain([0, maxD]).range([baseY - 14, baseY - 14 - ridgeH])
      const area = d3.area().x(d => d[0]).y0(baseY - 14).y1(d => ry(d[1])).curve(d3.curveBasis)
      fl.append('path').datum(kde).attr('d', area)
        .attr('fill', c.s.color).attr('fill-opacity', 0.16)
        .attr('stroke', c.s.color).attr('stroke-opacity', 0.5).attr('stroke-width', 1)
    }
    // Tail note: how much weight sits above the truncation point.
    const totW = d3.sum(voters, v => v.w || 1) || 1
    const tailW = d3.sum(voters.filter(v => v.y > TRUST_MAX), v => v.w || 1)
    const tailPct = Math.round((tailW / totW) * 100)
    fl.append('text').attr('x', trustX(TRUST_MAX)).attr('y', baseY - ridgeH - 28).attr('text-anchor', 'end')
      .attr('font-size', '10.5px').attr('font-style', 'italic').attr('fill', '#999')
      .text(`axis truncated at ${TRUST_MAX} — ${tailPct}% of voters sit above, in a sparse tail →`)
    fl.append('text').attr('x', innerW / 2).attr('y', innerH - 2)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text('Institutional trust  (low ← → high)  — ideology collapsed')
  }

  // ====================================================================
  //  MARKERS — candidate dots + cohort rings. These tween between modes.
  //  Primary (_pv) cohort rings are skipped: their centroid is the matching
  //  candidate's filled dot (same people, same geomed) → redundant.
  // ====================================================================
  const rings = cohorts.filter(c => !/_pv$/.test(c.id))

  const candSel = g.selectAll('circle.cand').data(cands, d => d.id)
  candSel.exit().remove()   // instant: a year/scope change must not leave stale dots
  candSel.enter().append('circle').attr('class', 'cand')
    .attr('cx', d => px(d)).attr('cy', d => py(d)).attr('r', 9)
    .attr('fill', d => d.color).attr('stroke', '#fff').attr('stroke-width', 2)
    .merge(candSel)
    .transition().duration(dur)
    .attr('cx', d => px(d)).attr('cy', d => py(d)).attr('r', 9).attr('fill', d => d.color)

  const ringSel = g.selectAll('circle.ring').data(rings, d => d.id)
  ringSel.exit().remove()   // instant: toggling a cohort off must not leave a stale ring
  ringSel.enter().append('circle').attr('class', 'ring')
    .attr('cx', d => px(d)).attr('cy', d => py(d)).attr('r', 7)
    .attr('fill', '#fff').attr('stroke', d => d.s.color).attr('stroke-width', 2.4)
    .merge(ringSel)
    .transition().duration(dur)
    .attr('cx', d => px(d)).attr('cy', d => py(d)).attr('r', 7).attr('stroke', d => d.s.color)

  // Up-for-grabs squares (filled, same color) + dashed connector from the base
  // circle. Connectors live in their own group; the solid markers are raised
  // afterward so the dot and square always sit on top of the line.
  const gens = cands.filter(c => c.gen)
  const SQ = 14
  let glinks = g.select('g.genlinks'); if (glinks.empty()) glinks = g.append('g').attr('class', 'genlinks')
  const linkSel = glinks.selectAll('line.cand-link').data(gens, d => d.id)
  linkSel.exit().remove()
  linkSel.enter().append('line').attr('class', 'cand-link')
    .attr('x1', d => px(d)).attr('y1', d => py(d)).attr('x2', d => px(d)).attr('y2', d => py(d))
    .merge(linkSel)
    .attr('stroke', d => d.color).attr('stroke-width', 1.4)
    .attr('stroke-dasharray', '3,2').attr('stroke-opacity', 0.55)
    .transition().duration(dur)
    .attr('x1', d => px(d)).attr('y1', d => py(d))
    .attr('x2', d => px(d.gen)).attr('y2', d => py(d.gen))

  const genSel = g.selectAll('rect.cand-gen').data(gens, d => d.id)
  genSel.exit().remove()
  genSel.enter().append('rect').attr('class', 'cand-gen')
    .attr('width', SQ).attr('height', SQ).attr('fill', d => d.color)
    .attr('stroke', '#fff').attr('stroke-width', 2)
    .attr('x', d => px(d.gen) - SQ / 2).attr('y', d => py(d.gen) - SQ / 2)
    .merge(genSel)
    .transition().duration(dur)
    .attr('x', d => px(d.gen) - SQ / 2).attr('y', d => py(d.gen) - SQ / 2).attr('fill', d => d.color)

  g.selectAll('circle.cand').raise()
  g.selectAll('rect.cand-gen').raise()

  // ====================================================================
  //  LABELS + (flat-only) Δ-gap annotations. Rebuilt each render, faded.
  // ====================================================================
  let labels = g.select('g.labels'); if (labels.empty()) labels = g.append('g').attr('class', 'labels')
  labels.selectAll('*').remove()

  if (!flat) {
    // 2D: candidate names placed by collision avoidance (16 angles × radius).
    // Cohort labels deliberately omitted — the n + color live in the panel.
    function labelBox(cx, cy, text, fontSize) {
      const w = text.length * fontSize * 0.55 + 6, h = fontSize + 4
      return { cx, cy, x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2, w, h }
    }
    function rectOverlap(a, b, pad = 2) {
      return !(a.x2 + pad < b.x1 || a.x1 - pad > b.x2 || a.y2 + pad < b.y1 || a.y1 - pad > b.y2)
    }
    function placeLabel(anchorX, anchorY, text, fontSize, obstacles) {
      const w = text.length * fontSize * 0.55 + 6, h = fontSize + 4, N_ANGLES = 16
      for (let dist = 14; dist <= 110; dist += 8) {
        for (let i = 0; i < N_ANGLES; i++) {
          const a = -Math.PI / 2 + (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI * 2 / N_ANGLES)
          const cx = anchorX + Math.cos(a) * dist, cy = anchorY + Math.sin(a) * dist
          const rect = { cx, cy, x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2, w, h }
          if (rect.x1 < 4 || rect.x2 > innerW - 4 || rect.y1 < 4 || rect.y2 > innerH - 4) continue
          if (!obstacles.some(o => rectOverlap(rect, o))) return rect
        }
      }
      return labelBox(anchorX, anchorY - 18, text, fontSize)
    }
    const obstacles = []
    for (const c of cands) { const cx_ = x2d(c.x), cy_ = y2d(c.y); obstacles.push({ x1: cx_ - 11, y1: cy_ - 11, x2: cx_ + 11, y2: cy_ + 11 }) }
    for (const m of rings) { const mx = x2d(m.x), my = y2d(m.y); obstacles.push({ x1: mx - 9, y1: my - 9, x2: mx + 9, y2: my + 9 }) }
    const placed = []
    for (const c of cands) {
      const cx_ = x2d(c.x), cy_ = y2d(c.y)
      const lbl = placeLabel(cx_, cy_, c.short, 13, [...obstacles, ...placed])
      if (Math.hypot(lbl.cx - cx_, lbl.cy - cy_) > 22) {
        labels.append('line').attr('x1', cx_).attr('y1', cy_).attr('x2', lbl.cx).attr('y2', lbl.cy)
          .attr('stroke', c.color).attr('stroke-opacity', 0.4).attr('stroke-width', 0.7)
      }
      labels.append('text').attr('x', lbl.cx).attr('y', lbl.cy + 4).attr('text-anchor', 'middle')
        .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color).text(c.short)
      placed.push(lbl)
    }
  } else {
    // FLAT: de-collided labels (each with a thin vertical leader to its dot)
    // above the ridge, and a de-collided Δ-gap chain below the line.
    const ridgeTop = baseY - 14 - 70
    const approxW = t => t.length * 6.6 + 10
    const items = [
      ...cands.map(c => ({ trust: c.y, sx: trustX(c.y), text: c.short, color: c.color, weight: 700 })),
      ...rings.map(c => ({ trust: c.y, sx: trustX(c.y), text: c.s.label, color: c.s.color, weight: 600 })),
    ].sort((a, b) => a.sx - b.sx)

    // Label tier assignment: push up when two labels would overlap horizontally.
    const labTiers = []
    for (const it of items) {
      const w = approxW(it.text)
      let tier = 0
      while (true) {
        const occ = labTiers[tier] || (labTiers[tier] = [])
        if (!occ.some(o => !(it.sx + w / 2 < o.x1 - 6 || it.sx - w / 2 > o.x2 + 6))) {
          occ.push({ x1: it.sx - w / 2, x2: it.sx + w / 2 }); break
        }
        tier++
      }
      it.tier = tier
    }
    const tierH = 17
    for (const it of items) {
      const ly = ridgeTop - 8 - it.tier * tierH
      labels.append('line').attr('x1', it.sx).attr('x2', it.sx).attr('y1', ly + 4).attr('y2', baseY - 9)
        .attr('stroke', it.color).attr('stroke-opacity', 0.35).attr('stroke-width', 0.8)
      labels.append('text').attr('x', it.sx).attr('y', ly).attr('text-anchor', 'middle')
        .attr('font-size', '12px').attr('font-weight', it.weight).attr('fill', it.color).text(it.text)
    }

    // Δ-gap chain below the line, de-collided into downward tiers so every
    // neighbor gap gets its own readable bracket.
    const gapTiers = []
    const gapBaseY = baseY + 30, gapTierH = 16
    for (let i = 0; i < items.length - 1; i++) {
      const a = items[i], b = items[i + 1]
      if (b.sx - a.sx < 2) continue
      const txt = 'Δ ' + (b.trust - a.trust).toFixed(2)
      const w = approxW(txt), mid = (a.sx + b.sx) / 2
      let tier = 0
      while (true) {
        const occ = gapTiers[tier] || (gapTiers[tier] = [])
        if (!occ.some(o => !(mid + w / 2 < o.x1 - 4 || mid - w / 2 > o.x2 + 4))) {
          occ.push({ x1: mid - w / 2, x2: mid + w / 2 }); break
        }
        tier++
      }
      const gy = gapBaseY + tier * gapTierH
      labels.append('path').attr('d', `M${a.sx},${baseY + 9} V${gy} H${b.sx} V${baseY + 9}`)
        .attr('fill', 'none').attr('stroke', '#aaa').attr('stroke-width', 1)
      labels.append('text').attr('x', mid).attr('y', gy + 12).attr('text-anchor', 'middle')
        .attr('font-size', '11px').attr('font-weight', '600').attr('fill', '#555').text(txt)
    }

    // Headline gap: when a behavioral cohort is active, span its centroid →
    // the Dem nominee as a bold colored bracket — the §16/§18 thesis, read off
    // the line.
    const beh = cohorts.find(c => ['swing', 'activated', 'stayed_home'].includes(c.id))
    const nominee = cands.find(c => DEM_NOMINEE_IDS.includes(c.id))
    if (beh && nominee) {
      const lo = Math.min(trustX(beh.y), trustX(nominee.y))
      const hi = Math.max(trustX(beh.y), trustX(nominee.y))
      const hy = gapBaseY + (gapTiers.length + 0.5) * gapTierH
      labels.append('path').attr('d', `M${lo},${baseY + 9} V${hy} H${hi} V${baseY + 9}`)
        .attr('fill', 'none').attr('stroke', beh.s.color).attr('stroke-width', 1.8)
      labels.append('text').attr('x', (lo + hi) / 2).attr('y', hy + 14).attr('text-anchor', 'middle')
        .attr('font-size', '12px').attr('font-weight', '700').attr('fill', beh.s.color)
        .text(`${beh.s.label} → ${nominee.short}:  Δ ${Math.abs(nominee.y - beh.y).toFixed(2)} trust`)
    }
  }
  // Labels don't tween position (the placement math differs per mode); fade the
  // whole group in on a mode flip, otherwise show immediately.
  if (animate) labels.style('opacity', 0).transition().duration(dur).style('opacity', 1)
  else labels.style('opacity', 1)

  // ====================================================================
  //  2D AXES — present only in 2D mode.
  // ====================================================================
  let axes = g.select('g.axes2d'); if (axes.empty()) axes = g.append('g').attr('class', 'axes2d')
  axes.selectAll('*').remove()
  fade(axes, flat ? 0 : 1)
  if (!flat) {
    axes.append('g').attr('class', 'vm-axis').attr('transform', `translate(0, ${innerH})`)
      .call(d3.axisBottom(x2d).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
    axes.append('g').attr('class', 'vm-axis')
      .call(d3.axisLeft(y2d).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
    axes.append('text').attr('class', 'vm-axis-title').attr('x', innerW / 2).attr('y', innerH + 40).attr('text-anchor', 'middle')
      .text('← liberal       Ideology       conservative →')
    axes.append('text').attr('class', 'vm-axis-title').attr('transform', `translate(${-50}, ${innerH / 2}) rotate(-90)`).attr('text-anchor', 'middle')
      .text('Institutional trust (low ← → high)')
  }
}

// Backwards-compat single-render API
export function drawVoterMap2016(selector, data, opts = {}) {
  const container = document.querySelector(selector)
  if (!container) return
  container.innerHTML = ''
  drawChart(container, data, opts)
}
