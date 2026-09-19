import assert from "node:assert/strict";
import fs from "node:fs";

const schema = fs.readFileSync(new URL("../functions/api/_lib/load-board-schema.mjs", import.meta.url), "utf8");
const helpers = fs.readFileSync(new URL("../functions/api/_lib/load-board-opportunity.mjs", import.meta.url), "utf8");
const companyAccess = fs.readFileSync(new URL("../functions/api/_lib/hermes-company-profiles.mjs", import.meta.url), "utf8");
const intake = fs.readFileSync(new URL("../functions/api/load-board/intake.ts", import.meta.url), "utf8");
const active = fs.readFileSync(new URL("../functions/api/load-board/active.ts", import.meta.url), "utf8");
const summary = fs.readFileSync(new URL("../functions/api/load-board/summary.ts", import.meta.url), "utf8");
const opportunities = fs.readFileSync(new URL("../functions/api/load-board/opportunities.ts", import.meta.url), "utf8");
const dispatchPlan = fs.readFileSync(new URL("../functions/api/load-board/dispatch-plan.ts", import.meta.url), "utf8");
const agentContext = fs.readFileSync(new URL("../functions/api/load-board/agent-context.ts", import.meta.url), "utf8");
const providerSync = fs.readFileSync(new URL("../functions/api/load-board/providers/sync.ts", import.meta.url), "utf8");
const sourceRequests = fs.readFileSync(new URL("../functions/api/load-board/source-requests.ts", import.meta.url), "utf8");
const sourceReviews = fs.readFileSync(new URL("../functions/api/load-board/source-reviews.ts", import.meta.url), "utf8");
const sourceConnections = fs.readFileSync(new URL("../functions/api/load-board/source-connections.ts", import.meta.url), "utf8");
const sourceSetupPage = fs.readFileSync(new URL("../src/pages/services/hermes-connect/load-board/source/index.astro", import.meta.url), "utf8");
const datReadiness = fs.readFileSync(new URL("../functions/api/_lib/dat-provider-readiness.mjs", import.meta.url), "utf8");
const seoData = fs.readFileSync(new URL("../src/data/load-board-seo.ts", import.meta.url), "utf8");
const seoLanding = fs.readFileSync(new URL("../src/components/LoadBoardSeoLanding.astro", import.meta.url), "utf8");
const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const serviceSitemap = fs.readFileSync(new URL("../public/sitemap-services.xml", import.meta.url), "utf8");
const indexNow = fs.readFileSync(new URL("../.github/workflows/indexnow-money-pages.yml", import.meta.url), "utf8");

const forbiddenContactFields = /source_message_id|raw_evidence_ref|mailbox_email|credential_ref|contact_name|contact_email|email_address|phone_number|contact_phone/i;

assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_sources/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_records/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_quarantine/);
assert.match(schema, /UNIQUE\(source_id, source_message_id, fingerprint\)/);
assert.match(schema, /credential_ref TEXT/);
assert.match(schema, /car_hauling_ingest_allowed INTEGER NOT NULL DEFAULT 0/);
assert.match(schema, /pending_review/);
for (const column of [
  "provider_record_id", "origin_city", "origin_state", "origin_zip", "destination_city", "destination_state",
  "destination_zip", "delivery_window", "distance_miles", "deadhead_miles", "weight_lbs", "length_feet",
  "vehicle_count", "operable", "enclosed", "payment_terms", "rate_per_mile", "source_quality_score", "dedupe_key", "provider_url",
]) assert.match(schema, new RegExp(`${column} `));
assert.match(schema, /PRAGMA table_info/);
assert.match(schema, /idx_load_records_lane/);
assert.match(schema, /idx_load_records_dedupe/);
assert.doesNotMatch(schema, /password_hash|password_salt|refresh_token|access_token/i);

for (const column of [
  "connection_state", "source_id", "connection_evidence_ref", "data_rights_evidence_ref",
  "retention_rule", "revocation_rule", "car_hauling_ingest_allowed",
  "connection_verified_at", "ingest_enabled_at", "first_record_verified_at", "revoked_at", "revocation_note",
]) assert.match(schema, new RegExp(`${column}: `));
assert.match(schema, /idx_load_source_requests_source/);

assert.match(sourceRequests, /connection_state/);
assert.match(sourceRequests, /source_active/);
assert.match(sourceReviews, /connection_state/);
assert.match(sourceReviews, /source_connection_lifecycle/);
assert.match(sourceSetupPage, /Connection:/);

assert.match(sourceConnections, /requireInternalOwner/);
assert.match(sourceConnections, /sameOriginMutation/);
assert.match(sourceConnections, /"initialize", "verify_connection", "enable_ingest", "verify_first_record", "revoke"/);
for (const state of ["connection_pending", "connection_verified", "ingest_enabled", "active", "revoked"]) {
  assert.match(sourceConnections, new RegExp(`'${state}'|"${state}"`));
}
assert.match(sourceConnections, /source_request_must_be_approved/);
assert.match(sourceConnections, /runtime_verification_required/);
assert.match(sourceConnections, /connection_and_rights_evidence_required/);
assert.match(sourceConnections, /current_source_record_required/);
assert.match(sourceConnections, /status = 'active' AND expires_at > \?/);
assert.match(sourceConnections, /read_enabled = 0, ingest_enabled = 0, send_enabled = 0/);
assert.match(sourceConnections, /read_enabled = 1, ingest_enabled = 1, send_enabled = 0/);
assert.match(sourceConnections, /outbound_enabled: false/);
assert.match(sourceConnections, /secret_material_not_allowed/);
assert.match(sourceConnections, /X-Robots-Tag/);
assert.doesNotMatch(sourceConnections, /password_hash|password_salt|access_token|refresh_token/i);
assert.ok(
  sourceConnections.indexOf("connection_pending") < sourceConnections.indexOf("connection_verified") &&
  sourceConnections.indexOf("connection_verified") < sourceConnections.indexOf("ingest_enabled"),
  "source connection lifecycle must stay fail-closed and ordered",
);

assert.match(helpers, /function scoreOpportunity/);
assert.match(helpers, /function buildOpportunityDedupeKey/);
assert.match(helpers, /rpm_3_plus/);
assert.match(helpers, /deadhead_25_or_less/);
assert.match(helpers, /fresh_30m/);
assert.match(helpers, /equipment_exact/);

assert.match(companyAccess, /function specialistHasLoadBoardAccess/);
assert.match(companyAccess, /carrier\|owner\[- \]\?operator\|dispatcher\|operations/i);
assert.match(companyAccess, /hermes_company_profiles/);
assert.match(companyAccess, /load_board_access/);
assert.match(companyAccess, /owner_specialist_id/);

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
assert.notEqual(
  buildOpportunityDedupeKey({ origin: "Chicago, IL", destination: "Madison, WI", equipment: "dry_van", rate_amount: 1200 }),
  buildOpportunityDedupeKey({ origin: "Peoria, IL", destination: "Madison, WI", equipment: "dry_van", rate_amount: 1200 }),
  "cross-source dedupe must not collapse distinct cities that share a state",
);

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
assert.match(intake, /risk_flags/);
assert.match(intake, /contact_data_present/);
assert.match(intake, /rate_outlier_review/);
assert.match(intake, /source_credential_missing/);
assert.match(active, /COUNT\(\*\) OVER/);
assert.match(active, /PARTITION BY r\.record_type/);
assert.match(active, /ROW_NUMBER\(\) OVER/);
assert.match(active, /cluster_rank = 1/);
assert.match(active, /duplicateCount/);
assert.match(active, /reviewFlags/);
assert.match(summary, /COUNT\(DISTINCT CASE/);
assert.match(summary, /record_type \|\| '\|' \|\| dedupe_key/);
assert.match(intake, /send_enabled = 0/);
assert.match(intake, /car_hauling_ingest_allowed = 1/);
assert.match(intake, /car_hauling_outreach_hold = 1/);
assert.doesNotMatch(intake, /reason: "car_hauling_hold"/);
assert.match(intake, /car_hauling_ingest_allowed: true/);
assert.match(intake, /car_hauling_broker_outreach_hold: true/);
assert.match(intake, /ON CONFLICT DO UPDATE SET/);
assert.match(intake, /WHERE source_id = \? AND source_message_id = \? AND fingerprint = \?/);
assert.match(intake, /WHERE source_id = \? AND dedupe_key = \?/);
assert.match(intake, /id <> \? AND status = 'active'/);
assert.match(intake, /INSERT INTO hermes_load_quarantine/);
assert.match(intake, /quarantined/);
assert.match(intake, /items_required/);
assert.match(intake, /clampVisibility/);
assert.match(intake, /record\.covered === true/);
assert.match(intake, /\["covered", "booked", "unavailable", "cancelled", "canceled"\]/);
assert.match(intake, /sourceCovered \? "covered"/);
assert.match(intake, /outbound_enabled: false/);

assert.match(active, /getAuthenticatedSpecialist/);
assert.match(active, /specialistHasLoadBoardAccess/);
assert.match(active, /visibility IN \('public', 'carrier_only'\)/);
assert.match(active, /visibility = 'public'/);
assert.match(active, /company_registration_unlocks_access: true/);
for (const equipment of ["dry_van", "reefer", "flatbed", "step_deck", "power_only", "hotshot", "box_truck", "sprinter_van", "car_hauler"]) {
  assert.match(active, new RegExp(`"${equipment}"`));
}
assert.match(active, /rateAmount/);
assert.match(active, /ratePerMile/);
assert.match(active, /deadheadMiles/);
assert.match(active, /deliveryWindow/);
assert.match(active, /weightLbs/);
assert.match(active, /lengthFeet/);
assert.match(active, /score/);
assert.match(active, /contact_details_exposed: false/);
assert.match(active, /X-Robots-Tag/);
assert.doesNotMatch(active, forbiddenContactFields);
assert.doesNotMatch(active, /hermes_load_quarantine/);

assert.match(opportunities, /specialistHasLoadBoardAccess/);
assert.match(opportunities, /deduplicated: true/);
assert.match(opportunities, /score_version: "hermes_opportunity_v1"/);
assert.match(opportunities, /company_registration_unlocks_access: true/);
assert.match(opportunities, /min_rpm/);
assert.match(opportunities, /max_deadhead/);
assert.match(opportunities, /origin_state/);
assert.match(opportunities, /destination_state/);
assert.match(opportunities, /provider/);
assert.match(opportunities, /bestByDedupe/);
assert.match(opportunities, /contact_details_exposed: false/);
assert.match(opportunities, /X-Robots-Tag/);
assert.doesNotMatch(opportunities, forbiddenContactFields);
assert.match(opportunities, /"email"/);

assert.match(dispatchPlan, /specialistHasLoadBoardAccess/);
assert.match(dispatchPlan, /planner_version: "hermes_chain_v1"/);
assert.match(dispatchPlan, /planning_only: true/);
assert.match(dispatchPlan, /booking_performed: false/);
assert.match(dispatchPlan, /company_registration_unlocks_access: true/);
assert.match(dispatchPlan, /max_legs/);
assert.match(dispatchPlan, /projectedLoadedRpm/);
assert.match(dispatchPlan, /dispatcher_or_carrier_role_required/);
assert.match(dispatchPlan, /dedupeKey/);
assert.match(dispatchPlan, /X-Robots-Tag/);
assert.doesNotMatch(dispatchPlan, forbiddenContactFields);

assert.match(agentContext, /HERMES_AI_LOGISTICS_TOKEN/);
assert.match(agentContext, /"opportunities", "lanes", "providers"/);
assert.match(agentContext, /data_classification: "internal-logistics-context"/);
assert.match(agentContext, /contact_details_exposed: false/);
assert.match(agentContext, /raw_evidence_exposed: false/);
assert.match(agentContext, /raw_credentials_exposed: false/);
assert.match(agentContext, /X-Robots-Tag/);
// Reading the presence of a private connection pointer is allowed; returning its value is not.
// Remove only this exact boolean SQL projection, not arbitrary query/source text.
const safePresenceProjection = "CASE WHEN s.credential_ref IS NOT NULL AND TRIM(s.credential_ref) <> '' THEN 1 ELSE 0 END AS connection_pointer_present,";
assert.equal(agentContext.split(safePresenceProjection).length - 1, 2);
assert.doesNotMatch(agentContext.replaceAll(safePresenceProjection, ""), forbiddenContactFields);
assert.doesNotMatch(agentContext, /row\??\.credential_ref|credential_ref\s*:/i);
assert.match(agentContext, /Boolean\(row\.connection_pointer_present\)/);

assert.match(providerSync, /https:\/\/ship\.cars\/api\/loadboard\/v3\/postings/);
assert.match(providerSync, /HERMES_PROVIDER_SYNC_ENABLED/);
assert.match(providerSync, /HERMES_SHIP_CARS_COMMERCIAL_APPROVED/);
assert.match(providerSync, /HERMES_SHIP_CARS_DATA_RIGHTS_APPROVED/);
assert.match(providerSync, /HERMES_SHIP_CARS_PUBLIC_DISPLAY_APPROVED/);
assert.match(providerSync, /SHIP_CARS_ACCESS_TOKEN/);
assert.match(providerSync, /evaluateDatProviderReadiness/);
assert.match(datReadiness, /HERMES_DAT_PARTNERSHIP_APPROVED/);
assert.match(datReadiness, /HERMES_DAT_DATA_RIGHTS_APPROVED/);
assert.match(datReadiness, /HERMES_DAT_CERTIFIED/);
assert.match(datReadiness, /DAT_SERVICE_ACCOUNT_EMAIL/);
assert.match(datReadiness, /DAT_USER_EMAIL/);
assert.match(datReadiness, /DAT_API_BASE_URL/);
assert.match(datReadiness, /dat_endpoint_mapping_pending/);
assert.match(datReadiness, /external_request_performed: false/);
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

console.log("load-board-intake-api-contract: normalized opportunity schema, company-aware access, scoring, safe search, planning, AI context, official Ship.Cars sync, DAT certification-ready gates, and SEO/GEO distribution verified");
await import("./load-board-email-bridge-contract.test.mjs");
await import("./load-board-marketplace-posting-contract.test.mjs");
