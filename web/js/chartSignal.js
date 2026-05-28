/**
 * chartSignal.js — Figure 7: position is signaled, not fixed.
 *
 * The thesis's reply to "the trust axis was closed to Clinton": it wasn't. A
 * candidate's perceived position is endogenous to signaling (assimilation–contrast;
 * we literally define position as voter perception). Clinton STEERED hers — and she
 * steered establishment-ward while repositioning LEFT on ideology.
 *
 * ILLUSTRATIVE (Tier 4): the start point and the signaling-move magnitudes are
 * estimates, not ANES-measured. The data-grounded claim is the DIRECTION — her
 * deliberate moves loaded the ideology (choice) axis and the wrong end of the
 * establishment axis, away from the contestable low-trust bloc.
 */

window.drawChartSignal = function (voters) {
  const container = document.getElementById("chart-signal");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.8, 500);
  const margin = { top: 30, right: 30, bottom: 52, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;
  const TMAX = 0.7;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, TMAX]).range([iH, 0]);

  // shading + center line
  g.append("rect").attr("width", iW/2).attr("height", iH).attr("fill", "#1e1826").attr("opacity", 0.5);
  g.append("rect").attr("x", iW/2).attr("width", iW/2).attr("height", iH).attr("fill", "#121b1a").attr("opacity", 0.5);
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH).attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // contestable moveable blob (faint), the target
  const jit = window.jitterVoters(voters, { xAmt: 0.13, yAmt: 0.05 });
  const mv = jit.filter(v => (v.segment === "undecided_engaged" || v.segment === "decided_disengaged") && v.x != null);
  const dens = d3.contourDensity().x(d => xS(d.x)).y(d => yS(d.y)).weight(d => d.weight ?? 1)
    .size([iW, iH]).bandwidth(26).thresholds(6)(mv);
  const mx = d3.max(dens, d => d.value) || 1;
  g.append("g").selectAll("path").data(dens).join("path").attr("d", d3.geoPath())
    .attr("fill", "#f0c040").attr("opacity", d => 0.03 + 0.13 * (d.value / mx)).attr("stroke", "none");
  const contest = [0.09, 0.20];
  g.append("text").attr("x", xS(contest[0])).attr("y", yS(contest[1]) + 4).attr("text-anchor", "middle")
    .attr("fill", "#f0c040").attr("font-size", 10).attr("opacity", 0.8).text("contestable bloc");

  // arrow marker factory
  const defs = svg.append("defs");
  const mk = (id, col) => { const m = defs.append("marker").attr("id", id).attr("viewBox", "0 0 10 10")
    .attr("refX", 8).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M0,0L10,5L0,10Z").attr("fill", col); };
  mk("sig", "#f09090"); mk("net", "#fff"); mk("need", "#6be08a");

  const S = [-0.35, 0.55];   // Clinton perceived start (estimate)
  const sx = xS(S[0]), sy = yS(S[1]);

  // individual signaling moves (illustrative Δ in data units)
  const moves = [
    { dx: 0.00, dy: 0.05, label: "Goldman speeches" },
    { dx: 0.00, dy: 0.05, label: "emails · foundation · superdelegates", off: -1 },
    { dx: -0.10, dy: 0.04, label: "TPP: “gold standard” → opposed (flip)" },
    { dx: -0.12, dy: 0.00, label: "adopt Sanders tuition / min-wage" },
  ];
  // draw faint component arrows fanning from start
  moves.forEach(m => {
    g.append("line").attr("x1", sx).attr("y1", sy).attr("x2", xS(S[0] + m.dx)).attr("y2", yS(S[1] + m.dy))
      .attr("stroke", "#f09090").attr("stroke-width", 1.3).attr("opacity", 0.7).attr("marker-end", "url(#sig)");
  });

  // net drift (sum) — thick white
  const net = moves.reduce((a, m) => [a[0] + m.dx, a[1] + m.dy], [0, 0]);
  g.append("line").attr("x1", sx).attr("y1", sy).attr("x2", xS(S[0] + net[0])).attr("y2", yS(S[1] + net[1]))
    .attr("stroke", "#fff").attr("stroke-width", 3).attr("marker-end", "url(#net)");
  g.append("text").attr("x", xS(S[0] + net[0]) + 4).attr("y", yS(S[1] + net[1]) - 10)
    .attr("text-anchor", "start").attr("fill", "#fff").attr("font-size", 11).attr("font-weight", 700)
    .text("her actual drift: LEFT + UP");
  g.append("text").attr("x", xS(S[0] + net[0]) + 4).attr("y", yS(S[1] + net[1]) + 3)
    .attr("text-anchor", "start").attr("fill", "#aaa").attr("font-size", 9)
    .text("(not “to the center”)");

  // needed direction (toward contestable bloc) — dashed green, scaled to similar length
  const nd = [contest[0] - S[0], contest[1] - S[1]]; const nlen = Math.hypot(nd[0], nd[1]);
  const scale = 0.42 / nlen;
  g.append("line").attr("x1", sx).attr("y1", sy).attr("x2", xS(S[0] + nd[0] * scale)).attr("y2", yS(S[1] + nd[1] * scale))
    .attr("stroke", "#6be08a").attr("stroke-width", 2).attr("stroke-dasharray", "5,4").attr("marker-end", "url(#need)");
  g.append("text").attr("x", xS(S[0] + nd[0] * scale) + 6).attr("y", yS(S[1] + nd[1] * scale) + 4)
    .attr("fill", "#6be08a").attr("font-size", 10).attr("font-weight", 700).text("toward the bloc");

  // Clinton start dot
  g.append("circle").attr("cx", sx).attr("cy", sy).attr("r", 7).attr("fill", "#5b9cf6").attr("stroke", "#fff").attr("stroke-width", 2);
  g.append("text").attr("x", sx).attr("y", sy - 12).attr("text-anchor", "middle").attr("fill", "#5b9cf6")
    .attr("font-size", 12).attr("font-weight", 700).text("Clinton (perceived)");

  // move labels — stacked list at upper-left
  const lg = g.append("g").attr("transform", "translate(6,8)");
  lg.append("text").attr("x", 0).attr("y", 0).attr("fill", "#f09090").attr("font-size", 10).attr("font-weight", 700).text("Signaling moves:");
  moves.forEach((m, i) => lg.append("text").attr("x", 0).attr("y", 14 + i * 13).attr("fill", "#c8a0a0").attr("font-size", 9)
    .text(`• ${m.label}  (${m.dx < 0 ? "← left" : ""}${m.dy > 0 ? (m.dx < 0 ? ", " : "") + "↑ establishment" : ""})`));

  // axes
  g.append("g").attr("transform", `translate(0,${iH})`).call(d3.axisBottom(xS).ticks(5)
    .tickFormat(v => v===-1?"← Left":v===1?"Right →":v===0?"Center":"")).selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(d3.axisLeft(yS).tickValues([0,0.35,0.7]).tickFormat(v => v===0?"Outsider":v===0.7?"Establishment":"")).selectAll("text").attr("fill", "#8888a8").attr("font-size", 10);
  g.selectAll(".domain,.tick line").attr("stroke", "#444");
  g.append("text").attr("x", iW/2).attr("y", iH + 42).attr("text-anchor", "middle").attr("class", "axis-label").text("Policy Ideology  (perceived)");
  g.append("text").attr("transform", "rotate(-90)").attr("x", -iH/2).attr("y", -48).attr("text-anchor", "middle").attr("class", "axis-label").text("Establishment ↔ outsider (perceived)");

  window.renderFigSpec("data-signal", {
    population: "Clinton's perceived position (illustrative) vs the contestable moveable bloc (real, faint). Signaling moves are estimated vectors.",
    x: "Perceived ideology (left −1 to right +1).",
    y: "Perceived establishment ↔ outsider — the trust axis from the candidate's side. Estimated (no direct ANES measure).",
    marks: "Red = her actual signaling moves (sum = white 'where she signaled'). Green dashed = direction toward the contestable bloc. ILLUSTRATIVE / Tier 4 — direction is the claim, not the magnitudes.",
  });
};
