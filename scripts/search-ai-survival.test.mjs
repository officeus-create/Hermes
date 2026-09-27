import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const csv = await readFile(new URL('../docs/page-survival-inventory-2026-09-26.csv', import.meta.url), 'utf8');
const forensic = JSON.parse(await readFile(new URL('../docs/visibility-loss-forensic-2026-09-26.json', import.meta.url), 'utf8'));
const assets = JSON.parse(await readFile(new URL('../docs/original-evidence-asset-plan-2026-09-26.json', import.meta.url), 'utf8'));
const os = await readFile(new URL('../docs/SEARCH_AI_VISIBILITY_OPERATING_SYSTEM.md', import.meta.url), 'utf8');
const authority = await readFile(new URL('../docs/SEO11_AUTHORITY_REGISTRY_2026-08-11.md', import.meta.url), 'utf8');

const [header, ...dataRows] = csv.trim().split(/\r?\n/);
const columns = header.split(',');
const required = [
  'url','sitemap','lifecycle','direction','business_role','lastmod','gsc_age_gate','current_main_sha',
  'repo_index_contract','production_evidence','gsc_page_state','gsc_impressions','gsc_clicks',
  'gsc_avg_position','returned_query_count','distinct_intent_state','google_index_state','ga4_outcome',
  'ai_citation_state','survival_decision','decision_basis','next_review_trigger'
];
assert.deepEqual(columns, required);
assert.equal(dataRows.length, 292, 'canonical export must contain 292 URLs');
const records = dataRows.map((row) => Object.fromEntries(columns.map((column, index) => [column, row.split(',')[index]])));
assert.equal(new Set(records.map((row) => row.url)).size, records.length, 'inventory URLs must be unique');

const decisions = new Set(['KEEP','IMPROVE','REPOSITION','MERGE','NOINDEX','DELETE','PENDING_EVIDENCE']);
const lifecycles = new Set(['core_money','supporting_authority','experimental','catalog','geo','localization']);
const decisionCounts = new Map();
const pageStateCounts = new Map();
for (const row of records) {
  assert.ok(row.url.startsWith('https://hermeslogisticsus.com/'));
  assert.ok(decisions.has(row.survival_decision), `unsupported decision: ${row.survival_decision}`);
  assert.ok(lifecycles.has(row.lifecycle), `unsupported lifecycle: ${row.lifecycle}`);
  assert.ok(row.distinct_intent_state);
  assert.ok(row.google_index_state);
  assert.ok(row.business_role);
  assert.equal(row.current_main_sha, '51f5544a754d79ca0b2af897c608ad85016a2fca');
  decisionCounts.set(row.survival_decision, (decisionCounts.get(row.survival_decision) ?? 0) + 1);
  pageStateCounts.set(row.gsc_page_state, (pageStateCounts.get(row.gsc_page_state) ?? 0) + 1);
  if (row.gsc_page_state === 'NOT_OBSERVED_IN_RETURNED_ROWS') {
    assert.equal(row.gsc_impressions, '', 'absence from returned rows must not be encoded as zero impressions');
    assert.equal(row.gsc_clicks, '', 'absence from returned rows must not be encoded as zero clicks');
    assert.equal(row.gsc_avg_position, '', 'absence from returned rows must not retain stale position');
    assert.equal(row.returned_query_count, '', 'absence from returned rows must not retain stale query counts');
  }
}
assert.equal(decisionCounts.get('KEEP'), 11);
assert.equal(decisionCounts.get('IMPROVE'), 2);
assert.equal(decisionCounts.get('PENDING_EVIDENCE'), 279);
assert.equal(pageStateCounts.get('PAGE_ROW_OBSERVED'), 24);
assert.equal(pageStateCounts.get('QUERY_PAGE_ROWS_PARTIAL'), 8);
assert.equal(pageStateCounts.get('NOT_OBSERVED_IN_RETURNED_ROWS'), 260);

const byUrl = new Map(records.map((row) => [new URL(row.url).pathname, row]));
assert.equal(byUrl.get('/services/seo-for-logistics-companies/').survival_decision, 'KEEP');
assert.equal(byUrl.get('/services/seo-for-logistics-companies/').gsc_impressions, '57');
assert.equal(byUrl.get('/load-board/').survival_decision, 'IMPROVE');
assert.equal(byUrl.get('/load-board/').gsc_impressions, '33');
assert.equal(byUrl.get('/logistics/appleton-wi-vehicle-transport/').survival_decision, 'PENDING_EVIDENCE');
assert.equal(byUrl.get('/case/appleton-vehicle-transport-seo/').production_evidence, 'LIVE_200_CONTENT_VERIFIED_AFTER_1495');
assert.equal(records.some((row) => ['MERGE','NOINDEX','DELETE'].includes(row.survival_decision)), false, 'destructive decisions require stronger evidence');

assert.equal(forensic.current_range.endDate, '2026-09-23');
assert.equal(forensic.current.impressions, 305);
assert.equal(forensic.comparison.impressions, 1660);
assert.equal(forensic.diagnosis, 'VISIBILITY_LOSS_NOT_PRIMARY_CTR_COLLAPSE');
assert.equal(forensic.country_segments.usa.totals.impressions, 224);
assert.equal(forensic.device_segments.desktop.totals.impressions, 271);
assert.ok(forensic.limitations.includes('Top page and query-page rows are returned subsets; absence is UNKNOWN, not zero.'));

assert.equal(assets.assets.length, 5);
for (const asset of assets.assets) {
  assert.ok(asset.existing_owner.startsWith('/'));
  assert.ok(asset.source_gate);
  assert.ok(asset.minimum_sample);
  assert.ok(asset.privacy.length >= 3);
  assert.deepEqual(asset.retrieval, asset.retrieval.filter(Boolean));
  assert.ok(asset.retrieval.includes('transcript') || asset.retrieval.some((item) => item.includes('transcript')));
}
assert.ok(os.includes('260 remain `SITEMAP_ONLY_GSC_TOP_ROWS_UNKNOWN`, not zero'));
assert.ok(os.includes('dated immutable export snapshot'));
assert.ok(authority.includes('SELECTIVE_PILOT_DECLINED / PAID_DISTRIBUTION_AVAILABLE / EARNED_AUTHORITY_NOT_ESTABLISHED'));

console.log(`Search/AI survival package validated: ${records.length} URLs, ${assets.assets.length} evidence assets.`);
