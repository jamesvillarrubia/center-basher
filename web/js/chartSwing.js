/**
 * chartSwing.js — Primary vs. General voter comparison (Act 3)
 *
 * Shows density contours for:
 *   - Clinton primary voters (blue)
 *   - Sanders primary voters (purple)
 *   - Trump primary voters (red)
 *
 * Toggle to general election view:
 *   - Clinton general voters (blue)
 *   - Trump general voters (red)
 *
 * Bernie→Trump switchers shown as individual glowing dots (n=25 in sample).
 *
 * Key finding: Sanders primary trust centroid (0.367) is far closer to
 * Trump primary (0.259) than to Clinton primary (0.460).
 */

window.drawChartSwing = function (voters) {
  const container = document.getElementById("chart-swing");
  if (!container) return;

  const centroids = {
    clinton_primary: { x: -0.347, y: 0.460, label: "Clinton primary", color: "#5b9cf6" },
    sanders_primary: { x: -0.421, y: 0.367, label: "Sanders primary", color: "#c97fff" },
    trump_primary:   { x:  0.505, y: 0.259, label: "Trump primary",   color: "#f06060" },
    clinton_general: { x: -0.333, y: 0.422, label: "Clinton general", color: "#5b9cf6" },
    trump_general:   { x:  0.460, y: 0.283, label: "Trump general",   color: "#f06060" },
  };

  const views = [
    {
      key: "primary",
      label: "Primary voters",
      groups: [
        { key: "clinton_primary", label: "Clinton primary (n=444)", color: "#5b9cf6", filter: v => v.primary_vote === "clinton" },
        { key: "sanders_primary", label: "Sanders primary (n=339)", color: "#c97fff", filter: v => v.primary_vote === "sanders" },
        { key: "trump_primary",   label: "Trump primary (n=393)",   color: "#f06060", filter: v => v.primary_vote === "trump" },
      ],
    },
    {
      key: "general",
      label: "General election voters",
      groups: [
        { key: "clinton_general", label: "Clinton general (n=1,061)", color: "#5b9cf6", filter: v => v.vote === "clinton" },
        { key: "trump_general",   label: "Trump general (n=1,002)",   color: "#f06060", filter: v => v.vote === "trump" },
      ],
    },
  ];

  // Bernie→Trump switchers
  const bernieTrump = voters.filter(v => v.primary_vote === "sanders" && v.vote === "trump");

  // Tab bar
  const tabBar = document.createElement("div");
  tabBar.style.cssText = "display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap";

  const svgWrap = document.createElement("div");
  const legendWrap = document.createElement("div");

  views.forEach((view, i) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.style.cssText = `
      padding: 0.3rem 0.85rem; border-radius: 4px; border: 1px solid #444;
      background: ${i === 0 ? "#333" : "#1a1a1a"}; color: ${i === 0 ? "#ddd" : "#666"};
      cursor: pointer; font-size: 0.8rem; transition: background 0.15s;
    `;
    btn.addEventListener("click", () => {
      tabBar.querySelectorAll("button").forEach(b => {
        b.style.background = "#1a1a1a"; b.style.color = "#666";
      });
      btn.style.background = "#333"; btn.style.color = "#ddd";
      svgWrap.innerHTML = "";
      legendWrap.innerHTML = "";
      renderView(voters, view, bernieTrump, svgWrap, legendWrap, centroids);
    });
    tabBar.appendChild(btn);
  });

  container.appendChild(tabBar);
  container.appendChild(svgWrap);
  container.appendChild(legendWrap);

  renderView(voters, views[0], bernieTrump, svgWrap, legendWrap, centroids);
};


function renderView(allVoters, view, bernieTrump, svgWrap, legendWrap, centroids) {
  const W = svgWrap.clientWidth || svgWrap.parentElement.clientWidth || 680;
  const H = Math.min(W * 0.85, 520);
  const margin = { top: 36, right: 28, bottom: 56, left: 60 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(svgWrap)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, 1]).range([iH, 0]);

  // Quadrant fills
  [[0, iH/2, iW/2, iH/2], [iW/2, iH/2, iW/2, iH/2],
   [0, 0, iW/2, iH/2],    [iW/2, 0, iW/2, iH/2]].forEach(([qx, qy, qw, qh], i) => {
    g.append("rect").attr("x", qx).attr("y", qy).attr("width", qw).attr("height", qh)
      .attr("fill", i < 2 ? "#1e1826" : "#121b1a").attr("opacity", 0.6);
  });

  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", iH/2).attr("y2", iH/2)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // Density contours per group
  const densityGen = d3.contourDensity()
    .x(d => xS(d.x)).y(d => yS(d.y))
    .size([iW, iH]).bandwidth(34).thresholds(7);

  view.groups.forEach(grp => {
    const pts = allVoters.filter(grp.filter);
    const contours = densityGen(pts);
    const maxVal = d3.max(contours, d => d.value) || 1;

    g.append("g").selectAll("path")
      .data(contours).join("path")
      .attr("d", d3.geoPath())
      .attr("fill", grp.color)
      .attr("opacity", d => 0.05 + 0.20 * (d.value / maxVal))
      .attr("stroke", grp.color)
      .attr("stroke-width", 0.8)
      .attr("stroke-opacity", d => 0.15 + 0.55 * (d.value / maxVal));
  });

  // Trust centroid markers for each group in this view
  view.groups.forEach(grp => {
    const c = centroids[grp.key];
    if (!c) return;
    const cx = xS(c.x), cy = yS(c.y);

    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 8)
      .attr("fill", grp.color).attr("opacity", 0.9)
      .attr("stroke", "#ffffff").attr("stroke-width", 1.5);

    // Trust value label
    g.append("text")
      .attr("x", cx).attr("y", cy - 13)
      .attr("text-anchor", "middle")
      .attr("fill", grp.color).attr("font-size", 10).attr("font-weight", "700")
      .text("trust=" + c.y.toFixed(3));
  });

  // Bernie→Trump switchers (only on primary view)
  if (view.key === "primary" && bernieTrump.length) {
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "bt-glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "cb");
    const fm = glow.append("feMerge");
    fm.append("feMergeNode").attr("in", "cb");
    fm.append("feMergeNode").attr("in", "SourceGraphic");

    g.selectAll("circle.bt")
      .data(bernieTrump).join("circle").attr("class", "bt")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y))
      .attr("r", 5).attr("fill", "#f0c040").attr("opacity", 0.9)
      .attr("filter", "url(#bt-glow)");

    // Label the cluster
    const btMeanX = bernieTrump.reduce((s, v) => s + v.x, 0) / bernieTrump.length;
    const btMeanY = bernieTrump.reduce((s, v) => s + v.y, 0) / bernieTrump.length;
    g.append("text")
      .attr("x", xS(btMeanX)).attr("y", yS(btMeanY) - 14)
      .attr("text-anchor", "middle").attr("fill", "#f0c040")
      .attr("font-size", 10).attr("font-weight", "700")
      .text("Bernie→Trump (n=" + bernieTrump.length + ")");
  }

  // Axes
  const xAxis = d3.axisBottom(xS).ticks(5)
    .tickFormat(v => v === -1 ? "← Left" : v === 1 ? "Right →" : v === 0 ? "Center" : "");
  const yAxis = d3.axisLeft(yS).ticks(4)
    .tickFormat(v => v === 0 ? "No trust" : v === 1 ? "Full trust" : v === 0.5 ? "Medium" : "");

  g.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.append("g").call(yAxis)
    .selectAll("text").attr("fill", "#8888a8").attr("font-size", 11);
  g.selectAll(".domain, .tick line").attr("stroke", "#444");

  g.append("text").attr("x", iW/2).attr("y", iH + 44)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Policy Ideology");
  g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -iH/2).attr("y", -46)
    .attr("text-anchor", "middle").attr("class", "axis-label").text("Institutional Trust");

  // Legend
  view.groups.forEach(grp => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<div class="legend-dot" style="background:${grp.color}"></div>${grp.label}`;
    legendWrap.appendChild(item);
  });
  if (view.key === "primary") {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<div class="legend-dot" style="background:#f0c040"></div>Bernie→Trump switchers`;
    legendWrap.appendChild(item);
  }
  legendWrap.className = "legend";
}
