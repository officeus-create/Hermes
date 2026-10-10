import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../functions/api/hermes-connect/home-services/crm.ts", import.meta.url), "utf8");
const postStart = source.indexOf("export async function onRequestPost");
assert.ok(postStart >= 0, "POST handler missing");
const post = source.slice(postStart);

assert.match(
  post,
  /const ownerId = String\(ctx\.dataOwnerId \|\| ctx\.specialist\.id\);/,
  "managed POST must use the same canonical data owner as managed GET",
);
assert.doesNotMatch(
  post,
  /const ownerId = String\(ctx\.specialist\.id\);/,
  "POST must not collapse managed writes onto the authenticated operator identity",
);
assert.match(post, /id,ownerId,companyId,value\.source/);
assert.match(post, /WHERE id=\? AND owner_specialist_id=\?/);
assert.match(post, /bind\(id,ownerId\)\.first\(\)/);

const managedEndpoint = readFileSync(new URL("../functions/api/internal/mzm-managed-client.ts", import.meta.url), "utf8");
const managedWorkflow = readFileSync(new URL("../.github/workflows/mzm-managed-client.yml", import.meta.url), "utf8");

assert.match(managedEndpoint, /company_id=\? AND owner_specialist_id<>\?/);
assert.match(managedEndpoint, /managed_data_owner_mismatch_records/);
assert.match(managedEndpoint, /preflightManagedOwnerMismatchRecords/);
assert.match(managedEndpoint, /managed_owner_mismatch_records: preflightManagedOwnerMismatchRecords/);
assert.match(managedEndpoint, /managed_owner_mismatch_records: managedOwnerMismatchRecords/);
assert.ok(
  managedEndpoint.indexOf("preflightManagedOwnerMismatchRecords") < managedEndpoint.indexOf("INSERT INTO hermes_company_profiles"),
  "managed owner mismatch must fail closed before provisioning writes",
);
assert.match(managedWorkflow, /OWNER_MISMATCH/);
assert.match(managedWorkflow, /managed_data_owner_mismatch_records/);
assert.match(managedWorkflow, /zero mismatched profile\/lead records/);

console.log("home-service-managed-write-owner: ok");
