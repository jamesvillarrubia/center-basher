# data/clean/ — published analysis outputs

Versioned, schema-documented CSVs produced by `scripts/build_*.py`. Each CSV has
a sidecar `.json` manifest documenting source, variables, filter, n, weight,
method, the plain-language sections it supports, and known caveats.

## Files

| Output | Supports | Notes |
|---|---|---|
| `center_breakdown.csv` | §2 | True Middlers / Grab-Baggers / Whatevers, loose + strict definitions |
| `partisan_loyalty.csv` | §3 | 92/92 loyalty, defectors, pure-indep vote |
| `within_tent_bolt.csv` | §7 | Vote split by trust band within each tent |
| `turnout_hump.csv` | §14 | Stakes × efficacy across the gettable; alienated/complacent composition |
| `panel_switch_vsg.csv` | §11 | Obama→Trump switch panel logit + direction audit |
| `rr_weight_by_cycle.csv` | §11 [4] | RR's net electoral weight 1988–2024 |
| `trust_vote_by_cycle.csv` | §15 | Trust→vote sign by cycle (incumbent rule) |

## Reproducing

```bash
python3 scripts/build_all.py
```

Each script can also be run individually. See `scripts/README.md` for conventions.

## Schema versioning

If a column is added or renamed in a CSV, bump `schema_version` in the manifest
and document the change in the manifest's `caveats` array. CSVs that consumers
(charts, the web build) depend on should treat the manifest's `schema` array as
the contract.
