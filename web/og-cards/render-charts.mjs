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

const warnings = []
page.on('pageerror', (e) => warnings.push(`  script error: ${e.message}`))

for (const card of cards) {
  warnings.length = 0
  await page.goto('file://' + resolve(here, card.file))
  await page.waitForLoadState('networkidle')

  // Guard: chart content that overflows its own viewBox renders clipped, and
  // slack inside the viewBox shows up as dead space above the footer. Both have
  // shipped silently before, so fail loudly instead.
  const geom = await page.evaluate(() => {
    const box = document.querySelector('.cc-chart')
    const svg = box && box.querySelector('svg')
    if (!svg) return null
    const vb = svg.viewBox.baseVal
    const bb = svg.getBBox()
    const r = box.getBoundingClientRect()
    return {
      overflowX: Math.round(bb.x + bb.width - (vb.x + vb.width)),
      overflowY: Math.round(bb.y + bb.height - (vb.y + vb.height)),
      slackY: Math.round(vb.y + vb.height - (bb.y + bb.height)),
      letterboxY: Math.round(r.height - (r.width * vb.height) / vb.width),
    }
  })
  if (geom) {
    if (geom.overflowY > 2) warnings.push(`  CLIPPED: content runs ${geom.overflowY}u past the bottom of the viewBox`)
    if (geom.overflowX > 2) warnings.push(`  CLIPPED: content runs ${geom.overflowX}u past the right of the viewBox`)
    const dead = Math.max(0, geom.letterboxY) + Math.max(0, geom.slackY)
    if (dead > 90) warnings.push(`  DEAD SPACE: ~${dead}px unused below the chart (letterbox ${geom.letterboxY}, viewBox slack ${geom.slackY})`)
  }

  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1600, height: 900 } })
  const out = resolve(outDir, `${card.slug}.png`)
  writeFileSync(out, buf)
  console.log('rendered og/charts/' + card.slug + '.png')
  for (const w of warnings) console.log(w)
}

await browser.close()
