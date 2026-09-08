import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureOfficeRepairDemoData } from "../_lib/repair-shop-office-demo.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopStaffSchema, serializeRepairShopStaff } from "../_lib/repair-shop-staff-schema.mjs";

type Env = { DB?: any; HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string };
type StaffInput = {
  id?: unknown;
  name?: unknown;
  role?: unknown;
  specialties?: unknown;
  active?: unknown;
};
type OwnerContext =
  | { response: Response; specialist?: never; shop?: never }
  | { response?: undefined; specialist: any; shop: any };

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function normalizeSpecialties(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of raw) {
    const specialty = clean(item, 60);
    if (!specialty) continue;
    const key = specialty.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(specialty);
    if (result.length >= 12) break;
  }
  return result;
}

async function requireOwnerShop(request: Request, env: Env): Promise<OwnerContext> {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (specialist.role !== "Shop Owner") return { response: jsonResponse(403, { success: false, error: "shop_owner_required" }) };
  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare("SELECT id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  if (!shop) return { response: jsonResponse(409, { success: false, error: "shop_profile_required" }) };
  await ensureRepairShopStaffSchema(env.DB);
  return { specialist, shop };
}

async function readStaff(db: any, ownerId: string, shopId: string) {
  const result = await db
    .prepare(
      `SELECT id,shop_id,owner_specialist_id,name,role,specialties,active,created_at,updated_at
       FROM repair_shop_staff
       WHERE owner_specialist_id = ? AND shop_id = ?
       ORDER BY active DESC, name COLLATE NOCASE ASC`,
    )
    .bind(ownerId, shopId)
    .all();
  return (result?.results ?? []).map(serializeRepairShopStaff);
}

function validateStaff(body: StaffInput, current?: any) {
  const name = clean(body.name ?? current?.name, 100);
  const role = clean(body.role ?? current?.role ?? "Technician", 80) || "Technician";
  const specialties = body.specialties === undefined
    ? normalizeSpecialties(current?.specialties ?? [])
    : normalizeSpecialties(body.specialties);
  const active = typeof body.active === "boolean" ? body.active : current ? Boolean(current.active) : true;
  if (name.length < 2) return { error: "invalid_staff_name" } as const;
  return { name, role, specialties, active } as const;
}

async function parseBody(request: Request) {
  try {
    return (await request.json()) as StaffInput;
  } catch {
    return null;
  }
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const context = await requireOwnerShop(request, env);
  if (context.response) return context.response;
  const demoSeed = await ensureOfficeRepairDemoData({ db: env.DB, env, specialist: context.specialist });
  return jsonResponse(200, {
    success: true,
    shop_id: String(context.shop.id),
    staff: await readStaff(env.DB, context.specialist.id, String(context.shop.id)),
    demo_seed: demoSeed.eligible ? demoSeed : undefined,
  });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const context = await requireOwnerShop(request, env);
  if (context.response) return context.response;
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" });
  const normalized = validateStaff(body);
  if ("error" in normalized) return jsonResponse(400, { success: false, error: normalized.error });

  const duplicate = await env.DB
    .prepare("SELECT id FROM repair_shop_staff WHERE shop_id = ? AND lower(name) = lower(?) LIMIT 1")
    .bind(context.shop.id, normalized.name)
    .first();
  if (duplicate) return jsonResponse(409, { success: false, error: "staff_name_already_exists" });

  const now = new Date().toISOString();
  const id = `staff-${crypto.randomUUID()}`;
  await env.DB
    .prepare(
      `INSERT INTO repair_shop_staff (id,shop_id,owner_specialist_id,name,role,specialties,active,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    )
    .bind(id, context.shop.id, context.specialist.id, normalized.name, normalized.role, JSON.stringify(normalized.specialties), normalized.active ? 1 : 0, now, now)
    .run();

  return jsonResponse(201, {
    success: true,
    staff: await readStaff(env.DB, context.specialist.id, String(context.shop.id)),
    created_id: id,
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const context = await requireOwnerShop(request, env);
  if (context.response) return context.response;
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" });
  const id = clean(body.id, 96);
  if (!id) return jsonResponse(400, { success: false, error: "staff_id_required" });

  const current = await env.DB
    .prepare("SELECT id,name,role,specialties,active FROM repair_shop_staff WHERE id = ? AND owner_specialist_id = ? AND shop_id = ? LIMIT 1")
    .bind(id, context.specialist.id, context.shop.id)
    .first();
  if (!current) return jsonResponse(404, { success: false, error: "staff_not_found" });
  const serialized = serializeRepairShopStaff({ ...current, shop_id: context.shop.id });
  const normalized = validateStaff(body, serialized);
  if ("error" in normalized) return jsonResponse(400, { success: false, error: normalized.error });

  const duplicate = await env.DB
    .prepare("SELECT id FROM repair_shop_staff WHERE shop_id = ? AND lower(name) = lower(?) AND id <> ? LIMIT 1")
    .bind(context.shop.id, normalized.name, id)
    .first();
  if (duplicate) return jsonResponse(409, { success: false, error: "staff_name_already_exists" });

  await env.DB
    .prepare(
      `UPDATE repair_shop_staff
       SET name=?,role=?,specialties=?,active=?,updated_at=?
       WHERE id=? AND owner_specialist_id=? AND shop_id=?`,
    )
    .bind(normalized.name, normalized.role, JSON.stringify(normalized.specialties), normalized.active ? 1 : 0, new Date().toISOString(), id, context.specialist.id, context.shop.id)
    .run();

  return jsonResponse(200, {
    success: true,
    staff: await readStaff(env.DB, context.specialist.id, String(context.shop.id)),
  });
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }) {
  const context = await requireOwnerShop(request, env);
  if (context.response) return context.response;
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" });
  const id = clean(body.id, 96);
  if (!id) return jsonResponse(400, { success: false, error: "staff_id_required" });

  const existing = await env.DB
    .prepare("SELECT id FROM repair_shop_staff WHERE id=? AND owner_specialist_id=? AND shop_id=? LIMIT 1")
    .bind(id, context.specialist.id, context.shop.id)
    .first();
  if (!existing) return jsonResponse(404, { success: false, error: "staff_not_found" });

  await env.DB
    .prepare("DELETE FROM repair_shop_staff WHERE id=? AND owner_specialist_id=? AND shop_id=?")
    .bind(id, context.specialist.id, context.shop.id)
    .run();

  return jsonResponse(200, {
    success: true,
    staff: await readStaff(env.DB, context.specialist.id, String(context.shop.id)),
  });
}
