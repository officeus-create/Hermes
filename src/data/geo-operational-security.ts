const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_DEPTH = 16;
const MAX_NODES = 25_000;

const reservedKeys = new Set(["__proto__", "prototype", "constructor"]);
const forbiddenKeys = new Set([
  "name",
  "email",
  "email_address",
  "phone",
  "phone_number",
  "first_name",
  "last_name",
  "full_name",
  "contact_name",
  "company",
  "company_name",
  "mc",
  "mc_number",
  "usdot",
  "usdot_number",
  "vin",
  "address",
  "street_address",
  "load_id",
  "shipment_id",
  "rate",
  "rate_amount",
  "revenue",
  "revenue_amount",
  "account_id",
  "property_id",
  "stream_id",
  "token",
  "access_token",
  "refresh_token",
  "cookie",
  "password",
  "credential",
  "credentials",
  "conversation",
  "response_text",
  "raw_response",
  "full_answer",
  "transcript",
  "message_body",
  "query_text",
  "raw_query",
  "search_term",
  "keyword_text",
  "prompt_text",
  "lead_id",
  "customer_id",
]);

const rowLimits: Record<string, number> = {
  ai_observations: 1000,
  search_checkpoints: 5000,
  analytics_events: 5000,
  outcomes: 5000,
};

const timezoneIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const pathKeys = new Set(["page_path", "journey_path", "event_page_path", "canonical_owner", "cited_path"]);

const inputBytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;

const assertTimestamp = (path: string, value: unknown) => {
  if (typeof value !== "string" || !timezoneIso.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${path} must be a valid ISO timestamp with explicit timezone`);
  }
};

const assertSitePath = (path: string, value: unknown) => {
  if (value === "" && path.endsWith(".cited_path")) return;
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[?#]/.test(value)
  ) {
    throw new Error(`${path} must be a clean site-relative path without query or fragment`);
  }
};

export const assertGeoOperationalBundleSecurity = (input: unknown) => {
  const bytes = inputBytes(input);
  if (bytes > MAX_INPUT_BYTES) throw new Error(`GEO operational input exceeds ${MAX_INPUT_BYTES} bytes`);

  let nodes = 0;
  const walk = (value: unknown, path: string, depth: number) => {
    nodes += 1;
    if (nodes > MAX_NODES) throw new Error(`GEO operational input exceeds ${MAX_NODES} nodes`);
    if (depth > MAX_DEPTH) throw new Error(`GEO operational input exceeds max depth ${MAX_DEPTH}`);
    if (value === null || typeof value !== "object") return;

    if (Array.isArray(value)) {
      const field = path.split(".").at(-1) ?? "";
      const limit = rowLimits[field];
      if (limit !== undefined && value.length > limit) {
        throw new Error(`${path} exceeds ${limit} rows`);
      }
      value.forEach((item, index) => walk(item, `${path}[${index}]`, depth + 1));
      return;
    }

    for (const key of Object.keys(value as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      const childPath = path ? `${path}.${key}` : key;
      if (reservedKeys.has(lower)) throw new Error(`Reserved object key is forbidden: ${childPath}`);
      if (forbiddenKeys.has(lower) || lower.startsWith("raw_") || lower.startsWith("private_")) {
        throw new Error(`Private/raw operational field is forbidden: ${childPath}`);
      }
      const child = (value as Record<string, unknown>)[key];
      if (key === "as_of" || key === "observed_at") assertTimestamp(childPath, child);
      if (pathKeys.has(key)) assertSitePath(childPath, child);
      walk(child, childPath, depth + 1);
    }
  };

  walk(input, "", 0);
  return { bytes, nodes };
};

const reportForbiddenKeys = new Set([
  ...forbiddenKeys,
  "querytext",
  "rawquery",
  "rawresponse",
  "responsetext",
]);

export const assertGeoOperationalReportPrivacy = (report: unknown) => {
  let nodes = 0;
  const walk = (value: unknown, path: string, depth: number) => {
    nodes += 1;
    if (nodes > MAX_NODES * 4) throw new Error("GEO operational report exceeds privacy-scan node budget");
    if (depth > MAX_DEPTH * 2) throw new Error("GEO operational report exceeds privacy-scan depth budget");
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`, depth + 1));
      return;
    }
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const normalized = key.replace(/[_-]/g, "").toLowerCase();
      const lower = key.toLowerCase();
      if (reservedKeys.has(lower)) throw new Error(`Reserved report key is forbidden: ${path}.${key}`);
      if (reportForbiddenKeys.has(lower) || reportForbiddenKeys.has(normalized) || lower.startsWith("raw_") || lower.startsWith("private_")) {
        throw new Error(`Private/raw field leaked into GEO report: ${path}.${key}`);
      }
      walk((value as Record<string, unknown>)[key], path ? `${path}.${key}` : key, depth + 1);
    }
  };
  walk(report, "report", 0);
  return { nodes };
};

const canonicalizeObject = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalizeObject);
  if (!value || typeof value !== "object") return value;
  const input = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(input)
      .sort()
      .map((key) => [key, canonicalizeObject(input[key])]),
  );
};

export const stableGeoJsonStringify = (value: unknown, space = 2) =>
  JSON.stringify(canonicalizeObject(value), null, space);

export const geoOperationalSecurityLimits = {
  maxInputBytes: MAX_INPUT_BYTES,
  maxDepth: MAX_DEPTH,
  maxNodes: MAX_NODES,
  rowLimits: { ...rowLimits },
} as const;
