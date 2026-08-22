export const geoCommercialOutcomeEvidenceVersion = "geo_commercial_outcome_evidence_v1" as const;

export type GeoCommercialOutcomeStage =
  | "delivered"
  | "reviewed"
  | "qualified"
  | "opportunity"
  | "won"
  | "lost"
  | "revenue_reconciled_win";

export type GeoCommercialOutcomeEvidenceClass =
  | "production_receiver_verified"
  | "private_operations_verified"
  | "owner_provided_handoff"
  | "unverified";

export interface GeoCommercialOutcomeReceiptInput {
  schema_version: typeof geoCommercialOutcomeEvidenceVersion;
  reference_id: string;
  canonical_owner: string;
  stage: GeoCommercialOutcomeStage;
  start_date: string;
  end_date: string;
  observed_at: string;
  count: number;
  evidence_class: GeoCommercialOutcomeEvidenceClass;
  supersedes_reference_id: string | null;
}

export interface GeoCommercialOutcomeReceipt {
  schemaVersion: typeof geoCommercialOutcomeEvidenceVersion;
  referenceId: string;
  canonicalOwner: string;
  stage: GeoCommercialOutcomeStage;
  startDate: string;
  endDate: string;
  windowDays: number;
  observedAt: string;
  count: number;
  evidenceClass: GeoCommercialOutcomeEvidenceClass;
  supersedesReferenceId: string | null;
}

export interface GeoCommercialOutcomeChain {
  canonicalOwner: string;
  startDate: string;
  endDate: string;
  windowDays: number;
  counts: Record<GeoCommercialOutcomeStage, number | null>;
  evidenceClasses: Record<GeoCommercialOutcomeStage, GeoCommercialOutcomeEvidenceClass | null>;
  missingStages: GeoCommercialOutcomeStage[];
  integrityIssues: string[];
  evidenceIssues: string[];
  chainComplete: boolean;
  verifiedChainComplete: boolean;
  conversions: {
    deliveredToReviewed: number | null;
    reviewedToQualified: number | null;
    qualifiedToOpportunity: number | null;
    opportunityToWon: number | null;
    revenueReconciledWinCoverage: number | null;
  };
}

export interface GeoCommercialOutcomeTrend {
  canonicalOwner: string;
  windowDays: 7 | 28 | null;
  state: "comparable" | "not_comparable";
  reason: string | null;
  currentPeriod: string;
  previousPeriod: string;
  deltas: {
    delivered: number;
    reviewed: number;
    qualified: number;
    opportunity: number;
    won: number;
    lost: number;
    revenueReconciledWin: number;
  } | null;
}

const stages: GeoCommercialOutcomeStage[] = [
  "delivered",
  "reviewed",
  "qualified",
  "opportunity",
  "won",
  "lost",
  "revenue_reconciled_win",
];
const stageSet = new Set(stages);
const evidenceClasses = new Set<GeoCommercialOutcomeEvidenceClass>([
  "production_receiver_verified",
  "private_operations_verified",
  "owner_provided_handoff",
  "unverified",
]);
const receiptFields = new Set([
  "schema_version",
  "reference_id",
  "canonical_owner",
  "stage",
  "start_date",
  "end_date",
  "observed_at",
  "count",
  "evidence_class",
  "supersedes_reference_id",
]);
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const timezoneIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const opaqueId = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};
const exactFields = (row: Record<string, unknown>, fields: Set<string>, label: string) => {
  for (const key of Object.keys(row)) if (!fields.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  for (const key of fields) if (!(key in row)) throw new Error(`${label} is missing field: ${key}`);
};
const cleanPath = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) {
    throw new Error(`${label} must be a clean site-relative path`);
  }
  return value;
};
const opaque = (value: unknown, label: string) => {
  if (typeof value !== "string" || !opaqueId.test(value)) throw new Error(`${label} must be an opaque safe identifier`);
  return value;
};
const isoDate = (value: unknown, label: string) => {
  if (typeof value !== "string" || !dateOnly.test(value)) throw new Error(`${label} must be YYYY-MM-DD`);
  const parsed = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== value) throw new Error(`${label} must be a valid calendar date`);
  return value;
};
const isoTimestamp = (value: unknown, label: string) => {
  if (typeof value !== "string" || !timezoneIso.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be an ISO timestamp with explicit timezone`);
  }
  return new Date(Date.parse(value)).toISOString();
};
const inclusiveDays = (startDate: string, endDate: string) => {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (end < start) throw new Error("end_date cannot be before start_date");
  return Math.floor((end - start) / 86_400_000) + 1;
};
const rate = (numerator: number | null, denominator: number | null) => {
  if (numerator === null || denominator === null) return null;
  if (denominator === 0) return numerator === 0 ? 0 : null;
  return Number(((numerator / denominator) * 100).toFixed(1));
};

const expectedEvidenceForStage = (stage: GeoCommercialOutcomeStage, evidenceClass: GeoCommercialOutcomeEvidenceClass) => {
  if (stage === "delivered") return evidenceClass === "production_receiver_verified";
  return evidenceClass === "private_operations_verified";
};

export const importGeoCommercialOutcomeReceipt = (input: unknown): GeoCommercialOutcomeReceipt => {
  const row = asRecord(input, "Commercial outcome receipt");
  exactFields(row, receiptFields, "Commercial outcome receipt");
  if (row.schema_version !== geoCommercialOutcomeEvidenceVersion) {
    throw new Error(`schema_version must be ${geoCommercialOutcomeEvidenceVersion}`);
  }
  const stage = row.stage;
  if (typeof stage !== "string" || !stageSet.has(stage as GeoCommercialOutcomeStage)) throw new Error("stage has unsupported value");
  const evidenceClass = row.evidence_class;
  if (typeof evidenceClass !== "string" || !evidenceClasses.has(evidenceClass as GeoCommercialOutcomeEvidenceClass)) throw new Error("evidence_class has unsupported value");
  if (!Number.isInteger(row.count) || (row.count as number) < 0) throw new Error("count must be a non-negative integer");
  const startDate = isoDate(row.start_date, "start_date");
  const endDate = isoDate(row.end_date, "end_date");
  const referenceId = opaque(row.reference_id, "reference_id");
  const supersedesReferenceId = row.supersedes_reference_id === null ? null : opaque(row.supersedes_reference_id, "supersedes_reference_id");
  if (referenceId === supersedesReferenceId) throw new Error("Commercial outcome receipt cannot supersede itself");
  return {
    schemaVersion: geoCommercialOutcomeEvidenceVersion,
    referenceId,
    canonicalOwner: cleanPath(row.canonical_owner, "canonical_owner"),
    stage: stage as GeoCommercialOutcomeStage,
    startDate,
    endDate,
    windowDays: inclusiveDays(startDate, endDate),
    observedAt: isoTimestamp(row.observed_at, "observed_at"),
    count: row.count as number,
    evidenceClass: evidenceClass as GeoCommercialOutcomeEvidenceClass,
    supersedesReferenceId,
  };
};

export const importGeoCommercialOutcomeReceiptBatch = (inputs: unknown[]) => {
  if (!Array.isArray(inputs) || inputs.length > 5000) throw new Error("Commercial outcome receipt batch must contain at most 5000 rows");
  const rows = inputs.map(importGeoCommercialOutcomeReceipt);
  const byId = new Map<string, GeoCommercialOutcomeReceipt>();
  for (const row of rows) {
    if (byId.has(row.referenceId)) throw new Error(`Duplicate commercial outcome receipt: ${row.referenceId}`);
    byId.set(row.referenceId, row);
  }
  for (const row of rows) {
    if (!row.supersedesReferenceId) continue;
    const prior = byId.get(row.supersedesReferenceId);
    if (!prior) throw new Error(`Superseded commercial outcome receipt not found: ${row.supersedesReferenceId}`);
    if (
      prior.canonicalOwner !== row.canonicalOwner || prior.stage !== row.stage ||
      prior.startDate !== row.startDate || prior.endDate !== row.endDate
    ) {
      throw new Error(`Commercial outcome supersession must preserve owner/stage/period: ${row.referenceId}`);
    }
    if (Date.parse(row.observedAt) < Date.parse(prior.observedAt)) throw new Error(`Commercial outcome superseding receipt cannot be older: ${row.referenceId}`);
  }
  return rows.sort((left, right) =>
    left.canonicalOwner.localeCompare(right.canonicalOwner) ||
    left.startDate.localeCompare(right.startDate) ||
    left.stage.localeCompare(right.stage) ||
    left.observedAt.localeCompare(right.observedAt),
  );
};

const effectiveReceipts = (receipts: GeoCommercialOutcomeReceipt[]) => {
  const superseded = new Set(receipts.map((item) => item.supersedesReferenceId).filter((item): item is string => Boolean(item)));
  const latest = new Map<string, GeoCommercialOutcomeReceipt>();
  for (const receipt of receipts.filter((item) => !superseded.has(item.referenceId))) {
    const key = `${receipt.canonicalOwner}|${receipt.stage}|${receipt.startDate}|${receipt.endDate}`;
    const current = latest.get(key);
    if (!current || Date.parse(receipt.observedAt) > Date.parse(current.observedAt)) latest.set(key, receipt);
  }
  return [...latest.values()];
};

export const buildGeoCommercialOutcomeChains = (receipts: GeoCommercialOutcomeReceipt[]): GeoCommercialOutcomeChain[] => {
  const effective = effectiveReceipts(receipts);
  const periods = new Map<string, GeoCommercialOutcomeReceipt[]>();
  for (const receipt of effective) {
    const key = `${receipt.canonicalOwner}|${receipt.startDate}|${receipt.endDate}`;
    periods.set(key, [...(periods.get(key) ?? []), receipt]);
  }

  return [...periods.values()].map((items) => {
    const first = items[0];
    const byStage = new Map(items.map((item) => [item.stage, item]));
    const counts = Object.fromEntries(stages.map((stage) => [stage, byStage.get(stage)?.count ?? null])) as Record<GeoCommercialOutcomeStage, number | null>;
    const evidence = Object.fromEntries(stages.map((stage) => [stage, byStage.get(stage)?.evidenceClass ?? null])) as Record<GeoCommercialOutcomeStage, GeoCommercialOutcomeEvidenceClass | null>;
    const missingStages = stages.filter((stage) => !byStage.has(stage));
    const integrityIssues: string[] = [];
    if (counts.reviewed !== null && counts.delivered === null) integrityIssues.push("reviewed_without_delivery_evidence");
    if (counts.qualified !== null && counts.reviewed === null) integrityIssues.push("qualified_without_reviewed_evidence");
    if (counts.opportunity !== null && counts.qualified === null) integrityIssues.push("opportunity_without_qualified_evidence");
    if ((counts.won !== null || counts.lost !== null) && counts.opportunity === null) integrityIssues.push("won_lost_without_opportunity_evidence");
    if (counts.revenue_reconciled_win !== null && counts.won === null) integrityIssues.push("reconciled_win_without_won_evidence");
    if (counts.delivered !== null && counts.reviewed !== null && counts.reviewed > counts.delivered) integrityIssues.push("reviewed_exceeds_delivered");
    if (counts.reviewed !== null && counts.qualified !== null && counts.qualified > counts.reviewed) integrityIssues.push("qualified_exceeds_reviewed");
    if (counts.qualified !== null && counts.opportunity !== null && counts.opportunity > counts.qualified) integrityIssues.push("opportunity_exceeds_qualified");
    if (counts.opportunity !== null && counts.won !== null && counts.lost !== null && counts.won + counts.lost > counts.opportunity) integrityIssues.push("won_plus_lost_exceeds_opportunity");
    if (counts.won !== null && counts.revenue_reconciled_win !== null && counts.revenue_reconciled_win > counts.won) integrityIssues.push("reconciled_wins_exceed_wins");

    const evidenceIssues = stages.flatMap((stage) => {
      const item = byStage.get(stage);
      if (!item) return [];
      return expectedEvidenceForStage(stage, item.evidenceClass) ? [] : [`${stage}_evidence_not_verified_for_stage`];
    });
    const chainComplete = missingStages.length === 0 && integrityIssues.length === 0;
    const verifiedChainComplete = chainComplete && evidenceIssues.length === 0;
    return {
      canonicalOwner: first.canonicalOwner,
      startDate: first.startDate,
      endDate: first.endDate,
      windowDays: first.windowDays,
      counts,
      evidenceClasses: evidence,
      missingStages,
      integrityIssues,
      evidenceIssues,
      chainComplete,
      verifiedChainComplete,
      conversions: {
        deliveredToReviewed: rate(counts.reviewed, counts.delivered),
        reviewedToQualified: rate(counts.qualified, counts.reviewed),
        qualifiedToOpportunity: rate(counts.opportunity, counts.qualified),
        opportunityToWon: rate(counts.won, counts.opportunity),
        revenueReconciledWinCoverage: rate(counts.revenue_reconciled_win, counts.won),
      },
    };
  }).sort((left, right) => left.canonicalOwner.localeCompare(right.canonicalOwner) || left.startDate.localeCompare(right.startDate));
};

export const buildGeoQualifiedDemandPrioritization = (chains: GeoCommercialOutcomeChain[]) =>
  chains
    .filter((item) => item.verifiedChainComplete && (item.windowDays === 7 || item.windowDays === 28))
    .map((item) => ({
      canonicalOwner: item.canonicalOwner,
      startDate: item.startDate,
      endDate: item.endDate,
      windowDays: item.windowDays as 7 | 28,
      qualified: item.counts.qualified ?? 0,
      opportunities: item.counts.opportunity ?? 0,
      wins: item.counts.won ?? 0,
      revenueReconciledWins: item.counts.revenue_reconciled_win ?? 0,
    }))
    .sort((left, right) =>
      right.qualified - left.qualified ||
      right.opportunities - left.opportunities ||
      right.wins - left.wins ||
      left.canonicalOwner.localeCompare(right.canonicalOwner),
    )
    .map((item, index) => ({ rank: index + 1, ...item }));

const previousDay = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

export const compareGeoCommercialOutcomeChains = (
  current: GeoCommercialOutcomeChain,
  previous: GeoCommercialOutcomeChain,
): GeoCommercialOutcomeTrend => {
  const currentPeriod = `${current.startDate}..${current.endDate}`;
  const previousPeriod = `${previous.startDate}..${previous.endDate}`;
  const comparable =
    current.canonicalOwner === previous.canonicalOwner &&
    (current.windowDays === 7 || current.windowDays === 28) &&
    current.windowDays === previous.windowDays &&
    previous.endDate === previousDay(current.startDate) &&
    current.verifiedChainComplete && previous.verifiedChainComplete;
  if (!comparable) {
    return {
      canonicalOwner: current.canonicalOwner,
      windowDays: current.windowDays === 7 || current.windowDays === 28 ? current.windowDays : null,
      state: "not_comparable",
      reason: "Comparison requires the same owner, adjacent exact 7d/28d periods, and complete verified evidence chains.",
      currentPeriod,
      previousPeriod,
      deltas: null,
    };
  }
  return {
    canonicalOwner: current.canonicalOwner,
    windowDays: current.windowDays as 7 | 28,
    state: "comparable",
    reason: null,
    currentPeriod,
    previousPeriod,
    deltas: {
      delivered: (current.counts.delivered ?? 0) - (previous.counts.delivered ?? 0),
      reviewed: (current.counts.reviewed ?? 0) - (previous.counts.reviewed ?? 0),
      qualified: (current.counts.qualified ?? 0) - (previous.counts.qualified ?? 0),
      opportunity: (current.counts.opportunity ?? 0) - (previous.counts.opportunity ?? 0),
      won: (current.counts.won ?? 0) - (previous.counts.won ?? 0),
      lost: (current.counts.lost ?? 0) - (previous.counts.lost ?? 0),
      revenueReconciledWin: (current.counts.revenue_reconciled_win ?? 0) - (previous.counts.revenue_reconciled_win ?? 0),
    },
  };
};
