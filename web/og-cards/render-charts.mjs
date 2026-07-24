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

  // Guard: two <text> nodes whose rendered boxes overlap is nearly always a
  // layout bug (a value label sitting on an axis tick, two labels colliding).
  // Measured in screen px via getBoundingClientRect so rotation is handled.
  // I kept fixing these one at a time by eye and missing others; this catches
  // them all at once.
  const overlaps = await page.evaluate(() => {
    const svg = document.querySelector('.cc-chart svg')
    if (!svg) return []
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
    const nodes = [...svg.querySelectorAll('text')]
      .map((t) => ({ s: norm(t.textContent), r: t.getBoundingClientRect() }))
      .filter((n) => n.s && n.r.width > 0 && n.r.height > 0)
    const hits = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].r, b = nodes[j].r
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (ox <= 1.5 || oy <= 1.5) continue
        // ignore trivial grazes: require the overlap to cover a real fraction
        // of the smaller label, so kerning-level touches don't spam.
        const frac = (ox * oy) / Math.min(a.width * a.height, b.width * b.height)
        if (frac > 0.14) hits.push(`"${nodes[i].s.slice(0, 22)}" x "${nodes[j].s.slice(0, 22)}"`)
      }
    }
    return hits
  })
  for (const h of overlaps) warnings.push(`  TEXT OVERLAP: ${h}`)

  // Guard: a <text> whose box is wider or taller than the panel it sits inside
  // is overflowing its container (e.g. an oversized label spilling out of a
  // card). Only checks against the SMALLEST rect that contains the label's
  // centre, so value labels that sit at a bar's end (centre outside the bar)
  // and labels drawn on open background (no containing rect) are not flagged.
  const overflows = await page.evaluate(() => {
    const svg = document.querySelector('.cc-chart svg')
    if (!svg) return []
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
    const rects = [...svg.querySelectorAll('rect')].map((r) => r.getBoundingClientRect())
      .filter((r) => r.width > 12 && r.height > 12)
    const out = []
    for (const t of svg.querySelectorAll('text')) {
      const s = norm(t.textContent)
      const b = t.getBoundingClientRect()
      if (!s || b.width < 1) continue
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2
      const hosts = rects.filter((r) => cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom)
      if (!hosts.length) continue
      const host = hosts.reduce((a, c) => (a.width * a.height <= c.width * c.height ? a : c))
      if (b.width > host.width - 6 || b.height > host.height - 6) out.push(`"${s.slice(0, 22)}"`)
    }
    return out
  })
  for (const o of overflows) warnings.push(`  TEXT OVERFLOWS BOX: ${o}`)

  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1600, height: 900 } })
  const out = resolve(outDir, `${card.slug}.png`)
  writeFileSync(out, buf)
  console.log('rendered og/charts/' + card.slug + '.png')
  for (const w of warnings) console.log(w)
}

await browser.close()

// Contact sheet, regenerated every run so it can never drift from the card set.
const rows = cards.map((c) =>
  `  <figure><img src="../public/og/charts/${c.slug}.png" alt="${c.slug}" loading="lazy">` +
  `<figcaption>${c.slug}</figcaption></figure>`).join('\n')
writeFileSync(resolve(here, 'gallery.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Chart cards \u2014 contact sheet</title>
<style>
  body { margin:0; padding:36px 40px 80px; background:#e9e9e4; color:#1b1b1d;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
  h1 { font-size:26px; margin:0 0 4px; }
  .sub { color:#6b6b70; font-size:14px; margin:0 0 28px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(620px,1fr)); gap:32px; }
  figure { margin:0; background:#fff; border:1px solid #cfcdc7; border-radius:10px; padding:12px; }
  figure img { width:100%; height:auto; display:block; border:1px solid #eee; border-radius:4px; }
  figcaption { font-size:13px; color:#6b6b70; margin-top:9px;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.02em; }
</style></head>
<body>
  <h1>Chart rebuttal cards</h1>
  <p class="sub">${cards.length} cards at 1600\u00d7900. Regenerated by <code>pnpm render:charts</code>.</p>
  <div class="grid">
${rows}
  </div>
</body></html>
`)
console.log(`\nwrote og-cards/gallery.html (${cards.length} cards)`)
