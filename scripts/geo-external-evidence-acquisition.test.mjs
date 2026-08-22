import assert from "node:assert/strict";
import {
  buildGeoExternalEvidenceAcquisitionQueue,
  geoExternalEvidenceRequests,
  validateGeoExternalEvidencePayload,
} from "../src/data/geo-external-evidence-acquisition.ts";

assert.equal(geoExternalEvidenceRequests.length, 7);
assert.equal(new Set(geoExternalEvidenceRequests.map((item) => item.id)).size, 7);
assert.ok(geoExternalEvidenceRequests.every((item) => item.forbiddenFields.includes("email")));
assert.ok(geoExternalEvidenceRequests.every((item) => item.forbiddenFields.includes("account_id")));

const usSeo = geoExternalEvidenceRequests.find((item) => item.id === "gsc-us-logistics-seo-owner");
assert.ok(usSeo);
const validUs = validateGeoExternalEvidencePayload(usSeo, {
  start_date: "2026-08-01",
  end_date: "2026-08-18",
  clicks: 2,
  impressions: 200,
  ctr: 1,
  average_position: 22.4,
  country: "United States",
  page: "/services/seo-for-logistics-companies/",
  date_range: "exact_supplied_window",
  evidence_class: "platform_verified",
});
assert.equal(validUs.ready, true);

const wrongCountry = validateGeoExternalEvidencePayload(usSeo, {
  start_date: "2026-08-01",
  end_date: "2026-08-18",
  clicks: 2,
  impressions: 200,
  ctr: 1,
  average_position: 22.4,
  country: "Worldwide",
  page: "/services/seo-for-logistics-companies/",
  date_range: "exact_supplied_window",
  evidence_class: "platform_verified",
});
assert.equal(wrongCountry.ready, false);
assert.ok(wrongCountry.scopeMismatches.some((item) => item.startsWith("country:")));

const piiLeak = validateGeoExternalEvidencePayload(usSeo, {
  start_date: "2026-08-01",
  end_date: "2026-08-18",
  clicks: 2,
  impressions: 200,
  ctr: 1,
  average_position: 22.4,
  country: "United States",
  page: "/services/seo-for-logistics-companies/",
  date_range: "exact_supplied_window",
  evidence_class: "platform_verified",
  email: "private@example.com",
});
assert.equal(piiLeak.ready, false);
assert.deepEqual(piiLeak.forbidden, ["email"]);

const ga4 = geoExternalEvidenceRequests.find((item) => item.id === "ga4-carrier-delivery-exact-once");
assert.ok(ga4);
const validGa4 = validateGeoExternalEvidencePayload(ga4, {
  event_name: "carrier_delivery_confirmed",
  observed_at: "2026-08-19T10:00:00Z",
  observed_count: 1,
  page_path: "/logistics/start-car-hauling-dispatch/",
  page_group: "carrier_intake",
  service_group: "car_hauling_dispatch",
  evidence_reference: "ga4:real-receipt-opaque",
  event: "carrier_delivery_confirmed",
  property: "existing_production_property",
  evidence_class: "platform_verified",
});
assert.equal(validGa4.ready, true);

const replacementProperty = validateGeoExternalEvidencePayload(ga4, {
  event_name: "carrier_delivery_confirmed",
  observed_at: "2026-08-19T10:00:00Z",
  observed_count: 1,
  page_path: "/logistics/start-car-hauling-dispatch/",
  page_group: "carrier_intake",
  service_group: "car_hauling_dispatch",
  evidence_reference: "ga4:test-property",
  event: "carrier_delivery_confirmed",
  property: "new_checklist_property",
  evidence_class: "platform_verified",
});
assert.equal(replacementProperty.ready, false);
assert.ok(replacementProperty.scopeMismatches.some((item) => item.startsWith("property:")));

const funnel = geoExternalEvidenceRequests.find((item) => item.id === "private-owner-funnel-aggregate");
assert.ok(funnel);
const validFunnel = validateGeoExternalEvidencePayload(funnel, {
  canonical_owner: "/services/seo/",
  window_days: 28,
  delivered: 10,
  reviewed: 9,
  qualified: 4,
  opportunity: 2,
  won: 1,
  revenue_reconciled_win: 1,
  evidence_reference: "private-ops:aggregate-opaque",
  aggregation: "canonical_owner_x_exact_window",
  evidence_class: "private_operations_verified",
});
assert.equal(validFunnel.ready, true);
const amountLeak = validateGeoExternalEvidencePayload(funnel, {
  canonical_owner: "/services/seo/",
  window_days: 28,
  delivered: 10,
  reviewed: 9,
  qualified: 4,
  opportunity: 2,
  won: 1,
  revenue_reconciled_win: 1,
  evidence_reference: "private-ops:aggregate-opaque",
  aggregation: "canonical_owner_x_exact_window",
  evidence_class: "private_operations_verified",
  revenue_amount: 5000,
});
assert.equal(amountLeak.ready, false);
assert.ok(amountLeak.forbidden.includes("revenue_amount"));

const aiReview = geoExternalEvidenceRequests.find((item) => item.id === "manual-ai-review-observation");
assert.ok(aiReview);
const rawAnswerLeak = validateGeoExternalEvidencePayload(aiReview, {
  prompt_id: "LOG-01",
  provider: "chatgpt",
  observed_at: "2026-08-19T10:00:00Z",
  reviewer: "reviewer-01",
  brand_mentioned: true,
  linked_citation: true,
  cited_path: "/logistics/car-hauling-dispatch/",
  recommendation: "source_only",
  entity_accuracy: "accurate",
  description_accuracy: "accurate",
  factual_error: false,
  evidence_reference: "manual-ai-review:opaque",
  registry: "canonical_48_prompt_registry",
  evidence_class: "platform_verified",
  raw_response: "full provider answer must not be stored",
});
assert.equal(rawAnswerLeak.ready, false);
assert.ok(rawAnswerLeak.forbidden.includes("raw_response"));

const queue = buildGeoExternalEvidenceAcquisitionQueue();
assert.equal(queue.length, geoExternalEvidenceRequests.length);
assert.ok(queue.every((item) => item.status === "external_action_required"));
assert.ok(queue.some((item) => item.type === "gsc_us_owner_export"));
assert.ok(queue.some((item) => item.type === "ga4_exact_once_receipt"));
assert.ok(queue.some((item) => item.type === "private_funnel_aggregate"));
assert.ok(queue.some((item) => item.type === "manual_ai_review"));

console.log("GEO exact external evidence acquisition contract passed");
