"""
build_538_trajectory_multi.py — Multi-cycle aggregate gap trajectory
using FiveThirtyEight's polling averages.

Pulls 2016, 2020, and 2024 national-level daily polling averages,
computes daily Dem-vs-Rep margin = pct_Dem - pct_Rep, and resamples
to weekly. Output mirrors the Nationscape weekly trajectory schema so
Figure G can render any cycle.

Sources (saved locally):
  pres_pollaverages_1968-2016.csv          — 1968-2016 historical
  presidential_general_averages_2024-09-12_uncorrected.csv — 2020 + 2024

Output: data/clean/poll_trajectory_multi.json
"""
import json
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

CANDIDATES = {
    2016: {"D": ["Hillary Rodham Clinton"], "R": ["Donald Trump"]},
    2020: {"D": ["Joseph R. Biden Jr."],    "R": ["Donald Trump"]},
    # 2024: Biden was D nominee until July 21; Harris thereafter. Stitch them
    # into a continuous "Democratic nominee" series by taking whichever was
    # the active candidate on each date.
    2024: {"D": ["Biden", "Harris"],        "R": ["Trump"]},
}

EVENTS = {
    2016: [
        ("2016-07-22", "DNC begins; WikiLeaks DNC emails"),
        ("2016-09-11", "Clinton 'deplorables' / pneumonia"),
        ("2016-10-07", "Access Hollywood tape"),
        ("2016-10-28", "Comey letter"),
        ("2016-11-08", "Election Day"),
    ],
    2020: [
        ("2020-03-11", "COVID-19 pandemic declared"),
        ("2020-05-25", "George Floyd killed"),
        ("2020-09-18", "RBG dies"),
        ("2020-10-02", "Trump COVID hospitalization"),
        ("2020-10-14", "Hunter Biden laptop story"),
        ("2020-11-03", "Election Day"),
    ],
    2024: [
        ("2024-06-27", "First Biden-Trump debate"),
        ("2024-07-13", "Trump assassination attempt"),
        ("2024-07-21", "Biden withdraws; Harris ascends"),
        ("2024-08-19", "DNC begins"),
        ("2024-09-10", "Harris-Trump debate"),
    ],
}


def load_2016():
    df = pd.read_csv("data/raw/538/pres_pollaverages_1968-2016.csv")
    sub = df[(df["cycle"] == 2016) & (df["state"] == "National")].copy()
    sub["date"] = pd.to_datetime(sub["modeldate"])
    sub = sub[["date", "candidate_name", "pct_trend_adjusted"]]
    return sub.rename(columns={"candidate_name": "candidate", "pct_trend_adjusted": "pct"})


def load_2020_2024(year):
    df = pd.read_csv("data/raw/538/presidential_general_averages_2024-09-12_uncorrected.csv")
    sub = df[(df["cycle"] == year) & (df["state"] == "National")].copy()
    sub["date"] = pd.to_datetime(sub["date"])
    # 2020 file populates pct_trend_adjusted; 2024 file populates pct_estimate.
    sub["pct"] = sub["pct_trend_adjusted"].combine_first(sub["pct_estimate"])
    return sub[["date", "candidate", "pct"]]


def trajectory_for_cycle(year, df):
    cmap = CANDIDATES[year]
    pivot = df.pivot_table(
        index="date", columns="candidate", values="pct", aggfunc="mean"
    )
    # Combine D candidates: take whichever is non-null on each date.
    d_series = None
    for name in cmap["D"]:
        if name in pivot.columns:
            s = pivot[name]
            d_series = s if d_series is None else d_series.combine_first(s)
    r_series = None
    for name in cmap["R"]:
        if name in pivot.columns:
            s = pivot[name]
            r_series = s if r_series is None else r_series.combine_first(s)
    if d_series is None or r_series is None:
        print(f"  Missing candidates for {year}: have {list(pivot.columns)}")
        return None
    pivot["margin"] = d_series - r_series
    daily = pivot[["margin"]].dropna().sort_index()
    # Resample to weekly mean
    weekly = daily.resample("W-MON").mean().dropna()
    weekly_data = [
        {"date": idx.strftime("%Y-%m-%d"), "mean_gap": round(float(row["margin"]), 3)}
        for idx, row in weekly.iterrows()
    ]
    if not weekly_data:
        return None
    margins = np.array([w["mean_gap"] for w in weekly_data])
    summary = {
        "n_waves": len(weekly_data),
        "mean_of_means": round(float(margins.mean()), 3),
        "min_mean": round(float(margins.min()), 3),
        "max_mean": round(float(margins.max()), 3),
        "range": round(float(margins.max() - margins.min()), 3),
        "std_of_means": round(float(margins.std()), 3),
        "start_date": weekly_data[0]["date"],
        "end_date": weekly_data[-1]["date"],
        "dem_name": " / ".join(n.split()[-1] for n in cmap["D"]),
        "rep_name": cmap["R"][0].split()[-1],
    }
    return {
        "year": year,
        "summary": summary,
        "weekly": weekly_data,
        "events": [{"date": d, "label": l} for d, l in EVENTS[year]],
    }


def main():
    import os
    os.makedirs("data/raw/538", exist_ok=True)
    # Copy CSVs into project (they're in Downloads)
    import shutil
    src1 = "/Users/james/Downloads/pres_pollaverages_1968-2016.csv"
    src2 = "/Users/james/Downloads/presidential_general_averages_2024-09-12_uncorrected.csv"
    if not os.path.exists("data/raw/538/pres_pollaverages_1968-2016.csv"):
        shutil.copy(src1, "data/raw/538/")
    if not os.path.exists("data/raw/538/presidential_general_averages_2024-09-12_uncorrected.csv"):
        shutil.copy(src2, "data/raw/538/")

    cycles = []
    for year, loader in [(2016, load_2016),
                         (2020, lambda: load_2020_2024(2020)),
                         (2024, lambda: load_2020_2024(2024))]:
        print(f"Processing {year}...")
        df = loader()
        r = trajectory_for_cycle(year, df)
        if r is None:
            print(f"  failed")
            continue
        s = r["summary"]
        print(f"  n_weeks={s['n_waves']}, mean={s['mean_of_means']}, range=[{s['min_mean']}, {s['max_mean']}], std={s['std_of_means']}")
        cycles.append(r)

    payload = {
        "source": "FiveThirtyEight presidential polling averages (national, trend-adjusted). Weekly resampled from daily.",
        "method": "For each cycle: filter to state='National', compute daily margin = pct_Dem - pct_Rep, resample to weekly Monday-end mean.",
        "caveats": [
            "538 averages are smoothed estimates from underlying polls, not raw poll values.",
            "2024 file is the September 12, 2024 SNAPSHOT — does not include the final ~7 weeks of the 2024 campaign (post-Trump indictments, post-Harris-Trump debate, etc.).",
            "Scale: percentage points (-X to +X), differs from Nationscape's 1-4 favorability.",
        ],
        "cycles": cycles,
    }
    out = "data/clean/poll_trajectory_multi.json"
    with open(out, "w") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"\nWrote {out} ({len(cycles)} cycles)")


if __name__ == "__main__":
    main()
