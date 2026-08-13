import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB: D1Database };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  return jsonResponse(200, { success: true, specialist });
}
