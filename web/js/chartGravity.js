/**
 * chartGravity.js — Gravitational well: voter mass + candidate territories (2016)
 *
 * Visual logic:
 *  1. Density heatmap — d3.contourDensity() over all ANES voters shows WHERE voter
 *     mass actually concentrates. Hot = many voters. Reads like topography.
 *  2. Voronoi territory lines — cell borders from candidate positions, drawn on top
 *     of the density map to show whose territory the dense areas fall in.
 *  3. Candidate markers — large, clearly labeled.
 *  4. Low-trust zone band annotation.
 *
 * Gravity mass bars:
 *  For each 2016 candidate: count voters whose nearest candidate in 2D vs. 1D
 *  is that candidate. The gap = voters Hillary LOSES when the trust axis is added.
 */

window.drawChartGravity = function (voters, candidates) {
  const cands2016 = candidates.filter(c => c.cycle === "2016" && c.x != null && c.y != null);
  if (!cands2016.length) return;

  drawTerritoryMap(voters, cands2016);
  drawGravityBars(voters, cands2016);
};


function drawTerritoryMap(voters, cands2016) {
  const container = document.getElementById("chart-gravity");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.88, 540);
  const margin = { top: 36, right: 28, bottom: 60, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, 1]).range([iH, 0]);
  const colorMap = window.CANDIDATE_COLORS;

  // ── Density heatmap ───────────────────────────────────────────────────
  // Kernel density estimation over all voters. Filled contours show WHERE
  // voter mass concentrates — much more legible than transparent dots.
  const densityData = d3.contourDensity()
    .x(d => xS(d.x))
    .y(d => yS(d.y))
    .size([iW, iH])
    .bandwidth(28)
    .thresholds(14)(voters);

  const maxDensity = d3.max(densityData, d => d.value);

  // Use a warm yellow→white scale against the dark background
  const densityColor = d3.scaleSequential()
    .domain([0, maxDensity])
    .interpolator(d3.interpolate("#0f0f13", "#e8c84a"));

  g.append("g").attr("class", "density-layer")
    .selectAll("path")
    .data(densityData)
    .join("path")
    .attr("d", d3.geoPath())
    .attr("fill", d => densityColor(d.value))
    .attr("opacity", 0.85);

  // ── Voronoi territory borders ─────────────────────────────────────────
  // Drawn ON TOP of density so territory lines are clearly visible.
  const pts = cands2016.map(c => [xS(c.x), yS(c.y)]);
  const delaunay = d3.Delaunay.from(pts);
  const voronoi = delaunay.voronoi([0, 0, iW, iH]);

  cands2016.forEach((c, i) => {
    g.append("path")
      .attr("d", voronoi.renderCell(i))
      .attr("fill", "none")
      .attr("stroke", colorMap[c.party] || "#888")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);
  });

  // ── Center lines ──────────────────────────────────────────────────────
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff22").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff22").attr("stroke-dasharray", "4,4");

  // ── Low-trust zone annotation ─────────────────────────────────────────
  const ltY = yS(0.38);
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", ltY).attr("y2", ltY)
    .attr("stroke", "#ffffff40").attr("stroke-width", 1).attr("stroke-dasharray", "6,3");

  g.append("text").attr("x", 6).attr("y", ltY + 13)
    .attr("fill", "#ffffff60").attr("font-size", 10)
    .text("← low-trust zone");

  // ── Candidate markers ─────────────────────────────────────────────────
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "grav-cand-glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "cb");
  const fm = glow.append("feMerge");
  fm.append("feMergeNode").attr("in", "cb");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  // Label offsets to avoid axis/edge collision
  const labelOffsets = {
    clinton_2016: { dx: -8,  dy: -16, anchor: "middle" },
    sanders_2016: { dx: -12, dy: -16, anchor: "end"    },
    trump_2016:   { dx:  12, dy: -16, anchor: "start"  },
    johnson_2016: { dx:  12, dy:   0, anchor: "start"  },
  };

  cands2016.forEach(c => {
    const col = colorMap[c.party] || "#888";
    const cx = xS(c.x), cy = yS(c.y);
    const off = labelOffsets[c.id] || { dx: 12, dy: -14, anchor: "start" };

    // Halo
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 18)
      .attr("fill", col).attr("opacity", 0.12);

    // Dot
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 10)
      .attr("fill", col).attr("opacity", 0.9)
      .attr("filter", "url(#grav-cand-glow)");

    // Label
    g.append("text")
      .attr("x", cx + off.dx).attr("y", cy + off.dy)
      .attr("text-anchor", off.anchor)
      .attr("fill", col).attr("font-size", 12).attr("font-weight", "700")
      .text(c.name);
  });

  // ── Axes ──────────────────────────────────────────────────────────────
  const xAxis = d3.axisBottom(xS).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");
  const yAxis = d3.axisLeft(yS).ticks(4)
    .tickFormat(v => v === 0 ? "No trust" : v === 1 ? "Full trust" : v === 0.5 ? "Medium" : "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW/2).attr("y", iH + 46)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH/2).attr("y", -50)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Institutional Trust");

  g.append("text").attr("x", iW/2).attr("y", -18)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 11)
    .text("Colored regions = 2D nearest-candidate territory   ·   dots = real ANES voters (n=2,877)");
}


function drawGravityBars(voters, cands2016) {
  const container = document.getElementById("chart-gravity-bars");
  if (!container) return;

  const colorMap = window.CANDIDATE_COLORS;

  function nearest2D(v) {
    let best = null, bestD = Infinity;
    cands2016.forEach(c => {
      const d = Math.hypot(v.x - c.x, v.y - c.y);
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  }
  function nearest1D(v) {
    let best = null, bestD = Infinity;
    cands2016.forEach(c => {
      const d = Math.abs(v.x - c.x);
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  }

  const mass2d = {}, mass1d = {};
  cands2016.forEach(c => { mass2d[c.id] = 0; mass1d[c.id] = 0; });
  voters.forEach(v => {
    const n2 = nearest2D(v); if (n2) mass2d[n2.id]++;
    const n1 = nearest1D(v); if (n1) mass1d[n1.id]++;
  });

  const barData = cands2016.map(c => ({
    id: c.id, name: c.name, party: c.party,
    d2: mass2d[c.id] || 0,
    d1: mass1d[c.id] || 0,
  })).sort((a, b) => b.d2 - a.d2);

  const W = container.clientWidth || 680;
  const H = 220;
  const margin = { top: 36, right: 28, bottom: 56, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const maxVal = Math.max(...barData.map(d => Math.max(d.d1, d.d2)));

  const xB = d3.scaleBand().domain(barData.map(d => d.id))
    .range([0, iW]).padding(0.35);
  const yB = d3.scaleLinear().domain([0, maxVal * 1.12]).range([iH, 0]);
  const sub = d3.scaleBand().domain(["1d", "2d"]).range([0, xB.bandwidth()]).padding(0.08);

  barData.forEach(d => {
    const col = colorMap[d.party] || "#888";

    // 1D bar (outline only)
    g.append("rect")
      .attr("x", xB(d.id) + sub("1d")).attr("y", yB(d.d1))
      .attr("width", sub.bandwidth()).attr("height", iH - yB(d.d1))
      .attr("fill", "none").attr("stroke", col)
      .attr("stroke-width", 1.5).attr("opacity", 0.5);

    // 2D bar (solid)
    g.append("rect")
      .attr("x", xB(d.id) + sub("2d")).attr("y", yB(d.d2))
      .attr("width", sub.bandwidth()).attr("height", iH - yB(d.d2))
      .attr("fill", col).attr("opacity", 0.8);

    // Count label on 2D bar
    g.append("text")
      .attr("x", xB(d.id) + sub("2d") + sub.bandwidth()/2)
      .attr("y", yB(d.d2) - 4)
      .attr("text-anchor", "middle").attr("fill", col).attr("font-size", 10)
      .text(d.d2);

    // 1D count label
    g.append("text")
      .attr("x", xB(d.id) + sub("1d") + sub.bandwidth()/2)
      .attr("y", yB(d.d1) - 4)
      .attr("text-anchor", "middle").attr("fill", col)
      .attr("font-size", 10).attr("opacity", 0.55)
      .text(d.d1);

    // Candidate name
    g.append("text")
      .attr("x", xB(d.id) + xB.bandwidth()/2).attr("y", iH + 18)
      .attr("text-anchor", "middle").attr("fill", col)
      .attr("font-size", 11).attr("font-weight", "600")
      .text(d.name);

    // Delta annotation for Hillary specifically
    if (d.id === "clinton_2016" && d.d1 > d.d2) {
      const lost = d.d1 - d.d2;
      g.append("text")
        .attr("x", xB(d.id) + xB.bandwidth()/2).attr("y", iH + 32)
        .attr("text-anchor", "middle").attr("fill", "#f06060").attr("font-size", 10)
        .text(`−${lost} in 2D`);
    }
  });

  // Axes
  g.append("g").attr("transform", `translate(0,${iH})`)
    .call(d3.axisBottom(xB).tickFormat(""))
    .select(".domain").attr("stroke", "#444");
  g.append("g").call(d3.axisLeft(yB).ticks(4))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 10);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("transform", "rotate(-90)").attr("x", -iH/2).attr("y", -50)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Voters captured");

  g.append("text").attr("x", iW/2).attr("y", -18)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 11)
    .text("Gravity mass: 2D nearest (solid) vs. 1D nearest (outline)");

  // Legend
  const lx = iW - 140, ly = 4;
  g.append("rect").attr("x", lx).attr("y", ly).attr("width", 10).attr("height", 10)
    .attr("fill", "#aaa").attr("opacity", 0.8);
  g.append("text").attr("x", lx + 14).attr("y", ly + 9).attr("fill", "#8888a8").attr("font-size", 10)
    .text("2D (solid)");
  g.append("rect").attr("x", lx).attr("y", ly + 16).attr("width", 10).attr("height", 10)
    .attr("fill", "none").attr("stroke", "#aaa").attr("stroke-width", 1.5).attr("opacity", 0.5);
  g.append("text").attr("x", lx + 14).attr("y", ly + 25).attr("fill", "#8888a8").attr("font-size", 10)
    .text("1D (outline)");
}
