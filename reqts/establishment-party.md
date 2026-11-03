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

### Reconciling with Essay 1 (James, 2026-11-02)

> It's not that the establishment wins. It's that the establishment wins by virtue
> of being the group in control in both parties, so no matter which party wins the
> election, the establishment is always in power.

Essay 1's finding stands: the candidate cast as the establishment loses
presidential generals. This essay adds that the loss changes little, because the
winner governs with an Establishment-held Congress and Establishment-held
committees in both parties. The central testable claim is C0 below.

### The bridge from Essay 1 (James, 2026-11-03, quoted from dictation)

> In order to win the elections, candidates have to cast themselves as an
> outsider. But then the question is, can they, from within the system as
> president, actually disrupt the systems of power?

> [Trump] has disrupted it but it is disrupting for the sake of consolidation not
> disrupting for the sake of pushing power back to the people.

> As anti-establishment candidates join, they ... have to operate at least
> temporarily during the transition period within a system that only rewards
> establishment players. So AOC has had to "play ball" with the establishment. As
> has Thomas Massie and Marjorie Taylor Greene.

> While essay one talks about how to win the general from a positioning
> perspective as president, it does not necessarily mean that even a candidate
> that wins is going to disrupt the establishment in the way that is necessary,
> or that the position of power doesn't ultimately corrupt them into being yet
> another establishment figure.

James's Obama example: hope and change, then one step forward and two back; the
ACA left for-profit incentives intact and still became a liability that the
Koch network used to fund the Tea Party.

So the essay has three outcomes for an outsider who wins, each with its own test:
**absorbed** (C10), **consolidates** (C9), or **blunted** (C11, Obama). Essay 1
answers "how does an outsider win?" This essay answers "what happens after?"

### C9 · Disruption that consolidates: power moves to the presidency, never to voters
- **Chart:** two lines by year, 1981 to 2025. Public laws enacted per Congress
  (falling) and executive orders plus national-emergency declarations per year.
  Annotate the 2025 surge.
- **Data:** CAP US executive orders (local, 4,831 orders, 1945 to 2025; check 2025
  completeness against the Federal Register API); Brennan Center list of national emergencies; CAP and
  congress.gov public-law counts.
- **Caveat to print:** raw executive-order counts were far higher under FDR and
  Truman; the post-1981 window is chosen because CAP law coding starts there for
  C0, and the chart says so. Order counts also miss memoranda and proclamations.
- **Refuted if:** the ratio of executive actions to public laws shows no upward
  trend across the window.
- **Out of scope for data:** Supreme Court rulings and state election changes
  enter as cited case examples (with primary citations), never as a chart.

### C10 · Outsiders who win get absorbed
- **Chart:** each insurgent member's yearly vote share with their party's
  leadership, from their first term onward, against the caucus median. Prediction:
  insurgents converge toward the caucus over their tenure. Named lines for AOC and
  Massie; MTG if her record fits.
- **Insurgent (mechanical, Claude's call):** won a primary against a sitting
  incumbent or against the leadership-backed candidate, 2010 to 2022.
- **Data:** Voteview individual votes (local); leadership vote = the party leader's
  or whip's vote on each roll call.
- **Known counterexample to face:** Massie has voted against his party's majority
  more than almost any Republican for years. If he never converged, he is the
  counterexample, and the essay says so rather than listing him as absorbed.
- **To verify:** Marjorie Taylor Greene's current status (Claude recalls a
  resignation announced in late 2025; unconfirmed).
- **Refuted if:** insurgents' leadership-agreement scores show no convergence
  toward the caucus median after their first two terms.

### C12 · Cheap votes and costly votes
James's game-theory point: a member can vote for a disruptive bill that is sure to
fail, then tell voters "we just don't have the votes." Political scientists call
this position-taking (Mayhew 1974, *Congress: The Electoral Connection*).
- **Chart:** for each member, support for anti-establishment measures on safe votes
  (outcome certain) against support on pivotal votes (outcome in doubt). Members on
  the diagonal mean what they vote; members far above it vote for change only when
  the vote cannot pass. Named dots for the members James cites.
- **Data:** Voteview individual votes and margins; scorecard key-vote positions
  (section 2, behavior marker).
- **Refuted if:** members' support rates on pivotal votes match their support on
  safe votes, within 5 points on average.

### C13 · Just enough to lose
- **Chart:** distribution of the losing margin on anti-establishment measures under
  unified party control, against all other failed votes. Prediction: redistributive
  measures fail by one to three votes far more often than chance, with defectors
  from the governing party supplying exactly the shortfall (the "rotating villain":
  Lieberman on the public option, Manchin and Sinema on the filibuster and Build
  Back Better).
- **Second panel:** each decisive defector's district or state lean (Cook PVI).
  Defectors from safe seats cannot claim their voters made them do it.
- **Data:** Voteview; Cook PVI; scorecard positions.
- **Alternative explanations to print:** Krehbiel's pivotal-politics model expects
  close outcomes because leaders bring bills to the floor only near the pivot; Cox
  and McCubbins's negative agenda power means bills sure to lose rarely get a vote,
  so failed votes are few. The essay reports the sample size and lets a small n
  stay small.
- **Refuted if:** losing margins on redistributive measures look like losing margins
  on other measures, or the decisive defectors rotate no more than random draws from
  the caucus would.

### C14 · Single-issue money across both parties: AIPAC and its peers (James, 2026-11-03)
> [AIPAC] is a massive wealth operation that works towards both parties ... so much
> so that the congressional support of Israel is ... deeply unpopular, but yet
> still enacted. ... They are one of the forces that creates this pressure to
> conform to existing power structures that fund weapons and weapon sales.

- **Chart A, the opinion gap:** public support for continued or unconditional
  military aid to Israel (by party), against the share of Congress voting for it.
  Votes: Senate joint resolutions of disapproval on arms sales (Sanders, 2024 and
  2025) and House and Senate supplemental aid votes. Polls: Gallup, Pew, and any
  poll asking about weapons aid specifically, with question wording printed.
- **Chart B, primary money:** AIPAC PAC and United Democracy Project (its super PAC)
  spending by race and party, 2022 to 2026, with win rates. Includes the 2024 Bowman
  and Bush primaries.
- **Chart C, the peer panel (Claude's recommendation):** the same spending and win
  rate for other single-interest super PACs working both parties: Fairshake
  (crypto), defense contractors' PACs, pharma. This puts AIPAC inside the thesis
  (concentrated money disciplines both parties) and blocks the reading that one
  group is uniquely in control, a framing hostile readers will attack as an
  antisemitic trope. The essay names AIPAC as a lobby and a set of PACs, measured
  on the same terms as every other lobby.
- **Data:** FEC (AIPAC PAC committee filings; UDP independent expenditures);
  OpenSecrets lobbying and outside-spending pages; Voteview for the roll calls;
  DSCA arms-sale notifications.
- **Precision rules:**
  - "Deeply unpopular" depends on the question. Overall sympathy for Israel,
    approval of the Gaza campaign, and support for weapons aid poll differently,
    and Republicans still poll supportive on most of them. The essay cites the
    specific question and its number, never "Americans oppose."
  - AIPAC PAC (direct contributions, began 2021) and UDP (super PAC, independent
    spending, mostly in Democratic primaries) work differently and get reported
    separately.
  - All dollar figures, vote counts, and poll numbers here are unverified; Claude
    recalls UDP spent eight figures against Bowman in 2024 and that a majority of
    Senate Democrats backed a 2025 disapproval resolution. Both get sourced first.
- **Refuted if:** the share of members voting for weapons aid tracks the share of
  their own party's voters who support it, within 15 points.

### C15 · Billionaires split on social issues and unite on money
- **Chart:** share of roll calls where billionaire-linked groups take one side,
  by topic set (section 2a): economic structure vs social. Prediction: near-
  unanimous on taxes, finance, and regulation; split on abortion, guns, and
  immigration. If true, the parties' loud fights sit exactly on the issues where
  billionaires have nothing collective at stake.
- **Headline number:** across all votes with a billionaire side, the share the
  billionaire side won, against the share the side with majority public support
  won (C4 polls).
- **Prior work:** Page, Seawright & Lacombe (2018), *Billionaires and Stealth
  Politics*: the 100 wealthiest Americans rarely state positions publicly but give
  heavily. Gilens's "affluent" are the 90th income percentile, so his results say
  nothing about billionaires directly; the essay says so.
- **Refuted if:** billionaire-linked groups split on economic-structure votes about
  as often as on social votes.

### C11 · Obama: the blunted outsider (case study)
- **Chart (one card):** 2008 promises against outcomes on the structure agenda:
  ACA design vs the public option, bank bailout vs prosecutions, drone strikes vs
  troop levels.
- **Data:** ACA legislative history (CBO, Congressional Record on the public-option
  vote); Bureau of Investigative Journalism drone-strike counts; DoD troop levels;
  Tea Party funding from Mayer (2016) and Skocpol & Williamson (2012), both already
  cited in Essay 1.

> **[Claude: honest correction]** Two parts of the Obama example will not survive a
> hostile reviewer as dictated. "Wars heightened": the Afghanistan surge, Libya, and
> drone strikes rose, but US troops in Iraq and Afghanistan combined fell from about
> 180,000 (2009) to under 15,000 (2016), and real defense outlays fell after 2011
> (from memory; verify against DoD and CBO before use). "Economies struggled":
> unemployment fell from 10.0% (Oct 2009) to 4.7% (Jan 2017). Suggested rewrite:
> "The wars changed shape rather than ending: fewer troops, more drones, a new war
> in Libya, and the recovery went to the banks first and to wages last." The second
> half needs its own number (share of 2009 to 2012 income gains to the top 1%,
> Saez; verify).

### C0 · Party control changes the social agenda and leaves the structure agenda alone
- **Chart:** enacted economic-structure laws (section 2a) by Congress, 1981 to
  2024, colored by which party held the trifecta. Beside it, the same for social
  laws. Prediction: structure output (tax cuts, deregulation, industry provisions)
  continues at similar rates under unified Democratic and unified Republican
  control; social output swings with the party.
- **Data:** Comparative Agendas Project US public laws (topic-coded); Voteview
  for passage margins; party control by Congress from the House and Senate
  historians.
- **Direction check:** topic counts cannot tell a tax cut from a tax increase.
  Claude hand-codes direction only for the top laws by CBO score (fixed list,
  coded before plotting) and reports agreement with a second coder pass.
- **Refuted if:** the share of structure laws moving toward incumbent industry
  differs by more than 15 points between unified D and unified R Congresses.

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

**Behavior marker: the risk-weighted vote score (James, 2026-11-03).** Entry
markers cannot score Fetterman, who entered as an insurgent. A second, separate
score covers behavior in office. James's rule:

> Taking a political stance means nothing. Voting for something that does not
> change an establishment structure ... does not shift or redistribute wealth or
> power from the empowered to the powerless is not an anti-establishment vote.
> ... Voting for bills that don't pass, that disrupt the establishment, don't do
> anything. So there needs to be some element of political risk.

The score therefore counts a vote only when two things hold:

1. **The vote has a billionaire side (James, 2026-11-03).**
   > If you look at all the stakeholders, does the wealthiest, most connected
   > stakeholder win or lose? ... I'm talking like very wealthy people, not
   > millionaires but billionaires.

   Each vote gets a "billionaire side" from the first source that covers it:
   - **Tax bills:** the Joint Committee on Taxation or Tax Policy Center
     distribution table. If the top 0.1% gets a larger share of the benefit than
     its share of income, the yes vote is the billionaire side; if smaller, no.
   - **Other bills:** organization positions (support or oppose) from MapLight's
     bill-position data, with each organization tagged as billionaire-linked when
     a Forbes 400 member owns or controls it, funds it as a top donor (Americans
     for Prosperity, Fairshake), or sits on its board. Lobbying spend per bill
     from LobbyView (bill-level lobbying links) weights the stakes. (To verify:
     MapLight's coverage years and whether its archive is still downloadable;
     LobbyView access.)
   - **Fallback:** US Chamber of Commerce and Business Roundtable key-vote
     positions, with the AFL-CIO and Public Citizen as the opposing pole.

   **When billionaires split, the vote has no billionaire side.** Billionaire-linked
   groups oppose each other on some votes (Koch network vs Soros-funded groups, on
   immigration or abortion). Those votes are coded "split" and left out of the
   score. The split rate is reported as its own finding (C15).

2. **The vote carries risk.** Each vote is weighted by how close it came to
   deciding the outcome: final margin within 5 votes in the House or 3 in the
   Senate, cloture within 3 of 60, or the member's own party split. A vote on a
   bill that was certain to fail or certain to pass gets near-zero weight.

Procedural votes (cloture, motions to table, rules, motions to recommit) count in
full. Leadership kills popular measures there, where few voters look.

C5, C6, C8, C10, C12, and C13 use the behavior score; C2 uses the entry score.

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

- **Length:** 2,500 to 4,000 words, up to 16 candidate charts (cut to the strongest 8 after results) (one per surviving claim; C8 may be one combined card). Essay 1 is far longer.
- **Shape:** bridge from Essay 1 (outsiders win, then what?), hook (C1), the core claim (C0), the three fates of a winning outsider (C9, C10, C11), how they get in (C2), what they do (C3, C4, C5), why party
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

Answered 2026-11-02:
- Publication: both. A site page is canonical; a Substack post links to it with the
  PNG cards inline.
- Essay 1 reconciliation: James's wording in section 1.
- Scope: Republicans and Democrats named equally.
- Plan approved to start steps 1 and 2.

Raw data goes under the main checkout, `/Users/james/Sites/personal/center-basher/data/raw/<dataset>/`,
so it outlives this worktree.

## Non-goals

- No claim of coordination or conspiracy. The essay shows incentives and outcomes;
  it does not allege a secret meeting.
- No new survey or experiment.
- No claim built on a case study alone.

## 8 · Data pulled (2026-11-02)

All under `/Users/james/Sites/personal/center-basher/data/raw/`.

| Dataset | Files | Coverage |
|---|---|---|
| Voteview | `voteview/HSall_members.csv` (5.9M), `HSall_rollcalls.csv` (28.4M), `HSall_parties.csv`, `HSall_votes.csv` (669M) | 1st to current Congress |
| Comparative Agendas, US | `comparative_agendas/us_executive_orders_26.1.csv` (4,831 orders, 1945 to 2025), `us_public_laws_20.1.csv` (21,968 laws), `us_public_laws_titles_20.4.csv` (36,577 titles), `us_congressional_bills_19.3.csv` | Laws 1948 to 2022 (80th to 117th/118th Congress) |

The CAP laws file ends at 2022, so C0 runs 1981 to 2022 unless the 118th Congress
is coded by hand. The CAP files are Latin-1 encoded (`encoding='latin-1'`).

Still to pull: MapLight bill positions, LobbyView, Forbes 400 list, JCT and TPC distribution tables; FEC filings for AIPAC PAC, UDP, Fairshake; DSCA arms-sale notifications; Israel aid polling; interest-group scorecards (Chamber of Commerce, AFL-CIO, Club for Growth, Public Citizen), Cook PVI, Gallup congressional approval, Vital Statistics reelection rates,
Brookings Primaries Project, FEC bulk, DIME, OpenSecrets revolving door, Gilens 2012.
