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

  // Axis line
  g.append("line")
    .attr("x1", 0).attr("x2", iW)
    .attr("y1", iH / 2).attr("y2", iH / 2)
    .attr("stroke", "#444")
    .attr("stroke-width", 1);

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

  // Labels drawn AFTER dots so they render on top
  // Dark background rect to ensure readability against dot noise
  [
    { lx: 4,       anchor: "start", label: "← Left"  },
    { lx: iW - 4,  anchor: "end",   label: "Right →"  },
  ].forEach(({ lx, anchor, label }) => {
    const textEl = g.append("text")
      .attr("x", lx).attr("y", iH / 2 - 6)
      .attr("text-anchor", anchor)
      .attr("fill", "#c8c8e8")
      .attr("font-size", 12)
      .attr("font-weight", "600")
      .text(label);

    // Measure approximate width for backdrop rect
    const approxW = label.length * 7.5;
    const bx = anchor === "start" ? lx - 2 : lx - approxW - 2;
    g.insert("rect", "text")
      .attr("x", bx).attr("y", iH / 2 - 19)
      .attr("width", approxW + 4).attr("height", 16)
      .attr("fill", "#0f0f13").attr("opacity", 0.75)
      .attr("rx", 2);
  });

  g.append("text").attr("x", x(0)).attr("y", iH + 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#8888a8").attr("font-size", 11)
    .text('"The Center"');
};
