import fs from "node:fs";
import path from "node:path";

const API = "https://api.cloudflare.com/client/v4";
const SHA40 = /^[0-9a-f]{40}$/;
const ACCOUNT32 = /^[0-9a-f]{32}$/;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function timestamp(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : null;
}

export function evaluateIndependentHeartbeat(input = {}) {
  const nowMs = timestamp(input.now) ?? Date.now();
  const maxAgeMinutes = Number.isFinite(Number(input.max_age_minutes))
    ? Math.max(60, Math.min(360, Number(input.max_age_minutes)))
    : 150;
  const heartbeat = input.heartbeat && typeof input.heartbeat === "object" ? input.heartbeat : {};
  const incidents = [];

  const observedMs = timestamp(heartbeat.observed_at || heartbeat.scheduled_at);
  if (observedMs === null) {
    incidents.push({ code: "HAE_HEARTBEAT_MISSING" });
  } else {
    const ageMinutes = Math.floor((nowMs - observedMs) / 60000);
    if (ageMinutes < -5) incidents.push({ code: "HAE_HEARTBEAT_FUTURE", age_minutes: ageMinutes });
    else if (ageMinutes > maxAgeMinutes) incidents.push({ code: "HAE_HEARTBEAT_STALE", age_minutes: ageMinutes });
  }

  const sourceSha = String(heartbeat.source_sha || "").trim().toLowerCase();
  if (!SHA40.test(sourceSha)) incidents.push({ code: "HAE_SOURCE_SHA_UNVERIFIED" });

  return {
    status: incidents.length ? "INCIDENT" : "OK",
    incidents,
    observed_at: heartbeat.observed_at || null,
    source_sha: SHA40.test(sourceSha) ? sourceSha : null,
    trigger_type: String(heartbeat.trigger_type || "").slice(0, 40) || null,
    max_age_minutes: maxAgeMinutes,
    external_writes: 0,
  };
}

async function cloudflareJson(url, token, fetchImpl, body = null) {
  let response;
  try {
    response = await fetchImpl(url, {
      method: body === null ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body === null ? {} : { "Content-Type": "application/json" }),
      },
      signal: AbortSignal.timeout(15000),
      ...(body === null ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    fail("HAE_WATCH_CLOUDFLARE_TRANSPORT_FAILED");
  }
  if (!response?.ok) fail("HAE_WATCH_CLOUDFLARE_REJECTED");
  let json;
  try { json = await response.json(); } catch { fail("HAE_WATCH_CLOUDFLARE_JSON_INVALID"); }
  if (json?.success !== true) fail("HAE_WATCH_CLOUDFLARE_RESULT_FAILED");
  return json;
}

export async function runIndependentHeartbeatWatch({
  cloudflareToken,
  accountId,
  now = new Date().toISOString(),
  fetchImpl = fetch,
  maxAgeMinutes = 150,
} = {}) {
  const token = String(cloudflareToken || "").trim();
  const account = String(accountId || "").trim().toLowerCase();
  if (!token) fail("HAE_WATCH_TOKEN_MISSING");
  if (!ACCOUNT32.test(account)) fail("HAE_WATCH_ACCOUNT_ID_INVALID");

  const pages = await cloudflareJson(`${API}/accounts/${account}/pages/projects/hermes`, token, fetchImpl);
  const binding = pages.result?.deployment_configs?.production?.d1_databases?.DB;
  const dbId = String(binding?.id || "").trim();
  if (!/^[0-9a-f-]{32,36}$/i.test(dbId)) fail("HAE_WATCH_PRODUCTION_DB_BINDING_MISSING");

  const sql = `SELECT trigger_type,scheduled_at,observed_at,source_sha,automation_mode,publication_enabled
    FROM hermes_automation_heartbeats ORDER BY observed_at DESC LIMIT 1`;
  const result = await cloudflareJson(
    `${API}/accounts/${account}/d1/database/${dbId}/query`,
    token,
    fetchImpl,
    { sql, params: [] },
  );
  const rows = result.result?.[0]?.results;
  if (!Array.isArray(rows)) fail("HAE_WATCH_D1_RESULT_INVALID");
  const heartbeat = rows[0] || null;
  const evaluated = evaluateIndependentHeartbeat({
    now,
    heartbeat,
    max_age_minutes: maxAgeMinutes,
  });

  return {
    schema: "hae_independent_heartbeat_watch_v1",
    ...evaluated,
    database_binding_verified: true,
    query_mode: "READ_ONLY_SELECT",
  };
}

if (process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  let accountId = "";
  try {
    const config = JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc", "utf8"));
    accountId = String(config.account_id || "").trim();
  } catch {
    console.error("HAE_WATCH_ACCOUNT_CONFIG_UNAVAILABLE");
    process.exit(1);
  }

  runIndependentHeartbeatWatch({
    cloudflareToken: process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
    accountId,
    now: new Date().toISOString(),
    maxAgeMinutes: Number(process.env.HAE_HEARTBEAT_MAX_AGE_MINUTES || 150),
  }).then((receipt) => {
    const output = JSON.stringify(receipt, null, 2) + "\n";
    const file = process.env.HAE_WATCH_RECEIPT_PATH;
    if (file) fs.writeFileSync(file, output);
    console.log(output.trim());
    if (receipt.status !== "OK") process.exitCode = 2;
  }).catch((error) => {
    console.error(error?.code || "HAE_INDEPENDENT_HEARTBEAT_WATCH_FAILED");
    process.exitCode = 1;
  });
}
