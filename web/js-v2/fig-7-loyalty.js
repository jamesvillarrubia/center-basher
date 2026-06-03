// Fig 7 — Loyalty rate by trust level, two panels (Dems + indeps vs Reps).
//
// Plain-language redesign: replaces the "System Critics / Believers"
// typology and "bolt rate" jargon with concrete labels — share who
// voted their own party's candidate by trust level. The structural
// cause is named under each panel ("Clinton = establishment" /
// "Trump = anti-establishment"). The asymmetry shows as opposite
// slopes on the same shape.
//
// Numbers from data/clean/within_tent_bolt.csv (vote_own_pct).
import * as d3 from 'https://esm.sh/d3@7'

const PANELS = [
  {
    key: 'dems',
    tent: 'Democrats + independents',
    color: '#2c5b9c',
    candidate: 'Clinton',
    headline: 'For Democrats, distrust pushed voters AWAY from Clinton.',
    cause: 'Clinton was the establishment candidate, so distrust meant leaving her.',
    rows: [
      { label: 'Trust government a lot',  pct: 90, n: 558 },
      { label: 'Trust government somewhat', pct: 77, n: 842 },
      { label: 'Don’t trust government',  pct: 47, n: 104 },
    ],
  },
  {
    key: 'reps',
    tent: 'Republicans',
    color: '#b8240f',
    candidate: 'Trump',
    headline: 'For Republicans, distrust kept voters WITH Trump.',
    cause: 'Trump was the anti-establishment candidate, so distrust meant staying with him.',
    rows: [
      { label: 'Trust government a lot',  pct: 80, n: 426 },
      { label: 'Trust government somewhat', pct: 88, n: 524 },
      { label: 'Don’t trust government',  pct: 94, n: 193 },
    ],
  },
]

export function drawLoyalty(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  // Build the two panels as HTML (not SVG) so the labels reflow nicely
  // on narrow widths and the prose under each panel reads as prose.
  for (const p of PANELS) {
    const panel = document.createElement('div')
    panel.className = 'loyalty-panel'

    const header = document.createElement('div')
    header.className = 'loyalty-header'
    header.innerHTML = `
      <p class="loyalty-tent">${p.tent}</p>
      <p class="loyalty-q">Share who voted <strong>${p.candidate}</strong></p>
    `
    panel.appendChild(header)

    const bars = document.createElement('div')
    bars.className = 'loyalty-bars'
    for (const r of p.rows) {
      const row = document.createElement('div')
      row.className = 'loyalty-row'
      row.innerHTML = `
        <p class="loyalty-trustlabel">${r.label}</p>
        <div class="loyalty-bar-and-pct">
          <div class="loyalty-track">
            <div class="loyalty-fill" style="width:${r.pct}%; background:${p.color}"></div>
          </div>
          <span class="loyalty-pct">${r.pct}%</span>
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
