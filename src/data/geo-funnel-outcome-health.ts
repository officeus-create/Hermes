import type { GeoEvidenceClass, GeoWindowDays } from "./geo-measurement-layer.ts";
import type { GeoOwnerMeasurementRecord } from "./geo-owner-measurement.ts";

export type GeoFunnelStage = "cta" | "intake" | "preview" | "handoff" | "delivery";
export type GeoOutcomeStage = "reviewed" | "qualified" | "opportunity" | "won" | "lost" | "revenue_reconciled";

export interface GeoFunnelCompletenessRecord {
  canonicalOwner: string;
  windowDays: GeoWindowDays;
  evidenceClasses: GeoEvidenceClass[];
  counts: Record<GeoFunnelStage, number>;
  presentStages: GeoFunnelStage[];
  missingEvidence: boolean;
  stageOrderIntegrity: boolean;
}

export interface GeoOutcomeCompletenessRecord {
  canonicalOwner: string;
  windowDays: GeoWindowDays;
  evidenceClasses: GeoEvidenceClass[];
  counts: Record<GeoOutcomeStage, number>;
  unresolvedOpportunities: number;
  deliveredToReviewedIntegrity: boolean;
  stageOrderIntegrity: boolean;
  revenueReconciledWinCoverageRate: number;
}

export interface GeoNestedWindowDiagnostic {
  canonicalOwner: string;
  metric:
    | GeoFunnelStage
    | "reviewed"
    | "qualified"
    | "opportunity"
    | "won"
    | "lost";
  sevenDay: number;
  twentyEightDay: number;
  ninetyDay: number;
  state: "nested_order_consistent" | "nested_order_inversion" | "insufficient_windows";
  note: string;
}

export interface GeoQualifiedDemandRankRecord {
  rank: number;
  canonicalOwner: string;
  windowDays: GeoWindowDays;
  qualifiedLeads: number;
  opportunities: number;
  wins: number;
  revenueReconciledWins: number;
  evidenceClasses: {
    funnel: GeoEvidenceClass[];
    outcomes: GeoEvidenceClass[];
  };
}

export interface GeoDeliveryEventRemediationProposal {
  family: "seo" | "website_project";
  proposedEventName: "seo_delivery_confirmed" | "website_project_delivery_confirmed";
  status: "proposal_only_not_instrumented";
  runtimeRegistryChanged: false;
  requiredProofBeforeInstrumentation: string[];
}

export const geoDeliveryEventRemediationProposals: GeoDeliveryEventRemediationProposal[] = [
  {
    family: "seo",
    proposedEventName: "seo_delivery_confirmed",
    status: "proposal_only_not_instrumented",
    runtimeRegistryChanged: false,
    requiredProofBeforeInstrumentation: [
      "Confirm the real receiver-side delivery boundary for SEO inquiries.",
      "Prove the existing Hermes GA4 property receives the current canonical SEO events exactly once.",
      "Verify the new delivery signal can be emitted without PII, lead content, account IDs, or duplicate client/server receipts.",
      "Add production receiver verification before using the event as delivery evidence.",
    ],
  },
  {
    family: "website_project",
    proposedEventName: "website_project_delivery_confirmed",
    status: "proposal_only_not_instrumented",
    runtimeRegistryChanged: false,
    requiredProofBeforeInstrumentation: [
      "Confirm the real receiver-side delivery boundary for website-project inquiries.",
      "Prove the existing Hermes GA4 property receives the current canonical website-project events exactly once.",
      "Verify the new delivery signal can be emitted without PII, project brief content, account IDs, or duplicate client/server receipts.",
      "Add production receiver verification before using the event as delivery evidence.",
    ],
  },
];

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const stages: GeoFunnelStage[] = ["cta", "intake", "preview", "handoff", "delivery"];

const funnelCounts = (record: GeoOwnerMeasurementRecord): Record<GeoFunnelStage, number> => ({
  cta: record.scorecard.funnel.ctaClicks,
  intake: record.scorecard.funnel.intakeStarts,
  preview: record.scorecard.funnel.previewReady,
  handoff: record.scorecard.funnel.handoffReady,
  delivery: record.scorecard.funnel.deliveryConfirmed,
});

const outcomeCounts = (record: GeoOwnerMeasurementRecord): Record<GeoOutcomeStage, number> => ({
  reviewed: record.scorecard.leadQuality.reviewedInquiries,
  qualified: record.scorecard.leadQuality.qualifiedLeads,
  opportunity: record.scorecard.leadQuality.opportunities,
  won: record.scorecard.leadQuality.wins,
  lost: record.scorecard.leadQuality.losses,
  revenue_reconciled: record.scorecard.leadQuality.revenueReconciledWins,
});

const funnelOrderIntegrity = (counts: Record<GeoFunnelStage, number>) =>
  counts.intake <= counts.cta &&
  counts.preview <= counts.intake &&
  counts.handoff <= counts.preview &&
  counts.delivery <= counts.handoff;

const outcomeOrderIntegrity = (counts: Record<GeoOutcomeStage, number>) =>
  counts.qualified <= counts.reviewed &&
  counts.opportunity <= counts.qualified &&
  counts.won + counts.lost <= counts.opportunity &&
  counts.revenue_reconciled <= counts.won;

export const buildGeoFunnelOutcomeCompleteness = (
  ownerLayers: Array<{ windowDays: GeoWindowDays; owners: GeoOwnerMeasurementRecord[] }>,
) => {
  const funnel: GeoFunnelCompletenessRecord[] = [];
  const outcomes: GeoOutcomeCompletenessRecord[] = [];

  for (const layer of ownerLayers) {
    for (const owner of layer.owners) {
      const fCounts = funnelCounts(owner);
      const oCounts = outcomeCounts(owner);
      funnel.push({
        canonicalOwner: owner.canonicalOwner,
        windowDays: layer.windowDays,
        evidenceClasses: owner.scorecard.evidence.funnel,
        counts: fCounts,
        presentStages: stages.filter((stage) => fCounts[stage] > 0),
        missingEvidence: owner.scorecard.evidence.funnel.length === 0,
        stageOrderIntegrity: funnelOrderIntegrity(fCounts),
      });

      const delivered = fCounts.delivery;
      const reviewed = oCounts.reviewed;
      outcomes.push({
        canonicalOwner: owner.canonicalOwner,
        windowDays: layer.windowDays,
        evidenceClasses: owner.scorecard.evidence.outcomes,
        counts: oCounts,
        unresolvedOpportunities: Math.max(0, oCounts.opportunity - oCounts.won - oCounts.lost),
        deliveredToReviewedIntegrity:
          reviewed === 0 || (delivered > 0 && reviewed <= delivered),
        stageOrderIntegrity: outcomeOrderIntegrity(oCounts),
        revenueReconciledWinCoverageRate: rate(oCounts.revenue_reconciled, oCounts.won),
      });
    }
  }

  const sort = <T extends { canonicalOwner: string; windowDays: GeoWindowDays }>(rows: T[]) =>
    rows.sort(
      (left, right) =>
        left.canonicalOwner.localeCompare(right.canonicalOwner) || left.windowDays - right.windowDays,
    );

  return { funnel: sort(funnel), outcomes: sort(outcomes) };
};

const metricValue = (
  record: GeoOwnerMeasurementRecord,
  metric: GeoNestedWindowDiagnostic["metric"],
) => {
  const f = funnelCounts(record);
  const o = outcomeCounts(record);
  if (metric in f) return f[metric as GeoFunnelStage];
  return o[metric as Exclude<GeoOutcomeStage, "revenue_reconciled">];
};

export const buildGeoNestedWindowDiagnostics = (
  ownerLayers: Array<{ windowDays: GeoWindowDays; owners: GeoOwnerMeasurementRecord[] }>,
): GeoNestedWindowDiagnostic[] => {
  const byOwner = new Map<string, Map<GeoWindowDays, GeoOwnerMeasurementRecord>>();
  for (const layer of ownerLayers) {
    for (const owner of layer.owners) {
      const windows = byOwner.get(owner.canonicalOwner) ?? new Map<GeoWindowDays, GeoOwnerMeasurementRecord>();
      windows.set(layer.windowDays, owner);
      byOwner.set(owner.canonicalOwner, windows);
    }
  }

  const metrics: GeoNestedWindowDiagnostic["metric"][] = [
    "cta",
    "intake",
    "preview",
    "handoff",
    "delivery",
    "reviewed",
    "qualified",
    "opportunity",
    "won",
    "lost",
  ];

  const result: GeoNestedWindowDiagnostic[] = [];
  for (const [canonicalOwner, windows] of byOwner) {
    for (const metric of metrics) {
      const seven = windows.get(7);
      const twentyEight = windows.get(28);
      const ninety = windows.get(90);
      if (!seven || !twentyEight || !ninety) {
        result.push({
          canonicalOwner,
          metric,
          sevenDay: seven ? metricValue(seven, metric) : 0,
          twentyEightDay: twentyEight ? metricValue(twentyEight, metric) : 0,
          ninetyDay: ninety ? metricValue(ninety, metric) : 0,
          state: "insufficient_windows",
          note: "Nested-window consistency cannot be evaluated because one or more standard windows are absent.",
        });
        continue;
      }
      const sevenDay = metricValue(seven, metric);
      const twentyEightDay = metricValue(twentyEight, metric);
      const ninetyDay = metricValue(ninety, metric);
      const consistent = sevenDay <= twentyEightDay && twentyEightDay <= ninetyDay;
      result.push({
        canonicalOwner,
        metric,
        sevenDay,
        twentyEightDay,
        ninetyDay,
        state: consistent ? "nested_order_consistent" : "nested_order_inversion",
        note:
          "This checks aggregate nested-window ordering only. It does not assume the same lead cohort or infer funnel progression across windows.",
      });
    }
  }

  return result.sort(
    (left, right) =>
      left.canonicalOwner.localeCompare(right.canonicalOwner) || left.metric.localeCompare(right.metric),
  );
};

const containsUnverified = (classes: GeoEvidenceClass[]) => classes.includes("unverified");

export const buildGeoQualifiedDemandRanking = (
  ownerLayers: Array<{ windowDays: GeoWindowDays; owners: GeoOwnerMeasurementRecord[] }>,
  windowDays: GeoWindowDays,
): GeoQualifiedDemandRankRecord[] => {
  const layer = ownerLayers.find((item) => item.windowDays === windowDays);
  if (!layer) return [];

  const eligible = layer.owners.filter((owner) =>
    owner.reconciliation.status === "complete" &&
    owner.scorecard.evidence.funnel.length > 0 &&
    owner.scorecard.evidence.outcomes.length > 0 &&
    !containsUnverified(owner.scorecard.evidence.funnel) &&
    !containsUnverified(owner.scorecard.evidence.outcomes),
  );

  return eligible
    .map((owner) => ({
      rank: 0,
      canonicalOwner: owner.canonicalOwner,
      windowDays,
      qualifiedLeads: owner.scorecard.leadQuality.qualifiedLeads,
      opportunities: owner.scorecard.leadQuality.opportunities,
      wins: owner.scorecard.leadQuality.wins,
      revenueReconciledWins: owner.scorecard.leadQuality.revenueReconciledWins,
      evidenceClasses: {
        funnel: owner.scorecard.evidence.funnel,
        outcomes: owner.scorecard.evidence.outcomes,
      },
    }))
    .sort(
      (left, right) =>
        right.qualifiedLeads - left.qualifiedLeads ||
        right.opportunities - left.opportunities ||
        right.wins - left.wins ||
        left.canonicalOwner.localeCompare(right.canonicalOwner),
    )
    .map((record, index) => ({ ...record, rank: index + 1 }));
};
