import csv

OUT = "/Users/james/.t3/worktrees/center-basher/t3-dbd19e71/data/derived/establishment/coder_a.csv"
IN = "/Users/james/.t3/worktrees/center-basher/t3-dbd19e71/data/derived/establishment/mayhew_laws_1981_2024.csv"
SETS = {"s": "structure", "c": "social", "o": "other"}

# id|set|direction|confidence|reason
RAW = """
1|s|1|3|Large cuts in top individual rates and corporate taxes; JCT/TPC show gains weighted to high incomes and firms.
2|o|0|2|Domestic spending cuts hitting low-income programs, no direct wealth transfer to top 0.1% beyond companion tax act.
3|o|1|2|Commodity subsidy plan favoring established large farm operations.
4|s|-1|1|Gas tax rise funds infrastructure; small distributional effect, mildly regressive, no clear firm benefit.
5|s|-1|3|Raised taxes by $98B partly reversing 1981 corporate and business tax breaks.
6|c|0|3|Voting rights extension with no wealth effect.
7|o|0|2|Waste siting law; no clear distributional direction.
8|s|1|3|Deregulated thrifts and propped up savings and loans, benefiting incumbent financial firms.
9|o|0|2|Job training program for poor; small transfers, no top-income effect.
10|c|0|3|Commemorative holiday, no wealth effect.
11|o|0|3|Bipartisan Social Security rescue mixing payroll tax rises and benefit cuts; roughly offsetting.
12|o|0|2|Temporary jobs spending; no clear top-income effect.
13|c|0|3|Criminal code revisions; no wealth effect.
14|s|-1|2|Tax increases of $50B outweigh cuts; revenue measure closing business tax breaks.
15|s|1|1|Trade authority extension; mildly favors exporting firms, weak direction.
16|s|1|2|Cable deregulation that eased local rate regulation, benefiting incumbent cable operators.
17|s|0|2|Automatic spending cuts across the budget; no clear distributional direction.
18|o|1|2|Record commodity subsidies flowing to large established farm operators.
19|s|0|3|Base broadening and rate cuts, with a shift to corporate taxes; JCT shows top rate cut offset by loophole closing.
20|c|0|3|Immigration enforcement plus amnesty; no clear wealth direction.
21|o|0|3|Foreign-policy sanctions, no wealth effect on top 0.1%.
22|c|0|3|Drug enforcement and treatment spending.
23|o|-1|3|Superfund expansion imposed cleanup liability and taxes on chemical and oil firms.
24|o|0|2|Water projects with user cost sharing; pork with mixed effect.
25|o|0|3|Military command reorganization, no wealth effect.
26|o|0|2|Sewage treatment grants, public works with no clear top-income effect.
27|s|0|2|Highway spending; broad public works, contractors benefit but no clear top-income direction.
28|s|-1|2|Package of spending cuts and tax increases, net revenue raising.
29|s|0|2|Housing authorization for lower-income housing, modest transfers.
30|o|0|3|Small homeless relief grants.
31|o|0|2|Medicare expansion funded by premiums on the elderly with higher incomes paying more, modest progressive financing.
32|o|0|3|Welfare reform with work requirements; low-income focus.
33|s|0|2|Trade authority with mixed protection and liberalization.
34|c|0|3|Drug enforcement, no wealth effect.
35|c|0|3|Civil rights reassertion, no wealth effect.
36|o|0|3|Arms control treaty, no wealth effect.
37|o|0|3|Reparations to interned Japanese Americans, small.
38|o|-1|2|Minimum wage hike raises labor costs for employers, transferring toward low wages.
39|s|1|3|Bailout of insolvent thrifts, protecting depositors and shareholders at taxpayer cost.
40|s|-1|2|Bush-Congress deal with tax hikes on top incomes; JCT progressive.
41|c|-1|2|Mandates on employers and businesses for access; new regulation costs to firms.
42|o|-1|3|New environmental regulation constraining utilities and industry.
43|o|0|2|Tax credits and grants for working parents, lower-income targeted.
44|c|0|3|Immigration levels increase, no clear wealth direction.
45|s|0|2|Housing block grants and sell-off of public housing, mixed.
46|o|-1|1|Cut in subsidized acreage reduces some subsidy to established farms.
47|o|0|3|War authorization, no wealth effect.
48|s|0|2|Large highway and transit spending, broad public works.
49|c|-1|2|Expanded employer liability for discrimination lawsuits.
50|s|0|2|Electricity restructuring opening transmission access plus conservation; mixed for incumbent utilities.
51|o|0|3|Arms control treaty.
52|o|0|3|Foreign aid package, no wealth effect.
53|s|-1|3|Re-regulated cable rates over veto, constraining incumbent cable operators.
54|o|-1|2|Shifted water from agribusiness to cities and environment, cutting subsidy to large farm firms.
55|s|-1|3|Top rate raised to 39.6%, higher corporate rate, expanded EITC; TPC shows large burden on top 1%.
56|s|1|2|Trade liberalization favored multinational firms and capital mobility.
57|o|-1|2|Mandated unpaid leave imposes new costs on employers.
58|c|0|3|Voter registration, no wealth effect.
59|o|0|3|Service program, small.
60|s|-1|2|Cut banks out of student lending, ending guaranteed subsidy to lenders.
61|c|0|3|Gun waiting period, no wealth effect.
62|o|0|3|Education goals, no wealth effect.
63|c|0|3|Crime package, no wealth effect.
64|o|-1|1|Wilderness protection restricts land use for mining and grazing interests.
65|c|0|3|Criminal protection for clinics, no wealth effect.
66|s|1|2|Tariff reduction and WTO created, benefiting multinationals.
67|o|1|1|Curbs federal mandates on governments; weak link to firms, mildly deregulatory.
68|o|0|3|Applies labor laws to Congress, no wealth effect.
69|o|0|2|Disclosure rules for lobbyists, no large wealth effect.
70|s|1|3|Curbs shareholder suits against firms, a liability shield for corporations.
71|o|0|2|Ended welfare guarantee for low-income families; cuts to poor, no gain flowing to top directly.
72|s|1|3|Telecom deregulation that enabled consolidation among incumbent phone and cable firms.
73|o|-1|2|Phased out farm subsidies, ending support for established farm operators.
74|o|0|3|Procedural budget power with no distributional direction.
75|c|0|3|Antiterrorism and habeas limits, no wealth effect.
76|o|0|2|Spending cuts to end shutdown, mixed.
77|o|-1|2|Insurance portability rules constrain insurers.
78|o|0|3|Minimum wage hike bundled with business tax breaks of similar size.
79|o|-1|2|Stricter pesticide regulation constraining chemical firms.
80|o|-1|2|Stricter drinking water rules costing water suppliers and industry.
81|c|0|3|Immigration enforcement, no wealth effect.
82|s|0|2|Spending cuts offset by capital gains and estate cuts and child credit; mixed per JCT.
83|o|0|3|Arms control treaty.
84|o|1|2|Faster drug approval and user fees benefiting pharmaceutical companies.
85|o|0|3|Adoption process, no wealth effect.
86|s|0|2|Highway and transit spending, broad public works.
87|o|0|2|Taxpayer protection rules, no large distributional direction.
88|o|0|3|Treaty ratification.
89|s|0|2|Public housing devolution, no clear direction.
90|o|0|3|School teacher funding, no top-income effect.
91|s|1|3|Gramm-Leach-Bliley repealed Glass-Steagall, allowing mergers of large banks, insurers and brokerages.
92|s|1|3|Liability limit for firms on Y2K failures.
93|o|0|3|State education flexibility.
94|s|1|2|Normal trade with China benefiting multinationals.
95|o|0|2|Environmental restoration, no clear distribution.
96|s|0|2|Tax incentives for poor locales, small and mixed.
97|s|1|3|Rate cuts and estate tax phaseout; TPC shows largest gains to top 1% and top 0.1%.
98|o|0|3|War authorization.
99|c|0|3|Surveillance and security powers, no wealth effect.
100|s|1|3|$15B bailout to established airlines.
101|o|0|3|Government airport screening program, no wealth effect.
102|o|0|3|Emergency defense and recovery spending.
103|o|0|3|Education testing and funding, no top-income effect.
104|o|0|3|War authorization.
105|o|0|3|Agency reorganization.
106|o|0|2|Campaign finance limits; reduces soft money from donors, no clear wealth effect.
107|o|1|3|Farm subsidies of $180B going disproportionately to large established farms.
108|s|-1|3|Sarbanes-Oxley regulates accounting and corporate fraud, constraining firms.
109|s|1|2|Fast-track trade authority favoring multinational firms.
110|c|0|3|Voting standards, no wealth effect.
111|s|1|3|Federal backstop for insurers and commercial real estate.
112|o|0|3|Investigative commission.
113|o|1|3|Prescription drug benefit with no price negotiation and role for private plans benefits drug and insurance industries.
114|s|1|3|2003 cuts to dividends and capital gains tilted to top incomes.
115|o|0|3|Foreign health aid.
116|c|0|3|Abortion procedure ban, no wealth effect.
117|o|0|2|War funding, mixed (contractors) with no clear top-income direction.
118|o|1|2|Expands logging and limits environmental suits, benefiting timber firms.
119|s|1|2|$143B corporate tax breaks partly offset by loophole closers, net benefit to firms.
120|o|0|3|Disaster relief.
121|c|0|3|Criminal law on fetal harm.
122|o|0|3|Intelligence reorganization.
123|s|1|3|Made consumer bankruptcy harder, favoring credit card lenders and creditors.
124|s|1|3|Moved class actions to federal courts, a liability shield for businesses.
125|s|0|2|Highway bill with earmarks, broad public works.
126|s|1|3|$14.5B tax breaks for energy producers and industry.
127|s|1|2|Trade and investment liberalization benefiting multinationals.
128|o|0|2|Disaster relief with some contractor benefits.
129|s|0|2|Pension funding rules, mixed for firms and workers.
130|c|0|3|Tribunal rules, no wealth effect.
131|o|0|3|Port security funding.
132|c|0|3|Border fencing.
133|s|1|3|Opened offshore leases to oil and gas companies.
134|s|1|2|Trade liberalization benefiting exporters and importers.
135|o|0|2|Postal finances, no clear direction.
136|o|0|3|Nuclear cooperation treaty.
137|o|0|2|Minimum wage hike bundled with small business tax breaks, offsetting.
138|o|0|3|Homeland security recommendations.
139|o|-1|1|Lobbying restrictions limit influence of wealthy donors and firms, weak wealth link.
140|s|-1|3|Cut subsidies to private student lenders, redirecting to grants for needy students.
141|s|0|2|Fuel standards impose costs on automakers while biofuels subsidize ethanol; offsetting.
142|s|1|2|Mortgage insurance and rescue of Fannie and Freddie benefit established lenders.
143|s|1|3|TARP bailout for large banks plus tax breaks.
144|s|0|2|Rebates to households and business incentives, broad stimulus.
145|o|1|2|Large farm subsidies to established agribusiness, passed over veto.
146|c|1|2|Telecom firms immunized against wiretapping liability, liability shield.
147|o|0|3|Veterans education benefits.
148|o|0|3|Nuclear cooperation agreement.
149|o|-1|2|Insurers required to cover mental illness equally, new constraint on insurers.
150|s|-1|2|Stimulus with tax cuts for lower and middle incomes and spending, progressive per CBO.
151|o|0|3|Children's health insurance expansion funded by tobacco tax.
152|o|-1|2|Expands employee pay-discrimination suits against employers.
153|s|-1|3|CARD Act restricts credit card industry practices.
154|o|-1|3|FDA authority to regulate tobacco, new constraint on industry.
155|o|0|3|Service program expansion.
156|c|0|3|Hate crime law.
157|o|-1|1|Wilderness set-aside restricts commercial land use.
158|o|-1|3|ACA taxes on high incomes and industry fees, subsidies to lower incomes and insurance regulation.
159|s|-1|3|Dodd-Frank constrains large financial firms and creates CFPB.
160|s|-1|3|Ended subsidies to private lenders.
161|s|1|3|Extended Bush tax cuts at all levels with estate tax at 35%, favoring top incomes versus baseline.
162|o|0|3|Arms control treaty.
163|c|0|3|Military policy, no wealth effect.
164|o|-1|2|Food safety regulation raising compliance costs for producers.
165|o|0|3|Health aid for first responders.
166|s|0|2|Debt ceiling deal with spending cuts, no clear top-income direction.
167|s|1|2|Patent law modernization strengthens patent holders and aligns to large-filer interests.
168|s|1|2|Trade agreements benefiting exporters and multinationals.
169|s|-1|3|Top rate returned to 39.6%, capital gains 20%, estate 40%; TPC shows tax rise on top 1%.
170|o|0|3|Congressional ethics rule, no wealth effect.
171|s|1|2|JOBS Act eases securities disclosure rules for firms raising capital, deregulatory.
172|s|1|1|Trade normalization benefiting exporters, weak direction.
173|o|0|2|Disaster relief including insurance backup, mixed.
174|c|0|3|Violence Against Women Act, no wealth effect.
175|o|0|2|Student loan rate formula tied to markets, no clear top-income direction.
176|o|0|3|Military sexual assault procedure.
177|o|1|1|Replaced direct payments with subsidized crop insurance favoring large farms, with small food stamp trims.
178|o|0|2|Water infrastructure authorization.
179|o|0|2|VA wait-time funding and some privatization of care, mixed.
180|o|0|3|Military aid.
181|o|0|2|Allows benefit cuts to shore up multiemployer pensions, no top-income effect.
182|o|1|3|Raised party contribution caps tenfold for wealthy donors.
183|o|0|2|Medicare physician payment fix, no clear direction.
184|s|1|2|Fast-track trade authority favoring multinationals.
185|c|0|3|Surveillance rollback, no wealth effect.
186|s|0|2|Budget deal raising spending caps, no clear direction.
187|o|0|3|Education powers returned to states.
188|s|0|2|Transportation infrastructure spending.
189|s|1|3|$680B of permanent business and individual tax breaks, mostly business.
190|s|1|3|Lifted oil export ban benefiting oil producers.
191|o|0|3|Opioid treatment policy.
192|s|0|1|Restructures Puerto Rico bonds with losses to creditors, mixed.
193|o|1|2|Faster FDA approvals benefit drug and device firms, plus NIH funds.
194|o|0|3|Water infrastructure authorization.
195|s|1|3|TCJA cut corporate rate to 21% and pass-through and estate tax; TPC shows gains tilted to top.
196|s|1|3|Congressional Review Act repeals of regulations on mining, consumer protection, environment, worker safety, deregulating industries.
197|o|0|3|VA accountability reform.
198|o|0|3|Disaster relief.
199|o|0|2|Individual mandate repeal reduces coverage subsidies, no top-income effect.
200|s|1|3|Opened Arctic refuge to oil and gas leasing.
201|s|0|2|Dropped spending caps for defense and domestic, balanced.
202|s|1|3|Relaxed Dodd-Frank rules for small banks.
203|o|0|2|VA privatization of some care.
204|o|0|3|Opioid response.
205|o|0|1|Farm and food stamp package, mixed.
206|c|0|3|Sentencing reform, no wealth effect.
207|o|0|1|Omnibus mix of unrelated provisions, no clear direction.
208|o|-1|1|Public lands protections restrict commercial use of land.
209|o|0|3|Disaster relief.
210|c|0|3|Humanitarian aid for migrants.
211|s|0|2|Budget deal ending caps, no clear direction.
212|o|0|3|Defense authorization with parental leave.
213|o|0|3|Pandemic health response funds.
214|o|0|2|Paid sick leave mandate and benefits, mixed.
215|s|0|2|CARES Act gave payments and UI to individuals plus large corporate aid and business tax breaks; offsetting.
216|s|0|2|Small business loans and hospital aid, mixed.
217|s|0|2|Direct payments and UI plus business aid, mixed.
218|s|0|2|Trade pact with both labor rules and pharma/IP provisions, mixed.
219|o|0|3|Park maintenance funding.
220|o|-1|2|Surprise billing ban constrains providers and insurers.
221|s|-1|1|Clean energy funding and HFC phase-down constrain industry, weakly.
222|o|-1|2|Large transfers to low and middle incomes, funded by deficit; progressive per CBO.
223|s|0|2|Infrastructure spending, broad public works.
224|o|-1|2|Refundable child credit expansion targeted at low and middle incomes.
225|c|0|3|Refugee resettlement aid.
226|o|0|3|Military justice reform.
227|s|-1|3|Corporate minimum tax, drug price negotiation, and IRS funding, funded from corporations and high incomes.
228|o|0|2|Postal finances.
229|o|0|3|Military aid to Ukraine.
230|c|0|3|Gun background checks, no wealth effect.
231|s|1|3|Subsidies to semiconductor firms.
232|o|0|3|Veterans health benefits.
233|c|0|3|Same-sex marriage protection.
234|o|0|3|Electoral procedure.
235|o|0|3|Military aid.
236|o|0|3|Military aid.
237|o|0|3|Military aid.
238|s|0|2|Forced sale or ban of a platform, no clear wealth direction.
239|s|0|1|Airport spending and consumer protections, mixed.
240|o|0|3|Social Security benefits for public workers, small.
241|o|0|3|Disaster relief.
242|o|1|1|Aid to farmers, mainly established farm operations.
"""


rows = []
for line in RAW.strip().splitlines():
    i, s, d, c, r = line.split("|", 4)
    rows.append({"id": i, "set": SETS[s], "direction": int(d), "confidence": int(c), "reason": r})

ids = [r["id"] for r in csv.DictReader(open(IN))]
assert [r["id"] for r in rows] == ids, "id mismatch"
assert len(rows) == 242

with open(OUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["id", "set", "direction", "confidence", "reason"])
    w.writeheader()
    w.writerows(rows)

from collections import Counter
c = Counter((r["set"], r["direction"]) for r in rows)
print("rows", len(rows))
for s in ("structure", "social", "other"):
    print(s, {d: c[(s, d)] for d in (1, -1, 0)})
print([r["id"] for r in rows if r["confidence"] == 1])
