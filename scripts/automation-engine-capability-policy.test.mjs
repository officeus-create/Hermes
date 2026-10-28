import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const policy = JSON.parse(readFileSync(new URL("../workers/automation-engine/capability-policy.json", import.meta.url), "utf8"));
const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const historical = readFileSync(new URL("../workers/automation-engine/src/historical-learning.mjs", import.meta.url), "utf8");
const roleContracts = await import("../workers/automation-engine/src/role-contracts.mjs");

function quotedStrings(block) {
  return [...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

const directBlock = worker.match(/const READ_ONLY_GENERIC_JOB_TYPES = new Set\(\[([\s\S]*?)\]\);/);
assert.ok(directBlock, "READ_ONLY_GENERIC_JOB_TYPES registry must exist");
const directTypes = quotedStrings(directBlock[1]).filter((value) => value.includes("."));

const historicalBlock = historical.match(/export const HISTORICAL_READ_ONLY_JOB_TYPES = Object\.freeze\(\[([\s\S]*?)\]\);/);
assert.ok(historicalBlock, "HISTORICAL_READ_ONLY_JOB_TYPES registry must exist");
const historicalTypes = quotedStrings(historicalBlock[1]);

const runtimeTypes = [...new Set([...directTypes, ...historicalTypes, ...roleContracts.ROLE_CONTRACT_JOB_TYPES])].sort();
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
  assert.ok(["technical_runtime_evidence", "business_runtime_evidence"].includes(capability.retention_class));
  if (roleContracts.ROLE_CONTRACT_JOB_TYPES.includes(capability.job_type)) {
    const contract = roleContracts.roleContractForJobType(capability.job_type);
    assert.ok(contract, `Missing role contract for ${capability.job_type}`);
    assert.equal(capability.role_id, contract.role_id);
    assert.equal(capability.plugin_version, contract.plugin_version);
    assert.equal(capability.contract_version, contract.contract_version);
    assert.equal(capability.semantic_required, contract.semantic_required);
    assert.equal(capability.free_ai_policy, contract.free_ai_policy);
  }
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

const futureRules = policy.future_capability_gate.rules.join("\n");
assert.match(futureRules, /authenticated runtime evidence and independent QA/, "External-write gate must build on accepted authenticated read-only evidence");
assert.match(futureRules, /separate owner-approved write gate/, "Every external-write capability needs a separate owner-approved gate");
assert.ok(!futureRules.includes("read-only reliability gate is LIVE_VERIFIED"), "Do not force a false LIVE_VERIFIED promotion just to unlock future write review");
assert.match(futureRules, /bind role_id, plugin_version, contract_version and SHA-256/, "Plugin-derived jobs must freeze a role-contract identity at enqueue time");
assert.match(futureRules, /no automatic paid fallback/i, "Free-first policy must prohibit automatic paid inference fallback");
assert.match(futureRules, /WAITING_FREE_AI/, "Free semantic capacity exhaustion must be a durable wait state");
assert.match(futureRules, /paid provider endpoints must never be admitted/i, "Open weights must not turn a paid API endpoint into a free provider");

console.log(`HAE capability policy contract PASS: ${manifestTypes.length} current read-only capabilities; default DENY`);
