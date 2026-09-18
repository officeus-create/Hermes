import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const proof = await readFile(new URL("./repair-p0-production-proof-v2.mjs", import.meta.url), "utf8");

assert.match(proof, /git\/ref\/heads\/main/, "proof must refuse stale non-main revisions");
assert.match(proof, /check-runs\?per_page=100/, "proof must read the exact current-main Cloudflare check");
assert.match(proof, /Cloudflare Pages/, "proof must require successful Cloudflare Pages deployment");
assert.match(proof, /connect\.hermeslogisticsus\.com/, "proof must verify the Connect production host is reachable");
assert.match(proof, /SERVICE_NAMES = \["P0 Brake Inspection", "P0 Oil Service", "P0 Diagnostic Scan"\]/, "proof must create exactly three named synthetic services");
assert.match(proof, /services\.length !== 3/, "proof must assert the three-service count");
assert.match(proof, /#service-select option/, "proof must read all three services back through the public booking UI");
assert.match(proof, /item\.value === service\.id/, "proof must match each Booking option to the persisted service id");
assert.match(proof, /option\.label\.includes\(service\.name\)/, "proof must accept the current Booking label while preserving the service name");
assert.doesNotMatch(proof, /bookingServiceNames\.includes\(name\)/, "proof must not require an exact Booking option label");
assert.match(proof, /status: "in_progress"/, "proof must exercise owner processing");
assert.match(proof, /status: "completed"/, "proof must persist a completed visit");
assert.match(proof, /\/api\/repair-shop\/customers/, "proof must verify customer and vehicle CRM aggregation");
assert.match(proof, /viewport: \{ width: 390, height: 844 \}/, "proof must exercise authenticated 390px owner flow");
assert.match(proof, /\/api\/repair-shop\/feedback/, "proof must submit and read back private feedback");
assert.match(proof, /cleanup-booking-smoke/, "proof must use the bounded synthetic cleanup path");
assert.match(proof, /finally \{[\s\S]*await cleanup\(\)/, "proof must clean synthetic state even after a failure");
assert.match(proof, /ACTIONS_ID_TOKEN_REQUEST_URL/, "proof must mint the bounded GitHub Actions OIDC booking proof from the runner endpoint");
assert.match(proof, /ACTIONS_ID_TOKEN_REQUEST_TOKEN/, "proof must use the short-lived GitHub Actions OIDC request token");
assert.match(proof, /Authorization:\s*`bearer \$\{requestToken\}`/, "proof may authorize only the GitHub Actions OIDC mint request");
assert.equal((proof.match(/Authorization\s*:/g) || []).length, 1, "proof must contain exactly one Authorization header: the OIDC runtime mint");
assert.doesNotMatch(proof, /GITHUB_TOKEN|CLOUDFLARE_[A-Z_]*TOKEN/, "proof must not require repository or Cloudflare API tokens");

console.log("REPAIR_P0_PRODUCTION_PROOF_V2_CONTRACT=PASS");
