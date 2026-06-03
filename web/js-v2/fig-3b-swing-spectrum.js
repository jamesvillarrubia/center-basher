// Fig 3b — Mirrored butterfly histogram of 2016 single-cycle defectors.
//
// Single horizontal lib-con axis (positions 1–7). Dem→Trump defectors
// as blue bars going UP from the center line; Rep→Clinton as red bars
// going DOWN. If swings came from "the middle," both distributions
// would peak at position 4 and the chart would be a symmetric blob.
// They don't — the blue side leans LEFT of center (mean 3.6), the red
// side leans RIGHT (mean 4.7). The mirror asymmetry IS the argument.
import * as d3 from 'https://esm.sh/d3@7'

const COLOR = {
  D2T: '#2c5b9c',
  R2C: '#b8240f',
  AXIS: '#3a3a3d',
}

const POSITIONS = [1, 2, 3, 4, 5, 6, 7]

export function drawSwingSpectrum(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const dist = data.distribution_pct
  const labels = data.labels
  const means = data.weighted_mean_position
  const n = data.n_unweighted

  // Geometry
  const W = container.clientWidth || 680
  const margin = { top: 56, right: 24, bottom: 90, left: 60 }
  const innerW = W - margin.left - margin.right
  const halfH = 130           // each "wing" of the butterfly
  const innerH = halfH * 2
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'spectrum-chart')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Scales
  const x = d3.scaleBand().domain(POSITIONS).range([0, innerW]).padding(0.15)
  const maxPct = 55
  const yUp   = d3.scaleLinear().domain([0, maxPct]).range([halfH, 0])      // 0 at center
  const yDown = d3.scaleLinear().domain([0, maxPct]).range([halfH, innerH])  // 0 at center

  // Center axis line
  g.append('line').attr('class', 'spectrum-center')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', halfH).attr('y2', halfH)

  // Subtle gridlines (horizontal, both sides)
  for (const pct of [10, 20, 30, 40, 50]) {
    g.append('line').attr('class', 'spectrum-grid-line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yUp(pct)).attr('y2', yUp(pct))
    g.append('line').attr('class', 'spectrum-grid-line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yDown(pct)).attr('y2', yDown(pct))
    g.append('text').attr('class', 'spectrum-grid-pct')
      .attr('x', -6).attr('y', yUp(pct) + 3)
      .attr('text-anchor', 'end')
      .text(`${pct}%`)
    g.append('text').attr('class', 'spectrum-grid-pct')
      .attr('x', -6).attr('y', yDown(pct) + 3)
      .attr('text-anchor', 'end')
      .text(`${pct}%`)
  }

  // Highlight "the middle" — vertical band at position 4
  const midBand = g.append('rect').attr('class', 'spectrum-middle-band')
    .attr('x', x(4)).attr('y', 0)
    .attr('width', x.bandwidth()).attr('height', innerH)

  // Bars — Dem→Trump up, Rep→Clinton down. All cells shown.
  for (const p of POSITIONS) {
    const d2t = dist.Dem_to_Trump[p]
    const r2c = dist.Rep_to_Clinton[p]

    // Upper bar (Dem→Trump)
    const upY = yUp(d2t)
    const upH = halfH - upY
    g.append('rect').attr('class', 'spectrum-bar')
      .attr('x', x(p)).attr('y', upY)
      .attr('width', x.bandwidth()).attr('height', upH)
      .attr('fill', COLOR.D2T)
    if (d2t >= 4) {
      g.append('text').attr('class', 'spectrum-pct')
        .attr('x', x(p) + x.bandwidth() / 2)
        .attr('y', upY - 4)
        .attr('text-anchor', 'middle')
        .text(`${d2t.toFixed(0)}%`)
    }

    // Lower bar (Rep→Clinton)
    const downY = halfH
    const downH = yDown(r2c) - halfH
    g.append('rect').attr('class', 'spectrum-bar')
      .attr('x', x(p)).attr('y', downY)
      .attr('width', x.bandwidth()).attr('height', downH)
      .attr('fill', COLOR.R2C)
    if (r2c >= 4) {
      g.append('text').attr('class', 'spectrum-pct')
        .attr('x', x(p) + x.bandwidth() / 2)
        .attr('y', downY + downH + 12)
        .attr('text-anchor', 'middle')
        .text(`${r2c.toFixed(0)}%`)
    }
  }

  // Position labels on the center axis
  for (const p of POSITIONS) {
    g.append('text').attr('class', 'spectrum-xnum')
      .attr('x', x(p) + x.bandwidth() / 2)
      .attr('y', halfH + 4)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .text(p)
  }

  // End-of-axis anchor labels (very faint, below the lower wing)
  g.append('text').attr('class', 'spectrum-end-label')
    .attr('x', 0).attr('y', innerH + 28)
    .attr('text-anchor', 'start')
    .text('← extremely liberal')
  g.append('text').attr('class', 'spectrum-end-label')
    .attr('x', innerW).attr('y', innerH + 28)
    .attr('text-anchor', 'end')
    .text('extremely conservative →')
  g.append('text').attr('class', 'spectrum-end-label')
    .attr('x', x(4) + x.bandwidth() / 2).attr('y', innerH + 28)
    .attr('text-anchor', 'middle')
    .text('moderate')

  // Mean markers removed — the bars themselves carry the asymmetry,
  // and the legend names each direction's mean position.

  // Legend at top: which color is which
  const legendY = -42
  const legendItems = [
    { color: COLOR.D2T, text: `Dems who voted Trump (mean ${means.Dem_to_Trump.toFixed(1)}, n=${n.Dem_to_Trump})` },
    { color: COLOR.R2C, text: `Reps who voted Clinton (mean ${means.Rep_to_Clinton.toFixed(1)}, n=${n.Rep_to_Clinton})` },
  ]
  let lx = 0
  for (const item of legendItems) {
    g.append('rect').attr('x', lx).attr('y', legendY)
      .attr('width', 12).attr('height', 12).attr('fill', item.color)
    g.append('text').attr('class', 'spectrum-legend')
      .attr('x', lx + 16).attr('y', legendY + 10)
      .text(item.text)
    lx += item.text.length * 5.6 + 32
  }

  // "If swings came from the middle…" hint above pos 4
  g.append('text').attr('class', 'spectrum-mid-hint')
    .attr('x', x(4) + x.bandwidth() / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .text('"the middle"')
}
