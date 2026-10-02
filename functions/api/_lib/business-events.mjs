const CONTROL_CHARS = /[<>\u0000-\u001f\u007f]/g;
const SAFE_VISIBILITIES = new Set(["public", "workspace", "company", "internal_owner"]);
const SENSITIVE_METADATA_KEY = /(password|secret|token|authorization|cookie|session|email|phone|vin|address|payment|card|message|body|notes?)/i;

const clean = (value, max = 240) =>
  String(value ?? "")
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const validIso = (value) => {
  const raw = clean(value, 64);
  if (!raw) return "";
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
};

export function sanitizeBusinessEventMetadata(metadata, allowedKeys = []) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const allow = new Set(allowedKeys.map((key) => clean(key, 80)).filter(Boolean));
  const safe = {};
  for (const [rawKey, rawValue] of Object.entries(metadata)) {
    const key = clean(rawKey, 80);
    if (!key || !allow.has(key) || SENSITIVE_METADATA_KEY.test(key)) continue;
    if (rawValue == null || ["string", "number", "boolean"].includes(typeof rawValue)) {
      safe[key] = typeof rawValue === "string" ? clean(rawValue, 240) : rawValue;
    }
  }
  return safe;
}

export function normalizeBusinessEvent(input = {}, { allowedMetadataKeys = [] } = {}) {
  const eventId = clean(input.event_id, 160);
  const eventType = clean(input.event_type, 80).toLowerCase().replace(/[^a-z0-9_.:-]+/g, "_");
  const entityType = clean(input.entity_type, 80).toLowerCase().replace(/[^a-z0-9_.:-]+/g, "_");
  const entityId = clean(input.entity_id, 160);
  const companyId = clean(input.company_id, 160);
  const workspaceId = clean(input.workspace_id, 160);
  const occurredAt = validIso(input.occurred_at);
  const source = clean(input.source, 100).toLowerCase().replace(/[^a-z0-9_.:-]+/g, "_");
  const visibility = clean(input.visibility, 40).toLowerCase();
  const actorType = clean(input.actor_type, 60).toLowerCase().replace(/[^a-z0-9_.:-]+/g, "_");
  const actorId = clean(input.actor_id, 160);
  const summary = clean(input.summary, 400);
  const correlationId = clean(input.correlation_id, 180);

  if (!eventId || !eventType || !entityType || !entityId || !occurredAt || !source) return null;
  if (!SAFE_VISIBILITIES.has(visibility)) return null;
  if (visibility === "company" && !companyId) return null;
  if (visibility === "workspace" && !workspaceId) return null;

  return {
    event_id: eventId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    company_id: companyId || null,
    workspace_id: workspaceId || null,
    actor: actorType ? { type: actorType, id: actorId || null } : null,
    occurred_at: occurredAt,
    source,
    visibility,
    summary: summary || null,
    correlation_id: correlationId || null,
    metadata: sanitizeBusinessEventMetadata(input.metadata, allowedMetadataKeys),
  };
}

export function normalizeDealerActivityEvent(row, expectedCompanyId) {
  const companyId = clean(row?.company_id, 160);
  const expected = clean(expectedCompanyId, 160);
  if (!companyId || !expected || companyId !== expected) return null;

  return normalizeBusinessEvent({
    event_id: clean(row?.id, 160),
    event_type: row?.event_type,
    entity_type: row?.entity_type || "dealer_activity",
    entity_id: row?.entity_id || row?.id,
    company_id: companyId,
    actor_type: row?.actor_specialist_id ? "specialist" : "",
    actor_id: row?.actor_specialist_id,
    occurred_at: row?.created_at,
    source: "dealer_crm",
    visibility: "company",
    summary: row?.summary,
  });
}

export function normalizeInternalAiEvent(row) {
  if (clean(row?.organization_scope, 80) !== "hermes_internal") return null;
  const sourceEventId = clean(row?.id, 120);
  const taskId = clean(row?.task_id, 160);
  if (!sourceEventId || !taskId) return null;
  return normalizeBusinessEvent({
    event_id: `hcai_event_${sourceEventId}`,
    event_type: row?.event_type,
    entity_type: "ai_task",
    entity_id: taskId,
    workspace_id: "internal_ai",
    occurred_at: row?.created_at,
    source: "internal_ai",
    visibility: "internal_owner",
    summary: row?.message,
    correlation_id: taskId,
  });
}
