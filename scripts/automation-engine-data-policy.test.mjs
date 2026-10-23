import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const capabilities = JSON.parse(readFileSync(new URL("../workers/automation-engine/capability-policy.json", import.meta.url), "utf8"));
const dataPolicy = JSON.parse(readFileSync(new URL("../workers/automation-engine/data-policy.json", import.meta.url), "utf8"));

assert.equal(dataPolicy.schema_version, 1);
assert.equal(dataPolicy.default, "DENY_UNCLASSIFIED_DATA");

for (const capability of capabilities.capabilities) {
  const policy = dataPolicy.classes[capability.retention_class];
  assert.ok(policy, `Missing data policy class for ${capability.job_type}: ${capability.retention_class}`);
  assert.equal(policy.secret_allowed, false, `Secrets must be forbidden for ${capability.job_type}`);
  if (policy.pii_allowed === true) {
    assert.ok(Number.isInteger(policy.retention_days) && policy.retention_days > 0, `PII class requires finite retention_days: ${capability.retention_class}`);
    assert.ok(String(policy.deletion_path || "").trim(), `PII class requires deletion path: ${capability.retention_class}`);
  }
}

const serialized = JSON.stringify(dataPolicy);
assert.ok(!/(sk-[A-Za-z0-9]|bearer\s+[A-Za-z0-9])/i.test(serialized), "Data policy must not contain credential-like values");

console.log("HAE data/retention policy contract PASS");
