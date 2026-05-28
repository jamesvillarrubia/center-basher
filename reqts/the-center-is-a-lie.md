# The Center Is a Lie

**Working thesis:** "Moderatism" and its electability argument — the claim that moving to the
center wins elections, used to undercut progressives — is a lie. In a historically low-trust era,
the decisive axis is **institutional trust**, not left–right; and the things that actually win
(turnout, authenticity, who's on the ballot) are largely **pre-baked and orthogonal to policy
position.**

**Status:** DRAFT. 2016 evidence below is computed from ANES 2016 (weighted). Cross-cycle
validation (§9) is pending a second ANES file — see DATA NEEDS.

---

## 1. We live in a historically low-trust era
Public trust in the federal government to "do what is right just about always / most of the time":
- **1958: 73%** → **1964 peak: 77%** → **2015: 19%** (3% "always" + 16% "most"). Below 30% in every major poll since **July 2007** — the longest such stretch in 50+ years. *(Pew Research Center, "Beyond Distrust," 2015.)*
- Our ANES 3-item systemic-trust index has population **mean 0.22, median 0.17** on 0–1 — i.e. ≈ Pew's 19%. (V161215 *is* the Pew item.)
- **Party-of-president pattern:** trust is higher for the in-party. Republican trust averaged **47% under Bush → 13% under Obama** (lowest ever); Democrats ~29% under Obama. *(Pew.)* This is why a 2016 (Obama-era) cross-section conflates "low trust" with "Republican" — a confound we net out below.

## 2. The center is a lie (frequency table)
Joint distribution of the 2016 electorate, ideology × institutional trust (weighted % of all voters, ANES 2016, n=3,301):

| trust ＼ ideology | Left | Center | Right | **row** |
|---|---|---|---|---|
| High (≥0.40) | 4 | 11 | 2 | **18%** |
| Mid (0.20–0.40) | 5 | 10 | 2 | **17%** |
| **Low (<0.20)** | 10 | **34** | 22 | **66%** |
| **col** | **19** | **55** | **26** | |

- The center is **not empty — it's the largest bloc (55% moderate).**
- But **66% of the whole electorate is low-trust**, and **62% of moderates are low-trust.**
- The "comfortable moderate" the electability argument targets — **Center × High-trust — is only 11%.**
- **Takeaway:** the center exists, but it is *disaffected*, not the trusting moderate the pitch assumes. Moderating policy to court "the center" misreads who the center is.

## 3. Two different jobs: who you pick vs. whether you show up
Predicting the 2016 vote with ideology + trust (weighted logistic, standardized |β·SD|):

| outcome | ideology | trust |
|---|---|---|
| **Choice** P(Trump), head-to-head | **2.30** | 0.62 |
| **Turnout** (vote-validated vs L2 file) | **0.03** | 0.02 |

Ideology powerfully predicts *choice* and is a **zero** predictor of *turnout*. Trust is small for both. So choice and turnout are different problems with different drivers.

## 4. Turnout is not a policy lever (causal)
What actually moves turnout, from randomized field experiments (Gerber & Green, *Get Out the Vote* meta-analyses) — percentage-point lift among treated:

| lever | Δ turnout |
|---|---|
| Policy / persuasion message content | **≈ 0** |
| Standard GOTV mail | +0.8 |
| Volunteer phone | +2.0 |
| Door-to-door canvassing | +4.3 |
| Social-pressure "neighbors" mail | +8.1 |

Every lever that works is **contact / social pressure**, not message content. In ANES, turnout's strongest correlate is **"care who wins"** (std 0.46; turnout 81% "care a good deal" vs 48% "don't") and campaign interest (very 79% vs not-much 54%) — but once "care," candidate affect, age and education are in the model, **campaign interest's own effect collapses to ≈0.04**: engagement is a *marker* of candidate-driven caring, not an independent lever. Turnout is a **mobilization/affect** problem, not a positioning one.

## 5. Position sorts choice; shifting it does not
- A candidate's **ideological position sorts voters** (discovery of a prior). But **shifting** position to persuade in a general election moves ~nobody: **Kalla & Broockman (2018, APSR, 49 field experiments)** find the best estimate of campaign contact + advertising on candidate choice in general elections is **zero** (persuasion bites only for *unknown* candidates / *early*, and decays).
- **Gelman & King (1993):** campaigns are "enlightenment" — they inform voters until polls converge to the fundamentals, i.e. **discovery, not persuasion.**
- **Scaling it:** the candidate's trust position is associated with a **~22-pt** swing in their reachable coalition's vote (§7-adjacent), while what the campaign *does* after moves choice ≈0. **The election is decided at the nomination, by priors — not by what the nominee does after.**
- **Honest caveat:** cross-sectionally, ideology still *sorts* choice even among persuadables (ideo/trust ≈ 2.8× for leaners; trust *beats* ideology only for **pure independents**, 0.8×). The trust story is era-level + turnout + authenticity + marginal defectors — **not** a cross-sectional claim that trust replaces left–right for choice.

## 6. Authenticity is relational (the crossover)
Perceived candidate traits by voter institutional trust (ANES 2016; 0–4, higher = trait fits better):

| voter trust | Clinton honest | Trump honest | Clinton cares | Trump cares |
|---|---|---|---|---|
| Low (<0.15) | 0.54 | **1.58** | 0.88 | **1.44** |
| Mid | 1.18 | 1.16 | 1.69 | 1.06 |
| High (≥0.30) | **1.77** | 0.93 | **2.19** | 0.70 |

The same two candidates **flip** from authentic to fake depending on where the voter sits. Correlation of trust with "sees Trump as more authentic than Clinton" = **−0.37** (honesty and caring), surviving an ideology control (trust β −0.48 to −0.54). **Authenticity is conferred by institutional proximity — not a trait you can manufacture.** *(Caveat: partly motivated reasoning — which is consistent with "relational/conferred," not refuting it.)* In a full vote model, **"cares about people like me" is the strongest proximate predictor (+0.14 > ideology +0.09) and absorbs trust to ≈0.**

## 7. Plank-stealing is asymmetric → left–right is moot
- **Barber & Pope (2019, APSR, "Does Party Trump Ideology?"):** Republicans adopted whatever position they were told **Trump** held — *even the liberal one* — against their own stated ideology. Position-shifting is "free" for an authentic/aligned figure.
- **Lenz (2012, *Follow the Leader?*):** voters adopt their preferred leader's positions, not vice versa.
- **ANES honesty gap:** voters rated **Trump more honest (3.72) than Clinton (3.95 = "not honest")** despite his record — authenticity ≠ accuracy. The establishment figure has no authenticity credit to spend, so *her* plank-steals read disingenuous; the aligned figure's redefine the party.

## 8. 2016 was decided by consolidation, not the center
- **Sanders → Trump defection** (CES 2016, vote-validated; reproduces Schaffner's national 12%) exceeded Trump's deciding margin in **every** decisive state: WI ~61k (**2.7×**), MI ~56k (**5.3×**), PA ~131k (**3.0×**); plus ~30% of Sanders primary voters didn't vote at all. The defectors were **near-centrist on ideology** — they moved on **trust**, not policy.
- Bounded claim — not "Bernie would have won." The defensible point is the **arithmetic of consolidation.**

## 9. Cross-cycle validation — PENDING DATA
To refute "that was just 2016 / pre-Trust / a decade ago," replicate §2–§6 in ≥1 other cycle. **Needs a second ANES file (see DATA NEEDS).** Predictions to test:
- Trust-collapse + the low-trust center hold in 2008/2012/2020.
- The authenticity crossover replicates (low-trust voters find the outsider authentic).
- Turnout ⊥ ideology holds.
- Party-of-president flips the partisan trust gap (GOP higher under Trump 2020 — a clean confound check).

---

## PROPOSED VISUALIZATION WALKTHROUGH
0. Trust collapse time-series (77%→19%) — *the era.*
1. The line (conventional view).
2. Add the institutional axis — **the center-is-a-lie heatmap/frequency** (huge low-trust center; tiny trusting-moderate corner).
3–4. Trust sorts candidates; coalitions move on trust.
5. The contestable ground + the 9-box playbook (misses trust).
6–7. Two jobs; turnout = contact not policy (GOTV bars).
8. Position sorts, shifting ≈0 (nominee-vs-campaign scaling).
9. **Authenticity crossover** (flips across the trust axis).
10. Plank-stealing asymmetry (Barber-Pope + honesty gap).
11. Political gravity (mass low, candidates orbit high; dot size = visibility).
12. High-trust limit + signals; two-strategies matrix.
13. Consolidation arithmetic + reverse counterfactual.
14. Prescription across cycles (multi-year); closing: horizontal answer to a vertical problem.

## DATA NEEDS (to download)
- **ANES Time Series Cumulative Data File (1948–2020)** — *highest value:* one file, trust items (VCF0604) + ideology + party + vote across all cycles → trust collapse + trust-vote across decades + party-of-president check. *(Gated: free login at electionstudies.org.)*
- **ANES 2020 Time Series** — has candidate **trait** items → replicate the authenticity crossover (§6) and the 2020 confound flip. *(Gated.)*
- *(Public, no login, optional):* **GSS 1972–2022** (confidence-in-institutions time series) for an independent trust-collapse cross-check; **CES** other years (vote + ideology, large n).

## CITATIONS
- Pew Research Center (2015). *Beyond Distrust: How Americans View Their Government.*
- Kalla, J. L., & Broockman, D. E. (2018). The Minimal Persuasive Effects of Campaign Contact in General Elections. *APSR* 112(1), 148–166.
- Gerber, A. S., & Green, D. P. (2019). *Get Out the Vote* (3rd ed.); Gerber, Green & Larimer (2008), *APSR* (social pressure).
- Gelman, A., & King, G. (1993). Why Are American Presidential Election Campaign Polls So Variable…? *BJPS* 23(4).
- Lenz, G. S. (2012). *Follow the Leader?* Univ. of Chicago Press.
- Barber, M., & Pope, J. C. (2019). Does Party Trump Ideology? *APSR* 113(1), 38–54.
- Schaffner, B. (CCES 2016) via NPR (Sanders→Trump 12%).
- Enders & Uscinski (2021). Primary Distrust. *PS: Political Science & Politics.*
- Hetherington (2005). *Why Trust Matters.* Mutz (2018), *PNAS* (status threat).
- ANES 2016 Time Series; ANES 2016 Vote Validation; CES 2016 (vote-validated).
