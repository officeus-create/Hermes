import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopAvailabilitySchema, ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";

type Env = { DB?: any };
type DayInput = { weekday?: unknown; enabled?: unknown; start?: unknown; end?: unknown; step_minutes?: unknown };
type Body = { days?: unknown };

const parseTime = (value: unknown) => {
  const text = String(value ?? "").trim();
  const match = /^(\d{2}):(\d{2})$/.exec(text);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
};
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

async function requireShop(db: any, ownerId: string) {
  await ensureRepairShopProfileSchema(db);
  return db.prepare("SELECT id,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1").bind(ownerId).first();
}

async function readSchedule(db: any, ownerId: string) {
  await ensureRepairShopAvailabilitySchema(db);
  const result = await db
    .prepare("SELECT weekday,start_minutes,end_minutes,step_minutes FROM repair_shop_availability WHERE owner_specialist_id = ? ORDER BY weekday ASC")
    .bind(ownerId)
    .all();
  const byDay = new Map((result?.results ?? []).map((row: any) => [Number(row.weekday), row]));
  return Array.from({ length: 7 }, (_, weekday) => {
    const row: any = byDay.get(weekday);
    return row
      ? { weekday, enabled: true, start: formatTime(Number(row.start_minutes)), end: formatTime(Number(row.end_minutes)), step_minutes: Number(row.step_minutes) }
      : { weekday, enabled: false, start: "09:00", end: "17:00", step_minutes: 30 };
  });
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const shop = await requireShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });
  const days = await readSchedule(env.DB, specialist.id);
  return jsonResponse(200, { success: true, timezone: shop.timezone, days });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const shop = await requireShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  let body: Body;
  try { body = (await request.json()) as Body; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  if (!Array.isArray(body.days) || body.days.length !== 7) return jsonResponse(400, { success: false, error: "seven_days_required" });

  const seen = new Set<number>();
  const inserts: { weekday: number; start: number; end: number; step: number }[] = [];
  for (const raw of body.days as DayInput[]) {
    const weekday = Number(raw.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || seen.has(weekday)) return jsonResponse(400, { success: false, error: "invalid_weekday" });
    seen.add(weekday);
    if (raw.enabled !== true) continue;
    const start = parseTime(raw.start);
    const end = parseTime(raw.end);
    const step = Number(raw.step_minutes);
    if (start === null || end === null || end <= start || end - start < 15) return jsonResponse(400, { success: false, error: "invalid_time_range", weekday });
    if (![15, 30, 60].includes(step)) return jsonResponse(400, { success: false, error: "invalid_step_minutes", weekday });
    inserts.push({ weekday, start, end, step });
  }
  if (seen.size !== 7) return jsonResponse(400, { success: false, error: "seven_unique_days_required" });

  await ensureRepairShopAvailabilitySchema(env.DB);
  const now = new Date().toISOString();
  const statements = [
    env.DB.prepare("DELETE FROM repair_shop_availability WHERE owner_specialist_id = ?").bind(specialist.id),
    ...inserts.map((day) => env.DB
      .prepare("INSERT INTO repair_shop_availability (id,owner_specialist_id,weekday,start_minutes,end_minutes,step_minutes,updated_at) VALUES (?,?,?,?,?,?,?)")
      .bind(`availability-${crypto.randomUUID()}`, specialist.id, day.weekday, day.start, day.end, day.step, now)),
  ];
  await env.DB.batch(statements);
  const days = await readSchedule(env.DB, specialist.id);
  return jsonResponse(200, { success: true, timezone: shop.timezone, days });
}
