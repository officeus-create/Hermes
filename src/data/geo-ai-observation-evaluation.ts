import {
  aiVisibilityPrompts,
  type AiVisibilityObservation,
  type AiVisibilityProvider,
} from "./ai-visibility-scorecard.ts";
import { findGeoOwnerForPrompt, geoPromptOwnerRegistry } from "./geo-prompt-owner-registry.ts";

export type GeoAiCitationAlignment =
  | "canonical_owner"
  | "other_hermes_owner"
  | "unmapped_hermes_path"
  | "no_linked_citation";

export interface GeoAiObservationEvaluation {
  observationId: string;
  promptId: string;
  provider: AiVisibilityProvider;
  canonicalOwner: string;
  citedPath: string;
  citationAlignment: GeoAiCitationAlignment;
  realObservation: boolean;
  requiresOwnerReview: boolean;
}

export interface GeoAiOwnerVisibilityRecord {
  canonicalOwner: string;
  registeredPromptIds: string[];
  observedPromptIds: string[];
  missingPromptIds: string[];
  providersObserved: AiVisibilityProvider[];
  observations: number;
  mentions: number;
  linkedCitations: number;
  canonicalOwnerCitations: number;
  otherHermesOwnerCitations: number;
  unmappedHermesCitations: number;
  explicitOrConsideredRecommendations: number;
  factualErrors: number;
  ownerCitationRate: number;
  citationOwnerAccuracyRate: number;
}

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const assertNonEmpty = (label: string, value: string) => {
  if (!value.trim()) throw new Error(`${label} must not be empty`);
};

export const validateAiVisibilityObservationForGeo = (observation: AiVisibilityObservation) => {
  const prompt = aiVisibilityPrompts.find((item) => item.id === observation.promptId);
  if (!prompt) throw new Error(`Unknown AI visibility prompt: ${observation.promptId}`);
  assertNonEmpty("observation.id", observation.id);
  assertNonEmpty("observation.reviewer", observation.reviewer);
  assertNonEmpty("observation.evidenceReference", observation.evidenceReference);
  if (!Number.isFinite(Date.parse(observation.observedAt))) {
    throw new Error(`Observation ${observation.id} has invalid observedAt`);
  }

  if (observation.linkedCitation) {
    if (!observation.citedPath.startsWith("/")) {
      throw new Error(`Observation ${observation.id} linkedCitation requires a site-relative citedPath`);
    }
  } else if (observation.citedPath) {
    throw new Error(`Observation ${observation.id} must not set citedPath without linkedCitation`);
  }

  if (!observation.brandMentioned && observation.recommendation !== "none") {
    throw new Error(`Observation ${observation.id} cannot recommend or source Hermes without a brand mention`);
  }

  if (!observation.brandMentioned) {
    if (observation.entityAccuracy !== "not_applicable" || observation.descriptionAccuracy !== "not_applicable") {
      throw new Error(`Observation ${observation.id} without a brand mention must use not_applicable accuracy states`);
    }
  }

  return observation;
};

export const evaluateAiVisibilityObservation = (
  observation: AiVisibilityObservation,
): GeoAiObservationEvaluation => {
  validateAiVisibilityObservationForGeo(observation);
  const canonicalOwner = findGeoOwnerForPrompt(observation.promptId).canonicalOwner;

  let citationAlignment: GeoAiCitationAlignment = "no_linked_citation";
  if (observation.linkedCitation) {
    if (observation.citedPath === canonicalOwner) {
      citationAlignment = "canonical_owner";
    } else if (geoPromptOwnerRegistry.some((owner) => owner.canonicalOwner === observation.citedPath)) {
      citationAlignment = "other_hermes_owner";
    } else {
      citationAlignment = "unmapped_hermes_path";
    }
  }

  return {
    observationId: observation.id,
    promptId: observation.promptId,
    provider: observation.provider,
    canonicalOwner,
    citedPath: observation.citedPath,
    citationAlignment,
    realObservation: !observation.synthetic,
    requiresOwnerReview:
      !observation.synthetic &&
      observation.linkedCitation &&
      citationAlignment !== "canonical_owner",
  };
};

export const buildGeoAiOwnerVisibility = (
  observations: AiVisibilityObservation[],
): GeoAiOwnerVisibilityRecord[] => {
  const realObservations = observations.filter((item) => !item.synthetic);
  const evaluations = realObservations.map(evaluateAiVisibilityObservation);

  return geoPromptOwnerRegistry.map((owner) => {
    const ownerObservations = realObservations.filter((item) => owner.promptIds.includes(item.promptId));
    const ownerEvaluations = evaluations.filter((item) => item.canonicalOwner === owner.canonicalOwner);
    const observedPromptIds = [...new Set(ownerObservations.map((item) => item.promptId))];
    const linkedCitations = ownerObservations.filter((item) => item.linkedCitation).length;
    const canonicalOwnerCitations = ownerEvaluations.filter((item) => item.citationAlignment === "canonical_owner").length;
    const otherHermesOwnerCitations = ownerEvaluations.filter((item) => item.citationAlignment === "other_hermes_owner").length;
    const unmappedHermesCitations = ownerEvaluations.filter((item) => item.citationAlignment === "unmapped_hermes_path").length;

    return {
      canonicalOwner: owner.canonicalOwner,
      registeredPromptIds: owner.promptIds,
      observedPromptIds,
      missingPromptIds: owner.promptIds.filter((promptId) => !observedPromptIds.includes(promptId)),
      providersObserved: [...new Set(ownerObservations.map((item) => item.provider))],
      observations: ownerObservations.length,
      mentions: ownerObservations.filter((item) => item.brandMentioned).length,
      linkedCitations,
      canonicalOwnerCitations,
      otherHermesOwnerCitations,
      unmappedHermesCitations,
      explicitOrConsideredRecommendations: ownerObservations.filter((item) =>
        item.recommendation === "considered_option" || item.recommendation === "explicit_recommendation",
      ).length,
      factualErrors: ownerObservations.filter((item) => item.factualError).length,
      ownerCitationRate: rate(canonicalOwnerCitations, ownerObservations.length),
      citationOwnerAccuracyRate: rate(canonicalOwnerCitations, linkedCitations),
    };
  });
};

export const geoAiOwnerReviewQueue = (observations: AiVisibilityObservation[]) =>
  observations
    .filter((item) => !item.synthetic)
    .map(evaluateAiVisibilityObservation)
    .filter((item) => item.requiresOwnerReview);