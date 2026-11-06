# 2026 midterms: moderate overperformance dataset

Data behind `reqts/midterm-2026-moderate-overperformance.md`. One row per race in
`races.csv`: every 2026 Senate race, plus every House district whose Democratic
primary pitted a progressive-backed candidate against a moderate- or money-backed one.
All counts are unofficial, as reported on 2026-11-05 (two days after the election).

## Rebuild

```bash
P=/opt/homebrew/anaconda3/bin/python   # pandas 2.2.3, statsmodels 0.14.6
$P scripts/midterm2026/fetch_raw.py            # step 0: raw inputs not fetched elsewhere
$P scripts/midterm2026/build_endorser_lists.py # step 1: NewDem / Welcome / Justice Democrats lists
$P scripts/midterm2026/build_house_primaries.py# step 2: Wikipedia primary endorsements + results
$P scripts/midterm2026/build_races.py          # step 3: races.csv, house_all.csv
$P scripts/midterm2026/build_controls.py       # step 3b: controls.csv, merged into races.csv (run after step 3)
$P scripts/midterm2026/build_baselines.py      # step 3c: baselines.csv, merged into races.csv (run after step 3b)
$P scripts/midterm2026/analyze.py              # step 4: regressions.csv, summary.json, house_flips.csv
$P scripts/midterm2026/pooled.py               # step 4b: pooled Senate+House rows appended to regressions.csv (run after step 4)
$P scripts/midterm2026/baselines_analysis.py   # step 4c: baseline_regressions.csv, baseline_sensitivity.csv (run after 4b)
$P scripts/midterm2026/anova.py                # step 4d: anova_tables.csv, anova_permutation.csv, anova_effect_sizes.csv (run after 4c; ~40 s)
$P scripts/midterm2026/build_figure.py         # step 5: web/og-cards/draft-midterm-overperformance.html
$P scripts/midterm2026/check.py                # pins numbers to sources; prints "N passed, M failed"
```

Every network response is cached under `data/raw/midterm2026/` (CNN, Wikipedia,
Downballot, endorser pages, news sources) and `data/raw/fec/` (FEC bulk files and
API pages). A rerun reads the cache and makes no request. `data/raw/` is git-ignored,
so a fresh checkout refetches, and a refetch after 2026-11-05 returns later counts.

## Sources

| Input | Source | Fetched |
|---|---|---|
| 2026 Senate, House, governor results | CNN results API, `politics.api.cnn.io/results/national-races/2026-{SG,HG,GG}.json` | 2026-11-05 ~21:40 UTC (`cnn_extracted_at`) |
| 2024 presidential, by state | CNN results API, `2024-PG.json` | 2026-11-05 |
| 2024 presidential, by 2026 district lines | The Downballot, sheet `1eZfaFI-…` tab `1491069057`, linked from the-downballot.com/p/the-downballots-calculations-of-presidential (modified 2026-10-28) | 2026-11-05 |
| Senate race ratings | Wikipedia "2026 United States Senate elections", Predictions table, Cook column dated Nov 2 2026 (revision in `wiki_revid`) | 2026-11-05 |
| Primary candidates, endorsements, primary results | Wikipedia state race pages (revisions in `wiki_revisions_house.csv`; Senate revid in `races.csv`) | 2026-11-05 |
| Moderate PAC lists | newdemactionfund.com/candidates (50 names), welcome.team/elect "OUR 2026 SLATE" (14) | 2026-11-05 |
| Progressive list | justicedemocrats.com/candidates (15 upcoming-election names) | 2026-11-05 |
| Outside spending | FEC bulk `independent_expenditure_2026.csv` (Last-Modified 2026-11-05 10:14 GMT) | 2026-11-05 |
| Candidate receipts | FEC bulk `weball26.zip`, `cn26.zip` (coverage end in `receipts_cvg_end`) | 2026-11-05 |
| UDP transfers, pass-through PAC donors | FEC API Schedule B (C00799031), Schedule A (6 committees), cached in `data/raw/fec/` | 2026-11-05 |

Blue Dog PAC (connection refused) and Our Revolution (404) did not serve a list. Their
endorsements enter only through Wikipedia endorsement boxes, plus three names Third
Way's Nov 5 memo calls cross-endorsed (Forstag MT-01, Brooks PA-07, Poindexter OH-07).

## Files

| File | Rows | Content |
|---|---|---|
| `races.csv` | 68 | 35 Senate races + 33 House contested-primary districts |
| `house_all.csv` | 436 | Every House race (national baseline) |
| `house_flips.csv` | 42 | Republican-held (2025 incumbent) districts a Democrat won, with moderate / progressive endorsement flags |
| `house_primaries.csv` | 1,019 | Every Democratic primary candidate found on Wikipedia, endorsement flags `e_*` |
| `endorser_lists.csv` | 79 | Names from the NewDem, Welcome and Justice Democrats pages |
| `regressions.csv` | | Every model term: n, coefficient, HC3 SE, 95% CI, p, R² |
| `summary.json` | | Group means, terrain baselines, money totals |
| `wiki_revisions_house.csv` | 50 | Wikipedia revision id per state House page |
| `controls.csv` | 44 | Recognition and campaign-length controls per analysis nominee (also merged into `races.csv`) |
| `collinearity_corr.csv` | | Pairwise Pearson r among coding dummies, incumbency, prior office, fame, log pageviews, days on trail, days primary-to-general, Harris margin, outside money; per chamber |
| `collinearity_vif.csv` | | VIFs of each regressor in three designs (controls; + incumbency; + incumbency, fame, log pageviews), per chamber and coding |
| `seven_moderates.csv` | 7 | Third Way's seven Senate moderates, split by pre-primary Schumer backing |
| `pooled_interactions.csv` | | Coding/control × Senate interaction terms from the pooled models, cluster and wild-bootstrap CIs |
| `pooled_joint_tests.csv` | 8 | Joint tests that the Senate interactions are zero: cluster Wald F, HC3 F, wild restricted bootstrap p |
| `baselines.csv` | 44 | Alternative baselines per analysis row (also merged into `races.csv`) |
| `national_environment.csv` | 6 | National D−R margin per cycle, summed from CNN feeds (2020/2024 president; 2020/2022/2024/2026 House) |
| `baseline_regressions.csv` | | Coding coefficient per baseline × raw/swing-adjusted × coding × spec × scope (S, H, P), wild cluster bootstrap CIs; `harris24@<b>` rows rerun Harris 2024 on baseline b's rows |
| `baseline_sensitivity.csv` | | Compact table of the above: rows = baseline, columns = coding (a)/(b) × Senate/House, pooled (b) |
| `seven_moderates_by_baseline.csv` | 7 | Third Way's seven Senate moderates, overperformance under each baseline |
| `anova_tables.csv` | | ANOVA tables, pooled rows: `baseline` (harris24, pres2cyc, prior_seat) × `coding` × `spec` × `model` (`additive`; `ancova2` = coding × chamber + terrain) × `typ` (2 = anova_lm Type II; 3 = Type III with sum-to-zero contrasts). Columns `sum_sq`, `df`, `F`, `p_classic`, `partial_eta2`, `partial_omega2`, `share_of_model_ss`, `share_of_total_ss`, `n`, `r2`. Row `shared (not attributable)` = model SS minus the sum of Type II term SS (negative under suppression) |
| `anova_permutation.csv` | 24 | Type II F for coding (and coding × chamber) with classic p, state-block permutation p (`p_perm_block`), within-chamber permutation p (`p_perm_strata`), 9,999 permutations, `distinct_block_relabelings` (how many label assignments the block scheme can produce), `rows_in_exchangeable_blocks` |
| `anova_effect_sizes.csv` | 12 | Coding term's partial eta^2 and partial omega^2 in the additive models, with 95% state-cluster bootstrap percentile CIs (9,999 resamples of states) |

**`regressions.csv` columns.** `chamber` (`S`, `H`, or `P` = pooled), `coding`, `spec`,
`y`, `term`, `n`, `n_coded_1`, `coef`, `se_hc3` (per-chamber rows), `ci_lo`/`ci_hi`
(HC3 for S and H rows; state-clustered CR1 for P rows), `p`, `r2`, `df_resid`, `cov`.
Pooled rows add `sample` (`all`, `drop House <90% counted`, `drop FL (Nixon)`),
`n_senate`, `clusters`, `se_cluster`, `ci_wild_lo`/`ci_wild_hi` (wild cluster
bootstrap-t, Rademacher per state, 9,999 draws, seed 20261105) and `ci_hc3_lo`/`ci_hc3_hi`.
| `figure_draft_S.png`, `figure_draft_H.png` | | Headless-Chrome renders of the draft figure at 1600×900 |

## `races.csv` columns

**Identity and result**

| Column | Definition |
|---|---|
| `race_id` | `ST-S` (Senate) or `ST-DD` (House) |
| `chamber` | `S` or `H` |
| `competitive` | Senate: Cook rating (Nov 2 2026) not "Solid". House rows: always true (selected by primary rule) |
| `cook_rating` | Cook rating string from the Wikipedia table, e.g. `Tossup`, `Lean_D`, `Solid_R` |
| `dem_nominee`, `dem_last` | Top Democratic vote-getter in CNN's feed. Blank when no Democrat ran (ID, NE, SD) |
| `dem_incumbent`, `rep_incumbent` | CNN `isIncumbent` for the top D and top R |
| `dem_votes`, `rep_votes`, `total_votes` | CNN vote counts; `total_votes` includes all candidates |
| `pct_reporting` | CNN percent of expected vote counted. California, Arizona, Utah and several NY/IL districts are below 90 |
| `dem_won` | CNN winner flag (a call), not certification |
| `dem_vs_rep` | Both a D and an R received votes, and no independent outpolled the D. Analysis rows require it |
| `indep_outpolled_dem` | A non-D, non-R candidate beat the Democrat (MT Senate, NE Senate has no D) |
| `dem_margin` | (D votes − R votes) / total votes × 100 |
| `harris_margin` | 2024 Harris minus Trump share of all votes × 100. Senate: CNN by state. House: The Downballot on 2026 lines |
| `over_vs_harris` | `dem_margin − harris_margin`: Third Way's "ran N points ahead of Harris" metric |
| `house_statewide_margin` | Senate rows: (summed D − summed R House votes) / summed House votes × 100, from CNN. Blank when more than one district lacked a D-vs-R contest or an independent outpolled a Democrat (AK, MA) |
| `over_vs_house_statewide` | `dem_margin − house_statewide_margin`: Third Way's "ran N points ahead of House Democrats" metric |
| `over_vs_state_house_mean` | House rows: `over_vs_harris` minus the mean `over_vs_harris` of all contested House races in the same state |
| `gov_dem_margin` | 2026 governor D margin in the same state (CNN `2026-GG`), for Third Way's governor comparisons |

**Coding (a): Third Way's label**

| Column | Rule |
|---|---|
| `coding_a_thirdway` | Senate: the label Third Way's memos give (`moderate`: Ossoff, Cooper, Talarico, Andrews, Hamilton, Turek, Brown; `leftier`: El-Sayed, Flanagan, Jackson; Nixon `leftier` by implication, since the memo sets "moderate" Jolly against her). AK, MS, NH not coded by Third Way: blank. House: `moderate` if the nominee is on the NewDem Action Fund or Welcome list, has a Welcome/NewDem/Blue Dog Wikipedia endorsement, or is one of the three memo-named cross-endorsees (Third Way's own operationalization). Otherwise `leftier` if any progressive group (Justice Democrats, Our Revolution, PCCC, CPC, WFP, DSA, Sanders, Ocasio-Cortez) endorsed the nominee, else `unaligned` |
| `nominee_mod_pac_endorsed`, `nominee_prog_endorsed` | The two House flags behind that rule |

**Coding (b): pre-primary establishment backing** (definition reused from `reqts/establishment-party.md` §2)

| Column | Rule |
|---|---|
| `b_anointed_strict` | Senate: formal endorsement or announced recruitment by Schumer or the DSCC, or an AIPAC/DMFI/crypto/AI endorsement or primary IE, before the primary. Hand-coded per state; sources in `b_source`. House: a pre-primary (citation dated before the state's primary, or undated) Wikipedia endorsement from DCCC, Jeffries, House Majority PAC, AIPAC, DMFI or Fairshake; or primary IE by an AIPAC/crypto/AI committee for the nominee or against a rival |
| `b_anointed_soft` | Senate: strict, plus reported leadership preference without formal endorsement (IA Turek: DSCC donor event, VoteVets money; MS Colom: Schumer recruiting meetings). House: same as strict |
| `b_anointed_incl_modpac` | House: strict, plus a pre-primary-dated Welcome/NewDem/Blue Dog Wikipedia endorsement (the brief lists "Third Way-aligned PACs" under (b)). Equal to strict for every analysis row |
| `b_insider` | Sitting or former elected officeholder, congressional staffer or lobbyist at filing. Senate hand-coded; House from incumbency or a regex on the Wikipedia candidate description |
| `b_funded` | PAC share of receipts (`pac_share`) in the top quartile among analysis-set nominees of that chamber. End-of-cycle proxy, not pre-primary |
| `b_establishment_2of3` | At least two of anointed (strict), insider, funded |
| `coding_b_anointed` | Text label of `b_anointed_strict` |
| `b_source` | Source note for the (b) coding of that row |

**Money** (all dollars nominal; FEC; IE = independent expenditure)

| Column | Definition |
|---|---|
| `fec_cand_id` | FEC candidate id matched on state, office, district and surname |
| `receipts`, `receipts_pac`, `pac_share`, `receipts_cvg_end` | Total receipts, receipts from other political committees, their ratio, and the coverage end date (weball26) |
| `rep_receipts` | Republican nominee's receipts |
| `dollars_per_vote_receipts` | `receipts / total_votes` |
| `over_per_dollar_per_vote` | `over_vs_harris / dollars_per_vote_receipts`: points ahead of Harris per dollar raised per vote cast |
| `ie_gen_for_dem`, `ie_gen_against_dem` | General-election (`ele_type = G`) IE supporting the D or opposing the R; opposing the D or supporting the R |
| `net_outside_against_dem_gen` (`_per_vote`) | `ie_gen_against_dem − ie_gen_for_dem`, and per vote cast. The money control in the regressions |
| `ie_prim_for_nominee`, `ie_prim_against_nominee` | Primary (`ele_type = P`) IE supporting the nominee or opposing a primary rival; opposing the nominee or supporting a rival |
| `{aipac,crypto,ai}_prim_{for,against}_nominee`, `{aipac,crypto,ai}_gen_{for,against}_dem` | The same split, restricted to the money groups below |
| `money_prim_for_nominee`, `money_prim_against_nominee` | Sums over the three groups |

Money groups, matched on FEC committee id:

- **aipac**: United Democracy Project C00799031, DMFI PAC C00710848, and committees that received ≥ $1M from UDP in 2025-26 per FEC Schedule B: Elect Chicago Women C00936724, Bold America C00854299, EDW Action Fund C00863472, SD PAC C00757419, Affordable Chicago Now C00935049, Palmetto Action C00950600. A pass-through's whole IE total counts, including any share not funded by UDP.
- **crypto**: Fairshake C00835959, Protect Progress C00848440, Defend American Jobs C00836221.
- **ai**: Think Big C00923417, American Mission C00916692 (the Leading the Future affiliates; no IE filed under the parent name).

IE cleaning: drop rows whose `file_num` a later filing names as `prev_file_num`
(superseded by amendment); drop exact repeats of (spender, candidate,
support/oppose, amount, date, payee, purpose); drop single line items ≥ $100M (junk
Form 5 filings listing "Warren Buffet" and "TANKING" at $1-9 billion). Not
captured: super PACs whose funders are unknown or outside the three groups (e.g.
A Stronger Michigan, funded by Center Forward; North Star Dawn PAC, funded by Civic
Progress Fund; Lone Star Rising PAC, funded mostly by Reid Hoffman). Their spending
counts in `ie_*` columns but not in group columns.

**Provenance**

| Column | Definition |
|---|---|
| `wiki_page`, `wiki_revid` | Wikipedia page used for the primary and endorsements (Senate revid; House revids in `wiki_revisions_house.csv`) |
| `cnn_extracted_at` | CNN feed extraction time |
| `nominee_description`, `primary_rivals` | Wikipedia candidate description; surnames of other primary candidates |

**Starting recognition and time on the trail** (`build_controls.py`; analysis rows only, 44 nominees)

| Column | Definition |
|---|---|
| `nominee_wiki`, `wiki_revid_nominee` | Source for the office and fame coding: the nominee's Wikipedia article and the revision read on 2026-11-05 |
| `prior_office` | Highest office held at launch, ordinal: 3 statewide elected by voters (governor, lieutenant governor, U.S. senator, statewide row office; Alaska's at-large U.S. House seat counts as statewide), 2 U.S. House, 1 state legislature or a citywide office in a top-25 U.S. city, 0 none of these. Hand-coded from the article's lead |
| `prior_office_note` | The office(s) the code rests on, as stated in the article |
| `local_office` | 1 if the nominee held only county, municipal or district-attorney office (coded 0 above) |
| `fame_flag`, `fame_note` | 1 if the article documents prominence outside elected office that predates launch (Paralympic medals, national media, megachurch pastor, a famous political family) |
| `poll_name_id`, `poll_name_id_note` | Pre-launch public-poll name ID. Missing for all 44: searches for TX, KS, SC, IA found only post-launch polls; the rest were not searched |
| `pageviews_12m_pre_launch` | Wikimedia REST pageviews (agent=user, all access), 12 full months ending the month before `pageviews_anchor`, summed over the article and every title redirecting to it. Cross-check only |
| `pageviews_redirects_counted`, `pageviews_anchor`, `pageviews_anchor_source`, `pageviews_flag` | Redirects summed; window anchor (announcement, else FEC Form 2, else 2025-01-01); its source; known undercounts (TX-34) |
| `fec_f2_first_2026`, `fec_f2_status` | Receipt date of the earliest FEC Form 2 with election year 2026 (FEC API `/filings/`, form F2, receipts since 2020-11-04); status when the API was unavailable |
| `announce_date`, `announce_precision`, `announce_note` | Public announcement date and the article sentence it comes from. Month-precision dates are set to the 1st |
| `launch_date`, `launch_source` | Late replacement date, else FEC Form 2 receipt, else the announcement date (flagged in `launch_source`) |
| `late_replacement`, `late_replacement_note` | 1 for Jackson (ME): nominated by convention 2026-07-25 after Platner withdrew |
| `launch_vs_announce_days` | FEC Form 2 date minus announcement date (day-precision rows) |
| `days_on_trail` | 2026-11-03 minus `launch_date`, in days. Regressions use `trail100` = days / 100 |
| `primary_date` | State primary date from NCSL's 2026 table (`_primary_dates.py`) |
| `days_primary_to_general` | 2026-11-03 minus `primary_date` |
| `days_nominee_to_general` | Same, except Jackson, counted from his 2026-07-25 nomination |

**Alternative baselines** (`build_baselines.py`; analysis rows only). Every value is a
Democratic-minus-Republican margin as a share of all votes × 100, same geography as the
2026 race.

| Column | Definition and source |
|---|---|
| `base_harris24` | Harris 2024 (= `harris_margin`) |
| `base_biden20`, `biden20_source` | Biden 2020. Senate: CNN `2020-PG`. House: The Downballot 2020 on 2026 lines; where that tab is blank (AL, CA, FL, LA, NC, OH, TN, TX, UT) the 2024-lines figure is used only if the district did not move (`redrawn_2024_2026` false), else blank |
| `base_pres2cyc` | Mean of `base_harris24` and `base_biden20` |
| `base_prior_seat`, `prior_seat_cycle`, `prior_seat_env`, `prior_seat_dem`, `prior_seat_rep` | Senate: last regular election for the seat (CNN `2020-SG`; Georgia = Jan 5 2021 runoff; FL and OH specials use the seat's 2022 regular race). House: 2024 House result in the district (CNN `2024-HG`); blank if the district was redrawn for 2026 or the 2024 race lacked a D or an R |
| `base_midterm22`, `midterm22_note`, `midterm22_dem`, `midterm22_rep` | Senate: 2022 Senate race in the state (CNN `2022-SG`, Georgia's Nov 8 first round); blank where no race was held (ME, MI, MN, MS, TX) or no Democrat finished top two (AK). House: 2022 House result (CNN `2022-HG`); blank if the district was redrawn between 2022 and 2026 or the race lacked a D or an R |
| `base_house26` | Senate rows: 2026 statewide House vote (= `house_statewide_margin`) |
| `redrawn_2024_2026`, `redrawn_2022_2024` | District moved between line sets: Harris margin on 2026 vs 2024 lines, or Biden margin on 2024 vs 2022 lines, differs by more than 1 point (The Downballot's 2024-lines sheet rounds to whole points). Senate rows: false |
| `prior_seat_same_dem`, `midterm22_same_dem` | The baseline race had the same Democratic candidate (surname match): candidate-effect contamination |
| `prior_seat_same_rep`, `midterm22_same_rep` | The baseline race had the same Republican (surname match; SC excluded: Lindsey vs Darline Graham). Surname matching can flag different people with one surname |
| `baseline_notes` | Free-text caveats (AK's 2020 Democratic nominee ran as an independent; uncontested or redrawn races) |
| `over_<b>` | 2026 `dem_margin` minus `base_<b>` |
| `swing_<b>`, `over_<b>_adj` | National 2026 House margin minus the national margin of the baseline's cycle (`national_environment.csv`; presidential baselines use the presidential vote, others the House vote of that cycle), and the swing-adjusted overperformance `over_<b> − swing_<b>` |

**Primary dates and the pre-primary rule.** Until 2026-11-05 the House builder took each
state's primary date from a regex over Wikipedia's lead text, which picked up filing
deadlines and other nearby dates (Texas Jan 15 instead of Mar 3; Illinois Feb 5
instead of Mar 17). Endorsements dated between the wrong and the right date were wrongly
excluded as post-primary. The NCSL table now supplies the dates. The fix adds IL-07 to the
House universe and changes no coding of an existing row; Pearson (TN-09) moved from
insider 0 to 1: the nominee match had picked a duplicate row (a name variant) with no description, and rows for one person's name variants are now merged.

## House universe rule

A district enters `races.csv` when its Democratic primary had two different candidates:

1. one with a progressive marker: a Wikipedia endorsement from Justice Democrats, Our Revolution, PCCC, CPC, WFP, DSA, Sanders or Ocasio-Cortez; a place on the Justice Democrats list; or AIPAC/crypto/AI primary IE against them; and
2. one with a moderate or money marker: a Wikipedia endorsement from Welcome, NewDem, Blue Dog, AIPAC, DMFI, Fairshake, DCCC, Jeffries or House Majority PAC; or AIPAC/crypto/AI primary IE for them.

33 districts qualify; 30 had a D-vs-R general (IL-07 joined after the primary-date fix). Wikipedia's endorsement boxes are
incomplete, so the rule misses contested primaries whose endorsements nobody listed.
