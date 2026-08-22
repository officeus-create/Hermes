import type { AiVisibilityProvider } from "./ai-visibility-scorecard.ts";
import {
  validateGeoAiReferralAggregates,
  type GeoAiReferralAggregate,
  type GeoAiReferralAttributionState,
  type GeoAiReferralEvidenceClass,
} from "./geo-ai-referral-measurement.ts";
import type { GeoWindowDays } from "./geo-measurement-layer.ts";

const allowedFields = new Set([
  "window_days",
  "canonical_owner",
  "attribution_state",
  "provider",
  "landing_sessions",
  "cta_sessions",
  "intake_sessions",
  "evidence_class",
]);
const windows = new Set<GeoWindowDays>([7, 28, 90]);
const attributionStates = new Set<GeoAiReferralAttributionState>([
  "provider_identified",
  "ai_referral_unresolved",
]);
const providers = new Set<AiVisibilityProvider>([
  "chatgpt",
  "gemini",
  "copilot",
  "perplexity",
  "google_ai_mode",
  "other",
]);
const evidenceClasses = new Set<GeoAiReferralEvidenceClass>([
  "platform_verified",
  "owner_provided_handoff",
  "unverified",
]);

const asRecord = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("GEO AI referral row must be an object");
  }
  return input as Record<string, unknown>;
};

const assertExactFields = (row: Record<string, unknown>) => {
  for (const key of Object.keys(row)) {
    if (!allowedFields.has(key)) throw new Error(`Unsupported GEO AI referral field: ${key}`);
  }
  for (const field of allowedFields) {
    if (!(field in row)) throw new Error(`Missing GEO AI referral field: ${field}`);
  }
};

const enumValue = <T extends string | number>(row: Record<string, unknown>, field: string, values: Set<T>): T => {
  const value = row[field] as T;
  if (!values.has(value)) throw new Error(`${field} has unsupported value: ${String(value)}`);
  return value;
};

const integer = (row: Record<string, unknown>, field: string) => {
  const value = row[field];
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
  return value as number;
};

const ownerPath = (row: Record<string, unknown>) => {
  if (typeof row.canonical_owner !== "string") throw new Error("canonical_owner must be a string");
  return row.canonical_owner.trim();
};

export const importGeoAiReferralRow = (input: unknown): GeoAiReferralAggregate => {
  const row = asRecord(input);
  assertExactFields(row);
  const attributionState = enumValue(row, "attribution_state", attributionStates);
  const providerValue = row.provider;
  let provider: AiVisibilityProvider | null = null;
  if (providerValue !== null) {
    if (typeof providerValue !== "string" || !providers.has(providerValue as AiVisibilityProvider)) {
      throw new Error(`provider has unsupported value: ${String(providerValue)}`);
    }
    provider = providerValue as AiVisibilityProvider;
  }

  const result: GeoAiReferralAggregate = {
    windowDays: enumValue(row, "window_days", windows),
    canonicalOwner: ownerPath(row),
    attributionState,
    provider,
    landingSessions: integer(row, "landing_sessions"),
    ctaSessions: integer(row, "cta_sessions"),
    intakeSessions: integer(row, "intake_sessions"),
    evidenceClass: enumValue(row, "evidence_class", evidenceClasses),
  };

  validateGeoAiReferralAggregates([result]);
  return result;
};

export const importGeoAiReferralBatch = (inputs: unknown[]) => {
  if (!Array.isArray(inputs)) throw new Error("GEO AI referral batch must be an array");
  if (inputs.length > 5000) throw new Error("GEO AI referral batch must contain at most 5000 rows");
  return inputs.map((input, index) => {
    try {
      return importGeoAiReferralRow(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`GEO AI referral row ${index + 1}: ${message}`);
    }
  });
};
