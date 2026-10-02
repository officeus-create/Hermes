export type HermesBusinessEventVisibility = "workspace" | "company" | "internal_owner";

export type HermesBusinessEvent = {
  eventId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  companyId?: string;
  workspaceId?: string;
  actorId?: string;
  occurredAt: string;
  source: string;
  visibility: HermesBusinessEventVisibility;
  summary?: string;
  correlationId?: string;
  metadata: Readonly<Record<string, string | number | boolean>>;
};

export type HermesBusinessEventContext = {
  internalOwner?: boolean;
  companyIds?: readonly string[];
  workspaceIds?: readonly string[];
};

const cleanText = (value: unknown, max = 240) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const safeId = (value: unknown, max = 160) => cleanText(value, max);

const SAFE_METADATA_KEYS = new Set([
  "status",
  "stage",
  "action",
  "module",
  "channel",
  "source_type",
  "result",
  "reason_code",
  "count",
]);

const FORBIDDEN_KEY_PARTS = [
  "password",
  "secret",
  "token",
  "credential",
  "authorization",
  "cookie",
  "email",
  "phone",
  "message",
  "body",
  "vin",
  "payment",
  "card",
  "bank",
];

export function sanitizeHermesBusinessEventMetadata(
  value: Record<string, unknown> | null | undefined,
) {
  const output: Record<string, string | number | boolean> = {};
  for (const [rawKey, rawValue] of Object.entries(value ?? {})) {
    const key = cleanText(rawKey, 80).toLowerCase();
    if (!SAFE_METADATA_KEYS.has(key)) continue;
    if (FORBIDDEN_KEY_PARTS.some((part) => key.includes(part))) continue;
    if (typeof rawValue === "boolean" || typeof rawValue === "number") {
      output[key] = rawValue;
      continue;
    }
    output[key] = cleanText(rawValue, 160);
  }
  return output;
}

export function canReadHermesBusinessEvent(
  event: HermesBusinessEvent,
  context: HermesBusinessEventContext,
) {
  if (event.visibility === "internal_owner") return context.internalOwner === true;
  if (event.visibility === "company") {
    return Boolean(event.companyId && context.companyIds?.includes(event.companyId));
  }
  if (event.visibility === "workspace") {
    return Boolean(event.workspaceId && context.workspaceIds?.includes(event.workspaceId));
  }
  return false;
}

export type DealerActivityRow = {
  id: unknown;
  company_id: unknown;
  actor_specialist_id?: unknown;
  event_type: unknown;
  entity_type?: unknown;
  entity_id?: unknown;
  summary?: unknown;
  created_at: unknown;
};

export function dealerActivityToHermesBusinessEvent(row: DealerActivityRow): HermesBusinessEvent {
  const eventId = safeId(row.id);
  const companyId = safeId(row.company_id);
  if (!eventId || !companyId) throw new Error("dealer_event_identity_required");

  return {
    eventId,
    eventType: cleanText(row.event_type, 80) || "dealer_activity",
    entityType: cleanText(row.entity_type, 80) || "dealer_record",
    entityId: safeId(row.entity_id) || companyId,
    companyId,
    actorId: safeId(row.actor_specialist_id) || undefined,
    occurredAt: cleanText(row.created_at, 64),
    source: "dealer_crm_activity",
    visibility: "company",
    summary: cleanText(row.summary, 240) || undefined,
    metadata: {},
  };
}

export type InternalAiEventRow = {
  id: unknown;
  task_id: unknown;
  event_type: unknown;
  message?: unknown;
  created_at: unknown;
};

export function internalAiToHermesBusinessEvent(row: InternalAiEventRow): HermesBusinessEvent {
  const eventId = safeId(row.id);
  const taskId = safeId(row.task_id);
  if (!eventId || !taskId) throw new Error("internal_ai_event_identity_required");

  return {
    eventId: `internal-ai:${eventId}`,
    eventType: cleanText(row.event_type, 80) || "internal_ai_event",
    entityType: "internal_ai_task",
    entityId: taskId,
    occurredAt: cleanText(row.created_at, 64),
    source: "internal_ai_events",
    visibility: "internal_owner",
    // The canonical Internal AI source already sanitizes message text. The shared
    // cross-product contract deliberately does not copy that free-form message
    // into generic metadata; richer detail stays with the domain source.
    metadata: {},
  };
}

export function filterHermesBusinessEvents(
  events: readonly HermesBusinessEvent[],
  context: HermesBusinessEventContext,
) {
  return events.filter((event) => canReadHermesBusinessEvent(event, context));
}
