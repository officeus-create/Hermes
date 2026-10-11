import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const client = read("src/data/catalog-client-mzm-junk-removal.ts");
const catalog = read("functions/businesses/connect/company/[slug].ts");
const workspace = read("src/pages/services/hermes-connect/home-services/workspace/index.astro");
const crmApi = read("functions/api/hermes-connect/home-services/crm.ts");
const insight = read("src/data/insights.generated.json");
const sitemap = read("public/sitemap-insights.xml");

// 1) NEWS / INSIGHT
assert.ok(insight.includes("mzm-junk-removal-real-job-evidence-local-seo-2026"));
assert.ok(insight.includes('"label": "Visit MZM Junk Removal"'));
assert.ok(insight.includes("https://mzm-junk-removal.com/?utm_source=hermeslogisticsus.com"));
assert.ok(insight.includes('"href": "/businesses/connect/company/mzm-junk-removal/"'));
assert.ok(sitemap.includes("/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/"));

// 2) CATALOG mini-site / showroom
for (const marker of ["Hermes Catalog","Public job evidence","Recent work shown by MZM","What the business handles","Where the team operates","Official website","Read the MZM Insight","private CRM records"]) {
  assert.ok(catalog.includes(marker), "missing Catalog marker: " + marker);
}
assert.ok(client.includes('hermesCatalogRole: "secondary_entity_discovery_and_attribution"'));
assert.ok(client.includes("The client website owns MZM branded, city and commercial service intent"));

// 3) CRM operating model
for (const state of ["new","contacted","quoted","follow_up","booked","in_progress","completed","lost","cancelled"]) {
  assert.ok(client.includes('"' + state + '"'), "missing CRM state: " + state);
}
for (const field of ["source","searchQuery","customerName","customerPhone","addressLine1","postalCode","city","jobType","photoRefs","approximateVolume","leadCostCents","quoteCents","status","jobStartAt","assignedDriver","finalAmountCents","disposalCostCents","durationMinutes","paymentMethod","lossReason","followUpAt","reviewRequestedAt","reviewReceivedAt"]) {
  assert.ok(client.includes('"' + field + '"'), "missing CRM field: " + field);
}
for (const dimension of ["city","source","jobType","searchQuery"]) {
  assert.ok(client.includes('"' + dimension + '"'), "missing analytics dimension: " + dimension);
}
for (const uiField of ["customerName","customerPhone","source","searchQuery","photoRefs","leadCost","quote","assignedDriver","finalAmount","disposalCost","followUpAt","reviewRequestedAt","reviewReceivedAt"]) {
  assert.ok(workspace.includes('name="' + uiField + '"'), "missing CRM UI field: " + uiField);
}
assert.ok(workspace.includes("CLIENT PREVIEW · SAMPLE DATA"));
assert.ok(workspace.includes("They are not real MZM customers, leads, quotes, jobs or revenue"));
assert.ok(crmApi.includes("managed_client_read_only"));

// Client-owned website is evidence/reference only; no MZM-specific site bridge lives in Hermes.
assert.equal(existsSync(new URL("../functions/api/hermes-connect/home-services/mzm-intake.ts", import.meta.url)), false);
assert.equal(existsSync(new URL("../functions/api/hermes-connect/home-services/mzm-availability.ts", import.meta.url)), false);

console.log("MZM three-surface contract: PASS — Insight + Catalog mini-site + CRM; client website NO_TOUCH.");
