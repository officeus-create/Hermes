import { buildSecureGeoOperationalScorecardReport } from "./geo-operational-secure-runner.ts";
import {
  assertGeoOperationalBundleSecurity,
  assertGeoOperationalReportPrivacy,
  stableGeoJsonStringify,
} from "./geo-operational-security.ts";

export const geoEvidenceEnvelopeVersion = "geo_evidence_envelope_v1" as const;
export const geoEvidenceFingerprintAlgorithm = "fnv1a64-noncryptographic" as const;

export type GeoEvidenceEnvelopeLayer =
  | "ai_visibility"
  | "search"
  | "funnel"
  | "outcomes"
  | "platform_index"
  | "analytics_receipt"
  | "receiver_delivery";

export type GeoEvidenceEnvelopeClass =
  | "repository_verified"
  | "production_verified"
  | "platform_verified"
  | "production_receiver_verified"
  | "private_operations_verified"
  | "owner_provided_handoff"
  | "unverified";

export type GeoEvidenceReceiptStatus = "active" | "superseded" | "withdrawn";

export interface GeoEvidenceReceiptInput {
  reference_id: string;
  layer: GeoEvidenceEnvelopeLayer;
  evidence_class: GeoEvidenceEnvelopeClass;
  canonical_owner: string;
  window_days: 7 | 28 | 90 | null;
  observed_at: string;
  evidence_fingerprint: string;
  status: GeoEvidenceReceiptStatus;
  supersedes_reference_id: string | null;
}

export interface GeoEvidenceEnvelopeInput {
  report_input: unknown;
  receipts: unknown[];
}

export interface GeoEvidenceReceiptRecord {
  referenceId: string;
  layer: GeoEvidenceEnvelopeLayer;
  evidenceClass: GeoEvidenceEnvelopeClass;
  canonicalOwner: string;
  windowDays: 7 | 28 | 90 | null;
  observedAt: string;
  evidenceFingerprint: string;
  declaredStatus: GeoEvidenceReceiptStatus;
  effectiveStatus: GeoEvidenceReceiptStatus;
  supersedesReferenceId: string | null;
  comparableKey: string;
}

const receiptFields = new Set([
  "reference_id",
  "layer",
  "evidence_class",
  "canonical_owner",
  "window_days",
  "observed_at",
  "evidence_fingerprint",
  "status",
  "supersedes_reference_id",
]);
const layers = new Set<GeoEvidenceEnvelopeLayer>([
  "ai_visibility",
  "search",
  "funnel",
  "outcomes",
  "platform_index",
  "analytics_receipt",
  "receiver_delivery",
]);
const evidenceClasses = new Set<GeoEvidenceEnvelopeClass>([
  "repository_verified",
  "production_verified",
  "platform_verified",
  "production_receiver_verified",
  "private_operations_verified",
  "owner_provided_handoff",
  "unverified",
]);
const statuses = new Set<GeoEvidenceReceiptStatus>(["active", "superseded", "withdrawn"]);
const explicitTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const opaqueId = /^[A-Za-z0-9._:-]{3,160}$/;
const fingerprint = /^[A-Za-z0-9._:-]{8,256}$/;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const cleanOwner = (value: unknown) => {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[?#]/.test(value)
  ) {
    throw new Error("canonical_owner must be a clean site-relative path");
  }
  return value;
};

const deterministicFingerprint = (value: unknown) => {
  const source = stableGeoJsonStringify(value, 0);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  const bytes = new TextEncoder().encode(source);
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
};

const parseReceipt = (value: unknown): GeoEvidenceReceiptInput => {
  const row = asRecord(value, "Evidence receipt");
  for (const key of Object.keys(row)) {
    if (!receiptFields.has(key)) throw new Error(`Unsupported evidence receipt field: ${key}`);
  }
  for (const field of receiptFields) {
    if (!(field in row)) throw new Error(`Missing evidence receipt field: ${field}`);
  }

  if (typeof row.reference_id !== "string" || !opaqueId.test(row.reference_id)) {
    throw new Error("reference_id must be an opaque non-PII identifier");
  }
  if (typeof row.layer !== "string" || !layers.has(row.layer as GeoEvidenceEnvelopeLayer)) {
    throw new Error("Unsupported evidence receipt layer");
  }
  if (
    typeof row.evidence_class !== "string" ||
    !evidenceClasses.has(row.evidence_class as GeoEvidenceEnvelopeClass)
  ) {
    throw new Error("Unsupported evidence receipt class");
  }
  const canonicalOwner = cleanOwner(row.canonical_owner);
  if (row.window_days !== null && row.window_days !== 7 && row.window_days !== 28 && row.window_days !== 90) {
    throw new Error("window_days must be 7, 28, 90, or null");
  }
  if (
    typeof row.observed_at !== "string" ||
    !explicitTimezone.test(row.observed_at) ||
    !Number.isFinite(Date.parse(row.observed_at))
  ) {
    throw new Error("observed_at must be an ISO timestamp with explicit timezone");
  }
  if (typeof row.evidence_fingerprint !== "string" || !fingerprint.test(row.evidence_fingerprint)) {
    throw new Error("evidence_fingerprint must be an opaque sanitized fingerprint");
  }
  if (typeof row.status !== "string" || !statuses.has(row.status as GeoEvidenceReceiptStatus)) {
    throw new Error("Unsupported evidence receipt status");
  }
  if (
    row.supersedes_reference_id !== null &&
    (typeof row.supersedes_reference_id !== "string" || !opaqueId.test(row.supersedes_reference_id))
  ) {
    throw new Error("supersedes_reference_id must be null or an opaque non-PII identifier");
  }
  if (row.supersedes_reference_id === row.reference_id) {
    throw new Error("Evidence receipt cannot supersede itself");
  }

  return {
    reference_id: row.reference_id,
    layer: row.layer as GeoEvidenceEnvelopeLayer,
    evidence_class: row.evidence_class as GeoEvidenceEnvelopeClass,
    canonical_owner: canonicalOwner,
    window_days: row.window_days as 7 | 28 | 90 | null,
    observed_at: new Date(Date.parse(row.observed_at)).toISOString(),
    evidence_fingerprint: row.evidence_fingerprint,
    status: row.status as GeoEvidenceReceiptStatus,
    supersedes_reference_id: row.supersedes_reference_id as string | null,
  };
};

const comparableKey = (receipt: GeoEvidenceReceiptInput) =>
  [receipt.layer, receipt.evidence_class, receipt.canonical_owner, receipt.window_days ?? "none"].join("|");

const normalizeReceipts = (values: unknown[], asOf: string): GeoEvidenceReceiptRecord[] => {
  if (values.length > 5000) throw new Error("Evidence receipt list exceeds 5000 rows");
  const parsed = values.map(parseReceipt);
  const byId = new Map<string, GeoEvidenceReceiptInput>();
  for (const receipt of parsed) {
    if (byId.has(receipt.reference_id)) throw new Error(`Duplicate evidence receipt: ${receipt.reference_id}`);
    if (Date.parse(receipt.observed_at) > Date.parse(asOf)) {
      throw new Error(`Evidence receipt ${receipt.reference_id} occurs after report as_of`);
    }
    byId.set(receipt.reference_id, receipt);
  }

  const supersededIds = new Set<string>();
  for (const receipt of parsed) {
    if (!receipt.supersedes_reference_id) continue;
    const prior = byId.get(receipt.supersedes_reference_id);
    if (!prior) throw new Error(`Superseded evidence receipt not found: ${receipt.supersedes_reference_id}`);
    if (comparableKey(prior) !== comparableKey(receipt)) {
      throw new Error(`Supersession must stay within one comparable evidence key: ${receipt.reference_id}`);
    }
    if (Date.parse(receipt.observed_at) < Date.parse(prior.observed_at)) {
      throw new Error(`Superseding evidence cannot be older than prior evidence: ${receipt.reference_id}`);
    }
    supersededIds.add(prior.reference_id);
  }

  return parsed
    .map((receipt): GeoEvidenceReceiptRecord => {
      const effectiveStatus: GeoEvidenceReceiptStatus =
        receipt.status === "withdrawn"
          ? "withdrawn"
          : receipt.status === "superseded" || supersededIds.has(receipt.reference_id)
            ? "superseded"
            : "active";

      return {
        referenceId: receipt.reference_id,
        layer: receipt.layer,
        evidenceClass: receipt.evidence_class,
        canonicalOwner: receipt.canonical_owner,
        windowDays: receipt.window_days,
        observedAt: receipt.observed_at,
        evidenceFingerprint: receipt.evidence_fingerprint,
        declaredStatus: receipt.status,
        effectiveStatus,
        supersedesReferenceId: receipt.supersedes_reference_id,
        comparableKey: comparableKey(receipt),
      };
    })
    .sort(
      (left, right) =>
        left.comparableKey.localeCompare(right.comparableKey) ||
        left.observedAt.localeCompare(right.observedAt) ||
        left.referenceId.localeCompare(right.referenceId),
    );
};

const buildConflicts = (receipts: GeoEvidenceReceiptRecord[]) => {
  const byKey = new Map<string, GeoEvidenceReceiptRecord[]>();
  for (const receipt of receipts.filter((item) => item.effectiveStatus === "active")) {
    byKey.set(receipt.comparableKey, [...(byKey.get(receipt.comparableKey) ?? []), receipt]);
  }
  return [...byKey.entries()]
    .flatMap(([key, items]) => {
      const fingerprints = [...new Set(items.map((item) => item.evidenceFingerprint))];
      if (items.length < 2 || fingerprints.length < 2) return [];
      return [{
        comparableKey: key,
        referenceIds: items.map((item) => item.referenceId).sort(),
        fingerprints: fingerprints.sort(),
        reason: "multiple_active_comparable_receipts_disagree" as const,
      }];
    })
    .sort((left, right) => left.comparableKey.localeCompare(right.comparableKey));
};

const countBy = <T>(values: T[], keyFor: (value: T) => string) =>
  Object.fromEntries(
    [...values.reduce((map, value) => {
      const key = keyFor(value);
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  );

export const buildGeoEvidenceEnvelope = (input: GeoEvidenceEnvelopeInput) => {
  const top = asRecord(input, "GEO evidence envelope input");
  if (!Array.isArray(top.receipts)) throw new Error("receipts must be an array");

  assertGeoOperationalBundleSecurity(top.report_input);
  const report = buildSecureGeoOperationalScorecardReport(top.report_input);
  const receipts = normalizeReceipts(top.receipts, report.asOf);
  const conflicts = buildConflicts(receipts);
  const reportFingerprint = deterministicFingerprint(report);
  const receiptFingerprint = deterministicFingerprint(receipts);

  const envelope = {
    schemaVersion: geoEvidenceEnvelopeVersion,
    fingerprintAlgorithm: geoEvidenceFingerprintAlgorithm,
    envelopeId: `geoenv-v1-${deterministicFingerprint({ reportFingerprint, receiptFingerprint })}`,
    reportFingerprint,
    asOf: report.asOf,
    evidenceSummary: {
      receiptCount: receipts.length,
      activeCount: receipts.filter((item) => item.effectiveStatus === "active").length,
      supersededCount: receipts.filter((item) => item.effectiveStatus === "superseded").length,
      withdrawnCount: receipts.filter((item) => item.effectiveStatus === "withdrawn").length,
      conflictCount: conflicts.length,
      byLayer: countBy(receipts, (item) => item.layer),
      byEvidenceClass: countBy(receipts, (item) => item.evidenceClass),
      canonicalOwnerCount: new Set(receipts.map((item) => item.canonicalOwner)).size,
    },
    incompleteChains: report.heldEvidence.map((item) => ({
      layer: item.layer,
      canonicalOwner: item.canonicalOwner,
      windowDays: item.windowDays,
      reasonCode: item.reasonCode,
      reasons: [...item.reasons],
    })),
    ownerCoverage: report.ownerCoverage,
    conflicts,
    receipts,
    report,
  };

  assertGeoOperationalReportPrivacy(envelope);
  return envelope;
};

export const serializeGeoEvidenceEnvelopeJson = (input: GeoEvidenceEnvelopeInput) =>
  `${stableGeoJsonStringify(buildGeoEvidenceEnvelope(input), 2)}\n`;

const markdownTable = (rows: string[][]) =>
  rows.map((row) => `| ${row.map((value) => value.replaceAll("|", "\\|")).join(" | ")} |`).join("\n");

export const serializeGeoEvidenceEnvelopeMarkdown = (input: GeoEvidenceEnvelopeInput) => {
  const envelope = buildGeoEvidenceEnvelope(input);
  const lines = [
    "# Hermes GEO evidence envelope",
    "",
    `- Schema: \`${envelope.schemaVersion}\``,
    `- As of: ${envelope.asOf}`,
    `- Envelope ID: \`${envelope.envelopeId}\``,
    `- Report fingerprint: \`${envelope.reportFingerprint}\``,
    `- Fingerprint algorithm: \`${envelope.fingerprintAlgorithm}\` (deterministic change detection; not platform authentication)`,
    `- Receipts: ${envelope.evidenceSummary.receiptCount}`,
    `- Active / superseded / withdrawn: ${envelope.evidenceSummary.activeCount} / ${envelope.evidenceSummary.supersededCount} / ${envelope.evidenceSummary.withdrawnCount}`,
    `- Evidence conflicts: ${envelope.evidenceSummary.conflictCount}`,
    `- Incomplete chains: ${envelope.incompleteChains.length}`,
    "",
    "## Evidence receipts",
    "",
  ];

  if (envelope.receipts.length === 0) {
    lines.push("No reviewed evidence receipts supplied.");
  } else {
    lines.push(
      markdownTable([
        ["Reference", "Layer", "Evidence class", "Owner", "Window", "State"],
        ["---", "---", "---", "---", "---", "---"],
        ...envelope.receipts.map((item) => [
          item.referenceId,
          item.layer,
          item.evidenceClass,
          item.canonicalOwner,
          item.windowDays === null ? "n/a" : String(item.windowDays),
          item.effectiveStatus,
        ]),
      ]),
    );
  }

  lines.push("", "## Conflicts", "");
  if (envelope.conflicts.length === 0) {
    lines.push("No active comparable evidence conflicts detected.");
  } else {
    for (const conflict of envelope.conflicts) {
      lines.push(`- \`${conflict.comparableKey}\`: ${conflict.referenceIds.join(", ")}`);
    }
  }

  lines.push("", "## Incomplete evidence chains", "");
  if (envelope.incompleteChains.length === 0) {
    lines.push("No held search/funnel evidence in this report.");
  } else {
    for (const gap of envelope.incompleteChains) {
      lines.push(`- ${gap.canonicalOwner} · ${gap.layer} · ${gap.windowDays}d · ${gap.reasonCode}`);
    }
  }

  const markdown = `${lines.join("\n")}\n`;
  assertGeoOperationalReportPrivacy({ markdown });
  return markdown;
};
