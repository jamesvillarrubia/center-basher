# Distribution Playbook — *The Center Is a Lie*

**Created:** 2026-07-01
**Site:** https://thecenterisalie.org
**Goal:** get a rigorous, data-first political essay to travel, without re-coding it as a partisan-left tract.

> One-line diagnosis: posting a link to your own feeds is broadcasting into the void — that's the
> default outcome for almost every essay, not a signal the piece is weak. Long-form travels when it's
> *seeded into arguments already happening*, and when the first impression is a fight-worthy claim
> rather than a bare link.

---

## 0 · The one bug that's costing clicks (fix first)

You've been sharing the **bare homepage** (`thecenterisalie.org`). That unfurls the generic **"brand"
card** — the weakest of the six. The repo already generates **per-stat share URLs** that unfurl with a
punchy card *and* redirect the human to the essay:

| Share URL | Card hook |
|---|---|
| `thecenterisalie.org/s/trust/` | 3 in 4 → 1 in 5 (trust collapse) |
| `thecenterisalie.org/s/zero/` | ads move vote choice by roughly zero |
| `thecenterisalie.org/s/risky/` | the "safe" establishment candidate is the risky one |
| `thecenterisalie.org/s/window/` | the window to swing voters is closed before the general |
| `thecenterisalie.org/s/incumbency/` | the party is built to protect incumbency |

**Use the `/s/` links, not the homepage.** Match the card to the audience (data crowd → `/s/zero/`;
change-lane / left → `/s/risky/`). A stat card gets 2–4× the click-through of a generic brand card.

**Two verifications before a campaign:**
1. Force a re-scrape of each `/s/` link in the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   and the X Card Validator — platforms cache your *old* brand-card unfurl and keep showing it.
2. Confirm every `/og/*.png` returns HTTP 200 in prod (deploy is GH Actions + wrangler).

---

## 1 · Platform-native copy (argument in the post, link secondary)

### X / Twitter — self-contained thread, card link last

```
1/ "Move to the center to win" is the most repeated advice in US politics.
It's also wrong. I went through 70 years of ANES data to show why the
candidate a party calls "electable" is usually the one who loses. 🧵

2/ The center barely exists. ~40% of voters call themselves "moderate."
Check their actual positions and only about 1 in 100 is centrist across
the board. Most "moderates" hold strong opposing views that average out.

3/ And you can't move the ones who are there. The largest meta-analysis of
campaign persuasion — 49 field experiments — puts the effect of ads + mail
+ canvassing on vote choice at ~0.0 points. Late persuasion is a measured zero.

4/ So what decides it? Trust. In 1964, 3 in 4 Americans trusted government.
Today ~1 in 5 do. In a low-trust era, voters punish whoever looks like
"the system." That single collapse reorganizes everything.

5/ That's the sign flip: the candidate cast as the establishment loses the
change lane. Since 2000 the change-coded candidate wins the low-trust cycle
almost every time. "Safe" = establishment = the risky bet.

6/ Concrete body count: in 2016 the Sanders→Trump defector bucket alone was
larger than Trump's winning margin in Wisconsin (2.7×), Michigan (5.3×),
and Pennsylvania (3.0×). Consolidating around the "electable" pick cost the race.

7/ This isn't "go left" or "go right." "Move to the center" fails on its own
terms: the center isn't a bloc, positions don't move voters, and the
establishment label loses. Every chart shows its data. Full essay:
thecenterisalie.org/s/trust/
```

**Highest-leverage move:** quote-tweet any pundit/blue-check saying *"Democrats need to moderate"*
with tweet 5 + the link. Reply into the argument; don't broadcast.

### LinkedIn — text post, NO link in body (link in first comment)

```
The most expensive received wisdom in politics is "move to the center to be electable."

I spent months with 70 years of survey data testing it. It fails three ways:

• The center isn't a bloc. ~40% of voters self-describe as moderate; about
  1 in 100 actually hold centrist positions across the board.

• Positions barely move voters. The largest meta-analysis of campaign
  persuasion — 49 field experiments — measures late-campaign persuasion on
  vote choice at essentially zero.

• The establishment-cast candidate loses the change lane. In a low-trust era
  (trust in government: 3 in 4 in 1964 → ~1 in 5 today), voters punish whoever
  looks like "the system." Since 2000 the change-coded candidate wins the
  low-trust cycle nearly every time.

The strategic inversion: the "safe" establishment pick is the risky one.

Every claim shows its data and sources. Link in comments.
```

*(External links in the LinkedIn body get algorithmically suppressed; first-comment link is the workaround.)*

### Reddit — highest upside for a data essay (see §2)

```
Title: I went through 70 years of ANES data on "electability." The
"move to the center" strategy fails on its own terms.

[3–4 paragraph summary — same three points — written as an argument you're
inviting people to poke at, NOT a pitch. End with:]

Full write-up with the charts and every source: [link]
Happy to argue any of the three claims in the comments.
```

### Facebook — lowest ROI

Native text + link in a comment, or post into relevant Groups (political-strategy, poli-sci, campaign
groups) rather than your own timeline.

---

## 2 · Reddit seeding strategy (where it actually travels)

| Sub | Why it fits | Framing / rules |
|---|---|---|
| **r/PoliticalDiscussion** | Built for this; analysis posts welcomed | Post the summary as the body, link as source. No low-effort link-drops (auto-removed). |
| **r/neoliberal** | Data-obsessed, contrarian-friendly, loves to argue | Lead with Kalla-Broockman zero + 1-in-100. They'll fight you — that's engagement. `/s/zero/`. |
| **r/Political_Revolution** & Bernie-adjacent | Thesis is sympathetic | Lead with the WI/MI/PA Sanders→Trump arithmetic. `/s/risky/`. |
| **r/PoliticalScience** | Analysis-tolerant | Source-first framing. |

**Hard rules or you get shadow-removed:**
- Most subs remove pure self-promo links → post the *argument* as self-text, link as a source at bottom.
- Comment for a few days in each sub first so you're not a zero-history drive-by.
- One sub per day, not a blast — same link to 6 subs in an hour trips spam filters.
- The winning move everywhere: **find an existing thread** ("Dems need to moderate", "was Bernie
  electable", "why did Harris lose") and drop the relevant chart + one paragraph + link as a *comment*.
  A well-placed comment beats a new post.

---

## 3 · Gaming engagement via the social images

Mechanics that actually move shares/click-through, mapped to the `og-cards/` + `/s/` pipeline:

1. **Numbers are the most screenshot-able asset you have.** `1 in 100` · `$0.0 effect` ·
   `3 in 4 → 1 in 5`. One idea, giant type, high contrast, legible at a 200px phone thumbnail.
2. **Weld any borrowed quote to YOUR claim.** A live-example quote (see §4) taps a large, engaged
   audience — but the card must carry your unique punchline or you're just a fan account:
   > *"…making $30 an hour that their enemies are those earning $20 an hour."* — Mamdani
   > **The "safe" establishment pick is the risky one. The data → thecenterisalie.org**
3. **Multi-image posts.** X and LinkedIn allow **4 images** per post → drop three failure-mode cards +
   one quote card as a carousel = 4× the surface area in one post.
4. **Dunk bait converts.** A card pairing a real pundit's *"Democrats must moderate"* quote with your
   one-line refutation gets quote-tweeted (people argue *with* it) far more than an assertion.
5. **Render 3 aspect ratios**, not just OG:
   - `1200×630` — link unfurl (OG/Twitter)
   - `1080×1080` — square, for Threads / Mastodon / IG inline
   - `1080×1350` — portrait, max IG feed real estate
   Keep faces/text centered; X crops OG to ~16:9 in-timeline.
6. **Every card is a billboard even with no click** — consistent wordmark + `thecenterisalie.org` on
   each, so a screenshot still markets the domain.
7. **Match card → channel** via the `/s/` links: `/s/zero/` into r/neoliberal, `/s/risky/` + a quote
   card into left/DSA channels.

---

## 4 · Live-example quotes (Mamdani / DSA) — for quote cards

**Rule: a misquote on a viral card torches the "rigor, not an op-ed" brand. Verify before rendering.**

### Tier 1 — verified verbatim vs Rev transcript of the victory speech (safe to render)
- *"The billionaire class has sought to convince those making $30 an hour that their enemies are those earning $20 an hour."*
- *"They want the people to fight amongst ourselves so that we remain distracted from the work of remaking a long broken system."*
- *"We can respond to oligarchy and authoritarianism with the strength it fears, not the appeasement it craves."*
- *"We have toppled a political dynasty."*

**Best single card candidate:** the $30-vs-$20 line — verified, universal, and it *is* the
"divide the coalition to protect the system" thesis in the subject's own words.

### Tier 2 — strong bangers, wording from news summaries → confirm vs primary transcript/clip first
- **"Let them."** — reply to being made the GOP's "poster child" of the party.
- **"What is the Democratic Party if not its voters?"** — to Chris Hayes, defending insurgent candidates.
- **"I'm not interested in writing a manifesto, or frankly, in reading one. I'm interested in delivering."**
- Inauguration: won't answer "to any billionaire or oligarch who thinks they can buy their democracy."
- **DSA "You're next"** chants aimed at Jeffries after the June 23 wins.
- **Melat Kiros (CO), to Jeffries' "the party is back":** *"with virtually no help from you."*

### Tier 3 — DO NOT render
Avila Chevalier "abolish borders/police/prisons / accused Biden of rape" — opposition-compiled,
since-deleted posts. GOP attack ammo, accuracy/defamation risk. Off-limits.

**Sources:** Rev / Newsweek victory-speech transcripts; CNN inauguration coverage;
NBC / CNN House-primary coverage; ms.now ("Let them", CO Kiros); The Hill ("you're next"); Fox
(Jeffries/DSA split); Democracy Now (DSA vs establishment).

---

## 5 · The brand caution (a real trade-off, not a nit)

The essay's persuasive edge with skeptics is that it reads as **"I'm just following the data," not a
left op-ed.** Quote cards of DSA firebrands re-code it as advocacy:

- **Gain:** immediate amplification from a big, engaged progressive audience.
- **Lose:** the credibility that lets it land on a neoliberal or establishment reader — and it hands
  critics the free dismissal *"this is just Bernie cope."*

**Policy:**
- Keep **stat cards as the default/homepage `og:image`** and the front door.
- Deploy **quote cards as a secondary, audience-targeted weapon** into channels that amplify them —
  never as the homepage unfurl.
- Keep the analytic voice on the card ("the establishment keeps nominating losers — here's why,"
  Mamdani as a *live example* of the change-lane dynamic), not "vote DSA." This is §16 caveat-3 /
  Phase-2 material — live illustration of the existing thesis, which is the honest framing.

---

## 6 · Rendering pipeline (how to add cards)

- Sources: `web/og-cards/*.html` + `web/og-cards/card.css` + `web/og-cards/cards.config.mjs`.
- Build: `pnpm render:og` → content-hashed PNGs + `og/manifest.json` + generated `/s/` unfurl stubs.
- **Never hand-edit generated files** (`web/public/og/*.png`, `web/public/s/**`, `manifest.json`).
- Any face photo on a card must be **CC-licensed (Wikimedia)**; otherwise use text-only typographic
  cards (matches the existing set, zero licensing risk).

---

## 7 · Launch checklist

- [ ] Re-scrape all `/s/` links in FB Debugger + X Validator (clear cached brand-card unfurl).
- [ ] Confirm `/og/*.png` return 200 in prod.
- [ ] Verify Tier-2 quotes against primary transcripts before any quote card renders.
- [ ] Build 1–2 quote cards (Tier-1 only to start) welded to a data punchline.
- [ ] Render square + portrait variants for IG / Threads / Mastodon.
- [ ] Post X thread; quote-tweet a "moderate to win" take with the link.
- [ ] LinkedIn text post, link in first comment.
- [ ] One Reddit self-text post/day, argument native, link as source; comment first.
- [ ] Track which `/s/` card + channel drives the most click-through; double down.
