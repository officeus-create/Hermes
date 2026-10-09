import { parseBusinessRef } from "./business-identity.mjs";
import {
  decideHermesPermission,
  type HermesMembershipRole,
  type HermesPermissionAction,
} from "../../../src/lib/hermes-connect-permissions";

const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");
const WORKSPACE_REF_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;
const GRANT_SOURCE_RE = /^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,159}$/;
const DELEGATED_ROLES = new Set<HermesMembershipRole>(["admin", "member", "read_only"]);

const clean = (value: unknown, max = 180) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

export const BEAUTY_SALON_WORKSPACE_REF = "beauty_salon";

export type HermesDelegatedMembership = {
  id: string;
  business_ref: string;
  workspace_ref: string;
  specialist_id: string;
  role: Exclude<HermesMembershipRole, "owner">;
  active: true;
  granted_by_specialist_id: string;
  grant_source: string;
  created_at?: string | null;
  updated_at?: string | null;
  revoked_at?: string | null;
};

export function normalizeHermesDelegatedMembershipGrant(input: Record<string, unknown> = {}) {
  const business = parseBusinessRef(input.business_ref);
  const workspaceRef = clean(input.workspace_ref, 160);
  const specialistId = clean(input.specialist_id, 160);
  const role = clean(input.role, 40) as HermesMembershipRole;
  const grantedBy = clean(input.granted_by_specialist_id, 160);
  const grantSource = clean(input.grant_source, 160);

  if (!business || !WORKSPACE_REF_RE.test(workspaceRef)) return null;
  if (!specialistId || !grantedBy || specialistId === grantedBy) return null;
  if (!DELEGATED_ROLES.has(role)) return null;
  if (!GRANT_SOURCE_RE.test(grantSource)) return null;
  if (input.active !== true) return null;

  return {
    business_ref: business.ref,
    workspace_ref: workspaceRef,
    specialist_id: specialistId,
    role: role as Exclude<HermesMembershipRole, "owner">,
    active: true as const,
    granted_by_specialist_id: grantedBy,
    grant_source: grantSource,
  };
}

function safeMembershipRow(row: any): HermesDelegatedMembership | null {
  const business = parseBusinessRef(row?.business_ref);
  const workspaceRef = clean(row?.workspace_ref, 160);
  const specialistId = clean(row?.specialist_id, 160);
  const role = clean(row?.role, 40) as HermesMembershipRole;
  const grantedBy = clean(row?.granted_by_specialist_id, 160);
  const grantSource = clean(row?.grant_source, 160);
  if (!business || !WORKSPACE_REF_RE.test(workspaceRef)) return null;
  if (!specialistId || !grantedBy || !DELEGATED_ROLES.has(role)) return null;
  if (!GRANT_SOURCE_RE.test(grantSource) || Number(row?.active) !== 1) return null;
  return {
    id: clean(row?.id, 160),
    business_ref: business.ref,
    workspace_ref: workspaceRef,
    specialist_id: specialistId,
    role: role as Exclude<HermesMembershipRole, "owner">,
    active: true,
    granted_by_specialist_id: grantedBy,
    grant_source: grantSource,
    created_at: row?.created_at || null,
    updated_at: row?.updated_at || null,
    revoked_at: row?.revoked_at || null,
  };
}

export async function ensureHermesWorkspaceMembershipSchema(db: any) {
  await db.prepare([
    "CREATE TABLE IF NOT EXISTS hermes_workspace_memberships (",
    "id TEXT PRIMARY KEY,",
    "business_ref TEXT NOT NULL,",
    "workspace_ref TEXT NOT NULL,",
    "specialist_id TEXT NOT NULL,",
    "role TEXT NOT NULL CHECK (role IN ('admin','member','read_only')),",
    "active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),",
    "granted_by_specialist_id TEXT NOT NULL,",
    "grant_source TEXT NOT NULL,",
    "created_at TEXT NOT NULL,",
    "updated_at TEXT NOT NULL,",
    "revoked_at TEXT,",
    "UNIQUE(business_ref, workspace_ref, specialist_id)",
    ")",
  ].join("\n")).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hermes_workspace_membership_actor ON hermes_workspace_memberships(specialist_id,active,business_ref,workspace_ref)",
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hermes_workspace_membership_business ON hermes_workspace_memberships(business_ref,workspace_ref,active)",
  ).run();
}

export async function getHermesWorkspaceMembership(
  db: any,
  specialistId: string,
  businessRef: string,
  workspaceRef: string,
) {
  const business = parseBusinessRef(businessRef);
  const actor = clean(specialistId, 160);
  const workspace = clean(workspaceRef, 160);
  if (!business || !actor || !WORKSPACE_REF_RE.test(workspace)) return null;
  await ensureHermesWorkspaceMembershipSchema(db);
  const row = await db.prepare([
    "SELECT id,business_ref,workspace_ref,specialist_id,role,active,granted_by_specialist_id,grant_source,created_at,updated_at,revoked_at",
    "FROM hermes_workspace_memberships",
    "WHERE specialist_id=? AND business_ref=? AND workspace_ref=? AND active=1",
    "LIMIT 1",
  ].join(" ")).bind(actor, business.ref, workspace).first();
  return safeMembershipRow(row);
}

export async function listHermesWorkspaceMemberships(db: any, specialistId: string) {
  const actor = clean(specialistId, 160);
  if (!actor) return [];
  await ensureHermesWorkspaceMembershipSchema(db);
  const result = await db.prepare([
    "SELECT id,business_ref,workspace_ref,specialist_id,role,active,granted_by_specialist_id,grant_source,created_at,updated_at,revoked_at",
    "FROM hermes_workspace_memberships",
    "WHERE specialist_id=? AND active=1",
    "ORDER BY created_at ASC",
  ].join(" ")).bind(actor).all();
  return (result?.results || []).map(safeMembershipRow).filter(Boolean);
}

export function decideHermesBusinessAccess(input: {
  specialistId: string;
  businessRef: string;
  workspaceRef: string;
  action: HermesPermissionAction;
  ownerSpecialistId?: string | null;
  delegatedMembership?: HermesDelegatedMembership | null;
}) {
  const business = parseBusinessRef(input.businessRef);
  const specialistId = clean(input.specialistId, 160);
  const workspaceRef = clean(input.workspaceRef, 160);
  if (!business || !specialistId || !WORKSPACE_REF_RE.test(workspaceRef)) {
    return { allowed: false as const, reason: "invalid_scope", source: "none" as const };
  }

  if (clean(input.ownerSpecialistId, 160) === specialistId) {
    const decision = decideHermesPermission(
      { specialistId, companyId: business.ref, workspaceId: workspaceRef, role: "owner", active: true },
      { specialistId, companyId: business.ref, workspaceId: workspaceRef, action: input.action },
    );
    return decision.allowed
      ? { ...decision, source: "owner_adapter" as const, business_ref: business.ref, workspace_ref: workspaceRef }
      : { ...decision, source: "owner_adapter" as const };
  }

  const membership = input.delegatedMembership;
  if (!membership) return { allowed: false as const, reason: "membership_missing", source: "none" as const };
  const decision = decideHermesPermission(
    {
      specialistId: membership.specialist_id,
      companyId: membership.business_ref,
      workspaceId: membership.workspace_ref,
      role: membership.role,
      active: membership.active,
    },
    { specialistId, companyId: business.ref, workspaceId: workspaceRef, action: input.action },
  );
  return decision.allowed
    ? {
        ...decision,
        source: "delegated_membership" as const,
        business_ref: business.ref,
        workspace_ref: workspaceRef,
        membership_id: membership.id,
        grant_source: membership.grant_source,
      }
    : { ...decision, source: "delegated_membership" as const };
}

export async function resolveHermesBusinessAccess(
  db: any,
  input: {
    specialistId: string;
    businessRef: string;
    workspaceRef: string;
    action: HermesPermissionAction;
    ownerSpecialistId?: string | null;
  },
) {
  if (clean(input.ownerSpecialistId, 160) === clean(input.specialistId, 160)) {
    return decideHermesBusinessAccess(input);
  }
  const membership = await getHermesWorkspaceMembership(
    db,
    input.specialistId,
    input.businessRef,
    input.workspaceRef,
  );
  return decideHermesBusinessAccess({ ...input, delegatedMembership: membership });
}
