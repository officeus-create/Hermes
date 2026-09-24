import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const recovery = readFileSync("functions/api/internal/repair-shop-first5-recovery.ts", "utf8");
const workflow = readFileSync(".github/workflows/kittles-first5-activation.yml", "utf8");

assert.match(recovery, /verifyGitHubFirst5ActivationOidcToken/);
assert.match(recovery, /recover_kittles_garage_trial_provisioning_2026_09_24/);
assert.match(recovery, /provision_kittles_garage_trial_2026_09_23/);
assert.match(recovery, /const STALE_AFTER_MS = 2 \* 60 \* 1000/);
assert.match(recovery, /SELECT specialist_id,status,created_at,completed_at FROM hermes_first5_provisioning_receipts/);
assert.match(recovery, /WHERE operation_id=\? AND specialist_id=\? AND status='pending' AND created_at=\?/);
assert.match(recovery, /provisioning_lock_owner_mismatch/);
assert.match(recovery, /provisioning_lock_active/);
assert.match(recovery, /provisioning_recovery_readback_failed/);
assert.doesNotMatch(recovery, /INSERT INTO specialists|UPDATE specialists|DELETE FROM specialists|DELETE FROM repair_shops/);
assert.doesNotMatch(recovery, /password|tempPassword|hashPassword|password_hash|password_salt/);

assert.match(workflow, /github\.event\.comment\.body == '\/recover-kittles-provision'/);
assert.match(workflow, /\/api\/internal\/repair-shop-first5-recovery/);
assert.match(workflow, /recover_kittles_garage_trial_provisioning_2026_09_24/);
assert.match(workflow, /COMMAND="\/provision-kittles-trial"/);
assert.match(workflow, /contains\(fromJSON\('\["OWNER","MEMBER","COLLABORATOR"\]'\), github\.event\.comment\.author_association\)/);
assert.match(workflow, /OIDC_AUDIENCE: hermes-connect-first5-activation/);

console.log("Kittle First-5 stale provisioning recovery contract OK");
