// Fig 15a (Option A) — Per-cycle trust→vote coefficient, 1972-2024.
//
// One vertical bar per cycle showing the standardized weighted-logistic
// coefficient of trust on P(Republican vote). The bar color encodes the
// incumbent party that cycle (the party holding the White House going
// in). The "anti-incumbent rule" prediction: low-trust voters oppose the
// in-party, so β should be POSITIVE when a Democrat holds the WH (trust
// → vote-against-Dem = Rep) and NEGATIVE when a Republican holds it.
// Rule holds in 10 of 14 cycles.
//
// Numbers from plain-language.md §15 footnote [2].
import * as d3 from 'https://esm.sh/d3@7'

const CYCLES = [
  { year: 1972, incumbent: 'R', coef:  0.32, ok: true  },
  { year: 1976, incumbent: 'R', coef:  0.49, ok: true  },
  { year: 1980, incumbent: 'D', coef: -0.01, ok: false },
  { year: 1984, incumbent: 'R', coef:  0.34, ok: true  },
  { year: 1988, incumbent: 'R', coef:  0.32, ok: true  },
  { year: 1992, incumbent: 'R', coef:  0.21, ok: true  },
  { year: 1996, incumbent: 'D', coef: -0.07, ok: true  },
  { year: 2000, incumbent: 'D', coef:  0.03, ok: false },
  { year: 2004, incumbent: 'R', coef:  0.77, ok: true  },
  { year: 2008, incumbent: 'R', coef: -0.04, ok: false },
  { year: 2012, incumbent: 'D', coef: -0.31, ok: true  },
  { year: 2016, incumbent: 'D', coef: -0.28, ok: true  },
  { year: 2020, incumbent: 'R', coef:  0.05, ok: false },
  { year: 2024, incumbent: 'D', coef: -0.17, ok: true  },
]

const COLOR = {
  D: '#2c5b9c',   // Dem incumbent: rule predicts negative β
  R: '#b8240f',   // Rep incumbent: rule predicts positive β
}

export function drawTrustVoteCycles(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 80, right: 16, bottom: 80, left: 130 }
  const innerW = W - margin.left - margin.right
  const innerH = 280
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'tvc-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title
  svg.append('text').attr('class', 'tvc-title')
    .attr('x', margin.left).attr('y', 22)
    .text('Trust signal flips with the White House')
  svg.append('text').attr('class', 'tvc-subtitle')
    .attr('x', margin.left).attr('y', 40)
    .text('Standardized β of voter trust on P(Republican vote), per presidential cycle.')
  svg.append('text').attr('class', 'tvc-subtitle')
    .attr('x', margin.left).attr('y', 56)
    .text('Bar color = incumbent party. Rule holds in 10 of 14 cycles.')

  // Scales
  const x = d3.scaleBand().domain(CYCLES.map(c => c.year))
    .range([0, innerW]).padding(0.18)
  const yMax = 0.9
  const y = d3.scaleLinear().domain([-yMax, yMax]).range([innerH, 0]).nice()
  const y0 = y(0)

  // Zero baseline
  g.append('line').attr('class', 'tvc-zero')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', y0).attr('y2', y0)

  // Faint gridlines
  g.append('g').attr('class', 'tvc-grid')
    .call(d3.axisLeft(y).tickValues([-0.5, 0.5]).tickSize(-innerW).tickFormat(''))

  // Y-axis
  g.append('g').attr('class', 'tvc-axis')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => (d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1))).tickSizeOuter(0))
  svg.append('text').attr('class', 'tvc-y-title')
    .attr('transform', `translate(16, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('β: trust → Republican vote')

  // X-axis
  g.append('g').attr('class', 'tvc-axis')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickFormat(d => `'${String(d).slice(2)}`).tickSizeOuter(0))

  // Region labels
  svg.append('text').attr('class', 'tvc-region')
    .attr('x', margin.left - 8).attr('y', margin.top + y(0.55))
    .attr('text-anchor', 'end').attr('fill', COLOR.R)
    .text('Trust → Rep')
  svg.append('text').attr('class', 'tvc-region')
    .attr('x', margin.left - 8).attr('y', margin.top + y(-0.55))
    .attr('text-anchor', 'end').attr('fill', COLOR.D)
    .text('Trust → Dem')

  // Bars
  for (const c of CYCLES) {
    const barX = x(c.year)
    const barY = c.coef >= 0 ? y(c.coef) : y0
    const barH = Math.abs(y(c.coef) - y0)

    g.append('rect').attr('class', 'tvc-bar')
      .attr('x', barX).attr('y', barY)
      .attr('width', x.bandwidth()).attr('height', Math.max(barH, 1.5))
      .attr('fill', COLOR[c.incumbent])
      .attr('opacity', c.ok ? 0.95 : 0.45)

    // Check or X above/below the bar
    const markY = c.coef >= 0 ? barY - 6 : barY + barH + 14
    g.append('text').attr('class', c.ok ? 'tvc-tick' : 'tvc-cross')
      .attr('x', barX + x.bandwidth() / 2).attr('y', markY)
      .attr('text-anchor', 'middle')
      .text(c.ok ? '✓' : '✗')
  }

  // Footer key
  const keyY = innerH + 56
  const keyItems = [
    { color: COLOR.D, text: 'Democrat in White House' },
    { color: COLOR.R, text: 'Republican in White House' },
  ]
  let kx = 0
  for (const item of keyItems) {
    g.append('rect').attr('x', kx).attr('y', keyY)
      .attr('width', 11).attr('height', 11).attr('fill', item.color)
    g.append('text').attr('class', 'tvc-key')
      .attr('x', kx + 16).attr('y', keyY + 9)
      .text(item.text)
    kx += item.text.length * 6.4 + 28
  }
}
