import { expect, test } from "@playwright/test";
import {
  decideHermesPermission,
  HERMES_CONSEQUENTIAL_ACTIONS_OUTSIDE_MEMBERSHIP_V1,
  membershipMatchesHermesScope,
  type HermesMembership,
} from "../src/lib/hermes-connect-permissions";

const member = (overrides: Partial<HermesMembership> = {}): HermesMembership => ({
  specialistId: "specialist-1",
  companyId: "company-1",
  workspaceId: "workspace-1",
  role: "member",
  active: true,
  ...overrides,
});

test("membership scope fails closed across identity, company and workspace", () => {
  const request = {
    specialistId: "specialist-1",
    companyId: "company-1",
    workspaceId: "workspace-1",
    action: "crm.read" as const,
  };
  expect(membershipMatchesHermesScope(member(), request)).toBe(true);
  expect(decideHermesPermission(member({ specialistId: "specialist-2" }), request)).toEqual({
    allowed: false,
    reason: "identity_mismatch",
  });
  expect(decideHermesPermission(member({ companyId: "company-2" }), request)).toEqual({
    allowed: false,
    reason: "company_scope_mismatch",
  });
  expect(decideHermesPermission(member({ workspaceId: "workspace-2" }), request)).toEqual({
    allowed: false,
    reason: "workspace_scope_mismatch",
  });
});

test("inactive membership cannot authorize anything", () => {
  expect(decideHermesPermission(member({ active: false }), {
    specialistId: "specialist-1",
    companyId: "company-1",
    workspaceId: "workspace-1",
    action: "crm.read",
  })).toEqual({ allowed: false, reason: "membership_inactive" });
});

test("member can perform ordinary CRM work but cannot administer team or integrations", () => {
  const base = { specialistId: "specialist-1", companyId: "company-1", workspaceId: "workspace-1" };
  expect(decideHermesPermission(member(), { ...base, action: "crm.write" }).allowed).toBe(true);
  expect(decideHermesPermission(member(), { ...base, action: "team.write" })).toEqual({
    allowed: false,
    reason: "role_denied",
  });
  expect(decideHermesPermission(member(), { ...base, action: "integration.manage" })).toEqual({
    allowed: false,
    reason: "role_denied",
  });
});

test("read-only membership cannot mutate CRM", () => {
  const base = { specialistId: "specialist-1", companyId: "company-1", workspaceId: "workspace-1" };
  expect(decideHermesPermission(member({ role: "read_only" }), { ...base, action: "crm.read" }).allowed).toBe(true);
  expect(decideHermesPermission(member({ role: "read_only" }), { ...base, action: "crm.write" })).toEqual({
    allowed: false,
    reason: "role_denied",
  });
});

test("admin can manage settings/team/integrations inside the exact scope", () => {
  const base = { specialistId: "specialist-1", companyId: "company-1", workspaceId: "workspace-1" };
  const admin = member({ role: "admin" });
  for (const action of ["company.settings.write", "team.write", "integration.manage"] as const) {
    expect(decideHermesPermission(admin, { ...base, action }).allowed).toBe(true);
  }
});

test("unknown or consequential actions are not silently promoted into RBAC", () => {
  expect(decideHermesPermission(member({ role: "owner" }), {
    specialistId: "specialist-1",
    companyId: "company-1",
    workspaceId: "workspace-1",
    action: "billing.change",
  })).toEqual({ allowed: false, reason: "invalid_action" });

  expect(HERMES_CONSEQUENTIAL_ACTIONS_OUTSIDE_MEMBERSHIP_V1).toContain("credential.manage");
  expect(HERMES_CONSEQUENTIAL_ACTIONS_OUTSIDE_MEMBERSHIP_V1).toContain("production.release");
});

test("empty or whitespace identity and company scope never authorize a role", () => {
  const base = { specialistId: "specialist-1", companyId: "company-1", workspaceId: "workspace-1", action: "crm.read" as const };
  const emptyActor = { ...base, specialistId: " " };
  const emptyCompany = { ...base, companyId: "" };
  expect(membershipMatchesHermesScope(member({ specialistId: " " }), emptyActor)).toBe(false);
  expect(membershipMatchesHermesScope(member({ companyId: "" }), emptyCompany)).toBe(false);
  expect(decideHermesPermission(member({ specialistId: " " }), emptyActor)).toEqual({
    allowed: false, reason: "identity_mismatch",
  });
  expect(decideHermesPermission(member({ companyId: "" }), emptyCompany)).toEqual({
    allowed: false, reason: "company_scope_mismatch",
  });
});

test("untrusted role strings and prototype keys deny instead of throwing or granting", () => {
  const base = { specialistId: "specialist-1", companyId: "company-1", workspaceId: "workspace-1", action: "crm.read" as const };
  for (const role of ["__proto__", "toString", "superadmin", "", null]) {
    const untrusted = member({ role: role as HermesMembership["role"] });
    expect(membershipMatchesHermesScope(untrusted, base)).toBe(false);
    expect(decideHermesPermission(untrusted, base)).toEqual({ allowed: false, reason: "invalid_role" });
  }
});

test("only explicit boolean active state grants access", () => {
  const base = { specialistId: "specialist-1", companyId: "company-1", workspaceId: "workspace-1", action: "crm.read" as const };
  const untrusted = member({ active: "true" as unknown as boolean });
  expect(membershipMatchesHermesScope(untrusted, base)).toBe(false);
  expect(decideHermesPermission(untrusted, base)).toEqual({ allowed: false, reason: "membership_inactive" });
});
