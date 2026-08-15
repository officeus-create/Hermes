import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingHistorySchema } from "../_lib/repair-shop-booking-history-schema.mjs";
import { ensureRepairShopBookingVehicleSchema } from "../_lib/repair-shop-booking-vehicle-schema.mjs";

type Env = { DB?: any };
type BookingInput = {
  shop_slug?: unknown;
  service_id?: unknown;
  appointment_date?: unknown;
  start_time?: unknown;
  client_name?: unknown;
  client_email?: unknown;
  client_phone?: unknown;
  vehicle_year?: unknown;
  vehicle_make?: unknown;
  vehicle_model?: unknown;
  mileage?: unknown;
  vin?: unknown;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VIN_RE = /^[A-HJ-NPR-Z0-9]{11,17}$/i;

const asText = (value: unknown) => String(value ?? "").trim();
const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};
const fromMinutes = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

function localDateForTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

function dayOfWeek(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

async function getPublicShop(db: any, slug: string) {
  await ensureRepairShopProfileSchema(db);
  return db
    .prepare("SELECT id,owner_specialist_id,name,slug,timezone FROM repair_shops WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first();
}

async function validateDateWindow(date: string, timezone: string) {
  if (!DATE_RE.test(date)) return false;
  const today = localDateForTimezone(timezone);
  const targetMs = Date.parse(`${date}T12:00:00Z`);
  const todayMs = Date.parse(`${today}T12:00:00Z`);
  if (!Number.isFinite(targetMs) || !Number.isFinite(todayMs)) return false;
  const diffDays = Math.floor((targetMs - todayMs) / 86400000);
  return diffDays >= 0 && diffDays <= 60;
}

async function readBusyIntervals(db: any, shopId: string, date: string) {
  await ensureRepairShopBookingsSchema(db);
  const result = await db
    .prepare(
      `SELECT start_time,end_time
       FROM repair_shop_bookings
       WHERE shop_id = ? AND appointment_date = ? AND lower(status) NOT IN ('cancelled','canceled')
       ORDER BY start_time ASC`,
    )
    .bind(shopId, date)
    .all();
  return result?.results ?? [];
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const url = new URL(request.url);
  const slug = asText(url.searchParams.get("shop"));
  const date = asText(url.searchParams.get("date"));
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return jsonResponse(400, { success: false, error: "invalid_shop_slug" });

  const shop = await getPublicShop(env.DB, slug);
  if (!shop) return jsonResponse(404, { success: false, error: "shop_not_found" });
  if (!(await validateDateWindow(date, shop.timezone))) {
    return jsonResponse(400, { success: false, error: "invalid_appointment_date" });
  }

  return jsonResponse(200, {
    success: true,
    shop: { slug: shop.slug, timezone: shop.timezone },
    date,
    busy: await readBusyIntervals(env.DB, shop.id, date),
  });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  let body: BookingInput;
  try {
    body = (await request.json()) as BookingInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const slug = asText(body.shop_slug).toLowerCase();
  const serviceId = asText(body.service_id);
  const appointmentDate = asText(body.appointment_date);
  const startTime = asText(body.start_time);
  const clientName = asText(body.client_name);
  const clientEmail = asText(body.client_email).toLowerCase();
  const clientPhone = asText(body.client_phone);
  const vehicleYear = Number(body.vehicle_year);
  const vehicleMake = asText(body.vehicle_make);
  const vehicleModel = asText(body.vehicle_model);
  const mileageText = asText(body.mileage);
  const mileage = mileageText ? Number(mileageText) : null;
  const vin = asText(body.vin).toUpperCase();

  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return jsonResponse(400, { success: false, error: "invalid_shop_slug" });
  if (!serviceId || serviceId.length > 160) return jsonResponse(400, { success: false, error: "invalid_service_id" });
  if (!TIME_RE.test(startTime)) return jsonResponse(400, { success: false, error: "invalid_start_time" });
  if (clientName.length < 2 || clientName.length > 120) return jsonResponse(400, { success: false, error: "invalid_client_name" });
  if (!EMAIL_RE.test(clientEmail) || clientEmail.length > 200) return jsonResponse(400, { success: false, error: "invalid_client_email" });
  if (clientPhone.length < 7 || clientPhone.length > 40) return jsonResponse(400, { success: false, error: "invalid_client_phone" });
  if (!Number.isInteger(vehicleYear) || vehicleYear < 1900 || vehicleYear > 2100) return jsonResponse(400, { success: false, error: "invalid_vehicle_year" });
  if (vehicleMake.length < 1 || vehicleMake.length > 80) return jsonResponse(400, { success: false, error: "invalid_vehicle_make" });
  if (vehicleModel.length < 1 || vehicleModel.length > 80) return jsonResponse(400, { success: false, error: "invalid_vehicle_model" });
  if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0 || mileage > 2000000)) return jsonResponse(400, { success: false, error: "invalid_mileage" });
  if (vin && !VIN_RE.test(vin)) return jsonResponse(400, { success: false, error: "invalid_vin" });

  const shop = await getPublicShop(env.DB, slug);
  if (!shop) return jsonResponse(404, { success: false, error: "shop_not_found" });
  if (!(await validateDateWindow(appointmentDate, shop.timezone))) {
    return jsonResponse(400, { success: false, error: "invalid_appointment_date" });
  }

  const service = await env.DB
    .prepare("SELECT id,name,duration_minutes FROM services WHERE id = ? AND owner_specialist_id = ? LIMIT 1")
    .bind(serviceId, shop.owner_specialist_id)
    .first();
  if (!service) return jsonResponse(404, { success: false, error: "service_not_found" });

  const durationMinutes = Number(service.duration_minutes);
  if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 720) {
    return jsonResponse(409, { success: false, error: "invalid_service_duration" });
  }

  await ensureRepairShopAvailabilitySchema(env.DB);
  const availability = await env.DB
    .prepare(
      "SELECT is_open,start_time,end_time FROM repair_shop_availability WHERE shop_id = ? AND day_of_week = ? LIMIT 1",
    )
    .bind(shop.id, dayOfWeek(appointmentDate))
    .first();
  if (!availability || Number(availability.is_open) !== 1 || !availability.start_time || !availability.end_time) {
    return jsonResponse(409, { success: false, error: "shop_closed_on_selected_day" });
  }

  const requestedStart = toMinutes(startTime);
  const requestedEnd = requestedStart + durationMinutes;
  const openStart = toMinutes(String(availability.start_time));
  const openEnd = toMinutes(String(availability.end_time));
  if (requestedStart < openStart || requestedEnd > openEnd) {
    return jsonResponse(409, { success: false, error: "outside_shop_hours" });
  }
  const endTime = fromMinutes(requestedEnd);

  const busy = await readBusyIntervals(env.DB, shop.id, appointmentDate);
  const overlaps = busy.some((row: any) => {
    if (!TIME_RE.test(String(row.start_time)) || !TIME_RE.test(String(row.end_time))) return false;
    const existingStart = toMinutes(String(row.start_time));
    const existingEnd = toMinutes(String(row.end_time));
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });
  if (overlaps) return jsonResponse(409, { success: false, error: "slot_unavailable" });

  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingHistorySchema(env.DB);
  await ensureRepairShopBookingVehicleSchema(env.DB);
  const id = `repair-booking-${crypto.randomUUID()}`;
  const historyId = `repair-booking-history-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  try {
    await env.DB.batch([
      env.DB
        .prepare(
          `INSERT INTO repair_shop_bookings
            (id,shop_id,owner_specialist_id,service_id,service_name,duration_minutes,appointment_date,start_time,end_time,status,client_name,client_email,client_phone,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .bind(
          id,
          shop.id,
          shop.owner_specialist_id,
          service.id,
          service.name,
          durationMinutes,
          appointmentDate,
          startTime,
          endTime,
          "confirmed",
          clientName,
          clientEmail,
          clientPhone,
          now,
          now,
        ),
      env.DB
        .prepare(
          `INSERT INTO repair_shop_booking_history
            (id,booking_id,owner_specialist_id,from_status,to_status,changed_at)
           VALUES (?,?,?,?,?,?)`,
        )
        .bind(historyId, id, shop.owner_specialist_id, null, "confirmed", now),
      env.DB
        .prepare(
          `INSERT INTO repair_shop_booking_vehicles
            (booking_id,owner_specialist_id,vehicle_year,vehicle_make,vehicle_model,mileage,vin,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
        .bind(id, shop.owner_specialist_id, vehicleYear, vehicleMake, vehicleModel, mileage, vin || null, now, now),
    ]);
  } catch (error: any) {
    const message = String(error?.message ?? error ?? "");
    if (/unique|constraint/i.test(message)) return jsonResponse(409, { success: false, error: "slot_unavailable" });
    throw error;
  }

  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      shop_id: shop.id,
      shop_name: shop.name,
      service_id: service.id,
      service_name: service.name,
      duration_minutes: durationMinutes,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status: "confirmed",
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      vehicle: {
        year: vehicleYear,
        make: vehicleMake,
        model: vehicleModel,
        mileage,
        vin: vin || null,
      },
      timezone: shop.timezone,
    },
  });
}
