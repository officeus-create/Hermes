import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { ensureBeautySalonSchema } from "../../_lib/beauty-salon-schema.mjs";
import { getOwnedBeautySalon } from "../../_lib/beauty-salon-context.mjs";

type Env = { DB?: any };
type TeamPatch = {
  display_name?: unknown;
  role_label?: unknown;
  public_title?: unknown;
  is_public?: unknown;
  is_active?: unknown;
};

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const clean = (value: unknown, max: number) => String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
const asBoolean = (value: unknown) => value === true || value === 1 || value === "1" || value === "true";

export async function onRequestPatch({ request, env, params }: { request: Request; env: Env; params: { id?: string } }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const memberId = String(params.id ?? "").trim();
  if (!memberId) return jsonResponse(400, { success: false, error: "team_member_id_required" });

  let body: TeamPatch;
  try {
    body = (await request.json()) as TeamPatch;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  await ensureBeautySalonSchema(env.DB);
  const salon = await getOwnedBeautySalon(env.DB, specialist.id);
  if (!salon) return jsonResponse(409, { success: false, error: "salon_profile_required" });

  const existing = await env.DB.prepare(`
    SELECT id,display_name,role_label,public_title,is_public,is_active,created_at,updated_at
    FROM beauty_salon_team_members
    WHERE id = ? AND owner_specialist_id = ? AND salon_id = ?
    LIMIT 1
  `).bind(memberId, specialist.id, salon.id).first();
  if (!existing) return jsonResponse(404, { success: false, error: "team_member_not_found" });

  const displayName = body.display_name === undefined ? String(existing.display_name) : clean(body.display_name, 100);
  const roleLabel = body.role_label === undefined ? String(existing.role_label) : clean(body.role_label, 80);
  const publicTitle = body.public_title === undefined ? clean(existing.public_title, 100) : clean(body.public_title, 100);
  const isPublic = body.is_public === undefined ? Number(existing.is_public) === 1 : asBoolean(body.is_public);
  const isActive = body.is_active === undefined ? Number(existing.is_active) === 1 : asBoolean(body.is_active);

  if (displayName.length < 2) return jsonResponse(400, { success: false, error: "invalid_team_member_name" });
  if (roleLabel.length < 2) return jsonResponse(400, { success: false, error: "invalid_team_member_role" });

  if (isActive && Number(existing.is_active) !== 1) {
    const activeCount = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM beauty_salon_team_members
      WHERE owner_specialist_id = ? AND salon_id = ? AND is_active = 1
    `).bind(specialist.id, salon.id).first();
    if (Number(activeCount?.count ?? 0) >= 100) {
      return jsonResponse(409, { success: false, error: "team_member_limit_reached" });
    }
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE beauty_salon_team_members
    SET display_name=?,role_label=?,public_title=?,is_public=?,is_active=?,updated_at=?
    WHERE id=? AND owner_specialist_id=? AND salon_id=?
  `).bind(
    displayName,
    roleLabel,
    publicTitle || null,
    isPublic ? 1 : 0,
    isActive ? 1 : 0,
    now,
    memberId,
    specialist.id,
    salon.id,
  ).run();

  const member = await env.DB.prepare(`
    SELECT id,display_name,role_label,public_title,is_public,is_active,created_at,updated_at
    FROM beauty_salon_team_members
    WHERE id = ? AND owner_specialist_id = ? AND salon_id = ?
    LIMIT 1
  `).bind(memberId, specialist.id, salon.id).first();

  return jsonResponse(200, {
    success: true,
    member: {
      ...member,
      is_public: Number(member?.is_public) === 1,
      is_active: Number(member?.is_active) === 1,
    },
  });
}
