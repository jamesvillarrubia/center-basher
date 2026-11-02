# The Establishment Party: essay plan

Status: DRAFT plan, 2026-11-02. Not approved. No analysis has run yet.

A short, Substack-length companion to thecenterisalie.org. It argues that a third
party, the Establishment, runs through both Democrats and Republicans, wins the
elections that matter to it, and controls what Congress passes. Every claim rests
on public data, and every chart makes its point on its own when posted.

This file is the plan. It extends Essay 2 ("Wealth as the system") in
`reqts/phase-2-ideas.md`, which already lists Gilens & Page, OpenSecrets, and a
roll-call replication as wanted data.

---

## 1 · Thesis (James's words, condensed for the plan only)

> There are three parties: Left, Right, and Establishment. People who do not want
> to disrupt the overarching power structures tend to win elections. They get into
> office because of those structures, vote to keep them, and stay. Their party
> loyalty is secondary to their loyalty to the power structure. Both parties fight
> over socially liberal or socially conservative bills as virtue signals, while most
> bills that pass are tax breaks and deregulation for established power. Populist
> issues are popular with 70% of a district and still lose in Congress.

James's examples: Haley Stevens (recruited by Schumer and party leadership against
Abdul El-Sayed, Michigan Senate 2026) and John Fetterman (elected as a populist,
now votes across party lines).

### Reconciling with Essay 1

Essay 1 says "the candidate cast as the establishment loses" presidential
generals (trust flips with the White House party in 11 of 13 cycles). This essay
must not contradict it. Proposed reconciliation (Claude's call, needs James's
yes): voters fire the establishment at the top of the ticket every few cycles,
and the Establishment still wins the primaries, the down-ballot seats, and the
legislative agenda. The presidency is the one office where an outsider lane
exists; everywhere else the gates hold.

---

## 2 · Defining "Establishment" before looking at results

A hostile reviewer's first attack: "Establishment" means whoever won, so the theory
cannot fail. The essay fixes the definition in advance and publishes the
pass/fail criteria with the results, including any that fail.

James did not pick a definition. Claude's call, three independent markers, each
measurable from public data before an election:

| Marker | Measure | Source |
|---|---|---|
| **Anointed** | Endorsed by party leadership or a party committee (DSCC, DCCC, NRSC, NRCC) or their allied super PACs before the primary | Brookings Primaries Project; Ballotpedia; committee press releases |
| **Funded** | Top-quartile share of pre-primary receipts from PACs and $2,000+ donors | FEC bulk data; Bonica DIME |
| **Insider** | Sitting officeholder, former staffer, or lobbyist at filing | Ballotpedia; OpenSecrets Revolving Door |

A candidate scoring on two of three counts as Establishment. The essay reports
results for each marker alone too, so no single choice carries the finding.

**Entry markers are partly outcome proxies.** Money follows viability and
incumbents win. C2 therefore runs on open seats only and reports the confound.

**Behavior marker (Claude's call).** Entry markers cannot score Fetterman, who
entered as an insurgent. A second, separate score covers behavior in office: a
member's vote share with the Establishment side on the frozen structure-bill set
(section 2a). C5, C6, and C8 use the behavior score; C2 uses the entry score.

**Data risk.** DSCC, DCCC, NRSC, and NRCC rarely endorse in contested open
primaries, so "Anointed" may barely vary. It also counts endorsements by leader
PACs and leadership-allied super PACs (Senate Majority PAC, House Majority PAC,
Senate Leadership Fund, Congressional Leadership Fund). If it still barely
varies, Claude reports that and drops the marker.

## 2a · Structure bills vs social bills (frozen coding rule, Claude's call)

A mechanical rule on Comparative Agendas Project major topic codes, written before
any analysis:

| Set | CAP major topics |
|---|---|
| Economic structure | 1 Macroeconomics (incl. tax), 8 Energy, 10 Transportation, 14 Housing, 15 Banking, Finance & Commerce, 17 Technology & Communications, plus subtopic 1803 (trade) |
| Social | 2 Civil Rights & Liberties (incl. abortion, guns where coded), 9 Immigration, 12 Law & Crime |
| Excluded | everything else (defense, foreign affairs, agriculture, government operations, etc.) |

Results are also reported with the excluded topics folded into economic, so the
split cannot be blamed for the finding. C5's bill each Congress: the economic-
structure bill with the largest CBO ten-year score that reached final passage in
the House.

---

## 3 · Claims, tests, and what would refute each

Each claim gets one chart. "Refuted if" is written now and does not change after
the numbers come in. A refuted claim gets an `[Claude: honest correction]` block
and leaves the essay or is rewritten (CLAUDE.md §3, §4).

### C1 · Congress is unpopular and its members keep their seats
- **Chart:** two lines, 1990 to 2024. House reelection rate (~90%+) against
  Congress approval (Gallup, often under 25%).
- **Data:** OpenSecrets / Brookings Vital Statistics on Congress (reelection);
  Gallup congressional approval series.
- **Refuted if:** reelection rate falls when approval falls, at a comparable
  slope. (Expectation: it does not. This chart is well known; its job is the hook.)

### C2 · The anointed win primaries
- **Chart:** win rate in open-seat primaries, Establishment vs not, by party,
  2014 to 2024.
- **Data:** Brookings Primaries Project (cycle coverage unverified; check which
  years code endorsements before planning around 2020 and 2024);
  FEC pre-primary receipts; Ballotpedia results.
- **Confound to handle:** committees endorse likely winners. Control for
  pre-endorsement polling or fundraising where available, and say plainly where
  the data cannot separate cause from forecast.
- **Refuted if:** the Establishment win rate is within 10 points of the non-Establishment
  rate after the controls.

### C3 · What Congress fights about differs from what Congress passes
- **Chart:** two stacked bars. Left: topics of party-line roll calls. Right: topics
  of enacted laws, weighted by budget effect where available. Social issues should
  dominate the left bar; tax, finance, and industry provisions the right.
- **Data:** Voteview roll calls (party-line votes = majority of each party opposed);
  Comparative Agendas Project US topic codes for bills and laws; CBO scores for
  budget weight.
- **Refuted if:** social-issue bills make up a similar share of both bars.

### C4 · Popular policies die without a vote
- **Chart:** each dot is a policy. X axis = public support. Y axis = outcome
  (floor vote held / passed / never voted). Policies at 65%+ cluster in "never voted."
- **Data:** CES 2016, 2020, 2024 policy items (local, `data/raw/cces/`, in the main
  checkout); Gallup, Pew, KFF for items CES lacks (drug-price negotiation, paid
  leave, minimum wage, congressional stock-trading ban); congress.gov bill status.
- **Selection rule:** fixed before plotting. Every economic item in CES Common
  Content with a matching bill in that Congress, so Claude cannot cherry-pick.
- **Unit:** national support (district support belongs to C5). "Voted" means a
  floor vote in either chamber. Results are split by unified vs divided government,
  since divided government and the filibuster also block votes.
- **Refuted if:** policies above 65% support reach a floor vote at the same rate as
  policies under 50%.

### C5 · Members vote against their own districts on economic bills
- **Chart:** for one high-profile economic bill per Congress, each member as a dot:
  district support (CES, aggregated by district) against the member's vote, colored
  by party. Highlight members who voted against a 60%+ district majority.
- **Data:** CES district-level estimates (needs MRP or pooled years for adequate n
  per district; flag n); Voteview member votes.
- **To verify first:** whether CES Common Content carries the incumbent's own vote on
  its roll-call items. Claude has not confirmed this.
- **Refuted if:** members' votes track district majority at similar rates on economic
  and social bills.

### C6 · Money predicts the economic vote; party predicts the social vote
This is the core "third party" test.
- **Chart:** two panels. For economic-structure bills and for social bills, the
  share of a member's vote explained by party vs by donor profile (PAC/large-donor
  share).
- **Data:** Voteview; DIME (Bonica) donor shares; FEC.
- **Language (Claude's call):** correlational only. Donors fund members who already
  agree with them, so a donor coefficient cannot show money buying votes. Prose
  says money and votes travel together.
- **Known obstacle:** DW-NOMINATE's first dimension (mostly party) correctly
  classifies roughly 90% of individual votes in recent Congresses (classification
  accuracy; verify the figure on Voteview). That number cuts against the
  theory, and the essay must face it. The likely answer: the Establishment works
  through agenda control (C3, C4) and near-unanimous bills, which never become
  contested roll calls. Test: run the model on bills passing with 70%+ of both
  parties, where party cannot explain the vote.
- **Refuted if:** donor profile adds no predictive power beyond party on either bill set.

### C7 · Policy follows the affluent
- **Chart:** the Gilens & Page result: probability of policy adoption against
  preference, for average citizens (flat) and economic elites (rising).
- **Data:** Gilens & Page 2014 (PoP 12:3); Gilens 2012 dataset (public, covers
  about 1981 to 2002, so it says nothing about recent Congresses; any "still true"
  claim needs a newer replication or gets cut). Report the
  critics (Enns 2015; Bashir 2015; Branham, Soroka & Wlezien 2017) who find average
  and affluent preferences mostly agree.
- **Correction to carry:** `phase-2-ideas.md` says the affluent correlation is
  "near-perfect." Gilens & Page report regression coefficients (economic elites
  around .76, average citizens near zero, from memory; verify against the paper
  before use). "Near-perfect correlation" overstates it and must not reach prose.
- **Refuted if:** the replication does not hold for divergent-preference cases.

### C8 · Case studies (illustration, never evidence)
- **Fetterman:** party-unity score by year from Voteview, against his 2022
  campaign positions. Verify the claim that he "effectively votes Republican"
  against actual party-unity numbers; report the number either way.
- **Stevens vs El-Sayed:** leadership endorsements, outside money (FEC, AdImpact
  if public), and the primary result. Claude's knowledge ends June 2026, and the
  primary was August 2026; every fact here gets verified from a source. The essay
  uses the race whichever way it went: a Stevens win illustrates C2; an El-Sayed
  win becomes the counterexample the essay names.
- **Revolving door:** share of departing members who become lobbyists
  (OpenSecrets).

---

## 4 · The essay

- **Length:** 2,500 to 4,000 words, up to 8 charts (one per surviving claim; C8 may be one combined card). Essay 1 is far longer.
- **Shape:** hook (C1), how they get in (C2), what they do (C3, C4, C5), why party
  is the cover (C6), who they answer to (C7), cases (C8), what voters can do.
- **Voice:** same as `web/index.html` (HTML is source of truth per memory). Long,
  momentum-carrying sentences; no staccato fragments; section titles are short
  phrases; one footnote per claim; few em-dashes.
- **Prose ownership:** James owns the ledes. Claude drafts body text and footnotes;
  James rewrites. Claude never "tightens" James's lines after.
- **Footnotes:** every number carries dataset, variables, filter, n, weight, method
  (CLAUDE.md §2).

## 5 · Charts

- Same system as the existing deck: 1600x900 `web/og-cards/chart-*.html`, rendered
  by `pnpm render:charts` from `web/`, passing the machine gate and the six-item eye
  gate in `web/og-cards/DESIGN.md`.
- Each card stands alone when tweeted: the headline states the claim as a fact
  ("Congress: 21% approval. 94% reelected."), the chart proves it, the footer names
  the source.
- Every number on a card is recomputed by a script in `scripts/`, output to
  `data/derived/`, never typed by hand.

## 6 · Work order

1. **Claim ledger.** Freeze section 2 and section 3's refutation criteria. James signs off.
2. **Data pull.** Voteview, DIME, FEC bulk, Brookings Primaries, Comparative Agendas,
   Gallup, Vital Statistics, OpenSecrets. Store under `data/raw/<dataset>/`
   (never `/tmp`). Run the variable audit for CES items (CLAUDE.md §1a).
3. **Analyses.** One script per claim, output JSON to `data/derived/`. Report each
   pass or fail to James before writing prose around it. If claims fail, James
   decides whether the surviving set still makes an essay.
4. **Chart cards.** One per surviving claim.
5. **Draft.** Body text and footnotes; James writes ledes.
6. **Publish.** Location to be decided (section 7).

## 7 · Open questions for James

- Publication home: a new page on thecenterisalie.org, a separate domain, or
  Substack with charts as images.
- Whether the Essay 1 reconciliation in section 1 matches what James believes.
- Whether "Establishment" may include Republicans as prominently as Democrats.
  The data will find both; the essay's audience may expect a Democratic focus.

## Non-goals

- No claim of coordination or conspiracy. The essay shows incentives and outcomes;
  it does not allege a secret meeting.
- No new survey or experiment.
- No claim built on a case study alone.
