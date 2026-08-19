import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureBeautySalonSchema } from "../_lib/beauty-salon-schema.mjs";
import { ensureBeautySalonServiceContext, getOwnedBeautySalon } from "../_lib/beauty-salon-context.mjs";

type Env = { DB?: any };
type ProfileInput = {
  name?: unknown;
  phone?: unknown;
  website?: unknown;
  address_line1?: unknown;
  city?: unknown;
  region?: unknown;
  postal_code?: unknown;
  country_code?: unknown;
  timezone?: unknown;
};

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const clean = (value: unknown, max: number) => String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

function slugify(value: string) {
  const base = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "beauty-salon";
}

async function makeUniqueSlug(db: any, name: string) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 7);
    const slug = `${base}-${suffix}`;
    const exists = await db.prepare("SELECT id FROM beauty_salons WHERE slug = ? LIMIT 1").bind(slug).first();
    if (!exists) return slug;
  }
  throw new Error("unable_to_allocate_salon_slug");
}

function isValidTimezone(value: string) {
  if (!value || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function normalizeWebsite(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString().slice(0, 240);
  } catch {
    return null;
  }
}

function serviceContextPayload(context: any) {
  return context ? { id: context.id, vertical_key: context.vertical_key } : null;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureBeautySalonSchema(env.DB);
  const salon = await getOwnedBeautySalon(env.DB, specialist.id);
  const scoped = salon ? await ensureBeautySalonServiceContext(env.DB, specialist.id, salon) : null;
  return jsonResponse(200, {
    success: true,
    salon: salon ?? null,
    service_context: serviceContextPayload(scoped?.context),
  });
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
  const websiteInput = clean(body.website, 240);
  const website = normalizeWebsite(websiteInput);
  const addressLine1 = clean(body.address_line1, 160);
  const city = clean(body.city, 100);
  const region = clean(body.region, 100);
  const postalCode = clean(body.postal_code, 24);
  const countryCode = clean(body.country_code, 2).toUpperCase();
  const timezone = clean(body.timezone, 64);

  if (name.length < 2) return jsonResponse(400, { success: false, error: "invalid_salon_name" });
  if (city.length < 2) return jsonResponse(400, { success: false, error: "invalid_city" });
  if (!/^[A-Z]{2}$/.test(countryCode)) return jsonResponse(400, { success: false, error: "invalid_country_code" });
  if (!isValidTimezone(timezone)) return jsonResponse(400, { success: false, error: "invalid_timezone" });
  if (phone && phone.length < 7) return jsonResponse(400, { success: false, error: "invalid_phone" });
  if (websiteInput && !website) return jsonResponse(400, { success: false, error: "invalid_website" });

  await ensureBeautySalonSchema(env.DB);
  const existing = await getOwnedBeautySalon(env.DB, specialist.id);
  const now = new Date().toISOString();

  if (existing) {
    await env.DB.prepare(`
      UPDATE beauty_salons
      SET name=?,phone=?,website=?,address_line1=?,city=?,region=?,postal_code=?,country_code=?,timezone=?,updated_at=?
      WHERE owner_specialist_id=?
    `).bind(
      name,
      phone || null,
      website,
      addressLine1 || null,
      city,
      region || null,
      postalCode || null,
      countryCode,
      timezone,
      now,
      specialist.id,
    ).run();
  } else {
    const id = `salon-${crypto.randomUUID()}`;
    const slug = await makeUniqueSlug(env.DB, name);
    await env.DB.prepare(`
      INSERT INTO beauty_salons
        (id,owner_specialist_id,name,slug,phone,website,address_line1,city,region,postal_code,country_code,timezone,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      id,
      specialist.id,
      name,
      slug,
      phone || null,
      website,
      addressLine1 || null,
      city,
      region || null,
      postalCode || null,
      countryCode,
      timezone,
      now,
      now,
    ).run();
  }

  const salon = await getOwnedBeautySalon(env.DB, specialist.id);
  const scoped = await ensureBeautySalonServiceContext(env.DB, specialist.id, salon);
  return jsonResponse(200, {
    success: true,
    salon,
    service_context: serviceContextPayload(scoped?.context),
  });
}
