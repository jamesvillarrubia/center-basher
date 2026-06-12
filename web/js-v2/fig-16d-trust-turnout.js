// Fig 16d — Swing-state TRUST vs swing-state TURNOUT scatter (12 cycles).
//
// The relationship FLIPS across the Authenticity Floor:
//   - Pre-2008 (high-trust regime, trust >= 0.41 mostly): r = +0.86.
//     Civic-engagement model — when trust is high, turnout is high.
//   - Post-2004 (low-trust regime): r = -0.81.
//     Anti-system mobilization model — collapsing trust drives turnout up.
// Overall r = -0.33 because the regime flip dominates.
//
// Data: scripts/build_swing_trust_turnout.py → swing_trust_turnout.json
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_PRE  = '#a06400'  // pre-2008 high-trust era
const COLOR_POST = '#2a6a3a'  // post-2004 low-trust era

export function drawTrustTurnout(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const cycles = data.cycles
  const W = container.clientWidth || 680
  const margin = { top: 32, right: 40, bottom: 70, left: 70 }
  const innerW = W - margin.left - margin.right
  const innerH = 340
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'br-chart')
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Title/subtitle now live in the HTML figure label + figcaption.

  // Scales
  const x = d3.scaleLinear().domain([0.18, 0.55]).range([0, innerW])
  const y = d3.scaleLinear().domain([60, 90]).range([innerH, 0])

  // Era band shading (vertical, by trust)
  g.append('rect').attr('x', x(0.18)).attr('y', 0)
    .attr('width', x(0.41) - x(0.18)).attr('height', innerH)
    .attr('fill', '#e8efe6').attr('opacity', 0.5)
  g.append('rect').attr('x', x(0.41)).attr('y', 0)
    .attr('width', x(0.55) - x(0.41)).attr('height', innerH)
    .attr('fill', '#fbf3e3').attr('opacity', 0.5)

  // Authenticity Floor vertical line at trust=0.41
  g.append('line').attr('class', 'br-threshold')
    .attr('x1', x(0.41)).attr('x2', x(0.41))
    .attr('y1', 0).attr('y2', innerH)
    .attr('stroke', '#a06400').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '5,3')
  g.append('text')
    .attr('x', x(0.41) + 5).attr('y', 12).attr('text-anchor', 'start')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#a06400')
    .text('Authenticity Floor (trust=0.41)')

  // Band labels
  g.append('text')
    .attr('x', x(0.30)).attr('y', innerH - 8).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#2a6a3a')
    .text('Low-trust regime')
  g.append('text')
    .attr('x', x(0.48)).attr('y', innerH - 8).attr('text-anchor', 'middle')
    .attr('font-size', '11px').attr('font-weight', '700').attr('fill', '#a06400')
    .text('High-trust regime')

  // Axes
  g.append('g').attr('class', 'br-axis')
    .attr('transform', `translate(0, ${innerH})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('.2f')).tickSizeOuter(0))
  g.append('g').attr('class', 'br-axis')
    .call(d3.axisLeft(y).ticks(7).tickFormat(d => `${d}%`).tickSizeOuter(0))
  svg.append('text').attr('class', 'br-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', H - 22).attr('text-anchor', 'middle')
    .text('swing-state mean trust composite (0–1)')
  svg.append('text').attr('class', 'br-axis-title')
    .attr('transform', `translate(20, ${margin.top + innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('swing-state self-reported turnout (%)')

  // Regression line helper
  function regLine(pts, color, dash) {
    if (pts.length < 2) return
    const xs = pts.map(p => p.swing_trust)
    const ys = pts.map(p => p.swing_turnout)
    const mx = d3.mean(xs), my = d3.mean(ys)
    const num = pts.reduce((s, p) => s + (p.swing_trust - mx) * (p.swing_turnout - my), 0)
    const den = pts.reduce((s, p) => s + Math.pow(p.swing_trust - mx, 2), 0)
    const slope = num / den
    const intercept = my - slope * mx
    const xMin = Math.min(...xs) - 0.01
    const xMax = Math.max(...xs) + 0.01
    g.append('line').attr('class', 'br-regline')
      .attr('x1', x(xMin)).attr('x2', x(xMax))
      .attr('y1', y(intercept + slope * xMin)).attr('y2', y(intercept + slope * xMax))
      .attr('stroke', color).attr('stroke-width', 2.5)
      .attr('stroke-dasharray', dash || null)
      .attr('opacity', 0.8)
  }

  const pre = cycles.filter(c => c.cycle <= 2004)
  const post = cycles.filter(c => c.cycle >= 2008)
  regLine(pre, COLOR_PRE)
  regLine(post, COLOR_POST)

  // Dots
  for (const c of cycles) {
    const cx = x(c.swing_trust)
    const cy = y(c.swing_turnout)
    const isPre = c.cycle <= 2004
    g.append('circle').attr('class', 'br-dot')
      .attr('cx', cx).attr('cy', cy).attr('r', 7)
      .attr('fill', isPre ? COLOR_PRE : COLOR_POST)
      .attr('opacity', 0.85)
    g.append('text').attr('class', 'br-dot-label')
      .attr('x', cx + 10).attr('y', cy + 4)
      .attr('font-size', '10.5px').attr('font-weight', '600').attr('fill', '#1b1b1d')
      .text(`'${String(c.cycle).slice(2)}`)
  }

  // Legend
  const legY = 14
  svg.append('circle').attr('cx', margin.left + 6).attr('cy', legY).attr('r', 5).attr('fill', COLOR_PRE)
  svg.append('text').attr('x', margin.left + 16).attr('y', legY + 4)
    .attr('font-size', '11px').text(`Pre-2008 (r=${data.pre_2008_r.toFixed(2)})`)
  svg.append('circle').attr('cx', margin.left + 150).attr('cy', legY).attr('r', 5).attr('fill', COLOR_POST)
  svg.append('text').attr('x', margin.left + 160).attr('y', legY + 4)
    .attr('font-size', '11px').text(`Post-2004 (r=${data.post_2004_r.toFixed(2)})`)

}
