// Share logic shared by the end-of-essay widget and the standalone /share page.
// Card text/metadata comes from og-cards/cards.config.mjs (single source of
// truth). Image filenames are content-hashed and resolved at runtime from
// /og/manifest.json, so a changed card gets a new URL and never serves stale.

import { CARDS, BASE, DEFAULT_SLUG, shareUrlFor } from '../og-cards/cards.config.mjs'

export { CARDS, BASE, DEFAULT_SLUG, shareUrlFor }

export function imageUrlFor(slug, manifest) {
  const file = manifest && manifest[slug] && manifest[slug].file
  return file ? `/og/${file}` : `/og/${slug}.png`
}

export function buildShareTargets(slug, manifest) {
  const card = CARDS.find((c) => c.slug === slug)
  if (!card) throw new Error(`unknown card: ${slug}`)
  const url = shareUrlFor(slug)
  const text = card.blurb
  return {
    url,
    image: imageUrlFor(slug, manifest),
    x: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    instagramCaption: `${text} ${BASE}/`,
  }
}

export async function loadManifest() {
  try {
    const res = await fetch('/og/manifest.json', { cache: 'no-cache' })
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

// End-of-essay entry point: a single button linking to the standalone /share page.
export function initShareWidget(rootSelector = '#share-root') {
  const root = document.querySelector(rootSelector)
  if (!root) return
  root.innerHTML = '<a class="share-open" href="/share/">Share this essay &rarr;</a>'
}
