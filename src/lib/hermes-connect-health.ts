export type HermesHealthState =
  | "healthy"
  | "degraded"
  | "blocked_authorization"
  | "stale"
  | "disabled"
  | "unavailable"
  | "unknown";

export type HermesHealthComponentClass =
  | "api"
  | "storage"
  | "connector"
  | "worker"
  | "queue"
  | "runtime";

export type HermesHealthItem = {
  key: string;
  componentClass: HermesHealthComponentClass;
  state: HermesHealthState;
  observedAt: string;
  source: string;
  companyId?: string;
  workspaceId?: string;
  lastSuccessAt?: string;
  errorClass?: string;
  freshnessExpiresAt?: string;
  pendingCount?: number;
  failedCount?: number;
  nextAction?: string;
};

const clean = (value: unknown, max = 160) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const SAFE_ERROR_CLASSES = new Set([
  "authorization_required",
  "authorization_expired",
  "rate_limited",
  "provider_unavailable",
  "storage_unavailable",
  "runtime_offline",
  "queue_stalled",
  "configuration_missing",
  "unknown_error",
]);

export function sanitizeHermesHealthErrorClass(value: unknown) {
  const normalized = clean(value, 80).toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  return SAFE_ERROR_CLASSES.has(normalized) ? normalized : normalized ? "unknown_error" : undefined;
}

export function normalizeHermesHealthCount(value: unknown) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return undefined;
  return Math.min(1_000_000, Math.trunc(count));
}

export function normalizeHermesHealthItem(input: HermesHealthItem): HermesHealthItem {
  const key = clean(input.key, 120);
  const source = clean(input.source, 120);
  const observedAt = clean(input.observedAt, 64);
  if (!key || !source || !observedAt) throw new Error("health_identity_required");

  return {
    ...input,
    key,
    source,
    observedAt,
    companyId: clean(input.companyId, 120) || undefined,
    workspaceId: clean(input.workspaceId, 120) || undefined,
    lastSuccessAt: clean(input.lastSuccessAt, 64) || undefined,
    errorClass: sanitizeHermesHealthErrorClass(input.errorClass),
    freshnessExpiresAt: clean(input.freshnessExpiresAt, 64) || undefined,
    pendingCount: normalizeHermesHealthCount(input.pendingCount),
    failedCount: normalizeHermesHealthCount(input.failedCount),
    nextAction: clean(input.nextAction, 120) || undefined,
  };
}

export function applyHermesHealthFreshness(
  item: HermesHealthItem,
  now = new Date(),
): HermesHealthItem {
  if (!item.freshnessExpiresAt) return item;
  const expiry = Date.parse(item.freshnessExpiresAt);
  if (!Number.isFinite(expiry)) return { ...item, state: "unknown", errorClass: "unknown_error" };
  if (now.getTime() <= expiry) return item;
  if (item.state === "disabled" || item.state === "blocked_authorization") return item;
  return { ...item, state: "stale" };
}

export function summarizeHermesHealth(items: readonly HermesHealthItem[]) {
  const counts: Record<HermesHealthState, number> = {
    healthy: 0,
    degraded: 0,
    blocked_authorization: 0,
    stale: 0,
    disabled: 0,
    unavailable: 0,
    unknown: 0,
  };
  for (const item of items) counts[item.state] += 1;

  const priority: HermesHealthState[] = [
    "unavailable",
    "blocked_authorization",
    "degraded",
    "stale",
    "unknown",
    "disabled",
    "healthy",
  ];
  const overall = priority.find((state) => counts[state] > 0) ?? "unknown";
  return { overall, counts };
}

export type InternalAiRuntimeHealthInput = {
  online?: boolean;
  lastSeenAt?: unknown;
  repoSha?: unknown;
};

export function internalAiRuntimeToHermesHealth(
  input: InternalAiRuntimeHealthInput,
  observedAt: string,
): HermesHealthItem {
  const lastSeenAt = clean(input.lastSeenAt, 64) || undefined;
  return normalizeHermesHealthItem({
    key: "internal_ai_runtime",
    componentClass: "runtime",
    state: input.online === true ? "healthy" : input.online === false ? "unavailable" : "unknown",
    observedAt,
    lastSuccessAt: input.online ? lastSeenAt : undefined,
    source: "internal_ai_status",
    errorClass: input.online === false ? "runtime_offline" : undefined,
    nextAction: input.online === false ? "restore_authorized_runtime" : undefined,
  });
}

export type ConnectorHealthInput = {
  key: string;
  companyId: string;
  state?: unknown;
  lastVerifiedAt?: unknown;
  lastError?: unknown;
  observedAt: string;
};

export function connectorToHermesHealth(input: ConnectorHealthInput): HermesHealthItem {
  const providerState = clean(input.state, 80).toLowerCase();
  const state: HermesHealthState =
    providerState === "connected" ? "healthy"
    : providerState === "permission_required" || providerState === "connection_required" ? "blocked_authorization"
    : providerState === "disabled" ? "disabled"
    : providerState === "degraded" ? "degraded"
    : providerState ? "unknown"
    : "unknown";

  return normalizeHermesHealthItem({
    key: input.key,
    componentClass: "connector",
    state,
    observedAt: input.observedAt,
    companyId: input.companyId,
    lastSuccessAt: clean(input.lastVerifiedAt, 64) || undefined,
    source: "company_connector_state",
    errorClass: input.lastError ? "unknown_error" : undefined,
    nextAction: state === "blocked_authorization" ? "authorize_connector" : undefined,
  });
}
