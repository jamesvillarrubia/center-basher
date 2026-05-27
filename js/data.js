/**
 * data.js
 *
 * Synthetic placeholder dataset matching the shape of processed ANES output.
 * Replace with real data by running: python src/process_anes.py
 * and loading data/processed/voters_2d.json instead.
 *
 * Schema: { x: number, y: number, party: string, vote: string }
 *   x  : ideology, -1 (left) … +1 (right)
 *   y  : institutional trust index, 0 (no trust) … 1 (full trust)
 *   party: "strong_dem" | "lean_dem" | "independent" | "lean_rep" | "strong_rep"
 *   vote : "clinton" | "trump" | "johnson" | "stein" | "no_vote"
 *   swing: true if voter crossed parties from 2012 (VOTER Survey data)
 */

window.VOTERS = (function () {

  const rng = mulberry32(42);  // deterministic seed

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function randn() {
    // Box-Muller
    const u = rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  const voters = [];

  // --- Strong Dems: center-left, moderate-high trust
  for (let i = 0; i < 320; i++) {
    voters.push({
      x: clamp(-0.55 + randn() * 0.25, -1, 1),
      y: clamp(0.62 + randn() * 0.18, 0, 1),
      party: "strong_dem", vote: "clinton", swing: false,
    });
  }

  // --- Lean Dems: left-center, mixed trust
  for (let i = 0; i < 180; i++) {
    voters.push({
      x: clamp(-0.28 + randn() * 0.28, -1, 1),
      y: clamp(0.50 + randn() * 0.22, 0, 1),
      party: "lean_dem", vote: "clinton", swing: false,
    });
  }

  // --- Strong Reps: center-right, moderate-high trust
  for (let i = 0; i < 310; i++) {
    voters.push({
      x: clamp(0.58 + randn() * 0.22, -1, 1),
      y: clamp(0.55 + randn() * 0.20, 0, 1),
      party: "strong_rep", vote: "trump", swing: false,
    });
  }

  // --- Lean Reps: right-center, mixed trust
  for (let i = 0; i < 160; i++) {
    voters.push({
      x: clamp(0.30 + randn() * 0.28, -1, 1),
      y: clamp(0.46 + randn() * 0.22, 0, 1),
      party: "lean_rep", vote: "trump", swing: false,
    });
  }

  // --- THE KEY GROUP: Independents — spread on ideology, LOW trust
  // This is the thesis cluster: they LOOK centrist on x, but live at bottom of y
  for (let i = 0; i < 280; i++) {
    const x = clamp(randn() * 0.45, -1, 1);   // broad spread, near center on x
    const y = clamp(0.22 + randn() * 0.15, 0, 1);  // low trust
    const vote = x < -0.1
      ? (rng() < 0.45 ? "clinton" : rng() < 0.6 ? "trump" : "johnson")
      : x > 0.1
      ? (rng() < 0.50 ? "trump" : rng() < 0.55 ? "clinton" : "johnson")
      : (rng() < 0.4 ? "trump" : rng() < 0.5 ? "clinton" : "johnson");
    voters.push({ x, y, party: "independent", vote, swing: false });
  }

  // --- Swing voters: explicitly low-trust, span left/right
  // These are the Bernie→Trump people
  for (let i = 0; i < 90; i++) {
    const leftLeaning = rng() < 0.5;
    voters.push({
      x: clamp((leftLeaning ? -0.3 : 0.3) + randn() * 0.35, -1, 1),
      y: clamp(0.16 + randn() * 0.12, 0, 1),
      party: "independent",
      vote: leftLeaning ? (rng() < 0.55 ? "trump" : "clinton") : "trump",
      swing: true,
    });
  }

  // --- Progressives who stayed home or voted Stein
  for (let i = 0; i < 60; i++) {
    voters.push({
      x: clamp(-0.75 + randn() * 0.15, -1, 1),
      y: clamp(0.25 + randn() * 0.20, 0, 1),
      party: "lean_dem", vote: "stein", swing: true,
    });
  }

  // Round for cleaner JSON
  return voters.map(d => ({
    ...d,
    x: +d.x.toFixed(3),
    y: +d.y.toFixed(3),
  }));

})();
