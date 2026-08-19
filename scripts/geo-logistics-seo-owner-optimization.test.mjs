import assert from "node:assert/strict";
import {
  auditLogisticsSeoChangeAttribution,
  auditLogisticsSeoOwnerAgainstFreshDemand,
  currentLogisticsSeoOwnerSnapshot,
  logisticsSeoCanonicalOwner,
  logisticsSeoIntakeHref,
  validateLogisticsSeoSnippetExperiment,
} from "../src/data/geo-logistics-seo-owner-optimization.ts";

const audit = auditLogisticsSeoOwnerAgainstFreshDemand();
assert.equal(audit.canonicalOwner, logisticsSeoCanonicalOwner);
assert.equal(audit.checkpoint.inclusiveDays, 18);
assert.equal(audit.checkpoint.impressions, 242);
assert.equal(audit.checkpoint.clicks, null);
assert.equal(audit.checkpoint.ctr, null);
assert.equal(audit.checkpoint.averagePosition, null);
assert.equal(audit.checkpoint.usScoped, false, "page-level checkpoint evidence must not be relabeled as US-scoped");
assert.equal(audit.intentAudit.titleRelevant, true);
assert.equal(audit.intentAudit.descriptionRelevant, true);
assert.equal(audit.intentAudit.firstScreenClear, true, "current first screen already explains the Logistics SEO buyer problem clearly");
assert.equal(audit.inboundAudit.reviewedInboundCount, 3);
assert.deepEqual(audit.inboundAudit.missingRequiredTypes, []);
assert.equal(audit.ctaAudit.consistent, true);
assert.equal(audit.ctaAudit.actualHref, logisticsSeoIntakeHref);
assert.ok(audit.defects.some((item) => item.type === "metadata_outcome_evidence_required"));
assert.ok(audit.defects.some((item) => item.type === "metadata_offer_message_mismatch"));
assert.ok(audit.defects.some((item) => item.type === "brand_relationship_review_required"));
assert.ok(audit.defects.some((item) => item.type === "evidence_coverage_gap"));
assert.ok(!audit.defects.some((item) => item.type === "first_screen_intent_gap"));
assert.ok(!audit.defects.some((item) => item.type === "inbound_link_gap"));
assert.ok(!audit.defects.some((item) => item.type === "cta_owner_mismatch"));
assert.equal(audit.rewritePolicy.noRepeatRewrite, true);
assert.equal(audit.rewritePolicy.concreteDefectFound, true);
assert.equal(audit.rewritePolicy.rewriteEligible, true);
assert.equal(audit.rewritePolicy.publishChangeNow, false, "identified defects do not authorize an immediate unmeasured rewrite");

const cleanSnapshot = {
  ...currentLogisticsSeoOwnerSnapshot,
  title: "Logistics & Trucking SEO Services | Hermes",
  description: "Logistics SEO services for trucking and transportation companies: technical audits, canonical query ownership, service architecture, internal linking, conversion review and measurement.",
  eyebrow: "Hermes · Logistics SEO",
  heroCtaLabel: "Start a logistics SEO review",
  claimEvidence: currentLogisticsSeoOwnerSnapshot.claimEvidence.map((claim) => ({ ...claim, state: "supported_first_party" })),
};
const cleanAudit = auditLogisticsSeoOwnerAgainstFreshDemand(cleanSnapshot);
assert.equal(cleanAudit.defects.length, 0);
assert.equal(cleanAudit.rewritePolicy.concreteDefectFound, false);
assert.equal(cleanAudit.rewritePolicy.rewriteEligible, false);
assert.equal(cleanAudit.rewritePolicy.publishChangeNow, false);
assert.match(cleanAudit.rewritePolicy.reason, /impressions alone do not justify another rewrite/i);

const brokenCta = auditLogisticsSeoOwnerAgainstFreshDemand({
  ...cleanSnapshot,
  heroCtaHref: "/contacts/",
  serviceGroup: "generic",
});
assert.ok(brokenCta.defects.some((item) => item.type === "cta_owner_mismatch" && item.severity === "P0"));

const missingResourceInbound = auditLogisticsSeoOwnerAgainstFreshDemand({
  ...cleanSnapshot,
  inboundLinks: cleanSnapshot.inboundLinks.filter((item) => item.sourceType !== "resource"),
});
assert.ok(missingResourceInbound.defects.some((item) => item.type === "inbound_link_gap"));
assert.deepEqual(missingResourceInbound.inboundAudit.missingRequiredTypes, ["resource"]);

const experiment = {
  experimentId: "logistics-seo-meta-001",
  canonicalOwner: logisticsSeoCanonicalOwner,
  changedFields: ["title"],
  changeStartedAt: "2026-08-19T12:00:00Z",
  pre: {
    startDate: "2026-08-01",
    endDate: "2026-08-18",
    geography: "United States",
    scope: "owner",
    source: "gsc",
    evidenceClass: "platform_verified",
    impressions: 200,
    clicks: 4,
    ctr: 2,
    averagePosition: 18,
  },
  post: {
    startDate: "2026-08-20",
    endDate: "2026-09-06",
    geography: "United States",
    scope: "owner",
    source: "gsc",
    evidenceClass: "platform_verified",
    impressions: 240,
    clicks: 7,
    ctr: 2.92,
    averagePosition: 17,
  },
};
assert.deepEqual(validateLogisticsSeoSnippetExperiment(experiment), { comparable: true, windowDays: 18 });

assert.throws(() => validateLogisticsSeoSnippetExperiment({
  ...experiment,
  post: { ...experiment.post, endDate: "2026-09-07" },
}), /equal duration/);

assert.throws(() => validateLogisticsSeoSnippetExperiment({
  ...experiment,
  post: { ...experiment.post, geography: "Worldwide" },
}), /geography must match/);

assert.throws(() => validateLogisticsSeoSnippetExperiment({
  ...experiment,
  post: { ...experiment.post, evidenceClass: "owner_provided_handoff" },
}), /evidence class must match/);

assert.throws(() => validateLogisticsSeoSnippetExperiment({
  ...experiment,
  pre: { ...experiment.pre, endDate: "2026-08-19" },
}), /Pre window must end before/);

const isolatedChanges = auditLogisticsSeoChangeAttribution([
  {
    changeId: "meta-001",
    canonicalOwner: logisticsSeoCanonicalOwner,
    category: "metadata",
    fields: ["title"],
    startedAt: "2026-08-19T12:00:00Z",
    endedAt: null,
    evidenceReference: "pr:bounded-metadata-change",
  },
]);
assert.equal(isolatedChanges.attributionState, "isolated");
assert.equal(isolatedChanges.canStartSnippetExperiment, true);

const confoundedChanges = auditLogisticsSeoChangeAttribution([
  {
    changeId: "meta-001",
    canonicalOwner: logisticsSeoCanonicalOwner,
    category: "metadata",
    fields: ["title"],
    startedAt: "2026-08-19T12:00:00Z",
    endedAt: null,
    evidenceReference: "pr:meta",
  },
  {
    changeId: "content-001",
    canonicalOwner: logisticsSeoCanonicalOwner,
    category: "content",
    fields: ["intro"],
    startedAt: "2026-08-19T12:10:00Z",
    endedAt: null,
    evidenceReference: "pr:content",
  },
]);
assert.equal(confoundedChanges.attributionState, "confounded");
assert.equal(confoundedChanges.canStartSnippetExperiment, false);

console.log("GEO bounded Logistics SEO owner optimization passed");
