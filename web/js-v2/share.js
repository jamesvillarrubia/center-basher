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

export function initShareWidget(rootSelector = '#share-root') {
  const root = document.querySelector(rootSelector)
  if (!root) return
  let selected = 'brand'

  const thumbs = CARDS.map(
    (c) =>
      `<button class="share-thumb" data-slug="${c.slug}" aria-pressed="${c.slug === selected}" title="${c.label}">
         <img src="${c.img}" alt="${c.label}" loading="lazy"><span>${c.label}</span>
       </button>`
  ).join('')

  root.innerHTML = `
    <button class="share-open" type="button">Share this</button>
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

  root.querySelector('.share-open').addEventListener('click', () => {
    panel.hidden = !panel.hidden
  })

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
    const t = buildShareTargets(selected)
    root.querySelector('[data-dest="x"]').href = t.x
    root.querySelector('[data-dest="bluesky"]').href = t.bluesky
    root.querySelector('[data-dest="linkedin"]').href = t.linkedin
  }

  function flash(msg) {
    note.textContent = msg
    note.hidden = false
  }

  root.querySelector('[data-dest="instagram"]').addEventListener('click', () => {
    const t = buildShareTargets(selected)
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
    const t = buildShareTargets(selected)
    navigator.clipboard?.writeText(t.url)
    flash('Link copied.')
  })

  syncLinks()
}
