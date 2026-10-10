import { parseBusinessRef } from "./business-identity.mjs";

const MEMBERSHIP_ROLES = new Set(["admin", "member", "read_only"]);
const CLEAN_RE = /[<>\u0000-\u001f\u007f]/g;
const GRANT_SOURCE_RE = /^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,239}$/;
const WORKSPACE_REF_RE = /^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,219}$/;
const clean = (value, max = 240) => String(value ?? "").replace(CLEAN_RE, "").trim().slice(0, max);

export async function ensureCompanyMembershipSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_company_memberships (
      id TEXT PRIMARY KEY,
      business_ref TEXT NOT NULL,
      workspace_ref TEXT,
      specialist_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','member','read_only')),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
      grant_source TEXT NOT NULL,
      granted_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      revoked_at TEXT,
      revoked_by TEXT,
      CHECK (specialist_id <> granted_by)
    )
  `).run();
  await db.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_hermes_company_membership_subject_scope
    ON hermes_company_memberships(specialist_id, business_ref)
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_hermes_company_membership_active_scope
    ON hermes_company_memberships(business_ref, active, specialist_id)
  `).run();
}

export function membershipRowAsPermission(row) {
  if (!row) return null;
  const parsed = parseBusinessRef(row.business_ref);
  const role = clean(row.role, 40);
  const specialistId = clean(row.specialist_id, 180);
  const workspaceRef = clean(row.workspace_ref, 220);
  const grantSource = clean(row.grant_source, 240);
  const grantedBy = clean(row.granted_by, 180);
  if (!parsed || parsed.namespace !== "company") return null;
  if (workspaceRef && !WORKSPACE_REF_RE.test(workspaceRef)) return null;
  if (!MEMBERSHIP_ROLES.has(role)) return null;
  if (!specialistId || !GRANT_SOURCE_RE.test(grantSource) || !grantedBy || grantedBy === specialistId) return null;
  if (Number(row.active) !== 1 || row.revoked_at) return null;
  return {
    specialistId,
    companyId: parsed.ref,
    ...(workspaceRef ? { workspaceId: workspaceRef } : {}),
    role,
    active: true,
    grantSource,
    membershipId: clean(row.id, 180),
  };
}

export async function getActiveCompanyMembership(db, { specialistId, businessRef }) {
  await ensureCompanyMembershipSchema(db);
  const actor = clean(specialistId, 180);
  const parsed = parseBusinessRef(businessRef);
  if (!actor || !parsed || parsed.namespace !== "company") return null;

  const row = await db.prepare(`
    SELECT id,business_ref,workspace_ref,specialist_id,role,active,grant_source,granted_by,created_at,updated_at,revoked_at,revoked_by
    FROM hermes_company_memberships
    WHERE specialist_id = ? AND business_ref = ? AND active = 1 AND revoked_at IS NULL
    LIMIT 1
  `).bind(actor, parsed.ref).first();

  return membershipRowAsPermission(row);
}
