import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aggregateHomeServiceLeads,
  normalizeHomeServiceLead,
  normalizeHomeServiceProfile,
} from "../functions/api/_lib/home-service-crm.mjs";

const lead = normalizeHomeServiceLead({
  source: "Google Search",
  searchQuery: "junk removal roseville ca",
  customerName: "Synthetic Contract Fixture",
  city: "Roseville",
  jobType: "Garage cleanout",
  leadCostCents: 2500,
  quoteCents: 42000,
  status: "completed",
  finalAmountCents: 45000,
  disposalCostCents: 9000,
  durationMinutes: 120,
  paymentMethod: "card",
  reviewReceivedAt: "2026-10-05T20:00:00.000Z",
});
assert.equal(lead.status, "completed");
assert.equal(lead.finalAmountCents, 45000);
assert.equal(lead.disposalCostCents, 9000);

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
    final_amount_cents: 45000,
    disposal_cost_cents: 9000,
    review_received_at: "2026-10-05T20:00:00.000Z",
  },
  {
    status: "lost",
    city: "Auburn",
    source: "Thumbtack",
    job_type: "Furniture removal",
    search_query: "",
    lead_cost_cents: 3000,
    final_amount_cents: 0,
    disposal_cost_cents: 0,
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

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const companyTypes = read("functions/api/_lib/hermes-company-profiles.mjs");
const companyApi = read("functions/api/hermes-connect/company.ts");
const accountApi = read("functions/api/hermes-connect/account.ts");
const catalogApi = read("functions/api/catalog/companies.ts");
const catalogRuntime = read("public/catalog-connect-live.v2.js");
const sitemap = read("functions/sitemap-connect-catalog.xml.ts");
const workspace = read("src/pages/services/hermes-connect/home-services/workspace/index.astro");
const publicProfile = read("functions/businesses/connect/company/[slug].ts");
const clientConfig = read("src/data/catalog-client-mzm-junk-removal.ts");

assert.match(companyTypes, /"home_service"/);
assert.match(companyApi, /companyType === "home_service" \? 0 : 1/);
assert.match(companyApi, /home-services\/workspace/);
assert.match(accountApi, /key: "home_service"/);
assert.match(accountApi, /home-services\/workspace/);
assert.match(catalogApi, /home_service_crm/);
assert.match(catalogApi, /businesses\/connect\/company/);
assert.match(catalogRuntime, /companyType === 'home_service'/);
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
]) {
  assert.match(workspace, new RegExp(`name=["']${required}["']`), `workspace missing ${required}`);
}
assert.match(workspace, /robots="noindex,nofollow"/);
assert.match(publicProfile, /"@type": "LocalBusiness"/);
assert.match(publicProfile, /private CRM records are not published here/);
assert.match(clientConfig, /uniqueKeywords: 8155/);
assert.match(clientConfig, /noSyntheticBusinessOutcomes: true/);

console.log("home-service-crm-contract: ok");
