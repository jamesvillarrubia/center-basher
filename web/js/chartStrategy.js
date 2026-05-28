/**
 * chartStrategy.js — Figure 13: two candidate strategies × the two levers.
 *
 * A synthesis matrix (not new data) — it maps the choice we've built up onto the
 * two levers, each cell anchored to a prior figure's real number:
 *   - CHOICE lever  = trust-proximity decides the vote (Fig 7: 22-pt defection)
 *   - TURNOUT lever = affect + contact, not policy (Fig 6B: policy ≈0; Fig 7: the
 *     well breaks against an establishment candidate, so mobilizing it backfires)
 * Establishment candidate: far above the well + sticky perception (Fig 12) → loses
 * both. Native outsider: starts in the well + self-generates affect → wins both.
 */

window.drawStrategyMatrix = function () {
  const el = document.getElementById("chart-strategy");
  if (!el) return;

  const cell = (mark, color, html) =>
    `<div style="background:${color};border-radius:8px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start">
       <span style="font-size:18px;font-weight:800;line-height:1.1;flex:0 0 auto">${mark}</span>
       <span style="font-size:12px;line-height:1.35;color:#dfe3ef">${html}</span>
     </div>`;
  const colHead = (t, sub) =>
    `<div style="padding:4px 6px"><div style="font-size:12px;font-weight:800;color:#fff">${t}</div>
       <div style="font-size:9.5px;color:#8888a8">${sub}</div></div>`;
  const rowHead = (t, sub) =>
    `<div style="padding:8px 6px;align-self:center"><div style="font-size:12px;font-weight:800;color:#fff">${t}</div>
       <div style="font-size:9.5px;color:#8888a8">${sub}</div></div>`;

  const RED = "rgba(240,96,96,0.12)", GRN = "rgba(95,207,142,0.13)";
  const X = `<span style="color:#f06060">✗</span>`, V = `<span style="color:#5fcf8e">✓</span>`;

  el.innerHTML =
    `<div style="display:grid;grid-template-columns:118px 1fr 1fr;gap:8px;align-items:stretch">
       <div></div>
       ${colHead("Win their CHOICE", "trust-proximity → vote")}
       ${colHead("Move their TURNOUT", "affect &amp; contact")}

       ${rowHead("Establishment", "high-trust, far above the well")}
       ${cell(X, RED, "Far above the well, and perceived trust is <strong>sticky</strong> — a progressive record didn't pull Clinton down (Fig 12). Can't win the well's choice.")}
       ${cell(X, RED, "Mobilizing the low-trust well turns out voters who <strong>break against you</strong> (Fig 7); a policy pivot moves turnout <strong>≈0</strong> (Fig 6B).")}

       ${rowHead("Native outsider", "starts in the well")}
       ${cell(V, GRN, "Sits in the well → <strong>wins it on trust</strong> (low-trust non-Republicans defect 22 pts as trust falls, Fig 7).")}
       ${cell(V, GRN, "Generates <strong>affect + earned media</strong> — the only things that actually move turnout (Fig 6B).")}
     </div>
     <div style="margin-top:12px;font-size:11px;color:#c9b96e;font-weight:700;text-align:center">
       2016: the party chose the top row over a candidate sitting in the bottom row — and the contestable votes were bottom-left.
     </div>`;

  window.renderFigSpec("data-strategy", {
    population: "Synthesis matrix (not new data): two candidate types × the two levers, each cell anchored to a prior figure's number.",
    marks: "Establishment/high-trust candidate loses both levers — far above the well with sticky perception (Fig 12), and mobilizing the well backfires (Fig 7) while policy moves turnout ≈0 (Fig 6B). A native outsider wins both — in the well on trust (Fig 7) and self-generating the affect that moves turnout (Fig 6B). The positional lever is CHOICE-via-trust; pick candidates already near the base's trust.",
  });
};
