"""
build_voter_map_2016.py — Port the v1 trust × ideology map data into
a clean v2 JSON for §18 Figure B.

Source: data/processed/voters_2d.json (3,301 ANES 2016 respondents with
x=ideology and y=institutional-trust composite, already normalized).

Adds the three 2016 candidate centroids (Clinton, Sanders, Trump) computed
from the same ANES voter base, per the methodology in web/js/candidates.js.

Output: data/clean/voter_map_2016.json
"""
import json


def main():
    voters = json.load(open("data/processed/voters_2d.json"))

    # Compact representation: keep only the fields the chart needs.
    # x = ideology (-1 to +1), y = trust (0 to 1), vote = general election vote,
    # primary_vote = primary-cycle vote (or null), party = party affiliation
    out_voters = []
    for v in voters:
        out_voters.append({
            "x":  round(v["x"], 3),
            "y":  round(v["y"], 3),
            "v":  v.get("vote") or "",        # 'clinton' / 'trump' / 'johnson' / 'stein' / 'other' / ''
            "pv": v.get("primary_vote") or "",
            "p":  v.get("party") or "",
            "w":  round(v.get("weight", 1.0), 3),
        })

    # Candidate centroids from candidates.js (TIER 1 / TIER 2 ANES voter-base means)
    candidates = [
        {
            "id": "clinton",
            "name": "Hillary Clinton",
            "short": "Clinton",
            "party": "D",
            "color": "#2c5b9c",
            "x": -0.325,
            "y": 0.277,
            "n": 1064,
            "note": "general-election voter centroid (n=1,064)",
        },
        {
            "id": "sanders",
            "name": "Bernie Sanders",
            "short": "Sanders",
            "party": "I",   # independent — Dem primary candidate
            "color": "#4a9b6d",
            "x": -0.421,
            "y": 0.224,
            "n": 339,
            "note": "PRIMARY voter centroid (n=339) — no general-election cohort",
        },
        {
            "id": "trump",
            "name": "Donald Trump",
            "short": "Trump",
            "party": "R",
            "color": "#b8240f",
            "x": 0.455,
            "y": 0.14,
            "n": 1002,
            "note": "general-election voter centroid (n=1,002)",
        },
    ]

    # Distance calculations (Euclidean) for the narrative annotation
    def dist(a, b):
        return ((a["x"] - b["x"]) ** 2 + (a["y"] - b["y"]) ** 2) ** 0.5

    c, s, t = candidates[0], candidates[1], candidates[2]
    distances = {
        "sanders_to_clinton": round(dist(s, c), 3),
        "sanders_to_trump":   round(dist(s, t), 3),
        "sanders_to_clinton_trust_only": round(abs(s["y"] - c["y"]), 3),
        "sanders_to_trump_trust_only":   round(abs(s["y"] - t["y"]), 3),
    }

    payload = {
        "source": "ANES 2016 Time Series Study (n=3,301 used). Ideology = V161126 (7-pt liberal-conservative self-placement, rescaled −1 to +1). Trust = mean of V161215 (govt does right) + V161216 (run for benefit of all) + V161217 (waste of taxes), each recoded 0–1, composite 0–1 (higher = more trust). r=−0.35 with Trump vote; α=0.59.",
        "method": "Candidate centroids computed as ANES voter-base means. Clinton & Trump use general-election voters (V162034a). Sanders uses Democratic primary voters (no general-election cohort). Same trust composite for all three.",
        "candidates": candidates,
        "distances": distances,
        "n_voters": len(out_voters),
        "voters": out_voters,
    }

    with open("data/clean/voter_map_2016.json", "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"Wrote data/clean/voter_map_2016.json ({len(out_voters)} voters, 3 candidates)")
    print(f"Distances:")
    for k, v in distances.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
