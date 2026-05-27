# Center Basher

> **The "center" isn't where you think it is.**

This project investigates the claim that *Independent* and *Swing* voters are
meaningfully the same as *Centrist* voters — and argues they are not.

## The Thesis

Political analysts routinely collapse three distinct concepts:

| Term | Common assumption |
|---|---|
| Independent | doesn't identify with a party |
| Swing voter | votes differently across elections |
| Centrist | holds moderate policy positions |

When voters are plotted on a single left-right axis, the "middle" looks like a
policy moderate. But when you add a second axis — **trust in institutions** —
the picture changes dramatically.

Most voters in the "center" of the left-right spectrum don't cluster around
*moderate policy positions*. They cluster around **deep distrust of
institutions**: government, media, elections, corporations, experts.

This has political gravity. Anti-institution candidates — regardless of
party — pull these voters. That explains:

- Why Bernie Sanders and Donald Trump drew from the same pool of disaffected
  voters in 2016
- Why "Bernie-to-Trump" voters exist but "Bernie-to-Hillary" crossover was
  minimal despite Hillary being ideologically closer to Bernie on policy
- Why Trump's "drain the swamp" framing worked as a *populist* message
- Why Democratic policy pivots toward the center repeatedly fail to recapture
  these voters — because the center isn't a policy location, it's a trust deficit

## The Visual Argument

The core deliverable is an **interactive 2D scatter plot** — left/right policy
axis (x) vs. institutional trust axis (y) — built from real survey data
(ANES, Pew Research).

The plot shows:
1. Self-identified "Independents" do NOT cluster in the policy center
2. They cluster in the **low-trust** quadrant, spanning left and right
3. Candidate proximity in 2D (trust-adjusted) predicts vote switching better
   than 1D policy proximity

## Data Sources

- [American National Election Studies (ANES)](https://electionstudies.org/)
  — primary source for ideology, party ID, and institutional trust items
- [Pew Research Political Typology](https://www.pewresearch.org/politics/)
  — rich attitudinal clustering
- [VOTER Survey / Democracy Fund](https://www.voterstudygroup.org/)
  — 2016 panel data capturing Bernie→Trump switches

## Project Structure

```
data/raw/         Raw downloaded survey files (not committed — see data/README.md)
data/processed/   Cleaned JSON outputs consumed by the web viz
src/              Python data processing scripts
web/              Deployable mobile-first interactive site (D3.js)
social/           Exported static images for social sharing
docs/             Thesis write-up, Substack drafts, academic outline
references/       Papers, links, citations
```

## Setup

```bash
# Python environment (data processing only)
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Process data → JSON
python src/process_anes.py

# Open the viz locally
open web/index.html
# or: python -m http.server 8080 --directory web
```

## Contributing / Discussion

This is a personal research project. Issues and discussion welcome.
