// Render chart rebuttal cards to 1600x900 PNGs for Twitter native-image posting.
//
//   pnpm render:charts
//
// Separate from render.mjs (the 1200x630 link-unfurl OG cards): these are meant
// to be UPLOADED as native images into a tweet/reply, not served as og:image.
// So: 16:9, no /s/ stub, no content hash — stable filenames the author can grab
// and re-upload. Source of each card is og-cards/chart-<slug>.html.
//
// Output: web/public/og/charts/<slug>.png   (also copied into dist/ by Vite)

import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename } from 'node:path'
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../public/og/charts')
mkdirSync(outDir, { recursive: true })

const cards = readdirSync(here)
  .filter((f) => f.startsWith('chart-') && f.endsWith('.html'))
  .map((f) => ({ file: f, slug: basename(f, '.html').replace(/^chart-/, '') }))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 })

for (const card of cards) {
  await page.goto('file://' + resolve(here, card.file))
  await page.waitForLoadState('networkidle')
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1600, height: 900 } })
  const out = resolve(outDir, `${card.slug}.png`)
  writeFileSync(out, buf)
  console.log('rendered og/charts/' + card.slug + '.png')
}

await browser.close()
