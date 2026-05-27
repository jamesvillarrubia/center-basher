/**
 * chartSwing.js — Figure 4: how each coalition moved from primary to general.
 *
 * Same field as Figs 2–3 (the Dem/Ind/Rep party blobs). On top, each candidate's
 * voter centroid is shown twice — hollow = primary voters, filled = general-
 * election voters — joined by a line showing the shift. Sanders has no general
 * line (not on the ballot).
 *
 * The story is the movement, by MEAN (the framing the numbers use):
 *   Clinton: ideology holds, trust falls 0.32 → 0.28 (the broad fall electorate
 *            diluted her most-trusting primary base).
 *   Trump:   ideology moves toward center 0.51 → 0.46; low trust ~flat (0.12→0.14).
 */

const SWING_TRUST_MAX = 0.6;  // weighted means via window.wMean

window.drawChartSwing = function (voters) {
  const container = document.getElementById("chart-swing");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.82, 520);
  const margin = { top: 30, right: 40, bottom: 56, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, SWING_TRUST_MAX]).range([iH, 0]);

  // Ideology shading + center line
  g.append("rect").attr("width", iW/2).attr("height", iH).attr("fill", "#1e1826").attr("opacity", 0.5);
  g.append("rect").attr("x", iW/2).attr("width", iW/2).attr("height", iH).attr("fill", "#121b1a").attr("opacity", 0.5);
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // all-voter average trust reference
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", yS(0.22)).attr("y2", yS(0.22))
    .attr("stroke", "#ffffff28").attr("stroke-dasharray", "2,3");
  g.append("text").attr("x", 4).attr("y", yS(0.22) - 4)
    .attr("fill", "#ffffff50").attr("font-size", 9).text("all-voter average (0.22)");

  // Party blobs (identical to Figs 2–3)
  const jittered = window.jitterVoters(voters, { xAmt: 0.13, yAmt: 0.05 });
  const partyGroups = [
    { color: "#5b9cf6", filter: v => v.party === "strong_dem" || v.party === "lean_dem" },
    { color: "#c97fff", filter: v => v.party === "independent" },
    { color: "#f06060", filter: v => v.party === "strong_rep" || v.party === "lean_rep" },
  ];
  const partyDensity = d3.contourDensity()
    .x(d => xS(d.x)).y(d => yS(d.y)).weight(d => d.weight ?? 1).size([iW, iH]).bandwidth(26).thresholds(8);
  partyGroups.forEach(grp => {
    const contours = partyDensity(jittered.filter(grp.filter));
    const mx = d3.max(contours, d => d.value) || 1;
    g.append("g").selectAll("path").data(contours).join("path")
      .attr("d", d3.geoPath()).attr("fill", grp.color)
      .attr("opacity", d => 0.03 + 0.15 * (d.value / mx))
      .attr("stroke", grp.color).attr("stroke-width", 0.5)
      .attr("stroke-opacity", d => 0.08 + 0.35 * (d.value / mx));
  });

  const cy = v => yS(Math.min(SWING_TRUST_MAX, v));
  const halo = (cx, cyy, r) => g.append("circle").attr("cx", cx).attr("cy", cyy).attr("r", r)
    .attr("fill", "#0f0f13").attr("opacity", 0.5);

  // ── Primary → general movement for Clinton and Trump ──────────────────────
  const movers = [
    { color: "#5b9cf6", label: "Clinton", lAnchor: "end",   ldx: -12,
      pf: v => v.primary_vote === "clinton", gf: v => v.vote === "clinton" },
    { color: "#f06060", label: "Trump",   lAnchor: "start", ldx: 12,
      pf: v => v.primary_vote === "trump",   gf: v => v.vote === "trump" },
  ];

  movers.forEach(m => {
    const pr = voters.filter(m.pf), ge = voters.filter(m.gf);
    const pw = pr.map(r => r.weight ?? 1), gw = ge.map(r => r.weight ?? 1);
    const px = window.wMean(pr.map(r => r.x), pw), py = window.wMean(pr.map(r => r.y), pw);
    const gx = window.wMean(ge.map(r => r.x), gw), gy = window.wMean(ge.map(r => r.y), gw);

    // shift line primary → general
    g.append("line").attr("x1", xS(px)).attr("y1", cy(py)).attr("x2", xS(gx)).attr("y2", cy(gy))
      .attr("stroke", m.color).attr("stroke-width", 2).attr("opacity", 0.85);

    // primary = hollow, general = filled
    halo(xS(px), cy(py), 9);
    g.append("circle").attr("cx", xS(px)).attr("cy", cy(py)).attr("r", 6)
      .attr("fill", "#0f0f13").attr("stroke", m.color).attr("stroke-width", 2.5);
    halo(xS(gx), cy(gy), 9);
    g.append("circle").attr("cx", xS(gx)).attr("cy", cy(gy)).attr("r", 6)
      .attr("fill", m.color).attr("stroke", "#fff").attr("stroke-width", 1.5);

    // label at the general (filled) end
    g.append("text").attr("x", xS(gx) + m.ldx).attr("y", cy(gy) - 8)
      .attr("text-anchor", m.lAnchor).attr("fill", m.color)
      .attr("font-size", 12).attr("font-weight", "700").text(m.label);
    g.append("text").attr("x", xS(gx) + m.ldx).attr("y", cy(gy) + 4)
      .attr("text-anchor", m.lAnchor).attr("fill", m.color).attr("font-size", 9).attr("opacity", 0.8)
      .text(`primary ${py.toFixed(2)} → general ${gy.toFixed(2)}`);
  });

  // ── Sanders: primary only (no general ballot) ─────────────────────────────
  const sp = voters.filter(v => v.primary_vote === "sanders");
  const sw = sp.map(r => r.weight ?? 1);
  const sx = window.wMean(sp.map(r => r.x), sw), sy = window.wMean(sp.map(r => r.y), sw);
  halo(xS(sx), cy(sy), 9);
  g.append("circle").attr("cx", xS(sx)).attr("cy", cy(sy)).attr("r", 6)
    .attr("fill", "#c97fff").attr("stroke", "#fff").attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3,2");
  g.append("text").attr("x", xS(sx)).attr("y", cy(sy) + 20)
    .attr("text-anchor", "middle").attr("fill", "#c97fff").attr("font-size", 11).attr("font-weight", "700")
    .text("Sanders");
  g.append("text").attr("x", xS(sx)).attr("y", cy(sy) + 31)
    .attr("text-anchor", "middle").attr("fill", "#c97fff").attr("font-size", 9).attr("opacity", 0.8)
    .text(`primary ${sy.toFixed(2)} (no general)`);

  // ── Legend ────────────────────────────────────────────────────────────────
  const lg = g.append("g").attr("transform", `translate(${iW/2 - 90}, -18)`);
  lg.append("circle").attr("cx", 0).attr("cy", -4).attr("r", 5).attr("fill", "#0f0f13").attr("stroke", "#aaa").attr("stroke-width", 2);
  lg.append("text").attr("x", 9).attr("y", 0).attr("fill", "#8888a8").attr("font-size", 10).text("primary");
  lg.append("circle").attr("cx", 70).attr("cy", -4).attr("r", 5).attr("fill", "#aaa").attr("stroke", "#fff").attr("stroke-width", 1.5);
  lg.append("text").attr("x", 79).attr("y", 0).attr("fill", "#8888a8").attr("font-size", 10).text("general");
  lg.append("text").attr("x", 138).attr("y", 0).attr("fill", "#8888a8").attr("font-size", 10).text("→ shift");

  // ── Axes ────────────────────────────────────────────────────────────────
  g.append("g").attr("transform", `translate(0,${iH})`)
    .call(d3.axisBottom(xS).ticks(5).tickFormat(v => v===-1?"← Left":v===1?"Right →":v===0?"Center":""))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g")
    .call(d3.axisLeft(yS).tickValues([0,0.2,0.4,0.6]).tickFormat(v => v===0?"No trust":v===0.6?"0.6 →":v.toFixed(1)))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 10);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW/2).attr("y", iH + 42)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Policy Ideology");
  g.append("text").attr("transform", "rotate(-90)").attr("x", -iH/2).attr("y", -50)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Institutional trust (clipped at 0.6)");

  window.renderFigSpec("data-swing", {
    population: `<strong>Clinton & Trump voters, primary vs general</strong> — hollow = primary-vote centroid, filled = general-vote centroid. Sanders primary shown alone (not on the general ballot). Field = Fig 2 party blobs.`,
    x: "Ideology (V161126), left −1 to right +1.",
    y: "Institutional trust — 3-item index, clipped at 0.6.",
    marks: "Party density blobs (as Fig 2) + per-candidate primary→general shift (mean). Line length = how much the coalition moved.",
  });
};
