import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aggregateHomeServiceLeads,
  normalizeHomeServiceLead,
  safeHomeServiceLead,
  normalizeHomeServiceProfile,
} from "../functions/api/_lib/home-service-crm.mjs";

const lead = normalizeHomeServiceLead({
  source: "Google Search",
  searchQuery: "junk removal roseville ca",
  customerName: "Synthetic Contract Fixture",
  city: "Roseville",
  jobType: "Garage cleanout",
  leadCostCents: 2500,
  leadCostSourceRef: "ads-export:synthetic-1",
  quoteCents: 42000,
  quoteSourceRef: "quote:synthetic-1",
  status: "completed",
  finalAmountCents: 45000,
  finalAmountSourceRef: "receipt:synthetic-1",
  disposalCostCents: 9000,
  disposalCostSourceRef: "landfill-receipt:synthetic-1",
  durationMinutes: 120,
  paymentMethod: "card",
  reviewReceivedAt: "2026-10-05T20:00:00.000Z",
});
assert.equal(lead.status, "completed");
assert.equal(lead.finalAmountCents, 45000);
assert.equal(lead.finalAmountKnown, true);
assert.equal(lead.finalAmountSourceRef, "receipt:synthetic-1");
assert.equal(lead.disposalCostCents, 9000);

const missingMoney = normalizeHomeServiceLead({ customerName: "Missing Money" });
assert.equal(missingMoney.leadCostKnown, false);
assert.equal(missingMoney.finalAmountKnown, false);

const observedZero = normalizeHomeServiceLead({
  customerName: "Observed Zero",
  finalAmountCents: 0,
  finalAmountSourceRef: "receipt:void-or-zero-001",
});
assert.equal(observedZero.finalAmountKnown, true);
assert.equal(observedZero.finalAmountCents, 0);
assert.equal(observedZero.finalAmountSourceRef, "receipt:void-or-zero-001");

const profile = normalizeHomeServiceProfile({
  serviceSubtype: "junk_removal",
  services: ["Junk removal", "Furniture removal", "Junk removal"],
  serviceAreas: ["Roseville", "Sacramento"],
  publicSummary: "Local junk removal serving Roseville and Greater Sacramento.",
  semanticCoreRef: "client-provided:MZM_Junk_Removal_Semantic_Core.xlsx",
});
assert.equal(profile.serviceSubtype, "junk_removal");
assert.deepEqual(profile.services, ["Junk removal", "Furniture removal"]);
assert.deepEqual(profile.serviceAreas, ["Roseville", "Sacramento"]);

const metrics = aggregateHomeServiceLeads([
  {
    status: "completed",
    city: "Roseville",
    source: "Google Search",
    job_type: "Garage cleanout",
    search_query: "junk removal roseville ca",
    lead_cost_cents: 2500,
    lead_cost_known: 1,
    lead_cost_source_ref: "ads-export:synthetic-1",
    quote_cents: 42000,
    quote_known: 1,
    quote_source_ref: "quote:synthetic-1",
    final_amount_cents: 45000,
    final_amount_known: 1,
    final_amount_source_ref: "receipt:synthetic-1",
    disposal_cost_cents: 9000,
    disposal_cost_known: 1,
    disposal_cost_source_ref: "landfill-receipt:synthetic-1",
    review_received_at: "2026-10-05T20:00:00.000Z",
  },
  {
    status: "lost",
    city: "Auburn",
    source: "Thumbtack",
    job_type: "Furniture removal",
    search_query: "",
    lead_cost_cents: 3000,
    lead_cost_known: 1,
    lead_cost_source_ref: "provider-invoice:synthetic-2",
    quote_cents: 0,
    quote_known: 0,
    quote_source_ref: null,
    final_amount_cents: 0,
    final_amount_known: 0,
    final_amount_source_ref: null,
    disposal_cost_cents: 0,
    disposal_cost_known: 0,
    disposal_cost_source_ref: null,
    review_received_at: null,
  },
]);
assert.equal(metrics.totalLeads, 2);
assert.equal(metrics.booked, 1);
assert.equal(metrics.completed, 1);
assert.equal(metrics.revenueCents, 45000);
assert.equal(metrics.leadCostCents, 5500);
assert.equal(metrics.disposalCostCents, 9000);
assert.equal(metrics.grossAfterTrackedCostsCents, 30500);
assert.equal(metrics.averageTicketCents, 45000);
assert.equal(metrics.reviewRate, 1);
assert.equal(metrics.bookedRate, 0.5);
assert.equal(metrics.byCity.find((row) => row.key === "Roseville")?.revenueCents, 45000);
assert.equal(metrics.moneyEvidence.revenue.verifiedCount, 1);
assert.equal(metrics.moneyEvidence.revenue.requiredCount, 1);
assert.equal(metrics.moneyEvidence.leadCost.verifiedCount, 2);
assert.equal(metrics.moneyEvidence.grossComplete, true);

const partialEvidence = aggregateHomeServiceLeads([{
  status: "completed",
  city: "Roseville",
  source: "Manual",
  job_type: "Cleanout",
  search_query: "",
  lead_cost_cents: 1000,
  lead_cost_known: 1,
  lead_cost_source_ref: "provider:lead-1",
  quote_cents: 20000,
  quote_known: 1,
  quote_source_ref: "quote:1",
  final_amount_cents: 20000,
  final_amount_known: 1,
  final_amount_source_ref: null,
  disposal_cost_cents: 5000,
  disposal_cost_known: 1,
  disposal_cost_source_ref: "receipt:dump-1",
  review_received_at: null,
}]);
assert.equal(partialEvidence.revenueCents, null);
assert.equal(partialEvidence.grossAfterTrackedCostsCents, null);
assert.equal(partialEvidence.moneyEvidence.revenue.knownCount, 1);
assert.equal(partialEvidence.moneyEvidence.revenue.verifiedCount, 0);
assert.equal(partialEvidence.moneyEvidence.revenue.unverifiedCount, 1);

const verifiedZero = aggregateHomeServiceLeads([{
  status: "completed",
  city: "Roseville",
  source: "Manual",
  job_type: "Warranty removal",
  search_query: "",
  lead_cost_cents: 0,
  lead_cost_known: 1,
  lead_cost_source_ref: "provider:zero-cost",
  quote_cents: 0,
  quote_known: 1,
  quote_source_ref: "quote:zero",
  final_amount_cents: 0,
  final_amount_known: 1,
  final_amount_source_ref: "receipt:zero",
  disposal_cost_cents: 0,
  disposal_cost_known: 1,
  disposal_cost_source_ref: "receipt:zero-disposal",
  review_received_at: null,
}]);
assert.equal(verifiedZero.revenueCents, 0);
assert.equal(verifiedZero.grossAfterTrackedCostsCents, 0);
assert.equal(verifiedZero.averageTicketCents, 0);

const noData = aggregateHomeServiceLeads([]);
assert.equal(noData.revenueCents, null);
assert.equal(noData.grossAfterTrackedCostsCents, null);
assert.equal(noData.averageTicketCents, null);
assert.equal(noData.bookedRate, null, "No leads must not be reported as 0% booked");
assert.equal(noData.reviewRate, null, "No completed jobs must not be reported as 0% reviewed");

const realZeroBooked = aggregateHomeServiceLeads([{ status: "new", city: "Roseville", source: "Direct" }]);
assert.equal(realZeroBooked.bookedRate, 0, "One unbooked lead is a real 0% booked rate");
assert.equal(realZeroBooked.reviewRate, null, "No completed jobs still means UNKNOWN review rate");


const safeUnknown = safeHomeServiceLead({
  id: "lead-unknown",
  source: "direct",
  customer_name: "Synthetic",
  photo_refs_json: "[]",
  lead_cost_cents: 0,
  lead_cost_known: 0,
  quote_cents: 0,
  quote_known: 0,
  final_amount_cents: 0,
  final_amount_known: 0,
  disposal_cost_cents: 0,
  disposal_cost_known: 0,
});
assert.equal(safeUnknown.finalAmountCents, null);
assert.equal(safeUnknown.leadCostCents, null);

const safeZero = safeHomeServiceLead({
  id: "lead-zero",
  source: "direct",
  customer_name: "Synthetic",
  photo_refs_json: "[]",
  lead_cost_cents: 0,
  lead_cost_known: 1,
  lead_cost_source_ref: "provider:0",
  quote_cents: 0,
  quote_known: 1,
  quote_source_ref: "quote:0",
  final_amount_cents: 0,
  final_amount_known: 1,
  final_amount_source_ref: "receipt:0",
  disposal_cost_cents: 0,
  disposal_cost_known: 1,
  disposal_cost_source_ref: "dump:0",
});
assert.equal(safeZero.finalAmountCents, 0);
assert.equal(safeZero.finalAmountVerified, true);

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const companyTypes = read("functions/api/_lib/hermes-company-profiles.mjs");
const companyApi = read("functions/api/hermes-connect/company.ts");
// The backend must enforce the cross-vertical company safety boundary, not only the onboarding UI.
assert.match(companyApi, /existing_company_type_locked/);
assert.match(companyApi, /companyType === "home_service" \? body\.catalogOptIn === true : body\.catalogOptIn !== false/);
assert.match(companyApi, /SELECT id, slug, company_type, created_at FROM hermes_company_profiles/);
assert.match(companyApi, /WHERE hermes_company_profiles\.company_type = excluded\.company_type/);
assert.match(companyApi, /row\?\.company_type !== companyType/);
assert.match(companyApi, /managed_company_claim_required/);
assert.match(companyApi, /management_mode='hermes_managed'/);
assert.match(companyApi, /next_url: "\/contacts\//);
const accountApi = read("functions/api/hermes-connect/account.ts");
const catalogApi = read("functions/api/catalog/companies.ts");
const catalogRuntime = read("public/catalog-connect-live.v2.js");
const sitemap = read("functions/sitemap-connect-catalog.xml.ts");
const workspace = read("src/pages/services/hermes-connect/home-services/workspace/index.astro");
const crmHelper = read("functions/api/_lib/home-service-crm.mjs");
const crmApi = read("functions/api/hermes-connect/home-services/crm.ts");
const publicProfile = read("functions/businesses/connect/company/[slug].ts");
const clientConfig = read("src/data/catalog-client-mzm-junk-removal.ts");
const homeServicesAccess = read("src/pages/services/hermes-connect/home-services/access/index.astro");
const sharedAccess = read("src/pages/services/hermes-connect/access/index.astro");
const managedEndpoint = read("functions/api/internal/mzm-managed-client.ts");
const managedWorkflow = read(".github/workflows/mzm-managed-client.yml");

assert.match(companyTypes, /"home_service"/);
assert.match(companyApi, /companyType === "home_service" \? 0 : 1/);
assert.match(companyApi, /home-services\/workspace/);
assert.match(accountApi, /key: "home_service"/);
assert.match(accountApi, /home-services\/workspace/);
assert.match(catalogApi, /home_service_crm/);
assert.match(catalogApi, /businesses\/connect\/company/);
assert.match(catalogRuntime, /companyType === 'home_service'/);
assert.match(catalogRuntime, /const companyHref =/);
assert.match(catalogRuntime, /companyType === 'home_service' && repairGrid && companyHref/);
assert.match(sitemap, /homeServiceUrls/);
assert.match(sitemap, /businesses\/connect\/company/);

for (const required of [
  "searchQuery",
  "leadCost",
  "quote",
  "assignedDriver",
  "finalAmount",
  "disposalCost",
  "lossReason",
  "followUpAt",
  "reviewRequestedAt",
  "reviewReceivedAt",
  "leadCostSourceRef",
  "quoteSourceRef",
  "finalAmountSourceRef",
  "disposalCostSourceRef",
]) {
  assert.match(workspace, new RegExp(`name=["']${required}["']`), `workspace missing ${required}`);
}
assert.match(workspace, /robots="noindex,nofollow"/);
assert.match(workspace, /Missing amount is never converted to \$0/);
assert.match(workspace, /UNKNOWN/);
assert.match(crmHelper, /lead_cost_known/);
assert.match(crmHelper, /lead_cost_source_ref/);
assert.match(crmHelper, /Historical zero stays UNKNOWN/);
assert.match(crmApi, /same_origin_required/);
assert.match(publicProfile, /"@type": "LocalBusiness"/);
assert.match(publicProfile, /home-services\/access\/\?mode=login/);
assert.match(publicProfile, /private CRM records are not published here/);
assert.match(clientConfig, /uniqueKeywords: 8155/);
assert.match(clientConfig, /observedAt: "2026-10-10"/);
assert.match(clientConfig, /evidenceClass: "FIRST_PARTY_PUBLIC_SOURCE"/);
assert.match(clientConfig, /14309271527164244470/);
assert.match(clientConfig, /identity_match_only_not_management_authorization/);
assert.match(clientConfig, /https:\/\/mzm-junk-removal\.com\/eviction-cleanout/);
assert.match(clientConfig, /https:\/\/mzm-junk-removal\.com\/office-cleanout/);
assert.match(clientConfig, /https:\/\/mzm-junk-removal\.com\/storage-unit-cleanout/);
assert.doesNotMatch(clientConfig, /ownerReviewCandidates/);
assert.doesNotMatch(clientConfig, /serviceAreas: \["North Highlands"\]/);
assert.match(clientConfig, /"North Highlands"/);
assert.match(clientConfig, /"Mattress removal"/);
assert.match(clientConfig, /"E-waste removal"/);
assert.match(clientConfig, /"Hot tub removal"/);
assert.match(clientConfig, /"Shed removal"/);
assert.match(clientConfig, /do not become canonical CRM outcomes/);
assert.ok(clientConfig.includes('primaryCommercialOwner: "https://mzm-junk-removal.com/"'));
assert.match(clientConfig, /hermesCatalogRole: "secondary_entity_discovery_and_attribution"/);
assert.ok(clientConfig.includes("must not clone the client\'s city/service landing-page family"));
assert.match(clientConfig, /client_site_evergreen_service_city_owners/);
assert.doesNotMatch(clientConfig, /reviewCount\\s*:/);
assert.doesNotMatch(clientConfig, /jobsCompleted\\s*:/);
assert.match(homeServicesAccess, /robots="noindex,nofollow"/);
assert.match(homeServicesAccess, /\/api\/auth\/register/);
assert.match(homeServicesAccess, /\/api\/auth\/login/);
assert.match(homeServicesAccess, /\/api\/hermes-connect\/company/);
assert.match(homeServicesAccess, /companyType: "home_service"/);
assert.match(homeServicesAccess, /catalogOptIn: optIn/);
assert.match(homeServicesAccess, /company_readback_not_confirmed/);
assert.match(homeServicesAccess, /companyType !== "home_service"/);
assert.match(homeServicesAccess, /name="catalogOptIn" type="checkbox"/);
assert.doesNotMatch(homeServicesAccess, /name="catalogOptIn" type="checkbox" checked/);
assert.match(homeServicesAccess, /\/services\/hermes-connect\/home-services\/workspace\//);
assert.match(sharedAccess, /href="\/services\/hermes-connect\/home-services\/access\//);
assert.match(workspace, /\["self_submitted","verified_public"\]\.includes/);
assert.match(workspace, /dashboard\?\.profile\?\.id/);
assert.match(workspace, /data-catalog-private/);
assert.match(clientConfig, /"Eviction cleanouts"/);
assert.match(clientConfig, /"Office cleanouts"/);
assert.match(clientConfig, /"Storage unit cleanouts"/);
assert.match(clientConfig, /noSyntheticBusinessOutcomes: true/);
assert.match(companyTypes, /management_mode: "TEXT NOT NULL DEFAULT 'owner_managed'"/);
assert.match(companyTypes, /catalog_publication_basis: "TEXT NOT NULL DEFAULT 'owner_opt_in'"/);
assert.match(crmHelper, /hermes_internal_owner_required/);
assert.match(crmHelper, /management_mode='hermes_managed'/);
assert.equal((crmApi.match(/const ownerId = String\(ctx\.dataOwnerId \|\| ""\);/g) || []).length, 2,
  "Both GET and POST must resolve the canonical dataOwnerId");
assert.equal((crmApi.match(/home_service_data_owner_missing/g) || []).length, 2,
  "Both reads and writes must fail closed when the CRM data owner is absent");
assert.doesNotMatch(crmApi, /const ownerId = String\(ctx\.specialist\.id\)/);
assert.match(workspace, /metrics\[key\] == null \? "UNKNOWN" : percent\(metrics\[key\]\)/);

assert.match(workspace, /searchParams\.get\("managed"\)/);
assert.match(workspace, /managedApiUrl/);
assert.match(publicProfile, /Hermes-managed client profile · public facts verified/);
assert.match(catalogApi, /catalog_publication_basis/);
assert.match(managedEndpoint, /mzmJunkRemovalClient/);
assert.match(managedEndpoint, /ensureHermesCompanyProfilesSchema/);
assert.match(managedEndpoint, /await ensureHermesCompanyProfilesSchema\(env\.DB\)/);
assert.match(managedEndpoint, /hermes-managed:mzm-junk-removal/);
assert.match(managedEndpoint, /owner_consent_pending/);
assert.match(managedEndpoint, /catalog_publication_eligible: false/);
assert.match(managedEndpoint, /public_profile_path: null/);
assert.match(managedEndpoint, /"managed_private"/);
assert.match(managedEndpoint, /Number\(company\?\.catalog_opt_in \|\| 0\) === 0/);
assert.match(managedEndpoint, /catalog_owner_consent_claimed: false/);
assert.match(managedEndpoint, /owner_authentication_claimed: false/);
assert.match(managedEndpoint, /internal_operator_capability: "HERMES_INTERNAL_OWNER"/);
assert.match(managedEndpoint, /internal_operator_ui_readback: "REQUIRED_SEPARATELY"/);
assert.match(managedEndpoint, /expectedServicesJson = JSON\.stringify\(mzmJunkRemovalClient\.services\)/);
assert.match(managedEndpoint, /expectedServiceAreasJson = JSON\.stringify\(mzmJunkRemovalClient\.serviceAreas\)/);
assert.match(managedEndpoint, /String\(profile\?\.services_json \|\| ""\) === expectedServicesJson/);
assert.match(managedEndpoint, /String\(profile\?\.service_areas_json \|\| ""\) === expectedServiceAreasJson/);
assert.match(managedEndpoint, /managed_fact_snapshot_verified: true/);
assert.match(managedWorkflow, /managed_fact_snapshot_verified/);
assert.match(managedWorkflow, /managed_fact_snapshot_failed/);
assert.match(managedWorkflow, /internal_owner_receipt_boundary_failed/);
assert.doesNotMatch(managedEndpoint, /INSERT INTO specialists/);
assert.doesNotMatch(managedEndpoint, /INSERT INTO sessions/);
assert.match(managedWorkflow, /github\.event\.issue\.number == 1799/);
assert.match(managedWorkflow, /github\.event\.comment\.body == '\/provision-mzm-managed'/);
assert.match(managedWorkflow, /id-token: write/);
assert.doesNotMatch(managedWorkflow, /CLOUDFLARE_D1_API_TOKEN/);
assert.doesNotMatch(managedWorkflow, /\/api\/auth\/login/);
assert.match(managedWorkflow, /owner_consent_pending/);
assert.match(managedWorkflow, /catalog_fail_closed_failed/);
assert.match(managedWorkflow, /PROFILE_HTTP.*404/s);
assert.match(managedWorkflow, /! grep -Fq.*sitemap/s);
assert.match(managedWorkflow, /! jq -e.*mzm-junk-removal/s);

console.log("home-service-crm-contract: ok");
