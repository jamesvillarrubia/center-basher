/**
 * chartMoveable.js — Figure 5: the contestable ground.
 *
 * Locked-in voters don't decide elections; moveable ones do. Two kinds are
 * contestable, shown here as the BLOBS (replacing the party field of Figs 2–4):
 *   • Persuadable    — likely to vote but undecided        (undecided_engaged)
 *   • Wavering       — decided/partisan but low turnout     (decided_disengaged)
 * On top sit the same candidate primary centroids as Fig 3 (mean + median).
 *
 * Finding: both moveable clusters sit at the ideological center, low trust
 * (~0.19) — far below Clinton's coalition (0.32), inside the low-trust band
 * shared by Sanders (0.22) and Trump (0.12).
 */

const MV_TRUST_MAX = 0.6;
const mvMean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
function mvMedian(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

window.drawChartMoveable = function (voters) {
  const container = document.getElementById("chart-moveable");
  if (!container) return;

  const W = container.clientWidth || 680;
  const H = Math.min(W * 0.82, 520);
  const margin = { top: 30, right: 150, bottom: 56, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, MV_TRUST_MAX]).range([iH, 0]);
  const cy = v => yS(Math.min(MV_TRUST_MAX, v));

  // Ideology shading + center line
  g.append("rect").attr("width", iW/2).attr("height", iH).attr("fill", "#1e1826").attr("opacity", 0.5);
  g.append("rect").attr("x", iW/2).attr("width", iW/2).attr("height", iH).attr("fill", "#121b1a").attr("opacity", 0.5);
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", yS(0.22)).attr("y2", yS(0.22))
    .attr("stroke", "#ffffff28").attr("stroke-dasharray", "2,3");
  g.append("text").attr("x", 4).attr("y", yS(0.22) - 4)
    .attr("fill", "#ffffff50").attr("font-size", 9).text("all-voter average (0.22)");

  const jittered = window.jitterVoters(voters, { xAmt: 0.13, yAmt: 0.05 });

  // ── The two moveable blobs (the contestable field) ────────────────────────
  const moveable = [
    { color: "#f0c040", label: "Persuadable",       sub: "likely voter, undecided", seg: "undecided_engaged" },
    { color: "#3fd0c0", label: "Wavering partisans", sub: "decided, low turnout",     seg: "decided_disengaged" },
  ];
  moveable.forEach(m => {
    const pts = jittered.filter(v => v.segment === m.seg);
    const dens = d3.contourDensity()
      .x(d => xS(d.x)).y(d => yS(d.y)).size([iW, iH]).bandwidth(28).thresholds(7)(pts);
    const mx = d3.max(dens, d => d.value) || 1;
    g.append("g").selectAll("path").data(dens).join("path")
      .attr("d", d3.geoPath()).attr("fill", m.color)
      .attr("opacity", d => 0.04 + 0.20 * (d.value / mx))
      .attr("stroke", m.color).attr("stroke-width", 1)
      .attr("stroke-opacity", d => 0.2 + 0.5 * (d.value / mx));
  });

  // ── Candidate primary centroids (same dots as Fig 3) ──────────────────────
  const cands = [
    { color: "#5b9cf6", label: "Clinton", filter: v => v.primary_vote === "clinton" },
    { color: "#c97fff", label: "Sanders", filter: v => v.primary_vote === "sanders" },
    { color: "#f06060", label: "Trump",   filter: v => v.primary_vote === "trump" },
  ];
  const halo = (cx, cyy) => g.append("circle").attr("cx", cx).attr("cy", cyy).attr("r", 9)
    .attr("fill", "#0f0f13").attr("opacity", 0.5);
  const labelRows = [];
  cands.forEach(c => {
    const ex = voters.filter(c.filter);
    const mX = mvMean(ex.map(r => r.x)), mY = mvMean(ex.map(r => r.y));
    const medX = mvMedian(ex.map(r => r.x)), medY = mvMedian(ex.map(r => r.y));
    g.append("line").attr("x1", xS(medX)).attr("y1", cy(medY)).attr("x2", xS(mX)).attr("y2", cy(mY))
      .attr("stroke", "#fff").attr("stroke-width", 1).attr("opacity", 0.5);
    halo(xS(medX), cy(medY));
    g.append("circle").attr("cx", xS(medX)).attr("cy", cy(medY)).attr("r", 6)
      .attr("fill", c.color).attr("stroke", "#fff").attr("stroke-width", 2);
    halo(xS(mX), cy(mY));
    g.append("circle").attr("cx", xS(mX)).attr("cy", cy(mY)).attr("r", 6)
      .attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 2);
    labelRows.push({ c, mY, medY, anchorY: cy((mY + medY) / 2) });
  });

  // right-margin candidate labels (spaced)
  const lx = iW + 10;
  labelRows.sort((a, b) => a.anchorY - b.anchorY);
  for (let i = 1; i < labelRows.length; i++)
    if (labelRows[i].anchorY - labelRows[i-1].anchorY < 30)
      labelRows[i].anchorY = labelRows[i-1].anchorY + 30;
  labelRows.forEach(({ c, mY, medY, anchorY }) => {
    g.append("text").attr("x", lx).attr("y", anchorY - 2)
      .attr("fill", c.color).attr("font-size", 11).attr("font-weight", "700").text(c.label + " primary");
    g.append("text").attr("x", lx).attr("y", anchorY + 10)
      .attr("fill", c.color).attr("font-size", 9).attr("opacity", 0.75)
      .text(`med ${medY.toFixed(2)} · mean ${mY.toFixed(2)}`);
  });

  // ── Blob legend (top) ─────────────────────────────────────────────────────
  const lg = g.append("g").attr("transform", "translate(0,-18)");
  moveable.forEach((m, i) => {
    const x0 = i * 230;
    lg.append("rect").attr("x", x0).attr("y", -9).attr("width", 11).attr("height", 11).attr("rx", 2)
      .attr("fill", m.color).attr("opacity", 0.7);
    lg.append("text").attr("x", x0 + 16).attr("y", 0).attr("fill", m.color).attr("font-size", 10).attr("font-weight", "700")
      .text(m.label);
    lg.append("text").attr("x", x0 + 16 + m.label.length * 6.5).attr("y", 0)
      .attr("fill", "#8888a8").attr("font-size", 9).text(` — ${m.sub}`);
  });

  // ── Axes ──────────────────────────────────────────────────────────────────
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

  const nP = voters.filter(v => v.segment === "undecided_engaged").length;
  const nW = voters.filter(v => v.segment === "decided_disengaged").length;
  window.renderFigSpec("data-moveable", {
    population: `<strong>Only the moveable voters</strong> as blobs — persuadable (likely-voter, undecided; n=${nP}) and wavering partisans (decided, low turnout; n=${nW}). Locked-in voters excluded. Dots = candidate primary centroids (as Fig 3).`,
    x: "Ideology (V161126), left −1 to right +1.",
    y: "Institutional trust — 3-item index, clipped at 0.6.",
    marks: "Two moveable-voter density blobs + each candidate's primary centroid (filled = median, hollow = mean). Both blobs sit center-low; only the candidate dots vary.",
  });
};
