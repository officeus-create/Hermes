import {
  aiVisibilityPrompts,
  type AiVisibilityObservation,
  type AiVisibilityProvider,
  type AiVisibilityPrompt,
} from "./ai-visibility-scorecard.ts";
import { findGeoOwnerForPrompt } from "./geo-prompt-owner-registry.ts";

export const defaultGeoAiReviewProviders: AiVisibilityProvider[] = [
  "chatgpt",
  "gemini",
  "copilot",
  "perplexity",
  "google_ai_mode",
];

export type GeoAiReviewStatus = "never_observed" | "overdue" | "due_soon" | "current";

export interface GeoAiReviewQueueItem {
  promptId: string;
  canonicalOwner: string;
  direction: AiVisibilityPrompt["direction"];
  language: AiVisibilityPrompt["language"];
  geography: string;
  intent: AiVisibilityPrompt["intent"];
  provider: AiVisibilityProvider;
  cadence: AiVisibilityPrompt["cadence"];
  reviewPeriodDays: 7 | 28;
  status: GeoAiReviewStatus;
  lastObservedAt: string | null;
  nextDueAt: string | null;
  daysSinceObservation: number | null;
  daysUntilDue: number | null;
}

export interface GeoAiReviewPlan {
  asOf: string;
  providers: AiVisibilityProvider[];
  queue: GeoAiReviewQueueItem[];
  summary: {
    totalChecks: number;
    neverObserved: number;
    overdue: number;
    dueSoon: number;
    current: number;
    weeklyChecks: number;
    monthlyChecks: number;
  };
}

const MS_PER_DAY = 86_400_000;
const reviewPeriodDays = (prompt: AiVisibilityPrompt): 7 | 28 =>
  prompt.cadence === "weekly" ? 7 : 28;

const parseTimestamp = (value: string, label: string) => {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`${label} must be a valid ISO timestamp`);
  return timestamp;
};

const isoAt = (timestamp: number) => new Date(timestamp).toISOString();

const priority: Record<GeoAiReviewStatus, number> = {
  never_observed: 0,
  overdue: 1,
  due_soon: 2,
  current: 3,
};

const validateProviders = (providers: AiVisibilityProvider[]) => {
  if (providers.length === 0) throw new Error("GEO AI review plan requires at least one provider");
  if (new Set(providers).size !== providers.length) {
    throw new Error("GEO AI review providers must be unique");
  }
};

export const buildGeoAiReviewPlan = ({
  asOf,
  observations,
  providers = defaultGeoAiReviewProviders,
  dueSoonDays = 2,
}: {
  asOf: string;
  observations: AiVisibilityObservation[];
  providers?: AiVisibilityProvider[];
  dueSoonDays?: number;
}): GeoAiReviewPlan => {
  const asOfTimestamp = parseTimestamp(asOf, "asOf");
  validateProviders(providers);
  if (!Number.isInteger(dueSoonDays) || dueSoonDays < 0 || dueSoonDays > 7) {
    throw new Error("dueSoonDays must be an integer between 0 and 7");
  }

  const realObservations = observations.filter((item) => !item.synthetic);
  for (const observation of realObservations) {
    findGeoOwnerForPrompt(observation.promptId);
    const observedAt = parseTimestamp(observation.observedAt, `Observation ${observation.id} observedAt`);
    if (observedAt > asOfTimestamp) {
      throw new Error(`Observation ${observation.id} cannot be later than asOf`);
    }
  }

  const queue = aiVisibilityPrompts.flatMap((prompt) =>
    providers.map((provider): GeoAiReviewQueueItem => {
      const periodDays = reviewPeriodDays(prompt);
      const latest = realObservations
        .filter((item) => item.promptId === prompt.id && item.provider === provider)
        .sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))[0];

      if (!latest) {
        return {
          promptId: prompt.id,
          canonicalOwner: prompt.canonicalOwner,
          direction: prompt.direction,
          language: prompt.language,
          geography: prompt.geography,
          intent: prompt.intent,
          provider,
          cadence: prompt.cadence,
          reviewPeriodDays: periodDays,
          status: "never_observed",
          lastObservedAt: null,
          nextDueAt: null,
          daysSinceObservation: null,
          daysUntilDue: null,
        };
      }

      const observedAt = Date.parse(latest.observedAt);
      const nextDueTimestamp = observedAt + periodDays * MS_PER_DAY;
      const daysSinceObservation = Math.floor((asOfTimestamp - observedAt) / MS_PER_DAY);
      const daysUntilDue = Math.ceil((nextDueTimestamp - asOfTimestamp) / MS_PER_DAY);
      const status: GeoAiReviewStatus =
        nextDueTimestamp < asOfTimestamp
          ? "overdue"
          : daysUntilDue <= dueSoonDays
            ? "due_soon"
            : "current";

      return {
        promptId: prompt.id,
        canonicalOwner: prompt.canonicalOwner,
        direction: prompt.direction,
        language: prompt.language,
        geography: prompt.geography,
        intent: prompt.intent,
        provider,
        cadence: prompt.cadence,
        reviewPeriodDays: periodDays,
        status,
        lastObservedAt: isoAt(observedAt),
        nextDueAt: isoAt(nextDueTimestamp),
        daysSinceObservation,
        daysUntilDue,
      };
    }),
  );

  queue.sort((left, right) => {
    const statusDifference = priority[left.status] - priority[right.status];
    if (statusDifference !== 0) return statusDifference;
    if (left.status === "overdue" && right.status === "overdue") {
      return (left.daysUntilDue ?? 0) - (right.daysUntilDue ?? 0);
    }
    return `${left.canonicalOwner}:${left.promptId}:${left.provider}`.localeCompare(
      `${right.canonicalOwner}:${right.promptId}:${right.provider}`,
    );
  });

  return {
    asOf: isoAt(asOfTimestamp),
    providers: [...providers],
    queue,
    summary: {
      totalChecks: queue.length,
      neverObserved: queue.filter((item) => item.status === "never_observed").length,
      overdue: queue.filter((item) => item.status === "overdue").length,
      dueSoon: queue.filter((item) => item.status === "due_soon").length,
      current: queue.filter((item) => item.status === "current").length,
      weeklyChecks: queue.filter((item) => item.cadence === "weekly").length,
      monthlyChecks: queue.filter((item) => item.cadence === "monthly").length,
    },
  };
};

export const dueGeoAiReviewChecks = (plan: GeoAiReviewPlan) =>
  plan.queue.filter((item) => item.status === "never_observed" || item.status === "overdue" || item.status === "due_soon");
