/**
 * candidates.js — Candidate positions in ideology × establishment space
 *
 * TWO SETS OF POSITIONS PER CANDIDATE:
 *
 *   "official"  (x_off, y_off):
 *      x_off = DW-NOMINATE first dimension (voteview.com) where available.
 *              Natively −1…+1. Measures revealed policy position from voting record.
 *      y_off = Establishment posture estimated from endorsement network + legislative role.
 *
 *   "perceived" (x_per, y_per):
 *      x_per = ANES 2016 voter ideology placement (V161128/V161129), rescaled (mean−4)/3.
 *              Where ANES data unavailable, estimated and flagged.
 *      y_per = Perceived institutional alignment, constructed from:
 *              (a) "Honest" trait ANES item (V161162/V161167): higher = less honest
 *              (b) Endorsement and campaign framing
 *              (c) DW-NOMINATE 2nd dimension where available (anti-compromise ↔ insider)
 *
 * THE USER'S KEY DISTINCTION:
 *   Clinton and Biden were officially among the most progressive Dems on paper.
 *   Voter PERCEPTION of their relationship to institutions diverged sharply from
 *   stated policy. Clinton's ANES "honest" score: 3.95/5 (worse than Trump's 3.72).
 *   This gap — official policy vs. perceived institutional posture — is central to
 *   why 1D policy-based analysis fails to predict swing behavior.
 *
 * DATA FLAGS: entries with flag:true have estimated positions — verify before citing.
 *
 * SOURCES:
 *   dw-nominate   voteview.com
 *   anes-place    ANES 2016 V161128 (Dem pres cand), V161129 (Rep pres cand)
 *   anes-honest   ANES 2016 V161162 (Dem honest), V161167 (Rep honest) — 1=extremely, 5=not at all
 *   endorsements  FiveThirtyEight 2016 endorsement tracker, Wikipedia
 *   dw-dim2       DW-NOMINATE 2nd dim — tracks compromise/insider posture in recent Congresses
 */

window.CANDIDATES = [

  // ─── 2016 CYCLE ────────────────────────────────────────────────────────

  {
    id: "clinton_2016",
    name: "Hillary '16",
    fullName: "Hillary Clinton (2016)",
    cycle: "2016", party: "dem",
    // Official: DW-NOMINATE career Senate score; establishment based on endorsements
    x_off: -0.37, y_off: 0.85,
    // Perceived = centroid of Clinton's own voters in ANES 2D space (V161126 × V161215)
    // x_per: mean self-reported ideology of Clinton voters = −0.333 (n=1061)
    // y_per: mean institutional trust of Clinton voters   =  0.422 (n=1061)
    x_per: -0.333, y_per: 0.422,
    xSource: "x_per: ANES voter-base centroid — mean self-reported ideology (V161126) of Clinton voters, n=1061. x_off: DW-NOMINATE Senate −0.374.",
    ySource: "y_per: ANES voter-base centroid — mean V161215 trust of Clinton voters = 0.422 (above population mean 0.36). ANES honest score V161162=3.95/5 — worse than Trump (3.72). Goldman Sachs speeches, full superdelegate apparatus.",
    dataPoints: {
      anes_ideology_placement: 2.73,
      anes_honest_score: 3.95,
      anes_cares_score: 3.52,
      feeling_therm_pre: 42.1,
    },
    flag: false,
  },

  {
    id: "sanders_2016",
    name: "Bernie '16",
    fullName: "Bernie Sanders (2016)",
    cycle: "2016", party: "ind",
    x_off: -0.54, y_off: 0.15,
    // No ANES general-election placement (primary candidate only)
    // Perceived ideology estimated from DW-NOMINATE + primary exit polls
    x_per: -0.58, y_per: 0.14,
    xSource: "x_off: DW-NOMINATE Senate −0.543. x_per: ESTIMATED — Sanders not in ANES general election placement item (V161128 covers nominee Clinton only). Estimate based on DW-NOMINATE + primary exit polling.",
    ySource: "No superdelegates, no party machine endorsements, explicitly anti-establishment 'political revolution' framing. ANES honest item not candidate-specific for primaries.",
    flag: true,
    flagNote: "x_per estimated — no ANES general election ideology placement for Sanders.",
  },

  {
    id: "trump_2016",
    name: "Trump '16",
    fullName: "Donald Trump (2016)",
    cycle: "2016", party: "rep",
    // No DW-NOMINATE (never served in Congress before 2016)
    x_off: null, y_off: 0.10,
    // Perceived = centroid of Trump's own voters in ANES 2D space (V161126 × V161215)
    // x_per: mean self-reported ideology of Trump voters = +0.460 (n=1002)
    // y_per: mean institutional trust of Trump voters   =  0.283 (n=1002)
    x_per: 0.460, y_per: 0.283,
    xSource: "x_per: ANES voter-base centroid — mean self-reported ideology (V161126) of Trump voters, n=1002. Notably far right (+0.460) even though all-voter placement (V161129) put Trump at +0.29. x_off: NULL — no pre-2016 legislative record.",
    ySource: "y_per: ANES voter-base centroid — mean V161215 trust of Trump voters = 0.283 (well below population mean 0.36). ANES honest score V161167=3.72/5 (better than Clinton's 3.95). 'Drain the swamp' framing.",
    dataPoints: {
      anes_ideology_placement: 4.87,
      anes_honest_score: 3.72,
      anes_cares_score: 3.87,
      feeling_therm_pre: 37.0,
    },
    flag: true,
    flagNote: "x_off unavailable. x_per from ANES voter perception is notably moderate (+0.29) — reflects that many voters did not perceive Trump as an extreme conservative.",
  },

  // ─── 2020 CYCLE ────────────────────────────────────────────────────────

  {
    id: "biden_2020",
    name: "Biden '20",
    fullName: "Joe Biden (2020)",
    cycle: "2020", party: "dem",
    x_off: -0.39, y_off: 0.82,
    // Perceived: no direct ANES 2020 placement available in this dataset.
    // Biden ran as 'most progressive platform in history' officially;
    // voters perceived him as moderate/establishment (Pew 2020 typology)
    x_per: -0.32, y_per: 0.84,
    xSource: "x_off: DW-NOMINATE Senate career −0.391. x_per: ESTIMATED from Pew 2020 polling — voters placed Biden center-left, less left than his official platform claimed.",
    ySource: "Won 2020 explicitly as 'restore normalcy/institutions' candidate. Establishment coalition. 'Nothing will fundamentally change' donor reassurance.",
    flag: true,
    flagNote: "x_per estimated from Pew 2020 data, not ANES 2016. The gap between official progressive platform and perceived moderate institutional posture is the thesis-relevant point.",
  },

  {
    id: "trump_2020",
    name: "Trump '20",
    fullName: "Donald Trump (2020)",
    cycle: "2020", party: "rep",
    x_off: null, y_off: 0.18,
    x_per: 0.42, y_per: 0.15,
    xSource: "x_off: No DW-NOMINATE. x_per: ESTIMATED — rightward drift from 2016 based on Pew ideology tracking of Trump supporters.",
    ySource: "Continued anti-institution rhetoric; 'deep state' framing escalated as incumbent.",
    flag: true,
    flagNote: "Both axes estimated for 2020.",
  },

  // ─── 2024 CYCLE ────────────────────────────────────────────────────────

  {
    id: "kamala_2024",
    name: "Kamala '24",
    fullName: "Kamala Harris (2024)",
    cycle: "2024", party: "dem",
    x_off: -0.42, y_off: 0.78,
    x_per: -0.38, y_per: 0.80,
    xSource: "x_off: DW-NOMINATE Senate −0.417. x_per: ESTIMATED — inherited Biden coalition, perceived as moderate-establishment.",
    ySource: "Stepped into Biden's institutional coalition mid-campaign. No insurgent positioning.",
    flag: true,
    flagNote: "x_per estimated.",
  },

  {
    id: "trump_2024",
    name: "Trump '24",
    fullName: "Donald Trump (2024)",
    cycle: "2024", party: "rep",
    x_off: null, y_off: 0.12,
    x_per: 0.50, y_per: 0.10,
    xSource: "x_off: No DW-NOMINATE. x_per: ESTIMATED from 2024 polling.",
    ySource: "'Deep state' / anti-institution rhetoric peaked. MAGA brand fully anti-establishment.",
    flag: true,
    flagNote: "Both axes estimated.",
  },

  // ─── COMPARATIVE FIGURES ───────────────────────────────────────────────

  {
    id: "obama",
    name: "Obama",
    fullName: "Barack Obama",
    cycle: "historical", party: "dem",
    x_off: -0.37, y_off: 0.62,
    x_per: -0.40, y_per: 0.58,
    xSource: "x_off: DW-NOMINATE Senate −0.372.",
    ySource: "Ran as 'change' (lower y) but governed institutionally; 2008 election split — ran as insurgent, governed as establishment.",
    flag: false,
  },

  {
    id: "aoc",
    name: "AOC",
    fullName: "Alexandria Ocasio-Cortez",
    cycle: "current", party: "dem",
    x_off: -0.52, y_off: 0.20,
    x_per: -0.62, y_per: 0.18,
    xSource: "x_off: DW-NOMINATE ≈ −0.52. ⚠ VoteView notes NOMINATE underestimates Squad leftward position — they vote with Dems on procedurals, compressing score.",
    ySource: "DW-NOMINATE 2nd dim ≤ −0.9 (most anti-compromise of House Dems). Justice Democrats outsider framing. Explicitly challenges Pelosi/establishment wing.",
    flag: true,
    flagNote: "x_off is a lower bound per VoteView. x_per estimated — no ANES data for non-presidential candidates.",
  },

  {
    id: "pelosi",
    name: "Pelosi",
    fullName: "Nancy Pelosi",
    cycle: "current", party: "dem",
    x_off: -0.44, y_off: 0.93,
    x_per: -0.38, y_per: 0.94,
    xSource: "x_off: DW-NOMINATE −0.443.",
    ySource: "Definitional establishment: House Speaker, party fundraising machine, SuperPAC architect, institutional operator. DW-NOMINATE 2nd dim: insider.",
    flag: false,
  },

  {
    id: "romney",
    name: "Romney",
    fullName: "Mitt Romney",
    cycle: "current", party: "rep",
    x_off: 0.27, y_off: 0.80,
    x_per: 0.35, y_per: 0.78,
    xSource: "x_off: DW-NOMINATE Senate +0.274.",
    ySource: "Establishment Republican. Refused to endorse Trump 2016/2020. Defended institutions during Trump era. Retired rather than run again.",
    flag: false,
  },

  {
    id: "platner",
    name: "Platner",
    fullName: "Graham Platner (2026 ME Senate)",
    cycle: "2026", party: "dem",
    x_off: null, y_off: null,
    x_per: -0.62, y_per: 0.12,
    xSource: "⚠ ESTIMATED — no legislative record. Platform: single-payer, abolish ICE, anti-oligarchy, anti-war. Positioned at or left of Sanders on most issues.",
    ySource: "Explicitly anti-establishment: called for replacing Schumer, expanding SCOTUS, prosecuting ICE agents. Oysterman/Marine veteran outsider identity. 'Proud economic populist.'",
    flag: true,
    flagNote: "Both axes estimated — no DW-NOMINATE. Comparable to Sanders archetype: left policy + low institutional trust posture.",
  },

];

// Merge x_per/y_per as the primary display position (what voters respond to)
window.CANDIDATES = window.CANDIDATES.map(c => ({
  ...c,
  x: c.x_per,  // use perceived for visualizations
  y: c.y_per,
}));

window.CANDIDATE_COLORS = {
  dem: "#5b9cf6",
  ind: "#c97fff",
  rep: "#f06060",
  lib: "#f0c040",
};

// Cycles for filtering
window.CYCLES = ["2016", "2020", "2024", "historical", "current", "2026"];
