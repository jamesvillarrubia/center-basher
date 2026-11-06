// Collect Meta Ad Library political ads for every 2026 House D and R nominee.
// Spec: reqts/midterm-2026-emphasis.md, section 2.
//
// Usage (from web/): node scripts/collect-meta-ads.ts --token-file <path> [--races NY-19,NV-03] [--max-pages 20]
//
// The token is read from --token-file and sent only to graph.facebook.com. Paging URLs that Meta
// returns embed the token; they are never written to disk or printed.
// Output: data/raw/midterm2026/meta_ads/<race_id>__<DEM|REP>.json (gitignored), one file per nominee,
// holding the query, fetch time, and every ad whose page_name or bylines contains the nominee's
// last name (flagged own or not), plus every ad from the nominee's own pages. Unmatched ads are
// counted in `dropped` but not stored.
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

// A page is the nominee's own when its name carries the first and last name and its byline names
// the nominee or a campaign committee. Outside groups ("Realtors for Josh Riley", paid for by NAR)
// and namesakes ("Congressman Riley M. Moore") fail the rule.
// Lowercase, straight apostrophes, no accents: "Marty O’Donnell" and "Gutiérrez" must match.
export const norm = (s: string | undefined) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2018\u2019\u02bc]/g, "'").toLowerCase();

export function ownPage(n: Nominee, ad: Ad): boolean {
  const first = norm(n.fullName.split(' ')[0]);
  const last = norm(n.lastName);
  const page = norm(ad.page_name);
  const by = norm(ad.bylines);
  return page.includes(first) && page.includes(last)
    && (by.includes(last) || by.includes(first) || by.includes('congress') || by === page);
}

async function pull(params: Record<string, string>, token: string, maxPages: number, keep: (ad: Ad) => boolean) {
  const q = new URLSearchParams({
    access_token: token, ad_type: 'POLITICAL_AND_ISSUE_ADS', ad_reached_countries: "['US']",
    ad_delivery_date_min: '2025-07-01', ad_delivery_date_max: '2026-11-03', fields: FIELDS, limit: '250', ...params,
  });
  let url: string | undefined = `${API}?${q}`;
  const kept: Ad[] = [];
  let dropped = 0, pages = 0, error: string | null = null;
  while (url && pages < maxPages) {
    const page = await get(url);
    pages++;
    if (page.error) { error = scrub(page.error.message); break; }
    for (const ad of page.data ?? []) (keep(ad) ? kept.push(ad) : dropped++);
    url = page.paging?.next;
    await sleep(GAP_MS);
  }
  return { kept, dropped, pages, error, truncated: Boolean(url) };
}

// Pass 1: search by full name, keep any ad whose page or byline carries the last name (stored for
// audit, flagged own or not). Pass 2: every ad from the nominee's own pages, by page ID.
async function collect(n: Nominee, token: string, maxPages: number) {
  const last = norm(n.lastName);
  const p1 = await pull({ search_terms: n.fullName }, token, maxPages,
    (ad) => norm(`${ad.page_name ?? ''} ${ad.bylines ?? ''}`).includes(last));
  const ids = [...new Set(p1.kept.filter((ad) => ownPage(n, ad)).map((ad) => ad.page_id).filter(Boolean))] as string[];
  const byId = new Map<string, Ad & { own: boolean; via: string }>();
  for (const ad of p1.kept) byId.set(ad.id, { ...ad, own: ownPage(n, ad), via: 'search' });
  let p2 = { kept: [] as Ad[], dropped: 0, pages: 0, error: null as string | null, truncated: false };
  for (let i = 0; i < ids.length && !p1.error; i += 10) {
    const r = await pull({ search_page_ids: JSON.stringify(ids.slice(i, i + 10)) }, token, maxPages, () => true);
    p2 = { kept: [...p2.kept, ...r.kept], dropped: p2.dropped + r.dropped, pages: p2.pages + r.pages,
      error: p2.error ?? r.error, truncated: p2.truncated || r.truncated };
  }
  for (const ad of p2.kept) if (!byId.has(ad.id)) byId.set(ad.id, { ...ad, own: true, via: 'page_id' });
  return { ads: [...byId.values()], ownPageIds: ids, dropped: p1.dropped, pages: p1.pages + p2.pages,
    error: p1.error ?? p2.error, truncated: p1.truncated || p2.truncated };
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
      match_rule: 'pass 1: search by full name, page_name or bylines contains last name; own = ownPage(); pass 2: all ads from own page IDs',
      fetched_utc: new Date().toISOString(), own_page_ids: r.ownPageIds,
      pages: r.pages, truncated: r.truncated, dropped: r.dropped, error: r.error, ads: r.ads,
    }));
    const own = r.ads.filter((a) => a.own).length;
    console.log(`${n.raceId} ${n.party} ${n.fullName}: own ${own}, other ${r.ads.length - own}, own pages ${r.ownPageIds.length}, dropped ${r.dropped}, requests ${r.pages}${r.truncated ? ', TRUNCATED' : ''}${r.error ? `, error: ${r.error}` : ''}`);
    if (r.error && /deactivated|OAuth|token/i.test(r.error)) process.exit(2);
  }
}

main().catch((e: unknown) => { console.error(scrub(String(e))); process.exit(1); });
