// Fig 16c (Option C) — VSG panel switcher-perception gap.
//
// Obama-2012 voters who SWITCHED to Trump 2016 vs Obama-2012 voters who
// STAYED with Clinton, on populist-orientation items. Two horizontal
// bars per item; the gap between them is the visual finding. The
// switchers — the cohort that decided WI, MI, PA — land substantially
// closer to the populist / anti-elite end on every item.
//
// Numbers from data/clean/switcher_perception_vsg.csv via the
// build_switcher_perception_vsg.py pipeline.
import * as d3 from 'https://esm.sh/d3@7'

const ITEMS = [
  {
    label: 'Elites don\'t understand ordinary people',
    note: '1–4 scale; lower = more anti-elite',
    switchers: 1.58,
    loyalists: 1.69,
  },
  {
    label: 'Trust ordinary people over experts',
    note: '1–4 scale; lower = trust-ordinary side',
    switchers: 2.24,
    loyalists: 3.01,
  },
  {
    label: 'Favorability of Trump',
    note: '1–4 scale; lower = more favorable',
    switchers: 1.68,
    loyalists: 3.89,
  },
]

const COLOR = {
  SWITCH:   '#b8240f',   // accent red
  LOYALIST: '#2c5b9c',   // dem blue
}

export function drawSwitcherGap(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 76, right: 180, bottom: 50, left: 30 }
  const innerW = W - margin.left - margin.right
  const itemH = 90
  const innerH = ITEMS.length * itemH
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'sg-chart')

  svg.append('text').attr('class', 'sg-title')
    .attr('x', 0).attr('y', 22)
    .text('Obama→Trump switchers were more populist before they switched')
  svg.append('text').attr('class', 'sg-subtitle')
    .attr('x', 0).attr('y', 40)
    .text('VSG panel: Obama-2012 voters in 2016/2017. Lower = closer to populist/anti-elite.')

  // Legend
  const legY = 60
  svg.append('rect').attr('x', margin.left).attr('y', legY)
    .attr('width', 12).attr('height', 12).attr('fill', COLOR.SWITCH)
  svg.append('text').attr('class', 'sg-leg').attr('x', margin.left + 16).attr('y', legY + 10)
    .text('Obama→Trump switchers')
  svg.append('rect').attr('x', margin.left + 200).attr('y', legY)
    .attr('width', 12).attr('height', 12).attr('fill', COLOR.LOYALIST)
  svg.append('text').attr('class', 'sg-leg').attr('x', margin.left + 216).attr('y', legY + 10)
    .text('Obama→Clinton loyalists')

  const x = d3.scaleLinear().domain([1, 4]).range([0, innerW])

  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i]
    const yBlock = margin.top + i * itemH

    // Item label
    svg.append('text').attr('class', 'sg-item-label')
      .attr('x', margin.left).attr('y', yBlock + 14)
      .text(it.label)
    svg.append('text').attr('class', 'sg-item-note')
      .attr('x', margin.left).attr('y', yBlock + 30)
      .text(it.note)

    // Track and scale
    const trackY = yBlock + 50
    svg.append('rect').attr('class', 'sg-track')
      .attr('x', margin.left).attr('y', trackY)
      .attr('width', innerW).attr('height', 4)

    // Switcher dot
    const sx = margin.left + x(it.switchers)
    const lx = margin.left + x(it.loyalists)

    svg.append('line').attr('class', 'sg-gapline')
      .attr('x1', sx).attr('x2', lx)
      .attr('y1', trackY + 2).attr('y2', trackY + 2)

    svg.append('circle').attr('class', 'sg-dot')
      .attr('cx', sx).attr('cy', trackY + 2).attr('r', 7)
      .attr('fill', COLOR.SWITCH)
    svg.append('text').attr('class', 'sg-val')
      .attr('x', sx).attr('y', trackY - 10).attr('text-anchor', 'middle')
      .attr('fill', COLOR.SWITCH)
      .text(it.switchers.toFixed(2))

    svg.append('circle').attr('class', 'sg-dot')
      .attr('cx', lx).attr('cy', trackY + 2).attr('r', 7)
      .attr('fill', COLOR.LOYALIST)
    svg.append('text').attr('class', 'sg-val')
      .attr('x', lx).attr('y', trackY - 10).attr('text-anchor', 'middle')
      .attr('fill', COLOR.LOYALIST)
      .text(it.loyalists.toFixed(2))

    // Gap label to the right
    const gap = Math.abs(it.switchers - it.loyalists)
    svg.append('text').attr('class', 'sg-gap')
      .attr('x', margin.left + innerW + 12).attr('y', trackY + 5)
      .text(`gap: ${gap.toFixed(2)}`)

    // Axis tick labels (only on last item)
    if (i === ITEMS.length - 1) {
      const axisY = yBlock + itemH - 4
      const ax = svg.append('g').attr('transform', `translate(${margin.left}, ${axisY})`)
      ax.call(d3.axisBottom(x).ticks(4).tickFormat(d3.format('d')).tickSizeOuter(0))
        .selectAll('text').attr('class', 'sg-tick-label')
    }
  }
}
