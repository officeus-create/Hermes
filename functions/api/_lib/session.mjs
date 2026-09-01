import { parseCookies, isSessionExpired } from "../../../src/legacy-prototype/auth.mjs";
import { touchSpecialistActivity } from "./account-engagement.mjs";

export async function getAuthenticatedSpecialist(request, db) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies.hermes_session;
  if (!token) return null;

  const session = await db
    .prepare("SELECT specialist_id, expires_at FROM sessions WHERE token = ?")
    .bind(token)
    .first();
  if (!session) return null;
  if (isSessionExpired(session.expires_at)) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }

  const specialist = await db
    .prepare("SELECT id, email, name, role, location, bio FROM specialists WHERE id = ?")
    .bind(session.specialist_id)
    .first();

  if (specialist?.role === "Shop Owner") {
    try {
      await touchSpecialistActivity(db, specialist.id, request);
    } catch (error) {
      console.error("account_engagement_touch_failed", {
        category: "non_blocking_activity_tracking",
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  return specialist || null;
}

export function jsonResponse(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}
