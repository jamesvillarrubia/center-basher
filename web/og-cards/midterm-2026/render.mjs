// Build and render the 2026 midterm page.
//
//   node og-cards/midterm-2026/render.mjs        (from web/)
//
// Inputs:  og-cards/midterm-2026/template.html
//          ../data/derived/midterm2026/exhibits_data.json   (scripts/midterm2026/factors.py)
//          ../data/derived/midterm2026/exhibits_debias.json (scripts/midterm2026/debias.py)
// Outputs: midterm-2026/index.html                 site page, served at /midterm-2026/
//          public/og/midterm-2026/<card id>.png    one 2x PNG per exhibit card
//          og-cards/midterm-2026/artifact.html     the same page for a claude.ai artifact (png/ paths)
// Fails when a chart is wider than its card, two chart labels overlap, or a script errors.

import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const web = resolve(here, '../..')
const derived = resolve(web, '../data/derived/midterm2026')
const data = JSON.parse(readFileSync(resolve(derived, 'exhibits_data.json'), 'utf8'))
data.debias = JSON.parse(readFileSync(resolve(derived, 'exhibits_debias.json'), 'utf8'))
data.selection = JSON.parse(readFileSync(resolve(derived, 'exhibits_selection.json'), 'utf8'))
data.house = JSON.parse(readFileSync(resolve(derived, 'exhibits_house.json'), 'utf8'))
data.funding = JSON.parse(readFileSync(resolve(derived, 'exhibits_funding.json'), 'utf8'))
const tpl = readFileSync(resolve(here, 'template.html'), 'utf8')
for (const key of ['__DATA__', '__IMG_BASE__']) if (!tpl.includes(key)) throw new Error(`template.html lacks ${key}`)
const fill = (base) => tpl.replace('__DATA__', JSON.stringify(data)).replace('__IMG_BASE__', base)

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<meta name="description" content="Third Way says moderates made the 2026 Democratic majorities. We scored 44 nominees on their stated positions and tested their margins against seven baselines." />
<link rel="canonical" href="https://thecenterisalie.org/midterm-2026/" />
<meta property="og:title" content="Moderates didn't make the 2026 majorities. The wave did." />
<meta property="og:description" content="412 of 417 House Democrats ran ahead of Harris. All 44 coded nominees ran to the left of Third Way." />
<meta property="og:image" content="https://thecenterisalie.org/og/midterm-2026/ex-duel.png" />
<meta name="twitter:card" content="summary_large_image" />
</head>
<body style="margin:0">
`
const site = head + fill('/og/midterm-2026/') + '\n</body>\n</html>\n'
mkdirSync(resolve(web, 'midterm-2026'), { recursive: true })
writeFileSync(resolve(web, 'midterm-2026/index.html'), site)
writeFileSync(resolve(here, 'artifact.html'), fill('png/'))

const outDir = resolve(web, 'public/og/midterm-2026')
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const problems = []
try {
  const page = await browser.newPage({ viewport: { width: 860, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'light' })
  page.on('pageerror', (e) => problems.push(`script error: ${e.message}`))
  await page.goto('file://' + resolve(web, 'midterm-2026/index.html'))
  await page.waitForLoadState('networkidle')
  const ids = await page.$$eval('figure.card', (cards) => cards.map((c) => c.id))
  for (const id of ids) {
    const issues = await page.$eval(`#${id}`, (card) => {
      const out = []
      for (const c of card.querySelectorAll('.chart')) if (c.scrollWidth > c.clientWidth + 1) out.push('chart wider than its card')
      const boxes = [...card.querySelectorAll('.chart > svg text')].map((t) => ({ t: t.textContent, r: t.getBoundingClientRect() }))
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].r, b = boxes[j].r
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (w > 0 && h > 0 && w * h > 0.14 * Math.min(a.width * a.height, b.width * b.height))
            out.push(`labels overlap: "${boxes[i].t}" / "${boxes[j].t}"`)
        }
      return out
    })
    problems.push(...issues.map((s) => `${id}: ${s}`))
    await page.locator(`#${id}`).screenshot({ path: resolve(outDir, `${id}.png`) })
    console.log(`rendered public/og/midterm-2026/${id}.png`)
  }
  console.log(`${ids.length} cards rendered, ${problems.length} problems`)
} finally {
  await browser.close()
}
if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
