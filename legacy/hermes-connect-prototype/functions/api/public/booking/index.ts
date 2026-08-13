import { jsonResponse } from "../../_lib/session.mjs";
import { isValidContactMethod } from "../../../../src/contact-method.mjs";

type Env = { DB: D1Database };

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const specialistId = cleanText(body.specialistId, 120);
  const staffId = cleanText(body.staffId, 80);
  const serviceId = cleanText(body.serviceId, 60);
  const slot = cleanText(body.slot, 60);
  const clientName = cleanText(body.clientName, 100);
  const clientEmail = cleanText(body.clientEmail, 160).toLowerCase();
  const contactMethod = cleanText(body.contactMethod, 20);
  const contactHandle = cleanText(body.contactHandle, 100);

  const errors: string[] = [];
  if (!specialistId) errors.push("specialist_required");
  if (!serviceId || !slot) errors.push("service_and_slot_required");
  if (clientName.length < 2) errors.push("name_required");
  if (!isValidEmail(clientEmail)) errors.push("email_invalid");
  if (!isValidContactMethod(contactMethod)) errors.push("contact_method_invalid");
  if (contactHandle.length < 2) errors.push("contact_handle_required");
  if (errors.length) return jsonResponse(400, { success: false, errors });

  const specialist = await env.DB.prepare("SELECT id, name FROM specialists WHERE id = ?").bind(specialistId).first<{ id: string; name: string }>();
  if (!specialist) return jsonResponse(404, { success: false, error: "specialist_not_found" });

  let staffName: string | null = null;
  if (staffId) {
    const staff = await env.DB
      .prepare("SELECT id, name FROM staff_members WHERE id = ? AND specialist_id = ?")
      .bind(staffId, specialistId)
      .first<{ id: string; name: string }>();
    if (!staff) return jsonResponse(404, { success: false, error: "staff_not_found" });
    staffName = staff.name;
  }

  const ownsService = await env.DB
    .prepare(
      staffId
        ? "SELECT 1 FROM staff_services WHERE staff_id = ? AND service_id = ?"
        : "SELECT 1 FROM specialist_services WHERE specialist_id = ? AND service_id = ?",
    )
    .bind(staffId || specialistId, serviceId)
    .first();
  if (!ownsService) return jsonResponse(400, { success: false, error: "service_not_offered" });

  const ownsSlot = await env.DB
    .prepare(
      staffId
        ? "SELECT 1 FROM staff_availability WHERE staff_id = ? AND slot = ?"
        : "SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?",
    )
    .bind(staffId || specialistId, slot)
    .first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });

  const alreadyBooked = await env.DB
    .prepare(
      staffId
        ? "SELECT 1 FROM bookings WHERE staff_id = ? AND slot = ? AND status != 'cancelled'"
        : "SELECT 1 FROM bookings WHERE specialist_id = ? AND slot = ? AND status != 'cancelled'",
    )
    .bind(staffId || specialistId, slot)
    .first();
  if (alreadyBooked) return jsonResponse(409, { success: false, error: "slot_already_booked" });

  const service = await env.DB
    .prepare("SELECT name, duration_minutes as durationMinutes FROM services WHERE id = ?")
    .bind(serviceId)
    .first<{ name: string; durationMinutes: number }>();

  const id = `BOOK-${crypto.randomUUID().slice(0, 8)}`;
  const accessToken = crypto.randomUUID().replace(/-/g, "");
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO bookings (id, specialist_id, staff_id, service_id, slot, status, client_name, client_email, contact_method, contact_handle, booking_type, access_token, created_at) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'appointment', ?, ?)",
  )
    .bind(id, specialistId, staffId || null, serviceId, slot, clientName, clientEmail, contactMethod, contactHandle, accessToken, createdAt)
    .run();

  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      status: "confirmed",
      specialist: staffName ?? specialist.name,
      service: service?.name ?? serviceId,
      durationMinutes: service?.durationMinutes ?? null,
      time: slot,
      clientName,
      contactMethod,
      contactHandle,
      accessToken,
      mode: "simulation",
      calendarEventCreated: false,
      paymentCreated: false,
      messageSent: false,
    },
  });
}
