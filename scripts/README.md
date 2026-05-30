# Analysis pipeline

One script per claim in `plain-language.md`. Each script:
1. Loads the raw / source data (from `data/raw/` or `data/derived/`).
2. Performs the analysis with explicit variables, filter, n, and weights.
3. Writes a clean CSV to `data/clean/<name>.csv`.
4. Writes a sidecar manifest to `data/clean/<name>.json` documenting source,
   variables, filter, n, weight, method, supports, and caveats.

Shared utilities live in `_lib.py` — loaders, missing-value cleaning, weighted
statistics, and the write_clean writer.

## Conventions

- **One script, one claim.** Each script's docstring names the plain-language
  section(s) it supports (e.g. `Supports: plain-language.md §11 [2]`).
- **Re-runnable from scratch.** A script must produce the same output every run,
  regardless of which other scripts ran.
- **Schemas are stable.** Column names in `data/clean/*.csv` are versioned by the
  schema list in the manifest. Adding a column requires bumping `schema_version`.
- **Reproducibility:** scripts use only `pandas` + `numpy` (no random sampling
  without a seed).

## Run

```bash
# build everything
python3 scripts/build_all.py

# or one analysis
python3 scripts/build_turnout_hump.py
```

## Files

| Script | Produces | Supports |
|---|---|---|
| `build_center_breakdown.py` | `center_breakdown.csv` | §2 (True Middlers / Grab-Baggers / Whatevers) |
| `build_partisan_loyalty.py` | `partisan_loyalty.csv` | §3 (92/92 loyalty, defectors) |
| `build_within_tent_bolt.py` | `within_tent_bolt.csv` | §7 (low-trust bolt within tent) |
| `build_turnout_hump.py` | `turnout_hump.csv` | §14 (stakes × efficacy) |
| `build_panel_switch_vsg.py` | `panel_switch_vsg.csv` | §11 (Obama→Trump switch) |
| `build_rr_weight_by_cycle.py` | `rr_weight_by_cycle.csv` | §11 [4] (RR weight 1988-2024) |
| `build_trust_vote_by_cycle.py` | `trust_vote_by_cycle.csv` | §15 (11-of-13 sign flip) |
| `build_all.py` | runs all of the above | — |

## Adding a new analysis

1. Create `scripts/build_<name>.py`.
2. Import from `_lib`.
3. Compute rows; call `write_clean(name, rows, manifest)`.
4. Add a row to the table above.
5. Add the call to `build_all.py`.
6. Re-run and inspect `data/clean/<name>.csv` + `.json`.

The `_lib.write_clean` function enforces manifest completeness — every clean CSV
gets its own machine-readable provenance.
