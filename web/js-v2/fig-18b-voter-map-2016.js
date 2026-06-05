// Fig 18b — The 2016 trust × ideology voter map (port of v1 chartCandidates).
//
// 3,301 ANES 2016 respondents plotted by ideology (X, -1 left to +1 right)
// and institutional trust (Y, 0 distrust to 1 trust). Three 2016 candidates
// overlaid at their voter-base centroids: Hillary Clinton (D), Bernie
// Sanders (Dem primary), Donald Trump (R).
//
// Visual story for §18: Clinton voters cluster in the upper-left
// (high-trust establishment left). Trump voters cluster in the lower-
// right (low-trust populist right). Sanders' primary voters sit in
// between, skewed toward lower trust than Clinton's. They are not
// Clinton's natural cohort; they sit in the low-trust zone where
// Sanders' anti-establishment framing reached them.
//
// Data: scripts/build_voter_map_2016.py → voter_map_2016.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR = {
  clinton: '#2c5b9c',
  trump:   '#b8240f',
  johnson: '#e9a52e',
  stein:   '#3a8a3a',
  other:   '#888',
  none:    '#bbb',
}
const SANDERS = '#4a9b6d'

const VOTE_LABELS = {
  clinton: 'Voted Clinton',
  trump:   'Voted Trump',
  johnson: 'Voted Johnson',
  stein:   'Voted Stein',
}

function voteColor(v) {
  return COLOR[v] || COLOR.other
}

export function drawVoterMap2016(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const voters = data.voters
  const cands  = data.candidates
  const W = container.clientWidth || 680
  const margin = { top: 110, right: 30, bottom: 90, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW, 460)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'vm-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title
  svg.append('text').attr('class', 'vm-title')
    .attr('x', margin.left).attr('y', 22)
    .text('Where were Sanders voters actually sitting in 2016?')
  svg.append('text').attr('class', 'vm-subtitle')
    .attr('x', margin.left).attr('y', 42)
    .text(`Each dot = one ANES respondent (n = ${voters.length.toLocaleString()}). X = self-reported ideology. Y = institutional-trust composite.`)
  svg.append('text').attr('class', 'vm-subtitle')
    .attr('x', margin.left).attr('y', 58)
    .text('Three candidate centroids overlaid. Sanders\' primary voters sit in low-trust territory — not where Clinton voters were.')

  // Scales
  const x = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

  // Quadrant shading
  g.append('rect').attr('x', x(-1)).attr('y', y(1))
    .attr('width', x(0) - x(-1)).attr('height', y(0.5) - y(1))
    .attr('fill', COLOR.clinton).attr('opacity', 0.05)
  g.append('rect').attr('x', x(0)).attr('y', y(1))
    .attr('width', x(1) - x(0)).attr('height', y(0.5) - y(1))
    .attr('fill', COLOR.trump).attr('opacity', 0.05)
  g.append('rect').attr('x', x(-1)).attr('y', y(0.5))
    .attr('width', x(0) - x(-1)).attr('height', y(0) - y(0.5))
    .attr('fill', SANDERS).attr('opacity', 0.07)
  g.append('rect').attr('x', x(0)).attr('y', y(0.5))
    .attr('width', x(1) - x(0)).attr('height', y(0) - y(0.5))
    .attr('fill', COLOR.trump).attr('opacity', 0.10)

  // Zero axes
  g.append('line').attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', innerH).attr('stroke', '#888').attr('stroke-width', 1)
  g.append('line').attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0.5)).attr('y2', y(0.5)).attr('stroke', '#888').attr('stroke-width', 1)

  // Quadrant labels
  const ql = (cx, cy, txt, color) => {
    g.append('text')
      .attr('x', x(cx)).attr('y', y(cy)).attr('text-anchor', 'middle')
      .attr('font-size', '10.5px').attr('font-weight', '700').attr('fill', color)
      .attr('opacity', 0.7).text(txt)
  }
  ql(-0.55, 0.94, 'High-trust LEFT', COLOR.clinton)
  ql( 0.55, 0.94, 'High-trust RIGHT', COLOR.trump)
  ql(-0.55, 0.06, 'Low-trust LEFT', SANDERS)
  ql( 0.55, 0.06, 'Low-trust RIGHT', COLOR.trump)

  // Voter dots — small + transparent
  // Sample for performance if very large
  const stride = Math.max(1, Math.floor(voters.length / 3500))
  for (let i = 0; i < voters.length; i += stride) {
    const v = voters[i]
    g.append('circle')
      .attr('cx', x(v.x) + (Math.random() - 0.5) * 4)   // small jitter for the 7-pt ideology grid
      .attr('cy', y(v.y) + (Math.random() - 0.5) * 4)
      .attr('r', 1.6)
      .attr('fill', voteColor(v.v || 'none'))
      .attr('opacity', 0.22)
  }

  // Candidate centroids — drawn on top, BIG and labeled
  for (const c of cands) {
    const cx = x(c.x)
    const cy = y(c.y)
    // Outer halo
    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', 18)
      .attr('fill', c.color).attr('opacity', 0.18)
    // Inner solid
    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', 9)
      .attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
    // Label
    const labelOffsetY = c.id === 'sanders' ? 26 : c.id === 'clinton' ? -16 : 26
    g.append('text')
      .attr('x', cx).attr('y', cy + labelOffsetY).attr('text-anchor', 'middle')
      .attr('font-size', '13px').attr('font-weight', '700').attr('fill', c.color)
      .text(c.short)
    g.append('text')
      .attr('x', cx).attr('y', cy + labelOffsetY + 13).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', '#444').attr('font-style', 'italic')
      .text(`(${c.x > 0 ? '+' : ''}${c.x}, ${c.y})`)
  }

  // Axes
  g.append('g').attr('class', 'vm-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'vm-axis')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))

  svg.append('text').attr('class', 'vm-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 50).attr('text-anchor', 'middle')
    .text('← liberal       Ideology (V161126)       conservative →')
  svg.append('text').attr('class', 'vm-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Institutional trust  (low ← → high)')

  // Legend
  const legY = 78
  const lx = margin.left
  const items = [
    { color: COLOR.clinton, label: 'Voted Clinton' },
    { color: COLOR.trump,   label: 'Voted Trump' },
    { color: COLOR.johnson, label: 'Voted Johnson' },
    { color: COLOR.other,   label: 'Other / no vote' },
  ]
  let lxCursor = lx
  for (const it of items) {
    svg.append('circle').attr('cx', lxCursor + 5).attr('cy', legY).attr('r', 3)
      .attr('fill', it.color).attr('opacity', 0.6)
    svg.append('text').attr('x', lxCursor + 12).attr('y', legY + 3)
      .attr('font-size', '10.5px').attr('fill', '#444').text(it.label)
    lxCursor += 12 + it.label.length * 6.5 + 18
  }

  // Footer
  svg.append('text').attr('class', 'vm-foot')
    .attr('x', margin.left).attr('y', H - 6)
    .attr('font-size', '11px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Source: ANES 2016 Time Series (V161126 ideology, V161215/16/17 trust composite). Candidate centroids = mean of voter base. Sanders centroid is from primary voters (n=339); no general-election cohort exists.')
}
