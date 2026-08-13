import { getAuthenticatedSpecialist, jsonResponse } from "./_lib/session.mjs";

type Env = { DB: D1Database };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const [byStatus, byMeetingStatus, topServices, byClient] = await Promise.all([
    env.DB.prepare("SELECT status, COUNT(*) as count FROM bookings WHERE specialist_id = ? GROUP BY status")
      .bind(specialist.id).all<{ status: string; count: number }>(),
    env.DB.prepare("SELECT status, COUNT(*) as count FROM bookings WHERE specialist_id = ? AND booking_type = 'meeting' GROUP BY status")
      .bind(specialist.id).all<{ status: string; count: number }>(),
    env.DB.prepare(
      `SELECT s.name as name, COUNT(*) as count
       FROM bookings b JOIN services s ON s.id = b.service_id
       WHERE b.specialist_id = ? AND b.status != 'cancelled'
       GROUP BY b.service_id ORDER BY count DESC LIMIT 5`,
    ).bind(specialist.id).all<{ name: string; count: number }>(),
    env.DB.prepare(
      `SELECT client_email as clientEmail, COUNT(*) as count
       FROM bookings
       WHERE specialist_id = ? AND status = 'confirmed' AND client_email IS NOT NULL AND client_email != ''
       GROUP BY client_email`,
    ).bind(specialist.id).all<{ clientEmail: string; count: number }>(),
  ]);

  const statusCounts = Object.fromEntries((byStatus.results ?? []).map((r) => [r.status, r.count]));
  const meetingStatusCounts = Object.fromEntries((byMeetingStatus.results ?? []).map((r) => [r.status, r.count]));
  const totalBookings = Object.values(statusCounts).reduce((sum: number, n: any) => sum + n, 0);

  const clients = byClient.results ?? [];
  const repeatClients = clients.filter((c) => c.count > 1).length;
  const repeatRate = clients.length ? Math.round((repeatClients / clients.length) * 100) : 0;

  const meetingsRequested = Object.values(meetingStatusCounts).reduce((sum: number, n: any) => sum + n, 0);
  const meetingsConfirmed = meetingStatusCounts.confirmed ?? 0;
  const meetingConfirmRate = meetingsRequested ? Math.round((meetingsConfirmed / meetingsRequested) * 100) : null;

  return jsonResponse(200, {
    success: true,
    analytics: {
      totalBookings,
      confirmed: statusCounts.confirmed ?? 0,
      cancelled: statusCounts.cancelled ?? 0,
      pendingApproval: statusCounts.pending_approval ?? 0,
      topServices: topServices.results ?? [],
      distinctClients: clients.length,
      repeatClients,
      repeatRate,
      meetingsRequested,
      meetingsConfirmed,
      meetingConfirmRate,
    },
  });
}
