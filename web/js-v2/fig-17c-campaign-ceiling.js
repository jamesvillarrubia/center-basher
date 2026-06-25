// Fig 17c — The campaign ceiling (port of v1 chartCampaignCeiling).
//
// Two bars in points of general-election vote share:
//   - WHO you nominate (candidate's trust position): ~22 pts.
//     DERIVED + REPRODUCIBLE (scripts/build_campaign_ceiling.py), ANES 2016:
//     within the reachable (non-Republican) coalition — Democrats, Dem-leaners,
//     and pure independents — Clinton vote share swings 89.7% (high trust) →
//     67.2% (low trust) across equal-thirds trust terciles = 22.4pp; n = 482
//     hi / 500 lo. Trust = 3-item composite V161215/216/217; vote = V162034a;
//     weight = V160102 (POST). NOTE: terciles MUST be equal-thirds (rank-based);
//     a naive `< quantile` split on this coarse composite inflates it to ~43pp
//     (which is likely the source of §7's unverified "90→47"). NOT the §16
//     Figure B CDF series — that 2016 cell is degenerate (VCF0604 absent).
//   - What the CAMPAIGN does after: ≈0.
//     Kalla & Broockman 2018, "The Minimal Persuasive Effects of Campaign
//     Contact in General Elections," APSR 112(1):148–166: the best estimate
//     of campaign persuasion (contact + advertising) on general-election
//     candidate choice is ZERO (40 meta-analyzed + 9 new field experiments).
//
// Honest caveat (in the figcaption): these are different KINDS of estimate
// — a positional association (where the candidate sits in trust space) vs a
// causal campaign effect — shown on one vote-points scale to make the
// magnitude gap legible. Do not read the bars as a clean ratio.
import * as d3 from 'https://esm.sh/d3@7'

const BARS = [
  { lab: 'WHO you nominate', sub: 'the candidate\'s trust position', pp: 22.4, disp: '~22pp', kind: 'prior',    color: '#1b4f8a' },
  { lab: 'What the CAMPAIGN does after', sub: 'persuasion + ads (general election)', pp: 0.3, disp: '≈0', kind: 'campaign', color: '#c77f2a' },
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
    .text('The campaign ceiling: nomination moves ~22 points, the campaign ≈0.')
  svg.append('text').attr('class', 'cc-subtitle')
    .attr('x', 20).attr('y', 42)
    .text('The nomination locks in the candidate\'s trust position; the general-election campaign can barely move it after.')
  svg.append('text').attr('class', 'cc-subtitle')
    .attr('x', 20).attr('y', 58)
    .text('~22pp (positional: trust-band vote swing in the reachable coalition)  vs  ≈0pp (campaign, causal field-experiment estimate).')

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
      .text(b.disp ?? `${b.pp}pp`)
  }

  g.append('g').attr('class', 'cc-axis')
    .attr('transform', `translate(0, ${innerH + 4})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d}pp`).tickSizeOuter(0))
  svg.append('text')
    .attr('x', margin.left + innerW / 2).attr('y', H - 36).attr('text-anchor', 'middle')
    .attr('font-size', '11.5px').attr('fill', '#444')
    .text('points of vote share moved (general election)')

  // Two-line caption so it doesn't overflow the 680-wide frame.
  svg.append('text').attr('class', 'cc-foot')
    .attr('x', 20).attr('y', H - 22).attr('font-size', '10.5px').attr('fill', '#666').attr('font-style', 'italic')
    .text('~22pp = trust-band vote swing in the reachable (non-Republican) coalition, ANES 2016 — a positional association.')
  svg.append('text').attr('class', 'cc-foot')
    .attr('x', 20).attr('y', H - 8).attr('font-size', '10.5px').attr('fill', '#666').attr('font-style', 'italic')
    .text('≈0 = campaign persuasion effect (Kalla & Broockman 2018, APSR 112:148–166). Different kinds of estimate on one scale — not a clean ratio.')
}
