import { digitalNicheServicePages } from "./digital-niche-service-pages.ts";
import {
  geoFreshGscCheckpoint20260819,
  type GeoGscExactCheckpoint,
  validateGeoGscExactCheckpoint,
} from "./geo-gsc-fresh-checkpoint.ts";

export const logisticsSeoCanonicalOwner = "/services/seo-for-logistics-companies/" as const;
export const logisticsSeoIntakeHref = "/paths/marketing/?service=logistics_seo#contact" as const;

export type GeoLogisticsSeoAuditState = "pass" | "review" | "hold";
export type GeoLogisticsSeoDefectType =
  | "metadata_outcome_evidence_required"
  | "metadata_offer_message_mismatch"
  | "brand_relationship_review_required"
  | "first_screen_intent_gap"
  | "evidence_coverage_gap"
  | "inbound_link_gap"
  | "cta_owner_mismatch";

export interface GeoLogisticsSeoDefect {
  type: GeoLogisticsSeoDefectType;
  severity: "P0" | "P1" | "P2";
  evidenceReference: string;
  detail: string;
}

export interface GeoLogisticsSeoOwnerSnapshot {
  canonicalOwner: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  heroCtaHref: string;
  heroCtaLabel: string;
  serviceGroup: string;
  reviewedAt: string;
  inboundLinks: Array<{
    sourceOwner: string;
    sourceType: "service" | "case" | "resource" | "hub";
    href: string;
    evidenceReference: string;
  }>;
  claimEvidence: Array<{
    claimKey: string;
    state: "supported_first_party" | "requires_additional_evidence";
    evidenceReference: string;
  }>;
}

const base = digitalNicheServicePages.logisticsSeo;

export const currentLogisticsSeoOwnerSnapshot: GeoLogisticsSeoOwnerSnapshot = {
  canonicalOwner: logisticsSeoCanonicalOwner,
  title: base.title,
  description: base.description,
  eyebrow: base.eyebrow,
  h1: "Logistics SEO for Trucking, Transportation and Freight Companies",
  intro:
    "A logistics SEO program should help the right buyer find the right service page, understand what the company actually does, and reach a useful next step without forcing every trucking, transportation, freight, dispatch, warehouse, equipment or city keyword into a separate page. Hermes combines technical SEO, query-to-page ownership, commercial content architecture, internal linking, conversion review and privacy-safe measurement for logistics businesses that need clearer search demand and better-qualified inquiries.",
  heroCtaHref: logisticsSeoIntakeHref,
  heroCtaLabel: "Start a logistics SEO review",
  serviceGroup: "logistics_seo",
  reviewedAt: "2026-08-13",
  inboundLinks: [
    {
      sourceOwner: "/services/seo/",
      sourceType: "service",
      href: logisticsSeoCanonicalOwner,
      evidenceReference: "repo:src/pages/services/seo/index.astro",
    },
    {
      sourceOwner: "/case/",
      sourceType: "case",
      href: logisticsSeoCanonicalOwner,
      evidenceReference: "repo:src/pages/case/index.astro",
    },
    {
      sourceOwner: "/resources/logistics-seo-audit-sample/",
      sourceType: "resource",
      href: logisticsSeoCanonicalOwner,
      evidenceReference: "repo:src/pages/resources/logistics-seo-audit-sample/index.astro",
    },
  ],
  claimEvidence: [
    {
      claimKey: "logistics_seo_scope_and_method",
      state: "supported_first_party",
      evidenceReference: "repo:src/pages/services/seo-for-logistics-companies/index.astro",
    },
    {
      claimKey: "proven_growth_system",
      state: "requires_additional_evidence",
      evidenceReference: "repo:src/data/digital-niche-service-pages.ts#logisticsSeo.description",
    },
    {
      claimKey: "free_audit_scope_offer",
      state: "requires_additional_evidence",
      evidenceReference: "repo:src/data/digital-niche-service-pages.ts#logisticsSeo.description",
    },
  ],
};

const cleanPath = (value: string) => value.startsWith("/") && !value.startsWith("//") && !/[?#]/.test(value);
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const inclusiveDays = (start: string, end: string) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;

export const auditLogisticsSeoOwnerAgainstFreshDemand = (
  snapshot: GeoLogisticsSeoOwnerSnapshot = currentLogisticsSeoOwnerSnapshot,
  checkpoint: GeoGscExactCheckpoint = geoFreshGscCheckpoint20260819,
) => {
  validateGeoGscExactCheckpoint(checkpoint);
  if (snapshot.canonicalOwner !== logisticsSeoCanonicalOwner) throw new Error(`Unexpected Logistics SEO canonical owner`);
  const pageEvidence = checkpoint.pages.find((page) => page.canonicalOwner === logisticsSeoCanonicalOwner);
  if (!pageEvidence) throw new Error(`Fresh checkpoint is missing Logistics SEO owner evidence`);

  const defects: GeoLogisticsSeoDefect[] = [];
  const lowerTitle = snapshot.title.toLowerCase();
  const lowerDescription = snapshot.description.toLowerCase();
  const lowerHero = `${snapshot.h1} ${snapshot.intro}`.toLowerCase();

  const titleRelevant = lowerTitle.includes("logistics") && (lowerTitle.includes("trucking") || lowerTitle.includes("transport"));
  const descriptionRelevant = lowerDescription.includes("logistics") && lowerDescription.includes("seo");
  const firstScreenClear =
    lowerHero.includes("logistics seo") &&
    ["trucking", "transportation", "freight"].some((term) => lowerHero.includes(term)) &&
    lowerHero.includes("search") &&
    lowerHero.includes("inquir");

  if (!firstScreenClear) defects.push({
    type: "first_screen_intent_gap",
    severity: "P1",
    evidenceReference: "repo:src/pages/services/seo-for-logistics-companies/index.astro",
    detail: "The first screen does not clearly connect Logistics SEO buyer intent to search demand and a qualified inquiry path.",
  });

  if (/proven growth system/i.test(snapshot.description)) defects.push({
    type: "metadata_outcome_evidence_required",
    severity: "P1",
    evidenceReference: "repo:src/data/digital-niche-service-pages.ts#logisticsSeo.description",
    detail: "The metadata phrase 'Proven Growth System' requires dated performance evidence stronger than first-party implementation evidence before it should function as an outcome claim.",
  });

  if (/free audit scope/i.test(snapshot.description) && !/free/i.test(snapshot.heroCtaLabel)) defects.push({
    type: "metadata_offer_message_mismatch",
    severity: "P1",
    evidenceReference: "repo:metadata-vs-live-logistics-seo-cta",
    detail: "Search metadata promises a free audit scope while the live primary CTA asks the visitor to start a Logistics SEO review. This is a messaging/evidence mismatch, not proof that a free offer exists or does not exist.",
  });

  if (/progressopro/i.test(snapshot.eyebrow)) defects.push({
    type: "brand_relationship_review_required",
    severity: "P2",
    evidenceReference: "repo:src/data/public-entity-registry.ts#progressopro_marketing",
    detail: "The visible ProgressoPro label remains subject to the governed cross-entity relationship hold and should not be used as proof of an approved same-entity relationship.",
  });

  const unsupportedClaims = snapshot.claimEvidence.filter((claim) => claim.state === "requires_additional_evidence");
  if (unsupportedClaims.length) defects.push({
    type: "evidence_coverage_gap",
    severity: "P1",
    evidenceReference: unsupportedClaims.map((claim) => claim.evidenceReference).join(" | "),
    detail: `Claims requiring additional evidence: ${unsupportedClaims.map((claim) => claim.claimKey).join(", ")}.`,
  });

  const inboundTypes = new Set(snapshot.inboundLinks.filter((link) => link.href === logisticsSeoCanonicalOwner).map((link) => link.sourceType));
  const minimumInboundTypes = ["service", "case", "resource"] as const;
  const missingInboundTypes = minimumInboundTypes.filter((type) => !inboundTypes.has(type));
  if (missingInboundTypes.length) defects.push({
    type: "inbound_link_gap",
    severity: "P2",
    evidenceReference: "repo:reviewed-logistics-seo-inbound-map",
    detail: `Missing reviewed inbound owner types: ${missingInboundTypes.join(", ")}.`,
  });

  const ctaConsistent = snapshot.heroCtaHref === logisticsSeoIntakeHref && snapshot.serviceGroup === "logistics_seo";
  if (!ctaConsistent) defects.push({
    type: "cta_owner_mismatch",
    severity: "P0",
    evidenceReference: "repo:src/components/DigitalServicePage.astro#seoFunnels",
    detail: "The Logistics SEO search owner must route to the Marketing intake with service=logistics_seo and preserve the logistics_seo event/service group.",
  });

  const concreteDefects = defects.filter((defect) => defect.type !== "brand_relationship_review_required");
  return {
    canonicalOwner: snapshot.canonicalOwner,
    checkpoint: {
      startDate: checkpoint.startDate,
      endDate: checkpoint.endDate,
      inclusiveDays: checkpoint.inclusiveDays,
      evidenceClass: checkpoint.evidenceClass,
      impressions: pageEvidence.impressions,
      clicks: pageEvidence.clicks,
      ctr: pageEvidence.ctr,
      averagePosition: pageEvidence.averagePosition,
      usScoped: false,
    },
    intentAudit: {
      titleRelevant,
      descriptionRelevant,
      firstScreenClear,
    },
    inboundAudit: {
      reviewedInboundCount: snapshot.inboundLinks.filter((link) => link.href === logisticsSeoCanonicalOwner).length,
      sourceTypes: [...inboundTypes].sort(),
      missingRequiredTypes: missingInboundTypes,
    },
    ctaAudit: {
      consistent: ctaConsistent,
      expectedHref: logisticsSeoIntakeHref,
      actualHref: snapshot.heroCtaHref,
      serviceGroup: snapshot.serviceGroup,
    },
    defects,
    rewritePolicy: {
      noRepeatRewrite: true,
      concreteDefectFound: concreteDefects.length > 0,
      rewriteEligible: concreteDefects.length > 0,
      publishChangeNow: false,
      reason: concreteDefects.length
        ? "A bounded change may be designed only around the identified defect; publishing remains held until the change is isolated and a comparable observation plan exists."
        : "Fresh impressions alone do not justify another rewrite.",
    },
  };
};

export type GeoSnippetExperimentEvidenceClass = "platform_verified" | "owner_provided_handoff";
export interface GeoSnippetExperimentWindow {
  startDate: string;
  endDate: string;
  geography: string;
  scope: "owner";
  source: "gsc";
  evidenceClass: GeoSnippetExperimentEvidenceClass;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
}

export interface GeoSnippetExperiment {
  experimentId: string;
  canonicalOwner: string;
  changedFields: Array<"title" | "description">;
  changeStartedAt: string;
  pre: GeoSnippetExperimentWindow;
  post: GeoSnippetExperimentWindow;
}

const validateExperimentWindow = (window: GeoSnippetExperimentWindow, label: string) => {
  if (!dateOnly.test(window.startDate) || !dateOnly.test(window.endDate)) throw new Error(`${label} dates must use YYYY-MM-DD`);
  if (inclusiveDays(window.startDate, window.endDate) < 1) throw new Error(`${label} endDate precedes startDate`);
  if (window.scope !== "owner" || window.source !== "gsc") throw new Error(`${label} must be owner-scoped GSC evidence`);
  for (const [field, value] of [["impressions", window.impressions], ["clicks", window.clicks], ["ctr", window.ctr], ["averagePosition", window.averagePosition]] as const) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label}.${field} must be non-negative`);
  }
  if (window.clicks > window.impressions) throw new Error(`${label} clicks cannot exceed impressions`);
  const expectedCtr = window.impressions === 0 ? 0 : Number(((window.clicks / window.impressions) * 100).toFixed(2));
  if (window.ctr !== expectedCtr) throw new Error(`${label} CTR does not reconcile`);
  return window;
};

export const validateLogisticsSeoSnippetExperiment = (experiment: GeoSnippetExperiment) => {
  if (!experiment.experimentId.trim()) throw new Error(`experimentId is required`);
  if (experiment.canonicalOwner !== logisticsSeoCanonicalOwner) throw new Error(`Experiment must target the Logistics SEO canonical owner`);
  if (!experiment.changedFields.length || new Set(experiment.changedFields).size !== experiment.changedFields.length) throw new Error(`Experiment requires distinct changedFields`);
  if (!Number.isFinite(Date.parse(experiment.changeStartedAt))) throw new Error(`changeStartedAt must be a valid timestamp`);
  validateExperimentWindow(experiment.pre, "pre");
  validateExperimentWindow(experiment.post, "post");
  const preDays = inclusiveDays(experiment.pre.startDate, experiment.pre.endDate);
  const postDays = inclusiveDays(experiment.post.startDate, experiment.post.endDate);
  if (preDays !== postDays) throw new Error(`Snippet experiment pre/post windows must have equal duration`);
  if (experiment.pre.geography !== experiment.post.geography) throw new Error(`Snippet experiment geography must match`);
  if (experiment.pre.evidenceClass !== experiment.post.evidenceClass) throw new Error(`Snippet experiment evidence class must match`);
  if (Date.parse(`${experiment.pre.endDate}T23:59:59Z`) >= Date.parse(experiment.changeStartedAt)) throw new Error(`Pre window must end before the change starts`);
  if (Date.parse(`${experiment.post.startDate}T00:00:00Z`) <= Date.parse(experiment.changeStartedAt)) throw new Error(`Post window must start after the change starts`);
  return { comparable: true as const, windowDays: preDays };
};

export type GeoOwnerChangeCategory = "metadata" | "content" | "internal_links" | "cta" | "schema";
export interface GeoOwnerChangeRecord {
  changeId: string;
  canonicalOwner: string;
  category: GeoOwnerChangeCategory;
  fields: string[];
  startedAt: string;
  endedAt: string | null;
  evidenceReference: string;
}

export const auditLogisticsSeoChangeAttribution = (changes: GeoOwnerChangeRecord[]) => {
  for (const change of changes) {
    if (!change.changeId.trim() || !change.evidenceReference.trim()) throw new Error(`Owner changes require changeId and evidenceReference`);
    if (change.canonicalOwner !== logisticsSeoCanonicalOwner) throw new Error(`Change log contains a different canonical owner`);
    if (!change.fields.length) throw new Error(`Owner change requires changed fields`);
    if (!Number.isFinite(Date.parse(change.startedAt))) throw new Error(`Owner change startedAt is invalid`);
    if (change.endedAt && !Number.isFinite(Date.parse(change.endedAt))) throw new Error(`Owner change endedAt is invalid`);
  }
  const active = changes.filter((change) => change.endedAt === null);
  const fieldOwners = new Map<string, string>();
  const fieldConflicts: string[] = [];
  for (const change of active) {
    for (const field of change.fields) {
      const existing = fieldOwners.get(field);
      if (existing && existing !== change.changeId) fieldConflicts.push(`${field}:${existing}:${change.changeId}`);
      fieldOwners.set(field, change.changeId);
    }
  }
  return {
    activeChangeIds: active.map((change) => change.changeId),
    attributionState: active.length <= 1 && fieldConflicts.length === 0 ? "isolated" as const : "confounded" as const,
    fieldConflicts,
    canStartSnippetExperiment: active.length <= 1 && fieldConflicts.length === 0,
  };
};
