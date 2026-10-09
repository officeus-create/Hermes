import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { getBeautySalonById, getOwnedBeautySalon } from "../_lib/beauty-salon-context.mjs";
import { createBusinessRef, parseBusinessRef } from "../_lib/business-identity.mjs";
import { BEAUTY_SALON_WORKSPACE_REF, decideHermesBusinessAccess, listHermesWorkspaceMemberships } from "../_lib/hermes-workspace-membership";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import {
  ensureAcademySchema,
  getAcademyLearnerProfile,
  getAcademyReviewerAccess,
  listAcademyEnrollments,
} from "../_lib/academy.mjs";
import { ensureInternalAiSchema } from "../_lib/internal-ai.mjs";
import { ensureAcademyBusinessProfilesSchema } from "../_lib/academy-business-profiles.mjs";
import { getHrReviewerAccess } from "../_lib/hr.mjs";

type Env = { DB?: any };

type OwnedBusiness = {
  key: "repair_shop" | "beauty_salon" | "academy_business" | "home_service";
  kind: "owned_business";
  id: string;
  name: string;
  slug: string;
  href: string;
  workspace_state: "live" | "private_foundation" | "academy_vertical";
  business_ref: string;
};

type AccessibleBusiness = {
  key: "beauty_salon";
  kind: "delegated_business";
  id: string;
  name: string;
  slug: string;
  href: string;
  workspace_state: "private_foundation";
  business_ref: string;
  workspace_ref: string;
  role: "admin" | "member" | "read_only";
  grant_source: string;
};

type Workspace = {
  key: "academy" | "internal_ai" | "hr" | "load_board";
  kind: "shared_workspace" | "capability_workspace" | "company_workspace";
  href: string;
  available: true;
  state: Record<string, unknown>;
};

const privateHeaders = { "Cache-Control": "no-store" };

async function getOwnedRepairShop(db: any, ownerId: string) {
  await ensureRepairShopProfileSchema(db);
  return db.prepare(`
    SELECT id,name,slug
    FROM repair_shops
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(ownerId).first();
}

async function getOwnedHermesCompany(db: any, ownerId: string) {
  await ensureHermesCompanyProfilesSchema(db);
  return db.prepare(`
    SELECT id,company_name,slug,company_type,city,state,catalog_opt_in,catalog_status,load_board_access
    FROM hermes_company_profiles
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(ownerId).first();
}

async function getOwnedAcademyBusiness(db: any, ownerId: string) {
  await ensureHermesCompanyProfilesSchema(db);
  await ensureAcademyBusinessProfilesSchema(db);
  return db.prepare(`
    SELECT c.id, c.company_name AS business_name, c.slug
    FROM hermes_academy_business_profiles a
    JOIN hermes_company_profiles c ON c.id = a.company_id
    WHERE a.owner_specialist_id = ? AND c.owner_specialist_id = ?
    LIMIT 1
  `).bind(ownerId, ownerId).first();
}

async function getInternalAiAccess(db: any, specialistId: string) {
  await ensureInternalAiSchema(db);
  return db.prepare(`
    SELECT specialist_id,capability
    FROM hermes_internal_owner_access
    WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER'
    LIMIT 1
  `).bind(specialistId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  await ensureAcademySchema(env.DB);

  const [repairShop, beautySalon, academyBusiness, hermesCompany, academyProfile, academyEnrollments, academyReviewerAccess, internalAiAccess, hrReviewerAccess, delegatedMemberships] = await Promise.all([
    getOwnedRepairShop(env.DB, specialist.id),
    getOwnedBeautySalon(env.DB, specialist.id),
    getOwnedAcademyBusiness(env.DB, specialist.id),
    getOwnedHermesCompany(env.DB, specialist.id),
    getAcademyLearnerProfile(env.DB, specialist.id),
    listAcademyEnrollments(env.DB, specialist.id),
    getAcademyReviewerAccess(env.DB, specialist.id),
    getInternalAiAccess(env.DB, specialist.id),
    getHrReviewerAccess(env.DB, specialist.id),
    listHermesWorkspaceMemberships(env.DB, specialist.id),
  ]);

  const ownedBusinesses: OwnedBusiness[] = [];
  if (repairShop) {
    ownedBusinesses.push({
      key: "repair_shop",
      kind: "owned_business",
      id: String(repairShop.id),
      name: String(repairShop.name || "Repair Shop"),
      slug: String(repairShop.slug || ""),
      href: "/services/hermes-connect/repair-shops/dashboard/",
      workspace_state: "live",
      business_ref: createBusinessRef("repair_shop", repairShop.id) || "",
    });
  }
  if (beautySalon) {
    ownedBusinesses.push({
      key: "beauty_salon",
      kind: "owned_business",
      id: String(beautySalon.id),
      name: String(beautySalon.name || "Beauty Salon"),
      slug: String(beautySalon.slug || ""),
      href: "/services/hermes-connect/beauty/workspace/",
      workspace_state: "private_foundation",
      business_ref: createBusinessRef("beauty_salon", beautySalon.id) || "",
    });
  }
  if (academyBusiness) {
    ownedBusinesses.push({
      key: "academy_business",
      kind: "owned_business",
      id: String(academyBusiness.id),
      name: String(academyBusiness.business_name || "Academy"),
      slug: String(academyBusiness.slug || ""),
      href: "/services/hermes-connect/academy/business/workspace/",
      workspace_state: "academy_vertical",
      business_ref: createBusinessRef("company", academyBusiness.id) || "",
    });
  }
  if (hermesCompany && String(hermesCompany.company_type) === "home_service") {
    ownedBusinesses.push({
      key: "home_service",
      kind: "owned_business",
      id: String(hermesCompany.id),
      name: String(hermesCompany.company_name || "Home Service Business"),
      slug: String(hermesCompany.slug || ""),
      href: "/services/hermes-connect/home-services/workspace/",
      workspace_state: "live",
      business_ref: createBusinessRef("company", hermesCompany.id) || "",
    });
  }

  const ownedRefs = new Set(ownedBusinesses.map((item) => item.business_ref).filter(Boolean));
  const accessibleBusinesses: AccessibleBusiness[] = [];
  for (const membership of delegatedMemberships) {
    const parsed = parseBusinessRef(membership.business_ref);
    if (!parsed || parsed.namespace !== "beauty_salon") continue;
    if (membership.workspace_ref !== BEAUTY_SALON_WORKSPACE_REF) continue;
    if (ownedRefs.has(parsed.ref)) continue;
    const salon = await getBeautySalonById(env.DB, parsed.native_id);
    if (!salon) continue;
    const decision = decideHermesBusinessAccess({
      specialistId: specialist.id,
      businessRef: parsed.ref,
      workspaceRef: BEAUTY_SALON_WORKSPACE_REF,
      action: "company.read",
      ownerSpecialistId: salon.owner_specialist_id,
      delegatedMembership: membership,
    });
    if (!decision.allowed || decision.source !== "delegated_membership") continue;
    accessibleBusinesses.push({
      key: "beauty_salon",
      kind: "delegated_business",
      id: String(salon.id),
      name: String(salon.name || "Beauty Salon"),
      slug: String(salon.slug || ""),
      href: `/services/hermes-connect/beauty/workspace/?business_ref=${encodeURIComponent(parsed.ref)}`,
      workspace_state: "private_foundation",
      business_ref: parsed.ref,
      workspace_ref: BEAUTY_SALON_WORKSPACE_REF,
      role: decision.role,
      grant_source: membership.grant_source,
    });
  }

  const reviewerActive = Number(academyReviewerAccess?.active || 0) === 1;
  const workspaces: Workspace[] = [
    {
      key: "academy",
      kind: "shared_workspace",
      href: "/services/hermes-connect/academy/dashboard/",
      available: true,
      state: {
        profile_exists: Boolean(academyProfile),
        preferred_language: academyProfile?.preferred_language || null,
        timezone: academyProfile?.timezone || null,
        enrollments: academyEnrollments.map((item: any) => ({
          program_slug: item.program_slug,
          state: item.state,
          participation_model: item.participation_model,
          cohort_code: item.cohort_code || null,
        })),
        reviewer_access: reviewerActive
          ? { active: true, program_scope: academyReviewerAccess?.program_scope || null }
          : { active: false, program_scope: null },
      },
    },
  ];

  if (hermesCompany && Number(hermesCompany.load_board_access) === 1) {
    workspaces.push({
      key: "load_board",
      kind: "company_workspace",
      href: "/load-board/?access=unlocked#live-marketplace",
      available: true,
      state: {
        company_id: String(hermesCompany.id),
        company_name: String(hermesCompany.company_name || "Company"),
        company_slug: String(hermesCompany.slug || ""),
        company_type: String(hermesCompany.company_type || "other"),
        city: String(hermesCompany.city || ""),
        state: String(hermesCompany.state || ""),
        catalog_opt_in: Number(hermesCompany.catalog_opt_in) === 1,
        catalog_status: String(hermesCompany.catalog_status || "self_submitted"),
        load_board_access: true,
      },
    });
  }

  if (hrReviewerAccess) {
    workspaces.push({
      key: "hr",
      kind: "capability_workspace",
      href: "/demos/hermes-connect/hr-admin.html",
      available: true,
      state: {
        reviewer_access: true,
        access_source: String(hrReviewerAccess.source || "hr_reviewer_access"),
      },
    });
  }

  if (internalAiAccess) {
    workspaces.push({
      key: "internal_ai",
      kind: "capability_workspace",
      href: "/services/hermes-connect/internal/ai-connect/",
      available: true,
      state: {
        capability: String(internalAiAccess.capability),
      },
    });
  }

  return jsonResponse(200, {
    success: true,
    identity: {
      id: specialist.id,
      email: specialist.email,
      name: specialist.name,
      role: specialist.role,
      location: specialist.location || null,
    },
    owned_businesses: ownedBusinesses,
    accessible_businesses: accessibleBusinesses,
    workspaces,
    capabilities: {
      load_board: Boolean(hermesCompany && Number(hermesCompany.load_board_access) === 1),
      internal_ai: Boolean(internalAiAccess),
      hr_review: Boolean(hrReviewerAccess),
      delegated_business_access: accessibleBusinesses.length > 0,
    },
  }, privateHeaders);
}
