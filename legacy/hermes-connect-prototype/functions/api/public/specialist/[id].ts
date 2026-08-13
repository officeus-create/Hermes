import { jsonResponse } from "../../_lib/session.mjs";

type Env = { DB: D1Database };

export async function onRequestGet({ params, env }: { params: { id: string }; env: Env }) {
  const specialistId = String(params.id || "").slice(0, 120);
  const specialist = await env.DB
    .prepare("SELECT id, name, role, location, bio FROM specialists WHERE id = ?")
    .bind(specialistId)
    .first<{ id: string; name: string; role: string; location: string; bio: string }>();

  if (!specialist) return jsonResponse(404, { success: false, error: "specialist_not_found" });

  const services = await env.DB
    .prepare(
      "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN specialist_services ss ON ss.service_id = s.id WHERE ss.specialist_id = ?",
    )
    .bind(specialistId)
    .all();
  const availability = await env.DB
    .prepare(
      "SELECT sa.slot FROM specialist_availability sa WHERE sa.specialist_id = ? AND sa.slot NOT IN (SELECT slot FROM bookings WHERE specialist_id = ? AND status != 'cancelled')",
    )
    .bind(specialistId, specialistId)
    .all();

  const staffRows = await env.DB
    .prepare("SELECT id, name, role FROM staff_members WHERE specialist_id = ? ORDER BY created_at ASC")
    .bind(specialistId)
    .all();

  const staff = await Promise.all(
    (staffRows.results ?? []).map(async (row: any) => {
      const staffServices = await env.DB
        .prepare(
          "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN staff_services ss ON ss.service_id = s.id WHERE ss.staff_id = ?",
        )
        .bind(row.id)
        .all();
      const staffAvailability = await env.DB
        .prepare(
          "SELECT slot FROM staff_availability WHERE staff_id = ? AND slot NOT IN (SELECT slot FROM bookings WHERE staff_id = ? AND status != 'cancelled')",
        )
        .bind(row.id, row.id)
        .all();
      return {
        id: row.id,
        name: row.name,
        role: row.role,
        services: staffServices.results ?? [],
        availability: (staffAvailability.results ?? []).map((r: any) => r.slot),
      };
    }),
  );

  return jsonResponse(200, {
    success: true,
    specialist: {
      id: specialist.id,
      name: specialist.name,
      role: specialist.role,
      location: specialist.location,
      bio: specialist.bio,
      services: services.results ?? [],
      availability: (availability.results ?? []).map((row: any) => row.slot),
      staff,
    },
  });
}
