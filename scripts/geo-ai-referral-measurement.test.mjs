import assert from "node:assert/strict";
import {
  buildGeoAiReferralScorecard,
  validateGeoAiReferralAggregates,
} from "../src/data/geo-ai-referral-measurement.ts";
import {
  importGeoAiReferralBatch,
  importGeoAiReferralRow,
} from "../src/data/geo-ai-referral-import.ts";

const rows = [
  {
    windowDays: 7,
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    attributionState: "provider_identified",
    provider: "chatgpt",
    landingSessions: 20,
    ctaSessions: 8,
    intakeSessions: 4,
    evidenceClass: "platform_verified",
  },
  {
    windowDays: 7,
    canonicalOwner: "/services/seo/",
    attributionState: "provider_identified",
    provider: "perplexity",
    landingSessions: 10,
    ctaSessions: 3,
    intakeSessions: 1,
    evidenceClass: "owner_provided_handoff",
  },
  {
    windowDays: 7,
    canonicalOwner: "/paths/technology/",
    attributionState: "ai_referral_unresolved",
    provider: null,
    landingSessions: 5,
    ctaSessions: 1,
    intakeSessions: 0,
    evidenceClass: "unverified",
  },
  {
    windowDays: 28,
    canonicalOwner: "/paths/academy/",
    attributionState: "provider_identified",
    provider: "gemini",
    landingSessions: 40,
    ctaSessions: 12,
    intakeSessions: 5,
    evidenceClass: "platform_verified",
  },
];

assert.doesNotThrow(() => validateGeoAiReferralAggregates(rows));
const seven = buildGeoAiReferralScorecard(rows, 7);
assert.deepEqual(seven.totals, {
  landingSessions: 35,
  ctaSessions: 12,
  intakeSessions: 5,
  landingToCtaRate: 34.3,
  ctaToIntakeRate: 41.7,
  identifiedLandingSessions: 30,
  unresolvedLandingSessions: 5,
  providerIdentificationRate: 85.7,
});
assert.equal(seven.byProvider.find((item) => item.key === "chatgpt")?.landingSessions, 20);
assert.equal(seven.byProvider.find((item) => item.key === "unresolved_ai_referral")?.landingSessions, 5);
assert.equal(seven.byOwner.find((item) => item.key === "/services/seo/")?.intakeSessions, 1);
assert.ok(seven.evidenceClasses.includes("unverified"));

assert.throws(
  () => validateGeoAiReferralAggregates([{ ...rows[0], attributionState: "provider_identified", provider: null }]),
  /require a provider/,
);
assert.throws(
  () => validateGeoAiReferralAggregates([{ ...rows[2], attributionState: "ai_referral_unresolved", provider: "gemini" }]),
  /must not guess a provider/,
);
assert.throws(
  () => validateGeoAiReferralAggregates([{ ...rows[0], ctaSessions: 21 }]),
  /cannot exceed landingSessions/,
);
assert.throws(
  () => validateGeoAiReferralAggregates([{ ...rows[0], intakeSessions: 9 }]),
  /cannot exceed ctaSessions/,
);

const importRow = {
  window_days: 7,
  canonical_owner: "/logistics/car-hauling-dispatch/",
  attribution_state: "provider_identified",
  provider: "chatgpt",
  landing_sessions: 20,
  cta_sessions: 8,
  intake_sessions: 4,
  evidence_class: "platform_verified",
};
assert.equal(importGeoAiReferralRow(importRow).provider, "chatgpt");
assert.equal(importGeoAiReferralBatch([importRow]).length, 1);
assert.equal(
  importGeoAiReferralRow({ ...importRow, attribution_state: "ai_referral_unresolved", provider: null }).provider,
  null,
);
assert.throws(
  () => importGeoAiReferralRow({ ...importRow, raw_referrer: "https://chatgpt.com/c/private" }),
  /Unsupported GEO AI referral field/,
);
assert.throws(
  () => importGeoAiReferralRow({ ...importRow, user_id: "private-user" }),
  /Unsupported GEO AI referral field/,
);
assert.throws(
  () => importGeoAiReferralRow({ ...importRow, attribution_state: "ai_referral_unresolved", provider: "chatgpt" }),
  /must not guess a provider/,
);

const serialized = JSON.stringify({ scorecard: seven, imported: importGeoAiReferralBatch([importRow]) }).toLowerCase();
for (const prohibitedKey of ["userid", "user_id", "email", "phone", "raw_referrer", "full_url", "query", "token", "cookie", "accountid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedKey}\"`), `AI referral measurement must not add ${prohibitedKey}`);
}

console.log("GEO bounded AI referral measurement passed");
