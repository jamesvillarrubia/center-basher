// Fig 17c — The campaign ceiling (port of v1 chartCampaignCeiling).
//
// Two bars in points of vote share moved:
//   - WHO you nominate (candidate's trust position): ~22 pts.
//     Within Clinton's reachable coalition, vote share swings 90% → 68%
//     across trust bands (Fig 7 of v1; same data as §16 Figure B here).
//   - What the CAMPAIGN does after: ≈0.
//     Kalla & Broockman 2018 meta of 49 field experiments: persuasive
//     effect of contact + advertising on general-election choice ≈ 0.
//
// Honest caveat baked into the figcaption: these are different kinds of
// estimate (positional association vs causal campaign effect) on one
// vote-points scale to make the magnitude gap legible.
import * as d3 from 'https://esm.sh/d3@7'

const BARS = [
  { lab: 'WHO you nominate', sub: 'the candidate\'s trust position', pp: 22.0, kind: 'prior',    color: '#1b4f8a' },
  { lab: 'What the CAMPAIGN does after', sub: 'persuasion + ads + policy (general)', pp: 0.4, kind: 'campaign', color: '#888' },
]

export function drawCampaignCeiling(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = 680
  const margin = { top: 90, right: 50, bottom: 80, left: 250 }
  const rowH = 50, gap = 28
  const innerW = W - margin.left - margin.right
  const innerH = BARS.length * (rowH + gap) - gap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  svg.append('text').attr('class', 'cc-title')
    .attr('x', 20).attr('y', 22)
    .text('The campaign ceiling: nomination matters ~55× more than the campaign')
  svg.append('text').attr('class', 'cc-subtitle')
    .attr('x', 20).attr('y', 42)
    .text('Same scale: points of vote share moved. The nomination locks in the candidate\'s trust position; the campaign tries to move it after.')
  svg.append('text').attr('class', 'cc-subtitle')
    .attr('x', 20).attr('y', 58)
    .text('22pp (positional, structural)  vs  ≈0.4pp (campaign, causal field-experiment estimate).')

  const x = d3.scaleLinear().domain([0, 24]).range([0, innerW])

  for (let i = 0; i < BARS.length; i++) {
    const b = BARS[i]
    const y0 = i * (rowH + gap)
    // Label block
    g.append('text')
      .attr('x', -10).attr('y', y0 + 20).attr('text-anchor', 'end')
      .attr('font-size', '14px').attr('font-weight', '700').attr('fill', b.color)
      .text(b.lab)
    g.append('text')
      .attr('x', -10).attr('y', y0 + 38).attr('text-anchor', 'end')
      .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
      .text(b.sub)
    // Bar
    g.append('rect')
      .attr('x', 0).attr('y', y0 + 4)
      .attr('width', Math.max(x(b.pp), 4)).attr('height', rowH - 8)
      .attr('fill', b.color).attr('opacity', 0.85).attr('rx', 4)
    // Numeric label at end
    g.append('text')
      .attr('x', x(b.pp) + 8).attr('y', y0 + rowH / 2 + 5)
      .attr('font-size', '15px').attr('font-weight', '700').attr('fill', b.color)
      .text(`${b.pp}pp`)
  }

  g.append('g').attr('class', 'cc-axis')
    .attr('transform', `translate(0, ${innerH + 4})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d}pp`).tickSizeOuter(0))
  svg.append('text')
    .attr('x', margin.left + innerW / 2).attr('y', H - 36).attr('text-anchor', 'middle')
    .attr('font-size', '11.5px').attr('fill', '#444')
    .text('points of vote share moved (general election)')

  svg.append('text').attr('class', 'cc-foot')
    .attr('x', 20).attr('y', H - 8).attr('font-size', '10.5px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Caveat: 22pp is a positional/structural association (where the candidate IS in trust space). 0.4pp is a causal experimental estimate (Kalla & Broockman 2018, 49 field experiments). Different kinds, shown on one scale.')
}
