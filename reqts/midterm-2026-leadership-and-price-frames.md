# 2026: leadership endorsements and price positions

Status: spec, written 2026-11-08 before any endorsement list was matched to results and before
any price-position code was assigned. Predictions in sections 3 and 6 are frozen; results go in
a new dated section, never edits to these.

## Part A. Schumer and Jeffries endorsements

### 1. Questions

1. Did Democratic nominees backed by party leadership before their primary run further ahead of
   Harris than other Democratic nominees?
2. Did leadership withhold backing from Democrats who went on to win competitive seats?
3. In contested primaries, did leadership-backed winners do better or worse in November than
   winners who beat a leadership-backed rival or ran without leadership backing?

### 2. Data

`data/derived/midterm2026/leadership_endorsements.csv`, one row per endorsement, columns:
race_id, chamber, candidate, endorser, endorse_date, endorse_date_precision, pre_primary
(endorse_date before the primary date), primary_outcome, source_url, source_quote.

Endorsers counted as leadership:
- House: Hakeem Jeffries (personal endorsement), DCCC Red to Blue, DCCC Frontline (incumbents),
  House Majority PAC primary spending for a candidate.
- Senate: Chuck Schumer (endorsement or reported recruitment with a public statement of support),
  DSCC endorsement, Senate Majority PAC primary spending for a candidate.

Every row carries a source URL and a quoted line. A "reported recruit" with no public statement
of support is recorded as endorser `schumer_recruit` and analysed separately.

Contested primary: the nominee won with under 70% of the vote, or a leadership-backed candidate
lost the primary.

### 3. Predictions (frozen 2026-11-08)

- L1: Pre-primary leadership backing has no reliable link to over_vs_harris (95% interval
  crosses zero), same controls as house_drivers (state, seat type, harris_margin), then adding
  log_money_ratio. This matches the "anointed" coding in midterm-2026-moderate-overperformance.md.
- L2: At least 5 Democrats won a House seat rated competitive (Cook toss-up, lean or likely) or
  flipped a Republican seat without pre-primary leadership backing.
- L3: In contested primaries, nominees who beat a leadership-backed rival run no worse in
  November (difference in over_vs_harris above -2 points) than leadership-backed nominees.

## Part B. Price positions in ads

### 4. Question

Section 13 of midterm-2026-emphasis.md found both parties spent about the same share of ad money
on prices. This pass codes what each price or health ad says about prices: who it blames and
what it proposes. The question is which price position went with running ahead of Harris.

### 5. Codebook (frozen)

Units: every distinct ad text the model coder marked prices or health (about 3,000), names
masked. A text can carry several codes in each group.

Cause blamed:
| Code | In |
|---|---|
| c_tariffs | Trump's tariffs or trade war raising prices |
| c_war | the Iran war or other foreign war spending raising prices or costing families |
| c_trump_gop | Trump, Republicans or their laws (the "Big Beautiful Bill", Medicaid cuts, tax cuts for the rich) raising costs, other than tariffs or war |
| c_corporate | corporations, price gouging, billionaires, Wall Street, private equity, monopolies, insurers, drug companies, landlords' corporations |
| c_dem_policy | Biden, "Bidenflation", Democratic spending, the Green New Deal, regulation |
| c_immigration | illegal immigration raising housing or other costs |
| c_none | no cause named |

Remedy proposed:
| Code | In |
|---|---|
| r_public | a public program: Medicare for All, a public option, universal child care, public or social housing, free public services |
| r_cap | a legal cap or ban: drug or insulin price caps, rent caps, a price-gouging ban, capping premiums |
| r_anticorp | taking on corporations: antitrust, breaking up monopolies, banning corporate PAC money as a cost remedy, banning stock trading as a cost remedy |
| r_taxcut | tax cuts: no tax on tips or overtime, middle-class tax cuts, cutting taxes |
| r_energy | more energy production, drilling, cutting energy regulation |
| r_housing | building more housing, zoning reform, housing supply |
| r_wages | raising wages, minimum wage, unions |
| r_endtariffs | ending or reversing tariffs |
| r_cutspend | cutting government spending, balancing the budget, ending waste |
| r_protect | protecting existing programs from cuts (Medicare, Medicaid, Social Security, ACA subsidies) |
| r_none | no remedy, or only "lower costs" / "make life affordable" with no means |

Villain: `villain` = 1 when the ad names an economic elite (corporations, billionaires, Wall
Street, insurers, drug companies, private equity, "the donor class") as the people hurting the
voter.

### 6. Predictions (frozen 2026-11-08)

Measures per Democratic candidate, general window, share of price-or-health ad money carrying
each code (spend midpoint).

- F1: villain share has a positive coefficient on over_vs_harris; its 95% interval may cross
  zero.
- F2: Trump-blame share (c_tariffs, c_war or c_trump_gop) has no reliable link to
  over_vs_harris.
- F3: vague share (c_none and r_none together) has a coefficient of zero or below.
- F4: Democrats and Republicans differ more on cause than on remedy: the largest party gap in
  mean share is on a cause code.

Models: `over_vs_harris ~ share + C(state) + C(seat) + harris_margin`, state-clustered SEs,
Democrats with at least $10,000 in general-window Meta spend and a complete ad file; then adding
log_money_ratio.

### 7. Reliability

200 units (100 per party, seed 20261108) coded blind by two coders from this codebook; the full
set coded blind in batches by the model coder. Bars: kappa against the two coders' consensus at
least 0.7 on every code used in a prediction (villain, c_tariffs, c_war, c_trump_gop, c_none,
r_none); a code below its bar is dropped from every model and the page says so.

## Won't

- No causal claim: candidates choose messages, and those who expect to win may choose
  differently.
- No TV, mail or Google ads.
- No new coding of non-price ads.

## 8. Price-position results (2026-11-08)

Reliability (`frame_reliability.csv`): the two blind coders agreed at kappa 0.83 to 1.00 on
every code with cases in the sample. The model codes against their consensus: villain 0.88,
c_tariffs 0.89, c_war 0.88, c_trump_gop 0.91, c_none 0.91, r_none 0.93; every other code 0.85
or above. c_immigration (no cases) and r_endtariffs (one case) cannot be scored and are left out.

Party gap, mean share of price-or-health ad money, candidates over $10,000 with complete files
(`frame_party_means.csv`):

| Position | Democrats | Republicans |
|---|---|---|
| Blames Trump (tariffs, war or GOP policy) | 32% | 1% |
| No cause named | 53% | 72% |
| Proposes tax cuts | 5% | 31% |
| Blames Biden or Democratic policy | 0.5% | 13% |
| Names an economic villain | 24% | 12% |
| Blames corporations | 20% | 12% |
| Proposes taking on corporations | 15% | 12% |
| Protects Medicare, Medicaid, Social Security | 11% | 7% |
| Proposes a public program | 6% | 0.2% |
| No remedy named | 58% | 48% |

Predictions (`frame_models.csv`, 109 Democrats):
- F1 (villain share positive): fails. -0.34 points per +10 share points (95% CI -0.66 to
  -0.03); with money -0.26 (-0.58 to +0.05). Robustness: -0.31 within 15 points of Harris's
  margin (n 57), -0.35 adding affiliation, -0.34 dropping the 5 most influential races; the
  point estimate holds near -0.3 and the interval touches zero in most subsets.
- F2 (Trump-blame share, no reliable link): holds. -0.07 (-0.58 to +0.45).
- F3 (vague share zero or below): holds as no reliable link; +0.19 (-0.37 to +0.74).
- F4 (largest party gap on a cause): holds on the Trump-blame group (31 points), fails on single
  codes, where tax cuts (a remedy, 26 points) is the largest gap.

Exploratory (not predicted): no other price position with at least 15 Democrats using it has an
interval clear of zero once money is added. Tariff blame +0.41 (-0.10 to +0.91, 27 Democrats);
public program +0.41 (-0.41 to +1.23, 15).

> **[Claude — honest correction]** Section 6 expected Democrats who named an economic villain
> (corporations, billionaires, insurers) to run further ahead. They ran slightly behind: about
> 0.3 points per +10 share points, about 3 points for a candidate whose whole price message named
> a villain. The link weakens below significance once money is controlled. No price position
> tested here went with running ahead of Harris. Democrats did argue prices differently from
> Republicans: they blamed Trump (32% vs 1%) and Republicans proposed tax cuts (31% vs 5%), but
> how a Democrat framed prices did not track how far the Democrat ran ahead.
