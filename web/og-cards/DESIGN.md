# Share-card design rules

Every `chart-*.html` card must pass this before it ships. Two halves: the
**machine gate** (`pnpm render:charts` fails loudly) and the **eye gate** (a
fixed checklist for what the machine can't see). The eye gate exists because
every card the reviewer has rejected failed one of its items, not a data one.

---

## 1 · Machine gate — `pnpm render:charts`

The render script prints a warning per card and these must be **zero**:

| Warning | Means | Fix |
|---|---|---|
| `CLIPPED` | content runs past the viewBox | shrink content or grow the viewBox |
| `DEAD SPACE` | >90px unused below the chart | grow the chart to fill it |
| `TEXT OVERLAP` | two labels' boxes intersect >14% | move one label |
| `TEXT OVERFLOWS BOX` | a label is wider/taller than the panel it sits in | shrink the text or grow the panel |

If you changed a card, re-render and confirm its line is clean **before**
looking at the PNG. Do not read the PNG to check for overlaps — that's the
machine's job now, and reading a stale PNG has burned us repeatedly (always
`rm` the PNG first, then render, then read).

---

## 2 · Eye gate — what the machine can't check

Read the rendered PNG once and confirm all six. These are the failures that got
past the machine gate and reached the reviewer.

1. **Contrast.** No mid-tone text on a mid-tone fill. Text on the beige panel
   (`#efece6`) is dark (`#1b1b1d`/`#3a3a3f`) or the accent red (`#b8240f`) —
   never a gray like `#9a9891`. Text on a saturated bar is white. If you can't
   read it at thumbnail size, it fails.

2. **No floating text.** Every text block belongs to something: a title, an
   axis, a bar, a labelled panel, or the footer. Nothing sits alone in the
   lower third as an orphan "kicker." If a line has no home, cut it — the
   subhead already carries the argument.

3. **One idea per zone.** A zone gets at most one section header **and** one
   caption. Don't stack a bracket label *and* a header *and* a subhead over the
   same chart — that's the density that killed the first labelswitch. Pick one.

4. **Display words fit with air.** A big word ("loses", "rarely wins") must sit
   inside its panel with clear margin on both sides, not touch the edges. When
   in doubt, size down — the machine flags true overflow but not a 2px graze.

5. **Focal point.** The eye should land on the headline number or the one hot
   element first. If four things compete equally, mute three.

6. **Labels clear of marks.** A value label must not touch its own dot/bar
   (the machine only checks text-vs-text, not text-vs-shape). Park values above
   / below / beside marks with a real gap.

---

## 3 · Card grammar (the invariants)

- 1600×900 canvas; content column logic lives in `chart-card.css`.
- Claim kicker (the myth) → point-first title → one subhead → chart → source +
  domain button. Never reorder.
- Accent red `#b8240f` = emphasis and genuine party-Republican coding **only**.
  A non-partisan voter category is purple `#7a4fa3`, never red.
- Left = blue `#2c5b9c`, right = red `#b8240f`, middle = gray, "no position" =
  blank/outlined. Left is never red.
- Area must equal share: if a block's size encodes a percentage, its area (not
  a length under a smoothed curve) must be proportional. Flat-topped, not
  splined.
- American spelling. Prefer commas/colons to em-dashes in authored prose.

---

## 4 · The loop

1. Edit the `chart-*.html`.
2. `rm` its PNG, `pnpm render:charts`, confirm **its** warning line is clean.
3. Read the PNG once, run the six-item eye gate.
4. Only then show it or commit it.

Steps 2 and 3 are not optional and not reorderable. The machine gate is fast
and total; the eye gate is the six things the machine can't see.
