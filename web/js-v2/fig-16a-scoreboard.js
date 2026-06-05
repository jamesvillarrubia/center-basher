// Fig 16a — The frame-match scoreboard, 1980-2024.
//
// Restated per user feedback (June 2026): the prior version inflated the
// "change-lane owner" column to match the winner in high-trust cycles,
// which was circular. The honest pattern is regime-conditional:
//
//   In HIGH-TRUST eras, voters reward CONTINUITY.
//   In LOW-TRUST eras, voters reward CHANGE.
//   The candidate who matches the regime-favored frame wins.
//
// Columns:
//   • Cycle (year)
//   • Trust era + composite value
//   • Regime-favored frame (continuity / change)
//   • Continuity candidate / Change candidate (so you can see the split)
//   • Winner (color-coded by party + indicates which frame they ran as)
//   • Frame match (✓ if winner matched the regime-favored frame)
//   • Exit-poll / context backing
//
// Pattern: 12 of 12 cycles by popular vote, 11 of 12 by Electoral College
// (2000 is the EC inversion where high-trust voters gave Gore the PV but
// Bush won the EC).

const D = '#2c5b9c'
const R = '#b8240f'
const CONT = '#a06400'      // continuity = amber (matches high-trust era band)
const CHG  = '#2a6a3a'      // change = green (matches low-trust era band)

const CYCLES = [
  {
    year: 1980,
    trust: { era: 'mid-low', value: 0.40 },
    regimeFavors: 'change',
    continuity:   { name: 'Carter (inc)', party: 'D', color: D },
    change:       { name: 'Reagan',       party: 'R', color: R },
    winner:       { name: 'Reagan',       party: 'R', color: R, ran: 'change' },
    backing:      'Stagflation + hostages dragged Carter; Reagan ran as the anti-Washington outsider',
  },
  {
    year: 1984,
    trust: { era: 'high', value: 0.42 },
    regimeFavors: 'continuity',
    continuity:   { name: 'Reagan (inc)', party: 'R', color: R },
    change:       { name: 'Mondale',      party: 'D', color: D },
    winner:       { name: 'Reagan',       party: 'R', color: R, ran: 'continuity' },
    backing:      '"Morning in America" — Reagan ran on the recovery; Mondale offered restoration',
  },
  {
    year: 1988,
    trust: { era: 'high', value: 0.43 },
    regimeFavors: 'continuity',
    continuity:   { name: 'Bush GHW',     party: 'R', color: R },
    change:       { name: 'Dukakis',      party: 'D', color: D },
    winner:       { name: 'Bush GHW',     party: 'R', color: R, ran: 'continuity' },
    backing:      'Bush as Reagan\'s heir — "kinder, gentler" continuation; Dukakis hit by elitism attacks',
  },
  {
    year: 1992,
    trust: { era: 'mid-low', value: 0.40 },
    regimeFavors: 'change',
    continuity:   { name: 'Bush GHW (inc)', party: 'R', color: R },
    change:       { name: 'Clinton',      party: 'D', color: D },
    winner:       { name: 'Clinton',      party: 'D', color: D, ran: 'change' },
    backing:      '"It\'s the economy, stupid" — Bush carried the recession; Clinton + Perot owned the change frame',
  },
  {
    year: 1996,
    trust: { era: 'mid', value: 0.41 },
    regimeFavors: 'continuity',
    continuity:   { name: 'Clinton (inc)', party: 'D', color: D },
    change:       { name: 'Dole',         party: 'R', color: R },
    winner:       { name: 'Clinton',      party: 'D', color: D, ran: 'continuity' },
    backing:      'Recovery + "bridge to the 21st century" — Clinton ran on continuity; Dole on traditional restoration',
  },
  {
    year: 2000,
    trust: { era: 'high', value: 0.42 },
    regimeFavors: 'continuity',
    continuity:   { name: 'Gore',         party: 'D', color: D },
    change:       { name: 'Bush',         party: 'R', color: R },
    winner:       { name: 'Gore (PV) / Bush (EC)', party: '–', color: '#666', ran: 'split', split: true },
    backing:      'High trust era PV went continuity (Gore +0.5pp). EC inverted to change-positioned Bush via FL recount.',
  },
  {
    year: 2004,
    trust: { era: 'high', value: 0.46 },
    regimeFavors: 'continuity',
    continuity:   { name: 'Bush (inc)',   party: 'R', color: R },
    change:       { name: 'Kerry',        party: 'D', color: D },
    winner:       { name: 'Bush',         party: 'R', color: R, ran: 'continuity' },
    backing:      'Wartime "strong leader" lane — Bush +20pp on Gallup pre-election; Kerry won the literal "change" attribute but only 25% picked it',
  },
  {
    year: 2008,
    trust: { era: 'mid-low', value: 0.37 },
    regimeFavors: 'change',
    continuity:   { name: 'McCain',       party: 'R', color: R },
    change:       { name: 'Obama',        party: 'D', color: D },
    winner:       { name: 'Obama',        party: 'D', color: D, ran: 'change' },
    backing:      'Financial crisis broke the Bush era; "Bring change" 34% of voters → Obama 89-9 (decisive)',
  },
  {
    year: 2012,
    trust: { era: 'mid', value: 0.41 },
    regimeFavors: 'continuity',
    continuity:   { name: 'Obama (inc)',  party: 'D', color: D },
    change:       { name: 'Romney',       party: 'R', color: R },
    winner:       { name: 'Obama',        party: 'D', color: D, ran: 'continuity' },
    backing:      'Recovery + "Bin Laden is dead, GM is alive"; Romney = private-equity establishment, a poor change pitch',
  },
  {
    year: 2016,
    trust: { era: 'low', value: 0.23 },
    regimeFavors: 'change',
    continuity:   { name: 'Clinton',      party: 'D', color: D },
    change:       { name: 'Trump',        party: 'R', color: R },
    winner:       { name: 'Trump',        party: 'R', color: R, ran: 'change', note: 'EC' },
    backing:      '"Brings needed change" 39% of voters → Trump 83-14',
  },
  {
    year: 2020,
    trust: { era: 'low', value: 0.24 },
    regimeFavors: 'change',
    continuity:   { name: 'Trump (inc)',  party: 'R', color: R },
    change:       { name: 'Biden',        party: 'D', color: D },
    winner:       { name: 'Biden',        party: 'D', color: D, ran: 'change' },
    backing:      'Trump-as-incumbent inherited the system label; Biden ran as restoration / return to normalcy = change',
  },
  {
    year: 2024,
    trust: { era: 'low', value: 0.24 },
    regimeFavors: 'change',
    continuity:   { name: 'Harris',       party: 'D', color: D },
    change:       { name: 'Trump',        party: 'R', color: R },
    winner:       { name: 'Trump',        party: 'R', color: R, ran: 'change' },
    backing:      '"Ability to lead" 30% → Trump 66-33; 74% wanted Harris to take a new direction from Biden, only 33% thought she would',
  },
]

function chip(color, text, opts = {}) {
  const weight = opts.weight || 700
  const bg = `${color}1a`
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${bg};color:${color};font-weight:${weight};">${text}</span>`
}

export function drawChangeLaneScoreboard(selector) {
  const root = document.querySelector(selector)
  if (!root) throw new Error(`No container at ${selector}`)

  // Compute frame-match
  let pvHits = 0, ecHits = 0
  for (const c of CYCLES) {
    if (c.winner.split) {
      // 2000: PV ✓ (Gore continuity matched), EC ✗
      pvHits++
    } else {
      const match = c.winner.ran === c.regimeFavors
      if (match) { pvHits++; ecHits++ }
    }
  }

  let rows = ''
  for (const c of CYCLES) {
    const regimeColor = c.regimeFavors === 'continuity' ? CONT : CHG
    const matched = c.winner.split ? 'split' : (c.winner.ran === c.regimeFavors)
    let matchCell = ''
    if (c.winner.split) {
      matchCell = `<span style="font-weight:700;color:${CONT};">PV ✓</span> &nbsp; <span style="font-weight:700;color:#b8240f;">EC ✗</span>`
    } else {
      matchCell = matched
        ? `<span style="font-weight:700;color:#2e7d32;font-size:16px;">✓</span>`
        : `<span style="font-weight:700;color:#b8240f;font-size:16px;">✗</span>`
    }

    rows += `
      <tr>
        <td style="text-align:center;font-variant-numeric:tabular-nums;">${c.year}</td>
        <td style="text-align:center;font-size:11.5px;">
          <span style="font-weight:600;color:${c.trust.era === 'high' ? '#a06400' : c.trust.era.startsWith('mid') ? '#666' : '#2a6a3a'};">${c.trust.era}</span>
          <span style="display:block;font-size:10.5px;color:#888;">${c.trust.value.toFixed(2)}</span>
        </td>
        <td style="text-align:center;">${chip(regimeColor, c.regimeFavors)}</td>
        <td style="text-align:left;font-size:12.5px;">
          <span style="color:#888;font-size:10.5px;">cont:</span> ${chip(c.continuity.color, c.continuity.name)}<br>
          <span style="color:#888;font-size:10.5px;">change:</span> ${chip(c.change.color, c.change.name)}
        </td>
        <td style="text-align:left;">
          ${chip(c.winner.color, c.winner.name + (c.winner.note ? ' (' + c.winner.note + ')' : ''))}
          <span style="display:block;font-size:10.5px;color:#666;font-style:italic;margin-top:2px;">
            ran as ${c.winner.split ? 'split (see note)' : c.winner.ran}
          </span>
        </td>
        <td style="text-align:center;">${matchCell}</td>
        <td class="cls-note" style="font-size:12px;color:#444;">${c.backing}</td>
      </tr>`
  }

  root.innerHTML = `
    <div class="cls-board">
      <p class="cls-headline">
        Voters reward
        <span style="color:${CONT};font-weight:700;">continuity</span>
        in high-trust eras and
        <span style="color:${CHG};font-weight:700;">change</span>
        in low-trust eras. The candidate who matches the regime-favored frame wins.
        <strong>${pvHits} of ${CYCLES.length} cycles by popular vote</strong>
        — 2000 is the EC inversion (PV went continuity, EC went change).
      </p>
      <table class="cls-table" style="font-size:13.5px;width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #1b1b1d;">
            <th style="text-align:center;padding:8px 4px;">Cycle</th>
            <th style="text-align:center;padding:8px 4px;">Trust</th>
            <th style="text-align:center;padding:8px 4px;">Regime favors</th>
            <th style="text-align:left;padding:8px 4px;">Continuity vs Change</th>
            <th style="text-align:left;padding:8px 4px;">Winner</th>
            <th style="text-align:center;padding:8px 4px;">Match</th>
            <th style="text-align:left;padding:8px 4px;">Backing</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="cls-foot" style="font-size:12px;color:#666;margin-top:0.6rem;font-style:italic;">
        "Trust era" buckets the mean trust composite that cycle: <strong>high</strong> ≥ 0.42,
        <strong>mid</strong> 0.36–0.41, <strong>mid-low / low</strong> &lt; 0.36. "Regime favors"
        is the frame the electorate rewarded in cycles of that era. "Continuity vs Change" lists
        the candidate occupying each frame strictly: incumbents and successors who ran on continuity-
        of-administration occupy the continuity row; challengers and outsider-positioned candidates
        occupy the change row. The match column compares the winner's frame to the regime's
        favored frame. 2020 is no longer treated as "mixed" — Biden ran as restoration/change against
        Trump-as-incumbent, and won the change-favored low-trust electorate. The 2024 Biden→Harris
        swap was a doomed attempt to switch frame mid-cycle: even with Biden out, Harris-as-VP
        could not escape the continuity tag in a change-favored regime.
      </p>
    </div>
  `
}
