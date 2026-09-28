import { hashPassword } from "../../../src/legacy-prototype/auth.mjs";
import { bearerToken, verifyGitHubFirst5ActivationOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAccessSchema, REPAIR_SHOP_PLAN_ID } from "../_lib/repair-shop-access.mjs";
import { ensureRegistrationOpsSchema } from "../_lib/registration-ops.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";
import { resolveDefaultRepairShopServiceContext } from "../_lib/repair-shop-service-context.mjs";
import { createServiceForContext, findDuplicateServiceForContext, listServicesForContext } from "../_lib/service-context.mjs";

type Env = { DB?: any };

const OPERATION_ID = "provision_arkansas_repair_prospects_2026_09_28";
const MANAGER_PASSWORD = "AchemeAcheme";

const PROFILES = [
  {
    key: "smart-bubble",
    email: "hr@smartbubbleautorepair.com",
    name: "Smart Bubble Mobile Auto/Body Repair Shop",
    phone: "+1 833-501-7771",
    addressLine1: "",
    city: "Little Rock",
    state: "AR",
    postalCode: "72205",
    timezone: "America/Chicago",
    website: "https://smartbubbleautorepairshop.simplybook.me/v2/",
    slug: "smart-bubble-mobile-auto-body-repair",
    location: "Little Rock, Arkansas",
    bio: "Mobile auto repair and auto-body repair business in Little Rock / Central Arkansas.",
    hours: [
      [0,1,"00:00","23:59"],[1,1,"00:00","23:59"],[2,1,"00:00","23:59"],[3,1,"00:00","23:59"],
      [4,1,"00:00","23:59"],[5,1,"00:00","23:59"],[6,1,"00:00","23:59"]
    ],
    services: [
      ["Mobile auto repair",60],["Auto body repair",120],["Vehicle diagnostics",60],
      ["Brake service",60],["Suspension repair",90],["Car detailing",120],["Window tinting",120]
    ]
  },
  {
    key: "clendenins",
    email: "clintonautorepair@outlook.com",
    name: "Clendenin's Auto Repair",
    phone: "+1 501-679-6367",
    addressLine1: "450 Hwy 25 N",
    city: "Guy",
    state: "AR",
    postalCode: "72061",
    timezone: "America/Chicago",
    website: "https://www.autorepairshopgreenbrierar.com/",
    slug: "clendenins-auto-repair",
    location: "Guy, Arkansas",
    bio: "General auto repair shop serving Guy, Greenbrier and surrounding Arkansas communities.",
    hours: [
      [0,0,null,null],[1,1,"08:00","17:00"],[2,1,"08:00","17:00"],[3,1,"08:00","17:00"],
      [4,1,"08:00","17:00"],[5,1,"08:00","17:00"],[6,0,null,null]
    ],
    services: [
      ["General auto repair",60],["Vehicle diagnostics",60],["Brake repair",60],["Suspension repair",90],
      ["Engine repair",120],["Transmission repair",120],["Tire service",60],["Wheel alignment",60]
    ]
  },
  {
    key: "dapper-wrench",
    email: "hello@thedapperwrench.com",
    name: "The Dapper Wrench",
    phone: "+1 479-474-2971",
    addressLine1: "10638 N Highway 59",
    city: "Cedarville",
    state: "AR",
    postalCode: "72932",
    timezone: "America/Chicago",
    website: "https://thedapperwrench.com/",
    slug: "the-dapper-wrench",
    location: "Cedarville, Arkansas",
    bio: "European auto repair specialist serving Cedarville, Van Buren, Fort Smith and the River Valley.",
    hours: [
      [0,0,null,null],[1,1,"07:00","17:30"],[2,1,"07:00","17:30"],[3,1,"07:00","17:30"],
      [4,1,"07:00","17:30"],[5,0,null,null],[6,0,null,null]
    ],
    services: [
      ["European auto repair",60],["Volkswagen service",60],["Audi service",60],["Porsche service",60],
      ["Land Rover service",60],["Pre-owned inspection",90],["Wheel alignment",60],["Suspension service",90],
      ["Maintenance service",60],["Engine diagnostics and repair",90],["Brake service",60],["Safety inspection and repair",60]
    ]
  }
] as const;

async function seedHours(db:any, shopId:string, hours:readonly (readonly any[])[], now:string) {
  await ensureRepairShopAvailabilitySchema(db);
  await db.prepare("DELETE FROM repair_shop_availability WHERE shop_id=?").bind(shopId).run();
  for (const day of hours) {
    await db.prepare(
      "INSERT INTO repair_shop_availability (shop_id,day_of_week,is_open,start_time,end_time,updated_at) VALUES (?,?,?,?,?,?)"
    ).bind(shopId, day[0], day[1], day[2], day[3], now).run();
  }
}

async function seedServices(db:any, ownerId:string, shopId:string, services:readonly (readonly [string,number])[]) {
  const resolved = await resolveDefaultRepairShopServiceContext(db, ownerId, { id: shopId, owner_specialist_id: ownerId });
  for (const [name, durationMinutes] of services) {
    const existing = await findDuplicateServiceForContext(db, {
      ownerId, contextId: resolved.context.id, name, includeLegacyUnmapped: true
    });
    if (!existing) {
      await createServiceForContext(db, { ownerId, contextId: resolved.context.id, name, durationMinutes });
    }
  }
  return listServicesForContext(db, { ownerId, contextId: resolved.context.id, includeLegacyUnmapped: true });
}

async function ensureOne(db:any, profile:(typeof PROFILES)[number], now:string) {
  const email = profile.email.toLowerCase();
  let specialist = await db.prepare("SELECT id,role FROM specialists WHERE LOWER(email)=? LIMIT 1").bind(email).first();
  if (specialist && String(specialist.role || "") !== "Shop Owner") {
    throw new Error(profile.key + ":owner_role_mismatch");
  }

  if (!specialist) {
    const specialistId = "specialist-" + crypto.randomUUID();
    const { hash, salt } = await hashPassword(MANAGER_PASSWORD);
    await db.prepare(
      "INSERT INTO specialists (id,email,password_hash,password_salt,name,role,location,bio,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(specialistId,email,hash,salt,profile.name,"Shop Owner",profile.location,profile.bio,now).run();
    specialist = { id: specialistId, role: "Shop Owner" };
  } else {
    const { hash, salt } = await hashPassword(MANAGER_PASSWORD);
    await db.prepare("UPDATE specialists SET password_hash=?,password_salt=?,name=?,location=?,bio=? WHERE id=?")
      .bind(hash,salt,profile.name,profile.location,profile.bio,String(specialist.id)).run();
    await db.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(String(specialist.id)).run();
  }

  const ownerId = String(specialist.id);
  let shop = await db.prepare("SELECT id,slug FROM repair_shops WHERE owner_specialist_id=? LIMIT 1").bind(ownerId).first();
  if (!shop) {
    const collision = await db.prepare("SELECT id,owner_specialist_id FROM repair_shops WHERE slug=? LIMIT 1").bind(profile.slug).first();
    if (collision) throw new Error(profile.key + ":slug_collision");
    const shopId = "repair-shop-" + crypto.randomUUID();
    await db.prepare(
      "INSERT INTO repair_shops (id,owner_specialist_id,name,slug,phone,address_line1,city,state,region,country_code,postal_code,timezone,website,catalog_opt_in,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)"
    ).bind(shopId,ownerId,profile.name,profile.slug,profile.phone,profile.addressLine1,profile.city,profile.state,profile.state,"US",profile.postalCode,profile.timezone,profile.website,now,now).run();
    shop = { id: shopId, slug: profile.slug };
  } else {
    await db.prepare(
      "UPDATE repair_shops SET name=?,phone=?,address_line1=?,city=?,state=?,region=?,country_code='US',postal_code=?,timezone=?,website=?,catalog_opt_in=0,updated_at=? WHERE id=? AND owner_specialist_id=?"
    ).bind(profile.name,profile.phone,profile.addressLine1,profile.city,profile.state,profile.state,profile.postalCode,profile.timezone,profile.website,now,String(shop.id),ownerId).run();
  }

  const shopId = String(shop.id);
  await ensureRepairShopAccessSchema(db);
  await db.prepare(
    "INSERT INTO repair_shop_access (shop_id,access_state,plan_id,started_at,current_period_end,updated_at) VALUES (?,'trialing',?,?,NULL,?) " +
    "ON CONFLICT(shop_id) DO UPDATE SET access_state='trialing',plan_id=excluded.plan_id,updated_at=excluded.updated_at"
  ).bind(shopId,REPAIR_SHOP_PLAN_ID,now,now).run();

  await db.prepare(
    "INSERT INTO hermes_registration_flags (specialist_id,synthetic,reviewed_at,updated_at) VALUES (?,0,?,?) " +
    "ON CONFLICT(specialist_id) DO UPDATE SET synthetic=0,reviewed_at=excluded.reviewed_at,updated_at=excluded.updated_at"
  ).bind(ownerId,now,now).run();

  await seedHours(db, shopId, profile.hours, now);
  const services = await seedServices(db, ownerId, shopId, profile.services);

  const check = await db.prepare(
    "SELECT s.email,s.role,r.name,r.slug,r.phone,r.city,r.state,r.website,a.access_state,a.plan_id " +
    "FROM specialists s JOIN repair_shops r ON r.owner_specialist_id=s.id " +
    "LEFT JOIN repair_shop_access a ON a.shop_id=r.id WHERE s.id=? AND r.id=? LIMIT 1"
  ).bind(ownerId,shopId).first();

  if (!check || String(check.email || "").toLowerCase() !== email || check.role !== "Shop Owner" ||
      check.name !== profile.name || check.slug !== profile.slug || check.access_state !== "trialing" ||
      check.plan_id !== REPAIR_SHOP_PLAN_ID) {
    throw new Error(profile.key + ":readback_failed");
  }

  return {
    key: profile.key,
    business_name: profile.name,
    login: email,
    public_catalog_path: "/businesses/arkansas/" + (profile.key === "smart-bubble" ? "little-rock/smart-bubble-mobile-auto-body-repair/" :
      profile.key === "clendenins" ? "guy/clendenins-auto-repair/" : "cedarville/the-dapper-wrench/"),
    crm_slug: profile.slug,
    services_total: services.length,
    access_state: String(check.access_state || "")
  };
}

export async function onRequestPost({ request, env }:{ request:Request; env:Env }) {
  if (!env.DB) return jsonResponse(503,{success:false,error:"database_not_configured"});
  const token = bearerToken(request);
  if (!token || !await verifyGitHubFirst5ActivationOidcToken(token)) {
    return jsonResponse(403,{success:false,error:"operator_not_authorized"});
  }

  let body:Record<string,unknown>;
  try { body = await request.json() as Record<string,unknown>; }
  catch { return jsonResponse(400,{success:false,error:"invalid_json"}); }

  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400,{success:false,error:"unsupported_operation"});
  }

  await ensureRepairShopProfileSchema(env.DB);
  await ensureRepairShopAccessSchema(env.DB);
  await ensureRegistrationOpsSchema(env.DB);
  await ensureRepairShopAvailabilitySchema(env.DB);

  const now = new Date().toISOString();
  const results:any[] = [];
  try {
    for (const profile of PROFILES) results.push(await ensureOne(env.DB, profile, now));
  } catch (error) {
    console.error("arkansas_repair_prospect_provision_failed", {
      error: error instanceof Error ? error.message : "unknown_error"
    });
    return jsonResponse(409,{success:false,error:"provisioning_failed"});
  }

  return jsonResponse(200,{
    success:true,
    operation:OPERATION_ID,
    manager:"Acheme",
    credential_pattern:"manager-name repeated",
    businesses:results
  });
}
