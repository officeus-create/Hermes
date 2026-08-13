import { getAuthenticatedSpecialist, jsonResponse } from "./_lib/session.mjs";

type Env = { DB: D1Database };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const serviceId = String(body.serviceId ?? "").trim().slice(0, 60);
  const slot = String(body.slot ?? "").trim().slice(0, 60);
  if (!serviceId || !slot) return jsonResponse(400, { success: false, error: "service_and_slot_required" });

  const ownsService = await env.DB
    .prepare("SELECT 1 FROM specialist_services WHERE specialist_id = ? AND service_id = ?")
    .bind(specialist.id, serviceId)
    .first();
  if (!ownsService) return jsonResponse(400, { success: false, error: "service_not_offered" });

  const ownsSlot = await env.DB
    .prepare("SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?")
    .bind(specialist.id, slot)
    .first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });

  const service = await env.DB
    .prepare("SELECT name, duration_minutes as durationMinutes FROM services WHERE id = ?")
    .bind(serviceId)
    .first<{ name: string; durationMinutes: number }>();

  const id = `TEST-${specialist.id}-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO bookings (id, specialist_id, service_id, slot, status, created_at) VALUES (?, ?, ?, ?, 'test_booking_created', ?)",
  )
    .bind(id, specialist.id, serviceId, slot, createdAt)
    .run();

  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      mode: "simulation",
      status: "test_booking_created",
      specialist: specialist.name,
      service: service?.name ?? serviceId,
      time: slot,
      externalWritePerformed: false,
      calendarEventCreated: false,
      paymentCreated: false,
      messageSent: false,
    },
  });
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const bookings = await env.DB
    .prepare(
      `SELECT b.id, b.slot, b.status, b.created_at as createdAt, s.name as serviceName,
              b.client_name as clientName, b.client_email as clientEmail,
              b.contact_method as contactMethod, b.contact_handle as contactHandle,
              b.booking_type as bookingType, b.meeting_topic as meetingTopic, b.meeting_link as meetingLink,
              sm.name as staffName
       FROM bookings b JOIN services s ON s.id = b.service_id
       LEFT JOIN staff_members sm ON sm.id = b.staff_id
       WHERE b.specialist_id = ? ORDER BY b.created_at DESC`,
    )
    .bind(specialist.id)
    .all();

  return jsonResponse(200, { success: true, bookings: bookings.results ?? [] });
}
