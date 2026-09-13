import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const PRIVATE_IDENTITY_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) {
    return jsonResponse(503, { success: false, error: "database_not_configured" }, PRIVATE_IDENTITY_HEADERS);
  }

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) {
    return jsonResponse(401, { success: false, error: "not_authenticated" }, PRIVATE_IDENTITY_HEADERS);
  }

  return jsonResponse(200, { success: true, specialist }, PRIVATE_IDENTITY_HEADERS);
}
