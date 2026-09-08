import { ensureRegistrationOpsSchema, syncSyntheticFlagForAccount } from "./registration-ops.mjs";
import { ensureOfficeRepairDemoData } from "./repair-shop-office-demo.mjs";
import { resolveDefaultRepairShopServiceContext } from "./repair-shop-service-context.mjs";
import { ensureRepairShopStaffScheduleSchema } from "./repair-shop-staff-schedule-schema.mjs";

const BENCHMARK_SERVICES = [
  ["Tire Rotation", 30],
  ["Flat Tire Repair", 45],
  ["TPMS Inspection & Sensor Service", 45],
  ["Brake Fluid Exchange", 60],
  ["Complete Vehicle Inspection", 75],
  ["Coolant & Radiator Fluid Exchange", 90],
  ["Engine Tune-Up & Spark Plug Service", 120],
  ["Fuel System Cleaning", 75],
  ["Wiper Blade Replacement", 20],
  ["Exterior & Interior Light Service", 30],
  ["ABS Diagnostic & Service", 90],
  ["High-Mileage Oil Change", 40],
];

const cleanEmail = (value) => String(value || "").trim().toLowerCase();
const safeIdPart = (value) => String(value || "").replace(/[^a-z0-9]/gi, "").slice(0, 24) || "synthetic";
const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 54);

function demoAccountKind(specialist) {
  const local = cleanEmail(specialist?.email).split("@")[0] || "";
  const name = String(specialist?.name || "").trim();
  const officeIdentity =
    /(^|[._+-])office($|[._+-])/i.test(local) ||
    /(^|[._+-])officea($|[._+-])/i.test(local) ||
    /^office\b/i.test(name) ||
    /^officea\b/i.test(name);
  if (officeIdentity) return "office";
  if (/(^|[._+-])volkogon($|[._+-])/i.test(local) || /^volkogon\b/i.test(name)) return "volkogon";
  return null;
}

async function isSyntheticAccount(db, env, specialist) {
  if (!specialist?.id || specialist.role !== "Shop Owner") return false;
  await ensureRegistrationOpsSchema(db);
  const existing = await db
    .prepare("SELECT synthetic FROM hermes_registration_flags WHERE specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  if (Number(existing?.synthetic) === 1) return true;

  await syncSyntheticFlagForAccount({
    db,
    env,
    specialistId: specialist.id,
    email: specialist.email,
    createdAt: new Date().toISOString(),
  });
  const flag = await db
    .prepare("SELECT synthetic FROM hermes_registration_flags WHERE specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  return Number(flag?.synthetic) === 1;
}

async function readSyntheticShop(db, specialist) {
  return db
    .prepare("SELECT id,owner_specialist_id,name,slug,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
}

async function fillSyntheticShopProfile(db, specialist, kind) {
  const profile = kind === "volkogon"
    ? {
        name: "Volkogon Complete Auto & Fleet Test Center",
        phone: "+1 202-555-0199",
        address: "2000 Test Fleet Ave",
        city: "Dallas",
        state: "TX",
        postal: "75201",
        timezone: "America/Chicago",
      }
    : {
        name: "Office Complete Auto & Fleet Test Center",
        phone: "+1 202-555-0100",
        address: "1000 Test Service Dr",
        city: "Little Rock",
        state: "AR",
        postal: "72201",
        timezone: "America/Chicago",
      };

  await db.prepare(`
    UPDATE repair_shops
    SET
      name = CASE WHEN name IS NULL OR trim(name) = '' OR name = 'Hermes Connect Office Demo Service Center' THEN ? ELSE name END,
      phone = CASE WHEN phone IS NULL OR trim(phone) = '' THEN ? ELSE phone END,
      address_line1 = CASE WHEN address_line1 IS NULL OR trim(address_line1) = '' THEN ? ELSE address_line1 END,
      city = CASE WHEN city IS NULL OR trim(city) = '' THEN ? ELSE city END,
      state = CASE WHEN state IS NULL OR trim(state) = '' THEN ? ELSE state END,
      postal_code = CASE WHEN postal_code IS NULL OR trim(postal_code) = '' THEN ? ELSE postal_code END,
      timezone = CASE WHEN timezone IS NULL OR trim(timezone) = '' OR timezone = 'UTC' THEN ? ELSE timezone END,
      updated_at = ?
    WHERE owner_specialist_id = ?
  `).bind(
    profile.name,
    profile.phone,
    profile.address,
    profile.city,
    profile.state,
    profile.postal,
    profile.timezone,
    new Date().toISOString(),
    specialist.id,
  ).run();
}

async function fillBenchmarkServices(db, specialist) {
  const shop = await readSyntheticShop(db, specialist);
  if (!shop?.id) return 0;
  const resolved = await resolveDefaultRepairShopServiceContext(db, specialist.id, shop);
  const now = new Date().toISOString();
  const ownerPart = safeIdPart(specialist.id);

  for (const [name, duration] of BENCHMARK_SERVICES) {
    let service = await db
      .prepare("SELECT id FROM services WHERE owner_specialist_id = ? AND lower(name) = lower(?) LIMIT 1")
      .bind(specialist.id, name)
      .first();
    if (!service?.id) {
      const id = `demo-benchmark-${ownerPart}-${slug(name)}`;
      await db
        .prepare("INSERT OR IGNORE INTO services (id,name,duration_minutes,owner_specialist_id) VALUES (?,?,?,?)")
        .bind(id, name, duration, specialist.id)
        .run();
      service = { id };
    }
    await db
      .prepare("INSERT OR IGNORE INTO hermes_service_contexts (service_id,context_id,created_at) VALUES (?,?,?)")
      .bind(service.id, resolved.context.id, now)
      .run();
  }

  let count = 0;
  for (const [name] of BENCHMARK_SERVICES) {
    const row = await db
      .prepare("SELECT COUNT(*) AS total FROM services WHERE owner_specialist_id = ? AND lower(name) = lower(?)")
      .bind(specialist.id, name)
      .first();
    count += Number(row?.total || 0) > 0 ? 1 : 0;
  }
  return count;
}

async function fillSyntheticStaffSchedules(db, specialist) {
  const shop = await readSyntheticShop(db, specialist);
  if (!shop?.id) return 0;

  await ensureRepairShopStaffScheduleSchema(db);
  const staffResult = await db
    .prepare("SELECT id FROM repair_shop_staff WHERE owner_specialist_id = ? AND shop_id = ? AND active = 1 ORDER BY name COLLATE NOCASE ASC")
    .bind(specialist.id, shop.id)
    .all();
  const staff = staffResult?.results ?? [];
  const now = new Date().toISOString();

  const days = [
    [0, 0, null, null, []],
    [1, 1, "07:30", "18:30", [{ start_time: "12:00", end_time: "12:30" }]],
    [2, 1, "07:30", "18:30", [{ start_time: "12:00", end_time: "12:30" }]],
    [3, 1, "07:30", "18:30", [{ start_time: "12:00", end_time: "12:30" }]],
    [4, 1, "07:30", "18:30", [{ start_time: "12:00", end_time: "12:30" }]],
    [5, 1, "07:30", "18:30", [{ start_time: "12:00", end_time: "12:30" }]],
    [6, 1, "08:30", "15:30", [{ start_time: "11:30", end_time: "12:00" }]],
  ];

  const statements = [];
  for (const member of staff) {
    for (const [day, working, start, end, breaks] of days) {
      statements.push(
        db.prepare(`
          INSERT OR IGNORE INTO repair_shop_staff_schedule
            (staff_id,shop_id,owner_specialist_id,day_of_week,is_working,start_time,end_time,breaks,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?)
        `).bind(member.id, shop.id, specialist.id, day, working, start, end, JSON.stringify(breaks), now),
      );
    }
  }
  for (let index = 0; index < statements.length; index += 40) {
    const chunk = statements.slice(index, index + 40);
    if (typeof db.batch === "function") await db.batch(chunk);
    else for (const statement of chunk) await statement.run();
  }

  const count = await db
    .prepare("SELECT COUNT(*) AS total FROM repair_shop_staff_schedule WHERE owner_specialist_id = ? AND shop_id = ?")
    .bind(specialist.id, shop.id)
    .first();
  return Number(count?.total || 0);
}

export async function ensureRepairShopSyntheticDemoData({ db, env, specialist }) {
  if (!db || !specialist) return { eligible: false, seeded: false };
  const kind = demoAccountKind(specialist);
  if (!kind) return { eligible: false, seeded: false };
  if (!(await isSyntheticAccount(db, env, specialist))) return { eligible: false, seeded: false };

  const seedSpecialist = kind === "volkogon"
    ? { ...specialist, name: `Office ${String(specialist.name || "Volkogon").trim()}` }
    : specialist;
  const seedEnv = {
    ...env,
    HERMES_SYNTHETIC_ACCOUNT_EMAILS: [String(env?.HERMES_SYNTHETIC_ACCOUNT_EMAILS || ""), cleanEmail(specialist.email)]
      .filter(Boolean)
      .join(","),
  };
  const seeded = await ensureOfficeRepairDemoData({ db, env: seedEnv, specialist: seedSpecialist });
  if (!seeded?.eligible || !seeded?.seeded) return { ...seeded, demo_account: kind };

  await fillSyntheticShopProfile(db, specialist, kind);
  const benchmarkServiceCount = await fillBenchmarkServices(db, specialist);
  const scheduleCount = await fillSyntheticStaffSchedules(db, specialist);
  return {
    ...seeded,
    demo_account: kind,
    benchmark_service_count: benchmarkServiceCount,
    schedule_rows: scheduleCount,
    synthetic: true,
  };
}
