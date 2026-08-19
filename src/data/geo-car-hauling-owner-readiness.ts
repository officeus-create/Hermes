import type { AiVisibilityObservation } from "./ai-visibility-scorecard.ts";
import { evaluateAiVisibilityObservation } from "./geo-ai-observation-evaluation.ts";
import { geoCarHaulingAnswerCandidate } from "./geo-car-hauling-answer-candidate.ts";
import {
  geoFreshGscCheckpoint20260819,
  type GeoGscExactCheckpoint,
  validateGeoGscExactCheckpoint,
} from "./geo-gsc-fresh-checkpoint.ts";

export const carHaulingCanonicalOwner = "/logistics/car-hauling-dispatch/" as const;
export const carHaulingPrimaryAction = "/logistics/start-car-hauling-dispatch/" as const;
export const carHaulingRequiredRelatedOwners = [
  "/logistics/resources/broker-setup-packet-checklist/",
  "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  "/logistics/direct-vehicle-transport-network/",
] as const;

export interface GeoCarHaulingProductionSnapshot {
  canonicalOwner: string;
  title: string;
  h1: string;
  intro: string;
  primaryAction: string;
  audienceText: string[];
  faqText: string[];
  relatedOwners: string[];
  reviewedAt: string;
}

export const currentCarHaulingProductionSnapshot: GeoCarHaulingProductionSnapshot = {
  canonicalOwner: carHaulingCanonicalOwner,
  title: "Car Hauling Dispatch Services for Owner-Operators | Hermes Logistics",
  h1: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets",
  intro:
    "You do not get just a dispatcher. Hermes can support the work that keeps the truck moving today and the work that can build stronger freight sources for tomorrow. The carrier reviews and approves every load before booking.",
  primaryAction: carHaulingPrimaryAction,
  audienceText: [
    "Owner-operators running hotshot, open, enclosed, wedge, or multi-car equipment",
    "Small fleets that need more search coverage without giving up final load control",
    "Carriers that need broker calls, setup packets, paperwork, invoicing, and daily coordination",
    "Carriers that also want shipper/dealer research, direct-customer development, and evidence-gated route SEO over time",
  ],
  faqText: [
    "Does Hermes guarantee loads, rates, or revenue? No.",
    "Can a new authority start immediately? Not always. Broker requirements, insurance, safety profile, authority age, documentation, and equipment readiness must be reviewed first.",
    "The carrier controls the truck and makes the final load decision.",
  ],
  relatedOwners: [
    "/logistics/start-car-hauling-dispatch/",
    "/logistics/direct-vehicle-transport-network/",
    "/logistics/resources/dispatch-service-vs-self-dispatch/",
    "/paths/logistics/carriers/owner-operators/",
    "/paths/logistics/carriers/fleet-owners/",
    "/paths/logistics/carriers/new-authority/",
    "/logistics/resources/car-hauler-capacity-checklist/",
    "/logistics/dealer-vehicle-transportation/",
  ],
  reviewedAt: "2026-08-19",
};

const cleanPath = (value: string) => value.startsWith("/") && !value.startsWith("//") && !/[?#]/.test(value);
const daysBetween = (older: string, newer: string) => Math.floor((Date.parse(newer) - Date.parse(older)) / 86_400_000);

export const detectPositiveCarHaulingGuarantees = (texts: string[]) => {
  const findings: Array<{ textIndex: number; term: string; excerpt: string }> = [];
  const target = /(?:guarantee(?:s|d)?|guaranteed)\s+(?:a\s+|the\s+|minimum\s+|specific\s+)*(loads?|rates?|lanes?|revenue|customers?)/gi;
  texts.forEach((text, textIndex) => {
    let match: RegExpExecArray | null;
    while ((match = target.exec(text))) {
      const start = Math.max(0, match.index - 36);
      const prefix = text.slice(start, match.index).toLowerCase();
      if (/\b(?:no|not|never|without|does not|do not|cannot|can't)\b[^.!?]{0,28}$/.test(prefix)) continue;
      const nextQuestion = text.indexOf("?", match.index);
      const nextStatementEndCandidates = [text.indexOf(".", match.index), text.indexOf("!", match.index)].filter((index) => index >= 0);
      const nextStatementEnd = nextStatementEndCandidates.length ? Math.min(...nextStatementEndCandidates) : -1;
      if (nextQuestion >= 0 && (nextStatementEnd < 0 || nextQuestion < nextStatementEnd)) continue;
      findings.push({ textIndex, term: match[1].toLowerCase(), excerpt: text.slice(start, Math.min(text.length, target.lastIndex + 36)) });
    }
  });
  return findings;
};

export const auditCarHaulingOwnerReadiness = (
  snapshot: GeoCarHaulingProductionSnapshot = currentCarHaulingProductionSnapshot,
  checkpoint: GeoGscExactCheckpoint = geoFreshGscCheckpoint20260819,
  now = "2026-08-19T12:00:00Z",
) => {
  validateGeoGscExactCheckpoint(checkpoint);
  if (snapshot.canonicalOwner !== carHaulingCanonicalOwner) throw new Error(`Unexpected car-hauling canonical owner`);
  if (!cleanPath(snapshot.primaryAction)) throw new Error(`Car-hauling primary action must be site-relative`);
  const pageEvidence = checkpoint.pages.find((page) => page.canonicalOwner === carHaulingCanonicalOwner);
  if (!pageEvidence) throw new Error(`Fresh checkpoint is missing car-hauling owner evidence`);
  if (geoCarHaulingAnswerCandidate.slug !== carHaulingCanonicalOwner) throw new Error(`GEO answer candidate owner mismatch`);

  const answerEvidence = geoCarHaulingAnswerCandidate.evidence.filter((item) => item.truthLabel === "verified_fact");
  const evidenceAges = answerEvidence.map((item) => item.verifiedAt ? daysBetween(item.verifiedAt, now) : null);
  const staleEvidenceIds = answerEvidence
    .filter((item, index) => evidenceAges[index] === null || (evidenceAges[index] ?? 999) > 28)
    .map((item) => item.id);

  const normalizedAudience = `${snapshot.h1} ${snapshot.intro} ${snapshot.audienceText.join(" ")} ${snapshot.faqText.join(" ")}`.toLowerCase();
  const audienceCoverage = {
    ownerOperator: normalizedAudience.includes("owner-operator"),
    smallFleet: normalizedAudience.includes("small fleet"),
    newAuthorityConditional:
      normalizedAudience.includes("new authority") &&
      (normalizedAudience.includes("not always") || normalizedAudience.includes("readiness") || normalizedAudience.includes("must be reviewed")),
  };

  const missingRelatedOwners = carHaulingRequiredRelatedOwners.filter((owner) => !snapshot.relatedOwners.includes(owner));
  const nextActionConsistent =
    snapshot.primaryAction === carHaulingPrimaryAction &&
    geoCarHaulingAnswerCandidate.layers.nextAction.href === carHaulingPrimaryAction;

  const pageTexts = [snapshot.title, snapshot.h1, snapshot.intro, ...snapshot.audienceText, ...snapshot.faqText];
  const positiveGuarantees = detectPositiveCarHaulingGuarantees(pageTexts);

  const readinessChecks = {
    ownerReconciled: geoCarHaulingAnswerCandidate.slug === snapshot.canonicalOwner,
    searchEvidencePresent: (pageEvidence.impressions ?? 0) > 0,
    answerEvidenceFresh: staleEvidenceIds.length === 0 && answerEvidence.length > 0,
    audienceTruthful: Object.values(audienceCoverage).every(Boolean),
    nextActionConsistent,
    prohibitedGuaranteesClear: positiveGuarantees.length === 0,
    requiredRelatedOwnersComplete: missingRelatedOwners.length === 0,
  };
  const passed = Object.values(readinessChecks).filter(Boolean).length;

  return {
    canonicalOwner: snapshot.canonicalOwner,
    searchEvidence: {
      evidenceClass: checkpoint.evidenceClass,
      exactWindowDays: checkpoint.inclusiveDays,
      impressions: pageEvidence.impressions,
      clicks: pageEvidence.clicks,
      ctr: pageEvidence.ctr,
      averagePosition: pageEvidence.averagePosition,
      usScoped: false,
      performanceConclusionAllowed: false,
    },
    answerEvidence: {
      verifiedFactSourceCount: answerEvidence.length,
      staleEvidenceIds,
      freshnessState: staleEvidenceIds.length ? "review_required" as const : "fresh" as const,
    },
    audienceCoverage,
    nextAction: {
      consistent: nextActionConsistent,
      productionHref: snapshot.primaryAction,
      answerHref: geoCarHaulingAnswerCandidate.layers.nextAction.href,
    },
    relatedOwners: {
      required: [...carHaulingRequiredRelatedOwners],
      missing: missingRelatedOwners,
      complete: missingRelatedOwners.length === 0,
    },
    positiveGuarantees,
    readinessChecks,
    readinessScore: Math.round((passed / Object.keys(readinessChecks).length) * 100),
    readinessMeaning:
      "Engineering/evidence completeness score only. It is not search ranking, AI ranking, carrier performance, load availability, revenue, or market success.",
    visualDecision: missingRelatedOwners.length
      ? {
          state: "semantic_link_gap_only" as const,
          routeToCeoVisualQueue: false,
          reason: "Missing related destinations can be resolved as bounded semantic links if added without changing material layout/composition.",
        }
      : {
          state: "no_material_visual_change_required" as const,
          routeToCeoVisualQueue: false,
          reason: "Current audit does not require a material visual redesign.",
        },
  };
};

export const buildCarHaulingWrongOwnerCitationQueue = (observations: AiVisibilityObservation[]) =>
  observations
    .filter((observation) => !observation.synthetic && observation.promptId === "LOG-01")
    .map((observation) => ({ observation, evaluation: evaluateAiVisibilityObservation(observation) }))
    .filter(({ evaluation }) => evaluation.citationAlignment === "other_hermes_owner" || evaluation.citationAlignment === "unmapped_hermes_path")
    .map(({ observation, evaluation }) => ({
      observationId: observation.id,
      provider: observation.provider,
      canonicalOwner: carHaulingCanonicalOwner,
      citedPath: observation.citedPath,
      alignment: evaluation.citationAlignment,
      action: evaluation.citationAlignment === "other_hermes_owner"
        ? "strengthen_canonical_owner_answer_and_internal_signals" as const
        : "review_unmapped_hermes_citation_path" as const,
      evidenceReference: observation.evidenceReference,
    }));

export interface GeoCarHaulingSemanticSignature {
  h1: string;
  shortAnswer: string;
  primaryActionHref: string;
  carrierControlStatement: string;
  noGuaranteeStatement: string;
}

export const auditCarHaulingMobileSemanticParity = (
  desktop: GeoCarHaulingSemanticSignature,
  mobile: GeoCarHaulingSemanticSignature,
) => {
  const keys = Object.keys(desktop) as Array<keyof GeoCarHaulingSemanticSignature>;
  const mismatches = keys.filter((key) => desktop[key].trim() !== mobile[key].trim());
  return {
    semanticParity: mismatches.length === 0,
    mismatches,
    requiresRedesign: false,
  };
};

export const routeCarHaulingVisualChange = (change: {
  material: boolean;
  changesLayout?: boolean;
  changesHero?: boolean;
  changesCards?: boolean;
  changesTypography?: boolean;
  changesMobileComposition?: boolean;
}) => {
  const visualMaterial = Boolean(
    change.material ||
    change.changesLayout ||
    change.changesHero ||
    change.changesCards ||
    change.changesTypography ||
    change.changesMobileComposition,
  );
  return visualMaterial
    ? { state: "preview_required" as const, queueIssue: 694, productionAllowed: false }
    : { state: "bounded_nonvisual_change" as const, queueIssue: null, productionAllowed: true };
};
