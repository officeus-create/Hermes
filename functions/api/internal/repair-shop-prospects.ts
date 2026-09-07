import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureVadymPrefilledProspects } from "../_lib/repair-shop-prospects.mjs";

type Env = { DB?: any };

const cleanText = (value: unknown) => String(value ?? "").trim();

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_unavailable" });

  await ensureVadymPrefilledProspects(env.DB);
  const result = await env.DB.prepare(`
    SELECT
      id, source_system, source_ref, business_name, shop_type, state, city, address_line1,
      phone, email, website, social_url, contact_name, contact_role, services_summary,
      website_observation, social_observation, crm_stage, crm_call_result,
      crm_decision_maker_reached, crm_interest_level, crm_budget_range,
      profile_state, claim_state, public_profile_enabled, claimed_shop_id,
      claimed_owner_specialist_id, claimed_at, provenance_json, created_at, updated_at
    FROM repair_shop_prospects
    WHERE source_system = 'VADYM'
      AND source_ref IN ('VY-0001','VY-0002','VY-0003','VY-0007','VY-0024')
    ORDER BY source_ref ASC
  `).all();

  const prospects = (Array.isArray(result?.results) ? result.results : []).map((row: Record<string, unknown>) => {
    const missing: string[] = [];
    if (!cleanText(row.email)) missing.push("email");
    if (!cleanText(row.website)) missing.push("website");
    if (!cleanText(row.social_url)) missing.push("social");
    if (!cleanText(row.contact_name)) missing.push("contact_name");
    if (!cleanText(row.contact_role)) missing.push("contact_role");
    return {
      ...row,
      public_profile_enabled: Number(row.public_profile_enabled || 0) === 1,
      missing_fields: missing,
      claim_ready: false,
    };
  });

  return jsonResponse(200, {
    success: true,
    mode: "private_prefilled_prospects",
    counted_as_registration: false,
    public_booking_enabled: false,
    claim_policy: "A prospect becomes a live repair shop only after a verified real owner claims or registers it through an authorized flow.",
    prospects,
  });
}
