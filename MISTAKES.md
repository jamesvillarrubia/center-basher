# Mistakes (center-basher)

## 2026-11-03: Claimed C1's data was downloaded when it was not

**What happened:** An AskUserQuestion told James the data for C0, C1, and C9 was "already downloaded." Gallup approval and the reelection table for C1 had never been fetched.
**Root cause:** The question summarized the plan's data list from memory instead of the section 8 manifest, which listed only Voteview and CAP.
**Consequence:** James approved a run on a false premise; the C1 data had to be fetched mid-run.
**Prevention:** Before stating that data exists, list the files (`ls data/raw/<dataset>`) or cite the manifest line in the same turn.

