// Fig 19a — "Stressed Sideliners" / swing voters aren't centrists
// (port of v1 chartDisaffected, Pew 2021 Political Typology).
//
// Three facts about the Pew 2021 "Stressed Sideliners" group — the only
// group in the Pew typology with no partisan lean and lowest engagement:
//   1. Party lean: 45% R / 10% neither / 45% D — torn, not coherent center
//   2. 74% favor $15 minimum wage — economically LEFT, not moderate
//   3. 83% say "economy unfairly favors the powerful" — distrust/anti-establishment
//   4. Lowest turnout of any group (15% of public, only 10% of 2020 voters)
//
// The single visualization: a three-stat row showing what this group
// actually believes vs the "swing = centrist" framing.
import * as d3 from 'https://esm.sh/d3@7'

export function drawDisaffected(selector) {
  const container = document.querySelector(selector)
  if (!container) throw new Error(`No container at ${selector}`)
  container.innerHTML = ''

  const W = container.clientWidth || 680
  const H = 280
  const margin = { top: 70, right: 20, bottom: 50, left: 20 }
  const innerW = W - margin.left - margin.right

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  svg.append('text').attr('class', 'da-title')
    .attr('x', 0).attr('y', 22)
    .text('Swing voters aren\'t centrists — they\'re disaffected')
  svg.append('text').attr('class', 'da-subtitle')
    .attr('x', 0).attr('y', 42)
    .text('Pew 2021 Political Typology, "Stressed Sideliners" — the only group with no partisan lean, lowest engagement.')

  // Stat 1: party lean (torn bar)
  const beat1Y = 0
  g.append('text').attr('x', 0).attr('y', beat1Y).attr('font-size', '12px').attr('font-weight', '700').attr('fill', '#1b1b1d')
    .text('Party lean — 45% R / 10% neither / 45% D (evenly torn, not coherent center)')
  const barH = 22
  const segR = innerW * 0.45, segN = innerW * 0.10, segD = innerW * 0.45
  g.append('rect').attr('x', 0).attr('y', beat1Y + 8).attr('width', segR).attr('height', barH).attr('fill', '#b8240f').attr('opacity', 0.85)
  g.append('rect').attr('x', segR).attr('y', beat1Y + 8).attr('width', segN).attr('height', barH).attr('fill', '#bbb').attr('opacity', 0.85)
  g.append('rect').attr('x', segR + segN).attr('y', beat1Y + 8).attr('width', segD).attr('height', barH).attr('fill', '#2c5b9c').attr('opacity', 0.85)
  g.append('text').attr('x', segR / 2).attr('y', beat1Y + 24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '11.5px').attr('font-weight', '700').text('45% R')
  g.append('text').attr('x', segR + segN / 2).attr('y', beat1Y + 24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').text('10%')
  g.append('text').attr('x', segR + segN + segD / 2).attr('y', beat1Y + 24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '11.5px').attr('font-weight', '700').text('45% D')

  // Stat 2: $15 min wage (left position)
  const beat2Y = 56
  g.append('text').attr('x', 0).attr('y', beat2Y).attr('font-size', '12px').attr('font-weight', '700').attr('fill', '#1b1b1d')
    .text('74% favor $15 minimum wage — economically LEFT, not moderate')
  g.append('rect').attr('x', 0).attr('y', beat2Y + 8).attr('width', innerW * 0.74).attr('height', barH).attr('fill', '#2c5b9c').attr('opacity', 0.85)
  g.append('rect').attr('x', innerW * 0.74).attr('y', beat2Y + 8).attr('width', innerW * 0.26).attr('height', barH).attr('fill', '#eee')
  g.append('text').attr('x', innerW * 0.37).attr('y', beat2Y + 24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '12px').attr('font-weight', '700').text('74%')

  // Stat 3: economy unfair
  const beat3Y = 112
  g.append('text').attr('x', 0).attr('y', beat3Y).attr('font-size', '12px').attr('font-weight', '700').attr('fill', '#1b1b1d')
    .text('83% say "the economy unfairly favors the powerful" — distrust / anti-establishment')
  g.append('rect').attr('x', 0).attr('y', beat3Y + 8).attr('width', innerW * 0.83).attr('height', barH).attr('fill', '#a06400').attr('opacity', 0.85)
  g.append('rect').attr('x', innerW * 0.83).attr('y', beat3Y + 8).attr('width', innerW * 0.17).attr('height', barH).attr('fill', '#eee')
  g.append('text').attr('x', innerW * 0.41).attr('y', beat3Y + 24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '12px').attr('font-weight', '700').text('83%')

  svg.append('text').attr('x', 0).attr('y', H - 22).attr('font-size', '11.5px').attr('fill', '#444').attr('font-style', 'italic')
    .text('Same group has the lowest turnout in the Pew typology: 15% of the public but only 10% of 2020 voters.')
  svg.append('text').attr('x', 0).attr('y', H - 8).attr('font-size', '10.5px').attr('fill', '#666')
    .text('Source: Pew Research Center 2021 Political Typology. Converges with our ANES moveable bloc (trust ≈ 0.19).')
}
