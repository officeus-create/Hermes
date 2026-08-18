import {
  aiVisibilityPrompts,
  type AiVisibilityObservation,
  type AiVisibilityProvider,
} from "./ai-visibility-scorecard.ts";
import {
  buildGeoAiCompetitiveSummary,
} from "./geo-ai-competitive-visibility.ts";
import {
  evaluateAiVisibilityObservation,
  validateAiVisibilityObservationForGeo,
} from "./geo-ai-observation-evaluation.ts";
import {
  buildGeoAiReviewPlan,
  defaultGeoAiReviewProviders,
  type GeoAiReviewStatus,
} from "./geo-ai-review-plan.ts";
import { findGeoOwnerForPrompt, geoPromptOwnerRegistry } from "./geo-prompt-owner-registry.ts";

export type GeoAiRemediationReason =
  | "factual_error"
  | "mention_without_citation"
  | "citation_without_recommendation"
  | "cited_path_mismatch"
  | "entity_accuracy_issue"
  | "description_accuracy_issue";

export interface GeoAiRemediationItem {
  observationId: string;
  promptId: string;
  canonicalOwner: string;
  provider: AiVisibilityProvider;
  observedAt: string;
  reasons: GeoAiRemediationReason[];
}

export interface GeoAiProviderCoverage {
  provider: AiVisibilityProvider;
  expectedPromptChecks: number;
  observedPromptChecks: number;
  currentPromptChecks: number;
  overduePromptChecks: number;
  neverObservedPromptChecks: number;
  coveragePercent: number;
  currentPercent: number;
}

export interface GeoAiCompetitorFrequency {
  label: string;
  occurrences: number;
  providers: AiVisibilityProvider[];
  canonicalOwners: string[];
}

export interface GeoAiProviderShareRecord {
  provider: AiVisibilityProvider;
  observations: number;
  hermesMentions: number;
  competitorMentionOccurrences: number;
  entityMentionShare: number;
}

export interface GeoAiAccuracyWindowRecord {
  windowDays: 7 | 28 | 90;
  provider: AiVisibilityProvider;
  observations: number;
  brandMentions: number;
  entityAccuracyEligible: number;
  entityAccurate: number;
  entityAccuracyRate: number;
  descriptionAccuracyEligible: number;
  descriptionAccurate: number;
  descriptionAccuracyRate: number;
  factualErrors: number;
}

export interface GeoAiEvidenceReferenceHealth {
  observationId: string;
  promptId: string;
  provider: AiVisibilityProvider;
  canonicalOwner: string;
  evidenceReference: string;
  observedAt: string;
  ageDays: number;
  cadenceDays: 7 | 28;
  state: "current" | "stale";
}

export interface GeoAiOwnerReadiness {
  canonicalOwner: string;
  expectedPromptProviderChecks: number;
  observedPromptProviderChecks: number;
  currentPromptProviderChecks: number;
  readinessPercent: number;
  currentPercent: number;
  factualErrors: number;
  citationMismatches: number;
  remediationItems: number;
}

const DAY_MS = 86_400_000;
const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const time = (label: string, value: string) => {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a valid ISO timestamp`);
  return parsed;
};

const normalizeCompetitor = (value: string) => value.trim().replace(/\s+/g, " ");

const uniquePromptProviderKeys = (observations: AiVisibilityObservation[]) =>
  new Set(observations.map((item) => `${item.promptId}|${item.provider}`));

const currentStatuses = new Set<GeoAiReviewStatus>(["current", "due_soon"]);

const remediationReasons = (observation: AiVisibilityObservation): GeoAiRemediationReason[] => {
  const evaluation = evaluateAiVisibilityObservation(observation);
  const reasons: GeoAiRemediationReason[] = [];
  if (observation.factualError) reasons.push("factual_error");
  if (observation.brandMentioned && !observation.linkedCitation) reasons.push("mention_without_citation");
  if (
    observation.linkedCitation &&
    observation.recommendation !== "considered_option" &&
    observation.recommendation !== "explicit_recommendation"
  ) {
    reasons.push("citation_without_recommendation");
  }
  if (evaluation.requiresOwnerReview) reasons.push("cited_path_mismatch");
  if (observation.entityAccuracy === "partially_accurate" || observation.entityAccuracy === "inaccurate") {
    reasons.push("entity_accuracy_issue");
  }
  if (
    observation.descriptionAccuracy === "partially_accurate" ||
    observation.descriptionAccuracy === "inaccurate"
  ) {
    reasons.push("description_accuracy_issue");
  }
  return reasons;
};

export const buildGeoAiVisibilityOperations = ({
  asOf,
  observations,
  providers = defaultGeoAiReviewProviders,
}: {
  asOf: string;
  observations: AiVisibilityObservation[];
  providers?: AiVisibilityProvider[];
}) => {
  const asOfMs = time("asOf", asOf);
  const real = observations.filter((item) => !item.synthetic);
  for (const observation of real) {
    validateAiVisibilityObservationForGeo(observation);
    const observedAt = time(`Observation ${observation.id} observedAt`, observation.observedAt);
    if (observedAt > asOfMs) throw new Error(`Observation ${observation.id} cannot be later than asOf`);
  }

  const plan = buildGeoAiReviewPlan({ asOf, observations: real, providers });
  const observedKeys = uniquePromptProviderKeys(real);

  const providerCoverage: GeoAiProviderCoverage[] = providers.map((provider) => {
    const providerQueue = plan.queue.filter((item) => item.provider === provider);
    const observedPromptChecks = aiVisibilityPrompts.filter((prompt) =>
      observedKeys.has(`${prompt.id}|${provider}`),
    ).length;
    const currentPromptChecks = providerQueue.filter((item) => currentStatuses.has(item.status)).length;
    return {
      provider,
      expectedPromptChecks: aiVisibilityPrompts.length,
      observedPromptChecks,
      currentPromptChecks,
      overduePromptChecks: providerQueue.filter((item) => item.status === "overdue").length,
      neverObservedPromptChecks: providerQueue.filter((item) => item.status === "never_observed").length,
      coveragePercent: rate(observedPromptChecks, aiVisibilityPrompts.length),
      currentPercent: rate(currentPromptChecks, aiVisibilityPrompts.length),
    };
  });

  const missingProviderQueue = plan.queue
    .filter((item) => item.status === "never_observed")
    .map((item) => ({
      promptId: item.promptId,
      canonicalOwner: item.canonicalOwner,
      provider: item.provider,
      cadence: item.cadence,
      direction: item.direction,
    }));

  const cadenceCompliance = {
    totalChecks: plan.summary.totalChecks,
    currentOrDueSoon: plan.queue.filter((item) => currentStatuses.has(item.status)).length,
    overdue: plan.summary.overdue,
    neverObserved: plan.summary.neverObserved,
    weeklyChecks: plan.summary.weeklyChecks,
    monthlyChecks: plan.summary.monthlyChecks,
    compliancePercent: rate(
      plan.queue.filter((item) => currentStatuses.has(item.status)).length,
      plan.summary.totalChecks,
    ),
  };

  const remediationQueue: GeoAiRemediationItem[] = real
    .map((observation) => ({
      observationId: observation.id,
      promptId: observation.promptId,
      canonicalOwner: findGeoOwnerForPrompt(observation.promptId).canonicalOwner,
      provider: observation.provider,
      observedAt: new Date(Date.parse(observation.observedAt)).toISOString(),
      reasons: remediationReasons(observation),
    }))
    .filter((item) => item.reasons.length > 0)
    .sort(
      (left, right) =>
        left.canonicalOwner.localeCompare(right.canonicalOwner) ||
        left.provider.localeCompare(right.provider) ||
        left.promptId.localeCompare(right.promptId),
    );

  const competitorMap = new Map<
    string,
    { label: string; occurrences: number; providers: Set<AiVisibilityProvider>; owners: Set<string> }
  >();
  for (const observation of real) {
    const owner = findGeoOwnerForPrompt(observation.promptId).canonicalOwner;
    const seen = new Set<string>();
    for (const raw of observation.competitors) {
      const label = normalizeCompetitor(raw);
      if (!label) continue;
      const key = label.toLocaleLowerCase("en-US");
      if (seen.has(key)) continue;
      seen.add(key);
      const current = competitorMap.get(key) ?? {
        label,
        occurrences: 0,
        providers: new Set<AiVisibilityProvider>(),
        owners: new Set<string>(),
      };
      current.occurrences += 1;
      current.providers.add(observation.provider);
      current.owners.add(owner);
      competitorMap.set(key, current);
    }
  }
  const competitorFrequencies: GeoAiCompetitorFrequency[] = [...competitorMap.values()]
    .map((item) => ({
      label: item.label,
      occurrences: item.occurrences,
      providers: [...item.providers].sort(),
      canonicalOwners: [...item.owners].sort(),
    }))
    .sort((left, right) => right.occurrences - left.occurrences || left.label.localeCompare(right.label));

  const providerEntityMentionShare: GeoAiProviderShareRecord[] = providers.map((provider) => {
    const summary = buildGeoAiCompetitiveSummary(real.filter((item) => item.provider === provider));
    return {
      provider,
      observations: summary.observations,
      hermesMentions: summary.hermesMentions,
      competitorMentionOccurrences: summary.competitorMentionOccurrences,
      entityMentionShare: summary.entityMentionShare,
    };
  });

  const accuracyByProviderWindow: GeoAiAccuracyWindowRecord[] = ([7, 28, 90] as const).flatMap(
    (windowDays) =>
      providers.map((provider) => {
        const start = asOfMs - windowDays * DAY_MS;
        const scoped = real.filter((item) => {
          const observedAt = Date.parse(item.observedAt);
          return item.provider === provider && observedAt > start && observedAt <= asOfMs;
        });
        const entityEligible = scoped.filter((item) => item.entityAccuracy !== "not_applicable");
        const descriptionEligible = scoped.filter((item) => item.descriptionAccuracy !== "not_applicable");
        return {
          windowDays,
          provider,
          observations: scoped.length,
          brandMentions: scoped.filter((item) => item.brandMentioned).length,
          entityAccuracyEligible: entityEligible.length,
          entityAccurate: entityEligible.filter((item) => item.entityAccuracy === "accurate").length,
          entityAccuracyRate: rate(
            entityEligible.filter((item) => item.entityAccuracy === "accurate").length,
            entityEligible.length,
          ),
          descriptionAccuracyEligible: descriptionEligible.length,
          descriptionAccurate: descriptionEligible.filter((item) => item.descriptionAccuracy === "accurate").length,
          descriptionAccuracyRate: rate(
            descriptionEligible.filter((item) => item.descriptionAccuracy === "accurate").length,
            descriptionEligible.length,
          ),
          factualErrors: scoped.filter((item) => item.factualError).length,
        };
      }),
  );

  const evidenceReferenceHealth: GeoAiEvidenceReferenceHealth[] = real
    .map((observation) => {
      const prompt = aiVisibilityPrompts.find((item) => item.id === observation.promptId)!;
      const cadenceDays: 7 | 28 = prompt.cadence === "weekly" ? 7 : 28;
      const observedAtMs = Date.parse(observation.observedAt);
      const ageDays = Math.floor((asOfMs - observedAtMs) / DAY_MS);
      return {
        observationId: observation.id,
        promptId: observation.promptId,
        provider: observation.provider,
        canonicalOwner: prompt.canonicalOwner,
        evidenceReference: observation.evidenceReference,
        observedAt: new Date(observedAtMs).toISOString(),
        ageDays,
        cadenceDays,
        state: ageDays <= cadenceDays ? "current" as const : "stale" as const,
      };
    })
    .sort((left, right) => left.canonicalOwner.localeCompare(right.canonicalOwner) || left.promptId.localeCompare(right.promptId));

  const ownerReadiness: GeoAiOwnerReadiness[] = geoPromptOwnerRegistry.map((owner) => {
    const expectedPromptProviderChecks = owner.promptIds.length * providers.length;
    const ownerObserved = real.filter((item) => owner.promptIds.includes(item.promptId));
    const ownerObservedKeys = uniquePromptProviderKeys(ownerObserved);
    const ownerPlan = plan.queue.filter((item) => owner.promptIds.includes(item.promptId));
    const ownerRemediation = remediationQueue.filter((item) => item.canonicalOwner === owner.canonicalOwner);
    return {
      canonicalOwner: owner.canonicalOwner,
      expectedPromptProviderChecks,
      observedPromptProviderChecks: ownerObservedKeys.size,
      currentPromptProviderChecks: ownerPlan.filter((item) => currentStatuses.has(item.status)).length,
      readinessPercent: rate(ownerObservedKeys.size, expectedPromptProviderChecks),
      currentPercent: rate(
        ownerPlan.filter((item) => currentStatuses.has(item.status)).length,
        expectedPromptProviderChecks,
      ),
      factualErrors: ownerObserved.filter((item) => item.factualError).length,
      citationMismatches: ownerObserved
        .map(evaluateAiVisibilityObservation)
        .filter((item) => item.requiresOwnerReview).length,
      remediationItems: ownerRemediation.length,
    };
  });

  return {
    asOf: new Date(asOfMs).toISOString(),
    providers: [...providers],
    observationFreshness: plan.queue,
    providerCoverage,
    cadenceCompliance,
    missingProviderQueue,
    remediationQueue,
    factualErrorQueue: remediationQueue.filter((item) => item.reasons.includes("factual_error")),
    missingCitationQueue: remediationQueue.filter((item) => item.reasons.includes("mention_without_citation")),
    mentionWithoutCitation: remediationQueue.filter((item) => item.reasons.includes("mention_without_citation")),
    citationWithoutRecommendation: remediationQueue.filter((item) => item.reasons.includes("citation_without_recommendation")),
    citedPathMismatch: remediationQueue.filter((item) => item.reasons.includes("cited_path_mismatch")),
    competitorFrequencies,
    providerEntityMentionShare,
    accuracyByProviderWindow,
    evidenceReferenceHealth,
    ownerReadiness,
  };
};