/**
 * chartCampaignCeiling.js — Figure 8B (keystone): who's on the ballot vs. what
 * the campaign does after. The "scaling" for how much you can change once the
 * candidate is decided.
 *
 * Two bars, in points of vote share moved:
 *   - WHO you nominate (the candidate's trust position): ~22 pts. Within Clinton's
 *     reachable coalition, vote share swings 90%→68% across trust bands (Fig 7).
 *     That's a positional/structural association — what the candidate IS.
 *   - What the CAMPAIGN does after: ≈0. Kalla & Broockman (2018, 49 field
 *     experiments): the persuasive effect of campaign contact + advertising on
 *     candidate choice in general elections is ~zero; policy→turnout is ≈0 too (Fig 6B).
 *
 * Honest caveat (rendered): these are different kinds of estimate — a positional
 * association vs. a causal campaign effect — shown on one "points of vote" scale to
 * make the magnitude gap legible. The point: between two known candidates, the
 * outcome is decided at the NOMINATION, by priors (trust), not by in-campaign moves.
 */

const CEIL_BARS = [
  { lab: "WHO you nominate", sub: "the candidate's trust position (Fig 7)", pp: 22, kind: "prior" },
  { lab: "What the CAMPAIGN does after", sub: "persuasion + ads + policy (general)", pp: 0.4, kind: "campaign" },
];

window.drawCampaignCeiling = function () {
  const el = document.getElementById("chart-campaign-ceiling");
  if (!el) return;

  const W = el.clientWidth || 680;
  const M = { top: 56, right: 56, bottom: 34, left: 196 };
  const iW = W - M.left - M.right;
  const rowH = 40, gap = 26, firstTop = 6;
  const plotH = CEIL_BARS.length * rowH + (CEIL_BARS.length - 1) * gap;
  const H = M.top + plotH + M.bottom;

  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
  const x = d3.scaleLinear().domain([0, 25]).range([0, iW]);

  g.append("text").attr("x", -M.left + 2).attr("y", -32).attr("fill", "#c9b96e").attr("font-size", 12).attr("font-weight", 700)
    .text("The nominee moves the vote. The campaign barely can.");
  g.append("text").attr("x", -M.left + 2).attr("y", -17).attr("fill", "#8888a8").attr("font-size", 10)
    .text("Points of vote share moved — between two well-known candidates.");

  CEIL_BARS.forEach((b, i) => {
    const top = firstTop + i * (rowH + gap);
    const yc = top + rowH / 2;
    const isPrior = b.kind === "prior";
    const col = isPrior ? "#5b9cf6" : "#f06060";
    g.append("text").attr("x", -12).attr("y", yc - 2).attr("text-anchor", "end").attr("fill", "#e8e8f0").attr("font-size", 12).attr("font-weight", 700).text(b.lab);
    g.append("text").attr("x", -12).attr("y", yc + 12).attr("text-anchor", "end").attr("fill", "#8888a8").attr("font-size", 9).text(b.sub);
    g.append("rect").attr("x", 0).attr("y", top).attr("width", Math.max(3, x(b.pp))).attr("height", rowH).attr("fill", col).attr("rx", 3);
    g.append("text").attr("x", Math.max(3, x(b.pp)) + 8).attr("y", yc + 4).attr("fill", col).attr("font-size", 14).attr("font-weight", 800)
      .text(isPrior ? "~22 pts" : "≈ 0");
  });

  // x ticks
  [5, 10, 15, 20].forEach(t => {
    g.append("text").attr("x", x(t)).attr("y", plotH + 16).attr("text-anchor", "middle").attr("fill", "#6a6a82").attr("font-size", 8.5).text(t);
  });

  window.renderFigSpec("data-campaign-ceiling", {
    population: "Two estimates on a common 'points of vote share' scale. Prior: Clinton's reachable-coalition retention across trust bands (ANES 2016, Fig 7). Campaign: meta-analytic causal effect of contact + advertising on general-election choice (Kalla & Broockman 2018, 49 field experiments).",
    x: "Points of vote share moved.",
    marks: "WHO you nominate (the candidate's trust position) is associated with a ~22-pt swing in the reachable coalition's vote; what the CAMPAIGN does after (persuasion, ads, policy) moves general-election choice ≈0. CAVEAT: different kinds of estimate — a positional association vs a causal campaign effect — shown together to scale the gap. The takeaway: once two known candidates are set, the outcome is decided at the NOMINATION, by priors (trust), not in-campaign moves. The malleable window is the primary (defining an unknown), where persuasion can bite.",
  });
};
