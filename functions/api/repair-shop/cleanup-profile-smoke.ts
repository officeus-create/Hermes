import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const TARGETS = [
  {
    id: "specialist-3ca0da75-64fb-4cc0-baf2-9be1330370e4",
    email: "repair-profile-test-1786751512-31851784398@hermesconnect.app",
  },
  {
    id: "specialist-5aac9483-b565-45c7-9d0b-cdba5220a2e9",
    email: "repair-profile-test-1786752224-31852431972@hermesconnect.app",
  },
] as const;

export async function onRequestPost({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const results = [];
  for (const target of TARGETS) {
    const before = await env.DB
      .prepare("SELECT id,email FROM specialists WHERE id = ? AND email = ?")
      .bind(target.id, target.email)
      .first();

    await env.DB.prepare("DELETE FROM services WHERE owner_specialist_id = ?").bind(target.id).run();
    await env.DB.prepare("DELETE FROM repair_shops WHERE owner_specialist_id = ?").bind(target.id).run();
    await env.DB.prepare("DELETE FROM sessions WHERE specialist_id = ?").bind(target.id).run();
    await env.DB.prepare("DELETE FROM specialists WHERE id = ? AND email = ?").bind(target.id, target.email).run();

    const specialistCount = await env.DB
      .prepare("SELECT COUNT(*) AS count FROM specialists WHERE id = ? AND email = ?")
      .bind(target.id, target.email)
      .first();
    const shopCount = await env.DB
      .prepare("SELECT COUNT(*) AS count FROM repair_shops WHERE owner_specialist_id = ?")
      .bind(target.id)
      .first();
    const serviceCount = await env.DB
      .prepare("SELECT COUNT(*) AS count FROM services WHERE owner_specialist_id = ?")
      .bind(target.id)
      .first();
    const sessionCount = await env.DB
      .prepare("SELECT COUNT(*) AS count FROM sessions WHERE specialist_id = ?")
      .bind(target.id)
      .first();

    const remaining =
      Number(specialistCount?.count || 0) +
      Number(shopCount?.count || 0) +
      Number(serviceCount?.count || 0) +
      Number(sessionCount?.count || 0);
    if (remaining !== 0) {
      return jsonResponse(500, { success: false, error: "cleanup_verification_failed", target: target.id });
    }

    results.push({ id: target.id, deleted: Boolean(before), remaining: 0 });
  }

  return jsonResponse(200, { success: true, results });
}
