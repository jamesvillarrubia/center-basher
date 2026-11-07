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

// Lowercase, straight apostrophes, no accents: "Marty O’Donnell" and "Gutiérrez" must match.
export const norm = (s: string | undefined) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2018\u2019\u02bc]/g, "'").toLowerCase();

const STATES: Record<string, string> = { AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas', CA: 'california',
  CO: 'colorado', CT: 'connecticut', DE: 'delaware', FL: 'florida', GA: 'georgia', HI: 'hawaii', ID: 'idaho',
  IL: 'illinois', IN: 'indiana', IA: 'iowa', KS: 'kansas', KY: 'kentucky', LA: 'louisiana', ME: 'maine',
  MD: 'maryland', MA: 'massachusetts', MI: 'michigan', MN: 'minnesota', MS: 'mississippi', MO: 'missouri',
  MT: 'montana', NE: 'nebraska', NV: 'nevada', NH: 'new hampshire', NJ: 'new jersey', NM: 'new mexico',
  NY: 'new york', NC: 'north carolina', ND: 'north dakota', OH: 'ohio', OK: 'oklahoma', OR: 'oregon',
  PA: 'pennsylvania', RI: 'rhode island', SC: 'south carolina', SD: 'south dakota', TN: 'tennessee', TX: 'texas',
  UT: 'utah', VT: 'vermont', VA: 'virginia', WA: 'washington', WV: 'west virginia', WI: 'wisconsin', WY: 'wyoming' };
// Bylines that are never the campaign: official offices, outside groups, party committees, PACs.
const NOT_CAMPAIGN = /house of representative|state senate|state assembly|legislature|realtors|association|union\b|chamber of commerce|\bpac\b|town committee|county committee/;
// Ads for another office (an earlier state-senate, mayoral or statewide race). Skipped when the page
// or byline mentions Congress: "Governor Paul LePage" paid for by LEPAGE FOR CONGRESS is his own.
const OTHER_RACE = /senate|\bsenator\b|commissioner|secretary of|governor|mayor|judge|assembly|county|for city|council|state rep|school board|sheriff|attorney general|for district \d/;
// Namesakes the rules cannot separate, found by the out-of-state audit (2026-11-07): page IDs whose
// ads say they are running elsewhere ("re-election in Tennessee's 9th District").
const NAMESAKE_PAGES = new Set(['6358769182', /* Steve Cohen, TN-09, not CA-50 */ '986915097837365' /* Brad Smith, Ohio, not WI-06 */]);
// Official office ads paid with House office funds: "The Office of Congressman X", "Rep. X (TX-15)".
const OFFICIAL = /\boffice of\b|^(?:the )?(?:congressman|congresswoman|rep\.?|representative|u\.?s\.? rep(?:resentative)?)\b/;
const CAMPAIGN_WORD = /for congress|campaign|committee|friends of|citizens for|victory fund/;
const notCampaign = (by: string, page: string) =>
  NOT_CAMPAIGN.test(by) || (!/congress/.test(by + page) && (OTHER_RACE.test(by) || OTHER_RACE.test(page))) || (OFFICIAL.test(by) && !CAMPAIGN_WORD.test(by));
// Words allowed directly before the last name; any other word there is a different first name.
const LEAD_OK = new Set(['for', 'elect', 'of', 'congressman', 'congresswoman', 'rep', 'rep.', 'representative', 'dr', 'dr.',
  'doc', 'the', 'to', 'citizens', 'friends', 'mr', 'ms', 'mrs', 'nurse', 'team', 'sgt', 'col', 'gen']);
// Words allowed directly after the last name; any other word is a different surname or another race.
const TRAIL_OK = new Set(['for', '4', 'campaign', 'committee', 'congressional', 'victory', 'jr', 'jr.', 'sr', 'ii', 'iii', 'in']);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const B = "(?:^|[^a-z'-])";
const has = (s: string, w: string) => new RegExp(`${B}${esc(w)}(?![a-z-])`).test(s);

// Every word next to the last name must be the nominee's own first name or a campaign word.
function cleanContext(s: string, first: string, last: string): boolean {
  for (const m of s.matchAll(new RegExp(`([a-z.']+)\\s+(?:[a-z]\\.?\\s+)?${esc(last)}(?![a-z-])`, 'g'))) {
    const w = m[1];
    if (!LEAD_OK.has(w) && w !== first && w.slice(0, 3) !== first.slice(0, 3)) return false;
  }
  for (const m of s.matchAll(new RegExp(`${B}${esc(last)}\\s+([a-z0-9.']+)`, 'g'))) {
    if (!TRAIL_OK.has(m[1]) && !/^\d+$/.test(m[1])) return false;
  }
  return true;
}

// A page is the nominee's own when the byline (who paid) is the nominee's campaign:
//  (a) the page name carries the first and last name, and the byline carries the last name or is a
//      joint "victory fund"; a page with no byline counts only if its name says "for congress";
//  (b) or the byline carries the last name and a campaign marker ("for congress", "committee",
//      "friends of", "for <state>").
// In both, the words around the last name must be the nominee's first name or campaign words, so
// "Jack Miller for Georgia" (Brian Jack) and "Gen. Austin Scott Miller" (Austin Scott) fail.
// Spec: reqts/midterm-2026-emphasis.md section 2; audit 2026-11-07.
export function ownPage(n: Nominee, ad: Ad): boolean {
  const first = norm(n.fullName.split(' ')[0]);
  const last = norm(n.lastName);
  const page = norm(ad.page_name);
  const by = norm(ad.bylines);
  if (notCampaign(by, page) || NAMESAKE_PAGES.has(ad.page_id ?? '')) return false;
  if (!cleanContext(page, first, last) || !cleanContext(by, first, last)) return false;
  const st = n.raceId.slice(0, 2);
  if (has(page, first) && has(page, last)) {
    if (!by) return page.includes('for congress');
    return has(by, last) || by.includes('victory fund');
  }
  if (!has(by, last)) return false;
  return /congress|committee|campaign|friends of|citizens for|victory fund/.test(by)
    || has(by, `for ${st.toLowerCase()}`) || by.includes(`for ${STATES[st]}`) || by.includes(`4 ${st.toLowerCase()}`);
}

// An ad pulled by page ID (pass 2) counts when its page passed ownPage on a search hit and its own
// byline is empty, the nominee's campaign, or a joint victory fund (pages also run others' paid ads).
export function ownViaPage(n: Nominee, ad: Ad, ownIds: Set<string>): boolean {
  const by = norm(ad.bylines);
  return ownIds.has(ad.page_id ?? '') && !notCampaign(by, norm(ad.page_name))
    && (!by || has(by, norm(n.lastName)) || by.includes('victory fund') || by === norm(ad.page_name));
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
  const idSet = new Set(ids);
  for (const ad of p2.kept) if (!byId.has(ad.id)) byId.set(ad.id, { ...ad, own: ownViaPage(n, ad, idSet), via: 'page_id' });
  return { ads: [...byId.values()], ownPageIds: ids, dropped: p1.dropped, pages: p1.pages + p2.pages,
    error: p1.error ?? p2.error, truncated: p1.truncated || p2.truncated };
}

// --reflag: re-apply ownPage to stored ads without network; print nominees whose own page IDs grew
// (their pass 2 must be re-fetched).
function reflag() {
  const byKey = new Map(nominees().map((n) => [`${n.raceId}__${n.party}`, n]));
  const refetch: string[] = [];
  for (const [key, n] of byKey) {
    const file = join(OUT, `${key}.json`);
    if (!existsSync(file)) continue;
    const d = JSON.parse(readFileSync(file, 'utf8'));
    for (const ad of d.ads) if (ad.via !== 'page_id') ad.own = ownPage(n, ad);
    const ids = [...new Set(d.ads.filter((a: Ad & { own: boolean; via: string }) => a.own && a.via !== 'page_id' && a.page_id)
      .map((a: Ad) => a.page_id))] as string[];
    const idSet = new Set(ids);
    for (const ad of d.ads) if (ad.via === 'page_id') ad.own = ownViaPage(n, ad, idSet);
    const grew = ids.filter((i) => !d.own_page_ids.includes(i));
    d.match_rule = 'ownPage v2 (2026-11-07), reflagged offline';
    if (grew.length) { d.needs_refetch = true; refetch.push(n.raceId); }
    writeFileSync(file, JSON.stringify(d));
  }
  console.log(`needs refetch (${refetch.length}): ${[...new Set(refetch)].join(',')}`);
}

async function main() {
  if (process.argv.includes('--reflag')) return reflag();
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
