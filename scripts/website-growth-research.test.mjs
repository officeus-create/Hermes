import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  caseStudyEvidenceStandard,
  evaluateWebsiteMarketOpportunity,
  websiteProofRegister,
  websiteServiceScopes,
} from "../src/data/website-growth-research.ts";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const routeFile = (route) => join(dist, route.slice(1), "index.html");

assert.equal(websiteServiceScopes.length, 6);
assert.equal(new Set(websiteServiceScopes.map((scope) => scope.id)).size, 6);
assert.deepEqual(
  websiteServiceScopes.map((scope) => scope.id).sort(),
  ["crm_automation", "local_seo", "multilingual_website", "seo", "website_creation", "website_redesign"],
);

for (const scope of websiteServiceScopes) {
  assert.ok(scope.label.trim().length > 0);
  assert.ok(scope.included.length >= 4);
  assert.ok(scope.optionalByAgreement.length >= 2);
  assert.ok(scope.excludedUnlessApproved.length >= 3);
  assert.ok(scope.controlBoundary.trim().length > 0);
}

const seoScope = websiteServiceScopes.find((scope) => scope.id === "seo");
assert.ok(seoScope.excludedUnlessApproved.some((item) => /ranking, rich-result, traffic, lead, revenue/i.test(item)));
assert.match(seoScope.controlBoundary, /Search engines control crawling, indexing, rankings/i);

const localSeoScope = websiteServiceScopes.find((scope) => scope.id === "local_seo");
assert.ok(localSeoScope.excludedUnlessApproved.some((item) => /fake offices/i.test(item)));
assert.ok(localSeoScope.excludedUnlessApproved.some((item) => /low keyword difficulty/i.test(item)));

const multilingualScope = websiteServiceScopes.find((scope) => scope.id === "multilingual_website");
assert.ok(multilingualScope.excludedUnlessApproved.some((item) => /machine-translated thin pages/i.test(item)));
assert.ok(multilingualScope.excludedUnlessApproved.some((item) => /capable human reviewer/i.test(item)));
assert.match(multilingualScope.controlBoundary, /natural-copy review/i);
assert.match(multilingualScope.controlBoundary, /response capacity/i);

const crmScope = websiteServiceScopes.find((scope) => scope.id === "crm_automation");
assert.ok(crmScope.excludedUnlessApproved.some((item) => /autonomous production actions/i.test(item)));
assert.ok(crmScope.excludedUnlessApproved.some((item) => /payments, booking, negotiation, messaging, or publication/i.test(item)));

assert.equal(websiteProofRegister.length, 4);
assert.equal(new Set(websiteProofRegister.map((proof) => proof.id)).size, 4);
for (const proof of websiteProofRegister) {
  await access(routeFile(proof.evidencePath));
  assert.ok(proof.requiredVisibleEvidence.length >= 2);
  assert.ok(proof.publicClaimBoundary.trim().length > 0);
}

const technologyHtml = await readFile(routeFile("/paths/technology/"), "utf8");
for (const proof of websiteProofRegister.filter((item) => item.evidencePath === "/paths/technology/")) {
  for (const visible of proof.requiredVisibleEvidence) {
    assert.ok(technologyHtml.toLowerCase().includes(visible.toLowerCase()), `${proof.id} missing visible evidence: ${visible}`);
  }
}

const websiteCaseHtml = await readFile(routeFile("/case/it-development/"), "utf8");
assert.ok(websiteCaseHtml.includes("One digital front door for four businesses"));
assert.ok(technologyHtml.includes("Live product"));

const loadBoardHtml = await readFile(routeFile("/load-board/"), "utf8");
assert.ok(/preview/i.test(loadBoardHtml));
assert.ok(/demo/i.test(loadBoardHtml));

assert.ok(caseStudyEvidenceStandard.requiredFields.length >= 8);
assert.ok(caseStudyEvidenceStandard.prohibitedWithoutEvidence.includes("rankings"));
assert.ok(caseStudyEvidenceStandard.prohibitedWithoutEvidence.includes("leads or qualified inquiries"));
assert.ok(caseStudyEvidenceStandard.prohibitedWithoutEvidence.includes("revenue or ROI"));
assert.ok(caseStudyEvidenceStandard.allowedMaturityLabels.includes("verified_case_study"));
assert.ok(caseStudyEvidenceStandard.allowedMaturityLabels.includes("working_prototype"));

const score = {
  relevantBusinessDensity: 2,
  competitionGap: 1,
  demandAndServiceFit: 2,
  uniqueNicheLocalValue: 1,
  conversionPath: 1,
  evidenceAndReviewDate: 1,
};

const baseOpportunity = {
  marketId: "fixture-market-001",
  city: "Sample City",
  state: "WI",
  niche: "independent auto dealers",
  serviceCluster: "seo",
  queryFamilies: ["seo for independent auto dealers"],
  sourceIds: ["fixture-market-source-001"],
  reviewedAt: "2026-07-31",
  evidenceMode: "owner_approved_sanitized",
  proofRecordIds: ["hermes-website-platform"],
  uniqueContentAngles: [
    "Dealer inventory and service architecture",
    "Local transport and acquisition inquiry paths",
    "Mobile lead and call measurement boundaries",
  ],
  score,
  responseCapacityConfirmed: true,
  privacyAndClaimsReviewed: true,
};

const eligible = evaluateWebsiteMarketOpportunity(baseOpportunity);
assert.equal(eligible.score, 8);
assert.equal(eligible.threshold, 7);
assert.equal(eligible.status, "eligible_for_editorial_review");
assert.deepEqual(eligible.blockers, []);
assert.ok(eligible.limitations.some((item) => /does not create a city page/i.test(item)));
assert.ok(eligible.limitations.some((item) => /national service hubs/i.test(item)));

const belowThreshold = evaluateWebsiteMarketOpportunity({
  ...baseOpportunity,
  score: {
    relevantBusinessDensity: 1,
    competitionGap: 1,
    demandAndServiceFit: 1,
    uniqueNicheLocalValue: 1,
    conversionPath: 1,
    evidenceAndReviewDate: 1,
  },
});
assert.equal(belowThreshold.score, 6);
assert.equal(belowThreshold.status, "research_only");
assert.ok(belowThreshold.blockers.includes("market score is below 7/10"));

const synthetic = evaluateWebsiteMarketOpportunity({
  ...baseOpportunity,
  marketId: "fixture-market-synthetic",
  evidenceMode: "synthetic",
  score: {
    relevantBusinessDensity: 2,
    competitionGap: 2,
    demandAndServiceFit: 2,
    uniqueNicheLocalValue: 2,
    conversionPath: 1,
    evidenceAndReviewDate: 1,
  },
});
assert.equal(synthetic.score, 10);
assert.equal(synthetic.status, "research_only");
assert.ok(synthetic.blockers.includes("synthetic market evidence cannot support public publication"));

const blocked = evaluateWebsiteMarketOpportunity({
  ...baseOpportunity,
  marketId: "",
  city: "",
  state: "Wisconsin",
  niche: "",
  serviceCluster: "guaranteed_rankings",
  queryFamilies: [],
  sourceIds: [],
  reviewedAt: "31-07-2026",
  proofRecordIds: ["unknown-proof"],
  uniqueContentAngles: ["generic"],
  responseCapacityConfirmed: false,
  privacyAndClaimsReviewed: false,
  score: {
    relevantBusinessDensity: 3,
    competitionGap: 0,
    demandAndServiceFit: 0,
    uniqueNicheLocalValue: 0,
    conversionPath: 0,
    evidenceAndReviewDate: 0,
  },
});
assert.equal(blocked.status, "blocked_missing_evidence");
for (const expected of [
  "marketId is required",
  "city is required",
  "state must use a two-letter code",
  "niche is required",
  "approved service cluster is required",
  "query-family research is required",
  "dated research provenance is required",
  "reviewedAt must use a valid YYYY-MM-DD date",
  "approved proof reference is required",
  "unknown proof reference",
  "at least three unique niche or local content angles are required",
  "service response capacity must be confirmed",
  "privacy and claims review is required",
  "market score dimensions are invalid",
]) {
  assert.ok(blocked.blockers.includes(expected), `missing blocker: ${expected}`);
}

for (const result of [eligible, belowThreshold, synthetic, blocked]) {
  assert.notEqual(result.status, "published");
  assert.notEqual(result.status, "page_created");
  assert.notEqual(result.status, "ranking_guaranteed");
}

console.log("website-growth research tests passed: six service scopes, proof labels, case evidence, 7/10 market scoring, and no automatic geo publication.");
