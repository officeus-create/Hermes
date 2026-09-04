import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProspectSchema } from "../_lib/repair-shop-prospects.mjs";

type Env = { DB?: any };
type ProspectInput = Record<string, unknown>;

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const cleanEmail = (value: unknown) => {
  const email = clean(value, 180).toLowerCase();
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};
const cleanUrl = (value: unknown) => {
  const raw = clean(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
};
const cleanSourceEntryId = (value: unknown) => {
  const id = clean(value, 80);
  return /^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/.test(id) ? id : "";
};

async function listProspects(db: any) {
  const result = await db.prepare(`
    SELECT id,source_entry_id,source,salesperson_code,name,phone,email,website,social_url,address_line1,city,state,postal_code,
           services,website_observation,social_observation,source_url,claim_state,claimed_shop_id,created_by,created_at,updated_at
    FROM hermes_repair_shop_prospects
    ORDER BY updated_at DESC, source_entry_id ASC
    LIMIT 250
  `).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureRepairShopProspectSchema(env.DB);
  const prospects = await listProspects(env.DB);
  const summary = prospects.reduce((acc: Record<string, number>, row: any) => {
    const key = String(row.claim_state || "unclaimed");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return jsonResponse(200, { success: true, summary, prospects });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureRepairShopProspectSchema(env.DB);

  let body: ProspectInput;
  try { body = await request.json() as ProspectInput; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const action = clean(body.action, 32) || "upsert";
  if (action !== "upsert") return jsonResponse(400, { success: false, error: "unsupported_action" });

  const sourceEntryId = cleanSourceEntryId(body.source_entry_id);
  const source = clean(body.source, 80) || "crm";
  const salespersonCode = clean(body.salesperson_code, 80);
  const name = clean(body.name, 140);
  const phone = clean(body.phone, 40);
  const email = cleanEmail(body.email);
  const website = cleanUrl(body.website);
  const socialUrl = cleanUrl(body.social_url);
  const addressLine1 = clean(body.address_line1, 180);
  const city = clean(body.city, 100);
  const state = clean(body.state, 2).toUpperCase();
  const postalCode = clean(body.postal_code, 20);
  const services = clean(body.services, 2000);
  const websiteObservation = clean(body.website_observation, 2000);
  const socialObservation = clean(body.social_observation, 1200);
  const sourceUrl = cleanUrl(body.source_url);

  if (!sourceEntryId) return jsonResponse(400, { success: false, error: "invalid_source_entry_id" });
  if (name.length < 2) return jsonResponse(400, { success: false, error: "invalid_name" });
  if (city.length < 2) return jsonResponse(400, { success: false, error: "invalid_city" });
  if (!/^[A-Z]{2}$/.test(state)) return jsonResponse(400, { success: false, error: "invalid_state" });
  if (email === null) return jsonResponse(400, { success: false, error: "invalid_email" });
  if (website === null || socialUrl === null || sourceUrl === null) return jsonResponse(400, { success: false, error: "invalid_url" });

  const now = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT id,claim_state,claimed_shop_id FROM hermes_repair_shop_prospects WHERE source_entry_id=? LIMIT 1").bind(sourceEntryId).first();
  if (existing?.claim_state === "claimed") {
    return jsonResponse(409, { success: false, error: "prospect_already_claimed", source_entry_id: sourceEntryId });
  }

  const id = existing?.id || `prospect-${crypto.randomUUID()}`;
  if (existing) {
    await env.DB.prepare(`
      UPDATE hermes_repair_shop_prospects
      SET source=?,salesperson_code=?,name=?,phone=?,email=?,website=?,social_url=?,address_line1=?,city=?,state=?,postal_code=?,services=?,
          website_observation=?,social_observation=?,source_url=?,updated_at=?
      WHERE id=? AND claim_state='unclaimed'
    `).bind(source,salespersonCode||null,name,phone||null,email||null,website||null,socialUrl||null,addressLine1||null,city,state,postalCode||null,services||null,
      websiteObservation||null,socialObservation||null,sourceUrl||null,now,id).run();
  } else {
    await env.DB.prepare(`
      INSERT INTO hermes_repair_shop_prospects
      (id,source_entry_id,source,salesperson_code,name,phone,email,website,social_url,address_line1,city,state,postal_code,services,website_observation,
       social_observation,source_url,claim_state,claimed_shop_id,created_by,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'unclaimed',NULL,?,?,?)
    `).bind(id,sourceEntryId,source,salespersonCode||null,name,phone||null,email||null,website||null,socialUrl||null,addressLine1||null,city,state,postalCode||null,services||null,
      websiteObservation||null,socialObservation||null,sourceUrl||null,owner.specialist.id,now,now).run();
  }

  const prospect = await env.DB.prepare(`
    SELECT id,source_entry_id,source,salesperson_code,name,phone,email,website,social_url,address_line1,city,state,postal_code,services,
           website_observation,social_observation,source_url,claim_state,claimed_shop_id,created_at,updated_at
    FROM hermes_repair_shop_prospects WHERE id=? LIMIT 1
  `).bind(id).first();
  return jsonResponse(existing ? 200 : 201, { success: true, prospect });
}
