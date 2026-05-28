/**
 * chartConsolidation.js — Figure 11: the pivot was consolidation, not the center.
 *
 * Per decisive state, all in VOTES — Trump's deciding margin vs the Sanders→Trump
 * defectors. Defector counts = CES 2016 (vote-validated) per-state Sanders→Trump
 * rate × certified Sanders Democratic-primary votes:
 *   WI  margin 22,748  ·  Sanders→Trump ≈ 60,960  (11% of 567,936)  → 2.7× margin
 *   MI  margin 10,704  ·  Sanders→Trump ≈ 56,208  ( 9% of 595,222)  → 5.3× margin
 *   PA  margin 44,292  ·  Sanders→Trump ≈131,432  (18% of 731,881)  → 3.0× margin
 * National Sanders→Trump = 12% (reproduces Schaffner/CCES exactly from the raw file).
 * ~30% of Sanders primary voters didn't vote at all (validated) — a larger pool still.
 *
 * Bounded claim — NOT "Bernie would have won": crossover isn't unique and the matchup
 * was never stress-tested. The defensible point is the arithmetic: in EVERY decisive
 * state the Sanders→Trump defection alone exceeded Trump's margin, 2.7–5.3×.
 */

window.drawChartConsolidation = function () {
  const container = document.getElementById("chart-consolidation");
  if (!container) return;

  const states = [
    { st: "Wisconsin",    margin: 22748, defect: 60960,  pool: 567936, rate: 11, mult: "2.7×" },
    { st: "Michigan",     margin: 10704, defect: 56208,  pool: 595222, rate: 9,  mult: "5.3×" },
    { st: "Pennsylvania", margin: 44292, defect: 131432, pool: 731881, rate: 18, mult: "3.0×" },
  ];

  const W = container.clientWidth || 680;
  const rowH = 18, pairGap = 10, groupGap = 30;
  const M = { top: 30, right: 132, bottom: 30, left: 116 };
  const iW = W - M.left - M.right;
  const H = M.top + states.length * (2 * rowH + pairGap + groupGap) + M.bottom;
  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
  const x = d3.scaleLinear().domain([0, 145000]).range([0, iW]);
  const fmt = n => n.toLocaleString();

  g.append("text").attr("x", -M.left + 4).attr("y", -14).attr("fill", "#8888a8").attr("font-size", 11)
    .text("Per state, in votes:  ■ Trump's margin    ■ Sanders→Trump defectors (CES validated)");

  let y = 0;
  states.forEach(s => {
    g.append("text").attr("x", -M.left + 4).attr("y", y + rowH + 2).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700).text(s.st);
    // margin (red)
    g.append("rect").attr("x", 0).attr("y", y).attr("width", x(s.margin)).attr("height", rowH).attr("fill", "#f06060").attr("rx", 2);
    g.append("text").attr("x", x(s.margin) + 6).attr("y", y + rowH - 4).attr("fill", "#f06060").attr("font-size", 11).attr("font-weight", 700).text(fmt(s.margin));
    // defectors (purple)
    const y2 = y + rowH + pairGap;
    g.append("rect").attr("x", 0).attr("y", y2).attr("width", x(s.defect)).attr("height", rowH).attr("fill", "#c97fff").attr("rx", 2);
    g.append("text").attr("x", x(s.defect) + 6).attr("y", y2 + rowH - 4).attr("fill", "#c97fff").attr("font-size", 11).attr("font-weight", 700)
      .text(`${fmt(s.defect)} · ${s.mult}`);
    g.append("text").attr("x", -M.left + 4).attr("y", y + rowH + 16).attr("fill", "#8888a8").attr("font-size", 8.5).text(`${s.rate}% of ${(s.pool/1000).toFixed(0)}k primary`);
    y += 2 * rowH + pairGap + groupGap;
  });

  g.append("g").attr("transform", `translate(0,${y - groupGap + 6})`).call(d3.axisBottom(x).ticks(7).tickFormat(d => d/1000 + "k"))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 9);
  g.selectAll(".domain,.tick line").attr("stroke", "#444");

  window.renderFigSpec("data-consolidation", {
    population: "Three decisive states (WI, MI, PA). CES 2016 vote-validated rates × certified primary/general results — not ANES.",
    x: "Votes.",
    y: "Per state: Trump's deciding margin vs Sanders→Trump defectors.",
    marks: "Red = Trump's margin. Purple = Sanders→Trump (CES validated rate × certified Sanders primary votes) — 2.7–5.3× the margin in every state. National rate 12% reproduces Schaffner. Bounded claim — see note.",
  });
};
