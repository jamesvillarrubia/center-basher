/**
 * chartGravity.js — Field overlap: primary coalition blobs × moveable voter mass
 *
 * The question is not "who won" but "whose coalition overlapped with the
 * contestable voter mass." This is the dot-product of two fields:
 *
 *   Field 1: Primary coalition density blobs (where each candidate's supporters sat)
 *   Field 2: Moveable voter density terrain (the contestable mass)
 *
 * Moveability of each primary coalition (V161032 × V161004):
 *   Sanders primary (n=339):  136 moveable → 40.1%  ← 3× Clinton's rate
 *   Clinton primary (n=444):   59 moveable → 13.3%
 *   Trump primary   (n=393):   60 moveable → 15.3%
 *
 * Sanders redistribution (general election vote of his 339 primary voters):
 *   Clinton 62% · No vote 21% · Trump 7% · 3rd party 10%
 *   Bernie→Trump voters: mean ideology x=−0.013 (near CENTER), trust=0.370
 *   They switched on the trust axis, not ideology.
 */

const MOVEABLE_SEGS = new Set(["undecided_engaged", "undecided_disengaged", "decided_disengaged"]);

window.drawChartGravity = function (voters, candidates) {
  // Pre-compute stats once
  const stats = computeOverlapStats(voters);

  const gravEl  = document.getElementById("chart-gravity");
  const barsEl  = document.getElementById("chart-gravity-bars");
  if (!gravEl || !barsEl) return;

  drawOverlapChart(gravEl, voters, candidates, stats);
  drawSandersFlow(barsEl, voters, stats);
};


// ── Stats ─────────────────────────────────────────────────────────────────────

function computeOverlapStats(voters) {
  const primaries = ["clinton", "sanders", "trump"];
  const stats = {};
  primaries.forEach(p => {
    const coalition = voters.filter(v => v.primary_vote === p && v.x != null && v.y != null);
    const moveable  = coalition.filter(v => MOVEABLE_SEGS.has(v.segment));
    stats[p] = { n: coalition.length, nMoveable: moveable.length, pct: moveable.length / coalition.length };
  });

  // Sanders redistribution
  const sandersPrimary = voters.filter(v => v.primary_vote === "sanders");
  const outcomes = {};
  sandersPrimary.forEach(v => {
    const vote = v.vote || "no_vote";
    outcomes[vote] = (outcomes[vote] || 0) + 1;
  });
  stats.sandersOutcomes = outcomes;
  stats.sandersTotal    = sandersPrimary.length;

  return stats;
}


// ── Main overlap chart ────────────────────────────────────────────────────────

function drawOverlapChart(container, voters, candidates, stats) {
  const views = [
    { key: "overlap",  label: "Coalition overlap",       sub: "primary coalition blobs on moveable voter terrain" },
    { key: "contrast", label: "Locked-in (contrast)",    sub: "decided+engaged — not contestable" },
  ];

  const tabBar  = document.createElement("div");
  tabBar.style.cssText = "display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap";
  const svgWrap = document.createElement("div");

  views.forEach((view, i) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.style.cssText = `
      padding:0.3rem 0.85rem;border-radius:4px;border:1px solid #444;
      background:${i === 0 ? "#333" : "#1a1a1a"};color:${i === 0 ? "#ddd" : "#666"};
      cursor:pointer;font-size:0.8rem;transition:background 0.15s;
    `;
    btn.addEventListener("click", () => {
      tabBar.querySelectorAll("button").forEach(b => { b.style.background="#1a1a1a"; b.style.color="#666"; });
      btn.style.background = "#333"; btn.style.color = "#ddd";
      svgWrap.innerHTML = "";
      renderOverlapMap(svgWrap, voters, candidates, stats, view);
    });
    tabBar.appendChild(btn);
  });

  container.appendChild(tabBar);
  container.appendChild(svgWrap);
  renderOverlapMap(svgWrap, voters, candidates, stats, views[0]);
}


function renderOverlapMap(container, voters, candidates, stats, view) {
  const W = container.clientWidth || container.parentElement.clientWidth || 680;
  const H = Math.min(W * 0.88, 520);
  const margin = { top: 40, right: 28, bottom: 56, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, 1]).range([iH, 0]);

  // ── Background terrain ─────────────────────────────────────────────────────
  const terrainVoters = view.key === "contrast"
    ? voters.filter(v => v.segment === "decided_engaged" && v.x != null && v.y != null)
    : voters.filter(v => MOVEABLE_SEGS.has(v.segment) && v.x != null && v.y != null);

  const densityData = d3.contourDensity()
    .x(d => xS(d.x)).y(d => yS(d.y))
    .size([iW, iH]).bandwidth(28).thresholds(14)(terrainVoters);

  const maxDensity = d3.max(densityData, d => d.value);
  const densityColor = d3.scaleSequential()
    .domain([0, maxDensity])
    .interpolator(d3.interpolate("#0f0f13", "#e8c84a"));

  g.append("g").selectAll("path").data(densityData).join("path")
    .attr("d", d3.geoPath())
    .attr("fill", d => densityColor(d.value))
    .attr("opacity", 0.85);

  // ── Primary coalition blobs ────────────────────────────────────────────────
  if (view.key === "overlap") {
    const primaryGroups = [
      { key: "clinton", color: "#5b9cf6", filter: v => v.primary_vote === "clinton" },
      { key: "sanders", color: "#c97fff", filter: v => v.primary_vote === "sanders" },
      { key: "trump",   color: "#f06060", filter: v => v.primary_vote === "trump"   },
    ];

    const blobDensity = d3.contourDensity()
      .x(d => xS(d.x)).y(d => yS(d.y))
      .size([iW, iH]).bandwidth(30).thresholds(6);

    primaryGroups.forEach(grp => {
      const pts = voters.filter(v => grp.filter(v) && v.x != null && v.y != null);
      const contours = blobDensity(pts);
      const maxVal   = d3.max(contours, d => d.value) || 1;
      g.append("g").selectAll("path").data(contours).join("path")
        .attr("d", d3.geoPath())
        .attr("fill", grp.color)
        .attr("opacity", d => 0.04 + 0.12 * (d.value / maxVal))
        .attr("stroke", grp.color).attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3")
        .attr("stroke-opacity", d => 0.3 + 0.55 * (d.value / maxVal));
    });
  }

  // ── Center lines ──────────────────────────────────────────────────────────
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff22").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff22").attr("stroke-dasharray", "4,4");

  // Low-trust zone line
  const ltY = yS(0.35);
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", ltY).attr("y2", ltY)
    .attr("stroke", "#ffffff40").attr("stroke-width", 1).attr("stroke-dasharray", "6,3");
  g.append("text").attr("x", 6).attr("y", ltY + 13)
    .attr("fill", "#ffffff60").attr("font-size", 10).text("← low-trust zone");

  // ── Candidate dots with moveability badge ─────────────────────────────────
  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "grav-glow2");
  glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "cb");
  const fm = glow.append("feMerge");
  fm.append("feMergeNode").attr("in", "cb");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  const colorMap = window.CANDIDATE_COLORS;
  const cands2016 = candidates.filter(c =>
    ["clinton_2016", "trump_2016", "sanders_2016"].includes(c.id) && c.x != null && c.y != null
  );

  const primaryKey = { clinton_2016: "clinton", trump_2016: "trump", sanders_2016: "sanders" };
  const labelOff = {
    clinton_2016: { dx: -8,  dy: -18, anchor: "middle" },
    sanders_2016: { dx: -14, dy: -18, anchor: "end"    },
    trump_2016:   { dx:  12, dy: -18, anchor: "start"  },
  };

  cands2016.forEach(c => {
    const col  = colorMap[c.party] || "#888";
    const cx   = xS(c.x), cy = yS(c.y);
    const off  = labelOff[c.id] || { dx: 12, dy: -16, anchor: "start" };
    const pkey = primaryKey[c.id];
    const pct  = pkey && stats[pkey] ? Math.round(stats[pkey].pct * 100) : null;
    const isSanders = c.id === "sanders_2016";

    // Glow halo
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 18)
      .attr("fill", col).attr("opacity", 0.10);

    // Main dot
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 10)
      .attr("fill", col).attr("opacity", isSanders ? 0.65 : 0.9)
      .attr("stroke", isSanders ? col : "none").attr("stroke-width", isSanders ? 2 : 0)
      .attr("stroke-dasharray", isSanders ? "3,2" : "none")
      .attr("filter", "url(#grav-glow2)");

    // Name label
    g.append("text")
      .attr("x", cx + off.dx).attr("y", cy + off.dy)
      .attr("text-anchor", off.anchor)
      .attr("fill", col).attr("font-size", 12).attr("font-weight", "700")
      .text(c.name + (isSanders ? " *" : ""));

    // Moveability badge — show % of coalition that was moveable
    if (pct !== null && view.key === "overlap") {
      const bx = cx + off.dx, by = cy + off.dy + 13;
      g.append("text")
        .attr("x", bx).attr("y", by)
        .attr("text-anchor", off.anchor)
        .attr("fill", col).attr("font-size", 9.5).attr("opacity", 0.85)
        .text(`${pct}% of coalition moveable`);
    }
  });

  // Sanders footnote
  g.append("text").attr("x", 4).attr("y", iH - 4)
    .attr("fill", "#ffffff40").attr("font-size", 9)
    .text("* Sanders primary voter centroid (not on general ballot)");

  // ── Axes ──────────────────────────────────────────────────────────────────
  g.append("g").attr("transform", `translate(0,${iH})`)
    .call(d3.axisBottom(xS).ticks(5)
      .tickFormat(v => v===-1?"← Left":v===1?"Right →":v===0?"Center":""))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g")
    .call(d3.axisLeft(yS).ticks(4)
      .tickFormat(v => v===0?"No trust":v===1?"Full trust":v===0.5?"Medium":""))
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW/2).attr("y", iH + 44)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH/2).attr("y", -50)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Institutional Trust");

  const n   = terrainVoters.length;
  const sub = view.key === "contrast"
    ? `Locked-in voters (decided+engaged) · n=${n.toLocaleString()} · Dashed blobs = primary coalitions`
    : `Moveable voter terrain · n=${n.toLocaleString()} · Dashed blobs = primary coalitions`;
  g.append("text").attr("x", iW/2).attr("y", -20)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 11)
    .text(sub);
}


// ── Sanders redistribution flow ───────────────────────────────────────────────

function drawSandersFlow(container, voters, stats) {
  const W = container.clientWidth || 680;
  const H = 280;
  const margin = { top: 44, right: 28, bottom: 60, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Two rows: all Sanders primary / moveable Sanders primary
  const sandersPrimary = voters.filter(v => v.primary_vote === "sanders" && v.x != null);
  const sandersMoveable = sandersPrimary.filter(v => MOVEABLE_SEGS.has(v.segment));

  const outcomeOrder = ["clinton", "no_vote", "trump", "johnson", "stein", "other"];
  const outcomeColors = {
    clinton:  "#5b9cf6",
    no_vote:  "#444",
    trump:    "#f06060",
    johnson:  "#f0c040",
    stein:    "#6be585",
    other:    "#888",
  };
  const outcomeLabel = {
    clinton: "Clinton", no_vote: "Didn't vote", trump: "Trump",
    johnson: "Johnson", stein: "Stein", other: "Other",
  };

  function countOutcomes(vv) {
    const c = {};
    outcomeOrder.forEach(k => c[k] = 0);
    vv.forEach(v => { const k = v.vote || "no_vote"; if (k in c) c[k]++; else c.other++; });
    return c;
  }

  const rows = [
    { label: `All Sanders primary  (n=${sandersPrimary.length})`,    counts: countOutcomes(sandersPrimary),  y: 0,         h: iH * 0.42 },
    { label: `Moveable Sanders     (n=${sandersMoveable.length}, 40%)`, counts: countOutcomes(sandersMoveable), y: iH * 0.56, h: iH * 0.42 },
  ];

  rows.forEach(row => {
    const total = Object.values(row.counts).reduce((a, b) => a + b, 0);
    let xCursor = 0;
    g.append("text").attr("x", -8).attr("y", row.y + row.h / 2 + 4)
      .attr("text-anchor", "end").attr("fill", "#8888a8").attr("font-size", 10)
      .text(row.label);

    outcomeOrder.forEach(outcome => {
      const n = row.counts[outcome];
      if (!n) return;
      const w = (n / total) * iW;
      const col = outcomeColors[outcome];

      g.append("rect")
        .attr("x", xCursor).attr("y", row.y)
        .attr("width", w).attr("height", row.h)
        .attr("fill", col).attr("opacity", outcome === "no_vote" ? 0.5 : 0.75);

      if (w > 32) {
        g.append("text")
          .attr("x", xCursor + w / 2).attr("y", row.y + row.h / 2 - 4)
          .attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 10).attr("font-weight", "600")
          .text(outcomeLabel[outcome]);
        g.append("text")
          .attr("x", xCursor + w / 2).attr("y", row.y + row.h / 2 + 9)
          .attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 9).attr("opacity", 0.8)
          .text(`${Math.round(100 * n / total)}%`);
      }

      // Annotation for Trump bar: "near-centrist ideology"
      if (outcome === "trump" && w > 4) {
        g.append("text")
          .attr("x", xCursor + w / 2).attr("y", row.y - 6)
          .attr("text-anchor", "middle").attr("fill", "#f06060").attr("font-size", 8.5)
          .text("x≈0 center");
      }

      xCursor += w;
    });

    // Border
    g.append("rect")
      .attr("x", 0).attr("y", row.y).attr("width", iW).attr("height", row.h)
      .attr("fill", "none").attr("stroke", "#444").attr("stroke-width", 1);
  });

  // Legend
  const lx = 0, ly = iH + 12;
  let lxCursor = 0;
  outcomeOrder.forEach(outcome => {
    if (!stats.sandersOutcomes[outcome] && outcome !== "no_vote") return;
    g.append("rect").attr("x", lxCursor).attr("y", ly).attr("width", 10).attr("height", 10)
      .attr("fill", outcomeColors[outcome]).attr("opacity", 0.75);
    g.append("text").attr("x", lxCursor + 13).attr("y", ly + 9)
      .attr("fill", "#8888a8").attr("font-size", 9).text(outcomeLabel[outcome]);
    lxCursor += outcomeLabel[outcome].length * 6 + 24;
  });

  g.append("text").attr("x", iW / 2).attr("y", -24)
    .attr("text-anchor", "middle").attr("fill", "#ccc").attr("font-size", 12).attr("font-weight", "600")
    .text("Where did Sanders' primary voters go? (2016 general election)");
  g.append("text").attr("x", iW / 2).attr("y", -10)
    .attr("text-anchor", "middle").attr("fill", "#8888a8").attr("font-size", 10)
    .text("Bernie→Trump voters had near-centrist ideology (x ≈ 0) — they switched on trust, not policy");
}
