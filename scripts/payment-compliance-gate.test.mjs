import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "docs/compliance/payment-compliance.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

assert.equal(manifest.schema_version, 1, "Payment compliance manifest schema_version must remain explicit.");
assert.equal(typeof manifest.payments_enabled, "boolean", "Payment manifest must declare payments_enabled as a boolean.");
assert.equal(typeof manifest.recurring_billing_enabled, "boolean", "Payment manifest must declare recurring_billing_enabled as a boolean.");
assert.ok(Array.isArray(manifest.approved_offers), "Payment manifest must include approved_offers.");

const sourceFiles = [];
const walk = (directory) => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(astro|html|js|jsx|mjs|cjs|ts|tsx)$/i.test(entry.name)) sourceFiles.push(absolute);
  }
};
walk(path.join(root, "src"));
walk(path.join(root, "public"));

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const packageNames = Object.keys({
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
});

const providerPackagePattern = /^(?:stripe|@stripe\/|@paypal\/|@paddle\/|@square\/web-payments-sdk|@adyen\/|braintree)/i;
const paymentSourceSignals = [
  ["Stripe hosted JavaScript", /https:\/\/js\.stripe\.com\/v3\/?/i],
  ["Stripe package/import", /(?:from\s+["']stripe["']|require\(["']stripe["']\)|@stripe\/stripe-js)/i],
  ["Stripe Checkout Session", /checkout\.sessions\.create\s*\(/i],
  ["Stripe Payment Intent", /paymentIntents\.create\s*\(|payment_intents/i],
  ["Stripe subscription creation", /subscriptions\.create\s*\(/i],
  ["PayPal SDK", /https:\/\/www\.paypal\.com\/sdk\/js/i],
  ["PayPal package", /@paypal\/paypal-js/i],
  ["PayPal Buttons", /paypal\.Buttons\s*\(/i],
  ["PayPal subscription creation", /createSubscription\s*[:(]/i],
  ["Paddle checkout", /(?:cdn\.paddle\.com|Paddle\.Checkout|@paddle\/)/i],
  ["Square Web Payments", /(?:web\.squarecdn\.com\/v1\/square\.js|Square\.payments\s*\(|@square\/web-payments-sdk)/i],
  ["Adyen Checkout", /(?:checkoutshopper-[^"']+\.adyen\.com|@adyen\/adyen-web|new\s+AdyenCheckout)/i],
  ["Braintree client", /(?:js\.braintreegateway\.com|braintree\.client\.create\s*\()/i],
  ["Checkout endpoint", /(?:createCheckoutSession|\/api\/(?:create-)?checkout(?:\/|["'?#]))/i],
];

const findings = [];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const [label, pattern] of paymentSourceSignals) {
    if (pattern.test(content)) findings.push(`${label}: ${path.relative(root, file)}`);
  }
}
for (const packageName of packageNames) {
  if (providerPackagePattern.test(packageName)) findings.push(`Payment package dependency: ${packageName}`);
}

if (!manifest.payments_enabled) {
  assert.equal(
    findings.length,
    0,
    `Payment technology detected while payments_enabled=false. Review #319 requirements and approve the payment manifest before launch:\n${findings.join("\n")}`,
  );
  assert.equal(manifest.processor, null, "Processor must remain null while website payments are disabled.");
  assert.equal(manifest.recurring_billing_enabled, false, "Recurring billing cannot be enabled while website payments are disabled.");
  assert.deepEqual(manifest.approved_offers, [], "No paid offer may be represented as approved while website payments are disabled.");
  console.log("Payment compliance gate passed: no live payment integration detected; checkout remains release-blocked.");
  process.exit(0);
}

assert.ok(findings.length > 0, "payments_enabled=true requires an actual reviewed payment integration in production source or dependencies.");
assert.equal(typeof manifest.processor, "string", "Enabled payments require an identified processor.");
assert.ok(manifest.processor.trim().length > 0, "Enabled payments require a non-empty processor.");
assert.ok(manifest.approved_offers.length > 0, "Enabled payments require at least one approved offer.");
assert.equal(typeof manifest.terms_route, "string", "Enabled payments require a customer-facing Terms route.");
assert.ok(manifest.terms_route.startsWith("/"), "Terms route must be an internal public route.");
assert.equal(typeof manifest.legal_reviewed_at, "string", "Enabled payments require a legal-review date.");
assert.equal(typeof manifest.review_owner, "string", "Enabled payments require a review owner.");

for (const [index, offer] of manifest.approved_offers.entries()) {
  for (const field of ["id", "contracting_entity", "product_or_service", "pricing_model", "price_disclosure", "delivery_conditions"]) {
    assert.equal(typeof offer[field], "string", `Approved offer ${index + 1} must include ${field}.`);
    assert.ok(offer[field].trim().length > 0, `Approved offer ${index + 1} must include a non-empty ${field}.`);
  }
  assert.equal(typeof offer.recurring, "boolean", `Approved offer ${index + 1} must declare recurring.`);
}

if (manifest.recurring_billing_enabled || manifest.approved_offers.some((offer) => offer.recurring === true)) {
  assert.equal(manifest.recurring_billing_enabled, true, "Recurring offers require recurring_billing_enabled=true.");
  assert.equal(typeof manifest.refund_cancellation_route, "string", "Recurring billing requires a public refund/cancellation route.");
  assert.ok(manifest.refund_cancellation_route.startsWith("/"), "Refund/cancellation route must be an internal public route.");
  assert.equal(typeof manifest.consent_mechanism, "string", "Recurring billing requires an explicit consent mechanism description.");
  assert.ok(manifest.consent_mechanism.trim().length > 0, "Recurring billing consent mechanism cannot be empty.");
}

console.log(`Payment compliance gate passed: ${manifest.approved_offers.length} approved offer(s), processor=${manifest.processor}.`);
