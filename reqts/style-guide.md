# Plain-language voice — style guide

This is a forensic analysis of the prose in `plain-language.md` so that future passes
(by me, by you, by another agent) can mirror your voice mechanically rather than approximate it.

**Audience targets:**
- **Body / ledes:** sharp 10th-grade reader, no political-science background, but engaged.
- **Notes blocks:** a graduate-level political-science reader who will adversarially attack every
  statistical claim.
- **The combined effect** is a piece a Democratic campaign leader reads and changes their mind, and a
  pundit cannot rebut without giving up "electability" as a concept.

---

## 1 · Voice — what to mirror

### Person and address
- **First-person plural ("we")** is the default narrative voice — *"we checked," "we hold this loosely,"
  "we keep asking."* Reader is being walked through an investigation alongside the author.
- **First-person singular ("I")** appears for moments of explicit authorial judgment or thesis —
  *"I've been using a lot of 2016 references," "My thesis is that 2016 was…"* — never for routine
  argumentation.
- **Direct second-person ("you")** appears when staging a scenario for the reader —
  *"You see that the biggest single clump…," "You work for Candidate A."* Always concrete; never
  generic "one."

### Sentence cadence
- **Short sentences after long ones** for emphasis. *"It's a comforting story — and it's a lie."*
- **Sentence fragments** for punctuation: *"Whoops." "Sort of." "No stakes." "Oof. Bleak."* Use
  sparingly — one fragment ends a thought; a fragment in the middle of a long passage is jarring.
- **Em-dashes, sparingly.** Use for genuine sharp contrasts, mid-sentence pivots, and the occasional
  punchy aside. Default to a period, comma, colon, or parentheses instead. **Soft cap: 1–2 em-dashes
  per section of body prose.** Notes blocks and reviewer callouts can be more relaxed (they're dense
  reference material, not paced narrative). When in doubt, swap a body-prose em-dash for a period:
  short sentences read sharper than em-dash-stitched long ones. *Rule tightened 2026-05-30 (from
  "liberally; two per sentence is fine"); the earlier rule produced an em-dash-heavy draft.*

### Diction and word choice
- **Everyday English over jargon.** *"get off the couch," "drag people to the polls," "knock on this
  door."* Concrete verbs.
- **Quoted phrases for shopworn ideas** the reader will recognize — *"move to the center," "don't
  scare the moderates," "she'll say anything."* Use quotation marks; don't endorse.
- **Coined labels in CapCase** for analytic categories the reader will need to track —
  *True Middlers, Grab-Baggers, Whatevers, System Believers, System Critics.* Define at first use;
  reuse without redefining.
- **Italicize an emphasized word** at most twice in a paragraph — *"the disaffected are the ones
  who **bolt**."*
- **Bold for the load-bearing claim** of a sentence or paragraph — typically a number or a
  three-to-six-word verdict — *"about **1 in 100 voters** is the kind of moderate the electability
  pitch imagines."*

### Asides and authorial register
- **Conversational interjections** are part of the voice — *"Sort of." "Funny enough," "Whoops.,"
  "Just for you.", "Not crazy."* Keep them; they make a stats argument feel like an interrogation.
- **Editorial verdict words** that close a thought: *"Whoops." "Bleak." "Not crazy." "Same act,
  opposite reaction."*
- **Mild understatement** in place of editorial fire: "*they're not the bloc you'd think.*"

### Names and proper nouns
- The user spells **"Hilary"** (one L) consistently. Preserve verbatim — it's a character marker;
  don't silently "correct" it.
- A handful of other typos appear in the user's prose ("campagin," "estbalished," "annointment,"
  "politcally," "recongition," "Nothin," "institutinalist," "wealthy" used twice). **Do not
  silently correct.** Flag in a callout if a fix would change meaning; otherwise leave.

---

## 2 · Structural conventions — the "blunt chain"

The user explicitly identified the desired structure: **"Okay, given A, here's B. Okay, given B,
here's C. Okay, given C, here's D."** Each new beat starts by *briefly* restating the prior
conclusion and then introducing the next move. The chain is the whole engine.

### Transitional formulas the user actually uses
| Function | Phrases (use these verbatim or close) |
|---|---|
| Open a section | *"Let us start with one fact…", "Here's what we found…", "Now we must look at…"* |
| Restate prior beat to set up next | *"Well if [last point], then…"; "So if [last point], what can…?"; "Okay — behind the idea of [last point]…"* |
| Discovery / pivot | *"Turns out…", "Funny enough…", "Here's the surprising part."* |
| List-up | *"First, let's note…", "Second, let's note…"* |
| Rhetorical handoff | *"What does that leave us with?", "And again, we aren't talking about [X]… we are talking about [Y]."* |
| Concession before pivot | *"Sort of.", "Not crazy.", "Trust looks irrelevant."* |
| Verdict line | Short bold or italic line — *"It's a comforting story — and it's a lie."* |
| Stage-setter | *"Reflect on…", "Imagine you are planning…"* |

### Paragraph shape
A typical successful paragraph in your file has this shape:
1. **Set-up question or claim** (1 sentence)
2. **The data answer** (1–3 sentences with bolded number and one inline [N])
3. **Make it concrete** (1 sentence with a scene or quote)
4. **Verdict** (short, sometimes a fragment)

Bad paragraph shapes to avoid:
- Three sentences of data with no connective tissue.
- Re-stating the same finding twice in different words within a paragraph.
- A new term introduced mid-paragraph without naming.

### Section shape
1. **Open** with a transitional phrase that recaps the prior section in *one* clause.
2. **Pose the question** the section answers.
3. **Answer** with the data (with [N] markers).
4. **Tighten or generalize** in a verdict line.
5. **Notes block** with citations and analysis defenses.

---

## 3 · Logic flow — fixes for the "A, B, C, C, D, B, D, A" problem

You correctly diagnosed the file as having local redundancy and out-of-order claim chains. The
specific patterns to police:

1. **Stating a finding twice in different wording.** If the same number appears in two paragraphs of a
   section, the second mention should be a callback, not a restatement. Example fix in §7: the
   "40% / 21%" within-tent swing rate appears in both the body and the closing verdict; the closing
   should be a *verdict* about the meaning of that number, not a re-statement of it.
2. **Foreshadowing the answer before posing the question.** Sections sometimes name the conclusion
   in paragraph 1 and then "discover" it in paragraph 3. Either skip the foreshadow or skip the
   re-statement.
3. **Two unrelated thoughts under one section.** §11 has *"what flips a switcher"* (race/status engine)
   AND *"the swing is a headwind, not a sale"* (campaign-strategy implication) AND *"Bernie and Trump
   had a discovery window, Hilary did not"* (historical aside). Each is good; together they fuzz the
   argument. Either split into sub-beats or use a single explicit transition.
4. **Defining a term twice or using a term without defining.** System Believers / System Critics are
   defined in §7, then mostly dropped through §11, then resurface in §14. Either keep them threaded
   through every section that touches institutional trust, or retire them and use plain language
   ("distrustful voters") consistently.

---

## 4 · Terminology — one word, one meaning

The file currently uses some words to mean different things in different places. Fix by picking
one meaning each and either using it consistently or naming the others explicitly.

| Term | Single canonical meaning | What to do with conflicting uses |
|---|---|---|
| **moderate** | self-placement at the middle of the 7-pt lib-con scale | flagged in §1 [2] — keep |
| **centrist** | consistent middle policy positions on a multi-issue composite | flagged in §1 [2] — keep |
| **swing voter** | someone whose behavior (cross-cycle or cross-party-line) puts them in play | §7 currently uses both "swing voter" (the person) and "swing rate" (a defection rate including third-party + non-vote). Pick one; if both are needed, label the broader one *"defection rate"* not *"swing rate"* |
| **persuadable** | a swing voter you are trying to move on choice (a subset, not a synonym) | use as defined in §5; don't substitute "swing voter" |
| **System Believer / Critic** | voters with high / low institutional trust, as their preferred frame for politics | introduce in §7; use *consistently* in §11, §14, §15. Drop "distrustful voter" where "System Critic" would do the same work |
| **trust** | institutional trust in government and political system | when you mean *interpersonal trust between voter and candidate* (as in §10 "voters trust you as one of them"), label it explicitly — *"trust in the candidate as one of them"* — to avoid collapse with institutional trust |
| **the establishment / establishment candidate** | the candidate cast as the current system's continuity figure | preferred over "institutionalist" (which is a noun for the type of voter) — use *"establishment candidate"* in body, *"institutionalist voter"* if and only if you mean a high-trust voter |
| **the lane** | a candidate's positioning on the outsider–establishment axis | keep — vivid and unique to this argument |
| **the headwind** | the structural force pushing the candidate toward a loss | keep — also unique |

---

## 5 · The reviewer-callout format (NEW — used in this iteration)

When a claim cannot yet be supported, when a number is contested, or when external data needs to be
fetched, use **GitHub-flavored Markdown alert blocks** so the gaps are visually distinct from prose
in any modern markdown renderer.

| Block | Use for |
|---|---|
| `> [!IMPORTANT]` | **You must decide** — phrasing, definition, framing, what to publish |
| `> [!WARNING]` | **Claim not yet proven** — explain what would be needed to prove it |
| `> [!TIP]` | **Possible data source** — concrete suggestion for what to fetch and where |
| `> [!NOTE]` | **Honest correction or caveat** — survives but with conditions |

Inside each block, write in third person about you ("the reader / the author") and first person
about me ("I"), so the block reads as a sidebar from me to you. Always end with either a concrete
ask or a one-line action — never a vague "consider this."

Example:
```
> [!WARNING]
> **Claim not yet proven** — *"The anti-Trump messaging hit diminishing returns in 2024."*
> The body line above is grounded in your political reading of 2024 but I cannot back it from our
> loaded datasets. To support it I would need: (a) Catalist's 2024 post-mortem; (b) Blue Rose's
> message-test panel; (c) NYT/Cohn drop-off analyses. **Action:** say "go fetch" and I'll pull them.
```

Place callouts *adjacent to the prose they qualify* — not in a footnote, and not at the end of the
section. The reader (you) should see the gap exactly where the gap occurs.

---

## 6 · What I will mirror, mechanically

When I make a targeted rewrite to your prose, I will:

1. **Preserve every sentence that already works** — and most of them do. Targeted rewrites only.
2. **Keep your transitional phrases** — *Okay, Well, Sort of, Funny enough, Turns out*.
3. **Preserve your CapCase labels** — *True Middlers, System Critics, the Whatever moderates*.
4. **Preserve your "Hilary" spelling** and other distinctive markers. Flag typos in a callout only
   when correction would change meaning.
5. **Use em-dashes lightly** (updated 2026-05-30). Default to periods, commas, colons, or parentheses.
   Two em-dashes per *section* is the new ceiling, not per sentence. The earlier rule encouraged
   em-dash density; it produced a draft that read em-dash-heavy.
6. **Match bold/italic density** — load-bearing claims in bold, single-word emphases in italic. Not
   the other way.
7. **Cap each paragraph at ~5 sentences** unless it's an argued paragraph that needs more.
8. **Never introduce a new analytic term I have not first defined** in a Notes block or a coined
   CapCase label.
9. **Never silently soften a finding.** If the data contradicts a body line, the rewrite must say
   so in a callout — not by quietly editing the body.

What I will **not** do without asking:
- Renumber sections (you asked once in this conversation; otherwise check).
- Delete a paragraph the user wrote, even if I think it's redundant — I will mark it `> [!IMPORTANT]
  consider cutting` and let you decide.
- Change a CapCase label (System Believer → "trusting voter") — those are author-chosen.
- Re-order the parts (I → VI).

---

## 7 · The combined target

Read the lede out loud to a 10th-grader cold; they should follow the logic. Read the notes block
to a political-science PhD; they should know exactly what data was run and not be able to attack
the spec. The space between those two registers is where the essay does its work — the lede is
the punch; the notes block is the chassis.
