import assert from "node:assert/strict";
import {
  buildGeoCompletionReport,
  buildGeoOperatingReadiness,
  importGeoOperatingOwners,
} from "../src/data/geo-operating-handoff.ts";

const owners = [
  {
    canonical_owner: "/logistics/car-hauling-dispatch/",
    evidence_classes: ["repository_verified", "owner_provided_handoff"],
    technical_gaps: ["answer_evidence"],
    external_evidence_gaps: ["gsc_7d_28d_search", "ga4_exact_once_event", "commercial_outcome"],
    material_visual_change_required: true,
    visual_queue_refs: ["V-002"],
  },
  {
    canonical_owner: "/services/seo/",
    evidence_classes: ["repository_verified", "production_verified"],
    technical_gaps: [],
    external_evidence_gaps: ["ga4_ownership_receipt", "ga4_exact_once_event"],
    material_visual_change_required: false,
    visual_queue_refs: [],
  },
  {
    canonical_owner: "/load-board/",
    evidence_classes: ["repository_verified", "production_verified", "platform_verified"],
    technical_gaps: [],
    external_evidence_gaps: [],
    material_visual_change_required: false,
    visual_queue_refs: [],
  },
];

const readiness = buildGeoOperatingReadiness(owners);
assert.deepEqual(readiness.fullyReadyOwners, ["/load-board/"]);
assert.deepEqual(readiness.externallyGatedOwners, ["/logistics/car-hauling-dispatch/", "/services/seo/"]);
assert.equal(readiness.technicalActions.length, 1);
assert.equal(readiness.technicalActions[0].gap, "answer_evidence");
assert.equal(readiness.externalActions.length, 5);
assert.ok(readiness.externalActions.every((row) => row.requiresAuthenticatedExternalEvidence));
assert.equal(readiness.visualActions.length, 1);
assert.deepEqual(readiness.visualActions[0].queueRefs, ["V-002"]);
assert.equal(readiness.visualActions[0].queueIssue, 694);

const carrier = readiness.ownerSummaries.find((row) => row.canonicalOwner === "/logistics/car-hauling-dispatch/");
assert.deepEqual(carrier.evidenceClasses, ["owner_provided_handoff", "repository_verified"]);
assert.equal(carrier.engineeringReady, false);
assert.equal(carrier.externallyComplete, false);
assert.equal(carrier.fullyReady, false);

const seo = readiness.ownerSummaries.find((row) => row.canonicalOwner === "/services/seo/");
assert.equal(seo.engineeringReady, true);
assert.equal(seo.externallyComplete, false, "Engineering readiness must not manufacture authenticated GA4 evidence");

const report = buildGeoCompletionReport([
  { range: "101–115", status: "verified", evidence_reference: "PR #704 exact-head success" },
  { range: "161–175", status: "in_progress", evidence_reference: "PR #734 exact-head CI pending" },
  { range: "196–200", status: "gated", evidence_reference: "External evidence remains separately gated" },
], owners);
assert.match(report.markdown, /Verified engineering ranges/);
assert.match(report.markdown, /External authenticated evidence actions/);
assert.match(report.markdown, /Autonomous technical actions/);
assert.match(report.markdown, /CEO material visual decisions/);
assert.match(report.markdown, /V-002 → #694/);
assert.ok(!report.markdown.includes("V-002 → #206"));

assert.throws(() => importGeoOperatingOwners([{ ...owners[1], visual_queue_refs: ["V-003"] }]), /cannot reference CEO visual queue without a material visual change/i);
assert.throws(() => importGeoOperatingOwners([{ ...owners[0], visual_queue_refs: [] }]), /requires a CEO visual queue reference/i);
assert.throws(() => importGeoOperatingOwners([{ ...owners[0], raw_lead_email: "blocked" }]), /unsupported field: raw_lead_email/i);
assert.throws(() => importGeoOperatingOwners([{ ...owners[0], evidence_classes: ["platform_verified", "platform_verified"] }]), /unique values/i);

console.log("GEO operating readiness handoff contract passed");
