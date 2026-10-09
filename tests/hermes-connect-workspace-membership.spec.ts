import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  BEAUTY_SALON_WORKSPACE_REF,
  decideHermesBusinessAccess,
  normalizeHermesDelegatedMembershipGrant,
} from "../functions/api/_lib/hermes-workspace-membership";

const delegated = {
  id: "membership-1",
  business_ref: "beauty_salon:salon-1",
  workspace_ref: BEAUTY_SALON_WORKSPACE_REF,
  specialist_id: "specialist-member",
  role: "read_only" as const,
  active: true as const,
  granted_by_specialist_id: "specialist-owner",
  grant_source: "owner_verified_membership_2026_10_10",
};

test("delegated grant normalization is business-ref scoped and denies self-promotion/owner role", () => {
  expect(normalizeHermesDelegatedMembershipGrant({
    ...delegated,
    active: true,
  })).toEqual({
    business_ref: delegated.business_ref,
    workspace_ref: delegated.workspace_ref,
    specialist_id: delegated.specialist_id,
    role: delegated.role,
    active: true,
    granted_by_specialist_id: delegated.granted_by_specialist_id,
    grant_source: delegated.grant_source,
  });
  expect(normalizeHermesDelegatedMembershipGrant({
    ...delegated,
    granted_by_specialist_id: delegated.specialist_id,
    active: true,
  })).toBeNull();
  expect(normalizeHermesDelegatedMembershipGrant({
    ...delegated,
    role: "owner",
    active: true,
  })).toBeNull();
  expect(normalizeHermesDelegatedMembershipGrant({
    ...delegated,
    business_ref: "unknown:salon-1",
    active: true,
  })).toBeNull();
});

test("owner adapter preserves owner access without a membership row", () => {
  const result = decideHermesBusinessAccess({
    specialistId: "specialist-owner",
    businessRef: "beauty_salon:salon-1",
    workspaceRef: BEAUTY_SALON_WORKSPACE_REF,
    action: "company.settings.write",
    ownerSpecialistId: "specialist-owner",
  });
  expect(result.allowed).toBe(true);
  expect(result.source).toBe("owner_adapter");
  expect(result.role).toBe("owner");
});

test("delegated read-only member can read the exact Beauty business but cannot mutate or cross tenant", () => {
  const read = decideHermesBusinessAccess({
    specialistId: delegated.specialist_id,
    businessRef: delegated.business_ref,
    workspaceRef: delegated.workspace_ref,
    action: "company.read",
    ownerSpecialistId: "specialist-owner",
    delegatedMembership: delegated,
  });
  expect(read.allowed).toBe(true);
  expect(read.source).toBe("delegated_membership");

  const write = decideHermesBusinessAccess({
    specialistId: delegated.specialist_id,
    businessRef: delegated.business_ref,
    workspaceRef: delegated.workspace_ref,
    action: "crm.write",
    ownerSpecialistId: "specialist-owner",
    delegatedMembership: delegated,
  });
  expect(write.allowed).toBe(false);

  const wrongBusiness = decideHermesBusinessAccess({
    specialistId: delegated.specialist_id,
    businessRef: "beauty_salon:salon-2",
    workspaceRef: delegated.workspace_ref,
    action: "company.read",
    ownerSpecialistId: "specialist-owner-2",
    delegatedMembership: delegated,
  });
  expect(wrongBusiness.allowed).toBe(false);
});

test("inactive or malformed delegated membership never grants access", () => {
  expect(decideHermesBusinessAccess({
    specialistId: delegated.specialist_id,
    businessRef: delegated.business_ref,
    workspaceRef: delegated.workspace_ref,
    action: "company.read",
    ownerSpecialistId: "specialist-owner",
    delegatedMembership: { ...delegated, active: false as unknown as true },
  }).allowed).toBe(false);

  expect(decideHermesBusinessAccess({
    specialistId: delegated.specialist_id,
    businessRef: " ",
    workspaceRef: delegated.workspace_ref,
    action: "company.read",
    delegatedMembership: delegated,
  })).toEqual({ allowed: false, reason: "invalid_scope", source: "none" });
});

test("server adoption stays read-only for delegated Beauty access and roster rows are not login grants", async () => {
  const membershipSource = await readFile("functions/api/_lib/hermes-workspace-membership.ts", "utf8");
  const profileSource = await readFile("functions/api/beauty-salon/profile.ts", "utf8");
  const accountSource = await readFile("functions/api/hermes-connect/account.ts", "utf8");
  const schemaSource = await readFile("functions/api/_lib/beauty-salon-schema.mjs", "utf8");

  expect(membershipSource).toContain("CREATE TABLE IF NOT EXISTS hermes_workspace_memberships");
  expect(membershipSource).toContain("UNIQUE(business_ref, workspace_ref, specialist_id)");
  expect(membershipSource).toContain("role IN ('admin','member','read_only')");
  expect(profileSource).toContain("resolveHermesBusinessAccess");
  expect(profileSource).toContain('action: "company.read"');
  expect(profileSource).toContain("beauty_salon_access_denied");
  expect(profileSource).not.toContain("beauty_salon_team_members");
  expect(accountSource).toContain("accessible_businesses");
  expect(accountSource).toContain("delegated_business_access");
  expect(schemaSource).not.toContain("specialist_id TEXT NOT NULL,\n      display_name");
});
