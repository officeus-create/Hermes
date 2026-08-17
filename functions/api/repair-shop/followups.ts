import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopFollowupsSchema } from "../_lib/repair-shop-followups-schema.mjs";

type Env = { DB?: any };
type FollowupInput = { booking_id?: unknown; needed?: unknown };

async function requireShopOwner(request: Request, env: Env) {
  if (!env.DB) return { error: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (specialist.role !== "Shop Owner") return { error: jsonResponse(403, { success: false, error: "shop_owner_required" }) };
  return { specialist };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireShopOwner(request, env);
  if (auth.error) return auth.error;
  await ensureRepairShopFollowupsSchema(env.DB);
  const result = await env.DB
    .prepare(
      `SELECT booking_id,updated_at
       FROM repair_shop_booking_followups
       WHERE owner_specialist_id = ? AND needed = 1
       ORDER BY updated_at DESC, booking_id ASC`,
    )
    .bind(auth.specialist.id)
    .all();
  return jsonResponse(200, { success: true, followups: result?.results ?? [] });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const auth = await requireShopOwner(request, env);
  if (auth.error) return auth.error;

  let body: FollowupInput;
  try {
    body = (await request.json()) as FollowupInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const bookingId = String(body.booking_id ?? "").trim();
  if (!bookingId || bookingId.length > 180) return jsonResponse(400, { success: false, error: "invalid_booking_id" });
  if (typeof body.needed !== "boolean") return jsonResponse(400, { success: false, error: "invalid_followup_state" });

  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopFollowupsSchema(env.DB);
  const booking = await env.DB
    .prepare("SELECT id,status FROM repair_shop_bookings WHERE id = ? AND owner_specialist_id = ? LIMIT 1")
    .bind(bookingId, auth.specialist.id)
    .first();
  if (!booking) return jsonResponse(404, { success: false, error: "booking_not_found" });
  if (String(booking.status ?? "").toLowerCase() !== "completed") {
    return jsonResponse(409, { success: false, error: "followup_requires_completed_booking" });
  }

  const now = new Date().toISOString();
  if (body.needed) {
    await env.DB
      .prepare(
        `INSERT INTO repair_shop_booking_followups (booking_id,owner_specialist_id,needed,updated_at)
         VALUES (?,?,1,?)
         ON CONFLICT(booking_id) DO UPDATE SET owner_specialist_id=excluded.owner_specialist_id,needed=1,updated_at=excluded.updated_at`,
      )
      .bind(bookingId, auth.specialist.id, now)
      .run();
  } else {
    await env.DB
      .prepare("DELETE FROM repair_shop_booking_followups WHERE booking_id = ? AND owner_specialist_id = ?")
      .bind(bookingId, auth.specialist.id)
      .run();
  }

  return jsonResponse(200, { success: true, booking_id: bookingId, follow_up_needed: body.needed, updated_at: now });
}
