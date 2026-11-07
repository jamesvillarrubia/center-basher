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
