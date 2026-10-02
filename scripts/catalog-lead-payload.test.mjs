import assert from "node:assert/strict";
import { buildCatalogLeadContext } from "../src/lib/catalog-lead-payload.mjs";

const params = new URLSearchParams({
  utm_source: "threads",
  utm_medium: "social",
  utm_campaign: "catalog_test",
  utm_content: "chayka",
  utm_term: "phone repair",
  gclid: "gclid-1",
  gbraid: "gbraid-1",
  wbraid: "wbraid-1",
});
const payload = buildCatalogLeadContext({
  businessId: "catalog-ua-chayka-store",
  profile: "https://hermeslogisticsus.com/businesses/ukraine/chaiky/chayka-store/",
  sourceRef: "CLIENT-SUPPLIED-CHAYKA-STORE-20260924",
  requestType: "catalog-business-request",
  searchParams: params,
  referrer: "https://www.google.com/search?q=chayka+store",
});
assert.equal(payload.catalog_business_id, "catalog-ua-chayka-store");
assert.match(payload.catalog_profile, /chayka-store/);
assert.equal(payload.catalog_source_ref, "CLIENT-SUPPLIED-CHAYKA-STORE-20260924");
assert.deepEqual(payload.attribution, {
  utm_source: "threads",
  utm_medium: "social",
  utm_campaign: "catalog_test",
  utm_content: "chayka",
  utm_term: "phone repair",
  gclid: "gclid-1",
  gbraid: "gbraid-1",
  wbraid: "wbraid-1",
  referrer: "https://www.google.com/search?q=chayka+store",
});
const fallback = buildCatalogLeadContext({requestType:"claim",searchParams:new URLSearchParams(),referrer:""});
assert.equal(fallback.attribution.utm_source,"hermes_catalog");
assert.equal(fallback.attribution.utm_medium,"internal");
assert.equal(fallback.attribution.utm_campaign,"claim");
assert.equal(fallback.attribution.referrer,"");
console.log("catalog lead payload helper contract passed");
