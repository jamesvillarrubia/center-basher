/**
 * chartConsolidation.js — Figure 11: the pivot was consolidation, not the center.
 *
 * External, cited data (not ANES — this is the swing-state arithmetic our national
 * sample can't produce):
 *   Trump's decisive Electoral-College margin = 77,744 across PA+WI+MI
 *     (PA 44,292 · WI 22,748 · MI 10,704; state certified results)
 *   Sanders→Trump voters in those same three states ≈ 216,000
 *     (Schaffner / CCES exit-poll analysis, via NBC News) — ~2.8× the margin
 *   Nationally >1.5M Sanders primary voters voted Trump (12%).
 *
 * Bounded claim: the un-consolidated Sanders bloc dwarfed the margin, so the pivot
 * was holding the coalition (a trust-axis problem, per Fig 6), not winning new
 * ideological ground. NOT a "Bernie would have won" proof — crossover isn't unique
 * (12% of GOP primary voters went Clinton; ~25% of Clinton's 2008 voters went McCain)
 * and the matchup was never stress-tested against a GOP general-election assault.
 */

window.drawChartConsolidation = function () {
  const container = document.getElementById("chart-consolidation");
  if (!container) return;

  const states = [
    { st: "PA", margin: 44292, color: "#f06060" },
    { st: "WI", margin: 22748, color: "#f08080" },
    { st: "MI", margin: 10704, color: "#f0a0a0" },
  ];
  const marginTotal = 77744;
  const defectors = 216000;

  const W = container.clientWidth || 680;
  const H = 240;
  const margin = { top: 30, right: 92, bottom: 36, left: 210 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleLinear().domain([0, 230000]).range([0, iW]);
  const barH = 44, gap = 38;
  const fmt = n => (n / 1000).toFixed(n < 1000 ? 1 : 0) + "k";

  // gridlines
  x.ticks(5).forEach(t => {
    g.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", -4).attr("y2", iH).attr("stroke", "#ffffff10");
    g.append("text").attr("x", x(t)).attr("y", iH + 16).attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 10).text(fmt(t));
  });

  // Row 1: decisive margin, segmented by state
  let cur = 0;
  g.append("text").attr("x", -margin.left + 6).attr("y", barH / 2 - 4).attr("fill", "#fff").attr("font-size", 12).attr("font-weight", 700)
    .text("Trump's decisive margin");
  g.append("text").attr("x", -margin.left + 6).attr("y", barH / 2 + 12).attr("fill", "#8888a8").attr("font-size", 10).text("PA + WI + MI (Electoral College)");
  states.forEach(s => {
    g.append("rect").attr("x", x(cur)).attr("y", 0).attr("width", x(s.margin) - x(0)).attr("height", barH)
      .attr("fill", s.color).attr("opacity", 0.9).attr("stroke", "#0f0f13");
    if (x(s.margin) - x(0) > 26)
      g.append("text").attr("x", x(cur + s.margin / 2)).attr("y", barH / 2 + 4).attr("text-anchor", "middle")
        .attr("fill", "#0f0f13").attr("font-size", 10).attr("font-weight", 700).text(s.st);
    cur += s.margin;
  });
  g.append("text").attr("x", x(marginTotal) + 8).attr("y", barH / 2 + 4).attr("fill", "#fff").attr("font-size", 12).attr("font-weight", 700)
    .text(marginTotal.toLocaleString());

  // Row 2: Sanders → Trump defectors in those states
  const y2 = barH + gap;
  g.append("text").attr("x", -margin.left + 6).attr("y", y2 + barH / 2 - 4).attr("fill", "#c97fff").attr("font-size", 12).attr("font-weight", 700)
    .text("Sanders → Trump voters");
  g.append("text").attr("x", -margin.left + 6).attr("y", y2 + barH / 2 + 12).attr("fill", "#8888a8").attr("font-size", 10).text("in the same 3 states (CCES)");
  g.append("rect").attr("x", 0).attr("y", y2).attr("width", x(defectors) - x(0)).attr("height", barH)
    .attr("fill", "#c97fff").attr("opacity", 0.85).attr("rx", 2);
  g.append("text").attr("x", x(defectors) + 8).attr("y", y2 + barH / 2 + 4).attr("fill", "#c97fff").attr("font-size", 12).attr("font-weight", 700)
    .text("~216,000");
  g.append("text").attr("x", x(defectors) + 8).attr("y", y2 + barH / 2 + 18).attr("fill", "#8888a8").attr("font-size", 9)
    .text("≈ 2.8× the margin");

  window.renderFigSpec("data-consolidation", {
    population: "Three decisive states (PA, WI, MI). External cited data — not ANES, which is national-only.",
    x: "Votes.",
    y: "Trump's combined EC-deciding margin vs Sanders→Trump defectors in the same states.",
    marks: "Top bar = margin (segmented by state). Bottom = Sanders→Trump voters (Schaffner/CCES). Defectors ≈ 2.8× the margin; abstainers (21% of Sanders voters) are an even larger uncounted pool. Bounded claim — see note.",
  });
};
