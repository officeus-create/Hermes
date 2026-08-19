import type { GeoWindowDays } from "./geo-measurement-layer.ts";
import type { GeoAiReferralAggregate } from "./geo-ai-referral-measurement.ts";
import { buildGeoAiReferralScorecard } from "./geo-ai-referral-measurement.ts";
import type { GeoAnalyticsReceipt } from "./geo-analytics-receipt-evidence.ts";
import { buildGeoAnalyticsReceiptHealth } from "./geo-analytics-receipt-evidence.ts";
import type { GeoCommercialOutcomeChain } from "./geo-commercial-outcome-evidence.ts";

export type GeoCommercialFunnelEvidenceClass =
  | "platform_verified"
  | "production_receiver_verified"
  | "private_operations_verified"
  | "owner_provided_handoff"
  | "unverified";

export interface GeoOwnerFunnelAggregate {
  canonicalOwner: string;
  windowDays: GeoWindowDays;
  cta: number | null;
  intake: number | null;
  delivery: number | null;
  reviewed: number | null;
  qualified: number | null;
  opportunity: number | null;
  won: number | null;
  revenueReconciledWin: number | null;
  funnelEvidenceClass: GeoCommercialFunnelEvidenceClass;
  outcomeEvidenceClass: GeoCommercialFunnelEvidenceClass;
}

export type GeoOwnerCommercialState = "verified_chain" | "owner_reported_chain" | "incomplete" | "inconsistent";

const cleanOwner = (value: string) => {
  if (!value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) throw new Error(`canonicalOwner must be a clean site-relative path: ${value}`);
  return value;
};
const wholeOrNull = (value: number | null, label: string) => {
  if (value !== null && (!Number.isInteger(value) || value < 0)) throw new Error(`${label} must be a non-negative integer or null`);
  return value;
};
const rate = (numerator: number | null, denominator: number | null) => {
  if (numerator === null || denominator === null) return null;
  if (denominator === 0) return numerator === 0 ? 0 : null;
  return Number(((numerator / denominator) * 100).toFixed(1));
};

export const validateGeoOwnerFunnelAggregate = (row: GeoOwnerFunnelAggregate) => {
  cleanOwner(row.canonicalOwner);
  for (const key of ["cta", "intake", "delivery", "reviewed", "qualified", "opportunity", "won", "revenueReconciledWin"] as const) wholeOrNull(row[key], key);
  const known = [row.cta, row.intake, row.delivery, row.reviewed, row.qualified, row.opportunity, row.won, row.revenueReconciledWin];
  const pairs = known.slice(0, -1).map((value, index) => [value, known[index + 1]] as const);
  const inversions = pairs.flatMap(([upstream, downstream], index) =>
    upstream !== null && downstream !== null && downstream > upstream ? [`stage_${index + 1}_exceeds_stage_${index}`] : [],
  );
  return { row, inversions };
};

export const buildGeoOwnerCommercialChain = (row: GeoOwnerFunnelAggregate) => {
  const { inversions } = validateGeoOwnerFunnelAggregate(row);
  const missingStages = (["cta", "intake", "delivery", "reviewed", "qualified", "opportunity", "won", "revenueReconciledWin"] as const)
    .filter((key) => row[key] === null);
  const receiverVerified = row.funnelEvidenceClass === "production_receiver_verified";
  const privateOutcomeVerified = row.outcomeEvidenceClass === "private_operations_verified";
  const allKnown = missingStages.length === 0;
  const state: GeoOwnerCommercialState = inversions.length
    ? "inconsistent"
    : allKnown && receiverVerified && privateOutcomeVerified
      ? "verified_chain"
      : allKnown && row.outcomeEvidenceClass === "owner_provided_handoff"
        ? "owner_reported_chain"
        : "incomplete";
  return {
    canonicalOwner: row.canonicalOwner,
    windowDays: row.windowDays,
    state,
    missingStages,
    integrityIssues: inversions,
    evidence: {
      funnel: row.funnelEvidenceClass,
      outcomes: row.outcomeEvidenceClass,
      receiverVerified,
      privateOutcomeVerified,
    },
    counts: {
      cta: row.cta,
      intake: row.intake,
      delivery: row.delivery,
      reviewed: row.reviewed,
      qualified: row.qualified,
      opportunity: row.opportunity,
      won: row.won,
      revenueReconciledWin: row.revenueReconciledWin,
    },
    conversions: {
      ctaToIntake: rate(row.intake, row.cta),
      intakeToDelivery: rate(row.delivery, row.intake),
      deliveryToReviewed: rate(row.reviewed, row.delivery),
      reviewedToQualified: rate(row.qualified, row.reviewed),
      qualifiedToOpportunity: rate(row.opportunity, row.qualified),
      opportunityToWon: rate(row.won, row.opportunity),
      revenueReconciledCoverage: rate(row.revenueReconciledWin, row.won),
    },
    commercialValueConclusion: state === "verified_chain" ? "verified_aggregate_chain" as const
      : state === "owner_reported_chain" ? "owner_reported_not_verified" as const
      : state === "inconsistent" ? "blocked_by_integrity" as const
      : "unknown_due_to_missing_evidence" as const,
  };
};

export const findOwnersMissingReceiverDelivery = (rows: GeoOwnerFunnelAggregate[]) => rows
  .filter((row) => row.intake !== null && row.intake > 0)
  .filter((row) => row.delivery === null || row.funnelEvidenceClass !== "production_receiver_verified")
  .map((row) => ({
    canonicalOwner: row.canonicalOwner,
    windowDays: row.windowDays,
    intake: row.intake,
    delivery: row.delivery,
    evidenceClass: row.funnelEvidenceClass,
    gap: row.delivery === null ? "delivery_count_missing" as const : "receiver_verification_missing" as const,
  }));

export const buildGeoAnalyticsExactOnceGate = (receipts: GeoAnalyticsReceipt[]) => {
  const health = buildGeoAnalyticsReceiptHealth(receipts);
  const latestReal = health.latestRealReceipts;
  return {
    latestRealReceiptCount: latestReal.length,
    exactOnceVerifiedCount: health.exactOnce.length,
    duplicateCount: health.duplicateReceipt.length,
    missingCount: health.missingReceipt.length,
    privacyIssueCount: health.parameterPrivacyIssues.length,
    completenessIssueCount: health.parameterCompletenessIssues.length,
    ready:
      latestReal.length > 0 &&
      health.exactOnce.length === latestReal.length &&
      health.duplicateReceipt.length === 0 &&
      health.missingReceipt.length === 0 &&
      health.parameterPrivacyIssues.length === 0 &&
      health.parameterCompletenessIssues.length === 0,
    rule: "Exact-once is verified only by real platform_verified observed_once receipts with the canonical parameter contract.",
  };
};

export const buildGeoAiReferralAttributionHealth = (rows: GeoAiReferralAggregate[], windowDays: GeoWindowDays) => {
  const scorecard = buildGeoAiReferralScorecard(rows, windowDays);
  return {
    ...scorecard,
    providerAttributionComplete: scorecard.totals.unresolvedLandingSessions === 0,
    unresolvedProviderSessions: scorecard.totals.unresolvedLandingSessions,
    rule: "Unresolved AI referrals remain unresolved. A provider is never guessed from ambiguous traffic.",
  };
};

export const summarizeGeoLeadQuality = (rows: GeoOwnerFunnelAggregate[], windowDays: GeoWindowDays) => rows
  .filter((row) => row.windowDays === windowDays)
  .map((row) => {
    const chain = buildGeoOwnerCommercialChain(row);
    return {
      canonicalOwner: row.canonicalOwner,
      windowDays,
      delivered: row.delivery,
      reviewed: row.reviewed,
      qualified: row.qualified,
      opportunity: row.opportunity,
      won: row.won,
      outcomeEvidenceClass: row.outcomeEvidenceClass,
      qualificationState: row.reviewed === null || row.qualified === null
        ? "qualification_evidence_missing" as const
        : row.outcomeEvidenceClass === "private_operations_verified"
          ? "private_operations_verified" as const
          : "reported_not_private_verified" as const,
      reviewedToQualifiedRate: chain.conversions.reviewedToQualified,
    };
  });

const comparableEvidence = (left: GeoOwnerFunnelAggregate, right: GeoOwnerFunnelAggregate) =>
  left.windowDays === right.windowDays &&
  left.funnelEvidenceClass === right.funnelEvidenceClass &&
  left.outcomeEvidenceClass === right.outcomeEvidenceClass;

export const compareGeoOwnerCommercialFunnels = (current: GeoOwnerFunnelAggregate, previous: GeoOwnerFunnelAggregate) => {
  if (current.canonicalOwner !== previous.canonicalOwner) return { state: "not_comparable" as const, reasons: ["canonical_owner_changed"], deltas: null };
  const reasons: string[] = [];
  if (current.windowDays !== previous.windowDays) reasons.push("window_changed");
  if (current.funnelEvidenceClass !== previous.funnelEvidenceClass) reasons.push("funnel_evidence_class_changed");
  if (current.outcomeEvidenceClass !== previous.outcomeEvidenceClass) reasons.push("outcome_evidence_class_changed");
  if (!comparableEvidence(current, previous)) return { state: "not_comparable" as const, reasons, deltas: null };
  const metricDelta = (key: keyof Pick<GeoOwnerFunnelAggregate, "cta" | "intake" | "delivery" | "reviewed" | "qualified" | "opportunity" | "won" | "revenueReconciledWin">) =>
    current[key] === null || previous[key] === null ? null : (current[key] as number) - (previous[key] as number);
  return {
    state: "comparable" as const,
    reasons: [],
    deltas: {
      cta: metricDelta("cta"),
      intake: metricDelta("intake"),
      delivery: metricDelta("delivery"),
      reviewed: metricDelta("reviewed"),
      qualified: metricDelta("qualified"),
      opportunity: metricDelta("opportunity"),
      won: metricDelta("won"),
      revenueReconciledWin: metricDelta("revenueReconciledWin"),
    },
  };
};

export const adaptVerifiedCommercialOutcomeChain = (chain: GeoCommercialOutcomeChain): GeoOwnerFunnelAggregate => ({
  canonicalOwner: chain.canonicalOwner,
  windowDays: chain.windowDays as GeoWindowDays,
  cta: null,
  intake: null,
  delivery: chain.counts.delivered,
  reviewed: chain.counts.reviewed,
  qualified: chain.counts.qualified,
  opportunity: chain.counts.opportunity,
  won: chain.counts.won,
  revenueReconciledWin: chain.counts.revenue_reconciled_win,
  funnelEvidenceClass: chain.evidenceClasses.delivered ?? "unverified",
  outcomeEvidenceClass: chain.verifiedChainComplete ? "private_operations_verified" :
    chain.evidenceClasses.qualified === "owner_provided_handoff" ? "owner_provided_handoff" : "unverified",
});

export const buildGeoCommercialNextActionQueue = (rows: GeoOwnerFunnelAggregate[]) => rows.flatMap((row) => {
  const chain = buildGeoOwnerCommercialChain(row);
  if (chain.state === "inconsistent") return [{
    canonicalOwner: row.canonicalOwner,
    priority: 1 as const,
    action: "repair_integrity" as const,
    reason: chain.integrityIssues.join(","),
  }];
  if (row.intake !== null && row.intake > 0 && (row.delivery === null || row.funnelEvidenceClass !== "production_receiver_verified")) return [{
    canonicalOwner: row.canonicalOwner,
    priority: 1 as const,
    action: "verify_receiver_delivery" as const,
    reason: "Intake exists without receiver-confirmed delivery evidence.",
  }];
  if (row.delivery !== null && row.delivery > 0 && (row.reviewed === null || row.qualified === null)) return [{
    canonicalOwner: row.canonicalOwner,
    priority: 2 as const,
    action: "collect_private_qualification_aggregate" as const,
    reason: "Delivery exists but aggregate human review/qualification evidence is incomplete.",
  }];
  if (row.qualified !== null && row.qualified > 0 && row.opportunity === null) return [{
    canonicalOwner: row.canonicalOwner,
    priority: 2 as const,
    action: "reconcile_opportunity_outcomes" as const,
    reason: "Qualified demand exists without opportunity evidence.",
  }];
  if (row.won !== null && row.won > 0 && row.revenueReconciledWin === null) return [{
    canonicalOwner: row.canonicalOwner,
    priority: 3 as const,
    action: "reconcile_won_outcomes" as const,
    reason: "Wins are reported without revenue-reconciled win coverage evidence.",
  }];
  if (chain.state === "verified_chain") return [{
    canonicalOwner: row.canonicalOwner,
    priority: 4 as const,
    action: "observe_comparable_window" as const,
    reason: "Verified aggregate chain is complete; wait for a comparable next window before changing the funnel.",
  }];
  return [{
    canonicalOwner: row.canonicalOwner,
    priority: 3 as const,
    action: "fill_missing_aggregate_evidence" as const,
    reason: `Missing stages: ${chain.missingStages.join(",") || "none"}.`,
  }];
}).sort((a, b) => a.priority - b.priority || a.canonicalOwner.localeCompare(b.canonicalOwner));

export const assertGeoCommercialFunnelPrivacySafe = (value: unknown) => {
  const serialized = JSON.stringify(value).toLowerCase();
  for (const prohibited of ["email", "phone", "first_name", "last_name", "full_name", "user_id", "lead_id", "company_name", "mc_number", "usdot", "vin", "revenue_amount", "deal_amount", "message_body"]) {
    if (serialized.includes(prohibited)) throw new Error(`Commercial funnel aggregate contains prohibited user-level/private field token: ${prohibited}`);
  }
  return true;
};
