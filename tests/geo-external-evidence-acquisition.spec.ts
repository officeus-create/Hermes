import { expect, test } from "@playwright/test";
import {
  buildGeoExternalEvidenceAcquisitionQueue,
  geoExternalEvidenceRequests,
  validateGeoExternalEvidencePayload,
} from "../src/data/geo-external-evidence-acquisition";

test("GEO external evidence queue stays bounded to real platforms and owners", () => {
  const queue = buildGeoExternalEvidenceAcquisitionQueue();
  expect(queue.length).toBe(7);
  expect(queue.every((item) => item.status === "external_action_required")).toBe(true);
  expect(queue.some((item) => item.canonicalOwner === "/services/seo-for-logistics-companies/")).toBe(true);
  expect(queue.some((item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/")).toBe(true);
  expect(queue.some((item) => item.canonicalOwner === "/careers/car-hauling-dispatcher/")).toBe(true);
});

test("GEO evidence rejects account identifiers, PII, raw AI conversations and revenue amounts", () => {
  const request = geoExternalEvidenceRequests.find((item) => item.id === "manual-ai-review-observation");
  expect(request).toBeTruthy();
  expect(request?.forbiddenFields).toEqual(expect.arrayContaining([
    "account_id",
    "property_id",
    "email",
    "phone",
    "token",
    "raw_conversation",
    "revenue_amount",
    "raw_response",
    "transcript",
  ]));
});

test("GSC country and page scope cannot be faked by unrelated aggregates", () => {
  const request = geoExternalEvidenceRequests.find((item) => item.id === "gsc-us-logistics-seo-owner");
  expect(request).toBeTruthy();
  if (!request) return;

  const result = validateGeoExternalEvidencePayload(request, {
    start_date: "2026-08-01",
    end_date: "2026-08-07",
    clicks: 1,
    impressions: 20,
    ctr: 0.05,
    average_position: 18,
    country: "United States",
    page: "/services/seo/",
    date_range: "exact_supplied_window",
    evidence_class: "platform_verified",
  });

  expect(result.ready).toBe(false);
  expect(result.scopeMismatches).toContain("page:/services/seo/!=/services/seo-for-logistics-companies/");
});
