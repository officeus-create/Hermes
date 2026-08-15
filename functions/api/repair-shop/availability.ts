import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";

type Env = { DB?: any };
type AvailabilityDayInput = {
  day_of_week?: unknown;
  is_open?: unknown;
  start_time?: unknown;
  end_time?: unknown;
};

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function serializeRow(row: any) {
  return {
    day_of_week: Number(row.day_of_week),
    is_open: Number(row.is_open) === 1,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
  };
}

async function getOwnerShop(db: any, specialistId: string) {
  await ensureRepairShopProfileSchema(db);
  return db
    .prepare("SELECT id,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialistId)
    .first();
}

async function readAvailability(db: any, shopId: string) {
  await ensureRepairShopAvailabilitySchema(db);
  const result = await db
    .prepare(
      "SELECT day_of_week,is_open,start_time,end_time FROM repair_shop_availability WHERE shop_id = ? ORDER BY day_of_week ASC",
    )
    .bind(shopId)
    .all();
  const stored = new Map((result?.results ?? []).map((row: any) => [Number(row.day_of_week), serializeRow(row)]));
  return Array.from({ length: 7 }, (_, day) =>
    stored.get(day) ?? { day_of_week: day, is_open: false, start_time: null, end_time: null },
  );
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const shop = await getOwnerShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  return jsonResponse(200, {
    success: true,
    shop_id: shop.id,
    timezone: shop.timezone,
    days: await readAvailability(env.DB, shop.id),
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const shop = await getOwnerShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "shop_profile_required" });

  let body: { days?: AvailabilityDayInput[] };
  try {
    body = (await request.json()) as { days?: AvailabilityDayInput[] };
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  if (!Array.isArray(body.days) || body.days.length !== 7) {
    return jsonResponse(400, { success: false, error: "seven_days_required" });
  }

  const normalized = [];
  const seen = new Set<number>();
  for (const raw of body.days) {
    const day = Number(raw.day_of_week);
    if (!Number.isInteger(day) || day < 0 || day > 6 || seen.has(day)) {
      return jsonResponse(400, { success: false, error: "invalid_day_of_week" });
    }
    seen.add(day);

    if (typeof raw.is_open !== "boolean") {
      return jsonResponse(400, { success: false, error: "invalid_open_state" });
    }

    if (!raw.is_open) {
      normalized.push({ day_of_week: day, is_open: false, start_time: null, end_time: null });
      continue;
    }

    const start = String(raw.start_time ?? "").trim();
    const end = String(raw.end_time ?? "").trim();
    if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
      return jsonResponse(400, { success: false, error: "invalid_time" });
    }
    if (start >= end) {
      return jsonResponse(400, { success: false, error: "invalid_time_range" });
    }
    normalized.push({ day_of_week: day, is_open: true, start_time: start, end_time: end });
  }

  await ensureRepairShopAvailabilitySchema(env.DB);
  const now = new Date().toISOString();
  for (const day of normalized) {
    await env.DB
      .prepare(
        `INSERT INTO repair_shop_availability (shop_id,day_of_week,is_open,start_time,end_time,updated_at)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT(shop_id,day_of_week) DO UPDATE SET
           is_open=excluded.is_open,
           start_time=excluded.start_time,
           end_time=excluded.end_time,
           updated_at=excluded.updated_at`,
      )
      .bind(shop.id, day.day_of_week, day.is_open ? 1 : 0, day.start_time, day.end_time, now)
      .run();
  }

  return jsonResponse(200, {
    success: true,
    shop_id: shop.id,
    timezone: shop.timezone,
    days: await readAvailability(env.DB, shop.id),
  });
}
