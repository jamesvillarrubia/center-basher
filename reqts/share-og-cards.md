# Feature: Shareable Open Graph cards + share widget

**Branch:** claude/dazzling-maxwell-sSHUR
**Created:** 2026-06-30
**Status:** Approved design, pre-implementation

## Problem

The essay is about to be shared publicly but has no Open Graph / Twitter Card
metadata, so a pasted link unfurls as a bare URL with no image, title, or
description. There is also no in-page affordance for a reader to share the piece.
We want a small set of strong, on-brand "banger quote" cards and a share control
that lets a reader pick a card and a destination, optimized for X and Bluesky
first, Instagram fully supported, LinkedIn wired but lighter.

## Goals

- [ ] Four fixed share cards, authored as editable HTML, rendered to 1200×630 PNG
- [ ] A repeatable HTML→PNG conversion step (no hand-iterated pixels)
- [ ] Correct OG/Twitter metadata on the essay, default = brand card
- [ ] Per-card share pages so the chosen card is the thumbnail that unfurls on
      link-unfurl platforms (X, Bluesky, LinkedIn)
- [ ] A "Share this" widget: pick a card, pick a destination, go
- [ ] Instagram path: download the image + copy a caption carrying the link
- [ ] Everything ships as static files through the existing Vite → Cloudflare
      Pages build, no Worker, no new runtime infra

## Non-Goals

- No dynamic / per-visitor OG image generation, no Satori/Worker rendering
- No share analytics or click tracking
- No change to essay prose, figures, or layout beyond inserting the share control
      and `<head>` metadata
- No automated posting; the user posts to Instagram manually

## The four cards (exact text)

All text is verbatim from the live essay except card 4, which is a user-authored
pull-quote approved for card use (it is NOT a sentence from the body and must not
be back-ported into the prose).

| slug | Card text | Emphasis treatment |
|---|---|---|
| `brand` | **The Center Is a Lie** / `thecenterisalie.org` (small) | Title-forward; domain in small caps beneath |
| `zero` | "All the ads and door-knocks combined move vote choice by roughly **zero**." | The word `zero` (or a literal `0`) is the dominant element, in accent red |
| `trust` | "In 1964, three in four Americans trusted their government; today, **one in five** do." | `one in five` scaled up, in accent red |
| `window` | "By the time candidates are nominated, the window to swing voters is closed." | Type-forward, no oversized number |

`brand` is the site default OG image. `zero`, `trust`, `window` each get a share
page (below). `brand` needs no share page because it is the main URL's default.

## Visual spec (match the v2 essay)

Pulled from `web/css/v2.css`:

- Background: `--paper` `#fbfbf8`
- Ink: `--ink` `#1b1b1d`; soft `#3a3a3d`; faint `#6b6b70`
- Accent: `--accent` `#b8240f` (used for the emphasis number/word)
- Serif stack: card templates pin `Georgia, serif` (DECIDED). Iowan Old Style is
  Apple-only and Charter is not universal, so most readers already see the essay
  rendered in Georgia; pinning Georgia makes the cards match what they see and
  renders identically in local + CI headless. Revisit with an embedded
  `Charter`/`Iowan` `@font-face` only if we want an exact-match upgrade later.
- Card size: 1200×630 (standard OG). Safe text margin ~80px; nothing critical in
  the outer 60px (some platforms crop to ~1.91:1 then pad).
- A small footer lockup on every card: `thecenterisalie.org`.

## Rendering pipeline (HTML is source of truth)

- Card source: `web/og-cards/<slug>.html` — one self-contained file per card,
  inline CSS, the card's own text, sized to exactly 1200×630.
- Render script: `web/og-cards/render.mjs` drives a headless browser (Playwright,
  added as a `web` devDependency via `pnpm add -D playwright`), loads each
  `web/og-cards/<slug>.html`, sets viewport 1200×630 / deviceScaleFactor 2, and
  screenshots to `web/public/og/<slug>.png`.
- Script wired as `pnpm -C web render:og`.
- Editing a card = edit the HTML, re-run `render:og`. PNGs are derived artifacts;
  they are committed (so deploy needs no browser) but never hand-edited.

`web/public/` does not exist yet; creating it is free because Vite copies
`public/` verbatim into `dist/`. So `web/public/og/<slug>.png` → `dist/og/<slug>.png`,
served at `/og/<slug>.png`.

## Per-card share pages (unfurl mechanism)

For each of `zero`, `trust`, `window`: a static stub at
`web/public/s/<slug>/index.html` → `dist/s/<slug>/index.html`, served at
`/s/<slug>/`.

Each stub contains:

- `og:image` / `twitter:image` = `https://thecenterisalie.org/og/<slug>.png`
- `og:title`, `og:description`, `og:url` = canonical essay URL (so the card links
  to the essay, not to the stub)
- `twitter:card=summary_large_image`
- A redirect for humans: `<meta http-equiv="refresh" content="0;url=https://thecenterisalie.org/">`
  plus a JS `location.replace(...)` and a visible "Read the essay" fallback link.

Crawlers (Twitterbot, facebookexternalhit, Slackbot, LinkedInBot, Bluesky's
fetcher) read the OG tags from the initial HTML and do not follow the refresh, so
the chosen card unfurls while any human who clicks bounces straight to the essay.

## Main page metadata (`web/index.html` `<head>`)

```html
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
<link rel="canonical" href="https://thecenterisalie.org/" />
```

Bluesky reads standard `og:*`; no Bluesky-specific tags needed.

## Share widget

Vanilla JS + CSS inlined into `index.html` (the site uses no framework).

**Placement:** end-of-essay only (DECIDED), after the coda, as a labeled "Share
this" block. No floating/pinned control in this version.

**Flow:**
1. "Share this" button opens a small panel.
2. Panel shows four card thumbnails (the PNGs); reader selects one. Default
   selection = `brand`.
3. Panel shows destinations: X, Bluesky, LinkedIn, Instagram, Copy link.
4. Destination behavior:

| Destination | Action |
|---|---|
| X | open `https://x.com/intent/post?text=<blurb>&url=<shareUrl>` |
| Bluesky | open `https://bsky.app/intent/compose?text=<blurb + " " + shareUrl>` |
| LinkedIn | open `https://www.linkedin.com/sharing/share-offsite/?url=<shareUrl>` |
| Instagram | switch panel to: **Download image** (`/og/<slug>.png`) + **Copy caption** (blurb + canonical link) |
| Copy link | copy `<shareUrl>` to clipboard |

- `<shareUrl>` = `https://thecenterisalie.org/` for `brand`, else
  `https://thecenterisalie.org/s/<slug>/`.
- `<blurb>` = short per-card share text (DECIDED below; user may edit any line in
  the compose box before posting):

| slug | blurb |
|---|---|
| `brand` | The "move to the center to win" playbook is a lie. A data essay on who actually decides elections, and why the safe candidate is the one who loses: |
| `zero` | All the ads and door-knocks combined move vote choice by roughly zero. Why late-campaign persuasion is a measured zero: |
| `trust` | In 1964, three in four Americans trusted their government. Today, one in five do. Almost everything about how we vote falls out of that collapse: |
| `window` | By the time candidates are nominated, the window to swing voters is already closed. Why "electability" is decided before the general even starts: |
- All external opens use `target="_blank" rel="noopener"`.
- LinkedIn ignores custom text by design; it unfurls the URL's OG only. Acceptable
  per "wired but lighter."

## File layout (new/changed)

```
web/
  og-cards/
    brand.html  zero.html  trust.html  window.html   # editable source
    render.mjs                                        # HTML -> PNG
  public/
    og/   brand.png zero.png trust.png window.png     # derived, committed
    s/    zero/index.html  trust/index.html  window/index.html
  index.html                                          # + <head> meta, + widget
  package.json                                        # + render:og script, playwright devDep
```

## Build / deploy fit

- `vite build` copies `public/` → `dist/` automatically; no `vite.config.js` change.
- CI (`.github/workflows/deploy.yml`) runs `pnpm build` then `wrangler pages deploy
  web/dist`. PNGs and stubs are committed, so CI does not need a browser; only the
  local `render:og` step does.
- Cloudflare Pages serves `/s/<slug>/` from `dist/s/<slug>/index.html` and
  `/og/<slug>.png` from `dist/og/<slug>.png` with no routing config.

## Behavior / acceptance criteria

- Pasting `https://thecenterisalie.org/` into X, Bluesky, LinkedIn, and Slack
  unfurls with the brand card, title, and description.
- Pasting `https://thecenterisalie.org/s/zero/` (and `trust`, `window`) unfurls
  with that card; a human opening it lands on the essay.
- The widget opens, a card can be selected, and each destination opens the right
  pre-filled target with the correct per-card share URL.
- Instagram path downloads the selected PNG and copies a caption containing the
  canonical link.
- `pnpm -C web render:og` regenerates all four PNGs deterministically from the HTML.
- Cards render legibly at full size and when cropped to 1.91:1; emphasis element
  (`zero`, `one in five`) is dominant on cards 2 and 3.

## Verification

- Render cards, screenshot at 1200×630, eyeball each (desktop-first per project rule).
- Validate unfurls with a card debugger (e.g. opengraph.xyz / platform validators)
  against the deployed URLs before announcing.
- Confirm `pnpm -C web build` emits `dist/og/*.png` and `dist/s/*/index.html`.

## Resolved decisions (were open questions)

- `og:description` hook: decided (see metadata block). User may revise the wording.
- Per-card share blurbs: decided (see widget table). Editable in the compose box.
- Share control placement: end-of-essay only, no floating control this version.
- Card font: `Georgia, serif` for deterministic, on-brand rendering; embedded
  Charter/Iowan is a possible later upgrade, not in scope now.
