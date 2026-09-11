import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopBookingHistorySchema } from "../_lib/repair-shop-booking-history-schema.mjs";
import { ensureRepairShopBookingVehicleSchema } from "../_lib/repair-shop-booking-vehicle-schema.mjs";
import { ensureRepairShopCapabilitiesSchema } from "../_lib/repair-shop-capabilities-schema.mjs";
import { ensureRepairShopStaffSchema } from "../_lib/repair-shop-staff-schema.mjs";
import { ensureRepairShopStaffScheduleSchema } from "../_lib/repair-shop-staff-schedule-schema.mjs";
import { normalizeRepairShopCapacity, saturatedRepairShopIntervals } from "../_lib/repair-shop-capacity.mjs";
import { findServiceForContext } from "../_lib/service-context.mjs";
import { resolveDefaultRepairShopServiceContext } from "../_lib/repair-shop-service-context.mjs";
import { readGoogleBusyIntervalsForDate } from "../_lib/repair-shop-google-calendar.mjs";

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
type ScheduledStaff = {
  id: string;
  name: string;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
  breaks: { start_time: string; end_time: string }[];
};
type BusyInterval = { technician_id?: string | null; start_time: string; end_time: string };

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
const overlaps = (startA: string, endA: string, startB: string, endB: string) =>
  toMinutes(startA) < toMinutes(endB) && toMinutes(endA) > toMinutes(startB);

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

async function getPublicService(db: any, shop: any, serviceId: string) {
  const repairServiceScope = await resolveDefaultRepairShopServiceContext(
    db,
    String(shop.owner_specialist_id),
    shop,
  );
  return findServiceForContext(db, {
    ownerId: String(shop.owner_specialist_id),
    contextId: repairServiceScope.context.id,
    serviceId,
    includeLegacyUnmapped: true,
  });
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
      `SELECT technician_id,start_time,end_time
       FROM repair_shop_bookings
       WHERE shop_id = ? AND appointment_date = ? AND lower(status) NOT IN ('cancelled','canceled','no_show')
       ORDER BY start_time ASC`,
    )
    .bind(shopId, date)
    .all();
  return (result?.results ?? []).map((row: any) => ({
    technician_id: row?.technician_id ? String(row.technician_id) : null,
    start_time: String(row?.start_time || ""),
    end_time: String(row?.end_time || ""),
  })) as BusyInterval[];
}

async function readBookingCapacity(db: any, shopId: string) {
  await ensureRepairShopCapabilitiesSchema(db);
  const row = await db
    .prepare("SELECT parallel_booking_capacity FROM repair_shop_capabilities WHERE shop_id = ? LIMIT 1")
    .bind(shopId)
    .first();
  return normalizeRepairShopCapacity(row?.parallel_booking_capacity ?? 1);
}

function parseBreaks(value: unknown) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({ start_time: asText(item?.start_time), end_time: asText(item?.end_time) }))
      .filter((item) => TIME_RE.test(item.start_time) && TIME_RE.test(item.end_time) && item.start_time < item.end_time);
  } catch {
    return [];
  }
}

async function readTeamSchedule(db: any, shopId: string, ownerId: string, date: string) {
  await ensureRepairShopStaffSchema(db);
  await ensureRepairShopStaffScheduleSchema(db);
  const day = dayOfWeek(date);
  const configuredRow = await db
    .prepare("SELECT COUNT(*) AS count FROM repair_shop_staff_schedule WHERE shop_id = ? AND owner_specialist_id = ? AND day_of_week = ?")
    .bind(shopId, ownerId, day)
    .first();
  const configured = Number(configuredRow?.count ?? 0) > 0;
  if (!configured) return { configured: false, staff: [] as ScheduledStaff[] };

  const result = await db
    .prepare(
      `SELECT s.id,s.name,sc.is_working,sc.start_time,sc.end_time,sc.breaks
       FROM repair_shop_staff s
       JOIN repair_shop_staff_schedule sc ON sc.staff_id = s.id AND sc.shop_id = s.shop_id
       WHERE s.shop_id = ? AND s.owner_specialist_id = ? AND s.active = 1 AND sc.day_of_week = ?
       ORDER BY s.name COLLATE NOCASE ASC`,
    )
    .bind(shopId, ownerId, day)
    .all();

  const staff = (result?.results ?? []).map((row: any) => ({
    id: String(row.id),
    name: String(row.name || "Technician"),
    is_working: Number(row.is_working) === 1,
    start_time: row.start_time ? String(row.start_time) : null,
    end_time: row.end_time ? String(row.end_time) : null,
    breaks: parseBreaks(row.breaks),
  })) as ScheduledStaff[];
  return { configured: true, staff };
}

function staffCoversWindow(staff: ScheduledStaff, startTime: string, endTime: string) {
  if (!staff.is_working || !staff.start_time || !staff.end_time) return false;
  if (startTime < staff.start_time || endTime > staff.end_time) return false;
  return !staff.breaks.some((item) => overlaps(startTime, endTime, item.start_time, item.end_time));
}

function technicianIsBusy(intervals: BusyInterval[], technicianId: string, startTime: string, endTime: string) {
  return intervals.some(
    (item) => item.technician_id === technicianId && overlaps(startTime, endTime, item.start_time, item.end_time),
  );
}

function capacityIsBusy(intervals: BusyInterval[], capacity: number, startTime: string, endTime: string) {
  return intervals.filter((item) => overlaps(startTime, endTime, item.start_time, item.end_time)).length >= capacity;
}

function teamUnavailableIntervals(staff: ScheduledStaff[], intervals: BusyInterval[]) {
  const points = new Set<number>([0, 1440]);
  for (const member of staff) {
    if (member.start_time) points.add(toMinutes(member.start_time));
    if (member.end_time) points.add(toMinutes(member.end_time));
    for (const item of member.breaks) {
      points.add(toMinutes(item.start_time));
      points.add(toMinutes(item.end_time));
    }
  }
  for (const item of intervals) {
    if (!item.technician_id) continue;
    points.add(toMinutes(item.start_time));
    points.add(toMinutes(item.end_time));
  }

  const ordered = [...points].filter((value) => Number.isFinite(value) && value >= 0 && value <= 1440).sort((a, b) => a - b);
  const unavailable: { start_time: string; end_time: string }[] = [];
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const start = ordered[index];
    const end = ordered[index + 1];
    if (start >= end) continue;
    const startTime = fromMinutes(start);
    const endTime = fromMinutes(end);
    const hasAvailableStaff = staff.some(
      (member) => staffCoversWindow(member, startTime, endTime) && !technicianIsBusy(intervals, member.id, startTime, endTime),
    );
    if (hasAvailableStaff) continue;
    const previous = unavailable[unavailable.length - 1];
    if (previous && previous.end_time === startTime) previous.end_time = endTime;
    else unavailable.push({ start_time: startTime, end_time: endTime });
  }
  return unavailable;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const url = new URL(request.url);
  const slug = asText(url.searchParams.get("shop"));
  const date = asText(url.searchParams.get("date"));
  const serviceId = asText(url.searchParams.get("service_id"));
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return jsonResponse(400, { success: false, error: "invalid_shop_slug" });

  const shop = await getPublicShop(env.DB, slug);
  if (!shop) return jsonResponse(404, { success: false, error: "shop_not_found" });
  if (!(await validateDateWindow(date, shop.timezone))) {
    return jsonResponse(400, { success: false, error: "invalid_appointment_date" });
  }

  const capacity = await readBookingCapacity(env.DB, shop.id);
  const activeIntervals = await readBusyIntervals(env.DB, shop.id, date);
  const capacityBusy = saturatedRepairShopIntervals(activeIntervals, capacity);
  const team = await readTeamSchedule(env.DB, String(shop.id), String(shop.owner_specialist_id), date);
  const calendar = team.configured
    ? await readGoogleBusyIntervalsForDate(env.DB, env, {
        shopId: String(shop.id),
        ownerId: String(shop.owner_specialist_id),
        staffIds: team.staff.map((member) => member.id),
        date,
        timezone: String(shop.timezone),
      })
    : { intervals: [] as BusyInterval[], source: "local_only", connected: false, error_class: null };
  const staffBusyIntervals = [...activeIntervals, ...(calendar.intervals as BusyInterval[])];
  const response: Record<string, unknown> = {
    success: true,
    shop: { slug: shop.slug, timezone: shop.timezone },
    date,
    capacity,
    busy: team.configured ? [...capacityBusy, ...teamUnavailableIntervals(team.staff, staffBusyIntervals)] : capacityBusy,
    staff_scheduling: team.configured ? "staff_schedule" : "legacy_shop_capacity",
    calendar_conflicts_source: calendar.source,
    calendar_error_class: calendar.error_class,
    available_starts: null,
  };

  if (serviceId && team.configured) {
    const service = await getPublicService(env.DB, shop, serviceId);
    if (!service) return jsonResponse(404, { success: false, error: "service_not_found" });
    const durationMinutes = Number(service.duration_minutes);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 720) {
      return jsonResponse(409, { success: false, error: "invalid_service_duration" });
    }

    await ensureRepairShopAvailabilitySchema(env.DB);
    const availability = await env.DB
      .prepare("SELECT is_open,start_time,end_time FROM repair_shop_availability WHERE shop_id = ? AND day_of_week = ? LIMIT 1")
      .bind(shop.id, dayOfWeek(date))
      .first();
    const starts: string[] = [];
    if (availability && Number(availability.is_open) === 1 && availability.start_time && availability.end_time) {
      const openStart = toMinutes(String(availability.start_time));
      const openEnd = toMinutes(String(availability.end_time));
      for (let start = openStart; start + durationMinutes <= openEnd; start += 30) {
        const startTime = fromMinutes(start);
        const endTime = fromMinutes(start + durationMinutes);
        if (capacityIsBusy(activeIntervals, capacity, startTime, endTime)) continue;
        const hasStaff = team.staff.some(
          (member) => staffCoversWindow(member, startTime, endTime) && !technicianIsBusy(staffBusyIntervals, member.id, startTime, endTime),
        );
        if (hasStaff) starts.push(startTime);
      }
    }
    response.available_starts = starts;
  }

  return jsonResponse(200, response);
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
  const vehicleYearText = asText(body.vehicle_year);
  const vehicleMake = asText(body.vehicle_make);
  const vehicleModel = asText(body.vehicle_model);
  const mileageText = asText(body.mileage);
  const vin = asText(body.vin).toUpperCase();
  const hasVehicleInput = Boolean(vehicleYearText || vehicleMake || vehicleModel || mileageText || vin);
  const vehicleYear = vehicleYearText ? Number(vehicleYearText) : null;
  const mileage = mileageText ? Number(mileageText) : null;

  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return jsonResponse(400, { success: false, error: "invalid_shop_slug" });
  if (!serviceId || serviceId.length > 160) return jsonResponse(400, { success: false, error: "invalid_service_id" });
  if (!TIME_RE.test(startTime)) return jsonResponse(400, { success: false, error: "invalid_start_time" });
  if (clientName.length < 2 || clientName.length > 120) return jsonResponse(400, { success: false, error: "invalid_client_name" });
  if (!EMAIL_RE.test(clientEmail) || clientEmail.length > 200) return jsonResponse(400, { success: false, error: "invalid_client_email" });
  if (clientPhone.length < 7 || clientPhone.length > 40) return jsonResponse(400, { success: false, error: "invalid_client_phone" });
  if (hasVehicleInput) {
    if (!Number.isInteger(vehicleYear) || Number(vehicleYear) < 1900 || Number(vehicleYear) > 2100) return jsonResponse(400, { success: false, error: "invalid_vehicle_year" });
    if (vehicleMake.length < 1 || vehicleMake.length > 80) return jsonResponse(400, { success: false, error: "invalid_vehicle_make" });
    if (vehicleModel.length < 1 || vehicleModel.length > 80) return jsonResponse(400, { success: false, error: "invalid_vehicle_model" });
    if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0 || mileage > 2000000)) return jsonResponse(400, { success: false, error: "invalid_mileage" });
    if (vin && !VIN_RE.test(vin)) return jsonResponse(400, { success: false, error: "invalid_vin" });
  }

  const shop = await getPublicShop(env.DB, slug);
  if (!shop) return jsonResponse(404, { success: false, error: "shop_not_found" });
  if (!(await validateDateWindow(appointmentDate, shop.timezone))) {
    return jsonResponse(400, { success: false, error: "invalid_appointment_date" });
  }

  const service = await getPublicService(env.DB, shop, serviceId);
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

  await ensureRepairShopBookingsSchema(env.DB);
  await ensureRepairShopBookingHistorySchema(env.DB);
  await ensureRepairShopCapabilitiesSchema(env.DB);
  if (hasVehicleInput) await ensureRepairShopBookingVehicleSchema(env.DB);
  const capacity = await readBookingCapacity(env.DB, shop.id);
  const team = await readTeamSchedule(env.DB, String(shop.id), String(shop.owner_specialist_id), appointmentDate);
  const calendar = team.configured
    ? await readGoogleBusyIntervalsForDate(env.DB, env, {
        shopId: String(shop.id),
        ownerId: String(shop.owner_specialist_id),
        staffIds: team.staff.map((member) => member.id),
        date: appointmentDate,
        timezone: String(shop.timezone),
      })
    : { intervals: [] as BusyInterval[], source: "local_only", connected: false, error_class: null };
  const googleBusyIntervals = calendar.intervals as BusyInterval[];
  const candidates = team.configured
    ? team.staff.filter(
        (member) => staffCoversWindow(member, startTime, endTime) && !technicianIsBusy(googleBusyIntervals, member.id, startTime, endTime),
      )
    : [null];
  if (team.configured && candidates.length === 0) {
    return jsonResponse(409, { success: false, error: "slot_unavailable" });
  }

  const id = `repair-booking-${crypto.randomUUID()}`;
  const historyId = `repair-booking-history-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let assignedStaff: ScheduledStaff | null = null;
  let inserted = 0;

  for (const candidate of candidates) {
    const technicianId = candidate?.id ?? null;
    const technicianName = candidate?.name ?? null;
    const statements = [
      env.DB
        .prepare(
          `INSERT INTO repair_shop_bookings
            (id,shop_id,owner_specialist_id,service_id,service_name,duration_minutes,appointment_date,start_time,end_time,status,client_name,client_email,client_phone,technician_id,technician_name,created_at,updated_at)
           SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
           WHERE (
             SELECT COUNT(*) FROM repair_shop_bookings
             WHERE shop_id = ?
               AND appointment_date = ?
               AND lower(status) NOT IN ('cancelled','canceled','no_show')
               AND start_time < ?
               AND end_time > ?
           ) < ?
           AND (
             ? IS NULL OR NOT EXISTS (
               SELECT 1 FROM repair_shop_bookings
               WHERE shop_id = ?
                 AND technician_id = ?
                 AND appointment_date = ?
                 AND lower(status) NOT IN ('cancelled','canceled','no_show')
                 AND start_time < ?
                 AND end_time > ?
             )
           )`,
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
          technicianId,
          technicianName,
          now,
          now,
          shop.id,
          appointmentDate,
          endTime,
          startTime,
          capacity,
          technicianId,
          shop.id,
          technicianId,
          appointmentDate,
          endTime,
          startTime,
        ),
      env.DB
        .prepare(
          `INSERT INTO repair_shop_booking_history
            (id,booking_id,owner_specialist_id,from_status,to_status,changed_at)
           SELECT ?,id,owner_specialist_id,NULL,'confirmed',?
           FROM repair_shop_bookings
           WHERE id = ? AND owner_specialist_id = ?`,
        )
        .bind(historyId, now, id, shop.owner_specialist_id),
    ];
    if (hasVehicleInput) {
      statements.push(
        env.DB
          .prepare(
            `INSERT INTO repair_shop_booking_vehicles
              (booking_id,owner_specialist_id,vehicle_year,vehicle_make,vehicle_model,mileage,vin,created_at,updated_at)
             SELECT id,owner_specialist_id,?,?,?,?,?,?,?
             FROM repair_shop_bookings
             WHERE id = ? AND owner_specialist_id = ?`,
          )
          .bind(vehicleYear, vehicleMake, vehicleModel, mileage, vin || null, now, now, id, shop.owner_specialist_id),
      );
    }

    const results = await env.DB.batch(statements);
    inserted = Number(results?.[0]?.meta?.changes ?? 0);
    if (inserted === 1) {
      assignedStaff = candidate;
      break;
    }
  }

  if (inserted !== 1) return jsonResponse(409, { success: false, error: "slot_unavailable" });

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
      technician: assignedStaff ? { id: assignedStaff.id, name: assignedStaff.name } : null,
      vehicle: hasVehicleInput
        ? { year: vehicleYear, make: vehicleMake, model: vehicleModel, mileage, vin: vin || null }
        : null,
      timezone: shop.timezone,
      calendar_conflicts_source: calendar.source,
    },
  });
}