/**
 * chartGravity.js — Gravitational well: MOVEABLE voter mass + candidate territories (2016)
 *
 * The density terrain shows CONTESTABLE voters only — people whose vote is
 * genuinely up for grabs. Locked-in voters (decided AND engaged) are the wrong
 * audience: they're not moving. What matters for "gravity" is who can pull the
 * moveable mass.
 *
 * Moveability segments (from V161032 preference strength × V161004 campaign interest):
 *   Moveable        = undecided OR disengaged                  (n≈1,025)
 *   Mind-changers   = undecided (soft preference)              (n≈954)
 *   Turnout-conting. = disengaged (low interest, in/out of pool) (n≈181)
 *   Locked-in       = decided AND engaged — shown for contrast (n≈1,701)
 *
 * Voronoi territory borders anchored to Clinton & Trump; Sanders overlaid as
 * the "insurgent left" reference point.
 */

const MOVEABLE_SEGS   = ["undecided_engaged", "undecided_disengaged", "decided_disengaged"];
const UNDECIDED_SEGS  = ["undecided_engaged", "undecided_disengaged"];
const DISENGAGED_SEGS = ["decided_disengaged", "undecided_disengaged"];

window.drawChartGravity = function (voters, candidates) {
  const cands2016 = candidates.filter(c => c.cycle === "2016" && c.x != null && c.y != null);
  if (!cands2016.length) return;

  // Only competitive 2016 candidates in the territory map
  const competitive = cands2016.filter(c => ["clinton_2016", "trump_2016", "sanders_2016"].includes(c.id));

  drawTerritorySection(voters, competitive);
  drawGravityBars(voters, competitive);
};


function drawTerritorySection(allVoters, cands) {
  const container = document.getElementById("chart-gravity");
  if (!container) return;

  // Views by MOVEABILITY — who is actually contestable
  const views = [
    { key: "moveable",   label: "Moveable voters",       sub: "undecided OR disengaged",
      filter: v => MOVEABLE_SEGS.includes(v.segment) },
    { key: "undecided",  label: "Mind-changers",         sub: "soft preference (V161032)",
      filter: v => UNDECIDED_SEGS.includes(v.segment) },
    { key: "disengaged", label: "Turnout-contingent",    sub: "low campaign interest (V161004)",
      filter: v => DISENGAGED_SEGS.includes(v.segment) },
    { key: "locked",     label: "Locked-in (reference)", sub: "decided AND engaged — not contestable",
      filter: v => v.segment === "decided_engaged" },
  ];

  // Tab bar
  const tabBar = document.createElement("div");
  tabBar.style.cssText = "display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap";
  views.forEach((view, i) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.dataset.viewKey = view.key;
    btn.style.cssText = `
      padding: 0.3rem 0.85rem; border-radius: 4px; border: 1px solid #444;
      background: ${i === 0 ? "#333" : "#1a1a1a"}; color: ${i === 0 ? "#ddd" : "#666"};
      cursor: pointer; font-size: 0.8rem; transition: background 0.15s;
    `;
    btn.addEventListener("click", () => {
      tabBar.querySelectorAll("button").forEach(b => {
        b.style.background = "#1a1a1a"; b.style.color = "#666";
      });
      btn.style.background = "#333"; btn.style.color = "#ddd";
      svgWrap.innerHTML = "";
      drawTerritoryMap(svgWrap, allVoters.filter(view.filter), cands, view);
    });
    tabBar.appendChild(btn);
  });
  container.appendChild(tabBar);

  // SVG wrapper div — redrawn on tab switch
  const svgWrap = document.createElement("div");
  container.appendChild(svgWrap);

  // Default: moveable voters
  drawTerritoryMap(svgWrap, allVoters.filter(views[0].filter), cands, views[0]);
}


function drawTerritoryMap(container, voters, cands, view) {
  const W = container.clientWidth || container.parentElement.clientWidth || 680;
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
  const densityData = d3.contourDensity()
    .x(d => xS(d.x))
    .y(d => yS(d.y))
    .size([iW, iH])
    .bandwidth(28)
    .thresholds(14)(voters);

  const maxDensity = d3.max(densityData, d => d.value);

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

  // ── Voronoi territory borders (Clinton + Trump only — general election) ──
  const generalCands = cands.filter(c => c.id !== "sanders_2016");
  if (generalCands.length >= 2) {
    const pts = generalCands.map(c => [xS(c.x), yS(c.y)]);
    const delaunay = d3.Delaunay.from(pts);
    const voronoi = delaunay.voronoi([0, 0, iW, iH]);
    generalCands.forEach((c, i) => {
      g.append("path")
        .attr("d", voronoi.renderCell(i))
        .attr("fill", "none")
        .attr("stroke", colorMap[c.party] || "#888")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.6);
    });
  }

  // ── Center lines ──────────────────────────────────────────────────────
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff22").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff22").attr("stroke-dasharray", "4,4");

  // ── Low-trust zone annotation ─────────────────────────────────────────
  const ltY = yS(0.35);
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", ltY).attr("y2", ltY)
    .attr("stroke", "#ffffff40").attr("stroke-width", 1).attr("stroke-dasharray", "6,3");
  g.append("text").attr("x", 6).attr("y", ltY + 13)
    .attr("fill", "#ffffff60").attr("font-size", 10).text("← low-trust zone");

  // ── Candidate markers ─────────────────────────────────────────────────
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "grav-cand-glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "cb");
  const fm = glow.append("feMerge");
  fm.append("feMergeNode").attr("in", "cb");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  const labelOffsets = {
    clinton_2016: { dx: -8,  dy: -16, anchor: "middle" },
    sanders_2016: { dx: -12, dy: -16, anchor: "end"    },
    trump_2016:   { dx:  12, dy: -16, anchor: "start"  },
  };

  cands.forEach(c => {
    const col = colorMap[c.party] || "#888";
    const cx = xS(c.x), cy = yS(c.y);
    const off = labelOffsets[c.id] || { dx: 12, dy: -14, anchor: "start" };
    const isSanders = c.id === "sanders_2016";

    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 18)
      .attr("fill", col).attr("opacity", 0.12);

    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 10)
      .attr("fill", col).attr("opacity", isSanders ? 0.6 : 0.9)
      .attr("stroke", isSanders ? col : "none")
      .attr("stroke-width", isSanders ? 2 : 0)
      .attr("stroke-dasharray", isSanders ? "3,2" : "none")
      .attr("filter", "url(#grav-cand-glow)");

    g.append("text")
      .attr("x", cx + off.dx).attr("y", cy + off.dy)
      .attr("text-anchor", off.anchor)
      .attr("fill", col).attr("font-size", 12).attr("font-weight", "700")
      .text(c.name + (isSanders ? " *" : ""));
  });

  // Sanders footnote
  if (cands.some(c => c.id === "sanders_2016")) {
    g.append("text").attr("x", 4).attr("y", iH - 4)
      .attr("fill", "#ffffff40").attr("font-size", 9)
      .text("* Sanders position estimated — not on general election ballot");
  }

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

  const n = voters.length;
  const viewLabel = view ? `${view.label} (${view.sub})` : "voters";
  g.append("text").attr("x", iW/2).attr("y", -18)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 11)
    .text(`${viewLabel}  ·  n=${n.toLocaleString()}  ·  Voronoi = Clinton/Trump territory`);
}


function drawGravityBars(voters, cands) {
  const container = document.getElementById("chart-gravity-bars");
  if (!container) return;

  // Only general election candidates for the nearest-neighbor comparison
  const generalCands = cands.filter(c => c.id !== "sanders_2016");
  if (!generalCands.length) return;

  const colorMap = window.CANDIDATE_COLORS;

  function nearest2D(v) {
    let best = null, bestD = Infinity;
    generalCands.forEach(c => {
      const d = Math.hypot(v.x - c.x, v.y - c.y);
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  }
  function nearest1D(v) {
    let best = null, bestD = Infinity;
    generalCands.forEach(c => {
      const d = Math.abs(v.x - c.x);
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  }

  // Moveable voters only — whose well pulls the contestable mass?
  const moveable = voters.filter(v => MOVEABLE_SEGS.includes(v.segment));

  const mass2d = {}, mass1d = {};
  generalCands.forEach(c => { mass2d[c.id] = 0; mass1d[c.id] = 0; });
  moveable.forEach(v => {
    const n2 = nearest2D(v); if (n2) mass2d[n2.id]++;
    const n1 = nearest1D(v); if (n1) mass1d[n1.id]++;
  });

  const barData = generalCands.map(c => ({
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
  const xB = d3.scaleBand().domain(barData.map(d => d.id)).range([0, iW]).padding(0.35);
  const yB = d3.scaleLinear().domain([0, maxVal * 1.12]).range([iH, 0]);
  const sub = d3.scaleBand().domain(["1d", "2d"]).range([0, xB.bandwidth()]).padding(0.08);

  barData.forEach(d => {
    const col = colorMap[d.party] || "#888";

    g.append("rect")
      .attr("x", xB(d.id) + sub("1d")).attr("y", yB(d.d1))
      .attr("width", sub.bandwidth()).attr("height", iH - yB(d.d1))
      .attr("fill", "none").attr("stroke", col).attr("stroke-width", 1.5).attr("opacity", 0.5);

    g.append("rect")
      .attr("x", xB(d.id) + sub("2d")).attr("y", yB(d.d2))
      .attr("width", sub.bandwidth()).attr("height", iH - yB(d.d2))
      .attr("fill", col).attr("opacity", 0.8);

    g.append("text")
      .attr("x", xB(d.id) + sub("2d") + sub.bandwidth()/2).attr("y", yB(d.d2) - 4)
      .attr("text-anchor", "middle").attr("fill", col).attr("font-size", 10).text(d.d2);

    g.append("text")
      .attr("x", xB(d.id) + sub("1d") + sub.bandwidth()/2).attr("y", yB(d.d1) - 4)
      .attr("text-anchor", "middle").attr("fill", col).attr("font-size", 10).attr("opacity", 0.55).text(d.d1);

    g.append("text")
      .attr("x", xB(d.id) + xB.bandwidth()/2).attr("y", iH + 18)
      .attr("text-anchor", "middle").attr("fill", col).attr("font-size", 11).attr("font-weight", "600")
      .text(d.name);

    if (d.id === "clinton_2016" && d.d1 > d.d2) {
      g.append("text")
        .attr("x", xB(d.id) + xB.bandwidth()/2).attr("y", iH + 32)
        .attr("text-anchor", "middle").attr("fill", "#f06060").attr("font-size", 10)
        .text(`−${d.d1 - d.d2} in 2D`);
    }
  });

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
    .text(`Gravity over moveable voters (n=${moveable.length.toLocaleString()}): 2D nearest (solid) vs. 1D nearest (outline)`);

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
