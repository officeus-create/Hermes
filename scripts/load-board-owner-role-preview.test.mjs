import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const read = path => fs.readFileSync(new URL("../"+path, import.meta.url), "utf8");
const api = read("functions/api/load-board/owner-role-preview.ts");
const page = read("src/pages/services/hermes-connect/load-board/role-preview/index.astro");
const script = read("public/scripts/workspaces/owner-role-preview.js");
for(const phrase of ["getAuthenticatedSpecialist", "specialistHasInternalOwnerCapability", "internal_owner_access_required",
  "roleSwitchGrantsPermissions: false", "messagesSent: false", "bookingsCreated: false", "last_successful_sync"]) {
  assert(api.includes(phrase), "Missing preview API requirement: " + phrase);
}
assert(page.includes('robots="noindex,nofollow"'));
for(const role of ["carrier", "dispatcher", "dealer", "broker", "sources"])
  assert(page.includes('data-preview-role="'+role+'"'), "Missing role: " + role);
assert(script.includes("response.status===403"));
assert(script.includes("textContent"));
assert(!script.includes(".innerHTML"));
assert(!api.includes("onRequestPost"));
execFileSync(process.execPath, ["--check", new URL("../public/scripts/workspaces/owner-role-preview.js",import.meta.url).pathname]);
console.log("Hermes owner role preview: contract passed");
