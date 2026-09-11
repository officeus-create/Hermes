import assert from "node:assert/strict";
import fs from "node:fs";

const schema = fs.readFileSync(new URL("../functions/api/_lib/load-board-schema.mjs", import.meta.url), "utf8");
const helpers = fs.readFileSync(new URL("../functions/api/_lib/load-board-opportunity.mjs", import.meta.url), "utf8");
const intake = fs.readFileSync(new URL("../functions/api/load-board/intake.ts", import.meta.url), "utf8");
const active = fs.readFileSync(new URL("../functions/api/load-board/active.ts", import.meta.url), "utf8");
const opportunities = fs.readFileSync(new URL("../functions/api/load-board/opportunities.ts", import.meta.url), "utf8");
const dispatchPlan = fs.readFileSync(new URL("../functions/api/load-board/dispatch-plan.ts", import.meta.url), "utf8");
const agentContext = fs.readFileSync(new URL("../functions/api/load-board/agent-context.ts", import.meta.url), "utf8");
const providerSync = fs.readFileSync(new URL("../functions/api/load-board/providers/sync.ts", import.meta.url), "utf8");
const seoData = fs.readFileSync(new URL("../src/data/load-board-seo.ts", import.meta.url), "utf8");
const seoLanding = fs.readFileSync(new URL("../src/components/LoadBoardSeoLanding.astro", import.meta.url), "utf8");
const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const serviceSitemap = fs.readFileSync(new URL("../public/sitemap-services.xml", import.meta.url), "utf8");
const indexNow = fs.readFileSync(new URL("../.github/workflows/indexnow-money-pages.yml", import.meta.url), "utf8");

assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_sources/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_records/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_quarantine/);
assert.match(schema, /UNIQUE\(source_id, source_message_id, fingerprint\)/);
assert.match(schema, /credential_ref TEXT/);
assert.match(schema, /car_hauling_ingest_allowed INTEGER NOT NULL DEFAULT 0/);
assert.match(schema, /pending_review/);
for (const column of [
  "provider_record_id", "origin_city", "origin_state", "origin_zip", "destination_city", "destination_state",
  "destination_zip", "distance_miles", "deadhead_miles", "vehicle_count", "operable", "enclosed",
  "payment_terms", "rate_per_mile", "source_quality_score", "dedupe_key", "provider_url",
]) assert.match(schema, new RegExp(`${column} `));
assert.match(schema, /PRAGMA table_info/);
assert.match(schema, /idx_load_records_lane/);
assert.match(schema, /idx_load_records_dedupe/);
assert.doesNotMatch(schema, /password_hash|password_salt|refresh_token|access_token/i);

assert.match(helpers, /function scoreOpportunity/);
assert.match(helpers, /function buildOpportunityDedupeKey/);
assert.match(helpers, /rpm_3_plus/);
assert.match(helpers, /deadhead_25_or_less/);
assert.match(helpers, /fresh_30m/);
assert.match(helpers, /equipment_exact/);

const { scoreOpportunity, buildOpportunityDedupeKey } = await import("../functions/api/_lib/load-board-opportunity.mjs");
const recent = new Date().toISOString();
const strong = scoreOpportunity({
  equipment: "car_hauler",
  origin_state: "IL",
  destination_state: "WI",
  rate_amount: 900,
  distance_miles: 250,
  deadhead_miles: 20,
  provider_record_id: "P1",
  vehicle_count: 3,
  observed_at: recent,
}, { equipment: "car_hauler", originState: "IL", destinationState: "WI" });
const weak = scoreOpportunity({
  equipment: "dry_van",
  origin_state: "TX",
  destination_state: "CA",
  rate_amount: 200,
  distance_miles: 500,
  deadhead_miles: 400,
  observed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
}, { equipment: "car_hauler", originState: "IL", destinationState: "WI" });
assert.ok(strong.score > weak.score);
assert.equal(strong.ratePerMile, 3.6);
assert.match(buildOpportunityDedupeKey({ origin_state: "IL", destination_state: "WI", equipment: "car_hauler", rate_amount: 900, vehicle_count: 3 }), /il\|wi/);

assert.match(intake, /HERMES_LOADBOARD_INGEST_TOKEN/);
assert.match(intake, /LEAD_SERVICE_TOKEN/);
assert.match(intake, /Authorization/);
assert.match(intake, /source_type/);
assert.match(intake, /normalizeEquipment/);
assert.match(intake, /buildOpportunityDedupeKey/);
assert.match(intake, /scoreOpportunity/);
assert.match(intake, /provider_record_id/);
assert.match(intake, /rate_per_mile/);
assert.match(intake, /source_quality_score/);
assert.match(intake, /send_enabled = 0/);
assert.match(intake, /car_hauling_ingest_allowed = 1/);
assert.match(intake, /car_hauling_outreach_hold = 1/);
assert.doesNotMatch(intake, /reason: "car_hauling_hold"/);
assert.match(intake, /car_hauling_ingest_allowed: true/);
assert.match(intake, /car_hauling_broker_outreach_hold: true/);
assert.match(intake, /ON CONFLICT\(source_id, source_message_id, fingerprint\)/);
assert.match(intake, /INSERT INTO hermes_load_quarantine/);
assert.match(intake, /quarantined/);
assert.match(intake, /items_required/);
assert.match(intake, /clampVisibility/);
assert.match(intake, /outbound_enabled: false/);

assert.match(active, /getAuthenticatedSpecialist/);
assert.match(active, /carrier\|owner\[- \]\?operator\|dispatcher/i);
assert.match(active, /visibility IN \('public', 'carrier_only'\)/);
assert.match(active, /visibility = 'public'/);
for (const equipment of ["dry_van", "reefer", "flatbed", "step_deck", "power_only", "hotshot", "box_truck", "sprinter_van", "car_hauler"]) {
  assert.match(active, new RegExp(`"${equipment}"`));
}
assert.match(active, /rateAmount/);
assert.match(active, /ratePerMile/);
assert.match(active, /deadheadMiles/);
assert.match(active, /score/);
assert.match(active, /contact_details_exposed: false/);
assert.match(active, /X-Robots-Tag/);
assert.doesNotMatch(active, /source_message_id|raw_evidence_ref|mailbox_email|credential_ref/);
assert.doesNotMatch(active, /hermes_load_quarantine/);

assert.match(opportunities, /deduplicated: true/);
assert.match(opportunities, /score_version: "hermes_opportunity_v1"/);
assert.match(opportunities, /min_rpm/);
assert.match(opportunities, /max_deadhead/);
assert.match(opportunities, /origin_state/);
assert.match(opportunities, /destination_state/);
assert.match(opportunities, /provider/);
assert.match(opportunities, /bestByDedupe/);
assert.match(opportunities, /contact_details_exposed: false/);
assert.match(opportunities, /X-Robots-Tag/);
assert.doesNotMatch(opportunities, /source_message_id|raw_evidence_ref|mailbox_email|credential_ref|contact_name|phone|email/);

assert.match(dispatchPlan, /planner_version: "hermes_chain_v1"/);
assert.match(dispatchPlan, /planning_only: true/);
assert.match(dispatchPlan, /booking_performed: false/);
assert.match(dispatchPlan, /max_legs/);
assert.match(dispatchPlan, /projectedLoadedRpm/);
assert.match(dispatchPlan, /dispatcher_or_carrier_role_required/);
assert.match(dispatchPlan, /dedupeKey/);
assert.match(dispatchPlan, /X-Robots-Tag/);
assert.doesNotMatch(dispatchPlan, /source_message_id|raw_evidence_ref|credential_ref|contact_name|phone|email/);

assert.match(agentContext, /HERMES_AI_LOGISTICS_TOKEN/);
assert.match(agentContext, /"opportunities", "lanes", "providers"/);
assert.match(agentContext, /data_classification: "internal-logistics-context"/);
assert.match(agentContext, /contact_details_exposed: false/);
assert.match(agentContext, /raw_evidence_exposed: false/);
assert.match(agentContext, /raw_credentials_exposed: false/);
assert.match(agentContext, /X-Robots-Tag/);
assert.doesNotMatch(agentContext, /credential_ref|source_message_id|raw_evidence_ref|contact_name|phone|email/);

assert.match(providerSync, /https:\/\/ship\.cars\/api\/loadboard\/v3\/postings/);
assert.match(providerSync, /HERMES_PROVIDER_SYNC_ENABLED/);
assert.match(providerSync, /HERMES_SHIP_CARS_COMMERCIAL_APPROVED/);
assert.match(providerSync, /HERMES_SHIP_CARS_DATA_RIGHTS_APPROVED/);
assert.match(providerSync, /HERMES_SHIP_CARS_PUBLIC_DISPLAY_APPROVED/);
assert.match(providerSync, /SHIP_CARS_ACCESS_TOKEN/);
assert.match(providerSync, /grant_type: "password"/);
assert.match(providerSync, /scraping_used: false/);
assert.match(providerSync, /write_or_book_performed: false/);
assert.doesNotMatch(providerSync, /playwright|puppeteer|selenium|browser\.newPage/i);

for (const slug of ["ship-cars", "central-dispatch", "super-dispatch", "dat", "truckstop", "123loadboard", "direct-freight"]) {
  assert.match(seoData, new RegExp(`slug: "${slug}"`));
  assert.match(sitemap, new RegExp(`/load-board/providers/${slug}/`));
  assert.match(indexNow, new RegExp(`/load-board/providers/${slug}/`));
}
for (const slug of ["car-hauler", "dry-van", "reefer", "flatbed", "step-deck", "hotshot", "power-only", "box-truck"]) {
  assert.match(seoData, new RegExp(`slug: "${slug}"`));
  assert.match(sitemap, new RegExp(`/load-board/equipment/${slug}/`));
  assert.match(indexNow, new RegExp(`/load-board/equipment/${slug}/`));
}
for (const market of ["chicago-il", "denver-co", "seattle-wa", "fremont-ca", "kansas-city-mo-ks"]) {
  assert.match(serviceSitemap, new RegExp(`/logistics/car-hauler-loads/${market}/`));
  assert.doesNotMatch(sitemap, new RegExp(`/logistics/car-hauler-loads/${market}/`));
  assert.match(indexNow, new RegExp(`/logistics/car-hauler-loads/${market}/`));
}
assert.match(seoLanding, /FAQPage/);
assert.match(seoLanding, /BreadcrumbList/);
assert.match(seoLanding, /data-ai-answer/);
assert.match(seoLanding, /No marketplace scraping/);
assert.match(seoLanding, /\/load-board\/#live-marketplace/);

console.log("load-board-intake-api-contract: normalized opportunity schema, scoring, safe search, planning, AI context, official Ship.Cars sync, and SEO/GEO distribution verified");
await import("./load-board-email-bridge-contract.test.mjs");
