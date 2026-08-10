import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layout = fs.readFileSync(path.join(root, "src/layouts/BaseLayout.astro"), "utf8");
const consent = fs.readFileSync(path.join(root, "src/components/TrackingConsent.astro"), "utf8");
const analytics = fs.readFileSync(path.join(root, "src/lib/analytics.ts"), "utf8");
const vendorRegistry = JSON.parse(fs.readFileSync(path.join(root, "docs/compliance/vendor-registry.json"), "utf8"));
const vendorsById = new Map(vendorRegistry.vendors.map((vendor) => [vendor.id, vendor]));

const measurementId = "G-RY26321PVW";
const loaderPattern = new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=`, "g");
const measurementPattern = new RegExp(measurementId.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
const gtmContainerPattern = /GTM-[A-Z0-9]+/g;
const metaPixelPattern = /(?:connect\.facebook\.net|facebook\.com\/tr|\bfbq\s*\()/gi;
const googleAdsPattern = /(?:AW-[0-9]+|googleadservices\.com|doubleclick\.net)/gi;

const ga4Vendor = vendorsById.get("google-analytics-4");
assert.ok(ga4Vendor, "GA4 must have an explicit vendor registry record.");
assert.equal(ga4Vendor.status, "approved_analytics_only", "GA4 must remain approved for analytics only.");
assert.equal(ga4Vendor.measurement_id, measurementId, "Vendor registry GA4 measurement ID must match the approved source ID.");
assert.equal(ga4Vendor.default_state, "denied", "GA4 vendor registry default state must remain denied.");
assert.equal(ga4Vendor.advertising_use, false, "GA4 registry must not imply advertising approval.");
assert.equal(ga4Vendor.private_form_fields_allowed, false, "Private form fields must not be approved for GA4 delivery.");

for (const blockedId of ["meta-pixel", "google-ads", "google-tag-manager-advertising"]) {
  const vendor = vendorsById.get(blockedId);
  assert.ok(vendor, `${blockedId} must have an explicit vendor registry record.`);
  assert.equal(vendor.status, "blocked_pending_review", `${blockedId} must remain blocked pending review.`);
  assert.equal(vendor.default_state, "denied", `${blockedId} must default to denied.`);
  assert.equal(vendor.private_form_fields_allowed, false, `${blockedId} must not receive private form fields.`);
}

assert.equal((layout.match(loaderPattern) ?? []).length, 0, "BaseLayout must not load GA4 before the consent component decides.");
assert.match(layout, /<TrackingConsent\s*\/>/, "BaseLayout must render the tracking consent control site-wide.");
assert.equal((consent.match(loaderPattern) ?? []).length, 1, "Exactly one consent-gated GA4 loader must exist.");
assert.ok((consent.match(measurementPattern) ?? []).length >= 1, "The approved GA4 measurement ID must remain explicit.");
assert.match(consent, /hermes-analytics-consent/, "Analytics consent choice must be persisted under the approved first-party key.");
assert.match(consent, /analytics_storage:\s*'denied'/, "Analytics storage must default to denied before consent.");
assert.match(consent, /analytics_storage:\s*'granted'/, "Analytics storage may be granted only after the user accepts analytics.");
assert.match(consent, /ad_storage:\s*'denied'/, "Advertising storage must remain denied.");
assert.match(consent, /ad_user_data:\s*'denied'/, "Advertising user data must remain denied.");
assert.match(consent, /ad_personalization:\s*'denied'/, "Advertising personalization must remain denied.");
assert.match(analytics, /localStorage\.getItem\(ANALYTICS_CONSENT_KEY\)\s*===\s*"granted"/, "Micro-conversion delivery to dataLayer must require granted analytics consent.");

const sourceFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(astro|ts|js|mjs)$/i.test(entry.name)) sourceFiles.push(absolute);
  }
};
walk(path.join(root, "src"));

let loaderCount = 0;
let gtmCount = 0;
let metaPixelCount = 0;
let googleAdsCount = 0;
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  loaderCount += (content.match(loaderPattern) ?? []).length;
  gtmCount += (content.match(gtmContainerPattern) ?? []).length;
  metaPixelCount += (content.match(metaPixelPattern) ?? []).length;
  googleAdsCount += (content.match(googleAdsPattern) ?? []).length;
}

assert.equal(loaderCount, 1, "The source tree must contain exactly one GA4 loader path.");
assert.equal(gtmCount, 0, "Do not add a parallel GTM container while its registry status is blocked_pending_review.");
assert.equal(metaPixelCount, 0, "Do not add Meta Pixel while its registry status is blocked_pending_review.");
assert.equal(googleAdsCount, 0, "Do not add Google Ads conversion/remarketing tags while their registry status is blocked_pending_review.");

console.log("Analytics/vendor consent contract passed: GA4 analytics-only registration, one consent-gated loader, advertising vendors blocked.");
