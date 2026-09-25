import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const csv = await readFile(new URL('../docs/marketing-seo-scorecard-template.csv', import.meta.url), 'utf8');
const [header, ...rows] = csv.trim().split(/\r?\n/);
const columns = header.split(',');

const required = [
  'reporting_period','page_url','page_group','page_lifecycle','search_surface','publication_date','sitemap_owner','indexability',
  'canonical_status','inspection_state','impressions','clicks','ctr','average_position',
  'landing_sessions','engaged_sessions','engagement_rate','cta_event_count','cta_type',
  'qualified_inquiry_count','opportunity_count','won_count','lost_count','pipeline_value','revenue_value',
  'session_to_cta_rate','cta_to_qualified_rate','qualified_to_opportunity_rate',
  'ai_citation_count','ai_referral_sessions','attribution_method','survival_decision',
  'data_source','source_property','source_timestamp','timezone','owner','blocker','next_action','review_due','status'
];

assert.deepEqual(columns, required, 'scorecard columns must remain stable and ordered');
assert.ok(rows.length >= 1, 'scorecard template must contain at least one safe example row');

const statuses = new Set(['VERIFIED','PARTIAL','PENDING_CONNECTION','NOT_AVAILABLE','NEEDS_REVIEW']);
const ctaTypes = new Set([
  '', 'primary_inquiry','email_contact_click','phone_click','academy_interest_preview',
  'logistics_request_preview','carrier_cta','dealer_shipper_cta','case_study_cta',
  'resource_to_commercial_click'
]);
const pageGroups = new Set([
  'logistics_local','logistics_service','digital_service','case_study','academy','marketing','technology','resource',
  'catalog','geo','localization','experimental'
]);
const lifecycles = new Set(['core_money','supporting_authority','experimental','catalog','geo','localization']);
const searchSurfaces = new Set(['web','image','multimodal','google_ai','bing_organic','bing_copilot','ai_referral']);
const survivalDecisions = new Set(['KEEP','MERGE','NOINDEX','REPOSITION','IMPROVE','DELETE','PENDING_EVIDENCE']);
const attributionMethods = new Set(['','direct','page_level','query_share_estimate','crm_reconciled','not_available']);

const forbidden = /(name|email|phone|mc\/?dot|vin|exact address|shipment id|rate|commission|credential|free-form message)/i;

for (const row of rows) {
  const values = row.split(',');
  assert.equal(values.length, columns.length, 'every example row must match the schema');
  const record = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
  assert.ok(pageGroups.has(record.page_group), `unsupported page_group: ${record.page_group}`);
  assert.ok(lifecycles.has(record.page_lifecycle), `unsupported page_lifecycle: ${record.page_lifecycle}`);
  assert.ok(searchSurfaces.has(record.search_surface), `unsupported search_surface: ${record.search_surface}`);
  assert.ok(statuses.has(record.status), `unsupported status: ${record.status}`);
  assert.ok(ctaTypes.has(record.cta_type), `unsupported CTA type: ${record.cta_type}`);
  assert.ok(survivalDecisions.has(record.survival_decision), `unsupported survival_decision: ${record.survival_decision}`);
  assert.ok(attributionMethods.has(record.attribution_method), `unsupported attribution_method: ${record.attribution_method}`);
  assert.ok(record.page_url.startsWith('https://hermeslogisticsus.com/'), 'example URL must use the canonical host');
  for (const [key, value] of Object.entries(record)) {
    if (['owner','blocker','next_action'].includes(key)) continue;
    assert.equal(forbidden.test(value), false, `forbidden private field signal in ${key}`);
  }
}

console.log(`Marketing Search/AI scorecard validated: ${columns.length} columns, ${rows.length} safe example rows.`);
