/**
 * chartDisaffected.js — Figure 8: swing voters aren't centrists, they're disaffected.
 *
 * External validation (Pew Research 2021 Political Typology — "Stressed Sideliners,"
 * the ONLY group with no partisan lean and the lowest engagement of all nine groups):
 *   45% lean Republican · 45% lean Democratic  → evenly split, not a coherent center
 *   74% favor a $15 minimum wage               → operationally left, not moderate
 *   83% "economic system unfairly favors the powerful" → distrust / anti-establishment
 *   lowest turnout of any typology group (15% of public, 10% of 2020 voters)
 *
 * Converges with our ANES moveable bloc (trust ≈ 0.19) and Knight nonvoters (~even).
 * Three independent datasets agree: the up-for-grabs voters are defined by distrust
 * and disengagement, not by moderate ideology.
 */

window.drawChartDisaffected = function () {
  const container = document.getElementById("chart-disaffected");
  if (!container) return;

  const groups = [
    { head: "Ideologically? Split & mixed — not “centrist”", rows: [
      { label: "Lean Republican", val: 45, color: "#f06060" },
      { label: "Lean Democratic", val: 45, color: "#5b9cf6" },
      { label: "Favor a $15 minimum wage", val: 74, color: "#c97fff" },
    ]},
    { head: "Defined by distrust & disengagement", rows: [
      { label: "“Economy unfairly favors the powerful”", val: 83, color: "#f0c040" },
    ]},
  ];

  const W = container.clientWidth || 680;
  const rowH = 26, rowGap = 8, headGap = 30, pad = 30;
  const nRows = groups.reduce((a, g) => a + g.rows.length, 0);
  const H = pad + groups.length * headGap + nRows * (rowH + rowGap) + 34;
  const margin = { top: 6, right: 50, bottom: 28, left: 250 };
  const iW = W - margin.left - margin.right;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleLinear().domain([0, 100]).range([0, iW]);

  let y = 0;
  groups.forEach(grp => {
    g.append("text").attr("x", -margin.left + 4).attr("y", y + 14)
      .attr("fill", "#fff").attr("font-size", 12).attr("font-weight", 700).text(grp.head);
    y += headGap;
    grp.rows.forEach(r => {
      g.append("rect").attr("x", 0).attr("y", y).attr("width", Math.max(2, x(r.val))).attr("height", rowH)
        .attr("fill", r.color).attr("opacity", 0.9).attr("rx", 2);
      g.append("text").attr("x", -8).attr("y", y + rowH / 2 + 4).attr("text-anchor", "end")
        .attr("fill", "#c8c8e0").attr("font-size", 11).text(r.label);
      g.append("text").attr("x", x(r.val) + 6).attr("y", y + rowH / 2 + 4)
        .attr("fill", r.color).attr("font-size", 11).attr("font-weight", 700).text(r.val + "%");
      y += rowH + rowGap;
    });
  });

  // turnout note (qualitative — no single rate)
  g.append("text").attr("x", -margin.left + 4).attr("y", y + 6).attr("fill", "#8888a8").attr("font-size", 10)
    .text("+ lowest turnout of all 9 Pew groups — 15% of the public, just 10% of 2020 voters.");

  // axis
  g.append("g").attr("transform", `translate(0,${y - rowGap + 14})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%")).selectAll("text").attr("fill", "#8888a8").attr("font-size", 9);
  g.selectAll(".domain,.tick line").attr("stroke", "#444");

  window.renderFigSpec("data-disaffected", {
    population: "Pew 2021 Political Typology — “Stressed Sideliners,” the only group with no partisan lean and the lowest engagement. External validation, not ANES.",
    x: "Share of the group (%).",
    y: "Two reads: ideology (split/mixed) vs disposition (distrust/disengagement).",
    marks: "Evenly split party-lean + left economics ⇒ not centrist. 83% “system favors the powerful” + lowest turnout ⇒ disaffected. Matches our ANES moveable bloc (trust 0.19) and Knight nonvoters (~even).",
  });
};
