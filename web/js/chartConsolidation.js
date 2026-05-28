/**
 * chartConsolidation.js — Figure 11: the pivot was consolidation, not the center.
 *
 * Everything in ONE unit (votes), per decisive state:
 *   Sanders' 2016 Democratic-primary vote (the pool that needed consolidating)
 *     WI 567,936 · MI 595,222 · PA 731,881  (≈1.9M across the three)
 *   Trump's general-election margin (what actually decided the state)
 *     WI 22,748 · MI 10,704 · PA 44,292  (77,744 total — the Electoral College)
 *
 * The margin was a 2–6% sliver of each state's Sanders primary electorate. And the
 * cited Sanders→Trump defection (~12%, Schaffner/CCES) alone exceeded every margin.
 * Bounded claim — NOT "Bernie would have won": crossover isn't unique and the matchup
 * was never stress-tested. Sources: state certified results; Schaffner/CCES via NPR/NBC.
 */

window.drawChartConsolidation = function () {
  const container = document.getElementById("chart-consolidation");
  if (!container) return;

  const states = [
    { st: "Wisconsin", sanders: 567936, margin: 22748 },
    { st: "Michigan", sanders: 595222, margin: 10704 },
    { st: "Pennsylvania", sanders: 731881, margin: 44292 },
  ];

  const W = container.clientWidth || 680;
  const rowH = 40, gap = 26;
  const margin = { top: 28, right: 150, bottom: 34, left: 116 };
  const iW = W - margin.left - margin.right;
  const H = margin.top + states.length * (rowH + gap) + margin.bottom;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleLinear().domain([0, 760000]).range([0, iW]);
  const fmt = n => n.toLocaleString();

  // header note
  g.append("text").attr("x", 0).attr("y", -12).attr("fill", "#8888a8").attr("font-size", 11)
    .text("Per state, in votes:  ■ Sanders' Democratic-primary electorate   ■ Trump's general-election margin");

  states.forEach((s, i) => {
    const y = i * (rowH + gap);
    const pct = (100 * s.margin / s.sanders).toFixed(1);
    // state label
    g.append("text").attr("x", -margin.left + 4).attr("y", y + rowH / 2 - 2).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700).text(s.st);
    g.append("text").attr("x", -margin.left + 4).attr("y", y + rowH / 2 + 14).attr("fill", "#8888a8").attr("font-size", 9).text("2016");
    // Sanders primary pool (purple)
    g.append("rect").attr("x", 0).attr("y", y).attr("width", x(s.sanders)).attr("height", rowH).attr("fill", "#c97fff").attr("opacity", 0.55).attr("rx", 2);
    g.append("text").attr("x", x(s.sanders) + 8).attr("y", y + 15).attr("fill", "#c97fff").attr("font-size", 12).attr("font-weight", 700).text(fmt(s.sanders));
    g.append("text").attr("x", x(s.sanders) + 8).attr("y", y + 30).attr("fill", "#8888a8").attr("font-size", 9).text("Sanders primary votes");
    // Trump margin (red), overlaid at the start
    g.append("rect").attr("x", 0).attr("y", y).attr("width", Math.max(2, x(s.margin))).attr("height", rowH).attr("fill", "#f06060").attr("rx", 2);
    g.append("line").attr("x1", x(s.margin)).attr("x2", x(s.margin)).attr("y1", y - 4).attr("y2", y + rowH + 4).attr("stroke", "#fff").attr("stroke-width", 1).attr("opacity", 0.6);
    g.append("text").attr("x", x(s.margin) + 4).attr("y", y - 6).attr("fill", "#f06060").attr("font-size", 10).attr("font-weight", 700)
      .text(`Trump won by ${fmt(s.margin)} — just ${pct}% of it`);
  });

  // bottom axis
  const yAx = states.length * (rowH + gap) - gap + 12;
  g.append("g").attr("transform", `translate(0,${yAx})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => d / 1000 + "k"))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 9);
  g.selectAll(".domain,.tick line").attr("stroke", "#444");

  window.renderFigSpec("data-consolidation", {
    population: "Three decisive states (WI, MI, PA). External certified data — not ANES.",
    x: "Votes.",
    y: "Per state: Sanders' Democratic-primary electorate vs Trump's general-election margin.",
    marks: "Purple = Sanders' primary votes (the pool). Red = Trump's deciding margin — a 2–6% sliver of it. ~12% of Sanders primary voters backed Trump (Schaffner/CCES), itself larger than each margin. Bounded claim — see note.",
  });
};
