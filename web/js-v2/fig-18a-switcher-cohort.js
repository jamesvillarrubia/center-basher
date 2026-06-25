// Fig 17a — The switcher cohort gap.
//
// One horizontal bar per cohort, sorted from most-anti-elite (left) to
// most-establishment (right) on the VSG "trust ordinary over experts"
// item (2017 wave, 1-4 scale, LOWER = trust ordinary).
//
// The visual headline: Obama→Trump SWITCHERS sit 0.77 points to the
// LEFT (anti-elite side) of Obama→Clinton LOYALISTS — confirming the
// §16 change-lane thesis at the cohort level for the specific voters
// who flipped WI/MI/PA.
//
// Romney→Trump loyalists are further left still; Romney→Clinton
// switchers (the symmetric defection from R) are between the two D
// camps. The populist axis sorts Trump's full coalition, with the
// Obama→Trump bucket sitting between the GOP base and Dem loyalists.
//
// Data: scripts/build_switcher_cohort_chart.py → switcher_cohort_vsg.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_TRUMP = '#b8240f'
const COLOR_CLINTON = '#2c5b9c'
const COLOR_REF = '#888'

export function drawSwitcherCohort(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const cohorts = data.cohorts
  const W = 680
  const margin = { top: 46, right: 30, bottom: 70, left: 220 }
  const innerW = W - margin.left - margin.right
  const innerH = 220
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'sc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title/subtitle live in the HTML figure label + figcaption.

  // X scale (1-4 inverted so anti-elite is on the LEFT but values increase rightward feels natural)
  // We use 1 on left, 4 on right; lower values are visually left = "more anti-elite" with explicit label
  const x = d3.scaleLinear().domain([1, 4]).range([0, innerW])
  const y = d3.scaleBand().domain(cohorts.map(c => c.name)).range([0, innerH]).padding(0.25)

  // Background tint bands: left = anti-elite (warm), right = pro-expert (cool)
  g.append('rect').attr('x', x(1)).attr('y', 0)
    .attr('width', x(2.5) - x(1)).attr('height', innerH)
    .attr('fill', COLOR_TRUMP).attr('opacity', 0.06)
  g.append('rect').attr('x', x(2.5)).attr('y', 0)
    .attr('width', x(4) - x(2.5)).attr('height', innerH)
    .attr('fill', COLOR_CLINTON).attr('opacity', 0.06)

  // Cohort row labels
  g.append('g').attr('class', 'sc-axis')
    .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0))
    .call(g => g.select('.domain').remove())

  // X axis
  g.append('g').attr('class', 'sc-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d.toFixed(1)).tickSizeOuter(0))

  // X axis labels
  g.append('text')
    .attr('x', 0).attr('y', innerH + 38).attr('text-anchor', 'start')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', COLOR_TRUMP)
    .text('← more anti-elite ("trust ordinary people")')
  g.append('text')
    .attr('x', innerW).attr('y', innerH + 38).attr('text-anchor', 'end')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', COLOR_CLINTON)
    .text('more pro-expert →')

  // Bars
  const colorFor = (tag) => {
    if (tag === 'rep-pop' || tag === 'switch-pop') return COLOR_TRUMP
    if (tag === 'dem-est' || tag === 'switch-est') return COLOR_CLINTON
    return COLOR_REF
  }

  for (const c of cohorts) {
    const isRef = c.tag === 'all'
    const color = colorFor(c.tag)
    const cx = x(c.trust_ordinary_over_experts_2017)

    // Bar from the cohort score to the right edge of the chart
    g.append('rect')
      .attr('x', x(1)).attr('y', y(c.name))
      .attr('width', cx - x(1)).attr('height', y.bandwidth())
      .attr('fill', color).attr('opacity', isRef ? 0.18 : 0.72)
      .attr('stroke', d3.rgb(color).darker(0.5)).attr('stroke-width', isRef ? 0.5 : 1)

    // Score label at the right end of the bar
    g.append('text')
      .attr('x', cx + 6).attr('y', y(c.name) + y.bandwidth() / 2 + 4)
      .attr('font-size', '12px').attr('font-weight', '700').attr('fill', color)
      .text(c.trust_ordinary_over_experts_2017.toFixed(2))

    // N label at the right of the score
    g.append('text')
      .attr('x', innerW - 4).attr('y', y(c.name) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '10.5px').attr('fill', '#777')
      .text(`n = ${c.n_unweighted.toLocaleString()}`)
  }

  // Gap annotation between switchers and loyalists
  const switchers = cohorts.find(c => c.tag === 'switch-pop')
  const loyalists = cohorts.find(c => c.tag === 'dem-est')
  const sx = x(switchers.trust_ordinary_over_experts_2017)
  const lx = x(loyalists.trust_ordinary_over_experts_2017)
  const sy = y(switchers.name) + y.bandwidth() / 2
  const ly = y(loyalists.name) + y.bandwidth() / 2

  // Arrow + label connecting the two
  const annoX = (sx + lx) / 2
  const annoY = (sy + ly) / 2
  g.append('line')
    .attr('x1', sx).attr('x2', lx).attr('y1', sy + 8).attr('y2', ly - 8)
    .attr('stroke', '#1b1b1d').attr('stroke-width', 1.2)
    .attr('marker-end', 'url(#arrow-end)')
  // Arrow marker definition
  svg.append('defs').append('marker')
    .attr('id', 'arrow-end').attr('viewBox', '0 -5 10 10')
    .attr('refX', 6).attr('refY', 0)
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', '#1b1b1d')

  // Gap label sits in the open band just above the plot, clear of the
  // right-edge n-labels it used to overlap; the diagonal arrow below ties
  // it to the two cohorts being compared.
  g.append('text')
    .attr('x', annoX - 20).attr('y', -28)
    .attr('font-size', '11.5px').attr('font-weight', '700').attr('fill', '#1b1b1d')
    .text(`0.77-point gap`)
  g.append('text')
    .attr('x', annoX - 20).attr('y', -14)
    .attr('font-size', '10px').attr('fill', '#444')
    .text('on a 4-point scale (19% of range)')

  // Footer
}
