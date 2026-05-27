/**
 * chartCandidates.js — Candidate positions in ideology × institutional posture space.
 *
 * Design:
 *  - Dots only in the SVG (no inline text labels — they overlap hopelessly)
 *  - Cluster annotation regions for the four natural groups
 *  - Hover tooltip with full source notes
 *  - Legend grid rendered below the chart in HTML
 */

window.drawChartCandidates = function (candidates) {
  const container = document.getElementById("chart-candidates");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.92, 560);
  const margin = { top: 48, right: 32, bottom: 60, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const y = d3.scaleLinear().domain([0, 1]).range([iH, 0]);

  const colorMap = window.CANDIDATE_COLORS;

  // ── Background quadrants ───────────────────────────────────────────────
  const quads = [
    { x: 0,      yPos: iH/2,  w: iW/2, h: iH/2, fill: "#1c1522" },
    { x: iW/2,   yPos: iH/2,  w: iW/2, h: iH/2, fill: "#1c1522" },
    { x: 0,      yPos: 0,     w: iW/2, h: iH/2, fill: "#121b1a" },
    { x: iW/2,   yPos: 0,     w: iW/2, h: iH/2, fill: "#121b1a" },
  ];
  quads.forEach(q => g.append("rect")
    .attr("x", q.x).attr("y", q.yPos).attr("width", q.w).attr("height", q.h)
    .attr("fill", q.fill).attr("opacity", 0.65));

  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff20").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff20").attr("stroke-dasharray", "4,4");

  // ── Cluster annotation ellipses ────────────────────────────────────────
  // Each cluster is an approximate bounding region for a group of candidates.
  // These communicate the thesis visually: the groups ARE the story.
  const clusters = [
    {
      label: "Establishment\nDemocrats",
      cx: -0.37, cy: 0.82, rx: 0.18, ry: 0.16,
      color: "#5b9cf6", note: "Clinton, Biden, Kamala, Pelosi, Obama",
    },
    {
      label: "Insurgent\nLeft",
      cx: -0.61, cy: 0.16, rx: 0.12, ry: 0.10,
      color: "#c97fff", note: "Sanders, AOC, Platner",
    },
    {
      label: "Populist\nRight",
      cx: 0.36, cy: 0.13, rx: 0.22, ry: 0.10,
      color: "#f06060", note: "Trump 2016–2024",
    },
    {
      label: "Establishment\nRight",
      cx: 0.31, cy: 0.79, rx: 0.13, ry: 0.10,
      color: "#f09090", note: "Romney",
    },
  ];

  clusters.forEach(cl => {
    g.append("ellipse")
      .attr("cx", x(cl.cx)).attr("cy", y(cl.cy))
      .attr("rx", cl.rx * iW / 2).attr("ry", cl.ry * iH)
      .attr("fill", cl.color).attr("opacity", 0.07)
      .attr("stroke", cl.color).attr("stroke-width", 1).attr("stroke-opacity", 0.25);

    // Cluster label — place outside the ellipse
    const lx = x(cl.cx);
    const ly = y(cl.cy) - cl.ry * iH - 8;
    cl.label.split("\n").forEach((line, i) => {
      g.append("text")
        .attr("x", lx).attr("y", ly + i * 13)
        .attr("text-anchor", "middle")
        .attr("fill", cl.color).attr("font-size", 10).attr("opacity", 0.7)
        .text(line);
    });
  });

  // ── Tooltip ────────────────────────────────────────────────────────────
  const tooltip = d3.select("body").selectAll(".candidate-tooltip").data([0]).join("div")
    .attr("class", "tooltip candidate-tooltip");

  // ── Candidate dots ─────────────────────────────────────────────────────
  const cands = candidates.filter(c => c.x_per != null && c.y_per != null);

  // Glow filter
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "cand-glow2");
  glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "cb");
  const fm = glow.append("feMerge");
  fm.append("feMergeNode").attr("in", "cb");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  // Perception-gap lines (official → perceived), only where DW-NOMINATE exists
  cands.forEach(c => {
    if (c.x_off == null) return;
    g.append("line")
      .attr("x1", x(c.x_off)).attr("y1", y(c.y_off))
      .attr("x2", x(c.x_per)).attr("y2", y(c.y_per))
      .attr("stroke", colorMap[c.party] || "#888")
      .attr("stroke-width", 1).attr("stroke-dasharray", "3,3").attr("opacity", 0.3);
  });

  // Official position (hollow ring)
  cands.forEach(c => {
    if (c.x_off == null) return;
    g.append("circle")
      .attr("cx", x(c.x_off)).attr("cy", y(c.y_off)).attr("r", 5)
      .attr("fill", "none")
      .attr("stroke", colorMap[c.party] || "#888").attr("stroke-width", 1.5)
      .attr("opacity", 0.35);
  });

  // Perceived position (solid dot, interactive)
  const dotG = g.append("g");
  cands.forEach(c => {
    const col = colorMap[c.party] || "#888";
    const cx = x(c.x_per), cy = y(c.y_per);

    dotG.append("circle")
      .attr("cx", cx).attr("cy", cy).attr("r", 9)
      .attr("fill", col).attr("opacity", 0.85)
      .attr("filter", "url(#cand-glow2)")
      .attr("cursor", "pointer")
      .attr("stroke", c.flag ? "#ffcc44" : "none")
      .attr("stroke-width", 1.5)
      .on("mousemove touchmove", function (event) {
        const gapNote = c.x_off != null
          ? `<div style="color:#888;font-size:0.75rem;margin-top:0.3rem">
               Official (DW-NOM): ${c.x_off.toFixed(2)} | Perceived (ANES): ${c.x_per.toFixed(2)}
             </div>`
          : "";
        const flagNote = c.flag
          ? `<div style="color:#ffcc44;font-size:0.75rem;margin-top:0.3rem">⚠ ${c.flagNote}</div>`
          : "";
        tooltip
          .style("opacity", "1")
          .style("left", (event.clientX + 14) + "px")
          .style("top", (event.clientY - 36) + "px")
          .html(`<strong>${c.fullName}</strong>${gapNote}${flagNote}
                 <div style="color:#888;font-size:0.75rem;margin-top:0.3rem">${c.ySource.slice(0,120)}…</div>`);
      })
      .on("mouseleave touchend", () => tooltip.style("opacity", "0"));

    // Cycle badge inside dot — tiny text
    const cycleShort = c.cycle === "historical" ? "08" :
                       c.cycle === "current"    ? "now" :
                       c.cycle.slice(2);
    dotG.append("text")
      .attr("x", cx).attr("y", cy + 4)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(0,0,0,0.6)")
      .attr("font-size", 7).attr("font-weight", "700")
      .attr("pointer-events", "none")
      .text(cycleShort);
  });

  // ── Axes ───────────────────────────────────────────────────────────────
  const xAxis = d3.axisBottom(x).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");
  const yAxis = d3.axisLeft(y).ticks(4)
    .tickFormat(v => v === 0 ? "Anti-institution" : v === 1 ? "Pro-institution" : v === 0.5 ? "Mixed" : "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW/2).attr("y", iH + 46)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Perceived Ideology  (left ← → right)");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH/2).attr("y", -50)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Institutional Posture");

  // ── Legend grid (HTML below the chart) ────────────────────────────────
  const legendEl = document.getElementById("legend-candidates");
  if (!legendEl) return;

  legendEl.innerHTML = "";

  // Key note about perception gap
  const note = document.createElement("p");
  note.style.cssText = "font-size:0.8rem;color:#666;margin-bottom:0.75rem";
  note.innerHTML = `Solid dot = perceived position (ANES/estimated). Hollow ring = official DW-NOMINATE.
    Yellow border = estimated position. Number inside = election year (last 2 digits).`;
  legendEl.appendChild(note);

  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.4rem 1rem";

  const sorted = [...cands].sort((a, b) => a.cycle.localeCompare(b.cycle) || a.name.localeCompare(b.name));
  sorted.forEach(c => {
    const col = colorMap[c.party] || "#888";
    const item = document.createElement("div");
    item.style.cssText = "display:flex;align-items:center;gap:0.4rem;font-size:0.8rem";
    item.innerHTML = `
      <svg width="16" height="16" style="flex-shrink:0">
        <circle cx="8" cy="8" r="6" fill="${col}" opacity="0.85"
          stroke="${c.flag ? '#ffcc44' : 'none'}" stroke-width="1.5"/>
      </svg>
      <span style="color:${col};font-weight:600">${c.name}</span>
      <span style="color:#666">${c.fullName.replace(c.name,'').replace(/[()]/g,'').trim()}</span>
    `;
    grid.appendChild(item);
  });
  legendEl.appendChild(grid);
};
