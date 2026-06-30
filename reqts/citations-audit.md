# Citations Audit — Master External-Reference List

**Branch:** claude/dazzling-maxwell-sSHUR
**Created:** 2026-06-30
**Status:** In Progress — verification dispatched to two independent threads

## Purpose

Every external (published / public) reference cited anywhere in `web/index.html` footnotes
("How We Know" blocks), enumerated for verification. Internal ANES/VSG/CDF variable methodology is
NOT listed here (it is method, not a bibliographic reference, and is checked by the data-rigor process).

Each item carries: the **citation as printed**, the **claim it backs**, and a **verification verdict**
filled in by Thread A (metadata/existence) and Thread B (claim-content).

Verdict codes: ✅ verified · ⚠️ needs-fix (metadata or claim error) · ❌ not-found / likely-hallucination ·
🕒 post-cutoff contemporary event (verify via live web only) · ❓ ambiguous.

---

## A · Academic articles & papers

| ID | Citation as printed | Backs (claim) | Block |
|----|---------------------|---------------|-------|
| R1 | Joshua Kalla & David E. Broockman (2018), "The Minimal Persuasive Effects of Campaign Contact in General Elections: Evidence from 49 Field Experiments," *American Political Science Review* 112(1): 148–166. | General-election persuasion ≈ 0; 49 field experiments | L1134 §6 |
| R2 | Andrew Gelman & Gary King (1993), "Why Are American Presidential Election Campaign Polls So Variable When Votes Are So Predictable?" *British Journal of Political Science* 23(4): 409–451. | "Discovery, not persuasion" framing | L1134 §6 |
| R3 | Michael Barber & Jeremy C. Pope (2019), "Does Party Trump Ideology? Disentangling Party and Ideology in America," *American Political Science Review* 113(1): 38–54. | In-group leader moves co-partisans against ideology | L1422 §10 |
| R4 | Diana C. Mutz (2018), "Status Threat, Not Economic Hardship, Explains the 2016 Presidential Vote," *PNAS* 115(19): E4330–E4339. | Status threat > economic hardship, 2016 | L1632 §11 |
| R5 | Alan S. Gerber, Donald P. Green & Christopher W. Larimer (2008), "Social Pressure and Voter Turnout: Evidence from a Large-Scale Field Experiment," *American Political Science Review* 102(1): 33–48. | Social-pressure mail +8pp; 2006 Michigan primary | L1766 §12 / L1925 §13 |
| R6 | Christopher J. Bryan, Gregory M. Walton, Todd Rogers & Carol S. Dweck (2011), "Motivating voter turnout by invoking the self," *PNAS* 108(31): 12653–12656. | "Be a voter" identity framing, ~11pp lift | L1925 §13 |
| R7 | David W. Nickerson & Todd Rogers (2010), "Do You Have a Voting Plan? Implementation Intentions, Voter Turnout, and Organic Plan Making," *Psychological Science* 21(2): 194–199. | Voting-plan prompt, ~4pp lift | L1925 §13 |
| R8 | Martin Gilens & Benjamin I. Page (2014), "Testing Theories of American Politics: Elites, Interest Groups, and Average Citizens," *Perspectives on Politics* 12(3): 564–581. | 1,779 policy cases 1981–2002; avg-citizen near-zero effect | L3834 §24 |
| R9 | Maxwell McCombs & Donald Shaw (1972), "The Agenda-Setting Function of Mass Media," *Public Opinion Quarterly* 36(2): 176–187. | Agenda-setting theory | L3328 §22 |
| R10 | Thomas Sowell (1960), "Marx's 'Increasing Misery' Doctrine," *American Economic Review* 50(1): 111–120. | Verelendung doctrine + contested record | L1632 §11 |
| R11 | Philip E. Tetlock (1983), "Cognitive style and political ideology," *Journal of Personality and Social Psychology* 45(1). | Integrative complexity under threat | L1632 §11 |
| R12 | Suedfeld & Tetlock (1977) [integrative complexity]. | Threat → categorical reasoning | L1632 §11 |
| R13 | Alan Abramowitz, "Forecasting in a Polarized Era: The Time for Change Model and the 2012 Presidential Election," *PS: Political Science & Politics* 45(4). | Time-for-Change model | L2571 §17 |
| R14 | Alan Abramowitz, "Will Time for Change Mean Time for Trump?," *PS: Political Science & Politics* 49(4), 2016. | 2016 forecast called Trump PV win | L2571 §17 |
| R15 | 2024 *PS* forecasting symposium (Lockerbie; Ellis & Ura). | 2024 near-tie forecasts | L2571 §17 |
| R16 | Branham, Soroka & Wlezien (2017) [Gilens-Page critique]. | Near-zero reading contested | L3834 §24 |
| R17 | Bashir (2015) [Gilens-Page critique]. | Near-zero reading contested | L3834 §24 |

## B · Books

| ID | Citation as printed | Backs | Block |
|----|---------------------|-------|-------|
| R18 | Anthony Downs, *An Economic Theory of Democracy* (1957). | Median-voter theorem | L400 §1 |
| R19 | Stanley Greenberg, *R.I.P. GOP* (2019). | Centrist-electability practitioner lit | L400 §1 |
| R20 | Sasha Issenberg, *The Victory Lab* (2012). | 9-box targeting grid | L988 §5 |
| R21 | Hal Malchow, *The New Political Targeting* (2003). | Targeting grid | L988 §5 |
| R22 | Gabriel S. Lenz, *Follow the Leader?* (2012, University of Chicago Press). | Voters adopt leader's positions | L1422 §10 |
| R23 | John Sides, Michael Tesler & Lynn Vavreck (2018), *Identity Crisis: The 2016 Presidential Campaign and the Battle for the Meaning of America* (Princeton University Press). | Status/identity 2016 | L1632 §11 |
| R24 | Michael Tesler (2016), *Post-Racial or Most-Racial? Race and Politics in the Age of Obama* (University of Chicago Press). | Race in Obama age | L1632 §11 |
| R25 | Muzafer Sherif et al. (1961), *Intergroup Conflict and Cooperation: The Robbers Cave Experiment* (University of Oklahoma). | Realistic group conflict | L1632 §11 |
| R26 | Robert LeVine & Donald Campbell (1972), *Ethnocentrism*. | Group conflict theory | L1632 §11 |
| R27 | Susan Fiske, *Envy Up, Scorn Down* (2011). | Status/scorn | L1632 §11 |
| R28 | J.D. Vance, *Hillbilly Elegy* (2016). | Qualitative twin of Mutz | L1632 §11 |
| R29 | Alan S. Gerber & Donald P. Green, *Get Out the Vote: How to Increase Voter Turnout* (4th ed., 2019, Brookings). | GOTV meta-synthesis | L1766 §12 |
| R30 | Clayton M. Christensen, *The Innovator's Dilemma: When New Technologies Cause Great Firms to Fail* (Boston: Harvard Business School Press, 1997). | Incumbent-disruption lens | L3140 §21 |
| R31 | Ludwig Wittgenstein, *Philosophical Investigations* (1953), §43: "the meaning of a word is its use in the language." | Meaning-is-use | L3834 §25 |
| R32 | Jeffrey A. Winters, *Oligarchy* (Cambridge University Press, 2011). | Wealth-defense | L3834 §24 |
| R33 | Casey Michel, *American Kleptocracy* (2021). | Offshore wealth-defense industry | L3834 §24 |
| R34 | Maxwell McCombs, *Setting the Agenda: The Mass Media and Public Opinion* (Polity, 2014). | Agenda-setting update | L3328 §22 |
| R35 | **Sasha Issenberg, *The Lie of the Land* (2017).** ⚠️ PRELIM FLAG — I cannot confirm Issenberg authored a book by this title; his known works are *The Victory Lab* (2012) and *The Engagement* (2021). Possible misattribution/hallucination. | M4A message-discipline framing | L3328 §22 |

## C · Legal cases

| ID | Citation as printed | Backs | Block |
|----|---------------------|-------|-------|
| R36 | *Trump v. Barbara*, No. 25-365 (U.S.); cert granted Dec 5, 2025; argued Apr 1, 2026; pending. | Birthright-citizenship case | L284 §0 🕒 |
| R37 | *United States v. Wong Kim Ark*, 169 U.S. 649 (1898). | Birthright precedent | L284 §0 |
| R38 | *Trump v. CASA* (2025) — universal-injunction scope only. | Distinguished from Barbara | L284 §0 🕒 |
| R39 | *Wilding v. DNC Services Corp.* — DNC neutrality class action; dismissed 2017; affirmed 11th Cir. | DNC neutrality not enforceable | L3140 §21 |

## D · Polls, surveys, datasets, government data

| ID | Citation as printed | Backs | Block |
|----|---------------------|-------|-------|
| R40 | Pew Research Center, "Americans' Dismal Views of the Nation's Politics" (Sep 19, 2023); survey Jul 10–16, 2023, n=8,480 ATP. 65% exhausted; 79% negative one-word. | Politics-exhaustion stats | L284 §0 |
| R41 | Pew Research Center, "Public Trust in Government 1958–2024." 1964 peak 77%; 2024 reading 22%. | Trust collapse curve | L284 §0 |
| R42 | CBS News poll, February 2016 — Dem primary voters rated Clinton most electable by wide margin. | 2016 electability | L2903 §19 🕒-ish |
| R43 | CNN poll (2024, post-Biden-withdrawal) — Harris MOE race; ~42% of Dem-leaners wanted a stronger nominee. | 2024 electability caveat | L2903 §19 🕒 |
| R44 | BLS Current Population Survey, U-3 unemployment, Nov each cycle: 2000 3.9 / 2004 5.4 / 2008 6.8 / 2012 7.8 / 2016 4.6 / 2020 6.7 / 2024 4.2. | Economy-not-decisive | L2321 §16 |
| R45 | Exit polls CNN/Edison/Mitofsky + pre-election Gallup, per-cycle "change/leadership" toplines (2016 39%→Trump 83-14; 2008 34%→Obama 89-9; 2024 30%→Trump 66-33; 2012 21%→Obama 81-18; 2004 Bush +20pp). | Frame-match scoreboard | L2321 §16 |
| R46 | Kaiser Family Foundation tracking poll on M4A / national health plan, 2016–2024 (topline trajectory). | Overton-shift M4A | L3328 §22 |
| R47 | Gallup, "Trump Seen Marginally as Decisive Leader, but Not Honest." | Trump honesty vs decisiveness | L3328 §22 |
| R48 | Gallup, "Americans' Views of Trump's Character Firmly Established." | Trump character | L3328 §22 |
| R49 | Gallup 2016 honesty tracking: Trump 33–36%, Clinton 32%; historical Bush ~65, Obama ~61, Bill Clinton ~46. | Honesty ratings | L3328 §22 |
| R50 | New York Times / Siena College poll, fielded Feb 9–22, 2022, n≈1,507 adults. 84% free-speech-fear serious; 69% cancel-culture; 79R/65D/64I. | Cancel-culture salience | L3584 §23 |
| R51 | YouGov poll, Nov 13–15, 2024, n=1,164 adult citizens. 57% woke played role; ~20% use terms; reported via Newsweek "Americans are shunning 'woke' words" (Nov 21, 2024). | Woke salience | L3584 §23 |
| R52 | Pew Research Center, conducted Sep 22–28, 2025, n=3,445 adults. 53% left-wing extremism major problem; 52% right; 85% violence rising. | Symmetric extremism perception | L3584 §23 🕒 |
| R53 | Navigator Research internal Democratic polling, March 2025 (battleground House sample). 69% "too PC"; 51% "elitist"; 56% "not looking out for working people." Reported via POLITICO Mar 11, 2025. | Dem-brand diagnosis | L3584 §23 🕒 |
| R54 | Democracy Matters / American Bridge 21st Century 21-state research, 2025; 3,000 working-class voters, 39 focus groups; Impact Research, GBAO, HIT Strategies. Oligarchy framing 43% vs 52%. | Working-class messaging | L3584 §23 / L3834 §25 🕒 |
| R55 | Blue Rose Research (David Shor): 94% ranked cost of living above cultural issues; "rising authoritarianism" tested unconvincing. | 2024 demobilization | L2079 §14 🕒 |
| R56 | Catalist, "What Happened in 2024" (May 2025): ~30M 2020 voters didn't return; largest drop-off since 2012. | 2024 drop-off | L2079 §14 🕒 |
| R57 | Nate Cohn / NYT: Wayne County −150K, Philadelphia −120K vs 2020. | Turnout geography | L2079 §14 🕒 |
| R58 | Working Families Party (Maurice Mitchell): "Trump won by positioning himself as a change agent." | Change-agent framing | L2079 §14 🕒 |
| R59 | Pew Research Center, May 2024: abortion 63% legal all/most; 25% all; 8% illegal all. | Abortion attitudes | L3834 §25 |
| R60 | Gallup (2024–2025): ~55% "depends"; ~69% 1st-trimester support → ~22% 3rd. | Abortion trimester | L3834 §25 |
| R61 | CDC Abortion Surveillance (2022): ~1.1% at ≥21 weeks; ~93% at ≤13 weeks. | Abortion incidence | L3834 §25 |
| R62 | Pew Research, July 2023 ATP, n=8,480: 80% donors too much influence; 73% lobbyists; 70% constituents too little. | Money-in-politics | L3834 §24 |
| R63 | Pew, February 2024: 62% reduce money's influence a top priority (65D/60R). | Money-in-politics priority | L3834 §24 |
| R64 | Pew 2024 wealth-gap: 51% "very big problem," 32% "moderately big." | Wealth gap | L3834 §24 |
| R65 | Politico, 2025: 61% say billionaires have too much political influence. | Billionaire influence | L3834 §24 🕒 |
| R66 | Data for Progress (Feb–Mar 2025): majorities ID "oligarchy" definition incl. 68% independents; 60% called U.S. oligarchic. Reported via Rolling Stone 2025. | Oligarchy comprehension | L3834 §25 🕒 |
| R67 | Mitch Landrieu's Working Class Project (reported Politico Nov 2, 2025): 43% anti-corporate vs 52% fix-economy framing. | Oligarchy framing test | L3834 §25 🕒 |
| R68 | OMB Historical Tables (Table 1.1), deficit direction by administration; % framing from A-Mark Foundation. Reagan +94 / GHWB +67 / Clinton −150 / GWB +1,204 / Obama −53 / Trump +317. | Deficit-by-party | L3834 §24 |
| R69 | KFF Health Tracking Poll, May 2024 (registered voters): Medicare 80%, Social Security 78%, Medicaid 75% favorable. | Program favorability | L3834 §26 |
| R70 | KFF 2024: Medicare drug-price negotiation 85% support. Pew April 2021: $15 min wage 62%. Pew Jan–Feb 2025: tax >$400k 58% (earlier 2024 Pew 61%). | Proposal favorability | L3834 §26 🕒 |
| R71 | Gerber-Green GOTV meta per-treatment lifts: policy ≈0; mail +0.8; phone +2.0; canvass +4.3; social-pressure +8.1. | GOTV lift table | L1766 §12 |
| R72 | U.S. Census Bureau, 2020 Diversity Index (most diverse: HI, CA, NV, MD, TX). | SC not most diverse | L3140 §21 |
| R73 | KFF: abortions "moments before birth"/"after birth" illegal & do not occur. | Abortion incidence | L3834 §25 |

## E · News & reporting (and quotes)

| ID | Citation as printed | Backs | Block |
|----|---------------------|-------|-------|
| R74 | NPR, "Trump's UFC fights bring historic spectacle to White House" (Jun 14, 2026); The Hill, "White House UFC 250: Trump, Dana White bring fight to South Lawn." | UFC White House | L284 §0 🕒 |
| R75 | Freedom250, "The Great American State Fair" (freedom250.org); CNN, "What we know about Trump's Great American State Fair" (Jun 25, 2026). | State Fair | L284 §0 🕒 |
| R76 | SCOTUSblog, *Trump v. Barbara* case page; Congressional Research Service, LSB11423. | Barbara case | L284 §0 🕒 |
| R77 | Rahm Emanuel, interview w/ John McCormick, *Wall Street Journal* (May 2025): "move to the center," "weak and woke." | Centrist practitioner | L400 §1 🕒 |
| R78 | James Carville, "woke stuff is killing us" / "too many preachy females" (e.g. *New York Times*, March 2024). | Centrist practitioner | L400 §1 |
| R79 | Third Way "Deciding to Win" / Common Sense Democrats project (2025). | Centrist practitioner | L400 §1 🕒 |
| R80 | Sean McElwee / Data for Progress memos (2019–2024). | Disaffection critique | L988 §5 |
| R81 | Steve Bannon, "flood the zone with shit," interview w/ Michael Lewis, 2018; via Media Matters "Misinformer of the Year"; CNN Business. | Flood-the-zone | L3328 §22 |
| R82 | AP, December 2007 superdelegate count Clinton ~169 to Obama ~63; NPR, "Clinton Has 45-To-1 'Superdelegate' Advantage Over Sanders" (Nov 13, 2015). | 2008 superdelegates | L3140 §21 |
| R83 | WikiLeaks DNC email release (July 2016); Wasserman Schultz resignation. | DNC emails | L3140 §21 |
| R84 | DNC voted Feb 4, 2023 to make South Carolina first (CNN; NPR); SC not Dem since 1976; R+12 (2020), R+18 (2024) (270toWin). | 2024 calendar | L3140 §21 |
| R85 | 2020 consolidation: Biden 4th IA, 5th NH, won SC Feb 29, 2020; Buttigieg (Mar 1) + Klobuchar (Mar 2) withdrew/endorsed; NBC News "hidden hand" speculation. | 2020 consolidation | L3140 §21 |
| R86 | Sasha Issenberg, *The Lie of the Land* (2017) — see R35 flag; Time, "Where The 2020 Democratic Candidates Stand On Medicare For All"; Washington Post, "Where 2020 Democrats stand on Medicare-for-all..." | M4A positions | L3328 §22 |
| R87 | Mann & Ornstein — superdelegate "peer review" / 1982 origin attribution. | Superdelegate history | L2903 §19 |
| R88 | Chuck Schumer, remarks late July 2016 (suburban-Republicans-for-blue-collar trade); via The New Republic, "The Democrats' Risky Pursuit of Suburban Republicans" (2017). | Schumer quote | L3026 §20 |
| R89 | Washington Post, "Clinton attacks Sanders on guns, but the truth is complicated" (Apr 6, 2016); The Trace, "Clinton Keeps Hammering Bernie Sanders..." (Apr 2016); TIME (Apr 2016). | PLCAA attacks | L3584 §23 |
| R90 | PLCAA = Protection of Lawful Commerce in Arms Act (signed Oct 2005); Sanders voted FOR; opposed 1993 Brady Law. | PLCAA record | L3584 §23 |
| R91 | Trump 2024 "Kamala is for they/them, President Trump is for you" ad; reportedly largest single TV spend of cycle. | Culture-war ad | L3584 §23 🕒 |
| R92 | Sen. Elissa Slotkin urged dropping "oligarchy" for "kings" (Politico 2025; MSNBC Opinion "Slotkin's fear of using 'oligarchy'" 2025). | Oligarchy word debate | L3834 §25 🕒 |
| R93 | Sanders "Fighting Oligarchy" tour drew record crowds (2025). | Oligarchy tour | L3834 §25 🕒 |
| R94 | NYC Democratic primaries Jun 23, 2026: Lander beat Goldman (NY-10); Avila Chevalier beat Espaillat (NY-13); Valdez won NY-7; DSA backing; Jeffries endorsed losers (NPR, CNBC, Axios Jun 23–24, 2026). | NYC primaries | L3834 §26 🕒 |
| R95 | "Promise to America" centrist pledge, Reps. Tom Suozzi (NY) & Adam Gray (CA); WelcomeFest; 13 signers (Newsweek: 15), June 2026. | Centrist pledge | L3834 §26 🕒 |
| R96 | The Dispatch — Democracy Matters reporting (companion to POLITICO). | Working-class research | L3584 §23 🕒 |
| R97 | the80percentbill.com — pledge campaign (bias-disclosed, not a pollster). | 80% bills | L3834 §26 🕒 |

---

## CLEANUP SWEEP (2026-06-30 — third, whole-essay adversarial pass)

A third agent re-read the FULL essay (body + footnotes) hunting for any remaining problem beyond
R1–R97. **Result: 0 hallucinations, 0 flatly-wrong facts.** All 9 prior fixes re-verified correct.
R54/R67 (oligarchy 43/52 split + Landrieu "not one person… mentioned 'oligarchy'") upgraded from
soft hedge to **confirmed** (POLITICO Nov 2025 + the Working Class Project report). Net-new quotes
spot-checked clean: Washington 1789 "experiment," Jefferson 1816 "laws and institutions," 27
amendments, Bannon, Schumer, "$81M in 24 hours," Espaillat/Avila Chevalier NY-13. **4 fixes applied,
1 flagged:**

| Item | Issue | Action |
|------|-------|--------|
| §21 *Wilding v. DNC* (body + fn 61) | Body said "the judge agreed it was a private corporation with no such obligation" — overstated the holding. Court dismissed on **standing** and **rejected** the DNC's trivialization; "back rooms/cigars" was the DNC counsel's *argument*. | Body → "dismissed for lack of standing, never reaching whether the pledge bound the party"; fn rewritten to attribute the argument to counsel, not the court. |
| §14 Biden quote | "nothing **will** fundamentally change" — misquote; actual is "would" (§18 already correct). | Fixed §14 → "would". |
| §23 fn — Molly Murphy | Verbatim quote unconfirmable (the 69% data behind it is confirmed). | Replaced verbatim quote with a paraphrase; kept the confirmed numbers + POLITICO source. |
| Coda — Krystal Ball "de facto incumbent protector" | Verbatim quote initially unsourceable. | **RESOLVED** — user supplied the source: Krystal Ball (@krystalball) X post, June 24, 2026 ("the once insurgent is now a de facto incumbent protector"). Quote is verbatim-accurate; kept as written and added to References → Reporting (`ref-rep-krystalball`). |
| §21 CNN "validating [Biden's]…" | Sweep flagged, but the string is not present in the current file. | No action (already absent). |

---

## RESOLUTION LOG (2026-06-30 — after two-thread verification + tie-breakers)

Both threads ran over R1–R97. Thread A (metadata/existence): 88 ✅ / 7 ⚠️ / 2 ❌.
Thread B (claim-content): 90 ✅ / 3 ⚠️ / 2 ❌. Disagreements + unconfirmed items were
resolved by a third (self) pass via live web search. **9 fixes applied to `web/index.html`:**

| Ref | Resolution | Fix applied |
|-----|-----------|-------------|
| R35/R86 | ❌ Both threads: *Issenberg, The Lie of the Land (2017)* is fabricated. | Deleted from §22 fn; Time + WaPo trackers retained. |
| R24 | ⚠️ Subtitle wrong. | "Age of Obama" → "Obama Era" (§11 fn + References). |
| R15 | ⚠️ Venue. | Ellis & Ura → *Social Science Quarterly* (2025); Lockerbie stays *PS* (§17 fn). |
| R51 | ⚠️ Poll conflation. | Split: 57% = Economist/YouGov Nov 9–12 (n=1,743); word-usage = Nov 13–15 (n=1,164) (§23 fn). |
| R79 | ⚠️ Publisher (self-verified: WelcomePAC, Bazelon et al.). | "Third Way's … Deciding to Win" → "WelcomePAC's … (Bazelon et al., Oct 2025)" (§1 fn). |
| R50 | ⚠️ 69% + 79/65/64 unconfirmable (both threads + self). | Replaced with verified Siena figures (46% less free vs decade ago; 34% all enjoy free speech; 55–13 R) (§23 fn). |
| R60 | ⚠️ Year/framing (self-verified: May 2023). | "(2024–2025) … 55% depends" → "(May 2023, post-Dobbs highs) … 51% legal only under certain circumstances" (§25 fn). |
| R42 | ⚠️ Date (self-verified: Oct 2015, not Feb 2016). | "February 2016 CBS" → "October 2015 CBS … (nearly six in ten)" (§19 fn). |
| R43 | ⚠️ Wrong stat (self-verified: 76% wanted Harris). | Cut "42% wanted someone else"; kept MOE race "(Harris 46, Trump 49)" (§19 fn). |
| R87 | ✅ Confirmed correct (self-verified). | No change. Mann & Ornstein, "Delegates of Steel," Brookings 2008 — uses "peer review" + electability. Citation strengthened with title/date. |

**Remaining low-risk hedges (no fix needed, essay already hedges):** R54/R67 oligarchy 43/52
split lives in a non-public report PDF; essay flags the establishment lean and calls it "not
definitive." R36 *Trump v. Barbara* "pending" was correct at writing (decided June 30, 2026).

New consolidated **References** section added at essay bottom (`#references`), grouped + anchored,
incl. a Data sources subsection. All entries reflect the corrected metadata above.

---

## Preliminary flags (mine, pre-verification)

1. **R35 / R86 — Issenberg, *The Lie of the Land* (2017):** Strongest hallucination suspect. Verify
   the title/author/year; if wrong, identify the correct source or remove.
2. **Many 🕒 items are post-knowledge-cutoff (2025–2026) contemporary events.** These are the author's
   own contemporary reporting. Verification threads should confirm via *live web search* and flag only
   genuine contradictions — NOT "correct" them from stale training data.
3. **R10 Sowell AER 1960 page range (111–120)** — confirm exact pages.
4. **R45 exit-poll toplines** — each per-cycle number needs a confirmable exit-poll/Gallup source.
5. **R87 Mann & Ornstein superdelegate "1982 / peer review"** — confirm which work makes this claim.
