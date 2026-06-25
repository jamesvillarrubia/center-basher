// Fig 19b — The contestable ground (port of v1 chartMoveable).
//
// Same trust × ideology field, but the BLOBS are no longer political
// parties — they are the two moveable cohorts that decide elections:
//   • Persuadable: likely to vote, undecided          (undecided_engaged)
//   • Wavering: decided/partisan, low turnout history (decided_disengaged)
//
// Centroids overlaid: Clinton primary (0.32 trust), Sanders primary
// (0.22), Trump primary (0.12). Both moveable cohorts sit at ~0.19
// trust — IN the Sanders/Trump band, NOT in Clinton's.
//
// Headline: the contestable mass lives in low-trust territory. A
// centrist-establishment pitch is structurally far from where they sit.
import * as d3 from 'https://esm.sh/d3@7'

const COHORTS = [
  { name: 'Persuadable',  desc: 'likely to vote, undecided',          x: 0.05, y: 0.19, color: '#9b5db3' },
  { name: 'Wavering',     desc: 'decided/partisan, low turnout',      x: -0.05, y: 0.19, color: '#5b8d9b' },
]
const CANDS = [
  { name: 'Clinton primary', x: -0.33, y: 0.32, color: '#2c5b9c' },
  { name: 'Sanders primary', x: -0.42, y: 0.22, color: '#4a9b6d' },
  { name: 'Trump primary',   x:  0.46, y: 0.12, color: '#b8240f' },
]

export function drawMoveableGround(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = 680
  const margin = { top: 100, right: 50, bottom: 70, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = Math.min(innerW * 0.75, 400)
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  svg.append('text').attr('class', 'mg-title')
    .attr('x', 0).attr('y', 22)
    .text('The contestable ground sits in low-trust territory')
  svg.append('text').attr('class', 'mg-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Same ideology × trust field as Figure A — but the blobs here are the two MOVEABLE cohorts (not parties).')
  svg.append('text').attr('class', 'mg-subtitle')
    .attr('x', 0).attr('y', 58)
    .text('Both sit at trust ≈ 0.19. Far below Clinton\'s primary base (0.32). In the same band as Sanders (0.22) and Trump (0.12).')

  const x = d3.scaleLinear().domain([-1, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

  // Axes
  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', innerH).attr('stroke', '#ccc')
  g.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', y(0.5)).attr('y2', y(0.5)).attr('stroke', '#ccc')
  g.append('g').attr('class', 'mg-axis').attr('transform', `translate(0, ${innerH})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))
  g.append('g').attr('class', 'mg-axis').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')).tickSizeOuter(0))

  // Moveable cohort blobs (simulated as ellipses centered on their means)
  for (const c of COHORTS) {
    const cx = x(c.x), cy = y(c.y)
    g.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', 110).attr('ry', 50)
      .attr('fill', c.color).attr('opacity', 0.18).attr('stroke', c.color).attr('stroke-opacity', 0.4).attr('stroke-width', 1)
    g.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', 65).attr('ry', 30)
      .attr('fill', c.color).attr('opacity', 0.25)
    g.append('text').attr('x', cx).attr('y', cy - 60).attr('text-anchor', 'middle')
      .attr('font-size', '12px').attr('font-weight', '700').attr('fill', c.color).text(c.name)
    g.append('text').attr('x', cx).attr('y', cy - 46).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', '#555').attr('font-style', 'italic').text(c.desc)
  }

  // Candidate centroids
  for (const c of CANDS) {
    const cx = x(c.x), cy = y(c.y)
    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 8).attr('fill', c.color).attr('stroke', '#fff').attr('stroke-width', 2)
    const lab = c.name === 'Clinton primary' ? -16 : 22
    g.append('text').attr('x', cx).attr('y', cy + lab).attr('text-anchor', 'middle')
      .attr('font-size', '11px').attr('font-weight', '700').attr('fill', c.color).text(c.name)
    g.append('text').attr('x', cx).attr('y', cy + lab + 12).attr('text-anchor', 'middle')
      .attr('font-size', '9.5px').attr('fill', '#555').text(`(${c.x > 0 ? '+' : ''}${c.x}, ${c.y})`)
  }

  svg.append('text').attr('x', margin.left + innerW / 2).attr('y', H - 38).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('fill', '#444').text('← liberal       Ideology       conservative →')
  svg.append('text').attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('fill', '#444').text('Institutional trust  (low ← → high)')
  svg.append('text').attr('x', 0).attr('y', H - 8).attr('font-size', '10.5px').attr('fill', '#666').attr('font-style', 'italic')
    .text('Source: ANES 2016, weighted. Moveable cohorts via V161032 (vote intention) × V161004 (prior turnout). Centroids are weighted means.')
}
