/**
 * chartJobs.js — Figure 6: the two axes do two different jobs.
 *
 * Standardized logistic-regression coefficients (|β · SD|, weighted ANES 2016)
 * for two decisions modeled on the SAME two predictors (ideology + 3-item trust):
 *
 *   WHO you vote for (Trump vs Clinton, n=2,066):   ideology 2.30  trust 0.62
 *   WHETHER you vote (turnout V162031x, n=2,681):    ideology 0.02  trust 0.12
 *
 * Standardized so the two predictors are comparable (per typical spread). The
 * story: ideology dominates CHOICE (3.7×) but is ~zero for TURNOUT, where trust
 * is the only mover. Caveat: ANES over-reports turnout (85–89% claim to vote vs
 * ~60% actual), which compresses the absolute size of both turnout effects.
 */

window.drawChartJobs = function () {
  const container = document.getElementById("chart-jobs");
  if (!container) return;

  const groups = [
    { decision: "WHO you vote for", sub: "Trump vs Clinton", ideology: 2.30, trust: 0.62 },
    { decision: "WHETHER you vote", sub: "turnout", ideology: 0.02, trust: 0.12 },
  ];
  const IDE = "#8a8ad8", TRU = "#5fd0a0";

  const W = container.clientWidth || 680;
  const H = 340;
  const margin = { top: 28, right: 60, bottom: 44, left: 92 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 2.5]).range([0, iW]);
  const groupH = iH / groups.length;
  const barH = 22;

  // gridlines
  x.ticks(6).forEach(t => {
    g.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", -4).attr("y2", iH)
      .attr("stroke", "#ffffff10");
    g.append("text").attr("x", x(t)).attr("y", iH + 16).attr("text-anchor", "middle")
      .attr("fill", "#8888a8").attr("font-size", 10).text(t);
  });
  g.append("text").attr("x", iW / 2).attr("y", iH + 36).attr("text-anchor", "middle")
    .attr("class", "axis-label").text("Standardized importance  (|β × SD|, bigger = stronger predictor)");

  groups.forEach((grp, gi) => {
    const gy = gi * groupH;
    // decision label — own row at top of the group (left-aligned, above the bars)
    g.append("text").attr("x", -margin.left + 6).attr("y", gy + 20)
      .attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700).text(grp.decision);
    g.append("text").attr("x", -margin.left + 6).attr("y", gy + 35)
      .attr("fill", "#8888a8").attr("font-size", 10).text("(" + grp.sub + ")");

    const rows = [
      { label: "Ideology", val: grp.ideology, color: IDE },
      { label: "Trust", val: grp.trust, color: TRU },
    ];
    rows.forEach((r, ri) => {
      const by = gy + 46 + ri * (barH + 8);
      g.append("rect").attr("x", 0).attr("y", by).attr("height", barH)
        .attr("width", Math.max(1.5, x(r.val))).attr("fill", r.color).attr("rx", 2)
        .attr("opacity", 0.9);
      g.append("text").attr("x", -8).attr("y", by + barH / 2 + 4).attr("text-anchor", "end")
        .attr("fill", r.color).attr("font-size", 11).attr("font-weight", 600).text(r.label);
      g.append("text").attr("x", x(r.val) + 6).attr("y", by + barH / 2 + 4)
        .attr("fill", r.color).attr("font-size", 11).attr("font-weight", 700).text(r.val.toFixed(2));
    });
  });

  // divider between the two decisions
  g.append("line").attr("x1", -margin.left + 6).attr("x2", iW).attr("y1", groupH).attr("y2", groupH)
    .attr("stroke", "#2e2e3e");

  window.renderFigSpec("data-jobs", {
    population: "ANES 2016 voters — two weighted logistic models on the same predictors: head-to-head choice (Trump vs Clinton, n=2,066) and turnout (n=2,681).",
    x: "Standardized coefficient |β × SD| — how much each axis moves the outcome, comparable across predictors.",
    y: "Two decisions: who you pick vs whether you vote.",
    marks: "Bars = ideology vs institutional-trust importance per decision. Turnout effects are small in absolute terms (ANES over-reports turnout); the point is the relative flip.",
  });
};
