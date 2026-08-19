import {
  aiVisibilityPrompts,
  type AiVisibilityPrompt,
} from "./ai-visibility-scorecard.ts";
import {
  buildGeoAnswerSchema,
  validateGeoAnswerSurface,
  type GeoAnswerSurface,
} from "./geo-answer-contract.ts";
import { geoCarHaulingAnswerCandidate } from "./geo-car-hauling-answer-candidate.ts";
import { geoPromptOwnerRegistry } from "./geo-prompt-owner-registry.ts";

export type GeoAnswerOwnerGap =
  | "answer_surface_missing"
  | "answer_surface_invalid"
  | "expected_fact_review_missing"
  | "expected_fact_coverage_incomplete"
  | "prohibited_claim_review_missing"
  | "prohibited_claim_coverage_incomplete"
  | "entity_definition_incomplete"
  | "evidence_source_module_incomplete"
  | "comparison_surface_incomplete"
  | "question_answer_surface_incomplete"
  | "concise_answer_incomplete"
  | "long_form_support_incomplete"
  | "schema_semantic_parity_incomplete";

export interface GeoReviewedPromptFactCoverage {
  promptId: string;
  surfaceId: string;
  coveredExpectedFacts: string[];
  coveredProhibitedClaims: string[];
  reviewedAt: string;
  reviewerLabel: string;
}

export interface GeoReviewedPromptIntentGroup {
  promptId: string;
  intentGroupKey: string;
  canonicalOwner: string;
}

export interface GeoPromptIntentOwnerConflict {
  intentGroupKey: string;
  promptIds: string[];
  canonicalOwners: string[];
}

export interface GeoAnswerOwnerAuditRecord {
  canonicalOwner: string;
  promptIds: string[];
  promptIntents: string[];
  surfaceId: string | null;
  surfacePresent: boolean;
  surfaceValid: boolean;
  expectedFacts: number;
  expectedFactsCovered: number;
  expectedFactCoverageRate: number;
  prohibitedClaims: number;
  prohibitedClaimsCovered: number;
  prohibitedClaimCoverageRate: number;
  entityDefinitionsComplete: boolean;
  evidenceSourceModuleComplete: boolean;
  comparisonSurfaceRequired: boolean;
  comparisonSurfaceComplete: boolean;
  questionAnswerSurfaceRequired: boolean;
  questionAnswerSurfaceComplete: boolean;
  conciseAnswerComplete: boolean;
  longFormSupportComplete: boolean;
  schemaSemanticParityComplete: boolean;
  gaps: GeoAnswerOwnerGap[];
  evidenceGapCount: number;
}

export interface GeoAnswerOwnerRemediationItem {
  canonicalOwner: string;
  promptIds: string[];
  evidenceGapCount: number;
  totalGapCount: number;
  gaps: GeoAnswerOwnerGap[];
  priorityReason: string;
}

export const geoProductionAnswerCandidates: GeoAnswerSurface[] = [geoCarHaulingAnswerCandidate];

export const geoReviewedPromptFactCoverage: GeoReviewedPromptFactCoverage[] = [
  {
    promptId: "LOG-01",
    surfaceId: geoCarHaulingAnswerCandidate.id,
    coveredExpectedFacts: [
      "Hermes provides reviewed car-hauling dispatch support.",
      "The carrier retains final operating and booking control.",
    ],
    coveredProhibitedClaims: [
      "No ranking, traffic, lead, revenue, employment, income, load, rate, capacity, or result guarantee.",
      "No invented office, terminal, authority, customer, partner, student count, review, or certification claim.",
    ],
    reviewedAt: "2026-08-18T16:00:00Z",
    reviewerLabel: "geo_contract_review",
  },
];

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 100 : Number(((value / denominator) * 100).toFixed(1));

const normalized = (values: string[]) => new Set(values.map((value) => value.trim()));

const surfaceValidation = (surface: GeoAnswerSurface | undefined) => {
  if (!surface) return false;
  try {
    validateGeoAnswerSurface(surface);
    return true;
  } catch {
    return false;
  }
};

const conciseAnswerComplete = (surface: GeoAnswerSurface | undefined) => {
  if (!surface) return false;
  const text = surface.layers.shortAnswer.trim();
  return text.length >= 40 && text.length <= 520 && /[.!?]$/.test(text);
};

const longFormSupportComplete = (surface: GeoAnswerSurface | undefined) =>
  Boolean(
    surface &&
      surface.layers.why.length >= 2 &&
      surface.layers.whatItMeansForYou.length >= 2 &&
      surface.layers.howToApply.length >= 2,
  );

const entityDefinitionsComplete = (surface: GeoAnswerSurface | undefined) =>
  Boolean(
    surface &&
      surface.entities.length > 0 &&
      surface.entities.every(
        (entity) =>
          entity.name.trim() &&
          entity.description.trim() &&
          entity.relationToHermes.trim() &&
          entity.whyItMatters.trim(),
      ),
  );

const evidenceSourceModuleComplete = (surface: GeoAnswerSurface | undefined) => {
  if (!surface || surface.evidence.length === 0 || surface.claims.length === 0) return false;
  const evidenceIds = new Set(surface.evidence.map((item) => item.id));
  const claimIds = new Set(surface.claims.map((item) => item.id));
  if (!surface.layers.evidenceClaimIds.every((id) => claimIds.has(id))) return false;
  return surface.claims.every(
    (claim) =>
      claim.evidenceIds.length > 0 && claim.evidenceIds.every((evidenceId) => evidenceIds.has(evidenceId)),
  );
};

const comparisonSurfaceComplete = (surface: GeoAnswerSurface | undefined) =>
  Boolean(
    surface &&
      conciseAnswerComplete(surface) &&
      surface.layers.why.length >= 2 &&
      surface.layers.whatItMeansForYou.length >= 2 &&
      surface.relationships.length > 0 &&
      surface.layers.nextAction.href.startsWith("/"),
  );

const questionAnswerSurfaceComplete = (surface: GeoAnswerSurface | undefined) =>
  Boolean(
    surface &&
      conciseAnswerComplete(surface) &&
      surface.layers.howToApply.length >= 2 &&
      surface.layers.evidenceClaimIds.length > 0 &&
      evidenceSourceModuleComplete(surface),
  );

export const checkGeoAnswerSchemaSemanticParity = (surface: GeoAnswerSurface | undefined) => {
  if (!surface || !surfaceValidation(surface)) return false;
  const schema = buildGeoAnswerSchema(surface) as {
    name?: unknown;
    mainEntity?: { name?: unknown; acceptedAnswer?: { text?: unknown } };
    about?: Array<{ name?: unknown }>;
  };
  const schemaEntityNames = (schema.about ?? []).map((item) => String(item.name ?? "")).sort();
  const surfaceEntityNames = surface.entities.map((item) => item.name).sort();
  return (
    schema.name === surface.question &&
    schema.mainEntity?.name === surface.question &&
    schema.mainEntity?.acceptedAnswer?.text === surface.layers.shortAnswer &&
    JSON.stringify(schemaEntityNames) === JSON.stringify(surfaceEntityNames)
  );
};

export const detectReviewedPromptIntentOwnerConflicts = (
  records: GeoReviewedPromptIntentGroup[],
): GeoPromptIntentOwnerConflict[] => {
  const groups = new Map<string, GeoReviewedPromptIntentGroup[]>();
  for (const record of records) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,79}$/.test(record.intentGroupKey)) {
      throw new Error(`intentGroupKey must be an opaque reviewed identifier: ${record.intentGroupKey}`);
    }
    const prompt = aiVisibilityPrompts.find((item) => item.id === record.promptId);
    if (!prompt) throw new Error(`Unknown AI visibility prompt: ${record.promptId}`);
    if (prompt.canonicalOwner !== record.canonicalOwner) {
      throw new Error(`Reviewed intent group owner must match prompt registry owner for ${record.promptId}`);
    }
    groups.set(record.intentGroupKey, [...(groups.get(record.intentGroupKey) ?? []), record]);
  }

  return [...groups.entries()]
    .map(([intentGroupKey, group]) => ({
      intentGroupKey,
      promptIds: [...new Set(group.map((item) => item.promptId))].sort(),
      canonicalOwners: [...new Set(group.map((item) => item.canonicalOwner))].sort(),
    }))
    .filter((item) => item.canonicalOwners.length > 1)
    .sort((left, right) => left.intentGroupKey.localeCompare(right.intentGroupKey));
};

const coverageForPrompts = (
  prompts: AiVisibilityPrompt[],
  surface: GeoAnswerSurface | undefined,
  reviews: GeoReviewedPromptFactCoverage[],
) => {
  const expectedFacts = [...new Set(prompts.flatMap((prompt) => prompt.expectedFacts))];
  const prohibitedClaims = [...new Set(prompts.flatMap((prompt) => prompt.prohibitedClaims))];
  const relevantReviews = surface
    ? reviews.filter(
        (review) => prompts.some((prompt) => prompt.id === review.promptId) && review.surfaceId === surface.id,
      )
    : [];
  const coveredExpected = normalized(relevantReviews.flatMap((review) => review.coveredExpectedFacts));
  const coveredProhibited = normalized(relevantReviews.flatMap((review) => review.coveredProhibitedClaims));

  for (const review of relevantReviews) {
    const prompt = prompts.find((item) => item.id === review.promptId)!;
    const expected = normalized(prompt.expectedFacts);
    const prohibited = normalized(prompt.prohibitedClaims);
    for (const fact of review.coveredExpectedFacts) {
      if (!expected.has(fact.trim())) throw new Error(`Reviewed expected fact is not registered for ${review.promptId}`);
    }
    for (const claim of review.coveredProhibitedClaims) {
      if (!prohibited.has(claim.trim())) throw new Error(`Reviewed prohibited claim is not registered for ${review.promptId}`);
    }
    if (!Number.isFinite(Date.parse(review.reviewedAt))) throw new Error(`Invalid reviewedAt for ${review.promptId}`);
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,63}$/.test(review.reviewerLabel)) {
      throw new Error(`reviewerLabel must be an opaque reviewer label for ${review.promptId}`);
    }
  }

  const expectedFactsCovered = expectedFacts.filter((fact) => coveredExpected.has(fact.trim())).length;
  const prohibitedClaimsCovered = prohibitedClaims.filter((claim) => coveredProhibited.has(claim.trim())).length;
  return {
    expectedFacts: expectedFacts.length,
    expectedFactsCovered,
    expectedFactCoverageRate: rate(expectedFactsCovered, expectedFacts.length),
    prohibitedClaims: prohibitedClaims.length,
    prohibitedClaimsCovered,
    prohibitedClaimCoverageRate: rate(prohibitedClaimsCovered, prohibitedClaims.length),
    hasExpectedReview: relevantReviews.some((review) => review.coveredExpectedFacts.length > 0),
    hasProhibitedReview: relevantReviews.some((review) => review.coveredProhibitedClaims.length > 0),
  };
};

export const buildGeoAnswerOwnerAudit = ({
  surfaces = geoProductionAnswerCandidates,
  factCoverage = geoReviewedPromptFactCoverage,
}: {
  surfaces?: GeoAnswerSurface[];
  factCoverage?: GeoReviewedPromptFactCoverage[];
} = {}): GeoAnswerOwnerAuditRecord[] => {
  const surfaceIds = surfaces.map((surface) => surface.id);
  if (new Set(surfaceIds).size !== surfaceIds.length) throw new Error("GEO answer surface IDs must be unique");
  const slugs = surfaces.map((surface) => surface.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Only one reviewed answer surface may own a canonical slug");

  return geoPromptOwnerRegistry
    .map((owner) => {
      const prompts = aiVisibilityPrompts.filter((prompt) => owner.promptIds.includes(prompt.id));
      const surface = surfaces.find((candidate) => candidate.slug === owner.canonicalOwner);
      const surfaceValid = surfaceValidation(surface);
      const coverage = coverageForPrompts(prompts, surface, factCoverage);
      const comparisonSurfaceRequired = prompts.some((prompt) => prompt.intent === "comparison");
      const questionAnswerSurfaceRequired = prompts.some(
        (prompt) => prompt.intent === "educational" || prompt.intent === "problem_solving",
      );
      const comparisonComplete = !comparisonSurfaceRequired || comparisonSurfaceComplete(surface);
      const qaComplete = !questionAnswerSurfaceRequired || questionAnswerSurfaceComplete(surface);
      const entityComplete = entityDefinitionsComplete(surface);
      const evidenceComplete = evidenceSourceModuleComplete(surface);
      const conciseComplete = conciseAnswerComplete(surface);
      const longFormComplete = longFormSupportComplete(surface);
      const parityComplete = checkGeoAnswerSchemaSemanticParity(surface);
      const gaps: GeoAnswerOwnerGap[] = [];

      if (!surface) gaps.push("answer_surface_missing");
      else if (!surfaceValid) gaps.push("answer_surface_invalid");
      if (!coverage.hasExpectedReview) gaps.push("expected_fact_review_missing");
      else if (coverage.expectedFactCoverageRate < 100) gaps.push("expected_fact_coverage_incomplete");
      if (!coverage.hasProhibitedReview) gaps.push("prohibited_claim_review_missing");
      else if (coverage.prohibitedClaimCoverageRate < 100) gaps.push("prohibited_claim_coverage_incomplete");
      if (!entityComplete) gaps.push("entity_definition_incomplete");
      if (!evidenceComplete) gaps.push("evidence_source_module_incomplete");
      if (!comparisonComplete) gaps.push("comparison_surface_incomplete");
      if (!qaComplete) gaps.push("question_answer_surface_incomplete");
      if (!conciseComplete) gaps.push("concise_answer_incomplete");
      if (!longFormComplete) gaps.push("long_form_support_incomplete");
      if (!parityComplete) gaps.push("schema_semantic_parity_incomplete");

      const evidenceGaps = new Set<GeoAnswerOwnerGap>([
        "expected_fact_review_missing",
        "expected_fact_coverage_incomplete",
        "prohibited_claim_review_missing",
        "prohibited_claim_coverage_incomplete",
        "evidence_source_module_incomplete",
      ]);

      return {
        canonicalOwner: owner.canonicalOwner,
        promptIds: owner.promptIds,
        promptIntents: [...new Set(prompts.map((prompt) => prompt.intent))].sort(),
        surfaceId: surface?.id ?? null,
        surfacePresent: Boolean(surface),
        surfaceValid,
        expectedFacts: coverage.expectedFacts,
        expectedFactsCovered: coverage.expectedFactsCovered,
        expectedFactCoverageRate: coverage.expectedFactCoverageRate,
        prohibitedClaims: coverage.prohibitedClaims,
        prohibitedClaimsCovered: coverage.prohibitedClaimsCovered,
        prohibitedClaimCoverageRate: coverage.prohibitedClaimCoverageRate,
        entityDefinitionsComplete: entityComplete,
        evidenceSourceModuleComplete: evidenceComplete,
        comparisonSurfaceRequired,
        comparisonSurfaceComplete: comparisonComplete,
        questionAnswerSurfaceRequired,
        questionAnswerSurfaceComplete: qaComplete,
        conciseAnswerComplete: conciseComplete,
        longFormSupportComplete: longFormComplete,
        schemaSemanticParityComplete: parityComplete,
        gaps,
        evidenceGapCount: gaps.filter((gap) => evidenceGaps.has(gap)).length,
      };
    })
    .sort((left, right) => left.canonicalOwner.localeCompare(right.canonicalOwner));
};

export const buildGeoAnswerOwnerRemediation = (
  audit: GeoAnswerOwnerAuditRecord[] = buildGeoAnswerOwnerAudit(),
): GeoAnswerOwnerRemediationItem[] =>
  audit
    .filter((record) => record.gaps.length > 0)
    .map((record) => ({
      canonicalOwner: record.canonicalOwner,
      promptIds: record.promptIds,
      evidenceGapCount: record.evidenceGapCount,
      totalGapCount: record.gaps.length,
      gaps: record.gaps,
      priorityReason:
        record.evidenceGapCount > 0
          ? "Evidence/review gaps exist; resolve truth coverage before design refinement."
          : "No evidence gap is recorded; address the remaining structural answer-contract gaps.",
    }))
    .sort(
      (left, right) =>
        right.evidenceGapCount - left.evidenceGapCount ||
        right.totalGapCount - left.totalGapCount ||
        left.canonicalOwner.localeCompare(right.canonicalOwner),
    );
