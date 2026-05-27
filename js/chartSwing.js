/**
 * chartSwing.js — Act 3: Primary vs General voter distributions (single view)
 *
 * Four groups shown simultaneously:
 *   Clinton primary  — dashed blue outline contours
 *   Sanders primary  — dashed purple outline contours
 *   Clinton general  — solid filled blue contours
 *   Trump general    — solid filled red contours
 *
 * Y-axis labels show actual Likert response options (V161215 is 5-point).
 * Trust centroids labeled directly on the chart, not in a legend.
 *
 * Data note: trust only takes values 0, 0.25, 0.5, 0.75, 1.0 (5-pt scale).
 * Median voter = 0.25 ("some of the time"). The bottom-half clustering is real.
 */

window.drawChartSwing = function (voters) {
  const container = document.getElementById("chart-swing");
  if (!container) return;

  const groups = [
    {
      key: "trump_general",
      label: "Trump general",
      sublabel: "n=1,002 · trust=0.28",
      color: "#f06060",
      solid: true,
      filter: v => v.vote === "trump",
    },
    {
      key: "clinton_general",
      label: "Clinton general",
      sublabel: "n=1,061 · trust=0.42",
      color: "#5b9cf6",
      solid: true,
      filter: v => v.vote === "clinton",
    },
    {
      key: "sanders_primary",
      label: "Sanders primary",
      sublabel: "n=339 · trust=0.37",
      color: "#c97fff",
      solid: false,
      filter: v => v.primary_vote === "sanders",
    },
    {
      key: "clinton_primary",
      label: "Clinton primary",
      sublabel: "n=444 · trust=0.46",
      color: "#91bef9",
      solid: false,
      filter: v => v.primary_vote === "clinton",
    },
  ];

  // Centroids for direct labeling
  const centroids = {
    trump_general:   { x:  0.460, y: 0.283 },
    clinton_general: { x: -0.333, y: 0.422 },
    sanders_primary: { x: -0.421, y: 0.367 },
    clinton_primary: { x: -0.347, y: 0.460 },
  };

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.88, 540);
  const margin = { top: 36, right: 140, bottom: 60, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, 1]).range([iH, 0]);

  // Quadrant fills
  [[0, iH/2, iW/2, iH/2], [iW/2, iH/2, iW/2, iH/2],
   [0, 0,    iW/2, iH/2], [iW/2, 0,    iW/2, iH/2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect").attr("x", qx).attr("y", qy).attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1e1826" : "#121b1a").attr("opacity", 0.6);
  });

  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // Density contours — draw solid (filled) groups first, then dashed (outline) on top
  const densityGen = d3.contourDensity()
    .x(d => xS(d.x)).y(d => yS(d.y))
    .size([iW, iH]).bandwidth(32).thresholds(8);

  // Draw solid groups (general election) first
  groups.filter(g2 => g2.solid).forEach(grp => {
    const pts = voters.filter(grp.filter);
    const contours = densityGen(pts);
    const maxVal = d3.max(contours, d => d.value) || 1;

    g.append("g").selectAll("path")
      .data(contours).join("path")
      .attr("d", d3.geoPath())
      .attr("fill", grp.color)
      .attr("opacity", d => 0.04 + 0.18 * (d.value / maxVal))
      .attr("stroke", grp.color).attr("stroke-width", 1)
      .attr("stroke-opacity", d => 0.1 + 0.6 * (d.value / maxVal));
  });

  // Draw dashed (primary) groups on top
  groups.filter(g2 => !g2.solid).forEach(grp => {
    const pts = voters.filter(grp.filter);
    const contours = densityGen(pts);
    const maxVal = d3.max(contours, d => d.value) || 1;

    g.append("g").selectAll("path")
      .data(contours).join("path")
      .attr("d", d3.geoPath())
      .attr("fill", "none")
      .attr("stroke", grp.color).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,3")
      .attr("stroke-opacity", d => 0.2 + 0.65 * (d.value / maxVal));
  });

  // Direct labels — one per group, placed near centroid, pushed right margin
  const labelOffsets = {
    trump_general:   { dx: 16, dy:  4 },
    clinton_general: { dx: 16, dy: -4 },
    sanders_primary: { dx: 16, dy:  4 },
    clinton_primary: { dx: 16, dy: -4 },
  };

  groups.forEach(grp => {
    const c = centroids[grp.key];
    if (!c) return;
    const cx = xS(c.x), cy = yS(c.y);
    const off = labelOffsets[grp.key] || { dx: 12, dy: 0 };

    // Centroid dot
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 5)
      .attr("fill", grp.color).attr("opacity", 0.9)
      .attr("stroke", "#fff").attr("stroke-width", 1);

    // Leader line to right margin label area
    const lx = iW + 8;
    const ly = cy + off.dy;
    g.append("line")
      .attr("x1", cx + 6).attr("y1", cy)
      .attr("x2", lx).attr("y2", ly)
      .attr("stroke", grp.color).attr("stroke-width", 0.75).attr("opacity", 0.5)
      .attr("stroke-dasharray", grp.solid ? "none" : "3,2");

    g.append("text").attr("x", lx + 4).attr("y", ly - 1)
      .attr("fill", grp.color).attr("font-size", 10).attr("font-weight", "700")
      .text(grp.label);
    g.append("text").attr("x", lx + 4).attr("y", ly + 10)
      .attr("fill", grp.color).attr("font-size", 9).attr("opacity", 0.7)
      .text(grp.sublabel);
  });

  // Axes — y-axis uses actual Likert response labels
  const xAxis = d3.axisBottom(xS).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");

  const yTickVals = [0, 0.25, 0.5, 0.75, 1.0];
  const yTickLabels = {
    0:    "Never",
    0.25: "Some of the time",
    0.5:  "Half the time",
    0.75: "Most of the time",
    1.0:  "Always",
  };
  const yAxis = d3.axisLeft(yS)
    .tickValues(yTickVals)
    .tickFormat(v => yTickLabels[v] || "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 10);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  // Horizontal grid lines at each Likert value
  yTickVals.forEach(v => {
    g.append("line")
      .attr("x1", 0).attr("x2", iW)
      .attr("y1", yS(v)).attr("y2", yS(v))
      .attr("stroke", "#ffffff0a").attr("stroke-width", 1);
  });

  g.append("text").attr("x", iW/2).attr("y", iH + 46)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Policy Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH/2).attr("y", -52)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Trust in government (V161215)");

  g.append("text").attr("x", iW/2).attr("y", -18)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 11)
    .text("Solid = general election voters  ·  Dashed outline = primary voters");
};
