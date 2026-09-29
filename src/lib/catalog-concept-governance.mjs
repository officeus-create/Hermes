export const CATALOG_LIFECYCLE_STATES = Object.freeze([
  "DISCOVERED",
  "RESEARCHED",
  "CONCEPT_DRAFT",
  "REVIEWED",
  "PUBLISHED_UNCLAIMED",
  "CLAIMED",
  "CLIENT",
  "OWN_DOMAIN_LIVE",
]);

export const CATALOG_SOURCE_IMPORT_STATES = Object.freeze(["pending", "verified", "failed"]);

const NEXT_STATES = Object.freeze({
  DISCOVERED: ["RESEARCHED"],
  RESEARCHED: ["CONCEPT_DRAFT"],
  CONCEPT_DRAFT: ["REVIEWED"],
  REVIEWED: ["PUBLISHED_UNCLAIMED"],
  PUBLISHED_UNCLAIMED: ["CLAIMED"],
  CLAIMED: ["CLIENT"],
  CLIENT: ["OWN_DOMAIN_LIVE"],
  OWN_DOMAIN_LIVE: [],
});

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);
const unique = (items) => [...new Set((items || []).filter(Boolean))];

export function canTransitionCatalogState(from, to) {
  return Boolean(NEXT_STATES[from]?.includes(to));
}

export function normalizeConceptSourceImports(items = []) {
  return (Array.isArray(items) ? items : []).slice(0, 30).flatMap((item) => {
    if (!item?.url) return [];
    const status = CATALOG_SOURCE_IMPORT_STATES.includes(item.status) ? item.status : "pending";
    return [{ url: clean(item.url, 2048), type: clean(item.type, 80) || "website", status, note: clean(item.note, 500) }];
  });
}

export function catalogConceptPreviewGate(conceptDraft) {
  return {
    state: "concept_preview",
    indexable: false,
    robots: "noindex,nofollow",
    ownerApprovalRequired: conceptDraft?.ownerApproval?.required !== false,
    nextLifecycleState: conceptDraft?.lifecycleState === "CONCEPT_DRAFT" ? "REVIEWED" : conceptDraft?.lifecycleState,
  };
}

export function catalogSemanticSignals(conceptDraft) {
  return unique([
    ...(conceptDraft?.semanticCore || []),
    ...(conceptDraft?.localIntents || []),
    conceptDraft?.goals?.primary,
    conceptDraft?.facts?.city,
    conceptDraft?.facts?.country,
  ]).map((item) => clean(item, 180));
}

export function catalogConceptSeoReadiness(conceptDraft) {
  const sources = normalizeConceptSourceImports(conceptDraft?.sourceImports || []);
  const signals = catalogSemanticSignals(conceptDraft);
  const checks = {
    identity: Boolean(conceptDraft?.id && conceptDraft?.name),
    route: Boolean(conceptDraft?.slug && conceptDraft?.countrySlug && conceptDraft?.localitySlug),
    source_evidence: sources.some((source) => source.status === "verified"),
    semantic_core: Array.isArray(conceptDraft?.semanticCore) && conceptDraft.semanticCore.length > 0,
    local_intents: Array.isArray(conceptDraft?.localIntents) && conceptDraft.localIntents.length > 0,
    semantic_signals: signals.length > 0,
    owner_boundary: conceptDraft?.ownerApproval?.required === true,
  };
  return { ready: Object.values(checks).every(Boolean), checks };
}

export function ethicalCatalogAttributionLink({ href, label, relationship = "source" } = {}) {
  return {
    href: clean(href, 1000),
    label: clean(label, 160),
    relationship: clean(relationship, 80) || "source",
    editoriallyRequired: true,
    reciprocalRequired: false,
    paidLinkRequired: false,
  };
}

export function catalogConceptPublicationQa(conceptDraft, { ownerApproved = false } = {}) {
  const sources = normalizeConceptSourceImports(conceptDraft?.sourceImports || []);
  const seo = catalogConceptSeoReadiness(conceptDraft);
  const checks = {
    lifecycle: conceptDraft?.lifecycleState === "CONCEPT_DRAFT" || conceptDraft?.lifecycleState === "REVIEWED",
    noindex_preview: conceptDraft?.publication?.indexable === false,
    owner_approval: ownerApproved === true,
    sources_present: sources.length > 0,
    sources_verified: sources.length > 0 && sources.every((source) => source.status === "verified"),
    semantic_core: Array.isArray(conceptDraft?.semanticCore) && conceptDraft.semanticCore.length > 0,
    local_intents: Array.isArray(conceptDraft?.localIntents) && conceptDraft.localIntents.length > 0,
    seo_readiness: seo.ready,
  };
  return { ready: Object.values(checks).every(Boolean), checks };
}
