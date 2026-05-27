/**
 * jitter.js — Render-time jitter for ordinal ANES data.
 *
 * Ideology (V161126) is 7-point and trust (V161215) is 5-point, so every
 * respondent lands on a 7×5 lattice. Plotting raw values produces visible
 * banding in beeswarms and ringing in density contours. We scatter each
 * point inside its own Likert cell so the clouds read smoothly — without
 * touching the stored data. All statistics are still computed on exact values.
 *
 * Default magnitudes are ~0.4× a half-cell, so a jittered point never reaches
 * a neighboring level's centroid:
 *   ideology half-cell = 0.333/2 ≈ 0.167  → xAmt 0.13
 *   trust    half-cell = 0.25/2  = 0.125  → yAmt 0.10
 *
 * Seeded so repeated draws are stable (no shimmer on resize/redraw).
 */

function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

window.jitterVoters = function (voters, opts = {}) {
  const xAmt = opts.xAmt ?? 0.13;
  const yAmt = opts.yAmt ?? 0.10;
  const rng = makeRng(opts.seed ?? 1337);
  return voters.map(d => ({
    ...d,
    x: d.x + (rng() - 0.5) * 2 * xAmt,
    y: Math.max(0, Math.min(1, d.y + (rng() - 0.5) * 2 * yAmt)),
  }));
};
