import {
  geoFreshGscCheckpoint20260819,
  type GeoGscExactCheckpoint,
  validateGeoGscExactCheckpoint,
} from "./geo-gsc-fresh-checkpoint.ts";

export type GeoUsOpportunityEvidenceClass = "platform_verified" | "owner_provided_handoff";
export type GeoUsEvidenceScope = "us" | "global_or_unspecified";
export type GeoUsCommercialIntent = "high" | "medium" | "low" | "unknown";
export type GeoUsPositionBand = "position_1_10" | "position_11_20" | "position_21_40" | "position_41_plus" | "unknown";
export type GeoUsOpportunityState =
  | "ranking_problem"
  | "snippet_ctr_problem"
  | "intent_review"
  | "internal_link_opportunity"
  | "insufficient_owner_evidence"
  | "observe";
export type GeoUsNextBestAction = "ranking" | "title_snippet" | "intent" | "internal_link" | "wait_for_data";
export type GeoUsConfidence = "gated" | "low" | "medium" | "high";
export type GeoUsClickState = "zero_clicks" | "low_click_rate" | "receiving_clicks" | "unknown";

export interface GeoUsCtrBenchmark {
  positionBand: Exclude<GeoUsPositionBand, "unknown">;
  comparableCtr: number;
  minimumImpressions: number;
  evidenceReference: string;
}

export interface GeoUsOwnerEvidence {
  canonicalOwner: string;
  evidenceClass: GeoUsOpportunityEvidenceClass;
  scope: GeoUsEvidenceScope;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  averagePosition: number | null;
  commercialIntent: GeoUsCommercialIntent;
}

export interface GeoUsOwnerOpportunity extends GeoUsOwnerEvidence {
  positionBand: GeoUsPositionBand;
  clickState: GeoUsClickState;
  ctrUnderperformance: boolean;
  ctrComparable: boolean;
  state: GeoUsOpportunityState;
  nextBestAction: GeoUsNextBestAction;
  priorityScore: number;
  confidence: GeoUsConfidence;
  highImpressionLowClickCandidate: boolean;
  noiseCapped: boolean;
  evidenceGaps: string[];
}

const round = (value: number, digits = 2) => Number(value.toFixed(digits));
const percent = (clicks: number, impressions: number) => impressions === 0 ? 0 : round((clicks / impressions) * 100, 2);
const cleanPath = (value: string) => value.startsWith("/") && !value.startsWith("//") && !/[?#]/.test(value);
const finiteNonNegative = (value: number, label: string) => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number`);
};

export const classifyGeoUsPositionBand = (averagePosition: number | null): GeoUsPositionBand => {
  if (averagePosition === null) return "unknown";
  finiteNonNegative(averagePosition, "averagePosition");
  if (averagePosition <= 10) return "position_1_10";
  if (averagePosition <= 20) return "position_11_20";
  if (averagePosition <= 40) return "position_21_40";
  return "position_41_plus";
};

export const validateGeoUsOwnerEvidence = (row: GeoUsOwnerEvidence) => {
  if (!cleanPath(row.canonicalOwner)) throw new Error(`canonicalOwner must be a clean site-relative path`);
  if (row.impressions !== null) finiteNonNegative(row.impressions, "impressions");
  if (row.clicks !== null) finiteNonNegative(row.clicks, "clicks");
  if (row.ctr !== null) finiteNonNegative(row.ctr, "ctr");
  if (row.averagePosition !== null) finiteNonNegative(row.averagePosition, "averagePosition");
  if (row.clicks !== null && row.impressions !== null && row.clicks > row.impressions) {
    throw new Error(`clicks cannot exceed impressions`);
  }
  if (row.ctr !== null && (row.clicks === null || row.impressions === null)) {
    throw new Error(`CTR requires known clicks and impressions`);
  }
  if (row.clicks !== null && row.impressions !== null && row.ctr !== null && row.ctr !== percent(row.clicks, row.impressions)) {
    throw new Error(`CTR does not reconcile to clicks/impressions`);
  }
  return row;
};

export const validateGeoUsCtrBenchmarks = (benchmarks: GeoUsCtrBenchmark[]) => {
  const seen = new Set<string>();
  for (const benchmark of benchmarks) {
    if (seen.has(benchmark.positionBand)) throw new Error(`duplicate CTR benchmark for ${benchmark.positionBand}`);
    seen.add(benchmark.positionBand);
    finiteNonNegative(benchmark.comparableCtr, "comparableCtr");
    finiteNonNegative(benchmark.minimumImpressions, "minimumImpressions");
    if (!benchmark.evidenceReference.trim()) throw new Error(`CTR benchmark requires evidenceReference`);
  }
  return benchmarks;
};

const clickStateFor = (row: GeoUsOwnerEvidence): GeoUsClickState => {
  if (row.clicks === null || row.impressions === null || row.ctr === null) return "unknown";
  if (row.clicks === 0) return "zero_clicks";
  if (row.impressions >= 20 && row.ctr <= 1) return "low_click_rate";
  return "receiving_clicks";
};

const confidenceFor = (row: GeoUsOwnerEvidence): GeoUsConfidence => {
  if (row.scope !== "us" || row.impressions === null || row.averagePosition === null) return "gated";
  if (row.impressions < 20) return "low";
  if (row.evidenceClass !== "platform_verified") return "medium";
  return row.impressions >= 100 ? "high" : "medium";
};

const intentWeight: Record<GeoUsCommercialIntent, number> = {
  high: 40,
  medium: 24,
  low: 8,
  unknown: 0,
};

const positionWeight: Record<GeoUsPositionBand, number> = {
  position_1_10: 0,
  position_11_20: 12,
  position_21_40: 24,
  position_41_plus: 34,
  unknown: 0,
};

const actionFor = (
  row: GeoUsOwnerEvidence,
  band: GeoUsPositionBand,
  ctrUnderperformance: boolean,
): { state: GeoUsOpportunityState; action: GeoUsNextBestAction } => {
  if (row.scope !== "us" || row.impressions === null || row.averagePosition === null) {
    return { state: "insufficient_owner_evidence", action: "wait_for_data" };
  }
  if (band === "position_41_plus") return { state: "ranking_problem", action: "ranking" };
  if (band === "position_21_40") return { state: "internal_link_opportunity", action: "internal_link" };
  if (band === "position_11_20") {
    if (ctrUnderperformance) return { state: "snippet_ctr_problem", action: "title_snippet" };
    return { state: "intent_review", action: "intent" };
  }
  if (band === "position_1_10" && ctrUnderperformance) {
    return { state: "snippet_ctr_problem", action: "title_snippet" };
  }
  return { state: "observe", action: "wait_for_data" };
};

export const buildGeoUsOwnerOpportunity = (
  row: GeoUsOwnerEvidence,
  benchmarks: GeoUsCtrBenchmark[] = [],
): GeoUsOwnerOpportunity => {
  validateGeoUsOwnerEvidence(row);
  validateGeoUsCtrBenchmarks(benchmarks);
  const positionBand = classifyGeoUsPositionBand(row.averagePosition);
  const benchmark = positionBand === "unknown" ? undefined : benchmarks.find((item) => item.positionBand === positionBand);
  const ctrComparable = Boolean(
    benchmark &&
    row.scope === "us" &&
    row.ctr !== null &&
    row.impressions !== null &&
    row.impressions >= benchmark.minimumImpressions,
  );
  const ctrUnderperformance = Boolean(ctrComparable && benchmark && row.ctr !== null && row.ctr < benchmark.comparableCtr);
  const clickState = clickStateFor(row);
  const highImpressionLowClickCandidate = Boolean(
    row.evidenceClass === "platform_verified" &&
    row.scope === "us" &&
    row.impressions !== null &&
    row.impressions >= 100 &&
    (clickState === "zero_clicks" || clickState === "low_click_rate"),
  );
  const evidenceGaps: string[] = [];
  if (row.scope !== "us") evidenceGaps.push("us_owner_scope_missing");
  if (row.impressions === null) evidenceGaps.push("owner_impressions_missing");
  if (row.clicks === null) evidenceGaps.push("owner_clicks_missing");
  if (row.ctr === null) evidenceGaps.push("owner_ctr_missing");
  if (row.averagePosition === null) evidenceGaps.push("owner_average_position_missing");
  if (row.evidenceClass !== "platform_verified") evidenceGaps.push("platform_verification_missing");
  if (!benchmark && row.averagePosition !== null && row.averagePosition <= 20) evidenceGaps.push("comparable_ctr_benchmark_missing");

  const { state, action } = actionFor(row, positionBand, ctrUnderperformance);
  const impressions = row.impressions ?? 0;
  const volumeWeight = Math.min(30, Math.log10(impressions + 1) * 12);
  const scopeWeight = row.scope === "us" ? 20 : 0;
  let priorityScore = round(scopeWeight + intentWeight[row.commercialIntent] + volumeWeight + positionWeight[positionBand], 2);
  const noiseCapped = impressions < 20;
  if (noiseCapped) priorityScore = Math.min(priorityScore, 30);
  if (row.scope !== "us") priorityScore = Math.min(priorityScore, 20);

  return {
    ...row,
    positionBand,
    clickState,
    ctrUnderperformance,
    ctrComparable,
    state,
    nextBestAction: action,
    priorityScore,
    confidence: confidenceFor(row),
    highImpressionLowClickCandidate,
    noiseCapped,
    evidenceGaps,
  };
};

export const rankGeoUsOwnerOpportunities = (
  rows: GeoUsOwnerEvidence[],
  benchmarks: GeoUsCtrBenchmark[] = [],
) => rows
  .map((row) => buildGeoUsOwnerOpportunity(row, benchmarks))
  .sort((a, b) => {
    const scopeDelta = Number(b.scope === "us") - Number(a.scope === "us");
    if (scopeDelta !== 0) return scopeDelta;
    const confidenceRank: Record<GeoUsConfidence, number> = { high: 4, medium: 3, low: 2, gated: 1 };
    const confidenceDelta = confidenceRank[b.confidence] - confidenceRank[a.confidence];
    if (confidenceDelta !== 0) return confidenceDelta;
    const impressionDelta = (b.impressions ?? -1) - (a.impressions ?? -1);
    if (impressionDelta !== 0) return impressionDelta;
    return b.priorityScore - a.priorityScore || a.canonicalOwner.localeCompare(b.canonicalOwner);
  });

const freshOwnerIntent = (canonicalOwner: string): GeoUsCommercialIntent => {
  if (["/services/seo-for-logistics-companies/", "/services/seo/", "/logistics/car-hauling-dispatch/"].includes(canonicalOwner)) return "high";
  if (canonicalOwner.startsWith("/careers/")) return "medium";
  return "unknown";
};

export const adaptFreshCheckpointPagesToUsOpportunityEvidence = (
  checkpoint: GeoGscExactCheckpoint = geoFreshGscCheckpoint20260819,
): GeoUsOwnerEvidence[] => {
  validateGeoGscExactCheckpoint(checkpoint);
  return checkpoint.pages.map((page) => ({
    canonicalOwner: page.canonicalOwner,
    evidenceClass: checkpoint.evidenceClass,
    scope: "global_or_unspecified",
    impressions: page.impressions,
    clicks: page.clicks,
    ctr: page.ctr,
    averagePosition: page.averagePosition,
    commercialIntent: freshOwnerIntent(page.canonicalOwner),
  }));
};

export const buildFreshCheckpointUsMarketSignal = (
  checkpoint: GeoGscExactCheckpoint = geoFreshGscCheckpoint20260819,
) => {
  validateGeoGscExactCheckpoint(checkpoint);
  const us = checkpoint.countries.find((country) => country.country === "United States");
  if (!us) throw new Error(`Fresh checkpoint does not contain a United States country slice`);
  const positionBand = classifyGeoUsPositionBand(us.averagePosition);
  return {
    scope: "us_market_aggregate" as const,
    evidenceClass: checkpoint.evidenceClass,
    impressions: us.impressions,
    clicks: us.clicks,
    ctr: us.ctr,
    averagePosition: us.averagePosition,
    positionBand,
    state: positionBand === "position_41_plus" ? "ranking_problem" as const : "observe" as const,
    nextBestAction: positionBand === "position_41_plus" ? "ranking" as const : "wait_for_data" as const,
    ownerLevelActionable: false,
    reason: "Country-level US evidence can prioritize the market problem but cannot be assigned to a canonical owner without US-scoped owner evidence.",
  };
};
