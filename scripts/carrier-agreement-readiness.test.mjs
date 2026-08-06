import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pageSource, readiness, offerSource, signSource] = await Promise.all([
  readFile(new URL("../src/pages/logistics/carrier-agreement/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_AGREEMENT_EXECUTION_READINESS.md", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/carrier-offer/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/sign/index.astro", import.meta.url), "utf8"),
]);

for (const requiredPageContract of [
  'robots="noindex,nofollow"',
  "Review draft — not the final execution version",
  "PUBLIC_CARRIER_ESIGN_URL",
  "data-agreement-version",
  "PDF SHA-256",
  "Sensitive data stays separate",
  "You approve every load",
  "Freight funds go to your company",
  "No guaranteed results or hidden exclusivity",
  "Continue to carrier packet",
]) {
  assert.ok(pageSource.includes(requiredPageContract), `Carrier agreement review page is missing: ${requiredPageContract}`);
}

assert.match(pageSource, /legacy draft contains a 5\.00% rate/i, "The review page must continue to identify the actual legacy draft fee");
assert.doesNotMatch(
  pageSource,
  /<strong>\s*(?:8|8\.00)% service fee/i,
  "The review page must not present the intended 8% target as an approved execution term",
);
assert.ok(pageSource.indexOf("Clear responsibilities") < pageSource.indexOf("Review draft — not the final execution version"));

for (const requiredSignContract of [
  'const shortUrl = "https://hermeslogisticsus.com/sign/"',
  "Everything is clear before you sign.",
  "No exclusivity required here",
  "You approve every load",
  "Freight payments stay with your company",
  "Continue to carrier packet",
  "Review the agreement first",
  "Ask a question",
  "Copy SMS message",
  "Open SMS",
]) {
  assert.ok(signSource.includes(requiredSignContract), `SMS-friendly signing page is missing: ${requiredSignContract}`);
}
assert.doesNotMatch(signSource, /limited time|act now|only \d+ spots|expires today/i);
assert.doesNotMatch(signSource, /guaranteed (?:load|rate|revenue|income)/i);

for (const requiredOfferContract of [
  'robots="noindex,nofollow"',
  'data-primary-choice="agreement"',
  'data-primary-choice="learn"',
  'href="#learn-more"',
  'const agreementPath = "/logistics/carrier-agreement/"',
  "Essential Dispatch",
  "Hermes Pro",
  "Custom Cooperation",
  "6%",
  "8%",
  "You approve every load",
  "A custom proposal is non-binding",
  "No load, rate, mileage, revenue, customer relationship, or business outcome is guaranteed",
]) {
  assert.ok(offerSource.includes(requiredOfferContract), `Carrier sales handoff is missing: ${requiredOfferContract}`);
}

assert.equal(
  (offerSource.match(/data-primary-choice=/g) ?? []).length,
  2,
  "The first carrier-offer decision must remain limited to exactly two primary choices",
);
assert.doesNotMatch(offerSource, /<form\b/i, "The first carrier-offer release must not collect data before the carrier chooses a path");
assert.doesNotMatch(
  offerSource,
  /(?:carrier|driver)[_-]?(?:name|email|phone|mc|usdot)=/i,
  "The private sales URL must not be designed to carry carrier PII in query parameters",
);
assert.doesNotMatch(offerSource, /\$\s?(?:800|1,600|1600)/, "The carrier offer must not publish an unsupported weekly gain claim");

for (const requiredReadinessContract of [
  "operating email and/or mobile number",
  "at least one of signer email or verified signer mobile is present",
  "never reuse a signer URL between carriers",
  "document_version",
  "document_sha256",
  "PRODUCTION SIGNING NOT ACTIVATED",
  "Wisconsin transportation counsel",
  "Preview environments are proven unable to access production signature bindings",
]) {
  assert.ok(readiness.includes(requiredReadinessContract), `Execution readiness contract is missing: ${requiredReadinessContract}`);
}

for (const prohibitedPublicSecret of ["sk_live_", "api_key=", "access_token=", "private_key="]) {
  assert.ok(!readiness.toLowerCase().includes(prohibitedPublicSecret), `Readiness document contains a secret-like value: ${prohibitedPublicSecret}`);
}

console.log("Carrier offer, signing entry, and agreement execution-readiness contracts passed.");
