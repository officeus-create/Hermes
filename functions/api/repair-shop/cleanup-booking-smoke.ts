import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingHistorySchema } from "../_lib/repair-shop-booking-history-schema.mjs";

type Env = { DB?: any };
const TARGET_EMAIL = "repair-booking-production-smoke@hermesconnect.app";

export async function onRequestPost({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  await ensureRepairShopProfileSchema(env.DB);
  await ensureRepairShopAvailabilitySchema(env.DB);
  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingHistorySchema(env.DB);

  const specialist = await env.DB.prepare("SELECT id FROM specialists WHERE email = ? LIMIT 1").bind(TARGET_EMAIL).first();
  if (!specialist) return jsonResponse(200, { success: true, deleted: false, remaining: 0 });

  const id = specialist.id;
  await env.DB.prepare("DELETE FROM repair_shop_booking_history WHERE owner_specialist_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM repair_shop_bookings WHERE owner_specialist_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM repair_shop_availability WHERE shop_id IN (SELECT id FROM repair_shops WHERE owner_specialist_id = ?)").bind(id).run();
  await env.DB.prepare("DELETE FROM services WHERE owner_specialist_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM repair_shops WHERE owner_specialist_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM sessions WHERE specialist_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM specialists WHERE id = ? AND email = ?").bind(id, TARGET_EMAIL).run();

  const remaining = await env.DB.prepare("SELECT COUNT(*) AS count FROM specialists WHERE email = ?").bind(TARGET_EMAIL).first();
  if (Number(remaining?.count || 0) !== 0) return jsonResponse(500, { success: false, error: "cleanup_verification_failed" });
  return jsonResponse(200, { success: true, deleted: true, remaining: 0 });
}
