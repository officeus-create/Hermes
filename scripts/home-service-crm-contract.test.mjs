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
assert.match(publicProfile, /private CRM records are not published here/);
assert.match(clientConfig, /uniqueKeywords: 8155/);
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
assert.match(clientConfig, /noSyntheticBusinessOutcomes: true/);

console.log("home-service-crm-contract: ok");
