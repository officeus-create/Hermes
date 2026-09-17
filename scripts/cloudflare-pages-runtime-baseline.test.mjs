import assert from "node:assert/strict";
import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync("config/cloudflare-pages-runtime-baseline.json", "utf8"));
const example = JSON.parse(fs.readFileSync("wrangler.jsonc.example", "utf8"));

assert.equal(baseline.project, "hermes");
assert.equal(baseline.production.target_compatibility_date, "2026-08-04");
assert.equal(baseline.preview.observed_compatibility_date, "2026-08-04");
assert.equal(baseline.preview.target_compatibility_date, "2026-08-04");
assert.equal(baseline.production.text_vars.LEAD_DELIVERY_MODE, "live");
assert.equal(baseline.preview.text_vars.LEAD_DELIVERY_MODE, "off");
assert.equal(baseline.production.bindings.kv.LEAD_LIMITS, "HERMES_LEAD_LIMITS_PRODUCTION");
assert.equal(baseline.preview.bindings.kv.LEAD_LIMITS, "HERMES_LEAD_LIMITS_PREVIEW");
assert.equal(baseline.production.bindings.d1.DB, "hermes-connect-prototype");
assert.deepEqual(baseline.preview.bindings.d1, {});
assert.equal(baseline.production.bindings.services.LEAD_EMAIL_SERVICE, "hermes-lead-email");
assert.deepEqual(baseline.preview.bindings.services, {});
assert.equal(baseline.policy.active_root_wrangler_config_committed, false);
assert.equal(baseline.policy.preview_must_not_gain_production_d1, true);
assert.equal(baseline.policy.preview_must_not_gain_lead_email_service, true);
assert.equal(baseline.policy.secret_values_must_not_be_versioned, true);
assert.equal(example.compatibility_date, baseline.preview.target_compatibility_date);
assert.equal(example.name, baseline.project);
assert.equal(example.pages_build_output_dir, "dist");
assert.deepEqual(example.vars, baseline.preview.text_vars, "The public root example must model fail-closed Preview vars, not Production delivery mode.");
assert.deepEqual((example.kv_namespaces ?? []).map((entry) => entry.binding), Object.keys(baseline.preview.bindings.kv));
assert.equal("d1_databases" in example, false, "The public root example must not bind Production D1 into generic Preview.");
assert.equal("services" in example, false, "The public root example must not bind LEAD_EMAIL_SERVICE into generic Preview.");

for (const environment of [baseline.production, baseline.preview]) {
  for (const secretName of environment.secret_names) {
    assert.match(secretName, /^[A-Z0-9_]+$/);
  }
  assert.equal("secret_values" in environment, false, "Runtime baseline must never version secret values.");
}

assert.equal(fs.existsSync("wrangler.jsonc"), false, "Do not activate root Wrangler config before the reviewed ownership migration.");
assert.equal(fs.existsSync("wrangler.toml"), false, "Do not activate root Wrangler config before the reviewed ownership migration.");

console.log("Cloudflare Pages runtime baseline contract passed.");
