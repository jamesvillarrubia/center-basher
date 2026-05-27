/**
 * figspec.js — Renders an explicit "what's in this chart" spec under each figure.
 *
 * Each chart calls renderFigSpec() with the population/axes/marks it actually
 * drew, computing counts from the real arrays so the caption can never drift
 * out of sync with the data. One source of truth: the chart that drew it.
 */

window.renderFigSpec = function (containerId, spec) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const rows = [
    ["Who", spec.population],
    ["X axis", spec.x],
    ["Y axis", spec.y],
    ["Marks", spec.marks],
  ].filter(([, v]) => v);
  el.innerHTML = rows
    .map(([k, v]) =>
      `<div class="fig-data-row"><span class="fig-data-key">${k}</span>` +
      `<span class="fig-data-val">${v}</span></div>`
    )
    .join("");
};
