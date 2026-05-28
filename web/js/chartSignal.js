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
    .attr("fill", "#6a6a85").attr("opacity", d => 0.05 + 0.16 * (d.value / mx)).attr("stroke", "none");
  const contest = [0.09, 0.20];
  g.append("text").attr("x", xS(contest[0])).attr("y", yS(contest[1]) + 4).attr("text-anchor", "middle")
    .attr("fill", "#9a9ab0").attr("font-size", 10).attr("opacity", 0.85).text("contestable bloc (Fig 5)");

  // arrow markers
  const defs = svg.append("defs");
  const mk = (id, col) => { const m = defs.append("marker").attr("id", id).attr("viewBox", "0 0 10 10")
    .attr("refX", 8).attr("refY", 5).attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M0,0L10,5L0,10Z").attr("fill", col); };
  const COMP = "#9aa0c8", NET = "#ffffff";
  mk("comp", COMP); mk("net", NET);

  const S = [-0.22, 0.42];   // Clinton perceived start (estimate)
  const sx = xS(S[0]), sy = yS(S[1]);

  // Decomposed signaling drift (illustrative): a LEFT leg (ideology) and an
  // UP leg (establishment), summing to the net perceived shift.
  const dxL = -0.40, dyU = 0.22;                 // component lengths (illustrative)
  const lx = xS(S[0] + dxL), uy = yS(S[1] + dyU);
  const nx = xS(S[0] + dxL), ny = yS(S[1] + dyU); // net tip = (left, up) corner

  // dashed rectangle completing the decomposition
  g.append("path").attr("d", `M${lx},${sy} L${nx},${ny} M${sx},${uy} L${nx},${ny}`)
    .attr("stroke", COMP).attr("stroke-width", 1).attr("stroke-dasharray", "3,3").attr("opacity", 0.35);

  // LEFT component (ideology) — arrow + label underneath
  g.append("line").attr("x1", sx).attr("y1", sy).attr("x2", lx).attr("y2", sy)
    .attr("stroke", COMP).attr("stroke-width", 2).attr("marker-end", "url(#comp)");
  g.append("text").attr("x", (sx + lx) / 2).attr("y", sy + 18).attr("text-anchor", "middle")
    .attr("fill", COMP).attr("font-size", 11).attr("font-weight", 700).text("← LEFT on ideology");
  g.append("text").attr("x", (sx + lx) / 2).attr("y", sy + 31).attr("text-anchor", "middle")
    .attr("fill", "#8a90b0").attr("font-size", 9).text("TPP reversal, free college (chasing Sanders)");

  // UP component (establishment) — arrow + label to the right
  g.append("line").attr("x1", sx).attr("y1", sy).attr("x2", sx).attr("y2", uy)
    .attr("stroke", COMP).attr("stroke-width", 2).attr("marker-end", "url(#comp)");
  g.append("text").attr("x", sx + 10).attr("y", (sy + uy) / 2 - 4)
    .attr("fill", COMP).attr("font-size", 11).attr("font-weight", 700).text("↑ UP on establishment");
  g.append("text").attr("x", sx + 10).attr("y", (sy + uy) / 2 + 9)
    .attr("fill", "#8a90b0").attr("font-size", 9).text("Goldman speeches, emails, Foundation");

  // NET perceived shift — bold white diagonal
  g.append("line").attr("x1", sx).attr("y1", sy).attr("x2", nx).attr("y2", ny)
    .attr("stroke", NET).attr("stroke-width", 3).attr("marker-end", "url(#net)");
  g.append("text").attr("x", nx + 6).attr("y", ny - 5).attr("fill", NET).attr("font-size", 11).attr("font-weight", 700)
    .text("net perceived shift");

  // Clinton start dot
  g.append("circle").attr("cx", sx).attr("cy", sy).attr("r", 7).attr("fill", "#5b9cf6").attr("stroke", "#fff").attr("stroke-width", 2);
  g.append("text").attr("x", sx + 12).attr("y", sy + 5).attr("fill", "#7fb0ff").attr("font-size", 12).attr("font-weight", 700)
    .text("Clinton (perceived)");

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
