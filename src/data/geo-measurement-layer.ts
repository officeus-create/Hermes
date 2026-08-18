import {
  calculateAiVisibilityMetrics,
  type AiVisibilityObservation,
} from "./ai-visibility-scorecard";

export type GeoWindowDays = 7 | 28 | 90;
export type GeoDiscoveryType = "branded" | "non_branded";
export type GeoSearchSource = "google" | "bing";
export type GeoEvidenceClass =
  | "repository_verified"
  | "production_verified"
  | "platform_verified"
  | "production_receiver_verified"
  | "private_operations_verified"
  | "owner_provided_handoff"
  | "unverified";
export type GeoAiEvidenceClass = Extract<GeoEvidenceClass, "owner_provided_handoff" | "unverified">;

export interface GeoSearchAggregate {
  windowDays: GeoWindowDays;
  source: GeoSearchSource;
  pagePath: string;
  discoveryType: GeoDiscoveryType;
  impressions: number;
  clicks: number;
  evidenceClass: Extract<GeoEvidenceClass, "platform_verified" | "owner_provided_handoff" | "unverified">;
}

export interface GeoFunnelAggregate {
  windowDays: GeoWindowDays;
  pagePath: string;
  ctaClicks: number;
  intakeStarts: number;
  previewReady: number;
  handoffReady: number;
  deliveryConfirmed: number;
  evidenceClass: Extract<
    GeoEvidenceClass,
    "platform_verified" | "production_receiver_verified" | "owner_provided_handoff" | "unverified"
  >;
}

export interface GeoOutcomeAggregate {
  windowDays: GeoWindowDays;
  pagePath: string;
  reviewedInquiries: number;
  qualifiedLeads: number;
  opportunities: number;
  wins: number;
  losses: number;
  revenueReconciledWins: number;
  evidenceClass: Extract<GeoEvidenceClass, "private_operations_verified" | "owner_provided_handoff" | "unverified">;
}

export interface GeoMeasurementLayerInput {
  asOf: string;
  aiObservations: AiVisibilityObservation[];
  aiVisibilityEvidenceClass: GeoAiEvidenceClass;
  search: GeoSearchAggregate[];
  funnel: GeoFunnelAggregate[];
  outcomes: GeoOutcomeAggregate[];
}

export interface GeoMeasurementScorecard {
  windowDays: GeoWindowDays;
  aiVisibility: ReturnType<typeof calculateAiVisibilityMetrics> & {
    observationsInWindow: number;
  };
  search: {
    impressions: number;
    clicks: number;
    ctr: number;
    brandedImpressions: number;
    brandedClicks: number;
    brandedCtr: number;
    nonBrandedImpressions: number;
    nonBrandedClicks: number;
    nonBrandedCtr: number;
  };
  funnel: {
    ctaClicks: number;
    intakeStarts: number;
    previewReady: number;
    handoffReady: number;
    deliveryConfirmed: number;
    ctaToIntakeRate: number;
    intakeToPreviewRate: number;
    previewToHandoffRate: number;
    handoffToDeliveryRate: number;
  };
  leadQuality: {
    reviewedInquiries: number;
    qualifiedLeads: number;
    opportunities: number;
    wins: number;
    losses: number;
    revenueReconciledWins: number;
    reviewToQualifiedRate: number;
    qualifiedToOpportunityRate: number;
    opportunityToWinRate: number;
    deliveryToQualifiedRate: number;
  };
  evidence: {
    aiVisibility: GeoEvidenceClass[];
    search: GeoEvidenceClass[];
    funnel: GeoEvidenceClass[];
    outcomes: GeoEvidenceClass[];
  };
  gaps: string[];
}

export const geoMeasurementWindows: readonly GeoWindowDays[] = [7, 28, 90];

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const sum = <T>(rows: T[], select: (row: T) => number) =>
  rows.reduce((total, row) => total + select(row), 0);

const uniqueEvidence = (classes: GeoEvidenceClass[]) => [...new Set(classes)];

const assertWholeNonNegative = (label: string, value: number) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
};

const assertPath = (path: string) => {
  if (!path.startsWith("/")) {
    throw new Error(`pagePath must be site-relative: ${path}`);
  }
};

export const validateGeoMeasurementInput = (input: GeoMeasurementLayerInput) => {
  if (!Number.isFinite(Date.parse(input.asOf))) {
    throw new Error("asOf must be a valid ISO date/time");
  }

  for (const row of input.search) {
    assertPath(row.pagePath);
    assertWholeNonNegative("search.impressions", row.impressions);
    assertWholeNonNegative("search.clicks", row.clicks);
    if (row.clicks > row.impressions) {
      throw new Error("search.clicks cannot exceed search.impressions");
    }
  }

  for (const row of input.funnel) {
    assertPath(row.pagePath);
    for (const [label, value] of Object.entries({
      ctaClicks: row.ctaClicks,
      intakeStarts: row.intakeStarts,
      previewReady: row.previewReady,
      handoffReady: row.handoffReady,
      deliveryConfirmed: row.deliveryConfirmed,
    })) {
      assertWholeNonNegative(`funnel.${label}`, value);
    }
  }

  for (const row of input.outcomes) {
    assertPath(row.pagePath);
    for (const [label, value] of Object.entries({
      reviewedInquiries: row.reviewedInquiries,
      qualifiedLeads: row.qualifiedLeads,
      opportunities: row.opportunities,
      wins: row.wins,
      losses: row.losses,
      revenueReconciledWins: row.revenueReconciledWins,
    })) {
      assertWholeNonNegative(`outcomes.${label}`, value);
    }
    if (row.qualifiedLeads > row.reviewedInquiries) {
      throw new Error("outcomes.qualifiedLeads cannot exceed outcomes.reviewedInquiries");
    }
    if (row.opportunities > row.qualifiedLeads) {
      throw new Error("outcomes.opportunities cannot exceed outcomes.qualifiedLeads");
    }
    if (row.wins + row.losses > row.opportunities) {
      throw new Error("outcomes.wins + outcomes.losses cannot exceed outcomes.opportunities");
    }
    if (row.revenueReconciledWins > row.wins) {
      throw new Error("outcomes.revenueReconciledWins cannot exceed outcomes.wins");
    }
  }
};

export const filterRealAiObservationsForWindow = (
  observations: AiVisibilityObservation[],
  windowDays: GeoWindowDays,
  asOf: string,
) => {
  const end = Date.parse(asOf);
  if (!Number.isFinite(end)) throw new Error("asOf must be a valid ISO date/time");
  const start = end - windowDays * 24 * 60 * 60 * 1000;

  return observations.filter((item) => {
    if (item.synthetic) return false;
    const observedAt = Date.parse(item.observedAt);
    return Number.isFinite(observedAt) && observedAt > start && observedAt <= end;
  });
};

export const buildGeoMeasurementScorecard = (
  input: GeoMeasurementLayerInput,
  windowDays: GeoWindowDays,
): GeoMeasurementScorecard => {
  validateGeoMeasurementInput(input);

  const aiRows = filterRealAiObservationsForWindow(input.aiObservations, windowDays, input.asOf);
  const searchRows = input.search.filter((row) => row.windowDays === windowDays);
  const funnelRows = input.funnel.filter((row) => row.windowDays === windowDays);
  const outcomeRows = input.outcomes.filter((row) => row.windowDays === windowDays);

  const aiMetrics = calculateAiVisibilityMetrics(aiRows);

  const impressions = sum(searchRows, (row) => row.impressions);
  const clicks = sum(searchRows, (row) => row.clicks);
  const brandedRows = searchRows.filter((row) => row.discoveryType === "branded");
  const nonBrandedRows = searchRows.filter((row) => row.discoveryType === "non_branded");
  const brandedImpressions = sum(brandedRows, (row) => row.impressions);
  const brandedClicks = sum(brandedRows, (row) => row.clicks);
  const nonBrandedImpressions = sum(nonBrandedRows, (row) => row.impressions);
  const nonBrandedClicks = sum(nonBrandedRows, (row) => row.clicks);

  const ctaClicks = sum(funnelRows, (row) => row.ctaClicks);
  const intakeStarts = sum(funnelRows, (row) => row.intakeStarts);
  const previewReady = sum(funnelRows, (row) => row.previewReady);
  const handoffReady = sum(funnelRows, (row) => row.handoffReady);
  const deliveryConfirmed = sum(funnelRows, (row) => row.deliveryConfirmed);

  const reviewedInquiries = sum(outcomeRows, (row) => row.reviewedInquiries);
  const qualifiedLeads = sum(outcomeRows, (row) => row.qualifiedLeads);
  const opportunities = sum(outcomeRows, (row) => row.opportunities);
  const wins = sum(outcomeRows, (row) => row.wins);
  const losses = sum(outcomeRows, (row) => row.losses);
  const revenueReconciledWins = sum(outcomeRows, (row) => row.revenueReconciledWins);

  const gaps: string[] = [];
  if (aiRows.length === 0) gaps.push("ai_visibility_observations_missing");
  if (searchRows.length === 0) gaps.push("search_baseline_missing");
  if (funnelRows.length === 0) gaps.push("funnel_receipt_missing");
  if (outcomeRows.length === 0) gaps.push("qualified_outcome_reconciliation_missing");
  if (searchRows.length > 0 && nonBrandedImpressions === 0) gaps.push("non_branded_discovery_not_observed");

  return {
    windowDays,
    aiVisibility: {
      ...aiMetrics,
      observationsInWindow: aiRows.length,
    },
    search: {
      impressions,
      clicks,
      ctr: rate(clicks, impressions),
      brandedImpressions,
      brandedClicks,
      brandedCtr: rate(brandedClicks, brandedImpressions),
      nonBrandedImpressions,
      nonBrandedClicks,
      nonBrandedCtr: rate(nonBrandedClicks, nonBrandedImpressions),
    },
    funnel: {
      ctaClicks,
      intakeStarts,
      previewReady,
      handoffReady,
      deliveryConfirmed,
      ctaToIntakeRate: rate(intakeStarts, ctaClicks),
      intakeToPreviewRate: rate(previewReady, intakeStarts),
      previewToHandoffRate: rate(handoffReady, previewReady),
      handoffToDeliveryRate: rate(deliveryConfirmed, handoffReady),
    },
    leadQuality: {
      reviewedInquiries,
      qualifiedLeads,
      opportunities,
      wins,
      losses,
      revenueReconciledWins,
      reviewToQualifiedRate: rate(qualifiedLeads, reviewedInquiries),
      qualifiedToOpportunityRate: rate(opportunities, qualifiedLeads),
      opportunityToWinRate: rate(wins, opportunities),
      deliveryToQualifiedRate: rate(qualifiedLeads, deliveryConfirmed),
    },
    evidence: {
      aiVisibility: aiRows.length > 0 ? [input.aiVisibilityEvidenceClass] : [],
      search: uniqueEvidence(searchRows.map((row) => row.evidenceClass)),
      funnel: uniqueEvidence(funnelRows.map((row) => row.evidenceClass)),
      outcomes: uniqueEvidence(outcomeRows.map((row) => row.evidenceClass)),
    },
    gaps,
  };
};

export const buildGeoMeasurementLayer = (input: GeoMeasurementLayerInput) =>
  geoMeasurementWindows.map((windowDays) => buildGeoMeasurementScorecard(input, windowDays));
