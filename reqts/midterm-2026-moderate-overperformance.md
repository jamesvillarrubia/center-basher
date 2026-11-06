# 2026 midterms: the "moderates made the majorities" claim, recoded

Third Way and Neera Tanden credit the 2026 Democratic majorities to moderate nominees;
this file tests that claim against two alternative readings (who counts as
"moderate", and how much outside money each nominee faced) using race results, FEC
spending, and two independent codings of every nominee. It holds findings and
numbers only. Essay prose stays with James.

Data: `data/derived/midterm2026/races.csv`, codebook `data/derived/midterm2026/README.md`.
Scripts: `scripts/midterm2026/`. Check script: 82 passed, 0 failed (2026-11-05, fourth pass).
All vote counts are unofficial, as reported 2026-11-05, two days after the election.
California, Arizona, Utah and Alaska were still counting.

---

## Headline

- Under Third Way's coding, the moderate edge in competitive Senate races is large:
  +12.3 points ahead of Harris 2024, 95% CI +7.9 to +16.8, n = 11 [1].
- Under coding (b), pre-primary establishment backing, the same gap **shrinks** to +4.5
  points, CI −3.3 to +12.3, n = 14 [2]. On Third Way's own 11 races it is +7.4,
  CI −4.1 to +18.9 [3]. Against the statewide House vote it falls from +7.9 to +1.0,
  CI −3.7 to +5.7 [4].
- Within Third Way's seven "moderates", the four without pre-primary establishment
  backing (Talarico, Andrews, Hamilton, Turek) ran +21.7 ahead of Harris and +5.8 ahead
  of the House vote. The three Schumer-backed recruits (Ossoff, Cooper, Brown) ran +19.7
  and +4.0 [5].
- In House districts with a contested progressive-vs-moderate primary, neither coding
  shows a moderate edge: coding (a) −3.7 points, CI −10.8 to +3.5; coding (b) +2.0,
  CI −3.6 to +7.6; n = 30 [6].
- Adding starting name recognition (prior office held) and days on the campaign trail
  absorbs neither coefficient. Against the same rows without the controls, point
  estimates move by under 2.5 points in every specification but one: coding (b) on Third
  Way's 11 races against the House vote moves from +1.8 to +6.7, on two backed races and
  a CI of −29.8 to +43.3. Senate CIs widen sharply, because 10 to 13 races cannot carry
  five or six regressors (section 8) [30].
- Net outside spending against the Democrat has no measurable association with
  overperformance in either chamber: −0.08 points per dollar per vote in the Senate,
  CI −0.26 to +0.10 [7].
- Small n limits every model here. Eleven to fourteen Senate races cannot separate
  "moderate" from "red state" (section 3), and one race (Florida) carries most of the
  coding-(a) contrast at a given Harris margin.

---

## 1 · Third Way's numbers reproduce from the raw counts

Third Way published two memos: "Moderates Made Democratic Majorities" (Nov 4) and
"Center-Left Democrats Overperformed and Delivered the Majority" (Nov 5) [8].
Every race-level number checked reproduces within one point from CNN's counts and
2024 baselines [9]:

| Nominee | Third Way vs Harris | Computed | Third Way vs House Dems | Computed |
|---|---|---|---|---|
| Talarico (TX) | +26 | +25.8 | +6 | +6.2 |
| Andrews (SC) | +22 | +22.4 | +7 | +7.1 |
| Hamilton (KS) | +21 | +21.1 | +7 | +7.1 |
| Turek (IA) | +17 | +17.4 | +3 | +2.9 |
| Brown (OH) | +16 | +16.1 | +2 | +1.8 |
| Ossoff (GA) | +20 | +20.2 | +6 | +5.6 |
| Cooper (NC) | +23 | +22.9 | +5 | +4.5 |
| El-Sayed (MI) | | +8.4 | −2 | −1.8 |
| Flanagan (MN) | | +5.9 | −3 | −2.6 |
| Jackson (ME) | | −0.5 | −10 | −9.7 |

The governor comparisons also reproduce: Benson ran 3.8 points ahead of El-Sayed,
Klobuchar 2.7 ahead of Flanagan, Pingree 10.7 ahead of Jackson, Jolly 1.6 ahead of
Nixon [10]. House examples: Pulido +42.5 vs Harris in a Trump +17.9 district,
Cognetti +17.2, Ager +25.3 [11]. Third Way's count of 31 House flips by
moderate-endorsed candidates also reproduces: 29 from the NewDem and Welcome lists plus
the two cross-endorsees the memo names (Forstag, Poindexter) [12].

## 2 · Coding (b): pre-primary establishment backing

Coding (b) reuses the "Anointed" marker of `reqts/establishment-party.md` §2: backing
before the primary from Schumer, the DSCC/DCCC, Jeffries, or AIPAC/crypto/AI money.
Each Senate coding has a source in `races.csv` column `b_source` [13].

| Senate nominee | Third Way (a) | Backed pre-primary (b) | Basis |
|---|---|---|---|
| Ossoff | moderate | yes | incumbent |
| Cooper | moderate | yes | Schumer recruit and endorsement |
| Brown | moderate | yes | Schumer recruit |
| Turek | moderate | no (soft yes) | no formal endorsement; DSCC donor event, VoteVets $9.8M primary IE |
| Talarico | moderate | no | Schumer "does not have a preference"; PCCC endorsed him |
| Andrews | moderate | no | no recruitment found; Senate Majority PAC stayed out |
| Hamilton | moderate | no | no recruitment found |
| El-Sayed | leftier | no | Schumer, AIPAC, DMFI and UDP backed Stevens |
| Flanagan | leftier | no | Jeffries, AIPAC, DMFI backed Craig |
| Jackson | leftier | no | Schumer and DSCC backed Mills; Jackson nominated by convention after the primary |
| Nixon | leftier (implied) | no | leadership recruited Vindman |
| Peltola | not coded | yes | Schumer recruit |
| Pappas | not coded | yes | AIPAC and DMFI endorsement |
| Colom | not coded | no (soft yes) | Schumer recruiting meetings, no endorsement |

Three of Third Way's seven moderates were establishment-backed; four were not. None of
the four "leftier" nominees was establishment-backed. Coding (b) therefore splits
Third Way's moderate group, and the four non-backed moderates posted the larger
overperformances [5].

Regression results, Senate, OLS of `over_vs_harris` on the coding dummy, net outside
spending against the Democrat ($ per vote), and Harris 2024 margin, HC3 95% CIs [14]:

| Coding | n | coded 1 | Coefficient | 95% CI |
|---|---|---|---|---|
| (a) Third Way moderate | 11 | 7 | +12.3 | +7.9 to +16.8 |
| (b) backed, strict | 14 | 5 | +4.5 | −3.3 to +12.3 |
| (b) backed, strict, Third Way's 11 races | 11 | 3 | +7.4 | −4.1 to +18.9 |
| (b) backed, soft | 14 | 7 | +3.6 | −4.0 to +11.2 |
| (b) 2 of 3 markers (anointed, insider, funded) | 14 | 7 | +3.4 | −4.1 to +10.8 |

Against the statewide House vote as the baseline (Third Way's second metric), the
coding-(a) coefficient is +7.9, CI +4.7 to +11.0 (n = 11), and the coding-(b)
coefficient is +1.0, CI −3.7 to +5.7 (n = 13; Alaska dropped because an independent
outpolled the Democrat in its House race) [4].

**Verdict on coding (b): the moderate advantage shrinks.** It does not flip. Every
coding-(b) interval includes zero, and every point estimate stays positive.

## 3 · Terrain: "moderate" in coding (a) is nearly "red state"

All seven of Third Way's moderates ran in states Trump won by 2 to 18 points. Three of
its four leftier nominees ran in states Harris won or lost by under 2 points (MN, ME,
MI). Across all 31 Senate races with a Democrat-vs-Republican contest, overperformance
fell by 0.16 points for each point of Harris margin, CI −0.28 to −0.05 [15].

Democrats in uncompetitive Trump-won Senate races, whom no national group recruited or
labelled, also ran far ahead of Harris: +18.8 on average (AL, AR, KY, LA, OK, TN, WV,
WY; n = 8), against +20.8 for Third Way's seven moderates [16]. Wess (AL) ran +21.2,
Fetty Anderson (WV) +21.5, Davis (LA) +20.3. Uncompetitive Harris-won races averaged
+14.2 (n = 9).

The steelman holds on Third Way's second metric. Against the statewide House vote,
which nets out the state's environment, the uncompetitive red-state Democrats ran −0.3
on average, while Third Way's moderates ran +5.0 and its leftier nominees −3.7 [16].
Something specific to the seven competitive red-state campaigns added about five
points over the House ticket. Coding (b) shows that the four non-establishment
campaigns among them added more (+5.8) than the three establishment ones (+4.0) [5].

Opponents differ too. Jackson faced Collins, whose personal overperformance Third
Way's own endnote cites. Talarico faced Paxton. Neither difference is modelled here.

## 4 · House

**National baseline.** Across all 417 House races with a Democrat-vs-Republican
contest, the Democrat ran +14.4 points ahead of Harris on average; +14.5 in the 233
Trump-won districts; +15.5 across the 42 districts Democrats flipped from Republican
incumbents [17]. Third Way's "15 points ahead of Harris" for its endorsed flippers
equals the average for every Democrat on the ballot.

**Flips.** The 31 moderate-endorsed flippers ran +15.0 ahead of Harris; the other 11
flippers ran +17.0. Controlling for Harris margin, the moderate coefficient is −1.5,
CI −7.7 to +4.7. Restricting to races at least 90% counted (n = 34, dropping most
California seats), it becomes +4.3, CI −0.6 to +9.2 [18]. The sign depends on
California's uncounted vote, so this comparison settles nothing yet.

**Contested-primary districts (the brief's House scope).** 33 districts meet the rule
in the codebook; 30 had a Democrat-vs-Republican general [19]:

| Coding | n coded 1 / 30 | Coefficient | 95% CI | With incumbency control |
|---|---|---|---|---|
| (a) moderate (NewDem / Welcome / Blue Dog endorsed) | 12 | −3.7 | −10.8 to +3.5 | −1.3 (−8.5 to +5.9) |
| (b) backed pre-primary | 20 | +2.0 | −3.6 to +7.6 | −0.7 (−6.2 to +4.9) |
| (b) incl. Third Way-aligned PACs | 20 | +2.0 | −3.6 to +7.6 | |
| (b) 2 of 3 markers | 16 | +4.3 | −1.8 to +10.4 | |

Mean overperformance: moderate nominees +13.6 (n = 12), leftier +13.6 (n = 9),
unaligned +18.7 (n = 9, mostly incumbents) [19]. Twelve of the 30 races were under
90% counted on 2026-11-05.

> **[Claude — honest correction]** The first pass of this file reported the House
> contested-primary results on 29 districts. The House builder had taken each state's
> primary date from a regex over Wikipedia text, which picked up filing deadlines
> (Texas Jan 15 instead of Mar 3; Illinois Feb 5 instead of Mar 17). Endorsements dated
> between the wrong and the right date were dropped as post-primary. With NCSL's dates
> [31], IL-07 (La Shawn Ford) meets the contested-primary rule, and n rises to 30. The
> changed numbers: coding (b) +2.2 → +2.0, CI −3.6 to +8.0 → −3.6 to +7.6; 2-of-3
> +4.5 → +4.3; with incumbency, (b) −0.7 (−6.7 to +5.3) → −0.7 (−6.2 to +4.9). A separate
> fix merged one candidate's name-variant rows, which moved Pearson (TN-09) from
> insider 0 to 1. No Senate number changed.

## 5 · Money

**Outside spending against the Democrat.** Net general-election IE against the
Democrat (against-D plus for-R, minus for-D plus against-R) ranged from −$21 to +$41 per
vote cast in the competitive Senate races. Its coefficient is −0.08 points per $/vote
(CI −0.26 to +0.10) in the Senate and −0.05 (CI −0.42 to +0.33) in the House [7].
Dropping it changes the coding coefficients by under 0.2 points [14]. Spending
follows competitiveness (the endogeneity caveat in the brief), so a null here does not
show that money has no effect.

**Primary money from AIPAC, crypto and AI committees.** In the Senate, one nominee
faced it: El-Sayed, with $30.7M in UDP primary spending (against him or for Stevens),
and he won [20]. In the House contested-primary set, seven nominees won despite primary
money from these groups against them (AZ-01 Shah $1.3M, FL-24 Gilbert $2.1M, IL-02
Miller $1.4M, IL-07 Ford $2.5M, IL-09 Biss $6.3M, MI-13 McKinney $2.0M, NY-13 Avila
Chevalier $2.9M) [20].
In general elections, Defend American Jobs (crypto) put $56.6M against Brown in Ohio
[20]; Brown won.

**Per dollar.** Moderates raised more per vote cast: median $14.87 per vote vs $7.68
for leftier nominees in the Senate, $17.86 vs $10.07 in the House [21]. Points ahead of
Harris per dollar raised per vote: Senate moderate 1.21, leftier 1.09; establishment-
backed 0.73, not backed 1.44. House moderate 0.75, leftier 1.13 [21].

## 6 · Leads from the pasted summary

| Lead | Status | Source |
|---|---|---|
| Third Way memo numbers (Talarico +26/+6, Andrews +22/+7, Hamilton +21/+7, Turek +17/+3, Brown +16/+2; Benson outran El-Sayed by 4) | Confirmed; all reproduce within 1 point | [8], [9], [10] |
| Tanden / CAP Action credit Schumer's Senate recruitment | Confirmed as a CAP Action press statement: "particular credit goes to Leader Schumer, who recruited candidates in Senate battlegrounds". No X post located | [22] |
| Schumer backed Mills; Mills exited before the June 9 primary | Confirmed: Schumer "recruited Maine Gov. Janet Mills, endorsed her campaign"; Mills suspended April 30 | [23] |
| Platner won the primary | Confirmed: 72.1% | [24] |
| Jackson replaced Platner (Star-Advertiser / NYT, 2026-07-25) | Confirmed: convention vote 566-5 | [25] |
| Jackson would not back Schumer as leader | Confirmed by Common Dreams headline; the NYT interview text was not retrieved | [26] |
| PCCC (Adam Green) and Mamdani frame Talarico and Andrews as populist/progressive | Partly confirmed: PCCC endorsed Talarico before his primary (Feb 24, 2026). No PCCC endorsement of Andrews, no post-election Green statement, and no Mamdani statement found | [13] |
| MEE: AIPAC and others spent $55m on losing candidates | Confirmed: MEE relays Responsible Statecraft, $55.3M of $84.1M | [27] |
| ~$32m against El-Sayed | Corrected (see below) | [20], [27] |
| The Nation: crypto + AI + AIPAC super PACs > $180m by August | Corrected (see below) | [28] |
| WhoFundsMyRep: AIPAC-backed candidates won 346 of 380 | Not found | |

> **[Claude — honest correction]** "~$32m against El-Sayed" overstates the money aimed
> at him. Responsible Statecraft puts UDP's Michigan total at $31.47M across primary
> and general, and the FEC bulk file gives the same $31.47M [20], [27]. Of the
> primary-phase money, $20.1M opposed El-Sayed directly and $10.5M supported Stevens.
> Suggested rewrite: "AIPAC's super PAC spent about $31 million in Michigan, $20 million
> of it on ads against El-Sayed."

> **[Claude — honest correction]** The Nation's figure is dated July 21, not August,
> and it counts all independent expenditures by the three groups' super PACs in both
> parties' races, not only spending against progressives. The article's words: "combining
> to spend more than $180 million so far" [28]. On the FEC committee set used here, the
> three groups spent $165.0M by July 21 and $292.6M for the full cycle to Nov 5, of which
> $120.2M went into Democratic primaries [29]. Suggested rewrite: "By late July, crypto,
> AI and AIPAC super PACs had spent more than $180 million across both parties' races,
> according to The Nation's review of FEC filings."

> **[Claude — honest correction]** No source for "AIPAC-backed candidates won 346/380"
> or for WhoFundsMyRep turned up. Do not use it.

---

## 7 · Limits

- **n.** 11 to 14 Senate races and 30 House races. A single race moves the Senate
  coefficients by several points; the coding-(a) Senate contrast at a given Harris
  margin rests largely on Florida (Nixon, Trump +13, +10.2).
- **Unofficial counts.** Two days after the election; 12 of 30 House analysis races and
  Alaska were under 90% counted.
- **Coding (b) is partly hand-coded** (Senate) and partly rule-coded from Wikipedia
  endorsement boxes (House). Wikipedia's boxes are incomplete, so the House universe and
  House codings miss endorsements nobody listed. Ossoff's "backed" coding rests on
  incumbency, not a fetched endorsement.
- **Money groups are matched by FEC committee id.** Pop-up PACs funded by these groups
  but not traced through Schedule B are missed; pass-through committees count in full
  even where UDP supplied only part of their money.
- **Endogeneity.** Outside money goes to close races, so its coefficient is not a causal
  effect.
- **Launch dates are announcement dates**, not FEC Form 2 dates, because the FEC
  API was rate-limited (section 8). 17 of 44 rows have no launch date, so every model
  with the trail control drops all House incumbents but one.
- **Not checked:** Third Way's exit-poll, NYT and CNBC polling claims.

## 8 · Controls: starting name recognition and time on the campaign trail

**What was added** (codebook, "Starting recognition and time on the trail") [32]–[35]:

- `prior_office`, 0 to 3: statewide elected 3, U.S. House 2, state legislature or a
  citywide office in a top-25 city 1, none 0. Hand-coded for all 44 analysis nominees from
  the lead of each nominee's Wikipedia article, with the revision id saved. County,
  municipal and district-attorney offices count as 0 and are flagged `local_office`
  (Colom, Gilbert, Miller).
- `fame_flag`: prominence outside office that predates launch. Six nominees: Talarico
  (viral legislative videos, Joe Rogan appearance), Turek (Paralympic gold, 2016 and
  2020), Hamilton (pastor of the largest United Methodist congregation, 30+ books),
  El-Sayed (Crooked Media podcast host since 2019, 2018 governor candidate), Pearson
  ("Tennessee Three" expulsion, 2023), Shaheen (daughter of Sen. Jeanne Shaheen).
- `poll_name_id`: missing for all 44 (100%). Searches for TX, KS, SC and IA found only
  post-launch recognition numbers; the other 40 were not searched [38].
- `pageviews_12m_pre_launch`: cross-check only. 0 for three nominees whose articles did
  not exist before launch (NE-02, NY-13, NY-17); 0 for Gonzalez (TX-34), an undercount
  from the article's title history, flagged.
- `days_on_trail`: Election Day minus launch. **FEC Form 2 receipt dates were not
  retrieved.** The FEC DEMO_KEY returned HTTP 429 (limit 10 per hour, 0 remaining) after
  page 1 of 3, and stayed exhausted through the session. Launch therefore falls back to
  the public announcement date from the nominee's article (26 of 44 rows: 14 day
  precision, 12 month precision, set to the 1st), flagged in `launch_source`. Jackson (ME)
  uses his 2026-07-25 nomination and is flagged `late_replacement`. 17 rows have no
  launch date: Ossoff and 8 House incumbents (no announcement), Biss (announcement year
  only), and Miller, Ford, Boafo, Avila Chevalier, Brooks, Luria and Cooke (no
  announcement date found) [34].
- `days_primary_to_general`: from NCSL's primary dates, all 44 rows [31].

**With and without the controls.** OLS of overperformance on the coding dummy, net
outside spending per vote and Harris margin ("base"), then adding `prior_office` and
days on the trail (per 100 days). Because the trail variable drops rows, the middle
column reruns the base model on exactly the rows the controlled model uses [30]:

| Chamber, outcome, coding | Base (all rows) | Base, same rows as +controls | +controls | n, coded 1, resid. df (+controls) | +prior office only (all rows) |
|---|---|---|---|---|---|
| Senate, vs Harris, (a) moderate | +12.3 (+7.9 to +16.8), n 11 | +12.1 (+4.4 to +19.9) | +12.4 (−14.9 to +39.7) | 10, 6, 4 | +12.5 (+4.9 to +20.2) |
| Senate, vs Harris, (b) backed | +4.5 (−3.3 to +12.3), n 14 | +3.3 (−5.7 to +12.4) | +3.9 (−20.9 to +28.6) | 13, 4, 7 | +5.4 (−2.3 to +13.1) |
| Senate, vs Harris, (b) on TW's 11 | +7.4 (−4.1 to +18.9), n 11 | +6.2 (−13.2 to +25.6) | +6.6 (−21.9 to +35.1) | 10, 2, 4 | +7.5 (−5.3 to +20.4) |
| Senate, vs House vote, (a) moderate | +7.9 (+4.7 to +11.0), n 11 | +7.9 (+4.5 to +11.3) | +7.9 (+4.6 to +11.1) | 10, 6, 5 | +8.1 (+5.1 to +11.1) |
| Senate, vs House vote, (b) backed | +1.0 (−3.7 to +5.7), n 13 | +0.5 (−5.2 to +6.1) | +2.8 (−30.4 to +36.0) | 12, 3, 7 | +3.6 (−12.5 to +19.7) |
| Senate, vs House vote, (b) on TW's 11 | +2.1 (−1.9 to +6.0), n 11 | +1.8 (−2.6 to +6.2) | +6.7 (−29.8 to +43.3) | 10, 2, 5 | +6.6 (−6.0 to +19.2) |
| House, vs Harris, (a) moderate | −3.7 (−10.8 to +3.5), n 30 | +0.4 (−10.6 to +11.3) | +2.3 (−6.6 to +11.3) | 14, 6, 8 | −2.1 (−9.7 to +5.4) |
| House, vs Harris, (b) backed | +2.0 (−3.6 to +7.6), n 30 | +2.2 (−6.3 to +10.7) | +1.4 (−8.7 to +11.5) | 14, 6, 8 | +0.2 (−5.2 to +5.7) |

**Verdict: neither control absorbs the moderate or the establishment-backed
coefficient.** In the Senate, the coding-(a) estimate stays near +12 against Harris and
near +8 against the House vote under every combination of controls; against the House
vote its CI stays clear of zero (+4.6 to +11.1). The coding-(b) estimates stay between
+3 and +7 with CIs spanning zero, as before. The one large move (coding (b) on Third
Way's 11 races against the House vote, +1.8 to +6.7) rests on two backed races with 5
residual degrees of freedom. In the House, the move from −3.7 to +2.3 under coding (a)
is mostly the sample change (base on the same 14 rows: +0.4), not the controls. Adding
prior office alone on all 30 rows takes coding (b) from +2.0 to +0.2, consistent with
prior office and establishment backing overlapping (below). The control coefficients
themselves are small and imprecise: prior office −0.5 (−6.3 to +5.3) and trail +0.8
per 100 days (−2.9 to +4.5) in the Senate coding-(a) model [30].

**Overlap among incumbency, prior office and recognition** [36]. Pearson r, Senate
analysis rows (n = 14; 10 to 13 where launch is missing) and House (n = 30; 14 for
pairs with days on trail):

| Pair | Senate r | House r |
|---|---|---|
| (b) backed × prior office | 0.78 | 0.38 |
| (b) backed × log pageviews | 0.59 | 0.03 |
| prior office × log pageviews | 0.77 | 0.61 |
| incumbent × prior office | 0.34 | 0.70 |
| (a) moderate × prior office | 0.13 | −0.30 |
| (a) moderate × days primary to general | 0.64 | 0.20 |
| prior office × fame flag | −0.51 | −0.21 |
| log pageviews × days on trail | 0.08 | −0.60 |

VIFs in the controlled models stay at or below 3.4 (largest: Harris margin, Senate
coding (a)). Adding incumbency, the fame flag and log pageviews together raises prior
office to 7.5 (Senate, coding a), 5.3 (Senate, coding b) and 8.2 (House, coding b), and
log pageviews to 11.8 (House, coding b) [36].

What these samples cannot separate:

- **Senate (n = 10 to 14):** establishment backing from prior office. Every
  Schumer-backed recruit held statewide office (Cooper, Brown, Ossoff, Peltola all 3;
  Pappas 2), and r = 0.78. Incumbency is not estimable at all: Ossoff is the only Democratic
  incumbent among the 14, and his row has no launch date. Prior office from pageviews
  (r = 0.77): either one stands in for "starting recognition", and the data cannot say
  which.
- **House (n = 30; 14 with a launch date):** incumbency from prior office (r = 0.70;
  every incumbent is coded 2). Days on the trail from incumbency: no House incumbent
  except Wasserman Schultz has a launch date, so the controlled House models contain
  one incumbent and cannot test whether time on the trail matters for incumbents.

**Third Way's seven moderates** [37]:

| Nominee | Pre-primary backing | Prior office | Fame flag | Pageviews, 12 mo pre-launch | Launch (source) | Days on trail | Days primary to general | vs Harris | vs House vote |
|---|---|---|---|---|---|---|---|---|---|
| Talarico (TX) | not backed | 1 (state House) | 1 | 789,878 | 2025-09-09 (announcement) | 420 | 245 | +25.8 | +6.2 |
| Andrews (SC) | not backed | 0 | 0 | 479 | 2025-05-29 (announcement) | 523 | 147 | +22.4 | +7.1 |
| Hamilton (KS) | not backed | 0 | 1 | 15,489 | 2026-04 (announcement, month) | 216 | 91 | +21.1 | +7.1 |
| Turek (IA) | not backed | 1 (state House) | 1 | 10,808 | 2025-08-12 (announcement) | 448 | 154 | +17.4 | +2.9 |
| Ossoff (GA) | Schumer-backed | 3 (incumbent senator) | 0 | 522,972 | none (incumbent, no FEC date) | n/a | 168 | +20.2 | +5.6 |
| Cooper (NC) | Schumer-backed | 3 (former governor) | 0 | 2,362,283 | 2025-07-28 (announcement) | 463 | 245 | +22.9 | +4.5 |
| Brown (OH) | Schumer-backed | 3 (former senator) | 0 | 693,230 | 2025-08 (announcement, month) | 459 | 182 | +16.1 | +1.8 |
| **Mean, not backed (4)** | | 0.5 | 0.75 | 204,164 | | 402 | 159 | +21.7 | +5.8 |
| **Mean, Schumer-backed (3)** | | 3.0 | 0 | 1,192,828 | | 461 (n = 2) | 198 | +19.7 | +4.0 |

The four non-backed moderates started with less office-based recognition (mean 0.5 vs
3.0) and, except Talarico, far fewer pre-launch pageviews. Three of the four carried
non-office fame. They spent somewhat less time on the trail: Hamilton launched in April
2026, about seven months before Election Day; Andrews, Talarico and Turek launched within
the same May-September 2025 window as Cooper and Brown. Their general-election runway
after the primary was shorter on average (159 vs 198 days). They still ran ahead of the
Schumer-backed three on both metrics. Four against three cannot carry a test; this is
description.

## 9 · Pooled Senate + House model

James's working assumption: ideology coding, establishment backing, outside money,
prior office, name recognition and time on the trail act the same way in Senate and
House races, so one model over both chambers should replace the Senate-only one.

**Model** [39]. One OLS over every analysis row of both chambers: points ahead of Harris
2024 in the same geography (state for Senate rows, district for House rows) on the coding
dummy, a Senate dummy (intercept shift), Harris margin and net outside spending per vote;
"+controls" adds prior office and days on the trail (per 100 days). Standard errors are
clustered by state, so a state's Senate race and its House districts share one cluster.
With 18 to 28 clusters, each coefficient also carries a wild cluster bootstrap-t CI
(Rademacher weights drawn per state, 9,999 draws, fixed seed) and an HC3 CI for
comparison. The wild bootstrap CI is the one to read.

**Comparability caveats.** The pooled model mixes rows that differ in ways the Senate dummy
only partly absorbs:

- **Selection differs by chamber.** Senate rows are the races Cook rated other than
  Solid. House rows are districts whose Democratic primary pitted a progressive-backed
  candidate against a moderate- or money-backed one, whatever the general-election
  competitiveness. The two samples answer different questions, and neither is a random
  draw from its chamber.
- **Coding (a) is defined differently by chamber.** Senate rows carry the label Third Way
  wrote in its memo. House rows carry a rule (NewDem, Welcome or Blue Dog endorsement),
  which is Third Way's own House operationalization but not a label it applied race by race.
- **Baselines differ.** Senate overperformance is measured against Harris's statewide
  margin; House overperformance against Harris's margin on 2026 district lines, which The
  Downballot estimated from precinct returns. District estimates carry error that state
  totals do not.
- **Incumbency differs by chamber.** One of 14 Senate rows is a Democratic incumbent
  (Ossoff); 9 of 30 House rows are. Incumbents lack launch dates (section 8), so the
  "+controls" samples keep only one incumbent of either chamber.
- **Counting differs.** 12 of 30 House rows were under 90% counted on 2026-11-05;
  among Senate rows only Alaska (74%) was.

**Pooled headline** [39]:

| Coding, spec | n (Senate) | State clusters | Coefficient | Cluster CI | Wild bootstrap CI | HC3 CI |
|---|---|---|---|---|---|---|
| (a) moderate, base | 41 (11) | 26 | +1.1 | −5.8 to +8.0 | −5.9 to +8.3 | −5.2 to +7.3 |
| (a) moderate, +controls | 24 (10) | 18 | +7.2 | +0.7 to +13.8 | −1.3 to +15.9 | −1.1 to +15.6 |
| (b) backed, base | 44 (14) | 28 | +1.9 | −2.0 to +5.8 | −2.1 to +5.8 | −2.5 to +6.2 |
| (b) backed, +controls | 27 (13) | 20 | +2.7 | −4.4 to +9.7 | −7.0 to +12.5 | −6.7 to +12.0 |

**Testing the pooling assumption** [40], [41]. The same models with Senate interactions
on the coding, outside money and Harris margin (base) and also on prior office and days on
trail (+controls):

| Coding, spec | Interaction | Coefficient | Cluster CI | Wild bootstrap CI |
|---|---|---|---|---|
| (a), base | moderate × Senate | +16.0 | +8.0 to +24.1 | +8.2 to +23.8 |
| (a), base | outside money × Senate | −0.04 | −0.42 to +0.35 | −0.38 to +0.32 |
| (a), base | Harris margin × Senate | −0.14 | −0.40 to +0.13 | −0.40 to +0.13 |
| (a), +controls | moderate × Senate | +10.0 | +0.9 to +19.2 | −0.04 to +20.2 |
| (a), +controls | outside money × Senate | +0.03 | −0.80 to +0.86 | −1.08 to +1.19 |
| (a), +controls | Harris margin × Senate | −0.19 | −0.69 to +0.30 | −0.76 to +0.38 |
| (a), +controls | prior office × Senate | −3.0 | −11.3 to +5.3 | −20.8 to +13.8 |
| (a), +controls | days on trail (per 100) × Senate | +2.6 | +0.3 to +4.9 | +0.2 to +5.0 |
| (b), base | backed × Senate | +2.5 | −5.8 to +10.8 | −6.2 to +11.3 |
| (b), base | outside money × Senate | −0.01 | −0.39 to +0.38 | −0.36 to +0.35 |
| (b), base | Harris margin × Senate | −0.59 | −0.90 to −0.28 | −0.88 to −0.31 |
| (b), +controls | backed × Senate | +2.5 | −7.8 to +12.8 | −5.8 to +10.8 |
| (b), +controls | outside money × Senate | +0.03 | −0.89 to +0.94 | −1.53 to +1.48 |
| (b), +controls | Harris margin × Senate | −0.67 | −1.13 to −0.20 | −1.07 to −0.25 |
| (b), +controls | prior office × Senate | −2.7 | −9.4 to +4.0 | −11.8 to +6.7 |
| (b), +controls | days on trail (per 100) × Senate | +2.9 | −0.1 to +5.9 | −0.6 to +6.3 |

Joint tests that the interactions are all zero (wild restricted bootstrap p-value first;
cluster-robust F and HC3 F beside it):

| Coding, spec | Interactions tested | Wild bootstrap p | Cluster F (p) | HC3 F (p) |
|---|---|---|---|---|
| (a), base | all 3 | 0.007 | 12.4 (<0.001) | 6.5 (0.001) |
| (a), base | all but Harris × Senate (2) | 0.036 | 7.6 (0.003) | 7.1 (0.003) |
| (a), +controls | all 5 | 0.027 | 10.2 (<0.001) | 1.5 (0.27) |
| (a), +controls | all but Harris × Senate (4) | 0.22 | 5.1 (0.007) | 0.4 (0.81) |
| (b), base | all 3 | 0.048 | 7.0 (0.001) | 3.5 (0.03) |
| (b), base | all but Harris × Senate (2) | 0.86 | 0.2 (0.84) | 0.1 (0.88) |
| (b), +controls | all 5 | 0.002 | 20.6 (<0.001) | 1.8 (0.17) |
| (b), +controls | all but Harris × Senate (4) | 0.52 | 1.6 (0.22) | 0.6 (0.67) |

**Verdict: the pooling assumption fails on these data, for two named terms.**

1. **Third Way's moderate label (coding a) does not act the same way in both chambers.**
   The moderate × Senate interaction is +16.0 points (wild CI +8.2 to +23.8): the label
   is worth about +12 in Senate races and about −4 in contested House primaries. The
   pooled coefficient of +1.1 averages two effects of opposite sign and describes neither
   chamber. The coding's definition also differs by chamber (caveat above), so this
   interaction mixes a difference in effect with a difference in what the label measures.
   With the controls, the interaction falls to +10.0 (wild CI −0.04 to +20.2) on 24 rows.
2. **Terrain acts differently.** Under coding (b), the Harris-margin slope is 0.59 points
   per point steeper in Senate races (wild CI −0.88 to −0.31). Senate Democrats gained more
   the redder the state; House Democrats in this sample did not. Under coding (a) that slope
   difference disappears (−0.14), because the moderate label and red-state terrain coincide
   in the Senate rows (section 3).

**For everything else the pooling holds on these data.** Allowing the Harris slope to
differ, the remaining coding-(b) interactions (establishment backing, outside money, prior
office, days on trail) are jointly indistinguishable from zero: wild bootstrap p = 0.86
(base) and 0.52 (+controls). Under coding (b) the pooled model is a defensible summary
once it carries a Harris × Senate term: establishment backing +2.0 (wild CI −2.9 to +6.9,
n = 44) in that specification. One more term sits at the edge: days on the trail ×
Senate, +2.6 per 100 days under coding (a) (wild CI +0.2 to +5.0) and +2.9 under coding
(b) (wild CI −0.6 to +6.3), on 24 and 27 rows that contain one incumbent.

Cluster F tests run larger than the bootstrap with 18 to 20 clusters and 4 or 5
restrictions (for example F = 20.6 against a wild p of 0.002 and an HC3 p of 0.17), the
known over-rejection of cluster-robust Wald tests with few clusters. The wild bootstrap
p-values are the ones to read.

**Robustness** [42]:

| Coding, spec, sample | n (Senate) | Clusters | Coefficient | Wild bootstrap CI |
|---|---|---|---|---|
| (a) base, all | 41 (11) | 26 | +1.1 | −5.9 to +8.3 |
| (a) base, drop House <90% counted | 29 (11) | 22 | +4.3 | −3.5 to +12.1 |
| (a) base, drop FL (Nixon) | 40 (10) | 26 | +0.5 | −7.7 to +8.6 |
| (a) +controls, drop House <90% counted | 18 (10) | 14 | +8.7 | −0.9 to +18.7 |
| (a) +controls, drop FL (Nixon) | 23 (9) | 18 | +6.7 | −5.1 to +18.7 |
| (b) base, all | 44 (14) | 28 | +1.9 | −2.1 to +5.8 |
| (b) base, drop House <90% counted | 32 (14) | 24 | +1.9 | −3.3 to +7.1 |
| (b) base, drop FL (Nixon) | 43 (13) | 28 | +1.6 | −2.7 to +5.9 |
| (b) +controls, drop House <90% counted | 21 (13) | 16 | +4.1 | −13.0 to +21.3 |
| (b) +controls, drop FL (Nixon) | 26 (12) | 20 | +2.4 | −7.3 to +11.8 |

The brief named 11 House races under 90% counted. The count is 12 since IL-07 joined the
sample in the second pass [43]. Dropping them moves the pooled coding-(a) coefficient
from +1.1 to +4.3. The 12 dropped rows hold 6 moderate nominees who ran +12.5 ahead of
Harris on average, 4 leftier (+13.5) and 2 unaligned (+16.5); the 18 kept House rows hold
moderates at +14.6, leftier at +13.8 and unaligned at +19.3 [43]. Dropping the
partly-counted races removes moderates who ran below the House average. Dropping Florida
moves coding (a) from +1.1 to +0.5. In the pooled model Florida is one row of 41 and no
longer carries the contrast, which now comes from the chamber split. No robustness row
gives a coding-(b) wild CI that excludes zero.

## 10 · Baseline sensitivity: does the result depend on Harris 2024?

Every result above measures overperformance against one race, Harris 2024. This section
reruns the main specifications against four more baselines and reports which findings
survive the change.

**Baselines** [44]. All are Democratic-minus-Republican margins in the same geography:

| Baseline | Senate rows | House rows | National D−R margin of its cycle |
|---|---|---|---|
| Harris 2024 | CNN 2024-PG | Downballot, 2026 lines | −1.48 (president) |
| Biden 2020 | CNN 2020-PG | Downballot 2020 on 2026 lines; 2024 lines where the district did not move | +4.54 (president) |
| Mean of Harris 2024 and Biden 2020 | as above | as above | +1.53 |
| Prior race for the seat | last regular race: 2020 (GA: Jan 2021 runoff); FL, OH specials: 2022 | 2024 House result | +3.06 (House 2020), −2.85 (House 2022), −2.73 (House 2024) |
| 2022 midterm | 2022 Senate race where one was held | 2022 House result | −2.85 (House) |
| 2026 statewide House vote | as before | n/a | same cycle |

The 2026 national House margin is +12.04 [45]. Swing adjustment subtracts the difference
between +12.04 and the baseline cycle's national margin: 13.5 points for Harris 2024, 7.5 for
Biden 2020, 10.5 for the two-cycle mean, 14.9 for 2022, 14.8 for 2024 House and 9.0 for
2020 House. National margins are summed from the same CNN feeds; the 2020 presidential sum
(+4.54) sits 0.1 point from the commonly cited +4.45 because CNN's totals include all
candidates. Where every row in a model shares one cycle, the adjustment is a constant and
leaves the coding coefficient unchanged. It moves coefficients only where cycles mix:
Senate prior-seat rows (2020, 2022) and pooled prior-seat rows (2020, 2022, 2024).

**Rows without a baseline** [46]:

- Biden 2020, two-cycle mean, prior seat: FL-20, FL-24, FL-25, TN-09, TX-34, UT-01.
  All six were redrawn for 2026, and The Downballot publishes no 2020 figure on the new lines.
  FL-20 also had no contested 2024 race.
- 2022 midterm, Senate: no 2022 race in ME, MI, MN, MS, TX; Alaska's 2022 race had no
  Democrat in the top two (Murkowski vs Tshibaka).
- 2022 midterm, House: the six above plus GA-13 and NY-06 (redrawn between 2022 and 2024),
  IL-07 and NY-13 (2022 race lacked a Republican or a Democrat).

**Candidate-effect contamination** [47]. A prior-race baseline that featured the same
candidate measures that candidate against themselves:

- Prior seat, same Democrat: GA-S (Ossoff's own 2020-21 race), AZ-01 and WI-03 (Shah and
  Cooke were the 2024 nominees), and the incumbents AZ-04, HI-01, MO-01, NJ-06, NY-06,
  OR-04 (TX-34 is flagged but has no usable baseline).
- 2022 midterm, same Democrat: AZ-04, HI-01, NJ-06, NY-06, OR-04, VA-02 (Luria was the 2022
  nominee), TX-34.
- Prior seat, same Republican (rematches): AK (Sullivan), KS (Marshall), ME (Collins), MS
  (Hyde-Smith), and House NY-17, OR-04, PA-07, VA-02 among others. Surname matching drives
  this flag; GA-13 and IL-07 may be surname coincidences.

The "excluding same-candidate rows" lines drop the same-Democrat rows.

**Sensitivity table, raw** [48]. Base specification: overperformance against baseline B on
the coding dummy, B's own margin (the lean control, as Harris margin was before) and net
outside spending per vote; pooled adds a Senate intercept. Each cell gives the coefficient,
the wild cluster bootstrap 95% CI and n. The indented "same rows" lines rerun Harris 2024 on
exactly the rows the baseline above them can use, which separates the baseline's effect
from the change in sample.

| Baseline | (a) Senate | (b) Senate | (a) House | (b) House | (b) pooled |
|---|---|---|---|---|---|
| Harris 2024 | +12.3 (+8.6 to +16.1), 11 | +4.5 (−5.5 to +14.2), 14 | −3.7 (−11.5 to +4.0), 30 | +2.0 (−2.9 to +7.0), 30 | +1.9 (−2.1 to +5.8), 44 |
| Biden 2020 | +17.1 (+10.3 to +23.9), 11 | +5.3 (−4.1 to +14.5), 14 | −4.6 (−13.0 to +3.6), 24 | +3.9 (−0.5 to +8.1), 24 | +3.9 (+0.1 to +7.8), 38 |
|   Harris 2024, same rows | +12.3 | +4.5 | −5.9 (−17.8 to +6.5), 24 | +3.1 (−1.2 to +7.4), 24 | +2.5 (−1.8 to +6.7), 38 |
| Harris/Biden mean | +14.6 (+11.3 to +17.8), 11 | +4.9 (−4.8 to +14.6), 14 | −4.9 (−14.6 to +5.2), 24 | +3.6 (−0.5 to +7.8), 24 | +3.3 (−0.5 to +7.2), 38 |
| Prior race for the seat | +6.0 (−0.7 to +12.6), 11 | +3.3 (−10.6 to +16.9), 14 | +0.1 (−10.5 to +10.1), 24 | +5.4 (+0.0 to +10.8), 24 | +3.1 (−1.4 to +7.7), 38 |
|   Harris 2024, same rows | +12.3 | +4.5 | −5.9 | +3.1 | +2.5 |
| Prior seat, excl. same-candidate | +5.3 (−3.5 to +14.3), 10 | +2.0 (−8.7 to +12.6), 13 | +4.3 (−12.7 to +21.8), 16 | +6.7 (−1.8 to +15.2), 16 | +2.8 (−3.5 to +9.0), 29 |
|   Harris 2024, same rows | +12.1 (+4.1 to +20.5), 10 | +3.3 (−8.0 to +14.5), 13 | −0.5 (−10.4 to +9.5), 16 | −0.0 (−3.8 to +3.8), 16 | +0.3 (−4.1 to +4.5), 29 |
| 2022 midterm | +10.2 (+4.1 to +16.4), 7 | +7.0 (−56.6 to +69.7), 8 | +2.1 (−9.0 to +12.7), 20 | +6.7 (+0.5 to +13.2), 20 | +2.6 (−2.6 to +7.8), 28 |
|   Harris 2024, same rows | +10.1 (+6.8 to +13.4), 7 | +4.9 (−21.3 to +31.2), 8 | −3.6 (−14.8 to +7.5), 20 | +2.5 (−2.9 to +8.0), 20 | +1.9 (−2.3 to +6.0), 28 |
| 2022 midterm, excl. same-candidate | +10.2 (+4.1 to +16.4), 7 | +7.0 (−56.6 to +70.5), 8 | +5.5 (−8.4 to +19.3), 15 | +7.4 (+0.9 to +13.9), 15 | +2.3 (−3.3 to +7.9), 23 |
|   Harris 2024, same rows | +10.1 | +4.9 | +0.9 (−6.7 to +8.4), 15 | +0.5 (−3.6 to +4.6), 15 | +0.5 (−2.7 to +3.9), 23 |
| 2026 statewide House vote | +7.5 (+5.2 to +9.8), 11 | +3.9 (−3.1 to +11.0), 13 | n/a | n/a | n/a |
|   Harris 2024, same rows | +12.3 | +7.1 (−2.1 to +16.4), 13 | | | |

Same-rows cells without a CI repeat a row whose sample did not change.

**Sensitivity table, swing-adjusted** [48]. Only the prior-seat cells change, because only
those mix cycles. Every other cell has the same coefficient as the raw table; its CI
bounds differ by bootstrap noise, up to 1.2 points in the uninformative 8-race Senate
midterm cell and 0.4 or less elsewhere:

| Baseline (adjusted) | (a) Senate | (b) Senate | (a) House | (b) House | (b) pooled |
|---|---|---|---|---|---|
| Prior race for the seat | +7.0 (−1.4 to +15.5), 11 | +2.1 (−10.0 to +14.0), 14 | +0.1 (−10.4 to +10.3), 24 | +5.4 (+0.1 to +10.8), 24 | +2.9 (−1.7 to +7.6), 38 |
| Prior seat, excl. same-candidate | +6.4 (−6.3 to +18.9), 10 | +0.5 (−9.8 to +10.9), 13 | +4.3 (−12.8 to +21.2), 16 | +6.7 (−2.1 to +15.3), 16 | +2.5 (−3.8 to +8.7), 29 |

The "+controls" versions (prior office and days on the trail added) are in
`baseline_sensitivity.csv`; at 9 to 27 rows their CIs are wide, and their signs match the
base table in every cell except (a) House, which turns positive (+2.3 to +11.3) once the
sample shrinks to the 9 to 14 non-incumbent rows with a launch date.

**Verdicts by column.**

- **(a) Senate, Third Way's moderate label: holds in sign, shrinks under the prior-race
  baseline.** The coefficient is positive under every baseline, from +6.0 (prior race for
  the seat) to +17.1 (Biden 2020). The prior-race baseline is the outlier: on the same 11
  races it halves the Harris estimate (+12.3 to +6.0) and its CI crosses zero (−0.7 to
  +12.6). Measured against the seat's previous race (2020, or 2022 for the Florida and
  Ohio specials), Third Way's moderates ran about 6 points further ahead than the others,
  against about 12 measured against Harris.
- **(b) Senate, establishment backing: small and indistinguishable from zero under every
  baseline** (+2.0 to +7.0). The 2022-midterm cell rests on 8 races, 4 of them backed, and
  its CI (−56.6 to +69.7) carries no information.
- **(a) House: changes sign with the baseline and never leaves zero.** Negative against
  presidential baselines (−3.7 to −4.9), near zero against the 2024 House result (+0.1),
  positive against 2022 (+2.1; +5.5 without same-candidate rows). No CI excludes zero.
- **(b) House: grows under prior-race baselines, and Harris 2024 is the outlier at the low
  end.** Against the 2022 midterm, establishment-backed House nominees ran +6.7 (+0.5 to
  +13.2) further ahead than the others; without same-candidate rows +7.4 (+0.9 to +13.9).
  Against the 2024 House result, +5.4 (+0.0 to +10.8). On the same rows, Harris 2024 gives
  +2.5 and +3.1, and +0.5 without the same-candidate rows. This change comes from the
  baseline, not the sample: establishment-backed House nominees outran the previous
  Democratic House candidates in their districts by more than they outran Harris.
- **(b) pooled: +1.9 to +3.9.** One cell excludes zero: Biden 2020, +3.9 (+0.1 to +7.8),
  against +2.5 for Harris on the same rows.

Overall, Third Way's Senate moderate edge survives every baseline in sign but halves
against the prior race for each seat. The establishment-backing coefficient moves from
"indistinguishable from zero" toward a positive House effect when the baseline is the
district's previous House race. No baseline flips a coefficient whose CI excluded zero
under Harris 2024.

**Third Way's seven moderates, by baseline** [49]:

| Nominee | Backing | Harris 2024 | Biden 2020 | Harris/Biden mean | Prior seat | 2022 midterm | 2026 House vote |
|---|---|---|---|---|---|---|---|
| Talarico (TX) | not backed | +25.8 | +17.8 | +21.8 | +22.0 | n/a | +6.2 |
| Andrews (SC) | not backed | +22.4 | +16.3 | +19.4 | +14.9 | +30.4 | +7.1 |
| Hamilton (KS) | not backed | +21.1 | +20.0 | +20.6 | +17.0 (same R: Marshall) | +28.7 | +7.1 |
| Turek (IA) | not backed | +17.4 | +12.5 | +14.9 | +10.9 | +16.3 | +2.9 |
| Ossoff (GA) | Schumer-backed | +20.2 | +17.8 | +19.0 | +16.8 (his own 2020-21 race) | +17.1 | +5.6 |
| Cooper (NC) | Schumer-backed | +22.9 | +21.0 | +21.9 | +21.5 | +22.9 | +4.5 |
| Brown (OH) | Schumer-backed | +16.1 | +13.0 | +14.6 | +11.0 | +11.0 | +1.8 |
| **Mean, not backed** | | +21.7 (4) | +16.6 (4) | +19.2 (4) | +16.2 (4) | +25.1 (3) | +5.8 (4) |
| **Mean, Schumer-backed** | | +19.7 (3) | +17.3 (3) | +18.5 (3) | +16.4 (3) | +17.0 (3) | +4.0 (3) |
| **Gap (not backed minus backed)** | | +2.0 | −0.6 | +0.7 | −0.2 | +8.1 | +1.9 |

The section 2 finding that the four non-backed moderates ran ahead of the three Schumer
recruits **depends on the baseline**. It holds against Harris 2024 (+2.0), the 2026 House
vote (+1.9) and the 2022 midterm (+8.1, three a side, Texas missing). It disappears against
Biden 2020 (−0.6), the two-cycle mean (+0.7) and the prior race for the seat (−0.2). With
four against three, the gap is description under any baseline.

> **[Claude — honest correction]** Section 2 and the headline say the four non-backed
> moderates "posted the larger overperformances". That holds against Harris 2024 and the
> 2026 House vote, and reverses slightly against Biden 2020 and the prior race for each
> seat. Suggested rewrite: "Against Harris 2024, the four moderates without establishment
> backing ran about 2 points further ahead than Schumer's three recruits; against Biden 2020
> or the seat's previous race, the two groups ran level."

---

## Notes

[1] `regressions.csv`, chamber S, coding "a: Third Way moderate", term `a_moderate`.
Sample: 2026 Senate races rated other than Solid by Cook on Nov 2 2026 (Wikipedia
ratings table), Democrat-vs-Republican contest, Third Way label present (GA, NC, TX, SC,
KS, IA, OH moderate; MI, MN, ME, FL leftier); n = 11, unweighted, one row per race.
Dependent variable: Democratic margin minus Harris 2024 margin (CNN results API,
`2026-SG`, `2024-PG`, extracted 2026-11-05 21:40 UTC). Controls: net general IE against
the Democrat per vote cast (FEC bulk IE file, 2026-11-05) and Harris margin. OLS, HC3
standard errors.

[2] As [1], coding "b: establishment-backed pre-primary (strict)", n = 14 (adds AK, MS,
NH; NE excluded, no Democrat). Coding rule in the codebook; sources per row in `b_source`.

[3] As [2], restricted to the 11 races of [1]; `regressions.csv` row "[same 11 races as a]".

[4] Dependent variable `over_vs_house_statewide`: Senate margin minus the summed
statewide House margin (CNN `2026-HG`, all districts in the state). Control: net
outside spending per vote. Coding (a) n = 11; coding (b) n = 13 (Alaska's House baseline
is blank because an independent outpolled the Democrat). HC3 CIs.

[5] `summary.json` → `senate_groups`: `tw_moderate_not_backed` (IA, KS, SC, TX) means
+21.68 vs Harris, +5.82 vs House; `tw_moderate_estab_backed` (GA, NC, OH) +19.73 and +3.97.
Unweighted means of race-level values; n = 4 and 3.

[6] `regressions.csv`, chamber H, terms `a_moderate` and `b_estab`; universe rule in the
codebook; n = 30 districts with a D-vs-R general; controls and SEs as [1]. House Harris
margins from The Downballot's 2024 results on 2026 lines.

[7] `regressions.csv`, term `net_out_pv`: Senate (coding a model) −0.08, CI −0.26 to +0.10,
n = 11; House (coding a model) −0.05, CI −0.42 to +0.33, n = 30. Range of the variable:
`races.csv` `net_outside_against_dem_gen_per_vote`.

[8] Third Way, "Moderates Made Democratic Majorities", memo, Nov 4 2026,
https://www.thirdway.org/memo/moderates-made-democratic-majorities ; Third Way and
Welcome, "Center-Left Democrats Overperformed and Delivered the Majority", memo, Nov 5
2026, https://www.thirdway.org/memo/center-left-democrats-overperformed-and-delivered-the-majority .
Cached at `data/raw/midterm2026/sources/thirdway_memo*.html`.

[9] `scripts/midterm2026/check.py`, checks "TW … vs Harris" and "TW … vs House";
`races.csv` columns `over_vs_harris`, `over_vs_house_statewide`.

[10] `races.csv` `gov_dem_margin − dem_margin` for MI, MN, ME, FL; governor results from
CNN `2026-GG`.

[11] `house_all.csv` rows TX-15, PA-08, NC-11; `harris_margin` from The Downballot.

[12] `summary.json` → `house_flips.n_mod_endorsed` = 31; flips are districts with a
Republican incumbent in The Downballot sheet that CNN called for the Democrat (n = 42).
Lists: newdemactionfund.com/candidates, welcome.team/elect, plus Wikipedia Welcome /
NewDem / Blue Dog endorsements and the memo's named cross-endorsees.

[13] Senate coding sources: Washington Examiner, "Schumer lands his prized Senate
recruits in battlegrounds", Oct 15 2025 (Cooper, Brown, Peltola); NOTUS, Apr 30 2026
(Mills); Axios, Dec 9 2025 (Schumer spokesperson on Texas: "does not have a preference
of candidate"); Bleeding Heartland and Washington Examiner (Iowa); Mississippi Today, Sep
21 2026 (Colom); Post and Courier via search summary (SC); NOTUS, Aug 2026 (Vindman
recruited). Endorsements of Stevens (Schumer, Jun 17 2026), Craig (Jeffries), Pappas
and Craig and Stevens (AIPAC, DMFI), Talarico (PCCC, Feb 24 2026), from the Wikipedia
Democratic-primary endorsement boxes, revision ids in `races.csv` `wiki_revid`. Only
NOTUS (Mills) was fetched and quoted directly; the other news items were read through
search-result summaries.

[14] `regressions.csv`, chamber S; "[no money control]" rows drop `net_out_pv`.

[15] `summary.json` → `senate_all_dem_vs_rep`: OLS of `over_vs_harris` on
`harris_margin`, all 31 Senate races with a Democrat-vs-Republican contest (excludes
ID, NE, SD: no Democrat; MT: independent outpolled the Democrat), HC3 CI.

[16] `summary.json` → `senate_groups`: `noncompetitive_trump_won` (n = 8) +18.77 vs Harris,
−0.32 vs House; `noncompetitive_harris_won` (n = 9) +14.16; Third Way moderates (n = 7)
+20.8 vs Harris, +5.0 vs House; leftier including FL (n = 4) −3.71 vs House.

[17] `summary.json` → `house_all_dem_vs_rep`; `house_all.csv`, rows with `dem_vs_rep`.

[18] `summary.json` → `house_flips`: OLS of `over_vs_harris` on `mod_endorsed` and
`harris_margin`, n = 42; `_ge90` fields restrict to `pct_reporting` ≥ 90, n = 34. HC3.

[19] `summary.json` → `house_contested_by_a`, `crosstab_a_b`; `regressions.csv` rows
"[+incumbent]" add `dem_incumbent`.

[20] `races.csv` columns `aipac_prim_against_nominee` (MI-S $30,669,755),
`money_prim_against_nominee` (House rows), `crypto_gen_against_dem` (OH-S). FEC bulk IE
file 2026-11-05; UDP committee C00799031; MI primary-phase split: $20.14M opposing
El-Sayed, $10.50M supporting Stevens. UDP Michigan Senate total, all phases: $31.47M
(`check.py`).

[21] `summary.json` → `money.S`, `money.H`: medians of `dollars_per_vote_receipts` and
`over_per_dollar_per_vote` by coding. Receipts from FEC weball26 (coverage through
each candidate's latest report, mostly Oct 14 2026).

[22] Center for American Progress Action, "STATEMENT: Tonight the Democrats' Big Tent
Broke the MAGA Stronghold", https://www.americanprogressaction.org/press/statement-tonight-the-democrats-big-tent-broke-the-maga-stronghold/ ,
cached `sources/cap_action_statement.html`.

[23] NOTUS, "Janet Mills' Sudden Exit Has Democrats Asking: What Was Schumer Thinking?",
Apr 30 2026, https://www.notus.org/2026-election/janet-mills-exit-maine-schumer-platner ,
cached `sources/notus_mills.html`.

[24] Wikipedia, "2026 United States Senate election in Maine", Democratic primary
results box (Platner 72.1%, Mills 19.3% after withdrawal), revision in `races.csv`.

[25] Honolulu Star-Advertiser, "Maine Democrats pick Troy Jackson to replace Platner in
Senate race", Jul 25 2026, https://www.staradvertiser.com/2026/07/25/breaking-news/maine-democrats-pick-troy-jackson-to-replace-platner-in-senate-race/ ,
cached `sources/staradv_jackson.html`.

[26] Common Dreams, "Troy Jackson Says He Wouldn't Support Schumer as Senate Democratic
Leader", https://www.commondreams.org/news/maine-democratic-party-troy-jackson ,
cached `sources/commondreams_jackson.html`. The NYT original (Jul 21 2026) was not
retrieved.

[27] Responsible Statecraft, "AIPAC dumped more than $55 million into losing midterm
races", https://responsiblestatecraft.org/aipac-candidates-2026/ ; Middle East Eye,
"Aipac spent $55m on losing congressional candidates in midterm elections: Report",
https://www.middleeasteye.net/news/aipac-spent-55million-losing-congressional-candidates-report .
Cached in `sources/`.

[28] David Moore, The Nation, Jul 21 2026,
https://www.thenation.com/article/politics/crypto-ai-aipac-super-pacs-democratic-primaries-dark-money-2026/ ,
cached `sources/nation_180m.html`.

[29] `summary.json` → `money_group_totals_cycle`: committee sets listed in the codebook;
`dated_by_2026_07_21_usd` uses the dissemination date, else the expenditure date.

[30] `regressions.csv`, column `spec`: `base`, `base (+controls rows)`, `+controls`
(`prior_office` + `trail100`), `+prior_office`, `+trail`, `+controls+fame`. HC3 95%
CIs throughout (column `cov`; HC1 is the fallback when HC3 is undefined, unused here).
Controlled models keep the base controls (net outside spending per vote; Harris margin
for the vs-Harris outcome).

[31] NCSL, "2026 State Primary Election Dates",
https://www.ncsl.org/elections-and-campaigns/2026-state-primary-election-dates , cached
`sources/ncsl_2026_primary_dates.html`; parsed in `scripts/midterm2026/_primary_dates.py`.

[32] `controls.csv` columns `prior_office`, `prior_office_note`, `nominee_wiki`,
`wiki_revid_nominee`: the lead paragraph of each nominee's English Wikipedia article,
revision read 2026-11-05.

[33] `controls.csv` columns `fame_flag`, `fame_note`, same articles as [32].

[34] `controls.csv` columns `announce_date`, `announce_precision`, `announce_note`
(quoted article sentence), `launch_date`, `launch_source`, `fec_f2_status`. Peltola's
date comes from Alaska Beacon, "Mary Peltola announces run for Alaska U.S. Senate,
challenging incumbent Dan Sullivan", Jan 12 2026 (search result; not fetched). Jackson:
Star-Advertiser, Jul 25 2026 (cached, see [25]). FEC query that failed:
`api.open.fec.gov/v1/filings/?form_type=F2&candidate_id=…` (44 ids), page 2 of 3,
HTTP 429.

[35] Wikimedia REST API,
`wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/…/monthly/…`,
12 full months before the anchor, summed over the article and its redirects (MediaWiki
`prop=redirects`); cached under `data/raw/midterm2026/pageviews/` and `wiki_redirects/`.

[36] `collinearity_corr.csv` (Pearson r, pairwise complete rows, n per pair in the
file); `collinearity_vif.csv` (statsmodels `variance_inflation_factor`, constant
included, one row per regressor per design).

[37] `seven_moderates.csv`; group means in `summary.json` →
`seven_moderates_group_means`. Ossoff has no launch date, so the backed group's trail
mean covers Cooper and Brown only.

[38] Post-launch recognition found by search (summaries, not fetched; not used as
`poll_name_id` because each postdates launch): Texas Southern University, late 2025, 79%
of likely Democratic primary voters knew enough about Talarico to form an opinion; a
pre-primary poll of Kansas Democrats put Hamilton's name recognition at 18% (WIBW/KCTV,
Apr 30 2026); Impact Research, Aug 14-22 2026, 56% of South Carolina likely voters knew of
Andrews; GBAO, Mar 31 2026 memo, "substantially lower name ID" for Turek and Wahls than
Hinson (Bleeding Heartland).

[39] `scripts/midterm2026/pooled.py`; `regressions.csv` rows with `chamber` = `P`,
columns `sample`, `n_senate`, `clusters`, `se_cluster`, `ci_lo`/`ci_hi` (cluster CR1,
statsmodels), `ci_wild_lo`/`ci_wild_hi` (unrestricted wild cluster bootstrap-t,
Rademacher per state, B = 9,999, seed 20261105), `ci_hc3_lo`/`ci_hc3_hi`. Rows:
`dem_vs_rep`, Democratic nominee present; Senate rows Cook-competitive; coding (a)
excludes AK, MS, NH. Unweighted. The bootstrap uses a numpy CR1 implementation that
`check.py` verifies against statsmodels to 1e-10.

[40] `pooled_interactions.csv`: interaction terms (`:senate`) from the "+interactions"
specs, with cluster and wild bootstrap CIs.

[41] `pooled_joint_tests.csv`: cluster-robust Wald F (`F_cluster`, `p_cluster`), HC3 F
(`F_hc3`, `p_hc3`) and the restricted wild cluster bootstrap p-value (`p_wild_wcr`:
residuals from the model without the tested interactions, Rademacher weights per state,
9,999 draws, share of draws whose cluster Wald statistic is at least the observed one).
Column `tested` gives the restriction set; for "all but harris_margin:senate", that term
stays in both models.

[42] `regressions.csv`, `chamber` = `P`, `sample` = `drop House <90% counted` or
`drop FL (Nixon)`.

[43] `summary.json` → `pooled.house_under_90_dropped`: AZ-01, AZ-04, IL-02, IL-07, IL-08,
MD-05, MI-13, NY-06, NY-10, NY-17, OR-04, UT-01 (CNN `percentReporting` < 90 on
2026-11-05). Group means by `coding_a_thirdway` computed from `races.csv` over the dropped
and kept House rows.

[44] `scripts/midterm2026/build_baselines.py`; `baselines.csv` (merged into `races.csv`),
columns `base_*`, `over_*`, `swing_*`, `over_*_adj`. CNN results API feeds `2020-PG`,
`2020-SG` (Georgia runoff key `2020-SW-GA`), `2022-SG`, `2022-HG`, `2024-HG`, cached under
`data/raw/midterm2026/cnn/`. The Downballot sheets: 2026 lines (`pres2024_by_cd_2026lines.csv`),
2024 lines (`1ng1i_Dm_620838163.csv`, whole points), 2022 lines (`1CKngqOp_1871835782.csv`,
Biden only), all linked from the-downballot.com/p/the-downballots-calculations-of-presidential.

[45] `national_environment.csv`: (all Democratic votes − all Republican votes) / all votes
× 100, summed over every race in each CNN feed. House totals include uncontested seats.

[46] `summary.json` → `baselines.missing`; reasons in `baselines.csv` columns
`biden20_source`, `baseline_notes`, `midterm22_note`.

[47] `baselines.csv` columns `prior_seat_same_dem`, `prior_seat_same_rep`,
`midterm22_same_dem`, `midterm22_same_rep` (surname match against the 2026 nominees);
`summary.json` → `baselines.contaminated_*`.

[48] `baseline_regressions.csv` and `baseline_sensitivity.csv` (`scripts/midterm2026/baselines_analysis.py`).
OLS of `over_<b>` on the coding dummy, `base_<b>`, `net_out_pv` (pooled: + `senate`);
wild cluster bootstrap-t CIs (Rademacher per state, 9,999 draws, seed 20261105; Senate-only
models have one row per state); rows `harris24@<b>` rerun Harris 2024 on baseline b's rows.
The Harris 2024 Senate CIs here (+8.6 to +16.1 for coding a) differ from section 2's HC3
CIs (+7.9 to +16.8) because the method differs; the coefficient is identical.

[49] `seven_moderates_by_baseline.csv`; group means in `summary.json` →
`baselines.seven_group_means`.
