/**
 * chart2d.js — The 2D ideology × trust scatter (Act 2)
 * X: left-right ideology  Y: institutional trust
 */

window.drawChart2D = function (voters) {
  const container = document.getElementById("chart-2d");
  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.85, 520);
  const margin = { top: 32, right: 24, bottom: 52, left: 52 };
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
  const quads = [
    { x1: 0, y1: 0, x2: iW / 2, y2: iH / 2, label: "Low-trust Left", lx: iW * 0.12, ly: iH * 0.88 },
    { x1: iW / 2, y1: 0, x2: iW / 2, y2: iH / 2, label: "Low-trust Right", lx: iW * 0.62, ly: iH * 0.88 },
    { x1: 0, y1: 0, x2: iW / 2, y2: iH / 2, label: "High-trust Left", lx: iW * 0.12, ly: iH * 0.12 },
    { x1: iW / 2, y1: 0, x2: iW / 2, y2: iH / 2, label: "High-trust Right", lx: iW * 0.62, ly: iH * 0.12 },
  ];

  // Quadrant rects
  [[0, iH / 2, iW / 2, iH / 2],    // bottom-left
   [iW / 2, iH / 2, iW / 2, iH / 2], // bottom-right
   [0, 0, iW / 2, iH / 2],          // top-left
   [iW / 2, 0, iW / 2, iH / 2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect")
      .attr("x", qx).attr("y", qy)
      .attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1e1826" : "#121b1a")
      .attr("opacity", 0.6);
  });

  // Quadrant labels
  const qlabels = [
    { label: "Low-trust Left",  lx: iW * 0.06,  ly: iH * 0.94 },
    { label: "Low-trust Right", lx: iW * 0.55,  ly: iH * 0.94 },
    { label: "High-trust Left",  lx: iW * 0.06,  ly: iH * 0.06 },
    { label: "High-trust Right", lx: iW * 0.55,  ly: iH * 0.06 },
  ];
  qlabels.forEach(q => {
    g.append("text")
      .attr("x", q.lx).attr("y", q.ly)
      .attr("class", "quadrant-label")
      .text(q.label);
  });

  // Grid lines (center)
  g.append("line")
    .attr("x1", iW / 2).attr("x2", iW / 2)
    .attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18")
    .attr("stroke-dasharray", "4,4");
  g.append("line")
    .attr("x1", 0).attr("x2", iW)
    .attr("y1", iH / 2).attr("y2", iH / 2)
    .attr("stroke", "#ffffff18")
    .attr("stroke-dasharray", "4,4");

  const colorMap = {
    strong_dem: "#5b9cf6",
    lean_dem: "#91bef9",
    independent: "#c97fff",
    lean_rep: "#f09090",
    strong_rep: "#f06060",
  };

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  // Points
  g.selectAll("circle.voter")
    .data(voters)
    .join("circle")
    .attr("class", "voter")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 3)
    .attr("fill", d => colorMap[d.party] || "#888")
    .attr("opacity", 0.5)
    .on("mousemove touchmove", function (event, d) {
      const [px, py] = [event.clientX, event.clientY];
      tooltip.style.opacity = "1";
      tooltip.style.left = (px + 12) + "px";
      tooltip.style.top = (py - 28) + "px";
      const pLabel = d.party.replace(/_/g, " ");
      tooltip.innerHTML =
        `<strong>${pLabel}</strong><br>voted: ${d.vote}<br>` +
        `ideology: ${d.x > 0 ? "+" : ""}${d.x}<br>trust: ${(d.y * 100).toFixed(0)}%`;
    })
    .on("mouseleave touchend", () => { tooltip.style.opacity = "0"; });

  // Axes
  const xAxis = d3.axisBottom(x).ticks(5).tickFormat(v =>
    v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : ""
  );
  const yAxis = d3.axisLeft(y).ticks(4).tickFormat(v =>
    v === 0 ? "No trust" : v === 1 ? "Full trust" : v === 0.5 ? "Medium" : ""
  );

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);

  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  // Axis labels
  g.append("text")
    .attr("x", iW / 2).attr("y", iH + 44)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Policy Ideology");
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -iH / 2).attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Institutional Trust");

  // Legend
  const legendEl = document.getElementById("legend-2d");
  if (legendEl) {
    Object.entries(colorMap).forEach(([key, color]) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<div class="legend-dot" style="background:${color}"></div>${key.replace(/_/g, " ")}`;
      legendEl.appendChild(item);
    });
  }
};
