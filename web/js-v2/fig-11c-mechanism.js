// Fig 11c (Option C) — The three-stage mechanism: lost status → distrust → racial framing.
//
// Three boxes arrayed horizontally with elbow connectors between them.
// Each stage names what's happening, with a short rationale underneath.
// Final stage names the vote consequence.

export function drawMechanism(selector) {
  const root = document.querySelector(selector)
  if (!root) throw new Error(`No container at ${selector}`)
  root.innerHTML = `
    <div class="mech-chart">
      <div class="mech-stage mech-stage-1">
        <p class="mech-tag">Stage 1 — the fuel</p>
        <p class="mech-name">Lost status</p>
        <p class="mech-blurb">
          A perceived loss of group standing: <em>"the system now puts other groups
          ahead of people like me."</em> Real income may be flat or up; what changed
          is relative position, not absolute.
        </p>
      </div>

      <div class="mech-arrow" aria-hidden="true">&#8594;</div>

      <div class="mech-stage mech-stage-2">
        <p class="mech-tag">Stage 2 — the symptom</p>
        <p class="mech-name">Distrust in the system</p>
        <p class="mech-blurb">
          The institutional explanation: <em>"the system isn’t working for me,"</em>
          which is the felt symptom of stage 1. But distrust is now near-universal,
          so it stops <em>discriminating</em> between voters.
        </p>
      </div>

      <div class="mech-arrow" aria-hidden="true">&#8594;</div>

      <div class="mech-stage mech-stage-3">
        <p class="mech-tag">Stage 3 — the lens</p>
        <p class="mech-name">Racial framing</p>
        <p class="mech-blurb">
          The easiest narrative explanation: <em>"they took our jobs,"</em>
          <em>"lazy immigrants on the dole."</em> Simpler than the structural
          story of automation, offshoring, and de-unionization, and it has a visible
          out-group to blame.
        </p>
      </div>

      <p class="mech-foot">
        Lost status is the fuel; the racial frame is the easiest match. In the
        VSG panel, racial-resentment items measured in <strong>2011</strong> predict the
        Obama→Trump switch four years later (standardized coefficient
        <strong>+0.66</strong> with full controls). Trust effect: ≈zero.
      </p>
    </div>
  `
}
