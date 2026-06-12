// Fig 13c (Option C) — Standardized turnout-model coefficients.
//
// Mirrors §11A: a coefficient race showing what predicts turnout, with
// the WARMTH-TO-FAVORITE coefficient as the striking negative bar.
// Stakes (care + contact + affect-spread) wins; ideology ≈ 0;
// liking is *worse than nothing* once controls are in.
//
// Numbers from §13 footnote [3].
import * as d3 from 'https://esm.sh/d3@7'

const ROWS = [
  { name: 'Cares who wins (stakes)',         coef:  0.42, color: '#b8240f' },
  { name: 'Age',                             coef:  0.35, color: '#5b3a8e' },
  { name: 'Education',                       coef:  0.27, color: '#2c5b9c' },
  { name: 'Campaign contact (GOTV)',         coef:  0.23, color: '#2e7d32' },
  { name: 'Affect spread (love + hate)',     coef:  0.22, color: '#b8240f' },
  { name: 'Ideology extremity',              coef:  0.07, color: '#bdb7a8' },
  { name: 'Warmth to favorite candidate',    coef: -0.10, color: '#6b6b70' },
]

export function drawTurnoutCoef(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const margin = { top: 24, right: 70, bottom: 90, left: 200 }
  const innerW = W - margin.left - margin.right
  const rowH = 28
  const rowGap = 12
  const innerH = ROWS.length * rowH + (ROWS.length - 1) * rowGap
  const H = margin.top + innerH + margin.bottom

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('class', 'turnout-coef-chart')

  const x = d3.scaleLinear().domain([-0.2, 0.5]).range([0, innerW])
  const x0 = x(0)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)


  g.append('line').attr('class', 'tc-zero')
    .attr('x1', x0).attr('x2', x0).attr('y1', -4).attr('y2', innerH + 4)
  g.append('text').attr('class', 'tc-zero-label')
    .attr('x', x0).attr('y', -8).attr('text-anchor', 'middle')
    .text('no effect')

  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i]
    const y = i * (rowH + rowGap)
    svg.append('text').attr('class', 'tc-rowlabel')
      .attr('x', margin.left - 12).attr('y', margin.top + y + rowH / 2 + 4)
      .attr('text-anchor', 'end')
      .text(r.name)

    const bx0 = x(Math.min(0, r.coef))
    const bw = Math.abs(x(r.coef) - x0)
    g.append('rect').attr('class', 'tc-bar')
      .attr('x', bx0).attr('y', y).attr('width', bw).attr('height', rowH)
      .attr('fill', r.color)
      .attr('opacity', Math.abs(r.coef) < 0.15 ? 0.55 : 0.95)

    const label = (r.coef >= 0 ? '+' : '') + r.coef.toFixed(2)
    const labelX = r.coef >= 0 ? x(r.coef) + 6 : x(r.coef) - 6
    g.append('text').attr('class', 'tc-coef-label')
      .attr('x', labelX).attr('y', y + rowH / 2 + 4)
      .attr('text-anchor', r.coef >= 0 ? 'start' : 'end')
      .text(label)

    if (r.note) {
      g.append('text').attr('class', 'tc-row-note')
        .attr('x', x0 + 4).attr('y', y + rowH + 11)
        .text(r.note)
    }
  }

  const axisY = innerH + 8
  g.append('g').attr('transform', `translate(0, ${axisY})`)
    .attr('class', 'tc-axis')
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d.toFixed(1)).tickSizeOuter(0))
  g.append('text').attr('class', 'tc-axis-title')
    .attr('x', innerW / 2).attr('y', axisY + 36).attr('text-anchor', 'middle')
    .text('standardized coefficient on P(voted)')
}
