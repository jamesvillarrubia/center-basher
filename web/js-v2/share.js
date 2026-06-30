// Pure, DOM-free share logic. initShareWidget() (below) is the only part that
// touches the DOM, so importing this module under node is safe.
const BASE = 'https://thecenterisalie.org'

export const CARDS = [
  {
    slug: 'brand',
    label: 'The Center Is a Lie',
    img: '/og/brand.png',
    blurb: 'The "move to the center to win" playbook is a lie. A data essay on who actually decides elections, and why the safe candidate is the one who loses:',
  },
  {
    slug: 'zero',
    label: 'A measured zero',
    img: '/og/zero.png',
    blurb: 'All the ads and door-knocks combined move vote choice by roughly zero. Why late-campaign persuasion is a measured zero:',
  },
  {
    slug: 'trust',
    label: 'One in five',
    img: '/og/trust.png',
    blurb: 'In 1964, three in four Americans trusted their government. Today, one in five do. Almost everything about how we vote falls out of that collapse:',
  },
  {
    slug: 'window',
    label: 'The window is closed',
    img: '/og/window.png',
    blurb: 'By the time candidates are nominated, the window to swing voters is already closed. Why "electability" is decided before the general even starts:',
  },
]

export function shareUrlFor(slug) {
  return slug === 'brand' ? `${BASE}/` : `${BASE}/s/${slug}/`
}

export function buildShareTargets(slug) {
  const card = CARDS.find((c) => c.slug === slug)
  if (!card) throw new Error(`unknown card: ${slug}`)
  const url = shareUrlFor(slug)
  const text = card.blurb
  return {
    url,
    image: card.img,
    x: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    instagramCaption: `${text} ${BASE}/`,
  }
}
