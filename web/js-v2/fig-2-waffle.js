// Fig 2 — Two-stage 100-voter waffle for §2.
//
// Stage 1 (10×10 = 100 dots): split the electorate into the three
// top-level buckets that produce the "40 self-ID moderates" figure.
//
//   Whatevers              26   haven't thought about ideology
//   Partisans              34   placed themselves clearly L or R
//   Self-ID moderates      40   self-place at 3, 4, or 5 on lib-con
//
// Stage 2 (10×4 = 40 dots): zoom into the 40 moderates and split them
// into the three sub-buckets that produce the "1 True Middler" figure.
//
//   Grab-Baggers           28   self-ID mod, policy mean off-center
//   MidMiddlers            11   policy mean within ±0.75 of center
//   True Middler            1   centrist on every issue (circled)
import * as d3 from 'https://esm.sh/d3@7'

const C = {
  WHATEVER: '#c5c0b5',
  PARTISAN: '#5b3a8e',
  MODERATE: '#7aa8d6',    // soft blue — "the bloc the textbook calls courtable"
  GRABBAG:  '#e85d28',
  MIDMID:   '#2a9d8f',
  TRUE:     '#b8240f',
  CONNECTOR:'#6b6b70',
}

const STAGE1 = [
  { key: 'whatever', n: 26, label: 'Whatevers',         blurb: 'haven’t thought about ideology',   color: C.WHATEVER },
  { key: 'partisan', n: 34, label: 'Partisans',         blurb: 'clearly left or right',            color: C.PARTISAN },
  { key: 'moderate', n: 40, label: 'Self-ID moderates', blurb: 'placed themselves at 3, 4, or 5',  color: C.MODERATE },
]

const STAGE2 = [
  { key: 'grabbag', n: 17, label: 'Grab-Baggers',  blurb: 'self-ID mod, policy off-center',     color: C.GRABBAG },
  { key: 'midmid',  n: 22, label: 'MidMiddlers',   blurb: 'policy mean within ±0.75 of center', color: C.MIDMID },
  { key: 'true',    n:  1, label: 'True Middler',  blurb: 'centrist on every issue',            color: C.TRUE },
]

function dotGrid(g, items, cols, rows, dotPitch, dotR, opts = {}) {
  const dots = []
  let idx = 0
  for (const it of items) {
    for (let k = 0; k < it.n; k++, idx++) {
      const row = Math.floor(idx / cols)
      const col = idx % cols
      dots.push({ row, col, item: it })
    }
  }
  for (const d of dots) {
    const cx = d.col * dotPitch + dotPitch / 2
    const cy = d.row * dotPitch + dotPitch / 2
    const isTrue = d.item.key === 'true'
    g.append('circle').attr('class', isTrue ? 'waffle-dot waffle-dot--true' : 'waffle-dot')
      .attr('cx', cx).attr('cy', cy).attr('r', dotR)
      .attr('fill', d.item.color)
    if (isTrue) {
      g.append('circle').attr('class', 'waffle-true-ring')
        .attr('cx', cx).attr('cy', cy).attr('r', dotR + 4)
    }
  }
  return { gridW: cols * dotPitch, gridH: rows * dotPitch }
}

function legend(svg, items, x, y) {
  const lg = svg.append('g').attr('transform', `translate(${x},${y})`)
    .attr('class', 'waffle-legend')
  let yL = 0
  for (const b of items) {
    lg.append('circle').attr('cx', 6).attr('cy', yL + 4).attr('r', 5)
      .attr('fill', b.color)
    if (b.key === 'true') {
      lg.append('circle').attr('cx', 6).attr('cy', yL + 4).attr('r', 9)
        .attr('fill', 'none').attr('stroke', 'var(--ink)').attr('stroke-width', 1.3)
        .attr('stroke-dasharray', '2 2')
    }
    lg.append('text').attr('class', 'waffle-bucket-name')
      .attr('x', 22).attr('y', yL + 8)
      .text(`${b.label} (${b.n})`)
    yL += 14
    lg.append('text').attr('class', 'waffle-bucket-blurb')
      .attr('x', 22).attr('y', yL + 6)
      .text(b.blurb)
    yL += 20
  }
}

export function drawHundredVoters(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680

  // STAGE 1 — full electorate (10 × 10)
  const s1 = { cols: 10, rows: 10, margin: { top: 14, right: 220, bottom: 8, left: 14 } }
  const s1innerW = W - s1.margin.right - s1.margin.left
  const s1pitch = Math.floor(s1innerW / s1.cols)
  const s1dotR = Math.max(5, Math.floor(s1pitch * 0.22))
  const s1gridH = s1.rows * s1pitch
  const s1H = s1.margin.top + s1gridH + s1.margin.bottom

  // Divider/zoom band
  const bandH = 48

  // STAGE 2 — zoomed 40 (10 × 4)
  const s2 = { cols: 10, rows: 4, margin: { top: 6, right: 220, bottom: 12, left: 14 } }
  const s2pitch = s1pitch                 // SAME dot size to read as "zoom" not "different chart"
  const s2dotR = s1dotR
  const s2gridH = s2.rows * s2pitch
  const s2H = s2.margin.top + s2gridH + s2.margin.bottom

  const totalH = s1H + bandH + s2H

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${totalH}`)
    .attr('class', 'waffle-chart')

  // Stage 1 grid
  const g1 = svg.append('g').attr('transform', `translate(${s1.margin.left},${s1.margin.top})`)
  const s1box = dotGrid(g1, STAGE1, s1.cols, s1.rows, s1pitch, s1dotR)

  // Stage 1 caption above the grid
  svg.append('text').attr('class', 'waffle-stage-caption')
    .attr('x', s1.margin.left).attr('y', s1.margin.top - 2)
    .text('All 100 voters')

  legend(svg, STAGE1, s1.margin.left + s1box.gridW + 24, s1.margin.top)

  // Band between the two stages: dashed boundary box around the 40
  // moderate dots in stage 1 + an arrow to stage 2.
  const modStartRow = (26 + 34) / s1.cols          // = 6.0 → starts at row 6
  const modBoxY = s1.margin.top + modStartRow * s1pitch
  const modBoxH = (40 / s1.cols) * s1pitch         // 4 rows
  svg.append('rect').attr('class', 'waffle-zoom-box')
    .attr('x', s1.margin.left - 2).attr('y', modBoxY - 2)
    .attr('width', s1box.gridW + 4).attr('height', modBoxH + 4)
    .attr('fill', 'none')

  // Arrow: from middle of the moderate box down to stage 2 top edge.
  const arrowX = s1.margin.left + s1box.gridW / 2
  const arrowTopY = modBoxY + modBoxH + 6
  const arrowBotY = s1H + bandH - 6
  svg.append('line').attr('class', 'waffle-zoom-arrow')
    .attr('x1', arrowX).attr('y1', arrowTopY)
    .attr('x2', arrowX).attr('y2', arrowBotY)
  svg.append('path').attr('class', 'waffle-zoom-arrow-head')
    .attr('d', `M ${arrowX - 5} ${arrowBotY - 6} L ${arrowX} ${arrowBotY} L ${arrowX + 5} ${arrowBotY - 6}`)
  svg.append('text').attr('class', 'waffle-zoom-label')
    .attr('x', arrowX + 12).attr('y', arrowTopY + (arrowBotY - arrowTopY) / 2 + 4)
    .text('zoom in on the 40 self-ID moderates')

  // Stage 2 grid
  const s2Y = s1H + bandH
  const g2 = svg.append('g').attr('transform', `translate(${s2.margin.left},${s2Y + s2.margin.top})`)
  const s2box = dotGrid(g2, STAGE2, s2.cols, s2.rows, s2pitch, s2dotR)

  // Stage 2 caption
  svg.append('text').attr('class', 'waffle-stage-caption')
    .attr('x', s2.margin.left).attr('y', s2Y + s2.margin.top - 2)
    .text('Of those 40 moderates…')

  legend(svg, STAGE2, s2.margin.left + s2box.gridW + 24, s2Y + s2.margin.top)

  // Funnel summary under stage 2 legend
  svg.append('text').attr('class', 'waffle-funnel')
    .attr('x', s2.margin.left + s2box.gridW + 24)
    .attr('y', s2Y + s2.margin.top + STAGE2.length * 34 + 8)
    .text('100 → 74 → 40 → 23 → 1')
  svg.append('text').attr('class', 'waffle-funnel-sub')
    .attr('x', s2.margin.left + s2box.gridW + 24)
    .attr('y', s2Y + s2.margin.top + STAGE2.length * 34 + 22)
    .text('the funnel collapses to one voter')
}
