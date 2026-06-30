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
]

// Card whose image is the site default (bare-link unfurl). No /s/ stub.
export const DEFAULT_SLUG = 'brand'

export function shareUrlFor(slug) {
  return slug === DEFAULT_SLUG ? `${BASE}/` : `${BASE}/s/${slug}/`
}
