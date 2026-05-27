/**
 * chart1d.js — The conventional 1D ideology spectrum (Act 1)
 *
 * A smoothed density (violin) of voters along the single left-right axis.
 * Ideology (V161126) is a 7-point scale; this is a Gaussian KDE of those
 * levels, so the curve is a smoothed read of discrete data — it shows the
 * shape ("most people near the middle") without per-level precision.
 */

window.drawChart1D = function (voters) {
  const container = document.getElementById("chart-1d");
  const W = container.clientWidth || 680;
  const H = 180;
  const margin = { top: 24, right: 20, bottom: 44, left: 20 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;
  const mid = iH / 2;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%")
    .attr("height", H);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([-1, 1]).range([0, iW]);

  // Left → center → right gradient echoing the political spectrum
  const grad = svg.append("defs").append("linearGradient")
    .attr("id", "spectrum-grad")
    .attr("x1", "0%").attr("x2", "100%");
  [[0, "#5b9cf6"], [0.5, "#c97fff"], [1, "#f06060"]].forEach(([o, c]) =>
    grad.append("stop").attr("offset", `${o * 100}%`).attr("stop-color", c));

  // ── Weighted Gaussian KDE over ideology (7-level scale) ───────────────────
  const data = voters.filter(d => d.x != null).map(d => [d.x, d.weight ?? 1]);
  const totalW = data.reduce((s, [, w]) => s + w, 0);
  const bw = 0.12;
  const xs = d3.range(-1, 1.001, 0.02);
  const dens = xs.map(xv => {
    let s = 0;
    for (const [v, w] of data) { const u = (xv - v) / bw; s += w * Math.exp(-0.5 * u * u); }
    return s / (totalW * bw * Math.sqrt(2 * Math.PI));
  });
  const maxD = d3.max(dens) || 1;
  const half = mid - 4;                       // max half-height of the violin
  const pts = xs.map((xv, i) => ({ x: xv, d: dens[i] / maxD }));

  const area = d3.area()
    .x(d => x(d.x))
    .y0(d => mid - d.d * half)
    .y1(d => mid + d.d * half)
    .curve(d3.curveBasis);

  g.append("path")
    .datum(pts)
    .attr("d", area)
    .attr("fill", "url(#spectrum-grad)")
    .attr("opacity", 0.7)
    .attr("stroke", "url(#spectrum-grad)")
    .attr("stroke-width", 1);

  // Baseline axis line
  g.append("line")
    .attr("x1", 0).attr("x2", iW).attr("y1", mid).attr("y2", mid)
    .attr("stroke", "#ffffff30").attr("stroke-width", 1);

  // Tick marks at the 7 actual ideology levels (honest about discreteness)
  [-1, -0.667, -0.333, 0, 0.333, 0.667, 1].forEach(v => {
    g.append("line")
      .attr("x1", x(v)).attr("x2", x(v))
      .attr("y1", mid - 3).attr("y2", mid + 3)
      .attr("stroke", "#ffffff40").attr("stroke-width", 1);
  });

  // Center marker
  g.append("line")
    .attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", 2).attr("y2", iH - 2)
    .attr("stroke", "#ffffff22")
    .attr("stroke-dasharray", "3,3");

  // Left / Right labels with dark backdrop for readability
  [
    { lx: 4,      anchor: "start", label: "← Left"  },
    { lx: iW - 4, anchor: "end",   label: "Right →" },
  ].forEach(({ lx, anchor, label }) => {
    const approxW = label.length * 7.5;
    const bx = anchor === "start" ? lx - 2 : lx - approxW - 2;
    g.insert("rect")
      .attr("x", bx).attr("y", -2).attr("width", approxW + 4).attr("height", 16)
      .attr("fill", "#0f0f13").attr("opacity", 0.75).attr("rx", 2);
    g.append("text")
      .attr("x", lx).attr("y", 11)
      .attr("text-anchor", anchor)
      .attr("fill", "#c8c8e8").attr("font-size", 12).attr("font-weight", "600")
      .text(label);
  });

  g.append("text").attr("x", x(0)).attr("y", iH + 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#8888a8").attr("font-size", 11)
    .text('"The Center"');

  window.renderFigSpec("data-1d", {
    population: `<strong>All voters</strong> with a valid ideology score (n=${data.length}).`,
    x: "Ideology self-placement (V161126), 7 levels, left −1 to right +1.",
    y: "Relative voter density (smoothed). Height = how many voters sit near that point.",
    marks: "A single Gaussian KDE (bandwidth 0.12) of the 7-level scale — a smoothed shape, not per-level counts.",
  });
};
