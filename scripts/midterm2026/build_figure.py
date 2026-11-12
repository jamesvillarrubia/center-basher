"""Step 5: draft figure -> web/og-cards/draft-midterm-overperformance.html

Overperformance vs Harris 2024 (y) against net outside spending against the
Democrat in the general, dollars per vote cast (x). Two panels: Third Way's
coding (a) and pre-primary establishment backing (b). Senate by default;
?chamber=H shows the 29 House contested-primary races.

The file name deliberately does not start with "chart-": render-charts.mjs
globs chart-*.html, and this is a draft for review, not a published card.
Data is inlined so the page renders from file:// for screenshots.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import ROOT  # noqa: E402

D = ROOT / "data" / "derived" / "midterm2026"
OUT = ROOT / "web" / "og-cards" / "draft-midterm-overperformance.html"


def main() -> None:
    r = pd.read_csv(D / "races.csv")
    reg = pd.read_csv(D / "regressions.csv")
    b = r[r.dem_vs_rep & r.dem_last.notna() & ((r.chamber == "H") | r.competitive)]
    pts = []
    for x in b.itertuples():
        pts.append({
            "ch": x.chamber, "id": x.race_id, "name": x.dem_last,
            "x": round(float(x.net_outside_against_dem_gen_per_vote), 2),
            "y": round(float(x.over_vs_harris), 2),
            "a": x.coding_a_thirdway if isinstance(x.coding_a_thirdway, str) else None,
            "b": None if pd.isna(x.b_anointed_strict) else int(x.b_anointed_strict),
        })

    def coef(ch: str, coding: str, term: str) -> dict:
        q = reg[(reg.chamber == ch) & (reg.coding == coding) & (reg.term == term) & (reg.y == "over_vs_harris")].iloc[0]
        return {"coef": round(q.coef, 1), "lo": round(q.ci_lo, 1), "hi": round(q.ci_hi, 1), "n": int(q.n)}

    stats = {ch: {"a": coef(ch, "a: Third Way moderate", "a_moderate"),
                  "b": coef(ch, "b: establishment-backed pre-primary (strict)", "b_estab")}
             for ch in ["S", "H"]}
    stats["S"]["b_same"] = coef("S", "b: establishment-backed (strict) [same 11 races as a]", "b_estab")
    html = TEMPLATE.replace("__DATA__", json.dumps(pts)).replace("__STATS__", json.dumps(stats))
    OUT.write_text(html)
    print(f"wrote {OUT.relative_to(ROOT)}: {sum(p['ch'] == 'S' for p in pts)} Senate, "
          f"{sum(p['ch'] == 'H' for p in pts)} House points; stats {stats}")


TEMPLATE = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moderate overperformance draft</title>
<link rel="stylesheet" href="./chart-card.css">
<style>
  .cc-title { font-size: 54px; }
  .toggle { position: absolute; top: 18px; right: 24px; font-size: 15px; color: #8a8880; }
  .toggle a { color: #2c5b9c; margin-left: 8px; }
  @media print { .toggle { display: none; } }
</style></head>
<body>
<div class="chartcard">
  <div class="toggle" id="toggle"></div>
  <div class="cc-claim" id="claim"></div>
  <div class="cc-title" id="title"></div>
  <div class="cc-sub" id="sub"></div>
  <div class="cc-chart"><svg id="fig" viewBox="0 0 1440 500" role="img" aria-label="Overperformance versus outside spending, two codings"></svg></div>
  <div class="cc-foot">
    <div class="cc-source" id="source"></div>
    <div class="cc-btn">thecenterisalie.org</div>
  </div>
</div>
<script>
const PTS = __DATA__;
const STATS = __STATS__;
const ch = new URLSearchParams(location.search).get('chamber') === 'H' ? 'H' : 'S';
const pts = PTS.filter(p => p.ch === ch);
const S = STATS[ch];
const sign = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
document.getElementById('toggle').innerHTML = 'Draft · chamber:' +
  '<a href="?chamber=S">Senate</a><a href="?chamber=H">House</a>';
document.getElementById('claim').innerHTML = '<span class="tag">Third Way</span> ' + (ch === 'S'
  ? '&ldquo;Red-State Democrats&mdash;All Moderates&mdash;Overperformed and Delivered the Senate.&rdquo;'
  : '&ldquo;Moderate Democrats Flipped Red Places Blue and Delivered the House.&rdquo;');
document.getElementById('title').textContent = ch === 'S'
  ? `Recoded by pre-primary backing, the Senate gap falls from ${sign(S.a.coef)} to ${sign(S.b.coef)} points`
  : `In contested House primaries, neither coding shows a moderate premium`;
document.getElementById('sub').textContent = (ch === 'S'
  ? `Competitive 2026 Senate races (Cook rating not Solid, n=${S.b.n}). `
  : `House districts with a progressive-vs-moderate Democratic primary (n=${S.b.n}). `) +
  'Democratic margin minus Harris 2024 margin, against net outside spending against the Democrat in the general.' +
  (ch === 'S' ? ` Coding b on Third Way's ${S.b_same.n} races: ${sign(S.b_same.coef)} (CI ${sign(S.b_same.lo)} to ${sign(S.b_same.hi)}).` : '');
document.getElementById('source').innerHTML =
  'Results: CNN results API, unofficial, 2026-11-05. Harris 2024: CNN (states), The Downballot (districts). ' +
  'Outside spending: FEC independent-expenditure bulk file, 2026-11-05. Coding a: Third Way memos, Nov 4–5 2026. ' +
  'Coding b: pre-primary leadership, party-committee, AIPAC/crypto/AI backing. OLS with Harris margin and outside $ controls, HC3 95% CIs.';

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('fig');
const el = (t, a, txt) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); if (txt != null) n.textContent = txt; svg.appendChild(n); return n; };
const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
const XMIN = Math.floor(Math.min(-5, ...xs) / 10) * 10, XMAX = Math.ceil(Math.max(5, ...xs) / 10) * 10;
const YMIN = Math.floor(Math.min(0, ...ys) / 5) * 5, YMAX = Math.ceil(Math.max(...ys) / 5) * 5;
const PW = 600, PH = 340, TOP = 52, LEFT = [90, 810];
const panels = [
  { key: 'a', title: "(a) Third Way's coding", stat: S.a,
    label: 'Moderate minus others',
    style: p => p.a === 'moderate' ? { fill: '#767676', stroke: '#767676' }
             : p.a === 'leftier' ? { fill: '#2c5b9c', stroke: '#2c5b9c' }
             : { fill: '#fbfbf8', stroke: '#9a9891' },
    legend: [['Moderate', '#767676', true], ['Leftier', '#2c5b9c', true], ['Not coded / unaligned', '#9a9891', false]] },
  { key: 'b', title: '(b) Establishment-backed before the primary', stat: S.b,
    label: 'Backed minus not backed',
    style: p => p.b === 1 ? { fill: '#7a4fa3', stroke: '#7a4fa3' } : { fill: '#fbfbf8', stroke: '#7a4fa3' },
    legend: [['Backed', '#7a4fa3', true], ['Not backed', '#7a4fa3', false]] },
];
panels.forEach((P, i) => {
  const x0 = LEFT[i];
  const sx = v => x0 + (v - XMIN) / (XMAX - XMIN) * PW;
  const sy = v => TOP + (YMAX - v) / (YMAX - YMIN) * PH;
  el('text', { x: x0, y: 22, 'font-size': 24, 'font-weight': 700, fill: '#1b1b1d' }, P.title);
  for (let v = YMIN; v <= YMAX; v += 5) {
    el('line', { x1: x0, x2: x0 + PW, y1: sy(v), y2: sy(v), stroke: v === 0 ? '#c9c6bf' : '#ece9e2', 'stroke-width': 2 });
    if (i === 0 || true) el('text', { x: x0 - 12, y: sy(v) + 7, 'text-anchor': 'end', 'font-size': 18, fill: '#6a6a70' }, (v > 0 ? '+' : '') + v);
  }
  for (let v = XMIN; v <= XMAX; v += 10) {
    el('line', { x1: sx(v), x2: sx(v), y1: TOP, y2: TOP + PH, stroke: v === 0 ? '#c9c6bf' : '#f2f0eb', 'stroke-width': 2 });
    el('text', { x: sx(v), y: TOP + PH + 26, 'text-anchor': 'middle', 'font-size': 18, fill: '#6a6a70' }, (v < 0 ? '−$' : '$') + Math.abs(v));
  }
  el('text', { x: x0 + PW / 2, y: TOP + PH + 54, 'text-anchor': 'middle', 'font-size': 18, fill: '#3a3a3f' },
     'Net outside spending against the Democrat, general election ($ per vote cast)');
  if (i === 0) el('text', { x: 22, y: TOP + PH / 2, 'font-size': 18, fill: '#3a3a3f', transform: `rotate(-90 22 ${TOP + PH / 2})`, 'text-anchor': 'middle' },
     'Ran ahead of Harris 2024 (pts)');
  const dots = pts.map(p => ({ x: sx(p.x), y: sy(p.y) }));
  const placed = [];
  const W = t => t.length * 8.4 + 4, H = 16;
  const hits = (bx, by, w) => placed.some(q => bx < q.x + q.w && bx + w > q.x && by - H < q.y && by > q.y - H)
    || dots.some(d => d.x > bx - 11 && d.x < bx + w + 11 && d.y > by - H - 11 && d.y < by + 11);
  pts.forEach(p => {
    const st = P.style(p);
    el('circle', { cx: sx(p.x), cy: sy(p.y), r: ch === 'S' ? 10 : 8, fill: st.fill, stroke: st.stroke, 'stroke-width': 3 });
  });
  if (ch === 'S') pts.forEach(p => {
    const cx = sx(p.x), cy = sy(p.y), w = W(p.name);
    const cands = [];
    for (const dy of [6, -12, 24, -30, 42, -48, 60]) for (const side of [1, -1])
      for (const dx of [15, 45, 75]) cands.push([side > 0 ? cx + dx : cx - dx - w, cy + dy]);
    cands.sort((a, b) => Math.hypot(a[0] + w / 2 - cx, a[1] - 5 - cy) - Math.hypot(b[0] + w / 2 - cx, b[1] - 5 - cy));
    const ok = cands.find(([bx, by]) => bx >= x0 && bx + w <= x0 + PW && by - H >= TOP && by <= TOP + PH && !hits(bx, by, w)) || cands[0];
    placed.push({ x: ok[0], y: ok[1], w });
    const ex = ok[0] > cx ? ok[0] - 3 : ok[0] + w + 3, ey = ok[1] - 5;
    if (Math.hypot(ex - cx, ey - cy) > 17) el('line', { x1: cx, y1: cy, x2: ex, y2: ey, stroke: '#9a9891', 'stroke-width': 1.5 });
    el('text', { x: ok[0], y: ok[1], 'font-size': 16, fill: '#3a3a3f' }, p.name);
  });
  const s = P.stat;
  el('rect', { x: x0 + 8, y: TOP + PH - 74, width: 292, height: 64, rx: 8, fill: '#efece6' });
  el('text', { x: x0 + 18, y: TOP + PH - 47, 'font-size': 17, fill: '#3a3a3f' }, `${P.label}, n=${s.n}:`);
  el('text', { x: x0 + 18, y: TOP + PH - 21, 'font-size': 20, 'font-weight': 700, fill: '#1b1b1d' },
     `${sign(s.coef)} pts (95% CI ${sign(s.lo)} to ${sign(s.hi)})`);
  let lxp = x0;
  P.legend.forEach(([t, c, filled]) => {
    el('circle', { cx: lxp + 8, cy: TOP + PH + 84, r: 8, fill: filled ? c : '#fbfbf8', stroke: c, 'stroke-width': 3 });
    const tt = el('text', { x: lxp + 24, y: TOP + PH + 90, 'font-size': 17, fill: '#3a3a3f' }, t);
    lxp += 40 + t.length * 8.6;
  });
});
</script>
</body></html>
"""

if __name__ == "__main__":
    main()
