import type { AiVisibilityObservation } from "./ai-visibility-scorecard.ts";
import {
  buildGeoMeasurementScorecard,
  type GeoMeasurementLayerInput,
  type GeoMeasurementScorecard,
  type GeoWindowDays,
} from "./geo-measurement-layer.ts";
import { findGeoOwnerForPrompt, geoPromptOwnerRegistry } from "./geo-prompt-owner-registry.ts";

export type GeoOwnerMeasurementLayer = "ai_visibility" | "search" | "funnel" | "outcomes";
export type GeoOwnerIntegrityGap =
  | "outcome_without_delivery_evidence"
  | "reviewed_exceeds_delivery_confirmed"
  | "qualified_exceeds_delivery_confirmed";
export type GeoOwnerReconciliationStatus = "complete" | "incomplete" | "inconsistent";

export interface GeoOwnerPromptCoverage {
  promptCount: number;
  promptIds: string[];
  directions: string[];
  languages: string[];
  intents: string[];
  geographies: string[];
  weeklyPromptCount: number;
  monthlyPromptCount: number;
}

export interface GeoOwnerMeasurementRecord {
  canonicalOwner: string;
  windowDays: GeoWindowDays;
  promptCoverage: GeoOwnerPromptCoverage;
  scorecard: GeoMeasurementScorecard;
  reconciliation: {
    status: GeoOwnerReconciliationStatus;
    missingLayers: GeoOwnerMeasurementLayer[];
    integrityGaps: GeoOwnerIntegrityGap[];
  };
}

const emptyPromptCoverage = (): GeoOwnerPromptCoverage => ({
  promptCount: 0,
  promptIds: [],
  directions: [],
  languages: [],
  intents: [],
  geographies: [],
  weeklyPromptCount: 0,
  monthlyPromptCount: 0,
});

const ownerForObservation = (observation: AiVisibilityObservation) =>
  findGeoOwnerForPrompt(observation.promptId).canonicalOwner;

const allCanonicalOwners = (input: GeoMeasurementLayerInput) => {
  const owners = new Set<string>(geoPromptOwnerRegistry.map((record) => record.canonicalOwner));
  input.search.forEach((row) => owners.add(row.pagePath));
  input.funnel.forEach((row) => owners.add(row.pagePath));
  input.outcomes.forEach((row) => owners.add(row.pagePath));

  // Validate every observation against the governed prompt registry, including
  // synthetic fixtures. Unknown prompt IDs must never silently enter reporting.
  input.aiObservations.forEach((observation) => owners.add(ownerForObservation(observation)));
  return [...owners].sort((left, right) => left.localeCompare(right));
};

const promptCoverageForOwner = (canonicalOwner: string): GeoOwnerPromptCoverage => {
  const owner = geoPromptOwnerRegistry.find((record) => record.canonicalOwner === canonicalOwner);
  if (!owner) return emptyPromptCoverage();
  return {
    promptCount: owner.promptCount,
    promptIds: owner.promptIds,
    directions: owner.directions,
    languages: owner.languages,
    intents: owner.intents,
    geographies: owner.geographies,
    weeklyPromptCount: owner.weeklyPromptCount,
    monthlyPromptCount: owner.monthlyPromptCount,
  };
};

const reconcileOwner = (
  scorecard: GeoMeasurementScorecard,
): GeoOwnerMeasurementRecord["reconciliation"] => {
  const missingLayers: GeoOwnerMeasurementLayer[] = [];
  if (scorecard.aiVisibility.observationsInWindow === 0) missingLayers.push("ai_visibility");
  if (scorecard.evidence.search.length === 0) missingLayers.push("search");
  if (scorecard.evidence.funnel.length === 0) missingLayers.push("funnel");
  if (scorecard.evidence.outcomes.length === 0) missingLayers.push("outcomes");

  const integrityGaps: GeoOwnerIntegrityGap[] = [];
  const deliveryConfirmed = scorecard.funnel.deliveryConfirmed;
  const reviewedInquiries = scorecard.leadQuality.reviewedInquiries;
  const qualifiedLeads = scorecard.leadQuality.qualifiedLeads;

  if (reviewedInquiries > 0 && deliveryConfirmed === 0) {
    integrityGaps.push("outcome_without_delivery_evidence");
  }
  if (deliveryConfirmed > 0 && reviewedInquiries > deliveryConfirmed) {
    integrityGaps.push("reviewed_exceeds_delivery_confirmed");
  }
  if (deliveryConfirmed > 0 && qualifiedLeads > deliveryConfirmed) {
    integrityGaps.push("qualified_exceeds_delivery_confirmed");
  }

  return {
    status: integrityGaps.length > 0 ? "inconsistent" : missingLayers.length > 0 ? "incomplete" : "complete",
    missingLayers,
    integrityGaps,
  };
};

export const buildGeoOwnerMeasurement = (
  input: GeoMeasurementLayerInput,
  windowDays: GeoWindowDays,
): GeoOwnerMeasurementRecord[] => {
  const owners = allCanonicalOwners(input);

  return owners.map((canonicalOwner) => {
    const ownerInput: GeoMeasurementLayerInput = {
      ...input,
      aiObservations: input.aiObservations.filter(
        (observation) => ownerForObservation(observation) === canonicalOwner,
      ),
      search: input.search.filter(
        (row) => row.windowDays === windowDays && row.pagePath === canonicalOwner,
      ),
      funnel: input.funnel.filter(
        (row) => row.windowDays === windowDays && row.pagePath === canonicalOwner,
      ),
      outcomes: input.outcomes.filter(
        (row) => row.windowDays === windowDays && row.pagePath === canonicalOwner,
      ),
    };

    const scorecard = buildGeoMeasurementScorecard(ownerInput, windowDays);
    return {
      canonicalOwner,
      windowDays,
      promptCoverage: promptCoverageForOwner(canonicalOwner),
      scorecard,
      reconciliation: reconcileOwner(scorecard),
    };
  });
};

export const buildGeoOwnerMeasurementLayer = (input: GeoMeasurementLayerInput) =>
  ([7, 28, 90] as const).map((windowDays) => ({
    windowDays,
    owners: buildGeoOwnerMeasurement(input, windowDays),
  }));

export const findGeoOwnerMeasurement = (
  records: GeoOwnerMeasurementRecord[],
  canonicalOwner: string,
) => {
  const record = records.find((item) => item.canonicalOwner === canonicalOwner);
  if (!record) throw new Error(`Unknown GEO measurement owner: ${canonicalOwner}`);
  return record;
};
