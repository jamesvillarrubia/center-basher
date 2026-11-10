# Scenario forecast: the 2026-27 Democratic leadership races

Status: FROZEN 2026-11-05 (Claude column). The commit that sets this line is the timestamp. James's column gets its own dated commit. Changes after freeze go only in an update log appended below section 6. Steps
5 to 7 of `reqts/establishment-leadership-forecast-method.md`. Evidence files:
`sentiment.md`, `base_rates.md`, `playbook.md` in this folder.

## 1 · Vote math the scenarios rest on

**House floor, 2027-01-03.** The Speaker needs a majority of members voting for a
named person. With D Democrats, R Republicans voting for their own nominee, and
k Democrats voting for someone else, Jeffries wins ballot 1 when D − k > (D + R)/2.

- At D = 255 and R = 180, Jeffries survives k ≤ 37. Jeffries himself expects 255 or more. CBS estimates 251 to 268. At D = 251, he survives k ≤ 33.
- At D = 240 and R = 195, he survives k ≤ 22.
- A "present" vote lowers the threshold, so present votes hurt him about half as much as votes for another person.
- Named House holdouts as of 2026-11-05: 9 (`sentiment.md` §2).
- The largest Democratic floor defection since 1923 is 15 (Pelosi 2019, `base_rates.md` §1).

**House caucus, 2026-11-18/19 or mid-December (unconfirmed).** The vote is a secret
ballot, and the nominee needs a majority of the caucus. Comparable votes:

| Year | Leader | Result |
|---|---|---|
| 2010 | Pelosi | 150-43 |
| 2016 | Pelosi | 134-63 |
| 2018 | Pelosi | 203-32 |

**Senate caucus, early December (Roll Call).** The vote is a secret ballot, and Schumer needs a
majority of a 54-or-more caucus, so at least 28 votes.

- Against him: 5 senators-elect.
- Uncommitted or calling for new leadership: 5 more (Talarico, Pappas, Van Hollen, Slotkin, Markey).
- No incumbent has said they will vote against him.
- To lose, Schumer needs about 27 no votes. That means most of the 10 newcomers and dissidents plus about 17 incumbents who have said nothing publicly.

## 2 · House scenarios

Rules that sort outcomes:

- **Concession:** a written or announced commitment, made before the floor vote to members who are holding out or to the Progressive Caucus. It counts only if it is one of:
  - (a) a rules-package change they asked for;
  - (b) a new leadership or steering post for one of them;
  - (c) a floor vote on one of their named demands (Medicare for All, a stock-trading ban, conditions on Israel aid, corporate PAC money);
  - (d) a term limit on the Speaker.
- **Real or symbolic** (`playbook.md`): (a) and committee gavels count as real. A floor vote on a bill certain to die counts as symbolic.

| ID | Scenario | Mechanism | Thesis reading |
|---|---|---|---|
| H-A | Clean hold | Jeffries runs unopposed in caucus, loses ≤5 Democrats on the floor, and makes no concession. | Weak confirmation |
| H-B | Absorption | Jeffries wins ballot 1, but either a declared caucus challenger, 6 or more floor defections, or a concession happens along the way. | Strong confirmation |
| H-C | Floor fight | Jeffries fails ballot 1 and wins a later ballot after a concession. | Confirmation, but James's read is right that the party broke ranks in public |
| H-D | Insider replacement | Jeffries withdraws or loses, and the Speaker is a current leadership member or committee ranking member. | Survives with a note |
| H-E | Insurgent replacement | The Speaker is a member whom 3 or more named holdouts backed by name before the vote. | Fails for this case |

### Backcast signposts (House)

| Signpost | Date | If yes, moves toward |
|---|---|---|
| A declared challenger files for the caucus Speaker nomination | Before the caucus vote | H-B, H-D, H-E |
| Jeffries' caucus share is under 80% | Caucus vote | H-B, H-C |
| A public letter where N Democrats pledge not to vote Jeffries on the floor: N ≥ 10 | By 2026-12-31 | H-B |
| The same letter reaches N ≥ the survival number k (about 22 to 37) | By 2026-12-31 | H-C |
| Jeffries announces a concession of type (a) to (d) | Before 2027-01-03 | H-B |
| The Progressive Caucus chair or a named holdout gets a new leadership post | Before 2027-01-03 | H-B |
| Jeffries faces a scandal, health event, or withdrawal | Any time | H-D |

## 3 · Senate scenarios

Concession rule: one of these, announced before the caucus vote:

- a new or reassigned leadership or steering post for a senator-elect or a dissident;
- a written agenda pledge to the dissidents;
- a commitment to a filibuster change;
- an announced end date for Schumer's leadership.

| ID | Scenario | Mechanism | Thesis reading |
|---|---|---|---|
| S-A | Clean hold | Schumer is re-elected with no declared opponent and no concession. | Weak confirmation |
| S-B | Absorption | Schumer is re-elected after a declared challenge or a concession. | Strong confirmation |
| S-C | Insider succession | Schumer steps aside or loses, and the leader is a senator whom no more than 2 of the opposing senators-elect named as their pick. | Survives with a note |
| S-D | Insurgent coalition | The leader is a senator whom 3 or more of the opposing senators-elect named as their pick before the vote, for example Van Hollen. | Fails for this case |

### Backcast signposts (Senate)

| Signpost | Date | If yes, moves toward |
|---|---|---|
| Schumer announces he will not run, or names an end date | Before the caucus vote | S-C, S-D (or S-B if he only names an end date and wins) |
| A sitting senator declares against Schumer | Before the caucus vote | S-B, S-D |
| Five or more incumbent senators publicly oppose Schumer | Before the caucus vote | S-C, S-D |
| Three or more opposing senators-elect name the same alternative | Before the caucus vote | S-D |
| Schumer announces new posts or a written agenda for newcomers | Before the caucus vote | S-B |
| The caucus postpones its leadership vote | Early December | S-B, S-C |

## 4 · Probabilities (Claude, draft)

Each starts from the base rate, and each adjustment is written down with its size.

### House

**Base:** right after a party won the majority, 1 of 9 Speaker elections went past ballot 1 (2023). The median shortfall in those elections was 2, and 2 of 9 reached 10 or more defections (`base_rates.md` §1). Base: P(ballot-1 win) ≈ 0.89. P(≥10 defections) ≈ 0.22. P(sitting leader keeps the post | organized effort) = 6 of 9.

**Adjustments:**

1. **Majority size.** At about 255 seats, Jeffries can lose 37 votes. Every past Democratic defection is 15 or fewer. This raises P(ballot 1) to about 0.96.
2. **Holdouts and party mood.** Nine named holdouts, and 59 to 62% of Democrats unhappy with their leaders (Pew 2025, Reuters/Ipsos 2025). This raises P(a visible fight: challenger, 6 or more defections, or a concession) from the base of about 0.25 to about 0.50.
3. **Closest analog.** Pelosi in 2018-19: a new majority, an organized rebel letter of 16, and a term-limit concession, ending in a ballot-1 win with 15 defections. That pattern is H-B.
4. **Jeffries' record.** `playbook.md` §7 found no concession to progressives since 2025. That lowers the chance he concedes before he has to, and moves some H-B weight to H-A.
5. **No challenger exists**, and New Democrat leaders back him. This keeps H-D and H-E small.

| Scenario | P |
|---|---|
| H-A Clean hold | 0.42 |
| H-B Absorption | 0.47 |
| H-C Floor fight | 0.04 |
| H-D Insider replacement | 0.05 |
| H-E Insurgent replacement | 0.02 |

### Senate

**Base:** no sitting Senate party leader has lost a caucus vote in the records found (`base_rates.md` §3). One leader in 28 left under pressure (Lott 2002, by resignation). McConnell beat a declared challenger 37-10. Base: P(sitting leader stays) ≈ 0.95.

**Adjustments:**

1. **Sentiment far worse than any case in the base set.**
   - Politico, June 2026: 47% of Democrats say Schumer should not remain, against 28% who say he should.
   - CNN/SSRS: his favorability among Democrats fell from 46% to 31% between January and April 2025 (verification.md corrected the year from 2026).
   - Five senators-elect oppose him and five more are uncommitted.
   This lowers P(stays) to about 0.75. The CNN reading is 19 months old, so the Politico June 2026 number carries most of this adjustment.
2. **Age and exit path.** Schumer turns 76 this month. An announced end date or a handoff is the cheapest exit, and it matches the Lott and Pelosi patterns. This moves weight to S-C and to S-B with an end date.
3. **No incumbent opposition on record, and AP's interviews (2026-10-12).** More than a dozen senators expected him to win easily "if Democrats gain seats". Democrats gained seats. A secret ballot hides defection, so the AP signal is weaker than it looks. This holds P(stays) near 0.72.
4. **The only named alternative, Van Hollen, "has indicated that he does not intend to run"** (Common Dreams). El-Sayed backed Van Hollen on Nov 5 anyway (Al Jazeera). A draft of Van Hollen against his stated intent is the main path to S-D, and that path keeps S-D small.

| Scenario | P |
|---|---|
| S-A Clean hold | 0.24 |
| S-B Absorption | 0.48 |
| S-C Insider succession | 0.19 |
| S-D Insurgent coalition | 0.09 |

### James

| Scenario | James P |
|---|---|
| H-A to H-E | (to fill) |
| S-A to S-D | (to fill) |

## 5 · Resolution and scoring

- **House** resolves on 2027-01-10, which covers the floor vote and the rules package.
- **Senate** resolves at the caucus vote, or on 2027-01-31 if no vote has happened.
- Each forecaster gets a multi-class Brier score on the scenario that happens.
- Each signpost that fires gets a dated entry in an update log with new probabilities. Scoring uses the frozen probabilities, and the update log is reported beside them.

## 6 · Checks before freeze

- **Done 2026-11-05:** `verification.md` checked 70 items against raw pages: 47 exact, 6 paraphrase, 7 wrong, 1 summary-only, 9 not found. The corrections are applied in `sentiment.md` and here. No probability changed: the corrected items moved the evidence for each adjustment, but none moved its direction.
- **Working House caucus date:** Nov 18, from Bloomberg Government (two unnamed people) and ABC7. Fox says mid-December. Nothing official has been found.
- **Working Senate caucus date:** early December, from Roll Call ("likely") and Al Jazeera ("next month").
- **House seats:** CBS estimates 251 to 268. The survival number k runs from 33 to 50 across that range.

## 7 · Update log

### 2026-11-05 · James's call and the card's headline claim

**James's call (his words, 2026-11-05):** "I think there will be new candidates."

**How it is scored:** true if, in either caucus vote, at least one candidate other than the sitting leader is on the ballot. That means a challenger to Jeffries for the Speaker nomination, or to Schumer for leader, or any candidate for the post if Schumer steps aside. James may correct this reading in a later dated entry.

**Claude's numbers for the card's four calls.** The first and fourth are new estimates made today, before any caucus vote. The middle two come from the frozen section 4.

| Call | Claude P | James | Resolves |
|---|---|---|---|
| A candidate other than the sitting leader runs in either caucus vote | 0.55 | yes | Senate caucus vote |
| Jeffries is elected Speaker (H-A + H-B + H-C) | 0.93 | (to fill) | 2027-01-10 |
| Schumer stays Senate Democratic leader (S-A + S-B) | 0.72 | (to fill) | caucus vote or 2027-01-31 |
| No rebel demand becomes a binding rule, a binding leader term limit, or a bill that passes the chamber floor | 0.75 | (to fill) | 2027-01-31 |

**Basis for 0.55:**
- A House challenger has run in 2 of the 3 past Pelosi revolts (2010 Shuler, 2016 Ryan; none in 2018). That rate drops to about 0.35, because no one has declared yet and Van Hollen-style drafts are rarer in the House.
- Senate: the S-B, S-C and S-D paths each involve another candidate, about 0.40 combined.
- The two races move together, so P(at least one) is about 0.55.

**Basis for 0.75:** 1 of 12 past revolts ended in a concession that moved real power (`base_rates.md` §4, McCarthy 2023). Pressure now is higher than the base set, which lowers the estimate from 0.92 to 0.75.

### 2026-11-10 · Headline review (no signpost fired; unscored update)

**National standing (NBC News, Oct 28-30, 2026, 1,000 registered voters, ±3.1, released Nov 1):**
- Jeffries: 18% positive, 35% negative. About 47% of voters gave no rating, so Jeffries is more unknown than disliked.
- Schumer: 13% positive, 53% negative.
- Democratic Party: 29% positive. Republican Party: 38% positive.
- Generic ballot: Democrats 52%, Republicans 45%. NBC: the lead is "propped up strongly by anti-Republican sentiment, not warm feelings for Democrats."

**Senate developments since freeze:**
- AP (via Scripps/KRIS 6, week of Nov 9): "Maryland Sen. Chris Van Hollen is considering a challenge to Schumer, according to a person familiar with his thinking", and "he is open to a run." This reverses his Nov 5 statement to the Washington Post. He has not declared, so the "sitting senator declares" signpost has not fired.
- AP, same article: Sherrod Brown supports Schumer. Kirsten Gillibrand praised him.
- Sen. Richard Blumenthal declined to endorse Schumer (reported by John Craven on X, Nov 9; relayed by RedState). Claude has not found a primary-outlet copy of his quote. Not counted toward the five-incumbent signpost until verified.
- Talarico still uncommitted. Slotkin has not ruled out a run (secondary reports).

**House developments since freeze:** no declared challenger; no caucus count; holdout list unchanged (Valdez, Avila Chevalier, Kiros still on record as uncommitted). Lawrence remains with Jeffries.

**Claude's updated (unscored) view.** Scoring uses the frozen numbers above.

| Item | Frozen | 2026-11-10 | Reason |
|---|---|---|---|
| S-A Clean hold | 0.24 | 0.18 | A named senator is now open to running |
| S-B Absorption | 0.48 | 0.47 | |
| S-C Insider succession | 0.19 | 0.21 | |
| S-D Insurgent coalition | 0.09 | 0.14 | Van Hollen is the senator El-Sayed already named |
| Schumer stays (S-A + S-B) | 0.72 | 0.65 | |
| A candidate other than the sitting leader runs | 0.55 | 0.62 | |
| House scenarios | unchanged | unchanged | No House signpost moved |
