import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const read = path => fs.readFileSync(new URL("../"+path, import.meta.url), "utf8");
const api = read("functions/api/load-board/owner-role-preview.ts");
const page = read("src/pages/services/hermes-connect/load-board/role-preview/index.astro");
const script = read("public/scripts/workspaces/owner-role-preview.js");
for(const phrase of ["getAuthenticatedSpecialist", "roleReviewAccess", "role_review_access_required",
  "roleSwitchGrantsPermissions: false", "messagesSent: false", "bookingsCreated: false",
  "last_successful_sync", "sourceRegistryRestricted:!reviewAccess.owner"]) {
  assert(api.includes(phrase), "Missing preview API requirement: " + phrase);
}
assert(page.includes('robots="noindex,nofollow"'));
for(const role of ["carrier", "dispatcher", "dealer", "broker", "sources"])
  assert(page.includes('data-preview-role="'+role+'"'), "Missing role: " + role);
assert(script.includes("response.status===403"));
assert(script.includes("textContent"));
assert(!script.includes(".innerHTML"));
assert(!api.includes("onRequestPost"));
const reviewerApi=read("functions/api/load-board/role-review.ts");
const accessApi=read("functions/api/load-board/reviewer-access.ts");
const helper=read("functions/api/_lib/load-board-role-review.mjs");
assert.match(reviewerApi,/roleReviewAccess/);
assert.match(reviewerApi,/reviewer_specialist_id/);
assert.match(reviewerApi,/sameOriginRoleReview/);
assert.match(accessApi,/specialistHasInternalOwnerCapability/);
assert.match(accessApi,/mailboxOwnershipVerified/);
assert.match(accessApi,/internalOwnerGranted:false/);
assert.match(helper,/reviewers/);
assert(!helper.includes("dispatchtruck107@gmail.com"), "No hard-coded shared reviewer email.");
assert(!accessApi.includes("HL 40 Branch"), "Never store plaintext shared credentials.");
assert(script.includes("role-review-form"));
assert(script.includes("loadFeedback(role)"));
assert(reviewerApi.includes("identity.access.owner || r.account_email===identity.specialist.email"));
assert(script.includes('item.accountEmail ? item.authorLabel'));
assert(page.includes('role-review-form'));
execFileSync(process.execPath, ["--check", new URL("../public/scripts/workspaces/owner-role-preview.js",import.meta.url).pathname]);
console.log("Hermes owner role preview: contract passed");
