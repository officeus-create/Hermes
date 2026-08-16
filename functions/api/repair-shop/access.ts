import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import {
  ensureDefaultRepairShopAccess,
  ensureRepairShopAccessSchema,
  getRepairShopAccess,
  nextRepairShopCommercialAction,
  REPAIR_SHOP_PLAN_NAME,
} from "../_lib/repair-shop-access.mjs";

type Env = { DB?: any };

async function getOwnedShop(db: any, ownerId: string) {
  return db
    .prepare("SELECT id,created_at FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(ownerId)
    .first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopProfileSchema(env.DB);
  const shop = await getOwnedShop(env.DB, specialist.id);
  if (!shop?.id) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  await ensureRepairShopAccessSchema(env.DB);
  await ensureDefaultRepairShopAccess(env.DB, shop.id, shop.created_at);
  const access = await getRepairShopAccess(env.DB, shop.id);

  if (!access) return jsonResponse(500, { success: false, error: "access_state_unavailable" });

  return jsonResponse(200, {
    success: true,
    access: {
      state: access.access_state,
      plan_id: access.plan_id,
      plan_name: REPAIR_SHOP_PLAN_NAME,
      current_period_end: access.current_period_end ?? null,
      next_action: nextRepairShopCommercialAction(access.access_state),
    },
  });
}
