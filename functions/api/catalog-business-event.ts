import { repairShopDirectory } from "../../src/data/repair-shop-directory";
import { CATALOG_EVENT_TYPES, recordCatalogBusinessEvent } from "./_lib/catalog-business-events.mjs";
import { ensureRepairShopProfileSchema } from "./_lib/repair-shop-schema.mjs";
import { jsonResponse } from "./_lib/session.mjs";

type Env = { DB?: any };
const MAX_BODY_BYTES = 2_000;

const sameOriginRequest = (request: Request) => {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return false;
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const staticBusinessIds = new Set(
  repairShopDirectory.map((entry) => `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`)
);

async function validCatalogBusinessId(db: any, value: string) {
  if (staticBusinessIds.has(value)) return true;
  const match = value.match(/^repair-shop-crm:([a-zA-Z0-9_-]{6,160})$/);
  if (!match) return false;
  await ensureRepairShopProfileSchema(db);
  const row = await db.prepare(
    "SELECT id FROM repair_shops WHERE id = ? AND catalog_opt_in = 1 LIMIT 1"
  ).bind(match[1]).first();
  return Boolean(row?.id);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!sameOriginRequest(request)) return jsonResponse(403, { success: false, error: "origin_not_allowed" });

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) return jsonResponse(413, { success: false, error: "request_too_large" });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  if (body.analytics_consent !== true) {
    return jsonResponse(400, { success: false, error: "analytics_consent_required" });
  }

  const catalogBusinessId = clean(body.catalog_business_id, 220);
  const eventType = clean(body.event_type, 40);
  if (!CATALOG_EVENT_TYPES.has(eventType)) {
    return jsonResponse(400, { success: false, error: "invalid_event_type" });
  }
  if (!await validCatalogBusinessId(env.DB, catalogBusinessId)) {
    return jsonResponse(400, { success: false, error: "invalid_catalog_business" });
  }

  const now = new Date();
  await recordCatalogBusinessEvent(env.DB, {
    day: now.toISOString().slice(0, 10),
    catalogBusinessId,
    eventType,
    now: now.toISOString(),
  });

  return jsonResponse(202, { success: true }, { "Cache-Control": "no-store" });
}
