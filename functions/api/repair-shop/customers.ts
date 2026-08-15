import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingVehicleSchema } from "../_lib/repair-shop-booking-vehicle-schema.mjs";

type Env = { DB?: any };

type VehicleRow = {
  booking_id: string;
  vehicle_year: number | null;
  vehicle_make: string;
  vehicle_model: string;
  mileage: number | null;
  vin: string | null;
};

const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const todayIso = () => new Date().toISOString().slice(0, 10);
const ACTIVE_APPOINTMENT_STATUSES = new Set(["confirmed", "in_progress"]);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingVehicleSchema(env.DB);

  const bookingResult = await env.DB
    .prepare(
      `SELECT id,service_name,appointment_date,start_time,status,client_name,client_email,client_phone,created_at,updated_at
       FROM repair_shop_bookings
       WHERE owner_specialist_id = ?
       ORDER BY updated_at DESC, appointment_date DESC, start_time DESC
       LIMIT 1000`,
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

  const vehicleByBooking = new Map<string, VehicleRow>();
  for (const row of vehicleResult?.results ?? []) {
    vehicleByBooking.set(String(row.booking_id), row as VehicleRow);
  }

  const today = todayIso();
  const customers = new Map<string, any>();

  for (const booking of bookingResult?.results ?? []) {
    const email = normalizeEmail(booking.client_email);
    if (!email) continue;

    let customer = customers.get(email);
    if (!customer) {
      customer = {
        id: email,
        name: String(booking.client_name ?? ""),
        email,
        phone: String(booking.client_phone ?? ""),
        total_bookings: 0,
        completed_visits: 0,
        cancelled_bookings: 0,
        last_activity_at: String(booking.updated_at ?? booking.created_at ?? ""),
        last_service_date: null,
        next_appointment: null,
        services: [],
        vehicles: [],
      };
      customers.set(email, customer);
    }

    customer.total_bookings += 1;
    const status = String(booking.status ?? "").toLowerCase();
    const appointmentDate = String(booking.appointment_date ?? "");
    if (status === "completed") {
      customer.completed_visits += 1;
      if (!customer.last_service_date || appointmentDate > customer.last_service_date) {
        customer.last_service_date = appointmentDate;
      }
    }
    if (status === "cancelled" || status === "canceled") customer.cancelled_bookings += 1;

    if (ACTIVE_APPOINTMENT_STATUSES.has(status) && appointmentDate >= today) {
      const candidate = {
        booking_id: String(booking.id),
        appointment_date: appointmentDate,
        start_time: String(booking.start_time ?? ""),
        service_name: String(booking.service_name ?? ""),
        status,
      };
      if (
        !customer.next_appointment ||
        `${candidate.appointment_date}T${candidate.start_time}` < `${customer.next_appointment.appointment_date}T${customer.next_appointment.start_time}`
      ) {
        customer.next_appointment = candidate;
      }
    }

    const serviceName = String(booking.service_name ?? "").trim();
    if (serviceName && !customer.services.includes(serviceName)) customer.services.push(serviceName);

    const vehicle = vehicleByBooking.get(String(booking.id));
    if (vehicle) {
      const key = vehicle.vin
        ? `vin:${String(vehicle.vin).toUpperCase()}`
        : `ymm:${vehicle.vehicle_year ?? ""}|${String(vehicle.vehicle_make).toLowerCase()}|${String(vehicle.vehicle_model).toLowerCase()}`;
      let existing = customer.vehicles.find((item: any) => item.key === key);
      if (!existing) {
        existing = {
          key,
          year: vehicle.vehicle_year == null ? null : Number(vehicle.vehicle_year),
          make: String(vehicle.vehicle_make ?? ""),
          model: String(vehicle.vehicle_model ?? ""),
          mileage: vehicle.mileage == null ? null : Number(vehicle.mileage),
          vin: vehicle.vin == null ? null : String(vehicle.vin),
          last_seen_date: appointmentDate,
        };
        customer.vehicles.push(existing);
      } else if (appointmentDate >= existing.last_seen_date) {
        existing.last_seen_date = appointmentDate;
        if (vehicle.mileage != null) existing.mileage = Number(vehicle.mileage);
      }
    }
  }

  const list = Array.from(customers.values())
    .map((customer) => ({
      ...customer,
      services: [...customer.services].sort((a, b) => a.localeCompare(b)),
      vehicles: customer.vehicles
        .map(({ key, ...vehicle }: any) => vehicle)
        .sort((a: any, b: any) => String(b.last_seen_date).localeCompare(String(a.last_seen_date))),
    }))
    .sort((a, b) => String(b.last_activity_at).localeCompare(String(a.last_activity_at)));

  return jsonResponse(200, { success: true, customers: list });
}
