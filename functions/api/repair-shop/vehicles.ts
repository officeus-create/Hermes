import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingVehicleSchema } from "../_lib/repair-shop-booking-vehicle-schema.mjs";
import { ensureOfficeRepairDemoData } from "../_lib/repair-shop-office-demo.mjs";

type Env = { DB?: any; HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string };

type BookingRow = {
  id: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  status: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  created_at: string;
  updated_at: string;
};

type VehicleRow = {
  booking_id: string;
  vehicle_year: number | null;
  vehicle_make: string;
  vehicle_model: string;
  mileage: number | null;
  vin: string | null;
};

const ACTIVE_APPOINTMENT_STATUSES = new Set(["confirmed", "in_progress"]);
const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const normalizeText = (value: unknown) => String(value ?? "").trim();
const normalizeVin = (value: unknown) => normalizeText(value).toUpperCase().replace(/\s+/g, "");
const todayIso = () => new Date().toISOString().slice(0, 10);
const bookingStamp = (booking: BookingRow) => `${normalizeText(booking.appointment_date)}T${normalizeText(booking.start_time)}`;

const vehicleIdentity = (booking: BookingRow, vehicle: VehicleRow) => {
  const vin = normalizeVin(vehicle.vin);
  if (vin) return `vin:${vin}`;
  const customer = normalizeEmail(booking.client_email) || `${normalizeText(booking.client_name).toLowerCase()}|${normalizeText(booking.client_phone)}`;
  return `customer:${customer}|ymm:${vehicle.vehicle_year ?? ""}|${normalizeText(vehicle.vehicle_make).toLowerCase()}|${normalizeText(vehicle.vehicle_model).toLowerCase()}`;
};

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const demoSeed = await ensureOfficeRepairDemoData({ db: env.DB, env, specialist });
  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingVehicleSchema(env.DB);

  const bookingResult = await env.DB
    .prepare(
      `SELECT id,service_name,appointment_date,start_time,status,client_name,client_email,client_phone,created_at,updated_at
       FROM repair_shop_bookings
       WHERE owner_specialist_id = ?
       ORDER BY appointment_date DESC, start_time DESC, updated_at DESC
       LIMIT 1400`,
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
  for (const row of vehicleResult?.results ?? []) vehicleByBooking.set(String(row.booking_id), row as VehicleRow);

  const today = todayIso();
  const vehicles = new Map<string, any>();

  for (const rawBooking of bookingResult?.results ?? []) {
    const booking = rawBooking as BookingRow;
    const vehicle = vehicleByBooking.get(String(booking.id));
    if (!vehicle) continue;

    const identity = vehicleIdentity(booking, vehicle);
    const stamp = bookingStamp(booking);
    const appointmentDate = normalizeText(booking.appointment_date);
    const status = normalizeText(booking.status).toLowerCase();
    const customerEmail = normalizeEmail(booking.client_email);
    const customer = {
      name: normalizeText(booking.client_name),
      email: customerEmail,
      phone: normalizeText(booking.client_phone),
    };

    let record = vehicles.get(identity);
    if (!record) {
      record = {
        id: identity,
        year: vehicle.vehicle_year == null ? null : Number(vehicle.vehicle_year),
        make: normalizeText(vehicle.vehicle_make),
        model: normalizeText(vehicle.vehicle_model),
        vin: normalizeVin(vehicle.vin) || null,
        mileage: vehicle.mileage == null ? null : Number(vehicle.mileage),
        total_bookings: 0,
        completed_visits: 0,
        cancelled_bookings: 0,
        last_seen_date: appointmentDate || null,
        last_completed_visit: null,
        next_appointment: null,
        current_customer: customer,
        services: new Set<string>(),
        customers: new Map<string, any>(),
        history: [],
        latest_stamp: stamp,
      };
      vehicles.set(identity, record);
    }

    record.total_bookings += 1;
    if (status === "completed") {
      record.completed_visits += 1;
      if (!record.last_completed_visit || appointmentDate > record.last_completed_visit) record.last_completed_visit = appointmentDate;
    }
    if (status === "cancelled" || status === "canceled") record.cancelled_bookings += 1;

    const serviceName = normalizeText(booking.service_name);
    if (serviceName) record.services.add(serviceName);

    const customerKey = customerEmail || `${customer.name.toLowerCase()}|${customer.phone}`;
    const existingCustomer = record.customers.get(customerKey);
    if (!existingCustomer || stamp >= existingCustomer.last_seen_stamp) {
      record.customers.set(customerKey, { ...customer, last_seen_date: appointmentDate, last_seen_stamp: stamp });
    }

    if (stamp >= record.latest_stamp) {
      record.latest_stamp = stamp;
      record.current_customer = customer;
      record.last_seen_date = appointmentDate || record.last_seen_date;
      record.year = vehicle.vehicle_year == null ? record.year : Number(vehicle.vehicle_year);
      record.make = normalizeText(vehicle.vehicle_make) || record.make;
      record.model = normalizeText(vehicle.vehicle_model) || record.model;
      if (vehicle.mileage != null) record.mileage = Number(vehicle.mileage);
      const vin = normalizeVin(vehicle.vin);
      if (vin) record.vin = vin;
    }

    if (vehicle.mileage != null && stamp >= record.latest_stamp) record.mileage = Number(vehicle.mileage);

    if (ACTIVE_APPOINTMENT_STATUSES.has(status) && appointmentDate >= today) {
      const candidate = {
        booking_id: String(booking.id),
        appointment_date: appointmentDate,
        start_time: normalizeText(booking.start_time),
        service_name: serviceName,
        status,
      };
      if (!record.next_appointment || `${candidate.appointment_date}T${candidate.start_time}` < `${record.next_appointment.appointment_date}T${record.next_appointment.start_time}`) {
        record.next_appointment = candidate;
      }
    }

    record.history.push({
      booking_id: String(booking.id),
      appointment_date: appointmentDate,
      start_time: normalizeText(booking.start_time),
      service_name: serviceName,
      status,
      mileage: vehicle.mileage == null ? null : Number(vehicle.mileage),
      customer,
    });
  }

  const list = Array.from(vehicles.values())
    .map((record) => ({
      id: record.id,
      year: record.year,
      make: record.make,
      model: record.model,
      vin: record.vin,
      mileage: record.mileage,
      total_bookings: record.total_bookings,
      completed_visits: record.completed_visits,
      cancelled_bookings: record.cancelled_bookings,
      last_seen_date: record.last_seen_date,
      last_completed_visit: record.last_completed_visit,
      next_appointment: record.next_appointment,
      current_customer: record.current_customer,
      services: Array.from(record.services as Set<string>).sort((a, b) => a.localeCompare(b)),
      customers: Array.from(record.customers.values())
        .map(({ last_seen_stamp, ...customer }: any) => customer)
        .sort((a: any, b: any) => String(b.last_seen_date).localeCompare(String(a.last_seen_date))),
      history: [...record.history].sort((a: any, b: any) => `${b.appointment_date}T${b.start_time}`.localeCompare(`${a.appointment_date}T${a.start_time}`)),
    }))
    .sort((a, b) => String(b.last_seen_date ?? "").localeCompare(String(a.last_seen_date ?? "")));

  return jsonResponse(200, { success: true, vehicles: list, demo_seed: demoSeed.eligible ? demoSeed : undefined });
}
