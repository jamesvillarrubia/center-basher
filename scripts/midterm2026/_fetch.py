"""Cached, rate-limited HTTP fetch for the 2026 midterm analysis.

Every response is written under data/raw/midterm2026/ the first time it is
fetched; later runs read the cache and never touch the network. Delete a cache
file to force a refetch.
"""
from __future__ import annotations

import hashlib
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "midterm2026"
FEC_RAW = ROOT / "data" / "raw" / "fec"
UA = "center-basher-research/0.1 (https://thecenterisalie.org)"

_last: dict[str, float] = {}


def _throttle(host: str, gap: float) -> None:
    wait = _last.get(host, 0) + gap - time.time()
    if wait > 0:
        time.sleep(wait)
    _last[host] = time.time()


def _get(url: str, gap: float, tries: int = 6) -> bytes:
    host = urllib.parse.urlparse(url).netloc
    delay = gap
    for attempt in range(tries):
        _throttle(host, gap)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
            if b"too many requests" in body[:300].lower():
                raise urllib.error.HTTPError(url, 429, "rate limited", None, None)
            return body
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                delay = max(delay * 2, 5)
                time.sleep(delay)
                continue
            raise
    raise RuntimeError(f"unreachable: {url}")


def wiki_wikitext(page: str) -> str:
    """Return the wikitext of an English Wikipedia page (redirects followed)."""
    path = RAW / "wiki" / f"{page}.json"
    if not path.exists():
        q = urllib.parse.urlencode({
            "action": "parse", "page": page, "prop": "wikitext|revid",
            "format": "json", "formatversion": 2, "redirects": 1,
        })
        body = _get(f"https://en.wikipedia.org/w/api.php?{q}", gap=2.0)
        data = json.loads(body)
        if "error" in data:
            raise KeyError(f"{page}: {data['error'].get('info')}")
        data["_fetched_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data))
    return json.loads(path.read_text())["parse"]["wikitext"]


def wiki_meta(page: str) -> dict:
    """Revision id and fetch time of the cached copy of a page."""
    wiki_wikitext(page)
    d = json.loads((RAW / "wiki" / f"{page}.json").read_text())
    return {"page": page, "revid": d["parse"].get("revid"), "fetched_utc": d.get("_fetched_utc")}


def fec(endpoint: str, _tries: int = 6, **params) -> dict:
    """GET one page of an api.open.fec.gov v1 endpoint, cached by its query."""
    params = {k: v for k, v in params.items() if v is not None}
    key_src = endpoint + "?" + urllib.parse.urlencode(sorted(params.items()), doseq=True)
    digest = hashlib.sha1(key_src.encode()).hexdigest()[:16]
    slug = endpoint.strip("/").replace("/", "_")
    path = FEC_RAW / f"{slug}__{digest}.json"
    if not path.exists():
        q = urllib.parse.urlencode({**params, "api_key": "DEMO_KEY"}, doseq=True)
        body = _get(f"https://api.open.fec.gov/v1/{endpoint.strip('/')}/?{q}", gap=4.0, tries=_tries)
        data = json.loads(body)
        data["_query"] = key_src
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data))
    return json.loads(path.read_text())


def fec_all(endpoint: str, max_pages: int = 20, **params) -> list[dict]:
    """All result rows across pages (page-number pagination)."""
    rows: list[dict] = []
    page = 1
    while page <= max_pages:
        d = fec(endpoint, page=page, per_page=100, **params)
        rows += d.get("results", [])
        pages = d.get("pagination", {}).get("pages", 1) or 1
        if page >= pages:
            break
        page += 1
    return rows


def cached_url(url: str, subdir: str, name: str, gap: float = 2.0) -> bytes:
    """Fetch any URL once into data/raw/midterm2026/<subdir>/<name>; return bytes."""
    path = RAW / subdir / name
    if not path.exists():
        body = _get(url, gap=gap)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(body)
        (path.parent / (name + ".meta.json")).write_text(json.dumps({
            "url": url, "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}))
    return path.read_bytes()


def cnn(race_code: str) -> dict:
    """CNN results API, e.g. 'national-races/2026-SG' or 'national-races/2024-PG'."""
    name = race_code.replace("/", "__") + ".json"
    return json.loads(cached_url(f"https://politics.api.cnn.io/results/{race_code}.json", "cnn", name))
