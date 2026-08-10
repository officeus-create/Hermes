import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, "config/payment-readiness.json"), "utf8"));
const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf8");

assert.equal(config.schema_version, 1, "Payment readiness schema_version must be 1.");
assert.equal(typeof config.payments_enabled, "boolean", "payments_enabled must be explicit.");

const technicalFiles = [];
const walk = (directory) => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(astro|html|js|mjs|ts|tsx|json)$/i.test(entry.name)) technicalFiles.push(absolute);
  }
};
walk(path.join(root, "src"));
walk(path.join(root, "public"));

const technicalSource = [packageJson, ...technicalFiles.map((file) => fs.readFileSync(file, "utf8"))].join("\n");
const paymentProviderFingerprints = [
  /js\.stripe\.com/i,
  /api\.stripe\.com/i,
  /@stripe\//i,
  /stripe\.checkout/i,
  /paypal\.com\/sdk\/js/i,
  /paypalobjects\.com/i,
  /braintree-web/i,
  /squareup\.com\/payments/i,
  /web\.squarecdn\.com\/v1\/square\.js/i,
  /checkout\.com\/frames/i,
  /checkout\.com\/flow/i,
  /adyen\.com\/checkout/i,
];

if (!config.payments_enabled) {
  for (const pattern of paymentProviderFingerprints) {
    assert.equal(pattern.test(technicalSource), false, `Payment provider integration found while payments_enabled=false: ${pattern}`);
  }
  for (const key of ["seller_entity", "offer_id", "payment_processor", "terms_of_sale_url", "refund_policy_url", "cancellation_policy_url", "approved_at", "approved_by"]) {
    assert.equal(config[key], null, `${key} must remain null while payments are disabled.`);
  }
} else {
  for (const key of ["seller_entity", "offer_id", "payment_processor", "terms_of_sale_url", "refund_policy_url", "cancellation_policy_url", "approved_at", "approved_by"]) {
    assert.equal(typeof config[key], "string", `${key} is required before payments can be enabled.`);
    assert.ok(config[key].trim().length > 0, `${key} cannot be empty when payments are enabled.`);
  }
  for (const key of ["terms_of_sale_url", "refund_policy_url", "cancellation_policy_url"]) {
    assert.match(config[key], /^\//, `${key} must point to a public site policy route.`);
  }
}

console.log(`Payment launch gate passed: payments are ${config.payments_enabled ? "approved for configured launch" : "disabled pending offer-specific approval"}.`);
