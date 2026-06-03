// Fig 9c (Option C) — Three side-by-side cycle cards with status pills.
//
// Each card: cycle, Trump's role that year, ✓/✗ crossover badge, the
// low-trust and high-trust honesty leaders, and the gap at each end.
// The "on / off / on" pattern reads as three pill-shaped badges across
// a row.
import { CYCLES } from './fig-9-data.js'

function leader(dem, rep, key) {
  // key is 'low' or 'high'; return the candidate rated higher
  return dem[key] >= rep[key] ? dem : rep
}

export function drawCycleCards(selector) {
  const root = document.querySelector(selector)
  if (!root) throw new Error(`No container at ${selector}`)
  root.innerHTML = ''

  for (const c of CYCLES) {
    const card = document.createElement('div')
    card.className = 'cycle-card ' + (c.crossover ? 'is-on' : 'is-off')

    const lowLead  = leader(c.dem, c.rep, 'low')
    const highLead = leader(c.dem, c.rep, 'high')
    const lowGap   = Math.abs(c.dem.low  - c.rep.low ).toFixed(2)
    const highGap  = Math.abs(c.dem.high - c.rep.high).toFixed(2)

    card.innerHTML = `
      <div class="cycle-card-head">
        <span class="cycle-card-year">${c.year}</span>
        <span class="cycle-card-pill ${c.crossover ? 'pill-on' : 'pill-off'}">
          ${c.crossover ? '✓ crossover' : '✗ no crossover'}
        </span>
      </div>
      <p class="cycle-card-role">${c.role}</p>
      <p class="cycle-card-matchup">
        <span style="color:${c.dem.color}">${c.dem.name} (D)</span>
        vs
        <span style="color:${c.rep.color}">${c.rep.name} (R)</span>
      </p>
      <ul class="cycle-card-rows">
        <li>
          <span class="cycle-row-tag">Low-trust voters chose</span>
          <span class="cycle-row-leader" style="color:${lowLead.color}">${lowLead.name}</span>
          <span class="cycle-row-gap">by ${lowGap}</span>
        </li>
        <li>
          <span class="cycle-row-tag">High-trust voters chose</span>
          <span class="cycle-row-leader" style="color:${highLead.color}">${highLead.name}</span>
          <span class="cycle-row-gap">by ${highGap}</span>
        </li>
      </ul>
    `
    root.appendChild(card)
  }
}
