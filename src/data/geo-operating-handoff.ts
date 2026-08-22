export type GeoOperatingEvidenceClass =
  | "repository_verified"
  | "production_verified"
  | "platform_verified"
  | "production_receiver_verified"
  | "private_operations_verified"
  | "owner_provided_handoff"
  | "unverified";

export type GeoExternalEvidenceGap =
  | "gsc_index_state"
  | "gsc_7d_28d_search"
  | "bing_index_state"
  | "ga4_ownership_receipt"
  | "ga4_exact_once_event"
  | "receiver_delivery"
  | "human_qualification"
  | "commercial_outcome";

export type GeoTechnicalGap =
  | "truth_or_evidence"
  | "canonical_owner"
  | "answer_evidence"
  | "internal_graph"
  | "schema_parity"
  | "funnel_contract"
  | "privacy_or_security"
  | "multilingual_consistency";

export interface GeoOperatingOwnerInput {
  canonical_owner: string;
  evidence_classes: GeoOperatingEvidenceClass[];
  technical_gaps: GeoTechnicalGap[];
  external_evidence_gaps: GeoExternalEvidenceGap[];
  material_visual_change_required: boolean;
  visual_queue_refs: string[];
}

export interface GeoCompletionRangeInput {
  range: string;
  status: "verified" | "in_progress" | "gated";
  evidence_reference: string;
}

const ownerFields = new Set(["canonical_owner", "evidence_classes", "technical_gaps", "external_evidence_gaps", "material_visual_change_required", "visual_queue_refs"]);
const rangeFields = new Set(["range", "status", "evidence_reference"]);
const evidenceClasses = new Set<GeoOperatingEvidenceClass>(["repository_verified", "production_verified", "platform_verified", "production_receiver_verified", "private_operations_verified", "owner_provided_handoff", "unverified"]);
const externalGaps = new Set<GeoExternalEvidenceGap>(["gsc_index_state", "gsc_7d_28d_search", "bing_index_state", "ga4_ownership_receipt", "ga4_exact_once_event", "receiver_delivery", "human_qualification", "commercial_outcome"]);
const technicalGaps = new Set<GeoTechnicalGap>(["truth_or_evidence", "canonical_owner", "answer_evidence", "internal_graph", "schema_parity", "funnel_contract", "privacy_or_security", "multilingual_consistency"]);
const statuses = new Set(["verified", "in_progress", "gated"]);
const cleanPath = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) throw new Error(`${label} must be a clean site-relative path`);
  return value;
};
const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};
const exactFields = (row: Record<string, unknown>, fields: Set<string>, label: string) => {
  for (const key of Object.keys(row)) if (!fields.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  for (const key of fields) if (!(key in row)) throw new Error(`${label} is missing field: ${key}`);
};
const stringArray = <T extends string>(value: unknown, allowed: Set<T>, label: string): T[] => {
  if (!Array.isArray(value) || value.length > 100) throw new Error(`${label} must be an array`);
  const rows = value.map((item) => {
    if (typeof item !== "string" || !allowed.has(item as T)) throw new Error(`${label} contains unsupported value`);
    return item as T;
  });
  if (new Set(rows).size !== rows.length) throw new Error(`${label} must contain unique values`);
  return [...rows].sort();
};
const visualRefs = (value: unknown) => {
  if (!Array.isArray(value) || value.length > 25) throw new Error("visual_queue_refs must be an array");
  const rows = value.map((item) => {
    if (typeof item !== "string" || !/^V-\d{3}$/.test(item)) throw new Error("visual_queue_refs must use V-### references");
    return item;
  });
  if (new Set(rows).size !== rows.length) throw new Error("visual_queue_refs must be unique");
  return [...rows].sort();
};

export const importGeoOperatingOwners = (inputs: unknown[]): GeoOperatingOwnerInput[] => {
  if (!Array.isArray(inputs) || inputs.length > 1000) throw new Error("Operating owners must contain at most 1000 rows");
  const rows = inputs.map((input, index) => {
    const row = asRecord(input, `owners[${index}]`);
    exactFields(row, ownerFields, `owners[${index}]`);
    if (typeof row.material_visual_change_required !== "boolean") throw new Error(`owners[${index}].material_visual_change_required must be boolean`);
    const refs = visualRefs(row.visual_queue_refs);
    if (!row.material_visual_change_required && refs.length > 0) throw new Error(`owners[${index}] cannot reference CEO visual queue without a material visual change`);
    if (row.material_visual_change_required && refs.length === 0) throw new Error(`owners[${index}] material visual change requires a CEO visual queue reference`);
    return {
      canonical_owner: cleanPath(row.canonical_owner, `owners[${index}].canonical_owner`),
      evidence_classes: stringArray(row.evidence_classes, evidenceClasses, `owners[${index}].evidence_classes`),
      technical_gaps: stringArray(row.technical_gaps, technicalGaps, `owners[${index}].technical_gaps`),
      external_evidence_gaps: stringArray(row.external_evidence_gaps, externalGaps, `owners[${index}].external_evidence_gaps`),
      material_visual_change_required: row.material_visual_change_required,
      visual_queue_refs: refs,
    };
  });
  if (new Set(rows.map((row) => row.canonical_owner)).size !== rows.length) throw new Error("Operating owners must have unique canonical_owner values");
  return rows.sort((a, b) => a.canonical_owner.localeCompare(b.canonical_owner));
};

const technicalPriority: Record<GeoTechnicalGap, number> = {
  truth_or_evidence: 100,
  privacy_or_security: 95,
  canonical_owner: 90,
  answer_evidence: 85,
  funnel_contract: 75,
  internal_graph: 60,
  schema_parity: 55,
  multilingual_consistency: 50,
};
const externalPriority: Record<GeoExternalEvidenceGap, number> = {
  gsc_index_state: 100,
  gsc_7d_28d_search: 95,
  bing_index_state: 90,
  ga4_ownership_receipt: 85,
  ga4_exact_once_event: 80,
  receiver_delivery: 75,
  human_qualification: 70,
  commercial_outcome: 65,
};

export const buildGeoOperatingReadiness = (inputs: unknown[]) => {
  const owners = importGeoOperatingOwners(inputs);
  const ownerSummaries = owners.map((owner) => ({
    canonicalOwner: owner.canonical_owner,
    evidenceClasses: owner.evidence_classes,
    technicalGapCount: owner.technical_gaps.length,
    externalGapCount: owner.external_evidence_gaps.length,
    materialVisualChangeRequired: owner.material_visual_change_required,
    visualQueueRefs: owner.visual_queue_refs,
    engineeringReady: owner.technical_gaps.length === 0,
    externallyComplete: owner.external_evidence_gaps.length === 0,
    fullyReady: owner.technical_gaps.length === 0 && owner.external_evidence_gaps.length === 0,
  }));
  const technicalActions = owners.flatMap((owner) => owner.technical_gaps.map((gap) => ({
    canonicalOwner: owner.canonical_owner,
    gap,
    priority: technicalPriority[gap],
  }))).sort((a, b) => b.priority - a.priority || a.canonicalOwner.localeCompare(b.canonicalOwner) || a.gap.localeCompare(b.gap));
  const externalActions = owners.flatMap((owner) => owner.external_evidence_gaps.map((gap) => ({
    canonicalOwner: owner.canonical_owner,
    gap,
    priority: externalPriority[gap],
    requiresAuthenticatedExternalEvidence: true,
  }))).sort((a, b) => b.priority - a.priority || a.canonicalOwner.localeCompare(b.canonicalOwner) || a.gap.localeCompare(b.gap));
  const visualActions = owners.filter((owner) => owner.material_visual_change_required).map((owner) => ({
    canonicalOwner: owner.canonical_owner,
    queueRefs: owner.visual_queue_refs,
    queueIssue: 694,
  }));
  return {
    ownerSummaries,
    technicalActions,
    externalActions,
    visualActions,
    fullyReadyOwners: ownerSummaries.filter((owner) => owner.fullyReady).map((owner) => owner.canonicalOwner),
    externallyGatedOwners: ownerSummaries.filter((owner) => !owner.externallyComplete).map((owner) => owner.canonicalOwner),
  };
};

export const importGeoCompletionRanges = (inputs: unknown[]): GeoCompletionRangeInput[] => {
  if (!Array.isArray(inputs) || inputs.length > 100) throw new Error("Completion ranges must contain at most 100 rows");
  return inputs.map((input, index) => {
    const row = asRecord(input, `ranges[${index}]`);
    exactFields(row, rangeFields, `ranges[${index}]`);
    if (typeof row.range !== "string" || !/^\d+–\d+$/.test(row.range)) throw new Error(`ranges[${index}].range must use N–N`);
    if (typeof row.status !== "string" || !statuses.has(row.status)) throw new Error(`ranges[${index}].status is unsupported`);
    if (typeof row.evidence_reference !== "string" || !row.evidence_reference.trim()) throw new Error(`ranges[${index}].evidence_reference must be non-empty`);
    return { range: row.range, status: row.status as GeoCompletionRangeInput["status"], evidence_reference: row.evidence_reference.trim() };
  });
};

export const buildGeoCompletionReport = (
  rangeInputs: unknown[],
  ownerInputs: unknown[],
  backlogIssue = 703,
  measurementIssue = 206,
  visualIssue = 694,
) => {
  const ranges = importGeoCompletionRanges(rangeInputs);
  const readiness = buildGeoOperatingReadiness(ownerInputs);
  const verified = ranges.filter((row) => row.status === "verified");
  const inProgress = ranges.filter((row) => row.status === "in_progress");
  const gated = ranges.filter((row) => row.status === "gated");
  const markdown = [
    `# GEO completion handoff`,
    ``,
    `Backlog: #${backlogIssue}  `,
    `Measurement source of truth: #${measurementIssue}  `,
    `CEO visual queue: #${visualIssue}`,
    ``,
    `## Verified engineering ranges`,
    ...(verified.length ? verified.map((row) => `- ${row.range}: ${row.evidence_reference}`) : ["- None"]),
    ``,
    `## Engineering still in progress`,
    ...(inProgress.length ? inProgress.map((row) => `- ${row.range}: ${row.evidence_reference}`) : ["- None"]),
    ``,
    `## Explicitly gated ranges`,
    ...(gated.length ? gated.map((row) => `- ${row.range}: ${row.evidence_reference}`) : ["- None"]),
    ``,
    `## External authenticated evidence actions`,
    ...(readiness.externalActions.length ? readiness.externalActions.map((row) => `- ${row.canonicalOwner}: ${row.gap}`) : ["- None"]),
    ``,
    `## Autonomous technical actions`,
    ...(readiness.technicalActions.length ? readiness.technicalActions.map((row) => `- ${row.canonicalOwner}: ${row.gap}`) : ["- None"]),
    ``,
    `## CEO material visual decisions`,
    ...(readiness.visualActions.length ? readiness.visualActions.map((row) => `- ${row.canonicalOwner}: ${row.queueRefs.join(", ")} → #${visualIssue}`) : ["- None"]),
  ].join("\n");
  return { ranges, readiness, markdown };
};
