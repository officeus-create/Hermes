export type GeoTruthLabel =
  | "verified_fact"
  | "inference"
  | "internal_hermes_data"
  | "demo"
  | "simulated"
  | "not_configured";

export type GeoEvidenceOrigin =
  | "public_source"
  | "platform_verified"
  | "internal_hermes"
  | "owner_provided_handoff"
  | "demo"
  | "simulated";

export type GeoEntityType =
  | "organization"
  | "service"
  | "audience"
  | "location"
  | "resource"
  | "tool"
  | "process"
  | "provider"
  | "dataset";

export type GeoActionType = "learn" | "compare" | "diagnose" | "estimate" | "prepare" | "contact" | "apply";

export interface GeoEvidenceReference {
  id: string;
  title: string;
  sourceName: string;
  origin: GeoEvidenceOrigin;
  truthLabel: GeoTruthLabel;
  summary: string;
  url?: string;
  verifiedAt?: string;
}

export interface GeoClaim {
  id: string;
  text: string;
  truthLabel: GeoTruthLabel;
  evidenceIds: string[];
}

export interface GeoEntity {
  id: string;
  name: string;
  type: GeoEntityType;
  description: string;
  relationToHermes: string;
  whyItMatters: string;
  truthLabel: GeoTruthLabel;
  evidenceIds: string[];
  /** Existing governed schema identity when one is already approved. */
  schemaId?: string;
  url?: string;
  sameAs?: string[];
}

export interface GeoEntityRelationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationship: string;
  truthLabel: GeoTruthLabel;
  evidenceIds: string[];
}

export interface GeoNextAction {
  label: string;
  href: string;
  actionType: GeoActionType;
  rationale: string;
}

export interface GeoGuidedOption {
  id: string;
  label: string;
  realization: string;
  nextQuestionId?: string;
  outcomeId?: string;
}

export interface GeoGuidedQuestion {
  id: string;
  prompt: string;
  helpText?: string;
  options: GeoGuidedOption[];
}

export interface GeoGuidedOutcome {
  id: string;
  title: string;
  diagnosis: string;
  application: string[];
  nextAction: GeoNextAction;
}

export interface GeoGuidedPath {
  startQuestionId: string;
  questions: GeoGuidedQuestion[];
  outcomes: GeoGuidedOutcome[];
}

export interface GeoAnswerLayers {
  shortAnswer: string;
  why: string[];
  evidenceClaimIds: string[];
  whatItMeansForYou: string[];
  howToApply: string[];
  nextAction: GeoNextAction;
}

export interface GeoAnswerSurface {
  id: string;
  slug: string;
  question: string;
  audience: string;
  intent: string;
  layers: GeoAnswerLayers;
  claims: GeoClaim[];
  evidence: GeoEvidenceReference[];
  entities: GeoEntity[];
  relationships: GeoEntityRelationship[];
  guidedPath?: GeoGuidedPath;
}

const assertNonEmpty = (label: string, value: string) => {
  if (!value.trim()) throw new Error(`${label} must not be empty`);
};

const assertSitePath = (label: string, value: string) => {
  if (!value.startsWith("/")) throw new Error(`${label} must be site-relative`);
};

const assertHttpsIfPresent = (label: string, value?: string) => {
  if (value && !value.startsWith("https://")) throw new Error(`${label} must use https`);
};

const assertUniqueIds = (label: string, values: { id: string }[]) => {
  const ids = values.map((item) => item.id);
  if (ids.some((id) => !id.trim())) throw new Error(`${label} ids must not be empty`);
  if (new Set(ids).size !== ids.length) throw new Error(`${label} ids must be unique`);
};

const requiresEvidence = (truthLabel: GeoTruthLabel) =>
  truthLabel === "verified_fact" || truthLabel === "inference" || truthLabel === "internal_hermes_data";

const validateEvidenceLinks = (
  label: string,
  evidenceIds: string[],
  evidenceById: Map<string, GeoEvidenceReference>,
  truthLabel: GeoTruthLabel,
) => {
  if (requiresEvidence(truthLabel) && evidenceIds.length === 0) {
    throw new Error(`${label} requires evidence`);
  }
  for (const evidenceId of evidenceIds) {
    if (!evidenceById.has(evidenceId)) throw new Error(`${label} references missing evidence ${evidenceId}`);
  }
};

export const validateGeoAnswerSurface = (surface: GeoAnswerSurface) => {
  assertNonEmpty("surface.id", surface.id);
  assertSitePath("surface.slug", surface.slug);
  assertNonEmpty("surface.question", surface.question);
  assertNonEmpty("surface.audience", surface.audience);
  assertNonEmpty("surface.intent", surface.intent);
  assertNonEmpty("layers.shortAnswer", surface.layers.shortAnswer);
  assertSitePath("layers.nextAction.href", surface.layers.nextAction.href);
  assertNonEmpty("layers.nextAction.label", surface.layers.nextAction.label);
  assertNonEmpty("layers.nextAction.rationale", surface.layers.nextAction.rationale);

  assertUniqueIds("claims", surface.claims);
  assertUniqueIds("evidence", surface.evidence);
  assertUniqueIds("entities", surface.entities);
  assertUniqueIds("relationships", surface.relationships);

  const claimById = new Map(surface.claims.map((claim) => [claim.id, claim]));
  const evidenceById = new Map(surface.evidence.map((evidence) => [evidence.id, evidence]));
  const entityById = new Map(surface.entities.map((entity) => [entity.id, entity]));

  for (const evidence of surface.evidence) {
    assertNonEmpty(`evidence.${evidence.id}.title`, evidence.title);
    assertNonEmpty(`evidence.${evidence.id}.sourceName`, evidence.sourceName);
    assertNonEmpty(`evidence.${evidence.id}.summary`, evidence.summary);
    assertHttpsIfPresent(`evidence.${evidence.id}.url`, evidence.url);
    if (evidence.verifiedAt && !Number.isFinite(Date.parse(evidence.verifiedAt))) {
      throw new Error(`evidence.${evidence.id}.verifiedAt must be a valid date/time`);
    }
    if (evidence.origin === "demo" && evidence.truthLabel !== "demo") {
      throw new Error(`evidence.${evidence.id} demo origin must be labeled demo`);
    }
    if (evidence.origin === "simulated" && evidence.truthLabel !== "simulated") {
      throw new Error(`evidence.${evidence.id} simulated origin must be labeled simulated`);
    }
  }

  for (const claim of surface.claims) {
    assertNonEmpty(`claim.${claim.id}.text`, claim.text);
    validateEvidenceLinks(`claim.${claim.id}`, claim.evidenceIds, evidenceById, claim.truthLabel);
  }

  for (const claimId of surface.layers.evidenceClaimIds) {
    if (!claimById.has(claimId)) throw new Error(`layers.evidenceClaimIds references missing claim ${claimId}`);
  }

  for (const entity of surface.entities) {
    assertNonEmpty(`entity.${entity.id}.name`, entity.name);
    assertNonEmpty(`entity.${entity.id}.description`, entity.description);
    assertNonEmpty(`entity.${entity.id}.relationToHermes`, entity.relationToHermes);
    assertNonEmpty(`entity.${entity.id}.whyItMatters`, entity.whyItMatters);
    assertHttpsIfPresent(`entity.${entity.id}.schemaId`, entity.schemaId);
    assertHttpsIfPresent(`entity.${entity.id}.url`, entity.url);
    for (const sameAs of entity.sameAs ?? []) assertHttpsIfPresent(`entity.${entity.id}.sameAs`, sameAs);
    validateEvidenceLinks(`entity.${entity.id}`, entity.evidenceIds, evidenceById, entity.truthLabel);
  }

  for (const edge of surface.relationships) {
    assertNonEmpty(`relationship.${edge.id}.relationship`, edge.relationship);
    if (!entityById.has(edge.fromEntityId)) throw new Error(`relationship.${edge.id} has missing from entity`);
    if (!entityById.has(edge.toEntityId)) throw new Error(`relationship.${edge.id} has missing to entity`);
    validateEvidenceLinks(`relationship.${edge.id}`, edge.evidenceIds, evidenceById, edge.truthLabel);
  }

  if (surface.guidedPath) {
    const { questions, outcomes, startQuestionId } = surface.guidedPath;
    assertUniqueIds("guided questions", questions);
    assertUniqueIds("guided outcomes", outcomes);
    if (questions.length === 0) throw new Error("guided path requires at least one question");
    if (questions.length > 7) throw new Error("guided path must use progressive disclosure, not a long questionnaire");

    const questionById = new Map(questions.map((question) => [question.id, question]));
    const outcomeById = new Map(outcomes.map((outcome) => [outcome.id, outcome]));
    if (!questionById.has(startQuestionId)) throw new Error("guided path startQuestionId is missing");

    for (const question of questions) {
      assertNonEmpty(`guided question ${question.id}`, question.prompt);
      if (question.options.length < 2 || question.options.length > 5) {
        throw new Error(`guided question ${question.id} must offer 2-5 simple choices`);
      }
      assertUniqueIds(`guided question ${question.id} options`, question.options);
      for (const option of question.options) {
        assertNonEmpty(`guided option ${option.id}.label`, option.label);
        assertNonEmpty(`guided option ${option.id}.realization`, option.realization);
        const transitionCount = Number(Boolean(option.nextQuestionId)) + Number(Boolean(option.outcomeId));
        if (transitionCount !== 1) throw new Error(`guided option ${option.id} must have exactly one next transition`);
        if (option.nextQuestionId && !questionById.has(option.nextQuestionId)) {
          throw new Error(`guided option ${option.id} references missing question`);
        }
        if (option.outcomeId && !outcomeById.has(option.outcomeId)) {
          throw new Error(`guided option ${option.id} references missing outcome`);
        }
      }
    }

    for (const outcome of outcomes) {
      assertNonEmpty(`guided outcome ${outcome.id}.title`, outcome.title);
      assertNonEmpty(`guided outcome ${outcome.id}.diagnosis`, outcome.diagnosis);
      assertSitePath(`guided outcome ${outcome.id}.nextAction.href`, outcome.nextAction.href);
    }
  }

  return surface;
};

const schemaTypeByEntity: Record<GeoEntityType, string> = {
  organization: "Organization",
  service: "Service",
  audience: "Audience",
  location: "Place",
  resource: "CreativeWork",
  tool: "SoftwareApplication",
  process: "HowTo",
  provider: "Organization",
  dataset: "Dataset",
};

export const buildGeoAnswerSchema = (
  surface: GeoAnswerSurface,
  siteUrl = "https://hermeslogisticsus.com",
): Record<string, unknown> => {
  validateGeoAnswerSurface(surface);

  const pageUrl = new URL(surface.slug, siteUrl).toString();
  const publicEvidenceUrls = surface.evidence
    .filter((item) => item.url && item.origin === "public_source")
    .map((item) => item.url as string);

  const about = surface.entities.map((entity) => ({
    "@type": schemaTypeByEntity[entity.type],
    "@id": entity.schemaId ?? `${pageUrl}#entity-${entity.id}`,
    name: entity.name,
    description: entity.description,
    ...(entity.url ? { url: entity.url } : {}),
    ...(entity.sameAs?.length ? { sameAs: entity.sameAs } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#geo-answer`,
    url: pageUrl,
    name: surface.question,
    about,
    mainEntity: {
      "@type": "Question",
      name: surface.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: surface.layers.shortAnswer,
        ...(publicEvidenceUrls.length ? { citation: publicEvidenceUrls } : {}),
      },
    },
    ...(publicEvidenceUrls.length ? { isBasedOn: publicEvidenceUrls } : {}),
  };
};