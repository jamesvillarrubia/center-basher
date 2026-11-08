# leadership_endorsements.csv: sources, searches, gaps

Built 2026-11-08 for reqts/midterm-2026-leadership-and-price-frames.md, Part A. This pass only collects rows. It compares nothing with results.

## Column conventions

- `pre_primary` compares `endorse_date` with `primary_date`. It is blank when the date is unknown or when an upper-bound date falls after the primary.
- `endorse_date_precision = unknown` means no announcement date was found. `endorse_date` then holds the date of the earliest dated source that shows the endorsement existed (an upper bound), or is blank when no dated source exists. `pre_primary` is `true` only when that upper bound precedes the primary.
- `endorse_date_precision = month` rows carry the first day of the month (Espaillat 2026-05, Conley 2026-10).
- `primary_date`: from `house_primaries.csv` for the candidate, else the modal date for the state in that file. Alaska (2026-08-18), California (2026-06-02) and Washington (2026-08-04) come from `data/raw/midterm2026/sources/ncsl_2026_primary_dates.html`. Senate dates: ME 06-09, MI 08-04, NC 03-03, OH 05-05, AK 08-18, MN 08-11, TX 03-03, MS 03-10 (same state dates).
- `primary_outcome` rule, in order: (1) overrides below; (2) `house_primaries.csv` row with a `primary_winner` value (`unopposed` when `primary_pct` is 100); (3) a row with blank pct: compare `house_all.csv` `dem_nominee` with the candidate (`won`, `lost`, or `unopposed` when the district has one primary row); (4) candidate absent from `house_primaries.csv` (California top-two, Washington): same nominee comparison, noted below.
- Overrides: Julie Johnson `lost` (the file shows `True` for advancing to the 2026-05-26 runoff; Allred won the runoff, Texas Tribune 2026-05-26). Jared Golden `unknown` (did not seek reelection). Bill Hill `won` (advanced from Alaska's all-party primary; he runs as an independent). Mike Thompson `unknown` (`house_all.csv` lists CA-04 nominee "Eric Jones", which conflicts with Thompson being a Democratic incumbent; not resolved). Janet Mills `unknown` (suspended her campaign 2026-04-30, before the primary).
- California rows (Bains lost, von Wilpert, Harder, Gray, Whitesides, Tran, Min, Sanchez, DeSaulnier won): nominee comparison against `house_all.csv`, because top-two primaries are not in `house_primaries.csv`. The Bains `lost` value means a different Democrat (Randy Villegas) is the CA-22 nominee in `house_all.csv`.
- `unopposed` for single-row districts (Hayes, Davis, Pou, Vasquez, Horsford, Riley, Mannion, Kaptur, Sykes, Soto, Castor) reflects coverage of `house_primaries.csv`, not a ballot check.
- Frontline rows 2025-03-06 also include members who later left the program (Harder, Whitesides, Min, Golden, Mannion). They are on the original 26-member list.

## Row counts

103 rows: dccc_red_to_blue 43, dccc_frontline 31, jeffries 15, schumer 9, dscc 3, schumer_recruit 2. hmp_primary 0, smp_primary 0.

## Sources used, by endorser

**dccc_red_to_blue.** Seven announcement waves, each from a news article that lists the names (dates are the announcement dates):
- 2026-02-23, 12 candidates: Roll Call, rollcall.com/2026/02/23/democrats-dccc-challengers-midterm-elections/. DCCC release named in a WebFetch summary matched.
- 2026-05-04, 8: Roll Call 2026/05/04; DCCC release (dccc.org/dccc-announces-eight-new-candidates-to-coveted-2026-red-to-blue-program/) read through WebFetch.
- 2026-06-04, 4: Washington Examiner ?p=4594471; DCCC release dccc.org/dccc-announces-four-new-candidates-to-coveted-2026-red-to-blue-program/ (WebFetch).
- 2026-07-28, 5: Fox News print page (Shah AZ-01, Dandiya FL-22, James IA-02, Johnson MN-01, Forstag MT-01). Shah's primary was 2026-07-21, so his row is post-primary; the DCCC had backed his primary opponent Galan-Woods (R2B 2026-05-04).
- 2026-08-20, 5: Roll Call 2026/08/20. Dunlap (ME-02) beat DCCC-backed Baldacci in the June primary and was added afterward.
- 2026-09-15, 3: Roll Call 2026/09/15. Hill (AK-01) runs as an independent, not a Democrat.
- 2026-10-05, 6: Colorado Politics 2026-10-06 ("announced Monday"; "bringing the total to 46").
Quotes for these rows were checked against the fetched article text (substring match). Quote check: 95 of 103 rows have a quote matched against saved page text (83 by the build script, 12 Roll Call 2026-02-23 rows by hand); see gap 4 for the rest.

**dccc_frontline.** Initial list 2025-03-06 (26 incumbents): Roll Call, rollcall.com/2025/03/06/dccc-frontline-house-democrats-midterm-elections/ (names matched verbatim); DCCC release dccc.org/dccc-announces-members-of-2026-frontline-program through WebFetch gave the same 26 names. Five incumbents appear on the live dccc.org/frontline page (fetched 2026-11-08) but not in the 2025-03-06 list: Figures AL-02 (added after Alabama's new map, Alabama Daily News), Soto FL-09, Castor FL-14, Moskowitz FL-25 (new Florida map), Landsman OH-01. No dated source for those additions was found, so their date, `pre_primary` are blank.

**jeffries.** Dated news: NY Daily News (Goldman, "on Monday" in a 2026-01-06 article, so 2026-01-05), Bronx Times (Torres 2026-03-16), WTNH headline (Larson 2026-02-12, via Wikipedia citation), STLtoday headline (Bell 2026-04-08, via Wikipedia citation), IANS (Thanedar 2026-07-20), Amsterdam News 2026-05-21 (Espaillat, "as of last week"), Omar campaign release (2025-11-09), OC Register (Sanchez 2025-11-10), Gillen campaign post (2026-02-16, upper bound), Texas Tribune 2026-05-06 (Johnson, upper bound; the primary was 2026-03-03 and the runoff 2026-05-26, so `pre_primary` is blank), InsiderNJ 2026-10-10 (Bennett rally, Friday 2026-10-09), American Prospect 2026-10-29 (Conley rally, about 2026-10-24). Undated: Underwood and DeSaulnier (Wikipedia endorsement boxes, wikitext verified), Thompson (his campaign endorsements page). The Underwood box cites a Daily Herald article that returned 212 bytes to curl; the Daily Herald text was not read.
Searched without a finding: Steve Cohen (the Cohen campaign page lists leadership endorsements but is undated and Cohen left the race in May 2026; not included). Debbie Wasserman Schultz: Jeffries declined to back her on 2026-06-02 (Jewish Insider); no row. Jeffries also did not endorse in the NY-12 open seat (Manhattan Daily, via search summary).
Cross-check: `house_primaries.csv` `e_jeffries` had 8 rows (Larson, Underwood, Thanedar, Bell, Gillen, Goldman, Torres, Johnson). All 8 are in the output. Seven more were added (Espaillat, Omar, Sanchez, Thompson, DeSaulnier, Bennett, Conley).

**schumer, dscc, schumer_recruit.** Cooper (Schumer and Gillibrand joint statement 2025-07-28, CNN via KESQ; coded both schumer and dscc). Mills (Hill headline 2025-10-21; Boston Globe 2026-01-17 "Schumer and the Democratic Senatorial Campaign Committee ... are backing Mills"). Platner (WBUR and Press Herald 2026-04-30 after Mills withdrew; Wikipedia records both endorsements rescinded 2026-07-06). Stevens (Detroit News headline 2026-06-17, via Wikipedia). El-Sayed (Just The News 2026-08-05, post-primary). Talarico (Wikipedia post-primary endorsement box, The Hill 2026-03-04). Colom (Supertalk 2026-10-22, listed under post-primary endorsements on Wikipedia). Brown and Peltola (Semafor 2026-01-14, Schumer on recruits). Peltola recruit report (Axios 2025-08-13, headline "Scoop: Schumer courts Peltola for Alaska Senate race", via Wikipedia). Craig (Wikipedia citing NYT 2025-11-24: private backing from Schumer, Gillibrand and the DSCC, no endorsement; coded schumer_recruit).
A DSCC spokesperson reportedly told Newsweek the committee "has not made any formal endorsements this cycle" (seen in a search summary only). The three dscc rows record reported backing, not formal endorsements.

**hmp_primary, smp_primary.** FEC API with DEMO_KEY. HMP committee C00495028 and SMP committee C00484642 both resolved to the expected names. HMP: pulled all 210 `schedule_e` rows with `support_oppose_indicator=S` for cycle 2026; all but a few 2025 special-election rows have `election_type` G2026, so zero primary rows. SMP: zero schedule E rows returned for 2025 onward. DEMO_KEY then began returning rate-limit errors, which stopped an attempt to pull 24/48-hour notice rows separately (`is_notice=true` showed 1,840 HMP rows for the period, mostly G2026). This is not exhaustive. Neither committee has a row in the CSV.

## Searches that returned nothing usable

Schumer or DSCC endorsement for Turek (IA), Pappas (NH), Ossoff (GA) and Flanagan (MN): no statement found. `races.csv` b_source says no formal Schumer or DSCC endorsement for Turek. Vindman (FL): no source found for the NOTUS "leadership recruit" claim in `races.csv`. Schumer-Colom recruitment (Mississippi Today 2026-09-21 per `races.csv`): not fetched. DSCC statements on Mississippi and Michigan (dscc.org): 403. Schumer "staying out of Maine" on Jackson (Politico 2026-07-15): not an endorsement, no row.

## Known gaps

1. **Jeffries is incomplete.** No public list exists. The Ballotpedia page "Endorsements by Hakeem Jeffries" returned an empty body to curl and WebFetch. The VoteHub tracker is JavaScript-rendered. Spectrum Vote (derived from Wikipedia) listed 11 candidates; seven House primary rows come from there or from Wikipedia boxes. Jeffries said "I stand behind every single House Democratic incumbent" (Axios 2026-06-02, via search summary), and leadership-team endorsements of most incumbents are likely undocumented here.
2. **Red to Blue count.** The seven waves sum to 43 (12+8+4+5+5+3+6). Roll Call reported 37 after 2026-08-20 and 46 after 2026-10-05, Bloomberg 30 after 2026-07-28. The gap suggests a wave or holdovers not found. No DCCC list page was readable (Cloudflare 403 after the first requests).
3. **Frontline.** No dated source for the five later additions. Redistricting changed some district numbers; race ids follow the DCCC wording (Moskowitz FL-25).
4. **Headline-only quotes (4 rows).** Source pages blocked curl, so the quote is the article headline copied from a Wikipedia citation: WTNH (Larson), Hill (Mills), Detroit News (Stevens), Axios (Peltola recruit). The Bell quote is the STLtoday headline, which does not name Jeffries; Wikipedia lists Jeffries in the Bell endorsement box citing it. Wikipedia wikitext matched for Underwood, DeSaulnier, Craig, Talarico. WebFetch summaries (not saved text) supplied the Frontline release and DCCC press release details; the Roll Call lists and the live Frontline page matched.
5. **Wikipedia-only rows** (Underwood, DeSaulnier, Craig, Talarico) rest on a Wikipedia endorsement box or sentence, which cites a source this pass did not read.
6. **Mills and Platner** rows are retained although Mills withdrew and Platner's endorsements were rescinded; the final nominee in `races.csv` is Troy Jackson, who has no leadership row.
7. House Majority PAC and Senate Majority PAC primary spending: none found (see above).
