/**
 * chartGravity.js — Gravitational well visualization
 *
 * Each candidate exerts "gravity" on nearby voters in 2D (ideology × trust) space.
 * Gravity mass = voters whose nearest candidate (in 2D Euclidean distance) is this one.
 *
 * Three panels:
 *   1. Territory map — each voter dot colored by their 2D-nearest candidate
 *   2. Low-trust zone close-up — shows Hillary's territory gap in the low-trust center
 *   3. Gravity mass bar chart — Clinton vs. Sanders vs. Trump (2016 candidates only)
 *
 * Based on research: Lenz (2012) "Follow the Leader" — voters adopt candidate views
 * as identity function over time. Candidate proximity in 2D predicts who they follow.
 *
 * Drawn into: #chart-gravity, #chart-gravity-bars
 */

window.drawChartGravity = function (voters, candidates) {
  const container = document.getElementById("chart-gravity");
  if (!container) return;

  // Use only 2016 candidates for the primary analysis
  const cands2016 = candidates.filter(c => c.cycle === "2016" && c.x != null && c.y != null);

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.85, 520);
  const margin = { top: 36, right: 28, bottom: 56, left: 58 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([iH, 0]);

  const colorMap = window.CANDIDATE_COLORS;

  // Assign each voter their nearest 2016 candidate by 2D Euclidean distance
  function nearest2D(voter) {
    let best = null, bestDist = Infinity;
    cands2016.forEach(c => {
      const d = Math.hypot(voter.x - c.x, voter.y - c.y);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    return { cand: best, dist: bestDist };
  }

  function nearest1D(voter) {
    let best = null, bestDist = Infinity;
    cands2016.forEach(c => {
      const d = Math.abs(voter.x - c.x);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    return { cand: best, dist: bestDist };
  }

  // Compute assignments
  const assigned = voters.map(v => {
    const n2d = nearest2D(v);
    const n1d = nearest1D(v);
    return { ...v, nearest2d: n2d.cand, nearest1d: n1d.cand, switched: n2d.cand?.id !== n1d.cand?.id };
  });

  // Quadrant fills
  [[0, iH / 2, iW / 2, iH / 2],
   [iW / 2, iH / 2, iW / 2, iH / 2],
   [0, 0, iW / 2, iH / 2],
   [iW / 2, 0, iW / 2, iH / 2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect").attr("x", qx).attr("y", qy)
      .attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1c1522" : "#121b1a").attr("opacity", 0.6);
  });

  g.append("line").attr("x1", iW / 2).attr("x2", iW / 2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff15").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH / 2).attr("y2", iH / 2)
    .attr("stroke", "#ffffff15").attr("stroke-dasharray", "4,4");

  // Voter dots colored by nearest 2D candidate
  g.selectAll("circle.voter")
    .data(assigned)
    .join("circle")
    .attr("class", "voter")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 2.5)
    .attr("fill", d => d.nearest2d ? colorMap[d.nearest2d.party] || "#888" : "#555")
    .attr("opacity", d => d.switched ? 0.85 : 0.35);

  // "Switched" voters (1D said one candidate, 2D says another) — highlight
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "grav-glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "cb");
  const fm = glow.append("feMerge");
  fm.append("feMergeNode").attr("in", "cb");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  g.selectAll("circle.switched")
    .data(assigned.filter(d => d.switched))
    .join("circle")
    .attr("class", "switched")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 4)
    .attr("fill", d => d.nearest2d ? colorMap[d.nearest2d.party] || "#888" : "#555")
    .attr("opacity", 0.9)
    .attr("filter", "url(#grav-glow)");

  // Candidate dots
  cands2016.forEach(c => {
    const col = colorMap[c.party] || "#888";
    g.append("circle")
      .attr("cx", xScale(c.x)).attr("cy", yScale(c.y))
      .attr("r", 12)
      .attr("fill", col).attr("opacity", 0.25);
    g.append("circle")
      .attr("cx", xScale(c.x)).attr("cy", yScale(c.y))
      .attr("r", 8)
      .attr("fill", col).attr("opacity", 0.9);
    g.append("text")
      .attr("x", xScale(c.x) + 12).attr("y", yScale(c.y) - 10)
      .attr("fill", col).attr("font-size", 11).attr("font-weight", "700")
      .text(c.name);
  });

  // Axes
  const xAxis = d3.axisBottom(xScale).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");
  const yAxis = d3.axisLeft(yScale).ticks(4)
    .tickFormat(v => v === 0 ? "Anti-institution" : v === 1 ? "Pro-institution" : "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW / 2).attr("y", iH + 46)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH / 2).attr("y", -46)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Institutional Trust");

  // Title annotation
  g.append("text").attr("x", iW / 2).attr("y", -18)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 12)
    .text("Voter territories in 2D — dots show nearest candidate");

  // ── Gravity mass bar chart ──────────────────────────────────────────────
  drawGravityBars(assigned, cands2016);
};


function drawGravityBars(assigned, cands2016) {
  const container = document.getElementById("chart-gravity-bars");
  if (!container) return;

  // Count 2D and 1D nearest for each candidate
  const mass2d = {}, mass1d = {};
  cands2016.forEach(c => { mass2d[c.id] = 0; mass1d[c.id] = 0; });

  assigned.forEach(v => {
    if (v.nearest2d) mass2d[v.nearest2d.id] = (mass2d[v.nearest2d.id] || 0) + 1;
    if (v.nearest1d) mass1d[v.nearest1d.id] = (mass1d[v.nearest1d.id] || 0) + 1;
  });

  const W = container.clientWidth || 680;
  const H = 200;
  const margin = { top: 28, right: 28, bottom: 52, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const barData = cands2016.map(c => ({
    id: c.id, name: c.name, party: c.party,
    mass2d: mass2d[c.id] || 0,
    mass1d: mass1d[c.id] || 0,
  }));

  const total = assigned.length;
  const maxMass = Math.max(...barData.map(d => Math.max(d.mass2d, d.mass1d)));
  const colorMap = window.CANDIDATE_COLORS;

  const xB = d3.scaleBand()
    .domain(barData.map(d => d.id))
    .range([0, iW]).padding(0.3);
  const yB = d3.scaleLinear().domain([0, maxMass * 1.1]).range([iH, 0]);

  const subBand = d3.scaleBand()
    .domain(["1d", "2d"])
    .range([0, xB.bandwidth()]).padding(0.1);

  // 1D bars (hollow/outline)
  barData.forEach(d => {
    const col = colorMap[d.party] || "#888";
    g.append("rect")
      .attr("x", xB(d.id) + subBand("1d"))
      .attr("y", yB(d.mass1d))
      .attr("width", subBand.bandwidth())
      .attr("height", iH - yB(d.mass1d))
      .attr("fill", "none")
      .attr("stroke", col)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.5);

    // 2D bars (solid)
    g.append("rect")
      .attr("x", xB(d.id) + subBand("2d"))
      .attr("y", yB(d.mass2d))
      .attr("width", subBand.bandwidth())
      .attr("height", iH - yB(d.mass2d))
      .attr("fill", col)
      .attr("opacity", 0.8);

    // Label
    g.append("text")
      .attr("x", xB(d.id) + xB.bandwidth() / 2)
      .attr("y", iH + 18)
      .attr("text-anchor", "middle")
      .attr("fill", col)
      .attr("font-size", 11)
      .attr("font-weight", "600")
      .text(d.name);

    // 2D count label
    g.append("text")
      .attr("x", xB(d.id) + subBand("2d") + subBand.bandwidth() / 2)
      .attr("y", yB(d.mass2d) - 4)
      .attr("text-anchor", "middle")
      .attr("fill", col)
      .attr("font-size", 9)
      .text(d.mass2d);
  });

  // Axes
  g.append("g").attr("transform", `translate(0,${iH})`)
    .call(d3.axisBottom(xB).tickFormat(""))
    .selectAll(".domain, .tick line").attr("stroke", "#444");
  g.append("g")
    .call(d3.axisLeft(yB).ticks(4))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 10);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", -iH / 2).attr("y", -48)
    .attr("transform", "rotate(-90)").attr("text-anchor", "middle")
    .attr("class", "axis-label").text("Voters captured");

  g.append("text").attr("x", iW / 2).attr("y", -14)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 12)
    .text("Gravity mass: voters nearest each candidate");

  // Legend
  const legG = g.append("g").attr("transform", `translate(${iW - 160}, 0)`);
  legG.append("rect").attr("width", 10).attr("height", 10)
    .attr("fill", "#aaa").attr("opacity", 0.8);
  legG.append("text").attr("x", 14).attr("y", 9).attr("fill", "#8888a8").attr("font-size", 10)
    .text("2D nearest (solid)");
  legG.append("rect").attr("y", 16).attr("width", 10).attr("height", 10)
    .attr("fill", "none").attr("stroke", "#aaa").attr("stroke-width", 1.5).attr("opacity", 0.5);
  legG.append("text").attr("x", 14).attr("y", 25).attr("fill", "#8888a8").attr("font-size", 10)
    .text("1D nearest (outline)");
}
