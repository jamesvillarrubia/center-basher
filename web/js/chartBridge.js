/**
 * chartBridge.js — Act 2½: from the whole electorate to each candidate's voters.
 *
 * Bridges Fig 2 (all voters in ideology × trust space) and Fig 4 (the group
 * comparison). Uses Fig 2's party blobs as the field, with each candidate's
 * voter group overlaid as mean/median markers.
 *
 * Toggles let you compare what's actually being summarized:
 *   Coalition: primary voters  vs  general-election voters
 *   Marker:    mean  vs  median  vs  both
 * (Trust is right-skewed off the floor, so mean and median differ a lot —
 *  the mean floats above each blob's peak; the median sits inside it.)
 */

const BRIDGE_TRUST_MAX = 0.6;  // weighted centroids/medians via window.wMean/wMedian

window.drawChartBridge = function (voters) {
  const container = document.getElementById("chart-bridge");
  if (!container) return;

  const coalitionViews = {
    primary: {
      label: "Primary coalitions",
      groups: [
        { key: "clinton", color: "#5b9cf6", label: "Clinton primary", dashed: false, filter: v => v.primary_vote === "clinton" },
        { key: "sanders", color: "#c97fff", label: "Sanders primary", dashed: false, filter: v => v.primary_vote === "sanders" },
        { key: "trump",   color: "#f06060", label: "Trump primary",   dashed: false, filter: v => v.primary_vote === "trump" },
      ],
    },
    general: {
      label: "General-election voters",
      groups: [
        { key: "clinton", color: "#5b9cf6", label: "Clinton general", dashed: false, filter: v => v.vote === "clinton" },
        { key: "trump",   color: "#f06060", label: "Trump general",   dashed: false, filter: v => v.vote === "trump" },
        { key: "sanders", color: "#c97fff", label: "Sanders primary*", dashed: true,  filter: v => v.primary_vote === "sanders" },
      ],
    },
  };

  let coalition = "primary";
  let marker = "both";

  // ── Toggle bar ──────────────────────────────────────────────────────────
  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;gap:1.25rem;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center";

  function makeToggle(labelText, options, getActive, onPick) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;gap:0.4rem;align-items:center";
    const lab = document.createElement("span");
    lab.textContent = labelText;
    lab.style.cssText = "font-size:0.7rem;text-transform:uppercase;letter-spacing:0.06em;color:#8888a8;font-weight:700";
    wrap.appendChild(lab);
    options.forEach(([val, txt]) => {
      const b = document.createElement("button");
      b.textContent = txt;
      b.dataset.val = val;
      b.style.cssText = "font:inherit;font-size:0.8rem;padding:0.25rem 0.7rem;border-radius:5px;border:1px solid #2e2e3e;cursor:pointer";
      b.onclick = () => { onPick(val); paint(); };
      wrap.appendChild(b);
    });
    wrap._sync = () => {
      [...wrap.querySelectorAll("button")].forEach(b => {
        const on = b.dataset.val === getActive();
        b.style.background = on ? "#2e2e3e" : "#1a1a1a";
        b.style.color = on ? "#fff" : "#666";
      });
    };
    return wrap;
  }

  const tg1 = makeToggle("Coalition", [["primary", "Primary"], ["general", "General"]],
    () => coalition, v => { coalition = v; });
  const tg2 = makeToggle("Marker", [["mean", "Mean"], ["median", "Median"], ["both", "Both"]],
    () => marker, v => { marker = v; });
  bar.appendChild(tg1); bar.appendChild(tg2);
  container.appendChild(bar);

  const svgWrap = document.createElement("div");
  container.appendChild(svgWrap);

  function paint() {
    tg1._sync(); tg2._sync();
    renderBridge(svgWrap, voters, coalitionViews[coalition], marker, coalition);
  }
  paint();
};

function renderBridge(container, voters, view, marker, coalitionKey) {
  container.innerHTML = "";
  const W = container.clientWidth || document.getElementById("chart-bridge").clientWidth || 680;
  const H = Math.min(W * 0.82, 520);
  const margin = { top: 30, right: 150, bottom: 56, left: 64 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xS = d3.scaleLinear().domain([-1, 1]).range([0, iW]);
  const yS = d3.scaleLinear().domain([0, BRIDGE_TRUST_MAX]).range([iH, 0]);

  // Ideology left/right shading + center line
  g.append("rect").attr("width", iW/2).attr("height", iH).attr("fill", "#1e1826").attr("opacity", 0.5);
  g.append("rect").attr("x", iW/2).attr("width", iW/2).attr("height", iH).attr("fill", "#121b1a").attr("opacity", 0.5);
  g.append("line").attr("x1", iW/2).attr("x2", iW/2).attr("y1", 0).attr("y2", iH)
    .attr("stroke", "#ffffff18").attr("stroke-dasharray", "4,4");

  // all-voter average reference
  g.append("line").attr("x1", 0).attr("x2", iW).attr("y1", yS(0.22)).attr("y2", yS(0.22))
    .attr("stroke", "#ffffff28").attr("stroke-dasharray", "2,3");
  g.append("text").attr("x", 4).attr("y", yS(0.22) - 4)
    .attr("fill", "#ffffff50").attr("font-size", 9).text("all-voter average (0.22)");

  const jittered = window.jitterVoters(voters, { xAmt: 0.13, yAmt: 0.05 });

  // ── Field: the three party blobs (identical to Fig 2) ─────────────────────
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

  // ── Candidate voter-group markers (the dots) over the party field ─────────
  const labelRows = [];
  view.groups.forEach(grp => {
    const exact = voters.filter(grp.filter);                  // un-jittered for stats
    const ws = exact.map(r => r.weight ?? 1);
    const mX = window.wMean(exact.map(r => r.x), ws), mY = window.wMean(exact.map(r => r.y), ws);
    const medX = window.wMedian(exact.map(r => r.x), ws), medY = window.wMedian(exact.map(r => r.y), ws);
    const meanCy = yS(Math.min(BRIDGE_TRUST_MAX, mY));

    // connector when showing both
    if (marker === "both") {
      g.append("line").attr("x1", xS(medX)).attr("y1", yS(medY))
        .attr("x2", xS(mX)).attr("y2", meanCy)
        .attr("stroke", "#fff").attr("stroke-width", 1).attr("opacity", 0.5);
    }
    // dark halo for contrast against same-colored party blobs
    const dot = (cx, cy, fill, ring) => {
      g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 9)
        .attr("fill", "#0f0f13").attr("opacity", 0.45);
      g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 6)
        .attr("fill", fill).attr("stroke", ring).attr("stroke-width", 2);
    };
    // Median marker (filled) — sits inside the blob
    if (marker === "median" || marker === "both") dot(xS(medX), yS(medY), grp.color, "#fff");
    // Mean marker — hollow ring in "both", filled when alone
    if (marker === "mean" || marker === "both")
      dot(xS(mX), meanCy, marker === "both" ? "none" : grp.color, "#fff");

    labelRows.push({ grp, mY, medY, anchorY: yS((medY + mY) / 2) });
  });

  // ── Right-margin labels (spaced) ──────────────────────────────────────────
  const lx = iW + 10;
  labelRows.sort((a, b) => a.anchorY - b.anchorY);
  const minGap = 34;
  for (let i = 1; i < labelRows.length; i++)
    if (labelRows[i].anchorY - labelRows[i-1].anchorY < minGap)
      labelRows[i].anchorY = labelRows[i-1].anchorY + minGap;
  labelRows.forEach(({ grp, mY, medY, anchorY }) => {
    g.append("text").attr("x", lx).attr("y", anchorY - 2)
      .attr("fill", grp.color).attr("font-size", 11).attr("font-weight", "700").text(grp.label);
    const parts = [];
    if (marker === "median" || marker === "both") parts.push(`med ${medY.toFixed(2)}`);
    if (marker === "mean"   || marker === "both") parts.push(`mean ${mY.toFixed(2)}`);
    g.append("text").attr("x", lx).attr("y", anchorY + 10)
      .attr("fill", grp.color).attr("font-size", 9).attr("opacity", 0.75).text(parts.join(" · "));
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

  if (coalitionKey === "general")
    g.append("text").attr("x", 4).attr("y", iH - 4).attr("fill", "#ffffff40").attr("font-size", 9)
      .text("* Sanders shown as primary voters — not on the general ballot");

  const markerWord = marker === "both" ? "median (filled) + mean (hollow)" : marker;
  window.renderFigSpec("data-bridge", {
    population: `<strong>Same party blobs as Fig 2</strong> (Dem/Ind/Rep, all voters), with markers for each candidate's ${coalitionKey === "primary" ? "primary" : "general-election"} voters.`,
    x: "Ideology (V161126), left −1 to right +1.",
    y: "Institutional trust — 3-item index, clipped at 0.6.",
    marks: `Party density blobs (identical to Fig 2) + ${markerWord} marker per candidate group. Trust is floor-skewed, so mean sits above median.`,
  });
}
