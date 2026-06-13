// Fig 1 — Three blocks, three rows each.
//
// Each block starts with one of the three groups, then narrows by adding
// another group as a filter, then narrows once more to the triple
// intersection. Bars sit on a shared 0–100% voter-share axis, so each
// successive bar visibly nests inside the one above it.
//
// Block A · Self-labeled moderates
//   row 1:  all self-labeled moderates                        26.6% of voters
//   row 2:  ... who are also policy-centrist                  13.9% of voters
//   row 3:  ... who are also swing voters (all three)          0.3% of voters
//
// Block B · Policy centrists  (parallel structure)
// Block C · Swing voters        (parallel structure)
//
// Numbers come from the same partition data: total pairwise intersection
// = (also_X_only + all_three) × pop_row / 100; triple = pop[M ∩ C ∩ S].
import * as d3 from 'https://esm.sh/d3@7'

const COLOR_BLOCK = {
  M: 'var(--col-silent)',     // blue
  C: 'var(--col-boomer)',     // teal
  S: 'var(--col-millennial)', // orange
}

const NAMES = {
  M: { plural: 'Self-labeled moderates', adj: 'self-labeled moderate' },
  C: { plural: 'Policy centrists',       adj: 'policy-centrist' },
  S: { plural: 'Swing voters',           adj: 'swing voter' },
}

// For each starting group, which other group gets row 2 (the bigger overlap
// is more informative; everyone ends at the triple intersection on row 3).
const SECOND_FILTER = {
  M: 'C',  // moderates → also policy-centrist → all three
  C: 'M',  // centrists → also self-labeled moderate → all three
  S: 'M',  // swings    → also self-labeled moderate → all three
}

export function drawOverlapMatrix(selector, data) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const pop = data.pop_share_pct
  const part = data.partition_pct

  // Derive the % of all voters at each step of each block's narrowing.
  function blockData(R) {
    const p = part[R]
    const F = SECOND_FILTER[R]          // the "second-stage" filter group
    const third = p.others.find(k => k !== F)  // the leftover group (third stage)

    // Row 1: R (popR % of voters)
    const row1 = pop[R]
    // Row 2: R ∩ F = (also_F_only + all_three) % of R-group × popR / 100
    const pctOfR_inF = p[`also_${F}_only`] + p.all_three
    const row2 = (pop[R] * pctOfR_inF) / 100
    // Row 3: all three (constant across blocks): pop[R] * all_three / 100
    const row3 = (pop[R] * p.all_three) / 100

    return { R, F, third, row1, row2, row3 }
  }

  const blocks = ['M', 'C', 'S'].map(blockData)

  // Geometry
  const W = container.clientWidth || 680
  const margin = { top: 14, right: 120, bottom: 50, left: 14 }
  const innerW = W - margin.left - margin.right
  const rowH = 16
  const rowGap = 6
  const blockTitleH = 22
  const blockH = blockTitleH + 3 * rowH + 2 * rowGap
  const blockGap = 22
  const totalH = margin.top + 3 * blockH + 2 * blockGap + margin.bottom

  const x = d3.scaleLinear().domain([0, 100]).range([0, innerW])

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${W} ${totalH}`)
    .attr('class', 'cascade-chart')

  const root = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  function drawBlock(blk, blockIdx) {
    const yBlock = blockIdx * (blockH + blockGap)
    const groupColor = COLOR_BLOCK[blk.R]

    // Block title — colored dot + group name
    const title = root.append('g').attr('transform', `translate(0, ${yBlock})`)
    title.append('circle').attr('cx', 6).attr('cy', 8).attr('r', 5)
      .attr('fill', groupColor)
    title.append('text').attr('class', 'cb-block-title')
      .attr('x', 18).attr('y', 12)
      .text(NAMES[blk.R].plural)

    // Three rows
    const rows = [
      {
        widthPct: blk.row1,
        leftLabel: `all ${NAMES[blk.R].adj}s`,
        rightLabel: `${blk.row1.toFixed(1)}% of voters`,
      },
      {
        widthPct: blk.row2,
        leftLabel: `…also ${NAMES[blk.F].adj}`,
        rightLabel: `${blk.row2.toFixed(1)}% of voters`,
      },
      {
        widthPct: blk.row3,
        leftLabel: `…also ${NAMES[blk.third].adj} (all three)`,
        rightLabel: `${blk.row3.toFixed(2)}%`,
      },
    ]

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const yRow = yBlock + blockTitleH + i * (rowH + rowGap)

      // Full-width background track — warm tan so the row is visible even
      // when the filled portion is tiny.
      root.append('rect').attr('class', 'cb-track')
        .attr('x', 0).attr('y', yRow)
        .attr('width', innerW).attr('height', rowH)

      // Filled bar from x=0 to widthPct — full saturation on every row.
      const wPx = x(r.widthPct)
      root.append('rect').attr('class', 'cb-bar')
        .attr('x', 0).attr('y', yRow)
        .attr('width', Math.max(wPx, 2))
        .attr('height', rowH)
        .attr('fill', groupColor)

      // Always place the row label outside the bar (on the tan track,
      // immediately to the right of the filled portion).
      root.append('text').attr('class', 'cb-row-label-outside')
        .attr('x', wPx + 8)
        .attr('y', yRow + rowH / 2 + 4)
        .text(r.leftLabel)

      // Right-side % label, outside the chart area
      root.append('text').attr('class', 'cb-row-pct')
        .attr('x', innerW + 8).attr('y', yRow + rowH / 2 + 4)
        .text(r.rightLabel)
    }
  }

  blocks.forEach((blk, i) => drawBlock(blk, i))

  // X-axis at the bottom — % of all U.S. voters
  const axisY = margin.top + 3 * blockH + 2 * blockGap + 10
  svg.append('g').attr('transform', `translate(${margin.left}, ${axisY})`)
    .attr('class', 'cascade-axis')
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSizeOuter(0))
  svg.append('text').attr('class', 'cascade-axis-title')
    .attr('x', margin.left + innerW / 2).attr('y', axisY + 32)
    .attr('text-anchor', 'middle')
    .text('share of all U.S. voters')
}
