// Optional OFF-by-default official Meta Threads transport for the EXISTING HAE
// queue and D1 publication ledger. No second scheduler or token store.
// Only the exact Hermes Logistics account is permitted.
const META_BASE = "https://graph.threads.net/v1.0/";
export const HERMES_THREADS_ID = "28419597014385166";
const HERMES_USERNAME = "hermes.logistics";
const COOLDOWN_MS = (3 * 60 + 15) * 60_000;
const MIN_PREFLIGHT_HISTORY = 30;

function text(value, max = 500) {
  return typeof value === "string" ? value
    .replace(/\r\n?/g, "\n")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .split("\n").map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max) : "";
}
function httpsThreadsPermalink(value) {
  try {
    const u = new URL(String(value || ""));
    if (u.protocol !== "https:" || !["threads.com", "www.threads.com", "threads.net", "www.threads.net"].includes(u.hostname)) return null;
    return u.toString();
  } catch { return null; }
}
export function metaThreadsMode(env) {
  return String(env?.HERMES_THREADS_PROVIDER || "").trim() === "meta_direct";
}
export function metaThreadsCredentials(env) {
  const accessToken = typeof env?.HERMES_THREADS_ACCESS_TOKEN === "string"
    ? env.HERMES_THREADS_ACCESS_TOKEN.trim() : "";
  const accountId = String(env?.HERMES_THREADS_META_ACCOUNT_ID || "");
  if (accountId !== HERMES_THREADS_ID || accessToken.length < 20 || accessToken.length > 4096) return null;
  return { accessToken, accountId };
}
export function metaThreadsConfig(env) {
  if (!metaThreadsMode(env)) return null;
  return metaThreadsCredentials(env);
}
function auth(config) { return { "authorization": `Bearer ${config.accessToken}`, "accept": "application/json" }; }
async function graph(config, path, { params = {}, post = false } = {}) {
  const url = new URL(path, META_BASE);
  let options = { method: post ? "POST" : "GET", headers: auth(config) };
  if (post) {
    options.headers["content-type"] = "application/x-www-form-urlencoded";
    options.body = new URLSearchParams(params).toString();
  } else {
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  }
  try {
    const response = await fetch(url.toString(), options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.error || payload?.success === false) {
      return { ok: false, error_class: response.status === 401 || response.status === 403
        ? "meta_threads_auth_rejected" : response.status >= 500 ? "provider_outcome_unknown" : "meta_threads_provider_rejected" };
    }
    if (!payload || typeof payload !== "object") return { ok: false, error_class: "meta_threads_invalid_response" };
    return { ok: true, payload };
  } catch {
    return { ok: false, error_class: post ? "provider_outcome_unknown" : "meta_threads_readback_unavailable" };
  }
}
async function identity(config) {
  const result = await graph(config, "me", { params: { fields: "id,username" } });
  if (!result.ok) return result;
  const user = result.payload;
  if (String(user?.id || "") !== HERMES_THREADS_ID || String(user?.username || "").replace(/^@/, "").toLowerCase() !== HERMES_USERNAME) {
    return { ok: false, error_class: "meta_threads_wrong_account" };
  }
  return { ok: true };
}
async function recent(config) {
  const result = await graph(config, "me/threads", {
    params: { fields: "id,text,permalink,timestamp,media_type", limit: "50" },
  });
  if (!result.ok) return result;
  const rows = result.payload?.data;
  if (!Array.isArray(rows) || rows.length > 50) return { ok: false, error_class: "meta_threads_invalid_feed" };
  // Do not accept a provider warning or partial record set as valid freshness proof.
  for (const row of rows) {
    const mediaType = String(row?.media_type || "TEXT_POST");
    const textMissingAllowed = mediaType !== "TEXT_POST" && (row?.text === null || row?.text === undefined);
    if (!row || typeof row !== "object" || !/^[0-9]+$/.test(String(row.id || "")) ||
        (typeof row.text !== "string" && !textMissingAllowed) ||
        !Number.isFinite(Date.parse(String(row.timestamp || "")))) {
      return { ok: false, error_class: "meta_threads_invalid_feed" };
    }
  }
  return { ok: true, rows };
}
export async function metaThreadsPreflight(env, body, nowMs = Date.now()) {
  const config = metaThreadsConfig(env);
  if (!config) return { ok: false, error_class: "meta_threads_not_configured" };
  const normalized = text(body);
  if (!normalized || new TextEncoder().encode(normalized).byteLength > 500) {
    return { ok: false, error_class: "meta_threads_text_invalid" };
  }
  const who = await identity(config);
  if (!who.ok) return who;
  const feed = await recent(config);
  if (!feed.ok) return feed;
  if (feed.rows.some((row) => text(row.text) === normalized)) {
    return { ok: false, error_class: "meta_threads_duplicate_existing_post" };
  }
  for (const row of feed.rows) {
    const age = nowMs - Date.parse(row.timestamp);
    if (age < 0) return { ok: false, error_class: "meta_threads_future_provider_timestamp" };
    if (age < COOLDOWN_MS) return { ok: false, error_class: "meta_threads_recent_authored_cooldown" };
  }
  // @hermes.logistics is an established account with a large authored history.
  // A short/empty first page is not sufficient freshness evidence and must never
  // silently satisfy the pre-publish reconciliation gate.
  if (feed.rows.length < MIN_PREFLIGHT_HISTORY) {
    return {
      ok: false,
      error_class: "meta_threads_history_incomplete",
      observed_rows: feed.rows.length,
      minimum_required_rows: MIN_PREFLIGHT_HISTORY,
    };
  }
  return { ok: true, account_id_verified: true, last_50_checked: feed.rows.length, safe_to_reserve: true };
}
export async function publishThreadsTextViaMeta(env, body) {
  const config = metaThreadsConfig(env);
  if (!config) return { ok: false, error_class: "meta_threads_not_configured" };
  const normalized = text(body);
  if (!normalized || new TextEncoder().encode(normalized).byteLength > 500) return { ok: false, error_class: "meta_threads_text_invalid" };
  // Caller must first persist the D1 reservation AND pass fresh preflight.
  const container = await graph(config, `${HERMES_THREADS_ID}/threads`, {
    post: true, params: { media_type: "TEXT", text: normalized },
  });
  if (!container.ok) return container;
  if (!/^[0-9]+$/.test(String(container.payload?.id || ""))) return { ok: false, error_class: "provider_outcome_unknown" };
  const publication = await graph(config, `${HERMES_THREADS_ID}/threads_publish`, {
    post: true, params: { creation_id: String(container.payload.id) },
  });
  if (!publication.ok) return publication;
  const providerId = String(publication.payload?.id || "");
  if (!/^[0-9]+$/.test(providerId)) return { ok: false, error_class: "provider_outcome_unknown" };
  return { ok: true, accepted: true, provider_result: "meta_direct", provider_post_id: providerId };
}
export async function readbackThreadsTextViaMeta(env, body) {
  // Readback follows immutable publication provenance, not the provider that is
  // currently selected for new writes. Keep credentials usable after a switch.
  const config = metaThreadsCredentials(env);
  if (!config) return { ok: false, error_class: "meta_threads_not_configured" };
  const who = await identity(config);
  if (!who.ok) return who;
  const feed = await recent(config);
  if (!feed.ok) return feed;
  const normalized = text(body);
  const match = feed.rows.find((row) => text(row.text) === normalized);
  if (!match) return { ok: true, found: false };
  const permalink = httpsThreadsPermalink(match.permalink);
  if (!permalink) return { ok: false, error_class: "meta_threads_missing_permalink" };
  return { ok: true, found: true, provider_post_id: String(match.id),
           permalink, provider_timestamp: String(match.timestamp) };
}