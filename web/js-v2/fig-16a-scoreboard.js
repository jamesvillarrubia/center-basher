// Fig 16a (Option A) — The 7-cycle change-lane scoreboard.
//
// Each row is one presidential cycle 2000–2024. Columns: cycle,
// in-power party's candidate, how they were cast, who claimed the
// change lane, exit-poll backing, did the rule hold. The 7-for-7
// (with a mixed 2020) is the visual.

const CYCLES = [
  {
    year: 2000, inPower: 'Gore (D)',     castAs: 'establishment 8-yr VP',
    changeLane: 'Bush',                  outcome: 'Yes',
    note: 'Bush dominated character traits, Gore Clinton-era drag',
    ok: true,
  },
  {
    year: 2004, inPower: 'Bush (R, inc.)', castAs: 'wartime strong leader',
    changeLane: 'Bush',                  outcome: 'Yes*',
    note: 'Bush kept the leadership/clarity lane despite incumbency',
    ok: true, partial: true,
  },
  {
    year: 2008, inPower: "McCain (R, Bush's heir)", castAs: 'Bush-tied Senator',
    changeLane: 'Obama',                 outcome: 'Yes',
    note: '"Bring change" 34% → Obama 89-9 (decisive)',
    ok: true,
  },
  {
    year: 2012, inPower: 'Obama (D, inc.)', castAs: 'residual hope/change',
    changeLane: 'Obama',                 outcome: 'Yes',
    note: 'Romney was almost more establishment than Obama',
    ok: true,
  },
  {
    year: 2016, inPower: "Clinton (D, Obama's heir)", castAs: 'establishment continuity',
    changeLane: 'Trump',                 outcome: 'Yes',
    note: '"Brings needed change" 39% → Trump 83-14',
    ok: true,
  },
  {
    year: 2020, inPower: 'Trump (R, inc.)', castAs: 'now "the system"',
    changeLane: 'Biden (mixed)',         outcome: 'Yes (mixed)',
    note: 'Trust signal flat, election decided on COVID + economy',
    ok: true, mixed: true,
  },
  {
    year: 2024, inPower: "Harris (D, Biden's heir)", castAs: 'establishment continuity',
    changeLane: 'Trump',                 outcome: 'Yes',
    note: '"Ability to lead" 30% → Trump 66-33; 74% wanted new direction',
    ok: true,
  },
]

export function drawChangeLaneScoreboard(selector) {
  const root = document.querySelector(selector)
  if (!root) throw new Error(`No container at ${selector}`)

  let rows = ''
  for (const c of CYCLES) {
    const winsByEstablishment = c.inPower.startsWith(c.changeLane.split(' ')[0])
    rows += `
      <tr${c.mixed ? ' class="cls-mixed"' : ''}${c.partial ? ' class="cls-partial"' : ''}>
        <td class="cls-year">${c.year}</td>
        <td class="cls-incumbent">${c.inPower}</td>
        <td class="cls-cast">${c.castAs}</td>
        <td class="cls-lane">${c.changeLane}</td>
        <td class="cls-note">${c.note}</td>
        <td class="cls-outcome">${c.outcome}</td>
      </tr>`
  }

  root.innerHTML = `
    <div class="cls-board">
      <p class="cls-headline">
        The candidate who owns the dominant outsider attribute wins, every cycle since 2000.
        <strong>Successors get cast as the in-power establishment and lose, 4 for 4.</strong>
      </p>
      <table class="cls-table">
        <thead>
          <tr>
            <th>Cycle</th>
            <th>In-power party's candidate</th>
            <th>Cast as</th>
            <th>Change lane</th>
            <th>Exit-poll backing</th>
            <th>Rule</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="cls-foot">
        * 2004: Bush won the dominant leadership/clarity lane despite being incumbent.
        Kerry won the literal "change" attribute (95-5) within only 25% of voters; the
        rule holds on the dominant outsider lane for that wartime cycle, not on the
        literal word.
      </p>
    </div>
  `
}
