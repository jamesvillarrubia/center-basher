// Fig 16g — Weekly aggregate margin trajectory across THREE cycles.
//
// 538 national polling averages, resampled to weekly. 2016, 2020, 2024
// shown as three small-multiples panels. Each cycle's panel has its own
// y-scale centered on its mean to make the within-cycle swing visible,
// but the shared annotation makes the comparable claim explicit:
// the within-cycle std dev is 1.7-2.3pp in every cycle, regardless of
// what shocks happened.
//
// Data: scripts/build_538_trajectory_multi.py → poll_trajectory_multi.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR = '#2c5b9c'
const EVENT_COLOR = '#a06400'

export function drawWeeklyTrajectory(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const cycles = data.cycles
  const W = 680
  const margin = { top: 100, right: 30, bottom: 60, left: 60 }
  const panelH = 200
  const panelGap = 70
  const innerW = W - margin.left - margin.right
  const H = margin.top + cycles.length * (panelH + panelGap) - panelGap + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'wt-chart')

  // Title
  svg.append('text').attr('class', 'wt-title')
    .attr('x', 0).attr('y', 22)
    .text('The aggregate margin barely moves — across THREE cycles')
  svg.append('text').attr('class', 'wt-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('538 weekly national poll averages. Different events, different candidates, different outcomes — same flat trajectory.')
  svg.append('text').attr('class', 'wt-subtitle')
    .attr('x', 0).attr('y', 58)
    .text(`In every cycle, the within-cycle std dev sits between 1.7 and 2.3 percentage points.`)

  // Render each cycle as its own small panel
  cycles.forEach((cyc, i) => {
    const yOffset = margin.top + i * (panelH + panelGap)
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${yOffset})`)
    const s = cyc.summary

    // Panel title
    g.append('text')
      .attr('x', 0).attr('y', -10)
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', '#1b1b1d')
      .text(`${cyc.year}  —  ${s.dem_name} vs ${s.rep_name}`)
    g.append('text')
      .attr('x', innerW).attr('y', -10).attr('text-anchor', 'end')
      .attr('font-size', '11px').attr('fill', '#444')
      .text(`mean ${s.mean_of_means > 0 ? '+' : ''}${s.mean_of_means}pp  ·  range ${s.range}pp  ·  σ = ${s.std_of_means}pp`)

    // Scales — fixed Y range across panels for visual comparability
    const yMin = -5, yMax = 12
    const weekly = cyc.weekly.map(w => ({ ...w, date: new Date(w.date) }))
    const x = d3.scaleTime()
      .domain(d3.extent(weekly, d => d.date))
      .range([0, innerW])
    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([panelH, 0])

    // Background ±1σ band around the mean
    const band_lo = s.mean_of_means - s.std_of_means
    const band_hi = s.mean_of_means + s.std_of_means
    g.append('rect').attr('x', 0).attr('y', y(band_hi))
      .attr('width', innerW).attr('height', y(band_lo) - y(band_hi))
      .attr('fill', COLOR).attr('opacity', 0.12)

    // Zero line (heavy black)
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#1b1b1d').attr('stroke-width', 1.5)
      .attr('opacity', 0.6)
    g.append('text')
      .attr('x', innerW - 4).attr('y', y(0) - 4).attr('text-anchor', 'end')
      .attr('font-size', '9.5px').attr('fill', '#444').attr('font-style', 'italic')
      .text('tied (0)')

    // Mean line (dashed blue)
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(s.mean_of_means)).attr('y2', y(s.mean_of_means))
      .attr('stroke', COLOR).attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,3').attr('opacity', 0.7)

    // Y axis
    g.append('g').attr('class', 'wt-axis')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d > 0 ? '+' : ''}${d}`).tickSizeOuter(0))
    // X axis
    g.append('g').attr('class', 'wt-axis')
      .attr('transform', `translate(0, ${panelH})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat('%b')).tickSizeOuter(0))

    // Y label
    g.append('text')
      .attr('transform', `translate(-44, ${panelH / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10.5px').attr('fill', '#555').attr('font-style', 'italic')
      .text('D-margin (pp)')

    // Event vertical lines
    for (const e of cyc.events) {
      const xe = x(new Date(e.date))
      if (xe < 0 || xe > innerW) continue
      g.append('line')
        .attr('x1', xe).attr('x2', xe).attr('y1', 0).attr('y2', panelH)
        .attr('stroke', EVENT_COLOR).attr('stroke-width', 1).attr('stroke-dasharray', '2,2').attr('opacity', 0.5)
      g.append('text')
        .attr('transform', `translate(${xe}, 6) rotate(-90)`)
        .attr('text-anchor', 'end').attr('font-size', '8.5px').attr('fill', EVENT_COLOR)
        .text(e.label)
    }

    // Weekly margin line
    const lineGen = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.mean_gap))
      .curve(d3.curveMonotoneX)
    g.append('path').datum(weekly)
      .attr('fill', 'none').attr('stroke', COLOR).attr('stroke-width', 2.2)
      .attr('opacity', 0.85).attr('d', lineGen)

    // Dots
    for (const w of weekly) {
      g.append('circle')
        .attr('cx', x(w.date)).attr('cy', y(w.mean_gap)).attr('r', 2.2)
        .attr('fill', COLOR).attr('opacity', 0.85)
    }
  })

  // Footer
  svg.append('text').attr('class', 'wt-foot')
    .attr('x', 0).attr('y', H - 6)
    .text(`Source: 538 national polling averages (weekly resampled). Shaded band = ±1σ around the 16-month cycle mean. 2024 panel ends Sep 12 (538 wound down).`)
}
