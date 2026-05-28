/**
 * chartJobs.js — Figure 6: the two axes do two different jobs, shown on the
 * SAME ideology × trust plane as every other figure.
 *
 * Two weighted logistic fields (ANES 2016):
 *   CHOICE  P(Trump)  = σ(0.211 + 4.128·x − 3.074·trust)   gradient −37° (≈ left↔right)
 *   TURNOUT P(vote)   = σ(2.045 + 0.040·x − 0.576·trust)   gradient −86° (≈ top↔bottom)
 *
 * Left panel colors the plane by who you'd vote for (blue Clinton ↔ red Trump):
 * the color changes LEFT-RIGHT → ideology decides choice. Right panel colors by
 * turnout: the color changes TOP-BOTTOM → trust decides participation. The
 * orthogonal banding IS the finding. Turnout only spans 85–89% (ANES over-reports
 * turnout ~85-89% vs ~60% actual), and distrust mildly mobilizes (bottom = higher).
 */

const JOBS_TMAX = 0.6;
const Cc = { b0: 0.211, bx: 4.128, by: -3.074 };   // P(Trump)
const Ct = { b0: 2.045, bx: 0.040, by: -0.576 };   // P(vote)
const sig = z => 1 / (1 + Math.exp(-z));

window.drawChartJobs = function () {
  const container = document.getElementById("chart-jobs");
  if (!container) return;

  const W = container.clientWidth || 680;
  const gap = 34;
  const panelW = (W - gap) / 2;
  const pm = { top: 34, right: 10, bottom: 30, left: 40 };
  const pIW = panelW - pm.left - pm.right;
  const pIH = pIW * 0.72;
  const H = pm.top + pIH + pm.bottom + 8;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const xS = d3.scaleLinear().domain([-1, 1]).range([0, pIW]);
  const yS = d3.scaleLinear().domain([0, JOBS_TMAX]).range([pIH, 0]);

  const candDot = (g, x, y, col) => g.append("circle").attr("cx", xS(x)).attr("cy", yS(y)).attr("r", 4)
    .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1);

  function panel(ix, title, sub, fieldFn, colorFn, isoFn, gradAngle, gradLabel) {
    const g = svg.append("g").attr("transform", `translate(${ix * (panelW + gap) + pm.left},${pm.top})`);
    // heatmap
    const nx = 50, ny = 36, cw = pIW / nx, ch = pIH / ny;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = -1 + 2 * i / (nx - 1), y = JOBS_TMAX * j / (ny - 1);
      g.append("rect").attr("x", xS(x) - cw / 2).attr("y", yS(y) - ch / 2)
        .attr("width", cw + 1).attr("height", ch + 1).attr("fill", colorFn(fieldFn(x, y))).attr("opacity", 0.92);
    }
    // iso lines
    isoFn(g);
    // candidate references
    candDot(g, -0.33, 0.27, "#bcd0ff"); candDot(g, 0.46, 0.14, "#ffd0d0");
    // gradient arrow (from centre)
    const cx = xS(0), cy = yS(0.3), L = 46, a = gradAngle * Math.PI / 180;
    g.append("defs").append("marker").attr("id", `ar${ix}`).attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
      .attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M0,0L10,5L0,10Z").attr("fill", "#fff");
    g.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx + L * Math.cos(a)).attr("y2", cy - L * Math.sin(a))
      .attr("stroke", "#fff").attr("stroke-width", 2.5).attr("marker-end", `url(#ar${ix})`);
    g.append("text").attr("x", cx + L * Math.cos(a)).attr("y", cy - L * Math.sin(a) + (Math.sin(a) < -0.5 ? 14 : -8))
      .attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 10).attr("font-weight", 700).text(gradLabel);
    // frame + axes
    g.append("rect").attr("width", pIW).attr("height", pIH).attr("fill", "none").attr("stroke", "#2e2e3e");
    g.append("text").attr("x", 0).attr("y", -16).attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 700).text(title);
    g.append("text").attr("x", 0).attr("y", -3).attr("fill", "#8888a8").attr("font-size", 10).text(sub);
    g.append("text").attr("x", 2).attr("y", pIH + 16).attr("fill", "#8888a8").attr("font-size", 9).text("← Left");
    g.append("text").attr("x", pIW - 2).attr("y", pIH + 16).attr("text-anchor", "end").attr("fill", "#8888a8").attr("font-size", 9).text("Right →");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -pIH / 2).attr("y", -28).attr("text-anchor", "middle")
      .attr("fill", "#8888a8").attr("font-size", 9).text("trust →");
  }

  // ── Panel 1: CHOICE — P(Trump), diverging blue↔red, decision boundary ──
  panel(0, "Who you vote for", "color = P(Trump): blue Clinton → red Trump",
    (x, y) => sig(Cc.b0 + Cc.bx * x + Cc.by * y),
    p => d3.interpolateRdBu(1 - p),
    g => { // P=0.5 boundary: y = (b0 + bx·x)/(-by)
      const pts = d3.range(-1, 1.01, 0.02).map(x => ({ x, y: (Cc.b0 + Cc.bx * x) / (-Cc.by) }))
        .filter(d => d.y >= 0 && d.y <= JOBS_TMAX);
      g.append("path").datum(pts).attr("d", d3.line().x(d => xS(d.x)).y(d => yS(d.y)))
        .attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 1.5).attr("stroke-dasharray", "4,3").attr("opacity", 0.8);
    },
    -37, "choice flips");

  // ── Panel 2: TURNOUT — P(vote), horizontal bands ──
  const tlo = sig(Ct.b0 + Ct.by * JOBS_TMAX), thi = sig(Ct.b0);   // ~0.845 .. 0.885
  panel(1, "Whether you vote", "color = turnout 85–89% (varies only with trust)",
    (x, y) => sig(Ct.b0 + Ct.bx * x + Ct.by * y),
    p => d3.interpolateGreens(0.2 + 0.75 * (p - tlo) / (thi - tlo)),
    g => { [0.86, 0.87].forEach(pv => {
        const y = (Math.log(pv / (1 - pv)) - Ct.b0) / Ct.by;
        if (y >= 0 && y <= JOBS_TMAX) {
          g.append("line").attr("x1", 0).attr("x2", pIW).attr("y1", yS(y)).attr("y2", yS(y))
            .attr("stroke", "#fff").attr("stroke-opacity", 0.5).attr("stroke-dasharray", "4,3");
          g.append("text").attr("x", pIW - 3).attr("y", yS(y) - 3).attr("text-anchor", "end")
            .attr("fill", "#fff").attr("font-size", 8).attr("opacity", 0.7).text(`${Math.round(pv * 100)}%`);
        }
      }); },
    -86, "turnout rises");

  window.renderFigSpec("data-jobs", {
    population: "ANES 2016 — two weighted logistic fields on the same plane: head-to-head choice (Trump vs Clinton, n=2,066) and turnout (n=2,681).",
    x: "Ideology (V161126), left −1 to right +1.",
    y: "Institutional trust — 3-item index, 0 to 0.6.",
    marks: "Left: plane colored by P(Trump) — color shifts LEFT-RIGHT (ideology), with the 50/50 boundary. Right: colored by turnout — shifts TOP-BOTTOM (trust). Light dots = Clinton (left) & Trump (right) for reference.",
  });
};
