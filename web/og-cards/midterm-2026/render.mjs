// Build and render the 2026 midterm exhibit page.
//
//   node og-cards/midterm-2026/render.mjs        (from web/)
//
// 1. Inlines data/derived/midterm2026/exhibits_data.json into template.html -> index.html.
// 2. Screenshots every figure.card in light theme at 2x -> png/<card id>.png.
// Fails when a card's chart overflows its box or a script errors.

import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const data = readFileSync(resolve(here, '../../../data/derived/midterm2026/exhibits_data.json'), 'utf8')
const tpl = readFileSync(resolve(here, 'template.html'), 'utf8')
if (!tpl.includes('__DATA__')) throw new Error('template.html has no __DATA__ placeholder')
const page_html = tpl.replace('__DATA__', data)
writeFileSync(resolve(here, 'index.html'), page_html)

// The artifact skeleton supplies doctype/charset; a local file needs them to render the same way.
const local = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">${page_html}</body></html>`
writeFileSync(resolve(here, '.render.html'), local)

const outDir = resolve(here, 'png')
mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 820, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'light' })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('file://' + resolve(here, '.render.html'))
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)

const ids = await page.$$eval('figure.card', (cards) => cards.map((c) => c.id))
const problems = []
for (const id of ids) {
  const overflow = await page.$eval(`#${id}`, (card) =>
    [...card.querySelectorAll('.chart')].some((c) => c.scrollWidth > c.clientWidth + 1))
  if (overflow) problems.push(`${id}: chart wider than its card`)
  await page.locator(`#${id}`).screenshot({ path: resolve(outDir, `${id}.png`) })
  console.log(`rendered png/${id}.png`)
}
await browser.close()
if (errors.length) problems.push(...errors.map((e) => `script error: ${e}`))
if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`${ids.length} cards rendered, 0 problems`)
