import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const csv = await readFile(new URL('../docs/page-survival-inventory-2026-09-26.csv', import.meta.url), 'utf8');
const forensic = JSON.parse(await readFile(new URL('../docs/visibility-loss-forensic-2026-09-26.json', import.meta.url), 'utf8'));
const assets = JSON.parse(await readFile(new URL('../docs/original-evidence-asset-plan-2026-09-26.json', import.meta.url), 'utf8'));
const os = await readFile(new URL('../docs/SEARCH_AI_VISIBILITY_OPERATING_SYSTEM.md', import.meta.url), 'utf8');
const authority = await readFile(new URL('../docs/SEO11_AUTHORITY_REGISTRY_2026-08-11.md', import.meta.url), 'utf8');

const [header, ...dataRows] = csv.trim().split(/\r?\n/);
const columns = header.split(',');
const required = ['url','sitemap','sitemap_lastmod','lastmod_gate','lifecycle','distinct_intent','index_state','impressions','clicks','average_position','query_diversity','business_role','qualified_action','survival_decision','decision_reason','evidence_scope','review_due'];
assert.deepEqual(columns, required);
assert.equal(dataRows.length, 292, 'current sitemap inventory must contain 292 URLs');
const records = dataRows.map((row) => Object.fromEntries(columns.map((column, index) => [column, row.split(',')[index]])));
assert.equal(new Set(records.map((row) => row.url)).size, records.length, 'inventory URLs must be unique');
const decisions = new Set(['KEEP','IMPROVE','REPOSITION','MERGE','NOINDEX','DELETE','PENDING_EVIDENCE']);
const lifecycles = new Set(['core_money','supporting_authority','experimental','catalog','geo','localization']);
for (const row of records) {
  assert.ok(row.url.startsWith('https://hermeslogisticsus.com/'));
  assert.ok(decisions.has(row.survival_decision), `unsupported decision: ${row.survival_decision}`);
  assert.ok(lifecycles.has(row.lifecycle), `unsupported lifecycle: ${row.lifecycle}`);
  assert.ok(row.distinct_intent);
  assert.ok(row.index_state);
  assert.ok(row.business_role);
  assert.ok(row.qualified_action);
  if (row.index_state === 'SITEMAP_ONLY_GSC_TOP_ROWS_UNKNOWN') {
    assert.equal(row.impressions, '', 'absence from returned rows must not be encoded as zero impressions');
  }
}
const byUrl = new Map(records.map((row) => [new URL(row.url).pathname, row]));
assert.equal(byUrl.get('/services/seo-for-logistics-companies/').survival_decision, 'KEEP');
assert.equal(byUrl.get('/load-board/').survival_decision, 'IMPROVE');
assert.equal(byUrl.get('/logistics/appleton-wi-vehicle-transport/').survival_decision, 'PENDING_EVIDENCE');
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
assert.ok(authority.includes('SELECTIVE_PILOT_DECLINED / PAID_DISTRIBUTION_AVAILABLE / EARNED_AUTHORITY_NOT_ESTABLISHED'));

console.log(`Search/AI survival package validated: ${records.length} URLs, ${assets.assets.length} evidence assets.`);
