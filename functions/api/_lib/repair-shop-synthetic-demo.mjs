import { ensureRegistrationOpsSchema, syncSyntheticFlagForAccount } from "./registration-ops.mjs";
import { ensureOfficeRepairDemoData } from "./repair-shop-office-demo.mjs";
import { ensureRepairShopStaffScheduleSchema } from "./repair-shop-staff-schedule-schema.mjs";

const cleanEmail = (value) => String(value || "").trim().toLowerCase();

function demoAccountKind(specialist) {
  const local = cleanEmail(specialist?.email).split("@")[0] || "";
  const name = String(specialist?.name || "").trim();
  if (/(^|[._+-])office($|[._+-])/i.test(local) || /^office\b/i.test(name)) return "office";
  if (/(^|[._+-])volkogon($|[._+-])/i.test(local) || /^volkogon\b/i.test(name)) return "volkogon";
  return null;
}

async function isSyntheticAccount(db, env, specialist) {
  if (!specialist?.id || specialist.role !== "Shop Owner") return false;
  await ensureRegistrationOpsSchema(db);
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

async function fillSyntheticStaffSchedules(db, specialist) {
  const shop = await db
    .prepare("SELECT id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
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
    [1, 1, "07:30", "18:30", [{ start_time: "07:30", end_time: "08:00" }]],
    [2, 1, "07:30", "18:30", [{ start_time: "07:30", end_time: "08:00" }]],
    [3, 1, "07:30", "18:30", [{ start_time: "07:30", end_time: "08:00" }]],
    [4, 1, "07:30", "18:30", [{ start_time: "07:30", end_time: "08:00" }]],
    [5, 1, "07:30", "18:30", [{ start_time: "07:30", end_time: "08:00" }]],
    [6, 1, "08:30", "15:30", [{ start_time: "08:30", end_time: "09:00" }]],
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
  const seeded = await ensureOfficeRepairDemoData({ db, env, specialist: seedSpecialist });
  if (!seeded?.eligible || !seeded?.seeded) return { ...seeded, demo_account: kind };

  await fillSyntheticShopProfile(db, specialist, kind);
  const scheduleCount = await fillSyntheticStaffSchedules(db, specialist);
  return {
    ...seeded,
    demo_account: kind,
    schedule_rows: scheduleCount,
    synthetic: true,
  };
}
