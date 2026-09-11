import { jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";

type Env = { DB?: any };

export async function onRequestGet({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureHermesCompanyProfilesSchema(env.DB);
  const result = await env.DB.prepare(`
    SELECT id, company_name, slug, company_type, city, state, catalog_status, created_at, updated_at
    FROM hermes_company_profiles
    WHERE catalog_opt_in = 1
      AND catalog_status IN ('self_submitted', 'verified_public')
    ORDER BY CASE WHEN catalog_status = 'verified_public' THEN 0 ELSE 1 END, updated_at DESC
    LIMIT 500
  `).all();
  const companies = (result?.results || []).map((row: any) => ({
    id: row.id,
    companyName: row.company_name,
    slug: row.slug,
    companyType: row.company_type,
    city: row.city,
    state: row.state,
    status: row.catalog_status,
    verificationLabel: row.catalog_status === 'verified_public' ? 'Verified' : 'Self-submitted · verification pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  return jsonResponse(200, { success: true, count: companies.length, companies }, {
    "Cache-Control": "public, max-age=30, s-maxage=60",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
