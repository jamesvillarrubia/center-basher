// Fig 3 — Cross-cycle vote consistency by self-ID, 2012/2016/2020.
//
// Three horizontal bars, one per ideology band. Each bar is a 100%
// partition of that band's three-cycle voters into:
//   • always-D (blue)   — voted Dem nominee in all three elections
//   • switched (grey)   — voted both parties at some point
//   • always-R (red)    — voted Rep nominee in all three elections
//
// The moderate row is the punchline: its bar visually splits into two
// partisan blocs, with only a thin switcher slice between them — the
// "moderate" label is a tie-zone label, not a behavioral one.
import * as d3 from 'https://esm.sh/d3@7'

const COLOR = {
  D:       '#2c5b9c',   // dem blue
  SWITCH:  '#bdb7a8',   // neutral warm grey
  R:       '#b8240f',   // accent red
}

const BANDS = [
  { key: 'liberal',      label: 'Liberals',      short: 'Liberals' },
  { key: 'moderate',     label: 'Moderates',     short: 'Moderates' },
  { key: 'conservative', label: 'Conservatives', short: 'Conservatives' },
]

export function drawCrossCycleConsistency(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  // Index rows by band
  const byBand = {}
  for (const r of data.rows) byBand[r.band] = r

  // Geometry
  const W = container.clientWidth || 680
  const margin = { top: 36, right: 24, bottom: 50, left: 160 }
  const innerW = W - margin.left - margin.right
  const rowH = 34
  const rowGap = 26
  const totalH = margin.top + 3 * rowH + 2 * rowGap + margin.bottom

  const x = d3.scaleLinear().domain([0, 100]).range([0, innerW])

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${totalH}`)
    .attr('class', 'consistency-chart')

  // Legend at top (compact text so all three fit on one line)
  const legendY = 12
  const legendItems = [
    { color: COLOR.D,      text: 'All 3 cycles: Dem' },
    { color: COLOR.SWITCH, text: 'Switched at least once' },
    { color: COLOR.R,      text: 'All 3 cycles: Rep' },
  ]
  let legendX = margin.left
  for (const item of legendItems) {
    svg.append('rect').attr('x', legendX).attr('y', legendY)
      .attr('width', 12).attr('height', 12).attr('fill', item.color)
    svg.append('text').attr('class', 'consistency-legend')
      .attr('x', legendX + 16).attr('y', legendY + 10)
      .text(item.text)
    legendX += item.text.length * 5.8 + 24
  }

  // Rows
  for (let i = 0; i < BANDS.length; i++) {
    const b = BANDS[i]
    const row = byBand[b.key]
    if (!row) continue
    const y = margin.top + i * (rowH + rowGap)

    // Left label
    svg.append('text').attr('class', 'consistency-rowlabel')
      .attr('x', margin.left - 12).attr('y', y + rowH / 2 - 2)
      .attr('text-anchor', 'end')
      .text(b.label)
    svg.append('text').attr('class', 'consistency-rowsub')
      .attr('x', margin.left - 12).attr('y', y + rowH / 2 + 14)
      .attr('text-anchor', 'end')
      .text(`n=${row.n_unweighted}; ${row.consistent_pct}% consistent`)

    // Segments: [D | switched | R]
    // Each segment carries a long form and a short form for the inline
    // label so we can fall back to "%" when the segment is too narrow
    // for the full "<n>% <category>" string.
    const segs = [
      { key: 'D',      pct: row.always_dem_pct, fill: COLOR.D,      longLabel: `${row.always_dem_pct.toFixed(0)}% always-D` },
      { key: 'SWITCH', pct: row.switched_pct,   fill: COLOR.SWITCH, longLabel: `${row.switched_pct.toFixed(0)}% switched` },
      { key: 'R',      pct: row.always_rep_pct, fill: COLOR.R,      longLabel: `${row.always_rep_pct.toFixed(0)}% always-R` },
    ]

    let cumX = 0
    for (const s of segs) {
      const segW = x(s.pct)
      svg.append('rect').attr('class', 'consistency-seg')
        .attr('x', margin.left + cumX).attr('y', y)
        .attr('width', segW).attr('height', rowH)
        .attr('fill', s.fill)

      const isLight = s.key === 'SWITCH'
      const cls = isLight ? 'consistency-pct-dark' : 'consistency-pct'
      if (segW >= 100) {
        // Full label fits inside the segment
        svg.append('text').attr('class', cls)
          .attr('x', margin.left + cumX + segW / 2).attr('y', y + rowH / 2 + 4)
          .attr('text-anchor', 'middle')
          .text(s.longLabel)
      } else if (segW >= 32) {
        // Only the % fits inside
        svg.append('text').attr('class', cls)
          .attr('x', margin.left + cumX + segW / 2).attr('y', y + rowH / 2 + 4)
          .attr('text-anchor', 'middle')
          .text(`${s.pct.toFixed(0)}%`)
      } else if (segW >= 6) {
        // Small segment — % above the bar instead
        svg.append('text').attr('class', 'consistency-pct-outside')
          .attr('x', margin.left + cumX + segW / 2).attr('y', y - 4)
          .attr('text-anchor', 'middle')
          .text(`${s.pct.toFixed(0)}%`)
      }
      cumX += segW
    }
  }

  // X-axis
  const axisY = margin.top + 3 * rowH + 2 * rowGap + 6
  svg.append('g').attr('transform', `translate(${margin.left}, ${axisY})`)
    .attr('class', 'consistency-axis')
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSizeOuter(0))
  svg.append('text').attr('class', 'consistency-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', axisY + 32)
    .attr('text-anchor', 'middle')
    .text('share of band (% of three-cycle voters)')
}
