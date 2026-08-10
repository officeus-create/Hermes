import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layoutPath = path.join(root, "src/layouts/BaseLayout.astro");
const consentPath = path.join(root, "src/components/PrivacyConsent.astro");
const layout = fs.readFileSync(layoutPath, "utf8");
const consent = fs.readFileSync(consentPath, "utf8");

const measurementId = "G-RY26321PVW";
const loaderPattern = new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=\\$\\{MEASUREMENT_ID\\}|https://www\\.googletagmanager\\.com/gtag/js\\?id=${measurementId}`, "g");
const configPattern = new RegExp(`(?:window\\.)?gtag\\(['\"]config['\"],\\s*(?:MEASUREMENT_ID|['\"]${measurementId}['\"])\\)`, "g");
const gtmContainerPattern = /GTM-[A-Z0-9]+/g;

assert.equal((layout.match(/googletagmanager\.com\/gtag\/js/g) ?? []).length, 0, "BaseLayout must not statically load GA4 before privacy choice.");
assert.equal((layout.match(/google-analytics\.com/g) ?? []).length, 0, "BaseLayout must not preconnect to analytics before privacy choice.");
assert.match(layout, /<PrivacyConsent\s*\/>/, "BaseLayout must render the privacy consent controller.");

assert.equal((consent.match(loaderPattern) ?? []).length, 1, "PrivacyConsent must own exactly one dynamic GA4 loader.");
assert.equal((consent.match(configPattern) ?? []).length, 1, "PrivacyConsent must initialize GA4 exactly once after consent.");
assert.match(consent, /hermes-privacy-consent-v1/, "Consent preference must use the versioned Hermes privacy key.");
assert.match(consent, /data-privacy-accept/, "Analytics acceptance control is required.");
assert.match(consent, /data-privacy-necessary/, "Necessary-only control is required.");
assert.match(consent, /data-privacy-settings-open/, "Privacy settings must remain reopenable.");
assert.equal((consent.match(gtmContainerPattern) ?? []).length, 0, "Do not add a parallel GTM container before explicit approval.");

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
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  loaderCount += (content.match(loaderPattern) ?? []).length;
}

assert.equal(loaderCount, 1, "The source tree must contain only one GA4 loader and it must be consent-gated.");

console.log("Analytics tag contract passed: GA4 is single-installation and consent-gated, with no parallel GTM container.");
