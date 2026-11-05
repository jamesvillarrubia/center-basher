# Mistakes (center-basher)

## 2026-11-05: Froze leadership-race probabilities with no forecasting method behind them

**What happened:** Claude committed 11 predictions about the Speaker and Senate leader races (`reqts/establishment-leadership-prediction.md`, commit 62afedd) and built a share card from them. Each probability came from three news searches. No step studied party sentiment, historical base rates, the leaders' appeasement options, scenarios, or backcasting. James rejected the set as "not at all scientific or thorough."
**Root cause:** Claude treated the public timestamp as more urgent than the method. A probability with no base rate or scenario behind it is an opinion with a number attached.
**Consequence:** A public commit carries an unsupported forecast. The card had to be held, and the forecast rebuilt.
**Prevention:** A forecast in this project needs, before any number: a sentiment evidence base, base rates from comparable past events, scenarios backcast to dated signposts, and probabilities derived from those steps. `reqts/establishment-leadership-forecast-method.md` is the template.

## 2026-11-03: Claimed C1's data was downloaded when it was not

**What happened:** An AskUserQuestion told James the data for C0, C1, and C9 was "already downloaded." Gallup approval and the reelection table for C1 had never been fetched.
**Root cause:** The question summarized the plan's data list from memory instead of the section 8 manifest, which listed only Voteview and CAP.
**Consequence:** James approved a run on a false premise; the C1 data had to be fetched mid-run.
**Prevention:** Before stating that data exists, list the files (`ls data/raw/<dataset>`) or cite the manifest line in the same turn.

