// Fig 8a (Option A) — Two perception panels (matches §7 structure).
//
// Left panel: how LOW-trust voters rated Clinton vs Trump on "honest"
// Right panel: how HIGH-trust voters rated them. Same two candidates,
// flipped ratings. The cause named under each panel is "alignment with
// the voter's own trust position."
//
// Numbers from §8 footnote [2]: 0-4 scale, higher = trait fits better.
//   Low-trust:  Trump 1.58, Clinton 0.54
//   High-trust: Clinton 1.77, Trump 0.93

const MAX = 4

const PANELS = [
  {
    key: 'low',
    voterTitle: 'Low-trust voters',
    voterSub: 'rated 2016 candidates on "is honest"',
    headline: 'Trump rated more honest.',
    cause: 'Anti-establishment voters read the anti-establishment candidate as authentic.',
    bars: [
      { name: 'Trump',   pct: 1.58, color: '#b8240f' },
      { name: 'Clinton', pct: 0.54, color: '#2c5b9c' },
    ],
  },
  {
    key: 'high',
    voterTitle: 'High-trust voters',
    voterSub: 'rated 2016 candidates on "is honest"',
    headline: 'Clinton rated more honest.',
    cause: 'Establishment-confident voters read the establishment candidate as authentic.',
    bars: [
      { name: 'Clinton', pct: 1.77, color: '#2c5b9c' },
      { name: 'Trump',   pct: 0.93, color: '#b8240f' },
    ],
  },
]

export function drawPerceptionPanels(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  for (const p of PANELS) {
    const panel = document.createElement('div')
    panel.className = 'loyalty-panel'

    const header = document.createElement('div')
    header.className = 'loyalty-header'
    header.innerHTML = `
      <p class="loyalty-tent">${p.voterTitle}</p>
      <p class="loyalty-q">${p.voterSub}</p>
    `
    panel.appendChild(header)

    const bars = document.createElement('div')
    bars.className = 'loyalty-bars'
    for (const b of p.bars) {
      const widthPct = (b.pct / MAX) * 100
      const row = document.createElement('div')
      row.className = 'loyalty-row'
      row.innerHTML = `
        <p class="loyalty-trustlabel">${b.name}</p>
        <div class="loyalty-bar-and-pct">
          <div class="loyalty-track">
            <div class="loyalty-fill" style="width:${widthPct}%; background:${b.color}"></div>
          </div>
          <span class="loyalty-pct">${b.pct.toFixed(2)}</span>
        </div>
      `
      bars.appendChild(row)
    }
    panel.appendChild(bars)

    const foot = document.createElement('div')
    foot.className = 'loyalty-foot'
    foot.innerHTML = `
      <p class="loyalty-headline">${p.headline}</p>
      <p class="loyalty-cause">${p.cause}</p>
    `
    panel.appendChild(foot)
    container.appendChild(panel)
  }
}
