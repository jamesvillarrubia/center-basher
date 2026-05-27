/**
 * chartSwing.js — Highlight swing voters in 2D space (Act 3)
 * Same axes as chart2d, but swing voters glow and non-swing voters fade.
 */

window.drawChartSwing = function (voters) {
  const container = document.getElementById("chart-swing");
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

  // Subtle quadrant fill
  [[0, iH / 2, iW / 2, iH / 2],
   [iW / 2, iH / 2, iW / 2, iH / 2],
   [0, 0, iW / 2, iH / 2],
   [iW / 2, 0, iW / 2, iH / 2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect")
      .attr("x", qx).attr("y", qy)
      .attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1e1826" : "#121b1a")
      .attr("opacity", 0.5);
  });

  // Center lines
  g.append("line").attr("x1", iW / 2).attr("x2", iW / 2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff15").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH / 2).attr("y2", iH / 2)
    .attr("stroke", "#ffffff15").attr("stroke-dasharray", "4,4");

  // Non-swing voters (faded background)
  g.selectAll("circle.bg")
    .data(voters.filter(d => !d.swing))
    .join("circle")
    .attr("class", "bg")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 2.5)
    .attr("fill", "#555")
    .attr("opacity", 0.18);

  // Swing voters (highlighted)
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
  const feMerge = glow.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  g.selectAll("circle.swing")
    .data(voters.filter(d => d.swing))
    .join("circle")
    .attr("class", "swing")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 4.5)
    .attr("fill", "#c97fff")
    .attr("opacity", 0.85)
    .attr("filter", "url(#glow)");

  // "Low trust zone" annotation band
  const bandY = y(0.35);
  g.append("rect")
    .attr("x", 0).attr("y", bandY)
    .attr("width", iW).attr("height", iH - bandY)
    .attr("fill", "#c97fff08")
    .attr("stroke", "#c97fff30")
    .attr("stroke-width", 1);

  g.append("text")
    .attr("x", iW - 8).attr("y", bandY + 14)
    .attr("text-anchor", "end")
    .attr("font-size", 10)
    .attr("fill", "#c97fff80")
    .text("← where swing voters live");

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

  g.append("text").attr("x", iW / 2).attr("y", iH + 44)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Policy Ideology");
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -iH / 2).attr("y", -40)
    .attr("text-anchor", "middle").attr("class", "axis-label")
    .text("Institutional Trust");

  // Legend
  const container2 = document.getElementById("chart-swing");
  const leg = document.createElement("div");
  leg.className = "legend";
  leg.style.padding = "0 0 1rem 0";
  leg.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:#555;opacity:0.5"></div>all voters</div>
    <div class="legend-item"><div class="legend-dot" style="background:#c97fff"></div>swing / cross-party voters</div>
  `;
  container2.after(leg);
};
