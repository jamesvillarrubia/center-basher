// Collect Meta Ad Library political ads for every 2026 House D and R nominee.
// Spec: reqts/midterm-2026-emphasis.md, section 2.
//
// Usage (from web/): node scripts/collect-meta-ads.ts --token-file <path> [--races NY-19,NV-03] [--max-pages 20]
//
// The token is read from --token-file and sent only to graph.facebook.com. Paging URLs that Meta
// returns embed the token; they are never written to disk or printed.
// Output: data/raw/midterm2026/meta_ads/<race_id>__<DEM|REP>.json (gitignored), one file per nominee,
// holding the query, fetch time, and every ad whose page_name or bylines contains the nominee's
// last name. Ads from other pages are counted in `dropped` but not stored.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface CnnCandidate { fullName: string; lastName: string; majorParty: string; voteNum: number }
interface CnnRace { ecKey: string; stateAbbreviation: string; candidates: CnnCandidate[] }
interface Nominee { raceId: string; party: 'DEM' | 'REP'; fullName: string; lastName: string }
interface Ad { id: string; page_id?: string; page_name?: string; bylines?: string; [k: string]: unknown }
interface Page { data?: Ad[]; paging?: { next?: string }; error?: { message: string; code: number } }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'data', 'raw', 'midterm2026', 'meta_ads');
const API = 'https://graph.facebook.com/v23.0/ads_archive';
const FIELDS = ['id', 'page_id', 'page_name', 'bylines', 'ad_creative_bodies', 'ad_creative_link_titles',
  'ad_creative_link_descriptions', 'ad_delivery_start_time', 'ad_delivery_stop_time', 'spend', 'impressions',
  'publisher_platforms'].join(',');
const GAP_MS = 2000;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

function nominees(): Nominee[] {
  const races: CnnRace[] = JSON.parse(readFileSync(join(ROOT, 'data', 'raw', 'midterm2026', 'cnn', 'national-races__2026-HG.json'), 'utf8'));
  const out: Nominee[] = [];
  for (const r of races) {
    const parts = r.ecKey.split('-');
    const raceId = `${r.stateAbbreviation}-${String(parts.length > 3 ? Number(parts[3]) : 1).padStart(2, '0')}`;
    for (const party of ['DEM', 'REP'] as const) {
      const top = r.candidates.filter((c) => c.majorParty === party).sort((a, b) => b.voteNum - a.voteNum)[0];
      if (top) out.push({ raceId, party, fullName: top.fullName, lastName: top.lastName });
    }
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const scrub = (s: string) => s.replace(/access_token=[^&\s"]+/g, 'access_token=REDACTED');

async function get(url: string): Promise<Page> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'center-basher-research/1.0' } });
    const body = (await res.json()) as Page;
    // 4, 17, 613: rate limits. Back off and retry.
    if (body.error && [4, 17, 613].includes(body.error.code)) { await sleep(60_000 * (attempt + 1)); continue; }
    return body;
  }
  return { error: { message: 'rate limited after 5 attempts', code: -1 } };
}

async function collect(n: Nominee, token: string, maxPages: number) {
  const q = new URLSearchParams({
    access_token: token, search_terms: n.fullName, ad_type: 'POLITICAL_AND_ISSUE_ADS',
    ad_reached_countries: "['US']", ad_delivery_date_min: '2025-07-01', ad_delivery_date_max: '2026-11-03',
    fields: FIELDS, limit: '250',
  });
  let url: string | undefined = `${API}?${q}`;
  const kept: Ad[] = [];
  let dropped = 0, pages = 0, error: string | null = null;
  const last = n.lastName.toLowerCase();
  while (url && pages < maxPages) {
    const page = await get(url);
    pages++;
    if (page.error) { error = scrub(page.error.message); break; }
    for (const ad of page.data ?? []) {
      const who = `${ad.page_name ?? ''} ${ad.bylines ?? ''}`.toLowerCase();
      if (who.includes(last)) kept.push(ad); else dropped++;
    }
    url = page.paging?.next;
    await sleep(GAP_MS);
  }
  return { kept, dropped, pages, error, truncated: Boolean(url) };
}

async function main() {
  const tokenFile = arg('token-file');
  if (!tokenFile) throw new Error('--token-file is required');
  const token = readFileSync(tokenFile, 'utf8').trim();
  const only = arg('races')?.split(',');
  const maxPages = Number(arg('max-pages') ?? 20);
  mkdirSync(OUT, { recursive: true });
  const list = nominees().filter((n) => !only || only.includes(n.raceId));
  for (const n of list) {
    const file = join(OUT, `${n.raceId}__${n.party}.json`);
    if (existsSync(file) && !only && JSON.parse(readFileSync(file, 'utf8')).error === null) continue;
    const r = await collect(n, token, maxPages);
    writeFileSync(file, JSON.stringify({
      race_id: n.raceId, party: n.party, nominee: n.fullName, search_terms: n.fullName,
      match_rule: 'page_name or bylines contains last name', fetched_utc: new Date().toISOString(),
      pages: r.pages, truncated: r.truncated, dropped: r.dropped, error: r.error, ads: r.kept,
    }));
    console.log(`${n.raceId} ${n.party} ${n.fullName}: kept ${r.kept.length}, dropped ${r.dropped}, pages ${r.pages}${r.error ? `, error: ${r.error}` : ''}`);
    if (r.error && /deactivated|OAuth|token/i.test(r.error)) process.exit(2);
  }
}

main().catch((e: unknown) => { console.error(scrub(String(e))); process.exit(1); });
