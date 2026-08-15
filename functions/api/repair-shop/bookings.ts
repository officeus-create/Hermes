import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingHistorySchema } from "../_lib/repair-shop-booking-history-schema.mjs";
import { ensureRepairShopBookingVehicleSchema } from "../_lib/repair-shop-booking-vehicle-schema.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingHistorySchema(env.DB);
  await ensureRepairShopBookingVehicleSchema(env.DB);

  const result = await env.DB
    .prepare(
      `SELECT id,shop_id,service_id,service_name,duration_minutes,appointment_date,start_time,end_time,status,
              client_name,client_email,client_phone,created_at,updated_at
       FROM repair_shop_bookings
       WHERE owner_specialist_id = ?
       ORDER BY appointment_date ASC, start_time ASC, created_at ASC
       LIMIT 250`,
    )
    .bind(specialist.id)
    .all();

  const historyResult = await env.DB
    .prepare(
      `SELECT id,booking_id,from_status,to_status,changed_at
       FROM repair_shop_booking_history
       WHERE owner_specialist_id = ?
       ORDER BY changed_at ASC, id ASC`,
    )
    .bind(specialist.id)
    .all();

  const vehicleResult = await env.DB
    .prepare(
      `SELECT booking_id,vehicle_year,vehicle_make,vehicle_model,mileage,vin
       FROM repair_shop_booking_vehicles
       WHERE owner_specialist_id = ?`,
    )
    .bind(specialist.id)
    .all();

  const historyByBooking = new Map<string, any[]>();
  for (const item of historyResult?.results ?? []) {
    const bookingId = String(item.booking_id ?? "");
    const list = historyByBooking.get(bookingId) ?? [];
    list.push(item);
    historyByBooking.set(bookingId, list);
  }

  const vehicleByBooking = new Map<string, any>();
  for (const item of vehicleResult?.results ?? []) {
    vehicleByBooking.set(String(item.booking_id ?? ""), {
      year: item.vehicle_year == null ? null : Number(item.vehicle_year),
      make: String(item.vehicle_make ?? ""),
      model: String(item.vehicle_model ?? ""),
      mileage: item.mileage == null ? null : Number(item.mileage),
      vin: item.vin == null ? null : String(item.vin),
    });
  }

  const bookings = (result?.results ?? []).map((booking: any) => ({
    ...booking,
    vehicle: vehicleByBooking.get(String(booking.id)) ?? null,
    history: historyByBooking.get(String(booking.id)) ?? [],
  }));

  return jsonResponse(200, { success: true, bookings });
}
