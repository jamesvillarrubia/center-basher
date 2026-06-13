# ANES Variable Audit — Center-Basher

> **Purpose.** Adversarial review of every ANES variable used across `scripts/`. 
Each row shows: file:line usage site (verbatim code), the observed value distribution from the actual data file, 
known-bug annotations, and an audit status. The goal is to catch variable-naming bugs 
(wrong code, wrong direction, wrong mapping) BEFORE they ship to readers.

Regenerate with: `python scripts/generate_variable_audit.py`

**Status legend:**
- 🔥 KNOWN-BUG-FIXED — previously catastrophic misuse; fix recorded inline (don't break it again)
- ⚠️ SUSPECT / COVERAGE LIMIT — usable but has a known caveat that must be respected
- ❓ UNVERIFIED — used in a build script but not yet cross-checked against its codebook entry; confirm Label + Value Labels + Universe before relying on it

**Codebooks ARE on disk:** `data/raw/anes_codebooks/anes_2016|2020|2024_codebook.txt`, with a per-variable slice in `data/derived/codebook_entries.txt` (regenerate via `python scripts/extract_codebook_entries.py`). 
To upgrade an ❓ UNVERIFIED variable: read its slice in `codebook_entries.txt`, confirm the Label + Value Labels + Universe match the build-script usage, then add a codebook-cited annotation to `KNOWN_ANNOTATIONS` here.

---


## Cycle: ANES 2016  (n_respondents = 4270)


### `V160001` [2016]  —  ✅ ADMINISTRATIVE: 2016 Case ID (unique respondent identifier). Not an analysis variable.

**Observed distribution** (top values, numeric):

```
         1.0: 1
         2.0: 1
         3.0: 1
         4.0: 1
         5.0: 1
         6.0: 1
         7.0: 1
         8.0: 1
         9.0: 1
        10.0: 1
        11.0: 1
        12.0: 1
        13.0: 1
        14.0: 1
        15.0: 1
        16.0: 1
        17.0: 1
        18.0: 1
        19.0: 1
        20.0: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:139` — `"V160001": "✅ ADMINISTRATIVE: 2016 Case ID (unique respondent identifier). Not an analysis variable.",`
- `_lib.py:167` — `"""Vote-validation merge: dta V160001_orig ↔ csv V160001 (NOT the dta V160001)."""`
- `_lib.py:167` — `"""Vote-validation merge: dta V160001_orig ↔ csv V160001 (NOT the dta V160001)."""`

### `V160101` [2016]  —  ✅ CODEBOOK-VERIFIED: ANES 2016 PRE survey weight. Use for pre-election analyses.

**Observed distribution** (top values, numeric):

```
      0.0895: 1
      0.0993: 1
        0.11: 1
      0.1235: 1
      0.1311: 1
      0.1366: 1
      0.1399: 1
      0.1465: 1
      0.1499: 1
       0.161: 1
       0.167: 1
      0.1756: 1
      0.1784: 1
      0.1818: 1
      0.1832: 1
      0.1866: 1
      0.1974: 1
      0.1978: 1
       0.199: 1
      0.2037: 1
```

**Usage sites (26)**:

- `build_voter_map_2016.py:119` — `w = pd.to_numeric(df.get("V160102", df.get("V160101")), errors="coerce").fillna(0).clip(lower=0)`
- `build_warmth_fear_spread.py:10` — `presence, weighted by V160101). Thermo items are V161086 / V161087.`
- `build_warmth_fear_spread.py:21` — `w = pd.to_numeric(d["V160101"], errors="coerce").fillna(0).clip(lower=0)`
- `build_warmth_fear_spread.py:88` — `"V160101 (weight)",`
- `build_warmth_fear_spread.py:98` — `"method": "Weighted quintile binning on each metric; turnout = % of bin with V162034a non-missing, weighted by V160101.",`
- `build_center_overlap_matrix.py:14` — `Weighted with V160101 (post-election weight).`
- `build_center_overlap_matrix.py:33` — `w = pd.to_numeric(d["V160101"], errors="coerce").fillna(0).clip(lower=0)`
- `build_center_overlap_matrix.py:130` — `"V160101 (weight)",`
- `generate_variable_audit.py:153` — `"V160101": "✅ CODEBOOK-VERIFIED: ANES 2016 PRE survey weight. Use for pre-election analyses.",`
- `build_within_tent_bolt.py:19` — `w = clean_var(df, "V160101", 0, 1e9).fillna(0).clip(lower=0)`
- `build_within_tent_bolt.py:98` — `"V160101 (weight)", "V161158x (PID)", "V162034a (vote)",`
- `build_within_tent_bolt.py:102` — `"weight": "V160101 (post-election)",`
- `build_center_breakdown.py:18` — `w = clean_var(df, "V160101", 0, 1e9).fillna(0).clip(lower=0)`
- `build_center_breakdown.py:105` — `"variables": ["V160101 (weight)", "V161126 (self-place lib-con)",`
- `build_center_breakdown.py:109` — `"weight": "V160101 (post-election)",`
- `build_turnout_hump.py:24` — `w = clean_var(df, "V160101", 0, 1e9).fillna(0).clip(lower=0)`
- `build_turnout_hump.py:134` — `"V160101 (weight)", "V161004 (interest)", "V161005 (care who wins)",`
- `build_turnout_hump.py:139` — `"weight": "V160101 (post-election)",`
- `build_swing_spectrum.py:13` — `Use ANES 2016 (weighted, V160101).`
- `build_swing_spectrum.py:34` — `w = pd.to_numeric(d["V160101"], errors="coerce").fillna(0).clip(lower=0)`
- `build_swing_spectrum.py:84` — `"V160101 (weight)",`
- `build_candidate_honesty_by_trust.py:247` — `# cross-cycle outlier; switched to PRE V160101 for consistency.`
- `build_candidate_honesty_by_trust.py:248` — `w = pd.to_numeric(df.get('V160101', df.get('V160102')), errors='coerce').fillna(0).clip(lower=0)`
- `build_trust_by_cohort.py:87` — `w = clean_var(d, "V160101", 0, 1e9).fillna(0).clip(lower=0)`
- `_lib.py:16` — `w  = clean_var(df, "V160101", lo=0, hi=1e9).fillna(0).clip(lower=0)`
- _...and 1 more usage sites_

### `V160102` [2016]  —  ✅ CODEBOOK-VERIFIED: ANES 2016 POST survey weight. Use for vote-choice / post-election analyses. (Currently used in voter map.)

**Observed distribution** (top values, numeric):

```
         0.0: 622
      0.0885: 1
      0.0957: 1
      0.1162: 1
      0.1267: 1
       0.139: 1
      0.1412: 1
      0.1468: 1
      0.1639: 1
      0.1697: 1
      0.1713: 1
      0.1756: 1
      0.1873: 1
      0.1886: 1
      0.1903: 1
      0.1921: 1
      0.1942: 1
      0.1996: 1
      0.2039: 1
      0.2055: 1
```

**Usage sites (13)**:

- `build_voter_map_2016.py:25` — `w:           V160102 weight`
- `build_voter_map_2016.py:119` — `w = pd.to_numeric(df.get("V160102", df.get("V160101")), errors="coerce").fillna(0).clip(lower=0)`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:154` — `"V160102": "✅ CODEBOOK-VERIFIED: ANES 2016 POST survey weight. Use for vote-choice / post-election analyses. (Currently used in...`
- `build_partisan_loyalty.py:14` — `w = clean_var(df, "V160102", 0, 1e9).fillna(0).clip(lower=0)`
- `build_partisan_loyalty.py:112` — `"variables": ["V160102 (weight)", "V161158x (7-pt PID, branched)",`
- `build_partisan_loyalty.py:115` — `"weight": "V160102 (post-election)",`
- `build_within_cycle_multi.py:12` — `V162078 (Clinton POST), V162079 (Trump POST), V160102 (weight)`
- `build_within_cycle_multi.py:44` — `"weight": "V160102",`
- `build_candidate_honesty_by_trust.py:246` — `# so PRE is the correct basis. 2016 previously used POST (V160102), the lone`
- `build_candidate_honesty_by_trust.py:248` — `w = pd.to_numeric(df.get('V160101', df.get('V160102')), errors='coerce').fillna(0).clip(lower=0)`
- `build_voter_maps_all.py:79` — `w = safe_num(df, "V160102").fillna(0).clip(lower=0)`
- `build_swing_trust_turnout.py:82` — `(2016, None, 'V162031x', 'V160102', 'V161010d'),`

### `V161004` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE 'How interested in following campaigns', 1-3 (1=very/3=not much). build_turnout_hump.py clean_var(1,3) as engagement proxy.

**Observed distribution** (top values, numeric):

```
           1: 2230
           2: 1519
           3: 521
```

**Usage sites (9)**:

- `build_warmth_fear_spread.py:32` — `# V161004 = political interest. 1 = very, 2 = somewhat, 3 = not very.`
- `build_warmth_fear_spread.py:33` — `# The "gettable" subset (per §13 footnote [2]) is V161004 = 3, the voters`
- `build_warmth_fear_spread.py:35` — `interest = pd.to_numeric(d["V161004"], errors="coerce")`
- `build_warmth_fear_spread.py:106` — `"label": "Gettable voters (V161004 = 3, low political interest)",`
- `generate_variable_audit.py:140` — `"V161004": "✅ CODEBOOK-VERIFIED: 2016 PRE 'How interested in following campaigns', 1-3 (1=very/3=not much). build_turnout_hump....`
- `build_warmth_fear_spread_pooled.py:56` — `# (Reverse-coded from the 2016 standalone V161004!) Verified empirically`
- `build_turnout_hump.py:26` — `interest = clean_var(df, "V161004", 1, 3)`
- `build_turnout_hump.py:134` — `"V160101 (weight)", "V161004 (interest)", "V161005 (care who wins)",`
- `build_turnout_hump.py:138` — `"filter": "Low-engagement subset = V161004 == 3 ('not too / not at all interested').",`

### `V161005` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE 'Did R vote for President in 2012' (item CAMPINT_PRESVTLAST). 1=voted 2012, 2=did not, -9/-8 missing. Universe = all PRE respondents (all 4270 coded, no restriction). Used as V161005==1 (voted 2012) for the drop-off cohort (voted 2012, not 2016).

**Observed distribution** (top values, numeric):

```
        -9.0: 2
        -8.0: 14
         1.0: 3117
         2.0: 1137
```

**Usage sites (11)**:

- `build_voter_map_2016.py:23` — `new_2016:    1 if voted 2016 but NOT in 2012 (V161005 == 2)`
- `build_voter_map_2016.py:24` — `dropoff:     1 if voted 2012 but NOT in 2016 (V161005 == 1 AND V162031x != 1)`
- `build_voter_map_2016.py:102` — `# 2012 turnout (V161005: 1=yes, 2=no)`
- `build_voter_map_2016.py:103` — `voted_2012 = pd.to_numeric(df["V161005"], errors="coerce")`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:98` — `"V161005": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Did R vote for President in 2012' (item CAMPINT_PRESVTLAST). 1=voted 2012, 2=did not...`
- `generate_variable_audit.py:98` — `"V161005": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Did R vote for President in 2012' (item CAMPINT_PRESVTLAST). 1=voted 2012, 2=did not...`
- `build_turnout_hump.py:5` — `- stakes pct (V161005 "care a good deal")`
- `build_turnout_hump.py:44` — `care = clean_var(df, "V161005", 1, 2)`
- `build_turnout_hump.py:134` — `"V160101 (weight)", "V161004 (interest)", "V161005 (care who wins)",`
- `build_voter_maps_all.py:70` — `voted_2012 = safe_num(df, "V161005")`

### `V161010d` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 state FIPS code (numeric).

**Observed distribution** (top values, numeric):

```
         1.0: 44
         2.0: 4
         4.0: 97
         5.0: 52
         6.0: 414
         8.0: 98
         9.0: 58
        10.0: 11
        11.0: 28
        12.0: 217
        13.0: 118
        15.0: 10
        16.0: 58
        17.0: 196
        18.0: 94
        19.0: 36
        20.0: 94
        21.0: 59
        22.0: 63
        23.0: 11
```

**Usage sites (7)**:

- `build_voter_map_2016.py:121` — `# STATE FIPS — V161010d`
- `build_voter_map_2016.py:122` — `state = pd.to_numeric(df["V161010d"], errors="coerce") if "V161010d" in df.columns else pd.Series([None]*len(df))`
- `build_voter_map_2016.py:122` — `state = pd.to_numeric(df["V161010d"], errors="coerce") if "V161010d" in df.columns else pd.Series([None]*len(df))`
- `generate_variable_audit.py:161` — `"V161010d": "✅ CODEBOOK-VERIFIED: 2016 state FIPS code (numeric).",`
- `build_candidate_honesty_by_trust.py:249` — `state = pd.to_numeric(df['V161010d'], errors='coerce')`
- `build_voter_maps_all.py:80` — `state = safe_num(df, "V161010d")`
- `build_swing_trust_turnout.py:82` — `(2016, None, 'V162031x', 'V160102', 'V161010d'),`

### `V161021` [2016]  —  ✅ CODEBOOK-VERIFIED (not in live use): 2016 PRE 'Did R vote in a Presidential primary or caucus' — the primary-participation GATE, not candidate choice. Candidate choice is V161021a (✅). V161021 appears only in a comment inside the DEPRECATED, execution-guarded build_voter_map_2016.py (sys.exit at top; never runs).

**Observed distribution** (top values, numeric):

```
        -9.0: 3
        -8.0: 3
         1.0: 1882
         2.0: 2382
```

**Usage sites (3)**:

- `build_voter_map_2016.py:77` — `# PRIMARY VOTE (V161021 = which primary; V161022 = Dem candidate, V161023 = Rep candidate)`
- `generate_variable_audit.py:81` — `"V161021": "✅ CODEBOOK-VERIFIED (not in live use): 2016 PRE 'Did R vote in a Presidential primary or caucus' — the primary-part...`
- `generate_variable_audit.py:81` — `"V161021": "✅ CODEBOOK-VERIFIED (not in live use): 2016 PRE 'Did R vote in a Presidential primary or caucus' — the primary-part...`

### `V161021a` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE: 'For which candidate did R vote in Presidential primary'. 1=Clinton, 2=Sanders, 3=Another Dem, 4=Trump, 5=Cruz, 6=Kasich, 7=Rubio, 8=Another Rep, 9=Someone else. Universe: 'IF R VOTED IN A PRESIDENTIAL PRIMARY OR CAUCUS'. THIS is the proper primary-vote variable, NOT V161022.

**Observed distribution** (top values, numeric):

```
        -9.0: 6
        -8.0: 3
        -1.0: 2388
         1.0: 579
         2.0: 392
         3.0: 19
         4.0: 446
         5.0: 162
         6.0: 114
         7.0: 85
         8.0: 52
         9.0: 24
```

**Usage sites (7)**:

- `generate_variable_audit.py:76` — `"V161021a": "✅ CODEBOOK-VERIFIED: 2016 PRE: 'For which candidate did R vote in Presidential primary'. 1=Clinton, 2=Sanders, 3=A...`
- `generate_variable_audit.py:79` — `"V161022": "🔥 KNOWN-BUG-FIXED: codebook label is 'PRE: Already voted in General Election' (1=have voted early, 2=have not voted...`
- `generate_variable_audit.py:80` — `"V161023": "🔥 KNOWN-BUG-FIXED: codebook label is 'PRE: In what manner did R vote' (early-vote method: in-person / mail / etc.)....`
- `generate_variable_audit.py:81` — `"V161021": "✅ CODEBOOK-VERIFIED (not in live use): 2016 PRE 'Did R vote in a Presidential primary or caucus' — the primary-part...`
- `build_voter_maps_all.py:53` — `# PRIMARY VOTE — 2016 ANES uses V161021a (NOT V161022 / V161023).`
- `build_voter_maps_all.py:54` — `# CODEBOOK-VERIFIED: V161021a 'For which candidate did R vote in Presidential prim'`
- `build_voter_maps_all.py:65` — `prim = safe_num(df, "V161021a")`

### `V161022` [2016]  —  🔥 KNOWN-BUG-FIXED: codebook label is 'PRE: Already voted in General Election' (1=have voted early, 2=have not voted yet). Earlier code MISUSED this as the Democratic primary-vote variable mapping {1:'clinton', 2:'sanders'} — that labeled 3,467 'have-not-voted-yet' respondents as Sanders primary voters. The actual primary variable is V161021a. NOT a primary-vote variable.

**Observed distribution** (top values, numeric):

```
        -9.0: 2
        -1.0: 612
         1.0: 189
         2.0: 3467
```

**Usage sites (9)**:

- `build_voter_map_2016.py:77` — `# PRIMARY VOTE (V161021 = which primary; V161022 = Dem candidate, V161023 = Rep candidate)`
- `build_voter_map_2016.py:78` — `# V161022: 1=Clinton, 2=Sanders, 3=O'Malley, 4=other`
- `build_voter_map_2016.py:79` — `dem_prim = pd.to_numeric(df["V161022"], errors="coerce") if "V161022" in df.columns else pd.Series([], dtype=float)`
- `build_voter_map_2016.py:79` — `dem_prim = pd.to_numeric(df["V161022"], errors="coerce") if "V161022" in df.columns else pd.Series([], dtype=float)`
- `generate_variable_audit.py:76` — `"V161021a": "✅ CODEBOOK-VERIFIED: 2016 PRE: 'For which candidate did R vote in Presidential primary'. 1=Clinton, 2=Sanders, 3=A...`
- `generate_variable_audit.py:79` — `"V161022": "🔥 KNOWN-BUG-FIXED: codebook label is 'PRE: Already voted in General Election' (1=have voted early, 2=have not voted...`
- `generate_variable_audit.py:82` — `"V161022x": "⚠️ PHANTOM REFERENCE — no V161022x entry exists in the 2016 codebook. It appears only in a stale comment in the DE...`
- `build_voter_maps_all.py:53` — `# PRIMARY VOTE — 2016 ANES uses V161021a (NOT V161022 / V161023).`
- `build_voter_maps_all.py:59` — `# KNOWN-BUG-FIXED 2026-06-05: earlier code used V161022 ("Already voted`

### `V161022x` [2016]  —  ⚠️ PHANTOM REFERENCE — no V161022x entry exists in the 2016 codebook. It appears only in a stale comment in the DEPRECATED, execution-guarded build_voter_map_2016.py. The real (bugged) variable is V161022 (🔥 above). Not used in any live build.

**NOT FOUND IN LOADED DATA FRAME** — usage site may be broken or guarded by a `.get(...)` fallback.

**Usage sites (3)**:

- `build_voter_map_2016.py:21` — `pv:          democratic primary vote (V161022x recoded to clinton/sanders/other)`
- `generate_variable_audit.py:82` — `"V161022x": "⚠️ PHANTOM REFERENCE — no V161022x entry exists in the 2016 codebook. It appears only in a stale comment in the DE...`
- `generate_variable_audit.py:82` — `"V161022x": "⚠️ PHANTOM REFERENCE — no V161022x entry exists in the 2016 codebook. It appears only in a stale comment in the DE...`

### `V161023` [2016]  —  🔥 KNOWN-BUG-FIXED: codebook label is 'PRE: In what manner did R vote' (early-vote method: in-person / mail / etc.). Earlier code MISUSED this as the Republican primary-vote variable. The actual primary variable is V161021a. NOT a primary-vote variable.

**Observed distribution** (top values, numeric):

```
        -1.0: 4114
         1.0: 70
         2.0: 83
         3.0: 3
```

**Usage sites (7)**:

- `build_voter_map_2016.py:77` — `# PRIMARY VOTE (V161021 = which primary; V161022 = Dem candidate, V161023 = Rep candidate)`
- `build_voter_map_2016.py:80` — `rep_prim = pd.to_numeric(df["V161023"], errors="coerce") if "V161023" in df.columns else pd.Series([], dtype=float)`
- `build_voter_map_2016.py:80` — `rep_prim = pd.to_numeric(df["V161023"], errors="coerce") if "V161023" in df.columns else pd.Series([], dtype=float)`
- `build_voter_map_2016.py:84` — `if r == 1: return "trump"  # 1 in V161023 = Trump`
- `generate_variable_audit.py:80` — `"V161023": "🔥 KNOWN-BUG-FIXED: codebook label is 'PRE: In what manner did R vote' (early-vote method: in-person / mail / etc.)....`
- `build_voter_maps_all.py:53` — `# PRIMARY VOTE — 2016 ANES uses V161021a (NOT V161022 / V161023).`
- `build_voter_maps_all.py:62` — `# primary voters. And V161023 ("In what manner did R vote") had been`

### `V161031` [2016]  —  🔥 RETIRED: codebook label is 'For whom does R intend to vote' — measured intention not undecidedness. Previously misused as swing flag. Replaced by behavioral cross-pressure definition.

**Observed distribution** (top values, numeric):

```
        -9.0: 28
        -8.0: 88
        -1.0: 786
         1.0: 1570
         2.0: 1357
         3.0: 227
         4.0: 57
         5.0: 71
         6.0: 71
         7.0: 11
         8.0: 4
```

**Usage sites (4)**:

- `build_voter_map_2016.py:22` — `swing:       1 if respondent reported being undecided in pre-election (V161031==2)`
- `build_voter_map_2016.py:93` — `# The old V161031 definition (undecided pre-election) was right-skewed`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:75` — `"V161031": "🔥 RETIRED: codebook label is 'For whom does R intend to vote' — measured intention not undecidedness. Previously mi...`

### `V161086` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE feeling thermometer, Clinton (0-100). build_warmth_fear_spread.py uses clean_var(0,100); 998/999 excluded.

**Observed distribution** (top values, numeric):

```
       -99.0: 36
       -88.0: 2
         0.0: 947
         1.0: 81
         2.0: 69
         3.0: 24
         4.0: 17
         5.0: 20
         6.0: 4
         7.0: 1
         8.0: 9
         9.0: 2
        10.0: 16
        11.0: 2
        12.0: 2
        13.0: 1
        14.0: 4
        15.0: 332
        16.0: 33
        17.0: 14
```

**Usage sites (9)**:

- `build_warmth_fear_spread.py:10` — `presence, weighted by V160101). Thermo items are V161086 / V161087.`
- `build_warmth_fear_spread.py:24` — `thermo_c = clean_var(d, "V161086", 0, 100)`
- `build_warmth_fear_spread.py:89` — `"V161086 (Clinton feeling thermometer 0-100)",`
- `build_warmth_fear_spread.py:94` — `"warmth_to_favorite":   "max(V161086, V161087) / 100  — 'love your own'",`
- `build_warmth_fear_spread.py:95` — `"coldness_to_other":    "(100 - min(V161086, V161087)) / 100  — 'fear the other'",`
- `build_warmth_fear_spread.py:96` — `"affect_spread":        "|V161086 - V161087| / 100  — 'love + fear combined'",`
- `generate_variable_audit.py:121` — `"V161086": "✅ CODEBOOK-VERIFIED: 2016 PRE feeling thermometer, Clinton (0-100). build_warmth_fear_spread.py uses clean_var(0,10...`
- `build_within_cycle_multi.py:11` — `2016: V161086 (Clinton PRE FT), V161087 (Trump PRE),`
- `build_within_cycle_multi.py:42` — `"dem_pre": "V161086", "rep_pre": "V161087",`

### `V161087` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE feeling thermometer, Trump (0-100). clean_var(0,100).

**Observed distribution** (top values, numeric):

```
       -99.0: 38
       -88.0: 3
         0.0: 1288
         1.0: 110
         2.0: 74
         3.0: 25
         4.0: 8
         5.0: 21
         6.0: 9
         7.0: 4
         8.0: 5
         9.0: 7
        10.0: 27
        11.0: 1
        12.0: 3
        14.0: 3
        15.0: 294
        16.0: 20
        17.0: 16
        18.0: 2
```

**Usage sites (9)**:

- `build_warmth_fear_spread.py:10` — `presence, weighted by V160101). Thermo items are V161086 / V161087.`
- `build_warmth_fear_spread.py:25` — `thermo_t = clean_var(d, "V161087", 0, 100)`
- `build_warmth_fear_spread.py:90` — `"V161087 (Trump feeling thermometer 0-100)",`
- `build_warmth_fear_spread.py:94` — `"warmth_to_favorite":   "max(V161086, V161087) / 100  — 'love your own'",`
- `build_warmth_fear_spread.py:95` — `"coldness_to_other":    "(100 - min(V161086, V161087)) / 100  — 'fear the other'",`
- `build_warmth_fear_spread.py:96` — `"affect_spread":        "|V161086 - V161087| / 100  — 'love + fear combined'",`
- `generate_variable_audit.py:122` — `"V161087": "✅ CODEBOOK-VERIFIED: 2016 PRE feeling thermometer, Trump (0-100). clean_var(0,100).",`
- `build_within_cycle_multi.py:11` — `2016: V161086 (Clinton PRE FT), V161087 (Trump PRE),`
- `build_within_cycle_multi.py:42` — `"dem_pre": "V161086", "rep_pre": "V161087",`

### `V161126` [2016]  —  ✅ CODEBOOK-VERIFIED: 'PRE: 7pt scale Liberal conservative self-placement'. 1=extremely liberal, 4=moderate, 7=extremely conservative. Code applies .between(1, 7) to drop -9/-8.

**Observed distribution** (top values, numeric):

```
        -9.0: 18
        -8.0: 5
         1.0: 146
         2.0: 506
         3.0: 380
         4.0: 894
         5.0: 508
         6.0: 703
         7.0: 166
        99.0: 944
```

**Usage sites (19)**:

- `build_voter_map_2016.py:17` — `x:           V161126 ideology (-1 = strong liberal, +1 = strong conservative)`
- `build_voter_map_2016.py:49` — `# IDEOLOGY: V161126 is 1-7 (1=ext lib, 7=ext con). Map to -1..+1.`
- `build_voter_map_2016.py:50` — `ideo = pd.to_numeric(df["V161126"], errors="coerce").where(lambda x: x.between(1, 7))`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `extract_codebook_entries.py:49` — `'V161126   PRE: 7pt scale ...'  (2016 page-numbered format)`
- `build_center_overlap_matrix.py:5` — `- M (Moderate): self-place 7-pt lib-con (V161126) in {3,4,5}`
- `build_center_overlap_matrix.py:40` — `selfplace = pd.to_numeric(d["V161126"], errors="coerce")`
- `build_center_overlap_matrix.py:131` — `"V161126 (self-place lib-con)",`
- `generate_variable_audit.py:85` — `"V161126": "✅ CODEBOOK-VERIFIED: 'PRE: 7pt scale Liberal conservative self-placement'. 1=extremely liberal, 4=moderate, 7=extre...`
- `generate_variable_audit.py:86` — `"V201200": "✅ CODEBOOK-VERIFIED: 2020 ideology self-placement, same 1-7 scale as V161126.",`
- `build_partisan_loyalty.py:17` — `ideo = clean_var(df, "V161126", 1, 7, also_missing=(99,))`
- `build_partisan_loyalty.py:113` — `"V161126 (lib-con)", "V162034a (presidential vote)"],`
- `build_center_breakdown.py:21` — `ideo_raw = pd.to_numeric(df["V161126"], errors="coerce")`
- `build_center_breakdown.py:23` — `ideo = clean_var(df, "V161126", 1, 7, also_missing=(99,))`
- `build_center_breakdown.py:105` — `"variables": ["V160101 (weight)", "V161126 (self-place lib-con)",`
- `build_swing_spectrum.py:10` — `For each scale position (V161126, 1-7), report the weighted % of all`
- `build_swing_spectrum.py:37` — `sp = pd.to_numeric(d["V161126"], errors="coerce")`
- `build_swing_spectrum.py:85` — `"V161126 (self-place 7-pt lib-con; 1=Extremely lib, 7=Extremely con)",`
- `build_voter_maps_all.py:40` — `ideo = safe_num(df, "V161126").where(lambda x: x.between(1, 7))`

### `V161128` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 R places Dem cand on 7-pt lib-con scale. Used in voter map for non-tautological perceived-position layer.

**Observed distribution** (top values, numeric):

```
        -9.0: 44
        -8.0: 70
         1.0: 1025
         2.0: 1274
         3.0: 619
         4.0: 694
         5.0: 237
         6.0: 212
         7.0: 95
```

**Usage sites (3)**:

- `generate_variable_audit.py:174` — `"V161128": "✅ CODEBOOK-VERIFIED: 2016 R places Dem cand on 7-pt lib-con scale. Used in voter map for non-tautological perceived...`
- `build_voter_maps_all.py:86` — `#   V161128/V161129 = R places Dem/Rep cand on 1-7 lib-cons scale`
- `build_voter_maps_all.py:95` — `dem_perc_x = (safe_num(df, "V161128").where(lambda v: v.between(1, 7)) - 4) / 3.0`

### `V161129` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 R places Rep cand on 7-pt lib-con scale.

**Observed distribution** (top values, numeric):

```
        -9.0: 59
        -8.0: 108
         1.0: 331
         2.0: 262
         3.0: 212
         4.0: 614
         5.0: 833
         6.0: 1072
         7.0: 779
```

**Usage sites (3)**:

- `generate_variable_audit.py:175` — `"V161129": "✅ CODEBOOK-VERIFIED: 2016 R places Rep cand on 7-pt lib-con scale.",`
- `build_voter_maps_all.py:86` — `#   V161128/V161129 = R places Dem/Rep cand on 1-7 lib-cons scale`
- `build_voter_maps_all.py:96` — `rep_perc_x = (safe_num(df, "V161129").where(lambda v: v.between(1, 7)) - 4) / 3.0`

### `V161158x` [2016]  —  🔥 KNOWN-BUG-FIXED: codebook-verified ANES 7-pt party summary 1=strong D … 7=strong R. Earlier off-by-one mapping dropped codes 6,7 to empty bucket. Now: 1,2,3 → dem, 4 → ind, 5,6,7 → rep.

**Observed distribution** (top values, numeric):

```
        -9.0: 12
        -8.0: 11
         1.0: 890
         2.0: 559
         3.0: 490
         4.0: 579
         5.0: 500
         6.0: 508
         7.0: 721
```

**Usage sites (23)**:

- `build_voter_map_2016.py:5` — `contains the off-by-one V161158x party mapping (1,2→dem, 3→ind, 4,5→rep)`
- `build_voter_map_2016.py:12` — `See reqts/variable-audit.md for the full V161158x annotation.`
- `build_voter_map_2016.py:19` — `p:           party affiliation (V161158x: strong/lean dem, ind, strong/lean rep)`
- `build_voter_map_2016.py:63` — `# PARTY (V161158x: 1=strong D, 2=lean D, 3=ind, 4=lean R, 5=strong R, 6=DK, 7=other)`
- `build_voter_map_2016.py:64` — `pty_raw = pd.to_numeric(df["V161158x"], errors="coerce")`
- `build_center_overlap_matrix.py:8` — `voted for the other party's nominee. From V161158x (PID) × V162034a (vote).`
- `build_center_overlap_matrix.py:51` — `pid = pd.to_numeric(d["V161158x"], errors="coerce")  # 1=SD .. 7=SR`
- `build_center_overlap_matrix.py:132` — `"V161158x (PID, 7-pt, leaners)",`
- `generate_variable_audit.py:67` — `"V161158x": "🔥 KNOWN-BUG-FIXED: codebook-verified ANES 7-pt party summary 1=strong D … 7=strong R. Earlier off-by-one mapping d...`
- `generate_variable_audit.py:100` — `"V241227x": "✅ CODEBOOK-VERIFIED: 2024 7-pt party summary. Same scale as V161158x/V201231x. Already mapped correctly (1,2,3→dem...`
- `build_partisan_loyalty.py:16` — `pid = clean_var(df, "V161158x", 1, 7)`
- `build_partisan_loyalty.py:63` — `"metric": "Pure independents (V161158x=4)",`
- `build_partisan_loyalty.py:112` — `"variables": ["V160102 (weight)", "V161158x (7-pt PID, branched)",`
- `build_within_tent_bolt.py:36` — `pid = clean_var(df, "V161158x", 1, 7)`
- `build_within_tent_bolt.py:98` — `"V160101 (weight)", "V161158x (PID)", "V162034a (vote)",`
- `build_swing_spectrum.py:7` — `Dem→Trump : V161158x ∈ {1,2,3} (Dem leaners+) AND V162034a = 2 (Trump)`
- `build_swing_spectrum.py:8` — `Rep→Clinton: V161158x ∈ {5,6,7} (Rep leaners+) AND V162034a = 1 (Clinton)`
- `build_swing_spectrum.py:35` — `pid = pd.to_numeric(d["V161158x"], errors="coerce")`
- `build_swing_spectrum.py:86` — `"V161158x (PID, 7-pt, leaners)",`
- `build_swing_spectrum.py:90` — `"Dem→Trump": "V161158x ∈ {1,2,3} (Dem leaners+) AND V162034a = 2",`
- `build_swing_spectrum.py:91` — `"Rep→Clinton": "V161158x ∈ {5,6,7} (Rep leaners+) AND V162034a = 1",`
- `build_voter_maps_all.py:46` — `# V161158x is the standard ANES 7-pt party summary:`
- `build_voter_maps_all.py:49` — `pty = safe_num(df, "V161158x")`

### `V161159` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 Dem cand trait 'strong leadership' 1-5. Voter-map perceived-Dem y composite.

**Observed distribution** (top values, numeric):

```
        -9.0: 13
        -8.0: 5
         1.0: 580
         2.0: 858
         3.0: 940
         4.0: 642
         5.0: 1232
```

**Usage sites (3)**:

- `generate_variable_audit.py:182` — `"V161159": "✅ CODEBOOK-VERIFIED: 2016 Dem cand trait 'strong leadership' 1-5. Voter-map perceived-Dem y composite.",`
- `build_voter_maps_all.py:87` — `#   V161159/V161160 = Dem cand "strong leadership"/"really cares" 1-5`
- `build_voter_maps_all.py:97` — `d_lead  = (5 - safe_num(df, "V161159").where(lambda v: v.between(1, 5))) / 4.0`

### `V161160` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 Dem cand trait 'really cares about people like me' 1-5. Voter-map perceived-Dem y composite.

**Observed distribution** (top values, numeric):

```
        -9.0: 15
        -8.0: 3
         1.0: 446
         2.0: 704
         3.0: 859
         4.0: 662
         5.0: 1581
```

**Usage sites (3)**:

- `generate_variable_audit.py:183` — `"V161160": "✅ CODEBOOK-VERIFIED: 2016 Dem cand trait 'really cares about people like me' 1-5. Voter-map perceived-Dem y composi...`
- `build_voter_maps_all.py:87` — `#   V161159/V161160 = Dem cand "strong leadership"/"really cares" 1-5`
- `build_voter_maps_all.py:98` — `d_cares = (5 - safe_num(df, "V161160").where(lambda v: v.between(1, 5))) / 4.0`

### `V161162` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 Dem cand 'honest' Likert 1=extremely well..5=not well at all. Used in build_candidate_honesty_by_trust.py.

**Observed distribution** (top values, numeric):

```
        -9.0: 15
        -8.0: 5
         1.0: 182
         2.0: 449
         3.0: 875
         4.0: 646
         5.0: 2098
```

**Usage sites (5)**:

- `generate_variable_audit.py:166` — `"V161162": "✅ CODEBOOK-VERIFIED: 2016 Dem cand 'honest' Likert 1=extremely well..5=not well at all. Used in build_candidate_hon...`
- `generate_variable_audit.py:167` — `"V161167": "✅ CODEBOOK-VERIFIED: 2016 Rep cand 'honest', same scale as V161162.",`
- `build_candidate_honesty_by_trust.py:241` — `# V161162 = Dem (Clinton) "is honest" trait; V161167 = Rep (Trump). 1=very well..5=not well.`
- `build_candidate_honesty_by_trust.py:242` — `hd = 5 - df['V161162'].where(df['V161162'].between(1,5))`
- `build_candidate_honesty_by_trust.py:242` — `hd = 5 - df['V161162'].where(df['V161162'].between(1,5))`

### `V161164` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 Rep cand trait 'strong leadership' 1-5. Voter-map perceived-Rep y composite.

**Observed distribution** (top values, numeric):

```
        -9.0: 14
        -8.0: 7
         1.0: 539
         2.0: 771
         3.0: 781
         4.0: 571
         5.0: 1587
```

**Usage sites (3)**:

- `generate_variable_audit.py:184` — `"V161164": "✅ CODEBOOK-VERIFIED: 2016 Rep cand trait 'strong leadership' 1-5. Voter-map perceived-Rep y composite.",`
- `build_voter_maps_all.py:88` — `#   V161164/V161165 = Rep cand same two traits`
- `build_voter_maps_all.py:99` — `r_lead  = (5 - safe_num(df, "V161164").where(lambda v: v.between(1, 5))) / 4.0`

### `V161165` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 Rep cand trait 'really cares about people like me' 1-5.

**Observed distribution** (top values, numeric):

```
        -9.0: 18
        -8.0: 6
         1.0: 296
         2.0: 531
         3.0: 755
         4.0: 521
         5.0: 2143
```

**Usage sites (3)**:

- `generate_variable_audit.py:185` — `"V161165": "✅ CODEBOOK-VERIFIED: 2016 Rep cand trait 'really cares about people like me' 1-5.",`
- `build_voter_maps_all.py:88` — `#   V161164/V161165 = Rep cand same two traits`
- `build_voter_maps_all.py:100` — `r_cares = (5 - safe_num(df, "V161165").where(lambda v: v.between(1, 5))) / 4.0`

### `V161167` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 Rep cand 'honest', same scale as V161162.

**Observed distribution** (top values, numeric):

```
        -9.0: 14
        -8.0: 12
         1.0: 298
         2.0: 655
         3.0: 823
         4.0: 616
         5.0: 1852
```

**Usage sites (4)**:

- `generate_variable_audit.py:167` — `"V161167": "✅ CODEBOOK-VERIFIED: 2016 Rep cand 'honest', same scale as V161162.",`
- `build_candidate_honesty_by_trust.py:241` — `# V161162 = Dem (Clinton) "is honest" trait; V161167 = Rep (Trump). 1=very well..5=not well.`
- `build_candidate_honesty_by_trust.py:243` — `hr = 5 - df['V161167'].where(df['V161167'].between(1,5))`
- `build_candidate_honesty_by_trust.py:243` — `hr = 5 - df['V161167'].where(df['V161167'].between(1,5))`

### `V161178` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale spending and Services self-placement', codes 1-7 (4=center), -9/-8/99 missing. True 7-pt item in the §2 policy composite.

**Observed distribution** (top values, numeric):

```
        -9.0: 13
        -8.0: 4
         1.0: 378
         2.0: 445
         3.0: 598
         4.0: 908
         5.0: 637
         6.0: 366
         7.0: 295
        99.0: 626
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:24` — `"V161178", "V161181", "V161184", "V161189", "V161193",`
- `generate_variable_audit.py:109` — `"V161178": "✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale spending and Services self-placement', codes 1-7 (4=center), -9/-8/99 miss...`
- `build_center_breakdown.py:27` — `"V161178", "V161181", "V161184", "V161189", "V161193",`

### `V161181` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale defense spending self-placement', 1-7 (4=center). True 7-pt §2 composite item.

**Observed distribution** (top values, numeric):

```
        -9.0: 16
        -8.0: 4
         1.0: 184
         2.0: 249
         3.0: 411
         4.0: 1008
         5.0: 787
         6.0: 594
         7.0: 450
        99.0: 567
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:24` — `"V161178", "V161181", "V161184", "V161189", "V161193",`
- `generate_variable_audit.py:110` — `"V161181": "✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale defense spending self-placement', 1-7 (4=center). True 7-pt §2 composite i...`
- `build_center_breakdown.py:27` — `"V161178", "V161181", "V161184", "V161189", "V161193",`

### `V161184` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale govt vs private medical insurance self-placement', 1-7 (4=center). True 7-pt §2 composite item.

**Observed distribution** (top values, numeric):

```
        -9.0: 13
        -8.0: 2
         1.0: 640
         2.0: 389
         3.0: 393
         4.0: 745
         5.0: 477
         6.0: 497
         7.0: 624
        99.0: 490
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:24` — `"V161178", "V161181", "V161184", "V161189", "V161193",`
- `generate_variable_audit.py:111` — `"V161184": "✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale govt vs private medical insurance self-placement', 1-7 (4=center). True 7-...`
- `build_center_breakdown.py:27` — `"V161178", "V161181", "V161184", "V161189", "V161193",`

### `V161189` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale guaranteed job-income self-placement', 1-7 (4=center). True 7-pt §2 composite item.

**Observed distribution** (top values, numeric):

```
        -9.0: 12
        -8.0: 4
         1.0: 368
         2.0: 326
         3.0: 509
         4.0: 824
         5.0: 638
         6.0: 611
         7.0: 497
        99.0: 481
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:24` — `"V161178", "V161181", "V161184", "V161189", "V161193",`
- `generate_variable_audit.py:112` — `"V161189": "✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale guaranteed job-income self-placement', 1-7 (4=center). True 7-pt §2 compos...`
- `build_center_breakdown.py:27` — `"V161178", "V161181", "V161184", "V161189", "V161193",`

### `V161193` [2016]  —  ⚠️ SCALE-MISMATCH BUG (logged, not fixed): 2016 PRE 'Favor or oppose ending birthright citizenship' is a 3-CATEGORY direction item (observed codes 1-3; strength in companion V161193a), NOT a 1-7 scale. build_center_breakdown.py runs clean_var(.,1,7) and averages it into a policy composite centered at 4, biasing the mean low and undercounting §2 centrists. See BLOCKERS.

**Observed distribution** (top values, numeric):

```
        -9.0: 14
        -8.0: 7
         1.0: 1351
         2.0: 1688
         3.0: 1210
```

**Usage sites (5)**:

- `build_center_overlap_matrix.py:24` — `"V161178", "V161181", "V161184", "V161189", "V161193",`
- `generate_variable_audit.py:114` — `"V161193": "⚠️ SCALE-MISMATCH BUG (logged, not fixed): 2016 PRE 'Favor or oppose ending birthright citizenship' is a 3-CATEGORY...`
- `generate_variable_audit.py:148` — `# the V161193/V161196 annotations above; not used in any build script).`
- `generate_variable_audit.py:149` — `"V161193a": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Strength R favors/opposes ending birthright citizenship' — strength follow-up to V1...`
- `build_center_breakdown.py:27` — `"V161178", "V161181", "V161184", "V161189", "V161193",`

### `V161193a` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE 'Strength R favors/opposes ending birthright citizenship' — strength follow-up to V161193; combined they form the standard ANES 1-7 issue scale. Not used in any build (the proper input for fixing the §2 scale-mixing bug).

**Observed distribution** (top values, numeric):

```
        -9.0: 2
        -8.0: 1
        -1.0: 1231
         1.0: 1766
         2.0: 1032
         3.0: 238
```

**Usage sites (2)**:

- `generate_variable_audit.py:114` — `"V161193": "⚠️ SCALE-MISMATCH BUG (logged, not fixed): 2016 PRE 'Favor or oppose ending birthright citizenship' is a 3-CATEGORY...`
- `generate_variable_audit.py:149` — `"V161193a": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Strength R favors/opposes ending birthright citizenship' — strength follow-up to V1...`

### `V161196` [2016]  —  ⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Build a wall with Mexico' — 3-category direction item (1-3; strength in V161196a), used as a 1-7 item in the §2 composite. See BLOCKERS.

**Observed distribution** (top values, numeric):

```
        -9.0: 10
        -8.0: 9
         1.0: 1370
         2.0: 1947
         3.0: 934
```

**Usage sites (5)**:

- `build_center_overlap_matrix.py:25` — `"V161196", "V161198", "V161204", "V161208", "V161213",`
- `generate_variable_audit.py:115` — `"V161196": "⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Build a wall with Mexico' — 3-category direction item (1-3; strength in V...`
- `generate_variable_audit.py:148` — `# the V161193/V161196 annotations above; not used in any build script).`
- `generate_variable_audit.py:150` — `"V161196a": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Build a wall with Mexico strength follow-up' — strength companion to V161196; combi...`
- `build_center_breakdown.py:28` — `"V161196", "V161198", "V161204", "V161208", "V161213",`

### `V161196a` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE 'Build a wall with Mexico strength follow-up' — strength companion to V161196; combined → 1-7. Not used in any build.

**Observed distribution** (top values, numeric):

```
        -9.0: 1
        -8.0: 2
        -1.0: 953
         1.0: 2391
         2.0: 754
         3.0: 169
```

**Usage sites (2)**:

- `generate_variable_audit.py:115` — `"V161196": "⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Build a wall with Mexico' — 3-category direction item (1-3; strength in V...`
- `generate_variable_audit.py:150` — `"V161196a": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Build a wall with Mexico strength follow-up' — strength companion to V161196; combi...`

### `V161198` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale govt assistance to blacks self-placement', 1-7 (4=center). True 7-pt §2 composite item.

**Observed distribution** (top values, numeric):

```
        -9.0: 17
        -8.0: 12
         1.0: 370
         2.0: 322
         3.0: 398
         4.0: 874
         5.0: 478
         6.0: 573
         7.0: 738
        99.0: 488
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:25` — `"V161196", "V161198", "V161204", "V161208", "V161213",`
- `generate_variable_audit.py:113` — `"V161198": "✅ CODEBOOK-VERIFIED: 2016 PRE '7pt scale govt assistance to blacks self-placement', 1-7 (4=center). True 7-pt §2 co...`
- `build_center_breakdown.py:28` — `"V161196", "V161198", "V161204", "V161208", "V161213",`

### `V161204` [2016]  —  ⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Favor/oppose affirmative action in universities' — 3-category item (1-3), used as 1-7 in the §2 composite. See BLOCKERS.

**Observed distribution** (top values, numeric):

```
        -9.0: 21
        -8.0: 26
         1.0: 782
         2.0: 1883
         3.0: 1558
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:25` — `"V161196", "V161198", "V161204", "V161208", "V161213",`
- `generate_variable_audit.py:116` — `"V161204": "⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Favor/oppose affirmative action in universities' — 3-category item (1-3),...`
- `build_center_breakdown.py:28` — `"V161196", "V161198", "V161204", "V161208", "V161213",`

### `V161208` [2016]  —  ⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Federal spending: dealing with crime' — 3-category (1=increase/2=same/3=decrease), used as 1-7 in the §2 composite (its center is 2, not 4). See BLOCKERS.

**Observed distribution** (top values, numeric):

```
        -9.0: 14
        -8.0: 9
         1.0: 2691
         2.0: 341
         3.0: 1215
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:25` — `"V161196", "V161198", "V161204", "V161208", "V161213",`
- `generate_variable_audit.py:117` — `"V161208": "⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Federal spending: dealing with crime' — 3-category (1=increase/2=same/3=d...`
- `build_center_breakdown.py:28` — `"V161196", "V161198", "V161204", "V161208", "V161213",`

### `V161213` [2016]  —  ⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Sending troops to fight ISIS' — 3-category direction item (1-3), used as 1-7 in the §2 composite. See BLOCKERS.

**Observed distribution** (top values, numeric):

```
        -9.0: 20
        -8.0: 18
         1.0: 1569
         2.0: 1399
         3.0: 1264
```

**Usage sites (3)**:

- `build_center_overlap_matrix.py:25` — `"V161196", "V161198", "V161204", "V161208", "V161213",`
- `generate_variable_audit.py:118` — `"V161213": "⚠️ SCALE-MISMATCH BUG (logged): 2016 PRE 'Sending troops to fight ISIS' — 3-category direction item (1-3), used as ...`
- `build_center_breakdown.py:28` — `"V161196", "V161198", "V161204", "V161208", "V161213",`

### `V161215` [2016]  —  ✅ CODEBOOK-VERIFIED: 'PRE: REV How often trust govt in Wash to do what is right' Likert 1-5 (1=always, 5=never). Code transforms (5-x)/4 so higher=more trust.

**Observed distribution** (top values, numeric):

```
        -9.0: 19
        -8.0: 3
         1.0: 66
         2.0: 429
         3.0: 1382
         4.0: 1826
         5.0: 545
```

**Usage sites (19)**:

- `build_voter_map_2016.py:18` — `y:           trust composite from V161215/V161216/V161217 (0 = no trust, 1 = full)`
- `build_voter_map_2016.py:54` — `do_right = pd.to_numeric(df["V161215"], errors="coerce").where(lambda v: v.between(1, 5))`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:88` — `"V161215": "✅ CODEBOOK-VERIFIED: 'PRE: REV How often trust govt in Wash to do what is right' Likert 1-5 (1=always, 5=never). Co...`
- `generate_variable_audit.py:91` — `"V201233": "✅ CODEBOOK-VERIFIED: 2020 analog of V161215. Same scale.",`
- `generate_variable_audit.py:94` — `"V241229": "✅ CODEBOOK-VERIFIED: 2024 analog of V161215 (gov-officials do right).",`
- `build_within_tent_bolt.py:22` — `t1 = clean_var(df, "V161215", 1, 5)`
- `build_within_tent_bolt.py:27` — `#   V161215: 1 always..5 never → higher = LESS trust → normalize to 1-(s-1)/4`
- `build_within_tent_bolt.py:99` — `"V161215/V161216/V161217 (3-item trust index, PRE-election)",`
- `build_turnout_hump.py:29` — `t1 = clean_var(df, "V161215", 1, 5)`
- `build_turnout_hump.py:34` — `(t1 - 1) / 4,         # V161215: 1 always..5 never → grievance high at 5`
- `build_turnout_hump.py:135` — `"V161215/216/217 (3-item trust → grievance index)",`
- `build_candidate_honesty_by_trust.py:237` — `do_right = df['V161215'].where(df['V161215'].between(1,5))`
- `build_candidate_honesty_by_trust.py:237` — `do_right = df['V161215'].where(df['V161215'].between(1,5))`
- `build_voter_maps_all.py:42` — `do_right = safe_num(df, "V161215").where(lambda v: v.between(1, 5))`
- `build_trust_by_cohort.py:13` — `- ANES standalone 2016 V161215, 2020 V201233, 2024 V241229: 5-pt scale`
- `build_trust_by_cohort.py:90` — `t = clean_var(d, "V161215", 1, 5)`
- `build_trust_by_cohort.py:135` — `"source": "ANES CDF 1958-2012 (VCF0604) + ANES standalone 2016/2020/2024 (V161215/V201233/V241229). Headline metric: % saying '...`
- `build_swing_trust_turnout.py:107` — `cols = {2016: ('V161215','V161216','V161217'),`

### `V161216` [2016]  —  ✅ CODEBOOK-VERIFIED: 'gov run by few big interests vs benefit of all', 1=few/2=all. Code transforms (x-1) so 1=more trust (i.e. 2 → 1).

**Observed distribution** (top values, numeric):

```
        -9.0: 28
        -8.0: 29
         1.0: 3498
         2.0: 715
```

**Usage sites (15)**:

- `build_voter_map_2016.py:18` — `y:           trust composite from V161215/V161216/V161217 (0 = no trust, 1 = full)`
- `build_voter_map_2016.py:55` — `run_all  = pd.to_numeric(df["V161216"], errors="coerce").where(lambda v: v.between(1, 2))`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:89` — `"V161216": "✅ CODEBOOK-VERIFIED: 'gov run by few big interests vs benefit of all', 1=few/2=all. Code transforms (x-1) so 1=more...`
- `generate_variable_audit.py:92` — `"V201234": "✅ CODEBOOK-VERIFIED: 2020 analog of V161216. Same scale.",`
- `generate_variable_audit.py:95` — `"V241231": "✅ CODEBOOK-VERIFIED: 2024 analog of V161216 (few interests vs all).",`
- `build_within_tent_bolt.py:23` — `t2 = clean_var(df, "V161216", 1, 2)`
- `build_within_tent_bolt.py:28` — `#   V161216: 1 few big int..2 benefit all → higher = MORE trust → normalize to (s-1)/1`
- `build_within_tent_bolt.py:99` — `"V161215/V161216/V161217 (3-item trust index, PRE-election)",`
- `build_turnout_hump.py:30` — `t2 = clean_var(df, "V161216", 1, 2)`
- `build_turnout_hump.py:35` — `(2 - t2),             # V161216: 1 few big int (high griev), 2 benefit all`
- `build_candidate_honesty_by_trust.py:238` — `run_all  = df['V161216'].where(df['V161216'].between(1,2))`
- `build_candidate_honesty_by_trust.py:238` — `run_all  = df['V161216'].where(df['V161216'].between(1,2))`
- `build_voter_maps_all.py:43` — `run_all  = safe_num(df, "V161216").where(lambda v: v.between(1, 2))`
- `build_swing_trust_turnout.py:107` — `cols = {2016: ('V161215','V161216','V161217'),`

### `V161217` [2016]  —  ✅ CODEBOOK-VERIFIED: 'how much tax money wasted' 1=a lot, 3=not much. Code transforms (x-1)/2 so higher=more trust.

**Observed distribution** (top values, numeric):

```
        -9.0: 19
        -8.0: 7
         1.0: 3070
         2.0: 1033
         3.0: 141
```

**Usage sites (15)**:

- `build_voter_map_2016.py:18` — `y:           trust composite from V161215/V161216/V161217 (0 = no trust, 1 = full)`
- `build_voter_map_2016.py:56` — `waste    = pd.to_numeric(df["V161217"], errors="coerce").where(lambda v: v.between(1, 3))`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:90` — `"V161217": "✅ CODEBOOK-VERIFIED: 'how much tax money wasted' 1=a lot, 3=not much. Code transforms (x-1)/2 so higher=more trust.",`
- `generate_variable_audit.py:93` — `"V201235": "✅ CODEBOOK-VERIFIED: 2020 analog of V161217. Same scale.",`
- `generate_variable_audit.py:96` — `"V241232": "✅ CODEBOOK-VERIFIED: 2024 analog of V161217 (tax money wasted).",`
- `build_within_tent_bolt.py:24` — `t3 = clean_var(df, "V161217", 1, 5)`
- `build_within_tent_bolt.py:29` — `#   V161217: 1 a lot waste..5 not at all → higher = MORE trust → normalize (s-1)/4`
- `build_within_tent_bolt.py:99` — `"V161215/V161216/V161217 (3-item trust index, PRE-election)",`
- `build_turnout_hump.py:31` — `t3 = clean_var(df, "V161217", 1, 5)`
- `build_turnout_hump.py:36` — `(t3 - 1) / 4,         # V161217: 1 lot waste (high griev)..3 not at all`
- `build_candidate_honesty_by_trust.py:239` — `waste    = df['V161217'].where(df['V161217'].between(1,3))`
- `build_candidate_honesty_by_trust.py:239` — `waste    = df['V161217'].where(df['V161217'].between(1,3))`
- `build_voter_maps_all.py:44` — `waste    = safe_num(df, "V161217").where(lambda v: v.between(1, 3))`
- `build_swing_trust_turnout.py:107` — `cols = {2016: ('V161215','V161216','V161217'),`

### `V161267` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 PRE 'Respondent age' (years). clean_var(18,100).

**Observed distribution** (top values, numeric):

```
        -9.0: 120
        -8.0: 1
        18.0: 28
        19.0: 39
        20.0: 54
        21.0: 53
        22.0: 43
        23.0: 56
        24.0: 55
        25.0: 63
        26.0: 70
        27.0: 70
        28.0: 60
        29.0: 60
        30.0: 69
        31.0: 78
        32.0: 86
        33.0: 73
        34.0: 81
        35.0: 79
```

**Usage sites (2)**:

- `generate_variable_audit.py:141` — `"V161267": "✅ CODEBOOK-VERIFIED: 2016 PRE 'Respondent age' (years). clean_var(18,100).",`
- `build_trust_by_cohort.py:88` — `age = clean_var(d, "V161267", 18, 100)`

### `V162031x` [2016]  —  🔥 KNOWN-BUG-FIXED: codebook-verified — 1=voted, 0=did not vote in 2016, -2=not ascertained. We drop -2 voters from the voter map (was previously folded silently into 'did not vote').

**Observed distribution** (top values, numeric):

```
        -8.0: 1
        -2.0: 938
         0.0: 444
         1.0: 2887
```

**Usage sites (14)**:

- `build_voter_map_2016.py:24` — `dropoff:     1 if voted 2012 but NOT in 2016 (V161005 == 1 AND V162031x != 1)`
- `build_voter_map_2016.py:106` — `# 2016 validated turnout (V162031x: 1=voted, 0=didn't, -2=no post)`
- `build_voter_map_2016.py:107` — `voted_2016 = pd.to_numeric(df["V162031x"], errors="coerce") if "V162031x" in df.columns else None`
- `build_voter_map_2016.py:107` — `voted_2016 = pd.to_numeric(df["V162031x"], errors="coerce") if "V162031x" in df.columns else None`
- `build_voter_map_2016.py:178` — `"source": "ANES 2016 Time Series Study, weighted (V160102). x=V161126 ideology (1-7 → -1..+1). y=V161215/V161216/V161217 trust ...`
- `generate_variable_audit.py:69` — `"V162031x": "🔥 KNOWN-BUG-FIXED: codebook-verified — 1=voted, 0=did not vote in 2016, -2=not ascertained. We drop -2 voters from...`
- `build_turnout_hump.py:7` — `- turnout pct (V162031x self-report, since vote-validated cells get tiny)`
- `build_turnout_hump.py:48` — `# turnout V162031x: 0 no / 1 yes`
- `build_turnout_hump.py:49` — `turn = clean_var(df, "V162031x", 0, 1)`
- `build_turnout_hump.py:136` — `"V162215 / V162216 (efficacy items)", "V162031x (self-report turnout)",`
- `build_turnout_hump.py:147` — `"Turnout figures are SELF-REPORT (V162031x); over-report ~25pp vs validated. The gradient pattern is the reliable signal; absol...`
- `build_voter_maps_all.py:71` — `voted_2016 = safe_num(df, "V162031x")`
- `build_voter_maps_all.py:72` — `# AUDIT FIX (per user direction): drop V162031x == -2 (not ascertained)`
- `build_swing_trust_turnout.py:82` — `(2016, None, 'V162031x', 'V160102', 'V161010d'),`

### `V162034a` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 general-election vote. 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other.

**Observed distribution** (top values, numeric):

```
        -9.0: 26
        -8.0: 2
        -7.0: 86
        -6.0: 536
        -1.0: 957
         1.0: 1290
         2.0: 1178
         3.0: 115
         4.0: 31
         5.0: 39
         7.0: 1
         9.0: 9
```

**Usage sites (26)**:

- `build_voter_map_2016.py:20` — `v:           general election vote (V162034a recoded to clinton/trump/johnson/stein/other)`
- `build_voter_map_2016.py:72` — `# GENERAL VOTE (V162034a: 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other)`
- `build_voter_map_2016.py:73` — `gen = pd.to_numeric(df["V162034a"], errors="coerce")`
- `build_warmth_fear_spread.py:9` — `For each, bin into quintiles and report self-reported turnout (V162034a`
- `build_warmth_fear_spread.py:26` — `# V162034a is the post-election presidential vote choice. Codes ≥1 mean`
- `build_warmth_fear_spread.py:29` — `vote = pd.to_numeric(d["V162034a"], errors="coerce")`
- `build_warmth_fear_spread.py:91` — `"V162034a (presidential vote; non-missing = turnout proxy)",`
- `build_warmth_fear_spread.py:98` — `"method": "Weighted quintile binning on each metric; turnout = % of bin with V162034a non-missing, weighted by V160101.",`
- `build_center_overlap_matrix.py:8` — `voted for the other party's nominee. From V161158x (PID) × V162034a (vote).`
- `build_center_overlap_matrix.py:52` — `vote = pd.to_numeric(d["V162034a"], errors="coerce")  # 1=Clinton, 2=Trump`
- `build_center_overlap_matrix.py:133` — `"V162034a (presidential vote)",`
- `generate_variable_audit.py:102` — `"V162034a": "✅ CODEBOOK-VERIFIED: 2016 general-election vote. 1=Clinton, 2=Trump, 3=Johnson, 4=Stein, 5=other.",`
- `build_partisan_loyalty.py:18` — `vch = clean_var(df, "V162034a", 1, 7)`
- `build_partisan_loyalty.py:113` — `"V161126 (lib-con)", "V162034a (presidential vote)"],`
- `build_within_tent_bolt.py:37` — `vch = clean_var(df, "V162034a", 1, 7)`
- `build_within_tent_bolt.py:98` — `"V160101 (weight)", "V161158x (PID)", "V162034a (vote)",`
- `build_center_breakdown.py:43` — `vch = clean_var(df, "V162034a", 1, 7)`
- `build_center_breakdown.py:106` — `"V162034a (presidential vote)",`
- `build_center_breakdown.py:116` — `"Turnout figures are SELF-REPORT (V162034a non-missing); over-reports vs. validated by ~25pp.",`
- `build_swing_spectrum.py:7` — `Dem→Trump : V161158x ∈ {1,2,3} (Dem leaners+) AND V162034a = 2 (Trump)`
- `build_swing_spectrum.py:8` — `Rep→Clinton: V161158x ∈ {5,6,7} (Rep leaners+) AND V162034a = 1 (Clinton)`
- `build_swing_spectrum.py:36` — `vote = pd.to_numeric(d["V162034a"], errors="coerce")`
- `build_swing_spectrum.py:87` — `"V162034a (presidential vote; 1=Clinton, 2=Trump)",`
- `build_swing_spectrum.py:90` — `"Dem→Trump": "V161158x ∈ {1,2,3} (Dem leaners+) AND V162034a = 2",`
- `build_swing_spectrum.py:91` — `"Rep→Clinton": "V161158x ∈ {5,6,7} (Rep leaners+) AND V162034a = 1",`
- _...and 1 more usage sites_

### `V162078` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 POST feeling thermometer, Democratic presidential candidate (0-100).

**Observed distribution** (top values, numeric):

```
        -9.0: 24
        -7.0: 86
        -6.0: 536
         0.0: 648
         1.0: 79
         2.0: 73
         3.0: 21
         4.0: 10
         5.0: 14
         6.0: 5
         7.0: 5
         8.0: 7
         9.0: 1
        10.0: 15
        11.0: 4
        12.0: 6
        13.0: 5
        14.0: 4
        15.0: 317
        16.0: 44
```

**Usage sites (3)**:

- `generate_variable_audit.py:123` — `"V162078": "✅ CODEBOOK-VERIFIED: 2016 POST feeling thermometer, Democratic presidential candidate (0-100).",`
- `build_within_cycle_multi.py:12` — `V162078 (Clinton POST), V162079 (Trump POST), V160102 (weight)`
- `build_within_cycle_multi.py:43` — `"dem_post": "V162078", "rep_post": "V162079",`

### `V162079` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 POST feeling thermometer, Republican presidential candidate (0-100).

**Observed distribution** (top values, numeric):

```
        -9.0: 14
        -7.0: 86
        -6.0: 536
         0.0: 820
         1.0: 84
         2.0: 63
         3.0: 28
         4.0: 13
         5.0: 18
         6.0: 6
         7.0: 6
         8.0: 5
         9.0: 4
        10.0: 21
        11.0: 3
        12.0: 4
        14.0: 6
        15.0: 263
        16.0: 34
        17.0: 17
```

**Usage sites (3)**:

- `generate_variable_audit.py:124` — `"V162079": "✅ CODEBOOK-VERIFIED: 2016 POST feeling thermometer, Republican presidential candidate (0-100).",`
- `build_within_cycle_multi.py:12` — `V162078 (Clinton POST), V162079 (Trump POST), V160102 (weight)`
- `build_within_cycle_multi.py:43` — `"dem_post": "V162078", "rep_post": "V162079",`

### `V162215` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 POST '[STD] Public officials don't care what people think' (external efficacy), 1-5. build_turnout_hump.py clean_var(1,5); efficacy = mean(V162215,V162216)/5.

**Observed distribution** (top values, numeric):

```
        -9.0: 11
        -8.0: 3
        -7.0: 86
        -6.0: 536
         1.0: 763
         2.0: 1395
         3.0: 812
         4.0: 534
         5.0: 130
```

**Usage sites (6)**:

- `generate_variable_audit.py:135` — `"V162215": "✅ CODEBOOK-VERIFIED: 2016 POST '[STD] Public officials don't care what people think' (external efficacy), 1-5. buil...`
- `generate_variable_audit.py:135` — `"V162215": "✅ CODEBOOK-VERIFIED: 2016 POST '[STD] Public officials don't care what people think' (external efficacy), 1-5. buil...`
- `build_noshow_typology_by_cycle.py:162` — `"CDF. The 2016 build (turnout_hump.csv) uses a 2-item efficacy composite (V162215 + V162216) "`
- `build_turnout_hump.py:6` — `- efficacy /5 (mean of V162215, V162216)`
- `build_turnout_hump.py:39` — `e1 = clean_var(df, "V162215", 1, 5)`
- `build_turnout_hump.py:136` — `"V162215 / V162216 (efficacy items)", "V162031x (self-report turnout)",`

### `V162216` [2016]  —  ✅ CODEBOOK-VERIFIED: 2016 POST '[STD] Have no say about what govt does' (external efficacy), 1-5. clean_var(1,5).

**Observed distribution** (top values, numeric):

```
        -9.0: 13
        -8.0: 2
        -7.0: 86
        -6.0: 536
         1.0: 619
         2.0: 1200
         3.0: 621
         4.0: 892
         5.0: 301
```

**Usage sites (6)**:

- `generate_variable_audit.py:135` — `"V162215": "✅ CODEBOOK-VERIFIED: 2016 POST '[STD] Public officials don't care what people think' (external efficacy), 1-5. buil...`
- `generate_variable_audit.py:136` — `"V162216": "✅ CODEBOOK-VERIFIED: 2016 POST '[STD] Have no say about what govt does' (external efficacy), 1-5. clean_var(1,5).",`
- `build_noshow_typology_by_cycle.py:162` — `"CDF. The 2016 build (turnout_hump.csv) uses a 2-item efficacy composite (V162215 + V162216) "`
- `build_turnout_hump.py:6` — `- efficacy /5 (mean of V162215, V162216)`
- `build_turnout_hump.py:40` — `e2 = clean_var(df, "V162216", 1, 5)`
- `build_turnout_hump.py:136` — `"V162215 / V162216 (efficacy items)", "V162031x (self-report turnout)",`

## Cycle: ANES 2020  (n_respondents = 8280)


### `V200010a` [2020]  —  🔥 KNOWN-BUG-FIXED: ANES 2020 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py; switched to V200010b (POST) per Gate 3 of rigor process.

**Observed distribution** (top values, numeric):

```
  0.0264965417249224: 1
  0.0301750083551096: 1
  0.0346270330896503: 1
  0.0383760963194065: 1
  0.0398617852876149: 1
  0.0440167809419855: 1
  0.0449680726841624: 1
  0.0467204314417285: 1
  0.0490116271395454: 1
  0.0538026337079162: 1
  0.0540389990439476: 1
  0.0543380977089111: 1
  0.0546351383075654: 1
  0.0553347881116193: 1
  0.0557881624820672: 1
  0.0587751003469303: 1
  0.0592217395337139: 1
  0.0597476608101255: 1
  0.0598764032207611: 1
  0.0615980046123792: 1
```

**Usage sites (6)**:

- `generate_variable_audit.py:155` — `"V200010a": "🔥 KNOWN-BUG-FIXED: ANES 2020 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py;...`
- `build_within_cycle_multi.py:14` — `V202143 (Biden POST), V202144 (Trump POST), V200010a (weight)`
- `build_within_cycle_multi.py:53` — `"weight": "V200010a",`
- `build_candidate_honesty_by_trust.py:260` — `w = pd.to_numeric(df.get('V200010a', df.get('V200010b')), errors='coerce').fillna(0).clip(lower=0)`
- `build_voter_maps_all.py:149` — `# voters' vote is collected post-election). V200010a was incorrectly used`
- `build_trust_by_cohort.py:97` — `w = pd.to_numeric(d["V200010a"], errors="coerce").fillna(0).clip(lower=0)`

### `V200010b` [2020]  —  ✅ CODEBOOK-VERIFIED: ANES 2020 POST weight. Now used for the voter map (vote choice is post-election data).

**Observed distribution** (top values, numeric):

```
  0.00826198694895478: 1
  0.00928307803432664: 1
  0.0129779236135113: 1
  0.0136368604175085: 1
  0.0143747599289093: 1
  0.0143922205767948: 1
  0.0155400007193579: 1
  0.0158974612490534: 1
  0.0186948021693755: 1
  0.0198738235055386: 1
  0.0208325441426812: 1
  0.0209248141301374: 1
  0.0221089493332487: 1
  0.0237263258701382: 1
  0.0248871442085022: 1
  0.0280737611198536: 1
  0.028165209252713: 1
  0.0302405753098574: 1
  0.0310864402009414: 1
  0.0318578907959987: 1
```

**Usage sites (6)**:

- `generate_variable_audit.py:155` — `"V200010a": "🔥 KNOWN-BUG-FIXED: ANES 2020 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py;...`
- `generate_variable_audit.py:156` — `"V200010b": "✅ CODEBOOK-VERIFIED: ANES 2020 POST weight. Now used for the voter map (vote choice is post-election data).",`
- `build_candidate_honesty_by_trust.py:260` — `w = pd.to_numeric(df.get('V200010a', df.get('V200010b')), errors='coerce').fillna(0).clip(lower=0)`
- `build_voter_maps_all.py:148` — `# Weight: V200010b is POST weight (correct for vote-choice analysis since`
- `build_voter_maps_all.py:151` — `w = safe_num(df, "V200010b").fillna(0).clip(lower=0)`
- `build_swing_trust_turnout.py:83` — `(2020, None, 'V202109x', 'V200010b', 'V201014b'),`

### `V201014b` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 state FIPS code.

**Observed distribution** (top values, numeric):

```
          -9: 7
          -8: 3
          -1: 718
           1: 111
           2: 10
           4: 150
           5: 60
           6: 702
           8: 160
           9: 80
          10: 20
          11: 41
          12: 478
          13: 218
          15: 29
          16: 63
          17: 318
          18: 181
          19: 65
          20: 97
```

**Usage sites (4)**:

- `generate_variable_audit.py:162` — `"V201014b": "✅ CODEBOOK-VERIFIED: 2020 state FIPS code.",`
- `build_candidate_honesty_by_trust.py:261` — `state = pd.to_numeric(df['V201014b'], errors='coerce')`
- `build_voter_maps_all.py:152` — `state = safe_num(df, "V201014b")`
- `build_swing_trust_turnout.py:83` — `(2020, None, 'V202109x', 'V200010b', 'V201014b'),`

### `V201020` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 PRE: 'Did R vote in Presidential primary or caucus?' 1=yes, 2=no.

**Observed distribution** (top values, numeric):

```
          -9: 13
          -8: 6
           1: 4102
           2: 4159
```

**Usage sites (1)**:

- `generate_variable_audit.py:77` — `"V201020": "✅ CODEBOOK-VERIFIED: 2020 PRE: 'Did R vote in Presidential primary or caucus?' 1=yes, 2=no.",`

### `V201021` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 PRE: 'For which candidate did R vote in Presidential primary'. 1=Biden, 2=Bloomberg, 3=Buttigieg, 4=Klobuchar, 5=Sanders, 6=Warren, 7=Another Dem, 8=Trump, 9=Another Rep, 10=Someone else. Universe: 'IF R VOTED IN A PRESIDENTIAL PRIMARY OR CAUCUS'. Used in voter map to identify Biden/Sanders/Trump primary cohorts.

**Observed distribution** (top values, numeric):

```
          -9: 36
          -8: 8
          -1: 4177
           1: 1439
           2: 72
           3: 112
           4: 72
           5: 489
           6: 242
           7: 60
           8: 1389
           9: 70
          10: 114
```

**Usage sites (3)**:

- `generate_variable_audit.py:78` — `"V201021": "✅ CODEBOOK-VERIFIED: 2020 PRE: 'For which candidate did R vote in Presidential primary'. 1=Biden, 2=Bloomberg, 3=Bu...`
- `build_voter_maps_all.py:125` — `# 2020 PRIMARY VOTE — V201021 (CODEBOOK-VERIFIED).`
- `build_voter_maps_all.py:130` — `prim = safe_num(df, "V201021")`

### `V201101` [2020]  —  🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMIZED HALVES of the same 2016-recall question. Each respondent gets only one. Using V201101 alone misses ~half the sample. Build now combines V201101 ∨ V201102. Effect: 2020 drop-off count was 101, now 230; new-voter count was 372, now 679.

**Observed distribution** (top values, numeric):

```
          -9: 14
          -8: 2
          -1: 4193
           1: 3070
           2: 1001
```

**Usage sites (9)**:

- `generate_variable_audit.py:71` — `"V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMI...`
- `generate_variable_audit.py:71` — `"V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMI...`
- `generate_variable_audit.py:71` — `"V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMI...`
- `generate_variable_audit.py:71` — `"V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMI...`
- `generate_variable_audit.py:72` — `"V201102": "🔥 KNOWN-BUG-FIXED: Companion to V201101 (versions 1A/1B). Was previously unused. Now combined with V201101 to recov...`
- `generate_variable_audit.py:72` — `"V201102": "🔥 KNOWN-BUG-FIXED: Companion to V201101 (versions 1A/1B). Was previously unused. Now combined with V201101 to recov...`
- `build_voter_maps_all.py:136` — `# V201101 (version 1A) and V201102 (version 1B). EACH respondent got`
- `build_voter_maps_all.py:137` — `# only one of the two; the other shows -1 (inapplicable). Using V201101`
- `build_voter_maps_all.py:140` — `v1 = safe_num(df, "V201101")`

### `V201102` [2020]  —  🔥 KNOWN-BUG-FIXED: Companion to V201101 (versions 1A/1B). Was previously unused. Now combined with V201101 to recover full sample.

**Observed distribution** (top values, numeric):

```
          -9: 8
          -8: 2
          -1: 4087
           1: 3330
           2: 853
```

**Usage sites (5)**:

- `generate_variable_audit.py:71` — `"V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMI...`
- `generate_variable_audit.py:71` — `"V201101": "🔥 KNOWN-BUG-FIXED: Universe 'IF R SELECTED FOR VERSION 1A OF VERSION 1A/1B SPLICE'. V201101 and V201102 are RANDOMI...`
- `generate_variable_audit.py:72` — `"V201102": "🔥 KNOWN-BUG-FIXED: Companion to V201101 (versions 1A/1B). Was previously unused. Now combined with V201101 to recov...`
- `build_voter_maps_all.py:136` — `# V201101 (version 1A) and V201102 (version 1B). EACH respondent got`
- `build_voter_maps_all.py:141` — `v2 = safe_num(df, "V201102")`

### `V201151` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 PRE feeling thermometer, Biden (0-100). build_within_cycle_multi.py restricts .between(0,100).

**Observed distribution** (top values, numeric):

```
          -9: 218
          -4: 1
           0: 1634
           1: 10
           2: 3
           3: 1
           4: 3
           5: 19
           6: 3
           7: 1
           9: 3
          10: 44
          11: 1
          12: 2
          13: 3
          15: 644
          20: 35
          25: 24
          26: 1
          29: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:125` — `"V201151": "✅ CODEBOOK-VERIFIED: 2020 PRE feeling thermometer, Biden (0-100). build_within_cycle_multi.py restricts .between(0,...`
- `build_within_cycle_multi.py:13` — `2020: V201151 (Biden PRE), V201152 (Trump PRE),`
- `build_within_cycle_multi.py:51` — `"dem_pre": "V201151", "rep_pre": "V201152",`

### `V201152` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 PRE feeling thermometer, Trump (0-100). .between(0,100).

**Observed distribution** (top values, numeric):

```
          -9: 232
           0: 3189
           1: 15
           2: 11
           3: 6
           5: 29
           6: 2
           7: 1
           8: 3
           9: 2
          10: 64
          12: 2
          15: 531
          18: 1
          20: 23
          24: 1
          25: 10
          29: 1
          30: 302
          34: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:126` — `"V201152": "✅ CODEBOOK-VERIFIED: 2020 PRE feeling thermometer, Trump (0-100). .between(0,100).",`
- `build_within_cycle_multi.py:13` — `2020: V201151 (Biden PRE), V201152 (Trump PRE),`
- `build_within_cycle_multi.py:51` — `"dem_pre": "V201151", "rep_pre": "V201152",`

### `V201200` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 ideology self-placement, same 1-7 scale as V161126.

**Observed distribution** (top values, numeric):

```
          -9: 21
          -8: 2
           1: 369
           2: 1210
           3: 918
           4: 1818
           5: 821
           6: 1492
           7: 428
          99: 1201
```

**Usage sites (2)**:

- `generate_variable_audit.py:86` — `"V201200": "✅ CODEBOOK-VERIFIED: 2020 ideology self-placement, same 1-7 scale as V161126.",`
- `build_voter_maps_all.py:111` — `ideo = safe_num(df, "V201200").where(lambda x: x.between(1, 7))`

### `V201202` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 R places Dem cand on 7-pt lib-con scale.

**Observed distribution** (top values, numeric):

```
          -9: 102
          -8: 19
           1: 1605
           2: 2516
           3: 1588
           4: 1623
           5: 352
           6: 314
           7: 161
```

**Usage sites (3)**:

- `generate_variable_audit.py:176` — `"V201202": "✅ CODEBOOK-VERIFIED: 2020 R places Dem cand on 7-pt lib-con scale.",`
- `build_voter_maps_all.py:154` — `# Perceived candidate positions: V201202/03 (ideology),`
- `build_voter_maps_all.py:156` — `dem_perc_x = (safe_num(df, "V201202").where(lambda v: v.between(1, 7)) - 4) / 3.0`

### `V201203` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 R places Rep cand on 7-pt lib-con scale.

**Observed distribution** (top values, numeric):

```
          -9: 177
          -8: 31
          -4: 1
           1: 382
           2: 254
           3: 194
           4: 826
           5: 954
           6: 2964
           7: 2497
```

**Usage sites (2)**:

- `generate_variable_audit.py:177` — `"V201203": "✅ CODEBOOK-VERIFIED: 2020 R places Rep cand on 7-pt lib-con scale.",`
- `build_voter_maps_all.py:157` — `rep_perc_x = (safe_num(df, "V201203").where(lambda v: v.between(1, 7)) - 4) / 3.0`

### `V201208` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 Dem cand 'strong leadership' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 31
          -8: 6
           1: 874
           2: 1656
           3: 1662
           4: 1099
           5: 2952
```

**Usage sites (3)**:

- `generate_variable_audit.py:186` — `"V201208": "✅ CODEBOOK-VERIFIED: 2020 Dem cand 'strong leadership' Likert 1-5.",`
- `build_voter_maps_all.py:155` — `# V201208+V201209 (Biden lead+cares) / V201212+V201213 (Trump lead+cares)`
- `build_voter_maps_all.py:158` — `d_lead  = (5 - safe_num(df, "V201208").where(lambda v: v.between(1, 5))) / 4.0`

### `V201209` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 Dem cand 'really cares' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 39
          -8: 2
           1: 1406
           2: 1575
           3: 1491
           4: 1304
           5: 2463
```

**Usage sites (3)**:

- `generate_variable_audit.py:187` — `"V201209": "✅ CODEBOOK-VERIFIED: 2020 Dem cand 'really cares' Likert 1-5.",`
- `build_voter_maps_all.py:155` — `# V201208+V201209 (Biden lead+cares) / V201212+V201213 (Trump lead+cares)`
- `build_voter_maps_all.py:159` — `d_cares = (5 - safe_num(df, "V201209").where(lambda v: v.between(1, 5))) / 4.0`

### `V201211` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 Dem cand 'honest'.

**Observed distribution** (top values, numeric):

```
          -9: 38
          -8: 7
           1: 1090
           2: 1649
           3: 1653
           4: 1304
           5: 2539
```

**Usage sites (4)**:

- `generate_variable_audit.py:168` — `"V201211": "✅ CODEBOOK-VERIFIED: 2020 Dem cand 'honest'.",`
- `build_candidate_honesty_by_trust.py:257` — `# V201211 = Biden honest; V201215 = Trump honest. Verified to reproduce hardcoded RECENT.`
- `build_candidate_honesty_by_trust.py:258` — `hd = 5 - df['V201211'].where(df['V201211'].between(1,5))`
- `build_candidate_honesty_by_trust.py:258` — `hd = 5 - df['V201211'].where(df['V201211'].between(1,5))`

### `V201212` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 Rep cand 'strong leadership' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 27
           1: 1590
           2: 1148
           3: 883
           4: 770
           5: 3862
```

**Usage sites (3)**:

- `generate_variable_audit.py:188` — `"V201212": "✅ CODEBOOK-VERIFIED: 2020 Rep cand 'strong leadership' Likert 1-5.",`
- `build_voter_maps_all.py:155` — `# V201208+V201209 (Biden lead+cares) / V201212+V201213 (Trump lead+cares)`
- `build_voter_maps_all.py:160` — `r_lead  = (5 - safe_num(df, "V201212").where(lambda v: v.between(1, 5))) / 4.0`

### `V201213` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 Rep cand 'really cares' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 25
           1: 1235
           2: 1093
           3: 882
           4: 712
           5: 4333
```

**Usage sites (3)**:

- `generate_variable_audit.py:189` — `"V201213": "✅ CODEBOOK-VERIFIED: 2020 Rep cand 'really cares' Likert 1-5.",`
- `build_voter_maps_all.py:155` — `# V201208+V201209 (Biden lead+cares) / V201212+V201213 (Trump lead+cares)`
- `build_voter_maps_all.py:161` — `r_cares = (5 - safe_num(df, "V201213").where(lambda v: v.between(1, 5))) / 4.0`

### `V201215` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 Rep cand 'honest'.

**Observed distribution** (top values, numeric):

```
          -9: 27
          -8: 1
           1: 690
           2: 1049
           3: 1213
           4: 704
           5: 4596
```

**Usage sites (4)**:

- `generate_variable_audit.py:169` — `"V201215": "✅ CODEBOOK-VERIFIED: 2020 Rep cand 'honest'.",`
- `build_candidate_honesty_by_trust.py:257` — `# V201211 = Biden honest; V201215 = Trump honest. Verified to reproduce hardcoded RECENT.`
- `build_candidate_honesty_by_trust.py:259` — `hr = 5 - df['V201215'].where(df['V201215'].between(1,5))`
- `build_candidate_honesty_by_trust.py:259` — `hr = 5 - df['V201215'].where(df['V201215'].between(1,5))`

### `V201231x` [2020]  —  🔥 KNOWN-BUG-FIXED: codebook-verified — 'PRE: SUMMARY: PARTY ID', 1=Strong Democrat … 7=Strong Republican. Off-by-one corrected. Now: 1,2,3 → dem, 4 → ind, 5,6,7 → rep.

**Observed distribution** (top values, numeric):

```
          -9: 31
          -8: 4
           1: 1961
           2: 900
           3: 975
           4: 968
           5: 879
           6: 832
           7: 1730
```

**Usage sites (5)**:

- `extract_codebook_entries.py:50` — `'V201231x\tPRE: SUMMARY: PARTY ID' (2020/2024 tab-delimited format)`
- `generate_variable_audit.py:68` — `"V201231x": "🔥 KNOWN-BUG-FIXED: codebook-verified — 'PRE: SUMMARY: PARTY ID', 1=Strong Democrat … 7=Strong Republican. Off-by-o...`
- `generate_variable_audit.py:100` — `"V241227x": "✅ CODEBOOK-VERIFIED: 2024 7-pt party summary. Same scale as V161158x/V201231x. Already mapped correctly (1,2,3→dem...`
- `build_voter_maps_all.py:117` — `# V201231x is the standard ANES 7-pt party summary (same scale as 2016/2024):`
- `build_voter_maps_all.py:120` — `pty = safe_num(df, "V201231x")`

### `V201233` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 analog of V161215. Same scale.

**Observed distribution** (top values, numeric):

```
          -9: 34
          -8: 3
           1: 88
           2: 1133
           3: 2569
           4: 3674
           5: 779
```

**Usage sites (8)**:

- `generate_variable_audit.py:91` — `"V201233": "✅ CODEBOOK-VERIFIED: 2020 analog of V161215. Same scale.",`
- `build_candidate_honesty_by_trust.py:253` — `do_right = df['V201233'].where(df['V201233'].between(1,5))`
- `build_candidate_honesty_by_trust.py:253` — `do_right = df['V201233'].where(df['V201233'].between(1,5))`
- `build_voter_maps_all.py:113` — `do_right = safe_num(df, "V201233").where(lambda v: v.between(1, 5))`
- `build_trust_by_cohort.py:13` — `- ANES standalone 2016 V161215, 2020 V201233, 2024 V241229: 5-pt scale`
- `build_trust_by_cohort.py:100` — `t = clean_var(d, "V201233", 1, 5)`
- `build_trust_by_cohort.py:135` — `"source": "ANES CDF 1958-2012 (VCF0604) + ANES standalone 2016/2020/2024 (V161215/V201233/V241229). Headline metric: % saying '...`
- `build_swing_trust_turnout.py:108` — `2020: ('V201233','V201234','V201235'),`

### `V201234` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 analog of V161216. Same scale.

**Observed distribution** (top values, numeric):

```
          -9: 88
          -8: 14
           1: 6909
           2: 1269
```

**Usage sites (5)**:

- `generate_variable_audit.py:92` — `"V201234": "✅ CODEBOOK-VERIFIED: 2020 analog of V161216. Same scale.",`
- `build_candidate_honesty_by_trust.py:254` — `run_all  = df['V201234'].where(df['V201234'].between(1,2))`
- `build_candidate_honesty_by_trust.py:254` — `run_all  = df['V201234'].where(df['V201234'].between(1,2))`
- `build_voter_maps_all.py:114` — `run_all  = safe_num(df, "V201234").where(lambda v: v.between(1, 2))`
- `build_swing_trust_turnout.py:108` — `2020: ('V201233','V201234','V201235'),`

### `V201235` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 analog of V161217. Same scale.

**Observed distribution** (top values, numeric):

```
          -9: 24
          -8: 5
           1: 5580
           2: 2477
           3: 194
```

**Usage sites (5)**:

- `generate_variable_audit.py:93` — `"V201235": "✅ CODEBOOK-VERIFIED: 2020 analog of V161217. Same scale.",`
- `build_candidate_honesty_by_trust.py:255` — `waste    = df['V201235'].where(df['V201235'].between(1,3))`
- `build_candidate_honesty_by_trust.py:255` — `waste    = df['V201235'].where(df['V201235'].between(1,3))`
- `build_voter_maps_all.py:115` — `waste    = safe_num(df, "V201235").where(lambda v: v.between(1, 3))`
- `build_swing_trust_turnout.py:108` — `2020: ('V201233','V201234','V201235'),`

### `V201507x` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 respondent age summary. Used as age clean_var(18,100).

**Observed distribution** (top values, numeric):

```
          -9: 348
          18: 35
          19: 52
          20: 46
          21: 51
          22: 57
          23: 75
          24: 92
          25: 104
          26: 108
          27: 132
          28: 120
          29: 131
          30: 142
          31: 109
          32: 117
          33: 123
          34: 142
          35: 152
          36: 144
```

**Usage sites (2)**:

- `generate_variable_audit.py:142` — `"V201507x": "✅ CODEBOOK-VERIFIED: 2020 respondent age summary. Used as age clean_var(18,100).",`
- `build_trust_by_cohort.py:98` — `age = clean_var(d, "V201507x", 18, 100)`

### `V202073` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 general-election vote. 1=Biden, 2=Trump, 3=Jorgensen, 4=Hawkins, 5=other.

**Observed distribution** (top values, numeric):

```
          -9: 53
          -7: 77
          -6: 754
          -1: 1497
           1: 3267
           2: 2462
           3: 69
           4: 23
           5: 56
           7: 1
           8: 3
          11: 2
          12: 16
```

**Usage sites (2)**:

- `generate_variable_audit.py:103` — `"V202073": "✅ CODEBOOK-VERIFIED: 2020 general-election vote. 1=Biden, 2=Trump, 3=Jorgensen, 4=Hawkins, 5=other.",`
- `build_voter_maps_all.py:122` — `gen = safe_num(df, "V202073")`

### `V202109x` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 turnout summary (validated). 0=did not vote, 1=voted, -2=not reported.

**Observed distribution** (top values, numeric):

```
          -2: 791
           0: 1039
           1: 6450
```

**Usage sites (3)**:

- `generate_variable_audit.py:97` — `"V202109x": "✅ CODEBOOK-VERIFIED: 2020 turnout summary (validated). 0=did not vote, 1=voted, -2=not reported.",`
- `build_voter_maps_all.py:145` — `voted_2020 = safe_num(df, "V202109x")`
- `build_swing_trust_turnout.py:83` — `(2020, None, 'V202109x', 'V200010b', 'V201014b'),`

### `V202143` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 POST feeling thermometer, Biden (0-100). build_within_cycle_multi.py .between(0,100).

**Observed distribution** (top values, numeric):

```
          -9: 65
          -7: 77
          -6: 754
          -5: 8
          -4: 1
           0: 1365
           1: 9
           2: 9
           4: 1
           5: 24
           6: 2
           7: 7
           8: 6
           9: 3
          10: 40
          12: 1
          14: 1
          15: 520
          16: 4
          18: 3
```

**Usage sites (3)**:

- `generate_variable_audit.py:129` — `"V202143": "✅ CODEBOOK-VERIFIED: 2020 POST feeling thermometer, Biden (0-100). build_within_cycle_multi.py .between(0,100).",`
- `build_within_cycle_multi.py:14` — `V202143 (Biden POST), V202144 (Trump POST), V200010a (weight)`
- `build_within_cycle_multi.py:52` — `"dem_post": "V202143", "rep_post": "V202144",`

### `V202144` [2020]  —  ✅ CODEBOOK-VERIFIED: 2020 POST feeling thermometer, Republican pres candidate Trump (0-100).

**Observed distribution** (top values, numeric):

```
          -9: 81
          -7: 77
          -6: 754
          -5: 8
          -4: 1
           0: 3082
           1: 25
           2: 7
           3: 4
           4: 6
           5: 43
           6: 1
           7: 2
           8: 4
           9: 2
          10: 52
          13: 1
          15: 466
          16: 5
          17: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:130` — `"V202144": "✅ CODEBOOK-VERIFIED: 2020 POST feeling thermometer, Republican pres candidate Trump (0-100).",`
- `build_within_cycle_multi.py:14` — `V202143 (Biden POST), V202144 (Trump POST), V200010a (weight)`
- `build_within_cycle_multi.py:52` — `"dem_post": "V202143", "rep_post": "V202144",`

## Cycle: ANES 2024  (n_respondents = 5521)


### `V240107` [2024]  —  ✅ WEIGHT (fallback only): bare 2024 weight referenced solely as a df.get fallback after V240107a/b in build_candidate_honesty_by_trust.py. Canonical 2024 weights are V240107a (PRE) / V240107b (POST).

**NOT FOUND IN LOADED DATA FRAME** — usage site may be broken or guarded by a `.get(...)` fallback.

**Usage sites (2)**:

- `generate_variable_audit.py:144` — `"V240107": "✅ WEIGHT (fallback only): bare 2024 weight referenced solely as a df.get fallback after V240107a/b in build_candida...`
- `build_candidate_honesty_by_trust.py:272` — `w = pd.to_numeric(df.get('V240107a', df.get('V240107')), errors='coerce').fillna(0).clip(lower=0)`

### `V240107a` [2024]  —  🔥 KNOWN-BUG-FIXED: ANES 2024 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py; switched to V240107b (POST).

**Observed distribution** (top values, numeric):

```
  0.0451926905626485: 1
  0.0457575196744075: 1
  0.0505372158791283: 1
  0.0547077646998915: 1
  0.0552328957764347: 1
  0.0579753539786735: 1
  0.059148714983054: 1
  0.0598230462964516: 1
  0.0633561199712714: 1
  0.0687790530836537: 1
  0.0710421254273296: 1
  0.071865616454583: 1
  0.0766441263022551: 1
  0.0768035432198997: 1
  0.0782460798260585: 1
  0.0809986588923936: 1
  0.0836802452353152: 1
  0.0850580304054904: 1
  0.0852182815991135: 1
  0.085520530847101: 1
```

**Usage sites (10)**:

- `generate_variable_audit.py:144` — `"V240107": "✅ WEIGHT (fallback only): bare 2024 weight referenced solely as a df.get fallback after V240107a/b in build_candida...`
- `generate_variable_audit.py:144` — `"V240107": "✅ WEIGHT (fallback only): bare 2024 weight referenced solely as a df.get fallback after V240107a/b in build_candida...`
- `generate_variable_audit.py:145` — `"V240108a": "✅ WEIGHT (variant): a 2024 weight column tried in build_within_cycle_multi.py's fallback list [V240107a, V240107b,...`
- `generate_variable_audit.py:145` — `"V240108a": "✅ WEIGHT (variant): a 2024 weight column tried in build_within_cycle_multi.py's fallback list [V240107a, V240107b,...`
- `generate_variable_audit.py:157` — `"V240107a": "🔥 KNOWN-BUG-FIXED: ANES 2024 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py;...`
- `build_within_cycle_multi.py:16` — `V242125 (Dem POST), V242126 (Rep POST), V240107a (weight)`
- `build_within_cycle_multi.py:62` — `"weight": "V240107a",`
- `build_candidate_honesty_by_trust.py:272` — `w = pd.to_numeric(df.get('V240107a', df.get('V240107')), errors='coerce').fillna(0).clip(lower=0)`
- `build_voter_maps_all.py:221` — `# V240107a is PRE weight — was incorrectly used earlier.`
- `build_trust_by_cohort.py:107` — `for w_col in ["V240107a", "V240107b", "V240108a"]:`

### `V240107b` [2024]  —  ✅ CODEBOOK-VERIFIED: ANES 2024 POST weight. Now used for the voter map.

**Observed distribution** (top values, numeric):

```
  0.0451775442758877: 1
  0.0472009044434515: 1
  0.0510344835474847: 1
  0.0530780210882146: 1
  0.0576521945428779: 1
  0.0590428513442548: 1
  0.0658334205540482: 1
  0.0671579719013295: 1
  0.0679049581365084: 1
  0.0697614820232412: 1
  0.0757582475292791: 1
  0.0758293718185028: 1
  0.0779366024259847: 1
  0.078282815224292: 1
  0.0792830593284651: 1
  0.0810093655750511: 1
  0.0830085816202557: 1
  0.0848352973530385: 1
  0.0851332515104662: 1
  0.0858634898572089: 1
```

**Usage sites (9)**:

- `generate_variable_audit.py:144` — `"V240107": "✅ WEIGHT (fallback only): bare 2024 weight referenced solely as a df.get fallback after V240107a/b in build_candida...`
- `generate_variable_audit.py:145` — `"V240108a": "✅ WEIGHT (variant): a 2024 weight column tried in build_within_cycle_multi.py's fallback list [V240107a, V240107b,...`
- `generate_variable_audit.py:157` — `"V240107a": "🔥 KNOWN-BUG-FIXED: ANES 2024 PRE weight. Was incorrectly used for vote-choice analysis in build_voter_maps_all.py;...`
- `generate_variable_audit.py:158` — `"V240107b": "✅ CODEBOOK-VERIFIED: ANES 2024 POST weight. Now used for the voter map.",`
- `build_voter_maps_all.py:220` — `# Weight: V240107b is POST weight (correct for vote-choice analysis).`
- `build_voter_maps_all.py:222` — `w = safe_num(df, "V240107b").fillna(0).clip(lower=0)`
- `build_trust_by_cohort.py:107` — `for w_col in ["V240107a", "V240107b", "V240108a"]:`
- `build_swing_trust_turnout.py:84` — `(2024, None, None, 'V240107b', 'V243002'),`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`

### `V240108a` [2024]  —  ✅ WEIGHT (variant): a 2024 weight column tried in build_within_cycle_multi.py's fallback list [V240107a, V240107b, V240108a]. Secondary; canonical analysis weights are V240107a/b.

**Observed distribution** (top values, numeric):

```
  0.0342395382183464: 1
  0.0502425621872819: 1
  0.054027577953259: 1
  0.0560263414385719: 1
  0.0580918659841704: 1
  0.0582562976253706: 1
  0.0619146376783907: 1
  0.0652695113184677: 1
  0.0660230638561348: 1
  0.0666278175070477: 1
  0.068685344756834: 1
  0.0724505664820774: 1
  0.0749353162857788: 1
  0.075564567463553: 1
  0.077846596076049: 1
  0.0788981108860405: 1
  0.0806592563098187: 1
  0.0817075959198923: 1
  0.0817422664656291: 1
  0.0829765790028135: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:145` — `"V240108a": "✅ WEIGHT (variant): a 2024 weight column tried in build_within_cycle_multi.py's fallback list [V240107a, V240107b,...`
- `generate_variable_audit.py:145` — `"V240108a": "✅ WEIGHT (variant): a 2024 weight column tried in build_within_cycle_multi.py's fallback list [V240107a, V240107b,...`
- `build_trust_by_cohort.py:107` — `for w_col in ["V240107a", "V240107b", "V240108a"]:`

### `V241035` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 PRE: 'Have you already voted?' 1=have voted (early voter), 2=have not voted. Used in combined 2024 turnout binary.

**Observed distribution** (top values, numeric):

```
          -9: 1
          -8: 1
          -1: 245
           1: 288
           2: 4986
```

**Usage sites (12)**:

- `generate_variable_audit.py:66` — `"V242065": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 POST: 'Did R vote in 2024?'. Codes 1=did not vote, 2=thought about but didn't...`
- `generate_variable_audit.py:66` — `"V242065": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 POST: 'Did R vote in 2024?'. Codes 1=did not vote, 2=thought about but didn't...`
- `generate_variable_audit.py:73` — `"V242066": "🔥 KNOWN-BUG-FIXED: Universe 'IF R REPORTED IN THE POST SURVEY THAT R VOTED'. V242066 is conditional on already-vote...`
- `generate_variable_audit.py:74` — `"V241035": "✅ CODEBOOK-VERIFIED: 2024 PRE: 'Have you already voted?' 1=have voted (early voter), 2=have not voted. Used in comb...`
- `build_voter_maps_all.py:209` — `# V241035 == 1: "Have voted" in pre-election (early voters).`
- `build_voter_maps_all.py:212` — `#   voted = (V241035 == 1)  OR  (V242065 == 4)`
- `build_voter_maps_all.py:213` — `#   not_voted = (V242065 in {1,2,3}) AND NOT (V241035 == 1)`
- `build_voter_maps_all.py:214` — `early_voted = (safe_num(df, "V241035") == 1)`
- `build_swing_trust_turnout.py:116` — `# 2024 turnout = early-voted (PRE V241035==1) OR post "I am sure`
- `build_swing_trust_turnout.py:120` — `early = pd.to_numeric(df['V241035'], errors='coerce') == 1`
- `build_swing_trust_turnout.py:163` — `'voter-validated vote==1; 2024: early-voted V241035==1 OR post '`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`

### `V241049` [2024]  —  🔥 KNOWN-BUG-FIXED: codebook label is a HYPOTHETICAL Harris-vs-Trump question, NOT '2020 turnout'. We no longer use it for prior-vote. Replaced by V241106x.

**Observed distribution** (top values, numeric):

```
          -9: 36
          -8: 9
          -4: 2
           1: 2707
           2: 2287
           3: 480
```

**Usage sites (2)**:

- `generate_variable_audit.py:65` — `"V241049": "🔥 KNOWN-BUG-FIXED: codebook label is a HYPOTHETICAL Harris-vs-Trump question, NOT '2020 turnout'. We no longer use ...`
- `build_voter_maps_all.py:191` — `#   V241049 is NOT 2020 turnout. It's a hypothetical "if Harris vs Trump`

### `V241106x` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 prior-vote recall. 1=did not vote 2020, 2=Biden, 3=Trump, 4=other.

**Observed distribution** (top values, numeric):

```
          -4: 1
          -2: 46
           1: 1155
           2: 2426
           3: 1828
           4: 65
```

**Usage sites (4)**:

- `generate_variable_audit.py:65` — `"V241049": "🔥 KNOWN-BUG-FIXED: codebook label is a HYPOTHETICAL Harris-vs-Trump question, NOT '2020 turnout'. We no longer use ...`
- `generate_variable_audit.py:99` — `"V241106x": "✅ CODEBOOK-VERIFIED: 2024 prior-vote recall. 1=did not vote 2020, 2=Biden, 3=Trump, 4=other.",`
- `build_voter_maps_all.py:193` — `#   V241106x is the actual prior-vote recall (1=did not vote 2020,`
- `build_voter_maps_all.py:195` — `p20 = safe_num(df, "V241106x")`

### `V241156` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 PRE feeling thermometer, Harris (0-100). .between(0,100).

**Observed distribution** (top values, numeric):

```
          -9: 19
          -8: 3
           0: 1426
           1: 14
           2: 5
           3: 2
           5: 44
           6: 3
           7: 1
           8: 1
           9: 2
          10: 57
          12: 3
          13: 1
          15: 412
          17: 2
          20: 30
          25: 17
          28: 1
          30: 266
```

**Usage sites (3)**:

- `generate_variable_audit.py:127` — `"V241156": "✅ CODEBOOK-VERIFIED: 2024 PRE feeling thermometer, Harris (0-100). .between(0,100).",`
- `build_within_cycle_multi.py:15` — `2024: V241156 (Harris PRE), V241157 (Trump PRE),`
- `build_within_cycle_multi.py:60` — `"dem_pre": "V241156", "rep_pre": "V241157",`

### `V241157` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 PRE feeling thermometer, Trump (0-100). .between(0,100).

**Observed distribution** (top values, numeric):

```
          -9: 12
          -8: 1
           0: 2161
           1: 13
           2: 12
           3: 2
           4: 3
           5: 31
           6: 1
           7: 2
           8: 2
           9: 1
          10: 39
          11: 2
          14: 2
          15: 309
          16: 1
          17: 1
          20: 26
          23: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:128` — `"V241157": "✅ CODEBOOK-VERIFIED: 2024 PRE feeling thermometer, Trump (0-100). .between(0,100).",`
- `build_within_cycle_multi.py:15` — `2024: V241156 (Harris PRE), V241157 (Trump PRE),`
- `build_within_cycle_multi.py:60` — `"dem_pre": "V241156", "rep_pre": "V241157",`

### `V241177` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 ideology self-placement, same 1-7 scale.

**Observed distribution** (top values, numeric):

```
          -9: 67
          -4: 3
           1: 250
           2: 819
           3: 543
           4: 1187
           5: 594
           6: 1030
           7: 309
          99: 719
```

**Usage sites (2)**:

- `generate_variable_audit.py:87` — `"V241177": "✅ CODEBOOK-VERIFIED: 2024 ideology self-placement, same 1-7 scale.",`
- `build_voter_maps_all.py:172` — `ideo = safe_num(df, "V241177").where(lambda x: x.between(1, 7))`

### `V241179` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 R places Harris on 7-pt lib-con scale (codebook quote: 'Where would you place Kamala Harris on this scale?').

**Observed distribution** (top values, numeric):

```
          -9: 100
          -8: 60
          -4: 1
           1: 1909
           2: 1657
           3: 753
           4: 685
           5: 122
           6: 126
           7: 108
```

**Usage sites (3)**:

- `generate_variable_audit.py:178` — `"V241179": "✅ CODEBOOK-VERIFIED: 2024 R places Harris on 7-pt lib-con scale (codebook quote: 'Where would you place Kamala Harr...`
- `build_voter_maps_all.py:226` — `# Perceived candidate positions: V241179/80 (ideology),`
- `build_voter_maps_all.py:228` — `dem_perc_x = (safe_num(df, "V241179").where(lambda v: v.between(1, 7)) - 4) / 3.0`

### `V241180` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 R places Trump on 7-pt lib-con scale.

**Observed distribution** (top values, numeric):

```
          -9: 123
          -8: 64
          -4: 2
           1: 259
           2: 141
           3: 108
           4: 482
           5: 595
           6: 1796
           7: 1951
```

**Usage sites (2)**:

- `generate_variable_audit.py:179` — `"V241180": "✅ CODEBOOK-VERIFIED: 2024 R places Trump on 7-pt lib-con scale.",`
- `build_voter_maps_all.py:229` — `rep_perc_x = (safe_num(df, "V241180").where(lambda v: v.between(1, 7)) - 4) / 3.0`

### `V241200` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 Dem (Harris) 'strong leadership' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 20
          -8: 24
          -1: 245
           1: 770
           2: 979
           3: 916
           4: 570
           5: 1997
```

**Usage sites (3)**:

- `generate_variable_audit.py:190` — `"V241200": "✅ CODEBOOK-VERIFIED: 2024 Dem (Harris) 'strong leadership' Likert 1-5.",`
- `build_voter_maps_all.py:227` — `# V241200+V241201 (Harris lead+cares) / V241205+V241206 (Trump lead+cares)`
- `build_voter_maps_all.py:230` — `d_lead  = (5 - safe_num(df, "V241200").where(lambda v: v.between(1, 5))) / 4.0`

### `V241201` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 Dem (Harris) 'really cares' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 16
          -8: 13
          -1: 245
           1: 924
           2: 938
           3: 881
           4: 605
           5: 1899
```

**Usage sites (3)**:

- `generate_variable_audit.py:191` — `"V241201": "✅ CODEBOOK-VERIFIED: 2024 Dem (Harris) 'really cares' Likert 1-5.",`
- `build_voter_maps_all.py:227` — `# V241200+V241201 (Harris lead+cares) / V241205+V241206 (Trump lead+cares)`
- `build_voter_maps_all.py:231` — `d_cares = (5 - safe_num(df, "V241201").where(lambda v: v.between(1, 5))) / 4.0`

### `V241203` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 Dem cand 'honest'.

**Observed distribution** (top values, numeric):

```
          -9: 25
          -8: 24
          -1: 245
           1: 755
           2: 1045
           3: 939
           4: 654
           5: 1834
```

**Usage sites (4)**:

- `generate_variable_audit.py:170` — `"V241203": "✅ CODEBOOK-VERIFIED: 2024 Dem cand 'honest'.",`
- `build_candidate_honesty_by_trust.py:269` — `# V241203 = Harris honest; V241208 = Trump honest. Verified.`
- `build_candidate_honesty_by_trust.py:270` — `hd = 5 - df['V241203'].where(df['V241203'].between(1,5))`
- `build_candidate_honesty_by_trust.py:270` — `hd = 5 - df['V241203'].where(df['V241203'].between(1,5))`

### `V241205` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 Rep (Trump) 'strong leadership' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 13
          -8: 4
          -1: 245
           1: 1249
           2: 807
           3: 627
           4: 561
           5: 2015
```

**Usage sites (3)**:

- `generate_variable_audit.py:192` — `"V241205": "✅ CODEBOOK-VERIFIED: 2024 Rep (Trump) 'strong leadership' Likert 1-5.",`
- `build_voter_maps_all.py:227` — `# V241200+V241201 (Harris lead+cares) / V241205+V241206 (Trump lead+cares)`
- `build_voter_maps_all.py:232` — `r_lead  = (5 - safe_num(df, "V241205").where(lambda v: v.between(1, 5))) / 4.0`

### `V241206` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 Rep (Trump) 'really cares' Likert 1-5.

**Observed distribution** (top values, numeric):

```
          -9: 16
          -8: 4
          -1: 245
           1: 808
           2: 687
           3: 639
           4: 463
           5: 2659
```

**Usage sites (3)**:

- `generate_variable_audit.py:193` — `"V241206": "✅ CODEBOOK-VERIFIED: 2024 Rep (Trump) 'really cares' Likert 1-5.",`
- `build_voter_maps_all.py:227` — `# V241200+V241201 (Harris lead+cares) / V241205+V241206 (Trump lead+cares)`
- `build_voter_maps_all.py:233` — `r_cares = (5 - safe_num(df, "V241206").where(lambda v: v.between(1, 5))) / 4.0`

### `V241208` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 Rep cand 'honest'.

**Observed distribution** (top values, numeric):

```
          -9: 13
          -8: 5
          -1: 245
           1: 406
           2: 654
           3: 830
           4: 500
           5: 2868
```

**Usage sites (4)**:

- `generate_variable_audit.py:171` — `"V241208": "✅ CODEBOOK-VERIFIED: 2024 Rep cand 'honest'.",`
- `build_candidate_honesty_by_trust.py:269` — `# V241203 = Harris honest; V241208 = Trump honest. Verified.`
- `build_candidate_honesty_by_trust.py:271` — `hr = 5 - df['V241208'].where(df['V241208'].between(1,5))`
- `build_candidate_honesty_by_trust.py:271` — `hr = 5 - df['V241208'].where(df['V241208'].between(1,5))`

### `V241227x` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 7-pt party summary. Same scale as V161158x/V201231x. Already mapped correctly (1,2,3→dem; 4→ind; 5,6,7→rep).

**Observed distribution** (top values, numeric):

```
          -9: 31
          -8: 5
          -4: 2
           1: 1314
           2: 616
           3: 714
           4: 380
           5: 716
           6: 577
           7: 1166
```

**Usage sites (4)**:

- `generate_variable_audit.py:100` — `"V241227x": "✅ CODEBOOK-VERIFIED: 2024 7-pt party summary. Same scale as V161158x/V201231x. Already mapped correctly (1,2,3→dem...`
- `generate_variable_audit.py:101` — `"V241228": "✅ NOT IN LIVE USE (comment only): 2024 PRE 'PARTY IDENTITY IMPORTANCE' — a split/reversed-scale identity-strength i...`
- `build_voter_maps_all.py:179` — `# V241227x is the canonical 7-pt party ID summary (1=strong D, 7=strong R, 4=ind).`
- `build_voter_maps_all.py:180` — `pty = safe_num(df, "V241227x")`

### `V241228` [2024]  —  ✅ NOT IN LIVE USE (comment only): 2024 PRE 'PARTY IDENTITY IMPORTANCE' — a split/reversed-scale identity-strength item (large -1 Inapplicable bucket), NOT a party-direction variable. Party assignment uses V241227x; V241228 appears only in a code comment in build_voter_maps_all.py documenting that replacement.

**Observed distribution** (top values, numeric):

```
          -9: 4
          -1: 452
           1: 659
           2: 1104
           3: 1362
           4: 765
           5: 1175
```

**Usage sites (3)**:

- `generate_variable_audit.py:101` — `"V241228": "✅ NOT IN LIVE USE (comment only): 2024 PRE 'PARTY IDENTITY IMPORTANCE' — a split/reversed-scale identity-strength i...`
- `generate_variable_audit.py:101` — `"V241228": "✅ NOT IN LIVE USE (comment only): 2024 PRE 'PARTY IDENTITY IMPORTANCE' — a split/reversed-scale identity-strength i...`
- `build_voter_maps_all.py:178` — `# FIXED: V241228 is a single-item party question with non-standard codes.`

### `V241229` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 analog of V161215 (gov-officials do right).

**Observed distribution** (top values, numeric):

```
          -9: 17
          -8: 6
           1: 64
           2: 781
           3: 1510
           4: 2303
           5: 840
```

**Usage sites (9)**:

- `generate_variable_audit.py:94` — `"V241229": "✅ CODEBOOK-VERIFIED: 2024 analog of V161215 (gov-officials do right).",`
- `build_candidate_honesty_by_trust.py:265` — `do_right = df['V241229'].where(df['V241229'].between(1,5))`
- `build_candidate_honesty_by_trust.py:265` — `do_right = df['V241229'].where(df['V241229'].between(1,5))`
- `build_voter_maps_all.py:174` — `do_right = safe_num(df, "V241229").where(lambda v: v.between(1, 5))`
- `build_trust_by_cohort.py:13` — `- ANES standalone 2016 V161215, 2020 V201233, 2024 V241229: 5-pt scale`
- `build_trust_by_cohort.py:115` — `t = clean_var(d, "V241229", 1, 5)`
- `build_trust_by_cohort.py:135` — `"source": "ANES CDF 1958-2012 (VCF0604) + ANES standalone 2016/2020/2024 (V161215/V201233/V241229). Headline metric: % saying '...`
- `build_swing_trust_turnout.py:109` — `2024: ('V241229','V241231','V241232')}`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`

### `V241231` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 analog of V161216 (few interests vs all).

**Observed distribution** (top values, numeric):

```
          -9: 41
          -8: 18
          -1: 245
           1: 4331
           2: 886
```

**Usage sites (6)**:

- `generate_variable_audit.py:95` — `"V241231": "✅ CODEBOOK-VERIFIED: 2024 analog of V161216 (few interests vs all).",`
- `build_candidate_honesty_by_trust.py:266` — `run_all  = df['V241231'].where(df['V241231'].between(1,2))`
- `build_candidate_honesty_by_trust.py:266` — `run_all  = df['V241231'].where(df['V241231'].between(1,2))`
- `build_voter_maps_all.py:175` — `run_all  = safe_num(df, "V241231").where(lambda v: v.between(1, 2))`
- `build_swing_trust_turnout.py:109` — `2024: ('V241229','V241231','V241232')}`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`

### `V241232` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 analog of V161217 (tax money wasted).

**Observed distribution** (top values, numeric):

```
          -9: 15
          -8: 4
          -1: 245
           1: 3560
           2: 1549
           3: 148
```

**Usage sites (6)**:

- `generate_variable_audit.py:96` — `"V241232": "✅ CODEBOOK-VERIFIED: 2024 analog of V161217 (tax money wasted).",`
- `build_candidate_honesty_by_trust.py:267` — `waste    = df['V241232'].where(df['V241232'].between(1,3))`
- `build_candidate_honesty_by_trust.py:267` — `waste    = df['V241232'].where(df['V241232'].between(1,3))`
- `build_voter_maps_all.py:176` — `waste    = safe_num(df, "V241232").where(lambda v: v.between(1, 3))`
- `build_swing_trust_turnout.py:109` — `2024: ('V241229','V241231','V241232')}`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`

### `V241458x` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 respondent age summary. Used as age clean_var(18,100).

**Observed distribution** (top values, numeric):

```
          -2: 279
          18: 28
          19: 21
          20: 26
          21: 44
          22: 40
          23: 32
          24: 38
          25: 46
          26: 64
          27: 64
          28: 78
          29: 68
          30: 75
          31: 71
          32: 80
          33: 88
          34: 85
          35: 94
          36: 87
```

**Usage sites (2)**:

- `generate_variable_audit.py:143` — `"V241458x": "✅ CODEBOOK-VERIFIED: 2024 respondent age summary. Used as age clean_var(18,100).",`
- `build_trust_by_cohort.py:113` — `age = clean_var(d, "V241458x", 18, 100)`

### `V242065` [2024]  —  ✅ CODEBOOK-VERIFIED with CAVEAT: 2024 POST: 'Did R vote in 2024?'. Codes 1=did not vote, 2=thought about but didn't, 3=usually but didn't, 4=sure voted. Universe: 'IF R DID NOT REPORT IN THE PRE THAT R ALREADY VOTED' — so early voters (V241035==1) are EXCLUDED. Use combined V241035 ∨ V242065 for full turnout.

**Observed distribution** (top values, numeric):

```
          -9: 9
          -8: 1
          -7: 40
          -6: 517
          -1: 186
           1: 453
           2: 199
           3: 183
           4: 3933
```

**Usage sites (15)**:

- `generate_variable_audit.py:66` — `"V242065": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 POST: 'Did R vote in 2024?'. Codes 1=did not vote, 2=thought about but didn't...`
- `generate_variable_audit.py:66` — `"V242065": "✅ CODEBOOK-VERIFIED with CAVEAT: 2024 POST: 'Did R vote in 2024?'. Codes 1=did not vote, 2=thought about but didn't...`
- `generate_variable_audit.py:73` — `"V242066": "🔥 KNOWN-BUG-FIXED: Universe 'IF R REPORTED IN THE POST SURVEY THAT R VOTED'. V242066 is conditional on already-vote...`
- `build_voter_maps_all.py:205` — `# V242065 Universe: "IF R DID NOT REPORT IN THE PRE THAT R ALREADY VOTED".`
- `build_voter_maps_all.py:206` — `# So V242065 captures everyone who hadn't already early-voted. Codes`
- `build_voter_maps_all.py:212` — `#   voted = (V241035 == 1)  OR  (V242065 == 4)`
- `build_voter_maps_all.py:213` — `#   not_voted = (V242065 in {1,2,3}) AND NOT (V241035 == 1)`
- `build_voter_maps_all.py:215` — `v242065 = safe_num(df, "V242065")`
- `build_swing_trust_turnout.py:117` — `# I voted" (V242065==4). V242065's universe EXCLUDES PRE early`
- `build_swing_trust_turnout.py:117` — `# I voted" (V242065==4). V242065's universe EXCLUDES PRE early`
- `build_swing_trust_turnout.py:119` — `# turnout fix (see CLAUDE.md: V242066/V242065 universe bug).`
- `build_swing_trust_turnout.py:121` — `postv = pd.to_numeric(df['V242065'], errors='coerce') == 4`
- `build_swing_trust_turnout.py:164` — `'V242065==4).'`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`
- `build_swing_trust_turnout.py:168` — `'2024 turnout combines early-vote (V241035==1) with post self-report (V242065==4); V242065 universe excludes PRE early voters, ...`

### `V242066` [2024]  —  🔥 KNOWN-BUG-FIXED: Universe 'IF R REPORTED IN THE POST SURVEY THAT R VOTED'. V242066 is conditional on already-voted; it asks 'did you vote for president specifically'. NOT a turnout question. Using it alone undercounts non-voters by ~95% (only 39 of 5521 code as 2). REPLACED in voter-map by combined V241035 (early voted in pre) ∨ V242065 (post-survey turnout, code 4=voted).

**Observed distribution** (top values, numeric):

```
          -7: 40
          -6: 517
          -1: 1194
           1: 3731
           2: 39
```

**Usage sites (7)**:

- `generate_variable_audit.py:73` — `"V242066": "🔥 KNOWN-BUG-FIXED: Universe 'IF R REPORTED IN THE POST SURVEY THAT R VOTED'. V242066 is conditional on already-vote...`
- `generate_variable_audit.py:73` — `"V242066": "🔥 KNOWN-BUG-FIXED: Universe 'IF R REPORTED IN THE POST SURVEY THAT R VOTED'. V242066 is conditional on already-vote...`
- `build_voter_maps_all.py:198` — `# 2024 TURNOUT — corrected 2026-06-05 after V242066-universe miss.`
- `build_voter_maps_all.py:200` — `# V242066 Universe: "IF R REPORTED IN THE POST SURVEY THAT R VOTED".`
- `build_voter_maps_all.py:201` — `# That means V242066 is asking "of voters, did you vote for PRESIDENT".`
- `build_voter_maps_all.py:203` — `# by ~95% (only 39 of 5521 respondents have V242066==2).`
- `build_swing_trust_turnout.py:119` — `# turnout fix (see CLAUDE.md: V242066/V242065 universe bug).`

### `V242067` [2024]  —  🔥 KNOWN-BUG-FIXED: codebook lists ONLY codes 1=Harris, 2=Trump, 4=West, 5=Stein, 6=other. Code 3 does NOT exist (Kennedy withdrew). Earlier code had {3:'kennedy'} — dead code, removed.

**Observed distribution** (top values, numeric):

```
          -9: 37
          -8: 1
          -7: 40
          -6: 472
          -1: 1278
           1: 2015
           2: 1588
           4: 12
           5: 25
           6: 53
```

**Usage sites (2)**:

- `generate_variable_audit.py:70` — `"V242067": "🔥 KNOWN-BUG-FIXED: codebook lists ONLY codes 1=Harris, 2=Trump, 4=West, 5=Stein, 6=other. Code 3 does NOT exist (Ke...`
- `build_voter_maps_all.py:182` — `gen = safe_num(df, "V242067")`

### `V242125` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 POST feeling thermometer, Democratic pres candidate (0-100).

**Observed distribution** (top values, numeric):

```
          -9: 71
          -7: 40
          -6: 517
          -5: 4
           0: 1157
           1: 14
           2: 6
           3: 3
           4: 2
           5: 40
           9: 1
          10: 67
          12: 2
          13: 1
          15: 400
          18: 1
          20: 36
          21: 1
          25: 27
          30: 227
```

**Usage sites (3)**:

- `generate_variable_audit.py:131` — `"V242125": "✅ CODEBOOK-VERIFIED: 2024 POST feeling thermometer, Democratic pres candidate (0-100).",`
- `build_within_cycle_multi.py:16` — `V242125 (Dem POST), V242126 (Rep POST), V240107a (weight)`
- `build_within_cycle_multi.py:61` — `"dem_post": "V242125", "rep_post": "V242126",`

### `V242126` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 POST feeling thermometer, Republican pres candidate (0-100).

**Observed distribution** (top values, numeric):

```
          -9: 71
          -7: 40
          -6: 517
          -5: 4
           0: 1764
           1: 15
           2: 10
           3: 5
           4: 1
           5: 23
           7: 4
           9: 1
          10: 65
          12: 1
          13: 1
          14: 1
          15: 282
          16: 1
          18: 1
          19: 1
```

**Usage sites (3)**:

- `generate_variable_audit.py:132` — `"V242126": "✅ CODEBOOK-VERIFIED: 2024 POST feeling thermometer, Republican pres candidate (0-100).",`
- `build_within_cycle_multi.py:16` — `V242125 (Dem POST), V242126 (Rep POST), V240107a (weight)`
- `build_within_cycle_multi.py:61` — `"dem_post": "V242125", "rep_post": "V242126",`

### `V243002` [2024]  —  ✅ CODEBOOK-VERIFIED: 2024 state code (stored as string in the .csv).

**Observed distribution** (top values, numeric):

```
         1.0: 69
         2.0: 4
         4.0: 59
         5.0: 53
         6.0: 269
         8.0: 58
         9.0: 70
        10.0: 4
        11.0: 10
        12.0: 172
        13.0: 103
        15.0: 4
        16.0: 10
        17.0: 117
        18.0: 87
        19.0: 57
        20.0: 28
        21.0: 48
        22.0: 24
        23.0: 15
```

**Usage sites (5)**:

- `generate_variable_audit.py:163` — `"V243002": "✅ CODEBOOK-VERIFIED: 2024 state code (stored as string in the .csv).",`
- `build_candidate_honesty_by_trust.py:273` — `state_str = df['V243002'].astype(str).str.strip()`
- `build_voter_maps_all.py:223` — `state_str = df["V243002"].astype(str).str.strip() if "V243002" in df.columns else pd.Series([""] * len(df))`
- `build_voter_maps_all.py:223` — `state_str = df["V243002"].astype(str).str.strip() if "V243002" in df.columns else pd.Series([""] * len(df))`
- `build_swing_trust_turnout.py:84` — `(2024, None, None, 'V240107b', 'V243002'),`

---

## Summary

- Total ANES variables in use: **103**
- With explicit audit annotation: **103**
- Marked UNVERIFIED (default): **0**

## Process for new variables

Before introducing a NEW ANES variable into any build script:
1. Read its codebook entry on disk: `data/raw/anes_codebooks/anes_<cycle>_codebook.txt` (or its slice in `data/derived/codebook_entries.txt`) — check the Label, Value Labels, AND Universe
2. Verify the value-count distribution matches the codebook
3. Add a codebook-cited annotation to `KNOWN_ANNOTATIONS` in this script
4. Re-run `python scripts/generate_variable_audit.py`
5. Commit the regenerated `reqts/variable-audit.md` with the code change