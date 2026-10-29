// Optional OFF-by-default official Meta Threads transport for the EXISTING HAE
// queue and D1 publication ledger. No second scheduler or token store.
// Only the exact Hermes Logistics account is permitted.
//
// Provider HTTP mechanics live in one shared transport module so HAE and future
// owner/manual surfaces converge on the same official Meta Threads contract.
import {
  createMetaThreadsTransport,
  normalizeThreadsText,
  safeThreadsPermalink,
} from "../../../shared/social/meta-threads-provider.mjs";

export const HERMES_THREADS_ID = "28419597014385166";
const HERMES_USERNAME = "hermes.logistics";
const COOLDOWN_MS = (3 * 60 + 15) * 60_000;
const MIN_PREFLIGHT_HISTORY = 30;

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

function transportFromCredentials(credentials) {
  if (!credentials) return null;
  return createMetaThreadsTransport({
    accessToken: credentials.accessToken,
    accountId: credentials.accountId,
    expectedUsername: HERMES_USERNAME,
  });
}

export function metaThreadsConfig(env) {
  if (!metaThreadsMode(env)) return null;
  const credentials = metaThreadsCredentials(env);
  return credentials ? { ...credentials, transport: transportFromCredentials(credentials) } : null;
}

async function identity(transport) {
  if (!transport) return { ok: false, error_class: "meta_threads_not_configured" };
  return transport.verifyIdentity();
}

async function recent(transport) {
  if (!transport) return { ok: false, error_class: "meta_threads_not_configured" };
  const result = await transport.listRecentAuthored({ limit: 50 });
  if (!result.ok) return result;
  return { ok: true, rows: result.rows };
}

export async function metaThreadsPreflight(env, body, nowMs = Date.now()) {
  const config = metaThreadsConfig(env);
  if (!config?.transport) return { ok: false, error_class: "meta_threads_not_configured" };
  const normalized = normalizeThreadsText(body);
  if (!normalized || new TextEncoder().encode(normalized).byteLength > 500) {
    return { ok: false, error_class: "meta_threads_text_invalid" };
  }
  const who = await identity(config.transport);
  if (!who.ok) return who;
  const feed = await recent(config.transport);
  if (!feed.ok) return feed;
  if (feed.rows.some((row) => normalizeThreadsText(row.text) === normalized)) {
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
  if (!config?.transport) return { ok: false, error_class: "meta_threads_not_configured" };
  const published = await config.transport.publishText(body);
  if (!published.ok) return published;
  return {
    ok: true,
    accepted: true,
    provider_result: "meta_direct",
    provider_post_id: published.provider_object_id,
  };
}

export async function publishThreadsReplyViaMeta(env, { text, replyToId }) {
  const config = metaThreadsConfig(env);
  if (!config?.transport) return { ok: false, error_class: "meta_threads_not_configured" };
  const who = await identity(config.transport);
  if (!who.ok) return who;
  const published = await config.transport.publishReply({ text, replyToId });
  if (!published.ok) return published;
  return {
    ok: true,
    accepted: true,
    provider_result: "meta_direct",
    provider_post_id: published.provider_object_id,
    reply_to_id: published.reply_to_id,
  };
}

export async function readbackThreadsReplyViaMeta(env, { providerPostId, replyToId }) {
  const credentials = metaThreadsCredentials(env);
  const transport = transportFromCredentials(credentials);
  if (!transport) return { ok: false, error_class: "meta_threads_not_configured" };
  const who = await identity(transport);
  if (!who.ok) return who;
  const media = await transport.readMedia(providerPostId);
  if (!media.ok) return media;
  const expectedParent = String(replyToId || "");
  const actualParent = String(media.media?.replied_to?.id || "");
  if (!media.media?.is_reply || actualParent !== expectedParent) {
    return {
      ok: false,
      error_class: "meta_threads_reply_parent_mismatch",
      observed_reply_to_id: actualParent || null,
    };
  }
  const permalink = safeThreadsPermalink(media.media?.permalink);
  if (!permalink) return { ok: false, error_class: "meta_threads_missing_permalink" };
  return {
    ok: true,
    found: true,
    provider_post_id: String(media.media.id),
    reply_to_id: actualParent,
    permalink,
    provider_timestamp: String(media.media.timestamp || ""),
  };
}

export async function readbackThreadsTextViaMeta(env, body) {
  // Readback follows immutable publication provenance, not the provider that is
  // currently selected for new writes. Keep credentials usable after a switch.
  const credentials = metaThreadsCredentials(env);
  const transport = transportFromCredentials(credentials);
  if (!transport) return { ok: false, error_class: "meta_threads_not_configured" };
  const who = await identity(transport);
  if (!who.ok) return who;
  const feed = await recent(transport);
  if (!feed.ok) return feed;
  const normalized = normalizeThreadsText(body);
  const match = feed.rows.find((row) => normalizeThreadsText(row.text) === normalized);
  if (!match) return { ok: true, found: false };
  const permalink = safeThreadsPermalink(match.permalink);
  if (!permalink) return { ok: false, error_class: "meta_threads_missing_permalink" };
  return {
    ok: true,
    found: true,
    provider_post_id: String(match.id),
    permalink,
    provider_timestamp: String(match.timestamp),
  };
}
