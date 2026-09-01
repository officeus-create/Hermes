import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { getOwnedBeautySalon } from "../_lib/beauty-salon-context.mjs";
import {
  ensureAcademySchema,
  getAcademyLearnerProfile,
  getAcademyReviewerAccess,
  listAcademyEnrollments,
} from "../_lib/academy.mjs";
import { ensureInternalAiSchema } from "../_lib/internal-ai.mjs";

type Env = { DB?: any };

type OwnedBusiness = {
  key: "repair_shop" | "beauty_salon";
  kind: "owned_business";
  id: string;
  name: string;
  slug: string;
  href: string;
  workspace_state: "live" | "private_foundation";
};

type Workspace = {
  key: "academy" | "internal_ai";
  kind: "shared_workspace" | "capability_workspace";
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

  const [repairShop, beautySalon, academyProfile, academyEnrollments, academyReviewerAccess, internalAiAccess] = await Promise.all([
    getOwnedRepairShop(env.DB, specialist.id),
    getOwnedBeautySalon(env.DB, specialist.id),
    getAcademyLearnerProfile(env.DB, specialist.id),
    listAcademyEnrollments(env.DB, specialist.id),
    getAcademyReviewerAccess(env.DB, specialist.id),
    getInternalAiAccess(env.DB, specialist.id),
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
    workspaces,
    capabilities: {
      internal_ai: Boolean(internalAiAccess),
    },
  }, privateHeaders);
}
