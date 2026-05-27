/**
 * wstats.js — weighted summary stats for ANES survey weights.
 *
 * Records carry a `weight` (V160101, normalized to mean 1). Centroids and
 * medians use these so the figures are representative, not raw respondent
 * counts. Density blobs pass the same weight to d3.contourDensity().weight().
 */

window.wMean = function (values, weights) {
  let sw = 0, swx = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i], w = weights[i] ?? 1;
    if (v == null || !isFinite(v) || w <= 0) continue;
    sw += w; swx += w * v;
  }
  return sw ? swx / sw : null;
};

window.wMedian = function (values, weights) {
  const pairs = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i], w = weights[i] ?? 1;
    if (v == null || !isFinite(v) || w <= 0) continue;
    pairs.push([v, w]);
  }
  if (!pairs.length) return null;
  pairs.sort((a, b) => a[0] - b[0]);
  const total = pairs.reduce((s, p) => s + p[1], 0);
  let cum = 0;
  for (const [v, w] of pairs) {
    cum += w;
    if (cum >= total / 2) return v;
  }
  return pairs[pairs.length - 1][0];
};
