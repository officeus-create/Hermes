import { jsonResponse } from "../_lib/session.mjs";
import { listPublicCatalogEntries } from "../_lib/catalog-public.mjs";

type Env = { DB?: any };

export async function onRequestGet({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const companies = await listPublicCatalogEntries(env.DB, 750);
  return jsonResponse(200, { success: true, count: companies.length, companies }, {
    "Cache-Control": "public, max-age=30, s-maxage=60",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
