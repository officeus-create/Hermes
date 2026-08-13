import { getAuthenticatedSpecialist, jsonResponse } from "./_lib/session.mjs";

type Env = { DB: D1Database };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const [latest, counts] = await Promise.all([
    // Name/contact must come from a single (the most recent) booking row per
    // client — aggregating each column independently with MAX() would mix
    // fields from different bookings when a client's method/handle changed.
    env.DB.prepare(
      `SELECT b.client_email as email, b.client_name as name, b.contact_method as contactMethod,
              b.contact_handle as contactHandle, b.created_at as lastBookingAt
       FROM bookings b
       WHERE b.specialist_id = ? AND b.client_email IS NOT NULL AND b.client_email != ''
         AND b.created_at = (
           SELECT MAX(b2.created_at) FROM bookings b2
           WHERE b2.specialist_id = b.specialist_id AND b2.client_email = b.client_email
         )
       GROUP BY b.client_email`,
    ).bind(specialist.id).all(),
    env.DB.prepare(
      `SELECT b.client_email as email, COUNT(*) as totalBookings,
              SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
              n.note as note
       FROM bookings b
       LEFT JOIN client_notes n ON n.specialist_id = b.specialist_id AND n.client_email = b.client_email
       WHERE b.specialist_id = ? AND b.client_email IS NOT NULL AND b.client_email != ''
       GROUP BY b.client_email`,
    ).bind(specialist.id).all(),
  ]);

  const countsByEmail = new Map((counts.results ?? []).map((row: any) => [row.email, row]));
  const clients = (latest.results ?? [])
    .map((row: any) => ({ ...row, ...(countsByEmail.get(row.email) ?? {}) }))
    .sort((a: any, b: any) => (a.lastBookingAt < b.lastBookingAt ? 1 : -1));

  return jsonResponse(200, { success: true, clients });
}
