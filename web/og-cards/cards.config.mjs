// Single source of truth for share-card metadata.
// Imported by both the render pipeline (node) and the browser share UI.
// The card's VISUAL markup lives in og-cards/<slug>.html; this file holds the
// text used for share blurbs, link descriptions, and labels.
//
// - slug:  stable id; also the share path (/s/<slug>/) and HTML/PNG basename
// - label: short human name shown in the picker
// - desc:  plain-text quote used for og:description on the unfurl stub
// - blurb: pre-filled compose text for X / Bluesky (ends with ":" before the URL)

export const BASE = 'https://thecenterisalie.org'

export const CARDS = [
  {
    slug: 'brand',
    label: 'The Center Is a Lie',
    desc: "Why the candidate the party calls 'electable' is the one who loses. A data essay: the center isn't a bloc, positions barely move voters, and the establishment loses.",
    blurb: 'The "move to the center to win" playbook is a lie. A data essay on who actually decides elections, and why the safe candidate is the one who loses:',
  },
  {
    slug: 'zero',
    label: 'A measured zero',
    desc: 'All the ads and door-knocks combined move vote choice by roughly zero.',
    blurb: 'All the ads and door-knocks combined move vote choice by roughly zero. Why late-campaign persuasion is a measured zero:',
  },
  {
    slug: 'trust',
    label: 'One in five',
    desc: 'In 1964, three in four Americans trusted their government; today, one in five do.',
    blurb: 'In 1964, three in four Americans trusted their government. Today, one in five do. Almost everything about how we vote falls out of that collapse:',
  },
  {
    slug: 'window',
    label: 'The window is closed',
    desc: 'By the time candidates are nominated, the window to swing voters is closed.',
    blurb: 'By the time candidates are nominated, the window to swing voters is already closed. Why "electability" is decided before the general even starts:',
  },
  {
    slug: 'risky',
    label: 'The safe one is risky',
    desc: 'The safe, establishment candidate has become the risky one.',
    blurb: 'The safe, establishment candidate has become the risky one. Why "electable" is the riskiest bet a party can make:',
  },
  {
    slug: 'incumbency',
    label: 'Built to protect incumbency',
    desc: 'The party is built to protect its own incumbency.',
    blurb: 'The party is built to protect its own incumbency, which is exactly why it keeps nominating losers. A data essay on who actually wins:',
  },

  // Chart rebuttal cards (1600x900, source is chart-<slug>.html). Same share
  // plumbing as the quote cards above; render.mjs branches on `chart: true`.
  {
    slug: '1in100',
    chart: true,
    label: 'One real centrist in 100',
    desc: "Judged by the positions they actually hold, 46 voters in 100 look centrist but only 1 truly is. The 'moderate middle' is an averaging illusion.",
    blurb: "The 'moderate middle' campaigns chase is an averaging illusion: 46 voters in 100 look centrist, but only 1 holds centrist positions across the board. The data:",
  },
  {
    slug: 'bothends',
    chart: true,
    label: "Independents aren't centrists",
    desc: "9 in 10 independents hold at least one hard-left or hard-right position; nearly half hold both. They average to a center they don't occupy.",
    blurb: "Independents aren't moderates in the middle. 9 in 10 hold at least one extreme position, and nearly half hold both a hard-left and a hard-right one. They only average to the center:",
  },
  {
    slug: 'insideoutside',
    chart: true,
    label: 'The middle is 6%',
    desc: 'Grouped by the positions they actually hold, only 6% of voters are true centrists while 75% distrust government. The winnable middle barely exists.',
    blurb: "The 'winnable middle' is 6% of voters. Distrust is 75%. Group voters by what they actually believe and the center nearly vanishes while low trust swamps everything:",
  },
  {
    slug: 'fundamentals',
    chart: true,
    label: "It's not the economy",
    desc: "The worst economy in twenty years re-elected an incumbent; some of the best ones didn't. A strong economy doesn't reliably save the party in power.",
    blurb: "'It's the economy, stupid' doesn't hold up. The worst economy in twenty years re-elected an incumbent, and some of the best ones lost. What actually predicts elections:",
  },
  {
    slug: 'deficit',
    chart: true,
    label: 'The fiscal-responsibility myth',
    desc: "By the actual record, the federal deficit explodes under Republican presidents and falls under Democratic ones. 'Fiscally conservative' doesn't track the party label.",
    blurb: "The 'Republicans are fiscally responsible' brand doesn't survive the record: the deficit explodes under Republican presidents and falls under Democratic ones. The scoreboard:",
  },
]

// Card whose image is the site default (bare-link unfurl). No /s/ stub.
export const DEFAULT_SLUG = 'brand'

export function shareUrlFor(slug) {
  return slug === DEFAULT_SLUG ? `${BASE}/` : `${BASE}/s/${slug}/`
}
