import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    return jsonResponse(400, { success: false, error: "invalid_shop_slug" });
  }

  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare(
      "SELECT id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone FROM repair_shops WHERE slug = ? LIMIT 1",
    )
    .bind(slug)
    .first();

  if (!shop) return jsonResponse(404, { success: false, error: "shop_not_found" });

  const services = await env.DB
    .prepare(
      "SELECT id,name,duration_minutes FROM services WHERE owner_specialist_id = ? ORDER BY name COLLATE NOCASE ASC",
    )
    .bind(shop.owner_specialist_id)
    .all();

  const { owner_specialist_id: _owner, ...publicShop } = shop;
  return jsonResponse(200, { success: true, shop: publicShop, services: services?.results ?? [] });
}
