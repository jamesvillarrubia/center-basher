// Standalone /share page — gallery of every card, each with its own share row.
// Card images resolve from the content-hashed manifest at runtime.
import { CARDS, buildShareTargets, imageUrlFor, loadManifest } from './share.js'

function flash(el, msg) {
  if (el) el.textContent = msg
}

// A row of platform controls for one card slug.
function destRow(slug, noteEl, manifest) {
  const row = document.createElement('div')
  row.className = 'dest-row'

  const mk = (tag, text) => {
    const el = document.createElement(tag)
    el.className = 'dest'
    el.textContent = text
    return el
  }
  const t = buildShareTargets(slug, manifest)
  const x = mk('a', 'X'); x.href = t.x; x.target = '_blank'; x.rel = 'noopener'
  const bs = mk('a', 'Bluesky'); bs.href = t.bluesky; bs.target = '_blank'; bs.rel = 'noopener'
  const li = mk('a', 'LinkedIn'); li.href = t.linkedin; li.target = '_blank'; li.rel = 'noopener'
  const dl = mk('button', 'Save image'); dl.type = 'button'
  const cp = mk('button', 'Copy link'); cp.type = 'button'
  row.append(x, bs, li, dl, cp)

  // Download the actual PNG (and copy a caption) so it can be attached to any
  // post — Instagram, or X/Bluesky/LinkedIn where you'd rather attach the photo
  // than rely on the link's preview card.
  dl.addEventListener('click', () => {
    const a = document.createElement('a')
    a.href = t.image
    a.download = `${slug}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    navigator.clipboard?.writeText(t.instagramCaption)
    flash(noteEl, 'Image saved + caption copied — attach it to any post (Instagram, X, etc.).')
  })

  cp.addEventListener('click', () => {
    navigator.clipboard?.writeText(t.url)
    flash(noteEl, 'Link copied.')
  })

  return row
}

async function main() {
  const manifest = await loadManifest()
  const gallery = document.getElementById('gallery')
  CARDS.forEach((c) => {
    const card = document.createElement('div')
    card.className = 'gcard'
    const im = document.createElement('img')
    im.src = imageUrlFor(c.slug, manifest)
    im.alt = c.label
    const note = document.createElement('p')
    note.className = 'note'
    card.append(im, destRow(c.slug, note, manifest), note)
    gallery.appendChild(card)
  })
}

main()
