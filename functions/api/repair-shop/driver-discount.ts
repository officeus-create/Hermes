import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import {
  defaultRepairShopDriverDiscount,
  ensureRepairShopDriverDiscountSchema,
  REPAIR_SHOP_DISCOUNT_SCOPES,
  serializeRepairShopDriverDiscount,
} from "../_lib/repair-shop-driver-discount-schema.mjs";
import { listServicesForContext } from "../_lib/service-context.mjs";
import { resolveDefaultRepairShopServiceContext } from "../_lib/repair-shop-service-context.mjs";

type Env = { DB?: any };

type DiscountInput = {
  enabled?: unknown;
  service_discount_percent?: unknown;
  service_scope?: unknown;
  service_ids?: unknown;
  materials_discount_percent?: unknown;
  materials_scope?: unknown;
  materials_items?: unknown;
};

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function normalizePercent(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isInteger(number) && number >= 0 && number <= 100 ? number : null;
}

function normalizeScope(value: unknown) {
  const scope = clean(value, 16).toLowerCase();
  return REPAIR_SHOP_DISCOUNT_SCOPES.has(scope) ? scope : null;
}

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) return null;
  const items = value.map((item) => clean(item, 80)).filter(Boolean);
  if (items.length > 20) return null;
  return [...new Set(items)];
}

async function getOwnedShop(db: any, ownerId: string) {
  await ensureRepairShopProfileSchema(db);
  return db.prepare("SELECT id,name,slug,owner_specialist_id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1").bind(ownerId).first();
}

async function readDiscount(db: any, shopId: string) {
  await ensureRepairShopDriverDiscountSchema(db);
  const row = await db.prepare("SELECT * FROM repair_shop_driver_discounts WHERE shop_id = ? LIMIT 1").bind(shopId).first();
  return row ? serializeRepairShopDriverDiscount(row, shopId) : defaultRepairShopDriverDiscount(shopId);
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const shop = await getOwnedShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  const discount = await readDiscount(env.DB, String(shop.id));
  return jsonResponse(200, { success: true, discount });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const shop = await getOwnedShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  let body: DiscountInput;
  try {
    body = (await request.json()) as DiscountInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const enabled = Boolean(body.enabled);
  const servicePercent = normalizePercent(body.service_discount_percent);
  const materialsPercent = normalizePercent(body.materials_discount_percent);
  const serviceScope = normalizeScope(body.service_scope ?? "all");
  const materialsScope = normalizeScope(body.materials_scope ?? "all");
  const serviceIds = normalizeItems(body.service_ids ?? []);
  const materialsItems = normalizeItems(body.materials_items ?? []);

  if (servicePercent === null) return jsonResponse(400, { success: false, error: "invalid_service_discount_percent" });
  if (materialsPercent === null) return jsonResponse(400, { success: false, error: "invalid_materials_discount_percent" });
  if (!serviceScope) return jsonResponse(400, { success: false, error: "invalid_service_scope" });
  if (!materialsScope) return jsonResponse(400, { success: false, error: "invalid_materials_scope" });
  if (!serviceIds) return jsonResponse(400, { success: false, error: "invalid_service_ids" });
  if (!materialsItems) return jsonResponse(400, { success: false, error: "invalid_materials_items" });
  if (enabled && servicePercent === 0 && materialsPercent === 0) {
    return jsonResponse(400, { success: false, error: "discount_value_required" });
  }

  let normalizedServiceIds = servicePercent > 0 && serviceScope === "selected" ? serviceIds : [];
  if (servicePercent > 0 && serviceScope === "selected") {
    if (!normalizedServiceIds.length) return jsonResponse(400, { success: false, error: "selected_services_required" });
    const scope = await resolveDefaultRepairShopServiceContext(env.DB, specialist.id, shop);
    const services = await listServicesForContext(env.DB, {
      ownerId: specialist.id,
      contextId: scope.context.id,
      includeLegacyUnmapped: true,
    });
    const validIds = new Set(services.map((service: any) => String(service.id)));
    normalizedServiceIds = normalizedServiceIds.filter((id) => validIds.has(id));
    if (!normalizedServiceIds.length || normalizedServiceIds.length !== serviceIds.length) {
      return jsonResponse(400, { success: false, error: "invalid_selected_service" });
    }
  }

  const normalizedMaterialsItems = materialsPercent > 0 && materialsScope === "selected" ? materialsItems : [];
  if (materialsPercent > 0 && materialsScope === "selected" && normalizedMaterialsItems.length === 0) {
    return jsonResponse(400, { success: false, error: "selected_materials_required" });
  }

  await ensureRepairShopDriverDiscountSchema(env.DB);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO repair_shop_driver_discounts (
      shop_id,enabled,service_discount_percent,service_scope,service_ids,
      materials_discount_percent,materials_scope,materials_items,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(shop_id) DO UPDATE SET
      enabled=excluded.enabled,
      service_discount_percent=excluded.service_discount_percent,
      service_scope=excluded.service_scope,
      service_ids=excluded.service_ids,
      materials_discount_percent=excluded.materials_discount_percent,
      materials_scope=excluded.materials_scope,
      materials_items=excluded.materials_items,
      updated_at=excluded.updated_at
  `).bind(
    String(shop.id),
    enabled ? 1 : 0,
    servicePercent,
    servicePercent > 0 ? serviceScope : "all",
    JSON.stringify(normalizedServiceIds),
    materialsPercent,
    materialsPercent > 0 ? materialsScope : "all",
    JSON.stringify(normalizedMaterialsItems),
    now,
  ).run();

  const discount = await readDiscount(env.DB, String(shop.id));
  return jsonResponse(200, { success: true, discount });
}
