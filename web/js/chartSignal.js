/**
 * chartSignal.js — Figure 7: inside the voters she could actually win,
 * trust drove the defection.
 *
 * The raw "low-trust → Trump" split is mostly partisanship: low trust in 2016 is
 * 63% of the electorate and over half of it is the Republican base distrusting a
 * Democratic administration. You can't trust-signal Republicans into voting Clinton.
 *
 * So net out partisanship: take only NON-Republicans (Democratic + independent)
 * who turned out, and look at how the vote splits by institutional trust
 * (ANES 2016, weighted). This is Clinton's reachable coalition — the CHOICE lever
 * for the contestable voters who DO vote.
 *
 *   trust band        stayed Clinton   → Trump   → 3rd/other     n
 *   high  (≥0.30)          90%             5%        5%          516
 *   mid   (0.15–0.30)      82%            12%        6%          450
 *   low   (<0.15)          68%            22%       10%          538
 *
 * Within her own reachable coalition, low trust cost Clinton 22 points — bleeding
 * to Trump AND to third parties (and, on top of this, to abstention). The hinge is
 * trust, not policy: her establishment signaling moved her away from exactly these
 * voters. (Pure independents flip outright: 27/49 Trump at low trust → 55/23 Clinton
 * at high. Sanders primary voters, trust 0.24, came home only 77%.)
 */

const SIGNAL_BANDS = [
  { lab: "High trust", sub: "≥ 0.30",      clinton: 90, trump: 5,  third: 5  },
  { lab: "Mid trust",  sub: "0.15 – 0.30", clinton: 82, trump: 12, third: 6  },
  { lab: "Low trust",  sub: "< 0.15",      clinton: 68, trump: 22, third: 10 },
];
const CLR_CLINTON = "#5b9cf6", CLR_TRUMP = "#f06060", CLR_THIRD = "#6a6a82";

window.drawChartSignal = function () {
  const container = document.getElementById("chart-signal");
  if (!container) return;

  const W = container.clientWidth || 680;
  const M = { top: 66, right: 44, bottom: 48, left: 96 };
  const iW = W - M.left - M.right;
  const rowStride = 50, barH = 28, firstTop = 14;
  const plotH = (SIGNAL_BANDS.length - 1) * rowStride + firstTop + barH;
  const H = M.top + plotH + M.bottom;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
  const x = d3.scaleLinear().domain([0, 100]).range([0, iW]);

  // ── header: legend + framing ──────────────────────────────────────────────
  const lg = g.append("g").attr("transform", "translate(0,-50)");
  const sw = (xoff, col, txt) => {
    lg.append("rect").attr("x", xoff).attr("y", 0).attr("width", 11).attr("height", 11).attr("fill", col).attr("rx", 2);
    lg.append("text").attr("x", xoff + 15).attr("y", 9).attr("fill", "#cfd6ea").attr("font-size", 10).text(txt);
  };
  sw(0, CLR_CLINTON, "stayed Clinton"); sw(110, CLR_TRUMP, "→ Trump"); sw(178, CLR_THIRD, "→ 3rd / other");
  g.append("text").attr("x", 0).attr("y", -30).attr("fill", "#c9b96e").attr("font-size", 11).attr("font-weight", 700)
    .text("Republicans removed — Clinton's reachable coalition only.");
  g.append("text").attr("x", 0).attr("y", -17).attr("fill", "#8888a8").attr("font-size", 10)
    .text("Among non-Republicans who voted, trust — not policy — decided who stayed.");

  // ── rows: 100% stacked, high trust on top → low trust at bottom ────────────
  SIGNAL_BANDS.forEach((b, i) => {
    const top = firstTop + i * rowStride;
    const yc = top + barH / 2;
    // band label (left margin)
    g.append("text").attr("x", -10).attr("y", yc - 1).attr("text-anchor", "end").attr("fill", "#e8e8f0").attr("font-size", 12).attr("font-weight", 700).text(b.lab);
    g.append("text").attr("x", -10).attr("y", yc + 12).attr("text-anchor", "end").attr("fill", "#8888a8").attr("font-size", 9).text(b.sub);
    // segments
    const xc = x(b.clinton), xt = x(b.clinton + b.trump);
    g.append("rect").attr("x", 0).attr("y", top).attr("width", xc).attr("height", barH).attr("fill", CLR_CLINTON);
    g.append("rect").attr("x", xc).attr("y", top).attr("width", xt - xc).attr("height", barH).attr("fill", CLR_TRUMP);
    g.append("rect").attr("x", xt).attr("y", top).attr("width", x(100) - xt).attr("height", barH).attr("fill", CLR_THIRD);
    // Clinton % inside blue (at the boundary)
    g.append("text").attr("x", xc - 6).attr("y", yc + 4).attr("text-anchor", "end").attr("fill", "#fff").attr("font-size", 13).attr("font-weight", 800).text(b.clinton + "%");
    // defection callout to the right of the bar
    g.append("text").attr("x", x(100) + 6).attr("y", yc + 4).attr("fill", "#b9a0c8").attr("font-size", 10).attr("font-weight", 700).text("−" + (100 - b.clinton) + "%");
  });
  g.append("text").attr("x", iW / 2).attr("y", plotH + 30).attr("text-anchor", "middle").attr("fill", "#cfd6ea").attr("font-size", 10.5)
    .text("Defection from Clinton climbs 10% → 32% as trust falls — to Trump and to third parties.");

  window.renderFigSpec("data-signal", {
    population: "ANES 2016 (weighted). NON-Republicans (Democratic + independent identifiers, V161158x) who cast a presidential vote — Clinton's reachable coalition, with the GOP base netted out. n = 516 / 450 / 538.",
    x: "Share of the band's vote: stayed Clinton (blue) · defected to Trump (red) · third-party / other (grey). Each bar sums to 100%.",
    y: "Institutional-trust band (3-item index): high ≥0.30, mid 0.15–0.30, low <0.15.",
    marks: "Within her own reachable coalition, Clinton retention falls 90% → 68% as trust drops — 22 points lost to Trump and third parties (abstention is on top of this). Partisanship is netted out, so this isolates the trust effect from 'low-trust = Republican.' The lever on the contestable's CHOICE is trust; her establishment signaling moved the wrong way. Causal support: real Sanders defection (Fig 11) + Lenz 2012, not this snapshot alone.",
  });
};
