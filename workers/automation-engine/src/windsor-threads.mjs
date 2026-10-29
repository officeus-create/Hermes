const DEFAULT_ACCOUNT_ID = "28419597014385166";
const API_BASE = "https://connectors.windsor.ai/";

function clean(value, max = 1000) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function normalizePostText(value, max = 500) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function validHttps(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// Windsor FREE can return HTTP 200 and synthetic text instead of actual
// Threads data when an account/subscription is restricted. Never treat
// a provider-plan warning as a successful post or readback. No raw payload
// is stored/logged: consumers receive a bounded error class only.
export function windsorProviderResponseError(payload) {
  const values = [];
  const add = (value) => { if (typeof value === "string") values.push(value); };
  if (typeof payload === "string") add(payload);
  if (payload && typeof payload === "object") {
    add(payload.error);
    add(payload.message);
    add(payload.result);
    if (Array.isArray(payload.data)) {
      for (const row of payload.data.slice(0, 3)) {
        add(row?.post_id);
        add(row?.post_text);
        add(row?.message);
        add(row?.error);
      }
    }
  }
  const observed = values.join(" ").slice(0, 3000).toLowerCase();
  if (/reads are paused|not your real numbers|free plan includes [0-9]+ account|disconnect [0-9]+ accounts|upgrade at .*windsor/.test(observed)) {
    return "windsor_plan_account_limit";
  }
  if (payload && typeof payload === "object"
    && (payload.success === false || payload.ok === false || payload.status === "error")) {
    return "provider_rejected";
  }
  if (typeof payload?.error === "string" && payload.error.trim()) return "provider_rejected";
  return null;
}

export function windsorThreadsConfig(env) {
  const apiKey = clean(env?.WINDSOR_API_KEY, 4096);
  const accountId = clean(env?.WINDSOR_THREADS_ACCOUNT_ID || DEFAULT_ACCOUNT_ID, 160);
  if (!apiKey || !accountId) return null;
  return { apiKey, accountId };
}

function windsorUrl(path, apiKey) {
  const url = new URL(path, API_BASE);
  // Windsor Connectors API authenticates via query parameter. Never log
  // or persist this URL because it contains the API secret.
  url.searchParams.set("api_key", apiKey);
  return url;
}

export async function publishThreadsTextViaWindsor(env, text) {
  const config = windsorThreadsConfig(env);
  if (!config) return { ok: false, error_class: "windsor_not_configured" };
  const postText = normalizePostText(text, 500);
  if (!postText || postText.length > 500) return { ok: false, error_class: "threads_text_invalid" };

  const url = windsorUrl("threads/actions", config.apiKey);
  let response;
  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify({
        account: config.accountId,
        action: "create_text_post",
        params: { text: postText },
      }),
    });
  } catch {
    // Network failure after dispatch is ambiguous; caller must never blind-retry.
    return { ok: false, error_class: "provider_outcome_unknown" };
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error_class: response.status >= 500
        ? "provider_outcome_unknown"
        : response.status === 403
          ? "windsor_write_action_not_enabled"
          : "provider_rejected",
      provider_status: response.status,
    };
  }
  const providerError = windsorProviderResponseError(payload);
  if (providerError) return { ok: false, error_class: providerError };

  return {
    ok: true,
    accepted: true,
    provider_result: clean(payload?.result, 500) || null,
  };
}

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

export async function readbackThreadsTextViaWindsor(env, text) {
  const config = windsorThreadsConfig(env);
  if (!config) return { ok: false, error_class: "windsor_not_configured" };
  const postText = normalizePostText(text, 1000);
  if (!postText) return { ok: false, error_class: "threads_text_invalid" };

  const url = windsorUrl("threads", config.apiKey);
  url.searchParams.set("fields", "post_id,post_text,post_permalink,post_timestamp");
  url.searchParams.set("select_accounts", config.accountId);
  url.searchParams.set("date_preset", "last_3dT");
  url.searchParams.set("_max_rows", "100");
  url.searchParams.set("refresh_since", "3d");
  url.searchParams.set("refresh_interval", "1h");

  let response;
  try {
    response = await fetch(url.toString(), { headers: { "accept": "application/json" } });
  } catch {
    return { ok: false, error_class: "windsor_readback_network_failed" };
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error_class: "windsor_readback_failed" };
  const providerError = windsorProviderResponseError(payload);
  if (providerError) return { ok: false, error_class: providerError };

  const exact = normalizeRows(payload).find((row) => normalizePostText(row?.post_text, 1000) === postText);
  if (!exact) return { ok: true, found: false };
  const providerPostId = clean(exact?.post_id, 240);
  const permalink = validHttps(exact?.post_permalink);
  if (!providerPostId) return { ok: true, found: false };
  return {
    ok: true,
    found: true,
    provider_post_id: providerPostId,
    permalink,
    provider_timestamp: clean(exact?.post_timestamp, 80) || null,
  };
}

export const WINDSOR_THREADS_DEFAULT_ACCOUNT_ID = DEFAULT_ACCOUNT_ID;