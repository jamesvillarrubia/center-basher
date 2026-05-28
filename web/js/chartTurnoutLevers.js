/**
 * chartTurnoutLevers.js — Figure 6B: what actually shifts turnout (causal).
 *
 * The cross-section (Fig 6) shows position doesn't predict turnout. This is the
 * CAUSAL backbone: randomized field experiments (Gerber & Green, Get Out the Vote,
 * meta-analyses) measuring the percentage-point lift in turnout among treated voters.
 *
 *   lever                                   Δ turnout (pp)   type
 *   Persuasion / policy message content        ≈ 0          message
 *   Standard GOTV mail                          +0.8        contact
 *   Volunteer phone bank                        +2.0        contact
 *   Door-to-door canvassing                     +4.3        contact
 *   Social-pressure "neighbors" mail            +8.1        contact
 *
 * Every proven lever is about CONTACT and social pressure — not the message's policy
 * content, which moves turnout ≈0. So a centrist policy pivot does essentially nothing
 * to turnout. (At the candidate level, the big swings — Obama 2008, the 66.6% of 2020,
 * highest since 1904 — come from candidates voters feel strongly about: affect, not
 * triangulation.) The positional lever that DOES move the contestable is CHOICE, via
 * trust (Fig 7) — which is why you match the base's trust rather than chase turnout.
 */

const TURNOUT_LEVERS = [
  { lab: "Policy / persuasion message", pp: 0.0, kind: "message" },
  { lab: "Standard GOTV mail",          pp: 0.8, kind: "contact" },
  { lab: "Volunteer phone bank",        pp: 2.0, kind: "contact" },
  { lab: "Door-to-door canvassing",     pp: 4.3, kind: "contact" },
  { lab: "Social-pressure mail",        pp: 8.1, kind: "contact" },
];

window.drawTurnoutLevers = function () {
  const container = document.getElementById("chart-turnout-levers");
  if (!container) return;

  const W = container.clientWidth || 680;
  const M = { top: 50, right: 50, bottom: 38, left: 168 };
  const iW = W - M.left - M.right;
  const rowH = 26, gap = 14, firstTop = 6;
  const plotH = TURNOUT_LEVERS.length * rowH + (TURNOUT_LEVERS.length - 1) * gap;
  const H = M.top + plotH + M.bottom;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
  const x = d3.scaleLinear().domain([0, 9]).range([0, iW]);

  // header (span from the far-left edge so it doesn't clip)
  const hx = -M.left + 2;
  g.append("text").attr("x", hx).attr("y", -30).attr("fill", "#c9b96e").attr("font-size", 11).attr("font-weight", 700)
    .text("Policy message → turnout ≈ 0. Contact & pressure → turnout.");
  g.append("text").attr("x", hx).attr("y", -16).attr("fill", "#8888a8").attr("font-size", 9.5)
    .text("Randomized field experiments (Gerber & Green) — causal, per treated voter.");

  // gridlines
  [2, 4, 6, 8].forEach(t => {
    g.append("line").attr("x1", x(t)).attr("y1", 0).attr("x2", x(t)).attr("y2", plotH).attr("stroke", "#26263400").attr("stroke", "#252533");
    g.append("text").attr("x", x(t)).attr("y", plotH + 16).attr("text-anchor", "middle").attr("fill", "#6a6a82").attr("font-size", 8.5).text(t + "pp");
  });

  TURNOUT_LEVERS.forEach((d, i) => {
    const top = firstTop + i * (rowH + gap);
    const yc = top + rowH / 2;
    const isMsg = d.kind === "message";
    const col = isMsg ? "#f06060" : d3.interpolateGreens(0.4 + 0.45 * (d.pp / 8.1));
    g.append("text").attr("x", -10).attr("y", yc + 4).attr("text-anchor", "end")
      .attr("fill", isMsg ? "#f0b0b0" : "#cfd6ea").attr("font-size", 10.5).attr("font-weight", isMsg ? 700 : 400).text(d.lab);
    g.append("rect").attr("x", 0).attr("y", top).attr("width", Math.max(2, x(d.pp))).attr("height", rowH).attr("fill", col).attr("rx", 2);
    g.append("text").attr("x", x(d.pp) + 6).attr("y", yc + 4).attr("fill", isMsg ? "#f06060" : "#e8e8f0").attr("font-size", 11).attr("font-weight", 700)
      .text(isMsg ? "≈ 0" : "+" + d.pp.toFixed(1));
  });

  window.renderFigSpec("data-turnout-levers", {
    population: "Randomized GOTV field experiments pooled by Gerber & Green (Get Out the Vote) — causal, not cross-sectional. Effects are percentage-point increases in turnout among treated voters.",
    x: "Δ turnout (percentage points).",
    y: "Mobilization lever.",
    marks: "Message/policy content moves turnout ≈0; the movers are all CONTACT and social pressure (mail +0.8, phone +2, canvass +4.3, 'neighbors' pressure +8.1). A centrist policy pivot is a message move — it does ≈0 to turnout. The positional lever that moves the contestable is CHOICE via trust (Fig 7), not turnout.",
  });
};
