/**
 * chart2d.js — The 2D ideology × trust density map (Act 2)
 *
 * Per-party density contours over ideology (7-pt) × the 3-item systemic-trust
 * index (a composite, ~17 distinct values). Shows WHERE each party's voters
 * concentrate without implying false precision from the underlying ordinal data.
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

  // Ideology is a 7-pt scale (gaps of 0.333); trust is a composite but still
  // lands on a finite set of values. Jitter x by ~0.4 of a half-cell and y by a
  // small amount so contours read as smooth clouds, not a lattice. The jitter is
  // display-only — every centroid/statistic uses the exact stored values.
  const jittered = window.jitterVoters(voters, { xAmt: 0.13, yAmt: 0.05 });

  const densityGen = d3.contourDensity()
    .x(d => xS(d.x))
    .y(d => yS(d.y))
    .weight(d => d.weight ?? 1)
    .size([iW, iH])
    .bandwidth(26)
    .thresholds(8);

  groups.forEach(grp => {
    const pts = jittered.filter(grp.filter);
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

  // ── Small multiples: each party alone, same axes ──────────────────────────
  // The combined map blends the three blobs; these split them so each party's
  // shape is unmistakable. Same ideology × trust axes, same density settings.
  const cols = 3, gap = 14, smW = W;
  const panelW = (smW - gap * (cols - 1)) / cols;
  const pm = { top: 24, right: 6, bottom: 26, left: 8 };
  const pIW = panelW - pm.left - pm.right;
  const pIH = panelW * 0.92 - pm.top - pm.bottom;
  const smH = panelW * 0.92;

  const sm = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${smW} ${smH}`).attr("width", "100%");

  const pX = d3.scaleLinear().domain([-1, 1]).range([0, pIW]);
  const pY = d3.scaleLinear().domain([0, 1]).range([pIH, 0]);
  const pBw = Math.max(8, 26 * pIW / iW);

  groups.forEach((grp, i) => {
    const px = i * (panelW + gap);
    const pg = sm.append("g").attr("transform", `translate(${px + pm.left},${pm.top})`);

    // Panel frame + center lines
    pg.append("rect").attr("x", 0).attr("y", 0).attr("width", pIW).attr("height", pIH)
      .attr("fill", "#121218").attr("stroke", "#2e2e3e").attr("stroke-width", 1);
    pg.append("line").attr("x1", pX(0)).attr("x2", pX(0)).attr("y1", 0).attr("y2", pIH)
      .attr("stroke", "#ffffff14").attr("stroke-dasharray", "3,3");
    pg.append("line").attr("x1", 0).attr("x2", pIW).attr("y1", pY(0.5)).attr("y2", pY(0.5))
      .attr("stroke", "#ffffff14").attr("stroke-dasharray", "3,3");

    // Density blob for this party only
    const pDensity = d3.contourDensity()
      .x(d => pX(d.x)).y(d => pY(d.y)).weight(d => d.weight ?? 1).size([pIW, pIH]).bandwidth(pBw).thresholds(8);
    const pts = jittered.filter(grp.filter);
    const contours = pDensity(pts);
    const mx = d3.max(contours, d => d.value) || 1;
    pg.append("g").selectAll("path").data(contours).join("path")
      .attr("d", d3.geoPath())
      .attr("fill", grp.color)
      .attr("opacity", d => 0.06 + 0.30 * (d.value / mx))
      .attr("stroke", grp.color).attr("stroke-width", 0.5)
      .attr("stroke-opacity", d => 0.15 + 0.5 * (d.value / mx));

    // Title + n
    pg.append("text").attr("x", pIW / 2).attr("y", -9)
      .attr("text-anchor", "middle").attr("fill", grp.color)
      .attr("font-size", 12).attr("font-weight", "700").text(grp.label);

    // Minimal axis hints
    pg.append("text").attr("x", 2).attr("y", pIH + 16)
      .attr("fill", "#8888a8").attr("font-size", 9).text("Left");
    pg.append("text").attr("x", pIW - 2).attr("y", pIH + 16)
      .attr("text-anchor", "end").attr("fill", "#8888a8").attr("font-size", 9).text("Right");
    if (i === 0) {
      pg.append("text").attr("transform", "rotate(-90)")
        .attr("x", -pIH / 2).attr("y", 11).attr("text-anchor", "middle")
        .attr("fill", "#8888a8").attr("font-size", 9).text("↑ more trust");
    }
  });

  const nDem = voters.filter(groups[0].filter).length;
  const nInd = voters.filter(groups[1].filter).length;
  const nRep = voters.filter(groups[2].filter).length;
  window.renderFigSpec("data-2d", {
    population: `<strong>All voters</strong> (n=${nDem + nInd + nRep}), split into three party blocs: Democrat (${nDem}), Independent (${nInd}), Republican (${nRep}).`,
    x: "Ideology (V161126), left −1 to right +1.",
    y: "<strong>Institutional trust — 3-item systemic index</strong> (trust govt + run-for-all + not-waste), 0 (none) to 1 (full).",
    marks: "Top: all three party blobs on one map. Below: the same three split into separate panels (Dem | Independent | Rep) on identical axes. Points jittered (display only); statistics use exact values.",
  });

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
