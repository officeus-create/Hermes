export type HermesMembershipRole = "owner" | "admin" | "member" | "read_only";

export type HermesPermissionAction =
  | "workspace.read"
  | "company.read"
  | "company.settings.write"
  | "crm.read"
  | "crm.write"
  | "team.read"
  | "team.write"
  | "integration.read"
  | "integration.manage";

export type HermesMembership = {
  specialistId: string;
  companyId: string;
  workspaceId?: string;
  role: HermesMembershipRole;
  active: boolean;
};

export type HermesPermissionRequest = {
  specialistId: string;
  companyId: string;
  workspaceId?: string;
  action: HermesPermissionAction;
};

const ROLE_GRANTS: Record<HermesMembershipRole, ReadonlySet<HermesPermissionAction>> = {
  owner: new Set([
    "workspace.read",
    "company.read",
    "company.settings.write",
    "crm.read",
    "crm.write",
    "team.read",
    "team.write",
    "integration.read",
    "integration.manage",
  ]),
  admin: new Set([
    "workspace.read",
    "company.read",
    "company.settings.write",
    "crm.read",
    "crm.write",
    "team.read",
    "team.write",
    "integration.read",
    "integration.manage",
  ]),
  member: new Set([
    "workspace.read",
    "company.read",
    "crm.read",
    "crm.write",
    "team.read",
    "integration.read",
  ]),
  read_only: new Set([
    "workspace.read",
    "company.read",
    "crm.read",
    "team.read",
    "integration.read",
  ]),
};

const clean = (value: unknown) => String(value ?? "").trim();

function isHermesMembershipRole(value: unknown): value is HermesMembershipRole {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(ROLE_GRANTS, value);
}

export function isHermesPermissionAction(value: unknown): value is HermesPermissionAction {
  return new Set<string>([
    "workspace.read",
    "company.read",
    "company.settings.write",
    "crm.read",
    "crm.write",
    "team.read",
    "team.write",
    "integration.read",
    "integration.manage",
  ]).has(clean(value));
}

export function membershipMatchesHermesScope(
  membership: HermesMembership,
  request: HermesPermissionRequest,
) {
  if (membership.active !== true || !isHermesMembershipRole(membership.role)) return false;
  if (!clean(request.specialistId) || !clean(request.companyId)) return false;
  if (!clean(membership.specialistId) || !clean(membership.companyId)) return false;
  if (clean(membership.specialistId) !== clean(request.specialistId)) return false;
  if (clean(membership.companyId) !== clean(request.companyId)) return false;

  const membershipWorkspace = clean(membership.workspaceId);
  const requestWorkspace = clean(request.workspaceId);
  if (membershipWorkspace && membershipWorkspace !== requestWorkspace) return false;

  return true;
}

export type HermesPermissionDecision =
  | { allowed: true; role: HermesMembershipRole; reason: "role_grant" }
  | {
      allowed: false;
      reason:
        | "invalid_action"
        | "invalid_role"
        | "membership_inactive"
        | "identity_mismatch"
        | "company_scope_mismatch"
        | "workspace_scope_mismatch"
        | "role_denied";
    };

export function decideHermesPermission(
  membership: HermesMembership,
  request: Omit<HermesPermissionRequest, "action"> & { action: unknown },
): HermesPermissionDecision {
  if (!isHermesPermissionAction(request.action)) return { allowed: false, reason: "invalid_action" };
  if (membership.active !== true) return { allowed: false, reason: "membership_inactive" };
  if (!isHermesMembershipRole(membership.role)) return { allowed: false, reason: "invalid_role" };
  if (!clean(request.specialistId) || !clean(membership.specialistId)) {
    return { allowed: false, reason: "identity_mismatch" };
  }
  if (!clean(request.companyId) || !clean(membership.companyId)) {
    return { allowed: false, reason: "company_scope_mismatch" };
  }
  if (clean(membership.specialistId) !== clean(request.specialistId)) {
    return { allowed: false, reason: "identity_mismatch" };
  }
  if (clean(membership.companyId) !== clean(request.companyId)) {
    return { allowed: false, reason: "company_scope_mismatch" };
  }

  const membershipWorkspace = clean(membership.workspaceId);
  const requestWorkspace = clean(request.workspaceId);
  if (membershipWorkspace && membershipWorkspace !== requestWorkspace) {
    return { allowed: false, reason: "workspace_scope_mismatch" };
  }

  if (!ROLE_GRANTS[membership.role].has(request.action)) return { allowed: false, reason: "role_denied" };
  return { allowed: true, role: membership.role, reason: "role_grant" };
}

export const HERMES_CONSEQUENTIAL_ACTIONS_OUTSIDE_MEMBERSHIP_V1 = [
  "billing.change",
  "credential.manage",
  "ownership.transfer",
  "record.delete",
  "external.send",
  "production.release",
] as const;
