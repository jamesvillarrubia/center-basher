# The 2026 case for progressives, from our data

Draft narrative, 2026-11-08. Every number traces to a file on branch
analysis/2026-moderate-overperformance; sources are in the notes at the end. The skeptic's
section lists what a hostile reader will raise and the answer to each.

## The argument in one paragraph

Third Way says moderates made the 2026 majorities. The data shows a wave that lifted every kind
of Democrat by about the same amount. Progressive nominees ran as far ahead of Harris as
moderates did. The "socialist" attack, which Republicans paid for, did not cost Democrats a
measurable point. Party leadership's picks added nothing, and two of every three seats Democrats
flipped went to nominees leadership had not chosen before their primary. The electability tax on
progressives is a claim no one has measured, and in 2026 it did not appear.

## 1. The wave lifted everyone

Democrats ran ahead of Harris in 412 of 417 House races with a Democrat and a Republican on the
ballot, by 14.4 points on average [1]. About 80% of the variation in that gain is the shared
national shift; 20% is specific to the race [1]. Third Way credits its endorsed flippers with
running 15 points ahead of Harris. Every Democrat on the ballot averaged 14.4 [2].

## 2. Ideology bought nothing either way

With state, seat type and the Harris margin held constant, progressive-backed House nominees ran
0.7 points further ahead than unaligned nominees (95% CI -1.3 to +2.6), and moderate-backed
nominees 1.4 (-0.8 to +3.6) [3]. The two intervals overlap almost entirely. In the 30 districts
with a contested progressive-versus-moderate primary, moderate-endorsed nominees ran 3.7 points
behind (-10.8 to +3.5) [4].

## 3. Third Way's best "moderates" were the ones the party did not pick

Four of Third Way's seven Senate moderates had no establishment backing before their primary:
Talarico, Andrews, Hamilton and Turek. They ran 21.7 points ahead of Harris. The three Schumer
recruits ran 19.7 [5]. Talarico posted the largest overperformance of any Senate Democrat, 25.8
points, after Schumer said he had no preference and the Progressive Change
Campaign Committee endorsed him [6].

## 4. The "socialist" attack did not land

Republicans spent 13% of their issue-ad money on "socialist" and "radical left" attacks, against
1% for Democrats [7]. The 26 Democrats on the NRCC's "socialist" target
list ran 0.9 points further ahead than other Democrats (-3.0 to +4.8) [8]. Where Republicans spent
more per voter on socialism ads, the Democrat ran further ahead, not behind: +0.9 points per
standard step (-0.4 to +2.3) [9]. Nominees endorsed by the Democratic Socialists of America ran
5.2 points further ahead than other Democrats (-1.3 to +11.8) [8].

## 5. Party gatekeeping added nothing and missed the winners

Pre-primary backing from Jeffries, the DCCC or Schumer went with 0.7 points (-1.5 to +3.0);
leadership's own House picks with -0.2 (-2.2 to +1.8) [10]. Democrats flipped 42 House seats.
Leadership backed 14 of those nominees before their primary, 12 only after they had won it, and
16 never [11]. Most of the 16 ran in seats Harris lost by 10 to 18 points, seats leadership did not
treat as winnable.

## 6. Insurgents held the seats they took

Six House nominees beat a leadership-backed rival in their primary. Five won in November:
Bronin (CT-01), McKinney (MI-13), Avila Chevalier (NY-13), Lander (NY-10), and Shah, who flipped
AZ-01 [12]. The one loss, Dunlap in ME-02, came in a seat Trump carried by 9 points.

## 7. Republicans owned the centrist price script

Republicans put 31% of their price-and-health ad money into tax cuts and 13% into blaming Biden;
Democrats 5% and 0.5% [13]. Democrats put 32% into blaming Trump's tariffs, war and policies.
The tax-cut message was the Republican price message in 2026, and Democrats ran ahead of Harris in
412 of 417 House races against it [1].

## Close

The centrist case rests on a premium: pick the moderate and win more. Across 417 House races,
35 Senate races, 14,807 ad texts and 103 sourced leadership endorsements, we cannot find that
premium. Where a nominee is chosen for what they will fight for, the data gives no reason to pay
an electability tax that 2026 never charged.

## What a skeptic will raise

- **"Progressives ran behind moderates on average."** Raw means: progressive-backed 13.5,
  moderate-backed 15.2 [3]. Progressive-backed nominees sit in bluer seats, where there is less
  room above Harris. With seat and state controls the gap is under one point and inside the
  noise.
- **"Senate insurgents underran."** El-Sayed, Flanagan and Jackson won, but each ran 5 to 13 points
  behind what their state's Harris margin predicts; Schumer's picks ran 2.5 ahead [14]. Three
  races a side, and Schumer's picks were a former governor and two former members of Congress.
  Maine's nominee was chosen by convention after the primary field collapsed.
- **"Populist villain messaging hurt."** Democrats whose price ads named corporations or
  billionaires ran about 0.3 points behind per 10 points of villain share; the link falls below
  significance once money is controlled [15]. No price frame, progressive or centrist, went with
  running ahead.
- **"These are null results."** Correct. The narrative claims an absence of the cost centrists
  assert, and the intervals bound it: the progressive-minus-unaligned estimate rules out a penalty
  larger than 1.3 points [3].
- **"Endorsement lists are incomplete."** The Red to Blue list has 43 of a reported 46 names, and
  the Jeffries list is partial [10]. A few of the 16 "never backed" flippers may have had backing
  we did not find.

## Notes

1. `data/derived/midterm2026/factors_wave.csv`; CNN 2026-HG counts against Harris 2024 by
   district; share of variance from the common shift.
2. `reqts/midterm-2026-moderate-overperformance.md` section 4.
3. `data/derived/midterm2026/house_drivers_coefs.csv`, `house_drivers_groups.csv`; OLS of
   over_vs_harris on affiliation + C(state) + seat type + Harris margin, state-clustered SEs,
   n 417.
4. `reqts/midterm-2026-moderate-overperformance.md` section 4, contested-primary table, n 30.
5. Same file, Headline and section 2.
6. Same file, section 1 and section 2 (Axios Dec 9 2025; PCCC Feb 24 2026).
7. `reqts/midterm-2026-emphasis.md` section 13; `reqts/midterm-2026-leadership-and-price-frames.md`
   section 8. Meta Ad Library, own-page ads, general window, model-coded (kappa 0.88 to 1.00).
8. `data/derived/midterm2026/labels_models.csv`; NRCC list from Fox News 2025-11-05; DSA list
   from Blavity/Yahoo 2026-11-04.
9. `data/derived/midterm2026/emphasis/emphasis_models.csv`, prediction P3, n 36.
10. `data/derived/midterm2026/leadership_models.csv`; endorsements in
    `leadership_endorsements.csv` (103 sourced rows).
11. `data/derived/midterm2026/leadership_winners_unbacked.csv`.
12. `data/derived/midterm2026/leadership_contested.csv`.
13. `data/derived/midterm2026/emphasis/frame_party_means.csv`.
14. `reqts/midterm-2026-leadership-and-price-frames.md` section 9, Senate table.
15. `data/derived/midterm2026/emphasis/frame_models.csv`, prediction F1, n 109.
