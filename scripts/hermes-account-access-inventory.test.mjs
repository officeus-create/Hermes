import assert from "node:assert/strict";
import fs from "node:fs";
import { membershipRowAsPermission } from "../functions/api/_lib/company-memberships.mjs";

const account = fs.readFileSync(new URL("../functions/api/hermes-connect/account.ts", import.meta.url), "utf8");
const row = (overrides = {}) => ({
  id: "grant-1", business_ref: "company:dealer-1",
  workspace_ref: "dealer_crm:company:dealer-1",
  specialist_id: "specialist-1", role: "admin", active: 1,
  grant_source: "verified_owner_grant", granted_by: "specialist-owner",
  revoked_at: null, ...overrides,
});
assert.deepEqual(membershipRowAsPermission(row()), {
  specialistId: "specialist-1", companyId: "company:dealer-1",
  workspaceId: "dealer_crm:company:dealer-1",
  role: "admin", active: true,
  grantSource: "verified_owner_grant", membershipId: "grant-1",
});
for (const mutation of [
  { active: 0 }, { revoked_at: "2026-10-14T00:00:00Z" },
  { specialist_id: "specialist-owner" }, { role: "owner" },
  { role: "superadmin" }, { business_ref: "repair_shop:other" },
]) {
  assert.equal(membershipRowAsPermission(row(mutation)), null);
}
assert.match(account, /const specialist = await getAuthenticatedSpecialist\(request, env.DB\)/);
assert.match(account, /if \(!specialist\) return jsonResponse\(401/);
assert.match(account, /WHERE specialist_id = \? AND active = 1 AND revoked_at IS NULL/);
assert.match(account, /\.bind\(specialistId\)\.all\(\)/);
assert.match(account, /membership\.specialistId === specialistId/);
assert.match(account, /delegated_access: delegatedAccess/);
assert.doesNotMatch(account, /UPDATE hermes_company_memberships|INSERT INTO hermes_company_memberships/);
console.log("hermes-account-access-inventory: authenticated and scoped read-only delegation, revoked/self-grant/owner-text deny PASS");
