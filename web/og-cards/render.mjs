import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../public/og')
mkdirSync(outDir, { recursive: true })

const slugs = ['brand', 'zero', 'trust', 'window']
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })

for (const slug of slugs) {
  await page.goto('file://' + resolve(here, `${slug}.html`))
  await page.screenshot({ path: resolve(outDir, `${slug}.png`), clip: { x: 0, y: 0, width: 1200, height: 630 } })
  console.log('rendered', slug)
}

await browser.close()
