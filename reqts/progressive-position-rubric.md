# Progressive position rubric (coding c)

Coding (a) uses Third Way's labels and coding (b) uses pre-primary establishment backing. Neither
measures what a nominee said they would do. Third Way endorsed James Talarico while opposing
positions he ran on. Coding (c) scores each 2026 Democratic nominee on stated progressive policy
positions, from the nominee's own words.

## Items

Each item is a concrete policy a nominee can state support for or opposition to.

| # | Item | Supports (+1) when the nominee... |
|---|---|---|
| 1 | Medicare for All | backs single-payer / Medicare for All, or cosponsors the bill (incumbents) |
| 2 | Billionaire / wealth tax | backs an annual wealth tax or a billionaire minimum income tax |
| 3 | No corporate PAC money | pledges to refuse corporate PAC contributions |
| 4 | No AIPAC / conditions on Israel aid | refuses AIPAC/UDP support, or backs conditioning or halting offensive military aid to Israel |
| 5 | Green New Deal | backs the Green New Deal by name, or cosponsors it |
| 6 | Federal minimum wage $17 or higher | backs a federal minimum wage of $17/hour or more |
| 7 | End the filibuster | backs abolishing the legislative filibuster |
| 8 | Supreme Court expansion | backs adding seats to the Supreme Court (term limits alone score 0) |
| 9 | Student debt cancellation or tuition-free public college | backs broad student debt cancellation or tuition-free public college |
| 10 | Break up big tech / anti-monopoly | backs breaking up large tech or agribusiness firms, or names monopoly power as a campaign issue with a specific remedy |
| 11 | No crypto PAC money | refuses Fairshake or affiliated crypto super PAC support, or opposes crypto deregulation bills |
| 12 | Universal childcare or universal pre-K | backs a federal universal childcare or universal pre-K program |
| 13 | Oppose Schumer as leader (Senate) / Jeffries (House) | says they will not back the current party leader |

## Scoring

- **+1:** the nominee states support in their own words (campaign site, debate, interview, candidate questionnaire, cosponsorship, recorded vote).
- **0:** silent, hedged, or "open to it" with no commitment.
- **−1:** the nominee states opposition, or votes against.
- **Date:** each score records the date of its source. Positions stated before the primary are the primary measure; a later reversal is recorded in a second column, not overwritten.
- **Source:** every non-zero score carries a URL (prefer an archived snapshot) and a short quote.
- **Index:** progressive index = mean of the 13 item scores, range −1 to +1. Item 13 counts only where the nominee's chamber leader was in office during the campaign.

## Rulings on edge cases (James, 2026-11-05)

- **Item 1:** support for Medicare for All with a public option as the first step scores +0.5 (Shaheen, Jackson, Brooks).
- **Item 2:** a stated tax increase aimed at billionaires ("raise taxes on billionaires", "close billionaire tax loopholes") scores +1. A generic "pay their fair share" slogan scores 0.
- **Item 6:** a $15 federal minimum scores +0.5; $17 or more scores +1.
- **Evidence:** a news outlet's paraphrase of the nominee counts, flagged `indirect`. An endorsing group's press release does not count; the group's published copy of the candidate's own questionnaire answers does.

Parent rulings on the remaining coder flags:

- **Item 3:** a pledge to refuse "corporate money" or a statement that the campaign takes no corporate PAC money scores +1. Backing a ban on corporate PACs without refusing them scores +0.5.
- **Item 10:** any named monopoly (not only tech or agribusiness) with a specific remedy scores +1. Naming monopoly power with no remedy scores 0.
- **Item 11:** recorded votes count. Nay on both the CLARITY and GENIUS Acts scores +1, Yea on both scores −1, a split vote scores 0.
- **Item 12:** "pre-K for all" or a publicly funded universal preschool plan scores +1. "Affordable childcare" with no universal program scores 0.
- **Item 13:** a stated refusal to back the leader scores +1, including in a news paraphrase. "Can't commit" scores 0.

Parent ruling on the campaign-site pass (2026-11-06):

- **Item 2:** a concrete tax action aimed at a named top group scores +1: a new tax, a higher rate, or closing loopholes or ending breaks for "billionaires", "millionaires", "the ultra-wealthy" or "the richest". "Pay their fair share" with no action scores 0. This puts MN-02 ("a tax on the ultrawealthy"), MD-05 ("closing loopholes that let big corporations and the ultra-wealthy avoid paying their fair share"), SC-S ("End tax breaks for the ultra-wealthy") and TN-09 ("Taxing the income of the richest people") on the same footing.
- **Item 10:** blocking anti-competitive mergers in a named industry is a specific remedy (AK-S, grocery chains).
- **Precedence:** a cosponsorship or recorded vote outranks hedged campaign-site wording (FL-25 item 1 stays +1 for cosponsoring H.R. 3069).

The campaign-site pass covered the 23 nominees with fewer than 3 sourced items, from rendered live and Wayback captures (data/raw/midterm2026/sites/). Two coders scored it blind; they agreed on 99.3% of cells (Cohen's kappa 0.94). scripts/midterm2026/merge_sites.py applies the result and logs every change in positions/reconciled_sites.csv.

## Blind coding

Two coders score every nominee independently. Neither coder sees election results,
overperformance, Third Way labels, establishment endorsements, or the other coder's scores.
Agreement is reported per item as Cohen's kappa. The parent resolves each disagreement against
the cited sources and records the resolution.

## Third Way's own positions

The same 13 items are scored for Third Way's published policy stances, from its memos. The gap
between Third Way's score and an endorsed nominee's score measures how far the endorsement
diverged from the platform.
