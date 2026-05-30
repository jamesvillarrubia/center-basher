/**
 * chartTurnoutHump.js — Figure: the turnout hump (stakes × efficacy).
 *
 * Among the gettable (low-engagement) voters, two opposing gradients explain why
 * the no-shows fail two opposite ways:
 *   STAKES rises with institutional grievance (36 → 38 → 45%);
 *   EFFICACY falls with grievance (2.53 → 2.26 → 2.12 / 5);
 *   TURNOUT peaks in the middle (mid > both ends).
 *
 * Two failure modes annotated:
 *   left  = COMPLACENT (high efficacy, low stakes — "doesn't matter who wins")
 *   right = ALIENATED  (high stakes, low efficacy — "I care, but my vote won't matter")
 *
 * Data: data/derived/turnout_hump.json (ANES 2016 weighted, V161004=3 low-interest;
 * stakes V161005, efficacy mean(V162215,V162216), turnout V162031x; grievance terciles
 * computed within the low-engagement subset). n per band ~100-200 — the hump is fragile,
 * the gradients are reliable.
 */

window.drawTurnoutHump = async function () {
  const container = document.getElementById("chart-turnout-hump");
  if (!container) return;

  // Inline the data so it's self-contained and survives static hosting.
  const ROWS = [
    { band: "low",  stakes: 36.0, efficacy: 2.53, turnout: 60.8, n: 203 },
    { band: "mid",  stakes: 37.8, efficacy: 2.26, turnout: 78.4, n: 196 },
    { band: "high", stakes: 44.8, efficacy: 2.12, turnout: 73.6, n: 117 },
  ];
  // Normalize efficacy from /5 → /100 so all three lines share one axis.
  const data = ROWS.map(r => ({ ...r, efficacy_pct: (r.efficacy / 5) * 100 }));

  const W = container.clientWidth || 680;
  const M = { top: 56, right: 130, bottom: 76, left: 56 };
  const iW = W - M.left - M.right;
  const iH = 280;
  const H = M.top + iH + M.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

  // Header
  const hx = -M.left + 14;
  g.append("text").attr("x", hx).attr("y", -34).attr("fill", "#c9b96e")
    .attr("font-size", 12).attr("font-weight", 700)
    .text("Two gradients cross. Turnout peaks in the middle.");
  g.append("text").attr("x", hx).attr("y", -19).attr("fill", "#8888a8").attr("font-size", 10)
    .text("Among the gettable (low-interest voters), by institutional grievance · ANES 2016, weighted");

  // Scales
  const x = d3.scalePoint()
    .domain(["low", "mid", "high"])
    .range([0, iW])
    .padding(0.25);
  const y = d3.scaleLinear().domain([0, 100]).range([iH, 0]);

  // Y gridlines + labels (0..100, step 25)
  [0, 25, 50, 75, 100].forEach(t => {
    g.append("line")
      .attr("x1", 0).attr("x2", iW)
      .attr("y1", y(t)).attr("y2", y(t))
      .attr("stroke", "#252533").attr("stroke-dasharray", t === 0 ? "0" : "2,3");
    g.append("text")
      .attr("x", -8).attr("y", y(t) + 3)
      .attr("text-anchor", "end").attr("fill", "#6a6a82").attr("font-size", 9)
      .text(t + "%");
  });

  // X axis labels
  ["low", "mid", "high"].forEach(b => {
    g.append("text")
      .attr("x", x(b)).attr("y", iH + 16)
      .attr("text-anchor", "middle").attr("fill", "#aaaac0").attr("font-size", 10).attr("font-weight", 600)
      .text(b + " grievance");
    const r = data.find(d => d.band === b);
    g.append("text")
      .attr("x", x(b)).attr("y", iH + 30)
      .attr("text-anchor", "middle").attr("fill", "#6a6a82").attr("font-size", 9)
      .text(`n=${r.n}`);
  });

  // Three lines: stakes (rising), efficacy (falling), turnout (humping)
  const lineGen = key => d3.line()
    .x(d => x(d.band)).y(d => y(d[key]))
    .curve(d3.curveMonotoneX);

  const SERIES = [
    { key: "stakes",       label: "STAKES (care a good deal)", color: "#f06060", dash: "0" },
    { key: "efficacy_pct", label: "EFFICACY (vote matters, /5 → %)", color: "#5b9cf6", dash: "0" },
    { key: "turnout",      label: "TURNOUT (self-rep)",        color: "#c9b96e", dash: "4,3" },
  ];

  SERIES.forEach(s => {
    g.append("path")
      .datum(data)
      .attr("d", lineGen(s.key))
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", s.key === "turnout" ? 2.5 : 2)
      .attr("stroke-dasharray", s.dash)
      .attr("opacity", s.key === "turnout" ? 0.95 : 0.85);

    // dots
    data.forEach(d => {
      g.append("circle")
        .attr("cx", x(d.band)).attr("cy", y(d[s.key]))
        .attr("r", 4).attr("fill", s.color);
    });

    // end-of-line value labels (rightmost point)
    const last = data[data.length - 1];
    g.append("text")
      .attr("x", x(last.band) + 10).attr("y", y(last[s.key]) + 3)
      .attr("fill", s.color).attr("font-size", 10).attr("font-weight", 600)
      .text(s.key === "efficacy_pct"
        ? `${last.efficacy.toFixed(2)}/5`
        : `${Math.round(last[s.key])}%`);
  });

  // Legend (top-right, in chart)
  const legX = iW - 4, legY = 6;
  SERIES.forEach((s, i) => {
    g.append("rect")
      .attr("x", legX - 100).attr("y", legY + i * 14 - 7)
      .attr("width", 100).attr("height", 12).attr("fill", "#1a1a22").attr("opacity", 0.5);
    g.append("line")
      .attr("x1", legX - 96).attr("x2", legX - 82).attr("y1", legY + i * 14).attr("y2", legY + i * 14)
      .attr("stroke", s.color).attr("stroke-width", 2).attr("stroke-dasharray", s.dash);
    g.append("text")
      .attr("x", legX - 78).attr("y", legY + i * 14 + 3)
      .attr("fill", s.color).attr("font-size", 9).attr("font-weight", 600)
      .text(s.label);
  });

  // Failure-mode annotations under each end
  const annY = iH + 50;
  g.append("text")
    .attr("x", x("low")).attr("y", annY)
    .attr("text-anchor", "middle").attr("fill", "#5b9cf6").attr("font-size", 10).attr("font-weight", 700)
    .text("COMPLACENT");
  g.append("text")
    .attr("x", x("low")).attr("y", annY + 13)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 9).attr("font-style", "italic")
    .text("“doesn’t matter who wins”");

  g.append("text")
    .attr("x", x("high")).attr("y", annY)
    .attr("text-anchor", "middle").attr("fill", "#f06060").attr("font-size", 10).attr("font-weight", 700)
    .text("ALIENATED");
  g.append("text")
    .attr("x", x("high")).attr("y", annY + 13)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 9).attr("font-style", "italic")
    .text("“my vote won’t matter”");

  // Caveat note (bottom strip, inside chart area)
  svg.append("text")
    .attr("x", M.left + 14).attr("y", H - 10)
    .attr("fill", "#6a6a82").attr("font-size", 9).attr("font-style", "italic")
    .text("Self-report turnout (over-reports ~25pp vs validated); n=100–200 per band — hump is suggestive, gradients reliable.");
};
