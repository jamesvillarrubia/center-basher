# Feature: Shareable Open Graph cards + /share page

**Branch:** claude/dazzling-maxwell-sSHUR
**Created:** 2026-06-30
**Status:** SHIPPED 2026-06-30 (deployed to thecenterisalie.org)

> This spec documents the **as-shipped** design. It pivoted during the build from
> an inline end-of-essay widget (4 cards, unhashed images) to a standalone
> `/share` gallery (6 cards) with content-hashed, cache-busted images. History of
> the original plan: `docs/plans/2026-06-30-share-og-cards.md`.

## Problem

The essay had no Open Graph / Twitter Card metadata, so a pasted link unfurled as
a bare URL with no image, title, or description, and there was no in-page way for
a reader to share it. We wanted a set of strong, on-brand "banger quote" cards and
a share surface that lets a reader pick a card and a destination, optimized for X
and Bluesky first, Instagram fully supported, LinkedIn wired but lighter.

## Goals (all met)

- [x] Editable HTML cards rendered to 1200×630 PNGs by a repeatable step (no hand-iterated pixels)
- [x] Correct OG/Twitter metadata on the essay, default = brand card
- [x] Per-card share pages so the chosen card is what unfurls on X / Bluesky / LinkedIn
- [x] A share surface: pick a card, pick a destination, go
- [x] Instagram / universal path: download the image + copy a caption carrying the link
- [x] **Cache-busting**: change a card and no stale image is ever served
- [x] Ships as static files through the existing Vite → Cloudflare Pages build; no Worker

## Non-Goals

- No dynamic / per-visitor OG image generation, no Satori/Worker rendering
- No share analytics or click tracking
- No automated posting

## The six cards

Card text is verbatim from the essay except `window`, `risky`, and `incumbency`,
which are user-authored pull-quotes approved for card use (NOT body sentences; do
not back-port into prose). Visual markup lives in `web/og-cards/<slug>.html`; text
metadata (label / blurb / desc) lives in `web/og-cards/cards.config.mjs`.

| slug | Card text | Emphasis |
|---|---|---|
| `brand` | "The Center / is a" (stacked, right-justified) + giant **LIE** | LIE huge, accent red, left-justified; footer `thecenterisalie.org` |
| `zero` | "All the ads and door-knocks combined move vote-choice by roughly **zero.**" | quote in soft gray, two lines; `zero.` 300px accent red |
| `trust` | "In 1964, three in four Americans trusted their government. Today, **one** in **five** do." | soft-gray lead; `one`/`five` huge red, `in`/`do` small light |
| `window` | "By the time candidates are nominated, the window to swing voters is **closed**." | centered; `nominated` + `closed` enlarged accent red |
| `risky` | "The safe, establishment candidate has become the **risky** one." | centered; `risky` enlarged accent red |
| `incumbency` | "The party is built to protect its own **incumbency**." | centered; `incumbency` enlarged accent red |

`brand` is the site default OG image (bare URL). The other five each get a `/s/<slug>/`
stub. `brand` needs no stub.

## Visual spec (matches the v2 essay)

From `web/css/v2.css`: paper `#fbfbf8`, ink `#1b1b1d`, soft `#3a3a3d`, faint
`#6b6b70`, accent `#b8240f`. Card font `Georgia, serif` (deterministic in headless
render; matches what most readers see since Iowan/Charter aren't universal). Card
size exactly 1200×630, rendered at deviceScaleFactor 1. Footer lockup
`thecenterisalie.org` on every card.

## Single source of truth

`web/og-cards/cards.config.mjs` exports `CARDS` (`{slug, label, desc, blurb}`),
`BASE`, `DEFAULT_SLUG`, and `shareUrlFor(slug)`. Imported by both the node render
pipeline and the browser share code, so card text never diverges. `desc` is the
plain quote used for stub `og:description`; `blurb` is the prefilled compose text.

## Rendering pipeline (HTML is source; PNG/manifest/stubs are generated)

`pnpm -C web render:og` runs `web/og-cards/render.mjs` (Playwright devDependency):

1. Screenshots each `web/og-cards/<slug>.html` at 1200×630 to a **content-hashed**
   PNG `web/public/og/<slug>.<hash>.png` (clears stale PNGs first).
2. Writes `web/public/og/manifest.json` = `{ slug: { file, label, desc, blurb } }`.
3. Regenerates the per-card unfurl stubs `web/public/s/<slug>/index.html` with the
   hashed image URL + `desc`.

**Generated, never hand-edited:** `public/og/*.png`, `public/og/manifest.json`,
`public/s/*/index.html`. Edit the card HTML/CSS or `cards.config.mjs` and re-run.
Vite copies `public/` verbatim into `dist/`, so these serve at `/og/...`, `/s/...`.

## Cache-busting

Because OG/CDN/browser caches key on URL, every card image is content-hashed, so a
changed card produces a new filename everywhere (manifest + stubs + brand meta)
automatically. `web/public/_headers` (Cloudflare Pages) sets `/og/*.png` to
`max-age=31536000, immutable` and HTML / `manifest.json` / `/s/*` / `/share/*` to
`max-age=300`. Caveat: platforms (esp. X) keep their own per-URL card cache for a
few days; hashing guarantees our edge never serves stale bytes and that
freshly-shared links fetch the new card. For an already-posted link, re-scrape via
the platform's card validator.

## Unfurl mechanism (per-card stub pages)

Each `/s/<slug>/index.html` carries that card's hashed `og:image`/`twitter:image`,
`og:title`/`og:description`, `og:url` = canonical essay, `twitter:card=summary_large_image`,
`twitter:creator=@james_mtc`, and a `<meta http-equiv="refresh">` + `location.replace()`
to the essay with a visible fallback link. Crawlers read the card; humans bounce to
the essay.

## Main page metadata

`web/index.html` `<head>` carries the OG/Twitter block (default = brand card),
canonical, `twitter:creator=@james_mtc`. The brand `og:image` is the placeholder
`og/brand.png` in source; the Vite plugin `injectBrandOgImage` in
`web/vite.config.js` rewrites it to the hashed filename (from `manifest.json`) at
dev + build time, so the **source `index.html` is never edited** (it carries
hand-authored prose).

## /share page (standalone gallery)

Multipage Vite entry `web/share/index.html` + `web/js-v2/share-page.js`. A gallery
of all six cards (2-col desktop, 1-col mobile), each with a red border + drop
shadow and a uniform row of deep-blue controls: **X**, **Bluesky**, **LinkedIn**,
**Save image**, **Copy link**. `noindex`. Reachable from the essay end via a
"Share this essay →" button (`#share-root`, set by `initShareWidget` in
`web/js-v2/share.js`).

| Control | Action |
|---|---|
| X | `https://x.com/intent/post?text=<blurb>&url=<shareUrl>` |
| Bluesky | `https://bsky.app/intent/compose?text=<blurb + " " + shareUrl>` |
| LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url=<shareUrl>` |
| Save image | download the hashed PNG + copy caption (`blurb + canonical`) — attach to any post |
| Copy link | copy `<shareUrl>` |

`<shareUrl>` = `https://thecenterisalie.org/` for `brand`, else `…/s/<slug>/`.
Web intents can carry only text + a link; the card image appears via the link's
OG unfurl (X/Bluesky/LinkedIn) — "Save image" is the reliable way to attach the
actual picture anywhere. Pure logic + tests: `web/js-v2/share.js` /
`share.test.mjs` (`pnpm -C web test:share`, 11 tests).

## File layout

```
web/
  og-cards/
    cards.config.mjs          # single source of truth (text/metadata)
    card.css                  # shared card styling
    brand|zero|trust|window|risky|incumbency.html   # editable card markup
    render.mjs                # render → hash → manifest → stubs
    preview.html              # local side-by-side PNG/HTML preview (dev only)
  public/                     # copied verbatim into dist/
    og/<slug>.<hash>.png      # GENERATED, committed
    og/manifest.json          # GENERATED
    s/<slug>/index.html       # GENERATED unfurl stubs (5, no brand)
    _headers                  # Cloudflare cache rules
  share/index.html            # /share gallery page (Vite entry)
  js-v2/share.js              # CARDS re-export, share-target builders, loadManifest, initShareWidget
  js-v2/share-page.js         # gallery renderer
  js-v2/share.test.mjs        # node:test for pure logic
  index.html                  # + <head> OG meta (+ #share-root) — brand og:image injected at build
  vite.config.js              # multipage (/share) + injectBrandOgImage plugin
  package.json                # render:og, test:share scripts; playwright devDep
```

## Build / deploy fit

`vite build` emits both entries (`main`, `share`), copies `public/` → `dist/`, and
the plugin injects the hashed brand og:image. CI (`.github/workflows/deploy.yml`)
runs `pnpm install --frozen-lockfile && pnpm build` then `wrangler pages deploy
web/dist`. The committed hashed PNGs + manifest + stubs mean CI needs no browser;
only the local `render:og` step does.

## Verification (done, live)

- `pnpm -C web test:share` → 11/11.
- `pnpm -C web render:og` regenerates all six PNGs + manifest + stubs deterministically.
- `pnpm -C web build` emits `dist/og/<slug>.<hash>.png`, `dist/og/manifest.json`,
  `dist/s/<slug>/index.html`, `dist/share/index.html`, `dist/_headers`, and the
  hashed brand og:image in `dist/index.html`.
- Post-deploy (validated): main `/` serves the hashed brand og:image; each
  `/s/<slug>/` serves its hashed card; `/share/` → 200; hashed PNGs return
  `200 image/png` with `cache-control: …immutable`.

## Handles / canonical

X `@james_mtc`; Bluesky `jamesv.bsky.social`; canonical `https://thecenterisalie.org/`.
