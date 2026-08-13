import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB: D1Database };

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

export async function onRequestPatch({ request, params, env }: { request: Request; params: { id: string }; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const id = String(params.id || "").slice(0, 80);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const action = body.action;
  if (action !== "confirm" && action !== "decline") {
    return jsonResponse(400, { success: false, error: "unsupported_action" });
  }

  const booking = await env.DB
    .prepare("SELECT id, specialist_id, booking_type, status FROM bookings WHERE id = ?")
    .bind(id)
    .first<{ id: string; specialist_id: string; booking_type: string; status: string }>();
  if (!booking || booking.specialist_id !== specialist.id) return jsonResponse(404, { success: false, error: "booking_not_found" });
  if (booking.booking_type !== "meeting") return jsonResponse(400, { success: false, error: "not_a_meeting" });

  if (action === "decline") {
    if (booking.status !== "pending_approval") return jsonResponse(400, { success: false, error: "not_pending" });
    await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id).run();
  } else {
    if (booking.status === "cancelled") return jsonResponse(400, { success: false, error: "already_cancelled" });
    const meetingLink = cleanText(body.meetingLink, 300);
    await env.DB
      .prepare("UPDATE bookings SET status = 'confirmed', meeting_link = COALESCE(NULLIF(?, ''), meeting_link) WHERE id = ?")
      .bind(meetingLink, id)
      .run();
  }

  const updated = await env.DB
    .prepare(
      `SELECT id, slot, status, created_at as createdAt, client_name as clientName, client_email as clientEmail,
              contact_method as contactMethod, contact_handle as contactHandle,
              booking_type as bookingType, meeting_topic as meetingTopic, meeting_link as meetingLink
       FROM bookings WHERE id = ?`,
    )
    .bind(id)
    .first();

  return jsonResponse(200, { success: true, booking: updated });
}
