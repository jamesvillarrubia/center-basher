# Forecast method: the 2026-27 Democratic leadership races

This method replaces the bare list in `reqts/establishment-leadership-prediction.md`
(commit 62afedd). That list stays in git as a record. Its change log points here.
James rejected the list on 2026-11-05 because no sentiment research, base rates,
scenarios, or backcasting stood behind its probabilities.

## Question

How will the Democratic establishment hold the House Speakership and the Senate
leadership after the 2026 wave? What will it concede to dissidents, and what will
it keep?

## Steps (in order; each writes a file under `data/derived/establishment/forecast/`)

1. **Sentiment evidence** (`sentiment.md`). This step collects:
   - Democratic voters' satisfaction with their party and its leaders, from 2025-26 polls (Gallup, Pew, AP-NORC, YouGov, CNN), with question wording and dates.
   - Favorability of Jeffries and of Schumer among Democrats.
   - Each member or member-elect on record against, or uncommitted to, Jeffries or Schumer, with a quote, date and source.
   - Organized pressure: the 500k-signature petition, Justice Democrats, DSA, and the Congressional Progressive Caucus.
   - Each leader's own pledges, such as Jeffries' letter.
2. **Caucus composition** (`sentiment.md`). This step counts:
   - The size of each 120th-Congress caucus.
   - The number of freshmen.
   - Membership in the Progressive Caucus, the New Democrats and the Blue Dogs.
   - Winners endorsed by insurgent groups.
   - Winners backed by AIPAC or United Democracy Project.
   - Incumbents who lost 2026 primaries.
3. **Base rates** (`base_rates.md`). This step covers every contested Speaker election and Senate party-leader election since 1923, with:
   - Defections on each ballot.
   - Number of ballots.
   - Caucus-stage challenges and their margins.
   - The concessions that ended each revolt.
   - Examples: 1923, Pelosi in 2010, 2016, 2018-19 and 2021, Boehner in 2013 and 2015, McCarthy in 2023, Johnson in 2025, McConnell vs Scott in 2022, the Lott resignation, and Schumer in 2017.
4. **Appeasement playbook** (`playbook.md`). This step lists the moves leaders have used to buy off dissidents while keeping control, each with a documented case:
   - Term-limit promises.
   - New leadership posts.
   - Steering-committee seats.
   - Rules-package changes.
   - Messaging-bill votes.
   - Committee assignments.
5. **Scenarios** (`scenarios.md`). This step sets four to six scenarios per chamber. Each scenario names:
   - Its mechanism.
   - Which faction gets what.
   - Where it sits on the thesis: establishment holds cleanly, absorbs dissent through concessions, or loses power.
6. **Backcasting** (`scenarios.md`). This step works backward from each scenario's end state to the dated events that would have to occur first. Examples:
   - The caucus vote result and margin.
   - Letters with N signatures.
   - A declared challenger.
   - Concession announcements.
   Those events become signposts with dates.
7. **Probabilities** (`forecast.md`):
   - Each scenario starts from the base rate.
   - Step 1-2 evidence adjusts it, with each adjustment written down and sized.
   - The probabilities sum to 1 per chamber.
   - James records his own probabilities next to Claude's.
8. **Pre-registration and updating**:
   - The scenario probabilities and signposts are frozen in a commit.
   - Each signpost that fires gets a dated update entry with the new probabilities.
   - Scoring uses the Brier score on the final scenario at each resolution date.

## Thesis link

The thesis (plan §0, claim C10) predicts the absorption scenario: dissidents win visible concessions, and the leaders and the power structure stay. Thesis outcomes on resolution:

- **Clean continuity:** a weak confirmation.
- **Absorption:** the strongest confirmation.
- **The leaders lose to an insurgent coalition:** the thesis fails for this case.
- **The leaders lose to another insider:** the thesis survives, with a note.
