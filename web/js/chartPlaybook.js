/**
 * chartPlaybook.js — Figure 1B: the conventional campaign playbook (the "9-box").
 *
 * Faithful reproduction of the standard field-organizing targeting grid
 * (adapted from NGP VAN, "Field Organizing that Wins Campaigns"):
 *   rows = voting frequency (high / infrequent / low)
 *   cols = partisanship (always-Dem / persuadable / always-Rep)
 * Two plays: PERSUASION (the persuadable column) and GOTV (the Dem column's
 * lower-frequency rows). The opposition column and the low-frequency persuadable
 * cell are crossed out ("don't contact").
 *
 * Narrative role: this is the operational conventional wisdom — partisanship ×
 * frequency, with persuasion + GOTV as the two plays (the practitioner's version
 * of the two levers). The essay re-bases it on TRUST. The crossed-out bottom-middle
 * cell (low-frequency persuadables) is exactly the disaffected, low-trust mass we
 * argue elections are won in — abandoned here as "rarely votes."
 */

window.drawPlaybook = function () {
  const el = document.getElementById("chart-playbook");
  if (!el) return;

  const DEM = "rgba(91,156,246,0.16)", PSU = "rgba(201,127,255,0.16)", REP = "rgba(240,96,96,0.13)";
  const XCELL = "rgba(120,120,140,0.08)";

  const cell = (bg, title, sub, muted, ring) =>
    `<div style="background:${bg};border-radius:7px;padding:9px 8px;min-height:46px;display:flex;flex-direction:column;justify-content:center;${ring ? "outline:2px solid #5b9cf6;outline-offset:-2px;" : ""}">
       <div style="font-size:11px;font-weight:700;color:${muted ? "#6a6a82" : "#e8e8f0"}">${title}</div>
       ${sub ? `<div style="font-size:9px;color:#8888a8;margin-top:1px">${sub}</div>` : ""}
     </div>`;
  const colHead = t => `<div style="font-size:10.5px;font-weight:800;color:#cfd6ea;text-align:center;padding:2px">${t}</div>`;
  const rowHead = (t, sub) => `<div style="align-self:center;text-align:right;padding-right:8px"><div style="font-size:10.5px;font-weight:700;color:#cfd6ea">${t}</div><div style="font-size:9px;color:#8888a8">${sub}</div></div>`;

  el.innerHTML =
    `<div style="font-size:10px;font-weight:800;letter-spacing:0.08em;color:#8888a8;text-align:center;margin-bottom:6px">PARTISANSHIP →</div>
     <div style="display:grid;grid-template-columns:78px 1fr 1fr 1fr;gap:6px;align-items:stretch">
       <div></div>
       ${colHead("Always vote Democratic")}
       ${colHead("Persuadable")}
       ${colHead("Always vote Republican")}

       ${rowHead("High freq.", "always votes")}
       ${cell(DEM, "Volunteer + Donor", "your base", false, false)}
       ${cell(PSU, "Persuasion · Tier 1", "the swing", false, false)}
       ${cell(XCELL, "✕", "don't contact", true, false)}

       ${rowHead("Infrequent", "sometimes votes")}
       ${cell(DEM, "GOTV · Tier 1", "mobilize", false, false)}
       ${cell(PSU, "Persuasion · Tier 2", "the swing", false, false)}
       ${cell(XCELL, "✕", "don't contact", true, false)}

       ${rowHead("Low freq.", "rarely votes")}
       ${cell(DEM, "GOTV · Tier 2", "mobilize", false, false)}
       ${cell(XCELL, "✕", "“not worth contacting”", true, true)}
       ${cell(XCELL, "✕", "don't contact", true, false)}
     </div>
     <div style="margin-top:8px;font-size:9px;color:#6a6a82;text-align:right">Adapted from NGP VAN, “Field Organizing that Wins Campaigns.”</div>`;

  window.renderFigSpec("data-playbook", {
    population: "The standard field-organizing targeting grid (adapted from NGP VAN) — how campaigns actually segment voters. Not data; the operational conventional wisdom.",
    marks: "Rows = voting frequency, columns = partisanship. Two plays: PERSUASION (the persuadable column) and GOTV (the Democratic column's lower-frequency rows). The opposition column is written off — and so is the low-frequency persuadable cell (outlined), the disaffected low-trust mass this essay argues elections are won in. Note the axes: partisanship and frequency — not trust.",
  });
};
