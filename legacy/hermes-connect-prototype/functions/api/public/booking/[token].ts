import { jsonResponse } from "../../_lib/session.mjs";

type Env = { DB: D1Database };

type BookingRow = {
  id: string;
  status: string;
  slot: string;
  client_name: string;
  created_at: string;
  specialist_name: string;
  service_name: string;
  duration_minutes: number;
  contact_method: string | null;
  contact_handle: string | null;
  booking_type: string;
  meeting_topic: string | null;
  meeting_link: string | null;
};

async function findBooking(token: string, db: D1Database) {
  return db
    .prepare(
      `SELECT b.id, b.status, b.slot, b.client_name, b.created_at,
              b.contact_method, b.contact_handle, b.booking_type, b.meeting_topic, b.meeting_link,
              sp.name as specialist_name, sv.name as service_name, sv.duration_minutes
       FROM bookings b
       JOIN specialists sp ON sp.id = b.specialist_id
       JOIN services sv ON sv.id = b.service_id
       WHERE b.access_token = ?`,
    )
    .bind(token)
    .first<BookingRow>();
}

function toPublicShape(row: BookingRow) {
  return {
    id: row.id,
    status: row.status,
    specialist: row.specialist_name,
    service: row.service_name,
    durationMinutes: row.duration_minutes,
    time: row.slot,
    clientName: row.client_name,
    createdAt: row.created_at,
    contactMethod: row.contact_method,
    contactHandle: row.contact_handle,
    bookingType: row.booking_type,
    meetingTopic: row.meeting_topic,
    meetingLink: row.meeting_link,
  };
}

export async function onRequestGet({ params, env }: { params: { token: string }; env: Env }) {
  const token = String(params.token || "").slice(0, 80);
  const row = await findBooking(token, env.DB);
  if (!row) return jsonResponse(404, { success: false, error: "booking_not_found" });
  return jsonResponse(200, { success: true, booking: toPublicShape(row) });
}

export async function onRequestPatch({ request, params, env }: { request: Request; params: { token: string }; env: Env }) {
  const token = String(params.token || "").slice(0, 80);
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // no body is fine for a plain cancel
  }
  if (body.action !== "cancel") return jsonResponse(400, { success: false, error: "unsupported_action" });

  const row = await findBooking(token, env.DB);
  if (!row) return jsonResponse(404, { success: false, error: "booking_not_found" });
  if (row.status === "cancelled") return jsonResponse(200, { success: true, booking: toPublicShape(row) });

  await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE access_token = ?").bind(token).run();
  const updated = await findBooking(token, env.DB);
  return jsonResponse(200, { success: true, booking: toPublicShape(updated!) });
}
