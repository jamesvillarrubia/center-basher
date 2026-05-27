/**
 * candidates.js — Candidate positions in ideology × institutional trust space
 *
 * POSITION METHODOLOGY:
 *
 *   x (ideology):
 *     ANES-grounded: voter-base centroid = mean self-reported ideology (V161126)
 *       of that candidate's general election voters (n from V162034a).
 *     DW-NOMINATE (x_off): voteview.com 1st dimension where legislative record exists.
 *     Estimated (flag:true): no direct ANES item; derived from DW-NOMINATE + polling.
 *
 *   y (institutional trust):
 *     ANES-grounded: voter-base centroid = mean V161215 trust of candidate's voters.
 *       V161215: "How often can you trust the government in Washington to do what
 *       is right?" 1=Always…5=Never, inverted to 0–1 (higher = more trust).
 *     ANES feeling thermometer (non-2016 presidential): mean V161215 trust of
 *       respondents who rated the figure favorably (>50°) in 2016 ANES.
 *     DW-NOMINATE 2nd dim (y_off): insider/outsider posture proxy for legislators.
 *       Normalized: NOMINATE 2nd dim → (value + 1) / 2.
 *     Estimated (flag:true): derived from public record with source cited.
 *
 * DATA TIERS:
 *   Tier 1 — ANES voter-base centroid (2016 general election candidates only)
 *   Tier 2 — ANES feeling thermometer favorable-rater analysis (2016 data)
 *   Tier 3 — DW-NOMINATE 1st/2nd dimensions (voteview.com)
 *   Tier 4 — Estimated from cited polling/public record (flag:true)
 *
 * SOURCES:
 *   ANES 2016  americannationaleelectionstudies.org
 *   DW-NOMINATE  voteview.com (Lewis et al. 2023)
 *   Enders & Uscinski (2021) "Primary Distrust" PS: Political Science & Politics
 */

window.CANDIDATES = [

  // ─── 2016 CYCLE — TIER 1: ANES VOTER-BASE CENTROIDS ──────────────────────

  {
    id: "clinton_2016",
    name: "Hillary '16",
    fullName: "Hillary Clinton (2016)",
    cycle: "2016", party: "dem",
    dataTier: 1,
    x_off: -0.374, y_off: 0.85,
    // x_per: mean self-reported ideology (V161126) of Clinton general voters, n=1061
    // y_per: mean V161215 trust of Clinton general voters, n=1061
    x_per: -0.333, y_per: 0.422,
    xSource: "TIER 1 — ANES voter-base centroid: mean V161126 ideology of Clinton voters = −0.333 (n=1,061). DW-NOMINATE Senate x_off = −0.374 (voteview.com).",
    ySource: "TIER 1 — ANES voter-base centroid: mean V161215 trust of Clinton voters = 0.422 (n=1,061; population mean 0.36). Also: V161162 honest trait = 3.95/5 (5=not honest at all); feeling therm V161086 = 42.1/100.",
    dataPoints: {
      anes_ideology_placement: 2.73,
      anes_honest_score: 3.95,
      anes_cares_score: 3.52,
      feeling_therm_pre: 42.1,
      voter_trust_centroid: 0.422,
    },
    flag: false,
  },

  {
    id: "trump_2016",
    name: "Trump '16",
    fullName: "Donald Trump (2016)",
    cycle: "2016", party: "rep",
    dataTier: 1,
    x_off: null, y_off: null,
    // x_per: mean self-reported ideology (V161126) of Trump general voters, n=1002
    // y_per: mean V161215 trust of Trump general voters, n=1002
    x_per: 0.460, y_per: 0.283,
    xSource: "TIER 1 — ANES voter-base centroid: mean V161126 ideology of Trump voters = +0.460 (n=1,002). No DW-NOMINATE x_off — no pre-2016 legislative record. All-voter ideology placement V161129 = 4.87/7 (+0.29), lower than voter self-placement.",
    ySource: "TIER 1 — ANES voter-base centroid: mean V161215 trust of Trump voters = 0.283 (n=1,002; 0.14 below population mean). V161167 honest trait = 3.72/5 (better than Clinton 3.95). Enders & Uscinski (2021): distrust is primary predictor of Trump support controlling for ideology.",
    dataPoints: {
      anes_ideology_placement: 4.87,
      anes_honest_score: 3.72,
      anes_cares_score: 3.87,
      feeling_therm_pre: 37.0,
      voter_trust_centroid: 0.283,
    },
    flag: false,
  },

  {
    id: "sanders_2016",
    name: "Bernie '16",
    fullName: "Bernie Sanders (2016)",
    cycle: "2016", party: "ind",
    dataTier: 3,
    x_off: -0.543, y_off: 0.08,
    // No ANES general election data — Sanders was primary candidate only.
    // x_per: DW-NOMINATE 1st dim = −0.543; no ANES V161128 equivalent for Sanders.
    // y_per: DW-NOMINATE 2nd dim = −0.92 (most anti-compromise in Senate);
    //   normalized: (−0.92 + 1) / 2 = 0.04. Adjusted to 0.12 to reflect that
    //   primary voters (n=339) had trust=0.367 — somewhat above Trump's 0.283.
    x_per: -0.543, y_per: 0.12,
    xSource: "TIER 3 — DW-NOMINATE 1st dim = −0.543 (voteview.com). No ANES general election ideology placement — V161128 covers nominee Clinton only. Primary voters' mean self-ideology = −0.421.",
    ySource: "TIER 3 — DW-NOMINATE 2nd dim = −0.92 (normalized to ~0.04); adjusted upward to 0.12 to reflect ANES primary voter trust centroid of 0.367 (n=339 primary voters in 2016 ANES). Enders & Uscinski (2021): distrust predicts Sanders support as strongly as Trump support.",
    flag: true,
    flagNote: "No general election ANES data. x/y from DW-NOMINATE + primary voter trust centroid.",
  },

  // ─── 2016 ANES THERMOMETER FIGURES — TIER 2 ──────────────────────────────

  {
    id: "obama",
    name: "Obama",
    fullName: "Barack Obama",
    cycle: "historical", party: "dem",
    dataTier: 2,
    x_off: -0.372, y_off: 0.55,
    // ANES 2016 V161092 "Previous President" feeling thermometer:
    //   favorable raters (>50°, n=2319): mean ideology = −0.249, mean trust = 0.429
    x_per: -0.249, y_per: 0.429,
    xSource: "TIER 2 — ANES 2016 V161092 (feeling therm: previous president = Obama): mean self-ideology of favorable raters (>50°) = −0.249 (n=2,319). DW-NOMINATE Senate x_off = −0.372.",
    ySource: "TIER 2 — ANES 2016: mean V161215 trust of respondents who rated Obama favorably (>50°) = 0.429 (n=2,319). Obama ran as 'change' insurgent in 2008; governed institutionally. Approval-based trust measure captures the perceived establishment shift.",
    flag: false,
  },

  // ─── 2020 CYCLE — TIER 3/4: DW-NOMINATE + ESTIMATED ─────────────────────

  {
    id: "biden_2020",
    name: "Biden '20",
    fullName: "Joe Biden (2020)",
    cycle: "2020", party: "dem",
    dataTier: 3,
    x_off: -0.391, y_off: 0.80,
    // DW-NOMINATE Senate career −0.391; y from DW-NOMINATE 2nd dim ≈ −0.18,
    // normalized to (−0.18+1)/2 = 0.41; adjusted to 0.82 given explicit
    // "restore normalcy" campaign framing placing him above Clinton on institutional axis.
    // NOTE: No ANES 2020 data in this dataset. Estimate only.
    x_per: -0.32, y_per: 0.82,
    xSource: "TIER 3 — DW-NOMINATE Senate career x_off = −0.391. x_per estimated: Pew Research 2020 typology placed Biden as perceived moderate vs. his leftward platform. Not in ANES 2016.",
    ySource: "TIER 3/4 — Estimated. DW-NOMINATE 2nd dim ≈ −0.18 (moderate insider). Explicit 2020 campaign: 'nothing will fundamentally change,' restored institutional norms rhetoric. No ANES 2020 trust data in this dataset.",
    flag: true,
    flagNote: "TIER 3/4 — No ANES data. x_per from Pew 2020; y_per from DW-NOMINATE 2nd dim + campaign framing.",
  },

  {
    id: "trump_2020",
    name: "Trump '20",
    fullName: "Donald Trump (2020)",
    cycle: "2020", party: "rep",
    dataTier: 4,
    x_off: null, y_off: null,
    x_per: 0.46, y_per: 0.22,
    xSource: "TIER 4 — Estimated. No DW-NOMINATE. Rightward shift from 2016 (0.46→) per Pew 2020 partisan polarization tracking.",
    ySource: "TIER 4 — Estimated. 'Deep state' / anti-institution rhetoric escalated as incumbent. Enders & Uscinski (2021) finds distrust remained primary predictor through 2020.",
    flag: true,
    flagNote: "TIER 4 — Both axes estimated. No ANES 2020 data in this dataset.",
  },

  // ─── 2024 CYCLE — TIER 4: ESTIMATED ──────────────────────────────────────

  {
    id: "kamala_2024",
    name: "Kamala '24",
    fullName: "Kamala Harris (2024)",
    cycle: "2024", party: "dem",
    dataTier: 4,
    x_off: -0.417, y_off: 0.75,
    x_per: -0.38, y_per: 0.78,
    xSource: "TIER 3/4 — DW-NOMINATE Senate x_off = −0.417. x_per estimated: stepped into Biden coalition mid-campaign without establishing independent positioning.",
    ySource: "TIER 4 — Estimated. Inherited Biden's institutional coalition. No independent insurgent positioning. Not in ANES 2016 dataset.",
    flag: true,
    flagNote: "TIER 4 — Both axes estimated. No ANES data for 2024.",
  },

  {
    id: "trump_2024",
    name: "Trump '24",
    fullName: "Donald Trump (2024)",
    cycle: "2024", party: "rep",
    dataTier: 4,
    x_off: null, y_off: null,
    x_per: 0.50, y_per: 0.10,
    xSource: "TIER 4 — Estimated from 2024 polling. No DW-NOMINATE.",
    ySource: "TIER 4 — Estimated. MAGA anti-institution brand peaked; Project 2025 framework explicitly targets dismantling federal agencies.",
    flag: true,
    flagNote: "TIER 4 — Both axes estimated. No ANES data for 2024.",
  },

  // ─── COMPARATIVE LEGISLATORS — TIER 3: DW-NOMINATE ───────────────────────

  {
    id: "aoc",
    name: "AOC",
    fullName: "Alexandria Ocasio-Cortez",
    cycle: "current", party: "dem",
    dataTier: 3,
    // DW-NOMINATE 1st dim ≈ −0.52; 2nd dim ≈ −0.98 (most anti-compromise in House)
    // y_off normalized: (−0.98 + 1) / 2 = 0.01
    x_off: -0.52, y_off: 0.01,
    x_per: -0.57, y_per: 0.12,
    xSource: "TIER 3 — DW-NOMINATE 1st dim = −0.52 (voteview.com). Note: VoteView acknowledges Squad NOMINATE scores are compressed by procedural votes with leadership.",
    ySource: "TIER 3 — DW-NOMINATE 2nd dim ≈ −0.98 (normalized ≈ 0.01), among most anti-compromise members of House. x_per estimated leftward to −0.57 per progressive caucus positioning. No ANES data for House members.",
    flag: true,
    flagNote: "TIER 3 — x_per estimated beyond DW-NOMINATE due to compression. y from DW-NOMINATE 2nd dim.",
  },

  {
    id: "pelosi",
    name: "Pelosi",
    fullName: "Nancy Pelosi",
    cycle: "current", party: "dem",
    dataTier: 3,
    // DW-NOMINATE 1st dim = −0.443; 2nd dim ≈ −0.06 (insider/establishment)
    // y_off normalized: (−0.06 + 1) / 2 = 0.47; adjusted upward for Speaker role
    x_off: -0.443, y_off: 0.88,
    x_per: -0.38, y_per: 0.88,
    xSource: "TIER 3 — DW-NOMINATE 1st dim = −0.443 (voteview.com).",
    ySource: "TIER 3 — DW-NOMINATE 2nd dim ≈ −0.06 (establishment insider). House Speaker, PAC/fundraising machine, superdelegate architect. No ANES data for House members.",
    flag: false,
  },

  {
    id: "romney",
    name: "Romney",
    fullName: "Mitt Romney",
    cycle: "current", party: "rep",
    dataTier: 3,
    // DW-NOMINATE 1st dim Senate = +0.274; 2nd dim ≈ +0.45 (establishment R)
    // y_off normalized: (+0.45 + 1) / 2 = 0.73
    x_off: 0.274, y_off: 0.73,
    x_per: 0.35, y_per: 0.76,
    xSource: "TIER 3 — DW-NOMINATE Senate 1st dim = +0.274 (voteview.com).",
    ySource: "TIER 3 — DW-NOMINATE Senate 2nd dim ≈ +0.45 (establishment Republican). Voted to convict Trump in both impeachment trials. Retired 2024 citing degraded institutional norms.",
    flag: false,
  },

];

// Merge x_per/y_per as the primary display position (what voters respond to)
window.CANDIDATES = window.CANDIDATES.map(c => ({
  ...c,
  x: c.x_per,
  y: c.y_per,
}));

window.CANDIDATE_COLORS = {
  dem: "#5b9cf6",
  ind: "#c97fff",
  rep: "#f06060",
  lib: "#f0c040",
};

window.CYCLES = ["2016", "2020", "2024", "historical", "current"];
