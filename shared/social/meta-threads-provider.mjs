// Shared official Meta Threads transport primitives.
// Transport only: no scheduling, campaign policy, retries, qualification or UI ownership.
// Access tokens are carried in Authorization headers and must never appear in URLs/logs.

export const META_THREADS_GRAPH_BASE = "https://graph.threads.net/v1.0/";

export function normalizeThreadsText(value, max = 500) {
  return typeof value === "string" ? value
    .replace(/\r\n?/g, "\n")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .split("\n").map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max) : "";
}

export function safeThreadsPermalink(value) {
  try {
    const url = new URL(String(value || ""));
    if (
      url.protocol !== "https:" ||
      !["threads.com", "www.threads.com", "threads.net", "www.threads.net"].includes(url.hostname)
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function clean(value, max = 4096) {
  return String(value ?? "").trim().slice(0, max);
}

function numericId(value) {
  const id = clean(value, 160);
  return /^[0-9]{6,40}$/.test(id) ? id : null;
}

function normalizedUsername(value) {
  return clean(value, 160).replace(/^@/, "").toLowerCase();
}

function normalizeProviderError(response, post) {
  if (response.status === 401 || response.status === 403) return "meta_threads_auth_rejected";
  if (response.status === 429) return "meta_threads_rate_limited";
  if (response.status >= 500) return post ? "provider_outcome_unknown" : "meta_threads_readback_unavailable";
  return "meta_threads_provider_rejected";
}

export function createMetaThreadsTransport({
  accessToken,
  accountId,
  expectedUsername,
  fetchImpl = fetch,
  graphBase = META_THREADS_GRAPH_BASE,
} = {}) {
  const token = clean(accessToken);
  const account = numericId(accountId);
  const username = normalizedUsername(expectedUsername);
  let base;
  try {
    base = new URL(String(graphBase || ""));
  } catch {
    return null;
  }
  if (
    token.length < 20 ||
    token.length > 4096 ||
    !account ||
    !username ||
    base.protocol !== "https:" ||
    base.hostname !== "graph.threads.net"
  ) return null;

  const authHeaders = () => ({
    authorization: `Bearer ${token}`,
    accept: "application/json",
  });

  async function request(path, { params = {}, post = false } = {}) {
    const url = new URL(String(path || ""), base);
    const headers = authHeaders();
    const options = { method: post ? "POST" : "GET", headers };
    if (post) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      options.body = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") acc[key] = String(value);
          return acc;
        }, {})
      ).toString();
    } else {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
      }
    }
    try {
      const response = await fetchImpl(url.toString(), options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.error || payload?.success === false) {
        return {
          ok: false,
          provider_status: response.status,
          error_class: normalizeProviderError(response, post),
        };
      }
      if (!payload || typeof payload !== "object") {
        return { ok: false, error_class: "meta_threads_invalid_response" };
      }
      return { ok: true, provider_status: response.status, payload };
    } catch {
      return {
        ok: false,
        provider_status: null,
        error_class: post ? "provider_outcome_unknown" : "meta_threads_readback_unavailable",
      };
    }
  }

  async function verifyIdentity() {
    const result = await request("me", { params: { fields: "id,username" } });
    if (!result.ok) return result;
    const id = numericId(result.payload?.id);
    const actualUsername = normalizedUsername(result.payload?.username);
    if (id !== account || actualUsername !== username) {
      return {
        ok: false,
        error_class: "meta_threads_wrong_account",
        expected_account_id: account,
        observed_account_id: id,
        expected_username: username,
        observed_username: actualUsername || null,
      };
    }
    return { ok: true, account_id: account, username };
  }

  async function listRecentAuthored({ limit = 50 } = {}) {
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 50));
    const result = await request("me/threads", {
      params: { fields: "id,text,permalink,timestamp,media_type", limit: String(safeLimit) },
    });
    if (!result.ok) return result;
    const rows = result.payload?.data;
    if (!Array.isArray(rows) || rows.length > safeLimit) {
      return { ok: false, error_class: "meta_threads_invalid_feed" };
    }
    const normalized = [];
    for (const row of rows) {
      const id = numericId(row?.id);
      const mediaType = clean(row?.media_type || "TEXT_POST", 80);
      const textMissingAllowed = mediaType !== "TEXT_POST" && (row?.text === null || row?.text === undefined);
      const timestamp = clean(row?.timestamp, 100);
      if (
        !id ||
        (typeof row?.text !== "string" && !textMissingAllowed) ||
        !Number.isFinite(Date.parse(timestamp))
      ) {
        return { ok: false, error_class: "meta_threads_invalid_feed" };
      }
      normalized.push({
        id,
        text: typeof row.text === "string" ? row.text : null,
        permalink: safeThreadsPermalink(row.permalink),
        timestamp,
        media_type: mediaType,
      });
    }
    return { ok: true, rows: normalized };
  }

  async function publishText(text) {
    const body = normalizeThreadsText(text);
    if (!body || new TextEncoder().encode(body).byteLength > 500) {
      return { ok: false, error_class: "meta_threads_text_invalid" };
    }
    const container = await request(`${account}/threads`, {
      post: true,
      params: { media_type: "TEXT", text: body },
    });
    if (!container.ok) return container;
    const creationId = numericId(container.payload?.id);
    if (!creationId) return { ok: false, error_class: "provider_outcome_unknown" };

    const publication = await request(`${account}/threads_publish`, {
      post: true,
      params: { creation_id: creationId },
    });
    if (!publication.ok) return publication;
    const providerId = numericId(publication.payload?.id);
    if (!providerId) return { ok: false, error_class: "provider_outcome_unknown" };
    return {
      ok: true,
      provider_status: publication.provider_status,
      outcome_known: true,
      provider_object_id: providerId,
    };
  }

  async function publishReply({ text, replyToId }) {
    const body = normalizeThreadsText(text);
    const target = numericId(replyToId);
    if (!body || new TextEncoder().encode(body).byteLength > 500) {
      return { ok: false, error_class: "meta_threads_text_invalid" };
    }
    if (!target) return { ok: false, error_class: "invalid_reply_target" };

    const result = await request(`${account}/threads`, {
      post: true,
      params: {
        media_type: "TEXT",
        text: body,
        reply_to_id: target,
        auto_publish_text: "true",
      },
    });
    if (!result.ok) return result;
    const providerId = numericId(result.payload?.id);
    if (!providerId) return { ok: false, error_class: "provider_outcome_unknown" };
    return {
      ok: true,
      provider_status: result.provider_status,
      outcome_known: true,
      provider_object_id: providerId,
      reply_to_id: target,
    };
  }

  async function readMedia(mediaId) {
    const id = numericId(mediaId);
    if (!id) return { ok: false, error_class: "invalid_threads_media_id" };
    const result = await request(id, {
      params: {
        fields: "id,media_product_type,media_type,permalink,username,text,timestamp,is_quote_post,is_reply,replied_to,root_post",
      },
    });
    if (!result.ok) return result;
    const observedId = numericId(result.payload?.id);
    if (!observedId) return { ok: false, error_class: "meta_threads_invalid_response" };
    return {
      ok: true,
      media: {
        id: observedId,
        media_product_type: clean(result.payload?.media_product_type, 80),
        media_type: clean(result.payload?.media_type, 80),
        permalink: safeThreadsPermalink(result.payload?.permalink),
        username: normalizedUsername(result.payload?.username),
        text: String(result.payload?.text || "").slice(0, 2000),
        timestamp: clean(result.payload?.timestamp, 100),
        is_quote_post: Boolean(result.payload?.is_quote_post),
        is_reply: Boolean(result.payload?.is_reply),
        replied_to: numericId(result.payload?.replied_to?.id)
          ? { id: numericId(result.payload.replied_to.id) } : null,
        root_post: numericId(result.payload?.root_post?.id)
          ? { id: numericId(result.payload.root_post.id) } : null,
      },
    };
  }

  return Object.freeze({
    accountId: account,
    expectedUsername: username,
    verifyIdentity,
    listRecentAuthored,
    publishText,
    publishReply,
    readMedia,
  });
}
