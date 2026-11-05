# C0 direction rubric (frozen 2026-11-03, before any coding)

Input: `data/derived/establishment/mayhew_laws_1981_2024.csv`, 242 laws from David
Mayhew's lists of important enactments, 97th to 118th Congress. Two coders code
every law independently and blind to each other and to party control.

## Field 1 · `set`

| Code | Meaning (Comparative Agendas major topics, reqts/establishment-party.md §2a) |
|---|---|
| `structure` | Taxes and macroeconomics/budget (1), energy (8), transportation (10), housing (14), banking, finance, commerce, bankruptcy, corporate and consumer-finance regulation (15), technology and communications (17), trade (18) |
| `social` | Civil rights and liberties incl. abortion, voting, guns (2), immigration (9), law and crime (12) |
| `other` | Everything else (health, labor, education, environment, defense, foreign affairs, agriculture, social welfare, government operations, public lands) |

A law that spans sets gets the set holding most of its described content.

## Field 2 · `direction` (all laws, every set)

Does the law, as Mayhew describes it plus widely documented facts about it, move
wealth or power toward or away from the very wealthy (billionaires, top 0.1%) and
large incumbent firms in the affected industry?

| Code | Rule | Examples of the rule (not of the list) |
|---|---|---|
| `+1` toward | Net benefit to the top 0.1% or to incumbent firms | Tax cuts weighted to top incomes, capital gains, estates, or corporations; deregulation of an industry; bailouts, subsidies, liability shields, or guaranteed markets for established firms; patent or copyright extensions |
| `-1` away | Net cost to the top 0.1% or incumbent firms, or new constraint on them | Tax increases on top incomes or corporations; new regulation, consumer protection, or antitrust constraining an industry; ending a subsidy to established firms; transfers to low and middle incomes funded by the top |
| `0` | Mixed, roughly offsetting, or no distributional direction | Procedural, civil-rights, or foreign-policy laws with no wealth effect; packages whose toward and away parts are of similar size |

Code the law's main thrust. When distribution tables exist (JCT, Tax Policy
Center, CBO), follow them. Give `confidence` 1 (guess) to 3 (well documented)
and a one-sentence `reason`.

## Analysis (fixed now)

- Agreement: percent agreement and Cohen's kappa on `direction`, and on `set`.
- Disagreements are reported, then resolved by a third reading; both raw and
  resolved results are reported.
- C0 test: among `structure` laws, share coded `+1` minus share coded `-1`, under
  unified D (103rd, 111th, 117th) vs unified R (108th, 109th, 115th, 119th not in
  data). Refuted if the share of structure laws coded `+1` differs by more than 15
  points between unified D and unified R.
- Small n is stated: each unified group has roughly 30 to 40 laws in total.
