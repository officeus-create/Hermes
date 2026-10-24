import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const policy = JSON.parse(readFileSync(new URL("../workers/automation-engine/capability-policy.json", import.meta.url), "utf8"));
const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const historical = readFileSync(new URL("../workers/automation-engine/src/historical-learning.mjs", import.meta.url), "utf8");

function quotedStrings(block) {
  return [...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

const directBlock = worker.match(/const READ_ONLY_GENERIC_JOB_TYPES = new Set\(\[([\s\S]*?)\]\);/);
assert.ok(directBlock, "READ_ONLY_GENERIC_JOB_TYPES registry must exist");
const directTypes = quotedStrings(directBlock[1]).filter((value) => value.includes("."));

const historicalBlock = historical.match(/export const HISTORICAL_READ_ONLY_JOB_TYPES = Object\.freeze\(\[([\s\S]*?)\]\);/);
assert.ok(historicalBlock, "HISTORICAL_READ_ONLY_JOB_TYPES registry must exist");
const historicalTypes = quotedStrings(historicalBlock[1]);

const runtimeTypes = [...new Set([...directTypes, ...historicalTypes])].sort();
const manifestTypes = policy.capabilities.map((entry) => entry.job_type).sort();

assert.equal(policy.schema_version, 1);
assert.equal(policy.default_decision, "DENY", "Capability policy must fail closed");
assert.equal(policy.runtime, "hermes-automation-engine");
assert.equal(policy.authoritative_state, "D1");
assert.equal(policy.transport, "Cloudflare Queue");
assert.deepEqual(manifestTypes, runtimeTypes, "Machine-readable policy must cover the exact current generic allowlist");

const seen = new Set();
for (const capability of policy.capabilities) {
  assert.ok(capability.job_type && !seen.has(capability.job_type), `Duplicate/blank job_type: ${capability.job_type}`);
  seen.add(capability.job_type);
  assert.equal(capability.permission_class, "READ_ONLY", `Current generic capability must remain READ_ONLY: ${capability.job_type}`);
  assert.equal(capability.external_provider_write, false, `Current capability must not write providers: ${capability.job_type}`);
  assert.deepEqual(capability.allowed_side_effects, ["d1_job_state", "d1_job_events"]);
  assert.equal(capability.submission_auth, "HERMES_AUTOMATION_TOKEN");
  assert.equal(capability.retention_class, "technical_runtime_evidence");
}

const serialized = JSON.stringify(policy);
for (const forbidden of ["social.publish", "email.send", "gmail.send", "telegram.send", "provider.publish"]) {
  assert.ok(!serialized.includes(forbidden), `Write capability leaked into read-only policy: ${forbidden}`);
}
assert.ok(!/(api[_-]?key|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}/i.test(serialized), "Policy must not contain credential values");

assert.equal(policy.permission_classes.READ_ONLY.external_write_allowed, false);
assert.equal(policy.permission_classes.DRAFT_ONLY.external_write_allowed, false);
assert.equal(policy.permission_classes.EXTERNAL_WRITE.owner_review_required_before_execution, true);
assert.equal(policy.permission_classes.DESTRUCTIVE.destructive_allowed, true);

console.log(`HAE capability policy contract PASS: ${manifestTypes.length} current read-only capabilities; default DENY`);
