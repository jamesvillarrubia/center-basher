# Opponent quote bank

The rebuttal deck works claim → rebuttal. The **claim** is whatever a real
opponent actually says; the card is the data that answers *that sentence*. This
is the bank of real, sourced electability quotes to match cards to. See the
doctrine and the honesty guardrail in `web/og-cards/DESIGN.md` §5–§6.

**On-card attribution rule:** a name on a card requires the **verbatim** words
and a **primary citation**. Anything short of that stays a *representative*
claim ("The claim: …"), never pinned to a person. The `Status` column tracks
which quotes have cleared that bar.

| Opponent | Quote | Source | Status | Rebutted by |
|---|---|---|---|---|
| James Carville | "It's the economy, stupid." | Clinton war room, 1992 (iconic, universally attributed) | ✅ verbatim | `fundamentals` |
| Third Way (@ThirdWayTweet) | "We must focus on candidates that will appeal to the most people, not those that are ideologically pure." | X post quoting Sr Fellow Caitlin Legacki, UChicago event | ✅ verbatim | `mostpeople`, `labelswitch` |
| Rahm Emanuel | brand is "weak and woke"; the way back is "the center" | WSJ interview w/ John McCormick, May 2025 | ⚠️ "weak and woke" verbatim; "the center" is the essay's paraphrase — confirm exact WSJ wording before naming him on a card | `insideoutside`, `latetotheleft`, `mostpeople` |
| James Carville | "woke stuff is killing us" / "too many preachy females" | e.g. NYT, March 2024 | ⚠️ confirm exact wording + which outlet before on-card use | (culture-war card, TBD) |
| WelcomePAC (Simon Bazelon et al.) | post-2012 leftward drift cost moderate + working-class voters — but prescribes *popular* positions, not reflexively centrist ones | "Deciding to Win" report, Oct 2025, decidingtowin.org | ✅ report is public | `proposals`, `m4a` (their own "popular not centrist" framing is a gift) |
| Bill Clinton / DLC | triangulate to "the center" | 1992 onward | representative | whole-thesis cards |

## How to use it

1. A real quote comes in (a tweet, an op-ed, a memo). Find the card whose
   rebuttal answers *that specific claim*.
2. If the quote is ✅ verbatim + sourced, put the name + words in the claim
   slot (tag = the name, like `mostpeople` uses "Third Way").
3. If ⚠️ or representative, keep the claim generic ("The claim: …") and do not
   attribute to the person until the wording is confirmed.

## Notes

- WelcomePAC is the interesting one: their own report concedes the party should
  take *popular* positions rather than reflexively centrist ones. That's our
  argument in a centrist report's mouth — the strongest possible `proposals`
  framing if we want to name it.
- Carville appears twice (economy maxim + culture-war). The economy one is the
  cleaner card because `fundamentals` refutes it directly with the same data he
  was implicitly invoking.
