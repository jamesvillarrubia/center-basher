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

const MV_TRUST_MAX = 0.6;  // weighted centroids/medians via window.wMean/wMedian

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
      .x(d => xS(d.x)).y(d => yS(d.y)).weight(d => d.weight ?? 1).size([iW, iH]).bandwidth(28).thresholds(7)(pts);
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
    const ws = ex.map(r => r.weight ?? 1);
    const mX = window.wMean(ex.map(r => r.x), ws), mY = window.wMean(ex.map(r => r.y), ws);
    const medX = window.wMedian(ex.map(r => r.x), ws), medY = window.wMedian(ex.map(r => r.y), ws);
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

  // ── Split panels: each moveable type alone (like Fig 2 small multiples) ────
  const cols = 2, gap = 16, smW = W;
  const panelW = (smW - gap * (cols - 1)) / cols;
  const pm = { top: 24, right: 6, bottom: 24, left: 8 };
  const pIW = panelW - pm.left - pm.right;
  const pIH = panelW * 0.78 - pm.top - pm.bottom;
  const sm = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${smW} ${panelW * 0.78}`).attr("width", "100%");
  const spX = d3.scaleLinear().domain([-1, 1]).range([0, pIW]);
  const spY = d3.scaleLinear().domain([0, MV_TRUST_MAX]).range([pIH, 0]);
  const pBw = Math.max(10, 28 * pIW / iW);
  moveable.forEach((m, i) => {
    const px = i * (panelW + gap);
    const pg = sm.append("g").attr("transform", `translate(${px + pm.left},${pm.top})`);
    pg.append("rect").attr("width", pIW).attr("height", pIH).attr("fill", "#121218")
      .attr("stroke", "#2e2e3e").attr("stroke-width", 1);
    pg.append("line").attr("x1", spX(0)).attr("x2", spX(0)).attr("y1", 0).attr("y2", pIH)
      .attr("stroke", "#ffffff14").attr("stroke-dasharray", "3,3");
    pg.append("line").attr("x1", 0).attr("x2", pIW).attr("y1", spY(0.22)).attr("y2", spY(0.22))
      .attr("stroke", "#ffffff20").attr("stroke-dasharray", "2,3");
    const dens = d3.contourDensity()
      .x(d => spX(d.x)).y(d => spY(d.y)).weight(d => d.weight ?? 1).size([pIW, pIH]).bandwidth(pBw).thresholds(7)(
        jittered.filter(v => v.segment === m.seg));
    const mx = d3.max(dens, d => d.value) || 1;
    pg.append("g").selectAll("path").data(dens).join("path").attr("d", d3.geoPath())
      .attr("fill", m.color).attr("opacity", d => 0.05 + 0.28 * (d.value / mx))
      .attr("stroke", m.color).attr("stroke-width", 0.5).attr("stroke-opacity", d => 0.15 + 0.5 * (d.value / mx));
    pg.append("text").attr("x", pIW/2).attr("y", -9).attr("text-anchor", "middle")
      .attr("fill", m.color).attr("font-size", 12).attr("font-weight", "700").text(m.label);
    pg.append("text").attr("x", 2).attr("y", pIH + 16).attr("fill", "#8888a8").attr("font-size", 9).text("← Left");
    pg.append("text").attr("x", pIW - 2).attr("y", pIH + 16).attr("text-anchor", "end")
      .attr("fill", "#8888a8").attr("font-size", 9).text("Right →");
    if (i === 0) pg.append("text").attr("transform", "rotate(-90)").attr("x", -pIH/2).attr("y", 11)
      .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 9).text("↑ more trust");
  });

  const nP = voters.filter(v => v.segment === "undecided_engaged").length;
  const nW = voters.filter(v => v.segment === "decided_disengaged").length;
  window.renderFigSpec("data-moveable", {
    population: `<strong>Only the moveable voters</strong> as blobs — persuadable (likely-voter, undecided; n=${nP}) and wavering partisans (decided, low turnout; n=${nW}). Locked-in voters excluded. Dots = candidate primary centroids (as Fig 3).`,
    x: "Ideology (V161126), left −1 to right +1.",
    y: "Institutional trust — 3-item index, clipped at 0.6.",
    marks: "Top: both moveable types overlaid + candidate primary centroids (filled = median, hollow = mean). Below: each type split into its own panel. Both tilt right-of-center and low-trust — nearly identical shapes.",
  });
};
