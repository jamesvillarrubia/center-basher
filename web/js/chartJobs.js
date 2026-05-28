/**
 * chartJobs.js — Figure 6: the left-right map decides WHO you pick, but it can't
 * tell you WHETHER you vote. That second job belongs to a dimension that isn't on
 * the map at all — engagement.
 *
 * LEFT panel — CHOICE field on the ideology × trust plane (ANES 2016, weighted):
 *   P(Trump) = σ(0.211 + 4.128·x − 3.074·trust) — color shifts hard LEFT↔RIGHT,
 *   so IDEOLOGY decides choice.
 *
 * RIGHT panel — WHETHER you vote (ANES 2016, VOTE-VALIDATED vs the L2 file, n=2,857):
 *   Validated turnout is ~72% flat across the whole plane. What actually moves it is
 *   engagement and education — NOT position. Standardized effect on validated turnout:
 *     interest  0.36   education 0.34   |   ideology 0.03   trust 0.02
 *   Turnout by campaign interest: very 79% · somewhat 67% · not much 54% (a 25-pt gap).
 *
 * The payoff: moving on policy slides you along the left-right axis (wins choice-margin
 * among the already-engaged) but does nothing to engagement — the real turnout driver.
 * You can't mobilize the disaffected by moving to the "center."
 */

const JOBS_TMAX = 0.6;
const Cc = { b0: 0.211, bx: 4.128, by: -3.074 };   // P(Trump), head-to-head
const sig = z => 1 / (1 + Math.exp(-z));

// Validated-turnout findings (ANES L2 voteval, weighted, n=2,857)
const TURNOUT_BY_INTEREST = [
  { lab: "very interested", pct: 79 },
  { lab: "somewhat",        pct: 67 },
  { lab: "not much",        pct: 54 },
];
const TURNOUT_DRIVERS = [
  { lab: "engagement", val: 0.36, driver: true },
  { lab: "education",  val: 0.34, driver: true },
  { lab: "ideology",   val: 0.03, driver: false },
  { lab: "trust",      val: 0.02, driver: false },
];

window.drawChartJobs = function () {
  const container = document.getElementById("chart-jobs");
  if (!container) return;

  const W = container.clientWidth || 680;
  const gap = 40;
  const panelW = (W - gap) / 2;
  const pm = { top: 34, right: 10, bottom: 30, left: 40 };
  const pIW = panelW - pm.left - pm.right;
  const pIH = pIW * 0.78;
  const rightH = 246;                          // fixed height of the right-panel content
  const bodyH = Math.max(pIH, rightH);
  const H = pm.top + bodyH + pm.bottom + 8;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const xS = d3.scaleLinear().domain([-1, 1]).range([0, pIW]);
  const yS = d3.scaleLinear().domain([0, JOBS_TMAX]).range([pIH, 0]);

  // ── LEFT panel: CHOICE — P(Trump) field on the plane (centred in bodyH) ────
  const gL = svg.append("g").attr("transform", `translate(${pm.left},${pm.top + (bodyH - pIH) / 2})`);
  const nx = 50, ny = 38, cw = pIW / nx, ch = pIH / ny;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = -1 + 2 * i / (nx - 1), y = JOBS_TMAX * j / (ny - 1);
    const p = sig(Cc.b0 + Cc.bx * x + Cc.by * y);
    gL.append("rect").attr("x", xS(x) - cw / 2).attr("y", yS(y) - ch / 2)
      .attr("width", cw + 1).attr("height", ch + 1).attr("fill", d3.interpolateRdBu(1 - p)).attr("opacity", 0.92);
  }
  // P=0.5 decision boundary
  const bpts = d3.range(-1, 1.01, 0.02).map(x => ({ x, y: (Cc.b0 + Cc.bx * x) / (-Cc.by) }))
    .filter(d => d.y >= 0 && d.y <= JOBS_TMAX);
  gL.append("path").datum(bpts).attr("d", d3.line().x(d => xS(d.x)).y(d => yS(d.y)))
    .attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 1.5).attr("stroke-dasharray", "4,3").attr("opacity", 0.8);
  // candidate reference dots
  const candDot = (x, y, col) => gL.append("circle").attr("cx", xS(x)).attr("cy", yS(y)).attr("r", 4)
    .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1);
  candDot(-0.33, 0.27, "#bcd0ff"); candDot(0.46, 0.14, "#ffd0d0");
  // "choice flips" gradient arrow (horizontal)
  const cx = xS(0), cy = yS(0.3), L = 50;
  gL.append("defs").append("marker").attr("id", "arJobs").attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
    .attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse")
    .append("path").attr("d", "M0,0L10,5L0,10Z").attr("fill", "#fff");
  gL.append("line").attr("x1", cx - L).attr("y1", cy).attr("x2", cx + L).attr("y2", cy)
    .attr("stroke", "#fff").attr("stroke-width", 2).attr("marker-end", "url(#arJobs)").attr("marker-start", "url(#arJobs)").attr("opacity", 0.9);
  gL.append("text").attr("x", cx).attr("y", cy - 8).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 10).attr("font-weight", 700).text("choice flips here");
  // frame + axes
  gL.append("rect").attr("width", pIW).attr("height", pIH).attr("fill", "none").attr("stroke", "#2e2e3e");
  gL.append("text").attr("x", 0).attr("y", -16).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700).text("WHO you pick");
  gL.append("text").attr("x", 0).attr("y", -3).attr("fill", "#8888a8").attr("font-size", 10).text("color = P(Trump): blue Clinton → red Trump");
  gL.append("text").attr("x", 2).attr("y", pIH + 16).attr("fill", "#8888a8").attr("font-size", 9).text("← Left");
  gL.append("text").attr("x", pIW - 2).attr("y", pIH + 16).attr("text-anchor", "end").attr("fill", "#8888a8").attr("font-size", 9).text("Right →");
  gL.append("text").attr("transform", "rotate(-90)").attr("x", -pIH / 2).attr("y", -28).attr("text-anchor", "middle")
    .attr("fill", "#8888a8").attr("font-size", 9).text("trust →");

  // ── RIGHT panel: WHETHER you vote — engagement, not position ───────────────
  const gR = svg.append("g").attr("transform", `translate(${panelW + gap + pm.left},${pm.top})`);
  gR.append("text").attr("x", 0).attr("y", -16).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700).text("WHETHER you vote");
  gR.append("text").attr("x", 0).attr("y", -3).attr("fill", "#8888a8").attr("font-size", 10).text("validated turnout — tracks engagement, not the map");

  // Group 1: turnout by engagement
  const lab1X = 70, b1x = d3.scaleLinear().domain([0, 100]).range([0, pIW - lab1X - 34]);
  const grn = d3.scaleLinear().domain([50, 80]).range([0.35, 0.85]);
  let y = 6;
  gR.append("text").attr("x", 0).attr("y", y + 8).attr("fill", "#cfcfe0").attr("font-size", 10).attr("font-weight", 700).text("Turnout by engagement");
  y += 18;
  const rowH1 = 17, gap1 = 7;
  TURNOUT_BY_INTEREST.forEach(d => {
    gR.append("text").attr("x", lab1X - 6).attr("y", y + rowH1 - 5).attr("text-anchor", "end").attr("fill", "#9a9ab0").attr("font-size", 9.5).text(d.lab);
    gR.append("rect").attr("x", lab1X).attr("y", y).attr("width", b1x(d.pct)).attr("height", rowH1)
      .attr("fill", d3.interpolateGreens(grn(d.pct))).attr("rx", 2);
    gR.append("text").attr("x", lab1X + b1x(d.pct) + 5).attr("y", y + rowH1 - 4).attr("fill", "#e8e8f0").attr("font-size", 11).attr("font-weight", 700).text(d.pct + "%");
    y += rowH1 + gap1;
  });
  gR.append("text").attr("x", 0).attr("y", y + 2).attr("fill", "#7fbf9f").attr("font-size", 9).text("a 25-point swing — driven by interest, not policy");
  y += 18;

  // Group 2: what actually predicts turnout
  gR.append("text").attr("x", 0).attr("y", y + 8).attr("fill", "#cfcfe0").attr("font-size", 10).attr("font-weight", 700).text("What actually moves turnout");
  gR.append("text").attr("x", 0).attr("y", y + 20).attr("fill", "#8888a8").attr("font-size", 8.5).text("standardized effect on validated turnout (|β·SD|)");
  y += 30;
  const lab2X = 70, b2x = d3.scaleLinear().domain([0, 0.4]).range([0, pIW - lab2X - 34]);
  const rowH2 = 15, gap2 = 6;
  TURNOUT_DRIVERS.forEach(d => {
    gR.append("text").attr("x", lab2X - 6).attr("y", y + rowH2 - 4).attr("text-anchor", "end")
      .attr("fill", d.driver ? "#cfcfe0" : "#8888a8").attr("font-size", 9.5).attr("font-weight", d.driver ? 700 : 400).text(d.lab);
    gR.append("rect").attr("x", lab2X).attr("y", y).attr("width", Math.max(2, b2x(d.val))).attr("height", rowH2)
      .attr("fill", d.driver ? "#5fcf8e" : "#4a4a5e").attr("rx", 2);
    gR.append("text").attr("x", lab2X + Math.max(2, b2x(d.val)) + 5).attr("y", y + rowH2 - 3)
      .attr("fill", d.driver ? "#e8e8f0" : "#8888a8").attr("font-size", 10).attr("font-weight", d.driver ? 700 : 400).text(d.val.toFixed(2));
    y += rowH2 + gap2;
  });
  gR.append("text").attr("x", 0).attr("y", y + 4).attr("fill", "#6a6a82").attr("font-size", 8.5).attr("font-style", "italic")
    .text("(both = the axes at left)");

  window.renderFigSpec("data-jobs", {
    population: "ANES 2016 (weighted). Left: head-to-head choice field (Trump vs Clinton, n=2,066). Right: VOTE-VALIDATED turnout vs the L2 file (n=2,857).",
    x: "Left: ideology (V161126), −1 to +1. Right: turnout % and standardized effect sizes.",
    y: "Left: institutional trust (3-item index, 0–0.6). Right: engagement level / predictor.",
    marks: "Left: P(Trump) shifts hard LEFT-RIGHT → ideology decides WHO. Right: turnout tracks engagement (very 79% → not-much 54%), while ideology (0.03) and trust (0.02) — the two axes on the left — move it ≈0. Position decides choice; engagement decides participation.",
  });
};
