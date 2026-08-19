import assert from "node:assert/strict";
import {
  buildGeoMultilingualConsistencyAudit,
  importGeoMultilingualSurfaces,
} from "../src/data/geo-multilingual-consistency.ts";

const reviewedGroup = [
  {
    surface_id: "seo-en",
    translation_group: "seo-owner-group",
    language_tag: "en",
    canonical_owner: "/services/seo/",
    prompt_ids: ["MKT-01"],
    hreflang: [
      { language_tag: "en", canonical_owner: "/services/seo/" },
      { language_tag: "uk", canonical_owner: "/ua/services/seo/" },
    ],
    entity_ids: ["hermes_ecosystem", "seo_service"],
    claims: [
      { claim_key: "seo-scope", source_keys: ["source-hermes-seo"] },
      { claim_key: "no-guarantee", source_keys: ["source-hermes-seo"] },
    ],
  },
  {
    surface_id: "seo-uk",
    translation_group: "seo-owner-group",
    language_tag: "uk",
    canonical_owner: "/ua/services/seo/",
    prompt_ids: [],
    hreflang: [
      { language_tag: "en", canonical_owner: "/services/seo/" },
      { language_tag: "uk", canonical_owner: "/ua/services/seo/" },
    ],
    entity_ids: ["hermes_ecosystem", "seo_service"],
    claims: [
      { claim_key: "seo-scope", source_keys: ["source-hermes-seo"] },
      { claim_key: "no-guarantee", source_keys: ["source-hermes-seo"] },
    ],
  },
];

const ready = buildGeoMultilingualConsistencyAudit(reviewedGroup);
assert.deepEqual(ready.readyGroups, ["seo-owner-group"]);
assert.deepEqual(ready.blockedGroups, []);
assert.deepEqual(ready.localeOwnerConflicts, []);
assert.equal(ready.groupAudits[0].entityIdsConsistent, true);
assert.equal(ready.groupAudits[0].claimSourceParity, true);
assert.equal(ready.groupAudits[0].hreflangConsistent, true);
assert.equal(ready.surfaceAudits.find((row) => row.surfaceId === "seo-en").issues.length, 0);

const promptMismatch = buildGeoMultilingualConsistencyAudit([
  {
    ...reviewedGroup[0],
    surface_id: "seo-prompt-mismatch",
    language_tag: "uk",
    canonical_owner: "/services/seo/",
    hreflang: [{ language_tag: "uk", canonical_owner: "/services/seo/" }],
  },
]);
assert.ok(promptMismatch.surfaceAudits[0].issues.includes("prompt_language_mismatch:MKT-01"));

const ownerMismatch = buildGeoMultilingualConsistencyAudit([
  {
    ...reviewedGroup[0],
    surface_id: "seo-owner-mismatch",
    canonical_owner: "/services/website-development/",
    hreflang: [{ language_tag: "en", canonical_owner: "/services/website-development/" }],
  },
]);
assert.ok(ownerMismatch.surfaceAudits[0].issues.includes("prompt_owner_mismatch:MKT-01"));

const selfHreflangMismatch = buildGeoMultilingualConsistencyAudit([
  {
    ...reviewedGroup[0],
    surface_id: "seo-self-hreflang-mismatch",
    hreflang: [{ language_tag: "en", canonical_owner: "/services/website-development/" }],
  },
]);
assert.ok(selfHreflangMismatch.surfaceAudits[0].issues.includes("self_hreflang_canonical_mismatch"));

const entityMismatch = structuredClone(reviewedGroup);
entityMismatch[1].entity_ids = ["hermes_ecosystem", "different_service_entity"];
const entityAudit = buildGeoMultilingualConsistencyAudit(entityMismatch);
assert.equal(entityAudit.groupAudits[0].entityIdsConsistent, false);
assert.equal(entityAudit.groupAudits[0].ready, false);

const claimSourceMismatch = structuredClone(reviewedGroup);
claimSourceMismatch[1].claims[0].source_keys = ["different-reviewed-source"];
const claimAudit = buildGeoMultilingualConsistencyAudit(claimSourceMismatch);
assert.equal(claimAudit.groupAudits[0].claimSourceParity, false);
assert.ok(claimAudit.groupAudits[0].issues.some((issue) => issue.includes("claim_source_parity_mismatch:seo-scope")));

const localeConflict = buildGeoMultilingualConsistencyAudit([
  reviewedGroup[0],
  {
    ...reviewedGroup[0],
    surface_id: "seo-en-competing-owner",
    canonical_owner: "/services/website-development/",
    prompt_ids: [],
    hreflang: [{ language_tag: "en", canonical_owner: "/services/website-development/" }],
  },
]);
assert.deepEqual(localeConflict.localeOwnerConflicts, ["seo-owner-group|en"]);

assert.throws(() => importGeoMultilingualSurfaces([{ ...reviewedGroup[0], raw_translation: "blocked" }]), /unsupported field: raw_translation/i);
assert.throws(() => importGeoMultilingualSurfaces([{ ...reviewedGroup[0], language_tag: "EN_us" }]), /language tag/i);
assert.throws(() => importGeoMultilingualSurfaces([{ ...reviewedGroup[0], prompt_ids: ["MKT-01", "MKT-01"] }]), /must be unique/i);

console.log("GEO multilingual consistency contract passed");
