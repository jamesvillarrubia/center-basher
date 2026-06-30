// Standalone /share page. Renders two candidate layouts so the design can be
// chosen; both are fully wired. Card images resolve from the hashed manifest.
import { CARDS, buildShareTargets, imageUrlFor, loadManifest, DEFAULT_SLUG } from './share.js'

function flash(el, msg) {
  if (!el) return
  el.textContent = msg
}

// A row of platform controls wired to whatever getSlug() currently returns.
// Returns the element with a .sync() method to refresh the link hrefs.
function destControls(getSlug, noteEl, manifest) {
  const row = document.createElement('div')
  row.className = 'dest-row'

  const mk = (tag, text) => {
    const el = document.createElement(tag)
    el.className = 'dest'
    el.textContent = text
    return el
  }
  const x = mk('a', 'X'); x.target = '_blank'; x.rel = 'noopener'
  const bs = mk('a', 'Bluesky'); bs.target = '_blank'; bs.rel = 'noopener'
  const li = mk('a', 'LinkedIn'); li.target = '_blank'; li.rel = 'noopener'
  const ig = mk('button', 'Instagram'); ig.type = 'button'
  const cp = mk('button', 'Copy link'); cp.type = 'button'
  row.append(x, bs, li, ig, cp)

  function sync() {
    const t = buildShareTargets(getSlug(), manifest)
    x.href = t.x
    bs.href = t.bluesky
    li.href = t.linkedin
  }

  ig.addEventListener('click', () => {
    const t = buildShareTargets(getSlug(), manifest)
    const a = document.createElement('a')
    a.href = t.image
    a.download = `${getSlug()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    navigator.clipboard?.writeText(t.instagramCaption)
    flash(noteEl, 'Image downloaded + caption copied. Post to Instagram and add the link.')
  })

  cp.addEventListener('click', () => {
    const t = buildShareTargets(getSlug(), manifest)
    navigator.clipboard?.writeText(t.url)
    flash(noteEl, 'Link copied.')
  })

  row.sync = sync
  sync()
  return row
}

// Layout A — one big preview, a thumbnail picker, one set of controls.
function layoutA(manifest) {
  let selected = DEFAULT_SLUG
  const img = document.getElementById('lA-img')
  const thumbsEl = document.getElementById('lA-thumbs')
  const destsEl = document.getElementById('lA-dests')
  const note = document.getElementById('lA-note')

  const controls = destControls(() => selected, note, manifest)
  destsEl.appendChild(controls)

  function select(slug) {
    selected = slug
    img.src = imageUrlFor(slug, manifest)
    thumbsEl.querySelectorAll('.thumb').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.slug === slug))
    )
    controls.sync()
  }

  CARDS.forEach((c) => {
    const btn = document.createElement('button')
    btn.className = 'thumb'
    btn.dataset.slug = c.slug
    btn.title = c.label
    const im = document.createElement('img')
    im.src = imageUrlFor(c.slug, manifest)
    im.alt = c.label
    btn.appendChild(im)
    btn.addEventListener('click', () => select(c.slug))
    thumbsEl.appendChild(btn)
  })

  select(DEFAULT_SLUG)
}

// Layout B — every card shown, each with its own share row.
function layoutB(manifest) {
  const gallery = document.getElementById('gallery')
  CARDS.forEach((c) => {
    const card = document.createElement('div')
    card.className = 'gcard'
    const im = document.createElement('img')
    im.src = imageUrlFor(c.slug, manifest)
    im.alt = c.label
    const note = document.createElement('p')
    note.className = 'note'
    const controls = destControls(() => c.slug, note, manifest)
    card.append(im, controls, note)
    gallery.appendChild(card)
  })
}

async function main() {
  const manifest = await loadManifest()
  layoutA(manifest)
  layoutB(manifest)
}

main()
