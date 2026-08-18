import type {
  AccuracyState,
  AiVisibilityObservation,
  AiVisibilityProvider,
  RecommendationStrength,
} from "./ai-visibility-scorecard.ts";
import { validateAiVisibilityObservationForGeo } from "./geo-ai-observation-evaluation.ts";

const allowedFields = new Set([
  "id",
  "prompt_id",
  "provider",
  "observed_at",
  "reviewer_label",
  "brand_mentioned",
  "linked_citation",
  "cited_path",
  "recommendation",
  "entity_accuracy",
  "description_accuracy",
  "factual_error",
  "competitors",
  "corrective_action",
  "evidence_reference",
]);

const providers = new Set<AiVisibilityProvider>([
  "chatgpt",
  "gemini",
  "copilot",
  "perplexity",
  "google_ai_mode",
  "other",
]);
const recommendations = new Set<RecommendationStrength>([
  "none",
  "source_only",
  "considered_option",
  "explicit_recommendation",
]);
const accuracyStates = new Set<AccuracyState>([
  "not_applicable",
  "accurate",
  "partially_accurate",
  "inaccurate",
]);

const obviousEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const obviousPhone = /(?:\+?\d[\s().-]*){8,}/;
const forbiddenConversationKeys = /(conversation|response_text|raw_response|full_answer|transcript|message_body|prompt_response)/i;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const stringField = (
  row: Record<string, unknown>,
  field: string,
  { allowEmpty = false, maxLength = 500 }: { allowEmpty?: boolean; maxLength?: number } = {},
) => {
  const value = row[field];
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const trimmed = value.trim();
  if (!allowEmpty && !trimmed) throw new Error(`${field} must not be empty`);
  if (trimmed.length > maxLength) throw new Error(`${field} exceeds ${maxLength} characters`);
  return trimmed;
};

const booleanField = (row: Record<string, unknown>, field: string) => {
  if (typeof row[field] !== "boolean") throw new Error(`${field} must be boolean`);
  return row[field] as boolean;
};

const assertNoObviousPersonalData = (label: string, value: string) => {
  if (obviousEmail.test(value)) throw new Error(`${label} must not contain an email address`);
  if (obviousPhone.test(value)) throw new Error(`${label} must not contain a phone-like number`);
};

const enumField = <T extends string>(
  row: Record<string, unknown>,
  field: string,
  allowed: Set<T>,
): T => {
  const value = stringField(row, field, { maxLength: 64 }) as T;
  if (!allowed.has(value)) throw new Error(`${field} has unsupported value: ${value}`);
  return value;
};

const competitorField = (row: Record<string, unknown>) => {
  if (!Array.isArray(row.competitors)) throw new Error("competitors must be an array of public business labels");
  if (row.competitors.length > 20) throw new Error("competitors must contain at most 20 labels");

  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of row.competitors) {
    if (typeof value !== "string") throw new Error("competitor labels must be strings");
    const label = value.trim().replace(/\s+/g, " ");
    if (!label) continue;
    if (label.length > 120) throw new Error("competitor label exceeds 120 characters");
    assertNoObviousPersonalData("competitor label", label);
    const key = label.toLocaleLowerCase("en-US");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(label);
    }
  }
  return result;
};

export const importGeoAiObservationRow = (input: unknown): AiVisibilityObservation => {
  const row = asRecord(input, "AI visibility observation row");

  for (const key of Object.keys(row)) {
    if (forbiddenConversationKeys.test(key)) {
      throw new Error(`Raw AI conversation field is forbidden: ${key}`);
    }
    if (!allowedFields.has(key)) throw new Error(`Unsupported AI visibility import field: ${key}`);
  }
  for (const required of allowedFields) {
    if (!(required in row)) throw new Error(`Missing AI visibility import field: ${required}`);
  }

  const id = stringField(row, "id", { maxLength: 64 });
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,63}$/.test(id)) {
    throw new Error("id must be a safe opaque observation identifier");
  }

  const reviewer = stringField(row, "reviewer_label", { maxLength: 32 });
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/.test(reviewer)) {
    throw new Error("reviewer_label must be a pseudonymous role/opaque label, not a person name");
  }

  const correctiveAction = stringField(row, "corrective_action", { allowEmpty: true, maxLength: 500 });
  const evidenceReference = stringField(row, "evidence_reference", { maxLength: 240 });
  assertNoObviousPersonalData("corrective_action", correctiveAction);
  assertNoObviousPersonalData("evidence_reference", evidenceReference);

  const observation: AiVisibilityObservation = {
    id,
    promptId: stringField(row, "prompt_id", { maxLength: 32 }),
    provider: enumField(row, "provider", providers),
    observedAt: stringField(row, "observed_at", { maxLength: 40 }),
    reviewer,
    brandMentioned: booleanField(row, "brand_mentioned"),
    linkedCitation: booleanField(row, "linked_citation"),
    citedPath: stringField(row, "cited_path", { allowEmpty: true, maxLength: 300 }),
    recommendation: enumField(row, "recommendation", recommendations),
    entityAccuracy: enumField(row, "entity_accuracy", accuracyStates),
    descriptionAccuracy: enumField(row, "description_accuracy", accuracyStates),
    factualError: booleanField(row, "factual_error"),
    competitors: competitorField(row),
    correctiveAction,
    evidenceReference,
  };

  return validateAiVisibilityObservationForGeo(observation);
};

export const importGeoAiObservationBatch = (inputs: unknown[]): AiVisibilityObservation[] => {
  if (!Array.isArray(inputs)) throw new Error("AI visibility import batch must be an array");
  if (inputs.length > 1000) throw new Error("AI visibility import batch must contain at most 1000 rows");

  const rows = inputs.map((input, index) => {
    try {
      return importGeoAiObservationRow(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`AI visibility import row ${index + 1}: ${message}`);
    }
  });

  const ids = new Set<string>();
  const checkpoints = new Set<string>();
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`Duplicate AI visibility observation id: ${row.id}`);
    ids.add(row.id);

    const checkpoint = `${row.promptId}|${row.provider}|${new Date(row.observedAt).toISOString()}`;
    if (checkpoints.has(checkpoint)) {
      throw new Error(`Duplicate AI visibility prompt/provider/time checkpoint: ${checkpoint}`);
    }
    checkpoints.add(checkpoint);
  }

  return rows;
};
