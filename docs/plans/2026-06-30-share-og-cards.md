# Shareable OG Cards + Share Widget — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the essay real link previews (four on-brand quote cards) and an end-of-essay share widget that lets a reader pick a card and a platform, optimized for X and Bluesky, with a working Instagram download path.

**Architecture:** Cards are editable standalone HTML (source of truth) sharing one `card.css`, rendered to fixed `1200×630` PNGs by a one-command Playwright script. The PNGs and three tiny per-card "unfurl stub" pages ship as static files via `web/public/` (Vite copies it verbatim into `dist/`). The main page gets OG/Twitter `<head>` tags. A vanilla-JS module (`web/js-v2/share.js`) holds the pure share-URL logic (unit-tested with `node:test`) plus the DOM widget.

**Tech Stack:** Vite 5, vanilla JS (ES modules), Playwright (devDependency, render-time only), `node:test`, Cloudflare Pages. Package manager: **pnpm**. Node 22.

## Global Constraints

- Canonical site URL: `https://thecenterisalie.org/` (trailing slash).
- Card image size: exactly `1200×630`; deterministic render (no hand-edited pixels).
- Card palette (from `web/css/v2.css`): paper `#fbfbf8`, ink `#1b1b1d`, ink-faint `#6b6b70`, accent `#b8240f`. Card font: `Georgia, serif`.
- Card 4 text is a user-authored pull-quote — use verbatim, never back-port into essay prose.
- Handles: X `@james_mtc`; Bluesky `jamesv.bsky.social`.
- Cards (slug → exact text):
  - `brand`: "The Center Is a Lie" + `thecenterisalie.org`
  - `zero`: "All the ads and door-knocks combined move vote choice by roughly zero." (emphasis: zero)
  - `trust`: "In 1964, three in four Americans trusted their government; today, one in five do." (emphasis: one in five)
  - `window`: "By the time candidates are nominated, the window to swing voters is closed."
- New static assets live under `web/public/` so the build needs no browser; only local `render:og` does.
- Commit after every task. Footer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Work stays on branch `claude/dazzling-maxwell-sSHUR`.

## File Structure

```
web/
  og-cards/
    card.css            # shared card styling (palette, type, layout)
    brand.html          # editable card source
    zero.html
    trust.html
    window.html
    render.mjs          # Playwright: HTML -> 1200x630 PNG
  public/               # NEW (Vite copies verbatim to dist/)
    og/                 # brand.png zero.png trust.png window.png (derived, committed)
    s/                  # zero/index.html trust/index.html window/index.html (unfurl stubs)
  js-v2/
    share.js            # CARDS config + pure share-URL fns + initShareWidget()
    share.test.mjs      # node:test for the pure fns
  css/v2.css            # + share-widget styles (append)
  index.html            # + OG/Twitter <head> meta, + widget markup + module import
  package.json          # + render:og + test:share scripts, + playwright devDep
```

---

### Task 1: Card source templates (HTML + shared CSS)

Four editable card HTML files plus one shared stylesheet. Deliverable: opening any
card HTML in a browser shows a finished `1200×630` card. No PNG yet.

**Files:**
- Create: `web/og-cards/card.css`
- Create: `web/og-cards/brand.html`, `web/og-cards/zero.html`, `web/og-cards/trust.html`, `web/og-cards/window.html`

**Interfaces:**
- Produces: card HTML files renderable at `file://…/<slug>.html`, each a `.card` sized `1200×630`. Task 2 screenshots them.

- [ ] **Step 1: Write `web/og-cards/card.css`**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
.card {
  width: 1200px; height: 630px;
  background: #fbfbf8; color: #1b1b1d;
  font-family: Georgia, serif;
  display: flex; flex-direction: column; justify-content: center;
  padding: 96px 100px; position: relative; overflow: hidden;
}
.card--center { align-items: center; text-align: center; }
.kicker {
  font-size: 26px; letter-spacing: 0.14em; text-transform: uppercase;
  color: #6b6b70; margin-bottom: 28px;
}
.quote { font-size: 46px; line-height: 1.2; }
.em { color: #b8240f; }
.big { color: #b8240f; font-weight: 700; line-height: 0.98; }
.title { font-size: 132px; line-height: 1.02; font-weight: 700; letter-spacing: -0.01em; }
.footer {
  position: absolute; left: 100px; bottom: 56px;
  font-size: 26px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b6b70;
}
.card--center .footer { left: 0; right: 0; text-align: center; }
```

- [ ] **Step 2: Write `web/og-cards/brand.html`**

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./card.css"></head>
<body>
  <div class="card card--center">
    <div class="title">The Center<br>Is a Lie</div>
    <div class="footer">thecenterisalie.org</div>
  </div>
</body></html>
```

- [ ] **Step 3: Write `web/og-cards/zero.html`**

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./card.css"></head>
<body>
  <div class="card">
    <div class="kicker">Late-campaign persuasion</div>
    <div class="quote">All the ads and door-knocks combined move vote choice by roughly</div>
    <div class="big" style="font-size: 200px;">zero.</div>
    <div class="footer">thecenterisalie.org</div>
  </div>
</body></html>
```

- [ ] **Step 4: Write `web/og-cards/trust.html`**

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./card.css"></head>
<body>
  <div class="card">
    <div class="quote">In 1964, three in four Americans trusted their government.</div>
    <div class="quote" style="margin-top: 18px;">Today,</div>
    <div class="big" style="font-size: 132px;">one in five do.</div>
    <div class="footer">thecenterisalie.org</div>
  </div>
</body></html>
```

- [ ] **Step 5: Write `web/og-cards/window.html`**

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./card.css"></head>
<body>
  <div class="card card--center">
    <div class="quote" style="font-size: 60px; line-height: 1.22;">
      &ldquo;By the time candidates are nominated, the window to swing voters is closed.&rdquo;
    </div>
    <div class="footer">thecenterisalie.org</div>
  </div>
</body></html>
```

- [ ] **Step 6: Eyeball each card in a browser**

Open each `web/og-cards/<slug>.html` (file:// or via the chrome-devtools MCP at a
`1200×630` viewport). Confirm: text fits inside the padding with no clipping, the
accent element dominates on `zero`/`trust`, footer sits bottom-left (centered on
`brand`/`window`). If any text overflows, reduce that card's font-size inline and
re-open. This is the editable-source step; tune HTML/CSS here, not the PNG later.

- [ ] **Step 7: Commit**

```bash
git add web/og-cards/card.css web/og-cards/brand.html web/og-cards/zero.html web/og-cards/trust.html web/og-cards/window.html
git commit -m "feat(share): editable HTML source for four OG quote cards

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: HTML → PNG render pipeline

A one-command Playwright script that screenshots each card HTML to a fixed
`1200×630` PNG. Deliverable: `pnpm -C web render:og` writes four committed PNGs.

**Files:**
- Create: `web/og-cards/render.mjs`
- Modify: `web/package.json` (add devDep + scripts)
- Produces: `web/public/og/brand.png`, `zero.png`, `trust.png`, `window.png`

**Interfaces:**
- Consumes: the four `web/og-cards/<slug>.html` from Task 1.
- Produces: `/og/<slug>.png` assets that Tasks 4, 5, 6 reference by URL.

- [ ] **Step 1: Add Playwright as a dev dependency**

Run:
```bash
cd web && pnpm add -D playwright && pnpm exec playwright install chromium
```
Expected: `playwright` appears under `devDependencies` in `web/package.json`; Chromium downloads.

- [ ] **Step 2: Write `web/og-cards/render.mjs`**

```js
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
```

- [ ] **Step 3: Add scripts to `web/package.json`**

In the `"scripts"` block, add:
```json
    "render:og": "node og-cards/render.mjs",
    "test:share": "node --test js-v2/share.test.mjs"
```

- [ ] **Step 4: Render the cards**

Run:
```bash
cd web && pnpm render:og
```
Expected: prints `rendered brand/zero/trust/window`; creates four files in `web/public/og/`.

- [ ] **Step 5: Verify dimensions and existence**

Run:
```bash
cd web && for s in brand zero trust window; do test -f public/og/$s.png && node -e "import('playwright').then(async({chromium})=>{}); " ; done; ls -l public/og
sips -g pixelWidth -g pixelHeight web/public/og/brand.png 2>/dev/null || true
```
Expected: four PNGs listed; `brand.png` reports `pixelWidth: 1200`, `pixelHeight: 630`. (On macOS `sips` is available; otherwise open one in the browser to confirm size.)

- [ ] **Step 6: Visually verify the rendered PNGs**

Open `web/public/og/zero.png` and `trust.png`. Confirm the accent element renders
crisp and dominant and nothing is clipped. If a card needs adjustment, edit its
HTML (Task 1) and re-run `pnpm render:og` — never edit the PNG.

- [ ] **Step 7: Commit**

```bash
git add web/package.json web/pnpm-lock.yaml web/og-cards/render.mjs web/public/og
git commit -m "feat(share): render OG cards to 1200x630 PNGs via Playwright

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Share-URL logic module + unit tests (TDD)

The pure, testable core: card config and the functions that build each platform's
share target. Deliverable: `pnpm -C web test:share` passes.

**Files:**
- Create: `web/js-v2/share.js` (pure exports only in this task)
- Create: `web/js-v2/share.test.mjs`

**Interfaces:**
- Produces:
  - `CARDS: Array<{ slug, label, img, blurb }>`
  - `shareUrlFor(slug: string): string`
  - `buildShareTargets(slug: string): { url, x, bluesky, linkedin, instagramCaption, image }`
  - (Task 4 adds `initShareWidget()` to this same file.)

- [ ] **Step 1: Write the failing test `web/js-v2/share.test.mjs`**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { CARDS, shareUrlFor, buildShareTargets } from './share.js'

test('there are four cards, brand first', () => {
  assert.equal(CARDS.length, 4)
  assert.equal(CARDS[0].slug, 'brand')
})

test('brand shares the root URL', () => {
  assert.equal(shareUrlFor('brand'), 'https://thecenterisalie.org/')
})

test('non-brand cards share their per-card stub path', () => {
  assert.equal(shareUrlFor('zero'), 'https://thecenterisalie.org/s/zero/')
  assert.equal(shareUrlFor('window'), 'https://thecenterisalie.org/s/window/')
})

test('X target encodes the blurb and the card URL', () => {
  const t = buildShareTargets('zero')
  assert.ok(t.x.startsWith('https://x.com/intent/post?text='))
  assert.ok(t.x.includes(encodeURIComponent('https://thecenterisalie.org/s/zero/')))
})

test('Bluesky target carries the URL inside the text', () => {
  const t = buildShareTargets('window')
  assert.ok(t.bluesky.startsWith('https://bsky.app/intent/compose?text='))
  assert.ok(decodeURIComponent(t.bluesky).includes('https://thecenterisalie.org/s/window/'))
})

test('LinkedIn target passes the card URL as ?url', () => {
  const t = buildShareTargets('trust')
  assert.ok(t.linkedin.includes(encodeURIComponent('https://thecenterisalie.org/s/trust/')))
})

test('Instagram caption ends with the canonical root link', () => {
  const t = buildShareTargets('zero')
  assert.ok(t.instagramCaption.endsWith('https://thecenterisalie.org/'))
})

test('unknown slug throws', () => {
  assert.throws(() => buildShareTargets('nope'))
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `cd web && node --test js-v2/share.test.mjs`
Expected: FAIL — cannot resolve `./share.js` / exports undefined.

- [ ] **Step 3: Write `web/js-v2/share.js` (pure core)**

```js
// Pure, DOM-free share logic. initShareWidget() (added in Task 4) is the only
// part that touches the DOM, so importing this module under node is safe.
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
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `cd web && pnpm test:share`
Expected: PASS — 8 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add web/js-v2/share.js web/js-v2/share.test.mjs
git commit -m "feat(share): pure share-URL builders with node:test coverage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Share widget (DOM) + styles + page wiring

The end-of-essay UI: a "Share this" button, a card picker, and platform buttons.
Deliverable: in the dev server the widget opens, a card can be selected, and each
destination opens the right pre-filled target (X/Bluesky/LinkedIn), downloads the
PNG + copies a caption (Instagram), or copies the link.

**Files:**
- Modify: `web/js-v2/share.js` (append `initShareWidget()`)
- Modify: `web/css/v2.css` (append widget styles)
- Modify: `web/index.html` (add widget markup near the end of the essay + module import)

**Interfaces:**
- Consumes: `CARDS`, `buildShareTargets` from Task 3.
- Produces: `initShareWidget(rootSelector?: string): void`, called on load.

- [ ] **Step 1: Append `initShareWidget()` to `web/js-v2/share.js`**

```js
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
      <p class="share-step">1 · Pick a card</p>
      <div class="share-thumbs">${thumbs}</div>
      <p class="share-step">2 · Pick where</p>
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
```

- [ ] **Step 2: Append widget styles to `web/css/v2.css`**

```css
/* --- share widget --- */
.share { margin: 4rem 0 2rem; text-align: center; }
.share-open {
  font: inherit; font-size: 1.05rem; padding: 0.7em 1.4em; cursor: pointer;
  color: #fbfbf8; background: #b8240f; border: none; border-radius: 4px;
}
.share-panel {
  max-width: 560px; margin: 1.25rem auto 0; padding: 1.25rem;
  border: 1px solid #e2e2dc; border-radius: 8px; background: #fff; text-align: left;
}
.share-step { font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: #6b6b70; margin: 0 0 0.6rem; }
.share-thumbs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; margin-bottom: 1.1rem; }
.share-thumb {
  display: flex; flex-direction: column; gap: 0.35rem; padding: 0.3rem;
  background: none; border: 2px solid transparent; border-radius: 6px; cursor: pointer; font: inherit;
}
.share-thumb img { width: 100%; border-radius: 3px; display: block; }
.share-thumb span { font-size: 0.8rem; color: #3a3a3d; }
.share-thumb[aria-pressed="true"] { border-color: #b8240f; }
.share-dests { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.share-dest {
  font: inherit; font-size: 0.95rem; padding: 0.5em 1em; cursor: pointer;
  border: 1px solid #d4d4cd; border-radius: 4px; background: #fbfbf8; color: #1b1b1d; text-decoration: none;
}
.share-dest:hover { border-color: #b8240f; }
.share-note { margin: 0.9rem 0 0; font-size: 0.85rem; color: #2e7d32; }
```

- [ ] **Step 3: Add widget markup + module import to `web/index.html`**

Just before the closing `</body>` (and after the essay's coda content), insert:
```html
    <section class="share" aria-label="Share this essay"><div id="share-root"></div></section>
    <script type="module">
      import { initShareWidget } from './js-v2/share.js'
      initShareWidget()
    </script>
```
(If a `<footer>` or scripts already sit at the page end, place this immediately before them.)

- [ ] **Step 4: Run the dev server and verify interactively**

Run: `cd web && pnpm dev` then open `http://localhost:5193/`.
Verify:
- "Share this" toggles the panel.
- Selecting a card highlights it (red border).
- X / Bluesky / LinkedIn buttons' `href` updates per selected card (inspect the
  element, or hover to read the status bar). X href contains `intent/post` and the
  encoded `/s/<slug>/` URL for non-brand cards.
- "Instagram" downloads `<slug>.png` and shows the caption note.
- "Copy link" shows "Link copied." and the clipboard holds the share URL.

- [ ] **Step 5: Re-run the pure tests (guard against regressions)**

Run: `cd web && pnpm test:share`
Expected: PASS — the appended DOM code must not break the module import.

- [ ] **Step 6: Commit**

```bash
git add web/js-v2/share.js web/css/v2.css web/index.html
git commit -m "feat(share): end-of-essay share widget (card picker + platforms)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Open Graph / Twitter metadata on the main page

Default unfurl for the bare URL = the brand card. Deliverable: `<head>` carries a
complete OG/Twitter block.

**Files:**
- Modify: `web/index.html` (inside `<head>`, after the existing `<title>` on line 6)

**Interfaces:**
- Consumes: `/og/brand.png` from Task 2.

- [ ] **Step 1: Insert the meta block after `<title>The Center Is a Lie</title>`**

```html
  <meta name="description" content="Why the candidate the party calls 'electable' is the one who loses. A data essay: the center isn't a bloc, positions barely move voters, and the establishment loses." />
  <link rel="canonical" href="https://thecenterisalie.org/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="The Center Is a Lie" />
  <meta property="og:title" content="The Center Is a Lie" />
  <meta property="og:description" content="Why the candidate the party calls 'electable' is the one who loses. A data essay: the center isn't a bloc, positions barely move voters, and the establishment loses." />
  <meta property="og:url" content="https://thecenterisalie.org/" />
  <meta property="og:image" content="https://thecenterisalie.org/og/brand.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="The Center Is a Lie" />
  <meta name="twitter:description" content="Why the candidate the party calls 'electable' is the one who loses. A data essay: the center isn't a bloc, positions barely move voters, and the establishment loses." />
  <meta name="twitter:image" content="https://thecenterisalie.org/og/brand.png" />
  <meta name="twitter:creator" content="@james_mtc" />
```

- [ ] **Step 2: Verify the tags are present and well-formed**

Run:
```bash
grep -c 'og:image\|twitter:card\|canonical' web/index.html
```
Expected: at least `3` (one each). Confirm no duplicate `og:title` already existed.

- [ ] **Step 3: Commit**

```bash
git add web/index.html
git commit -m "feat(share): OG/Twitter meta on main page, default brand card

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Per-card unfurl stub pages

Three tiny static pages so the picked card unfurls on X/Bluesky/LinkedIn while a
human who clicks bounces to the essay. Deliverable: `/s/zero/`, `/s/trust/`,
`/s/window/` exist with their own `og:image`.

**Files:**
- Create: `web/public/s/zero/index.html`
- Create: `web/public/s/trust/index.html`
- Create: `web/public/s/window/index.html`

**Interfaces:**
- Consumes: `/og/<slug>.png` from Task 2.

- [ ] **Step 1: Write `web/public/s/zero/index.html`**

```html
<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8" />
  <title>The Center Is a Lie</title>
  <link rel="canonical" href="https://thecenterisalie.org/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="The Center Is a Lie" />
  <meta property="og:title" content="The Center Is a Lie" />
  <meta property="og:description" content="All the ads and door-knocks combined move vote choice by roughly zero." />
  <meta property="og:url" content="https://thecenterisalie.org/" />
  <meta property="og:image" content="https://thecenterisalie.org/og/zero.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://thecenterisalie.org/og/zero.png" />
  <meta name="twitter:creator" content="@james_mtc" />
  <meta http-equiv="refresh" content="0; url=https://thecenterisalie.org/" />
  <script>location.replace('https://thecenterisalie.org/')</script>
</head><body>
  <p><a href="https://thecenterisalie.org/">Read the essay &rarr;</a></p>
</body></html>
```

- [ ] **Step 2: Write `web/public/s/trust/index.html`**

```html
<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8" />
  <title>The Center Is a Lie</title>
  <link rel="canonical" href="https://thecenterisalie.org/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="The Center Is a Lie" />
  <meta property="og:title" content="The Center Is a Lie" />
  <meta property="og:description" content="In 1964, three in four Americans trusted their government; today, one in five do." />
  <meta property="og:url" content="https://thecenterisalie.org/" />
  <meta property="og:image" content="https://thecenterisalie.org/og/trust.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://thecenterisalie.org/og/trust.png" />
  <meta name="twitter:creator" content="@james_mtc" />
  <meta http-equiv="refresh" content="0; url=https://thecenterisalie.org/" />
  <script>location.replace('https://thecenterisalie.org/')</script>
</head><body>
  <p><a href="https://thecenterisalie.org/">Read the essay &rarr;</a></p>
</body></html>
```

- [ ] **Step 3: Write `web/public/s/window/index.html`**

```html
<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8" />
  <title>The Center Is a Lie</title>
  <link rel="canonical" href="https://thecenterisalie.org/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="The Center Is a Lie" />
  <meta property="og:title" content="The Center Is a Lie" />
  <meta property="og:description" content="By the time candidates are nominated, the window to swing voters is closed." />
  <meta property="og:url" content="https://thecenterisalie.org/" />
  <meta property="og:image" content="https://thecenterisalie.org/og/window.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://thecenterisalie.org/og/window.png" />
  <meta name="twitter:creator" content="@james_mtc" />
  <meta http-equiv="refresh" content="0; url=https://thecenterisalie.org/" />
  <script>location.replace('https://thecenterisalie.org/')</script>
</head><body>
  <p><a href="https://thecenterisalie.org/">Read the essay &rarr;</a></p>
</body></html>
```

- [ ] **Step 4: Verify the stubs serve and redirect**

Run: `cd web && pnpm dev`, then visit `http://localhost:5193/s/zero/`.
Expected: page immediately redirects to `/` (the essay). View-source of the stub
(before redirect, via `curl -s http://localhost:5193/s/zero/ | grep og:image`)
shows `og/zero.png`.

- [ ] **Step 5: Commit**

```bash
git add web/public/s
git commit -m "feat(share): per-card unfurl stubs for /s/zero, /s/trust, /s/window

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Build verification + final wiring check

Confirm the production build emits every new asset where Cloudflare Pages will
serve it. Deliverable: `dist/` contains the cards, stubs, and bundled widget.

**Files:** none created; verification only.

- [ ] **Step 1: Clean build**

Run:
```bash
cd web && pnpm build
```
Expected: build succeeds; `vite.config.js`'s data-copy plugin still runs.

- [ ] **Step 2: Assert the new assets landed in dist**

Run:
```bash
cd web && ls dist/og && ls dist/s/zero dist/s/trust dist/s/window && grep -l 'og:image' dist/index.html
```
Expected: four PNGs under `dist/og`; an `index.html` under each `dist/s/<slug>`;
`dist/index.html` contains the OG tags.

- [ ] **Step 3: Confirm the widget bundled**

Run:
```bash
cd web && grep -rl 'buildShareTargets\|share-open' dist/assets dist/index.html
```
Expected: at least one match (the widget module is bundled into `dist/assets/*` and
referenced from `dist/index.html`).

- [ ] **Step 4: Commit any build-config touch-ups (only if needed)**

If Steps 1-3 required a fix (e.g. the module script wasn't picked up), make the
minimal change, then:
```bash
git add -A && git commit -m "fix(share): ensure share assets emit into dist

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Post-deploy validation (after CI deploys the branch)**

Once pushed and deployed, validate the live unfurls with a card debugger
(opengraph.xyz, or the platform validators) against:
- `https://thecenterisalie.org/` → brand card
- `https://thecenterisalie.org/s/zero/` → zero card (and `trust`, `window`)
Confirm each shows the right image and that clicking through lands on the essay.

---

## Self-Review

**Spec coverage:**
- Four editable HTML cards → Task 1. ✓
- Repeatable HTML→PNG (no hand-iterated pixels) → Task 2 (`render:og`). ✓
- OG/Twitter metadata, default brand → Task 5. ✓
- Per-card unfurl pages → Task 6. ✓
- Share widget (pick card, pick destination) → Tasks 3 (logic) + 4 (DOM). ✓
- Instagram download + caption → Task 4 instagram handler. ✓
- Static-files / Vite `public/` / Cloudflare, no Worker → Tasks 2, 6, 7. ✓
- Handles `@james_mtc` / `jamesv.bsky.social` → Tasks 3, 5, 6. ✓
- Card text + emphasis (zero, one in five) → Task 1 + Global Constraints. ✓
- Georgia font, v2 palette → Task 1 `card.css`. ✓
- End-of-essay placement only → Task 4 Step 3. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete content. Card
font-sizes that may need visual tuning are explicitly flagged as edit-and-re-render
steps (Task 1 Step 6, Task 2 Step 6), not silent placeholders.

**Type consistency:** `CARDS`, `shareUrlFor`, `buildShareTargets`, `initShareWidget`
names match across Tasks 3 and 4. `buildShareTargets` return keys
(`url, image, x, bluesky, linkedin, instagramCaption`) are exactly the keys read by
the widget and the tests. Asset paths `/og/<slug>.png` and `/s/<slug>/` are
consistent across Tasks 2, 4, 5, 6.

**Note on testing:** Only the pure share-URL logic gets a unit test (Task 3, the
right place per the project's integration-first philosophy — DOM/markup tasks are
verified by deterministic shell assertions + browser checks rather than a mocked
DOM harness, which the project's testing rules explicitly discourage).
