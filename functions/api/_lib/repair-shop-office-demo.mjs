import { ensureRegistrationOpsSchema, syncSyntheticFlagForAccount } from "./registration-ops.mjs";
import { ensureRepairShopAvailabilitySchema } from "./repair-shop-availability-schema.mjs";
import { ensureRepairShopBookingHistorySchema } from "./repair-shop-booking-history-schema.mjs";
import { ensureRepairShopBookingVehicleSchema } from "./repair-shop-booking-vehicle-schema.mjs";
import { ensureRepairShopBookingsSchema } from "./repair-shop-bookings-schema.mjs";
import { ensureRepairShopCapabilitiesSchema } from "./repair-shop-capabilities-schema.mjs";
import { resolveDefaultRepairShopServiceContext } from "./repair-shop-service-context.mjs";
import { ensureRepairShopProfileSchema } from "./repair-shop-schema.mjs";
import { ensureRepairShopStaffSchema } from "./repair-shop-staff-schema.mjs";
import { listServicesForContext } from "./service-context.mjs";

const SEED_VERSION = "office-repair-demo-2026-09-05-v1";
const START_DATE = "2026-09-05";
const END_DATE = "2026-12-31";

const STAFF = [
  ["Daniel Foster", ["Motorcycle", "Powersports"]],
  ["Ethan Walker", ["General service", "Preventive maintenance"]],
  ["Caleb Brooks", ["Tires", "Alignment", "Suspension", "Steering"]],
  ["Marcus Johnson", ["Diagnostics", "Electrical", "HVAC"]],
  ["Ryan Mitchell", ["EV", "Hybrid", "ADAS"]],
  ["Liam Carter", ["Engines", "Cooling", "Fuel systems"]],
  ["Noah Bennett", ["Transmissions", "Drivetrain"]],
  ["Mason Reed", ["Diesel", "Emissions", "Fleet"]],
  ["Jackson Hayes", ["Heavy truck", "Air brakes", "Wheel end"]],
  ["Tyler Morgan", ["Trailers", "Flatbed", "Reefer"]],
  ["Samuel Cooper", ["RV", "Bus", "Coach"]],
  ["Luke Harrison", ["Heavy equipment", "Hydraulics", "Undercarriage"]],
  ["Benjamin Clark", ["Oversize equipment", "Specialized vehicles"]],
  ["Sophia Martinez", ["Fleet PM", "DOT inspections", "Quality control"]],
];

const SERVICES = [
  ["Motorcycle Oil & Filter Service",45,"Daniel Foster","motorcycle"],
  ["Motorcycle Tire Replacement",60,"Daniel Foster","motorcycle"],
  ["Motorcycle Chain & Sprocket Service",90,"Daniel Foster","motorcycle"],
  ["Motorcycle Brake Service",90,"Daniel Foster","motorcycle"],
  ["Motorcycle Electrical Diagnostics",60,"Daniel Foster","motorcycle"],
  ["Powersports General Inspection",60,"Daniel Foster","motorcycle"],
  ["Oil & Filter Change",30,"Ethan Walker","passenger"],
  ["Factory Scheduled Maintenance",90,"Ethan Walker","passenger"],
  ["Pre-Purchase Vehicle Inspection",90,"Sophia Martinez","passenger"],
  ["Battery Test & Replacement",30,"Marcus Johnson","passenger"],
  ["Engine Diagnostics",60,"Marcus Johnson","passenger"],
  ["Electrical Diagnostics",90,"Marcus Johnson","passenger"],
  ["Starter Replacement",120,"Marcus Johnson","passenger"],
  ["Alternator Replacement",120,"Marcus Johnson","passenger"],
  ["A/C Diagnostics",60,"Marcus Johnson","passenger"],
  ["A/C Service & Repair",120,"Marcus Johnson","passenger"],
  ["Brake Pads & Rotors",120,"Ethan Walker","passenger"],
  ["Tire Mount & Balance",90,"Caleb Brooks","passenger"],
  ["Wheel Alignment",60,"Caleb Brooks","passenger"],
  ["Suspension Inspection & Repair",180,"Caleb Brooks","passenger"],
  ["Steering System Repair",150,"Caleb Brooks","passenger"],
  ["Cooling System Repair",180,"Liam Carter","passenger"],
  ["Fuel System Diagnostics & Repair",180,"Liam Carter","passenger"],
  ["Timing Belt / Chain Service",300,"Liam Carter","passenger"],
  ["Cylinder Head Repair",480,"Liam Carter","passenger"],
  ["Engine Replacement",720,"Liam Carter","passenger"],
  ["Transmission Diagnostics",90,"Noah Bennett","passenger"],
  ["Transmission Fluid Service",120,"Noah Bennett","passenger"],
  ["Transmission Replacement",720,"Noah Bennett","passenger"],
  ["Differential & Drivetrain Service",180,"Noah Bennett","passenger"],
  ["Exhaust System Repair",120,"Ethan Walker","passenger"],
  ["Emissions Diagnostics",60,"Marcus Johnson","passenger"],
  ["ADAS Calibration",120,"Ryan Mitchell","ev"],
  ["EV High-Voltage System Diagnostics",120,"Ryan Mitchell","ev"],
  ["EV Battery Health Check",90,"Ryan Mitchell","ev"],
  ["EV Charging System Diagnostics",90,"Ryan Mitchell","ev"],
  ["Hybrid System Service",120,"Ryan Mitchell","ev"],
  ["EV / Hybrid Cooling Service",120,"Ryan Mitchell","ev"],
  ["Diesel Engine Diagnostics",90,"Mason Reed","diesel"],
  ["Diesel Preventive Maintenance",120,"Mason Reed","diesel"],
  ["Diesel Injector Service",240,"Mason Reed","diesel"],
  ["Turbocharger Diagnostics & Repair",300,"Mason Reed","diesel"],
  ["DPF Cleaning / Service",180,"Mason Reed","diesel"],
  ["DEF / SCR System Diagnostics",120,"Mason Reed","diesel"],
  ["Fleet Preventive Maintenance",120,"Sophia Martinez","diesel"],
  ["DOT Commercial Vehicle Inspection",90,"Sophia Martinez","heavy"],
  ["Heavy Truck Air Brake Service",180,"Jackson Hayes","heavy"],
  ["Brake Chamber Replacement",120,"Jackson Hayes","heavy"],
  ["Heavy Truck Wheel-End Service",240,"Jackson Hayes","heavy"],
  ["Wheel Seal Replacement",180,"Jackson Hayes","heavy"],
  ["Kingpin / Front Axle Service",360,"Jackson Hayes","heavy"],
  ["Heavy Truck Clutch Replacement",480,"Jackson Hayes","heavy"],
  ["Heavy-Duty Transmission Service",360,"Noah Bennett","heavy"],
  ["Heavy-Duty Transmission Replacement",720,"Noah Bennett","heavy"],
  ["Trailer DOT Inspection",90,"Tyler Morgan","trailer"],
  ["Trailer Brake Service",180,"Tyler Morgan","trailer"],
  ["Trailer Wheel-End Service",180,"Tyler Morgan","trailer"],
  ["Trailer Suspension Repair",240,"Tyler Morgan","trailer"],
  ["Trailer Electrical / Lighting Repair",90,"Tyler Morgan","trailer"],
  ["Reefer Trailer Mechanical Inspection",120,"Tyler Morgan","trailer"],
  ["Flatbed / Open-Deck Equipment Inspection",120,"Tyler Morgan","trailer"],
  ["RV Chassis Inspection",120,"Samuel Cooper","rv"],
  ["RV Brake & Suspension Service",240,"Samuel Cooper","rv"],
  ["Bus / Coach Preventive Maintenance",180,"Samuel Cooper","rv"],
  ["Bus / Coach Brake Service",240,"Samuel Cooper","rv"],
  ["Heavy Equipment Diagnostics",120,"Luke Harrison","equipment"],
  ["Hydraulic System Diagnostics & Repair",240,"Luke Harrison","equipment"],
  ["Track / Undercarriage Inspection & Repair",360,"Luke Harrison","equipment"],
  ["Construction Equipment Preventive Maintenance",180,"Luke Harrison","equipment"],
  ["Mobile Field Equipment Inspection",120,"Luke Harrison","equipment"],
  ["Oversize / Specialized Equipment Inspection",120,"Benjamin Clark","oversize"],
  ["Oversize / Specialized Equipment Repair",300,"Benjamin Clark","oversize"],
  ["Specialized Transport Equipment Safety Check",120,"Benjamin Clark","oversize"],
];

const FIRST_NAMES = ["James","Michael","Robert","John","David","William","Richard","Joseph","Thomas","Christopher","Charles","Matthew"];
const LAST_NAMES = ["Anderson","Thompson","Williams","Miller","Davis","Wilson","Moore","Taylor"];
const CATEGORY_ORDER = ["motorcycle","passenger","ev","diesel","heavy","trailer","rv","equipment","oversize"];

const VEHICLES = {
  motorcycle: [[2023,"Harley-Davidson","Street Glide"],[2022,"Honda","Gold Wing"],[2024,"Indian","Chieftain"]],
  passenger: [[2022,"Ford","F-150"],[2021,"Toyota","Camry"],[2023,"Chevrolet","Silverado 1500"],[2020,"Jeep","Grand Cherokee"]],
  ev: [[2023,"Tesla","Model Y"],[2022,"Ford","F-150 Lightning"],[2024,"Hyundai","Ioniq 5"]],
  diesel: [[2021,"Ford","F-350 Super Duty"],[2022,"Ram","3500"],[2020,"Chevrolet","Silverado 3500HD"]],
  heavy: [[2022,"Freightliner","Cascadia"],[2021,"Kenworth","T680"],[2020,"Peterbilt","579"]],
  trailer: [[2022,"Great Dane","Dry Van"],[2021,"Utility","3000R Reefer"],[2023,"Fontaine","Revolution Flatbed"]],
  rv: [[2022,"Freightliner","XC Motorhome Chassis"],[2021,"Ford","F-53 Motorhome Chassis"],[2020,"Prevost","H3-45 Coach"]],
  equipment: [[2021,"Caterpillar","320 Excavator"],[2022,"John Deere","544 P-Tier Loader"],[2020,"Bobcat","T76 Compact Track Loader"]],
  oversize: [[2021,"Kenworth","T880 Heavy Haul"],[2022,"Peterbilt","389 Heavy Haul"],[2020,"Talbert","Lowboy Trailer"]],
};

const cleanEmail = (value) => String(value || "").trim().toLowerCase();
const safeIdPart = (value) => String(value || "").replace(/[^a-z0-9]/gi, "").slice(0, 24) || "office";
const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 54);
const isoDate = (date) => date.toISOString().slice(0, 10);
const pad2 = (value) => String(value).padStart(2, "0");

async function runStatements(db, statements, size = 40) {
  for (let index = 0; index < statements.length; index += size) {
    const chunk = statements.slice(index, index + size);
    if (typeof db.batch === "function") await db.batch(chunk);
    else for (const statement of chunk) await statement.run();
  }
}

async function officeSyntheticAccount(db, env, specialist) {
  if (!specialist?.id || specialist.role !== "Shop Owner") return false;
  await ensureRegistrationOpsSchema(db);
  await syncSyntheticFlagForAccount({
    db,
    env,
    specialistId: specialist.id,
    email: specialist.email,
    createdAt: new Date().toISOString(),
  });
  const flag = await db.prepare("SELECT synthetic FROM hermes_registration_flags WHERE specialist_id = ? LIMIT 1")
    .bind(specialist.id).first();
  if (Number(flag?.synthetic) !== 1) return false;
  const email = cleanEmail(specialist.email);
  const local = email.split("@")[0] || "";
  const name = String(specialist.name || "").trim();
  return /(^|[._+-])office($|[._+-])/i.test(local) || /^office\b/i.test(name);
}

async function ensureSeedStateSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_demo_seed_state (
      owner_specialist_id TEXT PRIMARY KEY,
      seed_version TEXT NOT NULL,
      seeded_through TEXT NOT NULL,
      appointment_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `).run();
}

async function ensureDemoShop(db, specialist) {
  await ensureRepairShopProfileSchema(db);
  let shop = await db.prepare(
    "SELECT id,owner_specialist_id,name,slug,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  if (shop) return shop;

  const ownerPart = safeIdPart(specialist.id);
  const id = `demo-shop-${ownerPart}`;
  const baseSlug = `hermes-connect-office-demo-${ownerPart.slice(-8)}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT OR IGNORE INTO repair_shops
      (id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone,created_at,updated_at)
    VALUES (?,?,?, ?,NULL,NULL,'Little Rock','AR',NULL,'America/Chicago',?,?)
  `).bind(id, specialist.id, "Hermes Connect Office Demo Service Center", baseSlug, now, now).run();
  shop = await db.prepare(
    "SELECT id,owner_specialist_id,name,slug,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  return shop;
}

async function ensureDemoStaff(db, specialist, shop) {
  await ensureRepairShopStaffSchema(db);
  const now = new Date().toISOString();
  const ownerPart = safeIdPart(specialist.id);
  const statements = STAFF.map(([name, specialties]) => db.prepare(`
    INSERT INTO repair_shop_staff
      (id,shop_id,owner_specialist_id,name,role,specialties,active,created_at,updated_at)
    VALUES (?,?,?,?, 'Technician', ?,1,?,?)
    ON CONFLICT(shop_id,name) DO UPDATE SET specialties=excluded.specialties,active=1,updated_at=excluded.updated_at
  `).bind(`demo-tech-${ownerPart}-${slug(name)}`, shop.id, specialist.id, name, JSON.stringify(specialties), now, now));
  await runStatements(db, statements);
  const result = await db.prepare(
    "SELECT id,name FROM repair_shop_staff WHERE owner_specialist_id = ? AND shop_id = ? AND active = 1",
  ).bind(specialist.id, shop.id).all();
  return new Map((result?.results ?? []).map((row) => [String(row.name), String(row.id)]));
}

async function ensureDemoServices(db, specialist, shop) {
  const resolved = await resolveDefaultRepairShopServiceContext(db, specialist.id, shop);
  let services = await listServicesForContext(db, {
    ownerId: specialist.id,
    contextId: resolved.context.id,
    includeLegacyUnmapped: true,
  });
  const byName = new Map(services.map((row) => [String(row.name).toLowerCase(), row]));
  const ownerPart = safeIdPart(specialist.id);
  const now = new Date().toISOString();
  const statements = [];
  for (const [name, duration] of SERVICES) {
    if (byName.has(String(name).toLowerCase())) continue;
    const serviceId = `demo-service-${ownerPart}-${slug(name)}`;
    statements.push(
      db.prepare("INSERT OR IGNORE INTO services (id,name,duration_minutes,owner_specialist_id) VALUES (?,?,?,?)")
        .bind(serviceId, name, duration, specialist.id),
      db.prepare("INSERT OR IGNORE INTO hermes_service_contexts (service_id,context_id,created_at) VALUES (?,?,?)")
        .bind(serviceId, resolved.context.id, now),
    );
  }
  await runStatements(db, statements);
  services = await listServicesForContext(db, {
    ownerId: specialist.id,
    contextId: resolved.context.id,
    includeLegacyUnmapped: true,
  });
  return new Map(services.map((row) => [String(row.name).toLowerCase(), row]));
}

async function ensureDemoAvailability(db, shop) {
  await ensureRepairShopAvailabilitySchema(db);
  const now = new Date().toISOString();
  const schedule = [
    [0,0,null,null],
    [1,1,"08:00","18:00"],
    [2,1,"08:00","18:00"],
    [3,1,"08:00","18:00"],
    [4,1,"08:00","18:00"],
    [5,1,"08:00","18:00"],
    [6,1,"09:00","15:00"],
  ];
  await runStatements(db, schedule.map(([day, open, start, end]) => db.prepare(`
    INSERT OR IGNORE INTO repair_shop_availability (shop_id,day_of_week,is_open,start_time,end_time,updated_at)
    VALUES (?,?,?,?,?,?)
  `).bind(shop.id, day, open, start, end, now)));

  await ensureRepairShopCapabilitiesSchema(db);
  await db.prepare(`
    INSERT OR IGNORE INTO repair_shop_capabilities
      (shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at)
    VALUES (?, ?,1,1,0,10,?)
  `).bind(shop.id, JSON.stringify(["passenger_light","commercial_truck","trailer","reefer","flatbed_open_deck","other"]), now).run();
}

function customerFor(category, slotIndex) {
  const categoryIndex = Math.max(0, CATEGORY_ORDER.indexOf(category));
  const within = slotIndex % 12;
  const number = categoryIndex * 12 + within + 1;
  return {
    number,
    name: `${FIRST_NAMES[(number - 1) % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor((number - 1) / FIRST_NAMES.length) % LAST_NAMES.length]}`,
    email: `office.demo.${String(number).padStart(3, "0")}@example.com`,
    phone: `+1 202-555-${String(100 + ((number - 1) % 100)).padStart(4, "0")}`,
  };
}

function endTime(hour, duration) {
  const start = new Date(Date.UTC(2026, 0, 1, hour, 0, 0));
  const end = new Date(start.getTime() + Number(duration) * 60000);
  if (end.getUTCDate() !== start.getUTCDate()) return null;
  return `${pad2(end.getUTCHours())}:${pad2(end.getUTCMinutes())}`;
}

function chooseService(slotAtMs, cursor, busyUntil) {
  for (let offset = 0; offset < SERVICES.length; offset += 1) {
    const service = SERVICES[(cursor + offset) % SERVICES.length];
    const tech = service[2];
    const until = Number(busyUntil.get(tech) || 0);
    const hour = new Date(slotAtMs).getUTCHours();
    const end = endTime(hour, service[1]);
    if (until <= slotAtMs && end) return { service, nextCursor: cursor + offset + 1, end };
  }
  const service = SERVICES.find((item) => item[1] <= 60) || SERVICES[0];
  return { service, nextCursor: cursor + 1, end: endTime(new Date(slotAtMs).getUTCHours(), service[1]) || "18:00" };
}

async function ensureDemoBookings(db, specialist, shop, staffByName, servicesByName) {
  await ensureRepairShopBookingsSchema(db);
  await ensureRepairShopBookingVehicleSchema(db);
  await ensureRepairShopBookingHistorySchema(db);

  const ownerPart = safeIdPart(specialist.id);
  const statements = [];
  const busyUntil = new Map();
  let cursor = 0;
  let slotIndex = 0;
  const start = new Date(`${START_DATE}T12:00:00Z`);
  const end = new Date(`${END_DATE}T12:00:00Z`);

  for (let day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    const dow = day.getUTCDay();
    const hours = dow === 0 ? [] : dow === 6 ? [9,10,11,12,13,14] : [8,9,10,11,12,13,14,15,16,17];
    const date = isoDate(day);
    for (const hour of hours) {
      const slotAt = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, 0, 0);
      const picked = chooseService(slotAt, cursor, busyUntil);
      cursor = picked.nextCursor;
      const [serviceName, duration, technicianName, category] = picked.service;
      const service = servicesByName.get(String(serviceName).toLowerCase());
      const technicianId = staffByName.get(String(technicianName));
      if (!service || !technicianId) continue;
      busyUntil.set(technicianName, slotAt + Number(duration) * 60000);
      const customer = customerFor(category, slotIndex);
      const bookingId = `demo-${ownerPart}-${category}-c${String(customer.number).padStart(3,"0")}-${date.replaceAll("-","")}-${pad2(hour)}-${String(slotIndex).padStart(4,"0")}`;
      const createdAt = `${date}T12:00:00.000Z`;
      statements.push(db.prepare(`
        INSERT OR IGNORE INTO repair_shop_bookings
          (id,shop_id,owner_specialist_id,service_id,service_name,duration_minutes,appointment_date,start_time,end_time,status,
           client_name,client_email,client_phone,technician_id,technician_name,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,'confirmed',?,?,?,?,?,?,?)
      `).bind(
        bookingId, shop.id, specialist.id, service.id, serviceName, duration, date, `${pad2(hour)}:00`, picked.end,
        customer.name, customer.email, customer.phone, technicianId, technicianName, createdAt, createdAt,
      ));
      slotIndex += 1;
    }
  }
  await runStatements(db, statements, 40);

  const prefix = `demo-${ownerPart}-%`;
  await db.prepare(`
    INSERT OR IGNORE INTO repair_shop_booking_vehicles
      (booking_id,owner_specialist_id,vehicle_year,vehicle_make,vehicle_model,mileage,vin,created_at,updated_at)
    SELECT
      b.id,
      b.owner_specialist_id,
      CASE
        WHEN b.id LIKE '%-motorcycle-%' THEN 2023 WHEN b.id LIKE '%-ev-%' THEN 2023
        WHEN b.id LIKE '%-diesel-%' THEN 2021 WHEN b.id LIKE '%-heavy-%' THEN 2022
        WHEN b.id LIKE '%-trailer-%' THEN 2022 WHEN b.id LIKE '%-rv-%' THEN 2022
        WHEN b.id LIKE '%-equipment-%' THEN 2021 WHEN b.id LIKE '%-oversize-%' THEN 2021 ELSE 2022 END,
      CASE
        WHEN b.id LIKE '%-motorcycle-%' THEN 'Harley-Davidson' WHEN b.id LIKE '%-ev-%' THEN 'Tesla'
        WHEN b.id LIKE '%-diesel-%' THEN 'Ford' WHEN b.id LIKE '%-heavy-%' THEN 'Freightliner'
        WHEN b.id LIKE '%-trailer-%' THEN 'Great Dane' WHEN b.id LIKE '%-rv-%' THEN 'Freightliner'
        WHEN b.id LIKE '%-equipment-%' THEN 'Caterpillar' WHEN b.id LIKE '%-oversize-%' THEN 'Kenworth' ELSE 'Ford' END,
      CASE
        WHEN b.id LIKE '%-motorcycle-%' THEN 'Street Glide' WHEN b.id LIKE '%-ev-%' THEN 'Model Y'
        WHEN b.id LIKE '%-diesel-%' THEN 'F-350 Super Duty' WHEN b.id LIKE '%-heavy-%' THEN 'Cascadia'
        WHEN b.id LIKE '%-trailer-%' THEN 'Dry Van' WHEN b.id LIKE '%-rv-%' THEN 'XC Motorhome Chassis'
        WHEN b.id LIKE '%-equipment-%' THEN '320 Excavator' WHEN b.id LIKE '%-oversize-%' THEN 'T880 Heavy Haul' ELSE 'F-150' END,
      12000 + (CAST(substr(b.client_email,13,3) AS INTEGER) * 173) + (CAST(substr(b.appointment_date,9,2) AS INTEGER) * 125),
      'DEMO' || printf('%013d', CAST(substr(b.client_email,13,3) AS INTEGER)),
      b.created_at,
      b.updated_at
    FROM repair_shop_bookings b
    WHERE b.owner_specialist_id = ? AND b.id LIKE ?
  `).bind(specialist.id, prefix).run();

  await db.prepare(`
    INSERT OR IGNORE INTO repair_shop_booking_history (id,booking_id,owner_specialist_id,from_status,to_status,changed_at)
    SELECT 'demo-history-' || b.id,b.id,b.owner_specialist_id,NULL,'confirmed',b.created_at
    FROM repair_shop_bookings b
    WHERE b.owner_specialist_id = ? AND b.id LIKE ?
  `).bind(specialist.id, prefix).run();

  const count = await db.prepare(
    "SELECT COUNT(*) AS total FROM repair_shop_bookings WHERE owner_specialist_id = ? AND id LIKE ?",
  ).bind(specialist.id, prefix).first();
  return Number(count?.total || 0);
}

export async function ensureOfficeRepairDemoData({ db, env, specialist }) {
  if (!db || !specialist) return { eligible: false, seeded: false };
  if (!(await officeSyntheticAccount(db, env, specialist))) return { eligible: false, seeded: false };

  await ensureSeedStateSchema(db);
  const current = await db.prepare(
    "SELECT seed_version,seeded_through,appointment_count,updated_at FROM repair_shop_demo_seed_state WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  if (current?.seed_version === SEED_VERSION && current?.seeded_through === END_DATE) {
    return { eligible: true, seeded: true, seed_version: SEED_VERSION, seeded_through: END_DATE, appointment_count: Number(current.appointment_count || 0) };
  }

  const servicesTable = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='services' LIMIT 1").first();
  if (!servicesTable) return { eligible: true, seeded: false, error: "services_schema_missing" };

  const shop = await ensureDemoShop(db, specialist);
  if (!shop) return { eligible: true, seeded: false, error: "demo_shop_unavailable" };
  const staffByName = await ensureDemoStaff(db, specialist, shop);
  const servicesByName = await ensureDemoServices(db, specialist, shop);
  await ensureDemoAvailability(db, shop);
  const appointmentCount = await ensureDemoBookings(db, specialist, shop, staffByName, servicesByName);
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO repair_shop_demo_seed_state (owner_specialist_id,seed_version,seeded_through,appointment_count,updated_at)
    VALUES (?,?,?,?,?)
    ON CONFLICT(owner_specialist_id) DO UPDATE SET
      seed_version=excluded.seed_version,
      seeded_through=excluded.seeded_through,
      appointment_count=excluded.appointment_count,
      updated_at=excluded.updated_at
  `).bind(specialist.id, SEED_VERSION, END_DATE, appointmentCount, now).run();

  return {
    eligible: true,
    seeded: true,
    seed_version: SEED_VERSION,
    seeded_through: END_DATE,
    appointment_count: appointmentCount,
    staff_count: STAFF.length,
    service_count: SERVICES.length,
  };
}

export { END_DATE as OFFICE_REPAIR_DEMO_END_DATE, SEED_VERSION as OFFICE_REPAIR_DEMO_SEED_VERSION };
