/**
 * chartCandidates.js — Candidate positions in 2D ideology × establishment space.
 *
 * Shows both "official" (DW-NOMINATE) and "perceived" (ANES voter placement) positions,
 * connected by a line illustrating the perception gap.
 *
 * Drawn into: #chart-candidates
 */

window.drawChartCandidates = function (candidates) {
  const container = document.getElementById("chart-candidates");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.9, 540);
  const margin = { top: 44, right: 28, bottom: 56, left: 58 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const y = d3.scaleLinear().domain([0, 1]).range([iH, 0]);

  // Quadrant fills
  [[0, iH / 2, iW / 2, iH / 2],
   [iW / 2, iH / 2, iW / 2, iH / 2],
   [0, 0, iW / 2, iH / 2],
   [iW / 2, 0, iW / 2, iH / 2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect").attr("x", qx).attr("y", qy)
      .attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1c1522" : "#121b1a").attr("opacity", 0.7);
  });

  // Center lines
  g.append("line").attr("x1", iW / 2).attr("x2", iW / 2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH / 2).attr("y2", iH / 2)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // Quadrant labels
  [
    { label: "Low-trust Left", lx: iW * 0.06, ly: iH * 0.95 },
    { label: "Low-trust Right", lx: iW * 0.56, ly: iH * 0.95 },
    { label: "High-trust Left", lx: iW * 0.06, ly: iH * 0.05 },
    { label: "High-trust Right", lx: iW * 0.56, ly: iH * 0.05 },
  ].forEach(q => {
    g.append("text").attr("x", q.lx).attr("y", q.ly)
      .attr("class", "quadrant-label").text(q.label);
  });

  const colorMap = window.CANDIDATE_COLORS;

  // Filter to candidates that have both perceived positions
  const cands = candidates.filter(c => c.x_per != null && c.y_per != null);

  // Glow filter
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "cand-glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
  const fm = glow.append("feMerge");
  fm.append("feMergeNode").attr("in", "coloredBlur");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  // Draw perception-gap lines (official → perceived)
  cands.forEach(c => {
    if (c.x_off != null) {
      g.append("line")
        .attr("x1", x(c.x_off)).attr("y1", y(c.y_off))
        .attr("x2", x(c.x_per)).attr("y2", y(c.y_per))
        .attr("stroke", colorMap[c.party] || "#888")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.4);
    }
  });

  // Official position dots (hollow)
  cands.forEach(c => {
    if (c.x_off != null) {
      g.append("circle")
        .attr("cx", x(c.x_off)).attr("cy", y(c.y_off))
        .attr("r", 6)
        .attr("fill", "none")
        .attr("stroke", colorMap[c.party] || "#888")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.5);
    }
  });

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  // Perceived position dots (solid, labeled)
  cands.forEach(c => {
    const cx = x(c.x_per);
    const cy = y(c.y_per);
    const col = colorMap[c.party] || "#888";

    g.append("circle")
      .attr("cx", cx).attr("cy", cy)
      .attr("r", 8)
      .attr("fill", col)
      .attr("opacity", 0.9)
      .attr("filter", "url(#cand-glow)")
      .attr("cursor", "pointer")
      .on("mousemove touchmove", function (event) {
        tooltip.style.opacity = "1";
        tooltip.style.left = (event.clientX + 14) + "px";
        tooltip.style.top = (event.clientY - 32) + "px";
        const gap = c.x_off != null
          ? `<br><em>Official x: ${c.x_off.toFixed(2)} (DW-NOM)</em><br><em>Perceived x: ${c.x_per.toFixed(2)} (ANES)</em>`
          : "";
        const flagStr = c.flag ? `<br>⚠ ${c.flagNote}` : "";
        tooltip.innerHTML = `<strong>${c.fullName}</strong>${gap}${flagStr}`;
      })
      .on("mouseleave touchend", () => { tooltip.style.opacity = "0"; });

    // Label — offset to avoid overlap
    const labelOffset = { x: 10, y: -10 };
    // Special cases to avoid crowding
    if (c.id === "clinton_2016") { labelOffset.x = -60; labelOffset.y = -14; }
    if (c.id === "biden_2020")   { labelOffset.x = -56; labelOffset.y = 18; }
    if (c.id === "kamala_2024")  { labelOffset.x = 10;  labelOffset.y = 18; }
    if (c.id === "obama")        { labelOffset.x = 10;  labelOffset.y = -14; }
    if (c.id === "pelosi")       { labelOffset.x = -50; labelOffset.y = -14; }
    if (c.id === "romney")       { labelOffset.x = 10;  labelOffset.y = -14; }
    if (c.id === "trump_2016")   { labelOffset.x = 10;  labelOffset.y = -14; }
    if (c.id === "trump_2020")   { labelOffset.x = 10;  labelOffset.y = 14; }
    if (c.id === "trump_2024")   { labelOffset.x = 10;  labelOffset.y = 28; }
    if (c.id === "aoc")          { labelOffset.x = -38; labelOffset.y = -14; }
    if (c.id === "platner")      { labelOffset.x = -56; labelOffset.y = 18; }
    if (c.id === "sanders_2016") { labelOffset.x = -56; labelOffset.y = 14; }

    g.append("text")
      .attr("x", cx + labelOffset.x)
      .attr("y", cy + labelOffset.y)
      .attr("fill", col)
      .attr("font-size", 11)
      .attr("font-weight", "600")
      .text(c.name + (c.flag ? " ⚠" : ""));
  });

  // Axes
  const xAxis = d3.axisBottom(x).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");
  const yAxis = d3.axisLeft(y).ticks(4)
    .tickFormat(v => v === 0 ? "Anti-institution" : v === 1 ? "Pro-institution" : v === 0.5 ? "Mixed" : "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW / 2).attr("y", iH + 46)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Perceived Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH / 2).attr("y", -46)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Institutional Posture");

  // Legend: solid = perceived, hollow = official policy
  const legendEl = document.getElementById("legend-candidates");
  if (legendEl) {
    legendEl.innerHTML = `
      <div class="legend-item">
        <svg width="16" height="16" style="flex-shrink:0"><circle cx="8" cy="8" r="6" fill="#aaa"/></svg>
        Perceived position (ANES voter placement / estimated)
      </div>
      <div class="legend-item">
        <svg width="16" height="16" style="flex-shrink:0"><circle cx="8" cy="8" r="6" fill="none" stroke="#aaa" stroke-width="1.5"/></svg>
        Official policy position (DW-NOMINATE)
      </div>
      <div class="legend-item" style="font-size:0.75rem;color:#666;margin-top:0.25rem">
        ⚠ = estimated position, no legislative record
      </div>
    `;
  }
};
