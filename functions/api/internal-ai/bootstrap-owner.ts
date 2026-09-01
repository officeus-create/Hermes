import { ensureInternalAiSchema, nowIso } from "../_lib/internal-ai.mjs";
import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = {
  DB?: any;
  HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN?: string;
};

type BootstrapInput = { bootstrap_token?: unknown };

const sameOriginMutation = (request: Request) => {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const secFetchSite = request.headers.get("Sec-Fetch-Site");
  return secFetchSite !== "cross-site" && (!origin || origin === url.origin);
};

function timingSafeEqualText(left: unknown, right: unknown) {
  const a = new TextEncoder().encode(String(left ?? ""));
  const b = new TextEncoder().encode(String(right ?? ""));
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    mismatch |= (a[index] || 0) ^ (b[index] || 0);
  }
  return mismatch === 0;
}

const noStore = { "Cache-Control": "no-store" };
const MIN_BOOTSTRAP_SECRET_LENGTH = 32;

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, noStore);
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" }, noStore);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, noStore);

  await ensureInternalAiSchema(env.DB);
  const current = await env.DB
    .prepare("SELECT specialist_id FROM hermes_internal_owner_access WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER' LIMIT 1")
    .bind(specialist.id)
    .first();
  if (current) {
    return jsonResponse(200, { success: true, state: "already_active", capability: "HERMES_INTERNAL_OWNER" }, noStore);
  }

  const expected = String(env.HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN || "");
  if (!expected) return jsonResponse(503, { success: false, error: "internal_owner_bootstrap_not_configured" }, noStore);
  if (expected.length < MIN_BOOTSTRAP_SECRET_LENGTH) {
    return jsonResponse(503, { success: false, error: "internal_owner_bootstrap_secret_too_weak" }, noStore);
  }

  let body: BootstrapInput;
  try {
    body = (await request.json()) as BootstrapInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, noStore);
  }
  const supplied = String(body.bootstrap_token || "").trim();
  if (
    supplied.length < MIN_BOOTSTRAP_SECRET_LENGTH ||
    supplied.length > 512 ||
    !timingSafeEqualText(supplied, expected)
  ) {
    return jsonResponse(403, { success: false, error: "invalid_bootstrap_token" }, noStore);
  }

  const existingOwner = await env.DB
    .prepare("SELECT specialist_id FROM hermes_internal_owner_access WHERE active = 1 AND capability = 'HERMES_INTERNAL_OWNER' LIMIT 1")
    .first();
  if (existingOwner) {
    return jsonResponse(409, { success: false, error: "internal_owner_already_provisioned" }, noStore);
  }

  const now = nowIso();
  await env.DB
    .prepare(`INSERT INTO hermes_internal_owner_access (specialist_id, active, capability, created_at, updated_at)
      VALUES (?, 1, 'HERMES_INTERNAL_OWNER', ?, ?)
      ON CONFLICT(specialist_id) DO UPDATE SET active = 1, capability = 'HERMES_INTERNAL_OWNER', updated_at = excluded.updated_at`)
    .bind(specialist.id, now, now)
    .run();

  return jsonResponse(201, {
    success: true,
    state: "activated",
    capability: "HERMES_INTERNAL_OWNER",
  }, noStore);
}
