/**
 * chartDisaffected.js — Figure 8: swing voters aren't centrists, they're disaffected.
 *
 * Pew 2021 Political Typology, "Stressed Sideliners" (only group with no partisan
 * lean; lowest engagement of all nine):
 *   party lean 45% R / 10% neither / 45% D  → evenly torn, not a coherent center
 *   74% favor a $15 minimum wage            → lean left on economics, not moderate
 *   83% "economy unfairly favors the powerful" → distrust / anti-establishment
 *   lowest turnout of any group (15% of public, 10% of 2020 voters) → disengaged
 * Converges with our ANES moveable bloc (trust ≈ 0.19) and Knight nonvoters (~even).
 */

window.drawChartDisaffected = function () {
  const container = document.getElementById("chart-disaffected");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = 250;
  const M = { top: 26, right: 24, bottom: 16, left: 24 };
  const iW = W - M.left - M.right;
  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

  // ── Beat 1: NOT a center — evenly torn party lean (single divided bar) ────
  g.append("text").attr("x", 0).attr("y", 0).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700)
    .text("Not a center — evenly torn between the parties");
  const segs = [
    { v: 45, c: "#5b9cf6", t: "45% lean Dem" },
    { v: 10, c: "#555", t: "10% neither" },
    { v: 45, c: "#f06060", t: "45% lean Rep" },
  ];
  const bx = d3.scaleLinear().domain([0, 100]).range([0, iW]);
  let cur = 0, barY = 12, barH = 30;
  segs.forEach(s => {
    g.append("rect").attr("x", bx(cur)).attr("y", barY).attr("width", bx(s.v) - bx(0)).attr("height", barH)
      .attr("fill", s.c).attr("opacity", 0.9);
    g.append("text").attr("x", bx(cur + s.v / 2)).attr("y", barY + barH / 2 + 4).attr("text-anchor", "middle")
      .attr("fill", "#fff").attr("font-size", 10).attr("font-weight", 600).text(s.t);
    cur += s.v;
  });
  g.append("text").attr("x", 0).attr("y", barY + barH + 16).attr("fill", "#8888a8").attr("font-size", 10)
    .text("…and they lean LEFT on economics — 74% want a $15 minimum wage. Not moderate; torn + populist.");

  // ── Beat 2: DISAFFECTED — distrust headline + turnout ────────────────────
  const y2 = 104;
  g.append("text").attr("x", 0).attr("y", y2).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700)
    .text("United by distrust and disengagement");
  // big distrust number
  g.append("text").attr("x", 0).attr("y", y2 + 52).attr("fill", "#f0c040").attr("font-size", 52).attr("font-weight", 800)
    .text("83%");
  g.append("text").attr("x", 120).attr("y", y2 + 34).attr("fill", "#e8e8f0").attr("font-size", 13)
    .text("say the economy");
  g.append("text").attr("x", 120).attr("y", y2 + 52).attr("fill", "#e8e8f0").attr("font-size", 13).attr("font-weight", 700)
    .text("“unfairly favors the powerful.”");
  g.append("text").attr("x", 120).attr("y", y2 + 72).attr("fill", "#8888a8").attr("font-size", 11)
    .text("+ the lowest turnout of all 9 Pew groups — just 10% of 2020 voters.");

  window.renderFigSpec("data-disaffected", {
    population: "Pew 2021 Political Typology — “Stressed Sideliners,” the only no-partisan-lean group and the least engaged. External validation, not ANES.",
    x: "Top: share of the group by party lean. Bottom: agreement / disposition.",
    y: "Two reads — ideology (torn, left-econ) vs disposition (distrust, low turnout).",
    marks: "Evenly split + left economics ⇒ not centrist. 83% “system favors the powerful” + lowest turnout ⇒ disaffected. Matches our ANES moveable bloc (0.19) and Knight nonvoters.",
  });
};
