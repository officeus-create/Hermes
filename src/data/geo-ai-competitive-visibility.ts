import type {
  AiVisibilityObservation,
  AiVisibilityProvider,
} from "./ai-visibility-scorecard.ts";
import { findGeoOwnerForPrompt } from "./geo-prompt-owner-registry.ts";

export interface GeoAiCompetitiveVisibilityRecord {
  canonicalOwner: string;
  provider: AiVisibilityProvider | "all";
  observations: number;
  hermesMentions: number;
  observationsWithCompetitors: number;
  competitorMentionOccurrences: number;
  uniqueCompetitors: string[];
  hermesPresenceRate: number;
  competitorInclusionRate: number;
  entityMentionShare: number;
}

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const normalizeCompetitors = (competitors: string[]) => {
  const labels = new Map<string, string>();
  for (const raw of competitors) {
    const label = raw.trim().replace(/\s+/g, " ");
    if (!label) continue;
    const key = label.toLocaleLowerCase("en-US");
    if (!labels.has(key)) labels.set(key, label);
  }
  return [...labels.values()];
};

const buildRecord = (
  canonicalOwner: string,
  provider: AiVisibilityProvider | "all",
  observations: AiVisibilityObservation[],
): GeoAiCompetitiveVisibilityRecord => {
  const competitorLists = observations.map((item) => normalizeCompetitors(item.competitors));
  const hermesMentions = observations.filter((item) => item.brandMentioned).length;
  const observationsWithCompetitors = competitorLists.filter((items) => items.length > 0).length;
  const competitorMentionOccurrences = competitorLists.reduce((total, items) => total + items.length, 0);
  const uniqueCompetitors = normalizeCompetitors(competitorLists.flat());
  const entityMentions = hermesMentions + competitorMentionOccurrences;

  return {
    canonicalOwner,
    provider,
    observations: observations.length,
    hermesMentions,
    observationsWithCompetitors,
    competitorMentionOccurrences,
    uniqueCompetitors,
    hermesPresenceRate: rate(hermesMentions, observations.length),
    competitorInclusionRate: rate(observationsWithCompetitors, observations.length),
    entityMentionShare: rate(hermesMentions, entityMentions),
  };
};

export const buildGeoAiCompetitiveVisibility = (
  observations: AiVisibilityObservation[],
): GeoAiCompetitiveVisibilityRecord[] => {
  const real = observations.filter((item) => !item.synthetic);
  const owners = new Map<string, AiVisibilityObservation[]>();

  for (const observation of real) {
    const owner = findGeoOwnerForPrompt(observation.promptId).canonicalOwner;
    owners.set(owner, [...(owners.get(owner) ?? []), observation]);
  }

  return [...owners.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([canonicalOwner, ownerObservations]) => {
      const providers = [...new Set(ownerObservations.map((item) => item.provider))].sort();
      return [
        buildRecord(canonicalOwner, "all", ownerObservations),
        ...providers.map((provider) =>
          buildRecord(
            canonicalOwner,
            provider,
            ownerObservations.filter((item) => item.provider === provider),
          ),
        ),
      ];
    });
};

export const buildGeoAiCompetitiveSummary = (observations: AiVisibilityObservation[]) => {
  const real = observations.filter((item) => !item.synthetic);
  const competitorLists = real.map((item) => normalizeCompetitors(item.competitors));
  const hermesMentions = real.filter((item) => item.brandMentioned).length;
  const competitorMentionOccurrences = competitorLists.reduce((total, items) => total + items.length, 0);
  const entityMentions = hermesMentions + competitorMentionOccurrences;

  // This is deliberately called entityMentionShare, not market share or search SOV.
  // It describes only the reviewed AI-answer observation set supplied to this function.
  return {
    observations: real.length,
    hermesMentions,
    observationsWithCompetitors: competitorLists.filter((items) => items.length > 0).length,
    competitorMentionOccurrences,
    uniqueCompetitors: normalizeCompetitors(competitorLists.flat()),
    hermesPresenceRate: rate(hermesMentions, real.length),
    competitorInclusionRate: rate(
      competitorLists.filter((items) => items.length > 0).length,
      real.length,
    ),
    entityMentionShare: rate(hermesMentions, entityMentions),
  };
};
