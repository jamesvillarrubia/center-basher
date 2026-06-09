// Fig 10 — The trust fork (v3, top-down with elbow connectors).
//
// Vertical Y: input at top, trust pill in the middle, two output boxes
// side-by-side at the bottom. All connectors are right-angle elbows
// (horizontal/vertical segments only), no bezier curves.

export function drawTrustFork(selector) {
  const root = document.querySelector(selector)
  if (!root) throw new Error(`No container at ${selector}`)
  root.innerHTML = `
    <div class="fork-chart">
      <!-- Full-area SVG with elbow connectors -->
      <svg class="fork-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="fork-arrow-up" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="3.6" markerHeight="3.6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#2e7d32"/>
          </marker>
          <marker id="fork-arrow-down" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="3.6" markerHeight="3.6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#b8240f"/>
          </marker>
        </defs>

        <!-- Short trunk: input-bottom (y≈14) → trust-top (y≈18) -->
        <line x1="50" y1="14" x2="50" y2="18"
              stroke="#1b1b1d" stroke-width="0.5"/>

        <!-- Curvy branches: trust-bottom (y≈27) → just above each output box (y≈55) -->
        <!-- Left/authentic branch (green) -->
        <path d="M 50 27 C 50 42, 25 42, 25 55"
              fill="none" stroke="#2e7d32" stroke-width="0.7"
              marker-end="url(#fork-arrow-up)"/>
        <!-- Right/cynical branch (red) -->
        <path d="M 50 27 C 50 42, 75 42, 75 55"
              fill="none" stroke="#b8240f" stroke-width="0.7"
              marker-end="url(#fork-arrow-down)"/>
      </svg>

      <!-- Trust pill, centered horizontally + vertically positioned -->
      <div class="fork-trust-pill">
        <span class="fork-trust-sup">FILTERED BY</span>
        <span class="fork-trust-main">TRUST</span>
      </div>

      <!-- Input box at the top -->
      <div class="fork-box fork-input-box">
        <p class="fork-tag">The same political act</p>
        <p class="fork-input-name">Position reversal</p>
        <p class="fork-input-sub">flipping on a previously-held stance</p>
      </div>

      <!-- Outputs at the bottom, side by side -->
      <div class="fork-box fork-output fork-output--up">
        <p class="fork-tag">Trusted candidate</p>
        <p class="fork-verdict">"Telling it like it is"</p>
        <p class="fork-judgment">authentic · rewarded</p>
        <p class="fork-example">
          Trump reversed on NATO, entitlements, tariffs, abortion, and immigration,
          sometimes within the same speech. Coverage and base reaction held:
          a rule-breaker too honest to keep his story straight.
        </p>
      </div>

      <div class="fork-box fork-output fork-output--down">
        <p class="fork-tag">Distrusted candidate</p>
        <p class="fork-verdict">"She'll say anything"</p>
        <p class="fork-judgment">cynical · punished</p>
        <p class="fork-example">
          Clinton absorbed Sanders’s primary coalition on minimum wage,
          college affordability, and TPP. The same kind of move read as a
          calculating insider repositioning to win the room.
        </p>
      </div>
    </div>
  `
}
