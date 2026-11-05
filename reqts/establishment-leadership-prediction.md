# Pre-registered prediction: the 2026-27 Democratic leadership races

Frozen 2026-11-05, two days after the midterms and before any caucus vote. The
git commit that adds this file is the timestamp. Edits after that commit go in
the "Changes after freeze" log at the end, and none may change a prediction or
its resolution rule.

## Situation on 2026-11-05

- Democrats won both chambers on 2026-11-03. AP called the Senate on election night and the House on 2026-11-04 [1][2].
- The Senate Democratic caucus stands at 54, with Mississippi and Alaska uncalled [3].
- Chuck Schumer said on 2026-11-04: "I'll be reelected as majority leader" [4].
- Five Democratic Senate winners or nominees have signaled opposition to Schumer [3][5]:
  - Troy Jackson (ME): "I told Senator Schumer that I'm going to support somebody else."
  - Peggy Flanagan (MN), through a spokesperson: "that's not Chuck Schumer."
  - Adam Hamilton (KS): "we need new leadership."
  - Juliana Stratton (IL) has called for new leadership since March 2026.
  - Abdul El-Sayed (MI) prefers Chris Van Hollen.
- Chris Van Hollen told the Washington Post he will not run for leader [6].
- No sitting senator has announced a challenge to Schumer [6].
- Hakeem Jeffries launched his Speaker bid by letter on 2026-11-04 [7].
- Jeffries' leadership team is expected to run unopposed, with Joe Neguse as assistant speaker [8].
- Punchbowl reports House Democratic leadership elections on 2026-11-18. Fox reports mid-December [8][9].
- The Speaker floor vote is on 2027-01-03 [7].

## Thesis link

Plan §0 and claim C10 (`reqts/establishment-party.md`) predict four things about a party that has just won:

- **M1 Continuity.** The incumbent leaders keep their posts. Insurgent votes are too few to remove them.
- **M2 Absorption.** Leaders win dissidents over with posts and process gestures, and leave power structures in place.
- **M3 Seniority.** Committee gavels go by seniority, so the chairs are the members who have held ranking posts longest.
- **M4 Structure untouched.** Popular structural reforms and costly breaks with donor-backed policy do not become law.

## Predictions

Each prediction carries Claude's probability as of the freeze. P is the chance
the prediction comes true.

| ID | Mechanism | Prediction | Resolves by | Source that resolves it | P |
|---|---|---|---|---|---|
| S1 | M1 | Chuck Schumer wins the Senate Democratic caucus vote for leader in the first leadership election of the 120th Congress. | 2027-01-31 | Caucus announcement; press | 0.85 |
| S2 | M1 | No senator who served in the 119th Congress announces a candidacy against Schumer for leader before that vote. | Caucus vote | Press | 0.80 |
| S3 | M2 | Before or at the caucus vote, Schumer announces a concession to dissidents: a new or reassigned leadership or steering post for a senator-elect or a progressive senator, or a written agenda pledge. | Caucus vote | Press; caucus release | 0.70 |
| S4 | M1, M2 | Senate Democrats do not adopt term limits for their leader in 2027. | 2027-12-31 | Caucus rules; press | 0.85 |
| S5 | M4 | The Senate does not abolish the legislative filibuster or create a new statutory carve-out from it in 2027. | 2027-12-31 | Senate record | 0.85 |
| H1 | M1 | Hakeem Jeffries is elected Speaker on the first ballot. | 2027-01-03 | House Clerk roll call | 0.95 |
| H2 | M2 | Five or fewer Democrats vote for someone other than Jeffries, or vote present, on the first Speaker ballot. | 2027-01-03 | House Clerk roll call | 0.80 |
| H3 | M1 | Jeffries, Katherine Clark, and Pete Aguilar win their caucus races without an opponent. | Caucus vote | Caucus release; press | 0.80 |
| H4 | M3 | Of the House standing committees whose 119th-Congress Democratic ranking member returns in the 120th, at least 90% are chaired by that same member. | 2027-02-28 | House Clerk committee rosters | 0.80 |
| H5 | M4 | No law that bars members of Congress from owning or trading individual stocks is enacted in 2027. | 2027-12-31 | congress.gov | 0.65 |
| H6 | M4 | Neither chamber passes a joint resolution of disapproval blocking an arms sale to Israel in 2027. | 2027-12-31 | congress.gov | 0.90 |

## Scoring

- Each prediction resolves true or false on its date. A prediction whose event never happens (for example, no caucus vote by 2027-01-31) is scored false and its row gets a note.
- Claude reports the Brier score across all 11 predictions.
- **Thesis refuted for this case if** three or more predictions resolve false in the anti-establishment direction. Examples: Schumer loses or withdraws, Jeffries needs a second ballot, the filibuster falls, or a stock-trading ban becomes law.
- A false prediction in the pro-establishment direction counts against Claude's calibration and leaves the thesis untouched. Example: Schumer makes no concession because he does not need one.

## Known weaknesses

- The Senate caucus ballot is secret. S1 resolves on the announced result, and no prediction depends on how one senator voted.
- S1, H1, and H3 are high-probability calls that the conventional view already expects. They test M1 weakly. H2, H4, H5, and S3 carry most of the information.
- H5 depends on a White House signature as well as Congress. A veto would make H5 true for a reason other than M4. If that happens, the row gets a note and the score keeps the result.

## Sources

1. NPR, "2026 election: Democrats win full control of Congress," 2026-11-03. https://www.npr.org/2026/11/03/g-s1-149526/2026-midterms-congress-balance-of-power
2. CNBC, "2026 midterm election results," 2026-11-04. https://www.cnbc.com/2026/11/04/2026-midterm-election-results-live-updates.html
3. Fox News, "Chuck Schumer faces leadership rebellion from incoming Democrats." https://www.foxnews.com/politics/schumer-faces-mutiny-from-newly-elected-senate-dems-party-prepares-seize-power
4. Roll Call, "'I'll be reelected as majority leader,' Schumer says," 2026-11-04. https://rollcall.com/2026/11/04/will-be-reelected-as-majority-leader-schumer-says/
5. The Lever, "Will The Blue Wave Come For Schumer?" https://www.levernews.com/would-a-blue-wave-put-schumers-leadership-on-the-line/
6. Washington Times, "Schumer confident of reelection as Senate majority leader," 2026-11-05. https://www.washingtontimes.com/news/2026/nov/5/schumer-confident-reelection-senate-majority-leader-amid-left-wing/
7. NPR, "Hakeem Jeffries is poised to become the first Black speaker of the House," 2026-11-04. https://www.npr.org/2026/11/04/g-s1-150030/hakeem-jeffries-speaker-of-the-house-midterms
8. Punchbowl News, "Hakeem Jeffries: Vote for me as speaker." https://punchbowl.news/article/house/jeffries-speaker/
9. Fox News, "Hakeem Jeffries announces bid for House speaker after midterm victory." https://www.foxnews.com/politics/hakeem-jeffries-declares-bid-house-speaker-after-gops-midterm-massacre

Claude read the sources above through search summaries and page fetches on 2026-11-05. The Axios copy of Jeffries' letter returned HTTP 403 and has not been read.

## Resolution log

| ID | Date | Result | Evidence |
|---|---|---|---|

## Changes after freeze

- 2026-11-05: James rejected this list. It gives probabilities with no sentiment research, base rates, scenarios, or backcasting behind them. The list stays here unchanged as a record and will still be scored. The scenario forecast built under `reqts/establishment-leadership-forecast-method.md` supersedes it as the essay's prediction.
