export const WEBSITE_FACTORY_STATES = ["draft", "brief_ready", "submitted"];
export const WEBSITE_FACTORY_REFERENCE_INPUT_ROLES = ["visual", "functionality", "structure"];
export const WEBSITE_FACTORY_REFERENCE_ROLES = ["visual", "functionality", "structure-conversion"];
export const WEBSITE_FACTORY_SOURCE_IMPORT_STATES = ["pending", "verified", "failed"];
export const WEBSITE_FACTORY_MAX_PAYLOAD_BYTES = 60_000;

const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");
const FORBIDDEN_KEY = /(password|secret|token|cookie|credential|api[_-]?key)/i;

export function cleanWebsiteFactoryText(value, max = 2000) {
  return String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
}

export function cleanWebsiteFactoryUrl(value) {
  const text = String(value ?? "").trim();
  if (!text || text.length > 2048) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function detectWebsiteFactorySourceType(value) {
  const url = cleanWebsiteFactoryUrl(value);
  if (!url) return "other";
  const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  if (host.includes("google.") || host === "maps.app.goo.gl") return "google_business";
  if (host === "instagram.com") return "instagram";
  if (host === "facebook.com" || host === "fb.com") return "facebook";
  if (host === "linkedin.com") return "linkedin";
  if (host === "x.com" || host === "twitter.com") return "x";
  if (host === "threads.net") return "threads";
  if (host === "tiktok.com") return "tiktok";
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  if (host === "yelp.com") return "yelp";
  return "website";
}

function cleanStringArray(value, maxItems = 20, maxLength = 160) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => cleanWebsiteFactoryText(item, maxLength)).filter(Boolean))].slice(0, maxItems);
}

function cleanFactMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [rawKey, rawValue] of Object.entries(value).slice(0, 40)) {
    const key = cleanWebsiteFactoryText(rawKey, 80).replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!key || FORBIDDEN_KEY.test(key)) continue;
    if (Array.isArray(rawValue)) result[key] = cleanStringArray(rawValue, 30, 500);
    else result[key] = cleanWebsiteFactoryText(rawValue, 3000);
  }
  return result;
}

export function normalizeWebsiteFactoryPayload(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEY.test(key)) throw new Error("credentials_not_allowed");
  }

  const sources = Array.isArray(source.sources) ? source.sources.slice(0, 20).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const url = cleanWebsiteFactoryUrl(item.url);
    if (!url) return [];
    return [{
      url,
      type: detectWebsiteFactorySourceType(url),
      note: cleanWebsiteFactoryText(item.note, 500),
      status: "pending",
    }];
  }) : [];

  const rawGoals = source.goals && typeof source.goals === "object" && !Array.isArray(source.goals) ? source.goals : {};
  const rawBrief = source.brief && typeof source.brief === "object" && !Array.isArray(source.brief) ? source.brief : {};
  const rawBrand = source.brand && typeof source.brand === "object" && !Array.isArray(source.brand) ? source.brand : {};

  const references = Array.isArray(source.references) ? source.references.slice(0, 6).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const inputRole = String(item.role || "");
    const role = inputRole === "structure" ? "structure-conversion" : inputRole;
    const normalizedRole = WEBSITE_FACTORY_REFERENCE_ROLES.includes(role) ? role : null;
    const url = cleanWebsiteFactoryUrl(item.url);
    if (!normalizedRole || !url) return [];
    return [{ role: normalizedRole, url, principles: cleanStringArray(item.principles, 12, 120), note: cleanWebsiteFactoryText(item.note, 800) }];
  }) : [];

  const capabilities = Array.isArray(source.capabilities) ? source.capabilities.slice(0, 30).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const id = cleanWebsiteFactoryText(item.id, 80).replace(/[^a-zA-Z0-9_-]/g, "-");
    if (!id) return [];
    return [{ id, included: Boolean(item.included) }];
  }) : [];

  const logoUrl = rawBrand.logo_url ? cleanWebsiteFactoryUrl(rawBrand.logo_url) : null;
  const payload = {
    starting_from_zero: Boolean(source.starting_from_zero),
    sources,
    facts: cleanFactMap(source.facts),
    goals: {
      primary: cleanWebsiteFactoryText(rawGoals.primary, 120),
      secondary: cleanStringArray(rawGoals.secondary, 10, 120),
      target_customer: cleanWebsiteFactoryText(rawGoals.target_customer, 1200),
      geography: cleanWebsiteFactoryText(rawGoals.geography, 500),
      languages: cleanStringArray(rawGoals.languages, 12, 80),
      primary_action: cleanWebsiteFactoryText(rawGoals.primary_action, 300),
      semantic_core: cleanStringArray(rawGoals.semantic_core, 30, 180),
      local_intents: cleanStringArray(rawGoals.local_intents, 30, 180),
    },
    brief: {
      text: cleanWebsiteFactoryText(rawBrief.text, 12000),
      must_have: cleanStringArray(rawBrief.must_have, 30, 500),
      nice_to_have: cleanStringArray(rawBrief.nice_to_have, 30, 500),
      dislikes: cleanStringArray(rawBrief.dislikes, 20, 500),
      tone: cleanWebsiteFactoryText(rawBrief.tone, 1000),
      constraints: cleanStringArray(rawBrief.constraints, 20, 500),
      unresolved_questions: cleanStringArray(rawBrief.unresolved_questions, 20, 500),
    },
    references,
    pages: cleanStringArray(source.pages, 30, 120),
    capabilities,
    brand: {
      logo_url: logoUrl,
      colors: cleanStringArray(rawBrand.colors, 12, 80),
      notes: cleanWebsiteFactoryText(rawBrand.notes, 2000),
    },
    unresolved_critical: cleanStringArray(source.unresolved_critical, 20, 500),
  };

  const serialized = JSON.stringify(payload);
  if (new TextEncoder().encode(serialized).length > WEBSITE_FACTORY_MAX_PAYLOAD_BYTES) throw new Error("draft_payload_too_large");
  return payload;
}

export function websiteFactoryReadiness(payload) {
  const reasons = [];
  if (!payload?.starting_from_zero && !(payload?.sources?.length > 0)) reasons.push("source_or_starting_from_zero_required");
  if (!payload?.goals?.primary) reasons.push("primary_goal_required");
  if (!payload?.brief?.text || payload.brief.text.length < 10) reasons.push("brief_required");
  for (const role of WEBSITE_FACTORY_REFERENCE_ROLES) {
    if (!payload?.references?.some((item) => item.role === role)) reasons.push(`${role}_reference_required`);
  }
  if (payload?.unresolved_critical?.length) reasons.push("critical_conflicts_unresolved");
  return { ready: reasons.length === 0, reasons };
}

export function transitionWebsiteFactorySourceImport(source, nextStatus) {
  if (!source || !WEBSITE_FACTORY_SOURCE_IMPORT_STATES.includes(nextStatus)) throw new Error("source_import_state_invalid");
  const allowed = {
    pending: ["verified", "failed"],
    verified: [],
    failed: ["pending"],
  };
  if (!allowed[source.status]?.includes(nextStatus)) throw new Error("source_import_transition_invalid");
  return { ...source, status: nextStatus };
}

const slugifyCatalogPart = (value, fallback) => {
  const slug = cleanWebsiteFactoryText(value, 160)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || fallback;
};

export function websiteFactoryToCatalogConceptDraft(payload, { draftId = "website-factory-draft", title = "Website concept draft" } = {}) {
  const normalized = normalizeWebsiteFactoryPayload(payload);
  const facts = normalized.facts || {};
  const businessName = cleanWebsiteFactoryText(facts.business_name || title, 180) || "Business concept";
  const locality = cleanWebsiteFactoryText(facts.city || facts.locality || normalized.goals.geography, 160) || "Local market";
  const country = cleanWebsiteFactoryText(facts.country || facts.country_code, 120) || "Unknown";
  const semanticCore = normalized.goals.semantic_core.length
    ? normalized.goals.semantic_core
    : cleanStringArray([...(Array.isArray(facts.services) ? facts.services : []), normalized.goals.primary], 30, 180);
  const localIntents = normalized.goals.local_intents.length
    ? normalized.goals.local_intents
    : cleanStringArray(semanticCore.map((term) => locality ? `${term} ${locality}` : term), 30, 180);
  return {
    id: `catalog-draft-${slugifyCatalogPart(draftId, "draft")}`,
    slug: slugifyCatalogPart(businessName, "business"),
    countrySlug: slugifyCatalogPart(country, "unknown"),
    localitySlug: slugifyCatalogPart(locality, "local"),
    name: businessName,
    lifecycleState: "CONCEPT_DRAFT",
    publication: {
      state: "concept_preview",
      indexable: false,
      owner_approval: "required",
      verified_source_review: "required",
    },
    facts,
    goals: normalized.goals,
    sourceImports: normalized.sources.map((source) => ({ ...source, status: source.status || "pending" })),
    competitorReferences: normalized.references,
    semanticCore,
    localIntents,
    ownerApproval: { required: true, approved: false, approvedAt: null },
    source: "website_factory",
  };
}

export function websiteFactoryCatalogPublicationGate(conceptDraft, { ownerApproved = false } = {}) {
  const sources = Array.isArray(conceptDraft?.sourceImports) ? conceptDraft.sourceImports : [];
  const checks = {
    concept_preview: conceptDraft?.publication?.state === "concept_preview",
    owner_approved: ownerApproved === true,
    sources_present: sources.length > 0,
    sources_verified: sources.length > 0 && sources.every((source) => source.status === "verified"),
    semantic_core: Array.isArray(conceptDraft?.semanticCore) && conceptDraft.semanticCore.length > 0,
    local_intents: Array.isArray(conceptDraft?.localIntents) && conceptDraft.localIntents.length > 0,
  };
  return { ready: Object.values(checks).every(Boolean), checks };
}

export async function ensureWebsiteFactorySchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS website_factory_drafts (
      id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      title TEXT NOT NULL,
      current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 0 AND current_step <= 9),
      state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','brief_ready','submitted')),
      payload_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_website_factory_owner_updated ON website_factory_drafts(specialist_id, updated_at DESC)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS website_factory_handoffs (
      draft_id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      notification_status TEXT NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending','sent','failed')),
      notification_error TEXT,
      last_attempt_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_website_factory_handoff_owner ON website_factory_handoffs(specialist_id, updated_at DESC)").run();
}

export function parseWebsiteFactoryDraft(row) {
  if (!row) return null;
  let payload = {};
  try { payload = JSON.parse(row.payload_json || "{}"); } catch {}
  return {
    id: row.id,
    title: row.title,
    current_step: Number(row.current_step || 1),
    state: row.state,
    payload,
    created_at: row.created_at,
    updated_at: row.updated_at,
    submitted_at: row.submitted_at || null,
  };
}
