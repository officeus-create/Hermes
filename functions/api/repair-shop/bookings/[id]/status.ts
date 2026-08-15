import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../../../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingHistorySchema } from "../../../_lib/repair-shop-booking-history-schema.mjs";

type Env = { DB?: any };
type StatusInput = { status?: unknown };

const transitions: Record<string, string[]> = {
  confirmed: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function onRequestPatch({ request, env, params }: { request: Request; env: Env; params: { id?: string } }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const bookingId = String(params.id ?? "").trim();
  if (!bookingId) return jsonResponse(400, { success: false, error: "booking_id_required" });

  let body: StatusInput;
  try {
    body = (await request.json()) as StatusInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const nextStatus = String(body.status ?? "").trim().toLowerCase();
  if (!Object.hasOwn(transitions, nextStatus)) {
    return jsonResponse(400, { success: false, error: "invalid_booking_status" });
  }

  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingHistorySchema(env.DB);

  const booking = await env.DB
    .prepare(
      `SELECT id,status,service_name,appointment_date,start_time,end_time,client_name,client_email,client_phone,updated_at
       FROM repair_shop_bookings
       WHERE id = ? AND owner_specialist_id = ?
       LIMIT 1`,
    )
    .bind(bookingId, specialist.id)
    .first();

  if (!booking) return jsonResponse(404, { success: false, error: "booking_not_found" });

  const currentStatus = String(booking.status ?? "").toLowerCase();
  if (currentStatus === nextStatus) {
    return jsonResponse(200, { success: true, unchanged: true, booking });
  }

  if (!transitions[currentStatus]?.includes(nextStatus)) {
    return jsonResponse(409, {
      success: false,
      error: "invalid_status_transition",
      current_status: currentStatus,
      requested_status: nextStatus,
    });
  }

  const now = new Date().toISOString();
  const historyId = `repair-booking-history-${crypto.randomUUID()}`;
  const results = await env.DB.batch([
    env.DB
      .prepare(
        `INSERT INTO repair_shop_booking_history
          (id,booking_id,owner_specialist_id,from_status,to_status,changed_at)
         SELECT ?,id,owner_specialist_id,status,?,?
         FROM repair_shop_bookings
         WHERE id = ? AND owner_specialist_id = ? AND status = ?`,
      )
      .bind(historyId, nextStatus, now, bookingId, specialist.id, currentStatus),
    env.DB
      .prepare(
        `UPDATE repair_shop_bookings
         SET status = ?, updated_at = ?
         WHERE id = ? AND owner_specialist_id = ? AND status = ?`,
      )
      .bind(nextStatus, now, bookingId, specialist.id, currentStatus),
  ]);

  const changed = Number(results?.[1]?.meta?.changes ?? 0);
  if (changed !== 1) {
    return jsonResponse(409, { success: false, error: "status_conflict" });
  }

  const updated = await env.DB
    .prepare(
      `SELECT id,status,service_name,appointment_date,start_time,end_time,client_name,client_email,client_phone,updated_at
       FROM repair_shop_bookings
       WHERE id = ? AND owner_specialist_id = ?
       LIMIT 1`,
    )
    .bind(bookingId, specialist.id)
    .first();

  const history = await env.DB
    .prepare(
      `SELECT id,booking_id,from_status,to_status,changed_at
       FROM repair_shop_booking_history
       WHERE booking_id = ? AND owner_specialist_id = ?
       ORDER BY changed_at ASC, id ASC`,
    )
    .bind(bookingId, specialist.id)
    .all();

  return jsonResponse(200, { success: true, booking: updated, history: history?.results ?? [] });
}
