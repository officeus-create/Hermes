import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const workflowUrl = new URL("../.github/workflows/repair-access-state-production-proof.yml", import.meta.url);
const proofUrl = new URL("./repair-shop-access-state-production-proof.sh", import.meta.url);
const [workflow, proof] = await Promise.all([
  readFile(workflowUrl, "utf8"),
  readFile(proofUrl, "utf8"),
]);

// Shell syntax is part of the release contract, not something to discover in production.
execFileSync("bash", ["-n", fileURLToPath(proofUrl)], { stdio: "pipe" });

// Consequential production writes must remain explicitly owner-authorized.
assert.match(workflow, /issue_comment:/);
assert.match(workflow, /github\.event\.issue\.number == 960/);
assert.match(workflow, /github\.event\.comment\.body == '\/verify-repair-access-state'/);
assert.match(workflow, /OWNER.*MEMBER.*COLLABORATOR/);
assert.match(workflow, /environment:\s*production/);
assert.doesNotMatch(workflow, /\bpush:/);
assert.doesNotMatch(workflow, /workflow_dispatch:/);

// D1 writes require their own scoped credential; Pages read may reuse the existing deploy credential.
assert.match(workflow, /CLOUDFLARE_D1_API_TOKEN:\s*\$\{\{ secrets\.CLOUDFLARE_D1_API_TOKEN \}\}/);
assert.match(workflow, /CLOUDFLARE_PAGES_API_TOKEN:/);
assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID:/);
assert.match(workflow, /continue-on-error:\s*true/);
assert.match(workflow, /privacy-safe classification/);
assert.match(workflow, /Do not claim paid\/manual activation operationally proven/);

// Exact-main + successful controlled deploy are mandatory before any synthetic production write.
assert.match(proof, /CURRENT_MAIN=.*branches\/main/);
assert.match(proof, /CURRENT_MAIN.*TARGET_SHA/s);
assert.match(proof, /cloudflare-pages-production-v2\.yml\/runs/);
assert.match(proof, /run\?\.head_sha === sha/);
assert.match(proof, /run\?\.conclusion === "success"/);
assert.match(proof, /production_parity_required/);
const parityGateIndex = proof.indexOf('fail_classified "production_parity_required"');
const firstSyntheticMutationIndex = proof.indexOf('PRE_CLEAN="$(curl');
assert.ok(parityGateIndex >= 0 && firstSyntheticMutationIndex > parityGateIndex, "No production mutation may precede exact-main parity proof.");

// Discover the existing production D1 binding at runtime; never carry a database id in the repository.
assert.match(proof, /pages\/projects\/hermes/);
assert.match(proof, /deployment_configs\.production\.d1_databases\.DB\.id/);
assert.match(proof, /::add-mask::\$DB_ID/);
assert.doesNotMatch(proof, /database_id\s*[=:]\s*["'][0-9a-f-]{20,}["']/i);

// The proof must stay deadline-safe without weakening real Shop Owner registration policy.
assert.doesNotMatch(proof, /\/api\/auth\/register/);
assert.match(proof, /INSERT INTO specialists/);
assert.match(proof, /params:\[\$id,\$email,\$hash,\$salt/);
assert.match(proof, /repair-booking-production-smoke@hermesconnect\.app/);
assert.match(proof, /\/api\/auth\/login/);
assert.match(proof, /hashPassword/);

// Commercial transition is bounded to the generated synthetic shop id and parameterized D1 SQL.
assert.match(proof, /INSERT INTO repair_shop_access/);
assert.match(proof, /access_state = 'founding'/);
assert.match(proof, /repair_shop_founding/);
assert.match(proof, /params:\[\$shop,\$now,\$now\]/);
assert.match(proof, /SELECT access_state,plan_id FROM repair_shop_access WHERE shop_id = \?/);
assert.match(proof, /\/api\/repair-shop\/access/);
assert.match(proof, /owner_founding_readback_failed/);

// Synthetic state must be cleaned and independently read back as absent.
assert.match(proof, /\/api\/repair-shop\/cleanup-booking-smoke/);
assert.match(proof, /SELECT COUNT\(\*\) AS count FROM repair_shop_access WHERE shop_id = \?/);
assert.match(proof, /cleanup_readback_failed/);
assert.match(proof, /stale_main_after_proof/);
assert.match(proof, /FINAL_REPAIR_ACCESS_STATE_PRODUCTION_VERDICT=PASS/);

console.log("Repair Shop production access-state proof contract passed.");
