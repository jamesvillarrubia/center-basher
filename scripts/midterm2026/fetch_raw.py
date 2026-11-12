"""Step 0: fetch every raw input that the build scripts do not fetch themselves.

data/raw/ is git-ignored, so a fresh checkout needs this. Files already on disk
are never refetched. A refetch after 2026-11-05 returns newer data (late
counts, amended FEC filings, edited Wikipedia pages); the numbers in
reqts/midterm-2026-moderate-overperformance.md are as of the 2026-11-05 fetch.

Fetched by other scripts on demand (cached the same way): Wikipedia wikitext
(_fetch.wiki_wikitext), CNN results JSON (_fetch.cnn), FEC API pages (_fetch.fec).
"""
from __future__ import annotations

import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _fetch import FEC_RAW, cached_url  # noqa: E402

FEC_BULK = "https://www.fec.gov/files/bulk-downloads/2026/"
SOURCES = {
    # subdir, name: url
    ("../fec/bulk2026", "independent_expenditure_2026.csv"): FEC_BULK + "independent_expenditure_2026.csv",
    ("../fec/bulk2026", "weball26.zip"): FEC_BULK + "weball26.zip",
    ("../fec/bulk2026", "cn26.zip"): FEC_BULK + "cn26.zip",
    ("downballot", "pres2024_by_cd_2026lines.csv"):
        "https://docs.google.com/spreadsheets/d/1eZfaFI-c-PFOoKx1-zZA2MP0_dxRq_LVK0re3BOQqy0/export?format=csv&gid=1491069057",
    ("endorsers", "newdem2.html"): "https://www.newdemactionfund.com/candidates",
    ("endorsers", "welcome_elect.html"): "https://welcome.team/elect",
    ("endorsers", "jd.html"): "https://justicedemocrats.com/candidates/",
    ("sources", "thirdway_memo.html"): "https://www.thirdway.org/memo/moderates-made-democratic-majorities",
    ("sources", "thirdway_memo2.html"): "https://www.thirdway.org/memo/center-left-democrats-overperformed-and-delivered-the-majority",
    ("sources", "cap_action_statement.html"):
        "https://www.americanprogressaction.org/press/statement-tonight-the-democrats-big-tent-broke-the-maga-stronghold/",
    ("sources", "rs_aipac_55m.html"): "https://responsiblestatecraft.org/aipac-candidates-2026/",
    ("sources", "mee_aipac_55m.html"): "https://www.middleeasteye.net/news/aipac-spent-55million-losing-congressional-candidates-report",
    ("sources", "nation_180m.html"):
        "https://www.thenation.com/article/politics/crypto-ai-aipac-super-pacs-democratic-primaries-dark-money-2026/",
    ("sources", "staradv_jackson.html"):
        "https://www.staradvertiser.com/2026/07/25/breaking-news/maine-democrats-pick-troy-jackson-to-replace-platner-in-senate-race/",
    ("sources", "commondreams_jackson.html"): "https://www.commondreams.org/news/maine-democratic-party-troy-jackson",
    ("sources", "notus_mills.html"): "https://www.notus.org/2026-election/janet-mills-exit-maine-schumer-platner",
}


def main() -> None:
    for (sub, name), url in SOURCES.items():
        body = cached_url(url, sub, name, gap=2.0)
        print(f"{len(body):>10,}  {sub}/{name}")
    x = FEC_RAW / "bulk2026" / "x"
    x.mkdir(parents=True, exist_ok=True)
    for z in ("weball26.zip", "cn26.zip"):
        with zipfile.ZipFile(FEC_RAW / "bulk2026" / z) as f:
            f.extractall(x)
    print("unzipped FEC candidate files into", x)


if __name__ == "__main__":
    main()
