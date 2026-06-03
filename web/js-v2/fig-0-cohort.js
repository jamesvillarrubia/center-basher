// Fig 0 — Trust by generational cohort, 1958–2012
import * as d3 from 'https://esm.sh/d3@7'

const COHORT_ORDER = ['Greatest', 'Silent', 'Boomer', 'Gen X', 'Millennial', 'Gen Z']
const COHORT_COLORS = {
  Greatest:   'var(--col-greatest)',
  Silent:     'var(--col-silent)',
  Boomer:     'var(--col-boomer)',
  'Gen X':    'var(--col-genx)',
  Millennial: 'var(--col-millennial)',
  'Gen Z':    'var(--col-genz)',
  National:   'var(--col-national)',
}

export function drawTrustByCohort(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const H = Math.min(W * 0.62, 460)
  const margin = { top: 24, right: 80, bottom: 36, left: 36 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top - margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'cohort-chart')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Scales
  const x = d3.scaleLinear().domain([1956, 2026]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 85]).range([innerH, 0]).nice()

  // Gridlines
  g.append('g').attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(''))

  // Axes
  g.append('g').attr('class', 'axis')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d => d.toString()).ticks(6).tickSizeOuter(0))
  g.append('g').attr('class', 'axis')
    .call(d3.axisLeft(y).tickFormat(d => `${d}%`).ticks(5).tickSizeOuter(0))

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.trust_pct))
    .curve(d3.curveMonotoneX)

  // Track all line+label pairs so hover can mute the others
  const lineElements = []  // [{ path, label, name }]

  function setHighlight(activeName) {
    for (const el of lineElements) {
      const active = (activeName === null) || (el.name === activeName)
      el.path.classed('muted', !active)
      el.path.classed('highlighted', activeName === el.name)
      el.label.classed('muted', !active)
      el.label.classed('highlighted', activeName === el.name)
    }
  }

  function attachHover(path, label, name) {
    const handleEnter = () => setHighlight(name)
    const handleLeave = () => setHighlight(null)
    path.on('mouseenter', handleEnter).on('mouseleave', handleLeave)
    label.on('mouseenter', handleEnter).on('mouseleave', handleLeave)
    // Also allow a wider hit area: invisible wider stroke beneath the visible line
    const hit = g.append('path')
      .datum(path.datum())
      .attr('class', 'line-hit')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 14)
      .style('cursor', 'pointer')
      .on('mouseenter', handleEnter)
      .on('mouseleave', handleLeave)
    return hit
  }

  // Draw National (baseline) first, behind cohorts
  if (data.series.National) {
    const path = g.append('path')
      .datum(data.series.National)
      .attr('class', 'line national')
      .attr('stroke', COHORT_COLORS.National)
      .attr('d', line)
    const last = data.series.National[data.series.National.length - 1]
    const label = g.append('text')
      .attr('class', 'label label-national')
      .attr('x', x(last.year) + 6)
      .attr('y', y(last.trust_pct) - 6)
      .attr('fill', COHORT_COLORS.National)
      .text('National')
    lineElements.push({ path, label, name: 'National' })
    attachHover(path, label, 'National')
  }

  // Cohort lines
  for (const cohort of COHORT_ORDER) {
    const series = data.series[cohort]
    if (!series || series.length < 2) continue
    const path = g.append('path')
      .datum(series)
      .attr('class', `line cohort-${cohort.replace(/\s+/g, '-').toLowerCase()}`)
      .attr('stroke', COHORT_COLORS[cohort])
      .attr('d', line)
    const last = series[series.length - 1]
    const label = g.append('text')
      .attr('class', 'label')
      .attr('x', x(last.year) + 6)
      .attr('y', y(last.trust_pct) + 4)
      .attr('fill', COHORT_COLORS[cohort])
      .text(cohort)
    lineElements.push({ path, label, name: cohort })
    attachHover(path, label, cohort)
  }

  // Annotations — key cliffs
  const annotations = [
    { year: 1973, y_pct: 62, text: 'Watergate' },
    { year: 1980, y_pct: 30, text: 'Reagan-era low' },
    { year: 2002, y_pct: 60, text: 'Post-9/11 spike' },
  ]
  for (const a of annotations) {
    g.append('line').attr('class', 'annotation-line')
      .attr('x1', x(a.year)).attr('x2', x(a.year))
      .attr('y1', y(a.y_pct) - 16).attr('y2', y(a.y_pct) - 4)
    g.append('text').attr('class', 'annotation')
      .attr('x', x(a.year)).attr('y', y(a.y_pct) - 22)
      .attr('text-anchor', 'middle')
      .text(a.text)
  }
}
