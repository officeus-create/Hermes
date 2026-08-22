import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildGeoEvidenceEnvelope,
  geoEvidenceEnvelopeVersion,
  geoEvidenceFingerprintAlgorithm,
  serializeGeoEvidenceEnvelopeJson,
  serializeGeoEvidenceEnvelopeMarkdown,
} from "../src/data/geo-evidence-envelope.ts";

const synthetic = JSON.parse(
  await readFile(new URL("../examples/geo-operational-input.synthetic.json", import.meta.url), "utf8"),
);

const receipts = [
  {
    reference_id: "gsc-7d-previous",
    layer: "search",
    evidence_class: "unverified",
    canonical_owner: "/logistics/car-hauling-dispatch/",
    window_days: 7,
    observed_at: "2026-08-17T12:00:00Z",
    evidence_fingerprint: "searchfp00000001",
    status: "active",
    supersedes_reference_id: null,
  },
  {
    reference_id: "gsc-7d-current",
    layer: "search",
    evidence_class: "unverified",
    canonical_owner: "/logistics/car-hauling-dispatch/",
    window_days: 7,
    observed_at: "2026-08-18T11:30:00Z",
    evidence_fingerprint: "searchfp00000002",
    status: "active",
    supersedes_reference_id: "gsc-7d-previous",
  },
  {
    reference_id: "funnel-review-a",
    layer: "funnel",
    evidence_class: "unverified",
    canonical_owner: "/logistics/car-hauling-dispatch/",
    window_days: 7,
    observed_at: "2026-08-18T11:00:00Z",
    evidence_fingerprint: "funnelfp00000001",
    status: "active",
    supersedes_reference_id: null,
  },
  {
    reference_id: "funnel-review-b",
    layer: "funnel",
    evidence_class: "unverified",
    canonical_owner: "/logistics/car-hauling-dispatch/",
    window_days: 7,
    observed_at: "2026-08-18T11:15:00Z",
    evidence_fingerprint: "funnelfp00000002",
    status: "active",
    supersedes_reference_id: null,
  },
  {
    reference_id: "index-review-withdrawn",
    layer: "platform_index",
    evidence_class: "unverified",
    canonical_owner: "/logistics/car-hauling-dispatch/",
    window_days: null,
    observed_at: "2026-08-16T10:00:00Z",
    evidence_fingerprint: "indexfp000000001",
    status: "withdrawn",
    supersedes_reference_id: null,
  },
];

const input = { report_input: synthetic, receipts };
const envelope = buildGeoEvidenceEnvelope(input);

assert.equal(envelope.schemaVersion, geoEvidenceEnvelopeVersion);
assert.equal(envelope.fingerprintAlgorithm, geoEvidenceFingerprintAlgorithm);
assert.match(envelope.envelopeId, /^geoenv-v1-[a-f0-9]{16}$/);
assert.match(envelope.reportFingerprint, /^[a-f0-9]{16}$/);
assert.equal(envelope.evidenceSummary.receiptCount, 5);
assert.equal(envelope.evidenceSummary.activeCount, 3);
assert.equal(envelope.evidenceSummary.supersededCount, 1);
assert.equal(envelope.evidenceSummary.withdrawnCount, 1);
assert.equal(envelope.evidenceSummary.conflictCount, 1);
assert.equal(envelope.evidenceSummary.canonicalOwnerCount, 1);
assert.equal(envelope.evidenceSummary.byLayer.search, 2);
assert.equal(envelope.evidenceSummary.byLayer.funnel, 2);
assert.equal(envelope.evidenceSummary.byLayer.platform_index, 1);
assert.equal(envelope.evidenceSummary.byEvidenceClass.unverified, 5);

const prior = envelope.receipts.find((item) => item.referenceId === "gsc-7d-previous");
const current = envelope.receipts.find((item) => item.referenceId === "gsc-7d-current");
const withdrawn = envelope.receipts.find((item) => item.referenceId === "index-review-withdrawn");
assert.equal(prior?.effectiveStatus, "superseded");
assert.equal(current?.effectiveStatus, "active");
assert.equal(withdrawn?.effectiveStatus, "withdrawn");
assert.deepEqual(envelope.conflicts[0].referenceIds, ["funnel-review-a", "funnel-review-b"]);
assert.equal(envelope.conflicts[0].reason, "multiple_active_comparable_receipts_disagree");

const reversed = buildGeoEvidenceEnvelope({ report_input: synthetic, receipts: [...receipts].reverse() });
assert.equal(reversed.envelopeId, envelope.envelopeId, "Envelope ID must ignore input row order");
assert.equal(reversed.reportFingerprint, envelope.reportFingerprint);
assert.deepEqual(reversed.receipts, envelope.receipts);

const changed = structuredClone(synthetic);
changed.search_checkpoints[0].impressions += 1;
const changedEnvelope = buildGeoEvidenceEnvelope({ report_input: changed, receipts });
assert.notEqual(changedEnvelope.reportFingerprint, envelope.reportFingerprint);
assert.notEqual(changedEnvelope.envelopeId, envelope.envelopeId);

const json = serializeGeoEvidenceEnvelopeJson(input);
const parsedJson = JSON.parse(json);
assert.equal(parsedJson.envelopeId, envelope.envelopeId);
assert.equal(parsedJson.reportFingerprint, envelope.reportFingerprint);

const markdown = serializeGeoEvidenceEnvelopeMarkdown(input);
assert.match(markdown, /Hermes GEO evidence envelope/);
assert.match(markdown, /not platform authentication/);
assert.match(markdown, /gsc-7d-current/);
assert.match(markdown, /multiple_active_comparable_receipts_disagree|funnel-review-a/);

const badExtraField = structuredClone(receipts[0]);
badExtraField.email = "blocked@example.com";
assert.throws(
  () => buildGeoEvidenceEnvelope({ report_input: synthetic, receipts: [badExtraField] }),
  /Unsupported evidence receipt field: email/,
);

const futureReceipt = { ...receipts[0], reference_id: "future-evidence", observed_at: "2026-08-19T12:00:00Z" };
assert.throws(
  () => buildGeoEvidenceEnvelope({ report_input: synthetic, receipts: [futureReceipt] }),
  /occurs after report as_of/,
);

const missingPrior = {
  ...receipts[1],
  reference_id: "missing-prior-current",
  supersedes_reference_id: "does-not-exist",
};
assert.throws(
  () => buildGeoEvidenceEnvelope({ report_input: synthetic, receipts: [missingPrior] }),
  /Superseded evidence receipt not found/,
);

const crossOwnerPrior = { ...receipts[0], reference_id: "owner-a" };
const crossOwnerCurrent = {
  ...receipts[1],
  reference_id: "owner-b",
  canonical_owner: "/services/seo/",
  supersedes_reference_id: "owner-a",
};
assert.throws(
  () => buildGeoEvidenceEnvelope({ report_input: synthetic, receipts: [crossOwnerPrior, crossOwnerCurrent] }),
  /Supersession must stay within one comparable evidence key/,
);

const duplicate = { ...receipts[0] };
assert.throws(
  () => buildGeoEvidenceEnvelope({ report_input: synthetic, receipts: [receipts[0], duplicate] }),
  /Duplicate evidence receipt/,
);

console.log("GEO evidence envelope contract passed");
