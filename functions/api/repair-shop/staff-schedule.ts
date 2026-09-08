import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopStaffSchema } from "../_lib/repair-shop-staff-schema.mjs";
import {
  ensureRepairShopStaffScheduleSchema,
  serializeRepairShopStaffSchedule,
} from "../_lib/repair-shop-staff-schedule-schema.mjs";

type Env = { DB?: any };
type BreakInput = { start_time?: unknown; end_time?: unknown };
type DayInput = {
  day_of_week?: unknown;
  is_working?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  breaks?: unknown;
};
type ScheduleInput = { staff_id?: unknown; days?: DayInput[] };
type OwnerContext =
  | { response: Response; specialist?: never; shop?: never }
  | { response?: undefined; specialist: any; shop: any };
type NormalizedBreak = { start_time: string; end_time: string };
type NormalizedDay = {
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
  breaks: NormalizedBreak[];
};
type ValidationError = { error: string };

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const clean = (value: unknown, max = 96) => String(value ?? "").trim().slice(0, max);

async function requireOwnerShop(request: Request, env: Env): Promise<OwnerContext> {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (specialist.role !== "Shop Owner") return { response: jsonResponse(403, { success: false, error: "shop_owner_required" }) };
  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare("SELECT id,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  if (!shop) return { response: jsonResponse(409, { success: false, error: "shop_profile_required" }) };
  await ensureRepairShopStaffSchema(env.DB);
  await ensureRepairShopStaffScheduleSchema(env.DB);
  return { specialist, shop };
}

async function assertStaff(db: any, staffId: string, ownerId: string, shopId: string) {
  return db
    .prepare("SELECT id,name,active FROM repair_shop_staff WHERE id=? AND owner_specialist_id=? AND shop_id=? LIMIT 1")
    .bind(staffId, ownerId, shopId)
    .first();
}

async function readSchedule(db: any, ownerId: string, shopId: string, staffId?: string) {
  const where = staffId ? "AND staff_id = ?" : "";
  const statement = db.prepare(
    `SELECT staff_id,day_of_week,is_working,start_time,end_time,breaks,updated_at
     FROM repair_shop_staff_schedule
     WHERE owner_specialist_id = ? AND shop_id = ? ${where}
     ORDER BY staff_id ASC, day_of_week ASC`,
  );
  const result = staffId
    ? await statement.bind(ownerId, shopId, staffId).all()
    : await statement.bind(ownerId, shopId).all();
  return (result?.results ?? []).map(serializeRepairShopStaffSchedule);
}

function normalizeBreaks(value: unknown, shiftStart: string, shiftEnd: string): { breaks: NormalizedBreak[] } | ValidationError {
  if (value == null) return { breaks: [] };
  if (!Array.isArray(value)) return { error: "invalid_breaks" };
  const breaks: NormalizedBreak[] = [];
  for (const raw of value.slice(0, 3) as BreakInput[]) {
    const start = clean(raw?.start_time, 5);
    const end = clean(raw?.end_time, 5);
    if (!TIME_RE.test(start) || !TIME_RE.test(end) || start >= end) return { error: "invalid_break_time" };
    if (start < shiftStart || end > shiftEnd) return { error: "break_outside_shift" };
    breaks.push({ start_time: start, end_time: end });
  }
  breaks.sort((a, b) => a.start_time.localeCompare(b.start_time));
  for (let index = 1; index < breaks.length; index += 1) {
    if (breaks[index].start_time < breaks[index - 1].end_time) return { error: "overlapping_breaks" };
  }
  return { breaks };
}

function normalizeDays(days: DayInput[] | undefined): { days: NormalizedDay[] } | ValidationError {
  if (!Array.isArray(days) || days.length !== 7) return { error: "seven_days_required" };
  const seen = new Set<number>();
  const normalized: NormalizedDay[] = [];

  for (const raw of days) {
    const day = Number(raw.day_of_week);
    if (!Number.isInteger(day) || day < 0 || day > 6 || seen.has(day)) return { error: "invalid_day_of_week" };
    seen.add(day);
    if (typeof raw.is_working !== "boolean") return { error: "invalid_working_state" };
    if (!raw.is_working) {
      normalized.push({ day_of_week: day, is_working: false, start_time: null, end_time: null, breaks: [] });
      continue;
    }
    const start = clean(raw.start_time, 5);
    const end = clean(raw.end_time, 5);
    if (!TIME_RE.test(start) || !TIME_RE.test(end)) return { error: "invalid_shift_time" };
    if (start >= end) return { error: "invalid_shift_range" };
    const breaksResult = normalizeBreaks(raw.breaks, start, end);
    if ("error" in breaksResult) return breaksResult;
    normalized.push({ day_of_week: day, is_working: true, start_time: start, end_time: end, breaks: breaksResult.breaks });
  }
  return { days: normalized.sort((a, b) => a.day_of_week - b.day_of_week) };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const context = await requireOwnerShop(request, env);
  if (context.response) return context.response;
  const url = new URL(request.url);
  const staffId = clean(url.searchParams.get("staff_id"), 96);
  if (staffId) {
    const staff = await assertStaff(env.DB, staffId, context.specialist.id, String(context.shop.id));
    if (!staff) return jsonResponse(404, { success: false, error: "staff_not_found" });
  }
  return jsonResponse(200, {
    success: true,
    shop_id: String(context.shop.id),
    timezone: String(context.shop.timezone || "UTC"),
    schedules: await readSchedule(env.DB, context.specialist.id, String(context.shop.id), staffId || undefined),
    calendar_conflicts: [],
    calendar_conflicts_source: "local_only",
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const context = await requireOwnerShop(request, env);
  if (context.response) return context.response;
  let body: ScheduleInput;
  try {
    body = (await request.json()) as ScheduleInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const staffId = clean(body.staff_id, 96);
  if (!staffId) return jsonResponse(400, { success: false, error: "staff_id_required" });
  const staff = await assertStaff(env.DB, staffId, context.specialist.id, String(context.shop.id));
  if (!staff) return jsonResponse(404, { success: false, error: "staff_not_found" });
  const normalized = normalizeDays(body.days);
  if ("error" in normalized) return jsonResponse(400, { success: false, error: normalized.error });

  const now = new Date().toISOString();
  for (const day of normalized.days) {
    await env.DB
      .prepare(
        `INSERT INTO repair_shop_staff_schedule
          (staff_id,shop_id,owner_specialist_id,day_of_week,is_working,start_time,end_time,breaks,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(staff_id,day_of_week) DO UPDATE SET
           shop_id=excluded.shop_id,
           owner_specialist_id=excluded.owner_specialist_id,
           is_working=excluded.is_working,
           start_time=excluded.start_time,
           end_time=excluded.end_time,
           breaks=excluded.breaks,
           updated_at=excluded.updated_at`,
      )
      .bind(staffId, context.shop.id, context.specialist.id, day.day_of_week, day.is_working ? 1 : 0, day.start_time, day.end_time, JSON.stringify(day.breaks), now)
      .run();
  }

  return jsonResponse(200, {
    success: true,
    staff_id: staffId,
    timezone: String(context.shop.timezone || "UTC"),
    schedules: await readSchedule(env.DB, context.specialist.id, String(context.shop.id), staffId),
    calendar_conflicts: [],
    calendar_conflicts_source: "local_only",
  });
}