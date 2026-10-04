import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const workflowUrl = new URL("../.github/workflows/repair-access-state-production-proof.yml", import.meta.url);
const proofUrl = new URL("./repair-shop-access-state-production-proof.sh", import.meta.url);
const endpointUrl = new URL("../functions/api/internal/repair-shop-access-proof.ts", import.meta.url);
const [workflow, proof, endpoint] = await Promise.all([
  readFile(workflowUrl, "utf8"),
  readFile(proofUrl, "utf8"),
  readFile(endpointUrl, "utf8"),
]);

execFileSync("bash", ["-n", fileURLToPath(proofUrl)], { stdio: "pipe" });

assert.match(workflow, /issue_comment:/);
assert.match(workflow, /github\.event\.issue\.number == 960/);
assert.match(workflow, /github\.event\.comment\.body == '\/verify-repair-access-state'/);
assert.match(workflow, /author_association == 'OWNER'/);
assert.match(workflow, /environment:\s*production/);
assert.match(workflow, /group:\s*repair-access-state-production-proof/);
assert.match(workflow, /cancel-in-progress:\s*false/);
assert.match(workflow, /id-token:\s*write/);
assert.match(workflow, /OIDC_AUDIENCE:\s*hermes-connect-repair-access-proof/);
assert.doesNotMatch(workflow, /\bpush:/);
assert.doesNotMatch(workflow, /workflow_dispatch:/);
assert.doesNotMatch(workflow, /CLOUDFLARE_(?:PAGES|D1)_API_TOKEN|CLOUDFLARE_ACCOUNT_ID/);
assert.match(workflow, /continue-on-error:\s*true/);
assert.match(workflow, /privacy-safe classification/);
assert.match(workflow, /Do not claim paid\/manual activation operationally proven/);

assert.match(proof, /CURRENT_MAIN=.*branches\/main/);
assert.match(proof, /CURRENT_MAIN.*TARGET_SHA/s);
assert.match(proof, /cloudflare-pages-production-v2\.yml\/runs/);
assert.match(proof, /run\?\.head_sha === sha/);
assert.match(proof, /run\?\.conclusion === "success"/);
assert.match(proof, /production_parity_required/);
assert.doesNotMatch(proof, /api\.cloudflare\.com|CLOUDFLARE_(?:PAGES|D1)_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|pages\/projects\/hermes/);

assert.match(proof, /\/api\/internal\/repair-shop-access-proof/);
assert.match(proof, /Authorization: Bearer \$OIDC_TOKEN/);
assert.match(proof, /\/api\/auth\/login/);
assert.match(proof, /hashPassword/);
assert.ok(proof.includes("randomBytes(24)"), "synthetic proof password must be generated ephemerally at runtime");
assert.doesNotMatch(proof, /\/api\/auth\/register/);
assert.doesNotMatch(proof, /\/api\/repair-shop\/profile/);
assert.match(proof, /trialing_readback_failed/);
assert.match(proof, /stale_main_before_transition/);
assert.match(proof, /owner_founding_readback_failed/);
assert.match(proof, /d1_founding_readback_failed/);
assert.match(proof, /synthetic_cleanup_failed/);
assert.match(proof, /stale_main_after_proof/);
assert.match(proof, /FINAL_REPAIR_ACCESS_STATE_PRODUCTION_VERDICT=PASS/);

assert.match(endpoint, /verifyGitHubRepairAccessProofOidcToken/);
assert.match(endpoint, /repair_access_state_proof_2026_10_04/);
assert.match(endpoint, /hermes_registration_flags/);
assert.match(endpoint, /synthetic=1/);
assert.match(endpoint, /INSERT INTO specialists/);
assert.match(endpoint, /INSERT INTO repair_shops/);
assert.match(endpoint, /INSERT INTO repair_shop_access/);
assert.match(endpoint, /access_state='founding'/);
assert.match(endpoint, /SELECT access_state, plan_id/);
assert.match(endpoint, /DELETE FROM repair_shop_access WHERE shop_id = \?/);
assert.match(endpoint, /DELETE FROM sessions WHERE specialist_id = \?/);
assert.match(endpoint, /DELETE FROM repair_shops WHERE id = \? AND owner_specialist_id = \?/);
assert.match(endpoint, /DELETE FROM specialists WHERE id = \? AND email = \?/);
assert.match(endpoint, /remaining:/);
assert.doesNotMatch(endpoint, /CLOUDFLARE_|api\.cloudflare\.com/);

console.log("Repair Shop production access-state OIDC proof contract passed.");
