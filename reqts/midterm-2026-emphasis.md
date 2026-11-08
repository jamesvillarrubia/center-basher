# 2026 House campaigns: what each side spent its ads on

Status: spec, written 2026-11-06 before any ad data was pulled. Predictions in section 6 are
frozen; results go in a new dated section, never edits to this one.

## 1. Question

Platform positions (progressive-position-rubric.md) record what a nominee supports, not what the
campaign talked about. Exit polls put the economy and prices first (39% top issue, NBC/Fox), with
corruption close behind (AP Voter Poll). This pass measures emphasis: the share of each campaign's
paid Facebook/Instagram ad spending that is about each topic, for the Democrat and the Republican
in every D-vs-R House race.

Questions:
1. Did Democrats who put more of their ad money into prices run further ahead of Harris?
2. Did moderate-backed and progressive-backed Democrats differ in how much they spent on prices?
3. Did Republican spending on "socialism", "radical left" or Mamdani attacks against the Democrat
   go with a smaller Democratic gain?
4. Who owned the price message in each race: the Democrat's price share minus the Republican's.

## 2. Source

Meta Ad Library API, `GET https://graph.facebook.com/<version>/ads_archive`,
`ad_type=POLITICAL_AND_ISSUE_ADS`, `ad_reached_countries=["US"]`, delivery dates 2025-07-01 to
2026-11-03. Fields: id, page_id, page_name, bylines, ad_creative_bodies,
ad_creative_link_titles, ad_creative_link_descriptions, ad_delivery_start_time,
ad_delivery_stop_time, spend, impressions, publisher_platforms.

- Token: James's Meta developer token, passed to the collector as a file path, never written to
  the repo, a log, or a request other than graph.facebook.com.
- Page IDs: for each nominee, search by full name; keep pages whose page_name or byline contains
  the nominee's last name and a campaign word ("for Congress", "for [state]", the nominee's name
  alone). Every accepted page is logged to `meta_pages.csv` with the rule that matched. A sample of
  40 is checked by hand before any analysis.
- Raw responses cached under `data/raw/midterm2026/meta_ads/` (gitignored), one JSON file per
  page, with fetch time.
- Spend: Meta reports a range. Point estimate = midpoint; sensitivity run with the lower bound.
- Limits: Facebook and Instagram only. TV, mail, streaming and Google are not covered. Party and
  super PAC pages are collected separately and kept out of the candidate measure.

## 3. Codebook (topics, frozen)

A unit is one distinct ad text (identical bodies are de-duplicated and their spend summed). An ad
can carry several topics.

| Code | Topic | In | Out |
|---|---|---|---|
| prices | Cost of living | prices, inflation, groceries, rent, housing costs, gas, utility bills, tariffs as a price, "affordability", wages vs costs | a tax cut with no price framing |
| health | Health care | premiums, Medicare, Medicaid, ACA, drug prices, hospitals | |
| corrupt | Corruption and money | corruption, insider trading, corporate PACs, billionaires buying elections, self-dealing | |
| democracy | Democracy and Trump's power | democracy, the constitution, authoritarianism, checks on Trump | Trump named only as a price cause (goes to prices) |
| abortion | Abortion and reproductive rights | | |
| immig | Immigration and border | | |
| crime | Crime and policing | | |
| socialism | "Socialist" / radical-left attack | socialism, communism, radical left, Mamdani, AOC as a bogeyman | |
| war | Iran war and foreign policy | | |
| bio | Biography and character only | service, family, "one of us", with no issue | any ad with an issue code |
| process | Fundraising, voting logistics, endorsements only | | |

## 4. Coding and reliability

1. A Sonnet coder labels every unit with the codebook, blind to the race result and to the
   nominee's group backing (unit text only, no names of groups or margins).
2. A random sample of 200 units, stratified by party, is coded blind by two more coders.
3. The measure ships only if Cohen's κ against the double-coded sample is at least 0.8 on prices
   and socialism and at least 0.7 on every other code. A code below its bar is reported as
   unreliable and left out of every model.
4. Prompts, sample IDs and κ go in `emphasis_reliability.csv`.

## 5. Measures and models

- `price_share` = spend on ads coded prices / spend on all issue ads, per candidate, general
  election window (day after the primary to 2026-11-03). Pre-primary window reported separately.
- `price_gap` = Democrat's price_share minus Republican's.
- `socialism_spend_pv` = Republican-candidate spend on socialism-coded ads per vote cast.
- Model: `over_vs_harris ~ price_share + C(state) + C(seat) + harris_margin`, state-clustered SEs,
  all races and >= 90% counted; then with `log_money_ratio` added. Same for price_gap and
  socialism_spend_pv. Group comparison: price_share ~ affiliation (moderate vs progressive) with
  the same controls.
- Races where either candidate spent under $10,000 on Meta are dropped from shares and counted.

## 6. Predictions (frozen 2026-11-06)

- P1: price_share has a positive coefficient on over_vs_harris, under 2 points per +10 share
  points; its 95% interval may cross zero.
- P2: moderate-backed and progressive-backed Democrats differ by less than 5 share points in
  price_share.
- P3: socialism_spend_pv has no reliable link to over_vs_harris (interval crosses zero), matching
  the NRCC-target result in labels.py.
- P4: Democrats outspend Republicans on price messaging in most races (median price_gap > 0).

## 7. Won't

- No claim that ads caused gains: campaigns that expect to win may choose different topics.
- No TV, mail or Google coding in this pass.
- No change to the platform rubric or to positions_final.csv.

## 8. Method change (2026-11-07, before any coded ad was compared with results)

The full collection holds about 17,000 distinct ad texts, too many for one model coder to label
at reasonable cost. James chose a keyword coder (2026-11-07). Section 4 is replaced by:

1. `emphasis.py` labels every unit with fixed regular expressions per code (listed in the
   script's `CODES`), written before any coded unit was compared with race results.
2. A random sample of 200 units (100 Democratic, 100 Republican, seed 20261107) is coded blind
   by two Sonnet coders from the codebook in section 3, with no names, parties or results shown.
   Units are de-identified: candidate and opponent names replaced with [CANDIDATE]/[OPPONENT].
3. Agreement: kappa between the two coders, and kappa between the keyword coder and the two
   coders' consensus (units where they agree). The bars in section 4.3 apply to keyword vs
   consensus. A code below its bar is dropped from every model, and the page says so.
4. Section 5 (measures and models) and section 6 (predictions) are unchanged.

Primary dates: the general-election window starts the day after the state's 2026 primary, from
`house_primaries.csv` where it has the date; otherwise from 2026-06-01, flagged per race.

## 9. First reliability result and revision (2026-11-07)

Sample 1 (seed 20261107): the two blind coders agreed closely (kappa 0.86 to 1.00 on every code).
The keyword coder against their consensus passed on socialism (0.91), health (0.91) and
immigration (0.80), and failed on prices (0.79, bar 0.8), corruption (0.67), crime (0.66), war
(0.49) and democracy (0.45). Abortion had no positives in the sample and cannot be scored.

Revision: sample 1 becomes the tuning set. Keyword rules v2 (emphasis.py `CODES`, `EXCLUDE`) fix
the error patterns seen there: "pay the price" and "can't afford to fall short" are not prices;
"billionaires" alone is not corruption, "won't be bought" and "funded by AIPAC" are; rigged maps,
gerrymanders and impeachment of officials are democracy; "culture wars" and "war chest" are not
war. Name masking for the blind text becomes case-sensitive (lowercase "harder" was masked as
Rep. Harder's name).

Validation: a fresh sample 2 of 200 (seed 20261108, no unit from sample 1), coded blind by two new
coders. Only sample 2 decides which codes pass. The bars are unchanged. No further revision after
sample 2: a code that fails there is dropped.

## 10. Validation result (sample 2, 2026-11-07)

Blind coders C and D agreed at kappa 0.91 to 1.00 on every code. Keyword rules v2 against their
consensus: health 0.90, corruption 0.83, immigration 0.82, abortion 0.80 and war 0.76 pass.
Prices 0.72 (bar 0.8), socialism 0.35 (bar 0.8; 2 true positives in 200), democracy 0.60,
crime 0.44, process 0.64 and bio 0.63 fail. Under section 9 the keyword measure of prices and
socialism is dropped; no further keyword revision.

The failures are false alarms, not misses. Prices: recall 0.93 (26 of 28), precision 0.65.
Socialism: recall 1.00 (2 of 2), precision 0.22. Democracy and crime miss half their true cases.

## 11. Model coding of every text (2026-11-07)

James chose (2026-11-07) to replace the keyword measure with blind Sonnet coding of every
distinct ad text on every code, after section 10. Method:

1. `emphasis_batches.py make`: every distinct text, names masked case-sensitively, shuffled
   (seed 11), split into batches of about 350. Coders see only uid and masked text.
2. One blind Sonnet coder per batch, the section 3 codebook verbatim as given to coders A to D,
   full text read, no keyword scripts.
3. Reliability: the 400 sample units (samples 1 and 2) fall inside the batches. The model codes
   are scored against the A/B and C/D consensus with the same bars (prices and socialism 0.8,
   others 0.7). A code below its bar on either sample is dropped from every model.
4. Section 5 (measures and models) and section 6 (predictions) are unchanged. The keyword
   codes stay in units.csv for comparison only.

## 12. Results on model codes (2026-11-07)

Reliability (model codes against blind consensus, `model_reliability.csv`): every code passes on
both samples. Prices 1.00 and 0.96; socialism 0.91 and 1.00; health 0.97 and 1.00; corruption
0.87 and 0.92; democracy 1.00 and 0.92; immigration 0.88 and 0.95; crime 0.86 and 0.80; war 1.00
and 0.89. Abortion had no positives in sample 1 (kappa undefined) and scored 1.00 in sample 2.

Coverage: 417 D-vs-R races; 234 Democrats ran Meta ads; 110 Democrats spent at least $10,000 in
the general window with a complete ad file; 29 races have both candidates over $10,000 with
complete files. 35 Democratic and 37 Republican files are incomplete (page-ID re-fetch pending)
and are excluded.

Issue mix, candidates over $10,000 with complete files (114 D, 87 R), share of issue-ad money:
prices 40% D, 39% R; health 40% D, 21% R; corruption 46% D, 22% R; immigration 8% D, 17% R; crime
2% D, 17% R; socialism 0.3% D, 10% R; war 14% D, 5% R; democracy 8% D, 1% R.

Predictions (`emphasis_models.csv`):
- P1 (price share, positive, under 2 points per +10): +0.7 points (95% CI -1.7 to +3.2), n 26,
  strict sample; -0.06 (-0.61 to +0.49), n 100, Democrat-only sensitivity. Within the predicted
  bound; no reliable link.
- P2 (moderate vs progressive price share within 5 points): not estimable in the strict sample (14
  races against state fixed effects). Democrat-only: progressive minus moderate -20.7 share
  points (-65 to +24), n 52. Too imprecise to confirm or reject.
- P3 (Republican socialism spend, no reliable link): +1.4 points per SD (-2.7 to +5.5), n 26.
  Holds; the sign is the opposite of hurting Democrats.
- P4 (Democrats out-message Republicans on prices in most races): fails. Median race gap 0 share
  points; the Democrat's price share was higher in 38% of 23 races. Both parties put about 40%
  of issue-ad money into prices.

> **[Claude — honest correction]** Section 6 expected Democrats to own the price message. They
> did not: Republicans spent the same share on prices. Democrats differed on corruption and
> health care, and Republicans on immigration, crime and socialism. Results are provisional until
> the 72 incomplete files are re-fetched.

## 13. Results after the re-fetch (2026-11-08)

Re-fetch: 96 of the 98 incomplete ad files were pulled again with a fresh token
(`collect-meta-ads.ts --keys`, 100-page cap). FL-15 DEM (Robert People) and NC-01 DEM (Don Davis)
stay incomplete: a search by those names returns about 25,000 unrelated ads, more than the cap.
Their own pages were pulled in full, but another page of theirs could sit in the unsearched
results, so both stay excluded. The re-fetch added 585 distinct texts (batches 41 and 42), coded
blind under section 11. Reliability is unchanged: every code passes on both samples
(`model_reliability.csv`).

Coverage: 235 Democrats ran Meta ads; 131 Democrats spent at least $10,000 in the general window
with a complete file; 41 races have both candidates over $10,000 with complete files.

Issue mix, candidates over $10,000 with complete files (138 D, 102 R), mean share of issue-ad
money: prices 43% D, 44% R; corruption 47% D, 16% R; health 34% D, 16% R; democracy 13% D, 2% R;
war 10% D, 3% R; immigration 7% D, 20% R; crime 2% D, 17% R; socialism 1% D, 13% R.

Predictions (`emphasis_models.csv`):
- P1: -0.03 points per +10 share points (95% CI -0.95 to +0.90), n 37, strict sample; -0.14
  (-0.57 to +0.30), n 119, Democrat-only. The positive sign predicted in section 6 does not
  appear; the interval rules out any effect above about +1 point per +10 share points.
- P2: strict sample 21 races, +6.9 share points (-75 to +89), uninformative. Democrat-only:
  progressive minus moderate -32.3 share points (-67.1 to +2.4), n 62. Not confirmed: the point
  estimate is far outside the predicted 5-point band, and the interval is too wide to settle it.
- P3: +0.9 points per SD of Republican socialism spend per vote (-0.4 to +2.3), n 36. Holds: no
  reliable link, and the sign runs against the claim that the attack hurt Democrats.
- P4: median price gap +1.5 share points; the Democrat's price share was higher in 53% of 32
  races and tied in 6%. Holds narrowly; the two parties are close to even.

> **[Claude — honest correction]** Section 12 reported P4 as failing, with the Democrat ahead in
> "38% of 23 races". That share divided by every race in the sample, including races where one
> candidate ran no issue ads (gap undefined). `emphasis_models.py` now divides by races with a
> defined gap. With the corrected count and the re-fetched files, P4 holds narrowly (53% of 32,
> median +1.5 points). The substantive reading of section 12 stands: both parties spent about the
> same share on prices, and Democrats differed on corruption and health care.
