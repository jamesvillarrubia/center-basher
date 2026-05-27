/**
 * chart2d.js — The 2D ideology × trust density map (Act 2)
 *
 * Replaces the Likert-grid scatter (7-pt × 5-pt = ugly discrete grid) with
 * per-party density contours. Shows WHERE each party's voters concentrate
 * in ideology × trust space without implying false precision from ordinal data.
 */

window.drawChart2D = function (voters) {
  const container = document.getElementById("chart-2d");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.85, 520);
  const margin = { top: 32, right: 24, bottom: 52, left: 58 };
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
  [[0, iH/2, iW/2, iH/2],
   [iW/2, iH/2, iW/2, iH/2],
   [0, 0, iW/2, iH/2],
   [iW/2, 0, iW/2, iH/2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect")
      .attr("x", qx).attr("y", qy).attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1e1826" : "#121b1a").attr("opacity", 0.6);
  });

  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // Quadrant labels
  [
    { label: "Low-trust Left",  lx: iW * 0.06, ly: iH * 0.96 },
    { label: "Low-trust Right", lx: iW * 0.55, ly: iH * 0.96 },
    { label: "High-trust Left", lx: iW * 0.06, ly: iH * 0.04 },
    { label: "High-trust Right",lx: iW * 0.55, ly: iH * 0.04 },
  ].forEach(q => {
    g.append("text").attr("x", q.lx).attr("y", q.ly)
      .attr("class", "quadrant-label").text(q.label);
  });

  // Party groups: collapse 5-pt into 3 for legibility
  const groups = [
    { key: "dem",  label: "Democrat",    color: "#5b9cf6", filter: d => d.party === "strong_dem" || d.party === "lean_dem" },
    { key: "ind",  label: "Independent", color: "#c97fff", filter: d => d.party === "independent" },
    { key: "rep",  label: "Republican",  color: "#f06060", filter: d => d.party === "strong_rep" || d.party === "lean_rep" },
  ];

  const densityGen = d3.contourDensity()
    .x(d => xS(d.x))
    .y(d => yS(d.y))
    .size([iW, iH])
    .bandwidth(32)
    .thresholds(8);

  groups.forEach(grp => {
    const pts = voters.filter(grp.filter);
    const contours = densityGen(pts);
    const maxVal = d3.max(contours, d => d.value) || 1;

    g.append("g")
      .selectAll("path")
      .data(contours)
      .join("path")
      .attr("d", d3.geoPath())
      .attr("fill", grp.color)
      .attr("opacity", d => 0.04 + 0.22 * (d.value / maxVal))
      .attr("stroke", grp.color)
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", d => 0.1 + 0.5 * (d.value / maxVal));
  });

  // Axes
  const xAxis = d3.axisBottom(xS).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");
  const yAxis = d3.axisLeft(yS).ticks(4)
    .tickFormat(v => v === 0 ? "No trust" : v === 1 ? "Full trust" : v === 0.5 ? "Medium" : "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW/2).attr("y", iH + 44)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Policy Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH/2).attr("y", -46)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Institutional Trust");

  // Legend
  const legendEl = document.getElementById("legend-2d");
  if (legendEl) {
    legendEl.innerHTML = "";
    groups.forEach(grp => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<div class="legend-dot" style="background:${grp.color}"></div>${grp.label}`;
      legendEl.appendChild(item);
    });
  }
};
