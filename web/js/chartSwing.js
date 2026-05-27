/**
 * chartSwing.js — Act 3: Primary vs General voter distributions (single view)
 *
 * Four groups shown simultaneously:
 *   Clinton primary  — dashed blue outline contours
 *   Sanders primary  — dashed purple outline contours
 *   Clinton general  — solid filled blue contours
 *   Trump general    — solid filled red contours
 *
 * Y-axis is the 3-item systemic-trust index (0–1, higher = more trust).
 * Trust centroids labeled directly on the chart, not in a legend.
 *
 * Data note: 2016 institutional trust was floor-heavy — population mean 0.22,
 * median 0.17. The bottom-half clustering is real, not an artifact.
 */

window.drawChartSwing = function (voters) {
  const container = document.getElementById("chart-swing");
  if (!container) return;

  const groups = [
    {
      key: "trump_general",
      label: "Trump general",
      sublabel: "n=1,002 · trust=0.14",
      color: "#f06060",
      solid: true,
      filter: v => v.vote === "trump",
    },
    {
      key: "clinton_general",
      label: "Clinton general",
      sublabel: "n=1,064 · trust=0.28",
      color: "#5b9cf6",
      solid: true,
      filter: v => v.vote === "clinton",
    },
    {
      key: "sanders_primary",
      label: "Sanders primary",
      sublabel: "n=339 · trust=0.22",
      color: "#c97fff",
      solid: false,
      filter: v => v.primary_vote === "sanders",
    },
    {
      key: "clinton_primary",
      label: "Clinton primary",
      sublabel: "n=445 · trust=0.32",
      color: "#91bef9",
      solid: false,
      filter: v => v.primary_vote === "clinton",
    },
  ];

  // Centroids for direct labeling (3-item systemic-trust index)
  const centroids = {
    trump_general:   { x:  0.460, y: 0.136 },
    clinton_general: { x: -0.332, y: 0.277 },
    sanders_primary: { x: -0.421, y: 0.224 },
    clinton_primary: { x: -0.346, y: 0.324 },
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

  // Trust axis is clipped to the populated range: ~91% of voters score below
  // 0.5 and the highest group centroid is 0.32, so plotting full 0–1 wastes the
  // top half. We cap at 0.6 so the four groups' vertical separation is legible.
  const TRUST_MAX = 0.6;
  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, TRUST_MAX]).range([iH, 0]);

  // Ideology left/right shading (no trust-based quadrants — the split would be
  // arbitrary on a clipped axis)
  g.append("rect").attr("x", 0).attr("y", 0).attr("width", iW/2).attr("height", iH)
    .attr("fill", "#1e1826").attr("opacity", 0.5);
  g.append("rect").attr("x", iW/2).attr("y", 0).attr("width", iW/2).attr("height", iH)
    .attr("fill", "#121b1a").attr("opacity", 0.5);
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // Reference line at the population mean trust (0.22)
  const MEAN_TRUST = 0.22;
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", yS(MEAN_TRUST)).attr("y2", yS(MEAN_TRUST))
    .attr("stroke", "#ffffff28").attr("stroke-dasharray", "2,3");
  g.append("text").attr("x", iW - 2).attr("y", yS(MEAN_TRUST) - 4)
    .attr("text-anchor", "end").attr("fill", "#ffffff50").attr("font-size", 9)
    .text("← all-voter average (0.22)");

  // Ideology is 7-pt ordinal; jitter within each cell so contours read as
  // clouds. Centroid dots below still use the exact (un-jittered) means.
  const jittered = window.jitterVoters(voters, { xAmt: 0.13, yAmt: 0.05 });

  // Density contours — draw solid (filled) groups first, then dashed (outline) on top
  const densityGen = d3.contourDensity()
    .x(d => xS(d.x)).y(d => yS(d.y))
    .size([iW, iH]).bandwidth(30).thresholds(8);

  // Draw solid groups (general election) first
  groups.filter(g2 => g2.solid).forEach(grp => {
    const pts = jittered.filter(grp.filter);
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

  // Draw dashed (primary) groups on top — slight fill so they're visible
  groups.filter(g2 => !g2.solid).forEach(grp => {
    const pts = jittered.filter(grp.filter);
    const contours = densityGen(pts);
    const maxVal = d3.max(contours, d => d.value) || 1;

    g.append("g").selectAll("path")
      .data(contours).join("path")
      .attr("d", d3.geoPath())
      .attr("fill", grp.color)
      .attr("opacity", d => 0.02 + 0.09 * (d.value / maxVal))
      .attr("stroke", grp.color).attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3")
      .attr("stroke-opacity", d => 0.35 + 0.60 * (d.value / maxVal));
  });

  // Right-margin labels — sort by centroid y, enforce ≥28px separation
  const lx = iW + 8;
  const labeled = groups.map(grp => ({
    grp,
    c: centroids[grp.key],
    cy: yS(centroids[grp.key].y),
    ly: yS(centroids[grp.key].y),  // label y, adjusted below
  })).sort((a, b) => a.cy - b.cy);

  const minGap = 28;
  for (let i = 1; i < labeled.length; i++) {
    if (labeled[i].ly - labeled[i - 1].ly < minGap) {
      labeled[i].ly = labeled[i - 1].ly + minGap;
    }
  }
  // Pull back up if we pushed past the bottom
  for (let i = labeled.length - 2; i >= 0; i--) {
    if (labeled[i + 1].ly - labeled[i].ly < minGap) {
      labeled[i].ly = labeled[i + 1].ly - minGap;
    }
  }

  labeled.forEach(({ grp, c, cy, ly }) => {
    const cx = xS(c.x);

    // Centroid dot
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 5)
      .attr("fill", grp.color).attr("opacity", 0.9)
      .attr("stroke", "#fff").attr("stroke-width", 1);

    // Leader line from centroid dot to label
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

  // Axes — y-axis is the continuous 3-item systemic-trust index (0–1)
  const xAxis = d3.axisBottom(xS).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");

  const yTickVals = [0, 0.2, 0.4, 0.6];
  const yTickLabels = {
    0:   "No trust",
    0.2: "0.2",
    0.4: "0.4",
    0.6: "0.6 →",
  };
  const yAxis = d3.axisLeft(yS)
    .tickValues(yTickVals)
    .tickFormat(v => yTickLabels[v] || "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 10);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  // Horizontal grid lines
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
    .text("Institutional trust (3-item index)");

  g.append("text").attr("x", iW/2).attr("y", -18)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 11)
    .text("Solid = general election voters  ·  Dashed outline = primary voters");

  const n = k => voters.filter(groups.find(gp => gp.key === k).filter).length;
  window.renderFigSpec("data-swing", {
    population: `<strong>Four overlaid subgroups</strong> — Trump general voters (${n("trump_general")}) and Clinton general voters (${n("clinton_general")}) by reported vote (V162034a); Sanders primary voters (${n("sanders_primary")}) and Clinton primary voters (${n("clinton_primary")}) by primary vote (V161021a). Not all voters.`,
    x: "Ideology (V161126), left −1 to right +1.",
    y: "Institutional trust — 3-item systemic index. <strong>Axis clipped at 0.6</strong> (only ~9% of voters score higher) so the groups don't crush at the bottom.",
    marks: "Density contours per group (solid = general, dashed = primary) + a dot at each group's exact centroid. Dashed line = all-voter average trust (0.22).",
  });
};
