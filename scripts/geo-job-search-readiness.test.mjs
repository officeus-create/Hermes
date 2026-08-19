import assert from "node:assert/strict";
import {
  auditFirstJobDiscovery,
  auditFirstJobPostingContract,
  auditFirstJobPublicApplicationSemantics,
  buildFirstJobFreshSearchCheckpoint,
  evaluateSecondJobPublicationGate,
  firstJobCanonicalOwner,
  firstJobEvidenceSlots,
  validateFirstJobEvidenceSlots,
} from "../src/data/geo-job-search-readiness.ts";

const contract = auditFirstJobPostingContract();
assert.equal(contract.canonicalOwner, firstJobCanonicalOwner);
assert.equal(contract.isFirstCanonicalOwner, true);
assert.equal(contract.eligibleForJobPosting, true);
assert.equal(contract.verifiedOpen, true);
assert.equal(contract.publicationApproved, true);
assert.equal(contract.descriptionEvidencePresent, true);
assert.equal(contract.compensationClaimsSuppressed, true);
assert.equal(contract.liveExternalSubmission, true);
assert.equal(contract.hermesApplicationIsPreparationRoute, true);
assert.equal(contract.directApply, false);

const checkpoint = buildFirstJobFreshSearchCheckpoint();
assert.equal(checkpoint.exactWindow.inclusiveDays, 18);
assert.equal(checkpoint.exactWindow.evidenceClass, "owner_provided_handoff");
assert.equal(checkpoint.organicBlueLink.canonicalOwner, firstJobCanonicalOwner);
assert.equal(checkpoint.organicBlueLink.averagePosition, 5.12);
assert.equal(checkpoint.organicBlueLink.impressions, null);
assert.equal(checkpoint.googleJobsAppearance.impressions, 7);
assert.equal(checkpoint.googleJobsAppearance.averagePosition, 2.71);
assert.equal(checkpoint.channelsSeparated, true);
assert.match(checkpoint.note, /must not be averaged/i);

assert.equal(firstJobEvidenceSlots.length, 3);
assert.ok(firstJobEvidenceSlots.every((slot) => slot.state === "not_provided"));
assert.deepEqual(validateFirstJobEvidenceSlots(), firstJobEvidenceSlots);
assert.throws(() => validateFirstJobEvidenceSlots([
  {
    ...firstJobEvidenceSlots[0],
    state: "platform_verified",
    checkedAt: null,
    evidenceReference: null,
  },
]), /requires a checkedAt/);

const app = auditFirstJobPublicApplicationSemantics();
assert.equal(app.liveSubmissionReady, true);
assert.equal(app.hermesPreparationClearlySeparate, true);
assert.equal(app.humanReviewStatementPresent, true);
assert.equal(app.noOutcomeGuaranteeStatementPresent, true);
assert.equal(app.ready, true);
const badApp = auditFirstJobPublicApplicationSemantics({
  liveSubmissionUrl: "https://www.work.ua/jobs/7362244/",
  hermesPreparationPath: "/logistics/apply/?for=career",
  preparationRouteTransmitsData: true,
  humanReviewStatementPresent: true,
  noOutcomeGuaranteeStatementPresent: true,
});
assert.equal(badApp.ready, false);
assert.equal(badApp.hermesPreparationClearlySeparate, false);

const sitemapOnly = auditFirstJobDiscovery([
  {
    sourceOwner: "/sitemap.xml",
    targetOwner: firstJobCanonicalOwner,
    sourceType: "sitemap",
    evidenceReference: "repo:public/sitemap.xml",
  },
]);
assert.equal(sitemapOnly.inboundCount, 1);
assert.equal(sitemapOnly.humanDiscoveryCount, 0);
assert.equal(sitemapOnly.sitemapOnly, true);
assert.equal(sitemapOnly.careersHubLinkVerified, false);
assert.equal(sitemapOnly.gap, "careers_hub_to_first_job_link_not_verified");

const careersHubLinked = auditFirstJobDiscovery([
  {
    sourceOwner: "/logistics/careers/",
    targetOwner: firstJobCanonicalOwner,
    sourceType: "careers_hub",
    evidenceReference: "production-reviewed:careers-hub",
  },
]);
assert.equal(careersHubLinked.careersHubLinkVerified, true);
assert.equal(careersHubLinked.gap, null);

const cloneGate = evaluateSecondJobPublicationGate({
  roleKey: "dispatcher-copy",
  publicTitle: "Dispatcher 2",
  distinctFromExistingRole: false,
  rolePublicationApproved: false,
  roleNeedEvidenceReferences: [],
  descriptionEvidenceReferences: [],
  liveSubmissionRouteReady: false,
  publicRoleFactsComplete: false,
  responsibilities: ["Same work", "Same calls"],
  copiedResponsibilityRatio: 0.9,
});
assert.equal(cloneGate.publishable, false);
assert.equal(cloneGate.state, "hold_second_job");
assert.ok(cloneGate.gaps.includes("role_not_distinct"));
assert.ok(cloneGate.gaps.includes("thin_or_cloned_job_content"));
assert.ok(cloneGate.gaps.includes("responsibilities_too_thin"));

const distinctGate = evaluateSecondJobPublicationGate({
  roleKey: "verified-distinct-role",
  publicTitle: "Verified Distinct Logistics Role",
  distinctFromExistingRole: true,
  rolePublicationApproved: true,
  roleNeedEvidenceReferences: ["owner:approved-public-role-need"],
  descriptionEvidenceReferences: ["owner:approved-role-description"],
  liveSubmissionRouteReady: true,
  publicRoleFactsComplete: true,
  responsibilities: ["Distinct responsibility one", "Distinct responsibility two", "Distinct responsibility three"],
  copiedResponsibilityRatio: 0.1,
});
assert.equal(distinctGate.publishable, true);
assert.equal(distinctGate.state, "distinct_verified_public_role");
assert.deepEqual(distinctGate.gaps, []);

console.log("GEO public job search readiness passed");
