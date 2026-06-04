// Fig 16g — Weekly aggregate FT-gap trajectory across the 2020 campaign.
//
// 77 independent cross-sectional Nationscape waves, ~6,000 respondents/week,
// total ~407,000. Each dot = one week's mean (Biden favorability - Trump
// favorability) on the 1-4 inverted scale (range -4..+4).
//
// The line is the smoothed trend. The point: across 16 months of campaign,
// the aggregate gap moved within a 0.5-pt range on an 8-pt scale (6%).
// Always pro-Biden. Always within a sliver of the long-run mean.
//
// Data: scripts/build_nationscape_panel.py → nationscape_weekly_trajectory.json
import * as d3 from 'https://esm.sh/d3@7'

export function drawWeeklyTrajectory(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const weekly = data.weekly.map(w => ({ ...w, date: new Date(w.date) }))
  const summary = data.summary

  const W = container.clientWidth || 680
  const margin = { top: 90, right: 30, bottom: 70, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = 320
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'wt-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title
  svg.append('text').attr('class', 'wt-title')
    .attr('x', margin.left).attr('y', 22)
    .text('The aggregate gap barely moves: 16 months of weekly polling')
  svg.append('text').attr('class', 'wt-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text(`77 weekly waves, ${summary.total_n.toLocaleString()} total respondents (Jul 2019 → Dec 2020).`)
  svg.append('text').attr('class', 'wt-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text(`Weekly mean ranged ${summary.min_mean} to ${summary.max_mean} on an 8-pt scale. Always pro-Biden. Mean of means: ${summary.mean_of_means}.`)

  // Scales
  const x = d3.scaleTime()
    .domain(d3.extent(weekly, d => d.date))
    .range([0, innerW])
  const y = d3.scaleLinear()
    .domain([0, 1.0])
    .range([innerH, 0])

  // Reference horizontal line at the overall mean
  g.append('line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(summary.mean_of_means)).attr('y2', y(summary.mean_of_means))
    .attr('stroke', '#2c5b9c').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '5,3').attr('opacity', 0.7)
  g.append('text')
    .attr('x', innerW - 4).attr('y', y(summary.mean_of_means) - 5).attr('text-anchor', 'end')
    .attr('font-size', '10px').attr('font-weight', '700').attr('fill', '#2c5b9c')
    .text(`16-month mean = ${summary.mean_of_means}`)

  // Reference band: ±1 std around mean
  const band_lo = summary.mean_of_means - summary.std_of_means
  const band_hi = summary.mean_of_means + summary.std_of_means
  g.append('rect')
    .attr('x', 0).attr('y', y(band_hi))
    .attr('width', innerW).attr('height', y(band_lo) - y(band_hi))
    .attr('fill', '#cad7e6').attr('opacity', 0.35)

  // Zero line
  g.append('line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', '#888').attr('stroke-width', 1)

  // Grid
  g.append('g').attr('class', 'wt-grid')
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(''))
    .selectAll('line').attr('stroke', '#e6e6e6')

  // Axes
  g.append('g').attr('class', 'wt-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat('%b %Y')).tickSizeOuter(0))
  g.append('g').attr('class', 'wt-axis')
    .call(d3.axisLeft(y).ticks(6).tickSizeOuter(0))

  svg.append('text').attr('class', 'wt-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('weekly mean gap (Biden − Trump favorability)')

  // Weekly line
  const lineGen = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.mean_gap))
    .curve(d3.curveMonotoneX)
  g.append('path').datum(weekly)
    .attr('fill', 'none').attr('stroke', '#2c5b9c').attr('stroke-width', 2)
    .attr('opacity', 0.55).attr('d', lineGen)

  // Weekly dots
  for (const w of weekly) {
    g.append('circle')
      .attr('cx', x(w.date)).attr('cy', y(w.mean_gap)).attr('r', 2.8)
      .attr('fill', '#2c5b9c').attr('opacity', 0.85)
  }

  // Event markers
  const events = [
    { date: new Date('2020-03-11'), label: 'WHO COVID-19 pandemic declared' },
    { date: new Date('2020-05-25'), label: 'George Floyd killed' },
    { date: new Date('2020-09-18'), label: 'RBG dies' },
    { date: new Date('2020-10-02'), label: 'Trump COVID hospitalization' },
    { date: new Date('2020-10-14'), label: 'Hunter Biden laptop story' },
    { date: new Date('2020-11-03'), label: 'Election Day' },
  ]
  for (const e of events) {
    const xe = x(e.date)
    if (xe < 0 || xe > innerW) continue
    g.append('line')
      .attr('x1', xe).attr('x2', xe).attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#a06400').attr('stroke-width', 1).attr('stroke-dasharray', '2,2').attr('opacity', 0.5)
    g.append('text')
      .attr('transform', `translate(${xe}, 8) rotate(-90)`)
      .attr('text-anchor', 'end').attr('font-size', '9px').attr('fill', '#a06400')
      .text(e.label)
  }

  // Footer
  svg.append('text').attr('class', 'wt-foot')
    .attr('x', margin.left).attr('y', H - 6)
    .text(`Source: Nationscape weekly waves. Vertical lines = major campaign events. Note that even the biggest events fail to move the weekly mean outside the ±1σ band (shaded).`)
}
