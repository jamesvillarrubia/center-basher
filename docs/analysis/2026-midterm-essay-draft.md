# The wave didn't check IDs

Draft essay, 2026-11-08, in the voice of thecenterisalie.org. Numbers footnoted to the results
files on branch analysis/2026-moderate-overperformance; notes at the end.

---

## The memo

The votes weren't all counted yet when Third Way published its verdict on the 2026 midterms:
"Moderates Made Democratic Majorities." It is a tidy story, and it is the same story the center
tells after every election, win or lose. When Democrats lose, it's because they drifted left; when
they win, it's because the moderates carried them. So we did the boring thing and checked, race by
race, using the actual vote counts, the actual endorsement lists, and every Facebook and Instagram
ad the campaigns ran.

## Everyone rode the wave

Start with the one fact that swallows most of the others. In 412 of the 417 House races with a
Democrat facing a Republican, the Democrat ran ahead of Kamala Harris's 2024 number in that
district, by an average of 14.4 points.[1] Roughly four-fifths of that gain was the same national
tide lifting every boat, and only a fifth had anything to do with the particular candidate in the
particular race.[1] Third Way's headline stat is that its endorsed flippers ran 15 points ahead of
Harris, which sounds impressive right up until you notice that the average Democrat on the ballot,
endorsed or not, ran 14.4 points ahead.[2]

## Same ride, either lane

So if the wave lifted everybody, did it lift moderates higher? Compare House Democrats in similar
seats, in the same state, against the same Harris baseline, and the answer is no: progressive-backed
nominees ran 0.7 points further ahead than unaligned ones and moderate-backed nominees 1.4 points,
a difference so small that the two estimates sit almost entirely on top of each other.[3] In the 30
districts where a progressive and a moderate actually fought it out in the primary, the moderates
who won went on to run 3.7 points *behind*, though that gap is inside the noise too.[4] Either way,
the "electability tax" progressives are supposed to pay never shows up on the bill.

## The moderates nobody picked

The Senate is where Third Way's case looks strongest, and it's worth slowing down on, because the
details flip it. Of the seven Senate candidates Third Way counts as moderate, three were recruited
or backed by Chuck Schumer before their primaries, and four (Talarico in Texas, Andrews in South
Carolina, Hamilton in Kansas, Turek in Iowa) got there without the party's blessing. The four
unblessed candidates ran 21.7 points ahead of Harris; the three Schumer picks ran 19.7.[5] And the
single biggest overperformance by any Senate Democrat in the country, James Talarico's 25.8 points
in Texas, came from a candidate Schumer said he had "no preference" on and a progressive group
endorsed.[6] Whatever was working in those red states, it wasn't the establishment's seal of
approval.

## The word that didn't work

Republicans had a plan for all of this, and it was one word. They spent about 13% of their
issue-ad money calling Democrats socialists, radical leftists, and Mamdani clones, against about 1%
for Democrats.[7] The NRCC even published a list of 26 Democrats it planned to hang the label on.
Those 26 went on to run 0.9 points further ahead of Harris than other Democrats.[8] In the races
where Republicans spent the most per voter on socialism ads, the Democrat actually ran a bit further
ahead.[9] And the handful of nominees actually endorsed by the Democratic Socialists of
America ran 5.2 points further ahead than everyone else, which we'd love to call a landslide, but
with seven races it is honestly a shrug in the right direction.[8] The scariest word in centrist
politics turned out to be a waste of ad money.

## The gatekeepers' scorecard

If moderation is the safe bet, the people who place those bets for the party should have a good
record. Nominees backed before their primary
by Hakeem Jeffries, the DCCC or Schumer ran 0.7 points ahead of comparable Democrats, and leadership's
hand-picked House recruits ran 0.2 points *behind*, both statistically indistinguishable from
zero.[10] Meanwhile Democrats flipped 42 House seats, and leadership had backed just 14 of those
winners before they won their primaries. Twelve more got leadership's endorsement only after they
had already won, and 16 never got it at all, mostly in Trump districts the party had written
off.[11] Two out of every three seats that built the majority went to someone the party didn't pick.

Six House candidates went further and beat a leadership-backed rival outright in the primary. Five
of them won in November, including Amish Shah, who flipped a Republican seat in Arizona.[12]

## Everyone talked about prices

Here's the part that should bother the center most. Prices were the issue of 2026, and both
parties knew it: Democrats and Republicans each put a little over 40% of their issue-ad money into
the cost of living.[7] What differed was the answer. Republicans offered the classic centrist
economic script, tax cuts (31% of their price-and-health ad money, against 5% for Democrats) and
blaming the last administration's spending; Democrats mostly blamed Trump's tariffs, his war, and
his policies.[13] Then we checked whether any particular price argument, the populist one, the
blame-Trump one, the vague "lower costs" one, predicted which Democrats ran furthest ahead. None
did.[14] That's exactly what the trust story predicts: in an election about whether the people in
charge were failing you, the moment did the persuading, and the policy fine print didn't move
anyone.

## What we can't claim

To be straight about it: none of this proves progressives win more. Most of what we found are
nulls, and a null is a statement about a missing effect, not a hidden one. The Senate also offers
the center its best counterpunch, since the three nominees who beat Schumer's pick (El-Sayed in
Michigan, Flanagan in Minnesota, Jackson in Maine) all won, but each ran 5 to 13 points behind
what their state's lean predicted, with only three races on each side to compare.[15] What the
data does show is narrower and, for the center, more damaging: the premium it promises for
picking the moderate, the insider, or the safe recruit isn't there to collect.

## The bottom line

The center's argument has always been a bet on a price tag: choose the progressive and you pay at
the ballot box. In 2026 we went looking for the bill across 417 House races, 35 Senate races,
nearly 15,000 ad texts and every leadership endorsement we could source, and we couldn't find it.
If the electability tax doesn't exist, then the only question left is the one the center keeps
asking voters to skip: which candidate will actually fight for you?

---

## Notes

1. Share of variance from the common shift: `data/derived/midterm2026/factors_wave.csv`. CNN 2026
   House counts against Harris 2024 by district.
2. `reqts/midterm-2026-moderate-overperformance.md` section 4.
3. `data/derived/midterm2026/house_drivers_coefs.csv`: OLS with state fixed effects, seat type and
   Harris margin, state-clustered SEs, n 417. Progressive +0.7 (95% CI -1.3 to +2.6); moderate +1.4
   (-0.8 to +3.6).
4. `reqts/midterm-2026-moderate-overperformance.md` section 4: -3.7, CI -10.8 to +3.5, n 30.
5. Same file, Headline and section 2.
6. Same file, sections 1 and 2 (Axios, Dec 9 2025; PCCC endorsement, Feb 24 2026).
7. `reqts/midterm-2026-emphasis.md` section 13: Meta Ad Library, candidates' own pages, general
   window, mean share of issue-ad money. Codes checked against blind coders (kappa 0.80 or above).
8. `data/derived/midterm2026/labels_models.csv`. NRCC: +0.9, CI -3.0 to +4.8, n 26 (Fox News,
   2025-11-05). DSA: +5.2, CI -1.3 to +11.8, n 7.
9. `data/derived/midterm2026/emphasis/emphasis_models.csv`, P3: +0.9 points per standard deviation
   of Republican socialism spending per vote, CI -0.4 to +2.3, n 36.
10. `data/derived/midterm2026/leadership_models.csv`: any pre-primary backing +0.7 (CI -1.5 to
    +3.0); leadership picks -0.2 (-2.2 to +1.8). Endorsements: `leadership_endorsements.csv`, 103
    sourced rows; the Red to Blue list has 43 of a reported 46 names.
11. `data/derived/midterm2026/leadership_winners_unbacked.csv`.
12. `data/derived/midterm2026/leadership_contested.csv`. The one loss: Dunlap, ME-02.
13. `data/derived/midterm2026/emphasis/frame_party_means.csv`.
14. `data/derived/midterm2026/emphasis/frame_models.csv`, 109 Democrats. Villain framing ran
    slightly behind (-0.3 per +10 share points), which fades below significance with money
    controlled.
15. `reqts/midterm-2026-leadership-and-price-frames.md` section 9.
