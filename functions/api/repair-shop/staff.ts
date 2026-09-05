import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureOfficeRepairDemoData } from "../_lib/repair-shop-office-demo.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopStaffSchema, serializeRepairShopStaff } from "../_lib/repair-shop-staff-schema.mjs";

type Env = { DB?: any; HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  if (specialist.role !== "Shop Owner") return jsonResponse(403, { success: false, error: "shop_owner_required" });

  const demoSeed = await ensureOfficeRepairDemoData({ db: env.DB, env, specialist });
  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare("SELECT id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  await ensureRepairShopStaffSchema(env.DB);
  const result = await env.DB
    .prepare(
      `SELECT id,shop_id,owner_specialist_id,name,role,specialties,active,created_at,updated_at
       FROM repair_shop_staff
       WHERE owner_specialist_id = ? AND shop_id = ?
       ORDER BY active DESC, name COLLATE NOCASE ASC`,
    )
    .bind(specialist.id, shop.id)
    .all();

  return jsonResponse(200, {
    success: true,
    shop_id: String(shop.id),
    staff: (result?.results ?? []).map(serializeRepairShopStaff),
    demo_seed: demoSeed.eligible ? demoSeed : undefined,
  });
}
