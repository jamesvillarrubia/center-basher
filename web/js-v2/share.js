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

// End-of-essay inline widget. Kept working (manifest-aware) alongside /share.
export async function initShareWidget(rootSelector = '#share-root') {
  const root = document.querySelector(rootSelector)
  if (!root) return
  const manifest = await loadManifest()
  let selected = DEFAULT_SLUG

  const thumbs = CARDS.map(
    (c) =>
      `<button class="share-thumb" data-slug="${c.slug}" aria-pressed="${c.slug === selected}" title="${c.label}">
         <img src="${imageUrlFor(c.slug, manifest)}" alt="${c.label}" loading="lazy"><span>${c.label}</span>
       </button>`
  ).join('')

  root.innerHTML = `
    <a class="share-open" href="/share/">Open the share page &rarr;</a>
    <div class="share-panel" hidden>
      <p class="share-step">1 &middot; Pick a card</p>
      <div class="share-thumbs">${thumbs}</div>
      <p class="share-step">2 &middot; Pick where</p>
      <div class="share-dests">
        <a class="share-dest" data-dest="x" target="_blank" rel="noopener">X</a>
        <a class="share-dest" data-dest="bluesky" target="_blank" rel="noopener">Bluesky</a>
        <a class="share-dest" data-dest="linkedin" target="_blank" rel="noopener">LinkedIn</a>
        <button class="share-dest" data-dest="instagram" type="button">Instagram</button>
        <button class="share-dest" data-dest="copy" type="button">Copy link</button>
      </div>
      <p class="share-note" hidden></p>
    </div>`

  const panel = root.querySelector('.share-panel')
  const note = root.querySelector('.share-note')

  root.querySelectorAll('.share-thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      selected = btn.dataset.slug
      root.querySelectorAll('.share-thumb').forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.slug === selected))
      )
      syncLinks()
    })
  })

  function syncLinks() {
    const t = buildShareTargets(selected, manifest)
    root.querySelector('[data-dest="x"]').href = t.x
    root.querySelector('[data-dest="bluesky"]').href = t.bluesky
    root.querySelector('[data-dest="linkedin"]').href = t.linkedin
  }

  function flash(msg) {
    note.textContent = msg
    note.hidden = false
  }

  root.querySelector('[data-dest="instagram"]').addEventListener('click', () => {
    const t = buildShareTargets(selected, manifest)
    const a = document.createElement('a')
    a.href = t.image
    a.download = `${selected}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    navigator.clipboard?.writeText(t.instagramCaption)
    flash('Image downloaded and caption copied. Post it to Instagram and add the link.')
  })

  root.querySelector('[data-dest="copy"]').addEventListener('click', () => {
    const t = buildShareTargets(selected, manifest)
    navigator.clipboard?.writeText(t.url)
    flash('Link copied.')
  })

  syncLinks()
}
