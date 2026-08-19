import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const source = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Beauty B1 backend reuses Hermes identity and keeps salon data owner-scoped", async () => {
  const [schema, context, profile, teamIndex, teamMember] = await Promise.all([
    source("functions/api/_lib/beauty-salon-schema.mjs"),
    source("functions/api/_lib/beauty-salon-context.mjs"),
    source("functions/api/beauty-salon/profile.ts"),
    source("functions/api/beauty-salon/team/index.ts"),
    source("functions/api/beauty-salon/team/[id].ts"),
  ]);

  expect(schema).toContain("CREATE TABLE IF NOT EXISTS beauty_salons");
  expect(schema).toContain("owner_specialist_id TEXT NOT NULL UNIQUE");
  expect(schema).toContain("CREATE TABLE IF NOT EXISTS beauty_salon_team_members");
  expect(schema).not.toContain("password");
  expect(schema).not.toContain("session");

  expect(context).toContain('BEAUTY_SALON_SERVICE_VERTICAL = "beauty_salon"');
  expect(context).toContain("ensureDefaultBusinessContext");
  expect(context).not.toContain("repair_shop");

  expect(profile).toContain("getAuthenticatedSpecialist(request, env.DB)");
  expect(profile).toContain("getOwnedBeautySalon(env.DB, specialist.id)");
  expect(profile).toContain("ensureBeautySalonServiceContext(env.DB, specialist.id, salon)");
  expect(profile).not.toContain("body.owner_specialist_id");
  expect(profile).not.toContain("body.salon_id");

  expect(teamIndex).toContain("getAuthenticatedSpecialist(request, env.DB)");
  expect(teamIndex).toContain("getOwnedBeautySalon(env.DB, specialist.id)");
  expect(teamIndex).toContain("owner_specialist_id = ? AND salon_id = ?");
  expect(teamIndex).not.toContain("password");
  expect(teamIndex).not.toContain("email");
  expect(teamMember).toContain("owner_specialist_id = ? AND salon_id = ?");
  expect(teamMember).not.toContain("password");
  expect(teamMember).not.toContain("email");
});

test("Beauty B1 backend excludes regulated health data and autonomous/commercial fields", async () => {
  const files = await Promise.all([
    source("functions/api/_lib/beauty-salon-schema.mjs"),
    source("functions/api/beauty-salon/profile.ts"),
    source("functions/api/beauty-salon/team/index.ts"),
    source("functions/api/beauty-salon/team/[id].ts"),
  ]);
  const combined = files.join("\n").toLowerCase();

  for (const forbidden of [
    "diagnosis",
    "diagnoses",
    "medication",
    "contraindication",
    "symptom",
    "medical_history",
    "prescription",
    "treatment_consent",
    "payment",
    "payout",
    "revenue",
    "autonomous_outreach",
  ]) {
    expect(combined).not.toContain(forbidden);
  }
});
