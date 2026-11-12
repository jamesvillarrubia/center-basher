# The wave didn't check IDs

Draft essay, 2026-11-08, in the voice of thecenterisalie.org. Numbers footnoted to the results
files on branch analysis/2026-moderate-overperformance; notes at the end.

---

## The memo

Third Way published its verdict on the 2026 midterms before the votes were all counted:
"Moderates Made Democratic Majorities." Centrist groups tell that story after every election.
When Democrats lose, the left dragged them down; when Democrats win, the moderates carried them.
So we checked the claim race by race, against the vote counts, the endorsement lists, and every
Facebook and Instagram ad the campaigns ran.

## Everyone rode the wave

Democrats ran ahead of Kamala Harris's 2024 margin in 412 of the 417 House races with a Democrat
facing a Republican, by an average of 14.4 points.[1] About four-fifths of that gain was the same
national shift showing up in every district; about a fifth varied with the candidate and the
race.[1] Third Way says its endorsed flippers ran 15 points ahead of Harris. The average Democrat
on the ballot, endorsed or not, ran 14.4 points ahead.[2]

## Moderates and progressives rode it equally

Did the wave lift moderates higher? We compared House Democrats in the same state, in the same
kind of seat, against the same Harris baseline. Progressive-backed nominees ran 0.7 points further
ahead than unaligned nominees, and moderate-backed nominees ran 1.4 points further ahead, and the
two estimates sit almost on top of each other.[3] In the 30 districts where a progressive and a
moderate fought it out in the primary, the moderate nominees ran 3.7 points *behind* the others,
though that gap is inside the noise too.[4] Progressives paid no measurable electability tax in
either comparison.

## The moderates nobody picked

Third Way's Senate numbers look strongest, so we sorted its seven Senate "moderates" by who backed
them before the primary. Chuck Schumer recruited or backed three of them: Ossoff, Cooper and Brown.
The other four, Talarico in Texas, Andrews in South Carolina, Hamilton in Kansas and Turek in Iowa,
won their nominations without the party's blessing. Those four ran 21.7 points ahead of Harris;
Schumer's three ran 19.7.[5] James Talarico ran 25.8 points ahead of Harris in Texas, the biggest
gain of any Senate Democrat in the country, after Schumer said he had "no preference" in the
primary and a progressive group endorsed Talarico.[6] Schumer's backing did not produce the red-state
gains Third Way is crediting to moderation.

## "Socialist" didn't stick

Republicans spent about 13% of their issue-ad money calling Democrats socialists, radical leftists
and Mamdani clones; Democrats spent about 1% of theirs on the subject.[7] The NRCC published a list
of 26 Democrats it planned to tag as socialists. Those 26 ran 0.9 points further ahead of Harris
than other Democrats.[8] In districts where Republicans spent the most per voter on socialism ads,
the Democrat ran slightly further ahead.[9] The seven nominees endorsed by the Democratic Socialists
of America ran 5.2 points further ahead than other Democrats; with seven races, that number is a
lean in their favor, too few to call a finding.[8] Republicans paid for the socialist attack, and
Democratic margins did not drop where they paid most.

## Party leadership's picks

Hakeem Jeffries, the DCCC and Schumer pick candidates on the theory that they know who can win.
Nominees they backed before the primary ran 0.7 points ahead of comparable Democrats, and
leadership's hand-picked House recruits ran 0.2 points *behind*; neither number is distinguishable
from zero.[10] Democrats flipped 42 House seats. Leadership backed 14 of those winners before their
primaries, endorsed 12 more only after they had already won their primaries, and never endorsed the
other 16, most of them in Trump districts the party had not targeted.[11] Twenty-eight of the 42
flips went to candidates leadership did not pick before the primary.

Six House candidates beat a leadership-backed rival in the primary. Five of the six won in November,
including Amish Shah, who flipped a Republican seat in Arizona.[12]

## Everyone talked about prices

Democrats and Republicans each put a little over 40% of their issue-ad money into the cost of
living.[7] The parties gave different answers. Republicans put 31% of their price-and-health ad
money into tax cuts, against 5% for Democrats, and blamed Biden-era spending; Democrats blamed
Trump's tariffs, his war, and his policies.[13] We then tested whether any Democratic price
message, the populist one, the blame-Trump one, or plain "lower costs," predicted which Democrats
ran furthest ahead. None of them did.[14] The trust argument on this site predicts that result:
voters in 2026 were judging whether the people in charge had failed them, and the details of each
candidate's price plan did not change their answer.

## Limits of the data

None of these numbers shows that progressives win more. Most of the results are nulls: they show a
moderate advantage too small to measure, not a hidden progressive one. The Senate gives the center
its best counterexample. El-Sayed in Michigan, Flanagan in Minnesota and Jackson in Maine each beat
Schumer's preferred candidate, and all three won, but each ran 5 to 13 points behind what their
state's lean predicted, in a comparison of three races against three.[15] The data does rule out
the premium centrists promise for picking the moderate, the insider, or the party's recruit.

## The bottom line

Centrists tell Democrats that a progressive nominee costs votes. We looked for that cost across 417
House races, 35 Senate races, nearly 15,000 ad texts and every leadership endorsement we could
source, and we could not find it. Without that cost, Democrats can pick nominees on the question
centrists keep telling them to skip: which candidate will fight for the voters?

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
