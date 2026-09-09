import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopSyntheticDemoData } from "../_lib/repair-shop-synthetic-demo.mjs";

type Env = { DB?: any; HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string };
type SeedResult = {
  eligible?: boolean;
  seeded?: boolean;
  seed_version?: string;
  seeded_through?: string;
  appointment_count?: number;
  benchmark_service_count?: number;
  schedule_rows?: number;
};

const CEO_QA_EMAIL = "officeus+hc-owner-qa-v3-20260818@hermeslogisticsus.com";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  if (specialist.role !== "Shop Owner") return jsonResponse(403, { success: false, error: "shop_owner_required" });
  if (String(specialist.email || "").trim().toLowerCase() !== CEO_QA_EMAIL) {
    return jsonResponse(404, { success: false, error: "not_found" });
  }

  const seedEnv = {
    ...env,
    HERMES_SYNTHETIC_ACCOUNT_EMAILS: [String(env.HERMES_SYNTHETIC_ACCOUNT_EMAILS || ""), CEO_QA_EMAIL]
      .filter(Boolean)
      .join(","),
  };
  const seedSpecialist = { ...specialist, name: "Office CEO QA" };
  const result = await ensureRepairShopSyntheticDemoData({ db: env.DB, env: seedEnv, specialist: seedSpecialist }) as SeedResult;
  if (!result.eligible || !result.seeded) {
    return jsonResponse(409, { success: false, error: "synthetic_seed_not_ready" });
  }

  return jsonResponse(200, {
    success: true,
    synthetic: true,
    seed_version: result.seed_version ?? null,
    seeded_through: result.seeded_through ?? null,
    appointment_count: Number(result.appointment_count || 0),
    benchmark_service_count: Number(result.benchmark_service_count || 0),
    schedule_rows: Number(result.schedule_rows || 0),
  });
}
