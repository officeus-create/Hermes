import {
  aiVisibilityPrompts,
  type AiVisibilityObservation,
  type AiVisibilityProvider,
} from "./ai-visibility-scorecard.ts";
import { evaluateAiVisibilityObservation } from "./geo-ai-observation-evaluation.ts";
import { geoPromptOwnerRegistry } from "./geo-prompt-owner-registry.ts";
import { stableGeoJsonStringify } from "./geo-operational-security.ts";

export const geoAiReviewWaveVersion = "geo_ai_review_wave_v1" as const;
export const geoAiPromptRegistryFingerprintAlgorithm = "fnv1a64-noncryptographic" as const;

export type GeoAiFactualErrorSeverity = "none" | "low" | "medium" | "high" | "critical";
export type GeoAiEvidenceSupportState = "supported" | "partial" | "unsupported" | "not_applicable";
export type GeoAiWaveComparisonState = "comparable" | "not_comparable";

export interface GeoAiProviderReviewReceiptInput {
  provider: AiVisibilityProvider;
  reviewer_label: string;
  reviewed_at: string;
  evidence_reference: string;
}

export interface GeoAiObservationReviewInput {
  observation_id: string;
  factual_error_severity: GeoAiFactualErrorSeverity;
  evidence_support_state: GeoAiEvidenceSupportState;
  prohibited_claim_indexes: number[];
}

export interface GeoAiReviewWaveInput {
  schema_version: typeof geoAiReviewWaveVersion;
  wave_id: string;
  observed_from: string;
  observed_to: string;
  reviewed_at: string;
  prompt_registry_fingerprint: string;
  provider_receipts: GeoAiProviderReviewReceiptInput[];
  observation_reviews: GeoAiObservationReviewInput[];
}

export interface GeoAiProviderReviewReceipt {
  provider: AiVisibilityProvider;
  reviewerLabel: string;
  reviewedAt: string;
  evidenceReference: string;
}

export interface GeoAiObservationReview {
  observationId: string;
  factualErrorSeverity: GeoAiFactualErrorSeverity;
  evidenceSupportState: GeoAiEvidenceSupportState;
  prohibitedClaimIndexes: number[];
}

export interface GeoAiReviewWave {
  schemaVersion: typeof geoAiReviewWaveVersion;
  waveId: string;
  observedFrom: string;
  observedTo: string;
  reviewedAt: string;
  promptRegistryFingerprint: string;
  providerReceipts: GeoAiProviderReviewReceipt[];
  observationReviews: GeoAiObservationReview[];
}

const providers = new Set<AiVisibilityProvider>(["chatgpt", "gemini", "copilot", "perplexity", "google_ai_mode", "other"]);
const severities = new Set<GeoAiFactualErrorSeverity>(["none", "low", "medium", "high", "critical"]);
const supportStates = new Set<GeoAiEvidenceSupportState>(["supported", "partial", "unsupported", "not_applicable"]);
const topFields = new Set(["schema_version", "wave_id", "observed_from", "observed_to", "reviewed_at", "prompt_registry_fingerprint", "provider_receipts", "observation_reviews"]);
const providerFields = new Set(["provider", "reviewer_label", "reviewed_at", "evidence_reference"]);
const reviewFields = new Set(["observation_id", "factual_error_severity", "evidence_support_state", "prohibited_claim_indexes"]);
const explicitTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const opaque = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};
const exactFields = (row: Record<string, unknown>, allowed: Set<string>, label: string) => {
  for (const key of Object.keys(row)) if (!allowed.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  for (const key of allowed) if (!(key in row)) throw new Error(`${label} is missing field: ${key}`);
};
const cleanOpaque = (value: unknown, label: string) => {
  if (typeof value !== "string" || !opaque.test(value)) throw new Error(`${label} must be an opaque safe identifier`);
  return value;
};
const isoTimestamp = (value: unknown, label: string) => {
  if (typeof value !== "string" || !explicitTimezone.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be an ISO timestamp with explicit timezone`);
  }
  return new Date(Date.parse(value)).toISOString();
};
const cleanDate = (value: unknown, label: string) => {
  if (typeof value !== "string" || !dateOnly.test(value) || !Number.isFinite(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
  return value;
};
const rate = (value: number, denominator: number) => denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));
const dayMs = 86_400_000;
const inclusiveDays = (start: string, end: string) => Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / dayMs) + 1;

const fingerprint = (value: unknown) => {
  const source = stableGeoJsonStringify(value, 0);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (const byte of new TextEncoder().encode(source)) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }
  return `fnv1a64:${hash.toString(16).padStart(16, "0")}`;
};

export const buildGeoAiPromptRegistryFingerprint = () => fingerprint(
  aiVisibilityPrompts.map((prompt) => ({
    id: prompt.id,
    direction: prompt.direction,
    language: prompt.language,
    geography: prompt.geography,
    intent: prompt.intent,
    canonicalOwner: prompt.canonicalOwner,
    cadence: prompt.cadence,
    expectedFacts: prompt.expectedFacts,
    prohibitedClaims: prompt.prohibitedClaims,
  })),
);

export const importGeoAiReviewWave = (input: unknown, observations: AiVisibilityObservation[]): GeoAiReviewWave => {
  const row = asRecord(input, "AI review wave");
  exactFields(row, topFields, "AI review wave");
  if (row.schema_version !== geoAiReviewWaveVersion) throw new Error(`schema_version must be ${geoAiReviewWaveVersion}`);
  const waveId = cleanOpaque(row.wave_id, "wave_id");
  const observedFrom = cleanDate(row.observed_from, "observed_from");
  const observedTo = cleanDate(row.observed_to, "observed_to");
  if (Date.parse(`${observedTo}T00:00:00Z`) < Date.parse(`${observedFrom}T00:00:00Z`)) throw new Error("observed_to must not precede observed_from");
  const reviewedAt = isoTimestamp(row.reviewed_at, "reviewed_at");
  if (Date.parse(reviewedAt) < Date.parse(`${observedTo}T23:59:59Z`)) throw new Error("reviewed_at must not precede the wave end date");
  const expectedFingerprint = buildGeoAiPromptRegistryFingerprint();
  if (row.prompt_registry_fingerprint !== expectedFingerprint) throw new Error("prompt_registry_fingerprint does not match the current governed prompt registry");

  if (!Array.isArray(row.provider_receipts) || row.provider_receipts.length === 0 || row.provider_receipts.length > providers.size) {
    throw new Error("provider_receipts must contain 1-6 reviewed providers");
  }
  const providerReceipts = row.provider_receipts.map((item, index) => {
    const receipt = asRecord(item, `provider_receipts[${index}]`);
    exactFields(receipt, providerFields, `provider_receipts[${index}]`);
    if (typeof receipt.provider !== "string" || !providers.has(receipt.provider as AiVisibilityProvider)) throw new Error(`provider_receipts[${index}].provider is unsupported`);
    return {
      provider: receipt.provider as AiVisibilityProvider,
      reviewerLabel: cleanOpaque(receipt.reviewer_label, `provider_receipts[${index}].reviewer_label`),
      reviewedAt: isoTimestamp(receipt.reviewed_at, `provider_receipts[${index}].reviewed_at`),
      evidenceReference: cleanOpaque(receipt.evidence_reference, `provider_receipts[${index}].evidence_reference`),
    };
  });
  if (new Set(providerReceipts.map((item) => item.provider)).size !== providerReceipts.length) throw new Error("provider_receipts must contain unique providers");
  if (providerReceipts.some((item) => Date.parse(item.reviewedAt) > Date.parse(reviewedAt))) throw new Error("provider receipt cannot be reviewed after wave reviewed_at");

  if (!Array.isArray(row.observation_reviews) || row.observation_reviews.length > 5000) throw new Error("observation_reviews must contain at most 5000 rows");
  const observationById = new Map(observations.map((item) => [item.id, item]));
  const receiptProviders = new Set(providerReceipts.map((item) => item.provider));
  const observationReviews = row.observation_reviews.map((item, index) => {
    const review = asRecord(item, `observation_reviews[${index}]`);
    exactFields(review, reviewFields, `observation_reviews[${index}]`);
    const observationId = cleanOpaque(review.observation_id, `observation_reviews[${index}].observation_id`);
    const observation = observationById.get(observationId);
    if (!observation) throw new Error(`Unknown observation_id: ${observationId}`);
    if (observation.synthetic) throw new Error(`Synthetic observation cannot satisfy a real review wave: ${observationId}`);
    if (!receiptProviders.has(observation.provider)) throw new Error(`Observation provider lacks a provider receipt: ${observationId}`);
    const observationDay = observation.observedAt.slice(0, 10);
    if (observationDay < observedFrom || observationDay > observedTo) throw new Error(`Observation falls outside wave window: ${observationId}`);
    if (typeof review.factual_error_severity !== "string" || !severities.has(review.factual_error_severity as GeoAiFactualErrorSeverity)) throw new Error(`factual_error_severity is unsupported: ${observationId}`);
    const factualErrorSeverity = review.factual_error_severity as GeoAiFactualErrorSeverity;
    if (observation.factualError && factualErrorSeverity === "none") throw new Error(`Factual error requires severity: ${observationId}`);
    if (!observation.factualError && factualErrorSeverity !== "none") throw new Error(`Severity requires factualError=true: ${observationId}`);
    if (typeof review.evidence_support_state !== "string" || !supportStates.has(review.evidence_support_state as GeoAiEvidenceSupportState)) throw new Error(`evidence_support_state is unsupported: ${observationId}`);
    if (!Array.isArray(review.prohibited_claim_indexes) || review.prohibited_claim_indexes.length > 20) throw new Error(`prohibited_claim_indexes must be an array: ${observationId}`);
    const prompt = aiVisibilityPrompts.find((candidate) => candidate.id === observation.promptId)!;
    const prohibitedClaimIndexes = review.prohibited_claim_indexes.map((claimIndex) => {
      if (!Number.isInteger(claimIndex) || claimIndex < 0 || claimIndex >= prompt.prohibitedClaims.length) throw new Error(`Invalid prohibited claim index for ${observationId}`);
      return claimIndex as number;
    });
    if (new Set(prohibitedClaimIndexes).size !== prohibitedClaimIndexes.length) throw new Error(`Duplicate prohibited claim index for ${observationId}`);
    return {
      observationId,
      factualErrorSeverity,
      evidenceSupportState: review.evidence_support_state as GeoAiEvidenceSupportState,
      prohibitedClaimIndexes: [...prohibitedClaimIndexes].sort((a, b) => a - b),
    };
  });
  if (new Set(observationReviews.map((item) => item.observationId)).size !== observationReviews.length) throw new Error("observation_reviews must contain unique observation IDs");

  return {
    schemaVersion: geoAiReviewWaveVersion,
    waveId,
    observedFrom,
    observedTo,
    reviewedAt,
    promptRegistryFingerprint: expectedFingerprint,
    providerReceipts: [...providerReceipts].sort((a, b) => a.provider.localeCompare(b.provider)),
    observationReviews: [...observationReviews].sort((a, b) => a.observationId.localeCompare(b.observationId)),
  };
};

const waveObservations = (wave: GeoAiReviewWave, observations: AiVisibilityObservation[]) => {
  const ids = new Set(wave.observationReviews.map((item) => item.observationId));
  return observations.filter((item) => ids.has(item.id) && !item.synthetic);
};

const severityWeight: Record<GeoAiFactualErrorSeverity, number> = { none: 0, low: 1, medium: 3, high: 7, critical: 12 };

export const buildGeoAiReviewWaveReport = (wave: GeoAiReviewWave, observations: AiVisibilityObservation[]) => {
  const selected = waveObservations(wave, observations);
  const reviews = new Map(wave.observationReviews.map((item) => [item.observationId, item]));
  const evaluated = selected.map((item) => ({ observation: item, evaluation: evaluateAiVisibilityObservation(item), review: reviews.get(item.id)! }));
  const providerRows = wave.providerReceipts.map((receipt) => {
    const rows = evaluated.filter((item) => item.observation.provider === receipt.provider);
    const mentions = rows.filter((item) => item.observation.brandMentioned);
    const linked = rows.filter((item) => item.observation.linkedCitation);
    const canonical = rows.filter((item) => item.evaluation.citationAlignment === "canonical_owner");
    const wrongOwner = rows.filter((item) => item.evaluation.citationAlignment === "other_hermes_owner");
    const unmapped = rows.filter((item) => item.evaluation.citationAlignment === "unmapped_hermes_path");
    const noCitationMentions = mentions.filter((item) => !item.observation.linkedCitation);
    const factualErrors = rows.filter((item) => item.observation.factualError);
    const supported = rows.filter((item) => item.review.evidenceSupportState === "supported");
    const prohibitedOccurrences = rows.reduce((sum, item) => sum + item.review.prohibitedClaimIndexes.length, 0);
    const entityApplicable = mentions.filter((item) => item.observation.entityAccuracy !== "not_applicable");
    const descriptionApplicable = mentions.filter((item) => item.observation.descriptionAccuracy !== "not_applicable");
    return {
      provider: receipt.provider,
      observations: rows.length,
      mentions: mentions.length,
      linkedCitations: linked.length,
      canonicalOwnerCitations: canonical.length,
      wrongHermesOwnerCitations: wrongOwner.length,
      unmappedHermesPathCitations: unmapped.length,
      mentionWithoutCitation: noCitationMentions.length,
      citationMatchRate: rate(canonical.length, linked.length),
      wrongHermesOwnerCitationRate: rate(wrongOwner.length, linked.length),
      unmappedHermesPathCitationRate: rate(unmapped.length, linked.length),
      noCitationMentionRate: rate(noCitationMentions.length, mentions.length),
      factualErrors: factualErrors.length,
      factualSeverityScore: factualErrors.reduce((sum, item) => sum + severityWeight[item.review.factualErrorSeverity], 0),
      evidenceSupportedRate: rate(supported.length, rows.length),
      prohibitedClaimOccurrences: prohibitedOccurrences,
      competitorInclusionRate: rate(rows.filter((item) => item.observation.competitors.length > 0).length, rows.length),
      entityAccuracyRate: rate(entityApplicable.filter((item) => item.observation.entityAccuracy === "accurate").length, entityApplicable.length),
      descriptionAccuracyRate: rate(descriptionApplicable.filter((item) => item.observation.descriptionAccuracy === "accurate").length, descriptionApplicable.length),
    };
  });

  const providerSet = wave.providerReceipts.map((item) => item.provider).sort();
  const observedPairs = new Set(selected.map((item) => `${item.promptId}|${item.provider}`));
  const providerCoverageDebt = geoPromptOwnerRegistry.map((owner) => {
    const missingPairs = owner.promptIds.flatMap((promptId) => providerSet
      .filter((provider) => !observedPairs.has(`${promptId}|${provider}`))
      .map((provider) => ({ promptId, provider })));
    return { canonicalOwner: owner.canonicalOwner, expectedPairs: owner.promptIds.length * providerSet.length, missingPairs, debtCount: missingPairs.length };
  }).filter((item) => item.debtCount > 0).sort((a, b) => b.debtCount - a.debtCount || a.canonicalOwner.localeCompare(b.canonicalOwner));

  const asOfMs = Date.parse(wave.reviewedAt);
  const latestByPair = new Map<string, AiVisibilityObservation>();
  for (const item of selected) {
    const key = `${item.promptId}|${item.provider}`;
    const current = latestByPair.get(key);
    if (!current || Date.parse(item.observedAt) > Date.parse(current.observedAt)) latestByPair.set(key, item);
  }
  const staleEvidencePriority = [...latestByPair.values()].map((observation) => {
    const prompt = aiVisibilityPrompts.find((item) => item.id === observation.promptId)!;
    const ageDays = Math.floor((asOfMs - Date.parse(observation.observedAt)) / dayMs);
    const cadenceDays = prompt.cadence === "weekly" ? 7 : 28;
    const review = reviews.get(observation.id)!;
    const evaluation = evaluateAiVisibilityObservation(observation);
    const overdueDays = Math.max(0, ageDays - cadenceDays);
    const riskScore = overdueDays + severityWeight[review.factualErrorSeverity] * 3 + (evaluation.citationAlignment !== "canonical_owner" ? 8 : 0) + (review.evidenceSupportState === "unsupported" ? 8 : review.evidenceSupportState === "partial" ? 3 : 0) + review.prohibitedClaimIndexes.length * 10;
    return { canonicalOwner: evaluation.canonicalOwner, promptId: observation.promptId, provider: observation.provider, ageDays, cadenceDays, overdueDays, riskScore };
  }).filter((item) => item.overdueDays > 0 || item.riskScore > 0).sort((a, b) => b.riskScore - a.riskScore || a.promptId.localeCompare(b.promptId));

  return {
    schemaVersion: wave.schemaVersion,
    waveId: wave.waveId,
    observedFrom: wave.observedFrom,
    observedTo: wave.observedTo,
    windowDays: inclusiveDays(wave.observedFrom, wave.observedTo),
    reviewedAt: wave.reviewedAt,
    promptRegistryFingerprint: wave.promptRegistryFingerprint,
    providers: providerSet,
    observationIds: selected.map((item) => item.id).sort(),
    coverageKeys: selected.map((item) => `${item.promptId}|${item.provider}`).sort(),
    providerRows,
    providerCoverageDebt,
    staleEvidencePriority,
  };
};

export const compareGeoAiReviewWaveReports = (
  previous: ReturnType<typeof buildGeoAiReviewWaveReport>,
  current: ReturnType<typeof buildGeoAiReviewWaveReport>,
) => {
  const reasons: string[] = [];
  if (previous.promptRegistryFingerprint !== current.promptRegistryFingerprint) reasons.push("prompt_registry_changed");
  if (previous.windowDays !== current.windowDays) reasons.push("window_length_changed");
  if (previous.providers.join("|") !== current.providers.join("|")) reasons.push("provider_set_changed");
  if (previous.coverageKeys.join("|") !== current.coverageKeys.join("|")) reasons.push("prompt_provider_coverage_changed");
  if (Date.parse(`${current.observedFrom}T00:00:00Z`) <= Date.parse(`${previous.observedTo}T00:00:00Z`)) reasons.push("waves_overlap_or_out_of_order");
  if (reasons.length > 0) return { state: "not_comparable" as GeoAiWaveComparisonState, reasons, providerTrends: [] };
  const previousByProvider = new Map(previous.providerRows.map((item) => [item.provider, item]));
  return {
    state: "comparable" as GeoAiWaveComparisonState,
    reasons: [],
    providerTrends: current.providerRows.map((item) => {
      const prior = previousByProvider.get(item.provider)!;
      return {
        provider: item.provider,
        competitorInclusionRateDelta: Number((item.competitorInclusionRate - prior.competitorInclusionRate).toFixed(1)),
        entityAccuracyRateDelta: Number((item.entityAccuracyRate - prior.entityAccuracyRate).toFixed(1)),
        descriptionAccuracyRateDelta: Number((item.descriptionAccuracyRate - prior.descriptionAccuracyRate).toFixed(1)),
        citationMatchRateDelta: Number((item.citationMatchRate - prior.citationMatchRate).toFixed(1)),
      };
    }),
  };
};
