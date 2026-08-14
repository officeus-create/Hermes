import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";

type Env = { DB?: any };

type ProfileInput = {
  name?: unknown;
  phone?: unknown;
  address_line1?: unknown;
  city?: unknown;
  state?: unknown;
  postal_code?: unknown;
  timezone?: unknown;
};

const US_TIMEZONES = new Set([
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
]);

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function slugify(value: string) {
  const base = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "repair-shop";
}

async function makeUniqueSlug(db: any, name: string) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 7);
    const slug = `${base}-${suffix}`;
    const exists = await db.prepare("SELECT id FROM repair_shops WHERE slug = ? LIMIT 1").bind(slug).first();
    if (!exists) return slug;
  }
  throw new Error("unable_to_allocate_shop_slug");
}

async function getProfile(db: any, ownerId: string) {
  return db
    .prepare(
      "SELECT id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone,created_at,updated_at FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1",
    )
    .bind(ownerId)
    .first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopProfileSchema(env.DB);
  const shop = await getProfile(env.DB, specialist.id);
  return jsonResponse(200, { success: true, shop: shop ?? null });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: ProfileInput;
  try {
    body = (await request.json()) as ProfileInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 32);
  const addressLine1 = clean(body.address_line1, 160);
  const city = clean(body.city, 80);
  const state = clean(body.state, 2).toUpperCase();
  const postalCode = clean(body.postal_code, 16);
  const timezone = clean(body.timezone, 64);

  if (name.length < 2) return jsonResponse(400, { success: false, error: "invalid_shop_name" });
  if (city.length < 2) return jsonResponse(400, { success: false, error: "invalid_city" });
  if (!/^[A-Z]{2}$/.test(state)) return jsonResponse(400, { success: false, error: "invalid_state" });
  if (!US_TIMEZONES.has(timezone)) return jsonResponse(400, { success: false, error: "invalid_timezone" });
  if (phone && phone.length < 7) return jsonResponse(400, { success: false, error: "invalid_phone" });

  await ensureRepairShopProfileSchema(env.DB);
  const existing = await getProfile(env.DB, specialist.id);
  const now = new Date().toISOString();

  if (existing) {
    await env.DB
      .prepare(
        "UPDATE repair_shops SET name=?,phone=?,address_line1=?,city=?,state=?,postal_code=?,timezone=?,updated_at=? WHERE owner_specialist_id=?",
      )
      .bind(name, phone || null, addressLine1 || null, city, state, postalCode || null, timezone, now, specialist.id)
      .run();
  } else {
    const id = `shop-${crypto.randomUUID()}`;
    const slug = await makeUniqueSlug(env.DB, name);
    await env.DB
      .prepare(
        "INSERT INTO repair_shops (id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        id,
        specialist.id,
        name,
        slug,
        phone || null,
        addressLine1 || null,
        city,
        state,
        postalCode || null,
        timezone,
        now,
        now,
      )
      .run();
  }

  const shop = await getProfile(env.DB, specialist.id);
  return jsonResponse(200, { success: true, shop });
}
