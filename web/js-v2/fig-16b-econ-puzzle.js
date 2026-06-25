// Fig 16b (Option B v2) — The fundamentals puzzle: economy vs popular-vote outcome.
//
// X-axis: unemployment rate at election. Y-axis: Democratic popular-vote
// margin in percentage points (positive = Dem won the popular vote,
// negative = Rep). Dot SIZE encodes the national institutional-trust
// composite that cycle (smaller dot = lower trust era). Dot COLOR
// encodes who actually won the Electoral College.
//
// The popular-vote framing is more honest than win/lost because Gore
// and Clinton both won the popular vote despite losing the EC; the
// 2000 and 2016 cases are not clean "Dem lost on a good economy"
// puzzles if we're scoring by what the population actually preferred.
// The trust dimension matters because 2004 had a post-9/11 trust SPIKE
// that made it the only cycle in the series where the in-power party
// could win without claiming the change lane.
//
// Sources:
//   unemployment: BLS U-3 (Nov of each cycle), §16 [1]
//   trust composite: national mean per cycle from
//     data/clean/swing_state_trust.csv (§16 [16])
//   popular vote margin: Federal Election Commission certified totals,
//     2-party Dem - Rep margin in percentage points.
import * as d3 from 'https://esm.sh/d3@7'

const POINTS = [
  { year: 2000, unemp: 3.9, popMargin:  0.51, trust: 0.423, ecWinner: 'R', candidate: 'Gore'    },
  { year: 2004, unemp: 5.4, popMargin: -2.46, trust: 0.459, ecWinner: 'R', candidate: 'Kerry'   },
  { year: 2008, unemp: 6.8, popMargin:  7.27, trust: 0.367, ecWinner: 'D', candidate: 'Obama'   },
  { year: 2012, unemp: 7.8, popMargin:  3.86, trust: 0.297, ecWinner: 'D', candidate: 'Obama'   },
  { year: 2016, unemp: 4.6, popMargin:  2.10, trust: 0.241, ecWinner: 'R', candidate: 'Clinton' },
  { year: 2020, unemp: 6.7, popMargin:  4.45, trust: 0.197, ecWinner: 'D', candidate: 'Biden'   },
  { year: 2024, unemp: 4.2, popMargin: -1.48, trust: 0.197, ecWinner: 'R', candidate: 'Harris'  },
]

const COLOR = {
  D_WIN: '#2c5b9c',   // Dem won EC
  R_WIN: '#b8240f',   // Rep won EC
}

export function drawEconPuzzle(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = 680
  const margin = { top: 120, right: 30, bottom: 70, left: 80 }
  const innerW = W - margin.left - margin.right
  const innerH = 320
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'ep-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // X is now the trust composite (the era-trust dimension that §15 sets
  // up). Y is unchanged: Dem popular-vote margin. Dot size encodes
  // unemployment so the economy is still in the picture as a secondary
  // dimension.
  const x = d3.scaleLinear().domain([0.18, 0.48]).range([0, innerW])
  const y = d3.scaleLinear().domain([-4, 9]).range([innerH, 0]).nice()
  // Size: unemployment rate (3.9% to 7.8% observed range)
  const size = d3.scaleLinear().domain([3.5, 8.0]).range([8, 22])

  // Title block (no overlap with chart area)
  svg.append('text').attr('class', 'ep-title')
    .attr('x', 0).attr('y', 22)
    .text('Trust era sorts the cycles. Economy is secondary.')
  svg.append('text').attr('class', 'ep-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('National trust composite vs. Democratic popular-vote margin, 2000–2024.')
  svg.append('text').attr('class', 'ep-subtitle')
    .attr('x', 0).attr('y', 58)
    .text('Dot size = unemployment rate at election. Color = who won the Electoral College.')

  // Legend block underneath title
  const legY = 78
  svg.append('circle').attr('cx', margin.left + 6).attr('cy', legY)
    .attr('r', 6).attr('fill', COLOR.D_WIN)
  svg.append('text').attr('class', 'ep-leg').attr('x', margin.left + 16).attr('y', legY + 4)
    .text('Dem won Electoral College')
  svg.append('circle').attr('cx', margin.left + 190).attr('cy', legY)
    .attr('r', 6).attr('fill', COLOR.R_WIN)
  svg.append('text').attr('class', 'ep-leg').attr('x', margin.left + 200).attr('y', legY + 4)
    .text('Rep won Electoral College')

  // Unemployment-size key
  svg.append('text').attr('class', 'ep-leg').attr('x', 0).attr('y', 100)
    .text('Unemployment (size):')
  for (let i = 0; i < 3; i++) {
    const uVal = [4.0, 5.8, 7.8][i]
    const cx = margin.left + 150 + i * 60
    svg.append('circle').attr('cx', cx).attr('cy', 96)
      .attr('r', size(uVal)).attr('fill', 'none').attr('stroke', 'var(--ink-faint)').attr('stroke-width', 1.2)
    svg.append('text').attr('class', 'ep-leg-tiny')
      .attr('x', cx).attr('y', 96 + size(uVal) + 12)
      .attr('text-anchor', 'middle')
      .text(`${uVal}%`)
  }

  // Gridlines (horizontal)
  g.append('g').attr('class', 'ep-grid')
    .call(d3.axisLeft(y).ticks(7).tickSize(-innerW).tickFormat(''))

  // Zero baseline (Y=0, where Dem popular-vote margin = 0)
  g.append('line').attr('class', 'ep-zero')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', y(0)).attr('y2', y(0))
  g.append('text').attr('class', 'ep-zero-label')
    .attr('x', innerW - 4).attr('y', y(0) - 4)
    .attr('text-anchor', 'end')
    .text('tied popular vote')

  // Axes
  g.append('g').attr('class', 'ep-axis')
    .call(d3.axisLeft(y).ticks(7).tickFormat(d => (d > 0 ? `Dem +${d}` : d < 0 ? `Rep +${Math.abs(d)}` : '0')).tickSizeOuter(0))
  g.append('g').attr('class', 'ep-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => d.toFixed(2)).tickSizeOuter(0))
  g.append('text').attr('class', 'ep-axis-title')
    .attr('x', innerW / 2).attr('y', innerH + 38).attr('text-anchor', 'middle')
    .text('national institutional-trust composite (0–1)')
  svg.append('text').attr('class', 'ep-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('Dem popular-vote margin (pp)')

  // Points — x: trust, y: popular-vote margin, size: unemployment
  for (const p of POINTS) {
    const color = p.ecWinner === 'D' ? COLOR.D_WIN : COLOR.R_WIN
    g.append('circle').attr('class', 'ep-dot')
      .attr('cx', x(p.trust)).attr('cy', y(p.popMargin))
      .attr('r', size(p.unemp))
      .attr('fill', color)
      .attr('opacity', 0.92)
    g.append('text').attr('class', 'ep-label')
      .attr('x', x(p.trust)).attr('y', y(p.popMargin) - size(p.unemp) - 6)
      .attr('text-anchor', 'middle')
      .text(`${p.candidate} '${String(p.year).slice(2)}`)
  }

  // Inline note for the 2004 trust spike (the post-9/11 anomaly)
  const p04 = POINTS.find(p => p.year === 2004)
  g.append('text').attr('class', 'ep-anno')
    .attr('x', x(p04.trust) + 26).attr('y', y(p04.popMargin) + 4)
    .text('post-9/11 trust spike')
}
