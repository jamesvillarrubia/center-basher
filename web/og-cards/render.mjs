// Render each card HTML to a content-hashed PNG, emit a manifest, and
// regenerate the per-card unfurl stubs so every image URL is cache-busted.
//
//   pnpm render:og
//
// Output (all under web/public, copied verbatim into dist/ by Vite):
//   og/<slug>.<hash>.png   content-hashed card image (immutable-cacheable)
//   og/manifest.json       { slug: { file, label, desc, blurb } }
//   s/<slug>/index.html    unfurl stub pointing at the hashed image
//
// Source of truth for text is og-cards/cards.config.mjs; visual markup is
// og-cards/<slug>.html. The main page's brand og:image is injected at build
// time by the Vite plugin in vite.config.js, so index.html is never rewritten.

import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { CARDS, BASE, DEFAULT_SLUG } from './cards.config.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const ogDir = resolve(here, '../public/og')
const stubRoot = resolve(here, '../public/s')

mkdirSync(ogDir, { recursive: true })
// Clear stale hashed PNGs so old versions never linger in dist/ or the CDN.
for (const f of readdirSync(ogDir)) {
  if (f.endsWith('.png')) rmSync(resolve(ogDir, f))
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })

const manifest = {}
for (const card of CARDS) {
  // Chart rebuttal cards are 1600x900 and live in chart-<slug>.html; the quote
  // cards are 1200x630 and live in <slug>.html.
  const w = card.chart ? 1600 : 1200
  const h = card.chart ? 900 : 630
  const src = card.chart ? `chart-${card.slug}.html` : `${card.slug}.html`
  await page.setViewportSize({ width: w, height: h })
  await page.goto('file://' + resolve(here, src))
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h } })
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8)
  const file = `${card.slug}.${hash}.png`
  writeFileSync(resolve(ogDir, file), buf)
  manifest[card.slug] = { file, label: card.label, desc: card.desc, blurb: card.blurb, w, h }
  console.log('rendered', file)
}

await browser.close()

writeFileSync(resolve(ogDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log('wrote og/manifest.json')

// Regenerate per-card unfurl stubs (every card except the default/brand).
function stub({ slug }) {
  const img = `${BASE}/og/${manifest[slug].file}`
  const desc = manifest[slug].desc
  const iw = manifest[slug].w || 1200
  const ih = manifest[slug].h || 630
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8" />
  <title>The Center Is a Lie</title>
  <link rel="canonical" href="${BASE}/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="The Center Is a Lie" />
  <meta property="og:title" content="The Center Is a Lie" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${BASE}/" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:width" content="${iw}" />
  <meta property="og:image:height" content="${ih}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${img}" />
  <meta name="twitter:creator" content="@james_mtc" />
  <meta http-equiv="refresh" content="0; url=${BASE}/" />
  <script>location.replace('${BASE}/')</script>
</head><body>
  <p><a href="${BASE}/">Read the essay &rarr;</a></p>
</body></html>
`
}

for (const card of CARDS) {
  if (card.slug === DEFAULT_SLUG) continue
  const dir = resolve(stubRoot, card.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), stub(card))
  console.log('stub  s/' + card.slug + '/')
}
