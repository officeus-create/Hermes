import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { buildWebsiteAuditSnapshot } from "../workers/automation-engine/src/website-audit-source.mjs";
import { roleContractForJobType } from "../workers/automation-engine/src/role-contracts.mjs";

const contract=roleContractForJobType("audit.website.journey");
assert.equal(contract.runtime_config.scheduled,true);
assert.equal(contract.runtime_config.cadence_hours,6);
assert.deepEqual(contract.runtime_config.target_urls,[
  "https://hermeslogisticsus.com/",
  "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
  "https://hermeslogisticsus.com/services/hermes-connect/command-center/",
]);
assert.deepEqual(contract.runtime_config.status_only_urls,[
  "https://hermeslogisticsus.com/logistics/carrier-agreement/",
  "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/booking/",
  "https://hermeslogisticsus.com/sitemap.xml",
]);

for(const path of [
  "src/pages/index.astro",
  "src/pages/logistics/car-hauling-dispatch/index.astro",
  "src/pages/services/hermes-connect/command-center/index.astro",
  "src/pages/logistics/carrier-agreement/index.astro",
  "src/pages/services/hermes-connect/repair-shops/booking.astro",
  "public/sitemap.xml",
]) assert.equal(existsSync(path),true,`source-owned probe route missing: ${path}`);

const observedAt="2026-11-03T08:00:00.000Z";
const pages=[
  {url:"https://hermeslogisticsus.com/",status:200,final_url:"https://hermeslogisticsus.com/",canonical:"https://hermeslogisticsus.com/"},
  {url:"https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",status:200,final_url:"https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",canonical:"https://hermeslogisticsus.com/logistics/car-hauling-dispatch/"},
  {url:"https://hermeslogisticsus.com/services/hermes-connect/command-center/",status:200,final_url:"https://hermeslogisticsus.com/services/hermes-connect/command-center/",canonical:"https://hermeslogisticsus.com/services/hermes-connect/command-center/"},
  // These two routes are intentionally noindex in source; status-only means
  // missing canonical/indexability must not become a defect.
  {url:"https://hermeslogisticsus.com/logistics/carrier-agreement/",status:200,final_url:"https://hermeslogisticsus.com/logistics/carrier-agreement/",canonical:""},
  {url:"https://hermeslogisticsus.com/services/hermes-connect/repair-shops/booking/",status:200,final_url:"https://hermeslogisticsus.com/services/hermes-connect/repair-shops/booking/",canonical:""},
  {url:"https://hermeslogisticsus.com/sitemap.xml",status:200,final_url:"https://hermeslogisticsus.com/sitemap.xml",canonical:""},
];
const healthy=buildWebsiteAuditSnapshot({
  pages,
  canonicalUrls:contract.runtime_config.target_urls,
  statusOnlyUrls:contract.runtime_config.status_only_urls,
  observedAt,
});
assert.equal(healthy.coverage_complete,true);
assert.equal(healthy.source_authenticated,false);
assert.equal(healthy.source_trusted,true);
assert.deepEqual(healthy.findings,[]);

const broken=buildWebsiteAuditSnapshot({
  pages:pages.map((page)=>page.url.endsWith("/repair-shops/booking/")?{...page,status:503}:page.url.endsWith("/command-center/")?{...page,canonical:""}:page),
  canonicalUrls:contract.runtime_config.target_urls,
  statusOnlyUrls:contract.runtime_config.status_only_urls,
  observedAt,
});
assert.equal(broken.coverage_complete,true,"HTTP response is still complete evidence");
assert.ok(broken.findings.some((item)=>item.category==="HTTP_ERROR"&&item.finding_id.includes("repair-shops-booking")));
assert.ok(broken.findings.some((item)=>item.category==="MISSING_CANONICAL"&&item.finding_id.includes("command-center")));

const wrongPath=buildWebsiteAuditSnapshot({
  pages:pages.filter((page)=>!page.url.endsWith("/repair-shops/booking/")),
  canonicalUrls:contract.runtime_config.target_urls,
  statusOnlyUrls:contract.runtime_config.status_only_urls,
  observedAt,
});
assert.equal(wrongPath.coverage_complete,false);
assert.ok(wrongPath.findings.some((item)=>item.category==="PROBE_MISSING"&&item.status==="UNKNOWN"));

const unavailable=buildWebsiteAuditSnapshot({
  pages:pages.map((page)=>page.url.endsWith("/sitemap.xml")?{...page,status:599}:page),
  canonicalUrls:contract.runtime_config.target_urls,
  statusOnlyUrls:contract.runtime_config.status_only_urls,
  observedAt,
});
assert.equal(unavailable.coverage_complete,false);
assert.ok(unavailable.findings.some((item)=>item.category==="PROBE_UNAVAILABLE"&&item.status==="UNKNOWN"));
assert.equal(unavailable.findings.some((item)=>item.category==="HTTP_ERROR"&&item.finding_id.includes("sitemap-xml")),false);

console.log("HAE Website auditor trusted source adapter PASS");
