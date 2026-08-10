import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "docs/compliance/vendor-registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

assert.equal(registry.schema_version, 1, "Vendor registry schema version must remain explicit.");
assert.ok(Array.isArray(registry.vendors) && registry.vendors.length > 0, "Vendor registry must contain reviewed vendor records.");

const byId = new Map(registry.vendors.map((vendor) => [vendor.id, vendor]));
const ga4 = byId.get("google-analytics-4");
assert.ok(ga4, "GA4 must have an explicit vendor registry record.");
assert.equal(ga4.status, "approved_analytics_only", "GA4 may be approved only for analytics in the current baseline.");
assert.equal(ga4.measurement_id, "G-RY26321PVW", "GA4 registry measurement ID must match the approved property.");
assert.equal(ga4.default_state, "denied", "GA4 default consent state must remain denied.");
assert.equal(ga4.advertising_use, false, "GA4 registry must not imply advertising approval.");
assert.equal(ga4.private_form_fields_allowed, false, "Private form fields must never be approved for analytics delivery.");

for (const id of ["meta-pixel", "google-ads", "google-tag-manager-advertising"]) {
  const record = byId.get(id);
  assert.ok(record, `${id} must have an explicit blocked registry record.`);
  assert.equal(record.status, "blocked_pending_review", `${id} must remain blocked until a separate review is completed.`);
  assert.equal(record.default_state, "denied", `${id} must default to denied.`);
  assert.equal(record.private_form_fields_allowed, false, `${id} must never receive private form fields under the current gate.`);
}

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(astro|html|js|mjs|ts|tsx|jsx)$/i.test(entry.name)) files.push(absolute);
  }
};
walk(path.join(root, "src"));

const signatures = [
  { id: "meta-pixel", pattern: /(?:connect\.facebook\.net|facebook\.com\/tr|\bfbq\s*\()/i },
  { id: "google-tag-manager-advertising", pattern: /GTM-[A-Z0-9]+/i },
  { id: "google-ads", pattern: /(?:AW-[0-9]+|googleadservices\.com|doubleclick\.net)/i },
];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const signature of signatures) {
    const record = byId.get(signature.id);
    if (signature.pattern.test(content)) {
      assert.notEqual(
        record?.status,
        "blocked_pending_review",
        `${path.relative(root, file)} activates ${signature.id}, but its vendor registry status is still blocked_pending_review.`
      );
    }
  }
}

const approvedMeasurementId = ga4.measurement_id;
const ga4Occurrences = files.reduce((count, file) => {
  const content = fs.readFileSync(file, "utf8");
  return count + (content.match(new RegExp(approvedMeasurementId, "g")) ?? []).length;
}, 0);
assert.ok(ga4Occurrences >= 1, "Approved GA4 measurement ID must remain present in source while GA4 is enabled.");

console.log("Vendor compliance gate passed: GA4 analytics-only baseline registered; Meta Pixel, Google Ads, and advertising GTM remain blocked.");
