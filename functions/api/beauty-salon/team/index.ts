import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { ensureBeautySalonSchema } from "../../_lib/beauty-salon-schema.mjs";
import { getOwnedBeautySalon } from "../../_lib/beauty-salon-context.mjs";

type Env = { DB?: any };
type TeamInput = {
  display_name?: unknown;
  role_label?: unknown;
  public_title?: unknown;
  is_public?: unknown;
};

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const clean = (value: unknown, max: number) => String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
const asBoolean = (value: unknown) => value === true || value === 1 || value === "1" || value === "true";

async function listTeam(db: any, ownerId: string, salonId: string) {
  const result = await db.prepare(`
    SELECT id,display_name,role_label,public_title,is_public,is_active,created_at,updated_at
    FROM beauty_salon_team_members
    WHERE owner_specialist_id = ? AND salon_id = ?
    ORDER BY is_active DESC, display_name COLLATE NOCASE ASC, created_at ASC
  `).bind(ownerId, salonId).all();
  return (result?.results ?? []).map((row: any) => ({
    ...row,
    is_public: Number(row.is_public) === 1,
    is_active: Number(row.is_active) === 1,
  }));
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureBeautySalonSchema(env.DB);
  const salon = await getOwnedBeautySalon(env.DB, specialist.id);
  if (!salon) return jsonResponse(409, { success: false, error: "salon_profile_required" });

  const team = await listTeam(env.DB, specialist.id, salon.id);
  return jsonResponse(200, { success: true, salon_id: salon.id, team });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: TeamInput;
  try {
    body = (await request.json()) as TeamInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const displayName = clean(body.display_name, 100);
  const roleLabel = clean(body.role_label, 80);
  const publicTitle = clean(body.public_title, 100);
  const isPublic = asBoolean(body.is_public);
  if (displayName.length < 2) return jsonResponse(400, { success: false, error: "invalid_team_member_name" });
  if (roleLabel.length < 2) return jsonResponse(400, { success: false, error: "invalid_team_member_role" });

  await ensureBeautySalonSchema(env.DB);
  const salon = await getOwnedBeautySalon(env.DB, specialist.id);
  if (!salon) return jsonResponse(409, { success: false, error: "salon_profile_required" });

  const activeCount = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM beauty_salon_team_members
    WHERE owner_specialist_id = ? AND salon_id = ? AND is_active = 1
  `).bind(specialist.id, salon.id).first();
  if (Number(activeCount?.count ?? 0) >= 100) {
    return jsonResponse(409, { success: false, error: "team_member_limit_reached" });
  }

  const id = `salon-team-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO beauty_salon_team_members
      (id,salon_id,owner_specialist_id,display_name,role_label,public_title,is_public,is_active,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,1,?,?)
  `).bind(
    id,
    salon.id,
    specialist.id,
    displayName,
    roleLabel,
    publicTitle || null,
    isPublic ? 1 : 0,
    now,
    now,
  ).run();

  const member = await env.DB.prepare(`
    SELECT id,display_name,role_label,public_title,is_public,is_active,created_at,updated_at
    FROM beauty_salon_team_members
    WHERE id = ? AND owner_specialist_id = ? AND salon_id = ?
    LIMIT 1
  `).bind(id, specialist.id, salon.id).first();

  return jsonResponse(201, {
    success: true,
    member: {
      ...member,
      is_public: Number(member?.is_public) === 1,
      is_active: Number(member?.is_active) === 1,
    },
  });
}
