/**
 * chart1d.js — The conventional 1D ideology spectrum (Act 1)
 * Shows a beeswarm/density view along a single left-right axis.
 */

window.drawChart1D = function (voters) {
  const container = document.getElementById("chart-1d");
  const W = container.clientWidth || 680;
  const H = 140;
  const margin = { top: 28, right: 20, bottom: 40, left: 20 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%")
    .attr("height", H);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([-1, 1]).range([0, iW]);

  // Axis
  g.append("line")
    .attr("x1", 0).attr("x2", iW)
    .attr("y1", iH / 2).attr("y2", iH / 2)
    .attr("stroke", "#444")
    .attr("stroke-width", 1);

  // End labels
  g.append("text").attr("x", 0).attr("y", iH / 2 - 8)
    .attr("text-anchor", "start").attr("class", "axis-label")
    .text("← Left");
  g.append("text").attr("x", iW).attr("y", iH / 2 - 8)
    .attr("text-anchor", "end").attr("class", "axis-label")
    .text("Right →");

  // Beeswarm-style jitter (simulate — no d3-beeswarm dep)
  const colorMap = {
    strong_dem: "#5b9cf6",
    lean_dem: "#91bef9",
    independent: "#c97fff",
    lean_rep: "#f09090",
    strong_rep: "#f06060",
  };

  const rng = (function () {
    let s = 99;
    return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  })();

  voters.forEach(d => {
    g.append("circle")
      .attr("cx", x(d.x))
      .attr("cy", iH / 2 + (rng() - 0.5) * iH * 0.7)
      .attr("r", 2.5)
      .attr("fill", colorMap[d.party] || "#888")
      .attr("opacity", 0.45);
  });

  // Center marker
  g.append("line")
    .attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", 4).attr("y2", iH - 4)
    .attr("stroke", "#ffffff22")
    .attr("stroke-dasharray", "3,3");

  g.append("text").attr("x", x(0)).attr("y", iH + 16)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text('"The Center"');
};
