import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pageSource, readiness] = await Promise.all([
  readFile(new URL("../src/pages/logistics/carrier-agreement/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_AGREEMENT_EXECUTION_READINESS.md", import.meta.url), "utf8"),
]);

for (const requiredPageContract of [
  'robots="noindex,nofollow"',
  "Draft for attorney review",
  "PUBLIC_CARRIER_ESIGN_URL",
  "data-agreement-version",
  "PDF SHA-256",
  "No passwords in the agreement",
]) {
  assert.ok(pageSource.includes(requiredPageContract), `Carrier agreement review page is missing: ${requiredPageContract}`);
}

assert.match(pageSource, /5\.00% fee/, "The current review page must continue to identify the actual draft fee");
assert.doesNotMatch(
  pageSource,
  /<strong>\s*(?:8|8\.00)% service fee/i,
  "The public review page must not present the intended 8% target before an approved execution asset exists",
);

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

for (const prohibitedPublicSecret of [
  "sk_live_",
  "api_key=",
  "access_token=",
  "private_key=",
]) {
  assert.ok(!readiness.toLowerCase().includes(prohibitedPublicSecret), `Readiness document contains a secret-like value: ${prohibitedPublicSecret}`);
}

console.log("Carrier agreement execution-readiness contract passed.");
