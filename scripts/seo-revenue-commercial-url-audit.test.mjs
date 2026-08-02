import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const auditPath = join(root, "data/marketing/seo-revenue-commercial-url-audit-2026-08.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));

assert.equal(audit.reviewed_at, "2026-08-02");
assert.ok(Array.isArray(audit.allowed_statuses));
assert.ok(Array.isArray(audit.records));
assert.equal(audit.records.length, 14, "commercial audit must retain the 14 approved priority records");

const allowedStatuses = new Set(audit.allowed_statuses);
const seenRoutes = new Set();
const requiredFields = [
  "route",
  "page_group",
  "intent",
  "audience",
  "canonical_owner",
  "sitemap_owner",
  "primary_destination",
  "handoff",
  "event_family",
  "proof_state",
  "cannibalization_risk",
  "status",
  "external_blocker",
];

const htmlPathForRoute = (route) =>
  route === "/" ? join(dist, "index.html") : join(dist, route.slice(1), "index.html");

for (const record of audit.records) {
  for (const field of requiredFields) {
    assert.notEqual(record[field], undefined, `${record.route || "unknown route"}: missing ${field}`);
    if (typeof record[field] === "string") assert.ok(record[field].trim(), `${record.route}: empty ${field}`);
  }
  assert.ok(record.route.startsWith("/") && record.route.endsWith("/"), `${record.route}: route must be canonical slash form`);
  assert.ok(!seenRoutes.has(record.route), `${record.route}: duplicate audit route`);
  seenRoutes.add(record.route);
  assert.equal(record.canonical_owner, true, `${record.route}: audited priority URL must own its declared route`);
  assert.ok(allowedStatuses.has(record.status), `${record.route}: unsupported status ${record.status}`);
  assert.equal(record.status, "READY_TO_MEASURE", `${record.route}: current completion audit should be ready to measure`);

  const html = await readFile(htmlPathForRoute(record.route), "utf8");
  const canonical = `https://hermeslogisticsus.com${record.route}`;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `${record.route}: canonical mismatch`);
  assert.ok(html.includes(`href="${record.primary_destination}`), `${record.route}: expected CTA destination ${record.primary_destination}`);
}

const routeMap = new Map(audit.records.map((record) => [record.route, record]));
assert.match(routeMap.get("/logistics/car-hauling-dispatch/").event_family, /carrier_intake_start.*carrier_intake_preview_ready.*carrier_handoff_ready/);
assert.match(routeMap.get("/services/website-development/").event_family, /website_project_intake_start.*website_project_preview_ready.*website_handoff_ready/);
assert.match(routeMap.get("/services/seo/").event_family, /seo_intake_start.*seo_intake_preview_ready.*seo_handoff_ready/);
assert.equal(routeMap.get("/services/website-redesign/").primary_destination, "/paths/technology/");
assert.equal(routeMap.get("/services/local-seo/").primary_destination, "/paths/marketing/");
assert.equal(routeMap.get("/services/seo-for-logistics-companies/").primary_destination, "/paths/marketing/");
assert.equal(routeMap.get("/services/seo-for-independent-auto-dealers/").primary_destination, "/paths/marketing/");

const serialized = JSON.stringify(audit);
assert.doesNotMatch(serialized, /@[a-z0-9.-]+\.[a-z]{2,}/i, "audit data must not contain email addresses");
assert.doesNotMatch(serialized, /\b(?:MC|USDOT|DOT)\s*-?\s*\d{5,8}\b/i, "audit data must not contain carrier identifiers");
assert.doesNotMatch(serialized, /\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4}/, "audit data must not contain phone numbers");

console.log(`SEO revenue commercial URL audit passed: ${audit.records.length} current-main priority routes.`);
